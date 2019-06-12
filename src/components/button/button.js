/**
 * @file bbn-button component
 *
 * @description bbn-button is a very simple component to use; it is possible to configure the appearance of the button by defining its properties as desired, for example: displaying only text, the icon or the combination of both.
 * Defines the actions to be performed.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-button', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.eventsComponent],
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
        validator: (p) => ['left', 'right'].includes(p)
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
       * @prop {String} secondaryColor
       */
      secondaryColor: {
        type: String,
        default: null
      },
      /**
      * Specifies the type of button.
      *
      * @prop {String} type
      */
      type: {
        type: String,
        default: 'button'
      },
     /**
      * Set to true to disable the button.
      *
      * @prop {Boolean|Function} [false] disabled
      */
      disabled: {
        type: [Boolean, Function],
        default: false
      },
     /**
      * Set to true for the button to glow.
      *
      * @prop {Boolean|Function} [false] glowing
      */
      glowing: {
        type: [String, Boolean],
        default: false
      },
     /**
      * State the button's glowing colour.
      *
      * @prop {String} [#c4a300] glowingColor
      */
      glowingColor: {
        type: String,
        default: '#c4a300'
      },
      command: {
        type: Function
      }
    },
    computed: {
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
       * @return {Boolean}
       */
      isDisabled(){
        return typeof(this.disabled) === 'function' ?
          this.disabled() : this.disabled
      }
    },
    methods: {
      /**
       * The role of the button when clicked.
       *
       * @method click
       * @emit click
       */
      click(e){
        bbn.fn.log("CLICK", this.url, this.command, e.defaultPrevented);
        if ( this.url ){
          bbn.fn.link(this.url);
        }
        else{
          this.$emit('click', e, this);
          if ( !e.defaultPrevented && this.command ){
            this.command(e, this);
          }
        }
      }
    },
    watch: {
      isDisabled(){
        bbn.fn.log("IS DUISABLED HAS CHANGED");
      }
    }
  });

})(bbn);
