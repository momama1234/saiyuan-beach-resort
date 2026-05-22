/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    extends: [
        '@repo/eslint-config/next.js',
        'plugin:tailwindcss/recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true
    },
    rules: {
        'tailwindcss/no-custom-classname': 'off',
    }
}
