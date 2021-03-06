((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="['bbn-block bbn-nowrap', componentClass]">
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
       
</div>`;
script.setAttribute('id', 'bbn-tpl-component-editable-content');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
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
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.fieldComponent],
    props: {
      editIcon: {
        type: String,
        default: 'nf nf-fa-edit'
      },
      saveIcon: {
        type: String,
        default: 'nf nf-fa-save'
      },
      cancelIcon: {
        type: String,
        default: 'nf nf-mdi-cancel'
      },
      help: {
        type: [String, Function]
      },
      type: {
        type: String
      },
      editor: {

      },
      editorOptions: {

      },
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


})(bbn);