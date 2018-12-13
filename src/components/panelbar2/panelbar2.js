(function (bbn) {
  "use strict";

  Vue.component('bbn-panelbar2', {
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent],
    // The events that will be emitted by this component
    props: {
      source: {
        type: [Array]
      },
      /**
       * if itemsClass is given all Items will have the classes,if inthe array * items a class is specified for an item itemsClass will be overwritten * for that item
       * @prop {Array|String} [''] itemsClass
       */
      itemsClass: {
        type: [Array, String],
        default: ''
      },
      items: {
        type: [Array]
      },
      
    },
    data() {
      return {
        selected: false,
        isArray: bbn.fn.isArray,
        show:false
      };
    },
    methods: {
      select(idx) {
        if (this.selected !== idx) {
          this.selected = idx;
        } else {
          this.selected = false;
        }
        this.$emit('select', this.source[idx])
      },
        
      toggle(idx){
        this.show = !this.show;
        if ( this.show === true ){
          this.select(idx)
        }
          bbn.fn.log(this.show)
      },
      beforeEnter: function (el) {
        // el.style.height = '0';
      },
      enter: function (el) {
        //el.style.height = el.scrollHeight + 'px';
      },
      beforeLeave: function (el) {
        //  el.style.height = el.scrollHeight + 'px';
      },
      leave: function (el) {
        //el.style.height = '0';
      }
      
    },
    computed: {
      text() {
        return this.$options.components.item.data().text
      },
      currentItemsClass() {
        if (bbn.fn.isArray(this.itemsClass)) {
          return this.itemsClass.join(' ');
        } else {
          return this.itemsClass;
        }
      }
    },
    watch: {
      
    }
  });

})(bbn);