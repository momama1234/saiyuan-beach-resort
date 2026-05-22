import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: false
    },
    eslint: {
        // Temporarily ignore ESLint during builds to prevent FlatCompat error
        ignoreDuringBuilds: true
    },
    poweredByHeader: false,
    compress: true,
    images: {
        unoptimized: true,
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '9000',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'cdn.thaivis.com',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'dev-image.thaivis.com',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**'
            }
        ]
    },
    experimental: {
        optimizePackageImports: [
            '@radix-ui/react-icons',
            'lucide-react',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            'react-day-picker',
            'date-fns'
        ],
        webVitalsAttribution: ['CLS', 'LCP']
    },
    logging: {
        fetches: {
            fullUrl: process.env.NODE_ENV === 'development'
        }
    },
    // Handle build-time API failures gracefully
    onDemandEntries: {
        // Period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 25 * 1000,
        // Number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 2
    }
}

export default withNextIntl(nextConfig)
