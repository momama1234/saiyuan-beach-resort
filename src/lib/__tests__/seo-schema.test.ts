import { SEOSchemaGenerator } from '../seo-schema'

describe('SEOSchemaGenerator.generateFAQSchema', () => {
    it('returns FAQPage schema with correct @context and @type', () => {
        const result = SEOSchemaGenerator.generateFAQSchema({
            questions: [{ question: 'What time is check-in?', answer: 'Check-in is at 3:00 PM.' }]
        })

        expect(result['@context']).toBe('https://schema.org')
        expect(result['@type']).toBe('FAQPage')
    })

    it('maps each question to a Question entity with name and acceptedAnswer', () => {
        const result = SEOSchemaGenerator.generateFAQSchema({
            questions: [
                { question: 'What time is check-in?', answer: 'Check-in is at 3:00 PM.' },
                { question: 'Is breakfast included?', answer: 'Breakfast options are available.' }
            ]
        })

        type QuestionEntity = {
            '@type': string
            name: string
            acceptedAnswer: { '@type': string; text: string }
        }
        const entities = result.mainEntity as QuestionEntity[]

        expect(entities).toHaveLength(2)

        const first = entities[0]!
        const second = entities[1]!

        expect(first['@type']).toBe('Question')
        expect(first.name).toBe('What time is check-in?')
        expect(first.acceptedAnswer['@type']).toBe('Answer')
        expect(first.acceptedAnswer.text).toBe('Check-in is at 3:00 PM.')

        expect(second['@type']).toBe('Question')
        expect(second.name).toBe('Is breakfast included?')
        expect(second.acceptedAnswer.text).toBe('Breakfast options are available.')
    })

    it('returns empty mainEntity array when given no questions', () => {
        const result = SEOSchemaGenerator.generateFAQSchema({ questions: [] })

        expect(result['@type']).toBe('FAQPage')
        expect(result.mainEntity).toEqual([])
    })
})
