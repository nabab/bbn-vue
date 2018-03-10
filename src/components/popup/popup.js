/**
 * Created by BBN on 15/02/2017.
 */
(function($, bbn, kendo){
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
        default: '<i class="fa fa-warning bbn-l"> </i> ' + bbn._("Alert")
      },
      alertText: {
        type: String,
        default: bbn._("There was a problem...")
      },
      confirmTitle: {
        type: String,
        default: bbn._("Confirmation request")
      },
      confirmText: {
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
        $.each(this.items, (i, a) => {
          r.push(this.getObject($.extend({index: i}, a)));
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
            else if ( $.isFunction(arguments[i]) ){
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
            else if ( $.isFunction(arguments[i]) ){
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
                if ( $.isFunction(tmp) ){
                  d.open = tmp;
                }
                // anonymous vuejs component initialization
                else if ( typeof(tmp) === 'object' ){
                  bbn.fn.extend(tmp, {
                    name: bbn.fn.randomString(20, 15).toLowerCase(),
                    template: '<div class="bbn-full-screen">' + (r.content || '') + '</div>',
                    props: ['source']
                  });
                  this.$options.components[tmp.name] = tmp;
                  d.component = this.$options.components[tmp.name];
                  d.source = r.data || [];
                }
              }
              $.extend(d, r);
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
        let a = $.extend({}, from);
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
            else if ( $.isFunction(arguments[i]) ){
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
            o.content = this.alertText;
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
      <div class="k-button-group k-dialog-buttongroup k-dialog-button-layout-stretched bbn-flex-width">
        <bbn-button @click="click()"
                    icon="fa fa-check-circle"
                    text="` + this.okText + `"
                    class="bbn-flex-fill k-primary"
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
                this.$refs.click.$el.focus();
              }, 50)
            }
          };
          this.open($.extend(o, {
            maximizable: false,
            closable: false,
            scrollable: false
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
            else if ( !has_yes && (typeof arguments[i] === 'string') ){
              o.yesText = arguments[i];
            }
            else if ( typeof(arguments[i]) === 'string' ){
              o.noText = arguments[i];
            }
            else if ( $.isFunction(arguments[i]) ){
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
        if ( typeof(o) === 'object' ){
          if ( !o.content ){
            o.content = this.confirmText;
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
          o.content = '<div class="bbn-lpadded bbn-large">' + o.content + '</div>';
          o.footer = {
            template: `
      <div class="k-button-group k-dialog-buttongroup k-dialog-button-layout-stretched bbn-flex-width">
        <bbn-button @click="yes()"
                    icon="fa fa-check-circle"
                    text="` + o.yesText + `"
                    class="bbn-flex-fill k-primary"
                    tabindex="0"
                    ref="yes"
        ></bbn-button>
        <bbn-button @click="no()"
                    icon="fa fa-times-circle"
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
          this.open($.extend(o, {
            resizable: false,
            maximizable: false,
            closable: false
          }));
        }
      },

      center(idx){
        if ( this.items[idx] ){
          this.$nextTick(() => {
            let ele = $(".bbn-popup-unit", this.$el).eq(idx);
            //bbn.fn.center(ele);
            /*
            if ( !ele.hasClass("ui-draggable") ){
              if ( this.popups[idx].draggable !== false ){
                ele.draggable({
                  handle: ".bbn-popup-title > span",
                  containment: ".bbn-popup"
                });
              }
              if ( this.items[idx].resizable !== false ){
                ele.resizable({
                  handles: "se",
                  containment: ".bbn-popup",
                  resize: () => {
                    bbn.fn.redraw(ele, true);
                    this.selfEmit();
                  },
                  stop: () => {
                    this.center(idx);
                    this.selfEmit();
                  }
                });
              }
            }
            let scroll = this.getWindow(idx).$refs.scroll;
            if ( scroll ){
              if ( scroll[0] ){
                scroll[0].onResize();
              }
              else{
                scroll.onResize();
              }
            }
            */
          })
        }
      },

      makeWindows(){
        this.$forceUpdate();
        this.$nextTick(() => {
          $.each(this.items, (i, a) => {
            //this.center(i);
          })
        })
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

      $.each(this.popups, (i, a) => {
        this.open(a);
      })
    },

    watch: {
      items: function(){
        this.makeWindows()
      },
    },

    components: {
      'bbn-window': {
        name: 'bbn-window',
        mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
        props: {
          width: {
            type: [String, Number, Boolean]
          },
          height: {
            type: [String, Number, Boolean]
          },
          minWidth: {
            type: [String, Number]
          },
          minHeight: {
            type: [String, Number]
          },
          maxWidth: {
            type: [String, Number]
          },
          maxHeight: {
            type: [String, Number]
          },
          maximizable: {
            type: Boolean,
            default: true
          },
          closable: {
            type: Boolean,
            default: true
          },
          scrollable: {
            type: Boolean,
            default: true
          },
          maximized: {
            type: Boolean,
            default: false
          },
          onClose: {
            type: Function
          },
          afterClose: {
            type: Function
          },
          footer: {
            type: [Function, String, Object]
          },
          beforeClose: {
            type: Function
          },
          open: {
            type: Function
          },
          source: {
            type: Object,
            default(){
              return {};
            }
          },
          component: {
            type: [String, Function, Object]
          },
          title: {
            type: [String, Boolean],
            default: bbn._("Untitled")
          },
          index: {
            type: Number
          },
          uid: {
            type: String
          },
          content: {
            type: String
          },
          draggable: {
            type: Boolean,
            default: false
          },
          resizable: {
            type: Boolean,
            default: true
          }
        },
        data(){
          let fns = [];
          if ( this.onClose ){
            fns.push(this.onClose);
          }
          return {
            isMaximized: this.maximized,
            widthUnit: (typeof this.width === 'string') && (this.width.substr(-1) === '%') ? '%' : 'px',
            currentWidth: this.width,
            heightUnit: (typeof this.height === 'string') && (this.height.substr(-1) === '%') ? '%' : 'px',
            currentHeight: this.height,
            closingFunctions: fns,
            showContent: false,
            popup: false,
          }
        },

        computed: {
          realWidth(){
            if ( !this.currentWidth ){
              return 'auto';
            }
            if ( typeof this.currentWidth === 'number' ){
              return this.currentWidth.toString() + 'px'
            }
            return this.currentWidth;
          },
          realHeight(){
            if ( !this.currentHeight ){
              return 'auto';
            }
            if ( typeof this.currentHeight === 'number' ){
              return this.currentHeight.toString() + 'px'
            }
            return this.currentHeight;
          },
        },

        methods: {
          onResize(){
            if ( this.realHeight === 'auto' ){
              let target = $('div.bbn-scroll-container', this.$refs.container[0])[0],
                  height = target ? target.scrollHeight : 0;

              if ( height ){
                //height += 50;
              }
              else {
                target = $('div.bbn-flex-height', this.$refs.container[0])[0];
                height = target ? target.scrollHeight : 0;
              }
              if ( !height ){
                height = '90%';
              }
              else if ( height > bbn.env.height ){
                height = bbn.env.height + 'px';
              }
              else{
                height += 'px';
              }
              this.$refs.container[0].style.height = height;
            }
            this.$nextTick(() => {
              let scroll = bbn.vue.find(this, 'bbn-scroll');
              if ( scroll ){
                scroll.selfEmit(true);
              }
            });
          },
          addClose(fn){
            for ( let i = 0; i < arguments.length; i++ ){
              if ( typeof arguments[i] === 'function' ){
                this.closingFunctions.push(arguments[i])
              }
            }
          },
          removeClose(fn){
            if ( !fn ){
              this.closingFunctions = [];
            }
            else{
              this.closingFunctions = $.grep(this.closingFunctions, (f) => {
                return fn !== f;
              })
            }
          },
          close(force){
            let ev = $.Event('close');
            if ( !force ){
              ev = $.Event('beforeClose');
              this.popup.$emit('beforeClose', ev, this);
              if ( ev.isDefaultPrevented() ){
                return;
              }
              if ( this.beforeClose && (this.beforeClose(this) === false) ){
                return;
              }
              $.each(this.closingFunctions, (i, a) => {
                a(this, ev);
              });
            }
            if ( !ev.isDefaultPrevented() ){
              this.$el.style.display = 'block';
              this.$nextTick(() => {
                this.$emit("close", this);
                if ( this.afterClose ){
                  this.afterClose(this);
                }
              })
            }
          },
          onShow(){
            this.onResize();
          }
        },
        created(){
          this.popup = bbn.vue.closest(this, 'bbn-popup');
        },
        mounted(){
          this.$el.style.display = 'block';
          if ( this.resizable ){
            $(this.getRef('window')).resizable({
              handles: "se",
              containment: ".bbn-popup",
              resize: () => {
                this.selfEmit(true);
              },
              stop: () => {
                this.selfEmit(true);
              }
            });
          }
          /*
          // It shouldn't be centered if it's draggable
          if ( this.draggable ){
            $(this.getRef('window')).draggable({
              handle: 'header > h4',
              containment: ".bbn-popup"
            });
          }
          */
        },
        watch: {
          isMaximized(){
            this.$nextTick(() => {
              this.onResize();
            })
          },
        }
      }
    }
  });

})(jQuery, bbn, kendo);
