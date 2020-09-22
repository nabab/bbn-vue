(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, {'bbn-tabs-scrollable': scrollable}]">
  <div :class="['bbn-tabs-container', {'bbn-flex-height': content}]">
    <div class="bbn-tabs-ul-container">
      <div class="bbn-flex-width">
        <div v-if="scrollable"
            class="bbn-tabs-button bbn-tabs-button-prev bbn-p"
        >
          <div class="bbn-100 bbn-middle"
              @click="scrollTabs('left')"
          >
            <div class="bbn-block">
              <i class="nf nf-fa-angle_left bbn-xlarge"></i>
            </div>
          </div>
        </div>
        <div class="bbn-flex-fill">
          <component :is="scrollable ? 'bbn-scroll' : 'div'"
                      ref="horizontal-scroll"
                      v-bind="scrollCfg"
          >
            <ul ref="tabgroup"
                class="bbn-alt bbn-tabs-tabs bbn-bordered-bottom bbn-flex-fill"
            >
              <li v-for="(tab, tabIndex) in source"
                  :ref="'tab-' + tabIndex"
                  v-show="!tab.hidden"
                  :style="{
                    backgroundColor: tab.bcolor || null,
                    color: tab.fcolor || null
                  }"
                  :data-index="tabIndex"
                  :class="['bbn-iblock', 'bbn-bordered', 'bbn-radius-top', 'bbn-state-default', 'bbn-unselectable', {
                    'bbn-tabs-static': !!tab.static,
                    'bbn-background-effect-internal': tabIndex === selected,
                    'bbn-tabs-active': tabIndex === selected,
                    'bbn-disabled': tab.disabled,
                    'bbn-tabs-alarm': tab.alarm
                  }, tab.cls || '']"
                  @click="!tab.disabled && (tabIndex !== selected) ? (selected = tabIndex) : (() => {})()"
              >
                <div class="bbn-tabs-badge-container bbn-middle"
                      v-if="(tabIndex !== selected) && numProperties(tab.events)">
                  <span class="bbn-badge bbn-small bbn-bg-red"
                        v-text="numProperties(tab.events)"
                  ></span>
                </div>
                <div class="bbn-tabs-tab-loader bbn-border-text"
                      :style="{borderColor: tab.fcolor || null}"
                      v-show="tab.loading"
                ></div>
                <bbn-context :context="true"
                              :source="getMenuFn"
                              :source-index="tabIndex"
                              tag="div"
                              :disabled="tabIndex !== selected"
                              min-width="10em"
                              :class="['bbn-tabs-tab', 'bbn-iblock', {'bbn-tabs-dirty': tab.dirty}]"
                              :ref="'title-' + tabIndex"
                              :style="{
                                color: tab.fcolor ? tab.fcolor : null
                              }"
                              tabindex="0"
                              @keydown.space.enter.prevent.stop="tabIndex !== selected ? activateIndex(tabIndex) : (() => {})()"
                              @keydown.right.down.prevent.stop="getRef('menu-' + tabIndex) ? getRef('menu-' + tabIndex).$el.focus() : (getRef('closer-' + tabIndex) ? getRef('closer-' + tabIndex).focus() : null)"
                >
                  <span v-if="tab.icon"
                        :title="tab.title"
                        :class="'bbn-tabs-main-icon bbn-iblock' + (tab.notext ? ' bbn-lg' : ' bbn-m')"
                  >
                    <i :class="tab.icon"
                        :style="{zoom: iconsReady ? 1.1 : 1}"
                    ></i>
                  </span>
                  <span v-if="!tab.notext && tab.title"
                        class="bbn-tab-text"
                        :title="getFullTitle(tab)"
                        v-html="tab.title.length > maxTitleLength ? cutTitle(tab.title) : tab.title"
                  ></span>
                </bbn-context>
                <div class="bbn-tabs-selected"
                      :ref="'selector-' + tabIndex"
                      v-show="tabIndex === selected"
                      :style="{
                        backgroundColor: getTabColor(tabIndex)
                      }"
                ></div>
                <i v-if="!tab.static && !tab.pinned"
                    class="nf nf-fa-times bbn-p bbn-tab-close bbn-tabs-icon"
                    tabindex="-1"
                    :ref="'closer-' + tabIndex"
                    @keydown.left.down.prevent.stop="getRef('menu-' + tabIndex) ? getRef('menu-' + tabIndex).$el.focus() : null"
                    @keydown.space.enter.prevent.stop="close(tabIndex)"
                    @click.stop.prevent="close(tabIndex)"
                ></i>
                <bbn-context v-if="(tab.menu !== false) && (tabIndex === selected)"
                              class="nf nf-fa-caret_down bbn-tab-menu bbn-tabs-icon bbn-p"
                              tabindex="-1"
                              min-width="10em"
                              tag="i"
                              :source="getMenuFn"
                              :source-index="tabIndex"
                              :ref="'menu-' + tabIndex"
                ></bbn-context>
              </li>
            </ul>
          </component>
        </div>
        <div v-if="scrollable"
          class="bbn-tabs-button bbn-tabs-button-next bbn-p"
        >
          <div class="bbn-100 bbn-middle"
              @click="scrollTabs('right')"
          >
            <div class="bbn-block">
              <i class="nf nf-fa-angle_right bbn-xlarge"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="content"
         class="bbn-flex-fill"
         v-html="source[selected] && source[selected].content ? source[selected].content : ''"
    ></div>
  </div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-tabs');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/tabs/tabs.css");
