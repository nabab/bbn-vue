/**
 * Created by BBN on 15/02/2017.
 */
(($, bbn) => {

  "use strict";
  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-field', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.fieldComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.fieldComponent],
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
        renderedComponent: false,
        renderedContent: '',
        renderedOptions: $.extend(true, {}, this.options),
        currentValue: this.value === undefined ? (this.data && this.field ? this.data[this.field] || '' : '') : this.value
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
       * If the value of the component is undefined then it returns this.data[this.field]. Otherwise it returns the value
       *
       * @computed actualValue
       * @return {Object}
       */

      actualValue(){
        return this.value === undefined ? (this.data && this.field ? this.data[this.field] || '' : undefined) : this.value;
      }
    },
    methods: {
      init(){
        if ( this.field ){
          if ( (this.mode === 'write') && this.editable ){
            if ( this.required !== undefined ){
              this.renderedOptions.required = this.required;
            }
            if ( this.editor ){
              return this.editor;
            }
            else if ( this.render !== undefined ){
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
                  break;
                case "bool":
                case "boolean":
                  this.renderedComponent = 'bbn-checkbox';
                  this.renderedOptions.value = 1;
                  this.renderedOptions.novalue = 0;
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
              if ( this.render !== undefined ){
                this.renderedContent = this.render(this.actualData, this.index, this.field, this.value);
              }
              else if ( this.icon ){
                this.renderedComponent = 'div';
                this.renderedContent = '<i class="' + this.icon + '"> </i>'
              }
              else if ( this.type ){
                switch ( this.type ){
                  case "datetime":
                    if ( this.format ){
                      this.renderedContent = this.currentValue ? (new moment(this.currentValue)).format(this.format) : '-';
                    }
                    else{
                      this.renderedContent = this.currentValue ? bbn.fn.fdate(this.currentValue) : '-';
                    }
                    break;
                  case "date":
                    if ( this.format ){
                      this.renderedContent = this.currentValue ? (new moment(this.currentValue)).format(this.format) : '-';
                    }
                    else{
                      this.renderedContent = this.currentValue ? bbn.fn.fdate(this.currentValue) : '-';
                    }
                    break;
                  case "time":
                    if ( this.format ){
                      this.renderedContent = this.currentValue ? (new moment(this.currentValue)).format(this.format) : '-';
                    }
                    else{
                      this.renderedContent = this.currentValue ? bbn.fn.fdate(this.currentValue) : '-';
                    }
                    break;
                  case "email":
                    this.renderedContent = this.currentValue ? '<a href="mailto:' + this.currentValue + '">' + this.currentValue + '</a>' : '-';
                    break;
                  case "url":
                    this.renderedContent = this.currentValue ? '<a href="' + this.currentValue + '">' + this.currentValue + '</a>' : '-';
                    break;
                  case "percent":
                    this.renderedContent = this.currentValue ? bbn.fn.money(this.currentValue * 100, false, "%", '-', '.', ' ', 2) : '-';
                    break;
                  case "number":
                    this.renderedContent = this.currentValue ?
                      bbn.fn.money(
                        this.currentValue,
                        (this.precision === -4) || (this.format && (this.format.toLowerCase() === 'k')),
                        this.renderedOptions.unit || this.unit || "",
                        '-',
                        '.',
                        ' ',
                        this.precision === -4 ? 3 : this.precision
                      ) : '-';
                    break;
                  case "money":
                    this.renderedContent = this.currentValue ?
                      bbn.fn.money(
                        this.currentValue,
                        (this.precision === -4) || (this.format && (this.format.toLowerCase() === 'k')),
                        this.renderedOptions.currency || this.currency || this.unit || "",
                        '-',
                        ',',
                        ' ',
                        this.precision === -4 ? 3 : this.precision
                      ) : '-';
                    break;
                  case "bool":
                  case "boolean":
                    let isYes = this.currentValue && (this.currentValue !== 'false') && (this.currentValue !== '0');
                    if ( this.renderedOptions.yesvalue !== undefined ){
                      isYes = this.currentValue === this.options.yesvalue;
                    }
                    this.renderedContent = '<i class="fas fa-' + (isYes ? 'check' : 'times') + '" title="' + (isYes ? bbn._("Yes") : bbn._("No")) + '"></i>';
                    break;
                }
              }
              else if ( this.source ){
                let idx = bbn.fn.search(this.source, {value: this.value});
                this.renderedContent = idx > -1 ? this.source[idx].text : '-';
              }
              else if ( this.renderedOptions.source ){
                let idx = bbn.fn.search(this.renderedOptions.source, {value: this.value});
                this.renderedContent = idx > -1 ? this.renderedOptions.source[idx].text : '-';
              }
              else if ( this.value ){
                this.renderedContent = this.value;
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
      currentValue(val){
        if ( (this.mode === 'write') && (val !== this.actualValue) ){
          this.$emit('input', val);
        }
        this.init();
      },
      actualValue(val){
        if ( val !== this.currentValue ){
          this.currentValue = this.actualValue;
        }
      },
      value(val, oldVal){
        if(val !== oldVal){
          this.init();
        }
      }
    },
    created(){
      this.init();
    }
  });

})(jQuery, bbn, kendo);
