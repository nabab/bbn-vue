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

  Vue.component('bbn-dropdown', {
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
    /**
     * The current icon.
     *
     * @computed currentIcon
     * @return {String}
    */
    computed: {
      currentIcon(){
        return this.isOpened && !this.disabled && !this.readonly && this.filteredData.length ?
            this.iconUp : this.iconDown;
        //isOpened && !disabled && !readonly && filteredData.length ? iconUp : iconDown
      },
    },
    methods: {
      /**
       * States the role of the enter key on the dropdown menu.
       *
       * @method keydown
       * @param {Event} e
       * @fires widget.select
       * @fires widget.open
       * @fires commonKeydown
       * @fires resetDropdown
       * @fires keynav
       */
      keydown(e){
        if ( e.key === 'Tab' ){
          if ( this.isOpened ){
            e.preventDefault();
            this.isOpened = false;
          }
          return;
        }
        e.preventDefault();
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
      /**
       * Leave list.
       *
       * @method keydown
       * @fires getRef
       */
      leave(){
        let lst = this.getRef('list');
        if (lst) {
          lst.leave();
        }
      }
    },
    /**
     * @event created
     */
    created(){
      this.$on('dataloaded', () => {
        if ( this.value !== undefined ){
          let row = bbn.fn.getRow(this.currentData, (a) => {
            return a.data[this.sourceValue] === this.value;
          });
          if ( row ){
            this.currentText = row.data[this.sourceText];
          }
        }
      })
    },
    watch: {
      /**
       * @watch  currentText
       * @emits input
      */
      currentText(newVal){
        if ( !newVal && this.ready && this.value && this.isNullable){
          this.emitInput('');
        }
      }
    }
  });

})(bbn);
