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
  Vue.component('bbn-pane2', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      overflow: {
        type: String,
        default: 'hidden'
      },
      title: {
        type: String
      },
      size: {
        type: [String, Number],
        default: ''
      },
      resizable: {
        type: Boolean,
        default: undefined
      },
      collapsible: {
        type: Boolean,
        default: undefined
      },
      collapsed: {
        type: Boolean,
        default: false
      },
      scrollable: {
        type: Boolean,
        default: false
      },
      min: {
        type: Number,
        default: 40
      },
      max: {
        type: Number,
        default: 10000
      }
    },
    data(){
      return {
        checker: false,
        isCollapsed: this.collapsed,
        isResizable: this.resizable,
        realSize: 0,
        lastRealSize: 0,
        originalSize: this.size || 'auto',
        currentStyle: {}
      };
    },
    computed: {
      splitter(){
        return this.$parent.$vnode.componentOptions.tag === 'bbn-splitter2' ? this.$parent : false;
      }
    },
    methods: {
      getRealSize(){
        let rect = this.$el.getBoundingClientRect();
        return this.splitter ?
          (this.splitter.isVertical ? rect.height : rect.width) :
          (rect.height > rect.width ? rect.height : rect.width);
      },
      getSize(){
        return parseInt(this.realSize) + 'px';
      },
      setSize(size){
        if ( this.splitter ){
          if ( size < this.min ){
            size = this.min;
          }
          if ( size > this.max ){
            size = this.max;
          }
          this.splitter.setSize(size, this);
        }
      },
      hide(){
        this.isCollapsed = true;
      },
      show(){
        this.isCollapsed = false;
      },
      toggleCollapsed(){
        this.isCollapsed = !this.isCollapsed;
      },
      setStyle(){
        let s = {};
        if ( this.min ){
          s[this.$parent.currentOrientation === 'vertical' ? 'min-height' : 'min-width'] = this.min + 'px';
        }
        if ( this.max ){
          s[this.$parent.currentOrientation === 'vertical' ? 'max-height' : 'max-width'] = this.max + 'px';
        }
        this.currentStyle = s;
      }
    },
    mounted(){
      if ( bbn.fn.isFunction(this.$parent.init) ){
        if ( this.resizable === undefined ){
          this.isResizable = this.$parent.resizable;
        }
        this.selfEmit(true);
        this.$parent.init();
        setTimeout(() => {
          this.ready = true;
        }, 40)
      }
      this.$nextTick(() => {
        this.setStyle();
        this.realSize = this.getRealSize();
        this.lastRealSize = this.realSize;
        if ( this.splitter ){
          this.$watch('splitter.formattedCfg', () => {
            this.lastRealSize = this.realSize;
            this.realSize = this.getRealSize();
          });
          this.$watch('splitter.currentOrientation', () => {
            this.setStyle();
          });
        }
      })
    },
    watch:{
      collapsed(val){
        this.currentHidden = val;
        this.isCollapsed = val;
      }
    }
  });

})(bbn);
