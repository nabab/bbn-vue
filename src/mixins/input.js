((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Input component
     * @component inputComponent
     */
    inputComponent: {
      props: {
        /**
         * The value of the component.
         * @prop value
         * @memberof inputComponent
         */
        value: {},
        /**
         * The component's name.
         * @prop {String} name 
         * @memberof inputComponent
         */
        name: {
          type: String
        },
        /**
         * The component's placeholder.
         * @prop {String} placeholder
         * @memberof inputComponent
         */
        placeholder: {
          type: String
        },
        /**
         * Defines if the component has a required value.
         * @prop {Boolean|Function} [false] required
         * @memberof inputComponent
         */
        required: {
          type: [Boolean, Function, String],
          default: false
        },
        /**
         * Defines if the component has to be disabled.
         * @prop {Boolean|Function} [false] disabled
         * @memberof inputComponent
         */
        disabled: {
          type: [Boolean, Function],
          default: false
        },
        /**
         * Defines if the component has to be readonly.
         * @prop {Boolean|Function} [false] readonly
         * @memberof inputComponent
         */
        readonly: {
          type: [Boolean, Function],
          default: false
        },
        /**
         * Defines the size of the component.
         * @prop {Number|String} size
         * @memberof inputComponent
         */
        size: {
          type: [Number, String]
        },
         /**
         * Defines the maxlength of the value.
         * @prop {Number|String} maxlength 
         * @memberof inputComponent
         */
        maxlength: {
          type: [String, Number]
        },
        /**
         * A function to validate the value before submit.
         * @prop {Function} validation
         * @memberof inputComponent
         */
        validation: {
          type: [Function]
        },
        /**
         * The attribute tabindex of the input component.
         * @prop {Number} tabindex
         * @memberof inputComponent
         */
        tabindex: {
          type: Number,
          default: 0
        },
        /**
         * @prop {Boolean} [false] nullable
         * @memberof inputComponent
         */
        nullable: {
          type: Boolean,
          default: false
        },
        /**
         * Set it to true if you want to auto-resize the input's width based on its value (in characters).
         * @prop {Boolean} [false] autosize
         */
        autosize: {
          type: Boolean,
          default: false
        },
        /**
         * @prop {Number|String} default
         * @memberof inputComponent
         */
        default: {
          type: [String, Number]
        }
      },
      data(){
        return {
          /**
           * True if the component has a value.
           * @data {Boolean} hasVale
           */
          hasValue: !!this.value,

        };
      },
      computed: {
        /**
         * Returns true if the component can have a null value.
         * @computed isNullable
         * @returns {Boolean}
         */
        isNullable(){
          let isNullable = !!this.nullable;
          if ( this.nullable === null ){
            isNullable = this.required ? false : !!this.placeholder;
          }
          return isNullable;
        }
      },
      methods: {
        /**
         * Select the text of the component.
         * @method selectText
         * @memberof inputComponent
         */
        selectText(){
          let ele = this.getRef('element');
          if (ele) {
            bbn.fn.selectElementText(ele)
          }
        },
        /**
         * Emits the event input.
         * @method emitInput
         * @emit input
         * @param {Number|String} val 
         * @memberof inputComponent
         */
        emitInput(val){
          this.$emit('input', val);
        },
        /**
         * Emits the event change.
         * @method change
         * @emit change
         * @param {Event} e 
         * @memberof inputComponent
         */
        change(e){
          this.$emit('change', e, this.value)
        },
        /**
         * Check the validity of the inserted value.
         * @method isValid
         * @param {Vue} e 
         * @return {Boolean}
         * @memberof inputComponent
         */
        isValid(e){
          const $this = bbn.fn.isVue(e) ? e : this,
                ele = $this.$refs.element || false,
                inp = $this.$refs.input || false,
                customMessage = $this.$el.hasAttribute('validationMessage') ? $this.$el.getAttribute('validationMessage') : false;
          let check = (elem) => {
            if ( elem && elem.validity ){
              let validity = elem.validity,
                  $elem = $this.$el,
                  // Default message
                  mess = bbn._('The value you entered for this field is invalid.'),
                  specificCase = false;
              // If valid or disabled, return true
              if ( elem.disabled || validity.valid ){
                //if ( (!!elem.required || !!elem.readOnly) && !elem.value ){
                if ( elem.required && !elem.value ){
                  specificCase = true;
                }
                else {
                  return true;
                }
              }
              
              if ( !validity.valid || specificCase ){
                // If field is required and empty
                if ( validity.valueMissing || specificCase ){
                  mess = bbn._('Please fill out this field.');
                }
                // If not the right type
                else if ( validity.typeMismatch ){
                  switch ( elem.type ){
                    // Email
                    case 'email':
                      mess = bbn._('Please enter a valid email address.');
                      break;
                    // URL
                    case 'url':
                      mess = bbn._('Please enter a valid URL.');
                      break;
                  }
                }
                // If too short
                else if ( validity.tooShort ){
                  mess = bbn._('Please lengthen this text to ') + elem.getAttribute('minLength') + bbn._(' characters or more. You are currently using ') + elem.value.length + bbn._(' characters.');
                }
                // If too long
                else if ( validity.tooLong ){
                  mess = bbn._('Please shorten this text to no more than ') + elem.getAttribute('maxLength') + bbn._(' characters. You are currently using ') + elem.value.length + bbn._(' characters.');
                }
                // If number input isn't a number
                else if ( validity.badInput ){
                  mess = bbn._('Please enter a number.');
                }
                // If a number value doesn't match the step interval
                else if ( validity.stepMismatch ){
                  mess = bbn._('Please select a valid value.');
                }
                // If a number field is over the max
                else if ( validity.rangeOverflow ){
                  mess = bbn._('Please select a value that is no more than ') + elem.getAttribute('max') + '.';
                }
                // If a number field is below the min
                else if ( validity.rangeUnderflow ){
                  mess = bbn._('Please select a value that is no less than ') + elem.getAttribute('min') + '.';
                }
                // If pattern doesn't match
                else if (validity.patternMismatch) {
                  // If pattern info is included, return custom error
                  mess = bbn._('Please match the requested format.');
                }
                this.$emit('error', customMessage || mess);
                bbn.fn.log(customMessage || mess);
                let border = $elem.style.border;
                $elem.style.border = '1px solid red';
                this.$once('blur', () => {
                  $elem.style.border  = border;
                  $elem.focus();
                });
                return false;
              }
            }
          };
          let getLastElement = (elem) => {
            if ( bbn.fn.isVue(elem) && elem.$refs && elem.$refs.element ){
              return getLastElement(elem.$refs.element);
            }
            return elem;
          };
          if (inp) {
            return check(getLastElement(inp)) || false;
          }
          if (ele) {
            return check(getLastElement(ele)) || false;
          }
          return true;
        },
      },
      /**
       * Adds the class 'bbn-input-component' to the component.
       * @event created
       * @memberof inputComponent
       */
      created(){
        this.componentClass.push('bbn-input-component');
        if ( this.autosize ){
          this.componentClass.push('bbn-auto-width');
        }
      },
      watch:{
        /**
         * @watch value
         * @param newVal 
         * @memberof inputComponent
         */
        value(newVal){
          if ( this.widget && (this.widget.value !== undefined) ){
            if (bbn.fn.isFunction(this.widget.value) ){
              if ( this.widget.value() !== newVal ){
                this.widget.value(newVal);
              }
            }
            else{
              if ( this.widget.value !== newVal ){
                this.widget.value = newVal;
              }
            }
          }
          if ( !!newVal !== this.hasValue ){
            this.hasValue = !!newVal;
          }
        }
      }
    }
  });
})(bbn);