document.head.insertAdjacentElement('beforeend', css);
/**
  * @file bbn-tabs component
  * @description bbn-tabs
  * @copyright BBN Solutions
  * @author Mirko Argentino mirko@bbn.solutions
  * @created 10/03/2020
  */
 (function(bbn, Vue){
  "use strict";

  Vue.component("bbn-tabs", {
    name: 'bbn-tabs',
    mixins: [
      /**
       * @mixin bbn.vue.basicComponent
       */
      bbn.vue.basicComponent,
      /**
       * @mixin bbn.vue.localStorageComponent
       */
      bbn.vue.localStorageComponent,
      /**
       * @mixin bbn.vue.closeComponent
       */
      bbn.vue.closeComponent,
      /**
       * @mixin bbn.vue.observerComponent
       */
      bbn.vue.observerComponent,
      /**
       * @mixin bbn.vue.resizerComponent
       */
      bbn.vue.resizerComponent
    ],
    props: {
      /**
       * @prop {Array} [true] source
       */
      source: {
        type: Array,
        reuired: true
      },
      /**
       * @prop value
       */
      value: {
        type: [Number, Boolean]
      },
      /**
       * @prop {Boolean} [true] content
       */
      content: {
        type: Boolean,
        default: true
      },
      /**
       * Sets if the tabs' titles will be scrollable in case they have a greater width than the page (true), or if they will be shown multilines (false, default).
       * @prop {Boolean} [false] scrollable
       */
      scrollable: {
        type: Boolean,
        default: false
      },
      /**
       * The max length for the tab's title
       * @prop {Number} [20] maxTitleLength
       */
      maxTitleLength: {
        type: Number,
        default: 20
      },
      /**
       * @prop {Function} menu
       */
      menu: {
        type: Function
      }
    },
    data(){
      return {
        /**
         * The current selected tab's index.
         * @data {Number|Boolean} [false] selected
         */
        selected: null,
        /**
         * @data {Boolean} [false] iconsReady
         */
        iconsReady: false,
      }
    },
    computed: {
      /**
       * Returns the scroll configuration
       * @computed scrollCfg
       * @return {Object}
       */
      scrollCfg(){
        return this.scrollable ? {
          axis: 'x',
          container: true,
          hidden: true
        } : {};
      },
    },
    methods: {
      /**
       * Alias of bbn.fn.numProperties
       * @method numProperties
       * @return {Number|Boolean}
       */
      numProperties: bbn.fn.numProperties,
      /**
       * Cuts the given string by 'maxTitleLength' property value
       * @method cutTitle
       * @param {String} title
       * @return {String}
       */
      cutTitle(title){
        return bbn.fn.shorten(title, this.maxTitleLength)
      },
      /**
       * @method getMenuFn
       * @param {Number} idx
       * @return {Array}
       */
      getMenuFn(idx){
        return this.menu ? this.menu(idx) : [];
      },
      /**
       * @method getFullTitle
       * @param {Object} obj
       * @return {String|null}
       */
      getFullTitle(obj){
        let t = '';
        if ( obj.noText || (obj.title.length > this.maxTitleLength) ){
          t += obj.title;
        }
        if ( obj.ftitle ){
          t += t.length ? ' - ' + obj.ftitle : obj.ftitle;
        }
        return t || null;
      },
      /**
       * @method getTabColor
       * @param {Number} idx
       * @fires getRef
       * @return {String}
       */
      getTabColor(idx){
        if ( this.source[idx].fcolor ){
          return this.source[idx].fcolor;
        }
        let el = this.getRef('title-' + idx);
        if ( el ){
          return window.getComputedStyle(el.$el ? el.$el : el).color;
        }
        return 'black';
      },
      /**
       * @method scrollTabs
       * @param {String} dir
       * @fires getRef
       */
      scrollTabs(dir){
        let scroll = this.getRef('horizontal-scroll');
        if ( scroll ){
          if ( dir === 'right' ){
            scroll.scrollAfter();
          }
          else{
            scroll.scrollBefore();
          }
        }
      },
      /**
       * @method getTab
       * @param {Number} idx
       * @fires getRef
       * @return {HTMLElement}
       */
      getTab(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        return this.getRef('tab-' + idx);
      },
      /**
       * @method close
       * @param {Number} idx
       * @param {boolean} force
       * @fires isValidIndex
       * @emit beforeclose
       * @emit close
       */
      close(idx, force){
        if ( this.isValidIndex(idx) ){
          let ev = new CustomEvent('beforeClose', {
            cancelable: true
          });
          this.$emit('beforeClose', idx, force, ev);
          if ( !ev.defaultPrevented ){
            this.source.splice(idx, 1);
            if ( this.selected > idx ){
              this.selected--;
            }
            else if ( this.selected === idx ){
              this.selected = false;
            }
            this.$emit('close', idx, force);
          }
        }
      },
      /**
       * @method closeAll
       * @fires close
       */
      closeAll(){
        for ( let i = this.source.length - 1; i >= 0; i-- ){
          if ( !this.source[i].static && !this.source[i].pinned ){
            this.close(i);
          }
        }
      },
      /**
       * @method closeallBut
       * @param {Number} idx
       * @fires close
       */
      closeAllBut(idx){
        for ( let i = this.source.length - 1; i >= 0; i-- ){
          if ( !this.source[i].static && !this.source[i].pinned && (i !== idx) ){
            this.close(i);
          }
        }
      },
      /**
       * @method ping
       * @param {Number} idx
       * @fires isValidIndex
       * @emit beforePin
       * @emit pin
       */
      pin(idx){
        if ( this.isValidIndex(idx) ){
          let ev = new CustomEvent('beforePin', {
            cancelable: true
          });
          this.$emit('beforePin', idx, ev);
          if ( !ev.defaultPrevented ){
            this.source[idx].pinned = true;
            this.$emit('pin', idx);
          }
        }
      },
      /**
       * @method unpin
       * @param {Number} idx
       * @fires isValidIndex
       * @emit beforeUnpin
       * @emit unpin
       */
      unpin(idx){
        if ( this.isValidIndex(idx) ){
          let ev = new CustomEvent('beforeUnpin', {
            cancelable: true
          });
          this.$emit('beforeUnpin', idx, ev);
          if ( !ev.defaultPrevented ){
            this.source[idx].pinned = false;
            this.$emit('unpin', idx);
          }
        }
      },
      /**
       * @method isValidIndex
       * @param {Number} idx
       * @return {Boolean}
       */
      isValidIndex(idx){
        return bbn.fn.isNumber(idx) && (this.source[idx] !== undefined);
      }
    },
    beforeMount(){
      if ( bbn.fn.isNumber(this.value) ){
        this.selected = this.value;
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.$nextTick(() => {
        this.ready = true;
      })
      setTimeout(() => {
        // bugfix for rendering some nf-mdi icons
        this.iconsReady = true;
      }, 1000);
    },
    watch: {
      /**
       * @watch selected
       * @emit select
       */
      selected(newVal, oldVal){
        if ( (newVal !== oldVal) && bbn.fn.isNumber(newVal) && this.ready ){
          this.$emit('select', newVal);
        }
      },
      /**
       * @watch value
       */
      value(newVal, oldVal){
        if ( (newVal !== oldVal) && bbn.fn.isNumber(newVal) && this.ready ){
          this.selected = newVal
        }
      }
    },
  });

})(bbn, Vue);
if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }