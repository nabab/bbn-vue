(bbn_resolve) => {
((bbn) => {
 /**
  * @file bbn-scroll component
  *
  * @description bbn-scroll is a component consisting of horizontal and vertical bars that allow the flow of content in both directions, if the container its smaller than the content, inserts and removes reactively vertical, horizontal bar or both.
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 10/02/2017
  */

  (function(bbn){
    "use strict";
    Vue.component('bbn-cart', {
      name: 'bbn-cart',
      /**
       * @mixin bbn.vue.basicComponent
       * @mixin bbn.vue.eventsComponent
       */
      mixins: 
      [
        bbn.vue.basicComponent, 
        bbn.vue.eventsComponent
      ],
      props: {
      },
      data() {
        return {
        };
      },
      computed: {
      },
      methods: {
      },
      created(){
      },
      /**
       * @event mounted
       * @fires waitReady
       */
      mounted(){
      },
      beforeDestroy(){
      },
      watch: {
      }
    });
  
  })(bbn);
  
if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}