(bbn_resolve) => {
((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-overlay']">
  <div v-if="ready && (item.index === currentIndex)"
       class="bbn-splashscreen-slide bbn-overlay"
       v-for="item in filteredData"
       :style="_getStyle(item.data)">
    <div class="bbn-flex-height">
      <component v-if="item.data.headerComponent"
                 :is="item.data.headerComponent"
                 class="bbn-splashscreen-slide-header"/>
      <div v-else-if="item.data.header"
           v-html="item.data.header"
           class="bbn-splashscreen-slide-header">
      </div>
      <component v-if="!!dots && (dotsPosition === 'top')"
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
                       class="bbn-overlay"/>
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
      <component v-if="!!dots && (dotsPosition === 'bottom')"
                 :is="$options.components.dots"
                 :indexes="currentIndexes"
                 v-model="currentIndex"/>
      <component v-if="item.data.footerComponent"
                 :is="item.data.footerComponent"
                 class="bbn-splashscreen-slide-footer"/>
      <div v-else-if="item.data.footer"
           v-html="item.data.footer"
           class="bbn-splashscreen-slide-footer">
      </div>
    </div>
  </div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-splashscreen');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
 * @file bbn-splashscreen component
 * @description  bbn-splashscreen.
 * @author BBN Solutions
 * @copyright BBN Solutions
 */

 (function (bbn, Vue) {
  "use strict";
  Vue.component('bbn-splashscreen', {
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent,
      bbn.vue.eventsComponent,
      bbn.vue.resizerComponent
    ],
    props: {
      source: {
        type: Array
      },
      arrows: {
        type: Boolean,
        default: true
      },
      dots: {
        type: [Boolean, String],
        default: 'bottom',
        validator: d => [true, false, 'top', 'bottom'].includes(d)
      },
      loop: {
        type: Boolean,
        default: true
      }
    },
    data(){
      return {
        currentIndex: 0
      }
    },
    computed: {
      dotsPosition(){
        return this.dots === true ? 'bottom' : this.dots;
      },
      currentIndexes(){
        return bbn.fn.map(this.filteredData, d => d.index);
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
      _map(data) {
        if ( bbn.fn.isArray(data) ){
          data = data.map((a) => {
            let o = bbn.fn.extend(true, {}, a);
            if (!o.headerComponent && (!bbn.fn.isString(o.header) || (o.header.substr(0,1) !== '<'))) {
              o.headerComponent = o.header;
              delete o.header;
            }
            if (!o.headerComponent && (!bbn.fn.isString(o.body) || (o.body.substr(0,1) !== '<'))) {
              o.bodyComponent = o.body;
              delete o.body;
            }
            if (!o.footerComponent && (!bbn.fn.isString(o.footer) || (o.footer.substr(0,1) !== '<'))) {
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
          style.backgroundPositionX = 'center';
          style.backgroundPositionY = 'center';
          style.backgroundRepeatX = 'no-repeat';
          style.backgroundRepeatY = 'no-repeat';
          style.backgroundSize = 'cover';
        }
        return style;
      },
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
    },
    mounted(){
      this.ready = true;
    },
    watch: {
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
               :class="['bbn-padded', 'bbn-p', {
                 ' bbn-primary-text': value !== idx,
                 'bbn-primary-text-alt': value === idx,
                 'nf nf-fa-dot_circle_o': value === idx,
                 'nf nf-fa-circle': value !== idx
               }]"
               style="width: 02em; height: 0.2em"/>
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