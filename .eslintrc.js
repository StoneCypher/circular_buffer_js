
module.exports = {     // eslint-disable-line no-undef

  root: true,

  parser: '@typescript-eslint/parser',

  plugins: [
    '@typescript-eslint',
  ],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],

  rules: {
    "no-unused-vars"                    : [ "warn", { argsIgnorePattern : "^_", varsIgnorePattern : "^_", caughtErrors : "all", caughtErrorsIgnorePattern : "^_" } ],
    "@typescript-eslint/no-unused-vars" : [ "warn", { argsIgnorePattern : "^_", varsIgnorePattern : "^_", caughtErrors : "all", caughtErrorsIgnorePattern : "^_" } ],
  }

};
