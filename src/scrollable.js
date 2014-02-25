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
        this.root = el;
        $.extend(this, funcs);
        this.init(opts);
        $.data(el, "scrollable", this);
      }

      Scrollable.prototype.init = function(config) {
        var opts, self;
        self = this;
        opts = {
          size: 1,
          activeClass: "_active",
          speed: 600,
          onSeek: null,
          naviPage: false,
          rolling: true,
          width: 200,
          item_margin: 0,
          items: ".__scrollable",
          item: ".item",
          prevClass: "prev",
          nextClass: "next",
          navi: ".navi"
        };
        this.opts = $.extend(opts, config);
        this.wrap = $(this.root).find(this.opts.items);
        this.items = this.wrap.find(this.opts.item);
        this.index = 0;
        this.items.bind("click.scrollable", function(e) {
          self.click($(this).index());
          return e.preventDefault();
        });
        if (this.getStatus().length <= this.opts.size) {
          return this.initNavi();
        }
      };

      Scrollable.prototype.initNavi = function() {
        var len, naviType, s, that,
          _this = this;
        that = this;
        this.navi = {};
        naviType = this.opts.naviPage ? 'Page' : '';
        this.navi.prev = $("<a href='javascript:void(0);' />").addClass(this.opts.prevClass).appendTo(this.root).click(function() {
          return _this["prev" + naviType]();
        });
        this.navi.next = $("<a href='javascript:void(0);' />").addClass(this.opts.nextClass).appendTo(this.root).click(function() {
          return _this["next" + naviType]();
        });
        s = this.getStatus();
        len = Math.ceil(s.length / this.opts.size);
        if (len) {
          this.navi.box = $(this.opts.navi, this.root).html($.map(new Array(len), function(n) {
            return "<a class='navi__link' href='javascript:void(0);'>" + n + "</a>";
          }).join('')).on('click', 'a', function() {
            return that.setPage($(this).index());
          });
          this.navi.items = this.navi.box.find('a');
          return this.updateNavi();
        }
      };

      Scrollable.prototype.updateNavi = function() {
        var s;
        if (this.opts.rolling) {
          return false;
        }
        s = this.getStatus();
        this.navi.items.removeClass('is-active').eq(s.page).addClass('is-active');
        this.navi.next.css('visibility', 'visible');
        this.navi.prev.css('visibility', 'visible');
        if (s.page === 0) {
          this.navi.prev.css('visibility', 'hidden');
        }
        if (s.page === s.pages) {
          return this.navi.next.css('visibility', 'hidden');
        }
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
          page: Math.ceil(this.index / this.opts.size)
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
        if (!this.opts.rolling) {
          if (index < 0) {
            index = 0;
          }
          index = Math.min(index, this.items.length - this.opts.size);
        }
        arr = this._seekTo(index);
        arr.slice(1, 0, time);
        this.wrap.animate.apply(this.wrap, arr);
        return this.updateNavi();
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
