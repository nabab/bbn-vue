/**
  * @file bbn-breadcrumb component
  * @description bbn-breadcrumb
  * @copyright BBN Solutions
  * @author Mirko Argentino mirko@bbn.solutions
  * @created 10/03/2020
  * @ignore
  */
 (function(bbn, Vue){
  "use strict";

  Vue.component("bbn-breadcrumb", {
    name: 'bbn-breadcrumb',
    mixins: [
      /**
       * @mixin bbn.vue.basicComponent
       */
      bbn.vue.basicComponent,
      /**
       * @mixin bbn.vue.resizerComponent
       */
      bbn.vue.resizerComponent,
      /**
       * @mixin bbn.vue.localStorageComponent
       */
      bbn.vue.localStorageComponent,
      /**
       * @mixin bbn.vue.closeComponent
       */
      bbn.vue.closeComponent,
      /**
       * @mixin bbn.vue.observerComponent
       */
      bbn.vue.observerComponent
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
      value: {},
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
       * The max length for a title
       * @prop {Number} maxTitleLength
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
      },
      /**
       * Set it to true if you want to set this breadcrumb as a master.
       * @prop {Boolean} [false] master
       */
      master: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        /**
         * The current selected view's index.
         * @data {Number|Boolean} [false] selected
         */
        selected: false,
        /**
         * @data {Boolean} [false] iconsReady
         */
        iconsReady: false,
        /**
         * The parents breadcrumbs list.
         * @data {Array} [[]] parents
         */
        parents: [],
        /**
         * The sub-breadcrumbs list indexed by the view's url
         * @data {Object} {{}} subBreadcrumbs
         */
        subBreadcrumbs: {},
        /**
         * A list of all sub-breadcrumbs
         * @data {Array} [[]] allSubBreadcrumbs
         */
        allSubBreadcrumbs: []
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
      /**
       * The master bbn-router of this breadcrumb.
       * @computed itsMaster
       * @return {Vue}
       */
      router(){
        if ( this.$parent && (this.$parent.$options.name === 'bbn-router') ){
          return this.$parent;
        }
        return false;
      },
      /**
       * Returns the master bbn-breadcrumb of this one
       * @computed itsMaster
       * @return {Vue}
       */
      itsMaster(){
        if ( this.master ){
          return this;
        }
        else if (
          this.router &&
          this.router.itsMaster &&
          this.router.itsMaster.itsMasterBreadcrumb
        ){
          return this.router.itsMaster.itsMasterBreadcrumb;
        }
        return bbn.fn.getRow(this.parents, {master: true})
      },
      /**
       * The list of the sub-breadcrumbs used for the render.
       * @computed currents
       * @return {Array}
       */
      currents(){
        let ret = [],
            // a way to force this computed to update itself
            sbcs = this.allSubBreadcrumbs;
        if ( this.router && bbn.fn.isNumber(this.router.selected) ){
          let url = this.router.views[this.router.selected].url;
          if ( this.router.urls[url] && this.subBreadcrumbs[url] ){
            ret.push(this.subBreadcrumbs[url]);
            if ( this.subBreadcrumbs[url].currents.length ){
              ret.push(...this.subBreadcrumbs[url].currents);
            }
          }
        }
        return ret;
      },
      /**
       * Returns the background color used for the main bar.
       * @computed backgroundColor
       * @return {String}
       */
      backgroundColor(){
        return this.isNumber(this.selected) && this.source[this.selected] && this.source[this.selected].bcolor ? this.source[this.selected].bcolor : ''
      },
      /**
       * Returns the font color used for the main bar.
       * @computed fontcolor
       * @return {String}
       */
      fontColor(){
        return this.isNumber(this.selected) && this.source[this.selected] && this.source[this.selected].fcolor ? this.source[this.selected].fcolor : ''
      }
    },
    methods: {
      /**
       * Alias of bbn.fn.isNumber
       * @method isNumber
       * @return {Boolean}
       */
      isNumber: bbn.fn.isNumber,
      /**
       * @method register
       * @param {Vue} bc
       * @param {String} url
       */
      register(bc, url){
        this.subBreadcrumbs[url] = bc;
        this.allSubBreadcrumbs.push(bc);
        if ( this.itsMaster ){
          this.itsMaster.allSubBreadcrumbs.push(bc);
        }
      },
      /**
       * @method unregister
       * @param {Vue} bc
       * @param {String} url
       */
      unregister(bc, url){
        if ( this.subBreadcrumbs[url] ){
          delete this.subBreadcrumbs[url];
        }
        let idx = bbn.fn.search(this.allSubBreadcrumbs, {_uid: bc._uid});
        if ( idx !== -1 ){
          this.allSubBreadcrumbs.splice(idx, 1);
        }
        if ( this.itsMaster ){
          let idx2 = bbn.fn.search(this.itsMaster.allSubBreadcrumbs, {_uid: bc._uid});
          if ( idx2 !== -1 ){
            this.itsMaster.allSubBreadcrumbs.splice(idx2, 1);
          }
        }
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
       * @method close
       * @param {Number} idx
       * @param {Boolean} force
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
       * @method closeAllBut
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
       * @method isvalidIndex
       * @return {Boolean}
       */
      isValidIndex(idx){
        return bbn.fn.isNumber(idx) && (this.source[idx] !== undefined);
      },
      /**
       * Returns the breadcrumb's source list.
       * @method getList
       * @param {Vue} bc
       * @fires close
       * @return {Array}
       */
      getList(bc){
        let list = [];
        if ( !bc ){
          bc = this;
        }
        bbn.fn.each(bc.source, (t, i) => {
          if ( !t.hidden ){
            list.push({
              text: `${i === this.selected ? '<span style="font-weight: bold">' : ''}${t.title}${i === this.selected ? '</strong>' : ''}`,
              icon: t.icon,
              key: t.url,
              bcolor: t.bcolor,
              fcolor: t.fcolor,
              static: t.static,
              action: () => {
                bc.selected = t.idx;
              },
              closeAction: () => {
                bc.close(t.idx)
              }
            })
          }
        });
        return list;
      },
    },
    /**
     * @event mounted
     */
    mounted(){
      if ( !this.master ){
        bbn.fn.each(this.ancesters('bbn-breadcrumb'), b => {
          this.parents.push(b);
          if ( b.master ){
            return false;
          }
        });
      }
      if ( bbn.fn.isNumber(this.value) ){
        this.selected = this.value;
      }
      this.$nextTick(() => {
        if ( !this.master && this.router ){
          this.router.parent.itsBreadcrumb.register(
            this,
            this.router.baseURL.substr(0, this.router.baseURL.length - 1)
          );
        }
      })
      this.ready = true;
      setTimeout(() => {
        // bugfix for rendering some nf-mdi icons
        this.iconsReady = true;
      }, 1000);
    },
    /**
     * @event beforeDestroy
     */
    beforeDestroy(){
      if (
        !this.master &&
        this.router &&
        this.router.parent &&
        this.router.parent.itsBreadcrumb
      ){
        this.router.parent.itsBreadcrumb.unregister(
          this,
          this.router.baseURL.substr(0, this.router.baseURL.length - 1)
        );
      }
    },
    watch: {
      /**
       * @watch selected
       * @emit select
       */
      selected(newVal, oldVal){
        if ( newVal !== oldVal ){
          this.$emit('select', newVal);
        }
      },
      /**
       * @watch value
       */
      value(newVal, oldVal){
        if ( newVal !== oldVal ){
          this.selected = newVal
        }
      }
    },
    components: {
      /**
       * @component listItem
       */
      listItem: {
        template: `
<span class="bbn-w-100 bbn-vxspadded bbn-hspadded"
      :style="{
        backgroundColor: source.bcolor || false,
        color: source.fcolor || false
      }"
>
  <span class="bbn-flex-width">
    <span v-if="source.icon"
          class="space"
    >
      <i :class="source.icon"></i>
    </span>
    <span class="text bbn-flex-fill" v-html="source.text"></span>
    <span v-if="!source.static"
          class="space"
          style="text-align: right"
          @click.prevent.stop="close"
    >
      <i class="nf nf-fa-times"></i>
    </span>
  </span>
</span>
        `,
        props: {
          /**
           * @prop {Object} source
           * @memberof listItem
           */
          source :{
            type: Object,
            required: true
          }
        },
        methods: {
          /**
           * @method close
           * @memberof listItem
           */
          close(){
            this.source.closeAction();
            this.closest('bbn-context').showFloater = false;
          }
        }
      }
    }
  });
})(bbn, Vue);