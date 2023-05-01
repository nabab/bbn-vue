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

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.resizer 
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.resizer
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
      text: {
        type: String,
        default: bbn._('Loading')
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
      type: {
        type: String,
        default: 'cube_grid',
        validator(v) {
          return ['plane', 'chase', 'bounce', 'wave', 'pulse', 'flow', 'swing', 'circle', 'circle_fade', 'grid', 'fold', 'wander', 'cube_grid'].includes(v);
        }
      }
    },
    data(){
      return{
        //@todo not used
        minHeight: true,
        //@todo not used
        height: false,
        currentType: this.type
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
    watch: {
      type(v) {
        this.currentType = v;
      }
    }

  };
