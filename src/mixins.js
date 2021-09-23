((bbn) => {
  "use strict";
  if ( !bbn.vue ){
    throw new Error("Impossible to find the library bbn-vue")
  }
  Vue.mixin({
    data(){
      return {
        /**
         * @data _currentPopup
         */
        _currentPopup: null
      };
    },
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
       * Fires the function bbn.vue.getRef
       * @method getRef
       * @param {String} name 
       * @fires bbn.vue.getRef
       * @return {Function}
       */
      getRef(name){
        return bbn.vue.getRef(this, name);
      },
      /**
       * Fires the
       function bbn.vue.is.
       * @method is
       * @fires bbn.vue.is
       * @param {String} selector 
       * @return {Function}
       */
      is(selector){
        return bbn.vue.is(this, selector);
      },
      /**
       * Fires the function bbn.vue.closest.
       * @method closest
       * @param {String} selector 
       * @param {Boolean} checkEle 
       * @return {Function}
       */
      closest(selector, checkEle){
        return bbn.vue.closest(this, selector, checkEle);
      },
      /**
       * Fires the function bbn.vue.ancestors.
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
      * @return {Function}
      */
      getComponents(ar, only_children){
        return bbn.vue.getComponents(this, ar, only_children);
      },
      /**
       * Opens the object popup.
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
       * Opens the confirm.
       * @method confirm
       */  
      confirm(){
        let popup = this.getPopup();
        if ( popup ){
          popup.confirm.apply(popup, arguments)
        }
      },
      /**
       * Opens the alert.
       * @method alert
       */  
      alert(){
        let popup = this.getPopup();
        if ( popup ){
          popup.alert.apply(popup, arguments)
        }
      },
      post(){
        return bbn.vue.post(this, arguments);
      },
      postOut(){
        return bbn.vue.postOut(this, ...arguments);
      }
    }
  });
})(window.bbn);