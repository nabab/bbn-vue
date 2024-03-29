(bbn_resolve) => {
((bbn) => {

let script_dep = document.createElement('script');
script_dep.setAttribute('src', 'https://cdn.jsdelivr.net/combine/gh/acornjs/acorn@v8.5.0/dist/acorn.js,gh/acornjs/acorn@v8.5.0/dist/acorn-loose.js,gh/acornjs/acorn@v8.5.0/dist/walk.js,gh/ternjs/tern@0.21.0/doc/demo/polyfill.js,gh/ternjs/tern@0.21.0/lib/signal.js,gh/ternjs/tern@0.21.0/lib/tern.js,gh/ternjs/tern@0.21.0/lib/def.js,gh/ternjs/tern@0.21.0/lib/comment.js,gh/ternjs/tern@0.21.0/lib/infer.js,gh/ternjs/tern@0.21.0/plugin/doc_comment.js,gh/google/diff-match-patch@master/javascript/diff_match_patch.min.js,gh/jshint/jshint@2.13.4/dist/jshint.js,npm/jsonlint@1.6.3/web/jsonlint.js,npm/codemirror-minified@5.59.2/lib/codemirror.js,npm/codemirror-minified@5.59.2/addon/dialog/dialog.js,npm/codemirror-minified@5.59.2/addon/edit/matchbrackets.js,npm/codemirror-minified@5.59.2/addon/edit/matchtags.js,npm/codemirror-minified@5.59.2/addon/edit/closebrackets.js,npm/codemirror-minified@5.59.2/addon/edit/closetag.js,npm/codemirror-minified@5.59.2/addon/edit/trailingspace.js,npm/codemirror-minified@5.59.2/addon/edit/continuelist.js,npm/codemirror-minified@5.59.2/addon/runmode/colorize.js,npm/codemirror-minified@5.59.2/addon/search/search.js,npm/codemirror-minified@5.59.2/addon/search/searchcursor.js,npm/codemirror-minified@5.59.2/addon/fold/foldcode.js,npm/codemirror-minified@5.59.2/addon/fold/foldgutter.js,npm/codemirror-minified@5.59.2/addon/fold/brace-fold.js,npm/codemirror-minified@5.59.2/addon/fold/comment-fold.js,npm/codemirror-minified@5.59.2/addon/fold/xml-fold.js,npm/codemirror-minified@5.59.2/addon/fold/markdown-fold.js,npm/codemirror-minified@5.59.2/addon/fold/indent-fold.js,npm/codemirror-minified@5.59.2/addon/mode/overlay.js,npm/codemirror-minified@5.59.2/mode/meta.js,npm/codemirror-minified@5.59.2/addon/mode/multiplex.js,npm/codemirror-minified@5.59.2/addon/search/match-highlighter.js,npm/codemirror-minified@5.59.2/addon/search/jump-to-line.js,npm/codemirror-minified@5.59.2/addon/selection/active-line.js,npm/codemirror-minified@5.59.2/addon/runmode/runmode.js,npm/codemirror-minified@5.59.2/addon/selection/mark-selection.js,npm/codemirror-minified@5.59.2/addon/merge/merge.js,npm/codemirror-minified@5.59.2/addon/hint/show-hint.js,npm/codemirror-minified@5.59.2/addon/tern/tern.js,npm/codemirror-minified@5.59.2/mode/clike/clike.js,npm/codemirror-minified@5.59.2/mode/css/css.js,npm/codemirror-minified@5.59.2/mode/diff/diff.js,npm/codemirror-minified@5.59.2/mode/htmlmixed/htmlmixed.js,npm/codemirror-minified@5.59.2/mode/javascript/javascript.js,npm/codemirror-minified@5.59.2/mode/markdown/markdown.js,npm/codemirror-minified@5.59.2/mode/php/php.js,npm/codemirror-minified@5.59.2/mode/sql/sql.js,npm/codemirror-minified@5.59.2/mode/vue/vue.js,npm/codemirror-minified@5.59.2/mode/xml/xml.js,npm/codemirror-minified@5.59.2/mode/stex/stex.js,npm/codemirror-minified@5.59.2/mode/yaml/yaml.js,npm/codemirror-minified@5.59.2/addon/hint/html-hint.js,npm/codemirror-minified@5.59.2/addon/hint/css-hint.js,npm/codemirror-minified@5.59.2/addon/hint/sql-hint.js,npm/codemirror-minified@5.59.2/addon/hint/xml-hint.js,npm/codemirror-minified@5.59.2/addon/lint/lint.js,npm/codemirror-minified@5.59.2/addon/lint/javascript-lint.js,npm/codemirror-minified@5.59.2/addon/lint/json-lint.js');
script_dep.onload = () => {


let css_dependency;

css_dependency = document.createElement('link');
css_dependency.setAttribute('rel', 'stylesheet');
css_dependency.setAttribute('href', 'https://cdn.jsdelivr.net/combine/npm/codemirror-minified@5.59.2/lib/codemirror.css,npm/codemirror-minified@5.59.2/addon/dialog/dialog.css,npm/codemirror-minified@5.59.2/addon/lint/lint.css,npm/codemirror-minified@5.59.2/addon/fold/foldgutter.css,npm/codemirror-minified@5.59.2/addon/merge/merge.css,npm/codemirror-minified@5.59.2/addon/hint/show-hint.css,npm/codemirror-minified@5.59.2/addon/tern/tern.css,npm/codemirror-minified@5.59.2/theme/3024-day.css,npm/codemirror-minified@5.59.2/theme/3024-night.css,npm/codemirror-minified@5.59.2/theme/abcdef.css,npm/codemirror-minified@5.59.2/theme/ambiance-mobile.css,npm/codemirror-minified@5.59.2/theme/ambiance.css,npm/codemirror-minified@5.59.2/theme/base16-dark.css,npm/codemirror-minified@5.59.2/theme/base16-light.css,npm/codemirror-minified@5.59.2/theme/bespin.css,npm/codemirror-minified@5.59.2/theme/blackboard.css,npm/codemirror-minified@5.59.2/theme/cobalt.css,npm/codemirror-minified@5.59.2/theme/colorforth.css,npm/codemirror-minified@5.59.2/theme/dracula.css,npm/codemirror-minified@5.59.2/theme/duotone-dark.css,npm/codemirror-minified@5.59.2/theme/duotone-light.css,npm/codemirror-minified@5.59.2/theme/eclipse.css,npm/codemirror-minified@5.59.2/theme/elegant.css,npm/codemirror-minified@5.59.2/theme/erlang-dark.css,npm/codemirror-minified@5.59.2/theme/hopscotch.css,npm/codemirror-minified@5.59.2/theme/icecoder.css,npm/codemirror-minified@5.59.2/theme/isotope.css,npm/codemirror-minified@5.59.2/theme/lesser-dark.css,npm/codemirror-minified@5.59.2/theme/liquibyte.css,npm/codemirror-minified@5.59.2/theme/material.css,npm/codemirror-minified@5.59.2/theme/mbo.css,npm/codemirror-minified@5.59.2/theme/mdn-like.css,npm/codemirror-minified@5.59.2/theme/midnight.css,npm/codemirror-minified@5.59.2/theme/monokai.css,npm/codemirror-minified@5.59.2/theme/neat.css,npm/codemirror-minified@5.59.2/theme/neo.css,npm/codemirror-minified@5.59.2/theme/night.css,npm/codemirror-minified@5.59.2/theme/panda-syntax.css,npm/codemirror-minified@5.59.2/theme/paraiso-dark.css,npm/codemirror-minified@5.59.2/theme/paraiso-light.css,npm/codemirror-minified@5.59.2/theme/pastel-on-dark.css,npm/codemirror-minified@5.59.2/theme/railscasts.css,npm/codemirror-minified@5.59.2/theme/rubyblue.css,npm/codemirror-minified@5.59.2/theme/seti.css,npm/codemirror-minified@5.59.2/theme/solarized.css,npm/codemirror-minified@5.59.2/theme/the-matrix.css,npm/codemirror-minified@5.59.2/theme/tomorrow-night-bright.css,npm/codemirror-minified@5.59.2/theme/tomorrow-night-eighties.css,npm/codemirror-minified@5.59.2/theme/ttcn.css,npm/codemirror-minified@5.59.2/theme/twilight.css,npm/codemirror-minified@5.59.2/theme/vibrant-ink.css,npm/codemirror-minified@5.59.2/theme/xq-dark.css,npm/codemirror-minified@5.59.2/theme/xq-light.css,npm/codemirror-minified@5.59.2/theme/yeti.css,npm/codemirror-minified@5.59.2/theme/zenburn.css');
document.head.insertAdjacentElement('beforeend', css_dependency);


let script = document.createElement('script');
script.innerHTML = `<div :class="[
     {
        'bbn-reset': true,
        'bbn-overlay': isFullScreen || !!fill
     },
     componentClass
     ]"
     @keydown.enter.stop=""
     @keydown.escape.stop="toggleFullScreen(false)"
>
  <div :class="fill ? 'bbn-code-filled' : ''"
       ref="code"
       @keydown.escape.stop="toggleFullScreen(false)"/>
  <input ref="element"
        type="hidden"
        :value="value"
        :name="name"
        :disabled="isDisabled"
        :required="required">
  <div class="bbn-bg-black bbn-p bbn-middle theme-button"
      v-if="themeButton"
      ref="theme_button">
    <i class="nf nf-fa-bars" @click="nextTheme"/>
  </div>
  <bbn-scrollbar v-if="fill && ready && $el"
                orientation="vertical"
                ref="scrollbar"
                :container="$el.querySelector('.CodeMirror-scroll')"/>
  <bbn-floater ref="fn"
               :source="currentFn"
               v-if="currentFn"
               :component="$options.components.fnHelper"
               :left="floaterLeft"
               :top="floaterTop"
               :right="floaterRight"
               :bottom="floaterBottom"
               @close="currentFn = false"
               :focused="false"/>
  <bbn-floater ref="hints"
               :source="currentHints"
               v-else-if="currentHints.length"
               source-text="name"
               source-value="name"
               :left="floaterLeft"
               :top="floaterTop"
               :right="floaterRight"
               :bottom="floaterBottom"
               :suggest="floaterBottom ? currentHints.length - 1 : 0"
               children="none"
               :item-component="$options.components.suggestion"
               @select="selectHint"
               :focused="false"/>

</div>
`;
script.setAttribute('id', 'bbn-tpl-component-code');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/code/code.css');
document.head.insertAdjacentElement('beforeend', css);

/*jshint esversion: 6 */
/**
 * @file bbn-code component
 *
 * @description bbn-code is a text editor.
 * It specializes in editing the code of a supported language.
 * Various tools are provided to the users, which can be configured to their liking.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */


(bbn => {
  "use strict";

  const themes = ["3024-day","3024-night","ambiance-mobile","ambiance","base16-dark","base16-light","blackboard","cobalt","eclipse","elegant","erlang-dark","lesser-dark","mbo","midnight","monokai","neat","night","paraiso-dark","paraiso-light","pastel-on-dark","rubyblue","solarized","the-matrix","tomorrow-night-eighties","twilight","vibrant-ink","xq-dark","xq-light"];

  const baseCfg = {
    scrollbarStyle:null,
    lineNumbers: true,
    tabSize: 2,
    //value: "",
    lineWrapping: true,
    //readOnly: false,
    matchBrackets: true,
    autoCloseBrackets: true,
    showTrailingSpace: true,
    styleActiveLine: true,
    save: false,
    /*
    keydown: false,
    change: false,
    changeFromOriginal: false,
    */
    foldGutter: true,
    selections: [],
    marks: [],
    gutters: [
      "CodeMirror-linenumbers",
      "CodeMirror-foldgutter"
    ],
    extraKeys: {
      "Ctrl-Alt-S": function(cm){
        if (bbn.fn.isFunction(cm.options.save) ){
          cm.options.save(cm);
        }
      },
      "Ctrl-S": function(cm){
        if (bbn.fn.isFunction(cm.options.save) ){
          cm.options.save(cm);
        }
      },
      "Ctrl-Alt-T": function(cm){
        if (bbn.fn.isFunction(cm.options.test) ){
          cm.options.test(cm);
        }
      },
      "F11": function(cm) {
        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
      },
      "Esc": function(cm) {
        if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
      }
    }
  };

  const modes = {
    php: {
      mode: {
        name: 'php',
        htmlMode: {
          name: 'htmlmixed',
          tags: {
            script: [
              ["type", /^text\/(x-)?template$/, 'htmlmixed'],
              ["type", /^text\/html$/, 'htmlmixed']
            ],
            style: [
              ["type", /^text\/(x-)?less$/, 'text/x-less'],
              ["type", /^text\/(x-)?scss$/, 'text/x-scss'],
              [null, null, {name: 'css'}]
            ],
          }
        },
      },
      autoCloseBrackets: true,
      autoCloseTags: true,
      extraKeys: {
        "Ctrl-Space": "autocomplete",
        "Ctrl-J": "toMatchingTag",
      }
    },
    html: {
      mode: {
        name: 'htmlmixed',
        tags: {
          script: [
            ["type", /^text\/(x-)?template$/, 'htmlmixed'],
            ["type", /^text\/html$/, 'htmlmixed']
          ],
          style: [
            ["type", /^text\/(x-)?less$/, 'text/x-less'],
            ["type", /^text\/(x-)?scss$/, 'text/x-scss'],
            [null, null, {name: 'css'}]
          ],
        },
      },
      autoCloseTags: true,
      extraKeys: {
        "Ctrl-Space": "autocomplete",
        "Ctrl-J": "toMatchingTag"
      }
    },
    js: {
      mode: {
        name: 'javascript'
      },
      gutters: ["CodeMirror-lint-markers"],
      lint: {
        esversion: 8
      },
      /*
      lintWith: window.jslint || CodeMirror.lint.javascript,
      */
      autoCloseBrackets: true,
      /*extraKeys: {
        "Ctrl-Space": function(cm) { bbn.vue.tern.complete(cm);},
        "Ctrl-I": function(cm) { bbn.vue.tern.showType(cm); },
        "Ctrl-O": function(cm) { bbn.vue.tern.showDocs(cm); },
        "Alt-.": function(cm) { bbn.vue.tern.jumpToDef(cm); },
        "Alt-,": function(cm) { bbn.vue.tern.jumpBack(cm); },
        "Ctrl-Q": function(cm) { bbn.vue.tern.rename(cm); },
        "Ctrl-.": function(cm) { bbn.vue.tern.selectName(cm); }

      },*/
      extraKeys: {
        "Ctrl-Space": "autocomplete",
        "Ctrl-J": "toMatchingTag"
      }
    },
    json: {
      mode: {
        name: 'javascript',
        json: true
      }
    },
    css: {
      mode: 'text/css',
      extraKeys: {
        "Ctrl-Space": "autocomplete",
      }
    },
    less: {
      mode: "text/x-less",
      extraKeys: {
        "Ctrl-Space": "autocomplete",
      }
    },
    scss: {
      mode: "text/x-scss",
      extraKeys: {
        "Ctrl-Space": "autocomplete",
      }
    },
    vue: {
      mode: "text/x-vue",
      extraKeys: {
        "Ctrl-Space": "autocomplete",
      }
    }
  };

  let themeIndex = themes.indexOf(bbn.vue.defaults.code.defaultTheme);

  Vue.component('bbn-code', {
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
       * The ecmascript version.
       *
       * @prop {Number} [6] ecma
       */
      ecma: {
        type: Number,
        default: 6
      },
      /**
       * The language mode.
       *
       * @prop {(String|Object)} ['php'] mode
       */
      mode: {
        type: [String, Object],
        default: 'php'
      },
      /**
       * Defines the style of the editor.
       *
       * @prop {String} theme
       */
      theme: {
        type: String,
        default: 'pastel-on-dark'
      },
      /**
       * Takes the full height of the container if set to true.
       *
       * @prop {Boolean} [true] fill
       */
      fill: {
        type: Boolean,
        default: true
      },
      /**
       * Configuration object.
       *
       * @prop {Object} cfg
       */
      cfg: {
        type: Object,
        default: function(){
          return baseCfg;
        }
      },
      /**
       * Set to true to display a button that can change the theme of the component.
       *
       * @prop {Boolean} [false] themeButton
       */
      themeButton: {
        type: Boolean,
        default: false
      },
      definitionUrl: {
        type: String,
        default: ''
      }
    },

    data(){
      return {
        /**
         * @todo not used
         */
        widget: null,
        /**
         * True if the editor is fullscreen.
         * @data {Boolan} [false] isFullScreen
         */
        isFullScreen: false,
        currentHints: [],
        hintTimeout: false,
        floaterLeft: null,
        floaterRight: null,
        floaterTop: null,
        floaterBottom: null,
        currentFn: false,
        currentToken: false,
        eventKey: "",
      };
    },

    computed: {
      /**
       * If the property theme is not defined, the default theme is returned.
       *
       * @computed currentTheme
       * @return {String}
       */
      currentTheme(){
        return this.theme ? this.theme : this.defaultTheme;
      }
    },

    methods: {
      scrollTop(bottom){
        let sc = this.getRef('scrollbar');
        if (sc) {
          sc.onResize();
          if (sc.shouldBother) {
            sc.scrollTo(bottom ? '100%' : 0);
          }
        }
      },
      scrollBottom() {
        this.scrollTop(true);
      },
      /**
       * Gets the preset options for the given mode from the constant modes.
       *
       * @method getMode
       * @param {String} mode
       * @return {Object | Boolean}
       */
      getMode(mode){
        if ( modes[mode] ){
          let o = bbn.fn.clone( modes[mode]);
          o.gutters = [
            "CodeMirror-linenumbers",
            "CodeMirror-foldgutter"
          ];
          if ( o.lint ){
            o.gutters = ["CodeMirror-lint-markers"];
          }
          return o;
        }
        return false;
      },
      /**
       * Gets the options for the editor.
       *
       * @method getOptions
       * @fires getMode
       * @return {Object}
       */
      getOptions(){
        let tmp;
        let cfg = bbn.fn.extend(
          {},
          baseCfg,
          {
            mode: this.mode,
            theme: this.currentTheme,
            value: this.value
          },
          this.cfg
        );
        if (!this.scrollable) {
          cfg.height = 'auto';
        }
        if ( this.readonly || this.isDisabled ){
          cfg.readOnly = true;
        }

        tmp = this.getMode(this.mode)
        if (tmp){
          bbn.fn.extend(true, cfg, tmp);
        }

        return cfg;
      },
      /**
       * Places the cursor at a defined point.
       *
       * @method cursorPosition
       * @param {Number} lineCode
       * @param {Number} position
       * @return {Boolean}
       */
      cursorPosition(lineCode, position){
        let ctrl = false;
        if ( lineCode <= this.widget.doc.lineCount()-1 ){
          if ( position <= this.widget.doc.lineInfo(lineCode).text.length ){
            ctrl = true;
          }
        }
        if ( ctrl ){
          this.$nextTick(() => {
            //bbn.fn.log("FOCUS ON METHOD CURSOR POSITION");
            this.widget.focus();
            this.widget.setCursor({line: lineCode, ch: position});
          });
        }
        else{
          return false
        }
      },
      /**
       * Returns an object with the selections, marks, folding and value.
       *
       * @method getState
       * @return {Object | Boolean}
       */
      getState(){
        if ( this.widget ){
          let doc = this.widget.getDoc(),
              selections = doc.listSelections(),
              marks = doc.getAllMarks(),
              info = doc.getCursor(),
              res = {
                selections: [],
                marks: [],
                line: info.line,
                char: info.ch
              };
          if ( marks ){
            // We reverse the array in order to start in the last folded parts in case of nesting
            for ( let i = marks.length - 1; i >= 0; i-- ){
              if ( marks[i].collapsed && (marks[i].type === 'range') ){
                res.marks.push(marks[i].find().from);
              }
            }
          }
          if ( selections ){
            bbn.fn.each(selections, a => {
              res.selections.push({anchor: a.anchor, head: a.head});
            });
          }
          return res;
        }
        return false;
      },
      /**
       * Loads the state, such as the last state saved.
       *
       * @method loadState
       * @param {Object} obj
       * @fires cursorPosition
       */
      loadState( obj ){
        this.widget.focus();
        let doc = this.widget.getDoc();
        if ( obj.marks && obj.marks.length ){
          for(let mark of obj.marks){
            this.widget.foldCode(mark.line, 0);
          }
        }
        if( obj.line > 0 || obj.char > 0 ){
          this.cursorPosition(obj.line, obj.char);
        }
        else{
          if ( obj.selections && obj.selections.length && (obj.line === 0 && obj.char === 0) ){
            for ( let i = 0; i < obj.selections.length; i++ ){
              doc.setSelection(obj.selections);
            }
          }
        }
      },
      /**
       * If the property themeButton is set to true, clicking the button will change the theme of the editor.
       * @method nextTheme
       */
      nextTheme(){
        themeIndex++;
        if ( themeIndex >= themes.length ){
          themeIndex = 0;
        }
        bbn.vue.defaults.code.theme = themes[themeIndex];
        //this.theme = themes[themeIndex];
        this.widget.setOption("theme", themes[themeIndex]);
      },
      /**
       * Folds the given level.
       *
       * @method foldByLevel
       * @param {Number} level
       * @fires foldByLevelRec
       * @fires foldByNodeOrder
       */
      foldByLevel(level) {
        this.foldByNodeOrder(0);
        // initialize vars
        var cursor = this.widget.getCursor();
        cursor.ch = 0;
        cursor.line = 0;
        var range = this.widget.getViewport();
        this.foldByLevelRec(cursor, range, level);
      },
      /**
       * @method foldByLevelRec
       * @param {Number} cursor
       * @param {Object} range
       * @param {Number} level
       */
      foldByLevelRec(cursor, range, level) {
        if (level > 0) {
          var searcher = this.widget.getSearchCursor("<", cursor, false);
          while (searcher.findNext() && searcher.pos.from.line < range.to) {
            // unfold the tag
            this.widget.foldCode(searcher.pos.from, null, "unfold");
            // move the cursor into the tag
            cursor = searcher.pos.from;
            cursor.ch = searcher.pos.from.ch + 1;
            // find the closing tag
            var match = CodeMirror.findMatchingTag(this.widget, cursor, range);
            if (match) {
              if (match.close) {
                // create the inner-range and jump the searcher after the ending tag
                var innerrange = { from: range.from, to: range.to };
                innerrange.from = cursor.line + 1;
                innerrange.to = match.close.to.line;
                // the recursive call
                this.foldByLevelRec(cursor, innerrange, level - 1);
              }
              // move to the next element in the same tag of this function scope
              var nextcursor = { line: cursor.line, to: cursor.ch };
              if (match.close) {
                nextcursor.line = match.close.to.line;
              }
              nextcursor.ch = 0;
              nextcursor.line = nextcursor.line + 1;
              searcher = this.widget.getSearchCursor("<", nextcursor, false);
            }
          }
        }
      },
      /**
       * Folds the given node.
       *
       * @method foldByNodeOrder
       * @param {Number} node
       * @fires unfoldAll
       */
      foldByNodeOrder(node) {
        // 0 - fold all
        this.unfoldAll();
        node++;
        for (var l = this.widget.firstLine() ; l <= this.widget.lastLine() ; ++l){
          if ( node == 0 ){
            this.widget.foldCode({line: l, ch: 0}, null, "fold");
          }
          else{
            node--;
          }
        }
      },
      /**
       * Folds all nodes.
       *
       * @method foldAll
       * @fires foldByNodeOrder
       */
      foldAll(){
        this.foldByNodeOrder(0);
      },
      /**
       * Undfolds all nodes.
       *
       * @method unfoldAll
       */
      unfoldAll() {
        for (var i = 0; i < this.widget.lineCount() ; i++) {
          this.widget.foldCode({ line: i, ch: 0 }, null, "unfold");
        }
      },
      selectHint(row) {
        //bbn.fn.log("selectHint", arguments);
        let toAdd = row.name;
        if (row.type === 'fn') {
          toAdd += '()';
        }

        let cursor = this.widget.getCursor();
        let line = this.widget.getLine(cursor.line);
        let str = bbn.fn.substr(line, 0, cursor.ch);
        let words = [...str.matchAll(/\w+/g)].map(a => a[0]);
        if (words) {
          let lastWord = words[words.length - 1];
          //bbn.fn.log("LAST WORD", lastWord, toAdd);
          let pos = toAdd.indexOf(lastWord);
          let dollarIncrement = bbn.fn.substr(toAdd, 0, 1) === '$' ? 1 : 0;
          if ((this.mode === 'php') && (row.ref || (row.type === 'object'))) {
            if (['X', 'Str'].includes(row.ref)) {
              toAdd += '::';
            }
            else {
              toAdd += '->';
            }
          }

          if (pos === dollarIncrement) {
            toAdd = bbn.fn.substr(toAdd, lastWord.length + dollarIncrement);
          }
        }

        this.widget.replaceRange(toAdd, cursor);
        cursor.ch += toAdd.length;
        if (row.type === 'fn') {
          cursor.ch--;
        }
        this.widget.setCursor(cursor);
        this.showHint();
      },
      htmlHint(str, cursor, token){
        bbn.fn.log(["----HTML HINT-----", cursor, token]);
        this.updateHtmlHints();
        this.widget.showHint({completeSingle: false});
        //bbn.fn.log(str)
      },
      phpHint(str, cursor, token){
        bbn.fn.log(["----PHP HINT-----", cursor, token]);
        // bbn.vue.phpLang must have been defined by an ajax call n mount
        if (!bbn.vue.phpLang) {
          return;
        }
        // if ending with a single column (ex: X:)
        if (str.match(/[A-z0-9]+\:$/)) {
          return;
        }

        /** @var Boolean True if we are inside a function call (between the parenthesis) */
        let isFn = false;
        /** @var Boolean True is we are in the process to call a method (after -> or ::) */
        let isMethod = false;
        /** @var RegExp Alphanumeric plus ->:\ starting with a letter or a dollar */
        let regex = new RegExp('[\\$]*[A-z]+[\\>\\:\\(A-z0-9_\\-]+', 'g');
        // All the matches in the given string
        let matches = [...str.matchAll(regex)];
        if (matches.length) {
          let search;
          // Looking for the last expression found, that's the one we'll want to complete
          // It must match the string just before the cursor
          bbn.fn.each(matches, a => {
            if (bbn.fn.substr(str, -a[0].length) === a[0]) {
              search = a[0];
              return false;
            }
          });

          // Here we have our string to complete
          if (search) {
            bbn.fn.log("Searching " + search);
            // Dividing it in words
            let words = [...search.matchAll(/\w+/g)].map(a => a[0]);
            if (!words.length) {
              return;
            }

            let pos = 0;
            // Looking if there is a dollar before (as they are not counted in the words)
            bbn.fn.each(words, (w, k) => {
              pos = search.indexOf(w, pos);
              if (pos && (search.charAt(pos-1) === '$')) {
                words[k] = '$' + w;
              }
            });

            bbn.fn.log("WORDS", words);
            let method = false;
            let cls = false;
            // If the previous char is an opening parenthesis we are calling a function
            if (bbn.fn.substr(search, -1) === '(') {
              isFn = true;
              method = words[words.length-1];
            }
            // If the 2 previous char call a method
            else if (['::', '->'].includes(bbn.fn.substr(search, -2))) {
              isMethod = true;
              cls = bbn.fn.substr(search, 0, search.length-2);
            }
            bbn.fn.log(isFn ? "METH" : "CLASS", isFn ? method : cls);

            let res = [];
            let doc = bbn.vue.phpLang;
            for (let i = 0; i < words.length; i++) {
              // Last word, the result must come from here
              if (i === words.length - 1) {
                if (isFn || isMethod) {
                  let tmp = bbn.fn.getRow(doc, 'name', words[i], '===');
                  if (!tmp) {
                    return;
                  }
                  if (isFn) {
                    bbn.fn.log("IS FUNCTION", tmp);
                    this.setFloaterPosition();
                    this.currentFn = {
                      cfg: tmp,
                      str: str,
                      num: 0
                    };
                    return;
                  }
                  let all = [];
                  if (tmp.items) {
                    all.push(...tmp.items);
                  }
                  if (tmp.ref) {
                    let row = bbn.fn.getRow(bbn.vue.phpLang, {name: tmp.ref});
                    if (row && row.items) {
                      all.push(...row.items);
                    }
                  }

                  res = all;
                }
                else {
                  let tmp = bbn.fn.filter(
                    doc,
                    'name',
                    words[i],
                    'start' // starts is case sensitive
                  );
                  if (!tmp.length) {
                    res = bbn.fn.filter(
                      doc,
                      'name',
                      words[i],
                      'contains'
                    );
                  }
                  else {
                    res = tmp;
                  }
                }
              }
              else {
                let tmp = bbn.fn.getRow(doc, 'name', words[i], '===');
                //bbn.fn.log("TMP", tmp);
                if (!tmp) {
                  return;
                }
                let all = [];
                if (tmp.items) {
                  all.push(...tmp.items);
                }
                if (tmp.ref) {
                  let row = bbn.fn.getRow(bbn.vue.phpLang, {name: tmp.ref});
                  if (row && row.items) {
                    all.push(...row.items);
                  }
                }

                doc = all;
              }
            }

            //bbn.fn.log("RES IS " + res.length, words);

            return {
              isFn: isFn,
              isMethod: isMethod,
              list: res.slice()
            };
          }
        }
        //bbn.fn.log("----END OF PHP HINT-----");
      },
      addDefinition(className, varName) {
        if (!bbn.fn.getRow(bbn.vue.phpLang, {"name": className})) {
          if (this.definitionUrl) {
            // ... for now we add a static method with a static url in the props
            bbn.fn.post(this.definitionUrl, {"className": className}, d => {
              if (d.success && d.res) {
                bbn.vue.phpLang.push(bbn.fn.extend(d.res, {"ref": varName}));
                if (!bbn.fn.getRow(bbn.vue.phpLang, {"name": varName})) {
                  let ref = {
                    "name": varName,
                    "type": "class",
                    "items": [],
                  }
                  bbn.vue.phpLang.push(ref);
                }
              }
            })
          }
        } else {
          let obj = JSON.parse(JSON.stringify(bbn.fn.getRow(bbn.vue.phpLang, {"name": className})));
          let newObj = bbn.fn.extend(obj, {"name": varName});
          bbn.vue.phpLang.push(newObj);
        }
      },

      /*
      jsHint(str){
        if (bbn.fn.substr(str, -1) === '(') {
          bbn.fn.log('IS FUNCTION');
        }
        else if (bbn.fn.substr(str, -1) === '.') {
          bbn.fn.log('IS PROP');
        }
        else {
          bbn.fn.log(str)
        }
      },
      cssHint(str){
        bbn.fn.log(str)
      },
      vueHint(str){
        bbn.fn.log(str)
      },
      */
      checkFn(str) {
        if (this.currentFn) {
          let idx = str.lastIndexOf(this.currentFn.str);
          if (idx > -1) {
            // What is between the opening parenthesis and the cursor
            str = bbn.fn.substr(str, idx + this.currentFn.str.length);
            let num = 0;
            // Counting the arguments, removing parenthesis
            let parenthesis = 0;
            for (let i = str.length; i > 0; --i) {
              let ch = str.charAt(i);
              if (ch === ')') {
                parenthesis--;
              }
              else if (ch === '(') {
                parenthesis++;
              }
              else if (!parenthesis && (ch === ',')) {
                num++;
              }
            }

            if (num !== this.currentFn.num) {
              this.$set(this.currentFn, 'num', num);
            }
          }
          else {
            this.currentFn = false;
          }

          return;
        }
      },
      showHint() {
        this.currentToken = false;
        if (this.hintTimeout) {
          clearTimeout(this.hintTimeout);
        }
        if (this.currentHints.length) {
          this.currentHints.splice(0, this.currentHints.length);
        }
        // if Enter key is pressed inside the tag(eg: span tag), set cursor automatically
        if (this.eventKey == 'Enter') {
          /** Object Cursor's info */
          let cursor = this.widget.getCursor();
          /** Array List of tokens */
          let tokens = this.widget.getLineTokens(cursor.line);
          if (tokens.length >=3) {
            if (tokens[tokens.length-1].string === '>' && tokens[tokens.length-3].string === '</') {
              let tabString = '';
              if (tokens.length >= 4) {
                tabString = tokens[tokens.length-4].string;
              }
              let pos = {
                line: cursor.line,
                ch: 0,
              }
              for(let i = 0; i < this.cfg.tabSize; i++) {
                tabString += ' ';
              }
              this.widget.replaceRange(tabString + '\n', pos);
              cursor.ch = tabString.length + 2;
              this.widget.setCursor(cursor);
              return;
            }
          }
        }
        this.hintTimeout = setTimeout(this.realShowHint, 500);
      },
      realShowHint() {
        bbn.fn.log(["showHint", this.mode]);
        if (!this[this.mode + 'Hint']) {
          return this.widget.showHint({completeSingle: false})
        }
        /** Object Cursor's info */
        let cursor = this.widget.getCursor();
        if (!cursor.ch) {
          return;
        }
        /** Array List of tokens */
        let tokens = this.widget.getLineTokens(cursor.line);
        /** @var String The current line */
        let currentLine = '';
        /** @var Array The tokens before the cursor */
        let realTokens = [];
        const beforeCursorToken = tokens.find(element => element.end == cursor.ch);
        const afterCursorToken = tokens.find(element => element.start == cursor.ch);
        if (this.mode === 'html') {
          let visibleSuggestions = tokens.find(element => element.end <= cursor.ch && element.string === "<");
          /** show hint only inside the tag in the html mode */
          /** or if cursor is between tags, don't show the hint */
          if (!visibleSuggestions || (beforeCursorToken
            && (beforeCursorToken.string === '>')
            && afterCursorToken
            && (afterCursorToken.string === "</"))
          ) {
            return;
          }
        }
        /** replace --> to -> when the suggestion is selected by Enter key */
        if ((this.mode === 'php')
            && (this.eventKey == 'Enter')
            && beforeCursorToken
            && (beforeCursorToken.string.includes('-->'))
        ) {
          this.widget.replaceRange("->", {line: cursor.line, ch: beforeCursorToken.start}, {line: cursor.line, ch: beforeCursorToken.end});
          tokens = this.widget.getLineTokens(cursor.line);
        }
        bbn.fn.each(tokens, t => {
          let tmp = bbn.fn.clone(t);
          if (t.end >= cursor.ch) {
            tmp.string = bbn.fn.substr(t.string, 0, cursor.ch - t.start);
          }
          currentLine += tmp.string;
          realTokens.push(tmp);
          if (t.end >= cursor.ch) {
            return false;
          }
        });

        let numTokens = realTokens.length;
        if (
          !numTokens ||
          !currentLine.trim() ||
          (currentLine.length > 150) ||
          (realTokens[numTokens - 1].type === 'comment')
        ) {
          return;
        }

        this.currentToken = realTokens[numTokens - 1];
        let mode = this.mode;
        if (this.currentToken.state && this.currentToken.state.curMode && (this.currentToken.state.curMode.name === 'htmlmixed')) {
          mode = 'html';
        }

        if (this[mode + 'Hint']) {
          let res = this[mode + 'Hint'](currentLine, cursor, this.currentToken);
          if (res && res.list && res.list.length) {
            this.setFloaterPosition();
            this.currentHints = res.list;
          }
        }
        else {
          return this.widget.showHint({completeSingle: false})
        }
      },
      setFloaterPosition(){
        let coords = this.widget.cursorCoords(true);
        if (coords.left > bbn.env.width/2) {
          this.floaterLeft = null;
          this.floaterRight = bbn.env.width - coords.left;
        }
        else {
          this.floaterLeft = coords.right;
          this.floaterRight = null;
        }
        if (coords.top > bbn.env.height/2) {
          this.floaterTop = null;
          this.floaterBottom = bbn.env.height - coords.top + 10;
        }
        else {
          this.floaterTop = coords.bottom + 10;
          this.floaterBottom = null;
        }
      },
      updateHtmlHints() {
        let components = Object.keys(Vue.options.components).sort();
        let hash = bbn.fn.uniqString(components);
        if (hash !== bbn.var.componentsHash) {
          bbn.var.componentsHash = hash;
          bbn.fn.iterate(Vue.options.components, (cp, cpName) => {
            let attrs = {
              class: null,
              style: null
            };
            if (cp.options) {
              bbn.fn.each(Object.keys(cp.options.props).sort(), propName => {
                attrs[bbn.fn.camelToCss(propName)] = null;
              })
              attrs[':class'] = null;
              attrs[':style'] = null;
              bbn.fn.each(Object.keys(cp.options.props).sort(), propName => {
                attrs[':' + bbn.fn.camelToCss(propName)] = null;
              })
            }
            CodeMirror.htmlSchema[cpName] = {attrs: attrs}
          });
        }
      },
      /**
       * Adds a block of text in the editor.
       *
       * @param {String} code
       * @fires getState
       */
      addSnippet(code){
        if ( code === undefined ){
          code = "";
        }
        this.widget.focus();
        let replace = this.widget.getDoc().replaceRange,
            state = this.getState(),
            position = {
              line: state.line-1,
              ch: state.char
            };
        this.widget.getDoc().replaceRange("\n" + code + "\n", position);
      },
      /**
       * Toggles the fullscreen.
       *
       * @param {Boolean} isFS
       */
      toggleFullScreen(isFS){
        if ( isFS === undefined ){
          isFS = !this.isFullScreen;
        }
        this.isFullScreen = !!isFS;
      },
      resetFloaters(){
        if (this.hintTimeout) {
          clearTimeout(this.hintTimeout);
        }
        this.currentHints.splice(0, this.currentHints.length);
        this.currentFn = false;
      },
      _onkeyDown() {
        if (this.hintTimeout) {
          clearTimeout(this.hintTimeout);
        }
        if (["Ctrl", "Alt"].includes(event.key)) {
          return;
        }
        if (this.currentHints.length) {
          let lst = this.find('bbn-list');
          if (bbn.var.keys.leftRight.includes(event.keyCode) ||
              (this.currentHints.length == 1 && bbn.var.keys.upDown.includes(event.keyCode))
              ) {
            this.resetFloaters();
            return;
          }
          // if (this.currentHints.length == 1) {

          // }
          if (lst) {
            if (bbn.var.keys.upDown.includes(event.keyCode)) {
              lst.keynav(event);
              //bbn.fn.log(lst.currentSelected);
            }
            else if (event.key === "Enter") {
              event.preventDefault();
              lst.select(lst.overIdx || 0);
            }
          }
        }
        else if (
          bbn.var.keys.upDown.includes(event.keyCode) ||
          bbn.var.keys.leftRight.includes(event.keyCode)
        ) {
          return;
        }
        else if (event.key === 'Enter') {
          this.resetFloaters();
        }
      },
      _onkeyUp(cm, event) {
        if (["Ctrl", "Alt"].includes(event.key) ||
            bbn.var.keys.upDown.includes(event.keyCode) ||
            bbn.var.keys.leftRight.includes(event.keyCode)
        ) {
          return;
        }

        if (["Escape"/*, "Backspace", "Delete"*/].includes(event.key) ||
            event.ctrlKey ||
            event.altKey ||
            bbn.var.keys.upDown.includes(event.keyCode)
        ) {
          this.resetFloaters();
          return;
        }
        this.eventKey = event.key;
        this.showHint();
      }
    },
    /**
     * @event mounted
     * @fires getRef
     * @emit  input
     */
    mounted(){
      if ((this.mode === 'php') && !bbn.vue.phpLang) {
        bbn.fn.ajax({
          url: "https://raw.githubusercontent.com/nabab/bbn/master/code_ref_php.json",
          success: defs => {
            bbn.vue.phpLang = defs;
          }
        })
      }
      //bbn.fn.log(this.getOptions());
      if (this.getRef('code')) {
        this.widget = CodeMirror(this.getRef('code'), this.getOptions());
        this.widget.on("keydown", this._onkeyDown);
        this.widget.on("keyup", this._onkeyUp);
        this.widget.on("scroll", cm => this.$emit('scroll', cm));
        this.widget.on("blur", () => this.resetFloaters());
        this.widget.on("change", () => this.emitInput(this.widget.doc.getValue()));

        setTimeout(() => {
          this.widget.refresh();
          this.$nextTick(() => {
            this.ready = true;
          })
        }, 250);
      }
    },

    watch: {
      /**
       * @watch currentTheme
       * @param {String} newVal
       */
      currentTheme(newVal){
        this.widget.setOption("theme", newVal);
      },
      /**
       * @watch mode
       * @param {String} newVal
       * @fires getMode
       */
      mode(newVal){
        let mode = this.getMode(newVal);
        if ( mode ){
          bbn.fn.each(mode, (v, i) => {
            this.widget.setOption(i, v);
          });
        }
      },
      currentHints(newVal) {
        if (newVal.length && !this.currentFn) {
          this.$nextTick(() => {
            let fl = this.getRef('hints');
            if (fl) {
              fl.onResize();
            }
          });
        }
      },
      /**
       * @watch value
       * @param {String} newVal
       * @param {String} oldVal
       */
      value(newVal, oldVal){
        if ( (newVal !== oldVal) && (newVal !== this.widget.getValue()) ){
          this.widget.setValue(newVal);
        }
      }
    },
    components: {
      fnHelper: {
        props: ['source'],
        template: `
<div class="bbn-spadded bbn-m">
  <div class="bbn-spadded bbn-nowrap">
    <span class="bbn-b"
          v-text="source.cfg.name"></span>
    <span>(</span>
    <template v-for="(a, i) of items">
      <span class="bbn-i bbn-space-right"
            v-if="a.type"
            v-text="a.type"></span>
      <span :class="a.cls"
            v-text="a.text"></span>
      <span v-if="!a.last">, </span>
    </template>
    <span>)</span>
  </div>
  <div v-if="source.cfg.desc"
       class="bbn-j bbn-spadded"
       v-html="source.cfg.desc">
  </div>
</div>
`,
        data(){
          return {};
        },
        computed: {
          items(){
            let res = [];
            if (this.source.cfg.args) {
              bbn.fn.each(this.source.cfg.args, (a, i) => {
                res.push({
                  text: (a.optional ? '[' : '') +
                    '$' + a.name +
                    (a.optional ? ']' : ''),
                  cls: i === this.source.num ? 'bbn-b' : '',
                  last: i === this.source.cfg.args.length - 1,
                  type: a.type || null
                });
              });

            }
            return res;
          }
        },
        mounted(){
          bbn.fn.log("fnHelper", this.source)
        }
      },
      suggestion: {
        props: ['source'],
        template: `
<div class="bbn-spadded bbn-nowrap bbn-pre bbn-m"
     v-text="source.name"
     :title="source.desc">
</div>
`,
        data(){
          return {}
        }
      }
    }
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
};
document.head.insertAdjacentElement("beforeend", script_dep);
})(bbn);
}