(bbn => {
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
        value: {
          default(){
            return this.defaultValue !== undefined ? this.defaultValue : ''
          }
        },
        /**
         * The component's name.
         * @prop {String} name 
         * @memberof inputComponent
         */
        name: {
          type: String,
          default(){
            return bbn.fn.randomString(10, 20)
          }
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
          type: [String, Number],
          default: '0'
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
         * @prop {Number|String} defaultValue
         * @memberof inputComponent
         */
        defaultValue: {
          type: [String, Number]
        },
        /**
         * @prop {Boolean} [true] writable
         * */
        writable: {
          type: Boolean,
          default: true
        },
        /**
         * Defines the input mode of this elemenet
         * @prop {String} inputmode
         */
        inputmode: {
          type: String
        },
        /**
         * If true the element will focus on insert
         * @prop {Boolean} autofocus
         */
        focused: {
          type: Boolean,
          default: false
        },
        /**
         * @prop {Boolean} [false] ellipsis
         */
        ellipsis: {
          type: Boolean,
          default: false
        }
      },
      data(){
        let original = this.value;
        if (bbn.fn.isObject(this.value) || bbn.fn.isArray(this.value)) {
          original = bbn.fn.clone(this.value);
        }

        return {
          /**
           * True if the component has a value.
           * @data {Boolean} hasVale
           */
          hasValue: !!this.value,
          originalValue: original
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
            isNullable = !this.required;
          }

          return isNullable;
        },
        /**
         * Returns true if the component is disabled
         * @computed isDisabled
         * @fires closest
         * @returns {Boolean}
         */
        isDisabled(){
          let form = this.closest('bbn-form');
          return this.disabled || (bbn.fn.isVue(form) && form.disabled);
        }
      },
      methods: {
        resetValue(){
          if (bbn.fn.isObject(this.value) || bbn.fn.isArray(this.value)) {
            this.originalValue = bbn.fn.clone(this.value);
          }
          else {
            this.originalValue = this.value;
          }
        },
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
        isValid(e, setError = true){
          const $this = bbn.fn.isVue(e) ? e : this,
                ele = $this.$refs.element || false,
                inp = $this.$refs.input || false,
                customMessage = $this.$el.hasAttribute('validationMessage') ? $this.$el.getAttribute('validationMessage') : false;
          let check = elem => {
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
                  mess = bbn._('Please lengthen this text to %d characters or more. You are currently using %d characters.', parseInt(elem.getAttribute('minLength')), elem.value.length);
                }
                // If too long
                else if ( validity.tooLong ){
                  mess = bbn._('Please shorten this text to no more than %d characters. You are currently using %d characters.', parseInt(elem.getAttribute('maxLength')), elem.value.length);
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
                  mess = bbn._('Please select a value that is no more than %d.', parseInt(elem.getAttribute('max')));
                }
                // If a number field is below the min
                else if ( validity.rangeUnderflow ){
                  mess = bbn._('Please select a value that is no less than %d.', parseInt(elem.getAttribute('min')));
                }
                // If pattern doesn't match
                else if (validity.patternMismatch) {
                  // If pattern info is included, return custom error
                  mess = bbn._('Please match the requested format.');
                }
                if (setError) {
                  this.$emit('error', customMessage || mess);
                  this.validationID = bbn.fn.randomString();
                  if (!this.$el.classList.contains('bbn-state-invalid')) {
                    this.$el.classList.add('bbn-state-invalid');
                  let cont = document.createElement('div');
                  cont.id = this.validationID;
                  cont.innerHTML = `
                    <bbn-tooltip source="${customMessage || mess}"
                                  ref="tooltip"
                                  @hook:mounted="showContent"
                                  :icon="false"
                                  position="bottomLeft"
                                  @close="removeEle"
                                  :element="element"/>
                  `;
                    this.$el.appendChild(cont);
                    new Vue({
                      el: `#${this.validationID}`,
                      data(){
                        return {
                          element: $elem
                        }
                      },
                      methods: {
                        showContent(){
                          this.getRef('tooltip').isVisible = true;
                        },
                        removeEle(){
                          this.$el.remove();
                        }
                      }
                    })
                  }
                  this.$once('blur', () => {
                    this.$emit('removevalidation');
                    $elem.focus();
                  });
                }
                return false;
              }
            }
          };
          let getLastElement = elem => {
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
      mounted() {
        setTimeout(() => {
          if (this.autofocus) {
            const ele = this.$refs.element || this.$refs.input || this.$el;
            ele.focus();
          }
        }, 100)
        this.$on('removevalidation', () => {
          if (!!this.validationID
            && this.$el.classList.contains('bbn-state-invalid')
          ) {
            this.$el.classList.remove('bbn-state-invalid');
            if (document.getElementById(this.validationID)) {
              document.getElementById(this.validationID).remove();
            }
            this.validationID = false;
          }
        })
        const input = this.getRef('element');
        if (input) {
          input.addEventListener('input', e => {
            e.stopImmediatePropagation();
            if (this.value !== input.value) {
              Object.defineProperty(this, 'value', {
                value: input.value,
                writable: false,
                configurable: true
              });
              this.currentValue = input.value;
              this.$emit('input', this.value);
            }
          })
          input.addEventListener('change', e => {
            this.$emit('change', this.value);
          })
        }
      },
      watch: {
        /**
         * @watch value
         * @param newVal 
         * @memberof inputComponent
         */
        value(newVal){
          if (newVal !== this.currentValue) {
            this.currentValue = newVal;
          }
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
        currentValue(newVal) {
          if (newVal !== this.currentValue) {
            this.currentValue = newVal;
          }
        },
      }
    }
  });
})(bbn);