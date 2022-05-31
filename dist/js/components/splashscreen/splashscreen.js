(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, currentSwipeClass, 'bbn-overlay']"
     @touchstart="touchstart"
     @touchmove="touchmove"
     @touchend="touchend">
  <div class="bbn-splashscreen-main">
    <template v-for="item in filteredData">
      <img v-if="item.data.image"
           :src="item.data.image"
           :class="{'bbn-hidden': item.index !== currentIndex}">
    </template>
  </div>
  <div class="bbn-splashscreen-container bbn-flex-height bbn-overlay">
    <component v-if="headerComponent"
              :is="headerComponent"
              class="bbn-splashscreen-header"/>
    <div v-else-if="header"
        v-html="header"
        class="bbn-splashscreen-header">
    </div>
    <component v-if="!!dots && (dotsPosition === 'outsideTop')"
              :is="$options.components.dots"
              :indexes="currentIndexes"
              v-model="currentIndex"/>
    <div class="bbn-flex-fill">
      <template v-for="item in filteredData">
        <transition name="slide">
          <div v-show="ready && (item.index === currentIndex)"
                class="bbn-splashscreen-slide bbn-overlay">
            <div class="bbn-flex-height bbn-overlay">
              <component v-if="item.data.headerComponent"
                        :is="item.data.headerComponent"
                        class="bbn-splashscreen-slide-header"
                        v-bind="item.data"/>
              <div v-else-if="item.data.header"
                  v-html="item.data.header"
                  class="bbn-splashscreen-slide-header">
              </div>
              <component v-if="!!dots && (dotsPosition === 'insideTop')"
                        :is="$options.components.dots"
                        :indexes="currentIndexes"
                        v-model="currentIndex"/>
              <div class="bbn-flex-fill">
                <div class="bbn-overlay bbn-flex-width">
                  <div v-if="arrows"
                      class="bbn-splashscreen-arrow-next bbn-vmiddle bbn-spadded">
                    <i v-if="showPrevArrow"
                      class="nf nf-fa-angle_left bbn-xxxl bbn-p bbn-primary-text"
                      @click="prev"/>
                  </div>
                  <div class="bbn-flex-fill bbn-splashscreen-slide-body">
                    <component v-if="item.data.bodyComponent"
                              :is="item.data.bodyComponent"
                              class="bbn-overlay"
                              v-bind="item.data"/>
                    <div v-else-if="item.data.body"
                              v-html="item.data.body"
                              class="bbn-overlay">
                    </div>
                  </div>
                  <div v-if="arrows"
                      class="bbn-splashscreen-arrow-next bbn-vmiddle bbn-spadded">
                    <i v-if="showNextArrow"
                      class="nf nf-fa-angle_right bbn-xxxl bbn-p bbn-primary-text"
                      @click="next"/>
                  </div>
                </div>
              </div>
              <component v-if="!!dots && (dotsPosition === 'insideBottom')"
                        :is="$options.components.dots"
                        :indexes="currentIndexes"
                        v-model="currentIndex"/>
              <component v-if="item.data.footerComponent"
                        :is="item.data.footerComponent"
                        class="bbn-splashscreen-slide-footer"
                        v-bind="item.data"/>
              <div v-else-if="item.data.footer"
                  v-html="item.data.footer"
                  class="bbn-splashscreen-slide-footer">
              </div>
            </div>
          </div>
        </transition>
      </template>
    </div>
    <component v-if="!!dots && (dotsPosition === 'outsideBottom')"
              :is="$options.components.dots"
              :indexes="currentIndexes"
              v-model="currentIndex"/>
    <component v-if="footerComponent"
              :is="footerComponent"
              class="bbn-splashscreen-footer"/>
    <div v-else-if="footer"
        v-html="footer"
        class="bbn-splashscreen-footer">
    </div>
  </div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-splashscreen');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/splashscreen/splashscreen.css');
document.head.insertAdjacentElement('beforeend', css);

