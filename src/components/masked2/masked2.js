/**
 * @file bbn-masked component
 *
 * @description bbn-masked is a useful component for those who want full control of data that needs to be processed.
 * It represents an input that allows the user to insert the desired values  in a defined format.For example: the insertion of telephone number.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
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
      maxLen(){
        return [...this.mask].filter((c) => {
          return this.patterns[c] && this.patterns[c].pattern;
        }).length;
      },
      bannedPos(){
        let pos = [];
        bbn.fn.each([...this.mask], (c, i) => {
          if ( !this.patterns[c] ){
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
          else {
            ret += c;
          }
        });
        return ret;
      },
      getPos(event, pos){
        bbn.fn.log('aaaaaaaa', pos);
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
        bbn.fn.log('bbbbbbbb', (pos < 0) || (pos > this.maxPos) ? originalPos : pos);
        return (pos < 0) || (pos > this.maxPos) ? originalPos : pos;
      },
      keydown(event){
        bbn.fn.log('keydown', event);
        if ( event.keyCode === 16 ){
          return;
        }
        if ( 
          (event.keyCode !== 8) &&
          (event.keyCode !== 35) &&
          (event.keyCode !== 36) &&
          (event.keyCode !== 37) &&
          (event.keyCode !== 39) &&
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
        if ( 
          event.shiftKey &&
          (
            (event.keyCode === 35) ||
            (event.keyCode === 36) ||
            (event.keyCode === 37) ||
            (event.keyCode === 39)
          )
        ){
          this.$refs.element.selectionStart = pos;
        }
        else {
          if ( this.isValidKey(event.keyCode) && !this.isValidChar(event.key, pos) ){
            event.preventDefault();
            return;
          }
          this.$refs.element.setSelectionRange(pos, pos);
        }
      },
      keyup(event){
        bbn.fn.log('keyup', event);
        let pos = this.$refs.element.selectionStart,
            val = this.raw(),
            oldVal = this.value;
        
        if ( event.keyCode === 16 ){
          return;
        }
        this.emitInput(val);
        this.$nextTick(() => {
          this.setInputvalue();
          this.$nextTick(() => {
            pos = this.getPos(event, pos);
            if ( 
              event.shiftKey &&
              (
                (event.keyCode === 35) ||
                (event.keyCode === 36) ||
                (event.keyCode === 37) ||
                (event.keyCode === 39)
              )
            ){
              this.$refs.element.selectionStart = pos;
            }
            else {
              this.$refs.element.setSelectionRange(pos, pos);
            }
          });
        });
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
      },
      isValidChar(char, pos){
        let k = this.mask.charAt(pos);
        return this.patterns[k] && this.patterns[k].pattern && char.match(this.patterns[k].pattern);
      },
      isValidKey(keyCode){
        switch ( keyCode ){
          case 46: //Canc
          case 39: //ArrowRight
          case 37: //ArrowLeft
          case 36: //Home
          case 35: //End
          case 16: //Shift
          case 8: //Backspace
            return false;
          default:
            return true;
        }
      }
    },
    mounted(){
      this.setInputvalue();
      this.ready = true;
    }
  });

})(jQuery, bbn);
