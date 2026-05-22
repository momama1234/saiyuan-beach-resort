import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'

import type { PoliciesResponse } from './api'
import { safePolicyUrlTransform } from './markdown-url-transform'
import type { TocItem } from './PoliciesTableOfContents'
import { PoliciesMobileNav,PoliciesTableOfContents } from './PoliciesTableOfContents'

interface PoliciesPageProps {
    policies: PoliciesResponse
    /**
     * When true, render every section — including ones with empty resolved
     * content — so an admin checking `/policies?preview=true` can see at a
     * glance which sections still need wording. Production guests get the
     * default (empty sections hidden).
     */
    previewMode?: boolean
}

interface SectionConfig {
    key: keyof PoliciesResponse
    anchor: string
    title: string
}

// Fixed render order — kebab-case anchors so an external link like
// `/policies#house-rules` works regardless of underlying API key shape.
const SECTIONS: SectionConfig[] = [
    { key: 'cancellation', anchor: 'cancellation', title: 'Cancellation Policy' },
    { key: 'pet', anchor: 'pet', title: 'Pet Policy' },
    { key: 'refund', anchor: 'refund', title: 'Refund Policy' },
    { key: 'house_rules', anchor: 'house-rules', title: 'House Rules' },
    { key: 'checkin_checkout', anchor: 'checkin-checkout', title: 'Check-in / Check-out Rules' },
    { key: 'privacy', anchor: 'privacy', title: 'Privacy Policy' }
]

const ALLOWED_MARKDOWN_ELEMENTS = [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'strong',
    'em',
    'blockquote',
    'code',
    'pre',
    'a',
    'br',
    'hr'
]

function headingToAnchor(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
}

function childrenToText(children: React.ReactNode): string {
    if (children === null || children === undefined) return ''
    if (typeof children === 'string') return children
    if (typeof children === 'number' || typeof children === 'boolean') return String(children)
    if (Array.isArray(children)) return (children as React.ReactNode[]).map(childrenToText).join('')
    if (typeof children === 'object' && children !== null && 'props' in children) {
        const el = children as { props: { children?: React.ReactNode } }
        return childrenToText(el.props.children)
    }
    return ''
}

function extractSubHeadings(markdown: string): Array<{ title: string; anchor: string }> {
    const headings: Array<{ title: string; anchor: string }> = []
    for (const line of markdown.split('\n')) {
        const match = line.match(/^#{2,3}\s+(.+)$/)
        if (match) {
            const title = match[1]!.trim()
            headings.push({ title, anchor: headingToAnchor(title) })
        }
    }
    return headings
}

const MARKDOWN_COMPONENTS: Components = {
    h2: (props) => {
        const { children } = props
        const id = headingToAnchor(childrenToText(children))
        return (
            <h2 id={id} className="mt-8 mb-3 scroll-mt-32 text-xl font-bold text-gray-900 lg:scroll-mt-24">
                {children}
            </h2>
        )
    },
    h3: (props) => {
        const { children } = props
        const id = headingToAnchor(childrenToText(children))
        return (
            <h3 id={id} className="mt-5 mb-2 scroll-mt-32 text-base font-semibold text-gray-800 lg:scroll-mt-24">
                {children}
            </h3>
        )
    }
}

export function PoliciesPage({ policies, previewMode = false }: PoliciesPageProps) {
    const visibleSections = previewMode
        ? SECTIONS
        : SECTIONS.filter((s) => policies[s.key].trim().length > 0)

    const tocItems: TocItem[] = visibleSections.map((s) => ({
        anchor: s.anchor,
        title: s.title,
        subItems: extractSubHeadings(policies[s.key])
    }))

    return (
        <div className="min-h-screen bg-white">
            <main className="pt-[42px]">
                {visibleSections.length > 0 && (
                    <PoliciesMobileNav items={tocItems} />
                )}
                <div className="mx-auto max-w-6xl px-6 py-12 lg:flex lg:gap-16 xl:gap-24">
                    {/* Sidebar TOC — hidden on mobile, sticky on desktop */}
                    {visibleSections.length > 0 && (
                        <aside className="hidden shrink-0 lg:block lg:w-52 xl:w-56">
                            <PoliciesTableOfContents items={tocItems} />
                        </aside>
                    )}

                    {/* Policy content */}
                    <div className="min-w-0 flex-1">
                        {visibleSections.length === 0 ? (
                            <p className="leading-relaxed text-gray-700">
                                No policies have been published yet. Please contact us for the latest terms.
                            </p>
                        ) : (
                            visibleSections.map((section, index) => {
                                const content = policies[section.key]
                                const isEmpty = content.trim().length === 0
                                return (
                                    <article
                                        key={section.key}
                                        id={section.anchor}
                                        className={`scroll-mt-32 lg:scroll-mt-24 ${
                                            index > 0 ? 'mt-16 border-t border-gray-100 pt-16' : ''
                                        }`}>
                                        <h2 className="mb-3 text-3xl font-bold text-gray-900">
                                            {section.title}
                                        </h2>
                                        <div className="prose max-w-none leading-relaxed text-gray-700 prose-gray prose-a:text-[#0a6570] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50/50 prose-blockquote:py-1 prose-strong:text-gray-900">
                                            {isEmpty ? (
                                                <p className="rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500 italic">
                                                    No content yet — admin can add wording for this section.
                                                </p>
                                            ) : (
                                                <ReactMarkdown
                                                    allowedElements={ALLOWED_MARKDOWN_ELEMENTS}
                                                    unwrapDisallowed
                                                    urlTransform={safePolicyUrlTransform}
                                                    components={MARKDOWN_COMPONENTS}>
                                                    {content}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                    </article>
                                )
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
