import { buildApiUrl, cn, createSlugFromName, generateUUID } from '../utils'

describe('buildApiUrl', () => {
    describe('Basic Functionality', () => {
        it('should return path without params when params is null', () => {
            const result = buildApiUrl('/api/rooms', null)
            expect(result).toBe('/api/rooms')
        })

        it('should return path without params when params is undefined', () => {
            const result = buildApiUrl('/api/rooms', undefined)
            expect(result).toBe('/api/rooms')
        })

        it('should return path without params when params is empty object', () => {
            const result = buildApiUrl('/api/rooms', {})
            expect(result).toBe('/api/rooms')
        })
    })

    describe('Query Parameters Only', () => {
        it('should build URL with single query parameter', () => {
            const result = buildApiUrl('/api/rooms', { checkIn: '2024-01-01' })
            expect(result).toBe('/api/rooms?checkIn=2024-01-01')
        })

        it('should build URL with multiple query parameters', () => {
            const result = buildApiUrl('/api/rooms', {
                checkIn: '2024-01-01',
                checkOut: '2024-01-05',
                adults: '2',
                children: '1'
            })
            expect(result).toBe('/api/rooms?checkIn=2024-01-01&checkOut=2024-01-05&adults=2&children=1')
        })

        it('should handle URLSearchParams input', () => {
            const params = new URLSearchParams({
                checkIn: '2024-01-01',
                adults: '2'
            })
            const result = buildApiUrl('/api/rooms', params)
            expect(result).toBe('/api/rooms?checkIn=2024-01-01&adults=2')
        })

        it('should handle empty URLSearchParams', () => {
            const params = new URLSearchParams()
            const result = buildApiUrl('/api/rooms', params)
            expect(result).toBe('/api/rooms')
        })
    })

    describe('Path Parameters Only', () => {
        it('should replace single path parameter', () => {
            const result = buildApiUrl('/users/:userId', { userId: '123' })
            expect(result).toBe('/users/123')
        })

        it('should replace multiple path parameters', () => {
            const result = buildApiUrl('/users/:userId/posts/:postId', {
                userId: '123',
                postId: '456'
            })
            expect(result).toBe('/users/123/posts/456')
        })

        it('should handle complex path with multiple parameters', () => {
            const result = buildApiUrl('/comment/post/:postId/comment/:commentId', {
                postId: '789',

                commentId: '101'
            })
            expect(result).toBe('/comment/post/789/comment/101')
        })
    })

    describe('Combined Path and Query Parameters', () => {
        it('should handle both path and query parameters', () => {
            const result = buildApiUrl('/users/:userId/posts', {
                userId: '123',
                status: 'published',
                limit: '10'
            })
            expect(result).toBe('/users/123/posts?status=published&limit=10')
        })

        it('should handle complex mixed parameters', () => {
            const result = buildApiUrl('/comment/post/:postId/comment/:commentId', {
                postId: '123',
                commentId: '456',
                includeReplies: 'true',
                sort: 'desc'
            })
            expect(result).toBe('/comment/post/123/comment/456?includeReplies=true&sort=desc')
        })

        it('should correctly separate path params from query params', () => {
            const result = buildApiUrl('/api/:version/users/:userId', {
                version: 'v1',
                userId: '123',
                fields: 'name,email',
                include: 'profile'
            })
            expect(result).toBe('/api/v1/users/123?fields=name%2Cemail&include=profile')
        })
    })

    describe('Type Conversion', () => {
        it('should convert number to string', () => {
            const result = buildApiUrl('/api/rooms', {
                adults: 2,
                children: 1
            })
            expect(result).toBe('/api/rooms?adults=2&children=1')
        })

        it('should convert boolean to string', () => {
            const result = buildApiUrl('/api/rooms', {
                includeUnavailable: true,
                showPrices: false
            })
            expect(result).toBe('/api/rooms?includeUnavailable=true&showPrices=false')
        })

        it('should handle mixed types', () => {
            const result = buildApiUrl('/api/search', {
                query: 'test',
                page: 1,
                exact: true
            })
            expect(result).toBe('/api/search?query=test&page=1&exact=true')
        })

        it('should handle number in path parameters', () => {
            const result = buildApiUrl('/users/:userId', { userId: 123 })
            expect(result).toBe('/users/123')
        })
    })

    describe('Edge Cases - Empty Values', () => {
        it('should skip undefined values', () => {
            const result = buildApiUrl('/api/rooms', {
                checkIn: '2024-01-01',
                checkOut: undefined,
                adults: '2'
            })
            expect(result).toBe('/api/rooms?checkIn=2024-01-01&adults=2')
        })

        it('should skip null values', () => {
            const result = buildApiUrl('/api/rooms', {
                checkIn: '2024-01-01',
                checkOut: null,
                adults: '2'
            })
            expect(result).toBe('/api/rooms?checkIn=2024-01-01&adults=2')
        })

        it('should skip empty string values', () => {
            const result = buildApiUrl('/api/rooms', {
                checkIn: '2024-01-01',
                checkOut: '',
                adults: '2'
            })
            expect(result).toBe('/api/rooms?checkIn=2024-01-01&adults=2')
        })

        it('should handle all empty values', () => {
            const result = buildApiUrl('/api/rooms', {
                checkIn: undefined,
                checkOut: null,
                adults: ''
            })
            expect(result).toBe('/api/rooms')
        })
    })

    describe('Edge Cases - Missing Path Parameters', () => {
        it('should warn and leave placeholder when path param is missing', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

            const result = buildApiUrl('/users/:userId/posts/:postId', {
                userId: '123'
                // postId is missing
            })

            expect(result).toBe('/users/123/posts/:postId')
            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Missing values for path parameters'))

            consoleWarnSpy.mockRestore()
        })

        it('should warn when all path params are missing', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

            const result = buildApiUrl('/users/:userId/posts/:postId', {})

            expect(result).toBe('/users/:userId/posts/:postId')
            expect(consoleWarnSpy).toHaveBeenCalled()

            consoleWarnSpy.mockRestore()
        })

        it('should handle empty value for path parameter', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

            const result = buildApiUrl('/users/:userId', { userId: '' })

            // Empty string is filtered out
            expect(result).toBe('/users/:userId')
            expect(consoleWarnSpy).toHaveBeenCalled()

            consoleWarnSpy.mockRestore()
        })
    })

    describe('Edge Cases - Special Characters', () => {
        it('should URL encode special characters in query params', () => {
            const result = buildApiUrl('/api/search', {
                query: 'hello world',
                filter: 'name=John'
            })
            expect(result).toBe('/api/search?query=hello+world&filter=name%3DJohn')
        })

        it('should handle special characters in path params', () => {
            const result = buildApiUrl('/api/:category', {
                category: 'food & drinks'
            })
            // URLSearchParams doesn't encode path params, they go as-is
            expect(result).toBe('/api/food & drinks')
        })

        it('should handle unicode characters', () => {
            const result = buildApiUrl('/api/search', {
                query: '你好',
                category: 'สวัสดี'
            })
            expect(result).toContain('query=%E4%BD%A0%E5%A5%BD')
            expect(result).toContain('category=%E0%B8%AA%E0%B8%A7%E0%B8%B1%E0%B8%AA%E0%B8%94%E0%B8%B5')
        })
    })

    describe('Edge Cases - Extra Parameters', () => {
        it('should include extra parameters as query params', () => {
            const result = buildApiUrl('/users/:userId', {
                userId: '123',
                includeProfile: 'true',
                fields: 'name,email'
            })
            expect(result).toBe('/users/123?includeProfile=true&fields=name%2Cemail')
        })

        it('should handle path with no params but receiving params', () => {
            const result = buildApiUrl('/api/rooms', {
                someParam: 'value'
            })
            expect(result).toBe('/api/rooms?someParam=value')
        })
    })

    describe('Edge Cases - Path Variations', () => {
        it('should handle path without leading slash', () => {
            const result = buildApiUrl('api/rooms', { checkIn: '2024-01-01' })
            expect(result).toBe('api/rooms?checkIn=2024-01-01')
        })

        it('should handle path with trailing slash', () => {
            const result = buildApiUrl('/api/rooms/', { checkIn: '2024-01-01' })
            expect(result).toBe('/api/rooms/?checkIn=2024-01-01')
        })

        it('should handle empty path', () => {
            const result = buildApiUrl('', { checkIn: '2024-01-01' })
            expect(result).toBe('?checkIn=2024-01-01')
        })

        it('should handle root path', () => {
            const result = buildApiUrl('/', { checkIn: '2024-01-01' })
            expect(result).toBe('/?checkIn=2024-01-01')
        })
    })

    describe('Edge Cases - Parameter Names', () => {
        it('should handle parameter names with similar prefixes', () => {
            const result = buildApiUrl('/api/:id/:itemId', {
                id: '123',
                itemId: '456'
            })
            expect(result).toBe('/api/123/456')
        })

        it('should handle single letter path params', () => {
            const result = buildApiUrl('/api/:v/:id', {
                v: '1',
                id: '123'
            })
            expect(result).toBe('/api/1/123')
        })

        it('should handle underscore in param names', () => {
            const result = buildApiUrl('/api/:user_id/:post_id', {
                user_id: '123',
                post_id: '456'
            })
            expect(result).toBe('/api/123/456')
        })

        it('should handle camelCase param names', () => {
            const result = buildApiUrl('/api/:userId/:postId', {
                userId: '123',
                postId: '456'
            })
            expect(result).toBe('/api/123/456')
        })
    })

    describe('Real-world Scenarios', () => {
        it('should handle reservation search scenario', () => {
            const result = buildApiUrl('/open/room-class-available', {
                checkIn: '2024-12-14',
                checkOut: '2024-12-15',
                adults: '2',
                children: '0'
            })
            expect(result).toBe('/open/room-class-available?checkIn=2024-12-14&checkOut=2024-12-15&adults=2&children=0')
        })

        it('should handle user profile with path params', () => {
            const result = buildApiUrl('/api/users/:userId/profile', {
                userId: '123',
                include: 'posts,comments',
                limit: '50'
            })
            expect(result).toBe('/api/users/123/profile?include=posts%2Ccomments&limit=50')
        })

        it('should handle nested resource paths', () => {
            const result = buildApiUrl('/api/:version/properties/:propertyId/rooms/:roomId', {
                version: 'v1',
                propertyId: '100',
                roomId: '5',
                expand: 'amenities'
            })
            expect(result).toBe('/api/v1/properties/100/rooms/5?expand=amenities')
        })

        it('should handle pagination with filtering', () => {
            const result = buildApiUrl('/api/bookings/:bookingId/details', {
                bookingId: 'BK123',
                page: 1,
                perPage: 20,
                status: 'confirmed',
                sortBy: 'createdAt'
            })
            expect(result).toBe('/api/bookings/BK123/details?page=1&perPage=20&status=confirmed&sortBy=createdAt')
        })
    })

    describe('Zero and Falsy Values', () => {
        it('should include zero as valid value', () => {
            const result = buildApiUrl('/api/rooms', {
                adults: 0,
                children: 0
            })
            // Note: Our current implementation filters out 0 because we check for falsy values
            // This test documents current behavior
            expect(result).toBe('/api/rooms?adults=0&children=0')
        })

        it('should include false boolean as valid value', () => {
            const result = buildApiUrl('/api/rooms', {
                includeUnavailable: false
            })
            expect(result).toBe('/api/rooms?includeUnavailable=false')
        })

        it('should differentiate between undefined and zero', () => {
            const result = buildApiUrl('/api/rooms', {
                adults: 0,
                children: undefined
            })
            expect(result).toBe('/api/rooms?adults=0')
        })
    })

    describe('Edge Cases - Duplicate Parameter Keys', () => {
        it('should handle URLSearchParams with duplicate keys (multiple values)', () => {
            const params = new URLSearchParams()
            params.append('tag', 'javascript')
            params.append('tag', 'typescript')
            params.append('tag', 'react')

            const result = buildApiUrl('/api/posts', params)

            // Duplicate keys are combined into comma-separated values
            expect(result).toBe('/api/posts?tag=javascript%2Ctypescript%2Creact')
        })

        it('should use path param when key exists in both path and params object', () => {
            // When a key is used as both path param and provided in params,
            // it should be used for path replacement and removed from query params
            const result = buildApiUrl('/users/:userId', {
                userId: '123',
                status: 'active'
            })
            // userId is used for path, not duplicated in query
            expect(result).toBe('/users/123?status=active')
            expect(result).not.toContain('userId=')
        })

        it('should throw error when same key name appears in path multiple times', () => {
            // Path parameters with duplicate names are not allowed
            // This prevents ambiguous URL patterns
            expect(() => {
                buildApiUrl('/api/:version/users/:version', {
                    version: 'v2',
                    include: 'profile'
                })
            }).toThrow(/Duplicate path parameter names found: version/)
        })

        it('should document object literal behavior with duplicate keys', () => {
            // JavaScript objects cannot have duplicate keys - the last value wins
            // This test documents that this is a JavaScript language limitation
            // We construct the object this way to avoid TS compile error
            const params: Record<string, string> = {}
            params['tag'] = 'first'
            params['tag'] = 'second' // This overwrites the previous 'tag' value

            const result = buildApiUrl('/api/posts', params)
            // Only the last value is retained in the object
            expect(result).toBe('/api/posts?tag=second')
        })

        it('should handle URLSearchParams with duplicate keys and path params', () => {
            const params = new URLSearchParams()
            params.append('filter', 'active')
            params.append('filter', 'pending')

            const result = buildApiUrl('/api/users/:userId/tasks', params)
            // Since URLSearchParams doesn't handle path params, they remain in the path
            // and duplicate query keys are combined with commas
            expect(result).toBe('/api/users/:userId/tasks?filter=active%2Cpending')
        })
    })
})

