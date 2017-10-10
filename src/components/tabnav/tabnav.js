/**
 * Created by BBN on 15/02/2017.
 */
(function($, bbn, kendo){
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
  Vue.component('bbn-tabnav', {
    template: '#bbn-tpl-component-tabnav',
    mixins: [bbn.vue.resizerComponent],
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
      source: {
        type: Array,
        default: function(){
          return [];
        }
      }
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
        currentURL: '',
        baseURL: baseURL ? baseURL + '/' : '',
        tabs: [],
        parents: [],
        parentTab: false,
        selected: false,
        isMounted: false
      };
    },

    computed: {
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
              var $panel = misc.is("div.bbn-tab") ? misc : misc.closest("div.bbn-tab");
              // If the element is in full screen mode
              if ( $panel.hasClass('bbn-tab-full-screen') ){
                var $prev = $(".bbn-tab-before-full-screen:first", vm.el);
                misc = $prev.is("div.bbn-tab") ?
                  $(vm.$el).children("div.bbn-tab,div.bbn-loader").index($prev) + 1 : 0;
              }
              else if ( $panel.length ){
                misc = $(vm.$el).children("div.bbn-tab,div.bbn-loader").index($panel);
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
          return this.$refs['tab-' + idx];
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
        //bbn.fn.log("url before parse: " + url);
        url = vm.parseURL(url);
        //bbn.fn.log("url after parse: " + url);
        // either the requested url or the url corresponding to the target index

        // No URL has been given -> we activate the default tab
        if ( !url ){
          bbn.fn.log("activateDefault with no url ");
          return vm.activateDefault();
        }
        idx = vm.getIndex(url);
        bbn.fn.log("ACTIVATE", url, idx);
        // No index found: loading or error
        if ( !vm.isValidIndex(idx) ){
          for ( var i = 0; i < vm.tabs.length; i++ ){
            if (
              ((url + '/').indexOf(vm.tabs[i].url) === 0) &&
              (subtab = vm.getSubTabNav(i))
            ){
              bbn.fn.log("SUBTAB", subtab);
              vm.selected = i;
              return subtab.activate(url);
            }
          }
          // autoload is set to true we launch the link function which will activate the newly created tab
          if ( vm.autoload ){
            //alert(url);
            //bbn.fn.log("link from autoload: " + url);
            vm.load(url);
          }
          else{
            bbn.fn.log(vm.$el);
            new Error(
              "Impossible to find an index for " + url + " in element with baseURL " +
              vm.getFullBaseURL()
            );
          }
        }
        // Index exists but content not loaded yet
        else if ( vm.tabs[idx].load && !vm.tabs[idx].disabled ){
          //vm.selected = idx;
          vm.load(url);
        }
        else if ( !vm.tabs[idx].disabled ){
          var subtab = vm.getSubTabNav(idx);
          if ( subtab && subtab.isMounted ){
            subtab.activate(vm.getFullBaseURL() + url);
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
        bbn.fn.log("CLOSING", idx);
        if ( this.tabs[idx] ){
          let ev = $.Event();
          if ( !force ){
            this.$emit('close', idx, ev);
          }
          if ( !ev.isDefaultPrevented() || force ){
            this.tabs.splice(idx, 1);
            this.selected = false;
            if ( this.tabs.length ){
              this.$nextTick(() => {
                this.activateIndex(this.tabs[idx] ? idx : idx - 1);
              })
            }
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
          if ( !obj.menu ){
            obj.menu = [];
          }
          if ( obj.help ){
            obj.menu.push({
              text: bbn._("Help"),
              key: "help",
              icon: "zmdi zmdi-info",
              command: () => {
                let tab = this.getVue(obj.idx);
                tab.getPopup().open('<div class="bbn-padded">' + obj.help + '<div>', bbn._("Help") + ': ' + obj.title);
              }
            })
          }
          if ( vm.autoload ){
            obj.menu.push({
              text: bbn._("Reload"),
              key: "reload",
              icon: "fa fa-refresh",
              command: () => {
                this.reload(obj.idx);
              }
            });
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
            if ( (vm.tabs.length === 1) && vm.isMounted ){
              vm.activateIndex(0);
            }
          }
        }
      },

      search(url){
        var r = bbn.fn.search(this.tabs, "url", url, "starts");
        return r === -1 ? false : r;
      },

      load(url){
        const vm = this;
        var idx = vm.search(url),
            finalURL = vm.fullBaseURL + url;
        if ( vm.isValidIndex(idx) && vm.tabs[idx].real ){
          finalURL = vm.tabs[idx].real;
        }
        return bbn.fn.post(finalURL, {_bbn_baseURL: vm.fullBaseURL}, (d) => {
          if ( d.content ){
            if ( !d.url ){
              d.url = url;
            }
            d.url = vm.parseURL(d.url);
            d.loaded = true;
            d.load = false;
            idx = vm.search(d.url);
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

      getMenuFn(idx){
        return () => {
          return this.tabs[idx].menu || [];
        }
      },

      reload(idx){
        var vm = this;
        vm.$set(vm.tabs[idx], "load", true);
        vm.$nextTick(function(){
          vm.activateIndex(idx);
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
              if (!vm.colorIsDone) {
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

    },

    /*
    render(createElement){
      var vm = this;

      if ( !vm.rendered ){
        vm.rendered = true;
        // Examine the default slot, and if there are any parse
        // them and add the data to the workingList
        $.each(vm.source, function(i, obj){
          if ( obj.url ){
            vm.add(obj);
          }
        });
      }

      var tabs = [],
          containers = [];
      $.each(vm.tabs, (i, obj) => {
        var cfg = {
              ref: "tab-" + i,
              'class': {
                'k-item': true,
                'k-state-default': true,
                'bbn-tabnav-static': !!obj.static,
                'k-state-active': obj.selected,
                'k-last': i === (vm.tabs.length - 1),
                'k-first': i === 0
              },
              on: {
                click: function(){
                  if ( i !== vm.selected ){
                    vm.activateIndex(i)
                  }
                }
              }
            },
            title_cfg = {
              ref: "title-" + i,
              'class': {
                'k-link': true
              },
              domProps: {
                innerHTML: obj.title
              }
            },
            selected_cfg = {
              ref: "selector-" + i,
              'class': {
                'bbn-tabnav-selected': true
              },
            };
        if ( obj.bcolor ){
          cfg.style = {
            backgroundColor: obj.bcolor
          };
        }
        if ( obj.fcolor ){
          if ( !cfg.style ){
            cfg.style = {};
          }
          cfg.style.color = obj.fcolor;
          title_cfg.style = {
            color: obj.fcolor
          };
          selected_cfg.style = {
            backgroundColor: obj.fcolor
          };
        }
        tabs.push(createElement('li', cfg, [
          createElement('span', {
            ref: "spinner-" + i,
            'class': {
              'k-loading': true,
              'k-complete': true
            }
          }),
          createElement('span', title_cfg),
          createElement('div', selected_cfg),
          createElement('div', {
            'class': {
              'bbn-tabnav-icons': true
            }
          }, [
            createElement('i', {
              'class': {
                fa: true,
                'fa-times-circle': true,
                'bbn-p': true
              },
              on: {
                click: function(){
                  vm.close(i)
                }
              }
            }),
            createElement('bbn-context', {
              'class': {
                fa: true,
                'fa-caret-down': true,
                'bbn-p': true
              },
              props: {
                tag: 'i',
                source: obj.menu || []
              },
            }),
          ])
        ]));
        // Rendering only the loader if load is true or if the tab doesn't need yet to be rendered
        if ( obj.load || (!obj.selected && !obj.loaded) ){
          containers.push(createElement('bbn-loader', {
            ref: 'container-' + i,
            props: {
              source: obj
            }
          }));
        }
        else{
          containers.push(createElement('bbn-tab', {
            ref: 'container-' + i,
            props: obj,
            key: obj.url
          }));
          // If the tab is rendered for the first time, we set it as loaded
          if ( !obj.load && !obj.loaded ){
            obj.loaded = true;
          }
        }
      });

      let ulCfg = {
        'class': {
          'k-reset': true,
          'k-tabstrip-items': true,
          'k-header': true,
          'bbn-tabnav-tabs': true
        },
        ref: 'tabgroup'
      },
      ulNode = createElement('ul', ulCfg, tabs);

      containers.unshift(ulNode);

      if ( vm.scrollable ){
        containers.push(createElement('span', {
          'class': {
            'k-button': true,
            'k-button-icon': true,
            'k-button-bare': true,
            'k-tabstrip-prev': true
          },
          on: {
            click: function(e){
              vm.scrollTabs('left', ulNode.elm);
            }
          }
        }, [
          createElement('i', {
            'class': {
              'fa': true,
              'fa-angle-left': true,
              'bbn-p': true
            }
          })
        ]));
        containers.push(createElement('span', {
          'class': {
            'k-button': true,
            'k-button-icon': true,
            'k-button-bare': true,

            'k-tabstrip-next': true
          },
          on: {
            click: function(e){
              vm.scrollTabs('right', ulNode.elm);
            }
          }
        }, [
          createElement('i', {
            'class': {
              'fa': true,
              'fa-angle-right': true,
              'bbn-p': true
            }
          })
        ]));
      }


      return createElement('div', {
        'class': {
          'bbn-tabnav': true,
          'k-widget': true,
          'k-header': true,
          'k-tabstrip': true,
          'k-floatwrap': true,
          'k-tabstrip-top': true,
          'k-tabstrip-scrollable': vm.scrollable
        }
      }, containers);
    },
    */

    created(){
      // Adding bbn-tab from the slot
      if ( this.$slots.default ){
        for ( var node of this.$slots.default ){
          bbn.fn.info("NODE", node);
          if (
            node &&
            (node.tag === 'bbn-tab') &&
            node.data.attrs.url
          ){
            this.add(node.data.attrs);
          }
        }
      }
      $.each(this.source, (i, obj) => {
        if ( obj.url ){
          this.add(obj);
        }
      });
    },

    mounted(){
      var vm = this,
          parent = vm.$parent;
      // Looking for a parent tabnav to put in parentTab && parents props
      while ( parent ){
        if (
          parent.$vnode &&
          parent.$vnode.componentOptions
        ){
          if ( !vm.parentTab && (parent.$vnode.componentOptions.tag === 'bbn-tab') ){
            vm.parentTab = parent;
          }
          else if ( parent.$vnode.componentOptions.tag === 'bbn-tabnav' ){
            vm.parents.push(parent);
          }
        }
        parent = parent.$parent;
      }
      // If there is a parent tabnav we automatically give the proper baseURL
      if ( vm.parents.length ){
        var tmp = vm.parents[0].getURL(vm.parentTab.idx);
        if ( vm.baseURL !== (tmp + '/') ) {
          vm.baseURL = tmp + '/';

          /*
          if (vm.parents.autoload && (tmp.indexOf(vm.baseURL) === 0)) {
            vm.parents.setURL(vm.baseURL, vm.$el);
            vm.currentURL = tmp.substr(vm.baseURL.length + 1);
          }
          */
        }
      }
      // We make the tabs reorderable
      var $tabgroup = $(vm.$refs.tabgroup),
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

      vm.activate(vm.parseURL(bbn.env.path), true);
      vm.isMounted = true;
      vm.$emit("ready");
    },

    watch: {
      selected(newVal){
        var vm = this;
        if ( vm.tabs[newVal] ){
          if ( vm.currentURL !== vm.tabs[newVal].current ){
            vm.currentURL = vm.tabs[newVal].current;
          }
          $.each(vm.tabs, function(i, a){
            if ( vm.tabs[i].selected !== (i === newVal) ){
              vm.$set(vm.tabs[i], "selected", (i === newVal));
            }
          });
          vm.navigate();
          vm.$nextTick(() => {
            vm.$emit("resize");
            bbn.fn.log("EMITTING FROM TABNAV");
            bbn.fn.analyzeContent(vm.$el, true);
          })
        }
      },
      currentURL(newVal, oldVal){
        if ( newVal !== oldVal ){
          bbn.fn.log("NEW URL", newVal);
          if ( this.isValidIndex(this.selected) ){
            var vm = this,
                tab = bbn.vue.getChildByKey(vm, vm.tabs[vm.selected].url, 'bbn-tab');
            bbn.fn.log("IS VALID", tab);
            if (
              tab &&
              (vm.tabs[vm.selected].current !== newVal) &&
              (newVal.indexOf(vm.tabs[vm.selected].url) === 0)
            ){
              vm.$set(vm.tabs[vm.selected], "current", newVal);
            }
            // CHECKING PARENTS
            if ( vm.parents.length ){
              bbn.fn.log("CHANGING URL");
              vm.parents[0].$set(vm.parents[0], "currentURL", vm.baseURL + newVal);
            }
          }
        }
        this.$forceUpdate();
        //bbn.fn.log("A change in tabs")
        //var vm = this;
      },
    },
    components: {
      'bbn-loader': {
        name: 'bbn-loader',
        props: ['source']
      },
      'bbn-tab': {
        name: 'bbn-tab',
        mixins: [bbn.vue.resizerComponent],
        props: {
          title: {
            type: [String, Number],
            default: bbn._("Untitled")
          },
          hasPopups: {
            type: Boolean,
            default: false
          },
          componentAttributes: {
            type: Object,
            default(){
              return {}
            }
          },
          idx: {},
          component: {},
          icon: {
            type: String
          },
          content: {
            type: String,
            default: ""
          },
          load: {
            type: Boolean,
            default: false
          },
          selected: {
            type: [Boolean, Number],
            default: false
          },
          css: {
            type: String,
            default: ""
          },
          source: {
            type: [Array, Object],
            default: function(){
              return {};
            }
          },
          help: {
            type: String
          },
          script: {},
          static: {
            type: [Boolean, Number],
            default: false
          },
          pinned: {
            type: [Boolean, Number],
            default: false
          },
          url: {
            type: [String, Number]
          },
          current: {
            type: [String, Number]
          },
          real: {
            type: String
          },
        },

        methods: {
          setCurrent(url){
            const vm = this;
            if ( url.indexOf(vm.url) === 0 ){
              vm.tabNav.activate(url);
            }
          },
          getPopup(){
            return Array.isArray(this.$refs.popup) ? this.$refs.popup[0] : this.$refs.popup;
          },
          popup(){
            if ( arguments.length ){
              this.getPopup().open.apply(this.getPopup(), arguments)
            }
            else{
              return this.getPopup();
            }
          },
          getComponent(){
            for ( let i = 0; i < this.$children.length; i++ ){
              if ( this.$children[i].$options._componentTag !== 'bbn-popup' ){
                return this.$children[i];
              }
            }
            return false;
          },
          getSubTabNav(ele){
            if ( ele === undefined ){
              ele = this;
            }

            var recurse = function(el){
              if ( el.$options && el.$options._componentTag && (el.$options._componentTag === "bbn-tabnav") ){
                return el;
              }
              if ( el.$children ){
                for ( var i = 0; i < el.$children.length; i++ ){
                  var r = recurse(el.$children[i]);
                  if ( r ){
                    return r;
                  }
                }
              }
              return false;
            };
            return recurse(ele);
          },
          addMenu(obj){
            var vm = this;
            if (
              (vm.idx > -1) &&
              obj.text &&
              vm.$parent.tabs &&
              vm.$parent.tabs[vm.idx]
            ){
              var menu = vm.$parent.tabs[vm.idx].menu || [];
              if ( !obj.key ){
                obj.key = bbn.fn.randomInt(99,99999999999);
              }
              menu.push(obj);
              vm.$parent.$set(vm.$parent.tabs[vm.idx], "menu", menu);
              return obj.key;
            }
            return false;
          },
          deleteMenu(key){
            var vm = this;
            if (
              (vm.idx > -1) &&
              vm.$parent.tabs &&
              vm.$parent.tabs[vm.idx]
            ){
              var menu = vm.$parent.tabs[vm.idx].menu || [],
                  idx = bbn.fn.search(menu, "key", key);
              if ( idx > -1 ){
                bbn.fn.log("deleteMenu", idx, menu);
                menu.splice(idx, 1);
                vm.$parent.$set(vm.$parent.tabs[vm.idx], "menu", menu);
                vm.$parent.$forceUpdate();
                return true;
              }
            }
            return false;
          }
        },

        data(){
          return {
            tabNav: null,
            isComponent: null,
            name: bbn.fn.randomString(20, 15).toLowerCase(),
            isMounted: false,
            popups: []
          };
        },

        created(){
          if ( this.isComponent === null ){
            this.onMount = () => {
              return false;
            };
            let res;
            if ( this.script ){
              res = typeof this.script === 'string' ? eval(this.script) : this.script;
              if ( $.isFunction(res) ){
                this.onMount = res;
                this.isComponent = false;
              }
              else if ( typeof(res) === 'object' ){
                this.isComponent = true;
              }
            }
            if ( this.isComponent ){
              bbn.fn.extend(res ? res : {}, {
                name: this.name,
                template: '<div class="bbn-full-screen">' + this.content + '</div>',
                methods: {
                  getTab: () => {
                    return this;
                  },
                  popup: this.popup,
                  addMenu: this.addMenu,
                  deleteMenu: this.deleteMenu
                },
                props: ['source']
              });
              this.$options.components[this.name] = res;
            }
            else{
              this.isComponent = false;
            }
          }
        },

        mounted: function(){
          this.tabNav = bbn.vue.closest(this, ".bbn-tabnav");
          if ( !this.isComponent ){
            this.onMount(this.$el, this.source);
          }
          this.isMounted = true;
          this.$emit("ready");
        }
      }
    }
  });

})(jQuery, bbn, kendo);
