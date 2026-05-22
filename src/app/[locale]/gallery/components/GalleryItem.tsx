'use client'

import React from 'react'

import { Link } from '@/i18n/routing'

interface GalleryItemProps {
    item: {
        id: number
        image: string
        title: string
        description: string
        category: string
    }
    className?: string
    onClick?: () => void
    isLoading?: boolean
}

export const GalleryItem = React.memo(
    ({ item, className = '', onClick, isLoading }: GalleryItemProps): React.JSX.Element => {
        const overlay = (
            <>
            <div className="absolute inset-0 bg-black/50 transition-colors duration-300 group-hover:bg-black/70" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-white">
                {isLoading ? (
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                    <svg
                        className="h-7 w-7 text-white transition duration-150 ease-out group-hover:scale-110 hover:ease-in"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="1.5"
                            d="m21 21-3.5-3.5M10 7v6m-3-3h6m4 0a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                        />
                    </svg>
                )}
                <h4 className="px-4 text-center text-xl font-light tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] transition duration-150 ease-out group-hover:scale-110 hover:ease-in">
                    {item.title}
                </h4>
                {item.description && (
                    <h3 className="px-4 text-center text-sm font-light tracking-wide text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] transition duration-150 ease-out group-hover:scale-110 hover:ease-in">
                        {item.description}
                    </h3>
                )}
            </div>
            </>
        )

        return (
            <div className={`group relative h-[300px] cursor-pointer overflow-hidden ${className}`}>
                <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                />
                {onClick ? (
                    <button onClick={onClick} className="absolute inset-0 w-full cursor-pointer" aria-label={item.title}>
                        {overlay}
                    </button>
                ) : (
                    <Link
                        href={`/gallery/${item.category}` as `/gallery/${string}`}
                        className="absolute inset-0 cursor-pointer">
                        {overlay}
                    </Link>
                )}
            </div>
        )
    },
    (prevProps, nextProps) => {
        return (
            prevProps.item.id === nextProps.item.id &&
            prevProps.item.image === nextProps.item.image &&
            prevProps.item.title === nextProps.item.title &&
            prevProps.item.description === nextProps.item.description &&
            prevProps.item.category === nextProps.item.category &&
            prevProps.className === nextProps.className &&
            prevProps.isLoading === nextProps.isLoading &&
            prevProps.onClick === nextProps.onClick
        )
    }
)

GalleryItem.displayName = 'GalleryItem'
