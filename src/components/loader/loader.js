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

(function(bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-loader', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent 
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.resizerComponent
    ],
    props: {
      //@todo not used
      source: {
        type: [Object, Array],
        default: function(){
          return {};
        },
      },
      /**
       * The text below the loader icon
       * @prop {String} ['Loading'] loadingText
       */
      loadingText: {
        type: String,
        default: 'Loading'
      },
      /**
       * The background color
       * @prop {String} [''] bgColor
       */
      bgColor: {
        type: String,
        default: ''
      },
      /**
       * The size of the font. Allowed values are 's', 'm', 'l', 'xl'
       * @prop {String} ['s'] fontSize
       */
      fontSize: {
        type: String,
        default: 's'
      },
    },
    data(){
      return{
        //@todo not used
        minHeight: true,
        //@todo not used
        height: false,
      }
    },
    mounted(){
      if ( this.bgColor ){
        this.$el.style.backgroundColor = this.bgColor;
      }
    },
    methods: {
      //@todo not used
      /*onResize(){
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
      }*/
    },
    computed: {
      /**
       * The css class corresponding to the prop fontSize
       * @computed fontClass
       * @return {String}
       */
      fontClass(){
        if ( this.fontSize === 's' ){
          return 'bbn-small'
        }
        else if ( this.fontSize === 'm' ){
          return 'bbn-medium'
        }
        else if ( this.fontSize === 'l' ){
          return  'bbn-large'
        }
        else if ( this.fontSize === 'xl' ){
          return  'bbn-xl'
        }
    
      }
    },

  });

})(bbn);
