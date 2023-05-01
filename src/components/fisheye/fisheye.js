/**
 * @file bbn-fisheye component
 *
 * @description bbn-fisheye is a component that represents a horizontal menu, ideal for managing shortcuts.
 * The structure of data cannot be hierarchical.
 * Each element is represented by an icon capable of performing an action.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */
return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.list
     * @mixin bbn.wc.mixins.resizer
     */
    mixins: 
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.resizer, 
      bbn.wc.mixins.list
    ],
    props: {
      /**
       * The source of the component
       * @prop {Array} [[]] source
       */
      source: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * True if you want to activate the possibility to remove an element.
       * @prop {Boolean} [false] removable
       */
      removable: {
        type: Boolean,
        default: false
      },
      /**
       * An array of items fixed on the left of the component
       * @prop {Array} [[]] fixedLeft
       */
      fixedLeft: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * An array of items fixed on the right of the component
       * @prop {Array} [[]] fixedRight
       */
      fixedRight: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * The zIndex of the component
       * @prop {Number} [1] zIndex
       */
      zIndex: {
        type: Number,
        default: 1
      },
      /**
       * True if you want to render the component scrollable
       * @prop {Boolean} [false] scrollable
       */
      scrollable: {
        type: Boolean,
        default: false
      },
      /**
       * True if you want to render the mobile version of the component
       * @prop {Boolean} [false] mobile
       */
      mobile: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        /**
         * @data {Boolean} [false] menu
         */
        menu: false,
        /**
         * @data {Boolean} [false] widget
         */
        widget: false,
        /**
         * @data {Boolean} [false] overBin
         */
        overBin: false,
        /**
         * @data {Boolean} [false] droppableBin
         */
        droppableBin: false,
        /**
         * @data {Boolean|Number} [false] timeout
         */
        timeout: false,
        /**
         * @data {Boolean|Number} [false] binTimeout
         */
        binTimeout: false,
        /**
         * @data {Boolean} [false] visibleBin
         */
        visibleBin: false,
        /**
         * @data {Number} [-1] visibleText
         */
        visibleText: -1,
        /**
         * @data {Number} [-1] draggedIdx
         */
        draggedIdx: -1,
        /**
         * @data {Boolean} [true] showIcons
         */
        showIcons: !this.mobile,
        /**
         * @data {Boolean} [false] visibleFloater
         */
        visibleFloater: false,
        /**
         * @data {Number} [0] floaterTop
         */
        floaterTop: 0
      };
    },
    computed: {
      /**
       * The icons list
       * @computed items
       * @returns {Array}
       */
      items(){
        let items = [];
        let i = 0;
        bbn.fn.each(this.fixedLeft, a => {
          items.push({
            data: a,
            fixed: true,
            index: i
          });
          i++;
        });
        bbn.fn.each(this.filteredData, a => {
          items.push({
            data: a.data,
            fixed: false,
            index: i
          });
          i++;
        });
        bbn.fn.each(this.fixedRight, a => {
          items.push({
            data: a,
            fixed: true,
            index: i
          });
          i++;
        });
        return items;
      },
      /**
       * The bin position.
       * @computed binPosition
       * @returns {String}
       */
      binPosition(){
        return this.showIcons ? 'top: 15rem' : 'bottom: calc(-' + bbn.env.height + 'px + 5rem)';
      }
    },
    methods: {
      /**
       * Fires the action given to the item
       * @method onClick
       * @param {Object} it
       */
      onClick(it){
        if ( it.url ){
          bbn.fn.link(it.url);
        }
        if ( it.action && bbn.fn.isFunction(it.action) ){
          it.action();
        }
        this.visibleFloater = false;
      },
      /**
       * The method called on the mouseover
       * @method mouseover
       * @param {Number} idx
       */
      mouseover(idx){
        if ( !bbn.fn.isMobile() && (this.visibleText !== idx) ){
          clearTimeout(this.timeout);
          this.visibleText = -1;
          this.timeout = setTimeout(() => {
            this.visibleText = idx;
          }, 500);
        }
      },
      /**
       * The method calledon the mouseout
       * @method mouseout
       */
      mouseout(){
        clearTimeout(this.timeout);
        this.visibleText = -1;
      },
      /**
       * The method called on the dragleave
       * @method dragleave
       */
      dragleave(){
        setTimeout(() => {
          this.overBin = false;
        }, 500);
      },
      /**
       * The method called on the dragstart
       * @method dragstart
       * @param {Number} idx
       * @param {Event} e
       */
      dragstart(idx, e){
        if (this.removable) {
          this.draggedIdx = idx;
          this.visibleBin = true;
        }
        else{
          e.preventDefault();
        }
      },
      /**
       * The method called on the dragend
       * @method dragend
       */
      dragend(){
        if ( this.removable ){
          this.visibleBin = false;
          this.draggedIdx = -1;
        }
      },
      /**
       * The method called on the drop
       * @method drop
       * @param {Event} e
       * @emits remove
       */
      drop(e){
        if ( this.items[this.draggedIdx] ){
          e.preventDefault();
          this.$emit('remove', this.items[this.draggedIdx].data, e);
        }
      },
      /**
       * Checks the measures of the main container and the icons container
       * @method checkMeasures
       * @fires getRef
       */
      checkMeasures(){
        let ct = this.getRef('container');
        if ( ct && !this.mobile ){
          this.showIcons = this.lastKnownWidth >= ct.offsetWidth;
        }
      },
      /**
       * Opens or closes the floater.
       * @method toggleFloater
       */
      toggleFloater(){
        if ( !this.visibleFloater ){
          this.floaterTop = this.$el.getBoundingClientRect().height;
        }
        this.visibleFloater = !this.visibleFloater;
      },
      /**
       * The method called on scroll mounted
       * @fires checkMeasures
       */
      onScrollMounted(){
        this.$nextTick(() => {
          this.checkMeasures();
        })
      }
    },
    /**
     * @event mounted
     * @fires setResizeMeasures
     * @fires setContainerMeasures
     * @fires checkMeasures
     */
    mounted(){
      this.setResizeMeasures();
      this.setContainerMeasures();
      this.$nextTick(() => {
        this.ready = true;
        this.checkMeasures();
      })
    },
    watch: {
      /**
       * @watch source
       * @fires updateData
       */
      source(){
        this.updateData();
      },
      /**
       * @watch lastKnownWidth
       * @fires checkMeasures
       */
      lastKnownWidth(newVal){
        this.checkMeasures();
      },
      /**
       * @watch items
       * @fires checkMeasures
       */
      items(){
        if ( this.ready ){
          this.$nextTick(() => {
            this.checkMeasures();
          })
        }
      }
    }
  };
