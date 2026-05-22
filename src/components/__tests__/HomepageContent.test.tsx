import { fireEvent, render, screen } from '@testing-library/react'

import HomepageContent from '../HomepageContent'

describe('HomepageContent', () => {
    it('renders backend-sanitized description without &nbsp; or &#160; entities', () => {
        const sanitizedHtml = '<p>Hello World End</p>'
        const { container } = render(<HomepageContent description={sanitizedHtml} name="Test" />)

        const prose = container.querySelector('.prose')
        expect(prose?.innerHTML).not.toContain('&nbsp;')
        expect(prose?.innerHTML).not.toContain('&#160;')
    })

    it('renders fallback content open by default', () => {
        render(<HomepageContent description="" name="Villa" />)

        expect(screen.getByText('description')).toBeInTheDocument()
    })

    it('lets the user manually toggle the panel via the desktop close/reopen button', () => {
        render(<HomepageContent description="" name="Villa" />)

        const toggle = screen.getAllByLabelText('hideContent')[0]!
        fireEvent.click(toggle)
        expect(screen.queryByText('description')).not.toBeInTheDocument()

        const reopen = screen.getAllByLabelText('showContent')[0]!
        fireEvent.click(reopen)
        expect(screen.getByText('description')).toBeInTheDocument()
    })
})
