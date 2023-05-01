/**
 * @file bbn-search component
 * @description The search allows to select a single value from a list of items by proposeing suggestions based on the typed characters.
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 10/02/2017.
 */


 return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.events
     * @mixin bbn.wc.mixins.resizer
     * @mixin bbn.wc.mixins.list
     * @mixin bbn.wc.mixins.keynav
     * @mixin bbn.wc.mixins.url
     * @mixin bbn.wc.mixins.dropdown
      */
    mixins: [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.events,
      bbn.wc.mixins.resizer,
      bbn.wc.mixins.list,
      bbn.wc.mixins.keynav,
      bbn.wc.mixins.url,
      bbn.wc.mixins.dropdown
    ],
    props: {
      /**
       * For to apply the filters or not.
       *
       * @prop {Boolean} filterable
       */
      filterable: {
        type: Boolean,
        default: true
      },
      /**
       * To define the length of the string to start the filter.
       *
       * @prop {Number} [0] minLength
       */
      minLength: {
        type: Number,
        default: 2
      },
      /**
       * Specifies the time of delay.
       *
       * @prop {Number} [250] delay
       */
      delay: {
        type: Number,
        default: 250
      },
      /**
       * Specifies the mode of the filter.
       *
       * @prop {String} ['startswith'] filterMode
       */
      filterMode: {
        type: String,
        default: 'contains'
      },
      /**
       * Autobind defaults at false.
       *
       * @prop {Boolean} [false] autobind
       */
      autobind: {
        type: Boolean,
        default: false
      },
      /**
       * Defines if the component has to be disabled.
       * @prop {Boolean|Function} [false] disabled
       */
      disabled: {
        type: [Boolean, Function],
        default: false
      },
      /**
       * Set it to true if you want to auto-resize the input's width based on its value (in characters).
       * @prop {Boolean} [false] autosize
       */
        autosize: {
        type: Boolean,
        default: false
      },
      /**
       * The placeholder.
       * @prop {String} placeholder
       */
       placeholder: {
        type: String
      }
    },
    data(){
      return {
        /**
         * Indicates if the filter input is visible
         * @data {Boolean} [false] inputIsVisible
         */
        inputIsVisible: false,
        isDisabled: this.disabled
      }
    },
    methods: {
      /**
       * Shows the filter input
       * @method _setInputVisible
       */
      _setInputVisible(){
        this.filterString = this.currentText;
        this.inputIsVisible = true;
        this.$nextTick(() => {
          this.getRef('input').focus();
        })
      },
      onChange(){
        if (!this.ready) {
          this.ready = true;
        }
      },
      /**
       * Puts the focus on the element.
       *
       * @method click
       * @fires getRef
       */
      click(){
        if (!this.isDisabled) {
          this.getRef('input').focus();
          if (this.filteredData.length) {
            this.isOpened = !this.isOpened;
          }
        }
      },
      /**
       * Remove the filter and close the list if it is notabove it.
       *
       * @method leave
       * @fires getRef
       */
      leave(){
        if ( this.isOpened && !this.getRef('list').isOver ){
          this.isOpened = false;
        }
        this.inputIsVisible = false;
        this.filterString = '';
      },
      /**
       * Emits the event 'select'.
       *
       * @method select
       * @param {Object} item
       * @fires emitInput
       * @fires getRef
       * @emit change
       */
      select(item){
        if (item) {
          if (this.sourceUrl && item[this.sourceUrl]) {
            bbn.fn.link(item[this.sourceUrl]);
          }
          else if (this.sourceAction && item[this.sourceAction] && bbn.fn.isFunction(item[this.sourceAction])) {
            item[this.sourceAction](item);
          }
          else {
            this.$emit('select', item);
          }
          this.filterString = '';
        }
        this.isOpened = false;
      },
      /**
       * Function to do the reset and if the component is open it closes it.
       *
       * @method resetDropdown
       * @fires unfilter
       */
      resetDropdown(){
        this.currentText = this.currentTextValue;
        this.filterString = this.currentTextValue;
        this.unfilter();
        if ( this.isOpened ){
          this.isOpened = false;
        }
      },
      /**
       * Function that performs different actions based on what is being pressed.
       *
       * @method keydown
       * @param {Event} e
       * @fires resetDropdown
       * @fires commonKeydown
       * @fires keynav
       */
      keydown(e){
        if ( this.commonKeydown(e) ){
          return;
        }
        else if (this.isOpened && (e.key === 'Escape')) {
          e.stopPropagation();
          e.preventDefault();
          this.resetDropdown();
          return;
        }
        else if (bbn.var.keys.upDown.includes(e.keyCode)) {
          this.keynav(e);
        }
      },
    },
    watch: {
      disabled(v) {
        this.isDisabled = v;
      },
      /**
       * @watch filterString
       * @fires onResize
       * @fires unfilter
       * @param {String} v
       */
      filterString(v){
        if (!this.ready) {
          this.ready = true;
        }

        clearTimeout(this.filterTimeout);
        bbn.fn.log("CLEARED")
        if (!v && this.nullable && this.inputIsVisible) {
          bbn.fn.log("NO VALUE")
          this.unfilter();
          this.emitInput(null);
          this.currentText = '';
          if (this.currentData.length) {
            this.currentData.splice(0, this.currentData.length);
          }
        }
        else if (v) {
          bbn.fn.log("VALUE")
          if (v.length < this.minLength) {
            if (this.currentData.length) {
              this.currentData.splice(0, this.currentData.length);
            }
          }
          else if ((v !== this.currentText)) {
            bbn.fn.log("MIN PASSED")
            this.isOpened = false;
            this.filterTimeout = setTimeout(() => {
              // this.filterTimeout = false;
              // We don't relaunch the source if the component has been left
              if (this.isActive) {
                bbn.fn.log("UPDATING AUTOC");
                this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length ? 1 : 0, {
                  field: this.sourceText,
                  operator: this.filterMode,
                  value: v
                });
                this.updateData().then(() => {
                  this.isOpened = true;
                })
              }
            }, this.delay);
          }
        }
        else if ( !v ){
          this.unfilter();
        }
      }
    }
  };
