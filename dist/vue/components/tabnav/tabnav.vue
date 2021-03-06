<template>
<div :class="[{
       'bbn-tabnav-scrollable': scrollable
     }, componentClass]"
>
  <div class="bbn-tabnav-container bbn-flex-height">
    <div class="bbn-tabnav-ul-container">
      <div class="bbn-100">
        <component :is="scrollable ? 'bbn-scroll' : 'div'"
                   ref="horizontal-scroll"
                   v-bind="scrollCfg">
          <ul ref="tabgroup"
              v-if="tabs"
              :class="{
              'bbn-alt': true,
              'bbn-tabnav-tabs': true,
              'bbn-bordered-bottom': true
            }"
          >
            <li v-for="(tab, tabIndex) in tabs"
                :ref="'tab-' + tabIndex"
                v-show="!tab.hidden"
                :style="{
                backgroundColor: tab.bcolor || null,
                color: tab.fcolor || null
              }"
                :data-index="tabIndex"
                :class="[{
                'bbn-iblock': true,
                'bbn-bordered': true,
                'bbn-radius-top': true,
                'bbn-state-default': true,
                'bbn-unselectable': true,
                'bbn-tabnav-static': !!tab.static,
                'bbn-background-effect-internal': tabIndex === selected,
                'bbn-tabnav-active': tabIndex === selected,
                'bbn-disabled': tab.disabled,
                'bbn-tabnav-alarm': tab.alarm
              }, tab.cls || '']"
                @click="!tab.disabled && (tabIndex !== selected) ? (selected = tabIndex) : (() => {})()"
            >
              <div class="bbn-tabnav-badge-container bbn-middle"
                    v-if="(tabIndex !== selected) && numProperties(tab.events)">
                <span class="bbn-badge bbn-small bbn-bg-red" v-text="numProperties(tab.events)"></span>
              </div>
              <div class="bbn-tabnav-tab-loader bbn-border-text" 
                    :style="{borderColor: tab.fcolor || null}"
                    v-show="tab.loading">
              </div>
              <bbn-context v-bind="{
                            context: true,
                            source: getMenuFn,
                            sourceIndex: tabIndex,
                            tag: 'div'
                          }"
                          min-width="10em"
                          :class="['bbn-tabnav-tab', 'bbn-iblock', {'bbn-tabnav-dirty': tab.dirty}]"
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
                      :class="'bbn-tabnav-main-icon bbn-iblock' + (tab.notext ? ' bbn-lg' : ' bbn-m')">
                  <i :class="tab.icon"
                      :style="{zoom: iconsReady ? 1.1 : 1}"
                      ></i>
                </span>
                <span v-if="!tab.notext && tab.title"
                      class="bbn-tab-text"
                      :title="getFullTitle(tab)"
                      v-html="tab.title.length > maxTitleLength ? cutTitle(tab.title) : tab.title">
                </span>
              </bbn-context>
              <div class="bbn-tabnav-selected"
                    :ref="'selector-' + tabIndex"
                    v-show="tabIndex === selected"
                    :style="{
                    backgroundColor: getTabColor(tabIndex)
                  }"
              ></div>
              <i v-if="!tab.static && !tab.pinned"
                  class="nf nf-fa-times bbn-p bbn-tab-close bbn-tabnav-icon"
                  tabindex="-1"
                  :ref="'closer-' + tabIndex"
                  @keydown.left.down.prevent.stop="getRef('menu-' + tabIndex) ? getRef('menu-' + tabIndex).$el.focus() : null"
                  @keydown.space.enter.prevent.stop="close(tabIndex)"
                  @click.stop.prevent="close(tabIndex)"></i>
              <bbn-context v-if="(tab.menu !== false) && (tabIndex === selected)"
                            class="nf nf-fa-caret_down bbn-tab-menu bbn-tabnav-icon bbn-p"
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
    </div>
    <bbn-router ref="router"
                v-if="initSource !== null"
                @ready="init"
                @route="onRoute"
                @change="routing"
                @update="update"
                :def="url"
                :autoload="autoload"
                :source="initSource"
                :root="root"
                :auto="true"
                class="bbn-flex-fill">
      <slot></slot>
    </bbn-router>
    <div v-if="scrollable"
          class="bbn-tabnav-button bbn-tabnav-button-prev bbn-p">
      <div class="bbn-100 bbn-middle"
          @click="scrollTabs('left')">
        <div class="bbn-block">
          <i class="nf nf-fa-angle_left bbn-xlarge"></i>
        </div>
      </div>
    </div>
    <div v-if="scrollable"
          class="bbn-tabnav-button bbn-tabnav-button-next bbn-p">
      <div class="bbn-100 bbn-middle"
          @click="scrollTabs('right')">
        <div class="bbn-block">
          <i class="nf nf-fa-angle_right bbn-xlarge"></i>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
  module.exports =  /**
  * @file bbn-tabnav component
  *
  * @description bbn-tabnav is a component that manages various card containers (bbn-container) that may or not be static, in an organized way, based on the URL. This component allows several different nested bbn-tabnav based on a "base url".
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 15/02/2017
  */
