exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:8000/',

  directConnect: true,

  framework: 'jasmine',

  rootElement: '#ngMain',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
