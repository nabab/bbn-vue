/**
 * @file bbn-context component
 *
 * @description bbn-context is a menu that can be activated with a right click.
 * The source of the menu can have a tree structure.
 *
 * @copyright BBN Solutions
 *
 * @created 15/02/2017.
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.list
     * @mixin bbn.wc.mixins.dimensions
     * @mixin bbn.wc.mixins.events
     */
    mixins: 
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.list,
      bbn.wc.mixins.dimensions,
      bbn.wc.mixins.events
    ],
    props: {
      /**
       * @prop {Boolean} [false] autobind
       */
      autobind: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Boolean} [false] disabled
       */
      disabled: {
        type: Boolean,
        default: false
      },
      /**
       * Will force the position.
       * @prop {String} [''] position
       */
      position: {
        type: String,
        default: ''
      },
      /**
       * The html tag used to render the property content.
       * @prop {String} ['span'] tag
       */
       tag: {
        type: String,
        default: 'span'
      },
      /**
       * If defined it will be show at the top of the list.
       * @prop {String} [false] floaterTitle
       */
       floaterTitle: {
        type: [Boolean, String],
        default: false
      },
      /**
       * Set to true to show the floating element containing the menu.
       * @prop {Boolean} [false] context
       * ì
       */
      context: {
        type: Boolean,
        default: false
      },
      /**
       * The content of the context menu.
       * @prop {String} content
       */
      content: {
        type: String
      },
      /**
       * Selection mode.
       * @prop {String} ['free'] mode
       */
      mode: {
        type: String,
        default: 'free'
      },
      /**
       *
       * @prop {String} ['items'] children
       */
      children: {
        type: String,
        default: 'items'
      },
      /**
       * The component used by list's items.
       * @prop {Object|String} itemComponent
       */
      itemComponent: {
        type: [Object, String]
      },
      /**
       * The HTMLElement to bind to.
       * @props {HTMLElement} attach
       */
      attach: {
        type: HTMLElement
      },
      /**
       * The name of the property to be used as action to execute when selected.
       * @prop {String} sourceAction
       * @memberof listComponent
       */
      sourceAction: {
        type: [String, Function],
        default: 'action'
      },
      /**
       * The name of the property to be used as URL to go to when selected.
       * @prop {String} sourceUrl
       * @memberof listComponent
       */
      sourceUrl: {
        type: [String, Function],
        default: 'url'
      },
    },
    data(){
      return {
        /**
         * True if the floating element of the menu is opened.
         * @data {Boolean} [false] showFloater
         */
        showFloater: false,
        /**
         * @data {Boolean} [false] docEvent
         */
        docEvent: false,
        currentLeft: null,
        currentTop: null,
        currentRight: null,
        currentBottom: null
      };
    },
    methods: {
      /**
       * Based on the type of event and on the property context, shows or hides the floating element of the menu.
       * @method clickItem
       * @param {Event} e ì
       * @fires updateData
       */
      clickItem(e){
        if (
          !this.disabled
          && (
            (e.type === 'keydown') ||
            ((e.type === 'contextmenu') && this.context) ||
            ((e.type === 'click') && !this.context)
          )
        ){
          if (e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
          }
          // Don't execute if in the floater
          if (!e.target.closest('.bbn-floater-context-' + this.bbnUid)) {
            if (!this.showFloater && !this.attach) {
              if (e.pageX > bbn.env.width / 2) {
                this.currentLeft = null;
                this.currentRight = bbn.env.width - e.pageX + 5;
              }
              else {
                this.currentLeft = e.pageX - 5;
                this.currentRight = null;
              }

              if (e.pageY > bbn.env.height / 2) {
                this.currentTop = null;
                this.currentBottom = bbn.env.height - e.pageY + 5;
              }
              else {
                this.currentTop = e.pageY - 5;
                this.currentBottom = null;
              }
            }

            this.toggle();
          }
        }
      },
      /**
       * @method clickOut
       * @param e
       */
      clickOut(e){
        if (!e.target.closest('.bbn-floater-context-' + this.bbnUid)) {
          this.showFloater = false;
        }
      },
      /**
       * @method toggle
       */
      toggle(){
        if (!this.showFloater) {
          this.updateData().then(() => {
            this.showFloater = !this.showFloater;
          });
        }
        else {
          this.showFloater = !this.showFloater;
        }
      },
      onMouseDown(e){
        let event = new CustomEvent('mousedown', {
          cancelable: true,
          detail: e
        });
        this.$emit('mousedown', event);
        if (!event.defaultPrevented) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    },
    /**
     * @method beforeDestroy
     */
    beforeDestroy() {
      if (this.docEvent) {
        document.removeEventListener('click', this.clickout)
      }
    },
    watch: {
      showFloater(v){
        if (v) {
          document.addEventListener('click', this.clickOut, true)
          this.docEvent = true;
        }
        else {
          document.removeEventListener('click', this.clickout)
          this.docEvent = false;
        }
      }
    }
  };
