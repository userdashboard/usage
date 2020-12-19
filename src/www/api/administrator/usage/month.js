const Storage = require('@userdashboard/dashboard/src/storage.js')
const usage = require('../../../../../index.js')
const util = require('util')
let checkPropertyMethod, encryptKeysManually

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.metric) {
      throw new Error('invalid-metric')
    }
    if (!req.query.year) {
      throw new Error('invalid-year')
    }
    if (!req.query.month) {
      throw new Error('invalid-month')
    }
    let year
    try {
      year = parseInt(req.query.year, '10')
    } catch (error) {
    }
    if (!year || year < 2020 || year > new Date().getFullYear()) {
      throw new Error('invalid-year')
    }
    let month
    try {
      month = parseInt(req.query.month, '10')
    } catch (error) {
    }
    if (!month || month < 1 || month > 12) {
      throw new Error('invalid-month')
    }
    if (!checkPropertyMethod) {
      if (usage.Storage.client && usage.Storage.client.hget) {
        checkPropertyMethod = util.promisify(usage.Storage.client.hget).bind(usage.Storage.client)
        encryptKeysManually = true
      } else {
        checkPropertyMethod = usage.StorageObject.getProperty
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
    let dateKey = `${year}-${month}`
    if (encryptKeysManually) {
      dateKey = Storage.encrypt(dateKey)
    }
    return checkPropertyMethod(metricKey, dateKey)
  }
}