describe('cn', () => {
    describe('Basic Functionality', () => {
        it('should merge simple class names', () => {
            const result = cn('class1', 'class2', 'class3')
            expect(result).toBe('class1 class2 class3')
        })

        it('should handle single class name', () => {
            const result = cn('single-class')
            expect(result).toBe('single-class')
        })

        it('should handle empty input', () => {
            const result = cn()
            expect(result).toBe('')
        })

        it('should handle multiple space-separated classes in one string', () => {
            const result = cn('class1 class2', 'class3 class4')
            expect(result).toBe('class1 class2 class3 class4')
        })
    })

    describe('Tailwind Class Conflict Resolution', () => {
        it('should resolve padding conflicts (last one wins)', () => {
            const result = cn('px-2 py-1', 'px-4')
            expect(result).toBe('py-1 px-4')
        })

        it('should resolve margin conflicts', () => {
            const result = cn('m-2', 'm-4')
            expect(result).toBe('m-4')
        })

        it('should resolve background color conflicts', () => {
            const result = cn('bg-blue-500', 'bg-red-500')
            expect(result).toBe('bg-red-500')
        })

        it('should resolve text color conflicts', () => {
            const result = cn('text-sm text-gray-500', 'text-lg text-blue-600')
            expect(result).toBe('text-lg text-blue-600')
        })

        it('should resolve width conflicts', () => {
            const result = cn('w-full', 'w-1/2')
            expect(result).toBe('w-1/2')
        })

        it('should keep non-conflicting Tailwind classes', () => {
            const result = cn('px-4 py-2 bg-blue-500', 'rounded-lg shadow-md')
            expect(result).toBe('px-4 py-2 bg-blue-500 rounded-lg shadow-md')
        })

        it('should handle complex Tailwind conflicts', () => {
            const result = cn('px-2 py-1 text-sm bg-blue-500 rounded', 'px-4 text-lg bg-red-500')
            expect(result).toBe('py-1 rounded px-4 text-lg bg-red-500')
        })
    })

    describe('Conditional Classes with Objects', () => {
        it('should include classes when condition is true', () => {
            const result = cn('base', { active: true })
            expect(result).toBe('base active')
        })

        it('should exclude classes when condition is false', () => {
            const result = cn('base', { inactive: false })
            expect(result).toBe('base')
        })

        it('should handle multiple conditional classes', () => {
            const result = cn('base', {
                active: true,
                disabled: false,
                highlighted: true
            })
            expect(result).toBe('base active highlighted')
        })

        it('should handle mixed strings and conditionals', () => {
            const isActive = true
            const isDisabled = false
            const result = cn('btn', 'btn-primary', {
                'btn-active': isActive,
                'btn-disabled': isDisabled
            })
            expect(result).toBe('btn btn-primary btn-active')
        })
    })

    describe('Array Handling', () => {
        it('should handle array of classes', () => {
            const result = cn(['class1', 'class2', 'class3'])
            expect(result).toBe('class1 class2 class3')
        })

        it('should handle nested arrays', () => {
            const result = cn(['class1', ['class2', 'class3']])
            expect(result).toBe('class1 class2 class3')
        })

        it('should handle arrays with conditionals', () => {
            const result = cn(['base', { active: true, disabled: false }])
            expect(result).toBe('base active')
        })

        it('should handle mixed arrays and strings', () => {
            const result = cn('base', ['array1', 'array2'], 'final')
            expect(result).toBe('base array1 array2 final')
        })
    })

    describe('Falsy Values Handling', () => {
        it('should ignore undefined values', () => {
            const result = cn('class1', undefined, 'class2')
            expect(result).toBe('class1 class2')
        })

        it('should ignore null values', () => {
            const result = cn('class1', null, 'class2')
            expect(result).toBe('class1 class2')
        })

        it('should ignore false values', () => {
            const result = cn('class1', false, 'class2')
            expect(result).toBe('class1 class2')
        })

        it('should ignore empty strings', () => {
            const result = cn('class1', '', 'class2')
            expect(result).toBe('class1 class2')
        })

        it('should handle all falsy values', () => {
            const result = cn('class1', undefined, null, false, '', 'class2')
            expect(result).toBe('class1 class2')
        })

        it('should ignore 0 and NaN', () => {
            const result = cn('class1', 0, NaN, 'class2')
            expect(result).toBe('class1 class2')
        })
    })

    describe('Component Props Pattern', () => {
        it('should allow props.className to override defaults', () => {
            const defaultClasses = 'px-4 py-2 bg-blue-500'
            const propsClassName = 'px-6 bg-red-500'
            const result = cn(defaultClasses, propsClassName)
            expect(result).toBe('py-2 px-6 bg-red-500')
        })

        it('should handle optional className prop', () => {
            const defaultClasses = 'btn btn-primary'
            const propsClassName = undefined
            const result = cn(defaultClasses, propsClassName)
            expect(result).toBe('btn btn-primary')
        })

        it('should merge variant classes with props', () => {
            const baseClasses = 'btn'
            const variantClasses = 'btn-lg btn-primary'
            const propsClassName = 'custom-class'
            const result = cn(baseClasses, variantClasses, propsClassName)
            expect(result).toBe('btn btn-lg btn-primary custom-class')
        })
    })

    describe('Real-world Component Scenarios', () => {
        it('should handle button component with variants', () => {
            const variant: string = 'primary'
            const size: string = 'lg'
            const disabled = false

            const result = cn('btn rounded transition-colors', {
                'bg-blue-500 hover:bg-blue-600': variant === 'primary',
                'bg-gray-500 hover:bg-gray-600': variant === 'secondary',
                'px-4 py-2 text-sm': size === 'sm',
                'px-6 py-3 text-base': size === 'lg',
                'opacity-50 cursor-not-allowed': disabled
            })
            expect(result).toContain('btn')
            expect(result).toContain('bg-blue-500')
            expect(result).toContain('px-6 py-3')
            expect(result).not.toContain('opacity-50')
        })

        it('should handle card component with conditional states', () => {
            const isHovered = true
            const isSelected = false

            const result = cn('card p-4 rounded-lg border', {
                'shadow-lg scale-105': isHovered,
                'border-blue-500 bg-blue-50': isSelected,
                'border-gray-200': !isSelected
            })
            expect(result).toContain('shadow-lg')
            expect(result).toContain('border-gray-200')
            expect(result).not.toContain('border-blue-500')
        })

        it('should handle input component with validation states', () => {
            const hasError = true
            const isDisabled = false

            const result = cn('input w-full px-3 py-2 border rounded', {
                'border-red-500 focus:ring-red-500': hasError,
                'border-gray-300 focus:ring-blue-500': !hasError,
                'bg-gray-100 cursor-not-allowed': isDisabled
            })
            expect(result).toContain('border-red-500')
            expect(result).not.toContain('bg-gray-100')
        })

        it('should handle responsive classes', () => {
            const result = cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3', 'gap-4 md:gap-6 lg:gap-8')
            expect(result).toContain('grid-cols-1')
            expect(result).toContain('md:grid-cols-2')
            expect(result).toContain('lg:grid-cols-3')
        })
    })

    describe('Edge Cases', () => {
        it('should handle duplicate class names', () => {
            // Note: clsx/tailwind-merge doesn't deduplicate non-Tailwind classes
            const result = cn('class1', 'class1', 'class2')
            expect(result).toBe('class1 class1 class2')
        })

        it('should handle very long class strings', () => {
            const longClasses = 'a b c d e f g h i j k l m n o p q r s t u v w x y z'
            const result = cn(longClasses, 'extra')
            expect(result).toContain('a')
            expect(result).toContain('z')
            expect(result).toContain('extra')
        })

        it('should handle special characters in class names', () => {
            const result = cn('class-with-dash', 'class_with_underscore', 'class:with:colon')
            expect(result).toContain('class-with-dash')
            expect(result).toContain('class_with_underscore')
            expect(result).toContain('class:with:colon')
        })

        it('should handle empty object', () => {
            const result = cn('base', {})
            expect(result).toBe('base')
        })

        it('should handle empty array', () => {
            const result = cn('base', [])
            expect(result).toBe('base')
        })
    })
})

