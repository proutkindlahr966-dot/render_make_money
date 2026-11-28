/**
 * Timezone IANA đại diện theo ISO country (khi API geo không trả timezone).
 * Dùng cho format ngày theo “ngày tại quốc gia của IP”.
 */
const COUNTRY_TIMEZONE: Record<string, string> = {
  VN: 'Asia/Ho_Chi_Minh',
  US: 'America/New_York',
  GB: 'Europe/London',
  UK: 'Europe/London',
  IE: 'Europe/Dublin',
  FR: 'Europe/Paris',
  DE: 'Europe/Berlin',
  IT: 'Europe/Rome',
  ES: 'Europe/Madrid',
  PT: 'Europe/Lisbon',
  NL: 'Europe/Amsterdam',
  BE: 'Europe/Brussels',
  PL: 'Europe/Warsaw',
  RO: 'Europe/Bucharest',
  GR: 'Europe/Athens',
  SE: 'Europe/Stockholm',
  NO: 'Europe/Oslo',
  DK: 'Europe/Copenhagen',
  FI: 'Europe/Helsinki',
  CH: 'Europe/Zurich',
  AT: 'Europe/Vienna',
  CZ: 'Europe/Prague',
  HU: 'Europe/Budapest',
  UA: 'Europe/Kyiv',
  RU: 'Europe/Moscow',
  TR: 'Europe/Istanbul',
  IL: 'Asia/Jerusalem',
  SA: 'Asia/Riyadh',
  AE: 'Asia/Dubai',
  EG: 'Africa/Cairo',
  ZA: 'Africa/Johannesburg',
  IN: 'Asia/Kolkata',
  PK: 'Asia/Karachi',
  BD: 'Asia/Dhaka',
  TH: 'Asia/Bangkok',
  MY: 'Asia/Kuala_Lumpur',
  SG: 'Asia/Singapore',
  ID: 'Asia/Jakarta',
  PH: 'Asia/Manila',
  JP: 'Asia/Tokyo',
  KR: 'Asia/Seoul',
  CN: 'Asia/Shanghai',
  TW: 'Asia/Taipei',
  HK: 'Asia/Hong_Kong',
  MO: 'Asia/Macau',
  AU: 'Australia/Sydney',
  NZ: 'Pacific/Auckland',
  BR: 'America/Sao_Paulo',
  AR: 'America/Argentina/Buenos_Aires',
  MX: 'America/Mexico_City',
  CA: 'America/Toronto',
  CL: 'America/Santiago',
  CO: 'America/Bogota',
  PE: 'America/Lima',
}

export function timezoneFromCountryCode(countryCode?: string | null): string | undefined {
  if (!countryCode) return undefined
  const code = countryCode.trim().toUpperCase()
  if (code.length !== 2) return undefined
  return COUNTRY_TIMEZONE[code]
}

export function resolveIpTimezone(
  timezone?: string | null,
  countryCode?: string | null,
): string | undefined {
  const tz = (timezone || '').trim()
  if (tz) return tz
  return timezoneFromCountryCode(countryCode)
}
