<template>
<div :class="[componentClass, 'bbn-textbox']"
     @keydown.enter.stop="">
  <div v-if="readonly"
       v-html="compiled"/>
  <textarea v-else
            :value="value"
            :name="name"
            ref="element"
            :disabled="isDisabled"
            :required="required"/>
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
(function(bbn, EasyMDE){
  "use strict";

  const toolbar = [
    {
      "name": "bold",
      "className": "nf nf-fa-bold",
      "title": bbn._("Bold"),
      "default": true
    },
    {
      "name": "italic",
      "className": "nf nf-fa-italic",
      "title": bbn._("Italic"),
      "default": true
    },
    {
      "name": "heading",
      "className": "nf nf-fa-header",
      "title": bbn._("Heading"),
      "default": true
    },
    "|",
    {
      "name": "quote",
      "className": "nf nf-fa-quote_left",
      "title": bbn._("Quote"),
      "default": true
    },
    {
      "name": "unordered-list",
      "className": "nf nf-fa-list_ul",
      "title": bbn._("Generic List"),
      "default": true
    },
    {
      "name": "ordered-list",
      "className": "nf nf-fa-list_ol",
      "title": bbn._("Numbered List"),
      "default": true
    },
    "|",
    {
      "name": "link",
      "className": "nf nf-fa-link",
      "title": bbn._("Create Link"),
      "default": true
    },
    {
      "name": "image",
      "className": "nf nf-fa-image",
      "title": bbn._("Insert Image"),
      "default": true
    },
    "|",
    {
      "name": "preview",
      "className": "nf nf-fa-eye no-disable",
      "title": bbn._("Toggle Preview"),
      "default": true
    },
    {
      "name": "side-by-side",
      "className": "nf nf-fa-columns no-disable no-mobile",
      "title": bbn._("Toggle Side by Side"),
      "default": true
    },
    {
      "name": "fullscreen",
      "className": "nf nf-fa-arrows_alt no-disable no-mobile",
      "title": bbn._("Toggle Fullscreen"),
      "default": true
    }/*,
    "|",
    {
      "name": "guide",
      "action": "https://simplemde.com/markdown-guide",
      "className": "nf nf-fa-question-circle",
      "title": bbn._("Markdown Guide"),
      "default": true
    },
    "|" */
  ];

  Vue.component('bbn-markdown', {
    /**
     * @mixin bbn.vue.basicComponent 
     * @mixin bbn.vue.inputComponent 
     * @mixin bbn.vue.eventsComponent 
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.inputComponent, 
      bbn.vue.eventsComponent
    ],
    props: {
      /**
       * The object of configuration
       * @prop {Object} cfg
       */
      cfg: {
        type: Object,
        default(){
          return {};
        }
      },
      //@todo not used
      toolBar: {
        type: Array
      },
      //@todo not used
      hideIcons: {
        type: Array
      }
    },
    data(){
      return {
        widgetName: "EasyMDE",
        nativeSpellcheck: this.cfg.nativeSpellCheck || false,
        spellChecker: this.cfg.spellChecker || false,
        indentWithTabs: this.cfg.indentWithTabs === undefined ? true : this.cfg.indentWithTabs,
        initialValue: this.cfg.initialValue || '',
        insertTexts: {
          horizontalRule: ["", "\n\n-----\n\n"],
          image: ["![](http://", ")"],
          link: ["[", "](http://)"],
          table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
        },
        renderingConfig: {
          singleLineBreaks: true,
          codeSyntaxHighlighting: true,
        },
        status: false,
        tabSize: this.cfg.tabSize || 2,
        toolbarTips: true,
        shortcuts: {
          drawTable: "Cmd-Alt-T"
        }
      };
    },
    computed: {
      compiled() {
        return marked.parse(this.value);
      },
      toolbar() {
        if (this.readonly) {
          return false;
        }
        return this.toolBar || bbnMarkdownCreator.toolbar;
      }
    },
    methods: {
      disableWidget(v){
        this.widget.codemirror.setOption('disableInput', !!v);
        if ( !v && !this.readonly ){
          this.widget.codemirror.setOption('readOnly', false);
          this.$el.querySelector("div.editor-toolbar").display =  'block'
        }
        else {
          this.widget.codemirror.setOption('readOnly', true);
          this.$el.querySelector("div.editor-toolbar").display =  'none'
        }
      },
      readonlyWidget(v){
        this.widget.codemirror.setOption('readOnly', !!v);
        if ( !v && !this.isDisabled ){
          this.$el.querySelector("div.editor-toolbar").display =  'block'
        }
        else {
          this.$el.querySelector("div.editor-toolbar").display =  'none'
        }
      }
    },
    watch: {
      isDisabled(newVal){
        this.disableWidget(newVal);
      },
      readonly(newVal){
        this.readonlyWidget(newVal);
      }
    },
    mounted(){
      const vm = this;
      /*let cfg = bbn.fn.extend(vm.getOptions(), {
        change: function(e){
          vm.emitInput(vm.widget.value());
          return true
        }
      });*/
      this.widget = new EasyMDE(bbn.fn.extend({
        element: this.$refs.element
      }, {
        toolbar
      }));
      this.widget.codemirror.on("change", () => {
        this.emitInput(this.widget.value());
      });
      if ( this.isDisabled ){
        this.disableWidget(true);
      }
      if ( this.readonly ){
        this.readonlyWidget(true);
      }
      this.ready = true;
    },

  });

})(bbn, EasyMDE);
</script>
<style scoped>
.bbn-markdown .editor-preview-side {
  top: 0;
  position: absolute;
}
.bbn-markdown .CodeMirror-vscrollbar,
.bbn-markdown .CodeMirror-hscrollbar {
  display: none !important;
}
.bbn-markdown .CodeMirror-scroll {
  margin: 0px;
  padding: 0px;
}

</style>
