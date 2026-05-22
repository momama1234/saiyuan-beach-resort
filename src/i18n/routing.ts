import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'th'],

    // Used when no locale matches
    defaultLocale: 'en',

    // English won't have a prefix, other languages will have prefixes
    localePrefix: {
        mode: 'as-needed'
    },

    // Disable locale detection and cookie storage
    localeDetection: false

    // The `pathnames` object maps pathnames to localized versions
    // pathnames: {
    //     '/': '/',
    //     '/rooms': {
    //         en: '/rooms',
    //         th: '/ห้อง'
    //     },
    //     '/rooms/[slug]': {
    //         en: '/rooms/[slug]',
    //         th: '/ห้อง/[slug]'
    //     },
    //     '/dining': {
    //         en: '/dining',
    //         th: '/อาหาร'
    //     },
    //     '/activities': {
    //         en: '/activities',
    //         th: '/กิจกรรม'
    //     },
    //     '/gallery': {
    //         en: '/gallery',
    //         th: '/รูปภาพ'
    //     },
    //     '/gallery/resort-and-beach': {
    //         en: '/gallery/resort-and-beach',
    //         th: '/รูปภาพ/รีสอร์ทและชายหาด'
    //     },
    //     '/gallery/restaurant': {
    //         en: '/gallery/restaurant',
    //         th: '/รูปภาพ/ร้านอาหาร'
    //     },
    //     '/gallery/swimming-pool': {
    //         en: '/gallery/swimming-pool',
    //         th: '/รูปภาพ/สระว่ายน้ำ'
    //     },
    //     '/reservations': {
    //         en: '/reservations',
    //         th: '/จอง'
    //     },
    //     '/reservation': {
    //         en: '/reservation',
    //         th: '/จองห้องพัก'
    //     },
    //     '/libong': {
    //         en: '/libong',
    //         th: '/เกาะลิบง'
    //     },
    //     '/libong/history': {
    //         en: '/libong/history',
    //         th: '/เกาะลิบง/ประวัติศาสตร์'
    //     },
    //     '/libong/getting-here': {
    //         en: '/libong/getting-here',
    //         th: '/เกาะลิบง/การเดินทางมา'
    //     },
    //     '/libong/libong-guide-map': {
    //         en: '/libong/libong-guide-map',
    //         th: '/เกาะลิบง/แผนที่ท่องเที่ยว'
    //     },
    //     '/activities/travel-trang-sea': {
    //         en: '/activities/travel-trang-sea',
    //         th: '/กิจกรรม/ท่องเที่ยวทะเลตรัง'
    //     },
    //     '/activities/koh-rok': {
    //         en: '/activities/koh-rok',
    //         th: '/กิจกรรม/เกาะรอก'
    //     },
    //     '/activities/view-dugong': {
    //         en: '/activities/view-dugong',
    //         th: '/กิจกรรม/ชมพะยูน'
    //     },
    //     '/activities/other-activities': {
    //         en: '/activities/other-activities',
    //         th: '/กิจกรรม/กิจกรรมอื่นๆ'
    //     },
    //     // Room types
    //     '/oriental-beach-front-villa': {
    //         en: '/oriental-beach-front-villa',
    //         th: '/วิลลาโอเรียนทัลบีชฟรอนท์'
    //     },
    //     '/oriental-deluxe-villa': {
    //         en: '/oriental-deluxe-villa',
    //         th: '/วิลลาโอเรียนทัลดีลักซ์'
    //     },
    //     '/anda-deluxe-room': {
    //         en: '/anda-deluxe-room',
    //         th: '/ห้องอันดาดีลักซ์'
    //     },
    //     '/anda-premium-room': {
    //         en: '/anda-premium-room',
    //         th: '/ห้องอันดาพรีเมียม'
    //     },
    //     '/phupha-family-room': {
    //         en: '/phupha-family-room',
    //         th: '/ห้องภูผาแฟมิลี่'
    //     },
    //     '/phupha-premium-room': {
    //         en: '/phupha-premium-room',
    //         th: '/ห้องภูผาพรีเมียม'
    //     },
    //     '/family-botanical-house-first-floor': {
    //         en: '/family-botanical-house-first-floor',
    //         th: '/บ้านพฤกษศาสตร์ครอบครัวชั้นแรก'
    //     },
    //     '/family-botanical-house-second-floor': {
    //         en: '/family-botanical-house-second-floor',
    //         th: '/บ้านพฤกษศาสตร์ครอบครัวชั้นสอง'
    //     },
    //     '/family-luxury-house': {
    //         en: '/family-luxury-house',
    //         th: '/บ้านหรูครอบครัว'
    //     },
    //     '/family-timber-house': {
    //         en: '/family-timber-house',
    //         th: '/บ้านไม้ครอบครัว'
    //     },
    //     '/family-tropical-house': {
    //         en: '/family-tropical-house',
    //         th: '/บ้านเขตร้อนครอบครัว'
    //     }
    // }
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
