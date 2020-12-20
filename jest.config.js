
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
      branches   : 90,
      functions  : 90,
      lines      : 90,
      statements : 90,
    },
  },

  collectCoverageFrom: ["src/ts/**/*.{js,ts}"]

};
