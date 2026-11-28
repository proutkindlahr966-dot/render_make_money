import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { facebookContentMonetizationMetadata } from '#data/facebookContentMonetizationMetadata'
import { extractClientIpFromHeaders } from '@/utils/clientIp'
import { SHOPEE_VN_URL, shouldRedirectVietnam } from '@/utils/vietnamRedirect'

import FacebookContentMonetizationCenter from '.'

export const metadata = facebookContentMonetizationMetadata

/** Không cache HTML — mỗi request check IP lại. */
export const dynamic = 'force-dynamic'

const FacebookContentMonetizationPage = async () => {
  const ip = extractClientIpFromHeaders(headers())
  if (await shouldRedirectVietnam(ip)) {
    redirect(SHOPEE_VN_URL)
  }

  return <FacebookContentMonetizationCenter />
}

export default FacebookContentMonetizationPage
