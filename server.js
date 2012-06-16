var
    port            = process.env.PORT || 8080,
    WebSocketServer = require('ws').Server,
    wss             = module.exports.wss = new WebSocketServer({port: port}),
    md5             = require('md5');

wss.on('connection/channels', function(ws) {
  var id = md5.digest_s((+ new Date()).toString());
  makeChannel(wss, id);
  ws.send(id);
  ws.close();
});

function makeChannel(wss, path) {
  wss.on('connection/channels/' + path, function(ws) {
    ws.path = path;
    ws.on('message', function(message) {
      wss.clients.filter(function(client) {
        return client.path == path;
      }).forEach(function(client) {
        client.send(message);
      });
    });
  });
}
