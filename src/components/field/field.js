/*bbn-field is a generic component of simple construction, its potential lies in the versatility of use, assigning to the property "type" a well-defined value, it becomes a "bbn" component.
  * For example if we assign the value "numeric" to the property type, it will become "bbn-numeric"*/

/**
  * @file bbn-field component
  *
  * @description 
  * 
  * bbn-field is a versatile component that adapts itself to the type of the data given by the user. 
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 15/02/2017.
  */
return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.field
     * @mixin bbn.wc.mixins.data
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.field, 
      bbn.wc.mixins.data
    ],
    props: {
      value: {},
      /**
       * The mode of the component.
       *
       * @prop {String} [read] mode
       */
      mode: {
        type: String,
        default: 'read'
      },
    },
    data(){
      return {
        /**
         * The component to render in bbn-field.
         * @data {Boolean|String} renderedComponent
         */
        renderedComponent: false,
        /**
         * The content to render.
         * @data renderedContent 
         */
        renderedContent: '',
        /**
         * The options to bind the component with.
         * @data {Object} renderedOptions
         */
        renderedOptions: bbn.fn.extend({}, this.options),
        /**
         * The current value.
         * @data currentValue 
         */
        currentValue: this.value
      }
    },
    computed: {
      /**
       * Returns the data or the value.
       *
       * @computed actualData
       * @return {Object}
       */
      actualData(){
        if ( this.data ){
          return this.data;
        }
        if ( this.field && (this.value !== undefined) ){
          let d = {};
          d[this.field] = this.value;
          return d;
        }
      },
      /**
       * The actual value of the component.
       *
       * @computed actualValue
       * @return {Object}
       */

      actualValue(){
        let v = this.value;
        if (this.type === 'json' && (bbn.fn.isObject(v) || bbn.fn.isArray(v))) {
          v = JSON.stringify(v);
        }
        return v === undefined ? (this.data && this.field ? this.data[this.field] || '' : undefined) : v;
      }
    },
    methods: {
      /**
       * Initializes the component.
       * @method init
       * @fires render
       * @fires renderData
       */
      init(){
        if ( this.field ){
          if ( (this.mode === 'write') && this.editable ){
            if ( this.required !== undefined ){
              this.renderedOptions.required = this.required;
            }
            if ( this.editor ){
              return this.editor;
            }
            else if ( (this.render !== undefined) && bbn.fn.isFunction(this.render) ){
              this.renderedComponent = 'div';
              this.renderedContent = this.render(this.actualData, this.index, this.field, this.value);
            }
            else if ( this.type ){
              switch ( this.type ){
                case "datetime":
                  this.renderedComponent = 'bbn-datetimepicker';
                  break;
                case "date":
                  this.renderedComponent = 'bbn-datepicker';
                  break;
                case "time":
                  this.renderedComponent = 'bbn-timepicker';
                  break;
                case "email":
                  this.renderedComponent ='bbn-input';
                  break;
                case "url":
                  this.renderedComponent = 'bbn-input';
                  break;
                case "number":
                  this.renderedComponent = 'bbn-numeric';
                  break;
                case "percent":
                  this.renderedComponent = 'bbn-numeric';
                  this.renderedOptions.unit = '%';
                  this.renderedOptions.decimals = 2;
                  break;
                case "money":
                  this.renderedComponent = 'bbn-numeric';
                  this.renderedOptions.decimals = 2;
                  break;
                case "json":
                  this.renderedComponent = 'bbn-json-editor';
                  if (!bbn.fn.isString(this.value)) {
                    this.renderedOptions.value = this.value ? JSON.stringify(this.value) : '';
                  }
                  break;
                case "bool":
                case "boolean":
                  this.renderedComponent = 'bbn-checkbox';
                  this.renderedOptions.value = this.options && (this.options.value !== undefined) ? this.options.value : 1;
                  this.renderedOptions.novalue = this.options && (this.options.novalue !== undefined) ? this.options.novalue : 0;
                  break;
                case "multilines":
                case "textarea":
                    this.renderedComponent = 'bbn-textarea';
                  break;
                default:
                  this.renderedComponent = 'bbn-input';
                  break;
              }
            }
            else if ( this.source ){
              this.renderedComponent = 'bbn-dropdown';
              this.renderedOptions.source = this.source;
            }
            else{
              this.renderedComponent  = 'bbn-input';
            }
            /*
            if( this.renderedComponent !== undefined){
              this.renderedOptions.value = this.value
            }
            */
          }
          else {
            if ( this.component ){
              this.renderedComponent = this.component;
            }
            else{
              this.renderedComponent = 'div';
              if ( (this.render !== undefined) && bbn.fn.isFunction(this.render) ){
                this.renderedContent = this.render(this.actualData, this.index, this.field, this.value);
              }
              else {
                this.renderedContent = this.renderData(this.actualData, this)
              }
            }
            /*
            if( this.renderedComponent !== undefined){
              this.renderedOptions.value = this.value
            }
            */
          }
          if ( this.options && Object.keys(this.options).length ){
            bbn.fn.extend(this.renderedOptions, this.options);
          }
        }
      },
    },
    watch:{
      /**
       * @watch currentValue
       * @param val 
       */
      currentValue(val){
        if ( (this.mode === 'write') && (val !== this.actualValue) ){
          this.$emit('input', val);
        }
        //this.init();
      },
      /**
       * @watch actualValue
       * @param val 
       */
      actualValue(val){
        if ( val !== this.currentValue ){
          this.currentValue = this.actualValue;
        }
      },
      /**
       * @watch value
       * @param val 
       */
      value(val, oldVal){
        if(val !== oldVal){
          this.init();
        }
      }
    },
    /**
     * @event created
     * @fires init
     */
    created(){
      this.init();
    }
  };
