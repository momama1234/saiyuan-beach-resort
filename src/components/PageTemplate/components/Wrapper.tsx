'use client'

import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

import Carousel from '@/components/Carousel'
import { PanelToggleContext } from '@/components/PageTemplate/PanelToggleContext'

interface WrapperProps {
    children: React.ReactNode
    footer?: React.ReactNode
    images: string[]
    mobileImages?: string[]
    showCarouselControls?: boolean
    scrollable?: boolean
}

const Wrapper = ({ children, footer, images, mobileImages, showCarouselControls = true, scrollable = true }: WrapperProps): React.JSX.Element => {
    const [isVisible, setIsVisible] = useState(true)
    const [forcedHidden, setForcedHidden] = useState(false)

    useEffect(() => {
        const handler = () => setForcedHidden(true)
        window.addEventListener('panel-hide', handler)
        return () => window.removeEventListener('panel-hide', handler)
    }, [])

    const panelVisible = isVisible && !forcedHidden

    return (
        <>
            <Carousel images={images} mobileImages={mobileImages} showControls={showCarouselControls} />

            <div
                className={`
                relative z-[45] w-full
                bg-black/90 bg-[url("/images/thread-bg.png")] bg-repeat
                text-white
                md:absolute md:top-20 md:right-10 md:bottom-20 md:left-10
                md:flex md:w-[500px] md:flex-col md:overflow-hidden
                md:transition-transform md:duration-500 md:ease-in-out
                ${panelVisible ? 'md:translate-x-0' : 'md:-translate-x-[120%]'}
            `}>
                {/* Scrollable content area */}
                <PanelToggleContext.Provider value={{ isVisible, setIsVisible }}>
                {scrollable ? (
                    <div className="
                        md:scrollbar-thin md:scrollbar-thumb-transparent
                        md:scrollbar-track-transparent p-6
                        pb-5 md:flex-1 md:overflow-y-auto
                    ">
                        {children}
                    </div>
                ) : (
                    <div className="md:flex md:flex-1 md:flex-col md:overflow-hidden">
                        {children}
                    </div>
                )}
                </PanelToggleContext.Provider>

                {/* Footer slot — outside scroll area, always visible at bottom */}
                {footer && (
                    <div className="md:flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>

            {/* Floating + button when panel is hidden — desktop only */}
            {!panelVisible && !forcedHidden && (
                <button
                    onClick={() => setIsVisible(true)}
                    className="fixed top-20 left-4 z-40 hidden rounded-full bg-[#0E7C86] p-3 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#0a6570] focus:ring-2 focus:ring-[#0E7C86] focus:ring-offset-2 focus:outline-none md:top-24 md:left-6 md:block"
                    aria-label="show content"
                    title="show content">
                    <Plus size={20} className="transition-transform duration-200" />
                </button>
            )}
        </>
    )
}

export default Wrapper
