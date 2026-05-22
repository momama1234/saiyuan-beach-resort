/**
 * Hotel information constants for SEO schema generation
 * Update these values with your actual hotel information
 */

import type { HotelInfo } from '@/lib/seo-schema'

export const HOTEL_INFO: HotelInfo = {
    name: 'Saiyuan Beach Resort',
    description:
        'Experience the serene beauty of Libong Island at Saiyuan Beach Resort. Nestled along the pristine shores of Trang, Thailand, our beachfront villas offer ultimate privacy, ocean views, and authentic Thai hospitality for an unforgettable escape.',
    url: 'https://saiyuanbeachresort.com',
    telephone: '+66-75-000-0000',
    email: 'info@saiyuanbeachresort.com',
    logo: 'https://saiyuanbeachresort.com/images/logo.png',
    images: [
        'https://saiyuanbeachresort.com/images/home_page_bg.webp',
        'https://saiyuanbeachresort.com/images/A5.webp',
        'https://saiyuanbeachresort.com/images/OA1.webp',
        'https://saiyuanbeachresort.com/images/OA2.webp',
        'https://saiyuanbeachresort.com/images/OA3.webp',
        'https://saiyuanbeachresort.com/images/OA4.webp',
        'https://saiyuanbeachresort.com/images/OA5.webp'
    ],
    address: {
        streetAddress: '123 Main Street',
        locality: 'City Name',
        region: 'Province Name',
        postalCode: '12345',
        country: 'TH'
    },
    coordinates: {
        latitude: 13.7563,
        longitude: 100.5018
    },
    rating: {
        value: 4.5,
        count: 150,
        bestRating: 5,
        worstRating: 1
    },
    reviews: [
        {
            author: 'John Smith',
            rating: 5,
            text: 'Excellent service and beautiful rooms. Highly recommended!',
            date: '2024-01-15'
        },
        {
            author: 'Sarah Johnson',
            rating: 4,
            text: 'Great location and friendly staff. Will definitely come back.',
            date: '2024-01-10'
        }
    ],
    socialMedia: {
        facebook: 'https://facebook.com/saiyuanbeachresort',
        instagram: 'https://instagram.com/saiyuanbeachresort',
        twitter: 'https://twitter.com/saiyuanresort'
    },
    amenities: [
        'Free WiFi',
        'Air Conditioning',
        'Restaurant',
        'Room Service',
        '24-hour Front Desk',
        'Parking',
        'Swimming Pool',
        'Fitness Center',
        'Spa Services',
        'Conference Room'
    ],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    priceRange: '$$' // $ = budget, $$ = moderate, $$$ = expensive, $$$$ = luxury
}

// Common FAQ data for the hotel
export const HOTEL_FAQ = {
    questions: [
        {
            question: 'What time is check-in and check-out?',
            answer: 'Check-in is at 2:00 PM and check-out is at 12:00 PM. Early check-in and late check-out may be available upon request.'
        },
        {
            question: 'Do you offer airport transportation?',
            answer: 'Yes, we provide airport shuttle service. Please contact us in advance to arrange pickup and drop-off.'
        },
        {
            question: 'Is breakfast included in the room rate?',
            answer: 'Breakfast is included with most of our room packages. Please check your booking details or contact us for confirmation.'
        },
        {
            question: 'Do you have a swimming pool?',
            answer: 'Yes, we have an outdoor swimming pool that is open daily from 6:00 AM to 10:00 PM.'
        },
        {
            question: 'Is WiFi available throughout the hotel?',
            answer: 'Yes, complimentary high-speed WiFi is available in all rooms and public areas.'
        },
        {
            question: 'Do you accept pets?',
            answer: 'We welcome pets with prior arrangement. Additional fees may apply. Please contact us to discuss your pet accommodation needs.'
        }
    ]
}

// Website information for schema
export const WEBSITE_INFO = {
    name: 'Saiyuan Beach Resort',
    url: 'https://thaivis.breathoftravels.com',
    searchUrl: 'https://thaivis.breathoftravels.com/search'
}

// Publisher information for articles
export const PUBLISHER_INFO = {
    name: 'Saiyuan Beach Resort',
    logo: 'https://thaivis.breathoftravels.com/logo.png'
}

// Default breadcrumb for different pages
export const getBreadcrumbForPage = (pathname: string) => {
    const baseBreadcrumb = [{ name: 'Home', url: 'https://thaivis.breathoftravels.com' }]

    switch (pathname) {
        case '/rooms':
            return {
                items: [...baseBreadcrumb, { name: 'Rooms & Suites', url: 'https://thaivis.breathoftravels.com/rooms' }]
            }
        case '/dining':
            return {
                items: [...baseBreadcrumb, { name: 'Dining', url: 'https://thaivis.breathoftravels.com/dining' }]
            }
        case '/amenities':
            return {
                items: [...baseBreadcrumb, { name: 'Amenities', url: 'https://thaivis.breathoftravels.com/amenities' }]
            }
        case '/contact':
            return {
                items: [...baseBreadcrumb, { name: 'Contact', url: 'https://thaivis.breathoftravels.com/contact' }]
            }
        case '/about':
            return {
                items: [...baseBreadcrumb, { name: 'About Us', url: 'https://thaivis.breathoftravels.com/about' }]
            }
        default:
            return { items: baseBreadcrumb }
    }
}
