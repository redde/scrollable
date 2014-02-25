var sc1, sc2;
$(function(){
  var funcs = {
    update: function(config) {
      $.extend(this.opts, config);
      this.itemRoot.add(this.me).css({
        width: this.opts.size * this.opts.width + (this.opts.size - 1) * this.opts.item_margin
      });
      this.seekTo(this.index, this.opts.speed);
    },
    click: function(index){
      console.log(this.items.eq(index))
    }
  }
  sc1 = $("div.scrollable").eq(0).scrollable({
    size:4,
    width:200,
    naviPage: true,
    item_margin: 20,
    speed: 600
  }, funcs);
  sc2 = $("div.scrollable").eq(1).scrollable({
    size:4,
    width:200,
    naviPage: true,
    item_margin: 20,
    speed: 600,
    rolling: false
  }, funcs);
});

function update(index) {
  sc1.scrollable('update', {size:index});
  sc2.scrollable('update', {size:index});
};