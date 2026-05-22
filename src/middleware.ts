import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

export default createMiddleware({
    ...routing,
    // Disable locale detection completely - only use URL path
    localeDetection: false
})

export const config = {
    // Match only internationalized pathnames
    matcher: [
        // Enable a redirect to a matching locale at the root
        '/',

        // Handle Thai locale prefix (no cookie storage)
        '/(th)/:path*',

        // Enable redirects that add missing locales
        // (e.g. `/pathnames` -> `/pathnames` for en, `/th/pathnames` -> `/pathnames` for th when disabled)
        '/((?!_next|_vercel|api|.*\\..*).*)'
    ]
}
