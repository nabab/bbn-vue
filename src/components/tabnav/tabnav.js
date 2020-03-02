 /**
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
   * @param {string} url - The URL on which the tabNav will be initialized.
   * @param {boolean} autoload - Defines if the tab will be automatically loaded based on URLs. False by default
   * except if it is true for the parent.
   * @param {string} orientation - The position of the tabs' titles: top (default) or bottom.
   * @param {string} root - The root URL of the tabNav, will be only taken into account for the top parents'
   * tabNav, will be automatically calculated for the children.
   * @param {boolean} scrollable - Sets if the tabs' titles will be scrollable in case they have a greater width
   * than the page (true), or if they will be shown multilines (false, default).
   * @param {array} source - The tabs shown at init.
   * @param {string} currentURL - The URL to which the tabnav currently corresponds (its selected tab).
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
      url: {
        type: String,
        default: ''
      },
      autoload: {
        type: Boolean,
        default: false
      },
      maxTitleLength: {
        type: Number,
        default: 20
      },
      orientation: {
        type: String,
        default: 'top'
      },
      root: {
        type: String,
        default: ''
      },
      scrollable: {
        type: Boolean,
        default: false
      },
      storageName: {
        type: String,
        default: '__ROOT__'
      },
      confirmLeave: {
        type: [Boolean, String, Function],
        default: bbn._("Are you sure you want to discard the changes you made in this tab?")
      },
      hideAdvertUrl: {
        type: String
      },
      historyMaxLength: {
        type: Number,
        default: 10
      },
      source: {
        type: Array,
        default: function(){
          return [];
        }
      },
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
