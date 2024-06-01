import pluginImport from 'eslint-plugin-import';

export default [
  {
    ignores: ['node_modules/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
      },
    },
    rules: {
      semi: ['error', 'always'],
      indent: ['error', 2],
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
        },
      ],

    },
    plugins: {
      import: pluginImport,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
  {
    files: ['**/*.js'],
    plugins: {
      import: pluginImport,
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/export': 'error',
      'import/no-absolute-path': 'error',
    },
  },
];
