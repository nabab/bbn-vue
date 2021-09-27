<template>
<div :class="[componentClass, {
       'bbn-invisible': !ready,
       'bbn-overlay': nav,
     }]">
  <div :class="{
        'bbn-flex-height': nav,
        'bbn-router-nav': nav,
        'bbn-router-nav-bc': nav && isBreadcrumb,
        'bbn-overlay': !nav
      }">
    <!-- START OF BREADCRUMB -->
    <div v-if="nav && isBreadcrumb"
        ref="breadcrumb"
        :class="['bbn-router-breadcrumb', {'bbn-router-breadcrumb-master': master}]">
      <div v-if="master"
          class="bbn-router-breadcrumb-container">
        <div class="bbn-h-100 bbn-alt bbn-bordered-bottom bbn-no-border-top bbn-no-border-right bbn-vmiddle"
            :style="{
              backgroundColor: getBackgroundColor(selected),
              color: getFontColor(selected)
            }">
          <div class="bbn-flex-width bbn-h-100 bbn-vmiddle">
            <template v-if="breadcrumbs.length"
                      v-for="(bc, i) in breadcrumbs">
              <div v-if="i > 0">
                <i class="nf nf-fa-angle_right bbn-hsmargin bbn-large bbn-router-breadcrumb-arrow"/>
              </div>
              <bbn-context :source="bc.getList(i)"
                            tag="div"
                            min-width="10em"
                            tabindex="0"
                            :item-component="$options.components.listItem"
                            class="bbn-h-100 bbn-vmiddle"
                            :attach="itsMaster ? (itsMaster.getRef('breadcrumb') || undefined) : undefined"
                            :autobind="false"
                            :style="{
                              backgroundColor: bc.getBackgroundColor(bc.selected),
                              color: bc.getFontColor(bc.selected)
                            }">
                <bbn-context :source="bc.getMenuFn"
                             :source-index="isNumber(bc.selected) ? bc.selected : undefined"
                             tag="div"
                             min-width="10em"
                             tabindex="0"
                             :context="true"
                             :autobind="false"
                             class="bbn-vmiddle bbn-h-100">
                  <div class="bbn-vmiddle bbn-h-100">
                    <div class="bbn-router-breadcrumb-badge-container bbn-middle"
                          v-if="isNumber(bc.selected) && bc.views[bc.selected] && numProperties(bc.views[bc.selected].events)">
                      <span class="bbn-badge bbn-small bbn-bg-red"
                            v-text="numProperties(bc.views[bc.selected].events)"/>
                    </div>
                    <div class="bbn-router-breadcrumb-loader bbn-border-text"
                        :style="{borderColor: isNumber(bc.selected) && bc.views[bc.selected] && bc.views[bc.selected].fcolor ? bc.views[bc.selected].fcolor : null}"
                        v-show="isNumber(bc.selected) && bc.views[bc.selected] && bc.views[bc.selected].loading"/>
                    <div :class="[
                           'bbn-router-breadcrumb-element',
                           'bbn-h-100',
                           'bbn-vmiddle',
                           {
                            'bbn-router-breadcrumb-dirty': isNumber(bc.selected)
                                                          && bc.views[bc.selected]
                                                          && !!bc.views[bc.selected].dirty
                          }
                         ]">
                      <span v-if="isNumber(bc.selected) && bc.views[bc.selected] && bc.views[bc.selected].icon"
                            :title="bc.views[bc.selected].title"
                            :class="'bbn-router-breadcrumb-element-icon bbn-h-100 bbn-vmiddle bbn-right-xsspace' + (bc.views[bc.selected].notext ? ' bbn-lg' : ' bbn-m')">
                        <i :class="bc.views[bc.selected].icon"
                            style="zoom: 1.1"/>
                      </span>
                      <span v-if="isNumber(bc.selected) && bc.views[bc.selected] && !bc.views[bc.selected].notext"
                            :class="['bbn-router-breadcrumb-element-text', {'bbn-b': !breadcrumbs[i+1]}]"
                            :title="bc.views[bc.selected].title && (bc.views[bc.selected].title.length > bc.maxTitleLength) ? bc.views[bc.selected].title : ''"
                            v-html="bc.views[bc.selected].title ? bc.cutTitle(bc.views[bc.selected].title) : _('Untitled')"/>
                    </div>
                    <i v-if="isNumber(bc.selected)
                              && bc.views[bc.selected]
                              && !bc.views[bc.selected].static
                              && !bc.views[bc.selected].pinned"
                         class="nf nf-fa-times bbn-p bbn-router-breadcrumb-close bbn-router-breadcrumb-icon"
                         @click.prevent.stop="bc.close(bc.selected)"/>
                    <i v-if="isNumber(bc.selected) && bc.views[bc.selected] && bc.views[bc.selected].menu"
                       class="nf nf-fa-caret_down bbn-router-breadcrumb-menu bbn-router-breadcrumb-icon bbn-p"
                       @click.prevent.stop="openMenu($event)"/>
                  </div>
                </bbn-context>
              </bbn-context>
            </template>
            <div v-if="breadcrumbs.length"
                 class="bbn-flex-fill bbn-h-100"
                 :style="{
                   backgroundColor: breadcrumbs[breadcrumbs.length-1].getBackgroundColor(breadcrumbs[breadcrumbs.length-1].selected),
                   color: breadcrumbs[breadcrumbs.length-1].getFontColor(breadcrumbs[breadcrumbs.length-1].selected)
                 }">
              &nbsp;
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- END OF BREADCRUMB -->
    <!-- START OF TABS -->
    <div v-else-if="nav && !isBreadcrumb"
         :class="['bbn-router-tabs', {'bbn-router-tabs-scrollable': scrollable}]"
         ref="tabs">
      <div class="bbn-router-tabs-container">
        <div class="bbn-router-tabs-ul-container">
          <div class="bbn-flex-width">
            <div v-if="scrollable"
                class="bbn-router-tabs-button bbn-router-tabs-button-prev bbn-p">
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
                    class="bbn-alt bbn-router-tabs-tabs bbn-bordered-bottom bbn-flex-fill">
                  <li v-for="(tab, tabIndex) in views"
                      @click="!tab.disabled && (tabIndex !== selected) ? activateIndex(tabIndex) : false"
                      :ref="'tab-' + tabIndex"
                      v-show="!tab.hidden"
                      :style="{
                        backgroundColor: tab.bcolor || null,
                        color: tab.fcolor || null
                      }"
                      :data-index="tabIndex"
                      :class="['bbn-iblock', 'bbn-bordered', 'bbn-radius-top', 'bbn-state-default', 'bbn-unselectable', {
                        'bbn-router-tabs-static': !!tab.static,
                        'bbn-background-effect-internal': tabIndex === selected,
                        'bbn-router-tabs-active': tabIndex === selected,
                        'bbn-disabled': tab.disabled,
                        'bbn-router-tabs-alarm': tab.alarm
                      }, tab.cls || '']">
                    <div class="bbn-router-tabs-badge-container bbn-middle"
                          v-if="numProperties(tab.events)">
                      <span class="bbn-badge bbn-small bbn-bg-red"
                            v-text="numProperties(tab.events)"/>
                    </div>
                    <div class="bbn-router-tabs-tab-loader bbn-border-text"
                          :style="{borderColor: tab.fcolor || null}"
                          v-show="tab.loading"/>
                    <bbn-context :context="true"
                                 @keydown.space.enter.prevent.stop="tabIndex !== selected ? activateIndex(tabIndex) : false"
                                 @keydown.right.down.prevent.stop="getRef('menu-' + tabIndex) ? getRef('menu-' + tabIndex).$el.focus() : (getRef('closer-' + tabIndex) ? getRef('closer-' + tabIndex).focus() : null)"
                                 :source="getMenuFn"
                                 :source-index="tabIndex"
                                 :autobind="false"
                                 tag="div"
                                 :disabled="tabIndex !== selected"
                                 min-width="10em"
                                 :class="['bbn-router-tabs-tab', 'bbn-iblock', {
                                   'bbn-router-tabs-dirty': tab.dirty,
                                   'bbn-router-tabs-icononly': tab.notext
                                 }]"
                                 :ref="'title-' + tabIndex"
                                 :style="{
                                   color: tab.fcolor ? tab.fcolor : null
                                 }"
                                 tabindex="0">
                      <span v-if="tab.icon"
                            :title="tab.title"
                            :class="'bbn-router-tabs-main-icon bbn-iblock' + (tab.notext ? ' bbn-lg' : ' bbn-m')">
                        <i :class="tab.icon"
                            :style="{zoom: iconsReady ? 1.1 : 1}"/>
                      </span>
                      <span v-if="!tab.notext && tab.title"
                            class="bbn-router-tab-text"
                            :title="getFullTitle(tab)"
                            v-html="tab.title.length > maxTitleLength ? cutTitle(tab.title) : tab.title"/>
                    </bbn-context>
                    <div class="bbn-router-tabs-selected"
                          :ref="'selector-' + tabIndex"
                          v-show="tabIndex === selected"
                          :style="{
                            backgroundColor: getFontColor(tabIndex)
                          }"/>
                    <div class="bbn-router-tabs-icon">
                      <i v-if="!tab.static && !tab.pinned"
                        class="nf nf-fa-times bbn-p bbn-router-tab-close"
                        tabindex="-1"
                        :ref="'closer-' + tabIndex"
                        @keydown.left.down.prevent.stop="getRef('menu-' + tabIndex) ? getRef('menu-' + tabIndex).$el.focus() : null"
                        @keydown.space.enter.prevent.stop="close(tabIndex)"
                        @click.stop.prevent="close(tabIndex)"/>
                      <bbn-context v-if="(tab.menu !== false) && (tabIndex === selected)"
                                  class="nf nf-fa-caret_down bbn-router-tab-menu bbn-p"
                                  tabindex="-1"
                                  min-width="10em"
                                  tag="i"
                                  :source="getMenuFn"
                                  :autobind="false"
                                  :source-index="tabIndex"
                                  :ref="'menu-' + tabIndex"/>
                    </div>
                  </li>
                </ul>
              </component>
            </div>
            <div v-if="scrollable"
              class="bbn-router-tabs-button bbn-router-tabs-button-next bbn-p">
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
    <!-- END OF TABS -->
    <!-- START OF CONTENT -->
    <div :class="{
           'bbn-flex-fill': !!nav,
           'bbn-overlay': !nav
         }"
         v-if="ready">
      <slot></slot>
      <bbn-container v-for="view in views"
                     v-if="!view.real && !component"
                     :key="view.url"
                     v-bind="view"/>
      <bbn-container v-if="component && componentSource && componentUrl"
                     :source="componentSource"
                     :component="component"
                     :url="componentSource[componentUrl]"/>
    </div>
    <!-- END OF CONTENT -->
  </div>
</div>
</template>
<script>
  module.exports = /**
 * @file bbn-router component
 * @description bbn-router is a component that allows and manages the navigation (url) between the various containers of an application
 * @copyright BBN Solutions
 * @author BBN Solutions
 */
