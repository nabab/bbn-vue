(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[{'bbn-iblock':true}, componentClass]"
>
  <input :value="ivalue"
         ref="element"
         class="bbn-textbox"
         :disabled="isDisabled"
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
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

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
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.inputComponent, 
      bbn.vue.eventsComponent
    ],
    props: {
      /**
       * @prop {Array} extensions
       */
      extensions:{
        type: Array,
        // default: ["dnd"]
      },
      /**
       * @prop {Number} autoExpandMS
       */
      autoExpandMS:{
        type: Number
      },
      /**
       * @prop {(String|Array|Object)} source
       */
      source: {
        type: [String, Array, Object]
      },
      /**
       * @prop {Object} [extensions: ['dnd'], autoExpandedMS: 400, source: [], disabled: false] cfg
       */
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
})(bbn);
}