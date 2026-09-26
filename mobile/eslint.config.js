// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['coverage/*'],
  },
  {
    rules: {
      'react-hooks/exhaustive-deps': 'error',
    },
  },
]);
