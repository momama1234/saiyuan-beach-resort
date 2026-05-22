'use client'

import { Plus, X } from 'lucide-react'
import { useContext } from 'react'

import { PanelToggleContext } from '@/components/PageTemplate/PanelToggleContext'

interface RoomFeature {
    icon?: string
    text: string
    isHighlighted?: boolean
}

interface RoomDetail {
    label: string
    value: string
}

interface RoomContentProps {
    title: string
    description: string
    features: RoomFeature[]
    details: RoomDetail[]
    price?: string
    note?: string
}

const RoomContent = ({
    title,
    description,
    features,
    details,
    price,
    note
}: RoomContentProps): React.JSX.Element => {
    const toggleCtx = useContext(PanelToggleContext)

    return (
        <article className="space-y-6">
            <header>
                <div className="flex items-start justify-between">
                    <h1 className="mb-2 text-xl leading-tight font-medium tracking-tight text-[#0E7C86]">{title}</h1>
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
                <p className="text-sm font-light text-white">{description}</p>
            </header>

            <section className="space-y-4">
                <h2 className="mb-2 text-base font-semibold text-white">Room Features</h2>
                <ul className="list-disc space-y-2 pl-5 text-sm font-light text-white">
                    {features.map((feature, index) => (
                        <li key={index}>{feature.text}</li>
                    ))}
                </ul>
            </section>

            <hr className="mx-auto my-4 w-[65%] border-[1.5px] border-white/10" />

            <section className="space-y-4">
                <h2 className="mb-2 text-base font-semibold text-white/90">Room Details</h2>
                <ul className="space-y-2 text-sm font-light text-white">
                    {details.map((detail, index) => (
                        <li key={index} className="flex items-center gap-2">
                            <span className="text-green-500">✓</span> {detail.label}: {detail.value}
                        </li>
                    ))}
                </ul>
            </section>

            {(price || note) && (
                <>
                    <hr className="mx-auto my-4 w-[65%] border-[1.5px] border-white/10" />
                    <section className="space-y-4">
                        {price && <p className="text-sm font-semibold text-white/90">{price}</p>}
                        {note && <p className="text-sm text-white/70 italic">{note}</p>}
                    </section>
                </>
            )}

        </article>
    )
}

export default RoomContent
