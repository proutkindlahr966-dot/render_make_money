'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { useAppSelector } from '@/app/store/hooks'
import PrivacyLanguagePicker from '#components/facebook-content-monetization/PrivacyLanguagePicker'
import { FBC_LANDING_MEDIA } from '#data/fbcLandingMedia'
import { LOCALE_BCP47 } from '@/i18n'
import { useAppStrings } from '@/hooks/useAppStrings'
import { resolveIpTimezone } from '@/utils/countryTimezone'

const FB_BLUE = '#0064e0'
/** Header 1 hàng: 56px trên điện thoại, 64px từ sm */
const HEADER_OFFSET_PT = 'pt-14 sm:pt-16'
const SCROLL_MT = 'scroll-mt-16 sm:scroll-mt-[76px]'

const navLinkClass =
    'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-[13px] font-medium text-[#1c1e21] transition-colors hover:bg-[#f0f2f5] hover:text-[#0064e0] sm:text-[14px]'

type FbcMarketingLandingProps = {
    onSubmitApplication: () => void
    children: React.ReactNode
}

function formatDateForIp(localeBcp47: string, timeZone?: string) {
    const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        ...(timeZone ? { timeZone } : {}),
    }
    try {
        return new Date().toLocaleDateString(localeBcp47, options)
    } catch {
        return new Date().toLocaleDateString(localeBcp47, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })
    }
}

function dateIsoForIp(timeZone?: string) {
    try {
        return new Date().toLocaleDateString('en-CA', timeZone ? { timeZone } : undefined)
    } catch {
        return new Date().toISOString().slice(0, 10)
    }
}

