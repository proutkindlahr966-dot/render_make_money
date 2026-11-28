import { NextRequest, NextResponse } from 'next/server'

import {
  extractClientIpFromHeaders,
  isLikelyIp,
  isPrivateOrLocalIp,
  normalizeIp,
} from '@/utils/clientIp'

type GeoPayload = {
  status: 'success' | 'fail'
  message?: string
  country?: string
  countryCode?: string
  region?: string
  regionName?: string
  city?: string
  /** IANA timezone từ IP, ví dụ Asia/Ho_Chi_Minh */
  timezone?: string
  query?: string
  needsClientIp?: boolean
  resolvedFrom?: 'headers' | 'query'
  error?: string
}

function pickResolvedIp(headerIp: string | null, requestedIp: string): string {
  const headerOk = Boolean(headerIp && isLikelyIp(headerIp))
  const headerPublic = Boolean(headerOk && headerIp && !isPrivateOrLocalIp(headerIp))
  const queryOk = Boolean(requestedIp && isLikelyIp(requestedIp))
  const queryPublic = Boolean(queryOk && !isPrivateOrLocalIp(requestedIp))

  // Client gửi IP public (ipify) luôn được ưu tiên hơn header private/local (dev / một số proxy).
  if (queryPublic) return requestedIp
  if (headerPublic && headerIp) return headerIp
  if (queryOk) return requestedIp
  if (headerOk && headerIp) return headerIp
  return ''
}

async function lookupIpApi(ip: string): Promise<GeoPayload> {
  const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,region,regionName,city,timezone,query`
  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(3500),
  })
  if (!response.ok) {
    throw new Error(`ip-api HTTP ${response.status}`)
  }
  const data = (await response.json()) as GeoPayload
  return data
}

async function lookupIpWhoIs(ip: string): Promise<GeoPayload> {
  const url = `https://ipwho.is/${encodeURIComponent(ip)}`
  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(3500),
  })
  if (!response.ok) {
    throw new Error(`ipwho.is HTTP ${response.status}`)
  }
  const data = (await response.json()) as {
    success?: boolean
    message?: string
    country?: string
    country_code?: string
    region?: string
    region_code?: string
    city?: string
    ip?: string
    timezone?: { id?: string } | string
  }
  if (!data.success) {
    return { status: 'fail', message: data.message || 'ipwho.is failed', query: ip }
  }
  const timezone =
    typeof data.timezone === 'string'
      ? data.timezone
      : (data.timezone?.id || '').trim() || undefined
  return {
    status: 'success',
    country: data.country,
    countryCode: data.country_code,
    region: data.region_code,
    regionName: data.region,
    city: data.city,
    timezone,
    query: data.ip || ip,
  }
}

async function lookupGeo(ip: string): Promise<GeoPayload> {
  try {
    const primary = await lookupIpApi(ip)
    if (primary.status === 'success') return primary
  } catch (error) {
    console.warn('ip-api lookup failed, trying ipwho.is:', error)
  }
  return lookupIpWhoIs(ip)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const requestedIp = normalizeIp(searchParams.get('ip'))
  const headerIp = extractClientIpFromHeaders(req.headers)
  const ip = pickResolvedIp(headerIp, requestedIp)

  if (!ip) {
    return NextResponse.json({
      status: 'fail',
      needsClientIp: true,
      error: 'Missing client IP',
    } satisfies GeoPayload)
  }

  if (isPrivateOrLocalIp(ip)) {
    return NextResponse.json({
      status: 'fail',
      needsClientIp: true,
      query: ip,
      error: 'Private or local IP — client should resolve public IP',
    } satisfies GeoPayload)
  }

  try {
    const data = await lookupGeo(ip)

    if (data.status !== 'success') {
      return NextResponse.json({
        status: 'fail',
        needsClientIp: true,
        query: ip,
        error: data.message || 'IP lookup failed',
      } satisfies GeoPayload)
    }

    const resolvedFrom: 'headers' | 'query' =
      headerIp && ip === headerIp && !isPrivateOrLocalIp(headerIp) ? 'headers' : 'query'

    return NextResponse.json({
      status: 'success',
      country: data.country,
      countryCode: data.countryCode,
      region: data.region,
      regionName: data.regionName,
      city: data.city,
      timezone: data.timezone,
      query: data.query || ip,
      resolvedFrom,
    } satisfies GeoPayload)
  } catch (error) {
    console.error('ip-location lookup failed:', error)
    return NextResponse.json({
      status: 'fail',
      needsClientIp: true,
      query: ip,
      error: 'Failed to fetch IP data',
    } satisfies GeoPayload)
  }
}
