var sc;
$(function(){
  var funcs = {
    update: function(config) {
      $.extend(this.opts, config);
      this.itemRoot.add(this.me).css({
        width: this.opts.size * this.opts.width + (this.opts.size - 1) * this.opts.item_margin
      });
      this.seekTo(this.index, this.opts.speed);
    }
  }
  sc = $("div.scrollable").scrollable({
    size:4,
    width:200,
    naviPage: true,
    item_margin: 20,
    speed: 600
  }, funcs);
});

function update(index) {
  sc.scrollable('update', {size:index});
};