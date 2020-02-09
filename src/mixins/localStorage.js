((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * local storage component
     * @component localStorageComponent
     */
    localStorageComponent: {
      props: {
        /**
         * @prop {Boolean} [false] storage
         * @memberof localStorageComponent
         */
        storage: {
          type: Boolean,
          default: false
        },
        /**
         * The name of the storage.
         * @prop {String} ['default'] storageName
         * @memberof localStorageComponent
         */
        storageName: {
          type: String,
          default: 'default'
        },
        /**
         * The fullname of the storage.
         * @prop {String} storageFullName
         * @memberof localStorageComponent
         */
        storageFullName: {
          type: String
        }
      },
      data(){
        return {
          storageChangeDate: '2019-01-01 00:00:00'
        };
      },
      computed: {
        /**
         * @memberof localStorageComponent
         * @computed storage
         */
        _storage(){
          if ( window.store ){
            return {
              get(name){
                let tmp = window.store.get(name);
                if ( tmp ){
                  return tmp.value;
                }
              },
              set(name, value){
                return window.store.set(name, {
                  value: value,
                  time: (new Date()).getTime()
                });
              },
              time(name){
                let tmp = window.store.get(name);
                if ( tmp ){
                  return tmp.time;
                }
              },
              remove(name){
                return window.store.remove(name);
              }
            }
          }
          return false;
        },
        /**
         * Returns if the component has storage.
         * @memberof localStorageComponent
         * @computed {Boolean} hasStorage
         */
        hasStorage(){
          return (this.storage || (this.storageFullName || (this.storageName !== 'default'))) && !!this._storage;
        },
        storageDefaultName(){
          if ( !this.storage ){
            return false;
          }
          return this._getStorageRealName();
        }
      },
      methods: {
        /**
         * Returns the complete path of the storage.
         * @method _getStorageRealName
         * @param {String} name 
         * @return {String}
         * @memberof localStorageComponent
         */
        _getStorageRealName(name){
          if ( this.storageFullName ){
            return this.storageFullName;
          }
          let st = '';
          if ( this.$options.name ){
            st += this.$options.name + '-';
          }
          if ( name ){
            st += name;
          }
          else{
            st += window.location.pathname.substr(1) + '-' + this.storageName;
          }
          return st;
        },
        /**
         * Returns the computed _storage
         * @method getStorage
         * @param {String} name 
         * @return {Boolean|String}
         * @memberof localStorageComponent
         */
        getStorage(name, isFullName){
          if ( this.hasStorage ){
            return this._storage.get(isFullName ? name : this._getStorageRealName(name))
          }
          return false;
        },
        /**
         * Sets the computed _storage.
         * @method setStorage
         * @param value 
         * @param {String} name 
         * @memberof localStorageComponent
         */
        setStorage(value, name, isFullName){
          if ( this.hasStorage ){
            return this._storage.set(isFullName ? name : this._getStorageRealName(name), value)
          }
          return false;
        },
        /**
         * Unsets the computed _storage.
         * @method unsetStorage
         * @param {String} name 
         * @memberof localStorageComponent
         */
        unsetStorage(name, isFullName){
          if ( this.hasStorage ){
            return this._storage.remove(isFullName ? name : this._getStorageRealName(name))
          }
          return false;
        }
      },
      /**
       * Adds the class bbn-local-storage-component to the component.
       * @event created
       * @memberof localStorageComponent
       */
      created(){
        if ( this.hasStorage ){
          this.componentClass.push('bbn-local-storage-component');
        }
      },
    }
  });
})(bbn);