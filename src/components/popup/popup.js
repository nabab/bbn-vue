
/**
 * @file bbn-popup component
 *
 * @description bbn-popup is a component very similar to a desktop window of an operating system.
 * Inside you can show what you wish, even the components with its information.
 * Its potential lies in the fact that it emphasizes with a particular attention that portion of information that we want to see, enclosed in a window that can be opened or closed upon request.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 * 
 * @created 15/02/2017
 */

(function(bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-popup', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      defaultWidth: {
        type: [String, Number],
        default: '70%'
      },
      defaultHeight: {
        type: [String, Number],
        default: '70%'
      },
      untitled: {
        type: String,
        default: bbn._("Untitled")
      },
      source: {
        type: Array,
        default: function(){
          return [];
        }
      },
      zIndex: {
        type: Number,
        default: 10
      },
      alertTitle: {
        type: String,
        default: '<i class="nf nf-fa-warning bbn-l"> </i> ' + bbn._("Alert")
      },
      alertMessage: {
        type: String,
        default: bbn._("There was a problem") + '...'
      },
      confirmTitle: {
        type: String,
        default: bbn._("Confirmation request")
      },
      confirmMessage: {
        type: String,
        default: bbn._("Are you sure?")
      },
      okText: {
        type: String,
        default: bbn._("OK")
      },
      yesText: {
        type: String,
        default: bbn._("Yes")
      },
      noText: {
        type: String,
        default: bbn._("No")
      }
    },

    data: function(){
      return {
        type: false,
        items: []
      }
    },

    computed: {
      popups(){
        let r = [];
        bbn.fn.each(this.items, (a, i) => {
          r.push(this.getObject(bbn.fn.extendOut(a, {index: i})));
        });
        return r;
      },
      showPopup(){
        return this.items.length > 0;
      },
    },

    methods: {
      open(obj){
        let d = {};
        if ( typeof(obj) !== 'object' ){
          for ( let i = 0; i < arguments.length; i++ ){
            if ( !d.content && (typeof(arguments[i]) === 'string') ){
              d.content = arguments[i];
            }
            else if ( bbn.fn.isDimension(arguments[i]) ){
              if ( !d.width ){
                d.width = arguments[i];
              }
              else if ( !d.height ){
                d.height = arguments[i];
              }
            }
            else if ( !d.title && (typeof(arguments[i]) === 'string') ){
              d.title = arguments[i];
            }
            else if (bbn.fn.isFunction(arguments[i]) ){
              if ( !d.open ){
                d.open = arguments[i];
              }
              else if ( !d.close ){
                d.close = arguments[i];
              }
            }
            else if ( typeof(arguments[i]) === 'object' ){
              d.options = arguments[i];
            }
          }
          if ( !d.height ){
            d.height = false;
          }
        }
        else{
          d = obj;
        }
        if ( d ){
          if ( !d.uid ){
            d.uid = 'bbn-popup-' + bbn.fn.timestamp().toString()
          }
          d.index = this.items.length;
          this.items.push(d);
          this.makeWindows();
          return d.uid;
        }
        else{
          new Error("You must give a title and either a content or a component to a popup")
        }
        return false;
      },

      load(obj){
        let d = {};
        if ( typeof(obj) !== 'object' ){
          for ( let i = 0; i < arguments.length; i++ ){
            if ( !d.url && (typeof(arguments[i]) === 'string') ){
              d.url = arguments[i];
            }
            else if ( bbn.fn.isDimension(arguments[i]) || (arguments[i] === 'auto') ){
              if ( !d.width ){
                d.width = arguments[i];
              }
              else if ( !d.height ){
                d.height = arguments[i];
              }
            }
            else if (bbn.fn.isFunction(arguments[i]) ){
              if ( !d.open ){
                d.open = arguments[i];
              }
              else if ( !d.close ){
                d.close = arguments[i];
              }
            }
            else if ( typeof(arguments[i]) === 'object' ){
              if ( !d.data ){
                d.data = arguments[i];
              }
              else if ( !d.options ){
                d.options = arguments[i];
              }
            }
          }
          if ( !d.height ){
            d.height = false;
          }
        }
        else{
          d = obj;
        }
        if ( d.url ){
          bbn.fn.post(d.url, d.data || {}, (r) => {
            if ( r.content || r.title ){
              if ( r.script ){
                let tmp = eval(r.script);
                if (bbn.fn.isFunction(tmp) ){
                  d.open = tmp;
                }
                // anonymous vuejs component initialization
                else if ( typeof(tmp) === 'object' ){
                  bbn.fn.extendOut(tmp, {
                    name: bbn.fn.randomString(20, 15).toLowerCase(),
                    template: '<div class="bbn-overlay">' + (r.content || '') + '</div>',
                    props: ['source']
                  });
                  this.$options.components[tmp.name] = tmp;
                  d.component = this.$options.components[tmp.name];
                  d.source = r.data || [];
                }
              }
              bbn.fn.extend(d, r);
              delete d.url;
              delete d.data;
              if ( !d.uid ){
                d.uid = 'bbn-popup-' + bbn.fn.timestamp().toString()
              }
              d.index = this.items.length;
              this.items.push(d);
              this.makeWindows();
            }
          })
        }
        else{
          new Error("You must give a URL in order to load a popup")
        }
      },

      getObject(a){
        if ( !a.uid ){
          a.uid = 'bbn-popup-' + bbn.fn.timestamp().toString()
        }
        if ( !a.title && this.untitled ){
          a.title = this.untitled;
        }
        if ( !a.component && !a.content ){
          a.content = ' ';
        }
        return a;
      },

      close(idx, force){
        if ( idx === undefined ){
          idx = this.items.length - 1;
        }
        let win = this.getWindow(idx);
        if ( this.items[idx] && win ){
          win.close(idx, force);
          this.$forceUpdate();
        }
      },

      getIndexByUID(uid){
        return bbn.fn.search(this.items, {uid: uid});
      },

      alert(){
        let has_msg = false,
            has_title = false,
            has_width = false,
            has_callback = false,
            okText,
            onOpen,
            onClose,
            i,
            o = {};
        for ( i = 0; i < arguments.length; i++ ){
          if ( !has_msg && (typeof(arguments[i]) === 'string') ){
            o.content = arguments[i];
            has_msg = 1;
          }
          else if ( bbn.fn.isDimension(arguments[i]) || (arguments[i] === 'auto') ){
            if ( has_width ){
              o.height = arguments[i];
            }
            else{
              o.width = arguments[i];
              has_width = 1;
            }
          }
          else if ( !has_title && (typeof arguments[i] === 'string') ){
            o.title = arguments[i];
          }
          else if ( typeof arguments[i] === 'string' ){
            okText = arguments[i];
          }
          else if (bbn.fn.isFunction(arguments[i]) ){
            if ( has_callback ){
              onClose = arguments[i];
            }
            else{
              onOpen = arguments[i];
              has_callback = 1;
            }
          }
        }
        if ( typeof(o) === 'object' ){
          if ( !o.content ){
            o.content = this.alertMessage;
          }
          if ( !o.title ){
            o.title = this.alertTitle;
          }
          if ( !okText ){
            okText = this.okText;
          }
          o.content = '<div class="bbn-lpadded bbn-large bbn-c" style="min-width: 30em">' + o.content + '</div>';
          o.buttons = [{
            text: okText,
            cls: 'bbn-primary',
            icon: 'nf nf-fa-check_circle',
            command($ev, btn){
              if ( onClose ){
                onClose($ev, btn);
              }
              btn.closest('bbn-window').close();
            }
          }];
          /*
          mounted(){
            this.window = bbn.vue.closest(this, 'bbn-window');
            setTimeout(() => {
              let ele = this.getRef('click');
              if ( ele ){
                ele.$el.focus();
              }
            }, 50)
          }
          */
          this.open(bbn.fn.extend(o, {
            maximizable: false,
            closable: false,
            scrollable: false,
            resizable: false
          }));

        }
      },

      confirm(){
        let onYes = false,
            onNo = false,
            yesText = bbn._('Yes'),
            noText = bbn._('No'),
            o = {},
            options = {},
            has_msg = false,
            has_yes = false,
            has_width = false,
            i;
        for ( i = 0; i < arguments.length; i++ ){
          if ( !has_msg && (typeof(arguments[i]) === 'string') ){
            o.content = arguments[i];
            has_msg = 1;
          }
          else if ( bbn.fn.isDimension(arguments[i]) || (arguments[i] === 'auto') ){
            if ( has_width ){
              o.height = arguments[i];
            }
            else{
              o.width = arguments[i];
              has_width = 1;
            }
          }
          else if ( (typeof arguments[i] === 'string') ){
            if ( !has_yes ){
              yesText = arguments[i];
              has_yes = true;
            }
            else{
              noText = arguments[i];
            }
          }
          else if (bbn.fn.isFunction(arguments[i]) ){
            if ( onYes ){
              onNo = arguments[i];
            }
            else{
              onYes = arguments[i];
            }
          }
          else if ( typeof(arguments[i]) === 'object' ){
            options = arguments[i];
          }
        }
        if ( (typeof(o) === 'object') && onYes ){
          if ( !o.content ){
            o.content = this.confirmMessage;
          }
          if ( !o.title ){
            o.title = this.confirmTitle;
          }
          o.content = '<div class="bbn-lpadded bbn-medium">' + o.content + '</div>';
          o.buttons = [{
            text: yesText,
            cls: 'bbn-primary',
            icon: 'nf nf-fa-check_circle',
            command($ev, btn){
              onYes($ev, btn);
              btn.closest('bbn-window').close();
            }
          }, {
            text: noText,
            icon: 'nf nf-fa-times_circle',
            command($ev, btn){
              if ( onNo ){
                onNo($ev, btn);
              }
              btn.closest('bbn-window').close();
            }
          }];
          this.open(bbn.fn.extend(o, {
            resizable: false,
            maximizable: false,
            closable: false
          }));
        }
      },

      makeWindows(){
        this.$forceUpdate();
      },

      getWindow(idx){
        if ( this.popups.length ){
          if ( idx === undefined ){
            idx = this.popups.length - 1;
          }
          if ( this.popups[idx] ){
            //return bbn.vue.getChildByKey(this.$children[0], this.popups[idx].uid);
            return bbn.vue.getChildByKey(this, idx);
          }
        }
        return false;
      }
    },
    beforeCreate(){
      bbn.vue.preloadBBN(['window']);
    },
    mounted(){
      bbn.fn.each(this.popups, a => this.open(a))
    },

    watch: {
      items: function(){
        this.makeWindows()
      }
    }
  });

})(bbn);
