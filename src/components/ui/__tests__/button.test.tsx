import { fireEvent, render, screen } from '@testing-library/react'
import Link from 'next/link'

import { Button, buttonVariants } from '../button'

describe('Button', () => {
    it('renders button with default props', () => {
        render(<Button>Click me</Button>)

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        expect(button).toHaveTextContent('Click me')
    })

    it('applies custom className', () => {
        render(<Button className="custom-class">Test</Button>)

        const button = screen.getByRole('button')
        expect(button).toHaveClass('custom-class')
    })

    it('renders different variants correctly', () => {
        const { rerender } = render(<Button variant="destructive">Destructive</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-destructive')

        rerender(<Button variant="outline">Outline</Button>)
        expect(screen.getByRole('button')).toHaveClass('border', 'bg-background')

        rerender(<Button variant="secondary">Secondary</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-secondary')

        rerender(<Button variant="ghost">Ghost</Button>)
        expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')

        rerender(<Button variant="link">Link</Button>)
        expect(screen.getByRole('button')).toHaveClass('text-primary', 'underline-offset-4')
    })

    it('renders different sizes correctly', () => {
        const { rerender } = render(<Button size="sm">Small</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-8')

        rerender(<Button size="lg">Large</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-10')

        rerender(<Button size="icon">Icon</Button>)
        expect(screen.getByRole('button')).toHaveClass('size-9')
    })

    it('handles click events', () => {
        const handleClick = jest.fn()
        render(<Button onClick={handleClick}>Click me</Button>)

        const button = screen.getByRole('button')
        fireEvent.click(button)

        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('renders as child component when asChild is true', () => {
        render(
            <Button asChild>
                <Link href="/test">Link Button</Link>
            </Button>
        )

        const link = screen.getByRole('link')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/test')
    })

    it('disables button when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>)

        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
        expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    it('passes through other HTML attributes', () => {
        render(
            <Button data-testid="custom-button" id="my-button">
                Test
            </Button>
        )

        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('data-testid', 'custom-button')
        expect(button).toHaveAttribute('id', 'my-button')
    })

    it('has data-slot attribute', () => {
        render(<Button>Test</Button>)

        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('data-slot', 'button')
    })

    it('renders with proper focus styles', () => {
        render(<Button>Focus test</Button>)

        const button = screen.getByRole('button')
        expect(button).toHaveClass('focus-visible:ring-ring/50')
    })

    it('buttonVariants function works correctly', () => {
        const variants = buttonVariants({ variant: 'destructive', size: 'lg' })
        expect(variants).toContain('bg-destructive')
        expect(variants).toContain('h-10')
    })
})
