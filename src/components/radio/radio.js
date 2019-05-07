/**
 * @file bbn-radio component
 *
 * @description bbn-radio is a component that can be used as an interactive value choice, that can be activated or deactivated.
 * This is very useful for selecting a particular choice from a certain range of options.
 * In addition it's possible to easily customize the component, using the specific properties.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 13/02/2017
 */

(function($, bbn){
  "use strict";
  Vue.component('bbn-radio', {
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent, bbn.vue.dataSourceComponent],
    props: {
      value: {},
      separator: {
        type: String
      },
			vertical: {
				type: Boolean,
				default: false
			},
      step: {
        type: Number
      },
      id: {
        type: String,
        default(){
          return bbn.fn.randomString(10, 25);
        }
      },
      required: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      name: {
        type: String,
        default: null
      },
      render: {
        type: Function
      },
      sourceText: {
        type: String,
        default: 'text'
      },
      sourceValue: {
        type: String,
        default: 'value'
      },
      source: {
        type: Array,
        default(){
          return [{
            text: bbn._("Yes"),
            value: 1
          }, {
            text: bbn._("No"),
            value: 0
          }];
        }
      },
      modelValue: {
        type: [String, Boolean, Number],
        default: undefined
      }
    },
    model: {
      prop: 'modelValue',
      event: 'input'
    },
    computed: {
      getSeparator(){
        if ( this.vertical && !this.separator ){
          return '<div style="margin-bottom: 0.5em"></div>'
        }
        if ( !this.vertical && !this.separator ){
          return '<span style="margin-left: 2em">&nbsp;</span>'
        }
        return this.separator;
      }
    },
		methods: {
			changed(val, e){
				this.$emit('input', val);
        this.$emit('change', val);
			},
      getStyle(){
			  if ( this.step && !this.vertical ){
			    return 'display: grid; grid-template-columns: ' + 'auto '.repeat(this.step) + ';';
        }
        else {
          return '';
        }
      }
		}
  });

})(jQuery, bbn);
