/**
 * @file bbn-loader component
 *
 * @description The bbn-loader component has the purpose of graphically displaying a wait for the user with a simple implementation, asking to wait while something ends before being able to proceed.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 15/02/2017
 */

(function($, bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-loader', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      source: {
        type: [Object, Array],
        default: function(){
          return {};
        },
      },
      loadingText: {
        types: [String],
        default: 'Loading'
      },
      bgColor: {
        types: [String],
        default: ''
      },
      fontSize: {
        types: String,
        default: 's'
      },
    },
    data(){
      return{
        minHeight: false,
        fontClass: 'bbn-small',
        height: false,
      }
    },
    mounted(){
      if ( this.bgColor ){
        $(this.$el).css('background-color', this.bgColor)
      }
      },
    methods: {
      onResize(){
        this.height = $(this.$el).height();
        //bbn.fn.log("HEIGHT", this.height);
        let currentFont = this.fontClass,
            currentMinHeight = this.minHeight;
        if( this.height >= 500 ){
          this.minHeight = true;
          this.fontClass = 'bbn-xxl';
        }
        else if (  this.height > 250 && this.height < 500 ){
          this.minHeight = true;
          this.fontClass = 'bbn-medium'
        }
        else if ( this.height <= 250 ){
          this.minHeight = false;
          this.fontClass = 'bbn-small'
        }
        if ( (currentFont !== this.fontClass) || (currentMinHeight !== this.minHeight) ){
          this.$forceUpdate();
        }
      }
    },

    watch: {
      fontSize(val){
        if ( val === 's' ){
          this.fontClass = 'bbn-small'
        }
        else if ( val === 'm' ){
          this.fontClass = 'bbn-medium'
        }
        else if ( val === 'l' ){
          this.fontClass = 'bbn-large'
        }
        else if ( val === 'xl' ){
          this.fontClass = 'bbn-xl'
        }
      },
      bgColor(val){
        if ( val ){
          $(this.$el).css('background-color', val)
        }
      },

    }

  });

})(jQuery, bbn);
