(bbn_resolve) => {
((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-overlay']"
     @subready.stop
     v-show="visible">
  <transition name="fade"
              v-if="!hidden"
              v-on:enter="enter"
              v-on:after-enter="onResize"
  >
    <div :class="{
      'bbn-background': true,
      'bbn-overlay': !fullScreen,
      'bbn-container-full-screen': fullScreen,
      'bbn-container-visible': visible
     }">
      <component :is="scrollable ? 'bbn-scroll' : 'div'"
                v-if="ready && isLoaded && (visible || cached)"
                v-show="visible"
                ref="scroll"
                :axis="scrollable ? 'y' : null"
                class="bbn-overlay">
        <!-- This is an ad hoc component with unique name -->
        <component v-if="isComponent"
                  :is="$options.components[componentName]"
                  :source="source"
                  ref="component"
        ></component>
        <!-- This is a classic component -->
        <component v-else-if="component"
                  :is="component"
                  :source="source"
                  ref="component"
                  v-bind="options"
        ></component>
        <!-- This is just HTML content -->
        <div v-else-if="content"
             v-html="content">
        </div>
        <!-- This is the slot -->
        <slot v-else></slot>
        <component is="style"
                   v-if="css"
                   scoped="scoped"
                   v-html="css"/>
        <bbn-loader v-if="hasLoader"/>
      </component>
      <span  v-if="fullScreen"
            class="bbn-container-full-screen-closer bbn-xl bbn-p">
        <i class="nf nf-fa-times_circle"
          @click="fullScreen = false"/>
      </span>
      <bbn-popup ref="popup"
                :source="popups"
                v-if="!hidden && ready && isLoaded && (visible || cached)"/>
    </div>
  </transition>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-container');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/container/container.css");
document.head.insertAdjacentElement('beforeend', css);
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
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.viewComponent, bbn.vue.observerComponent],
    props: {
      /**
       * The index of the container
       * @prop {Number} idx
       */
      idx: {
        type: Number
      },
    },
    data(){
      return {
        /**
         * True if the container is visible.
         * @data {Boolean} [false] isVisible
         */
        isVisible: false,
        /**
         * The router which the container belongs to if it exists.
         * @data [null] router
         */
        router: null,
        /**
         * True if the container shows.
         * @data {Boolean} [false] visible
         */
        visible: false,
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
         * The index of the container.
         * @data {Number} currentIndex
         */
        currentIndex: this.idx,
        /**
         * The current url.
         * @data {String} currentURL
         */
        currentURL: this.current || this.url,
        currentTitle: this.title,
        hasLoader: false,
        _bbn_container: null
      };
    },
    computed: {
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
        this.visible = true
      },
      /**
       * Hides the container.
       * 
       * @method hide
       */
      hide(){
        this.visible = false
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
          this.router.views[this.currentIndex].title = title;
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
            this.router.$set(this.router.views[this.currentIndex], "bcolor", bcolor);
          }
          if ( fcolor ){
            this.router.$set(this.router.views[this.currentIndex], "fcolor", fcolor);
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
      /**
       * Fires the parent's method reload.
       * 
       * @method reload
       * @fires $parent.reload
       */
      reload(){
        this.router.reload(this.currentIndex);
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
          this.$emit("resize");
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
              template: '<div class="' + (this.scrollable ? '' : 'bbn-overlay') + '">' + this.content + '</div>',
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

          this.ready = true;
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
    },
    /**
     * @event mounted
     * @fires router.register
     */
    mounted(){
      // The router is needed
      this.router = this.closest('bbn-router');
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
      title(v) {
        this.currentTitle = v;
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
        //bbn.fn.log("DIRTY WATCHER", this.currentIndex, this.router.views);
        this.router.views[this.currentIndex].dirty = v;
        this.router.retrieveDirtyContainers();
      }
    },

  });

})(bbn, Vue);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}