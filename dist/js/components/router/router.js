(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, {
       'bbn-invisible': !ready,
       'bbn-overlay': nav,
     }]"
>
  <div :class="{
    'bbn-flex-height': nav,
    'bbn-router-nav': nav,
    'bbn-router-nav-bc': nav && isBreadcrumb,
    'bbn-overlay': !nav
  }">
    <bbn-breadcrumb v-if="nav && isBreadcrumb"
                    :source="views"
                    ref="breadcrumb"
                    @beforeClose="close"
                    @select="activateIndex"
                    :menu="getMenuFn"
                    :scrollable="scrollable"
                    :content="false"
                    :value="selected"
                    :master="!!master"
                    :class="['bbn-router-breadcrumb', {'bbn-router-breadcrumb-master': master}]"
    ></bbn-breadcrumb>
    <bbn-tabs v-else-if="nav && !isBreadcrumb"
              :source="views"
              :scrollable="scrollable"
              ref="tabs"
              @beforeClose="close"
              @select="activateIndex"
              :menu="getMenuFn"
              @pin="setConfig"
              @unpin="setConfig"
              :content="false"
              :value="selected"
              class="bbn-router-tabs"
              :max-title-length="maxTitleLength"
    ></bbn-tabs>
    <div :class="{
      'bbn-flex-fill': !!nav,
      'bbn-overlay': !nav
    }">
      <slot></slot>
      <bbn-container v-for="view in views"
                     v-if="!view.slot && !component"
                     :key="view.url"
                     v-bind="view"
      ></bbn-container>
      <bbn-container v-if="component && componentSource && componentURL"
                     :source="componentSource"
                     :component="component"
                     :url="componentSource[componentURL]"
      ></bbn-container>
    </div>
  </div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-router');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/router/router.css");
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-router component
 * @description bbn-router is a component that allows and manages the navigation (url) between the various containers of an application
 * @copyright BBN Solutions
 * @author BBN Solutions
 */
