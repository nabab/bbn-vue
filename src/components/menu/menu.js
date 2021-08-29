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
        bbn.fn.log("ENTER LI");
        if ((this.overIdx > -1) && (this.overIdx !== idx)) {
          this.overIdx = idx;
          this.getRef('li' + idx).focus();
        }
      },
      clickLi(idx, ev) {
        bbn.fn.log("clickLi", idx, this.overIdx);
        if (this.filteredData[idx]) {
          if (this.filteredData[idx].data[this.children] && this.filteredData[idx].data[this.children].length) {
            this.overIdx = this.overIdx === idx ? -1 : idx;
          }
          else {
            this.select(this.filteredData[idx].data, idx, idx, ev);
          }

          this.currentSelectedIndex = idx;
        }
      },
      onKeyDown(idx, ev) {
        bbn.fn.log(ev);
        if ((ev.key === ' ') || (ev.key === 'Enter')) {
          this.clickLi(idx, ev);
        }
        else if (this.filteredData[this.overIdx] && (ev.key.indexOf('Arrow') || bbn.var.keys.upDown.includes(ev.keyCode))) {
          let floater = this.getRef('floater');
          if (floater) {
            let list = floater.getRef('list');
            if (list) {
              list.keynav(ev);
            }
          }
        }
      },
      onFocus(idx) {
        if (this.filteredData[this.overIdx] && this.filteredData[idx]) {
          this.overIdx = idx;
        }
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
    watch: {
      overIdx(nv, ov) {
        bbn.fn.log("changed overIdx from " + ov + " to " + nv);
      }
    },
    mounted(){
      this.ready = true;
    }
  });

})(bbn);
