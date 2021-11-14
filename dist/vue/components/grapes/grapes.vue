<template>
<div :class="[componentClass, 'bbn-overlay']">
  <slot>
    <h2>Your content</h2>
    <h3>Comes here</h3>
  </slot>
</div>
</template>
<script>
  module.exports =  /**
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
    mixins: [bbn.vue.basicComponent],
    props: {
      css: {
        type: [String, Function]
      }
    },
    data(){
      return {
        widget: null
      }
    },
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

</script>
