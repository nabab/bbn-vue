(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[{'bbn-iblock':true}, componentClass]"
>
  <input :value="ivalue"
         ref="element"
         class="bbn-textbox"
         :disabled="disabled"
         :required="required"
         readonly="readonly"
  >
  <input type="hidden"
         :value="value"
         :name="name"
         ref="hinput"
  > &nbsp;
  <bbn-button ref="button"
              @click="build()"
              class="bbn-no-vborder"
              icon="nf nf-fa-search"
  >
  </bbn-button>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-tree-input');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
 * @file bbn-tree-oinput component
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 * 
 * @created 15/02/2017
 */
(function(bbn){
  "use strict";
  Vue.component('bbn-tree-input', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
    props: {
      /**
       * @prop extensions
       */
      extensions:{
        type: Array,
        // default: ["dnd"]
      },
      autoExpandMS:{
        type: Number
      },
      source: {
        type: [String, Array, Object]
      },
      cfg: {
        type: Object,
        default(){
          return {
            extensions: ["dnd"],
            auoExpandedMS: 400,
            source: [],
            disabled: false
          };
        }
      }
    },
    data(){
      return {
        widgetName: "fancytree",
        ivalue: this.currentSelection ? this.currentSelection : ''
      };
    },
    methods: {
    },
    mounted(){
      this.ready = true;
    }
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }