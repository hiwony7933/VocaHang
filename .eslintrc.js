// .eslintrc.cjs
module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: __dirname,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
    rules: {
      // 필요에 따라 추가 오버라이드
      'no-console': 'off',
    },
     // ESLint가 검사하지 않을 파일/폴더
    ignorePatterns: [
     'node_modules/',
     'jest.config.js',
     '.eslintrc.js',
   ],
   // 특정 파일에만 다른 설정을 적용하고 싶을 땐 overrides 사용
   overrides: [
     {
       files: ['src/components/HangmanDrawing.tsx'],
       rules: {
         '@typescript-eslint/no-require-imports': 'off'
       }
     },
     {
       files: ['jest.config.js'],
       env: { node: true }
     }
   ]
  };
  