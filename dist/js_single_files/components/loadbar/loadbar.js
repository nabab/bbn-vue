((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="['bbn-100', 'bbn-unselectable', componentClass]">
  <span class="bbn-loadbar-content bbn-right-padded bbn-flex-width"
        @click="info = !info"
        ref="bar">
    <!--span class="buttons" v-if="data.length">
      <i :title="_('History informations')"
         :class="{
           'bbn-p': false,
           'bbn-lg': true,
           'fa': true,
           'fa-info_circle': true
         }"
         @click="getInfo"
      ></i>
      <i :title="_('Delete history')"
         :class="{
           'bbn-p': data.length,
           'bbn-lg': true,
           'far': true,
           'fa-times_circle': true,
           'bbn-invisible': !data.length
         }"
         @click="deleteHistory"
      ></i>
      <i :title="_('Previous Ajax call')"
         :class="{
           'bbn-p': selected < data.length - 1,
           'bbn-lg': true,
           'fas': true,
           'fa-angle_left': true,
           'bbn-invisible': selected >= data.length - 1
         }"
         @click="selected++"
      ></i>
      <i :title="_('Next Ajax call')"
         :class="{
           'bbn-p': selected > 0,
           'bbn-lg': true,
           'fa': true,
           'fa-angle_right': true,
           'bbn-invisible': selected <= 0
         }"
         @click="selected--"
      ></i>
      <i :title="_('Play current calls')"
         :class="{
           'bbn-p': selected > 0,
           'bbn-lg': true,
           'fa': true,
           'fa-play': true,
           'bbn-invisible': selected <= 0
         }"
         @click="selected = 0"
      ></i>
    </span-->
    <span class="bbn-loadbar-state bbn-hxspadded bbn-c bbn-block bbn-h-100 bbn-middle">
      <bbn-loadicon v-if="currentItem.loading" class="bbn-blue bbn-h-100"></bbn-loadicon>
      <i v-else-if="currentItem.error" class="nf nf-fa-times_circle bbn-red"></i>
      <i v-else-if="currentItem.success" class="nf nf-fa-check bbn-green"></i>
      <i v-else-if="currentItem.abort" class="nf nf-mdi-stop bbn-orange"></i>
    </span>
    <span class="bbn-flex-fill">
      <span class="bbn-overlay">
        <span class="bbn-h-100 bbn-vmiddle">
          <a href="javascript:;"
             :title="text + ' ' + _('Loading')"
             style="color: inherit; cursor: default"
             v-if="currentItem"
             v-text="currentItem.url"
          ></a>
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
               @open="focusInput"
               width="100%"
               max-height="60vw"
  >
    <div class="bbn-padded bbn-w-100">
      <bbn-input class="bbn-w-100"
                 button-right="nf nf-mdi-send"
                 v-model="link"
                 @keydown.enter="go"
                 @clickRightButton="go"
      ></bbn-input>
      <ul class="bbn-reset bbn-w-100 bbn-ul">
        <li v-for="it of items">
          <div @click="cancel(it)">
            <span class="bbn-loadbar-state bbn-hxspadded bbn-c">
              <bbn-loadicon v-if="it.loading" class="bbn-blue"></bbn-loadicon>
              <i v-else-if="it.error" class="nf nf-fa-times_circle bbn-red"></i>
              <i v-else-if="it.success" class="nf nf-fa-check bbn-green"></i>
              <i v-else-if="it.abort" class="nf nf-mdi-stop bbn-orange"></i>
            </span>
            <div class="bbn-loadbar-time bbn-c">
              <span v-text="renderDuration(it.duration)"></span>
            </div>
            <span class="bbn-hxspadded" v-text="it.url"></span>
          </div>
          <div v-if="it.error && it.errorMessage"
                class="bbn-loadbar-error bbn-red"
                v-text="it.errorMessage"
          ></div>
        </li>
      </ul>
    </div>
  </bbn-floater>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-loadbar');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
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
      go(){
        if (this.link) {
          bbn.fn.link(this.link);
        }
      },
      focusInput(){
        let input = this.find('bbn-input');
        if (input) {
          input.getRef('element').focus();
        }
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