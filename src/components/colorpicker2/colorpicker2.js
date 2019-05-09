/**
 * @file bbn-colorpicker component

 * @description The bbn-colorpicker component contains a field that shows the currently selected color.
 * Clicking on the input field it displays a color chart, this set of colors can be customized by defining it in the "palette" property.
 * This component allows you to create an intuitive interface for color manipulations
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 18/07/2018
 */

(($, bbn) => {
  "use strict";
  Vue.component('bbn-colorpicker2', {
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
    props: {
      /**
       * @prop {String} value
       */
      value: {
        type: String,
      },
      pannel: {
        type: Boolean,
        default: false
      },
      //for opacity
      gradient: {
        type: Boolean,
        default: false
      },
      //tracke coloer initial
      initial: {
        type: Boolean,
        default: true
      },
      //show code color in input
      showCode: {
        type: Boolean,
        default: false
      },
      //no pannel but only palette
      onlyPalette:{
        type: Boolean,
        default: false
      },
      //Array of arrays or simple array to which it contains the desired colors and can be written in rgb, hex or even just with the name
      palette:{
        type: Array
      },
      //show or button
      buttons: {
        type: Boolean,
        default: true
      },
      //teex name button
      textButtons: {
        type: Array
      },
      //if set atrue through the pannel we can define a palette of favorite colors that come from the selection of the pannel and not from an apalette that we have already passed
      favorite:{
        type: Boolean,
        default: false
      },
      //button that calculates the selected color
      buttonEmpty:{
        type: Boolean,
        default: false
      },
      //set the format that is displayed in the text box. type: hex, rgb, rgba, name , hsl , none (Depends on input - try changing formats with the text box)
      codeColor: {
        type: String,
        default: "hex"
      }
    },
    computed:{
      //object for configuration colorpicker
      dataComponent(){
        let cp = this;
        let obj = {
          preferredFormat: this.codeColor,
          togglePaletteOnly: this.onlyPalette,
          showInput: this.showCode,
          showPalette: this.favorite,
          showInitial: this.initial,
          showAlpha: this.gradient,
          replacerClassName: "k-widget k-colorpicker k-textbox",
          preferredFormat: this.codeColor,
          //container
          //if set to false and I click outside the pannel does not keep the selected value as if it were a cancel
          clickoutFiresChange: true,
          showButtons: this.buttons,
          allowEmpty: this.buttonEmpty,
          flat: this.pannel,
          change(){
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
          if( this.pannel === true ){
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
      dragstart(e, color){
        $(this.$refs.element).on("dragstart.spectrum" , (e, color)=>{
          this.$emit("dragstart", e, color);
        });
      },
      dragstop(e, color){
        $(this.$refs.element).on("dragstop.spectrum", (e, color)=>{
          this.$emit("dragstop", e, color);
        });
      },
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
      build(){
        bbn.fn.log("colorpicker2 builder", this.$refs.element);
      },
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
    mounted(){
      this.$nextTick(() => {
        this.initComponent();
      });
      this.ready = true;
    },
    watch:{
      dataComponent(old, val){
        if ( old !== val ){
          this.initComponent();
        }

      },
      "$props.disabled"(val){
        this.initComponent();
      }
    }
  });
})(jQuery, bbn);
