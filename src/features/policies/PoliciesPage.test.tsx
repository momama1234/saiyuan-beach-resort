import { render, screen, within } from '@testing-library/react'

// Mock react-markdown — it ships ESM-only and the project's Jest config does not
// transform it. The library's markdown→HTML behavior is its own concern; here
// we only verify our PoliciesPage routes the right content into a renderer.
jest.mock('react-markdown', () => ({
    __esModule: true,
    default: ({ children }: { children: string }) => (
        <div data-testid="markdown-content" data-markdown-source={children}>
            {children}
        </div>
    )
}))

import { PoliciesPage } from './PoliciesPage'

const emptyPolicies = {
    cancellation: '',
    pet: '',
    refund: '',
    house_rules: '',
    checkin_checkout: '',
    privacy: ''
}

const allPolicies = {
    cancellation: 'Cancel content',
    pet: 'Pet content',
    refund: 'Refund content',
    house_rules: 'House rules content',
    checkin_checkout: 'Check-in/out content',
    privacy: 'Privacy content'
}

describe('PoliciesPage', () => {
    describe('all sections present', () => {
        it('renders every section in fixed order with kebab-case anchor ids', () => {
            render(<PoliciesPage policies={allPolicies} />)

            const articles = screen.getAllByRole('article')
            expect(articles).toHaveLength(6)
            expect(articles.map((a) => a.id)).toEqual([
                'cancellation',
                'pet',
                'refund',
                'house-rules',
                'checkin-checkout',
                'privacy'
            ])
        })

        it('renders a table-of-contents nav with one link per non-empty section', () => {
            render(<PoliciesPage policies={allPolicies} />)

            const toc = screen.getByRole('navigation', { name: 'Policy sections' })
            const links = within(toc).getAllByRole('link')
            expect(links.map((a) => a.getAttribute('href'))).toEqual([
                '#cancellation',
                '#pet',
                '#refund',
                '#house-rules',
                '#checkin-checkout',
                '#privacy'
            ])
        })

        it('passes admin-authored markdown source through to the renderer for each section', () => {
            render(<PoliciesPage policies={allPolicies} />)

            const renderers = screen.getAllByTestId('markdown-content')
            const sources = renderers.map((r) => r.getAttribute('data-markdown-source'))
            expect(sources).toEqual([
                'Cancel content',
                'Pet content',
                'Refund content',
                'House rules content',
                'Check-in/out content',
                'Privacy content'
            ])
        })
    })

    describe('partial coverage', () => {
        it('only renders sections with non-empty content (cancellation + house_rules only)', () => {
            render(
                <PoliciesPage
                    policies={{
                        ...emptyPolicies,
                        cancellation: 'Cancel only',
                        house_rules: 'House only'
                    }}
                />
            )

            const articles = screen.getAllByRole('article')
            expect(articles.map((a) => a.id)).toEqual(['cancellation', 'house-rules'])

            const toc = screen.getByRole('navigation', { name: 'Policy sections' })
            const links = within(toc).getAllByRole('link')
            expect(links.map((a) => a.textContent)).toEqual(['Cancellation Policy', 'House Rules'])
        })

        it('hides sections with whitespace-only content', () => {
            render(
                <PoliciesPage
                    policies={{
                        ...emptyPolicies,
                        cancellation: 'Cancel content',
                        pet: '   \n  '
                    }}
                />
            )

            expect(screen.queryByRole('heading', { level: 2, name: 'Pet Policy' })).not.toBeInTheDocument()
        })
    })

    describe('empty', () => {
        it('renders the empty-state message and no sections or nav', () => {
            render(<PoliciesPage policies={emptyPolicies} />)

            expect(screen.queryAllByRole('article')).toHaveLength(0)
            expect(screen.queryByRole('navigation', { name: 'Policy sections' })).not.toBeInTheDocument()
            expect(screen.getByText(/No policies have been published yet/i)).toBeInTheDocument()
        })
    })

    describe('previewMode', () => {
        it('renders every section even when content is empty, with a "no content yet" placeholder', () => {
            render(<PoliciesPage policies={emptyPolicies} previewMode />)

            const articles = screen.getAllByRole('article')
            expect(articles).toHaveLength(6)
            expect(articles.map((a) => a.id)).toEqual([
                'cancellation',
                'pet',
                'refund',
                'house-rules',
                'checkin-checkout',
                'privacy'
            ])
            expect(screen.getAllByText(/No content yet/i)).toHaveLength(6)
        })

        it('renders authored content normally and only shows the placeholder for empty sections', () => {
            render(<PoliciesPage policies={{ ...emptyPolicies, cancellation: 'Cancel content' }} previewMode />)

            expect(screen.getAllByRole('article')).toHaveLength(6)
            // Authored markdown is rendered through our react-markdown mock.
            expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
            // The other empty sections show the placeholder; cancellation does not.
            expect(screen.getAllByText(/No content yet/i)).toHaveLength(5)
        })
    })
})
