/**
 * @file bbn-container component
 *
 * @description bbn-container is a component that can be used or not by bbn-tabnav.
 * Represents a uniquely identifiable container that includes what the user desires.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 15/02/2017
 */

(function($, bbn, Vue){
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
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.viewComponent, bbn.vue.observerComponent],
    props: {
      idx: {
        type: Number
      },
    },
    data(){
      return {
        isVisible: false,
        // The router to which belongs the container if any
        router: null,
        // Should the conatiner be shown
        visible: false,
        // Becomes true if the data changes and is unsaved
        dirty: false,
        // Is the container a component???
        isComponent: null,
        fullScreen: false,
        // A random unique component name
        componentName: this.randomName(),
        popups: [],
        isUnsaved: false,
        isComponentActive: false,
        isLoaded: !this.load || this.loaded,
        isPinned: this.pinned,
        isStatic: this.static,
        currentIndex: this.idx,
        currentURL: this.current || this.url
      };
    },

    methods: {
      getFullCurrentURL(){
        return this.router.getFullBaseURL() + this.currentURL;
      },
      getFullURL(){
        return this.router.getFullBaseURL() + this.url;
      },
      setLoaded(val){
        this.isLoaded = !!val;
      },
      // Generates a random name which will be used for the component
      randomName(){
        let n = bbn.fn.randomString(20, 15).toLowerCase();
        while ( componentsList.indexOf(n) > -1 ){
          n = bbn.fn.randomString(20, 15).toLowerCase();
        }
        return n;
      },
      show(){
        this.visible = true
      },
      hide(){
        this.visible = false
      },
      setCurrent(url){
        if ( url.indexOf(this.url) === 0 ){
          this.currentURL = url;
        }
      },
      setTitle(title){
        if ( this.router ){
          this.router.views[this.currentIndex].title = title;
        }
      },
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
      popup(){
        let popup = this.getPopup();
        return arguments.length ? popup.open.apply(popup, arguments) : popup;
      },
      getComponent(){
        for ( let i = 0; i < this.$children.length; i++ ){
          if ( this.$children[i].$options._componentTag !== 'bbn-popup' ){
            return this.$children[i];
          }
        }
        return false;
      },
      enter(){
        this.$parent.enter(this);
      },
      reload(){
        this.router.reload(this.currentIndex);
      },
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
          let menu = this.$parent.views[this.idx].menu,
              idx = bbn.fn.search(bbn.fn.isFunction(menu) ? menu() : menu, {text: obj.text});
          if ( idx === -1 ){
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
              menu.push(obj)
            }
          }
          else{
            obj.key = menu[idx].key;
            menu.splice(idx, 1, obj);
          }
          return obj.key;
        }
        return false;
      },
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

      init(){
        if ( this.real || (this.isLoaded && !this.ready) ){
          let res;
          //bbn.fn.log("INITIATING CONTAINER " + this.url + " " + (this.script ? "(THERE IS A SCRIPT)" : ""));

          if ( this.script ){
            res = typeof this.script === 'string' ? eval(this.script) : this.script;
            // if evaluating the script property returns a function that will be onMount
            if ( res ){
              if (bbn.fn.isFunction(res) ){
                //bbn.fn.log("THERE IS SCRIPT for " + this.url + " AND IT IS A FUNCTION");
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
              template: '<div class="bbn-overlay">' + this.content + '</div>',
              methods: {
                getContainer(){
                  return this.$parent;
                },
                getTab(){
                  return this.$parent;
                },
                addMenu(){
                  return this.$parent.addMenu.apply(this.$parent, arguments)
                },
                deleteMenu(){
                  return this.$parent.deleteMenu.apply(this.$parent, arguments)
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
          this.ready = true;
        }
      }
    },

    created(){
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

    mounted(){
      // The router is needed
      this.router = this.closest('bbn-router');
      if ( !this.router ){
        throw new Error(bbn._("bbn-container cannot be rendered without a bbn-router"));
      }
      if ( !this.router.isMounted ){
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

    beforeDestroy(){
      //bbn.fn.log("DESTROYING");
      this.router.unregister(this);
      if ( this.isComponent ){
        let idx = componentsList.indexOf(this.componentName);
        if ( idx > -1 ){
          componentsList.splice(idx, 1);
        }
      }
    },

    watch: {
      currentURL(newVal, oldVal){
        if ( !newVal || (newVal.indexOf(this.url) !== 0) ){
          this.currentURL = this.url;
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
      visible(nv, ov){
        this.$nextTick(() => {
          this.$emit(nv ? 'view' : 'unview', this);
          if ( nv ){
            this.$nextTick(() => {
              this.selfEmit(true)
            })
          }
        })
      },
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
      fullScreen(newVal){
        let fn = (e) => {
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
      }
    },

  });

})(jQuery, bbn, Vue);
