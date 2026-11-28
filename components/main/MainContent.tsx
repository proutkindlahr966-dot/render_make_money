'use client'

import Image from 'next/image'
import React from 'react'

import { useAppStrings } from '@/hooks/useAppStrings'

/** Thang chữ nội dung chính — đồng bộ giữa các mục */
const sectionTitleClass =
    'text-[22px] font-semibold leading-snug tracking-tight text-[#1c1e21] sm:text-[28px]'
const sectionLeadClass = 'mt-3 max-w-[68ch] text-[15px] leading-relaxed text-[#65676B] sm:text-[16px]'
const cardTitleClass = 'mt-5 text-[18px] font-semibold leading-snug text-[#1c1e21] sm:text-[20px]'
const itemTitleClass = 'mt-3 text-[16px] font-semibold leading-snug text-[#1c1e21]'
const itemBodyClass = 'mt-2 text-[14px] leading-relaxed text-[#65676B] sm:text-[15px]'
const quoteClass = 'text-[15px] leading-relaxed text-[#1c1e21] sm:text-[16px]'
const practiceNavClass =
    'flex w-full items-start gap-3 rounded-md px-2 py-3 text-left text-[15px] font-medium leading-snug transition sm:px-3 sm:text-[16px]'
const practiceBodyClass =
    'border border-[#3b82f6] bg-white px-4 py-5 text-[15px] leading-relaxed text-[#1f2937] sm:px-10 sm:py-9 sm:text-[16px]'

const footerItemClass = 'block py-1 text-[13px] leading-snug text-[#65676B]'
const footerHeadingClass = 'mb-3 text-[13px] font-semibold tracking-wide text-[#1c1e21]'
const footerLegalClass = 'text-[12px] text-[#65676B]'

/** Vùng nội dung dưới hero — nền và đường phân tách nhẹ (padding ngang chỉ trên khối nội dung, footer full-bleed) */
const shell =
    'flex min-h-0 w-full flex-1 flex-col justify-start border-t border-[#e8eaed] bg-[#f4f5f7]/35 pb-[max(0px,env(safe-area-inset-bottom))] pt-8 sm:pt-10'

const contentPad =
    'mx-auto flex w-full min-w-0 max-w-[1080px] flex-col gap-5 px-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] sm:gap-7'

const anchorTarget = 'scroll-mt-16 sm:scroll-mt-[76px]'
const FB_BLUE = '#0064e0'

type MainContentProps = {
    onSubmitApplication?: () => void
}

