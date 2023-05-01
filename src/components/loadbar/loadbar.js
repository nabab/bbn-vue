/**
 * @file bbn-loadbar component
 *
 * @description bbn-loadbar component is a simple implementation component, it represents a bar with a display of wait state of a user-defined file.
 * Next to the loading icon, you'll find the path of the file from which the response is expected.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 15/02/2017
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic 
     */
    mixins: [bbn.wc.mixins.basic],
    props: {
      //@todo not used
      encoded: {
        type: Boolean,
        default: true
      },
      //@todo not used
      position: {
        type: Object,
        default(){
          return {
            position: {
              bottom: 5,
              right: 5
            }
          };
        }
      },
      /**
       * The source of the component
       * @prop {Array} source
       */
      source: {
        type: Array
      },
      //@todo not used
      history: {
        type: Number,
        default: 100
      },
    },
    data(){
      return {
        /**
         * @data {Boolean} isLoading
         */
        isLoading: false,
        //@todo not used
        isSuccess: false,
        //@todo not used
        isError: false,
        /**
         * @data {String} [''] text
         */
        text: '',
        //@todo not used
        id: false,
        //@todo not used
        selected: 0,
        //@todo not used
        numLoaded: 0,
        /**
         * @data {Boolean} [false] info
         */
        info: false,
         /**
         * @data {Boolean} [false] interval
         */
        interval: false,
         /**
         * @data {Boolean} [false] timeNow
         */
        timeNow: false,
        link: ''
      };
    },
    computed: {
      /**
       * @computed loadingItems 
       * @return {Array}
       */
      loadingItems(){
        return bbn.fn.filter(this.source, {loading: true})
      },
       /**
       * @computed loadedItems 
       * @return {Array}
       */
      loadedItems(){
        return bbn.fn.filter(this.source, {loading: false})
      },
      /**
       * @computed items
       * @return {Array}
       */
      items(){
        let items = [];
        bbn.fn.each(this.loadingItems, a => {
          let b = bbn.fn.clone(a);
          b.duration = this.timeNow - b.start;
          items.push(b);
        })
        return items.concat(this.loadedItems)
      },
      /** 
       * @computed currentItem
       * @return {Object|Boolean}
      */
      currentItem(){
        return this.loadingItems.length ? this.loadingItems[0] : (this.loadedItems.length ? this.loadedItems[0] : false)
      },

    },
    methods: {
      contextMenu(item) {
        let res =  [{
          text: bbn._("Copy URL"),
          icon: 'nf nf-mdi-content_copy',
          action() {
            bbn.fn.copy(item.url);
            appui.success(bbn._("Copied"));
          }
        }];

        if (item.loading) {
          res.push({
            text: bbn._("abort"),
            icon: 'nf nf-mdi-cancel',
            action: () => {
              this.cancel(item);
            }
          });
        }

        return res;
      },
      /**
       * Return the duration in seconds or milliseconds of a request
       * @method renderDuration
       * @param {Number} d
       * @return {Number}
       */
      renderDuration(d){
        let tmp = d / 1000;
        if ( tmp < 10){
          return tmp.toFixed(3)+ ' s';
        }
        else {
          return parseInt(tmp) + ' s';
        }
      },
      /**
       * Aborts the selected request
       * @method cancel
       * @param {Object} item 
       */
      cancel(item){
        if (item.loading) {
          this.confirm(bbn._("Are you sure you want to abort this request?"), d => {
            bbn.fn.abort(item.key);
          })
        }
      },
      //@todo not used
      deleteHistory(){
        let tmp = [];
        bbn.fn.each(this.data, a => {
          if ( a.isLoading ){
            tmp.push(a);
          }
        });
        this.data = tmp;
      },
      /**
       * Opens the given link
       * @method go
       */
       go(){
        if (this.link) {
          bbn.fn.link(this.link);
          this.hide();
        }
      },
      /**
       * Shows the information panel
       * @method show
       */
      show() {
        this.info = true;
      },
      /**
       * Hides the information panel
       * @method hide
       */
      hide() {
        this.info = false;
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.interval = setInterval(() => {
        var date = new Date();
        this.timeNow = parseInt(date.getTime());
      }, 1000);
    },
    /**
     * @event beforeDestroy
     */
    beforeDestroy() {
      clearInterval(this.interval)
    },
    watch: {
      items(){
        /*
        if (this.info) {
          this.$nextTick(() => {
            let f = this.getRef('floater');
            if (f) {
              f.onResize();
            }
          })
        }
        */
      }
    }
  };
