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
     * @mixin bbn.vue.fullComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      /**
       * The value to be represented by the bar
       * @prop {Number|String} value
       */
      value: {
        type: [Number||String],
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
       * @prop {Number} [0]
       */
      min: {
        type: Number,
        default: 0
      },
      /**
       * In case of type 'chunk' defines the step of the chunk
       * @prop {Number} [1] step
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
        default: 'horizontal'
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
        default: 'value'
      },
      /**
       * The primary color of the bar (hex, rgb, rgba)
       *  
       * @prop {String} barColor
       */
      barColor: {
        type: String,
        default: ''
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
       * Defines the height of the bar if the bar if the prop orientation is set to 'vertical'
       * @prop {Number|String} [500] height
       */
      height: {
        type: [Number||String],
        default: 500
      },
      /**
       * Defines the width of the bar if the bar if the prop orientation is set to 'horizontal'
       * @prop {Number|String} [500] width
       */
      width: {
        type: [Number||String],
        default: 500
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
      valuePosition: {
        type: String,
        default: 'right' 
        //allowed values 'left', 'center', 'right', 'top', 'bottom'

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
         */
        realValuePosition: '', 
      }
    },
    computed: {
      /** */
      stepTotal(){
        return Math.round(this.max / this.step * 100) / 100;
      },
      stepTotalRounded(){
        return Math.round(this.max / this.step);
      },
      /**
       * Defines the style of the bar
       * 
       * @computed {String} style 
       */
      style(){
        let st = '';
        if ( this.orientation === 'horizontal' ){
          st += 'width:' + this.value  + '%;'
        }
        else if ( this.orientation === 'vertical' ){
          st += 'height:' + this.value  + '%;'
        }
        if ( this.barColor ){
          st += 'background-color: ' + this.barColor + '!important;border-color: '+ this.barColor + '!important;'
        }
        return st;
      }
    },
    /**
     * Checks the type of the value 
     * 
     * @event beforeMount
     * @emits value
     */
    beforeMount(){
      if ( this.type === 'percent' ){
        this.unit = '%';
      }
      if ( this.value ){
        if( bbn.fn.isString(this.value) ){
          this.value = parseInt(this.value);
        }
      }
      let st = 'margin: auto;';
      if ( this.orientation === 'vertical' ){
        st += 'width: 1.9em; min-height: ' + (bbn.fn.isNumber(this.height) ? ( this.height  + 'px') : this.height);
        if ( this.valuePosition === 'right' ){
          this.realValuePosition = 'top';
        }
        else{
          this.realValuePosition = this.valuePosition;  
        }
      }
      else if ( this.orientation === 'horizontal' ){
        this.realValuePosition = this.valuePosition;
        st += 'height: 1.9em; width: ' + (bbn.fn.isNumber(this.width) ? ( this.width  + 'px') : this.width);
      }
      this.orientationStyle = st += ';';
      
      if ( this.type === 'chunk' ){
        this.chunknumber = ( this.max - this.min ) / this.step, 
        this.selectedChunks = this.value / this.chunknumber;
      }
      if ( this.max && ( this.value > this.max ) ){
        this.emitInput(this.max);
      }
      if ( this.min && ( this.value < this.min ) ){
        this.emitInput(this.min);
      }
      if ( this.rotate && bbn.fn.isNumber(this.rotate) ){
        this.orientationStyle += 'transform: rotate('+ this.rotate + 'deg)'
      }
    },
    watch: {
      chunknumber(val){
        if ( this.orientation === 'horizontal' ){
          this.chunkStyle += 'grid-template-columns:repeat(' + this.chunknumber + ', 1fr);grid-template-rows: 1fr';
        }
        else{
          this.chunkStyle += 'grid-template-rows:repeat(' + this.chunknumber + ',1fr);grid-template-columns: 1fr; min-height: '+ this.height + 'px';
        }
      }
    }
    
  });

})(bbn);
