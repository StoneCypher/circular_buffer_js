
const baseConfig = require('./jest.config.js');

module.exports = {

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
