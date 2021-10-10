((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Data source component
     * @component listComponent
     */
    pageableComponent: {
      props: {
        /**
         * The total of items in the list.
         * @data {Number} [0] total
         * @memberof listComponent
         */
        total: {
          type: Number,
          default: 0
        },
        /**
         * The start index.
         * @data {Number} [0] start
         * @memberof pageableComponent
         */
        start: {
          type: Number,
          default: 0
        },
        /**
         * The limit of rows to be shown in a page of the list.
         * @prop {Number} [25] limit
         * @memberof pageableComponent
         */
        limit: {
          type: Number,
          default: 25
        },
        /**
         * The array of predefined limits.
         * @data {Array} {[10, 25, 50, 100, 250, 500]} limits
         * @memberof pageableComponent
         */
        limits: {
          type: Array,
          default() {
            return [10, 25, 50, 100, 250, 500];
          },
        },
        /**
         * Set to true allows the list to divide itself in different pages basing on the property limit.
         * @prop {Boolean} [false] pageable
         * @memberof pageableComponent
         */
        pageable: {
          type: Boolean,
          default: false
        },
        /**
         * The name of the `page` word as used in the pager interface.
         * @prop {String} ['Page'] pageName
         */
        pageName: {
          type: String,
          default: bbn._("Page")
        }
      },
      data(){
        return {
          /**
           * The current limit of items in the list.
           * @memberof pageableComponent
           * @data {Number} [25] currentLimit
           */
          currentLimit: this.limit,
          /**
           * The current start index of the list.
           * @memberof pageableComponent
           * @data {Number} [0] currentStart
           */
          currentStart: this.start,
          /**
           * The current total of items in the list.
           * @memberof pageableComponent
           * @data {Number} [0] currentTotal
           */
          currentTotal: 0
        };
      },
      computed: {
        /**
         * Return the number of pages of the list.
         * @computed numPages
         * @memberof listComponent
         * @return {number}
         */
         numPages() {
          return Math.ceil(this.total / this.currentLimit);
        },
        /**
         * Return the current page of the list.
         * @computed currentPage
         * @memberof listComponent
         * @fires updateData
         * @return {Number}
         */
        currentPage: {
          get() {
            return Math.ceil((this.start + 1) / this.currentLimit);
          },
          set(val) {
            if ( this.ready ) {
              this.start = val > 1 ? (val - 1) * this.currentLimit : 0;
              this.updateData();
            }
          }
        },
      },
      methods: {
      },
      watch: {
        /**
         * @watch currentLimit
         * @fires setConfig
         */
        currentLimit() {
          if ( this.ready && bbn.fn.isFunction(this.setConfig) ){
            this.setConfig(true);
          }
        },
      }
    }
  });
})(bbn);