(function(bbn, Vue){
  "use strict";

  Vue.component("bbn-router", {
    name: 'bbn-router',
    mixins: [
      /**
       * @mixin bbn.vue.basicComponent
       * @mixin bbn.vue.resizerComponent
       * @mixin bbn.vue.localStorageComponent
       * @mixin bbn.vue.closeComponent
       * @mixin bbn.vue.observerComponent
       */
      bbn.vue.basicComponent,
      bbn.vue.resizerComponent,
      bbn.vue.localStorageComponent,
      bbn.vue.closeComponent,
      bbn.vue.observerComponent
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
      /**
       * Set it to true if you wanto to see the navigation bar (tabs or breadcrumb).
       * @prop {Boolean} [false] nav
       */
      nav: {
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
       *
       * @prop {String} hideAdvertUrl
       */
      hideAdvertUrl: {
        type: String
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
       * Set it to false if you want to hide the switch.
       * @prop {Boolean} [true] switch
       */
      showSwitch: {
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
      }
    },
    data(){
      return {
        /**
         * Number of conatainers registered - as they say it.
         * @data {Number} [0] numRegistered
         */
        numRegistered: 0,
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
        baseURL: this.setBaseURL(this.root),
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
         * ????
         * @data {Boolean} [ture] visible
         */
        visible: true,
        /**
         * The currently visible container.
         * @data {Vue} [null] activeContainer
         */
        activeContainer: null,
        /**
         * Set to true each time the router is loading (can only load once at a time).
         * @data {Boolean} [false] isLoading
         */
        isLoading: false,
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
         * Shows if the navigation mode is set to breacrumb.
         * @data {Boolean} isBreadcrumb
         */
        isBreadcrumb: this.breadcrumb,
        /**
         * itsMaster.isBreadcrumb watcher.
         * @data breadcrumbWatcher
         */
        breadcrumbWatcher: false
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
       * Returns the bbn-breadcrumb component of this router.
       * @computed itsBreadcrumb
       * @fires getRef
       * @return {Vue|Boolean}
       */
      itsBreadcrumb(){
        if ( this.isBreadcrumb ){
          return this.getRef('breadcrumb');
        }
        return false;
      },
      /**
       * Returns the master breadcrumb component for this router.
       * @computed itsMasterBreadcrumb
       * @return {Vue|Boolean}
       */
      itsMasterBreadcrumb(){
        if ( this.isBreadcrumb && this.itsMaster ){
          return this.itsMaster.getRef('breadcrumb');
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
       * The last router.
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
      }
    },

    methods: {
      /**
       * Function used by container to make themselves known when they are mounted.
       * @method register
       * @param {Vue} cp
       * @param {Boolean} fake
       * @fires add
       * @fires search
       * @fires route
       * @fires getDefaultURL
       */
      register(cp, fake){
        if ( fake ){
          this.add(cp);
          return;
        }
        if (!bbn.fn.isString(cp.url)) {
          throw Error(bbn._('The component bbn-container must have a URL defined'));
        }
        if (this.urls[cp.url]) {
          throw Error(bbn._('Two containers cannot have the same URL defined (' + cp.url + ')'));
        }
        this.numRegistered++;
        this.urls[cp.url] = cp;
        let idx = this.search(cp.url);
        if (idx === false) {
          this.add(cp);
        }
        else{
          cp.currentIndex = idx;
          if ( !this.isInit && (this.numRegistered === this.views.length) ){
            this.isInit = true;
            if ( this.auto ){
              this.route(this.getDefaultURL(), true);
            }
          }
        }
      },
      /**
       * Function used by container to make themselves known when they are destroyed
       * @method unregister
       * @fires search
       * @fires remove
       * @param {Vue} cp
       */
      unregister(cp){
        this.numRegistered--;
        if (!bbn.fn.isString(cp.url)) {
          throw Error(bbn._('The component bbn-container must have a URL defined'));
        }
        if ( this.urls[cp.url] ){
          delete this.urls[cp.url];
        }
        let idx = this.search(cp.url);
        //bbn.fn.log("GGGGGG", cp.url, idx, this.views);
        if (idx !== false) {
          this.remove(idx);
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
          bbn.fn.log("error in getRoute with url", url);
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
       * Formats a baseURL correctly (without 1st slash and with end slash.
       * @method setBaseURL
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
      /**
       * Sends event beforeRoute (cancellable) and launch real routing.
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
          bbn.fn.log("error in route with url", url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        url = bbn.fn.replaceAll('//', '/', url);
        if (this.ready && (force || !this.activeContainer || (url !== this.currentURL))) {
          let event = new CustomEvent(
            "beforeRoute",
            {
              bubbles: false,
              cancelable: true
            }
          );
          this.$emit("beforeRoute", event, url);
          if (!event.defaultPrevented) {
            let bits = url.split('#');
            url = bits[0];
	          if ((url === '') && this.hasEmptyURL) {
              this.urls[''].setCurrent(url);
              this.realRoute('', '', force);
              return;
            }
            // Checks weather the container is already there
            if (!url) {
              let idx = this.getRoute('', true);
              if ( idx ){
                url = this.urls[idx].currentURL;
              }
            }
            let st = url ? this.getRoute(url) : '';
            //bbn.fn.log("ROUTING FUNCTION EXECUTING FOR " + url + " (CORRESPONDING TO " + st + ")");
            if (!url || (!force && (this.currentURL === url))) {
              if (bits[1]) {

              }
              //bbn.fn.log("SAME URL END ROUTING");
              return;
            }
            else if (url && ((!st && this.autoload) || (this.urls[st] && this.urls[st].load && !this.urls[st].isLoaded))) {
              this.load(url);
            }
            // Otherwise the container is activated ie made visible
            else {
              //bbn.fn.log("LOADED " + url);
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
              if (st) {
                this.urls[st].setCurrent(url);
                this.realRoute(url, st, force, bits[1]);
              }
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
      realRoute(url, st, force, anchor){
        if (!bbn.fn.isString(url) && !bbn.fn.isNumber(url)){
          bbn.fn.log("error in realRoute with url", url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        if (this.urls[st]) {
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
              bbn.fn.log("LOOKING FOR CHILD", child);
              if ( child ){
                child.route(url.substr(st.length + 1), force);
              }
              else {
                let ifr = this.urls[st].find('bbn-frame');
                if (ifr) {
                  ifr.route(url.substr(st.length+1));
                }
              }
            });
          }
        }
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
       * Shows the container with the corresponding URL and hide all others.
       * @method activate
       * @param url
       * @param container
       */
      activate(url, container){
        if (!bbn.fn.isString(url) ){
          bbn.fn.log("error in activate with url", url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
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
       * @method changeURL
       * @param {String} url
       * @param {String} title
       * @param {Boolean} replace
       * @fires getFullBaseURL
       */
      changeURL(url, title, replace){
        if (!bbn.fn.isString(url) ){
          bbn.fn.log("error in changeURL with url", url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        if ( !bbn.env.isInit ){
          return;
        }
        if ( url !== this.currentURL ){
          this.currentURL = url;
        }
        if (title !== this.currentTitle) {
          this.currentTitle = title;
        }
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
        if ( this.parent ){
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
       * @method isValidIndex
       * @return {Boolean}
       */
      isValidIndex(idx){
        return (typeof idx === 'number') && (this.views[idx] !== undefined);
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
          //bbn.fn.log("ACTIVATE6", this.views[idx].current ? this.views[idx].current : this.views[idx].url);
          this.activate(this.views[idx].current ? this.views[idx].current : this.views[idx].url);
        }
      },
      /**
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
       * Returns the corresponding container's component's DOM element.
       * @method getContainer
       * @param {Number} idx
       * @return {Vue}
       */
      getContainer(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        return this.urls[this.views[idx].url];
      },
      /**
       * Returns the corresponding container's component's DOM element.
       * @method getDOMContainer
       * @param {Number} idx
       * @fires getVue
       * @return {HTMLElement|Boolean}
       */
      getDOMContainer(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        let c = this.getVue(idx);
        return c ? c.$el : false;
      },
      /**
       * Returns the next router in the corresponding container if there's any.
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
          return container.find('bbn-router') || null;
        }
        return null;
      },
      /**
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
       * @method getIndex
       * @fires isValidIndex
       * @fires search
       * @return {Number|Boolean}
       */
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
      /**
       * @method remove
       * @param misc
       * @param force
       * @fires getIndex
       * @fires remove
       * @emit close
       * @return {Boolean}
       */
      remove(misc, force){
        let idx = this.getIndex(misc);
        if ( idx > -1 ){
          let ev = new Event('close', {cancelable: !force}),
              ev2 = new Event('beforeClose', {cancelable: !force});
          if ( !force ){
            this.$emit('beforeClose', idx, ev2);
          }
          if ( !ev2.defaultPrevented ){
            if (
              this.isDirty &&
              this.views[idx].dirty &&
              !ev.defaultPrevented &&
              !force
            ){
              ev.preventDefault();
              this.confirm(this.confirmLeave, () => {
                let forms = this.urls[this.views[idx].url].findAll('bbn-form');
                if ( Array.isArray(forms) && forms.length ){
                  bbn.fn.each(forms, (f, k) => {
                    f.reset();
                  });
                }
                this.$nextTick(() => {
                  this.$emit('close', idx, ev);
                  this.close(idx, true);
                });
              });
            }
            else {
              if (this.views[idx].slot) {
                let t = this.views.splice(idx, 1);
                delete this.urls[t.url];
                bbn.fn.each(this.views, (v, i) => {
                  if ( v.idx !== i ){
                    v.idx = i;
                    if (this.urls[v.url]) {
                      this.urls[v.url].currentIndex = i;
                    }
                  }
                });
              }
              else {
                if ( !force ){
                  this.$emit('close', idx, ev);
                }
                if (force || !ev.defaultPrevented) {
                  let t = this.views.splice(idx, 1);
                  delete this.urls[t.url];
                  bbn.fn.each(this.views, (v, i) => {
                    if ( v.idx !== i ){
                      v.idx = i;
                      if (this.urls[v.url]) {
                        this.urls[v.url].currentIndex = i;
                      }
                    }
                  });
                }
                return true;
              }
            }
          }
        }
        return false;
      },
      /**
       * Adds an object with a valid url to the views.
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
          obj.url = bbn.fn.replaceAll('//', '/', obj.url);
          if (obj.$options) {
            if (!obj.current && !obj.currentURL) {
              if ( bbn.env.path.indexOf(this.getFullBaseURL() + (obj.url ? obj.url + '/' : '')) === 0 ){
                obj.currentURL = bbn.env.path.substr(this.getFullBaseURL().length);
              }
              else{
                obj.currentURL = obj.url;
              }
            }
            else {
              if (obj.currentURL) {
                obj.currentURL = bbn.fn.replaceAll(obj.currentURL);
              }
            }
            obj = JSON.parse(JSON.stringify((obj.$options.propsData)));
            obj.slot = true;
            if (this.search(obj.url) === false) {
              if (this.isValidIndex(idx)) {
                this.views.splice(idx, 0, obj);
              }
              else {
                this.views.push(obj);
              }
            }
          }
          else{
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
                obj.selected = true;
                obj.idx = this.views.length;
              }
              else{
                obj.selected = false;
                obj.idx = isValid ? idx : this.views.length;
              }
              bbn.fn.iterate(this.getDefaultView(), (a, n) => {
                if ( obj[n] === undefined ){
                  // Each new property must be set with $set
                  this.$set(obj, n, a);
                }
              });
              if (isValid) {
                this.views.splice(obj.idx, 0, obj);
              }
              else {
                this.views.push(obj);
              }
            }
          }
        }
      },
      /**
       * @method search
       * @param {String} url
       * @return {Number|Boolean}
       */
      search(url){
        if (!bbn.fn.isString(url) ){
          bbn.fn.log("error in search with url", url);
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
       * @method callRouter
       * @param {String} url
       * @param st
       * @fires getFullBaseURL
       * @fires realRoute
       */
      callRouter(url, st){
        if (!bbn.fn.isString(url) ){
          bbn.fn.log("error in callRouter with url", url);
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
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
      /**
       * @method searchContainer
       * @param {String} url
       * @param {Boolean} deep
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
      load(url, force){
        if ( url ){
          this.isLoading = true;
          let finalURL = this.fullBaseURL + url;
          let idx = this.search(url);
          let toAdd = false;
          let view;
          //bbn.fn.warning("START LOADING FN FOR IDX " + idx + " ON URL " + finalURL);
          if ( idx !== false ){
            //bbn.fn.log("INDEX RETRIEVED BEFORE LOAD: " + idx.toString(), this.views[idx].slot, this.views[idx].loading);
            if ( this.views[idx].loading || (!force && !this.views[idx].load) ){
              return;
            }
            view = this.views[idx];
            if (force){
              toAdd = true;
              this.views.splice(idx, 1);
            }
          }
          else{
            toAdd = true;
            idx = this.views.length;
          }
          bbn.fn.log(url, idx, toAdd);
          //bbn.fn.warning('IDX ' + idx + ' URL ' + url);
          if (toAdd){
            this.add({
              url: url,
              title: view && view.title ? view.title : bbn._('Loading'),
              load: true,
              loading: true,
              visible: true,
              real: false,
              current: url,
              error: false,
              loaded: false
            }, idx);
          }
          if ( this.isBreadcrumb ){
            this.selected = idx;
          }
          this.$emit('update', this.views);
          let dataObj = this.postBaseUrl ? {_bbn_baseURL: this.fullBaseURL} : {};
          return this.post(
            finalURL,
            dataObj,
            (d) => {
              this.isLoading = false;
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
              if ( (d.url !== d.current) && this.urls[d.current] ){
                //bbn.fn.warning("DELETING VIEW CASE.... " + d.current + ' ' + this.urls[d.current].idx);
                this.views.splice(this.urls[d.current].idx, 1);
                delete this.urls[d.current];
              }
              if ( !d.title || (d.title === bbn._('Loading')) ){
                if (view && view.title) {
                  d.title = view.title;
                }
                else{
                  let title = bbn._('Untitled');
                  let num = 1;
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
              this.$nextTick(() => {
                let o = bbn.fn.extend(view || {}, d, {slot: false, loading: false, load: true, real: false, loaded: true});
                this.add(o, idx);
                if (o.title) {
                  this.currentTitle = o.title;
                }
                /** @todo Find why this timeout is needed to not have this.urls sometimes empty at that moment */
                setTimeout(() => {
                  this.realInit(d.url, 50);
                }, 250)
              })
            },
            (xhr, textStatus, errorThrown) => {
              this.isLoading = false;
              this.alert(textStatus);
              let idx = this.search(this.parseURL(finalURL));
              if ( idx !== false ){
                let url = this.views[idx].url;
                if (this.urls[url]) {
                  this.views.splice(this.urls[url].idx, 1);
                  delete this.urls[url];
                }
              }
              //this.navigate(url);
              this.activate(url);
            },
            () => {
              this.isLoading = false;
            }
          );
        }
      },
      realInit(url, num) {
        bbn.fn.log(url + '   -   ' + num, this.urls ? Object.keys(this.urls) : this.urls, this.baseURL);
        if (this.urls[url]) {
          this.urls[url].setLoaded(true);
          // Otherwise the changes we just did on the props wont be taken into account at container level
          this.urls[url].init();
          this.callRouter(this.urls[url].current, url);
          this.$emit('update', this.views);
        }
        else {
          throw new Error(bbn._("Impossible to find the container for URL") + ' ' + url);
        }

      },
      /**
       * @method reload
       * @param {Number} idx
       * @fires route
       */
      reload(idx){
        // So if the ac6tion comes from within the container components can finish whatever they're doing
        this.$nextTick(() => {
          if (
            this.views[idx] &&
            !this.views[idx].slot &&
            this.views[idx].load &&
            this.urls[this.views[idx].url] &&
            this.urls[this.views[idx].url].isLoaded
          ){
            this.views[idx].loaded = false;
            if (this.views[idx].dirty) {
              this.views[idx].dirty = false;
            }
            this.urls[this.views[idx].url].isLoaded = false;
            this.$nextTick(() => {
              this.route(this.urls[this.views[idx].url].currentURL, true);
            })
          }
        });
      },
      /**
       * @method getDefaultURL
       * @fires parseURL
       * @return {String}
       */
      getDefaultURL(){
        // If there is a parent router we automatically give the proper baseURL
        if ( this.url ){
          return this.url;
        }
        if ( this.parentContainer && (this.parentContainer.currentURL !== this.parentContainer.url) ){
          return this.parentContainer.currentURL.substr(this.parentContainer.url.length + 1);
        }
        if ( this.def ){
          return this.def;
        }
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
        this.dirtyContainers.splice(0, this.dirtyContainers.length);
        bbn.fn.iterate(this.urls, (v) => {
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
        //bbn.fn.log('getMenuFn(tabIndex)', this.nav, this.views[idx] ? this.views[idx].menu : 'niente', idx);
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
            sub.views.forEach((a) => {
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
              helps.forEach((a) => {
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
              view.getPopup().open({
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
          })
        }
        if ( this.views[idx].icon && this.views[idx].title && !this.isBreadcrumb ){
          items.push({
            text: this.views[idx].notext ? bbn._("Show text") : bbn._("Show only icon"),
            key: "notext",
            icon: this.views[idx].notext ? "nf nf-fa-font" : "nf nf-fa-font_awesome",
            action: () => {
              //bbn.fn.log(this.containers[idx]);
              this.views[idx].notext = !this.views[idx].notext;
              this.$forceUpdate();
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
                this.getRef('breadcrumb').close(idx);
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
                  this.getRef('tabs').pin(idx);
                }
              });
              items.push({
                text: bbn._("Close"),
                key: "close",
                icon: "nf nf-mdi-close",
                action: () => {
                  this.getRef('tabs').close(idx);
                }
              })
            }
            else{
              items.push({
                text: bbn._("Unpin"),
                key: "pin",
                icon: "nf nf-mdi-pin_off",
                action: () => {
                  this.getRef('tabs').unpin(idx);
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
              this.getRef(this.isBreadcrumb ? 'breadcrumb' : 'tabs').closeAllBut(idx);
            }
          })
        }
        if ( others && !this.views[idx].static ){
          items.push({
            text: bbn._("Close All"),
            key: "close_all",
            icon: "nf nf-mdi-close_circle",
            action: () => {
              this.getRef(this.isBreadcrumb ? 'breadcrumb' : 'tabs').closeAll();
            }
          })
        }
        let menu = bbn.fn.isArray(this.menu) ? this.menu : this.menu(this.views[idx], this);
        if (menu.length) {
          bbn.fn.each(menu, a => {
            items.push(a);
          });
        }
        items.push({
          text: bbn._('Switch to ') + (this.isBreadcrumb ? bbn._('tabs') : bbn._('breadcrumb')) + ' ' + bbn._('mode'),
          key: 'switch',
          icon: this.isBreadcrumb ? 'nf nf-mdi-tab' : 'nf nf-fa-ellipsis_h',
          action: () => {
            this.itsMaster.isBreadcrumb = !this.itsMaster.isBreadcrumb;
          }
        });
        return items;
      },
      /**
       * @method close
       * @param {Number} idx
       * @param {Boolean} force
       * @param {Event} ev
       * @fires remove
       * @fires getIndex
       * @fires activateIndex
       * @fires setConfig
       * @return {Boolean}
       */
      close(idx, force, ev){
        if ( ev ){
          ev.preventDefault();
        }
        let res = this.remove(idx, force);
        if ( res && (this.selected > idx) ){
          this.selected--;
        }
        else if ( res && (this.selected === idx) ){
          this.selected = false;
          if ( this.views.length ){
            bbn.fn.each(this.history, (a) => {
              let tmp = this.getIndex(a);
              if ( tmp !== false ){
                idx = tmp;
                return false;
              }
            });
            this.activateIndex(this.views[idx] ? idx : idx - 1);
          }
        }
        this.$nextTick(() => {
          this.setConfig();
        })
        return res;
      },
      /**
       * @method setconfig
       * @fires setStorage
       * @fires getConfig
       */
      setConfig(){
        if ( this.autoload && this.isInit ){
          this.setStorage(this.getConfig(), this.parentContainer ? this.parentContainer.getFullURL() : this.storageName);
          this.$forceUpdate();
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
              breadcrumb: this.isBreadcrumb
            };
        bbn.fn.each(this.views, (obj, i) => {
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
                this.$forceUpdate();
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
              this.$forceUpdate();
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
      /**
       * @method containerComponentMount
       * @fires init
       * @fires show
       */
      containerComponentMount(){
        let ct = this.getRef('container');
        ct.init();
        this.$nextTick(() => {
          ct.show();
        })
      }
    },

    /**
     * @event created
     */
    created(){
      this.componentClass.push('bbn-resize-emitter');
        /**
       * @event route
       * @fires setconfig
       */
      this.$on('route', url => {
        if ( this.nav ){
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
      });
    },
    /**
     * @event mounted
     * @fires getStorage
     * @fires getDefaultURL
     * @fires aadd
     */
    mounted(){
      // All routers above (which constitute the fullBaseURL)
      this.parents = this.ancesters('bbn-router');
      // The closest
      this.parent = this.parents.length ? this.parents[0] : false;
      // The root
      this.router = this.parents.length ? this.parents[this.parents.length-1] : this;
      if ( this.parent ){
        this.parentContainer = this.closest('bbn-container');
        let uri = this.parentContainer.url;
        if (this.root && (uri !== this.root) && (uri.indexOf(this.root) === 0) ){
          uri = this.root;
        }
        this.baseURL = this.setBaseURL(uri);
      }
      else{
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
      // Adding bbns-tab from the slot
      let tmp = [];
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
            let o = {slot: true, load: false, loaded: true};
            tmp.push(bbn.fn.extend({}, node.componentOptions.propsData, o));
          }
        }
      }

      bbn.fn.each(this.source, (a) => {
        if (a.url === '') {
          if (a.load) {
            throw new Error(bbn._("You cannot use containers with empty URL for loading"));
          }
          this.hasEmptyURL = true;
        }
        tmp.push(bbn.fn.extendOut(a, {slot: false}));
      });

      //Get config from the storage
      let storage = this.getStorage(this.parentContainer ? this.parentContainer.getFullURL() : this.storageName);
      if ( storage ){
        if ( storage.breadcrumb !== undefined ){
          this.isBreadcrumb = storage.breadcrumb;
        }
        if ( storage.views ){
          bbn.fn.each(storage.views, (a) => {
            let idx = bbn.fn.search(tmp, {url: a.url});
            if ( idx > -1 ){
              bbn.fn.extend(tmp[idx], a);
            }
            else{
              tmp.push(a);
            }
          });
        }
      }

      let url = this.getDefaultURL();
      bbn.fn.each(tmp, (a) => {
        if (!bbn.fn.isString(a.url)) {
          throw new Error(bbn._("The container must have a valid URL"));
        }
        if (url && url.indexOf(a.url) === 0) {
          a.current = url;
        }
        this.add(a);
      });
      this.ready = true;
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
      /**
       * @watch url
       * @fires route
       */
      url(newVal){
        if ( this.ready ){
          //bbn.fn.log("ROUTER change URL", newVal);
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
       * @watch selected
       */
      selected(newVal, oldVal){
        /* if ( this.nav && (newVal !== oldVal) && bbn.fn.isNumber(newVal) ){
          let nav = this.itsTabs || this.itsBreadcrumb;
          if ( bbn.fn.isVue(nav) ){
            nav.selected = newVal;
          }
        } */
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
      }
    }
  });

})(bbn, Vue);
if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }