/**
 * Created by BBN on 10/02/2017.
 */


(function(bbn){
  "use strict";

  Vue.component('bbn-panelbar2', {
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent],
    // The events that will be emitted by this component
    props: {
      
      /**
       * if itemsClass is given all Items will have the classes,if inthe array * items a class is specified for an item itemsClass will be overwritten * for that item
       * @prop {Array|String} [''] itemsClass
       */
      itemsClass: {
        type: [ Array, String ],
        default: ''  
      }, 
      items: {
        type: [ Array ]
      },
      opened: {
        type: [Number],
      }
    },
    data(){
      return {
        isArray: bbn.fn.isArray,
        selected: null
      };
    },
    mounted(){
      if (  (this.opened >= 0) ) {
        this.selected = this.opened
      }
    },
    methods: {
      select(idx){
        if ( this.selected !== idx ){
          this.selected = idx;
        }
        else{
          this.selected = false;
        }
        this.$emit('select', this.items[idx])
      }
    },
    computed: {
      text(){
        return this.$options.components.item.data().text
      },
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