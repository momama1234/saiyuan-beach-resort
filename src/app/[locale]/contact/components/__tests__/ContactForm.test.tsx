import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import { postData } from '@/lib/api'

import { ContactForm } from '../ContactForm'

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

jest.mock('@/lib/api', () => ({
    postData: jest.fn()
}))

const mockPush = jest.fn()
const mockOnSuccess = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
})

function renderForm() {
    render(
        <>
            <ContactForm formId="test-form" onSuccess={mockOnSuccess} />
            <button form="test-form" type="submit">submit</button>
        </>
    )
}

function selectCategory(value: string) {
    fireEvent.click(screen.getByText('categoryPlaceholder'))
    fireEvent.click(screen.getByText(`categories.${value}`))
}

describe('ContactForm', () => {
    it('shows validation errors for all required fields on empty submit', async () => {
        renderForm()

        fireEvent.click(screen.getByRole('button', { name: 'submit' }))

        await waitFor(() => {
            const alerts = screen.getAllByRole('alert')
            expect(alerts.length).toBeGreaterThanOrEqual(4)
        })

        expect(screen.getByText('errors.firstNameRequired')).toBeInTheDocument()
        expect(screen.getByText('errors.lastNameRequired')).toBeInTheDocument()
        expect(screen.getByText('errors.emailRequired')).toBeInTheDocument()
        expect(screen.getByText('errors.messageMinLength')).toBeInTheDocument()
    })

    it('redirects to /contact-booking when Room/Booking Inquiry category is selected', async () => {
        renderForm()

        selectCategory('ROOM_BOOKING_INQUIRY')

        expect(mockPush).toHaveBeenCalledWith('/contact-booking')
    })

    it('calls onSuccess after successful submission', async () => {
        ;(postData as jest.Mock).mockResolvedValue({ success: true })

        renderForm()

        fireEvent.change(screen.getByLabelText('firstName'), { target: { value: 'Jane' } })
        fireEvent.change(screen.getByLabelText('lastName'), { target: { value: 'Doe' } })
        fireEvent.change(screen.getByLabelText('email'), { target: { value: 'jane@example.com' } })
        selectCategory('GENERAL_QUESTION')
        fireEvent.change(screen.getByLabelText('message'), {
            target: { value: 'Hello, I have a question about your property.' }
        })

        fireEvent.click(screen.getByRole('button', { name: 'submit' }))

        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalledTimes(1)
        })

        expect(postData).toHaveBeenCalledWith('/contact', expect.objectContaining({
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            category: 'GENERAL_QUESTION'
        }))
    })

    it('shows inline error message when API call fails', async () => {
        ;(postData as jest.Mock).mockRejectedValue(new Error('Network error'))

        renderForm()

        fireEvent.change(screen.getByLabelText('firstName'), { target: { value: 'Jane' } })
        fireEvent.change(screen.getByLabelText('lastName'), { target: { value: 'Doe' } })
        fireEvent.change(screen.getByLabelText('email'), { target: { value: 'jane@example.com' } })
        selectCategory('GENERAL_QUESTION')
        fireEvent.change(screen.getByLabelText('message'), {
            target: { value: 'Hello, I have a question about your property.' }
        })

        fireEvent.click(screen.getByRole('button', { name: 'submit' }))

        await waitFor(() => {
            expect(screen.getByText('errors.submitError')).toBeInTheDocument()
        })

        expect(mockOnSuccess).not.toHaveBeenCalled()
    })
})
