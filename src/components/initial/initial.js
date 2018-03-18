/**
 * Created by BBN on 28/03/2017.
 * Based on https://github.com/judesfernando/initial.js
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
          return appui && appui.app && appui.app.users ? appui.app.users : []
        }
      },
      nameField: {
        type: String,
        default(){
          return appui && appui.app && appui.app.users ? 'text' : 'name'
        }
      },
      idField: {
        type: String,
        default(){
          return appui && appui.app && appui.app.users ? 'value' : 'id'
        }
      },
      url: {
        type: String
      }
    },
    data(){
      let currentLetters = '',
          name = this.userName;
      if ( this.letters ){
        currentLetters = this.letters;
      }
      if ( !name && this.userId && this.source ){
        name = bbn.fn.get_field(this.source, this.idField, this.userId, this.nameField);
      }
      if ( !this.letters && name ){
        let tmp = bbn.fn.removeEmpty(name.split(" "))
        while ( (tmp.length > this.charCount) && (tmp[0].length <= 3) ){
          tmp.shift();
        }
        for ( let i = 0; i < tmp.length; i++ ){
          if ( !this.charCount || (currentLetters.length <= this.charCount) ){
            currentLetters += tmp[i].substr(0, 1);
          }
        }
      }
      let col = this.color;
      if ( !col ){
        let sum = 0;
        currentLetters.split('').forEach((a) => {
          sum += a.charCodeAt();
        });
        sum += name ?
          name.substr(-1).charCodeAt() :
          this.currentLetters.substr(0, 1).charCodeAt();
        let colorIndex = Math.floor(sum % colors.length);
        col = colors[colorIndex]
      }
      let currentFontSize = this.fontSize;
      if ( !this.fontSize ){
        let baseSize = parseInt(this.height) / this.charCount;
        currentFontSize = Math.round(baseSize + bbn.fn.percent(15*this.charCount, baseSize));
      }
      let currentWidth = this.width;
      let currentHeight = this.height;
      if ( currentWidth && !currentHeight ){
        currentHeight = currentWidth;
      }
      if ( !currentWidth && currentHeight ){
        currentWidth = currentHeight;
      }
      if ( !currentWidth ){
        currentHeight = 36;
        currentWidth = 36;
      }
      return {
        currentColor: col,
        currentFontSize: bbn.fn.isNumber(currentFontSize) ? currentFontSize + 'px' : currentFontSize,
        currentLetters: currentLetters ? currentLetters.toUpperCase() : '??',
        currentWidth: bbn.fn.isNumber(currentWidth) ? currentWidth + 'px' : currentWidth,
        currentHeight: bbn.fn.isNumber(currentHeight) ? currentHeight + 'px' : currentHeight,
        currentRadius: bbn.fn.isNumber(this.radius) ? this.radius + 'px' : this.radius,
        name: name
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
      }
    }
  });

})(jQuery, bbn);
