import { Metadata } from 'next'

export interface SEOProps {
    title: string
    description: string
    keywords?: string[]
    image?: string
    canonical?: string
    locale?: string
    alternateLocales?: { locale: string; href: string }[]
    type?: 'website' | 'article'
    noindex?: boolean
}

export function generateSEOMetadata({
    title,
    description,
    keywords = [],
    image = '/images/og-default.jpg',
    canonical,
    locale = 'en',
    alternateLocales = [],
    type = 'website',
    noindex = false
}: SEOProps): Metadata {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saiyuanbeachresort.com'
    const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`
    const fullCanonical = canonical ? `${baseUrl}${canonical}` : undefined

    return {
        title,
        description,
        keywords: keywords.join(', '),
        robots: {
            index: !noindex,
            follow: !noindex,
            googleBot: {
                index: !noindex,
                follow: !noindex,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1
            }
        },
        authors: [{ name: 'Saiyuan Beach Resort' }],
        creator: 'Saiyuan Beach Resort',
        publisher: 'Saiyuan Beach Resort',
        formatDetection: {
            email: false,
            address: false,
            telephone: false
        },
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: fullCanonical,
            languages: alternateLocales.reduce(
                (acc, alt) => {
                    acc[alt.locale] = alt.href
                    return acc
                },
                {} as Record<string, string>
            )
        },
        openGraph: {
            title,
            description,
            url: fullCanonical,
            siteName: 'Saiyuan Beach Resort',
            images: [
                {
                    url: fullImage,
                    width: 1200,
                    height: 630,
                    alt: title
                }
            ],
            locale,
            type
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [fullImage],
            creator: '@saiyuanresort'
        },
        verification: {
            google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
            yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
            yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION
        }
    }
}

// SEO constants for different pages
export const SEO_CONFIG = {
    home: {
        en: {
            title: 'Saiyuan Beach Resort - Luxury Beachfront Resort in Libong Island',
            description:
                'Experience luxury at Saiyuan Beach Resort on pristine Libong Island. Beachfront villas, world-class dining, and unforgettable activities in Trang, Thailand.',
            keywords: [
                'luxury resort',
                'Libong Island',
                'Trang Thailand',
                'beachfront resort',
                'villa accommodation',
                'island resort'
            ]
        },
        th: {
            title: 'ไซยวน บีช รีสอร์ท - รีสอร์ทหรูริมชายหาดเกาะลิบง',
            description:
                'สัมผัสความหรูหราที่ไซยวน บีช รีสอร์ท บนเกาะลิบงที่สวยงาม วิลลาริมชายหาด อาหารระดับโลก และกิจกรรมที่น่าจดจำในตรัง ประเทศไทย',
            keywords: ['รีสอร์ทหรู', 'เกาะลิบง', 'ตรัง ประเทศไทย', 'รีสอร์ทริมชายหาด', 'วิลลา', 'รีสอร์ทเกาะ']
        }
    },
    specialOffers: {
        en: {
            title: 'Special Offers - Exclusive Deals at Saiyuan Beach Resort',
            description:
                'Discover exclusive special offers and promotions at Saiyuan Beach Resort. Book direct for the best rates on our luxury villas and rooms on Koh Libong.',
            keywords: ['resort special offers', 'Saiyuan Beach Resort promotions', 'Libong Island deals', 'luxury villa discount', 'hotel promotions']
        },
        th: {
            title: 'โปรโมชั่นพิเศษ - ดีลสุดพิเศษที่ไซยวน บีช รีสอร์ท',
            description:
                'ค้นพบโปรโมชั่นพิเศษที่ไซยวน บีช รีสอร์ท จองตรงเพื่อรับราคาดีที่สุดสำหรับวิลลาและห้องพักหรูหราบนเกาะลิบง',
            keywords: ['โปรโมชั่นรีสอร์ท', 'ส่วนลดไซยวน บีช รีสอร์ท', 'ดีลเกาะลิบง', 'ส่วนลดวิลลา', 'โปรโมชั่นโรงแรม']
        }
    },
    gallery: {
        en: {
            title: 'Gallery - Saiyuan Beach Resort Photo Collection',
            description:
                'Explore our stunning photo gallery showcasing the beauty of Saiyuan Beach Resort, from luxurious accommodations to breathtaking ocean views.',
            keywords: [
                'resort photos',
                'Saiyuan Beach Resort gallery',
                'resort images',
                'Libong Island photos',
                'luxury accommodation photos'
            ]
        },
        th: {
            title: 'แกลเลอรี่ - คอลเลกชันภาพไซยวน บีช รีสอร์ท',
            description:
                'สำรวจแกลเลอรี่ภาพที่น่าทึ่งของไซยวน บีช รีสอร์ท จากที่พักหรูหราไปจนถึงทิวทัศน์มหาสมุทรที่น่าตื่นตาตื่นใจ',
            keywords: ['ภาพรีสอร์ท', 'แกลเลอรี่ไซยวน บีช รีสอร์ท', 'ภาพรีสอร์ท', 'ภาพเกาะลิบง', 'ภาพที่พักหรู']
        }
    },
    dining: {
        en: {
            title: 'Dining - Gourmet Restaurant at Saiyuan Beach Resort',
            description:
                'Savor exquisite cuisine at our beachfront restaurant featuring fresh seafood, Thai specialties, and international dishes with ocean views.',
            keywords: ['beachfront dining', 'Thai cuisine', 'fresh seafood', 'ocean view restaurant', 'gourmet dining']
        },
        th: {
            title: 'อาหาร - ร้านอาหารกูร์เมต์ที่ไซยวน บีช รีสอร์ท',
            description:
                'ลิ้มรสอาหารเลิศรสที่ร้านอาหารริมชายหาดของเรา พร้อมอาหารทะเลสด อาหารไทยพิเศษ และอาหารนานาชาติพร้อมวิวมหาสมุทร',
            keywords: ['อาหารริมชายหาด', 'อาหารไทย', 'อาหารทะเลสด', 'ร้านอาหารวิวทะเล', 'อาหารกูร์เมต์']
        }
    },
    activities: {
        en: {
            title: 'Activities - Island Adventures at Saiyuan Beach Resort',
            description:
                'Discover exciting activities including dugong watching, island hopping, snorkeling, and cultural experiences around Libong Island.',
            keywords: ['island activities', 'dugong watching', 'snorkeling', 'island hopping', 'Libong Island tours']
        },
        th: {
            title: 'กิจกรรม - การผจญภัยบนเกาะที่ไซยวน บีช รีสอร์ท',
            description:
                'ค้นพบกิจกรรมที่น่าตื่นเต้น รวมถึงการชมพะยูน การเที่ยวเกาะ การดำน้ำตื้น และประสบการณ์ทางวัฒนธรรมรอบเกาะลิบง',
            keywords: ['กิจกรรมเกาะ', 'ชมพะยูน', 'ดำน้ำตื้น', 'เที่ยวเกาะ', 'ทัวร์เกาะลิบง']
        }
    },
    libong: {
        en: {
            title: 'Libong Island Guide - Discover Paradise in Trang',
            description:
                'Complete guide to Libong Island including history, getting here, and must-visit attractions in this pristine paradise.',
            keywords: ['Libong Island', 'Trang attractions', 'island guide', 'Thailand islands', 'island history']
        },
        th: {
            title: 'คู่มือเกาะลิบง - ค้นพบสวรรค์ในตรัง',
            description:
                'คู่มือสมบูรณ์เกี่ยวกับเกาะลิบง รวมถึงประวัติศาสตร์ การเดินทาง และสถานที่ท่องเที่ยวที่ต้องไปในสวรรค์ที่บริสุทธิ์แห่งนี้',
            keywords: ['เกาะลิบง', 'สถานที่ท่องเที่ยวตรัง', 'คู่มือเกาะ', 'เกาะประเทศไทย', 'ประวัติเกาะ']
        }
    },
    reservations: {
        en: {
            title: 'Reservations - Book Your Stay at Saiyuan Beach Resort',
            description:
                'Book your luxury stay at Saiyuan Beach Resort. Choose from beachfront villas and premium rooms with easy online reservation system.',
            keywords: [
                'book resort',
                'hotel reservation',
                'Saiyuan Beach Resort booking',
                'luxury accommodation booking',
                'Libong Island hotels'
            ]
        },
        th: {
            title: 'การจอง - จองการพักที่ไซยวน บีช รีสอร์ท',
            description:
                'จองการพักหรูหราที่ไซยวน บีช รีสอร์ท เลือกจากวิลลาริมชายหาดและห้องพรีเมียมพร้อมระบบจองออนไลน์ที่ง่ายดาย',
            keywords: ['จองรีสอร์ท', 'จองโรงแรม', 'จองไซยวน บีช รีสอร์ท', 'จองที่พักหรู', 'โรงแรมเกาะลิบง']
        }
    }
}

export function getAlternateLocales(path: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saiyuanbeachresort.com'
    return [
        { locale: 'en', href: `${baseUrl}${path}` },
        { locale: 'th', href: `${baseUrl}/th${path}` }
    ]
}
