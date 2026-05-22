// Mock for next-intl/server
// next-intl ships ESM-only subpath exports under .pnpm/, which Jest cannot
// transform reliably. Resolving the request through moduleNameMapper avoids
// loading the real ESM file at all.

const passthrough = (key) => key;

module.exports = {
  getTranslations: jest.fn().mockResolvedValue(passthrough),
  getFormatter: jest.fn().mockResolvedValue({}),
  getLocale: jest.fn().mockResolvedValue('en'),
  getMessages: jest.fn().mockResolvedValue({}),
  getNow: jest.fn().mockResolvedValue(new Date(0)),
  getRequestConfig: (fn) => fn,
  getTimeZone: jest.fn().mockResolvedValue('UTC'),
  setRequestLocale: jest.fn(),
};
