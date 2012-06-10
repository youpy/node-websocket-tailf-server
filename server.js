var
    port            = process.env.PORT || 3000,
    WebSocketServer = require('ws').Server,
    wss             = module.exports.wss = new WebSocketServer({port: 8080}),
    express         = require('express'),
    app             = module.exports.app = express.createServer(),
    md5             = require('md5');

app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.use(express.static(__dirname + '/public'));

app.post('/channels', function(req, res) {
  var id = md5.digest_s((+ new Date()).toString());
  makeChannel(wss, id);
  res.json({ id: id });
});

app.get('/channels/:id', function(req, res) {
  var id = req.params.id;
  res.render('channel', { id: id });
});

if(!module.parent) {
  app.listen(port);
}

function makeChannel(wss, path) {
  wss.on('connection/' + path, function(ws) {
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
