(($) ->
  
  # plugin initialization
  $.fn.extend scrollable: (arg1, arg2, arg3) ->
    @each ->
      if typeof arg1 is "string"
        
        # позволяет из вне обратиться к слайдеру и заставить его выполнить какое-либо действие. Например: $("div.box").scrollable("next", 300);
        el = $.data(this, "scrollable")
        el[arg1].apply el, [arg2, arg3]
      else
        sl = new Scrollable(this, arg1, arg2)


  
  # constructor
  Scrollable = (el, opts, funcs) ->
    
    # store this instance
    @me = el
    $.extend this, funcs
    @init opts
    $.data el, "scrollable", this

  
  # methods
  Scrollable:: =
    init: (config) ->

      # current instance
      self = this
      opts =
        size: 1
        activeClass: "active"
        speed: 600
        onSeek: null # callback функция, для seekTo, полезность сомнительная,
        # потому как элемент на который был произведен клик остается недоступен внутри функции,
        # возможно, есть смысл использовать при установке активных/неактивных стрелочек
        naviPage: false # навигация по страницам, т.е. перелистывание будет происходить блоками
        rolling: true
        cycleRolling: false
        width: 200
        item_margin: 0
        
        # jquery selectors
        items: ".items"
        prev: "prev"
        next: "next"
        navi: ".navi"
        naviItem: "span"

      @opts = $.extend(opts, config)
      
      # root / itemRoot
      root = @root = $(self.me)
      itemRoot = @itemRoot = $(opts.items, root)
      itemRoot = root  unless itemRoot.length
      
      # wrap itemRoot.children() inside container
      # itemRoot.css({position:'relative', overflow:'hidden', visibility:'visible', width: 640});
      # itemRoot.children().wrapAll('<div class="__scrollable" style="position:absolute;"/>');
      @wrap = itemRoot.children(":first")
      @items = @wrap.children()
      @index = 0
      return false  if @getStatus().length <= @opts.size
      
      # item.click()
      @items.bind "click.scrollable", (e) ->
        self.click $(@).index()
        e.preventDefault()


      # @activeIndex = 0
      $("<a href='#' />").addClass(opts.prev).appendTo(@root).click (e) ->
        (if opts.naviPage then self.prevPage() else self.prev())
        e.preventDefault()

      $("<a href='#' />").addClass(opts.next).appendTo(@root).click (e) ->
        (if opts.naviPage then self.nextPage() else self.next())
        e.preventDefault()


    
    # console.log("before getStatus: " + this.opts.speed)
    # this.getStatus();
    update: (config) ->
      $.extend @opts, config
      @itemRoot.css width: @opts.size * @opts.width + (@opts.size - 1) * @opts.item_margin
      @seekTo @index, @opts.speed

    click: (index) ->
      klass = @opts.activeClass

      @wrap.children().removeClass(klass).eq(index).addClass klass

      # console.log("click: ", index)
      # if not item.hasClass(klass) and (index >= 0 or index < @items.size())
        # alert index

        # @seekTo index - Math.floor(@opts.size / 2)
        # @index = index

    getStatus: ->
      
      # console.log("native")
      len = @items.size()
      s =
        length: len
        index: @index # определяет положение ленты
        size: @opts.size
        pages: Math.floor(len / @opts.size)
        page: Math.floor(@index / @opts.size)
    
    # all other seeking functions depend on this generic seeking function    
    # seekTo: (index, time) ->
    #   index = 0  if index < 0
    #   index = Math.min(index, @items.length - @opts.size)
    #   item = @items.eq(index)
    #   return false  if item.size() is 0
    #   @index = index
    #   left = @wrap.offset().left - item.offset().left
    #   @wrap.stop(true, true).animate
    #     left: left
    #   , time or @opts.speed
      
    #   # custom onSeek callback
    #   @opts.onSeek.call @getStatus()  if $.isFunction(@opts.onSeek)
      
    #   # navi status update
    #   # var navi = $(this.opts.navi, this.root);
      
    #   # if (navi.length) {
    #   #   var klass = this.opts.activeClass;
    #   #   var page = Math.round(index / this.opts.size);
    #   #   navi.children().removeClass(klass).eq(page).addClass(klass);
    #   # }
    #   true

    _seekToPositive: (balance, index)->
      elems = @wrap.children().slice(0, -balance)
      elems.clone(true, true).appendTo @wrap
      item = @wrap.children().eq(index)
      left = -item.position().left
      @index = index + balance
      [left: left, => elems.remove(); @wrap.css "left", -item.position().left ]

    _seekToNegative: (index)->
      elems = @wrap.children().slice(index)
      elems.clone(true, true).prependTo @wrap
      item = @wrap.children().eq(0)
      @wrap.css "left", -@wrap.children().eq(@index - index).position().left
      @index = 0 
      [left: 0, -> elems.remove()]

    _seekTo: (index)->
      if index < 0
        @_seekToNegative(index)
      else if (balance = @items.length - index - @opts.size) < 0
        @_seekToPositive(balance, index)
      else
        item = @wrap.children().eq(index)
        @index = index
        [left: -item.position().left]
              
    seekTo: (index, time) ->
      time ?= @opts.speed
      @wrap.stop true, true
      arr = @_seekTo(index)
      arr.slice(1, 0, time)
      @wrap.animate.apply @wrap, arr

    move: (offset, time) ->
      @seekTo @index + offset, time

    next: (time) ->
      @move 1, time

    prev: (time) ->
      @move -1, time

    movePage: (offset, time) ->
      @move @opts.size * offset, time

    setPage: (index, time) ->
      @seekTo @opts.size * index, time

    prevPage: (time) ->
      @seekTo @index - @opts.size, time

    nextPage: (time) ->
      @seekTo @index + @opts.size, time

    begin: (time) ->
      @seekTo 0, time

    end: (time) ->
      @seekTo @items.size() - @opts.size, time
) jQuery