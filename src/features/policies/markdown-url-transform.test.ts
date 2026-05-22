import { safePolicyUrlTransform } from './markdown-url-transform'

describe('safePolicyUrlTransform', () => {
    it.each([
        ['javascript:alert(1)'],
        ['JavaScript:alert(1)'],
        ['  javascript:void(0)'],
        ['data:text/html,<script>alert(1)</script>'],
        ['vbscript:msgbox(1)'],
        ['file:///etc/passwd']
    ])('strips blocked scheme: %s', (input) => {
        expect(safePolicyUrlTransform(input)).toBe('')
    })

    it.each([
        ['https://example.com'],
        ['http://example.com/path?q=1'],
        ['mailto:hello@example.com'],
        ['tel:+66751234567'],
        ['/policies'],
        ['#cancellation'],
        ['./relative.html']
    ])('passes safe scheme through unchanged: %s', (input) => {
        expect(safePolicyUrlTransform(input)).toBe(input)
    })
})
