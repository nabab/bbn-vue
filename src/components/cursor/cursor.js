/**
 * @file bbn-block component
 * @description bbn-block 
 * @copyright BBN Solutions
 * @author Loredana Bruno
 * @created 09/11/2020.
 */
(function(bbn){
  "use strict";
  
  Vue.component('bbn-cursor', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.eventsComponent, bbn.vue.inputComponent],
    props: {
      step: {
        type: Number, 
        default: 1
      },
      /**
       * The aduio's URL
       */
      /*source: {
        type: Number,
        required: true
      },*/
      /**
       * The audio's title
       * @prop {String} [''] title
       */
      min: {
        type: Number,
        default: 0  
      },
      max: {
        type: Number,
        default: 500
      },
      title: {
        type: String,
        default: ''
      },
      value: {
        type: Number | String,
      },
      unit: {
        type: String,
        default: ''
      }
    },
    computed: {
      label(){
        return this.value 
      }
    }
  });
})(bbn);
