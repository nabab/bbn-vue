(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-iblock']">
  <bbn-input :placeholder="currentPlaceholder"
              type="search"
              ref="input"
              @focus="searchFocus"
              @blur="searchBlur"
              @keydown.esc.prevent="isOpened ? isOpened = false : searchBlur() && getRef('input').getRef('element').blur()"
              @keydown.stop="keydown"
              :nullable="nullable"
              autocomplete="off"
              v-model="filterString"
              :loading="isAjax && isLoading"
              button-right="nf nf-fa-search">
  </bbn-input>
  <bbn-floater v-if="filteredData.length && !disabled && !readonly && isOpened && $refs.input"
               :element="$refs.input.$el"
               class="bbn-secondary"
               :max-height="maxHeight"
               :min-width="$el.offsetWidth"
               ref="list"
               @mouseleave.prevent
               :auto-hide="false"
               :suggest="suggest"
               :item-component="searchComponent"
               :children="null"
               @select="select"
               @close="searchClose"
               :source-text="sourceText"
               :source-value="sourceValue"
               :source-url="sourceUrl"
               :source-action="sourceAction"
               :source="filteredData">
  </bbn-floater>
  <input type="hidden"
         v-model="value"
         ref="element"
         :name="name">
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-search');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/search/search.css');
document.head.insertAdjacentElement('beforeend', css);

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

(
  (bbn, Vue) => {

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
      mixins: 
      [
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
         * @prop {Boolean} [false] filterselection 
         */
        filterselection: {
          default: false
        },
        /**
         * Defines if the search is filterable.
         * @prop {Boolean} [true] filterable 
         */
        filterable: {
          type: Boolean,
          default: true
        },
        /**
         * Set to true will automatically update the data before mount.
         * @prop {Boolean} [false] autobind 
         */
        autobind: {
          default: false
        },
        /**
         * Defines if the search can have a null value.
         * @prop {Boolean} [false] nullable
         */
        nullable: {
          default: false
        },
        /**
         * Defines the min length of the filter string. 
         * @prop {Number} [1] minLength
         * 
         */      
        minLength: {
          type: Number,
          default: 1
        },
        /**
         * Defines the left icon of the search.
         * @prop {Boolean|String} [false] leftIcon 
         */
        leftIcon: {
          default: false
        },
        /**
         * Defines the right icon of the search.
         * @prop {Boolean|String} ['nf nf-fa-search'] rightIcon 
         */
        rightIcon: {
          default: 'nf nf-fa-search'
        },
        /**
         * Defines the min width of the input.
         * @prop {String} ['4,2em'] minWidth
         */
        minWidth: {
          default: '4.2em'
        },
        /**
         * Defines the max width of the input.
         * @prop {String} ['100%'] maxWidth
         */
        maxWidth: {
          default: '100%'
        },
        /**
         * Defines the delay before the component starts to search.
         * @prop {Number} [500] delay
         */
        delay: {
          type: Number,
          default: 500
        },
        /** 
         * @prop {String} ['?'] shortPlaceholder
         */
        shortPlaceholder: {
          type: String,
          default: '?'
        },
        /**
         * Delay to auto-hide the results when mouse out (or false to not auto-hide).
         * @prop {Boolean|Number} [1500] autohide
         */
        autohide: {
          type: [Boolean, Number],
          default: 1500
        },
        /**
         * The name of the property to be used as action to execute when selected.
         * @prop {String} sourceAction
         */
        sourceAction: {
          type: [String, Function],
          default: 'action'
        },
        /**
         * The name of the property to be used as URL to go to when selected.
         * @prop {String} sourceUrl
         */
        sourceUrl: {
          type: [String, Function],
          default: 'url'
        },
        /**
         * The URL where to send the selected result.
         * @prop {String} selectUrl
         */
         selectUrl: {
          type: String
        }
      },
      data() {
        return {
          /**
           * The current min width.
           * @data {String} ['4.2em'] specialWidth
           */
          specialWidth: this.minWidth,
          /**
           * The placeholder.
           * @data {String} ['?'] currentPlaceholder 
           */
          currentPlaceholder: this.shortPlaceholder,
          /**
           * The timeout.
           * @data {Number|null} [null] timeout
           */
          timeout: null,
           /**
           * @data {Number|null} [null] mouseTimeout
           */
          mouseTimeout: null,
          isActive: true
        };
      },
      computed: {
        isNullable(){
          return this.nullable && this.isActive;
        },
        /**
         * Returns the component object. 
         * @computed realComponent
         * @memberof listComponent
         */
         searchComponent(){
          let cp = bbn.fn.isString(this.component) || (bbn.fn.isObject(this.component) && Object.keys(this.component).length) ? this.component : null;
          if (!cp) {
            cp = {
              props: ['source'],
              data(){
                return this.source;
              },
              template: `<component :is="myCp" :source="source"></component>`,
              computed: {
                myCp() {
                  return this.source.component || 'div';
                }
              }
            };
          }

          return cp;
        },
      },
      methods: {
        /***
         * Focuses the search input.
         * @method searchFocus
         */
        searchFocus(){
          clearTimeout(this.timeout);
          this.$emit('focus', this);
          this.isFocused = true;
          this.specialWidth = this.maxWidth;
          this.currentPlaceholder = this.placeholder;
        },
        /**
         * Blurs the search input.
         * @method searchBlur
         */
        searchBlur(){
          clearTimeout(this.timeout);
          this.timeout = setTimeout(() => {
            this.isFocused = false;
            this.isOpened = false;
            this.specialWidth = this.minWidth;
            this.filterString = '';
            this.currentPlaceholder = '?';
            this.$emit('blur', this);
          }, 250);
        },
        /**
         * Closes the search.
         * @method searchClose
         */
        searchClose(){
          this.isOpened = false;
        },
        /**
         * Emits the event 'select' 
         * @method select
         * @param {Object} item 
         * @param {Number} idx
         * @param {Number} dataIndex
         * @emit change
         */
        select(item, idx, dataIndex) {
          if (item){
            let ev = new Event('select', {cancelable: true});
            this.$emit('select', ev, item, idx, dataIndex);
            if ( !ev.defaultPrevented  && (item[this.sourceValue] !== undefined) ){
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
         * @fires resetDropdown
         * @fires keynav
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
        /**
         * On mouse Leave.
         * @method leave
         * @fires searchBlur
         */
        leave(){
          if (this.autohide) {
            if (this.mouseTimeout) {
              clearTimeout(this.mouseTimeout);
            }
            this.mouseTimeout = setTimeout(() => {
              this.searchBlur();
            }, this.autohide);
          }
        },
        /**
         * On mouse enter.
         * @method enter
         */
        enter(){
          if (this.mouseTimeout) {
            clearTimeout(this.mouseTimeout);
          }
        }
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
            if (this.currentData.length) {
              this.currentData.splice(0);
            }
            this.$nextTick(() => {
              this.filterTimeout = setTimeout(() => {
                this.filterTimeout = false;
                // We don't relaunch the source if the component has been left
                if ( this.isActive ){
                  if (v && (v.length >= this.minLength)) {
                    this.$once('dataloaded', () => {
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
                    });
                    this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length ? 1 : 0, {
                      field: this.sourceText,
                      operator: 'startswith',
                      value: v
                    });
                  }
                  else {
                    this.unfilter();
                  }
                }
              }, this.delay);
            })
          }
        }
      }
    });

  }
)(bbn, Vue);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}