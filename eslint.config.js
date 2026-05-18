const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');

module.exports = [
  {
    ignores: ['lib/', 'node_modules/', 'dist/', '**/*.d.ts', 'maap_dps_jupyter_extension/']
  },
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        project: './tsconfig.json'
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        JSX: 'readonly',
        navigator: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin
    },
    rules: {
      // JavaScript core rules
      ...js.configs.recommended.rules,

      // TypeScript ESLint rules - Strict Mode
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // React rules
      'react/jsx-uses-react': 'off', // React 18+ doesn't require React import
      'react/react-in-jsx-scope': 'off', // React 17+ JSX transform
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/display-name': 'warn',

      // General best practices
      'no-console': 'off', // Debugging console statements are allowed
      'no-debugger': 'warn',
      'no-var': 'error',
      'prefer-const': 'warn' // Warn instead of error for const/let flexibility
    }
  }
];
