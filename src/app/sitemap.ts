import { MetadataRoute } from 'next'

import { createSlugFromName } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/v1'
const PROPERTY_ID = process.env.PROPERTY_ID || '1'

interface PageSummary {
    slug: string
}

interface GalleryCategory {
    id: number
    name: string
    isActive: boolean
}

interface RoomClass {
    slug: string
}

async function fetchContentSlugs(): Promise<string[]> {
    try {
        const res = await fetch(`${API_URL}/page-content/${PROPERTY_ID}`, { next: { revalidate: 86400 } })
        if (!res.ok) return []
        const data: PageSummary[] = await res.json()
        return data.map((p) => p.slug)
    } catch {
        return []
    }
}

async function fetchRoomSlugs(): Promise<string[]> {
    try {
        const res = await fetch(`${API_URL}/open/room-classes-list`, { next: { revalidate: 86400 } })
        if (!res.ok) return []
        const data: RoomClass[] = await res.json()
        return data.map((r) => r.slug).filter(Boolean)
    } catch {
        return []
    }
}

async function fetchGalleryCategories(): Promise<string[]> {
    try {
        const res = await fetch(`${API_URL}/open/gallery-categories`, { next: { revalidate: 86400 } })
        if (!res.ok) return []
        const data: GalleryCategory[] = await res.json()
        return data
            .filter((cat) => cat.isActive && cat.name !== 'PROPERTY')
            .map((cat) => createSlugFromName(cat.name))
    } catch {
        return []
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'

    const staticPaths = [
        '',
        'gallery',
        'reservations',
        'contact',
        'contact-booking',
        'policies',
        'special-offers',
        'videos'
    ]

    const [contentSlugs, roomSlugs, galleryCategorySlugs] = await Promise.all([
        fetchContentSlugs(),
        fetchRoomSlugs(),
        fetchGalleryCategories()
    ])

    const dynamicPaths = [
        ...contentSlugs,
        ...roomSlugs.map((slug) => `rooms/${slug}`),
        ...galleryCategorySlugs.map((slug) => `gallery/${slug}`)
    ]

    return [...staticPaths, ...dynamicPaths].flatMap((path) => makeEntries(baseUrl, path))
}

function makeEntries(baseUrl: string, path: string) {
    const enUrl = path === '' ? `${baseUrl}/` : `${baseUrl}/${path}`
    const thUrl = path === '' ? `${baseUrl}/th` : `${baseUrl}/th/${path}`
    const alternates = { languages: { en: enUrl, th: thUrl } }
    const shared = {
        lastModified: new Date(),
        changeFrequency: getChangeFrequency(path),
        priority: getPriority(path),
        alternates
    }
    return [
        { url: enUrl, ...shared },
        { url: thUrl, ...shared }
    ]
}

export function getChangeFrequency(
    path: string
): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
    if (path === '') return 'weekly'
    if (path === 'reservations') return 'weekly'
    if (path === 'special-offers') return 'weekly'
    if (path.startsWith('rooms/')) return 'monthly'
    if (path.startsWith('gallery')) return 'monthly'
    if (path === 'videos') return 'monthly'
    if (path === 'contact' || path === 'contact-booking') return 'monthly'
    if (path === 'policies') return 'yearly'
    return 'monthly'
}

export function getPriority(path: string): number {
    if (path === '') return 1.0
    if (path === 'reservations') return 0.9
    if (path.startsWith('rooms/')) return 0.9
    if (path === 'special-offers') return 0.8
    if (path.startsWith('gallery')) return 0.8
    if (path === 'contact' || path === 'contact-booking') return 0.7
    if (path === 'videos') return 0.7
    if (path === 'policies') return 0.5
    return 0.7
}
