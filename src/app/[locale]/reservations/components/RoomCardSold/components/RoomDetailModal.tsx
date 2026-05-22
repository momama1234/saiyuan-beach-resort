'use client'

import { BedDouble,Maximize2, Users, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { RoomType } from '../index'
import RoomFacilities from './RoomFacilities'

interface Props {
    room: RoomType
    isOpen: boolean
    onClose: () => void
}

export default function RoomDetailModal({ room, isOpen, onClose }: Props) {
    useEffect(() => {
        if (!isOpen) return
        const scrollY = window.scrollY
        const prev = { overflow: document.body.style.overflow, position: document.body.style.position, top: document.body.style.top, width: document.body.style.width }
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollY}px`
        document.body.style.width = '100%'
        return () => {
            document.body.style.overflow = prev.overflow
            document.body.style.position = prev.position
            document.body.style.top = prev.top
            document.body.style.width = prev.width
            window.scrollTo(0, scrollY)
        }
    }, [isOpen])

    if (!isOpen) return null

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Content - Centered */}
            <div className="relative z-10 mx-auto flex h-[600px] w-full max-w-sm flex-col rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex flex-shrink-0 items-center justify-between border-b p-4">
                    <h2 className="pr-2 text-lg font-bold  text-gray-900">{room.name}</h2>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-100">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Room Info */}
                <div className="flex-shrink-0 border-b bg-gray-50 px-4 py-3">
                    <div className="mb-1 flex items-center gap-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1.5">
                            <Maximize2 className="h-4 w-4 text-[#0E7C86]" />
                            <span>{room.size}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-[#0E7C86]" />
                            <span>Max {room.guests} adults</span>
                        </div>
                    </div>
                    {room.bed && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <BedDouble className="h-4 w-4 text-[#0E7C86]" />
                            <span>{room.bed}</span>
                        </div>
                    )}
                </div>

                {/* Room Features - Scrollable */}
                <div className="flex min-h-0 flex-grow flex-col overflow-hidden">
                    <h3 className="flex-shrink-0 px-4 pt-3 pb-2 text-base font-semibold text-gray-900">
                        Room Features
                    </h3>

                    <div
                        className="flex-grow overflow-y-auto px-4 pb-3"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#fdba74 #f3f4f6'
                        }}>
                        <RoomFacilities features={room.features} maxItems={room.features.length} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 rounded-b-2xl border-t bg-white p-4">
                    <button
                        onClick={onClose}
                        className="w-full cursor-pointer rounded-lg bg-[#0E7C86] py-3 font-semibold text-white transition-colors hover:bg-[#0a6570]">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )

    // Use portal to render modal at document body level
    return createPortal(modalContent, document.body)
}
