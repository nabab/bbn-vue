(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="componentClass">
  <bbn-floater v-for="(it, idx) in items"
               :ref="'it' + it.id"
               :key="it.id"
               :focused="false"
               :top="isTop && (positions[it.id] !== undefined) ? positions[it.id] : undefined"
               :bottom="isTop || (positions[it.id] === undefined) ? undefined : positions[it.id]"
               :left="isLeft ? 0 : undefined"
               :title="false"
               :scrollable="true"
               :right="isLeft ? undefined : 0">
    <div :class="{
        'bbn-notification-content': true,
        'bbn-block': true,
        'bbn-white': !!it.type,
        'bbn-light': true,
        'bbn-m': true,
        'bbn-lpadded': true,
        'bbn-bg-green': it.type === 'success',
        'bbn-bg-orange': it.type === 'warning',
        'bbn-bg-red': it.type === 'error',
        'bbn-b': it.type === 'error',
        'bbn-bg-blue': it.content && (it.type === 'info')
    }">
      <span v-if="it.content"
            v-html="it.content">
      </span>
      <span v-else-if="it.type === 'success'"
            v-html="successMessage">
      </span>
      <span v-else-if="it.type === 'warning'"
            v-html="warningMessage">
      </span>
      <span v-else-if="it.type === 'error'"
            v-html="errorMessage">
      </span>
      <div :class="{
          'bbn-notification-closer': true,
          'bbn-p': true,
          'bbn-white': !!it.type
      }"
          @click="close(it.id)">
          <i class="bbn-lg nf nf-fa-times"></i>
      </div>
    </div>
  </bbn-floater>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-notification');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/notification/notification.css");
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-notification component
 * @description bbn-notification is a component that allows the display of a brief information message, for example to confirm the success of an action that has taken place.
 * @author BBN Solutions
 * @copyright BBN Solutions
 * @created 11/01/2017
 */
