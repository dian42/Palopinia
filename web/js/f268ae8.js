/* =============================================================
 * bootstrap-typeahead.js v2.0.4
 * http://twitter.github.com/bootstrap/javascript.html#typeahead
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function($){

  "use strict"; // jshint ;_;


 /* TYPEAHEAD PUBLIC CLASS DEFINITION
  * ================================= */

  var Typeahead = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeahead.defaults, options)
    this.matcher = this.options.matcher || this.matcher
    this.sorter = this.options.sorter || this.sorter
    this.highlighter = this.options.highlighter || this.highlighter
    this.updater = this.options.updater || this.updater
    this.$menu = $(this.options.menu).appendTo('body')
    this.source = this.options.source
    this.shown = false
    this.listen()
  }

  Typeahead.prototype = {

    constructor: Typeahead

  , select: function () {
      var val = this.$menu.find('.active').attr('data-value')
      this.$element
        .val(this.updater(val))
        .change()
      return this.hide()
    }

  , updater: function (item) {
      return item
    }

  , show: function () {
      var pos = $.extend({}, this.$element.offset(), {
        height: this.$element[0].offsetHeight
      })

      this.$menu.css({
        top: pos.top + pos.height
      , left: pos.left
      })

      this.$menu.show()
      this.shown = true
      return this
    }

  , hide: function () {
      this.$menu.hide()
      this.shown = false
      return this
    }

  , lookup: function (event) {
      var that = this
        , items
        , q

      this.query = this.$element.val()

      if (!this.query) {
        return this.shown ? this.hide() : this
      }

      items = $.grep(this.source, function (item) {
        return that.matcher(item)
      })

      items = this.sorter(items)

      if (!items.length) {
        return this.shown ? this.hide() : this
      }

      return this.render(items.slice(0, this.options.items)).show()
    }

  , matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase())
    }

  , sorter: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item

      while (item = items.shift()) {
        if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
        else if (~item.indexOf(this.query)) caseSensitive.push(item)
        else caseInsensitive.push(item)
      }

      return beginswith.concat(caseSensitive, caseInsensitive)
    }

  , highlighter: function (item) {
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
      return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>'
      })
    }

  , render: function (items) {
      var that = this

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item)
        i.find('a').html(that.highlighter(item))
        return i[0]
      })

      items.first().addClass('active')
      this.$menu.html(items)
      return this
    }

  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.next()

      if (!next.length) {
        next = $(this.$menu.find('li')[0])
      }

      next.addClass('active')
    }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prev()

      if (!prev.length) {
        prev = this.$menu.find('li').last()
      }

      prev.addClass('active')
    }

  , listen: function () {
      this.$element
        .on('blur',     $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))

      if ($.browser.webkit || $.browser.msie) {
        this.$element.on('keydown', $.proxy(this.keypress, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
    }

  , keyup: function (e) {
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
          break

        case 9: // tab
        case 13: // enter
          if (!this.shown) return
          this.select()
          break

        case 27: // escape
          if (!this.shown) return
          this.hide()
          break

        default:
          this.lookup()
      }

      e.stopPropagation()
      e.preventDefault()
  }

  , keypress: function (e) {
      if (!this.shown) return

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault()
          break

        case 38: // up arrow
          if (e.type != 'keydown') break
          e.preventDefault()
          this.prev()
          break

        case 40: // down arrow
          if (e.type != 'keydown') break
          e.preventDefault()
          this.next()
          break
      }

      e.stopPropagation()
    }

  , blur: function (e) {
      var that = this
      setTimeout(function () { that.hide() }, 150)
    }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
    }

  , mouseenter: function (e) {
      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
    }

  }


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  $.fn.typeahead = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeahead.defaults = {
    source: []
  , items: 8
  , menu: '<ul class="typeahead dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  }

  $.fn.typeahead.Constructor = Typeahead


 /* TYPEAHEAD DATA-API
  * ================== */

  $(function () {
    $('body').on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
      var $this = $(this)
      if ($this.data('typeahead')) return
      e.preventDefault()
      $this.typeahead($this.data())
    })
  })

}(window.jQuery);
// Generated by CoffeeScript 1.3.3

/* ============================================================
# bootstrap-tour.js v0.1
# http://pushly.github.com/bootstrap-tour/
# ==============================================================
# Copyright 2012 Push.ly
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
*/


(function() {

  (function($, window) {
    var Tour, document;
    document = window.document;
    Tour = (function() {

      function Tour(options) {
        var _this = this;
        this._options = $.extend({
          afterSetState: function(key, value) {},
          afterGetState: function(key, value) {}
        }, options);
        this._steps = [];
        this.setCurrentStep();
        $(document).on("click", ".popover .next", function(e) {
          e.preventDefault();
          return _this.next();
        });
        $(document).on("click", ".popover .end", function(e) {
          e.preventDefault();
          return _this.end();
        });
      }

      Tour.prototype.setState = function(key, value) {
        $.cookie("tour_" + key, value, {
          expires: 36500,
          path: '/'
        });
        return this._options.afterSetState(key, value);
      };

      Tour.prototype.getState = function(key) {
        var value;
        value = $.cookie("tour_" + key);
        this._options.afterGetState(key, value);
        return value;
      };

      Tour.prototype.addStep = function(step) {
        return this._steps.push(step);
      };

      Tour.prototype.getStep = function(i) {
        return $.extend({
          path: "",
          placement: "right",
          title: "",
          content: "",
          next: i + 1,
          end: i === this._steps.length - 1,
          animation: true
        }, this._steps[i]);
      };

      Tour.prototype.start = function(force) {
        if (force == null) {
          force = false;
        }
        if (force || !this.ended()) {
          return this.showStep(this._current);
        }
      };

      Tour.prototype.next = function() {
        this.hideStep(this._current);
        return this.showNextStep();
      };

      Tour.prototype.end = function() {
        this.hideStep(this._current);
        return this.setState("end", "yes");
      };

      Tour.prototype.ended = function() {
        return !!this.getState("end");
      };

      Tour.prototype.restart = function() {
        this.setState("current_step", null);
        this.setState("end", null);
        this.setCurrentStep(0);
        return this.start();
      };

      Tour.prototype.hideStep = function(i) {
        var step;
        step = this.getStep(i);
        if (step.onHide != null) {
          step.onHide(this);
        }
        return $(step.element).popover("hide");
      };

      Tour.prototype.showStep = function(i) {
        var endOnClick, step,
          _this = this;
        step = this.getStep(i);
        if (step.element == null) {
          this.end;
          return;
        }
        this.setCurrentStep(i);
        if (step.path !== "" && document.location.pathname !== step.path && document.location.pathname.replace(/^.*[\\\/]/, '') !== step.path) {
          document.location.href = step.path;
          return;
        }
        if ($(step.element).is(":hidden")) {
          this.showNextStep();
          return;
        }
        endOnClick = step.endOnClick || step.element;
        $(endOnClick).one("click", function() {
          return _this.endCurrentStep();
        });
        if (step.onShow != null) {
          step.onShow(this);
        }
        return this._showPopover(step, i);
      };

      Tour.prototype.setCurrentStep = function(value) {
        if (value != null) {
          this._current = value;
          return this.setState("current_step", value);
        } else {
          this._current = this.getState("current_step");
          if (this._current === null || this._current === "null") {
            return this._current = 0;
          } else {
            return this._current = parseInt(this._current);
          }
        }
      };

      Tour.prototype.endCurrentStep = function() {
        var step;
        this.hideStep(this._current);
        step = this.getStep(this._current);
        return this.setCurrentStep(step.next);
      };

      Tour.prototype.showNextStep = function() {
        var step;
        step = this.getStep(this._current);
        return this.showStep(step.next);
      };

      Tour.prototype._showPopover = function(step, i) {
        var content, tip;
        content = "" + step.content + "<br /><p>";
        if (step.end) {
          content += "<a href='#' class='end'>End</a>";
        } else {
          content += "<a href='#" + step.next + "' class='next'>Next &raquo;</a>          <a href='#' class='pull-right end'>End tour</a></p>";
        }
        $(step.element).popover({
          placement: step.placement,
          trigger: "manual",
          title: step.title,
          content: content,
          animation: step.animation
        }).popover("show");
        tip = $(step.element).data("popover").tip();
        this._reposition(tip);
        return this._scrollIntoView(tip);
      };

      Tour.prototype._reposition = function(tip) {
        var offsetBottom, offsetRight, tipOffset;
        tipOffset = tip.offset();
        offsetBottom = $(document).outerHeight() - tipOffset.top - $(tip).outerHeight();
        if (offsetBottom < 0) {
          tipOffset.top = tipOffset.top + offsetBottom;
        }
        offsetRight = $(document).outerWidth() - tipOffset.left - $(tip).outerWidth();
        if (offsetRight < 0) {
          tipOffset.left = tipOffset.left + offsetRight;
        }
        if (tipOffset.top < 0) {
          tipOffset.top = 0;
        }
        if (tipOffset.left < 0) {
          tipOffset.left = 0;
        }
        return tip.offset(tipOffset);
      };

      Tour.prototype._scrollIntoView = function(tip) {
        var tipRect;
        tipRect = tip.get(0).getBoundingClientRect();
        if (!(tipRect.top > 0 && tipRect.bottom < $(window).height() && tipRect.left > 0 && tipRect.right < $(window).width())) {
          return tip.get(0).scrollIntoView(true);
        }
      };

      return Tour;

    })();
    return window.Tour = Tour;
  })(jQuery, window);

}).call(this);

/*!
 * jQuery Cookie Plugin
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function($) {
    $.cookie = function(key, value, options) {

        // key and at least value given, set cookie...
        if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
            options = $.extend({}, options);

            if (value === null || value === undefined) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path    ? '; path=' + options.path : '',
                options.domain  ? '; domain=' + options.domain : '',
                options.secure  ? '; secure' : ''
            ].join(''));
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var decode = options.raw ? function(s) { return s; } : decodeURIComponent;

        var pairs = document.cookie.split('; ');
        for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
            if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
        }
        return null;
    };
})(jQuery);

/*

 FullCalendar v1.5.3
 http://arshaw.com/fullcalendar/

 Use fullcalendar.css for basic styling.
 For event drag & drop, requires jQuery UI draggable.
 For event resizing, requires jQuery UI resizable.

 Copyright (c) 2011 Adam Shaw
 Dual licensed under the MIT and GPL licenses, located in
 MIT-LICENSE.txt and GPL-LICENSE.txt respectively.

 Date: Mon Feb 6 22:40:40 2012 -0800

*/
(function(m,ma){function wb(a){m.extend(true,Ya,a)}function Yb(a,b,e){function d(k){if(E){u();q();na();S(k)}else f()}function f(){B=b.theme?"ui":"fc";a.addClass("fc");b.isRTL&&a.addClass("fc-rtl");b.theme&&a.addClass("ui-widget");E=m("<div class='fc-content' style='position:relative'/>").prependTo(a);C=new Zb(X,b);(P=C.render())&&a.prepend(P);y(b.defaultView);m(window).resize(oa);t()||g()}function g(){setTimeout(function(){!n.start&&t()&&S()},0)}function l(){m(window).unbind("resize",oa);C.destroy();
E.remove();a.removeClass("fc fc-rtl ui-widget")}function j(){return i.offsetWidth!==0}function t(){return m("body")[0].offsetWidth!==0}function y(k){if(!n||k!=n.name){F++;pa();var D=n,Z;if(D){(D.beforeHide||xb)();Za(E,E.height());D.element.hide()}else Za(E,1);E.css("overflow","hidden");if(n=Y[k])n.element.show();else n=Y[k]=new Ja[k](Z=s=m("<div class='fc-view fc-view-"+k+"' style='position:absolute'/>").appendTo(E),X);D&&C.deactivateButton(D.name);C.activateButton(k);S();E.css("overflow","");D&&
Za(E,1);Z||(n.afterShow||xb)();F--}}function S(k){if(j()){F++;pa();o===ma&&u();var D=false;if(!n.start||k||r<n.start||r>=n.end){n.render(r,k||0);fa(true);D=true}else if(n.sizeDirty){n.clearEvents();fa();D=true}else if(n.eventsDirty){n.clearEvents();D=true}n.sizeDirty=false;n.eventsDirty=false;ga(D);W=a.outerWidth();C.updateTitle(n.title);k=new Date;k>=n.start&&k<n.end?C.disableButton("today"):C.enableButton("today");F--;n.trigger("viewDisplay",i)}}function Q(){q();if(j()){u();fa();pa();n.clearEvents();
n.renderEvents(J);n.sizeDirty=false}}function q(){m.each(Y,function(k,D){D.sizeDirty=true})}function u(){o=b.contentHeight?b.contentHeight:b.height?b.height-(P?P.height():0)-Sa(E):Math.round(E.width()/Math.max(b.aspectRatio,0.5))}function fa(k){F++;n.setHeight(o,k);if(s){s.css("position","relative");s=null}n.setWidth(E.width(),k);F--}function oa(){if(!F)if(n.start){var k=++v;setTimeout(function(){if(k==v&&!F&&j())if(W!=(W=a.outerWidth())){F++;Q();n.trigger("windowResize",i);F--}},200)}else g()}function ga(k){if(!b.lazyFetching||
ya(n.visStart,n.visEnd))ra();else k&&da()}function ra(){K(n.visStart,n.visEnd)}function sa(k){J=k;da()}function ha(k){da(k)}function da(k){na();if(j()){n.clearEvents();n.renderEvents(J,k);n.eventsDirty=false}}function na(){m.each(Y,function(k,D){D.eventsDirty=true})}function ua(k,D,Z){n.select(k,D,Z===ma?true:Z)}function pa(){n&&n.unselect()}function U(){S(-1)}function ca(){S(1)}function ka(){gb(r,-1);S()}function qa(){gb(r,1);S()}function G(){r=new Date;S()}function p(k,D,Z){if(k instanceof Date)r=
N(k);else yb(r,k,D,Z);S()}function L(k,D,Z){k!==ma&&gb(r,k);D!==ma&&hb(r,D);Z!==ma&&ba(r,Z);S()}function c(){return N(r)}function z(){return n}function H(k,D){if(D===ma)return b[k];if(k=="height"||k=="contentHeight"||k=="aspectRatio"){b[k]=D;Q()}}function T(k,D){if(b[k])return b[k].apply(D||i,Array.prototype.slice.call(arguments,2))}var X=this;X.options=b;X.render=d;X.destroy=l;X.refetchEvents=ra;X.reportEvents=sa;X.reportEventChange=ha;X.rerenderEvents=da;X.changeView=y;X.select=ua;X.unselect=pa;
X.prev=U;X.next=ca;X.prevYear=ka;X.nextYear=qa;X.today=G;X.gotoDate=p;X.incrementDate=L;X.formatDate=function(k,D){return Oa(k,D,b)};X.formatDates=function(k,D,Z){return ib(k,D,Z,b)};X.getDate=c;X.getView=z;X.option=H;X.trigger=T;$b.call(X,b,e);var ya=X.isFetchNeeded,K=X.fetchEvents,i=a[0],C,P,E,B,n,Y={},W,o,s,v=0,F=0,r=new Date,J=[],M;yb(r,b.year,b.month,b.date);b.droppable&&m(document).bind("dragstart",function(k,D){var Z=k.target,ja=m(Z);if(!ja.parents(".fc").length){var ia=b.dropAccept;if(m.isFunction(ia)?
ia.call(Z,ja):ja.is(ia)){M=Z;n.dragStart(M,k,D)}}}).bind("dragstop",function(k,D){if(M){n.dragStop(M,k,D);M=null}})}function Zb(a,b){function e(){q=b.theme?"ui":"fc";if(b.header)return Q=m("<table class='fc-header' style='width:100%'/>").append(m("<tr/>").append(f("left")).append(f("center")).append(f("right")))}function d(){Q.remove()}function f(u){var fa=m("<td class='fc-header-"+u+"'/>");(u=b.header[u])&&m.each(u.split(" "),function(oa){oa>0&&fa.append("<span class='fc-header-space'/>");var ga;
m.each(this.split(","),function(ra,sa){if(sa=="title"){fa.append("<span class='fc-header-title'><h2>&nbsp;</h2></span>");ga&&ga.addClass(q+"-corner-right");ga=null}else{var ha;if(a[sa])ha=a[sa];else if(Ja[sa])ha=function(){na.removeClass(q+"-state-hover");a.changeView(sa)};if(ha){ra=b.theme?jb(b.buttonIcons,sa):null;var da=jb(b.buttonText,sa),na=m("<span class='fc-button fc-button-"+sa+" "+q+"-state-default'><span class='fc-button-inner'><span class='fc-button-content'>"+(ra?"<span class='fc-icon-wrap'><span class='ui-icon ui-icon-"+
ra+"'/></span>":da)+"</span><span class='fc-button-effect'><span></span></span></span></span>");if(na){na.click(function(){na.hasClass(q+"-state-disabled")||ha()}).mousedown(function(){na.not("."+q+"-state-active").not("."+q+"-state-disabled").addClass(q+"-state-down")}).mouseup(function(){na.removeClass(q+"-state-down")}).hover(function(){na.not("."+q+"-state-active").not("."+q+"-state-disabled").addClass(q+"-state-hover")},function(){na.removeClass(q+"-state-hover").removeClass(q+"-state-down")}).appendTo(fa);
ga||na.addClass(q+"-corner-left");ga=na}}}});ga&&ga.addClass(q+"-corner-right")});return fa}function g(u){Q.find("h2").html(u)}function l(u){Q.find("span.fc-button-"+u).addClass(q+"-state-active")}function j(u){Q.find("span.fc-button-"+u).removeClass(q+"-state-active")}function t(u){Q.find("span.fc-button-"+u).addClass(q+"-state-disabled")}function y(u){Q.find("span.fc-button-"+u).removeClass(q+"-state-disabled")}var S=this;S.render=e;S.destroy=d;S.updateTitle=g;S.activateButton=l;S.deactivateButton=
j;S.disableButton=t;S.enableButton=y;var Q=m([]),q}function $b(a,b){function e(c,z){return!ca||c<ca||z>ka}function d(c,z){ca=c;ka=z;L=[];c=++qa;G=z=U.length;for(var H=0;H<z;H++)f(U[H],c)}function f(c,z){g(c,function(H){if(z==qa){if(H){for(var T=0;T<H.length;T++){H[T].source=c;oa(H[T])}L=L.concat(H)}G--;G||ua(L)}})}function g(c,z){var H,T=Aa.sourceFetchers,X;for(H=0;H<T.length;H++){X=T[H](c,ca,ka,z);if(X===true)return;else if(typeof X=="object"){g(X,z);return}}if(H=c.events)if(m.isFunction(H)){u();
H(N(ca),N(ka),function(C){z(C);fa()})}else m.isArray(H)?z(H):z();else if(c.url){var ya=c.success,K=c.error,i=c.complete;H=m.extend({},c.data||{});T=Ta(c.startParam,a.startParam);X=Ta(c.endParam,a.endParam);if(T)H[T]=Math.round(+ca/1E3);if(X)H[X]=Math.round(+ka/1E3);u();m.ajax(m.extend({},ac,c,{data:H,success:function(C){C=C||[];var P=$a(ya,this,arguments);if(m.isArray(P))C=P;z(C)},error:function(){$a(K,this,arguments);z()},complete:function(){$a(i,this,arguments);fa()}}))}else z()}function l(c){if(c=
j(c)){G++;f(c,qa)}}function j(c){if(m.isFunction(c)||m.isArray(c))c={events:c};else if(typeof c=="string")c={url:c};if(typeof c=="object"){ga(c);U.push(c);return c}}function t(c){U=m.grep(U,function(z){return!ra(z,c)});L=m.grep(L,function(z){return!ra(z.source,c)});ua(L)}function y(c){var z,H=L.length,T,X=na().defaultEventEnd,ya=c.start-c._start,K=c.end?c.end-(c._end||X(c)):0;for(z=0;z<H;z++){T=L[z];if(T._id==c._id&&T!=c){T.start=new Date(+T.start+ya);T.end=c.end?T.end?new Date(+T.end+K):new Date(+X(T)+
K):null;T.title=c.title;T.url=c.url;T.allDay=c.allDay;T.className=c.className;T.editable=c.editable;T.color=c.color;T.backgroudColor=c.backgroudColor;T.borderColor=c.borderColor;T.textColor=c.textColor;oa(T)}}oa(c);ua(L)}function S(c,z){oa(c);if(!c.source){if(z){pa.events.push(c);c.source=pa}L.push(c)}ua(L)}function Q(c){if(c){if(!m.isFunction(c)){var z=c+"";c=function(T){return T._id==z}}L=m.grep(L,c,true);for(H=0;H<U.length;H++)if(m.isArray(U[H].events))U[H].events=m.grep(U[H].events,c,true)}else{L=
[];for(var H=0;H<U.length;H++)if(m.isArray(U[H].events))U[H].events=[]}ua(L)}function q(c){if(m.isFunction(c))return m.grep(L,c);else if(c){c+="";return m.grep(L,function(z){return z._id==c})}return L}function u(){p++||da("loading",null,true)}function fa(){--p||da("loading",null,false)}function oa(c){var z=c.source||{},H=Ta(z.ignoreTimezone,a.ignoreTimezone);c._id=c._id||(c.id===ma?"_fc"+bc++:c.id+"");if(c.date){if(!c.start)c.start=c.date;delete c.date}c._start=N(c.start=kb(c.start,H));c.end=kb(c.end,
H);if(c.end&&c.end<=c.start)c.end=null;c._end=c.end?N(c.end):null;if(c.allDay===ma)c.allDay=Ta(z.allDayDefault,a.allDayDefault);if(c.className){if(typeof c.className=="string")c.className=c.className.split(/\s+/)}else c.className=[]}function ga(c){if(c.className){if(typeof c.className=="string")c.className=c.className.split(/\s+/)}else c.className=[];for(var z=Aa.sourceNormalizers,H=0;H<z.length;H++)z[H](c)}function ra(c,z){return c&&z&&sa(c)==sa(z)}function sa(c){return(typeof c=="object"?c.events||
c.url:"")||c}var ha=this;ha.isFetchNeeded=e;ha.fetchEvents=d;ha.addEventSource=l;ha.removeEventSource=t;ha.updateEvent=y;ha.renderEvent=S;ha.removeEvents=Q;ha.clientEvents=q;ha.normalizeEvent=oa;var da=ha.trigger,na=ha.getView,ua=ha.reportEvents,pa={events:[]},U=[pa],ca,ka,qa=0,G=0,p=0,L=[];for(ha=0;ha<b.length;ha++)j(b[ha])}function gb(a,b,e){a.setFullYear(a.getFullYear()+b);e||Ka(a);return a}function hb(a,b,e){if(+a){b=a.getMonth()+b;var d=N(a);d.setDate(1);d.setMonth(b);a.setMonth(b);for(e||Ka(a);a.getMonth()!=
d.getMonth();)a.setDate(a.getDate()+(a<d?1:-1))}return a}function ba(a,b,e){if(+a){b=a.getDate()+b;var d=N(a);d.setHours(9);d.setDate(b);a.setDate(b);e||Ka(a);lb(a,d)}return a}function lb(a,b){if(+a)for(;a.getDate()!=b.getDate();)a.setTime(+a+(a<b?1:-1)*cc)}function xa(a,b){a.setMinutes(a.getMinutes()+b);return a}function Ka(a){a.setHours(0);a.setMinutes(0);a.setSeconds(0);a.setMilliseconds(0);return a}function N(a,b){if(b)return Ka(new Date(+a));return new Date(+a)}function zb(){var a=0,b;do b=new Date(1970,
a++,1);while(b.getHours());return b}function Fa(a,b,e){for(b=b||1;!a.getDay()||e&&a.getDay()==1||!e&&a.getDay()==6;)ba(a,b);return a}function Ca(a,b){return Math.round((N(a,true)-N(b,true))/Ab)}function yb(a,b,e,d){if(b!==ma&&b!=a.getFullYear()){a.setDate(1);a.setMonth(0);a.setFullYear(b)}if(e!==ma&&e!=a.getMonth()){a.setDate(1);a.setMonth(e)}d!==ma&&a.setDate(d)}function kb(a,b){if(typeof a=="object")return a;if(typeof a=="number")return new Date(a*1E3);if(typeof a=="string"){if(a.match(/^\d+(\.\d+)?$/))return new Date(parseFloat(a)*
1E3);if(b===ma)b=true;return Bb(a,b)||(a?new Date(a):null)}return null}function Bb(a,b){a=a.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);if(!a)return null;var e=new Date(a[1],0,1);if(b||!a[13]){b=new Date(a[1],0,1,9,0);if(a[3]){e.setMonth(a[3]-1);b.setMonth(a[3]-1)}if(a[5]){e.setDate(a[5]);b.setDate(a[5])}lb(e,b);a[7]&&e.setHours(a[7]);a[8]&&e.setMinutes(a[8]);a[10]&&e.setSeconds(a[10]);a[12]&&e.setMilliseconds(Number("0."+
a[12])*1E3);lb(e,b)}else{e.setUTCFullYear(a[1],a[3]?a[3]-1:0,a[5]||1);e.setUTCHours(a[7]||0,a[8]||0,a[10]||0,a[12]?Number("0."+a[12])*1E3:0);if(a[14]){b=Number(a[16])*60+(a[18]?Number(a[18]):0);b*=a[15]=="-"?1:-1;e=new Date(+e+b*60*1E3)}}return e}function mb(a){if(typeof a=="number")return a*60;if(typeof a=="object")return a.getHours()*60+a.getMinutes();if(a=a.match(/(\d+)(?::(\d+))?\s*(\w+)?/)){var b=parseInt(a[1],10);if(a[3]){b%=12;if(a[3].toLowerCase().charAt(0)=="p")b+=12}return b*60+(a[2]?parseInt(a[2],
10):0)}}function Oa(a,b,e){return ib(a,null,b,e)}function ib(a,b,e,d){d=d||Ya;var f=a,g=b,l,j=e.length,t,y,S,Q="";for(l=0;l<j;l++){t=e.charAt(l);if(t=="'")for(y=l+1;y<j;y++){if(e.charAt(y)=="'"){if(f){Q+=y==l+1?"'":e.substring(l+1,y);l=y}break}}else if(t=="(")for(y=l+1;y<j;y++){if(e.charAt(y)==")"){l=Oa(f,e.substring(l+1,y),d);if(parseInt(l.replace(/\D/,""),10))Q+=l;l=y;break}}else if(t=="[")for(y=l+1;y<j;y++){if(e.charAt(y)=="]"){t=e.substring(l+1,y);l=Oa(f,t,d);if(l!=Oa(g,t,d))Q+=l;l=y;break}}else if(t==
"{"){f=b;g=a}else if(t=="}"){f=a;g=b}else{for(y=j;y>l;y--)if(S=dc[e.substring(l,y)]){if(f)Q+=S(f,d);l=y-1;break}if(y==l)if(f)Q+=t}}return Q}function Ua(a){return a.end?ec(a.end,a.allDay):ba(N(a.start),1)}function ec(a,b){a=N(a);return b||a.getHours()||a.getMinutes()?ba(a,1):Ka(a)}function fc(a,b){return(b.msLength-a.msLength)*100+(a.event.start-b.event.start)}function Cb(a,b){return a.end>b.start&&a.start<b.end}function nb(a,b,e,d){var f=[],g,l=a.length,j,t,y,S,Q;for(g=0;g<l;g++){j=a[g];t=j.start;
y=b[g];if(y>e&&t<d){if(t<e){t=N(e);S=false}else{t=t;S=true}if(y>d){y=N(d);Q=false}else{y=y;Q=true}f.push({event:j,start:t,end:y,isStart:S,isEnd:Q,msLength:y-t})}}return f.sort(fc)}function ob(a){var b=[],e,d=a.length,f,g,l,j;for(e=0;e<d;e++){f=a[e];for(g=0;;){l=false;if(b[g])for(j=0;j<b[g].length;j++)if(Cb(b[g][j],f)){l=true;break}if(l)g++;else break}if(b[g])b[g].push(f);else b[g]=[f]}return b}function Db(a,b,e){a.unbind("mouseover").mouseover(function(d){for(var f=d.target,g;f!=this;){g=f;f=f.parentNode}if((f=
g._fci)!==ma){g._fci=ma;g=b[f];e(g.event,g.element,g);m(d.target).trigger(d)}d.stopPropagation()})}function Va(a,b,e){for(var d=0,f;d<a.length;d++){f=m(a[d]);f.width(Math.max(0,b-pb(f,e)))}}function Eb(a,b,e){for(var d=0,f;d<a.length;d++){f=m(a[d]);f.height(Math.max(0,b-Sa(f,e)))}}function pb(a,b){return gc(a)+hc(a)+(b?ic(a):0)}function gc(a){return(parseFloat(m.curCSS(a[0],"paddingLeft",true))||0)+(parseFloat(m.curCSS(a[0],"paddingRight",true))||0)}function ic(a){return(parseFloat(m.curCSS(a[0],
"marginLeft",true))||0)+(parseFloat(m.curCSS(a[0],"marginRight",true))||0)}function hc(a){return(parseFloat(m.curCSS(a[0],"borderLeftWidth",true))||0)+(parseFloat(m.curCSS(a[0],"borderRightWidth",true))||0)}function Sa(a,b){return jc(a)+kc(a)+(b?Fb(a):0)}function jc(a){return(parseFloat(m.curCSS(a[0],"paddingTop",true))||0)+(parseFloat(m.curCSS(a[0],"paddingBottom",true))||0)}function Fb(a){return(parseFloat(m.curCSS(a[0],"marginTop",true))||0)+(parseFloat(m.curCSS(a[0],"marginBottom",true))||0)}
function kc(a){return(parseFloat(m.curCSS(a[0],"borderTopWidth",true))||0)+(parseFloat(m.curCSS(a[0],"borderBottomWidth",true))||0)}function Za(a,b){b=typeof b=="number"?b+"px":b;a.each(function(e,d){d.style.cssText+=";min-height:"+b+";_height:"+b})}function xb(){}function Gb(a,b){return a-b}function Hb(a){return Math.max.apply(Math,a)}function Pa(a){return(a<10?"0":"")+a}function jb(a,b){if(a[b]!==ma)return a[b];b=b.split(/(?=[A-Z])/);for(var e=b.length-1,d;e>=0;e--){d=a[b[e].toLowerCase()];if(d!==
ma)return d}return a[""]}function Qa(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#039;").replace(/"/g,"&quot;").replace(/\n/g,"<br />")}function Ib(a){return a.id+"/"+a.className+"/"+a.style.cssText.replace(/(^|;)\s*(top|left|width|height)\s*:[^;]*/ig,"")}function qb(a){a.attr("unselectable","on").css("MozUserSelect","none").bind("selectstart.ui",function(){return false})}function ab(a){a.children().removeClass("fc-first fc-last").filter(":first-child").addClass("fc-first").end().filter(":last-child").addClass("fc-last")}
function rb(a,b){a.each(function(e,d){d.className=d.className.replace(/^fc-\w*/,"fc-"+lc[b.getDay()])})}function Jb(a,b){var e=a.source||{},d=a.color,f=e.color,g=b("eventColor"),l=a.backgroundColor||d||e.backgroundColor||f||b("eventBackgroundColor")||g;d=a.borderColor||d||e.borderColor||f||b("eventBorderColor")||g;a=a.textColor||e.textColor||b("eventTextColor");b=[];l&&b.push("background-color:"+l);d&&b.push("border-color:"+d);a&&b.push("color:"+a);return b.join(";")}function $a(a,b,e){if(m.isFunction(a))a=
[a];if(a){var d,f;for(d=0;d<a.length;d++)f=a[d].apply(b,e)||f;return f}}function Ta(){for(var a=0;a<arguments.length;a++)if(arguments[a]!==ma)return arguments[a]}function mc(a,b){function e(j,t){if(t){hb(j,t);j.setDate(1)}j=N(j,true);j.setDate(1);t=hb(N(j),1);var y=N(j),S=N(t),Q=f("firstDay"),q=f("weekends")?0:1;if(q){Fa(y);Fa(S,-1,true)}ba(y,-((y.getDay()-Math.max(Q,q)+7)%7));ba(S,(7-S.getDay()+Math.max(Q,q))%7);Q=Math.round((S-y)/(Ab*7));if(f("weekMode")=="fixed"){ba(S,(6-Q)*7);Q=6}d.title=l(j,
f("titleFormat"));d.start=j;d.end=t;d.visStart=y;d.visEnd=S;g(6,Q,q?5:7,true)}var d=this;d.render=e;sb.call(d,a,b,"month");var f=d.opt,g=d.renderBasic,l=b.formatDate}function nc(a,b){function e(j,t){t&&ba(j,t*7);j=ba(N(j),-((j.getDay()-f("firstDay")+7)%7));t=ba(N(j),7);var y=N(j),S=N(t),Q=f("weekends");if(!Q){Fa(y);Fa(S,-1,true)}d.title=l(y,ba(N(S),-1),f("titleFormat"));d.start=j;d.end=t;d.visStart=y;d.visEnd=S;g(1,1,Q?7:5,false)}var d=this;d.render=e;sb.call(d,a,b,"basicWeek");var f=d.opt,g=d.renderBasic,
l=b.formatDates}function oc(a,b){function e(j,t){if(t){ba(j,t);f("weekends")||Fa(j,t<0?-1:1)}d.title=l(j,f("titleFormat"));d.start=d.visStart=N(j,true);d.end=d.visEnd=ba(N(d.start),1);g(1,1,1,false)}var d=this;d.render=e;sb.call(d,a,b,"basicDay");var f=d.opt,g=d.renderBasic,l=b.formatDate}function sb(a,b,e){function d(w,I,R,V){v=I;F=R;f();(I=!C)?g(w,V):z();l(I)}function f(){if(k=L("isRTL")){D=-1;Z=F-1}else{D=1;Z=0}ja=L("firstDay");ia=L("weekends")?0:1;la=L("theme")?"ui":"fc";$=L("columnFormat")}function g(w,
I){var R,V=la+"-widget-header",ea=la+"-widget-content",aa;R="<table class='fc-border-separate' style='width:100%' cellspacing='0'><thead><tr>";for(aa=0;aa<F;aa++)R+="<th class='fc- "+V+"'/>";R+="</tr></thead><tbody>";for(aa=0;aa<w;aa++){R+="<tr class='fc-week"+aa+"'>";for(V=0;V<F;V++)R+="<td class='fc- "+ea+" fc-day"+(aa*F+V)+"'><div>"+(I?"<div class='fc-day-number'/>":"")+"<div class='fc-day-content'><div style='position:relative'>&nbsp;</div></div></div></td>";R+="</tr>"}R+="</tbody></table>";w=
m(R).appendTo(a);K=w.find("thead");i=K.find("th");C=w.find("tbody");P=C.find("tr");E=C.find("td");B=E.filter(":first-child");n=P.eq(0).find("div.fc-day-content div");ab(K.add(K.find("tr")));ab(P);P.eq(0).addClass("fc-first");y(E);Y=m("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(a)}function l(w){var I=w||v==1,R=p.start.getMonth(),V=Ka(new Date),ea,aa,va;I&&i.each(function(wa,Ga){ea=m(Ga);aa=ca(wa);ea.html(ya(aa,$));rb(ea,aa)});E.each(function(wa,Ga){ea=m(Ga);aa=ca(wa);aa.getMonth()==
R?ea.removeClass("fc-other-month"):ea.addClass("fc-other-month");+aa==+V?ea.addClass(la+"-state-highlight fc-today"):ea.removeClass(la+"-state-highlight fc-today");ea.find("div.fc-day-number").text(aa.getDate());I&&rb(ea,aa)});P.each(function(wa,Ga){va=m(Ga);if(wa<v){va.show();wa==v-1?va.addClass("fc-last"):va.removeClass("fc-last")}else va.hide()})}function j(w){o=w;w=o-K.height();var I,R,V;if(L("weekMode")=="variable")I=R=Math.floor(w/(v==1?2:6));else{I=Math.floor(w/v);R=w-I*(v-1)}B.each(function(ea,
aa){if(ea<v){V=m(aa);Za(V.find("> div"),(ea==v-1?R:I)-Sa(V))}})}function t(w){W=w;M.clear();s=Math.floor(W/F);Va(i.slice(0,-1),s)}function y(w){w.click(S).mousedown(X)}function S(w){if(!L("selectable")){var I=parseInt(this.className.match(/fc\-day(\d+)/)[1]);I=ca(I);c("dayClick",this,I,true,w)}}function Q(w,I,R){R&&r.build();R=N(p.visStart);for(var V=ba(N(R),F),ea=0;ea<v;ea++){var aa=new Date(Math.max(R,w)),va=new Date(Math.min(V,I));if(aa<va){var wa;if(k){wa=Ca(va,R)*D+Z+1;aa=Ca(aa,R)*D+Z+1}else{wa=
Ca(aa,R);aa=Ca(va,R)}y(q(ea,wa,ea,aa-1))}ba(R,7);ba(V,7)}}function q(w,I,R,V){w=r.rect(w,I,R,V,a);return H(w,a)}function u(w){return N(w)}function fa(w,I){Q(w,ba(N(I),1),true)}function oa(){T()}function ga(w,I,R){var V=ua(w);c("dayClick",E[V.row*F+V.col],w,I,R)}function ra(w,I){J.start(function(R){T();R&&q(R.row,R.col,R.row,R.col)},I)}function sa(w,I,R){var V=J.stop();T();if(V){V=pa(V);c("drop",w,V,true,I,R)}}function ha(w){return N(w.start)}function da(w){return M.left(w)}function na(w){return M.right(w)}
function ua(w){return{row:Math.floor(Ca(w,p.visStart)/7),col:ka(w.getDay())}}function pa(w){return U(w.row,w.col)}function U(w,I){return ba(N(p.visStart),w*7+I*D+Z)}function ca(w){return U(Math.floor(w/F),w%F)}function ka(w){return(w-Math.max(ja,ia)+F)%F*D+Z}function qa(w){return P.eq(w)}function G(){return{left:0,right:W}}var p=this;p.renderBasic=d;p.setHeight=j;p.setWidth=t;p.renderDayOverlay=Q;p.defaultSelectionEnd=u;p.renderSelection=fa;p.clearSelection=oa;p.reportDayClick=ga;p.dragStart=ra;p.dragStop=
sa;p.defaultEventEnd=ha;p.getHoverListener=function(){return J};p.colContentLeft=da;p.colContentRight=na;p.dayOfWeekCol=ka;p.dateCell=ua;p.cellDate=pa;p.cellIsAllDay=function(){return true};p.allDayRow=qa;p.allDayBounds=G;p.getRowCnt=function(){return v};p.getColCnt=function(){return F};p.getColWidth=function(){return s};p.getDaySegmentContainer=function(){return Y};Kb.call(p,a,b,e);Lb.call(p);Mb.call(p);pc.call(p);var L=p.opt,c=p.trigger,z=p.clearEvents,H=p.renderOverlay,T=p.clearOverlays,X=p.daySelectionMousedown,
ya=b.formatDate,K,i,C,P,E,B,n,Y,W,o,s,v,F,r,J,M,k,D,Z,ja,ia,la,$;qb(a.addClass("fc-grid"));r=new Nb(function(w,I){var R,V,ea;i.each(function(aa,va){R=m(va);V=R.offset().left;if(aa)ea[1]=V;ea=[V];I[aa]=ea});ea[1]=V+R.outerWidth();P.each(function(aa,va){if(aa<v){R=m(va);V=R.offset().top;if(aa)ea[1]=V;ea=[V];w[aa]=ea}});ea[1]=V+R.outerHeight()});J=new Ob(r);M=new Pb(function(w){return n.eq(w)})}function pc(){function a(U,ca){S(U);ua(e(U),ca)}function b(){Q();ga().empty()}function e(U){var ca=da(),ka=
na(),qa=N(g.visStart);ka=ba(N(qa),ka);var G=m.map(U,Ua),p,L,c,z,H,T,X=[];for(p=0;p<ca;p++){L=ob(nb(U,G,qa,ka));for(c=0;c<L.length;c++){z=L[c];for(H=0;H<z.length;H++){T=z[H];T.row=p;T.level=c;X.push(T)}}ba(qa,7);ba(ka,7)}return X}function d(U,ca,ka){t(U)&&f(U,ca);ka.isEnd&&y(U)&&pa(U,ca,ka);q(U,ca)}function f(U,ca){var ka=ra(),qa;ca.draggable({zIndex:9,delay:50,opacity:l("dragOpacity"),revertDuration:l("dragRevertDuration"),start:function(G,p){j("eventDragStart",ca,U,G,p);fa(U,ca);ka.start(function(L,
c,z,H){ca.draggable("option","revert",!L||!z&&!H);ha();if(L){qa=z*7+H*(l("isRTL")?-1:1);sa(ba(N(U.start),qa),ba(Ua(U),qa))}else qa=0},G,"drag")},stop:function(G,p){ka.stop();ha();j("eventDragStop",ca,U,G,p);if(qa)oa(this,U,qa,0,U.allDay,G,p);else{ca.css("filter","");u(U,ca)}}})}var g=this;g.renderEvents=a;g.compileDaySegs=e;g.clearEvents=b;g.bindDaySeg=d;Qb.call(g);var l=g.opt,j=g.trigger,t=g.isEventDraggable,y=g.isEventResizable,S=g.reportEvents,Q=g.reportEventClear,q=g.eventElementHandlers,u=g.showEvents,
fa=g.hideEvents,oa=g.eventDrop,ga=g.getDaySegmentContainer,ra=g.getHoverListener,sa=g.renderDayOverlay,ha=g.clearOverlays,da=g.getRowCnt,na=g.getColCnt,ua=g.renderDaySegs,pa=g.resizableDayEvent}function qc(a,b){function e(j,t){t&&ba(j,t*7);j=ba(N(j),-((j.getDay()-f("firstDay")+7)%7));t=ba(N(j),7);var y=N(j),S=N(t),Q=f("weekends");if(!Q){Fa(y);Fa(S,-1,true)}d.title=l(y,ba(N(S),-1),f("titleFormat"));d.start=j;d.end=t;d.visStart=y;d.visEnd=S;g(Q?7:5)}var d=this;d.render=e;Rb.call(d,a,b,"agendaWeek");
var f=d.opt,g=d.renderAgenda,l=b.formatDates}function rc(a,b){function e(j,t){if(t){ba(j,t);f("weekends")||Fa(j,t<0?-1:1)}t=N(j,true);var y=ba(N(t),1);d.title=l(j,f("titleFormat"));d.start=d.visStart=t;d.end=d.visEnd=y;g(1)}var d=this;d.render=e;Rb.call(d,a,b,"agendaDay");var f=d.opt,g=d.renderAgenda,l=b.formatDate}function Rb(a,b,e){function d(h){Ba=h;f();v?P():g();l()}function f(){Wa=i("theme")?"ui":"fc";Sb=i("weekends")?0:1;Tb=i("firstDay");if(Ub=i("isRTL")){Ha=-1;Ia=Ba-1}else{Ha=1;Ia=0}La=mb(i("minTime"));
bb=mb(i("maxTime"));Vb=i("columnFormat")}function g(){var h=Wa+"-widget-header",O=Wa+"-widget-content",x,A,ta,za,Da,Ea=i("slotMinutes")%15==0;x="<table style='width:100%' class='fc-agenda-days fc-border-separate' cellspacing='0'><thead><tr><th class='fc-agenda-axis "+h+"'>&nbsp;</th>";for(A=0;A<Ba;A++)x+="<th class='fc- fc-col"+A+" "+h+"'/>";x+="<th class='fc-agenda-gutter "+h+"'>&nbsp;</th></tr></thead><tbody><tr><th class='fc-agenda-axis "+h+"'>&nbsp;</th>";for(A=0;A<Ba;A++)x+="<td class='fc- fc-col"+
A+" "+O+"'><div><div class='fc-day-content'><div style='position:relative'>&nbsp;</div></div></div></td>";x+="<td class='fc-agenda-gutter "+O+"'>&nbsp;</td></tr></tbody></table>";v=m(x).appendTo(a);F=v.find("thead");r=F.find("th").slice(1,-1);J=v.find("tbody");M=J.find("td").slice(0,-1);k=M.find("div.fc-day-content div");D=M.eq(0);Z=D.find("> div");ab(F.add(F.find("tr")));ab(J.add(J.find("tr")));aa=F.find("th:first");va=v.find(".fc-agenda-gutter");ja=m("<div style='position:absolute;z-index:2;left:0;width:100%'/>").appendTo(a);
if(i("allDaySlot")){ia=m("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(ja);x="<table style='width:100%' class='fc-agenda-allday' cellspacing='0'><tr><th class='"+h+" fc-agenda-axis'>"+i("allDayText")+"</th><td><div class='fc-day-content'><div style='position:relative'/></div></td><th class='"+h+" fc-agenda-gutter'>&nbsp;</th></tr></table>";la=m(x).appendTo(ja);$=la.find("tr");q($.find("td"));aa=aa.add(la.find("th:first"));va=va.add(la.find("th.fc-agenda-gutter"));ja.append("<div class='fc-agenda-divider "+
h+"'><div class='fc-agenda-divider-inner'/></div>")}else ia=m([]);w=m("<div style='position:absolute;width:100%;overflow-x:hidden;overflow-y:auto'/>").appendTo(ja);I=m("<div style='position:relative;width:100%;overflow:hidden'/>").appendTo(w);R=m("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(I);x="<table class='fc-agenda-slots' style='width:100%' cellspacing='0'><tbody>";ta=zb();za=xa(N(ta),bb);xa(ta,La);for(A=tb=0;ta<za;A++){Da=ta.getMinutes();x+="<tr class='fc-slot"+A+" "+
(!Da?"":"fc-minor")+"'><th class='fc-agenda-axis "+h+"'>"+(!Ea||!Da?s(ta,i("axisFormat")):"&nbsp;")+"</th><td class='"+O+"'><div style='position:relative'>&nbsp;</div></td></tr>";xa(ta,i("slotMinutes"));tb++}x+="</tbody></table>";V=m(x).appendTo(I);ea=V.find("div:first");u(V.find("td"));aa=aa.add(V.find("th:first"))}function l(){var h,O,x,A,ta=Ka(new Date);for(h=0;h<Ba;h++){A=ua(h);O=r.eq(h);O.html(s(A,Vb));x=M.eq(h);+A==+ta?x.addClass(Wa+"-state-highlight fc-today"):x.removeClass(Wa+"-state-highlight fc-today");
rb(O.add(x),A)}}function j(h,O){if(h===ma)h=Wb;Wb=h;ub={};var x=J.position().top,A=w.position().top;h=Math.min(h-x,V.height()+A+1);Z.height(h-Sa(D));ja.css("top",x);w.height(h-A-1);Xa=ea.height()+1;O&&y()}function t(h){Ga=h;cb.clear();Ma=0;Va(aa.width("").each(function(O,x){Ma=Math.max(Ma,m(x).outerWidth())}),Ma);h=w[0].clientWidth;if(vb=w.width()-h){Va(va,vb);va.show().prev().removeClass("fc-last")}else va.hide().prev().addClass("fc-last");db=Math.floor((h-Ma)/Ba);Va(r.slice(0,-1),db)}function y(){function h(){w.scrollTop(A)}
var O=zb(),x=N(O);x.setHours(i("firstHour"));var A=ca(O,x)+1;h();setTimeout(h,0)}function S(){Xb=w.scrollTop()}function Q(){w.scrollTop(Xb)}function q(h){h.click(fa).mousedown(W)}function u(h){h.click(fa).mousedown(H)}function fa(h){if(!i("selectable")){var O=Math.min(Ba-1,Math.floor((h.pageX-v.offset().left-Ma)/db)),x=ua(O),A=this.parentNode.className.match(/fc-slot(\d+)/);if(A){A=parseInt(A[1])*i("slotMinutes");var ta=Math.floor(A/60);x.setHours(ta);x.setMinutes(A%60+La);C("dayClick",M[O],x,false,
h)}else C("dayClick",M[O],x,true,h)}}function oa(h,O,x){x&&Na.build();var A=N(K.visStart);if(Ub){x=Ca(O,A)*Ha+Ia+1;h=Ca(h,A)*Ha+Ia+1}else{x=Ca(h,A);h=Ca(O,A)}x=Math.max(0,x);h=Math.min(Ba,h);x<h&&q(ga(0,x,0,h-1))}function ga(h,O,x,A){h=Na.rect(h,O,x,A,ja);return E(h,ja)}function ra(h,O){for(var x=N(K.visStart),A=ba(N(x),1),ta=0;ta<Ba;ta++){var za=new Date(Math.max(x,h)),Da=new Date(Math.min(A,O));if(za<Da){var Ea=ta*Ha+Ia;Ea=Na.rect(0,Ea,0,Ea,I);za=ca(x,za);Da=ca(x,Da);Ea.top=za;Ea.height=Da-za;u(E(Ea,
I))}ba(x,1);ba(A,1)}}function sa(h){return cb.left(h)}function ha(h){return cb.right(h)}function da(h){return{row:Math.floor(Ca(h,K.visStart)/7),col:U(h.getDay())}}function na(h){var O=ua(h.col);h=h.row;i("allDaySlot")&&h--;h>=0&&xa(O,La+h*i("slotMinutes"));return O}function ua(h){return ba(N(K.visStart),h*Ha+Ia)}function pa(h){return i("allDaySlot")&&!h.row}function U(h){return(h-Math.max(Tb,Sb)+Ba)%Ba*Ha+Ia}function ca(h,O){h=N(h,true);if(O<xa(N(h),La))return 0;if(O>=xa(N(h),bb))return V.height();
h=i("slotMinutes");O=O.getHours()*60+O.getMinutes()-La;var x=Math.floor(O/h),A=ub[x];if(A===ma)A=ub[x]=V.find("tr:eq("+x+") td div")[0].offsetTop;return Math.max(0,Math.round(A-1+Xa*(O%h/h)))}function ka(){return{left:Ma,right:Ga-vb}}function qa(){return $}function G(h){var O=N(h.start);if(h.allDay)return O;return xa(O,i("defaultEventMinutes"))}function p(h,O){if(O)return N(h);return xa(N(h),i("slotMinutes"))}function L(h,O,x){if(x)i("allDaySlot")&&oa(h,ba(N(O),1),true);else c(h,O)}function c(h,O){var x=
i("selectHelper");Na.build();if(x){var A=Ca(h,K.visStart)*Ha+Ia;if(A>=0&&A<Ba){A=Na.rect(0,A,0,A,I);var ta=ca(h,h),za=ca(h,O);if(za>ta){A.top=ta;A.height=za-ta;A.left+=2;A.width-=5;if(m.isFunction(x)){if(h=x(h,O)){A.position="absolute";A.zIndex=8;wa=m(h).css(A).appendTo(I)}}else{A.isStart=true;A.isEnd=true;wa=m(o({title:"",start:h,end:O,className:["fc-select-helper"],editable:false},A));wa.css("opacity",i("dragOpacity"))}if(wa){u(wa);I.append(wa);Va(wa,A.width,true);Eb(wa,A.height,true)}}}}else ra(h,
O)}function z(){B();if(wa){wa.remove();wa=null}}function H(h){if(h.which==1&&i("selectable")){Y(h);var O;Ra.start(function(x,A){z();if(x&&x.col==A.col&&!pa(x)){A=na(A);x=na(x);O=[A,xa(N(A),i("slotMinutes")),x,xa(N(x),i("slotMinutes"))].sort(Gb);c(O[0],O[3])}else O=null},h);m(document).one("mouseup",function(x){Ra.stop();if(O){+O[0]==+O[1]&&T(O[0],false,x);n(O[0],O[3],false,x)}})}}function T(h,O,x){C("dayClick",M[U(h.getDay())],h,O,x)}function X(h,O){Ra.start(function(x){B();if(x)if(pa(x))ga(x.row,
x.col,x.row,x.col);else{x=na(x);var A=xa(N(x),i("defaultEventMinutes"));ra(x,A)}},O)}function ya(h,O,x){var A=Ra.stop();B();A&&C("drop",h,na(A),pa(A),O,x)}var K=this;K.renderAgenda=d;K.setWidth=t;K.setHeight=j;K.beforeHide=S;K.afterShow=Q;K.defaultEventEnd=G;K.timePosition=ca;K.dayOfWeekCol=U;K.dateCell=da;K.cellDate=na;K.cellIsAllDay=pa;K.allDayRow=qa;K.allDayBounds=ka;K.getHoverListener=function(){return Ra};K.colContentLeft=sa;K.colContentRight=ha;K.getDaySegmentContainer=function(){return ia};
K.getSlotSegmentContainer=function(){return R};K.getMinMinute=function(){return La};K.getMaxMinute=function(){return bb};K.getBodyContent=function(){return I};K.getRowCnt=function(){return 1};K.getColCnt=function(){return Ba};K.getColWidth=function(){return db};K.getSlotHeight=function(){return Xa};K.defaultSelectionEnd=p;K.renderDayOverlay=oa;K.renderSelection=L;K.clearSelection=z;K.reportDayClick=T;K.dragStart=X;K.dragStop=ya;Kb.call(K,a,b,e);Lb.call(K);Mb.call(K);sc.call(K);var i=K.opt,C=K.trigger,
P=K.clearEvents,E=K.renderOverlay,B=K.clearOverlays,n=K.reportSelection,Y=K.unselect,W=K.daySelectionMousedown,o=K.slotSegHtml,s=b.formatDate,v,F,r,J,M,k,D,Z,ja,ia,la,$,w,I,R,V,ea,aa,va,wa,Ga,Wb,Ma,db,vb,Xa,Xb,Ba,tb,Na,Ra,cb,ub={},Wa,Tb,Sb,Ub,Ha,Ia,La,bb,Vb;qb(a.addClass("fc-agenda"));Na=new Nb(function(h,O){function x(eb){return Math.max(Ea,Math.min(tc,eb))}var A,ta,za;r.each(function(eb,uc){A=m(uc);ta=A.offset().left;if(eb)za[1]=ta;za=[ta];O[eb]=za});za[1]=ta+A.outerWidth();if(i("allDaySlot")){A=
$;ta=A.offset().top;h[0]=[ta,ta+A.outerHeight()]}for(var Da=I.offset().top,Ea=w.offset().top,tc=Ea+w.outerHeight(),fb=0;fb<tb;fb++)h.push([x(Da+Xa*fb),x(Da+Xa*(fb+1))])});Ra=new Ob(Na);cb=new Pb(function(h){return k.eq(h)})}function sc(){function a(o,s){sa(o);var v,F=o.length,r=[],J=[];for(v=0;v<F;v++)o[v].allDay?r.push(o[v]):J.push(o[v]);if(u("allDaySlot")){L(e(r),s);na()}g(d(J),s)}function b(){ha();ua().empty();pa().empty()}function e(o){o=ob(nb(o,m.map(o,Ua),q.visStart,q.visEnd));var s,v=o.length,
F,r,J,M=[];for(s=0;s<v;s++){F=o[s];for(r=0;r<F.length;r++){J=F[r];J.row=0;J.level=s;M.push(J)}}return M}function d(o){var s=z(),v=ka(),F=ca(),r=xa(N(q.visStart),v),J=m.map(o,f),M,k,D,Z,ja,ia,la=[];for(M=0;M<s;M++){k=ob(nb(o,J,r,xa(N(r),F-v)));vc(k);for(D=0;D<k.length;D++){Z=k[D];for(ja=0;ja<Z.length;ja++){ia=Z[ja];ia.col=M;ia.level=D;la.push(ia)}}ba(r,1,true)}return la}function f(o){return o.end?N(o.end):xa(N(o.start),u("defaultEventMinutes"))}function g(o,s){var v,F=o.length,r,J,M,k,D,Z,ja,ia,la,
$="",w,I,R={},V={},ea=pa(),aa;v=z();if(w=u("isRTL")){I=-1;aa=v-1}else{I=1;aa=0}for(v=0;v<F;v++){r=o[v];J=r.event;M=qa(r.start,r.start);k=qa(r.start,r.end);D=r.col;Z=r.level;ja=r.forward||0;ia=G(D*I+aa);la=p(D*I+aa)-ia;la=Math.min(la-6,la*0.95);D=Z?la/(Z+ja+1):ja?(la/(ja+1)-6)*2:la;Z=ia+la/(Z+ja+1)*Z*I+(w?la-D:0);r.top=M;r.left=Z;r.outerWidth=D;r.outerHeight=k-M;$+=l(J,r)}ea[0].innerHTML=$;w=ea.children();for(v=0;v<F;v++){r=o[v];J=r.event;$=m(w[v]);I=fa("eventRender",J,J,$);if(I===false)$.remove();
else{if(I&&I!==true){$.remove();$=m(I).css({position:"absolute",top:r.top,left:r.left}).appendTo(ea)}r.element=$;if(J._id===s)t(J,$,r);else $[0]._fci=v;ya(J,$)}}Db(ea,o,t);for(v=0;v<F;v++){r=o[v];if($=r.element){J=R[s=r.key=Ib($[0])];r.vsides=J===ma?(R[s]=Sa($,true)):J;J=V[s];r.hsides=J===ma?(V[s]=pb($,true)):J;s=$.find("div.fc-event-content");if(s.length)r.contentTop=s[0].offsetTop}}for(v=0;v<F;v++){r=o[v];if($=r.element){$[0].style.width=Math.max(0,r.outerWidth-r.hsides)+"px";R=Math.max(0,r.outerHeight-
r.vsides);$[0].style.height=R+"px";J=r.event;if(r.contentTop!==ma&&R-r.contentTop<10){$.find("div.fc-event-time").text(Y(J.start,u("timeFormat"))+" - "+J.title);$.find("div.fc-event-title").remove()}fa("eventAfterRender",J,J,$)}}}function l(o,s){var v="<",F=o.url,r=Jb(o,u),J=r?" style='"+r+"'":"",M=["fc-event","fc-event-skin","fc-event-vert"];oa(o)&&M.push("fc-event-draggable");s.isStart&&M.push("fc-corner-top");s.isEnd&&M.push("fc-corner-bottom");M=M.concat(o.className);if(o.source)M=M.concat(o.source.className||
[]);v+=F?"a href='"+Qa(o.url)+"'":"div";v+=" class='"+M.join(" ")+"' style='position:absolute;z-index:8;top:"+s.top+"px;left:"+s.left+"px;"+r+"'><div class='fc-event-inner fc-event-skin'"+J+"><div class='fc-event-head fc-event-skin'"+J+"><div class='fc-event-time'>"+Qa(W(o.start,o.end,u("timeFormat")))+"</div></div><div class='fc-event-content'><div class='fc-event-title'>"+Qa(o.title)+"</div></div><div class='fc-event-bg'></div></div>";if(s.isEnd&&ga(o))v+="<div class='ui-resizable-handle ui-resizable-s'>=</div>";
v+="</"+(F?"a":"div")+">";return v}function j(o,s,v){oa(o)&&y(o,s,v.isStart);v.isEnd&&ga(o)&&c(o,s,v);da(o,s)}function t(o,s,v){var F=s.find("div.fc-event-time");oa(o)&&S(o,s,F);v.isEnd&&ga(o)&&Q(o,s,F);da(o,s)}function y(o,s,v){function F(){if(!M){s.width(r).height("").draggable("option","grid",null);M=true}}var r,J,M=true,k,D=u("isRTL")?-1:1,Z=U(),ja=H(),ia=T(),la=ka();s.draggable({zIndex:9,opacity:u("dragOpacity","month"),revertDuration:u("dragRevertDuration"),start:function($,w){fa("eventDragStart",
s,o,$,w);i(o,s);r=s.width();Z.start(function(I,R,V,ea){B();if(I){J=false;k=ea*D;if(I.row)if(v){if(M){s.width(ja-10);Eb(s,ia*Math.round((o.end?(o.end-o.start)/wc:u("defaultEventMinutes"))/u("slotMinutes")));s.draggable("option","grid",[ja,1]);M=false}}else J=true;else{E(ba(N(o.start),k),ba(Ua(o),k));F()}J=J||M&&!k}else{F();J=true}s.draggable("option","revert",J)},$,"drag")},stop:function($,w){Z.stop();B();fa("eventDragStop",s,o,$,w);if(J){F();s.css("filter","");K(o,s)}else{var I=0;M||(I=Math.round((s.offset().top-
X().offset().top)/ia)*u("slotMinutes")+la-(o.start.getHours()*60+o.start.getMinutes()));C(this,o,k,I,M,$,w)}}})}function S(o,s,v){function F(I){var R=xa(N(o.start),I),V;if(o.end)V=xa(N(o.end),I);v.text(W(R,V,u("timeFormat")))}function r(){if(M){v.css("display","");s.draggable("option","grid",[$,w]);M=false}}var J,M=false,k,D,Z,ja=u("isRTL")?-1:1,ia=U(),la=z(),$=H(),w=T();s.draggable({zIndex:9,scroll:false,grid:[$,w],axis:la==1?"y":false,opacity:u("dragOpacity"),revertDuration:u("dragRevertDuration"),
start:function(I,R){fa("eventDragStart",s,o,I,R);i(o,s);J=s.position();D=Z=0;ia.start(function(V,ea,aa,va){s.draggable("option","revert",!V);B();if(V){k=va*ja;if(u("allDaySlot")&&!V.row){if(!M){M=true;v.hide();s.draggable("option","grid",null)}E(ba(N(o.start),k),ba(Ua(o),k))}else r()}},I,"drag")},drag:function(I,R){D=Math.round((R.position.top-J.top)/w)*u("slotMinutes");if(D!=Z){M||F(D);Z=D}},stop:function(I,R){var V=ia.stop();B();fa("eventDragStop",s,o,I,R);if(V&&(k||D||M))C(this,o,k,M?0:D,M,I,R);
else{r();s.css("filter","");s.css(J);F(0);K(o,s)}}})}function Q(o,s,v){var F,r,J=T();s.resizable({handles:{s:"div.ui-resizable-s"},grid:J,start:function(M,k){F=r=0;i(o,s);s.css("z-index",9);fa("eventResizeStart",this,o,M,k)},resize:function(M,k){F=Math.round((Math.max(J,s.height())-k.originalSize.height)/J);if(F!=r){v.text(W(o.start,!F&&!o.end?null:xa(ra(o),u("slotMinutes")*F),u("timeFormat")));r=F}},stop:function(M,k){fa("eventResizeStop",this,o,M,k);if(F)P(this,o,0,u("slotMinutes")*F,M,k);else{s.css("z-index",
8);K(o,s)}}})}var q=this;q.renderEvents=a;q.compileDaySegs=e;q.clearEvents=b;q.slotSegHtml=l;q.bindDaySeg=j;Qb.call(q);var u=q.opt,fa=q.trigger,oa=q.isEventDraggable,ga=q.isEventResizable,ra=q.eventEnd,sa=q.reportEvents,ha=q.reportEventClear,da=q.eventElementHandlers,na=q.setHeight,ua=q.getDaySegmentContainer,pa=q.getSlotSegmentContainer,U=q.getHoverListener,ca=q.getMaxMinute,ka=q.getMinMinute,qa=q.timePosition,G=q.colContentLeft,p=q.colContentRight,L=q.renderDaySegs,c=q.resizableDayEvent,z=q.getColCnt,
H=q.getColWidth,T=q.getSlotHeight,X=q.getBodyContent,ya=q.reportEventElement,K=q.showEvents,i=q.hideEvents,C=q.eventDrop,P=q.eventResize,E=q.renderDayOverlay,B=q.clearOverlays,n=q.calendar,Y=n.formatDate,W=n.formatDates}function vc(a){var b,e,d,f,g,l;for(b=a.length-1;b>0;b--){f=a[b];for(e=0;e<f.length;e++){g=f[e];for(d=0;d<a[b-1].length;d++){l=a[b-1][d];if(Cb(g,l))l.forward=Math.max(l.forward||0,(g.forward||0)+1)}}}}function Kb(a,b,e){function d(G,p){G=qa[G];if(typeof G=="object")return jb(G,p||e);
return G}function f(G,p){return b.trigger.apply(b,[G,p||da].concat(Array.prototype.slice.call(arguments,2),[da]))}function g(G){return j(G)&&!d("disableDragging")}function l(G){return j(G)&&!d("disableResizing")}function j(G){return Ta(G.editable,(G.source||{}).editable,d("editable"))}function t(G){U={};var p,L=G.length,c;for(p=0;p<L;p++){c=G[p];if(U[c._id])U[c._id].push(c);else U[c._id]=[c]}}function y(G){return G.end?N(G.end):na(G)}function S(G,p){ca.push(p);if(ka[G._id])ka[G._id].push(p);else ka[G._id]=
[p]}function Q(){ca=[];ka={}}function q(G,p){p.click(function(L){if(!p.hasClass("ui-draggable-dragging")&&!p.hasClass("ui-resizable-resizing"))return f("eventClick",this,G,L)}).hover(function(L){f("eventMouseover",this,G,L)},function(L){f("eventMouseout",this,G,L)})}function u(G,p){oa(G,p,"show")}function fa(G,p){oa(G,p,"hide")}function oa(G,p,L){G=ka[G._id];var c,z=G.length;for(c=0;c<z;c++)if(!p||G[c][0]!=p[0])G[c][L]()}function ga(G,p,L,c,z,H,T){var X=p.allDay,ya=p._id;sa(U[ya],L,c,z);f("eventDrop",
G,p,L,c,z,function(){sa(U[ya],-L,-c,X);pa(ya)},H,T);pa(ya)}function ra(G,p,L,c,z,H){var T=p._id;ha(U[T],L,c);f("eventResize",G,p,L,c,function(){ha(U[T],-L,-c);pa(T)},z,H);pa(T)}function sa(G,p,L,c){L=L||0;for(var z,H=G.length,T=0;T<H;T++){z=G[T];if(c!==ma)z.allDay=c;xa(ba(z.start,p,true),L);if(z.end)z.end=xa(ba(z.end,p,true),L);ua(z,qa)}}function ha(G,p,L){L=L||0;for(var c,z=G.length,H=0;H<z;H++){c=G[H];c.end=xa(ba(y(c),p,true),L);ua(c,qa)}}var da=this;da.element=a;da.calendar=b;da.name=e;da.opt=
d;da.trigger=f;da.isEventDraggable=g;da.isEventResizable=l;da.reportEvents=t;da.eventEnd=y;da.reportEventElement=S;da.reportEventClear=Q;da.eventElementHandlers=q;da.showEvents=u;da.hideEvents=fa;da.eventDrop=ga;da.eventResize=ra;var na=da.defaultEventEnd,ua=b.normalizeEvent,pa=b.reportEventChange,U={},ca=[],ka={},qa=b.options}function Qb(){function a(i,C){var P=z(),E=pa(),B=U(),n=0,Y,W,o=i.length,s,v;P[0].innerHTML=e(i);d(i,P.children());f(i);g(i,P,C);l(i);j(i);t(i);C=y();for(P=0;P<E;P++){Y=[];for(W=
0;W<B;W++)Y[W]=0;for(;n<o&&(s=i[n]).row==P;){W=Hb(Y.slice(s.startCol,s.endCol));s.top=W;W+=s.outerHeight;for(v=s.startCol;v<s.endCol;v++)Y[v]=W;n++}C[P].height(Hb(Y))}Q(i,S(C))}function b(i,C,P){var E=m("<div/>"),B=z(),n=i.length,Y;E[0].innerHTML=e(i);E=E.children();B.append(E);d(i,E);l(i);j(i);t(i);Q(i,S(y()));E=[];for(B=0;B<n;B++)if(Y=i[B].element){i[B].row===C&&Y.css("top",P);E.push(Y[0])}return m(E)}function e(i){var C=fa("isRTL"),P,E=i.length,B,n,Y,W;P=ka();var o=P.left,s=P.right,v,F,r,J,M,k=
"";for(P=0;P<E;P++){B=i[P];n=B.event;W=["fc-event","fc-event-skin","fc-event-hori"];ga(n)&&W.push("fc-event-draggable");if(C){B.isStart&&W.push("fc-corner-right");B.isEnd&&W.push("fc-corner-left");v=p(B.end.getDay()-1);F=p(B.start.getDay());r=B.isEnd?qa(v):o;J=B.isStart?G(F):s}else{B.isStart&&W.push("fc-corner-left");B.isEnd&&W.push("fc-corner-right");v=p(B.start.getDay());F=p(B.end.getDay()-1);r=B.isStart?qa(v):o;J=B.isEnd?G(F):s}W=W.concat(n.className);if(n.source)W=W.concat(n.source.className||
[]);Y=n.url;M=Jb(n,fa);k+=Y?"<a href='"+Qa(Y)+"'":"<div";k+=" class='"+W.join(" ")+"' style='position:absolute;z-index:8;left:"+r+"px;"+M+"'><div class='fc-event-inner fc-event-skin'"+(M?" style='"+M+"'":"")+">";if(!n.allDay&&B.isStart)k+="<span class='fc-event-time'>"+Qa(T(n.start,n.end,fa("timeFormat")))+"</span>";k+="<span class='fc-event-title'>"+Qa(n.title)+"</span></div>";if(B.isEnd&&ra(n))k+="<div class='ui-resizable-handle ui-resizable-"+(C?"w":"e")+"'>&nbsp;&nbsp;&nbsp;</div>";k+="</"+(Y?
"a":"div")+">";B.left=r;B.outerWidth=J-r;B.startCol=v;B.endCol=F+1}return k}function d(i,C){var P,E=i.length,B,n,Y;for(P=0;P<E;P++){B=i[P];n=B.event;Y=m(C[P]);n=oa("eventRender",n,n,Y);if(n===false)Y.remove();else{if(n&&n!==true){n=m(n).css({position:"absolute",left:B.left});Y.replaceWith(n);Y=n}B.element=Y}}}function f(i){var C,P=i.length,E,B;for(C=0;C<P;C++){E=i[C];(B=E.element)&&ha(E.event,B)}}function g(i,C,P){var E,B=i.length,n,Y,W;for(E=0;E<B;E++){n=i[E];if(Y=n.element){W=n.event;if(W._id===
P)H(W,Y,n);else Y[0]._fci=E}}Db(C,i,H)}function l(i){var C,P=i.length,E,B,n,Y,W={};for(C=0;C<P;C++){E=i[C];if(B=E.element){n=E.key=Ib(B[0]);Y=W[n];if(Y===ma)Y=W[n]=pb(B,true);E.hsides=Y}}}function j(i){var C,P=i.length,E,B;for(C=0;C<P;C++){E=i[C];if(B=E.element)B[0].style.width=Math.max(0,E.outerWidth-E.hsides)+"px"}}function t(i){var C,P=i.length,E,B,n,Y,W={};for(C=0;C<P;C++){E=i[C];if(B=E.element){n=E.key;Y=W[n];if(Y===ma)Y=W[n]=Fb(B);E.outerHeight=B[0].offsetHeight+Y}}}function y(){var i,C=pa(),
P=[];for(i=0;i<C;i++)P[i]=ca(i).find("td:first div.fc-day-content > div");return P}function S(i){var C,P=i.length,E=[];for(C=0;C<P;C++)E[C]=i[C][0].offsetTop;return E}function Q(i,C){var P,E=i.length,B,n;for(P=0;P<E;P++){B=i[P];if(n=B.element){n[0].style.top=C[B.row]+(B.top||0)+"px";B=B.event;oa("eventAfterRender",B,B,n)}}}function q(i,C,P){var E=fa("isRTL"),B=E?"w":"e",n=C.find("div.ui-resizable-"+B),Y=false;qb(C);C.mousedown(function(W){W.preventDefault()}).click(function(W){if(Y){W.preventDefault();
W.stopImmediatePropagation()}});n.mousedown(function(W){function o(ia){oa("eventResizeStop",this,i,ia);m("body").css("cursor","");s.stop();ya();k&&ua(this,i,k,0,ia);setTimeout(function(){Y=false},0)}if(W.which==1){Y=true;var s=u.getHoverListener(),v=pa(),F=U(),r=E?-1:1,J=E?F-1:0,M=C.css("top"),k,D,Z=m.extend({},i),ja=L(i.start);K();m("body").css("cursor",B+"-resize").one("mouseup",o);oa("eventResizeStart",this,i,W);s.start(function(ia,la){if(ia){var $=Math.max(ja.row,ia.row);ia=ia.col;if(v==1)$=0;
if($==ja.row)ia=E?Math.min(ja.col,ia):Math.max(ja.col,ia);k=$*7+ia*r+J-(la.row*7+la.col*r+J);la=ba(sa(i),k,true);if(k){Z.end=la;$=D;D=b(c([Z]),P.row,M);D.find("*").css("cursor",B+"-resize");$&&$.remove();na(i)}else if(D){da(i);D.remove();D=null}ya();X(i.start,ba(N(la),1))}},W)}})}var u=this;u.renderDaySegs=a;u.resizableDayEvent=q;var fa=u.opt,oa=u.trigger,ga=u.isEventDraggable,ra=u.isEventResizable,sa=u.eventEnd,ha=u.reportEventElement,da=u.showEvents,na=u.hideEvents,ua=u.eventResize,pa=u.getRowCnt,
U=u.getColCnt,ca=u.allDayRow,ka=u.allDayBounds,qa=u.colContentLeft,G=u.colContentRight,p=u.dayOfWeekCol,L=u.dateCell,c=u.compileDaySegs,z=u.getDaySegmentContainer,H=u.bindDaySeg,T=u.calendar.formatDates,X=u.renderDayOverlay,ya=u.clearOverlays,K=u.clearSelection}function Mb(){function a(Q,q,u){b();q||(q=j(Q,u));t(Q,q,u);e(Q,q,u)}function b(Q){if(S){S=false;y();l("unselect",null,Q)}}function e(Q,q,u,fa){S=true;l("select",null,Q,q,u,fa)}function d(Q){var q=f.cellDate,u=f.cellIsAllDay,fa=f.getHoverListener(),
oa=f.reportDayClick;if(Q.which==1&&g("selectable")){b(Q);var ga;fa.start(function(ra,sa){y();if(ra&&u(ra)){ga=[q(sa),q(ra)].sort(Gb);t(ga[0],ga[1],true)}else ga=null},Q);m(document).one("mouseup",function(ra){fa.stop();if(ga){+ga[0]==+ga[1]&&oa(ga[0],true,ra);e(ga[0],ga[1],true,ra)}})}}var f=this;f.select=a;f.unselect=b;f.reportSelection=e;f.daySelectionMousedown=d;var g=f.opt,l=f.trigger,j=f.defaultSelectionEnd,t=f.renderSelection,y=f.clearSelection,S=false;g("selectable")&&g("unselectAuto")&&m(document).mousedown(function(Q){var q=
g("unselectCancel");if(q)if(m(Q.target).parents(q).length)return;b(Q)})}function Lb(){function a(g,l){var j=f.shift();j||(j=m("<div class='fc-cell-overlay' style='position:absolute;z-index:3'/>"));j[0].parentNode!=l[0]&&j.appendTo(l);d.push(j.css(g).show());return j}function b(){for(var g;g=d.shift();)f.push(g.hide().unbind())}var e=this;e.renderOverlay=a;e.clearOverlays=b;var d=[],f=[]}function Nb(a){var b=this,e,d;b.build=function(){e=[];d=[];a(e,d)};b.cell=function(f,g){var l=e.length,j=d.length,
t,y=-1,S=-1;for(t=0;t<l;t++)if(g>=e[t][0]&&g<e[t][1]){y=t;break}for(t=0;t<j;t++)if(f>=d[t][0]&&f<d[t][1]){S=t;break}return y>=0&&S>=0?{row:y,col:S}:null};b.rect=function(f,g,l,j,t){t=t.offset();return{top:e[f][0]-t.top,left:d[g][0]-t.left,width:d[j][1]-d[g][0],height:e[l][1]-e[f][0]}}}function Ob(a){function b(j){xc(j);j=a.cell(j.pageX,j.pageY);if(!j!=!l||j&&(j.row!=l.row||j.col!=l.col)){if(j){g||(g=j);f(j,g,j.row-g.row,j.col-g.col)}else f(j,g);l=j}}var e=this,d,f,g,l;e.start=function(j,t,y){f=j;
g=l=null;a.build();b(t);d=y||"mousemove";m(document).bind(d,b)};e.stop=function(){m(document).unbind(d,b);return l}}function xc(a){if(a.pageX===ma){a.pageX=a.originalEvent.pageX;a.pageY=a.originalEvent.pageY}}function Pb(a){function b(l){return d[l]=d[l]||a(l)}var e=this,d={},f={},g={};e.left=function(l){return f[l]=f[l]===ma?b(l).position().left:f[l]};e.right=function(l){return g[l]=g[l]===ma?e.left(l)+b(l).width():g[l]};e.clear=function(){d={};f={};g={}}}var Ya={defaultView:"month",aspectRatio:1.35,
header:{left:"title",center:"",right:"today prev,next"},weekends:true,allDayDefault:true,ignoreTimezone:true,lazyFetching:true,startParam:"start",endParam:"end",titleFormat:{month:"MMMM yyyy",week:"MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",day:"dddd, MMM d, yyyy"},columnFormat:{month:"ddd",week:"ddd M/d",day:"dddd M/d"},timeFormat:{"":"h(:mm)t"},isRTL:false,firstDay:0,monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan",
"Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],buttonText:{prev:"&nbsp;&#9668;&nbsp;",next:"&nbsp;&#9658;&nbsp;",prevYear:"&nbsp;&lt;&lt;&nbsp;",nextYear:"&nbsp;&gt;&gt;&nbsp;",today:"today",month:"month",week:"week",day:"day"},theme:false,buttonIcons:{prev:"circle-triangle-w",next:"circle-triangle-e"},unselectAuto:true,dropAccept:"*"},yc=
{header:{left:"next,prev today",center:"",right:"title"},buttonText:{prev:"&nbsp;&#9658;&nbsp;",next:"&nbsp;&#9668;&nbsp;",prevYear:"&nbsp;&gt;&gt;&nbsp;",nextYear:"&nbsp;&lt;&lt;&nbsp;"},buttonIcons:{prev:"circle-triangle-e",next:"circle-triangle-w"}},Aa=m.fullCalendar={version:"1.5.3"},Ja=Aa.views={};m.fn.fullCalendar=function(a){if(typeof a=="string"){var b=Array.prototype.slice.call(arguments,1),e;this.each(function(){var f=m.data(this,"fullCalendar");if(f&&m.isFunction(f[a])){f=f[a].apply(f,
b);if(e===ma)e=f;a=="destroy"&&m.removeData(this,"fullCalendar")}});if(e!==ma)return e;return this}var d=a.eventSources||[];delete a.eventSources;if(a.events){d.push(a.events);delete a.events}a=m.extend(true,{},Ya,a.isRTL||a.isRTL===ma&&Ya.isRTL?yc:{},a);this.each(function(f,g){f=m(g);g=new Yb(f,a,d);f.data("fullCalendar",g);g.render()});return this};Aa.sourceNormalizers=[];Aa.sourceFetchers=[];var ac={dataType:"json",cache:false},bc=1;Aa.addDays=ba;Aa.cloneDate=N;Aa.parseDate=kb;Aa.parseISO8601=
Bb;Aa.parseTime=mb;Aa.formatDate=Oa;Aa.formatDates=ib;var lc=["sun","mon","tue","wed","thu","fri","sat"],Ab=864E5,cc=36E5,wc=6E4,dc={s:function(a){return a.getSeconds()},ss:function(a){return Pa(a.getSeconds())},m:function(a){return a.getMinutes()},mm:function(a){return Pa(a.getMinutes())},h:function(a){return a.getHours()%12||12},hh:function(a){return Pa(a.getHours()%12||12)},H:function(a){return a.getHours()},HH:function(a){return Pa(a.getHours())},d:function(a){return a.getDate()},dd:function(a){return Pa(a.getDate())},
ddd:function(a,b){return b.dayNamesShort[a.getDay()]},dddd:function(a,b){return b.dayNames[a.getDay()]},M:function(a){return a.getMonth()+1},MM:function(a){return Pa(a.getMonth()+1)},MMM:function(a,b){return b.monthNamesShort[a.getMonth()]},MMMM:function(a,b){return b.monthNames[a.getMonth()]},yy:function(a){return(a.getFullYear()+"").substring(2)},yyyy:function(a){return a.getFullYear()},t:function(a){return a.getHours()<12?"a":"p"},tt:function(a){return a.getHours()<12?"am":"pm"},T:function(a){return a.getHours()<
12?"A":"P"},TT:function(a){return a.getHours()<12?"AM":"PM"},u:function(a){return Oa(a,"yyyy-MM-dd'T'HH:mm:ss'Z'")},S:function(a){a=a.getDate();if(a>10&&a<20)return"th";return["st","nd","rd"][a%10-1]||"th"}};Aa.applyAll=$a;Ja.month=mc;Ja.basicWeek=nc;Ja.basicDay=oc;wb({weekMode:"fixed"});Ja.agendaWeek=qc;Ja.agendaDay=rc;wb({allDaySlot:true,allDayText:"all-day",firstHour:6,slotMinutes:30,defaultEventMinutes:120,axisFormat:"h(:mm)tt",timeFormat:{agenda:"h:mm{ - h:mm}"},dragOpacity:{agenda:0.5},minTime:0,
maxTime:24})})(jQuery);

/*
 * File:        jquery.dataTables.min.js
 * Version:     1.9.2
 * Author:      Allan Jardine (www.sprymedia.co.uk)
 * Info:        www.datatables.net
 * 
 * Copyright 2008-2012 Allan Jardine, all rights reserved.
 *
 * This source file is free software, under either the GPL v2 license or a
 * BSD style license, available at:
 *   http://datatables.net/license_gpl2
 *   http://datatables.net/license_bsd
 * 
 * This source file is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 */
(function(i,V,l,n){var j=function(e){function o(a,b){var c=j.defaults.columns,d=a.aoColumns.length,c=i.extend({},j.models.oColumn,c,{sSortingClass:a.oClasses.sSortable,sSortingClassJUI:a.oClasses.sSortJUI,nTh:b?b:l.createElement("th"),sTitle:c.sTitle?c.sTitle:b?b.innerHTML:"",aDataSort:c.aDataSort?c.aDataSort:[d],mDataProp:c.mDataProp?c.oDefaults:d});a.aoColumns.push(c);if(a.aoPreSearchCols[d]===n||null===a.aoPreSearchCols[d])a.aoPreSearchCols[d]=i.extend({},j.models.oSearch);else if(c=a.aoPreSearchCols[d],
c.bRegex===n&&(c.bRegex=!0),c.bSmart===n&&(c.bSmart=!0),c.bCaseInsensitive===n)c.bCaseInsensitive=!0;r(a,d,null)}function r(a,b,c){b=a.aoColumns[b];c!==n&&null!==c&&(c.sType!==n&&(b.sType=c.sType,b._bAutoType=!1),i.extend(b,c),p(b,c,"sWidth","sWidthOrig"),c.iDataSort!==n&&(b.aDataSort=[c.iDataSort]),p(b,c,"aDataSort"));b.fnGetData=W(b.mDataProp);b.fnSetData=ta(b.mDataProp);a.oFeatures.bSort||(b.bSortable=!1);!b.bSortable||-1==i.inArray("asc",b.asSorting)&&-1==i.inArray("desc",b.asSorting)?(b.sSortingClass=
a.oClasses.sSortableNone,b.sSortingClassJUI=""):b.bSortable||-1==i.inArray("asc",b.asSorting)&&-1==i.inArray("desc",b.asSorting)?(b.sSortingClass=a.oClasses.sSortable,b.sSortingClassJUI=a.oClasses.sSortJUI):-1!=i.inArray("asc",b.asSorting)&&-1==i.inArray("desc",b.asSorting)?(b.sSortingClass=a.oClasses.sSortableAsc,b.sSortingClassJUI=a.oClasses.sSortJUIAscAllowed):-1==i.inArray("asc",b.asSorting)&&-1!=i.inArray("desc",b.asSorting)&&(b.sSortingClass=a.oClasses.sSortableDesc,b.sSortingClassJUI=a.oClasses.sSortJUIDescAllowed)}
function k(a){if(!1===a.oFeatures.bAutoWidth)return!1;ba(a);for(var b=0,c=a.aoColumns.length;b<c;b++)a.aoColumns[b].nTh.style.width=a.aoColumns[b].sWidth}function G(a,b){for(var c=-1,d=0;d<a.aoColumns.length;d++)if(!0===a.aoColumns[d].bVisible&&c++,c==b)return d;return null}function t(a,b){for(var c=-1,d=0;d<a.aoColumns.length;d++)if(!0===a.aoColumns[d].bVisible&&c++,d==b)return!0===a.aoColumns[d].bVisible?c:null;return null}function v(a){for(var b=0,c=0;c<a.aoColumns.length;c++)!0===a.aoColumns[c].bVisible&&
b++;return b}function z(a){for(var b=j.ext.aTypes,c=b.length,d=0;d<c;d++){var g=b[d](a);if(null!==g)return g}return"string"}function D(a,b){for(var c=b.split(","),d=[],g=0,f=a.aoColumns.length;g<f;g++)for(var h=0;h<f;h++)if(a.aoColumns[g].sName==c[h]){d.push(h);break}return d}function x(a){for(var b="",c=0,d=a.aoColumns.length;c<d;c++)b+=a.aoColumns[c].sName+",";return b.length==d?"":b.slice(0,-1)}function J(a,b,c,d){var g,f,h,e,s;if(b)for(g=b.length-1;0<=g;g--){var m=b[g].aTargets;i.isArray(m)||
E(a,1,"aTargets must be an array of targets, not a "+typeof m);f=0;for(h=m.length;f<h;f++)if("number"===typeof m[f]&&0<=m[f]){for(;a.aoColumns.length<=m[f];)o(a);d(m[f],b[g])}else if("number"===typeof m[f]&&0>m[f])d(a.aoColumns.length+m[f],b[g]);else if("string"===typeof m[f]){e=0;for(s=a.aoColumns.length;e<s;e++)("_all"==m[f]||i(a.aoColumns[e].nTh).hasClass(m[f]))&&d(e,b[g])}}if(c){g=0;for(a=c.length;g<a;g++)d(g,c[g])}}function H(a,b){var c;c=i.isArray(b)?b.slice():i.extend(!0,{},b);var d=a.aoData.length,
g=i.extend(!0,{},j.models.oRow);g._aData=c;a.aoData.push(g);for(var f,g=0,h=a.aoColumns.length;g<h;g++)c=a.aoColumns[g],"function"===typeof c.fnRender&&c.bUseRendered&&null!==c.mDataProp?I(a,d,g,R(a,d,g)):I(a,d,g,w(a,d,g)),c._bAutoType&&"string"!=c.sType&&(f=w(a,d,g,"type"),null!==f&&""!==f&&(f=z(f),null===c.sType?c.sType=f:c.sType!=f&&"html"!=c.sType&&(c.sType="string")));a.aiDisplayMaster.push(d);a.oFeatures.bDeferRender||ca(a,d);return d}function ua(a){var b,c,d,g,f,h,e,s,m;if(a.bDeferLoading||
null===a.sAjaxSource){e=a.nTBody.childNodes;b=0;for(c=e.length;b<c;b++)if("TR"==e[b].nodeName.toUpperCase()){s=a.aoData.length;e[b]._DT_RowIndex=s;a.aoData.push(i.extend(!0,{},j.models.oRow,{nTr:e[b]}));a.aiDisplayMaster.push(s);h=e[b].childNodes;d=f=0;for(g=h.length;d<g;d++)if(m=h[d].nodeName.toUpperCase(),"TD"==m||"TH"==m)I(a,s,f,i.trim(h[d].innerHTML)),f++}}e=S(a);h=[];b=0;for(c=e.length;b<c;b++){d=0;for(g=e[b].childNodes.length;d<g;d++)f=e[b].childNodes[d],m=f.nodeName.toUpperCase(),("TD"==m||
"TH"==m)&&h.push(f)}g=0;for(e=a.aoColumns.length;g<e;g++){m=a.aoColumns[g];null===m.sTitle&&(m.sTitle=m.nTh.innerHTML);f=m._bAutoType;s="function"===typeof m.fnRender;var o=null!==m.sClass,k=m.bVisible,n,r;if(f||s||o||!k){b=0;for(c=a.aoData.length;b<c;b++)d=a.aoData[b],n=h[b*e+g],f&&"string"!=m.sType&&(r=w(a,b,g,"type"),""!==r&&(r=z(r),null===m.sType?m.sType=r:m.sType!=r&&"html"!=m.sType&&(m.sType="string"))),"function"===typeof m.mDataProp&&(n.innerHTML=w(a,b,g,"display")),s&&(r=R(a,b,g),n.innerHTML=
r,m.bUseRendered&&I(a,b,g,r)),o&&(n.className+=" "+m.sClass),k?d._anHidden[g]=null:(d._anHidden[g]=n,n.parentNode.removeChild(n)),m.fnCreatedCell&&m.fnCreatedCell.call(a.oInstance,n,w(a,b,g,"display"),d._aData,b,g)}}if(0!==a.aoRowCreatedCallback.length){b=0;for(c=a.aoData.length;b<c;b++)d=a.aoData[b],C(a,"aoRowCreatedCallback",null,[d.nTr,d._aData,b])}}function K(a,b){return b._DT_RowIndex!==n?b._DT_RowIndex:null}function da(a,b,c){for(var b=L(a,b),d=0,a=a.aoColumns.length;d<a;d++)if(b[d]===c)return d;
return-1}function X(a,b,c){for(var d=[],g=0,f=a.aoColumns.length;g<f;g++)d.push(w(a,b,g,c));return d}function w(a,b,c,d){var g=a.aoColumns[c];if((c=g.fnGetData(a.aoData[b]._aData,d))===n)return a.iDrawError!=a.iDraw&&null===g.sDefaultContent&&(E(a,0,"Requested unknown parameter "+("function"==typeof g.mDataProp?"{mDataprop function}":"'"+g.mDataProp+"'")+" from the data source for row "+b),a.iDrawError=a.iDraw),g.sDefaultContent;if(null===c&&null!==g.sDefaultContent)c=g.sDefaultContent;else if("function"===
typeof c)return c();return"display"==d&&null===c?"":c}function I(a,b,c,d){a.aoColumns[c].fnSetData(a.aoData[b]._aData,d)}function W(a){if(null===a)return function(){return null};if("function"===typeof a)return function(b,d){return a(b,d)};if("string"===typeof a&&-1!=a.indexOf(".")){var b=a.split(".");return function(a){for(var d=0,g=b.length;d<g;d++)if(a=a[b[d]],a===n)return n;return a}}return function(b){return b[a]}}function ta(a){if(null===a)return function(){};if("function"===typeof a)return function(b,
d){a(b,"set",d)};if("string"===typeof a&&-1!=a.indexOf(".")){var b=a.split(".");return function(a,d){for(var g=0,f=b.length-1;g<f;g++)a[b[g]]===n&&(a[b[g]]={}),a=a[b[g]];a[b[b.length-1]]=d}}return function(b,d){b[a]=d}}function Y(a){for(var b=[],c=a.aoData.length,d=0;d<c;d++)b.push(a.aoData[d]._aData);return b}function ea(a){a.aoData.splice(0,a.aoData.length);a.aiDisplayMaster.splice(0,a.aiDisplayMaster.length);a.aiDisplay.splice(0,a.aiDisplay.length);A(a)}function fa(a,b){for(var c=-1,d=0,g=a.length;d<
g;d++)a[d]==b?c=d:a[d]>b&&a[d]--; -1!=c&&a.splice(c,1)}function R(a,b,c){var d=a.aoColumns[c];return d.fnRender({iDataRow:b,iDataColumn:c,oSettings:a,aData:a.aoData[b]._aData,mDataProp:d.mDataProp},w(a,b,c,"display"))}function ca(a,b){var c=a.aoData[b],d;if(null===c.nTr){c.nTr=l.createElement("tr");c.nTr._DT_RowIndex=b;c._aData.DT_RowId&&(c.nTr.id=c._aData.DT_RowId);c._aData.DT_RowClass&&i(c.nTr).addClass(c._aData.DT_RowClass);for(var g=0,f=a.aoColumns.length;g<f;g++){var h=a.aoColumns[g];d=l.createElement(h.sCellType);
d.innerHTML="function"===typeof h.fnRender&&(!h.bUseRendered||null===h.mDataProp)?R(a,b,g):w(a,b,g,"display");null!==h.sClass&&(d.className=h.sClass);h.bVisible?(c.nTr.appendChild(d),c._anHidden[g]=null):c._anHidden[g]=d;h.fnCreatedCell&&h.fnCreatedCell.call(a.oInstance,d,w(a,b,g,"display"),c._aData,b,g)}C(a,"aoRowCreatedCallback",null,[c.nTr,c._aData,b])}}function va(a){var b,c,d;if(0!==a.nTHead.getElementsByTagName("th").length){b=0;for(d=a.aoColumns.length;b<d;b++)if(c=a.aoColumns[b].nTh,c.setAttribute("role",
"columnheader"),a.aoColumns[b].bSortable&&(c.setAttribute("tabindex",a.iTabIndex),c.setAttribute("aria-controls",a.sTableId)),null!==a.aoColumns[b].sClass&&i(c).addClass(a.aoColumns[b].sClass),a.aoColumns[b].sTitle!=c.innerHTML)c.innerHTML=a.aoColumns[b].sTitle}else{var g=l.createElement("tr");b=0;for(d=a.aoColumns.length;b<d;b++)c=a.aoColumns[b].nTh,c.innerHTML=a.aoColumns[b].sTitle,c.setAttribute("tabindex","0"),null!==a.aoColumns[b].sClass&&i(c).addClass(a.aoColumns[b].sClass),g.appendChild(c);
i(a.nTHead).html("")[0].appendChild(g);T(a.aoHeader,a.nTHead)}i(a.nTHead).children("tr").attr("role","row");if(a.bJUI){b=0;for(d=a.aoColumns.length;b<d;b++){c=a.aoColumns[b].nTh;g=l.createElement("div");g.className=a.oClasses.sSortJUIWrapper;i(c).contents().appendTo(g);var f=l.createElement("span");f.className=a.oClasses.sSortIcon;g.appendChild(f);c.appendChild(g)}}if(a.oFeatures.bSort)for(b=0;b<a.aoColumns.length;b++)!1!==a.aoColumns[b].bSortable?ga(a,a.aoColumns[b].nTh,b):i(a.aoColumns[b].nTh).addClass(a.oClasses.sSortableNone);
""!==a.oClasses.sFooterTH&&i(a.nTFoot).children("tr").children("th").addClass(a.oClasses.sFooterTH);if(null!==a.nTFoot){c=O(a,null,a.aoFooter);b=0;for(d=a.aoColumns.length;b<d;b++)c[b]&&(a.aoColumns[b].nTf=c[b],a.aoColumns[b].sClass&&i(c[b]).addClass(a.aoColumns[b].sClass))}}function U(a,b,c){var d,g,f,h=[],e=[],i=a.aoColumns.length,m;c===n&&(c=!1);d=0;for(g=b.length;d<g;d++){h[d]=b[d].slice();h[d].nTr=b[d].nTr;for(f=i-1;0<=f;f--)!a.aoColumns[f].bVisible&&!c&&h[d].splice(f,1);e.push([])}d=0;for(g=
h.length;d<g;d++){if(a=h[d].nTr)for(;f=a.firstChild;)a.removeChild(f);f=0;for(b=h[d].length;f<b;f++)if(m=i=1,e[d][f]===n){a.appendChild(h[d][f].cell);for(e[d][f]=1;h[d+i]!==n&&h[d][f].cell==h[d+i][f].cell;)e[d+i][f]=1,i++;for(;h[d][f+m]!==n&&h[d][f].cell==h[d][f+m].cell;){for(c=0;c<i;c++)e[d+c][f+m]=1;m++}h[d][f].cell.rowSpan=i;h[d][f].cell.colSpan=m}}}function y(a){var b=C(a,"aoPreDrawCallback","preDraw",[a]);if(-1!==i.inArray(!1,b))F(a,!1);else{var c,d,b=[],g=0,f=a.asStripeClasses.length;c=a.aoOpenRows.length;
a.bDrawing=!0;a.iInitDisplayStart!==n&&-1!=a.iInitDisplayStart&&(a._iDisplayStart=a.oFeatures.bServerSide?a.iInitDisplayStart:a.iInitDisplayStart>=a.fnRecordsDisplay()?0:a.iInitDisplayStart,a.iInitDisplayStart=-1,A(a));if(a.bDeferLoading)a.bDeferLoading=!1,a.iDraw++;else if(a.oFeatures.bServerSide){if(!a.bDestroying&&!wa(a))return}else a.iDraw++;if(0!==a.aiDisplay.length){var h=a._iDisplayStart;d=a._iDisplayEnd;a.oFeatures.bServerSide&&(h=0,d=a.aoData.length);for(;h<d;h++){var e=a.aoData[a.aiDisplay[h]];
null===e.nTr&&ca(a,a.aiDisplay[h]);var s=e.nTr;if(0!==f){var m=a.asStripeClasses[g%f];e._sRowStripe!=m&&(i(s).removeClass(e._sRowStripe).addClass(m),e._sRowStripe=m)}C(a,"aoRowCallback",null,[s,a.aoData[a.aiDisplay[h]]._aData,g,h]);b.push(s);g++;if(0!==c)for(e=0;e<c;e++)if(s==a.aoOpenRows[e].nParent){b.push(a.aoOpenRows[e].nTr);break}}}else b[0]=l.createElement("tr"),a.asStripeClasses[0]&&(b[0].className=a.asStripeClasses[0]),c=a.oLanguage,f=c.sZeroRecords,1==a.iDraw&&null!==a.sAjaxSource&&!a.oFeatures.bServerSide?
f=c.sLoadingRecords:c.sEmptyTable&&0===a.fnRecordsTotal()&&(f=c.sEmptyTable),c=l.createElement("td"),c.setAttribute("valign","top"),c.colSpan=v(a),c.className=a.oClasses.sRowEmpty,c.innerHTML=ha(a,f),b[g].appendChild(c);C(a,"aoHeaderCallback","header",[i(a.nTHead).children("tr")[0],Y(a),a._iDisplayStart,a.fnDisplayEnd(),a.aiDisplay]);C(a,"aoFooterCallback","footer",[i(a.nTFoot).children("tr")[0],Y(a),a._iDisplayStart,a.fnDisplayEnd(),a.aiDisplay]);g=l.createDocumentFragment();c=l.createDocumentFragment();
if(a.nTBody){f=a.nTBody.parentNode;c.appendChild(a.nTBody);if(!a.oScroll.bInfinite||!a._bInitComplete||a.bSorted||a.bFiltered)for(;c=a.nTBody.firstChild;)a.nTBody.removeChild(c);c=0;for(d=b.length;c<d;c++)g.appendChild(b[c]);a.nTBody.appendChild(g);null!==f&&f.appendChild(a.nTBody)}C(a,"aoDrawCallback","draw",[a]);a.bSorted=!1;a.bFiltered=!1;a.bDrawing=!1;a.oFeatures.bServerSide&&(F(a,!1),a._bInitComplete||Z(a))}}function $(a){a.oFeatures.bSort?P(a,a.oPreviousSearch):a.oFeatures.bFilter?M(a,a.oPreviousSearch):
(A(a),y(a))}function xa(a){var b=i("<div></div>")[0];a.nTable.parentNode.insertBefore(b,a.nTable);a.nTableWrapper=i('<div id="'+a.sTableId+'_wrapper" class="'+a.oClasses.sWrapper+'" role="grid"></div>')[0];a.nTableReinsertBefore=a.nTable.nextSibling;for(var c=a.nTableWrapper,d=a.sDom.split(""),g,f,h,e,s,m,o,k=0;k<d.length;k++){f=0;h=d[k];if("<"==h){e=i("<div></div>")[0];s=d[k+1];if("'"==s||'"'==s){m="";for(o=2;d[k+o]!=s;)m+=d[k+o],o++;"H"==m?m=a.oClasses.sJUIHeader:"F"==m&&(m=a.oClasses.sJUIFooter);
-1!=m.indexOf(".")?(s=m.split("."),e.id=s[0].substr(1,s[0].length-1),e.className=s[1]):"#"==m.charAt(0)?e.id=m.substr(1,m.length-1):e.className=m;k+=o}c.appendChild(e);c=e}else if(">"==h)c=c.parentNode;else if("l"==h&&a.oFeatures.bPaginate&&a.oFeatures.bLengthChange)g=ya(a),f=1;else if("f"==h&&a.oFeatures.bFilter)g=za(a),f=1;else if("r"==h&&a.oFeatures.bProcessing)g=Aa(a),f=1;else if("t"==h)g=Ba(a),f=1;else if("i"==h&&a.oFeatures.bInfo)g=Ca(a),f=1;else if("p"==h&&a.oFeatures.bPaginate)g=Da(a),f=1;
else if(0!==j.ext.aoFeatures.length){e=j.ext.aoFeatures;o=0;for(s=e.length;o<s;o++)if(h==e[o].cFeature){(g=e[o].fnInit(a))&&(f=1);break}}1==f&&null!==g&&("object"!==typeof a.aanFeatures[h]&&(a.aanFeatures[h]=[]),a.aanFeatures[h].push(g),c.appendChild(g))}b.parentNode.replaceChild(a.nTableWrapper,b)}function T(a,b){var c=i(b).children("tr"),d,g,f,h,e,s,m,j;a.splice(0,a.length);g=0;for(s=c.length;g<s;g++)a.push([]);g=0;for(s=c.length;g<s;g++){f=0;for(m=c[g].childNodes.length;f<m;f++)if(d=c[g].childNodes[f],
"TD"==d.nodeName.toUpperCase()||"TH"==d.nodeName.toUpperCase()){var o=1*d.getAttribute("colspan"),k=1*d.getAttribute("rowspan"),o=!o||0===o||1===o?1:o,k=!k||0===k||1===k?1:k;for(h=0;a[g][h];)h++;j=h;for(e=0;e<o;e++)for(h=0;h<k;h++)a[g+h][j+e]={cell:d,unique:1==o?!0:!1},a[g+h].nTr=c[g]}}}function O(a,b,c){var d=[];c||(c=a.aoHeader,b&&(c=[],T(c,b)));for(var b=0,g=c.length;b<g;b++)for(var f=0,h=c[b].length;f<h;f++)if(c[b][f].unique&&(!d[f]||!a.bSortCellsTop))d[f]=c[b][f].cell;return d}function wa(a){if(a.bAjaxDataGet){a.iDraw++;
F(a,!0);var b=Ea(a);ia(a,b);a.fnServerData.call(a.oInstance,a.sAjaxSource,b,function(b){Fa(a,b)},a);return!1}return!0}function Ea(a){var b=a.aoColumns.length,c=[],d,g,f,h;c.push({name:"sEcho",value:a.iDraw});c.push({name:"iColumns",value:b});c.push({name:"sColumns",value:x(a)});c.push({name:"iDisplayStart",value:a._iDisplayStart});c.push({name:"iDisplayLength",value:!1!==a.oFeatures.bPaginate?a._iDisplayLength:-1});for(f=0;f<b;f++)d=a.aoColumns[f].mDataProp,c.push({name:"mDataProp_"+f,value:"function"===
typeof d?"function":d});if(!1!==a.oFeatures.bFilter){c.push({name:"sSearch",value:a.oPreviousSearch.sSearch});c.push({name:"bRegex",value:a.oPreviousSearch.bRegex});for(f=0;f<b;f++)c.push({name:"sSearch_"+f,value:a.aoPreSearchCols[f].sSearch}),c.push({name:"bRegex_"+f,value:a.aoPreSearchCols[f].bRegex}),c.push({name:"bSearchable_"+f,value:a.aoColumns[f].bSearchable})}if(!1!==a.oFeatures.bSort){var e=0;d=null!==a.aaSortingFixed?a.aaSortingFixed.concat(a.aaSorting):a.aaSorting.slice();for(f=0;f<d.length;f++){g=
a.aoColumns[d[f][0]].aDataSort;for(h=0;h<g.length;h++)c.push({name:"iSortCol_"+e,value:g[h]}),c.push({name:"sSortDir_"+e,value:d[f][1]}),e++}c.push({name:"iSortingCols",value:e});for(f=0;f<b;f++)c.push({name:"bSortable_"+f,value:a.aoColumns[f].bSortable})}return c}function ia(a,b){C(a,"aoServerParams","serverParams",[b])}function Fa(a,b){if(b.sEcho!==n){if(1*b.sEcho<a.iDraw)return;a.iDraw=1*b.sEcho}(!a.oScroll.bInfinite||a.oScroll.bInfinite&&(a.bSorted||a.bFiltered))&&ea(a);a._iRecordsTotal=parseInt(b.iTotalRecords,
10);a._iRecordsDisplay=parseInt(b.iTotalDisplayRecords,10);var c=x(a),c=b.sColumns!==n&&""!==c&&b.sColumns!=c,d;c&&(d=D(a,b.sColumns));for(var g=W(a.sAjaxDataProp)(b),f=0,h=g.length;f<h;f++)if(c){for(var e=[],i=0,m=a.aoColumns.length;i<m;i++)e.push(g[f][d[i]]);H(a,e)}else H(a,g[f]);a.aiDisplay=a.aiDisplayMaster.slice();a.bAjaxDataGet=!1;y(a);a.bAjaxDataGet=!0;F(a,!1)}function za(a){var b=a.oPreviousSearch,c=a.oLanguage.sSearch,c=-1!==c.indexOf("_INPUT_")?c.replace("_INPUT_",'<input type="text" />'):
""===c?'<input type="text" />':c+' <input type="text" />',d=l.createElement("div");d.className=a.oClasses.sFilter;d.innerHTML="<label>"+c+"</label>";a.aanFeatures.f||(d.id=a.sTableId+"_filter");c=i('input[type="text"]',d);d._DT_Input=c[0];c.val(b.sSearch.replace('"',"&quot;"));c.bind("keyup.DT",function(){for(var c=a.aanFeatures.f,d=this.value===""?"":this.value,h=0,e=c.length;h<e;h++)c[h]!=i(this).parents("div.dataTables_filter")[0]&&i(c[h]._DT_Input).val(d);d!=b.sSearch&&M(a,{sSearch:d,bRegex:b.bRegex,
bSmart:b.bSmart,bCaseInsensitive:b.bCaseInsensitive})});c.attr("aria-controls",a.sTableId).bind("keypress.DT",function(a){if(a.keyCode==13)return false});return d}function M(a,b,c){var d=a.oPreviousSearch,g=a.aoPreSearchCols,f=function(a){d.sSearch=a.sSearch;d.bRegex=a.bRegex;d.bSmart=a.bSmart;d.bCaseInsensitive=a.bCaseInsensitive};if(a.oFeatures.bServerSide)f(b);else{Ga(a,b.sSearch,c,b.bRegex,b.bSmart,b.bCaseInsensitive);f(b);for(b=0;b<a.aoPreSearchCols.length;b++)Ha(a,g[b].sSearch,b,g[b].bRegex,
g[b].bSmart,g[b].bCaseInsensitive);Ia(a)}a.bFiltered=!0;i(a.oInstance).trigger("filter",a);a._iDisplayStart=0;A(a);y(a);ja(a,0)}function Ia(a){for(var b=j.ext.afnFiltering,c=0,d=b.length;c<d;c++)for(var g=0,f=0,h=a.aiDisplay.length;f<h;f++){var e=a.aiDisplay[f-g];b[c](a,X(a,e,"filter"),e)||(a.aiDisplay.splice(f-g,1),g++)}}function Ha(a,b,c,d,g,f){if(""!==b)for(var h=0,b=ka(b,d,g,f),d=a.aiDisplay.length-1;0<=d;d--)g=la(w(a,a.aiDisplay[d],c,"filter"),a.aoColumns[c].sType),b.test(g)||(a.aiDisplay.splice(d,
1),h++)}function Ga(a,b,c,d,g,f){d=ka(b,d,g,f);g=a.oPreviousSearch;c||(c=0);0!==j.ext.afnFiltering.length&&(c=1);if(0>=b.length)a.aiDisplay.splice(0,a.aiDisplay.length),a.aiDisplay=a.aiDisplayMaster.slice();else if(a.aiDisplay.length==a.aiDisplayMaster.length||g.sSearch.length>b.length||1==c||0!==b.indexOf(g.sSearch)){a.aiDisplay.splice(0,a.aiDisplay.length);ja(a,1);for(b=0;b<a.aiDisplayMaster.length;b++)d.test(a.asDataSearch[b])&&a.aiDisplay.push(a.aiDisplayMaster[b])}else for(b=c=0;b<a.asDataSearch.length;b++)d.test(a.asDataSearch[b])||
(a.aiDisplay.splice(b-c,1),c++)}function ja(a,b){if(!a.oFeatures.bServerSide){a.asDataSearch.splice(0,a.asDataSearch.length);for(var c=b&&1===b?a.aiDisplayMaster:a.aiDisplay,d=0,g=c.length;d<g;d++)a.asDataSearch[d]=ma(a,X(a,c[d],"filter"))}}function ma(a,b){var c="";a.__nTmpFilter===n&&(a.__nTmpFilter=l.createElement("div"));for(var d=a.__nTmpFilter,g=0,f=a.aoColumns.length;g<f;g++)a.aoColumns[g].bSearchable&&(c+=la(b[g],a.aoColumns[g].sType)+"  ");-1!==c.indexOf("&")&&(d.innerHTML=c,c=d.textContent?
d.textContent:d.innerText,c=c.replace(/\n/g," ").replace(/\r/g,""));return c}function ka(a,b,c,d){if(c)return a=b?a.split(" "):na(a).split(" "),a="^(?=.*?"+a.join(")(?=.*?")+").*$",RegExp(a,d?"i":"");a=b?a:na(a);return RegExp(a,d?"i":"")}function la(a,b){return"function"===typeof j.ext.ofnSearch[b]?j.ext.ofnSearch[b](a):null===a?"":"html"==b?a.replace(/[\r\n]/g," ").replace(/<.*?>/g,""):"string"===typeof a?a.replace(/[\r\n]/g," "):a}function na(a){return a.replace(RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\|\\$|\\^|\\-)",
"g"),"\\$1")}function Ca(a){var b=l.createElement("div");b.className=a.oClasses.sInfo;a.aanFeatures.i||(a.aoDrawCallback.push({fn:Ja,sName:"information"}),b.id=a.sTableId+"_info");a.nTable.setAttribute("aria-describedby",a.sTableId+"_info");return b}function Ja(a){if(a.oFeatures.bInfo&&0!==a.aanFeatures.i.length){var b=a.oLanguage,c=a._iDisplayStart+1,d=a.fnDisplayEnd(),g=a.fnRecordsTotal(),f=a.fnRecordsDisplay(),h;h=0===f&&f==g?b.sInfoEmpty:0===f?b.sInfoEmpty+" "+b.sInfoFiltered:f==g?b.sInfo:b.sInfo+
" "+b.sInfoFiltered;h+=b.sInfoPostFix;h=ha(a,h);null!==b.fnInfoCallback&&(h=b.fnInfoCallback.call(a.oInstance,a,c,d,g,f,h));a=a.aanFeatures.i;b=0;for(c=a.length;b<c;b++)i(a[b]).html(h)}}function ha(a,b){var c=a.fnFormatNumber(a._iDisplayStart+1),d=a.fnDisplayEnd(),d=a.fnFormatNumber(d),g=a.fnRecordsDisplay(),g=a.fnFormatNumber(g),f=a.fnRecordsTotal(),f=a.fnFormatNumber(f);a.oScroll.bInfinite&&(c=a.fnFormatNumber(1));return b.replace("_START_",c).replace("_END_",d).replace("_TOTAL_",g).replace("_MAX_",
f)}function aa(a){var b,c,d=a.iInitDisplayStart;if(!1===a.bInitialised)setTimeout(function(){aa(a)},200);else{xa(a);va(a);U(a,a.aoHeader);a.nTFoot&&U(a,a.aoFooter);F(a,!0);a.oFeatures.bAutoWidth&&ba(a);b=0;for(c=a.aoColumns.length;b<c;b++)null!==a.aoColumns[b].sWidth&&(a.aoColumns[b].nTh.style.width=q(a.aoColumns[b].sWidth));a.oFeatures.bSort?P(a):a.oFeatures.bFilter?M(a,a.oPreviousSearch):(a.aiDisplay=a.aiDisplayMaster.slice(),A(a),y(a));null!==a.sAjaxSource&&!a.oFeatures.bServerSide?(c=[],ia(a,
c),a.fnServerData.call(a.oInstance,a.sAjaxSource,c,function(c){var f=a.sAjaxDataProp!==""?W(a.sAjaxDataProp)(c):c;for(b=0;b<f.length;b++)H(a,f[b]);a.iInitDisplayStart=d;if(a.oFeatures.bSort)P(a);else{a.aiDisplay=a.aiDisplayMaster.slice();A(a);y(a)}F(a,false);Z(a,c)},a)):a.oFeatures.bServerSide||(F(a,!1),Z(a))}}function Z(a,b){a._bInitComplete=!0;C(a,"aoInitComplete","init",[a,b])}function oa(a){var b=j.defaults.oLanguage;!a.sEmptyTable&&(a.sZeroRecords&&"No data available in table"===b.sEmptyTable)&&
p(a,a,"sZeroRecords","sEmptyTable");!a.sLoadingRecords&&(a.sZeroRecords&&"Loading..."===b.sLoadingRecords)&&p(a,a,"sZeroRecords","sLoadingRecords")}function ya(a){if(a.oScroll.bInfinite)return null;var b='<select size="1" '+('name="'+a.sTableId+'_length"')+">",c,d,g=a.aLengthMenu;if(2==g.length&&"object"===typeof g[0]&&"object"===typeof g[1]){c=0;for(d=g[0].length;c<d;c++)b+='<option value="'+g[0][c]+'">'+g[1][c]+"</option>"}else{c=0;for(d=g.length;c<d;c++)b+='<option value="'+g[c]+'">'+g[c]+"</option>"}b+=
"</select>";g=l.createElement("div");a.aanFeatures.l||(g.id=a.sTableId+"_length");g.className=a.oClasses.sLength;g.innerHTML="<label>"+a.oLanguage.sLengthMenu.replace("_MENU_",b)+"</label>";i('select option[value="'+a._iDisplayLength+'"]',g).attr("selected",!0);i("select",g).bind("change.DT",function(){var b=i(this).val(),g=a.aanFeatures.l;c=0;for(d=g.length;c<d;c++)g[c]!=this.parentNode&&i("select",g[c]).val(b);a._iDisplayLength=parseInt(b,10);A(a);if(a.fnDisplayEnd()==a.fnRecordsDisplay()){a._iDisplayStart=
a.fnDisplayEnd()-a._iDisplayLength;if(a._iDisplayStart<0)a._iDisplayStart=0}if(a._iDisplayLength==-1)a._iDisplayStart=0;y(a)});i("select",g).attr("aria-controls",a.sTableId);return g}function A(a){a._iDisplayEnd=!1===a.oFeatures.bPaginate?a.aiDisplay.length:a._iDisplayStart+a._iDisplayLength>a.aiDisplay.length||-1==a._iDisplayLength?a.aiDisplay.length:a._iDisplayStart+a._iDisplayLength}function Da(a){if(a.oScroll.bInfinite)return null;var b=l.createElement("div");b.className=a.oClasses.sPaging+a.sPaginationType;
j.ext.oPagination[a.sPaginationType].fnInit(a,b,function(a){A(a);y(a)});a.aanFeatures.p||a.aoDrawCallback.push({fn:function(a){j.ext.oPagination[a.sPaginationType].fnUpdate(a,function(a){A(a);y(a)})},sName:"pagination"});return b}function pa(a,b){var c=a._iDisplayStart;if("number"===typeof b)a._iDisplayStart=b*a._iDisplayLength,a._iDisplayStart>a.fnRecordsDisplay()&&(a._iDisplayStart=0);else if("first"==b)a._iDisplayStart=0;else if("previous"==b)a._iDisplayStart=0<=a._iDisplayLength?a._iDisplayStart-
a._iDisplayLength:0,0>a._iDisplayStart&&(a._iDisplayStart=0);else if("next"==b)0<=a._iDisplayLength?a._iDisplayStart+a._iDisplayLength<a.fnRecordsDisplay()&&(a._iDisplayStart+=a._iDisplayLength):a._iDisplayStart=0;else if("last"==b)if(0<=a._iDisplayLength){var d=parseInt((a.fnRecordsDisplay()-1)/a._iDisplayLength,10)+1;a._iDisplayStart=(d-1)*a._iDisplayLength}else a._iDisplayStart=0;else E(a,0,"Unknown paging action: "+b);i(a.oInstance).trigger("page",a);return c!=a._iDisplayStart}function Aa(a){var b=
l.createElement("div");a.aanFeatures.r||(b.id=a.sTableId+"_processing");b.innerHTML=a.oLanguage.sProcessing;b.className=a.oClasses.sProcessing;a.nTable.parentNode.insertBefore(b,a.nTable);return b}function F(a,b){if(a.oFeatures.bProcessing)for(var c=a.aanFeatures.r,d=0,g=c.length;d<g;d++)c[d].style.visibility=b?"visible":"hidden";i(a.oInstance).trigger("processing",[a,b])}function Ba(a){if(""===a.oScroll.sX&&""===a.oScroll.sY)return a.nTable;var b=l.createElement("div"),c=l.createElement("div"),d=
l.createElement("div"),g=l.createElement("div"),f=l.createElement("div"),h=l.createElement("div"),e=a.nTable.cloneNode(!1),j=a.nTable.cloneNode(!1),m=a.nTable.getElementsByTagName("thead")[0],o=0===a.nTable.getElementsByTagName("tfoot").length?null:a.nTable.getElementsByTagName("tfoot")[0],k=a.oClasses;c.appendChild(d);f.appendChild(h);g.appendChild(a.nTable);b.appendChild(c);b.appendChild(g);d.appendChild(e);e.appendChild(m);null!==o&&(b.appendChild(f),h.appendChild(j),j.appendChild(o));b.className=
k.sScrollWrapper;c.className=k.sScrollHead;d.className=k.sScrollHeadInner;g.className=k.sScrollBody;f.className=k.sScrollFoot;h.className=k.sScrollFootInner;a.oScroll.bAutoCss&&(c.style.overflow="hidden",c.style.position="relative",f.style.overflow="hidden",g.style.overflow="auto");c.style.border="0";c.style.width="100%";f.style.border="0";d.style.width=""!==a.oScroll.sXInner?a.oScroll.sXInner:"100%";e.removeAttribute("id");e.style.marginLeft="0";a.nTable.style.marginLeft="0";null!==o&&(j.removeAttribute("id"),
j.style.marginLeft="0");d=i(a.nTable).children("caption");0<d.length&&(d=d[0],"top"===d._captionSide?e.appendChild(d):"bottom"===d._captionSide&&o&&j.appendChild(d));""!==a.oScroll.sX&&(c.style.width=q(a.oScroll.sX),g.style.width=q(a.oScroll.sX),null!==o&&(f.style.width=q(a.oScroll.sX)),i(g).scroll(function(){c.scrollLeft=this.scrollLeft;if(o!==null)f.scrollLeft=this.scrollLeft}));""!==a.oScroll.sY&&(g.style.height=q(a.oScroll.sY));a.aoDrawCallback.push({fn:Ka,sName:"scrolling"});a.oScroll.bInfinite&&
i(g).scroll(function(){if(!a.bDrawing&&i(this).scrollTop()!==0&&i(this).scrollTop()+i(this).height()>i(a.nTable).height()-a.oScroll.iLoadGap&&a.fnDisplayEnd()<a.fnRecordsDisplay()){pa(a,"next");A(a);y(a)}});a.nScrollHead=c;a.nScrollFoot=f;return b}function Ka(a){var b=a.nScrollHead.getElementsByTagName("div")[0],c=b.getElementsByTagName("table")[0],d=a.nTable.parentNode,g,f,h,e,j,m,o,k,n=[],r=null!==a.nTFoot?a.nScrollFoot.getElementsByTagName("div")[0]:null,p=null!==a.nTFoot?r.getElementsByTagName("table")[0]:
null,l=i.browser.msie&&7>=i.browser.version;i(a.nTable).children("thead, tfoot").remove();h=i(a.nTHead).clone()[0];a.nTable.insertBefore(h,a.nTable.childNodes[0]);null!==a.nTFoot&&(j=i(a.nTFoot).clone()[0],a.nTable.insertBefore(j,a.nTable.childNodes[1]));""===a.oScroll.sX&&(d.style.width="100%",b.parentNode.style.width="100%");var t=O(a,h);g=0;for(f=t.length;g<f;g++)o=G(a,g),t[g].style.width=a.aoColumns[o].sWidth;null!==a.nTFoot&&N(function(a){a.style.width=""},j.getElementsByTagName("tr"));a.oScroll.bCollapse&&
""!==a.oScroll.sY&&(d.style.height=d.offsetHeight+a.nTHead.offsetHeight+"px");g=i(a.nTable).outerWidth();if(""===a.oScroll.sX){if(a.nTable.style.width="100%",l&&(i("tbody",d).height()>d.offsetHeight||"scroll"==i(d).css("overflow-y")))a.nTable.style.width=q(i(a.nTable).outerWidth()-a.oScroll.iBarWidth)}else""!==a.oScroll.sXInner?a.nTable.style.width=q(a.oScroll.sXInner):g==i(d).width()&&i(d).height()<i(a.nTable).height()?(a.nTable.style.width=q(g-a.oScroll.iBarWidth),i(a.nTable).outerWidth()>g-a.oScroll.iBarWidth&&
(a.nTable.style.width=q(g))):a.nTable.style.width=q(g);g=i(a.nTable).outerWidth();f=a.nTHead.getElementsByTagName("tr");h=h.getElementsByTagName("tr");N(function(a,b){m=a.style;m.paddingTop="0";m.paddingBottom="0";m.borderTopWidth="0";m.borderBottomWidth="0";m.height=0;k=i(a).width();b.style.width=q(k);n.push(k)},h,f);i(h).height(0);null!==a.nTFoot&&(e=j.getElementsByTagName("tr"),j=a.nTFoot.getElementsByTagName("tr"),N(function(a,b){m=a.style;m.paddingTop="0";m.paddingBottom="0";m.borderTopWidth=
"0";m.borderBottomWidth="0";m.height=0;k=i(a).width();b.style.width=q(k);n.push(k)},e,j),i(e).height(0));N(function(a){a.innerHTML="";a.style.width=q(n.shift())},h);null!==a.nTFoot&&N(function(a){a.innerHTML="";a.style.width=q(n.shift())},e);if(i(a.nTable).outerWidth()<g){e=d.scrollHeight>d.offsetHeight||"scroll"==i(d).css("overflow-y")?g+a.oScroll.iBarWidth:g;if(l&&(d.scrollHeight>d.offsetHeight||"scroll"==i(d).css("overflow-y")))a.nTable.style.width=q(e-a.oScroll.iBarWidth);d.style.width=q(e);b.parentNode.style.width=
q(e);null!==a.nTFoot&&(r.parentNode.style.width=q(e));""===a.oScroll.sX?E(a,1,"The table cannot fit into the current element which will cause column misalignment. The table has been drawn at its minimum possible width."):""!==a.oScroll.sXInner&&E(a,1,"The table cannot fit into the current element which will cause column misalignment. Increase the sScrollXInner value or remove it to allow automatic calculation")}else d.style.width=q("100%"),b.parentNode.style.width=q("100%"),null!==a.nTFoot&&(r.parentNode.style.width=
q("100%"));""===a.oScroll.sY&&l&&(d.style.height=q(a.nTable.offsetHeight+a.oScroll.iBarWidth));""!==a.oScroll.sY&&a.oScroll.bCollapse&&(d.style.height=q(a.oScroll.sY),l=""!==a.oScroll.sX&&a.nTable.offsetWidth>d.offsetWidth?a.oScroll.iBarWidth:0,a.nTable.offsetHeight<d.offsetHeight&&(d.style.height=q(a.nTable.offsetHeight+l)));l=i(a.nTable).outerWidth();c.style.width=q(l);b.style.width=q(l);c=i(a.nTable).height()>d.clientHeight||"scroll"==i(d).css("overflow-y");b.style.paddingRight=c?a.oScroll.iBarWidth+
"px":"0px";null!==a.nTFoot&&(p.style.width=q(l),r.style.width=q(l),r.style.paddingRight=c?a.oScroll.iBarWidth+"px":"0px");i(d).scroll();if(a.bSorted||a.bFiltered)d.scrollTop=0}function N(a,b,c){for(var d=0,g=b.length;d<g;d++)for(var f=0,h=b[d].childNodes.length;f<h;f++)1==b[d].childNodes[f].nodeType&&(c?a(b[d].childNodes[f],c[d].childNodes[f]):a(b[d].childNodes[f]))}function La(a,b){if(!a||null===a||""===a)return 0;b||(b=l.getElementsByTagName("body")[0]);var c,d=l.createElement("div");d.style.width=
q(a);b.appendChild(d);c=d.offsetWidth;b.removeChild(d);return c}function ba(a){var b=0,c,d=0,g=a.aoColumns.length,f,h=i("th",a.nTHead),e=a.nTable.getAttribute("width");for(f=0;f<g;f++)a.aoColumns[f].bVisible&&(d++,null!==a.aoColumns[f].sWidth&&(c=La(a.aoColumns[f].sWidthOrig,a.nTable.parentNode),null!==c&&(a.aoColumns[f].sWidth=q(c)),b++));if(g==h.length&&0===b&&d==g&&""===a.oScroll.sX&&""===a.oScroll.sY)for(f=0;f<a.aoColumns.length;f++)c=i(h[f]).width(),null!==c&&(a.aoColumns[f].sWidth=q(c));else{b=
a.nTable.cloneNode(!1);f=a.nTHead.cloneNode(!0);d=l.createElement("tbody");c=l.createElement("tr");b.removeAttribute("id");b.appendChild(f);null!==a.nTFoot&&(b.appendChild(a.nTFoot.cloneNode(!0)),N(function(a){a.style.width=""},b.getElementsByTagName("tr")));b.appendChild(d);d.appendChild(c);d=i("thead th",b);0===d.length&&(d=i("tbody tr:eq(0)>td",b));h=O(a,f);for(f=d=0;f<g;f++){var j=a.aoColumns[f];j.bVisible&&null!==j.sWidthOrig&&""!==j.sWidthOrig?h[f-d].style.width=q(j.sWidthOrig):j.bVisible?h[f-
d].style.width="":d++}for(f=0;f<g;f++)a.aoColumns[f].bVisible&&(d=Ma(a,f),null!==d&&(d=d.cloneNode(!0),""!==a.aoColumns[f].sContentPadding&&(d.innerHTML+=a.aoColumns[f].sContentPadding),c.appendChild(d)));g=a.nTable.parentNode;g.appendChild(b);""!==a.oScroll.sX&&""!==a.oScroll.sXInner?b.style.width=q(a.oScroll.sXInner):""!==a.oScroll.sX?(b.style.width="",i(b).width()<g.offsetWidth&&(b.style.width=q(g.offsetWidth))):""!==a.oScroll.sY?b.style.width=q(g.offsetWidth):e&&(b.style.width=q(e));b.style.visibility=
"hidden";Na(a,b);g=i("tbody tr:eq(0)",b).children();0===g.length&&(g=O(a,i("thead",b)[0]));if(""!==a.oScroll.sX){for(f=d=c=0;f<a.aoColumns.length;f++)a.aoColumns[f].bVisible&&(c=null===a.aoColumns[f].sWidthOrig?c+i(g[d]).outerWidth():c+(parseInt(a.aoColumns[f].sWidth.replace("px",""),10)+(i(g[d]).outerWidth()-i(g[d]).width())),d++);b.style.width=q(c);a.nTable.style.width=q(c)}for(f=d=0;f<a.aoColumns.length;f++)a.aoColumns[f].bVisible&&(c=i(g[d]).width(),null!==c&&0<c&&(a.aoColumns[f].sWidth=q(c)),
d++);g=i(b).css("width");a.nTable.style.width=-1!==g.indexOf("%")?g:q(i(b).outerWidth());b.parentNode.removeChild(b)}e&&(a.nTable.style.width=q(e))}function Na(a,b){""===a.oScroll.sX&&""!==a.oScroll.sY?(i(b).width(),b.style.width=q(i(b).outerWidth()-a.oScroll.iBarWidth)):""!==a.oScroll.sX&&(b.style.width=q(i(b).outerWidth()))}function Ma(a,b){var c=Oa(a,b);if(0>c)return null;if(null===a.aoData[c].nTr){var d=l.createElement("td");d.innerHTML=w(a,c,b,"");return d}return L(a,c)[b]}function Oa(a,b){for(var c=
-1,d=-1,g=0;g<a.aoData.length;g++){var f=w(a,g,b,"display")+"",f=f.replace(/<.*?>/g,"");f.length>c&&(c=f.length,d=g)}return d}function q(a){if(null===a)return"0px";if("number"==typeof a)return 0>a?"0px":a+"px";var b=a.charCodeAt(a.length-1);return 48>b||57<b?a:a+"px"}function Pa(){var a=l.createElement("p"),b=a.style;b.width="100%";b.height="200px";b.padding="0px";var c=l.createElement("div"),b=c.style;b.position="absolute";b.top="0px";b.left="0px";b.visibility="hidden";b.width="200px";b.height="150px";
b.padding="0px";b.overflow="hidden";c.appendChild(a);l.body.appendChild(c);b=a.offsetWidth;c.style.overflow="scroll";a=a.offsetWidth;b==a&&(a=c.clientWidth);l.body.removeChild(c);return b-a}function P(a,b){var c,d,g,f,h,e,o=[],m=[],k=j.ext.oSort,r=a.aoData,l=a.aoColumns,p=a.oLanguage.oAria;if(!a.oFeatures.bServerSide&&(0!==a.aaSorting.length||null!==a.aaSortingFixed)){o=null!==a.aaSortingFixed?a.aaSortingFixed.concat(a.aaSorting):a.aaSorting.slice();for(c=0;c<o.length;c++)if(d=o[c][0],g=t(a,d),f=
a.aoColumns[d].sSortDataType,j.ext.afnSortData[f])if(h=j.ext.afnSortData[f].call(a.oInstance,a,d,g),h.length===r.length){g=0;for(f=r.length;g<f;g++)I(a,g,d,h[g])}else E(a,0,"Returned data sort array (col "+d+") is the wrong length");c=0;for(d=a.aiDisplayMaster.length;c<d;c++)m[a.aiDisplayMaster[c]]=c;var q=o.length,G;c=0;for(d=r.length;c<d;c++)for(g=0;g<q;g++){G=l[o[g][0]].aDataSort;h=0;for(e=G.length;h<e;h++)f=l[G[h]].sType,f=k[(f?f:"string")+"-pre"],r[c]._aSortData[G[h]]=f?f(w(a,c,G[h],"sort")):
w(a,c,G[h],"sort")}a.aiDisplayMaster.sort(function(a,b){var c,d,g,f,h;for(c=0;c<q;c++){h=l[o[c][0]].aDataSort;d=0;for(g=h.length;d<g;d++)if(f=l[h[d]].sType,f=k[(f?f:"string")+"-"+o[c][1]](r[a]._aSortData[h[d]],r[b]._aSortData[h[d]]),0!==f)return f}return k["numeric-asc"](m[a],m[b])})}(b===n||b)&&!a.oFeatures.bDeferRender&&Q(a);c=0;for(d=a.aoColumns.length;c<d;c++)f=l[c].sTitle.replace(/<.*?>/g,""),g=l[c].nTh,g.removeAttribute("aria-sort"),g.removeAttribute("aria-label"),l[c].bSortable?0<o.length&&
o[0][0]==c?(g.setAttribute("aria-sort","asc"==o[0][1]?"ascending":"descending"),g.setAttribute("aria-label",f+("asc"==(l[c].asSorting[o[0][2]+1]?l[c].asSorting[o[0][2]+1]:l[c].asSorting[0])?p.sSortAscending:p.sSortDescending))):g.setAttribute("aria-label",f+("asc"==l[c].asSorting[0]?p.sSortAscending:p.sSortDescending)):g.setAttribute("aria-label",f);a.bSorted=!0;i(a.oInstance).trigger("sort",a);a.oFeatures.bFilter?M(a,a.oPreviousSearch,1):(a.aiDisplay=a.aiDisplayMaster.slice(),a._iDisplayStart=0,
A(a),y(a))}function ga(a,b,c,d){Qa(b,{},function(b){if(!1!==a.aoColumns[c].bSortable){var f=function(){var d,f;if(b.shiftKey){for(var e=!1,i=0;i<a.aaSorting.length;i++)if(a.aaSorting[i][0]==c){e=!0;d=a.aaSorting[i][0];f=a.aaSorting[i][2]+1;a.aoColumns[d].asSorting[f]?(a.aaSorting[i][1]=a.aoColumns[d].asSorting[f],a.aaSorting[i][2]=f):a.aaSorting.splice(i,1);break}!1===e&&a.aaSorting.push([c,a.aoColumns[c].asSorting[0],0])}else 1==a.aaSorting.length&&a.aaSorting[0][0]==c?(d=a.aaSorting[0][0],f=a.aaSorting[0][2]+
1,a.aoColumns[d].asSorting[f]||(f=0),a.aaSorting[0][1]=a.aoColumns[d].asSorting[f],a.aaSorting[0][2]=f):(a.aaSorting.splice(0,a.aaSorting.length),a.aaSorting.push([c,a.aoColumns[c].asSorting[0],0]));P(a)};a.oFeatures.bProcessing?(F(a,!0),setTimeout(function(){f();a.oFeatures.bServerSide||F(a,!1)},0)):f();"function"==typeof d&&d(a)}})}function Q(a){var b,c,d,g,f,h=a.aoColumns.length,e=a.oClasses;for(b=0;b<h;b++)a.aoColumns[b].bSortable&&i(a.aoColumns[b].nTh).removeClass(e.sSortAsc+" "+e.sSortDesc+
" "+a.aoColumns[b].sSortingClass);g=null!==a.aaSortingFixed?a.aaSortingFixed.concat(a.aaSorting):a.aaSorting.slice();for(b=0;b<a.aoColumns.length;b++)if(a.aoColumns[b].bSortable){f=a.aoColumns[b].sSortingClass;d=-1;for(c=0;c<g.length;c++)if(g[c][0]==b){f="asc"==g[c][1]?e.sSortAsc:e.sSortDesc;d=c;break}i(a.aoColumns[b].nTh).addClass(f);a.bJUI&&(c=i("span."+e.sSortIcon,a.aoColumns[b].nTh),c.removeClass(e.sSortJUIAsc+" "+e.sSortJUIDesc+" "+e.sSortJUI+" "+e.sSortJUIAscAllowed+" "+e.sSortJUIDescAllowed),
c.addClass(-1==d?a.aoColumns[b].sSortingClassJUI:"asc"==g[d][1]?e.sSortJUIAsc:e.sSortJUIDesc))}else i(a.aoColumns[b].nTh).addClass(a.aoColumns[b].sSortingClass);f=e.sSortColumn;if(a.oFeatures.bSort&&a.oFeatures.bSortClasses){d=L(a);if(a.oFeatures.bDeferRender)i(d).removeClass(f+"1 "+f+"2 "+f+"3");else if(d.length>=h)for(b=0;b<h;b++)if(-1!=d[b].className.indexOf(f+"1")){c=0;for(a=d.length/h;c<a;c++)d[h*c+b].className=i.trim(d[h*c+b].className.replace(f+"1",""))}else if(-1!=d[b].className.indexOf(f+
"2")){c=0;for(a=d.length/h;c<a;c++)d[h*c+b].className=i.trim(d[h*c+b].className.replace(f+"2",""))}else if(-1!=d[b].className.indexOf(f+"3")){c=0;for(a=d.length/h;c<a;c++)d[h*c+b].className=i.trim(d[h*c+b].className.replace(" "+f+"3",""))}var e=1,j;for(b=0;b<g.length;b++){j=parseInt(g[b][0],10);c=0;for(a=d.length/h;c<a;c++)d[h*c+j].className+=" "+f+e;3>e&&e++}}}function qa(a){if(a.oFeatures.bStateSave&&!a.bDestroying){var b,c;b=a.oScroll.bInfinite;var d={iCreate:(new Date).getTime(),iStart:b?0:a._iDisplayStart,
iEnd:b?a._iDisplayLength:a._iDisplayEnd,iLength:a._iDisplayLength,aaSorting:i.extend(!0,[],a.aaSorting),oSearch:i.extend(!0,{},a.oPreviousSearch),aoSearchCols:i.extend(!0,[],a.aoPreSearchCols),abVisCols:[]};b=0;for(c=a.aoColumns.length;b<c;b++)d.abVisCols.push(a.aoColumns[b].bVisible);C(a,"aoStateSaveParams","stateSaveParams",[a,d]);a.fnStateSave.call(a.oInstance,a,d)}}function Ra(a,b){if(a.oFeatures.bStateSave){var c=a.fnStateLoad.call(a.oInstance,a);if(c){var d=C(a,"aoStateLoadParams","stateLoadParams",
[a,c]);if(-1===i.inArray(!1,d)){a.oLoadedState=i.extend(!0,{},c);a._iDisplayStart=c.iStart;a.iInitDisplayStart=c.iStart;a._iDisplayEnd=c.iEnd;a._iDisplayLength=c.iLength;a.aaSorting=c.aaSorting.slice();a.saved_aaSorting=c.aaSorting.slice();i.extend(a.oPreviousSearch,c.oSearch);i.extend(!0,a.aoPreSearchCols,c.aoSearchCols);b.saved_aoColumns=[];for(d=0;d<c.abVisCols.length;d++)b.saved_aoColumns[d]={},b.saved_aoColumns[d].bVisible=c.abVisCols[d];C(a,"aoStateLoaded","stateLoaded",[a,c])}}}}function Sa(a){for(var b=
V.location.pathname.split("/"),a=a+"_"+b[b.length-1].replace(/[\/:]/g,"").toLowerCase()+"=",b=l.cookie.split(";"),c=0;c<b.length;c++){for(var d=b[c];" "==d.charAt(0);)d=d.substring(1,d.length);if(0===d.indexOf(a))return decodeURIComponent(d.substring(a.length,d.length))}return null}function u(a){for(var b=0;b<j.settings.length;b++)if(j.settings[b].nTable===a)return j.settings[b];return null}function S(a){for(var b=[],a=a.aoData,c=0,d=a.length;c<d;c++)null!==a[c].nTr&&b.push(a[c].nTr);return b}function L(a,
b){var c=[],d,g,f,e,i,j;g=0;var o=a.aoData.length;b!==n&&(g=b,o=b+1);for(f=g;f<o;f++)if(j=a.aoData[f],null!==j.nTr){g=[];e=0;for(i=j.nTr.childNodes.length;e<i;e++)d=j.nTr.childNodes[e].nodeName.toLowerCase(),("td"==d||"th"==d)&&g.push(j.nTr.childNodes[e]);e=d=0;for(i=a.aoColumns.length;e<i;e++)a.aoColumns[e].bVisible?c.push(g[e-d]):(c.push(j._anHidden[e]),d++)}return c}function E(a,b,c){a=null===a?"DataTables warning: "+c:"DataTables warning (table id = '"+a.sTableId+"'): "+c;if(0===b)if("alert"==
j.ext.sErrMode)alert(a);else throw Error(a);else V.console&&console.log&&console.log(a)}function p(a,b,c,d){d===n&&(d=c);b[c]!==n&&(a[d]=b[c])}function Ta(a,b){for(var c in b)b.hasOwnProperty(c)&&("object"===typeof e[c]&&!1===i.isArray(b[c])?i.extend(!0,a[c],b[c]):a[c]=b[c]);return a}function Qa(a,b,c){i(a).bind("click.DT",b,function(b){a.blur();c(b)}).bind("keypress.DT",b,function(a){13===a.which&&c(a)}).bind("selectstart.DT",function(){return!1})}function B(a,b,c,d){c&&a[b].push({fn:c,sName:d})}
function C(a,b,c,d){for(var b=a[b],g=[],f=b.length-1;0<=f;f--)g.push(b[f].fn.apply(a.oInstance,d));null!==c&&i(a.oInstance).trigger(c,d);return g}function Ua(a){return function(){var b=[u(this[j.ext.iApiIndex])].concat(Array.prototype.slice.call(arguments));return j.ext.oApi[a].apply(this,b)}}var Va=V.JSON?JSON.stringify:function(a){var b=typeof a;if("object"!==b||null===a)return"string"===b&&(a='"'+a+'"'),a+"";var c,d,g=[],f=i.isArray(a);for(c in a)d=a[c],b=typeof d,"string"===b?d='"'+d+'"':"object"===
b&&null!==d&&(d=Va(d)),g.push((f?"":'"'+c+'":')+d);return(f?"[":"{")+g+(f?"]":"}")};this.$=function(a,b){var c,d,g=[],f;d=u(this[j.ext.iApiIndex]);var e=d.aoData,o=d.aiDisplay,k=d.aiDisplayMaster;b||(b={});b=i.extend({},{filter:"none",order:"current",page:"all"},b);if("current"==b.page){c=d._iDisplayStart;for(d=d.fnDisplayEnd();c<d;c++)(f=e[o[c]].nTr)&&g.push(f)}else if("current"==b.order&&"none"==b.filter){c=0;for(d=k.length;c<d;c++)(f=e[k[c]].nTr)&&g.push(f)}else if("current"==b.order&&"applied"==
b.filter){c=0;for(d=o.length;c<d;c++)(f=e[o[c]].nTr)&&g.push(f)}else if("original"==b.order&&"none"==b.filter){c=0;for(d=e.length;c<d;c++)(f=e[c].nTr)&&g.push(f)}else if("original"==b.order&&"applied"==b.filter){c=0;for(d=e.length;c<d;c++)f=e[c].nTr,-1!==i.inArray(c,o)&&f&&g.push(f)}else E(d,1,"Unknown selection options");g=i(g);c=g.filter(a);g=g.find(a);return i([].concat(i.makeArray(c),i.makeArray(g)))};this._=function(a,b){var c=[],d,g,e=this.$(a,b);d=0;for(g=e.length;d<g;d++)c.push(this.fnGetData(e[d]));
return c};this.fnAddData=function(a,b){if(0===a.length)return[];var c=[],d,g=u(this[j.ext.iApiIndex]);if("object"===typeof a[0]&&null!==a[0])for(var e=0;e<a.length;e++){d=H(g,a[e]);if(-1==d)return c;c.push(d)}else{d=H(g,a);if(-1==d)return c;c.push(d)}g.aiDisplay=g.aiDisplayMaster.slice();(b===n||b)&&$(g);return c};this.fnAdjustColumnSizing=function(a){var b=u(this[j.ext.iApiIndex]);k(b);a===n||a?this.fnDraw(!1):(""!==b.oScroll.sX||""!==b.oScroll.sY)&&this.oApi._fnScrollDraw(b)};this.fnClearTable=
function(a){var b=u(this[j.ext.iApiIndex]);ea(b);(a===n||a)&&y(b)};this.fnClose=function(a){for(var b=u(this[j.ext.iApiIndex]),c=0;c<b.aoOpenRows.length;c++)if(b.aoOpenRows[c].nParent==a)return(a=b.aoOpenRows[c].nTr.parentNode)&&a.removeChild(b.aoOpenRows[c].nTr),b.aoOpenRows.splice(c,1),0;return 1};this.fnDeleteRow=function(a,b,c){var d=u(this[j.ext.iApiIndex]),g,e,a="object"===typeof a?K(d,a):a,h=d.aoData.splice(a,1);g=0;for(e=d.aoData.length;g<e;g++)null!==d.aoData[g].nTr&&(d.aoData[g].nTr._DT_RowIndex=
g);g=i.inArray(a,d.aiDisplay);d.asDataSearch.splice(g,1);fa(d.aiDisplayMaster,a);fa(d.aiDisplay,a);"function"===typeof b&&b.call(this,d,h);d._iDisplayStart>=d.fnRecordsDisplay()&&(d._iDisplayStart-=d._iDisplayLength,0>d._iDisplayStart&&(d._iDisplayStart=0));if(c===n||c)A(d),y(d);return h};this.fnDestroy=function(a){var b=u(this[j.ext.iApiIndex]),c=b.nTableWrapper.parentNode,d=b.nTBody,g,e,a=a===n?!1:!0;b.bDestroying=!0;C(b,"aoDestroyCallback","destroy",[b]);g=0;for(e=b.aoColumns.length;g<e;g++)!1===
b.aoColumns[g].bVisible&&this.fnSetColumnVis(g,!0);i(b.nTableWrapper).find("*").andSelf().unbind(".DT");i("tbody>tr>td."+b.oClasses.sRowEmpty,b.nTable).parent().remove();b.nTable!=b.nTHead.parentNode&&(i(b.nTable).children("thead").remove(),b.nTable.appendChild(b.nTHead));b.nTFoot&&b.nTable!=b.nTFoot.parentNode&&(i(b.nTable).children("tfoot").remove(),b.nTable.appendChild(b.nTFoot));b.nTable.parentNode.removeChild(b.nTable);i(b.nTableWrapper).remove();b.aaSorting=[];b.aaSortingFixed=[];Q(b);i(S(b)).removeClass(b.asStripeClasses.join(" "));
i("th, td",b.nTHead).removeClass([b.oClasses.sSortable,b.oClasses.sSortableAsc,b.oClasses.sSortableDesc,b.oClasses.sSortableNone].join(" "));b.bJUI&&(i("th span."+b.oClasses.sSortIcon+", td span."+b.oClasses.sSortIcon,b.nTHead).remove(),i("th, td",b.nTHead).each(function(){var a=i("div."+b.oClasses.sSortJUIWrapper,this),c=a.contents();i(this).append(c);a.remove()}));!a&&b.nTableReinsertBefore?c.insertBefore(b.nTable,b.nTableReinsertBefore):a||c.appendChild(b.nTable);g=0;for(e=b.aoData.length;g<e;g++)null!==
b.aoData[g].nTr&&d.appendChild(b.aoData[g].nTr);!0===b.oFeatures.bAutoWidth&&(b.nTable.style.width=q(b.sDestroyWidth));i(d).children("tr:even").addClass(b.asDestroyStripes[0]);i(d).children("tr:odd").addClass(b.asDestroyStripes[1]);g=0;for(e=j.settings.length;g<e;g++)j.settings[g]==b&&j.settings.splice(g,1);b=null};this.fnDraw=function(a){var b=u(this[j.ext.iApiIndex]);!1===a?(A(b),y(b)):$(b)};this.fnFilter=function(a,b,c,d,e,f){var h=u(this[j.ext.iApiIndex]);if(h.oFeatures.bFilter){if(c===n||null===
c)c=!1;if(d===n||null===d)d=!0;if(e===n||null===e)e=!0;if(f===n||null===f)f=!0;if(b===n||null===b){if(M(h,{sSearch:a+"",bRegex:c,bSmart:d,bCaseInsensitive:f},1),e&&h.aanFeatures.f){b=h.aanFeatures.f;c=0;for(d=b.length;c<d;c++)i(b[c]._DT_Input).val(a)}}else i.extend(h.aoPreSearchCols[b],{sSearch:a+"",bRegex:c,bSmart:d,bCaseInsensitive:f}),M(h,h.oPreviousSearch,1)}};this.fnGetData=function(a,b){var c=u(this[j.ext.iApiIndex]);if(a!==n){var d=a;if("object"===typeof a){var e=a.nodeName.toLowerCase();"tr"===
e?d=K(c,a):"td"===e&&(d=K(c,a.parentNode),b=da(c,d,a))}return b!==n?w(c,d,b,""):c.aoData[d]!==n?c.aoData[d]._aData:null}return Y(c)};this.fnGetNodes=function(a){var b=u(this[j.ext.iApiIndex]);return a!==n?b.aoData[a]!==n?b.aoData[a].nTr:null:S(b)};this.fnGetPosition=function(a){var b=u(this[j.ext.iApiIndex]),c=a.nodeName.toUpperCase();return"TR"==c?K(b,a):"TD"==c||"TH"==c?(c=K(b,a.parentNode),a=da(b,c,a),[c,t(b,a),a]):null};this.fnIsOpen=function(a){for(var b=u(this[j.ext.iApiIndex]),c=0;c<b.aoOpenRows.length;c++)if(b.aoOpenRows[c].nParent==
a)return!0;return!1};this.fnOpen=function(a,b,c){var d=u(this[j.ext.iApiIndex]),e=S(d);if(-1!==i.inArray(a,e)){this.fnClose(a);var e=l.createElement("tr"),f=l.createElement("td");e.appendChild(f);f.className=c;f.colSpan=v(d);"string"===typeof b?f.innerHTML=b:i(f).html(b);b=i("tr",d.nTBody);-1!=i.inArray(a,b)&&i(e).insertAfter(a);d.aoOpenRows.push({nTr:e,nParent:a});return e}};this.fnPageChange=function(a,b){var c=u(this[j.ext.iApiIndex]);pa(c,a);A(c);(b===n||b)&&y(c)};this.fnSetColumnVis=function(a,
b,c){var d=u(this[j.ext.iApiIndex]),e,f,h=d.aoColumns,i=d.aoData,o,m;if(h[a].bVisible!=b){if(b){for(e=f=0;e<a;e++)h[e].bVisible&&f++;m=f>=v(d);if(!m)for(e=a;e<h.length;e++)if(h[e].bVisible){o=e;break}e=0;for(f=i.length;e<f;e++)null!==i[e].nTr&&(m?i[e].nTr.appendChild(i[e]._anHidden[a]):i[e].nTr.insertBefore(i[e]._anHidden[a],L(d,e)[o]))}else{e=0;for(f=i.length;e<f;e++)null!==i[e].nTr&&(o=L(d,e)[a],i[e]._anHidden[a]=o,o.parentNode.removeChild(o))}h[a].bVisible=b;U(d,d.aoHeader);d.nTFoot&&U(d,d.aoFooter);
e=0;for(f=d.aoOpenRows.length;e<f;e++)d.aoOpenRows[e].nTr.colSpan=v(d);if(c===n||c)k(d),y(d);qa(d)}};this.fnSettings=function(){return u(this[j.ext.iApiIndex])};this.fnSort=function(a){var b=u(this[j.ext.iApiIndex]);b.aaSorting=a;P(b)};this.fnSortListener=function(a,b,c){ga(u(this[j.ext.iApiIndex]),a,b,c)};this.fnUpdate=function(a,b,c,d,e){var f=u(this[j.ext.iApiIndex]),b="object"===typeof b?K(f,b):b;if(f.__fnUpdateDeep===n&&i.isArray(a)&&"object"===typeof a){f.aoData[b]._aData=a.slice();f.__fnUpdateDeep=
!0;for(c=0;c<f.aoColumns.length;c++)this.fnUpdate(w(f,b,c),b,c,!1,!1);f.__fnUpdateDeep=n}else if(f.__fnUpdateDeep===n&&null!==a&&"object"===typeof a){f.aoData[b]._aData=i.extend(!0,{},a);f.__fnUpdateDeep=!0;for(c=0;c<f.aoColumns.length;c++)this.fnUpdate(w(f,b,c),b,c,!1,!1);f.__fnUpdateDeep=n}else{I(f,b,c,a);var a=w(f,b,c,"display"),h=f.aoColumns[c];null!==h.fnRender&&(a=R(f,b,c),h.bUseRendered&&I(f,b,c,a));null!==f.aoData[b].nTr&&(L(f,b)[c].innerHTML=a)}c=i.inArray(b,f.aiDisplay);f.asDataSearch[c]=
ma(f,X(f,b,"filter"));(e===n||e)&&k(f);(d===n||d)&&$(f);return 0};this.fnVersionCheck=j.ext.fnVersionCheck;this.oApi={_fnExternApiFunc:Ua,_fnInitialise:aa,_fnInitComplete:Z,_fnLanguageCompat:oa,_fnAddColumn:o,_fnColumnOptions:r,_fnAddData:H,_fnCreateTr:ca,_fnGatherData:ua,_fnBuildHead:va,_fnDrawHead:U,_fnDraw:y,_fnReDraw:$,_fnAjaxUpdate:wa,_fnAjaxParameters:Ea,_fnAjaxUpdateDraw:Fa,_fnServerParams:ia,_fnAddOptionsHtml:xa,_fnFeatureHtmlTable:Ba,_fnScrollDraw:Ka,_fnAdjustColumnSizing:k,_fnFeatureHtmlFilter:za,
_fnFilterComplete:M,_fnFilterCustom:Ia,_fnFilterColumn:Ha,_fnFilter:Ga,_fnBuildSearchArray:ja,_fnBuildSearchRow:ma,_fnFilterCreateSearch:ka,_fnDataToSearch:la,_fnSort:P,_fnSortAttachListener:ga,_fnSortingClasses:Q,_fnFeatureHtmlPaginate:Da,_fnPageChange:pa,_fnFeatureHtmlInfo:Ca,_fnUpdateInfo:Ja,_fnFeatureHtmlLength:ya,_fnFeatureHtmlProcessing:Aa,_fnProcessingDisplay:F,_fnVisibleToColumnIndex:G,_fnColumnIndexToVisible:t,_fnNodeToDataIndex:K,_fnVisbleColumns:v,_fnCalculateEnd:A,_fnConvertToWidth:La,
_fnCalculateColumnWidths:ba,_fnScrollingWidthAdjust:Na,_fnGetWidestNode:Ma,_fnGetMaxLenString:Oa,_fnStringToCss:q,_fnDetectType:z,_fnSettingsFromNode:u,_fnGetDataMaster:Y,_fnGetTrNodes:S,_fnGetTdNodes:L,_fnEscapeRegex:na,_fnDeleteIndex:fa,_fnReOrderIndex:D,_fnColumnOrdering:x,_fnLog:E,_fnClearTable:ea,_fnSaveState:qa,_fnLoadState:Ra,_fnCreateCookie:function(a,b,c,d,e){var f=new Date;f.setTime(f.getTime()+1E3*c);var c=V.location.pathname.split("/"),a=a+"_"+c.pop().replace(/[\/:]/g,"").toLowerCase(),
h;null!==e?(h="function"===typeof i.parseJSON?i.parseJSON(b):eval("("+b+")"),b=e(a,h,f.toGMTString(),c.join("/")+"/")):b=a+"="+encodeURIComponent(b)+"; expires="+f.toGMTString()+"; path="+c.join("/")+"/";e="";f=9999999999999;if(4096<(null!==Sa(a)?l.cookie.length:b.length+l.cookie.length)+10){for(var a=l.cookie.split(";"),o=0,j=a.length;o<j;o++)if(-1!=a[o].indexOf(d)){var k=a[o].split("=");try{h=eval("("+decodeURIComponent(k[1])+")")}catch(r){continue}h.iCreate&&h.iCreate<f&&(e=k[0],f=h.iCreate)}""!==
e&&(l.cookie=e+"=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path="+c.join("/")+"/")}l.cookie=b},_fnReadCookie:Sa,_fnDetectHeader:T,_fnGetUniqueThs:O,_fnScrollBarWidth:Pa,_fnApplyToChildren:N,_fnMap:p,_fnGetRowData:X,_fnGetCellData:w,_fnSetCellData:I,_fnGetObjectDataFn:W,_fnSetObjectDataFn:ta,_fnApplyColumnDefs:J,_fnBindAction:Qa,_fnExtend:Ta,_fnCallbackReg:B,_fnCallbackFire:C,_fnJsonString:Va,_fnRender:R,_fnNodeToColumnIndex:da,_fnInfoMacros:ha};i.extend(j.ext.oApi,this.oApi);for(var ra in j.ext.oApi)ra&&
(this[ra]=Ua(ra));var sa=this;return this.each(function(){var a=0,b,c,d;c=this.getAttribute("id");var g=!1,f=!1;if("table"!=this.nodeName.toLowerCase())E(null,0,"Attempted to initialise DataTables on a node which is not a table: "+this.nodeName);else{a=0;for(b=j.settings.length;a<b;a++){if(j.settings[a].nTable==this){if(e===n||e.bRetrieve)return j.settings[a].oInstance;if(e.bDestroy){j.settings[a].oInstance.fnDestroy();break}else{E(j.settings[a],0,"Cannot reinitialise DataTable.\n\nTo retrieve the DataTables object for this table, pass no arguments or see the docs for bRetrieve and bDestroy");
return}}if(j.settings[a].sTableId==this.id){j.settings.splice(a,1);break}}if(null===c||""===c)this.id=c="DataTables_Table_"+j.ext._oExternConfig.iNextUnique++;var h=i.extend(!0,{},j.models.oSettings,{nTable:this,oApi:sa.oApi,oInit:e,sDestroyWidth:i(this).width(),sInstance:c,sTableId:c});j.settings.push(h);h.oInstance=1===sa.length?sa:i(this).dataTable();e||(e={});e.oLanguage&&oa(e.oLanguage);e=Ta(i.extend(!0,{},j.defaults),e);p(h.oFeatures,e,"bPaginate");p(h.oFeatures,e,"bLengthChange");p(h.oFeatures,
e,"bFilter");p(h.oFeatures,e,"bSort");p(h.oFeatures,e,"bInfo");p(h.oFeatures,e,"bProcessing");p(h.oFeatures,e,"bAutoWidth");p(h.oFeatures,e,"bSortClasses");p(h.oFeatures,e,"bServerSide");p(h.oFeatures,e,"bDeferRender");p(h.oScroll,e,"sScrollX","sX");p(h.oScroll,e,"sScrollXInner","sXInner");p(h.oScroll,e,"sScrollY","sY");p(h.oScroll,e,"bScrollCollapse","bCollapse");p(h.oScroll,e,"bScrollInfinite","bInfinite");p(h.oScroll,e,"iScrollLoadGap","iLoadGap");p(h.oScroll,e,"bScrollAutoCss","bAutoCss");p(h,
e,"asStripeClasses");p(h,e,"asStripClasses","asStripeClasses");p(h,e,"fnServerData");p(h,e,"fnFormatNumber");p(h,e,"sServerMethod");p(h,e,"aaSorting");p(h,e,"aaSortingFixed");p(h,e,"aLengthMenu");p(h,e,"sPaginationType");p(h,e,"sAjaxSource");p(h,e,"sAjaxDataProp");p(h,e,"iCookieDuration");p(h,e,"sCookiePrefix");p(h,e,"sDom");p(h,e,"bSortCellsTop");p(h,e,"iTabIndex");p(h,e,"oSearch","oPreviousSearch");p(h,e,"aoSearchCols","aoPreSearchCols");p(h,e,"iDisplayLength","_iDisplayLength");p(h,e,"bJQueryUI",
"bJUI");p(h,e,"fnCookieCallback");p(h,e,"fnStateLoad");p(h,e,"fnStateSave");p(h.oLanguage,e,"fnInfoCallback");B(h,"aoDrawCallback",e.fnDrawCallback,"user");B(h,"aoServerParams",e.fnServerParams,"user");B(h,"aoStateSaveParams",e.fnStateSaveParams,"user");B(h,"aoStateLoadParams",e.fnStateLoadParams,"user");B(h,"aoStateLoaded",e.fnStateLoaded,"user");B(h,"aoRowCallback",e.fnRowCallback,"user");B(h,"aoRowCreatedCallback",e.fnCreatedRow,"user");B(h,"aoHeaderCallback",e.fnHeaderCallback,"user");B(h,"aoFooterCallback",
e.fnFooterCallback,"user");B(h,"aoInitComplete",e.fnInitComplete,"user");B(h,"aoPreDrawCallback",e.fnPreDrawCallback,"user");h.oFeatures.bServerSide&&h.oFeatures.bSort&&h.oFeatures.bSortClasses?B(h,"aoDrawCallback",Q,"server_side_sort_classes"):h.oFeatures.bDeferRender&&B(h,"aoDrawCallback",Q,"defer_sort_classes");e.bJQueryUI?(i.extend(h.oClasses,j.ext.oJUIClasses),e.sDom===j.defaults.sDom&&"lfrtip"===j.defaults.sDom&&(h.sDom='<"H"lfr>t<"F"ip>')):i.extend(h.oClasses,j.ext.oStdClasses);i(this).addClass(h.oClasses.sTable);
if(""!==h.oScroll.sX||""!==h.oScroll.sY)h.oScroll.iBarWidth=Pa();h.iInitDisplayStart===n&&(h.iInitDisplayStart=e.iDisplayStart,h._iDisplayStart=e.iDisplayStart);e.bStateSave&&(h.oFeatures.bStateSave=!0,Ra(h,e),B(h,"aoDrawCallback",qa,"state_save"));null!==e.iDeferLoading&&(h.bDeferLoading=!0,a=i.isArray(e.iDeferLoading),h._iRecordsDisplay=a?e.iDeferLoading[0]:e.iDeferLoading,h._iRecordsTotal=a?e.iDeferLoading[1]:e.iDeferLoading);null!==e.aaData&&(f=!0);""!==e.oLanguage.sUrl?(h.oLanguage.sUrl=e.oLanguage.sUrl,
i.getJSON(h.oLanguage.sUrl,null,function(a){oa(a);i.extend(true,h.oLanguage,e.oLanguage,a);aa(h)}),g=!0):i.extend(!0,h.oLanguage,e.oLanguage);null===e.asStripeClasses&&(h.asStripeClasses=[h.oClasses.sStripeOdd,h.oClasses.sStripeEven]);c=!1;d=i(this).children("tbody").children("tr");a=0;for(b=h.asStripeClasses.length;a<b;a++)if(d.filter(":lt(2)").hasClass(h.asStripeClasses[a])){c=!0;break}c&&(h.asDestroyStripes=["",""],i(d[0]).hasClass(h.oClasses.sStripeOdd)&&(h.asDestroyStripes[0]+=h.oClasses.sStripeOdd+
" "),i(d[0]).hasClass(h.oClasses.sStripeEven)&&(h.asDestroyStripes[0]+=h.oClasses.sStripeEven),i(d[1]).hasClass(h.oClasses.sStripeOdd)&&(h.asDestroyStripes[1]+=h.oClasses.sStripeOdd+" "),i(d[1]).hasClass(h.oClasses.sStripeEven)&&(h.asDestroyStripes[1]+=h.oClasses.sStripeEven),d.removeClass(h.asStripeClasses.join(" ")));c=[];a=this.getElementsByTagName("thead");0!==a.length&&(T(h.aoHeader,a[0]),c=O(h));if(null===e.aoColumns){d=[];a=0;for(b=c.length;a<b;a++)d.push(null)}else d=e.aoColumns;a=0;for(b=
d.length;a<b;a++)e.saved_aoColumns!==n&&e.saved_aoColumns.length==b&&(null===d[a]&&(d[a]={}),d[a].bVisible=e.saved_aoColumns[a].bVisible),o(h,c?c[a]:null);J(h,e.aoColumnDefs,d,function(a,b){r(h,a,b)});a=0;for(b=h.aaSorting.length;a<b;a++){h.aaSorting[a][0]>=h.aoColumns.length&&(h.aaSorting[a][0]=0);var k=h.aoColumns[h.aaSorting[a][0]];h.aaSorting[a][2]===n&&(h.aaSorting[a][2]=0);e.aaSorting===n&&h.saved_aaSorting===n&&(h.aaSorting[a][1]=k.asSorting[0]);c=0;for(d=k.asSorting.length;c<d;c++)if(h.aaSorting[a][1]==
k.asSorting[c]){h.aaSorting[a][2]=c;break}}Q(h);a=i(this).children("caption").each(function(){this._captionSide=i(this).css("caption-side")});b=i(this).children("thead");0===b.length&&(b=[l.createElement("thead")],this.appendChild(b[0]));h.nTHead=b[0];b=i(this).children("tbody");0===b.length&&(b=[l.createElement("tbody")],this.appendChild(b[0]));h.nTBody=b[0];h.nTBody.setAttribute("role","alert");h.nTBody.setAttribute("aria-live","polite");h.nTBody.setAttribute("aria-relevant","all");b=i(this).children("tfoot");
if(0===b.length&&0<a.length&&(""!==h.oScroll.sX||""!==h.oScroll.sY))b=[l.createElement("tfoot")],this.appendChild(b[0]);0<b.length&&(h.nTFoot=b[0],T(h.aoFooter,h.nTFoot));if(f)for(a=0;a<e.aaData.length;a++)H(h,e.aaData[a]);else ua(h);h.aiDisplay=h.aiDisplayMaster.slice();h.bInitialised=!0;!1===g&&aa(h)}})};j.fnVersionCheck=function(e){for(var i=function(e,i){for(;e.length<i;)e+="0";return e},r=j.ext.sVersion.split("."),e=e.split("."),k="",n="",l=0,v=e.length;l<v;l++)k+=i(r[l],3),n+=i(e[l],3);return parseInt(k,
10)>=parseInt(n,10)};j.fnIsDataTable=function(e){for(var i=j.settings,r=0;r<i.length;r++)if(i[r].nTable===e||i[r].nScrollHead===e||i[r].nScrollFoot===e)return!0;return!1};j.fnTables=function(e){var o=[];jQuery.each(j.settings,function(j,k){(!e||!0===e&&i(k.nTable).is(":visible"))&&o.push(k.nTable)});return o};j.version="1.9.2";j.settings=[];j.models={};j.models.ext={afnFiltering:[],afnSortData:[],aoFeatures:[],aTypes:[],fnVersionCheck:j.fnVersionCheck,iApiIndex:0,ofnSearch:{},oApi:{},oStdClasses:{},
oJUIClasses:{},oPagination:{},oSort:{},sVersion:j.version,sErrMode:"alert",_oExternConfig:{iNextUnique:0}};j.models.oSearch={bCaseInsensitive:!0,sSearch:"",bRegex:!1,bSmart:!0};j.models.oRow={nTr:null,_aData:[],_aSortData:[],_anHidden:[],_sRowStripe:""};j.models.oColumn={aDataSort:null,asSorting:null,bSearchable:null,bSortable:null,bUseRendered:null,bVisible:null,_bAutoType:!0,fnCreatedCell:null,fnGetData:null,fnRender:null,fnSetData:null,mDataProp:null,nTh:null,nTf:null,sClass:null,sContentPadding:null,
sDefaultContent:null,sName:null,sSortDataType:"std",sSortingClass:null,sSortingClassJUI:null,sTitle:null,sType:null,sWidth:null,sWidthOrig:null};j.defaults={aaData:null,aaSorting:[[0,"asc"]],aaSortingFixed:null,aLengthMenu:[10,25,50,100],aoColumns:null,aoColumnDefs:null,aoSearchCols:[],asStripeClasses:null,bAutoWidth:!0,bDeferRender:!1,bDestroy:!1,bFilter:!0,bInfo:!0,bJQueryUI:!1,bLengthChange:!0,bPaginate:!0,bProcessing:!1,bRetrieve:!1,bScrollAutoCss:!0,bScrollCollapse:!1,bScrollInfinite:!1,bServerSide:!1,
bSort:!0,bSortCellsTop:!1,bSortClasses:!0,bStateSave:!1,fnCookieCallback:null,fnCreatedRow:null,fnDrawCallback:null,fnFooterCallback:null,fnFormatNumber:function(e){if(1E3>e)return e;for(var i=e+"",e=i.split(""),j="",i=i.length,k=0;k<i;k++)0===k%3&&0!==k&&(j=this.oLanguage.sInfoThousands+j),j=e[i-k-1]+j;return j},fnHeaderCallback:null,fnInfoCallback:null,fnInitComplete:null,fnPreDrawCallback:null,fnRowCallback:null,fnServerData:function(e,j,n,k){k.jqXHR=i.ajax({url:e,data:j,success:function(e){i(k.oInstance).trigger("xhr",
k);n(e)},dataType:"json",cache:!1,type:k.sServerMethod,error:function(e,i){"parsererror"==i&&k.oApi._fnLog(k,0,"DataTables warning: JSON data from server could not be parsed. This is caused by a JSON formatting error.")}})},fnServerParams:null,fnStateLoad:function(e){var e=this.oApi._fnReadCookie(e.sCookiePrefix+e.sInstance),j;try{j="function"===typeof i.parseJSON?i.parseJSON(e):eval("("+e+")")}catch(n){j=null}return j},fnStateLoadParams:null,fnStateLoaded:null,fnStateSave:function(e,i){this.oApi._fnCreateCookie(e.sCookiePrefix+
e.sInstance,this.oApi._fnJsonString(i),e.iCookieDuration,e.sCookiePrefix,e.fnCookieCallback)},fnStateSaveParams:null,iCookieDuration:7200,iDeferLoading:null,iDisplayLength:10,iDisplayStart:0,iScrollLoadGap:100,iTabIndex:0,oLanguage:{oAria:{sSortAscending:": activate to sort column ascending",sSortDescending:": activate to sort column descending"},oPaginate:{sFirst:"First",sLast:"Last",sNext:"Next",sPrevious:"Previous"},sEmptyTable:"No data available in table",sInfo:"Showing _START_ to _END_ of _TOTAL_ entries",
sInfoEmpty:"Showing 0 to 0 of 0 entries",sInfoFiltered:"(filtered from _MAX_ total entries)",sInfoPostFix:"",sInfoThousands:",",sLengthMenu:"Show _MENU_ entries",sLoadingRecords:"Loading...",sProcessing:"Processing...",sSearch:"Search:",sUrl:"",sZeroRecords:"No matching records found"},oSearch:i.extend({},j.models.oSearch),sAjaxDataProp:"aaData",sAjaxSource:null,sCookiePrefix:"SpryMedia_DataTables_",sDom:"lfrtip",sPaginationType:"two_button",sScrollX:"",sScrollXInner:"",sScrollY:"",sServerMethod:"GET"};
j.defaults.columns={aDataSort:null,asSorting:["asc","desc"],bSearchable:!0,bSortable:!0,bUseRendered:!0,bVisible:!0,fnCreatedCell:null,fnRender:null,iDataSort:-1,mDataProp:null,sCellType:"td",sClass:"",sContentPadding:"",sDefaultContent:null,sName:"",sSortDataType:"std",sTitle:null,sType:null,sWidth:null};j.models.oSettings={oFeatures:{bAutoWidth:null,bDeferRender:null,bFilter:null,bInfo:null,bLengthChange:null,bPaginate:null,bProcessing:null,bServerSide:null,bSort:null,bSortClasses:null,bStateSave:null},
oScroll:{bAutoCss:null,bCollapse:null,bInfinite:null,iBarWidth:0,iLoadGap:null,sX:null,sXInner:null,sY:null},oLanguage:{fnInfoCallback:null},aanFeatures:[],aoData:[],aiDisplay:[],aiDisplayMaster:[],aoColumns:[],aoHeader:[],aoFooter:[],asDataSearch:[],oPreviousSearch:{},aoPreSearchCols:[],aaSorting:null,aaSortingFixed:null,asStripeClasses:null,asDestroyStripes:[],sDestroyWidth:0,aoRowCallback:[],aoHeaderCallback:[],aoFooterCallback:[],aoDrawCallback:[],aoRowCreatedCallback:[],aoPreDrawCallback:[],
aoInitComplete:[],aoStateSaveParams:[],aoStateLoadParams:[],aoStateLoaded:[],sTableId:"",nTable:null,nTHead:null,nTFoot:null,nTBody:null,nTableWrapper:null,bDeferLoading:!1,bInitialised:!1,aoOpenRows:[],sDom:null,sPaginationType:"two_button",iCookieDuration:0,sCookiePrefix:"",fnCookieCallback:null,aoStateSave:[],aoStateLoad:[],oLoadedState:null,sAjaxSource:null,sAjaxDataProp:null,bAjaxDataGet:!0,jqXHR:null,fnServerData:null,aoServerParams:[],sServerMethod:null,fnFormatNumber:null,aLengthMenu:null,
iDraw:0,bDrawing:!1,iDrawError:-1,_iDisplayLength:10,_iDisplayStart:0,_iDisplayEnd:10,_iRecordsTotal:0,_iRecordsDisplay:0,bJUI:null,oClasses:{},bFiltered:!1,bSorted:!1,bSortCellsTop:null,oInit:null,aoDestroyCallback:[],fnRecordsTotal:function(){return this.oFeatures.bServerSide?parseInt(this._iRecordsTotal,10):this.aiDisplayMaster.length},fnRecordsDisplay:function(){return this.oFeatures.bServerSide?parseInt(this._iRecordsDisplay,10):this.aiDisplay.length},fnDisplayEnd:function(){return this.oFeatures.bServerSide?
!1===this.oFeatures.bPaginate||-1==this._iDisplayLength?this._iDisplayStart+this.aiDisplay.length:Math.min(this._iDisplayStart+this._iDisplayLength,this._iRecordsDisplay):this._iDisplayEnd},oInstance:null,sInstance:null,iTabIndex:0,nScrollHead:null,nScrollFoot:null};j.ext=i.extend(!0,{},j.models.ext);i.extend(j.ext.oStdClasses,{sTable:"dataTable",sPagePrevEnabled:"paginate_enabled_previous",sPagePrevDisabled:"paginate_disabled_previous",sPageNextEnabled:"paginate_enabled_next",sPageNextDisabled:"paginate_disabled_next",
sPageJUINext:"",sPageJUIPrev:"",sPageButton:"paginate_button",sPageButtonActive:"paginate_active",sPageButtonStaticDisabled:"paginate_button paginate_button_disabled",sPageFirst:"first",sPagePrevious:"previous",sPageNext:"next",sPageLast:"last",sStripeOdd:"odd",sStripeEven:"even",sRowEmpty:"dataTables_empty",sWrapper:"dataTables_wrapper",sFilter:"dataTables_filter",sInfo:"dataTables_info",sPaging:"dataTables_paginate paging_",sLength:"dataTables_length",sProcessing:"dataTables_processing",sSortAsc:"sorting_asc",
sSortDesc:"sorting_desc",sSortable:"sorting",sSortableAsc:"sorting_asc_disabled",sSortableDesc:"sorting_desc_disabled",sSortableNone:"sorting_disabled",sSortColumn:"sorting_",sSortJUIAsc:"",sSortJUIDesc:"",sSortJUI:"",sSortJUIAscAllowed:"",sSortJUIDescAllowed:"",sSortJUIWrapper:"",sSortIcon:"",sScrollWrapper:"dataTables_scroll",sScrollHead:"dataTables_scrollHead",sScrollHeadInner:"dataTables_scrollHeadInner",sScrollBody:"dataTables_scrollBody",sScrollFoot:"dataTables_scrollFoot",sScrollFootInner:"dataTables_scrollFootInner",
sFooterTH:"",sJUIHeader:"",sJUIFooter:""});i.extend(j.ext.oJUIClasses,j.ext.oStdClasses,{sPagePrevEnabled:"fg-button ui-button ui-state-default ui-corner-left",sPagePrevDisabled:"fg-button ui-button ui-state-default ui-corner-left ui-state-disabled",sPageNextEnabled:"fg-button ui-button ui-state-default ui-corner-right",sPageNextDisabled:"fg-button ui-button ui-state-default ui-corner-right ui-state-disabled",sPageJUINext:"ui-icon ui-icon-circle-arrow-e",sPageJUIPrev:"ui-icon ui-icon-circle-arrow-w",
sPageButton:"fg-button ui-button ui-state-default",sPageButtonActive:"fg-button ui-button ui-state-default ui-state-disabled",sPageButtonStaticDisabled:"fg-button ui-button ui-state-default ui-state-disabled",sPageFirst:"first ui-corner-tl ui-corner-bl",sPageLast:"last ui-corner-tr ui-corner-br",sPaging:"dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi ui-buttonset-multi paging_",sSortAsc:"ui-state-default",sSortDesc:"ui-state-default",sSortable:"ui-state-default",sSortableAsc:"ui-state-default",
sSortableDesc:"ui-state-default",sSortableNone:"ui-state-default",sSortJUIAsc:"css_right ui-icon ui-icon-triangle-1-n",sSortJUIDesc:"css_right ui-icon ui-icon-triangle-1-s",sSortJUI:"css_right ui-icon ui-icon-carat-2-n-s",sSortJUIAscAllowed:"css_right ui-icon ui-icon-carat-1-n",sSortJUIDescAllowed:"css_right ui-icon ui-icon-carat-1-s",sSortJUIWrapper:"DataTables_sort_wrapper",sSortIcon:"DataTables_sort_icon",sScrollHead:"dataTables_scrollHead ui-state-default",sScrollFoot:"dataTables_scrollFoot ui-state-default",
sFooterTH:"ui-state-default",sJUIHeader:"fg-toolbar ui-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix",sJUIFooter:"fg-toolbar ui-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix"});i.extend(j.ext.oPagination,{two_button:{fnInit:function(e,j,n){var k=e.oLanguage.oPaginate,l=function(i){e.oApi._fnPageChange(e,i.data.action)&&n(e)},k=!e.bJUI?'<a class="'+e.oClasses.sPagePrevDisabled+'" tabindex="'+e.iTabIndex+'" role="button">'+k.sPrevious+'</a><a class="'+
e.oClasses.sPageNextDisabled+'" tabindex="'+e.iTabIndex+'" role="button">'+k.sNext+"</a>":'<a class="'+e.oClasses.sPagePrevDisabled+'" tabindex="'+e.iTabIndex+'" role="button"><span class="'+e.oClasses.sPageJUIPrev+'"></span></a><a class="'+e.oClasses.sPageNextDisabled+'" tabindex="'+e.iTabIndex+'" role="button"><span class="'+e.oClasses.sPageJUINext+'"></span></a>';i(j).append(k);var t=i("a",j),k=t[0],t=t[1];e.oApi._fnBindAction(k,{action:"previous"},l);e.oApi._fnBindAction(t,{action:"next"},l);
e.aanFeatures.p||(j.id=e.sTableId+"_paginate",k.id=e.sTableId+"_previous",t.id=e.sTableId+"_next",k.setAttribute("aria-controls",e.sTableId),t.setAttribute("aria-controls",e.sTableId))},fnUpdate:function(e){if(e.aanFeatures.p)for(var i=e.oClasses,j=e.aanFeatures.p,k=0,n=j.length;k<n;k++)0!==j[k].childNodes.length&&(j[k].childNodes[0].className=0===e._iDisplayStart?i.sPagePrevDisabled:i.sPagePrevEnabled,j[k].childNodes[1].className=e.fnDisplayEnd()==e.fnRecordsDisplay()?i.sPageNextDisabled:i.sPageNextEnabled)}},
iFullNumbersShowPages:5,full_numbers:{fnInit:function(e,j,n){var k=e.oLanguage.oPaginate,l=e.oClasses,t=function(i){e.oApi._fnPageChange(e,i.data.action)&&n(e)};i(j).append('<a  tabindex="'+e.iTabIndex+'" class="'+l.sPageButton+" "+l.sPageFirst+'">'+k.sFirst+'</a><a  tabindex="'+e.iTabIndex+'" class="'+l.sPageButton+" "+l.sPagePrevious+'">'+k.sPrevious+'</a><span></span><a tabindex="'+e.iTabIndex+'" class="'+l.sPageButton+" "+l.sPageNext+'">'+k.sNext+'</a><a tabindex="'+e.iTabIndex+'" class="'+l.sPageButton+
" "+l.sPageLast+'">'+k.sLast+"</a>");var v=i("a",j),k=v[0],l=v[1],z=v[2],v=v[3];e.oApi._fnBindAction(k,{action:"first"},t);e.oApi._fnBindAction(l,{action:"previous"},t);e.oApi._fnBindAction(z,{action:"next"},t);e.oApi._fnBindAction(v,{action:"last"},t);e.aanFeatures.p||(j.id=e.sTableId+"_paginate",k.id=e.sTableId+"_first",l.id=e.sTableId+"_previous",z.id=e.sTableId+"_next",v.id=e.sTableId+"_last")},fnUpdate:function(e,o){if(e.aanFeatures.p){var l=j.ext.oPagination.iFullNumbersShowPages,k=Math.floor(l/
2),n=Math.ceil(e.fnRecordsDisplay()/e._iDisplayLength),t=Math.ceil(e._iDisplayStart/e._iDisplayLength)+1,v="",z,D=e.oClasses,x,J=e.aanFeatures.p,H=function(i){e.oApi._fnBindAction(this,{page:i+z-1},function(i){e.oApi._fnPageChange(e,i.data.page);o(e);i.preventDefault()})};-1===e._iDisplayLength?t=k=z=1:n<l?(z=1,k=n):t<=k?(z=1,k=l):t>=n-k?(z=n-l+1,k=n):(z=t-Math.ceil(l/2)+1,k=z+l-1);for(l=z;l<=k;l++)v+=t!==l?'<a tabindex="'+e.iTabIndex+'" class="'+D.sPageButton+'">'+e.fnFormatNumber(l)+"</a>":'<a tabindex="'+
e.iTabIndex+'" class="'+D.sPageButtonActive+'">'+e.fnFormatNumber(l)+"</a>";l=0;for(k=J.length;l<k;l++)0!==J[l].childNodes.length&&(i("span:eq(0)",J[l]).html(v).children("a").each(H),x=J[l].getElementsByTagName("a"),x=[x[0],x[1],x[x.length-2],x[x.length-1]],i(x).removeClass(D.sPageButton+" "+D.sPageButtonActive+" "+D.sPageButtonStaticDisabled),i([x[0],x[1]]).addClass(1==t?D.sPageButtonStaticDisabled:D.sPageButton),i([x[2],x[3]]).addClass(0===n||t===n||-1===e._iDisplayLength?D.sPageButtonStaticDisabled:
D.sPageButton))}}}});i.extend(j.ext.oSort,{"string-pre":function(e){"string"!=typeof e&&(e=null!==e&&e.toString?e.toString():"");return e.toLowerCase()},"string-asc":function(e,i){return e<i?-1:e>i?1:0},"string-desc":function(e,i){return e<i?1:e>i?-1:0},"html-pre":function(e){return e.replace(/<.*?>/g,"").toLowerCase()},"html-asc":function(e,i){return e<i?-1:e>i?1:0},"html-desc":function(e,i){return e<i?1:e>i?-1:0},"date-pre":function(e){e=Date.parse(e);if(isNaN(e)||""===e)e=Date.parse("01/01/1970 00:00:00");
return e},"date-asc":function(e,i){return e-i},"date-desc":function(e,i){return i-e},"numeric-pre":function(e){return"-"==e||""===e?0:1*e},"numeric-asc":function(e,i){return e-i},"numeric-desc":function(e,i){return i-e}});i.extend(j.ext.aTypes,[function(e){if("number"===typeof e)return"numeric";if("string"!==typeof e)return null;var i,j=!1;i=e.charAt(0);if(-1=="0123456789-".indexOf(i))return null;for(var k=1;k<e.length;k++){i=e.charAt(k);if(-1=="0123456789.".indexOf(i))return null;if("."==i){if(j)return null;
j=!0}}return"numeric"},function(e){var i=Date.parse(e);return null!==i&&!isNaN(i)||"string"===typeof e&&0===e.length?"date":null},function(e){return"string"===typeof e&&-1!=e.indexOf("<")&&-1!=e.indexOf(">")?"html":null}]);i.fn.DataTable=j;i.fn.dataTable=j;i.fn.dataTableSettings=j.settings;i.fn.dataTableExt=j.ext})(jQuery,window,document,void 0);

// Copyright 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// Known Issues:
//
// * Patterns only support repeat.
// * Radial gradient are not implemented. The VML version of these look very
//   different from the canvas one.
// * Clipping paths are not implemented.
// * Coordsize. The width and height attribute have higher priority than the
//   width and height style values which isn't correct.
// * Painting mode isn't implemented.
// * Canvas width/height should is using content-box by default. IE in
//   Quirks mode will draw the canvas using border-box. Either change your
//   doctype to HTML5
//   (http://www.whatwg.org/specs/web-apps/current-work/#the-doctype)
//   or use Box Sizing Behavior from WebFX
//   (http://webfx.eae.net/dhtml/boxsizing/boxsizing.html)
// * Non uniform scaling does not correctly scale strokes.
// * Filling very large shapes (above 5000 points) is buggy.
// * Optimize. There is always room for speed improvements.

// Only add this code if we do not already have a canvas implementation
if (!document.createElement('canvas').getContext) {

(function() {

  // alias some functions to make (compiled) code shorter
  var m = Math;
  var mr = m.round;
  var ms = m.sin;
  var mc = m.cos;
  var abs = m.abs;
  var sqrt = m.sqrt;

  // this is used for sub pixel precision
  var Z = 10;
  var Z2 = Z / 2;

  /**
   * This funtion is assigned to the <canvas> elements as element.getContext().
   * @this {HTMLElement}
   * @return {CanvasRenderingContext2D_}
   */
  function getContext() {
    return this.context_ ||
        (this.context_ = new CanvasRenderingContext2D_(this));
  }

  var slice = Array.prototype.slice;

  /**
   * Binds a function to an object. The returned function will always use the
   * passed in {@code obj} as {@code this}.
   *
   * Example:
   *
   *   g = bind(f, obj, a, b)
   *   g(c, d) // will do f.call(obj, a, b, c, d)
   *
   * @param {Function} f The function to bind the object to
   * @param {Object} obj The object that should act as this when the function
   *     is called
   * @param {*} var_args Rest arguments that will be used as the initial
   *     arguments when the function is called
   * @return {Function} A new function that has bound this
   */
  function bind(f, obj, var_args) {
    var a = slice.call(arguments, 2);
    return function() {
      return f.apply(obj, a.concat(slice.call(arguments)));
    };
  }

  function encodeHtmlAttribute(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  function addNamespacesAndStylesheet(doc) {
    // create xmlns
    if (!doc.namespaces['g_vml_']) {
      doc.namespaces.add('g_vml_', 'urn:schemas-microsoft-com:vml',
                         '#default#VML');

    }
    if (!doc.namespaces['g_o_']) {
      doc.namespaces.add('g_o_', 'urn:schemas-microsoft-com:office:office',
                         '#default#VML');
    }

    // Setup default CSS.  Only add one style sheet per document
    if (!doc.styleSheets['ex_canvas_']) {
      var ss = doc.createStyleSheet();
      ss.owningElement.id = 'ex_canvas_';
      ss.cssText = 'canvas{display:inline-block;overflow:hidden;' +
          // default size is 300x150 in Gecko and Opera
          'text-align:left;width:300px;height:150px}';
    }
  }

  // Add namespaces and stylesheet at startup.
  addNamespacesAndStylesheet(document);

  var G_vmlCanvasManager_ = {
    init: function(opt_doc) {
      if (/MSIE/.test(navigator.userAgent) && !window.opera) {
        var doc = opt_doc || document;
        // Create a dummy element so that IE will allow canvas elements to be
        // recognized.
        doc.createElement('canvas');
        doc.attachEvent('onreadystatechange', bind(this.init_, this, doc));
      }
    },

    init_: function(doc) {
      // find all canvas elements
      var els = doc.getElementsByTagName('canvas');
      for (var i = 0; i < els.length; i++) {
        this.initElement(els[i]);
      }
    },

    /**
     * Public initializes a canvas element so that it can be used as canvas
     * element from now on. This is called automatically before the page is
     * loaded but if you are creating elements using createElement you need to
     * make sure this is called on the element.
     * @param {HTMLElement} el The canvas element to initialize.
     * @return {HTMLElement} the element that was created.
     */
    initElement: function(el) {
      if (!el.getContext) {
        el.getContext = getContext;

        // Add namespaces and stylesheet to document of the element.
        addNamespacesAndStylesheet(el.ownerDocument);

        // Remove fallback content. There is no way to hide text nodes so we
        // just remove all childNodes. We could hide all elements and remove
        // text nodes but who really cares about the fallback content.
        el.innerHTML = '';

        // do not use inline function because that will leak memory
        el.attachEvent('onpropertychange', onPropertyChange);
        el.attachEvent('onresize', onResize);

        var attrs = el.attributes;
        if (attrs.width && attrs.width.specified) {
          // TODO: use runtimeStyle and coordsize
          // el.getContext().setWidth_(attrs.width.nodeValue);
          el.style.width = attrs.width.nodeValue + 'px';
        } else {
          el.width = el.clientWidth;
        }
        if (attrs.height && attrs.height.specified) {
          // TODO: use runtimeStyle and coordsize
          // el.getContext().setHeight_(attrs.height.nodeValue);
          el.style.height = attrs.height.nodeValue + 'px';
        } else {
          el.height = el.clientHeight;
        }
        //el.getContext().setCoordsize_()
      }
      return el;
    }
  };

  function onPropertyChange(e) {
    var el = e.srcElement;

    switch (e.propertyName) {
      case 'width':
        el.getContext().clearRect();
        el.style.width = el.attributes.width.nodeValue + 'px';
        // In IE8 this does not trigger onresize.
        el.firstChild.style.width =  el.clientWidth + 'px';
        break;
      case 'height':
        el.getContext().clearRect();
        el.style.height = el.attributes.height.nodeValue + 'px';
        el.firstChild.style.height = el.clientHeight + 'px';
        break;
    }
  }

  function onResize(e) {
    var el = e.srcElement;
    if (el.firstChild) {
      el.firstChild.style.width =  el.clientWidth + 'px';
      el.firstChild.style.height = el.clientHeight + 'px';
    }
  }

  G_vmlCanvasManager_.init();

  // precompute "00" to "FF"
  var decToHex = [];
  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < 16; j++) {
      decToHex[i * 16 + j] = i.toString(16) + j.toString(16);
    }
  }

  function createMatrixIdentity() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  function matrixMultiply(m1, m2) {
    var result = createMatrixIdentity();

    for (var x = 0; x < 3; x++) {
      for (var y = 0; y < 3; y++) {
        var sum = 0;

        for (var z = 0; z < 3; z++) {
          sum += m1[x][z] * m2[z][y];
        }

        result[x][y] = sum;
      }
    }
    return result;
  }

  function copyState(o1, o2) {
    o2.fillStyle     = o1.fillStyle;
    o2.lineCap       = o1.lineCap;
    o2.lineJoin      = o1.lineJoin;
    o2.lineWidth     = o1.lineWidth;
    o2.miterLimit    = o1.miterLimit;
    o2.shadowBlur    = o1.shadowBlur;
    o2.shadowColor   = o1.shadowColor;
    o2.shadowOffsetX = o1.shadowOffsetX;
    o2.shadowOffsetY = o1.shadowOffsetY;
    o2.strokeStyle   = o1.strokeStyle;
    o2.globalAlpha   = o1.globalAlpha;
    o2.font          = o1.font;
    o2.textAlign     = o1.textAlign;
    o2.textBaseline  = o1.textBaseline;
    o2.arcScaleX_    = o1.arcScaleX_;
    o2.arcScaleY_    = o1.arcScaleY_;
    o2.lineScale_    = o1.lineScale_;
  }

  var colorData = {
    aliceblue: '#F0F8FF',
    antiquewhite: '#FAEBD7',
    aquamarine: '#7FFFD4',
    azure: '#F0FFFF',
    beige: '#F5F5DC',
    bisque: '#FFE4C4',
    black: '#000000',
    blanchedalmond: '#FFEBCD',
    blueviolet: '#8A2BE2',
    brown: '#A52A2A',
    burlywood: '#DEB887',
    cadetblue: '#5F9EA0',
    chartreuse: '#7FFF00',
    chocolate: '#D2691E',
    coral: '#FF7F50',
    cornflowerblue: '#6495ED',
    cornsilk: '#FFF8DC',
    crimson: '#DC143C',
    cyan: '#00FFFF',
    darkblue: '#00008B',
    darkcyan: '#008B8B',
    darkgoldenrod: '#B8860B',
    darkgray: '#A9A9A9',
    darkgreen: '#006400',
    darkgrey: '#A9A9A9',
    darkkhaki: '#BDB76B',
    darkmagenta: '#8B008B',
    darkolivegreen: '#556B2F',
    darkorange: '#FF8C00',
    darkorchid: '#9932CC',
    darkred: '#8B0000',
    darksalmon: '#E9967A',
    darkseagreen: '#8FBC8F',
    darkslateblue: '#483D8B',
    darkslategray: '#2F4F4F',
    darkslategrey: '#2F4F4F',
    darkturquoise: '#00CED1',
    darkviolet: '#9400D3',
    deeppink: '#FF1493',
    deepskyblue: '#00BFFF',
    dimgray: '#696969',
    dimgrey: '#696969',
    dodgerblue: '#1E90FF',
    firebrick: '#B22222',
    floralwhite: '#FFFAF0',
    forestgreen: '#228B22',
    gainsboro: '#DCDCDC',
    ghostwhite: '#F8F8FF',
    gold: '#FFD700',
    goldenrod: '#DAA520',
    grey: '#808080',
    greenyellow: '#ADFF2F',
    honeydew: '#F0FFF0',
    hotpink: '#FF69B4',
    indianred: '#CD5C5C',
    indigo: '#4B0082',
    ivory: '#FFFFF0',
    khaki: '#F0E68C',
    lavender: '#E6E6FA',
    lavenderblush: '#FFF0F5',
    lawngreen: '#7CFC00',
    lemonchiffon: '#FFFACD',
    lightblue: '#ADD8E6',
    lightcoral: '#F08080',
    lightcyan: '#E0FFFF',
    lightgoldenrodyellow: '#FAFAD2',
    lightgreen: '#90EE90',
    lightgrey: '#D3D3D3',
    lightpink: '#FFB6C1',
    lightsalmon: '#FFA07A',
    lightseagreen: '#20B2AA',
    lightskyblue: '#87CEFA',
    lightslategray: '#778899',
    lightslategrey: '#778899',
    lightsteelblue: '#B0C4DE',
    lightyellow: '#FFFFE0',
    limegreen: '#32CD32',
    linen: '#FAF0E6',
    magenta: '#FF00FF',
    mediumaquamarine: '#66CDAA',
    mediumblue: '#0000CD',
    mediumorchid: '#BA55D3',
    mediumpurple: '#9370DB',
    mediumseagreen: '#3CB371',
    mediumslateblue: '#7B68EE',
    mediumspringgreen: '#00FA9A',
    mediumturquoise: '#48D1CC',
    mediumvioletred: '#C71585',
    midnightblue: '#191970',
    mintcream: '#F5FFFA',
    mistyrose: '#FFE4E1',
    moccasin: '#FFE4B5',
    navajowhite: '#FFDEAD',
    oldlace: '#FDF5E6',
    olivedrab: '#6B8E23',
    orange: '#FFA500',
    orangered: '#FF4500',
    orchid: '#DA70D6',
    palegoldenrod: '#EEE8AA',
    palegreen: '#98FB98',
    paleturquoise: '#AFEEEE',
    palevioletred: '#DB7093',
    papayawhip: '#FFEFD5',
    peachpuff: '#FFDAB9',
    peru: '#CD853F',
    pink: '#FFC0CB',
    plum: '#DDA0DD',
    powderblue: '#B0E0E6',
    rosybrown: '#BC8F8F',
    royalblue: '#4169E1',
    saddlebrown: '#8B4513',
    salmon: '#FA8072',
    sandybrown: '#F4A460',
    seagreen: '#2E8B57',
    seashell: '#FFF5EE',
    sienna: '#A0522D',
    skyblue: '#87CEEB',
    slateblue: '#6A5ACD',
    slategray: '#708090',
    slategrey: '#708090',
    snow: '#FFFAFA',
    springgreen: '#00FF7F',
    steelblue: '#4682B4',
    tan: '#D2B48C',
    thistle: '#D8BFD8',
    tomato: '#FF6347',
    turquoise: '#40E0D0',
    violet: '#EE82EE',
    wheat: '#F5DEB3',
    whitesmoke: '#F5F5F5',
    yellowgreen: '#9ACD32'
  };


  function getRgbHslContent(styleString) {
    var start = styleString.indexOf('(', 3);
    var end = styleString.indexOf(')', start + 1);
    var parts = styleString.substring(start + 1, end).split(',');
    // add alpha if needed
    if (parts.length == 4 && styleString.substr(3, 1) == 'a') {
      alpha = Number(parts[3]);
    } else {
      parts[3] = 1;
    }
    return parts;
  }

  function percent(s) {
    return parseFloat(s) / 100;
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function hslToRgb(parts){
    var r, g, b;
    h = parseFloat(parts[0]) / 360 % 360;
    if (h < 0)
      h++;
    s = clamp(percent(parts[1]), 0, 1);
    l = clamp(percent(parts[2]), 0, 1);
    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hueToRgb(p, q, h + 1 / 3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1 / 3);
    }

    return '#' + decToHex[Math.floor(r * 255)] +
        decToHex[Math.floor(g * 255)] +
        decToHex[Math.floor(b * 255)];
  }

  function hueToRgb(m1, m2, h) {
    if (h < 0)
      h++;
    if (h > 1)
      h--;

    if (6 * h < 1)
      return m1 + (m2 - m1) * 6 * h;
    else if (2 * h < 1)
      return m2;
    else if (3 * h < 2)
      return m1 + (m2 - m1) * (2 / 3 - h) * 6;
    else
      return m1;
  }

  function processStyle(styleString) {
    var str, alpha = 1;

    styleString = String(styleString);
    if (styleString.charAt(0) == '#') {
      str = styleString;
    } else if (/^rgb/.test(styleString)) {
      var parts = getRgbHslContent(styleString);
      var str = '#', n;
      for (var i = 0; i < 3; i++) {
        if (parts[i].indexOf('%') != -1) {
          n = Math.floor(percent(parts[i]) * 255);
        } else {
          n = Number(parts[i]);
        }
        str += decToHex[clamp(n, 0, 255)];
      }
      alpha = parts[3];
    } else if (/^hsl/.test(styleString)) {
      var parts = getRgbHslContent(styleString);
      str = hslToRgb(parts);
      alpha = parts[3];
    } else {
      str = colorData[styleString] || styleString;
    }
    return {color: str, alpha: alpha};
  }

  var DEFAULT_STYLE = {
    style: 'normal',
    variant: 'normal',
    weight: 'normal',
    size: 10,
    family: 'sans-serif'
  };

  // Internal text style cache
  var fontStyleCache = {};

  function processFontStyle(styleString) {
    if (fontStyleCache[styleString]) {
      return fontStyleCache[styleString];
    }

    var el = document.createElement('div');
    var style = el.style;
    try {
      style.font = styleString;
    } catch (ex) {
      // Ignore failures to set to invalid font.
    }

    return fontStyleCache[styleString] = {
      style: style.fontStyle || DEFAULT_STYLE.style,
      variant: style.fontVariant || DEFAULT_STYLE.variant,
      weight: style.fontWeight || DEFAULT_STYLE.weight,
      size: style.fontSize || DEFAULT_STYLE.size,
      family: style.fontFamily || DEFAULT_STYLE.family
    };
  }

  function getComputedStyle(style, element) {
    var computedStyle = {};

    for (var p in style) {
      computedStyle[p] = style[p];
    }

    // Compute the size
    var canvasFontSize = parseFloat(element.currentStyle.fontSize),
        fontSize = parseFloat(style.size);

    if (typeof style.size == 'number') {
      computedStyle.size = style.size;
    } else if (style.size.indexOf('px') != -1) {
      computedStyle.size = fontSize;
    } else if (style.size.indexOf('em') != -1) {
      computedStyle.size = canvasFontSize * fontSize;
    } else if(style.size.indexOf('%') != -1) {
      computedStyle.size = (canvasFontSize / 100) * fontSize;
    } else if (style.size.indexOf('pt') != -1) {
      computedStyle.size = fontSize / .75;
    } else {
      computedStyle.size = canvasFontSize;
    }

    // Different scaling between normal text and VML text. This was found using
    // trial and error to get the same size as non VML text.
    computedStyle.size *= 0.981;

    return computedStyle;
  }

  function buildStyle(style) {
    return style.style + ' ' + style.variant + ' ' + style.weight + ' ' +
        style.size + 'px ' + style.family;
  }

  function processLineCap(lineCap) {
    switch (lineCap) {
      case 'butt':
        return 'flat';
      case 'round':
        return 'round';
      case 'square':
      default:
        return 'square';
    }
  }

  /**
   * This class implements CanvasRenderingContext2D interface as described by
   * the WHATWG.
   * @param {HTMLElement} surfaceElement The element that the 2D context should
   * be associated with
   */
  function CanvasRenderingContext2D_(surfaceElement) {
    this.m_ = createMatrixIdentity();

    this.mStack_ = [];
    this.aStack_ = [];
    this.currentPath_ = [];

    // Canvas context properties
    this.strokeStyle = '#000';
    this.fillStyle = '#000';

    this.lineWidth = 1;
    this.lineJoin = 'miter';
    this.lineCap = 'butt';
    this.miterLimit = Z * 1;
    this.globalAlpha = 1;
    this.font = '10px sans-serif';
    this.textAlign = 'left';
    this.textBaseline = 'alphabetic';
    this.canvas = surfaceElement;

    var el = surfaceElement.ownerDocument.createElement('div');
    el.style.width =  surfaceElement.clientWidth + 'px';
    el.style.height = surfaceElement.clientHeight + 'px';
    el.style.overflow = 'hidden';
    el.style.position = 'absolute';
    surfaceElement.appendChild(el);

    this.element_ = el;
    this.arcScaleX_ = 1;
    this.arcScaleY_ = 1;
    this.lineScale_ = 1;
  }

  var contextPrototype = CanvasRenderingContext2D_.prototype;
  contextPrototype.clearRect = function() {
    if (this.textMeasureEl_) {
      this.textMeasureEl_.removeNode(true);
      this.textMeasureEl_ = null;
    }
    this.element_.innerHTML = '';
  };

  contextPrototype.beginPath = function() {
    // TODO: Branch current matrix so that save/restore has no effect
    //       as per safari docs.
    this.currentPath_ = [];
  };

  contextPrototype.moveTo = function(aX, aY) {
    var p = this.getCoords_(aX, aY);
    this.currentPath_.push({type: 'moveTo', x: p.x, y: p.y});
    this.currentX_ = p.x;
    this.currentY_ = p.y;
  };

  contextPrototype.lineTo = function(aX, aY) {
    var p = this.getCoords_(aX, aY);
    this.currentPath_.push({type: 'lineTo', x: p.x, y: p.y});

    this.currentX_ = p.x;
    this.currentY_ = p.y;
  };

  contextPrototype.bezierCurveTo = function(aCP1x, aCP1y,
                                            aCP2x, aCP2y,
                                            aX, aY) {
    var p = this.getCoords_(aX, aY);
    var cp1 = this.getCoords_(aCP1x, aCP1y);
    var cp2 = this.getCoords_(aCP2x, aCP2y);
    bezierCurveTo(this, cp1, cp2, p);
  };

  // Helper function that takes the already fixed cordinates.
  function bezierCurveTo(self, cp1, cp2, p) {
    self.currentPath_.push({
      type: 'bezierCurveTo',
      cp1x: cp1.x,
      cp1y: cp1.y,
      cp2x: cp2.x,
      cp2y: cp2.y,
      x: p.x,
      y: p.y
    });
    self.currentX_ = p.x;
    self.currentY_ = p.y;
  }

  contextPrototype.quadraticCurveTo = function(aCPx, aCPy, aX, aY) {
    // the following is lifted almost directly from
    // http://developer.mozilla.org/en/docs/Canvas_tutorial:Drawing_shapes

    var cp = this.getCoords_(aCPx, aCPy);
    var p = this.getCoords_(aX, aY);

    var cp1 = {
      x: this.currentX_ + 2.0 / 3.0 * (cp.x - this.currentX_),
      y: this.currentY_ + 2.0 / 3.0 * (cp.y - this.currentY_)
    };
    var cp2 = {
      x: cp1.x + (p.x - this.currentX_) / 3.0,
      y: cp1.y + (p.y - this.currentY_) / 3.0
    };

    bezierCurveTo(this, cp1, cp2, p);
  };

  contextPrototype.arc = function(aX, aY, aRadius,
                                  aStartAngle, aEndAngle, aClockwise) {
    aRadius *= Z;
    var arcType = aClockwise ? 'at' : 'wa';

    var xStart = aX + mc(aStartAngle) * aRadius - Z2;
    var yStart = aY + ms(aStartAngle) * aRadius - Z2;

    var xEnd = aX + mc(aEndAngle) * aRadius - Z2;
    var yEnd = aY + ms(aEndAngle) * aRadius - Z2;

    // IE won't render arches drawn counter clockwise if xStart == xEnd.
    if (xStart == xEnd && !aClockwise) {
      xStart += 0.125; // Offset xStart by 1/80 of a pixel. Use something
                       // that can be represented in binary
    }

    var p = this.getCoords_(aX, aY);
    var pStart = this.getCoords_(xStart, yStart);
    var pEnd = this.getCoords_(xEnd, yEnd);

    this.currentPath_.push({type: arcType,
                           x: p.x,
                           y: p.y,
                           radius: aRadius,
                           xStart: pStart.x,
                           yStart: pStart.y,
                           xEnd: pEnd.x,
                           yEnd: pEnd.y});

  };

  contextPrototype.rect = function(aX, aY, aWidth, aHeight) {
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
  };

  contextPrototype.strokeRect = function(aX, aY, aWidth, aHeight) {
    var oldPath = this.currentPath_;
    this.beginPath();

    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.stroke();

    this.currentPath_ = oldPath;
  };

  contextPrototype.fillRect = function(aX, aY, aWidth, aHeight) {
    var oldPath = this.currentPath_;
    this.beginPath();

    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.fill();

    this.currentPath_ = oldPath;
  };

  contextPrototype.createLinearGradient = function(aX0, aY0, aX1, aY1) {
    var gradient = new CanvasGradient_('gradient');
    gradient.x0_ = aX0;
    gradient.y0_ = aY0;
    gradient.x1_ = aX1;
    gradient.y1_ = aY1;
    return gradient;
  };

  contextPrototype.createRadialGradient = function(aX0, aY0, aR0,
                                                   aX1, aY1, aR1) {
    var gradient = new CanvasGradient_('gradientradial');
    gradient.x0_ = aX0;
    gradient.y0_ = aY0;
    gradient.r0_ = aR0;
    gradient.x1_ = aX1;
    gradient.y1_ = aY1;
    gradient.r1_ = aR1;
    return gradient;
  };

  contextPrototype.drawImage = function(image, var_args) {
    var dx, dy, dw, dh, sx, sy, sw, sh;

    // to find the original width we overide the width and height
    var oldRuntimeWidth = image.runtimeStyle.width;
    var oldRuntimeHeight = image.runtimeStyle.height;
    image.runtimeStyle.width = 'auto';
    image.runtimeStyle.height = 'auto';

    // get the original size
    var w = image.width;
    var h = image.height;

    // and remove overides
    image.runtimeStyle.width = oldRuntimeWidth;
    image.runtimeStyle.height = oldRuntimeHeight;

    if (arguments.length == 3) {
      dx = arguments[1];
      dy = arguments[2];
      sx = sy = 0;
      sw = dw = w;
      sh = dh = h;
    } else if (arguments.length == 5) {
      dx = arguments[1];
      dy = arguments[2];
      dw = arguments[3];
      dh = arguments[4];
      sx = sy = 0;
      sw = w;
      sh = h;
    } else if (arguments.length == 9) {
      sx = arguments[1];
      sy = arguments[2];
      sw = arguments[3];
      sh = arguments[4];
      dx = arguments[5];
      dy = arguments[6];
      dw = arguments[7];
      dh = arguments[8];
    } else {
      throw Error('Invalid number of arguments');
    }

    var d = this.getCoords_(dx, dy);

    var w2 = sw / 2;
    var h2 = sh / 2;

    var vmlStr = [];

    var W = 10;
    var H = 10;

    // For some reason that I've now forgotten, using divs didn't work
    vmlStr.push(' <g_vml_:group',
                ' coordsize="', Z * W, ',', Z * H, '"',
                ' coordorigin="0,0"' ,
                ' style="width:', W, 'px;height:', H, 'px;position:absolute;');

    // If filters are necessary (rotation exists), create them
    // filters are bog-slow, so only create them if abbsolutely necessary
    // The following check doesn't account for skews (which don't exist
    // in the canvas spec (yet) anyway.

    if (this.m_[0][0] != 1 || this.m_[0][1] ||
        this.m_[1][1] != 1 || this.m_[1][0]) {
      var filter = [];

      // Note the 12/21 reversal
      filter.push('M11=', this.m_[0][0], ',',
                  'M12=', this.m_[1][0], ',',
                  'M21=', this.m_[0][1], ',',
                  'M22=', this.m_[1][1], ',',
                  'Dx=', mr(d.x / Z), ',',
                  'Dy=', mr(d.y / Z), '');

      // Bounding box calculation (need to minimize displayed area so that
      // filters don't waste time on unused pixels.
      var max = d;
      var c2 = this.getCoords_(dx + dw, dy);
      var c3 = this.getCoords_(dx, dy + dh);
      var c4 = this.getCoords_(dx + dw, dy + dh);

      max.x = m.max(max.x, c2.x, c3.x, c4.x);
      max.y = m.max(max.y, c2.y, c3.y, c4.y);

      vmlStr.push('padding:0 ', mr(max.x / Z), 'px ', mr(max.y / Z),
                  'px 0;filter:progid:DXImageTransform.Microsoft.Matrix(',
                  filter.join(''), ", sizingmethod='clip');");

    } else {
      vmlStr.push('top:', mr(d.y / Z), 'px;left:', mr(d.x / Z), 'px;');
    }

    vmlStr.push(' ">' ,
                '<g_vml_:image src="', image.src, '"',
                ' style="width:', Z * dw, 'px;',
                ' height:', Z * dh, 'px"',
                ' cropleft="', sx / w, '"',
                ' croptop="', sy / h, '"',
                ' cropright="', (w - sx - sw) / w, '"',
                ' cropbottom="', (h - sy - sh) / h, '"',
                ' />',
                '</g_vml_:group>');

    this.element_.insertAdjacentHTML('BeforeEnd', vmlStr.join(''));
  };

  contextPrototype.stroke = function(aFill) {
    var W = 10;
    var H = 10;
    // Divide the shape into chunks if it's too long because IE has a limit
    // somewhere for how long a VML shape can be. This simple division does
    // not work with fills, only strokes, unfortunately.
    var chunkSize = 5000;

    var min = {x: null, y: null};
    var max = {x: null, y: null};

    for (var j = 0; j < this.currentPath_.length; j += chunkSize) {
      var lineStr = [];
      var lineOpen = false;

      lineStr.push('<g_vml_:shape',
                   ' filled="', !!aFill, '"',
                   ' style="position:absolute;width:', W, 'px;height:', H, 'px;"',
                   ' coordorigin="0,0"',
                   ' coordsize="', Z * W, ',', Z * H, '"',
                   ' stroked="', !aFill, '"',
                   ' path="');

      var newSeq = false;

      for (var i = j; i < Math.min(j + chunkSize, this.currentPath_.length); i++) {
        if (i % chunkSize == 0 && i > 0) { // move into position for next chunk
          lineStr.push(' m ', mr(this.currentPath_[i-1].x), ',', mr(this.currentPath_[i-1].y));
        }

        var p = this.currentPath_[i];
        var c;

        switch (p.type) {
          case 'moveTo':
            c = p;
            lineStr.push(' m ', mr(p.x), ',', mr(p.y));
            break;
          case 'lineTo':
            lineStr.push(' l ', mr(p.x), ',', mr(p.y));
            break;
          case 'close':
            lineStr.push(' x ');
            p = null;
            break;
          case 'bezierCurveTo':
            lineStr.push(' c ',
                         mr(p.cp1x), ',', mr(p.cp1y), ',',
                         mr(p.cp2x), ',', mr(p.cp2y), ',',
                         mr(p.x), ',', mr(p.y));
            break;
          case 'at':
          case 'wa':
            lineStr.push(' ', p.type, ' ',
                         mr(p.x - this.arcScaleX_ * p.radius), ',',
                         mr(p.y - this.arcScaleY_ * p.radius), ' ',
                         mr(p.x + this.arcScaleX_ * p.radius), ',',
                         mr(p.y + this.arcScaleY_ * p.radius), ' ',
                         mr(p.xStart), ',', mr(p.yStart), ' ',
                         mr(p.xEnd), ',', mr(p.yEnd));
            break;
        }
  
  
        // TODO: Following is broken for curves due to
        //       move to proper paths.
  
        // Figure out dimensions so we can do gradient fills
        // properly
        if (p) {
          if (min.x == null || p.x < min.x) {
            min.x = p.x;
          }
          if (max.x == null || p.x > max.x) {
            max.x = p.x;
          }
          if (min.y == null || p.y < min.y) {
            min.y = p.y;
          }
          if (max.y == null || p.y > max.y) {
            max.y = p.y;
          }
        }
      }
      lineStr.push(' ">');
  
      if (!aFill) {
        appendStroke(this, lineStr);
      } else {
        appendFill(this, lineStr, min, max);
      }
  
      lineStr.push('</g_vml_:shape>');
  
      this.element_.insertAdjacentHTML('beforeEnd', lineStr.join(''));
    }
  };

  function appendStroke(ctx, lineStr) {
    var a = processStyle(ctx.strokeStyle);
    var color = a.color;
    var opacity = a.alpha * ctx.globalAlpha;
    var lineWidth = ctx.lineScale_ * ctx.lineWidth;

    // VML cannot correctly render a line if the width is less than 1px.
    // In that case, we dilute the color to make the line look thinner.
    if (lineWidth < 1) {
      opacity *= lineWidth;
    }

    lineStr.push(
      '<g_vml_:stroke',
      ' opacity="', opacity, '"',
      ' joinstyle="', ctx.lineJoin, '"',
      ' miterlimit="', ctx.miterLimit, '"',
      ' endcap="', processLineCap(ctx.lineCap), '"',
      ' weight="', lineWidth, 'px"',
      ' color="', color, '" />'
    );
  }

  function appendFill(ctx, lineStr, min, max) {
    var fillStyle = ctx.fillStyle;
    var arcScaleX = ctx.arcScaleX_;
    var arcScaleY = ctx.arcScaleY_;
    var width = max.x - min.x;
    var height = max.y - min.y;
    if (fillStyle instanceof CanvasGradient_) {
      // TODO: Gradients transformed with the transformation matrix.
      var angle = 0;
      var focus = {x: 0, y: 0};

      // additional offset
      var shift = 0;
      // scale factor for offset
      var expansion = 1;

      if (fillStyle.type_ == 'gradient') {
        var x0 = fillStyle.x0_ / arcScaleX;
        var y0 = fillStyle.y0_ / arcScaleY;
        var x1 = fillStyle.x1_ / arcScaleX;
        var y1 = fillStyle.y1_ / arcScaleY;
        var p0 = ctx.getCoords_(x0, y0);
        var p1 = ctx.getCoords_(x1, y1);
        var dx = p1.x - p0.x;
        var dy = p1.y - p0.y;
        angle = Math.atan2(dx, dy) * 180 / Math.PI;

        // The angle should be a non-negative number.
        if (angle < 0) {
          angle += 360;
        }

        // Very small angles produce an unexpected result because they are
        // converted to a scientific notation string.
        if (angle < 1e-6) {
          angle = 0;
        }
      } else {
        var p0 = ctx.getCoords_(fillStyle.x0_, fillStyle.y0_);
        focus = {
          x: (p0.x - min.x) / width,
          y: (p0.y - min.y) / height
        };

        width  /= arcScaleX * Z;
        height /= arcScaleY * Z;
        var dimension = m.max(width, height);
        shift = 2 * fillStyle.r0_ / dimension;
        expansion = 2 * fillStyle.r1_ / dimension - shift;
      }

      // We need to sort the color stops in ascending order by offset,
      // otherwise IE won't interpret it correctly.
      var stops = fillStyle.colors_;
      stops.sort(function(cs1, cs2) {
        return cs1.offset - cs2.offset;
      });

      var length = stops.length;
      var color1 = stops[0].color;
      var color2 = stops[length - 1].color;
      var opacity1 = stops[0].alpha * ctx.globalAlpha;
      var opacity2 = stops[length - 1].alpha * ctx.globalAlpha;

      var colors = [];
      for (var i = 0; i < length; i++) {
        var stop = stops[i];
        colors.push(stop.offset * expansion + shift + ' ' + stop.color);
      }

      // When colors attribute is used, the meanings of opacity and o:opacity2
      // are reversed.
      lineStr.push('<g_vml_:fill type="', fillStyle.type_, '"',
                   ' method="none" focus="100%"',
                   ' color="', color1, '"',
                   ' color2="', color2, '"',
                   ' colors="', colors.join(','), '"',
                   ' opacity="', opacity2, '"',
                   ' g_o_:opacity2="', opacity1, '"',
                   ' angle="', angle, '"',
                   ' focusposition="', focus.x, ',', focus.y, '" />');
    } else if (fillStyle instanceof CanvasPattern_) {
      if (width && height) {
        var deltaLeft = -min.x;
        var deltaTop = -min.y;
        lineStr.push('<g_vml_:fill',
                     ' position="',
                     deltaLeft / width * arcScaleX * arcScaleX, ',',
                     deltaTop / height * arcScaleY * arcScaleY, '"',
                     ' type="tile"',
                     // TODO: Figure out the correct size to fit the scale.
                     //' size="', w, 'px ', h, 'px"',
                     ' src="', fillStyle.src_, '" />');
       }
    } else {
      var a = processStyle(ctx.fillStyle);
      var color = a.color;
      var opacity = a.alpha * ctx.globalAlpha;
      lineStr.push('<g_vml_:fill color="', color, '" opacity="', opacity,
                   '" />');
    }
  }

  contextPrototype.fill = function() {
    this.stroke(true);
  };

  contextPrototype.closePath = function() {
    this.currentPath_.push({type: 'close'});
  };

  /**
   * @private
   */
  contextPrototype.getCoords_ = function(aX, aY) {
    var m = this.m_;
    return {
      x: Z * (aX * m[0][0] + aY * m[1][0] + m[2][0]) - Z2,
      y: Z * (aX * m[0][1] + aY * m[1][1] + m[2][1]) - Z2
    };
  };

  contextPrototype.save = function() {
    var o = {};
    copyState(this, o);
    this.aStack_.push(o);
    this.mStack_.push(this.m_);
    this.m_ = matrixMultiply(createMatrixIdentity(), this.m_);
  };

  contextPrototype.restore = function() {
    if (this.aStack_.length) {
      copyState(this.aStack_.pop(), this);
      this.m_ = this.mStack_.pop();
    }
  };

  function matrixIsFinite(m) {
    return isFinite(m[0][0]) && isFinite(m[0][1]) &&
        isFinite(m[1][0]) && isFinite(m[1][1]) &&
        isFinite(m[2][0]) && isFinite(m[2][1]);
  }

  function setM(ctx, m, updateLineScale) {
    if (!matrixIsFinite(m)) {
      return;
    }
    ctx.m_ = m;

    if (updateLineScale) {
      // Get the line scale.
      // Determinant of this.m_ means how much the area is enlarged by the
      // transformation. So its square root can be used as a scale factor
      // for width.
      var det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
      ctx.lineScale_ = sqrt(abs(det));
    }
  }

  contextPrototype.translate = function(aX, aY) {
    var m1 = [
      [1,  0,  0],
      [0,  1,  0],
      [aX, aY, 1]
    ];

    setM(this, matrixMultiply(m1, this.m_), false);
  };

  contextPrototype.rotate = function(aRot) {
    var c = mc(aRot);
    var s = ms(aRot);

    var m1 = [
      [c,  s, 0],
      [-s, c, 0],
      [0,  0, 1]
    ];

    setM(this, matrixMultiply(m1, this.m_), false);
  };

  contextPrototype.scale = function(aX, aY) {
    this.arcScaleX_ *= aX;
    this.arcScaleY_ *= aY;
    var m1 = [
      [aX, 0,  0],
      [0,  aY, 0],
      [0,  0,  1]
    ];

    setM(this, matrixMultiply(m1, this.m_), true);
  };

  contextPrototype.transform = function(m11, m12, m21, m22, dx, dy) {
    var m1 = [
      [m11, m12, 0],
      [m21, m22, 0],
      [dx,  dy,  1]
    ];

    setM(this, matrixMultiply(m1, this.m_), true);
  };

  contextPrototype.setTransform = function(m11, m12, m21, m22, dx, dy) {
    var m = [
      [m11, m12, 0],
      [m21, m22, 0],
      [dx,  dy,  1]
    ];

    setM(this, m, true);
  };

  /**
   * The text drawing function.
   * The maxWidth argument isn't taken in account, since no browser supports
   * it yet.
   */
  contextPrototype.drawText_ = function(text, x, y, maxWidth, stroke) {
    var m = this.m_,
        delta = 1000,
        left = 0,
        right = delta,
        offset = {x: 0, y: 0},
        lineStr = [];

    var fontStyle = getComputedStyle(processFontStyle(this.font),
                                     this.element_);

    var fontStyleString = buildStyle(fontStyle);

    var elementStyle = this.element_.currentStyle;
    var textAlign = this.textAlign.toLowerCase();
    switch (textAlign) {
      case 'left':
      case 'center':
      case 'right':
        break;
      case 'end':
        textAlign = elementStyle.direction == 'ltr' ? 'right' : 'left';
        break;
      case 'start':
        textAlign = elementStyle.direction == 'rtl' ? 'right' : 'left';
        break;
      default:
        textAlign = 'left';
    }

    // 1.75 is an arbitrary number, as there is no info about the text baseline
    switch (this.textBaseline) {
      case 'hanging':
      case 'top':
        offset.y = fontStyle.size / 1.75;
        break;
      case 'middle':
        break;
      default:
      case null:
      case 'alphabetic':
      case 'ideographic':
      case 'bottom':
        offset.y = -fontStyle.size / 2.25;
        break;
    }

    switch(textAlign) {
      case 'right':
        left = delta;
        right = 0.05;
        break;
      case 'center':
        left = right = delta / 2;
        break;
    }

    var d = this.getCoords_(x + offset.x, y + offset.y);

    lineStr.push('<g_vml_:line from="', -left ,' 0" to="', right ,' 0.05" ',
                 ' coordsize="100 100" coordorigin="0 0"',
                 ' filled="', !stroke, '" stroked="', !!stroke,
                 '" style="position:absolute;width:1px;height:1px;">');

    if (stroke) {
      appendStroke(this, lineStr);
    } else {
      // TODO: Fix the min and max params.
      appendFill(this, lineStr, {x: -left, y: 0},
                 {x: right, y: fontStyle.size});
    }

    var skewM = m[0][0].toFixed(3) + ',' + m[1][0].toFixed(3) + ',' +
                m[0][1].toFixed(3) + ',' + m[1][1].toFixed(3) + ',0,0';

    var skewOffset = mr(d.x / Z) + ',' + mr(d.y / Z);

    lineStr.push('<g_vml_:skew on="t" matrix="', skewM ,'" ',
                 ' offset="', skewOffset, '" origin="', left ,' 0" />',
                 '<g_vml_:path textpathok="true" />',
                 '<g_vml_:textpath on="true" string="',
                 encodeHtmlAttribute(text),
                 '" style="v-text-align:', textAlign,
                 ';font:', encodeHtmlAttribute(fontStyleString),
                 '" /></g_vml_:line>');

    this.element_.insertAdjacentHTML('beforeEnd', lineStr.join(''));
  };

  contextPrototype.fillText = function(text, x, y, maxWidth) {
    this.drawText_(text, x, y, maxWidth, false);
  };

  contextPrototype.strokeText = function(text, x, y, maxWidth) {
    this.drawText_(text, x, y, maxWidth, true);
  };

  contextPrototype.measureText = function(text) {
    if (!this.textMeasureEl_) {
      var s = '<span style="position:absolute;' +
          'top:-20000px;left:0;padding:0;margin:0;border:none;' +
          'white-space:pre;"></span>';
      this.element_.insertAdjacentHTML('beforeEnd', s);
      this.textMeasureEl_ = this.element_.lastChild;
    }
    var doc = this.element_.ownerDocument;
    this.textMeasureEl_.innerHTML = '';
    this.textMeasureEl_.style.font = this.font;
    // Don't use innerHTML or innerText because they allow markup/whitespace.
    this.textMeasureEl_.appendChild(doc.createTextNode(text));
    return {width: this.textMeasureEl_.offsetWidth};
  };

  /******** STUBS ********/
  contextPrototype.clip = function() {
    // TODO: Implement
  };

  contextPrototype.arcTo = function() {
    // TODO: Implement
  };

  contextPrototype.createPattern = function(image, repetition) {
    return new CanvasPattern_(image, repetition);
  };

  // Gradient / Pattern Stubs
  function CanvasGradient_(aType) {
    this.type_ = aType;
    this.x0_ = 0;
    this.y0_ = 0;
    this.r0_ = 0;
    this.x1_ = 0;
    this.y1_ = 0;
    this.r1_ = 0;
    this.colors_ = [];
  }

  CanvasGradient_.prototype.addColorStop = function(aOffset, aColor) {
    aColor = processStyle(aColor);
    this.colors_.push({offset: aOffset,
                       color: aColor.color,
                       alpha: aColor.alpha});
  };

  function CanvasPattern_(image, repetition) {
    assertImageIsValid(image);
    switch (repetition) {
      case 'repeat':
      case null:
      case '':
        this.repetition_ = 'repeat';
        break
      case 'repeat-x':
      case 'repeat-y':
      case 'no-repeat':
        this.repetition_ = repetition;
        break;
      default:
        throwException('SYNTAX_ERR');
    }

    this.src_ = image.src;
    this.width_ = image.width;
    this.height_ = image.height;
  }

  function throwException(s) {
    throw new DOMException_(s);
  }

  function assertImageIsValid(img) {
    if (!img || img.nodeType != 1 || img.tagName != 'IMG') {
      throwException('TYPE_MISMATCH_ERR');
    }
    if (img.readyState != 'complete') {
      throwException('INVALID_STATE_ERR');
    }
  }

  function DOMException_(s) {
    this.code = this[s];
    this.message = s +': DOM Exception ' + this.code;
  }
  var p = DOMException_.prototype = new Error;
  p.INDEX_SIZE_ERR = 1;
  p.DOMSTRING_SIZE_ERR = 2;
  p.HIERARCHY_REQUEST_ERR = 3;
  p.WRONG_DOCUMENT_ERR = 4;
  p.INVALID_CHARACTER_ERR = 5;
  p.NO_DATA_ALLOWED_ERR = 6;
  p.NO_MODIFICATION_ALLOWED_ERR = 7;
  p.NOT_FOUND_ERR = 8;
  p.NOT_SUPPORTED_ERR = 9;
  p.INUSE_ATTRIBUTE_ERR = 10;
  p.INVALID_STATE_ERR = 11;
  p.SYNTAX_ERR = 12;
  p.INVALID_MODIFICATION_ERR = 13;
  p.NAMESPACE_ERR = 14;
  p.INVALID_ACCESS_ERR = 15;
  p.VALIDATION_ERR = 16;
  p.TYPE_MISMATCH_ERR = 17;

  // set up externs
  G_vmlCanvasManager = G_vmlCanvasManager_;
  CanvasRenderingContext2D = CanvasRenderingContext2D_;
  CanvasGradient = CanvasGradient_;
  CanvasPattern = CanvasPattern_;
  DOMException = DOMException_;
})();

} // if

/* Javascript plotting library for jQuery, v. 0.7.
 *
 * Released under the MIT license by IOLA, December 2007.
 *
 */
(function(b){b.color={};b.color.make=function(d,e,g,f){var c={};c.r=d||0;c.g=e||0;c.b=g||0;c.a=f!=null?f:1;c.add=function(h,j){for(var k=0;k<h.length;++k){c[h.charAt(k)]+=j}return c.normalize()};c.scale=function(h,j){for(var k=0;k<h.length;++k){c[h.charAt(k)]*=j}return c.normalize()};c.toString=function(){if(c.a>=1){return"rgb("+[c.r,c.g,c.b].join(",")+")"}else{return"rgba("+[c.r,c.g,c.b,c.a].join(",")+")"}};c.normalize=function(){function h(k,j,l){return j<k?k:(j>l?l:j)}c.r=h(0,parseInt(c.r),255);c.g=h(0,parseInt(c.g),255);c.b=h(0,parseInt(c.b),255);c.a=h(0,c.a,1);return c};c.clone=function(){return b.color.make(c.r,c.b,c.g,c.a)};return c.normalize()};b.color.extract=function(d,e){var c;do{c=d.css(e).toLowerCase();if(c!=""&&c!="transparent"){break}d=d.parent()}while(!b.nodeName(d.get(0),"body"));if(c=="rgba(0, 0, 0, 0)"){c="transparent"}return b.color.parse(c)};b.color.parse=function(c){var d,f=b.color.make;if(d=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(c)){return f(parseInt(d[1],10),parseInt(d[2],10),parseInt(d[3],10))}if(d=/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(c)){return f(parseInt(d[1],10),parseInt(d[2],10),parseInt(d[3],10),parseFloat(d[4]))}if(d=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(c)){return f(parseFloat(d[1])*2.55,parseFloat(d[2])*2.55,parseFloat(d[3])*2.55)}if(d=/rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(c)){return f(parseFloat(d[1])*2.55,parseFloat(d[2])*2.55,parseFloat(d[3])*2.55,parseFloat(d[4]))}if(d=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(c)){return f(parseInt(d[1],16),parseInt(d[2],16),parseInt(d[3],16))}if(d=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(c)){return f(parseInt(d[1]+d[1],16),parseInt(d[2]+d[2],16),parseInt(d[3]+d[3],16))}var e=b.trim(c).toLowerCase();if(e=="transparent"){return f(255,255,255,0)}else{d=a[e]||[0,0,0];return f(d[0],d[1],d[2])}};var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0]}})(jQuery);(function(c){function b(av,ai,J,af){var Q=[],O={colors:["#edc240","#afd8f8","#cb4b4b","#4da74d","#9440ed"],legend:{show:true,noColumns:1,labelFormatter:null,labelBoxBorderColor:"#ccc",container:null,position:"ne",margin:5,backgroundColor:null,backgroundOpacity:0.85},xaxis:{show:null,position:"bottom",mode:null,color:null,tickColor:null,transform:null,inverseTransform:null,min:null,max:null,autoscaleMargin:null,ticks:null,tickFormatter:null,labelWidth:null,labelHeight:null,reserveSpace:null,tickLength:null,alignTicksWithAxis:null,tickDecimals:null,tickSize:null,minTickSize:null,monthNames:null,timeformat:null,twelveHourClock:false},yaxis:{autoscaleMargin:0.02,position:"left"},xaxes:[],yaxes:[],series:{points:{show:false,radius:3,lineWidth:2,fill:true,fillColor:"#ffffff",symbol:"circle"},lines:{lineWidth:2,fill:false,fillColor:null,steps:false},bars:{show:false,lineWidth:2,barWidth:1,fill:true,fillColor:null,align:"left",horizontal:false},shadowSize:3},grid:{show:true,aboveData:false,color:"#545454",backgroundColor:null,borderColor:null,tickColor:null,labelMargin:5,axisMargin:8,borderWidth:2,minBorderMargin:null,markings:null,markingsColor:"#f4f4f4",markingsLineWidth:2,clickable:false,hoverable:false,autoHighlight:true,mouseActiveRadius:10},hooks:{}},az=null,ad=null,y=null,H=null,A=null,p=[],aw=[],q={left:0,right:0,top:0,bottom:0},G=0,I=0,h=0,w=0,ak={processOptions:[],processRawData:[],processDatapoints:[],drawSeries:[],draw:[],bindEvents:[],drawOverlay:[],shutdown:[]},aq=this;aq.setData=aj;aq.setupGrid=t;aq.draw=W;aq.getPlaceholder=function(){return av};aq.getCanvas=function(){return az};aq.getPlotOffset=function(){return q};aq.width=function(){return h};aq.height=function(){return w};aq.offset=function(){var aB=y.offset();aB.left+=q.left;aB.top+=q.top;return aB};aq.getData=function(){return Q};aq.getAxes=function(){var aC={},aB;c.each(p.concat(aw),function(aD,aE){if(aE){aC[aE.direction+(aE.n!=1?aE.n:"")+"axis"]=aE}});return aC};aq.getXAxes=function(){return p};aq.getYAxes=function(){return aw};aq.c2p=C;aq.p2c=ar;aq.getOptions=function(){return O};aq.highlight=x;aq.unhighlight=T;aq.triggerRedrawOverlay=f;aq.pointOffset=function(aB){return{left:parseInt(p[aA(aB,"x")-1].p2c(+aB.x)+q.left),top:parseInt(aw[aA(aB,"y")-1].p2c(+aB.y)+q.top)}};aq.shutdown=ag;aq.resize=function(){B();g(az);g(ad)};aq.hooks=ak;F(aq);Z(J);X();aj(ai);t();W();ah();function an(aD,aB){aB=[aq].concat(aB);for(var aC=0;aC<aD.length;++aC){aD[aC].apply(this,aB)}}function F(){for(var aB=0;aB<af.length;++aB){var aC=af[aB];aC.init(aq);if(aC.options){c.extend(true,O,aC.options)}}}function Z(aC){var aB;c.extend(true,O,aC);if(O.xaxis.color==null){O.xaxis.color=O.grid.color}if(O.yaxis.color==null){O.yaxis.color=O.grid.color}if(O.xaxis.tickColor==null){O.xaxis.tickColor=O.grid.tickColor}if(O.yaxis.tickColor==null){O.yaxis.tickColor=O.grid.tickColor}if(O.grid.borderColor==null){O.grid.borderColor=O.grid.color}if(O.grid.tickColor==null){O.grid.tickColor=c.color.parse(O.grid.color).scale("a",0.22).toString()}for(aB=0;aB<Math.max(1,O.xaxes.length);++aB){O.xaxes[aB]=c.extend(true,{},O.xaxis,O.xaxes[aB])}for(aB=0;aB<Math.max(1,O.yaxes.length);++aB){O.yaxes[aB]=c.extend(true,{},O.yaxis,O.yaxes[aB])}if(O.xaxis.noTicks&&O.xaxis.ticks==null){O.xaxis.ticks=O.xaxis.noTicks}if(O.yaxis.noTicks&&O.yaxis.ticks==null){O.yaxis.ticks=O.yaxis.noTicks}if(O.x2axis){O.xaxes[1]=c.extend(true,{},O.xaxis,O.x2axis);O.xaxes[1].position="top"}if(O.y2axis){O.yaxes[1]=c.extend(true,{},O.yaxis,O.y2axis);O.yaxes[1].position="right"}if(O.grid.coloredAreas){O.grid.markings=O.grid.coloredAreas}if(O.grid.coloredAreasColor){O.grid.markingsColor=O.grid.coloredAreasColor}if(O.lines){c.extend(true,O.series.lines,O.lines)}if(O.points){c.extend(true,O.series.points,O.points)}if(O.bars){c.extend(true,O.series.bars,O.bars)}if(O.shadowSize!=null){O.series.shadowSize=O.shadowSize}for(aB=0;aB<O.xaxes.length;++aB){V(p,aB+1).options=O.xaxes[aB]}for(aB=0;aB<O.yaxes.length;++aB){V(aw,aB+1).options=O.yaxes[aB]}for(var aD in ak){if(O.hooks[aD]&&O.hooks[aD].length){ak[aD]=ak[aD].concat(O.hooks[aD])}}an(ak.processOptions,[O])}function aj(aB){Q=Y(aB);ax();z()}function Y(aE){var aC=[];for(var aB=0;aB<aE.length;++aB){var aD=c.extend(true,{},O.series);if(aE[aB].data!=null){aD.data=aE[aB].data;delete aE[aB].data;c.extend(true,aD,aE[aB]);aE[aB].data=aD.data}else{aD.data=aE[aB]}aC.push(aD)}return aC}function aA(aC,aD){var aB=aC[aD+"axis"];if(typeof aB=="object"){aB=aB.n}if(typeof aB!="number"){aB=1}return aB}function m(){return c.grep(p.concat(aw),function(aB){return aB})}function C(aE){var aC={},aB,aD;for(aB=0;aB<p.length;++aB){aD=p[aB];if(aD&&aD.used){aC["x"+aD.n]=aD.c2p(aE.left)}}for(aB=0;aB<aw.length;++aB){aD=aw[aB];if(aD&&aD.used){aC["y"+aD.n]=aD.c2p(aE.top)}}if(aC.x1!==undefined){aC.x=aC.x1}if(aC.y1!==undefined){aC.y=aC.y1}return aC}function ar(aF){var aD={},aC,aE,aB;for(aC=0;aC<p.length;++aC){aE=p[aC];if(aE&&aE.used){aB="x"+aE.n;if(aF[aB]==null&&aE.n==1){aB="x"}if(aF[aB]!=null){aD.left=aE.p2c(aF[aB]);break}}}for(aC=0;aC<aw.length;++aC){aE=aw[aC];if(aE&&aE.used){aB="y"+aE.n;if(aF[aB]==null&&aE.n==1){aB="y"}if(aF[aB]!=null){aD.top=aE.p2c(aF[aB]);break}}}return aD}function V(aC,aB){if(!aC[aB-1]){aC[aB-1]={n:aB,direction:aC==p?"x":"y",options:c.extend(true,{},aC==p?O.xaxis:O.yaxis)}}return aC[aB-1]}function ax(){var aG;var aM=Q.length,aB=[],aE=[];for(aG=0;aG<Q.length;++aG){var aJ=Q[aG].color;if(aJ!=null){--aM;if(typeof aJ=="number"){aE.push(aJ)}else{aB.push(c.color.parse(Q[aG].color))}}}for(aG=0;aG<aE.length;++aG){aM=Math.max(aM,aE[aG]+1)}var aC=[],aF=0;aG=0;while(aC.length<aM){var aI;if(O.colors.length==aG){aI=c.color.make(100,100,100)}else{aI=c.color.parse(O.colors[aG])}var aD=aF%2==1?-1:1;aI.scale("rgb",1+aD*Math.ceil(aF/2)*0.2);aC.push(aI);++aG;if(aG>=O.colors.length){aG=0;++aF}}var aH=0,aN;for(aG=0;aG<Q.length;++aG){aN=Q[aG];if(aN.color==null){aN.color=aC[aH].toString();++aH}else{if(typeof aN.color=="number"){aN.color=aC[aN.color].toString()}}if(aN.lines.show==null){var aL,aK=true;for(aL in aN){if(aN[aL]&&aN[aL].show){aK=false;break}}if(aK){aN.lines.show=true}}aN.xaxis=V(p,aA(aN,"x"));aN.yaxis=V(aw,aA(aN,"y"))}}function z(){var aO=Number.POSITIVE_INFINITY,aI=Number.NEGATIVE_INFINITY,aB=Number.MAX_VALUE,aU,aS,aR,aN,aD,aJ,aT,aP,aH,aG,aC,a0,aX,aL;function aF(a3,a2,a1){if(a2<a3.datamin&&a2!=-aB){a3.datamin=a2}if(a1>a3.datamax&&a1!=aB){a3.datamax=a1}}c.each(m(),function(a1,a2){a2.datamin=aO;a2.datamax=aI;a2.used=false});for(aU=0;aU<Q.length;++aU){aJ=Q[aU];aJ.datapoints={points:[]};an(ak.processRawData,[aJ,aJ.data,aJ.datapoints])}for(aU=0;aU<Q.length;++aU){aJ=Q[aU];var aZ=aJ.data,aW=aJ.datapoints.format;if(!aW){aW=[];aW.push({x:true,number:true,required:true});aW.push({y:true,number:true,required:true});if(aJ.bars.show||(aJ.lines.show&&aJ.lines.fill)){aW.push({y:true,number:true,required:false,defaultValue:0});if(aJ.bars.horizontal){delete aW[aW.length-1].y;aW[aW.length-1].x=true}}aJ.datapoints.format=aW}if(aJ.datapoints.pointsize!=null){continue}aJ.datapoints.pointsize=aW.length;aP=aJ.datapoints.pointsize;aT=aJ.datapoints.points;insertSteps=aJ.lines.show&&aJ.lines.steps;aJ.xaxis.used=aJ.yaxis.used=true;for(aS=aR=0;aS<aZ.length;++aS,aR+=aP){aL=aZ[aS];var aE=aL==null;if(!aE){for(aN=0;aN<aP;++aN){a0=aL[aN];aX=aW[aN];if(aX){if(aX.number&&a0!=null){a0=+a0;if(isNaN(a0)){a0=null}else{if(a0==Infinity){a0=aB}else{if(a0==-Infinity){a0=-aB}}}}if(a0==null){if(aX.required){aE=true}if(aX.defaultValue!=null){a0=aX.defaultValue}}}aT[aR+aN]=a0}}if(aE){for(aN=0;aN<aP;++aN){a0=aT[aR+aN];if(a0!=null){aX=aW[aN];if(aX.x){aF(aJ.xaxis,a0,a0)}if(aX.y){aF(aJ.yaxis,a0,a0)}}aT[aR+aN]=null}}else{if(insertSteps&&aR>0&&aT[aR-aP]!=null&&aT[aR-aP]!=aT[aR]&&aT[aR-aP+1]!=aT[aR+1]){for(aN=0;aN<aP;++aN){aT[aR+aP+aN]=aT[aR+aN]}aT[aR+1]=aT[aR-aP+1];aR+=aP}}}}for(aU=0;aU<Q.length;++aU){aJ=Q[aU];an(ak.processDatapoints,[aJ,aJ.datapoints])}for(aU=0;aU<Q.length;++aU){aJ=Q[aU];aT=aJ.datapoints.points,aP=aJ.datapoints.pointsize;var aK=aO,aQ=aO,aM=aI,aV=aI;for(aS=0;aS<aT.length;aS+=aP){if(aT[aS]==null){continue}for(aN=0;aN<aP;++aN){a0=aT[aS+aN];aX=aW[aN];if(!aX||a0==aB||a0==-aB){continue}if(aX.x){if(a0<aK){aK=a0}if(a0>aM){aM=a0}}if(aX.y){if(a0<aQ){aQ=a0}if(a0>aV){aV=a0}}}}if(aJ.bars.show){var aY=aJ.bars.align=="left"?0:-aJ.bars.barWidth/2;if(aJ.bars.horizontal){aQ+=aY;aV+=aY+aJ.bars.barWidth}else{aK+=aY;aM+=aY+aJ.bars.barWidth}}aF(aJ.xaxis,aK,aM);aF(aJ.yaxis,aQ,aV)}c.each(m(),function(a1,a2){if(a2.datamin==aO){a2.datamin=null}if(a2.datamax==aI){a2.datamax=null}})}function j(aB,aC){var aD=document.createElement("canvas");aD.className=aC;aD.width=G;aD.height=I;if(!aB){c(aD).css({position:"absolute",left:0,top:0})}c(aD).appendTo(av);if(!aD.getContext){aD=window.G_vmlCanvasManager.initElement(aD)}aD.getContext("2d").save();return aD}function B(){G=av.width();I=av.height();if(G<=0||I<=0){throw"Invalid dimensions for plot, width = "+G+", height = "+I}}function g(aC){if(aC.width!=G){aC.width=G}if(aC.height!=I){aC.height=I}var aB=aC.getContext("2d");aB.restore();aB.save()}function X(){var aC,aB=av.children("canvas.base"),aD=av.children("canvas.overlay");if(aB.length==0||aD==0){av.html("");av.css({padding:0});if(av.css("position")=="static"){av.css("position","relative")}B();az=j(true,"base");ad=j(false,"overlay");aC=false}else{az=aB.get(0);ad=aD.get(0);aC=true}H=az.getContext("2d");A=ad.getContext("2d");y=c([ad,az]);if(aC){av.data("plot").shutdown();aq.resize();A.clearRect(0,0,G,I);y.unbind();av.children().not([az,ad]).remove()}av.data("plot",aq)}function ah(){if(O.grid.hoverable){y.mousemove(aa);y.mouseleave(l)}if(O.grid.clickable){y.click(R)}an(ak.bindEvents,[y])}function ag(){if(M){clearTimeout(M)}y.unbind("mousemove",aa);y.unbind("mouseleave",l);y.unbind("click",R);an(ak.shutdown,[y])}function r(aG){function aC(aH){return aH}var aF,aB,aD=aG.options.transform||aC,aE=aG.options.inverseTransform;if(aG.direction=="x"){aF=aG.scale=h/Math.abs(aD(aG.max)-aD(aG.min));aB=Math.min(aD(aG.max),aD(aG.min))}else{aF=aG.scale=w/Math.abs(aD(aG.max)-aD(aG.min));aF=-aF;aB=Math.max(aD(aG.max),aD(aG.min))}if(aD==aC){aG.p2c=function(aH){return(aH-aB)*aF}}else{aG.p2c=function(aH){return(aD(aH)-aB)*aF}}if(!aE){aG.c2p=function(aH){return aB+aH/aF}}else{aG.c2p=function(aH){return aE(aB+aH/aF)}}}function L(aD){var aB=aD.options,aF,aJ=aD.ticks||[],aI=[],aE,aK=aB.labelWidth,aG=aB.labelHeight,aC;function aH(aM,aL){return c('<div style="position:absolute;top:-10000px;'+aL+'font-size:smaller"><div class="'+aD.direction+"Axis "+aD.direction+aD.n+'Axis">'+aM.join("")+"</div></div>").appendTo(av)}if(aD.direction=="x"){if(aK==null){aK=Math.floor(G/(aJ.length>0?aJ.length:1))}if(aG==null){aI=[];for(aF=0;aF<aJ.length;++aF){aE=aJ[aF].label;if(aE){aI.push('<div class="tickLabel" style="float:left;width:'+aK+'px">'+aE+"</div>")}}if(aI.length>0){aI.push('<div style="clear:left"></div>');aC=aH(aI,"width:10000px;");aG=aC.height();aC.remove()}}}else{if(aK==null||aG==null){for(aF=0;aF<aJ.length;++aF){aE=aJ[aF].label;if(aE){aI.push('<div class="tickLabel">'+aE+"</div>")}}if(aI.length>0){aC=aH(aI,"");if(aK==null){aK=aC.children().width()}if(aG==null){aG=aC.find("div.tickLabel").height()}aC.remove()}}}if(aK==null){aK=0}if(aG==null){aG=0}aD.labelWidth=aK;aD.labelHeight=aG}function au(aD){var aC=aD.labelWidth,aL=aD.labelHeight,aH=aD.options.position,aF=aD.options.tickLength,aG=O.grid.axisMargin,aJ=O.grid.labelMargin,aK=aD.direction=="x"?p:aw,aE;var aB=c.grep(aK,function(aN){return aN&&aN.options.position==aH&&aN.reserveSpace});if(c.inArray(aD,aB)==aB.length-1){aG=0}if(aF==null){aF="full"}var aI=c.grep(aK,function(aN){return aN&&aN.reserveSpace});var aM=c.inArray(aD,aI)==0;if(!aM&&aF=="full"){aF=5}if(!isNaN(+aF)){aJ+=+aF}if(aD.direction=="x"){aL+=aJ;if(aH=="bottom"){q.bottom+=aL+aG;aD.box={top:I-q.bottom,height:aL}}else{aD.box={top:q.top+aG,height:aL};q.top+=aL+aG}}else{aC+=aJ;if(aH=="left"){aD.box={left:q.left+aG,width:aC};q.left+=aC+aG}else{q.right+=aC+aG;aD.box={left:G-q.right,width:aC}}}aD.position=aH;aD.tickLength=aF;aD.box.padding=aJ;aD.innermost=aM}function U(aB){if(aB.direction=="x"){aB.box.left=q.left;aB.box.width=h}else{aB.box.top=q.top;aB.box.height=w}}function t(){var aC,aE=m();c.each(aE,function(aF,aG){aG.show=aG.options.show;if(aG.show==null){aG.show=aG.used}aG.reserveSpace=aG.show||aG.options.reserveSpace;n(aG)});allocatedAxes=c.grep(aE,function(aF){return aF.reserveSpace});q.left=q.right=q.top=q.bottom=0;if(O.grid.show){c.each(allocatedAxes,function(aF,aG){S(aG);P(aG);ap(aG,aG.ticks);L(aG)});for(aC=allocatedAxes.length-1;aC>=0;--aC){au(allocatedAxes[aC])}var aD=O.grid.minBorderMargin;if(aD==null){aD=0;for(aC=0;aC<Q.length;++aC){aD=Math.max(aD,Q[aC].points.radius+Q[aC].points.lineWidth/2)}}for(var aB in q){q[aB]+=O.grid.borderWidth;q[aB]=Math.max(aD,q[aB])}}h=G-q.left-q.right;w=I-q.bottom-q.top;c.each(aE,function(aF,aG){r(aG)});if(O.grid.show){c.each(allocatedAxes,function(aF,aG){U(aG)});k()}o()}function n(aE){var aF=aE.options,aD=+(aF.min!=null?aF.min:aE.datamin),aB=+(aF.max!=null?aF.max:aE.datamax),aH=aB-aD;if(aH==0){var aC=aB==0?1:0.01;if(aF.min==null){aD-=aC}if(aF.max==null||aF.min!=null){aB+=aC}}else{var aG=aF.autoscaleMargin;if(aG!=null){if(aF.min==null){aD-=aH*aG;if(aD<0&&aE.datamin!=null&&aE.datamin>=0){aD=0}}if(aF.max==null){aB+=aH*aG;if(aB>0&&aE.datamax!=null&&aE.datamax<=0){aB=0}}}}aE.min=aD;aE.max=aB}function S(aG){var aM=aG.options;var aH;if(typeof aM.ticks=="number"&&aM.ticks>0){aH=aM.ticks}else{aH=0.3*Math.sqrt(aG.direction=="x"?G:I)}var aT=(aG.max-aG.min)/aH,aO,aB,aN,aR,aS,aQ,aI;if(aM.mode=="time"){var aJ={second:1000,minute:60*1000,hour:60*60*1000,day:24*60*60*1000,month:30*24*60*60*1000,year:365.2425*24*60*60*1000};var aK=[[1,"second"],[2,"second"],[5,"second"],[10,"second"],[30,"second"],[1,"minute"],[2,"minute"],[5,"minute"],[10,"minute"],[30,"minute"],[1,"hour"],[2,"hour"],[4,"hour"],[8,"hour"],[12,"hour"],[1,"day"],[2,"day"],[3,"day"],[0.25,"month"],[0.5,"month"],[1,"month"],[2,"month"],[3,"month"],[6,"month"],[1,"year"]];var aC=0;if(aM.minTickSize!=null){if(typeof aM.tickSize=="number"){aC=aM.tickSize}else{aC=aM.minTickSize[0]*aJ[aM.minTickSize[1]]}}for(var aS=0;aS<aK.length-1;++aS){if(aT<(aK[aS][0]*aJ[aK[aS][1]]+aK[aS+1][0]*aJ[aK[aS+1][1]])/2&&aK[aS][0]*aJ[aK[aS][1]]>=aC){break}}aO=aK[aS][0];aN=aK[aS][1];if(aN=="year"){aQ=Math.pow(10,Math.floor(Math.log(aT/aJ.year)/Math.LN10));aI=(aT/aJ.year)/aQ;if(aI<1.5){aO=1}else{if(aI<3){aO=2}else{if(aI<7.5){aO=5}else{aO=10}}}aO*=aQ}aG.tickSize=aM.tickSize||[aO,aN];aB=function(aX){var a2=[],a0=aX.tickSize[0],a3=aX.tickSize[1],a1=new Date(aX.min);var aW=a0*aJ[a3];if(a3=="second"){a1.setUTCSeconds(a(a1.getUTCSeconds(),a0))}if(a3=="minute"){a1.setUTCMinutes(a(a1.getUTCMinutes(),a0))}if(a3=="hour"){a1.setUTCHours(a(a1.getUTCHours(),a0))}if(a3=="month"){a1.setUTCMonth(a(a1.getUTCMonth(),a0))}if(a3=="year"){a1.setUTCFullYear(a(a1.getUTCFullYear(),a0))}a1.setUTCMilliseconds(0);if(aW>=aJ.minute){a1.setUTCSeconds(0)}if(aW>=aJ.hour){a1.setUTCMinutes(0)}if(aW>=aJ.day){a1.setUTCHours(0)}if(aW>=aJ.day*4){a1.setUTCDate(1)}if(aW>=aJ.year){a1.setUTCMonth(0)}var a5=0,a4=Number.NaN,aY;do{aY=a4;a4=a1.getTime();a2.push(a4);if(a3=="month"){if(a0<1){a1.setUTCDate(1);var aV=a1.getTime();a1.setUTCMonth(a1.getUTCMonth()+1);var aZ=a1.getTime();a1.setTime(a4+a5*aJ.hour+(aZ-aV)*a0);a5=a1.getUTCHours();a1.setUTCHours(0)}else{a1.setUTCMonth(a1.getUTCMonth()+a0)}}else{if(a3=="year"){a1.setUTCFullYear(a1.getUTCFullYear()+a0)}else{a1.setTime(a4+aW)}}}while(a4<aX.max&&a4!=aY);return a2};aR=function(aV,aY){var a0=new Date(aV);if(aM.timeformat!=null){return c.plot.formatDate(a0,aM.timeformat,aM.monthNames)}var aW=aY.tickSize[0]*aJ[aY.tickSize[1]];var aX=aY.max-aY.min;var aZ=(aM.twelveHourClock)?" %p":"";if(aW<aJ.minute){fmt="%h:%M:%S"+aZ}else{if(aW<aJ.day){if(aX<2*aJ.day){fmt="%h:%M"+aZ}else{fmt="%b %d %h:%M"+aZ}}else{if(aW<aJ.month){fmt="%b %d"}else{if(aW<aJ.year){if(aX<aJ.year){fmt="%b"}else{fmt="%b %y"}}else{fmt="%y"}}}}return c.plot.formatDate(a0,fmt,aM.monthNames)}}else{var aU=aM.tickDecimals;var aP=-Math.floor(Math.log(aT)/Math.LN10);if(aU!=null&&aP>aU){aP=aU}aQ=Math.pow(10,-aP);aI=aT/aQ;if(aI<1.5){aO=1}else{if(aI<3){aO=2;if(aI>2.25&&(aU==null||aP+1<=aU)){aO=2.5;++aP}}else{if(aI<7.5){aO=5}else{aO=10}}}aO*=aQ;if(aM.minTickSize!=null&&aO<aM.minTickSize){aO=aM.minTickSize}aG.tickDecimals=Math.max(0,aU!=null?aU:aP);aG.tickSize=aM.tickSize||aO;aB=function(aX){var aZ=[];var a0=a(aX.min,aX.tickSize),aW=0,aV=Number.NaN,aY;do{aY=aV;aV=a0+aW*aX.tickSize;aZ.push(aV);++aW}while(aV<aX.max&&aV!=aY);return aZ};aR=function(aV,aW){return aV.toFixed(aW.tickDecimals)}}if(aM.alignTicksWithAxis!=null){var aF=(aG.direction=="x"?p:aw)[aM.alignTicksWithAxis-1];if(aF&&aF.used&&aF!=aG){var aL=aB(aG);if(aL.length>0){if(aM.min==null){aG.min=Math.min(aG.min,aL[0])}if(aM.max==null&&aL.length>1){aG.max=Math.max(aG.max,aL[aL.length-1])}}aB=function(aX){var aY=[],aV,aW;for(aW=0;aW<aF.ticks.length;++aW){aV=(aF.ticks[aW].v-aF.min)/(aF.max-aF.min);aV=aX.min+aV*(aX.max-aX.min);aY.push(aV)}return aY};if(aG.mode!="time"&&aM.tickDecimals==null){var aE=Math.max(0,-Math.floor(Math.log(aT)/Math.LN10)+1),aD=aB(aG);if(!(aD.length>1&&/\..*0$/.test((aD[1]-aD[0]).toFixed(aE)))){aG.tickDecimals=aE}}}}aG.tickGenerator=aB;if(c.isFunction(aM.tickFormatter)){aG.tickFormatter=function(aV,aW){return""+aM.tickFormatter(aV,aW)}}else{aG.tickFormatter=aR}}function P(aF){var aH=aF.options.ticks,aG=[];if(aH==null||(typeof aH=="number"&&aH>0)){aG=aF.tickGenerator(aF)}else{if(aH){if(c.isFunction(aH)){aG=aH({min:aF.min,max:aF.max})}else{aG=aH}}}var aE,aB;aF.ticks=[];for(aE=0;aE<aG.length;++aE){var aC=null;var aD=aG[aE];if(typeof aD=="object"){aB=+aD[0];if(aD.length>1){aC=aD[1]}}else{aB=+aD}if(aC==null){aC=aF.tickFormatter(aB,aF)}if(!isNaN(aB)){aF.ticks.push({v:aB,label:aC})}}}function ap(aB,aC){if(aB.options.autoscaleMargin&&aC.length>0){if(aB.options.min==null){aB.min=Math.min(aB.min,aC[0].v)}if(aB.options.max==null&&aC.length>1){aB.max=Math.max(aB.max,aC[aC.length-1].v)}}}function W(){H.clearRect(0,0,G,I);var aC=O.grid;if(aC.show&&aC.backgroundColor){N()}if(aC.show&&!aC.aboveData){ac()}for(var aB=0;aB<Q.length;++aB){an(ak.drawSeries,[H,Q[aB]]);d(Q[aB])}an(ak.draw,[H]);if(aC.show&&aC.aboveData){ac()}}function D(aB,aI){var aE,aH,aG,aD,aF=m();for(i=0;i<aF.length;++i){aE=aF[i];if(aE.direction==aI){aD=aI+aE.n+"axis";if(!aB[aD]&&aE.n==1){aD=aI+"axis"}if(aB[aD]){aH=aB[aD].from;aG=aB[aD].to;break}}}if(!aB[aD]){aE=aI=="x"?p[0]:aw[0];aH=aB[aI+"1"];aG=aB[aI+"2"]}if(aH!=null&&aG!=null&&aH>aG){var aC=aH;aH=aG;aG=aC}return{from:aH,to:aG,axis:aE}}function N(){H.save();H.translate(q.left,q.top);H.fillStyle=am(O.grid.backgroundColor,w,0,"rgba(255, 255, 255, 0)");H.fillRect(0,0,h,w);H.restore()}function ac(){var aF;H.save();H.translate(q.left,q.top);var aH=O.grid.markings;if(aH){if(c.isFunction(aH)){var aK=aq.getAxes();aK.xmin=aK.xaxis.min;aK.xmax=aK.xaxis.max;aK.ymin=aK.yaxis.min;aK.ymax=aK.yaxis.max;aH=aH(aK)}for(aF=0;aF<aH.length;++aF){var aD=aH[aF],aC=D(aD,"x"),aI=D(aD,"y");if(aC.from==null){aC.from=aC.axis.min}if(aC.to==null){aC.to=aC.axis.max}if(aI.from==null){aI.from=aI.axis.min}if(aI.to==null){aI.to=aI.axis.max}if(aC.to<aC.axis.min||aC.from>aC.axis.max||aI.to<aI.axis.min||aI.from>aI.axis.max){continue}aC.from=Math.max(aC.from,aC.axis.min);aC.to=Math.min(aC.to,aC.axis.max);aI.from=Math.max(aI.from,aI.axis.min);aI.to=Math.min(aI.to,aI.axis.max);if(aC.from==aC.to&&aI.from==aI.to){continue}aC.from=aC.axis.p2c(aC.from);aC.to=aC.axis.p2c(aC.to);aI.from=aI.axis.p2c(aI.from);aI.to=aI.axis.p2c(aI.to);if(aC.from==aC.to||aI.from==aI.to){H.beginPath();H.strokeStyle=aD.color||O.grid.markingsColor;H.lineWidth=aD.lineWidth||O.grid.markingsLineWidth;H.moveTo(aC.from,aI.from);H.lineTo(aC.to,aI.to);H.stroke()}else{H.fillStyle=aD.color||O.grid.markingsColor;H.fillRect(aC.from,aI.to,aC.to-aC.from,aI.from-aI.to)}}}var aK=m(),aM=O.grid.borderWidth;for(var aE=0;aE<aK.length;++aE){var aB=aK[aE],aG=aB.box,aQ=aB.tickLength,aN,aL,aP,aJ;if(!aB.show||aB.ticks.length==0){continue}H.strokeStyle=aB.options.tickColor||c.color.parse(aB.options.color).scale("a",0.22).toString();H.lineWidth=1;if(aB.direction=="x"){aN=0;if(aQ=="full"){aL=(aB.position=="top"?0:w)}else{aL=aG.top-q.top+(aB.position=="top"?aG.height:0)}}else{aL=0;if(aQ=="full"){aN=(aB.position=="left"?0:h)}else{aN=aG.left-q.left+(aB.position=="left"?aG.width:0)}}if(!aB.innermost){H.beginPath();aP=aJ=0;if(aB.direction=="x"){aP=h}else{aJ=w}if(H.lineWidth==1){aN=Math.floor(aN)+0.5;aL=Math.floor(aL)+0.5}H.moveTo(aN,aL);H.lineTo(aN+aP,aL+aJ);H.stroke()}H.beginPath();for(aF=0;aF<aB.ticks.length;++aF){var aO=aB.ticks[aF].v;aP=aJ=0;if(aO<aB.min||aO>aB.max||(aQ=="full"&&aM>0&&(aO==aB.min||aO==aB.max))){continue}if(aB.direction=="x"){aN=aB.p2c(aO);aJ=aQ=="full"?-w:aQ;if(aB.position=="top"){aJ=-aJ}}else{aL=aB.p2c(aO);aP=aQ=="full"?-h:aQ;if(aB.position=="left"){aP=-aP}}if(H.lineWidth==1){if(aB.direction=="x"){aN=Math.floor(aN)+0.5}else{aL=Math.floor(aL)+0.5}}H.moveTo(aN,aL);H.lineTo(aN+aP,aL+aJ)}H.stroke()}if(aM){H.lineWidth=aM;H.strokeStyle=O.grid.borderColor;H.strokeRect(-aM/2,-aM/2,h+aM,w+aM)}H.restore()}function k(){av.find(".tickLabels").remove();var aG=['<div class="tickLabels" style="font-size:smaller">'];var aJ=m();for(var aD=0;aD<aJ.length;++aD){var aC=aJ[aD],aF=aC.box;if(!aC.show){continue}aG.push('<div class="'+aC.direction+"Axis "+aC.direction+aC.n+'Axis" style="color:'+aC.options.color+'">');for(var aE=0;aE<aC.ticks.length;++aE){var aH=aC.ticks[aE];if(!aH.label||aH.v<aC.min||aH.v>aC.max){continue}var aK={},aI;if(aC.direction=="x"){aI="center";aK.left=Math.round(q.left+aC.p2c(aH.v)-aC.labelWidth/2);if(aC.position=="bottom"){aK.top=aF.top+aF.padding}else{aK.bottom=I-(aF.top+aF.height-aF.padding)}}else{aK.top=Math.round(q.top+aC.p2c(aH.v)-aC.labelHeight/2);if(aC.position=="left"){aK.right=G-(aF.left+aF.width-aF.padding);aI="right"}else{aK.left=aF.left+aF.padding;aI="left"}}aK.width=aC.labelWidth;var aB=["position:absolute","text-align:"+aI];for(var aL in aK){aB.push(aL+":"+aK[aL]+"px")}aG.push('<div class="tickLabel" style="'+aB.join(";")+'">'+aH.label+"</div>")}aG.push("</div>")}aG.push("</div>");av.append(aG.join(""))}function d(aB){if(aB.lines.show){at(aB)}if(aB.bars.show){e(aB)}if(aB.points.show){ao(aB)}}function at(aE){function aD(aP,aQ,aI,aU,aT){var aV=aP.points,aJ=aP.pointsize,aN=null,aM=null;H.beginPath();for(var aO=aJ;aO<aV.length;aO+=aJ){var aL=aV[aO-aJ],aS=aV[aO-aJ+1],aK=aV[aO],aR=aV[aO+1];if(aL==null||aK==null){continue}if(aS<=aR&&aS<aT.min){if(aR<aT.min){continue}aL=(aT.min-aS)/(aR-aS)*(aK-aL)+aL;aS=aT.min}else{if(aR<=aS&&aR<aT.min){if(aS<aT.min){continue}aK=(aT.min-aS)/(aR-aS)*(aK-aL)+aL;aR=aT.min}}if(aS>=aR&&aS>aT.max){if(aR>aT.max){continue}aL=(aT.max-aS)/(aR-aS)*(aK-aL)+aL;aS=aT.max}else{if(aR>=aS&&aR>aT.max){if(aS>aT.max){continue}aK=(aT.max-aS)/(aR-aS)*(aK-aL)+aL;aR=aT.max}}if(aL<=aK&&aL<aU.min){if(aK<aU.min){continue}aS=(aU.min-aL)/(aK-aL)*(aR-aS)+aS;aL=aU.min}else{if(aK<=aL&&aK<aU.min){if(aL<aU.min){continue}aR=(aU.min-aL)/(aK-aL)*(aR-aS)+aS;aK=aU.min}}if(aL>=aK&&aL>aU.max){if(aK>aU.max){continue}aS=(aU.max-aL)/(aK-aL)*(aR-aS)+aS;aL=aU.max}else{if(aK>=aL&&aK>aU.max){if(aL>aU.max){continue}aR=(aU.max-aL)/(aK-aL)*(aR-aS)+aS;aK=aU.max}}if(aL!=aN||aS!=aM){H.moveTo(aU.p2c(aL)+aQ,aT.p2c(aS)+aI)}aN=aK;aM=aR;H.lineTo(aU.p2c(aK)+aQ,aT.p2c(aR)+aI)}H.stroke()}function aF(aI,aQ,aP){var aW=aI.points,aV=aI.pointsize,aN=Math.min(Math.max(0,aP.min),aP.max),aX=0,aU,aT=false,aM=1,aL=0,aR=0;while(true){if(aV>0&&aX>aW.length+aV){break}aX+=aV;var aZ=aW[aX-aV],aK=aW[aX-aV+aM],aY=aW[aX],aJ=aW[aX+aM];if(aT){if(aV>0&&aZ!=null&&aY==null){aR=aX;aV=-aV;aM=2;continue}if(aV<0&&aX==aL+aV){H.fill();aT=false;aV=-aV;aM=1;aX=aL=aR+aV;continue}}if(aZ==null||aY==null){continue}if(aZ<=aY&&aZ<aQ.min){if(aY<aQ.min){continue}aK=(aQ.min-aZ)/(aY-aZ)*(aJ-aK)+aK;aZ=aQ.min}else{if(aY<=aZ&&aY<aQ.min){if(aZ<aQ.min){continue}aJ=(aQ.min-aZ)/(aY-aZ)*(aJ-aK)+aK;aY=aQ.min}}if(aZ>=aY&&aZ>aQ.max){if(aY>aQ.max){continue}aK=(aQ.max-aZ)/(aY-aZ)*(aJ-aK)+aK;aZ=aQ.max}else{if(aY>=aZ&&aY>aQ.max){if(aZ>aQ.max){continue}aJ=(aQ.max-aZ)/(aY-aZ)*(aJ-aK)+aK;aY=aQ.max}}if(!aT){H.beginPath();H.moveTo(aQ.p2c(aZ),aP.p2c(aN));aT=true}if(aK>=aP.max&&aJ>=aP.max){H.lineTo(aQ.p2c(aZ),aP.p2c(aP.max));H.lineTo(aQ.p2c(aY),aP.p2c(aP.max));continue}else{if(aK<=aP.min&&aJ<=aP.min){H.lineTo(aQ.p2c(aZ),aP.p2c(aP.min));H.lineTo(aQ.p2c(aY),aP.p2c(aP.min));continue}}var aO=aZ,aS=aY;if(aK<=aJ&&aK<aP.min&&aJ>=aP.min){aZ=(aP.min-aK)/(aJ-aK)*(aY-aZ)+aZ;aK=aP.min}else{if(aJ<=aK&&aJ<aP.min&&aK>=aP.min){aY=(aP.min-aK)/(aJ-aK)*(aY-aZ)+aZ;aJ=aP.min}}if(aK>=aJ&&aK>aP.max&&aJ<=aP.max){aZ=(aP.max-aK)/(aJ-aK)*(aY-aZ)+aZ;aK=aP.max}else{if(aJ>=aK&&aJ>aP.max&&aK<=aP.max){aY=(aP.max-aK)/(aJ-aK)*(aY-aZ)+aZ;aJ=aP.max}}if(aZ!=aO){H.lineTo(aQ.p2c(aO),aP.p2c(aK))}H.lineTo(aQ.p2c(aZ),aP.p2c(aK));H.lineTo(aQ.p2c(aY),aP.p2c(aJ));if(aY!=aS){H.lineTo(aQ.p2c(aY),aP.p2c(aJ));H.lineTo(aQ.p2c(aS),aP.p2c(aJ))}}}H.save();H.translate(q.left,q.top);H.lineJoin="round";var aG=aE.lines.lineWidth,aB=aE.shadowSize;if(aG>0&&aB>0){H.lineWidth=aB;H.strokeStyle="rgba(0,0,0,0.1)";var aH=Math.PI/18;aD(aE.datapoints,Math.sin(aH)*(aG/2+aB/2),Math.cos(aH)*(aG/2+aB/2),aE.xaxis,aE.yaxis);H.lineWidth=aB/2;aD(aE.datapoints,Math.sin(aH)*(aG/2+aB/4),Math.cos(aH)*(aG/2+aB/4),aE.xaxis,aE.yaxis)}H.lineWidth=aG;H.strokeStyle=aE.color;var aC=ae(aE.lines,aE.color,0,w);if(aC){H.fillStyle=aC;aF(aE.datapoints,aE.xaxis,aE.yaxis)}if(aG>0){aD(aE.datapoints,0,0,aE.xaxis,aE.yaxis)}H.restore()}function ao(aE){function aH(aN,aM,aU,aK,aS,aT,aQ,aJ){var aR=aN.points,aI=aN.pointsize;for(var aL=0;aL<aR.length;aL+=aI){var aP=aR[aL],aO=aR[aL+1];if(aP==null||aP<aT.min||aP>aT.max||aO<aQ.min||aO>aQ.max){continue}H.beginPath();aP=aT.p2c(aP);aO=aQ.p2c(aO)+aK;if(aJ=="circle"){H.arc(aP,aO,aM,0,aS?Math.PI:Math.PI*2,false)}else{aJ(H,aP,aO,aM,aS)}H.closePath();if(aU){H.fillStyle=aU;H.fill()}H.stroke()}}H.save();H.translate(q.left,q.top);var aG=aE.points.lineWidth,aC=aE.shadowSize,aB=aE.points.radius,aF=aE.points.symbol;if(aG>0&&aC>0){var aD=aC/2;H.lineWidth=aD;H.strokeStyle="rgba(0,0,0,0.1)";aH(aE.datapoints,aB,null,aD+aD/2,true,aE.xaxis,aE.yaxis,aF);H.strokeStyle="rgba(0,0,0,0.2)";aH(aE.datapoints,aB,null,aD/2,true,aE.xaxis,aE.yaxis,aF)}H.lineWidth=aG;H.strokeStyle=aE.color;aH(aE.datapoints,aB,ae(aE.points,aE.color),0,false,aE.xaxis,aE.yaxis,aF);H.restore()}function E(aN,aM,aV,aI,aQ,aF,aD,aL,aK,aU,aR,aC){var aE,aT,aJ,aP,aG,aB,aO,aH,aS;if(aR){aH=aB=aO=true;aG=false;aE=aV;aT=aN;aP=aM+aI;aJ=aM+aQ;if(aT<aE){aS=aT;aT=aE;aE=aS;aG=true;aB=false}}else{aG=aB=aO=true;aH=false;aE=aN+aI;aT=aN+aQ;aJ=aV;aP=aM;if(aP<aJ){aS=aP;aP=aJ;aJ=aS;aH=true;aO=false}}if(aT<aL.min||aE>aL.max||aP<aK.min||aJ>aK.max){return}if(aE<aL.min){aE=aL.min;aG=false}if(aT>aL.max){aT=aL.max;aB=false}if(aJ<aK.min){aJ=aK.min;aH=false}if(aP>aK.max){aP=aK.max;aO=false}aE=aL.p2c(aE);aJ=aK.p2c(aJ);aT=aL.p2c(aT);aP=aK.p2c(aP);if(aD){aU.beginPath();aU.moveTo(aE,aJ);aU.lineTo(aE,aP);aU.lineTo(aT,aP);aU.lineTo(aT,aJ);aU.fillStyle=aD(aJ,aP);aU.fill()}if(aC>0&&(aG||aB||aO||aH)){aU.beginPath();aU.moveTo(aE,aJ+aF);if(aG){aU.lineTo(aE,aP+aF)}else{aU.moveTo(aE,aP+aF)}if(aO){aU.lineTo(aT,aP+aF)}else{aU.moveTo(aT,aP+aF)}if(aB){aU.lineTo(aT,aJ+aF)}else{aU.moveTo(aT,aJ+aF)}if(aH){aU.lineTo(aE,aJ+aF)}else{aU.moveTo(aE,aJ+aF)}aU.stroke()}}function e(aD){function aC(aJ,aI,aL,aG,aK,aN,aM){var aO=aJ.points,aF=aJ.pointsize;for(var aH=0;aH<aO.length;aH+=aF){if(aO[aH]==null){continue}E(aO[aH],aO[aH+1],aO[aH+2],aI,aL,aG,aK,aN,aM,H,aD.bars.horizontal,aD.bars.lineWidth)}}H.save();H.translate(q.left,q.top);H.lineWidth=aD.bars.lineWidth;H.strokeStyle=aD.color;var aB=aD.bars.align=="left"?0:-aD.bars.barWidth/2;var aE=aD.bars.fill?function(aF,aG){return ae(aD.bars,aD.color,aF,aG)}:null;aC(aD.datapoints,aB,aB+aD.bars.barWidth,0,aE,aD.xaxis,aD.yaxis);H.restore()}function ae(aD,aB,aC,aF){var aE=aD.fill;if(!aE){return null}if(aD.fillColor){return am(aD.fillColor,aC,aF,aB)}var aG=c.color.parse(aB);aG.a=typeof aE=="number"?aE:0.4;aG.normalize();return aG.toString()}function o(){av.find(".legend").remove();if(!O.legend.show){return}var aH=[],aF=false,aN=O.legend.labelFormatter,aM,aJ;for(var aE=0;aE<Q.length;++aE){aM=Q[aE];aJ=aM.label;if(!aJ){continue}if(aE%O.legend.noColumns==0){if(aF){aH.push("</tr>")}aH.push("<tr>");aF=true}if(aN){aJ=aN(aJ,aM)}aH.push('<td class="legendColorBox"><div style="border:1px solid '+O.legend.labelBoxBorderColor+';padding:1px"><div style="width:4px;height:0;border:5px solid '+aM.color+';overflow:hidden"></div></div></td><td class="legendLabel">'+aJ+"</td>")}if(aF){aH.push("</tr>")}if(aH.length==0){return}var aL='<table style="font-size:smaller;color:'+O.grid.color+'">'+aH.join("")+"</table>";if(O.legend.container!=null){c(O.legend.container).html(aL)}else{var aI="",aC=O.legend.position,aD=O.legend.margin;if(aD[0]==null){aD=[aD,aD]}if(aC.charAt(0)=="n"){aI+="top:"+(aD[1]+q.top)+"px;"}else{if(aC.charAt(0)=="s"){aI+="bottom:"+(aD[1]+q.bottom)+"px;"}}if(aC.charAt(1)=="e"){aI+="right:"+(aD[0]+q.right)+"px;"}else{if(aC.charAt(1)=="w"){aI+="left:"+(aD[0]+q.left)+"px;"}}var aK=c('<div class="legend">'+aL.replace('style="','style="position:absolute;'+aI+";")+"</div>").appendTo(av);if(O.legend.backgroundOpacity!=0){var aG=O.legend.backgroundColor;if(aG==null){aG=O.grid.backgroundColor;if(aG&&typeof aG=="string"){aG=c.color.parse(aG)}else{aG=c.color.extract(aK,"background-color")}aG.a=1;aG=aG.toString()}var aB=aK.children();c('<div style="position:absolute;width:'+aB.width()+"px;height:"+aB.height()+"px;"+aI+"background-color:"+aG+';"> </div>').prependTo(aK).css("opacity",O.legend.backgroundOpacity)}}}var ab=[],M=null;function K(aI,aG,aD){var aO=O.grid.mouseActiveRadius,a0=aO*aO+1,aY=null,aR=false,aW,aU;for(aW=Q.length-1;aW>=0;--aW){if(!aD(Q[aW])){continue}var aP=Q[aW],aH=aP.xaxis,aF=aP.yaxis,aV=aP.datapoints.points,aT=aP.datapoints.pointsize,aQ=aH.c2p(aI),aN=aF.c2p(aG),aC=aO/aH.scale,aB=aO/aF.scale;if(aH.options.inverseTransform){aC=Number.MAX_VALUE}if(aF.options.inverseTransform){aB=Number.MAX_VALUE}if(aP.lines.show||aP.points.show){for(aU=0;aU<aV.length;aU+=aT){var aK=aV[aU],aJ=aV[aU+1];if(aK==null){continue}if(aK-aQ>aC||aK-aQ<-aC||aJ-aN>aB||aJ-aN<-aB){continue}var aM=Math.abs(aH.p2c(aK)-aI),aL=Math.abs(aF.p2c(aJ)-aG),aS=aM*aM+aL*aL;if(aS<a0){a0=aS;aY=[aW,aU/aT]}}}if(aP.bars.show&&!aY){var aE=aP.bars.align=="left"?0:-aP.bars.barWidth/2,aX=aE+aP.bars.barWidth;for(aU=0;aU<aV.length;aU+=aT){var aK=aV[aU],aJ=aV[aU+1],aZ=aV[aU+2];if(aK==null){continue}if(Q[aW].bars.horizontal?(aQ<=Math.max(aZ,aK)&&aQ>=Math.min(aZ,aK)&&aN>=aJ+aE&&aN<=aJ+aX):(aQ>=aK+aE&&aQ<=aK+aX&&aN>=Math.min(aZ,aJ)&&aN<=Math.max(aZ,aJ))){aY=[aW,aU/aT]}}}}if(aY){aW=aY[0];aU=aY[1];aT=Q[aW].datapoints.pointsize;return{datapoint:Q[aW].datapoints.points.slice(aU*aT,(aU+1)*aT),dataIndex:aU,series:Q[aW],seriesIndex:aW}}return null}function aa(aB){if(O.grid.hoverable){u("plothover",aB,function(aC){return aC.hoverable!=false})}}function l(aB){if(O.grid.hoverable){u("plothover",aB,function(aC){return false})}}function R(aB){u("plotclick",aB,function(aC){return aC.clickable!=false})}function u(aC,aB,aD){var aE=y.offset(),aH=aB.pageX-aE.left-q.left,aF=aB.pageY-aE.top-q.top,aJ=C({left:aH,top:aF});aJ.pageX=aB.pageX;aJ.pageY=aB.pageY;var aK=K(aH,aF,aD);if(aK){aK.pageX=parseInt(aK.series.xaxis.p2c(aK.datapoint[0])+aE.left+q.left);aK.pageY=parseInt(aK.series.yaxis.p2c(aK.datapoint[1])+aE.top+q.top)}if(O.grid.autoHighlight){for(var aG=0;aG<ab.length;++aG){var aI=ab[aG];if(aI.auto==aC&&!(aK&&aI.series==aK.series&&aI.point[0]==aK.datapoint[0]&&aI.point[1]==aK.datapoint[1])){T(aI.series,aI.point)}}if(aK){x(aK.series,aK.datapoint,aC)}}av.trigger(aC,[aJ,aK])}function f(){if(!M){M=setTimeout(s,30)}}function s(){M=null;A.save();A.clearRect(0,0,G,I);A.translate(q.left,q.top);var aC,aB;for(aC=0;aC<ab.length;++aC){aB=ab[aC];if(aB.series.bars.show){v(aB.series,aB.point)}else{ay(aB.series,aB.point)}}A.restore();an(ak.drawOverlay,[A])}function x(aD,aB,aF){if(typeof aD=="number"){aD=Q[aD]}if(typeof aB=="number"){var aE=aD.datapoints.pointsize;aB=aD.datapoints.points.slice(aE*aB,aE*(aB+1))}var aC=al(aD,aB);if(aC==-1){ab.push({series:aD,point:aB,auto:aF});f()}else{if(!aF){ab[aC].auto=false}}}function T(aD,aB){if(aD==null&&aB==null){ab=[];f()}if(typeof aD=="number"){aD=Q[aD]}if(typeof aB=="number"){aB=aD.data[aB]}var aC=al(aD,aB);if(aC!=-1){ab.splice(aC,1);f()}}function al(aD,aE){for(var aB=0;aB<ab.length;++aB){var aC=ab[aB];if(aC.series==aD&&aC.point[0]==aE[0]&&aC.point[1]==aE[1]){return aB}}return -1}function ay(aE,aD){var aC=aD[0],aI=aD[1],aH=aE.xaxis,aG=aE.yaxis;if(aC<aH.min||aC>aH.max||aI<aG.min||aI>aG.max){return}var aF=aE.points.radius+aE.points.lineWidth/2;A.lineWidth=aF;A.strokeStyle=c.color.parse(aE.color).scale("a",0.5).toString();var aB=1.5*aF,aC=aH.p2c(aC),aI=aG.p2c(aI);A.beginPath();if(aE.points.symbol=="circle"){A.arc(aC,aI,aB,0,2*Math.PI,false)}else{aE.points.symbol(A,aC,aI,aB,false)}A.closePath();A.stroke()}function v(aE,aB){A.lineWidth=aE.bars.lineWidth;A.strokeStyle=c.color.parse(aE.color).scale("a",0.5).toString();var aD=c.color.parse(aE.color).scale("a",0.5).toString();var aC=aE.bars.align=="left"?0:-aE.bars.barWidth/2;E(aB[0],aB[1],aB[2]||0,aC,aC+aE.bars.barWidth,0,function(){return aD},aE.xaxis,aE.yaxis,A,aE.bars.horizontal,aE.bars.lineWidth)}function am(aJ,aB,aH,aC){if(typeof aJ=="string"){return aJ}else{var aI=H.createLinearGradient(0,aH,0,aB);for(var aE=0,aD=aJ.colors.length;aE<aD;++aE){var aF=aJ.colors[aE];if(typeof aF!="string"){var aG=c.color.parse(aC);if(aF.brightness!=null){aG=aG.scale("rgb",aF.brightness)}if(aF.opacity!=null){aG.a*=aF.opacity}aF=aG.toString()}aI.addColorStop(aE/(aD-1),aF)}return aI}}}c.plot=function(g,e,d){var f=new b(c(g),e,d,c.plot.plugins);return f};c.plot.version="0.7";c.plot.plugins=[];c.plot.formatDate=function(l,f,h){var o=function(d){d=""+d;return d.length==1?"0"+d:d};var e=[];var p=false,j=false;var n=l.getUTCHours();var k=n<12;if(h==null){h=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]}if(f.search(/%p|%P/)!=-1){if(n>12){n=n-12}else{if(n==0){n=12}}}for(var g=0;g<f.length;++g){var m=f.charAt(g);if(p){switch(m){case"h":m=""+n;break;case"H":m=o(n);break;case"M":m=o(l.getUTCMinutes());break;case"S":m=o(l.getUTCSeconds());break;case"d":m=""+l.getUTCDate();break;case"m":m=""+(l.getUTCMonth()+1);break;case"y":m=""+l.getUTCFullYear();break;case"b":m=""+h[l.getUTCMonth()];break;case"p":m=(k)?("am"):("pm");break;case"P":m=(k)?("AM"):("PM");break;case"0":m="";j=true;break}if(m&&j){m=o(m);j=false}e.push(m);if(!j){p=false}}else{if(m=="%"){p=true}else{e.push(m)}}}return e.join("")};function a(e,d){return d*Math.floor(e/d)}})(jQuery);
(function(e){function r(r){function p(t,n,r){l||(l=!0,s=t.getCanvas(),o=e(s).parent(),i=t.getOptions(),t.setData(d(t.getData())))}function d(t){var n=0,r=0,s=0,o=i.series.pie.combine.color,u=[];for(var a=0;a<t.length;++a){var f=t[a].data;e.isArray(f)?e.isNumeric(f[1])?f[1]=+f[1]:f[1]=0:e.isNumeric(f)?f=[1,+f]:f=[1,0],t[a].data=[f]}for(var a=0;a<t.length;++a)n+=t[a].data[0][1];for(var a=0;a<t.length;++a){var f=t[a].data[0][1];f/n<=i.series.pie.combine.threshold&&(r+=f,s++,o||(o=t[a].color))}for(var a=0;a<t.length;++a){var f=t[a].data[0][1];(s<2||f/n>i.series.pie.combine.threshold)&&u.push({data:[[1,f]],color:t[a].color,label:t[a].label,angle:f*Math.PI*2/n,percent:f/(n/100)})}return s>1&&u.push({data:[[1,r]],color:o,label:i.series.pie.combine.label,angle:r*Math.PI*2/n,percent:r/(n/100)}),u}function v(r,s){function y(){c.clearRect(0,0,h,p),o.children().filter(".pieLabel, .pieLabelBackground").remove()}function b(){var e=i.series.pie.shadow.left,t=i.series.pie.shadow.top,n=10,r=i.series.pie.shadow.alpha,s=i.series.pie.radius>1?i.series.pie.radius:u*i.series.pie.radius;if(s>=h/2-e||s*i.series.pie.tilt>=p/2-t||s<=n)return;c.save(),c.translate(e,t),c.globalAlpha=r,c.fillStyle="#000",c.translate(a,f),c.scale(1,i.series.pie.tilt);for(var o=1;o<=n;o++)c.beginPath(),c.arc(0,0,s,0,Math.PI*2,!1),c.fill(),s-=o;c.restore()}function w(){function l(e,t,i){if(e<=0||isNaN(e))return;i?c.fillStyle=t:(c.strokeStyle=t,c.lineJoin="round"),c.beginPath(),Math.abs(e-Math.PI*2)>1e-9&&c.moveTo(0,0),c.arc(0,0,n,r,r+e/2,!1),c.arc(0,0,n,r+e/2,r+e,!1),c.closePath(),r+=e,i?c.fill():c.stroke()}function d(){function l(t,n,s){if(t.data[0][1]==0)return!0;var u=i.legend.labelFormatter,l,c=i.series.pie.label.formatter;u?l=u(t.label,t):l=t.label,c&&(l=c(l,t));var d=(n+t.angle+n)/2,v=a+Math.round(Math.cos(d)*r),m=f+Math.round(Math.sin(d)*r)*i.series.pie.tilt,g="<span class='pieLabel' id='pieLabel"+s+"' style='position:absolute;top:"+m+"px;left:"+v+"px;'>"+l+"</span>";o.append(g);var y=o.children("#pieLabel"+s),b=m-y.height()/2,w=v-y.width()/2;y.css("top",b),y.css("left",w);if(0-b>0||0-w>0||p-(b+y.height())<0||h-(w+y.width())<0)return!1;if(i.series.pie.label.background.opacity!=0){var E=i.series.pie.label.background.color;E==null&&(E=t.color);var S="top:"+b+"px;left:"+w+"px;";e("<div class='pieLabelBackground' style='position:absolute;width:"+y.width()+"px;height:"+y.height()+"px;"+S+"background-color:"+E+";'></div>").css("opacity",i.series.pie.label.background.opacity).insertBefore(y)}return!0}var n=t,r=i.series.pie.label.radius>1?i.series.pie.label.radius:u*i.series.pie.label.radius;for(var s=0;s<v.length;++s){if(v[s].percent>=i.series.pie.label.threshold*100&&!l(v[s],n,s))return!1;n+=v[s].angle}return!0}var t=Math.PI*i.series.pie.startAngle,n=i.series.pie.radius>1?i.series.pie.radius:u*i.series.pie.radius;c.save(),c.translate(a,f),c.scale(1,i.series.pie.tilt),c.save();var r=t;for(var s=0;s<v.length;++s)v[s].startAngle=r,l(v[s].angle,v[s].color,!0);c.restore();if(i.series.pie.stroke.width>0){c.save(),c.lineWidth=i.series.pie.stroke.width,r=t;for(var s=0;s<v.length;++s)l(v[s].angle,i.series.pie.stroke.color,!1);c.restore()}return m(c),c.restore(),i.series.pie.label.show?d():!0}if(!o)return;var h=r.getPlaceholder().width(),p=r.getPlaceholder().height(),d=o.children().filter(".legend").children().width()||0;c=s,l=!1,u=Math.min(h,p/i.series.pie.tilt)/2,f=p/2+i.series.pie.offset.top,a=h/2,i.series.pie.offset.left=="auto"?i.legend.position.match("w")?a+=d/2:a-=d/2:a+=i.series.pie.offset.left,a<u?a=u:a>h-u&&(a=h-u);var v=r.getData(),g=0;do g>0&&(u*=n),g+=1,y(),i.series.pie.tilt<=.8&&b();while(!w()&&g<t);g>=t&&(y(),o.prepend("<div class='error'>Could not draw pie with labels contained inside canvas</div>")),r.setSeries&&r.insertLegend&&(r.setSeries(v),r.insertLegend())}function m(e){if(i.series.pie.innerRadius>0){e.save();var t=i.series.pie.innerRadius>1?i.series.pie.innerRadius:u*i.series.pie.innerRadius;e.globalCompositeOperation="destination-out",e.beginPath(),e.fillStyle=i.series.pie.stroke.color,e.arc(0,0,t,0,Math.PI*2,!1),e.fill(),e.closePath(),e.restore(),e.save(),e.beginPath(),e.strokeStyle=i.series.pie.stroke.color,e.arc(0,0,t,0,Math.PI*2,!1),e.stroke(),e.closePath(),e.restore()}}function g(e,t){for(var n=!1,r=-1,i=e.length,s=i-1;++r<i;s=r)(e[r][1]<=t[1]&&t[1]<e[s][1]||e[s][1]<=t[1]&&t[1]<e[r][1])&&t[0]<(e[s][0]-e[r][0])*(t[1]-e[r][1])/(e[s][1]-e[r][1])+e[r][0]&&(n=!n);return n}function y(e,t){var n=r.getData(),i=r.getOptions(),s=i.series.pie.radius>1?i.series.pie.radius:u*i.series.pie.radius,o,l;for(var h=0;h<n.length;++h){var p=n[h];if(p.pie.show){c.save(),c.beginPath(),c.moveTo(0,0),c.arc(0,0,s,p.startAngle,p.startAngle+p.angle/2,!1),c.arc(0,0,s,p.startAngle+p.angle/2,p.startAngle+p.angle,!1),c.closePath(),o=e-a,l=t-f;if(c.isPointInPath){if(c.isPointInPath(e-a,t-f))return c.restore(),{datapoint:[p.percent,p.data],dataIndex:0,series:p,seriesIndex:h}}else{var d=s*Math.cos(p.startAngle),v=s*Math.sin(p.startAngle),m=s*Math.cos(p.startAngle+p.angle/4),y=s*Math.sin(p.startAngle+p.angle/4),b=s*Math.cos(p.startAngle+p.angle/2),w=s*Math.sin(p.startAngle+p.angle/2),E=s*Math.cos(p.startAngle+p.angle/1.5),S=s*Math.sin(p.startAngle+p.angle/1.5),x=s*Math.cos(p.startAngle+p.angle),T=s*Math.sin(p.startAngle+p.angle),N=[[0,0],[d,v],[m,y],[b,w],[E,S],[x,T]],C=[o,l];if(g(N,C))return c.restore(),{datapoint:[p.percent,p.data],dataIndex:0,series:p,seriesIndex:h}}c.restore()}}return null}function b(e){E("plothover",e)}function w(e){E("plotclick",e)}function E(e,t){var n=r.offset(),s=parseInt(t.pageX-n.left),u=parseInt(t.pageY-n.top),a=y(s,u);if(i.grid.autoHighlight)for(var f=0;f<h.length;++f){var l=h[f];l.auto==e&&(!a||l.series!=a.series)&&x(l.series)}a&&S(a.series,e);var c={pageX:t.pageX,pageY:t.pageY};o.trigger(e,[c,a])}function S(e,t){var n=T(e);n==-1?(h.push({series:e,auto:t}),r.triggerRedrawOverlay()):t||(h[n].auto=!1)}function x(e){e==null&&(h=[],r.triggerRedrawOverlay());var t=T(e);t!=-1&&(h.splice(t,1),r.triggerRedrawOverlay())}function T(e){for(var t=0;t<h.length;++t){var n=h[t];if(n.series==e)return t}return-1}function N(e,t){function s(e){if(e.angle<=0||isNaN(e.angle))return;t.fillStyle="rgba(255, 255, 255, "+n.series.pie.highlight.opacity+")",t.beginPath(),Math.abs(e.angle-Math.PI*2)>1e-9&&t.moveTo(0,0),t.arc(0,0,r,e.startAngle,e.startAngle+e.angle/2,!1),t.arc(0,0,r,e.startAngle+e.angle/2,e.startAngle+e.angle,!1),t.closePath(),t.fill()}var n=e.getOptions(),r=n.series.pie.radius>1?n.series.pie.radius:u*n.series.pie.radius;t.save(),t.translate(a,f),t.scale(1,n.series.pie.tilt);for(var i=0;i<h.length;++i)s(h[i].series);m(t),t.restore()}var s=null,o=null,u=null,a=null,f=null,l=!1,c=null,h=[];r.hooks.processOptions.push(function(e,t){t.series.pie.show&&(t.grid.show=!1,t.series.pie.label.show=="auto"&&(t.legend.show?t.series.pie.label.show=!1:t.series.pie.label.show=!0),t.series.pie.radius=="auto"&&(t.series.pie.label.show?t.series.pie.radius=.75:t.series.pie.radius=1),t.series.pie.tilt>1?t.series.pie.tilt=1:t.series.pie.tilt<0&&(t.series.pie.tilt=0))}),r.hooks.bindEvents.push(function(e,t){var n=e.getOptions();n.series.pie.show&&(n.grid.hoverable&&t.unbind("mousemove").mousemove(b),n.grid.clickable&&t.unbind("click").click(w))}),r.hooks.processDatapoints.push(function(e,t,n,r){var i=e.getOptions();i.series.pie.show&&p(e,t,n,r)}),r.hooks.drawOverlay.push(function(e,t){var n=e.getOptions();n.series.pie.show&&N(e,t)}),r.hooks.draw.push(function(e,t){var n=e.getOptions();n.series.pie.show&&v(e,t)})}var t=10,n=.95,i={series:{pie:{show:!1,radius:"auto",innerRadius:0,startAngle:1.5,tilt:1,shadow:{left:5,top:15,alpha:.02},offset:{top:0,left:"auto"},stroke:{color:"#fff",width:1},label:{show:"auto",formatter:function(e,t){return"<div style='font-size:x-small;text-align:center;padding:2px;color:"+t.color+";'>"+e+"<br/>"+Math.round(t.percent)+"%</div>"},radius:1,background:{color:null,opacity:0},threshold:0},combine:{threshold:-1,color:null,label:"Other"},highlight:{opacity:.5}}}};e.plot.plugins.push({init:r,options:i,name:"pie",version:"1.1"})})(jQuery);

/*
Flot plugin for stacking data sets, i.e. putting them on top of each
other, for accumulative graphs.

The plugin assumes the data is sorted on x (or y if stacking
horizontally). For line charts, it is assumed that if a line has an
undefined gap (from a null point), then the line above it should have
the same gap - insert zeros instead of "null" if you want another
behaviour. This also holds for the start and end of the chart. Note
that stacking a mix of positive and negative values in most instances
doesn't make sense (so it looks weird).

Two or more series are stacked when their "stack" attribute is set to
the same key (which can be any number or string or just "true"). To
specify the default stack, you can set

  series: {
    stack: null or true or key (number/string)
  }

or specify it for a specific series

  $.plot($("#placeholder"), [{ data: [ ... ], stack: true }])
  
The stacking order is determined by the order of the data series in
the array (later series end up on top of the previous).

Internally, the plugin modifies the datapoints in each series, adding
an offset to the y value. For line series, extra data points are
inserted through interpolation. If there's a second y value, it's also
adjusted (e.g for bar charts or filled areas).
*/

(function ($) {
    var options = {
        series: { stack: null } // or number/string
    };
    
    function init(plot) {
        function findMatchingSeries(s, allseries) {
            var res = null
            for (var i = 0; i < allseries.length; ++i) {
                if (s == allseries[i])
                    break;
                
                if (allseries[i].stack == s.stack)
                    res = allseries[i];
            }
            
            return res;
        }
        
        function stackData(plot, s, datapoints) {
            if (s.stack == null)
                return;

            var other = findMatchingSeries(s, plot.getData());
            if (!other)
                return;

            var ps = datapoints.pointsize,
                points = datapoints.points,
                otherps = other.datapoints.pointsize,
                otherpoints = other.datapoints.points,
                newpoints = [],
                px, py, intery, qx, qy, bottom,
                withlines = s.lines.show,
                horizontal = s.bars.horizontal,
                withbottom = ps > 2 && (horizontal ? datapoints.format[2].x : datapoints.format[2].y),
                withsteps = withlines && s.lines.steps,
                fromgap = true,
                keyOffset = horizontal ? 1 : 0,
                accumulateOffset = horizontal ? 0 : 1,
                i = 0, j = 0, l;

            while (true) {
                if (i >= points.length)
                    break;

                l = newpoints.length;

                if (points[i] == null) {
                    // copy gaps
                    for (m = 0; m < ps; ++m)
                        newpoints.push(points[i + m]);
                    i += ps;
                }
                else if (j >= otherpoints.length) {
                    // for lines, we can't use the rest of the points
                    if (!withlines) {
                        for (m = 0; m < ps; ++m)
                            newpoints.push(points[i + m]);
                    }
                    i += ps;
                }
                else if (otherpoints[j] == null) {
                    // oops, got a gap
                    for (m = 0; m < ps; ++m)
                        newpoints.push(null);
                    fromgap = true;
                    j += otherps;
                }
                else {
                    // cases where we actually got two points
                    px = points[i + keyOffset];
                    py = points[i + accumulateOffset];
                    qx = otherpoints[j + keyOffset];
                    qy = otherpoints[j + accumulateOffset];
                    bottom = 0;

                    if (px == qx) {
                        for (m = 0; m < ps; ++m)
                            newpoints.push(points[i + m]);

                        newpoints[l + accumulateOffset] += qy;
                        bottom = qy;
                        
                        i += ps;
                        j += otherps;
                    }
                    else if (px > qx) {
                        // we got past point below, might need to
                        // insert interpolated extra point
                        if (withlines && i > 0 && points[i - ps] != null) {
                            intery = py + (points[i - ps + accumulateOffset] - py) * (qx - px) / (points[i - ps + keyOffset] - px);
                            newpoints.push(qx);
                            newpoints.push(intery + qy);
                            for (m = 2; m < ps; ++m)
                                newpoints.push(points[i + m]);
                            bottom = qy; 
                        }

                        j += otherps;
                    }
                    else { // px < qx
                        if (fromgap && withlines) {
                            // if we come from a gap, we just skip this point
                            i += ps;
                            continue;
                        }
                            
                        for (m = 0; m < ps; ++m)
                            newpoints.push(points[i + m]);
                        
                        // we might be able to interpolate a point below,
                        // this can give us a better y
                        if (withlines && j > 0 && otherpoints[j - otherps] != null)
                            bottom = qy + (otherpoints[j - otherps + accumulateOffset] - qy) * (px - qx) / (otherpoints[j - otherps + keyOffset] - qx);

                        newpoints[l + accumulateOffset] += bottom;
                        
                        i += ps;
                    }

                    fromgap = false;
                    
                    if (l != newpoints.length && withbottom)
                        newpoints[l + 2] += bottom;
                }

                // maintain the line steps invariant
                if (withsteps && l != newpoints.length && l > 0
                    && newpoints[l] != null
                    && newpoints[l] != newpoints[l - ps]
                    && newpoints[l + 1] != newpoints[l - ps + 1]) {
                    for (m = 0; m < ps; ++m)
                        newpoints[l + ps + m] = newpoints[l + m];
                    newpoints[l + 1] = newpoints[l - ps + 1];
                }
            }

            datapoints.points = newpoints;
        }
        
        plot.hooks.processDatapoints.push(stackData);
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'stack',
        version: '1.2'
    });
})(jQuery);

(function(n,p,u){var w=n([]),s=n.resize=n.extend(n.resize,{}),o,l="setTimeout",m="resize",t=m+"-special-event",v="delay",r="throttleWindow";s[v]=250;s[r]=true;n.event.special[m]={setup:function(){if(!s[r]&&this[l]){return false}var a=n(this);w=w.add(a);n.data(this,t,{w:a.width(),h:a.height()});if(w.length===1){q()}},teardown:function(){if(!s[r]&&this[l]){return false}var a=n(this);w=w.not(a);a.removeData(t);if(!w.length){clearTimeout(o)}},add:function(b){if(!s[r]&&this[l]){return false}var c;function a(d,h,g){var f=n(this),e=n.data(this,t);e.w=h!==u?h:f.width();e.h=g!==u?g:f.height();c.apply(this,arguments)}if(n.isFunction(b)){c=b;return a}else{c=b.handler;b.handler=a}}};function q(){o=p[l](function(){w.each(function(){var d=n(this),a=d.width(),b=d.height(),c=n.data(this,t);if(a!==c.w||b!==c.h){d.trigger(m,[c.w=a,c.h=b])}});q()},s[v])}})(jQuery,this);(function(b){var a={};function c(f){function e(){var h=f.getPlaceholder();if(h.width()==0||h.height()==0){return}f.resize();f.setupGrid();f.draw()}function g(i,h){i.getPlaceholder().resize(e)}function d(i,h){i.getPlaceholder().unbind("resize",e)}f.hooks.bindEvents.push(g);f.hooks.shutdown.push(d)}b.plot.plugins.push({init:c,options:a,name:"resize",version:"1.0"})})(jQuery);
// Chosen, a Select Box Enhancer for jQuery and Protoype
// by Patrick Filler for Harvest, http://getharvest.com
// 
// Version 0.9.8
// Full source at https://github.com/harvesthq/chosen
// Copyright (c) 2011 Harvest http://getharvest.com

// MIT License, https://github.com/harvesthq/chosen/blob/master/LICENSE.md
// This file is generated by `cake build`, do not edit it by hand.
((function(){var a;a=function(){function a(){this.options_index=0,this.parsed=[]}return a.prototype.add_node=function(a){return a.nodeName==="OPTGROUP"?this.add_group(a):this.add_option(a)},a.prototype.add_group=function(a){var b,c,d,e,f,g;b=this.parsed.length,this.parsed.push({array_index:b,group:!0,label:a.label,children:0,disabled:a.disabled}),f=a.childNodes,g=[];for(d=0,e=f.length;d<e;d++)c=f[d],g.push(this.add_option(c,b,a.disabled));return g},a.prototype.add_option=function(a,b,c){if(a.nodeName==="OPTION")return a.text!==""?(b!=null&&(this.parsed[b].children+=1),this.parsed.push({array_index:this.parsed.length,options_index:this.options_index,value:a.value,text:a.text,html:a.innerHTML,selected:a.selected,disabled:c===!0?c:a.disabled,group_array_index:b,classes:a.className,style:a.style.cssText})):this.parsed.push({array_index:this.parsed.length,options_index:this.options_index,empty:!0}),this.options_index+=1},a}(),a.select_to_array=function(b){var c,d,e,f,g;d=new a,g=b.childNodes;for(e=0,f=g.length;e<f;e++)c=g[e],d.add_node(c);return d.parsed},this.SelectParser=a})).call(this),function(){var a,b;b=this,a=function(){function a(a,b){this.form_field=a,this.options=b!=null?b:{},this.set_default_values(),this.is_multiple=this.form_field.multiple,this.set_default_text(),this.setup(),this.set_up_html(),this.register_observers(),this.finish_setup()}return a.prototype.set_default_values=function(){var a=this;return this.click_test_action=function(b){return a.test_active_click(b)},this.activate_action=function(b){return a.activate_field(b)},this.active_field=!1,this.mouse_on_container=!1,this.results_showing=!1,this.result_highlighted=null,this.result_single_selected=null,this.allow_single_deselect=this.options.allow_single_deselect!=null&&this.form_field.options[0]!=null&&this.form_field.options[0].text===""?this.options.allow_single_deselect:!1,this.disable_search_threshold=this.options.disable_search_threshold||0,this.search_contains=this.options.search_contains||!1,this.choices=0,this.single_backstroke_delete=this.options.single_backstroke_delete||!1,this.max_selected_options=this.options.max_selected_options||Infinity},a.prototype.set_default_text=function(){return this.form_field.getAttribute("data-placeholder")?this.default_text=this.form_field.getAttribute("data-placeholder"):this.is_multiple?this.default_text=this.options.placeholder_text_multiple||this.options.placeholder_text||"Select Some Options":this.default_text=this.options.placeholder_text_single||this.options.placeholder_text||"Select an Option",this.results_none_found=this.form_field.getAttribute("data-no_results_text")||this.options.no_results_text||"No results match"},a.prototype.mouse_enter=function(){return this.mouse_on_container=!0},a.prototype.mouse_leave=function(){return this.mouse_on_container=!1},a.prototype.input_focus=function(a){var b=this;if(!this.active_field)return setTimeout(function(){return b.container_mousedown()},50)},a.prototype.input_blur=function(a){var b=this;if(!this.mouse_on_container)return this.active_field=!1,setTimeout(function(){return b.blur_test()},100)},a.prototype.result_add_option=function(a){var b,c;return a.disabled?"":(a.dom_id=this.container_id+"_o_"+a.array_index,b=a.selected&&this.is_multiple?[]:["active-result"],a.selected&&b.push("result-selected"),a.group_array_index!=null&&b.push("group-option"),a.classes!==""&&b.push(a.classes),c=a.style.cssText!==""?' style="'+a.style+'"':"",'<li id="'+a.dom_id+'" class="'+b.join(" ")+'"'+c+">"+a.html+"</li>")},a.prototype.results_update_field=function(){return this.is_multiple||this.results_reset_cleanup(),this.result_clear_highlight(),this.result_single_selected=null,this.results_build()},a.prototype.results_toggle=function(){return this.results_showing?this.results_hide():this.results_show()},a.prototype.results_search=function(a){return this.results_showing?this.winnow_results():this.results_show()},a.prototype.keyup_checker=function(a){var b,c;b=(c=a.which)!=null?c:a.keyCode,this.search_field_scale();switch(b){case 8:if(this.is_multiple&&this.backstroke_length<1&&this.choices>0)return this.keydown_backstroke();if(!this.pending_backstroke)return this.result_clear_highlight(),this.results_search();break;case 13:a.preventDefault();if(this.results_showing)return this.result_select(a);break;case 27:return this.results_showing&&this.results_hide(),!0;case 9:case 38:case 40:case 16:case 91:case 17:break;default:return this.results_search()}},a.prototype.generate_field_id=function(){var a;return a=this.generate_random_id(),this.form_field.id=a,a},a.prototype.generate_random_char=function(){var a,b,c;return a="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",c=Math.floor(Math.random()*a.length),b=a.substring(c,c+1)},a}(),b.AbstractChosen=a}.call(this),function(){var a,b,c,d,e=Object.prototype.hasOwnProperty,f=function(a,b){function d(){this.constructor=a}for(var c in b)e.call(b,c)&&(a[c]=b[c]);return d.prototype=b.prototype,a.prototype=new d,a.__super__=b.prototype,a};d=this,a=jQuery,a.fn.extend({chosen:function(c){return!a.browser.msie||a.browser.version!=="6.0"&&a.browser.version!=="7.0"?this.each(function(d){var e;e=a(this);if(!e.hasClass("chzn-done"))return e.data("chosen",new b(this,c))}):this}}),b=function(b){function e(){e.__super__.constructor.apply(this,arguments)}return f(e,b),e.prototype.setup=function(){return this.form_field_jq=a(this.form_field),this.current_value=this.form_field_jq.val(),this.is_rtl=this.form_field_jq.hasClass("chzn-rtl")},e.prototype.finish_setup=function(){return this.form_field_jq.addClass("chzn-done")},e.prototype.set_up_html=function(){var b,d,e,f;return this.container_id=this.form_field.id.length?this.form_field.id.replace(/[^\w]/g,"_"):this.generate_field_id(),this.container_id+="_chzn",this.f_width=this.form_field_jq.outerWidth(),b=a("<div />",{id:this.container_id,"class":"chzn-container"+(this.is_rtl?" chzn-rtl":""),style:"width: "+this.f_width+"px;"}),this.is_multiple?b.html('<ul class="chzn-choices"><li class="search-field"><input type="text" value="'+this.default_text+'" class="default" autocomplete="off" style="width:25px;" /></li></ul><div class="chzn-drop" style="left:-9000px;"><ul class="chzn-results"></ul></div>'):b.html('<a href="javascript:void(0)" class="chzn-single chzn-default"><span>'+this.default_text+'</span><div><b></b></div></a><div class="chzn-drop" style="left:-9000px;"><div class="chzn-search"><input type="text" autocomplete="off" /></div><ul class="chzn-results"></ul></div>'),this.form_field_jq.hide().after(b),this.container=a("#"+this.container_id),this.container.addClass("chzn-container-"+(this.is_multiple?"multi":"single")),this.dropdown=this.container.find("div.chzn-drop").first(),d=this.container.height(),e=this.f_width-c(this.dropdown),this.dropdown.css({width:e+"px",top:d+"px"}),this.search_field=this.container.find("input").first(),this.search_results=this.container.find("ul.chzn-results").first(),this.search_field_scale(),this.search_no_results=this.container.find("li.no-results").first(),this.is_multiple?(this.search_choices=this.container.find("ul.chzn-choices").first(),this.search_container=this.container.find("li.search-field").first()):(this.search_container=this.container.find("div.chzn-search").first(),this.selected_item=this.container.find(".chzn-single").first(),f=e-c(this.search_container)-c(this.search_field),this.search_field.css({width:f+"px"})),this.results_build(),this.set_tab_index(),this.form_field_jq.trigger("liszt:ready",{chosen:this})},e.prototype.register_observers=function(){var a=this;return this.container.mousedown(function(b){return a.container_mousedown(b)}),this.container.mouseup(function(b){return a.container_mouseup(b)}),this.container.mouseenter(function(b){return a.mouse_enter(b)}),this.container.mouseleave(function(b){return a.mouse_leave(b)}),this.search_results.mouseup(function(b){return a.search_results_mouseup(b)}),this.search_results.mouseover(function(b){return a.search_results_mouseover(b)}),this.search_results.mouseout(function(b){return a.search_results_mouseout(b)}),this.form_field_jq.bind("liszt:updated",function(b){return a.results_update_field(b)}),this.search_field.blur(function(b){return a.input_blur(b)}),this.search_field.keyup(function(b){return a.keyup_checker(b)}),this.search_field.keydown(function(b){return a.keydown_checker(b)}),this.is_multiple?(this.search_choices.click(function(b){return a.choices_click(b)}),this.search_field.focus(function(b){return a.input_focus(b)})):this.container.click(function(a){return a.preventDefault()})},e.prototype.search_field_disabled=function(){this.is_disabled=this.form_field_jq[0].disabled;if(this.is_disabled)return this.container.addClass("chzn-disabled"),this.search_field[0].disabled=!0,this.is_multiple||this.selected_item.unbind("focus",this.activate_action),this.close_field();this.container.removeClass("chzn-disabled"),this.search_field[0].disabled=!1;if(!this.is_multiple)return this.selected_item.bind("focus",this.activate_action)},e.prototype.container_mousedown=function(b){var c;if(!this.is_disabled)return c=b!=null?a(b.target).hasClass("search-choice-close"):!1,b&&b.type==="mousedown"&&!this.results_showing&&b.stopPropagation(),!this.pending_destroy_click&&!c?(this.active_field?!this.is_multiple&&b&&(a(b.target)[0]===this.selected_item[0]||a(b.target).parents("a.chzn-single").length)&&(b.preventDefault(),this.results_toggle()):(this.is_multiple&&this.search_field.val(""),a(document).click(this.click_test_action),this.results_show()),this.activate_field()):this.pending_destroy_click=!1},e.prototype.container_mouseup=function(a){if(a.target.nodeName==="ABBR"&&!this.is_disabled)return this.results_reset(a)},e.prototype.blur_test=function(a){if(!this.active_field&&this.container.hasClass("chzn-container-active"))return this.close_field()},e.prototype.close_field=function(){return a(document).unbind("click",this.click_test_action),this.is_multiple||(this.selected_item.attr("tabindex",this.search_field.attr("tabindex")),this.search_field.attr("tabindex",-1)),this.active_field=!1,this.results_hide(),this.container.removeClass("chzn-container-active"),this.winnow_results_clear(),this.clear_backstroke(),this.show_search_field_default(),this.search_field_scale()},e.prototype.activate_field=function(){return!this.is_multiple&&!this.active_field&&(this.search_field.attr("tabindex",this.selected_item.attr("tabindex")),this.selected_item.attr("tabindex",-1)),this.container.addClass("chzn-container-active"),this.active_field=!0,this.search_field.val(this.search_field.val()),this.search_field.focus()},e.prototype.test_active_click=function(b){return a(b.target).parents("#"+this.container_id).length?this.active_field=!0:this.close_field()},e.prototype.results_build=function(){var a,b,c,e,f;this.parsing=!0,this.results_data=d.SelectParser.select_to_array(this.form_field),this.is_multiple&&this.choices>0?(this.search_choices.find("li.search-choice").remove(),this.choices=0):this.is_multiple||(this.selected_item.addClass("chzn-default").find("span").text(this.default_text),this.form_field.options.length<=this.disable_search_threshold?this.container.addClass("chzn-container-single-nosearch"):this.container.removeClass("chzn-container-single-nosearch")),a="",f=this.results_data;for(c=0,e=f.length;c<e;c++)b=f[c],b.group?a+=this.result_add_group(b):b.empty||(a+=this.result_add_option(b),b.selected&&this.is_multiple?this.choice_build(b):b.selected&&!this.is_multiple&&(this.selected_item.removeClass("chzn-default").find("span").text(b.text),this.allow_single_deselect&&this.single_deselect_control_build()));return this.search_field_disabled(),this.show_search_field_default(),this.search_field_scale(),this.search_results.html(a),this.parsing=!1},e.prototype.result_add_group=function(b){return b.disabled?"":(b.dom_id=this.container_id+"_g_"+b.array_index,'<li id="'+b.dom_id+'" class="group-result">'+a("<div />").text(b.label).html()+"</li>")},e.prototype.result_do_highlight=function(a){var b,c,d,e,f;if(a.length){this.result_clear_highlight(),this.result_highlight=a,this.result_highlight.addClass("highlighted"),d=parseInt(this.search_results.css("maxHeight"),10),f=this.search_results.scrollTop(),e=d+f,c=this.result_highlight.position().top+this.search_results.scrollTop(),b=c+this.result_highlight.outerHeight();if(b>=e)return this.search_results.scrollTop(b-d>0?b-d:0);if(c<f)return this.search_results.scrollTop(c)}},e.prototype.result_clear_highlight=function(){return this.result_highlight&&this.result_highlight.removeClass("highlighted"),this.result_highlight=null},e.prototype.results_show=function(){var a;if(!this.is_multiple)this.selected_item.addClass("chzn-single-with-drop"),this.result_single_selected&&this.result_do_highlight(this.result_single_selected);else if(this.max_selected_options<=this.choices)return this.form_field_jq.trigger("liszt:maxselected",{chosen:this}),!1;return a=this.is_multiple?this.container.height():this.container.height()-1,this.form_field_jq.trigger("liszt:showing_dropdown",{chosen:this}),this.dropdown.css({top:a+"px",left:0}),this.results_showing=!0,this.search_field.focus(),this.search_field.val(this.search_field.val()),this.winnow_results()},e.prototype.results_hide=function(){return this.is_multiple||this.selected_item.removeClass("chzn-single-with-drop"),this.result_clear_highlight(),this.form_field_jq.trigger("liszt:hiding_dropdown",{chosen:this}),this.dropdown.css({left:"-9000px"}),this.results_showing=!1},e.prototype.set_tab_index=function(a){var b;if(this.form_field_jq.attr("tabindex"))return b=this.form_field_jq.attr("tabindex"),this.form_field_jq.attr("tabindex",-1),this.is_multiple?this.search_field.attr("tabindex",b):(this.selected_item.attr("tabindex",b),this.search_field.attr("tabindex",-1))},e.prototype.show_search_field_default=function(){return this.is_multiple&&this.choices<1&&!this.active_field?(this.search_field.val(this.default_text),this.search_field.addClass("default")):(this.search_field.val(""),this.search_field.removeClass("default"))},e.prototype.search_results_mouseup=function(b){var c;c=a(b.target).hasClass("active-result")?a(b.target):a(b.target).parents(".active-result").first();if(c.length)return this.result_highlight=c,this.result_select(b)},e.prototype.search_results_mouseover=function(b){var c;c=a(b.target).hasClass("active-result")?a(b.target):a(b.target).parents(".active-result").first();if(c)return this.result_do_highlight(c)},e.prototype.search_results_mouseout=function(b){if(a(b.target).hasClass("active-result"))return this.result_clear_highlight()},e.prototype.choices_click=function(b){b.preventDefault();if(this.active_field&&!a(b.target).hasClass("search-choice")&&!this.results_showing)return this.results_show()},e.prototype.choice_build=function(b){var c,d,e=this;return this.is_multiple&&this.max_selected_options<=this.choices?(this.form_field_jq.trigger("liszt:maxselected",{chosen:this}),!1):(c=this.container_id+"_c_"+b.array_index,this.choices+=1,this.search_container.before('<li class="search-choice" id="'+c+'"><span>'+b.html+'</span><a href="javascript:void(0)" class="search-choice-close" rel="'+b.array_index+'"></a></li>'),d=a("#"+c).find("a").first(),d.click(function(a){return e.choice_destroy_link_click(a)}))},e.prototype.choice_destroy_link_click=function(b){return b.preventDefault(),this.is_disabled?b.stopPropagation:(this.pending_destroy_click=!0,this.choice_destroy(a(b.target)))},e.prototype.choice_destroy=function(a){return this.choices-=1,this.show_search_field_default(),this.is_multiple&&this.choices>0&&this.search_field.val().length<1&&this.results_hide(),this.result_deselect(a.attr("rel")),a.parents("li").first().remove()},e.prototype.results_reset=function(){this.form_field.options[0].selected=!0,this.selected_item.find("span").text(this.default_text),this.is_multiple||this.selected_item.addClass("chzn-default"),this.show_search_field_default(),this.results_reset_cleanup(),this.form_field_jq.trigger("change");if(this.active_field)return this.results_hide()},e.prototype.results_reset_cleanup=function(){return this.selected_item.find("abbr").remove()},e.prototype.result_select=function(a){var b,c,d,e;if(this.result_highlight)return b=this.result_highlight,c=b.attr("id"),this.result_clear_highlight(),this.is_multiple?this.result_deactivate(b):(this.search_results.find(".result-selected").removeClass("result-selected"),this.result_single_selected=b,this.selected_item.removeClass("chzn-default")),b.addClass("result-selected"),e=c.substr(c.lastIndexOf("_")+1),d=this.results_data[e],d.selected=!0,this.form_field.options[d.options_index].selected=!0,this.is_multiple?this.choice_build(d):(this.selected_item.find("span").first().text(d.text),this.allow_single_deselect&&this.single_deselect_control_build()),(!a.metaKey||!this.is_multiple)&&this.results_hide(),this.search_field.val(""),(this.is_multiple||this.form_field_jq.val()!==this.current_value)&&this.form_field_jq.trigger("change",{selected:this.form_field.options[d.options_index].value}),this.current_value=this.form_field_jq.val(),this.search_field_scale()},e.prototype.result_activate=function(a){return a.addClass("active-result")},e.prototype.result_deactivate=function(a){return a.removeClass("active-result")},e.prototype.result_deselect=function(b){var c,d;return d=this.results_data[b],d.selected=!1,this.form_field.options[d.options_index].selected=!1,c=a("#"+this.container_id+"_o_"+b),c.removeClass("result-selected").addClass("active-result").show(),this.result_clear_highlight(),this.winnow_results(),this.form_field_jq.trigger("change",{deselected:this.form_field.options[d.options_index].value}),this.search_field_scale()},e.prototype.single_deselect_control_build=function(){if(this.allow_single_deselect&&this.selected_item.find("abbr").length<1)return this.selected_item.find("span").first().after('<abbr class="search-choice-close"></abbr>')},e.prototype.winnow_results=function(){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s;this.no_results_clear(),j=0,k=this.search_field.val()===this.default_text?"":a("<div/>").text(a.trim(this.search_field.val())).html(),g=this.search_contains?"":"^",f=new RegExp(g+k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),"i"),n=new RegExp(k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),"i"),s=this.results_data;for(o=0,q=s.length;o<q;o++){c=s[o];if(!c.disabled&&!c.empty)if(c.group)a("#"+c.dom_id).css("display","none");else if(!this.is_multiple||!c.selected){b=!1,i=c.dom_id,h=a("#"+i);if(f.test(c.html))b=!0,j+=1;else if(c.html.indexOf(" ")>=0||c.html.indexOf("[")===0){e=c.html.replace(/\[|\]/g,"").split(" ");if(e.length)for(p=0,r=e.length;p<r;p++)d=e[p],f.test(d)&&(b=!0,j+=1)}b?(k.length?(l=c.html.search(n),m=c.html.substr(0,l+k.length)+"</em>"+c.html.substr(l+k.length),m=m.substr(0,l)+"<em>"+m.substr(l)):m=c.html,h.html(m),this.result_activate(h),c.group_array_index!=null&&a("#"+this.results_data[c.group_array_index].dom_id).css("display","list-item")):(this.result_highlight&&i===this.result_highlight.attr("id")&&this.result_clear_highlight(),this.result_deactivate(h))}}return j<1&&k.length?this.no_results(k):this.winnow_results_set_highlight()},e.prototype.winnow_results_clear=function(){var b,c,d,e,f;this.search_field.val(""),c=this.search_results.find("li"),f=[];for(d=0,e=c.length;d<e;d++)b=c[d],b=a(b),b.hasClass("group-result")?f.push(b.css("display","auto")):!this.is_multiple||!b.hasClass("result-selected")?f.push(this.result_activate(b)):f.push(void 0);return f},e.prototype.winnow_results_set_highlight=function(){var a,b;if(!this.result_highlight){b=this.is_multiple?[]:this.search_results.find(".result-selected.active-result"),a=b.length?b.first():this.search_results.find(".active-result").first();if(a!=null)return this.result_do_highlight(a)}},e.prototype.no_results=function(b){var c;return c=a('<li class="no-results">'+this.results_none_found+' "<span></span>"</li>'),c.find("span").first().html(b),this.search_results.append(c)},e.prototype.no_results_clear=function(){return this.search_results.find(".no-results").remove()},e.prototype.keydown_arrow=function(){var b,c;this.result_highlight?this.results_showing&&(c=this.result_highlight.nextAll("li.active-result").first(),c&&this.result_do_highlight(c)):(b=this.search_results.find("li.active-result").first(),b&&this.result_do_highlight(a(b)));if(!this.results_showing)return this.results_show()},e.prototype.keyup_arrow=function(){var a;if(!this.results_showing&&!this.is_multiple)return this.results_show();if(this.result_highlight)return a=this.result_highlight.prevAll("li.active-result"),a.length?this.result_do_highlight(a.first()):(this.choices>0&&this.results_hide(),this.result_clear_highlight())},e.prototype.keydown_backstroke=function(){return this.pending_backstroke?(this.choice_destroy(this.pending_backstroke.find("a").first()),this.clear_backstroke()):(this.pending_backstroke=this.search_container.siblings("li.search-choice").last(),this.single_backstroke_delete?this.keydown_backstroke():this.pending_backstroke.addClass("search-choice-focus"))},e.prototype.clear_backstroke=function(){return this.pending_backstroke&&this.pending_backstroke.removeClass("search-choice-focus"),this.pending_backstroke=null},e.prototype.keydown_checker=function(a){var b,c;b=(c=a.which)!=null?c:a.keyCode,this.search_field_scale(),b!==8&&this.pending_backstroke&&this.clear_backstroke();switch(b){case 8:this.backstroke_length=this.search_field.val().length;break;case 9:this.results_showing&&!this.is_multiple&&this.result_select(a),this.mouse_on_container=!1;break;case 13:a.preventDefault();break;case 38:a.preventDefault(),this.keyup_arrow();break;case 40:this.keydown_arrow()}},e.prototype.search_field_scale=function(){var b,c,d,e,f,g,h,i,j;if(this.is_multiple){d=0,h=0,f="position:absolute; left: -1000px; top: -1000px; display:none;",g=["font-size","font-style","font-weight","font-family","line-height","text-transform","letter-spacing"];for(i=0,j=g.length;i<j;i++)e=g[i],f+=e+":"+this.search_field.css(e)+";";return c=a("<div />",{style:f}),c.text(this.search_field.val()),a("body").append(c),h=c.width()+25,c.remove(),h>this.f_width-10&&(h=this.f_width-10),this.search_field.css({width:h+"px"}),b=this.container.height(),this.dropdown.css({top:b+"px"})}},e.prototype.generate_random_id=function(){var b;b="sel"+this.generate_random_char()+this.generate_random_char()+this.generate_random_char();while(a("#"+b).length>0)b+=this.generate_random_char();return b},e}(AbstractChosen),c=function(a){var b;return b=a.outerWidth()-a.width()},d.get_side_border_padding=c}.call(this);
(function(a){a.uniform={options:{selectClass:"selector",radioClass:"radio",checkboxClass:"checker",fileClass:"uploader",filenameClass:"filename",fileBtnClass:"action",fileDefaultText:"No file selected",fileBtnText:"Choose File",checkedClass:"checked",focusClass:"focus",disabledClass:"disabled",buttonClass:"button",activeClass:"active",hoverClass:"hover",useID:true,idPrefix:"uniform",resetSelector:false,autoHide:true},elements:[]};if(a.browser.msie&&a.browser.version<7){a.support.selectOpacity=false}else{a.support.selectOpacity=true}a.fn.uniform=function(k){k=a.extend(a.uniform.options,k);var d=this;if(k.resetSelector!=false){a(k.resetSelector).mouseup(function(){function l(){a.uniform.update(d)}setTimeout(l,10)})}function j(l){$el=a(l);$el.addClass($el.attr("type"));b(l)}function g(l){a(l).addClass("uniform");b(l)}function i(o){var m=a(o);var p=a("<div>"),l=a("<span>");p.addClass(k.buttonClass);if(k.useID&&m.attr("id")!=""){p.attr("id",k.idPrefix+"-"+m.attr("id"))}var n;if(m.is("a")||m.is("button")){n=m.text()}else{if(m.is(":submit")||m.is(":reset")||m.is("input[type=button]")){n=m.attr("value")}}n=n==""?m.is(":reset")?"Reset":"Submit":n;l.html(n);m.css("opacity",0);m.wrap(p);m.wrap(l);p=m.closest("div");l=m.closest("span");if(m.is(":disabled")){p.addClass(k.disabledClass)}p.bind({"mouseenter.uniform":function(){p.addClass(k.hoverClass)},"mouseleave.uniform":function(){p.removeClass(k.hoverClass);p.removeClass(k.activeClass)},"mousedown.uniform touchbegin.uniform":function(){p.addClass(k.activeClass)},"mouseup.uniform touchend.uniform":function(){p.removeClass(k.activeClass)},"click.uniform touchend.uniform":function(r){if(a(r.target).is("span")||a(r.target).is("div")){if(o[0].dispatchEvent){var q=document.createEvent("MouseEvents");q.initEvent("click",true,true);o[0].dispatchEvent(q)}else{o[0].click()}}}});o.bind({"focus.uniform":function(){p.addClass(k.focusClass)},"blur.uniform":function(){p.removeClass(k.focusClass)}});a.uniform.noSelect(p);b(o)}function e(o){var m=a(o);var p=a("<div />"),l=a("<span />");if(!m.css("display")=="none"&&k.autoHide){p.hide()}p.addClass(k.selectClass);if(k.useID&&o.attr("id")!=""){p.attr("id",k.idPrefix+"-"+o.attr("id"))}var n=o.find(":selected:first");if(n.length==0){n=o.find("option:first")}l.html(n.html());o.css("opacity",0);o.wrap(p);o.before(l);p=o.parent("div");l=o.siblings("span");o.bind({"change.uniform":function(){l.text(o.find(":selected").html());p.removeClass(k.activeClass)},"focus.uniform":function(){p.addClass(k.focusClass)},"blur.uniform":function(){p.removeClass(k.focusClass);p.removeClass(k.activeClass)},"mousedown.uniform touchbegin.uniform":function(){p.addClass(k.activeClass)},"mouseup.uniform touchend.uniform":function(){p.removeClass(k.activeClass)},"click.uniform touchend.uniform":function(){p.removeClass(k.activeClass)},"mouseenter.uniform":function(){p.addClass(k.hoverClass)},"mouseleave.uniform":function(){p.removeClass(k.hoverClass);p.removeClass(k.activeClass)},"keyup.uniform":function(){l.text(o.find(":selected").html())}});if(a(o).attr("disabled")){p.addClass(k.disabledClass)}a.uniform.noSelect(l);b(o)}function f(n){var m=a(n);var o=a("<div />"),l=a("<span />");if(!m.css("display")=="none"&&k.autoHide){o.hide()}o.addClass(k.checkboxClass);if(k.useID&&n.attr("id")!=""){o.attr("id",k.idPrefix+"-"+n.attr("id"))}a(n).wrap(o);a(n).wrap(l);l=n.parent();o=l.parent();a(n).css("opacity",0).bind({"focus.uniform":function(){o.addClass(k.focusClass)},"blur.uniform":function(){o.removeClass(k.focusClass)},"click.uniform touchend.uniform":function(){if(!a(n).attr("checked")){l.removeClass(k.checkedClass)}else{l.addClass(k.checkedClass)}},"mousedown.uniform touchbegin.uniform":function(){o.addClass(k.activeClass)},"mouseup.uniform touchend.uniform":function(){o.removeClass(k.activeClass)},"mouseenter.uniform":function(){o.addClass(k.hoverClass)},"mouseleave.uniform":function(){o.removeClass(k.hoverClass);o.removeClass(k.activeClass)}});if(a(n).attr("checked")){l.addClass(k.checkedClass)}if(a(n).attr("disabled")){o.addClass(k.disabledClass)}b(n)}function c(n){var m=a(n);var o=a("<div />"),l=a("<span />");if(!m.css("display")=="none"&&k.autoHide){o.hide()}o.addClass(k.radioClass);if(k.useID&&n.attr("id")!=""){o.attr("id",k.idPrefix+"-"+n.attr("id"))}a(n).wrap(o);a(n).wrap(l);l=n.parent();o=l.parent();a(n).css("opacity",0).bind({"focus.uniform":function(){o.addClass(k.focusClass)},"blur.uniform":function(){o.removeClass(k.focusClass)},"click.uniform touchend.uniform":function(){if(!a(n).attr("checked")){l.removeClass(k.checkedClass)}else{var p=k.radioClass.split(" ")[0];a("."+p+" span."+k.checkedClass+":has([name='"+a(n).attr("name")+"'])").removeClass(k.checkedClass);l.addClass(k.checkedClass)}},"mousedown.uniform touchend.uniform":function(){if(!a(n).is(":disabled")){o.addClass(k.activeClass)}},"mouseup.uniform touchbegin.uniform":function(){o.removeClass(k.activeClass)},"mouseenter.uniform touchend.uniform":function(){o.addClass(k.hoverClass)},"mouseleave.uniform":function(){o.removeClass(k.hoverClass);o.removeClass(k.activeClass)}});if(a(n).attr("checked")){l.addClass(k.checkedClass)}if(a(n).attr("disabled")){o.addClass(k.disabledClass)}b(n)}function h(q){var o=a(q);var r=a("<div />"),p=a("<span>"+k.fileDefaultText+"</span>"),m=a("<span>"+k.fileBtnText+"</span>");if(!o.css("display")=="none"&&k.autoHide){r.hide()}r.addClass(k.fileClass);p.addClass(k.filenameClass);m.addClass(k.fileBtnClass);if(k.useID&&o.attr("id")!=""){r.attr("id",k.idPrefix+"-"+o.attr("id"))}o.wrap(r);o.after(m);o.after(p);r=o.closest("div");p=o.siblings("."+k.filenameClass);m=o.siblings("."+k.fileBtnClass);if(!o.attr("size")){var l=r.width();o.attr("size",l/10)}var n=function(){var s=o.val();if(s===""){s=k.fileDefaultText}else{s=s.split(/[\/\\]+/);s=s[(s.length-1)]}p.text(s)};n();o.css("opacity",0).bind({"focus.uniform":function(){r.addClass(k.focusClass)},"blur.uniform":function(){r.removeClass(k.focusClass)},"mousedown.uniform":function(){if(!a(q).is(":disabled")){r.addClass(k.activeClass)}},"mouseup.uniform":function(){r.removeClass(k.activeClass)},"mouseenter.uniform":function(){r.addClass(k.hoverClass)},"mouseleave.uniform":function(){r.removeClass(k.hoverClass);r.removeClass(k.activeClass)}});if(a.browser.msie){o.bind("click.uniform.ie7",function(){setTimeout(n,0)})}else{o.bind("change.uniform",n)}if(o.attr("disabled")){r.addClass(k.disabledClass)}a.uniform.noSelect(p);a.uniform.noSelect(m);b(q)}a.uniform.restore=function(l){if(l==undefined){l=a(a.uniform.elements)}a(l).each(function(){if(a(this).is(":checkbox")){a(this).unwrap().unwrap()}else{if(a(this).is("select")){a(this).siblings("span").remove();a(this).unwrap()}else{if(a(this).is(":radio")){a(this).unwrap().unwrap()}else{if(a(this).is(":file")){a(this).siblings("span").remove();a(this).unwrap()}else{if(a(this).is("button, :submit, :reset, a, input[type='button']")){a(this).unwrap().unwrap()}}}}}a(this).unbind(".uniform");a(this).css("opacity","1");var m=a.inArray(a(l),a.uniform.elements);a.uniform.elements.splice(m,1)})};function b(l){l=a(l).get();if(l.length>1){a.each(l,function(m,n){a.uniform.elements.push(n)})}else{a.uniform.elements.push(l)}}a.uniform.noSelect=function(l){function m(){return false}a(l).each(function(){this.onselectstart=this.ondragstart=m;a(this).mousedown(m).css({MozUserSelect:"none"})})};a.uniform.update=function(l){if(l==undefined){l=a(a.uniform.elements)}l=a(l);l.each(function(){var n=a(this);if(n.is("select")){var m=n.siblings("span");var p=n.parent("div");p.removeClass(k.hoverClass+" "+k.focusClass+" "+k.activeClass);m.html(n.find(":selected").html());if(n.is(":disabled")){p.addClass(k.disabledClass)}else{p.removeClass(k.disabledClass)}}else{if(n.is(":checkbox")){var m=n.closest("span");var p=n.closest("div");p.removeClass(k.hoverClass+" "+k.focusClass+" "+k.activeClass);m.removeClass(k.checkedClass);if(n.is(":checked")){m.addClass(k.checkedClass)}if(n.is(":disabled")){p.addClass(k.disabledClass)}else{p.removeClass(k.disabledClass)}}else{if(n.is(":radio")){var m=n.closest("span");var p=n.closest("div");p.removeClass(k.hoverClass+" "+k.focusClass+" "+k.activeClass);m.removeClass(k.checkedClass);if(n.is(":checked")){m.addClass(k.checkedClass)}if(n.is(":disabled")){p.addClass(k.disabledClass)}else{p.removeClass(k.disabledClass)}}else{if(n.is(":file")){var p=n.parent("div");var o=n.siblings(k.filenameClass);btnTag=n.siblings(k.fileBtnClass);p.removeClass(k.hoverClass+" "+k.focusClass+" "+k.activeClass);o.text(n.val());if(n.is(":disabled")){p.addClass(k.disabledClass)}else{p.removeClass(k.disabledClass)}}else{if(n.is(":submit")||n.is(":reset")||n.is("button")||n.is("a")||l.is("input[type=button]")){var p=n.closest("div");p.removeClass(k.hoverClass+" "+k.focusClass+" "+k.activeClass);if(n.is(":disabled")){p.addClass(k.disabledClass)}else{p.removeClass(k.disabledClass)}}}}}}})};return this.each(function(){if(a.support.selectOpacity){var l=a(this);if(l.is("select")){if(l.attr("multiple")!=true){if(l.attr("size")==undefined||l.attr("size")<=1){e(l)}}}else{if(l.is(":checkbox")){f(l)}else{if(l.is(":radio")){c(l)}else{if(l.is(":file")){h(l)}else{if(l.is(":text, :password, input[type='email']")){j(l)}else{if(l.is("textarea")){g(l)}else{if(l.is("a")||l.is(":submit")||l.is(":reset")||l.is("button")||l.is("input[type=button]")){i(l)}}}}}}}}})}})(jQuery);
// ColorBox v1.3.19.3 - jQuery lightbox plugin
// (c) 2011 Jack Moore - jacklmoore.com
// License: http://www.opensource.org/licenses/mit-license.php
(function(a,b,c){function Z(c,d,e){var g=b.createElement(c);return d&&(g.id=f+d),e&&(g.style.cssText=e),a(g)}function $(a){var b=y.length,c=(Q+a)%b;return c<0?b+c:c}function _(a,b){return Math.round((/%/.test(a)?(b==="x"?z.width():z.height())/100:1)*parseInt(a,10))}function ab(a){return K.photo||/\.(gif|png|jpe?g|bmp|ico)((#|\?).*)?$/i.test(a)}function bb(){var b,c=a.data(P,e);c==null?(K=a.extend({},d),console&&console.log&&console.log("Error: cboxElement missing settings object")):K=a.extend({},c);for(b in K)a.isFunction(K[b])&&b.slice(0,2)!=="on"&&(K[b]=K[b].call(P));K.rel=K.rel||P.rel||"nofollow",K.href=K.href||a(P).attr("href"),K.title=K.title||P.title,typeof K.href=="string"&&(K.href=a.trim(K.href))}function cb(b,c){a.event.trigger(b),c&&c.call(P)}function db(){var a,b=f+"Slideshow_",c="click."+f,d,e,g;K.slideshow&&y[1]?(d=function(){F.text(K.slideshowStop).unbind(c).bind(j,function(){if(K.loop||y[Q+1])a=setTimeout(W.next,K.slideshowSpeed)}).bind(i,function(){clearTimeout(a)}).one(c+" "+k,e),r.removeClass(b+"off").addClass(b+"on"),a=setTimeout(W.next,K.slideshowSpeed)},e=function(){clearTimeout(a),F.text(K.slideshowStart).unbind([j,i,k,c].join(" ")).one(c,function(){W.next(),d()}),r.removeClass(b+"on").addClass(b+"off")},K.slideshowAuto?d():e()):r.removeClass(b+"off "+b+"on")}function eb(b){U||(P=b,bb(),y=a(P),Q=0,K.rel!=="nofollow"&&(y=a("."+g).filter(function(){var b=a.data(this,e),c;return b&&(c=b.rel||this.rel),c===K.rel}),Q=y.index(P),Q===-1&&(y=y.add(P),Q=y.length-1)),S||(S=T=!0,r.show(),K.returnFocus&&a(P).blur().one(l,function(){a(this).focus()}),q.css({opacity:+K.opacity,cursor:K.overlayClose?"pointer":"auto"}).show(),K.w=_(K.initialWidth,"x"),K.h=_(K.initialHeight,"y"),W.position(),o&&z.bind("resize."+p+" scroll."+p,function(){q.css({width:z.width(),height:z.height(),top:z.scrollTop(),left:z.scrollLeft()})}).trigger("resize."+p),cb(h,K.onOpen),J.add(D).hide(),I.html(K.close).show()),W.load(!0))}function fb(){!r&&b.body&&(Y=!1,z=a(c),r=Z(X).attr({id:e,"class":n?f+(o?"IE6":"IE"):""}).hide(),q=Z(X,"Overlay",o?"position:absolute":"").hide(),s=Z(X,"Wrapper"),t=Z(X,"Content").append(A=Z(X,"LoadedContent","width:0; height:0; overflow:hidden"),C=Z(X,"LoadingOverlay").add(Z(X,"LoadingGraphic")),D=Z(X,"Title"),E=Z(X,"Current"),G=Z(X,"Next"),H=Z(X,"Previous"),F=Z(X,"Slideshow").bind(h,db),I=Z(X,"Close")),s.append(Z(X).append(Z(X,"TopLeft"),u=Z(X,"TopCenter"),Z(X,"TopRight")),Z(X,!1,"clear:left").append(v=Z(X,"MiddleLeft"),t,w=Z(X,"MiddleRight")),Z(X,!1,"clear:left").append(Z(X,"BottomLeft"),x=Z(X,"BottomCenter"),Z(X,"BottomRight"))).find("div div").css({"float":"left"}),B=Z(X,!1,"position:absolute; width:9999px; visibility:hidden; display:none"),J=G.add(H).add(E).add(F),a(b.body).append(q,r.append(s,B)))}function gb(){return r?(Y||(Y=!0,L=u.height()+x.height()+t.outerHeight(!0)-t.height(),M=v.width()+w.width()+t.outerWidth(!0)-t.width(),N=A.outerHeight(!0),O=A.outerWidth(!0),r.css({"padding-bottom":L,"padding-right":M}),G.click(function(){W.next()}),H.click(function(){W.prev()}),I.click(function(){W.close()}),q.click(function(){K.overlayClose&&W.close()}),a(b).bind("keydown."+f,function(a){var b=a.keyCode;S&&K.escKey&&b===27&&(a.preventDefault(),W.close()),S&&K.arrowKey&&y[1]&&(b===37?(a.preventDefault(),H.click()):b===39&&(a.preventDefault(),G.click()))}),a("."+g,b).live("click",function(a){a.which>1||a.shiftKey||a.altKey||a.metaKey||(a.preventDefault(),eb(this))})),!0):!1}var d={transition:"elastic",speed:300,width:!1,initialWidth:"600",innerWidth:!1,maxWidth:!1,height:!1,initialHeight:"450",innerHeight:!1,maxHeight:!1,scalePhotos:!0,scrolling:!0,inline:!1,html:!1,iframe:!1,fastIframe:!0,photo:!1,href:!1,title:!1,rel:!1,opacity:.9,preloading:!0,current:"image {current} of {total}",previous:"previous",next:"next",close:"close",xhrError:"This content failed to load.",imgError:"This image failed to load.",open:!1,returnFocus:!0,reposition:!0,loop:!0,slideshow:!1,slideshowAuto:!0,slideshowSpeed:2500,slideshowStart:"start slideshow",slideshowStop:"stop slideshow",onOpen:!1,onLoad:!1,onComplete:!1,onCleanup:!1,onClosed:!1,overlayClose:!0,escKey:!0,arrowKey:!0,top:!1,bottom:!1,left:!1,right:!1,fixed:!1,data:undefined},e="colorbox",f="cbox",g=f+"Element",h=f+"_open",i=f+"_load",j=f+"_complete",k=f+"_cleanup",l=f+"_closed",m=f+"_purge",n=!a.support.opacity&&!a.support.style,o=n&&!c.XMLHttpRequest,p=f+"_IE6",q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X="div",Y;if(a.colorbox)return;a(fb),W=a.fn[e]=a[e]=function(b,c){var f=this;b=b||{},fb();if(gb()){if(!f[0]){if(f.selector)return f;f=a("<a/>"),b.open=!0}c&&(b.onComplete=c),f.each(function(){a.data(this,e,a.extend({},a.data(this,e)||d,b))}).addClass(g),(a.isFunction(b.open)&&b.open.call(f)||b.open)&&eb(f[0])}return f},W.position=function(a,b){function i(a){u[0].style.width=x[0].style.width=t[0].style.width=a.style.width,t[0].style.height=v[0].style.height=w[0].style.height=a.style.height}var c=0,d=0,e=r.offset(),g,h;z.unbind("resize."+f),r.css({top:-9e4,left:-9e4}),g=z.scrollTop(),h=z.scrollLeft(),K.fixed&&!o?(e.top-=g,e.left-=h,r.css({position:"fixed"})):(c=g,d=h,r.css({position:"absolute"})),K.right!==!1?d+=Math.max(z.width()-K.w-O-M-_(K.right,"x"),0):K.left!==!1?d+=_(K.left,"x"):d+=Math.round(Math.max(z.width()-K.w-O-M,0)/2),K.bottom!==!1?c+=Math.max(z.height()-K.h-N-L-_(K.bottom,"y"),0):K.top!==!1?c+=_(K.top,"y"):c+=Math.round(Math.max(z.height()-K.h-N-L,0)/2),r.css({top:e.top,left:e.left}),a=r.width()===K.w+O&&r.height()===K.h+N?0:a||0,s[0].style.width=s[0].style.height="9999px",r.dequeue().animate({width:K.w+O,height:K.h+N,top:c,left:d},{duration:a,complete:function(){i(this),T=!1,s[0].style.width=K.w+O+M+"px",s[0].style.height=K.h+N+L+"px",K.reposition&&setTimeout(function(){z.bind("resize."+f,W.position)},1),b&&b()},step:function(){i(this)}})},W.resize=function(a){S&&(a=a||{},a.width&&(K.w=_(a.width,"x")-O-M),a.innerWidth&&(K.w=_(a.innerWidth,"x")),A.css({width:K.w}),a.height&&(K.h=_(a.height,"y")-N-L),a.innerHeight&&(K.h=_(a.innerHeight,"y")),!a.innerHeight&&!a.height&&(A.css({height:"auto"}),K.h=A.height()),A.css({height:K.h}),W.position(K.transition==="none"?0:K.speed))},W.prep=function(b){function g(){return K.w=K.w||A.width(),K.w=K.mw&&K.mw<K.w?K.mw:K.w,K.w}function h(){return K.h=K.h||A.height(),K.h=K.mh&&K.mh<K.h?K.mh:K.h,K.h}if(!S)return;var c,d=K.transition==="none"?0:K.speed;A.remove(),A=Z(X,"LoadedContent").append(b),A.hide().appendTo(B.show()).css({width:g(),overflow:K.scrolling?"auto":"hidden"}).css({height:h()}).prependTo(t),B.hide(),a(R).css({"float":"none"}),o&&a("select").not(r.find("select")).filter(function(){return this.style.visibility!=="hidden"}).css({visibility:"hidden"}).one(k,function(){this.style.visibility="inherit"}),c=function(){function s(){n&&r[0].style.removeAttribute("filter")}var b,c,g=y.length,h,i="frameBorder",k="allowTransparency",l,o,p,q;if(!S)return;l=function(){clearTimeout(V),C.hide(),cb(j,K.onComplete)},n&&R&&A.fadeIn(100),D.html(K.title).add(A).show();if(g>1){typeof K.current=="string"&&E.html(K.current.replace("{current}",Q+1).replace("{total}",g)).show(),G[K.loop||Q<g-1?"show":"hide"]().html(K.next),H[K.loop||Q?"show":"hide"]().html(K.previous),K.slideshow&&F.show();if(K.preloading){b=[$(-1),$(1)];while(c=y[b.pop()])q=a.data(c,e),q&&q.href?(o=q.href,a.isFunction(o)&&(o=o.call(c))):o=c.href,ab(o)&&(p=new Image,p.src=o)}}else J.hide();K.iframe?(h=Z("iframe")[0],i in h&&(h[i]=0),k in h&&(h[k]="true"),h.name=f+ +(new Date),K.fastIframe?l():a(h).one("load",l),h.src=K.href,K.scrolling||(h.scrolling="no"),a(h).addClass(f+"Iframe").appendTo(A).one(m,function(){h.src="//about:blank"})):l(),K.transition==="fade"?r.fadeTo(d,1,s):s()},K.transition==="fade"?r.fadeTo(d,0,function(){W.position(0,c)}):W.position(d,c)},W.load=function(b){var c,d,e=W.prep;T=!0,R=!1,P=y[Q],b||bb(),cb(m),cb(i,K.onLoad),K.h=K.height?_(K.height,"y")-N-L:K.innerHeight&&_(K.innerHeight,"y"),K.w=K.width?_(K.width,"x")-O-M:K.innerWidth&&_(K.innerWidth,"x"),K.mw=K.w,K.mh=K.h,K.maxWidth&&(K.mw=_(K.maxWidth,"x")-O-M,K.mw=K.w&&K.w<K.mw?K.w:K.mw),K.maxHeight&&(K.mh=_(K.maxHeight,"y")-N-L,K.mh=K.h&&K.h<K.mh?K.h:K.mh),c=K.href,V=setTimeout(function(){C.show()},100),K.inline?(Z(X).hide().insertBefore(a(c)[0]).one(m,function(){a(this).replaceWith(A.children())}),e(a(c))):K.iframe?e(" "):K.html?e(K.html):ab(c)?(a(R=new Image).addClass(f+"Photo").error(function(){K.title=!1,e(Z(X,"Error").html(K.imgError))}).load(function(){var a;R.onload=null,K.scalePhotos&&(d=function(){R.height-=R.height*a,R.width-=R.width*a},K.mw&&R.width>K.mw&&(a=(R.width-K.mw)/R.width,d()),K.mh&&R.height>K.mh&&(a=(R.height-K.mh)/R.height,d())),K.h&&(R.style.marginTop=Math.max(K.h-R.height,0)/2+"px"),y[1]&&(K.loop||y[Q+1])&&(R.style.cursor="pointer",R.onclick=function(){W.next()}),n&&(R.style.msInterpolationMode="bicubic"),setTimeout(function(){e(R)},1)}),setTimeout(function(){R.src=c},1)):c&&B.load(c,K.data,function(b,c,d){e(c==="error"?Z(X,"Error").html(K.xhrError):a(this).contents())})},W.next=function(){!T&&y[1]&&(K.loop||y[Q+1])&&(Q=$(1),W.load())},W.prev=function(){!T&&y[1]&&(K.loop||Q)&&(Q=$(-1),W.load())},W.close=function(){S&&!U&&(U=!0,S=!1,cb(k,K.onCleanup),z.unbind("."+f+" ."+p),q.fadeTo(200,0),r.stop().fadeTo(300,0,function(){r.add(q).css({opacity:1,cursor:"auto"}).hide(),cb(m),A.remove(),setTimeout(function(){U=!1,cb(l,K.onClosed)},1)}))},W.remove=function(){a([]).add(r).add(q).remove(),r=null,a("."+g).removeData(e).removeClass(g).die()},W.element=function(){return a(P)},W.settings=d})(jQuery,document,this);
/*
 CLEditor WYSIWYG HTML Editor v1.3.0
 http://premiumsoftware.net/cleditor
 requires jQuery v1.4.2 or later

 Copyright 2010, Chris Landowski, Premium Software, LLC
 Dual licensed under the MIT or GPL Version 2 licenses.
*/
(function(e){function aa(a){var b=this,c=a.target,d=e.data(c,x),h=s[d],f=h.popupName,i=p[f];if(!(b.disabled||e(c).attr(n)==n)){var g={editor:b,button:c,buttonName:d,popup:i,popupName:f,command:h.command,useCSS:b.options.useCSS};if(h.buttonClick&&h.buttonClick(a,g)===false)return false;if(d=="source"){if(t(b)){delete b.range;b.$area.hide();b.$frame.show();c.title=h.title}else{b.$frame.hide();b.$area.show();c.title="Show Rich Text"}setTimeout(function(){u(b)},100)}else if(!t(b))if(f){var j=e(i);if(f==
"url"){if(d=="link"&&M(b)===""){z(b,"A selection is required when inserting a link.",c);return false}j.children(":button").unbind(q).bind(q,function(){var k=j.find(":text"),o=e.trim(k.val());o!==""&&v(b,g.command,o,null,g.button);k.val("http://");r();w(b)})}else f=="pastetext"&&j.children(":button").unbind(q).bind(q,function(){var k=j.find("textarea"),o=k.val().replace(/\n/g,"<br />");o!==""&&v(b,g.command,o,null,g.button);k.val("");r();w(b)});if(c!==e.data(i,A)){N(b,i,c);return false}return}else if(d==
"print")b.$frame[0].contentWindow.print();else if(!v(b,g.command,g.value,g.useCSS,c))return false;w(b)}}function O(a){a=e(a.target).closest("div");a.css(H,a.data(x)?"#FFF":"#FFC")}function P(a){e(a.target).closest("div").css(H,"transparent")}function ba(a){var b=a.data.popup,c=a.target;if(!(b===p.msg||e(b).hasClass(B))){var d=e.data(b,A),h=e.data(d,x),f=s[h],i=f.command,g,j=this.options.useCSS;if(h=="font")g=c.style.fontFamily.replace(/"/g,"");else if(h=="size"){if(c.tagName=="DIV")c=c.children[0];
g=c.innerHTML}else if(h=="style")g="<"+c.tagName+">";else if(h=="color")g=Q(c.style.backgroundColor);else if(h=="highlight"){g=Q(c.style.backgroundColor);if(l)i="backcolor";else j=true}b={editor:this,button:d,buttonName:h,popup:b,popupName:f.popupName,command:i,value:g,useCSS:j};if(!(f.popupClick&&f.popupClick(a,b)===false)){if(b.command&&!v(this,b.command,b.value,b.useCSS,d))return false;r();w(this)}}}function C(a){for(var b=1,c=0,d=0;d<a.length;++d){b=(b+a.charCodeAt(d))%65521;c=(c+b)%65521}return c<<
16|b}function R(a,b,c,d,h){if(p[a])return p[a];var f=e(m).hide().addClass(ca).appendTo("body");if(d)f.html(d);else if(a=="color"){b=b.colors.split(" ");b.length<10&&f.width("auto");e.each(b,function(i,g){e(m).appendTo(f).css(H,"#"+g)});c=da}else if(a=="font")e.each(b.fonts.split(","),function(i,g){e(m).appendTo(f).css("fontFamily",g).html(g)});else if(a=="size")e.each(b.sizes.split(","),function(i,g){e(m).appendTo(f).html("<font size="+g+">"+g+"</font>")});else if(a=="style")e.each(b.styles,function(i,
g){e(m).appendTo(f).html(g[1]+g[0]+g[1].replace("<","</"))});else if(a=="url"){f.html('Enter URL:<br><input type=text value="http://" size=35><br><input type=button value="Submit">');c=B}else if(a=="pastetext"){f.html("Paste your content here and click submit.<br /><textarea cols=40 rows=3></textarea><br /><input type=button value=Submit>");c=B}if(!c&&!d)c=S;f.addClass(c);l&&f.attr(I,"on").find("div,font,p,h1,h2,h3,h4,h5,h6").attr(I,"on");if(f.hasClass(S)||h===true)f.children().hover(O,P);p[a]=f[0];
return f[0]}function T(a,b){if(b){a.$area.attr(n,n);a.disabled=true}else{a.$area.removeAttr(n);delete a.disabled}try{if(l)a.doc.body.contentEditable=!b;else a.doc.designMode=!b?"on":"off"}catch(c){}u(a)}function v(a,b,c,d,h){D(a);if(!l){if(d===undefined||d===null)d=a.options.useCSS;a.doc.execCommand("styleWithCSS",0,d.toString())}d=true;var f;if(l&&b.toLowerCase()=="inserthtml")y(a).pasteHTML(c);else{try{d=a.doc.execCommand(b,0,c||null)}catch(i){f=i.description;d=false}d||("cutcopypaste".indexOf(b)>
-1?z(a,"For security reasons, your browser does not support the "+b+" command. Try using the keyboard shortcut or context menu instead.",h):z(a,f?f:"Error executing the "+b+" command.",h))}u(a);return d}function w(a){setTimeout(function(){t(a)?a.$area.focus():a.$frame[0].contentWindow.focus();u(a)},0)}function y(a){if(l)return J(a).createRange();return J(a).getRangeAt(0)}function J(a){if(l)return a.doc.selection;return a.$frame[0].contentWindow.getSelection()}function Q(a){var b=/rgba?\((\d+), (\d+), (\d+)/.exec(a),
c=a.split("");if(b)for(a=(b[1]<<16|b[2]<<8|b[3]).toString(16);a.length<6;)a="0"+a;return"#"+(a.length==6?a:c[1]+c[1]+c[2]+c[2]+c[3]+c[3])}function r(){e.each(p,function(a,b){e(b).hide().unbind(q).removeData(A)})}function U(){var a=e("link[href$='jquery.cleditor.css']").attr("href");return a.substr(0,a.length-19)+"images/"}function K(a){var b=a.$main,c=a.options;a.$frame&&a.$frame.remove();var d=a.$frame=e('<iframe frameborder="0" src="javascript:true;">').hide().appendTo(b),h=d[0].contentWindow,f=
a.doc=h.document,i=e(f);f.open();f.write(c.docType+"<html>"+(c.docCSSFile===""?"":'<head><link rel="stylesheet" type="text/css" href="'+c.docCSSFile+'" /></head>')+'<body style="'+c.bodyStyle+'"></body></html>');f.close();l&&i.click(function(){w(a)});E(a);if(l){i.bind("beforedeactivate beforeactivate selectionchange keypress",function(g){if(g.type=="beforedeactivate")a.inactive=true;else if(g.type=="beforeactivate"){!a.inactive&&a.range&&a.range.length>1&&a.range.shift();delete a.inactive}else if(!a.inactive){if(!a.range)a.range=
[];for(a.range.unshift(y(a));a.range.length>2;)a.range.pop()}});d.focus(function(){D(a)})}(e.browser.mozilla?i:e(h)).blur(function(){V(a,true)});i.click(r).bind("keyup mouseup",function(){u(a)});L?a.$area.show():d.show();e(function(){var g=a.$toolbar,j=g.children("div:last"),k=b.width();j=j.offset().top+j.outerHeight()-g.offset().top+1;g.height(j);j=(/%/.test(""+c.height)?b.height():parseInt(c.height))-j;d.width(k).height(j);a.$area.width(k).height(ea?j-2:j);T(a,a.disabled);u(a)})}function u(a){if(!L&&
e.browser.webkit&&!a.focused){a.$frame[0].contentWindow.focus();window.focus();a.focused=true}var b=a.doc;if(l)b=y(a);var c=t(a);e.each(a.$toolbar.find("."+W),function(d,h){var f=e(h),i=e.cleditor.buttons[e.data(h,x)],g=i.command,j=true;if(a.disabled)j=false;else if(i.getEnabled){j=i.getEnabled({editor:a,button:h,buttonName:i.name,popup:p[i.popupName],popupName:i.popupName,command:i.command,useCSS:a.options.useCSS});if(j===undefined)j=true}else if((c||L)&&i.name!="source"||l&&(g=="undo"||g=="redo"))j=
false;else if(g&&g!="print"){if(l&&g=="hilitecolor")g="backcolor";if(!l||g!="inserthtml")try{j=b.queryCommandEnabled(g)}catch(k){j=false}}if(j){f.removeClass(X);f.removeAttr(n)}else{f.addClass(X);f.attr(n,n)}})}function D(a){l&&a.range&&a.range[0].select()}function M(a){D(a);if(l)return y(a).text;return J(a).toString()}function z(a,b,c){var d=R("msg",a.options,fa);d.innerHTML=b;N(a,d,c)}function N(a,b,c){var d,h,f=e(b);if(c){var i=e(c);d=i.offset();h=--d.left;d=d.top+i.height()}else{i=a.$toolbar;
d=i.offset();h=Math.floor((i.width()-f.width())/2)+d.left;d=d.top+i.height()-2}r();f.css({left:h,top:d}).show();if(c){e.data(b,A,c);f.bind(q,{popup:b},e.proxy(ba,a))}setTimeout(function(){f.find(":text,textarea").eq(0).focus().select()},100)}function t(a){return a.$area.is(":visible")}function E(a,b){var c=a.$area.val(),d=a.options,h=d.updateFrame,f=e(a.doc.body);if(h){var i=C(c);if(b&&a.areaChecksum==i)return;a.areaChecksum=i}c=h?h(c):c;c=c.replace(/<(?=\/?script)/ig,"&lt;");if(d.updateTextArea)a.frameChecksum=
C(c);if(c!=f.html()){f.html(c);e(a).triggerHandler(F)}}function V(a,b){var c=e(a.doc.body).html(),d=a.options,h=d.updateTextArea,f=a.$area;if(h){var i=C(c);if(b&&a.frameChecksum==i)return;a.frameChecksum=i}c=h?h(c):c;if(d.updateFrame)a.areaChecksum=C(c);if(c!=f.val()){f.val(c);e(a).triggerHandler(F)}}e.cleditor={defaultOptions:{width:500,height:250,controls:"bold italic underline strikethrough subscript superscript | font size style | color highlight removeformat | bullets numbering | outdent indent | alignleft center alignright justify | undo redo | rule image link unlink | cut copy paste pastetext | print source",
colors:"FFF FCC FC9 FF9 FFC 9F9 9FF CFF CCF FCF CCC F66 F96 FF6 FF3 6F9 3FF 6FF 99F F9F BBB F00 F90 FC6 FF0 3F3 6CC 3CF 66C C6C 999 C00 F60 FC3 FC0 3C0 0CC 36F 63F C3C 666 900 C60 C93 990 090 399 33F 60C 939 333 600 930 963 660 060 366 009 339 636 000 300 630 633 330 030 033 006 309 303",fonts:"Arial,Arial Black,Comic Sans MS,Courier New,Narrow,Garamond,Georgia,Impact,Sans Serif,Serif,Tahoma,Trebuchet MS,Verdana",sizes:"1,2,3,4,5,6,7",styles:[["Paragraph","<p>"],["Header 1","<h1>"],["Header 2","<h2>"],
["Header 3","<h3>"],["Header 4","<h4>"],["Header 5","<h5>"],["Header 6","<h6>"]],useCSS:false,docType:'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',docCSSFile:"",bodyStyle:"margin:4px; font:10pt Arial,Verdana; cursor:text"},buttons:{init:"bold,,|italic,,|underline,,|strikethrough,,|subscript,,|superscript,,|font,,fontname,|size,Font Size,fontsize,|style,,formatblock,|color,Font Color,forecolor,|highlight,Text Highlight Color,hilitecolor,color|removeformat,Remove Formatting,|bullets,,insertunorderedlist|numbering,,insertorderedlist|outdent,,|indent,,|alignleft,Align Text Left,justifyleft|center,,justifycenter|alignright,Align Text Right,justifyright|justify,,justifyfull|undo,,|redo,,|rule,Insert Horizontal Rule,inserthorizontalrule|image,Insert Image,insertimage,url|link,Insert Hyperlink,createlink,url|unlink,Remove Hyperlink,|cut,,|copy,,|paste,,|pastetext,Paste as Text,inserthtml,|print,,|source,Show Source"},
imagesPath:function(){return U()}};e.fn.cleditor=function(a){var b=e([]);this.each(function(c,d){if(d.tagName=="TEXTAREA"){var h=e.data(d,Y);h||(h=new cleditor(d,a));b=b.add(h)}});return b};var H="backgroundColor",A="button",x="buttonName",F="change",Y="cleditor",q="click",n="disabled",m="<div>",I="unselectable",W="cleditorButton",X="cleditorDisabled",ca="cleditorPopup",S="cleditorList",da="cleditorColor",B="cleditorPrompt",fa="cleditorMsg",l=e.browser.msie,ea=/msie\s6/i.test(navigator.userAgent),
L=/iphone|ipad|ipod/i.test(navigator.userAgent),p={},Z,s=e.cleditor.buttons;e.each(s.init.split("|"),function(a,b){var c=b.split(","),d=c[0];s[d]={stripIndex:a,name:d,title:c[1]===""?d.charAt(0).toUpperCase()+d.substr(1):c[1],command:c[2]===""?d:c[2],popupName:c[3]===""?d:c[3]}});delete s.init;cleditor=function(a,b){var c=this;c.options=b=e.extend({},e.cleditor.defaultOptions,b);var d=c.$area=e(a).hide().data(Y,c).blur(function(){E(c,true)}),h=c.$main=e(m).addClass("cleditorMain").width(b.width).height(b.height),
f=c.$toolbar=e(m).addClass("cleditorToolbar").appendTo(h),i=e(m).addClass("cleditorGroup").appendTo(f);e.each(b.controls.split(" "),function(g,j){if(j==="")return true;if(j=="|"){e(m).addClass("cleditorDivider").appendTo(i);i=e(m).addClass("cleditorGroup").appendTo(f)}else{var k=s[j],o=e(m).data(x,k.name).addClass(W).attr("title",k.title).bind(q,e.proxy(aa,c)).appendTo(i).hover(O,P),G={};if(k.css)G=k.css;else if(k.image)G.backgroundImage="url("+U()+k.image+")";if(k.stripIndex)G.backgroundPosition=
k.stripIndex*-24;o.css(G);l&&o.attr(I,"on");k.popupName&&R(k.popupName,b,k.popupClass,k.popupContent,k.popupHover)}});h.insertBefore(d).append(d);if(!Z){e(document).click(function(g){g=e(g.target);g.add(g.parents()).is("."+B)||r()});Z=true}/auto|%/.test(""+b.width+b.height)&&e(window).resize(function(){K(c)});K(c)};var $=cleditor.prototype;e.each([["clear",function(a){a.$area.val("");E(a)}],["disable",T],["execCommand",v],["focus",w],["hidePopups",r],["sourceMode",t,true],["refresh",K],["select",
function(a){setTimeout(function(){t(a)?a.$area.select():v(a,"selectall")},0)}],["selectedHTML",function(a){D(a);a=y(a);if(l)return a.htmlText;var b=e("<layer>")[0];b.appendChild(a.cloneContents());return b.innerHTML},true],["selectedText",M,true],["showMessage",z],["updateFrame",E],["updateTextArea",V]],function(a,b){$[b[0]]=function(){for(var c=[this],d=0;d<arguments.length;d++)c.push(arguments[d]);c=b[1].apply(this,c);if(b[2])return c;return this}});$.change=function(a){var b=e(this);return a?b.bind(F,
a):b.trigger(F)}})(jQuery);
/**
* noty - jQuery Notification Plugin v1.2.1
* Contributors: https://github.com/needim/noty/graphs/contributors
*
* Examples and Documentation - http://needim.github.com/noty/
*
* Licensed under the MIT licenses:
* http://www.opensource.org/licenses/mit-license.php
*
**/
(function($) {
	$.noty = function(options, customContainer) {

		var base = {};
		var $noty = null;
		var isCustom = false;

		base.init = function(options) {
			base.options = $.extend({}, $.noty.defaultOptions, options);
			base.options.type = base.options.cssPrefix+base.options.type;
			base.options.id = base.options.type+'_'+new Date().getTime();
			base.options.layout = base.options.cssPrefix+'layout_'+base.options.layout;

			if (base.options.custom.container) customContainer = base.options.custom.container;
			isCustom = ($.type(customContainer) === 'object') ? true : false;

			return base.addQueue();
		};

		// Push notification to queue
		base.addQueue = function() {
			var isGrowl = ($.inArray(base.options.layout, $.noty.growls) == -1) ? false : true;
	  	if (!isGrowl) (base.options.force) ? $.noty.queue.unshift({options: base.options}) : $.noty.queue.push({options: base.options});
	  	return base.render(isGrowl);
		};

		// Render the noty
		base.render = function(isGrowl) {

			// Layout spesific container settings
			var container = (isCustom) ? customContainer.addClass(base.options.theme+' '+base.options.layout+' noty_custom_container') : $('body');
	  	if (isGrowl) {
	  		if ($('ul.noty_cont.' + base.options.layout).length == 0)
	  			container.prepend($('<ul/>').addClass('noty_cont ' + base.options.layout));
	  		container = $('ul.noty_cont.' + base.options.layout);
	  	} else {
	  		if ($.noty.available) {
					var fromQueue = $.noty.queue.shift(); // Get noty from queue
					if ($.type(fromQueue) === 'object') {
						$.noty.available = false;
						base.options = fromQueue.options;
					} else {
						$.noty.available = true; // Queue is over
						return base.options.id;
					}
	  		} else {
	  			return base.options.id;
	  		}
	  	}
	  	base.container = container;

	  	// Generating noty bar
	  	base.bar = $('<div class="noty_bar"/>').attr('id', base.options.id).addClass(base.options.theme+' '+base.options.layout+' '+base.options.type);
	  	$noty = base.bar;
	  	$noty.append(base.options.template).find('.noty_text').html(base.options.text);
	  	$noty.data('noty_options', base.options);

	  	// Close button display
	  	(base.options.closeButton) ? $noty.addClass('noty_closable').find('.noty_close').show() : $noty.find('.noty_close').remove();

	  	// Bind close event to button
	  	$noty.find('.noty_close').bind('click', function() { $noty.trigger('noty.close'); });

	  	// If we have a button we must disable closeOnSelfClick and closeOnSelfOver option
	  	if (base.options.buttons) base.options.closeOnSelfClick = base.options.closeOnSelfOver = false;
	  	// Close on self click
	  	if (base.options.closeOnSelfClick) $noty.bind('click', function() { $noty.trigger('noty.close'); }).css('cursor', 'pointer');
	  	// Close on self mouseover
	  	if (base.options.closeOnSelfOver) $noty.bind('mouseover', function() { $noty.trigger('noty.close'); }).css('cursor', 'pointer');

	  	// Set buttons if available
	  	if (base.options.buttons) {
				$buttons = $('<div/>').addClass('noty_buttons');
				$noty.find('.noty_message').append($buttons);
				$.each(base.options.buttons, function(i, button) {
					bclass = (button.type) ? button.type : 'gray';
					$button = $('<button/>').addClass(bclass).html(button.text).appendTo($noty.find('.noty_buttons'))
					.bind('click', function() {
						if ($.isFunction(button.click)) {
							button.click.call($button, $noty);
						}
					});
				});
			}

	  	return base.show(isGrowl);
		};

		base.show = function(isGrowl) {

			// is Modal?
			if (base.options.modal) $('<div/>').addClass('noty_modal').addClass(base.options.theme).prependTo($('body')).fadeIn('fast');

			$noty.close = function() { return this.trigger('noty.close'); };

			// Prepend noty to container
			(isGrowl) ? base.container.prepend($('<li/>').append($noty)) : base.container.prepend($noty);

	  	// topCenter and center specific options
	  	if (base.options.layout == 'noty_layout_topCenter' || base.options.layout == 'noty_layout_center') {
				$.noty.reCenter($noty);
			}

	  	$noty.bind('noty.setText', function(event, text) {
	  		$noty.find('.noty_text').html(text); 
	  		
	  		if (base.options.layout == 'noty_layout_topCenter' || base.options.layout == 'noty_layout_center') {
	  			$.noty.reCenter($noty);
	  		}
	  	});

	  	$noty.bind('noty.setType', function(event, type) {
	  		$noty.removeClass($noty.data('noty_options').type); 

			type = $noty.data('noty_options').cssPrefix+type;

			$noty.data('noty_options').type = type;

			$noty.addClass(type);
	  		
	  		if (base.options.layout == 'noty_layout_topCenter' || base.options.layout == 'noty_layout_center') {
	  			$.noty.reCenter($noty);
	  		}
	  	});

	  	$noty.bind('noty.getId', function(event) {
	  		return $noty.data('noty_options').id;
	  	});

	  	// Bind close event
	  	$noty.one('noty.close', function(event) {
				var options = $noty.data('noty_options');
        if(options.onClose){options.onClose();}

				// Modal Cleaning
				if (options.modal) $('.noty_modal').fadeOut('fast', function() { $(this).remove(); });

				$noty.clearQueue().stop().animate(
						$noty.data('noty_options').animateClose,
						$noty.data('noty_options').speed,
						$noty.data('noty_options').easing,
						$noty.data('noty_options').onClosed)
				.promise().done(function() {

					// Layout spesific cleaning
					if ($.inArray($noty.data('noty_options').layout, $.noty.growls) > -1) {
						$noty.parent().remove();
					} else {
						$noty.remove();

						// queue render
						$.noty.available = true;
						base.render(false);
					}

				});
			});

	  	// Start the show
      if(base.options.onShow){base.options.onShow();}
	  	$noty.animate(base.options.animateOpen, base.options.speed, base.options.easing, base.options.onShown);

	  	// If noty is have a timeout option
	  	if (base.options.timeout) $noty.delay(base.options.timeout).promise().done(function() { $noty.trigger('noty.close'); });
			return base.options.id;
		};

		// Run initializer
		return base.init(options);
	};

	// API
	$.noty.get = function(id) { return $('#'+id); };
	$.noty.close = function(id) {
		//remove from queue if not already visible
		for(var i=0;i<$.noty.queue.length;) {
			if($.noty.queue[i].options.id==id)
				$.noty.queue.splice(id,1);
			else
				i++;
		}
		//close if already visible
		$.noty.get(id).trigger('noty.close');
	};
	$.noty.setText = function(id, text) {
		$.noty.get(id).trigger('noty.setText', text);
	};
	$.noty.setType = function(id, type) {
		$.noty.get(id).trigger('noty.setType', type);
	};
	$.noty.closeAll = function() {
		$.noty.clearQueue();
		$('.noty_bar').trigger('noty.close');
	};
	$.noty.reCenter = function(noty) {
		noty.css({'left': ($(window).width() - noty.outerWidth()) / 2 + 'px'});
	};
	$.noty.clearQueue = function() {
		$.noty.queue = [];
	};
  
  var windowAlert = window.alert;
  $.noty.consumeAlert = function(options){
    window.alert = function(text){
      if(options){options.text = text;}
      else{options = {text:text};}
      $.noty(options);
    };
  }
  $.noty.stopConsumeAlert = function(){
    window.alert = windowAlert;
  }

	$.noty.queue = [];
	$.noty.growls = ['noty_layout_topLeft', 'noty_layout_topRight', 'noty_layout_bottomLeft', 'noty_layout_bottomRight'];
	$.noty.available = true;
	$.noty.defaultOptions = {
		layout: 'top',
		theme: 'noty_theme_default',
		animateOpen: {height: 'toggle'},
		animateClose: {height: 'toggle'},
		easing: 'swing',
		text: '',
		type: 'alert',
		speed: 500,
		timeout: 5000,
		closeButton: false,
		closeOnSelfClick: true,
		closeOnSelfOver: false,
		force: false,
		onShow: false,
		onShown: false,
		onClose: false,
		onClosed: false,
		buttons: false,
		modal: false,
		template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
		cssPrefix: 'noty_',
		custom: {
			container: null
		}
	};

	$.fn.noty = function(options) {
		return this.each(function() {
			 (new $.noty(options, $(this)));
		});
	};

})(jQuery);

//Helper
function noty(options) {
	return jQuery.noty(options); // returns an id
}

/*!
 * elFinder - file manager for web
 * Version 2.0 rc1 (2012-04-10)
 * http://elfinder.org
 * 
 * Copyright 2009-2012, Studio 42
 * Licensed under a 3 clauses BSD license
 */
(function(a){window.elFinder=function(b,c){this.time("load");var d=this,b=a(b),e=a("<div/>").append(b.contents()),f=b.attr("style"),g=b.attr("id")||"",h="elfinder-"+(g||Math.random().toString().substr(2,7)),i="mousedown."+h,j="keydown."+h,k="keypress."+h,l=!0,m=!0,n=["enable","disable","load","open","reload","select","add","remove","change","dblclick","getfile","lockfiles","unlockfiles","dragstart","dragstop"],o={},p="",q={path:"",url:"",tmbUrl:"",disabled:[],separator:"/",archives:[],extract:[],copyOverwrite:!0,tmb:!1},r={},s=[],t={},u={},v=[],w=[],x=[],y=new d.command(d),z="auto",A=400,B=a(document.createElement("audio")).hide().appendTo("body")[0],C,D=function(b){if(b.init)r={};else for(var c in r)r.hasOwnProperty(c)&&r[c].mime!="directory"&&r[c].phash==p&&a.inArray(c,w)===-1&&delete r[c];p=b.cwd.hash,E(b.files),r[p]||E([b.cwd]),d.lastDir(p)},E=function(a){var b=a.length,c;while(b--)c=a[b],c.name&&c.hash&&c.mime&&(r[c.hash]=c)},F=function(b){var c=b.keyCode,e=!!b.ctrlKey||!!b.metaKey;l&&(a.each(u,function(a,f){f.type==b.type&&f.keyCode==c&&f.shiftKey==b.shiftKey&&f.ctrlKey==e&&f.altKey==b.altKey&&(b.preventDefault(),b.stopPropagation(),f.callback(b,d),d.debug("shortcut-exec",a+" : "+f.description))}),c==9&&b.preventDefault())},G=new Date,H,I;this.api=null,this.newAPI=!1,this.oldAPI=!1,this.OS=navigator.userAgent.indexOf("Mac")!==-1?"mac":navigator.userAgent.indexOf("Win")!==-1?"win":"other",this.options=a.extend(!0,{},this._options,c||{}),c.ui&&(this.options.ui=c.ui),c.commands&&(this.options.commands=c.commands),c.uiOptions&&c.uiOptions.toolbar&&(this.options.uiOptions.toolbar=c.uiOptions.toolbar),a.extend(this.options.contextmenu,c.contextmenu),this.requestType=/^(get|post)$/i.test(this.options.requestType)?this.options.requestType.toLowerCase():"get",this.customData=a.isPlainObject(this.options.customData)?this.options.customData:{},this.id=g,this.uploadURL=c.urlUpload||c.url,this.namespace=h,this.lang=this.i18[this.options.lang]&&this.i18[this.options.lang].messages?this.options.lang:"en",I=this.lang=="en"?this.i18.en:a.extend(!0,{},this.i18.en,this.i18[this.lang]),this.direction=I.direction,this.messages=I.messages,this.dateFormat=this.options.dateFormat||I.dateFormat,this.fancyFormat=this.options.fancyDateFormat||I.fancyDateFormat,this.today=(new Date(G.getFullYear(),G.getMonth(),G.getDate())).getTime()/1e3,this.yesterday=this.today-86400,H=this.options.UTCDate?"UTC":"",this.getHours="get"+H+"Hours",this.getMinutes="get"+H+"Minutes",this.getSeconds="get"+H+"Seconds",this.getDate="get"+H+"Date",this.getDay="get"+H+"Day",this.getMonth="get"+H+"Month",this.getFullYear="get"+H+"FullYear",this.cssClass="ui-helper-reset ui-helper-clearfix ui-widget ui-widget-content ui-corner-all elfinder elfinder-"+(this.direction=="rtl"?"rtl":"ltr")+" "+this.options.cssClass,this.storage=function(){try{return"localStorage"in window&&window.localStorage!==null?d.localStorage:d.cookie}catch(a){return d.cookie}}(),this.notifyDelay=this.options.notifyDelay>0?parseInt(this.options.notifyDelay):500,this.draggable={appendTo:"body",addClasses:!0,delay:30,revert:!0,refreshPositions:!0,cursor:"move",cursorAt:{left:50,top:47},drag:function(a,b){b.helper.toggleClass("elfinder-drag-helper-plus",a.shiftKey||a.ctrlKey||a.metaKey)},stop:function(){d.trigger("focus").trigger("dragstop")},helper:function(b,c){var e=this.id?a(this):a(this).parents("[id]:first"),f=a('<div class="elfinder-drag-helper"><span class="elfinder-drag-helper-icon-plus"/></div>'),g=function(a){return'<div class="elfinder-cwd-icon '+d.mime2class(a)+' ui-corner-all"/>'},h,i;return d.trigger("dragstart",{target:e[0],originalEvent:b}),h=e.is("."+d.res("class","cwdfile"))?d.selected():[d.navId2Hash(e.attr("id"))],f.append(g(r[h[0]].mime)).data("files",h),(i=h.length)>1&&f.append(g(r[h[i-1]].mime)+'<span class="elfinder-drag-num">'+i+"</span>"),f}},this.droppable={tolerance:"pointer",accept:".elfinder-cwd-file-wrapper,.elfinder-navbar-dir,.elfinder-cwd-file",hoverClass:this.res("class","adroppable"),drop:function(b,c){var e=a(this),f=a.map(c.helper.data("files")||[],function(a){return a||null}),g=[],h="class",i,j,k,l;e.is("."+d.res(h,"cwd"))?j=p:e.is("."+d.res(h,"cwdfile"))?j=e.attr("id"):e.is("."+d.res(h,"navdir"))&&(j=d.navId2Hash(e.attr("id"))),i=f.length;while(i--)l=f[i],l!=j&&r[l].phash!=j&&g.push(l);g.length&&(c.helper.hide(),d.clipboard(g,!(b.ctrlKey||b.shiftKey||b.metaKey)),d.exec("paste",j).always(function(){d.clipboard([])}),d.trigger("drop",{files:f}))}},this.enabled=function(){return b.is(":visible")&&l},this.visible=function(){return b.is(":visible")},this.root=function(a){var b=r[a||p],c;while(b&&b.phash)b=r[b.phash];if(b)return b.hash;while(c in r&&r.hasOwnProperty(c)){b=r[c];if(!b.phash&&!b.mime=="directory"&&b.read)return b.hash}return""},this.cwd=function(){return r[p]||{}},this.option=function(a){return q[a]||""},this.file=function(a){return r[a]},this.files=function(){return a.extend(!0,{},r)},this.parents=function(a){var b=[],c;while(c=this.file(a))b.unshift(c.hash),a=c.phash;return b},this.path2array=function(a){var b,c=[];while(a&&(b=r[a])&&b.hash)c.unshift(b.name),a=b.phash;return c},this.path=function(a){return r[a]&&r[a].path?r[a].path:this.path2array(a).join(q.separator)},this.url=function(b){var c=r[b];if(!c||!c.read)return"";if(c.url)return c.url;if(q.url)return q.url+a.map(this.path2array(b),function(a){return encodeURIComponent(a)}).slice(1).join("/");var d=a.extend({},this.customData,{cmd:"file",target:c.hash});return this.oldAPI&&(d.cmd="open",d.current=c.phash),this.options.url+(this.options.url.indexOf("?")===-1?"?":"&")+a.param(d,!0)},this.tmb=function(b){var c=r[b],d=c&&c.tmb&&c.tmb!=1?q.tmbUrl+c.tmb:"";return d&&(a.browser.opera||a.browser.msie)&&(d+="?_="+(new Date).getTime()),d},this.selected=function(){return s.slice(0)},this.selectedFiles=function(){return a.map(s,function(a){return r[a]||null})},this.fileByName=function(a,b){var c;for(c in r)if(r.hasOwnProperty(c)&&r[c].phash==b&&r[c].name==a)return r[c]},this.validResponse=function(a,b){return b.error||this.rules[this.rules[a]?a:"defaults"](b)},this.request=function(b){var c=this,d=this.options,e=a.Deferred(),f=a.extend({},d.customData,{mimes:d.onlyMimes},b.data||b),g=f.cmd,h=!b.preventDefault&&!b.preventFail,i=!b.preventDefault&&!b.preventDone,j=a.extend({},b.notify),k=!!b.raw,l=b.syncOnFail,m,b=a.extend({url:d.url,async:!0,type:this.requestType,dataType:"json",cache:!1,data:f},b.options||{}),n=function(b){b.warning&&c.error(b.warning),g=="open"&&D(a.extend(!0,{},b)),b.removed&&b.removed.length&&c.remove(b),b.added&&b.added.length&&c.add(b),b.changed&&b.changed.length&&c.change(b),c.trigger(g,b),b.sync&&c.sync()},o=function(a,b){var c;switch(b){case"abort":c=a.quiet?"":["errConnect","errAbort"];break;case"timeout":c=["errConnect","errTimeout"];break;case"parsererror":c=["errResponse","errDataNotJSON"];break;default:a.status==403?c=["errConnect","errAccess"]:a.status==404?c=["errConnect","errNotFound"]:c="errConnect"}e.reject(c,a,b)},p=function(b){if(k)return e.resolve(b);if(!b)return e.reject(["errResponse","errDataEmpty"],r);if(!a.isPlainObject(b))return e.reject(["errResponse","errDataNotJSON"],r);if(b.error)return e.reject(b.error,r);if(!c.validResponse(g,b))return e.reject("errResponse",r);b=c.normalize(b),c.api||(c.api=b.api||1,c.newAPI=c.api>=2,c.oldAPI=!c.newAPI),b.options&&(q=a.extend({},q,b.options)),e.resolve(b),b.debug&&c.debug("backend-debug",b.debug)},r,s;i&&e.done(n),e.fail(function(a){a&&(h?c.error(a):c.debug("error",c.i18n(a)))});if(!g)return e.reject("errCmdReq");l&&e.fail(function(a){a&&c.sync()}),j.type&&j.cnt&&(m=setTimeout(function(){c.notify(j),e.always(function(){j.cnt=-(parseInt(j.cnt)||0),c.notify(j)})},c.notifyDelay),e.always(function(){clearTimeout(m)}));if(g=="open")while(s=x.pop())!s.isRejected()&&!s.isResolved()&&(s.quiet=!0,s.abort());return delete b.preventFail,r=this.transport.send(b).fail(o).done(p),g=="open"&&(x.unshift(r),e.always(function(){var b=a.inArray(r,x);b!==-1&&x.splice(b,1)})),e},this.diff=function(b){var c={},d=[],e=[],f=[],g=function(a){var b=f.length;while(b--)if(f[b].hash==a)return!0};return a.each(b,function(a,b){c[b.hash]=b}),a.each(r,function(a,b){!c[a]&&
e.push(a)}),a.each(c,function(b,c){var e=r[b];e?a.each(c,function(a){if(c[a]!=e[a])return f.push(c),!1}):d.push(c)}),a.each(e,function(b,d){var h=r[d],i=h.phash;i&&h.mime=="directory"&&a.inArray(i,e)===-1&&c[i]&&!g(i)&&f.push(c[i])}),{added:d,removed:e,changed:f}},this.sync=function(){var b=this,c=a.Deferred().done(function(){b.trigger("sync")}),d={data:{cmd:"open",init:1,target:p,tree:this.ui.tree?1:0},preventDefault:!0},e={data:{cmd:"parents",target:p},preventDefault:!0};return a.when(this.request(d),this.request(e)).fail(function(a){c.reject(a),a&&b.request({data:{cmd:"open",target:b.lastDir(""),tree:1,init:1},notify:{type:"open",cnt:1,hideCnt:!0}})}).done(function(a,d){var e=b.diff(a.files.concat(d&&d.tree?d.tree:[]));return e.removed.length&&b.remove(e),e.added.length&&b.add(e),e.changed.length&&b.change(e),c.resolve(e)}),c},this.upload=function(a){return this.transport.upload(a,this)},this.bind=function(a,b){var c;if(typeof b=="function"){a=(""+a).toLowerCase().split(/\s+/);for(c=0;c<a.length;c++)t[a[c]]===void 0&&(t[a[c]]=[]),t[a[c]].push(b)}return this},this.unbind=function(a,b){var c=t[(""+a).toLowerCase()]||[],d=c.indexOf(b);return d>-1&&c.splice(d,1),b=null,this},this.trigger=function(b,c){var b=b.toLowerCase(),d=t[b]||[],e,f;this.debug("event-"+b,c);if(d.length){b=a.Event(b);for(e=0;e<d.length;e++){b.data=a.extend(!0,{},c);try{if(d[e](b,this)===!1||b.isDefaultPrevented()){this.debug("event-stoped",b.type);break}}catch(g){window.console&&window.console.log&&window.console.log(g)}}}return this},this.shortcut=function(b){var c,d,e,f,g;if(this.options.allowShortcuts&&b.pattern&&a.isFunction(b.callback)){c=b.pattern.toUpperCase().split(/\s+/);for(f=0;f<c.length;f++)d=c[f],g=d.split("+"),e=(e=g.pop()).length==1?e>0?e:e.charCodeAt(0):a.ui.keyCode[e],e&&!u[d]&&(u[d]={keyCode:e,altKey:a.inArray("ALT",g)!=-1,ctrlKey:a.inArray("CTRL",g)!=-1,shiftKey:a.inArray("SHIFT",g)!=-1,type:b.type||"keydown",callback:b.callback,description:b.description,pattern:d})}return this},this.shortcuts=function(){var b=[];return a.each(u,function(a,c){b.push([c.pattern,d.i18n(c.description)])}),b},this.clipboard=function(b,c){var d=function(){return a.map(v,function(a){return a.hash})};return b!==void 0&&(v.length&&this.trigger("unlockfiles",{files:d()}),w=[],v=a.map(b||[],function(a){var b=r[a];return b?(w.push(a),{hash:a,phash:b.phash,name:b.name,mime:b.mime,read:b.read,locked:b.locked,cut:!!c}):null}),this.trigger("changeclipboard",{clipboard:v.slice(0,v.length)}),c&&this.trigger("lockfiles",{files:d()})),v.slice(0,v.length)},this.isCommandEnabled=function(b){return this._commands[b]?a.inArray(b,q.disabled)===-1:!1},this.exec=function(b,c,d){return this._commands[b]&&this.isCommandEnabled(b)?this._commands[b].exec(c,d):a.Deferred().reject("No such command")},this.dialog=function(c,d){return a("<div/>").append(c).appendTo(b).elfinderdialog(d)},this.getUI=function(a){return this.ui[a]||b},this.command=function(a){return a===void 0?this._commands:this._commands[a]},this.resize=function(a,c){b.css("width",a).height(c).trigger("resize"),this.trigger("resize",{width:b.width(),height:b.height()})},this.restoreSize=function(){this.resize(z,A)},this.show=function(){b.show(),this.enable().trigger("show")},this.hide=function(){this.disable().trigger("hide"),b.hide()},this.destroy=function(){b&&b[0].elfinder&&(this.trigger("destroy").disable(),t={},u={},a(document).add(b).unbind("."+this.namespace),d.trigger=function(){},b.children().remove(),b.append(e.contents()).removeClass(this.cssClass).attr("style",f),b[0].elfinder=null,C&&clearInterval(C))},this.setSort(this.options.sort,this.options.sortDirect);if(!(a.fn.selectable&&a.fn.draggable&&a.fn.droppable))return alert(this.i18n("errJqui"));if(!b.length)return alert(this.i18n("errNode"));if(!this.options.url)return alert(this.i18n("errURL"));a.extend(a.ui.keyCode,{F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120}),this.dragUpload=!1,this.xhrUpload=typeof XMLHttpRequestUpload!="undefined"&&typeof File!="undefined"&&typeof FormData!="undefined",this.transport={},typeof this.options.transport=="object"&&(this.transport=this.options.transport,typeof this.transport.init=="function"&&this.transport.init(this)),typeof this.transport.send!="function"&&(this.transport.send=function(b){return a.ajax(b)}),this.transport.upload=="iframe"?this.transport.upload=a.proxy(this.uploads.iframe,this):typeof this.transport.upload=="function"?this.dragUpload=!!this.options.dragUploadAllow:this.xhrUpload?(this.transport.upload=a.proxy(this.uploads.xhr,this),this.dragUpload=!0):this.transport.upload=a.proxy(this.uploads.iframe,this),this.error=function(){var a=arguments[0];return arguments.length==1&&typeof a=="function"?d.bind("error",a):d.trigger("error",{error:a})},a.each(["enable","disable","load","open","reload","select","add","remove","change","dblclick","getfile","lockfiles","unlockfiles","dragstart","dragstop","search","searchend","viewchange"],function(b,c){d[c]=function(){var b=arguments[0];return arguments.length==1&&typeof b=="function"?d.bind(c,b):d.trigger(c,a.isPlainObject(b)?b:{})}}),this.enable(function(){!l&&d.visible()&&d.ui.overlay.is(":hidden")&&(l=!0,a("texarea:focus,input:focus,button").blur(),b.removeClass("elfinder-disabled"))}).disable(function(){m=l,l=!1,b.addClass("elfinder-disabled")}).open(function(){s=[]}).select(function(b){s=a.map(b.data.selected||b.data.value||[],function(a){return r[a]?a:null})}).error(function(b){var c={cssClass:"elfinder-dialog-error",title:d.i18n(d.i18n("error")),resizable:!1,destroyOnClose:!0,buttons:{}};c.buttons[d.i18n(d.i18n("btnClose"))]=function(){a(this).elfinderdialog("close")},d.dialog('<span class="elfinder-dialog-icon elfinder-dialog-icon-error"/>'+d.i18n(b.data.error),c)}).bind("tree parents",function(a){E(a.data.tree||[])}).bind("tmb",function(b){a.each(b.data.images||[],function(a,b){r[a]&&(r[a].tmb=b)})}).add(function(a){E(a.data.added||[])}).change(function(b){a.each(b.data.changed||[],function(b,c){var d=c.hash;r[d]=r[d]?a.extend(r[d],c):c})}).remove(function(b){var c=b.data.removed||[],d=c.length,e=function(b){var c=r[b];c&&(c.mime=="directory"&&c.dirs&&a.each(r,function(a,c){c.phash==b&&e(a)}),delete r[b])};while(d--)e(c[d])}).bind("search",function(a){E(a.data.files)}).bind("rm",function(b){var c=B.canPlayType&&B.canPlayType('audio/wav; codecs="1"');c&&c!=""&&c!="no"&&a(B).html('<source src="./sounds/rm.wav" type="audio/wav">')[0].play()}),a.each(this.options.handlers,function(a,b){d.bind(a,b)}),this.history=new this.history(this),typeof this.options.getFileCallback=="function"&&this.commands.getfile&&(this.bind("dblclick",function(a){a.preventDefault(),d.exec("getfile").fail(function(){d.exec("open")})}),this.shortcut({pattern:"enter",description:this.i18n("cmdgetfile"),callback:function(){d.exec("getfile").fail(function(){d.exec(d.OS=="mac"?"rename":"open")})}}).shortcut({pattern:"ctrl+enter",description:this.i18n(this.OS=="mac"?"cmdrename":"cmdopen"),callback:function(){d.exec(d.OS=="mac"?"rename":"open")}})),this._commands={},a.isArray(this.options.commands)||(this.options.commands=[]),a.each(["open","reload","back","forward","up","home","info","quicklook","getfile","help"],function(b,c){a.inArray(c,d.options.commands)===-1&&d.options.commands.push(c)}),a.each(this.options.commands,function(b,c){var e=d.commands[c];a.isFunction(e)&&!d._commands[c]&&(e.prototype=y,d._commands[c]=new e,d._commands[c].setup(c,d.options.commandsOptions[c]||{}))}),b.addClass(this.cssClass).bind(i,function(){!l&&d.enable()}),this.ui={workzone:a("<div/>").appendTo(b).elfinderworkzone(this),navbar:a("<div/>").appendTo(b).elfindernavbar(this,this.options.uiOptions.navbar||{}),contextmenu:a("<div/>").appendTo(b).elfindercontextmenu(this),overlay:a("<div/>").appendTo(b).elfinderoverlay({show:function(){d.disable()},hide:function(){m&&d.enable()}}),cwd:a("<div/>").appendTo(b).elfindercwd(this),notify:this.dialog("",{cssClass:"elfinder-dialog-notify",position:{top:"12px",right:"12px"},resizable:!1,autoOpen:!1,title:"&nbsp;",width:280}),statusbar:a('<div class="ui-widget-header ui-helper-clearfix ui-corner-bottom elfinder-statusbar"/>').hide().appendTo(b)},a.each(this.options.ui||
[],function(c,e){var f="elfinder"+e,g=d.options.uiOptions[e]||{};!d.ui[e]&&a.fn[f]&&(d.ui[e]=a("<"+(g.tag||"div")+"/>").appendTo(b)[f](d,g))}),b[0].elfinder=this,this.options.resizable&&a.fn.resizable&&b.resizable({handles:"se",minWidth:300,minHeight:200}),this.options.width&&(z=this.options.width),this.options.height&&(A=parseInt(this.options.height)),d.resize(z,A),a(document).bind("click."+this.namespace,function(c){l&&!a(c.target).closest(b).length&&d.disable()}).bind(j+" "+k,F),this.trigger("init").request({data:{cmd:"open",target:d.lastDir(),init:1,tree:this.ui.tree?1:0},preventDone:!0,notify:{type:"open",cnt:1,hideCnt:!0},freeze:!0}).fail(function(){d.trigger("fail").disable().lastDir(""),t={},u={},a(document).add(b).unbind("."+this.namespace),d.trigger=function(){}}).done(function(b){d.load().debug("api",d.api),b=a.extend(!0,{},b),D(b),d.trigger("open",b)}),this.one("load",function(){b.trigger("resize"),d.options.sync>1e3&&(C=setInterval(function(){d.sync()},d.options.sync))})},elFinder.prototype={res:function(a,b){return this.resources[a]&&this.resources[a][b]},i18:{en:{translator:"",language:"English",direction:"ltr",dateFormat:"d.m.Y H:i",fancyDateFormat:"$1 H:i",messages:{}},months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},kinds:{unknown:"Unknown",directory:"Folder",symlink:"Alias","symlink-broken":"AliasBroken","application/x-empty":"TextPlain","application/postscript":"Postscript","application/vnd.ms-office":"MsOffice","application/vnd.ms-word":"MsWord","application/vnd.ms-excel":"MsExcel","application/vnd.ms-powerpoint":"MsPP","application/pdf":"PDF","application/xml":"XML","application/vnd.oasis.opendocument.text":"OO","application/x-shockwave-flash":"AppFlash","application/flash-video":"Flash video","application/x-bittorrent":"Torrent","application/javascript":"JS","application/rtf":"RTF","application/rtfd":"RTF","application/x-font-ttf":"TTF","application/x-font-otf":"OTF","application/x-rpm":"RPM","application/x-web-config":"TextPlain","application/xhtml+xml":"HTML","application/docbook+xml":"DOCBOOK","application/x-awk":"AWK","application/x-gzip":"GZIP","application/x-bzip2":"BZIP","application/zip":"ZIP","application/x-zip":"ZIP","application/x-rar":"RAR","application/x-tar":"TAR","application/x-7z-compressed":"7z","application/x-jar":"JAR","text/plain":"TextPlain","text/x-php":"PHP","text/html":"HTML","text/javascript":"JS","text/css":"CSS","text/rtf":"RTF","text/rtfd":"RTF","text/x-c":"C","text/x-csrc":"C","text/x-chdr":"CHeader","text/x-c++":"CPP","text/x-c++src":"CPP","text/x-c++hdr":"CPPHeader","text/x-shellscript":"Shell","application/x-csh":"Shell","text/x-python":"Python","text/x-java":"Java","text/x-java-source":"Java","text/x-ruby":"Ruby","text/x-perl":"Perl","text/x-sql":"SQL","text/xml":"XML","text/x-comma-separated-values":"CSV","image/x-ms-bmp":"BMP","image/jpeg":"JPEG","image/gif":"GIF","image/png":"PNG","image/tiff":"TIFF","image/x-targa":"TGA","image/vnd.adobe.photoshop":"PSD","image/xbm":"XBITMAP","image/pxm":"PXM","audio/mpeg":"AudioMPEG","audio/midi":"AudioMIDI","audio/ogg":"AudioOGG","audio/mp4":"AudioMPEG4","audio/x-m4a":"AudioMPEG4","audio/wav":"AudioWAV","audio/x-mp3-playlist":"AudioPlaylist","video/x-dv":"VideoDV","video/mp4":"VideoMPEG4","video/mpeg":"VideoMPEG","video/x-msvideo":"VideoAVI","video/quicktime":"VideoMOV","video/x-ms-wmv":"VideoWM","video/x-flv":"VideoFlash","video/x-matroska":"VideoMKV","video/ogg":"VideoOGG"},rules:{defaults:function(b){return!b||b.added&&!a.isArray(b.added)||b.removed&&!a.isArray(b.removed)||b.changed&&!a.isArray(b.changed)?!1:!0},open:function(b){return b&&b.cwd&&b.files&&a.isPlainObject(b.cwd)&&a.isArray(b.files)},tree:function(b){return b&&b.tree&&a.isArray(b.tree)},parents:function(b){return b&&b.tree&&a.isArray(b.tree)},tmb:function(b){return b&&b.images&&(a.isPlainObject(b.images)||a.isArray(b.images))},upload:function(b){return b&&(a.isPlainObject(b.added)||a.isArray(b.added))},search:function(b){return b&&b.files&&a.isArray(b.files)}},sorts:{nameDirsFirst:1,kindDirsFirst:2,sizeDirsFirst:3,dateDirsFirst:4,name:5,kind:6,size:7,date:8},setSort:function(a,b){this.sort=this.sorts[a]||1,this.sortDirect=b=="asc"||b=="desc"?b:"asc",this.trigger("sortchange")},commands:{},parseUploadData:function(b){var c;if(!a.trim(b))return{error:["errResponse","errDataEmpty"]};try{c=a.parseJSON(b)}catch(d){return{error:["errResponse","errDataNotJSON"]}}return this.validResponse("upload",c)?(c=this.normalize(c),c.removed=a.map(c.added||[],function(a){return a.hash}),c):{error:["errResponse"]}},iframeCnt:0,uploads:{iframe:function(b,c){var d=c?c:this,e=b.input,f=a.Deferred().fail(function(a){a&&d.error(a)}).done(function(a){a.warning&&d.error(a.warning),a.removed&&d.remove(a),a.added&&d.add(a),a.changed&&d.change(a),d.trigger("upload",a),a.sync&&d.sync()}),g="iframe-"+d.namespace+ ++d.iframeCnt,h=a('<form action="'+d.uploadURL+'" method="post" enctype="multipart/form-data" encoding="multipart/form-data" target="'+g+'" style="display:none"><input type="hidden" name="cmd" value="upload" /></form>'),i=a.browser.msie,j=function(){o&&clearTimeout(o),n&&clearTimeout(n),m&&d.notify({type:"upload",cnt:-l}),setTimeout(function(){i&&a('<iframe src="javascript:false;"/>').appendTo(h),h.remove(),k.remove()},100)},k=a('<iframe src="'+(i?"javascript:false;":"about:blank")+'" name="'+g+'" style="position:absolute;left:-1000px;top:-1000px" />').bind("load",function(){k.unbind("load").bind("load",function(){var a=d.parseUploadData(k.contents().text());j(),a.error?f.reject(a.error):f.resolve(a)}),n=setTimeout(function(){m=!0,d.notify({type:"upload",cnt:l})},d.options.notifyDelay),d.options.iframeTimeout>0&&(o=setTimeout(function(){j(),f.reject([errors.connect,errors.timeout])},d.options.iframeTimeout)),h.submit()}),l,m,n,o;return e&&a(e).is(":file")&&a(e).val()?(h.append(e),l=e.files?e.files.length:1,h.append('<input type="hidden" name="'+(d.newAPI?"target":"current")+'" value="'+d.cwd().hash+'"/>').append('<input type="hidden" name="html" value="1"/>').append(a(e).attr("name","upload[]")),a.each(d.options.onlyMimes||[],function(a,b){h.append('<input type="hidden" name="mimes[]" value="'+b+'"/>')}),a.each(d.options.customData,function(a,b){h.append('<input type="hidden" name="'+a+'" value="'+b+'"/>')}),h.appendTo("body"),k.appendTo("body"),f):f.reject()},xhr:function(b,c){var d=c?c:this,e=a.Deferred().fail(function(a){a&&d.error(a)}).done(function(a){a.warning&&d.error(a.warning),a.removed&&d.remove(a),a.added&&d.add(a),a.changed&&d.change(a),d.trigger("upload",a),a.sync&&d.sync()}).always(function(){m&&clearTimeout(m),k&&d.notify({type:"upload",cnt:-i,progress:100*i})}),f=new XMLHttpRequest,g=new FormData,h=b.input?b.input.files:b.files,i=h.length,j=5,k=!1,l=function(){return setTimeout(function(){k=!0,d.notify({type:"upload",cnt:i,progress:j*i})},d.options.notifyDelay)},m;if(!i)return e.reject();f.addEventListener("error",function(){e.reject("errConnect")},!1),f.addEventListener("abort",function(){e.reject(["errConnect","errAbort"])},!1),f.addEventListener("load",function(){var a=f.status,b;if(a>500)return e.reject("errResponse");if(a!=200)return e.reject("errConnect");if(f.readyState!=4)return e.reject(["errConnect","errTimeout"]);if(!f.responseText)return e.reject(["errResponse","errDataEmpty"]);b=d.parseUploadData(f.responseText),b.error?e.reject(b.error):e.resolve(b)},!1),f.upload.addEventListener("progress",function(a){var b=j,c;a.lengthComputable&&(c=parseInt(a.loaded*100/a.total),c>0&&!m&&(m=l()),c-b>4&&(j=c,k&&d.notify({type:"upload",cnt:0,progress:(j-b)*i})))},!1),f.open("POST",d.uploadURL,!0),g.append("cmd","upload"),g.append(d.newAPI?"target":"current",d.cwd().hash),a.each(d.options.customData,function(a,b){g.append(a,b)}),a.each(d.options.onlyMimes,function(a,b){g.append("mimes["+a+"]",b)}),a.each(h,function(a,b){g.append("upload[]",b)}),f.onreadystatechange=function(){f.readyState==4&&f.status==0&&
e.reject(["errConnect","errAbort"])},f.send(g);if(!a.browser.safari||!b.files)m=l();return e}},one:function(b,c){var d=this,e=a.proxy(c,function(a){return setTimeout(function(){d.unbind(a.type,e)},3),c.apply(this,arguments)});return this.bind(b,e)},localStorage:function(a,b){var c=window.localStorage;return a="elfinder-"+a+this.id,b!==void 0&&c.setItem(a,b),c.getItem(a)||""},cookie:function(b,c){var d,e,f,g;b="elfinder-"+b+this.id;if(c===void 0){if(document.cookie&&document.cookie!=""){f=document.cookie.split(";"),b+="=";for(g=0;g<f.length;g++){f[g]=a.trim(f[g]);if(f[g].substring(0,b.length)==b)return decodeURIComponent(f[g].substring(b.length))}}return""}return e=a.extend({},this.options.cookie),c===null&&(c="",e.expires=-1),typeof e.expires=="number"&&(d=new Date,d.setTime(d.getTime()+e.expires*864e5),e.expires=d),document.cookie=b+"="+encodeURIComponent(c)+"; expires="+e.expires.toUTCString()+(e.path?"; path="+e.path:"")+(e.domain?"; domain="+e.domain:"")+(e.secure?"; secure":""),c},lastDir:function(a){return this.options.rememberLastDir?this.storage("lastdir",a):""},_node:a("<span/>"),escape:function(a){return this._node.text(a).html()},normalize:function(b){var c=function(a){return a&&a.hash&&a.name&&a.mime?(a.mime=="application/x-empty"&&(a.mime="text/plain"),a):null};return b.files&&(b.files=a.map(b.files,c)),b.tree&&(b.tree=a.map(b.tree,c)),b.added&&(b.added=a.map(b.added,c)),b.changed&&(b.changed=a.map(b.changed,c)),b.api&&(b.init=!0),b},compare:function(a,b){var c=this.sort,d=this.sortDirect=="asc",e=d?a:b,f=d?b:a,g=this.mime2kind(e.mime).toLowerCase(),h=this.mime2kind(f.mime).toLowerCase(),i=a.mime=="directory",j=b.mime=="directory",k=e.name.toLowerCase(),l=f.name.toLowerCase(),m=i?0:parseInt(e.size)||0,n=j?0:parseInt(f.size)||0,o=e.ts||e.date||"",p=f.ts||f.date||"";if(c<=4){if(i&&!j)return-1;if(!i&&j)return 1}return c!=2&&c!=6||g==h?c!=3&&c!=7||m==n?c!=4&&c!=8||o==p?e.name.localeCompare(f.name):o>p?1:-1:m>n?1:-1:g.localeCompare(h)},sortFiles:function(b){return b.sort(a.proxy(this.compare,this))},notify:function(b){var c=b.type,d=this.messages["ntf"+c]?this.i18n("ntf"+c):this.i18n("ntfsmth"),e=this.ui.notify,f=e.children(".elfinder-notify-"+c),g='<div class="elfinder-notify elfinder-notify-{type}"><span class="elfinder-dialog-icon elfinder-dialog-icon-{type}"/><span class="elfinder-notify-msg">{msg}</span> <span class="elfinder-notify-cnt"/><div class="elfinder-notify-progressbar"><div class="elfinder-notify-progress"/></div></div>',h=b.cnt,i=b.progress>=0&&b.progress<=100?b.progress:0,j,k,l;return c?(f.length||(f=a(g.replace(/\{type\}/g,c).replace(/\{msg\}/g,d)).appendTo(e).data("cnt",0),i&&f.data({progress:0,total:0})),j=h+parseInt(f.data("cnt")),j>0?(!b.hideCnt&&f.children(".elfinder-notify-cnt").text("("+j+")"),e.is(":hidden")&&e.elfinderdialog("open"),f.data("cnt",j),i<100&&(k=f.data("total"))>=0&&(l=f.data("progress"))>=0&&(k=h+parseInt(f.data("total")),l=i+l,i=parseInt(l/k),f.data({progress:l,total:k}),e.find(".elfinder-notify-progress").animate({width:(i<100?i:100)+"%"},20))):(f.remove(),!e.children().length&&e.elfinderdialog("close")),this):this},confirm:function(b){var c=!1,d={cssClass:"elfinder-dialog-confirm",modal:!0,resizable:!1,title:this.i18n(b.title||"confirmReq"),buttons:{},close:function(){!c&&b.cancel.callback(),a(this).elfinderdialog("destroy")}},e=this.i18n("apllyAll"),f,g;return b.reject&&(d.buttons[this.i18n(b.reject.label)]=function(){b.reject.callback(!!g&&!!g.prop("checked")),c=!0,a(this).elfinderdialog("close")}),d.buttons[this.i18n(b.accept.label)]=function(){b.accept.callback(!!g&&!!g.prop("checked")),c=!0,a(this).elfinderdialog("close")},d.buttons[this.i18n(b.cancel.label)]=function(){a(this).elfinderdialog("close")},b.all&&(b.reject&&(d.width=370),d.create=function(){g=a('<input type="checkbox" />'),a(this).next().children().before(a("<label>"+e+"</label>").prepend(g))},d.open=function(){var b=a(this).next(),c=parseInt(b.children(":first").outerWidth()+b.children(":last").outerWidth());c>parseInt(b.width())&&a(this).closest(".elfinder-dialog").width(c+30)}),this.dialog('<span class="elfinder-dialog-icon elfinder-dialog-icon-confirm"/>'+this.i18n(b.text),d)},uniqueName:function(a,b){var c=0,d="",e,f;a=this.i18n(a),b=b||this.cwd().hash,(e=a.indexOf(".txt"))!=-1&&(d=".txt",a=a.substr(0,e)),f=a+d;if(!this.fileByName(f,b))return f;while(c<1e4){f=a+" "+ ++c+d;if(!this.fileByName(f,b))return f}return a+Math.random()+d},i18n:function(){var b=this,c=this.messages,d=[],e=[],f=function(a){var c;if(a.indexOf("#")===0)if(c=b.file(a.substr(1)))return c.name;return a},g,h,i;for(g=0;g<arguments.length;g++){i=arguments[g];if(typeof i=="string")d.push(f(i));else if(a.isArray(i))for(h=0;h<i.length;h++)typeof i[h]=="string"&&d.push(f(i[h]))}for(g=0;g<d.length;g++){if(a.inArray(g,e)!==-1)continue;i=d[g],i=c[i]||i,i=i.replace(/\$(\d+)/g,function(a,b){return b=g+parseInt(b),b>0&&d[b]&&e.push(b),d[b]||""}),d[g]=i}return a.map(d,function(b,c){return a.inArray(c,e)===-1?b:null}).join("<br>")},mime2class:function(a){var b="elfinder-cwd-icon-";return a=a.split("/"),b+a[0]+(a[0]!="image"&&a[1]?" "+b+a[1].replace(/(\.|\+)/g,"-"):"")},mime2kind:function(a){var b=typeof a=="object"?a.mime:a,c;a.alias?c="Alias":this.kinds[b]?c=this.kinds[b]:b.indexOf("text")===0?c="Text":b.indexOf("image")===0?c="Image":b.indexOf("audio")===0?c="Audio":b.indexOf("video")===0?c="Video":b.indexOf("application")===0?c="App":c=b;return this.messages["kind"+c]?this.i18n("kind"+c):b;var b,c},formatDate:function(a,b){var c=this,b=b||a.ts,d=c.i18,e,f,g,h,i,j,k,l,m,n,o;return c.options.clientFormatDate&&b>0?(e=new Date(b*1e3),l=e[c.getHours](),m=l>12?l-12:l,n=e[c.getMinutes](),o=e[c.getSeconds](),h=e[c.getDate](),i=e[c.getDay](),j=e[c.getMonth]()+1,k=e[c.getFullYear](),f=b>=this.yesterday?this.fancyFormat:this.dateFormat,g=f.replace(/[a-z]/gi,function(a){switch(a){case"d":return h>9?h:"0"+h;case"j":return h;case"D":return c.i18n(d.daysShort[i]);case"l":return c.i18n(d.days[i]);case"m":return j>9?j:"0"+j;case"n":return j;case"M":return c.i18n(d.monthsShort[j-1]);case"F":return c.i18n(d.months[j-1]);case"Y":return k;case"y":return(""+k).substr(2);case"H":return l>9?l:"0"+l;case"G":return l;case"g":return m;case"h":return m>9?m:"0"+m;case"a":return l>12?"pm":"am";case"A":return l>12?"PM":"AM";case"i":return n>9?n:"0"+n;case"s":return o>9?o:"0"+o}return a}),b>=this.yesterday?g.replace("$1",this.i18n(b>=this.today?"Today":"Yesterday")):g):a.date?a.date.replace(/([a-z]+)\s/i,function(a,b){return c.i18n(b)+" "}):c.i18n("dateUnknown")},perms2class:function(a){var b="";return!a.read&&!a.write?b="elfinder-na":a.read?a.write||(b="elfinder-ro"):b="elfinder-wo",b},formatPermissions:function(a){var b=[];return a.read&&b.push(this.i18n("read")),a.write&&b.push(this.i18n("write")),b.length?b.join(" "+this.i18n("and")+" "):this.i18n("noaccess")},formatSize:function(a){var b=1,c="b";return a=="unknown"?this.i18n("unknown"):(a>1073741824?(b=1073741824,c="GB"):a>1048576?(b=1048576,c="MB"):a>1024&&(b=1024,c="KB"),(a>0?Math.round(a/b):0)+" "+c)},navHash2Id:function(a){return"nav-"+a},navId2Hash:function(a){return typeof a=="string"?a.substr(4):!1},log:function(a){return window.console&&window.console.log&&window.console.log(a),this},debug:function(b,c){var d=this.options.debug;return(d=="all"||d===!0||a.isArray(d)&&a.inArray(b,d)!=-1)&&window.console&&window.console.log&&window.console.log("elfinder debug: ["+b+"] ["+this.id+"]",c),this},time:function(a){window.console&&window.console.time&&window.console.time(a)},timeEnd:function(a){window.console&&window.console.timeEnd&&window.console.timeEnd(a)}},elFinder.prototype.version="2.0 rc1",a.fn.elfinder=function(a){return a=="instance"?this.getElFinder():this.each(function(){var b=typeof a=="string"?a:"";this.elfinder||new elFinder(this,typeof a=="object"?a:{});switch(b){case"close":case"hide":this.elfinder.hide();break;case"open":case"show":this.elfinder.show();break;case"destroy":this.elfinder.destroy()}})},a.fn.getElFinder=function(){var a;return this.each(function(){if(this.elfinder)return a=this.elfinder,!1}),a},elFinder.prototype._options={url:"",requestType:"get",transport:{},urlUpload:"",dragUploadAllow:"auto",iframeTimeout
:0,customData:{},handlers:{},lang:"en",cssClass:"",commands:["open","reload","home","up","back","forward","getfile","quicklook","download","rm","duplicate","rename","mkdir","mkfile","upload","copy","cut","paste","edit","extract","archive","search","info","view","help","resize","sort"],commandsOptions:{getfile:{onlyURL:!0,multiple:!1,folders:!1,oncomplete:""},upload:{ui:"uploadbutton"},quicklook:{autoplay:!0,jplayer:"extensions/jplayer"},edit:{mimes:[],editors:[]},help:{view:["about","shortcuts","help"]}},getFileCallback:null,ui:["toolbar","tree","path","stat"],uiOptions:{toolbar:[["back","forward"],["mkdir","mkfile","upload"],["open","download","getfile"],["info"],["quicklook"],["copy","cut","paste"],["rm"],["duplicate","rename","edit","resize"],["extract","archive"],["search"],["view","sort"],["help"]],tree:{openRootOnLoad:!0,syncTree:!0},navbar:{minWidth:150,maxWidth:500}},onlyMimes:[],sort:"nameDirsFirst",sortDirect:"asc",clientFormatDate:!0,UTCDate:!1,dateFormat:"",fancyDateFormat:"",width:"auto",height:400,resizable:!0,notifyDelay:500,allowShortcuts:!0,rememberLastDir:!0,showFiles:30,showThreshold:50,validName:!1,sync:0,loadTmbs:5,cookie:{expires:30,domain:"",path:"/",secure:!1},contextmenu:{navbar:["open","|","copy","cut","paste","duplicate","|","rm","|","info"],cwd:["reload","back","|","upload","mkdir","mkfile","paste","|","sort","|","info"],files:["getfile","|","open","quicklook","|","download","|","copy","cut","paste","duplicate","|","rm","|","edit","rename","resize","|","archive","extract","|","info"]},debug:["error","warning","event-destroy"]},elFinder.prototype.history=function(b){var c=this,d=!0,e=[],f,g=function(){e=[b.cwd().hash],f=0,d=!0},h=function(h){return h&&c.canForward()||!h&&c.canBack()?(d=!1,b.exec("open",e[h?++f:--f]).fail(g)):a.Deferred().reject()};this.canBack=function(){return f>0},this.canForward=function(){return f<e.length-1},this.back=h,this.forward=function(){return h(!0)},b.open(function(a){var c=e.length,g=b.cwd().hash;d&&(f>=0&&c>f+1&&e.splice(f+1),e[e.length-1]!=g&&e.push(g),f=e.length-1),d=!0}).reload(g)},elFinder.prototype.command=function(b){this.fm=b,this.name="",this.title="",this.state=-1,this.alwaysEnabled=!1,this._disabled=!1,this.disableOnSearch=!1,this.updateOnSelect=!0,this._handlers={enable:function(){this.update(void 0,this.value)},disable:function(){this.update(-1,this.value)},"open reload load":function(a){this._disabled=!this.alwaysEnabled&&!this.fm.isCommandEnabled(this.name),this.update(void 0,this.value),this.change()}},this.handlers={},this.shortcuts=[],this.options={ui:"button"},this.setup=function(b,c){var d=this,e=this.fm,f,g;this.name=b,this.title=e.messages["cmd"+b]?e.i18n("cmd"+b):b,this.options=a.extend({},this.options,c),this.listeners=[],this.updateOnSelect&&(this._handlers.select=function(){this.update(void 0,this.value)}),a.each(a.extend({},d._handlers,d.handlers),function(b,c){e.bind(b,a.proxy(c,d))});for(f=0;f<this.shortcuts.length;f++)g=this.shortcuts[f],g.callback=a.proxy(g.callback||function(){this.exec()},this),!g.description&&(g.description=this.title),e.shortcut(g);this.disableOnSearch&&e.bind("search searchend",function(a){d._disabled=a.type=="search",d.update(void 0,d.value)}),this.init()},this.init=function(){},this.exec=function(b,c){return a.Deferred().reject()},this.disabled=function(){return this.state<0},this.enabled=function(){return this.state>-1},this.active=function(){return this.state>0},this.getstate=function(){return-1},this.update=function(a,b){var c=this.state,d=this.value;this._disabled?this.state=-1:this.state=a!==void 0?a:this.getstate(),this.value=b,(c!=this.state||d!=this.value)&&this.change()},this.change=function(a){var b,c;if(typeof a=="function")this.listeners.push(a);else for(c=0;c<this.listeners.length;c++){b=this.listeners[c];try{b(this.state,this.value)}catch(d){this.fm.debug("error",d)}}return this},this.hashes=function(c){return c?a.map(a.isArray(c)?c:[c],function(a){return b.file(a)?a:null}):b.selected()},this.files=function(b){var c=this.fm;return b?a.map(a.isArray(b)?b:[b],function(a){return c.file(a)||null}):c.selectedFiles()}},elFinder.prototype.resources={"class":{hover:"ui-state-hover",active:"ui-state-active",disabled:"ui-state-disabled",draggable:"ui-draggable",droppable:"ui-droppable",adroppable:"elfinder-droppable-active",cwdfile:"elfinder-cwd-file",cwd:"elfinder-cwd",tree:"elfinder-tree",treeroot:"elfinder-navbar-root",navdir:"elfinder-navbar-dir",navdirwrap:"elfinder-navbar-dir-wrapper",navarrow:"elfinder-navbar-arrow",navsubtree:"elfinder-navbar-subtree",navcollapse:"elfinder-navbar-collapsed",navexpand:"elfinder-navbar-expanded",treedir:"elfinder-tree-dir",placedir:"elfinder-place-dir",searchbtn:"elfinder-button-search"},tpl:{perms:'<span class="elfinder-perms"/>',symlink:'<span class="elfinder-symlink"/>',navicon:'<span class="elfinder-nav-icon"/>',navspinner:'<span class="elfinder-navbar-spinner"/>',navdir:'<div class="elfinder-navbar-wrapper"><span id="{id}" class="ui-corner-all elfinder-navbar-dir {cssclass}"><span class="elfinder-navbar-arrow"/><span class="elfinder-navbar-icon"/>{symlink}{permissions}{name}</span><div class="elfinder-navbar-subtree"/></div>'},mimes:{text:["application/x-empty","application/javascript","application/xhtml+xml","audio/x-mp3-playlist","application/x-web-config","application/docbook+xml","application/x-php","application/x-perl","application/x-awk","application/x-config","application/x-csh","application/xml"]},mixin:{make:function(){var b=this.fm,c=this.name,d=b.getUI("cwd"),e=a.Deferred().fail(function(a){a&&b.error(a)}).always(function(){k.remove(),j.remove(),b.enable()}),f="tmp_"+parseInt(Math.random()*1e5),g=b.cwd().hash,h=new Date,i={hash:f,name:b.uniqueName(this.prefix),mime:this.mime,read:!0,write:!0,date:"Today "+h.getHours()+":"+h.getMinutes()},j=d.trigger("create."+b.namespace,i).find("#"+f),k=a('<input type="text"/>').keydown(function(b){b.stopImmediatePropagation(),b.keyCode==a.ui.keyCode.ESCAPE?e.reject():b.keyCode==a.ui.keyCode.ENTER&&k.blur()}).mousedown(function(a){a.stopPropagation()}).blur(function(){var d=a.trim(k.val()),h=k.parent();if(h.length){if(!d)return e.reject("errInvName");if(b.fileByName(d,g))return e.reject(["errExists",d]);h.html(b.escape(d)),b.lockfiles({files:[f]}),b.request({data:{cmd:c,name:d,target:g},notify:{type:c,cnt:1},preventFail:!0,syncOnFail:!0}).fail(function(a){e.reject(a)}).done(function(a){e.resolve(a)})}});return this.disabled()||!j.length?e.reject():(b.disable(),j.find(".elfinder-cwd-filename").empty("").append(k.val(i.name)),k.select().focus(),e)}}},a.fn.dialogelfinder=function(b){var c="elfinderPosition",d="elfinderDestroyOnClose";this.not(".elfinder").each(function(){var e=a(document),f=a('<div class="ui-widget-header dialogelfinder-drag ui-corner-top">'+(b.title||"Files")+"</div>"),g=a('<a href="#" class="dialogelfinder-drag-close ui-corner-all"><span class="ui-icon ui-icon-closethick"/></a>').appendTo(f).click(function(a){a.preventDefault(),h.dialogelfinder("close")}),h=a(this).addClass("dialogelfinder").css("position","absolute").hide().appendTo("body").draggable({handle:".dialogelfinder-drag",containment:"parent"}).elfinder(b).prepend(f),i=h.elfinder("instance");h.width(parseInt(h.width())||840).data(d,!!b.destroyOnClose).find(".elfinder-toolbar").removeClass("ui-corner-top"),b.position&&h.data(c,b.position),b.autoOpen!==!1&&a(this).dialogelfinder("open")});if(b=="open"){var e=a(this),f=e.data(c)||{top:parseInt(a(document).scrollTop()+(a(window).height()<e.height()?2:(a(window).height()-e.height())/2)),left:parseInt(a(document).scrollLeft()+(a(window).width()<e.width()?2:(a(window).width()-e.width())/2))},g=100;e.is(":hidden")&&(a("body").find(":visible").each(function(){var b=a(this),c;this!==e[0]&&b.css("position")=="absolute"&&(c=parseInt(b.zIndex()))>g&&(g=c+1)}),e.zIndex(g).css(f).show().trigger("resize"),setTimeout(function(){e.trigger("resize").mousedown()},200))}else if(b=="close"){var e=a(this);e.is(":visible")&&(e.data(d)?e.elfinder("destroy").remove():e.elfinder("close"))}else if(b=="instance")return a(this).getElFinder();return this},elFinder&&elFinder.prototype&&typeof elFinder.prototype.i18=="object"&&(elFinder.prototype
.i18.en={translator:"Troex Nevelin &lt;troex@fury.scancode.ru&gt;",language:"English",direction:"ltr",dateFormat:"M d, Y h:i A",fancyDateFormat:"$1 h:i A",messages:{error:"Error",errUnknown:"Unknown error.",errUnknownCmd:"Unknown command.",errJqui:"Invalid jQuery UI configuration. Selectable, draggable and droppable components must be included.",errNode:"elFinder requires DOM Element to be created.",errURL:"Invalid elFinder configuration! URL option is not set.",errAccess:"Access denied.",errConnect:"Unable to connect to backend.",errAbort:"Connection aborted.",errTimeout:"Connection timeout.",errNotFound:"Backend not found.",errResponse:"Invalid backend response.",errConf:"Invalid backend configuration.",errJSON:"PHP JSON module not installed.",errNoVolumes:"Readable volumes not available.",errCmdParams:'Invalid parameters for command "$1".',errDataNotJSON:"Data is not JSON.",errDataEmpty:"Data is empty.",errCmdReq:"Backend request requires command name.",errOpen:'Unable to open "$1".',errNotFolder:"Object is not a folder.",errNotFile:"Object is not a file.",errRead:'Unable to read "$1".',errWrite:'Unable to write into "$1".',errPerm:"Permission denied.",errLocked:'"$1" is locked and can not be renamed, moved or removed.',errExists:'File named "$1" already exists.',errInvName:"Invalid file name.",errFolderNotFound:"Folder not found.",errFileNotFound:"File not found.",errTrgFolderNotFound:'Target folder "$1" not found.',errPopup:"Browser prevented opening popup window. To open file enable it in browser options.",errMkdir:'Unable to create folder "$1".',errMkfile:'Unable to create file "$1".',errRename:'Unable to rename "$1".',errCopyFrom:'Copying files from volume "$1" not allowed.',errCopyTo:'Copying files to volume "$1" not allowed.',errUpload:"Upload error.",errUploadFile:'Unable to upload "$1".',errUploadNoFiles:"No files found for upload.",errUploadTotalSize:"Data exceeds the maximum allowed size.",errUploadFileSize:"File exceeds maximum allowed size.",errUploadMime:"File type not allowed.",errUploadTransfer:'"$1" transfer error.',errNotReplace:'Object "$1" already exists at this location and can not be replaced by object with another type.',errReplace:'Unable to replace "$1".',errSave:'Unable to save "$1".',errCopy:'Unable to copy "$1".',errMove:'Unable to move "$1".',errCopyInItself:'Unable to copy "$1" into itself.',errRm:'Unable to remove "$1".',errRmSrc:"Unable remove source file(s).",errExtract:'Unable to extract files from "$1".',errArchive:"Unable to create archive.",errArcType:"Unsupported archive type.",errNoArchive:"File is not archive or has unsupported archive type.",errCmdNoSupport:"Backend does not support this command.",errReplByChild:"The folder “$1” can’t be replaced by an item it contains.",errArcSymlinks:"For security reason denied to unpack archives contains symlinks.",errArcMaxSize:"Archive files exceeds maximum allowed size.",errResize:'Unable to resize "$1".',errUsupportType:"Unsupported file type.",errNotUTF8Content:'File "$1" is not in UTF-8 and cannot be edited.',cmdarchive:"Create archive",cmdback:"Back",cmdcopy:"Copy",cmdcut:"Cut",cmddownload:"Download",cmdduplicate:"Duplicate",cmdedit:"Edit file",cmdextract:"Extract files from archive",cmdforward:"Forward",cmdgetfile:"Select files",cmdhelp:"About this software",cmdhome:"Home",cmdinfo:"Get info",cmdmkdir:"New folder",cmdmkfile:"New text file",cmdopen:"Open",cmdpaste:"Paste",cmdquicklook:"Preview",cmdreload:"Reload",cmdrename:"Rename",cmdrm:"Delete",cmdsearch:"Find files",cmdup:"Go to parent directory",cmdupload:"Upload files",cmdview:"View",cmdresize:"Resize & Rotate",cmdsort:"Sort",btnClose:"Close",btnSave:"Save",btnRm:"Remove",btnApply:"Apply",btnCancel:"Cancel",btnNo:"No",btnYes:"Yes",ntfopen:"Open folder",ntffile:"Open file",ntfreload:"Reload folder content",ntfmkdir:"Creating directory",ntfmkfile:"Creating files",ntfrm:"Delete files",ntfcopy:"Copy files",ntfmove:"Move files",ntfprepare:"Prepare to copy files",ntfrename:"Rename files",ntfupload:"Uploading files",ntfdownload:"Downloading files",ntfsave:"Save files",ntfarchive:"Creating archive",ntfextract:"Extracting files from archive",ntfsearch:"Searching files",ntfresize:"Resizing images",ntfsmth:"Doing something >_<",ntfloadimg:"Loading image",dateUnknown:"unknown",Today:"Today",Yesterday:"Yesterday",Jan:"Jan",Feb:"Feb",Mar:"Mar",Apr:"Apr",May:"May",Jun:"Jun",Jul:"Jul",Aug:"Aug",Sep:"Sep",Oct:"Oct",Nov:"Nov",Dec:"Dec",sortnameDirsFirst:"by name (folders first)",sortkindDirsFirst:"by kind (folders first)",sortsizeDirsFirst:"by size (folders first)",sortdateDirsFirst:"by date (folders first)",sortname:"by name",sortkind:"by kind",sortsize:"by size",sortdate:"by date",confirmReq:"Confirmation required",confirmRm:"Are you sure you want to remove files?<br/>This cannot be undone!",confirmRepl:"Replace old file with new one?",apllyAll:"Apply to all",name:"Name",size:"Size",perms:"Permissions",modify:"Modified",kind:"Kind",read:"read",write:"write",noaccess:"no access",and:"and",unknown:"unknown",selectall:"Select all files",selectfiles:"Select file(s)",selectffile:"Select first file",selectlfile:"Select last file",viewlist:"List view",viewicons:"Icons view",places:"Places",calc:"Calculate",path:"Path",aliasfor:"Alias for",locked:"Locked",dim:"Dimensions",files:"Files",folders:"Folders",items:"Items",yes:"yes",no:"no",link:"Link",searcresult:"Search results",selected:"selected items",about:"About",shortcuts:"Shortcuts",help:"Help",webfm:"Web file manager",ver:"Version",protocol:"protocol version",homepage:"Project home",docs:"Documentation",github:"Fork us on Github",twitter:"Follow us on twitter",facebook:"Join us on facebook",team:"Team",chiefdev:"chief developer",developer:"developer",contributor:"contributor",maintainer:"maintainer",translator:"translator",icons:"Icons",dontforget:"and don't forget to take your towel",shortcutsof:"Shortcuts disabled",dropFiles:"Drop files here",or:"or",selectForUpload:"Select files to upload",moveFiles:"Move files",copyFiles:"Copy files",rmFromPlaces:"Remove from places",aspectRatio:"Aspect ratio",scale:"Scale",width:"Width",height:"Height",resize:"Resize",crop:"Crop",rotate:"Rotate","rotate-cw":"Rotate 90 degrees CW","rotate-ccw":"Rotate 90 degrees CCW",degree:"°",kindUnknown:"Unknown",kindFolder:"Folder",kindAlias:"Alias",kindAliasBroken:"Broken alias",kindApp:"Application",kindPostscript:"Postscript document",kindMsOffice:"Microsoft Office document",kindMsWord:"Microsoft Word document",kindMsExcel:"Microsoft Excel document",kindMsPP:"Microsoft Powerpoint presentation",kindOO:"Open Office document",kindAppFlash:"Flash application",kindPDF:"Portable Document Format (PDF)",kindTorrent:"Bittorrent file",kind7z:"7z archive",kindTAR:"TAR archive",kindGZIP:"GZIP archive",kindBZIP:"BZIP archive",kindZIP:"ZIP archive",kindRAR:"RAR archive",kindJAR:"Java JAR file",kindTTF:"True Type font",kindOTF:"Open Type font",kindRPM:"RPM package",kindText:"Text document",kindTextPlain:"Plain text",kindPHP:"PHP source",kindCSS:"Cascading style sheet",kindHTML:"HTML document",kindJS:"Javascript source",kindRTF:"Rich Text Format",kindC:"C source",kindCHeader:"C header source",kindCPP:"C++ source",kindCPPHeader:"C++ header source",kindShell:"Unix shell script",kindPython:"Python source",kindJava:"Java source",kindRuby:"Ruby source",kindPerl:"Perl script",kindSQL:"SQL source",kindXML:"XML document",kindAWK:"AWK source",kindCSV:"Comma separated values",kindDOCBOOK:"Docbook XML document",kindImage:"Image",kindBMP:"BMP image",kindJPEG:"JPEG image",kindGIF:"GIF Image",kindPNG:"PNG Image",kindTIFF:"TIFF image",kindTGA:"TGA image",kindPSD:"Adobe Photoshop image",kindXBITMAP:"X bitmap image",kindPXM:"Pixelmator image",kindAudio:"Audio media",kindAudioMPEG:"MPEG audio",kindAudioMPEG4:"MPEG-4 audio",kindAudioMIDI:"MIDI audio",kindAudioOGG:"Ogg Vorbis audio",kindAudioWAV:"WAV audio",AudioPlaylist:"MP3 playlist",kindVideo:"Video media",kindVideoDV:"DV movie",kindVideoMPEG:"MPEG movie",kindVideoMPEG4:"MPEG-4 movie",kindVideoAVI:"AVI movie",kindVideoMOV:"Quick Time movie",kindVideoWM:"Windows Media movie",kindVideoFlash:"Flash movie",kindVideoMKV:"Matroska movie",kindVideoOGG:"Ogg movie"}}),a.fn.elfinderbutton=
function(b){return this.each(function(){var c="class",d=b.fm,e=d.res(c,"disabled"),f=d.res(c,"active"),g=d.res(c,"hover"),h="elfinder-button-menu-item",i="elfinder-button-menu-item-selected",j,k=a(this).addClass("ui-state-default elfinder-button").attr("title",b.title).append('<span class="elfinder-button-icon elfinder-button-icon-'+b.name+'"/>').hover(function(a){!k.is("."+e)&&k[a.type=="mouseleave"?"removeClass":"addClass"](g)}).click(function(a){k.is("."+e)||(j&&b.variants.length>1?(j.is(":hidden")&&b.fm.getUI().click(),a.stopPropagation(),j.slideToggle(100)):b.exec())}),l=function(){j.hide()};a.isArray(b.variants)&&(k.addClass("elfinder-menubutton"),j=a('<div class="ui-widget ui-widget-content elfinder-button-menu ui-corner-all"/>').hide().appendTo(k).zIndex(10+k.zIndex()).delegate("."+h,"hover",function(){a(this).toggleClass(g)}).delegate("."+h,"click",function(c){c.preventDefault(),c.stopPropagation(),k.removeClass(g),b.exec(b.fm.selected(),a(this).data("value"))}),b.fm.bind("disable select",l).getUI().click(l),b.change(function(){j.html(""),a.each(b.variants,function(c,d){j.append(a('<div class="'+h+'">'+d[1]+"</div>").data("value",d[0]).addClass(d[0]==b.value?i:""))})})),b.change(function(){b.disabled()?k.removeClass(f+" "+g).addClass(e):(k.removeClass(e),k[b.active()?"addClass":"removeClass"](f))}).change()})},a.fn.elfindercontextmenu=function(b){return this.each(function(){var c=a(this).addClass("ui-helper-reset ui-widget ui-state-default ui-corner-all elfinder-contextmenu elfinder-contextmenu-"+b.direction).hide().appendTo("body").delegate(".elfinder-contextmenu-item","hover",function(){a(this).toggleClass("ui-state-hover")}),d=b.direction=="ltr"?"left":"right",e=a.extend({},b.options.contextmenu),f='<div class="elfinder-contextmenu-item"><span class="elfinder-button-icon {icon} elfinder-contextmenu-icon"/><span>{label}</span></div>',g=function(b,c,d){return a(f.replace("{icon}",c?"elfinder-button-icon-"+c:"").replace("{label}",b)).click(function(a){a.stopPropagation(),a.stopPropagation(),d()})},h=function(e,f){var g=a(window),h=c.outerWidth(),i=c.outerHeight(),j=g.width(),k=g.height(),l=g.scrollTop(),m=g.scrollLeft(),n={top:(f+i<k?f:f-i>0?f-i:f)+l,left:(e+h<j?e:e-h)+m,"z-index":100+b.getUI("workzone").zIndex()};c.css(n).show(),n={"z-index":n["z-index"]+10},n[d]=parseInt(c.width()),c.find(".elfinder-contextmenu-sub").css(n)},i=function(){c.hide().empty()},j=function(d,f){var h=!1;a.each(e[d]||[],function(d,e){var j,k,l;if(e=="|"&&h){c.append('<div class="elfinder-contextmenu-separator"/>'),h=!1;return}j=b.command(e);if(j&&j.getstate(f)!=-1){if(j.variants){if(!j.variants.length)return;k=g(j.title,j.name,function(){}),l=a('<div class="ui-corner-all elfinder-contextmenu-sub"/>').appendTo(k.append('<span class="elfinder-contextmenu-arrow"/>')),k.addClass("elfinder-contextmenu-group").hover(function(){l.toggle()}),a.each(j.variants,function(b,c){l.append(a('<div class="elfinder-contextmenu-item"><span>'+c[1]+"</span></div>").click(function(a){a.stopPropagation(),i(),j.exec(f,c[0])}))})}else k=g(j.title,j.name,function(){i(),j.exec(f)});c.append(k),h=!0}})},k=function(b){a.each(b,function(a,b){var d;b.label&&typeof b.callback=="function"&&(d=g(b.label,b.icon,function(){i(),b.callback()}),c.append(d))})};b.one("load",function(){b.bind("contextmenu",function(a){var b=a.data;i(),b.type&&b.targets?j(b.type,b.targets):b.raw&&k(b.raw),c.children().length&&h(b.x,b.y)}).one("destroy",function(){c.remove()}).bind("disable select",i).getUI().click(i)})})},a.fn.elfindercwd=function(b){return this.not(".elfinder-cwd").each(function(){var c=b.storage("view")=="list",d="undefined",e="select."+b.namespace,f="unselect."+b.namespace,g="disable."+b.namespace,h="enable."+b.namespace,i="class",j=b.res(i,"cwdfile"),k="."+j,l="ui-selected",m=b.res(i,"disabled"),n=b.res(i,"draggable"),o=b.res(i,"droppable"),p=b.res(i,"hover"),q=b.res(i,"adroppable"),r=j+"-tmp",s=b.options.loadTmbs>0?b.options.loadTmbs:5,t="",u={icon:'<div id="{hash}" class="'+j+' {permsclass} {dirclass} ui-corner-all"><div class="elfinder-cwd-file-wrapper ui-corner-all"><div class="elfinder-cwd-icon {mime} ui-corner-all" unselectable="on" {style}/>{marker}</div><div class="elfinder-cwd-filename" title="{name}">{name}</div></div>',row:'<tr id="{hash}" class="'+j+' {permsclass} {dirclass}"><td><div class="elfinder-cwd-file-wrapper"><span class="elfinder-cwd-icon {mime}"/>{marker}<span class="elfinder-cwd-filename">{name}</span></div></td><td>{perms}</td><td>{date}</td><td>{size}</td><td>{kind}</td></tr>'},v=b.res("tpl","perms"),w=b.res("tpl","symlink"),x={permsclass:function(a){return b.perms2class(a)},perms:function(a){return b.formatPermissions(a)},dirclass:function(a){return a.mime=="directory"?"directory":""},mime:function(a){return b.mime2class(a.mime)},size:function(a){return b.formatSize(a.size)},date:function(a){return b.formatDate(a)},kind:function(a){return b.mime2kind(a)},marker:function(a){return(a.alias||a.mime=="symlink-broken"?w:"")+(!a.read||!a.write?v:"")}},y=function(a){return a.name=b.escape(a.name),u[c?"row":"icon"].replace(/\{([a-z]+)\}/g,function(b,c){return x[c]?x[c](a):a[c]?a[c]:""})},z=!1,A=function(b,d){function r(a,b){return a[b+"All"]("[id]:not(."+m+"):first")}var g=a.ui.keyCode,h=b==g.LEFT||b==g.UP,i=S.find("[id]."+l),j=h?"first":"last",k,n,o,p,q;if(i.length){k=i.filter(h?":first":":last"),o=r(k,h?"prev":"next");if(!o.length)n=k;else if(c||b==g.LEFT||b==g.RIGHT)n=o;else{p=k.position().top,q=k.position().left,n=k;if(h){do n=n.prev("[id]");while(n.length&&!(n.position().top<p&&n.position().left<=q));n.is("."+m)&&(n=r(n,"next"))}else{do n=n.next("[id]");while(n.length&&!(n.position().top>p&&n.position().left>=q));n.is("."+m)&&(n=r(n,"prev")),n.length||(o=S.find("[id]:not(."+m+"):last"),o.position().top>p&&(n=o))}}}else n=S.find("[id]:not(."+m+"):"+(h?"last":"first"));n&&n.length&&(d?n=k.add(k[h?"prevUntil":"nextUntil"]("#"+n.attr("id"))).add(n):i.trigger(f),n.trigger(e),F(n.filter(h?":first":":last")),E())},B=function(a){S.find("#"+a).trigger(e)},C=function(){S.find("[id]."+l).trigger(f)},D=function(){return a.map(S.find("[id]."+l),function(b){return b=a(b),b.is("."+m)?null:a(b).attr("id")})},E=function(){b.trigger("select",{selected:D()})},F=function(a){var b=a.position().top,c=a.outerHeight(!0),d=T.scrollTop(),e=T.innerHeight();b+c>d+e?T.scrollTop(parseInt(b+c-e)):b<d&&T.scrollTop(b)},G=[],H=function(a){var b=G.length;while(b--)if(G[b].hash==a)return b;return-1},I="scroll."+b.namespace,J=function(){var d=[],e=!1,f=[],g={},h=S.find("[id]:last"),i=!h.length,j=c?S.children("table").children("tbody"):S,k;if(!G.length)return T.unbind(I);while((!h.length||h.position().top<=T.height()+T.scrollTop()+b.options.showThreshold)&&(k=G.splice(0,b.options.showFiles)).length)d=a.map(k,function(a){return a.hash&&a.name?(a.mime=="directory"&&(e=!0),a.tmb&&(a.tmb===1?f.push(a.hash):g[a.hash]=a.tmb),y(a)):null}),j.append(d.join("")),h=S.find("[id]:last"),i&&S.scrollTop(0);M(g),f.length&&N(f),e&&L()},K=a.extend({},b.droppable,{over:function(c,d){var e=b.cwd().hash;a.each(d.helper.data("files"),function(a,c){if(b.file(c).phash==e)return S.removeClass(q),!1})}}),L=function(){setTimeout(function(){S.find(".directory:not(."+o+",.elfinder-na,.elfinder-ro)").droppable(b.droppable)},20)},M=function(c){var d=b.option("tmbUrl"),e=!0,f;return a.each(c,function(b,c){var g=S.find("#"+b);g.length?function(b,c){a("<img/>").load(function(){b.find(".elfinder-cwd-icon").css("background","url('"+c+"') center center no-repeat")}).attr("src",c)}(g,d+c):(e=!1,(f=H(b))!=-1&&(G[f].tmb=c))}),e},N=function(a){var c=[];if(b.oldAPI){b.request({data:{cmd:"tmb",current:b.cwd().hash},preventFail:!0}).done(function(a){M(a.images||[])&&a.tmb&&N()});return}c=c=a.splice(0,s),c.length&&b.request({data:{cmd:"tmb",targets:c},preventFail:!0}).done(function(b){M(b.images||[])&&N(a)})},O=function(a){var d=c?S.find("tbody"):S,e=a.length,f=[],g={},h=!1,i=function(a){var c=S.find("[id]:first"),d;while(c.length){d=b.file(c.attr("id"));if(d&&b.compare(a,d)<0)return c;c=c.next("[id]")}},j=function(a){var c=G.length,d;for(d=0;d<c;d++)if(b.compare(a,G[d])<0)return d;return c||-1},k,l,m,n;while(e--){k=a[e],l=k.hash;if(S.find("#"+l)
.length)continue;(m=i(k))&&m.length?m.before(y(k)):(n=j(k))>=0?G.splice(n,0,k):d.append(y(k)),S.find("#"+l).length&&(k.mime=="directory"?h=!0:k.tmb&&(k.tmb===1?f.push(l):g[l]=k.tmb))}M(g),f.length&&N(f),h&&L()},P=function(a){var c=a.length,d,e,f;while(c--){d=a[c];if((e=S.find("#"+d)).length)try{e.detach()}catch(g){b.debug("error",g)}else(f=H(d))!=-1&&G.splice(f,1)}},Q={name:b.i18n("name"),perm:b.i18n("perms"),mod:b.i18n("modify"),size:b.i18n("size"),kind:b.i18n("kind")},R=function(d,e){var f=b.cwd().hash;try{S.children("table,"+k).remove().end()}catch(g){S.html("")}S.removeClass("elfinder-cwd-view-icons elfinder-cwd-view-list").addClass("elfinder-cwd-view-"+(c?"list":"icons")),T[c?"addClass":"removeClass"]("elfinder-cwd-wrapper-list"),c&&S.html('<table><thead><tr class="ui-state-default"><td >'+Q.name+"</td><td>"+Q.perm+"</td><td>"+Q.mod+"</td><td>"+Q.size+"</td><td>"+Q.kind+"</td></tr></thead><tbody/></table>"),G=a.map(d,function(a){return e||a.phash==f?a:null}),G=b.sortFiles(G),T.bind(I,J).trigger(I),E()},S=a(this).addClass("ui-helper-clearfix elfinder-cwd").attr("unselectable","on").delegate(k,"click."+b.namespace,function(b){var c=this.id?a(this):a(this).parents("[id]:first"),d=c.prevAll("."+l+":first"),g=c.nextAll("."+l+":first"),h=d.length,i=g.length,j;b.stopImmediatePropagation(),b.shiftKey&&(h||i)?(j=h?c.prevUntil("#"+d.attr("id")):c.nextUntil("#"+g.attr("id")),j.add(c).trigger(e)):b.ctrlKey||b.metaKey?c.trigger(c.is("."+l)?f:e):(S.find("[id]."+l).trigger(f),c.trigger(e)),E()}).delegate(k,"dblclick."+b.namespace,function(a){b.dblclick({file:this.id})}).delegate(k,"mouseenter."+b.namespace,function(d){var e=a(this),f=c?e:e.children();!e.is("."+r)&&!f.is("."+n+",."+m)&&f.draggable(b.draggable)}).delegate(k,e,function(b){var c=a(this);!z&&!c.is("."+m)&&c.addClass(l).children().addClass(p)}).delegate(k,f,function(b){!z&&a(this).removeClass(l).children().removeClass(p)}).delegate(k,g,function(){var b=a(this).removeClass(l).addClass(m),d=(c?b:b.children()).removeClass(p);b.is("."+o)&&b.droppable("disable"),d.is("."+n)&&d.draggable("disable"),!c&&d.removeClass(m)}).delegate(k,h,function(){var b=a(this).removeClass(m),d=c?b:b.children();b.is("."+o)&&b.droppable("enable"),d.is("."+n)&&d.draggable("enable")}).delegate(k,"scrolltoview",function(){F(a(this))}).delegate(k,"hover",function(c){b.trigger("hover",{hash:a(this).attr("id"),type:c.type})}).bind("contextmenu."+b.namespace,function(c){var d=a(c.target).closest("."+j);d.length&&(c.stopPropagation(),c.preventDefault(),d.is("."+m)||(d.is("."+l)||(S.trigger("unselectall"),d.trigger(e),E()),b.trigger("contextmenu",{type:"files",targets:b.selected(),x:c.clientX,y:c.clientY})))}).selectable({filter:k,stop:E,selected:function(b,c){a(c.selected).trigger(e)},unselected:function(b,c){a(c.unselected).trigger(f)}}).droppable(K).bind("create."+b.namespace,function(b,d){var e=c?S.find("tbody"):S;S.trigger("unselectall"),e.prepend(a(y(d)).addClass(r)),S.scrollTop(0)}).bind("unselectall",function(){S.find("[id]."+l+"").trigger(f),E()}).bind("selectfile",function(a,b){S.find("#"+b).trigger(e),E()}),T=a('<div class="elfinder-cwd-wrapper"/>').bind("contextmenu",function(a){a.preventDefault(),b.trigger("contextmenu",{type:"cwd",targets:[b.cwd().hash],x:a.clientX,y:a.clientY})}),U=function(){var b=0;T.siblings(".elfinder-panel:visible").each(function(){b+=a(this).outerHeight(!0)}),T.height(W.height()-b)},V=a(this).parent().resize(U),W=V.children(".elfinder-workzone").append(T.append(this));b.dragUpload&&(T[0].addEventListener("dragenter",function(a){a.preventDefault(),a.stopPropagation(),T.addClass(q)},!1),T[0].addEventListener("dragleave",function(a){a.preventDefault(),a.stopPropagation(),a.target==S[0]&&T.removeClass(q)},!1),T[0].addEventListener("dragover",function(a){a.preventDefault(),a.stopPropagation()},!1),T[0].addEventListener("drop",function(a){a.preventDefault(),T.removeClass(q),a.dataTransfer&&a.dataTransfer.files&&a.dataTransfer.files.length&&b.exec("upload",{files:a.dataTransfer.files})},!1)),b.bind("open search",function(a){R(a.data.files,a.type=="search")}).bind("searchend sortchange",function(){t&&R(b.files())}).bind("searchstart",function(a){t=a.data.query}).bind("searchend",function(){t=""}).bind("viewchange",function(){var d=b.selected(),e=b.storage("view")=="list";e!=c&&(c=e,R(b.files()),a.each(d,function(a,b){B(b)}),E()),U()}).add(function(c){var d=b.cwd().hash,e=t?a.map(c.data.added||[],function(a){return a.name.indexOf(t)===-1?null:a}):a.map(c.data.added||[],function(a){return a.phash==d?a:null});O(e)}).change(function(c){var d=b.cwd().hash,e=b.selected(),f;t?a.each(c.data.changed||[],function(b,c){P([c.hash]),c.name.indexOf(t)!==-1&&(O([c]),a.inArray(c.hash,e)!==-1&&B(c.hash))}):a.each(a.map(c.data.changed||[],function(a){return a.phash==d?a:null}),function(b,c){P([c.hash]),O([c]),a.inArray(c.hash,e)!==-1&&B(c.hash)}),E()}).remove(function(a){P(a.data.removed||[]),E()}).bind("open add search searchend",function(){S.css("height","auto"),S.outerHeight(!0)<T.height()&&S.height(T.height()-(S.outerHeight(!0)-S.height())-2)}).dragstart(function(b){var c=a(b.data.target),d=b.data.originalEvent;c.is(k)&&(c.is("."+l)||(!(d.ctrlKey||d.metaKey||d.shiftKey)&&C(),c.trigger(e),E()),S.droppable("disable")),S.selectable("disable").removeClass(m),z=!0}).dragstop(function(){S.selectable("enable"),z=!1}).bind("lockfiles unlockfiles",function(a){var b=a.type=="lockfiles"?g:h,c=a.data.files||[],d=c.length;while(d--)S.find("#"+c[d]).trigger(b);E()}).bind("mkdir mkfile duplicate upload rename archive extract",function(c){var d=b.cwd().hash,e;S.trigger("unselectall"),a.each(c.data.added||[],function(a,b){b&&b.phash==d&&B(b.hash)}),E()}).shortcut({pattern:"ctrl+a",description:"selectall",callback:function(){var c=[],d;S.find("[id]:not(."+l+")").trigger(e),G.length?(d=b.cwd().hash,b.select({selected:a.map(b.files(),function(a){return a.phash==d?a.hash:null})})):E()}}).shortcut({pattern:"left right up down shift+left shift+right shift+up shift+down",description:"selectfiles",type:"keydown",callback:function(a){A(a.keyCode,a.shiftKey)}}).shortcut({pattern:"home",description:"selectffile",callback:function(a){C(),F(S.find("[id]:first").trigger(e)),E()}}).shortcut({pattern:"end",description:"selectlfile",callback:function(a){C(),F(S.find("[id]:last").trigger(e)),E()}})}),this},a.fn.elfinderdialog=function(b){var c;return typeof b=="string"&&(c=this.closest(".ui-dialog")).length&&(b=="open"&&c.is(":hidden")?c.fadeIn(120,function(){c.trigger("open")}):b=="close"&&c.is(":visible")?c.hide().trigger("close"):b=="destroy"?c.hide().remove():b=="toTop"&&c.trigger("totop")),b=a.extend({},a.fn.elfinderdialog.defaults,b),this.filter(":not(.ui-dialog-content)").each(function(){var c=a(this).addClass("ui-dialog-content ui-widget-content"),d=c.parent(),e="elfinder-dialog-active",f="elfinder-dialog",g="elfinder-dialog-notify",h="ui-state-hover",i=parseInt(Math.random()*1e6),j=d.children(".elfinder-overlay"),k=a('<div class="ui-dialog-buttonset"/>'),l=a('<div class=" ui-helper-clearfix ui-dialog-buttonpane ui-widget-content"/>').append(k),m=a('<div class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-draggable std42-dialog  '+f+" "+b.cssClass+'"/>').hide().append(c).appendTo(d).draggable({handle:".ui-dialog-titlebar",containment:a("body")}).css({width:b.width,height:b.height}).mousedown(function(b){b.stopPropagation(),a(document).mousedown(),m.is("."+e)||(d.find("."+f+":visible").removeClass(e),m.addClass(e).zIndex(n()+1))}).bind("open",function(){b.modal&&j.elfinderoverlay("show"),m.trigger("totop"),typeof b.open=="function"&&a.proxy(b.open,c[0])(),m.is("."+g)||d.find("."+f+":visible").not("."+g).each(function(){var b=a(this),c=parseInt(b.css("top")),d=parseInt(b.css("left")),e=parseInt(m.css("top")),f=parseInt(m.css("left"));b[0]!=m[0]&&(c==e||d==f)&&m.css({top:c+10+"px",left:d+10+"px"})})}).bind("close",function(){var e=d.find(".elfinder-dialog:visible"),f=n();b.modal&&j.elfinderoverlay("hide"),e.length?e.each(function(){var b=a(this);if(b.zIndex()>=f)return b.trigger("totop"),!1}):setTimeout(function(){d.mousedown().click()},10),typeof b.close=="function"?a.proxy(b.close,c[0])():b.destroyOnClose&&m.hide().remove()
}).bind("totop",function(){a(this).mousedown().find(".ui-button:first").focus().end().find(":text:first").focus()}),n=function(){var b=d.zIndex()+10;return d.find("."+f+":visible").each(function(){var c;this!=m[0]&&(c=a(this).zIndex(),c>b&&(b=c))}),b},o;b.position||(o=parseInt((d.height()-m.outerHeight())/2-42),b.position={top:(o>0?o:0)+"px",left:parseInt((d.width()-m.outerWidth())/2)+"px"}),m.css(b.position),b.closeOnEscape&&a(document).bind("keyup."+i,function(b){b.keyCode==a.ui.keyCode.ESCAPE&&m.is("."+e)&&(c.elfinderdialog("close"),a(document).unbind("keyup."+i))}),m.prepend(a('<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">'+b.title+"</div>").prepend(a('<a href="#" class="ui-dialog-titlebar-close ui-corner-all"><span class="ui-icon ui-icon-closethick"/></a>').mousedown(function(a){a.preventDefault(),c.elfinderdialog("close")}))),a.each(b.buttons,function(b,d){var e=a('<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">'+b+"</span></button>").click(a.proxy(d,c[0])).hover(function(b){a(this)[b.type=="mouseenter"?"focus":"blur"]()}).focus(function(){a(this).addClass(h)}).blur(function(){a(this).removeClass(h)}).keydown(function(b){var c;b.keyCode==a.ui.keyCode.ENTER?a(this).click():b.keyCode==a.ui.keyCode.TAB&&(c=a(this).next(".ui-button"),c.length?c.focus():a(this).parent().children(".ui-button:first").focus())});k.append(e)}),k.children().length&&m.append(l),b.resizable&&a.fn.resizable&&m.resizable({minWidth:b.minWidth,minHeight:b.minHeight,alsoResize:this}),typeof b.create=="function"&&a.proxy(b.create,this)(),b.autoOpen&&c.elfinderdialog("open")}),this},a.fn.elfinderdialog.defaults={cssClass:"",title:"",modal:!1,resizable:!0,autoOpen:!0,closeOnEscape:!0,destroyOnClose:!1,buttons:{},position:null,width:320,height:"auto",minWidth:200,minHeight:110},a.fn.elfindernavbar=function(b,c){return this.not(".elfinder-navbar").each(function(){var d=a(this).addClass("ui-state-default elfinder-navbar"),e=d.parent().resize(function(){d.height(f.height()-g)}),f=e.children(".elfinder-workzone").append(d),g=d.outerHeight()-d.height(),h=b.direction=="ltr",i;a.fn.resizable&&(i=d.resizable({handles:h?"e":"w",minWidth:c.minWidth||150,maxWidth:c.maxWidth||500}).bind("resize scroll",function(){i.css({top:parseInt(d.scrollTop())+"px",left:parseInt(h?d.width()+d.scrollLeft()-i.width()-2:d.scrollLeft()+2)})}).find(".ui-resizable-handle").zIndex(d.zIndex()+10),h||d.resize(function(){d.css("left",null).css("right",0)}),b.one("open",function(){setTimeout(function(){d.trigger("resize")},150)}))}),this},a.fn.elfinderoverlay=function(b){this.filter(":not(.elfinder-overlay)").each(function(){b=a.extend({},b),a(this).addClass("ui-widget-overlay elfinder-overlay").hide().mousedown(function(a){a.preventDefault(),a.stopPropagation()}).data({cnt:0,show:typeof b.show=="function"?b.show:function(){},hide:typeof b.hide=="function"?b.hide:function(){}})});if(b=="show"){var c=this.eq(0),d=c.data("cnt")+1,e=c.data("show");c.data("cnt",d),c.is(":hidden")&&(c.zIndex(c.parent().zIndex()+1),c.show(),e())}if(b=="hide"){var c=this.eq(0),d=c.data("cnt")-1,f=c.data("hide");c.data("cnt",d),d==0&&c.is(":visible")&&(c.hide(),f())}return this},a.fn.elfinderpanel=function(b){return this.each(function(){var c=a(this).addClass("elfinder-panel ui-state-default ui-corner-all"),d="margin-"+(b.direction=="ltr"?"left":"right");b.one("load",function(a){var e=b.getUI("navbar");c.css(d,parseInt(e.outerWidth(!0))),e.bind("resize",function(){c.is(":visible")&&c.css(d,parseInt(e.outerWidth(!0)))})})})},a.fn.elfinderpath=function(b){return this.each(function(){var c=a(this).addClass("elfinder-path").html("&nbsp;").delegate("a","click",function(c){var d=a(this).attr("href").substr(1);c.preventDefault(),d!=b.cwd().hash&&b.exec("open",d)}).prependTo(b.getUI("statusbar").show());b.bind("open searchend",function(){var d=[];a.each(b.parents(b.cwd().hash),function(a,c){d.push('<a href="#'+c+'">'+b.escape(b.file(c).name)+"</a>")}),c.html(d.join(b.option("separator")))}).bind("search",function(){c.html(b.i18n("searcresult"))})})},a.fn.elfinderplaces=function(b,c){return this.each(function(){var d=[],e="class",f=b.res(e,"navdir"),g=b.res(e,"navcollapse"),h=b.res(e,"navexpand"),i=b.res(e,"hover"),j=b.res(e,"treeroot"),k=b.res("tpl","navdir"),l=b.res("tpl","perms"),m=a(b.res("tpl","navspinner")),n=function(a){return a.substr(6)},o=function(a){return"place-"+a},p=function(){b.storage("places",d.join(","))},q=function(c){return a(k.replace(/\{id\}/,o(c.hash)).replace(/\{name\}/,b.escape(c.name)).replace(/\{cssclass\}/,b.perms2class(c)).replace(/\{permissions\}/,!c.read||!c.write?l:"").replace(/\{symlink\}/,""))},r=function(c){var e=q(c);w.children().length&&a.each(w.children(),function(){var b=a(this);if(c.name.localeCompare(b.children("."+f).text())<0)return!e.insertBefore(b)}),d.push(c.hash),!e.parent().length&&w.append(e),v.addClass(g),e.draggable({appendTo:"body",revert:!1,helper:function(){var c=a(this);return c.children().removeClass("ui-state-hover"),a('<div class="elfinder-place-drag elfinder-'+b.direction+'"/>').append(c.clone()).data("hash",n(c.children(":first").attr("id")))},start:function(){a(this).hide()},stop:function(b,c){var d=x.offset().top,e=x.offset().left,f=x.width(),g=x.height(),h=b.clientX,i=b.clientY;h>e&&h<e+f&&i>d&&i<i+g?a(this).show():(s(c.helper.data("hash")),p())}})},s=function(b){var c=a.inArray(b,d);c!==-1&&(d.splice(c,1),w.find("#"+o(b)).parent().remove(),!w.children().length&&v.removeClass(g+" "+h))},t=function(){w.empty(),v.removeClass(g+" "+h)},u=q({hash:"root-"+b.namespace,name:b.i18n(c.name,"places"),read:!0,write:!0}),v=u.children("."+f).addClass(j).click(function(){v.is("."+g)&&(x.toggleClass(h),w.slideToggle(),b.storage("placesState",x.is("."+h)?1:0))}),w=u.children("."+b.res(e,"navsubtree")),x=a(this).addClass(b.res(e,"tree")+" elfinder-places ui-corner-all").hide().append(u).appendTo(b.getUI("navbar")).delegate("."+f,"hover",function(){a(this).toggleClass("ui-state-hover")}).delegate("."+f,"click",function(c){b.exec("open",a(this).attr("id").substr(6))}).delegate("."+f+":not(."+j+")","contextmenu",function(c){var d=a(this).attr("id").substr(6);c.preventDefault(),b.trigger("contextmenu",{raw:[{label:b.i18n("rmFromPlaces"),icon:"rm",callback:function(){s(d),p()}}],x:c.clientX,y:c.clientY})}).droppable({tolerance:"pointer",accept:".elfinder-cwd-file-wrapper,.elfinder-tree-dir,.elfinder-cwd-file",hoverClass:b.res("class","adroppable"),drop:function(c,e){var f=!0;a.each(e.helper.data("files"),function(c,e){var g=b.file(e);g&&g.mime=="directory"&&a.inArray(g.hash,d)===-1?r(g):f=!1}),p(),f&&e.helper.hide()}});b.one("load",function(){if(b.oldAPI)return;x.show().parent().show(),d=a.map(b.storage("places").split(","),function(a){return a||null}),d.length&&(v.prepend(m),b.request({data:{cmd:"info",targets:d},preventDefault:!0}).done(function(c){d=[],a.each(c.files,function(a,b){b.mime=="directory"&&r(b)}),p(),b.storage("placesState")>0&&v.click()}).always(function(){m.remove()})),b.remove(function(b){a.each(b.data.removed,function(a,b){s(b)}),p()}).change(function(b){a.each(b.data.changed,function(b,c){a.inArray(c.hash,d)!==-1&&(s(c.hash),c.mime=="directory"&&r(c))}),p()}).bind("sync",function(){d.length&&(v.prepend(m),b.request({data:{cmd:"info",targets:d},preventDefault:!0}).done(function(b){a.each(b.files||[],function(b,c){a.inArray(c.hash,d)===-1&&s(c.hash)}),p()}).always(function(){m.remove()}))})})})},a.fn.elfindersearchbutton=function(b){return this.each(function(){var c=!1,d=a(this).hide().addClass("ui-widget-content elfinder-button "+b.fm.res("class","searchbtn")+""),e=function(){b.exec(a.trim(g.val())).done(function(){c=!0,g.focus()})},f=function(){g.val(""),c&&(c=!1,b.fm.trigger("searchend"))},g=a('<input type="text" size="42"/>').appendTo(d).keypress(function(a){a.stopPropagation()}).keydown(function(a){a.stopPropagation(),a.keyCode==13&&e(),a.keyCode==27&&(a.preventDefault(),f())});a('<span class="ui-icon ui-icon-search" title="'+b.title+'"/>').appendTo(d).click(e),a('<span class="ui-icon ui-icon-close"/>').appendTo(d).click(f),setTimeout(function(){d.parent().
detach(),b.fm.getUI("toolbar").prepend(d.show());if(a.browser.msie){var c=d.children(b.fm.direction=="ltr"?".ui-icon-close":".ui-icon-search");c.css({right:"",left:parseInt(d.width())-c.outerWidth(!0)})}},200),b.fm.error(function(){g.unbind("keydown")}).select(function(){g.blur()}).bind("searchend",function(){g.val("")}).viewchange(f).shortcut({pattern:"ctrl+f f3",description:b.title,callback:function(){g.select().focus()}})})},a.fn.elfindersortbutton=function(b){return this.each(function(){var c="class",d=b.fm,e=d.res(c,"disabled"),f=d.res(c,"active"),g=d.res(c,"hover"),h="elfinder-button-menu-item",i="elfinder-button-menu-item-selected",j,k=a(this).addClass("ui-state-default elfinder-button elfiner-button-"+b.name).attr("title",b.title).append('<span class="elfinder-button-icon elfinder-button-icon-'+b.name+'"/>').hover(function(a){!k.is("."+e)&&k.toggleClass(g)}).click(function(a){k.is("."+e)||(j&&b.variants.length>1?(j.is(":hidden")&&b.fm.getUI().click(),a.stopPropagation(),j.slideToggle(100)):b.exec())}),l=function(){j.hide()};a.isArray(b.variants)&&(k.addClass("elfinder-menubutton"),j=a('<div class="ui-widget ui-widget-content elfinder-button-menu ui-corner-all"/>').hide().appendTo(k).zIndex(10+k.zIndex()).delegate("."+h,"hover",function(){a(this).toggleClass(g)}).delegate("."+h,"click",function(c){c.preventDefault(),c.stopPropagation(),k.removeClass(g),b.exec(b.fm.selected(),a(this).data("value"))}),b.fm.bind("disable select",l).getUI().click(l),b.change(function(){j.html(""),a.each(b.variants,function(c,d){j.append(a('<div class="'+h+" "+(d[0]==b.value?i:"")+" elfinder-menu-item-sort-"+b.fm.sortDirect+'"><span class="elfinder-menu-item-sort-dir"/>'+d[1]+"</div>").data("value",d[0]))})})),b.change(function(){b.disabled()?k.removeClass(f+" "+g).addClass(e):(k.removeClass(e),k[b.active()?"addClass":"removeClass"](f))}).change()})},a.fn.elfinderstat=function(b){return this.each(function(){var c=a(this).addClass("elfinder-stat-size"),d=a('<div class="elfinder-stat-selected"/>'),e=b.i18n("size").toLowerCase(),f=b.i18n("items").toLowerCase(),g=b.i18n("selected"),h=function(d,g){var h=0,i=0;a.each(d,function(a,b){if(!g||b.phash==g)h++,i+=parseInt(b.size)||0}),c.html(f+": "+h+", "+e+": "+b.formatSize(i))};b.getUI("statusbar").prepend(c).append(d).show(),b.bind("open reload add remove change searchend",function(){h(b.files(),b.cwd().hash)}).search(function(a){h(a.data.files)}).select(function(){var c=0,f=0,h=b.selectedFiles();if(h.length==1){c=h[0].size,d.html(b.escape(h[0].name)+(c>0?", "+b.formatSize(c):""));return}a.each(h,function(a,b){f++,c+=parseInt(b.size)||0}),d.html(f?g+": "+f+", "+e+": "+b.formatSize(c):"&nbsp;")})})},a.fn.elfindertoolbar=function(b,c){return this.not(".elfinder-toolbar").each(function(){var d=b._commands,e=a(this).addClass("ui-helper-clearfix ui-widget-header ui-corner-top elfinder-toolbar"),f=c||[],g=f.length,h,i,j,k;e.prev().length&&e.parent().prepend(this);while(g--)if(f[g]){j=a('<div class="ui-widget-content ui-corner-all elfinder-buttonset"/>'),h=f[g].length;while(h--)if(i=d[f[g][h]])k="elfinder"+i.options.ui,a.fn[k]&&j.prepend(a("<div/>")[k](i));j.children().length&&e.prepend(j),j.children(":not(:last),:not(:first):not(:last)").after('<span class="ui-widget-content elfinder-toolbar-button-separator"/>')}e.children().length&&e.show()}),this},a.fn.elfindertree=function(b,c){var d=b.res("class","tree");return this.not("."+d).each(function(){var e="class",f=b.res(e,"treeroot"),g=c.openRootOnLoad,h=b.res(e,"navsubtree"),i=b.res(e,"treedir"),j=b.res(e,"navcollapse"),k=b.res(e,"navexpand"),l="elfinder-subtree-loaded",m=b.res(e,"navarrow"),n=b.res(e,"active"),o=b.res(e,"adroppable"),p=b.res(e,"hover"),q=b.res(e,"disabled"),r=b.res(e,"draggable"),s=b.res(e,"droppable"),t=a.extend({},b.droppable,{hoverClass:p+" "+o,over:function(){var b=a(this);b.is("."+j+":not(."+k+")")&&setTimeout(function(){b.is("."+o)&&b.children("."+m).click()},500)}}),u=a(b.res("tpl","navspinner")),v=b.res("tpl","navdir"),w=b.res("tpl","perms"),x=b.res("tpl","symlink"),y={id:function(a){return b.navHash2Id(a.hash)},cssclass:function(a){return(a.phash?"":f)+" "+i+" "+b.perms2class(a)+" "+(a.dirs&&!a.link?j:"")},permissions:function(a){return!a.read||!a.write?w:""},symlink:function(a){return a.alias?x:""}},z=function(a){return a.name=b.escape(a.name),v.replace(/(?:\{([a-z]+)\})/ig,function(b,c){return a[c]||(y[c]?y[c](a):"")})},A=function(b){return a.map(b||[],function(a){return a.mime=="directory"?a:null})},B=function(a){return a?H.find("#"+b.navHash2Id(a)).next("."+h):H},C=function(c,d){var e=c.children(":first"),f;while(e.length){if((f=b.file(b.navId2Hash(e.children("[id]").attr("id"))))&&d.name.localeCompare(f.name)<0)return e;e=e.next()}return a("")},D=function(a){var c=a.length,d=[],e,f,g,h,i;for(e=0;e<c;e++){f=a[e];if(H.find("#"+b.navHash2Id(f.hash)).length)continue;(h=B(f.phash)).length?(g=z(f),f.phash&&(i=C(h,f)).length?i.before(g):h.append(g)):d.push(f)}if(d.length&&d.length<c)return D(d);F()},E=function(){var a=b.cwd().hash,d=H.find("#"+b.navHash2Id(a)),e;g&&(e=H.find("#"+b.navHash2Id(b.root())),e.is("."+l)&&e.addClass(k).next("."+h).show(),g=!1),d.is("."+n)||(H.find("."+i+"."+n).removeClass(n),d.addClass(n)),c.syncTree&&(d.length?d.parentsUntil("."+f).filter("."+h).show().prev("."+i).addClass(k):b.newAPI&&b.request({data:{cmd:"parents",target:a},preventFail:!0}).done(function(c){var d=A(c.tree);D(d),G(d,l),a==b.cwd().hash&&E()}))},F=function(){H.find("."+i+":not(."+s+",.elfinder-ro,.elfinder-na)").droppable(t)},G=function(c,d){var e=d==l?"."+j+":not(."+l+")":":not(."+j+")";a.each(c,function(c,f){H.find("#"+b.navHash2Id(f.phash)+e).filter(function(){return a(this).next("."+h).children().length>0}).addClass(d)})},H=a(this).addClass(d).delegate("."+i,"hover",function(c){var d=a(this),e=c.type=="mouseenter";d.is("."+o+" ,."+q)||(e&&!d.is("."+f+",."+r+",.elfinder-na,.elfinder-wo")&&d.draggable(b.draggable),d.toggleClass(p,e))}).delegate("."+i,"dropover dropout drop",function(b){a(this)[b.type=="dropover"?"addClass":"removeClass"](o+" "+p)}).delegate("."+i,"click",function(c){var d=a(this),e=b.navId2Hash(d.attr("id")),f=b.file(e);b.trigger("searchend"),e!=b.cwd().hash&&!d.is("."+q)?b.exec("open",f.thash||e):d.is("."+j)&&d.children("."+m).click()}).delegate("."+i+"."+j+" ."+m,"click",function(c){var d=a(this),e=d.parent("."+i),f=e.next("."+h);c.stopPropagation(),e.is("."+l)?(e.toggleClass(k),f.slideToggle()):(u.insertBefore(d),e.removeClass(j),b.request({cmd:"tree",target:b.navId2Hash(e.attr("id"))}).done(function(a){D(A(a.tree)),f.children().length&&(e.addClass(j+" "+k),f.slideDown()),E()}).always(function(a){u.remove(),e.addClass(l)}))}).delegate("."+i,"contextmenu",function(c){c.preventDefault(),b.trigger("contextmenu",{type:"navbar",targets:[b.navId2Hash(a(this).attr("id"))],x:c.clientX,y:c.clientY})});H.parent().find(".elfinder-navbar").append(H).show(),b.open(function(a){var b=a.data,c=A(b.files);b.init&&H.empty(),c.length&&(D(c),G(c,l)),E()}).add(function(a){var b=A(a.data.added);b.length&&(D(b),G(b,j))}).change(function(c){var d=A(c.data.changed),e=d.length,f,g,j,m,n,o,p,q,r;while(e--){f=d[e];if((g=H.find("#"+b.navHash2Id(f.hash))).length){if(f.phash){m=g.closest("."+h),n=B(f.phash),o=g.parent().next(),p=C(n,f);if(!n.length)continue;if(n[0]!==m[0]||o.get(0)!==p.get(0))p.length?p.before(g):n.append(g)}q=g.is("."+k),r=g.is("."+l),j=a(z(f)),g.replaceWith(j.children("."+i)),f.dirs&&(q||r)&&(g=H.find("#"+b.navHash2Id(f.hash)))&&g.next("."+h).children().length&&(q&&g.addClass(k),r&&g.addClass(l))}}E(),F()}).remove(function(a){var c=a.data.removed,d=c.length,e,f;while(d--)(e=H.find("#"+b.navHash2Id(c[d]))).length&&(f=e.closest("."+h),e.parent().detach(),f.children().length||f.hide().prev("."+i).removeClass(j+" "+k+" "+l))}).bind("search searchend",function(a){H.find("#"+b.navHash2Id(b.cwd().hash))[a.type=="search"?"removeClass":"addClass"](n)}).bind("lockfiles unlockfiles",function(c){var d=c.type=="lockfiles",e=d?"disable":"enable",f=a.map(c.data.files||[],function(a){var c=b.file(a);return c&&c.mime=="directory"?a:null});a.each(f,function(a,c){var f=H.find("#"+b.navHash2Id(c));f.length&&(f.is("."+r)&&f.draggable(e),f.is("."+s)&&f.droppable
(n),f[d?"addClass":"removeClass"](q))})})}),this},a.fn.elfinderuploadbutton=function(b){return this.each(function(){var c=a(this).elfinderbutton(b).unbind("click"),d=a("<form/>").appendTo(c),e=a('<input type="file" multiple="true"/>').change(function(){var c=a(this);c.val()&&(b.exec({input:c.remove()[0]}),e.clone(!0).appendTo(d))});d.append(e.clone(!0)),b.change(function(){d[b.disabled()?"hide":"show"]()}).change()})},a.fn.elfinderviewbutton=function(b){return this.each(function(){var c=a(this).elfinderbutton(b),d=c.children(".elfinder-button-icon");b.change(function(){var a=b.value=="icons";d.toggleClass("elfinder-button-icon-view-list",a),c.attr("title",b.fm.i18n(a?"viewlist":"viewicons"))})})},a.fn.elfinderworkzone=function(b){var c="elfinder-workzone";return this.not("."+c).each(function(){var b=a(this).addClass(c),d=b.outerHeight(!0)-b.height(),e=b.parent();e.add(window).bind("resize",function(){var f=e.height();e.children(":visible:not(."+c+")").each(function(){var b=a(this);b.css("position")!="absolute"&&(f-=b.outerHeight(!0))}),b.height(f-d)})}),this},elFinder.prototype.commands.archive=function(){var b=this,c=b.fm,d=[];this.variants=[],this.disableOnSearch=!0,c.bind("open reload",function(){b.variants=[],a.each(d=c.option("archivers").create||[],function(a,d){b.variants.push([d,c.mime2kind(d)])}),b.change()}),this.getstate=function(){return!this._disabled&&d.length&&c.selected().length&&c.cwd().write?0:-1},this.exec=function(b,e){var f=this.files(b),g=f.length,h=e||d[0],i=c.cwd(),j=["errArchive","errPerm"],k=a.Deferred().fail(function(a){a&&c.error(a)}),l;if(!(this.enabled()&&g&&d.length&&a.inArray(h,d)!==-1))return k.reject();if(!i.write)return k.reject(j);for(l=0;l<g;l++)if(!f[l].read)return k.reject(j);return c.request({data:{cmd:"archive",targets:this.hashes(b),type:h},notify:{type:"archive",cnt:1},syncOnFail:!0})}},elFinder.prototype.commands.back=function(){this.alwaysEnabled=!0,this.updateOnSelect=!1,this.shortcuts=[{pattern:"ctrl+left backspace"}],this.getstate=function(){return this.fm.history.canBack()?0:-1},this.exec=function(){return this.fm.history.back()}},elFinder.prototype.commands.copy=function(){this.shortcuts=[{pattern:"ctrl+c ctrl+insert"}],this.getstate=function(b){var b=this.files(b),c=b.length;return c&&a.map(b,function(a){return a.phash&&a.read?a:null}).length==c?0:-1},this.exec=function(b){var c=this.fm,d=a.Deferred().fail(function(a){c.error(a)});return a.each(this.files(b),function(a,b){if(!b.read||!b.phash)return!d.reject(["errCopy",b.name,"errPerm"])}),d.isRejected()?d:d.resolve(c.clipboard(this.hashes(b)))}},elFinder.prototype.commands.cut=function(){this.shortcuts=[{pattern:"ctrl+x shift+insert"}],this.getstate=function(b){var b=this.files(b),c=b.length;return c&&a.map(b,function(a){return a.phash&&a.read&&!a.locked?a:null}).length==c?0:-1},this.exec=function(b){var c=this.fm,d=a.Deferred().fail(function(a){c.error(a)});return a.each(this.files(b),function(a,b){if(!b.read||!b.phash)return!d.reject(["errCopy",b.name,"errPerm"]);if(b.locked)return!d.reject(["errLocked",b.name])}),d.isRejected()?d:d.resolve(c.clipboard(this.hashes(b),!0))}},elFinder.prototype.commands.download=function(){var b=this,c=this.fm,d=function(c){return a.map(b.files(c),function(a){return a.mime=="directory"?null:a})};this.shortcuts=[{pattern:"shift+enter"}],this.getstate=function(){var b=this.fm.selected(),c=b.length;return!this._disabled&&c&&(!a.browser.msie||c==1)&&c==d(b).length?0:-1},this.exec=function(b){var c=this.fm,e=c.options.url,f=d(b),g=a.Deferred(),h="",i="",j,k;if(this.disabled())return g.reject();if(c.oldAPI)return c.error("errCmdNoSupport"),g.reject();a.each(c.options.customData||{},function(a,b){i+="&"+a+"="+b}),e+=e.indexOf("?")===-1?"?":"&";for(j=0;j<f.length;j++)h+='<iframe class="downloader" id="downloader-'+f[j].hash+'" style="display:none" src="'+e+"cmd=file&target="+f[j].hash+"&download=1"+i+'"/>';return a(h).appendTo("body").ready(function(){setTimeout(function(){a(h).each(function(){a("#"+a(this).attr("id")).remove()})},a.browser.mozilla?2e4+1e4*j:1e3)}),c.trigger("download",{files:f}),g.resolve(b)}},elFinder.prototype.commands.duplicate=function(){var b=this.fm;this.getstate=function(c){var c=this.files(c),d=c.length;return!this._disabled&&d&&b.cwd().write&&a.map(c,function(a){return a.phash&&a.read?a:null}).length==d?0:-1},this.exec=function(b){var c=this.fm,d=this.files(b),e=d.length,f=a.Deferred().fail(function(a){a&&c.error(a)}),g=[];return!e||this._disabled?f.reject():(a.each(d,function(a,b){if(!b.read||!c.file(b.phash).write)return!f.reject(["errCopy",b.name,"errPerm"])}),f.isRejected()?f:c.request({data:{cmd:"duplicate",targets:this.hashes(b)},notify:{type:"copy",cnt:e}}))}},elFinder.prototype.commands.edit=function(){var b=this,c=this.fm,d=c.res("mimes","text")||[],e=function(c){return a.map(c,function(c){return(c.mime.indexOf("text/")===0||a.inArray(c.mime,d)!==-1)&&c.mime.indexOf("text/rtf")&&(!b.onlyMimes.length||a.inArray(c.mime,b.onlyMimes)!==-1)&&c.read&&c.write?c:null})},f=function(d,e,f){var g=a.Deferred(),h=a('<textarea class="elfinder-file-edit" rows="20" id="'+d+'-ta">'+c.escape(f)+"</textarea>"),i=function(){h.editor&&h.editor.save(h[0],h.editor.instance),g.resolve(h.getContent()),h.elfinderdialog("close")},j=function(){g.reject(),h.elfinderdialog("close")},k={title:e.name,width:b.options.dialogWidth||450,buttons:{},close:function(){h.editor&&h.editor.close(h[0],h.editor.instance),a(this).elfinderdialog("destroy")},open:function(){c.disable(),h.focus(),h[0].setSelectionRange&&h[0].setSelectionRange(0,0),h.editor&&h.editor.load(h[0])}};return h.getContent=function(){return h.val()},a.each(b.options.editors||[],function(b,c){if(a.inArray(e.mime,c.mimes||[])!==-1&&typeof c.load=="function"&&typeof c.save=="function")return h.editor={load:c.load,save:c.save,close:typeof c.close=="function"?c.close:function(){},instance:null},!1}),h.editor||h.keydown(function(a){var b=a.keyCode,c,d;a.stopPropagation(),b==9&&(a.preventDefault(),this.setSelectionRange&&(c=this.value,d=this.selectionStart,this.value=c.substr(0,d)+"	"+c.substr(this.selectionEnd),d+=1,this.setSelectionRange(d,d)));if(a.ctrlKey||a.metaKey){if(b==81||b==87)a.preventDefault(),j();b==83&&(a.preventDefault(),i())}}),k.buttons[c.i18n("Save")]=i,k.buttons[c.i18n("Cancel")]=j,c.dialog(h,k).attr("id",d),g.promise()},g=function(b){var d=b.hash,e=c.options,g=a.Deferred(),h={cmd:"file",target:d},i=c.url(d)||c.options.url,j="edit-"+c.namespace+"-"+b.hash,k=c.getUI().find("#"+j),l;return k.length?(k.elfinderdialog("toTop"),g.resolve()):!b.read||!b.write?(l=["errOpen",b.name,"errPerm"],c.error(l),g.reject(l)):(c.request({data:{cmd:"get",target:d},notify:{type:"openfile",cnt:1},syncOnFail:!0}).done(function(a){f(j,b,a.content).done(function(a){c.request({options:{type:"post"},data:{cmd:"put",target:d,content:a},notify:{type:"save",cnt:1},syncOnFail:!0}).fail(function(a){g.reject(a)}).done(function(a){a.changed&&a.changed.length&&c.change(a),g.resolve(a)})})}).fail(function(a){g.reject(a)}),g.promise())};this.shortcuts=[{pattern:"ctrl+e"}],this.init=function(){this.onlyMimes=this.options.mimes||[]},this.getstate=function(a){var a=this.files(a),b=a.length;return!this._disabled&&b&&e(a).length==b?0:-1},this.exec=function(b){var c=e(this.files(b)),d=[],f;if(this.disabled())return a.Deferred().reject();while(f=c.shift())d.push(g(f));return d.length?a.when.apply(null,d):a.Deferred().reject()}},elFinder.prototype.commands.extract=function(){var b=this,c=b.fm,d=[],e=function(b){return a.map(b,function(b){return b.read&&a.inArray(b.mime,d)!==-1?b:null})};this.disableOnSearch=!0,c.bind("open reload",function(){d=c.option("archivers").extract||[],b.change()}),this.getstate=function(a){var a=this.files(a),b=a.length;return!this._disabled&&b&&e(a).length==b?0:-1},this.exec=function(b){var e=this.files(b),f=a.Deferred(),g=e.length,h=g,i,j,k;if(!(this.enabled()&&g&&d.length))return f.reject();for(i=0;i<g;i++){j=e[i];if(!j.read||!c.file(j.phash).write)return k=["errExtract",j.name,"errPerm"],c.error(k),f.reject(k);if(a.inArray(j.mime,d)===-1)return k=["errExtract",j.name,"errNoArchive"],c.error(k),f.reject(k);c.request({data:{cmd:"extract",target:j.hash}
,notify:{type:"extract",cnt:1},syncOnFail:!0}).fail(function(a){f.isRejected()||f.reject(a)}).done(function(){h--,h==0&&f.resolve()})}return f}},elFinder.prototype.commands.forward=function(){this.alwaysEnabled=!0,this.updateOnSelect=!0,this.shortcuts=[{pattern:"ctrl+right"}],this.getstate=function(){return this.fm.history.canForward()?0:-1},this.exec=function(){return this.fm.history.forward()}},elFinder.prototype.commands.getfile=function(){var b=this,c=this.fm,d=function(c){var d=b.options;return c=a.map(c,function(a){return a.mime!="directory"||d.folders?a:null}),d.multiple||c.length==1?c:[]};this.alwaysEnabled=!0,this.callback=c.options.getFileCallback,this._disabled=typeof this.callback=="function",this.getstate=function(a){var a=this.files(a),b=a.length;return this.callback&&b&&d(a).length==b?0:-1},this.exec=function(c){var d=this.fm,e=this.options,f=this.files(c),g=f.length,h=d.option("url"),i=d.option("tmbUrl"),j=a.Deferred().done(function(a){d.trigger("getfile",{files:a}),b.callback(a,d),e.oncomplete=="close"?d.hide():e.oncomplete=="destroy"&&d.destroy()}),k=function(b){return e.onlyURL?e.multiple?a.map(f,function(a){return a.url}):f[0].url:e.multiple?f:f[0]},l=[],m,n,o;if(this.getstate()==-1)return j.reject();for(m=0;m<g;m++){n=f[m];if(n.mime=="directory"&&!e.folders)return j.reject();n.baseUrl=h,n.url=d.url(n.hash),n.path=d.path(n.hash),n.tmb&&n.tmb!=1&&(n.tmb=i+n.tmb),!n.width&&!n.height&&(n.dim?(o=n.dim.split("x"),n.width=o[0],n.height=o[1]):n.mime.indexOf("image")!==-1&&l.push(d.request({data:{cmd:"dim",target:n.hash},preventDefault:!0}).done(a.proxy(function(a){a.dim&&(o=a.dim.split("x"),this.width=o[0],this.height=o[1]),this.dim=a.dim},f[m]))))}return l.length?(a.when.apply(null,l).always(function(){j.resolve(k(f))}),j):j.resolve(k(f))}},elFinder.prototype.commands.help=function(){var b=this.fm,c=this,d='<div class="elfinder-help-link"> <a href="{url}">{link}</a></div>',e='<div class="elfinder-help-team"><div>{author}</div>{work}</div>',f=/\{url\}/,g=/\{link\}/,h=/\{author\}/,i=/\{work\}/,j="replace",k="ui-priority-primary",l="ui-priority-secondary",m="elfinder-help-license",n='<li class="ui-state-default ui-corner-top"><a href="#{id}">{title}</a></li>',o=['<div class="ui-tabs ui-widget ui-widget-content ui-corner-all elfinder-help">','<ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">'],p='<div class="elfinder-help-shortcut"><div class="elfinder-help-shortcut-pattern">{pattern}</div> {descrip}</div>',q='<div class="elfinder-help-separator"/>',r=function(){o.push('<div id="about" class="ui-tabs-panel ui-widget-content ui-corner-bottom"><div class="elfinder-help-logo"/>'),o.push("<h3>elFinder</h3>"),o.push('<div class="'+k+'">'+b.i18n("webfm")+"</div>"),o.push('<div class="'+l+'">'+b.i18n("ver")+": "+b.version+", "+b.i18n("protocol")+": "+b.api+"</div>"),o.push('<div class="'+l+'">jQuery/jQuery UI: '+a().jquery+"/"+a.ui.version+"</div>"),o.push(q),o.push(d[j](f,"http://elfinder.org/")[j](g,b.i18n("homepage"))),o.push(d[j](f,"https://github.com/Studio-42/elFinder/wiki")[j](g,b.i18n("docs"))),o.push(d[j](f,"https://github.com/Studio-42/elFinder")[j](g,b.i18n("github"))),o.push(d[j](f,"http://twitter.com/elrte_elfinder")[j](g,b.i18n("twitter"))),o.push(q),o.push('<div class="'+k+'">'+b.i18n("team")+"</div>"),o.push(e[j](h,'Dmitry "dio" Levashov &lt;dio@std42.ru&gt;')[j](i,b.i18n("chiefdev"))),o.push(e[j](h,"Troex Nevelin &lt;troex@fury.scancode.ru&gt;")[j](i,b.i18n("maintainer"))),o.push(e[j](h,"Alexey Sukhotin &lt;strogg@yandex.ru&gt;")[j](i,b.i18n("contributor"))),o.push(e[j](h,"Naoki Sawada &lt;hypweb@gmail.com&gt;")[j](i,b.i18n("contributor"))),b.i18[b.lang].translator&&o.push(e[j](h,b.i18[b.lang].translator)[j](i,b.i18n("translator")+" ("+b.i18[b.lang].language+")")),o.push(q),o.push('<div class="'+m+'">'+b.i18n("icons")+': <a href="http://pixelmixer.ru/" target="_blank">Pixelmixer</a>, <a href="http://p.yusukekamiyamane.com" target="_blank">Fugue</a></div>'),o.push(q),o.push('<div class="'+m+'">Licence: BSD Licence</div>'),o.push('<div class="'+m+'">Copyright © 2009-2011, Studio 42</div>'),o.push('<div class="'+m+'">„ …'+b.i18n("dontforget")+" ”</div>"),o.push("</div>")},s=function(){var c=b.shortcuts();o.push('<div id="shortcuts" class="ui-tabs-panel ui-widget-content ui-corner-bottom">'),c.length?(o.push('<div class="ui-widget-content elfinder-help-shortcuts">'),a.each(c,function(a,b){o.push(p.replace(/\{pattern\}/,b[0]).replace(/\{descrip\}/,b[1]))}),o.push("</div>")):o.push('<div class="elfinder-help-disabled">'+b.i18n("shortcutsof")+"</div>"),o.push("</div>")},t=function(){o.push('<div id="help" class="ui-tabs-panel ui-widget-content ui-corner-bottom">'),o.push('<a href="http://elfinder.org/forum/" target="_blank" class="elfinder-dont-panic"><span>DON\'T PANIC</span></a>'),o.push("</div>")},u;this.alwaysEnabled=!0,this.updateOnSelect=!1,this.state=0,this.shortcuts=[{pattern:"f1",description:this.title}],setTimeout(function(){var d=c.options.view||["about","shortcuts","help"];a.each(d,function(a,c){o.push(n[j](/\{id\}/,c)[j](/\{title\}/,b.i18n(c)))}),o.push("</ul>"),a.inArray("about",d)!==-1&&r(),a.inArray("shortcuts",d)!==-1&&s(),a.inArray("help",d)!==-1&&t(),o.push("</div>"),u=a(o.join("")),u.find(".ui-tabs-nav li").hover(function(){a(this).toggleClass("ui-state-hover")}).children().click(function(b){var c=a(this);b.preventDefault(),b.stopPropagation(),c.is(".ui-tabs-selected")||(c.parent().addClass("ui-tabs-selected ui-state-active").siblings().removeClass("ui-tabs-selected").removeClass("ui-state-active"),u.find(".ui-tabs-panel").hide().filter(c.attr("href")).show())}).filter(":first").click()},200),this.getstate=function(){return 0},this.exec=function(){this.dialog||(this.dialog=this.fm.dialog(u,{title:this.title,width:530,autoOpen:!1,destroyOnClose:!1})),this.dialog.elfinderdialog("open").find(".ui-tabs-nav li a:first").click()}},elFinder.prototype.commands.home=function(){this.title="Home",this.alwaysEnabled=!0,this.updateOnSelect=!1,this.shortcuts=[{pattern:"ctrl+home ctrl+shift+up",description:"Home"}],this.getstate=function(){var a=this.fm.root(),b=this.fm.cwd().hash;return a&&b&&a!=b?0:-1},this.exec=function(){return this.fm.exec("open",this.fm.root())}},elFinder.prototype.commands.info=function(){var b="msg",c=this.fm,d="elfinder-info-spinner",e={calc:c.i18n("calc"),size:c.i18n("size"),unknown:c.i18n("unknown"),path:c.i18n("path"),aliasfor:c.i18n("aliasfor"),modify:c.i18n("modify"),perms:c.i18n("perms"),locked:c.i18n("locked"),dim:c.i18n("dim"),kind:c.i18n("kind"),files:c.i18n("files"),folders:c.i18n("folders"),items:c.i18n("items"),yes:c.i18n("yes"),no:c.i18n("no"),link:c.i18n("link")};this.tpl={main:'<div class="ui-helper-clearfix elfinder-info-title"><span class="elfinder-cwd-icon {class} ui-corner-all"/>{title}</div><table class="elfinder-info-tb">{content}</table>',itemTitle:'<strong>{name}</strong><span class="elfinder-info-kind">{kind}</span>',groupTitle:"<strong>{items}: {num}</strong>",row:"<tr><td>{label} : </td><td>{value}</td></tr>",spinner:'<span>{text}</span> <span class="'+d+'"/>'},this.alwaysEnabled=!0,this.updateOnSelect=!1,this.shortcuts=[{pattern:"ctrl+i"}],this.init=function(){a.each(e,function(a,b){e[a]=c.i18n(b)})},this.getstate=function(){return 0},this.exec=function(b){var c=this,f=this.fm,g=this.tpl,h=g.row,i=this.files(b),j=i.length,k=[],l=g.main,m="{label}",n="{value}",o={title:this.title,width:"auto",close:function(){a(this).elfinderdialog("destroy")}},p=[],q=function(a){s.find("."+d).parent().text(a)},r=f.namespace+"-info-"+a.map(i,function(a){return a.hash}).join("-"),s=f.getUI().find("#"+r),t,u,v,w,x;if(!j)return a.Deferred().reject();if(s.length)return s.elfinderdialog("toTop"),a.Deferred().resolve();j==1?(v=i[0],l=l.replace("{class}",f.mime2class(v.mime)),w=g.itemTitle.replace("{name}",v.name).replace("{kind}",f.mime2kind(v)),v.tmb&&(u=f.option("tmbUrl")+v.tmb),v.read?v.mime!="directory"||v.alias?t=f.formatSize(v.size):(t=g.spinner.replace("{text}",e.calc),p.push(v.hash)):t=e.unknown,k.push(h.replace(m,e.size).replace(n,t)),v.alias&&k.push(h.replace(m,e.aliasfor).replace(n,v.alias)),k.push(h.replace(m,e.path).replace(n,f.escape(f.path
(v.hash)))),v.read&&k.push(h.replace(m,e.link).replace(n,'<a href="'+f.url(v.hash)+'" target="_blank">'+v.name+"</a>")),v.dim?k.push(h.replace(m,e.dim).replace(n,v.dim)):v.mime.indexOf("image")!==-1&&(v.width&&v.height?k.push(h.replace(m,e.dim).replace(n,v.width+"x"+v.height)):(k.push(h.replace(m,e.dim).replace(n,g.spinner.replace("{text}",e.calc))),f.request({data:{cmd:"dim",target:v.hash},preventDefault:!0}).fail(function(){q(e.unknown)}).done(function(a){q(a.dim||e.unknown)}))),k.push(h.replace(m,e.modify).replace(n,f.formatDate(v))),k.push(h.replace(m,e.perms).replace(n,f.formatPermissions(v))),k.push(h.replace(m,e.locked).replace(n,v.locked?e.yes:e.no))):(l=l.replace("{class}","elfinder-cwd-icon-group"),w=g.groupTitle.replace("{items}",e.items).replace("{num}",j),x=a.map(i,function(a){return a.mime=="directory"?1:null}).length,x?(k.push(h.replace(m,e.kind).replace(n,x==j?e.folders:e.folders+" "+x+", "+e.files+" "+(j-x))),k.push(h.replace(m,e.size).replace(n,g.spinner.replace("{text}",e.calc))),p=a.map(i,function(a){return a.hash})):(t=0,a.each(i,function(a,b){var c=parseInt(b.size);c>=0&&t>=0?t+=c:t="unknown"}),k.push(h.replace(m,e.kind).replace(n,e.files)),k.push(h.replace(m,e.size).replace(n,f.formatSize(t))))),l=l.replace("{title}",w).replace("{content}",k.join("")),s=f.dialog(l,o),s.attr("id",r),u&&a("<img/>").load(function(){s.find(".elfinder-cwd-icon").css("background",'url("'+u+'") center center no-repeat')}).attr("src",u),p.length&&f.request({data:{cmd:"size",targets:p},preventDefault:!0}).fail(function(){q(e.unknown)}).done(function(a){var b=parseInt(a.size);f.log(a.size),q(b>=0?f.formatSize(b):e.unknown)})}},elFinder.prototype.commands.mkdir=function(){this.disableOnSearch=!0,this.updateOnSelect=!1,this.mime="directory",this.prefix="untitled folder",this.exec=a.proxy(this.fm.res("mixin","make"),this),this.shortcuts=[{pattern:"ctrl+shift+n"}],this.getstate=function(){return!this._disabled&&this.fm.cwd().write?0:-1}},elFinder.prototype.commands.mkfile=function(){this.disableOnSearch=!0,this.updateOnSelect=!1,this.mime="text/plain",this.prefix="untitled file.txt",this.exec=a.proxy(this.fm.res("mixin","make"),this),this.getstate=function(){return!this._disabled&&this.fm.cwd().write?0:-1}},elFinder.prototype.commands.open=function(){this.alwaysEnabled=!0,this._handlers={dblclick:function(a){a.preventDefault(),this.exec()},"select enable disable reload":function(a){this.update(a.type=="disable"?-1:void 0)}},this.shortcuts=[{pattern:"ctrl+down numpad_enter"+(this.fm.OS!="mac"&&" enter")}],this.getstate=function(b){var b=this.files(b),c=b.length;return c==1?0:c?a.map(b,function(a){return a.mime=="directory"?null:a}).length==c?0:-1:-1},this.exec=function(b){var c=this.fm,d=a.Deferred().fail(function(a){a&&c.error(a)}),e=this.files(b),f=e.length,g,h,i,j;if(!f)return d.reject();if(f==1&&(g=e[0])&&g.mime=="directory")return g&&!g.read?d.reject(["errOpen",g.name,"errPerm"]):c.request({data:{cmd:"open",target:g.thash||g.hash},notify:{type:"open",cnt:1,hideCnt:!0},syncOnFail:!0});e=a.map(e,function(a){return a.mime!="directory"?a:null});if(f!=e.length)return d.reject();f=e.length;while(f--){g=e[f];if(!g.read)return d.reject(["errOpen",g.name,"errPerm"]);(h=c.url(g.hash))||(h=c.options.url,h=h+(h.indexOf("?")===-1?"?":"&")+(c.oldAPI?"cmd=open&current="+g.phash:"cmd=file")+"&target="+g.hash),j="",g.dim&&(i=g.dim.split("x"),j="width="+(parseInt(i[0])+20)+",height="+(parseInt(i[1])+20));if(!window.open(h,"_blank",j+",top=50,left=50,scrollbars=yes,resizable=yes"))return d.reject("errPopup")}return d.resolve(b)}},elFinder.prototype.commands.paste=function(){this.disableOnSearch=!0,this.updateOnSelect=!1,this.handlers={changeclipboard:function(){this.update()}},this.shortcuts=[{pattern:"ctrl+v shift+insert"}],this.getstate=function(b){if(this._disabled)return-1;if(b){if(a.isArray(b)){if(b.length!=1)return-1;b=this.fm.file(b[0])}}else b=this.fm.cwd();return this.fm.clipboard().length&&b.mime=="directory"&&b.write?0:-1},this.exec=function(b){var c=this,d=c.fm,b=b?this.files(b)[0]:d.cwd(),e=d.clipboard(),f=e.length,g=f?e[0].cut:!1,h=g?"errMove":"errCopy",i=[],j=[],k=a.Deferred().fail(function(a){a&&d.error(a)}),l=function(b){return b.length&&d._commands.duplicate?d.exec("duplicate",b):a.Deferred().resolve()},m=function(e){var f=a.Deferred(),h=[],i=function(b,c){var d=[],e=b.length;while(e--)a.inArray(b[e].name,c)!==-1&&d.unshift(e);return d},j=function(a){var b=h[a],c=e[b],i=a==h.length-1;if(!c)return;d.confirm({title:d.i18n(g?"moveFiles":"copyFiles"),text:d.i18n(["errExists",c.name,"confirmRepl"]),all:!i,accept:{label:"btnYes",callback:function(b){!i&&!b?j(++a):l(e)}},reject:{label:"btnNo",callback:function(b){var c;if(b){c=h.length;while(a<c--)e[h[c]].remove=!0}else e[h[a]].remove=!0;!i&&!b?j(++a):l(e)}},cancel:{label:"btnCancel",callback:function(){f.resolve()}}})},k=function(a){h=i(e,a),h.length?j(0):l(e)},l=function(c){var c=a.map(c,function(a){return a.remove?null:a}),e=c.length,h={},i=[],j;if(!e)return f.resolve();j=c[0].phash,c=a.map(c,function(a){return a.hash}),d.request({data:{cmd:"paste",dst:b.hash,targets:c,cut:g?1:0,src:j},notify:{type:g?"move":"copy",cnt:e}}).always(function(){d.unlockfiles({files:c})})};return c._disabled||!e.length?f.resolve():(d.oldAPI?l(e):d.option("copyOverwrite")?b.hash==d.cwd().hash?k(a.map(d.files(),function(a){return a.phash==b.hash?a.name:null})):d.request({data:{cmd:"ls",target:b.hash},notify:{type:"prepare",cnt:1,hideCnt:!0},preventFail:!0}).always(function(a){k(a.list||[])}):l(e),f)},n,o;return!f||!b||b.mime!="directory"?k.reject():b.write?(n=d.parents(b.hash),a.each(e,function(c,f){if(!f.read)return!k.reject([h,e[0].name,"errPerm"]);if(g&&f.locked)return!k.reject(["errLocked",f.name]);if(a.inArray(f.hash,n)!==-1)return!k.reject(["errCopyInItself",f.name]);o=d.parents(f.hash);if(a.inArray(b.hash,o)!==-1&&a.map(o,function(a){var c=d.file(a);return c.phash==b.hash&&c.name==f.name?c:null}).length)return!k.reject(["errReplByChild",f.name]);f.phash==b.hash?j.push(f.hash):i.push({hash:f.hash,phash:f.phash,name:f.name})}),k.isRejected()?k:a.when(l(j),m(i)).always(function(){g&&d.clipboard([])})):k.reject([h,e[0].name,"errPerm"])}},elFinder.prototype.commands.quicklook=function(){var b=this,c=b.fm,d=0,e=1,f=2,g=d,h="elfinder-quicklook-navbar-icon",i="elfinder-quicklook-fullscreen",j=function(b){a(document).trigger(a.Event("keydown",{keyCode:b,ctrlKey:!1,shiftKey:!1,altKey:!1,metaKey:!1}))},k=function(a){return{opacity:0,width:20,height:c.view=="list"?1:20,top:a.offset().top+"px",left:a.offset().left+"px"}},l=function(){var b=a(window);return{opacity:1,width:n,height:o,top:parseInt((b.height()-o)/2+b.scrollTop()),left:parseInt((b.width()-n)/2+b.scrollLeft())}},m=function(a){var b=document.createElement(a.substr(0,a.indexOf("/"))),c=b.canPlayType&&b.canPlayType(a);return c&&c!==""&&c!="no"},n,o,p,q,r=a('<div class="elfinder-quicklook-title"/>'),s=a("<div/>"),t=a('<div class="elfinder-quicklook-info"/>'),u=a('<div class="'+h+" "+h+'-fullscreen"/>').mousedown(function(d){var e=b.window,f=e.is("."+i),g="scroll."+c.namespace,j=a(window);d.stopPropagation(),f?(e.css(e.data("position")).unbind("mousemove"),j.unbind(g).trigger(b.resize).unbind(b.resize),v.unbind("mouseenter").unbind("mousemove")):(e.data("position",{left:e.css("left"),top:e.css("top"),width:e.width(),height:e.height()}).css({width:"100%",height:"100%"}),a(window).bind(g,function(){e.css({left:parseInt(a(window).scrollLeft())+"px",top:parseInt(a(window).scrollTop())+"px"})}).bind(b.resize,function(a){b.preview.trigger("changesize")}).trigger(g).trigger(b.resize),e.bind("mousemove",function(a){v.stop(!0,!0).show().delay(3e3).fadeOut("slow")}).mousemove(),v.mouseenter(function(){v.stop(!0,!0).show()}).mousemove(function(a){a.stopPropagation()})),v.attr("style","").draggable(f?"destroy":{}),e.toggleClass(i),a(this).toggleClass(h+"-fullscreen-off"),a.fn.resizable&&p.add(e).resizable(f?"enable":"disable").removeClass("ui-state-disabled")}),v=a('<div class="elfinder-quicklook-navbar"/>').append(a('<div class="'+h+" "+h+'-prev"/>').mousedown(function(){j(37)})).append(u).append(a('<div class="'+h+" "+h+'-next"/>').mousedown(function(){j(39)})).append('<div class="elfinder-quicklook-navbar-separator"/>'
).append(a('<div class="'+h+" "+h+'-close"/>').mousedown(function(){b.window.trigger("close")}));this.resize="resize."+c.namespace,this.info=a('<div class="elfinder-quicklook-info-wrapper"/>').append(s).append(t),this.preview=a('<div class="elfinder-quicklook-preview ui-helper-clearfix"/>').bind("change",function(a){b.info.attr("style","").hide(),s.removeAttr("class").attr("style",""),t.html("")}).bind("update",function(c){var d=b.fm,e=b.preview,f=c.file,g='<div class="elfinder-quicklook-info-data">{value}</div>',h;f?(!f.read&&c.stopImmediatePropagation(),b.window.data("hash",f.hash),b.preview.unbind("changesize").trigger("change").children().remove(),r.html(d.escape(f.name)),t.html(g.replace(/\{value\}/,f.name)+g.replace(/\{value\}/,d.mime2kind(f))+(f.mime=="directory"?"":g.replace(/\{value\}/,d.formatSize(f.size)))+g.replace(/\{value\}/,d.i18n("modify")+": "+d.formatDate(f.date))),s.addClass("elfinder-cwd-icon ui-corner-all "+d.mime2class(f.mime)),f.tmb&&a("<img/>").hide().appendTo(b.preview).load(function(){s.css("background",'url("'+h+'") center center no-repeat'),a(this).remove()}).attr("src",h=d.tmb(f.hash)),b.info.delay(100).fadeIn(10)):c.stopImmediatePropagation()}),this.window=a('<div class="ui-helper-reset ui-widget elfinder-quicklook" style="position:absolute"/>').click(function(a){a.stopPropagation()}).append(a('<div class="elfinder-quicklook-titlebar"/>').append(r).append(a('<span class="ui-icon ui-icon-circle-close"/>').mousedown(function(a){a.stopPropagation(),b.window.trigger("close")}))).append(this.preview.add(v)).append(b.info.hide()).draggable({handle:"div.elfinder-quicklook-titlebar"}).bind("open",function(a){var c=b.window,d=b.value,h;b.closed()&&d&&(h=q.find("#"+d.hash)).length&&(g=e,h.trigger("scrolltoview"),c.css(k(h)).show().animate(l(),550,function(){g=f,b.update(1,b.value)}))}).bind("close",function(a){var c=b.window,f=b.preview.trigger("change"),h=b.value,j=q.find("#"+c.data("hash")),l=function(){g=d,c.hide(),f.children().remove(),b.update(0,b.value)};b.opened()&&(g=e,c.is("."+i)&&u.mousedown(),j.length?c.animate(k(j),500,l):l())}),this.alwaysEnabled=!0,this.value=null,this.handlers={select:function(){this.update(void 0,this.fm.selectedFiles()[0])},error:function(){b.window.is(":visible")&&b.window.data("hash","").trigger("close")},"searchshow searchhide":function(){this.opened()&&this.window.trigger("close")}},this.shortcuts=[{pattern:"space"}],this.support={audio:{ogg:m('audio/ogg; codecs="vorbis"'),mp3:m("audio/mpeg;"),wav:m('audio/wav; codecs="1"'),m4a:m("audio/x-m4a;")||m("audio/aac;")},video:{ogg:m('video/ogg; codecs="theora"'),webm:m('video/webm; codecs="vp8, vorbis"'),mp4:m('video/mp4; codecs="avc1.42E01E"')||m('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')}},this.closed=function(){return g==d},this.opened=function(){return g==f},this.init=function(){var d=this.options,e=this.window,f=this.preview,g,h;n=d.width>0?parseInt(d.width):450,o=d.height>0?parseInt(d.height):300,c.one("load",function(){p=c.getUI(),q=c.getUI("cwd"),e.appendTo("body").zIndex(100+p.zIndex()),a(document).keydown(function(a){a.keyCode==27&&b.opened()&&e.trigger("close")}),a.fn.resizable&&e.resizable({handles:"se",minWidth:350,minHeight:120,resize:function(){f.trigger("changesize")}}),b.change(function(){b.opened()&&(b.value?f.trigger(a.Event("update",{file:b.value})):e.trigger("close"))}),a.each(c.commands.quicklook.plugins||[],function(a,c){typeof c=="function"&&new c(b)}),f.bind("update",function(){b.info.show()})})},this.getstate=function(){return this.fm.selected().length==1?g==f?1:0:-1},this.exec=function(){this.enabled()&&this.window.trigger(this.opened()?"close":"open")},this.hideinfo=function(){this.info.stop(!0).hide()}},elFinder.prototype.commands.quicklook.plugins=[function(b){var c=["image/jpeg","image/png","image/gif"],d=b.preview;a.each(navigator.mimeTypes,function(b,d){var e=d.type;e.indexOf("image/")===0&&a.inArray(e,c)&&c.push(e)}),d.bind("update",function(e){var f=e.file,g;a.inArray(f.mime,c)!==-1&&(e.stopImmediatePropagation(),g=a("<img/>").hide().appendTo(d).load(function(){setTimeout(function(){var a=(g.width()/g.height()).toFixed(2);d.bind("changesize",function(){var b=parseInt(d.width()),c=parseInt(d.height()),e,f;a<(b/c).toFixed(2)?(f=c,e=Math.floor(f*a)):(e=b,f=Math.floor(e/a)),g.width(e).height(f).css("margin-top",f<c?Math.floor((c-f)/2):0)}).trigger("changesize"),b.hideinfo(),g.fadeIn(100)},1)}).attr("src",b.fm.url(f.hash)))})},function(b){var c=["text/html","application/xhtml+xml"],d=b.preview,e=b.fm;d.bind("update",function(f){var g=f.file,h;a.inArray(g.mime,c)!==-1&&(f.stopImmediatePropagation(),d.one("change",function(){!h.isResolved()&&!h.isRejected()&&h.reject()}),h=e.request({data:{cmd:"get",target:g.hash,current:g.phash},preventDefault:!0}).done(function(c){b.hideinfo(),doc=a('<iframe class="elfinder-quicklook-preview-html"/>').appendTo(d)[0].contentWindow.document,doc.open(),doc.write(c.content),doc.close()}))})},function(b){var c=b.fm,d=c.res("mimes","text"),e=b.preview;e.bind("update",function(f){var g=f.file,h=g.mime,i;if(h.indexOf("text/")===0||a.inArray(h,d)!==-1)f.stopImmediatePropagation(),e.one("change",function(){!i.isResolved()&&!i.isRejected()&&i.reject()}),i=c.request({data:{cmd:"get",target:g.hash},preventDefault:!0}).done(function(d){b.hideinfo(),a('<div class="elfinder-quicklook-preview-text-wrapper"><pre class="elfinder-quicklook-preview-text">'+c.escape(d.content)+"</pre></div>").appendTo(e)})})},function(b){var c=b.fm,d="application/pdf",e=b.preview,f=!1;a.browser.safari&&navigator.platform.indexOf("Mac")!=-1||a.browser.msie?f=!0:a.each(navigator.plugins,function(b,c){a.each(c,function(a,b){if(b.type==d)return!(f=!0)})}),f&&e.bind("update",function(f){var g=f.file,h;g.mime==d&&(f.stopImmediatePropagation(),e.one("change",function(){h.unbind("load").remove()}),h=a('<iframe class="elfinder-quicklook-preview-pdf"/>').hide().appendTo(e).load(function(){b.hideinfo(),h.show()}).attr("src",c.url(g.hash)))})},function(b){var c=b.fm,d="application/x-shockwave-flash",e=b.preview,f=!1;a.each(navigator.plugins,function(b,c){a.each(c,function(a,b){if(b.type==d)return!(f=!0)})}),f&&e.bind("update",function(f){var g=f.file,h;g.mime==d&&(f.stopImmediatePropagation(),b.hideinfo(),e.append(h=a('<embed class="elfinder-quicklook-preview-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" src="'+c.url(g.hash)+'" quality="high" type="application/x-shockwave-flash" />')))})},function(b){var c=b.preview,d=!!b.options.autoplay,e={"audio/mpeg":"mp3","audio/mpeg3":"mp3","audio/mp3":"mp3","audio/x-mpeg3":"mp3","audio/x-mp3":"mp3","audio/x-wav":"wav","audio/wav":"wav","audio/x-m4a":"m4a","audio/aac":"m4a","audio/mp4":"m4a","audio/x-mp4":"m4a","audio/ogg":"ogg"},f;c.bind("update",function(g){var h=g.file,i=e[h.mime];b.support.audio[i]&&(g.stopImmediatePropagation(),f=a('<audio class="elfinder-quicklook-preview-audio" controls preload="auto" autobuffer><source src="'+b.fm.url(h.hash)+'" /></audio>').appendTo(c),d&&f[0].play())}).bind("change",function(){f&&f.parent().length&&(f[0].pause(),f.remove(),f=null)})},function(b){var c=b.preview,d=!!b.options.autoplay,e={"video/mp4":"mp4","video/x-m4v":"mp4","video/ogg":"ogg","application/ogg":"ogg","video/webm":"webm"},f;c.bind("update",function(g){var h=g.file,i=e[h.mime];b.support.video[i]&&(g.stopImmediatePropagation(),b.hideinfo(),f=a('<video class="elfinder-quicklook-preview-video" controls preload="auto" autobuffer><source src="'+b.fm.url(h.hash)+'" /></video>').appendTo(c),d&&f[0].play())}).bind("change",function(){f&&f.parent().length&&(f[0].pause(),f.remove(),f=null)})},function(b){var c=b.preview,d=[],e;a.each(navigator.plugins,function(b,c){a.each(c,function(a,b){(b.type.indexOf("audio/")===0||b.type.indexOf("video/")===0)&&d.push(b.type)})}),c.bind("update",function(f){var g=f.file,h=g.mime,i;a.inArray(g.mime,d)!==-1&&(f.stopImmediatePropagation(),(i=h.indexOf("video/")===0)&&b.hideinfo(),e=a('<embed src="'+b.fm.url(g.hash)+'" type="'+h+'" class="elfinder-quicklook-preview-'+(i?"video":"audio")+'"/>').appendTo(c))}).bind("change",function(){e&&e.parent().length&&(e.remove(),e=null)})}],elFinder.prototype.commands.reload=function(){this.alwaysEnabled=!0
,this.updateOnSelect=!0,this.shortcuts=[{pattern:"ctrl+shift+r f5"}],this.getstate=function(){return 0},this.exec=function(){var a=this.fm,b=a.sync(),c=setTimeout(function(){a.notify({type:"reload",cnt:1,hideCnt:!0}),b.always(function(){a.notify({type:"reload",cnt:-1})})},a.notifyDelay);return b.always(function(){clearTimeout(c),a.trigger("reload")})}},elFinder.prototype.commands.rename=function(){this.shortcuts=[{pattern:"f2"+(this.fm.OS=="mac"?" enter":"")}],this.getstate=function(){var a=this.fm.selectedFiles();return!this._disabled&&a.length==1&&a[0].phash&&!a[0].locked?0:-1},this.exec=function(){var b=this.fm,c=b.getUI("cwd"),d=b.selected(),e=d.length,f=b.file(d.shift()),g=".elfinder-cwd-filename",h=a.Deferred().fail(function(a){var d=i.parent(),e=b.escape(f.name);d.length?(i.remove(),d.html(e)):(c.find("#"+f.hash).find(g).html(e),setTimeout(function(){c.find("#"+f.hash).click()},50)),a&&b.error(a)}).always(function(){b.enable()}),i=a('<input type="text"/>').keydown(function(b){b.stopPropagation(),b.stopImmediatePropagation(),b.keyCode==a.ui.keyCode.ESCAPE?h.reject():b.keyCode==a.ui.keyCode.ENTER&&i.blur()}).mousedown(function(a){a.stopPropagation()}).dblclick(function(a){a.stopPropagation(),a.preventDefault()}).blur(function(){var c=a.trim(i.val()),d=i.parent();if(d.length){i[0].setSelectionRange&&i[0].setSelectionRange(0,0);if(c==f.name)return h.reject();if(!c)return h.reject("errInvName");if(b.fileByName(c,f.phash))return h.reject(["errExists",c]);d.html(b.escape(c)),b.lockfiles({files:[f.hash]}),b.request({data:{cmd:"rename",target:f.hash,name:c},notify:{type:"rename",cnt:1}}).fail(function(a){h.reject(),b.sync()}).done(function(a){h.resolve(a)}).always(function(){b.unlockfiles({files:[f.hash]})})}}),j=c.find("#"+f.hash).find(g).empty().append(i.val(f.name)),k=i.val().replace(/\.((tar\.(gz|bz|bz2|z|lzo))|cpio\.gz|ps\.gz|xcf\.(gz|bz2)|[a-z0-9]{1,4})$/ig,"");return this.disabled()?h.reject():!f||e>1||!j.length?h.reject("errCmdParams",this.title):f.locked?h.reject(["errLocked",f.name]):(b.one("select",function(){i.parent().length&&f&&a.inArray(f.hash,b.selected())===-1&&i.blur()}),i.select().focus(),i[0].setSelectionRange&&i[0].setSelectionRange(0,k.length),h)}},elFinder.prototype.commands.resize=function(){this.updateOnSelect=!1,this.getstate=function(){var a=this.fm.selectedFiles();return!this._disabled&&a.length==1&&a[0].read&&a[0].write&&a[0].mime.indexOf("image/")!==-1?0:-1},this.exec=function(b){var c=this.fm,d=this.files(b),e=a.Deferred(),f=function(b,d){var f=a('<div class="elfinder-dialog-resize"/>'),g='<input type="text" size="5"/>',h='<div class="elfinder-resize-row"/>',i='<div class="elfinder-resize-label"/>',j=a('<div class="elfinder-resize-control"/>'),k=a('<div class="elfinder-resize-preview"/>'),l=a('<div class="elfinder-resize-spinner">'+c.i18n("ntfloadimg")+"</div>"),m=a('<div class="elfinder-resize-handle"/>'),n=a('<div class="elfinder-resize-handle"/>'),o=a('<div class="elfinder-resize-uiresize"/>'),p=a('<div class="elfinder-resize-uicrop"/>'),q='<div class="ui-widget-content ui-corner-all elfinder-buttonset"/>',r='<div class="ui-state-default elfinder-button"/>',s='<span class="ui-widget-content elfinder-toolbar-button-separator"/>',t=a('<div class="elfinder-resize-rotate"/>'),u=a(r).attr("title",c.i18n("rotate-cw")).append(a('<span class="elfinder-button-icon elfinder-button-icon-rotate-l"/>').click(function(){S-=90,ab.update(S)})),v=a(r).attr("title",c.i18n("rotate-ccw")).append(a('<span class="elfinder-button-icon elfinder-button-icon-rotate-r"/>').click(function(){S+=90,ab.update(S)})),w=a("<span />"),x=a('<div class="ui-state-default ui-corner-all elfinder-resize-reset"><span class="ui-icon ui-icon-arrowreturnthick-1-w"/></div>'),y=a('<div class="elfinder-resize-type"/>').append('<input type="radio" name="type" id="type-resize" value="resize" checked="checked" /><label for="type-resize">'+c.i18n("resize")+"</label>").append('<input type="radio" name="type" id="type-crop"   value="crop"/><label for="type-crop">'+c.i18n("crop")+"</label>").append('<input type="radio" name="type" id="type-rotate" value="rotate"/><label for="type-rotate">'+c.i18n("rotate")+"</label>"),z=a("input",y).change(function(){var b=a("input:checked",y).val();Y(),bb(!0),cb(!0),db(!0),b=="resize"?(o.show(),t.hide(),p.hide(),bb()):b=="crop"?(t.hide(),o.hide(),p.show(),cb()):b=="rotate"&&(o.hide(),p.hide(),t.show(),db())}),A=a('<input type="checkbox" checked="checked"/>').change(function(){N=!!A.prop("checked"),Z.fixHeight(),bb(!0),bb()}),B=a(g).change(function(){var a=parseInt(B.val()),b=parseInt(N?a/J:C.val());a>0&&b>0&&(Z.updateView(a,b),C.val(b))}),C=a(g).change(function(){var a=parseInt(C.val()),b=parseInt(N?a*J:B.val());b>0&&a>0&&(Z.updateView(b,a),B.val(b))}),D=a(g),E=a(g),F=a(g),G=a(g),H=a('<input type="text" size="3" maxlength="3" value="0" />').change(function(){ab.update()}),I=a('<div class="elfinder-resize-rotate-slider"/>').slider({min:0,max:359,value:H.val(),animate:!0,change:function(a,b){b.value!=I.slider("value")&&ab.update(b.value)},slide:function(a,b){ab.update(b.value,!1)}}),J=1,K=1,L=0,M=0,N=!0,O=0,P=0,Q=0,R=0,S=0,T=a("<img/>").load(function(){l.remove(),L=T.width(),M=T.height(),J=L/M,Z.updateView(L,M),m.append(T.show()).show(),B.val(L),C.val(M);var b=Math.min(O,P)/Math.sqrt(Math.pow(L,2)+Math.pow(M,2));Q=L*b,R=M*b,j.find("input,select").removeAttr("disabled").filter(":text").keydown(function(b){var c=b.keyCode,d;b.stopPropagation();if(c>=37&&c<=40||c==a.ui.keyCode.BACKSPACE||c==a.ui.keyCode.DELETE||c==65&&(b.ctrlKey||b.metaKey)||c==27)return;c==9&&(d=a(this).parent()[b.shiftKey?"prev":"next"](".elfinder-resize-row").children(":text"),d.length&&d.focus());if(c==13){eb();return}(c<48||c>57)&&b.preventDefault()}).filter(":first").focus(),bb(),x.hover(function(){x.toggleClass("ui-state-hover")}).click(Y)}).error(function(){l.text("Unable to load image").css("background","transparent")}),U=a("<div/>"),V=a("<img/>"),W=a("<div/>"),X=a("<img/>"),Y=function(){B.val(L),C.val(M),Z.updateView(L,M)},Z={update:function(){B.val(parseInt(T.width()/K)),C.val(parseInt(T.height()/K))},updateView:function(a,b){a>O||b>P?a/O>b/P?T.width(O).height(Math.ceil(T.width()/J)):T.height(P).width(Math.ceil(T.height()*J)):T.width(a).height(b),K=T.width()/a,w.text("1 : "+(1/K).toFixed(2)),Z.updateHandle()},updateHandle:function(){m.width(T.width()).height(T.height())},fixWidth:function(){var a,b;N&&(b=C.val(),b=parseInt(b*J),Z.updateView(a,b),B.val(a))},fixHeight:function(){var a,b;N&&(a=B.val(),b=parseInt(a/J),Z.updateView(a,b),C.val(b))}},_={update:function(){F.val(parseInt(n.width()/K)),G.val(parseInt(n.height()/K)),D.val(parseInt((n.offset().left-V.offset().left)/K)),E.val(parseInt((n.offset().top-V.offset().top)/K))},resize_update:function(){_.update(),W.width(n.width()),W.height(n.height())}},ab={mouseStartAngle:0,imageStartAngle:0,imageBeingRotated:!1,update:function(b,c){typeof b=="undefined"&&(S=b=parseInt(H.val())),typeof c=="undefined"&&(c=!0),!c||a.browser.opera||a.browser.msie&&parseInt(a.browser.version)<9?X.rotate(b):X.animate({rotate:b+"deg"}),b%=360,b<0&&(b+=360),H.val(parseInt(b)),I.slider("value",H.val())},execute:function(a){if(!ab.imageBeingRotated)return;var b=ab.getCenter(X),c=a.pageX-b[0],d=a.pageY-b[1],e=Math.atan2(d,c),f=e-ab.mouseStartAngle+ab.imageStartAngle;return f=Math.round(parseFloat(f)*180/Math.PI),a.shiftKey&&(f=Math.round((f+6)/15)*15),X.rotate(f),f%=360,f<0&&(f+=360),H.val(f),I.slider("value",H.val()),!1},start:function(b){ab.imageBeingRotated=!0;var c=ab.getCenter(X),d=b.pageX-c[0],e=b.pageY-c[1];return ab.mouseStartAngle=Math.atan2(e,d),ab.imageStartAngle=parseFloat(X.rotate())*Math.PI/180,a(document).mousemove(ab.execute),!1},stop:function(b){if(!ab.imageBeingRotated)return;return a(document).unbind("mousemove",ab.execute),setTimeout(function(){ab.imageBeingRotated=!1},10),!1},getCenter:function(a){var b=X.rotate();X.rotate(0);var c=X.offset(),d=c.left+X.width()/2,e=c.top+X.height()/2;return X.rotate(b),Array(d,e)}},bb=function(b){a.fn.resizable&&(b?(m.resizable("destroy"),m.hide()):(m.show(),m.resizable({alsoResize:T,aspectRatio:N,resize:Z.update,stop:Z.fixHeight})))},cb=function(b){a.fn.draggable&&a.fn.resizable&&
(b?(n.resizable("destroy"),n.draggable("destroy"),U.hide()):(V.width(T.width()).height(T.height()),W.width(T.width()).height(T.height()),n.width(V.width()).height(V.height()).offset(V.offset()).resizable({containment:U,resize:_.resize_update,handles:"all"}).draggable({handle:n,containment:V,drag:_.update}),U.show().width(T.width()).height(T.height()),_.update()))},db=function(b){a.fn.draggable&&a.fn.resizable&&(b?X.hide():X.show().width(Q).height(R).css("margin-top",(P-R)/2+"px").css("margin-left",(O-Q)/2+"px"))},eb=function(){var d,g,h,i,j,k=a("input:checked",y).val();B.add(C).change();if(k=="resize")d=parseInt(B.val())||0,g=parseInt(C.val())||0;else if(k=="crop")d=parseInt(F.val())||0,g=parseInt(G.val())||0,h=parseInt(D.val())||0,i=parseInt(E.val())||0;else if(k="rotate"){d=L,g=M,j=parseInt(H.val())||0;if(j<0||j>360)return c.error("Invalid rotate degree");if(j==0||j==360)return c.error("Image dose not rotated")}if(k!="rotate"){if(d<=0||g<=0)return c.error("Invalid image size");if(d==L&&g==M)return c.error("Image size not changed")}f.elfinderdialog("close"),c.request({data:{cmd:"resize",target:b.hash,width:d,height:g,x:h,y:i,degree:j,mode:k},notify:{type:"resize",cnt:1}}).fail(function(a){e.reject(a)}).done(function(){e.resolve()})},fb={},gb="elfinder-resize-handle-hline",hb="elfinder-resize-handle-vline",ib="elfinder-resize-handle-point",jb=c.url(b.hash);X.mousedown(ab.start),a(document).mouseup(ab.stop),o.append(a(h).append(a(i).text(c.i18n("width"))).append(B).append(x)).append(a(h).append(a(i).text(c.i18n("height"))).append(C)).append(a(h).append(a("<label/>").text(c.i18n("aspectRatio")).prepend(A))).append(a(h).append(c.i18n("scale")+" ").append(w)),p.append(a(h).append(a(i).text("X")).append(D)).append(a(h).append(a(i).text("Y")).append(E)).append(a(h).append(a(i).text(c.i18n("width"))).append(F)).append(a(h).append(a(i).text(c.i18n("height"))).append(G)),t.append(a(h).append(a(i).text(c.i18n("rotate"))).append(a('<div style="float:left; width: 130px;">').append(a('<div style="float:left;">').append(H).append(a("<span/>").text(c.i18n("degree")))).append(a(q).append(u).append(a(s)).append(v))).append(I)),f.append(y),j.append(a(h)).append(o).append(p.hide()).append(t.hide()).find("input,select").attr("disabled","disabled"),m.append('<div class="'+gb+" "+gb+'-top"/>').append('<div class="'+gb+" "+gb+'-bottom"/>').append('<div class="'+hb+" "+hb+'-left"/>').append('<div class="'+hb+" "+hb+'-right"/>').append('<div class="'+ib+" "+ib+'-e"/>').append('<div class="'+ib+" "+ib+'-se"/>').append('<div class="'+ib+" "+ib+'-s"/>'),k.append(l).append(m.hide()).append(T.hide()),n.css("position","absolute").append('<div class="'+gb+" "+gb+'-top"/>').append('<div class="'+gb+" "+gb+'-bottom"/>').append('<div class="'+hb+" "+hb+'-left"/>').append('<div class="'+hb+" "+hb+'-right"/>').append('<div class="'+ib+" "+ib+'-n"/>').append('<div class="'+ib+" "+ib+'-e"/>').append('<div class="'+ib+" "+ib+'-s"/>').append('<div class="'+ib+" "+ib+'-w"/>').append('<div class="'+ib+" "+ib+'-ne"/>').append('<div class="'+ib+" "+ib+'-se"/>').append('<div class="'+ib+" "+ib+'-sw"/>').append('<div class="'+ib+" "+ib+'-nw"/>'),k.append(U.css("position","absolute").hide().append(V).append(n.append(W))),k.append(X.hide()),k.css("overflow","hidden"),f.append(k).append(j),fb[c.i18n("btnCancel")]=function(){f.elfinderdialog("close")},fb[c.i18n("btnApply")]=eb,c.dialog(f,{title:b.name,width:650,resizable:!1,destroyOnClose:!0,buttons:fb,open:function(){k.zIndex(1+a(this).parent().zIndex())}}).attr("id",d),a.browser.msie&&parseInt(a.browser.version)<9&&a(".elfinder-dialog").css("filter",""),x.css("left",B.position().left+B.width()+12),W.css({opacity:.2,"background-color":"#fff",position:"absolute"}),n.css("cursor","move"),n.find(".elfinder-resize-handle-point").css({"background-color":"#fff",opacity:.5,"border-color":"#000"}),X.css("cursor","pointer"),y.buttonset(),O=k.width()-(m.outerWidth()-m.width()),P=k.height()-(m.outerHeight()-m.height()),T.attr("src",jb+(jb.indexOf("?")===-1?"?":"&")+"_="+Math.random()),V.attr("src",T.attr("src")),X.attr("src",T.attr("src"))},g,h;return!d.length||d[0].mime.indexOf("image/")===-1?e.reject():(g="resize-"+c.namespace+"-"+d[0].hash,h=c.getUI().find("#"+g),h.length?(h.elfinderdialog("toTop"),e.resolve()):(f(d[0],g),e))}},function(a){var b=function(a,b){var c=0;for(c in b)if(typeof a[b[c]]!="undefined")return b[c];return a[b[c]]="",b[c]};a.cssHooks.rotate={get:function(b,c,d){return a(b).rotate()},set:function(b,c){return a(b).rotate(c),c}},a.cssHooks.transform={get:function(a,c,d){var e=b(a.style,["WebkitTransform","MozTransform","OTransform","msTransform","transform"]);return a.style[e]},set:function(a,c){var d=b(a.style,["WebkitTransform","MozTransform","OTransform","msTransform","transform"]);return a.style[d]=c,c}},a.fn.rotate=function(b){if(typeof b=="undefined"){if(a.browser.opera){var c=this.css("transform").match(/rotate\((.*?)\)/);return c&&c[1]?Math.round(parseFloat(c[1])*180/Math.PI):0}var c=this.css("transform").match(/rotate\((.*?)\)/);return c&&c[1]?parseInt(c[1]):0}return this.css("transform",this.css("transform").replace(/none|rotate\(.*?\)/,"")+"rotate("+parseInt(b)+"deg)"),this},a.fx.step.rotate=function(b){b.state==0&&(b.start=a(b.elem).rotate(),b.now=b.start),a(b.elem).rotate(b.now)};if(a.browser.msie&&parseInt(a.browser.version)<9){var c=function(a){var b=a,c=b.offsetLeft,d=b.offsetTop;while(b.offsetParent){b=b.offsetParent;if(b!=document.body&&b.currentStyle["position"]!="static")break;b!=document.body&&b!=document.documentElement&&(c-=b.scrollLeft,d-=b.scrollTop),c+=b.offsetLeft,d+=b.offsetTop}return{x:c,y:d}},d=function(a){if(a.currentStyle["position"]!="static")return;var b=c(a);a.style.position="absolute",a.style.left=b.x+"px",a.style.top=b.y+"px"},e=function(a,b){var c,e=1,f=1,g=1,h=1;if(typeof a.style["msTransform"]!="undefined")return!0;d(a),c=b.match(/rotate\((.*?)\)/);var i=c&&c[1]?parseInt(c[1]):0;i%=360,i<0&&(i=360+i);var j=i*Math.PI/180,k=Math.cos(j),l=Math.sin(j);e*=k,f*=-l,g*=l,h*=k,a.style.filter=(a.style.filter||"").replace(/progid:DXImageTransform\.Microsoft\.Matrix\([^)]*\)/,"")+("progid:DXImageTransform.Microsoft.Matrix(M11="+e+",M12="+f+",M21="+g+",M22="+h+",FilterType='bilinear',sizingMethod='auto expand')");var m=parseInt(a.style.width||a.width||0),n=parseInt(a.style.height||a.height||0),j=i*Math.PI/180,o=Math.abs(Math.cos(j)),p=Math.abs(Math.sin(j)),q=(m-(m*o+n*p))/2,r=(n-(m*p+n*o))/2;return a.style.marginLeft=Math.floor(q)+"px",a.style.marginTop=Math.floor(r)+"px",!0},f=a.cssHooks.transform.set;a.cssHooks.transform.set=function(a,b){return f.apply(this,[a,b]),e(a,b),b}}}(jQuery),elFinder.prototype.commands.rm=function(){this.shortcuts=[{pattern:"delete ctrl+backspace"}],this.getstate=function(b){var c=this.fm;return b=b||c.selected(),!this._disabled&&b.length&&a.map(b,function(a){var b=c.file(a);return b&&b.phash&&!b.locked?a:null}).length==b.length?0:-1},this.exec=function(b){var c=this,d=this.fm,e=a.Deferred().fail(function(a){a&&d.error(a)}),f=this.files(b),g=f.length,h=d.cwd().hash,i=!1;return!g||this._disabled?e.reject():(a.each(f,function(a,b){if(!b.phash)return!e.reject(["errRm",b.name,"errPerm"]);if(b.locked)return!e.reject(["errLocked",b.name]);b.hash==h&&(i=d.root(b.hash))}),e.isRejected()||(f=this.hashes(b),d.confirm({title:c.title,text:"confirmRm",accept:{label:"btnRm",callback:function(){d.lockfiles({files:f}),d.request({data:{cmd:"rm",targets:f},notify:{type:"rm",cnt:g},preventFail:!0}).fail(function(a){e.reject(a)}).done(function(a){e.done(a),i&&d.exec("open",i)}).always(function(){d.unlockfiles({files:f})})}},cancel:{label:"btnCancel",callback:function(){e.reject()}}})),e)}},elFinder.prototype.commands.search=function(){this.title="Find files",this.options={ui:"searchbutton"},this.alwaysEnabled=!0,this.updateOnSelect=!1,this.getstate=function(){return 0},this.exec=function(b){var c=this.fm;return typeof b=="string"&&b?(c.trigger("searchstart",{query:b}),c.request({data:{cmd:"search",q:b},notify:{type:"search",cnt:1,hideCnt:!0}})):(c.getUI("toolbar").find("."+c.res("class","searchbtn")+" :text").focus(),a.Deferred().reject())}},elFinder.prototype.commands.sort=function(){var b=
this,c=["nameDirsFirst","kindDirsFirst","sizeDirsFirst","dateDirsFirst","name","kind","size","date"],d;this.options={ui:"sortbutton"},this.value=1,this.variants=[];for(d=0;d<c.length;d++)this.variants.push([c[d],this.fm.i18n("sort"+c[d])]);this.disableOnSearch=!0,this.fm.bind("load sortchange",function(){b.value=c[b.fm.sort-1],b.change()}),this.getstate=function(){return 0},this.exec=function(b,d){var e=a.inArray(d,c)+1==this.fm.sort?this.fm.sortDirect=="asc"?"desc":"asc":this.fm.sortDirect;this.fm.setSort(d,e)}},elFinder.prototype.commands.up=function(){this.alwaysEnabled=!0,this.updateOnSelect=!1,this.shortcuts=[{pattern:"ctrl+up"}],this.getstate=function(){return this.fm.cwd().phash?0:-1},this.exec=function(){return this.fm.cwd().phash?this.fm.exec("open",this.fm.cwd().phash):a.Deferred().reject()}},elFinder.prototype.commands.upload=function(){var b=this.fm.res("class","hover");this.disableOnSearch=!0,this.updateOnSelect=!1,this.shortcuts=[{pattern:"ctrl+u"}],this.getstate=function(){return!this._disabled&&this.fm.cwd().write?0:-1},this.exec=function(c){var d=this.fm,e=function(a){g.elfinderdialog("close"),d.upload(a).fail(function(a){f.reject(a)}).done(function(a){f.resolve(a)})},f,g,h,i,j;return this.disabled()?a.Deferred().reject():c&&(c.input||c.files)?d.upload(c):(f=a.Deferred(),h=a('<input type="file" multiple="true"/>').change(function(){e({input:h[0]})}),i=a('<div class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">'+d.i18n("selectForUpload")+"</span></div>").append(a("<form/>").append(h)).hover(function(){i.toggleClass(b)}),g=a('<div class="elfinder-upload-dialog-wrapper"/>').append(i),d.dragUpload&&(j=a('<div class="ui-corner-all elfinder-upload-dropbox">'+d.i18n("dropFiles")+"</div>").prependTo(g).after('<div class="elfinder-upload-dialog-or">'+d.i18n("or")+"</div>")[0],j.addEventListener("dragenter",function(c){c.stopPropagation(),c.preventDefault(),a(j).addClass(b)},!1),j.addEventListener("dragleave",function(c){c.stopPropagation(),c.preventDefault(),a(j).removeClass(b)},!1),j.addEventListener("dragover",function(a){a.stopPropagation(),a.preventDefault()},!1),j.addEventListener("drop",function(a){a.stopPropagation(),a.preventDefault(),e({files:a.dataTransfer.files})},!1)),d.dialog(g,{title:this.title,modal:!0,resizable:!1,destroyOnClose:!0}),f)}},elFinder.prototype.commands.view=function(){this.value=this.fm.storage("view"),this.alwaysEnabled=!0,this.updateOnSelect=!1,this.options={ui:"viewbutton"},this.getstate=function(){return 0},this.exec=function(){var a=this.fm.storage("view",this.value=="list"?"icons":"list");this.fm.viewchange(),this.update(void 0,a)}}})(jQuery)
/*!
 * jQuery Raty - A Star Rating Plugin
 *
 * Licensed under The MIT License
 *
 * @version        2.4.5
 * @author         Washington Botelho
 * @documentation  wbotelhos.com/raty
 * 
 */

;(function(b){var a={init:function(c){return this.each(function(){var d=this,h=b(d).empty();d.opt=b.extend(true,{},b.fn.raty.defaults,c);h.data("settings",d.opt);d.opt.number=a.between(d.opt.number,0,20);if(d.opt.path.substring(d.opt.path.length-1,d.opt.path.length)!="/"){d.opt.path+="/";}if(typeof d.opt.score=="function"){d.opt.score=d.opt.score.call(d);}if(d.opt.score){d.opt.score=a.between(d.opt.score,0,d.opt.number);}for(var e=1;e<=d.opt.number;e++){b("<img />",{src:d.opt.path+((!d.opt.score||d.opt.score<e)?d.opt.starOff:d.opt.starOn),alt:e,title:(e<=d.opt.hints.length&&d.opt.hints[e-1]!==null)?d.opt.hints[e-1]:e}).appendTo(d);if(d.opt.space){h.append((e<d.opt.number)?"&#160;":"");}}d.stars=h.children('img:not(".raty-cancel")');d.score=b("<input />",{type:"hidden",name:d.opt.scoreName}).appendTo(d);if(d.opt.score&&d.opt.score>0){d.score.val(d.opt.score);a.roundStar.call(d,d.opt.score);}if(d.opt.iconRange){a.fill.call(d,d.opt.score);}a.setTarget.call(d,d.opt.score,d.opt.targetKeep);var g=d.opt.space?4:0,f=d.opt.width||(d.opt.number*d.opt.size+d.opt.number*g);if(d.opt.cancel){d.cancel=b("<img />",{src:d.opt.path+d.opt.cancelOff,alt:"x",title:d.opt.cancelHint,"class":"raty-cancel"});if(d.opt.cancelPlace=="left"){h.prepend("&#160;").prepend(d.cancel);}else{h.append("&#160;").append(d.cancel);}f+=(d.opt.size+g);}if(d.opt.readOnly){a.fixHint.call(d);if(d.cancel){d.cancel.hide();}}else{h.css("cursor","pointer");a.bindAction.call(d);}h.css("width",f);});},between:function(e,d,c){return Math.min(Math.max(parseFloat(e),d),c);},bindAction:function(){var c=this,e=b(c);e.mouseleave(function(){var f=c.score.val()||undefined;a.initialize.call(c,f);a.setTarget.call(c,f,c.opt.targetKeep);if(c.opt.mouseover){c.opt.mouseover.call(c,f);}});var d=c.opt.half?"mousemove":"mouseover";if(c.opt.cancel){c.cancel.mouseenter(function(){b(this).attr("src",c.opt.path+c.opt.cancelOn);c.stars.attr("src",c.opt.path+c.opt.starOff);a.setTarget.call(c,null,true);if(c.opt.mouseover){c.opt.mouseover.call(c,null);}}).mouseleave(function(){b(this).attr("src",c.opt.path+c.opt.cancelOff);if(c.opt.mouseover){c.opt.mouseover.call(c,c.score.val()||null);}}).click(function(f){c.score.removeAttr("value");if(c.opt.click){c.opt.click.call(c,null,f);}});}c.stars.bind(d,function(g){var h=parseInt(this.alt,10);if(c.opt.half){var f=parseFloat((g.pageX-b(this).offset().left)/c.opt.size),i=(f>0.5)?1:0.5;h=parseFloat(this.alt)-1+i;a.fill.call(c,h);if(c.opt.precision){h=h-i+f;}a.showHalf.call(c,h);}else{a.fill.call(c,h);}e.data("score",h);a.setTarget.call(c,h,true);if(c.opt.mouseover){c.opt.mouseover.call(c,h,g);}}).click(function(f){c.score.val((c.opt.half||c.opt.precision)?e.data("score"):this.alt);if(c.opt.click){c.opt.click.call(c,c.score.val(),f);}});},cancel:function(c){return b(this).each(function(){var d=this,e=b(d);if(e.data("readonly")===true){return this;}if(c){a.click.call(d,null);}else{a.score.call(d,null);}d.score.removeAttr("value");});},click:function(c){return b(this).each(function(){if(b(this).data("readonly")===true){return this;}a.initialize.call(this,c);if(this.opt.click){this.opt.click.call(this,c);}else{a.error.call(this,'you must add the "click: function(score, evt) { }" callback.');}a.setTarget.call(this,c,true);});},error:function(c){b(this).html(c);b.error(c);},fill:function(k){var c=this,h=c.stars.length,g=0,d,j,f;for(var e=1;e<=h;e++){d=c.stars.eq(e-1);if(c.opt.iconRange&&c.opt.iconRange.length>g){j=c.opt.iconRange[g];if(c.opt.single){f=(e==k)?(j.on||c.opt.starOn):(j.off||c.opt.starOff);}else{f=(e<=k)?(j.on||c.opt.starOn):(j.off||c.opt.starOff);}if(e<=j.range){d.attr("src",c.opt.path+f);}if(e==j.range){g++;}}else{if(c.opt.single){f=(e==k)?c.opt.starOn:c.opt.starOff;}else{f=(e<=k)?c.opt.starOn:c.opt.starOff;}d.attr("src",c.opt.path+f);}}},fixHint:function(){var c=b(this),e=parseInt(this.score.val(),10),d=this.opt.noRatedMsg;if(!isNaN(e)&&e>0){d=(e<=this.opt.hints.length&&this.opt.hints[e-1]!==null)?this.opt.hints[e-1]:e;}c.data("readonly",true).css("cursor","default").attr("title",d);this.score.attr("readonly","readonly");this.stars.attr("title",d);},getScore:function(){var d=[],c;b(this).each(function(){c=this.score.val();d.push(c?parseFloat(c):undefined);});return(d.length>1)?d:d[0];},readOnly:function(c){return this.each(function(){var d=b(this);if(d.data("readonly")===c){return this;}if(this.cancel){if(c){this.cancel.hide();}else{this.cancel.show();}}if(c){d.unbind();d.children("img").unbind();a.fixHint.call(this);}else{a.bindAction.call(this);a.unfixHint.call(this);}d.data("readonly",c);});},reload:function(){return a.set.call(this,{});},roundStar:function(e){var d=(e-Math.floor(e)).toFixed(2);if(d>this.opt.round.down){var c=this.opt.starOn;if(d<this.opt.round.up&&this.opt.halfShow){c=this.opt.starHalf;}else{if(d<this.opt.round.full){c=this.opt.starOff;}}this.stars.eq(Math.ceil(e)-1).attr("src",this.opt.path+c);}},score:function(){return arguments.length?a.setScore.apply(this,arguments):a.getScore.call(this);},set:function(c){this.each(function(){var d=b(this),f=d.data("settings"),e=d.clone().removeAttr("style").insertBefore(d);d.remove();e.raty(b.extend(f,c));});return b(this.selector);},setScore:function(c){return b(this).each(function(){if(b(this).data("readonly")===true){return this;}a.initialize.call(this,c);a.setTarget.call(this,c,true);});},setTarget:function(e,d){if(this.opt.target){var c=b(this.opt.target);if(c.length==0){a.error.call(this,"target selector invalid or missing!");}var f=e;if(!d||f===undefined){f=this.opt.targetText;}else{if(this.opt.targetType=="hint"){f=(f===null&&this.opt.cancel)?this.opt.cancelHint:this.opt.hints[Math.ceil(f-1)];}else{f=this.opt.precision?parseFloat(f).toFixed(1):parseInt(f,10);}}if(this.opt.targetFormat.indexOf("{score}")<0){a.error.call(this,'template "{score}" missing!');}if(e!==null){f=this.opt.targetFormat.toString().replace("{score}",f);}if(c.is(":input")){c.val(f);}else{c.html(f);}}},showHalf:function(d){var c=(d-Math.floor(d)).toFixed(1);if(c>0&&c<0.6){this.stars.eq(Math.ceil(d)-1).attr("src",this.opt.path+this.opt.starHalf);}},initialize:function(c){c=!c?0:a.between(c,0,this.opt.number);a.fill.call(this,c);if(c>0){if(this.opt.halfShow){a.roundStar.call(this,c);}this.score.val(c);}},unfixHint:function(){for(var c=0;c<this.opt.number;c++){this.stars.eq(c).attr("title",(c<this.opt.hints.length&&this.opt.hints[c]!==null)?this.opt.hints[c]:c);}b(this).data("readonly",false).css("cursor","pointer").removeAttr("title");this.score.attr("readonly","readonly");}};b.fn.raty=function(c){if(a[c]){return a[c].apply(this,Array.prototype.slice.call(arguments,1));}else{if(typeof c==="object"||!c){return a.init.apply(this,arguments);}else{b.error("Method "+c+" does not exist!");}}};b.fn.raty.defaults={cancel:false,cancelHint:"cancel this rating!",cancelOff:"cancel-off.png",cancelOn:"cancel-on.png",cancelPlace:"left",click:undefined,half:false,halfShow:true,hints:["bad","poor","regular","good","gorgeous"],iconRange:undefined,mouseover:undefined,noRatedMsg:"not rated yet",number:5,path:"img/",precision:false,round:{down:0.25,full:0.6,up:0.76},readOnly:false,score:undefined,scoreName:"score",single:false,size:16,space:true,starHalf:"star-half.png",starOff:"star-off.png",starOn:"star-on.png",target:undefined,targetFormat:"{score}",targetKeep:false,targetText:"",targetType:"hint",width:undefined};})(jQuery);

(function() {
  var iOSCheckbox;
  var __slice = Array.prototype.slice;
  iOSCheckbox = (function() {
    function iOSCheckbox(elem, options) {
      var key, opts, value;
      this.elem = $(elem);
      opts = $.extend({}, iOSCheckbox.defaults, options);
      for (key in opts) {
        value = opts[key];
        this[key] = value;
      }
      this.elem.data(this.dataName, this);
      this.wrapCheckboxWithDivs();
      this.attachEvents();
      this.disableTextSelection();
      if (this.resizeHandle) {
        this.optionallyResize('handle');
      }
      if (this.resizeContainer) {
        this.optionallyResize('container');
      }
      this.initialPosition();
    }
    iOSCheckbox.prototype.isDisabled = function() {
      return this.elem.is(':disabled');
    };
    iOSCheckbox.prototype.wrapCheckboxWithDivs = function() {
      this.elem.wrap("<div class='" + this.containerClass + "' />");
      this.container = this.elem.parent();
      this.offLabel = $("<label class='" + this.labelOffClass + "'>\n  <span>" + this.uncheckedLabel + "</span>\n</label>").appendTo(this.container);
      this.offSpan = this.offLabel.children('span');
      this.onLabel = $("<label class='" + this.labelOnClass + "'>\n  <span>" + this.checkedLabel + "</span>\n</label>").appendTo(this.container);
      this.onSpan = this.onLabel.children('span');
      return this.handle = $("<div class='" + this.handleClass + "'>\n  <div class='" + this.handleRightClass + "'>\n    <div class='" + this.handleCenterClass + "' />\n  </div>\n</div>").appendTo(this.container);
    };
    iOSCheckbox.prototype.disableTextSelection = function() {
      if ($.browser.msie) {
        return $([this.handle, this.offLabel, this.onLabel, this.container]).attr("unselectable", "on");
      }
    };
    iOSCheckbox.prototype._getDimension = function(elem, dimension) {
      if ($.fn.actual != null) {
        return elem.actual(dimension);
      } else {
        return elem[dimension]();
      }
    };
    iOSCheckbox.prototype.optionallyResize = function(mode) {
      var newWidth, offLabelWidth, onLabelWidth;
      onLabelWidth = this._getDimension(this.onLabel, "width");
      offLabelWidth = this._getDimension(this.offLabel, "width");
      if (mode === "container") {
        newWidth = onLabelWidth > offLabelWidth ? onLabelWidth : offLabelWidth;
        newWidth += this._getDimension(this.handle, "width") + this.handleMargin;
        return this.container.css({
          width: newWidth
        });
      } else {
        newWidth = onLabelWidth > offLabelWidth ? onLabelWidth : offLabelWidth;
        return this.handle.css({
          width: newWidth
        });
      }
    };
    iOSCheckbox.prototype.onMouseDown = function(event) {
      var x;
      event.preventDefault();
      if (this.isDisabled()) {
        return;
      }
      x = event.pageX || event.originalEvent.changedTouches[0].pageX;
      iOSCheckbox.currentlyClicking = this.handle;
      iOSCheckbox.dragStartPosition = x;
      return iOSCheckbox.handleLeftOffset = parseInt(this.handle.css('left'), 10) || 0;
    };
    iOSCheckbox.prototype.onDragMove = function(event, x) {
      var newWidth, p;
      if (iOSCheckbox.currentlyClicking !== this.handle) {
        return;
      }
      p = (x + iOSCheckbox.handleLeftOffset - iOSCheckbox.dragStartPosition) / this.rightSide;
      if (p < 0) {
        p = 0;
      }
      if (p > 1) {
        p = 1;
      }
      newWidth = p * this.rightSide;
      this.handle.css({
        left: newWidth
      });
      this.onLabel.css({
        width: newWidth + this.handleRadius
      });
      this.offSpan.css({
        marginRight: -newWidth
      });
      return this.onSpan.css({
        marginLeft: -(1 - p) * this.rightSide
      });
    };
    iOSCheckbox.prototype.onDragEnd = function(event, x) {
      var p;
      if (iOSCheckbox.currentlyClicking !== this.handle) {
        return;
      }
      if (this.isDisabled()) {
        return;
      }
      if (iOSCheckbox.dragging) {
        p = (x - iOSCheckbox.dragStartPosition) / this.rightSide;
        this.elem.prop('checked', p >= 0.5);
      } else {
        this.elem.prop('checked', !this.elem.prop('checked'));
      }
      iOSCheckbox.currentlyClicking = null;
      iOSCheckbox.dragging = null;
      return this.didChange();
    };
    iOSCheckbox.prototype.refresh = function() {
      return this.didChange();
    };
    iOSCheckbox.prototype.didChange = function() {
      var new_left;
      if (typeof this.onChange === "function") {
        this.onChange(this.elem, this.elem.prop('checked'));
      }
      if (this.isDisabled()) {
        this.container.addClass(this.disabledClass);
        return false;
      } else {
        this.container.removeClass(this.disabledClass);
      }
      new_left = this.elem.prop('checked') ? this.rightSide : 0;
      this.handle.animate({
        left: new_left
      }, this.duration);
      this.onLabel.animate({
        width: new_left + this.handleRadius
      }, this.duration);
      this.offSpan.animate({
        marginRight: -new_left
      }, this.duration);
      return this.onSpan.animate({
        marginLeft: new_left - this.rightSide
      }, this.duration);
    };
    iOSCheckbox.prototype.attachEvents = function() {
      var localMouseMove, localMouseUp, self;
      self = this;
      localMouseMove = function(event) {
        return self.onGlobalMove.apply(self, arguments);
      };
      localMouseUp = function(event) {
        self.onGlobalUp.apply(self, arguments);
        $(document).unbind('mousemove touchmove', localMouseMove);
        return $(document).unbind('mouseup touchend', localMouseUp);
      };
      this.elem.change(function() {
        return self.refresh();
      });
      return this.container.bind('mousedown touchstart', function(event) {
        self.onMouseDown.apply(self, arguments);
        $(document).bind('mousemove touchmove', localMouseMove);
        return $(document).bind('mouseup touchend', localMouseUp);
      });
    };
    iOSCheckbox.prototype.initialPosition = function() {
      var containerWidth, offset;
      containerWidth = this._getDimension(this.container, "width");
      this.offLabel.css({
        width: containerWidth - this.containerRadius
      });
      offset = this.containerRadius + 1;
      if ($.browser.msie && $.browser.version < 7) {
        offset -= 3;
      }
      this.rightSide = containerWidth - this._getDimension(this.handle, "width") - offset;
      if (this.elem.is(':checked')) {
        this.handle.css({
          left: this.rightSide
        });
        this.onLabel.css({
          width: this.rightSide + this.handleRadius
        });
        this.offSpan.css({
          marginRight: -this.rightSide
        });
      } else {
        this.onLabel.css({
          width: 0
        });
        this.onSpan.css({
          marginLeft: -this.rightSide
        });
      }
      if (this.isDisabled()) {
        return this.container.addClass(this.disabledClass);
      }
    };
    iOSCheckbox.prototype.onGlobalMove = function(event) {
      var x;
      if (!(!this.isDisabled() && iOSCheckbox.currentlyClicking)) {
        return;
      }
      event.preventDefault();
      x = event.pageX || event.originalEvent.changedTouches[0].pageX;
      if (!iOSCheckbox.dragging && (Math.abs(iOSCheckbox.dragStartPosition - x) > this.dragThreshold)) {
        iOSCheckbox.dragging = true;
      }
      return this.onDragMove(event, x);
    };
    iOSCheckbox.prototype.onGlobalUp = function(event) {
      var x;
      if (!iOSCheckbox.currentlyClicking) {
        return;
      }
      event.preventDefault();
      x = event.pageX || event.originalEvent.changedTouches[0].pageX;
      this.onDragEnd(event, x);
      return false;
    };
    iOSCheckbox.defaults = {
      duration: 200,
      checkedLabel: 'ON',
      uncheckedLabel: 'OFF',
      resizeHandle: true,
      resizeContainer: true,
      disabledClass: 'iPhoneCheckDisabled',
      containerClass: 'iPhoneCheckContainer',
      labelOnClass: 'iPhoneCheckLabelOn',
      labelOffClass: 'iPhoneCheckLabelOff',
      handleClass: 'iPhoneCheckHandle',
      handleCenterClass: 'iPhoneCheckHandleCenter',
      handleRightClass: 'iPhoneCheckHandleRight',
      dragThreshold: 5,
      handleMargin: 15,
      handleRadius: 4,
      containerRadius: 5,
      dataName: "iphoneStyle",
      onChange: function() {}
    };
    return iOSCheckbox;
  })();
  $.iphoneStyle = this.iOSCheckbox = iOSCheckbox;
  $.fn.iphoneStyle = function() {
    var args, checkbox, dataName, existingControl, method, params, _i, _len, _ref, _ref2, _ref3, _ref4;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    dataName = (_ref = (_ref2 = args[0]) != null ? _ref2.dataName : void 0) != null ? _ref : iOSCheckbox.defaults.dataName;
    _ref3 = this.filter(':checkbox');
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      checkbox = _ref3[_i];
      existingControl = $(checkbox).data(dataName);
      if (existingControl != null) {
        method = args[0], params = 2 <= args.length ? __slice.call(args, 1) : [];
        if ((_ref4 = existingControl[method]) != null) {
          _ref4.apply(existingControl, params);
        }
      } else {
        new iOSCheckbox(checkbox, args[0]);
      }
    }
    return this;
  };
  $.fn.iOSCheckbox = function(options) {
    var opts;
    if (options == null) {
      options = {};
    }
    opts = $.extend({}, options, {
      resizeHandle: false,
      disabledClass: 'iOSCheckDisabled',
      containerClass: 'iOSCheckContainer',
      labelOnClass: 'iOSCheckLabelOn',
      labelOffClass: 'iOSCheckLabelOff',
      handleClass: 'iOSCheckHandle',
      handleCenterClass: 'iOSCheckHandleCenter',
      handleRightClass: 'iOSCheckHandleRight',
      dataName: 'iOSCheckbox'
    });
    return this.iphoneStyle(opts);
  };
}).call(this);

(function($)
{
    /**
     * Auto-growing textareas; technique ripped from Facebook
     *
     * http://github.com/jaz303/jquery-grab-bag/tree/master/javascripts/jquery.autogrow-textarea.js
     */
    $.fn.autogrow = function(options)
    {
        return this.filter('textarea').each(function()
        {
            var self                                = this;
            var $self                               = $(self);
            var minHeight                           = $self.height();
            var noFlickerPad                        = $self.hasClass('autogrow-short') ? 0 : parseInt($self.css('lineHeight'));

            var shadow = $('<div></div>').css({
                position:   'absolute',
                top:        -10000,
                left:       -10000,
                width:      $self.width(),
                fontSize:   $self.css('fontSize'),
                fontFamily: $self.css('fontFamily'),
                fontWeight: $self.css('fontWeight'),
                lineHeight: $self.css('lineHeight'),
                resize:     'none'
            }).appendTo(document.body);

            var update = function()
            {
                var times = function(string, number)
                {
                    for (var i=0, r=''; i<number; i++) r += string;
                    return r;
                };

                var val = self.value.replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/&/g, '&amp;')
                                    .replace(/\n$/, '<br/>&nbsp;')
                                    .replace(/\n/g, '<br/>')
                                    .replace(/ {2,}/g, function(space){ return times('&nbsp;', space.length - 1) + ' ' });

                shadow.css('width', $self.width());
                shadow.html(val);
                $self.css('height', Math.max(shadow.height() + noFlickerPad, minHeight));
            }

            $self.change(update).keyup(update).keydown(update);
            $(window).resize(update);

            update();
        });
    };
})(jQuery);

/*
Uploadify v3.1.1
Copyright (c) 2012 Reactive Apps, Ronnie Garcia
Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>

SWFUpload: http://www.swfupload.org, http://swfupload.googlecode.com
mmSWFUpload 1.0: Flash upload dialog - http://profandesign.se/swfupload/,  http://www.vinterwebb.se/
SWFUpload is (c) 2006-2007 Lars Huring, Olov Nilzén and Mammon Media and is released under the MIT License:
http://www.opensource.org/licenses/mit-license.php
SWFUpload 2 is (c) 2007-2008 Jake Roberts and is released under the MIT License:
http://www.opensource.org/licenses/mit-license.php

SWFObject v2.2 <http://code.google.com/p/swfobject/> 
is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
;var swfobject=function(){var aq="undefined",aD="object",ab="Shockwave Flash",X="ShockwaveFlash.ShockwaveFlash",aE="application/x-shockwave-flash",ac="SWFObjectExprInst",ax="onreadystatechange",af=window,aL=document,aB=navigator,aa=false,Z=[aN],aG=[],ag=[],al=[],aJ,ad,ap,at,ak=false,aU=false,aH,an,aI=true,ah=function(){var a=typeof aL.getElementById!=aq&&typeof aL.getElementsByTagName!=aq&&typeof aL.createElement!=aq,e=aB.userAgent.toLowerCase(),c=aB.platform.toLowerCase(),h=c?/win/.test(c):/win/.test(e),j=c?/mac/.test(c):/mac/.test(e),g=/webkit/.test(e)?parseFloat(e.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,d=!+"\v1",f=[0,0,0],k=null;if(typeof aB.plugins!=aq&&typeof aB.plugins[ab]==aD){k=aB.plugins[ab].description;if(k&&!(typeof aB.mimeTypes!=aq&&aB.mimeTypes[aE]&&!aB.mimeTypes[aE].enabledPlugin)){aa=true;d=false;k=k.replace(/^.*\s+(\S+\s+\S+$)/,"$1");f[0]=parseInt(k.replace(/^(.*)\..*$/,"$1"),10);f[1]=parseInt(k.replace(/^.*\.(.*)\s.*$/,"$1"),10);f[2]=/[a-zA-Z]/.test(k)?parseInt(k.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0;}}else{if(typeof af.ActiveXObject!=aq){try{var i=new ActiveXObject(X);if(i){k=i.GetVariable("$version");if(k){d=true;k=k.split(" ")[1].split(",");f=[parseInt(k[0],10),parseInt(k[1],10),parseInt(k[2],10)];}}}catch(b){}}}return{w3:a,pv:f,wk:g,ie:d,win:h,mac:j};}(),aK=function(){if(!ah.w3){return;}if((typeof aL.readyState!=aq&&aL.readyState=="complete")||(typeof aL.readyState==aq&&(aL.getElementsByTagName("body")[0]||aL.body))){aP();}if(!ak){if(typeof aL.addEventListener!=aq){aL.addEventListener("DOMContentLoaded",aP,false);}if(ah.ie&&ah.win){aL.attachEvent(ax,function(){if(aL.readyState=="complete"){aL.detachEvent(ax,arguments.callee);aP();}});if(af==top){(function(){if(ak){return;}try{aL.documentElement.doScroll("left");}catch(a){setTimeout(arguments.callee,0);return;}aP();})();}}if(ah.wk){(function(){if(ak){return;}if(!/loaded|complete/.test(aL.readyState)){setTimeout(arguments.callee,0);return;}aP();})();}aC(aP);}}();function aP(){if(ak){return;}try{var b=aL.getElementsByTagName("body")[0].appendChild(ar("span"));b.parentNode.removeChild(b);}catch(a){return;}ak=true;var d=Z.length;for(var c=0;c<d;c++){Z[c]();}}function aj(a){if(ak){a();}else{Z[Z.length]=a;}}function aC(a){if(typeof af.addEventListener!=aq){af.addEventListener("load",a,false);}else{if(typeof aL.addEventListener!=aq){aL.addEventListener("load",a,false);}else{if(typeof af.attachEvent!=aq){aM(af,"onload",a);}else{if(typeof af.onload=="function"){var b=af.onload;af.onload=function(){b();a();};}else{af.onload=a;}}}}}function aN(){if(aa){Y();}else{am();}}function Y(){var d=aL.getElementsByTagName("body")[0];var b=ar(aD);b.setAttribute("type",aE);var a=d.appendChild(b);if(a){var c=0;(function(){if(typeof a.GetVariable!=aq){var e=a.GetVariable("$version");if(e){e=e.split(" ")[1].split(",");ah.pv=[parseInt(e[0],10),parseInt(e[1],10),parseInt(e[2],10)];}}else{if(c<10){c++;setTimeout(arguments.callee,10);return;}}d.removeChild(b);a=null;am();})();}else{am();}}function am(){var g=aG.length;if(g>0){for(var h=0;h<g;h++){var c=aG[h].id;var l=aG[h].callbackFn;var a={success:false,id:c};if(ah.pv[0]>0){var i=aS(c);if(i){if(ao(aG[h].swfVersion)&&!(ah.wk&&ah.wk<312)){ay(c,true);if(l){a.success=true;a.ref=av(c);l(a);}}else{if(aG[h].expressInstall&&au()){var e={};e.data=aG[h].expressInstall;e.width=i.getAttribute("width")||"0";e.height=i.getAttribute("height")||"0";if(i.getAttribute("class")){e.styleclass=i.getAttribute("class");}if(i.getAttribute("align")){e.align=i.getAttribute("align");}var f={};var d=i.getElementsByTagName("param");var k=d.length;for(var j=0;j<k;j++){if(d[j].getAttribute("name").toLowerCase()!="movie"){f[d[j].getAttribute("name")]=d[j].getAttribute("value");}}ae(e,f,c,l);}else{aF(i);if(l){l(a);}}}}}else{ay(c,true);if(l){var b=av(c);if(b&&typeof b.SetVariable!=aq){a.success=true;a.ref=b;}l(a);}}}}}function av(b){var d=null;var c=aS(b);if(c&&c.nodeName=="OBJECT"){if(typeof c.SetVariable!=aq){d=c;}else{var a=c.getElementsByTagName(aD)[0];if(a){d=a;}}}return d;}function au(){return !aU&&ao("6.0.65")&&(ah.win||ah.mac)&&!(ah.wk&&ah.wk<312);}function ae(f,d,h,e){aU=true;ap=e||null;at={success:false,id:h};var a=aS(h);if(a){if(a.nodeName=="OBJECT"){aJ=aO(a);ad=null;}else{aJ=a;ad=h;}f.id=ac;if(typeof f.width==aq||(!/%$/.test(f.width)&&parseInt(f.width,10)<310)){f.width="310";}if(typeof f.height==aq||(!/%$/.test(f.height)&&parseInt(f.height,10)<137)){f.height="137";}aL.title=aL.title.slice(0,47)+" - Flash Player Installation";var b=ah.ie&&ah.win?"ActiveX":"PlugIn",c="MMredirectURL="+af.location.toString().replace(/&/g,"%26")+"&MMplayerType="+b+"&MMdoctitle="+aL.title;if(typeof d.flashvars!=aq){d.flashvars+="&"+c;}else{d.flashvars=c;}if(ah.ie&&ah.win&&a.readyState!=4){var g=ar("div");h+="SWFObjectNew";g.setAttribute("id",h);a.parentNode.insertBefore(g,a);a.style.display="none";(function(){if(a.readyState==4){a.parentNode.removeChild(a);}else{setTimeout(arguments.callee,10);}})();}aA(f,d,h);}}function aF(a){if(ah.ie&&ah.win&&a.readyState!=4){var b=ar("div");a.parentNode.insertBefore(b,a);b.parentNode.replaceChild(aO(a),b);a.style.display="none";(function(){if(a.readyState==4){a.parentNode.removeChild(a);}else{setTimeout(arguments.callee,10);}})();}else{a.parentNode.replaceChild(aO(a),a);}}function aO(b){var d=ar("div");if(ah.win&&ah.ie){d.innerHTML=b.innerHTML;}else{var e=b.getElementsByTagName(aD)[0];if(e){var a=e.childNodes;if(a){var f=a.length;for(var c=0;c<f;c++){if(!(a[c].nodeType==1&&a[c].nodeName=="PARAM")&&!(a[c].nodeType==8)){d.appendChild(a[c].cloneNode(true));}}}}}return d;}function aA(e,g,c){var d,a=aS(c);if(ah.wk&&ah.wk<312){return d;}if(a){if(typeof e.id==aq){e.id=c;}if(ah.ie&&ah.win){var f="";for(var i in e){if(e[i]!=Object.prototype[i]){if(i.toLowerCase()=="data"){g.movie=e[i];}else{if(i.toLowerCase()=="styleclass"){f+=' class="'+e[i]+'"';}else{if(i.toLowerCase()!="classid"){f+=" "+i+'="'+e[i]+'"';}}}}}var h="";for(var j in g){if(g[j]!=Object.prototype[j]){h+='<param name="'+j+'" value="'+g[j]+'" />';}}a.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+f+">"+h+"</object>";ag[ag.length]=e.id;d=aS(e.id);}else{var b=ar(aD);b.setAttribute("type",aE);for(var k in e){if(e[k]!=Object.prototype[k]){if(k.toLowerCase()=="styleclass"){b.setAttribute("class",e[k]);}else{if(k.toLowerCase()!="classid"){b.setAttribute(k,e[k]);}}}}for(var l in g){if(g[l]!=Object.prototype[l]&&l.toLowerCase()!="movie"){aQ(b,l,g[l]);}}a.parentNode.replaceChild(b,a);d=b;}}return d;}function aQ(b,d,c){var a=ar("param");a.setAttribute("name",d);a.setAttribute("value",c);b.appendChild(a);}function aw(a){var b=aS(a);if(b&&b.nodeName=="OBJECT"){if(ah.ie&&ah.win){b.style.display="none";(function(){if(b.readyState==4){aT(a);}else{setTimeout(arguments.callee,10);}})();}else{b.parentNode.removeChild(b);}}}function aT(a){var b=aS(a);if(b){for(var c in b){if(typeof b[c]=="function"){b[c]=null;}}b.parentNode.removeChild(b);}}function aS(a){var c=null;try{c=aL.getElementById(a);}catch(b){}return c;}function ar(a){return aL.createElement(a);}function aM(a,c,b){a.attachEvent(c,b);al[al.length]=[a,c,b];}function ao(a){var b=ah.pv,c=a.split(".");c[0]=parseInt(c[0],10);c[1]=parseInt(c[1],10)||0;c[2]=parseInt(c[2],10)||0;return(b[0]>c[0]||(b[0]==c[0]&&b[1]>c[1])||(b[0]==c[0]&&b[1]==c[1]&&b[2]>=c[2]))?true:false;}function az(b,f,a,c){if(ah.ie&&ah.mac){return;}var e=aL.getElementsByTagName("head")[0];if(!e){return;}var g=(a&&typeof a=="string")?a:"screen";if(c){aH=null;an=null;}if(!aH||an!=g){var d=ar("style");d.setAttribute("type","text/css");d.setAttribute("media",g);aH=e.appendChild(d);if(ah.ie&&ah.win&&typeof aL.styleSheets!=aq&&aL.styleSheets.length>0){aH=aL.styleSheets[aL.styleSheets.length-1];}an=g;}if(ah.ie&&ah.win){if(aH&&typeof aH.addRule==aD){aH.addRule(b,f);}}else{if(aH&&typeof aL.createTextNode!=aq){aH.appendChild(aL.createTextNode(b+" {"+f+"}"));}}}function ay(a,c){if(!aI){return;}var b=c?"visible":"hidden";if(ak&&aS(a)){aS(a).style.visibility=b;}else{az("#"+a,"visibility:"+b);}}function ai(b){var a=/[\\\"<>\.;]/;var c=a.exec(b)!=null;return c&&typeof encodeURIComponent!=aq?encodeURIComponent(b):b;}var aR=function(){if(ah.ie&&ah.win){window.attachEvent("onunload",function(){var a=al.length;for(var b=0;b<a;b++){al[b][0].detachEvent(al[b][1],al[b][2]);}var d=ag.length;for(var c=0;c<d;c++){aw(ag[c]);}for(var e in ah){ah[e]=null;}ah=null;for(var f in swfobject){swfobject[f]=null;}swfobject=null;});}}();return{registerObject:function(a,e,c,b){if(ah.w3&&a&&e){var d={};d.id=a;d.swfVersion=e;d.expressInstall=c;d.callbackFn=b;aG[aG.length]=d;ay(a,false);}else{if(b){b({success:false,id:a});}}},getObjectById:function(a){if(ah.w3){return av(a);}},embedSWF:function(k,e,h,f,c,a,b,i,g,j){var d={success:false,id:e};if(ah.w3&&!(ah.wk&&ah.wk<312)&&k&&e&&h&&f&&c){ay(e,false);aj(function(){h+="";f+="";var q={};if(g&&typeof g===aD){for(var o in g){q[o]=g[o];}}q.data=k;q.width=h;q.height=f;var n={};if(i&&typeof i===aD){for(var p in i){n[p]=i[p];}}if(b&&typeof b===aD){for(var l in b){if(typeof n.flashvars!=aq){n.flashvars+="&"+l+"="+b[l];}else{n.flashvars=l+"="+b[l];}}}if(ao(c)){var m=aA(q,n,e);if(q.id==e){ay(e,true);}d.success=true;d.ref=m;}else{if(a&&au()){q.data=a;ae(q,n,e,j);return;}else{ay(e,true);}}if(j){j(d);}});}else{if(j){j(d);}}},switchOffAutoHideShow:function(){aI=false;},ua:ah,getFlashPlayerVersion:function(){return{major:ah.pv[0],minor:ah.pv[1],release:ah.pv[2]};},hasFlashPlayerVersion:ao,createSWF:function(a,b,c){if(ah.w3){return aA(a,b,c);}else{return undefined;}},showExpressInstall:function(b,a,d,c){if(ah.w3&&au()){ae(b,a,d,c);}},removeSWF:function(a){if(ah.w3){aw(a);}},createCSS:function(b,a,c,d){if(ah.w3){az(b,a,c,d);}},addDomLoadEvent:aj,addLoadEvent:aC,getQueryParamValue:function(b){var a=aL.location.search||aL.location.hash;if(a){if(/\?/.test(a)){a=a.split("?")[1];}if(b==null){return ai(a);}var c=a.split("&");for(var d=0;d<c.length;d++){if(c[d].substring(0,c[d].indexOf("="))==b){return ai(c[d].substring((c[d].indexOf("=")+1)));}}}return"";},expressInstallCallback:function(){if(aU){var a=aS(ac);if(a&&aJ){a.parentNode.replaceChild(aJ,a);if(ad){ay(ad,true);if(ah.ie&&ah.win){aJ.style.display="block";}}if(ap){ap(at);}}aU=false;}}};}();var SWFUpload;if(SWFUpload==undefined){SWFUpload=function(b){this.initSWFUpload(b);};}SWFUpload.prototype.initSWFUpload=function(c){try{this.customSettings={};this.settings=c;this.eventQueue=[];this.movieName="SWFUpload_"+SWFUpload.movieCount++;this.movieElement=null;SWFUpload.instances[this.movieName]=this;this.initSettings();this.loadFlash();this.displayDebugInfo();}catch(d){delete SWFUpload.instances[this.movieName];throw d;}};SWFUpload.instances={};SWFUpload.movieCount=0;SWFUpload.version="2.2.0 2009-03-25";SWFUpload.QUEUE_ERROR={QUEUE_LIMIT_EXCEEDED:-100,FILE_EXCEEDS_SIZE_LIMIT:-110,ZERO_BYTE_FILE:-120,INVALID_FILETYPE:-130};SWFUpload.UPLOAD_ERROR={HTTP_ERROR:-200,MISSING_UPLOAD_URL:-210,IO_ERROR:-220,SECURITY_ERROR:-230,UPLOAD_LIMIT_EXCEEDED:-240,UPLOAD_FAILED:-250,SPECIFIED_FILE_ID_NOT_FOUND:-260,FILE_VALIDATION_FAILED:-270,FILE_CANCELLED:-280,UPLOAD_STOPPED:-290};SWFUpload.FILE_STATUS={QUEUED:-1,IN_PROGRESS:-2,ERROR:-3,COMPLETE:-4,CANCELLED:-5};SWFUpload.BUTTON_ACTION={SELECT_FILE:-100,SELECT_FILES:-110,START_UPLOAD:-120};SWFUpload.CURSOR={ARROW:-1,HAND:-2};SWFUpload.WINDOW_MODE={WINDOW:"window",TRANSPARENT:"transparent",OPAQUE:"opaque"};SWFUpload.completeURL=function(e){if(typeof(e)!=="string"||e.match(/^https?:\/\//i)||e.match(/^\//)){return e;}var f=window.location.protocol+"//"+window.location.hostname+(window.location.port?":"+window.location.port:"");var d=window.location.pathname.lastIndexOf("/");if(d<=0){path="/";}else{path=window.location.pathname.substr(0,d)+"/";}return path+e;};SWFUpload.prototype.initSettings=function(){this.ensureDefault=function(c,d){this.settings[c]=(this.settings[c]==undefined)?d:this.settings[c];};this.ensureDefault("upload_url","");this.ensureDefault("preserve_relative_urls",false);this.ensureDefault("file_post_name","Filedata");this.ensureDefault("post_params",{});this.ensureDefault("use_query_string",false);this.ensureDefault("requeue_on_error",false);this.ensureDefault("http_success",[]);this.ensureDefault("assume_success_timeout",0);this.ensureDefault("file_types","*.*");this.ensureDefault("file_types_description","All Files");this.ensureDefault("file_size_limit",0);this.ensureDefault("file_upload_limit",0);this.ensureDefault("file_queue_limit",0);this.ensureDefault("flash_url","swfupload.swf");this.ensureDefault("prevent_swf_caching",true);this.ensureDefault("button_image_url","");this.ensureDefault("button_width",1);this.ensureDefault("button_height",1);this.ensureDefault("button_text","");this.ensureDefault("button_text_style","color: #000000; font-size: 16pt;");this.ensureDefault("button_text_top_padding",0);this.ensureDefault("button_text_left_padding",0);this.ensureDefault("button_action",SWFUpload.BUTTON_ACTION.SELECT_FILES);this.ensureDefault("button_disabled",false);this.ensureDefault("button_placeholder_id","");this.ensureDefault("button_placeholder",null);this.ensureDefault("button_cursor",SWFUpload.CURSOR.ARROW);this.ensureDefault("button_window_mode",SWFUpload.WINDOW_MODE.WINDOW);this.ensureDefault("debug",false);this.settings.debug_enabled=this.settings.debug;this.settings.return_upload_start_handler=this.returnUploadStart;this.ensureDefault("swfupload_loaded_handler",null);this.ensureDefault("file_dialog_start_handler",null);this.ensureDefault("file_queued_handler",null);this.ensureDefault("file_queue_error_handler",null);this.ensureDefault("file_dialog_complete_handler",null);this.ensureDefault("upload_start_handler",null);this.ensureDefault("upload_progress_handler",null);this.ensureDefault("upload_error_handler",null);this.ensureDefault("upload_success_handler",null);this.ensureDefault("upload_complete_handler",null);this.ensureDefault("debug_handler",this.debugMessage);this.ensureDefault("custom_settings",{});this.customSettings=this.settings.custom_settings;if(!!this.settings.prevent_swf_caching){this.settings.flash_url=this.settings.flash_url+(this.settings.flash_url.indexOf("?")<0?"?":"&")+"preventswfcaching="+new Date().getTime();}if(!this.settings.preserve_relative_urls){this.settings.upload_url=SWFUpload.completeURL(this.settings.upload_url);this.settings.button_image_url=SWFUpload.completeURL(this.settings.button_image_url);}delete this.ensureDefault;};SWFUpload.prototype.loadFlash=function(){var d,c;if(document.getElementById(this.movieName)!==null){throw"ID "+this.movieName+" is already in use. The Flash Object could not be added";}d=document.getElementById(this.settings.button_placeholder_id)||this.settings.button_placeholder;if(d==undefined){throw"Could not find the placeholder element: "+this.settings.button_placeholder_id;}c=document.createElement("div");c.innerHTML=this.getFlashHTML();d.parentNode.replaceChild(c.firstChild,d);if(window[this.movieName]==undefined){window[this.movieName]=this.getMovieElement();}};SWFUpload.prototype.getFlashHTML=function(){return['<object id="',this.movieName,'" type="application/x-shockwave-flash" data="',this.settings.flash_url,'" width="',this.settings.button_width,'" height="',this.settings.button_height,'" class="swfupload">','<param name="wmode" value="',this.settings.button_window_mode,'" />','<param name="movie" value="',this.settings.flash_url,'" />','<param name="quality" value="high" />','<param name="menu" value="false" />','<param name="allowScriptAccess" value="always" />','<param name="flashvars" value="'+this.getFlashVars()+'" />',"</object>"].join("");};SWFUpload.prototype.getFlashVars=function(){var c=this.buildParamString();var d=this.settings.http_success.join(",");return["movieName=",encodeURIComponent(this.movieName),"&amp;uploadURL=",encodeURIComponent(this.settings.upload_url),"&amp;useQueryString=",encodeURIComponent(this.settings.use_query_string),"&amp;requeueOnError=",encodeURIComponent(this.settings.requeue_on_error),"&amp;httpSuccess=",encodeURIComponent(d),"&amp;assumeSuccessTimeout=",encodeURIComponent(this.settings.assume_success_timeout),"&amp;params=",encodeURIComponent(c),"&amp;filePostName=",encodeURIComponent(this.settings.file_post_name),"&amp;fileTypes=",encodeURIComponent(this.settings.file_types),"&amp;fileTypesDescription=",encodeURIComponent(this.settings.file_types_description),"&amp;fileSizeLimit=",encodeURIComponent(this.settings.file_size_limit),"&amp;fileUploadLimit=",encodeURIComponent(this.settings.file_upload_limit),"&amp;fileQueueLimit=",encodeURIComponent(this.settings.file_queue_limit),"&amp;debugEnabled=",encodeURIComponent(this.settings.debug_enabled),"&amp;buttonImageURL=",encodeURIComponent(this.settings.button_image_url),"&amp;buttonWidth=",encodeURIComponent(this.settings.button_width),"&amp;buttonHeight=",encodeURIComponent(this.settings.button_height),"&amp;buttonText=",encodeURIComponent(this.settings.button_text),"&amp;buttonTextTopPadding=",encodeURIComponent(this.settings.button_text_top_padding),"&amp;buttonTextLeftPadding=",encodeURIComponent(this.settings.button_text_left_padding),"&amp;buttonTextStyle=",encodeURIComponent(this.settings.button_text_style),"&amp;buttonAction=",encodeURIComponent(this.settings.button_action),"&amp;buttonDisabled=",encodeURIComponent(this.settings.button_disabled),"&amp;buttonCursor=",encodeURIComponent(this.settings.button_cursor)].join("");};SWFUpload.prototype.getMovieElement=function(){if(this.movieElement==undefined){this.movieElement=document.getElementById(this.movieName);}if(this.movieElement===null){throw"Could not find Flash element";}return this.movieElement;};SWFUpload.prototype.buildParamString=function(){var f=this.settings.post_params;var d=[];if(typeof(f)==="object"){for(var e in f){if(f.hasOwnProperty(e)){d.push(encodeURIComponent(e.toString())+"="+encodeURIComponent(f[e].toString()));}}}return d.join("&amp;");};SWFUpload.prototype.destroy=function(){try{this.cancelUpload(null,false);var g=null;g=this.getMovieElement();if(g&&typeof(g.CallFunction)==="unknown"){for(var j in g){try{if(typeof(g[j])==="function"){g[j]=null;}}catch(h){}}try{g.parentNode.removeChild(g);}catch(f){}}window[this.movieName]=null;SWFUpload.instances[this.movieName]=null;delete SWFUpload.instances[this.movieName];this.movieElement=null;this.settings=null;this.customSettings=null;this.eventQueue=null;this.movieName=null;return true;}catch(i){return false;}};SWFUpload.prototype.displayDebugInfo=function(){this.debug(["---SWFUpload Instance Info---\n","Version: ",SWFUpload.version,"\n","Movie Name: ",this.movieName,"\n","Settings:\n","\t","upload_url:               ",this.settings.upload_url,"\n","\t","flash_url:                ",this.settings.flash_url,"\n","\t","use_query_string:         ",this.settings.use_query_string.toString(),"\n","\t","requeue_on_error:         ",this.settings.requeue_on_error.toString(),"\n","\t","http_success:             ",this.settings.http_success.join(", "),"\n","\t","assume_success_timeout:   ",this.settings.assume_success_timeout,"\n","\t","file_post_name:           ",this.settings.file_post_name,"\n","\t","post_params:              ",this.settings.post_params.toString(),"\n","\t","file_types:               ",this.settings.file_types,"\n","\t","file_types_description:   ",this.settings.file_types_description,"\n","\t","file_size_limit:          ",this.settings.file_size_limit,"\n","\t","file_upload_limit:        ",this.settings.file_upload_limit,"\n","\t","file_queue_limit:         ",this.settings.file_queue_limit,"\n","\t","debug:                    ",this.settings.debug.toString(),"\n","\t","prevent_swf_caching:      ",this.settings.prevent_swf_caching.toString(),"\n","\t","button_placeholder_id:    ",this.settings.button_placeholder_id.toString(),"\n","\t","button_placeholder:       ",(this.settings.button_placeholder?"Set":"Not Set"),"\n","\t","button_image_url:         ",this.settings.button_image_url.toString(),"\n","\t","button_width:             ",this.settings.button_width.toString(),"\n","\t","button_height:            ",this.settings.button_height.toString(),"\n","\t","button_text:              ",this.settings.button_text.toString(),"\n","\t","button_text_style:        ",this.settings.button_text_style.toString(),"\n","\t","button_text_top_padding:  ",this.settings.button_text_top_padding.toString(),"\n","\t","button_text_left_padding: ",this.settings.button_text_left_padding.toString(),"\n","\t","button_action:            ",this.settings.button_action.toString(),"\n","\t","button_disabled:          ",this.settings.button_disabled.toString(),"\n","\t","custom_settings:          ",this.settings.custom_settings.toString(),"\n","Event Handlers:\n","\t","swfupload_loaded_handler assigned:  ",(typeof this.settings.swfupload_loaded_handler==="function").toString(),"\n","\t","file_dialog_start_handler assigned: ",(typeof this.settings.file_dialog_start_handler==="function").toString(),"\n","\t","file_queued_handler assigned:       ",(typeof this.settings.file_queued_handler==="function").toString(),"\n","\t","file_queue_error_handler assigned:  ",(typeof this.settings.file_queue_error_handler==="function").toString(),"\n","\t","upload_start_handler assigned:      ",(typeof this.settings.upload_start_handler==="function").toString(),"\n","\t","upload_progress_handler assigned:   ",(typeof this.settings.upload_progress_handler==="function").toString(),"\n","\t","upload_error_handler assigned:      ",(typeof this.settings.upload_error_handler==="function").toString(),"\n","\t","upload_success_handler assigned:    ",(typeof this.settings.upload_success_handler==="function").toString(),"\n","\t","upload_complete_handler assigned:   ",(typeof this.settings.upload_complete_handler==="function").toString(),"\n","\t","debug_handler assigned:             ",(typeof this.settings.debug_handler==="function").toString(),"\n"].join(""));};SWFUpload.prototype.addSetting=function(d,f,e){if(f==undefined){return(this.settings[d]=e);}else{return(this.settings[d]=f);}};SWFUpload.prototype.getSetting=function(b){if(this.settings[b]!=undefined){return this.settings[b];}return"";};SWFUpload.prototype.callFlash=function(functionName,argumentArray){argumentArray=argumentArray||[];var movieElement=this.getMovieElement();var returnValue,returnString;try{returnString=movieElement.CallFunction('<invoke name="'+functionName+'" returntype="javascript">'+__flash__argumentsToXML(argumentArray,0)+"</invoke>");returnValue=eval(returnString);}catch(ex){throw"Call to "+functionName+" failed";}if(returnValue!=undefined&&typeof returnValue.post==="object"){returnValue=this.unescapeFilePostParams(returnValue);}return returnValue;};SWFUpload.prototype.selectFile=function(){this.callFlash("SelectFile");};SWFUpload.prototype.selectFiles=function(){this.callFlash("SelectFiles");};SWFUpload.prototype.startUpload=function(b){this.callFlash("StartUpload",[b]);};SWFUpload.prototype.cancelUpload=function(d,c){if(c!==false){c=true;}this.callFlash("CancelUpload",[d,c]);};SWFUpload.prototype.stopUpload=function(){this.callFlash("StopUpload");};SWFUpload.prototype.getStats=function(){return this.callFlash("GetStats");};SWFUpload.prototype.setStats=function(b){this.callFlash("SetStats",[b]);};SWFUpload.prototype.getFile=function(b){if(typeof(b)==="number"){return this.callFlash("GetFileByIndex",[b]);}else{return this.callFlash("GetFile",[b]);}};SWFUpload.prototype.addFileParam=function(e,d,f){return this.callFlash("AddFileParam",[e,d,f]);};SWFUpload.prototype.removeFileParam=function(d,c){this.callFlash("RemoveFileParam",[d,c]);};SWFUpload.prototype.setUploadURL=function(b){this.settings.upload_url=b.toString();this.callFlash("SetUploadURL",[b]);};SWFUpload.prototype.setPostParams=function(b){this.settings.post_params=b;this.callFlash("SetPostParams",[b]);};SWFUpload.prototype.addPostParam=function(d,c){this.settings.post_params[d]=c;this.callFlash("SetPostParams",[this.settings.post_params]);};SWFUpload.prototype.removePostParam=function(b){delete this.settings.post_params[b];this.callFlash("SetPostParams",[this.settings.post_params]);};SWFUpload.prototype.setFileTypes=function(d,c){this.settings.file_types=d;this.settings.file_types_description=c;this.callFlash("SetFileTypes",[d,c]);};SWFUpload.prototype.setFileSizeLimit=function(b){this.settings.file_size_limit=b;this.callFlash("SetFileSizeLimit",[b]);};SWFUpload.prototype.setFileUploadLimit=function(b){this.settings.file_upload_limit=b;this.callFlash("SetFileUploadLimit",[b]);};SWFUpload.prototype.setFileQueueLimit=function(b){this.settings.file_queue_limit=b;this.callFlash("SetFileQueueLimit",[b]);};SWFUpload.prototype.setFilePostName=function(b){this.settings.file_post_name=b;this.callFlash("SetFilePostName",[b]);};SWFUpload.prototype.setUseQueryString=function(b){this.settings.use_query_string=b;this.callFlash("SetUseQueryString",[b]);};SWFUpload.prototype.setRequeueOnError=function(b){this.settings.requeue_on_error=b;this.callFlash("SetRequeueOnError",[b]);};SWFUpload.prototype.setHTTPSuccess=function(b){if(typeof b==="string"){b=b.replace(" ","").split(",");}this.settings.http_success=b;this.callFlash("SetHTTPSuccess",[b]);};SWFUpload.prototype.setAssumeSuccessTimeout=function(b){this.settings.assume_success_timeout=b;this.callFlash("SetAssumeSuccessTimeout",[b]);};SWFUpload.prototype.setDebugEnabled=function(b){this.settings.debug_enabled=b;this.callFlash("SetDebugEnabled",[b]);};SWFUpload.prototype.setButtonImageURL=function(b){if(b==undefined){b="";}this.settings.button_image_url=b;this.callFlash("SetButtonImageURL",[b]);};SWFUpload.prototype.setButtonDimensions=function(f,e){this.settings.button_width=f;this.settings.button_height=e;var d=this.getMovieElement();if(d!=undefined){d.style.width=f+"px";d.style.height=e+"px";}this.callFlash("SetButtonDimensions",[f,e]);};SWFUpload.prototype.setButtonText=function(b){this.settings.button_text=b;this.callFlash("SetButtonText",[b]);};SWFUpload.prototype.setButtonTextPadding=function(c,d){this.settings.button_text_top_padding=d;this.settings.button_text_left_padding=c;this.callFlash("SetButtonTextPadding",[c,d]);};SWFUpload.prototype.setButtonTextStyle=function(b){this.settings.button_text_style=b;this.callFlash("SetButtonTextStyle",[b]);};SWFUpload.prototype.setButtonDisabled=function(b){this.settings.button_disabled=b;this.callFlash("SetButtonDisabled",[b]);};SWFUpload.prototype.setButtonAction=function(b){this.settings.button_action=b;this.callFlash("SetButtonAction",[b]);};SWFUpload.prototype.setButtonCursor=function(b){this.settings.button_cursor=b;this.callFlash("SetButtonCursor",[b]);};SWFUpload.prototype.queueEvent=function(d,f){if(f==undefined){f=[];}else{if(!(f instanceof Array)){f=[f];}}var e=this;if(typeof this.settings[d]==="function"){this.eventQueue.push(function(){this.settings[d].apply(this,f);});setTimeout(function(){e.executeNextEvent();},0);}else{if(this.settings[d]!==null){throw"Event handler "+d+" is unknown or is not a function";}}};SWFUpload.prototype.executeNextEvent=function(){var b=this.eventQueue?this.eventQueue.shift():null;if(typeof(b)==="function"){b.apply(this);}};SWFUpload.prototype.unescapeFilePostParams=function(l){var j=/[$]([0-9a-f]{4})/i;var i={};var k;if(l!=undefined){for(var h in l.post){if(l.post.hasOwnProperty(h)){k=h;var g;while((g=j.exec(k))!==null){k=k.replace(g[0],String.fromCharCode(parseInt("0x"+g[1],16)));}i[k]=l.post[h];}}l.post=i;}return l;};SWFUpload.prototype.testExternalInterface=function(){try{return this.callFlash("TestExternalInterface");}catch(b){return false;}};SWFUpload.prototype.flashReady=function(){var b=this.getMovieElement();if(!b){this.debug("Flash called back ready but the flash movie can't be found.");return;}this.cleanUp(b);this.queueEvent("swfupload_loaded_handler");};SWFUpload.prototype.cleanUp=function(f){try{if(this.movieElement&&typeof(f.CallFunction)==="unknown"){this.debug("Removing Flash functions hooks (this should only run in IE and should prevent memory leaks)");for(var h in f){try{if(typeof(f[h])==="function"){f[h]=null;}}catch(e){}}}}catch(g){}window.__flash__removeCallback=function(c,b){try{if(c){c[b]=null;}}catch(a){}};};SWFUpload.prototype.fileDialogStart=function(){this.queueEvent("file_dialog_start_handler");};SWFUpload.prototype.fileQueued=function(b){b=this.unescapeFilePostParams(b);this.queueEvent("file_queued_handler",b);};SWFUpload.prototype.fileQueueError=function(e,f,d){e=this.unescapeFilePostParams(e);this.queueEvent("file_queue_error_handler",[e,f,d]);};SWFUpload.prototype.fileDialogComplete=function(d,f,e){this.queueEvent("file_dialog_complete_handler",[d,f,e]);};SWFUpload.prototype.uploadStart=function(b){b=this.unescapeFilePostParams(b);this.queueEvent("return_upload_start_handler",b);};SWFUpload.prototype.returnUploadStart=function(d){var c;if(typeof this.settings.upload_start_handler==="function"){d=this.unescapeFilePostParams(d);c=this.settings.upload_start_handler.call(this,d);}else{if(this.settings.upload_start_handler!=undefined){throw"upload_start_handler must be a function";}}if(c===undefined){c=true;}c=!!c;this.callFlash("ReturnUploadStart",[c]);};SWFUpload.prototype.uploadProgress=function(e,f,d){e=this.unescapeFilePostParams(e);this.queueEvent("upload_progress_handler",[e,f,d]);};SWFUpload.prototype.uploadError=function(e,f,d){e=this.unescapeFilePostParams(e);this.queueEvent("upload_error_handler",[e,f,d]);};SWFUpload.prototype.uploadSuccess=function(d,e,f){d=this.unescapeFilePostParams(d);this.queueEvent("upload_success_handler",[d,e,f]);};SWFUpload.prototype.uploadComplete=function(b){b=this.unescapeFilePostParams(b);this.queueEvent("upload_complete_handler",b);};SWFUpload.prototype.debug=function(b){this.queueEvent("debug_handler",b);};SWFUpload.prototype.debugMessage=function(h){if(this.settings.debug){var f,g=[];if(typeof h==="object"&&typeof h.name==="string"&&typeof h.message==="string"){for(var e in h){if(h.hasOwnProperty(e)){g.push(e+": "+h[e]);}}f=g.join("\n")||"";g=f.split("\n");f="EXCEPTION: "+g.join("\nEXCEPTION: ");SWFUpload.Console.writeLine(f);}else{SWFUpload.Console.writeLine(h);}}};SWFUpload.Console={};SWFUpload.Console.writeLine=function(g){var e,f;try{e=document.getElementById("SWFUpload_Console");if(!e){f=document.createElement("form");document.getElementsByTagName("body")[0].appendChild(f);e=document.createElement("textarea");e.id="SWFUpload_Console";e.style.fontFamily="monospace";e.setAttribute("wrap","off");e.wrap="off";e.style.overflow="auto";e.style.width="700px";e.style.height="350px";e.style.margin="5px";f.appendChild(e);}e.value+=g+"\n";e.scrollTop=e.scrollHeight-e.clientHeight;}catch(h){alert("Exception: "+h.name+" Message: "+h.message);}};(function(c){var b={init:function(d,e){return this.each(function(){var n=c(this);var m=n.clone();var j=c.extend({id:n.attr("id"),swf:"uploadify.swf",uploader:"uploadify.php",auto:true,buttonClass:"",buttonCursor:"hand",buttonImage:null,buttonText:"SELECT FILES",checkExisting:false,debug:false,fileObjName:"Filedata",fileSizeLimit:0,fileTypeDesc:"All Files",fileTypeExts:"*.*",height:30,method:"post",multi:true,formData:{},preventCaching:true,progressData:"percentage",queueID:false,queueSizeLimit:999,removeCompleted:true,removeTimeout:3,requeueErrors:false,successTimeout:30,uploadLimit:0,width:120,overrideEvents:[]},d);var g={assume_success_timeout:j.successTimeout,button_placeholder_id:j.id,button_width:j.width,button_height:j.height,button_text:null,button_text_style:null,button_text_top_padding:0,button_text_left_padding:0,button_action:(j.multi?SWFUpload.BUTTON_ACTION.SELECT_FILES:SWFUpload.BUTTON_ACTION.SELECT_FILE),button_disabled:false,button_cursor:(j.buttonCursor=="arrow"?SWFUpload.CURSOR.ARROW:SWFUpload.CURSOR.HAND),button_window_mode:SWFUpload.WINDOW_MODE.TRANSPARENT,debug:j.debug,requeue_on_error:j.requeueErrors,file_post_name:j.fileObjName,file_size_limit:j.fileSizeLimit,file_types:j.fileTypeExts,file_types_description:j.fileTypeDesc,file_queue_limit:j.queueSizeLimit,file_upload_limit:j.uploadLimit,flash_url:j.swf,prevent_swf_caching:j.preventCaching,post_params:j.formData,upload_url:j.uploader,use_query_string:(j.method=="get"),file_dialog_complete_handler:a.onDialogClose,file_dialog_start_handler:a.onDialogOpen,file_queued_handler:a.onSelect,file_queue_error_handler:a.onSelectError,swfupload_loaded_handler:j.onSWFReady,upload_complete_handler:a.onUploadComplete,upload_error_handler:a.onUploadError,upload_progress_handler:a.onUploadProgress,upload_start_handler:a.onUploadStart,upload_success_handler:a.onUploadSuccess};if(e){g=c.extend(g,e);}g=c.extend(g,j);var o=swfobject.getFlashPlayerVersion();var h=(o.major>=9);if(h){window["uploadify_"+j.id]=new SWFUpload(g);var i=window["uploadify_"+j.id];n.data("uploadify",i);var l=c("<div />",{id:j.id,"class":"uploadify",css:{height:j.height+"px",width:j.width+"px"}});c("#"+i.movieName).wrap(l);l=c("#"+j.id);l.data("uploadify",i);var f=c("<div />",{id:j.id+"-button","class":"uploadify-button "+j.buttonClass});if(j.buttonImage){f.css({"background-image":"url('"+j.buttonImage+"')","text-indent":"-9999px"});}f.html('<span class="uploadify-button-text">'+j.buttonText+"</span>").css({height:j.height+"px","line-height":j.height+"px",width:j.width+"px"});l.append(f);c("#"+i.movieName).css({position:"absolute","z-index":1});if(!j.queueID){var k=c("<div />",{id:j.id+"-queue","class":"uploadify-queue"});l.after(k);i.settings.queueID=j.id+"-queue";i.settings.defaultQueue=true;}i.queueData={files:{},filesSelected:0,filesQueued:0,filesReplaced:0,filesCancelled:0,filesErrored:0,uploadsSuccessful:0,uploadsErrored:0,averageSpeed:0,queueLength:0,queueSize:0,uploadSize:0,queueBytesUploaded:0,uploadQueue:[],errorMsg:"Some files were not added to the queue:"};i.original=m;i.wrapper=l;i.button=f;i.queue=k;if(j.onInit){j.onInit.call(n,i);}}else{if(j.onFallback){j.onFallback.call(n);}}});},cancel:function(d,f){var e=arguments;this.each(function(){var l=c(this),i=l.data("uploadify"),j=i.settings,h=-1;if(e[0]){if(e[0]=="*"){var g=i.queueData.queueLength;c("#"+j.queueID).find(".uploadify-queue-item").each(function(){h++;if(e[1]===true){i.cancelUpload(c(this).attr("id"),false);}else{i.cancelUpload(c(this).attr("id"));}c(this).find(".data").removeClass("data").html(" - Cancelled");c(this).find(".uploadify-progress-bar").remove();c(this).delay(1000+100*h).fadeOut(500,function(){c(this).remove();});});i.queueData.queueSize=0;i.queueData.queueLength=0;if(j.onClearQueue){j.onClearQueue.call(l,g);}}else{for(var m=0;m<e.length;m++){i.cancelUpload(e[m]);c("#"+e[m]).find(".data").removeClass("data").html(" - Cancelled");c("#"+e[m]).find(".uploadify-progress-bar").remove();c("#"+e[m]).delay(1000+100*m).fadeOut(500,function(){c(this).remove();});}}}else{var k=c("#"+j.queueID).find(".uploadify-queue-item").get(0);$item=c(k);i.cancelUpload($item.attr("id"));$item.find(".data").removeClass("data").html(" - Cancelled");$item.find(".uploadify-progress-bar").remove();$item.delay(1000).fadeOut(500,function(){c(this).remove();});}});},destroy:function(){this.each(function(){var f=c(this),d=f.data("uploadify"),e=d.settings;d.destroy();if(e.defaultQueue){c("#"+e.queueID).remove();}c("#"+e.id).replaceWith(d.original);if(e.onDestroy){e.onDestroy.call(this);}delete d;});},disable:function(d){this.each(function(){var g=c(this),e=g.data("uploadify"),f=e.settings;if(d){e.button.addClass("disabled");if(f.onDisable){f.onDisable.call(this);}}else{e.button.removeClass("disabled");if(f.onEnable){f.onEnable.call(this);}}e.setButtonDisabled(d);});},settings:function(e,g,h){var d=arguments;var f=g;this.each(function(){var k=c(this),i=k.data("uploadify"),j=i.settings;if(typeof(d[0])=="object"){for(var l in g){setData(l,g[l]);}}if(d.length===1){f=j[e];}else{switch(e){case"uploader":i.setUploadURL(g);break;case"formData":if(!h){g=c.extend(j.formData,g);}i.setPostParams(j.formData);break;case"method":if(g=="get"){i.setUseQueryString(true);}else{i.setUseQueryString(false);}break;case"fileObjName":i.setFilePostName(g);break;case"fileTypeExts":i.setFileTypes(g,j.fileTypeDesc);break;case"fileTypeDesc":i.setFileTypes(j.fileTypeExts,g);break;case"fileSizeLimit":i.setFileSizeLimit(g);break;case"uploadLimit":i.setFileUploadLimit(g);break;case"queueSizeLimit":i.setFileQueueLimit(g);break;case"buttonImage":i.button.css("background-image",settingValue);break;case"buttonCursor":if(g=="arrow"){i.setButtonCursor(SWFUpload.CURSOR.ARROW);}else{i.setButtonCursor(SWFUpload.CURSOR.HAND);}break;case"buttonText":c("#"+j.id+"-button").find(".uploadify-button-text").html(g);break;case"width":i.setButtonDimensions(g,j.height);break;case"height":i.setButtonDimensions(j.width,g);break;case"multi":if(g){i.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILES);}else{i.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILE);}break;}j[e]=g;}});if(d.length===1){return f;}},stop:function(){this.each(function(){var e=c(this),d=e.data("uploadify");d.queueData.averageSpeed=0;d.queueData.uploadSize=0;d.queueData.bytesUploaded=0;d.queueData.uploadQueue=[];d.stopUpload();});},upload:function(){var d=arguments;this.each(function(){var f=c(this),e=f.data("uploadify");e.queueData.averageSpeed=0;e.queueData.uploadSize=0;e.queueData.bytesUploaded=0;e.queueData.uploadQueue=[];if(d[0]){if(d[0]=="*"){e.queueData.uploadSize=e.queueData.queueSize;e.queueData.uploadQueue.push("*");e.startUpload();}else{for(var g=0;g<d.length;g++){e.queueData.uploadSize+=e.queueData.files[d[g]].size;e.queueData.uploadQueue.push(d[g]);}e.startUpload(e.queueData.uploadQueue.shift());}}else{e.startUpload();}});}};var a={onDialogOpen:function(){var d=this.settings;this.queueData.errorMsg="Some files were not added to the queue:";this.queueData.filesReplaced=0;this.queueData.filesCancelled=0;if(d.onDialogOpen){d.onDialogOpen.call(this);}},onDialogClose:function(d,f,g){var e=this.settings;this.queueData.filesErrored=d-f;this.queueData.filesSelected=d;this.queueData.filesQueued=f-this.queueData.filesCancelled;this.queueData.queueLength=g;if(c.inArray("onDialogClose",e.overrideEvents)<0){if(this.queueData.filesErrored>0){alert(this.queueData.errorMsg);}}if(e.onDialogClose){e.onDialogClose.call(this,this.queueData);}if(e.auto){c("#"+e.id).uploadify("upload","*");}},onSelect:function(g){var h=this.settings;var e={};for(var f in this.queueData.files){e=this.queueData.files[f];if(e.uploaded!=true&&e.name==g.name){var d=confirm('The file named "'+g.name+'" is already in the queue.\nDo you want to replace the existing item in the queue?');if(!d){this.cancelUpload(g.id);this.queueData.filesCancelled++;return false;}else{c("#"+e.id).remove();this.cancelUpload(e.id);this.queueData.filesReplaced++;}}}var i=Math.round(g.size/1024);var l="KB";if(i>1000){i=Math.round(i/1000);l="MB";}var k=i.toString().split(".");i=k[0];if(k.length>1){i+="."+k[1].substr(0,2);}i+=l;var j=g.name;if(j.length>25){j=j.substr(0,25)+"...";}if(c.inArray("onSelect",h.overrideEvents)<0){c("#"+h.queueID).append('<div id="'+g.id+'" class="uploadify-queue-item">					<div class="cancel">						<a href="javascript:$(\'#'+h.id+"').uploadify('cancel', '"+g.id+'\')">X</a>					</div>					<span class="fileName">'+j+" ("+i+')</span><span class="data"></span>					<div class="uploadify-progress">						<div class="uploadify-progress-bar"><!--Progress Bar--></div>					</div>				</div>');}this.queueData.queueSize+=g.size;this.queueData.files[g.id]=g;if(h.onSelect){h.onSelect.apply(this,arguments);}},onSelectError:function(d,g,f){var e=this.settings;if(c.inArray("onSelectError",e.overrideEvents)<0){switch(g){case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:if(e.queueSizeLimit>f){this.queueData.errorMsg+="\nThe number of files selected exceeds the remaining upload limit ("+f+").";}else{this.queueData.errorMsg+="\nThe number of files selected exceeds the queue size limit ("+e.queueSizeLimit+").";}break;case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:this.queueData.errorMsg+='\nThe file "'+d.name+'" exceeds the size limit ('+e.fileSizeLimit+").";break;case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:this.queueData.errorMsg+='\nThe file "'+d.name+'" is empty.';break;case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:this.queueData.errorMsg+='\nThe file "'+d.name+'" is not an accepted file type ('+e.fileTypeDesc+").";break;}}if(g!=SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED){delete this.queueData.files[d.id];}if(e.onSelectError){e.onSelectError.apply(this,arguments);}},onQueueComplete:function(){if(this.settings.onQueueComplete){this.settings.onQueueComplete.call(this,this.settings.queueData);}},onUploadComplete:function(f){var g=this.settings,d=this;var e=this.getStats();this.queueData.queueLength=e.files_queued;if(this.queueData.uploadQueue[0]=="*"){if(this.queueData.queueLength>0){this.startUpload();}else{this.queueData.uploadQueue=[];if(g.onQueueComplete){g.onQueueComplete.call(this,this.queueData);}}}else{if(this.queueData.uploadQueue.length>0){this.startUpload(this.queueData.uploadQueue.shift());}else{this.queueData.uploadQueue=[];if(g.onQueueComplete){g.onQueueComplete.call(this,this.queueData);}}}if(c.inArray("onUploadComplete",g.overrideEvents)<0){if(g.removeCompleted){switch(f.filestatus){case SWFUpload.FILE_STATUS.COMPLETE:setTimeout(function(){if(c("#"+f.id)){d.queueData.queueSize-=f.size;d.queueData.queueLength-=1;delete d.queueData.files[f.id];c("#"+f.id).fadeOut(500,function(){c(this).remove();});}},g.removeTimeout*1000);break;case SWFUpload.FILE_STATUS.ERROR:if(!g.requeueErrors){setTimeout(function(){if(c("#"+f.id)){d.queueData.queueSize-=f.size;d.queueData.queueLength-=1;delete d.queueData.files[f.id];c("#"+f.id).fadeOut(500,function(){c(this).remove();});}},g.removeTimeout*1000);}break;}}else{f.uploaded=true;}}if(g.onUploadComplete){g.onUploadComplete.call(this,f);}},onUploadError:function(e,i,h){var f=this.settings;var g="Error";switch(i){case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:g="HTTP Error ("+h+")";break;case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:g="Missing Upload URL";break;case SWFUpload.UPLOAD_ERROR.IO_ERROR:g="IO Error";break;case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:g="Security Error";break;case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:alert("The upload limit has been reached ("+h+").");g="Exceeds Upload Limit";break;case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:g="Failed";break;case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:break;case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:g="Validation Error";break;case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:g="Cancelled";this.queueData.queueSize-=e.size;this.queueData.queueLength-=1;if(e.status==SWFUpload.FILE_STATUS.IN_PROGRESS||c.inArray(e.id,this.queueData.uploadQueue)>=0){this.queueData.uploadSize-=e.size;}if(f.onCancel){f.onCancel.call(this,e);}delete this.queueData.files[e.id];break;case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:g="Stopped";break;}if(c.inArray("onUploadError",f.overrideEvents)<0){if(i!=SWFUpload.UPLOAD_ERROR.FILE_CANCELLED&&i!=SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED){c("#"+e.id).addClass("uploadify-error");}c("#"+e.id).find(".uploadify-progress-bar").css("width","1px");if(i!=SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND&&e.status!=SWFUpload.FILE_STATUS.COMPLETE){c("#"+e.id).find(".data").html(" - "+g);}}var d=this.getStats();this.queueData.uploadsErrored=d.upload_errors;if(f.onUploadError){f.onUploadError.call(this,e,i,h,g);}},onUploadProgress:function(g,m,j){var h=this.settings;var e=new Date();var n=e.getTime();var k=n-this.timer;if(k>500){this.timer=n;}var i=m-this.bytesLoaded;this.bytesLoaded=m;var d=this.queueData.queueBytesUploaded+m;var p=Math.round(m/j*100);var o="KB/s";var l=0;var f=(i/1024)/(k/1000);f=Math.floor(f*10)/10;if(this.queueData.averageSpeed>0){this.queueData.averageSpeed=Math.floor((this.queueData.averageSpeed+f)/2);}else{this.queueData.averageSpeed=Math.floor(f);}if(f>1000){l=(f*0.001);this.queueData.averageSpeed=Math.floor(l);o="MB/s";}if(c.inArray("onUploadProgress",h.overrideEvents)<0){if(h.progressData=="percentage"){c("#"+g.id).find(".data").html(" - "+p+"%");}else{if(h.progressData=="speed"&&k>500){c("#"+g.id).find(".data").html(" - "+this.queueData.averageSpeed+o);}}c("#"+g.id).find(".uploadify-progress-bar").css("width",p+"%");}if(h.onUploadProgress){h.onUploadProgress.call(this,g,m,j,d,this.queueData.uploadSize);}},onUploadStart:function(d){var e=this.settings;var f=new Date();this.timer=f.getTime();this.bytesLoaded=0;if(this.queueData.uploadQueue.length==0){this.queueData.uploadSize=d.size;}if(e.checkExisting){c.ajax({type:"POST",async:false,url:e.checkExisting,data:{filename:d.name},success:function(h){if(h==1){var g=confirm('A file with the name "'+d.name+'" already exists on the server.\nWould you like to replace the existing file?');if(!g){this.cancelUpload(d.id);c("#"+d.id).remove();if(this.queueData.uploadQueue.length>0&&this.queueData.queueLength>0){if(this.queueData.uploadQueue[0]=="*"){this.startUpload();}else{this.startUpload(this.queueData.uploadQueue.shift());}}}}}});}if(e.onUploadStart){e.onUploadStart.call(this,d);}},onUploadSuccess:function(f,h,d){var g=this.settings;var e=this.getStats();this.queueData.uploadsSuccessful=e.successful_uploads;this.queueData.queueBytesUploaded+=f.size;if(c.inArray("onUploadSuccess",g.overrideEvents)<0){c("#"+f.id).find(".data").html(" - Complete");}if(g.onUploadSuccess){g.onUploadSuccess.call(this,f,h,d);}}};c.fn.uploadify=function(d){if(b[d]){return b[d].apply(this,Array.prototype.slice.call(arguments,1));}else{if(typeof d==="object"||!d){return b.init.apply(this,arguments);}else{c.error("The method "+d+" does not exist in $.uploadify");}}};})($);
window.JSON||(window.JSON={}),function(){function f(a){return a<10?"0"+a:a}function quote(a){return escapable.lastIndex=0,escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b=="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function str(a,b){var c,d,e,f,g=gap,h,i=b[a];i&&typeof i=="object"&&typeof i.toJSON=="function"&&(i=i.toJSON(a)),typeof rep=="function"&&(i=rep.call(b,a,i));switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";gap+=indent,h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1)h[c]=str(c,i)||"null";return e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]",gap=g,e}if(rep&&typeof rep=="object"){f=rep.length;for(c=0;c<f;c+=1)d=rep[c],typeof d=="string"&&(e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e))}else for(d in i)Object.hasOwnProperty.call(i,d)&&(e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e));return e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}",gap=g,e}}"use strict",typeof Date.prototype.toJSON!="function"&&(Date.prototype.toJSON=function(a){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()});var JSON=window.JSON,cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;typeof JSON.stringify!="function"&&(JSON.stringify=function(a,b,c){var d;gap="",indent="";if(typeof c=="number")for(d=0;d<c;d+=1)indent+=" ";else typeof c=="string"&&(indent=c);rep=b;if(!b||typeof b=="function"||typeof b=="object"&&typeof b.length=="number")return str("",{"":a});throw new Error("JSON.stringify")}),typeof JSON.parse!="function"&&(JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e=="object")for(c in e)Object.hasOwnProperty.call(e,c)&&(d=walk(e,c),d!==undefined?e[c]=d:delete e[c]);return reviver.call(a,b,e)}var j;text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),typeof reviver=="function"?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}(),function(a,b){"use strict";var c=a.History=a.History||{},d=a.jQuery;if(typeof c.Adapter!="undefined")throw new Error("History.js Adapter has already been loaded...");c.Adapter={bind:function(a,b,c){d(a).bind(b,c)},trigger:function(a,b,c){d(a).trigger(b,c)},extractEventData:function(a,c,d){var e=c&&c.originalEvent&&c.originalEvent[a]||d&&d[a]||b;return e},onDomLoad:function(a){d(a)}},typeof c.init!="undefined"&&c.init()}(window),function(a,b){"use strict";var c=a.document,d=a.setTimeout||d,e=a.clearTimeout||e,f=a.setInterval||f,g=a.History=a.History||{};if(typeof g.initHtml4!="undefined")throw new Error("History.js HTML4 Support has already been loaded...");g.initHtml4=function(){if(typeof g.initHtml4.initialized!="undefined")return!1;g.initHtml4.initialized=!0,g.enabled=!0,g.savedHashes=[],g.isLastHash=function(a){var b=g.getHashByIndex(),c;return c=a===b,c},g.saveHash=function(a){return g.isLastHash(a)?!1:(g.savedHashes.push(a),!0)},g.getHashByIndex=function(a){var b=null;return typeof a=="undefined"?b=g.savedHashes[g.savedHashes.length-1]:a<0?b=g.savedHashes[g.savedHashes.length+a]:b=g.savedHashes[a],b},g.discardedHashes={},g.discardedStates={},g.discardState=function(a,b,c){var d=g.getHashByState(a),e;return e={discardedState:a,backState:c,forwardState:b},g.discardedStates[d]=e,!0},g.discardHash=function(a,b,c){var d={discardedHash:a,backState:c,forwardState:b};return g.discardedHashes[a]=d,!0},g.discardedState=function(a){var b=g.getHashByState(a),c;return c=g.discardedStates[b]||!1,c},g.discardedHash=function(a){var b=g.discardedHashes[a]||!1;return b},g.recycleState=function(a){var b=g.getHashByState(a);return g.discardedState(a)&&delete g.discardedStates[b],!0},g.emulated.hashChange&&(g.hashChangeInit=function(){g.checkerFunction=null;var b="",d,e,h,i;return g.isInternetExplorer()?(d="historyjs-iframe",e=c.createElement("iframe"),e.setAttribute("id",d),e.style.display="none",c.body.appendChild(e),e.contentWindow.document.open(),e.contentWindow.document.close(),h="",i=!1,g.checkerFunction=function(){if(i)return!1;i=!0;var c=g.getHash()||"",d=g.unescapeHash(e.contentWindow.document.location.hash)||"";return c!==b?(b=c,d!==c&&(h=d=c,e.contentWindow.document.open(),e.contentWindow.document.close(),e.contentWindow.document.location.hash=g.escapeHash(c)),g.Adapter.trigger(a,"hashchange")):d!==h&&(h=d,g.setHash(d,!1)),i=!1,!0}):g.checkerFunction=function(){var c=g.getHash();return c!==b&&(b=c,g.Adapter.trigger(a,"hashchange")),!0},g.intervalList.push(f(g.checkerFunction,g.options.hashChangeInterval)),!0},g.Adapter.onDomLoad(g.hashChangeInit)),g.emulated.pushState&&(g.onHashChange=function(b){var d=b&&b.newURL||c.location.href,e=g.getHashByUrl(d),f=null,h=null,i=null,j;return g.isLastHash(e)?(g.busy(!1),!1):(g.doubleCheckComplete(),g.saveHash(e),e&&g.isTraditionalAnchor(e)?(g.Adapter.trigger(a,"anchorchange"),g.busy(!1),!1):(f=g.extractState(g.getFullUrl(e||c.location.href,!1),!0),g.isLastSavedState(f)?(g.busy(!1),!1):(h=g.getHashByState(f),j=g.discardedState(f),j?(g.getHashByIndex(-2)===g.getHashByState(j.forwardState)?g.back(!1):g.forward(!1),!1):(g.pushState(f.data,f.title,f.url,!1),!0))))},g.Adapter.bind(a,"hashchange",g.onHashChange),g.pushState=function(b,d,e,f){if(g.getHashByUrl(e))throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");if(f!==!1&&g.busy())return g.pushQueue({scope:g,callback:g.pushState,args:arguments,queue:f}),!1;g.busy(!0);var h=g.createStateObject(b,d,e),i=g.getHashByState(h),j=g.getState(!1),k=g.getHashByState(j),l=g.getHash();return g.storeState(h),g.expectedStateId=h.id,g.recycleState(h),g.setTitle(h),i===k?(g.busy(!1),!1):i!==l&&i!==g.getShortUrl(c.location.href)?(g.setHash(i,!1),!1):(g.saveState(h),g.Adapter.trigger(a,"statechange"),g.busy(!1),!0)},g.replaceState=function(a,b,c,d){if(g.getHashByUrl(c))throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");if(d!==!1&&g.busy())return g.pushQueue({scope:g,callback:g.replaceState,args:arguments,queue:d}),!1;g.busy(!0);var e=g.createStateObject(a,b,c),f=g.getState(!1),h=g.getStateByIndex(-2);return g.discardState(f,e,h),g.pushState(e.data,e.title,e.url,!1),!0}),g.emulated.pushState&&g.getHash()&&!g.emulated.hashChange&&g.Adapter.onDomLoad(function(){g.Adapter.trigger(a,"hashchange")})},typeof g.init!="undefined"&&g.init()}(window),function(a,b){"use strict";var c=a.console||b,d=a.document,e=a.navigator,f=a.sessionStorage||!1,g=a.setTimeout,h=a.clearTimeout,i=a.setInterval,j=a.clearInterval,k=a.JSON,l=a.alert,m=a.History=a.History||{},n=a.history;k.stringify=k.stringify||k.encode,k.parse=k.parse||k.decode;if(typeof m.init!="undefined")throw new Error("History.js Core has already been loaded...");m.init=function(){return typeof m.Adapter=="undefined"?!1:(typeof m.initCore!="undefined"&&m.initCore(),typeof m.initHtml4!="undefined"&&m.initHtml4(),!0)},m.initCore=function(){if(typeof m.initCore.initialized!="undefined")return!1;m.initCore.initialized=!0,m.options=m.options||{},m.options.hashChangeInterval=m.options.hashChangeInterval||100,m.options.safariPollInterval=m.options.safariPollInterval||500,m.options.doubleCheckInterval=m.options.doubleCheckInterval||500,m.options.storeInterval=m.options.storeInterval||1e3,m.options.busyDelay=m.options.busyDelay||250,m.options.debug=m.options.debug||!1,m.options.initialTitle=m.options.initialTitle||d.title,m.intervalList=[],m.clearAllIntervals=function(){var a,b=m.intervalList;if(typeof b!="undefined"&&b!==null){for(a=0;a<b.length;a++)j(b[a]);m.intervalList=null}},m.debug=function(){(m.options.debug||!1)&&m.log.apply(m,arguments)},m.log=function(){var a=typeof c!="undefined"&&typeof c.log!="undefined"&&typeof c.log.apply!="undefined",b=d.getElementById("log"),e,f,g,h,i;a?(h=Array.prototype.slice.call(arguments),e=h.shift(),typeof c.debug!="undefined"?c.debug.apply(c,[e,h]):c.log.apply(c,[e,h])):e="\n"+arguments[0]+"\n";for(f=1,g=arguments.length;f<g;++f){i=arguments[f];if(typeof i=="object"&&typeof k!="undefined")try{i=k.stringify(i)}catch(j){}e+="\n"+i+"\n"}return b?(b.value+=e+"\n-----\n",b.scrollTop=b.scrollHeight-b.clientHeight):a||l(e),!0},m.getInternetExplorerMajorVersion=function(){var a=m.getInternetExplorerMajorVersion.cached=typeof m.getInternetExplorerMajorVersion.cached!="undefined"?m.getInternetExplorerMajorVersion.cached:function(){var a=3,b=d.createElement("div"),c=b.getElementsByTagName("i");while((b.innerHTML="<!--[if gt IE "+ ++a+"]><i></i><![endif]-->")&&c[0]);return a>4?a:!1}();return a},m.isInternetExplorer=function(){var a=m.isInternetExplorer.cached=typeof m.isInternetExplorer.cached!="undefined"?m.isInternetExplorer.cached:Boolean(m.getInternetExplorerMajorVersion());return a},m.emulated={pushState:!Boolean(a.history&&a.history.pushState&&a.history.replaceState&&!/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i.test(e.userAgent)&&!/AppleWebKit\/5([0-2]|3[0-2])/i.test(e.userAgent)),hashChange:Boolean(!("onhashchange"in a||"onhashchange"in d)||m.isInternetExplorer()&&m.getInternetExplorerMajorVersion()<8)},m.enabled=!m.emulated.pushState,m.bugs={setHash:Boolean(!m.emulated.pushState&&e.vendor==="Apple Computer, Inc."&&/AppleWebKit\/5([0-2]|3[0-3])/.test(e.userAgent)),safariPoll:Boolean(!m.emulated.pushState&&e.vendor==="Apple Computer, Inc."&&/AppleWebKit\/5([0-2]|3[0-3])/.test(e.userAgent)),ieDoubleCheck:Boolean(m.isInternetExplorer()&&m.getInternetExplorerMajorVersion()<8),hashEscape:Boolean(m.isInternetExplorer()&&m.getInternetExplorerMajorVersion()<7)},m.isEmptyObject=function(a){for(var b in a)return!1;return!0},m.cloneObject=function(a){var b,c;return a?(b=k.stringify(a),c=k.parse(b)):c={},c},m.getRootUrl=function(){var a=d.location.protocol+"//"+(d.location.hostname||d.location.host);if(d.location.port||!1)a+=":"+d.location.port;return a+="/",a},m.getBaseHref=function(){var a=d.getElementsByTagName("base"),b=null,c="";return a.length===1&&(b=a[0],c=b.href.replace(/[^\/]+$/,"")),c=c.replace(/\/+$/,""),c&&(c+="/"),c},m.getBaseUrl=function(){var a=m.getBaseHref()||m.getBasePageUrl()||m.getRootUrl();return a},m.getPageUrl=function(){var a=m.getState(!1,!1),b=(a||{}).url||d.location.href,c;return c=b.replace(/\/+$/,"").replace(/[^\/]+$/,function(a,b,c){return/\./.test(a)?a:a+"/"}),c},m.getBasePageUrl=function(){var a=d.location.href.replace(/[#\?].*/,"").replace(/[^\/]+$/,function(a,b,c){return/[^\/]$/.test(a)?"":a}).replace(/\/+$/,"")+"/";return a},m.getFullUrl=function(a,b){var c=a,d=a.substring(0,1);return b=typeof b=="undefined"?!0:b,/[a-z]+\:\/\//.test(a)||(d==="/"?c=m.getRootUrl()+a.replace(/^\/+/,""):d==="#"?c=m.getPageUrl().replace(/#.*/,"")+a:d==="?"?c=m.getPageUrl().replace(/[\?#].*/,"")+a:b?c=m.getBaseUrl()+a.replace(/^(\.\/)+/,""):c=m.getBasePageUrl()+a.replace(/^(\.\/)+/,"")),c.replace(/\#$/,"")},m.getShortUrl=function(a){var b=a,c=m.getBaseUrl(),d=m.getRootUrl();return m.emulated.pushState&&(b=b.replace(c,"")),b=b.replace(d,"/"),m.isTraditionalAnchor(b)&&(b="./"+b),b=b.replace(/^(\.\/)+/g,"./").replace(/\#$/,""),b},m.store={},m.idToState=m.idToState||{},m.stateToId=m.stateToId||{},m.urlToId=m.urlToId||{},m.storedStates=m.storedStates||[],m.savedStates=m.savedStates||[],m.normalizeStore=function(){m.store.idToState=m.store.idToState||{},m.store.urlToId=m.store.urlToId||{},m.store.stateToId=m.store.stateToId||{}},m.getState=function(a,b){typeof a=="undefined"&&(a=!0),typeof b=="undefined"&&(b=!0);var c=m.getLastSavedState();return!c&&b&&(c=m.createStateObject()),a&&(c=m.cloneObject(c),c.url=c.cleanUrl||c.url),c},m.getIdByState=function(a){var b=m.extractId(a.url),c;if(!b){c=m.getStateString(a);if(typeof m.stateToId[c]!="undefined")b=m.stateToId[c];else if(typeof m.store.stateToId[c]!="undefined")b=m.store.stateToId[c];else{for(;;){b=(new Date).getTime()+String(Math.random()).replace(/\D/g,"");if(typeof m.idToState[b]=="undefined"&&typeof m.store.idToState[b]=="undefined")break}m.stateToId[c]=b,m.idToState[b]=a}}return b},m.normalizeState=function(a){var b,c;if(!a||typeof a!="object")a={};if(typeof a.normalized!="undefined")return a;if(!a.data||typeof a.data!="object")a.data={};b={},b.normalized=!0,b.title=a.title||"",b.url=m.getFullUrl(m.unescapeString(a.url||d.location.href)),b.hash=m.getShortUrl(b.url),b.data=m.cloneObject(a.data),b.id=m.getIdByState(b),b.cleanUrl=b.url.replace(/\??\&_suid.*/,""),b.url=b.cleanUrl,c=!m.isEmptyObject(b.data);if(b.title||c)b.hash=m.getShortUrl(b.url).replace(/\??\&_suid.*/,""),/\?/.test(b.hash)||(b.hash+="?"),b.hash+="&_suid="+b.id;return b.hashedUrl=m.getFullUrl(b.hash),(m.emulated.pushState||m.bugs.safariPoll)&&m.hasUrlDuplicate(b)&&(b.url=b.hashedUrl),b},m.createStateObject=function(a,b,c){var d={data:a,title:b,url:c};return d=m.normalizeState(d),d},m.getStateById=function(a){a=String(a);var c=m.idToState[a]||m.store.idToState[a]||b;return c},m.getStateString=function(a){var b,c,d;return b=m.normalizeState(a),c={data:b.data,title:a.title,url:a.url},d=k.stringify(c),d},m.getStateId=function(a){var b,c;return b=m.normalizeState(a),c=b.id,c},m.getHashByState=function(a){var b,c;return b=m.normalizeState(a),c=b.hash,c},m.extractId=function(a){var b,c,d;return c=/(.*)\&_suid=([0-9]+)$/.exec(a),d=c?c[1]||a:a,b=c?String(c[2]||""):"",b||!1},m.isTraditionalAnchor=function(a){var b=!/[\/\?\.]/.test(a);return b},m.extractState=function(a,b){var c=null,d,e;return b=b||!1,d=m.extractId(a),d&&(c=m.getStateById(d)),c||(e=m.getFullUrl(a),d=m.getIdByUrl(e)||!1,d&&(c=m.getStateById(d)),!c&&b&&!m.isTraditionalAnchor(a)&&(c=m.createStateObject(null,null,e))),c},m.getIdByUrl=function(a){var c=m.urlToId[a]||m.store.urlToId[a]||b;return c},m.getLastSavedState=function(){return m.savedStates[m.savedStates.length-1]||b},m.getLastStoredState=function(){return m.storedStates[m.storedStates.length-1]||b},m.hasUrlDuplicate=function(a){var b=!1,c;return c=m.extractState(a.url),b=c&&c.id!==a.id,b},m.storeState=function(a){return m.urlToId[a.url]=a.id,m.storedStates.push(m.cloneObject(a)),a},m.isLastSavedState=function(a){var b=!1,c,d,e;return m.savedStates.length&&(c=a.id,d=m.getLastSavedState(),e=d.id,b=c===e),b},m.saveState=function(a){return m.isLastSavedState(a)?!1:(m.savedStates.push(m.cloneObject(a)),!0)},m.getStateByIndex=function(a){var b=null;return typeof a=="undefined"?b=m.savedStates[m.savedStates.length-1]:a<0?b=m.savedStates[m.savedStates.length+a]:b=m.savedStates[a],b},m.getHash=function(){var a=m.unescapeHash(d.location.hash);return a},m.unescapeString=function(b){var c=b,d;for(;;){d=a.unescape(c);if(d===c)break;c=d}return c},m.unescapeHash=function(a){var b=m.normalizeHash(a);return b=m.unescapeString(b),b},m.normalizeHash=function(a){var b=a.replace(/[^#]*#/,"").replace(/#.*/,"");return b},m.setHash=function(a,b){var c,e,f;return b!==!1&&m.busy()?(m.pushQueue({scope:m,callback:m.setHash,args:arguments,queue:b}),!1):(c=m.escapeHash(a),m.busy(!0),e=m.extractState(a,!0),e&&!m.emulated.pushState?m.pushState(e.data,e.title,e.url,!1):d.location.hash!==c&&(m.bugs.setHash?(f=m.getPageUrl(),m.pushState(null,null,f+"#"+c,!1)):d.location.hash=c),m)},m.escapeHash=function(b){var c=m.normalizeHash(b);return c=a.escape(c),m.bugs.hashEscape||(c=c.replace(/\%21/g,"!").replace(/\%26/g,"&").replace(/\%3D/g,"=").replace(/\%3F/g,"?")),c},m.getHashByUrl=function(a){var b=String(a).replace(/([^#]*)#?([^#]*)#?(.*)/,"$2");return b=m.unescapeHash(b),b},m.setTitle=function(a){var b=a.title,c;b||(c=m.getStateByIndex(0),c&&c.url===a.url&&(b=c.title||m.options.initialTitle));try{d.getElementsByTagName("title")[0].innerHTML=b.replace("<","&lt;").replace(">","&gt;").replace(" & "," &amp; ")}catch(e){}return d.title=b,m},m.queues=[],m.busy=function(a){typeof a!="undefined"?m.busy.flag=a:typeof m.busy.flag=="undefined"&&(m.busy.flag=!1);if(!m.busy.flag){h(m.busy.timeout);var b=function(){var a,c,d;if(m.busy.flag)return;for(a=m.queues.length-1;a>=0;--a){c=m.queues[a];if(c.length===0)continue;d=c.shift(),m.fireQueueItem(d),m.busy.timeout=g(b,m.options.busyDelay)}};m.busy.timeout=g(b,m.options.busyDelay)}return m.busy.flag},m.busy.flag=!1,m.fireQueueItem=function(a){return a.callback.apply(a.scope||m,a.args||[])},m.pushQueue=function(a){return m.queues[a.queue||0]=m.queues[a.queue||0]||[],m.queues[a.queue||0].push(a),m},m.queue=function(a,b){return typeof a=="function"&&(a={callback:a}),typeof b!="undefined"&&(a.queue=b),m.busy()?m.pushQueue(a):m.fireQueueItem(a),m},m.clearQueue=function(){return m.busy.flag=!1,m.queues=[],m},m.stateChanged=!1,m.doubleChecker=!1,m.doubleCheckComplete=function(){return m.stateChanged=!0,m.doubleCheckClear(),m},m.doubleCheckClear=function(){return m.doubleChecker&&(h(m.doubleChecker),m.doubleChecker=!1),m},m.doubleCheck=function(a){return m.stateChanged=!1,m.doubleCheckClear(),m.bugs.ieDoubleCheck&&(m.doubleChecker=g(function(){return m.doubleCheckClear(),m.stateChanged||a(),!0},m.options.doubleCheckInterval)),m},m.safariStatePoll=function(){var b=m.extractState(d.location.href),c;if(!m.isLastSavedState(b))c=b;else return;return c||(c=m.createStateObject()),m.Adapter.trigger(a,"popstate"),m},m.back=function(a){return a!==!1&&m.busy()?(m.pushQueue({scope:m,callback:m.back,args:arguments,queue:a}),!1):(m.busy(!0),m.doubleCheck(function(){m.back(!1)}),n.go(-1),!0)},m.forward=function(a){return a!==!1&&m.busy()?(m.pushQueue({scope:m,callback:m.forward,args:arguments,queue:a}),!1):(m.busy(!0),m.doubleCheck(function(){m.forward(!1)}),n.go(1),!0)},m.go=function(a,b){var c;if(a>0)for(c=1;c<=a;++c)m.forward(b);else{if(!(a<0))throw new Error("History.go: History.go requires a positive or negative integer passed.");for(c=-1;c>=a;--c)m.back(b)}return m};if(m.emulated.pushState){var o=function(){};m.pushState=m.pushState||o,m.replaceState=m.replaceState||o}else m.onPopState=function(b,c){var e=!1,f=!1,g,h;return m.doubleCheckComplete(),g=m.getHash(),g?(h=m.extractState(g||d.location.href,!0),h?m.replaceState(h.data,h.title,h.url,!1):(m.Adapter.trigger(a,"anchorchange"),m.busy(!1)),m.expectedStateId=!1,!1):(e=m.Adapter.extractEventData("state",b,c)||!1,e?f=m.getStateById(e):m.expectedStateId?f=m.getStateById(m.expectedStateId):f=m.extractState(d.location.href),f||(f=m.createStateObject(null,null,d.location.href)),m.expectedStateId=!1,m.isLastSavedState(f)?(m.busy(!1),!1):(m.storeState(f),m.saveState(f),m.setTitle(f),m.Adapter.trigger(a,"statechange"),m.busy(!1),!0))},m.Adapter.bind(a,"popstate",m.onPopState),m.pushState=function(b,c,d,e){if(m.getHashByUrl(d)&&m.emulated.pushState)throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");if(e!==!1&&m.busy())return m.pushQueue({scope:m,callback:m.pushState,args:arguments,queue:e}),!1;m.busy(!0);var f=m.createStateObject(b,c,d);return m.isLastSavedState(f)?m.busy(!1):(m.storeState(f),m.expectedStateId=f.id,n.pushState(f.id,f.title,f.url),m.Adapter.trigger(a,"popstate")),!0},m.replaceState=function(b,c,d,e){if(m.getHashByUrl(d)&&m.emulated.pushState)throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");if(e!==!1&&m.busy())return m.pushQueue({scope:m,callback:m.replaceState,args:arguments,queue:e}),!1;m.busy(!0);var f=m.createStateObject(b,c,d);return m.isLastSavedState(f)?m.busy(!1):(m.storeState(f),m.expectedStateId=f.id,n.replaceState(f.id,f.title,f.url),m.Adapter.trigger(a,"popstate")),!0};if(f){try{m.store=k.parse(f.getItem("History.store"))||{}}catch(p){m.store={}}m.normalizeStore()}else m.store={},m.normalizeStore();m.Adapter.bind(a,"beforeunload",m.clearAllIntervals),m.Adapter.bind(a,"unload",m.clearAllIntervals),m.saveState(m.storeState(m.extractState(d.location.href,!0))),f&&(m.onUnload=function(){var a,b;try{a=k.parse(f.getItem("History.store"))||{}}catch(c){a={}}a.idToState=a.idToState||{},a.urlToId=a.urlToId||{},a.stateToId=a.stateToId||{};for(b in m.idToState){if(!m.idToState.hasOwnProperty(b))continue;a.idToState[b]=m.idToState[b]}for(b in m.urlToId){if(!m.urlToId.hasOwnProperty(b))continue;a.urlToId[b]=m.urlToId[b]}for(b in m.stateToId){if(!m.stateToId.hasOwnProperty(b))continue;a.stateToId[b]=m.stateToId[b]}m.store=a,m.normalizeStore(),f.setItem("History.store",k.stringify(a))},m.intervalList.push(i(m.onUnload,m.options.storeInterval)),m.Adapter.bind(a,"beforeunload",m.onUnload),m.Adapter.bind(a,"unload",m.onUnload));if(!m.emulated.pushState){m.bugs.safariPoll&&m.intervalList.push(i(m.safariStatePoll,m.options.safariPollInterval));if(e.vendor==="Apple Computer, Inc."||(e.appCodeName||"")==="Mozilla")m.Adapter.bind(a,"hashchange",function(){m.Adapter.trigger(a,"popstate")}),m.getHash()&&m.Adapter.onDomLoad(function(){m.Adapter.trigger(a,"hashchange")})}},m.init()}(window)
$(document).ready(function(){
	//themes, change CSS with JS
	//default theme(CSS) is cerulean, change it if needed
	var current_theme = $.cookie('current_theme')==null ? 'journal' :$.cookie('current_theme');
	switch_theme(current_theme);
	
	$('#themes a[data-value="'+current_theme+'"]').find('i').addClass('icon-ok');
				 
	$('#themes a').click(function(e){
		e.preventDefault();
		current_theme=$(this).attr('data-value');
		$.cookie('current_theme',current_theme,{expires:365});
		switch_theme(current_theme);
		$('#themes i').removeClass('icon-ok');
		$(this).find('i').addClass('icon-ok');
	});
	
	
	function switch_theme(theme_name)
	{
		$('#bs-css').attr('href','css/bootstrap-'+theme_name+'.css');
	}
	
	//ajax menu checkbox
	$('#is-ajax').click(function(e){
		$.cookie('is-ajax',$(this).prop('checked'),{expires:365});
	});
	$('#is-ajax').prop('checked',$.cookie('is-ajax')==='true' ? true : false);
	
	//disbaling some functions for Internet Explorer
	if($.browser.msie)
	{
		$('#is-ajax').prop('checked',false);
		$('#for-is-ajax').hide();
		$('#toggle-fullscreen').hide();
		$('.login-box').find('.input-large').removeClass('span10');
		
	}
	
	
	//highlight current / active link
	$('ul.main-menu li a').each(function(){
		if($($(this))[0].href==String(window.location))
			$(this).parent().addClass('active');
	});
	
	//establish history variables
	var
		History = window.History, // Note: We are using a capital H instead of a lower h
		State = History.getState(),
		$log = $('#log');

	//bind to State Change
	History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
		var State = History.getState(); // Note: We are using History.getState() instead of event.state
		$.ajax({
			url:State.url,
			success:function(msg){
				$('#content').html($(msg).find('#content').html());
				$('#loading').remove();
				$('#content').fadeIn();
				var newTitle = $(msg).filter('title').text();
				$('title').text(newTitle);
				docReady();
			}
		});
	});
	
	//ajaxify menus
	$('a.ajax-link').click(function(e){
		if($.browser.msie) e.which=1;
		if(e.which!=1 || !$('#is-ajax').prop('checked') || $(this).parent().hasClass('active')) return;
		e.preventDefault();
		if($('.btn-navbar').is(':visible'))
		{
			$('.btn-navbar').click();
		}
		$('#loading').remove();
		$('#content').fadeOut().parent().append('<div id="loading" class="center">Loading...<div class="center"></div></div>');
		var $clink=$(this);
		History.pushState(null, null, $clink.attr('href'));
		$('ul.main-menu li.active').removeClass('active');
		$clink.parent('li').addClass('active');	
	});
	
	//animating menus on hover
	$('ul.main-menu li:not(.nav-header)').hover(function(){
		$(this).animate({'margin-left':'+=5'},300);
	},
	function(){
		$(this).animate({'margin-left':'-=5'},300);
	});
	
	//other things to do on document ready, seperated for ajax calls
	docReady();
});
		
		
function docReady(){
	//prevent # links from moving to top
	$('a[href="#"][data-top!=true]').click(function(e){
		e.preventDefault();
	});
	
	//rich text editor
	$('.cleditor').cleditor();
	
	//datepicker
	$('.datepicker').datepicker();
	
	//notifications
	$('.noty').click(function(e){
		e.preventDefault();
		var options = $.parseJSON($(this).attr('data-noty-options'));
		noty(options);
	});


	//uniform - styler for checkbox, radio and file input
	$("input:checkbox, input:radio, input:file").not('[data-no-uniform="true"],#uniform-is-ajax').uniform();

	//chosen - improves select
	$('[data-rel="chosen"],[rel="chosen"]').chosen();

	//tabs
	$('#myTab a:first').tab('show');
	$('#myTab a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	});

	//makes elements soratble, elements that sort need to have id attribute to save the result
	$('.sortable').sortable({
		revert:true,
		cancel:'.btn,.box-content,.nav-header',
		update:function(event,ui){
			//line below gives the ids of elements, you can make ajax call here to save it to the database
			//console.log($(this).sortable('toArray'));
		}
	});

	//slider
	$('.slider').slider({range:true,values:[10,65]});

	//tooltip
	$('[rel="tooltip"],[data-rel="tooltip"]').tooltip({"placement":"bottom",delay: { show: 400, hide: 200 }});

	//auto grow textarea
	$('textarea.autogrow').autogrow();

	//popover
	$('[rel="popover"],[data-rel="popover"]').popover();

	//file manager
	var elf = $('.file-manager').elfinder({
		url : 'misc/elfinder-connector/connector.php'  // connector URL (REQUIRED)
	}).elfinder('instance');

	//iOS / iPhone style toggle switch
	$('.iphone-toggle').iphoneStyle();

	//star rating
	$('.raty').raty({
		score : 4 //default stars
	});

	//uploadify - multiple uploads
	$('#file_upload').uploadify({
		'swf'      : 'misc/uploadify.swf',
		'uploader' : 'misc/uploadify.php'
		// Put your options here
	});

	//gallery controlls container animation
	$('ul.gallery li').hover(function(){
		$('img',this).fadeToggle(1000);
		$(this).find('.gallery-controls').remove();
		$(this).append('<div class="well gallery-controls">'+
							'<p><a href="#" class="gallery-edit btn"><i class="icon-edit"></i></a> <a href="#" class="gallery-delete btn"><i class="icon-remove"></i></a></p>'+
						'</div>');
		$(this).find('.gallery-controls').stop().animate({'margin-top':'-1'},400,'easeInQuint');
	},function(){
		$('img',this).fadeToggle(1000);
		$(this).find('.gallery-controls').stop().animate({'margin-top':'-30'},200,'easeInQuint',function(){
				$(this).remove();
		});
	});


	//gallery image controls example
	//gallery delete
	$('.thumbnails').on('click','.gallery-delete',function(e){
		e.preventDefault();
		//get image id
		//alert($(this).parents('.thumbnail').attr('id'));
		$(this).parents('.thumbnail').fadeOut();
	});
	//gallery edit
	$('.thumbnails').on('click','.gallery-edit',function(e){
		e.preventDefault();
		//get image id
		//alert($(this).parents('.thumbnail').attr('id'));
	});

	//gallery colorbox
	$('.thumbnail a').colorbox({rel:'thumbnail a', transition:"elastic", maxWidth:"95%", maxHeight:"95%"});

	//gallery fullscreen
	$('#toggle-fullscreen').button().click(function () {
		var button = $(this), root = document.documentElement;
		if (!button.hasClass('active')) {
			$('#thumbnails').addClass('modal-fullscreen');
			if (root.webkitRequestFullScreen) {
				root.webkitRequestFullScreen(
					window.Element.ALLOW_KEYBOARD_INPUT
				);
			} else if (root.mozRequestFullScreen) {
				root.mozRequestFullScreen();
			}
		} else {
			$('#thumbnails').removeClass('modal-fullscreen');
			(document.webkitCancelFullScreen ||
				document.mozCancelFullScreen ||
				$.noop).apply(document);
		}
	});

	//tour
	if($('.tour').length && typeof(tour)=='undefined')
	{
		var tour = new Tour();
		tour.addStep({
			element: ".span10:first", /* html element next to which the step popover should be shown */
			placement: "top",
			title: "Custom Tour", /* title of the popover */
			content: "You can create tour like this. Click Next." /* content of the popover */
		});
		tour.addStep({
			element: ".theme-container",
			placement: "left",
			title: "Themes",
			content: "You change your theme from here."
		});
		tour.addStep({
			element: "ul.main-menu a:first",
			title: "Dashboard",
			content: "This is your dashboard from here you will find highlights."
		});
		tour.addStep({
			element: "#for-is-ajax",
			title: "Ajax",
			content: "You can change if pages load with Ajax or not."
		});
		tour.addStep({
			element: ".top-nav a:first",
			placement: "bottom",
			title: "Visit Site",
			content: "Visit your front end from here."
		});
		
		tour.restart();
	}

	//datatable
	$('.datatable').dataTable({
			"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span12'i><'span12 center'p>>",
			"sPaginationType": "bootstrap",
			"oLanguage": {
			"sLengthMenu": "_MENU_ records per page"
			}
		} );
	$('.btn-close').click(function(e){
		e.preventDefault();
		$(this).parent().parent().parent().fadeOut();
	});
	$('.btn-minimize').click(function(e){
		e.preventDefault();
		var $target = $(this).parent().parent().next('.box-content');
		if($target.is(':visible')) $('i',$(this)).removeClass('icon-chevron-up').addClass('icon-chevron-down');
		else 					   $('i',$(this)).removeClass('icon-chevron-down').addClass('icon-chevron-up');
		$target.slideToggle();
	});
	$('.btn-setting').click(function(e){
		e.preventDefault();
		$('#myModal').modal('show');
	});



		
	//initialize the external events for calender

	$('#external-events div.external-event').each(function() {

		// it doesn't need to have a start or end
		var eventObject = {
			title: $.trim($(this).text()) // use the element's text as the event title
		};
		
		// store the Event Object in the DOM element so we can get to it later
		$(this).data('eventObject', eventObject);
		
		// make the event draggable using jQuery UI
		$(this).draggable({
			zIndex: 999,
			revert: true,      // will cause the event to go back to its
			revertDuration: 0  //  original position after the drag
		});
		
	});


	//initialize the calendar
	$('#calendar').fullCalendar({
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
		editable: true,
		droppable: true, // this allows things to be dropped onto the calendar !!!
		drop: function(date, allDay) { // this function is called when something is dropped
		
			// retrieve the dropped element's stored Event Object
			var originalEventObject = $(this).data('eventObject');
			
			// we need to copy it, so that multiple events don't have a reference to the same object
			var copiedEventObject = $.extend({}, originalEventObject);
			
			// assign it the date that was reported
			copiedEventObject.start = date;
			copiedEventObject.allDay = allDay;
			
			// render the event on the calendar
			// the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
			$('#calendar').fullCalendar('renderEvent', copiedEventObject, true);
			
			// is the "remove after drop" checkbox checked?
			if ($('#drop-remove').is(':checked')) {
				// if so, remove the element from the "Draggable Events" list
				$(this).remove();
			}
			
		}
	});
	
	
	//chart with points
	if($("#sincos").length)
	{
		var sin = [], cos = [];

		for (var i = 0; i < 14; i += 0.5) {
			sin.push([i, Math.sin(i)/i]);
			cos.push([i, Math.cos(i)]);
		}

		var plot = $.plot($("#sincos"),
			   [ { data: sin, label: "sin(x)/x"}, { data: cos, label: "cos(x)" } ], {
				   series: {
					   lines: { show: true  },
					   points: { show: true }
				   },
				   grid: { hoverable: true, clickable: true, backgroundColor: { colors: ["#fff", "#eee"] } },
				   yaxis: { min: -1.2, max: 1.2 },
				   colors: ["#539F2E", "#3C67A5"]
				 });

		function showTooltip(x, y, contents) {
			$('<div id="tooltip">' + contents + '</div>').css( {
				position: 'absolute',
				display: 'none',
				top: y + 5,
				left: x + 5,
				border: '1px solid #fdd',
				padding: '2px',
				'background-color': '#dfeffc',
				opacity: 0.80
			}).appendTo("body").fadeIn(200);
		}

		var previousPoint = null;
		$("#sincos").bind("plothover", function (event, pos, item) {
			$("#x").text(pos.x.toFixed(2));
			$("#y").text(pos.y.toFixed(2));

				if (item) {
					if (previousPoint != item.dataIndex) {
						previousPoint = item.dataIndex;

						$("#tooltip").remove();
						var x = item.datapoint[0].toFixed(2),
							y = item.datapoint[1].toFixed(2);

						showTooltip(item.pageX, item.pageY,
									item.series.label + " of " + x + " = " + y);
					}
				}
				else {
					$("#tooltip").remove();
					previousPoint = null;
				}
		});
		


		$("#sincos").bind("plotclick", function (event, pos, item) {
			if (item) {
				$("#clickdata").text("You clicked point " + item.dataIndex + " in " + item.series.label + ".");
				plot.highlight(item.series, item.datapoint);
			}
		});
	}
	
	//flot chart
	if($("#flotchart").length)
	{
		var d1 = [];
		for (var i = 0; i < Math.PI * 2; i += 0.25)
			d1.push([i, Math.sin(i)]);
		
		var d2 = [];
		for (var i = 0; i < Math.PI * 2; i += 0.25)
			d2.push([i, Math.cos(i)]);

		var d3 = [];
		for (var i = 0; i < Math.PI * 2; i += 0.1)
			d3.push([i, Math.tan(i)]);
		
		$.plot($("#flotchart"), [
			{ label: "sin(x)",  data: d1},
			{ label: "cos(x)",  data: d2},
			{ label: "tan(x)",  data: d3}
		], {
			series: {
				lines: { show: true },
				points: { show: true }
			},
			xaxis: {
				ticks: [0, [Math.PI/2, "\u03c0/2"], [Math.PI, "\u03c0"], [Math.PI * 3/2, "3\u03c0/2"], [Math.PI * 2, "2\u03c0"]]
			},
			yaxis: {
				ticks: 10,
				min: -2,
				max: 2
			},
			grid: {
				backgroundColor: { colors: ["#fff", "#eee"] }
			}
		});
	}
	
	//stack chart
	if($("#stackchart").length)
	{
		var d1 = [];
		for (var i = 0; i <= 10; i += 1)
		d1.push([i, parseInt(Math.random() * 30)]);

		var d2 = [];
		for (var i = 0; i <= 10; i += 1)
			d2.push([i, parseInt(Math.random() * 30)]);

		var d3 = [];
		for (var i = 0; i <= 10; i += 1)
			d3.push([i, parseInt(Math.random() * 30)]);

		var stack = 0, bars = true, lines = false, steps = false;

		function plotWithOptions() {
			$.plot($("#stackchart"), [ d1, d2, d3 ], {
				series: {
					stack: stack,
					lines: { show: lines, fill: true, steps: steps },
					bars: { show: bars, barWidth: 0.6 }
				}
			});
		}

		plotWithOptions();

		$(".stackControls input").click(function (e) {
			e.preventDefault();
			stack = $(this).val() == "With stacking" ? true : null;
			plotWithOptions();
		});
		$(".graphControls input").click(function (e) {
			e.preventDefault();
			bars = $(this).val().indexOf("Bars") != -1;
			lines = $(this).val().indexOf("Lines") != -1;
			steps = $(this).val().indexOf("steps") != -1;
			plotWithOptions();
		});
	}

	//pie chart
	var data = [
	{ label: "Internet Explorer",  data: 12},
	{ label: "Mobile",  data: 27},
	{ label: "Safari",  data: 85},
	{ label: "Opera",  data: 64},
	{ label: "Firefox",  data: 90},
	{ label: "Chrome",  data: 112}
	];
	
	if($("#piechart").length)
	{
		$.plot($("#piechart"), data,
		{
			series: {
					pie: {
							show: true
					}
			},
			grid: {
					hoverable: true,
					clickable: true
			},
			legend: {
				show: false
			}
		});
		
		function pieHover(event, pos, obj)
		{
			if (!obj)
					return;
			percent = parseFloat(obj.series.percent).toFixed(2);
			$("#hover").html('<span style="font-weight: bold; color: '+obj.series.color+'">'+obj.series.label+' ('+percent+'%)</span>');
		}
		$("#piechart").bind("plothover", pieHover);
	}
	
	//donut chart
	if($("#donutchart").length)
	{
		$.plot($("#donutchart"), data,
		{
				series: {
						pie: {
								innerRadius: 0.5,
								show: true
						}
				},
				legend: {
					show: false
				}
		});
	}




	 // we use an inline data source in the example, usually data would
	// be fetched from a server
	var data = [], totalPoints = 300;
	function getRandomData() {
		if (data.length > 0)
			data = data.slice(1);

		// do a random walk
		while (data.length < totalPoints) {
			var prev = data.length > 0 ? data[data.length - 1] : 50;
			var y = prev + Math.random() * 10 - 5;
			if (y < 0)
				y = 0;
			if (y > 100)
				y = 100;
			data.push(y);
		}

		// zip the generated y values with the x values
		var res = [];
		for (var i = 0; i < data.length; ++i)
			res.push([i, data[i]])
		return res;
	}

	// setup control widget
	var updateInterval = 30;
	$("#updateInterval").val(updateInterval).change(function () {
		var v = $(this).val();
		if (v && !isNaN(+v)) {
			updateInterval = +v;
			if (updateInterval < 1)
				updateInterval = 1;
			if (updateInterval > 2000)
				updateInterval = 2000;
			$(this).val("" + updateInterval);
		}
	});

	//realtime chart
	if($("#realtimechart").length)
	{
		var options = {
			series: { shadowSize: 1 }, // drawing is faster without shadows
			yaxis: { min: 0, max: 100 },
			xaxis: { show: false }
		};
		var plot = $.plot($("#realtimechart"), [ getRandomData() ], options);
		function update() {
			plot.setData([ getRandomData() ]);
			// since the axes don't change, we don't need to call plot.setupGrid()
			plot.draw();
			
			setTimeout(update, updateInterval);
		}

		update();
	}
}


//additional functions for data table
$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings )
{
	return {
		"iStart":         oSettings._iDisplayStart,
		"iEnd":           oSettings.fnDisplayEnd(),
		"iLength":        oSettings._iDisplayLength,
		"iTotal":         oSettings.fnRecordsTotal(),
		"iFilteredTotal": oSettings.fnRecordsDisplay(),
		"iPage":          Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
		"iTotalPages":    Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
	};
}
$.extend( $.fn.dataTableExt.oPagination, {
	"bootstrap": {
		"fnInit": function( oSettings, nPaging, fnDraw ) {
			var oLang = oSettings.oLanguage.oPaginate;
			var fnClickHandler = function ( e ) {
				e.preventDefault();
				if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
					fnDraw( oSettings );
				}
			};

			$(nPaging).addClass('pagination').append(
				'<ul>'+
					'<li class="prev disabled"><a href="#">&larr; '+oLang.sPrevious+'</a></li>'+
					'<li class="next disabled"><a href="#">'+oLang.sNext+' &rarr; </a></li>'+
				'</ul>'
			);
			var els = $('a', nPaging);
			$(els[0]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
			$(els[1]).bind( 'click.DT', { action: "next" }, fnClickHandler );
		},

		"fnUpdate": function ( oSettings, fnDraw ) {
			var iListLength = 5;
			var oPaging = oSettings.oInstance.fnPagingInfo();
			var an = oSettings.aanFeatures.p;
			var i, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);

			if ( oPaging.iTotalPages < iListLength) {
				iStart = 1;
				iEnd = oPaging.iTotalPages;
			}
			else if ( oPaging.iPage <= iHalf ) {
				iStart = 1;
				iEnd = iListLength;
			} else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
				iStart = oPaging.iTotalPages - iListLength + 1;
				iEnd = oPaging.iTotalPages;
			} else {
				iStart = oPaging.iPage - iHalf + 1;
				iEnd = iStart + iListLength - 1;
			}

			for ( i=0, iLen=an.length ; i<iLen ; i++ ) {
				// remove the middle elements
				$('li:gt(0)', an[i]).filter(':not(:last)').remove();

				// add the new list items and their event handlers
				for ( j=iStart ; j<=iEnd ; j++ ) {
					sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
					$('<li '+sClass+'><a href="#">'+j+'</a></li>')
						.insertBefore( $('li:last', an[i])[0] )
						.bind('click', function (e) {
							e.preventDefault();
							oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
							fnDraw( oSettings );
						} );
				}

				// add / remove disabled classes from the static elements
				if ( oPaging.iPage === 0 ) {
					$('li:first', an[i]).addClass('disabled');
				} else {
					$('li:first', an[i]).removeClass('disabled');
				}

				if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
					$('li:last', an[i]).addClass('disabled');
				} else {
					$('li:last', an[i]).removeClass('disabled');
				}
			}
		}
	}
});
