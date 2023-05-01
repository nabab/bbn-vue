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

  return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.resizer
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.resizer
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
      this.splitter = this.closest('bbn-splitter');
      if (this.splitter){
        if (this.resizable === undefined) {
          this.isResizable = this.splitter.resizable;
        }

        this.selfEmit(true);
        this.splitter.init();
        setTimeout(() => {
          this.ready = true;
        }, 40)
      }
    },
  };

