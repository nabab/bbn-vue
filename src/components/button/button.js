/**
 * @file bbn-button component
 *
 * @description bbn-button is a component represents the button with the possibility of extensive customizations.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */
  return {
    tag: 'button',
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.events
     */
    mixins: 
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.events
    ],
    props: {
      /**
       * The title of the button.
       *
       * @prop {String} [''] title
       */
      title: {
        type: String,
        default: ''
      },
      /**
      * The button's text.
      *
      * @prop {String} text
      */
      text: {
        type: String,
      },
      /**
      * Set to false for no text on the button.
      *
      * @prop {Boolean} [false] notext
      */
      notext: {
        type: Boolean,
        default: false
      },
      /**
       * The button links to a designated url.
       *
       * @prop {String} url
       */
      url: {
        type: String
      },
      /**
       * The icon shown on the button.
       *
       *  @prop {String} icon
       */
      icon: {
        type: String,
      },
      /**
       * The icon(s) position (left or right).
       *
       * @prop {String} ['left'] iconPosition
       */
      iconPosition: {
        type: String,
        default: 'left',
        validator: p => ['left', 'right'].includes(p)
      },
      /**
       * A second icon to display on the button above the main icon.
       *
       * @prop {String} secondary
       */
      secondary: {
        type: String
      },
      /**
       * If defined the prop secondary, defines the color of the second icon of the button.
       *
       * @prop {String} [null] secondaryColor
       */
      secondaryColor: {
        type: String
      },
      /**
       * Specifies the type of button.
       *
       * @prop {String} ['button'] type
       */
      type: {
        type: String,
        default: 'button'
      },
      /**
       * Set to true to disable the button.
       *
       * @prop {(Boolean|Function)} [false] disabled
       */
      disabled: {
        type: [Boolean, Function],
        default: false
      },
      /**
       * Set to true for the button to glow.
       *
       * @prop {(String|Boolean)} [false] glowing
       */
      glowing: {
        type: [String, Boolean],
        default: false
      },
      /**
       * State the button's glowing colour.
       *
       * @prop {String} ['#c4a300'] glowingColor
       */
      glowingColor: {
        type: String,
        default: '#c4a300'
      },
      /**
       * The action that has to be performed at the event click.
       *
       * @prop {(Function|String)} action
       */
      action: {
        type: [Function, String]
      },
      /**
       * Adds the ellipsis
       * @prop {Boolean} [false] ellipsis
       */
      ellipsis: {
        type: Boolean,
        default: false
      },
      /**
       * If true the button will be focused when inserted in the DOM
       * @prop {Boolean} [false] focused
       */
      focused: {
        type: Boolean,
        default: false
      },
      /**
       * If true the button will have the bbn-active class
       * @prop {Boolean} [false] active
       */
      active: {
        type: Boolean,
        default: false
      },
    },
    data(){
      return {
        glowingID: bbn.fn.randomString()
      }
    },
    computed: {
      /**
       * Returns a combination of the properties 'text' and 'title' if the property 'noText' is set to true, else returns the property 'title'.
       *
       * @computed titleString
       * @return {String}
       */
      titleString(){
        let st = '';
        if ( this.notext && this.text ){
          st += this.text;
        }
        if ( this.title ){
          st += (st === '' ? '' : ' - ') + this.title;
        }
        return st;
      },
      /**
       * Return if the button is disabled.
       *
       * @computed isDisabled
       * @fires disabled
       * @return {Boolean}
       */
      isDisabled(){
        return typeof(this.disabled) === 'function' ?
          this.disabled() : this.disabled
      },
      /**
       * Returns the style of the button
       * @computed currentStyle
       * @return {Object}
       */
      currentStyle(){
        let obj = this.glowing && this.glowingColor ? {animation: `bbn-button-glowing-${this.glowingID} 3s infinite`} : {};
        if (this.ellipsis) {
          obj['text-overflow'] = 'ellipsis';
        }
        return obj;
      }
    },
    methods: {
      /**
       * The role of the button when clicked.
       *
       * @method click
       * @param {Event} e
       * @fires action
       * @emit click
       */
      click(e){
        if ( this.url ){
          bbn.fn.link(this.url);
        }
        else{
          this.$emit('click', e, this);
          if ( !e.defaultPrevented && this.action ){
            this.action(e, this);
          }
        }
      }
    },
    beforeMount(){
      if ( this.glowing && this.glowingColor ){
        let lc = bbn.fn.lightenDarkenHex(this.glowingColor, 40),
            styleTag = document.createElement('style');
        styleTag.textContent = bbn.fn.isString(this.glowing) ? this.glowing : `
@-webkit-keyframes bbn-button-glowing-${this.glowingID} {
  0% { background-color: ${this.glowingColor}; -webkit-box-shadow: 0 0 3px ${this.glowingColor}; }
  50% { background-color: ${lc}; -webkit-box-shadow: 0 0 40px ${lc}; }
  100% { background-color: ${this.glowingColor}; -webkit-box-shadow: 0 0 3px ${this.glowingColor}; }
}
@-moz-keyframes bbn-button-glowing-${this.glowingID} {
  0% { background-color: ${this.glowingColor}; -moz-box-shadow: 0 0 3px ${this.glowingColor}; }
  50% { background-color: ${lc}; -moz-box-shadow: 0 0 40px ${lc}; }
  100% { background-color: ${this.glowingColor}; -moz-box-shadow: 0 0 3px ${this.glowingColor}; }
}
@-o-keyframes bbn-button-glowing-${this.glowingID} {
  0% { background-color: ${this.glowingColor}; box-shadow: 0 0 3px ${this.glowingColor}; }
  50% { background-color: ${lc}; box-shadow: 0 0 40px ${lc}; }
  100% { background-color: ${this.glowingColor}; box-shadow: 0 0 3px ${this.glowingColor}; }
}
@keyframes bbn-button-glowing-${this.glowingID} {
  0% { background-color: ${this.glowingColor}; box-shadow: 0 0 3px ${this.glowingColor}; }
  50% { background-color: ${lc}; box-shadow: 0 0 40px ${lc}; }
  100% { background-color: ${this.glowingColor}; box-shadow: 0 0 3px ${this.glowingColor}; }
}
        `;
        document.body.appendChild(styleTag);
      }
    }
  };

