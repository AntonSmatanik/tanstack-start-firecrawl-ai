// Minimal test setup for jsdom environment
// Polyfills and lightweight globals for components

// Ensure a predictable test environment flag for React
// ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

// Basic matchMedia polyfill for components that read window.matchMedia
// if (typeof window !== 'undefined' && !window.matchMedia) {
//   Object.defineProperty(window, 'matchMedia', {
//     writable: true,
//     value: (query: string) => ({
//       matches: false,
//       media: query,
//       onchange: null,
//       addListener: () => {},
//       removeListener: () => {},
//       addEventListener: () => {},
//       removeEventListener: () => {},
//       dispatchEvent: () => false,
//     }),
//   })
// }

// Silence certain console outputs during tests (optional)
// const originalError = console.error
// console.error = (...args) => {
//   if (String(args[0]).includes('Some warning to ignore')) return
//   originalError(...args)
// }
