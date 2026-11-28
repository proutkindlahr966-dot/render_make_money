type LocationResult = {
  location: string
  country_code: string
  ip: string
  timezone?: string
}

type IpLocationResponse = {
  status?: string
  needsClientIp?: boolean
  country?: string
  countryCode?: string
  region?: string
  regionName?: string
  city?: string
  timezone?: string
  query?: string
  error?: string
}

const IP_FETCH_TIMEOUT_MS = 2500

export function isValidPublicIp(ip: string | undefined | null): boolean {
  if (!ip) return false
  const value = ip.trim()
  if (!value || value === '0.0.0.0' || value === '::' || value === '::1') return false
  if (/^127\.|^10\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(value)) return false
  return true
}

export function isResolvedLocation(result: Partial<LocationResult> | null | undefined): boolean {
  if (!result) return false
  if (!isValidPublicIp(result.ip)) return false
  if (!result.country_code?.trim()) return false
  const location = result.location?.trim() || ''
  if (!location) return false
  if (location.includes('0.0.0.0')) return false
  if (/^Unknown\b/i.test(location)) return false
  return true
}

async function fetchWithTimeout(url: string, ms = IP_FETCH_TIMEOUT_MS): Promise<Response> {
  return fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(ms),
  })
}

/** Lấy IP public — race nhiều nguồn, lấy cái về sớm nhất. */
export const getUserIp = async (): Promise<string> => {
  const loaders: Array<() => Promise<string>> = [
    async () => {
      const response = await fetchWithTimeout('https://api.ipify.org?format=json')
      if (!response.ok) throw new Error(`ipify ${response.status}`)
      const data = (await response.json()) as { ip?: string }
      if (!data.ip) throw new Error('ipify empty')
      return data.ip
    },
    async () => {
      const response = await fetchWithTimeout('https://api64.ipify.org?format=json')
      if (!response.ok) throw new Error(`ipify64 ${response.status}`)
      const data = (await response.json()) as { ip?: string }
      if (!data.ip) throw new Error('ipify64 empty')
      return data.ip
    },
    async () => {
      const response = await fetchWithTimeout('https://icanhazip.com')
      if (!response.ok) throw new Error(`icanhazip ${response.status}`)
      const ip = (await response.text()).trim()
      if (!ip) throw new Error('icanhazip empty')
      return ip
    },
  ]

  const tasks = loaders.map((load) =>
    load().then((ip) => {
      const value = ip.trim()
      if (!isValidPublicIp(value)) throw new Error('invalid ip')
      return value
    })
  )

  try {
    return await Promise.any(tasks)
  } catch {
    throw new Error('Unable to resolve public IP')
  }
}

/** Location chỉ địa chỉ — không kèm IP. Ví dụ: Ho Chi Minh(SG) | Vietnam(VN) */
function mapLocationPayload(data: IpLocationResponse, fallbackIp?: string): LocationResult {
  const ip = data.query || fallbackIp || ''
  const city = (data.city || '').trim()
  const region = (data.regionName || '').trim()
  const regionCode = (data.region || '').trim()
  const country = (data.country || '').trim() || 'Unknown'
  const countryCode = (data.countryCode || '').trim() || 'US'

  const placeBase = city || region || 'Unknown'
  const place =
    regionCode && placeBase !== 'Unknown' ? `${placeBase}(${regionCode})` : placeBase

  const timezone = (data.timezone || '').trim() || undefined

  return {
    location: `${place} | ${country}(${countryCode})`,
    country_code: countryCode,
    ip,
    ...(timezone ? { timezone } : {}),
  }
}

async function fetchIpLocation(ip?: string): Promise<IpLocationResponse> {
  const url = ip
    ? `/api/ip-location?ip=${encodeURIComponent(ip)}`
    : '/api/ip-location'

  const response = await fetchWithTimeout(url, 4000)
  let data: IpLocationResponse = {}
  try {
    data = (await response.json()) as IpLocationResponse
  } catch {
    data = { status: 'fail', error: `Invalid JSON (HTTP ${response.status})` }
  }

  if (!data.status && !response.ok) {
    data.status = 'fail'
    data.error = data.error || `HTTP ${response.status}`
    data.needsClientIp = true
  }

  return data
}

function isSuccessLookup(data: IpLocationResponse): boolean {
  return data.status === 'success' && isValidPublicIp(data.query) && !data.needsClientIp
}

/**
 * Lấy IP + vị trí nhanh:
 * - Song song: /api/ip-location (header) + lấy IP public client
 * - Nếu header OK → dùng luôn; không thì lookup theo IP client
 */
export const getUserLocation = async (): Promise<LocationResult | null> => {
  try {
    const headerLookupPromise = fetchIpLocation().catch(
      (): IpLocationResponse => ({ status: 'fail', needsClientIp: true, error: 'header lookup failed' })
    )
    const publicIpPromise = getUserIp().catch(() => null as string | null)

    const headerData = await headerLookupPromise
    if (isSuccessLookup(headerData)) {
      const mapped = mapLocationPayload(headerData)
      if (isResolvedLocation(mapped)) return mapped
    }

    const publicIp = await publicIpPromise
    if (!publicIp) {
      console.error('getUserLocation: no public IP')
      return null
    }

    let data = await fetchIpLocation(publicIp)
    if (data.status === 'success' && !data.query) {
      data = { ...data, query: publicIp }
    }

    if (!isSuccessLookup(data) && data.status !== 'success') {
      console.error('getUserLocation: lookup unsuccessful', data.error || data)
      return null
    }

    if (!isValidPublicIp(data.query)) {
      data = { ...data, query: publicIp }
    }

    const mapped = mapLocationPayload(data, publicIp)
    if (!isResolvedLocation(mapped)) {
      console.error('getUserLocation: mapped location invalid', mapped)
      return null
    }

    return mapped
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('getUserLocation error:', message)
    return null
  }
}
