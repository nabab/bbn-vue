<template>
<div :class="[
       componentClass,
       'bbn-iblock',
       'bbn-textbox',
       {'bbn-disabled': !!isDisabled}
     ]"
     @mouseenter="isOverDropdown = true"
     @mouseleave="isOverDropdown = false"
     @focusin="isActive = true"
     @focusout="onFocusOut">
  <div :class="['bbn-rel', 'bbn-dropdown-container', 'bbn-flex-width', 'bbn-vmiddle', currentItemCls, {
    'bbn-dropdown-container-native': native
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
               v-model="notext ? placeholder : currentText"
               @keydown="keydown"
               @keyup="keyup"
               @click.stop="click"
               @paste="paste"
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
               :readonly="true"
               :ellipsis="true"
               @focus="focus"
               @blur="blur"/>
    <template v-else>
      <select v-model="currentSelectValue"
              class="bbn-textbox bbn-no-border bbn-flex-fill bbn-p"
              :required="required"
              ref="input"
              @blur="ev => {isOpened = false; blur(ev)}"
              @change="selectOnNative"
              @focus="ev => {isOpened = true; focus(ev)}"
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
                  :class="['bbn-dropdown-select-button', 'bbn-button-right', 'bbn-no-vborder', 'bbn-m', 'bbn-top-right', {
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
                :source-text="sourceText"
                :source-value="sourceValue"
                :source-url="sourceUrl"
                :source-icon="sourceIcon"
                :title="floaterTitle"
                :buttons="asMobile ? realButtons : []"
                :groupable="groupable"
                :source-group="sourceGroup"
                :group-component="groupComponent"
                :group-style="groupStyle"/>
  </component>
</div>

</template>
<script>
  module.exports = /**
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
     * @mixin bbn.vue.localStorageComponent
      */
    mixins: 
    [
      bbn.vue.basicComponent,
      bbn.vue.eventsComponent,
      bbn.vue.inputComponent,
      bbn.vue.resizerComponent,
      bbn.vue.listComponent,
      bbn.vue.keynavComponent,
      bbn.vue.urlComponent,
      bbn.vue.dropdownComponent,
      bbn.vue.localStorageComponent
    ],
    props: {
      /**
       * @prop {Boolean} [false] notext
       */
      notext: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        startingTmpValue: '',
        startingTmpTimeout: null      
      };
    },
    /**
     * The current icon.
     *
     * @computed currentIcon
     * @return {String}
    */
    beforeMount() {
      if (this.hasStorage) {
        let v = this.getStorage();
        if (v && (v !== this.value)) {
          this.emitInput(v);
        }
      }
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
        if ( this.commonKeydown(e) ){
          return;
        }
        else if (this.isOpened && (e.key === 'Escape')) {
          e.stopPropagation();
          e.preventDefault();
          this.resetDropdown();
        }
        else if (bbn.var.keys.dels.includes(e.which) && !this.filterString) {
          e.preventDefault();
          this.resetDropdown();
        }
        else if (bbn.var.keys.upDown.includes(e.keyCode)) {
          e.preventDefault();
          this.keynav(e);
        }
        else if (!this.isSearching && (e.key === ' ')) {
          e.preventDefault();
          this.isOpened = !this.isOpened;
        }
        else if (this.isOpened && (e.key === 'Enter')) {
          e.preventDefault();
          this.selectOver();
        }
      },
      paste(){
        alert("PASTE");
      },
      keyup(e) {
        if ( e.key.match(/^[A-z0-9\s]{1}$/)) {
          this.startingTmpValue += e.key;
          if (!this.isOpened) {
            this.isOpened = true;
          }
        }
      },
      selectOnNative(ev){
        if (!ev.defaultPrevented) {
          let idx = bbn.fn.search(this.filteredData, 'data.' + this.sourceValue, ev.target.value);
          if (idx > -1) {
            let item = this.filteredData[idx].data;
            if (this.sourceAction && item[this.sourceAction] && bbn.fn.isFunction(item[this.sourceAction])) {
              item[this.sourceAction](item);
            }
            else if ((this.sourceUrl !== undefined) && item[this.sourceUrl]) {
              bbn.fn.link(item[this.sourceUrl]);
            }
            else if (item[this.uid || this.sourceValue] !== undefined) {
              this.emitInput(item[this.uid || this.sourceValue]);
              this.$emit('change', item[this.uid || this.sourceValue], idx, this.filteredData[idx].index, ev);
              bbn.fn.log('yes', item[this.uid || this.sourceValue], idx, this.filteredData[idx].index, ev)
            }
          }
        }
        this.isOpened = false;
      }
    },
    /**
     * @event created
     */
    created(){
      this.$on('dataloaded', () => {
        if ((this.value !== undefined) && !this.currentText.length) {
          let row = bbn.fn.getRow(this.currentData, a => {
            return a.data[this.sourceValue] === this.value;
          });
          if ( row ){
            this.currentText = this.clearHtml ? bbn.fn.html2text(row.data[this.sourceText]) : row.data[this.sourceText];
          }
        }
      })
    },
    beforeDestroy() {
      let fl = this.getRef('list');
      if (fl && fl.$el) {
        fl.$destroy();
        fl.$el.parentNode.removeChild(fl.$el);
      }
    },
    watch: {
      startingTmpValue(v) {
        if (v) {
          let fl = this.getRef('list');
          if (fl) {
            let lst = fl.getRef('list');
            if (lst) {
              bbn.fn.log("TEOUVE");
              lst.overByString(v);
            }
          }
          if (this.startingTmpTimeout) {
            clearTimeout(this.startingTmpTimeout);
          }
          this.startingTmpTimeout = setTimeout(() => {
            this.startingTmpValue = '';
          }, 1000)
        }
      },
     /**
      * @watch  isActive
      */
      isActive(v){
        if (!v && this.filterString) {
         this.currentText = this.currentTextValue || '';
        }
      },
      /**
       * @watch  isOpened
       */
      isOpened(val){
        if (this.popup && val && !this.native) {
          this.popupComponent.open({
            title: false,
            element: this.$el,
            maxHeight: this.maxHeight,
            minWidth: this.$el.clientWidth,
            autoHide: true,
            uid: this.sourceValue,
            itemComponent: this.realComponent,
            onSelect: this.select,
            position: 'bottom',
            suggest: true,
            modal: false,
            selected: [this.value],
            onClose: () => {
              this.isOpened = false;
            },
            source: this.filteredData.map(a => bbn.fn.extend({value: a.data.text}, a.data)),
            sourceAction: this.sourceAction,
            sourceText: this.sourceText,
            sourceValue: this.sourceValue
          });
        }

        if (!val && this.preload && !this.native) {
          this.getRef('list').currentVisible = true;
        }
      },
      /**
       * @watch  currentText
       */
      currentText(newVal){
        if (this.ready) {
          if (!newVal && this.value) {
            this.emitInput(this.isNullable && (this.nullable !== null) ? this.nullValue : '');
            this.filterString = '';
          }
          else {
            this.filterString = newVal === this.currentTextValue ? '' : newVal;
          }
        }
      },
      /**
       * @watch  currentSelectValue
       */
       currentSelectValue(newVal){
        if (this.ready && (newVal !== this.value)) {
          this.emitInput(newVal);
        }
      },
      filterString(v){
        let args = [0, this.currentFilters.conditions.length ? 1 : 0];
        if (v && this.isActive) {
          args.push({
            field: this.sourceText,
            operator: 'startswith',
            value: v
          })
        }
        this.currentFilters.conditions.splice(...args);
      },
      value(v) {
        this.currentSelectValue = v;
        if (this.storage) {
          if (v) {
            this.setStorage(v);
          }
          else {
            this.unsetStorage()
          }
        }
      }
    }
  });

})(bbn);

