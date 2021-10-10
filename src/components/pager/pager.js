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
      /**
       * False if you wanto to see the arrows instead of the buttons
       * @prop {Boolean} [true] buttons
       */
      buttons: {
        type: Boolean,
        default: true
      },
      /**
       * Force to render as mobile
       * @prop {Boolean} [false] forceMobile
       */
      forceMobile: {
        type: Boolean,
        default: false
      },
      /**
       * Force to render as tablet
       * @prop {Boolean} [false] forceTablet
       */
      forceTablet: {
        type: Boolean,
        default: false
      },
      /**
       * The name of the `page` word as used in the pager interface.
       * @prop {String} ['Page'] pageName
       */
      pageName: {
        type: String,
        default: bbn._("page")
      },
      /**
       * The name of the `record` word as used in the pager interface.
       * @prop {String} ['Record(s)'] itemName
       */
      itemName: {
        type: String,
        default: bbn._("records")
      },
      /**
       * The extra controls part on the right.
       * @prop {Boolean} [true] extraControls
       */
      extraControls: {
        default: true
      }
    },
    data(){
      return {
        currentNumericPage: this.element.currentPage,
        numericTimeout: false
      }
    },
    computed: {
      currentPage: {
        get(){
          return this.element.currentPage;
        },
        set(v) {
          this.element.currentPage = v;
        }
      }

    },
    methods: {
      /**
       * @method firstPage
       */
      firstPage(){
        if (this.element
          && ('currentPage' in this.element)
          && (this.element.currentPage !== 1)
        ){
          this.element.currentPage = 1;
        }
      },
      /**
       * @method nextPage
       */
      nextPage(){
        if (this.element
          && ('currentPage' in this.element)
          && ('numPages' in this.element)
          && (this.element.currentPage < this.element.numPages)
        ){
          this.element.currentPage++;
        }
      },
      /**
       * @method prevPage
       */
      prevPage(){
        if (this.element
          && ('currentPage' in this.element)
          && (this.element.currentPage > 1)
        ){
          this.element.currentPage--;
        }
      },
      /**
       * @method lastPage
       */
      lastPage(){
        if (this.element
          && ('currentPage' in this.element)
          && ('numPages' in this.element)
          && (this.element.currentPage !== this.element.numPages)
        ){
          this.element.currentPage = this.element.numPages;
        }
      }
    },
    /**
     * @event created
     */
    created(){
      if (this.forceMobile){
        this.isMobile = true;
      }
      if (this.forceTablet){
        this.isTablet = true;
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      if (this.element){
        if (this.element.ready && !this.ready){
          this.ready = true;
        }
        else {
          this.element.$on('ready', () => {
            this.ready = true;
          })
        }
      }
    },
    watch: {
      currentPage(v) {
        if (this.currentNumericPage !== v) {
          this.currentNumericPage = v;
        }
      },
      currentNumericPage(v){
        if (this.numericTimeout) {
          clearTimeout(this.numericTimeout);
        }
        this.numericTimeout = setTimeout(() => {
          if (this.currentPage !== v) {
            this.currentPage = v;
          }
        }, 500);
      }
    }
  });

})(bbn);
