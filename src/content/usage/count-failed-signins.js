module.exports = {
  page: async (req) => {
    if (req.method !== 'POST' || req.urlPath !== '/account/signin' || req.account) {
      return
    }
    const queryWas = {}
    req.query = {
      metric: 'failedSignIns'
    }
    await global.api.administrator.usage.TrackMetric.patch(req)
    req.query = queryWas
  }
}
