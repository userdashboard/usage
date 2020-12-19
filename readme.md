# Documentation for Usage module

#### Index

- [Introduction](#introduction)
- [Module contents](#module-contents)
- [Import this module](#import-this-module)
- [Storage engine](#storage-engine)
- [Access the API](#access-the-api)
- [Github repository](https://github.com/userdashboard/organizations)
- [NPM package](https://npmjs.org/userdashboard/organizations)

# Introduction

Dashboard bundles everything a web app needs, all the "boilerplate" like signing in and changing passwords, into a parallel server so you can write a much smaller web app.

The Usage module aggregates signin and registration metrics and adds reports to the administrative interface.

# Module contents 

| Content type             |     |
|--------------------------|-----|
| Proxy scripts            |     |
| Server scripts           |     |
| Content scripts          | Yes |
| User pages               |     |
| User API routes          |     | 
| Administrator pages      | Yes |
| Administrator API routes | Yes | 

## Import this module

On your Dashboard server you need to install this module with NPM:

    $ npm install @userdashboard/usage

Edit your `package.json` to activate the module:

    "dashboard": {
      "modules": [
        "@userdashboard/usage"
      ]
    }

## Track other metrics

You can use the API to track metrics via HTTP:

    PATCH /api/administrator/usage/track-metric?metric=YourMetricName
    
Or via NodeJS:

    await global.api.administrator.Usage.trackMetric.patch({ query: { name: 'YourMetricName' }})

Or via the Node module:

  const usage = require('@userdashboard/usage')
  usage.track('name')

## Storage engine

By default this module will share whatever storage you use for Dashboard.  You can specify an alternate storage module to use instead, or the same module with a separate database.  If you have a single Dashboard server you can use any storage type.  If you use the Redis storage module aggregated increment operations can be performed efficiently by multiple Dashboard server instances.  If you use Redis the data will ignore your encryption preferences so values can be incremented in-place, but hash keys and property names will be encrypted.

    USAGE_STORAGE=@userdashboard/storage-redis
    USAGE_DATABASE_URL=redis://localhost:6379

### Access the API

Dashboard and official modules are completely API-driven and you can access the same APIs on behalf of the user making requests.  You perform `GET`, `POST`, `PATCH`, and `DELETE` HTTP requests against the API endpoints to fetch or modify data.  This example fetches the user's subscriptions using NodeJS, you can do this with any language:

You can view API documentation within generated `api.txt` files, or on the [documentation site](https://userdashboard.github.io/usage-api).

    const signinSuccessData = await proxy('/api/administrator/usage/data?metric=signinSuccess', accountid, sessionid)

    const proxy = util.promisify((path, accountid, sessionid, callback) => {
        const requestOptions = {
            host: 'dashboard.example.com',
            path: path,
            port: '443',
            method: 'GET',
            headers: {
                'x-application-server': 'application.example.com',
                'x-application-server-token': process.env.APPLICATION_SERVER_TOKEN,
                'x-accountid': accountid,
                'x-sessionid': sessionid
            }
        }
        const proxyRequest = require('https').request(requestOptions, (proxyResponse) => {
            let body = ''
            proxyResponse.on('data', (chunk) => {
                body += chunk
            })
            return proxyResponse.on('end', () => {
                return callback(null, JSON.parse(body))
            })
        })
        proxyRequest.on('error', (error) => {
            return callback(error)
        })
        return proxyRequest.end()
      })
    }
