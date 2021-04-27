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
