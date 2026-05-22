import { getTranslations, setRequestLocale } from 'next-intl/server'

import MenuWrapper from '@/components/menu/MenuWrapper'
import SEOSchema from '@/components/SEOSchema'
import { fetchPolicies } from '@/features/policies/api'
import { PoliciesPage } from '@/features/policies/PoliciesPage'
import { generateSEOMetadata, getAlternateLocales } from '@/lib/seo'
import { SEOSchemaGenerator } from '@/lib/seo-schema'

interface PageProps {
    params: Promise<{ locale: string }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

const PAGE_METADATA: Record<'en' | 'th', { title: string; description: string }> = {
    en: {
        title: 'Property Policies',
        description: 'Cancellation, pet, refund, house, and check-in/check-out rules for your stay.'
    },
    th: {
        title: 'นโยบายของที่พัก',
        description: 'นโยบายการยกเลิก สัตว์เลี้ยง การคืนเงิน กฎของบ้าน และกฎเช็คอิน/เช็คเอาต์'
    }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const m = PAGE_METADATA[locale as 'en' | 'th'] ?? PAGE_METADATA.en
    return generateSEOMetadata({
        title: m.title,
        description: m.description,
        canonical: locale === 'en' ? '/policies' : `/${locale}/policies`,
        locale,
        alternateLocales: getAlternateLocales('/policies')
    })
}

export default async function PropertyPoliciesPage({ params, searchParams }: PageProps): Promise<React.JSX.Element> {
    const { locale } = await params
    setRequestLocale(locale)

    const sp = await searchParams
    const previewMode = sp.preview === 'true'

    const policies = await fetchPolicies(locale)

    const t = await getTranslations({ locale, namespace: 'CancellationFAQ' })
    const faqSchema = SEOSchemaGenerator.generateFAQSchema({
        questions: [
            { question: t('q1'), answer: t('a1') },
            { question: t('q2'), answer: t('a2') },
            { question: t('q3'), answer: t('a3') },
            { question: t('q4'), answer: t('a4') }
        ]
    })

    return (
        <>
            <SEOSchema schema={faqSchema} />
            <MenuWrapper />
            <PoliciesPage policies={policies} previewMode={previewMode} />
        </>
    )
}
