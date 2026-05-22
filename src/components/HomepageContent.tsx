'use client'

import clsx from 'clsx'
import { Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

const HomepageContent = ({ description, name }: { description: string; name: string }): React.JSX.Element => {
    const [isVisible, setIsVisible] = useState(true)
    const t = useTranslations('HomePage')

    return (
        <>
            <div
                className={clsx(
                    // Mobile: normal flow below hero, fill remaining space
                    'relative z-[45] w-full flex-1',
                    // Desktop: absolute overlay on hero
                    'md:absolute md:top-20 md:bottom-20 md:left-10 md:h-auto md:max-h-[calc(100vh-10rem)] md:w-[500px]',
                    // Scrollbar styling
                    'scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent',
                    'md:scrollbar-thin md:scrollbar-thumb-transparent md:scrollbar-track-transparent',
                    // Background and styling
                    'bg-opacity-90 overflow-x-hidden overflow-y-auto bg-black/90',
                    'bg-[url("/images/thread-bg.png")] bg-repeat',
                    'p-6 pb-5 text-white',
                    // Animation
                    'transition-transform duration-500 ease-in-out',
                    // Conditional visibility
                    {
                        'translate-x-0': isVisible,
                        'md:-translate-x-[120%]': !isVisible
                    }
                )}>
                {/* Collage Toggle Button in Header - Desktop only */}
                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="absolute top-1 right-1 hidden cursor-pointer bg-black p-1 text-white shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none md:block"
                    aria-label={isVisible ? t('hideContent') : t('showContent')}
                    title={isVisible ? t('hideContent') : t('showContent')}>
                    {isVisible ? (
                        <X
                            size={24}
                            className="text-[#0E7C86] transition-transform duration-200 hover:text-[#0a6570]"
                        />
                    ) : (
                        <Plus
                            size={24}
                            className="text-[#0E7C86] transition-transform duration-200 hover:text-[#0a6570]"
                        />
                    )}
                </button>
                <article className="space-y-6">
                    <header className="relative">
                        <h1 className="mb-3 text-xl leading-tight font-medium tracking-tight text-[#0E7C86] uppercase">
                            {t('title', { name })}
                            <span className="mt-2 block text-lg font-light text-white normal-case">
                                {t('subtitle')}
                            </span>
                        </h1>
                    </header>

                    {isVisible && (
                        <>
                            {description ? (
                                <div
                                    className="prose w-full max-w-none leading-relaxed break-words whitespace-pre-line text-white prose-invert prose-headings:mt-4 prose-headings:mb-2 prose-p:my-3 prose-ol:list-disc prose-ul:list-disc
                                        prose-li:my-1 [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-2xl
                                        [&_h1]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl
                                        [&_h2]:font-semibold [&_li]:my-1 [&_ol]:list-disc [&_ol]:pl-5 [&_p]:my-3 [&_span]:!text-inherit [&_ul]:list-disc
                                        [&_ul]:pl-5"
                                    dangerouslySetInnerHTML={{
                                        __html: description
                                    }}
                                />
                            ) : (
                                <>
                                    <section className="space-y-4">
                                        <p className="text-base font-light text-white">{t('description')}</p>
                                    </section>

                                    <hr className="mx-auto my-4 w-[65%] border-[1.5px] border-white/10" />

                                    <section className="space-y-4">
                                        <h2 className="mb-2 text-base font-semibold text-white/90">
                                            {t('exclusiveVillasTitle')}
                                        </h2>
                                        <p className="text-base font-light text-white">
                                            {t('exclusiveVillasDescription')}
                                        </p>
                                        <ul className="list-disc space-y-2 pl-5 text-base font-light text-white">
                                            <li>{t('villasFeatures.feature1')}</li>
                                            <li>{t('villasFeatures.feature2')}</li>
                                            <li>{t('villasFeatures.feature3')}</li>
                                            <li>{t('villasFeatures.feature4')}</li>
                                            <li>{t('villasFeatures.feature5')}</li>
                                        </ul>
                                        <p className="text-base font-light text-white">
                                            {t('largerGroupsDescription')}
                                        </p>
                                    </section>

                                    <hr className="mx-auto my-4 w-[65%] border-[1.5px] border-white/10" />

                                    <section className="space-y-4">
                                        <h2 className="mb-2 text-base font-semibold text-white/90">
                                            {t('experiencesTitle')}
                                        </h2>
                                        <p className="text-base font-light text-white">{t('experiencesDescription')}</p>
                                        <ul className="list-disc space-y-2 pl-5 text-white/90">
                                            <li>{t('experiences.experience1')}</li>
                                            <li>{t('experiences.experience2')}</li>
                                            <li>{t('experiences.experience3')}</li>
                                            <li>{t('experiences.experience4')}</li>
                                            <li>{t('experiences.experience5')}</li>
                                        </ul>
                                        <p className="text-base font-light text-white">{t('experiencesClosure')}</p>
                                    </section>

                                    <hr className="mx-auto my-4 w-[65%] border-[1.5px] border-white/10" />

                                    <section className="space-y-4">
                                        <h2 className="mb-2 text-base font-semibold text-white/90">
                                            {t('whyChooseTitle')}
                                        </h2>
                                        <ul className="space-y-2 text-white/90">
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500">✓</span>{' '}
                                                {t('whyChooseFeatures.feature1')}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500">✓</span>{' '}
                                                {t('whyChooseFeatures.feature2')}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500">✓</span>{' '}
                                                {t('whyChooseFeatures.feature3')}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500">✓</span>{' '}
                                                {t('whyChooseFeatures.feature4')}
                                            </li>
                                        </ul>
                                    </section>

                                    <hr className="mx-auto my-4 w-[65%] border-[1.5px] border-white/10" />

                                    <footer className="space-y-4">
                                        <p className="text-sm font-semibold text-white/90">{t('bookingTitle')}</p>
                                        <p className="text-xs font-light text-white">{t('bookingSubtitle')}</p>
                                    </footer>
                                </>
                            )}
                        </>
                    )}
                </article>
            </div>

            {/* Floating + Button when content is hidden - Desktop only */}
            {!isVisible && (
                <button
                    onClick={() => setIsVisible(true)}
                    className="fixed top-20 left-4 z-40 cursor-pointer rounded-full bg-[#0E7C86] p-3 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#0a6570] focus:ring-2 focus:ring-[#0E7C86] focus:ring-offset-2 focus:outline-none md:top-24 md:left-6"
                    aria-label={t('showContent')}
                    title={t('showContent')}>
                    <Plus size={20} className="transition-transform duration-200" />
                </button>
            )}
        </>
    )
}

export default HomepageContent
