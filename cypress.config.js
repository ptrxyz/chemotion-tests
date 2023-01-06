const { defineConfig } = require('cypress')

const port=4102
module.exports = defineConfig({
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    env: {
      login_url: 'http://localhost:' + port + '/users/sign_in',
      TARGET : 'http://localhost:' + port,
			reservedList: ["CRR","CRS","CRD"],
      lengthGroup: [2, 5],
      lengthDevice: [2, 6],
      lengthDefault: [2, 8],
      formatAbbr: "!ruby/regexp '/\A[a-zA-Z][a-zA-Z0-9\-_]*[a-zA-Z0-9]\Z/'",
      formatAbbrErrMsg: "can be alphanumeric, middle '_' and '-' are allowed, but leading digit, or trailing '-' and '_' are not."

    },
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
})
