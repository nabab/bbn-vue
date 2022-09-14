((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[
       componentClass,
       'bbn-iblock',
       'bbn-textbox',
       {'bbn-disabled': !!isDisabled}
     ]"
     @mouseenter="isOverDropdown = true"
     @mouseleave="isOverDropdown = false"
     @focusin="isActive = true"
     @focusout="onFocusOut">
  <div :class="['bbn-rel', 'bbn-autocomplete-container', 'bbn-flex-width', 'bbn-vmiddle', currentItemCls, {
    'bbn-autocomplete-container-native': native
  }]">
    <div v-if="sourceIcon && hasValue && !!currentItemIcon"
         class="bbn-left-xspadded">
      <i :class="currentItemIcon"
         @click.stop="click" />
    </div>
    <div v-if="sourceImg && hasValue && !!currentItemImg"
         class="bbn-left-xspadded">
      <img :src="currentItemImg"
           @click.stop="click"
           :alt="currentItemImg">
    </div>
    <bbn-input :disabled="isDisabled"
               class="bbn-no-border bbn-flex-fill bbn-unselectable"
               :required="required"
               :readonly="readonly"
               :placeholder="inputIsVisible || isOpened ? '' : placeholder"
               autocorrect="off"
               autocapitalize="off"
               spellcheck="false"
               :value="inputIsVisible || isOpened ? filterString : currentText"
               :button-right="currentIcon"
               :button-right-disabled="!filteredData.length"
               :action-right="() => {isOpened = !isOpened}"
               :autosize="autosize"
               :nullable="isNullable"
               :force-nullable="isNullable"
               @focus="_setInputVisible"
               v-show="!inputIsVisible"/>
    <bbn-input v-if="!isDisabled && !readonly"
               v-show="inputIsVisible"
                :tabindex="0"
                class="bbn-no-border bbn-i"
                v-model="filterString"
                ref="input"
                @focus="selectText"
                @blur="inputIsVisible = false"
                autocomplete="off"
                :required="required"
                :readonly="readonly"
                @keydown.stop="keydown"
                @change="onChange"
                :autosize="autosize"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                :name="name"
                :button-right="currentIcon"
                :button-right-disabled="!filteredData.length"
                :action-right="() => {isOpened = !isOpened}"
                :nullable="isNullable"
                :force-nullable="isNullable"/>
  </div>
  <input type="hidden"
         v-model="value"
         ref="element"
         :name="name">
  <bbn-portal v-if="portalSelector"
              :selector="portalSelector">
    <bbn-floater v-if="!popup
                    && filteredData.length
                    && !isDisabled
                    && !readonly
                    && !native
                    && ready
                    && isOpened"
                :element="asMobile ? undefined : $el"
                :max-height="asMobile ? undefined : maxHeight"
                :min-width="$el.clientWidth"
                :width="asMobile ? '100%' : undefined"
                :height="asMobile ? '100%' : undefined"
                ref="list"
                :children="null"
                :source-value="sourceValue"
                :source-text="sourceText"
                :source-url="sourceUrl"
                :source-icon="sourceIcon"
                :title="floaterTitle"
                :buttons="asMobile ? realButtons : []"
                :item-component="realComponent"
                @mouseenter="isOverDropdown = true"
                @mouseleave="isOverDropdown = false"
                @ready="attachList"
                @select="select"
                :selected="value ? [value] : []"
                @close="isOpened = false"
                :source="filteredData"/>
  </bbn-portal>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-autocomplete');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

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
        type: Boolean,
        default: true
      },
      /**
       * To define the length of the string to start the filter.
       *
       * @prop {Number} [0] minLength
       */
      minLength: {
        type: Number,
        default: 2
      },
      /**
       * Specifies the time of delay.
       *
       * @prop {Number} [250] delay
       */
      delay: {
        type: Number,
        default: 250
      },
      /**
       * Specifies the mode of the filter.
       *
       * @prop {String} ['startswith'] filterMode
       */
      filterMode: {
        type: String,
        default: 'startswith'
      },
      /**
       * Autobind defaults at false.
       *
       * @prop {Boolean} [false] autobind
       */
      autobind: {
        type: Boolean,
        default: false
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
      onChange(){
        if (!this.ready) {
          this.ready = true;
        }
      },
      /**
       * Puts the focus on the element.
       *
       * @method click
       * @fires getRef
       */
      click(){
        if (!this.isDisabled) {
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
        this.inputIsVisible = false;
        this.filterString = '';
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
        if ( this.commonKeydown(e) ){
          return;
        }
        else if (this.isOpened && (e.key === 'Escape')) {
          e.stopPropagation();
          e.preventDefault();
          this.resetDropdown();
          return;
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
        bbn.fn.log("CLEARED")
        if (!v && this.nullable && this.inputIsVisible) {
          bbn.fn.log("NO VALUE")
          this.unfilter();
          this.emitInput(null);
          this.currentText = '';
          if (this.currentData.length) {
            this.currentData.splice(0, this.currentData.length);
          }
        }
        else if (v) {
          bbn.fn.log("VALUE")
          if (v.length < this.minLength) {
            if (this.currentData.length) {
              this.currentData.splice(0, this.currentData.length);
            }
          }
          else if ((v !== this.currentText)) {
            bbn.fn.log("MIN PASSED")
            this.isOpened = false;
            this.filterTimeout = setTimeout(() => {
              // this.filterTimeout = false;
              // We don't relaunch the source if the component has been left
              if (this.isActive) {
                bbn.fn.log("UPDATING AUTOC");
                this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length ? 1 : 0, {
                  field: this.sourceText,
                  operator: this.filterMode,
                  value: v
                });
                this.updateData().then(() => {
                  this.isOpened = true;
                })
              }
            }, this.delay);
          }
        }
        else if ( !v ){
          this.unfilter();
        }
      }
    }
  });

})(bbn);


})(bbn);