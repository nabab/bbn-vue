/**
 * Created by BBN on 15/02/2017.
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
  Vue.component("bbn-tabnav2", {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.localStorageComponent, bbn.vue.closeComponent, bbn.vue.observerComponent, bbn.vue.urlComponent],
    props: {
      url: {
        type: String,
        default: ''
      },
      autoload: {
        type: Boolean,
        default: false
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
        currentURL: '',
        tabs: [],
        parents: [],
        parentTab: false,
        selected: false,
        visible: true,
        routerMounted: false,
        router: null
      };
    },

    computed: {
      activeTab(){
        if ( (this.selected !== false) && this.tabs[this.selected] ){
          return this.getVue(this.selected)
        }
        return false;
      },
      activeRealTab(){
        let tab = this.activeTab;
        if ( tab ){
          let sub = this.getSubTabNav(this.selected);
          if ( sub ){
            return sub.activeRealTab;
          }
        }
        return tab;
      },
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
      unsavedTabs(){
        return $.map(this.tabs, (v) => {
          if ( v.isUnsaved ){
            return {
              idx: v.idx,
              url: v.url
            }
          }
          return null;
        });
      },
      isUnsaved(){
        return !!this.unsavedTabs.length;
      }
    },

    methods: {
      route(url, force){
        if ( this.router ){
          this.router.route(url, force)
        }
      },
      routing(){
        this.setRouter();
        let idx = this.getIndex(this.router.currentURL);
        if ( this.isValidIndex(idx) ){
          if ( idx !== this.selected ){
            this.tabs[idx].current = this.router.currentURL;
            this.selected = idx;
          }
          else {
            this.tabs[idx].current = this.router.currentURL;
          }
        }
        else{
          bbn.fn.log("NO INDEX", this.router.currentURL);
        }
      },
      getTabColor(idx){
        if ( this.tabs[idx].fcolor ){
          return this.tabs[idx].fcolor;
        }
        let el = this.$refs['title-' + idx];
        if ( el && (!$.isArray(el) || el.length) ){
          return window.getComputedStyle(el[0] ? el[0] : el).color;
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
      isValidIndex(idx){
        return (typeof(idx) === "number") && (this.tabs[idx] !== undefined);
      },

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
        let url = this.getURL(idx, force);
        if ( url !== false ){
          return this.getFullBaseURL() + url;
        }
        return false;
      },

      getCurrentURL(idx, force){
        if ( force && !this.isValidIndex(idx) ){
          idx = this.selected;
        }
        if ( this.isValidIndex(idx) ){
          return this.tabs[idx].current;
        }
        return false;
      },

      getFullCurrentURL(idx, force){
        let url = this.getCurrentURL(idx, force);
        if ( url !== false ){
          return this.getFullBaseURL() + url;
        }
        return false;
      },

      // Returns the url relative to the current tabNav from the given url
      parseURL(fullURL){
        return this.router ? this.router.parseURL(fullURL) : fullURL;
      },

      activateDefault(){
        let vm = this,
            idx = vm.getIndex('', true);
        if ( vm.isValidIndex(idx) ){
          //bbn.fn.log("ACTIVATE6", this.tabs[idx].current ? this.tabs[idx].current : this.tabs[idx].url);
          this.activate(this.tabs[idx].current ? this.tabs[idx].current : this.tabs[idx].url);
        }
      },

      activateIndex(idx){
        if ( this.isValidIndex(idx) ){
          //bbn.fn.log("ACTIVATE7", this.tabs[idx].current);
          this.activate(this.tabs[idx].current);
        }
      },

      getVue(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        if ( this.isValidIndex(idx) ){
          return this.getRef('container-' + idx);
        }
        return false;
      },

      getTab(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        if ( this.isValidIndex(idx) ){
          return this.getRef('tab-' + idx);
        }
        return false;
      },

      getContainer(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        let c = this.getVue(idx);
        return c ? c.$el : false;
      },

      getSubTabNav(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        if ( this.isValidIndex(idx) ){
          let tab = this.getVue(idx);
          if ( tab ){
            return tab.getSubTabNav();
          }
        }
        return false;
      },

      getRealVue(idx){
        let tabnav = this,
            sub = tabnav;
        if ( idx === undefined ){
          idx = this.selected;
        }
        while ( tabnav ){
          tabnav = sub.getSubTabNav(idx);
          if ( tabnav ){
            sub = tabnav;
            idx = sub.selected;
          }
        }
        return sub.getVue(idx);
      },

      /**
       * Called when activating a tab manually with the corresponding URL
       * Or called manually with an URL and will activate the given tab programmatically
       */
      activate(url, force){

        if ( !this.ready ){
          return ;
        }

        url = bbn.fn.removeTrailingChars(url, '/');
        // if no parameter is passed we use the current url
        let vm = this,
            idx = vm.getIndex(url),
            subtab;
        bbn.fn.log("url before parse: " + url);
        //url = vm.parseURL(url);
        //bbn.fn.log("url after parse: " + url);
        // either the requested url or the url corresponding to the target index

        // No URL has been given -> we activate the default tab
        if ( !url ){
          //bbn.fn.log("ACTIVATING DEFAULT");
          return this.activateDefault();
        }
        // No index found: loading or error
        //bbn.fn.log("valid index: " + this.isValidIndex(idx));
        if ( !this.isValidIndex(idx) ){
          for ( let i = 0; i < this.tabs.length; i++ ){
            if (
              (
                (url === this.tabs[i].url) ||
                ((url + '/').indexOf(this.tabs[i].url) === 0)
              ) &&
              (subtab = this.getSubTabNav(i))
            ){
              //bbn.fn.log("ACTIAVTE SUBTAB WOITH URL " + url.substr(this.tabs[i].url.length + 1));
              return subtab.activate(url === this.tabs[i].url ? '' : url.substr(this.tabs[i].url.length + 1));
            }
          }
          // autoload is set to true we launch the link function which will activate the newly created tab
          if ( vm.autoload ){
            //alert(this.baseURL + '----NOT VALID----' + url);
            //bbn.fn.log("link from autoload: " + url, vm);
            this.router.load(url, force);
          }
          else{
            bbn.fn.error(
              "Impossible to find an index for " + url + " in element with baseURL " +
              vm.getFullBaseURL()
            );
          }
        }
        // Index exists but content not loaded yet
        else if ( vm.tabs[idx].load && !vm.tabs[idx].disabled && !vm.tabs[idx].loading ){
          //bbn.fn.log("LOADING " + url);
          this.router.load(url, force);
        }
        else if ( !vm.tabs[idx].disabled ){
          if ( (vm.tabs[idx].current !== url) && (
            (url === vm.tabs[idx].url) ||
            (url.indexOf(vm.tabs[idx].url + '/') === 0)
          )){
            vm.tabs[idx].current = url;
          }
          vm.selected = idx;
          this.router.route(vm.tabs[idx].current);
          bbn.fn.each(this.tabs, (t, i) => {
            let subtab = vm.getSubTabNav(i);
            if ( subtab ){
              subtab.visible = i === idx;
            }
          })
          let subtab = vm.getSubTabNav(idx);
          if ( subtab && subtab.ready ){
            //bbn.fn.log("ACTIVATING SUBTAB");
            subtab.activate(url.substr(vm.tabs[idx].url.length+1), force);
          }
          else if ( force && vm.autoload ){
            //bbn.fn.log("RELOADING TAB");
            this.reload(idx);
          }
        }

        return this;
      },

      close(idx, force){
        if ( this.tabs[idx] && !this.tabs[idx].static && !this.tabs[idx].pinned ){
          let ev = $.Event('close');
          if ( this.isUnsaved &&
            this.tabs[idx].isUnsaved &&
            this.unsavedTabs.length &&
            !ev.isDefaultPrevented() &&
            !force
          ){
            ev.preventDefault();
            this.confirm(this.confirmLeave, () => {
              $.each(this.unsavedTabs, (i, t) => {
                let forms = bbn.vue.findAll(this.getVue(t.idx), 'bbn-form');
                if ( Array.isArray(forms) && forms.length ){
                  $.each(forms, (k, f) => {
                    f.reset();
                  });
                }
              });
              this.$nextTick(() => {
                this.$emit('close', idx, ev);
                this.close(idx, true);
              });
            });
          }
          else if ( !force ){
            this.$emit('close', idx, ev);
          }
          if ( !ev.isDefaultPrevented() || force ){
            this.tabs.splice(idx, 1);
            if ( this.selected > idx ){
              this.selected = this.selected - 1;
            }
            else if ( this.selected === idx ){
              this.selected = false;
              if ( this.tabs.length ){
                $.each(this.history, (i, a) => {
                  let tmp = this.getIndex(a);
                  if ( tmp !== false ){
                    idx = tmp;
                    return false;
                  }
                });
                this.activateIndex(this.tabs[idx] ? idx : idx - 1);
              }
            }
            this.setConfig();
          }
        }
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

      add(obj_orig, idx){
        let obj = $.extend({}, obj_orig),
            index;
        //obj must be an object with property url
        if (
          (typeof(obj) === 'object') &&
          obj.url &&
          ((idx === undefined) || this.isValidIndex(idx) || (idx === this.tabs.length))
        ){
          if ( !obj.current ){
            if ( bbn.env.path.indexOf(this.getFullBaseURL() + obj.url + '/') === 0 ){
              bbn.env.path.substr(this.getFullBaseURL().length);
            }
            else{
              obj.current = obj.url;
            }
          }
          else if ( (obj.current !== obj.url) && (obj.current.indexOf(obj.url + '/') !== 0) ){
            obj.current = obj.url;
          }
          index = this.search(obj.url);
          obj.isUnsaved = false;
          obj.events = {};
          if ( !obj.menu ){
            obj.menu = [];
          }
          if ( index !== false ){
            if ( idx === undefined ){
              idx = index;
            }
            obj.idx = idx;
            obj.selected = index === this.selected;
            // If the tab exists we remove it
            bbn.fn.iterate(this.tabs[index], (v, n) => {
              if ( obj[n] === undefined ){
                obj[n] = v;
              }
            })
            this.tabs.splice(index, 1);
          }
          else{
            obj.selected = false;
            obj.idx = idx === undefined ? this.tabs.length : idx;
          }
          if ( !obj.current ){
            obj.current = obj.url;
          }
          if ( obj.idx === this.tabs.length ){
            this.tabs.push(obj);
          }
          else{
            this.tabs.splice(idx, 0, obj);
          }
        }
      },

      search(url){
        let r = bbn.fn.search(this.tabs, "url", url);
        if ( r === -1 ){
          bbn.fn.each(this.tabs, (tab, index) => {
            if ( url.indexOf(tab.url + '/') === 0 ){
              r = index;
              return false;
            }
          });
        }
        return r > -1 ? r : false;
      },

      load(url, force){
        const vm = this;
        let idx = vm.search(url),
            finalURL = vm.fullBaseURL + url;
        bbn.fn.log(idx, finalURL, url);
        if ( vm.isValidIndex(idx) ){
          if ( vm.tabs[idx].real ){
            finalURL = vm.tabs[idx].real;
          }
          if ( force ){
            return this.reload(idx)
          }
          else if ( vm.tabs[idx].load === false ){
            return;
          }
          else{
            vm.tabs[idx].loading = true;
          }
        }
        else{
          idx = this.tabs.length;
          this.tabs.push({url: url, title: bbn._('Loading'), load: true, loading: true, selected: true, current: url, error: false});
          //bbn.fn.log("ACTIVATE1", url);
        }
        vm.tabs[idx].state = 'loading';
        this.activate(url);
        /*
          vm.$nextTick(() => {
            //bbn.fn.log("ADDING", d, vm.tabs[idx]);
            //bbn.fn.log("ACTIVATE2", d.current);
            this.$emit('tabLoaded', d.data, d.url, vm.tabs[idx]);
            vm.activate(d.current);
          });
        }, (xhr, textStatus, errorThrown) => {
          bbn.fn.log(arguments);
          if ( this.isValidIndex(idx) ){
            this.tabs[idx].state = xhr.status;
            this.tabs[idx].error = errorThrown;
            this.tabs[idx].loading = false;
            this.tabs[idx].loaded = true;
            this.tabs[idx].menu = false;
            this.tabs[idx].title = bbn._('Error') + ' ' + xhr.status;
            if ( this.tabs[idx].load !== false ){
              this.tabs[idx].load = null;
            }
            this.navigate(url);
            this.activate(url);
          }
         */
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

      getMenuFn(idx){
        let items = [],
            tmp = (($.isFunction(this.tabs[idx].menu) ? this.tabs[idx].menu() : this.tabs[idx].menu) || []).slice(),
            others = false;
        $.each(this.tabs, (i, a) => {
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
            icon: "zmdi zmdi-help-outline",
            command: () => {
              let tab = this.getVue(idx),
                  span = $('<span/>').html(this.tabs[idx].title),
                  title = span.text();
              if ( !title && span.find("[title]").length ){
                title = span.find("[title]").attr("title");
              }
              tab.getPopup().open({
                component: {
                  props: ['source'],
                  template: `
                  <bbn-slideshow :source="source.content" 
                                 class="w3-blue"
                                 separator="---slide---"></bbn-slideshow>`
                },
                source: {
                  content: this.tabs[idx].help
                },
                title: '<i class="w3-large zmdi zmdi-help-outline"> </i> <span class="bbn-iblock">' + title + '</span>',
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
            icon: "zmdi zmdi-refresh-sync",
            command: () => {
              this.reload(idx);
            }
          });
        }
        items.push({
          text: bbn._("Enlarge"),
          key: "enlarge",
          icon: "fas fa-expand-arrows-alt",
          command: () => {
            this.getVue(idx).fullScreen = true;
          }
        });
        if ( tmp && tmp.length ){
          $.each(tmp, (i, a ) => {
            items.push(a)
          })
        }
        if ( this.tabs[idx].icon && this.tabs[idx].title ){
          items.push({
            text: this.tabs[idx].notext ? bbn._("Show text") : bbn._("Show only icon"),
            key: "notext",
            icon: this.tabs[idx].notext ? "fas fa-font" : "fab fa-font-awesome",
            command: () => {
              this.tabs[idx].notext = !this.tabs[idx].notext;
            }
          });
        }
        if ( !this.tabs[idx].static ){
          if ( !this.tabs[idx].pinned ){
            items.push({
              text: bbn._("Pin"),
              key: "pin",
              icon: "fas fa-thumbtack",
              command: () => {
                this.pin(idx);
              }
            });
            items.push({
              text: bbn._("Close"),
              key: "close",
              icon: "zmdi zmdi-close",
              command: () => {
                this.close(idx);
              }
            })
          }
          else{
            items.push({
              text: bbn._("Unpin"),
              key: "pin",
              icon: "fas fa-thumbtack",
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
            icon: "zmdi zmdi-close-circle-o",
            command: () => {
              this.closeAllBut(idx);
            }
          })
        }
        if ( others && !this.tabs[idx].static ){
          items.push({
            text: bbn._("Close All"),
            key: "close_all",
            icon: "zmdi zmdi-close-circle",
            command: () => {
              this.closeAll();
            }
          })
        }
        return items;
      },

      reload(idx){
        let subtabnav = this.getSubTabNav(idx);
        if ( subtabnav && subtabnav.autoload ){
          let cfg = this.getConfig(subtabnav);
          if ( cfg && cfg.tabs ){
            this.tabs[idx].cfg = cfg;
          }
        }
        if ( this.tabs[idx].load !== false ){
          this.tabs[idx].load = true;
        }
        if ( this.tabs[idx].imessages ){
          this.tabs[idx].imessages.splice(0, this.tabs[idx].imessages.length);
        }
        this.$nextTick(() => {
          this.activateIndex(idx);
        })
      },

      checkTabsHeight(noResize){
        if ( this.tabs[this.selected] ){
          let tab = this.getTab(vm.options.selected),
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
        let idx = this.selected,
            sub = this.getSubTabNav(idx);
        if ( sub && sub.isValidIndex(sub.selected) ){
          sub.navigate();
        }
        else if ( this.isValidIndex(idx) ){
          bbn.fn.setNavigationVars(this.getFullCurrentURL(idx), this.getTitle(idx), this.tabs[idx].source, false);
        }
      },

      setURL(){

      },

      getConfig(tabnav){
        let cfg = {
          baseURL: tabnav.baseURL,
          tabs: []
        };
        $.each(tabnav.tabs, (i, obj) => {
          if ( obj.url ){
            let res = {
              url: obj.url,
              icon: obj.icon || false,
              notext: obj.notext || false,
              load: true,
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
            let subtabnav = tabnav.getSubTabNav(i);
            if ( subtabnav && subtabnav.autoload ){
              res.cfg = this.getConfig(subtabnav);
            }
            cfg.tabs.push(res);
          }
        });
        return cfg;
      },

      _getStorageRealName(){
        return 'tabnav' + (this.baseURL ? '-' + this.baseURL : '');
      },

      setConfig(){
        if ( this.autoload ){
          if ( this.parents.length ){
            return this.parents[0].setConfig();
          }
          else{
            let cfg = this.getConfig(this);
            this.setStorage(cfg);
          }
        }
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

      observerEmit(newVal, obs){
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
                this.$set(this.tabs[idx].events, 'bbnObs' + obs.element + obs.id, newVal);
              }
            }
          }
        }
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
            if ( !this.parentTab && (parent.$vnode.componentOptions.tag === 'bbns-tab') ){
              this.parentTab = parent;
            }
            else if ( parent.$vnode.componentOptions.tag === 'bbn-tabnav' ){
              this.parents.push(parent);
            }
          }
          parent = parent.$parent;
        }
        // If there is a parent tabnav we automatically give the proper baseURL
        //bbn.fn.log("ACTIVATE3", url);

        /*
        let url = this.parents.length ?
          this.parents[0].currentURL.substr(this.fullBaseURL.length) :
          window.location.pathname.substr(this.fullBaseURL.length ? this.fullBaseURL.length : 1);
        //bbn.fn.log("ACTIVATE AFTER MOUNT", this.currentURL, url, this.parents.length ? this.parents[0].currentURL : 'RIEN');

        this.activate(url);
        */

        if ( !this.ready ){
          this.setRouter();
          let cfg;
          if ( this.parents.length ){
            bbn.fn.info(this.parents[0].currentURL || 'NON');
            let tmp = this.parents[0].getURL(this.parentTab.idx);
            if ( this.baseURL !== (tmp + '/') ) {
              this.baseURL = tmp + '/';

              /*
              if (this.parents.autoload && (tmp.indexOf(this.baseURL) === 0)) {
                this.parents.setURL(this.baseURL, this.$el);
              }
              */
            }
            if ( this.parentTab.cfg ){
              cfg = this.parentTab.cfg;
            }
          }
          else{
            cfg = this.getStorage()
          }

          let tabs = [];
          if ( this.slotSource ){
            tabs = tabs.concat(this.slotSource);
          }
          if ( this.source ){
            tabs = tabs.concat(this.source);
          }
          if ( cfg && cfg.tabs ){
            tabs = tabs.concat(cfg.tabs);
          }
          let url;
          if ( this.parents.length ){
            let idx = this.parents[0].search(this.baseURL.substr(0, this.baseURL.length - 1));
            if ( this.parents[0].isValidIndex(idx) ){
              url = this.parents[0].tabs[idx].current.substr(this.baseURL.length) || '';
            }
          }
          else{
            url = window.location.pathname.substr(this.fullBaseURL.length ? this.fullBaseURL.length : 1);
          }
          bbn.fn.each(this.router.views, (a) => {
            this.add(a);
          });
          bbn.fn.each(tabs, (obj, i) => {
            if ( obj.url ){
              this.add(obj);
              this.router.add(obj);
            }
          });
          this.ready = true;
          this.router.route(url, true);
        }

      }
    },

    created(){
      // Adding bbns-tab from the slot
      if ( this.$slots.default ){
        for ( let node of this.$slots.default ){
          if (
            node &&
            (node.tag === 'bbns-tab') &&
            node.data.attrs.url
          ){
            this.tabs.push($.extend({slot: false}, node.data.attrs));
          }
        }
      }
    },

    mounted(){


      // We make the tabs reorderable
      /*
      let $tabgroup = $(this.$refs.tabgroup),
          reorderable = $tabgroup.data('kendoDraggable');
      if ( reorderable ) {
        reorderable.destroy();
      }
      $tabgroup.kendoDraggable({
        group: 'tabs',
        filter:'.k-item',
        hint: function(element) {
          return element.clone().wrap('<ul class="k-reset k-tabstrip-items bbn-tabnav-tabs"/>').parent().css({opacity: 0.8});
        }
      });
      $tabgroup.kendoDropTarget({
        group: 'tabs',
        drop: function(e){
          bbn.fn.log(e);
        }
      });
      */
      // Giving colors
    },

    watch: {
      selected(newVal){
        if ( this.tabs[newVal] && this.ready ){
          this.$emit('select', this.tabs[newVal], newVal);
          if ( this.currentURL !== this.tabs[newVal].current ){
            this.currentURL = this.tabs[newVal].current;
          }
        }
      },
      currentURL(newVal, oldVal){
        if ( newVal !== oldVal ){
          if ( this.isValidIndex(this.selected) ){
            let tab = bbn.vue.getChildByKey(this, this.tabs[this.selected].url, 'bbns-tab');
            if (
              tab &&
              (this.tabs[this.selected].current !== newVal) && (
                (newVal === this.tabs[this.selected].url) ||
                (newVal.indexOf(this.tabs[this.selected].url + '/') === 0)
              )
            ){
              this.tabs[this.selected].current = newVal;
            }
            // CHECKING PARENTS
            if ( this.parents.length ){
              this.parents[0].currentURL = this.baseURL + newVal;
            }
            else if ( this.autoload && this.ready ){
              this.setConfig();
            }
            this.route(this.currentURL);
            this.$emit('change', newVal, this.selected, oldVal);
          }
        }
        this.$forceUpdate();
      },
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
