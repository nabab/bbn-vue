/**
 * Based on https://github.com/judesfernando/initial.js
 */

 /**
  * @file bbn-initial component
  *
  * @description bbn-initial is a component of simple implantation that allows stylistically to represent  the initials of a name as an avatars for a profile.
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 28/03/2017
  */

(function($, bbn){
  "use strict";

  let colors = ["#1abc9c", "#16a085", "#f1c40f", "#f39c12", "#2ecc71", "#27ae60", "#e67e22", "#d35400", "#3498db", "#2980b9", "#e74c3c", "#c0392b", "#9b59b6", "#8e44ad", "#bdc3c7", "#34495e", "#2c3e50", "#95a5a6", "#7f8c8d", "#ec87bf", "#d870ad", "#f69785", "#9ba37e", "#b49255", "#b49255", "#a94136"];

  /**
   * Initals
   */
  Vue.component('bbn-initial', {
    mixins: [bbn.vue.basicComponent],
    props: {
      userId: {
        type: [String, Number]
      },
      userName: {
        type: String,
      },
      email: {
        type: String,
      },
      width: {
        type: [String, Number]
      },
      height: {
        type: [String, Number]
      },
      defaultSize: {
        type: Number,
        default: 36
      },
      charCount: {
        type: Number,
        default: 2
      },
      textColor: {
        type: [String],
        default: '#FFF'
      },
      fontFamily:{
        type: String
      },
      color: {
        type: String
      },
      fontSize: {
        type: [Number, String]
      },
      fontWeight: {
        type: [Number, String],
        default: 400
      },
      letters: {
        type: String
      },
      radius: {
        type: Number,
        default: 3
      },
      source: {
        type: Array,
        default(){
          return window.appui && appui.app && appui.app.users ? appui.app.users : []
        }
      },
      nameField: {
        type: String,
        default(){
          return window.appui && appui.app && appui.app.users ? 'text' : 'name'
        }
      },
      idField: {
        type: String,
        default(){
          return window.appui && appui.app && appui.app.users ? 'value' : 'id'
        }
      },
      url: {
        type: String
      }
    },
    data(){
      return {
        name: this.userName
      }
    },
    computed: {
      fontStyle(){
        let o = {
          color: this.textColor,
          'font-weight': this.fontWeight,
          'font-size': this.currentFontSize
        };
        if ( this.fontFamily ){
          o['font-family'] = this.fontFamily;
        }
        return o;
      },
      currentLetters(){
        let currentLetters = '',
            name = this.userName;
        if ( this.letters ){
          currentLetters = this.letters;
        }
        if ( !name && this.userId && this.source ){
          name = bbn.fn.get_field(this.source, this.idField, this.userId, this.nameField);
        }
        if ( !this.letters && name ){
          let tmp = bbn.fn.removeEmpty(name.split(" "));
          while ( (tmp.length > this.charCount) && (tmp[0].length <= 3) ){
            tmp.shift();
          }
          for ( let i = 0; i < tmp.length; i++ ){
            if ( !this.charCount || (currentLetters.length <= this.charCount) ){
              currentLetters += tmp[i].substr(0, 1);
            }
          }
        }
        return this.charCount && !this.letters ? currentLetters.substr(0, this.charCount) : currentLetters;
      },
      currentColor(){
        let name = this.userName,
            col = this.color;
        if ( !col ){
          let sum = 0;
          this.currentLetters.split('').forEach((a) => {
            sum += a.charCodeAt();
          });
          sum += name ?
            this.userName.substr(-1).charCodeAt() :
            this.currentLetters.substr(0, 1).charCodeAt();
          let colorIndex = Math.floor(sum % colors.length);
          col = colors[colorIndex]
        }
        return col ? col : '#000'
      },
      currentFontSize(){
        let currentFontSize = this.fontSize;
        if ( !this.fontSize ){
          let baseSize = parseInt(this.height) / this.charCount;
          currentFontSize = Math.round(baseSize + bbn.fn.percent(15*this.charCount, baseSize));
        }
        return bbn.fn.isNumber(currentFontSize) ? currentFontSize + 'px' : currentFontSize;
      },
      currentWidth(){
        let w = this.width || this.height || this.defaultSize;
        return bbn.fn.isNumber(w) ? w + 'px' : w;
      },
      currentHeight(){
        let h = this.height || this.width || this.defaultSize;
        return bbn.fn.isNumber(h) ? h + 'px' : h;
      },
      currentRadius(){
        return bbn.fn.isNumber(this.radius) ? this.radius + 'px' : this.radius;
      }
    },
    methods:{
    },
    watch: {
      userId(va, oldVa){
        bbn.fn.log("CHANGE OF USER", va, oldVa)
      }
    }
  });

})(jQuery, bbn);
