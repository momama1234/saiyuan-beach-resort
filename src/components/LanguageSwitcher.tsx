'use client'

import { ChevronDown, Globe } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { OPEN_LANGUAGES_API_PATH } from '@/constants/path'
import { usePathname, useRouter } from '@/i18n/routing'

interface LanguageMeta {
    value: string
    label: string
    flag: string | null
}

interface LanguageSwitcherProps {
    className?: string
}

const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps): React.JSX.Element => {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const [languages, setLanguages] = useState<LanguageMeta[]>([])
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/v1'
        const headers: Record<string, string> = {}
        const apiKey = process.env.NEXT_PUBLIC_API_KEY
        const publicKey = process.env.NEXT_PUBLIC_API_PUBLIC_KEY
        if (apiKey) headers['x-api-key'] = apiKey
        if (publicKey) headers['x-public-key'] = publicKey

        fetch(`${apiUrl}${OPEN_LANGUAGES_API_PATH}`, { headers })
            .then((r) => r.json())
            .then((data: Array<{ code: string; nativeName: string; flag: string | null }>) => {
                const langs = data.map((l) => ({ value: l.code, label: l.nativeName, flag: l.flag }))
                if (langs.length > 0) setLanguages(langs)
            })
            .catch(() => {})
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const currentLanguage = languages.find((l) => l.value === locale) ?? languages[0]
    const canSwitch = languages.length > 1

    const handleSelect = (langCode: string) => {
        setOpen(false)
        if (langCode !== locale) {
            router.replace(pathname, { locale: langCode })
        }
    }

    if (!canSwitch) {
        return (
            <div className={className}>
                <div className="flex h-9 items-center gap-2 px-3">
                    <Globe className="h-5 w-5 text-white" />
                    <span className="flex items-center gap-1">
                        {currentLanguage?.flag && <span className="h-5 w-5">{currentLanguage.flag}</span>}
                        <span className="text-base font-medium text-white">{currentLanguage?.label}</span>
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="h-9 cursor-pointer justify-between border-none ring-0"
                onClick={() => setOpen((prev) => !prev)}>
                <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-white" />
                    <span className="flex items-center gap-1">
                        {currentLanguage?.flag && <span className="h-5 w-5">{currentLanguage.flag}</span>}
                        <span className="text-base font-medium">{currentLanguage?.label}</span>
                    </span>
                </div>
                <ChevronDown className={`ml-2 h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </Button>

            {open && (
                <ul className="absolute right-0 z-50 mt-1 min-w-full overflow-hidden rounded-md border bg-white shadow-lg">
                    {languages.map((lang) => (
                        <li key={lang.value}>
                            <button
                                className={`flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 ${lang.value === locale ? 'font-semibold' : ''}`}
                                onClick={() => handleSelect(lang.value)}>
                                {lang.flag && <span>{lang.flag}</span>}
                                <span>{lang.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default LanguageSwitcher
