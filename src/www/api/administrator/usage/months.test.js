/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/usage/months', () => {
  describe('exceptions', () => {
    describe('invalid-metric', () => {
      it('missing querystring metric', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/months?metric=&date=1/2/2000&months=12')
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
        const req = TestHelper.createRequest('/api/administrator/usage/months?metric=invalid&date=1/2/2000&months=12')
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
        const req = TestHelper.createRequest('/api/administrator/usage/months?metric=registrations&date=&months=12')
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
        const req = TestHelper.createRequest('/api/administrator/usage/months?metric=registrations&date=invalid&months=12')
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

    describe('invalid-months', () => {
      it('missing querystring months', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/months?metric=registrations&date=1/1/2020&months=')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-months')
      })

      it('invalid querystring months', async () => {
        const administrator = await TestHelper.createOwner()
        const req = TestHelper.createRequest('/api/administrator/usage/months?metric=registrations&date=1/1/2020&months=invalid')
        req.account = administrator.account
        req.session = administrator.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-months')
      })
    })

    describe('invalid-country', () => {
      it('invalid querystring country', async () => {
        const administrator = await TestHelper.createOwner()
        await TestHelper.trackMetric(administrator, 'registrations', '1/1/2020')
        const req = TestHelper.createRequest('/api/administrator/usage/months?metric=registrations&date=1/1/2020&country=invalid&months=12')
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
      const req = TestHelper.createRequest('/api/administrator/usage/months?metric=registrations&date=1/1/2020&country=US&months=12')
      req.account = administrator.account
      req.session = administrator.session
      const data = await req.get()
      assert.strictEqual(data['2020-1'], 1)
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const administrator = await TestHelper.createOwner()
      for (let i = 1, len = 12; i < len; i++) {
        await TestHelper.trackMetric(administrator, 'registrations', `${i}/1/2020`)
      }
      const req = TestHelper.createRequest('/api/administrator/usage/months?metric=registrations&date=1/10/2020&months=12')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const data = await req.get()
      for (let i = 1, len = 12; i < len; i++) {
        assert.strictEqual(data[`2020-${i}`], 1)
      }
    })
  })
})
