$(function() {
  var Console = function(e) {
    this.e = e;

    e.on('click', 'p', function(evt) {
      $(this).toggleClass('ellipsis');
    });
  };

  Console.prototype.add = function(text) {
    var p = $('<p class="prepended ellipsis" />');

    p.text(text);
    this.e.prepend(p);
    this.e.trigger('add', [p]);

    setTimeout(function() {
      p.removeClass('prepended');
    }, 100);
  };
  
  var id = $('body').data('channel-id'),
      title = document.title,
      console = new Console($('#console')),
      count = 0,
      ws = new WebSocket("ws://localhost:8080/" + id);

  ws.onmessage = function(evt) {
    console.add(evt.data);
    document.title = '(' + (++ count) + ') ' + title;
  };
});
