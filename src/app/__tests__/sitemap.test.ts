import { getChangeFrequency, getPriority } from '../sitemap'

const mockFetch = jest.fn()
global.fetch = mockFetch

const BASE_URL = 'https://test-hotel.com'

const MOCK_ROOMS = [{ slug: 'deluxe-room' }, { slug: 'suite' }]
const MOCK_GALLERY_CATEGORIES = [
    { id: 1, name: 'Pool', isActive: true },
    { id: 2, name: 'PROPERTY', isActive: true },
    { id: 3, name: 'Restaurant', isActive: false },
    { id: 4, name: 'Spa & Wellness', isActive: true }
]
const MOCK_CONTENT_SLUGS = [{ slug: 'about-us' }, { slug: 'facilities' }]

function makeOkResponse(data: unknown) {
    return {
        ok: true,
        json: () => Promise.resolve(data)
    }
}

function makeFailResponse() {
    return { ok: false, json: () => Promise.resolve([]) }
}

beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = BASE_URL
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3010/v1'
    jest.resetModules()
    mockFetch.mockReset()
})

afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.NEXT_PUBLIC_API_URL
})

describe('sitemap()', () => {
    function setupFetchMocks() {
        mockFetch
            .mockResolvedValueOnce(makeOkResponse(MOCK_CONTENT_SLUGS))
            .mockResolvedValueOnce(makeOkResponse(MOCK_ROOMS))
            .mockResolvedValueOnce(makeOkResponse(MOCK_GALLERY_CATEGORIES))
    }

    it('ผลิต URL EN และ TH สำหรับทุก room slug', async () => {
        setupFetchMocks()
        const { default: sitemap } = await import('../sitemap')
        const entries = await sitemap()
        const urls = entries.map((e) => e.url)

        expect(urls).toContain(`${BASE_URL}/rooms/deluxe-room`)
        expect(urls).toContain(`${BASE_URL}/th/rooms/deluxe-room`)
        expect(urls).toContain(`${BASE_URL}/rooms/suite`)
        expect(urls).toContain(`${BASE_URL}/th/rooms/suite`)
    })

    it('ผลิต URL EN และ TH สำหรับ gallery categories ที่ active (ยกเว้น PROPERTY)', async () => {
        setupFetchMocks()
        const { default: sitemap } = await import('../sitemap')
        const entries = await sitemap()
        const urls = entries.map((e) => e.url)

        expect(urls).toContain(`${BASE_URL}/gallery/pool`)
        expect(urls).toContain(`${BASE_URL}/th/gallery/pool`)
        expect(urls).toContain(`${BASE_URL}/gallery/spa-and-wellness`)
        expect(urls).toContain(`${BASE_URL}/th/gallery/spa-and-wellness`)

        expect(urls).not.toContain(`${BASE_URL}/gallery/property`)
        expect(urls).not.toContain(`${BASE_URL}/gallery/restaurant`)
    })

    it('มี static URL ที่จำเป็นครบถ้วน', async () => {
        setupFetchMocks()
        const { default: sitemap } = await import('../sitemap')
        const entries = await sitemap()
        const urls = entries.map((e) => e.url)

        const expectedStatics = [
            `${BASE_URL}/`,
            `${BASE_URL}/th`,
            `${BASE_URL}/gallery`,
            `${BASE_URL}/th/gallery`,
            `${BASE_URL}/reservations`,
            `${BASE_URL}/th/reservations`,
            `${BASE_URL}/contact`,
            `${BASE_URL}/th/contact`,
            `${BASE_URL}/contact-booking`,
            `${BASE_URL}/th/contact-booking`,
            `${BASE_URL}/policies`,
            `${BASE_URL}/th/policies`,
            `${BASE_URL}/special-offers`,
            `${BASE_URL}/th/special-offers`,
            `${BASE_URL}/videos`,
            `${BASE_URL}/th/videos`
        ]

        for (const url of expectedStatics) {
            expect(urls).toContain(url)
        }
    })

    it('ไม่มี transactional pages ใน sitemap', async () => {
        setupFetchMocks()
        const { default: sitemap } = await import('../sitemap')
        const entries = await sitemap()
        const urls = entries.map((e) => e.url)

        const excluded = [
            '/reservations/success',
            '/th/reservations/success',
            '/contact-booking/success',
            '/th/contact-booking/success',
            '/manage-booking',
            '/th/manage-booking'
        ]

        for (const path of excluded) {
            expect(urls).not.toContain(`${BASE_URL}${path}`)
        }
    })

    it('ทุก entry มี alternates.languages ที่มีทั้ง key en และ th', async () => {
        setupFetchMocks()
        const { default: sitemap } = await import('../sitemap')
        const entries = await sitemap()

        for (const entry of entries) {
            expect(entry.alternates?.languages).toBeDefined()
            expect(entry.alternates!.languages).toHaveProperty('en')
            expect(entry.alternates!.languages).toHaveProperty('th')
        }
    })

    it('มี content slugs ใน sitemap', async () => {
        setupFetchMocks()
        const { default: sitemap } = await import('../sitemap')
        const entries = await sitemap()
        const urls = entries.map((e) => e.url)

        expect(urls).toContain(`${BASE_URL}/about-us`)
        expect(urls).toContain(`${BASE_URL}/th/about-us`)
        expect(urls).toContain(`${BASE_URL}/facilities`)
        expect(urls).toContain(`${BASE_URL}/th/facilities`)
    })

    it('เมื่อ API rooms ล้มเหลว ส่วน rooms return empty ไม่ crash', async () => {
        mockFetch
            .mockResolvedValueOnce(makeOkResponse(MOCK_CONTENT_SLUGS))
            .mockResolvedValueOnce(makeFailResponse())
            .mockResolvedValueOnce(makeOkResponse(MOCK_GALLERY_CATEGORIES))

        const { default: sitemap } = await import('../sitemap')
        const entries = await sitemap()
        const urls = entries.map((e) => e.url)

        expect(urls).not.toContain(`${BASE_URL}/rooms/deluxe-room`)
        expect(urls).toContain(`${BASE_URL}/`)
    })

    it('เมื่อ API gallery ล้มเหลว ส่วน gallery return empty ไม่ crash', async () => {
        mockFetch
            .mockResolvedValueOnce(makeOkResponse(MOCK_CONTENT_SLUGS))
            .mockResolvedValueOnce(makeOkResponse(MOCK_ROOMS))
            .mockResolvedValueOnce(makeFailResponse())

        const { default: sitemap } = await import('../sitemap')
        const entries = await sitemap()
        const urls = entries.map((e) => e.url)

        expect(urls).not.toContain(`${BASE_URL}/gallery/pool`)
        expect(urls).toContain(`${BASE_URL}/rooms/deluxe-room`)
    })

    it('เมื่อ API content ล้มเหลว ส่วน content return empty ไม่ crash', async () => {
        mockFetch
            .mockResolvedValueOnce(makeFailResponse())
            .mockResolvedValueOnce(makeOkResponse(MOCK_ROOMS))
            .mockResolvedValueOnce(makeOkResponse(MOCK_GALLERY_CATEGORIES))

        const { default: sitemap } = await import('../sitemap')
        const entries = await sitemap()
        const urls = entries.map((e) => e.url)

        expect(urls).not.toContain(`${BASE_URL}/about-us`)
        expect(urls).toContain(`${BASE_URL}/rooms/deluxe-room`)
    })
})

