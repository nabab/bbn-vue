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
return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.events
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.input, 
      bbn.wc.mixins.events
    ],
    static() {
      let lang = {
        array: bbn._('Array'),
        auto: bbn._('Auto'),
        appendText: bbn._('Append'),
        appendTitle: bbn._('Append a new field with type \'auto\' after this field (Ctrl+Shift+Ins)'),
        appendSubmenuTitle: bbn._('Select the type of the field to be appended'),
        appendTitleAuto: bbn._('Append a new field with type \'auto\' (Ctrl+Shift+Ins)'),
        ascending: bbn._('Ascending'),
        ascendingTitle: bbn._('Sort the childs of this ${type} in ascending order'),
        actionsMenu: bbn._('Click to open the actions menu (Ctrl+M)'),
        collapseAll: bbn._('Collapse all fields'),
        descending: bbn._('Descending'),
        descendingTitle: bbn._('Sort the childs of this ${type} in descending order'),
        drag: bbn._('Drag to move this field (Alt+Shift+Arrows)'),
        duplicateKey: bbn._('duplicate key'),
        duplicateText: bbn._('Duplicate'),
        duplicateTitle: bbn._('Duplicate selected fields (Ctrl+D)'),
        duplicateField: bbn._('Duplicate this field (Ctrl+D)'),
        duplicateFieldError: bbn._('Duplicate field name'),
        cannotParseFieldError: bbn._('Cannot parse field into JSON'),
        cannotParseValueError: bbn._('Cannot parse value into JSON'),
        empty: bbn._('empty'),
        expandAll: bbn._('Expand all fields'),
        expandTitle: bbn._('Click to expand/collapse this field (Ctrl+E). \n' +
          'Ctrl+Click to expand/collapse including all childs.'),
        insert: bbn._('Insert'),
        insertTitle: bbn._('Insert a new field with type \'auto\' before this field (Ctrl+Ins)'),
        insertSub: bbn._('Select the type of the field to be inserted'),
        object: bbn._('Object'),
        ok: bbn._('Ok'),
        redo: bbn._('Redo (Ctrl+Shift+Z)'),
        removeText: bbn._('Remove'),
        removeTitle: bbn._('Remove selected fields (Ctrl+Del)'),
        removeField: bbn._('Remove this field (Ctrl+Del)'),
        selectNode: bbn._('Select a node...'),
        showAll: bbn._('show all'),
        showMore: bbn._('show more'),
        showMoreStatus: bbn._('displaying ${visibleChilds} of ${totalChilds} items.'),
        sort: bbn._('Sort'),
        sortTitle: bbn._('Sort the childs of this ${type}'),
        sortTitleShort: bbn._('Sort contents'),
        sortFieldLabel: bbn._('Field:'),
        sortDirectionLabel: bbn._('Direction:'),
        sortFieldTitle: bbn._('Select the nested field by which to sort the array or object'),
        sortAscending: bbn._('Ascending'),
        sortAscendingTitle: bbn._('Sort the selected field in ascending order'),
        sortDescending: bbn._('Descending'),
        sortDescendingTitle: bbn._('Sort the selected field in descending order'),
        string: bbn._('String'),
        transform: bbn._('Transform'),
        transformTitle: bbn._('Filter, sort, or transform the childs of this ${type}'),
        transformTitleShort: bbn._('Filter, sort, or transform contents'),
        extract: bbn._('Extract'),
        extractTitle: bbn._('Extract this ${type}'),
        transformQueryTitle: bbn._('Enter a JMESPath query'),
        transformWizardLabel: bbn._('Wizard'),
        transformWizardFilter: bbn._('Filter'),
        transformWizardSortBy: bbn._('Sort by'),
        transformWizardSelectFields: bbn._('Select fields'),
        transformQueryLabel: bbn._('Query'),
        transformPreviewLabel: bbn._('Preview'),
        type: bbn._('Type'),
        typeTitle: bbn._('Change the type of this field'),
        openUrl: bbn._('Ctrl+Click or Ctrl+Enter to open url in new window'),
        undo: bbn._('Undo last action (Ctrl+Z)'),
        validationCannotMove: bbn._('Cannot move a field into a child of itself'),
        autoType: bbn._('Field type "auto". ' +
          'The field type is automatically determined from the value ' +
          'and can be a string, number, boolean, or null.'),
        objectType: bbn._('Field type "object". ' +
          'An object contains an unordered set of key/value pairs.'),
        arrayType: bbn._('Field type "array". ' +
          'An array contains an ordered collection of values.'),
        stringType: bbn._('Field type "string". ' +
          'Field type is not determined from the value, ' +
          'but always returned as string.'),
        modeCodeText: bbn._('Code'),
        modeCodeTitle: bbn._('Switch to code highlighter'),
        modeFormText: bbn._('Form'),
        modeFormTitle: bbn._('Switch to form editor'),
        modeTextText: bbn._('Text'),
        modeTextTitle: bbn._('Switch to plain text editor'),
        modeTreeText: bbn._('Tree'),
        modeTreeTitle: bbn._('Switch to tree editor'),
        modeViewText: bbn._('View'),
        modeViewTitle: bbn._('Switch to tree view'),
        modePreviewText: bbn._('Preview'),
        modePreviewTitle: bbn._('Switch to preview mode'),
        examples: bbn._('Examples'),
        default: bbn._('Default')
      };
    },
    props: {
      /**
       * The value of the json editor.
       * @prop {String} ['{}'] value
       */
      value: {
        default: '{}'
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
       * @prop {Object} [{}] cfg
       */
      cfg: {
        type: Object,
        default(){
          return {};
        }
      }
    },
    data(){
      let isParsed = this.value && (bbn.fn.isObject(this.value) || bbn.fn.isArray(this.value));
      let v = this.value || '';
      if (isParsed) {
        try {
          v = JSON.stringify(this.value);
        }
        catch (e) {
          bbn.fn.log("Impossible to parse");
        }
      }
      return {
        isParsed: isParsed,
        currentValue: v
      };
    },
    computed: {
      /**
        * The mode of the component.
        * @data {String} mode
        */
      currentMode(){
        return this.readonly ? 'view' : (this.mode || "tree");
      },
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
          language: bbn.env.lang || 'en',
          languages: {}
        };
        if (bbn.env.lang) {
          cfg.languages[bbn.env.lang || 'en'] = bbnJsonEditorCreator.lang;
        }
        if ( !this.readonly ){
          let cp = this;
          cfg.onChange = () => {
            let v = this.widget.getText();
            if (this.isParsed) {
              try{
                v = JSON.parse(v)
              }
              catch(e){
                bbn.fn.log('Impossible to read the JSON');
                v = '';
              }
            }
            if (this.value !== v) {
              bbn.fn.log("REAL CHANGE", v);
              this.emitInput(v);
            }
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
        if (this.currentValue) {
          this.widget.setText(this.currentValue);
        }
        this.ready = true;
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
      currentValue(v){
        if (this.ready && (this.widget.getText() != v)) {
          this.widget.setText(v);
        }
      },
      value(v){
        let tmp = v;
        if (v && (typeof v === 'object')) {
          tmp = JSON.stringify(v);
        }
        else if (!bbn.fn.isString(v)) {
          tmp = '';
        }
        if (tmp !== this.currentValue) {
          this.currentValue = tmp;
        }
      }
    }
  };
