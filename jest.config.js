const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Transform ESM modules from node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(next-intl|@formatjs|@next|next)/)',
  ],
  moduleNameMapper: {
    // Handle next-intl routing specifically - order matters!
    '^next-intl/routing$': '<rootDir>/__mocks__/next-intl-routing.js',
    '^next-intl/navigation$': '<rootDir>/__mocks__/next-intl-navigation.js',
    '^next-intl/server$': '<rootDir>/__mocks__/next-intl-server.js',
    '^next-intl$': '<rootDir>/__mocks__/next-intl.js',
    // Handle module aliases (if you have them in tsconfig.json)
    '^@/i18n/routing$': '<rootDir>/src/i18n/__mocks__/routing.ts',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/features/(.*)$': '<rootDir>/src/features/$1',
    '^@/helpers/(.*)$': '<rootDir>/src/helpers/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
