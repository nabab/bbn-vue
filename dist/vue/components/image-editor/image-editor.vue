<template>
<div :class="[componentClass, 'bbn-overlay']">
  <div ref="element" class="bbn-100"/>
</div>
</template>
<script>
  module.exports = /**
 * @file bbn-markdown component
 *
 * @description bbn-markdown is a component that allows you to easily format the Markdown text.
 * It's an editor that enable you to create textual content, to insert lists, image management and hyperlinks.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */


//Markdown editor use simpleMDe
(function(bbn, tui) {
  "use strict";

  Vue.component('bbn-image-editor', {
    /**
     * @mixin bbn.vue.basicComponent 
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * @prop {String} source²
       */
      source: {
        type: String
      },
      /**
       * @prop {String} name
       */
      name: {
        type: String
      }
    },
    data(){
      return {
        widget: null
      };
    },
    methods: {
    },
    watch: {
    },
    mounted(){
      this.widget = new tui.ImageEditor(this.$refs.element, {
        includeUI: {
          locale: 'fr',
          initMenu: 'filter',
          menuBarPosition: 'bottom',
        },
        cssMaxWidth: 700,
        cssMaxHeight: 500,
      });
      this.widget.loadImageFromURL(this.source, this.name);

      this.ready = true;
    },

  });

})(bbn, tui);
</script>
<style scoped>
.bbn-image-editor {
  position: relative;
}

</style>
