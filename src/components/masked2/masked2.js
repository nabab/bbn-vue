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
        required: true
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
        inputValue: ''
      }
    },
    computed: {
      maxLength(){
        let l = 0;
        bbn.fn.each([...this.mask], (c, i) => {
          if ( this.patterns[c] && this.patterns[c].pattern ){
            l++;
          }
        });
        return l;
      },
      bannedPos(){
        let pos = [];
        bbn.fn.each([...this.mask], (c, i) => {
          if ( !this.patterns[c] ){
            pos.push(i);
          }
        });
        return pos;
      }
    },
    methods: {
      setInputvalue(){
        this.inputValue = this.getInputValue();
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
      keydown(event){
        bbn.fn.log('aaa', event);
        let pos = this.$refs.element.selectionEnd;
        if ( (event.keyCode === 8) || (event.keyCode === 37) ){
            pos--;
        }
        else {
          pos++;
        }
        if ( !this.patterns[this.mask.charAt(pos)] ){
          this.$refs.element.selectionEnd = pos;
        }
      },
      keyup(event){
        let pos = this.$refs.element.selectionEnd,
            val = this.raw(),
            len = val.length;
        this.emitInput(val);
        this.$nextTick(() => {
          this.setInputvalue();
          this.$nextTick(() => {
            if ( !this.patterns[this.mask.charAt(pos)] ){
              if ( (event.keyCode === 8) || (event.keyCode === 37) ){
                 pos--;
              }
              else {
                pos++;
              }
            }
            this.$refs.element.selectionEnd = pos;
          })
        })
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
