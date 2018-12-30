((bbn) => {
  "use strict";
  if ( !bbn.vue ){
    throw new Error("Impossible to find the library bbn-vue")
  }
  Vue.mixin({
    computed: {
      currentPopup(){
        if ( this && !this._currentPopup ){
          let e = bbn.vue._retrievePopup(this);
          if ( e ){
            this._currentPopup = e;
          }
          else{
            let vm = this
            while ( 1 ){
              vm = vm.$parent;
              if ( vm && vm._currentPopup ){
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
              if ( !vm || (vm === this.$root) ){
                break;
              }
            }
          }
        }
        if ( this && this._currentPopup ){
          return this._currentPopup;
        }
        throw new Error(bbn._('Impossible to find a popup instance. Add a bbn-popup in your root element'))
      }
    },
    data(){
      return {
        _currentPopup: null
      };
    },
    methods: {
      _: bbn._,

      getRef(name){
        return bbn.vue.getRef(this, name);
      },
      is(selector){
        return bbn.vue.is(this, selector);
      },
      closest(selector, checkEle){
        return bbn.vue.closest(this, selector, checkEle);
      },
      ancesters(selector, checkEle){
        return bbn.vue.ancesters(this, selector, checkEle);
      },
      getChildByKey(key, selector){
        return bbn.vue.getChildByKey(this, key, selector);
      },

      findByKey(key, selector, ar){
        return bbn.vue.findByKey(this, key, selector, ar);
      },

      findAllByKey(key, selector){
        return bbn.vue.findAllByKey(this, key, selector);
      },

      find(selector, index){
        return bbn.vue.find(this, selector, index);
      },

      findAll(selector, only_children){
        return bbn.vue.findAll(this, selector, only_children);
      },

      getComponents(ar, only_children){
        return bbn.vue.getComponents(this, ar, only_children);
      },

      getPopup(){
        let popup = bbn.vue.getPopup(this);
        if ( arguments.length && popup ){
          return popup.open.apply(popup, arguments)
        }
        return popup;
      },

      confirm(){
        let popup = this.getPopup();
        if ( popup ){
          popup.confirm.apply(popup, arguments)
        }
      },

      alert(){
        let popup = this.getPopup();
        if ( popup ){
          popup.alert.apply(popup, arguments)
        }
      }
    }
  });
})(window.bbn);