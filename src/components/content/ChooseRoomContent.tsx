'use client'

import { Bath, BedIcon, Check, Eye, Home, Maximize2, Minus, Plus, Sofa } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/utils'

interface RoomPackage {
    id: number
    adults: number
    children: number
    nights: number
    price: number
    total: number
    perNight: string
    availability: string
    amenities?: string[]
}

interface RoomOption {
    id: number
    title: string
    image: string
    amenities: string[]
    packages: RoomPackage[]
}

const roomOptions: RoomOption[] = [
    {
        id: 1,
        title: 'Family Timber House',
        image: '/images/D11.webp',
        amenities: ['Wifi', 'included breakfast', 'airport transfer'],
        packages: [
            {
                id: 1,
                adults: 2,
                children: 1,
                nights: 2,
                price: 13500,
                total: 22000,
                perNight: '13,500',
                availability: 'Limited availability'
            },
            {
                id: 2,
                adults: 2,
                children: 1,
                nights: 2,
                price: 13500,
                total: 24000,
                perNight: '13,500',
                availability: 'Limited availability',
                amenities: [
                    'boat tranfer',
                    'Spa coupon',
                    'free Kayak 1 hours',
                    'included breakfast',
                    'airport transfer'
                ]
            },
            {
                id: 3,
                adults: 2,
                children: 1,
                nights: 2,
                price: 13500,
                total: 27000,
                perNight: '13,500',
                availability: 'Limited availability',
                amenities: ['included breakfast', 'airport transfer', 'boat tranfer', 'Spa coupon']
            }
        ]
    }
]