describe('createSlugFromName', () => {
    describe('Basic Functionality', () => {
        it('should convert simple text to lowercase slug', () => {
            const result = createSlugFromName('Restaurant')
            expect(result).toBe('restaurant')
        })

        it('should convert spaces to hyphens', () => {
            const result = createSlugFromName('Beach Resort')
            expect(result).toBe('beach-resort')
        })

        it('should handle multiple words', () => {
            const result = createSlugFromName('Luxury Beach Resort Hotel')
            expect(result).toBe('luxury-beach-resort-hotel')
        })

        it('should return empty string for empty input', () => {
            const result = createSlugFromName('')
            expect(result).toBe('')
        })
    })

    describe('Ampersand Handling', () => {
        it('should convert & to -and-', () => {
            const result = createSlugFromName('Resort & Beach')
            expect(result).toBe('resort-and-beach')
        })

        it('should handle multiple ampersands', () => {
            const result = createSlugFromName('Food & Drinks & Entertainment')
            expect(result).toBe('food-and-drinks-and-entertainment')
        })

        it('should handle ampersand with no spaces', () => {
            const result = createSlugFromName('Rock&Roll')
            expect(result).toBe('rock-and-roll')
        })

        it('should handle ampersand at start or end', () => {
            const result = createSlugFromName('& Beach Resort &')
            expect(result).toBe('and-beach-resort-and')
        })
    })

    describe('Underscore Handling', () => {
        it('should convert underscores to hyphens', () => {
            const result = createSlugFromName('swimming_pool')
            expect(result).toBe('swimming-pool')
        })

        it('should handle multiple underscores', () => {
            const result = createSlugFromName('beach_resort_hotel')
            expect(result).toBe('beach-resort-hotel')
        })

        it('should handle consecutive underscores', () => {
            const result = createSlugFromName('beach__resort')
            expect(result).toBe('beach-resort')
        })

        it('should handle mixed spaces and underscores', () => {
            const result = createSlugFromName('beach resort_hotel')
            expect(result).toBe('beach-resort-hotel')
        })
    })

    describe('Special Characters Removal', () => {
        it('should remove parentheses', () => {
            const result = createSlugFromName('Restaurant (Downtown)')
            expect(result).toBe('restaurant-downtown')
        })

        it('should remove exclamation marks', () => {
            const result = createSlugFromName('Amazing Beach!')
            expect(result).toBe('amazing-beach')
        })

        it('should remove question marks', () => {
            const result = createSlugFromName('Need Help?')
            expect(result).toBe('need-help')
        })

        it('should remove commas', () => {
            const result = createSlugFromName('Food, Drinks, Fun')
            expect(result).toBe('food-drinks-fun')
        })

        it('should remove periods', () => {
            const result = createSlugFromName('Dr. Smith')
            expect(result).toBe('dr-smith')
        })

        it('should remove apostrophes', () => {
            const result = createSlugFromName("John's Restaurant")
            expect(result).toBe('johns-restaurant')
        })

        it('should remove quotes', () => {
            const result = createSlugFromName('"The Best" Resort')
            expect(result).toBe('the-best-resort')
        })

        it('should remove slashes', () => {
            const result = createSlugFromName('Bed/Breakfast')
            expect(result).toBe('bedbreakfast')
        })

        it('should remove at symbols', () => {
            const result = createSlugFromName('Email@Domain')
            expect(result).toBe('emaildomain')
        })

        it('should remove hash symbols', () => {
            const result = createSlugFromName('Room #123')
            expect(result).toBe('room-123')
        })
    })

    describe('Unicode and Accented Characters', () => {
        it('should handle accented characters (café)', () => {
            const result = createSlugFromName('Café')
            expect(result).toBe('caf')
        })

        it('should handle multiple accented characters', () => {
            const result = createSlugFromName('Café & Bar (Naïve)')
            expect(result).toBe('caf-and-bar-nave')
        })

        it('should handle German umlauts', () => {
            const result = createSlugFromName('Müller')
            expect(result).toBe('mller')
        })

        it('should handle Spanish characters', () => {
            const result = createSlugFromName('Niño')
            expect(result).toBe('nio')
        })

        it('should handle French characters', () => {
            const result = createSlugFromName('Château')
            expect(result).toBe('chteau')
        })
    })

    describe('Multiple Spaces and Hyphens', () => {
        it('should collapse multiple spaces into single hyphen', () => {
            const result = createSlugFromName('Beach    Resort')
            expect(result).toBe('beach-resort')
        })

        it('should collapse multiple hyphens into single hyphen', () => {
            const result = createSlugFromName('Beach---Resort')
            expect(result).toBe('beach-resort')
        })

        it('should handle tabs and newlines as spaces', () => {
            const result = createSlugFromName('Beach\tResort\nHotel')
            expect(result).toBe('beach-resort-hotel')
        })

        it('should remove leading hyphens', () => {
            const result = createSlugFromName('---Beach Resort')
            expect(result).toBe('beach-resort')
        })

        it('should remove trailing hyphens', () => {
            const result = createSlugFromName('Beach Resort---')
            expect(result).toBe('beach-resort')
        })

        it('should remove both leading and trailing hyphens', () => {
            const result = createSlugFromName('---Beach Resort---')
            expect(result).toBe('beach-resort')
        })
    })

    describe('Case Handling', () => {
        it('should convert uppercase to lowercase', () => {
            const result = createSlugFromName('BEACH RESORT')
            expect(result).toBe('beach-resort')
        })

        it('should convert mixed case to lowercase', () => {
            const result = createSlugFromName('BeAcH ReSoRt')
            expect(result).toBe('beach-resort')
        })

        it('should handle camelCase', () => {
            const result = createSlugFromName('beachResortHotel')
            expect(result).toBe('beachresorthotel')
        })

        it('should handle PascalCase', () => {
            const result = createSlugFromName('BeachResortHotel')
            expect(result).toBe('beachresorthotel')
        })
    })

    describe('Numbers Handling', () => {
        it('should preserve numbers', () => {
            const result = createSlugFromName('Room 123')
            expect(result).toBe('room-123')
        })

        it('should handle numbers at start', () => {
            const result = createSlugFromName('5 Star Hotel')
            expect(result).toBe('5-star-hotel')
        })

        it('should handle numbers at end', () => {
            const result = createSlugFromName('Hotel 2024')
            expect(result).toBe('hotel-2024')
        })

        it('should handle mixed numbers and letters', () => {
            const result = createSlugFromName('Room2024 Hotel5Star')
            expect(result).toBe('room2024-hotel5star')
        })
    })

    describe('Real-world Category Examples', () => {
        it('should handle "Resort & Beach"', () => {
            const result = createSlugFromName('Resort & Beach')
            expect(result).toBe('resort-and-beach')
        })

        it('should handle "swimming_pool"', () => {
            const result = createSlugFromName('swimming_pool')
            expect(result).toBe('swimming-pool')
        })

        it('should handle "Food & Beverage"', () => {
            const result = createSlugFromName('Food & Beverage')
            expect(result).toBe('food-and-beverage')
        })

        it('should handle "Spa & Wellness"', () => {
            const result = createSlugFromName('Spa & Wellness')
            expect(result).toBe('spa-and-wellness')
        })

        it('should handle "Meeting & Events"', () => {
            const result = createSlugFromName('Meeting & Events')
            expect(result).toBe('meeting-and-events')
        })

        it('should handle "Kids Club"', () => {
            const result = createSlugFromName('Kids Club')
            expect(result).toBe('kids-club')
        })

        it('should handle "Fitness Center"', () => {
            const result = createSlugFromName('Fitness Center')
            expect(result).toBe('fitness-center')
        })

        it('should handle "Business_Center"', () => {
            const result = createSlugFromName('Business_Center')
            expect(result).toBe('business-center')
        })
    })

    describe('Edge Cases', () => {
        it('should handle only special characters', () => {
            const result = createSlugFromName('!@#$%^&*()')
            expect(result).toBe('and')
        })

        it('should handle only spaces', () => {
            const result = createSlugFromName('     ')
            expect(result).toBe('')
        })

        it('should handle only hyphens', () => {
            const result = createSlugFromName('-----')
            expect(result).toBe('')
        })

        it('should handle only underscores', () => {
            const result = createSlugFromName('_____')
            expect(result).toBe('')
        })

        it('should handle single character', () => {
            const result = createSlugFromName('A')
            expect(result).toBe('a')
        })

        it('should handle single special character', () => {
            const result = createSlugFromName('&')
            expect(result).toBe('and')
        })

        it('should handle very long names', () => {
            const longName = 'This is a very long category name with many words that should be converted to a slug'
            const result = createSlugFromName(longName)
            expect(result).toBe('this-is-a-very-long-category-name-with-many-words-that-should-be-converted-to-a-slug')
        })

        it('should handle emoji and symbols', () => {
            const result = createSlugFromName('Beach 🏖️ Resort ⭐')
            expect(result).toBe('beach-resort')
        })
    })

    describe('Falsy Input Handling', () => {
        it('should return empty string for null input', () => {
            const result = createSlugFromName(null as any)
            expect(result).toBe('')
        })

        it('should return empty string for undefined input', () => {
            const result = createSlugFromName(undefined as any)
            expect(result).toBe('')
        })

        it('should handle whitespace-only string', () => {
            const result = createSlugFromName('   \t\n   ')
            expect(result).toBe('')
        })
    })

    describe('Idempotency', () => {
        it('should be idempotent for already slugified strings', () => {
            const slug = 'beach-resort-hotel'
            const result = createSlugFromName(slug)
            expect(result).toBe(slug)
        })

        it('should handle double conversion', () => {
            const original = 'Beach & Resort'
            const firstPass = createSlugFromName(original)
            const secondPass = createSlugFromName(firstPass)
            expect(firstPass).toBe(secondPass)
            expect(secondPass).toBe('beach-and-resort')
        })
    })
})

