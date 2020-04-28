<template>
<div :class="componentClass"
     @keydown.enter.stop=""
>
  <textarea :value="value"
            :name="name"
            ref="element"
            :disabled="disabled"
            :required="required"
  ></textarea>
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
(function(bbn, SimpleMDE){
  "use strict";

  Vue.component('bbn-markdown', {
    /**
     * @mixin bbn.vue.fullComponent 
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
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
      toolbar: {
        type: Array
      },
      //@todo not used
      hideIcons: {
        type: Array
      }
    },
    data(){
      return {
        widgetName: "SimpleMDE",
        autoDownloadFontAwesome: this.cfg.autoDownloadFontAwesome || false,
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
        if ( !v && !this.disabled ){
          this.$el.querySelector("div.editor-toolbar").display =  'block'
        }
        else {
          this.$el.querySelector("div.editor-toolbar").display =  'none'
        }
      }
    },
    watch: {
      disabled(newVal){
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
      this.widget = new SimpleMDE(bbn.fn.extend({
        element: this.$refs.element
      }, this.$data));
      this.widget.codemirror.on("change", () => {
        this.emitInput(this.widget.value());
      });
      if ( this.disabled ){
        this.disableWidget(true);
      }
      if ( this.readonly ){
        this.readonlyWidget(true);
      }
      this.ready = true;
    },

  });

})(bbn, SimpleMDE);
</script>
<style scoped>
.bbn-markdown .editor-toolbar a,
.bbn-markdown .editor-toolbar a.active,
.bbn-markdown .editor-toolbar a:hover {
  color: inherit !important;
}
.bbn-markdown .editor-preview-side {
  top: 0;
  position: absolute;
}

</style>