const MainContent = ({ onSubmitApplication }: MainContentProps) => {
    const t = useAppStrings()
    const [activePractice, setActivePractice] = React.useState(0)

    const practiceItems = React.useMemo(() => [
        {
            label: t.main.practiceExperimentLabel,
            content: [
                t.main.practiceExperimentBody1,
                t.main.practiceExperimentBody2,
            ],
        },
        {
            label: t.main.practiceOriginalLabel,
            content: [
                t.main.practiceOriginalBody1,
                t.main.practiceOriginalBody2,
            ],
        },
        {
            label: t.main.practiceConversationLabel,
            content: [
                t.main.practiceConversationBody1,
                t.main.practiceConversationBody2,
            ],
        },
        {
            label: t.main.practiceMetricsLabel,
            content: [
                t.main.practiceMetricsBody1,
                t.main.practiceMetricsBody2,
            ],
        },
        {
            label: t.main.practiceFansLabel,
            content: [
                t.main.practiceFansBody1,
                t.main.practiceFansBody2,
            ],
        },
    ], [t.main])

    return (
        <main className={shell} aria-label={t.main.title}>
            <div className={contentPad}>
                <section id="fbcm-resources" className={`min-w-0 ${anchorTarget}`} aria-label={t.main.benefitsTitle}>
                    <div className="divide-y divide-[#dadde1]">
                        <div className="pb-9 sm:pb-10">
                            <div>
                                <h2 className={sectionTitleClass}>{t.main.benefitsTitle}</h2>
                                <p className={sectionLeadClass}>{t.main.resourcesIntro}</p>
                            </div>

                            <div className="mt-7 grid gap-8 sm:mt-9 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[#e4e6eb]">
                                {[
                                    {
                                        icon: '/images/icons/ic_user_check.svg',
                                        title: t.main.prepTitle,
                                        points: [t.main.prep1, t.main.prep2, t.main.prep3],
                                    },
                                    {
                                        icon: '/images/icons/ic_plus.svg',
                                        title: t.main.landingNavLearn,
                                        points: [t.main.benefit1, t.main.benefit2, t.main.benefit3],
                                    },
                                    {
                                        icon: '/images/icons/ic_right.svg',
                                        title: t.main.processTitle,
                                        points: [t.main.process1, t.main.process2, t.main.process3],
                                    },
                                ].map((card, index) => (
                                    <article
                                        key={card.title}
                                        className={`min-w-0 ${
                                            index === 0 ? 'md:pr-8' : index === 1 ? 'md:px-8' : 'md:pl-8'
                                        } ${
                                            index > 0 ? 'border-t border-[#e4e6eb] pt-8 md:border-t-0 md:pt-0' : ''
                                        }`}
                                    >
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-full"
                                            style={{ backgroundColor: 'rgba(0, 100, 224, 0.1)' }}
                                        >
                                            <Image
                                                src={card.icon}
                                                alt=""
                                                width={24}
                                                height={24}
                                                className="h-6 w-6"
                                                style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(98%) saturate(1766%) hue-rotate(201deg) brightness(94%) contrast(101%)' }}
                                            />
                                        </div>
                                        <h3 className={cardTitleClass}>{card.title}</h3>
                                        <ul className="mt-4 space-y-3">
                                            {card.points.map((point) => {
                                                const text = point.replace(/^[-–•]\s*/, '').trim()
                                                return (
                                                    <li
                                                        key={text}
                                                        className="flex gap-3 text-[15px] leading-relaxed text-[#4b5563] sm:text-[16px]"
                                                    >
                                                        <span
                                                            className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full"
                                                            style={{ backgroundColor: FB_BLUE }}
                                                            aria-hidden
                                                        />
                                                        <span>{text}</span>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <section id="fbcm-perks" className={`py-9 sm:py-10 ${anchorTarget}`} aria-labelledby="fbcm-perks-title">
                            <h2 id="fbcm-perks-title" className={sectionTitleClass}>
                                {t.main.perkSectionTitle}
                            </h2>
                            <p className={sectionLeadClass}>{t.main.perkSectionSubtitle}</p>

                            <div className="mt-6 grid gap-y-6 sm:mt-7 sm:grid-cols-2 sm:gap-x-0 sm:gap-y-8 lg:grid-cols-4">
                                {[
                                    {
                                        icon: '/images/icons/ic_wallet.svg',
                                        title: t.main.perk1Title,
                                        body: t.main.perk1Body,
                                    },
                                    {
                                        icon: '/images/icons/ic_topics.svg',
                                        title: t.main.perk2Title,
                                        body: t.main.perk2Body,
                                    },
                                    {
                                        icon: '/images/icons/ic_advanced.svg',
                                        title: t.main.perk3Title,
                                        body: t.main.perk3Body,
                                    },
                                    {
                                        icon: '/images/icons/ic_shield.svg',
                                        title: t.main.perk4Title,
                                        body: t.main.perk4Body,
                                    },
                                ].map((item, index) => (
                                    <article
                                        key={item.title}
                                        className={`min-w-0 sm:px-5 lg:px-6 ${
                                            index === 0 ? 'sm:pl-0' : ''
                                        } ${index === 3 ? 'lg:pr-0' : ''} ${
                                            index > 0 ? 'border-t border-[#e4e6eb] pt-6 sm:border-t-0 sm:pt-0' : ''
                                        } ${
                                            index % 2 === 1 ? 'sm:border-l sm:border-[#e4e6eb]' : ''
                                        } ${
                                            index > 1 ? 'lg:border-l lg:border-[#e4e6eb]' : ''
                                        } ${
                                            index === 2 ? 'sm:border-l-0 lg:border-l' : ''
                                        }`}
                                    >
                                        <Image src={item.icon} alt="" width={32} height={32} className="h-8 w-8 opacity-75" />
                                        <h3 className={itemTitleClass}>{item.title}</h3>
                                        <p className={itemBodyClass}>{item.body}</p>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section id="fbcm-best-ways" className={`py-9 sm:py-10 ${anchorTarget}`} aria-labelledby="fbcm-best-ways-title">
                            <h2 id="fbcm-best-ways-title" className={sectionTitleClass}>
                                {t.main.bestWaysTitle}
                            </h2>
                            <p className={sectionLeadClass}>{t.main.bestWaysSubtitle}</p>

                            <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-9">
                                <nav aria-label={t.main.bestWaysTitle} className="space-y-1 border-b border-[#e4e6eb] pb-5 pt-1 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                                    {practiceItems.map((item, index) => (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => setActivePractice(index)}
                                            className={`${practiceNavClass} ${
                                                activePractice === index
                                                    ? 'text-[#1d4ed8]'
                                                    : 'text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#1f2937]'
                                            }`}
                                        >
                                            <span className={`mt-[0.7em] h-2.5 w-2.5 shrink-0 rounded-full ${activePractice === index ? 'bg-[#1d4ed8]' : 'bg-transparent'}`} />
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </nav>

                                <article className={practiceBodyClass}>
                                    <p>{practiceItems[activePractice]?.content[0]}</p>
                                    <p className="mt-5">{practiceItems[activePractice]?.content[1]}</p>
                                </article>
                            </div>
                        </section>

                        <section id="fbcm-feedback" className={`pt-9 sm:pt-10 ${anchorTarget}`} aria-labelledby="fbcm-feedback-title">
                            <div className="min-w-0">
                                <h2 id="fbcm-feedback-title" className={sectionTitleClass}>
                                    {t.main.feedbackTitle}
                                </h2>
                                <p className={sectionLeadClass}>{t.main.feedbackSubtitle}</p>
                            </div>

                            <div className="mt-5 grid gap-5 sm:mt-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[#e4e6eb]">
                                {[
                                    {
                                        quote: t.main.feedback1Quote,
                                        name: t.main.feedback1Name,
                                        role: t.main.feedback1Role,
                                        initials: 'EC',
                                        tone: 'bg-[#e7f3ff] text-[#0064e0]',
                                    },
                                    {
                                        quote: t.main.feedback2Quote,
                                        name: t.main.feedback2Name,
                                        role: t.main.feedback2Role,
                                        initials: 'DH',
                                        tone: 'bg-[#f0f2f5] text-[#1c1e21]',
                                    },
                                    {
                                        quote: t.main.feedback3Quote,
                                        name: t.main.feedback3Name,
                                        role: t.main.feedback3Role,
                                        initials: 'OB',
                                        tone: 'bg-[#e7f3ff] text-[#0064e0]',
                                    },
                                ].map((item, index) => (
                                    <figure
                                        key={item.name}
                                        className={`min-w-0 ${
                                            index === 0 ? 'md:pr-6' : index === 2 ? 'md:pl-6' : 'md:px-6'
                                        } ${index > 0 ? 'border-t border-[#e4e6eb] pt-5 md:border-t-0 md:pt-0' : ''}`}
                                    >
                                        <blockquote className={quoteClass}>“{item.quote}”</blockquote>
                                        <figcaption className="mt-3 flex items-center gap-2.5">
                                            <span
                                                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tracking-wide ${item.tone}`}
                                                aria-hidden="true"
                                            >
                                                {item.initials}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-[14px] font-semibold text-[#1c1e21]">
                                                    {item.name}
                                                </span>
                                                <span className="mt-0.5 block truncate text-[13px] leading-snug text-[#65676B]">
                                                    {item.role}
                                                </span>
                                            </span>
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>

                            {onSubmitApplication ? (
                                <div className="mt-8 flex justify-center border-t border-[#e4e6eb] pt-8 sm:mt-9 sm:pt-9">
                                    <button
                                        type="button"
                                        onClick={onSubmitApplication}
                                        className="min-h-[48px] w-full max-w-[360px] rounded-full px-6 py-3 text-[15px] font-bold text-white shadow-[0_6px_18px_rgba(0,100,224,0.24)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:brightness-95 sm:min-h-[52px] sm:w-auto sm:px-11 sm:text-[16px]"
                                        style={{ backgroundColor: FB_BLUE, outlineColor: FB_BLUE }}
                                    >
                                        {t.main.cta}
                                    </button>
                                </div>
                            ) : null}
                        </section>
                    </div>
                </section>
            </div>

            <footer className="mt-10 w-full border-t border-[#dadde1] bg-[#f0f2f5] px-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] pb-[max(32px,env(safe-area-inset-bottom))] pt-8 sm:pb-10 sm:pt-10">
                <div className="mx-auto w-full max-w-[1080px]">
                    <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
                        <div className="shrink-0 md:max-w-[200px]">
                            <Image
                                src="/images/meta/favicon-32x32.png"
                                alt=""
                                className="h-9 w-9"
                                width={36}
                                height={36}
                            />
                            <p className="mt-4 text-[13px] font-semibold text-[#1c1e21]">{t.main.footerFollowUs}</p>
                            <div className="mt-2.5 flex items-center gap-2.5" aria-hidden="true">
                                <Image src="/images/icons/ic_facebook.svg" alt="" className="h-7 w-7 opacity-90" width={28} height={28} />
                                <Image src="/images/icons/ic_instagram.svg" alt="" className="h-7 w-7 opacity-90" width={28} height={28} />
                            </div>
                        </div>

                        <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4 sm:gap-x-8">
                            <div className="min-w-0">
                                <h3 className={footerHeadingClass}>{t.main.landingNavGetStarted}</h3>
                                <p className={footerItemClass}>{t.main.landingNavWhatsNew}</p>
                                <p className={footerItemClass}>{t.main.landingNavLearn}</p>
                                <p className={footerItemClass}>{t.info.title}</p>
                                <p className={footerItemClass}>{t.main.cta}</p>
                            </div>

                            <div className="min-w-0">
                                <h3 className={footerHeadingClass}>{t.main.footerColLegal}</h3>
                                <p className={footerItemClass}>{t.main.linkPrivacy}</p>
                                <p className={footerItemClass}>{t.main.linkTerms}</p>
                                <p className={footerItemClass}>{t.main.linkCommunity}</p>
                            </div>

                            <div className="min-w-0">
                                <h3 className={footerHeadingClass}>{t.main.footerColMonetize}</h3>
                                <p className={footerItemClass}>{t.main.benefitsTitle}</p>
                                <p className={footerItemClass}>{t.main.linkBusiness}</p>
                            </div>

                            <div className="min-w-0">
                                <h3 className={footerHeadingClass}>{t.main.footerColHelpCenter}</h3>
                                <p className={footerItemClass}>{t.main.linkHelp}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-[#dadde1] pt-5 sm:mt-10 sm:pt-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                            <p className={footerLegalClass}>Meta © {new Date().getFullYear()}</p>
                            <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${footerLegalClass}`}>
                                <span>{t.main.footerCookie}</span>
                                <span className="hidden text-[#bcc0c4] sm:inline" aria-hidden="true">
                                    ·
                                </span>
                                <span>{t.main.linkTerms}</span>
                                <span className="hidden text-[#bcc0c4] sm:inline" aria-hidden="true">
                                    ·
                                </span>
                                <span>{t.main.linkPrivacy}</span>
                            </p>
                        </div>
                        <address className="mt-4 text-[11px] not-italic leading-relaxed text-[#8a8d91] sm:mt-5 sm:text-[12px]">
                            {t.main.footerMeta}
                        </address>
                    </div>
                </div>
            </footer>
        </main>
    )
}

export default MainContent
