((bbn) => {

let script_dep = document.createElement('script');
script_dep.setAttribute('src', 'https://cdn.jsdelivr.net/combine/gh/jaames/iro.js@5.0.0/dist/iro.js');
script_dep.onload = () => {


let script = document.createElement('script');
script.innerHTML = `<span :class="['bbn-iblock', componentClass, {'bbn-disabled': !!isDisabled}]">
  <input :value="value"
         class="bbn-colorpicker-input-hidden"
         :name="name"
         ref="element"
         :disabled="isDisabled"
         :readonly="readonly"
         :required="required"
         @click="click($event)"
         @focus="focus($event)"
         @blur="blur($event)"
         @keydown="keydown($event)"
         @keyup="keyup($event)">
  <div :class="['bbn-textbox', 'bbn-colorpicker-input', {'bbn-disabled': !!isDisabled}]">
    <div :class="['bbn-flex-width', 'bbn-radius', {'bbn-p': !isDisabled && !readonly}]"
         @click="openCloseFloater">
      <div class="bbn-flex-fill bbn-right-xsspace bbn-radius bbn-colorpicker-input-color bbn-middle bbn-bordered"
           :style="{backgroundColor: value || ''}">
        <i v-if="!value"
           class="nf nf-fae-thin_close bbn-s bbn-red"/>
      </div>
      <div class="bbn-colorpicker-icon">
        <i :class="{'nf nf-fa-caret_down': !readonly, 'nf nf-fa-lock': !!readonly}"/>
      </div>
    </div>
  </div>
  <bbn-floater :scrollable="false"
               :element="$el"
               hpos="right"
               :auto-hide="200"
               v-if="!!showFloater && !isDisabled && !readonly"
               ref="floater"
               @close="showFloater = false"
               @hook:mounted="init"
               height="24rem"
               width="45rem"
               :min-width="450"
               :min-height="300">
    <bbn-splitter orientation="horizontal">
      <bbn-pane>
        <div class="bbn-overlay bbn-middle">
          <div class="bbn-colorpicker-picker"
               ref="picker"
               @dblclick.prevent.stop=""
          ></div>
          <bbn-scroll v-if="showPalette || onlyPalette" class="bbn-background">
            <div class="bbn-c bbn-vsmargin">
              <div v-for="p in palette"
                   class="bbn-iblock bbn-colorpicker-palette bbn-bordered bbn-smargin bbn-p"
                   :style="{backgroundColor: p}"
                   @click="setColor(p)"/>
            </div>
          </bbn-scroll>
        </div>
      </bbn-pane>
      <bbn-pane>
        <div class="bbn-overlay bbn-middle">
          <div class="bbn-colorpicker-details">
            <div class="bbn-colorpicker-preview bbn-bottom-space bbn-box bbn-middle"
                 :style="{backgroundColor: currentValue}">
              <i v-if="!currentValue"
                 class="nf nf-fae-thin_close bbn-red"/>
            </div>
            <div v-if="showCodes"
                 class="bbn-colorpicker-details-inputs bbn-grid bbn-bottom-space">
              <span class="bbn-vmiddle">HEX</span>
              <span class="bbn-vmiddle">
                <i class="nf nf-fa-long_arrow_right"/>
              </span>
              <div>
                <bbn-input :value="currentHex"
                           @change="fromInput"/>
              </div>
              <span class="bbn-vmiddle">RGB</span>
              <span class="bbn-vmiddle">
                <i class="nf nf-fa-long_arrow_right"/>
              </span>
              <div>
                <bbn-input :value="currentRgb"
                           @change="fromInput"/>
              </div>
              <span class="bbn-vmiddle">RGBA</span>
              <span class="bbn-vmiddle">
                <i class="nf nf-fa-long_arrow_right"/>
              </span>
              <div>
                <bbn-input :value="currentRgba"
                           @change="fromInput"/>
              </div>
              <span class="bbn-vmiddle">HSL</span>
              <span class="bbn-vmiddle">
                <i class="nf nf-fa-long_arrow_right"/>
              </span>
              <div>
                <bbn-input :value="currentHsl"
                           @change="fromInput"/>
              </div>
            </div>
            <div class="bbn-flex-width">
              <div v-if="palette.length">
                <bbn-button :icon="!showPalette ? 'nf nf-fae-palette_color' : 'nf nf-fa-adjust'"
                            :notext="true"
                            :text="!showPalette ? _('Show palette') : _('Close palette')"
                            @click="showPalette = !showPalette"
                            v-if="!onlyPalette"/>
              </div>
              <div class="bbn-flex-fill bbn-r">
                <bbn-button icon="nf nf-fa-close"
                            :notext="true"
                            :text="_('Close')"
                            @click="showFloater = false"/>
                <bbn-button icon="nf nf-oct-diff_ignored"
                            :notext="true"
                            :text="_('Empty')"
                            @click="empty"
                            v-if="emptyButton"/>
                <bbn-button icon="nf nf-fa-check"
                            :text="_('Confirm')"
                            @click="save"/>
              </div>
            </div>
          </div>
        </div>
      </bbn-pane>
    </bbn-splitter>
  </bbn-floater>
</span>
`;
script.setAttribute('id', 'bbn-tpl-component-colorpicker');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

//* This component allows you to create an intuitive interface for color manipulations

/**
 * @file bbn-colorpicker component
 *
 * @description The bbn-colorpicker component contains a field that shows the currently selected color.
 * Clicking on the input field it displays a color chart. The set of colors can be customized using the palette property.
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 *
 * @created 10/02/2020
 */

(bbn => {
  "use strict";
  Vue.component('bbn-colorpicker', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     * @mixin bbn.vue.resizerComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.inputComponent, 
      bbn.vue.eventsComponent, 
      bbn.vue.resizerComponent
    ],
    props: {
      /**
       * The colorpicker's value.
       * @prop {String} value
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
       * Shows the colors palette only.
       * @prop {Boolean} [false] onlyPalette
       */
      onlyPalette: {
        type: Boolean,
        default: false
      },
      /**
       * The initial color.
       * @prop {String} ['#FDFDFD'] color
       */
      color: {
        type: String,
        default: '#FDFDFD'
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
       * An array containing the list of colors by hex, rgb, rgba, or hsl.
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
        validator: c => ['hex', 'rgb', 'rgba', 'hsl'].includes(c)
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
        showPalette: this.onlyPalette || this.palette.length,
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
        currentHsl: '',
        /**
         * @data {Boolean|Number} [false] initTimeout
         */
        initTimeout: false
      }
    },
    computed: {
      /**
       * The widget configuration.
       * @computed currentCfg
       * @return {Object}
       */
      currentCfg(){
        let obj = {
          handleRadius: 6,
          color: this.value || this.color,
          layout: []
        };
        if ( this.wheel && !this.slider && !this.onlyPalette ){
          obj.layout.push({component: iro.ui.Wheel});
        }
        else if ( !this.onlyPalette ){
          obj.layout.push({
            component: iro.ui.Slider,
            options: {
              sliderType: 'hue'
            }
          });
        }
        if ( this.brightness && !this.onlyPalette ){
          obj.layout.push({component: iro.ui.Slider});
        }
        if ( this.saturation && !this.onlyPalette ){
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
       * The method called at the window resize event.
       * @method onResize
       * @fires init
       */
      onResize(){
        this.$nextTick(() => {
          this.init();
        })
      },
      /**
       * Initializes the widget.
       * @method init
       * @fires destroy
       * @fires setEvents
       * @fires getRef
       */
      init(){
        if ( this.widget ){
          this.destroy();
        }
        clearTimeout(this.initTimeout);
        this.initTimeout = setTimeout(() => {
          let el = this.getRef('picker');
          if ( el ){
            let parent = el.offsetParent;
            let width;
            if (parent) {
              width = parent.getBoundingClientRect().width - 100;
            }
            else {
              width = 400;
            }
            this.widget = new iro.ColorPicker(el, bbn.fn.extend(true, {width: width}, this.currentCfg));
            this.setEvents();
          }
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
        if (this.widget) {
          this.widget.off('color:change');
        }
      },
      /**
       * Destroys the widget.
       * @method destroy
       * @fires unsetEvents
       */
      destroy(){
        if (this.widget) {
          this.unsetEvents();
          this.widget.base.remove();
          this.widget = false;
        }
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
        else if ( !this.isDisabled && !this.readonly ){
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
    beforeDestroy(){
      this.destroy();
    }
  });
})(bbn);


};
document.head.insertAdjacentElement("beforeend", script_dep);
})(bbn);