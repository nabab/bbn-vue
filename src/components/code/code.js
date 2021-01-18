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

  const phpFn = [
    "str::as_var",
    "str::cast",
    "str::change_case",
    "str::check_filename",
    "str::check_json",
    "str::check_name",
    "str::check_path",
    "str::clean",
    "str::convert_size",
    "str::correct_types",
    "str::cut",
    "str::encode_dbname",
    "str::encode_filename",
    "str::escape",
    "str::escape_all_quotes",
    "str::escape_apo",
    "str::escape_dquote",
    "str::escape_dquotes",
    "str::escape_quote",
    "str::escape_quotes",
    "str::escape_squote",
    "str::escape_squotes",
    "str::export",
    "str::file_ext",
    "str::genpwd",
    "str::get_numbers",
    "str::has_slash",
    "str::is_buid",
    "str::is_clean_path",
    "str::is_date_sql",
    "str::is_decimal",
    "str::is_domain",
    "str::is_email",
    "str::is_integer",
    "str::is_ip",
    "str::is_json",
    "str::is_number",
    "str::is_uid",
    "str::is_url",
    "str::make_readable",
    "str::markdown2html",
    "str::parse_path",
    "str::parse_url",
    "str::remove_accents",
    "str::remove_comments",
    "str::replace_once",
    "str::sanitize",
    "str::say_size",
    "x::__callStatic",
    "x::adump",
    "x::build_options",
    "x::clean_storage_path",
    "x::compare_floats",
    "x::concat",
    "x::convert_uids",
    "x::count",
    "x::count_all",
    "x::count_properties",
    "x::curl",
    "x::debug",
    "x::decrement",
    "x::dump",
    "x::filter",
    "x::find",
    "x::from_csv",
    "x::get_dump",
    "x::get_field",
    "x::get_hdump",
    "x::get_row",
    "x::get_rows",
    "x::get_tree",
    "x::has_deep_prop",
    "x::has_prop",
    "x::has_props",
    "x::hdump",
    "x::increment",
    "x::indent_json",
    "x::indexOf",
    "x::index_by_first_val",
    "x::is_assoc",
    "x::is_cli",
    "x::is_same",
    "x::is_windows",
    "x::join",
    "x::js_object",
    "x::json_base64_decode",
    "x::json_base64_encode",
    "x::lastIndexOf",
    "x::last_curl_code",
    "x::last_curl_error",
    "x::last_curl_info",
    "x::log",
    "x::log_error",
    "x::make_storage_path",
    "x::make_tree",
    "x::make_uid",
    "x::map",
    "x::max_with_key",
    "x::merge_arrays",
    "x::merge_objects",
    "x::microtime",
    "x::min_with_key",
    "x::output",
    "x::pick",
    "x::remove_empty",
    "x::retrieve_array_var",
    "x::retrieve_object_var",
    "x::sort",
    "x::sort_by",
    "x::split",
    "x::sum",
    "x::to_array",
    "x::to_csv",
    "x::to_excel",
    "x::to_groups",
    "x::to_keypair",
    "x::to_object"
  ];

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
        "Ctrl-Space": function(cm) { bbn.vue.tern.complete(cm);}/*,
        "Ctrl-I": function(cm) { bbn.vue.tern.showType(cm); },
        "Ctrl-O": function(cm) { bbn.vue.tern.showDocs(cm); },
        "Alt-.": function(cm) { bbn.vue.tern.jumpToDef(cm); },
        "Alt-,": function(cm) { bbn.vue.tern.jumpBack(cm); },
        "Ctrl-Q": function(cm) { bbn.vue.tern.rename(cm); },
        "Ctrl-.": function(cm) { bbn.vue.tern.selectName(cm); }*/
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
      scrollTop(bottom){
        let sc = this.getRef('scrollbar');
        if (sc) {
          sc.onResize();
          if (sc.shouldBother) {
            bbn.fn.log("BOTHERRING")
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
          this.$nextTick(() => {
            bbn.fn.log("FOCUS ON METHOD CURSOR POSITION");
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
        bbn.fn.log("LOADING CODE STATE");
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
          if (!bbn.vue.tern) {
            bbn.fn.ajax({
              url: "https://raw.githubusercontent.com/ternjs/tern/master/defs/ecmascript.json",
              success: defs => {
                /*
                if (defs && this.widget) {
                  bbn.vue.tern = new CodeMirror.TernServer({defs: [defs]});
                  this.widget.on("cursorActivity", cm => {
                    bbn.vue.tern.updateArgHints(cm);
                  });
                }
                */
                if (defs && this.widget) {
                  bbn.fn.ajax({
                    url: "https://raw.githubusercontent.com/nabab/bbn-js/src/doc/tern.json",
                    success: res => {
                      if (res && res.bbn) {
                        bbn.fn.extend(defs, res);
                        bbn.fn.ajax({
                          url: "https://raw.githubusercontent.com/nabab/bbn-vue/src/tern.json",
                          success: res => {
                            if (res && res.bbn) {
                              bbn.fn.extend(true, defs, res);
                              bbn.fn.iterate(bbn, (a, k) => {
                                if (!defs.bbn[k]) {
                                  defs.bbn[k] = {};
                                  if (bbn.fn.isObject(a)) {
                                    bbn.fn.iterate(a, (b, n) => {
                                      defs.bbn[k][n] = {};
                                      if (b === null) {
                                        defs.bbn[k][n]['!type'] = 'null';
                                      }
                                      else if (bbn.fn.isArray(b)) {
                                        defs.bbn[k][n]['!type'] = 'Array';
                                      }
                                      else {
                                        defs.bbn[k][n]['!type'] = typeof(b);
                                      }
                                    });
                                  }
                                  else if (a === null) {
                                    defs.bbn[k]['!type'] = 'null';
                                  }
                                  else if (bbn.fn.isArray(a)) {
                                    defs.bbn[k]['!type'] = 'Array';
                                  }
                                  else {
                                    defs.bbn[k]['!type'] = typeof(a);
                                  }
                                }
                              });
                              bbn.vue.tern = new CodeMirror.TernServer({defs: [defs]});
                              this.widget.on("cursorActivity", cm => {
                                bbn.vue.tern.updateArgHints(cm);
                              });
                            }
                          }
                        })
                      }
                    }
                  })
                }
              }
            });
          }
          else {
            this.widget.on("cursorActivity", cm => {
              bbn.vue.tern.updateArgHints(cm);
            });
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
        bbn.fn.log("FOCUS BEFORE ADDING SNIPPET");
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
      if (this.getRef('code')) {
        if (CodeMirror.hintWords.php
          && (CodeMirror.hintWords.php.indexOf(phpFn[0]) === -1)
        ) {
          CodeMirror.hintWords.php = CodeMirror.hintWords.php.concat(phpFn);
        }

        this.widget = CodeMirror(this.getRef('code'), this.getOptions());

        this.widget.on("keyup", (cm, event) => {
          if (
            /*Enables keyboard navigation in autocomplete list*/
            !cm.state.completionActive
            && !event.ctrlKey
            && !event.altKey
            // Dot
            && ([":", ".", "("].includes(event.key)
            || (
              (event.keyCode > 64) &&
              (event.keyCode < 91) 
            ))
          ){
            let o = {completeSingle: false};
            if (this.mode === 'js') {
              o.hint = bbn.vue.tern.getHint;
            }
            cm.showHint(o);
          }
        });

        this.widget.on("change", () => {
          this.emitInput(this.widget.doc.getValue());
        });
        this.widget.on("scroll", cm => {
          this.$emit('scroll', cm)
        });
        this.$nextTick(() => {
          this.ready = true;
          setTimeout(() => {
            this.widget.refresh();
            if ( this.mode === 'js' ){
              this.initTern();
            }
            /*
            else {
              this.widget.on("cursorActivity", (cm) => {
                bbn.fn.log(cm);
              });
            }
            */
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