describe('getChangeFrequency()', () => {
    it('home (empty path) → weekly', () => {
        expect(getChangeFrequency('')).toBe('weekly')
    })

    it('reservations → weekly', () => {
        expect(getChangeFrequency('reservations')).toBe('weekly')
    })

    it('special-offers → weekly', () => {
        expect(getChangeFrequency('special-offers')).toBe('weekly')
    })

    it('rooms/* → monthly', () => {
        expect(getChangeFrequency('rooms/deluxe-room')).toBe('monthly')
        expect(getChangeFrequency('rooms/suite')).toBe('monthly')
    })

    it('gallery → monthly', () => {
        expect(getChangeFrequency('gallery')).toBe('monthly')
        expect(getChangeFrequency('gallery/pool')).toBe('monthly')
    })

    it('videos → monthly', () => {
        expect(getChangeFrequency('videos')).toBe('monthly')
    })

    it('contact → monthly', () => {
        expect(getChangeFrequency('contact')).toBe('monthly')
    })

    it('contact-booking → monthly', () => {
        expect(getChangeFrequency('contact-booking')).toBe('monthly')
    })

    it('policies → yearly', () => {
        expect(getChangeFrequency('policies')).toBe('yearly')
    })

    it('unknown path → monthly (default)', () => {
        expect(getChangeFrequency('about-us')).toBe('monthly')
    })
})

describe('getPriority()', () => {
    it('home (empty path) → 1.0', () => {
        expect(getPriority('')).toBe(1.0)
    })

    it('reservations → 0.9', () => {
        expect(getPriority('reservations')).toBe(0.9)
    })

    it('rooms/* → 0.9', () => {
        expect(getPriority('rooms/deluxe-room')).toBe(0.9)
        expect(getPriority('rooms/suite')).toBe(0.9)
    })

    it('special-offers → 0.8', () => {
        expect(getPriority('special-offers')).toBe(0.8)
    })

    it('gallery → 0.8', () => {
        expect(getPriority('gallery')).toBe(0.8)
        expect(getPriority('gallery/pool')).toBe(0.8)
    })

    it('contact → 0.7', () => {
        expect(getPriority('contact')).toBe(0.7)
    })

    it('contact-booking → 0.7', () => {
        expect(getPriority('contact-booking')).toBe(0.7)
    })

    it('videos → 0.7', () => {
        expect(getPriority('videos')).toBe(0.7)
    })

    it('policies → 0.5', () => {
        expect(getPriority('policies')).toBe(0.5)
    })

    it('unknown path → 0.7 (default)', () => {
        expect(getPriority('about-us')).toBe(0.7)
    })
})
