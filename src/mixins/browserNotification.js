((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Browser Notification Component.
     * @component browserNotificationComponent
     */
    browserNotificationComponent: {
      /**
       * @mixin bbn.vue.serviceWorkerComponent
       * @memberof browserNotificationComponent
       */
      mixins: [bbn.vue.serviceWorkerComponent],
      data(){
        return {
          /**
           * @data {Boolean} [false] hasBrowserPermission
           * @memberof browserNotificationComponent
           */
          hasBrowserPermission: false,
          /**
           * @data {Object} [{}] browserNotifications
           * @memberof browserNotificationComponent
           */
          browserNotifications: {},
          /**
           * @data {String} [''] browserNotificationURL
           * @memberof browserNotificationComponent
           */
          browserNotificationURL: '',
          /**
           * @data {Boolean} [false] browserNotificationSW
           * @memberof browserNotificationComponent
           */
          browserNotificationSW: false
        }
      },
      methods: {
        /**
           * @method browserNotify
           * @memberof browserNotificationComponent
           * @param {String} title
           * @param {String} text,
           * @param {Object} options
           * @fires _postMessage
           * @fires $set
           */
        browserNotify(title, text, options){
          if (this.ready
            && this.hasBrowserPermission
            && title
            && text
          ) {
            if (bbn.fn.isObject(text)) {
              options = text;
            }
            else if (bbn.fn.isString(text)) {
              if (bbn.fn.isObject(options)) {
                options = {
                  body: text
                }
              }
              else {
                options = {};
              }
              if (!options.body || (options.body !== text)) {
                options.body = text;
              }
            }
            options.tag = options.tag || options.timestamp || n.timestamp;
            if (this.browserNotificationSW) {
              this._postMessage({
                type: 'notification',
                data: {
                  title: title,
                  options: options
                }
              })
            }
            else {
              options.onclick = this.browserNotificationClick;
              let n = new Notification(title, options);
              this.$set(this.browserNotifications, options.tag, n);
            }
          }
        },
        /**
         * @method browserNotificationClick
         * @memberof browserNotificationComponent
         * @param {Object} options
         * @fires post
         * @fires removeBrowserNotification
         * @fires messageToChannel
         */
        browserNotificationClick(options){
          if (this.browserNotificationURL) {
            this.post(this.browserNotificationURL + '/actions/read', {id: options.tag}, d => {
              if (d.success) {
                this.removeBrowserNotification(options.tag);
                this.messageToChannel({
                  method: 'removeBrowserNotification',
                  params: [options.tag]
                });
              }
            })
          }
          else {
            this.removeBrowserNotification(options.tag);
          }
        },
        /**
         * @method removeBrowserNotification
         * @memberof browserNotificationComponent
         * @param {String} id
         * @fires $delete
         */
        removeBrowserNotification(id){
          if (id && (id in this.browserNotifications)){
            this.$delete(this.browserNotifications, id);
          }
        }
      },
      /**
       * @event mounted
       */
      mounted(){
        Notification.requestPermission((perms) => {
          this.hasBrowserPermission = perms === 'granted';
          this.ready = true;
        })
      }
    }
  });
})(bbn);