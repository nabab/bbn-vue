/**
 * @file bbn-search component
 *
 * @description bbn-serach is a  component used for a search, filtering the tree-structured data
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 10/02/2017
 */
return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.events
     * @mixin bbn.wc.mixins.keynav
     * @mixin bbn.wc.mixins.list
      */
     mixins: 
     [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.input,
      bbn.wc.mixins.events,
      bbn.wc.mixins.keynav,
      bbn.wc.mixins.list
    ],
    props: {
      source: {},
      /**
       * @prop {String} [''] textValue
       */
      textValue: {
        type: String,
        default: ''
      },
      /**
       * @prop {Number} [1] minLength
       */
      minLength: {
        type: Number,
        default: 1
      },
      /**
       * A component for each element of the list.
       *
       * @prop component
       */
      component: {},
      /**
       * The template to costumize the dropdown menu.
       *
       * @prop template
       */
      template: {},
      /**
       * @todo description
       *
       * @prop valueTemplate
       */
      valueTemplate: {},
      /**
       * Defines the groups for the dropdown menu.
       * @prop {String} group
       */
      group: {
        type: String
      },
      /**
       * If set to true the dropdown is not autofilled if empty
       * @prop {Boolean} nullable
       */
      nullable: {
        default: null
      },
      /**
       * The placeholder of the dropdown.
       *
       * @prop {String} placeholder
       */
      placeholder: {
        type: String
      },
      /**
       * @prop {Boolean} [false] autocomplete
       */
      autocomplete: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Number} [500] delay
       */
      delay: {
        type: Number,
        default: 500
      },
      /**
       * @prop {} [false] leftIcon
       */
      leftIcon: {
        default: false
      },
      /**
       * @prop ['nf nf-fa-search'] rightIcon
       */
      rightIcon: {
        default: 'nf nf-fa-search'
      },
      /**
       * @prop {} ['4rem'] minWidth
       */
      minWidth: {
        default: '4rem'
      },
      /**
       * @prop {} ['100%'] maxWidth
       */
      maxWidth: {
        default: '100%'
      },
      /**
       * @prop {Array} [[]] value
       */
      value: {
        type: Array,
        default(){
          return [];
        }
      }

    },
    data(){
      return {
        isFocused: false,
        style: this.source && this.source.style ? this.source.style : {},
        isOpened: true,
        currentWidth: this.minWidth,
        currentPlaceholder: '?',
        hasSelection: true
      };
    },
    computed: {
      /*
      ui(){
        return this.closest('bbn-appui');
      },
      cfg(){
        if ( this.source && Object.keys(this.source).length ){
          let cfg = bbn.fn.extend(true, {}, this.source);
          if ( cfg.focus !== undefined ){
            delete cfg.focus;
          }
          if ( cfg.blur !== undefined ){
            delete cfg.blur;
          }
          if ( cfg.change !== undefined ){
            delete cfg.change;
          }
          if ( cfg.style !== undefined ){
            delete cfg.style;
          }
          return cfg;
        }
        return {
          delay: 500,
          sourceText: 'text',
          sourceValue: 'value',
          clearButton: false,
          suggest: true,
          source: [],
          placeholder: '?',
          placeholderFocused: bbn._("Search.."),
          icon: 'nf nf-fa-search',
          minLength: 1,
          height: bbn.env.height - 100,
          template(d){
            return `
              <div class="bbn-hpadded bbn-nl">
                <div class="bbn-block-left">
                  <h3>${d.text}</em></h3>
                </div>
                <div class="bbn-block-right bbn-h-100 bbn-r" style="display: table">
                  <span style="display: table-cell; vertical-align: middle">${d.value}</span>
                </div>
              </div>`;
          }
        };
      },
      eventsCfg(){
        let def = {
          focus: e => {
            if ( !this.isExpanded ){
              let pane = this.closest('bbn-pane'),
                  w = pane.$children[0].$el.clientWidth + pane.$children[1].$el.clientWidth - 40;
              this.$refs.search.$refs.element.placeholder = this.cfg.placeholderFocused;
              this.$set(this.style, 'width', w + 'px');
              this.isExpanded = true;
            }
          },
          blur: e => {
            if ( this.isExpanded ){
              this.$set(this.style, 'width', this.source.style && this.source.style.width ? this.source.style.width : '30px');
              this.isExpanded = false;
              this.$refs.search.$refs.element.placeholder = this.cfg.placeholder;
              this.search = '';
            }
          },
          change: id => {
            if (id && !(id instanceof Event)) {
              setTimeout(() => {
                document.activeElement.blur();
              }, 15);
            }
          }
        };
        return {
          focus: this.source.focus || def.focus,
          blur: this.source.blur || def.blur,
          change: this.source.change || def.change
        };
      },
      currentStyle(){
        return bbn.fn.extend({
          'z-index': 10,
          transition: 'width 400ms',
          width: '30px'
        }, (this.source.style || {}), this.style);
      }
      */
    },
    methods: {
      /**
       * States the role of the enter button on the dropdown menu.
       *
       * @method keynav
       * @fires widget.select
       * @fires widget.open
       *
       */
      keydown(e){
        let list = this.getRef('list');
        if (!list || !this.filteredData.length || e.altKey || e.ctrlKey || e.metaKey) {
          return;
        }
        if (e.key === ' '){
          if (list.overIdx > -1) {
            list.select(list.overIdx);
          }
        }
        else if (bbn.var.keys.confirm.indexOf(e.which) > -1) {
          e.preventDefault();
          if (list.overIdx > -1) {
            list.select(list.overIdx);
          }
        }
        else if (bbn.var.keys.upDown.indexOf(e.keyCode) > -1) {
          this.keynav(e);
        }
      },
      select(item) {
        if ( item[this.sourceValue] !== undefined ){
          let v = this.value.slice();
          let idx = v.indexOf(item[this.sourceValue]);
          if ( idx > -1 ){
            v.splice(idx, 1);
          }
          else{
            v.push(item[this.sourceValue]);
          }
          this.emitInput(v);
        }
      }
    },
    mounted(){
      this.ready = true;
    }
  };
