import { Calendar, Edit, Eye, Mail, MapPin, MessageSquare, Trash2, Users } from 'lucide-react'
import React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { formatPriceFixed2 } from '@/helpers/price'

interface Reservation {
    id: string
    guestName: string
    guestEmail: string
    roomType: string
    roomNumber: string
    checkIn: Date
    checkOut: Date
    adults: number
    children: number
    totalPrice: number
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
    createdAt: Date
    specialRequests?: string
}

interface StatusConfig {
    [key: string]: {
        label: string
        color: string
        bgColor: string
        textColor: string
    }
}

interface ReservationCardProps {
    reservation: Reservation
    statusConfig: StatusConfig
}

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, statusConfig }) => {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const calculateNights = (checkIn: Date, checkOut: Date) => {
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const handleViewDetails = () => {
        console.log('View details for reservation:', reservation.id)
    }

    const handleEdit = () => {
        console.log('Edit reservation:', reservation.id)
    }

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            console.log('Cancel reservation:', reservation.id)
        }
    }

    const status = statusConfig[reservation.status] || {
        label: 'Unknown',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700'
    }
    const nights = calculateNights(reservation.checkIn, reservation.checkOut)

    return (
        <Card className="border-l-4 border-l-teal-500 transition-shadow duration-300 hover:shadow-lg">
            <CardContent className="p-6">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    {/* Main Info */}
                    <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="mb-1 text-lg font-bold text-gray-900">{reservation.guestName}</h3>
                                <p className="mb-2 text-sm text-gray-600">Booking ID: {reservation.id}</p>
                                <div
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                                    {status.label}
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Contact Info */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="size-4 text-gray-400" />
                                    <span className="text-gray-600">{reservation.guestEmail}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="size-4 text-gray-400" />
                                    <span className="text-gray-600">
                                        {reservation.roomType} - {reservation.roomNumber}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="size-4 text-gray-400" />
                                    <span className="text-gray-600">
                                        Adults {reservation.adults}
                                        {reservation.children > 0 && `, Children ${reservation.children}`}
                                    </span>
                                </div>
                            </div>

                            {/* Date & Price Info */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="size-4 text-gray-400" />
                                    <span className="text-gray-600">
                                        {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">{nights} nights</span>
                                </div>
                                <div className="text-lg font-bold text-teal-600">
                                    ฿{formatPriceFixed2(reservation.totalPrice)}
                                </div>
                            </div>
                        </div>

                        {/* Special Requests */}
                        {reservation.specialRequests && (
                            <div className="mt-4 rounded-lg bg-gray-50 p-3">
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="mt-0.5 size-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Special Requests:</p>
                                        <p className="mt-1 text-sm text-gray-600">{reservation.specialRequests}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex min-w-fit flex-row gap-2 lg:flex-col">
                        <button
                            onClick={handleViewDetails}
                            className="flex items-center gap-2 rounded-lg bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition-colors duration-200 hover:bg-teal-100">
                            <Eye className="size-4" />
                            <span className="hidden sm:inline">View Details</span>
                        </button>

                        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                            <button
                                onClick={handleEdit}
                                className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors duration-200 hover:bg-blue-100">
                                <Edit className="size-4" />
                                <span className="hidden sm:inline">Edit</span>
                            </button>
                        )}

                        {reservation.status === 'pending' && (
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-100">
                                <Trash2 className="size-4" />
                                <span className="hidden sm:inline">Cancel</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer - Created Date */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500">
                        Booked on: {formatDate(reservation.createdAt)} at{' '}
                        {reservation.createdAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
