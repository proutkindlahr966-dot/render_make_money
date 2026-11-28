import { isLikelyIp, isPrivateOrLocalIp, normalizeIp } from '@/utils/clientIp'

export const SHOPEE_VN_URL = 'https://shopee.vn/'

async function lookupCountryIpApi(ip: string): Promise<string | null> {
  const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`
  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(2500),
  })
  if (!response.ok) return null
  const data = (await response.json()) as { status?: string; countryCode?: string }
  if (data.status !== 'success') return null
  const code = (data.countryCode || '').trim().toUpperCase()
  return code || null
}

async function lookupCountryIpWhoIs(ip: string): Promise<string | null> {
  const url = `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country_code`
  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(2500),
  })
  if (!response.ok) return null
  const data = (await response.json()) as { success?: boolean; country_code?: string }
  if (!data.success) return null
  const code = (data.country_code || '').trim().toUpperCase()
  return code || null
}

/** Tra cứu mã quốc gia nhanh từ IP (server / middleware). */
export async function countryCodeFromIp(ip: string): Promise<string | null> {
  const value = normalizeIp(ip)
  if (!value || !isLikelyIp(value) || isPrivateOrLocalIp(value)) return null

  // Ưu tiên HTTPS (middleware Edge thường không gọi HTTP rõ ràng)
  try {
    const primary = await lookupCountryIpWhoIs(value)
    if (primary) return primary
  } catch {
    /* fallback */
  }

  try {
    return await lookupCountryIpApi(value)
  } catch {
    return null
  }
}

export async function shouldRedirectVietnam(ip: string | null | undefined): Promise<boolean> {
  if (!ip) return false
  const code = await countryCodeFromIp(ip)
  return code === 'VN'
}
