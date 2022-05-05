((bbn) => {

let script_dep = document.createElement('script');
script_dep.setAttribute('src', 'https://cdn.jsdelivr.net/combine/gh/google/diff-match-patch@master/javascript/diff_match_patch.min.js,gh/jshint/jshint@2.13.4/dist/jshint.js,npm/jsonlint@1.6.3/web/jsonlint.js,npm/codemirror-minified@5.59.2/lib/codemirror.js,npm/codemirror-minified@5.59.2/addon/dialog/dialog.js,npm/codemirror-minified@5.59.2/addon/edit/matchbrackets.js,npm/codemirror-minified@5.59.2/addon/edit/matchtags.js,npm/codemirror-minified@5.59.2/addon/edit/closebrackets.js,npm/codemirror-minified@5.59.2/addon/edit/closetag.js,npm/codemirror-minified@5.59.2/addon/edit/trailingspace.js,npm/codemirror-minified@5.59.2/addon/edit/continuelist.js,npm/codemirror-minified@5.59.2/addon/runmode/colorize.js,npm/codemirror-minified@5.59.2/addon/search/search.js,npm/codemirror-minified@5.59.2/addon/search/searchcursor.js,npm/codemirror-minified@5.59.2/addon/fold/foldcode.js,npm/codemirror-minified@5.59.2/addon/fold/foldgutter.js,npm/codemirror-minified@5.59.2/addon/fold/brace-fold.js,npm/codemirror-minified@5.59.2/addon/fold/comment-fold.js,npm/codemirror-minified@5.59.2/addon/fold/xml-fold.js,npm/codemirror-minified@5.59.2/addon/fold/markdown-fold.js,npm/codemirror-minified@5.59.2/addon/fold/indent-fold.js,npm/codemirror-minified@5.59.2/addon/mode/overlay.js,npm/codemirror-minified@5.59.2/mode/meta.js,npm/codemirror-minified@5.59.2/addon/mode/multiplex.js,npm/codemirror-minified@5.59.2/addon/search/match-highlighter.js,npm/codemirror-minified@5.59.2/addon/search/jump-to-line.js,npm/codemirror-minified@5.59.2/addon/selection/active-line.js,npm/codemirror-minified@5.59.2/addon/runmode/runmode.js,npm/codemirror-minified@5.59.2/addon/selection/mark-selection.js,npm/codemirror-minified@5.59.2/addon/merge/merge.js,npm/codemirror-minified@5.59.2/addon/hint/show-hint.js,npm/codemirror-minified@5.59.2/addon/tern/tern.js,npm/codemirror-minified@5.59.2/mode/clike/clike.js,npm/codemirror-minified@5.59.2/mode/css/css.js,npm/codemirror-minified@5.59.2/mode/diff/diff.js,npm/codemirror-minified@5.59.2/mode/htmlmixed/htmlmixed.js,npm/codemirror-minified@5.59.2/mode/javascript/javascript.js,npm/codemirror-minified@5.59.2/mode/markdown/markdown.js,npm/codemirror-minified@5.59.2/mode/php/php.js,npm/codemirror-minified@5.59.2/mode/sql/sql.js,npm/codemirror-minified@5.59.2/mode/vue/vue.js,npm/codemirror-minified@5.59.2/mode/xml/xml.js,npm/codemirror-minified@5.59.2/mode/stex/stex.js,npm/codemirror-minified@5.59.2/mode/yaml/yaml.js,npm/codemirror-minified@5.59.2/addon/hint/html-hint.js,npm/codemirror-minified@5.59.2/addon/hint/css-hint.js,npm/codemirror-minified@5.59.2/addon/hint/sql-hint.js,npm/codemirror-minified@5.59.2/addon/hint/xml-hint.js,npm/codemirror-minified@5.59.2/addon/lint/lint.js,npm/codemirror-minified@5.59.2/addon/lint/javascript-lint.js,npm/codemirror-minified@5.59.2/addon/lint/json-lint.js,gh/Ionaru/easy-markdown-editor@2.15.0/dist/easymde.min.js');
script_dep.onload = () => {


let css_dependency;

css_dependency = document.createElement('link');
css_dependency.setAttribute('rel', 'stylesheet');
css_dependency.setAttribute('href', 'https://cdn.jsdelivr.net/combine/npm/codemirror-minified@5.59.2/lib/codemirror.css,npm/codemirror-minified@5.59.2/addon/dialog/dialog.css,npm/codemirror-minified@5.59.2/addon/lint/lint.css,npm/codemirror-minified@5.59.2/addon/fold/foldgutter.css,npm/codemirror-minified@5.59.2/addon/merge/merge.css,npm/codemirror-minified@5.59.2/addon/hint/show-hint.css,npm/codemirror-minified@5.59.2/addon/tern/tern.css,npm/codemirror-minified@5.59.2/theme/3024-day.css,npm/codemirror-minified@5.59.2/theme/3024-night.css,npm/codemirror-minified@5.59.2/theme/abcdef.css,npm/codemirror-minified@5.59.2/theme/ambiance-mobile.css,npm/codemirror-minified@5.59.2/theme/ambiance.css,npm/codemirror-minified@5.59.2/theme/base16-dark.css,npm/codemirror-minified@5.59.2/theme/base16-light.css,npm/codemirror-minified@5.59.2/theme/bespin.css,npm/codemirror-minified@5.59.2/theme/blackboard.css,npm/codemirror-minified@5.59.2/theme/cobalt.css,npm/codemirror-minified@5.59.2/theme/colorforth.css,npm/codemirror-minified@5.59.2/theme/dracula.css,npm/codemirror-minified@5.59.2/theme/duotone-dark.css,npm/codemirror-minified@5.59.2/theme/duotone-light.css,npm/codemirror-minified@5.59.2/theme/eclipse.css,npm/codemirror-minified@5.59.2/theme/elegant.css,npm/codemirror-minified@5.59.2/theme/erlang-dark.css,npm/codemirror-minified@5.59.2/theme/hopscotch.css,npm/codemirror-minified@5.59.2/theme/icecoder.css,npm/codemirror-minified@5.59.2/theme/isotope.css,npm/codemirror-minified@5.59.2/theme/lesser-dark.css,npm/codemirror-minified@5.59.2/theme/liquibyte.css,npm/codemirror-minified@5.59.2/theme/material.css,npm/codemirror-minified@5.59.2/theme/mbo.css,npm/codemirror-minified@5.59.2/theme/mdn-like.css,npm/codemirror-minified@5.59.2/theme/midnight.css,npm/codemirror-minified@5.59.2/theme/monokai.css,npm/codemirror-minified@5.59.2/theme/neat.css,npm/codemirror-minified@5.59.2/theme/neo.css,npm/codemirror-minified@5.59.2/theme/night.css,npm/codemirror-minified@5.59.2/theme/panda-syntax.css,npm/codemirror-minified@5.59.2/theme/paraiso-dark.css,npm/codemirror-minified@5.59.2/theme/paraiso-light.css,npm/codemirror-minified@5.59.2/theme/pastel-on-dark.css,npm/codemirror-minified@5.59.2/theme/railscasts.css,npm/codemirror-minified@5.59.2/theme/rubyblue.css,npm/codemirror-minified@5.59.2/theme/seti.css,npm/codemirror-minified@5.59.2/theme/solarized.css,npm/codemirror-minified@5.59.2/theme/the-matrix.css,npm/codemirror-minified@5.59.2/theme/tomorrow-night-bright.css,npm/codemirror-minified@5.59.2/theme/tomorrow-night-eighties.css,npm/codemirror-minified@5.59.2/theme/ttcn.css,npm/codemirror-minified@5.59.2/theme/twilight.css,npm/codemirror-minified@5.59.2/theme/vibrant-ink.css,npm/codemirror-minified@5.59.2/theme/xq-dark.css,npm/codemirror-minified@5.59.2/theme/xq-light.css,npm/codemirror-minified@5.59.2/theme/yeti.css,npm/codemirror-minified@5.59.2/theme/zenburn.css');
document.head.insertAdjacentElement('beforeend', css_dependency);


css_dependency = document.createElement('link');
css_dependency.setAttribute('rel', 'stylesheet');
css_dependency.setAttribute('href', 'https://cdn.jsdelivr.net/combine/gh/Ionaru/easy-markdown-editor@2.15.0/dist/easymde.min.css');
document.head.insertAdjacentElement('beforeend', css_dependency);


let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-textbox']"
     @keydown.enter.stop=""
>
  <textarea :value="value"
            :name="name"
            ref="element"
            :disabled="isDisabled"
            :required="required"
  ></textarea>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-markdown');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

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
        toolbar: this.toolBar || toolbar,
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

};
document.head.insertAdjacentElement("beforeend", script_dep);
})(bbn);