/*! Scrollable - v0.1.0 - 2013-08-29
* https://github.com/konstantingorozankin/scrollable
* Copyright (c) 2013 Konstantin Gorozhankin; Licensed MIT */
(function() {
  window.Scrollable = void 0;

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
    Scrollable = function(el, opts, funcs) {
      this.me = el;
      $.extend(this, funcs);
      this.init(opts);
      return $.data(el, "scrollable", this);
    };
    return Scrollable.prototype = {
      init: function(config) {
        var itemRoot, opts, root, self;
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
        this.items.each(function(index) {
          return $(this).bind("click.scrollable", function(e) {
            self.click(index);
            return e.preventDefault();
          });
        });
        this.activeIndex = 0;
        $("<a href='#' />").addClass(opts.prev).appendTo(this.root).click(function(e) {
          if (opts.naviPage) {
            self.prevPage();
          } else {
            self.prev();
          }
          return e.preventDefault();
        });
        return $("<a href='#' />").addClass(opts.next).appendTo(this.root).click(function(e) {
          if (opts.naviPage) {
            self.nextPage();
          } else {
            self.next();
          }
          return e.preventDefault();
        });
      },
      update: function(config) {
        $.extend(this.opts, config);
        this.itemRoot.css({
          width: this.opts.size * this.opts.width + (this.opts.size - 1) * this.opts.item_margin
        });
        return this.seekTo(this.index, this.opts.speed);
      },
      click: function(index) {
        var item, klass, prev;
        item = this.items.eq(index);
        klass = this.opts.activeClass;
        if (!item.hasClass(klass) && (index >= 0 || index < this.items.size())) {
          prev = this.items.eq(this.activeIndex).removeClass(klass);
          item.addClass(klass);
          this.seekTo(index - Math.floor(this.opts.size / 2));
          return this.activeIndex = index;
        }
      },
      getStatus: function() {
        var len, s;
        len = this.items.size();
        return s = {
          length: len,
          index: this.index,
          size: this.opts.size,
          pages: Math.floor(len / this.opts.size),
          page: Math.floor(this.index / this.opts.size)
        };
      },
      seekTo: function(index, time) {
        var afterSlide, balance, elems, item, left, left_0, self;
        this.wrap.stop(true, true);
        afterSlide = function() {};
        self = this;
        item = this.wrap.children().eq(index);
        left = void 0;
        elems = void 0;
        balance = this.items.length - index - this.opts.size;
        console.log("balance: " + balance + "; index: " + index);
        if (balance < 0) {
          elems = this.wrap.children().slice(0, -balance);
          elems.clone(true, true).appendTo(this.wrap);
          item = this.wrap.children().eq(index);
          left_0 = this.wrap.css("left");
          left = -item.position().left;
          afterSlide = function() {
            elems.remove();
            console.log(index, balance, item.position().left);
            return self.wrap.css("left", -item.position().left);
          };
        } else if (index < 0) {
          elems = this.wrap.children().slice(index);
          elems.clone(true, true).prependTo(this.wrap);
          item = this.wrap.children().eq(0);
          console.log(index, -this.wrap.children().eq(this.index - index).position().left);
          this.wrap.css("left", -this.wrap.children().eq(this.index - index).position().left);
          left = 0;
          afterSlide = function() {
            return elems.remove();
          };
          this.index = 0;
        } else {
          item = this.wrap.children().eq(index);
          left = -item.position().left;
          this.index = index;
        }
        this.wrap.animate({
          left: left
        }, time || this.opts.speed, afterSlide);
        return false;
      },
      move: function(offset, time) {
        return this.seekTo(this.index + offset, time);
      },
      next: function(time) {
        return this.move(1, time);
      },
      prev: function(time) {
        return this.move(-1, time);
      },
      movePage: function(offset, time) {
        return this.move(this.opts.size * offset, time);
      },
      setPage: function(index, time) {
        return this.seekTo(this.opts.size * index, time);
      },
      prevPage: function(time) {
        return this.seekTo(this.index - this.opts.size, time);
      },
      nextPage: function(time) {
        return this.seekTo(this.index + this.opts.size, time);
      },
      begin: function(time) {
        return this.seekTo(0, time);
      },
      end: function(time) {
        return this.seekTo(this.items.size() - this.opts.size, time);
      }
    };
  })(jQuery);

}).call(this);
