<template>
<div :class="['bbn-block bbn-nowrap', componentClass]">
  <div class="bbn-iblock"
       v-if="isEditing">
    <bbn-field mode="write"
               v-model="currentValue"
               field="content"/>
  </div>
  <div class="bbn-iblock"
       v-else v-text="value"/>

  <div class="bbn-iblock bbn-hpadded">
    <div v-if="!isEditing"
         class="bbn-block bbn-hspadded bbn-p"
         tabindex="0"
         @click="isEditing = true">
      <i :class="editIcon"/>
    </div>
    <div v-if="isEditing"
         class="bbn-block bbn-hspadded bbn-p"
         tabindex="0"
         @click="cancel">
      <i :class="cancelIcon"/>
    </div>
    <div v-if="isEditing"
         class="bbn-block bbn-hspadded bbn-p"
         tabindex="0"
         @click="save">
      <i :class="saveIcon"/>
    </div>
  </div>
       
</div>
</template>
<script>
  module.exports = /**
 * @file bbn-icon component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 */
(function() {
  "use strict";
  Vue.component('bbn-editable-content', {
    name: 'bbn-editable-content',
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.fieldComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.inputComponent, 
      bbn.vue.fieldComponent
    ],
    props: {
      /**
       * @prop {String} ['nf nf-fa-edit'] editIcon
       */
      editIcon: {
        type: String,
        default: 'nf nf-fa-edit'
      },
      /**
       * @prop {String} ['nf nf-fa-save'] saveIcon
       */
      saveIcon: {
        type: String,
        default: 'nf nf-fa-save'
      },
      /**
       * @prop {String} ['nf nf-mdi-cancel'] cancelIcon
       */
      cancelIcon: {
        type: String,
        default: 'nf nf-mdi-cancel'
      },
      /**
       * @prop {(String|Function)} help
       */
      help: {
        type: [String, Function]
      },
      /**
       * @prop {String} type
       */
      type: {
        type: String
      },
      /**
       * @prop {} editor
       */
      editor: {

      },
      /**
       * @prop {} editorOptions
       */
      editorOptions: {

      },
      /**
       * @prop {Boolean} [true] editable
       */
      editable: {
        type: Boolean,
        default: true
      }
    },
    data(){
      return {
        isEditing: false,
        currentValue: this.value
      }
    },
    methods: {
      save() {
        this.emitInput(this.currentValue);
        this.isEditing = false;
      },
      cancel() {
        this.emitInput(this.originalValue);
        this.currentValue = this.value;
        this.isEditing = false;
      }
    }
  })
})();

</script>
