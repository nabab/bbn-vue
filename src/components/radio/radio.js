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

(function(bbn){
  "use strict";

  Vue.component('bbn-radio', {
    /**
     * @mixin bbn.vue.basicComponent 
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     * @mixin bbn.vue.dataSourceComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent, bbn.vue.dataSourceComponent],
    props: {
      /**
       * The value of the radio
       * @prop value
       */
      value: {},
      /**
       * The separator to insert between the radio buttons
       * @prop {String} separator
       */
      separator: {
        type: String
      },
      /**
       * Set to true arranges radio buttons vertically
       * @prop {Boolean} [false] vertical
       */
			vertical: {
				type: Boolean,
				default: false
      },
      /** 
       * If the property vertical is set to false, defines the number of columns used to render the component
       * @prop {Number} step
       */
      step: {
        type: Number
      },
      /**
       * The id of the radio input
       * @prop {String} [bbn.fn.randomString(10, 25)]  id
       */
      id: {
        type: String,
        default(){
          return bbn.fn.randomString(10, 25);
        }
      },
      /**
       * Defines if the input is required
       * @prop {Boolean} [false] required
       */
      required: {
        type: Boolean,
        default: false
      },
      /**
       * Defines if the radio input has to be disabled
       * @prop {Boolean} [false] disabled
       */
      disabled: {
        type: Boolean,
        default: false
      },
      /**
       * The name of the input
       * @prop {String} [null] name
       */
      name: {
        type: String,
        default: null
      },
      /**
       * A function defining how to render each radio label instead of showing the text
       * @prop {Function} render
       * 
       */
      render: {
        type: Function
      },
      /**
       * The name of the property in the item object to be used as text
       * @prop {String} ['text'] sourceText
       */
      sourceText: {
        type: String,
        default: 'text'
      },
      /**
       * The name of the property in the item object to be used as value
       * @prop {String} ['text'] sourceValue
       */
      sourceValue: {
        type: String,
        default: 'value'
      },
      /**
       * The source of the component
       * @prop {Array} [[{text:'Yes', value:1},{text:'No', value:0}]] source
       */
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
      /**
       * @prop {String|Boolean|Number} [undefined] modelValue
       */
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
      /**
       * Returns the html string for the separator between radio buttons in case the prop 'separator' is not defined or the component has the prop 'vertical' set to true
       * @computed getSeparator
       * return {String}
       */
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
      /**
       * @method changed
       * @param val 
       * @param {Event} e 
       * @emits input 
       * @emits change
       */
			changed(val, e){
				this.$emit('input', val);
        this.$emit('change', val);
      },
      /**
       * Basing on the prop 'step' returns the style of the component
       * @method getStyle
       */
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

})(bbn);
