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
       * The height that all contents will take if the height is not specified in the item object
       *
       * @prop {Number|String} [''] itemsHeight
       */
      itemsHeight: {
        type: [Number, String],
        default: ''
      },
      /**
       * The class or classes that all items will take
       *
       * @prop {Array|String} [''] itemsClass
       */
      itemsClass: {
        type: [ Array, String ],
        default: ''
      },
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
      /**
       * Set to true allows to select multiple items
       *
       * @prop {Boolean} [false] multi
       */
      multi: {
        type: [ Boolean ],
        default: false
      },
      /**
       * Specifies whether or not an index, an array of indexes, all items or none will be expanded
       *
       * @prop {Boolean|Number|Array} [false] opened
       */
      opened: {
        type: [Boolean, Number, Array],
        default: false
      }
    },
    data(){
      return {
        isArray: bbn.fn.isArray,
        selected: []
      };
    },
     /**
      * @event mounted
      */
    mounted(){
      if ( this.opened !== false ){
        if ( this.multi && ( this.opened === true  ) ) {
          bbn.fn.each( this.source, (v, i) => {
            this.selected.push(i);
          })
          return;
        }
        if ( !bbn.fn.isArray(this.opened) && bbn.fn.isNumber(this.opened)) {
          //case multi true and opened number
          if ( this.opened < this.source.length ){
            this.selected.push(this.opened);
          }
        }
        else if ( (bbn.fn.isArray(this.opened) ) && this.multi ){
          this.selected = this.opened;
        }
      }
    },
    methods: {
      /**
       * Return if an item is contained in the array of selected items
       *
       * @method includes
       * @param {Array} arr
       * @param {Number} i
       * @return Boolean
       */
      includes(arr, i){
        if ( bbn.fn.isArray(this.selected)){
          return arr.includes(i)
        }
        else{
          return false;
        }

      },
      /**
       * Return whether or not the param i is a number
       * @method isNumber
       * @param {Number} i
       * @return Boolean
       */
      isNumber(i){
        return bbn.fn.isNumber(i)
      },
      /**
       * Shows the content of selected items and emits the event select
       * @emits select
       * @method select
       * @param {Number} idx
       */
      select(idx){
        if ( this.multi ){
          if ( !this.includes(this.selected, idx) ) {
            this.selected.push(idx);
          }
          else {
            this.selected.splice(this.selected.indexOf(idx), 1)
          }
        }
        else {
          if ( this.selected.length ){
            this.selected.splice(0,1);
          }
          this.selected.push(idx)
        }
        this.$emit('select', this.source[idx])
      }

    },
    computed: {
      currentItemsClass(){
        if ( bbn.fn.isArray(this.itemsClass) ){
          return this.itemsClass.join(' ');
        }
        else{
          return this.itemsClass;
        }
      }
    },

  });

})(bbn);
