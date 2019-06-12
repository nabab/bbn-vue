/**
 * @file bbn-dropdown component
 *
 * @description The easy-to-implement bbn-dropdown component lets you choose a single default value from a user-supplied list.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 10/02/2017.
 */


(function(bbn){
  "use strict";

  Vue.component('bbn-dropdown', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.sourceArrayComponent
     * @mixin bbn.vue.urlComponent
      */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.eventsComponent,
      bbn.vue.inputComponent,
      bbn.vue.resizerComponent,
      bbn.vue.sourceArrayComponent,
      bbn.vue.urlComponent
    ],
    props: {
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
    },
    data(){
      let isNullable = !!this.nullable;
      if ( this.nullable === null ){
        isNullable = this.required ? false : !!this.placeholder;
      }
      return {
        /**
         * @data [null] _list
         */
        _list: null,
        /**
         * @data {String} [''] filterString
         */
        filterString: '',
        /**
         * @data [null] vlist
         */
        vlist: null,
        /**
         * @data {Boolean} [false] isOpened
         */
        isOpened: false,
        /**
         * @data {String} [''] currentText
         */
        currentText: '',
        /**
         * @data {Number} [0] currentWidth
         */
        currentWidth: 0,
        /**
         * @data {Number} [0] currentHeight
         */
        currentHeight: 0,
        isNullable: isNullable
      };
    },
    methods: {
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
        bbn.fn.log(height);
        element.style.height = 0;
        setTimeout(() => {
          element.style.height = height;
        });
      },
      /**
       * @method leave
       * @param element 
       */
      leave(element){
        const height = getComputedStyle(element).height;
        element.style.height = height;
        // Force repaint to make sure the
        // animation is triggered correctly.
        getComputedStyle(element).height;
        setTimeout(() => {
          element.style.height = 0;
        });
      },
      /**
       * @method init
       */
      init(){
        this._list = this.getRef('list');
      },
      /**
       * Emits the event select 
       * @method select
       * @param {} item 
       * @emit change
       */
      select(item){
        if ( item && (item[this.sourceValue] !== undefined) ){
          this.emitInput(item[this.sourceValue]);
          this.$emit('change', item[this.sourceValue]);
        }
        this.isOpened = false;
      },
      /**
       * @method  clickContainer
       * @fires focus
       * 
       */
      clickContainer(){
        this.isOpened = !this.isOpened;
        if ( !this.isFocused ){
          this.focus();
        }
      },
      /**
       * States the role of the enter button on the dropdown menu.
       *
       * @method _pressEnter
       * @fires widget.select
       * @fires widget.open
       *
       */
      keydown(e){
        if ( !this.filteredData.length || e.altKey || e.ctrlKey || e.metaKey ){
          return;
        }
        if ( e.key === ' '){
          this.isOpened = !this.isOpened;
        }
        if ( e.key === 'Escape'){
          if ( this.currentFilters.conditions.length ){
            this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length);
          }
        }
        else if ( e.key.match(/^[A-z0-9]{1}$/) ){
          this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length ? 1 : 0, {
            field: this.sourceText,
            operator: 'startswith',
            value: e.key
          });
          this.$nextTick(() => {
            if ( this.filteredData.length ){
              let values = this.filteredData.map((a) => {
                return a[this.sourceValue];
              });
              // We check if we already have one selected
              let idx = values.indexOf(this.value);
              if ( ((values.length - 1) > idx) && (idx > -1) ){
                // If so we take the next one
                idx++;
              }
              else{
                idx = 0;
              }
              if ( values[idx] !== this.value ){
                this.select(this.filteredData[idx]);
              }
            }
          });
        }
        else if ( bbn.var.keys.upDown.indexOf(e.keyCode) > -1 ){
          e.preventDefault();
          let idx = bbn.fn.search(this.filteredData, this.sourceValue, this.value);
          switch ( e.keyCode ){
            // Arrow down
            case 40:
              if ( this.filteredData[idx+1] ){
                this.select(this.filteredData[idx+1]);
              }
              break;
            // Arrow Up
            case 38:
            if ( this.filteredData[idx-1] ){
                this.select(this.filteredData[idx-1]);
              }
              break;
            // Page down (10)
            case 34:
              this.select(this.filteredData[this.filteredData[idx+10] ? idx + 10 : this.filteredData.length - 1]);
              break;
            // Page up (10)
            case 33:
              this.select(this.filteredData[this.filteredData[idx-10] ? idx-10 : 0]);
              break;
            // End
            case 35:
              this.select(this.filteredData[this.filteredData.length - 1]);
              break;
            // Home
            case 36:
              this.select(this.filteredData[0]);
              break;

          }
        }
      },
    },
    mounted(){
      /**
       *
       * @event mounted
       * @fires updateData
       * @fires onResize
       * @return {Boolean}
       */
      this.updateData().then(() => {
        if ( this.value !== undefined ){
          let row = bbn.fn.get_row(this.currentData, this.sourceValue, this.value);
          if ( row ){
            this.currentText = row[this.sourceText];
          }
        }
        if ( !this.currentText && !this.isNullable && this.filteredData.length ){
          this.emitInput(this.filteredData[0][this.sourceValue]);
        }
        this.onResize();
        this.ready = true;
      });
    },
    watch: {
      /**
       * @watch value
       * @param newVal 
       * @param oldVal 
       */
      value(newVal, oldVal){
        let row = bbn.fn.get_row(this.currentData, this.sourceValue, newVal);
        if ( row ){
          this.currentText = row[this.sourceText];
        }
      },
      /**
       * @watch filterString
       * @param {String} nVal 
       */
      filterString(nVal){
        if ( nVal ){
          if ( !this._list.currentFilters.conditions.length ){
            this._list.currentFilters.conditions.push({
              field: 'text',
              operator: 'startswith',
              value: nVal
            });
          }
          else {
            this_list.$set(this._list.currentFilters.conditions[0], 'value', nVal);
          }
        }
        else if ( this._list.currentFilters.conditions.length ){
          this._list.currentFilters.conditions.splice(0, this._list.currentFilters.conditions.length);
        }
      }
    }
  });

})(bbn);
