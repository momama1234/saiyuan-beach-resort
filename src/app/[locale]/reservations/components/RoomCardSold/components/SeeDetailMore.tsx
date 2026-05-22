'use client'

import { useState } from 'react'

import { RoomType } from '../index'
import RoomDetailModal from './RoomDetailModal'

interface Props {
    room: RoomType
}

export default function SeeDetailMore({ room }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-orange-500 px-2 py-2 font-semibold text-[#0E7C86] transition-colors hover:bg-orange-50"
                onClick={() => setIsModalOpen(true)}>
                See More Details
                <span className="text-lg">→</span>
            </button>

            <RoomDetailModal room={room} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}
