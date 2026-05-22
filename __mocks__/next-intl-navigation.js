// Mock for next-intl/navigation

const React = require('react');

const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();
const mockRouterObj = {
  push: mockRouterPush,
  replace: mockRouterReplace,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

const mockUseRouter = jest.fn(() => mockRouterObj);

const mockLink = ({ href, children, ...props }) =>
  React.createElement('a', { href, ...props }, children);

const mockRedirect = jest.fn();
const mockUsePathname = jest.fn(() => '/');

module.exports = {
  createNavigation: (routing) => ({
    Link: mockLink,
    redirect: mockRedirect,
    usePathname: mockUsePathname,
    useRouter: mockUseRouter,
  }),
  __mockRouterReplace: mockRouterReplace,
};
