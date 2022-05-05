(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass]"
     tabindex="-1">
  <div>
    <bbn-input v-model="currentInput"
               :readonly="max && (value.length > max)"
               @keydown="keydown"
               @focus="isOpened = true"
               ref="input"
               @ready="ready = true"
               :placeholder="max && (value.length > max) ? _('Max number of') + ' ' + max : _('Value')"/>
    <bbn-button v-if="!max || (value.length <= max)"
                icon="nf nf-fa-plus"
                @click="add"
                @keyup.prevent.stop.enter.space="add"
                text="_('Add')"
                :notext="true"/>
  </div>
  <div v-for="(v, idx) in value"
       class="bbn-vxspadded">
    <i class="nf nf-fa-times_circle"
       @click="remove(idx)"
       tabindex="0"
       @keyup.enter.space="remove(idx)"
       title="_('Delete')"/>
    <span class="bbn-left-space" v-text="v"/>
  </div>
  <bbn-floater v-if="ready && !isDisabled && !readonly && filteredData.length && currentInput.length"
               :element="$refs.input.$el"
               v-show="isOpened"
               :min-width="$refs.input.$el.clientWidth"
               :width="undefined"
               :height="undefined"
               ref="list"
               :auto-hide="true"
               @select="select"
               @close="isOpened = false"
               :source="filteredData"
  ></bbn-floater>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-values');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/values/values.css');
document.head.insertAdjacentElement('beforeend', css);

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

(bbn => {
  "use strict";
  /**
   * Classic input with normalized appearance.
   */
  Vue.component('bbn-values', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.dropdownComponent
     * @mixin bbn.vue.keynavComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent,
      bbn.vue.inputComponent,
      bbn.vue.dropdownComponent,
      bbn.vue.keynavComponent
    ],
    props: {
      /**
       * @prop {Array} source
       */
      source: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * @prop {(Array|String)} value
       */
      value: {
        type: [Array, String]
      },
      /**
       * @prop {Number} max
       */
      max: {
        type: Number
      },
      /**
       * @prop {Number} min
       */
      min: {
        type: Number
      },
      /**
       * @prop {(String|Function)} validator
       */
      validator: {
        type: [String, Function]
      },
    },
    data(){
      let isJSON = this.value && bbn.fn.isString(this.value);
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
          if (this.currentInput.length) {
            let ci = bbn.fn.removeAccents(this.currentInput).toLowerCase();
            let tmp = bbn.fn.removeAccents(a).toLowerCase();
            if (tmp.indexOf(ci) === -1) {
              return false;
            }
          }

          return !this.obj.includes(a);
        });
      }
    },
    methods: {
      keydown(e){
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          if (this.$refs.list && (this.$refs.list.overIdx > -1)) {
            this.currentInput = this.filteredData[this.$refs.list.overIdx];
          }

          this.add();
        }
        else if (e.key === ';') {
          e.preventDefault();
          this.add();
        }
        else if (this.commonKeydown(e)) {
          return;
        }
        else if (e.key === 'Escape') {
          e.preventDefault();
          this.isOpened = false;
        }
        else if (bbn.var.keys.upDown.includes(e.keyCode)) {
          e.preventDefault();
          if (!this.isOpened) {
            this.isOpened = true;
          }
          else {
            this.keynav(e);
          }
        }
      },
      select(value){
        this.currentInput = value.value;
        this.add();
      },
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
    }
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}