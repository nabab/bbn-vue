/**
 * @file bbn-context component
 *
 * @description bbn-keyvalue is a dynamic list of keys and values
 * The source of the menu can have a tree structure.
 * ì
 * @copyright BBN Solutions
 *
 * @created 15/02/2017.
 */

((bbn) => {
  "use strict";
  /**
   * Classic input with normalized appearance.
   */
  Vue.component('bbn-values', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.inputComponent,
      bbn.vue.listComponent,
    ],
    props: {
      source: {
        type: Array,
        default: []
      },
      value: {
        type: [Array, String],
        required: true
      },
      max: {
        type: Number
      },
      min: {
        type: Number
      },
      validator: {
        type: [String, Function]
      },
      url: {
        type: String
      }
    },
    data(){
      let isJSON = bbn.fn.isString(this.value);
      return {
        isJSON: isJSON,
        obj: isJSON ? JSON.parse(this.value) : bbn.fn.clone(this.value),
        currentValue: ''
      };
    },
    computed: {
      filteredData(){
        return bbn.fn.filter(this.source, a => {
          return !this.value.includes(a[this.sourceValue]);
        });
      }
    },
    methods: {
    },
    created(){
      this.updateData();
    }
  });

})(bbn);
