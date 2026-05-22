import Link from 'next/link'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

import Footer from '@/components/Footer'
import MenuWrapper from '@/components/menu/MenuWrapper'

const NotFound = async (): Promise<React.JSX.Element> => {
    // Set default locale to English for not-found page
    const locale = 'en'
    setRequestLocale(locale)

    // Get messages for the locale
    const messages = await getMessages()
    return (
        <>
            <NextIntlClientProvider messages={messages}>
                <div className="fixed top-0 left-0 w-full overflow-hidden md:relative md:top-0 md:left-0">
                    <MenuWrapper />
                    <Link href="/" className="fixed top-[52px] right-4 cursor-pointer md:top-[62px] md:right-10">
                        <span className="font-cormorant text-xl font-semibold tracking-wide text-[#0E7C86]">
                            Saiyuan Beach Resort
                        </span>
                    </Link>
                    <div className="relative flex h-[40vh] items-center justify-center bg-black/90 md:h-screen">
                        <div className="animate-fade-in text-center">
                            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">404</h1>
                            <p className="mb-8 text-xl text-white/80 md:text-2xl">Page not found</p>
                            <Link
                                href="/"
                                className="inline-block cursor-pointer rounded-lg border border-white/20 px-6 py-3 text-sm text-white transition-colors hover:bg-white/10 md:text-base">
                                Return Home
                            </Link>
                        </div>
                    </div>
                </div>
            </NextIntlClientProvider>
            <Footer />
        </>
    )
}

export default NotFound
