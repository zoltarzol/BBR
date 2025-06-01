module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        'no-unused-vars': 'warn',
        'no-console': 'warn',
        'indent': ['error', 4],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always']
    },
    globals: {
        // Canvas and Web APIs
        'requestAnimationFrame': 'readonly',
        'cancelAnimationFrame': 'readonly',
        'AudioContext': 'readonly',
        'webkitAudioContext': 'readonly'
    }
};