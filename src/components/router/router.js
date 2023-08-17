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
       * Sets if the router and the ocntainers inside it should be themselves scrollable or part of the global scroll.
       * @prop {Boolean} [false] scrollContent
       */
      scrollContent: {
        type: Boolean,
        default: true
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
       * @prop {Boolean} [true] postBaseUrl
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
        default(){
          return Math.max(60, Math.min(120, Math.round(Math.min(bbn.env.width, bbn.env.height) / 7)))
        }
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
      },
      /**
       * The default background color for the title bar
       * @prop {String} [#666] bcolor
       */
      bcolor: {
        type: String,
        default: '#666'
      },
      /**
       * The default text color for the title bar
       * @prop {String} [#EEE] fcolor
       */
      fcolor: {
        type: String,
        default: '#EEE'
      },
      /**
       * A list of panes used by default if splittable is true
       * @prop {Array} [[]] panes
       */
      panes: {
        type: Array,
        default() {
          return []
        }
      },
      /**
       * Decides if real bbn-container are shown before or after the ones in the config or fake container 9bbns-container)
       * @prop {String} ['real] first
       */
      first: {
        type: String,
        default: 'real'
      },
      /**
       * If true another tab can be opened aside
       * @prop {Boolean} [false] splittable
       */
      splittable: {
        type: Boolean,
        default: false
      },
      /**
       * If true when splittable the extra panes can be collapsed
       * @prop {Boolean} [false] collapsible
       */
      collapsible: {
        type: Boolean,
        default: true
      },
      /**
       * If true when splittable the extra panes can be resized
       * @prop {Boolean} [false] resizable
       */
      resizable: {
        type: Boolean,
        default: true
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
        baseURL: this.formatBaseURL(this.root),
         /**
         * An array of the parents router.
         * @data {Array} [[]] parents
         */
        parents: [],
         /**
         * An object with each mounted children router.
         * @data {Object} [{}] routers
         */
        routers: {},
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
         * @data {Boolean} [false] iconsReady
         */
        iconsReady: false,
        /**
         * Shows if the navigation mode is set to breacrumb.
         * @data {Boolean} isBreadcrumb
         */
        isBreadcrumb: this.breadcrumb,
        /**
         * itsMaster.isBreadcrumb watcher.
         * @data {Boolean} breadcrumbWatcher
         */
        breadcrumbWatcher: false,
        /**
         * List of breadcrumbs
         * @data {Array} breadcrumbsList
         */
        breadcrumbsList: [],
        /**
         * If true and visual will show all the containers as icons.
         * Starts at true for better updating when displays changes
         * @data {Boolean} visualShowAll
         */
        visualShowAll: false,
        /**
         * In visual mode the side on which the thumbnails are shown.
         * If auto (default) the bar will be top if H > W, left otherwise
         * @data {String} ['auto'] visualOrientation
         */
        visualOrientation: this.orientation !== 'auto' ? this.orientation : null,
        /**
         * If true the auto orientation won't be taken into account.
         * @data {Boolean} lockedOrientation
         */
        lockedOrientation: false,
        /**
         * If true visual mode is used for nav (instead of tabs or breadcrumbs)
         * @data {Boolean} visual
         */
        isVisual: this.visual,
        /**
         * The panes for when splittable is true
         * @data {Array} currentPanes
         */
        currentPanes: this.panes.slice(),
        /**
         * If true the configuration will be shown
         * @data {Boolean} visual
         */
        showRouterCfg: false,
        /**
         * Becomes true once the pane splitter is mounted
         * @data {Boolean} visual
         */
         splitterMounted: false
      };
    },
    computed: {
      selectedTab: {
        get() {
          return bbn.fn.search(this.tabsList, {idx: this.selected})
        },
        set(v) {
          this.selected = this.tabsList[v].idx;
        }
      },
      isSplittable() {
        return this.splittable && !this.single;
      },
      visualContainerStyle(){
        if (!this.isVisual) {
          return {};
        }

        let coord = [1, this.numVisualCols + 1, 1, this.numVisualRows + 1];
        if (this.views.length > 1) {
          switch (this.visualOrientation) {
            case 'top':
              coord[2] = 2;
              break;
            case 'bottom':
              coord[3] = coord[3] - 1;
              break;
            case 'left':
              coord[0] = 2;
              break;
            case 'right':
              coord[1] = coord[1] - 1;
              break;
          }
        }

        return {
          position: 'relative',
          top: null,
          left: null,
          right: null,
          bottom: null,
          gridColumnStart: coord[0],
          gridColumnEnd: coord[1],
          gridRowStart: coord[2],
          gridRowEnd: coord[3],
          zoom: 1
        };
      },
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
        let r = this;
        if ( this.master ){
          return r;
        }

        if (this.parents.length) {
          let i = 0;
          while (this.parents[i] && this.parents[i].isBreadcrumb) {
            r = this.parents[i];
            i++;
            if (r.master) {
              break;
            }
          }
        }
        return r;
      },
      isBreadcrumbMaster() {
        if (this.isBreadcrumb) {
          return this.itsMaster === this;
        }

        return false;
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
       * Returns the breadcrumbs array
       * @computed breadcrumbs
       * @return {Array}
       */
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
       * @computed visualStyle
       * @return {Object} 
       */
      visualStyle() {
        if (!this.isVisual) {
          return {};
        }

        return {
          minHeight: '100%',
          display: 'grid',
          gridColumnGap: '0.5rem',
          gridRowGap: '0.5rem',
          gridTemplateRows: 'repeat(' + this.numVisualRows + ', 1fr)',
          gridTemplateColumns: 'repeat(' + this.numVisualCols + ', 1fr)'
        }
      },

      /**
       * Returns true if the visual blocks are on top or bottom of the selected container
       * @computed visualIsOnHeight
       * @return {Boolean} 
       */
      visualIsOnHeight() {
        if (this.isVisual) {
          return ['top', 'bottom'].includes(this.visualOrientation);
        }

        return false;
      },

      /**
       * The ratio between height and width for each block
       * @computed visualRatio
       * @return {Object} 
       */
      visualRatio() {
        if (!this.isVisual) {
          return 1;
        }

        let diffW = this.visualIsOnHeight ? 0 : this.visualSize;
        let diffH = this.visualIsOnHeight ? this.visualSize : 0;
        let ratio = (this.lastKnownWidth - diffW) / (this.lastKnownHeight - diffH);
        if (ratio > 2) {
          return 2;
        }

        return Math.max(0.5, ratio);
      },

      /**
       * The number of columns (width) for the visual mode
       * @computed numVisualCols
       * @return {Number} 
       */
       numVisualCols() {
        if (this.isVisual && this.ready) {
          // Width greater or equal to height
          let w = this.lastKnownWidth - (this.visualIsOnHeight ? 0 : this.visualSize);
          if (this.splitterMounted) {
            let splitter = this.getRef('splitter');
            if (splitter.$el.clientWidth < w) {
              w -= splitter.$el.clientWidth;
            }
          }
          if (this.visualRatio >= 1) {
            return Math.floor(w / this.visualSize);
          }
          else {
            return Math.floor(w / (this.visualSize * 1));
          }
        }

        return 1;
      },

      /**
       * The number of rows (height) for the visual mode
       * @computed numVisualRows
       * @return {Number} 
       */
       numVisualRows() {
        if (this.isVisual && this.ready) {
          let h = this.lastKnownHeight - (this.visualIsOnHeight ? this.visualSize : 0);
          if (this.splitterMounted) {
            let splitter = this.getRef('splitter');
            if (splitter.$el.clientHeight < h) {
              h -= splitter.$el.clientHeight;
            }
          }
          if (this.visualRatio > 1) {
            return Math.floor(h / this.visualSize * 1);
          }
          else {
            return Math.floor(h / this.visualSize);
          }
        }

        return 1;
      },

      /**
       * The number of cells on the side where the thumbnails are shown in the visual mode
       * @computed numVisuals
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

        return 0;
      },


      /**
       * The number of cells on the side where the thumbnails are shown in the visual mode
       * @computed numVisualReals
       * @return {Number} 
       */
      numVisualReals() {
        if (this.isVisual) {
          return bbn.fn.filter(this.visualList, a => (a.view.idx !== this.selected) && !a.view.pane).length;
        }

        return 0;
      },


      /**
       * The views to show, in a specific different order, for the visual mode
       * @computed visualList
       * @return {Array} 
       */
      visualList() {
        if (!this.isVisual) {
          return [];
        }

        let moreViewsThanSlots = this.numVisuals < bbn.fn.filter(this.views, {pane: false}).length;
        let numAvailableSlots = this.numVisuals - (moreViewsThanSlots ? 1 : 0);
        let order = this.visualShowAll ? 
        {selected: 'asc', static: 'desc', pinned: 'desc', last: 'desc', idx: 'asc'}
        : {selected: 'desc', last: 'desc', static: 'desc', pinned: 'desc', idx: 'asc'};
        let idx = 0;
        return bbn.fn.map(
          bbn.fn.multiorder(
            this.views,
            order
          ),
          a => {
            let visible = false;
            if (this.visualShowAll || (idx <= numAvailableSlots) || (this.selected === a.idx)) {
              visible = true;
              if (!a.pane) {
                idx++;
              }
            }
            else if (a.pane) {
              visible = true;
            }
            return {
              view: a,
              visible: visible
            }
          }
        );
      },

      /**
       * The number of tabs which are not in a pane
       * 
       * @returns {Number}
       */
      numOutOfPane() {
        return bbn.fn.filter(this.views, {pane: false}).length;
      },

      /**
       * The number of panes displayed
       * @computed numPanes
       * @return {Number} 
       */
      numPanes() {
        return this.currentPanes.length;
      },
      /**
       * The views to show in the tabs, without the ones in the pane if splittable
       * @computed tabsList
       * @return {Array} 
       */
      tabsList() {
        return bbn.fn.multiorder(
          this.splittable ? bbn.fn.filter(this.views, a => !a.pane) : this.views,
          {static: 'desc', pinned: 'desc', idx: 'asc'}
        );
      },
      hasVerticalTabs(){
        return !this.isVisual
          && !this.isBreadcrumb
          && ((this.orientation === 'left')
            || (this.orientation === 'right'));
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
       remove(misc, force){
        let idx = this.getIndex(misc);
        if ( idx > -1 ){
          /** @var {Event} onBeforeClose beforeClose event, cancelable only if not force */
          let onBeforeClose = new Event('beforeClose', {cancelable: !force});
          /** @var {Event} onClose close event, cancelable only if not force */
          let onClose = new Event('close');
          this.$emit('beforeClose', idx, onBeforeClose);
          if (force || !onBeforeClose.defaultPrevented) {
            if (
              !force &&
              !this.ignoreDirty &&
              this.isDirty &&
              this.views[idx].dirty
            ) {
              this.confirm(this.confirmLeave, () => {
                // Looking for dirty ones in registered forms of each container
                let forms = this.urls[this.views[idx].url].forms;
                if ( Array.isArray(forms) && forms.length ){
                  bbn.fn.each(forms, (f, k) => {
                    f.reset();
                  });
                }

                return this.close(idx, true);
              });
            }
            else if (this.views[idx] && !this.views[idx].real) {
              this.$emit('close', idx, onClose);
              let url = this.views[idx].url;
              this.views.splice(idx, 1);
              this.$delete(this.urls, url);
              this.fixIndexes();
              return true;
            }
          }
        }
        return false;
      },
      getPane(obj) {
        if (!obj) {
          return false;
        }

        if (this.isVisual) {
          return obj.view.pane || false;
        }

        return obj.pane || false;
      },
      selectClosest(idx) {
        if ((idx === this.selected) && this.views[idx] && !this.views[idx].pane) {
          return;
        }

        if (this.selected === idx) {
          if ( this.views.length ){
            let newIdx = false;
            bbn.fn.each(this.history, a => {
              let tmp = this.getIndex(a);
              if ((tmp !== false) && !this.views[tmp].pane) {
                newIdx = tmp;
                return false;
              }
            });
            if (newIdx === false) {
              let tmp = idx;
              while (tmp >= 0) {
                if (this.views[tmp] && !this.views[tmp].pane) {
                  newIdx = tmp;
                  break;
                }
                tmp--;
              }

              if (newIdx === false) {
                tmp = idx;
                while (tmp < this.views.length) {
                  if (this.views[tmp] && !this.views[tmp].pane) {
                    newIdx = tmp;
                    break;
                  }
                  tmp++;
                }
              }
            }

            if (this.views[newIdx]) {
              this.activateIndex(newIdx);
            }
          }
          else {
            this.selected = false;
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
       close(idx, force, noCfg) {
        let res = this.remove(idx, force);
        if (res) {
          if (this.selected > idx) {
            this.selected--;
          }
          else if (idx === this.selected) {
            this.selectClosest(idx);
          }

          if (!noCfg) {
            this.setConfig();
          }
        }

        return res;
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
        if (bbn.fn.isObject(obj) && bbn.fn.isString(obj.url)) {
          obj.url = bbn.fn.replaceAll('//', '/', obj.url);
          // This is a component
          if (obj.$options) {
            if (!obj.current && !obj.currentURL) {
              if ( bbn.env.path.indexOf(this.getFullBaseURL() + (obj.url ? obj.url + '/' : '')) === 0 ){
                obj.currentURL = bbn.fn.substr(bbn.env.path, this.getFullBaseURL().length);
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
            let obj2 = bbn.fn.extend(true, {}, obj.$options.propsData),
                props = obj.$options.props;
            bbn.fn.iterate(props, (v, i) => {
              if (!(i in obj2) && ('default' in v)) {
                obj2[i] = v.default;
              }
            });
            bbn.fn.iterate(this.getDefaultView(), (a, n) => {
              if ( obj2[n] === undefined ){
                obj2[n] = a;
              }
            });

            // ---- ADDED 16/12/20 (Mirko) ----
            if ( !obj2.current ){
              if ( bbn.env.path.indexOf(this.getFullBaseURL() + (obj2.url ? obj2.url + '/' : '')) === 0 ){
                obj2.current = bbn.fn.substr(bbn.env.path, this.getFullBaseURL().length);
              }
              else{
                obj2.current = obj2.url;
              }
            }
            else if ( (obj2.current !== obj2.url) && (obj2.current.indexOf(obj2.url + '/') !== 0) ){
              obj2.current = obj2.url;
            }
            if ( !obj2.current ){
              obj2.current = obj2.url;
            }
            if ( obj2.content ){
              obj2.loaded = true;
            }
            // ---- END ----

            if (obj2.real && !this.hasRealContainers) {
              this.hasRealContainers = true;
            }
            if (obj2.url === '') {
              this.hasEmptyURL = true;
            }
            if (this.search(obj2.url) === false) {
              if (this.isValidIndex(idx)) {
                this.views.splice(idx, 0, obj2);
              }
              else if (this.hasRealContainers && (this.first !== 'real') && !obj2.real) {
                idx = bbn.fn.search(this.views, {real: true});
                this.views.splice(idx, 0, obj2);
              }
              else {
                this.views.push(obj2);
              }
            }
          }
          else {
            if ( !obj.current ){
              if ( bbn.env.path.indexOf(this.getFullBaseURL() + (obj.url ? obj.url + '/' : '')) === 0 ){
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
                obj.selected = false;
                obj.idx = isValid ? idx : this.views.length;

              bbn.fn.iterate(this.getDefaultView(), (a, n) => {
                if ( obj[n] === undefined ){
                  // Each new property must be set with $set
                  this.$set(obj, n, a);
                }
              });
              obj.uid = obj.url + '-' + bbn.fn.randomString();
              if (isValid) {
                this.views.splice(obj.idx, 0, obj);
              }
              else if (this.hasRealContainers && (this.first !== 'real') && !obj.real) {
                idx = bbn.fn.search(this.views, {real: true});
                this.views.splice(idx, 0, obj);
              }
              else {
                this.views.push(obj);
              }
            }
          }
          this.fixIndexes()
        }
      },
      init(url) {
        if (!this.isInit){
          if (this.numRegistered) {
            this.isInit = true;
          }
          setTimeout(() => {
            if (this.auto) {
              this.route(url, true);
            }
          }, 50)
        }
      },
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
      register(cp, fake) {
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
        if (this.isVisual) {
          cp.$on('view', () => {
            this.visualShowAll = false;
          })
        }
        let idx = this.search(cp.url);
        if (idx === false) {
          this.add(cp);
        }
        else {
          cp.currentIndex = idx;
        }

        //bbn.fn.log(this.numRegistered + " OUT OF " + this.numOutOfPane, cp.currentView.pane)
        if (this.numRegistered === this.numOutOfPane) {
          this.init(this.getDefaultURL());
        }
        this.$emit('registered', cp.url)
      },
      /**
       * Function used by container to make themselves known when they are destroyed
       * @method unregister
       * @fires search
       * @fires remove
       * @param {Vue} cp
       */
      unregister(cp) {
        //bbn.fn.log("UNREGISTERING " + cp.url);
        if (!bbn.fn.isString(cp.url)) {
          throw Error(bbn._('The component bbn-container must have a URL defined'));
        }
        this.numRegistered--;
        let idx = this.search(cp.url),
            dataObj = this.postBaseUrl ? {_bbn_baseURL: this.fullBaseURL} : {},
            requestID = bbn.fn.getRequestId(cp.url, dataObj);
        if (bbn.fn.getLoader(requestID)) {
          bbn.fn.abort(requestID);
        }
        if (this.urls[cp.url] !== undefined) {
          delete this.urls[cp.url];
        }
        if (idx !== false) {
          //this.remove(idx);
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
      getRoute(url, force) {
        if (!bbn.fn.isString(url)) {
          throw Error(bbn._('The bbn-container must have a valid URL defined'));
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
       * Formats a baseURL correctly (without 1st slash and with end slash.
       * @method formatBaseURL
       * @param {String} baseURL
       * @returns {String}
       */
       formatBaseURL(baseURL){
        while ( bbn.fn.substr(baseURL, -1) === '/' ){
          baseURL = bbn.fn.substr(baseURL, 0, baseURL.length-1);
        }
        while ( bbn.fn.substr(baseURL, 0, 1) === '/' ){
          baseURL = bbn.fn.substr(baseURL, 1);
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
          cached: !this.single && this.nav,
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
          pane: false,
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
          events: {},
          real: false,
          last: 0
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
        //bbn.fn.log("ROUTING ON " + url);
        if (!bbn.fn.isString(url)) {
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        url = bbn.fn.replaceAll('//', '/', url);
        /** @var {Boolean} ok Will prevent the route to happen if false */ 
        let ok = true;

        // Looking first in the opened panes if splittable
        if (this.splittable) {
          bbn.fn.each(this.currentPanes, a => {
            bbn.fn.each(a.tabs, (v, i) => {
              if (url.indexOf(v.url) === 0) {
                /** @var {Vue} container The bbn-container component for the given URL if it's in a pane] */
                let container = this.urls[v.url];
                if (!container) {
                  ok = false;
                }
 
                if (a.selected !== i) {
                  a.selected = i;
                  ok = false;
                }

                if (v.current !== url) {
                  v.current = url;
                  if (container) {
                    container.setCurrent(url);
                  }
                }

                return false;
              }
            })
 
            if (!ok) {
              return false;
            }
          });
        }
        if (ok && this.ready && (force || !this.activeContainer || (url !== this.currentURL))) {
          let event = new CustomEvent(
            "beforeroute",
            {
              bubbles: false,
              cancelable: true
            }
          );
          this.$emit("beforeroute", event, url);
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
              if ( idx && this.urls[idx]) {
                url = this.urls[idx].currentURL;
              }
            }

            let st = url ? this.getRoute(url) : '';
            /** @todo There is asomething to do here */
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
                  url = this.urls[st] ? this.urls[st].currentURL : st;
                }
              }
              if (st) {
                if (this.urls[st]) {
                  this.urls[st].setCurrent(url);
                }

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
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        if (this.urls[st]) {
          //bbn.fn.log("REAL ROUTING GOING ON FOR " + url);
          if (!this.urls[st].isPane && (url !== this.currentURL)) {
            //bbn.fn.log("THE URL IS DIFFERENT FROM THE ORIGINAL " + this.currentURL);
            this.currentURL = url;
          }
          // First routing, triggered only once
          if (this.urls[st].currentView.pane) {
            let pane = bbn.fn.getRow(this.currentPanes, {id: this.urls[st].currentView.pane});
            if (pane && pane.tabs) {
              let idx  = bbn.fn.search(pane.tabs, {url: st});
              /*
              if (pane.tabs[idx] && (pane.selected === idx)) {
                this.activate(url, this.urls[st]);
              }
              */
              if (pane.tabs[idx]) {
                this.activate(url, this.urls[st]);
              }
            }
          }
          else {
            if ( !this.routed ){
              this.routed = true;
              this.$emit("route1", this);
              this.$nextTick(this.onResize)
            }

            this.activate(url, this.urls[st]);
          }
          if ( this.urls[st] && this.urls[st].isLoaded ){
            this.urls[st].currentURL = url;
            this.$nextTick(() => {
              let child = this.urls[st].find('bbn-router');
              //bbn.fn.log("LOOKING FOR CHILD", child);
              if ( child ){
                child.route(bbn.fn.substr(url, st.length + 1), force);
              }
              else {
                let ifr = this.urls[st].find('bbn-frame');
                if (ifr) {
                  ifr.route(bbn.fn.substr(url, st.length+1));
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
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        if (!container) {
          let row = bbn.fn.getRow(this.views, {current: url});
          if (!row) {
            row = bbn.fn.getRow(this.views, {url: url});
          }
          if (!row) {
            throw new Error(bbn._("Impossible to find a container for the URL %s", url));
          }
          if (!this.urls[row.url]) {
            throw new Error(bbn._("The container for the URL %s is not registered", row.url));
          }
          container = this.urls[row.url];
        }

        //bbn.fn.log("ACTIVATING " + url + " AND SENDING FOLLOWING CONTAINER:", container);
        if (this.selected !== container.currentIndex) {
          this.$emit('activate', url);
          container.setCurrent(url);
          if (!container.isPane) {
            this.activeContainer = container;
          }
          container.show();
          if (this.scrollable && this.nav && !this.breadcrumb) {
            let scroll = this.getRef('horizontal-scroll');
            let tab = this.getRef('tab-' + container.currentIndex);
            if (scroll.ready) {
              scroll.scrollTo(tab);
            }
            else if (scroll) {
              scroll.$on('ready', sc => {
                setTimeout(() => {
                  sc.scrollTo(this.getRef('tab-' + container.currentIndex));
                }, 100);
              })
            }
          }
        }
        else if (url !== container.currentURL) {
          if (container.routers) {
            let rt;
            bbn.fn.iterate(container.routers, (r, n) => {
              if (!rt) {
                rt = r;
              }

              if (url.indexOf(r.baseURL) === 0) {
                rt = r;
                return false;
              }
            });
            if (rt) {
              rt.route(url.indexOf(rt.baseURL) === 0 ? bbn.fn.substr(url, rt.baseURL.length) : '');
            }
          }
          else {
            this.activeContainer.setCurrent(url);
          }
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
      changeURL(url, title, replace) {
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
          if (this.parentContainer) {
            this.parentContainer.currentTitle = title + ' < ' + this.parentContainer.title;
            if (!this.parentContainer.isPane) {
              this.parent.changeURL(this.baseURL + url, this.parentContainer.currentTitle, replace);
            }
            else {
              this.parentContainer.currentView.current = this.baseURL + url;
            }
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
        if ( fullURL === undefined ){
          return '';
        }
        if (!bbn.fn.isString(fullURL)) {
          fullURL = fullURL.toString();
        }
        if ( fullURL.indexOf(bbn.env.root) === 0 ){
          fullURL = bbn.fn.substr(fullURL, bbn.env.root.length);
        }
        fullURL = bbn.fn.removeTrailingChars(fullURL, '/');
        if (this.fullBaseURL === (fullURL + '/')) {
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
          this.route(
            this.urls[this.views[idx].url] ? this.urls[this.views[idx].url].currentURL
            : this.views[idx].current
          );
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
          if (this.views[i].idx !== i) {
            if (!selectedOk && (this.selected === this.views[i].idx)) {
              this.selected = i;
            }

            this.views[i].idx = i;
          }
        }

        this.setConfig();
      },
      /**
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
      searchForString(needle) {
        let res = [];
        let st = needle.toLowerCase().trim();
        bbn.fn.each(this.views, a => {
          let found = false;
          bbn.fn.iterate(this.routers, router => {
            let tmp = router.searchForString(needle);
            if (tmp.length) {
              bbn.fn.each(tmp, t => {
                t.url = this.getBaseURL() + t.url;
                if (!bbn.fn.getRow(res, {url: t.url})) {
                  found = true;
                  res.push(t);
                }
              });
            }
          });

          if (!found) {
            let match = false;
            let idx = -1;
            let obj = {
              url: a.current || a.url,
              title: this.getFullTitle(a)
            };
            if ((idx = obj.url.toLowerCase().indexOf(st)) > -1) {
              match = "url";
            }
            else if ((idx = obj.title.toLowerCase().indexOf(st)) > -1) {
              match = "title";
            }

            if (match) {
              let url = this.getBaseURL() + obj.url;
              res.push({
                url: url,
                title: obj.title,
                score: match === 'url' ? 10 : 20,
                icon: a.icon || null,
                hash: url,
                bcolor: a.bcolor || null,
                fcolor: a.fcolor || null,
                component: this.$options.components.searchResult,
                match: bbn.fn.substr(obj[match], 0, idx)
                    + '<strong><em>'
                    + bbn.fn.substr(obj[match], idx, st.length)
                    + '</em></strong>'
                    + bbn.fn.substr(obj[match], idx + st.length)
              });
            }
          }
        });

        return res;
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
          throw Error(bbn._('The component bbn-container must have a valid URL defined'));
        }
        if ( this.parent ){
          let containers = this.ancestors('bbn-container');
          url = bbn.fn.substr(this.getFullBaseURL(), this.router.baseURL.length) + url;
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
              let real = router.searchContainer(bbn.fn.substr(url, router.baseURL.length), true);
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
      load(url, force, index){
        if (url) {
          this.isLoading = true;
          let finalURL = this.fullBaseURL + url;
          let idx = this.search(url);
          let toAdd = false;
          let view;
          if ( idx !== false ){
            //bbn.fn.log("INDEX RETRIEVED BEFORE LOAD: " + idx.toString(), JSON.stringify(this.views[idx], null, 2));
            if ( this.views[idx].loading || (!force && !this.views[idx].load) ){
              return;
            }

            view = this.views[idx];
            if (force) {
              let kept = {
                loading: true,
                loaded: false,
                load: true,
                url: view.url,
                current: url,
                selected: true,
                cached: view.cached !== undefined ? view.cached : (this.single || !this.nav ? false : true),
                pane: view.pane,
                title: view.title,
                static: view.static,
                pinned: view.pinned,
                index: idx,
                last: bbn.fn.timestamp()
              };
              if (view.icon) {
                kept.icon = view.icon;
              }
              if (view.bcolor) {
                kept.bcolor = view.bcolor;
              }
              if (view.fcolor) {
                kept.fcolor = view.fcolor;
              }
              bbn.fn.iterate(bbn.fn.extend(this.getDefaultView(), kept), (a, n) => {
                if (view[n] !== a) {
                  this.$set(view, n, a);
                }
              });
              if (this.urls[url]) {
                this.urls[url].isLoaded = false;
                this.urls[url].dirty = false;
              }
            }

            if ((index !== undefined) && (idx !== index)) {
              this.move(idx, index);
              idx = index;
            }
          }
          else{
            toAdd = true;
            idx = index === undefined ? this.views.length : index;
          }

          if (toAdd){
            this.add({
              url: url,
              title: view && view.title ? view.title : bbn._('Loading'),
              load: true,
              loading: true,
              real: false,
              pane: false,
              scrollable: !this.single,
              current: url,
              error: false,
              loaded: false,
              hidden: false,
              last: bbn.fn.timestamp()
            }, idx);
          }
          else if (!this.views[idx].loading) {
            this.views[idx].loading = true;
          }

          if (!this.views[idx].pane) {
            this.selected = idx;
            this.currentURL = this.parseURL(url);
          }

          this.$forceUpdate();
          this.$emit('update', this.views);
          this.$emit("load", finalURL);
          let dataObj = this.postBaseUrl ? {_bbn_baseURL: this.fullBaseURL} : {};
          return this.post(
            finalURL,
            dataObj,
            d => {
              let callRealInit = true;
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
              else {
                bbn.fn.warning(url + ' != ' + d.url);
                let searchIdx = this.search(url);
                if (searchIdx !== false) {
                  idx = searchIdx;
                  this.remove(searchIdx, true);
                }
              }

              if ( d.data && bbn.fn.numProperties(d.data)){
                d.source = d.data;
                delete d.data;
              }
              if ( (d.url !== d.current) && this.urls[d.current] ){
                //bbn.fn.warning("DELETING VIEW CASE.... " + d.current + ' ' + this.urls[d.current].currentIndex, d.url, bbn.fn.search(this.views, {idx: this.urls[d.current].idx}));
                this.remove(this.urls[d.current].currentIndex, true);
                callRealInit = false;
                /*
                this.$on('registered', url => {
                  if (url === d.url) {
                    this.$off('registered', url);
                    let view = bbn.fn.getRow(this.views, {url: url});
                    if ((this.selected === view.idx) || view.pane) {
                      this.realInit(url);
                    }
                  }
                });
                */
                
              }

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

              this.$nextTick(() => {
                let o = bbn.fn.extend(view || {}, d, {loading: false, load: true, real: false, loaded: true});
                let searchIndex = this.search(o.url);
                //bbn.fn.log("Looking for " + o.url);
                if (searchIndex !== false) {
                  //bbn.fn.log("FOUND AND REMOVED " + idx);
                  this.remove(idx, true);
                }
                this.add(o, idx);
                if (o.title && !o.pane) {
                  this.currentTitle = o.title;
                }
                this.$nextTick(() => {
                  if (callRealInit) {
                    this.realInit(d.url);
                  }
                })
              })
            },
            xhr => {
              this.isLoading = false;
              let idx = this.search(this.parseURL(finalURL));
              if ( idx !== false ){
                let url = this.views[idx].url;
                if (this.urls[url]) {
                  this.urls[url].errorStatus = xhr;
                  this.urls[url].setTitle(bbn._("Error"));
                  this.urls[url].setIcon("nf nf-fa-warning");
                  if (this.selected === idx) {
                    this.callRouter(finalURL, url);
                  }
                }
              }
            },
            () => {
              this.isLoading = false;
              let idx = this.search(this.parseURL(finalURL));
              if ( idx !== false ){
                let url = this.views[idx].url;
                if (this.urls[url]) {
                  this.callRouter(finalURL, url);
                  this.$nextTick(() => {
                    this.close(idx);
                  });
                }
              }
            }
          );
        }
      },
      realInit(url) {
        if (this.urls[url]) {
          this.urls[url].setLoaded(true);
          // Otherwise the changes we just did on the props wont be taken into account at container level
          this.urls[url].init();
          this.callRouter(this.urls[url].current, url);
          this.$emit('update', this.views);
        }
        else {
          //bbn.fn.log(url, this.views[0].loading, this.views[0].url, JSON.stringify(Object.keys(this.urls), null, 2));
          //throw new Error(bbn._("Impossible to find the container for URL") + ' ' + url);
        }
      },
      checkLoaded(idx) {
        return this.views[idx] &&
          //!this.views[idx].real &&
          this.views[idx].load &&
          this.urls[this.views[idx].url] &&
          this.urls[this.views[idx].url].isLoaded;
      },
      /**
       * @method reload
       * @param {Number} idx
       * @fires route
       */
      reload(idx, force) {
        if (this.checkLoaded(idx)) {
          let url = this.views[idx].current;
          if (!force
            && !this.ignoreDirty
            && this.isDirty
            && this.views[idx].dirty
          ) {
            this.confirm(this.confirmLeave, () => {
              if (this.checkLoaded(idx)) {
                // Looking for dirty ones in registered forms of each container
                let forms = this.urls[this.views[idx].url].forms;
                if ( Array.isArray(forms) && forms.length ){
                  bbn.fn.each(forms, (f, k) => {
                    f.reset();
                  });
                }
                if (this.urls[this.views[idx].url]
                  && this.urls[this.views[idx].url].popups
                  && this.urls[this.views[idx].url].popups.length
                ) {
                  this.urls[this.views[idx].url].popups.splice(0);
                }
                this.load(url, true, idx);
              }
            });
          }
          else {
            this.$nextTick(() => {
              if (this.urls[this.views[idx].url]
                && this.urls[this.views[idx].url].popups
                && this.urls[this.views[idx].url].popups.length
              ) {
                this.urls[this.views[idx].url].popups.splice(0);
              }
              this.load(url, true, idx);
            });
          }
        }
      },
      /**
       * @method getDefaultURL
       * @fires parseURL
       * @return {String}
       */
      getDefaultURL(){
        let url = '';
        if (this.autoload) {
          url = this.parseURL(bbn.env.path);
        }

        if (!url && this.url ){
          url = this.url;
        }

        // If there is a parent router we automatically give the proper baseURL
        if ( !url && this.parentContainer && (this.parentContainer.currentURL !== this.parentContainer.url) ){
          url = bbn.fn.substr(this.parentContainer.currentURL, this.parentContainer.url.length + 1);
        }

        if ( !url && this.def ){
          url = this.def;
        }

        if (!this.autoload && !url) {
          url = this.parseURL(bbn.env.path);
        }

        return url;
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
            idx = cp.parentTab.currentIndex;
            cp = cp.parentTab.router;
            while ( cp ){
              res += ' < ' + (cp.views[idx].title || bbn._('Untitled'));
              if ( cp.parentTab ){
                idx = cp.parentTab.currentIndex;
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
        bbn.fn.iterate(this.urls, v => {
          if ( v.dirty ){
            this.dirtyContainers.push({
              idx: v.currentIndex,
              url: v.url
            });
          }
        });
      },
      /**
       * @method onEscape
       * @param {Event} e
       */
       onEscape(e) {
        if (this.isVisual && this.visualShowAll) {
          this.visualShowAll = false;
          e.stopPropagation();
          e.preventDefault();
        }
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
        let items     = [];
        let tmp       = ((bbn.fn.isFunction(this.views[idx].menu) ? this.views[idx].menu() : this.views[idx].menu) || []).slice();
        let others    = false;
        let container = this.getVue(idx);
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
                                :full-slide="true"
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

        if (this.views[idx].load && !this.views[idx].component) {
          items.push({
            text: bbn._("Reload"),
            key: "reload",
            icon: "nf nf-mdi-sync",
            action: () => {
              this.reload(idx);
            }
          });
        }

        if (container && container.fullScreen) {
          items.push({
            text: bbn._("Exit full screen"),
            key: "reduce",
            icon: "nf nf-mdi-arrow_collapse",
            action: () => {
              container.fullScreen = false;
            }
          });
        }
        else if (container && !container.isPane) {
          items.push({
            text: bbn._("Enlarge"),
            key: "enlarge",
            icon: "nf nf-mdi-arrow_expand_all",
            action: () => {
              container.fullScreen = true;
            }
          });
        }



        if ( tmp && tmp.length ){
          bbn.fn.each(tmp, (a, i) => {
            items.push(a)
          });
        }

        if ( this.views[idx].icon && this.views[idx].title && !this.isBreadcrumb && !this.isVisual ){
          items.push({
            text: this.views[idx].notext ? bbn._("Show text") : bbn._("Show only icon"),
            key: "notext",
            icon: this.views[idx].notext ? "nf nf-fa-font" : "nf nf-fa-font_awesome",
            action: () => {
              this.$set(this.views[idx], 'notext', !this.views[idx].notext);
            }
          });
        }

        // Adding a shortcut
        if (window.appui) {
          items.push({
            text: bbn._("Create a shortcut"),
            key: "shortcut",
            icon: "nf nf-fa-link",
            action: () => {
              this.$emit('shortcut', {
                text: this.views[idx].title,
                icon: this.views[idx].icon || 'nf nf-fa-link',
                url: this.getFullBaseURL() + this.views[idx].url
              });
            }
          });
        }

        if (container) {
          items.push({
            text: bbn._("Copy content text"),
            icon: "nf nf-fa-copy",
            key: "text_copy",
            action: () => {
              let scroll = container.getRef('scroll');
              let ok = false;
              if (scroll) {
                let scrollContent = scroll.getRef('scrollContent');
                if (scrollContent) {
                  bbn.fn.copy(scrollContent.innerText)
                  ok = true;
                }
              }
              if (ok) {
                appui.success(bbn._("Copied!"))
              }
              else {
                appui.error(bbn._("Not copied!"))
              }
            }
          });
          items.push({
            text: bbn._("Copy content HTML"),
            icon: "nf nf-fa-html5",
            key: "html_copy",
            action: () => {
              let scroll = container.getRef('scroll');
              let ok = false;
              if (scroll) {
                let scrollContent = scroll.getRef('scrollContent');
                if (scrollContent) {
                  bbn.fn.copy(scrollContent.innerHTML)
                  ok = true;
                }
              }
              if (ok) {
                appui.success(bbn._("Copied!"))
              }
              else {
                appui.error(bbn._("Not copied!"))
              }
            }
          });
          items.push({
            text: bbn._("Screenshot"),
            icon: "nf nf-mdi-image_album",
            key: "screenshot",
            items: [
              {
                text: bbn._("Download"),
                key: "screenshot_dl",
                icon: "nf nf-mdi-arrow_expand_all",
                action: () => {
                  container.takeScreenshot().then(canvas => {
                    if (canvas) {
                      bbn.fn.downloadContent(
                        bbn.fn.replaceAll('/', '-', container.getFullCurrentURL() + '_' + bbn.fn.dateSQL(undefined, true) + '.png'),
                        canvas
                      )
                    }
                  });
                }
              }, {
                text: bbn._("Copy"),
                key: "screenshot_copy",
                icon: "nf nf-mdi-image_multiple",
                action: () => {
                  container.takeScreenshot(0.5).then(canvas => {
                    if (canvas) {
                      canvas.toBlob(blob => {
                        bbn.fn.copy(blob).then(() => {
                          appui.success();
                        })
                      });
                    }
                  });
                }
              }, {
                text: bbn._("Copy full size"),
                key: "screenshot_copy",
                icon: "nf nf-mdi-image_multiple",
                action: () => {
                  container.takeScreenshot(1).then(canvas => {
                    if (canvas) {
                      canvas.toBlob(blob => {
                        bbn.fn.copy(blob).then(() => {
                          appui.success();
                        })
                      });
                    }
                  });
                }
              }
            ]
          });
        }

        if (!this.views[idx].static && !this.views[idx].pane){
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

        if ( others && !this.views[idx].pane ){
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


        if (container && this.splittable) {
          if (container.isPane) {
            items.push({
              text: bbn._("Remove from pane"),
              key: "unpane",
              icon: "nf nf-mdi-window_restore",
              action: () => {
                this.removeFromPane(idx);
              }
            });
          }
          else {
            items.push({
              text: bbn._("Show in a new pane"),
              key: "split",
              icon: "nf nf-mdi-format_horizontal_align_right",
              action: () => {
                this.addToPane(idx);
              }
            });
            if (this.currentPanes.length) {
              let tmp = {
                text: bbn._("Show in pane"),
                key: "panes",
                icon: "nf nf-mdi-checkbox_multiple_blank_outline",
                items: []
              };
              bbn.fn.each(this.currentPanes, (a, i) => {
                tmp.items.push({
                  text: 'Pane <div class="bbn-badge">' + (i + 1) + '</div>',
                  key: "pane" + (i+1),
                  action: () => {
                    this.addToPane(idx, a.id);
                  }
                })
              });
              items.push(tmp);
            }
          }
        }

        if ( others && !this.views[idx].static && !this.views[idx].pane){
          items.push({
            text: bbn._("Close All"),
            key: "close_all",
            icon: "nf nf-mdi-close_circle",
            action: () => {
              this.closeAll();
            }
          });
        }

        if (!this.views[idx].pane) {
          items.push({
            text: bbn._("Configuration"),
            key: "config",
            icon: "nf nf-fa-cogs",
            action: () => {
              this.showRouterCfg = true;
            }
          });
        }

        let menu = bbn.fn.isArray(this.menu) ? this.menu : this.menu(this.views[idx], this);
        if (menu.length) {
          bbn.fn.each(menu, a => {
            items.push(a);
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
      getConfig() {
        let cfg = {
          baseURL: this.parentContainer ? this.parentContainer.getFullURL() : this.storageName,
          views: [],
          breadcrumb: this.isBreadcrumb,
          visual: this.isVisual,
          orientation: this.lockedOrientation ? this.visualOrientation : null,
          panes: this.currentPanes.map(a => { return {id: a.id, tabs: a.tabs.map(b => b.url), selected: a.selected}})
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
              pane: obj.pane || false,
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
       * Returns the full title (combination of title and ftitle if any)
       * 
       * @method getFullTitle
       * @param {Object} obj
       * @return {String|null}
       */
      getFullTitle(obj) {
        let t = '';
        if (obj.title) {
          t += obj.title;
        }
        if ( obj.ftitle ){
          t += (t.length ? ' - ' : '') + obj.ftitle;
        }
        return t;
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
       * @method getTab
       * @param {Number} idx
       * @fires getRef
       * @return {HTMLElement}
       */
      getTab(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        return this.getRef('tabs').getRef('tab-' + idx);
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

      /**
       * @method registerRouter
       * @param {Vue} bc
       * @param {String} url
       */
      registerRouter(router) {
        this.routers[bbn.fn.substr(router.getBaseURL(), 0, -1)] = router;
      },
      /**
       * @method unregisterRouter
       * @param {Vue} bc
       * @param {String} url
       */
      unregisterRouter(router){
        delete this.routers[bbn.fn.substr(router.getBaseURL(), 0, -1)];
      },

      //Breadcrumb
      /**
       * @method registerBreadcrumb
       * @param {Vue} bc
       * @param {String} url
       */
      registerBreadcrumb(bc){
        let url = bbn.fn.substr(bc.baseURL, 0, bc.baseURL.length - 1);
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
        if (this.breadcrumbsList) {
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
          if ( !t.hidden && (t.idx !== this.selected) && !t.pane){
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
       * @method onResize
       * @return {Promise}
       */
       onResize() {
        this.keepCool(() => {
          let m = this.setResizeMeasures();
          let c = this.setContainerMeasures();
          if (m || c) {
            this.$emit('resize');
          }
          if (this.isVisual && (this.orientation === 'auto') && !this.lockedOrientation) {
            this.visualOrientation = this.lastKnownWidth > this.lastKnownHeight ? 'left' : 'top';
          }
        }, 'resize', 50);
      },
      /**
       * @method getView
       * @return {Object|null}
       */
      getView(url) {
        return bbn.fn.getRow(this.views, {url: url})
      },
      /**
       * @method visualStyleContainer
       * @return {Object}
       */
      visualStyleContainer(ct) {
        if (!ct.isVisible || this.visualShowAll) {
          return {zoom: 0.1};
        }

        let num = this.numVisuals + 1;
        let coord = [1, num, 1, num];
        switch (this.visualOrientation) {
          case 'up':
            coord[2] = 2;
            break;
          case 'down':
            coord[3] = num - 1;
            break;
          case 'left':
            coord[0] = 2;
            break;
          case 'right':
            coord[1] = num - 1;
            break;
        }

        return {
          gridColumnStart: coord[0],
          gridColumnEnd: coord[1],
          gridRowStart: coord[2],
          gridRowEnd: coord[3],
          zoom: 1
        }
      },
      addPane(paneId) {
        if (this.splittable) {
          if (!paneId) {
            paneId = bbn.fn.randomString().toLowerCase();
          }

          if (!bbn.fn.getRow(this.currentPanes, {id: paneId})) {
            this.currentPanes.push({
              id: paneId,
              tabs: [],
              selected: -1
            });
          }
        }

        return paneId;
      },
      selectPaneTab(pane) {
        let view = pane.tabs[pane.selected];
        if (view) {
          view.last = bbn.fn.timestamp();
        }
      },
      closeTab(idx) {
        this.close(this.tabsList[idx].idx);
      },
      removePane(paneId) {
        if (this.splittable && this.currentPanes) {
          let paneIndex = bbn.fn.search(this.currentPanes, {id: paneId});
          let pane = this.currentPanes[paneIndex];
          if (!pane) {
            throw new Error(bbn._("Impossible to find the pane with ID %s", paneId));
          }
          if (pane.tabs.length) {
            throw new Error(bbn._("Impossible to remove the pane with ID %s as it has still containers inside", paneId));
          }

          this.currentPanes.splice(paneIndex, 1);
          if (this.routed) {
            this.$nextTick(() => {
              this.currentPanes.length ?
                this.getRef('splitter').init()
                : this.getRef('topSplitter').init()
            })
          }
        }
      },
      addToPane(containerIdx, paneId) {
        let view = this.views[containerIdx];
        if (!view) {
          throw new Error(bbn._("Impossible to find the view with index") + ' ' + containerIdx);
        }

        if (view.dirty) {
          this.alert(bbn._("Save your changes or discard them before moving the container"));
          return;
        }

        let pane = bbn.fn.getRow(this.currentPanes, {id: paneId});
        if (!pane) {
          paneId = this.addPane(paneId);
          pane = bbn.fn.getRow(this.currentPanes, {id: paneId});
        }

        this.$set(this.views[containerIdx], "pane", paneId);
        pane.tabs.push(view);
        setTimeout(() => {
          if (containerIdx === this.selected) {
            this.selectClosest(containerIdx);
          }
          pane.selected = pane.tabs.length - 1;
        }, 250);
      },
      removeFromPane(containerIdx) {
        let view = this.views[containerIdx];
        if (view) {
          if (view.dirty) {
            this.alert(bbn._("Save your changes or discard them before moving the container"));
            return;
          }
  
          let paneId = view.pane;
          if (paneId) {
            let pane = bbn.fn.getRow(this.currentPanes, {id: paneId});
            if (pane && pane.tabs) {
              let idx = bbn.fn.search(pane.tabs, {idx: containerIdx});
              if (idx > -1) {
                this.selected = containerIdx;
                view.pane = false;
                this.$nextTick(() => {
                  pane.tabs.splice(idx, 1);
                  if (!pane.tabs.length) {
                    this.removePane(paneId);
                  }
                  else if (pane.selected >= idx) {
                    pane.selected--;
                    this.getRef('pane' + pane.id).onResize(true);
                  }
                })
              }
            }
          }
        }
      },
      slashToHyphen(str) {
        return bbn.fn.replaceAll('/', '-', str);
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
      let storage = !this.single && this.getStorage(this.parentContainer ? this.parentContainer.getFullURL() : this.storageName);
      if (storage && storage.panes) {
        bbn.fn.each(storage.panes, a => {
          this.addPane(a.id);
        })
      }
    },
    /**
     * @event mounted
     * @fires getStorage
     * @fires getDefaultURL
     * @fires add
     */
    mounted() {
      // All routers above (which constitute the fullBaseURL)
      this.parents = this.ancestors('bbn-router');
      // The closest
      this.parent = this.parents.length ? this.parents[0] : false;
      // The root
      this.router = this.parents.length ? this.parents[this.parents.length-1] : this;
      // Case where the rooter is not at the root level
      if ( this.parent ){
        this.parentContainer = this.closest('bbn-container');
        let uri = this.parentContainer.url;
        if (this.root && (uri !== this.root) && (this.root.indexOf(uri) === 0) ){
          uri = this.root;
        }
        this.baseURL = this.formatBaseURL(uri);
      }
      // Case where the rooter is at root level
      else {
        // Opening the database for the visual mode multiview
        if (!this.single && db) {
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
      let storage = !this.single && this.getStorage(this.parentContainer ? this.parentContainer.getFullURL() : this.storageName);
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

      bbn.fn.each(this.source, (a, i) => {
        if (a.url === '') {
          if (a.load) {
            throw new Error(bbn._("You cannot use containers with empty URL for loading"));
          }
          this.hasEmptyURL = true;
        }
        tmp.push(bbn.fn.extendOut(a, {real: false}));
      });

      //Get config from the storage
      if (storage && storage.views && tmp) {
        bbn.fn.each(storage.views, a => {
          let idx = bbn.fn.search(tmp, {url: a.url});
          if ( idx > -1 ){
            // Static comes only from configuration
            let isStatic = tmp[idx].static;
            bbn.fn.extend(tmp[idx], a, {static: isStatic});
          }
          else{
            tmp.push(a);
          }
        });
      }

      // Getting the default URL
      let url = this.getDefaultURL();

      if (this.first !== 'real') {
        tmp = bbn.fn.multiorder(tmp, {real: 'desc'});
      }

      // Adding to the views
      bbn.fn.each(tmp, a => {
        if (!bbn.fn.isString(a.url)) {
          throw new Error(bbn._("The container must have a valid URL"));
        }

        // Setting current if URL starts with default URL
        if (url && url.indexOf(a.url) === 0) {
          a.current = url;
        }

        this.add(a);
      });

      if (this.splittable) {
        if (storage && storage.panes) {
          bbn.fn.each(storage.panes, pane => {
            bbn.fn.each(pane.tabs, tab => {
              let view = bbn.fn.getRow(this.views, {url: tab});
              let realPane = bbn.fn.getRow(this.currentPanes, {id: pane.id});
              if (view && realPane) {
                if (!view.pane) {
                  view.pane = pane.id;
                }
                realPane.tabs.push(view);
              }
            });
          })
        }

        bbn.fn.each(this.views, a => {
          if (a.pane) {
            let pane = bbn.fn.getRow(this.currentPanes, {id: a.pane});
            if (pane && !bbn.fn.getRow(pane.tabs, {url: a.url})) {
              pane.tabs.push(a);
            }
          }
        });

        bbn.fn.each(this.currentPanes, pane => {
          let done = false;
          if (storage && storage.panes) {
            let p = bbn.fn.getRow(storage.panes, {id: pane.id});
            if (p && pane.tabs[p.selected]) {
              pane.selected = p.selected;
              done = true;
            }
            
          }
          if (!done) {
            pane.selected = pane.tabs.length ? 0 : -1;
          }
        })
      }

      //Breadcrumb
      if (!this.master && this.parent && this.parentContainer) {
        this.parent.registerBreadcrumb(this);
        this.parentContainer.$on('view', () => {
          this.parent.registerBreadcrumb(this);
        });
        this.parentContainer.$on('unview', () => {
          this.parent.unregisterBreadcrumb(this);
        });
        if (this.parentContainer.isVisible) {
          this.parent.registerBreadcrumb(this);
        }
      }

      if (this.parentContainer) {
        this.parentContainer.registerRouter(this);
      }

      this.ready = true;

      if (!this.views.length) {
        this.init(url);
      }

    },
    /**
     * @event beforeDestroy
     */
    beforeDestroy(){
      if (!this.master && this.parent){
        this.parent.unregisterBreadcrumb(this);
      }
      if (this.parentContainer) {
        this.parentContainer.unregisterRouter(this);
      }
    },
    watch: {
      numVisuals() {
        this.onResize();
      },
      numPanes() {
        this.onResize();
      },
      visualShowAll(v) {
        if (v && this.isVisual) {
          this.getRef('visualRouter').focus();
        }
      },
      selected(idx) {
        if (this.views[idx]) {
          //bbn.fn.log("In selected watcher " + idx, bbn.fn.filter(this.views, {selected: true}));
          bbn.fn.map(bbn.fn.filter(this.views, {selected: true}), a => {
            if (a.idx !== idx) {
              a.selected = false;
            }
          });
          if (!this.views[idx].selected && !this.views[idx].pane) {
            this.views[idx].selected = true;
          }

          this.views[idx].last = bbn.fn.timestamp();
          if (this.currentURL !== this.views[idx].current) {
            this.route(this.views[idx].current);
          }
        }
        else {
          throw new Error("The view with index " + idx + " doesn't exist");
        }
      },
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
            let idx = this.search(newVal);
            if (idx !== false) {
              let v = this.views[idx];
              let ct = this.urls[v.url];
              if (!v.pane) {
                this.selected = idx;
                if (ct) {
                  this.changeURL(newVal, ct.title);
                }
                else if (this.isLoading) {
                  this.changeURL(newVal, bbn._("Loading"));
                }
              }
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
        if (this.ready) {
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
      currentPanes: {
        deep: true,
        handler() {
          if (this.ready) {
            this.setConfig();
          }
        }
      },
      breadcrumb(v) {
        this.isBreadcrumb = v;
      },
      /**
       * @watch isBreadcrumb
       * @fires setConfig
       */
      isBreadcrumb(newVal){
        this.$nextTick(() => {
          if (this.ready) {
            this.setConfig();
            this.onResize();
          }
        })
      },
      /**
       * @watch isVisual
       * @fires setConfig
       */
       isVisual(v) {
        this.$nextTick(() => {
          if (this.ready) {
            this.setConfig();
            this.onResize();
          }
        })
      }
    },
    components: {
      /**
       * @component listItem
       */
      listItem: {
        template: `
<div class="bbn-w-100 bbn-vmiddle bbn-bordered-bottom"
     style="height: 2.5rem"
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
          <i class="nf nf-fa-angle_right bbn-hsmargin bbn-router-breadcrumb-arrow"/>
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
          @mousedown.prevent.stop="close"
          @mouseup.prevent.stop
          :style="!isHover ? lastColors : {}">
      <i class="nf nf-fa-times_rectangle"/>
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
              if (bbn.fn.isVue(list) && list.source) {
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
      },
      searchResult: {
        template: `
<div class="bbn-router-search-result bbn-w-100 bbn-spadded bbn-default-alt-background bbn-p bbn-hover-effect-element"
     :style="{backgroundColor: source.bcolor, color: source.fcolor}">
  <div class="bbn-flex-width">
    <div class="bbn-flex-fill bbn-nowrap">
      <span class="bbn-s bbn-badge bbn-bg-blue"
            v-text="source.score"/>
      <span v-text="_('Opened container')"/>
      <em v-text="'URL: ' + source.url"></em><br>
      <span class="bbn-lg" v-text="source.title"></span>
    </div>
    <div class="bbn-hlpadded bbn-h-100 bbn-r"
          style="vertical-align: middle"
          v-html="source.match">
    </div>
  </div>
</div>
`,
        props: {
          source: {
            type: Object,
            required: true
          }
        }
      }
    }
  });

})(bbn, Vue);