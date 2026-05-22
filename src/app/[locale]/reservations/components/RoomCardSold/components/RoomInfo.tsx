import { BedDouble,Maximize2, Users } from 'lucide-react'

interface Props {
    name: string
    size: string
    guests: number
    bed: string
}

export default function RoomInfo({ name, size, guests, bed }: Props) {
    return (
        <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">{name}</h2>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                <div className="flex items-start gap-1.5">
                    <Maximize2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0E7C86]" />
                    <span className="break-words">{size}</span>
                </div>
                <div className="flex items-start gap-1.5">
                    <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0E7C86]" />
                    <span className="break-words">Max {guests} adults</span>
                </div>
                {bed && (
                    <div className="flex items-start gap-1.5">
                        <BedDouble className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0E7C86]" />
                        <span className="break-words">{bed}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
