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

;((bbn) => {
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
        info: false,
        interval: false,
        timeNow: false
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
        let items = [];
        bbn.fn.each(this.loadingItems, (a) => {
          let b = bbn.fn.clone(a);
          b.duration = this.timeNow - b.start;
          items.push(b);
        })
        return items.concat(this.loadedItems)
      },
      currentItem(){
        return this.loadingItems.length ? this.loadingItems[0] : (this.loadedItems.length ? this.loadedItems[0] : false)
      },

    },
    methods: {
      renderDuration(d){
        let tmp = d / 1000;
        if ( tmp < 10){
          return tmp.toFixed(3)+ ' s';
        }
        else {
          return parseInt(tmp) + ' s';
        }
      },
      cancel(item){
        if ( item.loading ){
          this.getPopup().confirm(bbn._("Are you sure you want to abort this request?"), (d) => {
            bbn.fn.abort(item.key)
          })
        }
      },
      deleteHistory(){
        let tmp = [];
        bbn.fn.each(this.data, (a) => {
          if ( a.isLoading ){
            tmp.push(a);
          }
        });
        this.data = tmp;
      },
    },
    mounted(){
      this.interval = setInterval(() => {
        var date = new Date();
        this.timeNow = parseInt(date.getTime());
      }, 1000);
    },
    beforeDestroy() {
      clearInterval(this.interval)
    },
  });

})(bbn);
