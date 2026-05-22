import { fireEvent, render, screen } from '@testing-library/react'

import { SearchStep } from '../SearchStep'

const defaultProps = {
    query: '',
    onQueryChange: jest.fn(),
    onSearch: jest.fn(),
    isLoading: false,
    placeholder: 'Search by email',
    title: 'Select booking',
    searchButtonLabel: 'Search',
    searchingLabel: 'Searching...'
}

describe('SearchStep', () => {
    it('renders title, input and search button', () => {
        render(<SearchStep {...defaultProps} />)
        expect(screen.getByText('Select booking')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Search by email')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
    })

    it('calls onSearch when button is clicked', () => {
        const onSearch = jest.fn()
        render(<SearchStep {...defaultProps} onSearch={onSearch} />)
        fireEvent.click(screen.getByRole('button', { name: 'Search' }))
        expect(onSearch).toHaveBeenCalledTimes(1)
    })

    it('calls onSearch when Enter is pressed in input', () => {
        const onSearch = jest.fn()
        render(<SearchStep {...defaultProps} onSearch={onSearch} />)
        const input = screen.getByPlaceholderText('Search by email')
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(onSearch).toHaveBeenCalledTimes(1)
    })

    it('calls onQueryChange when input value changes', () => {
        const onQueryChange = jest.fn()
        render(<SearchStep {...defaultProps} onQueryChange={onQueryChange} />)
        const input = screen.getByPlaceholderText('Search by email')
        fireEvent.change(input, { target: { value: 'test@example.com' } })
        expect(onQueryChange).toHaveBeenCalledWith('test@example.com')
    })

    it('disables button and shows searching label when isLoading', () => {
        render(<SearchStep {...defaultProps} isLoading />)
        const button = screen.getByRole('button', { name: 'Searching...' })
        expect(button).toBeDisabled()
    })
})
