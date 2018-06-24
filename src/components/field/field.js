/**
 * Created by BBN on 15/02/2017.
 */
(($, bbn) => {
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-field', {
    mixins: [bbn.vue.basicComponent, bbn.vue.fieldComponent],
    props: {
      value: {},
      mode: {
        type: String,
        default: 'read'
      },
    },
    data(){
      return {
        renderedComponent: false,
        renderedContent: '',
        renderedOptions: {},
        currentValue: this.value === undefined ? (this.data && this.field ? this.data[this.field] || '' : '') : this.value
      }
    },
    computed: {
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
      actualValue(){
        return this.value === undefined ? (this.data && this.field ? this.data[this.field] || '' : undefined) : this.value;
      }
    },
    methods: {
      init(){
        this.renderedOptions = {};
        if ( this.field ){
          if ( (this.mode === 'write') && this.editable ){
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
                case "money":
                  this.renderedComponent = 'bbn-numeric';
                  break;
                case "json":
                  this.renderedComponent = 'bbn-json-editor';
                  break;
                case "bool":
                case "boolean":
                  this.renderedComponent = 'bbn-checkbox';
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
              this.renderedComponent  = 'bbn-input'
            }
            /*
            if( this.renderedComponent !== undefined){
              this.renderedOptions.value = this.value
            }
            */
            if ( this.options && Object.keys(this.options).length ){
              this.renderedOptions = bbn.fn.extend(this.renderedOptions, this.options);
            }
          }
          else {
            if ( this.component ){
              this.renderedComponent = this.component;
              this.renderedOptions = this.options;
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
                  case "number":
                    this.renderedContent = this.currentValue ? kendo.toString(parseInt(this.currentValue), "n0") + ( this.unit ? " " + this.unit : "") : '-';
                    break;
                  case "money":
                    this.renderedContent = this.currentValue ?
                      bbn.fn.money(this.currentValue) + (
                        this.currency || this.unit ?
                          " " + ( this.currency || this.unit )
                          : ""
                      )
                      : '-';
                    break;
                  case "bool":
                  case "boolean":
                    this.renderedContent = this.currentValue && (this.currentValue !== 'false') && (this.currentValue !== '0') ? bbn._("Yes") : bbn._("No");
                    break;
                }
              }
              else if ( this.source ){
                let idx = bbn.fn.search(this.source, {value: this.value});
                this.renderedContent = idx > -1 ? this.source[idx].text : '-';
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
        }
      },
    },
    watch:{
      currentValue(val){
        if ( val !== this.actualValue ){
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
