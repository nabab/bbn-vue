/**
 * @file bbn-panelbar component
 *
 * @description bbn-panelbar it's a component that configures itself easily, it allows to visualize the data in a hierarchical way expandable to levels.
 * It can contain texts, html elements and even Vue components, the latter can be inserted both on its content but also as a header.
 * Those who use this component have the possibility to see schematically their data with the maximum simplicity of interpretation.
 *
 * @copyright BBN Solutions
 *
 * @author Loredana Bruno
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-panelbar', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.localStorageComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent],

    props: {
     
      /**
       * The source of the component. The object item has property:
       * - header // the title on the header
       * - headerComponent // a component on the header
       * - headerOptions // options relative to the component on the header
       * - content // the content html or text to show when the item is selected
       * - component // a component to show when the item is selected
       * - height // the height of the item's slot, it will overwrite the props itemsHeight for the item
       * - options // options of configuration of the component shown in the slot of the item
       *
       * @prop {Array} items
       */
      source: {
        type: [ Array ]
      },
      scrollable: {
        type: Boolean,
        default: true
      },
      align: {
        type: String,
        default: 'center'
      },
      /**
       * Specifies whether or not an index will be expanded
       *
       * @prop {Number} opened
       */
      opened: {
        type: [Number],
      },
      /**
       * The component to be rendered on each header if not specified for the single item in the source
       * @prop {String} headerComponent
       */
      headerComponent: {
        type: String
      },
      /**
       * The object of properties to bind with the headerComponent
       * @prop {Object} headerOptions
       * 
       */
      headerOptions: {
        type: Object
      },
      /**
       * the component to be rendered in each content slot if not specified for the single item in the source
       * @prop {String} component
       */
      component: {
        type: String
      },
      /**
       * the object of properties to bind with the component in the content slot
       * @prop {Object} componentOptions
       */
      componentOptions :{
        type: Object
      }
    },
    data(){
      return {
        /**
         * The index of the selected item
         * @data {Number} [null] selected
         */
        selected: null,
      };
    },
     /**
      * Select the index of item defined by the prop opened
      * @event mounted
      */
    mounted(){
      if ( this.opened ){
        this.selected = this.opened;
      }
    },
    methods: {
     /**
       * Shows the content of selected items and emits the event select
       * @emits select
       * @method select
       * @param {Number} idx
       */
      select(idx){
        if ( this.selected !== idx ){
          this.selected = idx;
          this.$emit('select', idx, this.source[idx])
        }
        else{
          this.selected = null;
        }
      }

    },
  });

})(bbn);
