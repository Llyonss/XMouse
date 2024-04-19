import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  markdown: true,
  yaml: true,
  gitignore: true,
  solid: true,
  test: true,
  formatters: true,
  stylistics: true,
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/.vscode/**',
    '**/.vscode-test/**',
  ],
}, {
  files: ['**/*.ts', '**/*.tsx'],
  rules: {
    'no-console': 0,
    'no-throw-literal': 'warn',
    'unused-imports/no-unused-vars': 'warn',
    'style/max-statements-per-line': 'warn',
    'array-callback-return': 'warn',
    'no-unreachable-loop': 'warn',
    'ts/no-require-imports': 'warn',
    'ts/ban-types': 'warn',
    'ts/ban-ts-comment': 'off',
    'ts/naming-convention': 'warn',
    'curly': 'warn',
    'eqeqeq': 'warn',
    'semi': 'off',
  },
})