(function(bbn, Vue){
  "use strict";

  Vue.component("bbn-router", {
    name: 'bbn-router',
    mixins: [
      /**
       * @mixin bbn.vue.basicComponent
       * @mixin bbn.vue.resizerComponent
       * @mixin bbn.vue.localStorageComponent
       * @mixin bbn.vue.closeComponent
       * @mixin bbn.vue.observerComponent
       */
      bbn.vue.basicComponent,
      bbn.vue.localStorageComponent,
      bbn.vue.closeComponent,
      bbn.vue.observerComponent
    ],
    props: {
      /**
       * Routes automatically after mount.
       * @prop {Boolean} [true] auto
       */
      auto: {
        type: Boolean,
        default: true
      },
      /**
       * The URL on which the router will be initialized.
       * @prop {String} ['] url
       */
      url: {
        type: String,
        default: ''
      },
      /**
       * Defines if the container will be automatically loaded based on URLs.
       * @prop {Boolean} [true] autoload
       */
      autoload: {
        type: Boolean,
        default: true
      },
      /**
       * The root URL of the router, will be only taken into account for the top parents' router, will be automatically calculated for the children.
       * @prop {String} ['] root
       */
      root: {
        type: String,
        default: ''
      },
      /**
       * @prop {String} def
       */
      def: {
        type: String
      },
      /**
       * The views shown at init.
       * @prop {Array} [[]] source
       */
      source: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * @prop {Boolean} [false] single
       */
      single: {
        type: Boolean,
        default: false
      },
      /**
       * Set it to true if you want to see the navigation bar (tabs or breadcrumb).
       * @prop {Boolean} [false] nav
       */
      nav: {
        type: Boolean,
        default: false
      },
      /**
       * Sets if the views' titles will be scrollable in case they have a greater width than the page (true), or if they will be shown multilines (false, default).
       * @prop {Boolean} [false] scrollable
       */
      scrollable: {
        type: Boolean,
        default: false
      },
      /**
       * The name used for the storage.
       * @prop {String} ['__ROOT__'] storageName
       */
      storageName: {
        type: String,
        default: '__ROOT__'
      },
      /**
       * The confirm message when you close an unsaved container.
       * @prop {(Boolean|String|Function)} ['Are you sure you want to discard the changes you made in this tab?'] confirmLeave
       */
      confirmLeave: {
        type: [Boolean, String, Function],
        default: bbn._("Are you sure you want to discard the changes you made in this page?")
      },
      /**
       *
       * @prop {String} hideAdvertUrl
       */
      hideAdvertUrl: {
        type: String
      },
      /**
       * The max length of the history.
       * @prop {Number} [10] historyMaxLength
       */
      historyMaxLength: {
        type: Number,
        default: 10
      },
      /**
       * @todo Integrates Boolean to have a default with no menu
       * @prop {Array|Function} [[]] menu
       */
      menu: {
        type: [Array, Function],
        default: function(){
          return [];
        }
      },
      /**
       * Set it to true if you want to show the breadcrumb instead of the tabs.
       * @prop {Boolean} [false] breadcrumb
       */
      breadcrumb: {
        type: Boolean,
        default: false
      },
      /**
       * Set it to true if you want to set this nav as a master.
       * @prop {Boolean} [false] master
       */
      master: {
        type: Boolean,
        default: false
      },
      /**
       * Set it to true if you want to send the variable _baseUrl.
       * @prop {Boolean} [true] master
       */
      postBaseUrl: {
        type: Boolean,
        default: true
      },
      /**
       * Set it to false if you want to hide the switch.
       * @prop {Boolean} [true] switch
       */
      showSwitch: {
        type: Boolean,
        default: true
      },
      /**
       * If this is set, along with componentSource and componentUrl a single container with this component will be created.
       * @prop {(String|Object)} component
       */
      component: {
        type: [String, Object]
      },
      /**
       * The source for the component.
       * @prop {Object} componentSource
       */
      componentSource: {
        type: Object
      },
      /**
       * The property to get from the componentSource to use for setting the URL.
       * @prop {String} componentUrl
       */
      componentUrl: {
        type: String
      },
      /**
       * The max length for the titles
       * @prop {Number} [20] maxTitleLength
       */
      maxTitleLength: {
        type: Number,
        default: 20
      },
      disabled: {
        type: Boolean,
        default: false
      },
      urlNavigation: {
        type: Boolean,
        default: true
      },
      /**
       * Will be passed to router in order to ignore the dirty parameter.
       * @prop {Boolean} ignoreDirty
       */
       ignoreDirty: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        /**
         * Number of conatainers registered - as they say it.
         * @data {Number} [0] numRegistered
         */
        numRegistered: 0,
        /**
         * Real containers are the bbn-container in the slot.
         * @data {Boolean} [false] hasRealContainers
         */
        hasRealContainers: false,
        /**
         * Fake containers are the bbns-container in the slot.
         * @data {Boolean} [false] hasFakeContainers
         */
        hasFakeContainers: false,
        /**
         * True if one of the initial containers' URL is an empty string.
         * @data {Boolean} [false] hasEmptyURL
         */
        hasEmptyURL: false,
        /**
         * The array of containers defined in the source.
         * @data {Array} cfgViews
         */
        cfgViews: [].concat(this.source),
        /**
         * The views from the slot.
         * @data {Array} [[]] slotViews
         */
        slotViews: [],
        /**
         * All the views.
         * @data {Array} [[]] views
        */
        views: [],
        /**
         * All the URLS of the views.
         * @data {Object} [{}] urls
         */
        urls: {},
        /**
         * Current URL of the router.
         * @data {String} currentURL
         */
        currentTitle: '',
        /**
         * Current URL of the router.
         * @data {String} currentURL
         */
        currentURL: this.url || '',
        /**
         * Relative root of the router (set by user or by parent router).
         * @data {String} baseURL
         */
        baseURL: this.setBaseURL(this.root),
        /**
         * An array of the parents router.
         * @data {Array} [[]] parents
         */
        parents: [],
        /**
         * The direct parent router if there is one.
         * @data {Vue} [null] parent
         */
        parent: null,
        /**
         * The root router or the current one it's the same.
         * @data {Vue} [null] router
         */
        router: null,
        /**
         * The container having the router in if there is one.
         * @data {Vue} [null] parentContainer
         */
        parentContainer: null,
        /**
         * ????
         * @data {Boolean} [ture] visible
         */
        visible: true,
        /**
         * The currently visible container.
         * @data {Vue} [null] activeContainer
         */
        activeContainer: null,
        /**
         * Set to true each time the router is loading (can only load once at a time).
         * @data {Boolean} [false] isLoading
         */
        isLoading: false,
        /**
         * This will remain false until the first routing.
         * @data {Boolean} [false] routed
         */
        routed: false,
        /**
         * True while the component is in the action of routing.
         * @data {Boolean} [false] isRouting
         */
        isRouting: false,
        /**
         * False until the first routing.
         * @data {Boolean} [false] isInit
         */
        isInit: false,
        /**
         * The index of the currently selected view.
         * @data {Number} [null] selected
         */
        selected: null,
        /**
         * The list of the dirty containers.
         * @data {Array} [[]] dirtyContainers
         */
        dirtyContainers: [],
        /**
         * The navigation history.
         * @data {Array} [[]] history
         */
        history: [],
        /**
         * @data {Boolean} [false] iconsReady
         */
        iconsReady: false,
        /**
         * Shows if the navigation mode is set to breacrumb.
         * @data {Boolean} isBreadcrumb
         */
        isBreadcrumb: this.breadcrumb,
        /**
         * itsMaster.isBreadcrumb watcher.
         * @data breadcrumbWatcher
         */
        breadcrumbWatcher: false,
        breadcrumbsList: []
      };
    },
    computed: {
      /**
       * Not only the baseURL but a combination of all the parent's baseURLs.
       * @computed fullBaseURL
       * @return {String}
       */
      fullBaseURL(){
        let vm = this,
            base = '',
            tmp;
        while ( tmp = vm.baseURL ){
          base = tmp + base;
          if ( !vm.parents.length ){
            break;
          }
          vm = vm.parents[0];
        }
        return base;
      },
      /**
       * Returns true if there are any unsaved views.
       * @computed isDirty
       * @return {Boolean}
       */
      isDirty(){
        return !!this.dirtyContainers.length;
      },
      /**
       * The master bbn-router of this one.
       * @computed itsMaster
       * @return {Vue}
       */
      itsMaster(){
        if ( this.master ){
          return this;
        }
        return bbn.fn.getRow(this.parents, {master: true})
      },
      /**
       * Returns the bbn-tabs component of this router.
       * @computed itsTabs
       * @fires getRef
       * @return {Vue|Boolean}
       */
      itsTabs(){
        if ( !this.isBreadcrumb ){
          return this.getRef('tabs');
        }
        return false;
      },
      
      /**
       * The final Vue object for the active container (if it has sub-router).
       * @computed activeRealContainer
       * @fires getRealVue
       * @return {Vue|Boolean}
       */
      activeRealContainer(){
        if ( bbn.fn.isNumber(this.selected) ){
          return this.getRealVue(this.selected);
        }
        return false;
      },
      /**
       * The last router.
       * @computed activeRouter
       * @fires getSubRouter
       * @return {Vue}
       */
      activeRouter(){
        if ( this.activeContainer ){
          let sub = this.getSubRouter(this.selected);
          if ( bbn.fn.isVue(sub) ){
            return sub.activeRouter;
          }
        }
        return this;
      },
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
      breadcrumbs(){
        let res = [];
        if (this.isBreadcrumb) {
          res.push(this)
        }
        if (this.breadcrumbsList.length) {
          res.push(...this.getBreadcrumbs(this.selected))
        }
        return res;
      }
    },

    methods: {
      /**
       * Alias of bbn.fn.isNumber
       * @method isNumber
       * @return {Boolean}
       */
      isNumber: bbn.fn.isNumber,
      /**
       * Alias of bbn.fn.numProperties
       * @method numProperties
       * @return {Number|Boolean}
       */
      numProperties: bbn.fn.numProperties,
      /**
       * Function used by container to make themselves known when they are mounted.
       * @method register
       * @param {Vue} cp
       * @param {Boolean} fake
       * @fires add
       * @fires search
       * @fires route
       * @fires getDefaultURL
       */
      register(cp, fake){
        if ( fake ){
          this.add(cp);
          return;
        }
        if (!bbn.fn.isString(cp.url)) {
          throw Error(bbn._('The component bbn-container must have a URL defined'));
        }
        if (this.urls[cp.url]) {
          throw Error(bbn._('Two containers cannot have the same URL defined (' + cp.url + ')'));
        }
        this.numRegistered++;
        this.urls[cp.url] = cp;
        let idx = this.search(cp.url);
        if (idx === false) {
          this.add(cp);
        }
        else{
          cp.currentIndex = idx;
          if ( !this.isInit && (this.numRegistered === this.views.length) ){
            this.isInit = true;
            if ( this.auto ){
              this.route(this.single ? cp.url : this.getDefaultURL(), true);
            }
          }
        }
        this.$emit('registered', cp.url)
      },
      /**
       * Function used by container to make themselves known when they are destroyed
       * @method unregister
       * @fires search
       * @fires remove
       * @param {Vue} cp
       */
      unregister(cp){
        if (!bbn.fn.isString(cp.url)) {
          throw Error(bbn._('The component bbn-container must have a URL defined'));
        }
        this.numRegistered--;
        let idx = this.search(cp.url),
            dataObj = this.postBaseUrl ? {_bbn_baseURL: this.fullBaseURL} : {},
            requestID = bbn.fn.getRequestId(cp.url, dataObj);
        if (bbn.fn.getLoader(requestID)) {
          bbn.fn.abort(requestID);
        }
        if (this.urls[cp.url] !== undefined) {
          delete this.urls[cp.url];
        }
        if (idx !== false) {
          this.remove(idx);
        }
        if (this.isInit && (this.views.length !== this.numRegistered)) {
          this.isInit = false;
        }
      },
      /**
       * Given a URL returns the existing path of a corresponding view or false, or the default view if forced.
       * @method getRoute
       * @param {String} url
       * @param {Boolean} force
       * @fires parseURL
       * @returns {String|false}
       */
      getRoute(url, force){
        if (!bbn.fn.isString(url)) {
          bbn.fn.log("error in getRoute with url", url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }

        if (!url && this.hasEmptyURL) {
          return '';
        }

        if ( !url && !this.parent ){
          url = this.parseURL(bbn.env.path);
        }

        if ( !url && force && this.parent ){
          url = this.parseURL(this.router.getFullCurrentURL());
        }

        if ( url ){
          let bits = url.split('/');
          while ( bits.length ){
            let st = bits.join('/');
            if ( this.urls[st] ){
              return this.urls[st].disabled ? '' : st;
            }
            bits.pop();
          }
        }

        if ( this.def && force ){
          return this.def
        }

        if ( this.views.length && force ){
          return this.views[0].current
        }

        return false;
      },

      /**
       * Formats a baseURL correctly (without 1st slash and with end slash.
       * @method setBaseURL
       * @param {String} baseURL
       * @returns {String}
       */
      setBaseURL(baseURL){
        while ( baseURL.substr(-1) === '/' ){
          baseURL = baseURL.substr(0, baseURL.length-1);
        }
        while ( baseURL.substr(0, 1) === '/' ){
          baseURL = baseURL.substr(1);
        }
        return baseURL ? baseURL + '/' : '';
      },
      /**
       * Returns the default object for the view.
       * @method getDefaultView
       * @return {Object}
       */
      getDefaultView(){
        return {
          source: null,
          title: bbn._("Untitled"),
          options: null,
          cached: true,
          scrollable: true,
          component: null,
          icon: '',
          notext: false,
          content: null,
          menu: [],
          loaded: null,
          fcolor: null,
          bcolor: null,
          load: false,
          selected: null,
          css: '',
          advert: null,
          dirty: false,
          help: null,
          imessages: [],
          script: null,
          static: false,
          pinned: false,
          url: null,
          current: null,
          real: false,
          cfg: {},
          events: {},
          real: false,
          last: 0
        };
      },
      /**
       * Sends event beforeRoute (cancellable) and launch real routing.
       * @method route
       * @param {String} url
       * @param {Boolean} force
       * @fires realRoute
       * @fires getRoute
       * @fires load
       * @emit beforeRoute
       * @returns {void}
       */
      route(url, force) {
        if (!bbn.fn.isString(url)) {
          bbn.fn.log("error in route with url", url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        url = bbn.fn.replaceAll('//', '/', url);
        if (this.ready && (force || !this.activeContainer || (url !== this.currentURL))) {
          let event = new CustomEvent(
            "beforeRoute",
            {
              bubbles: false,
              cancelable: true
            }
          );
          this.$emit("beforeRoute", event, url);
          if (!event.defaultPrevented) {
            let bits = url.split('#');
            url = bits[0];
	          if ((url === '') && this.hasEmptyURL) {
              this.urls[''].setCurrent(url);
              this.realRoute('', '', force);
              return;
            }
            // Checks weather the container is already there
            if (!url) {
              let idx = this.getRoute('', true);
              if ( idx ){
                url = this.urls[idx].currentURL;
              }
            }
            let st = url ? this.getRoute(url) : '';
            //bbn.fn.log("ROUTING FUNCTION EXECUTING FOR " + url + " (CORRESPONDING TO " + st + ")");
            if (!url || (!force && (this.currentURL === url))) {
              if (bits[1]) {

              }
              //bbn.fn.log("SAME URL END ROUTING");
              return;
            }
            else if (url && ((!st && this.autoload) || (this.urls[st] && this.urls[st].load && !this.urls[st].isLoaded))) {
              this.load(url);
            }
            // Otherwise the container is activated ie made visible
            else {
              //bbn.fn.log("LOADED " + url);
              if (!st && this.def && (!url || force)) {
                st = this.getRoute(this.def);
                if (st) {
                  url = this.def;
                }
              }
              if (!st && force && this.views.length) {
                st = this.views[0].url;
                if (st) {
                  url = this.urls[st].currentURL || st;
                }
              }
              if (st) {
                this.urls[st].setCurrent(url);
                this.realRoute(url, st, force, bits[1]);
              }
            }
          }
        }
      },
      /**
       * Routes the router.
       * @method realRoute
       * @param {String} url The URL to route to
       * @param {String} st The URL/key of the container on which we will route
       * @param {Boolean} force
       * @fires activate
       * @emit route1
       */
      realRoute(url, st, force, anchor){
        if (!bbn.fn.isString(url) && !bbn.fn.isNumber(url)){
          bbn.fn.log("error in realRoute with url", url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        if (this.urls[st]) {
          //bbn.fn.log("REAL ROUTING GOING ON FOR " + url);
          if ( url !== this.currentURL ){
            //bbn.fn.log("THE URL IS DIFFERENT FROM THE ORIGINAL " + this.currentURL);
            this.currentURL = url;
          }
          // First routing, triggered only once
          if ( !this.routed ){
            this.routed = true;
            this.$emit("route1", this);
          }
          this.activate(url, this.urls[st]);
          if ( this.urls[st] ){
            this.urls[st].currentURL = url;
            this.urls[st].init();
            this.$nextTick(() => {
              let child = this.urls[st].find('bbn-router');
              //bbn.fn.log("LOOKING FOR CHILD", child);
              if ( child ){
                child.route(url.substr(st.length + 1), force);
              }
              else {
                let ifr = this.urls[st].find('bbn-frame');
                if (ifr) {
                  ifr.route(url.substr(st.length+1));
                }
              }
            });
          }
        }
      },
      /**
       * Routes to the next view if any.
       * @method next
       * @fires activateIndex
       */
      next(force){
        let next = this.selected+1;
        if (!this.views[next] && force) {
          next = 0;
        }
        if (this.views[next]) {
          this.activateIndex(next);
        }
      },
      /**
       * Routes to the previous view if any.
       * @method prev
       * @fires activateIndex
       */
      prev(force){
        let prev = this.selected-1;
        if (!this.views[prev] && force) {
          prev = this.views.length - 1;
        }
        if (this.views[prev]) {
          this.activateIndex(prev);
        }
      },
      /**
       * Shows the container with the corresponding URL and hide all others.
       * @method activate
       * @param url
       * @param container
       */
      activate(url, container){
        if (!bbn.fn.isString(url) ){
          bbn.fn.log("error in activate with url", url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        let todo = false;
        //bbn.fn.log("ACTIVATING " + url + " AND SENDING FOLLOWING CONTAINER:", container);
        if ( !this.activeContainer || (container && (this.activeContainer !== container)) ){
          this.activeContainer = null;
          bbn.fn.each(this.$children, (cp) => {
            if ( bbn.fn.isFunction(cp.hide) ){
              if ( (cp !== container) ){
                cp.hide();
              }
              else{
                cp.setCurrent(url);
                this.activeContainer = cp;
              }
            }
          });
          if ( this.activeContainer ){
            this.activeContainer.show();
            if (this.scrollable && this.nav && !this.breadcrumb) {
              let scroll = this.getRef('horizontal-scroll');
              if (scroll.ready) {
                this.getRef('horizontal-scroll').scrollTo(this.getRef('tab-' + this.activeContainer.idx));
              }
              else if (scroll) {
                scroll.$on('ready', () => {
                  setTimeout(() => {
                    this.getRef('horizontal-scroll').scrollTo(this.getRef('tab-' + this.activeContainer.idx));
                  }, 100);
                })
              }
            }
          }
        }
        else if ( url !== this.activeContainer.currentURL ){
          this.activeContainer.setCurrent(url);
        }
        //bbn.fn.log("ACTIVATED " + url + " AND ACTIVATED CONTAINER BELOW:", this.activeContainer);
      },
      /**
       * @method changeURL
       * @param {String} url
       * @param {String} title
       * @param {Boolean} replace
       * @fires getFullBaseURL
       */
      changeURL(url, title, replace){
        if (!bbn.fn.isString(url) ){
          bbn.fn.log("error in changeURL with url", url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        if ( !bbn.env.isInit ){
          return;
        }
        if (title && (title !== this.currentTitle)) {
          this.currentTitle = title;
        }
        if ( url !== this.currentURL ){
          this.currentURL = url;
          // Will fire again
          return;
        }

        /*
        bbn.fn.log(
          "changeURL",
          url,
          title,
          this.parentContainer ? 
            ["FROM PQARENT", this.parentContainer.currentTitle, this.parentContainer.title]
            : this.currentTitle
        );
        */
        // Changing the current property of the view cascades on the container's currentURL
        if (
          this.views[this.selected] &&
          (
            (url.indexOf(this.views[this.selected].url + '/') === 0) ||
            (url === this.views[this.selected].url)
          )
        ){
          this.$set(this.views[this.selected], 'current', url);
        }
        if (this.urlNavigation) {
          if ( this.parentContainer ){
            this.parentContainer.currentTitle = title + ' < ' + this.parentContainer.title;
            this.parent.changeURL(this.baseURL + url, this.parentContainer.currentTitle, replace);
          }
          else if ( replace || (url !== bbn.env.path) ){
            if ( !replace ){
              //bbn.fn.log("NO REPLAACE", this.getFullBaseURL() + url, bbn.env.path);
            }
            if ( !replace && ((this.getFullBaseURL() + url).indexOf(bbn.env.path) === 0) ){
              //bbn.fn.log("REPLACING");
              replace = true;
            }
            bbn.fn.setNavigationVars(this.getFullBaseURL() + url, this.currentTitle, {}, replace);
          }
        }
      },
      /**
       * Returns the baseURL property.
       * @method getBaseURL
       * @returns {String}
       */
      getBaseURL(){
        return this.baseURL;
      },
      /**
       * Returns a string of all the baseURL properties till root.
       * @method getFullBaseURL
       * @returns {String}
       */
      getFullBaseURL(){
        return this.fullBaseURL;
      },
      /**
       * Returns the full URL from the root router (without the hostname).
       * @method getFullURL
       * @fires getFullBaseURL
       * @returns {String}
       */
      getFullURL(){
        let url = this.getURL();
        if ( url !== false ){
          return this.getFullBaseURL() + url;
        }
        return '';
      },
      /**
       * Returns the current URL of the current router.
       * @method getCurrentURL
       * @returns {String}
       */
      getCurrentURL(){
        return this.currentURL;
      },
      /**
       * Returns the full current URL from the root router (without the hostname).
       * @method getFullCurrentURL
       * @fires getCurrentURL
       * @fires getFullBaseURL
       * @returns {String|Boolean}
       */
      getFullCurrentURL(){
        let url = this.getCurrentURL();
        if ( url !== false ){
          return this.getFullBaseURL() + url;
        }
        return false;
      },
      /**
       * Returns the url relative to the current tabNav from the given url.
       * @method parseURL
       * @param fullURL
       * @returns {String}
       */
      parseURL(fullURL){
        let url = fullURL;
        if ( fullURL === undefined ){
          return '';
        }
        if (!bbn.fn.isString(fullURL)) {
          fullURL = fullURL.toString();
        }
        if ( fullURL.indexOf(bbn.env.root) === 0 ){
          fullURL = fullURL.substr(bbn.env.root.length);
        }
        fullURL = bbn.fn.removeTrailingChars(fullURL, '/');
        if (this.fullBaseURL === (fullURL + '/')) {
          return '';
        }
        if ( this.fullBaseURL ){
          if (fullURL.indexOf(this.fullBaseURL) === 0){
            fullURL = fullURL.substr(this.fullBaseURL.length);
          }
          else{
            fullURL = '';
          }
        }
        return fullURL;
      },
      /**
       * @method isValidIndex
       * @return {Boolean}
       */
      isValidIndex(idx){
        return (typeof idx === 'number') && (this.views[idx] !== undefined);
      },
      /**
       * Activates the default view, or the first one if no default.
       * @method activateDefault
       * @fires getIndex
       * @fires isValidIndex
       * @fires activate
       */
      activateDefault(){
        let idx = this.getIndex('', true);
        if ( this.isValidIndex(idx) ){
          this.activate(this.views[idx].current ? this.views[idx].current : this.views[idx].url);
        }
      },
      /**
       * @method activateIndex
       * @param {Number} idx
       * @fires isValidIndex
       * @fires route
       */
      activateIndex(idx){
        if ( this.isValidIndex(idx) ){
          if ( this.urls[this.views[idx].url] ){
            this.route(this.urls[this.views[idx].url].currentURL);
          }
          else{
            this.route(this.views[idx].current);
          }
        }
      },
      /**
       * @method getVue
       * @fires isValidIndex
       * @return {Vue|Boolean}
       */
      getVue(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        if ( this.isValidIndex(idx) ){
          return this.urls[this.views[idx].url];
        }
        return false;
      },
      /**
       * Returns the corresponding container's component's DOM element.
       * @method getContainer
       * @param {Number} idx
       * @return {Vue}
       */
      getContainer(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        return this.urls[this.views[idx].url];
      },
      /**
       * Returns the corresponding container's component's DOM element.
       * @method getDOMContainer
       * @param {Number} idx
       * @fires getVue
       * @return {HTMLElement|Boolean}
       */
      getDOMContainer(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        let c = this.getVue(idx);
        return c ? c.$el : false;
      },
      /**
       * Returns the next router in the corresponding container if there's any.
       * @method getSubRouter
       * @param misc
       * @fires getIndex
       * @fires getvue
       * @return {Vue|null}
       */
      getSubRouter(misc){
        let idx = this.getIndex(misc);
        if ( idx === undefined ){
          idx = this.selected;
        }
        let container = this.getVue(idx);
        if ( container ){
          return container.find('bbn-router') || null;
        }
        return null;
      },
      /**
       * @method getRealVue
       * @param misc
       * @fires getIndex
       * @fires getSubRouter
       * @fires getVue
       * @return {Vue}
       */
      getRealVue(misc){
        let idx = this.getIndex(misc),
            router = this,
            sub = router;
        if ( idx === undefined ){
          idx = this.selected;
        }
        while ( router ){
          router = sub.getSubRouter(idx);
          if ( router ){
            sub = router;
            idx = sub.selected;
          }
        }
        return sub.getVue(idx);
      },
      /**
       * @method getIndex
       * @fires isValidIndex
       * @fires search
       * @return {Number|Boolean}
       */
      getIndex(misc){
        if ( !this.views.length ){
          return false;
        }
        if ([undefined, null].includes(misc)) {
          return this.selected;
        }
        if ( !this.isValidIndex(misc) ) {
          if ( typeof(misc) === 'string' ){
            misc = this.search(misc);
          }
          else if ( typeof(misc) === 'object' ){
            // Vue
            if ( misc.$el ){
              misc = misc.$el;
            }
            if ( misc.tagName ){
              bbn.fn.each(this.$children, (ct) => {
                if (
                  ct.$vnode &&
                  ct.$vnode.componentOptions &&
                  (ct.$vnode.componentOptions.tag === 'bbn-container') &&
                  ((ct.$el === misc) || ct.$el.contains(misc))
                ){
                  misc = ct.currentIndex;
                  return false;
                }
              });
            }
          }
        }
        return this.isValidIndex(misc) ? misc : false;
      },
      fixIndexes(){
        bbn.fn.each(this.views, (v, i) => {
          if ( v.idx !== i ){
            v.idx = i;
            if (this.urls[v.url]) {
              this.urls[v.url].currentIndex = i;
            }
          }
        });
      },
      /**
       * @method remove
       * @param misc
       * @param force
       * @fires getIndex
       * @fires remove
       * @emit close
       * @return {Boolean}
       */
      remove(misc, force){
        let idx = this.getIndex(misc);
        if ( idx > -1 ){
          let ev = new Event('close', {cancelable: !force}),
              ev2 = new Event('beforeClose', {cancelable: !force});
          if ( !force ){
            this.$emit('beforeClose', idx, ev2);
          }
          if ( !ev2.defaultPrevented ){
            if (
              !this.ignoreDirty &&
              this.isDirty &&
              this.views[idx].dirty &&
              !ev.defaultPrevented &&
              !force
            ){
              ev.preventDefault();
              this.confirm(this.confirmLeave, () => {
                let forms = this.urls[this.views[idx].url].findAll('bbn-form');
                if ( Array.isArray(forms) && forms.length ){
                  bbn.fn.each(forms, (f, k) => {
                    f.reset();
                  });
                }
                this.$nextTick(() => {
                  this.$emit('close', idx, ev);
                  this.close(idx, true);
                });
              });
            }
            else {
              if (this.views[idx].real) {
                let url = this.views[idx].url;
                this.views.splice(idx, 1);
                this.$delete(this.urls, url);
                this.fixIndexes()
              }
              else {
                if ( !force ){
                  this.$emit('close', idx, ev);
                }
                if (force || !ev.defaultPrevented) {
                  let url = this.views[idx].url;
                  this.views.splice(idx, 1);
                  this.$delete(this.urls, url);
                  this.fixIndexes()
                }
                return true;
              }
            }
          }
        }
        return false;
      },
      /**
       * Adds an object with a valid url to the views.
       * @method add
       * @param {Object} obj
       * @param {Number} idx
       * @fires getFullBaseURL
       * @fires search
       * @fires isValidIndex
       * @fires getDefaultView
       */
      add(obj, idx){
        let index;
        //obj must be an object with property url
        if (
          (typeof(obj) === 'object') &&
          bbn.fn.isString(obj.url)
        ){
          obj.url = bbn.fn.replaceAll('//', '/', obj.url);
          if (obj.$options) {
            if (!obj.current && !obj.currentURL) {
              if ( bbn.env.path.indexOf(this.getFullBaseURL() + (obj.url ? obj.url + '/' : '')) === 0 ){
                obj.currentURL = bbn.env.path.substr(this.getFullBaseURL().length);
              }
              else{
                obj.currentURL = obj.url;
              }
            }
            else {
              if (obj.currentURL) {
                obj.currentURL = bbn.fn.replaceAll(obj.currentURL);
              }
            }
            let obj2 = bbn.fn.extend(true, {}, obj.$options.propsData),
                props = obj.$options.props;
            bbn.fn.iterate(props, (v, i) => {
              if (!(i in obj2) && ('default' in v)) {
                obj2[i] = v.default;
              }
            });
            bbn.fn.iterate(this.getDefaultView(), (a, n) => {
              if ( obj2[n] === undefined ){
                obj2[n] = a;
              }
            });

            // ---- ADDED 16/12/20 (Mirko) ----
            if ( !obj2.current ){
              if ( bbn.env.path.indexOf(this.getFullBaseURL() + (obj2.url ? obj2.url + '/' : '')) === 0 ){
                obj2.current = bbn.env.path.substr(this.getFullBaseURL().length);
              }
              else{
                obj2.current = obj2.url;
              }
            }
            else if ( (obj2.current !== obj2.url) && (obj2.current.indexOf(obj2.url + '/') !== 0) ){
              obj2.current = obj2.url;
            }
            if ( !obj2.current ){
              obj2.current = obj2.url;
            }
            if ( obj2.content ){
              obj2.loaded = true;
            }
            // ---- END ----

            if (obj2.real && !this.hasRealContainers) {
              this.hasRealContainers = true;
            }
            if (obj2.url === '') {
              this.hasEmptyURL = true;
            }
            if (this.search(obj2.url) === false) {
              if (this.isValidIndex(idx)) {
                this.views.splice(idx, 0, obj2);
              }
              else {
                this.views.push(obj2);
              }
            }
          }
          else{
            if ( !obj.current ){
              if ( bbn.env.path.indexOf(this.getFullBaseURL() + (obj.url ? obj.url + '/' : '')) === 0 ){
                obj.current = bbn.env.path.substr(this.getFullBaseURL().length);
              }
              else{
                obj.current = obj.url;
              }
            }
            else if ( (obj.current !== obj.url) && (obj.current.indexOf(obj.url + '/') !== 0) ){
              obj.current = obj.url;
            }
            if ( !obj.current ){
              obj.current = obj.url;
            }
            if ( obj.content ){
              obj.loaded = true;
            }
            obj.events = {};
            if ( obj.menu === undefined ){
              obj.menu = [];
            }
            index = this.search(obj.url);
            //bbn.fn.warning("ADDING CONTAINER " + obj.current + " (" + index + ")");
            if ( index !== false ){
              let o = this.views[index],
                  cn = this.urls[this.views[index].url];
              if ( idx === undefined ){
                idx = index;
              }
              if (cn && this.isValidIndex(idx)) {
                cn.currentIndex = idx;
              }
              if ( obj.real ){
                return;
              }
              bbn.fn.iterate(obj, (a, n) => {
                if ( o[n] !== a ){
                  // Each new property must be set with $set
                  this.$set(o, n, a)
                }
              });
            }
            else{
              let isValid = this.isValidIndex(idx);
              if (this.single) {
                if (this.views.length){
                  this.views.splice(0, this.views.length);
                }
                obj.selected = true;
                obj.idx = this.views.length;
              }
              else{
                obj.selected = false;
                obj.idx = isValid ? idx : this.views.length;
              }

              bbn.fn.iterate(this.getDefaultView(), (a, n) => {
                if ( obj[n] === undefined ){
                  // Each new property must be set with $set
                  this.$set(obj, n, a);
                }
              });
              if (isValid) {
                this.views.splice(obj.idx, 0, obj);
              }
              else {
                this.views.push(obj);
              }
            }
          }
          this.fixIndexes()
        }
      },
      /**
       * Moves a container within the router, changes its idx.
       * 
       * @method move
       * @param {Number} from The index of the container to move
       * @param {Number} to   The index to which the container must go
       * @returns 
       */
      move(from, to) {
        if (!bbn.fn.isNumber(from, to) || (from === to) || !this.views[from] || !this.views[to]) {
          return;
        }

        bbn.fn.move(this.views, from, to);
        let selectedOk = false;
        if (from === this.selected) {
          this.selected = to;
          selectedOk = true;
        }

        for (let i = Math.min(from, to); i <= Math.max(from, to); i++) {
          if (this.views[i].idx !== i) {
            if (!selectedOk && (this.selected === this.views[i].idx)) {
              this.selected = i;
            }

            this.views[i].idx = i;
          }
        }

        this.setConfig();
      },
      /**
       * @method search
       * @param {String} url
       * @return {Number|Boolean}
       */
      search(url){
        if (!bbn.fn.isString(url) ){
          bbn.fn.log("error in search with url", url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        let r = bbn.fn.search(this.views, "url", url);
        if ( r === -1 ){
          bbn.fn.each(this.views, (tab, index) => {
            if ( url.indexOf(tab.url + '/') === 0 ){
              r = index;
              return false;
            }
          });
        }
        return r > -1 ? r : false;
      },
      /**
       * @method callRouter
       * @param {String} url
       * @param st
       * @fires getFullBaseURL
       * @fires realRoute
       */
      callRouter(url, st){
        if (!bbn.fn.isString(url) ){
          bbn.fn.log("error in callRouter with url", url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        if ( this.parent ){
          let containers = this.ancestors('bbn-container');
          url = this.getFullBaseURL().substr(this.router.baseURL.length) + url;
          //bbn.fn.log("CALL ROOT ROUTER WITH URL " + url);
          // The URL of the last bbn-container as index of the root router
          this.router.realRoute(url, containers[containers.length - 1].url, true);
        }
        else{
          this.realRoute(url, st, true);
        }
      },
      /**
       * @method searchContainer
       * @param {String} url
       * @param {Boolean} deep
       * @fires search
       * @fires getContainer
       * @return {Vue|Boolean}
       */
      searchContainer(url, deep){
        let container  = false,
            idx = this.search(url);
        if (idx !== false) {
          container = this.getContainer(idx);
          if (deep && container) {
            let router = container.find('bbn-router');
            if (router) {
              let real = router.searchContainer(url.substr(router.baseURL.length), true);
              if (real) {
                return real;
              }
            }
          }
        }
        return container;
      },
      /**
       * @method load
       * @param {String} url
       * @param {Boolean} force
       * @fires search
       * @fires add
       * @fires parseURL
       * @fires callRouter
       * @fires navigate
       * @fires activate
       * @emit update
      */
      load(url, force, index){
        if (url){
          this.isLoading = true;
          let finalURL = this.fullBaseURL + url;
          let idx = this.search(url);
          let toAdd = false;
          let view;
          //bbn.fn.warning("START LOADING FN FOR IDX " + idx + " ON URL " + finalURL);
          if ( idx !== false ){
            //bbn.fn.log("INDEX RETRIEVED BEFORE LOAD: " + idx.toString(), this.views[idx].slot, this.views[idx].loading);
            if ( this.views[idx].loading || (!force && !this.views[idx].load) ){
              return;
            }
            view = this.views[idx];
            if (force){
              toAdd = true;
              this.views.splice(idx, 1);
            }
            else if (index !== undefined) {
              this.move(idx, index);
            }
          }
          else{
            toAdd = true;
            idx = index === undefined ? this.views.length : index;
          }

          if (toAdd){
            this.add({
              url: url,
              title: view && view.title ? view.title : bbn._('Loading'),
              load: true,
              loading: true,
              visible: true,
              real: false,
              scrollable: !this.single,
              current: url,
              error: false,
              loaded: false
            }, idx);
          }
          if ( this.isBreadcrumb ){
            this.selected = idx;
          }
          this.$emit('update', this.views);
          let dataObj = this.postBaseUrl ? {_bbn_baseURL: this.fullBaseURL} : {};
          return this.post(
            finalURL,
            dataObj,
            (d) => {
              let callRealInit = true;
              this.isLoading = false;
              //this.remove(url);
              if ( d.url ){
                d.url = this.parseURL(d.url);
              }
              if ( !d.url ){
                d.url = url;
              }
              //bbn.fn.warning("URLS", url, d.url);
              if ( url.indexOf(d.url) === 0 ){
                d.current = url;
                //bbn.fn.warning("CURRENT DEFINED AS " + d.current);
              }
              if ( d.data && bbn.fn.numProperties(d.data)){
                d.source = d.data;
                delete d.data;
              }
              if ( (d.url !== d.current) && this.urls[d.current] ){
                //bbn.fn.warning("DELETING VIEW CASE.... " + d.current + ' ' + this.urls[d.current].idx, d.url, bbn.fn.search(this.views, {idx: this.urls[d.current].idx}));
                this.remove(this.urls[d.current].idx, true);
                //this.views.splice(this.urls[d.current].idx, 1);
                callRealInit = false;
                this.$on('registered', (url) => {
                  if (url === d.url) {
                    this.$off('registered', url);
                    this.realInit(url);
                  }
                })
                
              }
              if ( !d.title || (d.title === bbn._('Loading')) ){
                if (view && view.title) {
                  d.title = view.title;
                }
                else{
                  let title = bbn._('Untitled');
                  let num = 0;
                  while ( bbn.fn.search(this.views, {title: title}) > -1 ){
                    num++;
                    title = bbn._('Untitled') + ' ' + num;
                  }
                  d.title = title;
                }
              }
              if (!d.current && d.url) {
                d.current = d.url;
              }
              this.$nextTick(() => {
                let o = bbn.fn.extend(view || {}, d, {loading: false, load: true, real: false, loaded: true});
                this.add(o, idx);
                if (o.title) {
                  this.currentTitle = o.title;
                }
                this.$nextTick(() => {
                  if (callRealInit) {
                    this.realInit(d.url);
                  }
                })
              })
            },
            (xhr, textStatus, errorThrown) => {
              this.isLoading = false;
              this.alert(textStatus);
              let idx = this.search(this.parseURL(finalURL));
              if ( idx !== false ){
                let url = this.views[idx].url;
                if (this.urls[url]) {
                  this.views.splice(this.urls[url].idx, 1);
                  //delete this.urls[url];
                }
              }
              this.activate(url);
            },
            () => {
              this.isLoading = false;
            }
          );
        }
      },
      realInit(url) {    
        if (this.urls[url]) {
          this.urls[url].setLoaded(true);
          // Otherwise the changes we just did on the props wont be taken into account at container level
          this.urls[url].init();
          this.callRouter(this.urls[url].current, url);
          this.$emit('update', this.views);
        }
        else {
          throw new Error(bbn._("Impossible to find the container for URL") + ' ' + url);
        }
      },
      /**
       * @method reload
       * @param {Number} idx
       * @fires route
       */
      reload(idx){
        // So if the ac6tion comes from within the container components can finish whatever they're doing
        this.$nextTick(() => {
          if (
            this.views[idx] &&
            //!this.views[idx].real &&
            this.views[idx].load &&
            this.urls[this.views[idx].url] &&
            this.urls[this.views[idx].url].isLoaded
          ){
            let url = this.views[idx].current;
            this.remove(idx);
            setTimeout(() => {
              this.load(url, true, idx);
            }, 250);
          }
        });
      },
      /**
       * @method getDefaultURL
       * @fires parseURL
       * @return {String}
       */
      getDefaultURL(){
        // If there is a parent router we automatically give the proper baseURL
        if ( this.url ){
          return this.url;
        }
        if ( this.parentContainer && (this.parentContainer.currentURL !== this.parentContainer.url) ){
          return this.parentContainer.currentURL.substr(this.parentContainer.url.length + 1);
        }
        if ( this.def ){
          return this.def;
        }
        return this.parseURL(bbn.env.path);
      },
      /**
       * @method getTitle
       * @param {Number} idx
       * @return {String}
       */
      getTitle(idx){
        let cp = this,
            res = '';
        if ( idx === undefined ){
          idx = this.selected;
        }
        if ( cp.views[idx] ){
          res += (cp.views[idx].title || bbn._('Untitled'));
          if ( cp.parentTab ){
            idx = cp.parentTab.idx;
            cp = cp.parentTab.router;
            while ( cp ){
              res += ' < ' + (cp.views[idx].title || bbn._('Untitled'));
              if ( cp.parentTab ){
                idx = cp.parentTab.idx;
                cp = cp.parentTab.router;
              }
              else{
                cp = false;
              }
            }
          }
          res += ' - ';
        }
        res += bbn.env.siteTitle || bbn._("Untitled site")
        return res;
      },
      /**
       * Sets the 'dirtyContainers' property with the list of unsaved views
       * @method retrieveDirtyContainers
       */
      retrieveDirtyContainers(){
        this.dirtyContainers.splice(0, this.dirtyContainers.length);
        bbn.fn.iterate(this.urls, (v) => {
          if ( v.dirty ){
            this.dirtyContainers.push({
              idx: v.idx,
              url: v.url
            });
          }
        });
      },
      /**
       * @method getMenuFn
       * @param {Number} idx
       * @fires getSubRouter
       * @fires getVue
       * @fires reload
       * @return {Array|Boolean}
       */
      getMenuFn(idx) {
        if ( !this.nav || !this.views[idx]  || (this.views[idx].menu === false) ){
          return [];
        }
        let items = [],
            tmp = ((bbn.fn.isFunction(this.views[idx].menu) ? this.views[idx].menu() : this.views[idx].menu) || []).slice(),
            others = false;
        bbn.fn.each(this.views, (a, i) => {
          if ( (i !== idx) && !a.static ){
            others = true;
            return false;
          }
        });

        if ( !this.views[idx].help ){
          let sub = this.getSubRouter(idx);
          if ( sub && sub.views && sub.views.length ){
            let helps = [];
            sub.views.forEach((a) => {
              if ( a.help ){
                helps.push({
                  url: sub.fullBaseURL + a.url,
                  content: a.help,
                  title: a.title || a.url,
                  anchor: bbn.fn.randomString(15, 20).toLowerCase()
                });
              }
            });
            if ( helps.length === 1 ){
              this.views[idx].help = helps[0].content;
            }
            else if ( helps.length ){
              this.views[idx].help = '';
              let slide1 = '';
              helps.forEach((a) => {
                slide1 += '<h1><a href="#' + a.anchor + '">' + a.title + '</a></h1>\n';
                this.views[idx].help += '---slide---' + '\n<a name="' + a.anchor + '">\n' + a.content;
              });
              this.views[idx].help = slide1 + this.views[idx].help;
            }
          }
        }

        if ( this.views[idx].help ){
          items.push({
            text: bbn._("Help"),
            key: "help",
            icon: "nf nf-mdi-help_circle_outline",
            action: () => {
              let view = this.getVue(idx),
                  span = document.createElement('span');
              span.innerHTML =  this.views[idx].title;
              let title = span.innerText;
              if ( !title && span.querySelector("[title]").length ){
                title = span.querySelector("[title]").getAttribute("title");
              }
              view.getPopup({
                scrollable: false,
                component: {
                  props: ['source'],
                  template: `
                  <bbn-slideshow :source="source.content"
                                 class="bbn-bg-webblue bbn-white"
                                 separator="---slide---"></bbn-slideshow>`
                },
                source: {
                  content: this.views[idx].help
                },
                title: '<i class="bbn-large nf nf-mdi-help_circle_outline"> </i> <span class="bbn-iblock">' + title + '</span>',
                width: '90%',
                height: '90%'
              });
            }
          })
        }

        if ( this.autoload ){
          items.push({
            text: bbn._("Reload"),
            key: "reload",
            icon: "nf nf-mdi-sync",
            action: () => {
              this.reload(idx);
            }
          });
        }

        items.push({
          text: bbn._("Enlarge"),
          key: "enlarge",
          icon: "nf nf-mdi-arrow_expand_all",
          action: () => {
            this.getVue(idx).fullScreen = true;
          }
        });

        if ( tmp && tmp.length ){
          bbn.fn.each(tmp, (a, i) => {
            items.push(a)
          });
        }

        if ( this.views[idx].icon && this.views[idx].title && !this.isBreadcrumb ){
          items.push({
            text: this.views[idx].notext ? bbn._("Show text") : bbn._("Show only icon"),
            key: "notext",
            icon: this.views[idx].notext ? "nf nf-fa-font" : "nf nf-fa-font_awesome",
            action: () => {
              this.$set(this.views[idx], 'notext', !this.views[idx].notext);
            }
          });
        }

        if ( !this.views[idx].static ){
          if ( this.isBreadcrumb ){
            items.push({
              text: bbn._("Close"),
              key: "close",
              icon: "nf nf-mdi-close",
              action: () => {
                this.close(idx);
              }
            });
          }
          else {
            if ( !this.views[idx].pinned ){
              items.push({
                text: bbn._("Pin"),
                key: "pin",
                icon: "nf nf-mdi-pin",
                action: () => {
                  this.pin(idx);
                }
              });
              items.push({
                text: bbn._("Close"),
                key: "close",
                icon: "nf nf-mdi-close",
                action: () => {
                  this.close(idx);
                }
              })
            }
            else{
              items.push({
                text: bbn._("Unpin"),
                key: "pin",
                icon: "nf nf-mdi-pin_off",
                action: () => {
                  this.unpin(idx);
                }
              });
            }
          }
        }

        if ( others ){
          items.push({
            text: bbn._("Close Others"),
            key: "close_others",
            icon: "nf nf-mdi-close_circle_outline",
            action: () => {
              this.closeAllBut(idx);
            }
          });

          let directions = [];
          if (idx) {
            if (idx > 1) {
              directions.push({
                text: bbn._("First"),
                key: "move_first",
                icon: "nf nf-mdi-close_circle_outline",
                action: () => {
                  this.move(idx, 0);
                }
              });
            }
            directions.push({
              text: bbn._("Before"),
              key: "move_before",
              icon: "nf nf-mdi-close_circle_outline",
              action: () => {
                this.move(idx, idx - 1);
              }
            });
          }
          if (idx < (this.views.length - 1)) {
            directions.push({
              text: bbn._("After"),
              key: "move_after",
              icon: "nf nf-mdi-close_circle_outline",
              action: () => {
                this.move(idx, idx + 1);
              }
            });
            if (idx < (this.views.length - 2)) {
              directions.push({
                text: bbn._("Last"),
                key: "move_last",
                icon: "nf nf-mdi-close_circle_outline",
                action: () => {
                  this.move(idx, this.views.length - 1);
                }
              });
            }
          }

          if (directions.length) {
            if (directions.length === 1) {
              directions[0].text = bbn._("Switch position");
              items.push(directions[0]);
            }
            else {
              items.push({
                text: bbn._("Move"),
                key: "move",
                icon: "nf nf-mdi-close_circle_outline",
                items: directions
              });
            }
          }
        }

        if ( others && !this.views[idx].static ){
          items.push({
            text: bbn._("Close All"),
            key: "close_all",
            icon: "nf nf-mdi-close_circle",
            action: () => {
              this.closeAll();
            }
          });
        }

        let menu = bbn.fn.isArray(this.menu) ? this.menu : this.menu(this.views[idx], this);
        if (menu.length) {
          bbn.fn.each(menu, a => {
            items.push(a);
          });
        }
        items.push({
          text: bbn._('Switch to ') + (this.isBreadcrumb ? bbn._('tabs') : bbn._('breadcrumb')) + ' ' + bbn._('mode'),
          key: 'switch',
          icon: this.isBreadcrumb ? 'nf nf-mdi-tab' : 'nf nf-fa-ellipsis_h',
          action: () => {
            this.itsMaster.isBreadcrumb = !this.itsMaster.isBreadcrumb;
          }
        });
        return items;
      },
      /**
       * @method close
       * @param {Number}  idx   The index of the container to close
       * @param {Boolean} force Will close the container without prevention
       * @param {Boolean} noCfg If set to true will not trigger the storage saving
       * @fires remove
       * @fires getIndex
       * @fires activateIndex
       * @fires setConfig
       * @return {Boolean}
       */
      close(idx, force, noCfg) {
        let res = this.remove(idx, force);
        if ( res && (this.selected > idx) ){
          this.selected--;
        }
        else if ( res && (this.selected === idx) ){
          this.selected = false;
          if ( this.views.length ){
            bbn.fn.each(this.history, (a) => {
              let tmp = this.getIndex(a);
              if ( tmp !== false ){
                idx = tmp;
                return false;
              }
            });
            this.activateIndex(this.views[idx] ? idx : idx - 1);
          }
        }

        if (!noCfg) {
          this.setConfig();
        }

        return res;
      },
      /**
       * @method setconfig
       * @fires setStorage
       * @fires getConfig
       */
      setConfig(){
        if ( this.autoload && this.isInit ){
          this.setStorage(this.getConfig(), this.parentContainer ? this.parentContainer.getFullURL() : this.storageName);
          //this.$forceUpdate();
        }
      },
      /**
       * @method getConfig
       * @return {Object}
       */
      getConfig(){
        let cfg = {
              baseURL: this.parentContainer ? this.parentContainer.getFullURL() : this.storageName,
              views: [],
              breadcrumb: this.isBreadcrumb
            };
        bbn.fn.each(this.views, (obj, i) => {
          if (obj.url && obj.load) {
            let res = {
              url: obj.url,
              icon: obj.icon || false,
              notext: obj.notext || false,
              load: true,
              loaded: false,
              title: obj.title ? obj.title : bbn._('Untitled'),
              static: !!obj.static,
              pinned: !!obj.pinned,
              current: obj.current ? obj.current : obj.url,
              cfg: {},
              real: obj.real,
              last: obj.last
            };
            if ( obj.bcolor ){
              res.bcolor = obj.bcolor;
            }
            if ( obj.fcolor ){
              res.fcolor = obj.fcolor;
            }
            cfg.views.push(res);
          }
        });
        return cfg;
      },
      /**
       * @method unsetConfig
       * @fires unsetStorage
       */
      unsetConfig(){
        if ( this.autoload ){
          this.unsetStorage(this.parentContainer ? this.parentContainer.getFullURL() : this.storageName);
        }
      },
      /*
      observerEmit(newVal, obs){
        bbn.fn.log("OBS EMIT", newVal, obs);
        let ele = $(".bbn-observer-" + obs.element, this.$el);
        if ( ele.length ){
          let idx = this.getIndex(ele);
          if ( idx !== false ){
            let i = bbn.fn.search(this.observers, {id: obs.id, element: obs.element});
            if ( (i > -1) && (this.observers[i].value !== newVal) ){
              if ( idx === this.selected ){
                this.$emit('bbnObs' + obs.element + obs.id, newVal);
                this.observers[i].value = newVal;
              }
              else{
                this.observers[i].value = newVal;
                this.$set(this.views[idx].events, 'bbnObs' + obs.element + obs.id, newVal);
              }
            }
          }
        }
      },
      */
     /**
      * @method observerEmit
      * @param newVal
      * @param obs
      * @fires getIndex
      */
      observerEmit(newVal, obs){
        if ( bbn.vue.observerComponent.methods.observerEmit.apply(this, [newVal, obs]) ){
          let ele = this.$el.querySelector(".bbn-observer-" + obs.element);
          if ( ele ){
            let idx = this.getIndex(ele);
            if ( idx !== false ){
              this.$set(this.views[idx].events, 'bbnObs' + obs.element + obs.id, newVal);
              this.$nextTick(() => {
                //this.$forceUpdate();
              });
            }
          }
        }
      },
      /**
       * The called method on the switching to false of the "observer Dirty" property value
       * @method observerClear
       * @param {Object} obs
       * @fires getIndex
       * @fires $delete
       * @fires $nextTick
       * @fires $forceUpdate
       * @fires observationTower.observerClear
       */
      observerClear(obs){
        let ele = this.$el.querySelector(".bbn-observer-" + obs.element);
        if ( ele ){
          let idx = this.getIndex(ele);
          if ((idx !== false) && (this.views[idx].events['bbnObs' + obs.element + obs.id] !== undefined)) {
            this.$delete(this.views[idx].events, 'bbnObs' + obs.element + obs.id);
            this.$nextTick(() => {
              //this.$forceUpdate();
            });
          }
        }
        else if (this.observationTower) {
          this.observationTower.observerClear(obs);
        }
      },
      /**
       * Function triggered every time a container is shown (at the start of the animation) to change the URL if needed.
       * @method enter
       * @param container
       */
      enter(container){
        //bbn.fn.log("THE CONTAINER WILL BE SHOWN: ", container);
      },
      /**
       * @method containerComponentMount
       * @fires init
       * @fires show
       */
      containerComponentMount(){
        let ct = this.getRef('container');
        ct.init();
        this.$nextTick(() => {
          ct.show();
        })
      },

      //Tabs
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
       * @method getFullTitle
       * @param {Object} obj
       * @return {String|null}
       */
      getFullTitle(obj){
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
       * @method getFontColor
       * @param {Number} idx
       * @fires getRef
       * @return {String}
       */
      getFontColor(idx){
        if (bbn.fn.isNumber(idx)) {
          if ( this.views[idx] && this.views[idx].fcolor ){
            return this.views[idx].fcolor;
          }
          let el = this.getRef('title-' + idx);
          if ( el ){
            return window.getComputedStyle(el.$el ? el.$el : el).color;
          }
        }
        return '';
      },
      /**s
       * @method getBackgroundColor
       * @param {Number} idx
       * @fires getRef
       * @return {String}
       */
      getBackgroundColor(idx){
        if (bbn.fn.isNumber(idx)) {
          if ( this.views[idx] && this.views[idx].bcolor ){
            return this.views[idx].bcolor;
          }
          let el = this.getRef('title-' + idx);
          if ( el ){
            return window.getComputedStyle(el.$el ? el.$el : el).backgroundColor;
          }
        }
        return '';
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
       * @method closeAll
       * @fires close
       */
      closeAll(force){
        for ( let i = this.views.length - 1; i >= 0; i-- ){
          if ( !this.views[i].static && !this.views[i].pinned ){
            this.close(i, force, true);
          }
        }

        this.setConfig();
      },
      /**
       * @method closeallBut
       * @param {Number} idx
       * @fires close
       */
      closeAllBut(idx, force){
        for ( let i = this.views.length - 1; i >= 0; i-- ){
          if ( !this.views[i].static && !this.views[i].pinned && (i !== idx) ){
            this.close(i, force, true);
          }
        }
        this.setConfig();
      },
      /**
       * @method pin
       * @param {Number} idx
       * @fires isValidIndex
       * @fires setConfig
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
            this.views[idx].pinned = true;
            this.setConfig();
            this.$emit('pin', idx);
          }
        }
      },
      /**
       * @method unpin
       * @param {Number} idx
       * @fires isValidIndex
       * @fires setConfig
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
            this.views[idx].pinned = false;
            this.setConfig();
            this.$emit('unpin', idx);
          }
        }
      },

      //Breadcrumb
      /**
       * @method registerBreadcrumb
       * @param {Vue} bc
       * @param {String} url
       */
      registerBreadcrumb(bc){
        let url = bc.baseURL.substr(0, bc.baseURL.length - 1);
        this.breadcrumbsList.push(bc);
        if (this.itsMaster && !this.master) {
          this.itsMaster.breadcrumbsList.push(bc);
        }
      },
      /**
       * @method unregisterBreadcrumb
       * @param {Vue} bc
       * @param {String} url
       */
      unregisterBreadcrumb(bc){
        let url = bc.baseURL.substr(0, bc.baseURL.length - 1);
        let idx = bbn.fn.search(this.breadcrumbsList, {baseURL: bc.baseURL});
        if (idx !== -1) {
          this.breadcrumbsList.splice(idx, 1);
        }
        if (this.itsMaster && !this.master) {
          idx = bbn.fn.search(this.itsMaster.breadcrumbsList, {baseURL: bc.baseURL});
          if (idx !== -1) {
            this.itsMaster.breadcrumbsList.splice(idx, 1);
          }
        }
      },
      getBreadcrumbs(idx){
        let ret = [];
        if (bbn.fn.isNumber(idx) && this.views[idx]) {
          let url = this.views[idx].url,
              bc = bbn.fn.getRow(this.breadcrumbsList, {baseURL: url+'/'});
          if (this.urls[url] && bc) {
            ret.push(...bc.breadcrumbs);
          }
        }
        return ret;
      },
      /**
       * Returns the breadcrumb's source list.
       * @method getList
       * @param {Vue} bc
       * @fires close
       * @return {Array}
       */
      getList(idx){
        let list = [],
            parents = bbn.fn.map(idx && this.itsMaster && (this.baseURL !== this.itsMaster.baseURL) ?
              this.getParents() : [],
              p => {
                return {
                  view: p.views[p.selected],
                  maxTitleLength: p.maxTitleLength
                }
              });
        if (parents.length > idx) {
          parents.splice(0, parents.length - idx);
        }
        bbn.fn.each(this.views, (t, i) => {
          if ( !t.hidden && (t.idx !== this.selected) ){
            list.push({
              view: t,
              key: t.url,
              parents: parents,
              children: bbn.fn.map(this.getBreadcrumbs(i), c => {
                return {
                  view: c.views[c.selected],
                  maxTitleLength: c.maxTitleLength
                }
              }),
              maxTitleLength: this.maxTitleLength,
              action: () => {
                this.activateIndex(t.idx);
              },
              closeAction: () => {
                return this.close(t.idx)
              }
            })
          }
        });
        return list;
      },
      /**
       * @method getParents
       * @return {Array}
       */
      getParents(){
        return this.parent ? [...this.parent.getParents(), this.parent] : []
      },
      /**
       * @method openMenu
       * @param {Event} ev
       */
      openMenu(ev){
        let ele = ev.target.parentElement.parentElement,
            e = new MouseEvent("contextmenu", {
              bubbles: true,
              cancelable: true,
              view: window
            });
        ele.dispatchEvent(e);
      }
      
    },

    /**
     * @event created
     */
    created(){
      this.componentClass.push('bbn-resize-emitter');
        /**
       * @event route
       * @fires setconfig
       */
      this.$on('route', url => {
        if ( this.nav ){
          this.setConfig();
          let i = this.history.indexOf(url);
          if ( i > -1 ){
            this.history.splice(i, 1);
          }
          this.history.unshift(url);
          while ( this.history.length > this.historyMaxLength ){
            this.history.pop();
          }
        }
      });
    },
    /**
     * @event mounted
     * @fires getStorage
     * @fires getDefaultURL
     * @fires add
     */
    mounted(){
      // All routers above (which constitute the fullBaseURL)
      this.parents = this.ancestors('bbn-router');
      // The closest
      this.parent = this.parents.length ? this.parents[0] : false;
      // The root
      this.router = this.parents.length ? this.parents[this.parents.length-1] : this;
      if ( this.parent ){
        this.parentContainer = this.closest('bbn-container');
        let uri = this.parentContainer.url;
        if (this.root && (uri !== this.root) && (uri.indexOf(this.root) === 0) ){
          uri = this.root;
        }
        this.baseURL = this.setBaseURL(uri);
      }
      else{
        window.addEventListener("beforeunload", e =>{
          e = e || window.event;
          //if ( $(".bbn-tabnav-unsaved").length ){
          if ( this.isDirty ){
            // doesn't use that string but a default string...
            let st = bbn._('You have unsaved data, are you sure you want to leave?');
            // For IE and Firefox prior to version 4
            if (e) {
              e.returnValue = st;
            }
            // For Safari
            return st;
          }
        });
      }

      let tmp = [];

      // ---- ADDED 16/12/20 (Mirko) ----
      // Adding bbns-container from the slot
      if ( this.$slots.default ){
        for ( let node of this.$slots.default ){
          if (
            node.componentOptions
            && (node.componentOptions.tag === 'bbn-container')
          ){
            if (node.componentOptions.propsData.url === undefined) {
              throw new Error(bbn._("You cannot use containers in router without defining a URL property"));
            }
            if ( !this.hasRealContainers ){
              this.hasRealContainers = true;
            }
            if (node.componentOptions.propsData.url === '') {
              this.hasEmptyURL = true;
            }
            let obj = bbn.fn.extend(true, {}, node.componentOptions.propsData),
                props = node.componentOptions.Ctor.options.props;
            bbn.fn.iterate(props, (v, i) => {
              if (!(i in obj) && ('default' in v)) {
                obj[i] = v.default;
              }
            });
            bbn.fn.iterate(this.getDefaultView(), (a, n) => {
              if ( obj[n] === undefined ){
                obj[n] = a;
              }
            });
            obj.real = true;
            //let o = {real: true, load: false, loaded: true};
            //tmp.push(bbn.fn.extend({}, node.componentOptions.propsData, o));
            tmp.push(obj);
          }
        }
      }
      // ---- END ----

      bbn.fn.each(this.source, (a) => {
        if (a.url === '') {
          if (a.load) {
            throw new Error(bbn._("You cannot use containers with empty URL for loading"));
          }
          this.hasEmptyURL = true;
        }
        tmp.push(bbn.fn.extendOut(a, {real: false}));
      });

      //Get config from the storage
      let storage = this.getStorage(this.parentContainer ? this.parentContainer.getFullURL() : this.storageName);
      if ( storage ){
        if ( storage.breadcrumb !== undefined ){
          this.isBreadcrumb = storage.breadcrumb;
        }
        if ( storage.views ){
          bbn.fn.each(storage.views, (a) => {
            let idx = bbn.fn.search(tmp, {url: a.url});
            if ( idx > -1 ){
              bbn.fn.extend(tmp[idx], a);
            }
            else{
              tmp.push(a);
            }
          });
        }
      }

      let url = this.getDefaultURL();
      bbn.fn.each(tmp, (a) => {
        if (!bbn.fn.isString(a.url)) {
          throw new Error(bbn._("The container must have a valid URL"));
        }
        if (url && url.indexOf(a.url) === 0) {
          a.current = url;
        }
        this.add(a);
      });
      
      //Breadcrumb
      if (!this.master && this.parent) {
        this.parent.registerBreadcrumb(this);
        let ct = this.closest('bbn-container');
        ct.$on('view', () => {
          this.parent.registerBreadcrumb(this);
        });
        ct.$on('unview', () => {
          this.parent.unregisterBreadcrumb(this);
        });
        if (ct.visible) {
          this.parent.registerBreadcrumb(this);
        }
      }
      this.ready = true;
      setTimeout(() => {
        // bugfix for rendering some nf-mdi icons
        this.iconsReady = true;
      }, 1000);
    },
    /**
     * @event beforeDestroy
     */
    beforeDestroy(){
      if (!this.master && this.parent){
        this.parent.unregisterBreadcrumb(this);
      }
    },
    watch: {
      currentTitle(v){
        if (!this.parent) {
          document.title = v + ' - ' + bbn.env.siteTitle;
        }
      },
      /**
       * @watch currentURL
       * @fires changeURL
       * @fires search
       * @emit change
       * @emit route
       */
      currentURL(newVal, oldVal){
        if ( this.ready ){
          if (!this.disabled) {
            this.$nextTick(() => {
              if ( this.activeContainer ){
                this.changeURL(newVal, this.activeContainer.title);
              }
              else if ( this.isLoading ){
                this.changeURL(newVal, bbn._("Loading"));
              }
              let idx = this.search(newVal);
              if ((idx !== false) && (this.selected !== idx)){
                this.selected = idx;
                this.views[this.selected].last = bbn.fn.timestamp();
              }
              this.$emit('change', newVal);
            });
          }

          this.$emit('route', newVal);
        }
      },
      /**
       * @watch url
       * @fires route
       */
      url(newVal){
        if ( this.ready ){
          this.route(newVal);
        }
      },
      /**
       * @watch dirty
       */
      isDirty(v){
        if ( this.parentContainer ) {
          this.parentContainer.dirty = v;
        }
      },
      /**
       * @watch itsMaster
       * @fires breadcrumbWatcher
       */
      itsMaster(newVal, oldVal){
        if ( this.nav && (newVal !== oldVal) ){
          this.isBreadcrumb = newVal ? newVal.isBreadcrumb : this.breadcrumb;
          if ( this.breadcrumbWatcher ){
            this.breadcrumbWatcher();
          }
          if ( newVal ){
            /**
             * @watch itsMaster.isBreadcrumb
             */
            this.breadcrumbWatcher = this.$watch('itsMaster.isBreadcrumb', isB => {
              this.isBreadcrumb = isB;
            });
          }
        }
      },
      /**
       * @watch isBreadcrumb
       * @fires setConfig
       */
      isBreadcrumb(newVal){
        this.$nextTick(() => {
          this.setConfig();
        })
      }
    },
    components: {
      /**
       * @component listItem
       */
      listItem: {
        template: `
<div class="bbn-w-100 bbn-vmiddle bbn-bordered-bottom"
     style="height: 2.5em"
     @mouseenter="isHover = true"
     @mouseleave="isHover = false">
  <div class="bbn-flex-width bbn-vmiddle bbn-h-100">
    <div class="bbn-vmiddle bbn-h-100">
      <div v-for="(p, i) in source.parents"
           class="bbn-vmiddle bbn-h-100">
        <div class="bbn-vmiddle bbn-h-100"
            :style="{
              backgroundColor: !isHover && p.view.bcolor ? p.view.bcolor : null,
              color: !isHover && p.view.fcolor ? p.view.fcolor : null
            }">
          <div class="bbn-router-breadcrumb-badge-container bbn-middle"
              v-if="numProperties(p.view.events)">
            <span class="bbn-badge bbn-small bbn-bg-red"
                  v-text="numProperties(p.view.events)"/>
          </div>
          <div class="bbn-router-breadcrumb-loader bbn-border-text"
              :style="{borderColor: p.view.fcolor || null}"
              v-show="p.view.loading"/>
          <div :class="['bbn-router-breadcrumb-element', 'bbn-h-100', 'bbn-vmiddle', {'bbn-router-breadcrumb-dirty': p.view.dirty}]">
            <span v-if="p.view.icon"
                  :title="p.view.title"
                  :class="'bbn-router-breadcrumb-element-icon bbn-h-100 bbn-vmiddle bbn-right-xsspace' + (p.view.notext ? ' bbn-lg' : ' bbn-m')">
              <i :class="p.view.icon"
                style="zoom: 1.1"/>
            </span>
            <span v-if="!p.view.notext"
                  class="bbn-router-breadcrumb-element-text"
                  :title="p.view.title && (p.view.title.length > p.maxTitleLength) ? p.view.title : ''"
                  v-html="p.view.title ? shortTitle(p) : '` + bbn._('Untitled') + `'"/>
          </div>
        </div>
        <div>
          <i class="nf nf-fa-angle_right bbn-hsmargin bbn-large bbn-router-breadcrumb-arrow"/>
        </div>
      </div>

      <div class="bbn-vmiddle bbn-h-100"
          :style="{
            backgroundColor: !isHover && source.view.bcolor ? source.view.bcolor : null,
            color: !isHover && source.view.fcolor ? source.view.fcolor : null
          }">
        <div class="bbn-router-breadcrumb-badge-container bbn-middle"
             v-if="numProperties(source.view.events)">
          <span class="bbn-badge bbn-small bbn-bg-red"
                v-text="numProperties(source.view.events)"/>
        </div>
        <div class="bbn-router-breadcrumb-loader bbn-border-text"
             :style="{borderColor: source.view.fcolor || null}"
             v-show="source.view.loading"/>
        <div :class="['bbn-router-breadcrumb-element', 'bbn-h-100', 'bbn-vmiddle', {'bbn-router-breadcrumb-dirty': source.view.dirty}]">
          <span v-if="source.view.icon"
                :title="source.view.title"
                :class="'bbn-router-breadcrumb-element-icon bbn-h-100 bbn-vmiddle bbn-right-xsspace' + (source.view.notext ? ' bbn-lg' : ' bbn-m')">
            <i :class="source.view.icon"
               style="zoom: 1.1"/>
          </span>
          <span v-if="!source.view.notext"
                class="bbn-router-breadcrumb-element-text"
                :title="source.view.title && (source.view.title.length > source.maxTitleLength) ? source.view.title : ''"
                v-html="source.view.title ? (source.parents.length? shortTitle(source): source.view.title) : '` + bbn._('Untitled') + `'"/>
        </div>
      </div>

      <div v-for="(p, i) in source.children"
           class="bbn-vmiddle bbn-h-100">
        <div>
          <i class="nf nf-fa-angle_right bbn-hsmargin bbn-large bbn-router-breadcrumb-arrow"/>
        </div>
        <div class="bbn-vmiddle bbn-h-100"
             :style="{
               backgroundColor: !isHover && p.view.bcolor ? p.view.bcolor : null,
               color: !isHover && p.view.fcolor ? p.view.fcolor : null
             }">
          <div class="bbn-router-breadcrumb-badge-container bbn-middle"
              v-if="numProperties(p.view.events)">
            <span class="bbn-badge bbn-small bbn-bg-red"
                  v-text="numProperties(p.view.events)"/>
          </div>
          <div class="bbn-router-breadcrumb-loader bbn-border-text"
              :style="{borderColor: p.view.fcolor || null}"
              v-show="p.view.loading"/>
          <div :class="['bbn-router-breadcrumb-element', 'bbn-h-100', 'bbn-vmiddle', {'bbn-router-breadcrumb-dirty': p.view.dirty}]">
            <span v-if="p.view.icon"
                  :title="p.view.title"
                  :class="'bbn-router-breadcrumb-element-icon bbn-h-100 bbn-vmiddle bbn-right-xsspace' + (p.view.notext ? ' bbn-lg' : ' bbn-m')">
              <i :class="p.view.icon"
                style="zoom: 1.1"/>
            </span>
            <span v-if="!p.view.notext"
                  class="bbn-router-breadcrumb-element-text"
                  :title="p.view.title && (p.view.title.length > p.maxTitleLength) ? p.view.title : ''"
                  v-html="p.view.title ? shortTitle(p) : '` + bbn._('Untitled') + `'"/>
             </div>
        </div>
      </div>
    </div>
    <div class="bbn-flex-fill bbn-h-100"
         :style="!isHover ? lastColors : {}">
      &nbsp;
    </div>
    <div v-if="!source.view.static"
          class="bbn-vmiddle bbn-h-100 bbn-hpadded"
          @click.prevent.stop="close"
          :style="!isHover ? lastColors : {}">
      <i class="nf nf-fa-times_rectangle bbn-lg"/>
    </div>
  </div>
</div>
        `,
        props: {
          /**
           * @prop {Object} source
           * @memberof listItem
           */
          source :{
            type: Object,
            required: true
          }
        },
        data(){
          return {
            isHover: false
          }
        },
        computed: {
          lastColors(){
            let e = this.source.children.length ?
              this.source.children[this.source.children.length-1].view
              : this.source.view;
            let r = {};
            if (e.bcolor) {
              r.backgroundColor = e.bcolor;
            }
            if (e.fcolor) {
              r.color = e.fcolor;
            }
            return r;
          }
        },
        methods: {
          numProperties: bbn.fn.numProperties,
          /**
           * @method close
           * @memberof listItem
           */
          close(){
            let k = this.source.key;
            if (this.source.closeAction()){
              let list = this.closest('bbn-list');
              if (bbn.fn.isVue(list)) {
                let idx = bbn.fn.search(list.source, {'data.key': k});
                if (idx > -1) {
                  list.source.splice(idx, 1);
                  if (list.source.length) {
                    list.updateData();
                    this.$nextTick(() => {
                      list.closest('bbn-floater').onResize(true);
                    })
                  }
                  else {
                    this.closest('bbn-floater').close();
                  }
                }
              }
            }
          },
          shortTitle(src){
            return src.view.title.length > src.maxTitleLength ?
              bbn.fn.shorten(src.view.title, src.maxTitleLength) :
              src.view.title;
          }
        }
      }
    }
  });

})(bbn, Vue);
</script>
<style scoped>
div.bbn-router {
  border: 0 !important;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  margin: 0;
}
div.bbn-router .bbn-router-nav {
  margin-top: 0;
}
div.bbn-router .bbn-router-nav .bbn-router-nav:not(.bbn-router-nav-bc) {
  padding-top: 0.5em;
  height: 100%;
}
div.bbn-router .bbn-router-nav.bbn-router-nav-bc .bbn-router-breadcrumb-master {
  height: 2.5em;
}
div.bbn-router .bbn-router-nav .bbn-router-loading {
  content: " ";
  display: block;
  width: 8px;
  height: 8px;
  margin: 1px;
  border-radius: 50%;
  border-style: solid;
  border-width: 3px;
  border-right-color: transparent !important;
  border-left-color: transparent !important;
  animation: bbn-router-loader 1.2s linear infinite;
}
div.bbn-router .bbn-router-nav .bbn-pane .bbn-router-nav:not(.bbn-router-nav-bc) {
  margin-top: 0;
}
div.bbn-router .bbn-router-nav .bbn-pane .bbn-router-nav:not(.bbn-router-nav-bc) .bbn-router-nav:not(.bbn-router-nav-bc) {
  margin-top: 0.5em;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs {
  border: 0 !important;
  overflow: hidden;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  zoom: 1;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs div.bbn-router-tabs-ul-container {
  width: 100%;
  height: auto;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs.bbn-router-tabs-scrollable > div.bbn-router-tabs-container div.bbn-router-tabs-ul-container {
  padding: 0 !important;
  height: 2.4em;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs.bbn-router-tabs-scrollable > div.bbn-router-tabs-container div.bbn-router-tabs-ul-container ul.bbn-router-tabs-tabs:first-child {
  white-space: nowrap;
  overflow: hidden;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container {
  width: 100%;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child {
  height: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  border-top-width: 0px;
  border-left-width: 0px;
  border-right-width: 0px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li {
  height: 2.4em;
  list-style-type: none;
  text-decoration: none;
  margin: 0 !important;
  vertical-align: middle;
  position: relative;
  border-bottom: 0;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li i:focus,
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li span:focus {
  animation: bbn-anim-blinker 1s linear infinite;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li .bbn-router-tabs-badge-container {
  position: absolute;
  top: 0;
  left: 1px;
  bottom: 0px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li .bbn-router-tabs-tab-loader {
  display: inline-block;
  width: 12px;
  height: 12px;
  position: absolute;
  top: 0.4em;
  left: 2px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li .bbn-router-tabs-tab-loader:after {
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
  animation: bbn-router-tabs-tab-loader 1.2s linear infinite;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-tab {
  cursor: pointer;
  color: inherit;
  padding: 0.3em 1.15em 0.5em 1.15em;
  vertical-align: middle;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-tab > .bbn-router-tab-text {
  font-size: 1.1em;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-tab > .bbn-router-tabs-main-icon {
  line-height: 100%;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-tab::after,
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-tab::before {
  font-family: monospace;
  content: " ";
  white-space: pre;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-tab.bbn-router-tabs-dirty::after {
  content: "*";
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-icon {
  position: absolute;
  right: 0px;
  top: 0px;
  bottom: 0px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-icon > i {
  display: block;
  position: absolute;
  right: 0px;
  padding: 2px;
  padding-right: 2px;
  font-size: 1em;
  cursor: pointer;
  margin: 0;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-icon > i.bbn-router-tab-close {
  top: 0px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-icon > i.bbn-router-tab-menu {
  bottom: -2px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-selected {
  display: none;
  position: absolute;
  bottom: 1px;
  left: 1.15em;
  right: 1.15em;
  height: 3px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li.bbn-router-tabs-static div.bbn-router-tabs-icons i.bbn-router-tab-close {
  display: none;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li.bbn-router-tabs-active div.bbn-router-tabs-icons i.bbn-router-tab-menu {
  display: block;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li.bbn-router-tabs-active div.bbn-router-tabs-selected {
  display: block;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader {
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  background-color: black;
  color: white;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation {
  margin-top: 2em;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation h1 {
  font-size: 3.5em !important;
  text-align: center;
  margin-top: 1em;
  color: white;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid {
  width: 120px;
  height: 120px;
  margin: auto;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube {
  width: 33%;
  height: 33%;
  float: left;
  background-color: white;
  -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
  animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube1 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube2 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube3 {
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube4 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube5 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube6 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube7 {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube8 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube9 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container div.bbn-router-tabs-button {
  width: 2.5em;
  height: 2.4em;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > span.bbn-button {
  top: 0.4em;
  position: absolute;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs .bbn-router-tabs {
  margin-top: 0.5em;
  height: calc(99.5%);
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs .bbn-router-tabs .bbn-router-tabs {
  margin-top: 0 !important;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs .bbn-pane .bbn-router-tabs {
  margin-top: 0;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs .bbn-pane .bbn-router-tabs .bbn-router-tabs {
  margin-top: 0.5em;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb {
  border: 0 !important;
  overflow: hidden;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  zoom: 1;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container {
  height: 100%;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container .bbn-router-breadcrumb-badge-container {
  position: absolute;
  top: 0;
  left: 1px;
  bottom: 0px;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container .bbn-router-breadcrumb-loader {
  display: inline-block;
  width: 12px;
  height: 12px;
  position: absolute;
  top: 0.4em;
  left: 2px;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container .bbn-router-breadcrumb-loader:after {
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
  animation: bbn-router-loader 1.2s linear infinite;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container div.bbn-router-breadcrumb-element {
  color: inherit;
  padding: 0 0.8em;
  vertical-align: middle;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container div.bbn-router-breadcrumb-element > .bbn-router-breadcrumb-element-icon {
  line-height: 100%;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container div.bbn-router-breadcrumb-element::after,
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container div.bbn-router-breadcrumb-element::before {
  font-family: monospace;
  content: " ";
  white-space: pre;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container div.bbn-router-breadcrumb-element.bbn-router-breadcrumb-dirty::after {
  content: "*";
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container i.bbn-router-breadcrumb-icon {
  display: block;
  position: absolute;
  right: 2px;
  font-size: 1em;
  cursor: pointer;
  margin: 0;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container i.bbn-router-breadcrumb-icon.bbn-router-breadcrumb-close {
  top: 1px;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container i.bbn-router-breadcrumb-icon.bbn-router-breadcrumb-menu {
  bottom: -2px;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container .bbn-router-breadcrumb-arrow {
  margin-right: .7em;
  margin-left: .7em;
  vertical-align: middle;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader {
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  background-color: black;
  color: white;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation {
  margin-top: 2em;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation h1 {
  font-size: 3.5em !important;
  text-align: center;
  margin-top: 1em;
  color: white;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid {
  width: 120px;
  height: 120px;
  margin: auto;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube {
  width: 33%;
  height: 33%;
  float: left;
  background-color: white;
  -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
  animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube1 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube2 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube3 {
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube4 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube5 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube6 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube7 {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube8 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube9 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
@keyframes bbn-router-loader {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes sk-cubeGridScaleDelay {
  0%,
  70%,
  100% {
    -webkit-transform: scale3D(1,1,1);
    transform: scale3D(1,1,1);
  }
  35% {
    -webkit-transform: scale3D(0,0,1);
    transform: scale3D(0,0,1);
  }
}
@keyframes bbn-router-tabs-tab-loader {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes sk-cubeGridScaleDelay {
  0%,
  70%,
  100% {
    -webkit-transform: scale3D(1,1,1);
    transform: scale3D(1,1,1);
  }
  35% {
    -webkit-transform: scale3D(0,0,1);
    transform: scale3D(0,0,1);
  }
}

</style>
