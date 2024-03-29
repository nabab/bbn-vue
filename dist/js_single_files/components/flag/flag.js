((bbn) => {

let css_dependency;

css_dependency = document.createElement('link');
css_dependency.setAttribute('rel', 'stylesheet');
css_dependency.setAttribute('href', 'https://cdn.jsdelivr.net/combine/gh/lipis/flag-icons@v4.1.4/css/flag-icons.min.css');
document.head.insertAdjacentElement('beforeend', css_dependency);


let script = document.createElement('script');
script.innerHTML = `<span :class="[componentClass, 'bbn-iblock']"
      :style="{
        width: currentWidth,
        height: currentHeight,
      }">
  <span :class="currentFlag"/>
</span>
`;
script.setAttribute('id', 'bbn-tpl-component-flag');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

/**
 * @file bbn-icon component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 */
(function() {
  "use strict";
  Vue.component('bbn-flag', {
    name: 'bbn-flag',
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      value: {
        type: String,
        required: true
      },
      width: {
        type: [Number, String]
      },
      height: {
        type: [Number, String]
      },
      square: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        dimensions: {
          xs: 16,
          s: 24,
          m: 32,
          l: 48,
          xl: 64,
          xxl: 128,
          xxxl: 256
        }
      }
    },
    computed: {
      currentFlag(){
        let code = this.value;
        if (code === 'en') {
          code = 'gb';
        }
        let st = 'flag-icon flag-icon-' + code;
        if (this.square) {
          st += ' flag-icon-squared';
        }

        return st;
      },
      currentWidth(){
        if (this.width) {
          if (bbn.fn.isNumber(this.width)) {
            return this.width + 'px';
          }

          if (this.dimensions[this.width]) {
            return this.dimensions[this.width] + 'px';
          }

          return this.width;
        }

        if (this.square && this.height) {
          return this.currentHeight;
        }

        if (this.height) {
          return 'auto';
        }

        return this.dimensions.m + 'px';
      },
      currentHeight(){
        if (this.height) {
          if (bbn.fn.isNumber(this.height)) {
            return this.height + 'px';
          }

          if (this.dimensions[this.height]) {
            return this.dimensions[this.height] + 'px';
          }

          return this.height;
        }

        if (this.square) {
          return this.currentWidth;
        }

        return 'auto';
      }
    }
  })
})();


})(bbn);