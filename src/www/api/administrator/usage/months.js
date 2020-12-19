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
    if (!req.query.months) {
      throw new Error('invalid-months')
    }
    const date = dashboard.Format.parseDate(req.query.date)
    if (!date) {
      throw new Error('invalid-date')
    }
    let months
    try {
      months = parseInt(req.query.months, '10')
    } catch (error) {
    }
    if (!months || months < 1) {
      throw new Error('invalid-months')
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
    for (let i = 0; i < months; i++) {
      const monthDate = new Date()
      monthDate.setMonth(date.getMonth() + i)
      const year = monthDate.getFullYear()
      const month = monthDate.getMonth() + 1
      dateKeys.push(`${year}-${month}`)
    }
    return checkPropertiesMethod(metricKey, dateKeys)
  }
}
