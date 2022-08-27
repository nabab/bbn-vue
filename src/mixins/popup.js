(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Basic Component.
     *
     * @component basicComponent
     */
    popupComponent: {
      props: {
        /**
         * The object popup of the table.
         * @prop {Object} Vue
         */
        popup: Object
      },
      methods: {
        /**
         * Retuns the popup object.
         * @method getPopup
         * @returns {Object}
         */
        getPopup(cfg){
          let popup = this.popup || bbn.vue.getPopup(this);
          if (!cfg) {
            return popup;
          }
          if (popup) {
            cfg.opener = this;
            return popup.open(cfg);
          }
        },
        
      }
    }
  });
})(bbn);
