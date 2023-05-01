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
      name: "bold",
      className: "nf nf-fa-bold",
      title: bbn._("Bold"),
      action: EasyMDE.toggleBold
    },
    {
      name: "italic",
      className: "nf nf-fa-italic",
      title: bbn._("Italic"),
      action: EasyMDE.toggleItalic
    },
    {
      name: "heading",
      className: "nf nf-fa-header",
      title: bbn._("Heading"),
      children: [
        {
          name: "heading-1",
          className: "nf nf-md-format_header_1",
          title: bbn._("Heading") + " 1",
          action: EasyMDE.toggleHeading1
        }, {
          name: "heading-2",
          className: "nf nf-md-format_header_2",
          title: bbn._("Heading") + " 2",
          action: EasyMDE.toggleHeading2
        }, {
          name: "heading-3",
          className: "nf nf-md-format_header_3",
          title: bbn._("Heading") + " 3",
          action: EasyMDE.toggleHeading3
        }, {
          name: "heading-4",
          className: "nf nf-md-format_header_4",
          title: bbn._("Heading") + " 4",
          action: EasyMDE.toggleHeading4
        }, {
          name: "heading-5",
          className: "nf nf-md-format_header_5",
          title: bbn._("Heading") + " 5",
          action: EasyMDE.toggleHeading5
        }, {
          name: "heading-6",
          className: "nf nf-md-format_header_6",
          title: bbn._("Heading") + " 6",
          action: EasyMDE.toggleHeading6
        }
      ]
    },
    "|",
    {
      name: "quote",
      className: "nf nf-fa-quote_left",
      title: bbn._("Quote"),
      action: EasyMDE.toggleBlockquote
    },
    {
      name: "unordered-list",
      className: "nf nf-fa-list_ul",
      title: bbn._("Generic List"),
      action: EasyMDE.toggleUnorderedList
    },
    {
      name: "ordered-list",
      className: "nf nf-fa-list_ol",
      title: bbn._("Numbered List"),
      action: EasyMDE.toggleOrderedList
    },
    "|",
    {
      name: "link",
      className: "nf nf-fa-link",
      title: bbn._("Create Link"),
      action: EasyMDE.drawLink
    },
    {
      name: "image",
      className: "nf nf-fa-image",
      title: bbn._("Insert Image"),
      action: EasyMDE.drawImage
    },
    "|",
    {
      name: "preview",
      className: "nf nf-fa-eye no-disable",
      title: bbn._("Toggle Preview"),
      action: EasyMDE.togglePreview
    },
    {
      name: "side-by-side",
      className: "nf nf-fa-columns no-disable no-mobile",
      title: bbn._("Toggle Side by Side"),
      action: EasyMDE.toggleSideBySide,
      default: true
    },
    {
      name: "fullscreen",
      className: "nf nf-fa-arrows_alt no-disable no-mobile",
      title: bbn._("Toggle Fullscreen"),
      action: EasyMDE.toggleFullScreen
    },
    "|",
    {
      name: "guide",
      action: () => bbn.fn.link("https://simplemde.com/markdown-guide"),
      className: "nf nf-fa-question-circle",
      title: bbn._("Markdown Guide")
    },
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
        sideBySideFullscreen: false,
        nativeSpellcheck: this.cfg.nativeSpellCheck || false,
        spellChecker: this.cfg.spellChecker || false,
        indentWithTabs: this.cfg.indentWithTabs === undefined ? true : this.cfg.indentWithTabs,
        initialValue: this.value,
        insertTexts: {
          horizontalRule: ["", "\n\n-----\n\n"],
          image: ["![](https://", ")"],
          link: ["[", "](https://)"],
          table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
        },
        autoDownloadFontAwesome: false,
        renderingConfig: {
          singleLineBreaks: true,
          codeSyntaxHighlighting: true,
        },
        minHeight: "100px",
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
        return this.toolBar || toolbar;
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
        element: this.$refs.element,
        value: this.value,
      }, this.$data, {
        toolbar
      }));
      this.widget.codemirror.on("change", () => {
        bbn.fn.log
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