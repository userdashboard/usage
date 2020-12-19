/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/usage/day', () => {
  describe('exceptions', () => {
    describe('invalid-metric', () => {
      it('missing querystring metric', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/day?metric=&date=1/2/2000')
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
        const req = TestHelper.createRequest('/api/administrator/usage/day?metric=invalid&date=1/2/2000')
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

    describe('invalid-date', () => {
      it('missing querystring date', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/day?metric=registrations&date=')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-date')
      })

      it('invalid querystring date', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/day?metric=registrations&date=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-date')
      })
    })

    describe('invalid-country', () => {
      it('invalid querystring country', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.trackMetric(administrator, 'registrations', '1/1/2020')
        const req = TestHelper.createRequest('/api/administrator/usage/day?metric=registrations&date=1/1/2020&country=invalid')
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
      const req = TestHelper.createRequest('/api/administrator/usage/day?metric=registrations&date=1/1/2020&country=US')
      req.account = administrator.account
      req.session = administrator.session
      const data = await req.get()
      assert.strictEqual(data, 1)
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = 10; i < len; i++) {
        await TestHelper.trackMetric(administrator, 'registrations', '1/1/2020')
      }
      const req = TestHelper.createRequest('/api/administrator/usage/day?metric=registrations&date=1/1/2020')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const data = await req.get()
      assert.strictEqual(data, 10)
    })
  })
})
