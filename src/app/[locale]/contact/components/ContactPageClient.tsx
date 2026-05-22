'use client'

import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { ContactForm } from './ContactForm'

export function ContactPageClient() {
    const t = useTranslations('ContactUs')
    const router = useRouter()
    const [submitted, setSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSuccess = () => {
        window.dispatchEvent(new CustomEvent('panel-hide'))
        setSubmitted(true)
    }

    return (
        <div className="md:flex md:h-full md:flex-col">
            {/* Header — not scrollable */}
            <div className="shrink-0 px-6 pt-6 pb-4">
                <h1 className="mb-1 text-2xl font-bold text-[#0E7C86]">{t('pageTitle')}</h1>
                <p className="text-white">{t('pageSubtitle')}</p>
            </div>

            {/* Form fields — scrollable */}
            <div className="md:scrollbar-thin md:scrollbar-thumb-transparent md:scrollbar-track-transparent flex-1 overflow-y-auto px-6">
                <ContactForm
                    formId="contact-form"
                    onSuccess={handleSuccess}
                    onSubmittingChange={setIsSubmitting}
                />
            </div>

            {/* Submit button — not scrollable, always visible */}
            <div className="shrink-0 px-6 pt-4 pb-6">
                <button
                    form="contact-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer rounded-md bg-[#0E7C86] px-8 py-3 font-semibold text-white hover:bg-[#0a6570] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? t('submitting') : t('submit')}
                </button>
            </div>

            {submitted && createPortal(
                <div
                    data-testid="success-state"
                    className="absolute inset-0 z-[100] flex items-center justify-center px-6"
                >
                    <div className="w-full max-w-xl rounded-xl bg-black/75 px-10 py-12 text-center">
                        <h2 className="mb-2 text-5xl font-light text-[#0E7C86]">{t('successTitle')}</h2>
                        <p className="mb-6 text-2xl font-light text-white">{t('successSubtitle')}</p>
                        <p className="mb-10 text-base leading-relaxed font-light text-white">{t('successBody')}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#0E7C86] px-8 py-3 text-base font-light text-white transition-colors hover:bg-[#0a6570]"
                        >
                            {t('returnHome')}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>,
                document.getElementById('page-template')!
            )}
        </div>
    )
}
