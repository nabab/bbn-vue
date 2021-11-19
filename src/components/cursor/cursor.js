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
     * @mixin bbn.vue.eventsComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.eventsComponent, bbn.vue.inputComponent],
    props: {
      /**
       * @prop {Number} [1] step
       */
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
       * @prop {Number} [0] min
       */
      min: {
        type: Number,
        default: 0  
      },
      /**
       * @prop {Number} [500] max
       */
      max: {
        type: Number,
        default: 500
      },
      /**
       * @prop {String} [''] String
       */
      title: {
        type: String,
        default: ''
      },
      /**
       * @prop {(Number|String)} value
       */
      value: {
        type: Number | String,
      },
      /**
       * @prop {String} [''] unit
       */
      unit: {
        type: String,
        default: ''
      }
    },
    computed: {
      /**
       * @computed label
       * @return {(Number|String)}
       */
      label(){
        return this.value 
      }
    }
  });
})(bbn);
