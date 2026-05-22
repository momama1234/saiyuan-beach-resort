import { render, screen } from '@testing-library/react'

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card'

describe('Card Components', () => {
    describe('Card', () => {
        it('renders card component', () => {
            render(<Card data-testid="card">Card content</Card>)

            const card = screen.getByTestId('card')
            expect(card).toBeInTheDocument()
            expect(card).toHaveTextContent('Card content')
            expect(card).toHaveAttribute('data-slot', 'card')
        })

        it('applies default styling', () => {
            render(<Card data-testid="card">Test</Card>)

            const card = screen.getByTestId('card')
            expect(card).toHaveClass('bg-card', 'text-card-foreground', 'rounded-xl', 'border', 'shadow-md')
        })

        it('applies custom className', () => {
            render(
                <Card className="custom-card" data-testid="card">
                    Test
                </Card>
            )

            const card = screen.getByTestId('card')
            expect(card).toHaveClass('custom-card')
        })
    })

    describe('CardHeader', () => {
        it('renders card header component', () => {
            render(<CardHeader data-testid="header">Header content</CardHeader>)

            const header = screen.getByTestId('header')
            expect(header).toBeInTheDocument()
            expect(header).toHaveAttribute('data-slot', 'card-header')
        })

        it('applies grid layout classes', () => {
            render(<CardHeader data-testid="header">Test</CardHeader>)

            const header = screen.getByTestId('header')
            expect(header).toHaveClass('grid', 'auto-rows-min', 'grid-rows-[auto_auto]')
        })
    })

    describe('CardTitle', () => {
        it('renders card title component', () => {
            render(<CardTitle data-testid="title">Title text</CardTitle>)

            const title = screen.getByTestId('title')
            expect(title).toBeInTheDocument()
            expect(title).toHaveTextContent('Title text')
            expect(title).toHaveAttribute('data-slot', 'card-title')
        })

        it('applies title styling', () => {
            render(<CardTitle data-testid="title">Test</CardTitle>)

            const title = screen.getByTestId('title')
            expect(title).toHaveClass('leading-none', 'font-semibold')
        })
    })

    describe('CardDescription', () => {
        it('renders card description component', () => {
            render(<CardDescription data-testid="description">Description text</CardDescription>)

            const description = screen.getByTestId('description')
            expect(description).toBeInTheDocument()
            expect(description).toHaveTextContent('Description text')
            expect(description).toHaveAttribute('data-slot', 'card-description')
        })

        it('applies description styling', () => {
            render(<CardDescription data-testid="description">Test</CardDescription>)

            const description = screen.getByTestId('description')
            expect(description).toHaveClass('text-muted-foreground', 'text-sm')
        })
    })

    describe('CardAction', () => {
        it('renders card action component', () => {
            render(<CardAction data-testid="action">Action content</CardAction>)

            const action = screen.getByTestId('action')
            expect(action).toBeInTheDocument()
            expect(action).toHaveAttribute('data-slot', 'card-action')
        })

        it('applies grid positioning classes', () => {
            render(<CardAction data-testid="action">Test</CardAction>)

            const action = screen.getByTestId('action')
            expect(action).toHaveClass('col-start-2', 'row-span-2', 'row-start-1')
        })
    })

    describe('CardContent', () => {
        it('renders card content component', () => {
            render(<CardContent data-testid="content">Content text</CardContent>)

            const content = screen.getByTestId('content')
            expect(content).toBeInTheDocument()
            expect(content).toHaveTextContent('Content text')
            expect(content).toHaveAttribute('data-slot', 'card-content')
        })

        it('applies padding classes', () => {
            render(<CardContent data-testid="content">Test</CardContent>)

            const content = screen.getByTestId('content')
            expect(content).toHaveClass('px-6')
        })
    })

    describe('CardFooter', () => {
        it('renders card footer component', () => {
            render(<CardFooter data-testid="footer">Footer content</CardFooter>)

            const footer = screen.getByTestId('footer')
            expect(footer).toBeInTheDocument()
            expect(footer).toHaveTextContent('Footer content')
            expect(footer).toHaveAttribute('data-slot', 'card-footer')
        })

        it('applies flex layout classes', () => {
            render(<CardFooter data-testid="footer">Test</CardFooter>)

            const footer = screen.getByTestId('footer')
            expect(footer).toHaveClass('flex', 'items-center', 'px-6')
        })
    })

    describe('Complete Card Structure', () => {
        it('renders complete card structure', () => {
            render(
                <Card data-testid="card">
                    <CardHeader data-testid="header">
                        <CardTitle data-testid="title">Test Title</CardTitle>
                        <CardDescription data-testid="description">Test Description</CardDescription>
                        <CardAction data-testid="action">Action</CardAction>
                    </CardHeader>
                    <CardContent data-testid="content">Content</CardContent>
                    <CardFooter data-testid="footer">Footer</CardFooter>
                </Card>
            )

            expect(screen.getByTestId('card')).toBeInTheDocument()
            expect(screen.getByTestId('header')).toBeInTheDocument()
            expect(screen.getByTestId('title')).toHaveTextContent('Test Title')
            expect(screen.getByTestId('description')).toHaveTextContent('Test Description')
            expect(screen.getByTestId('action')).toHaveTextContent('Action')
            expect(screen.getByTestId('content')).toHaveTextContent('Content')
            expect(screen.getByTestId('footer')).toHaveTextContent('Footer')
        })
    })
})
