# sync-redis-store

Synchronous Fibers-powered Redis store for [sync-cache](https://github.com/jtblin/sync-cache). 
The store use [syncho](https://github.com/jtblin/syncho) to retrieve data "synchronously" from memcached 
so the code needs to run in a Fiber.

## Usage

    npm install sync-redis-store --save

```js
var Sync = require('syncho')
    , SyncCache = require('sync-cache')
    , RedisStore = require('sync-redis-store')
    , store = new RedisStore({ host: 'my-redis.com', maxAge: 1000*60*60, ns: 'mynamespace' })
    , cache = new SyncCache({ store: store, load: mySyncFunction })
    ;

Sync(function () {
  console.log(cache.get('some-key'));
});

function mySyncFunction () {
  return 'some value';
}
```

### Parameters

- `options` - an options object

### Options

- `host` - redis endpoint
- `port` - redis port
- `auth` - redis auth secret
- `ns` - optional namespace
- `maxAge` - maximum number of milliseconds to keep items, defaults **60000**
- `separator` - separator for namespace (default `/`)

## Testing

`npm test`

# License

BSD