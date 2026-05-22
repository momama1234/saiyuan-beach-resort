import { isValidPhoneNumber } from 'libphonenumber-js'
import * as z from 'zod'

export const createGuestSchema = (t: (_key: string) => string) => {
    return z.object({
        firstName: z
            .string()
            .min(1, t('firstNameRequired'))
            .max(50, t('firstNameTooLong'))
            .regex(/^[A-Za-z\u0E00-\u0E7F\s]+$/, { message: t('firstNameInvalidChars') }),
        lastName: z
            .string()
            .min(1, t('lastNameRequired'))
            .max(50, t('lastNameTooLong'))
            .regex(/^[A-Za-z\u0E00-\u0E7F\s]+$/, { message: t('lastNameInvalidChars') }),
        email: z.email({ message: t('emailInvalid') }),
        phone: z
            .string('Please enter a valid phone number')
            .min(1, t('phoneInvalid'))
            .refine(
                (value) => {
                    try {
                        // Try to parse the phone number
                        // isValidPhoneNumber can validate numbers from any country
                        return isValidPhoneNumber(value)
                    } catch {
                        return false
                    }
                },
                { message: t('phoneInvalid') }
            ),
        estimatedArrival: z.string().optional(),
        specialRequests: z.string().optional()
    })
}
