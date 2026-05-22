import type { Image } from '@/types/room-management'

import { getGalleryFullImageUrl, getGalleryPreviewImageUrl } from './gallery-image-url'

const image: Image = {
    id: 1,
    url: 'https://cdn.example.com/800x600/gallery/card.webp',
    categoryId: 5,
    displayImage: {
        thumbnail: {
            url: 'https://cdn.example.com/320x240/gallery/thumb.webp',
            width: 320,
            height: 240
        },
        card: {
            url: 'https://cdn.example.com/800x600/gallery/card.webp',
            width: 800,
            height: 600
        },
        hero: {
            url: 'https://cdn.example.com/1600x900/gallery/hero.webp',
            width: 1600,
            height: 900
        },
        original: {
            url: 'https://cdn.example.com/2400x1600/gallery/original.webp',
            width: 2400,
            height: 1600
        }
    }
}

describe('gallery image URL selection', () => {
    it('uses thumbnail variants for gallery previews', () => {
        expect(getGalleryPreviewImageUrl(image)).toBe('https://cdn.example.com/320x240/gallery/thumb.webp')
    })

    it('uses original variants for full gallery images', () => {
        expect(getGalleryFullImageUrl(image)).toBe('https://cdn.example.com/2400x1600/gallery/original.webp')
    })

    it('falls back to legacy url when variants are absent', () => {
        const legacyImage = {
            id: 1,
            url: 'https://cdn.example.com/800x600/gallery/card.webp',
            categoryId: 5
        }

        expect(getGalleryPreviewImageUrl(legacyImage)).toBe(legacyImage.url)
        expect(getGalleryFullImageUrl(legacyImage)).toBe(legacyImage.url)
    })
})
