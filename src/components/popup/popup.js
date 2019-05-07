
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

(function($, bbn){
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
          r.push(this.getObject(bbn.fn.extend({index: i}, a)));
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

      getObject(from){
        let a = bbn.fn.clone( from);
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

      alert(o){
        if ( typeof(arguments[0]) !== 'object' ){
          let options = {},
              has_msg = false,
              has_title = false,
              has_width = false,
              has_callback = false,
              i;
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
              o.okText = arguments[i];
            }
            else if (bbn.fn.isFunction(arguments[i]) ){
              if ( has_callback ){
                o.close = arguments[i];
              }
              else{
                o.open = arguments[i];
                has_callback = 1;
              }
            }
            else if ( typeof arguments[i] === 'object' ){
              o.options = arguments[i];
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
          if ( !o.okText ){
            o.okText = this.okText;
          }
          o.content = '<div class="bbn-lpadded bbn-large bbn-c" style="min-width: 30em">' + o.content + '</div>';
          o.footer = {
            template: `
      <div class="bbn-button-group bbn-flex-width">
        <bbn-button @click="click()"
                    icon="nf nf-fa-check_circle"
                    text="` + this.okText + `"
                    class="bbn-flex-fill bbn-primary"
                    tabindex="0"
                    ref="click"
        ></bbn-button>
      </div>
`,
            data(){
              return {
                window: false
              }
            },
            methods: {
              click(){
                this.window.close(true);
              },
            },
            mounted(){
              this.window = bbn.vue.closest(this, 'bbn-window');
              setTimeout(() => {
                let ele = this.getRef('click');
                if ( ele ){
                  ele.$el.focus();
                }
              }, 50)
            }
          };
          this.open(bbn.fn.extend(o, {
            maximizable: false,
            closable: false,
            scrollable: false,
            resizable: false
          }));

        }
      },

      confirm(o){
        let onYes = false,
            onNo = false;
        if ( typeof(o) !== 'object' ){
          o = {title: false};
          let options = {},
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
                o.yesText = arguments[i];
                has_yes = true;
              }
              else{
                o.noText = arguments[i];
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
        }
        bbn.fn.log(arguments, "CONFIRM", o);
        if ( typeof(o) === 'object' ){
          if ( !o.content ){
            o.content = this.confirmMessage;
          }
          if ( !o.title ){
            o.title = this.confirmTitle;
          }
          if ( !o.yesText ){
            o.yesText = this.yesText;
          }
          if ( !o.noText ){
            o.noText = this.noText;
          }
          o.content = '<div class="bbn-lpadded bbn-medium">' + o.content + '</div>';
          o.footer = {
            template: `
      <div class="bbn-button-group bbn-flex-width">
        <bbn-button @click="yes()"
                    icon="nf nf-fa-check_circle"
                    text="` + o.yesText + `"
                    class="bbn-flex-fill bbn-primary"
                    tabindex="0"
                    ref="yes"
        ></bbn-button>
        <bbn-button @click="no()"
                    icon="nf nf-fa-times_circle"
                    text="` + o.noText + `"
                    class="bbn-flex-fill"
                    tabindex="0"
                    ref="no"
        ></bbn-button>
      </div>
`,
            data(){
              return {
                window: false
              }
            },
            methods: {
              yes(){
                bbn.fn.log(this.window);
                this.window.close(true);
                if ( onYes ){
                  onYes();
                }
              },
              no(){
                this.window.close(true);
                if ( onNo ){
                  onNo();
                }
              },
            },
            mounted(){
              this.window = bbn.vue.closest(this, 'bbn-window');
              setTimeout(() => {
                this.$refs.no.$el.focus();
              }, 50)
            }
          };
          this.open(bbn.fn.extend(o, {
            resizable: false,
            maximizable: false,
            closable: true
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
            return bbn.vue.getChildByKey(this, this.popups[idx].uid);
          }
        }
        return false;
      }
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

})(jQuery, bbn);
