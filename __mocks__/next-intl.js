
const React = require('react');

// Mock navigation functions
const mockRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
});

const mockLink = ({ href, children, ...props }) => 
  React.createElement('a', { href, ...props }, children);

const mockRedirect = jest.fn();
const mockUsePathname = () => '/';

module.exports = {
  useTranslations: () => (key) => key,
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }) => children,
  
  // Navigation exports
  useRouter: mockRouter,
  usePathname: mockUsePathname,
  redirect: mockRedirect,
  Link: mockLink,
  
  // Routing exports
  defineRouting: (config) => config,
  
  // createNavigation function that returns the navigation functions
  createNavigation: (routing) => ({
    Link: mockLink,
    redirect: mockRedirect,
    usePathname: mockUsePathname,
    useRouter: mockRouter,
  }),
};
