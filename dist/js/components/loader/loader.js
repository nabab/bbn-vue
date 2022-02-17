(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="['bbn-overlay', 'bbn-padded', 'bbn-middle', componentClass, 'bbn-alt-background']"
     :style="'background-color:' + bgColor"   
>
  <div class="loader-animation">
    <div class="bbn-block bbn-nl">
    <div class="sk-plane"
          v-if="currentType === 'plane'"/>

      <div class="sk-chase"
          v-else-if="currentType === 'chase'">
        <div class="sk-chase-dot"/>
        <div class="sk-chase-dot"/>
        <div class="sk-chase-dot"/>
        <div class="sk-chase-dot"/>
        <div class="sk-chase-dot"/>
        <div class="sk-chase-dot"/>
      </div>

      <div class="sk-bounce"
          v-else-if="currentType === 'bounce'">
        <div class="sk-bounce-dot"/>
        <div class="sk-bounce-dot"/>
      </div>

      <div class="sk-wave"
          v-else-if="currentType === 'wave'">
        <div class="sk-wave-rect"/>
        <div class="sk-wave-rect"/>
        <div class="sk-wave-rect"/>
        <div class="sk-wave-rect"/>
        <div class="sk-wave-rect"/>
      </div>

      <div class="sk-pulse"
          v-else-if="currentType === 'pulse'"/>

      <div class="sk-flow"
          v-else-if="currentType === 'flow'">
        <div class="sk-flow-dot"/>
        <div class="sk-flow-dot"/>
        <div class="sk-flow-dot"/>
      </div>

      <div class="sk-swing"
          v-else-if="currentType === 'swing'">
        <div class="sk-swing-dot"/>
        <div class="sk-swing-dot"/>
      </div>

      <div class="sk-circle"
          v-else-if="currentType === 'circle'">
        <div class="sk-circle-dot"/>
        <div class="sk-circle-dot"/>
        <div class="sk-circle-dot"/>
        <div class="sk-circle-dot"/>
        <div class="sk-circle-dot"/>
        <div class="sk-circle-dot"/>
        <div class="sk-circle-dot"/>
        <div class="sk-circle-dot"/>
        <div class="sk-circle-dot"/>
        <div class="sk-circle-dot"/>
        <div class="sk-circle-dot"/>
        <div class="sk-circle-dot"/>
      </div>

      <div class="sk-circle-fade"
          v-else-if="currentType === 'circle_fade'">
        <div class="sk-circle-fade-dot"/>
        <div class="sk-circle-fade-dot"/>
        <div class="sk-circle-fade-dot"/>
        <div class="sk-circle-fade-dot"/>
        <div class="sk-circle-fade-dot"/>
        <div class="sk-circle-fade-dot"/>
        <div class="sk-circle-fade-dot"/>
        <div class="sk-circle-fade-dot"/>
        <div class="sk-circle-fade-dot"/>
        <div class="sk-circle-fade-dot"/>
        <div class="sk-circle-fade-dot"/>
        <div class="sk-circle-fade-dot"/>
      </div>

      <div class="sk-grid"
          v-else-if="currentType === 'grid'">
        <div class="sk-grid-cube"/>
        <div class="sk-grid-cube"/>
        <div class="sk-grid-cube"/>
        <div class="sk-grid-cube"/>
        <div class="sk-grid-cube"/>
        <div class="sk-grid-cube"/>
        <div class="sk-grid-cube"/>
        <div class="sk-grid-cube"/>
        <div class="sk-grid-cube"/>
      </div>

      <div class="sk-fold"
          v-else-if="currentType === 'fold'">
        <div class="sk-fold-cube"/>
        <div class="sk-fold-cube"/>
        <div class="sk-fold-cube"/>
        <div class="sk-fold-cube"/>
      </div>

      <div class="sk-wander"
          v-else-if="currentType === 'wander'">
        <div class="sk-wander-cube"/>
        <div class="sk-wander-cube"/>
        <div class="sk-wander-cube"/>
        <div class="sk-wander-cube"/>
      </div>

      <div class="sk-cube-grid"
          v-else
          v-show="minHeight">
        <div class="sk-cube sk-cube1"/>
        <div class="sk-cube sk-cube2"/>
        <div class="sk-cube sk-cube3"/>
        <div class="sk-cube sk-cube4"/>
        <div class="sk-cube sk-cube5"/>
        <div class="sk-cube sk-cube6"/>
        <div class="sk-cube sk-cube7"/>
        <div class="sk-cube sk-cube8"/>
        <div class="sk-cube sk-cube9"/>
      </div>
    </div>
    <h1 v-if="text"
        :class="'dots ' + fontClass">
      <span v-text="text"/><span>.</span><span>.</span><span>.</span>
    </h1>

  </div>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-loader');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/loader/loader.css');
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

  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}