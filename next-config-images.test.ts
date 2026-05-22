import { readFileSync } from 'fs'
import { join } from 'path'

describe('web-andalay Next image configuration', () => {
    const nextConfigSource = readFileSync(join(__dirname, 'next.config.ts'), 'utf8')

    it('does not allow wildcard remote image optimization patterns', () => {
        expect(nextConfigSource).not.toContain("hostname: '**'")
        expect(nextConfigSource).not.toContain('hostname: "**"')
    })

    it('keeps local static image formats configured', () => {
        expect(nextConfigSource).toContain("formats: ['image/avif', 'image/webp']")
    })
})
