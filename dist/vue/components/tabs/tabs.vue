<template>
<div :class="[componentClass, {'bbn-tabs-scrollable': scrollable, 'bbn-tabs-vertical': isVertical}]">
  <div class="bbn-tabs-container">
    <div class="bbn-tabs-ul-container">
      <div :class="{'bbn-flex-width': !isVertical, 'bbn-flex-height': isVertical}">
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
                     v-bind="scrollCfg"
                     style="height: 100%">
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
                  :class="['bbn-transition-bcolor', 'bbn-bordered', 'bbn-state-default', 'bbn-unselectable', position, {
                          'bbn-radius-top': position === 'top',
                          'bbn-radius-bottom': position === 'bottom',
                          'bbn-radius-left': position === 'left',
                          'bbn-radius-right': position === 'right',
                          'bbn-iblock': !isVertical,
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
                            min-width="10rem"
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
                     v-if="tabIndex === value"
                     :style="{backgroundColor: selectedBarColor}"/>
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
                             min-width="10rem"
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

</template>
<script>
  module.exports =  /**
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
      },
      position: {
        type: String,
        default: 'top'
      },
      vertical: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        /**
         * The value of the component.
         * @data {Boolean} valueToSet
         */
        valueToSet: this.value,
        selectedBarColor: null
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
      isVertical(){
        return (this.position === 'left') || (this.position === 'right');
      }
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
        if (bbn.fn.isNumber(idx) && this.source[idx]) {
          if (this.source[idx].fcolor) {
            return this.source[idx].fcolor;
          }
          /*
          let el = this.getRef('title-' + idx);
          if (el) {
            return window.getComputedStyle(el.$el ? el.$el : el).color || '';
          }
          */
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
      value(v) {
        this.$nextTick(() => {
          this.selectedBarColor = this.source[v] ? this.getFontColor(v) : null;
        })
      }
    },
    updated() {
      if (!this.selectedBarColor && this.source[this.value]) {
        this.selectedBarColor = this.getFontColor(this.value);
      }

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
      // If no timeout color won't work
      setTimeout(() => {
        if (this.source[this.value]) {
          this.selectedBarColor = this.getFontColor(this.value);
        }
      }, 500)
    }
  });
})(bbn);

</script>
<style scoped>
div.bbn-tabs {
  border: 0 !important;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  zoom: 1;
}
div.bbn-tabs:not(.bbn-tabs-vertical) {
  width: 100%;
}
div.bbn-tabs div.bbn-tabs-ul-container {
  width: 100%;
  height: auto;
}
div.bbn-tabs.bbn-tabs-scrollable > div.bbn-tabs-container div.bbn-tabs-ul-container {
  padding: 0 !important;
  height: 2.4rem;
}
div.bbn-tabs.bbn-tabs-scrollable > div.bbn-tabs-container div.bbn-tabs-ul-container ul.bbn-tabs-tabs:first-child {
  white-space: nowrap;
  overflow: hidden;
}
div.bbn-tabs > div.bbn-tabs-container {
  width: 100%;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child {
  height: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  border-top-width: 0px;
  border-left-width: 0px;
  border-right-width: 0px;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li {
  height: 2.4rem;
  list-style-type: none;
  text-decoration: none;
  margin: 0;
  vertical-align: middle;
  position: relative;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li.top {
  border-bottom: 0;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li.bottom {
  border-top: 0;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li i:focus,
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li span:focus {
  animation: bbn-anim-blinker 1s linear infinite;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li .bbn-tabs-badge-container {
  position: absolute;
  top: 0;
  left: 1px;
  bottom: 0px;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li .bbn-tabs-tab-loader {
  display: inline-block;
  width: 12px;
  height: 12px;
  position: absolute;
  top: 0.4rem;
  left: 2px;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li .bbn-tabs-tab-loader:after {
  content: " ";
  display: block;
  width: 8px;
  height: 8px;
  margin: 1px;
  border-radius: 50%;
  border-style: solid;
  border-width: 2px;
  border-right-color: transparent !important;
  border-left-color: transparent !important;
  animation: bbn-tabs-tab-loader 1.2s linear infinite;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li div.bbn-tabs-tab {
  cursor: pointer;
  color: inherit;
  padding: 0.3rem 1.15rem 0.5rem 1.15rem;
  vertical-align: middle;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li div.bbn-tabs-tab > .bbn-router-tab-text {
  font-size: 1.1rem;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li div.bbn-tabs-tab > .bbn-tabs-main-icon {
  line-height: 100%;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li div.bbn-tabs-tab::after,
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li div.bbn-tabs-tab::before {
  font-family: monospace;
  content: " ";
  white-space: pre;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li div.bbn-tabs-tab.bbn-tabs-dirty::after {
  content: "*";
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li div.bbn-tabs-icon {
  position: absolute;
  right: 0px;
  top: 0px;
  bottom: 0px;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li div.bbn-tabs-icon > i {
  display: block;
  position: absolute;
  right: 0px;
  padding: 2px;
  padding-right: 2px;
  font-size: 1rem;
  cursor: pointer;
  margin: 0;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li div.bbn-tabs-icon > i.bbn-router-tab-close {
  top: 0px;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li div.bbn-tabs-icon > i.bbn-router-tab-menu {
  bottom: -2px;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li div.bbn-tabs-selected {
  display: none;
  position: absolute;
  bottom: 1px;
  left: 1.15rem;
  right: 1.15rem;
  height: 3px;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li.bbn-tabs-static div.bbn-tabs-icons i.bbn-router-tab-close {
  display: none;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li.bbn-tabs-active div.bbn-tabs-icons i.bbn-router-tab-menu {
  display: block;
}
div.bbn-tabs > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li.bbn-tabs-active div.bbn-tabs-selected {
  display: block;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader {
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  background-color: black;
  color: white;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation {
  margin-top: 2rem;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation h1 {
  font-size: 3.5rem !important;
  text-align: center;
  margin-top: 1rem;
  color: white;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid {
  width: 120px;
  height: 120px;
  margin: auto;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube {
  width: 33%;
  height: 33%;
  float: left;
  background-color: white;
  -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
  animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube1 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube2 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube3 {
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube4 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube5 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube6 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube7 {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube8 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-tabs > div.bbn-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube9 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-tabs > div.bbn-tabs-container div.bbn-tabs-button {
  width: 2.5rem;
  height: 2.4rem;
}
div.bbn-tabs > div.bbn-tabs-container > span.bbn-button {
  top: 0.4rem;
  position: absolute;
}
div.bbn-tabs.bbn-tabs-vertical {
  height: 100%;
}
div.bbn-tabs.bbn-tabs-vertical div.bbn-tabs-ul-container {
  width: auto;
  height: 100%;
}
div.bbn-tabs.bbn-tabs-vertical > div.bbn-tabs-container {
  height: 100%;
}
div.bbn-tabs.bbn-tabs-vertical > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li.right {
  border-left: 0;
}
div.bbn-tabs.bbn-tabs-vertical > div.bbn-tabs-container ul.bbn-tabs-tabs:first-child > li.left {
  border-right: 0;
}
div.bbn-tabs .bbn-tabs {
  margin-top: 0.5rem;
  height: calc(99.5%);
}
div.bbn-tabs .bbn-tabs .bbn-tabs {
  margin-top: 0 !important;
}
div.bbn-tabs .bbn-pane .bbn-tabs {
  margin-top: 0;
}
div.bbn-tabs .bbn-pane .bbn-tabs .bbn-tabs {
  margin-top: 0.5rem;
}
@keyframes bbn-tabs-tab-loader {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>
