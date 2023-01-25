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
      column: {
        type: Object
      },
      index: {
        type: Number
      }
    },
    data(){
      return {
        main: this.closest('bbn-collapsable-columns'),
        isVisible: false,
        uuid: Symbol()
      }
    },
    computed: {
      items(){
        if (this.pageable && (!this.isAjax || !this.serverPaging)) {
          return this.filteredData.slice().splice(this.start, this.currentLimit);
        }
        return this.filteredData;
      }
    },
    methods: {
      setCheckCollapse(){
        if (this.main.collapseEmpty) {
          this.$once('dataloaded', () => {
            this.$set(this.column, 'opened', !!this.filteredData.length);
          });
        }
      }
    },
    beforeMount(){
      this.setCheckCollapse();
      this.main.columns.push(this);
    },
    mounted(){
      this.$nextTick(() => {
        this.ready = true;
      });
    },
    beforeDestroy(){
      if (this.main && this.main.columns && this.uuid) {
        let idx = bbn.fn.search(this.main.columns, 'uuid', this.uuid);
        if (idx > -1) {
          this.main.columns.splice(idx, 1);
        }
      }
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