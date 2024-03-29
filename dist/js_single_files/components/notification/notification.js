((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="componentClass">
  <bbn-floater v-for="(it, idx) in items"
               :ref="'it' + it.id"
               :key="it.id"
               :focused="false"
               :container="$root.$el"
               :class="{
                  'bbn-notification-transition': positions[it.id] !== undefined,
                  'bbn-notification-closing': !!it.closing
               }"
               :top="isTop && (positions[it.id] !== undefined) ? positions[it.id] : undefined"
               :bottom="isTop || (positions[it.id] === undefined) ? undefined : positions[it.id]"
               :left="isLeft ? 0 : undefined"
               :right="isLeft ? undefined : 0"
               :title="false"
               :scrollable="true"
               @resize="_updatePositions"
               @hook.destroy="_updatePositions">
    <div :class="{
        'bbn-notification-content': true,
        'bbn-block': true,
        'bbn-unselectable': true,
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
      <span class="bbn-notification-icon bbn-iblock bbn-lg"
            v-if="it.icon">
        <i :class="[it.icon, it.type ? 'bbn-white' : 'bbn-black']"/>
      </span>
      <span v-if="it.content"
            class="bbn-iblock"
            v-html="it.content"/>
      <span v-else-if="it.type === 'success'"
            class="bbn-iblock"
            v-html="successMessage"/>
      <span v-else-if="it.type === 'warning'"
            class="bbn-iblock"
            v-html="warningMessage"/>
      <span v-else-if="it.type === 'error'"
            class="bbn-iblock"
            v-html="errorMessage"/>
      <div v-if="it.num > 1"
           class="bbn-iblock bbn-top-left bbn-hsmargin bbn-vxsmargin">
        <span class="bbn-badge bbn-small bbn-bg-red"
              v-text="it.num"/>
      </div>
      <div :class="{
          'bbn-notification-closer': true,
          'bbn-top-right': true,
          'bbn-vxsmargin': true,
          'bbn-hsmargin': true,
          'bbn-p': true,
          'bbn-white': !!it.type
      }"
          @click="close(it.id, true)">
          <i class="bbn-lg nf nf-fa-times"/>
      </div>
    </div>
  </bbn-floater>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-notification');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

/**
 * @file bbn-notification component
 * @description bbn-notification is a component that allows the display of a brief information message, for example to confirm the success of an action that has taken place.
 * @author BBN Solutions
 * @copyright BBN Solutions
 * @created 11/01/2017
 */
(bbn => {
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
       * @prop {String}, ['bottom-left'] position
       */
      position: {
        type: String,
        default: 'bottom-right'
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
      },
      /**
       * @prop {String|Boolean}, ['nf nf-fa-check_square'] successIcon
       */
      successIcon: {
        type: [String, Boolean],
        default: 'nf nf-fa-check_square'
      },
      /**
       * @prop {String|Boolean}, ['nf nf-fa-warning'] warningIcon
       */
      warningIcon: {
        type: [String, Boolean],
        default: 'nf nf-fa-warning'
      },
      /**
       * @prop {String|Boolean}, ['nf nf-fa-exclamation_circle'] errorIcon
       */
      errorIcon: {
        type: [String, Boolean],
        default: 'nf nf-fa-exclamation_circle'
      },
      /**
       * @prop {String|Boolean}, ['nf nf-mdi-information'] infoIcon
       */
      infoIcon: {
        type: [String, Boolean],
        default: 'nf nf-mdi-information'
      },
      /**
       * The source of the component.
       * @prop {Array} [[]] source
       */
      source: {
        type: Array,
        default(){
          return [];
        }
      },
    },
    data(){
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
      bbn.fn.each(bits, bit => {
        bbn.fn.iterate(pos, (o, dir) => {
          if ( o[bit.toLowerCase()] !== undefined){
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
        items: this.source,
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
        if (!bbn.fn.isObject(obj) || (!obj.id)) {
          if ( typeof obj === 'string' ){
            obj = {content: obj};
          }
          else if ( !obj ){
            obj = {};
          }
          if ( !obj.type ){
            if (type) {
              obj.type = type;
            }
            else {
              //obj.type = 'info';
            }
          }
          let id = (new Date()).getTime() + bbn.fn.randomString(10);
          obj.id = id;
          obj.num = 1;
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
          if (obj.icon !== false) {
            if ((obj.icon === undefined) && obj.type && this[obj.type + 'Icon']) {
              obj.icon = this[obj.type + 'Icon'];
            }
          }
        }
        return obj;
      },
      /**
       * @method add
       * 
       * @param {Object} o
       */
      add(o) {
        o = this._sanitize(o);
        let idx = bbn.fn.search(this.items, {
          content: o.content,
          type: o.type,
          icon: o.icon
        });
        if (idx > -1) {
          o.num += this.items[idx].num;
          this.items.splice(idx, 1);
        }
        this.items.push(o);
        this._updatePositions();
        if ( o.delay ){
          setTimeout(() => {
            this.close(o.id);
          }, o.delay);
        }
      },
      /**
       * @method _updatePositions
       * @fires getRef
       */
      _updatePositions(){
        let p = {};
        let pos = 0;
        let ids = [];
        bbn.fn.each(this.items, a => {
          let cp = this.getRef('it' + a.id);
          let s;
          if (cp) {
            s = cp.$el.getBoundingClientRect().height;
          }
          if (a.closing) {
            p[a.id] = this.positions[a.id];
          }
          else {
            p[a.id] = pos;
            if (s) {
              pos += s;
            }
          }
          ids.push(a.id);
        });
        bbn.fn.iterate(bbn.fn.diffObj(this.positions, p), (a, k) => {
          if (a.type === 'updated') {
            this.positions[k] = a.newData;
          }
          else if (a.type === 'created') {
            this.positions[k] = a.data;
          }
          else if (a.type === 'deleted') {
            delete this.positions[k];
          }
        });
        this.$forceUpdate();
      },
      /**
       * @method close
       * @param {Number} id
       */
      close(id, callCallback){
        let idx = bbn.fn.search(this.items, {id: id});
        if ( idx > -1 ){
          if (callCallback && this.items[idx].onClose && bbn.fn.isFunction(this.items[idx].onClose)){
            this.items[idx].onClose(this.items[idx]);
          }
          this.items.splice(idx, 1);
          this._updatePositions();
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
    }
  });
})(window.bbn);


})(bbn);