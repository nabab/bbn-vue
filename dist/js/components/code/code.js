(bbn_resolve) => { ((bbn) => {
let script_dep = document.createElement('script');
script_dep.setAttribute('src', "https://cdn.jsdelivr.net/combine/gh/acornjs/acorn@v0.1/acorn.js,gh/acornjs/acorn@v0.1/acorn_loose.js,gh/acornjs/acorn@v0.1/util/walk.js,gh/ternjs/tern@0.21.0/doc/demo/polyfill.js,gh/ternjs/tern@0.21.0/lib/signal.js,gh/ternjs/tern@0.21.0/lib/tern.js,gh/ternjs/tern@0.21.0/lib/def.js,gh/ternjs/tern@0.21.0/lib/comment.js,gh/ternjs/tern@0.21.0/lib/infer.js,gh/ternjs/tern@0.21.0/plugin/doc_comment.js,gh/google/diff-match-patch@master/javascript/diff_match_patch.min.js,gh/Dominator008/CodeMirror-minified@5.55.0/lib/codemirror.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/dialog/dialog.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/edit/matchbrackets.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/edit/matchtags.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/edit/closebrackets.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/edit/closetag.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/edit/trailingspace.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/edit/continuelist.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/runmode/colorize.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/search/search.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/search/searchcursor.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/fold/foldcode.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/fold/foldgutter.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/fold/brace-fold.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/fold/comment-fold.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/fold/xml-fold.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/fold/markdown-fold.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/fold/indent-fold.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/mode/overlay.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/mode/multiplex.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/search/match-highlighter.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/search/jump-to-line.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/selection/active-line.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/runmode/runmode.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/selection/mark-selection.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/merge/merge.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/hint/show-hint.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/tern/tern.js,gh/Dominator008/CodeMirror-minified@5.55.0/mode/clike/clike.js,gh/Dominator008/CodeMirror-minified@5.55.0/mode/css/css.js,gh/Dominator008/CodeMirror-minified@5.55.0/mode/diff/diff.js,gh/Dominator008/CodeMirror-minified@5.55.0/mode/htmlmixed/htmlmixed.js,gh/Dominator008/CodeMirror-minified@5.55.0/mode/javascript/javascript.js,gh/Dominator008/CodeMirror-minified@5.55.0/mode/markdown/markdown.js,gh/Dominator008/CodeMirror-minified@5.55.0/mode/php/php.js,gh/Dominator008/CodeMirror-minified@5.55.0/mode/sql/sql.js,gh/Dominator008/CodeMirror-minified@5.55.0/mode/vue/vue.js,gh/Dominator008/CodeMirror-minified@5.55.0/mode/xml/xml.js,gh/Dominator008/CodeMirror-minified@5.55.0/mode/coffeescript/coffeescript.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/hint/html-hint.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/hint/css-hint.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/hint/sql-hint.js,gh/Dominator008/CodeMirror-minified@5.55.0/addon/hint/xml-hint.js");
script_dep.onload = () => {

let css_dependency;
css_dependency = document.createElement('link');
css_dependency.setAttribute('rel', "stylesheet");
css_dependency.setAttribute('href', "https://cdn.jsdelivr.net/combine/gh/Dominator008/CodeMirror-minified@5.55.0/lib/codemirror.css,gh/Dominator008/CodeMirror-minified@5.55.0/addon/dialog/dialog.css,gh/Dominator008/CodeMirror-minified@5.55.0/addon/fold/foldgutter.css,gh/Dominator008/CodeMirror-minified@5.55.0/addon/merge/merge.css,gh/Dominator008/CodeMirror-minified@5.55.0/addon/hint/show-hint.css,gh/Dominator008/CodeMirror-minified@5.55.0/addon/tern/tern.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/3024-day.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/3024-night.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/abcdef.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/ambiance-mobile.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/ambiance.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/base16-dark.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/base16-light.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/bespin.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/blackboard.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/cobalt.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/colorforth.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/dracula.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/duotone-dark.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/duotone-light.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/eclipse.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/elegant.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/erlang-dark.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/hopscotch.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/icecoder.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/isotope.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/lesser-dark.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/liquibyte.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/material.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/mbo.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/mdn-like.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/midnight.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/monokai.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/neat.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/neo.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/night.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/panda-syntax.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/paraiso-dark.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/paraiso-light.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/pastel-on-dark.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/railscasts.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/rubyblue.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/seti.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/solarized.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/the-matrix.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/tomorrow-night-bright.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/tomorrow-night-eighties.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/ttcn.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/twilight.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/vibrant-ink.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/xq-dark.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/xq-light.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/yeti.css,gh/Dominator008/CodeMirror-minified@5.55.0/theme/zenburn.css");
document.head.insertAdjacentElement('beforeend', css_dependency);
let script = document.createElement('script');
script.innerHTML = `<div :class="[{'bbn-reset': true, 'bbn-overlay': isFullScreen}, componentClass]"
     @keydown.enter.stop=""
     @keydown.escape.stop="toggleFullScreen(false)"
>
  <div :class="fill ? 'bbn-code-filled' : ''"
      ref="code"
      @focus="focus($event)"
      @blur="blur($event)"
      @keydown="keydown($event)"
      @keyup="keyup($event)"
      @mouseenter="over($event)"
      @mouseleave="out($event)"
      @scroll.passive="scroll($event)"
  ></div>
  <input ref="element"
        type="hidden"
        :value="value"
        :name="name"
        :disabled="disabled"
        :required="required"
  >
  <div class="bbn-bg-black bbn-p bbn-middle theme-button"
      v-if="themeButton"
      ref="theme_button"
  >
    <i class="nf nf-fa-bars" @click="nextTheme()"> </i>
  </div>
  <bbn-scrollbar v-if="fill && ready"
                orientation="vertical"
                :container="$el.querySelector('.CodeMirror-scroll')">
  </bbn-scrollbar>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-code');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/code/code.css");
document.head.insertAdjacentElement('beforeend', css);
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


((bbn) => {
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
      /*
      lint: {
        esversion: 6
      },
      lintWith: window.jslint || CodeMirror.lint.javascript,
      */
      autoCloseBrackets: true,
      extraKeys: {
        "Ctrl-Space": function(cm) { bbn.vue.tern.complete(cm); },
        "Ctrl-I": function(cm) { bbn.vue.tern.showType(cm); },
        "Ctrl-O": function(cm) { bbn.vue.tern.showDocs(cm); },
        "Alt-.": function(cm) { bbn.vue.tern.jumpToDef(cm); },
        "Alt-,": function(cm) { bbn.vue.tern.jumpBack(cm); },
        "Ctrl-Q": function(cm) { bbn.vue.tern.rename(cm); },
        "Ctrl-.": function(cm) { bbn.vue.tern.selectName(cm); }
      }
    },
    coffee: {
      mode: 'text/coffeescript'
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
      mode: "text/x-vue"
    }
  };

  let themeIndex = themes.indexOf(bbn.vue.defaults.code.defaultTheme);

  Vue.component('bbn-code', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
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
       * @prop {String} [php] mode
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
        isFullScreen: false
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
            o.gutters = ["CodeMirror-lint-markers"]
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
        let tmp,
            cfg = bbn.fn.extend({}, baseCfg, {
              mode: this.mode,
              theme: this.currentTheme,
              value: this.value
            }, this.cfg);
        if ( this.readonly || this.disabled ){
          cfg.readOnly = true;
        }
        if ( tmp = this.getMode(this.mode) ){
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
          this.$nextTick(()=>{
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
            bbn.fn.each(selections, (a) => {
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
      /**
       * Initializes the component
       *
       * @method initTern
       */
      initTern(){
        if (this.mode === 'js') {
          if (bbn.vue.tern === undefined) {
            let getURL = (url, c) => {
              let xhr = new XMLHttpRequest();
              xhr.open("get", url, true);
              xhr.send();
              xhr.onreadystatechange = function() {
                if (xhr.readyState != 4) return;
                if (xhr.status < 400) return c(null, xhr.responseText);
                let e = new Error(xhr.responseText || "No response");
                e.status = xhr.status;
                c(e);
              };
            };
            getURL("https://raw.githubusercontent.com/ternjs/tern/master/defs/ecmascript.json", (err, code) => {
              if (err) {
                throw new Error("Request for ecmascript.json: " + err);
              }
              if ( this.widget && code ){
                let defs = JSON.parse(code);
                defs.bbn = {
                  fn: {},
                  vue: {}
                };
                bbn.fn.iterate(bbn.fn, (a, k) => {
                  defs.bbn.fn[k] = {
                    "!type": "fn(number) -> number",
                    "!url": "https://doc.js.bbn.solutions/" + k,
                    "!doc": "Returns the value of a number rounded to the nearest integer."                  
                  }
                });
                bbn.fn.iterate(bbn.vue, (a, k) => {
                  defs.bbn.vue[k] = {
                    "!type": "fn(number) -> number",
                    "!url": "https://doc.js.bbn.solutions/" + k,
                    "!doc": "Returns the value of a number rounded to the nearest integer."                  
                  }
                });

                bbn.vue.tern = new CodeMirror.TernServer({defs: [defs]});
                this.widget.on("cursorActivity", function(cm) { bbn.vue.tern.updateArgHints(cm); });
              }
            });
          }
          else {
            this.widget.on("cursorActivity", function(cm) { bbn.vue.tern.updateArgHints(cm); });
          }
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
      }
    },
    /**
     * @event mounted
     * @fires initTern
     * @fires getRef
     * @emit  input
     */
    mounted(){
      //bbn.fn.log(this.getOptions());
      if ( this.getRef('code') ){
        this.widget = CodeMirror(this.getRef('code'), this.getOptions());

        this.widget.on("keyup", (cm, event) => {
          if (
            /*Enables keyboard navigation in autocomplete list*/
            !cm.state.completionActive &&
            !event.ctrlKey && !event.altKey &&
            (event.keyCode > 64) &&
            (event.keyCode < 91) 
          ){// only when a letter key is pressed
              CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
            }
          });

        this.widget.on("change", (ins, bbb) => {
          this.emitInput(this.widget.doc.getValue());
        });
        this.$nextTick(() => {
          this.ready = true;
          setTimeout(() => {
            this.widget.refresh();
            if ( this.mode === 'js' ){
              this.initTern();
            }
            else {
              this.widget.on("cursorActivity", (cm) => {
                bbn.fn.log(cm);
              });
            }
          }, 250)
        })
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
    }
  });

})(bbn);
if (bbn_resolve) {bbn_resolve("ok");}
};
document.head.insertAdjacentElement("beforeend", script_dep);
})(bbn); }