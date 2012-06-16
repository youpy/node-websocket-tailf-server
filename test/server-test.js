var mocha     = require('mocha'),
    should    = require('should'),
    wss       = require('../server').wss,
    WebSocket = require('ws'),
    async     = require('async');

describe('WebSocket', function() {
  it('should create channel', function(done) {
    var id,
        ws, ws1, ws2, ws3;

    async.series([
      function(callback) {
        ws = new WebSocket('http://localhost:8080/channels');
        ws.on('open', function() {
          ws.on('message', function(data, flags) {
            data.should.match(/^[0-9a-f]{32}$/);
            
            id = data;

            callback();
          });
        });
      },
      function(callback) {
        ws1 = new WebSocket('http://localhost:8080/channels/' + id);
        ws1.on('open', function() {
          wss.clients.length.should.eql(1);
          should.exist(wss.clients[0].path);
          wss.clients[0].path.should.eql(id);

          ws1.on('message', function(data, flags) {
            data.should.eql('xxx');

            ws1.close();
            ws2.close();
            ws3.close();

            done();
          });

          callback();
        });
      },
      function(callback) {
        ws2 = new WebSocket('http://localhost:8080/channels/bar');
        ws2.on('open', function() {
          wss.clients.length.should.eql(2);
          should.not.exist(wss.clients[1].path);

          callback();
        });
      },
      function(callback) {
        ws3 = new WebSocket('http://localhost:8080/channels/' + id);
        ws3.on('open', function() {
          wss.clients.length.should.eql(3);
          wss.clients[2].path.should.eql(id);
          should.exist(wss.clients[2].path);

          ws3.send('xxx');

          callback();
        });
      }
    ]);
  });
});
