((bbn) => {
  "use strict";
  const
    editorOperators = {
      string: {
        contains: bbn._('Contient'),
        eq: bbn._('Est'),
        neq: bbn._('N’est pas'),
        startswith: bbn._('Commence par'),
        doesnotcontain: bbn._('Ne contient pas'),
        endswith: bbn._('Se termine par'),
        isempty: bbn._('Est vide'),
        isnotempty: bbn._('N’est pas vide')
      },
      number: {
        eq: bbn._('Est égal à'),
        neq: bbn._('N’est pas égal à'),
        gte: bbn._('Est supérieur ou égal à'),
        gt: bbn._('Est supérieur à'),
        lte: bbn._('Est inférieur ou égal à'),
        lt: bbn._('Est inférieur à'),
      },
      date: {
        eq: bbn._('Est égal à'),
        neq: bbn._('N’est pas égal à'),
        gte: bbn._('Est postérieur ou égal à'),
        gt: bbn._('Est postérieur à'),
        lte: bbn._('Est antérieur ou égal à'),
        lt: bbn._('Est antérieur à'),
      },
      enums: {
        eq: bbn._('Est égal à'),
        neq: bbn._('N’est pas égal à'),
      },
      boolean: {
        istrue: bbn._('Est vrai'),
        isfalse: bbn._('Est faux')
      }
    },
    editorNullOps = {
      isnull: bbn._('Est nul'),
      isnotnull: bbn._('N’est pas nul')
    },
    editorNoValueOperators = ['', 'isnull', 'isnotnull', 'isempty', 'isnotempty', 'istrue', 'isfalse'];
  bbn.fn.autoExtend("vue", {
    /**
     * dataEditorComponent
     * @component dataEditorComponent
     */
    dataEditorComponent: {
      methods: {
        /**
         * not used
         * @memberof dataEditorComponent
         *  editorOperatorType
         * @param {Object} col 
         */
        editorOperatorType(col){
          if ( col.field ){

          }
        },
        /**
         * Returns if true if the editor has no value.
         * @memberof dataEditorComponent
         * @method editorHasNoValue
         * @param {String} operator 
         * @returns {Boolean}
         */
        editorHasNoValue(operator){
          return editorNoValueOperators.indexOf(operator) > -1;
        },
        /**
         * Defines the correct editor for the given col.
         * @method editorGetComponentOptions
         * @param {Object} col
         * @memberof dataEditorComponent
         * @returns {Object}
         */
        editorGetComponentOptions(col){
          let o = {
            type: 'string',
            component: 'bbn-input',
            multi: false,
            componentOptions:  {}
          };
          if ( col && col.field ){
            o.field = col.field;
            if ( col.filter ){
              o.component = col.filter;
            }
            else if ( col.source ){
              o.type = 'enums';
              o.component = 'bbn-dropdown';
              o.componentOptions.source = col.source;
              o.componentOptions.placeholder = bbn._('Choose');
            }
            else if ( col.type ){
              switch ( col.type ){
                case 'number':
                case 'money':
                  o.type = 'number';
                  o.component = 'bbn-numeric';
                  break;
                case 'date':
                  o.type = 'date';
                  o.component = 'bbn-datepicker';
                  break;
                case 'time':
                  o.type = 'date';
                  o.component = 'bbn-timepicker';
                  break;
                case 'datetime':
                  o.type = 'date';
                  o.component = 'bbn-datetimepicker';
                  break;
              }
            }
            if ( col.componentOptions ){
              bbn.fn.extend(o.componentOptions, col.componentOptions);
            }
            if ( o.type && this.editorOperators[o.type] ){
              o.operators = this.editorOperators[o.type];
            }
            o.fields = [col];
          }
          return o
        },

      },
      computed: {
        /**
         * The object containing the text for the different operator values.
         * @computed editorOperators 
         * @memberof dataEditorComponent
         * @returns {Object}
         */
        editorOperators(){
          return editorOperators;
        },
        /**
         * The object containing the text for the case null or not null values.
         * @computed editorNullOps
         * @memberof dataEditorComponent
         * 
         */
        editorNullOps(){
          return editorNullOps;
        },
        /**
         * The array containing the values of operators when the value of the editor is not defined.
         * @computed editorNoValueOperators 
         * @memberof dataEditorComponent
         * @returns {Array}
         */
        editorNoValueOperators(){
          return editorNoValueOperators;
        }
      },
      /**
       * Adds the class 'bbn-data-editor-component' to the component.
       * @event created
       * @memberof dataEditorComponent
       */
      created(){
        this.componentClass.push('bbn-data-editor-component');
      },
    }
  });
})(bbn);