/**
 * @file bbn-widget component
 *
 * @description bbn-widget designed to be used in the bbn-dashboard component, it represents a information container. This component can contain, for example: a list of information or a component. The usefulness of this easy-to-implement component is to group the information. Together with other  bbn-widget used in the "bbn-dashboard", provides the overview of the information the user wants to see.
 *
 * @copyrigth BBN Soutions
 *
 * @author BBN Solutions
 *
 * @created 15/02/2017.
 */
return {
    name: 'bbn-widget',
    /**
     * @mixin bbn.wc.mixins.basic,
     * @mixin bbn.wc.mixins.localStorage,
     * @mixin bbn.wc.mixins.observer,
     * @mixin bbn.wc.mixins.resizer
     */
    mixins:
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.localStorage,
      bbn.wc.mixins.observer,
      bbn.wc.mixins.resizer
    ],
    static() {
      var limits = [5, 10, 15, 20, 25, 30, 40, 50];
    },
    props: {
      /**
       * @prop {(String|Number)} uid
       */
      uid: {
        type: [String, Number]
      },
      /**
       * @prop {String} content
       */
      content: {
        type: String
      },
      /**
       * @prop {(String|Boolean)} [false] url
       */
      url: {
        type: [String, Boolean],
        default: false
      },
      /**
       * @prop {Number} [0] limit
       */
      limit: {
        type: Number,
        default: 0
      },
      /**
       * @prop {Number} index
       */
      index: {
        type: Number
      },
      /**
       * @prop {Boolean} [false] hidden
       */
      hidden: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Number} [0] start
       */
      start: {
        type: Number,
        default: 0
      },
      /**
       * @prop {Number} [0] total
       */
      total: {
        type: Number,
        default: 0
      },
      /**
       * @prop {Boolean} [false] hideEmpty
       */
      hideEmpty: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {(String|Object)} component
       */
      component: {
        type: [String, Object]
      },
      /**
       * @prop {(String|Object)} itemComponent
       */
      itemComponent: {
        type: [String, Object]
      },
      /**
       * @prop {(String|Object)} [''] itemStyle
       */
      itemStyle: {
        type: [String, Object],
        default: ''
      },
      /**
       * @prop {(String|Object)} [''] itemClass
       */
      itemClass: {
        type: [String, Object],
        default: ''
      },
      /**
       * @prop {String} title
       */
      title: {
        type: String
      },
      /**
       * @prop {String} icon
       */
      icon: {
        type: String
      },
      /**
       * @prop {(Array|Fucntion)} buttonsLeft
       */
      buttonsLeft: {
        type: [Array, Function],
        default(){
          return [];
        }
      },
      /**
       * @prop {(Array|Fucntion)} buttonsRight
       */
      buttonsRight: {
        type: [Array, Function],
        default(){
          return [];
        }
      },
      /**
       * @prop {Booleann} [false] zoomable
       */
      zoomable: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Booleann} [true] closable
       */
      closable: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Booleann} [true] sortable
       */
      sortable: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Booleann} [true] pageable
       */
      pageable: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Object} [{}] source
       */
      source: {
        type: Object,
        default: function(){
          return {};
        }
      },
      /**
       * @prop {Object} [[]] items
       */
      items: {
        type: Array
      },
      /**
       * @prop {String} ['There is no available data'] noData
       */
      noData: {
        type: String,
        default: bbn._("There is no available data")
      },
      /**
       * @prop {Array} [[]] menu
       */
      menu: {
        type: Array,
        default: function(){
          return [];
        }
      },
      /**
       * @prop {String} position
       */
      position: {
        type: String
      },
      /**
       * @prop top
       */
      top: {},
      /**
       * @prop bottom
       */
      bottom: {},
      /**
       * @prop {Boolean} [false] full
       */
      full: {
        type: Boolean,
        default: false
      },
      /**
       * @prop opened
       */
      opened: {},
      /**
       * @prop [{}] options
       */
      options: {
        default(){
          return {}
        }
      },
      /**
       * @prop {String} [''] separator
       */
      separator: {
        type: String,
        default: ''
      },
      /**
       * @prop {Boolean} [true] showable
       */
      showable: {
        type: Boolean,
        default: true
      },
      /**
       * The padding value to assign to the content element.
       * If "true" the class "bbn-padded" will be assigned
       * @prop {Boolean|Number|String} [false] padding
       */
      padding: {
        type: [Boolean, Number, String],
        default: false
      },
      /**
       * The additional data to send with the ajax call
       * @prop {Object} [{}] data
       */
      data: {
        type: Object,
        default(){
          return {}
        }
      },
      /**
       * A component to show if items is empty
       * @prop {String|Object} noDataComponent
       */
      noDataComponent: {
        type: [String, Object]
      }
    },
    data(){
      return {
        /**
         * @data {Boolean} _1stRun
         */
        _1stRun: false,
        /**
         * @data {Boolean} isLoading
         */
        isLoading: false,
        /**
         * @data dashboard
         */
        dashboard: false,
        /**
         * @data currentItems
         */
        currentItems: this.items,
        /**
         * @data currentStart
         */
        currentStart: this.start,
        /**
         * @data currentTotal
         */
        currentTotal: this.total,
        /**
         * @data currentContent
         */
        currentContent: this.content || false,
        /**
         * @data currentSource
         */
        currentSource: this.source,
        /**
         * @data {Array} [[]] realButtonsRight
         */
        realButtonsRight: [],
        /**
         * @data {Array} [[]] realButtonsLeft
         */
        realButtonsLeft: []
      };
    },
    computed: {
      /**
       * @computed contentPadding
       * @return {String|Boolean}
       */
      contentPadding(){
        if ( bbn.fn.isNumber(this.padding) ){
          return this.padding + 'px';
        }
        return this.padding;
      },
      /**
       * @computed isClosable
       * @return {Boolean}
       */
      isClosable() {
        return this.dadhboard && this.dashboard.closable && this.closable;
      },
      /**
       * @computed currentPage
       * @return {Number}
       */
      currentPage(){
        if ( this.currentTotal > this.limit ){
          return (this.currentStart + this.limit) / this.limit;
        }
        return 0;
      },
      /**
       * @computed totalPages
       * @return {Number}
       */
      totalPages(){
        if ( this.currentTotal > this.limit ){
          return Math.ceil(this.currentTotal / this.limit);
        }
        return 1;
      },
      /**
       * @computed hasMenu
       * @return {Boolean}
       */
      hasMenu(){
        return !!this.finalMenu.length;
      },
      /**
       * @computed finalMenu
       * @return {Array}
       */
      finalMenu(){
        let tmp = this.menu.slice();
        if ( this.url ){
          tmp.unshift({
            text: bbn._("Reload"),
            icon: "nf nf-fa-refresh",
            action: () => {
              this.reload();
            }
          });
        }
        if ( this.limit ){
          let items = [];
          bbn.fn.each(bbnWidgetCreator.limits, (a, i) => {
            items.push({
              text: a.toString() + " " + bbn._("Items"),
              selected: a === this.limit,
              action: () => {
                this.dashboard.updateWidget(this.uid, {limit: a});
              }
            })
          });
          tmp.push({
            text: bbn._("Limit"),
            icon: 'nf nf-mdi-numeric',
            items: items,
            mode: "selection"
          });
        }
        return tmp;
      }
    },
    methods: {
      /**
       * @method updateButtons
       */
      updateButtons(){
        this.realButtonsLeft = bbn.fn.isFunction(this.buttonsLeft) ? this.buttonsLeft() : this.buttonsLeft;
        this.realButtonsRight = bbn.fn.isFunction(this.buttonsRight) ? this.buttonsRight() : this.buttonsRight;
      },
      /**
       * @method close
       * @emits close
       */
      close(){
        this.$emit("close", this.uid, this);
      },
      /**
       * @method zoom
       */
      zoom(){},
      /**
       * @method reload
       * @fires $nextTick
       * @fires load
       */
      reload(){
        this.currentItems = [];
        this.$nextTick(() => {
          this.load();
        });
      },
      /**
       * @method load
       * @fires $forceUpdate
       * @fires post
       * @fires dashboard.updateWidget
       * @fires observerWatch
       * @fires $nextTick
       * @fires onResize
       * @fires $set
       * @emits loaded
       * @return {Promise}
       */
      load(){
        if ( this.url ){
          let params = {
            key: this.uid
          };
          this.isLoading = true;
          this.$forceUpdate();
          if ( this.limit && this.pageable ){
            params.limit = this.limit;
            params.start = this.currentStart;
          }
          return this.post(this.url, bbn.fn.extend(true, params, this.data), d => {
            if ( d.data !== undefined ){
              this.currentItems = d.data;
              if ( d.limit && (this.limit !== d.limit) ){
                this.dashboard.updateWidget(this.uid, {limit: d.limit});
              }
              if ( d.start !== undefined ){
                this.currentStart = d.start;
              }
              if ( d.total !== undefined && (this.currentTotal !== d.total) ){
                this.currentTotal = d.total;
              }
              if ( d.observer && this.observerCheck() ){
                this.observerID = d.observer.id;
                this.observerValue = d.observer.value;
                if ( !this._1stRun ){
                  this.observerWatch();
                  this._1stRun = true;
                }
              }
              if ( d.optional !== undefined ){
                this.optionalData = d.optional;
              }
            }
            else if ( typeof d === 'object' ){
              this.currentSource = d;
            }
            return this.$nextTick(() => {
              this.isLoading = false;
              if (this.ready) {
                this.$emit("loaded");
                this.onResize();
              }
            });
          });
        }
        else {
          return new Promise(resolve => {
            if (this.items !== undefined) {
              let items = this.items.slice();
              if ( this.limit && 
                ((items.length > this.currentStart) && (items.length > this.limit))
              ){
                items = items.splice(this.currentStart, this.limit); 
              }

              this.currentItems = items; 
            }
            return this.$nextTick(() => {
              resolve();
              this.isLoading = false;
              if (this.ready) {
                this.$emit("loaded");
                this.onResize();
              }
            });
          })
        }
      },
      /**
       * @method nav
       * @param {String} arg
       * @fires load
       */
      nav(arg){
        let newStart = false;
        switch ( arg ){
          case 'first':
            newStart = 0;
            break;
          case 'prev':
            newStart = this.currentStart >= this.limit ? this.currentStart - this.limit : 0;
            break;
          case 'next':
            newStart = this.currentStart + this.limit;
            break;
          case 'last':
            newStart = (this.totalPages - 1) * this.limit;
            break;
        }
        if ( (newStart !== false) && (newStart !== this.currentStart) ){
          this.currentStart = newStart;
          this.load();
        }
      },
      /**
       * @method actionButton
       * @param name
       */
      actionButton(name){
        let tmp = this;
        let comp = this.component || this.itemComponent;
        if (!bbn.fn.isString(comp)) {
          comp = false;
        }
        else {
          comp = this.find(comp);
        }

        if ( comp && bbn.fn.isFunction(comp[name]) ){
          return comp[name]();
        }

        if (bbn.fn.isFunction(name) ){
          return name(this, this.items);
        }

        while ( tmp ){
          if (bbn.fn.isFunction(tmp[name]) ){
            return tmp[name]();
          }
          tmp = tmp.$parent;
        }
      },
      /**
       * @method setConfig
       * @fires dashboard.setConfig
       */
      setConfig(){
        if ( this.dashboard ){
          this.dashboard.setConfig(this.uid, {
            uid: this.uid,
            limit: this.limit,
            hidden: this.hidden,
            index: this.index
          });
        }
      }
    },
    /**
     * @event created
     * @fires updateButtons
     */
    created(){
      this.updateButtons();
    },
    /**
     * @event beforeMount
     */
    beforeMount(){
      this.dashboard = this.closest("bbn-dashboard");
    },
    /**
     * @event mounted
     * @fires setResizeEvent
     * @fires load
     */
    mounted(){
      this.setResizeEvent();
      this.load().then(() => {
        this.ready = true;
      });
    },
    /**
     * @event updated
     * @fires dadhboard.selfEmit
     */
    updated(){
      if ( this.dashboard ){
        this.dashboard.selfEmit(true);
      }
    },
    watch: {
      /**
       * @watch limit
       * @fires load
       */
      limit(){
        this.load();
      },
      /**
      * @watch observerDirty
      * @param {Boolean} newVal
      * @fires load
      */
      observerDirty(newVal){
        if ( newVal && !this.editedRow ){
          this.observerDirty = false;
          this.load();
        }
      },
      /**
       * @watch source
       * @param {Object} newVal
       */
      source: {
        deep: true,
        handler(newVal){
          this.currentSource = newVal
        }
      },
      /**
       * @watch url
       * @param {Boolean|String} newVal
       * @fires reload
       */
      url(newVal){
        this.reload();
      }
    }
  };
