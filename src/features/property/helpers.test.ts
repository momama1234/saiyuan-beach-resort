import { OPEN_PROPERTY_GALLERY_IMAGES_API_PATH } from '@/constants/path'
import { getDataWithToken } from '@/lib/api'

import { fetchPropertyImages } from './helpers'

jest.mock('@/lib/api', () => ({
    getDataWithToken: jest.fn()
}))

const getDataWithTokenMock = getDataWithToken as jest.MockedFunction<typeof getDataWithToken>

describe('fetchPropertyImages', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('fetches property gallery images from the guest-facing Open API and selects hero variants', async () => {
        getDataWithTokenMock.mockResolvedValue([
            {
                id: 2,
                imageUrl: 'https://cdn.thaivis.test/card-second.jpg',
                url: 'https://cdn.thaivis.test/card-second.jpg',
                rank: 2,
                displayImage: {
                    thumbnail: { url: 'https://cdn.thaivis.test/thumb-second.jpg', width: 320, height: 240 },
                    card: { url: 'https://cdn.thaivis.test/card-second.jpg', width: 800, height: 600 },
                    hero: { url: 'https://cdn.thaivis.test/hero-second.jpg', width: 1600, height: 900 },
                    original: { url: 'https://cdn.thaivis.test/original-second.jpg', width: 2400, height: 1600 }
                }
            },
            {
                id: 1,
                imageUrl: 'https://cdn.thaivis.test/card-first.jpg',
                url: 'https://cdn.thaivis.test/card-first.jpg',
                rank: 1,
                displayImage: {
                    thumbnail: { url: 'https://cdn.thaivis.test/thumb-first.jpg', width: 320, height: 240 },
                    card: { url: 'https://cdn.thaivis.test/card-first.jpg', width: 800, height: 600 },
                    hero: { url: 'https://cdn.thaivis.test/hero-first.jpg', width: 1600, height: 900 },
                    original: { url: 'https://cdn.thaivis.test/original-first.jpg', width: 2400, height: 1600 }
                }
            }
        ])

        const result = await fetchPropertyImages()

        expect(getDataWithTokenMock).toHaveBeenCalledWith(OPEN_PROPERTY_GALLERY_IMAGES_API_PATH, undefined, 300)
        expect(result).toEqual(['https://cdn.thaivis.test/hero-first.jpg', 'https://cdn.thaivis.test/hero-second.jpg'])
    })

    it('does not call the generic files endpoint that can expose raw storage URLs', async () => {
        getDataWithTokenMock.mockResolvedValue([])

        await fetchPropertyImages()

        expect(getDataWithTokenMock).not.toHaveBeenCalledWith(expect.stringContaining('/files/entity'))
    })
})
