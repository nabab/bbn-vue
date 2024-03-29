(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass]" 
     tabindex="-1"
>
  <bbn-form :scrollable="false" ref="form" :buttons="false" @submit="add">
    <div class="bbn-grid-fields" style="grid-template-columns: minmax(auto,max-content) auto 3rem">
      <template v-for="v in items">
        <div v-text="v.key" :key="v.key"/>
        <div v-text="v.value"/>
        <div>
          <bbn-button icon="nf nf-fa-minus"
                      @click="remove(v.key)"
                      @keyup.enter="remove(v.key)"
                      text="_('Delete')"
                      :notext="true"/>
        </div>
      </template>
      <template v-if="!max || (items.length <= max)">
        <div>
          <bbn-input v-model="currentKey" :required="true" ref="key" :placeholder="_('key')"/>
        </div>
        <div>
          <bbn-input v-model="currentValue" :required="true" :placeholder="_('value')"/>
        </div>
        <div>
          <bbn-button icon="nf nf-fa-plus"
                      @click="getRef('form').submit()"
                      @keyup.enter="getRef('form').submit()"
                      text="_('Add')"
                      :notext="true"/>
        </div>
      </template>
    </div>
  </bbn-form>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-keyvalue');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/keyvalue/keyvalue.css');
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
  Vue.component('bbn-keyvalue', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent,
      bbn.vue.inputComponent,
    ],
    props: {
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
      }
    },
    data(){
      let isJSON = bbn.fn.isString(this.value);
      return {
        isJSON: isJSON,
        obj: isJSON ? JSON.parse(this.value) : this.value,
        currentKey: '',
        currentValue: '',
        items: []
      };
    },
    methods: {
      setItems(){
        this.items.splice(0, this.items.length);
        bbn.fn.iterate(this.obj, (o, n) => {
          this.items.push({
            key: n,
            value: o
          });
        });
      },
      update(){
        this.setItems();
        this.$forceUpdate();
      },
      remove(key){
        delete this.obj[key];
        if (this.isJSON) {
          this.emitInput(JSON.stringify(this.obj) || '{}');
        }
        else {
          /** @see https://www.drewtown.dev/post/using-vues-v-model-with-objects/ */
          this.$emit('input', {...this.obj});
        }
        this.update();
      },
      add(){
        if (this.currentKey && this.currentValue) {
          if (this.isJSON) {
            this.obj[this.currentKey] = this.currentValue;
            this.emitInput(JSON.stringify(this.obj) || '{}');
          }
          else {
            /** @see https://www.drewtown.dev/post/using-vues-v-model-with-objects/ */
            this.$emit('input', {...this.obj, [this.currentKey]: this.currentValue});
            this.obj[this.currentKey] = this.currentValue;
          }
          this.update();
          this.currentKey = '';
          this.currentValue = '';
          this.getRef('key').focus();
        }
      }
    },
    created(){
      this.setItems();
    }
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}