/**
 * @file the bbn-pane component
 *
 * @description the bbn-pane is a component created to be operated by "bbn-splitter".
 * It represents the portion of the single area of ​​the splitter that will contain what the user desires.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 15/02/2017
 */

(function(bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-pane', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.resizerComponent
    ],
    props: {
      /**
       * @prop {String} ['hidden'] overflow
       */
      overflow: {
        type: String,
        default: 'hidden'
      },
      /**
       * @prop {String} title
       */
      title: {
        type: String
      },
      /**
       * @prop {(String|Number)} [''] size
       */
      size: {
        type: [String, Number],
        default: ''
      },
      /**
       * @prop {Boolean} resizable
       */
      resizable: {
        type: Boolean
      },
      /**
       * @prop {Boolean} collapsible
       */
      collapsible: {
        type: Boolean
      },
      /**
       * @prop {Boolean} [false] collapsed
       */
      collapsed: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Boolean} [false] hidden
       */
      hidden: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Boolean} [false] scrollable
       */
      scrollable: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Number} [20] min
       */
      min: {
        type: Number,
        default: 20
      },
      /**
       * @prop {Number} [10000] min
       */
      max: {
        type: Number,
        default: 10000
      }
    },
    data() {
      return {
        /**
         * The current collapsed state.
         * @data {Boolean} isCollapsed
         */
        isCollapsed: this.collapsed,
        /**
         * The current resizable state.
         * @data {Boolean} isResizable
         */
        isResizable: this.resizable,
        /**
         * The splitter to which the pane belongs.
         * @data {Vue} splitter
         */
        splitter: null
      };
    },
    computed: {
      isHorizontal() {
        return this.splitter && this.splitter.isHorizontal;
      }
    },
    methods: {
      onResize() {
        bbn.vue.resizerComponent.methods.onResize.call(this);
        if (!this.$el.clientHeight) {
          this.$el.style.position = 'static';
          setTimeout(() => {
            this.$el.style.position = '';
          }, 100)
        }
      }
    },
    watch:{
      collapsed(val){
        this.currentHidden = val;
        this.isCollapsed = val;
      }
    },
    created(){
      this.componentClass.push('bbn-resize-emitter');
    },
    mounted(){
      if (bbn.fn.isFunction(this.$parent.init) ){
        if (this.resizable === undefined) {
          this.isResizable = this.$parent.resizable;
        }

        this.selfEmit(true);
        this.splitter = this.closest('bbn-splitter');
        this.splitter.init();
        setTimeout(() => {
          this.ready = true;
          // This is for old Safari
          this.$nextTick(() => {
            this.onResize();
          });
        }, 40)
      }
    },
  });

})(bbn);
