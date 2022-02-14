(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-overlay', 'bbn-flex-height']">
   <div class="bbn-w-100 bbn-c bbn-lg bbn-vlpadded">
      <bbn-input :placeholder="placeholder"
                 :style="{width: '75%'}"
                 :focused="true"
                 type="search"
                 ref="input"
                 @keydown="keydown"
                 :nullable="isNullable"
                 autocomplete="off"
                 v-model="filterString"
                 :loading="isAjax && isLoading"
                 button-right="nf nf-fa-search"/>
   </div>
   <div class="bbn-flex-fill">
      <bbn-scroll>
         <bbn-list v-if="filteredData.length && !disabled && !readonly"
                  :element="$el"
                  ref="list"
                  :auto-hide="false"
                  :suggest="suggest"
                  :component="searchComponent"
                  :children="null"
                  @select="select"
                  :source-url="sourceUrl"
                  :source-action="sourceAction"
                  :source-text="sourceText"
                  :source-value="sourceValue"
                  :pageable="filteredData.length > limit"
                  :pager-element="_self"
                  :source="filteredData"/>
      </bbn-scroll>
   </div>
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
         * @prop {Boolean|Number} [1500] autohide
         */
        autohide: {
          type: [Boolean, Number],
          default: 1500
        },
        /**
         * The name of the property to be used as action to execute when selected.
         * @prop {String} sourceAction
         * @memberof listComponent
         */
        sourceAction: {
          type: [String, Function],
          default: 'action'
        },
        /**
         * The name of the property to be used as URL to go to when selected.
         * @prop {String} sourceUrl
         * @memberof listComponent
         */
        sourceUrl: {
          type: [String, Function],
          default: 'url'
        },
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
          mouseTimeout: null
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

          bbn.fn.log(cp, this.source);
          return cp;
        },
      },
      methods: {
        /***
         * Focuses the search input.
         * @method searchFocus
         */
        /**
         * Emits the event 'select' 
         * @method select
         * @param {Object} item 
         * @param {Number} idx
         * @param {Number} dataIndex
         * @emit change
         */
        select(item, idx, dataIndex){
          if (!this.disabled) {
            let ev = new Event('select', {cancelable: true});
            this.$emit('select', ev, item, idx, dataIndex);
            bbn.fn.log("EMITTING SELECT");
            if (!ev.defaultPrevented) {
              bbn.fn.log("NO RPEVENT", item);
              if (this.sourceAction && item[this.sourceAction]) {
                if ( typeof(item[this.sourceAction]) === 'string' ){
                  if ( bbn.fn.isFunction(this[item[this.sourceAction]]) ){
                    this[item[this.sourceAction]]();
                  }
                }
                else if (bbn.fn.isFunction(item[this.sourceAction]) ){
                  if (this.actionArguments) {
                    item[this.sourceAction](...this.actionArguments);
                  }
                  else {
                    item[this.sourceAction](idx, item.data);
                  }
                }
              }
              else if (this.sourceUrl && item[this.sourceUrl]) {
                bbn.fn.log("SOURCE URL OK");
                let url = bbn.fn.isFunction(this.sourceUrl) ?
                  this.sourceUrl(item, idx, dataIndex)
                  : item[this.sourceUrl];
                if (url) {
                  bbn.fn.link(url);
                }
              }
            }
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
            this.emitInput(v);
            this.$emit('change', v);
            if (this.currentData.length) {
              this.currentData.splice(0);
            }
            this.$nextTick(() => {
              this.filterTimeout = setTimeout(() => {
                this.filterTimeout = false;
                // We don't relaunch the source if the component has been left
                if (v && (v.length >= this.minLength)) {
                  this.$once('dataloaded', () => {
                    this.$nextTick(() => {
                      let list = this.find('bbn-scroll');
                      if ( list ){
                        list.onResize();
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