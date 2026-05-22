import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import ChooseRoomContent from '@/components/content/ChooseRoomContent'
import MenuWrapper from '@/components/menu/MenuWrapper'

export async function generateMetadata(): Promise<Metadata> {
    return { robots: { index: false, follow: false } }
}

interface ChooseRoomPageProps {
    params: Promise<{ locale: string }>
}

const ChooseRoomPage = async ({ params }: ChooseRoomPageProps): Promise<React.JSX.Element> => {
    const { locale } = await params
    setRequestLocale(locale)

    return (
        <>
            <MenuWrapper />
            <ChooseRoomContent />
        </>
    )
}

export default ChooseRoomPage
