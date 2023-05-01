/**
 * @file bbn-split-tabs component
 *
 * @description Allows and manages the navigation (url) different routers in a splitter
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */
return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.localStorage
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.localStorage
    ],
    props: {
      // Routes automatically after mount
      /**
       * @prop {Boolean} [true] auto
       */
      auto: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {String} [''] url
       */
      url: {
        type: String,
        default: ''
      },
      /**
       * @prop {Boolean} [true] autoload
       */
      autoload: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Boolean} [false] observer
       */
      observer: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {String} [''] root
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
       * @prop {Array} [[]] source
       */
      source: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * @prop {String} ['horizontal'] orientation
       */
      orientation: {
        type: String,
        default: 'horizontal'
      },
      /**
       * @prop {Boolean} [true] resizable
       */
      resizable: {
        type: Boolean,
        default: true
      }
    },
    data(){
      return {
        registeredChildren: []
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
            this.route(this.getDefaultURL(), true);
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

      registerSubrouter(cp){
        this.registeredChildren.push({
          idx: this.registeredChildren.length,
          cp: cp
        });

      },
      
      unregisterSubrouter(cp){
        let deleted = false;
        bbn.fn.each(this.registeredChildren, (c, i) => {
          if (c.cp === cp) {
            this.registeredChildren.splice(c.idx, 1);
            deleted = true;
          }
          else if (deleted) {
            c.idx--;
          }
        })
      },
      
      retrieveDirtyContainers(){
      // Array of unsaved views
        let r = []
        bbn.fn.iterate(this.urls, v => {
          if ( v.dirty ){
            r.push({
              idx: v.idx,
              url: v.url
            });
          }
        });
        this.dirtyContainers = r;
        this.dirty = this.dirtyContainers.length > 0;
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
        while ( bbn.fn.substr(baseURL, -1) === '/' ){
          baseURL = bbn.fn.substr(baseURL, 0, baseURL.length-1);
        }
        while ( bbn.fn.substr(baseURL, 0, 1) === '/' ){
          baseURL = bbn.fn.substr(baseURL, 1);
        }
        return baseURL ? baseURL + '/' : '';
      },

      getDefaultView(){
        return {
          source: null,
          title: bbn._("Untitled"),
          options: null,
          cached: false,
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
            if ( url && ((!st && this.autoload) || (this.urls[st] && this.urls[st].load && !this.urls[st].isLoaded)) ){
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
          if ( this.urls[st] ){
            this.urls[st].currentURL = url;
            this.urls[st].init();
            this.$nextTick(() => {
              let child = this.urls[st].find('bbn-router');
              if ( child ){
                //bbn.fn.log("CHILD ROUTER ROUTING: " + bbn.fn.substr(url, st.length + 1));
                child.route(bbn.fn.substr(url, st.length + 1), force);
              }
            });
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
          bbn.fn.each(this.$children, cp => {
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
        if ( !bbn.env.isInit ){
          return;
        }
        if ( url !== this.currentURL ){
          this.currentURL = url;
        }
        // Changing the current property of the view cascades on the container's currentURL
        if (this.views[this.selected] && (url.indexOf(this.views[this.selected].url) === 0)){
          this.$set(this.views[this.selected], 'current', url);
        }
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
          fullURL = bbn.fn.substr(fullURL, bbn.env.root.length);
        }
        fullURL = bbn.fn.removeTrailingChars(fullURL, '/');
        if ( (this.fullBaseURL === (fullURL + '/'))  || (fullURL === '') ){
          return '';
        }
        if ( this.fullBaseURL ){
          if (fullURL.indexOf(this.fullBaseURL) === 0){
            fullURL = bbn.fn.substr(fullURL, this.fullBaseURL.length);
          }
          else{
            fullURL = '';
          }
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
              misc = misc.$el;
            }
            if ( misc.tagName ){
              bbn.fn.each(this.$children, ct => {
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
          let ev = new Event('close', {cancelable: true});
          if ( this.isDirty &&
            this.views[idx].dirty &&
            !ev.defaultPrevented &&
            !force
          ){
            ev.preventDefault();
            this.confirm(this.confirmLeave, () => {
              let forms = this.views[idx].findAll('bbn-form');
              if ( Array.isArray(forms) && forms.length ){
                bbn.fn.each(forms, (f, k) => {
                  f.reset();
                });
              }
              this.$nextTick(() => {
                this.$emit('close', idx, ev);
                this.remove(idx, true);
              });
            });
          }
          this.$emit('close', idx, ev);
          if (force || !ev.defaultPrevented) {
            let t = this.views.splice(idx, 1);
            delete this.urls[t.url];
            bbn.fn.each(this.views, (v, i) => {
              if ( v.idx !== i ){
                v.idx = i;
              }
            });
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
              obj.current = bbn.fn.substr(bbn.env.path, this.getFullBaseURL().length);
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
                // Each new property must be set with $set
                this.$set(o, n, a)
              }
            });
          }
          else{
            if (this.single) {
              if (this.views.length){
                this.views.splice(0, this.views.length);
              }
              obj.selected = true;
              obj.idx = this.views.length;
            }
            else{
              obj.selected = false;
              obj.idx = idx === undefined ? this.views.length : idx;
            }
            bbn.fn.iterate(this.getDefaultView(), (a, n) => {
              if ( obj[n] === undefined ){
                // Each new property must be set with $set
                this.$set(obj, n, a);
              }
            });
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

      load(url, force){
        if ( url ){
          this.isLoading = true;
          let finalURL = this.fullBaseURL + url;
          let idx = this.search(url);
          let toAdd = false;
          //bbn.fn.log("START LOADING FN FOR IDX " + idx + " ON URL " + finalURL);
          if ( idx !== false ){
            //bbn.fn.log("INDEX RETRIEVED BEFORE LOAD: " + idx.toString(), this.views[idx].slot, this.views[idx].loading);
            if ( this.views[idx].loading || (!force && !this.views[idx].load) ){
              return;
            }
            if (force){
              toAdd = true;
              this.views.splice(idx, 1);
            }
          }
          else{
            toAdd = true;
            idx = this.views.length;
          }
          if (toAdd){
            this.$nextTick(() => {
              this.add({
                url: url,
                title: bbn._('Loading'),
                load: true,
                loading: true,
                visible: true,
                real: false,
                current: url,
                error: false,
                loaded: false
              }, idx);
            });
          }
          this.$emit('update', this.views);
          return this.post(finalURL, {_bbn_baseURL: this.fullBaseURL}, d => {
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
              //bbn.fn.log("DELETING VIEW CASE");
              this.views.splice(this.urls[d.current].idx, 1);
              delete this.urls[d.current];
            }
            if ( !d.title || (d.title === bbn._('Loading')) ){
              let title = bbn._('Untitled');
              let num = 1;
              while ( bbn.fn.search(this.views, {title: title}) > -1 ){
                num++;
                title = bbn._('Untitled') + ' ' + num;
              }
              d.title = title;
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
            this.alert(textStatus);
            let idx = this.search(this.parseURL(finalURL));
            if ( idx > -1 ){
              let url = this.views[idx].url;
              this.views.splice(this.urls[url].idx, 1);
              delete this.urls[url];
            }
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

      getDefaultURL(){
        // If there is a parent router we automatically give the proper baseURL
        if ( this.url ){
          return this.url;
        }
        else if ( this.parentContainer && (this.parentContainer.currentURL !== this.parentContainer.url) ){
          return bbn.fn.substr(this.parentContainer.currentURL, this.parentContainer.url.length + 1);
        }
        if ( this.def ){
          return this.def;
        }
        else{
          return this.parseURL(bbn.env.path);
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
      this.parents = this.ancestors('bbn-router');
      // The closest
      this.parent = this.parents.length ? this.parents[0] : false;
      // The root
      this.router = this.parents.length ? this.parents[this.parents.length-1] : this;
      if ( this.parent ){
        this.parentContainer = this.closest('bbn-container');
        if (this.parentContainer && this.parentContainer.url) {
          let uri = this.parentContainer.url;
          if (this.root && (uri !== this.root) && (uri.indexOf(this.root) === 0) ){
            uri = this.root;
          }
          bbn.fn.log("URI", uri);
          this.baseURL = this.setBaseURL(uri);
        }
        else{
          bbn.fn.log("NO URI", this.root);
          this.baseURL = this.setBaseURL(this.root);
        }
        this.parent.registerSubrouter(this);
      }
      this.ready = true;
    },

    beforeDestroy() {
      if (this.parent) {
        this.parent.unregisterRouter(this);
      }
    },

    watch: {
      currentURL(newVal, oldVal){
        if ( this.ready ){
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
            }
            this.$emit('change', newVal);
          });
          this.$emit('route', newVal);
          
        }
      },
      url(newVal){
        if ( this.ready ){
          //bbn.fn.log("ROUTER change URL", newVal);
          this.route(newVal);
        }
      }
    }
  };
