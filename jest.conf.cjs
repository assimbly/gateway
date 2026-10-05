const { pathsToModuleNameMapper } = require('ts-jest');

const {
  compilerOptions: { paths = {}, baseUrl = './' },
} = require('./tsconfig.json');
// webpack/environment.js is CommonJS inside an ES module package, so it can't be required here
const environment = {
  I18N_HASH: 'generated_hash',
  SERVER_API_URL: '',
  __VERSION__: 'test',
  __DEBUG_INFO_ENABLED__: false,
  __TYPE__: 'FULL',
  __KEYSTORE_PWD__: '',
};

module.exports = {
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|dayjs/esm)'],
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/main/webapp/setup-jest.ts'],
  globals: {
    ...environment,
  },
  roots: ['<rootDir>', `<rootDir>/${baseUrl}`],
  // 'app/...' imports resolve from the webapp root; the catch-all '*' tsconfig path would also capture relative imports
  modulePaths: ['<rootDir>/src/main/webapp'],
  setupFiles: ['jest-date-mock'],
  cacheDirectory: '<rootDir>/target/jest-cache',
  coverageDirectory: '<rootDir>/target/test-results/',
  moduleNameMapper: pathsToModuleNameMapper(
    Object.fromEntries(Object.entries(paths).filter(([alias]) => alias !== '*')),
    { prefix: `<rootDir>/${baseUrl}/` },
  ),
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: '<rootDir>/target/test-results/', outputName: 'TESTS-results-jest.xml' }],
    ['jest-sonar', { outputDirectory: './target/test-results/jest', outputName: 'TESTS-results-sonar.xml' }],
  ],
  testMatch: ['<rootDir>/src/main/webapp/app/**/@(*.)@(spec.ts)'],
  testEnvironmentOptions: {
    url: 'https://jhipster.tech',
  },
};
