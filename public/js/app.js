(function(g) {
  var Channel = function(e) {
    this.e = $(e);
    this.id = this.e.data('channel-id');
    this.title = document.title;
    this.count = 0;

    this.e.on('click', 'p', function(evt) {
      $(this).toggleClass('ellipsis');
    });
  };
  
  Channel.prototype.connect = function() {
    var ws = new WebSocket("ws://localhost:8080/" + this.id),
        e = this.e,
        count = this.count,
        title = this.title;

    ws.onmessage = function (evt) {
      var p = $('<p class="prepended ellipsis" />');

      p.text(evt.data);
      e.prepend(p);

      setTimeout(function() {
        p.removeClass('prepended');
      }, 100);
      
      document.title = '(' + (++ count) + ') ' + title;
    };
  };

  g.Channel = Channel;
})(window);
