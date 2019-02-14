/**
 * Created by BBN on 07/01/2017.
 */
;(($, bbn, kendo) => {
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-loadbar', {
    mixins: [bbn.vue.basicComponent],
    props: {
      encoded: {
        type: Boolean,
        default: true
      },
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
      source: {
        type: Array
      },
      history: {
        type: Number,
        default: 100
      },
    },
    data(){
      return {
        isLoading: false,
        isSuccess: false,
        isError: false,
        text: '',
        id: false,
        selected: 0,
        numLoaded: 0,
        info: false
      };
    },

    computed: {
      loadingItems(){
        return bbn.fn.filter(this.source, {loading: true})
      },
      loadedItems(){
        return bbn.fn.filter(this.source, {loading: false})
      },
      items(){
        return this.source
      },
      currentItem(){
        return this.loadingItems.length ? this.loadingItems[0] : (this.loadedItems.length ? this.loadedItems[0] : false)
      },
    },

    methods: {
      cancel(item){
        if ( item.loading ){
          this.getPopup().confirm(bbn._("Are you sure you want to abort this request?"), (d) => {
            bbn.fn.abort(item.url)
          })
        }
      },
      deleteHistory(){
        let tmp = [];
        $.each(this.data, (i, a) => {
          if ( a.isLoading ){
            tmp.push(a);
          }
        });
        this.data = tmp;
      },
    },
  });

})(jQuery, bbn, kendo);
