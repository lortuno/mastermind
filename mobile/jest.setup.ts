// SafeAreaProvider renders nothing until native insets arrive; use the library's static mock.
// jest.mock factories are hoisted above imports, so the mock must be loaded with require().
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
