describe('RedisStore', function () {

  var sandbox, client;
  var redis = require('fakeredis');
  var RedisStore = require('../sync-redis-store');

  describe('Unit Tests', function () {
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      client = redis.createClient();
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe('#new', function () {
      it('connects to redis with host and port', function () {
        var options = { host: 'foo.com', port: 6379 };
        var mock = sandbox.mock(require('redis'));
        mock.expects('createClient').withExactArgs(6379, 'foo.com', options).returns(client);
        new RedisStore(options);
      });

      it('connects to redis with auth', function () {
        var mock = sandbox.mock(client);
        var options = { host: 'foo.com', port: 6379, auth: 'secret' };
        sandbox.stub(require('redis'), 'createClient').returns(client);
        mock.expects('auth').withExactArgs('secret');
        new RedisStore(options);
      });

      it('uses the client and does not connect', function () {
        var mock = sandbox.mock(require('redis'));
        mock.expects('createClient').never();
        var store = new RedisStore({ client: client });
        store.client.should.equal(client);
      });

      it('initializes namespace, separator and max age', function () {
        var store = new RedisStore({ client: client, maxAge: 60000, ns: 'foo', separator: ':' });
        store.lifetime.should.equal(60);
        store.ns.should.equal('foo');
        store.separator.should.equal(':');
      });

      it('sets the defaults', function () {
        var store = new RedisStore({ client: client });
        store.lifetime.should.equal(60);
        store.separator.should.equal('/');
      });
    });

    describe('#set', function () {
      it('sets the value of the key', function () {
        var store = new RedisStore({ client: client });
        store.set('key', 'value');
        client.get.sync(client, 'key').should.equal('value');
      }.wrapIt());

      it('sets the value of the key in the proper namespace', function () {
        var store = new RedisStore({ client: client, ns: 'db', separator: ':' });
        store.set('key', 'value');
        client.get.sync(client, 'db:key').should.equal('value');
      }.wrapIt());

      it('sets the value of the key with configured lifetime', function () {
        var mock = sandbox.mock(client);
        mock.expects('setex').withArgs('key', 3600, 'value').yields();
        var store = new RedisStore({ client: client, maxAge: 3600000 });
        store.set('key', 'value');
      }.wrapIt());
    });

    describe('#get', function () {
      it('gets the value for the key', function () {
        var mock = sandbox.mock(client);
        mock.expects('get').withArgs('key').yields(null, 'value');
        var store = new RedisStore({ client: client });
        store.get('key').should.equal('value');
      });

      it('returns undefined if no value is found for the key', function () {
        var store = new RedisStore({ client: client });
        expect(store.get('key')).to.equal(void 0);
      }.wrapIt());
    });

    describe('#del', function () {
      it('calls del', function () {
        var mock = sandbox.mock(client);
        mock.expects('del').withArgs('key').yields();
        var store = new RedisStore({ client: client });
        store.del('key');
      });

      it('deletes the key', function () {
        var store = new RedisStore({ client: client });
        store.set('key', 'value');
        store.del('key');
        expect(store.get('key')).to.equal(void 0);
      }.wrapIt());
    });

    describe('#peek', function () {
      it('gets the value for the key', function () {
        var mock = sandbox.mock(client);
        mock.expects('get').withArgs('key').yields(null, 'value');
        var store = new RedisStore({ client: client });
        store.peek('key').should.equal('value');
      });
    });

    describe('#has', function () {
      it('always returns true', function () {
        var store = new RedisStore({ client: client });
        store.has('key').should.equal(true);
      });
    });

    describe('#reset', function () {
      it('calls flushall', function () {
        client.flushall = function () {};
        var mock = sandbox.mock(client);
        mock.expects('flushall').yields();
        var store = new RedisStore({ client: client });
        store.reset();
      });
    });
  });
});