export default function FbcMarketingLanding({ onSubmitApplication, children }: FbcMarketingLandingProps) {
    const t = useAppStrings()
    const locale = useAppSelector((s) => s.locale.locale)
    const formData = useAppSelector((s) => s.stepForm.data)
    const ipTimeZone = React.useMemo(
        () => resolveIpTimezone(formData.timezone, formData.country_code),
        [formData.timezone, formData.country_code]
    )
    const currentDate = React.useMemo(
        () => formatDateForIp(LOCALE_BCP47[locale], ipTimeZone),
        [locale, ipTimeZone]
    )
    const dateIso = React.useMemo(() => dateIsoForIp(ipTimeZone), [ipTimeZone])

    const scrollToApply = () => {
        document.getElementById('fbcm-resources')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    const reelRef = React.useRef<HTMLVideoElement>(null)
    const [reelIndex, setReelIndex] = React.useState(0)
    const [reelPlaying, setReelPlaying] = React.useState(false)
    const reelCount = FBC_LANDING_MEDIA.creatorReels.length

    const showReel = (index: number) => {
        const next = (index + reelCount) % reelCount
        setReelIndex(next)
        setReelPlaying(false)
        const video = reelRef.current
        if (!video) return
        video.pause()
        video.currentTime = 0
    }

    const toggleReel = () => {
        const video = reelRef.current
        if (!video) return
        if (video.paused) {
            void video.play()
            return
        }
        video.pause()
    }

    const renderNavLinks = () => (
        <>
            <a href="#fbcm-hero" className={navLinkClass}>
                {t.main.landingNavWhatsNew}
            </a>
            <a href="#fbcm-resources" className={navLinkClass}>
                {t.main.landingNavGetStarted}
            </a>
            <a href="#fbcm-perks" className={navLinkClass}>
                {t.main.landingNavLearn}
            </a>
            <a href="#fbcm-best-ways" className={navLinkClass}>
                {t.main.landingNavCreators}
            </a>
            <a href="#fbcm-feedback" className={navLinkClass}>
                {t.main.landingNavFeedback}
            </a>
        </>
    )

    return (
        <div className="min-h-[100dvh] overflow-x-clip scroll-smooth bg-[#f6f7f9] text-[#1c1e21] antialiased">
            <header className="fixed inset-x-0 top-0 z-50 border-b border-[#dfe3e8] bg-white shadow-[0_1px_2px_rgba(15,20,30,0.05)]">
                <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center gap-1.5 px-3 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
                    <Link
                        href="/facebook-content-monetization#fbcm-hero"
                        className="flex shrink-0 items-center rounded-md p-1 transition hover:bg-[#f0f2f5]"
                        aria-label={t.common.facebook}
                    >
                        <Image src="/images/meta/logo.svg" alt="" className="h-8 w-8 sm:h-10 sm:w-10" width={40} height={40} />
                    </Link>

                    <nav className="hidden min-w-0 items-center gap-0.5 md:flex md:gap-1" aria-label={t.main.landingNavAria}>
                        {renderNavLinks()}
                    </nav>

                    <div className="ml-auto flex min-w-0 items-center gap-0.5 sm:gap-1">
                        <time
                            dateTime={dateIso}
                            className="mr-1 hidden shrink-0 whitespace-nowrap text-[11px] leading-none text-[#606770] lg:block"
                        >
                            <span className="text-[#6b7280]">{t.main.releaseDate}</span>{' '}
                            <span className="font-semibold tabular-nums text-[#111827]">{currentDate}</span>
                        </time>
                        <a
                            href="#fbcm-resources"
                            className="rounded-full p-2 text-[#0A1317] opacity-85 transition hover:bg-[#f0f2f5] hover:opacity-100 sm:p-2.5"
                            aria-label={t.info.title}
                        >
                            <Image src="/images/icons/ic_search.svg" alt="" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" width={22} height={22} />
                        </a>
                        <a
                            href="#fbcm-resources"
                            className="hidden rounded-full p-2.5 text-[#0A1317] opacity-85 transition hover:bg-[#f0f2f5] hover:opacity-100 sm:inline-flex"
                            aria-label={t.main.benefitsTitle}
                        >
                            <Image src="/images/icons/ic_locked.svg" alt="" className="h-[22px] w-[22px]" width={22} height={22} />
                        </a>
                        <PrivacyLanguagePicker variant="header" />
                    </div>
                </div>
            </header>

            <div className={HEADER_OFFSET_PT}>
                <section
                    id="fbcm-hero"
                    className={`border-b border-[#e8eaed] bg-[linear-gradient(180deg,#ffffff_0%,#f6f7f9_100%)] ${SCROLL_MT}`}
                >
                    <div className="mx-auto grid max-w-[1240px] gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)] lg:items-center lg:gap-6 lg:px-8 lg:py-16">
                        <div className="order-2 min-w-0 lg:order-1">
                            <div className="inline-block">
                                <p className="text-[12px] font-semibold tracking-[0.14em] text-[#8a8d91]">{t.main.landingKicker}</p>
                                <div className="mt-1 h-0.5 w-8 rounded-full" style={{ backgroundColor: FB_BLUE }} />
                            </div>
                            <h1
                                className="mt-4 text-[1.65rem] font-bold leading-[1.15] tracking-tight sm:mt-5 sm:text-[2.25rem] lg:text-[2.65rem]"
                                style={{ color: FB_BLUE }}
                            >
                                {t.main.landingHeadline}
                            </h1>
                            <p className="mt-4 max-w-[32rem] text-[16px] leading-relaxed text-[#3d4d66] sm:text-[17px]">
                                {t.main.landingSubhead}
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={onSubmitApplication}
                                    className="min-h-[48px] w-full rounded-full px-6 py-3 text-[15px] font-bold text-white shadow-[0_6px_18px_rgba(0,100,224,0.24)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:brightness-95 sm:min-h-[52px] sm:w-auto sm:px-11 sm:text-[16px]"
                                    style={{ backgroundColor: FB_BLUE, outlineColor: FB_BLUE }}
                                >
                                    {t.main.cta}
                                </button>
                            </div>
                        </div>

                        <div className="relative order-1 mx-auto aspect-[1498/845] w-full max-w-[680px] lg:order-2 lg:max-w-none lg:justify-self-end">
                            <Image
                                src={FBC_LANDING_MEDIA.heroCollage}
                                alt=""
                                fill
                                className="object-contain object-center drop-shadow-[0_10px_22px_rgba(15,20,30,0.10)]"
                                sizes="(max-width: 1024px) 92vw, 680px"
                                priority
                                unoptimized
                            />
                        </div>
                    </div>
                </section>

                <section className="bg-[#f6f7f9] pb-12 pt-8 sm:pb-16 sm:pt-10" aria-labelledby="fbcm-reel-title">
                    <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
                        <div className="mb-6 flex justify-center sm:mb-8">
                            <button
                                type="button"
                                onClick={scrollToApply}
                                className="inline-flex max-w-full items-center justify-center gap-2.5 px-2 text-center text-[15px] font-medium text-[#1c1e21] transition hover:opacity-80 sm:text-[16px]"
                            >
                                <span className="border-b border-current pb-px">{t.main.landingHowJoin}</span>
                                <span
                                    className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-[#0064e0] text-[#0064e0]"
                                    aria-hidden="true"
                                >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-2 sm:gap-6 lg:gap-10">
                            <button
                                type="button"
                                onClick={() => showReel(reelIndex - 1)}
                                aria-label={t.main.reelPrev}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#0064e0] bg-white text-[#0064e0] transition hover:bg-[#0064e0]/[0.06] sm:h-11 sm:w-11"
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                                    <path d="M11 4.5 6.5 9 11 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <div className="flex min-w-0 flex-1 flex-col items-center gap-8 lg:flex-row lg:justify-center lg:gap-14">
                                <button
                                    type="button"
                                    onClick={toggleReel}
                                    aria-label={reelPlaying ? t.main.reelPause : t.main.reelPlay}
                                    className="relative w-[min(58vw,220px)] shrink-0 overflow-hidden rounded-[18px] bg-black shadow-[0_18px_40px_rgba(15,20,30,0.16)] sm:w-[min(42vw,270px)]"
                                >
                                    <video
                                        key={FBC_LANDING_MEDIA.creatorReels[reelIndex]}
                                        ref={reelRef}
                                        className="aspect-[9/16] w-full object-cover"
                                        playsInline
                                        preload="metadata"
                                        src={FBC_LANDING_MEDIA.creatorReels[reelIndex]}
                                        onPlay={() => setReelPlaying(true)}
                                        onPause={() => setReelPlaying(false)}
                                        onEnded={() => setReelPlaying(false)}
                                    />
                                    {!reelPlaying && (
                                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-white">
                                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                                                    <path d="M8 6.5v9l8-4.5-8-4.5Z" fill="currentColor" />
                                                </svg>
                                            </span>
                                        </span>
                                    )}
                                </button>
                                <div className="w-full max-w-[34rem] text-center lg:max-w-[300px] lg:text-left">
                                    <h2
                                        id="fbcm-reel-title"
                                        className="text-[22px] font-semibold leading-snug tracking-tight text-[#1c1e21] sm:text-[28px]"
                                    >
                                        {t.main.landingReelTitle}
                                    </h2>
                                    <p className="mt-3 text-[15px] leading-relaxed text-[#65676B] sm:text-[16px]">
                                        {t.main.landingReelBody}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => showReel(reelIndex + 1)}
                                aria-label={t.main.reelNext}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#0064e0] bg-white text-[#0064e0] transition hover:bg-[#0064e0]/[0.06] sm:h-11 sm:w-11"
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                                    <path d="M7 4.5 11.5 9 7 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>

                {children}
            </div>
        </div>
    )
}
