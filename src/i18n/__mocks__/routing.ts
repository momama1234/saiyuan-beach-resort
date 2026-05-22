import React from 'react'

export const Link = ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href }, children)

export const redirect = jest.fn()
export const usePathname = jest.fn(() => '/')
export const useRouter = jest.fn(() => ({ replace: jest.fn(), push: jest.fn() }))
