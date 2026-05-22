import 'react-phone-number-input/style.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeSelector } from '@/features/reservation/components/TimeSelector'
import { createGuestSchema } from '@/features/reservation/schemas/guestSchema'
import { defaultInitState, useGuestInfoActions } from '@/features/reservation/stores/guest-info-store'

interface GuestInfo {
    firstName: string
    lastName: string
    email: string
    phone: string
    estimatedArrival?: string
    specialRequests?: string
}

export const GuestInfoForm = memo(() => {
    const guestInfoFormTrans = useTranslations('GuestInfoForm')
    const guestInfoActions = useGuestInfoActions()
    const guestSchema = useMemo(() => createGuestSchema(guestInfoFormTrans), [guestInfoFormTrans])

    const {
        watch,
        register,
        getValues,
        formState: { errors, isValid },
        trigger,
        setValue,
        control
    } = useForm<GuestInfo>({
        resolver: zodResolver(guestSchema),
        defaultValues: defaultInitState,
        mode: 'onChange'
    })

    const estimatedArrival = getValues('estimatedArrival')
    const specialRequests = getValues('specialRequests')
    const firstName = getValues('firstName')
    const lastName = getValues('lastName')
    const email = getValues('email')
    const phone = getValues('phone')

    useEffect(() => {
        guestInfoActions.setIsGuestInfoValid(isValid)
        guestInfoActions.setGuestInfo({ firstName, lastName, email, phone, estimatedArrival, specialRequests })
    }, [isValid, firstName, lastName, email, phone, guestInfoActions, estimatedArrival, specialRequests])

    return (
        <Card className="mb-6 w-full border-none px-0 py-0 shadow-none">
            <CardHeader className="px-0">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0E7C86]">
                    {guestInfoFormTrans('title')}
                </CardTitle>
                <span className="text-sm font-light text-gray-500">{guestInfoFormTrans('description')}</span>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
                            {guestInfoFormTrans('firstName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            {...register('firstName')}
                            onBlur={() => trigger('firstName')}
                            placeholder={guestInfoFormTrans('enterFirstName')}
                            required
                            aria-invalid={!!errors.firstName}
                            className={`h-11 w-full rounded-md border px-4 text-base text-gray-800 placeholder:text-sm placeholder:font-light placeholder:text-gray-400 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.firstName && (
                            <p className="mt-1 text-xs text-red-600">{errors.firstName.message as string}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
                            {guestInfoFormTrans('lastName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            {...register('lastName')}
                            onBlur={() => trigger('lastName')}
                            placeholder={guestInfoFormTrans('enterLastName')}
                            required
                            aria-invalid={!!errors.lastName}
                            className={`h-11 w-full rounded-md border px-4 text-base text-gray-800 placeholder:text-sm placeholder:font-light placeholder:text-gray-400 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.lastName && (
                            <p className="mt-1 text-xs text-red-600">{errors.lastName.message as string}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                            {guestInfoFormTrans('email')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register('email')}
                            onBlur={() => trigger('email')}
                            placeholder="example@email.com"
                            required
                            aria-invalid={!!errors.email}
                            className={`h-11 w-full rounded-md border px-4 text-base text-gray-800 placeholder:text-sm placeholder:font-light placeholder:text-gray-400 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message as string}</p>}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                            {guestInfoFormTrans('phone')} <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="phone"
                            control={control}
                            rules={{
                                required: guestInfoFormTrans('phoneRequired') || 'Phone number is required',
                                validate: (value) => isValidPhoneNumber(value || '') || 'Invalid phone number'
                            }}
                            render={({ field: { onChange, value } }) => (
                                <PhoneInput
                                    id="phone"
                                    placeholder="08X-XXX-XXXX (Optional)"
                                    value={value}
                                    onChange={onChange}
                                    defaultCountry="TH"
                                    international
                                    countryCallingCodeEditable={false}
                                    limitMaxLength={true}
                                    className={`\${ errors.phone ? 'border-red-500' : 'border-gray-300' } flex h-11
                                        w-full items-center rounded-md border border-gray-300
                                    px-4 [&_.PhoneInputCountry]:mr-2 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-gray-400`}
                                />
                            )}
                        />
                        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message as string}</p>}
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="estimatedArrival" className="mb-1 block text-sm font-medium text-gray-700">
                        {guestInfoFormTrans('estimatedArrival')}
                        <span className="mb-2 ml-2 text-xs font-normal text-gray-400">
                            ({guestInfoFormTrans('checkInTime')}: 14:00)
                        </span>
                    </label>
                    <div className="flex items-center gap-2">
                        <TimeSelector
                            id="estimatedArrival"
                            value={watch('estimatedArrival')}
                            onChange={(time) => setValue('estimatedArrival', time, { shouldDirty: true })}
                        />
                    </div>

                    <div className="text-xs font-light text-gray-500">{guestInfoFormTrans('noTimeProvided')}</div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="specialRequests" className="mb-1 block text-sm font-medium text-gray-700">
                        {guestInfoFormTrans('specialRequests')}
                    </label>
                    <textarea
                        id="specialRequests"
                        {...register('specialRequests')}
                        onBlur={() => trigger('specialRequests')}
                        placeholder={guestInfoFormTrans('specialRequestsPlaceholder')}
                        rows={4}
                        className="resize-vertical w-full rounded-md border border-gray-300 px-4 py-3 text-base text-gray-800 placeholder:text-sm placeholder:font-light placeholder:text-gray-400 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                </div>
            </CardContent>
        </Card>
    )
})

GuestInfoForm.displayName = 'GuestInfoForm'
