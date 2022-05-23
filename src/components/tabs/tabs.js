 /**
  * @file bbn-switch component
  *
  * @description bbn-switch is a component with easy implementation and customization that allows the user to switch between selected and unselected states, defining the value and novalue in the appropriate properties.
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 13/02/2017
  */
(bbn => {
  "use strict";
  Vue.component('bbn-tabs', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent,
      bbn.vue.inputComponent
    ],
    props: {
      /**
       * Set to true gives the component a rounded appearance.
       * @prop {Boolean} [false] radius
       */
      source: {
        type: Array,
        default() {
          return []
        }
      },
      scrollable: {
        type: Boolean,
        default: false
      },
      closable: {
        type: Boolean,
        default: true
      },
      limit: {
        type: Number
      },
      maxTitleLength: {
        type: Number,
        default: 35
      }
    },
    data(){
      return {
        /**
         * The value of the component.
         * @data {Boolean} valueToSet
         */
        valueToSet: this.value,
        selectedBarColor: null
      }
    },
    computed: {
      /**
       * Returns the scroll configuration
       * @computed scrollCfg
       * @return {Object}
       */
       scrollCfg(){
        return this.scrollable ? {
          axis: 'x',
          container: true,
          hidden: true
        } : {};
      }
    },
    methods: {
      numProperties: bbn.fn.numProperties,
      /**
       * Returns the title attribute for the tab.
       * 
       * @method getTabTitle
       * @param {Object} obj
       * @return {String|null}
       */
      getTabTitle(obj){
        let t = '';
        if ( obj.notext || (obj.title.length > this.maxTitleLength) ){
          t += obj.title;
        }
        if ( obj.ftitle ){
          t += (t.length ? ' - ' : '') + obj.ftitle;
        }
        return t || null;
      },
      /**
       * @method scrollTabs
       * @param {String} dir
       * @fires getRef
       */
       scrollTabs(dir){
        let scroll = this.getRef('horizontal-scroll');
        if ( scroll ){
          if ( dir === 'right' ){
            scroll.scrollAfter(true);
          }
          else{
            scroll.scrollBefore(true);
          }
        }
      },
      /**
       * Cuts the given string by 'maxTitleLength' property value
       * @method cutTitle
       * @param {String} title
       * @return {String}
       */
      cutTitle(title){
        return bbn.fn.shorten(title, this.maxTitleLength)
      },
      /**
       * @method getFontColor
       * @param {Number} idx
       * @fires getRef
       * @return {String}
       */
      getFontColor(idx){
        if (bbn.fn.isNumber(idx)) {
          if ( this.source[idx] && this.source[idx].fcolor ){
            return this.source[idx].fcolor;
          }
          let el = this.getRef('title-' + idx);
          if ( el ){
            return window.getComputedStyle(el.$el ? el.$el : el).color;
          }
        }
        return '';
      },
      getMenuFn(idx) {
        if (this.router) {
          return this.router.getMenuFn(idx);
        }
      }
    },
    watch: {
      value(v) {
        this.$nextTick(() => {
          this.selectedBarColor = this.source[v] ? this.getFontColor(v) : null;
        })
      }
    },
    /**
     * Sets the initial state of the component.
     * @event mounted
     * @fires toggle
     * @emits input
     */
    mounted(){
      this.router = this.closest('bbn-router');
      this.ready = true;
      this.$nextTick(() => {
        if (this.source[this.value]) {
          this.selectedBarColor = this.getFontColor(this.value);
        }
      })
    }
  });
})(bbn);
