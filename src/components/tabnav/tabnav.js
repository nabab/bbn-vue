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
(function($, bbn, Vue){
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
        initSource: [],
        parentTab: false,
        selected: false,
        visible: true,
        routerMounted: false,
        router: null
      };
    },

    computed: {
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
        return this.router ? this.router.fullBaseURL : '';
      },
      unsavedTabs(){
        return this.router ? this.router.dirtyContainers : [];
      },
      isUnsaved(){
        return !!this.unsavedTabs.length;
      }
    },

    methods: {
      update(){
        this.$forceUpdate()
      },
      observerEmit(newVal, obs){
        if ( bbn.vue.observerComponent.methods.observerEmit.apply(this, [newVal, obs]) ){
          let ele = $(".bbn-observer-" + obs.element, this.$el);
          if ( ele.length ){
            let idx = this.router.getIndex(ele[0]);
            if ( idx !== false ){
              this.router.$set(this.router.views[idx].events, 'bbnObs' + obs.element + obs.id, newVal);
              this.$nextTick(() => {
                this.$forceUpdate();
              })
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
        $.each(this.tabs, (i, obj) => {
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
        }
      },


      unsetConfig(){
        if ( this.autoload ){
          let parent = this.closest('bbn-container');
          let fullURL = parent ? parent.getFullURL() : this.storageName;
          this.unsetStorage(fullURL);
        }
      },

      onRoute(url){
        this.setConfig();
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
        let ul = this.$refs.tabgroup;
        if ( ul.scrollWidth > ul.clientWidth ){
          let total = ul.scrollWidth,
              visible = ul.clientWidth,
              position = ul.scrollLeft,
              max = total - visible,
              newPos = false;
          if ( (dir === 'left') && (position > 0) ){
            newPos = position - 300 < 0 ? 0 : position - 300;
          }
          else if ( (dir === 'right') && (position < (total - visible)) ){
            newPos = (position + 300) > max ? max : position + 300;
          }
          if ( newPos !== false ){
            $(ul).animate({
              scrollLeft: newPos
            })
          }
        }
      },
      cutTitle(title){
        return bbn.fn.shorten(title, 20)
      },
      isValidIndex(idx){
        return (typeof(idx) === "number") && (this.tabs[idx] !== undefined);
      },

      /*
      // Gets the index of a tab from various parameters: index (!), URL, a DOM element (or jQuery object) inside a tab, a tab, or the currently selected index if there is no argument
      getIndex(misc, force){
        if ( !this.tabs.length ){
          return false;
        }
        let vm = this;
        if ( !vm.isValidIndex(misc) ) {
          if ( typeof(misc) === 'string' ){
            misc = vm.search(misc);
          }
          else if ( typeof(misc) === 'object' ){
            // Vue
            if ( misc.$el ){
              misc = $(misc.$el);
            }
            // Not jQuery
            if ( !(misc instanceof jQuery) && misc.tagName ){
              misc = $(misc);
            }
            // Is element in the titles?
            let $titles = misc.closest("ul.k-tabstrip-items").children("li.k-item");
            if ( $titles.length ){
              let $title = misc.is("li.k-item") ? misc : misc.closest("li.k-item");
              misc = $titles.index($title);
            }
            // Or in the content?
            else{
              let found = false,
                  $panel = misc.is("div.bbns-tab") ? misc : misc.closest("div.bbns-tab");
              while ( !found && $panel.length ){
                if ( vm.getContainer(parseInt($panel.attr("data-index"))) === $panel[0] ){
                  found = true;
                }
                else{
                  $panel = $panel.parent().closest("div.bbns-tab");
                }
              }
              // If the element is in full screen mode
              if ( $panel.hasClass('bbns-tab-full-screen') ){
                let $prev = $(".bbns-tab-before-full-screen:first", vm.el);
                misc = $prev.is("div.bbns-tab") ?
                  $(vm.$el).children("div.bbns-tab,div.bbn-loader").index($prev) + 1 : 0;
              }
              else if ( $panel.length ){
                misc = parseInt($panel.attr("data-index"));
              }
            }
          }
        }
        if ( !vm.isValidIndex(misc) && force ) {
          for ( let i = 0; i < vm.tabs.length; i++ ){
            if ( !vm.tabs[i].disabled ){
              if ( vm.tabs[i].default ){
                return i;
              }
              else if ( !vm.isValidIndex(misc) ){
                misc = i;
              }
            }
          }
        }
        return vm.isValidIndex(misc) ? misc : false;
      },

      // Returns the baseURL property
      getBaseURL(){
        return this.router ? this.router.baseURL : '';
      },

      getFullBaseURL(){
        return this.router ? this.router.fullBaseURL : '';
      },

      getURL(idx, force){
        if ( force && !this.isValidIndex(idx) ){
          idx = this.selected;
        }
        if ( this.isValidIndex(idx) ){
          return this.tabs[idx].url;
        }
        return false;
      },

      // Returns the current URL from the root tabNav without the hostname (if it has a baseURL it will start after)
      getFullURL(idx, force){
        return this.router ? this.router.getFullURL(idx, force) : '';
      },

      getCurrentURL(idx, force){
        return this.router ? this.router.getCurrentURL(idx, force) : '';
      },

      getFullCurrentURL(idx, force){
        let url = this.getCurrentURL(idx, force);
        if ( url !== false ){
          return this.getFullBaseURL() + url;
        }
        return false;
      },

      activateDefault(){
        let idx = this.getIndex('', true);
        if ( this.isValidIndex(idx) ){
          //bbn.fn.log("ACTIVATE6", this.tabs[idx].current ? this.tabs[idx].current : this.tabs[idx].url);
          this.activate(this.tabs[idx].current ? this.tabs[idx].current : this.tabs[idx].url);
        }
      },

      activateIndex(idx){
        return this.router.activateIndex(idx);
      },
      */

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
        if ( !this.router || !this.router.views[idx] ){
          return false;
        }
        let items = [],
            tmp = ((bbn.fn.isFunction(this.router.views[idx].menu) ? this.router.views[idx].menu() : this.router.views[idx].menu) || []).slice(),
            others = false;
        $.each(this.router.views, (i, a) => {
          if ( (i !== idx) && !a.static ){
            others = true;
            return false;
          }
        });
        if ( !this.router.views[idx].help ){
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
              this.router.views[idx].help = helps[0].content;
            }
            else if ( helps.length ){
              this.router.views[idx].help = '';
              let slide1 = '';
              helps.forEach((a) => {
                slide1 += '<h1><a href="#' + a.anchor + '">' + a.title + '</a></h1>\n';
                this.router.views[idx].help += '---slide---' + '\n<a name="' + a.anchor + '">\n' + a.content;
              });
              this.router.views[idx].help = slide1 + this.router.views[idx].help;
            }
          }
        }
        if ( this.router.views[idx].help ){
          items.push({
            text: bbn._("Help"),
            key: "help",
            icon: "nf nf-mdi-help_circle_outline",
            command: () => {
              let tab = this.getVue(idx),
                  span = $('<span/>').html(this.router.views[idx].title),
                  title = span.text();
              if ( !title && span.find("[title]").length ){
                title = span.find("[title]").attr("title");
              }
              tab.getPopup().open({
                component: {
                  props: ['source'],
                  template: `
                  <bbn-slideshow :source="source.content"
                                 class="bbn-bg-webblue bbn-white"
                                 separator="---slide---"></bbn-slideshow>`
                },
                source: {
                  content: this.router.views[idx].help
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
            command: () => {
              this.reload(idx);
            }
          });
        }
        items.push({
          text: bbn._("Enlarge"),
          key: "enlarge",
          icon: "nf nf-mdi-arrow_expand_all",
          command: () => {
            this.getVue(idx).fullScreen = true;
          }
        });
        if ( tmp && tmp.length ){
          $.each(tmp, (i, a ) => {
            items.push(a)
          })
        }
        if ( this.router.views[idx].icon && this.router.views[idx].title ){
          items.push({
            text: this.router.views[idx].notext ? bbn._("Show text") : bbn._("Show only icon"),
            key: "notext",
            icon: this.router.views[idx].notext ? "nf nf-fa-font" : "nf nf-fa-font_awesome",
            command: () => {
              this.router.views[idx].notext = !this.router.views[idx].notext;
            }
          });
        }
        if ( !this.router.views[idx].static ){
          if ( !this.router.views[idx].pinned ){
            items.push({
              text: bbn._("Pin"),
              key: "pin",
              icon: "nf nf-mdi-pin",
              command: () => {
                this.pin(idx);
              }
            });
            items.push({
              text: bbn._("Close"),
              key: "close",
              icon: "nf nf-mdi-close",
              command: () => {
                this.close(idx);
              }
            })
          }
          else{
            items.push({
              text: bbn._("Unpin"),
              key: "pin",
              icon: "nf nf-mdi-pin_off",
              command: () => {
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
            command: () => {
              this.closeAllBut(idx);
            }
          })
        }
        if ( others && !this.router.views[idx].static ){
          items.push({
            text: bbn._("Close All"),
            key: "close_all",
            icon: "nf nf-mdi-close_circle",
            command: () => {
              this.closeAll();
            }
          })
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
            bbn.fn.log("INSIDE", JSON.stringify(res[idx]));
            bbn.fn.extend(res[idx], a);
            bbn.fn.log(JSON.stringify(res[idx]));
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
          bbn.fn.iterate(this.router.views[oldVal].events, (a, n) => {
            delete this.router.views[oldVal].events[n];
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
       isUnsaved(val){
        if ( this.parentTab &&
          this.parentTab.tabNav &&
          this.parentTab.tabNav.tabs &&
          this.parentTab.tabNav.tabs[this.parentTab.tabNav.selected]
        ){
          this.parentTab.tabNav.tabs[this.parentTab.tabNav.selected].isUnsaved = val;
        }
      }
    }
  });

})(jQuery, bbn, Vue);
