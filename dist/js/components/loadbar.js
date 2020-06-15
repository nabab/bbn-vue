((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[{'bbn-reset': true, 'bbn-100': true, 'bbn-unselectable': true}, componentClass]" @click="info = !info">
  <span class="content">
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
    <span class="bbn-loadbar-state">
      <bbn-loadicon v-if="currentItem.loading" class="bbn-blue"></bbn-loadicon>
      <i v-else-if="currentItem.error" class="nf nf-fa-times_circle bbn-red"></i>
      <i v-else-if="currentItem.success" class="nf nf-fa-check bbn-green"></i>
      <i v-else-if="currentItem.abort" class="nf nf-mdi-stop bbn-orange"></i>
    </span>
    <a href="javascript:;" :title="text + ' ' + _('Loading')" style="color: inherit; cursor: default" v-if="currentItem">
      <span class="text" v-text="currentItem.url"></span>
    </a>
  </span>
  <bbn-floater v-if="info && items.length"
               :element="$el"
               ref="floater"
               :auto-hide="true"
               :title="_('Requests\' history')"
               :closable="true"
               :scrollable="true"
               @close="info = false"
               @ready="focusInput"
               max-height="60vw">
      <div class="bbn-content bbn-w-100 bbn-padded">
        <bbn-input class="bbn-w-100"
                   button-right="nf nf-mdi-send"
                   v-model="link"
                   @keydown.enter="go"
                   @clickRightButton="go"></bbn-input>
        <ul class="bbn-reset bbn-w-100">
          <li v-for="it of items">
            <div @click="cancel(it)">
              <span class="bbn-loadbar-state">
                <bbn-loadicon v-if="it.loading" class="bbn-blue"></bbn-loadicon>
                <i v-else-if="it.error" class="nf nf-fa-times_circle bbn-red"></i>
                <i v-else-if="it.success" class="nf nf-fa-check bbn-green"></i>
                <i v-else-if="it.abort" class="nf nf-mdi-stop bbn-orange"></i>
              </span>
              <div class="bbn-loadbar-time">
                <span v-text="renderDuration(it.duration)">
                </span>
              </div>
              <span v-text="it.url"></span>
            </div>
            <div v-if="it.error && it.errorMessage" 
                 class="bbn-loadbar-error"
                 v-text="it.errorMessage"
            >
            </div>
          </li>
        </ul>
      </div>

  </bbn-floater>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-loadbar');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('style');
css.innerHTML = `.bbn-loadbar {
  font-size: small;
  vertical-align: bottom;
  white-space: nowrap;
  overflow: visible;
}
.bbn-loadbar span,
.bbn-loadbar a {
  display: inline-block;
  height: 100%;
  vertical-align: middle;
}
.bbn-loadbar span i,
.bbn-loadbar a i {
  vertical-align: middle;
}
.bbn-loadbar i {
  font-size: 16px;
}
.bbn-loadbar span:before {
  content: '';
  display: inline-block;
  height: 100%;
  vertical-align: middle;
  margin-right: -0.25em;
}
.bbn-loadbar .content {
  padding: 0 2em;
  display: inline-block;
  height: 100%;
  vertical-align: middle;
}
.bbn-loadbar .bbn-loadbar-state {
  width: 1em;
  margin-right: 0.5em;
  display: inline-block;
}
.bbn-loadbar .bbn-loadbar-time {
  width: 3.5em;
  margin-right: 0.5em;
  display: inline-block;
}
.bbn-loadbar .bbn-loadbar-floater {
  position: absolute;
  z-index: 5;
  bottom: 0px;
  height: auto;
  width: 100%;
  max-height: 40em;
  white-space: nowrap;
  overflow: hidden;
}
.bbn-loadbar .bbn-loadbar-floater .bbn-user-title {
  margin-right: 5px;
}
.bbn-loadbar .bbn-loadbar-floater .message a {
  word-wrap: break-word;
}
.bbn-loadbar .bbn-loadbar-floater .bbn-loadbar-error {
  padding-top: 2px;
  padding-bottom: 2px;
  color: red;
  margin-left: 5.5em;
}
.bbn-loadbar .fade-enter-active,
.bbn-loadbar .fade-leave-active {
  transition: opacity .5s;
}
.bbn-loadbar .fade-enter,
.bbn-loadbar .fade-leave-to {
  opacity: 0;
}
`;
document.head.insertAdjacentElement('beforeend', css);
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

;((bbn) => {
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
        bbn.fn.each(this.loadingItems, (a) => {
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
          this.confirm(bbn._("Are you sure you want to abort this request?"), (d) => {
            bbn.fn.abort(item.key);
          })
        }
      },
      //@todo not used
      deleteHistory(){
        let tmp = [];
        bbn.fn.each(this.data, (a) => {
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
        if (this.info) {
          this.$nextTick(() => {
            let f = this.getRef('floater');
            if (f) {
              f.onResize();
            }
          })
        }
      }
    }
  });

})(bbn);

})(bbn);