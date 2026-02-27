import '@testing-library/jest-dom';

// Learn more: https://github.com/testing-library/jest-dom
// Setup fetch mock or other browser globals if needed here.

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
