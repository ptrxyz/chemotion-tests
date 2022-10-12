const { defineConfig } = require('cypress')

const port=4102
module.exports = defineConfig({
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    env: {
      login_url: 'http://localhost:' + port + '/users/sign_in',
      TARGET : 'http://localhost:' + port
    },
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
})
