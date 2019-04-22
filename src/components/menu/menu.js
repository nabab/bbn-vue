/**
 * Created by BBN on 15/02/2017.
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
