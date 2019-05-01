/**
 * @file bbn-button is a very simple component to use; you can configure the appearance of the button to display only the text, icon or combination of both and allows you to define the actions to be performed.
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
        if ( this.url ){
          bbn.fn.link(this.url);
        }
        else{
          this.$emit('click', e);
        }
      }
    }
  });

})(bbn);
