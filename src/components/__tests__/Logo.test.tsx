import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import messages from '../../../messages/en.json'
import Logo from '../Logo'

describe('Logo', () => {
    it('renders the logo', () => {
        render(
            <NextIntlClientProvider locale="en" messages={messages}>
                <Logo />
            </NextIntlClientProvider>
        )
        const logo = screen.getByRole('img')
        expect(logo).toBeInTheDocument()
    })
})
