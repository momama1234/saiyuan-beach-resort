'use client'

import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/routing'

const HomepageFooter = (): React.JSX.Element => {
    const t = useTranslations('Footer')

    return (
        <footer className="hidden">
            <div className="mx-auto max-w-full px-4 py-3">
                <div className="flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0 md:space-x-6">
                    {/* Legal Links */}
                    <div className="flex flex-wrap items-center justify-center space-x-4 text-xs">
                        <Link
                            href="/policies"
                            className="font-normal text-gray-300 transition-colors duration-200 hover:text-[#E0A458]">
                            {t('policies')}
                        </Link>
                    </div>

                    {/* Copyright */}
                    <div className="text-center text-xs text-gray-300 md:text-left">{t('copyright')}</div>
                </div>
            </div>
        </footer>
    )
}

export default HomepageFooter
