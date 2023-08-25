(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Dropdown Component.
     *
     * @component dropdownComponent
     */
    dropdownComponent: {
      props: {
        /**
         * The text corresponding to the value of the component.
         * @memberof dropdownComponent
         * @prop {String} [''] textValue
         */
        textValue: {
          type: String,
          default: ''
        },
        /**
         * @todo description
         * @memberof dropdownComponent
         * @prop valueTemplate
         */
        valueTemplate: {},
        /**
         * Defines the groups for the dropdown menu.
         * @memberof dropdownComponent
         * @prop {String} group
         */
        group: {
          type: String
        },
        /**
         * Defines the mode of the dopdown menu.
         * @memberof dropdownComponent
         * @prop {String} ['selection'] mode
         */
        mode: {
          type: String,
          default: 'selection'
        },
        /**
         * The max-height of the component.
         * @memberof dropdownComponent
         * @prop {Number|String} maxHeight
         */
        maxHeight: {
          type: [Number, String]
        },
        /**
         * Defines whether or not the component has to suggest a value when start typing.
         * @memberof dropdownComponent
         * @prop {Boolean} [false] suggest
         */
        suggest: {
          type: Boolean,
          default: false
        },
        /**
         * Defines whether or not the floater has to be set mobile view.
         * @memberof dropdownComponent
         * @prop {Boolean} [false] mobile
         */
        mobile: {
          type: Boolean,
          default: true
        },
        /**
         * Preloads the floater
         * @memberof dropdownComponent
         * @prop {Boolean} [false] preload
         */
        preload: {
          type: Boolean,
          default: false
        },
        /**
         * Adds the close button to floater header
         * @memberof dropdownComponent
         * @prop {Boolean} [false] closable
         */
        closable: {
          type: Boolean,
          default: false
        },
        /**
         * The floater bottom buttons
         * @memberof dropdownComponent
         * @prop {Array} buttons
         */
        buttons: {
          type: Array
        },
        /**
         * The floater title
         * @memberof dropdownComponent
         * @prop {String} floaterTitle
         */
        floaterTitle: {
          type: String
        },
        /**
         * Using an external popup component to open the floater
         * @memberof dropdownComponent
         * @prop {Boolean|Vue} popup
         */
        popup: {
          type: [Boolean, Vue],
          default: false
        },
        /**
         * Using the browser native render
         * @memberof dropdownComponent
         * @prop {Boolean} native
         */
        native: {
          type: Boolean,
          default: false
        },
        /**
         * The icon representing the arrow up.
         * @prop {String} ['nf nf-fa-caret_up'] iconUp
         * @memberof dropdownComponent
         */
        iconUp: {
          type: String,
          default: 'nf nf-fa-caret_up'
        },
        /**
         * The icon representing the arrow down.
         * @prop {String} ['nf nf-fa-caret_down'] iconDown
         * @memberof dropdownComponent
         */
        iconDown: {
          type: String,
          default: 'nf nf-fa-caret_down'
        },
        /**
         * Convertes the current text from HTML code to pure text.
         * @prop {Boolean} [false] clearHtml
         * @memberof dropdownComponent
         */
        clearHtml: {
          type: Boolean,
          default: false
        },
        /**
         * @prop {Boolean} [false] groupable
         * @memberof dropdownComponent
         */
         groupable: {
          type: Boolean,
          default: false
        },
        /**
         * @prop {String} ['group'] sourceGroup
         * @memberof dropdownComponent
         */
        sourceGroup: {
          type: String,
          default: 'group'
        },
        /**
         * @prop {(String|Object|Vue)} groupComponent
         * @memberof dropdownComponent
         */
        groupComponent: {
          type: [String, Object, Vue]
        },
        /**
         * @prop {String} groupStyle
         * @memberof dropdownComponent
         */
        groupStyle: {
          type: String
        },
        /**
         * @prop {Number} closeDelay The time it will take for the floater/menu to close when the mouse leaves
         * @memberof dropdownComponent
         * This  allows to cancel if the mouse comes back
         */
        closeDelay: {
          type: Number,
          default: 1000
        },
        /**
         * @prop {String} ['disabled'] sourceDisabled
         * @memberof dropdownComponent
         */
        sourceDisabled: {
          type: String,
          default: 'disabled'
        }
      },
      data(){
        return {
          /**
           * True when the user's mouse is over the dropdown element or its list
           * @data {Bool} [false] isOverDropdown
           * @memberof dropdownComponent
           */
          isOverDropdown: false,
          /**
           * The timeout before closing the floater
           * @data {int} [0] closeTimeout
           * @memberof dropdownComponent
           */
          closeTimeout: 0,
          /**
           * True if the floating menu of the component is opened.
           * @data {Boolean} [false] isOpened
           * @memberof dropdownComponent
           */
          isOpened: false,
          /**
           * The text corresponding to the value of the component.
           * @data {String} [''] currentText
           * @memberof dropdownComponent
           */
          currentText: this.textValue || '',
          /**
           * The current width of the component.
           * @data {Number} [0] currentWidth
           * @memberof dropdownComponent
           */
          currentWidth: 0,
          /**
           * The current height of the component.
           * @data {Number} [0] currentHeight
           * @memberof dropdownComponent
           */
          currentHeight: 0,
          /**
           * Whether or not the component is active.
           * @data {Boolean} false isActive
           * @memberof dropdownComponent
           */
          isActive: false,
          /**
           * The floater buttons
           * @data {Array} [[]] realButtons
           * @memberof dropdownComponent
           */
          realButtons: [],
          /**
           * The value of the native select elemenet
           * @data {String|Number|Boolean} currentSelectValue
           * @memberof dropdownComponent
           */
          currentSelectValue: this.value,
          /**
           * The floater component
           * @data {Vue} list
           * @memberof dropdownComponent
           */
          list: null,
          portalSelector: null,
          isInsideFloater: false
        };
      },
      computed: {
        popupComponent(){
          if (this.popup) {
            if (this.popup === true) {
              return this.getPopup();
            }
            else {
              return this.popup;
            }
          }
        },
        /**
         * Returns the current 'text' corresponding to the value of the component.
         * @computed currentTextValue
         * @memberof dropdownComponent
         * @returns {String}
         */
        currentTextValue() {
          if ( (this.value !== undefined) && !bbn.fn.isNull(this.value) && this.sourceValue && this.sourceText && this.currentData?.length ){
            let idx = bbn.fn.search(this.currentData, a => {
              return a.data[this.sourceValue] === this.value;
            });
            if ( idx > -1 ){
              if (this.clearHtml) {
                return bbn.fn.html2text(this.currentData[idx].data[this.sourceText]);
              }
              return this.currentData[idx].data[this.sourceText];
            }
          }
          else if (this.value && this.textValue) {
            return this.textValue;
          }
          return '';
        },
        /**
         * @computed isSerching
         * @memberof dropdownComponent
         * @return {Boolean}
         */
        isSearching(){
          return this.currentText !== this.currentTextValue;
        },
        /**
         * @computed asMobile
         * @memberof dropdownComponent
         * @return {Boolean}
         */
        asMobile(){
          return this.isMobile && this.mobile;
        },
        /**
         * @computed currentIcon
         * @memberof dropdownComponent
         * @return {String}
         */
         currentIcon(){
          return this.isOpened && !this.isDisabled && !this.readonly && this.filteredData.length ?
              this.iconUp : this.iconDown;
        }
      },
      methods: {
        /**
         * Select the string of text inside of the input.
         * @method selectText
         * @memberof dropdownComponent
         */
        selectText(){
          this.getRef('input').selectText();
        },
          /**
         * Handles the resize of the component
         * @method onResize
         * @memberof dropdownComponent
         */
        onResize(){
          this.currentWidth = this.$el.offsetWidth;
          this.currentHeight = this.$el.offsetHeight;
        },
        /**
         * Manages the click
         * @method click
         * @memberof dropdownComponent
         */
        click(){
          if (!this.disabled && !this.readonly && !this.native && this.filteredData.length && bbn.fn.isDom(this.$el)) {
            this.isOpened = !this.isOpened;
            if (this.writable) {
              this.$el.querySelector('input:not([type=hidden])').focus();
            }
            //this.getRef('input').getRef('element').focus();
          }
        },
        /**
         * Emits the event 'select' 
         * @method select
         * @param {Object} item 
         * @param {Number} idx 
         * @param {Number} dataIndex 
         * @param {Event} e 
         * @emit change
         * @memberof dropdownComponent
         */
        select(item, idx, dataIndex, e) {
          if (item && (!e || !e.defaultPrevented)) {
            if (this.sourceAction && item[this.sourceAction] && bbn.fn.isFunction(item[this.sourceAction])) {
              item[this.sourceAction](item);
            }
            else if (item[this.uid || this.sourceValue] !== undefined) {
              this.emitInput(item[this.uid || this.sourceValue]);
              this.$emit('change', item[this.uid || this.sourceValue], idx, dataIndex, e);
            }
          }
          this.isOpened = false;
        },
        attachList() {
          let list = this.getRef('list');
          bbn.fn.log("attahc", list);
          if (list) {
            this.list = list;
          }
        },
        /**
         * Defines the behavior of component when the key 'alt' or a common key defined in the object bbn.var.keys is pressed. 
         * @method commonKeydown
         * @memberof dropdownComponent
         * @param {Event} e 
         * @return {Boolean}
         */
        selectOver() {
          if (this.list) {
            let lst = this.list.getRef('list');
            if (lst && (lst.overIdx > -1)) {
              this.select(lst.filteredData[lst.overIdx].data);
            }
          }
        },
        /**
         * Defines the behavior of component when the key 'alt' or a common key defined in the object bbn.var.keys is pressed. 
         * @method commonKeydown
         * @memberof dropdownComponent
         * @param {Event} e 
         * @return {Boolean}
         */
        commonKeydown(e) {
          if (e.altKey || e.ctrlKey || e.metaKey) {
            return true;
          }

          if ((e.key.length >= 2) && (e.key[0] === 'F')) {
            return true;
          }

          if (e.key === 'Tab') {
            if (this.isOpened) {
              this.selectOver();
              return true;
            }
            this.resetDropdown();
            this.isOpened = false;
            return true;
          }
          else if (
            this.isOpened && (
              bbn.var.keys.confirm.includes(e.which) || ((e.key === ' ') && !this.isSearching)
            )
          ) {
            e.preventDefault();
            this.selectOver();
            return true;
          }

          return false;
        },
        /**
         * Resets the dropdow to its inizial conditions.
         * @method resetDropdown
         * @memberof dropdownComponent
         */
        resetDropdown(){
          this.currentText = this.currentTextValue;
          this.unfilter();
          if ( this.isOpened ){
            this.isOpened = false;
          }
        },
        /**
         * Forces the prop 'ready' to be true.
         * @method afterUpdate
         * @memberof dropdownComponent
         */
        afterUpdate(){
          if (!this.ready) {
            this.ready = true;
          }
        },
        /**
         * Resets the filters of the dropdown to the initial conditions.
         * @method unfilter
         * @memberof dropdownComponent
         */
        unfilter(){
          this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length);
          if (this.currentFilters.logic && (this.currentFilters.logic.toLowerCase() === 'or')) {
            this.currentFilters.logic = 'AND';
          }
        },
        /**
         * Gets the buttons list
         * @method getRealButtons
         * @memberof dropdownComponent
         * @return {Array}
         */
        getRealButtons(){
          let btns = [];
          if (bbn.fn.isArray(this.buttons)) {
            bbn.fn.each(this.buttons, btn => {
              if (bbn.fn.isString(btn)) {
                if (btn === 'close') {
                  btns.push({
                    text: bbn._('Close'),
                    icon: 'nf nf-fa-times_circle',
                    action: () => {
                      this.isOpened = false;
                    }
                  });
                }
              }
              else {
                btns.push(btn);
              }
            })
          }
          return btns;
        },
        /**
         * Updates the buttons
         * @method updateButtons
         * @memberof dropdownComponent
         */
        updateButtons(){
          this.realButtons.splice(0, this.realButtons.length, ...this.getRealButtons());
        },
        onFocusOut(){
          this.isActive = false;
          if (this.native) {
            this.isOpened = false;
          }
        }
      },
      beforeMount() {
        let ct = this.closest('bbn-container');
        this.portalSelector = ct ? ct.$el : document.body;
        this.isInsideFloater = !!this.closest('bbn-floater');
        this.updateButtons();
      },
      watch: {
        /**
         * @watch value
         * @memberof dropdownComponent
         */
        value(){
          this.$nextTick(() => {
            this.currentText = this.currentTextValue;
          });
        },
        /**
         * Closes the floater menu of the component.
         * @method leave
         * @param element 
         * @memberof dropdownComponent
         */
        isOverDropdown(v) {
          if (v) {
            clearTimeout(this.closeTimeout);
          }
          else {
            this.closeTimeout = setTimeout(() => {
              let lst = this.getRef('list');
              if ( lst ){
                bbn.fn.log("SHOULD CLOSE");
                lst.close(true);
              }
            }, this.closeDelay);
          }
        },
        /**
         * @watch ready
         * @memberof dropdownComponent
         */
        ready(v){
          if (v && this.suggest && !this.value && this.filteredData.length) {
            this.emitInput(this.filteredData[0].data[this.sourceValue]);
          }
        },
        /**
         * @watch source
         * @memberof dropdownComponent
         */
        source(){
          this.updateData().then(() => {
            if ( this.filteredData.length ) {
              this.onResize();
            }
          });
        },
        /**
         * @watch buttons
         * @memberof dropdownComponent
         */
        buttons: {
          deep: true,
          handler(){
            this.updateButtons();
          }
        }
      }
    }
  });
})(bbn);