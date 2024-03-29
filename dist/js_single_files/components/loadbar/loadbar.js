((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="['bbn-100', 'bbn-unselectable', componentClass]">
  <span class="bbn-loadbar-content bbn-h-100 bbn-flex-width"
        @click="info = !info"
        ref="bar">
    <span class="bbn-loadbar-state bbn-hxspadded bbn-c bbn-block bbn-h-100 bbn-middle">
      <bbn-loadicon v-if="currentItem.loading" class="bbn-blue"/>
      <i v-else-if="currentItem.error" class="nf nf-fa-times_circle bbn-red"/>
      <i v-else-if="currentItem.success" class="nf nf-fa-check bbn-green"/>
      <i v-else-if="currentItem.abort" class="nf nf-mdi-stop bbn-orange"/>
    </span>
    <span class="bbn-flex-fill">
      <span class="bbn-overlay">
        <span class="bbn-h-100 bbn-vmiddle bbn-s">
          <a href="javascript:;"
             :title="text + ' ' + _('Loading')"
             style="color: inherit; cursor: default"
             v-if="currentItem"
             v-text="currentItem.url"/>
        </span>
      </span>
    </span>
  </span>
  <bbn-floater v-if="info"
               :element="$refs.bar"
               ref="floater"
               :auto-hide="true"
               :title="_('Requests\\' history')"
               :closable="true"
               :container="$root.$el"
               :scrollable="true"
               @close="info = false"
               width="100%"
               max-height="60vw">
    <div class="bbn-padded bbn-w-100">
      <bbn-input class="bbn-w-100"
                 button-right="nf nf-mdi-send"
                 v-model="link"
                 @keydown.enter="go"
                 :focused="true"
                 @clickRightButton="go"/>
      <ul class="bbn-reset bbn-w-100 bbn-ul">
        <li v-for="it of items">
          <bbn-context tag="div"
                       class="bbn-vmiddle"
                       :max-width="300"
                       :source="contextMenu(it)">
            <span class="bbn-loadbar-state bbn-hxspadded bbn-c">
              <bbn-loadicon v-if="it.loading" class="bbn-blue"/>
              <i v-else-if="it.error" class="nf nf-fa-times_circle bbn-red"/>
              <i v-else-if="it.success" class="nf nf-fa-check bbn-green"/>
              <i v-else-if="it.abort" class="nf nf-mdi-stop bbn-orange"/>
            </span>
            <div class="bbn-loadbar-time bbn-c bbn-s">
              <span v-text="renderDuration(it.duration)"/>
            </div>
            <span class="bbn-hxspadded bbn-s" v-text="it.url"/>
          </bbn-context>
          <div v-if="it.error && it.errorMessage"
                class="bbn-loadbar-error bbn-red"
                v-text="it.errorMessage"/>
        </li>
      </ul>
    </div>
  </bbn-floater>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-loadbar');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

/**
 * @file bbn-loadbar component
 *
 * @description bbn-loadbar component is a simple implementation component, it represents a bar with a display of wait state of a user-defined file.
 * Next to the loading icon, you'll find the path of the file from which the response is expected.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 15/02/2017
 */

;(bbn => {
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-loadbar', {
    /**
     * @mixin bbn.vue.basicComponent 
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      //@todo not used
      encoded: {
        type: Boolean,
        default: true
      },
      //@todo not used
      position: {
        type: Object,
        default(){
          return {
            position: {
              bottom: 5,
              right: 5
            }
          };
        }
      },
      /**
       * The source of the component
       * @prop {Array} source
       */
      source: {
        type: Array
      },
      //@todo not used
      history: {
        type: Number,
        default: 100
      },
    },
    data(){
      return {
        /**
         * @data {Boolean} isLoading
         */
        isLoading: false,
        //@todo not used
        isSuccess: false,
        //@todo not used
        isError: false,
        /**
         * @data {String} [''] text
         */
        text: '',
        //@todo not used
        id: false,
        //@todo not used
        selected: 0,
        //@todo not used
        numLoaded: 0,
        /**
         * @data {Boolean} [false] info
         */
        info: false,
         /**
         * @data {Boolean} [false] interval
         */
        interval: false,
         /**
         * @data {Boolean} [false] timeNow
         */
        timeNow: false,
        link: ''
      };
    },
    computed: {
      /**
       * @computed loadingItems 
       * @return {Array}
       */
      loadingItems(){
        return bbn.fn.filter(this.source, {loading: true})
      },
       /**
       * @computed loadedItems 
       * @return {Array}
       */
      loadedItems(){
        return bbn.fn.filter(this.source, {loading: false})
      },
      /**
       * @computed items
       * @return {Array}
       */
      items(){
        let items = [];
        bbn.fn.each(this.loadingItems, a => {
          let b = bbn.fn.clone(a);
          b.duration = this.timeNow - b.start;
          items.push(b);
        })
        return items.concat(this.loadedItems)
      },
      /** 
       * @computed currentItem
       * @return {Object|Boolean}
      */
      currentItem(){
        return this.loadingItems.length ? this.loadingItems[0] : (this.loadedItems.length ? this.loadedItems[0] : false)
      },

    },
    methods: {
      contextMenu(item) {
        let res =  [{
          text: bbn._("Copy URL"),
          icon: 'nf nf-mdi-content_copy',
          action() {
            bbn.fn.copy(item.url);
            appui.success(bbn._("Copied"));
          }
        }];

        if (item.loading) {
          res.push({
            text: bbn._("abort"),
            icon: 'nf nf-mdi-cancel',
            action: () => {
              this.cancel(item);
            }
          });
        }

        return res;
      },
      /**
       * Return the duration in seconds or milliseconds of a request
       * @method renderDuration
       * @param {Number} d
       * @return {Number}
       */
      renderDuration(d){
        let tmp = d / 1000;
        if ( tmp < 10){
          return tmp.toFixed(3)+ ' s';
        }
        else {
          return parseInt(tmp) + ' s';
        }
      },
      /**
       * Aborts the selected request
       * @method cancel
       * @param {Object} item 
       */
      cancel(item){
        if (item.loading) {
          this.confirm(bbn._("Are you sure you want to abort this request?"), d => {
            bbn.fn.abort(item.key);
          })
        }
      },
      //@todo not used
      deleteHistory(){
        let tmp = [];
        bbn.fn.each(this.data, a => {
          if ( a.isLoading ){
            tmp.push(a);
          }
        });
        this.data = tmp;
      },
      /**
       * Opens the given link
       * @method go
       */
       go(){
        if (this.link) {
          bbn.fn.link(this.link);
          this.hide();
        }
      },
      /**
       * Shows the information panel
       * @method show
       */
      show() {
        this.info = true;
      },
      /**
       * Hides the information panel
       * @method hide
       */
      hide() {
        this.info = false;
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.interval = setInterval(() => {
        var date = new Date();
        this.timeNow = parseInt(date.getTime());
      }, 1000);
    },
    /**
     * @event beforeDestroy
     */
    beforeDestroy() {
      clearInterval(this.interval)
    },
    watch: {
      items(){
        /*
        if (this.info) {
          this.$nextTick(() => {
            let f = this.getRef('floater');
            if (f) {
              f.onResize();
            }
          })
        }
        */
      }
    }
  });

})(bbn);


})(bbn);