/**
 * @file bbn-splashscreen component
 * @description  bbn-splashscreen.
 * @author BBN Solutions
 * @copyright BBN Solutions
 */

 (function (bbn, Vue) {
  "use strict";
  Vue.component('bbn-splashscreen', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.eventsComponent
     * @mixin bbn.vue.resizerComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent,
      bbn.vue.listComponent,
      bbn.vue.eventsComponent,
      bbn.vue.resizerComponent
    ],
    props: {
      /**
       * @prop {Array} source
       */
      source: {
        type: Array
      },
      /**
       * @prop {Boolean} [true] arrows
       */
      arrows: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {(Boolean|String)} ['outsideBottom'] dots
       */
      dots: {
        type: [Boolean, String],
        default: 'outsideBottom',
        validator: d => [true, false, 'insideTop', 'insideBottom', 'outsideTop', 'outsideBottom'].includes(d)
      },
      /**
       * @prop {Boolean} [true] loop
       */
      loop: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {String} header
       */
      header: {
        type: String
      },
      /**
       * @prop {(String|Object|Vue)} headerComponent
       */
      headerComponent: {
        type: [String, Object, Vue]
      },
      /**
       * @prop {String} footer
       */
      footer: {
        type: String
      },
      /**
       * @prop {(String|Object|Vue)} footerComponent
       */
      footerComponent: {
        type: [String, Object, Vue]
      }
    },
    data(){
      return {
        currentSwipeClass: 'bbn-splashscreen-swipe-left',
        currentIndex: 0
      }
    },
    computed: {
      dotsPosition(){
        return this.dots === true ? 'outsideBottom' : this.dots;
      },
      currentIndexes(){
        return bbn.fn.map(this.filteredData, d => d.index);
      },
      currentStyle(){
        let style = {};
        if (this.currentData.length) {
          let item = this.currentData[this.currentIndex].data;
          if (item.background) {
            style.backgroundColor = item.background;
          }
          if (item.image) {
            style.backgroundImage = `url(${item.image})`;
            style.backgroundPosition = 'center';
            style.backgroundRepeat = 'no-repeat';
            style.backgroundSize = 'cover';
          }
        }
        return style;
      },
      showNextArrow(){
        let i = this.currentIndexes.indexOf(this.currentIndex);
        return (i > -1) && (!!this.loop || (this.currentIndexes[i+1] !== undefined));
      },
      showPrevArrow(){
        let i = this.currentIndexes.indexOf(this.currentIndex);
        return (i > -1) && (!!this.loop || (this.currentIndexes[i-1] !== undefined));
      }
    },
    methods: {
      prev(){
        if (this.currentIndexes.length) {
          let i = this.currentIndexes.indexOf(this.currentIndex);
          if (i > -1) {
            if (this.currentIndexes[i-1] !== undefined) {
              this.currentIndex = this.currentIndexes[i-1]
            }
            else if (this.loop) {
              this.currentIndex = this.currentIndexes[this.currentIndexes.length-1]
            }
          }
        }
      },
      next(){
        if (this.currentIndexes.length) {
          let i = this.currentIndexes.indexOf(this.currentIndex);
          if (i > -1) {
            if (this.currentIndexes[i+1] !== undefined) {
              this.currentIndex = this.currentIndexes[i+1]
            }
            else if (this.loop) {
              this.currentIndex = this.currentIndexes[0]
            }
          }
        }
      },
      _map(data) {
        if ( bbn.fn.isArray(data) ){
          data = data.map(a => {
            let o = bbn.fn.extend(true, {}, a);
            if (!o.headerComponent && (!bbn.fn.isString(o.header) || (bbn.fn.substr(o.header, 0,1) !== '<'))) {
              o.headerComponent = o.header;
              delete o.header;
            }
            if (!o.headerComponent && (!bbn.fn.isString(o.body) || (bbn.fn.substr(o.body, 0,1) !== '<'))) {
              o.bodyComponent = o.body;
              delete o.body;
            }
            if (!o.footerComponent && (!bbn.fn.isString(o.footer) || (bbn.fn.substr(o.footer, 0,1) !== '<'))) {
              o.footerComponent = o.footer;
              delete o.footer;
            }
            return o;
          });
          return (this.map ? data.map(this.map) : data).slice();
        }
        return [];
      },
      _getStyle(item){
        let style = {};
        if (item.background) {
          style.backgroundColor = item.background;
        }
        if (item.image) {
          style.backgroundImage = `url(${item.image})`;
          style.backgroundPosition = 'center';
          style.backgroundRepeat = 'no-repeat';
          style.backgroundSize = 'cover';
        }
        return style;
      },
      _swipeLeft(){
        this.currentSwipeClass = 'bbn-splashscreen-swipe-left';
        this.next();
      },
      _swipeRight(){
        this.currentSwipeClass = 'bbn-splashscreen-swipe-right';
        this.prev();
      }
    },
    created(){
      this.$on('swipeleft', this._swipeLeft);
      this.$on('swiperight', this._swipeRight);
    },
    mounted(){
      this.ready = true;
    },
    beforeDestroy() {
      this.$off('swipeleft', this._swipeLeft);
      this.$off('swiperight', this._swipeRight);
    },
    watch: {
      source:{
        deep: true,
        handler(){
          this.updateData();
        }
      },
      currentIndex(idx){
        this.$emit('change', idx, this.source[idx]);
      }
    },
    components: {
      dots: {
        template: `
          <div class="bbn-splashscreen-dots bbn-c">
            <i v-for="idx in indexes"
               @click="select(idx)"
               :class="['bbn-padded', 'bbn-p', 'nf nf-fa-circle', {
                 ' bbn-primary-text': value !== idx,
                 'bbn-primary-text-alt': value === idx
               }]"
               style="width: 02rem; height: 0.2rem"/>
          </div>
        `,
        props: {
          value: {
            type: Number
          },
          indexes: {
            type: Array
          }
        },
        methods: {
          select(idx){
            this.$emit('input', idx);
          }
        }
      }
    }
  })
})(window.bbn, window.Vue);
if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}