const ChooseRoomContent = (): React.JSX.Element => {
    const [selectedPackages, setSelectedPackages] = useState<number[]>([])
    const [packageQuantities, setPackageQuantities] = useState<Record<number, number>>({})

    const togglePackageSelection = (packageId: number) => {
        setSelectedPackages((prev) => {
            if (prev.includes(packageId)) {
                // Remove from selection
                return prev.filter((id) => id !== packageId)
            } else {
                // Add to selection
                return [...prev, packageId]
            }
        })
    }

    const isPackageSelected = (packageId: number) => {
        return selectedPackages.includes(packageId)
    }

    const handleQuantityChange = (packageId: number, newQuantity: number) => {
        if (newQuantity >= 0) {
            setPackageQuantities((prev) => ({
                ...prev,
                [packageId]: newQuantity
            }))
        }
    }

    const incrementQuantity = (packageId: number) => {
        const currentQuantity = packageQuantities[packageId] || 0
        handleQuantityChange(packageId, currentQuantity + 1)
    }

    const decrementQuantity = (packageId: number) => {
        const currentQuantity = packageQuantities[packageId] || 0
        if (currentQuantity > 0) {
            handleQuantityChange(packageId, currentQuantity - 1)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {roomOptions.map((room) => (
                    <div key={room.id} className="mb-6 rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-semibold text-gray-900">{room.title}</h2>
                        </div>

                        <div className="p-4">
                            <div className="flex flex-col gap-4 lg:flex-row">
                                <div className="lg:w-[320px]">
                                    <div className="relative mb-4 h-48 max-h-[200px] w-full max-w-full overflow-hidden rounded-lg xl:max-h-[130px] xl:max-w-[300px]">
                                        <Image src={room.image} alt={room.title} fill sizes="(max-width: 1280px) 320px, 300px" className="object-cover" />
                                    </div>

                                    <div className="mb-4 flex h-[75px] max-w-full gap-2 xl:h-[55px] xl:max-w-[300px]">
                                        <div className="relative h-[75px] w-1/2 cursor-pointer overflow-hidden rounded-md xl:h-[55px]">
                                            <Image
                                                src={room.image}
                                                alt="Room thumbnail 1"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="relative h-[75px] w-1/2 cursor-pointer overflow-hidden rounded-md xl:h-[55px]">
                                            <Image
                                                src={room.image}
                                                alt="Room thumbnail 2"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4 space-y-2">
                                        <p className="text-sm font-medium text-gray-800">Room photos and details</p>
                                        <div className="flex items-center gap-2 text-sm font-light text-gray-700">
                                            <Maximize2 size={14} className="text-gray-700" />
                                            <span> Room size: 34 m²/366 ft²</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-light text-gray-700">
                                            <Eye size={14} className="text-gray-700" />
                                            <span> Outdoor view</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-light text-gray-700">
                                            <BedIcon size={14} className="text-gray-700" />
                                            <span>1 double bed</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-light text-gray-700">
                                            <Home size={14} className="text-gray-700" />
                                            <span>Balcony/terrace</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-light text-gray-700">
                                            <Sofa size={14} className="text-gray-700" />
                                            <span>Sleep comfort items</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-light text-gray-700">
                                            <Bath size={14} className="text-gray-700" />
                                            <span>Private bathroom</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-full">
                                    <div className="space-y-4">
                                        {room.packages.map((pkg) => (
                                            <div
                                                key={pkg.id}
                                                className={cn(
                                                    'border  rounded-lg transition-colors',
                                                    isPackageSelected(pkg.id)
                                                        ? 'border-green-600 hover:border-green-700 bg-green-50'
                                                        : 'border-gray-200 hover:border-orange-500'
                                                )}>
                                                <div className="flex flex-col justify-between divide-x-0 divide-y-[1px] divide-gray-200 md:flex-row lg:divide-x-[1px] lg:divide-y-0">
                                                    <div className="flex-1 p-4">
                                                        <div className="mb-6">
                                                            <ul className="space-y-2">
                                                                {room.amenities.map((amenity, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className="flex items-center gap-2 text-sm text-gray-700">
                                                                        <Check
                                                                            size={16}
                                                                            className="flex-shrink-0 text-green-600"
                                                                        />
                                                                        {amenity}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <div className="flex h-full min-w-auto flex-col items-start divide-y-[1px] divide-gray-200 md:items-stretch lg:min-w-[300px]">
                                                        <div className="mb-2 flex w-full items-center justify-center divide-x-[1px] divide-gray-200 p-4 lg:justify-end">
                                                            <div className="px-4 text-sm text-gray-600">
                                                                Adults:{' '}
                                                                <span className="font-semibold text-gray-900">
                                                                    {pkg.adults}
                                                                </span>
                                                            </div>
                                                            <div className="px-4 text-sm text-gray-600">
                                                                Children:{' '}
                                                                <span className="font-semibold text-gray-900">
                                                                    {pkg.children}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex h-full w-full flex-col justify-center p-4 text-center lg:text-right">
                                                            <div className="mb-1 text-sm text-gray-600">
                                                                {pkg.nights} nights × {pkg.perNight}
                                                            </div>
                                                            <div className="text-2xl font-bold text-[#0a6570]">
                                                                ฿{pkg.total.toLocaleString()}
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                Per night before taxes and fees
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex min-w-auto flex-col items-center justify-center gap-4 p-4 lg:min-w-[200px]">
                                                        <div
                                                            id="count-room-package"
                                                            className="flex items-center gap-2 rounded-lg border border-gray-300">
                                                            <button
                                                                onClick={() => decrementQuantity(pkg.id)}
                                                                className="rounded-l-lg p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                                disabled={(packageQuantities[pkg.id] || 0) === 0}
                                                                aria-label="Decrease quantity">
                                                                <Minus size={16} className="text-gray-600" />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={packageQuantities[pkg.id] || 0}
                                                                onChange={(e) =>
                                                                    handleQuantityChange(
                                                                        pkg.id,
                                                                        parseInt(e.target.value) || 0
                                                                    )
                                                                }
                                                                className="w-16 border-0 text-center text-sm font-semibold focus:ring-0 focus:outline-none"
                                                                aria-label="Room quantity"
                                                            />
                                                            <button
                                                                onClick={() => incrementQuantity(pkg.id)}
                                                                className="rounded-r-lg p-2 transition-colors hover:bg-gray-100"
                                                                aria-label="Increase quantity">
                                                                <Plus size={16} className="text-gray-600" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => togglePackageSelection(pkg.id)}
                                                            className={cn(
                                                                'px-6 py-2 rounded-full font-normal cursor-pointer text-sm transition-colors whitespace-nowrap min-w-[120px]',
                                                                isPackageSelected(pkg.id)
                                                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                                                    : 'bg-[#0a6570] text-white hover:bg-[#0E7C86]'
                                                            )}>
                                                            {isPackageSelected(pkg.id) ? 'SELECTED' : 'SELECT'}
                                                        </button>
                                                        <div className="mt-1 text-xs font-medium text-green-600">
                                                            {pkg.availability}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChooseRoomContent
