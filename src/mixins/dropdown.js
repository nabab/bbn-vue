((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    dropdownComponent: {
      props: {
        /**
         * @todo description
         *
         * @prop textValue
         */
        textValue: {
          type: String,
          default: ''
        },
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
         * @todo description
         *
         * @prop valueTemplate
         */
        mode: {
          type: String,
          default: 'selection'
        },
        /**
         * @todo description
         *
         * @prop {Number|String} valueTemplate
         */
        maxHeight: {
          type: [Number, String]
        },
        /**
         * @todo description
         * 
         * @prop {Boolean} [false] suggest
         */
        suggest: {
          type: Boolean,
          default: false
        }
      },
      data(){
        return {
          iconUp: 'nf nf-fa-caret_up',
          iconDown: 'nf nf-fa-caret_down',
          /**
           * @data {Boolean} [false] isOpened
           */
          isOpened: false,
          /**
           * @data {String} [''] currentText
           */
          currentText: this.textValue || '',
          /**
           * @data {Number} [0] currentWidth
           */
          currentWidth: 0,
          /**
           * @data {Number} [0] currentHeight
           */
          currentHeight: 0,
          isActive: false
        };
      },
      computed: {
        currentTextValue(){
          if ( this.value && this.sourceValue && this.sourceText && this.currentData.length ){
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
        }
      },
      methods: {
        selectAll() {
          let input = this.getRef('bbn-input');
          if (input) {
            input.setSelectionRange(0, input.value.length);
          }
        },
        /**
         * Handles the resize of the component
         * @method onResize
         */
        onResize(){
          this.currentWidth = this.$el.offsetWidth;
          this.currentHeight = this.$el.offsetHeight;
        },
        /**
         * Manages the click
         * @method onResize
         */
        click(){
          if (!this.disabled && this.filteredData.length && bbn.fn.isDom(this.$el)) {
            this.isOpened = !this.isOpened;
            this.$el.querySelector('input:not([type=hidden])').focus();
            //this.getRef('input').getRef('element').focus();
          }
        },
        /**
         * @method leave
         * @param element 
         */
        leave(){
          let lst = this.getRef('list');
          if ( lst ){
            lst.leave();
          }
        },
        /**
         * Emits the event 'select' 
         * @method select
         * @param {} item 
         * @emit change
         */
        select(item, idx, dataIndex, e){
          if ( item && (item[this.uid || this.sourceValue] !== undefined) ){
            if (!e || !e.defaultPrevented) {
              this.emitInput(item[this.uid || this.sourceValue]);
              this.$emit('change', item[this.uid || this.sourceValue]);
            }
          }
          this.isOpened = false;
        },
        commonKeydown(e){
          if (!this.filteredData.length || e.altKey || e.ctrlKey || e.metaKey) {
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
            return true;
          }
          else if (
            this.isOpened && (
              bbn.var.keys.confirm.includes(e.which) || (e.key === ' ')
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
          return false;
        },
        resetDropdown(){
          this.currentText = this.currentTextValue;
          this.unfilter();
          if ( this.isOpened ){
            this.isOpened = false;
          }
        },
        afterUpdate(){
          if (!this.ready) {
            this.ready = true;
          }
        },

        unfilter(){
          this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length);
        }
      },
      watch: {
        /**
         * @watch value
         * @param newVal 
         */
        value(){
          this.$nextTick(() => {
            this.currentText = this.currentTextValue;
          });
        },
        ready(v){
          if (v && this.suggest && !this.value && this.filteredData.length) {
            this.emitInput(this.filteredData[0].data[this.sourceValue]);
          }
        },
        source(){
          this.updateData().then(() => {
            if ( this.filteredData.length ) {
              this.onResize();
            }
          });
        }
      }
    }
  });
})(bbn);