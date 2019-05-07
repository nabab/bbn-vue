/**
 * @file bbn-dropdown component
 *
 * @description the easy-to-implement bbn-dropdown component lets you choose a single default value from a user-supplied list.
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
       * @prop {} template
       */
      template: {},
      /**
       * @todo description
       *
       * @prop {} valueTemplate
       */
      valueTemplate: {},
      /**
       * Define the groups for the dropdown menu.
       * @prop {String} group
       */
      group: {
        type: String
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
      return {
        _list: null,
        filterString: '',
        vlist: null,
        isOpened: false,
        currentText: '',
        currentWidth: 0,
        currentHeight: 0
      };
    },
    methods: {
      onResize(){
        this.currentWidth = this.$el.offsetWidth;
        this.currentHeight = this.$el.offsetHeight;
      },
      enter(element){
        const height = bbn.fn.calculateHeight(element);
        bbn.fn.log(height);
        element.style.height = 0;
        setTimeout(() => {
          element.style.height = height;
        })
      },

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
      init(){
        this._list = this.getRef('list');
      },
      select(item){
        if ( item && (item[this.sourceValue] !== undefined) ){
          this.emitInput(item[this.sourceValue]);
          this.$emit('change', item[this.sourceValue]);
        }
        this.isOpened = false;
      },
      clickContainer(){
        if ( this.isFocused ){
          this.isOpened = !this.isOpened;
        }
        else {
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
        bbn.fn.log(e);
        if ( !this.filteredData.length || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey ){
          return;
        }
        if ( e.key === ' '){
          this.isOpened = !this.isOpened;
        }
        else if ( e.key.match(/^[A-z0-9]{1}$/) ){
          let filtered = bbn.fn.filter(this.filteredData, {
            conditions: [
              {
                field: this.sourceText,
                operator: 'startswith',
                value: e.key
              }
            ],
            logic: 'AND'
          });
          if ( filtered.length ){
            let values = filtered.map((a) => {
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
              this.select(values[idx]);
            }
          }
        }
        else if ( bbn.var.keys.upDown.indexOf(e.keyCode) > -1 ){
          let idx = bbn.fn.search(this.filteredData, this.sourceValue, this.value);
          switch ( e.keyCode ){
            // Arrow down
            case 40:
              if ( this.filteredData[idx+1] ){
                this.select(this.filteredData[idx+1][this.sourceValue]);
              }
              break;
            // Arrow Up
            case 38:
            if ( this.filteredData[idx-1] ){
                this.select(this.filteredData[idx-1][this.sourceValue]);
              }
              break;
            // Page down (10)
            case 34:
              this.select(this.filteredData[this.filteredData[idx+10] ? idx + 10 : this.filteredData.length - 1][this.sourceValue]);
              break;
            // Page up (10)
            case 33:
              this.select(this.filteredData[this.filteredData[idx-10] ? idx-10 : 0][this.sourceValue]);
              break;
            // End
            case 35:
              this.select(this.filteredData[this.filteredData.length - 1][this.sourceValue]);
              break;
            // Home
            case 36:
              this.select(this.filteredData[0][this.sourceValue]);
              break;

          }
        }
      },
    },
    mounted(){
      /**
       * @todo description
       *
       * @event mounted
       * @return {Boolean}
       */
      this.updateData().then(() => {
        if ( this.value !== undefined ){
          let row = bbn.fn.get_row(this.currentData, this.sourceValue, this.value);
          if ( row ){
            this.currentText = row[this.sourceText];
          }
        }
        this.onResize();
        this.ready = true;
      });
    },
    watch: {
      isOpened(newVal){
        this._list[newVal ? 'show' : 'hide']();
      },
      value(newVal, oldVal){
        let row = bbn.fn.get_row(this.currentData, this.sourceValue, newVal);
        bbn.fn.log(newVal, row);
        if ( row ){
          this.currentText = row[this.sourceText];
        }
      },
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
