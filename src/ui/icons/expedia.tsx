import React, { FC } from 'react'

interface ViewIconProps {
    className?: string
    size?: number
}

const ExpediaIcon: FC<ViewIconProps> = ({ className = 'text-white', size = 20 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            className={`${className}`}
            fill="currentColor"
            viewBox="0 0 180 180">
            <path d="M141.6-.4H36.4C15.7-.4-.9 16.2-.9 36.9v105.3c0 20.7 16.6 37.3 37.3 37.3h105.3c20.7 0 37.3-16.6 37.3-37.3V36.9c-.1-20.7-16.7-37.3-37.4-37.3M54 144.2c0 1.4-1.2 2.6-2.6 2.6H34.1c-1.4 0-2.6-1.2-2.6-2.6v-17.4c0-1.4 1.2-2.6 2.6-2.6h17.3c1.4 0 2.6 1.2 2.6 2.6zm92.4-15.3c0 1.7-.4 2.7-1.3 3.6l-18 18c-.3.3-.8.5-1.3.5-1 0-1.8-.8-1.8-1.8V71.3l-47.9 47.9c-.9.9-1.5 1.5-3.3 1.5H60.3c-.8 0-1.4-.3-1.9-.8s-.8-1.2-.8-1.9v-12.6c0-1.9.5-2.4 1.5-3.3L107 54.2H29c-1 0-1.8-.8-1.8-1.8 0-.5.2-.9.5-1.3l18-18c.9-.9 1.9-1.3 3.6-1.3h85.1c1.6 0 3.1.3 4.6.9s2.8 1.5 3.9 2.6 2 2.4 2.6 3.9.9 3 .9 4.6z"></path>
        </svg>
    )
}

export default ExpediaIcon
