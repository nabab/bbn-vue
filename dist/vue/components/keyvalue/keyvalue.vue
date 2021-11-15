<template>
<div :class="[componentClass]" 
     tabindex="-1"
>
  <bbn-form :scrollable="false" ref="form" :buttons="false" @submit="add">
    <div class="bbn-grid-fields" style="grid-template-columns: minmax(auto,max-content) auto 3em">
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
</div>
</template>
<script>
  module.exports = /**
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

</script>
<style scoped>
.bbn-key {
  cursor: pointer;
  position: relative;
  display: inline-block;
  color: #aaa;
  font: bold 0.9em arial;
  text-decoration: none;
  text-align: center;
  width: 3.7em;
  height: 3.4em;
  background: #eff0f2;
  border-radius: 0.3em;
  border-top: 1px solid rgba(255,255,255,0.8);
  box-shadow: inset 0 0 2em #e8e8e8, 0 0.1em 0 #c3c3c3, 0 0.15em 0 #c9c9c9, 0 0.15em 0.2em #333;
  margin: 0.2em;
}
.bbn-key span {
  position: absolute;
  top: 50%;
  margin-top: -0.5em;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}
.bbn-key.bbn-key-double {
  width: 7.4em;
}
.bbn-key.bbn-key-space {
  width: 14.8em;
}
.bbn-key.bbn-key-narrow {
  height: 2.8em;
}
.bbn-key.bbn-key-bottom span {
  top: auto;
  bottom: 0.4em;
}
.bbn-key.bbn-key-right span {
  left: auto;
  right: 0.4em;
}
.bbn-key.bbn-key-left span {
  left: 0.4em;
  right: auto;
}
.bbn-theme-dark .bbn-key {
  color: #aaa;
  background: #222;
  box-shadow: inset 0 0 2em #333, 0 0.1em 0 #000, 0 0.15em 0 #222, 0 0.15em 0.2em #333;
}

</style>
