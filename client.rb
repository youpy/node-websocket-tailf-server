require 'web_socket'
require 'net/http'
require 'uri'
require 'json'
require 'launchy'

$stdin.sync = true

URL = 'http://localhost:3000/channels'
WS_URL = 'ws://localhost:8080'

def main
  client = WebSocket.new(WS_URL + '/channels')
  id = client.receive
  client.close

  channel_url = URL + '/' + id
  ws_channel_url = WS_URL + '/channels/' + id

  puts channel_url
  Launchy.open(channel_url)

  client = WebSocket.new(ws_channel_url)
  $stdin.each do |line|
    client.send(line)
  end
end

main
