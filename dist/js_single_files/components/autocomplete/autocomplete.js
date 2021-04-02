((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-iblock', 'bbn-textbox', {'bbn-disabled': !!disabled}]"
     @mouseleave="leave"
     @focusin="isActive = true"
     @focusout="isActive = false"
>
  <div class="bbn-flex-width">
    <div class="bbn-flex-fill"
         @click.stop="click"
    >
      <bbn-input :disabled="disabled"
                class="bbn-unselectable bbn-no-border"
                :required="required"
                :readonly="readonly"
                :placeholder="inputIsVisible || isOpened ? '' : placeholder"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                :value="inputIsVisible || isOpened ? filterString : currentText"
                @focus="_setInputVisible"
                :style="{display: inputIsVisible ? 'none' : 'inline-block'}"
      ></bbn-input>
      <bbn-input v-if="!disabled && !readonly"
                :tabindex="0"
                class="bbn-no-border"
                v-model="filterString"
                ref="input"
                @focus="selectText"
                @blur="inputIsVisible = false"
                autocomplete="off"
                :required="required"
                :readonly="readonly"
                @keydown.stop="keydown"
                @change="ready = true"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                :name="name"
                :nullable="isNullable"
                :style="{display: inputIsVisible ? 'inline-block' : 'none'}"
      ></bbn-input>
    </div>
    <div class="bbn-list-component-button">
      <div v-if="isAjax && isLoading"
           class="bbn-middle"
      >
        <bbn-loadicon size="1.2em"
                      tabindex="-1"
        ></bbn-loadicon>
      </div>
      <bbn-button v-else
                  :icon="isOpened && !disabled && !readonly && filteredData.length ? iconUp : iconDown"
                  class="bbn-button-right bbn-no-vborder bbn-m"
                  @click.prevent.stop="click"
                  tabindex="-1"
                  :disabled="disabled"
      ></bbn-button>
    </div>
  </div>
  <input type="hidden"
         v-model="value"
         ref="element"
         :name="name"
  >
  <bbn-floater v-if="!disabled && !readonly && isOpened"
               :element="$el"
               :max-height="maxHeight"
               :min-width="$el.clientWidth"
               ref="list"
               :source-value="sourceValue"
               :source-text="sourceText"
               :item-component="realComponent"
               @select="select"
               :selected="[value]"
               @close="isOpened = false"
               :source="filteredData"
  ></bbn-floater>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-autocomplete');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
 * @file bbn-autocomplete component
 * @description The autocomplete allows to select a single value from a list of items by proposeing suggestions based on the typed characters.
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 10/02/2017.
 */


(function(bbn){
  "use strict";

  Vue.component('bbn-autocomplete', {
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
      /**
       * For to apply the filters or not.
       *
       * @prop {Boolean} filterable
       */
      filterable: {
        default: true
      },
      /**
       * To define the length of the string to start the filter.
       *
       * @prop {Number} [0] minLength
       */
      minLength: {
        type: Number,
        default: 0
      },
      /**
       * Specifies the time of delay.
       *
       * @prop {Number} [10] delay
       */
      delay: {
        type: Number,
        default: 10
      },
      /**
       * Specifies the mode of the filter.
       *
       * @prop {String} ['startswith'] filterMode
       */
      filterMode: {
        type: String,
        default: 'startswith'
      }
    },
    data(){
      return {
        /**
         * Indicates if the filter input is visible
         * @data {Boolean} [false] inputIsVisible
         */
        inputIsVisible: false
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
      /**
       * Puts the focus on the element.
       *
       * @method click
       * @fires getRef
       */
      click(){
        if (!this.disabled) {
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
        this.filterString = '';
        this.inputIsVisible = false;
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
        if ( item && (item[this.sourceValue] !== undefined) ){
          this.emitInput(item[this.sourceValue]);
          this.$emit('change', item[this.sourceValue]);
          this.currentText = item[this.sourceText];
          this.filterString = item[this.sourceText];
          this.$nextTick(() => {
            this.getRef('input').focus();
          });
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
     * @fires emitInput
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
        if ( !this.currentText && !this.isNullable && this.filteredData.length ){
          this.emitInput(this.filteredData[0][this.sourceValue]);
        }
      });
    },
    watch: {
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
        if (v !== this.currentText) {
          this.isOpened = false;
          this.filterTimeout = setTimeout(() => {
            this.filterTimeout = false;
            // We don't relaunch the source if the component has been left
            if ( this.isActive ){
              if (v && (v.length >= this.minLength)) {
                this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length ? 1 : 0, {
                  field: this.sourceText,
                  operator: this.filterMode,
                  value: v
                });
                this.$nextTick(() => {
                  if ( !this.isOpened ){
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
        }
        else if ( !v ){
          this.unfilter();
        }
      }
    }
  });

})(bbn);


})(bbn);