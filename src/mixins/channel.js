((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Channel Component.
     *
     * @component channelComponent
     */
    channelComponent: {
      props: {},
      data(){
        return {
          registeredChannels: []
        }
      },
      methods: {
        registerChannel(channel){
          if (!this.registeredChannels.includes(channel)) {
            this.registeredChannels.push(channel);
            this._postMessage({
              type: 'registerChannel',
              channel: channel
            });
          }
        },
        unregisterChannel(channel){
          if (this.registeredChannels.includes(channel)) {
            this.registeredChannels.splice(this.registeredChannels.indexOf(channel), 1);
            this._postMessage({
              type: 'unregisterChannel',
              channel: channel
            });
          }
        },
        messageChannel(channel, data){
          if (this.registeredChannels.includes(channel)) {
            this._postMessage({
              type: 'messageChannel',
              channel: channel,
              data: data
            });
          }
        },
        /**
         * @method messageFromChannel
         * @param {Object} data
         */
        messageFromChannel(data){
          if (data.method){
            if (bbn.fn.isFunction(data.method)) {
              data.method(...data.params || []);
            }
            else if (bbn.fn.isFunction(this[data.method])) {
              this[data.method](...data.params || []);
            }
          }
        },
        /**
         * @method messageToChannel
         * @emit messageToChannel
         */
        messageToChannel(data){
          this.$emit('messageToChannel', data);
        },
        _postMessage(obj){
          if ('serviceWorker' in navigator) {
            if (navigator.serviceWorker.controller) {
              if (navigator.serviceWorker.controller.state !== 'redundant') {
                navigator.serviceWorker.controller.postMessage(obj);
                return true;
              }
            }
            else {
              bbn.fn.info("NO CONTROLLER FOR SW");
            }
          }
          else {
            bbn.fn.info("NO SW");
          }
          return false;
        }
      }
    }
  });
})(bbn);