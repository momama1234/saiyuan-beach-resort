import { fireEvent, render, screen } from '@testing-library/react'

import { PaymentCancelledModal } from './PaymentCancelledModal'

jest.mock('next-intl', () => {
    const messages: Record<string, string> = {
        title: 'Payment was not completed',
        description: 'Your booking is held — check your email for the payment link to try again.',
        descriptionWithCode:
            'Your booking {bookingCode} is held — check your email for the payment link to try again.',
        close: 'Close',
        resumePayment: 'Resume payment'
    }

    const interpolate = (template: string, values?: Record<string, unknown>) => {
        if (!values) return template
        return template.replace(/\{(\w+)\}/g, (_, key) =>
            values[key] !== undefined ? String(values[key]) : `{${key}}`
        )
    }

    return {
        useTranslations: () => {
            const translate = (key: string, values?: Record<string, unknown>) =>
                interpolate(messages[key] ?? key, values)
            translate.rich = (key: string) => key
            return translate
        }
    }
})

describe('PaymentCancelledModal', () => {
    it('renders the warning when open', () => {
        render(
            <PaymentCancelledModal
                open={true}
                bookingCode="SBR-AB2K3P7Q"
                paymentUrl={null}
                onResume={() => {}}
                onClose={() => {}}
            />
        )
        expect(screen.getByText(/payment was not completed/i)).toBeInTheDocument()
        // Two close affordances exist: Radix's built-in dialog X (sr-only "Close") and our footer "Close" button
        const closeButtons = screen.getAllByRole('button', { name: /close/i })
        expect(closeButtons.length).toBeGreaterThan(0)
    })

    it('hides Resume payment when paymentUrl is null', () => {
        render(
            <PaymentCancelledModal
                open={true}
                bookingCode="SBR-AB2K3P7Q"
                paymentUrl={null}
                onResume={() => {}}
                onClose={() => {}}
            />
        )
        expect(screen.queryByRole('button', { name: /resume payment/i })).not.toBeInTheDocument()
    })

    it('calls onResume when Resume payment clicked', () => {
        const onResume = jest.fn()
        render(
            <PaymentCancelledModal
                open={true}
                bookingCode="SBR-AB2K3P7Q"
                paymentUrl="https://checkout.stripe.com/x"
                onResume={onResume}
                onClose={() => {}}
            />
        )
        fireEvent.click(screen.getByRole('button', { name: /resume payment/i }))
        expect(onResume).toHaveBeenCalled()
    })
})
