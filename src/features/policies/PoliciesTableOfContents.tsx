'use client'

import type { MouseEvent } from 'react'
import { useEffect,useState } from 'react'

export interface SubItem {
    anchor: string
    title: string
}

export interface TocItem {
    anchor: string
    title: string
    subItems?: SubItem[]
}

interface PoliciesTableOfContentsProps {
    items: TocItem[]
}

export function PoliciesTableOfContents({ items }: PoliciesTableOfContentsProps) {
    const [activeAnchor, setActiveAnchor] = useState<string>(items[0]?.anchor ?? '')

    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') return

        const elements = items
            .map(({ anchor }) => document.getElementById(anchor))
            .filter((el): el is HTMLElement => el !== null)

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
                if (visible.length > 0) {
                    setActiveAnchor(visible[0]!.target.id)
                }
            },
            { rootMargin: '-80px 0px -50% 0px', threshold: 0 }
        )

        elements.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [items])

    const handleClick = (event: MouseEvent<HTMLAnchorElement>, anchor: string) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

        const target = document.getElementById(anchor)
        if (!target) return

        event.preventDefault()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        window.history.replaceState(null, '', `#${anchor}`)
        setActiveAnchor(anchor)
    }

    return (
        <nav aria-label="Policy sections" className="lg:sticky lg:top-16">
            <p className="mb-4 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                On this page
            </p>
            <ul className="space-y-0.5">
                {items.map((item) => {
                    const isActive = activeAnchor === item.anchor
                    return (
                        <li key={item.anchor}>
                            <a
                                href={`#${item.anchor}`}
                                onClick={(e) => handleClick(e, item.anchor)}
                                className={`block border-l-2 py-1 pl-3 text-sm transition-colors ${
                                    isActive
                                        ? 'border-orange-500 font-medium text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}>
                                {item.title}
                            </a>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}

export function PoliciesMobileNav({ items }: PoliciesTableOfContentsProps) {
    const [activeAnchor, setActiveAnchor] = useState<string>(items[0]?.anchor ?? '')

    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') return

        const elements = items
            .map(({ anchor }) => document.getElementById(anchor))
            .filter((el): el is HTMLElement => el !== null)

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
                if (visible.length > 0) {
                    setActiveAnchor(visible[0]!.target.id)
                }
            },
            { rootMargin: '-80px 0px -50% 0px', threshold: 0 }
        )

        elements.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [items])

    const handleClick = (event: MouseEvent<HTMLAnchorElement>, anchor: string) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

        const target = document.getElementById(anchor)
        if (!target) return

        event.preventDefault()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        window.history.replaceState(null, '', `#${anchor}`)
        setActiveAnchor(anchor)
    }

    return (
        <div className="sticky top-[42px] z-10 border-b border-gray-100 bg-white lg:hidden">
            <div className="flex gap-1 overflow-x-auto px-4 py-2.5 [&::-webkit-scrollbar]:hidden">
                {items.map((item) => {
                    const isActive = activeAnchor === item.anchor
                    return (
                        <a
                            key={item.anchor}
                            href={`#${item.anchor}`}
                            onClick={(e) => handleClick(e, item.anchor)}
                            className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${
                                isActive
                                    ? 'border-orange-500 bg-orange-50 font-medium text-[#0E7C86]'
                                    : 'border-gray-200 text-gray-500 hover:border-teal-200 hover:text-[#0a6570]'
                            }`}>
                            {item.title}
                        </a>
                    )
                })}
            </div>
        </div>
    )
}
