/**
 * @file bbn-masked component
 *
 * @description bbn-masked is a useful component for those who want full control of data that needs to be processed.
 * It represents an input that allows the user to insert the desired values  in a defined format.For example: the insertion of telephone number.
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 *
 * @created 10/02/2017
 */

(function($, bbn){
  "use strict"

  Vue.component('bbn-masked2', {
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      /** 
       * The mask pattern.
       * 
       * @prop {String} mask
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
        escape: '\\',
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
          // Decimal placeholder. The decimal separator will be gotten from the current culture.
          '.': {

          },
          // Thousands placeholder. The display character will be gotten from the current culture.
          ',': {

          },
          // Currency symbol. The display character will be gotten from the current culture.
          '$': {

          }
        },
        inputValue: ''
      }
    },
    computed: {
      escapePos(){
        let exp = Object.keys(this.patterns).map(p => {
              return this.escape.repeat(p === '?' ? 4 : 2) + p
            }).join('|'),
            reg = new RegExp(exp, 'g')
        return [...this.mask.matchAll(reg)].map(e => e.index)
      },
      bannedPos(){
        let pos = [],
            idx = 0
        bbn.fn.each([...this.mask], (c, i) => {
          //if ( (c !== this.escape) && (!this.patterns[c] || this.escapePos.includes(i - 1)) ){
          if ( !this.escapePos.includes(i) && (!this.patterns[c] || this.escapePos.includes(i - 1)) ){
            if ( this.escapePos.includes(i - 1) ){
              idx--
            }
            pos.push(idx)
          }
          idx++
        });
        return pos
      },
      bannedPosRaw(){
        let pos = []
        bbn.fn.each([...this.mask], (c, i) => {
          //if ( (c !== this.escape) && (!this.patterns[c] || this.escapePos.includes(i - 1)) ){
          if ( !this.escapePos.includes(i) && (!this.patterns[c] || this.escapePos.includes(i - 1)) ){
            pos.push(i)
          }
        });
        return pos
      },
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
       * Checks if the pressed key is not a special key.
       * 
       * @method isNotSpecialKey
       * @param {Number} keyCode
       * @returns {Boolean}
       */
      isNotSpecialKey(keyCode){
        switch ( keyCode ){
          case 8: //Backspace
          case 16: //Shift
          case 35: //End
          case 36: //Home
          case 37: //ArrowLeft
          case 39: //ArrowRight
          case 46: //Canc
            return false
          default:
            return true
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
      isShiftKey(keyCode){
        return keyCode === 16
      },
      isControlKey(keyCode){
        return keyCode === 17
      },
      isBackspaceKey(keyCode){
        return keyCode === 8
      },
      isCancKey(keyCode){
        return keyCode === 46
      },
      setInputvalue(){
        this.inputValue = ''
        this.inputValue = this.getInputValue()
        this.$forceUpdate()
      },
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
            ret += c
          }
        });
        return ret
      },
      getPos(event, pos){
        let originalPos = pos
        if ( (pos < 0) ){
          pos = 0
        }
        else if ( pos > this.maxPos ){
          pos = this.maxPos
        }
        if ( (event.keyCode === 8) || (event.keyCode === 37) ){
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
      keydown(event){
        bbn.fn.log('keydown', event)
        if ( !this.isShiftKey(event.keyCode) && !this.isControlKey(event.keyCode) && !this.isArrowKey(event.keyCode) ){
          // Check max length
          if ( 
            !this.isCancKey(event.keyCode) &&
            !this.isBackspaceKey(event.keyCode) &&
            !this.isArrowKey(event.keyCode) &&
            (
              (this.value.length >= this.maxLen) || 
              ((this.size !== undefined) && (this.value.length >= this.size)) ||
              ((this.maxlength !== undefined) && (this.value.length >= this.maxlength))
            )
          ){
            event.preventDefault()
            return
          }
          let pos = this.getPos(event, this.$refs.element.selectionStart);
          // Cance and Backspace
          if ( this.isCancKey(event.keyCode) || this.isBackspaceKey(event.keyCode) ){
            event.preventDefault()
            if ( this.isBackspaceKey(event.keyCode) && (pos > 0) ){
              this.inputValue = this.inputValue.slice(0, pos - 1) + this.promptChar + this.inputValue.slice(pos)
              this.$nextTick(() => {
                this.$refs.element.setSelectionRange(pos - 1, pos - 1)
              })
              return
            }
            else if ( this.isCancKey(event.keyCode) && (pos < this.maxPos) ){
              this.inputValue = this.inputValue.slice(0, pos) + this.promptChar + this.inputValue.slice(pos + 1)
              this.$nextTick(() => {
                this.$refs.element.setSelectionRange(pos, pos)
              })
              return
            }
          }
          if ( event.shiftKey && this.isArrowKey(event.keyCode) ){
            this.$refs.element.selectionStart = pos
            return
          }
          if ( this.isNotSpecialKey(event.keyCode) && !this.isValidChar(event.key, pos) ){
            event.preventDefault()
            return
          }
          this.$refs.element.setSelectionRange(pos, pos)
        }
      },
      keyup(event){
        bbn.fn.log('keyup', event);
        if ( !this.isShiftKey(event.keyCode) && !this.isControlKey(event.keyCode) ){
          let pos = this.$refs.element.selectionStart
          this.emitInput(this.raw())
          this.$nextTick(() => {
            //this.setInputvalue()
            this.$nextTick(() => {
              pos = this.getPos(event, pos)
              if ( event.shiftKey && this.isArrowKey(event.keyCode) ){
                this.$refs.element.selectionStart = pos
              }
              else {
                this.$refs.element.setSelectionRange(pos, pos)
              }
            })
          })
        }
      },
      input(event){
        let pos = this.$refs.element.selectionStart
        bbn.fn.log('input', event)
        if ( (pos <= this.maxPos) && !bbn.fn.isNull(event.data) && this.isValidChar(event.data, pos - 1 ) ){
          event.preventDefault()
          this.inputValue = this.inputValue.slice(0, pos - 1) + event.data + this.inputValue.slice(pos)
          this.$nextTick(() => {
            this.$refs.element.setSelectionRange(pos, pos)
          })
        }
      },
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
    mounted(){
      this.setInputvalue()
      this.ready = true
    }
  });

})(jQuery, bbn);
