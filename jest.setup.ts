// jest.setup.js

// Set the default timeout for all tests
jest.setTimeout(30000);

// Suppress console.error and console.warn in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Reset modules and clear mocks between tests
beforeEach(() => {
  jest.resetModules();
});