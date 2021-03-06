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
        type: Boolean
      },
      collapsible: {
        type: Boolean
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
        default: 20
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
        isResizable: this.resizable
      };
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
        this.$parent.init();
        setTimeout(() => {
          this.ready = true;
        }, 40)
      }
    },
  });

})(bbn);
