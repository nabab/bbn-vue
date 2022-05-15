(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Obeserver component.
     * @component observerComponent
     */
    observerComponent: {
      props: {
        /**
         * True if the component has to have an observer.
         * @prop {Boolean} [true] observer
         * @memberof observerComponent
         */
        observer: {
          type: Boolean,
          default: true
        }
      },
      data(){
        return {
          /**
           * Integration of the functionnality is done through a watcher on this property
           * @data {Array} [[]] observersCopy
           * @memberof observerComponent
           */
          observersCopy: [],
          /**
           * Integration of the functionnality is done through a watcher on this property
           * @data {Boolean} observersDirty
           * @memberof observerComponent
           */
          observerDirty: false,
          /**
           * The value of the observer.
           * @memberof observerComponent
           * @data observerValue
           */
          observerValue: null,
          /**
           * The array of observers.
           * @data {Array} observers
           * @memberof observerComponent
           */
          observers: [],
          /**
           * The id of the observer.
           * @data observerID
           * @memberof observerComponent
           */
          observerID: null,
          /**
           * The closest ancestor 'bbn-obsever';
           * @data {Vue} observationTower
           * @memberof observerComponent
           */
          observationTower: null,
          /**
           * The uid of the observer.
           * @data {String} observerUID
           * @memberof observerComponent
           */
          observerUID: bbn.fn.randomString().toLowerCase()
        }
      },
      methods: {
        /**
         * Returns true if the prop observer is set to true and an observerionTower is found.
         * @method observerCheck
         * @return {Boolean}
         * @memberof observerComponent
         */
        observerCheck(){
          return !!(this.observer && this.observationTower);
        },
        /**
         * Returns true if the observer has a value.
         * @method isObserved
         * @return {Boolean}
         * @memberof observerComponent
         */
        isObserved(){
          return this.observerCheck() && this.observerValue;
        },
        /**
         * Updates the observer.
         * @method observerWatch
         * @fires isObserved
         * @memberof observerComponent
         */
        observerWatch(){
          if ( this.isObserved() ){
            //bbn.fn.log("----------------isObserved--------------", this.$el);
            this.observationTower.observerRelay({
              element: this.observerUID,
              id: this.observerID,
              value: this.observerValue
            });
            setTimeout(() => {
              this.observationTower.$on('bbnobserver' + this.observerUID + this.observerID, newVal => {
                //bbn.fn.log("NEW VALUE!");
                // Integration of the functionnality is done through a watcher on this property
                this.observerDirty = true;
                this.observerValue = newVal;
              });
            }, 100);
          }
        },
        /**
         * @method observerRelay
         * @memberof observerComponent
         */
        observerRelay(obs){
          if ( this.observer ){
            //bbn.fn.log("----------------observerRelay--------------", this.$el)
            let idx = bbn.fn.search(this.observers, {id: obs.id, element: obs.element});
            if ( idx > -1 ){
              if ( this.observers[idx].value !== obs.value ){
                this.observers.splice(idx, 1, obs);
              }
            }
            else{
              this.observers.push(obs);
              if ( this.observerCheck() ){
                this.observationTower.$on('bbnobserver' + obs.element + obs.id, newVal => {
                  this.observerEmit(newVal, obs);
                });
              }
            }
            if ( this.observerCheck() ){
              this.observationTower.observerRelay(bbn.fn.clone(obs));
            }
          }
        },
        /**
         * Emits the event bbnObs.
         * @method observerEmit
         * @param {String|Number} newVal 
         * @param {Object} obs 
         * @emit bbnObs
         * @memberof observerComponent
         */
        observerEmit(newVal, obs){
          let row = bbn.fn.getRow(this.observers, {id: obs.id, element: obs.element});
          if ( row && (row.value !== newVal) ){
            row.value = newVal;
            this.$emit('bbnObs' + obs.element + obs.id, newVal);
            return true;
          }
        },
        /**
         * The called method on the switching to false of the "observer Dirty" property value
         * @method observerClear
         * @param {Object} obs
         * @fires observationTower.observerClear
         */
        observerClear(obs){
          if (this.observationTower) {
            this.observationTower.observerClear(obs);
          }
        }
      },
      /**
       * Adds the classes 'bbn-observer-component', 'bbn-observer', 'bbn-observer-' + this.observerUID to the component
       * @event created
       * @memberof observerComponent
       */
      created(){
        if ( this.componentClass ){
          this.componentClass.push('bbn-observer-component', 'bbn-observer', 'bbn-observer-' + this.observerUID);
        }
      },
      /**
       * Defines the observationTower object.
       * @event mounted
       * @memberof observerComponent
       */
      mounted(){
        if ( this.observer ){
          this.observationTower = this.closest('.bbn-observer');
          this.observerWatch();
        }
      },
      /**
       * Removes the observer.
       * @event beforeDestroy
       * @memberof observerComponent
       */
      beforeDestroy(){
        if ( this.isObserved() ){
          let idx = bbn.fn.search(this.observationTower.observers, {element: this.observerUID});
          if ( idx > -1 ){
            this.observationTower.observers.splice(idx, 1);
          }
          this.observationTower.$off('bbnobserver' + this.observerUID + this.observerID);
        }
      },
      watch: {
        /**
         * @watch observerDirty
         * @param {Boolean} newVal
         * @fires observerClear
         */
        observerDirty(newVal){
          if (!newVal) {
            this.observerClear({
              id: this.observerID,
              element: this.observerUID,
              value: this.observerValue
            });
          }
        }
      }
    }
  });
})(bbn);