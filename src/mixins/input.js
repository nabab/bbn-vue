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
         * The component placeholder.
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
         * The type of the component.
         * @prop {Number} tabindex
         * @memberof inputComponent
         */
        tabindex: {
          type: Number,
          default: 0
        },
        /**
         * @prop {Boolean} [false] nullable
         * @memberof listComponent
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
        }
      },
      data(){
        return {
          hasValue: !!this.value
        };
      },
      computed: {
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
         * Emits the event input.
         * @method emitInput
         * @emit input
         * @param val 
         * @memberof inputComponent
         */
        emitInput(val){
          this.$emit('input', val);
        },
        /**
         * Emits the event change.
         * @method change
         * @emit change
         * @param e 
         * @memberof inputComponent
         */
        change(e){
          this.$emit('change', e, this.value)
        },
        /**
         * Check the validity of the inserted value.
         * @method isValid
         * @param val 
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
                    if ( !!elem.required && !elem.value ){
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
                    let border = $elem.style.border;
                    $elem.style.border = '1px solid red';
                    this.$on('blur', () => {
                      $elem.style.border  = border;
                      $elem.focus();
                    });
                    return false;
                  }
                }
              },
              getLastElement = (elem) => {
                if ( bbn.fn.isVue(elem) && elem.$refs && elem.$refs.element ){
                  return getLastElement(elem.$refs.element);
                }
                return elem;
              },
            okEle = ele ? check(getLastElement(ele)) : false,
            okInp = inp ? check(getLastElement(inp)) : false;
          return ele || inp ? !!(okEle || okInp) : true;
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
        },
        cfg(){

        }
      }
    }
  });
})(bbn);