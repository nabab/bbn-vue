/**
 * @file bbn-masked component
 * @description bbn-masked is a component that allows the full control of data to be processed.
 * It represents an input box that allows the user to insert values in a given format.
 * @copyright BBN Solutions
 * @author Mirko Argentino
 */

return {
	/**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.events
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.input, 
      bbn.wc.mixins.events
    ],
    props: {
      /** 
       * The required mask pattern.
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
      },
      /**
         * Defines the pattern of this elemenet
         * @prop {String} pattern
         */
       pattern: {
        type: String
      }
    },
    data(){
      return {
        /** 
         * The escape symbol.
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
            pattern: '[0-9\\s]'
          },
          // Digit or space. Like 9 rule, but allows also (+) and (-) signs.
          '#': {
            pattern: '[0-9\\s\\+\\-]'
          },
          // Letter. Restricts the input to letters a-z and A-Z. This rule is equivalent to [a-zA-Z] in regular expressions.
          'L': {
            pattern: '[a-zA-Z]'
          },
          // Letter or space. Restricts the input to letters a-z and A-Z. This rule is equivalent to [a-zA-Z] in regular expressions.
          '?': {
            pattern: '[a-zA-Z\\s]'
          },
          // Character. Accepts any character. The rule is equivalent to \S in regular expressions.
          // in this case, promptChar can't be special character. eg: It can't be "_"
          '&': {
            pattern: '[0-9a-zA-Z\\S]'
          },
          // Character or space. Accepts any character. The rule is equivalent to . in regular expressions.
          // in this case, promptChar can't be special character. eg: It can't be "_"
          'C': {
            pattern: '.'
          },
          // Alphanumeric. Accepts letters and digits only.
          'A': {
            pattern: '[0-9a-zA-Z]'
          },
          // Alphanumeric or space. Accepts letters, digits and spaces only.
          'a': {
            pattern: '[0-9a-zA-Z\\s]'
          },
          // Decimal placeholder. The decimal separator will be generated from the bbn.env.money property.
          '.': {
            static: bbn.env && bbn.env.money && bbn.env.money.decimal ? bbn.env.money.decimal : '.'
          },
          // Thousands placeholder. The display character will be generated from the bbn.env.money property.
          ',': {
            static: bbn.env && bbn.env.money && bbn.env.money.thousands ? bbn.env.money.thousands : ','
          },
          // Currency symbol. The display character will be generated from the bbn.env.money property.
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
       * The list of escape positions in the mask.
       * 
       * @computed escapePos
       * @returns {Array}
      */
      escapePos(){
        if (!this.mask) {
          return [];
        }
        let exp = Object.keys(this.patterns).map(p => {
              return this.escape.repeat(p === '?' ? 4 : 2) + p
            }).join('|'),
            reg = new RegExp(exp, 'gu'),
            res = [],
            match;
        while (match = reg.exec(this.mask)) {
          res.push(match.index);
        }
        return res;
      },
      /** 
       * The list of banned positions in the mask.
       * The position indexes are created without considering the positions with the escape symbol.
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
       * The list of banned positions in the mask.
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
       * A list of relations between positions in the mask.
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
       * The maximum value length calculated from the mask.
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
      },
      /**
         * The current input width in characters if the 'autosize' is enabled
         * @computed currentInputSize
         * @returns {Number}
         */
      currentInputSize(){
        if ( this.autosize ){
          let val = this.getInputValue()
          return val.length || 1
        }
        return 0
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
        return !!(this.patterns[k] && this.patterns[k].pattern && char.match(this.patterns[k].pattern) && (char !== this.promptChar))
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
          case 9: //Tab
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
       * Cheks if the pressed key is an arrow key.
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
       * Checks if the pressed key is the "enter" key.
       *
       * @method isEnterKey
       * @param {Number} keyCode
       * @returns {Boolean}
       */
      isEnterKey(keyCode){
        return keyCode === 13
      },
      /**
       * Sets the data property 'inputValue'.
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
       * @param {String} value
       * @returns {String}
       */
      getInputValue(value){
        let ret = '',
            idxValue = 0
        value = (value === undefined ? (!!this.value ? this.value : '') : value).toString()
        bbn.fn.each([...this.mask], (c, i) => {
          if ( 
            !this.escapePos.includes(i) &&
            !this.bannedPosRaw.includes(i) &&
            this.patterns[c] &&
            this.patterns[c].pattern 
          ){
            if (
              value &&
              value.charAt(idxValue) &&
              value.charAt(idxValue).match(this.patterns[c].pattern)
            ){
              ret += value.charAt(idxValue)
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
       * @param {Number} pos The original position
       * @param {Event} event The key event
       * @fires isBackspaceKey
       * @returns {Number}
      */
      getPos(pos, event){
        let originalPos = pos
        if ( (pos < 0) ){
          pos = 0
        }
        else if ( pos > this.maxPos ){
          pos = this.maxPos
        }
        if ( event && (this.isBackspaceKey(event.keyCode) || (event.keyCode === 37)) ){
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
       * Finds and returns the start and the end position of the value by two points of the inputValue.
       * 
       * @method getIdxRange
       * @param {Number} start
       * @param {Number} end
       * @returns {String}
       */
      getIdxRange(start, end){
        let val = !!this.value ? this.value.toString() : '',
            idxStart = -1,
            idxEnd = -1
        for ( let i = 0; i <= end; i++ ){
          if ( !this.bannedPos.includes(i) ){
            if ( i <= start ){
              idxStart++
            }
            if ( i <= end ){
              idxEnd++
            }
          }
        }
        return {
          start: idxStart < 0 ? 0 : idxStart,
          end: idxEnd
        }
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
       * @fires getIdxRange
       * @emits input
      */
      keydownEvent(event){
        if ( !this.isDisabled && !this.readonly ){
          if (
            !this.isShiftKey(event.keyCode) &&
            !this.isControlKey(event.keyCode) &&
            !this.isArrowKey(event.keyCode) &&
            !this.isTabKey(event.keyCode) &&
            !event.ctrlKey &&
            !this.isEnterKey(event.keyCode)
          ){
            let isSelection = this.$refs.element.selectionStart !== this.$refs.element.selectionEnd,
                value = this.value ? this.value.toString() : ''
            // Check max length
            if (
              !this.isCancKey(event.keyCode) &&
              !this.isBackspaceKey(event.keyCode) &&
              !isSelection &&
              (
                (bbn.fn.isNumber(this.maxLen) && (value.length >= parseInt(this.maxLen))) ||
                ((this.size !== undefined) && bbn.fn.isNumber(this.size) && (value.length >= this.size)) ||
                ((this.maxlength !== undefined) && bbn.fn.isNumber(this.maxlength) && (value.length >= parseInt(this.maxlength)))
              )
            ){
              event.preventDefault()
              return
            }
            // Get the correct cursor position
            let pos = this.getPos(this.$refs.element.selectionStart, event);
            // Not special key and not valid char
            if ( !this.isSpecialKey(event.keyCode) && !this.isValidChar(event.key, pos) ){
              event.preventDefault()
            }
            // Input
            else if (
              !this.isSpecialKey(event.keyCode) &&
              ((this.inputValue.charAt(pos) !== this.promptChar) || isSelection)
            ){
              let p = this.getIdxRange(
                    isSelection ? this.$refs.element.selectionStart : pos,
                    isSelection ? this.$refs.element.selectionEnd - 1 : pos
                  )
              p.end = isSelection ? p.end + 1 : p.start
              value = value.slice(0, p.start) + event.key + value.slice(p.end)
              this.emitInput(value)
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
              // Delete from a selection
              if ( isSelection ){
                let pos = this.$refs.element.selectionStart,
                    p = this.getIdxRange(this.$refs.element.selectionStart, this.$refs.element.selectionEnd - 1)
                this.emitInput(value.slice(0, p.start) + value.slice(p.end + 1))
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
                  pos--
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
        }
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
        if ( !this.isDisabled && !this.readonly ){
          if (
            !this.isShiftKey(event.keyCode) &&
            !this.isControlKey(event.keyCode) &&
            !this.isTabKey(event.keyCode) &&
            !event.ctrlKey
          ){
            let pos = this.$refs.element.selectionStart
            this.$nextTick(() => {
              pos = this.getPos(pos, event)
              if ( event.shiftKey && this.isArrowKey(event.keyCode) ){
                this.$refs.element.selectionStart = pos
              }
              else {
                this.$refs.element.setSelectionRange(pos, pos)
              }
            })
          }
          this.keyup(event)
        }
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
        let pos = this.$refs.element.selectionStart;
        //bbn.fn.log('input', event, pos, this.maxPos)
        if ( 
          (pos <= this.maxPos) &&
          !bbn.fn.isNull(event.data) &&
          this.isValidChar(event.data, pos - 1 ) &&
          (this.inputValue.charAt(pos - 1) === this.promptChar) &&
          (pos === this.$refs.element.selectionEnd)
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
        if ( !this.isDisabled && !this.readonly ){
          if ( !this.value ){
            this.inputValue = '';
          }
          this.blur(event)
        }
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
        if ( !this.isDisabled && !this.readonly ){
          this.setInputValue()
          this.$nextTick(() => {
            this.$refs.element.setSelectionRange(0, 0)
          })
          this.focus(event)
        }
      },
      /** 
       * The method called on paste event.
       * 
       * @method pasteEvent
       * @param {Event} event
       * @fires getPos
       * @fires getIdxRange
       * @fires clearText
       * @fires emitInput
      */
      pasteEvent(event){
        if ( !this.isDisabled && !this.readonly ){
          let text = event.clipboardData ? event.clipboardData.getData('text') : '',
              pos = this.getPos(this.$refs.element.selectionStart),
              p = this.getIdxRange(0, pos),
              val = this.value.toString()
          event.preventDefault()
          text = this.clearText(text, pos)
          val = val.slice(p.start, p.end) + text + val.slice(p.end)
          pos = p.end + text.length + 1
          this.emitInput(val.slice(0, this.maxLen))
          this.$nextTick(() => {
            this.$refs.element.setSelectionRange(pos, pos)
          })
        }
      },
      /**
       * The method called on cut event.
       * 
       * @method cutEvent
       * @param {Event} event 
       * @fires getPos
       * @fires getIdxRange
       * @fires clearText
       * @fires emitInput
       */
      cutEvent(event){
        if ( !this.isDisabled && !this.readonly ){
          let sel = document.getSelection(),
              text = sel.toString(),
              oriPos = this.$refs.element.selectionStart,
              pos = this.getPos(oriPos),
              p = this.getIdxRange(0, pos),
              val = this.value.toString()
          event.preventDefault()
          document.execCommand('copy')
          text = this.clearText(text, pos)
          val = val.slice(p.start, p.end) + val.slice(p.end + text.length)
          this.emitInput(val.slice(0, this.maxLen))
          this.$nextTick(() => {
            this.$refs.element.setSelectionRange(oriPos, oriPos)
          })
        }
      },
      /**
       * Removes the invalid characters from a string.
       * 
       * @method clearText
       * @param {String} text
       * @param {Number} pos
       * @fires isValidChar
       * @fires getPos
       * @returns {String}
       */
      clearText(text, pos){
        let ret = ''
        if ( text ){
          bbn.fn.each([...text], (c, i) => {
            if ( this.isValidChar(c, pos) ){
              ret += c
              pos = this.getPos(pos)
            }
          })
        }
        return ret
      },
      /**
       * Gets the raw value.
       *
       * @method raw
       * @returns {String}
       */
      raw(value){
        let ret = ''
        value = (value !== undefined ? value : (this.$refs.element.value || '')).toString()
        if ( value ){
          bbn.fn.each([...value], (c, i) => {
            if ( 
              !this.bannedPos.includes(i) &&
              this.patterns[this.mask[this.posLink[i]]] &&
              this.patterns[this.mask[this.posLink[i]]].pattern
            ){
              if ( c.match(this.patterns[this.mask[this.posLink[i]]].pattern) && (c !== this.promptChar)){
                ret += c
              }
            }
          })
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
    },
    watch: {
      value(newVal, oldVal){
        if ( newVal !== oldVal ){
          this.setInputValue()
        }
      },
      mask(){
        this.$nextTick(() => {
          let pos = this.value.length;
          this.getRef('element').setSelectionRange(pos, pos);
        });
      }
    }
  };
