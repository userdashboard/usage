const Storage = require('@userdashboard/dashboard/src/storage.js')
const usage = require('../../../../../index.js')
let metrics = {}
let indexes = {}
let year, month, day, encryptKeysManually

module.exports = {
  startTimers: () => {
    const now = new Date()
    year = now.getUTCFullYear()
    month = now.getUTCMonth() + 1
    day = now.getUTCDate()
    encryptKeysManually = usage.Storage.client && usage.Storage.client.hget
    if (process.env.NODE_ENV === 'testing') {
      module.exports.flushMetrics = async () => {
        if (usage.Storage.client && usage.Storage.client.multi) {
          await redisFlush()
        } else {
          await otherStorageFlush()
        }
      }
      return
    }
    setInterval(() => {
      const now = new Date().getUTCFullYear
      year = now.getUTCFullYear()
      month = now.getUTCMonth() + 1
      day = now.getUTCDate()
    }, 10 * 1000)
    if (usage.Storage.client && usage.Storage.client.multi) {
      setTimeout(redisFlush, 10 * 1000)
    } else {
      setTimeout(otherStorageFlush, 10 * 1000)
    }
  },
  patch: async (req) => {
    if (!req.query || !req.query.metric) {
      throw new Error('invalid-metric')
    }
    const dateKeys = [
      Storage.encrypt(`${year}-${month}-${day}`),
      Storage.encrypt(`${year}-${month}`),
      Storage.encrypt(`${year}`),
      Storage.encrypt('total')
    ]
    if (process.env.NODE_ENV === 'testing' && req.query.date) {
      const date = new Date(req.query.date)
      const year = date.getUTCFullYear()
      const month = date.getUTCMonth() + 1
      const day = date.getUTCDate()
      dateKeys[0] = Storage.encrypt(`${year}-${month}-${day}`)
      dateKeys[1] = Storage.encrypt(`${year}-${month}`)
      dateKeys[2] = Storage.encrypt(`${year}`)
    }
    let metricKey = `${req.appid}-${req.query.metric}`
    let metricIndex = `${req.appid}-metrics`
    if (encryptKeysManually) {
      metricKey = Storage.encrypt(metricKey)
      metricIndex = Storage.encrypt(metricIndex)
    }
    indexes[metricIndex] = indexes[metricIndex] || []
    if (indexes[metricIndex].indexOf(metricKey) === -1) {
      indexes[metricIndex].push(metricKey)
    }
    metrics[metricKey] = metrics[metricKey] || {}
    for (const dateKey of dateKeys) {
      if (metrics[metricKey][dateKey]) {
        metrics[metricKey][dateKey]++
      } else {
        metrics[metricKey][dateKey] = 1
      }
    }
    let country = req.country.country.iso_code
    if (process.env.NODE_ENV === 'testing' && req.query.country) {
      country = req.query.country
    }
    let countryKey = `${req.appid}-${country}`
    let countryIndex = `${req.appid}-countries`
    let countryMetricKey = `${req.appid}-${req.query.metric}-${country}`
    if (encryptKeysManually) {
      countryKey = Storage.encrypt(countryKey)
      countryIndex = Storage.encrypt(countryIndex)
      countryMetricKey = Storage.encrypt(countryMetricKey)
    }
    indexes[countryIndex] = indexes[countryIndex] || []
    if (indexes[countryIndex].indexOf(countryKey) === -1) {
      indexes[countryIndex].push(countryKey)
    }
    metrics[countryMetricKey] = metrics[countryMetricKey] || {}
    for (const dateKey of dateKeys) {
      if (metrics[countryMetricKey][dateKey]) {
        metrics[countryMetricKey][dateKey]++
      } else {
        metrics[countryMetricKey][dateKey] = 1
      }
    }
    return true
  }
}

function redisFlush () {
  if (!Object.keys(metrics).length) {
    return setTimeout(redisFlush, 10 * 1000)
  }
  const update = usage.Storage.client.multi()
  for (const indexKey in indexes) {
    for (const hashKey of indexes[indexKey]) {
      update.hset(indexKey, hashKey, true)
    }
  }
  for (const metricKey in metrics) {
    for (const dateKey in metrics[metricKey]) {
      update.hincrby(metricKey, dateKey, metrics[metricKey][dateKey])
      delete (metrics[metricKey][dateKey])
    }
    delete (metrics[metricKey])
  }
  return update.exec(() => {
    return setTimeout(redisFlush, 10 * 1000)
  })
}

async function otherStorageFlush () {
  const indexData = indexes
  const metricData = metrics
  indexes = {}
  metrics = {}
  for (const indexKey in indexData) {
    let index
    try {
      index = await usage.Storage.read(indexKey)
      if (index) {
        index = JSON.parse(index)
      }
    } catch (error) {
    }
    index = index || {}
    let changed = false
    for (const item of indexData[indexKey]) {
      if (index[item]) {
        continue
      }
      index[item] = true
      changed = true
    }
    if (changed) {
      await usage.Storage.write(indexKey, index)
    }
  }
  for (const metricKey in metricData) {
    let metric
    try {
      metric = await usage.Storage.read(metricKey)
      if (metric) {
        metric = JSON.parse(metric)
      }
    } catch (error) {
    }
    metric = metric || {}
    for (const dateKey in metricData[metricKey]) {
      metric[dateKey] = metric[dateKey] || 0
      metric[dateKey] += metricData[metricKey][dateKey]
    }
    await usage.StorageObject.setProperties(metricKey, metric)
  }
  return setTimeout(otherStorageFlush, 10 * 1000)
}
