module.exports = {
  extends: ['taro/react'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-unused-vars': 'off'
  },
  globals: {
    wx: 'readonly',
    my: 'readonly',
    swan: 'readonly',
    tt: 'readonly',
    qq: 'readonly',
    jd: 'readonly',
    process: 'readonly',
    defineAppConfig: 'readonly',
    definePageConfig: 'readonly'
  }
}
