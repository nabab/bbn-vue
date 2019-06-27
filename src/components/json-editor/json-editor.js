/**
 * @file bbn-json-editor component
 *
 * @description bbn-json-editor is a component that allows the schematic visualization of data in JSON format using different types of structures, such as: 'tree', 'text', 'object' and 'code'.
 * It also allows the modification or insertion of content.
 *
 * @author BBN Solutions
 * 
 * @copyright BBN Solutions
 *
 * @created 20/02/17
 */




//Markdown editor use simpleMDe
(function(bbn, JSONEditor){
  "use strict";
  let lang = {
    'array': bbn._('Array'),
    'auto': bbn._('Auto'),
    'appendText': bbn._('Append'),
    'appendTitle': bbn._('Append a new field with type \'auto\' after this field (Ctrl+Shift+Ins)'),
    'appendSubmenuTitle': bbn._('Select the type of the field to be appended'),
    'appendTitleAuto': bbn._('Append a new field with type \'auto\' (Ctrl+Shift+Ins)'),
    'ascending': bbn._('Ascending'),
    'ascendingTitle': bbn._('Sort the childs of this ${type} in ascending order'),
    'actionsMenu': bbn._('Click to open the actions menu (Ctrl+M)'),
    'collapseAll': bbn._('Collapse all fields'),
    'descending': bbn._('Descending'),
    'descendingTitle': bbn._('Sort the childs of this ${type} in descending order'),
    'drag': bbn._('Drag to move this field (Alt+Shift+Arrows)'),
    'duplicateKey': bbn._('duplicate key'),
    'duplicateText': bbn._('Duplicate'),
    'duplicateTitle': bbn._('Duplicate selected fields (Ctrl+D)'),
    'duplicateField': bbn._('Duplicate this field (Ctrl+D)'),
    'empty': bbn._('empty'),
    'expandAll': bbn._('Expand all fields'),
    'expandTitle': bbn._('Click to expand/collapse this field (Ctrl+E). \nCtrl+Click to expand/collapse including all childs.'),
    'insert': bbn._('Insert'),
    'insertTitle': bbn._('Insert a new field with type \'auto\' before this field (Ctrl+Ins)'),
    'insertSub': bbn._('Select the type of the field to be inserted'),
    'object': bbn._('Object'),
    'ok': bbn._('Ok'),
    'redo': bbn._('Redo (Ctrl+Shift+Z)'),
    'removeText': bbn._('Remove'),
    'removeTitle': bbn._('Remove selected fields (Ctrl+Del)'),
    'removeField': bbn._('Remove this field (Ctrl+Del)'),
    'selectNode': bbn._('Select a node...'),
    'showAll': bbn._('show all'),
    'showMore': bbn._('show more'),
    'showMoreStatus': bbn._('displaying ${visibleChilds} of ${totalChilds} items.'),
    'sort': bbn._('Sort'),
    'sortTitle': bbn._('Sort the childs of this ${type}'),
    'sortTitleShort': bbn._('Sort contents'),
    'sortFieldLabel': bbn._('Field:'),
    'sortDirectionLabel': bbn._('Direction:'),
    'sortFieldTitle': bbn._('Select the nested field by which to sort the array or object'),
    'sortAscending': bbn._('Ascending'),
    'sortAscendingTitle': bbn._('Sort the selected field in ascending order'),
    'sortDescending': bbn._('Descending'),
    'sortDescendingTitle': bbn._('Sort the selected field in descending order'),
    'string': bbn._('String'),
    'transform': bbn._('Transform'),
    'transformTitle': bbn._('Filter, sort, or transform the childs of this ${type}'),
    'transformTitleShort': bbn._('Filter, sort, or transform contents'),
    'transformQueryTitle': bbn._('Enter a JMESPath query'),
    'transformWizardLabel': bbn._('Wizard'),
    'transformWizardFilter': bbn._('Filter'),
    'transformWizardSortBy': bbn._('Sort by'),
    'transformWizardSelectFields': bbn._('Select fields'),
    'transformQueryLabel': bbn._('Query'),
    'transformPreviewLabel': bbn._('Preview'),
    'type': bbn._('Type'),
    'typeTitle': bbn._('Change the type of this field'),
    'openUrl': bbn._('Ctrl+Click or Ctrl+Enter to open url in new window'),
    'undo': bbn._('Undo last action (Ctrl+Z)'),
    'validationCannotMove': bbn._('Cannot move a field into a child of itself'),
    'autoType': bbn._('Field type "auto". The field type is automatically determined from the value and can be a string, number, boolean, or null.'),
    'objectType': bbn._('Field type "object". An object contains an unordered set of key/value pairs.'),
    'arrayType': bbn._('Field type "array". An array contains an ordered collection of values.'),
    'stringType': bbn._('Field type "string". Field type is not determined from the value, but always returned as string.')
  };
  Vue.component('bbn-json-editor', {
    /**
     * @mixin bbn.vue.fullComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
    props: {
      /**
       * The value of the json editor.
       * @prop {String} ['{}'] value
       */
      value: {
        default: "{}"
      },
      /**
       * Defines the mode of the json editor. Allowed values are 'tree', 'view', 'form', 'code' and 'text'.
       * @prop {String} ['tree'] mode
       */
      mode: {
        type: String,
        default: 'tree'
      },
      /**
       * The object of configuration.
       * @prop {Object} cfg
       */
      cfg: {
        type: Object,
        default(){
          return {};
        }
      }
    },
    data(){
      return {
        /**
         * The current value.
         * @data {String} ['{}'] currentValue
         */
        currentValue: this.value === '' ? '{}' : this.value,
        widgetName: "jsoneditor",
        /**
         * The mode of the component.
         * @data {String} mode
         */
        currentMode: this.readonly ? 'view' : (this.mode || "tree"),
      };
    },
    methods: {
      /**
       * Gets the initial configuration of the component.
       * @method getCfg
       * @emit change
       * @emit input
       * @return {Object}
       */
      getCfg(){
        let cfg = {
          /**
           * @data onEditable
           */
          onEditable: this.cfg.onEditable || null,
          /**
           * @data onError
           */
          onError: this.cfg.onError || null,
          /**
           * @data onModeChange 
           */
          onModeChange: this.cfg.onModeChange || null,
          /**
           * @data escapeUnicode 
           */
          escapeUnicode: this.cfg.escapeUnicode || false,
          /**
           * @data sortObjectKeys 
           */
          sortObjectKeys: this.cfg.sortObjectKeys || false,
          /**
           * @data history
           */
          history: this.cfg.history || true,
          /**
           * The mode of the component.
           * @data {String} mode
           */
          mode: this.readonly ? 'view' : this.currentMode,
          /**
           * @data {Array} modes
           */
          modes: this.readonly ? ['view'] : ["tree", "view", "form", "code", "text"],
          /**
           * @data schema
           */
          schema: this.cfg.schema || null,
          /**
           * @data schemaRefs
           */
          schemaRefs: this.cfg.schemaRefs || null,
          /**
           * @data search
           */
          search: this.cfg.search !== undefined ? this.cfg.search : true,
          /**
           * @data {Number} indentation
           */
          indentation: this.cfg.indentation || 2,
          /**
           * @data theme
           */
          theme: this.cfg.theme || null,
          /**
           * @data {Array} templates
           */
          templates: this.cfg.templates || [],
          /**
           * @data autocomplete
           */
          autocomplete: this.cfg.autocomplete || null,
          /**
           * The code of the language used in the component.
           * @data {String} ['en'] language
           */
          language: bbn.env.lang || 'en'
        };
        if ( !this.readonly ){
          cfg.onChange = () => {
            var v = this.widget.getText();
            this.$refs.input.value = v;
            this.$emit("change", v);
            this.$emit("input", v);
          };
        }
        return cfg;
      },
      /**
       * Initializes the component.
       * @fires getCfg
       * @fires widget.setText
       */
      init(){
        let cfg = this.getCfg();
        bbn.fn.log("VALUE", this.value);
        this.widget = new JSONEditor(this.$refs.element, cfg);
        this.widget.setText(this.value);
      },
      /**
       * Destroys and reinitializes the component.
       * @fires widget.destroy
       * @fires init
       */
      reinit(){
        this.widget.destroy();
        this.init();
      }
    },
    /**
     * @event mounted@fires init
     */
    mounted(){
      this.init();
    },
    watch: {
      /**
       * @watch value
       * @param {String} newVal 
       * @fires widget.getText
       * @fires widget.setText
       */
      value(newVal){
        if ( this.widget.getText() !== newVal ){
          this.widget.setText(newVal);
        }
      }
    }
  });

})(bbn, JSONEditor);
