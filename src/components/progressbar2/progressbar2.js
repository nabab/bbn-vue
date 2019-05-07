/**
 * @file The bbn-progessbar component is a bar that indicates the progress status, it can be customized as the user desires: vertical bar, horizontal, reverse mode or chunk type.
 *
 * @copyright BBN Solutions
 *
 * @created 10/02/2017
 */

(function($, bbn, kendo){
  "use strict";

  Vue.component('bbn-progressbar2', {
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      /**
       * The value to be represented by the bar
       * @prop {Number} value
       */
      value: {
        type: Number,
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
      },
      height: {
        type: Number,
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
        chunkStyle : ''
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
          st += 'background-color: ' + this.barColor + ';border-color: '+ this.barColor
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
        st += 'width: 1.9em; min-height: ' + this.height + 'px'
      }
      this.orientationStyle = st;
      
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
     },
     watch: {
       chunknumber(val){
          if ( this.orientation === 'horizontal' ){
            this.chunkStyle += 'grid-template-columns:repeat(' + this.chunknumber + ', 1fr);grid-template-rows: 1fr';
          }
          else{
            this.chunkStyle += 'grid-template-rows:repeat(' + this.chunknumber + ',1fr);grid-template-columns: 1fr';
          }
        }
     }
    
  });

})(jQuery, bbn, kendo);
