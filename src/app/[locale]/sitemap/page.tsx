import { Activity, Calendar, Camera, FileText, Home, MapPin, Shield } from 'lucide-react'
import { setRequestLocale } from 'next-intl/server'

import MenuWrapper from '@/components/menu/MenuWrapper'
import {
    OPEN_GALLERY_CATEGORIES_API_PATH,
    OPEN_PROPERTY_INFO_API_PATH,
    OPEN_ROOM_CLASSES_LIST_API_PATH
} from '@/constants/path'
import { Link } from '@/i18n/routing'
import { getDataWithToken } from '@/lib/api'
import { createSlugFromName } from '@/lib/utils'
import { PropertyInfo } from '@/types/property-info'
import { RoomClassWithSlug } from '@/types/room'
import { generateSEOMetadata } from '@/lib/seo'

interface SitemapPageProps {
    params: Promise<{ locale: string }>
}

interface GalleryCategory {
    id: number
    name: string
    label: string
    description: string | null
    displayOrder: number
    isActive: boolean
}

interface PageContentLocaleSummary {
    updatedAt: string | null
    thumbnailUrl: string | null
    hasContent: boolean
}

interface PageContentListItem {
    slug: string
    en: PageContentLocaleSummary | null
    th: PageContentLocaleSummary | null
}

const PROPERTY_ID = process.env.PROPERTY_ID || '1'

async function fetchAll(locale: string) {
    const [roomClasses, galleryCategories, pageContentList, propertyInfo] = await Promise.all([
        getDataWithToken<RoomClassWithSlug[]>(OPEN_ROOM_CLASSES_LIST_API_PATH).catch(() => [] as RoomClassWithSlug[]),
        getDataWithToken<GalleryCategory[]>(OPEN_GALLERY_CATEGORIES_API_PATH).catch(() => [] as GalleryCategory[]),
        getDataWithToken<PageContentListItem[]>(`/page-content/${PROPERTY_ID}`).catch(() => [] as PageContentListItem[]),
        getDataWithToken<PropertyInfo>(OPEN_PROPERTY_INFO_API_PATH).catch(() => null)
    ])

    const activeGalleryCategories = (galleryCategories ?? [])
        .filter((cat) => cat.isActive && cat.name !== 'PROPERTY')
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))

    // Keep only pages that have content in the current locale or English fallback
    const publishedPages = (pageContentList ?? []).filter((page) => {
        const localeSummary = locale === 'th' ? page.th : page.en
        return localeSummary?.hasContent ?? page.en?.hasContent ?? false
    })

    // Group by first path segment (e.g. "libong/history" → "libong")
    const pageGroups = publishedPages.reduce<Record<string, PageContentListItem[]>>((acc, page) => {
        const group = page.slug.split('/')[0] ?? page.slug
        acc[group] = [...(acc[group] ?? []), page]
        return acc
    }, {})

    return { roomClasses: roomClasses ?? [], activeGalleryCategories, pageGroups, propertyInfo }
}

const linkClass = 'flex items-center py-1 text-gray-700 transition-colors hover:text-[#0a6570]'
const dotOrange = <span className="mr-3 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
const dotGray = <span className="mr-3 h-2 w-2 shrink-0 rounded-full bg-gray-300" />

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center">
                {icon}
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            <nav className="space-y-2">{children}</nav>
        </div>
    )
}

function slugToLabel(slug: string): string {
    return slug
        .split('/')
        .pop()
        ?.replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) ?? slug
}

export function generateMetadata() {
    return generateSEOMetadata({
        title: 'Sitemap | Saiyuan Beach Resort',
        description: 'Complete sitemap of Saiyuan Beach Resort — find all pages including rooms, dining, activities, and island guides.',
        canonical: '/sitemap'
    })
}

