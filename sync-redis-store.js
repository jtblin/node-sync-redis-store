'use strict';

module.exports = RedisStore;

require('syncho');
var redis = require('redis');
var qs = require('querystring');

function RedisStore (options) {
  if (!(this instanceof RedisStore))
    return new RedisStore(options);

  options = options || {};
  this.lifetime = options.maxAge && options.maxAge >= 1000 ? parseInt(options.maxAge/1000) : 60;
  this.separator = options.separator || '/';
  this.ns = options.ns;
  this.client = typeof options.client === 'object' ? options.client : createClient(RedisStore.redis, options);
}

RedisStore.redis = redis;

RedisStore.prototype.set = function (key, value) {
  return this.client.setex.sync(this.client, this.key(key), this.lifetime, value);
};

RedisStore.prototype.get = function (key) {
  return this.client.get.sync(this.client, this.key(key)) || void 0;
};

RedisStore.prototype.del = function (key) {
  return this.client.del.sync(this.client, this.key(key));
};

RedisStore.prototype.has = function (key) {
  return true;
};

RedisStore.prototype.peek = RedisStore.prototype.get;
RedisStore.prototype.reset = function () {
  this.client.flushall.sync(this.client);
};

RedisStore.prototype.key = function (key) {
  if (typeof key === 'object') key = qs.decode(key);
  return this.ns ? this.ns + this.separator + key : key;
};

function createClient (redis, r) {
  var client = redis.createClient(r.port, r.host, r);
  if (r.auth) client.auth(r.auth);
  return client;
}