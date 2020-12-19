const dashboard = require('@userdashboard/dashboard')
const Storage = require('@userdashboard/dashboard/src/storage.js')
const usage = require('../../../../../index.js')
const util = require('util')
let checkPropertyMethod, encryptKeysManually

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.metric) {
      throw new Error('invalid-metric')
    }
    if (!req.query.date) {
      throw new Error('invalid-date')
    }
    const date = dashboard.Format.parseDate(req.query.date)
    if (!date) {
      throw new Error('invalid-date')
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
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    let dateKey = `${year}-${month}-${day}`
    if (encryptKeysManually) {
      dateKey = Storage.encrypt(dateKey)
    }
    return checkPropertyMethod(metricKey, dateKey)
  }
}
