/**
 * Server-side React component for adding structured data to pages
 * USE IN SERVER COMPONENTS ONLY for optimal SEO
 */

import { type BaseStructuredData } from '@/lib/seo-schema'

interface SEOSchemaProps {
    schema: BaseStructuredData | BaseStructuredData[]
    className?: string
}

/**
 * Server Component to inject structured data into the page
 *
 * IMPORTANT: Use this component in Server Components for best SEO results
 * Search engines need structured data to be present in the initial HTML response
 *
 * Usage in Server Component:
 * import { getHomepageSchemas } from '@/lib/seo-server'
 * const schemas = getHomepageSchemas()
 * return <SEOSchema schema={schemas} />
 */
export default function SEOSchema({ schema, className }: SEOSchemaProps) {
    const schemaArray = Array.isArray(schema) ? schema : [schema]

    return (
        <>
            {schemaArray.map((schemaItem, index) => (
                <script
                    key={`schema-${index}`}
                    type="application/ld+json"
                    className={className}
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schemaItem, null, 0)
                    }}
                />
            ))}
        </>
    )
}

/**
 * Alternative component that outputs pretty-formatted JSON for development
 * Usage: <SEOSchemaDebug schema={hotelSchema} />
 */
export function SEOSchemaDebug({ schema }: { schema: BaseStructuredData | BaseStructuredData[] }) {
    const schemaArray = Array.isArray(schema) ? schema : [schema]

    return (
        <div className="overflow-auto rounded-lg bg-gray-100 p-4">
            <h3 className="mb-2 text-sm font-bold">Structured Data Debug:</h3>
            {schemaArray.map((schemaItem, index) => (
                <pre key={index} className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(schemaItem, null, 2)}
                </pre>
            ))}
        </div>
    )
}
