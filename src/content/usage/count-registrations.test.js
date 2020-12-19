/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')
const CountRegistrations = require('./count-registrations.js')

describe('/content/usage/count-active-users', () => {
  describe('page', () => {
    it('should ignore non registration URLs', async () => {
      const req = TestHelper.createRequest('/account/signin')
      await CountRegistrations.page(req)
      await TestHelper.flushMetrics()
      const now = new Date()
      const date = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate()
      req.query = {
        metric: 'actives',
        date
      }
      let errorMessage
      try {
        await global.api.administrator.usage.Day.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-metric')
    })

    it('should ignore non-POST requests', async () => {
      const req = TestHelper.createRequest('/account/register')
      req.method = 'GET'
      await CountRegistrations.page(req)
      await TestHelper.flushMetrics()
      const now = new Date()
      const date = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate()
      req.query = {
        metric: 'actives',
        date
      }
      let errorMessage
      try {
        await global.api.administrator.usage.Day.get(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-metric')
    })

    it('should count registration', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/register')
      req.method = 'POST'
      req.account = user.account
      req.session = user.session
      req.country = {
        country: {
          iso_code: 'US'
        }
      }
      await CountRegistrations.page(req)
      await TestHelper.flushMetrics()
      const now = new Date()
      const date = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate()
      req.query = {
        metric: 'registrations',
        date
      }
      const count = await global.api.administrator.usage.Day.get(req)
      assert.strictEqual(count, 1)
    })
  })
})
