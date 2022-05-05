((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-modal']"
     :style="containerCSS"
     tabindex="-1"
     @animationstart="onResize"
     @keydown.esc.prevent.stop="close">
  <bbn-floater v-if="ready"
              :title="title"
              :maximizable="maximizable"
              :closable="closable"
              :animation="true"
              :width="width"
              :height="height"
              :min-width="minWidth"
              :max-width="maxWidth"
              :min-height="minHeight"
              :max-height="maxHeight"
              :component="component"
              :buttons="buttons"
              :footer="footer"
              :content="content"
              :source="source"
              :container="$el"
              @beforeClose="floaterClose"
              :latency="500"
              @keydown.esc.prevent.stop="close"
              :scrollable="scrollable"
              :draggable="draggable"
              :resizable="resizable"
              :on-open="onOpen"
              :on-close="onClose"
              :uid="uid">
    <slot></slot>
  </bbn-floater>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-window');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

/**
 * @file bbn-window component
 *
 * @description The bbn-window is a component that represents a modal window in which it is possible to show the content.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 15/02/2017
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-window', {
    name: 'bbn-window',
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.dimensionsComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.resizerComponent,
      bbn.vue.dimensionsComponent
    ],
    props: {
      /**
       * @prop {Boolean} [true] maximazable
       */
      maximizable: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Boolean} [true] closable
       */
      closable: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Boolean} [false] draggable
       */
      draggable: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Boolean} [true] resizable
       */
      resizable: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Boolean} [false] maximized
       */
      maximized: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Function} onOpen
       */
      onOpen: {
        type: Function
      },
      /**
       * @prop {Function} beforeClose
       */
      beforeClose: {
        type: Function
      },
      /**
       * @prop {Function} onClose
       */
      onClose: {
        type: Function
      },
      /**
       * @prop {Function} afterClose
       */
      afterClose: {
        type: Function
      },
      /**
       * @prop {Function|String|Object} footer
       */
      footer: {
        type: [Function, String, Object]
      },
      /**
       * @prop {Array} [[]] buttons
       */
      buttons: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * @prop {Object} [{}] source
       */
      source: {
        type: Object,
        default(){
          return {};
        }
      },
      /**
       * @prop {String|Function|Object} component
       */
       component: {
        type: [String, Function, Object]
      },
      /**
       * @prop {String|Boolean} ['Untitled'] title
       */
      title: {
        type: [String, Boolean],
        default: bbn._("Untitled")
      },
      /**
       * @prop {String} uid
       */
      uid: {
        type: String
      },
      /**
       * @prop {String} content
       */
      content: {
        type: String
      },
      /**
       * @prop {String} mode
       */
      mode: {
        type: String
      }
    },
    data(){
      let fns = [];
      if ( this.onClose ){
        fns.push(this.onClose);
      }
      return {
        /**
         * @data {Boolean} isMaximized
         */
        isMaximized: this.maximized,
        /**
         * @data {String} widthUnit
         */
        widthUnit: (typeof this.width === 'string') && (bbn.fn.substr(this.width, -1) === '%') ? '%' : 'px',
        /**
         * @data {Number|String|Boolean} currentWidth
         */
        currentWidth: this.width,
        /**
         * @data {String} heightUnit
         */
        heightUnit: (typeof this.height === 'string') && (bbn.fn.substr(this.height, -1) === '%') ? '%' : 'px',
        /**
         * @data {Number|String|Boolean} currentHeight
         */
        currentHeight: this.height,
        /**
         * @data {Array} closingFunctions
         */
        closingFunctions: fns,
        /**
         * @data {Boolean} [false] showContent
         */
        showContent: false,
        /**
         * @data {Boolean|Vue} [false] popup
         */
        popup: false,
        /**
         * @data {Object} [{opacity: 0}] containerCss
         */
        containerCSS: {
          opacity: 0
        }
      }
    },
    computed: {
      /**
       * @computed realWidth
       * @returns {String}
       */
      realWidth(){
        if ( !this.currentWidth ){
          return 'auto';
        }
        if ( typeof this.currentWidth === 'number' ){
          return this.currentWidth.toString() + 'px'
        }
        return this.currentWidth;
      },
      /**
       * @computed realHeight
       * @returns {String}
       */
      realHeight(){
        if ( !this.currentHeight ){
          return 'auto';
        }
        if ( typeof this.currentHeight === 'number' ){
          return this.currentHeight.toString() + 'px'
        }
        return this.currentHeight;
      }
    },
    methods: {
      /**
       * @method getContainerPosition
       * @returns {Object}
       */
      getContainerPosition(){
        return this.$el ? this.$el.parentNode.getBoundingClientRect() : {};
      },
      /**
       * @method onResize
       * @fires getContainerPosition
       */
      onResize(){
        let o = this.getContainerPosition();
        this.containerCSS = {
          opacity: 1,
          top: o.top + 'px',
          left: o.left + 'px',
          width: o.width + 'px',
          height: o.height + 'px',
        }
      },
      /**
       * @method addClose
       * @param {Function} fn
       */
      addClose(fn){
        for ( let i = 0; i < arguments.length; i++ ){
          if ( typeof arguments[i] === 'function' ){
            this.closingFunctions.push(arguments[i])
          }
        }
      },
      /**
       * @method removeClose
       * @param {Function} fn
       */
      removeClose(fn){
        if (!fn) {
          this.closingFunctions = [];
        }
        else {
          this.closingFunctions = bbn.fn.filter(this.closingFunctions, f => {
            return fn !== f;
          })
        }
      },
      /**
       * @method floaterClose
       * @param {Event} e
       * @fires close
       */
      floaterClose(e){
        this.close(false, e);
      },
      /**
       * @method close
       * @param {Boolean} force
       * @param {Event} ev
       * @emits {beforeClose}
       * @fires beforeClose
       * @fires $nextTick
       * @fires afterClose
       * @emits close
       */
      close(force, ev){
        let ok = true;
        if ( !ev ){
          ev = new Event('beforeClose', {cancelable: true});
        }
        if ( !force ){
          if ( this.popup ){
            this.popup.$emit('beforeClose', ev, this);
          }
          else{
            this.$emit('beforeClose', ev, this);
          }
          if ( this.beforeClose && (this.beforeClose(this) === false) ){
            return;
          }
        }
        /*
        bbn.fn.each(this.closingFunctions, a => {
          if (!ev.defaultPrevented) {
            a(this, ev);
          }
        });
        */
        if (!force && bbn.fn.isObject(ev) && ev.defaultPrevented) {
          return;
        }
        let closeEvent = new Event('close', {cancelable: true});
        this.$el.style.display = 'block';
        this.$nextTick(() => {
          this.$emit("close", this, closeEvent);
          if ( this.afterClose ){
            this.afterClose(this);
          }
        })
      }
    },
    /**
     * @event created
     * @fires closest
     */
    created(){
      this.popup = this.closest('bbn-popup');
    },
    /**
     * @event mounted
     * @fires onResize
     */
    mounted(){
      this.ready = true;
      this.onResize();
    },
    watch: {
      /**
       * @watch isMaximized
       * @fires $nextTick
       * @fires selfEmit
       */
      isMaximized(){
        this.$nextTick(() => {
          this.selfEmit(true);
        })
      },
    }
  });

})(bbn);


})(bbn);