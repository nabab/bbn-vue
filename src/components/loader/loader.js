/**
 * Created by BBN on 15/02/2017.
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
      bgColor(val){
        if ( val ){
          $(this.$el).css('background-color', val)
        }
      },

    }

  });

})(jQuery, bbn);
