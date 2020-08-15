(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-block']"
     @mouseleave="onLeave">
  <ul class="bbn-widget bbn-ul bbn-no-border"
      data-role="menu"
      role="menubar">
    <li v-for="(item, i) in filteredData"
        class="bbn-menu-item bbn-reactive-block"
        role="menuitem"
        :ref="'li' + i"
        :key="i"
        :tabindex="item.data.disabled ? '-1' : '0'"
        @focus="overIdx = i"
        @click="overIdx = i"
        @mouseenter="_enterLi(i)"
        >
      <span v-html="item.data.text"></span>
      <span v-if="item.data[children]" class="nf nf-fa-chevron_down"></span>
    </li>
  </ul>
  <bbn-floater v-for="(item, i) in filteredData"
               v-if="overIdx === i"
               :key="i"
               :min-width="getRef('li' + i).clientWidth"
               :children="children"
               :element="getRef('li' + i)"
               :focused="false"
               :source="item.data[children]"               
  ></bbn-floater>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-menu');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/menu/menu.css");
document.head.insertAdjacentElement('beforeend', css);
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
      onLeave(){
        this.overIdx = -1;
      },
      onClose(){
        //getRef('li' + selectedElement).blur(); selectedElement = -1;
      },
      /*onDataLoaded(){         
        this.$emit('onDataLoaded', this);
      }*/
    },
    mounted(){
      this.ready = true;
    }
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }