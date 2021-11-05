((bbn) => {
let script_dep = document.createElement('script');
script_dep.setAttribute('src', "https://cdn.jsdelivr.net/combine/gh/nhn/tui.image-editor@v3.15.2/apps/image-editor/dist/tui-code-snippet.min.js,gh/nhn/tui.image-editor@v3.15.2/apps/image-editor/dist/tui-color-picker.min.js,gh/nhn/tui.image-editor@v3.15.2/apps/image-editor/dist/tui-image-editor.min.js");
script_dep.onload = () => {

let css_dependency;
css_dependency = document.createElement('link');
css_dependency.setAttribute('rel', "stylesheet");
css_dependency.setAttribute('href', "https://cdn.jsdelivr.net/combine/gh/nhn/tui.image-editor@v3.15.2/apps/image-editor/dist/tui-image-editor.min.css");
document.head.insertAdjacentElement('beforeend', css_dependency);
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-overlay']">
  <div ref="element" class="bbn-100"/>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-image-editor');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
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
      source: {
        type: String
      },
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

};
document.head.insertAdjacentElement("beforeend", script_dep);
})(bbn);