import { Hotel, Organization, Restaurant, TouristAttraction, WithContext } from 'schema-dts'

export function generateHotelStructuredData(): WithContext<Hotel> {
    return {
        '@context': 'https://schema.org',
        '@type': 'Hotel',
        name: 'Saiyuan Beach Resort',
        description:
            "Experience luxury and tranquility in tropical paradise. Discover Saiyuan Beach Resort, where luxury meets the untouched beauty of Koh Libong's coastline. Our exclusive villas are designed to provide ultimate privacy, comfort, and tranquility—perfect for those seeking a serene getaway.",
        url: 'https://saiyuanbeachresort.com',
        telephone: '+66 95 0858899', // Replace with actual phone
        email: 'info@saiyuanbeachresort.com', // Replace with actual email
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Libong Island',
            addressLocality: 'Kantang District',
            addressRegion: 'Trang',
            postalCode: '92110',
            addressCountry: 'TH'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 7.2248425, // Replace with actual coordinates
            longitude: 99.3658881
        },
        image: [
            'https://saiyuanbeachresort.com/images/home_page_bg.webp',
            'https://saiyuanbeachresort.com/images/A5.webp',
            'https://saiyuanbeachresort.com/images/OA1.webp'
        ],
        priceRange: '$$$',
        starRating: {
            '@type': 'Rating',
            ratingValue: '5'
        },
        amenityFeature: [
            {
                '@type': 'LocationFeatureSpecification',
                name: 'Beach Access',
                value: true
            },
            {
                '@type': 'LocationFeatureSpecification',
                name: 'Restaurant',
                value: true
            },
            {
                '@type': 'LocationFeatureSpecification',
                name: 'Swimming Pool',
                value: true
            },
            {
                '@type': 'LocationFeatureSpecification',
                name: 'WiFi',
                value: true
            }
        ],
        checkinTime: '15:00',
        checkoutTime: '12:00',
        petsAllowed: false
    }
}

export function generateRestaurantStructuredData(): WithContext<Restaurant> {
    return {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: 'Saiyuan Beach Resort Restaurant',
        description: 'Beachfront restaurant serving fresh seafood and Thai cuisine',
        url: 'https://saiyuanbeachresort.com/dining',
        telephone: '+66 95 0858899',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Libong Island',
            addressLocality: 'Kantang District',
            addressRegion: 'Trang',
            postalCode: '92110',
            addressCountry: 'TH'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 7.2248425,
            longitude: 99.3658881
        },
        image: ['https://saiyuanbeachresort.com/images/R2.webp', 'https://saiyuanbeachresort.com/images/bg-gallery-02.jpg'],
        priceRange: '$$',
        servesCuisine: ['Thai', 'Seafood', 'International'],
        acceptsReservations: true,
        hasMenu: 'https://saiyuanbeachresort.com/dining'
    }
}

export function generateTouristAttractionStructuredData(): WithContext<TouristAttraction> {
    return {
        '@context': 'https://schema.org',
        '@type': 'TouristAttraction',
        name: 'Libong Island',
        description: 'Beautiful island in Trang province known for dugong watching and pristine beaches',
        url: 'https://saiyuanbeachresort.com/libong',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Kantang District',
            addressRegion: 'Trang',
            addressCountry: 'TH'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 7.2248425,
            longitude: 99.3658881
        },
        image: [
            'https://saiyuanbeachresort.com/images/bg-gallery.jpg',
            'https://saiyuanbeachresort.com/images/bg-gallery-03.jpg'
        ],
        touristType: ['Beach Lovers', 'Nature Enthusiasts', 'Wildlife Watchers']
    }
}

export function generateOrganizationStructuredData(): WithContext<Organization> {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Saiyuan Beach Resort',
        url: 'https://saiyuanbeachresort.com',
        logo: 'https://saiyuanbeachresort.com/images/logo.png',
        description: 'Luxury beachfront resort on Libong Island, Trang, Thailand',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Libong Island',
            addressLocality: 'Kantang District',
            addressRegion: 'Trang',
            postalCode: '92110',
            addressCountry: 'TH'
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+66 95 0858899',
            contactType: 'Customer Service',
            availableLanguage: ['English', 'Thai']
        },
        sameAs: ['https://www.facebook.com/Saiyuan Beach Resortbeachresortlibong']
    }
}