describe('generateUUID', () => {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

    it('should return a string', () => {
        expect(typeof generateUUID()).toBe('string')
    })

    it('should match UUID v4 format', () => {
        expect(generateUUID()).toMatch(UUID_REGEX)
    })

    it('should have version 4 in the correct position', () => {
        const uuid = generateUUID()
        expect(uuid[14]).toBe('4')
    })

    it('should have a valid variant character (8, 9, a, or b) in the correct position', () => {
        const uuid = generateUUID()
        expect(['8', '9', 'a', 'b']).toContain(uuid[19])
    })

    it('should return unique values on each call', () => {
        const ids = new Set(Array.from({ length: 1000 }, generateUUID))
        expect(ids.size).toBe(1000)
    })

    it('should correctly apply version and variant bits to controlled input', () => {
        // Mock getRandomValues to return all 0xFF bytes so we can verify masking
        const mockGetRandomValues = jest.spyOn(crypto, 'getRandomValues').mockImplementation((buffer) => {
            const arr = buffer as Uint8Array
            arr.fill(0xff)
            return arr
        })

        const uuid = generateUUID()

        // With 0xFF input:
        // byte[6]: 0xFF & 0x0f | 0x40 = 0x4f → '4f'
        // byte[8]: 0xFF & 0x3f | 0x80 = 0xbf → 'bf'
        expect(uuid[14]).toBe('4')        // version nibble
        expect(uuid[19]).toBe('b')        // variant nibble (0xbf → 'b')
        expect(uuid).toMatch(UUID_REGEX)

        mockGetRandomValues.mockRestore()
    })
})
