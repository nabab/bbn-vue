/**
 * Created by BBN Solutions.
 * User: Loredana Bruno
 * Date: 20/02/17
 * Time: 16.21
 */


//Markdown editor use simpleMDe
(function($, bbn, JSONEditor){
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
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      value: {
        default: "{}"
      },
      mode: {
        type: String,
        default: 'tree'
      },
      cfg: {
        type: Object,
        default(){
          return {
            onEditable: null,
            onError: null,
            onModeChange: null,
            escapeUnicode: false,
            sortObjectKeys: false,
            history: true,
            mode: "tree",
            modes: ["tree", "view", "form", "code", "text"],
            name: null,
            schema: null,
            schemaRefs: null,
            search: true,
            indentation: 2,
            theme: null,
            templates: [],
            autocomplete: null,
          };
        }
      }
    },
    data(){
      bbn.fn.log("VALUE", this.value);
      return $.extend({
        currentValue: this.value === '' ? '{}' : this.value,
        widgetName: "jsoneditor"
      }, bbn.vue.treatData(this));
    },
    methods: {
      getOptions(){
        const vm = this;
        let cfg = bbn.vue.getOptions(vm);
        if ( bbn.env.lang ){
          cfg.language = bbn.env.lang;
          cfg.languages = {};
          cfg.languages[bbn.env.lang] = lang;
        }
        bbn.fn.log(cfg, typeof(cfg));
        if ( vm.readonly ){
          cfg.modes = [];
          cfg.mode = 'view';
        }
        else{
          cfg.onChange = () => {
            var v = vm.widget.getText();
            vm.$refs.input.value = v;
            vm.$emit("change", v);
            vm.$emit("input", v);
          };
        }
        return cfg;
      },
      init(){
        let cfg = this.getOptions();
        bbn.fn.log("VALUE", this.value);
        this.widget = new JSONEditor(this.$refs.element, cfg);
        this.widget.setText(this.value);
      },
      reinit(){
        this.widget.destroy();
        this.init();
      }
    },
    mounted(){
      this.init();
    },
    watch: {
      value(newVal){
        const vm = this;
        if ( vm.widget.getText() !== newVal ){
          vm.widget.setText(newVal);
        }
      }
    }
  });

})(jQuery, bbn, JSONEditor);