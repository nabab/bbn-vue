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

 (function(bbn, Vue){
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
   * @param {string} current - The URL to which the tabnav currently corresponds (its selected tab).
   * @param {string} baseURL - The parent TabNav's URL (if any) on top of which the tabNav has been built.
   * @param {array} parents - The tabs shown at init.
   * @param {array} tabs - The tabs configuration and state.
   * @param {boolean} parentTab - If the tabNav has a tabNav parent, the tab Vue object in which it stands, false
   * otherwise.
   * @param {boolean|number} selected - The index of the currently selected tab, and false otherwise.
   */

  // Will hold all the current rendered components random names to avoid doubles
  let componentsList = [];

  Vue.component("bbn-container", {
    name: 'bbn-container',
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.viewComponent
     * @mixin bbn.vue.observerComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.resizerComponent, 
      bbn.vue.viewComponent, 
      bbn.vue.observerComponent
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
      visual: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        /**
         * True if the container is visible.
         * @data {Boolean} [false] isVisible
         */
        isVisible: this.loading,
        /**
         * The router which the container belongs to if it exists.
         * @data [null] router
         */
        router: null,
        /**
         * True if the container shows.
         * @data {Boolean} [false] visible
         */
        visible: this.loading,
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
        hasLoader: false,
        isOver: false,
        _bbn_container: null,
        thumbnail: false,
        /**
         * A list of form components contained in this container
         * @data {Array} [[]] forms
         */
        forms: []
      };
    },
    computed: {
      visualStyle() {
        if (this.visual) {
          let r = this.router;
          if ((r.views.length > 1) && (!this.visible || r.visualShowAll)) {
            return {
              zoom: 0.1,
              width: '100%',
              height: 'auto',
              overflow: 'hidden'
            };
          }

          let coord = [1, r.numVisualCols + 1, 1, r.numVisualRows + 1];
          if (r.views.length > 1) {
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
        while ( componentsList.indexOf(n) > -1 ){
          n = bbn.fn.randomString(20, 15).toLowerCase();
        }
        return n;
      },
      /**
       * Shows the container.
       * 
       * @method show
       */
      show(){
        this.visible = true;
        if (this.visual && this.router.visualShowAll) {
          this.router.visualShowAll = false;
        }
        return true;
      },
      /**
       * Hides the container.
       * 
       * @method hide
       */
      hide(){
        this.visible = false
        return true;
      },
      close() {
        this.router.close(this.idx);
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
          this.router.views[this.idx].title = title;
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
          if ( bcolor ){
            this.router.$set(this.router.views[this.idx], "bcolor", bcolor);
          }
          if ( fcolor ){
            this.router.$set(this.router.views[this.idx], "fcolor", fcolor);
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
       * @fires $parent.enter
       */
      enter(){
        this.$parent.enter(this);
      },
      pin() {
        this.router.pin(this.idx);
      },
      unpin() {
        this.router.unpin(this.idx);
      },
      /**
       * Fires the parent's method reload.
       * 
       * @method reload
       * @fires $parent.reload
       */
      reload(){
        this.router.reload(this.idx);
      },
      /**
       * Handles the configuration of the container's menu.
       * 
       * @param {Object} obj 
       */
      addMenu(obj){
        if (
          (this.idx > -1) &&
          obj.text &&
          this.$parent.views &&
          this.$parent.views[this.idx]
        ){
          if ( this.$parent.views[this.idx].menu === undefined ){
            this.$parent.views[this.idx].menu = [];
          }
          let menu = this.$parent.views[this.idx].menu || [],
              idx = bbn.fn.isFunction(menu) ? -1 : bbn.fn.search(menu || [], {text: obj.text});
          if (idx === -1) {
            if (bbn.fn.isFunction(menu) ){
              this.$parent.views[this.idx].menu = () => {
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
          this.$parent.views[this.idx].menu = menu;
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
          (this.idx > -1) &&
          this.$parent.views &&
          this.$parent.views[this.idx]
        ){
          let menu = this.$parent.views[this.idx].menu || [];
          if (bbn.fn.isFunction(menu) ){
            menu = () => {
              let items = menu() || [];
              let idx = bbn.fn.search(items, "key", key);
              if ( idx > -1 ){
                items.splice(idx, 1);
                this.$parent.views[this.idx].menu = items;
                this.$parent.$forceUpdate();
                return true;
              }
            };
          }
          else{
            let idx = bbn.fn.search(menu, "key", key);
            if ( idx > -1 ){
              menu.splice(idx, 1);
              this.$parent.views[this.idx].menu = menu;
              this.$parent.$forceUpdate();
              return true;
            }
          }
        }
        return false;
      },
      onResize(){
        if (this.visible && this.ready) {
          bbn.vue.resizerComponent.methods.onResize.apply(this, arguments);
        }
      },
      /**
       * Initializes the component.
       * 
       * @method init
       */
      init(){
        if ( this.real || (this.isLoaded && !this.ready) ){
          let res;
          //bbn.fn.log("INITIATING CONTAINER " + this.url + " " + (this.script ? "(THERE IS A SCRIPT)" : ""));

          if ( this.script ){
            res = typeof this.script === 'string' ? eval(this.script) : this.script;
            // if evaluating the script property returns a function that will be onMount
            if ( res ){
              if (bbn.fn.isFunction(res) ){
                this.onMount = res;
                this.isComponent = false;
              }
              // Otherwise if it's an object we assume it is a component
              else if ( typeof(res) === 'object' ){
                //bbn.fn.log("THERE IS SCRIPT for " + this.url + " AND IT IS AN OBJECT");
                this.isComponent = true;
              }
              else{
                //bbn.fn.log("THERE IS SCRIPT for " + this.url + " AND WTF???");
              }
            }
          }
          else if ( this.content ){
            this.isComponent = false;
          }

          if ( this.isComponent ){
            // We create a local component with a random name,
            // the content as template
            // and the object returned as component definition
            // Adding also a few funciton to interact with the tab
            let cont = this;
            let o = bbn.fn.extend(true, res ? res : {}, {
              template: '<div class="' + (this.router.scrollContent ? '' : 'bbn-w-100') + '">' + this.content + '</div>',
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
                  return this.getContainer().addMenu.apply(this.$parent, arguments)
                },
                deleteMenu(){
                  return this.getContainer().deleteMenu.apply(this.$parent, arguments)
                }
              },
              props: ['source']
            });
            // The local anonymous component gets defined
            this.$options.components[this.componentName] = o;
          }
          else{
            this.isComponent = false;
          }

          setTimeout(() => {
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
          }, 2000);
          if (this.visual) {
            this.setScreenshot();
          }

          this.ready = true;
        }
      },
      showMenu() {
        return this.router.getMenuFn(this.idx);
      },
      setScreenshot() {
        setTimeout(() => {
          if (this.selected) {
            this.takeScreenshot();
            this._screenshotInterval = setInterval(() => {
              this.takeScreenshot();
            }, 30000);
          }
        }, 3000);
      },
      unsetScreenshot() {
        if (this._screenshotInterval) {
          clearInterval(this._screenshotInterval)
          this._screenshotInterval = false;
        }
      },
      takeScreenshot(num_tries = 0) {
        if (this.selected && this.router.db && window.html2canvas && document.hasFocus()) {
          let scroll = this.getRef('scroll');
          if (!scroll) {
            if (num_tries <= 10) {
              setTimeout(() => {
                return this.takeScreenshot(num_tries + 1);
              }, 1000);
              return;
            }
          }

          if (scroll.$el) {
            scroll = scroll.$el;
          }
          let w  = scroll.clientWidth;
          let h  = scroll.clientHeight;
          let ct = this.getRef('canvasSource');
          if (!ct || !w || !h) {
            if (num_tries <= 10) {
              setTimeout(() => {
                return this.takeScreenshot(num_tries + 1);
              }, 1000);
              return;
            }
          }

          ct.style.width = w + 'px !important';
          ct.style.height = h + 'px !important';
          html2canvas(this.getRef('canvasSource'), {
            width: w,
            height: h,
            windowWidth: w,
            windowHeight: h
          }).then(
            canvas => {
              ct.style.width = null;
              ct.style.height = null;

              let img = bbn.fn.canvasToImage(canvas);
              if (!img) {
                bbn.fn.log("Error for screenshot image");
                return;
              }

              let ctx   = canvas.getContext('2d');
              let size  = Math.min(w, h);
              let num   = Math.min(this.router.numVisualCols, this.router.numVisualRows);
              let msize = Math.ceil(size / num);
              ctx.drawImage(img, 0, 0, size, size, 0, 0, msize, msize);
              this.thumbnail = img.src;
              // This is in fact an insert/update
              this.router.db.insert('containers', {
                url: this.getFullURL(),
                image: img.src
              });
            }
          ).catch(e => {
            ct.style.width = null;
            ct.style.height = null;
            bbn.fn.log(w, h, "ERROR", e);
          });
        }
      },
      updateScreenshot() {
        if (this.visual && this.router.db) {
          let url = this.getFullURL();
          this.router.db.selectOne('containers', 'image', {url: url}).then(res => {
            if (res) {
              this.thumbnail = res;
            }
          })
        }
      }
    },
    /**
     * @event created 
     */
    created(){
      this.componentClass.push('bbn-resize-emitter');
      if ( this.isComponent ){
        componentsList.push(this.componentName);
      }
      else if ( this.isComponent === null ){
        // The default onMount function is to do nothing.
        this.onMount = () => {
          return false;
        };
        let res;
      }

      // The router is needed
      this.router = this.closest('bbn-router');
      this.updateScreenshot()
      this._screenshotInterval = false;
    },
    /**
     * @event mounted
     * @fires router.register
     */
    mounted(){
      if ( !this.router ){
        throw new Error(bbn._("bbn-container cannot be rendered without a bbn-router"));
      }

      if ( !this.router.ready ){
        this.router.$on('ready', () => {
          //this.init();
          this.router.register(this);
        });
      }
      else{
        //this.init();
        this.router.register(this);
      }
      //
      // The container is registered
    },
    /**
     * @event beforeDestroy
     * @fires router.unregister
     */
    beforeDestroy(){
      this.router.unregister(this);
      if ( this.isComponent ){
        let idx = componentsList.indexOf(this.componentName);
        if ( idx > -1 ){
          componentsList.splice(idx, 1);
        }
      }
    },

    watch: {
      loaded(v) {
        this.isLoaded = v;
      },
      loading(v) {
        this.isLoading = v;
      },
      selected(v) {
        this.visible = v;
        if (this.visual) {
          if (v) {
            this.setScreenshot()
          }
          else {
            this.unsetScreenshot();
          }
        }
      },
      idx() {
        if (this.visual) {
          this.isOver = false;
        }
      },
      current(newVal){
        if (newVal.indexOf(this.url) === 0){
          this.currentURL = newVal;
        }
      },
      /**
       * @watch currentUrl
       * @param {String} newVal 
       * @param {String} oldVal 
       */
      currentURL(newVal, oldVal){
        if ( !newVal || (newVal.indexOf(this.url) !== 0) ){
          this.currentURL = this.url;
        }
      },
      ready(v){
        if (v) {
          if (this.onMount) {
            this.onMount(this.$el, this.source);
          }
        }
      },
      load(nv, ov){
        /** Why????
        if ( nv && this.$options.components[this.componentName] ){
          delete this.$options.components[this.componentName];
        }
        else if ( !nv && ov ){
          this.init()
        }
         */
      },
      /**
       * @watch visible
       * @param {Boolean} nv 
       * @param {Boolean} ov 
       * @fires selfEmit
       */
      visible(nv, ov){
        this.$nextTick(() => {
          this.$emit(nv ? 'view' : 'unview', this);
          if (nv) {
            this.$nextTick(() => {
              this.onResize();
            });
          }
        });
      },
      /**
       * @watch content
       * @param {Boolean} newVal 
       * @param {Boolean} oldVal 
       */
      content(newVal, oldVal){
        if ( newVal ){
          this.isComponentActive = false;
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
        //bbn.fn.log("DIRTY WATCHER", this.idx, this.router.views);
        this.router.views[this.idx].dirty = v;
        this.router.retrieveDirtyContainers();
      }
    },

  });

})(bbn, Vue);
