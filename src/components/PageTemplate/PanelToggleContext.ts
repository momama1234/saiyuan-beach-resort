import { createContext } from 'react'

export const PanelToggleContext = createContext<{
    isVisible: boolean
    setIsVisible: (v: boolean) => void
} | null>(null)
