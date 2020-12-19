const dashboard = require('@userdashboard/dashboard')
const Storage = require('@userdashboard/dashboard/src/storage.js')
const usage = require('../../../../../index.js')
const util = require('util')
let checkPropertyMethod, checkPropertiesMethod, encryptKeysManually

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.metric) {
      throw new Error('invalid-metric')
    }
    if (!req.query.date) {
      throw new Error('invalid-date')
    }
    if (!req.query.years) {
      throw new Error('invalid-years')
    }
    const date = dashboard.Format.parseDate(req.query.date)
    if (!date) {
      throw new Error('invalid-date')
    }
    let years
    try {
      years = parseInt(req.query.years, '10')
    } catch (error) {
    }
    if (!years || years < 1) {
      throw new Error('invalid-years')
    }
    if (!checkPropertyMethod) {
      if (usage.Storage.client && usage.Storage.client.hget) {
        checkPropertyMethod = util.promisify(usage.Storage.client.hget).bind(usage.Storage.client)
        checkPropertiesMethod = util.promisify(usage.Storage.client.hmget).bind(usage.Storage.client)
        encryptKeysManually = true
      } else {
        checkPropertyMethod = usage.StorageObject.getProperty
        checkPropertiesMethod = usage.StorageObject.getProperties
      }
    }
    let metricIndexKey = `${req.appid}-metrics`
    let metricKey = `${req.appid}-${req.query.metric}`
    if (encryptKeysManually) {
      metricKey = Storage.encrypt(metricKey)
      metricIndexKey = Storage.encrypt(metricIndexKey)
    }
    const exists = await checkPropertyMethod(metricIndexKey, metricKey)
    if (!exists) {
      throw new Error('invalid-metric')
    }
    let countryKey, countryIndexKey
    if (req.query.country) {
      countryIndexKey = `${req.appid}-countries`
      countryKey = `${req.appid}-${req.query.country}`
      if (encryptKeysManually) {
        countryIndexKey = Storage.encrypt(countryIndexKey)
        countryKey = Storage.encrypt(countryKey)
      }
      const exists = await checkPropertyMethod(countryIndexKey, countryKey)
      if (!exists) {
        throw new Error('invalid-country')
      }
      metricKey = `${req.appid}-${req.query.metric}-${req.query.country}`
      if (encryptKeysManually) {
        metricKey = Storage.encrypt(metricKey)
      }
    }
    const dateKeys = []
    for (let i = 0; i < years; i++) {
      const yearDate = new Date()
      yearDate.setYear(date.getFullYear() + i)
      dateKeys.push(yearDate.getFullYear().toString())
    }
    return checkPropertiesMethod(metricKey, dateKeys)
  }
}
