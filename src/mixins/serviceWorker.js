((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * serviceWorker Component.
     * @component serviceWorkerComponent
     */
    serviceWorkerComponent: {
      props: {},
      data(){
        return {
          /**
           * The registered channels list
           * @data {Array} [[]] registeredChannels
           * @memberof serviceWorkerComponent
           */
          registeredChannels: [],
          /**
           * The primary channel
           * @data {String} [''] primaryChannel
           * @memberof serviceWorkerComponent
           */
        }
      },
      methods: {
        /**
         * Registers a channel
         * @method registerChannel
         * @memberof serviceWorkerComponent
         * @param {String} channel
         * @fires _postMessage
         * @return {Boolean}
         */
        registerChannel(channel, primary){
          if (!this.registeredChannels.includes(channel)
            && this._postMessage({
              type: 'registerChannel',
              channel: channel
            })
          ) {
            this.registeredChannels.push(channel);
            if (primary) {
              this.primaryChannel = channel;
            }
            return true;
          }
          return false;
        },
        /**
         * Unregisters a channel
         * @method unregisterChannel
         * @memberof serviceWorkerComponent
         * @param {String} channel
         * @fires _postMessage
         * @return {Boolean}
         */
        unregisterChannel(channel){
          if (this.registeredChannels.includes(channel)
            && this._postMessage({
              type: 'unregisterChannel',
              channel: channel
            })
          ) {
            this.registeredChannels.splice(this.registeredChannels.indexOf(channel), 1);
            return true;
          }
          return false;
        },
        /**
         * Sends a message to a channel
         * @method messageChannel
         * @memberof serviceWorkerComponent
         * @param {String} channel
         * @param {Object} data
         * @fires _postMessage
         * @return {Boolean}
         */
        messageChannel(channel, data){
          if (this.registeredChannels.includes(channel)
            && this._postMessage({
              type: 'messageChannel',
              channel: channel,
              data: this._encodeMessageData(data)
            })
          ) {
            return true;
          }
          return false;
        },
        /**
         * Receives data from a channel
         * @method messageFromChannel
         * @memberof serviceWorkerComponent
         * @param {Object} data
         */
        messageFromChannel(data){
          data = this._decodeMessageData(data);
          if (data.function){
            if (bbn.fn.isFunction(data.function)) {
              data.function(...(data.params || []));
            }
            else if (bbn.fn.isFunction(this[data.function])) {
              this[data.function](...(data.params || []));
            }
          }
        },
        /**
         * Emits messageToChannel event
         * @method messageToChannel
         * @memberof serviceWorkerComponent
         * @param {Object} data
         * @param {String} channel
         * @emit messageToChannel
         */
        messageToChannel(data, channel){
          this.$emit('messageToChannel', data, channel);
        },
        /**
         * @method _checkSW
         * @memberof serviceWorkerComponent
         * @return {Boolean}
         */
        _checkSW(){
          if ('serviceWorker' in navigator) {
            if (navigator.serviceWorker.controller) {
              return navigator.serviceWorker.controller.state !== 'redundant';
            }
            else {
              bbn.fn.info("NO CONTROLLER FOR SW");
            }
          }
          else {
            bbn.fn.info("NO SW");
          }
          return false;
        },
        /**
         * Postes the message to the service worker
         * @method _postMessage
         * @memberof serviceWorkerComponent
         * @param {Object}
         * @fires _checkSW
         * @return {Boolean}
         */
        _postMessage(obj){
          if (this._checkSW()) {
            navigator.serviceWorker.controller.postMessage(obj);
            return true;
          }
          return false;
        },
        /**
         * Encodes the data of the message
         * @method _encodeMessageData
         * @memberof serviceWorkerComponent
         * @param {Object} data
         * @return {String}
         */
        _encodeMessageData(data){
          return JSON.stringify(data, (k, d) => bbn.fn.isFunction(d) ? '/Function(' + d.toString() + ')/' : d);
        },
        /**
         * Decodes the data of the message
         * @method _decodeMessageData
         * @memberof serviceWorkerComponent
         * @param {String} data
         * @return {Object}
         */
        _decodeMessageData(data){
          return JSON.parse(data, (k, d) => {
            if (bbn.fn.isString(d)
              && d.startsWith('/Function(')
              && d.endsWith(')/')
            ) {
              d = d.substring(10, d.length - 2);
              return (0, eval)('(' + d + ')');
            }
            return d;
          })
        }
      },
      /**
       * Adds the class 'bbn-service-worker-component' to the component.
       * @event created
       * @memberof serviceWorkerComponent
       */
       created(){
        this.componentClass.push('bbn-service-worker-component');
      },
    }
  });
})(bbn);