/**
 * @file bbn-menu component
 *
 * @description The bbn menu with a simple implementation shows a hierarchical list of elements grouped in boxes that when clicked perform an action defined by the user .
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 10/02/2017
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-menu', {
    mixins: [bbn.vue.basicComponent, bbn.vue.listComponent],
    props: {
      orientation: {},
      direction: {},
      opened: {},
      selectedIndex: {
        type: Number,
        default: -1
      },
      sourceValue:{
        default: 'text'
      },
      children: {
        type: String,
        default: 'items'
      }
    },
    data(){
      return {
        currentSelectedIndex: this.selectedIndex,
        overIdx: -1
      };
    },
    methods: {
      _enterLi(idx){
        if ( (this.overIdx > -1) && (this.overIdx !== idx) ){
          this.overIdx = idx;
          this.getRef('li' + idx).focus();
        }
      },
      clickLi(idx, ev) {
        if (this.filteredData[idx]) {
          if (this.filteredData[idx].data[this.children] && this.filteredData[idx].data[this.children].length) {
            this.overIdx = this.overIdx === idx ? -1 : idx;
          }
          else {
            this.select(this.filteredData[idx].data, idx, idx, ev);
          }
        }
      },
      onLeave(){
        this.overIdx = -1;
      },
      onClose(){
        //getRef('li' + selectedElement).blur(); selectedElement = -1;
      },
      select(item, idx, idx2, ev) {
        this.$emit('select', item, idx, idx2, ev);
      }
      /*onDataLoaded(){         
        this.$emit('onDataLoaded', this);
      }*/
    },
    mounted(){
      this.ready = true;
    }
  });

})(bbn);