((bbn) => {
  "use strict";

  Vue.component('bbn-notification', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * @prop {Number}, [5000] delay
       */
      delay: {
        type: Number,
        default: 5000
      },
      /**
       * @prop pinned
       */
      pinned: {},
      /**
       * @prop {String}, ['bottom-left'] position
       */
      position: {
        type: String,
        default: 'bottom-left'
      },
      /**
       * @prop {String|Function}, ['Success'] successMessage
       */
      successMessage: {
        type: [String, Function],
        default: bbn._('Success')
      },
      /**
       * @prop {String|Function}, ['Warning'] warningMessage
       */
      warningMessage: {
        type: [String, Function],
        default: bbn._('Warning')
      },
      /**
       * @prop {String|Function}, ['Error'] errorMessage
       */
      errorMessage: {
        type: [String, Function],
        default: bbn._('Error')
      },
      /**
       * @prop {String|Function}, ['Info'] infoMessage
       */
      infoMessage: {
        type: [String, Function],
        default: bbn._('Info')
      }
    },
    data: function(){
      let bits = this.position.split('-');
      let pos = {
        v: {
          top: false,
          bottom: true
        },
        h: {
          left: false,
          right: true
        }
      };
      bbn.fn.each(bits, (bit) => {
        bbn.fn.iterate(pos, (o, dir) => {
          if ( o[bit.toLowerCase()] ){
            bbn.fn.iterate(o, (b, k) => {
              if ( bit === k ){
                pos[dir][k] = true;
              }
              else{
                pos[dir][k] = false;
              }
            });
          }
        });
      });
      return {
        /**
         * @data {Array} [[]] items
         */
        items: [],
        /**
         * @data {Boolean} isTop
         */
        isTop: pos.v.top,
        /**
         * @data {Boolean} isLeft
         */
        isLeft: pos.h.left,
        /**
         * @data {Object} [{}] positions
         */
        positions: {}
      };
    },
    methods: {
      /**
       * @method _sanitize
       * @param {Object} obj
       * @param {String} type
       * @param {Number} timeout
       * @return {Object}
       */
      _sanitize(obj, type, timeout){
        if ( typeof obj === 'string' ){
          obj = {content: obj};
        }
        else if ( !obj ){
          obj = {};
        }
        obj.type = type;
        if ( !obj.type ){
          obj.type = 'info';
        }
        if ( !obj.content && this[type + 'Message'] ){
          obj.content = bbn.fn.isFunction(this[type + 'Message']) ? this[type + 'Message'](obj) : this[type + 'Message']
        }
        if ( !obj.content ){
          obj.content = '';
        }
        if ( timeout && !obj.delay ){
          obj.delay = timeout > 500 ? timeout : timeout * 1000;
        }
        else{
          obj.pinned = true;
        }
      return obj;
      },
      /**
       * @method add
       * @param {Object} o
       */
      add(o){
        let id = (new Date()).getTime();
        o.id = id;
        this.items.push(o);
        if ( o.delay ){
          setTimeout(() => {
            let idx = bbn.fn.search(this.items, {id: id});
            if ( idx > -1 ){
              this.items.splice(idx, 1);
            }
          }, o.delay);
        }
      },
      /**
       * @method _updatePositions
       * @fires getRef
       */
      _updatePositions(){
        let p = {};
        let top = 0;
        bbn.fn.each(this.items, (a) => {
          p[a.id] = top;
          let cp = this.getRef('it' + a.id);
          if (cp) {
            top += cp.$el.getBoundingClientRect().height;
          }
        });
        bbn.fn.iterate(bbn.fn.diffObj(this.positions, p), (a, k) => {
          let v = undefined;
          if (a.type === 'updated') {
            v = a.newData;
          }
          else if (a.type === 'created') {
            v = a.data;
          }
          this.$set(this.positions, k, v);
          let cp = this.getRef('it' + k);
          if (cp) {
            setTimeout(() => {
              cp.onResize(true);
            }, 100);
          }
        });
      },
      /**
       * @method close
       * @param {Number} id
       */
      close(id){
        let idx = bbn.fn.search(this.items, {id: id});
        if ( idx > -1 ){
          this.items.splice(idx, 1);
        }
      },
      /**
       * @method success
       * @param {Object} o
       * @param {Number} timeout
       * @fires _sanitize
       * @fires add
       */
      success(o, timeout){
        if ( !timeout ){
          timeout = this.delay;
        }
        o = this._sanitize(o, 'success', timeout);
        this.add(o);
      },
      /**
       * @method error
       * @param {Object} o
       * @param {Number} timeout
       * @fires _sanitize
       * @fires add
       */
      error(o, timeout){
        o = this._sanitize(o, 'error', timeout);
        this.add(o);
      },
      /**
       * @method warning
       * @param {Object} o
       * @param {Number} timeout
       * @fires _sanitize
       * @fires add
       */
      warning(o, timeout){
        o = this._sanitize(o, 'warning', timeout);
        this.add(o);
      },
      /**
       * @method show
       * @param {Object} o
       * @param {String} type
       * @param {Number} timeout
       * @fires _sanitize
       * @fires add
       */
      show(o, type, timeout){
        o = this._sanitize(o, type, timeout);
        this.add(o);
      },
      /**
       * @method info
       * @param {Object} o
       * @param {Number} timeout
       * @fires _sanitize
       * @fires add
       */
      info(o, timeout){
        o = this._sanitize(o, 'info', timeout);
        this.add(o);
      },
    },
    /**
     * @event beforeMount
     * @fires _updatePositions
     */
    beforeMount(){
      this._updatePositions();
    },
    watch: {
      /**
       * @watch items
       * @fires _updatePositions
       */
      items(){
        this.$nextTick(() => {
          this._updatePositions();
        });
      }
    }
  });
})(window.bbn);

bbn_resolve("ok");
})(bbn); }