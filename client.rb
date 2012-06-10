require 'web_socket'
require 'net/http'
require 'uri'
require 'json'
require 'launchy'

$stdin.sync = true

URL = 'http://localhost:3000/channels'
WS_URL = 'ws://localhost:8080/'

def main
  id = ARGV.shift || new_id
  channel_url = URL + '/' + id

  puts channel_url
  Launchy.open(channel_url)

  client = WebSocket.new(WS_URL + id)
  open('/dev/stdin') do |f|
    f.each do |line|
      client.send(line)
    end
  end
end

def new_id
  uri = URI(URL)
  http = Net::HTTP.new(uri.host, uri.port)
  response = http.request(Net::HTTP::Post.new(uri.path))
  JSON.parse(response.body)['id']
end

main
