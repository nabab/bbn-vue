(bbn => {
  "use strict";
  Vue.component('bbn-column-list', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent
    ],
    props: {
      index: {
        type: Number
      },
      collapsable: {
        type: Boolean,
        default: false
      },
      autoCollapse: {
        type: Boolean,
        default: false
      },
      /**
       * The width
       * @prop {Number|String} ['100%'] width
       */
      width: {
        type: [Number, String],
        default: '100%'
      },
      scrollable: {
        type: Boolean,
        default: true
      },
      backgroundColor: {
        type: String
      },
      fontColor: {
        type: String
      },
      title: {
        type: String
      },
      toolbar: {
        type: [String, Vue, Object]
      },
      toolbarSource: {
        type: Object
      },
      /**
       * The options for the component
       * @prop {Object} componentOptions
       */
      componentOptions: {
        type: Object
      }
    },
    data(){
      return {
        isVisible: false,
        collapsed: false
      }
    },
    computed: {
      items(){
        if (this.pageable && (!this.isAjax || !this.serverPaging)) {
          return this.filteredData.slice().splice(this.start, this.currentLimit);
        }
        return this.filteredData;
      },
      headerVisible(){
        return !!this.collapsable || (this.title !== undefined) || !!this.toolbar;
      }
    },
    methods: {
      symbol: Symbol,
      setCheckCollapse(force){
        if (this.autoCollapse || force) {
          this.$once('dataloaded', () => {
            if (this.filteredData.length) {
              this.expand(force);
            }
            else {
              this.collapse(force);
            }
          });
        }
      },
      expand(force){
        if (this.collapsable || force) {
          this.collapsed = false;
          this.$emit('expanded', this);
        }
      },
      collapse(force){
        if (this.collapsable || force) {
          this.collapsed = true;
          this.$emit('collapsed', this);
        }
      },
      expandAll(){
        if (!!this.component && this.currentData.length) {
          let items = this.findAll(this.component);
          bbn.fn.each(items, item => {
            item.$set(item, 'collapsed', false);
          });
        }
      },
      collapseAll(){
        if (!!this.component && this.currentData.length) {
          let items = this.findAll(this.component);
          bbn.fn.each(items, item => {
            item.$set(item, 'collapsed', true);
          });
        }
      }
    },
    beforeMount(){
      if (this.collapsable) {
        this.setCheckCollapse();
      }
      this.$emit('beforemount', this);
    },
    mounted(){
      this.$nextTick(() => {
        this.ready = true;
      });
    },
    beforeDestroy(){
      this.$emit('beforedestroy', this);
    },
    watch: {
      data: {
        deep: true,
        handler(){
          this.updateData();
        }
      },
      isLoaded: {
        immediate: true,
        handler(newVal){
          this.$once('dataloaded', () => {
            this.isVisible = true;
          });
        }
      }
    }
  });
})(bbn);