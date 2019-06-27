/**
 * @file bbn-search component
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

  Vue.component('bbn-search', {
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
      filtselection: {
        default: false
      },
      filterable: {
        default: true
      },
      autobind: {
        default: true
      },
      nullable: {
        default: false
      },
      minLength: {
        type: Number,
        default: 1
      },
      leftIcon: {
        default: false
      },
      rightIcon: {
        default: 'nf nf-fa-search'
      },
      minWidth: {
        default: '4em'
      },
      maxWidth: {
        default: '100%'
      },
      delay: {
        type: Number,
        default: 500
      }
    },
    data(){
      return {
        /**
         * @data {String} [''] filterString
         */
        filterString: this.textValue || '',
        filterTimeout: false,
        specialWidth: this.minWidth,
        currentPlaceholder: '?'
      };
    },
    methods: {
      click(){
        if (!this.disabled) {
          this.getRef('input').focus();
        }
      },
      focus(){
        this.isFocused = true;
        this.specialWidth = this.maxWidth;
        this.currentPlaceholder = this.placeholder;
      },
      blur(){
        this.isFocused = false;
        this.specialWidth = this.minWidth;
        this.filterString = '';
        this.currentPlaceholder = '?';
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
      select(item, idx, dataIndex){
        if ( item && (item[this.sourceValue] !== undefined) ){
          let ev = new Event('select', {cancelable: true});
          this.$emit('select', ev, item, idx, dataIndex);
          if ( !ev.defaultPrevented ){
            this.currentText = item[this.sourceText];
            this.filterString = item[this.sourceText];
            this.emitInput(item[this.sourceValue]);
            this.$emit('change', item[this.sourceValue]);
            this.$nextTick(() => {
              this.getRef('input').focus();
            });
          }
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
      keydown(e){
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
    watch: {
      /**
       * @watch filterString
       * @param {String} v 
       */
      filterString(v){
        if (!this.ready) {
          this.ready = true;
        }
        clearTimeout(this.filterTimeout);
        if (v !== this.currentText) {
          this.isOpened = false;
          this.filterTimeout = setTimeout(() => {
            this.filterTimeout = false;
            // We don't relaunch the source if the component has been left
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
          }, 10);
        }
      }
    }
  });

})(bbn);
