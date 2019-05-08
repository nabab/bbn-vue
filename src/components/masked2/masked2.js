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
  "use strict";

  Vue.component('bbn-masked2', {
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      mask: {
        type: String,
        required: true,
        validator: val => !!val.length
      },
      promptChar: {
        type: String,
        default: '_'
      },
      escape: {
        type: String,
        default: '\\'
      }
    },
    data(){
      return {
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
        inputValue: '',
        lastPosition: 0
      }
    },
    computed: {
      reg(){
        let r = '';
        bbn.fn.each([...this.mask], (c, i) => {
          if ( 
            this.patterns[c] &&
            this.patterns[c].pattern 
          ){

          }
        });
        return r;
      },
      maxLen(){
        return [...this.mask].filter((c) => {
          return this.patterns[c] && this.patterns[c].pattern;
        }).length;
      },
      bannedPos(){
        let pos = [];
        bbn.fn.each([...this.mask], (c, i) => {
          if ( 
            !this.patterns[c] ||
            (c === this.escape) ||
            (this.patterns[c] && (this.mask[i - 1]) === this.escape)
          ){
            pos.push(i);
          }
        });
        return pos;
      },
      maxPos(){
        return this.mask.length;
      }
    },
    methods: {
      isValidChar(char, pos){
        let k = this.mask.charAt(pos);
        return this.patterns[k] && this.patterns[k].pattern && char.match(this.patterns[k].pattern);
      },
      isSpecialKey(keyCode){
        switch ( keyCode ){
          case 8: //Backspace
          case 16: //Shift
          case 35: //End
          case 36: //Home
          case 37: //ArrowLeft
          case 39: //ArrowRight
          case 46: //Canc
            return false;
          default:
            return true;
        }
      },
      isArrowKey(keyCode){
        switch ( keyCode ){
          case 35: //End
          case 36: //Home
          case 37: //ArrowLeft
          case 39: //ArrowRight
            return true;
          default:
            return false;
        }
      },
      isShiftKey(keyCode){
        return keyCode === 16;
      },
      isControlKey(keyCode){
        return keyCode === 17;
      },
      setInputvalue(){
        this.inputValue = '';
        this.inputValue = this.getInputValue();
        this.$forceUpdate();
      },
      getInputValue(){
        let ret = '',
            idxValue = 0;
        bbn.fn.each([...this.mask], (c, i) => {
          if ( this.patterns[c] && this.patterns[c].pattern ){
            if ( (this.mask[i-1] === this.escape) ){
              ret += c;
              return;
            }
            if (
              this.value &&
              this.value.charAt(idxValue) &&
              this.value.charAt(idxValue).match(this.patterns[c].pattern)
            ){
              ret += this.value.charAt(idxValue);
            }
            else {
              ret += this.promptChar;
            }
            idxValue++;
          }
          else if ( c !== this.escape ){
            ret += c;
          }
        });
        return ret;
      },
      getPos(event, pos){
        let originalPos = pos;
        if ( (pos < 0) ){
          pos = 0;
        }
        else if ( pos > this.maxPos ){
          pos = this.maxPos;
        }
        if ( (event.keyCode === 8) || (event.keyCode === 37) ){
          while ( (pos > 0) && this.bannedPos.includes(event.type === 'keydown' ? pos - 1 : pos) ){
            pos--;
          }
        }
        else {
          while ( (pos < this.maxPos) && this.bannedPos.includes(pos) ){
            pos++;
          }
        }
        return (pos < 0) || (pos > this.maxPos) ? originalPos : pos;
      },
      keydown(event){
        bbn.fn.log('keydown', event);
        if ( !this.isShiftKey(event.keyCode) && !this.isControlKey(event.keyCode) ){
          if ( 
            (event.keyCode !== 8) &&
            (event.keyCode !== 46) &&
            !this.isArrowKey(event.keyCode) &&
            (
              (this.value.length >= this.maxLen) || 
              ((this.size !== undefined) && (this.value.length >= this.size)) ||
              ((this.maxlength !== undefined) && (this.value.length >= this.maxlength))
            )
          ){
            event.preventDefault();
            return;
          }
          let pos = this.getPos(event, this.$refs.element.selectionStart);
          if ( event.shiftKey && this.isArrowKey(event.keyCode) ){
            this.$refs.element.selectionStart = pos;
            return;
          }
          if ( this.isSpecialKey(event.keyCode) && !this.isValidChar(event.key, pos) ){
            event.preventDefault();
            return;
          }
          this.$refs.element.setSelectionRange(pos, pos);
        }
      },
      keyup(event){
        bbn.fn.log('keyup', event);
        if ( !this.isShiftKey(event.keyCode) && !this.isControlKey(event.keyCode) ){
          let pos = this.$refs.element.selectionStart;
          this.emitInput(this.raw());
          this.$nextTick(() => {
            this.setInputvalue();
            this.$nextTick(() => {
              pos = this.getPos(event, pos);
              if ( event.shiftKey && this.isArrowKey(event.keyCode) ){
                this.$refs.element.selectionStart = pos;
              }
              else {
                this.$refs.element.setSelectionRange(pos, pos);
              }
            });
          });
        }
      },
      input(event){
        bbn.fn.log('input', event)
        let pos = this.$refs.element.selectionStart - 1;
        if ( 
          !bbn.fn.isNull(event.data) && 
          this.isValidChar(event.data, pos) && 
          (this.inputValue.charAt(pos) === this.promptChar) 
        ){
          event.preventDefault();
          this.inputValue = this.inputValue.slice(0, pos) + event.data + this.inputValue.slice(pos + 1);
          this.$nextTick(() => {
            this.$refs.element.setSelectionRange(pos + 1, pos + 1);

          })
        }
        /* else if ( bbn.fn.isNull(event.data) ){
          this.inputValue = this.inputValue.slice(0, pos) + this.promptChar + this.inputValue.slice(pos + 1);
          this.$nextTick(() => {
            this.$refs.element.setSelectionRange(pos + 1, pos + 1);

          })
        } */
      },
      raw(){
        let ret = '',
            idxValue = 0,
            value = this.$refs.element.value;
        if ( value ){
          bbn.fn.each([...this.mask], (c, i) => {
            let char = value.charAt(idxValue);
            if ( this.patterns[c] && this.patterns[c].pattern ){
              if ( char && char.match(this.patterns[c].pattern) ){
                ret += char;
              }
            }
            idxValue++;
          });
        }
        return ret;
      }
    },
    mounted(){
      this.setInputvalue();
      this.ready = true;
    }
  });

})(jQuery, bbn);
