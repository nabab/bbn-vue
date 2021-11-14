/**
  * @file bbn-tabs component
  * @description bbn-tabs
  * @copyright BBN Solutions
  * @author Mirko Argentino mirko@bbn.solutions
  * @created 10/03/2020
  */
 (function(bbn, Vue){
  "use strict";

  Vue.component("bbn-tabs", {
    name: 'bbn-tabs',
    /**
     * @mixin bbn.vue.localStorageComponent
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.closeComponent
     * @mixin bbn.vue.observerComponent
     * @mixin bbn.vue.resizerComponent
     */
    
    mixins: 
    [     
      bbn.vue.basicComponent,
      bbn.vue.localStorageComponent,
      bbn.vue.closeComponent,
      bbn.vue.observerComponent,
      bbn.vue.resizerComponent
    ],
    props: {
      /**
       * @prop {Array} [true] source
       */
      source: {
        type: Array,
        reuired: true
      },
      /**
       * @prop value
       */
      value: {
        type: [Number, Boolean]
      },
      /**
       * @prop {Boolean} [true] content
       */
      content: {
        type: Boolean,
        default: true
      },
      /**
       * Sets if the tabs' titles will be scrollable in case they have a greater width than the page (true), or if they will be shown multilines (false, default).
       * @prop {Boolean} [false] scrollable
       */
      scrollable: {
        type: Boolean,
        default: false
      },
      /**
       * The max length for the tab's title
       * @prop {Number} [20] maxTitleLength
       */
      maxTitleLength: {
        type: Number,
        default: 20
      },
      /**
       * @prop {Function} menu
       */
      menu: {
        type: Function
      }
    },
    data(){
      return {
        /**
         * The current selected tab's index.
         * @data {Number|Boolean} [false] selected
         */
        selected: null,
        /**
         * @data {Boolean} [false] iconsReady
         */
        iconsReady: false,
      }
    },
    computed: {
      /**
       * Returns the scroll configuration
       * @computed scrollCfg
       * @return {Object}
       */
      scrollCfg(){
        return this.scrollable ? {
          axis: 'x',
          container: true,
          hidden: true
        } : {};
      },
    },
    methods: {
      /**
       * Alias of bbn.fn.numProperties
       * @method numProperties
       * @return {Number|Boolean}
       */
      numProperties: bbn.fn.numProperties,
      /**
       * Cuts the given string by 'maxTitleLength' property value
       * @method cutTitle
       * @param {String} title
       * @return {String}
       */
      cutTitle(title){
        return bbn.fn.shorten(title, this.maxTitleLength)
      },
      /**
       * @method getMenuFn
       * @param {Number} idx
       * @return {Array}
       */
      getMenuFn(idx){
        return this.menu ? this.menu(idx) : [];
      },
      /**
       * @method getFullTitle
       * @param {Object} obj
       * @return {String|null}
       */
      getFullTitle(obj){
        let t = '';
        if ( obj.noText || (obj.title.length > this.maxTitleLength) ){
          t += obj.title;
        }
        if ( obj.ftitle ){
          t += t.length ? ' - ' + obj.ftitle : obj.ftitle;
        }
        return t || null;
      },
      /**
       * @method getTabColor
       * @param {Number} idx
       * @fires getRef
       * @return {String}
       */
      getTabColor(idx){
        if ( this.source[idx].fcolor ){
          return this.source[idx].fcolor;
        }
        let el = this.getRef('title-' + idx);
        if ( el ){
          return window.getComputedStyle(el.$el ? el.$el : el).color;
        }
        return 'black';
      },
      /**
       * @method scrollTabs
       * @param {String} dir
       * @fires getRef
       */
      scrollTabs(dir){
        let scroll = this.getRef('horizontal-scroll');
        if ( scroll ){
          if ( dir === 'right' ){
            scroll.scrollAfter();
          }
          else{
            scroll.scrollBefore();
          }
        }
      },
      /**
       * @method getTab
       * @param {Number} idx
       * @fires getRef
       * @return {HTMLElement}
       */
      getTab(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        return this.getRef('tab-' + idx);
      },
      /**
       * @method close
       * @param {Number} idx
       * @param {boolean} force
       * @fires isValidIndex
       * @emit beforeclose
       * @emit close
       */
      close(idx, force){
        if ( this.isValidIndex(idx) ){
          let ev = new CustomEvent('beforeClose', {
            cancelable: true
          });
          this.$emit('beforeClose', idx, force, ev);
          if ( !ev.defaultPrevented ){
            this.source.splice(idx, 1);
            if ( this.selected > idx ){
              this.selected--;
            }
            else if ( this.selected === idx ){
              this.selected = false;
            }
            this.$emit('close', idx, force);
          }
        }
      },
      /**
       * @method closeAll
       * @fires close
       */
      closeAll(){
        for ( let i = this.source.length - 1; i >= 0; i-- ){
          if ( !this.source[i].static && !this.source[i].pinned ){
            this.close(i);
          }
        }
      },
      /**
       * @method closeallBut
       * @param {Number} idx
       * @fires close
       */
      closeAllBut(idx){
        for ( let i = this.source.length - 1; i >= 0; i-- ){
          if ( !this.source[i].static && !this.source[i].pinned && (i !== idx) ){
            this.close(i);
          }
        }
      },
      /**
       * @method ping
       * @param {Number} idx
       * @fires isValidIndex
       * @emit beforePin
       * @emit pin
       */
      pin(idx){
        if ( this.isValidIndex(idx) ){
          let ev = new CustomEvent('beforePin', {
            cancelable: true
          });
          this.$emit('beforePin', idx, ev);
          if ( !ev.defaultPrevented ){
            this.source[idx].pinned = true;
            this.$emit('pin', idx);
          }
        }
      },
      /**
       * @method unpin
       * @param {Number} idx
       * @fires isValidIndex
       * @emit beforeUnpin
       * @emit unpin
       */
      unpin(idx){
        if ( this.isValidIndex(idx) ){
          let ev = new CustomEvent('beforeUnpin', {
            cancelable: true
          });
          this.$emit('beforeUnpin', idx, ev);
          if ( !ev.defaultPrevented ){
            this.source[idx].pinned = false;
            this.$emit('unpin', idx);
          }
        }
      },
      /**
       * @method isValidIndex
       * @param {Number} idx
       * @return {Boolean}
       */
      isValidIndex(idx){
        return bbn.fn.isNumber(idx) && (this.source[idx] !== undefined);
      }
    },
    beforeMount(){
      if ( bbn.fn.isNumber(this.value) ){
        this.selected = this.value;
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.$nextTick(() => {
        this.ready = true;
      })
      setTimeout(() => {
        // bugfix for rendering some nf-mdi icons
        this.iconsReady = true;
      }, 1000);
    },
    watch: {
      /**
       * @watch selected
       * @emit select
       */
      selected(newVal, oldVal){
        if ( (newVal !== oldVal) && bbn.fn.isNumber(newVal) && this.ready ){
          this.$emit('select', newVal);
        }
      },
      /**
       * @watch value
       */
      value(newVal, oldVal){
        if ( (newVal !== oldVal) && bbn.fn.isNumber(newVal) && this.ready ){
          this.selected = newVal
        }
      }
    },
  });

})(bbn, Vue);