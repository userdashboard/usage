/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')
const CountActiveUsers = require('./count-active-users.js')

describe('/content/usage/count-active-users', () => {
  describe('page', () => {
    it('should ignore guest', async () => {
      const req = TestHelper.createRequest('/')
      await CountActiveUsers.page(req)
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

    it('should count user', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-username')
      req.account = user.account
      req.session = user.session
      req.country = {
        country: {
          iso_code: 'US'
        }
      }
      await CountActiveUsers.page(req)
      await TestHelper.flushMetrics()
      const now = new Date()
      const date = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate()
      req.query = {
        metric: 'actives',
        date
      }
      const count = await global.api.administrator.usage.Day.get(req)
      assert.strictEqual(count, 1)
    })

    it('should only count once', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/change-username')
      req.account = user.account
      req.session = user.session
      req.country = {
        country: {
          iso_code: 'US'
        }
      }
      await CountActiveUsers.page(req)
      await CountActiveUsers.page(req)
      await CountActiveUsers.page(req)
      await TestHelper.flushMetrics()
      const now = new Date()
      const date = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate()
      req.query = {
        metric: 'actives',
        date
      }
      const count = await global.api.administrator.usage.Day.get(req)
      assert.strictEqual(count, 1)
    })
  })
})
