import baseConfig from './base.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    rules: {
      // DDD boundary enforcement
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@crm/infrastructure*'],
              message: 'Domain and Application layers cannot import from Infrastructure.',
            },
          ],
        },
      ],
    },
  },
];
