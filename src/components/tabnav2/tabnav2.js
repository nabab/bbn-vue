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
      let baseURL = this.root;
      while ( baseURL.substr(-1) === '/' ){
        baseURL = baseURL.substr(0, baseURL.length-1);
      }
      while ( baseURL.substr(0, 1) === '/' ){
        baseURL = baseURL.substr(1);
      }
      return {
        _bbnTabNav: {
          started: false,
          titles: '',
          num: 0
        },
        history: [],
        currentURL: '',
        baseURL: baseURL ? baseURL + '/' : '',
        tabs: [],
        parents: [],
        parentTab: false,
        selected: false,

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
        var vm = this;
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
            var $titles = misc.closest("ul.k-tabstrip-items").children("li.k-item");
            if ( $titles.length ){
              var $title = misc.is("li.k-item") ? misc : misc.closest("li.k-item");
              misc = $titles.index($title);
            }
            // Or in the content?
            else{
              let found = false,
                  $panel = misc.is("div.bbn-container") ? misc : misc.closest("div.bbn-container");
              while ( !found && $panel.length ){
                bbn.fn.log("CHECKING EQUALITY", $panel[0], $panel.attr("data-index"), vm.getContainer(parseInt($panel.attr("data-index"))));
                if ( vm.getContainer(parseInt($panel.attr("data-index"))) === $panel[0] ){
                  found = true;
                }
                else{
                  $panel = $panel.parent().closest("div.bbn-container");
                }
              }
              // If the element is in full screen mode
              if ( $panel.hasClass('bbn-container-full-screen') ){
                var $prev = $(".bbn-container-before-full-screen:first", vm.el);
                misc = $prev.is("div.bbn-container") ?
                  $(vm.$el).children("div.bbn-container,div.bbn-loader").index($prev) + 1 : 0;
              }
              else if ( $panel.length ){
                misc = parseInt($panel.attr("data-index"));
              }
            }
          }
        }
        if ( !vm.isValidIndex(misc) && force ) {
          for ( var i = 0; i < vm.tabs.length; i++ ){
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
        return this.baseURL;
      },

      getFullBaseURL(){
        return this.fullBaseURL;
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
        var url = this.getURL(idx, force);
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
        var url = this.getCurrentURL(idx, force);
        if ( url !== false ){
          return this.getFullBaseURL() + url;
        }
        return false;
      },

      // Returns the url relative to the current tabNav from the given url
      parseURL(fullURL){
        var vm = this,
            fullBaseURL = vm.fullBaseURL;
        if ( fullURL === undefined ){
          return '';
        }
        if ( typeof(fullURL) !== 'string' ){
          return fullURL.toString();
        }
        if ( fullURL.indexOf(bbn.env.root) === 0 ){
          fullURL = fullURL.substr(bbn.env.root.length);
        }
        if ( fullBaseURL === (fullURL + '/') ){
          return '';
        }
        if ( fullBaseURL && (fullURL.indexOf(fullBaseURL) === 0) ){
          return fullURL.substr(fullBaseURL.length);
        }
        /*if ( vm.baseURL && (url.indexOf(vm.baseURL) === 0) ){
         return url.substr(vm.baseURL.length);
         }
         else if ( vm.baseURL === (url + '/') ){
         return '';
         }*/
        return fullURL;
      },

      activateDefault(){
        var vm = this,
            idx = vm.getIndex('', true);
        if ( vm.isValidIndex(idx) ){
          this.activate(this.tabs[idx].current ? this.tabs[idx].current : this.tabs[idx].url);
        }
      },

      activateIndex(idx){
        if ( this.isValidIndex(idx) ){
          this.activate(this.tabs[idx].current);
        }
      },

      getVue(idx){
        if ( this.isValidIndex(idx) && this.$refs['container-' + idx] ){
          return $.isArray(this.$refs['container-' + idx]) ?
            this.$refs['container-' + idx][0] :
            this.$refs['container-' + idx];
        }
        return false;
      },

      getTab(idx){
        if ( this.isValidIndex(idx) && this.$refs['tab-' + idx] ){
          return this.getRef('tab-' + idx);
        }
        return false;
      },

      getContainer(idx){
        let c = this.getVue(idx);
        return c ? c.$el : false;
      },

      getSubTabNav(idx){
        if ( this.isValidIndex(idx) ){
          let tab = this.getVue(idx);
          if ( tab ){
            return tab.getSubTabNav();
          }
        }
        return false;
      },

      /**
       * Called when activating a tab manually with the corresponding URL
       * Or called manually with an URL and will activate the given tab programmatically
       */
      activate(url, force){

        // if no parameter is passed we use the current url
        var vm = this,
            idx,
            tab,
            subtab;
        bbn.fn.info(url);
        //bbn.fn.log("url before parse: " + url);
        url = vm.parseURL(url);
        bbn.fn.log(url, this.getFullBaseURL());
        //bbn.fn.log("url after parse: " + url);
        // either the requested url or the url corresponding to the target index

        // No URL has been given -> we activate the default tab
        if ( !url ){
          bbn.fn.log("activateDefault with no url ");
          return vm.activateDefault();
        }
        idx = vm.getIndex(url);
        // No index found: loading or error
        if ( !vm.isValidIndex(idx) ){
          for ( var i = 0; i < vm.tabs.length; i++ ){
            if (
              ((url + '/').indexOf(vm.tabs[i].url) === 0) &&
              (subtab = vm.getSubTabNav(i))
            ){
              vm.selected = i;
              return subtab.activate(vm.getFullBaseURL() + url);
            }
          }
          // autoload is set to true we launch the link function which will activate the newly created tab
          if ( vm.autoload ){
            //alert(this.baseURL + '----NOT VALID----' + url);
            //bbn.fn.log("link from autoload: " + url);
            vm.load(url, force);
          }
          else{
            new Error(
              "Impossible to find an index for " + url + " in element with baseURL " +
              vm.getFullBaseURL()
            );
          }
        }
        // Index exists but content not loaded yet
        else if ( vm.tabs[idx].load && !vm.tabs[idx].disabled && (vm.tabs[idx].load !== false) ){
          //alert(this.baseURL + '----VALID----' + url);
          //vm.selected = idx;
          vm.load(url, force);
        }
        else if ( !vm.tabs[idx].disabled ){
          var subtab = vm.getSubTabNav(idx);
          if ( subtab && subtab.ready ){
            subtab.activate(vm.getFullBaseURL() + url, force);
          }
          else if ( force && vm.autoload ){
            this.reload(idx);
          }
          vm.selected = idx;
        }

        return this;
        /*
        var // actual tab
          $tab = vm.getTab(idx),
          // Container
          $cont = vm.getContainer(idx),
          // Previous "current url"
          oldCurrent = vm.currentURL;

        // Do nothing if the tab is already activated and force is not true or the widget loads for the first time
        if ( $tab.data("bbn-tabnav-activated") && (!force || !vm.isReady()) ){
          vm._urlActivation(url, idx, force);
          //bbn.fn.log("It seems tabnav-activated is on " + $tab.data("bbn-tabnav-activated"));
          if ( !vm.list.length ){
            throw new Error("It seems tabnav-activated is on " + $tab.data("bbn-tabnav-activated"));
          }
          return this;
        }
        // Error if one element is missing
        if ( !$cont.length || !$tab.length ){
          throw new Error("There is a problem with the widget...?");
        }

        // Checking difference between former and new URLs
        if ( oldCurrent !== url ){
          // This is the only moment where changed is set
          vm.changed = true;
          // If it's not already activated we do programmatically, it won't execute the callback function
          if ( !$tab.hasClass("k-state-active") ){
            vm.wid.activateTab($tab);
            if ( vm.isReady() || vm.parent ){
              return this;
            }
          }
        }

        // In this case the tab exists but we load its content the first time it is activated
        if ( vm.list[idx].load ){
          //bbn.fn.log("loading content from list load parameter");
          vm.list[idx].load = false;
          vm.setContent($.ui.tabNav.getLoader(), idx);
          vm.loadContent(vm.fullBaseURL + url, vm.getData(idx), vm.list[idx]);
          return vm;
        }
        // Only if either:
        // - the tabNav has never been activated
        // - the force parameter has been sent
        // - the URL is different
        // We really activate it
        if ( force || vm.isChanged() ) {
          //bbn.fn.log("***COUNT****", $tab.length, $tab.siblings().length);
          vm.rActivate(idx, url, force)
        }
        else{
          throw new Error("NOT ACTIVATED WITH " + url);
          //bbn.fn.log("NOT ACTIVATED WITH " + url, vm.$el, vm.list);
        }
        return this;
        */
      },

      close(idx, force){
        bbn.fn.log("CLOSING", idx, this.selected);
        if ( this.tabs[idx] && !this.tabs[idx].static && !this.tabs[idx].pinned ){
          let ev = $.Event();
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
                  bbn.fn.log("GETTING INDEX...", tmp, a);
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
        const vm = this;
        let obj = $.extend({}, obj_orig),
            index;
        //obj must be an object with property url
        if (
          (typeof(obj) === 'object') &&
          obj.url &&
          (
            (idx === undefined) ||
            (
              (typeof(idx) === 'number') &&
              vm.tabs[idx]
            )
          )
        ){
          index = vm.search(obj.url);
          obj.isUnsaved = false;
          obj.events = {};
          if ( !obj.menu ){
            obj.menu = [];
          }
          if ( index !== false ){
            obj.idx = index;
            obj.selected = index === vm.selected;
            $.each(obj, function(n, val){
              vm.$set(vm.tabs[index], n, obj[n]);
            })
          }
          else{
            obj.selected = false;
            if ( !obj.current ){
              obj.current = obj.url;
            }
            if ( idx === undefined ){
              obj.idx = vm.tabs.length;
              vm.tabs.push(obj);
            }
            else{
              obj.idx = idx;
              $.each(vm.tabs, function(i, tab){
                if ( i >= idx ){
                  vm.$set(vm.tabs[i], "idx", tab.idx+1);
                }
              });
              vm.tabs.splice(idx, 0, obj);
            }
            if ( (vm.tabs.length === 1) && vm.ready ){
              vm.activateIndex(0);
            }
          }
        }
      },

      search(url){
        var r = bbn.fn.search(this.tabs, "url", url, "starts");
        return r === -1 ? false : r;
      },

      load(url, force){
        const vm = this;
        let idx = vm.search(url),
            finalURL = vm.fullBaseURL + url;
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
        }
        return bbn.fn.post(finalURL, {_bbn_baseURL: vm.fullBaseURL}, (d) => {
          if ( d.content ){
            if ( !d.url ){
              d.url = url;
            }
            d.url = vm.parseURL(d.url);
            d.loaded = true;
            if ( d.load !== false ){
              d.load = null;
            }
            /** @todo Why is it here? */
            idx = vm.search(d.url);
            let checkIdx = vm.search(url);
            if ( (idx !== checkIdx) && (idx === false) && (checkIdx !== false) ){
              idx = checkIdx;
              this.tabs[idx].url = d.url;
              this.navigate(d.url);
              bbn.fn.error("NAVIGATING");
              bbn.fn.log(d.url, url);
              url = d.url;
            }
            this.$emit('tabLoaded', d.data, d.url, vm.tabs[idx]);
            d.menu = vm.tabs[idx] && vm.tabs[idx].menu ? vm.tabs[idx].menu : undefined;
            if ( d.data !== undefined ){
              d.source = $.extend({}, d.data);
              delete d.data;
            }
            d.current = url;
            if ( vm.isValidIndex(idx) ){
              vm.add(d, idx);
            }
            else{
              idx = vm.tabs.length;
              vm.add(d);
            }
            vm.selected = idx;
            //vm.$nextTick(() => vm.activate(d.url));
          }
        })
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
            icon: "fa fa-refresh",
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
            bbn.fn.log("ENLARGE", this.getVue(idx));
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
            icon: this.tabs[idx].notext ? "fa fa-font" : "fa fa-fonticons",
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
              icon: "fa fa-thumb-tack",
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
              icon: "fa fa-thumb-tack",
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
        var vm = this;
        if ( vm.tabs[vm.selected] ){
          var tab = vm.getTab(vm.options.selected),
              h = tab.parent().outerHeight(true);
          if ( !noResize && h && (h !== vm.tabsHeight) ){
            /** @todo Check if it's right */
            bbn.fn.log("checkTabsHeight change");
            // Previous code (shit!)
          }
          vm.tabsHeight = h;
        }
        return vm;
      },

      setColorSelector(col, idx){
        if ( (idx = this.getIndex(idx)) !== false ) {
          var vm = this,
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
        var vm = this;
        if ( (idx = vm.getIndex(idx)) !== false ) {
          var $tab = vm.getTab(idx);
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

      navigate(){
        var vm = this,
            sub = vm.getSubTabNav(vm.selected);
        if ( sub && sub.isValidIndex(sub.selected) ){
          sub.navigate();
        }
        else if ( vm.isValidIndex(vm.selected) ){
          var url = vm.getFullCurrentURL(vm.selected);
          bbn.fn.setNavigationVars(url, vm.tabs[vm.selected].title, vm.tabs[vm.selected].source, false);
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
            bbn.fn.log("INDEX FOUND", idx, i, this.observers[i].value, newVal);
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
      }


    },

    created(){
      // Adding bbn-container from the slot
      if ( this.$slots ){
        for ( let name in this.$slots ){
          let node = this.$slots[name][0];
          if (
            node && node.componentOptions &&
            (node.componentOptions.tag === 'bbn-container') &&
            node.componentOptions.propsData.url
          ){
            this.add($.extend({isCreated: true, loaded: true}, node.componentOptions.propsData));
            node.componentOptions.propsData = this.tabs[this.tabs.length-1];
            bbn.fn.log("CREATED AT CREATION", node);
          }
        }
      }
    },

    mounted(){

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
          else if ( parent.$vnode.componentOptions.tag === 'bbn-tabnav2' ){
            this.parents.push(parent);
          }
        }
        parent = parent.$parent;
      }
      // If there is a parent tabnav we automatically give the proper baseURL
      let cfg;
      if ( this.parents.length ){
        var tmp = this.parents[0].getURL(this.parentTab.idx);
        if ( this.baseURL !== (tmp + '/') ) {
          this.baseURL = tmp + '/';

          /*
          if (this.parents.autoload && (tmp.indexOf(this.baseURL) === 0)) {
            this.parents.setURL(this.baseURL, this.$el);
            this.currentURL = tmp.substr(this.baseURL.length + 1);
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
      $.each(!this.autoload || !cfg || !cfg.tabs ? this.source : cfg.tabs, (i, obj) => {
        if ( obj.url ){
          bbn.fn.log("CREATED AT MOUNT");
          this.add(obj);
        }
      });

      // We make the tabs reorderable
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
      // Giving colors

      this.activate(this.parseURL(bbn.env.path), true);
      this.ready = true;


      },

    watch: {
      selected(newVal){
        if ( this.tabs[newVal] ){
          if ( this.currentURL !== this.tabs[newVal].current ){
            this.currentURL = this.tabs[newVal].current;
          }
          $.each(this.tabs, (i, a) => {
            if ( this.tabs[i].selected !== (i === newVal) ){
              this.tabs[i].selected = (i === newVal);
            }
          });
          let historyIndex = $.inArray(this.tabs[newVal].url, this.history);
          if ( historyIndex > -1 ){
            this.history.splice(historyIndex, 1);
          }
          if ( this.history.length >= this.historyMaxLength ){
            this.history.pop();
          }
          this.history.unshift(this.tabs[newVal].url);
          this.navigate();
          for ( let ev in this.tabs[newVal].events ){
            this.$emit(ev, this.tabs[newVal].events[ev]);
            delete this.tabs[newVal].events[ev];
          }
        }
      },
      currentURL(newVal, oldVal){
        if ( newVal !== oldVal ){
          bbn.fn.log("NEW URL", newVal);
          if ( this.isValidIndex(this.selected) ){
            var vm = this,
                tab = bbn.vue.getChildByKey(vm, vm.tabs[vm.selected].url, 'bbn-container');
            bbn.fn.log("IS VALID", tab);
            if (
              tab &&
              (vm.tabs[vm.selected].current !== newVal) &&
              (newVal.indexOf(vm.tabs[vm.selected].url) === 0)
            ){
              vm.tabs[vm.selected].current = newVal;
            }
            // CHECKING PARENTS
            if ( vm.parents.length ){
              bbn.fn.log("CHANGING URL");
              vm.parents[0].currentURL = vm.baseURL + newVal;
            }
            else if ( this.autoload && this.ready ){
              this.setConfig();
            }
          }
        }
        this.$forceUpdate();
        //bbn.fn.log("A change in tabs")
        //var vm = this;
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
    },
    components: {
      'bbns-loader': {
        name: 'bbns-loader',
        props: ['source']
      },
    }
  });

})(jQuery, bbn, Vue);
