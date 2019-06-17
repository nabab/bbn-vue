//* This component allows you to create an intuitive interface for color manipulations

/**
 * @file bbn-colorpicker component
 * @description The bbn-colorpicker component contains a field that shows the currently selected color.
 * Clicking on the input field it displays a color chart. The set of colors can be customized using the palette property.
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 18/07/2018
 */

((bbn) => {
  "use strict";
  Vue.component('bbn-colorpicker', {
    /**
     * @mixin bbn.vue.basicComponent 
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
    props: {
      /**
       * The value of the colorpicker
       * @prop {String} value
       */
      value: {
        type: String,
      },
      /**
       * @prop {Boolean} [false] panel
       */
      panel: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Boolean} [false] gradient
       */
      //for opacity
      gradient: {
        type: Boolean,
        default: false
      },
      /**
       * Tracks the initial color
       * @prop {Boolean} [false] initial
       */
      initial: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true to show an input containing the color code
       * @prop {Boolean} [false] showCode
       */
      showCode: {
        type: Boolean,
        default: false
      },
      /**
       * If the array palette is defined, set to true to show only the given list of colors
       * @prop {Boolean} [false] onlyPalette
       */
      onlyPalette:{
        type: Boolean,
        default: false
      },
      /**
       * An array containing the list of colors by hex, rgb, rgba or the color's name 
       * @prop {Array} palette
       */
      palette:{
        type: Array
      },
      /**
       * Set to true to show the button 'choose' and 'cancel'
       * @prop {Boolean} [false] buttons
       */
      buttons: {
        type: Boolean,
        default: true
      },
      /**
       * An array containing the text of the buttons
       * @prop {Array} textButtons
       */
      textButtons: {
        type: Array
      },
      //if set atrue through the panel we can define a palette of favourite colors that come from the selection of the panel and not from an apalette that we have already passed
      /**
       * Set to true to create a palette of selected favourite colors
       * @prop {Boolean} [false] favourite
       */
      favourite: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true sto how a button that empties the selection when clicked
       * @prop {Boolean} [false] buttonEmpty
       */
      buttonEmpty:{
        type: Boolean,
        default: false
      },
     
      /**
       * Defines the color code
       * @prop {String} ['hex'] codeColor
       */
      codeColor: {
        type: String,
        default: "hex"
      }
    },
    computed:{
      /**
       * The object of configuration of the colorpicker
       * @computed dataComponent
       * @return {Object}
       */
      dataComponent(){
        let cp = this;
        let obj = {
          preferredFormat: this.codeColor,
          togglePaletteOnly: this.onlyPalette,
          showInput: this.showCode,
          showPalette: this.favourite,
          showInitial: this.initial,
          showAlpha: this.gradient,
          replacerClassName: "k-widget k-colorpicker k-textbox",
          preferredFormat: this.codeColor,
          //container
          //if set to false and I click outside the panel does not keep the selected value as if it were a cancel
          clickoutFiresChange: true,
          showButtons: this.buttons,
          allowEmpty: this.buttonEmpty,
          flat: this.panel,
          change(){
            //cp.$emit('change', this.value);
            cp.emitInput(this.value);
          },
          move(){
            cp.$emit('move');
          },
          hide(){
            cp.$emit('hide');
          },
          show(){
            cp.$emit('show');
          },
          beforeShow(){
            cp.$emit('beforeShow');
          }
        };

        //for palette
        if ( this.palette !== undefined && this.palette.length ){
          obj.palette = this.palette;
          if( this.panel === true ){
            obj.showPalette = true;
            obj.togglePaletteOnly = true;
          }
          else{
            obj.showPaletteOnly = this.onlyPalette;
          }
        }
        //for color
        if ( this.value !== undefined ){
          obj.color = this.value;
        }

        //set text buttons
        if( this.textButtons !== undefined ){
          let btns = this.textButtons.slice();
          if(btns[0] && btns[0].length && (btns[0] !== "") ){
            obj.cancelText = btns[0];
          }
          if( btns[1] && btns[1].length ){
            obj.chooseText = btns[1];
          }
        }
        //events
        return obj;
      }
    },
    methods: {
      /**
       * @method dragstart
       * @param {Event} e The event
       * @param {String} color 
       * @emits dragstart
       */
      dragstart(e, color){
        $(this.$refs.element).on("dragstart.spectrum" , (e, color)=>{
          this.$emit("dragstart", e, color);
        });
      },
      /**
       * @method dragstop
       * @param {Event} e The event
       * @param {String} color 
       * @emits dragstop
       */
      dragstop(e, color){
        $(this.$refs.element).on("dragstop.spectrum", (e, color)=>{
          this.$emit("dragstop", e, color);
        });
      },
      /**
       * Starts the configuration of the component
       * @method initComponent
       * 
       */
      initComponent(){
        if ( this.widget ){
          $(this.$refs.element).spectrum("destroy");
          this.widget = false;
        }
        setTimeout(() => {
          this.widget = $(this.$refs.element).spectrum(this.dataComponent);
          $('div').removeClass('sp-replacer');
          $('div.k-widget').css("padding", "3px");
          $('div.sp-dd').css("cursor","pointer");
          $('div.sp-container').css("z-index","1");
          this.dragstart();
          this.dragstop();
        }, 100);
      },
      /**
       * Converts hex to rgb colors
       * @param {Number} r 
       * @param {Number} g 
       * @param {Number} b 
       */
      fullColorToHex(r, g, b){
        var rgbToHex = rgb => {
          rgb = Math.round(rgb);
          let hex = Number(rgb).toString(16);
          if (hex.length < 2) {
               hex = "0" + hex;
          }
          return hex;
        }
        let red = rgbToHex(r),
            green = rgbToHex(g),
            blue = rgbToHex(b);
        return `#${red}${green}${blue}`;
      },
      getOptions(){
        const vm = this;
        return bbn.vue.getOptions(vm);
      }
    },
    /**
     * @event mounted
     * @fires initComponent
     */
    mounted(){
      this.$nextTick(() => {
        this.initComponent();
      });
      this.ready = true;
    },
    watch:{
      /**
       * @watch dataComponent
       * @param old 
       * @param val 
       * @fires initComponent
       */
      dataComponent(old, val){
        if ( old !== val ){
          this.initComponent();
        }

      },
      "$props.disabled"(val){
        this.initComponent();
      },
      value(oldVal, newVal){
        /*if( newVal !== oldVal ){
          this.$emit('change', newVal)
        }*/
      }
    }
  });
})(bbn);
