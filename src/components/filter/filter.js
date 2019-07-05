 /**
  * @file bbn-filter component
  *
  * @description The purpose of this component is to apply filters to a complex structure of data.
  * Used on the "bbn-table" component.
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 10/02/2017.
  */
(function(bbn){
  "use strict";
/**@todo add prefix for flexbox and inline flex http://ptb2.me/flexbox/ also for justify content and align items*/
  const
    get_operator_type = function(field){
      if ( typeof field === 'object' ){
        switch ( field.type ){
          case 'int':
            // maxlength is a string!
            if ( field.maxlength == 1 ){
              return 'boolean';
            }
            if ( (field.maxlength == 10) && field.keys ){
              return 'enums';
            }
            return 'number';
          case 'boolean':
            return 'boolean';
          case 'float':
          case 'decimal':
          case 'number':
          case 'money':
            return 'number';
          case 'date':
            return 'date';
          case 'datetime':
            return 'date';
          case 'time':
            return 'date';
          case 'enum':
          case 'enums':
            return 'enums';
          default:
            return 'string';
        }
      }
    },
    get_component_type = function(sqlType){
      switch ( sqlType ){
        case 'int':
        case 'float':
        case 'decimal':
          return 'numeric';
        case 'date':
          return 'datepicker';
        case 'datetime':
          return 'datetimepicker';
        case 'time':
          return 'timepicker';
        default:
          return 'input';
      }
    };

   // var  borders = ['#414d40', '#5a6559', '#7f897e', '#6c7a78', '#515963']
   // var  borders = ['red', 'green', 'yellow', 'pink', 'blue']
  var borders = ['#e47777','#fa4a4a', '#8d0e0e','#b44f4f','#c16262'],
    bg_colors = ['rgba(228,119,119,0.2)', 'rgba(250,74,74,0.2)', 'rgba(141,14,14,0.2)', 'rgba(180,79,79,0.2)', 'rgba(193,98,98,0.2)'];


  Vue.component('bbn-filter', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.dataEditorComponent 
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.dataEditorComponent],
    name: 'bbn-filter',
    props: {
      /**
       * The value of the filter.
       * @prop value
       */
      value: {},
      /**
       * The operator of the filter.
       * @prop value
       */
      operator: {},
      /**
       * @prop operators
       */
      operators: {},
      /**
       * The pre-existing conditions.
       * @prop {Array} [] conditions 
       */
      conditions: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * The previously chosen logic 'AND' or 'OR'.
       * @prop {String} ['AND'] logic
       */
      logic: {
        type: String,
        default: 'AND'
      },
      /**
       * The list of fields given to the filter.
       * @prop {Object|Array} [{}] fields
       */
      fields: {
        type: [Object,Array],
        default(){
          return {}
        }
      },
      /**
       * @prop {Number} [0] num
       */
      num: {
        type: Number,
        default: 0
      },
      // ??
      index: {},
      // @todo not used
      first: {},
      /**
       * The component used for a single filter.
       * @prop component
       */
      component: {},
      /**
       * The component options used for a single filter.
       * @prop {Object} [{}] component
       * 
       */ 
      componentOptions: {
        type: Object,
        default(){
          return {};
        }
      },
      /**
       * The column's value for a single column filter.
       * @prop {String} field
       */
      field: {
        type: String
      },
      /**
       * True if the component is multi-filter.
       * @prop {Boolean} [false] multi
       */
      multi: {
        type: Boolean,
        default: false
      },
      /**
       * The type of data for the operators.
       * @prop {String} ['string'] type
       */
      type: {
        type: String,
        default: 'string'
      }
    },
    data(){
      return {
        /**
         * The value of the property 'logic'.
         * @data {String} ['AND'] currentLogic
         */
        currentLogic: this.logic,
        /**
         * The current value of the filter.
         * @data currentValue
         */
        currentValue: this.value !== undefined ? this.value : null,
        /**
         * The current operator.
         * @data currentOperator
         */
        currentOperator: this.operator !== undefined ? this.value : null
      };
    },
    computed: {
      /**
       * Returns the border color.
       * @computed border_color
       * @return {String} 
       */
      border_color(){
        if ( this.num > borders.length ){
          return borders[this.num % borders.length]
        }
        else{
          return borders[this.num]
        }
      },
      /**
       * @todo not used
       */
      is_not_root(){
        return this.$parent.$el.classList.contains("bbn-filter-control");
      },
    },
    methods: {
      /**
       * Alters the filter's style on mouseover event.
       * 
       * @method over
       * @param {Event} e 
       */
      over(e){
        e.target.style.color = 'red';
        e.target.parentElement.parentElement.querySelector('.bbn-filter-main').style.backgroundColor = 'rgba(158,158,158, 0.3)';
      },
      /**
       * Alters the filter's style on mouseout event.
       * 
       * @method over
       * @param {Event} e 
       */
      out(e){
        e.target.style.color = null;
        e.target.parentElement.parentElement.querySelector('.bbn-filter-main').style.backgroundColor = 'inherit';
      },
      /**
       * Sets the conditions for the filter.
       * 
       * @method setCondition
       * @param {Object} obj 
       * @return {Object} 
       * @emits set
       */
      setCondition(obj){
        if ( obj.field && obj.operator ){
          //bbn.fn.log("setCondition", obj, this.multi);
          obj.time = (new Date()).getTime();
          if ( this.multi ){
            this.conditions.push(obj);
          }
          else{
            this.$emit('set', obj)
          }
        }
        return obj;
      },
      /**
       * Removes the set filter conditions.
       * @method unsetCondition
       * @param {Object} obj 
       * @emits set
       * @return {Object}
       */
      unsetCondition(obj){
        if ( obj.field && obj.operator && obj.time ){
          if ( this.multi ){
            this.conditions.push(obj);
          }
          else{
            this.$emit('set', obj)
          }
        }
        return obj;
      },
      /**
       * Returns the number of fields.
       * @method hasFields
       * @return {Number}
       */
      hasFields(){
        return this.fields && Object.keys(this.fields).length;
      },
      /**
       * Styles the text based on the given condition.
       * 
       * @method condition_text
       * @param {Object} cd 
       * @return {String}
       */
      condition_text(cd){
        let st = '';
        if ( cd && cd.field ){
          let index = bbn.fn.search(this.fields, {field: cd.field});
          if ( index > -1 ){
            let f = this.fields[index];
            st += '<strong>' +
              (f.ftitle ? f.ftitle : (f.title ? f.title : cd.field)) +
              '</strong> ' +
              this.editorOperators[get_operator_type(f)][cd.operator] +
              ' <em>';
            if ( cd.value ){
              if ( cd.value === true ){
                st += 'true';
              }
              else if ( f.source ){
                if (bbn.fn.isArray(f.source) ){
                  st += bbn.fn.get_field(f.source, 'value', cd.value, 'text');
                }
                else if ( typeof f.source === 'object' ){
                  st += f.source[cd.value];
                }
              }
              else{
                st += cd.value;
              }
            }
            else if ( cd.value === 0 ){
              st += '0';
            }
            else if ( cd.value === false ){
              st += 'false';
            }
            st += '</em>';
          }
        }
        return st;
      },
      /**
       * Completely deletes the conditions of the given index.
       * @method delete_full_condition
       * @param {Number} idx 
       * @emits unset
       */
      delete_full_condition(idx){
        this.$emit('unset', this.conditions.splice(idx, 1));
      },
      /**
       * Deletes the given condition.
       * @param {Object} condition 
       * @emits unset
       */
      delete_condition(condition){
        let del = (arr) => {
          let idx = bbn.fn.search(arr, {time: condition.time});
          //bbn.fn.log("Is there the index?", idx);
          if ( idx > -1 ){
            if ( arr[idx].conditions && arr[idx].conditions.length ){
              this.confirm(bbn._("Are you sure you want to delete this group of conditions?"), () => {
                arr.splice(idx, 1);
              })
            }
            else{
              arr.splice(idx, 1);
            }
            return true;
          }
          for ( let i = 0; i < arr.length; i++ ){
            if ( arr[i].conditions ){
              if ( del(arr[i].conditions) ){
                return true;
              }
            }
          }
        };
        if ( del(this.conditions) ){
          this.$forceUpdate();
          this.$emit('unset', condition);
        }

      },
      /**
       * Adds a condition to the given index.
       * @param {Number} idx 
       */
      add_group(idx){
        this.conditions.splice(idx, 1, {
          logic: this.currentLogic,
          conditions: [this.conditions[idx]]
        })
      },
      /**
       * Deletes a condition.
       * @method delete_group
       */
      delete_group(){
        this.$parent.conditions.splice(idx, 1);
      },
    },
    components: {
      /**
       * @component bbn-filter-form
       */
      'bbn-filter-form': {
        name: 'bbn-filter-form',
        /**
         * @mixin bbn.vue.dataEditorComponent
         * @memberof bbn-filter-form 
         */
        mixins: [bbn.vue.dataEditorComponent],
        props: {
          /**
           * The list of fields available for the filter.
           * @prop {Object|Array} [{}] fields
           * @memberof bbn-filter-form 
           */
          fields: {},
          /**
           * The column's value for a single column filter.
           * @prop {String} field
           * @memberof bbn-filter-form 
           */
          field: {
            type: String
          },
          /**
           * The type of data of the operators.
           * @prop {String} ['string'] type
           * @memberof bbn-filter-form 
           */
          type: {
            type: String
          },
          /**
           * The operator of the filter.
           * @prop value
           * @memberof bbn-filter-form 
           */
          operator: {
            type: String
          },
          /**
           * The value of the filter.
           * @prop value
           * @memberof bbn-filter-form 
           */  
          value: {},
          /**
           * The component used for a single filter.
           * @prop component
           * @memberof bbn-filter-form 
           * 
           */
          component: {},
           /**
           * The component options used for a single filter.
           * @prop {Object} [{}] component
           * @memberof bbn-filter-form 
           */ 
          componentOptions: {
            type: Object,
            default(){
              return {}
            }
          },
          /**
           * Set to true to show the button to delete a condition.
           * @prop {Boolean} [false] buttonDelete
           * @memberof bbn-filter-form 
           */
          buttonDelete: {
            type: Boolean,
            default: false
          }
        },
        data(){
          return {
            /**
             * The current field.
             * @data {String} currentField
             * @memberof bbn-filter-form 
             */
            currentField: this.field || '',
            /**
             * The current type.
             * @data currentType
             * @memberof bbn-filter-form 
             */
            currentType: this.type || '',
            /**
             * The current value.
             * @data currentValue
             * @memberof bbn-filter-form 
             */
            currentValue: this.value || '',
            /**
             * The current component.
             * @data {String} currentComponent
             * @memberof bbn-filter-form 
             */
            currentComponent: this.component || '',
            /**
             * The current component's options.
             * @data {Object} currentComponentOptions
             * 
             * @memberof bbn-filter-form 
             */
            currentComponentOptions: this.componentOptions,
            /**
             * The current operator.
             * @data {String} currentOperator
             * 
             * @memberof bbn-filter-form 
             */
            currentOperator: this.operator || '',
            /**
             * The current operators.
             * @data {Array} [[]] currentOperators
             * 
             * @memberof bbn-filter-form 
             */
            currentOperators: [],
            /**
             * The current condition.
             * @data {Boolean} currentCondition
             * 
             * @memberof bbn-filter-form 
             */
            currentCondition: false,
            /**
             * @todo not used
             */
            has_group: false,
            /**
             * @todo not used
             */
            has_condition: true,
            /**
             * @prop {Array} [[]] items
             * @memberof bbn-filter-form 
             */
            items: [],
            /**
             * @prop cfg
             * @memberof bbn-filter-form 
             */
            cfg: {}
          };
        },
        computed: {
          /**
           * Returns the object containing the operators.
           * @computed operators
           * @fires editorGetComponentOptions
           * @memberof bbn-filter-form 
           * @return {Object}
           */
          operators(){
            let cfg = this.editorGetComponentOptions({
              field: this.currentField,
              type: this.currentType,
              value: this.currentValue
            });
            return this.currentType && this.editorOperators[cfg.type || this.currentType] ?
              this.editorOperators[cfg.type || this.currentType] : [];
          },
          /**
           * True if the filter form has no value.
           * @computed no_value
           * @memberof bbn-filter-form 
           * @return {Boolean}
           */
          no_value(){
            return this.editorHasNoValue(this.operator);
          },
          /**
           * Normalizes the array 'fields' to use as the source of the form's dropdown.
           * @computed columns
           * @return {Array}
           * @memberof bbn-filter-form 
           */
          columns(){
            let r = [];
            if (bbn.fn.isArray(this.fields) ){
              bbn.fn.each(this.fields, (a, i) => {
                if ( a.field ){
                  r.push({
                    text: a.ftitle ? a.ftitle : (a.title ? a.title : a.field),
                    value: a.field
                  });
                }
              })
            }
            else{
              for ( let n in this.fields ){
                r.push(n);
              }
            }
            return r;
          },
          /**
           * Returns the object 'field' of the corresponding current field.
           * @computed currentFullField
           * @memberof bbn-filter-form 
           * @return {Object}
           * 
           */
          currentFullField(){
            if ( this.currentField ){
              let idx = bbn.fn.search(this.fields, {field: this.currentField});
              if ( idx > -1 ){
                return this.fields[idx];
              }
            }
            return {};
          },
          /**
           * Returns the title of the current field.
           * @computed currentTitle
           * @memberof bbn-filter-form 
           * @return {String}
           */
          currentTitle(){
            if ( this.currentField ){
              let idx = bbn.fn.search(this.fields, {field: this.currentField});
              if ( idx > -1 ){
                return this.fields[idx].title || this.fields[idx].ftitle || this.fields[idx].field || '';
              }
            }
            return '';
          }
        },
        methods: {
          /**
           * Validates the form.
           * @method validate
           * @param {Boolean} cancel 
           * @fires editorHasNoValue
           * @fires $parent.unsetCondition
           * @fires $parent.setCondition
           * @emits validate
           * @emits invalidate
           * @emits error
           * @memberof bbn-filter-form 
           */
          validate(cancel){
            if ( this.currentField && this.currentOperator && (this.currentValue || this.editorHasNoValue(this.currentOperator)) ){
              var tmp = {
                field: this.currentField,
                operator: this.currentOperator
              };
              if ( !this.editorHasNoValue(this.currentOperator) ){
                tmp.value = this.currentValue;
              }
              if ( (cancel === true) && this.currentCondition){
                this.$parent.unsetCondition(this.currentCondition);
              }
              else{
                this.currentCondition = this.$parent.setCondition(tmp);
                //bbn.fn.log("CONDI", this.currentCondition);
              }
              this.$emit(cancel ? 'invalidate' : 'validate', tmp, cancel);
            }
            else{
              this.$emit('error', bbn._("Value is required. You should choose another operator if you want to look for an element empty or null"));
            }
          },
          /**
           * Resets the current operator and the current value to their default.
           * @method unset
           * @emits $parent.unset
           * @memberof bbn-filter-form 
           */
          unset(){
            //bbn.fn.log("UNST", this.currentCondition);
            this.currentOperator = '';
            this.currentValue = '';
            this.$parent.$emit('unset')
          }
        },
        /**
         * @event created
         * @memberof bbn-filter-form 
         */
        created(){
          if ( this.type && this.editorOperators[this.type] ){
            this.currentOperators = this.editorOperators[this.type];
          }
        },
        /**
         * @event created
         * @memberof bbn-filter-form 
         */
        mounted(){
          this.ready = true;
          /*if ( this.columns.length === 1 ){
            this.currentField = this.fields[0].field;
          }*/
          //bbn.fn.log("FILTER FORM MOUNTED", this);
        },
        watch: {
          /**
           * 
           * @watch currentField
           * @param {} newVal 
           * @fires editorGetComponentOptions
           * @memberof bbn-filter-form 
           */
          currentField(newVal){
            let index = bbn.fn.search(this.fields, {field: newVal});
            if ( index > -1 ){
              let o = this.editorGetComponentOptions(this.fields[index]);
              if ( o ){
                this.currentType = o.type;
                this.currentComponent = o.component;
                this.currentComponentOptions = o.componentOptions;
              }
            }
          }
          /*
          currentColumn(newVal){
            let ds = [],
                idx = bbn.fn.search(this.fields, {field: newVal});
            this.cfg = {};
            if ( idx > -1 ){
              let c                = this.fields[idx],
                  currentComponent = this.vueComponent;
              this.currentType = get_operator_type(c);
              if ( !newVal ){
                this.currentOperator = '';
                this.vueComponent = '';
                this.currentType = '';
              }
              else{
                bbn.fn.log("TYPE!!", c);
                switch ( c.currentType ){
                  case 'int':
                    if ( !c.signed && (c.maxlength == 1) ){
                      this.vueComponent = 'radio';
                    }
                    else if ( c.maxlength == 10 ){
                      this.vueComponent = 'tree-input';
                      this.cfg.source = 'options/tree';
                    }
                    else{
                      if ( !c.signed ){
                        this.cfg.min = 0;
                      }
                      this.cfg.max = 1;
                      for ( var i = 0; i < c.maxlength; i++ ){
                        this.cfg.max = this.cfg.max * 10;
                      }
                      this.cfg.max--;
                      this.vueComponent = 'numeric';
                    }
                    break;
                  case 'float':
                  case 'decimal':
                    this.vueComponent = 'numeric';
                    var tmp = c.maxlength.split(","),
                        max = parseInt(tmp[0]) - parseInt(tmp[1]);
                    this.cfg.format = 'n' + tmp[1];
                    if ( !c.signed ){
                      this.cfg.min = 0;
                    }
                    this.cfg.max = 1;
                    for ( var i = 0; i < max; i++ ){
                      this.cfg.max = this.cfg.max * 10;
                    }
                    this.cfg.max--;
                    this.vueComponent = 'numeric';
                    break;
                  case 'enum':
                    var tmp = eval('[' + c.extra + ']');
                    if (bbn.fn.isArray(tmp) ){
                      this.cfg.dataSource = bbn.fn.map(tmp, function (a){
                        return {
                          text: a,
                          value: a
                        };
                      });
                      this.cfg.optionLabel = bbn._("Choisir une valeur");
                      this.vueComponent = 'dropdown';
                    }
                    break;
                  case 'date':
                    this.vueComponent = 'datepicker';
                    break;
                  case 'datetime':
                    this.vueComponent = 'datetimepicker';
                    break;
                  case 'time':
                    this.vueComponent = 'timepicker';
                    break;
                  default:
                    this.vueComponent = 'input';
                    break;
                }
              }

              if ( currentComponent !== this.vueComponent ){
                if ( this.$refs.value && this.$refs.value.widget ){
                  this.$refs.value.widget.destroy();
                  var $ele = $(this.$refs.value.$el);
                  $ele.prependTo($ele.closest(".bbn-db-value")).nextAll().remove();
                }
                this.$nextTick(() =>{
                  this.$refs.operator.widget.select(0);
                  this.$refs.operator.widget.trigger("change");
                });
              }
            }
          }
          */
        }
      }
    }
  });

})(bbn);
