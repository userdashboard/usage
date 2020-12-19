module.exports = {
  page: async (req) => {
    if (req.method !== 'POST' || req.urlPath !== '/account/register' || !req.account) {
      return
    }
    const queryWas = {}
    req.query = {
      metric: 'registrations'
    }
    await global.api.administrator.usage.TrackMetric.patch(req)
    req.query = queryWas
  }
}
