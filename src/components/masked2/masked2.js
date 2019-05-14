/**
 * @file bbn-masked component
 * @description bbn-masked is a useful component for those who want full control of data that needs to be processed.
 * It represents an input that allows the user to insert the desired values  in a defined format.For example: the insertion of telephone number.
 * @copyright BBN Solutions
 * @author Mirko Argentino
 */

(function($, bbn){
  "use strict"

  Vue.component('bbn-masked2', {
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      /** 
       * The mask pattern (required).
       * 
       * @prop {String} mask
       * @required true
      */
      mask: {
        type: String,
        required: true,
        validator: val => !!val.length
      },
      /** 
       * The character used for the prompt.
       * 
       * @prop {String} ['_'] promptChar
      */
      promptChar: {
        type: String,
        default: '_'
      }
    },
    data(){
      return {
        /** 
         * The symbol used as escape.
         * 
         * @data {String} ['\'] escape
        */
        escape: '\\',
        /** 
         * The patterns list.
         * 
         * @data {Object} patterns
        */
        patterns: {
          // Digit. Accepts any digit between 0 and 9.
          0: {
            pattern: '[0-9]'
          },
          // Digit or space. Accepts any digit between 0 and 9, plus space.
          9: {
            pattern: '[0-9\s]'
          },
          // Digit or space. Like 9 rule, but allows also (+) and (-) signs.
          '#': {
            pattern: '[0-9\s\\+\\-]'
          },
          // Letter. Restricts input to letters a-z and A-Z. This rule is equivalent to [a-zA-Z] in regular expressions.
          'L': {
            pattern: '[a-zA-Z]'
          },
          // Letter or space. Restricts input to letters a-z and A-Z. This rule is equivalent to [a-zA-Z] in regular expressions.
          '?': {
            pattern: '[a-zA-Z\s]'
          },
          // Character. Accepts any character. The rule is equivalent to \S in regular expressions.
          '&': {
            pattern: '\S'
          },
          // Character or space. Accepts any character. The rule is equivalent to . in regular expressions.
          'C': {
            pattern: '.'
          },
          // Alphanumeric. Accepts letters and digits only.
          'A': {
            pattern: '[0-9a-zA-Z]'
          },
          // Alphanumeric or space. Accepts letters, digits and space only.
          'a': {
            pattern: '[0-9a-zA-Z\s]'
          },
          // Decimal placeholder. The decimal separator will be gotten from the bbn.env.money property.
          '.': {
            static: bbn.env && bbn.env.money && bbn.env.money.decimal ? bbn.env.money.decimal : '.'
          },
          // Thousands placeholder. The display character will be gotten from the bbn.env.money property.
          ',': {
            static: bbn.env && bbn.env.money && bbn.env.money.thousands ? bbn.env.money.thousands : ','
          },
          // Currency symbol. The display character will be gotten from the bbn.env.money property.
          '$': {
            static: bbn.env && bbn.env.money && bbn.env.money.currency ? bbn.env.money.currency : '€'
          }
        },
        /** 
         * The current input value.
         * 
         * @data inputValue {String} inoutValue
        */
        inputValue: ''
      }
    },
    computed: {
      /** 
       * The list of the escape positions into the mask.
       * 
       * @computed escapePos
       * @returns {Array}
      */
      escapePos(){
        let exp = Object.keys(this.patterns).map(p => {
              return this.escape.repeat(p === '?' ? 4 : 2) + p
            }).join('|'),
            reg = new RegExp(exp, 'g')
        return [...this.mask.matchAll(reg)].map(e => e.index)
      },
      /** 
       * The list of the banned positions into the mask.
       * The position indexes are created without taking into account the positions with the escape symbol.
       * 
       * @computed bannedPos
       * @returns {Array}
      */
      bannedPos(){
        let pos = [],
            idx = 0
        bbn.fn.each([...this.mask], (c, i) => {
          if ( !this.escapePos.includes(i) && (!this.patterns[c] || this.patterns[c].static || this.escapePos.includes(i - 1)) ){
            if ( this.escapePos.includes(i - 1) ){
              idx--
            }
            pos.push(idx)
          }
          idx++
        });
        return pos
      },
      /** 
       * The list of the banned positions into the mask.
       * The position indexes are created by considering the positions with the escape symbol.
       * 
       * @computed bannedPosRaw
       * @returns {Array}
      */
      bannedPosRaw(){
        let pos = []
        bbn.fn.each([...this.mask], (c, i) => {
          if ( !this.escapePos.includes(i) && (!this.patterns[c] || this.patterns[c].static || this.escapePos.includes(i - 1)) ){
            pos.push(i)
          }
        });
        return pos
      },
      /** 
       * The list of correspondence between positions in the mask (the new position after the escape symbols remove -> the original position).
       * 
       * @computed posLink
       * @returns {Array}
      */
      posLink(){
        let pos = {},
            idx = 0
        bbn.fn.each([...this.mask], (c, i) => {
          //if ( c !== this.escape ){
          if ( !this.escapePos.includes(i) ){
            if ( this.escapePos.includes(i - 1) ){
              idx--
            }
            pos[idx] = i
          }
          idx++
        });
        return pos
      },
      /**
       * The maximum value length based on the mask.
       * 
       * @computed maxLeng
       * @returns {Number}
       */
      maxLen(){
        return [...this.mask].filter((c, i) => {
          return !!(
            !this.escapePos.includes(i - 1) &&
            !this.bannedPosRaw.includes(i) &&
            this.patterns[c] &&
            this.patterns[c].pattern
          )
        }).length
      },
      /**
       * The maximum position.
       *
       * @computed maxPos
       * @returns {Number}
       */
      maxPos(){
        return this.mask.length - this.escapePos.length
      }
    },
    methods: {
      /**
       * Checks if the given character is valid, based on the mask's pattern.
       *
       * @method isValidChar
       * @param {String} char
       * @param {Number} pos
       * @returns {Boolean}
       */
      isValidChar(char, pos){
        let k = this.mask.charAt(this.posLink[pos])
        return !!(this.patterns[k] && this.patterns[k].pattern && char.match(this.patterns[k].pattern))
      },
      /**
       * Checks if the pressed key is a special key.
       * 
       * @method isSpecialKey
       * @param {Number} keyCode
       * @returns {Boolean}
       */
      isSpecialKey(keyCode){
        switch ( keyCode ){
          case 8: //Backspace
          case 9: // Tab
          case 16: //Shift
          case 18: //AltGraph
          case 35: //End
          case 36: //Home
          case 37: //ArrowLeft
          case 39: //ArrowRight
          case 46: //Canc
            return true
          default:
            return false
        }
      },
      /**
       * Cheks if the pressed key is an arraow key.
       *
       * @method isArrowKey
       * @param {Number} keyCode
       * @returns {Boolean}
       */
      isArrowKey(keyCode){
        switch ( keyCode ){
          case 35: //End
          case 36: //Home
          case 37: //ArrowLeft
          case 39: //ArrowRight
            return true
          default:
            return false
        }
      },
      /**
       * Checks if the pressed key is the "shift" key.
       *
       * @method isShiftKey
       * @param {Number} keyCode
       * @returns {Boolean}
       */
      isShiftKey(keyCode){
        return keyCode === 16
      },
      /**
       * Checks if the pressed key is the "control" key.
       *
       * @method isControlKey
       * @param {Number} keyCode
       * @returns {Boolean}
       */
      isControlKey(keyCode){
        return keyCode === 17
      },
      /**
       * Checks if the pressed key is the "backspace" key.
       *
       * @method isBackspaceKey
       * @param {Number} keyCode
       * @returns {Boolean}
       */
      isBackspaceKey(keyCode){
        return keyCode === 8
      },
      /**
       * Checks if the pressed key is the "canc" key.
       *
       * @method isCancKey
       * @param {Number} keyCode
       * @returns {Boolean}
       */
      isCancKey(keyCode){
        return keyCode === 46
      },
      /**
       * Checks if the pressed key is the "tab" key.
       *
       * @method isTabKey
       * @param {Number} keyCode
       * @returns {Boolean}
       */
      isTabKey(keyCode){
        return keyCode === 9
      },
      /**
       * Sets the inputValue data property.
       *
       * @method setInputValue
       * @fires getInputValue
       * @fires $forceUpdate
       */
      setInputValue(){
        this.inputValue = ''
        this.inputValue = this.getInputValue()
        this.$forceUpdate()
      },
      /**
       * Gets the input value.
       *
       * @method getInputValue
       * @returnsm {String}
       */
      getInputValue(){
        let ret = '',
            idxValue = 0
        bbn.fn.each([...this.mask], (c, i) => {
          if ( 
            !this.escapePos.includes(i) &&
            !this.bannedPosRaw.includes(i) &&
            this.patterns[c] &&
            this.patterns[c].pattern 
          ){
            if (
              this.value &&
              this.value.charAt(idxValue) &&
              this.value.charAt(idxValue).match(this.patterns[c].pattern)
            ){
              ret += this.value.charAt(idxValue)
            }
            else if ( this.escapePos.includes(i - 1) ) {
              ret += c
            }
            else {
              ret += this.promptChar
            }
            idxValue++
          }
          else if ( !this.escapePos.includes(i) ){
            ret += this.patterns[c] && this.patterns[c].static ? this.patterns[c].static : c
          }
        });
        return ret
      },
      /** 
       * Gets the correct cursor position.
       * 
       * @method getPos
       * @param {Event} event The key event
       * @param {Number} pos The original position
       * @fires isBackspaceKey
       * @returns {Number}
      */
      getPos(event, pos){
        let originalPos = pos
        if ( (pos < 0) ){
          pos = 0
        }
        else if ( pos > this.maxPos ){
          pos = this.maxPos
        }
        if ( this.isBackspaceKey(event.keyCode) || (event.keyCode === 37) ){
          while ( (pos > 0) && this.bannedPos.includes(event.type === 'keydown' ? pos - 1 : pos) ){
            pos--
          }
        }
        else {
          while ( (pos < this.maxPos) && this.bannedPos.includes(pos) ){
            pos++
          }
        }
        return (pos < 0) || (pos > this.maxPos) ? originalPos : pos
      },
      /**
       * Finds and returns the start position and the end position of the value by two points of the inputValue.
       * 
       * @method getIdxRange
       * @param {Number} start
       * @param {Number} end
       * @returns {String}
       */
      getIdxRange(start, end){
        let val = this.raw(),
            idxStart = -1,
            idxEnd = -1
        Array.from({length: end + 1}, (v, i) => {
          if ( !this.bannedPos.includes(i) ){
            if ( i <= start ){
              idxStart++
            }
            if ( i <= end ){
              idxEnd++
            }
          }
        })
        return {start: idxStart, end: idxEnd}
      },
      /** 
       * The method called on every key pressed (keydown event).
       * 
       * @method keydownEvent
       * @param {Event} event
       * @fires isShiftKey
       * @fires isControlKey
       * @fires isArrowKey
       * @fires isCancKey
       * @fires isBackspaceKey
       * @fires getPos
       * @fires isSpecialKey
       * @fires isValidChar
       * @fires emitInput
       * @fires raw
       * @fires setInputValue
       * @fires keydown
       * @emits input
      */
      keydownEvent(event){
        if ( 
          !this.isShiftKey(event.keyCode) &&
          !this.isControlKey(event.keyCode) &&
          !this.isArrowKey(event.keyCode) &&
          !this.isTabKey(event.keyCode) &&
          !event.ctrlKey
        ){
          // Check max length
          if ( 
            !this.isCancKey(event.keyCode) &&
            !this.isBackspaceKey(event.keyCode) &&
            (
              (this.value.length >= this.maxLen) || 
              ((this.size !== undefined) && (this.value.length >= this.size)) ||
              ((this.maxlength !== undefined) && (this.value.length >= this.maxlength))
            )
          ){
            event.preventDefault()
            return
          }
          // Get the correct cursor position
          let pos = this.getPos(event, this.$refs.element.selectionStart);
          // Not special key and not valid char
          if ( !this.isSpecialKey(event.keyCode) && !this.isValidChar(event.key, pos) ){
            event.preventDefault()
          }
          // Not special key and not equal to prompt char (input)
          else if ( 
            !this.isSpecialKey(event.keyCode) &&
            (this.inputValue.charAt(pos) !== this.promptChar)
          ){
            let val = this.raw(),
                p = this.getIdxRange(pos, pos).start
            val = val.slice(0, p) + event.key + val.slice(p)
            this.emitInput(val)
            this.$nextTick(() => {
              this.setInputValue()
              this.$nextTick(() => {
                this.$refs.element.setSelectionRange(pos + 1, pos + 1)
              })
            })
            event.preventDefault()
          }
          // Canc and Backspace
          else if ( this.isCancKey(event.keyCode) || this.isBackspaceKey(event.keyCode) ){
            event.preventDefault()
            // Selection is a range
            if ( this.$refs.element.selectionStart !== this.$refs.element.selectionEnd ){
              let val = this.raw(),
                  pos = this.$refs.element.selectionStart,
                  p = this.getIdxRange(this.$refs.element.selectionStart, this.$refs.element.selectionEnd)
              this.emitInput(val.slice(0, p.start) + val.slice(p.end))
              this.$nextTick(() => {
                this.setInputValue()
                this.$nextTick(() => {
                  this.$refs.element.setSelectionRange(pos, pos)
                })
              })
            }
            // Normal backspace and canc
            else {
              if ( this.isBackspaceKey(event.keyCode) && (pos > 0) ){
                this.inputValue = this.inputValue.slice(0, pos - 1) + this.promptChar + this.inputValue.slice(pos)
                pos--;
              }
              else if ( this.isCancKey(event.keyCode) && (pos < this.maxPos) ){
                this.inputValue = this.inputValue.slice(0, pos) + this.promptChar + this.inputValue.slice(pos + 1)
              }
              this.$nextTick(() => {
                this.emitInput(this.raw())
                this.$nextTick(() => {
                  this.setInputValue()
                  this.$nextTick(() => {
                    this.$refs.element.setSelectionRange(pos, pos)
                  })
                })
              })
            }
          }
          else if ( event.shiftKey && this.isArrowKey(event.keyCode) ){
            this.$refs.element.selectionStart = pos
          }
          else {
            this.$refs.element.setSelectionRange(pos, pos)
          }
        }
        this.keydown(event)
      },
      /** 
       * The method called on every key pressed (keyup event).
       * 
       * @method keyupEvent
       * @param {Event} event
       * @fires isShiftKey
       * @fires isControlKey
       * @fires getPos
       * @fires isArrowKey
       * @fires keyup
      */
      keyupEvent(event){
        if ( 
          !this.isShiftKey(event.keyCode) &&
          !this.isControlKey(event.keyCode) &&
          !this.isTabKey(event.keyCode) &&
          !event.ctrlKey
        ){
          let pos = this.$refs.element.selectionStart
          this.$nextTick(() => {
            pos = this.getPos(event, pos)
            if ( event.shiftKey && this.isArrowKey(event.keyCode) ){
              this.$refs.element.selectionStart = pos
            }
            else {
              this.$refs.element.setSelectionRange(pos, pos)
            }
          })
        }
        this.keyup(event)
      },
      /**
       * The method called on input event.
       * 
       * @method inputEvent
       * @param {Event} event
       * @fires isValidChar
       * @fires emitInput
       * @fires raw
       * @emits input
       */
      inputEvent(event){
        let pos = this.$refs.element.selectionStart
        if ( 
          (pos <= this.maxPos) &&
          !bbn.fn.isNull(event.data) &&
          this.isValidChar(event.data, pos - 1 ) &&
          (this.inputValue.charAt(pos - 1) === this.promptChar)
        ){
          this.inputValue = this.inputValue.slice(0, pos - 1) + event.data + this.inputValue.slice(pos)
          this.$nextTick(() => {
            this.emitInput(this.raw())
            this.$refs.element.setSelectionRange(pos, pos)
          })
        }
      },
      /**
       * The method called on blur event.
       * 
       * @method blurEvent
       * @param {Event} event
       * @fires blur
       */
      blurEvent(event){
        if ( !this.value ){
          this.inputValue = '';
        }
        this.blur(event)
      },
      /**
       * The method called on focus event.
       *
       * @method focusEvent
       * @param {Event} event
       * @fires setInputValue
       * @fires focus
       */
      focusEvent(event){
        this.setInputValue()
        this.focus(event)
      },
      /**
       * Gets the raw value.
       *
       * @method raw
       * @returns {String}
       */
      raw(){
        let ret = '',
            value = this.$refs.element.value
        if ( value ){
          bbn.fn.each([...value], (c, i) => {
            if ( 
              !this.bannedPos.includes(i) &&
              this.patterns[this.mask[this.posLink[i]]] &&
              this.patterns[this.mask[this.posLink[i]]].pattern
            ){
              if ( c.match(this.patterns[this.mask[this.posLink[i]]].pattern) ){
                ret += c
              }
            }
          });
        }
        return ret
      }
    },
    /**
     * @event mounted
     * @fires setInputValue
     */
    mounted(){
      if ( this.value ){
        this.setInputValue()
      }
      this.ready = true
    }
  });

})(jQuery, bbn);
