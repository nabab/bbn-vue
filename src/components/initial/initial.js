/**
 * Based on https://github.com/judesfernando/initial.js
 */

 /**
  * @file bbn-initial component
  *
  * @description bbn-initial is a component that represents the initials of a name as an avatar for a profile.
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 28/03/2017
  */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     */
    mixins: [bbn.wc.mixins.basic],
    props: {
      /**
       * The user id whose initials will be represented.
       * @prop {(String|Number)} userId
       */
      userId: {
        type: [String, Number]
      },
      /**
       * The username whose initials will be represented.
       * @prop {String} userName
       */
      userName: {
        type: String,
      },
      /**
       * The width of the rectangle containing the initials.
       * @prop {(String|Number)} width
       */
      width: {
        type: [String, Number]
      },
      /**
       * The height of the rectangle containing the initials.
       * @prop {(String|Number)} height
       */
      height: {
        type: [String, Number]
      },
      /**
       * The dimensions given to the component as width and height.
       * @prop {Number} [36] defaultSize
       */
      defaultSize: {
        type: Number,
        default: 36
      },
      /**
       * The number of characters shown if the property 'letter' is not specified.
       * @prop {Number} [2] charCount
       */
      charCount: {
        type: Number,
        default: 2
      },
      /**
       * The color of the text.
       * @prop {String} ['#FFF'] textColor
       */
      textColor: {
        type: [String],
        default: '#FFF'
      },
      /**
       * The text's font family.
       * @prop {String} fontFamily
       */
      fontFamily:{
        type: String
      },
      /**
       * The rectangle's background color.
       * @prop {String} color
       */
      color: {
        type: String
      },
      /**
       * The font-size of the initials.
       * @prop {(Number|String)} fontSize
       */
      fontSize: {
        type: [Number, String]
      },
      /**
       * The font-weight of the initials.
       * @prop {(String|Number)} [400] fontWeight
       */
      fontWeight: {
        type: [Number, String],
        default: 400
      },
      /**
       * The letters shown in the component if neither the userName or the userId are given.
       * @prop {String} letters
       */
      letters: {
        type: String
      },
      /**
       * The border-radius of the main container.
       * @prop {(Number|String)} [3] radius
       */
      radius: {
        type: [Number, String],
        default: 3
      },
      /**
       * The array of users.
       * @prop {Array} source
       */
      source: {
        type: Array,
        default(){
          return window.appui && appui.app && appui.app.users ? appui.app.users : []
        }
      },
      /**
       * The name of the property containing the user's name in the array source.
       * @prop {String} nameField
       */
      nameField: {
        type: String,
        default(){
          return window.appui && appui.app && appui.app.users ? 'text' : 'name'
        }
      },
      /**
       * The name of the property containing the user's id in the array source.
       * @prop {String} idField
       */
      idField: {
        type: String,
        default(){
          return window.appui && appui.app && appui.app.users ? 'value' : 'id'
        }
      },
      /**
       * The background colors palette
       * @prop {Array} [['#1abc9c', '#16a085', '#f1c40f', '#f39c12', '#2ecc71', '#27ae60', '#e67e22', '#d35400', '#3498db', '#2980b9', '#e74c3c', '#c0392b', '#9b59b6', '#8e44ad', '#bdc3c7', '#34495e', '#2c3e50', '#95a5a6', '#7f8c8d', '#ec87bf', '#d870ad', '#f69785', '#9ba37e', '#b49255', '#b49255', '#a94136']] colors
       */
      colors: {
        type: Array,
        default(){
          return ['#1abc9c', '#16a085', '#f1c40f', '#f39c12', '#2ecc71', '#27ae60', '#e67e22', '#d35400', '#3498db', '#2980b9', '#e74c3c', '#c0392b', '#9b59b6', '#8e44ad', '#bdc3c7', '#34495e', '#2c3e50', '#95a5a6', '#7f8c8d', '#ec87bf', '#d870ad', '#f69785', '#9ba37e', '#b49255', '#b49255', '#a94136']
        }
      }
    },
    computed: {
      /**
       * Defines the style of the text based on the properties 'textColor', 'fontWeight', 'fontSize' and 'fontFamily'.
       * @computed fontStyle
       * @return {Object}
       */
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
      /**
       * The current name
       * @computed currentName
       * @return {String}
       */
      currentName(){
        let name = this.userName;
        if ( !name && this.userId && this.source ){
          name = bbn.fn.getField(this.source, this.nameField, this.idField, this.userId);
        }
        return name;
      },
      /**
       * The letters that will be shown in the component.
       * @computed currentLetters
       * @return {String}
       */
      currentLetters(){
        let currentLetters = '';
        if ( this.letters ){
          currentLetters = this.letters;
        }
        if (!this.letters && this.currentName ) {
          let tmp = bbn.fn.removeEmpty(this.currentName.split(' '));
          while ( (tmp.length > this.charCount) && (tmp[0].length <= 3) ){
            tmp.shift();
          }
          for ( let i = 0; i < tmp.length; i++ ){
            if ( !this.charCount || (currentLetters.length <= this.charCount) ){
              currentLetters += bbn.fn.substr(tmp[i], 0, 1);
            }
          }
        }
        return this.charCount && !this.letters ? bbn.fn.substr(currentLetters, 0, this.charCount) : currentLetters;
      },
      /**
       * The color of the text.
       * @computed currentColor
       * @return {String}
       */
      currentColor(){
        let name = this.userName,
            col = this.color;
        if ( !col ){
          let sum = 0;
          this.currentLetters.split('').forEach(a => {
            sum += a.charCodeAt();
          });
          sum += name ?
            bbn.fn.substr(this.userName, -1).charCodeAt() :
            bbn.fn.substr(this.currentLetters, 0, 1).charCodeAt();
          let colorIndex = Math.floor(sum % this.colors.length);
          col = this.colors[colorIndex]
        }
        return col ? col : '#000'
      },
      /**
       * The font-size.
       * @computed currentFontSize
       * @return string
       */
      currentFontSize(){
        let currentFontSize = this.fontSize;
        if ( !this.fontSize ){
          let baseSize = parseInt(this.height) / this.charCount;
          currentFontSize = Math.round(baseSize + bbn.fn.percent(15*this.charCount, baseSize));
        }
        return bbn.fn.isNumber(currentFontSize) ? currentFontSize + 'px' : currentFontSize;
      },
      /**
       * The final width of the component.
       * @computed currentWidth
       * @return {String}
       */
      currentWidth(){
        let w = this.width || this.height || this.defaultSize;
        return bbn.fn.isNumber(w) ? w + 'px' : w;
      },
      /**
       * The final height of the component.
       * @computed currentHeight
       * @return {String}
       */
      currentHeight(){
        let h = this.height || this.width || this.defaultSize;
        return bbn.fn.isNumber(h) ? h + 'px' : h;
      },
      /**
       * The final border-radius that will be applied to the component.
       * @computed currentRadius
       * @return {String}
       */
      currentRadius(){
        return bbn.fn.isNumber(this.radius) ? this.radius + 'px' : this.radius;
      }
    }
  };
