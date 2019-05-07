/**
 * @file bbn-menu component
 *
 * @description The bbn-menu with a simple implementation displays a hierarchical list of elements grouped in boxes.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 10/02/2017
 */

(function($, bbn, kendo){
  "use strict";

  Vue.component('bbn-menu', {
    mixins: [bbn.vue.basicComponent, bbn.vue.sourceArrayComponent],
    props: {
      orientation: {},
      direction: {},
      opened: {},
      sourceValue:{
        default: 'text'
      }
    },
    methods: {
      _enterLi(idx){
        if ( (this.selectedElement > -1) && (this.selectedElement !== idx) ){
          this.selectedElement = idx;
          this.getRef('li' + idx).focus();
        }
      },
      onLeave(){
        if ( this.selectedElement > -1 ){
          let idx = this.selectedElement;
          this.selectedElement = -1;
          this.getRef('li' + idx).blur();
        }
      },
      onClose(){
        //getRef('li' + selectedElement).blur(); selectedElement = -1;
      },
    },
    data(){
      return {
        selectedElement: -1
      }
    },
  });

})(jQuery, bbn, kendo);
