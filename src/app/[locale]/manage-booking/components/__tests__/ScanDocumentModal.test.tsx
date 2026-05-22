import { fireEvent, render, screen } from '@testing-library/react'

import { ScanDocumentModal } from '../ScanDocumentModal'

const defaultProps = {
    open: true,
    onClose: jest.fn(),
    documentType: 1 as const,
    onDocumentTypeChange: jest.fn(),
    file: null,
    onFileChange: jest.fn(),
    error: null,
    loading: false,
    onUpload: jest.fn(),
    title: 'Scan document',
    selectDocumentTypeLabel: 'Select document type',
    documentTypeIdCard: 'ID Card',
    documentTypePassport: 'Passport',
    uploadImageLabel: 'Upload image',
    cancelLabel: 'Cancel',
    uploadLabel: 'Upload',
    uploadingLabel: 'Uploading...',
    closeAriaLabel: 'Close'
}

describe('ScanDocumentModal', () => {
    it('returns null when open is false', () => {
        const { container } = render(<ScanDocumentModal {...defaultProps} open={false} />)
        expect(container.firstChild).toBeNull()
    })

    it('renders title and form when open', () => {
        render(<ScanDocumentModal {...defaultProps} />)
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Scan document')).toBeInTheDocument()
        expect(screen.getByLabelText('Select document type')).toBeInTheDocument()
        expect(screen.getByLabelText('Upload image')).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
        const onClose = jest.fn()
        render(<ScanDocumentModal {...defaultProps} onClose={onClose} />)
        fireEvent.click(screen.getByLabelText('Close'))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when cancel button is clicked', () => {
        const onClose = jest.fn()
        render(<ScanDocumentModal {...defaultProps} onClose={onClose} />)
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('disables upload button when no file is selected', () => {
        render(<ScanDocumentModal {...defaultProps} />)
        expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled()
    })

    it('enables upload button when file is selected', () => {
        const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
        render(<ScanDocumentModal {...defaultProps} file={file} />)
        expect(screen.getByRole('button', { name: 'Upload' })).not.toBeDisabled()
    })

    it('shows error message when error prop is set', () => {
        render(<ScanDocumentModal {...defaultProps} error="Invalid file" />)
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid file')
    })
})
