((bbn) => {
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
        }
      },
      data(){
        return {
          /**
           * The icon representing the arrow up.
           * @data {String} ['nf nf-fa-caret_up'] iconUp
           * @memberof dropdownComponent
           */
          iconUp: 'nf nf-fa-caret_up',
          /**
           * The icon representing the arrow down.
           * @data {String} ['nf nf-fa-caret_down'] iconDown
           * @memberof dropdownComponent
           */
          iconDown: 'nf nf-fa-caret_down',
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
          realButtons: []
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
        currentTextValue(){
          if ( (this.value !== undefined) && !bbn.fn.isNull(this.value) && this.sourceValue && this.sourceText && this.currentData.length ){
            let idx = bbn.fn.search(this.currentData, (a) => {
              return a.data[this.sourceValue] === this.value;
            });
            if ( idx > -1 ){
              return this.currentData[idx].data[this.sourceText];
            }
          }
          else if ( this.textValue ){
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
          if (!this.disabled && !this.readonly && this.filteredData.length && bbn.fn.isDom(this.$el)) {
            this.isOpened = !this.isOpened;
            if (this.writable) {
              this.$el.querySelector('input:not([type=hidden])').focus();
            }
            //this.getRef('input').getRef('element').focus();
          }
        },
        /**
         * Closes the floater menu of the component.
         * @method leave
         * @param element 
         * @memberof dropdownComponent
         */
        leave(){
          let lst = this.getRef('list');
          if ( lst ){
            lst.close(true);
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
        select(item, idx, dataIndex, e){
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
        /**
         * Defines the behavior of component when the key 'alt' or a common key defined in the object bbn.var.keys is pressed. 
         * @method commonKeydown
         * @memberof dropdownComponent
         * @param {Event} e 
         */
        commonKeydown(e){
          if (!this.filteredData.length || e.altKey || e.ctrlKey || e.metaKey) {
            return;
          }
          if ((e.key.length >= 2) && (e.key[0] === 'F')) {
            return;
          }
          if (e.key === 'Tab') {
            let list = this.find('bbn-list');
            if ( list && (list.overIdx > -1)) {
              if ( !this.value ){
                this.emitInput(list.filteredData[list.overIdx].data[this.uid || this.sourceValue]);
                return true;
              }
            }
            this.resetDropdown();
            this.isOpened = false;
            return true;
          }
          else if (
            this.isOpened && (
              bbn.var.keys.confirm.includes(e.which) || ((e.key === ' ') && !this.isSearching)
            )
          ){
            e.preventDefault();
            let list = this.find('bbn-list');
            if (list && (list.overIdx > -1)) {
              this.select(list.filteredData[list.overIdx].data);
            }
            else if (this.isNullable) {
              this.selfEmit('');
            }
            return true;
          }
          bbn.fn.log("Common keydown from mixin (return false)");
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
        }
      },
      beforeMount() {
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