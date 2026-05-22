import '@testing-library/jest-dom'

beforeEach(() => {
    sessionStorage.clear()
    // Default to desktop in tests; individual tests override via setMatchMedia.
    setMatchMedia(true)
})

export const setMatchMedia = (isDesktop: boolean): void => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: jest.fn().mockImplementation((query: string) => ({
            matches: isDesktop,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        }))
    })
}
