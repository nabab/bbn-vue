(bbn_resolve) => {
((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="['bbn-overlay', 'bbn-padded', 'bbn-middle', componentClass]"
     :style="'background-color:' + bgColor"   
>
  <div class="loader-animation">
    <div class="sk-cube-grid" v-show="minHeight">
      <div class="sk-cube sk-cube1"></div>
      <div class="sk-cube sk-cube2"></div>
      <div class="sk-cube sk-cube3"></div>
      <div class="sk-cube sk-cube4"></div>
      <div class="sk-cube sk-cube5"></div>
      <div class="sk-cube sk-cube6"></div>
      <div class="sk-cube sk-cube7"></div>
      <div class="sk-cube sk-cube8"></div>
      <div class="sk-cube sk-cube9"></div>
    </div>
    <h1 :class="'dots ' + fontClass"><span v-text="loadingText"></span><span>.</span><span>.</span><span>.</span></h1>

  </div>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-loader');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/loader/loader.css");
document.head.insertAdjacentElement('beforeend', css);
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
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
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

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}