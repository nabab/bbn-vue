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
  Vue.component('bbn-colorpicker2', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
    props: {
      /**
       * The colorpicker's value.
       * @prop {String|} value
       */
      value: {
        type: String,
      },
      /**
       * Shows the coolors wheel.
       * @prop {Boolean} [true] wheel
       */
      wheel: {
        type: Boolean,
        default: true
      },
      /**
       * Show a colors slider instead of the wheel.
       * @prop {Boolean} [false] slider
       */
      slider: {
        tyoe: Boolean,
        default: false
      },
      /**
       * Shows the brightness slier
       * @prop {Boolean}.[true] brightness
       */
      brightness: {
        type: Boolean,
        default: true
      },
      /**
       * Shows the saturation slider.
       * @prop {Boolean} [true] saturation
       */
      saturation: {
        type: Boolean,
        default: true
      },
      /**
       * The initial color.
       * @prop {String} ['#ffffff'] color
       */
      color: {
        type: String,
        default: '#ffffff'
      },
      /**
       * Set it to true to show an input containing the color code.
       * @prop {Boolean} [true] showCodes
       */
      showCodes: {
        type: Boolean,
        default: true
      },
      /**
       * An array containing the list of colors by hex, rgb, rgba, hsl or the color's name.
       * @prop {Array} palette
       */
      palette: {
        type: Array,
        default(){
          return bbn.var.colors ? Object.values(bbn.var.colors) : []
        }
      },
      /**
       * Shows a button that empties the selection when clicked.
       * @prop {Boolean} [true] emptyButton
       */
      emptyButton: {
        type: Boolean,
        default: true
      },
      /**
       * Defines the color code.
       * Accepted values: 'hex', 'rgb', 'rgba', 'hsl'.
       * @prop {String} ['hex'] codeColor
       */
      codeColor: {
        type: String,
        default: "hex",
        validator: (c) => ['hex', 'rgb', 'rgba', 'hsl'].includes(c)
      }
    },
    data(){
      return {
        /**
         * @data widget
         */
        widget: false,
        /**
         * @data {Boolean} [false] showFloater
         */
        showFloater: false,
        /**
         * @data {Boolean} [false] showPalette
         */
        showPalette: false,
        /**
         * @data {String} currentValue
         */
        currentValue: this.value,
        /**
         * @data {String} [''] currentHex
         */
        currentHex: '',
        /**
         * @data {String} [''] currentRgb
         */
        currentRgb: '',
        /**
         * @data {String} [''] currentRgba
         */
        currentRgba: '',
        /**
         * @data {String} [''] currentHsl
         */
        currentHsl: ''
      }
    },
    computed: {
      /**
       * The widget configuration.
       * @computed currentCfg
       * @return Object
       */
      currentCfg(){
        let obj = {
          width: 200,
          handleRadius: 6,
          color: this.value || this.color,
          layout: []
        };
        if ( this.wheel && !this.slider ){
          obj.layout.push({component: iro.ui.Wheel});
        }
        else {
          obj.layout.push({
            component: iro.ui.Slider,
            options: {
              sliderType: 'hue'
            }
          });
        }
        if ( this.brightness ){
          obj.layout.push({component: iro.ui.Slider});
        }
        if ( this.saturation ){
          obj.layout.push({
            component: iro.ui.Slider,
            options: {
              sliderType: 'saturation'
            }
          });
        }
        return obj;
      }
    },
    methods: {
      /**
       * Initializes the widget.
       * @method init
       * @fires destroy
       * @fires setEvents
       */
      init(){
        if ( this.widget ){
          this.destroy();
        }
        setTimeout(() => {
          this.widget = new iro.ColorPicker(this.getRef('picker'), this.currentCfg);
          this.setEvents();
        }, 300);
      },
      /**
       * Sets the current values.
       * @method setCurrents
       */
      setCurrents(color){
        if ( bbn.fn.isObject(color) ){
          this.currentHex = color.hexString;
          this.currentRgb = color.rgbString;
          this.currentRgba = color.rgbaString;
          this.currentHsl = color.hslString;
          switch ( this.codeColor ){
            case 'hex':
              this.currentValue = this.currentHex;
              break;
            case 'rgb':
              this.currentValue = this.currentRgb;
              break;
            case 'rgba':
              this.currentValue = this.currentRgba;
              break;
            case 'hsl':
              this.currentValue = this.currentHsl;
              break;
          }
        }
        else {
          this.currentHex = '';
          this.currentRgb = '';
          this.currentRgba = '';
          this.currentHsl = '';
          this.currentValue = '';
        }
      },
      /**
       * Sets the events to the widget.
       * @method setEvents
       * @fires setCurrents
       */
      setEvents(){
        this.widget.on('mount', cp => {
          if ( this.value ){
            this.setCurrents(cp.color);
          }
          cp.on('color:change', color => {
            this.setCurrents(color);
          })
        });
      },
      /**
       * Unsets the widget's events.
       * @method unsetEvents
       */
      unsetEvents(){
        this.widget.off('color:change');
      },
      /**
       * Destroys the widget.
       * @method destroy
       * @fires unsetEvents
       */
      destroy(){
        this.unsetEvents();
        this.widget.base.remove();
        this.widget = false;
      },
      /**
       * Empties the current calue.
       * @method empty
       * @fires setCurrents
       */
      empty(){
        this.setCurrents();
      },
      /**
       * Sets the component value.
       * @method save
       * @emit input
       * @emit change
       */
      save(){
        if ( this.value !== this.currentValue ){
          this.emitInput(this.currentValue || (this.nullable ? null : ''));
          this.$emit('change', this.currentValue);
        }
        this.showFloater = false
      },
      /**
       * Sets the color to the widget.
       * @method setColor
       */
      setColor(color){
        this.widget.color.set(color);
      },
      /**
       * Sets the color inserted from the inputs.
       * @method fromInput
       * @fires setColor
       */
      fromInput(event){
        this.setColor(event.target.value);
      },
      /**
       * Opens/closes the floater.
       * @method openCloseFloater
       */
      openCloseFloater(){
        if ( this.showFloater ){
          this.showFloater = false;
        }
        else if ( !this.disabled && !this.readonly ){
          this.showFloater = true;
        }
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.ready = true;
    },
    /**
     * @event beforeDestroy
     * @fires destroy
     */
    breforeDestroy(){
      this.destroy();
    }
  });
})(bbn);
