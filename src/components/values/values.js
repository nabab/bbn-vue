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
      bbn.vue.inputComponent
    ],
    props: {
      source: {
        type: Array,
        default: []
      },
      value: {
        type: [Array, String]
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
      let obj = this.value ? (isJSON ? JSON.parse(this.value) : bbn.fn.clone(this.value)) : [];
      if (!bbn.fn.isArray(obj)) {
        throw new Error("The value of bbn-values must be an array");
      }
      return {
        isJSON: isJSON,
        obj: obj,
        currentValue: obj.slice(),
        currentInput: ''
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
      isValid(){
        return bbn.fn.isArray(this.obj);
      },
      add(){
        if (this.currentInput.length) {
          this.obj.push(this.currentInput);
          this.emitInput(this.isJSON ? JSON.stringify(this.obj) : this.obj);
          this.currentInput = '';
          this.$refs.input.focus();
        }
      },
      remove(idx) {
        this.obj.splice(idx, 1);
        this.emitInput(this.isJSON ? JSON.stringify(this.obj) : this.obj);
      }
    },
  });

})(bbn);
