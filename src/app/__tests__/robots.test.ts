import robots from '../robots'

const SITE_URL = 'https://test-hotel.com'

describe('robots()', () => {
    beforeEach(() => {
        process.env.NEXT_PUBLIC_SITE_URL = SITE_URL
        jest.resetModules()
    })

    afterEach(() => {
        delete process.env.NEXT_PUBLIC_SITE_URL
    })

    it('disallow ครอบคลุม transactional paths ทั้งสองภาษา (6 paths)', () => {
        const result = robots()
        const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
        const allDisallowed = rules.flatMap((r) => (Array.isArray(r.disallow) ? r.disallow : [r.disallow]))

        const expectedDisallowed = [
            '/reservations/success',
            '/th/reservations/success',
            '/contact-booking/success',
            '/th/contact-booking/success',
            '/manage-booking',
            '/th/manage-booking'
        ]

        for (const path of expectedDisallowed) {
            expect(allDisallowed).toContain(path)
        }
    })

    it('field sitemap ใช้ NEXT_PUBLIC_SITE_URL', () => {
        const result = robots()
        expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`)
    })

    it('field sitemap fallback เป็น default domain เมื่อไม่มี env var', () => {
        delete process.env.NEXT_PUBLIC_SITE_URL
        const result = robots()
        expect(result.sitemap).toMatch(/\/sitemap\.xml$/)
    })

    it('allow ครอบคลุม root path', () => {
        const result = robots()
        const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
        const allAllowed = rules.flatMap((r) => (Array.isArray(r.allow) ? r.allow : [r.allow]))

        expect(allAllowed).toContain('/')
    })

    it('userAgent ตั้งค่าเป็น * (ทุก bot)', () => {
        const result = robots()
        const rules = Array.isArray(result.rules) ? result.rules : [result.rules]

        expect(rules.some((r) => r.userAgent === '*')).toBe(true)
    })
})