(function(Vue){
  "use strict";

  /**
   * @component
   * @param {string} baseURL - The parent TabNav's URL (if any) on top of which the tabNav has been built.
   * @param {array} parents - The tabs shown at init.
   * @param {array} tabs - The tabs configuration and state.
   * @param {boolean} parentTab - If the tabNav has a tabNav parent, the tab Vue object in which it stands, false
   * otherwise.
   * @param {boolean|number} selected - The index of the currently selected tab, and false otherwise.
   */
  Vue.component("bbn-tabnav", {
    name: 'bbn-tabnav',
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.localStorageComponent, bbn.vue.closeComponent, bbn.vue.observerComponent],
    props: {
      /**
       * The URL on which the tabNav will be initialized.
       * @prop {String} [''] url
       */
      url: {
        type: String,
        default: ''
      },
      /**
       * Defines if the tab will be automatically loaded based on URLs. False by default except if it is true for the parent.
       * @prop {Boolean} [false] autoload
       */
      autoload: {
        type: Boolean,
        default: false
      },
      /**
       *
       * @prop {Number} maxTitleLength
       */
      maxTitleLength: {
        type: Number,
        default: 20
      },
      /**
       * The position of the tabs' titles: top (default) or bottom.
       * @prop {String} ['top'] orientation
       */
      orientation: {
        type: String,
        default: 'top'
      },
      /**
       * The root URL of the tabNav, will be only taken into account for the top parents' tabNav, will be automatically calculated for the children.
       * @prop {String} [''] root
       */
      root: {
        type: String,
        default: ''
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
       *
       * @prop {String} ['__ROOT__'] storageName
       */
      storageName: {
        type: String,
        default: '__ROOT__'
      },
      /**
       *
       * @prop {Boolean|String|Function} ['Are you sure you want to discard the changes you made in this tab?'] confirmLeave
       */
      confirmLeave: {
        type: [Boolean, String, Function],
        default: bbn._("Are you sure you want to discard the changes you made in this tab?")
      },
      /**
       *
       * @prop {String} hideAdvertUrl
       */
      hideAdvertUrl: {
        type: String
      },
      /**
       *
       * @prop {Number} [10] historyMaxLength
       */
      historyMaxLength: {
        type: Number,
        default: 10
      },
      /**
       * The tabs shown at init.
       * @prop {Array} [[]] source
       */
      source: {
        type: Array,
        default: function(){
          return [];
        }
      },
      /**
       *
       * @prop {Array|Function} [[]] menu
       */
      menu: {
        type: [Array, Function],
        default: function(){
          return [];
        }
      }

    },

    data(){
      return {
        _bbnTabNav: {
          started: false,
          titles: '',
          num: 0
        },
        slotSource: [],
        history: [],
        parents: [],
        initSource: null,
        parentTab: false,
        selected: false,
        visible: true,
        router: null,
        iconsReady: false
      };
    },

    computed: {
      scrollCfg(){
        return this.scrollable ? {
          axis: 'x',
          container: true,
          hidden: true
        } : {};
      },
      tabs(){
        return this.router ? this.router.views : [];
      },
      // The Vue container object for the active tab
      activeTab(){
        if ( (this.selected !== false) && this.router ){
          return this.router.getVue(this.selected)
        }
        return false;
      },
      // The final Vue container object for the active tab (if it has subtabs/sub-router)
      activeRealTab(){
        if ( (this.selected !== false) && this.router ){
          return this.router.getRealVue(this.selected)
        }
        return false;
      },
      // The last tabNav
      activeTabNav(){
        let tab = this.activeTab;
        if ( tab ){
          let sub = this.getSubTabNav(this.selected);
          if ( sub ){
            return sub.activeTabNav;
          }
        }
        return this;
      },
      fullBaseURL(){
        return this.router ? this.router.fullBaseURL : '';
      },
      /**
       * The URL to which the tabnav currently corresponds (its selected tab).
       * @computed currentURL
       * @return String
       */
      currentURL(){
        return this.router ? this.router.currentURL : '';
      },
      isDirty(){
        return this.router ? !!this.router.dirtyContainers.length : false;
      }
    },

    methods: {
      observerEmit(newVal, obs){
        if ( bbn.vue.observerComponent.methods.observerEmit.apply(this, [newVal, obs]) ){
          let ele = this.$el.querySelector(".bbn-observer-" + obs.element);
          if ( ele ){
            let idx = this.router.getIndex(ele);
            if ( idx !== false ){
              this.$set(this.tabs[idx].events, 'bbnObs' + obs.element + obs.id, newVal);
              this.$nextTick(() => {
                this.$forceUpdate();
              });
            }
          }
        }
      },
      getConfig(){
        let parent = this.closest('bbn-container');
        let fullURL = parent ? parent.getFullURL() : this.storageName;
        let cfg = {
          baseURL: fullURL,
          views: []
        };
        bbn.fn.each(this.tabs, (obj, i) => {
          if ( obj.url && obj.load ){
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
              cfg: {}
            };
            if ( obj.bcolor ){
              res.bcolor = obj.bcolor;
            }
            if ( obj.fcolor ){
              res.fcolor = obj.fcolor;
            }
            /*
            let subtabnav = tabnav.getSubTabNav(i);
            if ( subtabnav && subtabnav.autoload ){
              res.cfg = this.getConfig(subtabnav);
            }
            */
            cfg.views.push(res);
          }
        });
        return cfg;
      },

      setConfig(){
        if ( this.autoload && this.router && this.router.isInit ){
          let cfg = this.getConfig();
          let parent = this.closest('bbn-container');
          let fullURL = parent ? parent.getFullURL() : this.storageName;
          this.setStorage(cfg, fullURL);
          this.$forceUpdate();
        }
      },


      unsetConfig(){
        if ( this.autoload ){
          let parent = this.closest('bbn-container');
          let fullURL = parent ? parent.getFullURL() : this.storageName;
          this.unsetStorage(fullURL);
        }
      },

      update(){
        if ( this.initSource !== null ){
          this.$forceUpdate();
        }
      },

      onRoute(url){
        this.setConfig();
        let i = this.history.indexOf(url);
        if ( i > -1 ){
          this.history.splice(i, 1);
        }
        this.history.unshift(url);
        while ( this.history.length > this.historyMaxLength ){
          this.history.pop();
        }
        this.$emit('route', url);
      },

      route(url, force){
        if ( this.router ){
          this.router.route(url, force)
        }
      },

      routing(){
        this.setRouter();
        let idx = this.router.search(this.router.currentURL);
        if ( (idx !== false) && (idx !== this.selected) ){
          this.selected = idx;
        }
        this.$emit('change', this.currentURL);
      },

      getTabColor(idx){
        if ( this.tabs[idx].fcolor ){
          return this.tabs[idx].fcolor;
        }
        let el = this.getRef('title-' + idx);
        if ( el ){
          return window.getComputedStyle(el.$el ? el.$el : el).color;
        }
        return 'black';
      },
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
      cutTitle(title){
        return bbn.fn.shorten(title, 20)
      },
      isValidIndex(idx){
        return (typeof(idx) === "number") && (this.tabs[idx] !== undefined);
      },


      getVue(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        return this.router.getVue(idx);
      },

      getTab(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        return this.getRef('tab-' + idx);
      },

      getContainer(idx){
        let cp = this.getVue(idx);
        if ( cp ){
          return cp.$el;
        }
        return false;
      },

      getRealVue(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        return this.router.getRealVue(idx);
      },

      /**
       * Called when activating a tab manually with the corresponding URL
       * Or called manually with an URL and will activate the given tab programmatically
       */
      activate(url, force){
        return this;
      },

      close(idx, force){
        let res = this.router ? this.router.remove(idx, force) : false;
        if (res && (this.router.selected > idx)) {
          this.router.selected = this.router.selected - 1;
          this.selected = this.router.selected;
        }
        else if (res && (this.selected === idx)) {
          this.router.selected = false;
          if ( this.tabs.length ){
            bbn.fn.each(this.history, (a) => {
              let tmp = this.router.getIndex(a);
              if ( tmp !== false ){
                idx = tmp;
                return false;
              }
            });
            this.router.activateIndex(this.tabs[idx] ? idx : idx - 1);
          }
        }
        this.$nextTick(() => {
          this.setConfig();
        })
        return res;
      },

      closeAll(){
        for ( let i = this.tabs.length - 1; i >= 0; i-- ){
          if ( !this.tabs[i].static && !this.tabs[i].pinned ){
            this.close(i);
          }
        }
      },

      closeAllBut(idx){
        for ( let i = this.tabs.length - 1; i >= 0; i-- ){
          if ( !this.tabs[i].static && !this.tabs[i].pinned && (i !== idx) ){
            this.close(i);
          }
        }
      },

      search(url){
        return this.router.search(url);
      },

      load(url, force){
        return this.router.load(url, force);
      },

      pin(idx){
        if ( this.isValidIndex(idx) ){
          this.tabs[idx].pinned = true;
          this.setConfig();
        }
      },

      unpin(idx){
        if ( this.isValidIndex(idx) ){
          this.tabs[idx].pinned = false;
          this.setConfig();
        }
      },


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

      getMenuFn(idx){
        if ( !this.router || !this.tabs[idx]  || (this.tabs[idx].menu === false) ){
          return false;
        }
        let items = [],
            tmp = ((bbn.fn.isFunction(this.tabs[idx].menu) ? this.tabs[idx].menu() : this.router.views[idx].menu) || []).slice(),
            others = false;
        bbn.fn.each(this.tabs, (a, i) => {
          if ( (i !== idx) && !a.static ){
            others = true;
            return false;
          }
        });
        if ( !this.tabs[idx].help ){
          let sub = this.getSubTabNav(idx);
          if ( sub && sub.tabs && sub.tabs.length ){
            let helps = [];
            sub.tabs.forEach((a) => {
              if ( a.help ){
                helps.push({
                  url: sub.getFullBaseURL() + a.url,
                  content: a.help,
                  title: a.title || a.url,
                  anchor: bbn.fn.randomString(15, 20).toLowerCase()
                });
              }
            });
            if ( helps.length === 1 ){
              this.tabs[idx].help = helps[0].content;
            }
            else if ( helps.length ){
              this.tabs[idx].help = '';
              let slide1 = '';
              helps.forEach((a) => {
                slide1 += '<h1><a href="#' + a.anchor + '">' + a.title + '</a></h1>\n';
                this.tabs[idx].help += '---slide---' + '\n<a name="' + a.anchor + '">\n' + a.content;
              });
              this.tabs[idx].help = slide1 + this.tabs[idx].help;
            }
          }
        }
        if ( this.tabs[idx].help ){
          items.push({
            text: bbn._("Help"),
            key: "help",
            icon: "nf nf-mdi-help_circle_outline",
            action: () => {
              let tab = this.getVue(idx),
                  span = document.createElement('span');
              span.innerHTML =  this.tabs[idx].title;
              let title = span.innerText;
              if ( !title && span.querySelector("[title]").length ){
                title = span.querySelector("[title]").getAttribute("title");
              }
              tab.getPopup().open({
                scrollable: false,
                component: {
                  props: ['source'],
                  template: `
                  <bbn-slideshow :source="source.content"
                                 class="bbn-bg-webblue bbn-white"
                                 separator="---slide---"></bbn-slideshow>`
                },
                source: {
                  content: this.tabs[idx].help
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
          })
        }
        if ( this.tabs[idx].icon && this.tabs[idx].title ){
          items.push({
            text: this.tabs[idx].notext ? bbn._("Show text") : bbn._("Show only icon"),
            key: "notext",
            icon: this.tabs[idx].notext ? "nf nf-fa-font" : "nf nf-fa-font_awesome",
            action: () => {
              //bbn.fn.log(this.tabs[idx]);
              this.tabs[idx].notext = !this.tabs[idx].notext;
              this.$forceUpdate();
            }
          });
        }
        if ( !this.tabs[idx].static ){
          if ( !this.tabs[idx].pinned ){
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
        if ( others ){
          items.push({
            text: bbn._("Close Others"),
            key: "close_others",
            icon: "nf nf-mdi-close_circle_outline",
            action: () => {
              this.closeAllBut(idx);
            }
          })
        }
        if ( others && !this.tabs[idx].static ){
          items.push({
            text: bbn._("Close All"),
            key: "close_all",
            icon: "nf nf-mdi-close_circle",
            action: () => {
              this.closeAll();
            }
          })
        }
        let menu = bbn.fn.isArray(this.menu) ? this.menu : this.menu(this.tabs[idx], this);
        if (menu.length) {
          bbn.fn.each(menu, a => {
            items.push(a);
          });
        }
        return items;
      },

      reload(idx){
        return this.router.reload(idx);
      },

      checkTabsHeight(noResize){
        if ( this.tabs[this.selected] ){
          let tab = this.getTab(this.options.selected),
              h = tab.parent().outerHeight(true);
          this.tabsHeight = h;
        }
        return this;
      },
      //the method getIndex is commented, maybe setColor() and setColorSelector() are no more used
      /**@todo not used */
      setColorSelector(col, idx){
        if ( (idx = this.getIndex(idx)) !== false ) {
          let vm = this,
              tab = vm.getTab(idx);
          if (tab) {
            if (!vm.colorIsDone) {
              vm.bThemeColor = tab.css("backgroundColor");
              vm.fThemeColor = tab.css("color");
            }
            if (!bbn.fn.isColor(col)) {
              col = vm.fThemeColor;
            }
            $("div.ui-tabNav-tabSelected", tab[0]).css("backgroundColor", col);
            if (window.tinycolor) {
              if ( !vm.colorIsDone ){
                vm.bColorIsLight = (tinycolor(vm.bThemeColor)).isLight();
                vm.fColorIsLight = (tinycolor(vm.fThemeColor)).isLight();
              }
            }
            vm.colorIsDone = true;
          }
        }
      },
      /**@todo not used */
      setColor(bcol, fcol, idx, dontSetSelector) {
        let vm = this;
        if ( (idx = vm.getIndex(idx)) !== false ) {
          let $tab = vm.getTab(idx);
          if ( $tab.length ) {
            $tab.css("backgroundColor", bbn.fn.isColor(bcol) ? bcol : null);
            $tab.children().not(".ui-tabNav-tabSelected").css("color", bbn.fn.isColor(fcol) ? fcol : null);
            if ( !dontSetSelector ){
              vm.setColorSelector(fcol ? fcol : false, idx);
            }
          }
        }
        return vm;
      },

      initTab(url){

      },

      getTitle(idx){
        let cp = this,
            res = '';
        if ( idx === undefined ){
          idx = this.selected;
        }
        if ( cp.tabs[idx] ){
          res += (cp.tabs[idx].title || bbn._('Untitled'));
          if ( cp.parentTab ){
            idx = cp.parentTab.idx;
            cp = cp.parentTab.tabNav;
            while ( cp ){
              res += ' < ' + (cp.tabs[idx].title || bbn._('Untitled'));
              if ( cp.parentTab ){
                idx = cp.parentTab.idx;
                cp = cp.parentTab.tabNav;
              }
              else{
                cp = false;
              }
            }
          }
        }
        if ( bbn.env.siteTitle ){
          res += ' - ' + bbn.env.siteTitle;
        }
        return res;
      },

      navigate(){
        /*
        let idx = this.selected,
            sub = this.getSubTabNav(idx);
        if ( sub && sub.isValidIndex(sub.selected) ){
          sub.navigate();
        }
        else if ( this.isValidIndex(idx) ){
          bbn.fn.setNavigationVars(this.getFullCurrentURL(idx), this.getTitle(idx), this.tabs[idx].source, false);
        }
        */
      },

      setURL(){

      },

      getSubTabNav(idx){
        let cp = this.getVue(idx);
        if ( cp ){
          return cp.find(this.$options.name);
        }
        return false;
      },

      saveEditedRow(){
        this.$emit('saveRow', this.editedRow);
      },

      cancelEditedRow(){
        this.$emit('cancelRow')
      },

      numProperties(obj){
        return bbn.fn.numProperties(obj);
      },

      setRouter(){
        if ( !this.router ){
          this.router = this.getRef("router");
        }
      },

      init(){
        let parent = this.$parent;
        // Looking for a parent tabnav to put in parentTab && parents props
        while ( parent ){
          if (
            parent.$vnode &&
            parent.$vnode.componentOptions
          ){
            if ( !this.parentTab && (parent.$vnode.componentOptions.tag === 'bbn-container') ){
              this.parentTab = parent;
            }
            else if ( parent.$vnode.componentOptions.tag === 'bbn-tabnav' ){
              this.parents.push(parent);
            }
          }
          parent = parent.$parent;
        }
        if ( !this.ready ){
          this.setRouter();
          /*
          if ( this.parents.length ){
            let idx = this.parents[0].search(this.baseURL.substr(0, this.baseURL.length - 1));
            if ( this.parents[0].isValidIndex(idx) && (this.parents[0].tabs[idx].current.indexOf(this.baseURL) === 0) ){
              url = this.parents[0].tabs[idx].current.substr(this.baseURL.length);
            }
          }
          if ( !url && (window.location.pathname.indexOf(this.fullBaseURL) === 0) ){
            url = window.location.pathname.substr(this.fullBaseURL.length);
          }
          */
          this.ready = true;
          setTimeout(() => {
            // bugfix for rendering some nf-mdi icons
            this.iconsReady = true;
          }, 1000)
          /*
          if ( !url && tabs.length ){
            this.activateDefault();
          }
          bbn.fn.log("TABNAV INITIALISATION WITH URL " + url);
          this.route(url, true);
          */
        }

      }
    },

    mounted(){
      let res = [];
      bbn.fn.each(this.source, (a) => {
        res.push(a);
      });
      let parent = this.closest('bbn-container');
      let fullURL = parent ? parent.getFullURL() : this.storageName;
      let cfg = this.getStorage(fullURL);
      if ( cfg && cfg.views ){
        bbn.fn.each(cfg.views, (a) => {
          let idx = bbn.fn.search(res, {url: a.url});
          if ( idx > -1 ){
            //bbn.fn.log("INSIDE", JSON.stringify(res[idx]));
            bbn.fn.extend(res[idx], a);
            //bbn.fn.log(JSON.stringify(res[idx]));
            //res.splice(idx, 1, a);
          }
          else{
            res.push(a);
          }
        });
      }
      this.initSource = res;
    },

    beforeDestroy() {
      if ( this.autoload ){
        this.unsetConfig()
      }
    },

    watch: {
      selected(newVal, oldVal){
        if ( this.tabs[oldVal] ){
          bbn.fn.iterate(this.tabs[oldVal].events, (a, n) => {
            delete this.tabs[oldVal].events[n];
          });
        }
        if ( this.tabs[newVal] && this.ready ){
          this.$emit('select', this.tabs[newVal], newVal);
          this.router.activateIndex(newVal);
        }
      },
        /*
      currentURL(newVal, oldVal){
        if ( newVal !== oldVal ){
          bbn.fn.log("CHANGE currentURL TO " + newVal);
          this.route(newVal);
            this.$emit('change', newVal, this.selected, oldVal);
          }
        }
        this.$forceUpdate();
      },
        */
       isDirty(val){
        if ( this.parentTab &&
          this.parentTab.tabNav &&
          this.parentTab.tabNav.tabs &&
          this.parentTab.tabNav.tabs[this.parentTab.tabNav.selected]
        ){
          this.parentTab.tabNav.tabs[this.parentTab.tabNav.selected].dirty = val;
        }
      }
    }
  });

})(Vue);

</script>
<style scoped>
div.bbn-tabnav {
  border: 0 !important;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  zoom: 1;
}
div.bbn-tabnav.bbn-tabnav-scrollable > div.bbn-tabnav-container div.bbn-tabnav-ul-container {
  padding: 0 !important;
  height: 2.4em;
}
div.bbn-tabnav.bbn-tabnav-scrollable > div.bbn-tabnav-container div.bbn-tabnav-ul-container ul.bbn-tabnav-tabs:first-child {
  white-space: nowrap;
  overflow: hidden;
}
div.bbn-tabnav.bbn-tabnav-scrollable > div.bbn-tabnav-container > div.bbn-tabnav-ul-container {
  padding: 0 2.5em !important;
}
div.bbn-tabnav > div.bbn-tabnav-container {
  height: 100%;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child {
  height: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  border-top-width: 0px;
  border-left-width: 0px;
  border-right-width: 0px;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li {
  height: 2.4em;
  list-style-type: none;
  text-decoration: none;
  margin: 0 !important;
  vertical-align: middle;
  position: relative;
  border-bottom: 0;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li i:focus,
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li span:focus {
  animation: bbn-anim-blinker 1s linear infinite;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li .bbn-tabnav-badge-container {
  position: absolute;
  top: 0;
  left: 1px;
  bottom: 0px;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li .bbn-tabnav-tab-loader {
  display: inline-block;
  width: 12px;
  height: 12px;
  position: absolute;
  top: 0.4em;
  left: 2px;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li .bbn-tabnav-tab-loader:after {
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
  animation: bbn-tabnav-tab-loader 1.2s linear infinite;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li div.bbn-tabnav-tab {
  cursor: pointer;
  color: inherit;
  padding: 0.3em 1.5em 0.5em 1.5em;
  vertical-align: middle;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li div.bbn-tabnav-tab > .bbn-tab-text {
  font-size: 1.1em;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li div.bbn-tabnav-tab.bbn-tabnav-dirty::after {
  content: '*';
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li i.bbn-tabnav-icon {
  display: block;
  position: absolute;
  right: 2px;
  font-size: 1em;
  cursor: pointer;
  margin: 0;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li i.bbn-tabnav-icon.bbn-tab-close {
  top: 1px;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li i.bbn-tabnav-icon.bbn-tab-menu {
  bottom: -2px;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li div.bbn-tabnav-selected {
  display: none;
  position: absolute;
  bottom: 1px;
  left: 1.15em;
  right: 1.15em;
  height: 3px;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li.bbn-tabnav-static div.bbn-tabnav-icons i.bbn-tab-close {
  display: none;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li.bbn-tabnav-active div.bbn-tabnav-icons i.bbn-tab-menu {
  display: block;
}
div.bbn-tabnav > div.bbn-tabnav-container ul.bbn-tabnav-tabs:first-child > li.bbn-tabnav-active div.bbn-tabnav-selected {
  display: block;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader {
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  background-color: black;
  color: white;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation {
  margin-top: 2em;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation h1 {
  font-size: 3.5em !important;
  text-align: center;
  margin-top: 1em;
  color: white;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation .sk-cube-grid {
  width: 120px;
  height: 120px;
  margin: auto;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube {
  width: 33%;
  height: 33%;
  float: left;
  background-color: white;
  -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
  animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube1 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube2 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube3 {
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube4 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube5 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube6 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube7 {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube8 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube9 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-tabnav-button {
  position: absolute;
  width: 2.5em;
  height: 2.4em;
  top: 0px;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-tabnav-button.bbn-tabnav-button-prev {
  left: 0px;
}
div.bbn-tabnav > div.bbn-tabnav-container > div.bbn-tabnav-button.bbn-tabnav-button-next {
  right: 0px;
}
div.bbn-tabnav > div.bbn-tabnav-container > span.bbn-button {
  top: 0.4em;
  position: absolute;
}
div.bbn-tabnav .bbn-tabnav {
  margin-top: 0.5em;
  height: calc(99.5%);
}
div.bbn-tabnav .bbn-tabnav .bbn-tabnav {
  margin-top: 0 !important;
}
div.bbn-tabnav .bbn-pane .bbn-tabnav {
  margin-top: 0;
}
div.bbn-tabnav .bbn-pane .bbn-tabnav .bbn-tabnav {
  margin-top: 0.5em;
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
@keyframes bbn-tabnav-tab-loader {
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
ul.ui-tabNav-menu {
  font-size: 1.2em !important;
}
ul.ui-tabNav-menu i {
  width: 2em;
  text-align: center;
}
div.bbn-tabnav-icons {
  display: none;
}

</style>
