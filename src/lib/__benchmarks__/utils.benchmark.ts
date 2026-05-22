import Benchmark from 'benchmark'

import { buildApiUrl } from '../utils.js'

type BenchmarkSuiteTarget = Benchmark.Suite & Benchmark.Target

const suite = new Benchmark.Suite()
const isSuite = (target: Benchmark.Target): target is BenchmarkSuiteTarget =>
    typeof (target as BenchmarkSuiteTarget).filter === 'function'

// Test data for different scenarios
const simpleQueryParams = { checkIn: '2024-01-01', adults: '2' }
const pathAndQueryParams = {
    postId: '123',
    commentId: '456',
    includeReplies: 'true'
}
const complexQueryParams = {
    checkIn: '2024-01-01',
    checkOut: '2024-01-05',
    adults: '2',
    children: '1',
    roomType: 'deluxe',
    includeBreakfast: 'true'
}

// URLSearchParams with duplicates
const urlSearchParamsWithDuplicates = new URLSearchParams()
urlSearchParamsWithDuplicates.append('tag', 'javascript')
urlSearchParamsWithDuplicates.append('tag', 'typescript')
urlSearchParamsWithDuplicates.append('tag', 'react')

console.log('Running benchmarks for buildApiUrl function...\n')

suite
    // Scenario 1: Simple path without parameters
    .add('Simple path - no params', () => {
        buildApiUrl('/api/rooms')
    })
    // Scenario 2: Simple query parameters
    .add('Simple query params', () => {
        buildApiUrl('/api/rooms', simpleQueryParams)
    })
    // Scenario 3: Path parameters with query parameters
    .add('Path + query params', () => {
        buildApiUrl('/comment/post/:postId/comment/:commentId', pathAndQueryParams)
    })
    // Scenario 4: Path parameters only
    .add('Path params only', () => {
        buildApiUrl('/users/:userId/posts/:postId', { userId: '1', postId: '42' })
    })
    // Scenario 5: Complex query parameters
    .add('Complex query params', () => {
        buildApiUrl('/api/rooms', complexQueryParams)
    })
    // Scenario 6: URLSearchParams with duplicates
    .add('URLSearchParams with duplicates', () => {
        buildApiUrl('/api/posts', urlSearchParamsWithDuplicates)
    })
    // Scenario 7: Multiple path parameters
    .add('Multiple path params (5 segments)', () => {
        buildApiUrl('/api/:version/users/:userId/posts/:postId/comments/:commentId', {
            version: 'v1',
            userId: '123',
            postId: '456',
            commentId: '789'
        })
    })
    // Scenario 8: Path params with some null/undefined values
    .add('Path params with null/undefined filtering', () => {
        buildApiUrl('/users/:userId', {
            userId: '123',
            filter: undefined,
            sort: null,
            limit: '10'
        })
    })
    // Event listeners
    .on('cycle', (event: Benchmark.Event) => {
        console.log(String(event.target))
    })
    .on('complete', (event: Benchmark.Event) => {
        const suiteTarget = event.currentTarget as Benchmark.Target

        if (!isSuite(suiteTarget)) {
            return
        }

        console.log('\n' + '='.repeat(60))
        console.log('Fastest scenarios:')
        const fastest = suiteTarget.filter('fastest')
        fastest.forEach((bench: Benchmark) => {
            console.log(`  - ${bench.name}`)
        })
        console.log('\nSlowest scenarios:')
        const slowest = suiteTarget.filter('slowest')
        slowest.forEach((bench: Benchmark) => {
            console.log(`  - ${bench.name}`)
        })
        console.log('='.repeat(60))
    })
    .run({ async: false })
