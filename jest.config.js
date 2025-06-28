const path = require('path');
globalThis.ngJest = {
  skipNgcc: true,
  tsconfig: './tsconfig.spec.json',
};

module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./src/setup.jest.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
    },
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  moduleNameMapper: {
    '^@ws-widget/collection/(.*)$': path.resolve(__dirname, 'src/library/ws-widget/collection/$1'),
    '^@ws-widget/collection$': path.resolve(__dirname, 'src/library/ws-widget/collection'),
    '^@ws-widget/utils/(.*)$': path.resolve(__dirname, 'src/library/ws-widget/utils/$1'),
    '^@ws-widget/utils$': path.resolve(__dirname, 'src/library/ws-widget/utils'),
    '^@ws-widget/resolver/(.*)$': path.resolve(__dirname, 'src/library/ws-widget/resolver/$1'),
    '^@ws-widget/resolver$': path.resolve(__dirname, 'src/library/ws-widget/resolver'),
    '^sunbird-sdk': path.resolve(__dirname, 'node_modules/@project-sunbird/sunbird-sdk'),
    '^sunbird-sdk/(.*)$': path.resolve(__dirname, 'node_modules/@project-sunbird/sunbird-sdk/$1'),
    "^aastrika_npmjs/comptency": "<rootDir>/node_modules/@aastrika_npmjs/comptency",
    "^aastrika_npmjs/comptency/(.*)$": "<rootDir>/node_modules/@aastrika_npmjs/comptency/$1",
    "^aastrika_npmjs/discussions-ui-v8": "<rootDir>/node_modules/@aastrika_npmjs/discussions-ui-v8",
    "^aastrika_npmjs/discussions-ui-v8/(.*)$": "<rootDir>/node_modules/@aastrika_npmjs/discussions-ui-v8/$1",
     '^@ws/author/(.*)$': '<rootDir>/src/project/ws/author/$1', 
      '^@ws/author$': '<rootDir>/src/project/ws/author',
      '^@ws/app/(.*)$': '<rootDir>/src/project/ws/app/$1',
      '^@ws/app$': '<rootDir>/src/project/ws/app',
  },
  testPathIgnorePatterns: [
    '/node_modules/', 
    '.*\\.data\\.spec\\.ts$', 
    '.*\\.spec\\.data\\.ts$',
     'src/__tests__ ',
    'regexp-polyfill.min.js '
  ],
  testMatch: ['**/?(*.)(spec).ts'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx', 'html', 'mjs', 'd.ts'],
  transformIgnorePatterns: ['/node_modules/(?!flat)/'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage/',
  coverageReporters: ['html', 'text', 'lcov', 'json', 'json-summary', 'cobertura'],
  moduleDirectories: ['node_modules', 'src'],
  setupFiles: [
    "<rootDir>/src/__tests__/setup.js"
  ],
  fakeTimers: {
    enableGlobally: true,
  },
  coveragePathIgnorePatterns: [
    path.resolve(__dirname, 'src/app/*/*.module.ts'),
    path.resolve(__dirname, 'src/app/animations/*.ts'),
    path.resolve(__dirname, 'src/app/manage-learn/'),
    path.resolve(__dirname, 'src/library/ws-widget'),
    path.resolve(__dirname, 'src/app/components/popups'),
    path.resolve(__dirname, 'src/guards'),
    path.resolve(__dirname, 'src/pipes'),
    path.resolve(__dirname, 'src/services'),
    path.resolve(__dirname, 'src/app/services'),
     'src/__tests__ ',
    'regexp-polyfill.min.js '
  ],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
