// Test environment variables
process.env.TEST = 'true';

module.exports = {
    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest']
    },
    maxWorkers: 1,
    collectCoverage: true,
    coverageThreshold: {
        global: {
            branches: 43.33
        }
    },

    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    coveragePathIgnorePatterns: ['/node_modules/', '/__fixtures__/', '/@types/'],
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/dist'],
    coverageReporters: ['json-summary', 'text-summary', 'lcov'],
    testTimeout: 10000
};
