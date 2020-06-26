(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="['bbn-overlay', componentClass]"
     v-show="showPopup"
     :style="{zIndex: zIndex}"
>
  <bbn-floater v-if="showPopup"
              v-for="(popup, i) in popups"
              :key="i"
              :ref="popup.uid"
              :index="i"
              v-bind="popup"
              :container="$el"
              :style="{zIndex: zIndex+i}"
              @close="items.splice(i, 1)"
  ></bbn-floater>
  <div class="bbn-modal bbn-overlay"
      tabindex="-1"
      :style="{zIndex: zIndex+items.length-2}"
      @keydown.esc.prevent.stop="close(items.length-1)"
  ></div>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-popup');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/popup/popup.css");
document.head.insertAdjacentElement('beforeend', css);

/**
 * @file bbn-popup component
 * @description bbn-popup is a component very similar to a desktop window of an operating system.
 * Inside you can show what you wish, even the components with its information.
 * Its potential lies in the fact that it emphasizes with a particular attention that portion of information that we want to see, enclosed in a window that can be opened or closed upon request.
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 15/02/2017
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-popup', {
    /**
     * @mixin bbn.vue.basicComponent
     * @minix bbn.vue.resizerComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      /**
       * @prop {String|Number} ['70%'] defaultWidth
       */
      defaultWidth: {
        type: [String, Number],
        default: '70%'
      },
      /**
       * @prop {String|Number} ['70%'] defaultHeight
       */
      defaultHeight: {
        type: [String, Number],
        default: '70%'
      },
      /**
       * @prop {String} ['United'] united
       */
      untitled: {
        type: String,
        default: bbn._("Untitled")
      },
      /**
       * @prop {Array} [[]] source
       */
      source: {
        type: Array,
        default: function(){
          return [];
        }
      },
      /**
       * @prop {Number} [10] zIndex
       */
      zIndex: {
        type: Number,
        default: 10
      },
      /**
       * @prop {String} ['<i class="nf nf-fa-warning bbn-l"> </i>  Alert'] alertTitle
       */
      alertTitle: {
        type: String,
        default: '<i class="nf nf-fa-warning bbn-l"> </i> ' + bbn._("Alert")
      },
      /**
       * @prop {String} ['There was a problem...'] alertMessage
       */
      alertMessage: {
        type: String,
        default: bbn._("There was a problem") + '...'
      },
      /**
       * @prop {String} ['Confirmation request] confirmTitle
       */
      confirmTitle: {
        type: String,
        default: bbn._("Confirmation request")
      },
      /**
       * @prop {String} ['Are you sure?'] confirmMessage
       */
      confirmMessage: {
        type: String,
        default: bbn._("Are you sure?")
      },
      /**
       * @prop {String} ['OK'] okText
       */
      okText: {
        type: String,
        default: bbn._("OK")
      },
      /**
       * @prop {String} ['Yes'] yesText
       */
      yesText: {
        type: String,
        default: bbn._("Yes")
      },
      /**
       * @prop {String} ['No'] noText
       */
      noText: {
        type: String,
        default: bbn._("No")
      }
    },
    data: function(){
      return {
        /**
         * @data [false] type
         */
        type: false,
        /**
         * @data [[]] items
         */
        items: []
      };
    },
    computed: {
      /**
       * @computed popus
       * @fires getObject
       * @return {Array}
       */
      popups(){
        let r = [];
        bbn.fn.each(this.items, (a, i) => {
          r.push(this.getObject(bbn.fn.extendOut(a, {index: i})));
        });
        return r;
      },
      /**
       * @computed showPopup
       * @return {Boolean}
       */
      showPopup(){
        return this.items.length > 0;
      }
    },
    methods: {
      /**
       * Alias of bbn.fn.randomString
       * @method randomString
      */
      randomString: bbn.fn.randomString,
      /**
       * @method open
       * @param {Object} obj
       * @return {String|Boolean}
       */
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
            else if ( !d.title && (arguments[i] === false) ){
              d.title = false;
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
            d.uid = 'bbn-popup-' + bbn.fn.timestamp().toString();
          }
          d.index = this.items.length;
          this.items.push(d);
          //this.makeWindows();
          return d.uid;
        }
        else{
          new Error("You must give a title and either a content or a component to a popup")
        }
        return false;
      },
      /**
       * @method load
       * @param {Object} obj
       * @fires post
       * @fires makeWindows
       */
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
          this.post(d.url, d.data || {}, (r) => {
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
                d.uid = 'bbn-popup-' + bbn.fn.timestamp().toString();
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
      /**
       * @method getObject
       * @param {Object} a
       * @return {Object}
       */
      getObject(a){
        if ( !a.uid ){
          a.uid = 'bbn-popup-' + bbn.fn.timestamp().toString()
        }
        if ( a.closable === undefined ){
          a.closable = true;
        }
        if ( (a.title === undefined) && this.untitled ){
          a.title = this.untitled;
        }
        if ( !a.component && !a.content ){
          a.content = ' ';
        }
        return a;
      },
      /**
       * @method loading
       * @fires open
       * @return {String|Boolean}
       */
      loading(){
        return this.open({
          title: false,
          content: `
<div class="bbn-middle" style="width: 500px; height: 250px">
  <div class="bbn-block bbn-c bbn-b bbn-xl">` + bbn._('Loading') + `...</div>
</div>`,
          width: 500,
          height: 250,
          scrollable: false
        })
      },
      /**
       * @method close
       * @param {Number} idx
       * @param {Boolean} force
       * @fires getWindows
       */
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
      /**
       * @method getIndexByUID
       * @param {String} uid
       * @return {Number}
       */
      getIndexByUID(uid){
        return bbn.fn.search(this.items, {uid: uid});
      },
      /**
       * @method alert
       * @fires open
       */
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
            action($ev, btn){
              if ( onClose ){
                onClose($ev, btn);
              }
              btn.closest('bbn-floater').close();
            }
          }];
          /*
          mounted(){
            this.window = bbn.vue.closest(this, 'bbn-floater');
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
            scrollable: true,
            resizable: false
          }));
        }
      },
      /**
       * @method confirm
       * @fires open
       */
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
            action($ev, btn){
              btn.closest('bbn-floater').close();
              setTimeout(() => {
                onYes($ev, btn);
              }, 0)
            }
          }, {
            text: noText,
            icon: 'nf nf-fa-times_circle',
            action($ev, btn){
              btn.closest('bbn-floater').close();
              if ( onNo ){
                setTimeout(() => {
                  onNo($ev, btn);
                }, 0)
              }
            }
          }];

          this.open(bbn.fn.extend(o, {
            resizable: false,
            maximizable: false,
            closable: false,
            scrollable: true
          }));
        }
      },
      /**
       * @method makeWindows
       */
      makeWindows(){
        this.$forceUpdate();
      },
      /**
       * @method getWindow
       * @param {Number} idx
       * @return {Object|Boolean}
       */
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
    /**
     * @event mounted
     */
    mounted(){
      bbn.fn.each(this.popups, a => this.open(a))
    },
    watch: {
      /**
       * @watch items
       * @fires makeWindows
       */
      items: function(){
        this.makeWindows()
      }
    }
  });

})(bbn);

bbn_resolve("ok");
})(bbn); }