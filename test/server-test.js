var mocha     = require('mocha'),
    should    = require('should'),
    _         = require('underscore'),
    app       = require('../server').app,
    wss       = require('../server').wss,
    request   = require('request'),
    WebSocket = require('ws'),
    port      = 3001;

_.extend(Function.prototype, {
  toRequestSpec: function(method, path, options) {
    var self = this;
    return function(done) {
      request(
        _.extend({
          method: method,
          url: 'http://localhost:' + port + path
        }, options || {}),
        function(req, res) {
          self.call(null, req, res, done);
        }
      );
    };
  }
});

describe('API', function() {
  before(function() {
    app.listen(port);
  });

  after(function() {
    app.close();
  });

  describe('GET /channels', function() {
    var method = 'get',
        path   = '/channels/xxx';

    it('should respond', function(req, res, done) {
      res.statusCode.should.eql(200);
      res.body.should.match(/^<!DOCTYPE html><html/);
      res.body.should.match(/data-channel-id="xxx"/);

      done();
    }.toRequestSpec(method, path));
  });

  describe('POST /channels', function() {
    var method = 'post',
        path   = '/channels';

    it('should create channel', function(req, res, done) {
      var data = JSON.parse(res.body),
          ws, ws2, ws3;

      should.exist(data.id);
      data.id.should.match(/^[0-9a-f]{32}$/);

      ws = new WebSocket('http://localhost:8080/' + data.id);
      ws.on('open', function() {
        wss.clients.length.should.eql(1);
        should.exist(wss.clients[0].path);
        wss.clients[0].path.should.eql(data.id);

        ws.on('message', function(data, flags) {
          data.should.eql('xxx');

          ws.close();
          ws2.close();
          ws3.close();

          done();
        });
        
        ws2 = new WebSocket('http://localhost:8080/xxx');
        ws2.on('open', function() {
          wss.clients.length.should.eql(2);
          should.not.exist(wss.clients[1].path);

          ws3 = new WebSocket('http://localhost:8080/' + data.id);
          ws3.on('open', function() {
            wss.clients.length.should.eql(3);
            should.exist(wss.clients[2].path);
            wss.clients[2].path.should.eql(data.id);

            ws3.send('xxx');
          });
        });
      });
    }.toRequestSpec(method, path));
  });
});
