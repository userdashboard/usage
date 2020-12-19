/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/usage/month', () => {
  describe('exceptions', () => {
    describe('invalid-metric', () => {
      it('missing querystring metric', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/month?metric=&month=1&year=2020')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-metric')
      })

      it('invalid querystring metric', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/month?metric=invalid&month=1&year=2020')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-metric')
      })
    })

    describe('invalid-month', () => {
      it('missing querystring month', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/month?metric=registrations&month=&year=2020')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-month')
      })

      it('invalid querystring month', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/month?metric=registrations&month=invalid&year=2020')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-month')
      })
    })

    describe('invalid-year', () => {
      it('missing querystring year', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/month?metric=registrations&month=1&year=')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-year')
      })

      it('invalid querystring year', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/month?metric=registrations&month=1&year=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-year')
      })
    })

    describe('invalid-country', () => {
      it('invalid querystring country', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.trackMetric(administrator, 'registrations', '1/1/2020')
        const req = TestHelper.createRequest('/api/administrator/usage/month?metric=registrations&month=1&year=2020&country=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-country')
      })
    })
  })

  describe('receives', () => {
    it('optional querystring country', async () => {
      const administrator = await TestHelper.createOwner()
      await TestHelper.trackMetric(administrator, 'registrations', '1/1/2020', 'US')
      const req = TestHelper.createRequest('/api/administrator/usage/month?metric=registrations&month=1&year=2020&country=US')
      req.account = administrator.account
      req.session = administrator.session
      const data = await req.get()
      assert.strictEqual(data, 1)
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      for (let i = 1, len = 10; i < len; i++) {
        await TestHelper.trackMetric(administrator, 'registrations', `1/${i}/2020`)
      }
      const req = TestHelper.createRequest('/api/administrator/usage/month?metric=registrations&month=1&year=2020')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const data = await req.get()
      assert.strictEqual(data, 9)
    })
  })
})
