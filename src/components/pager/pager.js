/**
 * @file bbn-pager component
 * @description bbn-pager is a component to manage the pagination of a pageable component.
 * @author BBN Solutions
 * @copyright BBN Solutions
 */
((bbn) =>{
  "use strict";

  Vue.component('bbn-pager', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * The element to bond with
       * @props {Vue} element
       */
      element: {
        type: Vue,
        required: true
      },
      buttons: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      firstPage(){
        if ( this.element && (this.element.currentPage !== 1) ){
          this.element.currentPage = 1;
        }
      },
      nextPage(){
        if ( this.element && (this.element.currentPage < this.element.numPages) ){
          this.element.currentPage++;
        }
      },
      prevPage(){
        if ( this.element && (this.element.currentPage > 1) ){
          this.element.currentPage--;
        }
      },
      lastPage(){
        if ( this.element && (this.element.currentPage !== this.element.numPages) ){
          this.element.currentPage = this.element.numPages;
        }
      }
    },
    created(){
      if ( this.element ){
        this.element.$on('ready', () => {
          this.ready = true;
        })
      }
    },
    mounted(){
      if ( this.element && this.element.ready && !this.ready ){
        this.ready = true;
      }
    }
  });

})(bbn);
