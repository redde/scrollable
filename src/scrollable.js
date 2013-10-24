(function() {
  (function($) {
    var Scrollable;
    $.fn.extend({
      scrollable: function(arg1, arg2, arg3) {
        return this.each(function() {
          var el, sl;
          if (typeof arg1 === "string") {
            el = $.data(this, "scrollable");
            return el[arg1].apply(el, [arg2, arg3]);
          } else {
            return sl = new Scrollable(this, arg1, arg2);
          }
        });
      }
    });
    return Scrollable = (function() {
      function Scrollable(el, opts, funcs) {
        this.me = el;
        $.extend(this, funcs);
        this.init(opts);
        $.data(el, "scrollable", this);
      }

      Scrollable.prototype.init = function(config) {
        var itemRoot, naviType, opts, root, self;
        self = this;
        opts = {
          size: 1,
          activeClass: "active",
          speed: 600,
          onSeek: null,
          naviPage: false,
          rolling: true,
          cycleRolling: false,
          width: 200,
          item_margin: 0,
          items: ".items",
          prev: "prev",
          next: "next",
          navi: ".navi",
          naviItem: "span"
        };
        this.opts = $.extend(opts, config);
        root = this.root = $(self.me);
        itemRoot = this.itemRoot = $(opts.items, root);
        if (!itemRoot.length) {
          itemRoot = root;
        }
        this.wrap = itemRoot.children(":first");
        this.items = this.wrap.children();
        this.index = 0;
        if (this.getStatus().length <= this.opts.size) {
          return false;
        }
        this.items.bind("click.scrollable", function(e) {
          self.click($(this).index());
          return e.preventDefault();
        });
        naviType = opts.naviPage ? 'Page' : '';
        $("<a href='#' />").addClass(opts.prev).appendTo(this.root).click(function(e) {
          self["prev" + naviType]();
          return e.preventDefault();
        });
        return $("<a href='#' />").addClass(opts.next).appendTo(this.root).click(function(e) {
          self["next" + naviType]();
          return e.preventDefault();
        });
      };

      Scrollable.prototype.update = function(config) {
        $.extend(this.opts, config);
        this.itemRoot.css({
          width: this.opts.size * this.opts.width + (this.opts.size - 1) * this.opts.item_margin
        });
        return this.seekTo(this.index, this.opts.speed);
      };

      Scrollable.prototype.click = function(index) {
        var klass;
        klass = this.opts.activeClass;
        return this.wrap.children().removeClass(klass).eq(index).addClass(klass);
      };

      Scrollable.prototype.getStatus = function() {
        var len, s;
        len = this.items.size();
        return s = {
          length: len,
          index: this.index,
          size: this.opts.size,
          pages: Math.floor(len / this.opts.size),
          page: Math.floor(this.index / this.opts.size)
        };
      };

      Scrollable.prototype._seekToPositive = function(balance, index) {
        var elems, item, left,
          _this = this;
        elems = this.wrap.children().slice(0, -balance);
        elems.clone(true, true).appendTo(this.wrap);
        item = this.wrap.children().eq(index);
        left = -item.position().left;
        this.index = index + balance;
        return [
          {
            left: left
          }, function() {
            elems.remove();
            return _this.wrap.css("left", -item.position().left);
          }
        ];
      };

      Scrollable.prototype._seekToNegative = function(index) {
        var elems, item;
        elems = this.wrap.children().slice(index);
        elems.clone(true, true).prependTo(this.wrap);
        item = this.wrap.children().eq(0);
        this.wrap.css("left", -this.wrap.children().eq(this.index - index).position().left);
        this.index = 0;
        return [
          {
            left: 0
          }, function() {
            return elems.remove();
          }
        ];
      };

      Scrollable.prototype._seekTo = function(index) {
        var balance, item;
        if (index < 0) {
          return this._seekToNegative(index);
        } else if ((balance = this.items.length - index - this.opts.size) < 0) {
          return this._seekToPositive(balance, index);
        } else {
          item = this.wrap.children().eq(index);
          this.index = index;
          return [
            {
              left: -item.position().left
            }
          ];
        }
      };

      Scrollable.prototype.seekTo = function(index, time) {
        var arr;
        if (time == null) {
          time = this.opts.speed;
        }
        this.wrap.stop(true, true);
        arr = this._seekTo(index);
        arr.slice(1, 0, time);
        return this.wrap.animate.apply(this.wrap, arr);
      };

      Scrollable.prototype.move = function(offset, time) {
        return this.seekTo(this.index + offset, time);
      };

      Scrollable.prototype.next = function(time) {
        return this.move(1, time);
      };

      Scrollable.prototype.prev = function(time) {
        return this.move(-1, time);
      };

      Scrollable.prototype.movePage = function(offset, time) {
        return this.move(this.opts.size * offset, time);
      };

      Scrollable.prototype.setPage = function(index, time) {
        return this.seekTo(this.opts.size * index, time);
      };

      Scrollable.prototype.prevPage = function(time) {
        return this.seekTo(this.index - this.opts.size, time);
      };

      Scrollable.prototype.nextPage = function(time) {
        return this.seekTo(this.index + this.opts.size, time);
      };

      Scrollable.prototype.begin = function(time) {
        return this.seekTo(0, time);
      };

      Scrollable.prototype.end = function(time) {
        return this.seekTo(this.items.size() - this.opts.size, time);
      };

      return Scrollable;

    })();
  })(jQuery);

}).call(this);
