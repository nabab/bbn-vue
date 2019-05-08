/**
 * @file bbn-router component
 *
 * @description bbn-router is a component that allows and manages the navigation (url) between the various containers of an application
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
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
    mixins: [bbn.vue.basicComponent, bbn.vue.closeComponent],
    props: {
      // Routes automatically after mount
      auto: {
        type: Boolean,
        default: true
      },
      //
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
        // Number of conatainers registered - as they say it
        numRegistered: 0,
        // Real containers are the bbn-container in the slot
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
        isLoading: false,
        // This will remain false until the first routing
        routed: false,
        // True while the component is in the action of routing
        isRouting: false,
        // False until the first routing
        isInit: false,
        // The index of the currently selected view
        selected: null
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
      dirtyContainers(){
        let r = []
        bbn.fn.iterate(this.urls, (v) => {
          if ( v.dirty ){
            r.push({
              idx: v.idx,
              url: v.url
            });
          }
        });
        return r;
      },
      // Returns true if there are any unsaved views
      isDirty(){
        return !!this.dirtyContainers.length;
      }
    },

    methods: {
      /**
       * Function used by container to make themselves known when they are mounted
       *
       * @param {Vue} cp
       */
      register(cp, fake){
        if ( fake ){
          this.add(cp);
          return;
        }
        this.numRegistered++;
        if ( cp.url && !this.urls[cp.url] ){
          this.urls[cp.url] = cp;
        }
        if ( !this.isInit && (this.numRegistered === this.views.length) ){
          this.isInit = true;
          if ( this.auto ){
            this.route(this.parseURL(this.parent ? this.router.getFullCurrentURL() : bbn.env.path), true);
          }

        }
      },
      /**
       * Function used by container to make themselves known when they are destroyed
       *
       * @param {Vue} cp
       */
      unregister(cp){
        this.numRegistered--;
        if ( cp.url && this.urls[cp.url] ){
          delete this.urls[cp.url];
        }
      },

      /**
       * Given a URL returns the existing path of a corresponding view or false, or the default view if forced
       *
       * @param {String} url
       * @param {Boolean} force
       * @returns {String|false}
       */
      getRoute(url, force){
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
              return st;
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
       * Formats a baseURL correctly (without 1st slash and with end slash
       *
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
          help: null,
          imessages: [],
          script: null,
          static: false,
          pinned: false,
          url: null,
          current: null,
          real: false,
          cfg: {},
          events: {}
        };
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
       * Sends event beforeRoute (cancellable) and launch real routing
       *
       * @param {String} url
       * @param {Boolean} force
       * @returns {void}
       */
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
              let idx = this.getRoute('', true);
              if ( idx ){
                url = this.urls[idx].currentURL;
              }
            }
            let st = url ? this.getRoute(url) : '';
            //bbn.fn.log("ROUTING FUNCTION EXECUTING FOR " + url + " (CORRESPONDING TO " + st + ")");
            if ( !url ){
              return;
            }
            if ( !force && (this.currentURL === url) ){
              //bbn.fn.log("SAME URL END ROUTING");
              return;
            }
            if ( url && ((!st && this.autoload) || (this.urls[st] && this.urls[st].load && !this.urls[st].loaded)) ){
              this.load(url);
            }
            // Otherwise the container is activated ie made visible
            else {
              //bbn.fn.log("LOADED " + url);
              if ( !st && this.def && (!url || force)){
                st = this.getRoute(this.def);
                if ( st ){
                  url = this.def;
                }
              }
              if ( !st && force && this.views.length ){
                st = this.views[0].url;
                if ( st ){
                  url = this.urls[st].currentURL || st;
                }
              }
              if ( st ){
                this.urls[st].setCurrent(url);
                this.realRoute(url, st, force);
              }
            }
          }
        }
      },

      /**
       * Route the router!
       *
       * @param {String} url The URL to route to
       * @param {String} st The URL/key of the container on which we will route
       * @param {Boolean} force
       */
      realRoute(url, st, force){
        if ( st && this.urls[st] ){
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
          this.urls[st].currentURL = url;
          if ( this.urls[st] ){
            this.urls[st].init();
            let child = this.urls[st].find('bbn-router');
            if ( child ){
              //bbn.fn.log("CHILD ROUTER ROUTING: " + url.substr(st.length + 1));
              child.route(url.substr(st.length + 1), force)
            }
            else{
              //this.$emit("route", url);
            }
          }
          else{
            //this.$emit("route", url);
          }
        }
      },

      /**
       * Looks for a subrouter and route through it if found.
       *
       * @param container
       */
      updateView(container){
        return;
        // Looking for a subrouter in the activated container
        let subRouter = this.getSubRouter();
        if ( subRouter ){
          // If so routing also this container
          //bbn.fn.log("FROM UPDATEVIEW");
          subRouter.route(container.currentURL);
        }
        else{
          //bbn.fn.log(container);
          if ( this.$children.length && !this.currentURL && this.auto ){
            //bbn.fn.log("ROUTING " + this.url + " FROM METHOD UPDATEVIEW");
            this.route(this.url, true);
          }
          else{
            //bbn.fn.log("NOT ROUTING " + this.currentURL + " NOR " + this.url + "FROM METHOD UPDATEVIEW");
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
          }
        }
        else if ( url !== this.activeContainer.currentURL ){
          this.activeContainer.setCurrent(url);
        }
        //bbn.fn.log("ACTIVATED " + url + " AND ACTIVATED CONTAINER BELOW:", this.activeContainer);
      },

      /**
       * Function triggered every time a container is shown (at the start of the animation) to change the URL if needed.
       */
      enter(container){
        //bbn.fn.log("THE CONTAINER WILL BE SHOWN: ", container);
      },

      changeURL(url, title, replace){
        //bbn.fn.log("CHANGE URL TO " + url);
        if ( this.parent ){
          this.parent.changeURL(this.baseURL + url, title, replace);
        }
        else if ( replace || (url !== bbn.env.path) ){
          if ( !replace ){
            //bbn.fn.log("NO REPLAACE", this.getFullBaseURL() + url, bbn.env.path);
          }
          if ( !replace && ((this.getFullBaseURL() + url).indexOf(bbn.env.path) === 0) ){
            //bbn.fn.log("REPLACING");
            replace = true;
          }
          bbn.fn.setNavigationVars(this.getFullBaseURL() + url, title, {}, replace);
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
        return this.currentURL;
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
        let url = fullURL;
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
        if ( (this.fullBaseURL === (fullURL + '/'))  || (fullURL === '') ){
          return '';
        }
        if ( this.fullBaseURL && (fullURL.indexOf(this.fullBaseURL) === 0) ){
          fullURL = fullURL.substr(this.fullBaseURL.length);
        }
        //bbn.fn.log("PARSING " + url + ' INTO ' + fullURL + ' with a baseURL like this: ' + this.fullBaseURL);
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
          if ( this.urls[this.views[idx].url] ){
            this.route(this.urls[this.views[idx].url].currentURL);
          }
          else{
            this.route(this.views[idx].current);
          }
        }
      },

      getVue(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        if ( this.isValidIndex(idx) ){
          return this.urls[this.views[idx].url];
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

      getRealVue(misc){
        let idx = this.getIndex(misc);
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

      getIndex(misc){
        if ( !this.views.length ){
          return false;
        }
        if ( misc === undefined ){
          return this.selected;
        }
        if ( !this.isValidIndex(misc) ) {
          if ( typeof(misc) === 'string' ){
            misc = this.search(misc);
          }
          else if ( typeof(misc) === 'object' ){
            // Vue
            if ( misc.$el ){
              misc = $(misc.$el);
            }
            // Not jQuery
            else if ( misc instanceof jQuery ){
              misc = misc[0];
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

      remove(misc, force){
        let idx = this.getIndex(misc);
        if ( (idx > -1) && !this.views[idx].slot ){
          let ev = $.Event('close');
          if ( this.isDirty &&
            this.views[idx].dirty &&
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
                this.remove(idx, true);
              });
            });
          }
          else if ( !force ){
            this.$emit('close', idx, ev);
          }
          if ( !ev.isDefaultPrevented() || force ){
            let t = this.views.splice(idx, 1);
            delete this.urls[t.url];
            bbn.fn.each(this.views, (v, i) => {
              if ( v.idx !== i ){
                v.idx = i;
              }
            });
            if ( this.selected > idx ){
              this.selected = this.selected - 1;
            }
            else if ( this.selected === idx ){
              this.selected = false;
              if ( this.views.length ){
                $.each(this.history, (i, a) => {
                  let tmp = this.getIndex(a);
                  if ( tmp !== false ){
                    idx = tmp;
                    return false;
                  }
                });
                this.activateIndex(this.views[idx] ? idx : idx - 1);
              }
            }
          }
          return true;
        }
        return false;
      },

      add(obj, idx){
        let index;
        //obj must be an object with property url
        //bbn.fn.log("ADDING", obj);
        if (
          (typeof(obj) === 'object') &&
          obj.url &&
          ((idx === undefined) || this.isValidIndex(idx) || (idx === this.views.length))
        ){
          if ( !obj.current ){
            if ( bbn.env.path.indexOf(this.getFullBaseURL() + obj.url + '/') === 0 ){
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
          if ( !obj.menu ){
            obj.menu = [];
          }
          index = this.search(obj.url);
          //bbn.fn.log("ADDING CONTAINER " + obj.current + " (" + index + ")");
          if ( index !== false ){
            let o = this.views[index],
                cn = this.urls[this.views[index].url];
            if ( idx === undefined ){
              idx = index;
            }
            if ( cn ){
              cn.currentIndex = idx;
            }
            if ( obj.real ){
              return;
            }
            bbn.fn.iterate(obj, (a, n) => {
              if ( o[n] !== a ){
                this.$set(o, n, a)
              }
            });
          }
          else{
            obj.selected = false;
            obj.idx = idx === undefined ? this.views.length : idx;
            bbn.fn.iterate(this.getDefaultView(), (a, n) => {
              if ( obj[n] === undefined ){
                this.$set(obj, n, a);
              }
            })
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

      callRouter(url, st){
        if ( this.parent ){
          let containers = this.ancesters('bbn-container');
          url = this.getFullBaseURL().substr(this.router.baseURL.length) + url;
          //bbn.fn.log("CALL ROOT ROUTER WITH URL " + url);
          // The URL of the last bbn-container as index of the root router
          this.router.realRoute(url, containers[containers.length - 1].url, true);
        }
        else{
          this.realRoute(url, st, true);
        }

      },

      load(url, force){
        if ( url ){
          this.isLoading = true;
          let finalURL = this.fullBaseURL + url;
          let idx = this.search(url);
          //bbn.fn.log("START LOADING FN FOR IDX " + idx + " ON URL " + finalURL);
          if ( idx !== false ){
            //bbn.fn.log("INDEX RETRIEVED BEFORE LOAD: " + idx.toString(), this.views[idx].slot, this.views[idx].loading);
            if ( this.views[idx].loading || (!force && !this.views[idx].load) ){
              return;
            }
            this.views[idx].loading = true;
          }
          else{
            this.add({url: url, title: bbn._('Loading'), load: true, loading: true, visible: true, real: false, current: url, error: false, loaded: false});
          }
          this.$emit('update', this.views);
          return bbn.fn.post(finalURL, {_bbn_baseURL: this.fullBaseURL}, (d) => {
            this.isLoading = false;
            //this.remove(url);
            if ( d.url ){
              d.url = this.parseURL(d.url);
            }
            if ( !d.url ){
              d.url = url;
            }
            //bbn.fn.log("URLS", url, d.url);
            if ( url.indexOf(d.url) === 0 ){
              d.current = url;
              //bbn.fn.log("CURRENT DEFINED AS " + d.current);
            }
            if ( d.data ){
              d.source = d.data;
              delete d.data;
            }
            if ( (d.url !== d.current) && this.urls[d.current] ){
              bbn.fn.log("DELETING VIEW CASE");
              this.views.splice(this.urls[d.current].idx, 1);
              delete this.urls[d.current];
            }
            this.$nextTick(() => {
              this.add(bbn.fn.extend(d, {slot: false, loading: false, load: true, real: false, loaded: true}));
              setTimeout(() => {
                if ( !this.urls[d.url] ){
                  throw new Error(bbn._("Impossible to find the container for URL") + ' ' + d.url);
                }
                //bbn.fn.log("LOADED " + d.url, url);
                this.urls[d.url].setLoaded(true);
                // Otherwise the changes we just did on the props wont be taken into account at container level
                this.urls[d.url].init();
                this.callRouter(d.current, d.url);
                this.$emit('update', this.views);
              })
            })
            /*
            setTimeout(() => {
              bbn.fn.log(d.url, d, ';;;;;');
              if ( !this.urls[d.url] ){
                throw new Error(bbn._("Impossible to find the container for URL") + ' ' + d.url);
              }
              this.urls[d.url].setLoaded(true);
              this.urls[d.url].init();
              setTimeout(() => {
                bbn.fn.log("ROUTER LOADED:" + d.current);
                //this.callRouter(d.current, d.url);
              }, 200)
            }, 200)
            */
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
        if (
          this.views[idx] &&
          !this.views[idx].slot &&
          this.views[idx].load &&
          this.urls[this.views[idx].url] &&
          this.urls[this.views[idx].url].isLoaded
        ){
          this.views[idx].loaded = false;
          this.urls[this.views[idx].url].isLoaded = false;
          this.$nextTick(() => {
            this.route(this.urls[this.views[idx].url].currentURL, true);
          })
        }
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
      // All routers above (which constitute the fullBaseURL)
      this.parents = this.ancesters('bbn-router');
      // The closest
      this.parent = this.parents.length ? this.parents[0] : false;
      // The root
      this.router = this.parents.length ? this.parents[this.parents.length-1] : this;
      let url;
      // If there is a parent router we automatically give the proper baseURL
      if ( this.parent ){
        this.parentContainer = this.closest('bbn-container');
        this.baseURL = this.setBaseURL(this.parentContainer.url);
        url = this.parentContainer.currentURL !== this.parentContainer.url ? this.parentContainer.currentURL.substr(this.parentContainer.url.length + 1) : '';
        //bbn.fn.log("URL FROM PARENT: " + url + " (FROM " + this.parentContainer.url + ")");
      }
      else{
        url = this.parseURL(bbn.env.path);
      }
      if ( !url && this.url ){
        url = this.url;
        //bbn.fn.log("URL FROM PROP", url);
      }
      // Adding bbns-tab from the slot
      if ( this.$slots.default ){
        for ( let node of this.$slots.default ){
          if (
            node.componentOptions &&
            (node.componentOptions.tag === 'bbn-container')
          ){
            if ( !this.hasRealContainers ){
              this.hasRealContainers = true;
            }
            let o = {slot: true, load: false, loaded: true};
            if ( url && (url.indexOf(node.componentOptions.propsData.url) === 0) ){
              o.current = url;
            }
            this.add(bbn.fn.extend({}, node.componentOptions.propsData, o));
          }
        }
      }
      bbn.fn.each(this.source, (a) => {
        if ( url && (url.indexOf(a.url) === 0) ){
          a.current = url;
        }
        this.add(bbn.fn.extendOut(a, {slot: false}));
      });
      this.ready = true;
    },

    watch: {
      currentURL(newVal, oldVal){
        this.$nextTick(() => {
          if ( this.activeContainer ){
            this.changeURL(newVal, this.activeContainer.title);
          }
          else if ( this.isLoading ){
            this.changeURL(newVal, bbn._("Loading"));
          }
          let idx = this.search(newVal);
          if ( idx !== false ){
            this.selected = idx;
          }
          this.$emit('change', newVal);
        });
        this.$emit('route', newVal);
      },
      url(newVal){
        if ( this.ready ){
          //bbn.fn.log("ROUTER change URL", newVal);
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
