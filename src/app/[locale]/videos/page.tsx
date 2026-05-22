import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import MenuWrapper from '@/components/menu/MenuWrapper'
import { OPEN_PROPERTY_VIDEOS_API_PATH } from '@/constants/path'
import type { PublicGalleryVideo } from '@/constants/property-video'
import { getDataWithToken } from '@/lib/api'

import VideoGallery from './components/VideoGallery'

interface VideosPageProps {
    params: Promise<{ locale: string }>
}

type SupportedLocale = 'en' | 'th'

const PAGE_METADATA: Record<SupportedLocale, { title: string; description: string }> = {
    en: {
        title: 'Videos - Saiyuan Beach Resort',
        description: 'Watch curated videos and tours from Saiyuan Beach Resort.'
    },
    th: {
        title: 'วิดีโอ - อันดาลาย รีสอร์ท',
        description: 'ชมวิดีโอและทัวร์ที่คัดสรรจากอันดาลาย รีสอร์ท'
    }
}

const isSupportedLocale = (locale: string): locale is SupportedLocale => {
    return locale in PAGE_METADATA
}

const getPageMetadata = (locale: string): { title: string; description: string } => {
    return isSupportedLocale(locale) ? PAGE_METADATA[locale] : PAGE_METADATA.en
}

const getPropertyVideos = async (): Promise<PublicGalleryVideo[]> => {
    try {
        const result = await getDataWithToken<PublicGalleryVideo[]>(OPEN_PROPERTY_VIDEOS_API_PATH)
        return Array.isArray(result) ? result : []
    } catch (error) {
        console.error('Failed to load property videos:', error)
        return []
    }
}

export async function generateMetadata({ params }: VideosPageProps): Promise<Metadata> {
    const { locale } = await params
    const metadata = getPageMetadata(locale)

    return {
        title: metadata.title,
        description: metadata.description,
        alternates: {
            languages: {
                en: '/videos',
                th: '/th/videos'
            }
        }
    }
}

export default async function VideosPage({ params }: VideosPageProps): Promise<React.JSX.Element> {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations('Videos')
    const videos = await getPropertyVideos()

    return (
        <div className="flex min-h-screen flex-col bg-[#faf7f2]">
            <MenuWrapper />

            <div className="relative h-[460px] w-full flex-shrink-0 overflow-hidden md:h-[560px]">
                <Image
                    alt="Saiyuan Beach Resort videos"
                    className="h-full w-full object-cover"
                    height={560}
                    src="/images/bg-gallery-03.jpg"
                    width={1920}
                    priority
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.22) 72%, rgba(250,247,242,0.78) 91%, #faf7f2 100%)'
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.25) 0%, transparent 65%)' }}
                />

                <div className="absolute inset-0 flex flex-col justify-end px-8 pb-14 md:px-14 md:pb-20">
                    <div className="max-w-3xl">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="h-px w-8 flex-shrink-0 bg-[#c45a1a]" />
                            <span
                                className="text-[11px] font-medium tracking-[0.35em] text-[#c45a1a] uppercase"
                                style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
                                {t('eyebrow')}
                            </span>
                        </div>
                        <h1
                            className="font-dm-serif text-5xl leading-[1.05] text-white italic md:text-6xl lg:text-[4.5rem]"
                            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                            {t('title')}
                        </h1>
                        <p
                            className="mt-4 max-w-md text-sm leading-relaxed text-white/90 md:text-base"
                            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.65), 0 2px 20px rgba(0,0,0,0.4)' }}>
                            {t('subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            <VideoGallery
                videos={videos}
                labels={{
                    featured: t('featured'),
                    gallery: t('gallery'),
                    emptyTitle: t('emptyTitle'),
                    emptyDescription: t('emptyDescription'),
                    uploadPending: t('uploadPending')
                }}
            />
        </div>
    )
}
