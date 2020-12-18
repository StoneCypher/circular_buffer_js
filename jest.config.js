
module.exports = {

  testEnvironment            : 'node',

  moduleFileExtensions       : ['js', 'ts'],
  coveragePathIgnorePatterns : ["/node_modules/", "/test/"],
  testMatch                  : ['**/*.spec.ts'],

  transform                  : { '^.+\\.ts$': 'ts-jest' },

  verbose                    : false,
  collectCoverage            : true,

  coverageThreshold : {
    global : {
      branches   : 80,
      functions  : 80,
      lines      : 80,
      statements : 80,
    },
  },

  collectCoverageFrom: ["src/ts/**/*.{js,ts}"]

};
