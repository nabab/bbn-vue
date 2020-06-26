<template>
<div :class="['bbn-overlay', 'bbn-padded', 'bbn-middle', componentClass]"
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

</template>
<script>
  module.exports = /**
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

</script>
<style scoped>
div.bbn-loader {
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  background-color: black;
  color: white;
}
div.bbn-loader div.loader-animation {
  margin: auto auto;
}
div.bbn-loader div.loader-animation h1 {
  font-size: 3vmin;
  text-align: center;
  margin: 10px 0 0 0;
  color: white;
}
div.bbn-loader div.loader-animation .sk-cube-grid {
  width: 10vmin;
  height: 10vmin;
  margin: auto;
}
div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube {
  width: 33%;
  height: 33%;
  float: left;
  background-color: white;
  -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
  animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
}
div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube1 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube2 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube3 {
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
}
div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube4 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube5 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube6 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube7 {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
}
div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube8 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube9 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
@-webkit-keyframes sk-cubeGridScaleDelay {
  0%,
  70%,
  100% {
    -webkit-transform: scale3D(1,1,1);
    transform: scale3D(1,1,1);
  }
  35% {
    -webkit-transform: scale3D(0,0,1);
    transform: scale3D(0,0,1);
  }
}
@keyframes sk-cubeGridScaleDelay {
  0%,
  70%,
  100% {
    -webkit-transform: scale3D(1,1,1);
    transform: scale3D(1,1,1);
  }
  35% {
    -webkit-transform: scale3D(0,0,1);
    transform: scale3D(0,0,1);
  }
}
@-webkit-keyframes sk-cubeGridScaleDelay {
  0%,
  70%,
  100% {
    -webkit-transform: scale3D(1,1,1);
    transform: scale3D(1,1,1);
  }
  35% {
    -webkit-transform: scale3D(0,0,1);
    transform: scale3D(0,0,1);
  }
}
@keyframes sk-cubeGridScaleDelay {
  0%,
  70%,
  100% {
    -webkit-transform: scale3D(1,1,1);
    transform: scale3D(1,1,1);
  }
  35% {
    -webkit-transform: scale3D(0,0,1);
    transform: scale3D(0,0,1);
  }
}
@keyframes loading {
  0% {
    opacity: .2;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: .2;
  }
}
.dots span {
  animation-name: loading;
  animation-duration: 1.4s;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
}
.dots span:nth-child(2) {
  animation-delay: .2s;
}
.dots span:nth-child(3) {
  animation-delay: .4s;
}

</style>
