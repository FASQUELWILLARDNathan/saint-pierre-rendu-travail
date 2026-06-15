import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '.eslintcache',
      'prisma/migrations',
      'frontend/.vite',
      'frontend/dist',
      'backend/generated',
    ],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,

  {
    plugins: { prettier },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
)
