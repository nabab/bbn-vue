((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Notification Component.
     *
     * @component notificationComponent
     */
    notificationComponent: {
      props: {},
      data(){
        return {
          hasPermission: false,
          notifications: []
        }
      },
      methods: {
        notify(text, options){
          if (this.hasPermission) {
            let n = new Notification(text, options);
            this.notifications.push(n);
          }
        }
      },
      mounted(){
        Notification.requestPermission((perms) => {
          this.hasPermisson = perms === 'granted';
          this.ready = true;
        })
      }
    }
  });
})(bbn);