interface Props {
    labels: string[]
}

export default function RoomLabels({ labels }: Props) {
    return (
        <div className="flex gap-2">
            {labels.map((label) => (
                <span key={label} className="rounded-md bg-orange-400 px-2 py-1 text-xs text-white">
                    {label}
                </span>
            ))}
        </div>
    )
}