</script>
<style scoped>
.bbn-dropdown {
  display: inline-block;
  box-sizing: border-box;
  cursor: pointer;
}
.bbn-dropdown.bbn-dropdown-autosize {
  min-width: 4rem;
}
.bbn-dropdown:hover .bbn-dropdown-select-button:not(.bbn-disabled) {
  opacity: 1;
  background: none, linear-gradient(to bottom,var(--effect) 0%,rgba(255,255,255,0) 100%) 50% 50% repeat var(--hover-background);
}
.bbn-dropdown .bbn-dropdown-container {
  line-height: normal;
}
.bbn-dropdown .bbn-dropdown-container.bbn-dropdown-container-native {
  min-width: 6rem;
}
.bbn-dropdown .bbn-dropdown-container .bbn-dropdown-content {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.bbn-dropdown .bbn-dropdown-container .bbn-input,
.bbn-dropdown .bbn-dropdown-container select {
  background-color: transparent;
  max-width: 100%;
  width: 100%;
  height: 100%;
}
.bbn-dropdown .bbn-dropdown-container .bbn-input div.bbn-flex-width,
.bbn-dropdown .bbn-dropdown-container select div.bbn-flex-width {
  height: 100%;
  box-sizing: border-box;
}
.bbn-dropdown .bbn-dropdown-container .bbn-input div.bbn-flex-width .bbn-button,
.bbn-dropdown .bbn-dropdown-container select div.bbn-flex-width .bbn-button {
  line-height: 100%;
  margin: 0;
}
.bbn-dropdown .bbn-dropdown-container .bbn-input input,
.bbn-dropdown .bbn-dropdown-container select input {
  cursor: pointer;
}
.bbn-dropdown .bbn-dropdown-container select {
  min-width: 4rem;
  font-size: inherit;
  font-weight: inherit;
  border-radius: inherit;
  color: inherit;
  border: 0;
  padding: 0.0833rem 0.25rem;
  padding-right: 2.45rem;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
  z-index: 1;
}
.bbn-dropdown .bbn-dropdown-container .bbn-dropdown-select-button {
  min-width: 2rem;
  opacity: 0.7;
  z-index: 0;
  min-height: 100%;
  max-height: 100%;
}

</style>
