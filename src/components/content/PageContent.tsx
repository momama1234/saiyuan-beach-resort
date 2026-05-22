'use client'

import { ChevronLeft, ChevronRight, Plus, Search, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { PanelToggleContext } from '@/components/PageTemplate/PanelToggleContext'

interface ContentSection {
    title?: string
    content: string | string[]
    images?: Array<{
        src: string
        lightboxSrc?: string
        alt: string
        isModalEnabled?: boolean
        zoomScale?: number
    }>
}

interface PageContentProps {
    title: string
    subtitle?: string
    sections: ContentSection[]
}

interface LightboxState {
    images: Array<{ src: string; alt: string; zoomScale?: number }>
    index: number
}

function Lightbox({
    state,
    onClose,
}: {
    state: LightboxState
    onClose: () => void
}) {
    const [zoomed, setZoomed] = useState(false)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const { images, index: initialIndex } = state
    const [current, setCurrent] = useState(initialIndex)

    const [isDragging, setIsDragging] = useState(false)
    const dragStart = useRef<{ x: number; y: number } | null>(null)
    const dragOrigin = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
    const hasDragged = useRef(false)
    const swipeStart = useRef<{ x: number; y: number } | null>(null)

    const resetPan = useCallback(() => setOffset({ x: 0, y: 0 }), [])

    const prev = useCallback(() => {
        setZoomed(false)
        resetPan()
        setCurrent((i) => (i === 0 ? images.length - 1 : i - 1))
    }, [images.length, resetPan])

    const next = useCallback(() => {
        setZoomed(false)
        resetPan()
        setCurrent((i) => (i === images.length - 1 ? 0 : i + 1))
    }, [images.length, resetPan])

    useEffect(() => {
        const scrollY = window.scrollY
        const originalOverflow = document.body.style.overflow
        const originalPosition = document.body.style.position
        const originalTop = document.body.style.top
        const originalWidth = document.body.style.width
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollY}px`
        document.body.style.width = '100%'
        return () => {
            document.body.style.overflow = originalOverflow
            document.body.style.position = originalPosition
            document.body.style.top = originalTop
            document.body.style.width = originalWidth
            window.scrollTo(0, scrollY)
        }
    }, [])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') prev()
            if (e.key === 'ArrowRight') next()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose, prev, next])

    // Mouse drag handlers
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!zoomed) return
        e.preventDefault()
        dragStart.current = { x: e.clientX, y: e.clientY }
        dragOrigin.current = offset
        hasDragged.current = false
        setIsDragging(true)
    }, [zoomed, offset])

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragStart.current) return
        const dx = e.clientX - dragStart.current.x
        const dy = e.clientY - dragStart.current.y
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true
        setOffset({ x: dragOrigin.current.x + dx, y: dragOrigin.current.y + dy })
    }, [])

    const onMouseUp = useCallback(() => {
        dragStart.current = null
        setIsDragging(false)
    }, [])

    // Overlay touch handlers — swipe anywhere to navigate (when not zoomed)
    const onOverlayTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length !== 1) return
        const t = e.touches[0]!
        swipeStart.current = { x: t.clientX, y: t.clientY }
    }, [])

    const onOverlayTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!swipeStart.current || zoomed) {
            swipeStart.current = null
            return
        }
        const t = e.changedTouches[0]!
        const dx = t.clientX - swipeStart.current.x
        const dy = t.clientY - swipeStart.current.y
        swipeStart.current = null
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) next(); else prev()
        }
    }, [zoomed, next, prev])

    // Image touch handlers — pan only when zoomed
    const onTouchStart = useCallback((e: React.TouchEvent) => {
        if (!zoomed || e.touches.length !== 1) return
        const t = e.touches[0]!
        dragStart.current = { x: t.clientX, y: t.clientY }
        dragOrigin.current = offset
        hasDragged.current = false
        setIsDragging(true)
    }, [zoomed, offset])

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (!dragStart.current || !zoomed || e.touches.length !== 1) return
        e.preventDefault()
        const t = e.touches[0]!
        const dx = t.clientX - dragStart.current.x
        const dy = t.clientY - dragStart.current.y
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true
        setOffset({ x: dragOrigin.current.x + dx, y: dragOrigin.current.y + dy })
    }, [zoomed])

    const onTouchEnd = useCallback(() => {
        dragStart.current = null
        setIsDragging(false)
    }, [])

    const handleImageClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        if (hasDragged.current) return
        if (zoomed) {
            setZoomed(false)
            resetPan()
        } else {
            setZoomed(true)
        }
    }, [zoomed, resetPan])

    const image = images[current]!
    const zoomFactor = (image.zoomScale ?? 200) / 100

    return createPortal(
        <div
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90"
            onClick={onClose}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onOverlayTouchStart}
            onTouchEnd={onOverlayTouchEnd}
        >
            {/* Controls bar */}
            <div
                className="absolute top-4 right-4 z-10 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                    onClick={() => { setZoomed((z) => !z); resetPan() }}
                    aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
                >
                    {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
                </button>
                <button
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Prev / Next */}
            {images.length > 1 && (
                <>
                    <button
                        className="absolute left-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                        onClick={(e) => { e.stopPropagation(); prev() }}
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        className="absolute right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                        onClick={(e) => { e.stopPropagation(); next() }}
                        aria-label="Next image"
                    >
                        <ChevronRight size={22} />
                    </button>
                </>
            )}

            {/* Image */}
            <div
                className="relative flex items-center justify-center overflow-hidden"
                style={{ width: '90vw', height: '90vh' }}
            >
                <img
                    src={image.src}
                    alt={image.alt}
                    draggable={false}
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onClick={handleImageClick}
                    style={{
                        transform: zoomed
                            ? `scale(${zoomFactor}) translate(${offset.x / zoomFactor}px, ${offset.y / zoomFactor}px)`
                            : 'scale(1) translate(0, 0)',
                        transition: isDragging ? 'none' : 'transform 0.3s ease',
                        cursor: zoomed
                            ? (isDragging ? 'grabbing' : 'grab')
                            : 'zoom-in',
                        maxHeight: '85vh',
                        maxWidth: '85vw',
                        objectFit: 'contain',
                        userSelect: 'none',
                    }}
                    className="rounded"
                />
            </div>

            {/* Dot indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-4 z-10 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {images.map((_, i) => (
                        <button
                            key={i}
                            className={`h-2 w-2 rounded-full transition-colors ${
                                i === current ? 'bg-white' : 'bg-white/40'
                            }`}
                            onClick={() => { setZoomed(false); resetPan(); setCurrent(i) }}
                            aria-label={`Go to image ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>,
        document.body
    )
}

const PageContent = ({ title, subtitle, sections }: PageContentProps): React.JSX.Element => {
    const [lightbox, setLightbox] = useState<LightboxState | null>(null)
    const toggleCtx = useContext(PanelToggleContext)

    const openLightbox = useCallback((images: Array<{ src: string; lightboxSrc?: string; alt: string; isModalEnabled?: boolean; zoomScale?: number }>, index: number) => {
        setLightbox({ images: images.map((img) => ({ src: img.lightboxSrc ?? img.src, alt: img.alt, zoomScale: img.zoomScale })), index })
    }, [])

    const closeLightbox = useCallback(() => setLightbox(null), [])

    return (
        <>
            <article className="space-y-6">
                <header>
                    <div className="flex items-start justify-between">
                        <h1 className="mb-2 text-2xl leading-tight font-medium tracking-tight text-[#0E7C86]">
                            {title}
                            {subtitle && (
                                <span className="mt-1 block text-lg font-light text-white/90 normal-case">{subtitle}</span>
                            )}
                        </h1>
                        {toggleCtx && (
                            <button
                                onClick={() => toggleCtx.setIsVisible(!toggleCtx.isVisible)}
                                className="hidden cursor-pointer p-1 text-white transition-all duration-300 hover:scale-110 focus:outline-none md:block"
                                aria-label={toggleCtx.isVisible ? 'hide content' : 'show content'}
                                title={toggleCtx.isVisible ? 'hide content' : 'show content'}>
                                {toggleCtx.isVisible ? (
                                    <X size={24} className="text-[#0E7C86] transition-transform duration-200 hover:text-[#0a6570]" />
                                ) : (
                                    <Plus size={24} className="text-[#0E7C86] transition-transform duration-200 hover:text-[#0a6570]" />
                                )}
                            </button>
                        )}
                    </div>
                </header>

                {sections.map((section, index) => (
                    <div key={index}>
                        <section className="space-y-4">
                            {section.title && (
                                <h2 className="mb-2 text-base font-semibold text-white/90">{section.title}</h2>
                            )}
                            {Array.isArray(section.content) ? (
                                <ul className="list-disc space-y-2 pl-5 text-white/90">
                                    {section.content.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-base font-light text-white">{section.content}</p>
                            )}
                            {section.images && (
                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {section.images.map((image, idx) =>
                                        image.isModalEnabled ? (
                                            <button
                                                key={idx}
                                                className="relative block aspect-[16/9] w-full cursor-zoom-in overflow-hidden rounded-lg"
                                                onClick={() => openLightbox(section.images!, idx)}
                                                aria-label={`View ${image.alt || `image ${idx + 1}`} fullscreen`}
                                            >
                                                <img
                                                    src={image.src}
                                                    alt={image.alt}
                                                    loading="lazy"
                                                    className="w-full object-cover transition-transform duration-300 hover:scale-105"
                                                />
                                                <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white">
                                                    <Search size={12} />
                                                </div>
                                            </button>
                                        ) : (
                                            <div key={idx} className="relative block aspect-[16/9] w-full overflow-hidden rounded-lg">
                                                <img
                                                    src={image.src}
                                                    alt={image.alt}
                                                    loading="lazy"
                                                    className="w-full object-cover"
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </section>
                        {index < sections.length - 1 && (
                            <hr className="mx-auto my-4 w-[65%] border-[1.5px] border-white/10" />
                        )}
                    </div>
                ))}
            </article>

            {lightbox && <Lightbox state={lightbox} onClose={closeLightbox} />}
        </>
    )
}

export default PageContent
