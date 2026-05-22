import { readFileSync } from 'fs'
import { join } from 'path'

describe('Rajdhani font removal (FCP optimisation)', () => {
    const globalsCss = readFileSync(join(__dirname, 'globals.css'), 'utf8')

    it('globals.css has no Google Fonts @import for Rajdhani', () => {
        expect(globalsCss).not.toMatch(/fonts\.googleapis\.com.*[Rr]ajdhani/)
    })

    it('globals.css has no rajdhani font reference (Tailwind v4 CSS config)', () => {
        expect(globalsCss).not.toMatch(/[Rr]ajdhani/)
    })
})
