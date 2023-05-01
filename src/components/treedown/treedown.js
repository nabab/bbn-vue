/**
 * @file bbn-dropdown component
 *
 * @description The easy-to-implement bbn-dropdown component allows you to choose a single value from a user-supplied list.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 10/02/2017.
 */


return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.resizer
     * @mixin bbn.wc.mixins.list
     * @mixin bbn.wc.mixins.keynav
     * @mixin bbn.wc.mixins.url
      */
    mixins: 
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.events,
      bbn.wc.mixins.input,
      bbn.wc.mixins.list,
      bbn.wc.mixins.keynav,
      bbn.wc.mixins.url
    ],
    props: {
      /**
       * @prop {String} [''] textValue
       */
      textValue: {
        type: String,
        default: ''
      },
      /**
       * @prop {Number} [0] minLength
       */
      minLength: {
        type: Number,
        default: 0
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
       * Set to true so that the dropdown is not autofilled if empty
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
       * @prop {String} ['selection'] mode
       */
      mode: {
        type: String,
        default: 'selection'
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
       * @prop {(Number|String)} maxHeight
       */
      maxHeight: {
        type: [Number, String]
      }
    },
    data(){
      let isNullable = !!this.nullable;
      if ( this.nullable === null ){
        isNullable = this.required ? false : !!this.placeholder;
      }
      let cp = this.component || null;
      if (!cp && this.template) {
        cp = {
          props: ['source'],
          data(){
            return this.source;
          },
          template: this.template
        };
      }
      let autobind = true;
      if (
        (this.autobind === false) ||
        (this.isAjax && this.autocomplete && (this.filterString.length < this.minLength))
      ){
        autobind = false;
      }
      return {
        /**
         * @data {String} [''] filterString
         */
        filterString: this.textValue || '',
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
        isFilterable: true,
        filterTimeout: false,
        isActive: false
      };
    },
    computed: {
      currentTextValue(){
        if ( this.value && (this.mode === 'free') ){
          return this.value;
        }
        if ( this.value && this.sourceText && this.currentData.length ){
          let idx = bbn.fn.search(this.currentData, a => {
            return a.data[this.uid || this.sourceValue] === this.value;
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
      selectText() {
        let filter = this.getRef('filter');
        if (filter) {
          filter.setSelectionRange(0, filter.value.length);
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
       * @method enter
       * @param element 
       */
      enter(element){
        const height = bbn.fn.calculateHeight(element);
        element.style.height = 0;
        setTimeout(() => {
          element.style.height = height;
        });
      },
      click(){
        if (!this.isDisabled && this.filteredData.length) {
          this.isOpened = !this.isOpened;
          if ( this.autocomplete ){
            this.getRef('filter').focus();
          }
          else{
            this.getRef('input').focus();
          }
        }
      },
      /**
       * @method leave
       * @param element 
       */
      leave(){
        if ( this.isOpened && !this.getRef('list').isOver ){
          this.isOpened = false;
          //this.getRef('list').close();
        }
        /*
        if ( this.filterString && (this.filterString !== this.currentText) ){
          this.filterString = '';
        }
        */
      },
      /**
       * Emits the event 'select' 
       * @method select
       * @param {} item 
       * @emit change
       */
      select(item){
        if ( item && (item[this.uid || this.sourceValue] !== undefined) ){
          this.emitInput(item[this.uid || this.sourceValue]);
          this.$emit('change', item[this.uid || this.sourceValue]);
          if (this.autocomplete && this.isAjax) {
            this.$nextTick(() => {
              this.currentData = [{
                index: 0,
                data: item,
                selected: true
              }];
              this.currentText = item[this.sourceText];
              this.filterString = item[this.sourceText];
              this.$nextTick(() => {
                this.getRef('filter').focus();
                this.selectText();
              });
            });
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
          if ( list.overIdx > -1 ) {
            if (this.mode === 'free') {
              this.filterString = list.filteredData[list.overIdx].data[this.uid || this.sourceValue];
              return true;
            }
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
            bbn.var.keys.confirm.includes(e.which) || (
              !this.autocomplete && (e.key === ' ')
            )
          )
        ){
          e.preventDefault();
          let list = this.find('bbn-list');
          if (list.overIdx > -1) {
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
        if ( this.autocomplete ){
          this.filterString = this.currentTextValue;
        }
        this.unfilter();
        if ( this.isOpened ){
          this.isOpened = false;
        }
      },
      /**
       * States the role of the enter key on the dropdown menu.
       *
       * @method _pressEnter
       * @fires widget.select
       * @fires widget.open
       *
       */
      keydownInput(e){
        if ( this.commonKeydown(e) ){
          return;
        }
        else if ((e.key === 'Escape') || bbn.var.keys.dels.includes(e.which)) {
          this.resetDropdown();
        }
        else if (bbn.var.keys.upDown.includes(e.keyCode)) {
          this.keynav(e);
        }
        else if (e.key === ' ') {
          this.isOpened = !this.isOpened;
        }
        else if ( e.key.match(/^[A-z0-9]{1}$/)) {
          this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length ? 1 : 0, {
            field: this.sourceText,
            operator: 'startswith',
            value: e.key
          });
          if (!this.isOpened) {
            this.isOpened = true;
          }
        }
      },

      keydownFilter(e){
        if ( this.commonKeydown(e) ){
          return;
        }
        else if (e.key === 'Escape') {
          this.resetDropdown();
        }
        else if (bbn.var.keys.upDown.includes(e.keyCode)) {
          this.keynav(e);
        }
      },

      afterUpdate(){
        if (!this.ready) {
          this.ready = true;
        }
        this.onResize();
        let floater = this.getRef('list');
        if (floater.currentSelected === -1) {
          floater.currentSelected = 0;
        }
      },

      unfilter(){
        this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length);
      }
    },
    /**
     *
     * @event created
     */
    created(){
      this.$on('dataloaded', () => {
        if ( this.value !== undefined ){
          let row = bbn.fn.getRow(this.currentData, a => {
            return a.data[this.sourceValue] === this.value;
          });
          if ( row ){
            this.currentText = row.data[this.sourceText];
          }
        }
        if ( !this.currentText && !this.isNullable && this.filteredData.length ){
          this.emitInput(this.filteredData[0][this.sourceValue]);
        }
      });
      if (this.filterString && (this.filterString.length >= this.minLength)) {
        this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length ? 1 : 0, {
          field: this.sourceText,
          operator: 'startswith',
          value: this.filterString
        });
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
        })
      },
      /**
       * @watch filterString
       * @param {String} v
       */
      filterString(v){
        if ( !this.autocomplete ){
          return;
        }
        if (!this.ready) {
          this.ready = true;
        }
        if ( this.mode === 'free' ){
          this.emitInput(v);
        }
        clearTimeout(this.filterTimeout);
        // if (v !== this.currentText) {
        this.isOpened = false;
        this.filterTimeout = setTimeout(() => {
          this.filterTimeout = false;
          if ( this.isActive ){
            if (v && (v.length >= this.minLength)) {
              this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length ? 1 : 0, {
                field: this.sourceText,
                operator: 'startswith',
                value: v
              });
              this.$nextTick(() => {
                if (!this.isOpened){
                  this.isOpened = true;
                }
                else{
                  let list = this.find('bbn-scroll');
                  if ( list ){
                    list.onResize();
                  }
                }
              });
            }
            else {
              this.unfilter();
            }
          }
        }, this.delay);
        // }
        // else if ( !v ){
        //   this.unfilter();
        // }
      },
      source(){
        this.$once('dataloaded', () => {
          if ( this.filteredData.length ) {
            this.onResize();
          }
        });
        this.updateData();
      }
    }
  };
