'use client'

import 'react-phone-number-input/style.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect,useRef, useState } from 'react'
import { Controller, type ControllerRenderProps,useForm } from 'react-hook-form'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import * as z from 'zod'

import { postData } from '@/lib/api'

const CATEGORIES = [
    'GENERAL_QUESTION',
    'ROOM_BOOKING_INQUIRY',
    'COMPLAINT',
    'COMPLIMENT',
    'PARTNERSHIP_BUSINESS',
    'ACCESSIBILITY_REQUEST'
] as const

function createContactSchema(t: (key: string) => string) {
    return z.object({
        firstName: z.string().min(1, t('errors.firstNameRequired')),
        lastName: z.string().min(1, t('errors.lastNameRequired')),
        email: z.string().min(1, t('errors.emailRequired')).email(t('errors.emailInvalid')),
        phone: z
            .string()
            .optional()
            .refine(
                (value) => {
                    if (!value) return true
                    const nationalDigits = value.replace(/^\+\d{1,3}/, '').replace(/\D/g, '')
                    if (!nationalDigits) return true
                    try {
                        return isValidPhoneNumber(value)
                    } catch {
                        return false
                    }
                },
                { message: t('errors.phoneInvalid') }
            )
            ,
        category: z.enum(CATEGORIES, { message: t('errors.categoryRequired') }),
        message: z.string().min(10, t('errors.messageMinLength'))
    })
}

type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>

interface ContactFormProps {
    onSuccess: () => void
    onSubmittingChange?: (isSubmitting: boolean) => void
    formId?: string
}

const inputClass = 'w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-red-500'
const labelClass = 'mb-1 block text-sm font-medium text-white'

interface CategoryDropdownProps {
    field: ControllerRenderProps<ContactFormValues, 'category'>
    t: (key: string) => string
    onSelect: (cat: string) => void
}

function CategoryDropdown({ field, t, onSelect }: CategoryDropdownProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const selected = field.value as string | undefined

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-white focus:outline-none ${open ? 'border-red-500 bg-black/70' : 'border-white/20 bg-black/50'}`}
            >
                <span className={selected ? 'text-white' : 'text-white/30'}>
                    {selected ? t(`categories.${selected}`) : t('categoryPlaceholder')}
                </span>
                <ChevronDown size={16} className={`shrink-0 text-white/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <ul className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-md border border-white/20 bg-neutral-900 shadow-lg">
                    {CATEGORIES.map((cat) => (
                        <li
                            key={cat}
                            onClick={() => {
                                field.onChange(cat)
                                setOpen(false)
                                onSelect(cat)
                            }}
                            className={`cursor-pointer px-3 py-2 text-sm transition-colors ${selected === cat ? 'bg-blue-400/30 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            {t(`categories.${cat}`)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export function ContactForm({ onSuccess, onSubmittingChange, formId }: ContactFormProps) {
    const t = useTranslations('ContactUs')
    const router = useRouter()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting }
    } = useForm<ContactFormValues>({
        resolver: zodResolver(createContactSchema(t))
    })

    useEffect(() => {
        onSubmittingChange?.(isSubmitting)
    }, [isSubmitting, onSubmittingChange])

    const onSubmit = async (data: ContactFormValues) => {
        setSubmitError(null)
        try {
            const nationalDigits = data.phone?.replace(/^\+\d{1,3}/, '').replace(/\D/g, '')
            await postData('/contact', { ...data, phone: nationalDigits ? data.phone : undefined })
            onSuccess()
        } catch {
            setSubmitError(t('errors.submitError'))
        }
    }

    return (
        <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="firstName" className={labelClass}>
                        {t('firstName')}
                    </label>
                    <input
                        id="firstName"
                        type="text"
                        placeholder={t('firstNamePlaceholder')}
                        className={inputClass}
                        {...register('firstName')}
                    />
                    {errors.firstName && (
                        <p role="alert" className="mt-1 text-sm text-red-400">
                            {errors.firstName.message}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="lastName" className={labelClass}>
                        {t('lastName')}
                    </label>
                    <input
                        id="lastName"
                        type="text"
                        placeholder={t('lastNamePlaceholder')}
                        className={inputClass}
                        {...register('lastName')}
                    />
                    {errors.lastName && (
                        <p role="alert" className="mt-1 text-sm text-red-400">
                            {errors.lastName.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <label htmlFor="email" className={labelClass}>
                    {t('email')}
                </label>
                <input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    className={inputClass}
                    {...register('email')}
                />
                {errors.email && (
                    <p role="alert" className="mt-1 text-sm text-red-400">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div className="mt-4">
                <label htmlFor="phone" className={labelClass}>
                    {t('phone')} <span className="font-normal text-white/50">({t('optional')})</span>
                </label>
                <Controller
                    name="phone"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <PhoneInput
                            id="phone"
                            placeholder={t('phonePlaceholder')}
                            value={value}
                            onChange={onChange}
                            defaultCountry="TH"
                            international
                            countryCallingCodeEditable={false}
                            limitMaxLength={true}
                            className={`flex h-11 w-full items-center rounded-md border bg-black/50 px-4 text-white
                                [&_.PhoneInputCountry]:mr-2
                                [&_.PhoneInputCountrySelect]:bg-neutral-900
                                [&_.PhoneInputCountrySelect]:text-white
                                [&_.PhoneInputInput]:bg-transparent
                                [&_.PhoneInputInput]:text-white
                                [&_.PhoneInputInput]:outline-none
                                [&_.PhoneInputInput]:placeholder:text-white/30
                                ${errors.phone ? 'border-red-400' : 'border-white/20'}`}
                        />
                    )}
                />
                {errors.phone && (
                    <p role="alert" className="mt-1 text-sm text-red-400">
                        {errors.phone.message}
                    </p>
                )}
            </div>

            <div className="mt-4">
                <label className={labelClass}>{t('category')}</label>
                <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                        <CategoryDropdown
                            field={field}
                            t={t}
                            onSelect={(cat) => {
                                if (cat === 'ROOM_BOOKING_INQUIRY') router.push('/contact-booking')
                            }}
                        />
                    )}
                />
                {errors.category && (
                    <p role="alert" className="mt-1 text-sm text-red-400">
                        {errors.category.message}
                    </p>
                )}
            </div>

            <div className="mt-4">
                <label htmlFor="message" className={labelClass}>
                    {t('message')}
                </label>
                <textarea
                    id="message"
                    rows={5}
                    placeholder={t('messagePlaceholder')}
                    className={inputClass}
                    {...register('message')}
                />
                {errors.message && (
                    <p role="alert" className="mt-1 text-sm text-red-400">
                        {errors.message.message}
                    </p>
                )}
            </div>

            {submitError && (
                <p role="alert" className="mt-4 text-sm text-red-400">
                    {submitError}
                </p>
            )}

        </form>
    )
}
