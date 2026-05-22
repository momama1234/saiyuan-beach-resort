const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/v1'
const PROPERTY_ID = process.env.PROPERTY_ID || '1'

interface ApiDisplayImageVariant {
    url: string
    width: number
    height: number
}

interface ApiDisplayImageVariants {
    thumbnail: ApiDisplayImageVariant
    card: ApiDisplayImageVariant
    hero: ApiDisplayImageVariant
    original: ApiDisplayImageVariant
}

interface ApiFileLink {
    id: number
    url: string
    displayImage?: ApiDisplayImageVariants
    altText: string | null
    sortOrder: number
    isModalEnabled: boolean
    zoomScale: number
}

interface ApiSection {
    pageSectionId: number
    title?: string
    content: string
    fileLinks?: ApiFileLink[]
}

interface ApiPageContent {
    slug: string
    locale: string
    title: string
    subtitle: string | null
    sections: ApiSection[]
}

export interface ContentImage {
    src: string           // card variant (800×600) for grid thumbnails
    heroSrc?: string      // hero variant (1600×900) for full-width carousel/header
    lightboxSrc?: string  // original variant (2400×1600) for lightbox
    alt: string
    isModalEnabled: boolean
    zoomScale: number
}

export interface ContentSection {
    title?: string
    content: string
    images?: ContentImage[]
}

export interface PageContent {
    title: string
    subtitle?: string
    sections: ContentSection[]
}

function mapSection(s: ApiSection): ContentSection {
    return {
        title: s.title,
        content: Array.isArray(s.content) ? s.content.join('\n') : s.content,
        images:
            (s.fileLinks ?? []).length > 0
                ? s.fileLinks!.map((fl) => ({
                      src: fl.displayImage?.card.url ?? fl.url,
                      heroSrc: fl.displayImage?.hero.url,
                      lightboxSrc: fl.displayImage?.original.url,
                      alt: fl.altText || s.title || '',
                      isModalEnabled: fl.isModalEnabled ?? false,
                      zoomScale: fl.zoomScale ?? 200
                  }))
                : undefined
    }
}

export async function fetchPageByPath(segments: string[], locale: string): Promise<PageContent | null> {
    const path = segments.join('/')
    const url = `${API_URL}/page-content/${PROPERTY_ID}/resolve/${path}?locale=${locale}`
    const res = await fetch(url, { cache: 'no-store' })

    if (!res.ok) return null

    const data: ApiPageContent = await res.json()

    return {
        title: data.title,
        subtitle: data.subtitle ?? undefined,
        sections: data.sections.map(mapSection)
    }
}

export async function fetchPageContent(slug: string, locale: string): Promise<PageContent> {
    const url = `${API_URL}/page-content/${PROPERTY_ID}/${slug}?locale=${locale}`
    const res = await fetch(url, { cache: 'no-store' })

    if (!res.ok) {
        return { title: '', sections: [] }
    }

    const data: ApiPageContent = await res.json()

    return {
        title: data.title,
        subtitle: data.subtitle ?? undefined,
        sections: data.sections.map(mapSection)
    }
}
