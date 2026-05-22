import {
    FacebookIcon,
    InstagramIcon,
    LineIcon,
    TelegramIcon,
    TikTokIcon,
    WhatsAppIcon,
    XIcon
} from '@/ui/icons'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'

import { OPEN_PROPERTY_INFO_API_PATH } from '@/constants/path'
import { routing } from '@/i18n/routing'
import { getDataWithToken } from '@/lib/api'
import { PropertyInfo } from '@/types/property-info'

interface SocialLink {
    url: string
    label: string
    Icon: React.ComponentType<{ className?: string }>
}

const buildSocialLinks = (info: PropertyInfo | null): SocialLink[] => {
    if (!info) return []
    const platforms: { url: string | null | undefined; label: string; Icon: SocialLink['Icon'] }[] = [
        { url: info.facebookUrl, label: 'Facebook', Icon: FacebookIcon },
        { url: info.instagramUrl, label: 'Instagram', Icon: InstagramIcon },
        { url: info.lineUrl, label: 'Line', Icon: LineIcon },
        { url: info.tiktokUrl, label: 'TikTok', Icon: TikTokIcon },
        { url: info.telegramUrl, label: 'Telegram', Icon: TelegramIcon },
        { url: info.whatsappUrl, label: 'WhatsApp', Icon: WhatsAppIcon },
        { url: info.xUrl, label: 'X', Icon: XIcon }
    ]
    return platforms.filter((p): p is SocialLink => Boolean(p.url))
}

function lp(href: string, locale: string): string {
    return locale === routing.defaultLocale ? href : `/${locale}${href}`
}

const Footer = async (): Promise<React.JSX.Element> => {
    const [t, locale] = await Promise.all([getTranslations('Footer'), getLocale()])

    let propertyInfo: PropertyInfo | null = null
    try {
        propertyInfo = await getDataWithToken<PropertyInfo>(OPEN_PROPERTY_INFO_API_PATH)
    } catch {
        propertyInfo = null
    }
    const socialLinks = buildSocialLinks(propertyInfo)

    return (
        <footer className="bg-black/90 px-4 py-8 text-white md:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Main footer content */}
                <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Resort Information */}
                    <div className="space-y-4">
                        <Link href={lp('/', locale)}>
                            <span className="font-cormorant mb-3 block text-2xl font-semibold tracking-wide text-[#0E7C86]">
                                Saiyuan
                                <span className="block text-xs font-light tracking-widest uppercase text-[#E0A458]">Beach Resort</span>
                            </span>
                        </Link>
                        <h2 className="text-xl font-semibold text-[#0E7C86]">{propertyInfo?.name ?? t('resortName')}</h2>
                        <p className="text-xs leading-relaxed font-light text-gray-300">{t('description')}</p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white">{t('quickLinks')}</h2>
                        <nav className="space-y-2">
                            <a
                                href="/"
                                className="block text-sm text-gray-300 transition-colors hover:text-[#0E7C86]">
                                {t('home')}
                            </a>
                            <Link
                                href={lp('/gallery', locale)}
                                className="block text-sm text-gray-300 transition-colors hover:text-[#0E7C86]">
                                {t('gallery')}
                            </Link>
                            <Link
                                href={lp('/contact', locale)}
                                className="block text-sm text-gray-300 transition-colors hover:text-[#0E7C86]">
                                {t('contact')}
                            </Link>
                        </nav>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white">{t('legal')}</h2>
                        <nav className="space-y-2">
                            <Link
                                href={lp('/policies', locale)}
                                className="block text-sm text-gray-300 transition-colors hover:text-[#0E7C86]">
                                {t('policies')}
                            </Link>
                        </nav>
                    </div>

                    {/* Social Media & Newsletter */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white">{t('followUs')}</h2>
                        {socialLinks.length > 0 && (
                            <div className="flex flex-wrap gap-4">
                                {socialLinks.map(({ url, label, Icon }) => (
                                    <a
                                        key={label}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-300 transition-colors hover:text-[#0E7C86]"
                                        aria-label={label}>
                                        <Icon className="text-2xl" />
                                    </a>
                                ))}
                            </div>
                        )}
                        <div className="text-xs font-light text-gray-300">
                            {propertyInfo?.address && <p>{propertyInfo?.address}</p>}
                            {propertyInfo?.phone && (
                                <p className="mt-1">
                                    <span className="font-medium">{t('phone')}:</span> {propertyInfo?.phone}
                                </p>
                            )}
                            {propertyInfo?.email && (
                                <p className="mt-1">
                                    <span className="font-medium">{t('email')}:</span> {propertyInfo?.email}
                                </p>
                            )}
                        </div>

                        {/* Newsletter Signup */}
                        <div className="mt-6 hidden">
                            <h4 className="mb-2 text-sm font-semibold text-white">{t('newsletter')}</h4>
                            <p className="mb-3 text-xs text-gray-400">{t('newsletterDescription')}</p>
                            <form className="flex flex-col space-y-2">
                                <input
                                    type="email"
                                    placeholder={t('emailPlaceholder')}
                                    className="rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-[#0E7C86] focus:ring-1 focus:ring-[#0E7C86] focus:outline-none"
                                    aria-label={t('emailPlaceholder')}
                                />
                                <button
                                    type="submit"
                                    className="rounded bg-[#0E7C86] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a6570] focus:ring-2 focus:ring-[#0E7C86] focus:ring-offset-2 focus:ring-offset-black focus:outline-none">
                                    {t('subscribe')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-700 pt-6">
                    <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
                        <div className="text-sm text-gray-400">{t('copyright')}</div>
                        <div className="flex flex-wrap items-center space-x-4 text-xs text-gray-400">
                            <Link href={lp('/sitemap', locale)} className="transition-colors hover:text-[#0E7C86]">
                                {t('sitemap')}
                            </Link>
                            <span>•</span>
                            <span>{t('allRightsReserved')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
