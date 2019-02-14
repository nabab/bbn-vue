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
   * @param {string} orientation - The position of the views' titles: top (default) or bottom.
   * @param {string} root - The root URL of the tabNav, will be only taken into account for the top parents'
   * tabNav, will be automatically calculated for the children.
   * @param {boolean} scrollable - Sets if the views' titles will be scrollable in case they have a greater width
   * than the page (true), or if they will be shown multilines (false, default).
   * @param {array} source - The views shown at init.
   * @param {string} currentURL - The URL to which the tabnav currently corresponds (its selected tab).
   * @param {string} baseURL - The parent TabNav's URL (if any) on top of which the tabNav has been built.
   * @param {array} parents - The views shown at init.
   * @param {array} views - The views configuration and state.
   * @param {boolean} parentTab - If the tabNav has a tabNav parent, the tab Vue object in which it stands, false
   * otherwise.
   * @param {boolean|number} selected - The index of the currently selected tab, and false otherwise.
   */
  Vue.component("bbn-router", {
    mixins: [bbn.vue.basicComponent],
    props: {
      auto: {
        type: Boolean,
        default: true
      },
      url: {
        type: String,
        default: ''
      },
      autoload: {
        type: Boolean,
        default: true
      },
      root: {
        type: String,
        default: ''
      },
      def: {
        type: String
      },
      source: {
        type: Array,
        default(){
          return [];
        }
      },
    },

    data(){
      let baseURL = this.setBaseURL(this.root);
      return {
        // Real Cntainers are the bbn-container in the slot
        hasRealContainers: false,
        // Fake containers are the bbns-container in the slot
        hasFakeContainers: false,
        // The array of containers defined in the source
        cfgViews: [].concat(this.source),
        // The views from the slot?
        slotViews: [],
        // All the views
        views: [],
        // All the URLS of the views
        urls: {},
        // current URL of the router
        currentURL: this.url || '',
        // relative root of the router (set by user or by parent router)
        baseURL: this.setBaseURL(this.root),
        // An array of the parents router
        parents: [],
        // The direct parent router if there is one
        parent: null,
        // The root router or the current one it's the same
        router: null,
        // The container having the router in if there is one
        parentContainer: null,
        // ????
        visible: true,
        // The currently visible container
        activeContainer: null,
        // set to true each time the router is loading (can only load once at a time)
        isLoading: false
      };
    },

    computed: {
      // Not only the baseURL but a combination of all the parent's baseURLs
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
      // Array of unsaved views
      unsavedViews(){
        return $.map(this.views, (v) => {
          if ( v.isUnsaved ){
            return {
              idx: v.idx,
              url: v.url
            }
          }
          return null;
        });
      },
      // Returns true if there are any unsaved views
      isUnsaved(){
        return !!this.unsavedViews.length;
      }
    },

    methods: {

      // Function used by container to make themselves known when they are mounted
      register(cp){
        if ( cp.url ){
          this.urls[cp.url] = cp;
        }
      },
      // Given a URL returns the existing path of a corresponding view
      get_route(url, force){
        if ( url ){
          let bits = url.split('/');
          while ( bits.length ){
            let st = bits.join('/');
            if ( this.urls[st] ){
              return st;
            }
            bits.pop();
          }
        }
        if ( this.def ){
          return this.def
        }
        if ( this.views.length ){
          return this.views[0].current
        }
        return false;
      },
      // Formats a baseURL correctly (without 1st slash and with end slash
      setBaseURL(baseURL){
        while ( baseURL.substr(-1) === '/' ){
          baseURL = baseURL.substr(0, baseURL.length-1);
        }
        while ( baseURL.substr(0, 1) === '/' ){
          baseURL = baseURL.substr(1);
        }
        return baseURL ? baseURL + '/' : '';
      },
      // Route the router! Sends event beforeRoute (cancellable) and route
      route(url, force){
        if ( this.ready && (force || !this.activeContainer || (url !== this.currentURL)) ){
          let event = new CustomEvent(
            "beforeRoute",
            {
              bubbles: false,
              cancelable: true
            }
          );
          this.$emit("beforeRoute", event, url);
          if ( !event.defaultPrevented ){
            // Checks weather the container is already there
            if ( !url ){
              url = this.get_route('', true);
            }
            let st = url ? this.get_route(url) : '';
            bbn.fn.log("ROUTING FUNCTION EXECUTED", st, url);
            if ( !url ){
              return;
            }
            if ( url && ((!st && this.autoload) || (this.urls[st] && this.urls[st].load)) ){
              this.load(url);
              bbn.fn.log("LOADING");
            }
            // Otherwise the container is activated ie made visible
            else {
              bbn.fn.log("LOADED", url);
              if ( !st && this.def && (!url || force)){
                st = this.get_route(this.def);
                if ( st ){
                  url = this.def;
                }
              }
              if ( !st && force && this.views.length ){
                st = this.views[0].url;
                if ( st ){
                  url = this.views[0].current || st;
                }
              }
              if ( st ){
                bbn.fn.log("REAL ROUTING GOING ON...................", st);
                this.currentURL = url;
                this.activate(url, this.urls[st]);
                this.$emit("route", url);
              }
            }
          }
        }
      },

      /**
       * Looks for a subrouter and route through it if found.
       *
       * @param container
       */
      updateView(container){
        // Looking for a subrouter in the activated container
        let subRouter = this.getSubRouter();
        if ( subRouter ){
          // If so routing also this container
          bbn.fn.log("FROM UPDATEVIEW");
          subRouter.route(container.currentURL);
        }
        else{
          if ( this.$children.length && !this.currentURL && this.auto ){
            bbn.fn.log("ROUTER FROM UPDATEVIEW");
            this.route(this.url, true);
          }
        }
      },

      /**
       * Shows the container with the corresponding URL and hide all others.
       *
       * @param url
       * @param container
       */
      activate(url, container){
        let todo = false;
        bbn.fn.log("ACTIVATING", url, container, this.activeContainer);
        if ( !this.activeContainer || (container && (this.activeContainer !== container)) ){
          this.activeContainer = null;
          bbn.fn.each(this.$children, (cp) => {
            if ( bbn.fn.isFunction(cp.hide) ){
              if ( (cp !== container) ){
                bbn.fn.log(cp);
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
          }
        }
        else if ( url !== this.activeContainer.currentURL ){
          this.activeContainer.setCurrent(url);
        }
        bbn.fn.log("ACTIVATED?", this.activeContainer);
      },

      /**
       * Function triggered every time a container is shown (at the start of the animation) to change the URL if needed.
       */
      enter(){
        bbn.fn.log("ENTER!!");
      },

      changeURL(url, title, replace){
        bbn.fn.log("CHANGE URL", url);
        if ( this.parent ){
          this.parent.changeURL(this.baseURL + url, title, replace);
        }
        else {
          bbn.fn.setNavigationVars(this.getFullBaseURL() + url, title, replace);
        }
      },

      /**
       * Returns the baseURL property.
       *
       * @returns {string}
       */
      getBaseURL(){
        return this.baseURL;
      },

      /**
       * Returns a string of all the baseURL properties till root.
       *
       * @returns {string}
       */
      getFullBaseURL(){
        return this.fullBaseURL;
      },

      /**
       * Returns the full URL from the root router (without the hostname)
       *
       * @returns {string}
       */
      getFullURL(){
        let url = this.getURL();
        if ( url !== false ){
          return this.getFullBaseURL() + url;
        }
        return '';
      },

      /**
       * Returns the current URL of the current router
       *
       * @returns {string}
       */
      getCurrentURL(){
        return this.activeContainer ? this.activeContainer.currentURL : '';
      },

      /**
       * Returns the full current URL from the root router (without the hostname)
       *
       * @returns {string}
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
       *
       * @param fullURL
       * @returns {string}
       */
      parseURL(fullURL){
        if ( fullURL === undefined ){
          return '';
        }
        if ( typeof(fullURL) !== 'string' ){
          fullURL = fullURL.toString();
        }
        if ( fullURL.indexOf(bbn.env.root) === 0 ){
          fullURL = fullURL.substr(bbn.env.root.length);
        }
        fullURL = bbn.fn.removeTrailingChars(fullURL, '/');
        bbn.fn.log("PARSING", fullURL, this.fullBaseURL);
        if ( (this.fullBaseURL === (fullURL + '/'))  || (fullURL === '') ){
          return '';
        }
        if ( this.fullBaseURL && (fullURL.indexOf(this.fullBaseURL) === 0) ){
          fullURL = fullURL.substr(this.fullBaseURL.length);
        }
        return fullURL;
      },

      isValidIndex(idx){
        return this.views[idx] !== undefined;
      },

      /**
       * Activates the default view, or the first one if no default
       */
      activateDefault(){
        let idx = vm.getIndex('', true);
        if ( this.isValidIndex(idx) ){
          //bbn.fn.log("ACTIVATE6", this.views[idx].current ? this.views[idx].current : this.views[idx].url);
          this.activate(this.views[idx].current ? this.views[idx].current : this.views[idx].url);
        }
      },

      activateIndex(idx){
        if ( this.isValidIndex(idx) ){
          //bbn.fn.log("ACTIVATE7", this.views[idx].current);
          this.activate(this.views[idx].current);
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

      // Returns the corresponding container's component's DOM element
      getContainer(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        let c = this.getVue(idx);
        return c ? c.$el : false;
      },

      // Returns the next router in the corresponding container if there's any
      getSubRouter(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        let container = this.getVue(idx);
        if ( container ){
          return container.find('bbn-router') || null;
        }
        return null;
      },

      getRealVue(idx){
        let tabnav = this,
            sub = tabnav;
        if ( idx === undefined ){
          idx = this.selected;
        }
        while ( tabnav ){
          tabnav = sub.getSubRouter(idx);
          if ( tabnav ){
            sub = tabnav;
            idx = sub.selected;
          }
        }
        return sub.getVue(idx);
      },

      add(obj_orig, idx){
        let obj = $.extend({}, obj_orig),
            index;
        //obj must be an object with property url
        if (
          (typeof(obj) === 'object') &&
          obj.url &&
          ((idx === undefined) || this.isValidIndex(idx) || (idx === this.views.length))
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
          if ( !obj.current ){
            obj.current = obj.url;
          }
          obj.isUnsaved = false;
          obj.events = {};
          if ( !obj.menu ){
            obj.menu = [];
          }
          bbn.fn.log("ADD", obj.url);
          index = this.search(obj.url);
          if ( index !== false ){
            if ( this.views[index] && this.views[index].slot ){
              return;
            }
            if ( idx === undefined ){
              idx = index;
            }
            obj.idx = idx;
            obj.selected = index === this.selected;
            // If the tab exists we remove it
            bbn.fn.iterate(this.views[index], (v, n) => {
              if ( obj[n] === undefined ){
                obj[n] = v;
              }
            })
            this.views.splice(index, 1, obj);
          }
          else{
            obj.selected = false;
            obj.idx = idx === undefined ? this.views.length : idx;
            this.views.push(obj);
          }
        }
      },

      search(url){
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

      load(url, force){
        if ( !this.isLoading ){
          let finalURL = this.fullBaseURL + url;
          let idx = this.search(url);
          if ( idx !== false ){
            if ( this.views[idx].slot || this.views[idx].loading ){
              return;
            }
            if ( !force && !this.views[idx].load ){
              return;
            }
            else{
              this.views[idx].loading = true;
            }
          }
          else{
            this.add({url: url, title: bbn._('Loading'), load: true, loading: true, visible: true, current: url, error: false, state: 'loading'});
          }
          this.isLoading = true;
          return bbn.fn.post(finalURL, {_bbn_baseURL: this.fullBaseURL}, (d) => {
            this.isLoading = false;
            if ( d.url ){
              d.url = this.parseURL(d.url);
            }
            else{
              d.url = url;
            }
            d.current = url;
            if ( d.data ){
              d.source = d.data;
              delete d.data;
            }
            this.add($.extend(d, {slot: false, loading: false, load: false, loaded: true, state: 'loaded'}));
            this.$nextTick(() => {
              bbn.fn.log("ROUTER LOAD ", d.current);
              this.route(d.current, true);
            })
          }, (xhr, textStatus, errorThrown) => {
            this.isLoading = false;
            /*
            if ( this.isValidIndex(idx) ){
              this.views[idx].state = xhr.status;
              this.views[idx].error = errorThrown;
              this.views[idx].loading = false;
              this.views[idx].loaded = true;
              this.views[idx].menu = false;
              this.views[idx].title = bbn._('Error') + ' ' + xhr.status;
              if ( this.views[idx].load !== false ){
                this.views[idx].load = null;
              }
              this.navigate(url);
              this.activate(url);
            }
            */
            //bbn.fn.log(arguments)
          }, () => {
            this.isLoading = false;
          })
        }
      },

      reload(idx){
        let subtabnav = this.getSubRouter(idx);
        if ( subtabnav && subtabnav.autoload ){
          let cfg = this.getConfig(subtabnav);
          if ( cfg && cfg.views ){
            this.views[idx].cfg = cfg;
          }
        }
        if ( this.views[idx].load !== false ){
          this.views[idx].load = true;
        }
        if ( this.views[idx].imessages ){
          this.views[idx].imessages.splice(0, this.views[idx].imessages.length);
        }
        this.$nextTick(() => {
          this.activateIndex(idx);
        })
      },

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
            cp = cp.parentTab.tabNav;
            while ( cp ){
              res += ' < ' + (cp.views[idx].title || bbn._('Untitled'));
              if ( cp.parentTab ){
                idx = cp.parentTab.idx;
                cp = cp.parentTab.tabNav;
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
    },

    mounted(){
      // Adding bbns-tab from the slot
      if ( this.$slots.default ){
        for ( let node of this.$slots.default ){
          if ( node.componentOptions ){
            if (
              !this.hasFakeContainers &&
              (node.componentOptions.tag === 'bbn-container')
            ){
              if ( !this.hasRealContainers ){
                this.hasRealContainers = true;
              }
              this.add($.extend({slot: true}, node.componentOptions.propsData));
            }
            else if (
              !this.hasRealContainers &&
              (node.componentOptions.tag === 'bbns-container')
            ){
              if ( !this.hasFakeContainers ){
                this.hasFakeContainers = true;
              }
              let o = {slot: false};

              /*
              bbn.fn.info(node.$slots.default.innerHTML);
              let st = node.$el.innerHTML.trim();
              if ( st ){
                o.content = st;
              }
              */
              bbn.fn.log("EL", node.componentInstance);
              if ( node.componentInstance && node.componentInstance.template ){
                o.content = node.componentInstance.template;
              }
              this.add($.extend(o, node.componentOptions.propsData));
            }
          }
        }
      }

      this.parents = this.ancesters('bbn-router');
      this.parent = this.parents.length ? this.parents[0] : false;
      this.router = this.parents.length ? this.parents[this.parents.length-1] : this;
      let url;
      // If there is a parent router we automatically give the proper baseURL
      if ( this.parent ){
        this.parentContainer = this.closest('bbn-container');
        this.baseURL = this.setBaseURL(this.parent.activeContainer.url);
        url = this.parseURL(this.parent.getFullCurrentURL());
        bbn.fn.log("URL FROM PARENT", url);
      }
      if ( !url && this.url ){
        url = this.url;
        bbn.fn.log("URL FROM PROP", url);
      }
      if ( !url ){
        url = this.parseURL(bbn.env.path);
      }
      bbn.fn.each(this.source, (a) => {
        this.add($.extend({slot: false}, a));
      });
      if ( !url ){
        url = this.def || Object.keys(this.urls)[0] || '';
      }
      this.ready = true;
      if ( this.auto ){
        this.$nextTick(() => {
          bbn.fn.log("ROUTER MOUNT");
          this.route(url, true);
        })
      }
    },

    watch: {
      currentURL(newVal, oldVal){
        this.$nextTick(() => {
          this.$emit('change', newVal);
          if ( this.activeContainer ){
            this.changeURL(newVal, this.activeContainer.title);
          }
          else if ( this.isLoading ){
            this.changeURL(newVal, bbn._("Loading"));
          }
        })
      },
      url(newVal){
        if ( this.ready ){
          bbn.fn.log("ROUTER change URL", newVal);
          this.route(newVal);
        }
      },
      isUnsaved(val){
        if ( this.parentTab &&
          this.parentTab.tabNav &&
          this.parentTab.tabNav.views &&
          this.parentTab.tabNav.views[this.parentTab.tabNav.selected]
        ){
          this.parentTab.tabNav.views[this.parentTab.tabNav.selected].isUnsaved = val;
        }
      }
    }
  });

})(jQuery, bbn, Vue);
