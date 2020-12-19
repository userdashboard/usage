const dashboard = require('@userdashboard/dashboard')
const usage = require('../../../index.js')
const cached = []

module.exports = {
  page: async (req) => {
    if (!req.session) {
      return
    }
    const days = Math.floor((dashboard.Timestamp.now - req.account.created) / 60 / 60 / 24)
    const cacheKey = `${req.appid}/${req.session.sessionid}/${days}`
    if (cached.indexOf(cacheKey) > -1) {
      return
    }
    cached.unshift(cacheKey)
    if (cached.length > 10000) {
      cached.pop()
    }
    const tracked = await usage.StorageList.list(`${req.appid}/active/${req.account.accountid}`, 0, 1)
    if (tracked && tracked.length && tracked[0] === days) {
      return
    }
    await usage.StorageList.add(`${req.appid}/active/${req.account.accountid}`, days)
    const queryWas = {}
    req.query = {
      metric: 'actives'
    }
    await global.api.administrator.usage.TrackMetric.patch(req)
    req.query = queryWas
  }
}
