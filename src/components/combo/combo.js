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


(function(bbn){
  "use strict";

  Vue.component('bbn-combo', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.eventsComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.keynavComponent
     * @mixin bbn.vue.urlComponent
     * @mixin bbn.vue.dropdownComponent
      */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.eventsComponent,
      bbn.vue.inputComponent,
      bbn.vue.resizerComponent,
      bbn.vue.listComponent,
      bbn.vue.keynavComponent,
      bbn.vue.urlComponent,
      bbn.vue.dropdownComponent
    ],
    props: {
      filterable: {
        default: true
      },
      minLength: {
        type: Number,
        default: 0
      },
      delay: {
        type: Number,
        default: 500
      }
    },
    methods: {
      click(){
        if (!this.disabled && this.filteredData.length) {
          this.getRef('input').focus();
          this.isOpened = !this.isOpened;
        }
      },
      /**
       * @method leave
       * @param element 
       */
      leave(){
        if ( this.isOpened && !this.getRef('list').isOver ){
          this.isOpened = false;
        }
      },
      /**
       * Emits the event 'select' 
       * @method select
       * @param {} item 
       * @emit change
       */
      select(item){
        if ( item && (item[this.sourceValue] !== undefined) ){
          this.emitInput(item[this.sourceValue]);
          this.$emit('change', item[this.sourceValue]);
          this.filterString = item[this.sourceText];
          this.$nextTick(() => {
            this.getRef('input').focus();
          });
        }
        this.isOpened = false;
      },
      resetDropdown(){
        this.filterString = this.currentTextValue;
        this.unfilter();
        if ( this.isOpened ){
          this.isOpened = false;
        }
      },
      keydown(e){
        if (e.key === 'Tab') {
          let list = this.find('bbn-list');
          if ( list.overIdx > -1 ) {
            this.filterString = list.filteredData[list.overIdx].data[this.sourceValue];
            return;
          }
        }
        if ((e.key === ' ') || this.commonKeydown(e)) {
          return;
        }
        if (e.key === 'Escape') {
          this.resetDropdown();
        }
        else if (bbn.var.keys.upDown.includes(e.keyCode)) {
          this.keynav(e);
        }
      },
    },
    /**
     * @event created
     */
    created(){
      this.$on.('dataloaded', () => {
        if ( this.value !== undefined ){
          let row = bbn.fn.getRow(this.currentData, (a) => {
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
    },
    watch: {
      value(){
        return;
      },
      /**
       * @watch filterString
       * @param {String} v 
       */
      filterString(v){
        if (!this.ready) {
          this.ready = true;
        }
        clearTimeout(this.filterTimeout);
        this.isOpened = false;
        this.filterTimeout = setTimeout(() => {
          this.filterTimeout = false;
          bbn.fn.log("IS IT ACTIVE???????", this.isActive);
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
          this.emitInput(v);
        }, this.delay);
      }
    }
  });

})(bbn);
