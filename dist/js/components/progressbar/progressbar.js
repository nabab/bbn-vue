(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `
  <div :class="['bbn-widget', componentClass, 'bbn-primary-border' ,'bbn-progressbar-wrap', {
         'bbn-progressbar-horizontal' : (orientation === 'horizontal'),
         'bbn-progressbar-vertical' : (orientation === 'vertical'),
         'bbn-reverse-bar': reverse
       }]"
       :rotate="rotate"
       :style="orientationStyle"
       type="type"
  >
    <div :class="['bbn-overlay', barClass]"
         :style="style"
         v-if="type !== 'chunk'"
    ></div>
    <div v-else class="chunk bbn-overlay"
         :style="chunkStyle"
    >
      <div :class="['block', {
             'bbn-background-effect-primary': !barColor.length && ( ((!reverse) && (n <= selectedChunks)) || ((reverse) && (n > chunknumber - selectedChunks)))
           }]"
           :style="barColor.length && ( ((!reverse) && (n <= selectedChunks)) || ((reverse) && (n > chunknumber - selectedChunks))) ? 'background-color:'+ barColor : ''"
           v-for="n in chunknumber"
      ></div>
    </div>
    <div :class="['bbn-wrap', realValuePosition, 'bbn-no-border']"
        style="height: 100%"
    >
    <div :class="['bbn-progress-status', {'bbn-hspadded': (orientation === 'horizontal')}]"
          v-text="(showValue ? (value + ( showUnit ? unit : '' ) ) : '') + (!!text ? ( showValue ? ' ' : '') + '(' + text + ')' : '')"
          :style="textColor.length ? 'color: '+ textColor + '!important' : ''"
    ></div>
    </div>
  </div>`;
script.setAttribute('id', 'bbn-tpl-component-progressbar');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/progressbar/progressbar.css');
document.head.insertAdjacentElement('beforeend', css);

/**
 * @file The bbn-progessbar component is a bar that indicates the progress status, it can be customized as the user desires: vertical bar, horizontal, reverse mode or chunk type.
 *
 * @copyright BBN Solutions
 *
 * @created 10/02/2017
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-progressbar', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.inputComponent, 
      bbn.vue.eventsComponent
    ],
    props: {
      /**
       * The value to be represented by the bar
       * @prop {Number|String} value
       */
      value: {
        type: [Number, String],
      },
      /**
       * The maximum value of the bar
       * @prop {Number} [100] max
       */
      max: {
        type: Number,
        default: 100
      },
      /**
       * The minimum value of the bar
       * @prop {Number} [0] min
       */
      min: {
        type: Number,
        default: 0
      },
      /**
       * In case of type 'chunk' defines the step of the chunk
       * @prop {Number} [10] step
       */
      step: {
        type:  Number,
        default: 10
      },
      /**
       * The orientation of the bar
       * @prop {String} ['horizontal'] orientation
       */
      orientation: {
        type: String,
        default: 'horizontal',
        validator: o => ['horizontal', 'vertical'].includes(o)
      },
      /**
       * Set to true flip the bar.
       * @prop {Boolean} [false] reverse
       */
      reverse: {
        type: Boolean,
        default: false
      },
      /**
       * The type the bar. Allowed 'value', 'percent', 'chunk' ('chunk' divides the bar into boxes to show the progress)
       * @prop {String} ['value'] type
       */
      type: {
        type: String,
        default: 'value',
        validator: t => ['value', 'percent', 'chunk'].includes(t)
      },
      /**
       * The primary color of the bar (hex, rgb, rgba)
       * @prop {String} [''] barColor
       */
      barColor: {
        type: String,
        default: ''
      },
      /**
       * @prop {String} ['bbn-background-effect-primary'] barClass
       */
      barClass: {
        type: String,
        default: 'bbn-background-effect-primary'
      },
      /**
       * Defines the color of the text on the bar
       * @prop textColor {String} [''] textColor
       */
      textColor: {
        type: String,
        default: ''
      },
      /**
       * @prop {String} [''] text
       */
      text: {
        type: String,
        default: ''
      },
      /**
       * Defines the height of the bar if the prop orientation is set to 'vertical'
       * @prop {Number|String} [500] height
       */
      height: {
        type: [Number, String],
        default: 500
      },
      /**
       * Defines the width of the bar if the bar if the prop orientation is set to 'horizontal'
       * @prop {Number|String} width
       */
      width: {
        type: [Number, String],
        //default: 500
      },
      /**
       * Set to true shows the value on the bar
       * @prop showValue {Boolean} [true] showValue
       */
      showValue: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true shows the unit
       * @prop {Boolean} [true] showUnit
       */
      showUnit: {
        type: Boolean,
        default: true
      },
      /**
       * Defines of how many degrees the progressbar has to be rotated
       * @prop {Number} [0] rotate
       */
      rotate: {
        type: Number,
        default: 0
      },
      /**
       * @prop {String} ['default'] valuePosition
       */
      valuePosition: {
        type: String,
        default: 'right',
        validator: p => ['left', 'center', 'right', 'top', 'bottom'].includes(p)
      }
    },
    data(){
      return {
        /**
         * The string that defines the main style of the bar basing on the orientation
         * @data {String} [''] orientationStyle
         */
        orientationStyle: '',
        /**
         * If the type is set to 'percent' the unit will be '%'
         * @data {String} [''] unit
         */
        unit: '',
        /**
         * If the type is set to 'chunk' represents the number of total chunks in the bar
         * @data {Number} [0] chunknumber
         */
        chunknumber : 0,
        /**
         * If the type is set to 'chunk' represents the number of selected chunks in the bar
         * @data {Number} [0] selectedChunks
         */
        selectedChunks: 0,
        /**
         * Defines the style of the bar when type is set to 'chunk'
         * @data {String} [''] chunkStyle
         */
        chunkStyle : '',
        /**
         * Defines the class for the alignment of the value in the bar depending on the orientation and on the prop valuePosition
         * @data {String} [''] realValuePosition
         */
        realValuePosition: '',
        percent: 0,
      }
    },
    computed: {
      /**
       * @computed stepTotal
       * @return {Number}
       */
      stepTotal(){
        return Math.round(this.max / this.step * 100) / 100;
      },
      /**
       * @computed stepTotalRounded
       * @return {Number}
       */
      stepTotalRounded(){
        return Math.round(this.max / this.step);
      },
      /**
       * Defines the style of the bar
       * @computed {String} style
       * @return {String}
       */
      style(){
        let st = '';
        if ( this.orientation === 'horizontal' ){
          st += 'width:' + this.percent  + '%;'
        }
        else if ( this.orientation === 'vertical' ){
          st += 'height:' + this.percent  + '%;'
        }
        if ( this.barColor ){
          st += 'background-color: ' + this.barColor + '!important;border-color: '+ this.barColor + '!important;'
        }
        if (this.reverse) {
          st += 'margin-left: auto;'
        }
        return st;
      },
    },
    methods: {
      /**
       * Init the component by the type
       * @method init
       * @fires emitInput
       */
      init(){
        if ( this.type === 'percent' ){
          this.unit = '%';
          this.percent = this.value;
        }
        if(this.type === 'value') {
          this.percent = (this.value - this.min) / (this.max - this.min) * 100;
        }
        if ( this.value ){
          if( bbn.fn.isString(this.value) ){
            this.value = parseInt(this.value);
          }
        }
        if ( this.type === 'chunk' ){
          this.chunknumber = ( this.max - this.min ) / this.step,
          this.selectedChunks = (this.value / 100) * this.chunknumber;
        }
        if ( this.max && ( this.value > this.max ) ){
          this.emitInput(this.max);
        }
        if ( this.min && ( this.value < this.min ) ){
          this.emitInput(this.min);
        }
      }
    },
    /**
     * @event beforeMount
     * @fires init
     */
    beforeMount(){
      this.init();
      let st = 'margin: auto;';
      if ( this.orientation === 'vertical' ){
        st += 'width: 1.9rem; min-height: ' + (bbn.fn.isNumber(this.height) ? ( this.height  + 'px') : this.height);
        if ( this.valuePosition === 'right' ){
          this.realValuePosition = 'top';
        }
        else{
          this.realValuePosition = this.valuePosition;
        }
      }
      else if (this.orientation === 'horizontal') {
        this.realValuePosition = this.valuePosition;
      }
      if ( (this.orientation === 'horizontal') && (this.width) ){
        st += 'height: 1.9rem; min-width: ' + (bbn.fn.isNumber(this.width) ? ( this.width  + 'px') : this.width);
      }
      this.orientationStyle = st += ';';
      if ( this.rotate && bbn.fn.isNumber(this.rotate) ){
        this.orientationStyle += 'transform: rotate('+ this.rotate + 'deg)'
      }
    },
    watch: {
      /**
       * @watch chunknumber
       */
      chunknumber(val){
        if ( this.orientation === 'horizontal' ){
          this.chunkStyle += 'grid-template-columns:repeat(' + this.chunknumber + ', 1fr);grid-template-rows: 1fr';
        }
        else{
          this.chunkStyle += 'grid-template-rows:repeat(' + this.chunknumber + ',1fr);grid-template-columns: 1fr; min-height: '+ this.height + 'px';
        }
      },
      /**
       * @watch value
       * @fires init
       */
      value(){
        this.init();
      }
    }

  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}