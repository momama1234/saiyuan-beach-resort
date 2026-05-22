import {
    DEFAULT_PROMOTION_IMAGE_URL,
    getPromotionImageUrl,
    shouldBypassNextImageOptimization
} from './promotion-image-url'

describe('promotion image URL selection', () => {
    it('uses the card Display Image Variant when available', () => {
        expect(
            getPromotionImageUrl({
                imageUrl: 'https://legacy.example.com/raw-promotion.jpg',
                displayImage: {
                    thumbnail: {
                        url: 'https://cdn.example.com/320x240/promotions/promo.jpg',
                        width: 320,
                        height: 240
                    },
                    card: {
                        url: 'https://cdn.example.com/800x600/promotions/promo.jpg',
                        width: 800,
                        height: 600
                    },
                    hero: {
                        url: 'https://cdn.example.com/1600x900/promotions/promo.jpg',
                        width: 1600,
                        height: 900
                    },
                    original: {
                        url: 'https://cdn.example.com/2400x1600/promotions/promo.jpg',
                        width: 2400,
                        height: 1600
                    }
                }
            })
        ).toBe('https://cdn.example.com/800x600/promotions/promo.jpg')
    })

    it('ignores the legacy imageUrl when the Display Image Variant is unavailable', () => {
        expect(getPromotionImageUrl({ imageUrl: 'https://legacy.example.com/raw-promotion.jpg' })).toBe(
            DEFAULT_PROMOTION_IMAGE_URL
        )
    })

    it('preserves the local static fallback when promotion images fail closed', () => {
        expect(getPromotionImageUrl({ imageUrl: '', displayImage: null })).toBe(DEFAULT_PROMOTION_IMAGE_URL)
    })

    it('marks remote Display Image URLs for direct browser rendering', () => {
        expect(shouldBypassNextImageOptimization('https://cdn.example.com/800x600/promotions/promo.jpg')).toBe(true)
        expect(shouldBypassNextImageOptimization('/images/default-image.jpg')).toBe(false)
    })
})
