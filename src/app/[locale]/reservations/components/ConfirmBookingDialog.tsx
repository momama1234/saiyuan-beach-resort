'use client'

import { ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'

interface ConfirmBookingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    isLoading?: boolean
    variant?: 'continue' | 'back'
}

export const ConfirmBookingDialog = ({
    open,
    onOpenChange,
    onConfirm,
    isLoading,
    variant = 'continue'
}: ConfirmBookingDialogProps) => {
    const t = useTranslations('BookingSteps')
    const [isChecked, setIsChecked] = useState(false)
    const dialogKeyPrefix = variant === 'back' ? 'backConfirmDialog' : 'confirmDialog'

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setIsChecked(false)
        }
        onOpenChange(newOpen)
    }

    const handleConfirm = () => {
        if (isChecked) {
            onConfirm()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="py-10 max-sm:inset-0 max-sm:flex max-sm:h-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:flex-col max-sm:rounded-none sm:max-w-[620px]">
                <DialogHeader className="items-center pt-2">
                    {/* Icon */}
                    <div className="mb-4">
                        <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M46.9336 88.0664C70.7185 88.0664 90 68.7849 90 45C90 21.2151 70.7185 1.93359 46.9336 1.93359C23.1487 1.93359 3.86719 21.2151 3.86719 45C3.86719 68.7849 23.1487 88.0664 46.9336 88.0664Z"
                                fill="#F69B7B"
                            />
                            <path
                                d="M46.9336 7.73438C26.3524 7.73438 9.66797 24.4188 9.66797 45C9.66797 46.5347 9.76271 48.0472 9.94307 49.5334C11.9452 48.6536 14.1562 48.1641 16.4795 48.1641C25.4695 48.1641 32.7832 55.4778 32.7832 64.4678C32.7832 69.3169 30.6545 73.6775 27.2834 76.6666C32.9883 80.2144 39.7209 82.2656 46.9336 82.2656C67.5148 82.2656 84.1992 65.5812 84.1992 45C84.1992 24.4188 67.5148 7.73438 46.9336 7.73438Z"
                                fill="#F16737"
                            />
                            <path
                                d="M46.9336 13.0078C29.2648 13.0078 14.9414 27.3312 14.9414 45C14.9414 46.0879 14.9963 47.1628 15.1022 48.2228C15.5603 48.184 16.0198 48.1644 16.4795 48.1641C25.4695 48.1641 32.7832 55.4778 32.7832 64.4678C32.7832 67.4012 32.004 70.1561 30.6424 72.5367C35.4143 75.366 40.9836 76.9922 46.9336 76.9922C64.6024 76.9922 78.9258 62.6688 78.9258 45C78.9258 27.3312 64.6024 13.0078 46.9336 13.0078Z"
                                fill="#01D0FB"
                            />
                            <path
                                d="M34.9189 65.3251C34.1754 64.8839 33.46 64.4008 32.7716 63.8833C32.7785 64.0774 32.7832 64.2721 32.7832 64.4678C32.7832 67.4012 32.004 70.1561 30.6424 72.5367C35.4143 75.366 40.9837 76.9922 46.9336 76.9922C49.0644 76.9929 51.1901 76.7818 53.2791 76.3618C45.9373 74.8842 39.5054 70.8931 34.9189 65.3251ZM16.4795 48.1641C19.1241 48.1641 21.6234 48.7976 23.8344 49.9199C23.4899 48.3026 23.3163 46.6536 23.3163 45C23.3163 36.3616 27.9791 28.793 34.9189 24.6749C39.5054 19.1069 45.9373 15.1156 53.2791 13.6382C51.1901 13.2182 49.0644 13.0071 46.9336 13.0078C29.2648 13.0078 14.9414 27.3312 14.9414 45C14.9414 46.0879 14.9963 47.1628 15.1022 48.2228C15.5603 48.184 16.0198 48.1644 16.4795 48.1641Z"
                                fill="#01C0FA"
                            />
                            <path
                                d="M46.9337 21.3828C33.9109 21.3828 23.3164 31.9773 23.3164 45.0001C23.3164 46.6867 23.4955 48.332 23.8332 49.9195C28.9766 52.5298 32.5576 57.7882 32.7719 63.8886C36.7203 66.8565 41.6251 68.6175 46.9337 68.6175C59.9564 68.6175 70.5509 58.023 70.5509 45.0003C70.5509 31.9775 59.9564 21.3828 46.9337 21.3828Z"
                                fill="white"
                            />
                            <path
                                d="M31.3449 45.0001C31.3449 33.3444 39.8326 23.6351 50.9517 21.7251C49.6245 21.4969 48.2803 21.3824 46.9337 21.3828C33.9111 21.3828 23.3164 31.9773 23.3164 45.0001C23.3164 46.6867 23.4955 48.332 23.8332 49.9195C28.9766 52.5298 32.5576 57.7882 32.7719 63.8886C36.7203 66.8565 41.6251 68.6175 46.9337 68.6175C48.303 68.6175 49.6454 68.5001 50.9517 68.2753C39.8326 66.3651 31.3449 56.6558 31.3449 45.0001Z"
                                fill="#F3F0F3"
                            />
                            <path
                                d="M34.1311 57.8021C33.4457 57.1167 32.3305 57.1167 31.6452 57.8021C31.5761 57.872 31.513 57.9477 31.4565 58.0282C31.8313 58.8962 32.1292 59.7954 32.3469 60.7155C32.9551 60.9115 33.6492 60.77 34.1312 60.288C34.8164 59.6026 34.8164 58.4875 34.1311 57.8021Z"
                                fill="#99E6FC"
                            />
                            <path
                                d="M46.9336 58.5352C54.4089 58.5352 60.4688 52.4753 60.4688 45C60.4688 37.5247 54.4089 31.4648 46.9336 31.4648C39.4583 31.4648 33.3984 37.5247 33.3984 45C33.3984 52.4753 39.4583 58.5352 46.9336 58.5352Z"
                                fill="#DFF6FD"
                            />
                            <path
                                d="M40.4297 44.9996C40.4297 41.0997 42.0882 37.5811 44.7363 35.1096V31.6455C38.3147 32.6986 33.3984 38.2846 33.3984 44.9996C33.3984 52.4629 39.4703 58.5348 46.9336 58.5348C48.1495 58.5348 49.3274 58.3709 50.4492 58.0689C44.6854 56.5168 40.4297 51.2471 40.4297 44.9996Z"
                                fill="#C8EFFE"
                            />
                            <path
                                d="M61.9186 47.1973H46.9336C45.72 47.1973 44.7363 46.2136 44.7363 45V24.7852C44.7363 24.5521 44.8289 24.3285 44.9938 24.1637C45.1586 23.9988 45.3821 23.9062 45.6152 23.9062H48.252C48.4851 23.9062 48.7086 23.9988 48.8734 24.1637C49.0383 24.3285 49.1309 24.5521 49.1309 24.7852V42.8027H61.9186C62.1517 42.8027 62.3752 42.8953 62.5401 43.0602C62.7049 43.225 62.7975 43.4485 62.7975 43.6816V46.3184C62.7975 46.5515 62.7049 46.775 62.5401 46.9398C62.3752 47.1047 62.1517 47.1973 61.9186 47.1973Z"
                                fill="#08A9F1"
                            />
                            <path
                                d="M16.4795 80.9473C25.5809 80.9473 32.959 73.5691 32.959 64.4678C32.959 55.3664 25.5809 47.9883 16.4795 47.9883C7.37812 47.9883 0 55.3664 0 64.4678C0 73.5691 7.37812 80.9473 16.4795 80.9473Z"
                                fill="#05E39C"
                            />
                            <path
                                d="M8.96484 64.4678C8.96484 56.9203 14.0389 50.558 20.9619 48.6056C19.5032 48.1948 17.9949 47.9871 16.4795 47.9883C7.37807 47.9883 0 55.3664 0 64.4678C0 73.5692 7.37807 80.9473 16.4795 80.9473C17.9949 80.9484 19.5032 80.7407 20.9619 80.3299C14.0389 78.3775 8.96484 72.0153 8.96484 64.4678Z"
                                fill="#0ED290"
                            />
                            <path
                                d="M14.8821 71.9224C14.416 71.9223 13.9689 71.7371 13.6392 71.4075L6.06162 63.8299C5.8968 63.6651 5.8042 63.4415 5.8042 63.2084C5.8042 62.9753 5.8968 62.7518 6.06162 62.587L7.30457 61.3438C7.46939 61.179 7.69295 61.0864 7.92604 61.0864C8.15914 61.0864 8.38269 61.179 8.54752 61.3438L14.882 67.6785L24.4112 58.149C24.5761 57.9842 24.7996 57.8916 25.0327 57.8916C25.2658 57.8916 25.4894 57.9842 25.6542 58.149L26.8971 59.392C27.062 59.5568 27.1546 59.7803 27.1546 60.0134C27.1546 60.2465 27.062 60.4701 26.8971 60.6349L16.1251 71.4075C15.7954 71.7371 15.3483 71.9223 14.8821 71.9224Z"
                                fill="white"
                            />
                            <path
                                d="M46.9336 66.6211C47.9044 66.6211 48.6914 65.8341 48.6914 64.8633C48.6914 63.8925 47.9044 63.1055 46.9336 63.1055C45.9628 63.1055 45.1758 63.8925 45.1758 64.8633C45.1758 65.8341 45.9628 66.6211 46.9336 66.6211Z"
                                fill="#99E6FC"
                            />
                            <path
                                d="M27.0703 46.7578C28.0411 46.7578 28.8281 45.9708 28.8281 45C28.8281 44.0292 28.0411 43.2422 27.0703 43.2422C26.0995 43.2422 25.3125 44.0292 25.3125 45C25.3125 45.9708 26.0995 46.7578 27.0703 46.7578Z"
                                fill="#99E6FC"
                            />
                            <path
                                d="M32.8882 32.7119C33.859 32.7119 34.646 31.9249 34.646 30.9541C34.646 29.9833 33.859 29.1963 32.8882 29.1963C31.9174 29.1963 31.1304 29.9833 31.1304 30.9541C31.1304 31.9249 31.9174 32.7119 32.8882 32.7119Z"
                                fill="#99E6FC"
                            />
                            <path
                                d="M60.979 32.7119C61.9498 32.7119 62.7368 31.9249 62.7368 30.9541C62.7368 29.9833 61.9498 29.1963 60.979 29.1963C60.0082 29.1963 59.2212 29.9833 59.2212 30.9541C59.2212 31.9249 60.0082 32.7119 60.979 32.7119Z"
                                fill="#99E6FC"
                            />
                            <path
                                d="M66.7969 46.7578C67.7677 46.7578 68.5547 45.9708 68.5547 45C68.5547 44.0292 67.7677 43.2422 66.7969 43.2422C65.8261 43.2422 65.0391 44.0292 65.0391 45C65.0391 45.9708 65.8261 46.7578 66.7969 46.7578Z"
                                fill="#99E6FC"
                            />
                            <path
                                d="M60.979 60.8027C61.9498 60.8027 62.7368 60.0157 62.7368 59.0449C62.7368 58.0741 61.9498 57.2871 60.979 57.2871C60.0082 57.2871 59.2212 58.0741 59.2212 59.0449C59.2212 60.0157 60.0082 60.8027 60.979 60.8027Z"
                                fill="#99E6FC"
                            />
                        </svg>
                    </div>

                    <DialogTitle className="text-center text-xl font-semibold">
                        {t(`${dialogKeyPrefix}.title`)}
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-center text-sm text-gray-500">
                        {t(`${dialogKeyPrefix}.description`)}
                    </DialogDescription>
                </DialogHeader>

                {/* Checkbox */}
                <div className="mt-2 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <Checkbox
                        id="confirm-understand"
                        checked={isChecked}
                        onCheckedChange={(checked) => setIsChecked(checked === true)}
                        className="mt-0.5 h-5 w-5 rounded-full border-teal-200 data-[state=checked]:border-orange-500 data-[state=checked]:bg-[#0E7C86]"
                    />
                    <label
                        htmlFor="confirm-understand"
                        className="cursor-pointer text-sm leading-relaxed text-gray-700">
                        {t.rich(`${dialogKeyPrefix}.checkboxLabel`, {
                            bold: (chunks) => <span className="font-semibold text-gray-900">{chunks}</span>
                        })}
                    </label>
                </div>

                <DialogFooter className="mt-4 flex flex-row items-center justify-between gap-2 max-sm:mt-auto sm:justify-between">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleOpenChange(false)}
                        className="flex cursor-pointer items-center gap-2 border-gray-200 px-4 text-gray-700 hover:bg-gray-100">
                        <ChevronLeft className="h-4 w-4" />
                        {t('back')}
                    </Button>
                    <Button
                        size="lg"
                        onClick={handleConfirm}
                        disabled={!isChecked || isLoading}
                        className="flex cursor-pointer items-center gap-2 bg-[#0E7C86] px-4 text-white hover:bg-[#0a6570] disabled:opacity-50">
                        {isLoading ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                {t('booking')}
                            </>
                        ) : (
                            t(`${dialogKeyPrefix}.continueButton`)
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
