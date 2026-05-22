'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface ScanDocumentModalProps {
    open: boolean
    onClose: () => void
    documentType: 1 | 2
    onDocumentTypeChange: (value: 1 | 2) => void
    file: File | null
    onFileChange: (file: File | null) => void
    error: string | null
    loading: boolean
    onUpload: () => void
    title: string
    selectDocumentTypeLabel: string
    documentTypeIdCard: string
    documentTypePassport: string
    uploadImageLabel: string
    cancelLabel: string
    uploadLabel: string
    uploadingLabel: string
    closeAriaLabel: string
}

export function ScanDocumentModal({
    open,
    onClose,
    documentType,
    onDocumentTypeChange,
    file,
    onFileChange,
    error,
    loading,
    onUpload,
    title,
    selectDocumentTypeLabel,
    documentTypeIdCard,
    documentTypePassport,
    uploadImageLabel,
    cancelLabel,
    uploadLabel,
    uploadingLabel,
    closeAriaLabel
}: ScanDocumentModalProps) {
    if (!open) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        onFileChange(f ?? null)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scan-modal-title"
        >
            <Card className="w-full max-w-md border-gray-200 bg-white shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle id="scan-modal-title" className="text-lg">
                        {title}
                    </CardTitle>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        aria-label={closeAriaLabel}
                    >
                        ×
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            {selectDocumentTypeLabel}
                        </label>
                        <select
                            value={documentType}
                            onChange={(e) => onDocumentTypeChange(Number(e.target.value) as 1 | 2)}
                            className="h-10 w-full cursor-pointer rounded border border-gray-300 px-3 text-sm focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                            aria-label={selectDocumentTypeLabel}
                        >
                            <option value={1}>{documentTypeIdCard}</option>
                            <option value={2}>{documentTypePassport}</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            {uploadImageLabel}
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-[#0E7C86]"
                            aria-label={uploadImageLabel}
                        />
                        {file && (
                            <p className="mt-1 text-xs text-gray-500">{file.name}</p>
                        )}
                    </div>
                    {error && (
                        <div
                            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            type="button"
                            className="flex-1 bg-[#0E7C86] hover:bg-orange-800"
                            onClick={onUpload}
                            disabled={loading || !file}
                        >
                            {loading ? uploadingLabel : uploadLabel}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
