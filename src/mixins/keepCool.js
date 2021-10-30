(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Keep cool component
     * @component keepCoolComponent 
     */
    keepCoolComponent: {
      data(){
        return {
          /**
           * The obejct containing the cool's timers.
           * @data {Number} [0] coolTimer
           * @memberof keepCoolComponent
           */
          coolTimers: {
          },
          /**
           * The interval.
           * @data {Number} [40] coolInterval
           * @memberof keepCoolComponent
           */
          coolInterval: 40
        }
      },
      methods: {
        /**
         * It will prevent the same action to be executed too many times in a row
         * On the first go the timer will be defined and the action will be executed
         * On the second go the promise will be created and returned
         * On the consecutive goes the promise will be returned
         * Once the promise is executed (after timeout) the promise will be recreated
         * @method keepCool
         * @param {Function} fn 
         * @param {Number} idx 
         * @param {Number} timeout 
         * @memberof keepCoolComponent
         */
        keepCool(fn, idx, timeout){
          if ( !idx ){
            idx = 'default';
          }
          let t = (new Date()).getTime();
          let delay = timeout || this.coolInterval;
          // First go of the serie: nothing exists
          if ( !this.coolTimers[idx] ){
            this.coolTimers[idx] = {
              time: 0,
              promise: false
            };
          }
          // If there is a promise it has not yet been executed
          if ( this.coolTimers[idx].promise ){
            return this.coolTimers[idx].promise;
          }

          // Timeout passed, function will have to be executed immediately
          let diff = delay + this.coolTimers[idx].time - t;
          if ( (diff > 0) && (diff <= delay) ){
            delay = diff;
            this.coolTimers[idx].time = t + delay;
          }
          else{
            delay = 0;
            this.coolTimers[idx].time = t;
          }
          this.coolTimers[idx].promise = new Promise(resolve => {
            setTimeout(() => {
              let r = fn();
              this.coolTimers[idx].time = (new Date()).getTime();
              resolve(r);
              this.coolTimers[idx].promise = false;
            }, delay);
          });
          return this.coolTimers[idx].promise;
        }
      }
    }
  });
})(bbn);