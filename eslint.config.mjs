import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['build', 'node_modules'] },

  // 應用程式碼（瀏覽器環境）
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // 設定檔（Node 環境）
  {
    files: ['*.{js,mjs,ts}'],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.node,
    },
  },

  // Prettier：關閉所有與格式化衝突的規則（務必放最後）
  prettier,
)
