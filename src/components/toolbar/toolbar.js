/**
 * @file bbn-toolbar component
 *
 * @description bbn-toolbar is an horizontal or vertical layout containing elements or components performing actions defined by the user.
 * Very useful for applications, simplifying navigation. Bbn-toolbar is responsive to its container.
 * A separator beetwen elements can be created by giving to empty div inside the toolbar the class 'toolbar-horizontal-separator' or 'toolbar-separator' 
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-toolbar', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      items: {
        type: Array
      },
      /**
       * The orientation of the bar.
       * @prop {String} ['horizontal'] orientation
       */
      orientation: {         
        type: String,
        default: 'horizontal'
      },
      /**
       * The size of the toolbar, height for horizontal toolbar and width for vertical toolbar.
       * @prop {String|Number} [60] size
       */
      size: {
        type: [Number, String], 
      },
    },
    data: function(){
      return {
        /**
         * The real size of the toolbar basing on the props size and orientation.
         * @data {String} [''] currentSize
         */
        currentSize: '',
        /**
         * The style of the toolbar.
         * @data {String} [''] style
         */
        style: ''
      }
    },
    /**
     * Defines the current size of the bar basing on its style. 
     * @event mounted
     */
    mounted(){
      if ( this.orientation ){
        if ( this.orientation === 'horizontal' ){
          if(this.size){
            if ( bbn.fn.isString(this.size) ){
              this.currentSize = this.size;
            }
            else if ( bbn.fn.isNumber(this.size) ){
              this.currentSize = this.size + 'px'
            }
            this.style += 'height:' + this. currentSize + ';';
          }
          else{
            this.style += '' 
          }
          
          
        }
        else if ( this.orientation === 'vertical' ){
          if(this.size){
            if ( bbn.fn.isString(this.size) ){
              this.currentSize = this.size;
            }
            else if ( bbn.fn.isNumber(this.size) ){
              this.currentSize = this.size + 'px'
            }
            this.style += 'width:' + this. currentSize + ';';
          }
          else{
            this.style += 'width:inherit;' 
          }
        }
        
      }
    },
  });

})(bbn);
