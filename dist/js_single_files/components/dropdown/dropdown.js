((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[
       componentClass,
       'bbn-iblock',
       'bbn-textbox',
       {'bbn-disabled': !!disabled}
     ]"
     @mouseleave="leave"
     @focusin="isActive = true"
     @focusout="isActive = false"
     :title="currentText || placeholder || null"
>
  <div :class="['bbn-rel', 'bbn-dropdown-container', 'bbn-flex-width', 'bbn-vmiddle', currentItemCls]">
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
    <bbn-input :disabled="disabled"
                @keydown="keydown"
                @keyup="keyup"
                @click.stop="click"
                @paste="paste"
                ref="input"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                :required="required"
                :nullable="isNullable"
                :placeholder="placeholder"
                :tabindex="disabled ? -1 : 0"
                v-model="notext ? undefined : currentText"
                autocomplete="off"
                :button-right="currentIcon"
                @clickRightButton="click"
                class="bbn-no-border bbn-flex-fill"
                :autosize="autosize"
                :readonly="!writable"
    ></bbn-input>
  </div>
  <input type="hidden"
         v-model="value"
         ref="element"
         :name="name"
  >
  <bbn-floater v-if="!popup
                 && !asMobile
                 && filteredData.length
                 && !disabled
                 && !readonly
                 && (isOpened || preload)"
               v-show="isOpened"
               :element="$el"
               :max-height="maxHeight"
               :min-width="$el.clientWidth"
               :width="undefined"
               :height="undefined"
               ref="list"
               :auto-hide="500"
               :uid="sourceValue"
               :item-component="realComponent"
               @select="select"
               :children="null"
               :suggest="true"
               :selected="[value]"
               @close="isOpened = false"
               :source="filteredData"
               :source-text="sourceText"
               :source-value="sourceValue"
               :title="floaterTitle"
  ></bbn-floater>
  <bbn-floater v-if="!popup
                 && asMobile
                 && filteredData.length
                 && !disabled
                 && !readonly
                 && (isOpened || preload)"
               v-show="isOpened"
               width="100%"
               height="100%"
               ref="list"
               :uid="sourceValue"
               :item-component="realComponent"
               @select="select"
               :children="null"
               :suggest="true"
               :selected="[value]"
               @close="isOpened = false"
               :source="filteredData"
               :source-text="sourceText"
               :source-value="sourceValue"
               :closable="closable"
               :buttons="realButtons"
               :title="floaterTitle"
  ></bbn-floater>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-dropdown');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
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
     * @mixin bbn.vue.localStorageComponent
      */
    mixins: [
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
      }
    },
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
        else if ((e.key === 'Escape')) {
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
      },
      paste(){
        alert("PASTE");
      },
      keyup(e) {
        if ( e.key.match(/^[A-z0-9\s]{1}$/)) {
          if (!this.isOpened) {
            this.isOpened = true;
          }
          if (this.currentText === this.currentTextValue) {
            this.currentText = '';
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
          lst.close(true);
        }
      }
    },
    /**
     * @event created
     */
    created(){
      this.$on('dataloaded', () => {
        if ((this.value !== undefined) && !this.currentText.length) {
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
        if (this.popup && val) {
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

        if ((this.currentText === this.currentTextValue) && this.writable) {
          this.selectText();
        }

        if (!val && this.preload) {
          this.getRef('list').currentVisible = true;
        }
      },
      /**
       * @watch  currentText
       */
      currentText(newVal){
        if (this.ready) {
          if (!newVal && this.value && this.isNullable){
            this.emitInput('');
            this.selectText();
            this.filterString = '';
          }
          else {
            this.filterString = newVal === this.currentTextValue ? '' : newVal;
          }
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


})(bbn);