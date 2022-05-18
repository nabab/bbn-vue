((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, {'bbn-tabs-scrollable': scrollable}]">
  <div class="bbn-tabs-container">
    <div class="bbn-tabs-ul-container">
      <div class="bbn-flex-width">
        <div v-if="scrollable"
            class="bbn-tabs-button bbn-tabs-button-prev bbn-p">
          <div class="bbn-100 bbn-middle"
              @click="scrollTabs('left')">
            <div class="bbn-block">
              <i class="nf nf-fa-angle_left bbn-xlarge"/>
            </div>
          </div>
        </div>
        <div class="bbn-flex-fill">
          <component :is="scrollable ? 'bbn-scroll' : 'div'"
                     ref="horizontal-scroll"
                     v-bind="scrollCfg">
            <ul ref="tabgroup"
                class="bbn-alt bbn-tabs-tabs bbn-bordered-bottom bbn-flex-fill">
              <li v-for="(tab, tabIndex) in source"
                  @click="!tab.disabled && (tabIndex !== value) ? emitInput(tabIndex) : false"
                  :ref="'tab-' + tabIndex"
                  v-show="!tab.hidden"
                  :style="{
                          backgroundColor: tab.bcolor || null,
                          color: tab.fcolor || null
                          }"
                  :data-index="tabIndex"
                  :class="['bbn-transition-bcolor', 'bbn-iblock', 'bbn-bordered', 'bbn-radius-top', 'bbn-state-default', 'bbn-unselectable', {
                          'bbn-tabs-static': !!tab.static,
                          'bbn-background-effect-internal': tabIndex === value,
                          'bbn-tabs-active': tabIndex === value,
                          'bbn-disabled': tab.disabled,
                          'bbn-tabs-alarm': tab.alarm
                          }, tab.cls || '']">
                <div class="bbn-tabs-badge-container bbn-middle"
                    v-if="numProperties(tab.events)">
                  <span class="bbn-badge bbn-small bbn-bg-red"
                        v-text="numProperties(tab.events)"/>
                </div>
                <div class="bbn-tabs-tab-loader bbn-border-text"
                    :style="{borderColor: tab.fcolor || null}"
                    v-if="tab.loading"/>
                <bbn-context :context="true"
                            @keydown.space.enter.prevent.stop="tabIndex !== selected ? emitInput(tabIndex) : false"
                            @keydown.right.down.prevent.stop="getRef('menu-' + tabIndex) ? getRef('menu-' + tabIndex).$el.focus() : (getRef('closer-' + tabIndex) ? getRef('closer-' + tabIndex).focus() : null)"
                            :source="getMenuFn"
                            :source-index="tabIndex"
                            :autobind="false"
                            tag="div"
                            :disabled="tabIndex !== value"
                            min-width="10em"
                            :class="['bbn-tabs-tab', 'bbn-iblock', {
                                    'bbn-tabs-dirty': tab.dirty,
                                    'bbn-tabs-icononly': tab.notext
                                    }]"
                            :ref="'title-' + tabIndex"
                            :style="{
                                    color: tab.fcolor ? tab.fcolor : null
                                    }"
                            tabindex="0">
                  <span v-if="tab.icon"
                        :title="tab.title"
                        :class="'bbn-tabs-main-icon bbn-iblock' + (tab.notext ? ' bbn-lg' : ' bbn-m')">
                    <i :class="tab.icon"/>
                  </span>
                  <span v-if="!tab.notext && tab.title"
                        class="bbn-router-tab-text"
                        :title="getTabTitle(tab)"
                        v-html="tab.title.length > maxTitleLength ? cutTitle(tab.title) : tab.title"/>
                </bbn-context>
                <div class="bbn-tabs-selected"
                     :ref="'selector-' + tabIndex"
                     v-show="tabIndex === value"
                     :style="{
                            backgroundColor: getFontColor(tabIndex)
                            }"/>
                <span v-if="!tab.static && !tab.pinned && closable"
                      class="bbn-p bbn-router-tab-close bbn-iblock bbn-top-right bbn-hxspadded"
                      tabindex="-1"
                      :ref="'closer-' + tabIndex"
                      @keydown.left.down.prevent.stop="getRef('menu-' + tabIndex) ? getRef('menu-' + tabIndex).$el.focus() : null"
                      @keydown.space.enter.prevent.stop="$emit('close', tabIndex)"
                      @click.stop.prevent="$emit('close', tabIndex)">
                  <i class="nf nf-fa-times"/>
                </span>
                <bbn-context v-if="(tab.menu !== false) && (tabIndex === value)"
                             class="bbn-iblock bbn-router-tab-menu bbn-p bbn-bottom-right bbn-hxspadded"
                             tabindex="-1"
                             min-width="10em"
                             tag="span"
                             :source="getMenuFn"
                             :autobind="false"
                             :source-index="tab.idx"
                             :ref="'menu-' + tab.idx">
                  <i class="nf nf-fa-caret_down"/>
                </bbn-context>
              </li>
            </ul>
          </component>
        </div>
        <div v-if="scrollable"
            class="bbn-tabs-button bbn-tabs-button-next bbn-p">
          <div class="bbn-100 bbn-middle"
              @click="scrollTabs('right')">
            <div class="bbn-block">
              <i class="nf nf-fa-angle_right bbn-xlarge"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-tabs');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

 /**
  * @file bbn-switch component
  *
  * @description bbn-switch is a component with easy implementation and customization that allows the user to switch between selected and unselected states, defining the value and novalue in the appropriate properties.
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 13/02/2017
  */
(bbn => {
  "use strict";
  Vue.component('bbn-tabs', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent,
      bbn.vue.inputComponent
    ],
    props: {
      /**
       * Set to true gives the component a rounded appearance.
       * @prop {Boolean} [false] radius
       */
      source: {
        type: Array,
        default() {
          return []
        }
      },
      scrollable: {
        type: Boolean,
        default: false
      },
      closable: {
        type: Boolean,
        default: true
      },
      limit: {
        type: Number
      },
      maxTitleLength: {
        type: Number,
        default: 35
      }
    },
    data(){
      return {
        /**
         * The value of the component.
         * @data {Boolean} valueToSet
         */
        valueToSet: this.value
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
      numProperties: bbn.fn.numProperties,
      /**
       * Returns the title attribute for the tab.
       * 
       * @method getTabTitle
       * @param {Object} obj
       * @return {String|null}
       */
      getTabTitle(obj){
        let t = '';
        if ( obj.notext || (obj.title.length > this.maxTitleLength) ){
          t += obj.title;
        }
        if ( obj.ftitle ){
          t += (t.length ? ' - ' : '') + obj.ftitle;
        }
        return t || null;
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
            scroll.scrollAfter(true);
          }
          else{
            scroll.scrollBefore(true);
          }
        }
      },
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
       * @method getFontColor
       * @param {Number} idx
       * @fires getRef
       * @return {String}
       */
      getFontColor(idx){
        if (bbn.fn.isNumber(idx)) {
          if ( this.source[idx] && this.source[idx].fcolor ){
            return this.source[idx].fcolor;
          }
          let el = this.getRef('title-' + idx);
          if ( el ){
            return window.getComputedStyle(el.$el ? el.$el : el).color;
          }
        }
        return '';
      },
      getMenuFn(idx) {
        if (this.router) {
          return this.router.getMenuFn(idx);
        }
      }
    },
    watch: {
    },
    /**
     * Sets the initial state of the component.
     * @event mounted
     * @fires toggle
     * @emits input
     */
    mounted(){
      this.router = this.closest('bbn-router');
      this.ready = true;
    }
  });
})(bbn);


})(bbn);