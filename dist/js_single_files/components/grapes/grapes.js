((bbn) => {
let script_dep = document.createElement('script');
script_dep.setAttribute('src', "https://cdn.jsdelivr.net/combine/gh/artf/grapesjs@v0.15.10/dist/grapes.min.js,gh/artf/grapesjs-blocks-basic@v0.1.8/dist/grapesjs-blocks-basic.min.js");
script_dep.onload = () => {

let css_dependency;
css_dependency = document.createElement('link');
css_dependency.setAttribute('rel', "stylesheet");
css_dependency.setAttribute('href', "https://cdn.jsdelivr.net/combine/gh/artf/grapesjs@v0.15.10/dist/css/grapes.min.css");
document.head.insertAdjacentElement('beforeend', css_dependency);
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-overlay']">
  <slot>
    <h2>Your content</h2>
    <h3>Comes here</h3>
  </slot>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-grapes');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
 /**
  * @file bbn-grapes component
  *
  * @description
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 10/02/2017
  */
(function(){
  "use strict";

  Vue.component('bbn-grapes', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * @prop {(String|Function)} css
       */
      css: {
        type: [String, Function]
      }
    },
    data(){
      return {
        /**
         * @data [null] widget
         */
        widget: null
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.widget = grapesjs.init({
        container: this.$el,
        fromElement: true,
        plugins: ['gjs-blocks-basic'],
        style: this.css || ''
      })
    }
  });

})();


};
document.head.insertAdjacentElement("beforeend", script_dep);
})(bbn);