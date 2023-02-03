(bbn => {
  "use strict";
  const editorOperators = {
    string: {
      contains: bbn._('Contains'),
      eq: bbn._('Is'),
      neq: bbn._('Is not'),
      startswith: bbn._('Starts with'),
      doesnotcontain: bbn._('Does not contain'),
      endswith: bbn._('To end by'),
      isempty: bbn._('Is empty'),
      isnotempty: bbn._('Is not empty')
    },
    number: {
      eq: bbn._('Is equal to'),
      neq: bbn._('Is not equal to'),
      gte: bbn._('Is greater than or equal to'),
      gt: bbn._('Is greater than'),
      lte: bbn._('Is less than or equal to'),
      lt: bbn._('Is inferior to'),
    },
    date: {
      eq: bbn._('Is equal to'),
      neq: bbn._('Is not equal to'),
      gte: bbn._('Is after than or equal to'),
      gt: bbn._('Is after'),
      lte: bbn._('Is prior to or equal to'),
      lt: bbn._('Is older than'),
    },
    enums: {
      eq: bbn._('Is equal to'),
      neq: bbn._('Is not equal to'),
    },
    boolean: {
      istrue: bbn._('Is true'),
      isfalse: bbn._('Is false')
    }
  };

  const editorNullOps = {
    isnull: bbn._('Is null'),
    isnotnull: bbn._('Is not null')
  };
  const editorNoValueOperators = ['', 'isnull', 'isnotnull', 'isempty', 'isnotempty', 'istrue', 'isfalse'];

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
            else if ( col.type === 'boolean' ){
              o.type = 'enums';
              o.component = 'bbn-dropdown';
              o.componentOptions.source = [0, 1];
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