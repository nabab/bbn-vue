/**
 * @file A set of global functions available to all components.
 * @author Rowina Sanela 
 */
(bbn => {
  "use strict";
  if ( !bbn.vue ){
    throw new Error("Impossible to find the library bbn-vue")
  }
  Vue.mixin({
    computed: {
      /**
       * Return the object of the currentPopup.
       * @computed currentPopup
       * @return {Object}
       */
      currentPopup(){
        if ( !this._currentPopup ){
          let e = bbn.vue._retrievePopup(this);
          if ( e ){
            this._currentPopup = e;
          }
          else{
            let vm = this;
            while (vm = vm.$parent) {
              if ( vm._currentPopup ){
                this._currentPopup = vm._currentPopup;
                break;
              }
              else if ( vm ){
                e = bbn.vue._retrievePopup(vm);
                if ( e ){
                  this._currentPopup = e;
                  break;
                }
              }
              if (vm === this.$root) {
                break;
              }
            }
          }
        }
        if ( this._currentPopup ){
          return this._currentPopup;
        }
        return null;
      }
    },
    methods: {
      /**
       * Return the function bbn._ for the strings' translation.
       * @method _ 
       * @return {Function}
       */
      _: bbn._,
      /**
       * Returns the given ref (will return $refs[name] or $refs[name][0])
       * @method getRef
       * @param {String} name 
       * @fires bbn.vue.getRef
       * @return {Function}
       */
      getRef(name){
        return bbn.vue.getRef(this, name);
      },
      /**
       * Checks if the component corresponds to the selector
       * @method is
       * @fires bbn.vue.is
       * @param {String} selector 
       * @return {Function}
       */
      is(selector){
        return bbn.vue.is(this, selector);
      },
      /**
       * Returns the closest component matching the given selector
       * @method closest
       * @param {String} selector 
       * @param {Boolean} checkEle 
       * @return {Function}
       */
      closest(selector, checkEle){
        return bbn.vue.closest(this, selector, checkEle);
      },
      /**
       * Returns an array of parent components until $root
       * @method ancestors
       * @param {String} selector 
       * @param {Boolean} checkEle 
       * @return {Function}
       */
      ancestors(selector, checkEle){
        return bbn.vue.ancestors(this, selector, checkEle);
      },
      /**
       * Fires the function bbn.vue.getChildByKey.
       * @method getChildByKey
       * @param {String} key 
       * @param {String} selector 
       * @todo Remove for Vue3
       * @return {Function}
       */
      getChildByKey(key, selector){
        return bbn.vue.getChildByKey(this, key, selector);
      },
      /**
       * Fires the function bbn.vue.findByKey.
       * @method findByKey
       * @param {String} key 
       * @param {String} selector 
       * @param {Array} ar 
       * @todo Remove for Vue3
       * @return {Function}
       */
      findByKey(key, selector, ar){
        return bbn.vue.findByKey(this, key, selector, ar);
      },
      /**
       * Fires the function bbn.vue.findAllByKey.
       * @method findAllByKey
       * @param {String} key 
       * @param {String} selector 
       * @todo Remove for Vue3
       * @return {Function}
       */
      findAllByKey(key, selector){
        return bbn.vue.findAllByKey(this, key, selector);
      },
      /**
       * Fires the function bbn.vue.find.
       * @method find
       * @param {String} selector 
       * @param {Number} index 
       * @todo Remove for Vue3
       * @return {Function}
       */  
      find(selector, index){
        return bbn.vue.find(this, selector, index);
      },
      /**
       * Fires the function bbn.vue.findAll.
       * @method findAll
       * @param {String} selector 
       * @param {Boolean} only_children 
       * @todo Remove for Vue3
       * @return {Function}
       */  
      findAll(selector, only_children){
        return bbn.vue.findAll(this, selector, only_children);
      },
      /**
       * Extends an object with Vue.$set
       * @method extend
       * @param {Boolean} selector 
       * @param {Object} source The object to be extended
       * @param {Object} obj1 
       * @return {Object}
       */  
      extend(deep, src, obj1){
        let args = [this];
        for ( let i = 0; i < arguments.length; i++ ){
          args.push(arguments[i]);
        }
        return bbn.vue.extend(...args);
      },
      /**
       * Fires the function bbn.vue.getComponents.
       * @method getComponents
       * @param {Array} ar 
       * @param {Boolean} only_children 
       * @todo Remove for Vue3
       * @return {Function}
       */
      getComponents(ar, only_children){
        return bbn.vue.getComponents(this, ar, only_children);
      },
      /**
       * Opens the closest object popup.
       * @method getPopup
       * @return {Object}
       */
      getPopup(){
        let popup = bbn.vue.getPopup(this);
        if (arguments.length && popup) {
          let cfg = arguments[0];
          let args = [];
          if (bbn.fn.isObject(cfg)) {
            cfg.opener = this;
          }

          args.push(cfg);
          for (let i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
          }

          return popup.open.apply(popup, args);
        }

        return popup;
      },
      /**
       * Opens a confirmation from the closest popup
       * @method confirm
       */  
      confirm(){
        let popup = this.getPopup();
        if (arguments.length && popup) {
          let cfg = arguments[0];
          let args = [];
          if (bbn.fn.isObject(cfg)) {
            cfg.opener = this;
          }

          args.push(cfg);
          for (let i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
          }

          if (!bbn.fn.isObject(cfg)) {
            args.push(this);
          }

          return popup.confirm.apply(popup, args)
        }
      },
      /**
       * Opens an alert from the closest popup
       * @method alert
       */  
      alert(){
        let popup = this.getPopup();
        if (arguments.length && popup) {
          let cfg = arguments[0];
          let args = [];
          if (bbn.fn.isObject(cfg)) {
            cfg.opener = this;
          }

          args.push(cfg);
          for (let i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
          }

          if (!bbn.fn.isObject(cfg)) {
            args.push(this);
          }

          return popup.alert.apply(popup, args)
        }
      },
      /**
       * Executes bbn.fn.post
       * @method post
       * @see {@link https://bbn.io/bbn-js/doc/ajax/post|bbn.fn.post} documentation
       * @todo Stupid idea, it should be removed.
       * @return {Promise} 
       */
       post(){
        return bbn.vue.post(this, arguments);
      },
      /**
       * Executes bbn.fn.postOut
       * @method postOut
       * @see {@link https://bbn.io/bbn-js/doc/ajax/postOut|bbn.fn.postOut} documentation
       * @todo Stupid idea, it should be removed.
       * @return {void}
       */
      postOut(){
        return bbn.vue.postOut(this, ...arguments);
      },
      /**
       * @method getComponentName
       * @todo Returns a component name based on the name of the given component and a path.
       * @memberof bbn.vue
       * @param {Vue}    vm   The component from which the name is created.
       * @param {String} path The relative path to the component from the given component.
       */
      getComponentName(){
        return bbn.vue.getComponentName(this, ...arguments);
      },

    }
  });
})(window.bbn);