module.exports = {
  setup: async () => {
    if (process.env.USAGE_STORAGE) {
      const Storage = require('@userdashboard/dashboard/src/storage.js')
      const storage = await Storage.setup('USAGE')
      const StorageList = require('@userdashboard/dashboard/src/storage-list.js')
      const storageList = await StorageList.setup(storage, 'USAGE')
      const StorageObject = require('@userdashboard/dashboard/src/storage-object.js')
      const storageObject = await StorageObject.setup(storage, 'USAGE')
      module.exports.Storage = storage
      module.exports.StorageList = storageList
      module.exports.StorageObject = storageObject
    } else {
      const dashboard = require('@userdashboard/dashboard')
      module.exports.Storage = dashboard.Storage
      module.exports.StorageList = dashboard.StorageList
      module.exports.StorageObject = dashboard.StorageObject
    }
    global.sitemap['/api/administrator/usage/track-metric'].api.startTimers()
    if (process.env.NODE_ENV === 'testing') {
      module.exports.flushMetrics = global.sitemap['/api/administrator/usage/track-metric'].api.flushMetrics
    }
  }
}
