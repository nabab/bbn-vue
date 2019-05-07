/**
 * @file bbn-notification component
 *
 * @description bbn-notification is a component that allows the display of a brief information message, for example to confirm the success of an action that has taken place.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 11/01/2017
 */
(function($, bbn, kendo){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-notification', {
    mixins: [bbn.vue.basicComponent, bbn.vue.optionComponent],
    props: {
      pinned: {},
      top: {},
      left: {},
      bottom: {},
      right: {},
      successMessage: {
        type: [String, Function],
        default: bbn._('Success')
      },
      warningMessage: {
        type: [String, Function],
        default: bbn._('Warning')
      },
      errorMessage: {
        type: [String, Function],
        default: bbn._('Error')
      },
      cfg: {
        type: Object,
        default: function(){
          return {
            pinned: true,
            top: null,
            left: null,
            bottom: 5,
            right: 5,
          }
        }
      }
    },
    data: function(){
      return {
        tplCfg: {
          info: {
            cls: 'groupe',
            icon: 'info'
          },
          success: {
            cls: 'adherent',
            icon: 'flag-checkered'
          },
          warning: {
            cls: 'prospect',
            icon: 'warning'
          },
          error: {
            cls: 'radie',
            icon: 'bomb'
          }
        },
      };
    },
    methods: {
      template: function (obj, type){
        var vm = this;
        if ( typeof(obj) === 'object' ){
          if ( obj.type ){
            type = obj.type;
          }
          var cfg = vm.tplCfg;
          return '<div class="bbn-notification k-notification-wrap ' +
            '">' +
/*            ( type && cfg[type] ? '<div class="bbn-notification-close k-i-close k-button" title="' + bbn.lng.close + '"><i class="nf nf-fa-times"> </i></div>' : '' ) +
            ( type && cfg[type] ? '<i class="bbn-notification-icon nf nf-fa-' + cfg[type].icon + '"> </i>' : '<span class="bbn-notification-icon loader"><span class="loader-inner"></span></span> ' ) + */
            ( obj.title ? '<span class="bbn-b">' + obj.title + '</span><hr>' : '' ) +
            ( obj.content ? obj.content : ( obj.text ? obj.text : bbn.lng.loading ) ) +
            '</div>';
        }
        bbn.fn.log("Bad argument for notification template");
      },
      _sanitize(obj, type){
        if ( typeof obj === 'string' ){
          obj = {text: obj};
        }
        else if ( !obj ){
          obj = {};
        }
        if ( !obj.text ){
          obj.text =bbn.fn.isFunction(this[type + 'Message']) ? this[type + 'Message'](obj) : this[type + 'Message']
        }
        if ( !obj.text ){
          obj.text = '';
        }
        return obj;
      },
      success: function (obj, timeout){
        return this.show(this._sanitize(obj, "success"), "success", timeout ? timeout : 2000);
      },
      error: function (obj, timeout){
        return this.show(this._sanitize(obj, "error"), "error", timeout ? timeout : 5000);
      },
      warning: function (obj, timeout){
        return this.show(this._sanitize(obj, "warning"), "warning", timeout ? timeout : 5000);
      },
      show: function (obj, type, timeout){
        if ( typeof(obj) === 'string' ){
          obj = {content: obj};
        }
        if ( typeof(obj) === 'object' ){
          this.widget.show(obj, type);
          if ( timeout ){
            var id = this.setID(),
                t  = this;
            setTimeout(function (){
              t.deleteFromID(id);
            }, timeout < 50 ? timeout * 1000 : timeout);
          }
        }
        else{
          this.widget.show({content: bbn.lng.loading}, "loading");
        }
      },
      info: function (obj, timeout){
        return this.show(obj, "info", timeout);
      },
      setID: function (id){
        if ( !id ){
          id = (new Date()).getMilliseconds();
        }
        this.widget.getNotifications().last().data("bbn-id", id);
        return id;
      },
      getFromID: function (id){
        return this.widget.getNotifications().filter(function (){
          return $(this).data("bbn-id") === id;
        }).first();
      },
      deleteFromID: function (id){
        var ele   = this.getFromID(id),
            close = ele.find(".bbn-notification-close");
        if ( close.length ){
          close.click();
        }
        else{
          ele.parent().fadeOut("fast", function (){
            $(this).remove();
          });
        }
      },
      deleteAll: function (){
        this.widget.hide();
      }
    },
    mounted: function(){
      var vm = this,
          cfg = vm.getOptions();
      vm.widget = $(vm.$el).kendoNotification({
        autoHideAfter: 0,
        hide: function(e) {
          e.preventDefault();
          var $p = e.element.parent(),
              h = $p.outerHeight(true) + 4;
          $p.nextAll(".k-animation-container").each(function () {
            var n = $(vm.$el);
            n.animate({top: (parseFloat(n.css('top')) + h) + 'px'});
          });
          setTimeout(function () {
            $p.remove();
          }, 500);
        },
        position: {
          pinned: cfg.pinned,
          top: cfg.top,
          left: cfg.left,
          bottom: cfg.bottom,
          right: cfg.right
        },
        hideOnClick: true,
        button: true,
        templates: [{
          // define a custom template for the built-in "info" notification type
          type: "info",
          template: function (d) {
            return vm.template(d, "info");
          }
        }, {
          // define a custom template for the built-in "success" notification type
          type: "success",
          template: function (d) {
            return vm.template(d, "success");
          }
        }, {
          // define a custom template for the built-in "warning" notification type
          type: "warning",
          template: function (d) {
            return vm.template(d, "warning");
          }
        }, {
          // define a custom template for the built-in "error" notification type
          type: "error",
          template: function (d) {
            return vm.template(d, "error");
          }
        }, {
          // define a custom template for the built-in "loading" notification type
          type: "loading",
          template: function (d) {
            return vm.template(d, "loading");
          }
        }]
      }).data("kendoNotification");
    },
  });
})(window.jQuery, window.bbn, window.kendo);
