/* eslint-env mocha */
global.applicationPath = global.applicationPath || __dirname
const usage = require('./index.js')
const TestHelper = require('@userdashboard/dashboard/test-helper.js')
module.exports = TestHelper
module.exports.trackMetric = trackMetric
module.exports.flushMetrics = flushMetrics

async function trackMetric (administrator, metric, date, country) {
  let url = `/api/administrator/usage/track-metric?metric=${metric}`
  if (country) {
    url += `&country=${country}`
  }
  if (date) {
    url += `&date=${date}`
  }
  const req = TestHelper.createRequest(url, 'PATCH')
  req.account = administrator.account
  req.session = administrator.session
  await req.patch()
  await flushMetrics()
}

async function flushMetrics () {
  await usage.flushMetrics()
}
