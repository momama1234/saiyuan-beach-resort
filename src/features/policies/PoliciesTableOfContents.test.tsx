import { fireEvent, render, screen } from '@testing-library/react'

import { PoliciesTableOfContents } from './PoliciesTableOfContents'

const items = [
    { anchor: 'cancellation', title: 'Cancellation Policy' },
    { anchor: 'pet', title: 'Pet Policy' }
]

describe('PoliciesTableOfContents', () => {
    let scrollIntoViewMock: jest.Mock
    let replaceStateMock: jest.Mock

    beforeEach(() => {
        scrollIntoViewMock = jest.fn()
        Element.prototype.scrollIntoView = scrollIntoViewMock

        replaceStateMock = jest.fn()
        Object.defineProperty(window, 'history', {
            writable: true,
            value: { ...window.history, replaceState: replaceStateMock }
        })

        // Render fake target sections so getElementById finds them.
        const fixture = document.createElement('div')
        fixture.innerHTML = `
            <article id="cancellation"></article>
            <article id="pet"></article>
        `
        document.body.appendChild(fixture)
    })

    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('renders one anchor link per item with the matching href', () => {
        render(<PoliciesTableOfContents items={items} />)

        expect(screen.getByRole('link', { name: /Cancellation Policy/i })).toHaveAttribute('href', '#cancellation')
        expect(screen.getByRole('link', { name: /Pet Policy/i })).toHaveAttribute('href', '#pet')
    })

    it('calls scrollIntoView with smooth behavior and updates the URL hash on click', () => {
        render(<PoliciesTableOfContents items={items} />)

        fireEvent.click(screen.getByRole('link', { name: /Cancellation Policy/i }))

        expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)
        expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
        expect(replaceStateMock).toHaveBeenCalledWith(null, '', '#cancellation')
    })

    it('does not intercept modifier-clicks (e.g. cmd-click to open in new tab)', () => {
        render(<PoliciesTableOfContents items={items} />)

        fireEvent.click(screen.getByRole('link', { name: /Pet Policy/i }), { metaKey: true })

        expect(scrollIntoViewMock).not.toHaveBeenCalled()
        expect(replaceStateMock).not.toHaveBeenCalled()
    })

    it('does nothing when the target section is not in the DOM', () => {
        render(<PoliciesTableOfContents items={[{ anchor: 'missing', title: 'Missing' }]} />)

        fireEvent.click(screen.getByRole('link', { name: /Missing/i }))

        expect(scrollIntoViewMock).not.toHaveBeenCalled()
        expect(replaceStateMock).not.toHaveBeenCalled()
    })
})
