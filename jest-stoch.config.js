
const baseConfig = require('./jest.config.js');

module.exports = {

  ... baseConfig,

  testMatch         : ['**/*.stoch.ts'],
  coverageDirectory : "coverage/stoch/",

  coverageThreshold : {
    global : {
      branches   : 9,
      functions  : 9,
      lines      : 9,
      statements : 9,
    },
  },


};
