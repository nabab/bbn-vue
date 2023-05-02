/**
 * @file bbn-container component
 *
 * @description bbn-container is a uniquely identified container component that can be used by bbn-tabnav.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 15/02/2017
 */

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
   * @param {string} current - The URL to which the tabnav currently corresponds (its selected tab).
   * @param {string} baseURL - The parent TabNav's URL (if any) on top of which the tabNav has been built.
   * @param {array} parents - The tabs shown at init.
   * @param {array} tabs - The tabs configuration and state.
   * @param {boolean} parentTab - If the tabNav has a tabNav parent, the tab Vue object in which it stands, false
   * otherwise.
   * @param {boolean|number} selected - The index of the currently selected tab, and false otherwise.
   */

  // Will hold all the current rendered components random names to avoid doubles
return {
    name: 'bbn-container',
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.resizer
     * @mixin bbn.wc.mixins.observer
     */
    static() {
      return {
        componentsList: []
      }
    },
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.resizer, 
      bbn.wc.mixins.observer
    ],
    props: {
      /**
       * The index of the container
       * @prop {Number} idx
       */
      idx: {
        type: Number
      },
      /**
       * The timestamp of the last activation
       * @prop {Number} last
       */
      last: {
        type: Number
      },
      /**
       * A unique id for the container that will ben used as index by the router
       * @prop {String} uid
       */
      uid: {
        type: String,
        default() {
          return bbn.fn.randomString();
        }
      },
      /**
       * A unique id for the container that will ben used as index by the router
       * @prop {String} uid
       */
      visual: {
        type: Boolean,
        default: false
      },
      /**
       * Time between 2 automatic screenshot in visual mode, in milliseconds
       * @prop {Number} [43200000] screenshotDelay (12 hours)
       */
      screenshotDelay: {
        type: Number,
        default: 43200000
      },
      pane: {},
      error: {},
      component: {},
      /**
       * The source of the component.
       * @prop {Object|Function} source
       */
      source: {
        type: [Array, Object, String, Function],
      },
      /**
       * The title of the component.
       * @prop {String|Number} ['Untitled'] title
       */
      title: {
        type: [String, Number],
        default: bbn._("Untitled")
      },
      /**
       * The options object of the component.
       * @prop {Object} options
       */
      options: {
        type: Object,
        default(){
          return {}
        }
      },
      /**
       * Defines if the component has to be cached.
       * @prop {Boolean} [false] cached
       */
      cached: {
        type: Boolean,
        default: false
      },
      /**
       * Defines if the component has to be scrollable.
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: false
      },
      /**
       * Defines the component to use.
       * @prop component
       */
      component: {
        type: [String, Object, Function]
      },
      /**
       * Defines the icon.
       * @prop {String|Boolean} icon
       */
      icon: {
        type: [String, Boolean],
      },
      /**
       * Defines if the component can have a text.
       * @prop {Boolean} [false] notext
       */
      notext: {
        type: Boolean,
        default: false
      },
      /**
       * Defines the component's content.
       * @prop {String} [''] content
       */
      content: {
        type: String,
        default: ""
      },
      /**
       * Defines the menu.
       * @prop {Array|Function} menu
       */
      menu: {
        type: [Array, Function, Boolean]
      },
      /**
       * Defines if the component is loaded.
       * @prop {Boolean} loaded
       */
      loaded: {
        type: Boolean,
        default: false
      },
      /**
       * Tells if the component is currently loading.
       * @prop {Boolean} loading
       */
      loading: {
        type: Boolean,
        default: false
      },
      /**
       * Defines the component's fcolor.
       * @prop {String} fcolor
       */
      fcolor: {
        type: String
      },
      /**
       * Defines the component's bcolor.
       * @prop {String} bcolor
       */
      bcolor: {
        type: String
      },
      /**
       * @prop {Boolean} [false] load
       */
      load: {
        type: Boolean,
        default: false
      },
      /**
       * Defines if the component has to be selected.
       * @prop {Boolean|Number} [false] selected
       */
      selected: {
        type: [Boolean, Number],
        default: false
      },
      /**
       * Defines the css string for the component.
       * @prop {String} [''] css
       */
      css: {
        type: String,
        default: ""
      },
      /**
       * @prop {String|Object} advert
       */
      advert: {
        type: [String, Object]
      },
      /**
       * @prop {String} help
       */
      help: {
        type: String
      },
      /**
       * @prop {Array} imessages
       */
      imessages: {
        type: [Array, Function],
        default() {
          return []
        }
      },
      /**
       * @prop script
       */
      script: {},
      /**
       * Defines if the component has to be static.
       * @prop {Boolean|Number} [false] static
       */
      static: {
        type: [Boolean, Number],
        default: false
      },
      /**
       * Defines
       if the component has to be pinned.
        * @prop {Boolean|Number} [false] pinned
         */
      pinned: {
        type: [Boolean, Number],
        default: false
      },
      /**
       * Defines the url.
       * @prop {String|Number} url
       */
      url: {
        type: [String, Number]
      },
      /**
       * @prop current
       * @prop {String|Number} current
       */
      current: {
        type: [String, Number]
      },
      /**
       * @prop {Boolean} [true] real
       */
      real: {
        type: Boolean,
        default: true
      },
      /**
       * The object of configuration for the component
       * @prop {Object} cfg
       */
      cfg: {
        type: Object
      },
      /**
       * @prop {Object} events
       */
      events: {
        type: Object,
        default(){
          return {}
        }
      },
      /**
       * Defines if the component is disabled.
       * @prop {Boolean} [false] disabled
       */
      disabled: {
        type: [Boolean, Function],
        default: false
      },
      /**
       * Defines if the component is hidden.
       * @prop {Boolean} [false] hidden
       */
      hidden: {
        type: [Boolean, Function],
        default: false
      }
    },
    data(){
      return {
        /**
         * The router which the container belongs to if it exists.
         * @data [null] router
         */
        router: null,
        /**
         * True if the data changes and is unsaved.
         * @data {Boolan} [false] dirty
         */
        dirty: false,
        /**
         * True if the container is a componenent.
         * @data [null] isComponent
         */
        isComponent: null,
        /**
         * True if the container is fullscreen.
         * @data {Boolean} [false] fullScreen
         */
        fullScreen: false,
        /**
         * A random unique component name.
         * @data {String} [this.randomName()] componentName
         */
        componentName: this.randomName(),
        /**
         * The array containing popup objects.
         * @data {Array} [[]] popups
         */
        popups: [],
         /**
         * An object with each mounted children router.
         * @data {Object} [{}] routers
         */
        routers: {},
         /**
         * Time between 2 automatic screenshot in visual mode, in milliseconds
         * @data {Number} currentScreenshotDelay
         */
        currentScreenshotDelay: this.screenshotDelay,
        /**
         * @todo not used
         */
        isComponentActive: false,
        /**
         * True when the component finishes loading.
         * @data {Boolean} isLoaded
         */
        isLoaded: !this.load || this.loaded,
        /**
         * True if the container is pinned.
         * @data {Boolean} isPinned
         */
        isPinned: this.pinned,
        /**
         * True if the container is static.
         * @data {Boolean} isStatic
         */
        isStatic: this.static,
        /**
         * The current url.
         * @data {String} currentURL
         */
        currentURL: this.current || this.url,
        /**
         * Reacts to mouse movements.
         * @data {Boolean} isOver
         */
        isOver: false,
        /**
         * The closest bbn-container if any.
         * @data {Object|null} _bbn_container
         */
        _bbn_container: null,
        /**
         * The base 64 encoded thumbnail image.
         * @data {String} thumbnail
         */
        thumbnail: false,
        /**
         * A list of form components contained in this container
         * @data {Array} [[]] forms
         */
        forms: [],
        /**
         * The error status if loading goes bad.
         * @data {null|Object} errorStatus
         */
        errorStatus: null,
        componentDefinition: false,
        componentTemplate: false,
        componentCSS: false,
        currentIndex: this.idx || null
      };
    },
    computed: {
      /**
       * Defines the css string for the component.
       * @prop {String} [''] css
       */
      currentCss: {
        get(){
          return this.currentView?.css || '';
        },
        set(v){
          if ( this.currentView ){
            this.currentView.css = v;
          }
        }
      },
      /**
       * The source of the component.
       * @prop {Object|Function} source
       */
      currentSource: {
        get(){
          return this.currentView?.source || undefined;
        },
        set(v){
          if ( this.currentView ){
            this.currentView.source = v;
          }
        }
      },
      /**
       * The title of the component.
       * @prop {String|Number} ['Untitled'] title
       */
      currentTitle: {
        get() {
          return this.currentView?.title || bbn._('Untitled');
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.title = v;
          }
        }
      },
      /**
       * The options object of the component.
       * @prop {Object} options
       */
      currentOptions: {
        get() {
          return this.currentView?.options || {};
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.options = v;
          }
        }
      },
      /**
       * Defines if the component has to be cached.
       * @prop {Boolean} [false] cached
       */
      currentCached: {
        get() {
          return this.currentView?.cached || false;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.cached = v;
          }
        }
      },
      /**
       * Defines if the component has to be scrollable.
       * @prop {Boolean} [true] scrollable
       */
      currentScrollable: {
        get() {
          return this.currentView?.scrollable || true;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.scrollable = v;
          }
        }
      },
      /**
       * Defines the component to use.
       * @prop component
       */
      currentComponent: {
        get() {
          return this.currentView?.component || null;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.component = v;
          }
        }
      },
      /**
       * Defines the icon.
       * @prop {String|Boolean} icon
       */
      currentIcon: {
        get() {
          return this.currentView?.icon || null;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.icon = v;
          }
        }
      },
      /**
       * Defines if the component can have a text.
       * @prop {Boolean} [false] notext
       */
      currentNotext: {
        get() {
          return this.currentView?.notext || false;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.notext = v;
          }
        }
      },
      /**
       * Defines the component's content.
       * @prop {String} [''] content
       */
      currentContent: {
        get() {
          return this.currentView?.content || '';
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.content = v;
          }
        }
      },
      /**
       * Defines the menu.
       * @prop {Array|Function} menu
       */
      currentMenu: {
        get() {
          return this.currentView?.menu || null;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.menu = v;
          }
        }
      },
      /**
       * Defines the component's fcolor.
       * @prop {String} fcolor
       */
      currentFcolor: {
        get() {
          return this.currentView?.fcolor || null;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.fcolor = v;
          }
        }
      },
      /**
       * Defines the component's bcolor.
       * @prop {String} bcolor
       */
      currentBcolor: {
        get() {
          return this.currentView?.bcolor || null;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.bcolor = v;
          }
        }
      },
      /**
       * @prop {String|Object} advert
       */
      currentAdvert: {
        get() {
          return this.currentView?.advert || null;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.advert = v;
          }
        }
      },
      /**
       * @prop {String} help
       */
      currentHelp: {
        get() {
          return this.currentView?.help || null;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.help = v;
          }
        }
      },
      /**
       * @prop {Array} imessages
       */
      currentImessages: {
        get() {
          return this.currentView?.imessages || [];
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.imessages = v;
          }
        }
      },
      /**
       * @prop script
       */
      currentScript: {
        get() {
          return this.currentView?.script || null;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.script = v;
          }
        }
      },
      /**
       * @prop current
       * @prop {String|Number} current
       */
      currentCurrent: {
        get() {
          return this.currentView?.current || null;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.current = v;
          }
        }
      },
      /**
       * The object of configuration for the component
       * @prop {Object} cfg
       */
      currentCfg: {
        get() {
          return this.currentView?.cfg || {};
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.cfg = v;
          }
        }
      },
      /**
       * @prop {Object} events
       */
      currentEvents: {
        get() {
          return this.currentView?.events || {};
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.events = v;
          }
        }
      },
      /**
       * Defines if the component is disabled.
       * @prop {Boolean} [false] disabled
       */
      currentDisabled: {
        get() {
          return this.currentView?.disabled || false;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.disabled = v;
          }
        }
      },
      /**
       * Defines if the component is hidden.
       * @prop {Boolean} [false] hidden
       */
      currentHidden: {
        get() {
          return this.currentView?.hidden || false;
        },
        set(v) {
          if ( this.currentView ){
            this.currentView.hidden = v;
          }
        }
      },
      /**
       * True if the router configuration object has pane (ie is in a splitter pane).
       * @data {Boolean} [false] isVisible
       */
      isPane() {
        return !!this.currentView?.pane;
      },
      currentView() {
        if (this.router) {
          return bbn.fn.getRow(this.router.views, {idx: this.currentIndex})
        }

        return undefined;
      },
      /**
       * True if the container is shown.
       * @data {Boolean} [false] isVisible
       */
      isVisible() {
        if (this.router) {

          if (this.isPane) {
            if (!this.router.routed) {
              return false;
            }
            if (this.isLoaded) {
              return true;
            }

            let pane = bbn.fn.getRow(this.router.currentPanes, {id: this.currentView.pane});
            if (pane) {
              let idx = bbn.fn.search(pane.tabs, {url: this.currentView.url});
              if (pane.tabs[idx]) {
                return idx === pane.selected;
              }
            }
            return (this.router.routed && this.isPane) || (this.router.selected === this.currentIndex);
          }
          else {
            return this.router.selected === this.currentIndex;
          }
        }

        return false;
      },
      isVisualVisible() {
        if (this.router?.isVisual) {
          let row = bbn.fn.getRow(this.router.visualList, 'view.idx', this.currentIndex);
          if (row) {
            return row.visible;
          }
        }

        return false;
      },
      visualStyle() {
        let r = this.router;
        if (r && r.isVisual) {
          if ((r.numVisualReals > 0) && (!this.isVisible || r.visualShowAll) && (!this.ready || !this.isPane)) {
            return {
              zoom: 0.1,
              width: '100%',
              height: 'auto',
              overflow: 'hidden'
            };
          }

          let coord = [1, r.numVisualCols + 1, 1, r.numVisualRows + 1];
          if (r.numVisualReals > 0) {
            switch (r.visualOrientation) {
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
            gridColumnStart: coord[0],
            gridColumnEnd: coord[1],
            gridRowStart: coord[2],
            gridRowEnd: coord[3],
            zoom: 1
          };
        }

        return {};
      },
      anonymousComponent(){
        return this.$refs.component;
      }
    },

    methods: {
      /**
       * Returns the full current url.
       * 
       * @method getFullCurrentURL
       * @return {String}
       */
      getFullCurrentURL(){
        return this.router.getFullBaseURL() + this.currentURL;
      },
       /**
       * Returns the full url.
       * 
       * @method getFullURL
       * @return {String}
       */
      getFullURL(){
        return this.router.getFullBaseURL() + this.url;
      },
      /**
       * Sets the value of the property loaded to the given val.
       * 
       * @method setLoaded
       * @param {Boolean} val 
       */
      setLoaded(val){
        this.isLoaded = !!val;
      },
      /**
       * Generates a random name used for the component.
       * 
       * @method randomName
       * @return {String}
       */
      randomName(){
        let n = bbn.fn.randomString(20, 15).toLowerCase();
        while (bbnContainerCreator.componentsList.indexOf(n) > -1 ){
          n = bbn.fn.randomString(20, 15).toLowerCase();
        }
        return n;
      },
      /**
       * Shows the container.
       * 
       * @method show
       */
      show() {
        if (!this.isPane) {
          this.router.selected = this.currentIndex;
          if (this.visual && this.router.visualShowAll) {
            this.router.visualShowAll = false;
          }
        }
      },
      close() {
        if (!this.isPane) {
          this.router.close(this.currentIndex);
        }
      },
      /**
       * Sets the current url.
       * 
       * @method setCurrent
       * @param {String} url 
       */
      setCurrent(url){
        if ( url.indexOf(this.url) === 0 ){
          this.currentURL = url;
          return true;
        }

        return false;
      },
      /**
       * Sets the title of the container.
       * 
       * @method setTitle
       * @param {String} title 
       */
      setTitle(title){
        if ( this.router ){
          if (!this.real) {
            this.router.views[this.currentIndex].title = title;
          }
          else {
            this.currentTitle = title;
          }
        }
      },
      /**
       * Sets the icon of the container.
       * 
       * @method setIcon
       * @param {String} title 
       */
      setIcon(icon){
        if ( this.router ){
          if (!this.real) {
            this.router.views[this.currentIndex].icon = icon;
          }
          else {
            this.currentIcon = icon;
          }
        }
      },
      /**
       * Sets the color.
       * 
       * @method setColor
       * @param {String} bcolor 
       * @param {String} fcolor 
       */
      setColor(bcolor, fcolor){
        if ( this.router ){
          let view = this.router.getView(this.url);
          if (view) {
            if ( bcolor ){
              this.router.$set(view, "bcolor", bcolor);
            }
            if ( fcolor ){
              this.router.$set(view, "fcolor", fcolor);
            }
          }
        }
      },
      /**
       * Gets the popup object.
       *  
       * @method popup
       * @return {Object}
       */
      popup(){
        let popup = this.getPopup();
        return arguments.length ? popup.open.apply(popup, arguments) : popup;
      },
      /**
       * Gets the child component.
       * 
       * @method getComponent
       * @return {Object|Boolean}
       */
      getComponent(){
        return this.getRef('component');
      },
      /**
       * Fires the parent's method enter.
       * 
       * @method enter
       * @fires router.enter
       */
      enter(){
        this.router.enter(this);
      },
      pin() {
        this.router.pin(this.currentIndex);
      },
      unpin() {
        this.router.unpin(this.currentIndex);
      },
      /**
       * Fires the parent's method reload.
       * 
       * @method reload
       * @fires router.reload
       */
      reload(){
        this.popups.splice(0);
        this.$nextTick(() => {
          this.router.reload(this.currentIndex);
        });
      },
      /**
       * Handles the configuration of the container's menu.
       * 
       * @param {Object} obj 
       */
      addMenu(obj){
        if (
          (this.currentIndex > -1) &&
          obj.text &&
          this.router.views &&
          this.router.views[this.currentIndex]
        ){
          if ( this.router.views[this.currentIndex].menu === undefined ){
            this.router.views[this.currentIndex].menu = [];
          }
          let menu = this.router.views[this.currentIndex].menu || [],
              idx = bbn.fn.isFunction(menu) ? -1 : bbn.fn.search(menu || [], {text: obj.text});
          if (idx === -1) {
            if (bbn.fn.isFunction(menu) ){
              this.router.views[this.currentIndex].menu = () => {
                let items = menu() || [];
                if ( bbn.fn.search(items, obj) === -1 ){
                  if ( !obj.key ){
                    obj.key = bbn.fn.randomInt(99999,99999999999);
                  }
                  items.push(obj);
                }
                return items;
              };
            }
            else{
              if ( !obj.key ){
                obj.key = bbn.fn.randomInt(99999,99999999999);
              }
              menu.push(obj);
            }
          }
          else{
            obj.key = menu[idx].key;
            menu.splice(idx, 1, obj);
          }
          this.router.views[this.currentIndex].menu = menu;
          return obj.key;
        }
        return false;
      },
      /**
       * Deletes the given key from the container's menu.
       * 
       * @method deleteMenu
       * @param {String} key 
       */
      deleteMenu(key){
        if (
          (this.currentIndex > -1) &&
          this.router.views &&
          this.router.views[this.currentIndex]
        ){
          let menu = this.router.views[this.currentIndex].menu || [];
          if (bbn.fn.isFunction(menu) ){
            menu = () => {
              let items = menu() || [];
              let idx = bbn.fn.search(items, "key", key);
              if ( idx > -1 ){
                items.splice(idx, 1);
                this.router.views[this.currentIndex].menu = items;
                //this.router.$forceUpdate();
                return true;
              }
            };
          }
          else{
            let idx = bbn.fn.search(menu, "key", key);
            if ( idx > -1 ){
              menu.splice(idx, 1);
              this.router.views[this.currentIndex].menu = menu;
              //this.router.$forceUpdate();
              return true;
            }
          }
        }
        return false;
      },
      onResize(){
        if (this.isVisible && this.ready) {
          bbn.wc.mixins.resizer.methods.onResize.apply(this, arguments);
        }
      },
      /**
       * Initializes the component.
       * 
       * @method init
       */
      init() {
        bbn.fn.log("INIT " + this.currentURL)
        if (this.isVisible && (this.real || (this.isLoaded && !this.ready))) {
          let res;

          if (this.currentScript){
            res = typeof this.currentScript === 'string' ? eval(this.currentView.script) : this.currentView.script;
            bbn.fn.log("************************************", res);
            // if evaluating the script property returns a function that will be onMount
            if (bbn.fn.isFunction(res) ){
              this.onMount = res;
              this.isComponent = false;
            }
            // Otherwise if it's an object we assume it is a component
            else if (res && (typeof(res) === 'object')) {
              res.props = {
                source: {
                  type: Object
                }
              };
              this.componentDefinition = bbn.wc.normalizeComponent(res, 'bbn-container-' + this.getFullURL());
              bbn.fn.log("YUUUU", res, this.componentDefinition, this.currentContent)
              this.componentDefinition.template = this.currentContent;
              this.isComponent = true;
            }
          }
          else if ( this.currentContent ){
            this.isComponent = false;
          }

          if ( this.isComponent ){
            // We create a local component with a random name,
            // the content as template
            // and the object returned as component definition
            // Adding also a few funciton to interact with the tab
            let cont = this;
            this.$el.bbnCfg = bbn.wc.normalizeComponent(bbn.fn.extend(true, res ? res : {}, {
              template: '<div class="' + (this.router.scrollContent ? '' : 'bbn-w-100') + '">' + this.currentView.content + '</div>',
              methods: {
                getContainer(){
                  if (!this._bbn_container) {
                    this._bbn_container = this.closest('bbn-container');
                  }
                  return this._bbn_container;
                },
                getTab(){
                  return this.getContainer();
                },
                addMenu(){
                  return this.getContainer().addMenu.apply(this.router, arguments)
                },
                deleteMenu(){
                  return this.getContainer().deleteMenu.apply(this.router, arguments)
                }
              },
              props: {
                source: {
                  type: Object
                }
              }
            }), 'bbn-container-' + this.getFullURL());
            // The local anonymous component gets defined
            this.$options.components[this.componentName] = this.$el.bbnCfg;
          }
          else {
            this.isComponent = false;
          }

          if (bbn.env.url.indexOf('#')) {
            let scroll = this.getRef('scroll');
            /**
             * @todo  Does it mean the scroll manage the hash? Check it out
             */
            if (scroll && (scroll.currentY || scroll.currentX)) {
              return;
            }
            let hash = bbn.env.url.split('#')[1];
            if (hash) {
              hash = '#' + hash;
              location.hash = null;
              location.hash = hash;
            }
            
          }
          if (this.visual) {
            this.setScreenshot();
          }

          this.ready = true;
        }
      },
      showMenu() {
        return this.router.getMenuFn(this.currentIndex);
      },
      setScreenshot() {
        if (!this._screenshotInterval && this.router.isVisual && this.router.db && !this.isPane) {
          let url = this.getFullURL();
          this.router.db.selectOne('containers', 'time', {url: url}).then(time => {
            // Checking if we have a screenshot of less than an hour
            if ((bbn.fn.timestamp() - (time || 0)) >= this.currentScreenshotDelay) {
              this.saveScreenshot(0.1, 10000);
            }
          }).catch(() => {
            this.saveScreenshot(0.1, 10000);
          });

          this._screenshotInterval = setInterval(() => {
            this.saveScreenshot(0.1);
          }, this.currentScreenshotDelay);
        }
      },
      unsetScreenshot() {
        if (this._screenshotInterval) {
          clearInterval(this._screenshotInterval);
          this._screenshotInterval = false;
          if (this._screenshotTimeout) {
            clearTimeout(this._screenshotTimeout);
            this._screenshotTimeout = false;
          }
        }
      },
      async saveScreenshot(scale = 0.1, timeout = 0) {
        if (this.router.db && (this.currentView.idx === this.router.selected) && !this.isPane) {
          let img       = await this.takeScreenshot(scale, timeout, true);
          let num_tries = 0;
          while (!img && (num_tries < 5)) {
            num_tries++;
            img = await this.takeScreenshot(scale, 5000);
          }
          if (!img) {
            bbn.fn.log(bbn._("Impossible to take the screenshot of") + ' ' + this.getFullCurrentURL());
            return;
            //throw new Error(bbn._("Impossible to take the screenshot of " + this.getFullCurrentURL()));
          }
          this.thumbnail = img.src;
          // This is in fact an insert/update
          this.router.db.insert('containers', {
            url: this.getFullURL(),
            image: img.src,
            time: bbn.fn.timestamp()
          });
        }
      },
      takeScreenshot(scale = 1, timeout = 0, image = false, force = false) {
        return new Promise(resolve => {
          if (this._screenshotTimeout) {
            if (force) {
              clearTimeout(this._screenshotTimeout);
            }
            else {
              resolve(false);
            }
          }

          this._screenshotTimeout = setTimeout(() => {
            let exit = () => {
              this._screenshotTimeout = false;
              resolve(false);
            };
            if ((this.currentIndex === this.router.selected)
                && this.isVisible
                && window.html2canvas
                && bbn.fn.isActiveInterface(600)
                && !this.router.visualShowAll
            ) {
              let scroll = this.getRef('scroll');
              if (!scroll) {
                return exit();
              }

              if (scroll.$el) {
                scroll = scroll.$el;
              }

              let w  = scroll.clientWidth;
              let h  = scroll.clientHeight;
              let s = Math.min(w, h);
              let ct = this.getRef('canvasSource');
              if (!ct || !s) {
                return exit();
              }

              ct.style.width = s + 'px !important';
              ct.style.height = s + 'px !important';
              html2canvas(ct, {
                width: s,
                height: s,
                scale: scale
              }).then(canvas => {
                ct.style.width = null;
                ct.style.height = null;
                this._screenshotTimeout = false;
                if (!image) {
                  resolve(canvas);
                  return;
                }
                let img   = bbn.fn.canvasToImage(canvas);
                let ctx   = canvas.getContext('2d');
                let size  = Math.min(canvas.width, canvas.height);
                let num   = Math.min(this.router.numVisualCols, this.router.numVisualRows);
                let msize = Math.ceil(size / num);
                ctx.drawImage(img, 0, 0, size, size, 0, 0, msize, msize);
                resolve(img);
              });
            }
            else {
              exit();
            }
          }, timeout)
        })
      },
      updateScreenshot() {
        if (this.visual && this.router.db) {
          let url = this.getFullURL();
          this.router.db.selectOne('containers', 'image', {url: url}).then(res => {
            if (res) {
              this.thumbnail = res;
            }
          });
        }
      },
      /**
       * @method registerRouter
       * @param {Object} bc
       * @param {String} url
       */
      registerRouter(router) {
        this.routers[bbn.fn.substr(router.getBaseURL(), 0, -1)] = router;
        this.router.registerRouter(router);
      },
      /**
       * @method unregisterRouter
       * @param {Object} bc
       * @param {String} url
       */
      unregisterRouter(router){
        delete this.routers[bbn.fn.substr(router.getBaseURL(), 0, -1)];
        this.router.unregisterRouter(router);
      },
    },
    /**
     * @event created 
     */
    created() {
      this.componentClass.push('bbn-resize-emitter');
      if ( this.isComponent ){
        bbnContainerCreator.componentsList.push(this.componentName);
      }
      else if ( this.isComponent === null ){
        // The default onMount function is to do nothing.
        this.onMount = () => {
          return false;
        };
      }
    },
    beforeMount() {
      // The router is needed
      this.updateScreenshot()
      this._screenshotInterval = false;
      this.router = this.closest('bbn-router');
      //const cp = this.getRef('component');
    },
    /**
     * @event mounted
     * @fires router.register
     */
    mounted(){
      bbn.fn.log("MOUNTED CONTAINER " + this.url);
      if ( !this.router ){
        throw new Error(bbn._("bbn-container cannot be rendered without a bbn-router"));
      }

      if ( !this.router.ready ){
        this.router.$on('ready', () => {
          this.init();
        });
      }
      else{
        this.init();
        this.router.register(this);
      }
      this.$el.title = '';
      //
      // The container is registered
    },
    /**
     * @event beforeDestroy
     * @fires router.unregister
     */
    beforeDestroy(){
      if (this.router) {
        this.router.unregister(this);
      }

      if ( this.isComponent ){
        let idx = bbnContainerCreator.componentsList.indexOf(this.componentName);
        if ( idx > -1 ){
          bbnContainerCreator.componentsList.splice(idx, 1);
        }
      }
    },

    watch: {
      currentView: {
        deep: true,
        handler(v) {
          bbn.fn.log("DEEP HANDLER ON VIEW");
          this.$tick();
        }
        /*
        bbn.fn.iterate(v, (a, n) => {
          let name = 'c' + bbn.fn.correctCase(n);
          if (Object.hasOwn(this, name) && !bbn.fn.isSame(this[name], a)) {
            this[name] = a;
            bbn.fn.log("***************** CHANGING " + name + " IN CURRENT VIEW FOR " + this.url + " *****************")
          }
        });
        */
      },
      /**
       * The source of the component.
       * @prop {Object|Function} source
       */
      source(v) {
        this.currentView.source = v;
      },
      /**
       * The options object of the component.
       * @prop {Object} options
       */
      options(v) {
        this.currentView.options = v;
      },
      /**
       * Defines if the component has to be cached.
       * @prop {Boolean} [false] cached
       */
      cached(v) {
        this.currentView.cached = v;
      },
      /**
       * Defines if the component has to be scrollable.
       * @prop {Boolean} [true] scrollable
       */
      scrollable(v) {
        this.currentView.scrollable = v;
      },
      /**
       * Defines the component to use.
       * @prop component
       */
      component(v) {
        this.currentView.component = v;
      },
      /**
       * Defines the icon.
       * @prop {String|Boolean} icon
       */
      icon(v) {
        this.currentView.icon = v;
      },
      /**
       * Defines if the component can have a text.
       * @prop {Boolean} [false] notext
       */
      notext(v) {
        this.currentView.notext = v;
      },
      /**
       * Defines the component's content.
       * @prop {String} [''] content
       */
      content(v) {
        this.currentView.content = v;
      },
      /**
       * Defines the menu.
       * @prop {Array|Function} menu
       */
      menu(v) {
        this.currentView.menu = v;
      },
      /**
       * Defines the component's fcolor.
       * @prop {String} fcolor
       */
      fcolor(v) {
        this.currentView.fcolor = v;
      },
      /**
       * Defines the component's bcolor.
       * @prop {String} bcolor
       */
      bcolor(v) {
        this.currentView.bcolor = v;
      },
      /**
       * Defines the css string for the component.
       * @prop {String} [''] css
       */
      css(v) {
        this.currentView.css = v;
      },
      /**
       * @prop {String|Object} advert
       */
      advert(v) {
        this.currentView.advert = v;
     },
      /**
       * @prop {String} help
       */
      help(v) {
        this.currentView.help = v;
      },
      /**
       * @prop {Array} imessages
       */
      imessages(v) {
        this.currentView.imessages = v;
      },
      /**
       * @prop script
       */
      script(v) {
        this.currentView.script = v;
      },
      /**
       * The object of configuration for the component
       * @prop {Object} cfg
       */
      cfg(v) {
        this.currentView.cfg = v;
      },
      /**
       * @prop {Object} events
       */
      events(v) {
        this.currentView.events = v;
      },
      /**
       * Defines if the component is disabled.
       * @prop {Boolean} [false] disabled
       */
      disabled(v) {
        this.currentView.disabled = v;
      },
      /**
       * Defines if the component is hidden.
       * @prop {Boolean} [false] hidden
       */
      hidden(v) {
        this.currentView.hidden = v;
      },
      title(v) {
        this.currentView.title = v;
      },
      loaded(v) {
        this.isLoaded = v;
      },
      loading(v) {
        this.isLoading = v;
      },
      current(newVal){
        if (newVal.indexOf(this.url) === 0){
          this.currentURL = newVal;
        }
        this.currentView.current = v;
      },
      /**
       * @watch currentUrl
       * @param {String} newVal 
       * @param {String} oldVal 
       */
      currentURL(newVal, oldVal){
        // Auto cancelling if it does not correspond to the url
        if ( !newVal || (newVal.indexOf(this.url) !== 0) ){
          this.currentURL = this.url;
        }
        // Routing if the router has different info
        else if (this.currentView && (this.currentView.current !== newVal)) {
          this.router.route(newVal)
        }
      },
      ready(v){
        if (v) {
          if (this.onMount) {
            this.onMount(this.$el, this.source);
          }
        }
      },
      /**
       * @watch visible
       * @param {Boolean} nv 
       * @param {Boolean} ov 
       * @fires selfEmit
       */
      isVisible(nv) {
        bbn.fn.log("Changing isVisible for " + this.currentURL);
        let emit = true;

        if (!this.isPane && this.router?.isVisual) {
          if (nv) {
            this.setScreenshot()
          }
          else {
            this.unsetScreenshot();
          }
        }

        if (emit) {
          this.$emit(nv ? 'view' : 'unview', this);
        }

        if (nv && this.router) {
          if (!this.isLoaded && !this.isLoading) {
            this.router.load(this.currentURL, true)
          }

          if (!this.ready) {
            this.$nextTick(() => {
              this.onResize();
              this.init();
            }); 
          }
          else {
            this.$updateComponent();
          }
        }
      },
      /**
       * @watch content
       * @param {Boolean} newVal 
       * @param {Boolean} oldVal 
       */
      content(newVal, oldVal){
        if ( newVal ){
          bbn.fn.log("GT CONTENT")
          this.isComponentActive = false;
          const cp = this.getRef('component')
          if (cp) {
            bbn.fn.log("COUND CP{")
            cp.$el.bbnTpl = stringToTemplate(newVal)
          }
    
          /*
          setTimeout(() => {
            this.onMount = () => {
              return false;
            };
            let res;
            if ( this.script ){
              res = typeof this.script === 'string' ? eval(this.script) : this.script;
              if (bbn.fn.isFunction(res) ){
                this.onMount = res;
                this.isComponent = false;
              }
              else if ( typeof(res) === 'object' ){
                this.isComponent = true;
              }
            }
            else if ( this.source && this.content ){
              bbn.fn.extend(res ? res : {}, {
                name: this.name,
                template: '<div class="bbn-overlay">' + this.content + '</div>',
                props: ['source']
              });
            }
            else{
              this.isComponent = false;
            }
            this.isComponentActive = true;
          }, oldVal ? 200 : 0)
          */
        }
      },
      /**
       * If true adds the event listener keydown, or else removes the event listener.
       * @watch fullScreen
       * @param {Boolean} newVal 
       * @fires selfEmit
       */
      fullScreen(newVal){
        let fn = e => {
          if ( e.keyCode === 27 ){
            this.fullScreen = false;
          }
        };
        if ( newVal ){
          document.body.addEventListener('keydown', fn);
        }
        else{
          document.body.removeEventListener('keydown', fn);
        }
        this.$nextTick(() => {
          this.selfEmit(true)
        })
      },
      dirty(v){
        let view = this.router.getView(this.url);
        if (view) {
          view.dirty = v;
          this.router.retrieveDirtyContainers();
        }
      }
    },

  };
