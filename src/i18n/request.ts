import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    const localeFromRequest = await requestLocale

    const isSupportedLocale = (value: unknown): value is (typeof routing.locales)[number] =>
        typeof value === 'string' && routing.locales.includes(value as (typeof routing.locales)[number])

    // Ensure that the incoming locale is valid
    const locale = isSupportedLocale(localeFromRequest) ? localeFromRequest : routing.defaultLocale

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    }
})