const SitemapPage = async ({ params }: SitemapPageProps): Promise<React.JSX.Element> => {
    const { locale } = await params
    setRequestLocale(locale)

    const { roomClasses, activeGalleryCategories, pageGroups, propertyInfo } = await fetchAll(locale)

    return (
        <div className="min-h-screen bg-gray-50">
            <MenuWrapper />

            <main className="pt-10.5">
                {/* Hero */}
                <section
                    className="overflow-y-auto bg-black/90 bg-[url('/images/thread-bg.png')] bg-repeat py-16 text-white"
                    style={{ backgroundSize: 'auto 80px' }}>
                    <div className="mx-auto max-w-7xl px-4">
                        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Sitemap</h1>
                        <p className="text-xl text-gray-300">Complete overview of all pages on our website</p>
                        <p className="mt-4 text-sm text-gray-400">
                            Find everything you need to plan your perfect getaway
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

                            {/* Main Pages */}
                            <SectionCard icon={<Home className="mr-3 h-6 w-6 text-[#0a6570]" />} title="Main Pages">
                                <Link href="/" className={linkClass}>{dotOrange}Homepage</Link>
                                <Link href="/special-offers" className={linkClass}>{dotOrange}Special Offers</Link>
                                <Link href="/contact" className={linkClass}>{dotOrange}Contact</Link>
                            </SectionCard>

                            {/* Rooms — dynamic */}
                            {roomClasses.length > 0 && (
                                <SectionCard icon={<Home className="mr-3 h-6 w-6 text-[#0a6570]" />} title="Rooms">
                                    {roomClasses.map((room) => (
                                        <Link
                                            key={room.id}
                                            href={`/rooms/${room.slug}` as `/rooms/${string}`}
                                            className={linkClass}>
                                            {dotOrange}{room.name}
                                        </Link>
                                    ))}
                                </SectionCard>
                            )}

                            {/* Gallery — dynamic categories */}
                            <SectionCard icon={<Camera className="mr-3 h-6 w-6 text-[#0a6570]" />} title="Gallery">
                                <Link href="/gallery" className={linkClass}>{dotOrange}All Gallery</Link>
                                {activeGalleryCategories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/gallery/${createSlugFromName(cat.name)}` as `/gallery/${string}`}
                                        className={linkClass}>
                                        {dotOrange}{cat.label || cat.name}
                                    </Link>
                                ))}
                                <Link href="/videos" className={linkClass}>{dotOrange}Videos</Link>
                            </SectionCard>

                            {/* Reservations */}
                            <SectionCard icon={<Calendar className="mr-3 h-6 w-6 text-[#0a6570]" />} title="Reservations">
                                <Link href="/reservations" className={linkClass}>{dotOrange}Make a Reservation</Link>
                                <Link href="/reservations/success" className={linkClass}>{dotGray}Booking Success</Link>
                            </SectionCard>

                            {/* CMS page groups — dynamic */}
                            {Object.entries(pageGroups).map(([group, pages]) => {
                                const groupLabel = group.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                                const icon = group === 'libong'
                                    ? <MapPin className="mr-3 h-6 w-6 text-[#0a6570]" />
                                    : group === 'activities'
                                    ? <Activity className="mr-3 h-6 w-6 text-[#0a6570]" />
                                    : <FileText className="mr-3 h-6 w-6 text-[#0a6570]" />

                                return (
                                    <SectionCard key={group} icon={icon} title={groupLabel}>
                                        {pages.map((page) => (
                                            <Link
                                                key={page.slug}
                                                href={`/${page.slug}` as `/${string}`}
                                                className={linkClass}>
                                                {dotOrange}{slugToLabel(page.slug)}
                                            </Link>
                                        ))}
                                    </SectionCard>
                                )
                            })}

                            {/* Legal */}
                            <SectionCard icon={<Shield className="mr-3 h-6 w-6 text-[#0a6570]" />} title="Legal & Policies">
                                <Link href="/policies" className={linkClass}>
                                    <FileText className="mr-3 h-4 w-4 text-gray-400" />
                                    Policies
                                </Link>
                            </SectionCard>
                        </div>

                        {/* Contact */}
                        {propertyInfo && (
                            <div className="mt-12 rounded-lg bg-gray-900 p-8 text-white">
                                <h2 className="mb-6 text-center text-2xl font-bold">Contact Information</h2>
                                <div className="grid gap-6 text-center md:grid-cols-3">
                                    {propertyInfo.address && (
                                        <div>
                                            <h3 className="mb-2 text-lg font-semibold text-[#E0A458]">Address</h3>
                                            <p className="text-sm text-gray-300">{propertyInfo.address}</p>
                                        </div>
                                    )}
                                    {propertyInfo.phone && (
                                        <div>
                                            <h3 className="mb-2 text-lg font-semibold text-[#E0A458]">Phone</h3>
                                            <p className="text-gray-300">{propertyInfo.phone}</p>
                                        </div>
                                    )}
                                    {propertyInfo.email && (
                                        <div>
                                            <h3 className="mb-2 text-lg font-semibold text-[#E0A458]">Email</h3>
                                            <p className="text-gray-300">{propertyInfo.email}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 text-center text-sm text-gray-500">
                            <p>
                                If you cannot find what you&apos;re looking for, please{' '}
                                <Link href="/contact" className="font-medium text-[#0a6570] hover:text-[#0E7C86]">
                                    contact us
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default SitemapPage
