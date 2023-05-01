/**
 * @file bbn-icon component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 */
return {
    name: 'bbn-editable-content',
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.field
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.input, 
      bbn.wc.mixins.field
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
  };
