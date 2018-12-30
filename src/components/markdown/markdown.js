/**
 * Created by BBN Solutions.
 * User: Loredana Bruno
 * Date: 20/02/17
 * Time: 16.21
 */


//Markdown editor use simpleMDe
(function($, bbn, SimpleMDE){
  "use strict";

  Vue.component('bbn-markdown', {
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      cfg: {
        type: Object,
        default(){
          return {
            autoDownloadFontAwesome: false,
            spellChecker: false,
            indentWithTabs: true,
            initialValue: '',
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
            tabSize: 2,
            toolbarTips: true,
            shortcuts: {
              drawTable: "Cmd-Alt-T"
            },

          };
        }
      },
      toolbar: {
        type: Array
      },
      hideIcons: {
        type: Array
      }
    },
    data(){
      return $.extend({
        widgetName: "SimpleMDE",
      }, bbn.vue.treatData(this));
    },
    methods: {
      test: function () {
        bbn.fn.log("test");
      },
      disableWidget(v){
        this.widget.codemirror.setOption('disableInput', !!v);
        if ( !v && !this.readonly ){
          this.widget.codemirror.setOption('readOnly', false);
          $("div.editor-toolbar", this.$el).show();
        }
        else {
          this.widget.codemirror.setOption('readOnly', true);
          $("div.editor-toolbar", this.$el).hide();
        }
      },
      readonlyWidget(v){
        this.widget.codemirror.setOption('readOnly', !!v);
        if ( !v && !this.disabled ){
          $("div.editor-toolbar", this.$el).show();
        }
        else {
          $("div.editor-toolbar", this.$el).hide();
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
      let cfg = $.extend(vm.getOptions(), {
        change: function(e){
          vm.emitInput(vm.widget.value());
          return true
        }
      });
      this.widget = new SimpleMDE($.extend({
        element: this.$refs.element
      }, this.getOptions()));
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

})(jQuery, bbn, SimpleMDE);