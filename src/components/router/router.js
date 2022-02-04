/**
 * @file bbn-router component
 * @description bbn-router is a component that allows and manages the navigation (url) between the various containers of an application
 * @copyright BBN Solutions
 * @author BBN Solutions
 */
(function(bbn, Vue){
  "use strict";

  // Orientations of the thumbnails for visual mode
  const possibleOrientations = [
    {
      name: 'auto',
      text: bbn._("Position automatically")
    }, {
      name: 'left',
      text: bbn._("Position on the left side")
    }, {
      name: 'top',
      text: bbn._("Position on the top side")
    }, {
      name: 'bottom',
      text: bbn._("Position on the bottom side")
    }, {
      name: 'right',
      text: bbn._("Position on the right side")
    }
  ];

  // IndexedDb access for storing thumbnails in visual mode
  let db = false;
  if (bbn.db && bbn.db.ok && window.html2canvas) {
    db = true;
    if (!bbn.db._structures.bbn || !bbn.db._structures.bbn.containers) {
      bbn.db.add('bbn', 'containers', {
        keys: {
          PRIMARY: {
            columns: ['url'],
            unique: true
          }
        },
        fields: {
          url: {

          },
          image: {

          }
        }
      });
    }
  }

  Vue.component("bbn-router", {
    name: 'bbn-router',
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.localStorageComponent
     * @mixin bbn.vue.closeComponent
     * @mixin bbn.vue.observerComponent
     * @mixin bbn.vue.resizerComponent
     */
    mixins:
    [
      bbn.vue.basicComponent,
      bbn.vue.localStorageComponent,
      bbn.vue.closeComponent,
      bbn.vue.observerComponent,
      bbn.vue.resizerComponent,
      bbn.vue.keepCoolComponent
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
      maxTotal: {
        type: Number,
        default: 25
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
       * Set it to true if you want to see the visual navigation bar
       * @prop {Boolean} [false] visual
       */
      visual: {
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
      /**
       * @prop {Boolean} [true] urlNavigation
       */
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
      },
      /**
       * The size of every grid cell on which is based the visual view
       * @prop {Number} [180] visualSize
       */
      visualSize: {
        type: Number,
        default: 180
      },
      /**
       * The position of the visual mini containers
       * @prop {Number} [180] visualSize
       */
      orientation: {
        type: String,
        default(){
          return 'auto'
        },
        validator(v) {
          return !!bbn.fn.getRow(possibleOrientations, {name: v})
        }
      }
    },
    data(){
      return {
        /**
         * IndexedDb connection
         * @return {Object} 
         */
        db: null,
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
        baseURL: this.formatBaseURL(this.root),
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
         * The currently visible container.
         * @data {Vue} [null] activeContainer
         */
        activeContainer: null,
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
         * Number of conatainers registered - as they say it.
         * @data {Number} [0] numRegistered
         */
        numRegistered: 0,
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
        breadcrumbsList: [],
        visualShowAll: false,
        visualOrientation: this.orientation,
        lockedOrientation: false,
        isVisual: this.visual,
        isLoading: false
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
       * @todo Kill this function, there is no anymore tabs component
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
       * The last router i.e. the deepest in the current active container - or this one if none
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
      },

      /**
       * The grid style for showing the router in visual mode
       *
       * @return {Object} 
       */
      visualStyle() {
        if (!this.isVisual) {
          return {};
        }

        return {
          display: 'grid',
          gridColumnGap: '0.5em',
          gridRowGap: '0.5em',
          gridTemplateRows: 'repeat(' + this.numVisualRows + ', 1fr)',
          gridTemplateColumns: 'repeat(' + this.numVisualCols + ', 1fr)'
        }
      },

      /**
       * The number of rows for the visual mode
       *
       * @return {Number} 
       */
      numVisualRows() {
        if (this.isVisual) {
          return Math.ceil(this.lastKnownHeight / this.visualSize);
        }

        return 1;
      },

      /**
       * The number of columns for the visual mode
       *
       * @return {Number} 
       */
       numVisualCols() {
        if (this.isVisual) {
          return Math.ceil(this.lastKnownWidth / this.visualSize);
        }

        return 1;
      },

      /**
       * The number of cells on the side where the thumbnails are shown in the visual mode
       *
       * @return {Number} 
       */
       numVisuals() {
        if (this.isVisual) {
          if (['left', 'right'].includes(this.visualOrientation)) {
            return this.numVisualRows;
          }
          else {
            return this.numVisualCols;
          }
        }
      },


      /**
       * The views to show, in a specific different order, for the visual mode
       *
       * @return {Array} 
       */
      visualList() {
        if (!this.isVisual) {
          return [];
        }

        let moreViewsThanSlots = this.numVisuals < this.views.length;
        let numAvailableSlots = this.numVisuals - (moreViewsThanSlots ? 1 : 0);
        return bbn.fn.map(
          bbn.fn.multiorder(
            this.views,
            {selected: 'desc', static: 'desc', pinned: 'desc', last: 'desc', id: 'desc'}
          ),
          (a, i) => {
            let visible = false;
            if (this.visualShowAll || (i <= numAvailableSlots) || (this.selected === a.index)) {
              visible = true;
            }
            return {
              view: a,
              visible: visible
            }
          }
        );
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
      onContainerView(cp) {
        bbn.fn.log("onContainerView");
        //this.callRouter(cp.current, cp.url);
        if (this.isVisual) {
          this.visualShowAll = false;
          /*
          if (cp.idx) {
            this.activateIndex(cp.idx);
            return;
          }
          */
        }
      },
      /**
       * Removes an element from the views
       * 
       * @method remove
       * @param {*} misc Index, URL or element
       * @param {Boolean} noCfg If set to true will not trigger the storage saving
       * @fires getIndex
       * @fires remove
       * @emit close
       * @return {Boolean}
       */
       remove(misc, noCfg) {
        let idx = this.getIndex(misc);
        if (idx > -1) {
          bbn.fn.log("REMOVE", idx);
          this.views.splice(idx, 1);
          this.fixIndexes();
          if (this.selected > idx) {
            this.selected--;
          }
          else if ( res && (this.selected === idx) ){
            if ( this.views.length ){
              bbn.fn.each(this.history, a => {
                let tmp = this.getIndex(a);
                if ( tmp !== false ){
                  idx = tmp;
                  return false;
                }
              });
              this.selected = this.views[idx] ? idx : idx - 1;
            }
          }
  
          if (!noCfg) {
            this.setConfig();
          }
        }
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
       close(misc, force, noCfg) {
        // Checks it exists among the views
        let idx = this.getIndex(misc);
        if (idx > -1) {
          bbn.fn.log("CLOSE", idx);
          /** @var {Event} onBeforeClose beforeClose event, cancelable only if not force */
          let onBeforeClose = new Event('beforeClose', {cancelable: !force});
          /** @var {Event} onClose close event, cancelable only if not force */
          let onClose = new Event('close', {cancelable: !force});

          this.$emit('beforeClose', idx, onBeforeClose);
          // Force or no prevent default we go ahead
          if (force || !onBeforeClose.defaultPrevented) {
            // If the container is dirty and it's not forced or prevented in some way
            if (
              !this.ignoreDirty &&
              this.isDirty &&
              this.views[idx].dirty &&
              !onClose.defaultPrevented &&
              !force
            ) {
              this.confirm(this.confirmLeave, () => {
                // Looking for dirty ones in registered forms of each container
                let forms = this.urls[this.views[idx].url].forms;
                if ( Array.isArray(forms) && forms.length ){
                  bbn.fn.each(forms, (f, k) => {
                    f.reset();
                  });
                }
                this.$nextTick(() => {
                  this.$emit('close', idx, onClose);
                  this.remove(idx);
                });
              });
            }
            else {
              if (this.views[idx] && this.views[idx].real) {
                /** @todo Check if we accept to close a real container */
                //this.views.splice(idx, 1);
                //this.fixIndexes()
              }
              else {
                if (!force) {
                  this.$emit('close', idx, onClose);
                }

                if (force || !onClose.defaultPrevented) {
                  this.remove(idx, noCfg)
                }

                return true;
              }
            }
          }
        }

        return false;
      },
      /**
       * Adds an object with a valid url to the views
       * 
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
          obj.url = this.sanitizeURL(obj.url);
          // Obj is a container
          if (obj.$options) {
            obj = bbn.fn.extend(true, {}, obj.$options.propsData);
          }
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
            }
            else{
              obj.idx = isValid ? idx : this.views.length;
            }

            bbn.fn.iterate(this.getDefaultView(), (a, n) => {
              if ( obj[n] === undefined ){
                // Each new property must be set with $set
                this.$set(obj, n, a);
              }
            });
            obj.uid = bbn.fn.randomString();
            if (isValid) {
              this.views.splice(obj.idx, 0, obj);
            }
            else {
              this.views.push(obj);
            }
          }
          this.fixIndexes()
          return obj;
        }
      },
      init() {
        if (!this.isInit) {
          this.isInit = true;
          if ( this.auto ){
            this.route(this.single ? cp.url : this.getDefaultURL(), true);
          }
        }
      },
      /**
       * Function used by container to make themselves known when they are mounted.
       * 
       * @method register
       * @param {Vue} cp The container to register
       * @fires add
       * @fires search
       * @fires route
       * @fires getDefaultURL
       */
      register(cp) {
        if (!cp.$options) {
          throw Error(bbn._('The register function needs a component component as argument'));
        }

        if (!bbn.fn.isString(cp.url)) {
          throw Error(bbn._('The component bbn-container must have a URL defined'));
        }

        if (this.urls[cp.url]) {
          throw Error(bbn._('Two containers cannot have the same URL defined (' + cp.url + ')'));
        }

        // Adding the component in urls
        this.urls[cp.url] = cp;
        this.numRegistered = Object.keys(this.urls).length;
        // Checking the container corresponds to an existing view
        let idx = this.search(cp.url);
        // If not adding it
        if (idx === false) {
          this.add(cp);
        }
        else{
          cp.currentIndex = idx;
          // If the router hasn't been yet initialized and that the
          if (this.numRegistered === this.views.length) {
            this.init();
          }
        }

        this.$emit('registered', cp.url);
      },
      /**
       * Function used by container to make themselves known when they are destroyed
       * @method unregister
       * @fires search
       * @fires remove
       * @param {Vue} cp
       */
      unregister(cp) {
        bbn.fn.log("UNREGISTERING " + cp.url);
        if (!bbn.fn.isString(cp.url)) {
          throw Error(bbn._('The component bbn-container must have a URL defined'));
        }
        let idx = this.search(cp.url),
            dataObj = this.postBaseUrl ? {_bbn_baseURL: this.fullBaseURL} : {},
            requestID = bbn.fn.getRequestId(cp.url, dataObj);
        if (bbn.fn.getLoader(requestID)) {
          bbn.fn.abort(requestID);
        }
        if (!cp.url && this.hasEmptyURL) {
          this.hasEmptyURL = false;
        }

        if (this.urls[cp.url] !== undefined) {
          this.$delete(this.urls, cp.url);
          this.numRegistered = Object.keys(this.urls).length;
        }

        if (idx !== false) {
          this.remove(idx);
        }
        if (this.isInit && (this.views.length !== this.numRegistered)) {
          this.isInit = false;
        }
      },
      setSelected(nv, ov) {
        if (ov === undefined) {
          ov = this.selected;
        }

        let newSelected = this.views[nv];
        if (!newSelected) {
          /*
          if (!nv && this.views.length) {
            let tmp = bbn.fn.order(this.views, {last: 'desc'});
            bbn.fn.log("CHOODSING " + tmp[0].url);
            return this.setSelected(tmp[0].idx);
          }
          else {
            */
            throw new Error("There should be a view corresponding to " + nv);
            /*
          }*/
        }

        bbn.fn.map(
          bbn.fn.filter(this.views, {selected: true}),
          a => {
            if (a.idx !== nv) {
              a.selected = false;
              if (this.urls[a.url] && this.urls[a.url].isSelected) {
                this.urls[a.url].isSelected = false;
              }
            }
          }
        );

        if (!newSelected.selected) {
          newSelected.selected = true;
        }

        if (this.urls[newSelected.url]) {
          this.activeContainer = this.urls[newSelected.url];
          if (!this.activeContainer.isSelected) {
            this.activeContainer.isSelected = true;
          }
        }

        this.currentURL = newSelected.current;
        if (newSelected.load && !newSelected.loaded && !newSelected.loading) {
          this.load(newSelected.current);
        }
      },
      /**
       * When the URL changes adds to history and saves in localStorage
       * 
       * @todo Check if it shouldn't be only on the root one
       * @param {String} url
       */
      onRoute(url) {
        if (this.nav) {
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
      },
      /**
       * Sends event beforeRoute (cancellable) and launch real routing if all OK.
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
          throw Error(bbn._("Bad argument in the router's route function"));
        }

        url = this.sanitizeURL(url);
        // We go only if ready,  if fo , 
        if (
          // and either
          this.ready && (
            // if forced
            force
            // if there is not yet a container activated
            || !this.activeContainer
            // or if the url requested if different from the current one
            || (url !== this.currentURL)
          )
        ) {
          // preventable beforeRoute event
          let event = new CustomEvent("beforeRoute",{
            bubbles: false,
            cancelable: true
          });
          this.$emit("beforeRoute", event, url);
          // If not prevented
          if (!event.defaultPrevented) {
            // Looking for a hash
            let bits = url.split('#');
            // url is the first part
            url = bits[0];
	          if ((url === '') && this.hasEmptyURL && this.urls['']) {
              bbn.fn.log("Has empty URL", this.urls['']);
              this.urls[''].setCurrent(url);
              this.realRoute('', '', force);
              return;
            }
            // Checks weather the container is already there
            if (!url) {
              let idx = this.getRoute('', true);
              if (idx && this.urls[idx]) {
                url = this.urls[idx].currentURL;
              }
            }
            let st = url ? this.getRoute(url) : '';
            /** @todo There is asomething to do here */
            bbn.fn.log("ROUTING FUNCTION EXECUTING FOR " + url + " (CORRESPONDING TO " + st + ")", this.currentURL);
            if (!url || (!force && (this.currentURL === url))) {
              if (bits[1]) {
                bbn.fn.log("Should execute a function for hash");

              }
              //bbn.fn.log("SAME URL END ROUTING");
              return;
            }
            // Otherwise the container is activated ie made visible
            else {
              if (url && ((!st && this.autoload) || (this.urls[st] && this.urls[st].load && !this.urls[st].isLoaded))) {
                bbn.fn.log("LOADING " + url);
                this.load(url, force);
                st = url;
              }
              else {
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
              }

              this.$nextTick(() => {
                if (st && this.urls[st]) {
                  bbn.fn.log("REALLY ROUTIUNG " + url);
                  this.urls[st].setCurrent(url);
                  this.realRoute(url, st);
                }
              })
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
      realRoute(url, st) {
        if (!bbn.fn.isString(url) && !bbn.fn.isNumber(url)){
          bbn.fn.log(url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        if (this.urls[st]) {
          if ( url !== this.currentURL ){
            //bbn.fn.log("THE URL IS DIFFERENT FROM THE ORIGINAL " + this.currentURL);
            bbn.fn.log("REAL ROUTING GOING ON FOR " + url);
          }
          this.activate(url, this.urls[st]);
          // First routing, triggered only once
          this.currentURL = url;
          if ( !this.routed ){
            this.routed = true;
            this.$emit("route1", this);
          }
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
          throw Error(bbn._('URL must be a string'));
        }

        if (!this.activeContainer || (container && (this.activeContainer !== container))) {
          this.selected = container.idx;
          this.scrollToTab();
        }
        else if ( url !== this.activeContainer.currentURL ){
          this.activeContainer.setCurrent(url);
        }
      },
      /**
       * Follow up the newly selected tab int tab horizontal scroll
       *
       */
      scrollToTab() {
        if (this.activeContainer
            && this.scrollable
            && this.nav
            && !this.breadcrumb
            && !this.visual
        ) {
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
      },
      /**
       * Calls a parent router if any, and route itself otherwise
       * 
       * @method callRouter
       * @param {String} url
       * @param st
       * @fires getFullBaseURL
       * @fires realRoute
       */
       callRouter(url, st){
        if (!bbn.fn.isString(url) ){
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
        this.$emit('update', this.views);
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
       * Given a URL returns the existing path of a corresponding view or false, or the default view if forced.
       * @method getRoute
       * @param {String} url
       * @param {Boolean} force
       * @fires parseURL
       * @returns {String|false}
       */
       getRoute(url, force){
        if (!bbn.fn.isString(url)) {
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
       * Formats a baseURL correctly (without 1st slash and with end slash.
       * @method formatBaseURL
       * @param {String} baseURL
       * @returns {String}
       */
      formatBaseURL(baseURL){
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
          selected: false,
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
       * Removes double slashes and trimming slashes.
       *
       * @param {*} url
       * @return {*} 
       */
      sanitizeURL(url) {
        if (!bbn.fn.isString(url)) {
          return '';
        }

        url = bbn.fn.replaceAll('//', '/', url);
        if (url.substr(0, 1) === '/') {
          url = url.substr(1);
        }
        if (url.substr(-1) === '/') {
          url.substr(0, url.length - 1);
        }

        return url;
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
       * Checks if the given number corresponds to an index in the views array
       * @method isValidIndex
       * @return {Boolean}
       */
      isValidIndex(idx){
        return (typeof idx === 'number') && (this.views[idx] !== undefined);
      },
      /**
       * Activates a container based on its index in the views array
       * 
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
       * Returns the container component
       * 
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
       * Returns the container component
       * 
       * @method getContainer
       * @param {Number} idx
       * @return {Vue}
       */
      getContainer(idx){
        return this.getVue(idx);
      },
      /**
       * Returns the corresponding container's component's DOM element.
       * 
       * @method getDOMContainer
       * @param {Number} idx
       * @fires getVue
       * @return {HTMLElement|Boolean}
       */
      getDOMContainer(idx){
        let c = this.getVue(idx);
        return c ? c.$el : false;
      },
      /**
       * Returns the next router in the corresponding container if there's any.
       * 
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
          return container.subrouter || null;
        }
        return null;
      },
      /**
       * Returns the latest/ddepest active container
       * 
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
       * Returns the index on a container based on its URL, a component or a DOM element inside it
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
      /**
       * Fixes the property currentIndex based on the views array order
       *
       */
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
          let v = this.views[i];
          if (v.idx !== i) {
            if (!selectedOk && (this.selected === v.idx)) {
              this.selected = i;
            }

            v.idx = i;
            if (this.urls[v.url]) {
              this.urls[v.url].currentIndex = i;
            }
          }
        }

        this.setConfig();
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
       * Returns the index of the view corresponding to the given URL if any
       * 
       * @method search
       * @param {String} url
       * @return {Number|Boolean}
       */
      search(url){
        if (!bbn.fn.isString(url) ){
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
       * Returns the container corresponding to the given URL if any
       * 
       * @method searchContainer
       * @param {String} url
       * @param {Boolean} deep If true will give the last-level container corresponding to the URL
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
       * Loads a new container into the router
       * 
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
          let finalURL = this.fullBaseURL + url;
          let idx = this.search(url);
          let view;
          let def = {
            url: url,
            title: bbn._('Loading'),
            load: true,
            loading: true,
            selected: true,
            real: false,
            scrollable: !this.single,
            current: url,
            error: false,
            loaded: false,
            hidden: false
          };
          //bbn.fn.warning("START LOADING FN FOR IDX " + idx + " ON URL " + finalURL);
          if ( idx !== false ){
            //bbn.fn.log("INDEX RETRIEVED BEFORE LOAD: " + idx.toString(), this.views[idx].slot, this.views[idx].loading);
            if ( this.views[idx].loading || (!force && !this.views[idx].load) ){
              return;
            }

            view = this.views[idx];
            if (force){
              if (view.real) {
                throw new Error(bbn._("A container can't be real and be loaded (it should be a bbns-container)"));
              }

              bbn.fn.iterate(def, (v, n) => {
                if (view[n] === undefined) {
                  this.$set(view, n, v);
                }
                else if (n !== 'title') {
                  view[n] = v;
                }
              })
            }
            if ((index !== undefined) && (index !== idx)) {
              bbn.fn.log("MOVING CONTAINER");
              this.move(idx, index);
            }
            if (this.urls[view.url]) {
              this.urls[view.url].ready = false;
              this.urls[view.url].isLoaded = false;
            }
          }
          else {
            idx = index === undefined ? this.views.length : index;
            view = this.add(bbn.fn.extend(def, {
              title: view && view.title ? view.title : bbn._('Loading')
            }), idx);
          }

          this.selected = idx;
          this.$emit('update', this.views);
          let dataObj = this.postBaseUrl ? {_bbn_baseURL: this.fullBaseURL} : {};
          this.isLoading = bbn.fn.search(this.views, {loading: true}) > -1;
          return this.post(
            finalURL,
            dataObj,
            d => {
              let isSelected = (this.currentURL === url);
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

              // Giving an 'Untitled' title if no title
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
              let o = bbn.fn.extend(view || {}, d, {loading: false, load: true, real: false, loaded: true});
              if (view) {
                if ((d.url !== d.current) && this.urls[d.current]) {
                  bbn.fn.log("REP{LACING");
                  this.urls[d.url] = this.urls[d.current];
                  delete this.urls[d.current];
                }

                if (this.urls[d.url]) {
                  this.urls[d.url].isLoaded = true;
                }

                bbn.fn.iterate(d, (v, n) => {
                  if ((view[n] === undefined) || (n === 'url')) {
                    this.$set(view, n, v);
                  }
                  else if (view[n] !== v) {
                    view[n] = v;
                  }
                });
              }
              else {
                this.add(o, idx);
              }

              this.isLoading = bbn.fn.search(this.views, {loading: true}) > -1;

              if (o.title) {
                this.currentTitle = o.title;
              }

              if (isSelected) {
                this.selected = idx;
              }
            },
            (xhr, textStatus, errorThrown) => {
              this.alert(textStatus);
              let idx = this.search(this.parseURL(finalURL));
              if ( idx !== false ){
                let url = this.views[idx].url;
                if (this.urls[url]) {
                  this.remove(this.urls[url].idx);
                }
              }
              this.activate(url);
            }
          );
        }
      },
      /**
       * Forces the reload of the given container
       * 
       * @method reload
       * @param {Number} idx
       * @fires route
       */
      reload(idx){
        // So if the ac6tion comes from within the container components can finish whatever they're doing (like closing the floater menu)
        this.$nextTick(() => {
          if (
            this.views[idx] &&
            this.views[idx].load &&
            this.urls[this.views[idx].url] &&
            this.urls[this.views[idx].url].isLoaded
          ) {
            let url = this.views[idx].current;
            this.load(url, true, idx);
          }
        });
      },
      /**
       * Returns the default URL to use when routing for the first time, always return somethng.
       * 
       * @method getDefaultURL
       * @fires parseURL
       * @return {String}
       */
      getDefaultURL(){
        bbn.fn.log("GETTING DEFAULT URL");
        // First the URL prop of the router
        if ( this.url ){
          return this.url;
        }
        // Second if there is a parent router we automatically give the remander URL part
        if ( this.parentContainer && (this.parentContainer.currentURL !== this.parentContainer.url) ){
          return this.parentContainer.currentURL.substr(this.parentContainer.url.length + 1);
        }
        // Third if a default value is given by config
        if ( this.def ){
          return this.def;
        }

        // Otherwise we take the URL from the browser
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
        // Emptying dirtyContainers
        this.dirtyContainers.splice(0, this.dirtyContainers.length);
        // Filling dirtyContainers
        bbn.fn.iterate(this.urls, v => {
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
            sub.views.forEach(a => {
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
              helps.forEach(a => {
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

          if (!this.isVisual) {
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

        if (!this.isVisual) {
          items.push({
            text: bbn._('Switch to') + ' ' + (this.isBreadcrumb ? bbn._('tabs') : bbn._('breadcrumb')) + ' ' + bbn._('mode'),
            key: 'switch',
            icon: this.isBreadcrumb ? 'nf nf-mdi-tab' : 'nf nf-fa-ellipsis_h',
            action: () => {
              this.itsMaster.isBreadcrumb = !this.itsMaster.isBreadcrumb;
            }
          });

          if (!this.parents.length) {
            let go = () => {
              this.isVisual = true;
              this.onResize();
              setTimeout(() => {
                this.activateIndex(this.getIndex(this.getFullCurrentURL()));
              }, 250)
            };

            items.push({
              text: bbn._('Switch to') + ' ' + bbn._('visual') + ' ' + bbn._('mode'),
              key: 'visual',
              icon: 'nf nf-fa-eye',
              action: () => {
                if (!this.isDirty) {
                  go();
                  return;
                }

                this.confirm(
                  bbn._("The pages already loaded will be reinitialized") +
                      '<br>' + bbn._("If you have any unsaved work opened it will be lost.") +
                      '<br>' + bbn._("Is it ok to continue?"),
                  () => {
                    go()
                  }
                );
            }
            });
          }
        }
        else {
          const go = () => {
            this.isVisual = false;
            this.itsMaster.isBreadcrumb = false;
            setTimeout(() => {
              this.activateIndex(this.getIndex(this.getFullCurrentURL()));
            }, 250)
          };

          let visualPositions = [];
          bbn.fn.each(possibleOrientations, a => {
            if ((a.name === 'auto') && (this.orientation === 'auto') && !this.lockedOrientation) {
              return;
            }

            if (this.visualOrientation !== a.name) {
              visualPositions.push({
                text: a.text,
                icon: a.name === 'auto' ? 'nf nf-mdi-auto_fix' : 'nf nf-mdi-border_' + a.name,
                action: () => {
                  if (a.name === 'auto') {
                    this.lockedOrientation = false;
                  }
                  else {
                    this.visualOrientation = a.name;
                    this.lockedOrientation = true;
                  }
                  this.onResize();
                  this.setConfig();
                }
              });
            }
          });
          items.push({
            text: bbn._("Change visual blocks' position"),
            icon: 'nf nf-mdi-cursor_move',
            items: visualPositions
          });

          items.push({
            text: bbn._('Switch to') + ' ' + bbn._('tabs') + ' ' + bbn._('mode'),
            key: 'tabs',
            icon: 'nf nf-mdi-tab',
            action: () => {
              if (!this.isDirty) {
                go();
                return;
              }

              this.confirm(
                bbn._("The pages already loaded will be reinitialized") +
                    '<br>' + bbn._("You should save your unsaved content or it will be lost.") +
                    '<br>' + bbn._("Is it ok to continue?"),
                () => {
                  go();
                }
              );
            }
          });

          items.push({
            text: bbn._('Switch to') + ' ' + bbn._('breadcrumb') + ' ' + bbn._('mode'),
            key: 'breadcrumbs',
            icon: 'nf nf-fa-ellipsis_h',
            action: () => {
              if (!this.isDirty) {
                go();
                return;
              }

              this.confirm(
                bbn._("The pages already loaded will be reloaded") +
                    '<br>' + bbn._("If you have any unsaved work opened it will be lost.") +
                    '<br>' + bbn._("Is it ok to continue?"),
                () => {
                  go();
                }
              );
            }
          });
        }

        return items;
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
          breadcrumb: this.isBreadcrumb,
          visual: this.isVisual,
          orientation: this.lockedOrientation ? this.visualOrientation : null
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
      },
      onResize() {
        this.keepCool(() => {
          this.setResizeMeasures();
          this.setContainerMeasures();
          if (this.isVisual && (this.orientation === 'auto') && !this.lockedOrientation) {
            this.$nextTick(() => {
              this.visualOrientation = this.lastKnownWidth > this.lastKnownHeight ? 'left' : 'top';
            })
          }
        }, 'resize', 250);
      }
    },

    /**
     * @event created
     */
    created(){
      this.componentClass.push('bbn-resize-emitter');
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
        this.parentContainer.subrouter = this;
        let uri = this.parentContainer.url;
        if (this.root && (uri !== this.root) && (uri.indexOf(this.root) === 0) ){
          uri = this.root;
        }
        this.baseURL = this.formatBaseURL(uri);
      }
      else{
        if (db) {
          bbn.db.open('bbn').then(r => {
            this.db = r;
          }, err => {
            bbn.fn.log("Connection error in router", err);
          });
        }

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

      //Get config from the storage
      let storage = this.getStorage(this.parentContainer ? this.parentContainer.getFullURL() : this.storageName);
      if ( storage ){
        if ( storage.breadcrumb !== undefined ){
          this.isBreadcrumb = storage.breadcrumb;
        }

        if (storage.visual !== undefined) {
          this.isVisual = storage.visual;
        }

        if (storage.orientation) {
          this.visualOrientation = storage.orientation;
          this.lockedOrientation = true;
        }
      }
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

      bbn.fn.each(this.source, a => {
        if (a.url === '') {
          if (a.load) {
            throw new Error(bbn._("You cannot use containers with empty URL for loading"));
          }
          this.hasEmptyURL = true;
        }
        tmp.push(bbn.fn.extendOut(a, {real: false}));
      });

      //Get config from the storage
      if ( storage && storage.views ){
        bbn.fn.each(storage.views, a => {
          let idx = bbn.fn.search(tmp, {url: a.url});
          if ( idx > -1 ){
            // Static comes only form configuration
            let isStatic = tmp[idx].static;
            bbn.fn.extend(tmp[idx], a, {static: isStatic});
          }
          else{
            tmp.push(a);
          }
        });
      }

      let url = this.getDefaultURL();
      bbn.fn.each(tmp, a => {
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
        if (this.ready) {
          bbn.fn.log("currentURL watcher");
          let idx = this.search(newVal);
          if ((idx !== false) && (this.selected !== idx)){
            this.selected = idx;
          }

          this.$nextTick(() => {
            if (this.activeContainer) {
              this.changeURL(newVal, this.activeContainer.title);
              this.views[this.selected].last = bbn.fn.timestamp();
              if (this.activeContainer.subrouter) {
                this.activeContainer.subrouter.route(newVal.substr(this.activeContainer.url.length + 1));
              }
            }
            else if (this.autoload && (!this.activeContainer || (this.activeContainer.currentURL !== newVal))) {
              this.route(newVal);
            }
            else {
              throw new Error(bbn._("Impossible to find the container"));
            }
            this.$emit('change', newVal);
          });
          this.$emit('route', newVal);
          this.onRoute(newVal);
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
      },
      /**
       * @watch isVisual
       * @fires setConfig
       */
       isVisual() {
        this.$nextTick(() => {
          this.setConfig();
        })
      },
      selected(nv, ov) {
        this.setSelected(nv, ov);
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
              <i :class="p.view.icon"/>
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
            <i :class="source.view.icon"/>
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
              <i :class="p.view.icon"/>
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