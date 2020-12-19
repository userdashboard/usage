/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/usage/year', () => {
  describe('exceptions', () => {
    describe('invalid-metric', () => {
      it('missing querystring metric', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/total?metric=')
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
        const req = TestHelper.createRequest('/api/administrator/usage/total?metric=invalid')
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

    describe('invalid-country', () => {
      it('invalid querystring country', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.trackMetric(administrator, 'registrations', '1/1/2020')
        const req = TestHelper.createRequest('/api/administrator/usage/total?metric=registrations&country=invalid')
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
      const req = TestHelper.createRequest('/api/administrator/usage/total?metric=registrations&country=US')
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
        await TestHelper.trackMetric(administrator, 'registrations', `1/1/202${i}`)
      }
      const req = TestHelper.createRequest('/api/administrator/usage/total?metric=registrations')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const data = await req.get()
      assert.strictEqual(data, 9)
    })
  })
})
