do ($ = jQuery) ->
  
  # plugin initialization
  $.fn.extend scrollable: (arg1, arg2, arg3) ->
    @each ->
      if typeof arg1 is "string"
        
        # позволяет из вне обратиться к слайдеру и заставить его выполнить какое-либо действие. Например: $("div.box").scrollable("next", 300);
        el = $.data(this, "scrollable")
        el[arg1].apply el, [arg2, arg3]
      else
        sl = new Scrollable(this, arg1, arg2)
  
  class Scrollable
    constructor: (el, opts, funcs) ->
      # store this instance
      @root = el
      $.extend this, funcs
      @init opts
      $.data el, "scrollable", this

    init: (config) ->
      # current instance
      self = this
      opts =
        size: 1
        activeClass: "_active"
        speed: 600
        onSeek: null # callback функция, для seekTo, полезность сомнительная,
        # потому как элемент на который был произведен клик остается недоступен внутри функции,
        # возможно, есть смысл использовать при установке активных/неактивных стрелочек
        naviPage: false # навигация по страницам, т.е. перелистывание будет происходить блоками
        rolling: true
        width: 200
        item_margin: 0
        
        # jquery selectors
        items: ".__scrollable"
        item: ".item"
        prevClass: "prev"
        nextClass: "next"
        navi: ".navi"


      @opts = $.extend(opts, config)

      @wrap = $(@root).find(@opts.items)
      
      @items = @wrap.find(@opts.item)

      @index = 0

      # item.click()
      @items.bind "click.scrollable", (e) ->
        self.click $(@).index()
        e.preventDefault()

      if @getStatus().length <= @opts.size
        @initNavi()

    initNavi: ->
      that = @
      @navi = {}
      naviType = if @opts.naviPage then 'Page' else ''
      @navi.prev = $("<a href='javascript:void(0);' />").addClass(@opts.prevClass).appendTo(@root).click =>
        @["prev#{naviType}"]()

      @navi.next = $("<a href='javascript:void(0);' />").addClass(@opts.nextClass).appendTo(@root).click =>
        @["next#{naviType}"]()

      s = @getStatus()
      len = Math.ceil( s.length / @opts.size )

      if len
        @navi.box = $(@opts.navi, @root).html( $.map new Array(len), (n)->
          "<a class='navi__link' href='javascript:void(0);'>#{n}</a>"
        .join(''))
        .on 'click', 'a', ->
          that.setPage $(@).index()
        @navi.items = @navi.box.find('a')
        @updateNavi()

    updateNavi: ->
      return false if @opts.rolling
      s = @getStatus()
      @navi.items.removeClass('is-active').eq(s.page).addClass 'is-active'
      @navi.next.css 'visibility', 'visible'
      @navi.prev.css 'visibility', 'visible'
      if s.page == 0
        @navi.prev.css 'visibility', 'hidden'
      if s.page == s.pages
        @navi.next.css 'visibility', 'hidden'

    update: (config) ->
      $.extend @opts, config
      @itemRoot.css width: @opts.size * @opts.width + (@opts.size - 1) * @opts.item_margin
      @seekTo @index, @opts.speed

    click: (index) ->
      klass = @opts.activeClass

      @wrap.children().removeClass(klass).eq(index).addClass klass

      # if not item.hasClass(klass) and (index >= 0 or index < @items.size())
        # @seekTo index - Math.floor(@opts.size / 2)
        # @index = index

    getStatus: ->
      len = @items.size()
      s =
        length: len
        index: @index # определяет положение ленты
        size: @opts.size
        pages: Math.floor(len / @opts.size)
        page: Math.ceil(@index / @opts.size)
    
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

      unless @opts.rolling
        index = 0 if index < 0         
        index = Math.min(index, @items.length - @opts.size)

      arr = @_seekTo(index)
      arr.slice(1, 0, time)
      @wrap.animate.apply @wrap, arr
      @updateNavi()

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