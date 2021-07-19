
const baseConfig = require('./jest.config.js');  // eslint-disable-line no-undef,@typescript-eslint/no-var-requires

module.exports = {                               // eslint-disable-line no-undef

  ... baseConfig,

  testMatch         : ['**/*.stoch.ts'],
  coverageDirectory : "coverage/stoch/",

  coverageThreshold : {
    global : {
      branches   : 90,
      functions  : 90,
      lines      : 90,
      statements : 90,
    },
  },

};
