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
  <div :class="['bbn-rel', 'bbn-combo-container', 'bbn-flex-width', 'bbn-vmiddle', currentItemCls, {
    'bbn-combo-container-native': native
  }]">
    <div v-if="sourceIcon && hasValue && !!currentItemIcon"
         class="bbn-left-xspadded">
      <i :class="currentItemIcon"
         @click.stop="click" />
    </div>
    <div v-if="sourceImg && hasValue && !!currentItemImg"
         class="bbn-left-xspadded">
      <img src="currentItemImg"
           @click.stop="click">
    </div>
    <bbn-input v-if="!native"
               ref="input"
               class="bbn-no-border bbn-flex-fill"
               v-model="filterString"
               @focus="selectText"
               @keydown="keydown"
               @keyup="keyup"
               @click.stop="click"
               @clickRightButton="click"
               :disabled="isDisabled"
               autocorrect="off"
               autocapitalize="off"
               spellcheck="false"
               :required="required"
               :nullable="isNullable"
               :force-nullable="isNullable"
               :placeholder="placeholder"
               :tabindex="isDisabled ? -1 : 0"
               :button-right="currentIcon"
               :autosize="autosize"
               :readonly="readonly"/>
    <template v-else>
      <select v-model="currentSelectValue"
              class="bbn-textbox bbn-no-border bbn-flex-fill bbn-p"
              :required="required"
              ref="input"
              @blur="isOpened = false"
              @change="isOpened = false"
              @focus="isOpened = true"
              @click="isOpened = true"
              :disabled="!!isDisabled || !!readonly">
        <option value=""
                v-html="placeholder"
                :disabled="!isNullable"
                :selected="!value"/>
        <option v-for="d in filteredData"
                :value="d.data[sourceValue]"
                v-html="d.data[sourceText]"/>
      </select>
      <bbn-button :icon="currentIcon"
                  tabindex="-1"
                  :class="['bbn-combo-select-button', 'bbn-button-right', 'bbn-no-vborder', 'bbn-m', 'bbn-top-right', {
                    'bbn-disabled': !filteredData.length || !!isDisabled || !!readonly
                  }]"/>
    </template>
  </div>
  <input type="hidden"
         v-model="value"
         ref="element"
         :name="name">
  <component :is="!!portalSelector && !isInsideFloater ? 'bbn-portal' : 'div'"
             :selector="portalSelector">
    <bbn-floater v-if="!popup
                  && filteredData.length
                  && !isDisabled
                  && !readonly
                  && ready
                  && !native
                  && (isOpened || preload)"
                v-show="isOpened"
                :element="asMobile ? undefined : $el"
                :max-height="asMobile ? undefined : maxHeight"
                :min-width="$el.clientWidth"
                :width="asMobile ? '100%' : undefined"
                :height="asMobile ? '100%' : undefined"
                ref="list"
                :uid="sourceValue"
                :item-component="realComponent"
                @ready="attachList"
                @select="select"
                :children="null"
                :suggest="true"
                @mouseenter="isOverDropdown = true"
                @mouseleave="isOverDropdown = false"
                :selected="value ? [value] : []"
                @close="isOpened = false"
                :source="filteredData"
                :groupable="groupable"
                :group-component="groupComponent"
                :group-style="groupStyle"
                :source-group="sourceGroup"
                :source-text="sourceText"
                :source-action="sourceAction"
                :source-value="sourceValue"
                :source-url="sourceUrl"
                :source-icon="sourceIcon"
                :title="floaterTitle"
                :buttons="asMobile ? realButtons : []"/>
  </component>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-combo');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

/**
 * @file bbn-combo component
 * @description The easy-to-implement bbn-combo component allows you to choose a single value from a user-supplied list or to write new.
 * @copyright BBN Solutions
 * @author BBN Solutions
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
      /**
       * Set to true allows the columns of the list to be filtered. A filter icon will appear at the top of each column.The property can be given to each column to define different behaviour.
       * @prop {Boolean} [true] filterable
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
    },
    methods: {
      /**
       * Puts the focus on the element.
       *
       * @method click
       * @fires getRef
       */
      click(){
        if ( !this.isDisabled && !this.readnly ){
          this.getRef('input').focus();
          if ( this.filteredData.length ){
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
      },
      /**
       * Emits the event 'select'
       * @method select
       * @param {Object} item
       * @fires emitInput
       * @fires getRef
       * @emit change
       */
      select(item){
        if ( item && (item[this.sourceValue] !== undefined) ){
          this.writing = false;
          this.emitInput(item[this.sourceValue]);
          this.$emit('change', item[this.sourceValue]);
          this.filterString = item[this.sourceText];
          this.$nextTick(() => {
            this.getRef('input').focus();
          });
        }
        this.isOpened = false;
      },
      /**
       * Select the string of text inside of the input.
       * @method selectText
       * @fires getRef
       */
      selectText(){
        this.getRef('input').selectText();
      },
      /**
       * Function to do the reset and if the component is open it closes it.
       *
       * @method resetDropdown
       * @fires unfilter
       */
      resetDropdown(){
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
      keydown(e) {
        if (e.key === 'Tab') {
          let list = this.getRef('list');
          list = list ? list.getRef('list') : {};
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
        else if ( !this.isDisabled || !this.readonly ){
          this.writing = true;
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
       * @param {String} v
       * @fires onResize
       * @fires unfilter
       * @fires emitInput
       */
      filterString(v){
        if ( !this.ready ){
          this.ready = true;
        }
        clearTimeout(this.filterTimeout);
        if ( this.writing ){
          this.filterTimeout = setTimeout(() => {
            this.filterTimeout = false;
            if (this.isActive) {
              if (v && (v.length >= this.minLength)) {
                this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length ? 1 : 0, {
                  field: this.sourceText,
                  operator: this.searchOperator,
                  value: v
                });
              }
              else {
                this.unfilter();
                this.enptyData();
              }
            }
            this.emitInput(v);
          }, this.delay);
        }
      },
      filteredTotal() {
        let fl = this.getRef('list');
        if (this.isOpened && fl) {
          fl.fullResize();
        }
      }
    }
  });

})(bbn);


})(bbn);