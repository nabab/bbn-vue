/**
 * Created by BBN on 10/dd02/2017.
 */
(() => {
  "use strict";
  Vue.component('bbn-slideshow', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      source: {
        type: [Array, Function, String]
      },
      separator: {
        type: String
      },
      component: {
        type: Object
      },
      checkbox: {
        type: [String, Boolean],
        default: false
      },
      summary: {
        type: Boolean,
        default: false
      },
      //for image
      gallery: {
        type: Boolean,
        default: false
      },
      preview:{
        type: [Boolean, String],
        default: false
      },
      dimensionPreview:{
        type: Number,
        default: 45
      },
      autoPlay:{
        type: [Boolean, Number],
        default: false
      },// pause and start autoscroll
      ctrl:{
        type: [Boolean, String],
        default: false
      }, //show or no show arrow
      arrows:{
        type: [Boolean, Object],
        default: false
      },
      navigation:{
        type: Boolean,
        default: false
      },
      autoHidePreview:{
        type: Boolean,
        default: false
      },
      autoHideArrows:{
        type: Boolean,
        default: false
      },
      autoHideCtrl:{
        type: Boolean,
        default: false
      },
      loop:{
        type: Boolean,
        default: false
      },
      fullSlide:{
        type: Boolean,
        default: false
      },
      initialSlide:{
        type: Number,
        default: 0
      },
     showCount:{
        type: Boolean,
        default: false
      },
      showInfo:{
        type: Boolean,
        default: false
      },
      //insert a scroll inside a slide
      scroll: {
        type: Boolean,
        default: false
      }
    },
    data(){
      let src      = [],
          valuesCB = {},
          isAjax   = false;
      if ( this.gallery ){

      }
      if ( (typeof this.source === 'string') ){
        if ( this.separator ){
          src = this.source.split(this.separator).map((a) =>{
            return {content: a, type: 'text'};
          });
        }
        else{
          src = [];
          isAjax = true;
        }
      }
      else if ( bbn.fn.isFunction(this.source) ){
        src = this.source();
      }

      else if ( bbn.fn.isArray(this.source) && this.checkbox ){
        if ( this.separator ){
          this.source.forEach((v, i) =>{
            v.content.split(this.separator).forEach((a, k) =>{
              let o = {
                type: 'text',
                content: a,
                id: v.id
              };
              if ( k === 0 ){
                o.checkable = true;
              }
              src.push(o);
            });
          });
          valuesCB[i] = false;
        }
      }

      else if ( bbn.fn.isArray(this.source)  ){
        if ( bbn.fn.isEmpty(src) ){
          src = this.source.slice().map((val, idx) => {
            if ( typeof val === 'string' ){
              val = {
                type: this.gallery ? 'img' : 'text',
                content: val
              };
              if ( val.type === 'img' ){
                bbn.fn.extend(val, {
                  imageWidth: 0,
                  imageHeight: 0,
                  imageLeftMargin: 0,
                  imageTopMargin: 0,
                  showImg: false
                });
              }
            }
            if ( bbn.fn.isObject(val) && (!val.type || val.type !== 'img') ){
              val.type = 'text';
            }
            return bbn.fn.isObject(val) ? val : {};
          });
        }
      }
      return {
        name: bbn.fn.randomString().toLowerCase(),
        currentIndex: this.initialSlide > src.length ? 0 : this.initialSlide,
        items: src,
        isAjax: isAjax,
        defaultTextCB: bbn._("Don't show it again"),
        valuesCB: valuesCB,
        activeMiniature: 0,
        defaultAutoPlay: 5000,
        scrollInterval: false,
        showMiniature: this.autoHidePreview ? false : true,
        showArrowLeft: this.autoHideArrows ? false : true,
        showArrowRight: this.autoHideArrows ? false : true,
        showCtrl: this.autoHideCtrl ? false : true,
        arrowClass:{
          left:  'nf nf-fa-arrow_circle_left',
          right: 'nf nf-fa-arrow_circle_right',
        },
        imageWidth: 0,
        imageHeight: 0,
        imageLeftMargin: 0,
        imageTopMargin: 0
      }
    },
    methods: {
      /*updateImage(ev, idx){
        this.ratio(idx);
      },*/
      onResize(){
        if ( bbn.fn.isArray(this.source) && this.source.length ){
          this.source.forEach((v, i)=>{
            if ( v.loaded ){
              this.aspectRatio(i);
            }
          });
        }
      },
      afterLoad(idx){
        this.$set(this.source[idx], 'loaded', true);
        this.aspectRatio(idx);
      },
      aspectRatio(idx){
        this.$nextTick(()=>{
          let ctnRatio = this.lastKnownWidth/this.lastKnownHeight,
              img = this.getRef('slide-img' + idx.toString()),
              imgW = img.naturalWidth,
              imgH = img.naturalHeight,
              imgRatio = imgW/imgH,
              diff = Math.abs(ctnRatio - imgRatio),
              mode = this.items[idx].mode ? this.items[idx].mode : 'original';

          if( imgRatio > ctnRatio ){
            if( mode === 'zoom' ){
              this.$set(this.items[idx], 'imageWidth', 'auto');
              this.$set(this.items[idx], 'imageHeight', '100%');
              this.$set(this.items[idx], 'showImg', true);

              //this.items[idx].imageWidth = "auto";
              //this.items[idx].imageHeight =  "100%";
              //this.items[idx].showImg =  true;
            }
            if( mode === 'full' ){
              this.$set(this.items[idx], 'imageWidth', '100%');
              this.$set(this.items[idx], 'imageHeight', 'auto');
              this.$set(this.items[idx], 'showImg', true);
              //this.items[idx].imageWidth = "100%";
              //this.items[idx].imageHeight = "auto";
              //this.items[idx].showImg = true;
            }
          }
          if ( imgRatio < ctnRatio ){
            if ( mode === 'zoom' ){
              this.$set(this.items[idx], 'imageWidth', '100%');
              this.$set(this.items[idx], 'imageHeight', 'auto');
              this.$set(this.items[idx], 'showImg', true);

              //this.items[idx].imageWidth = "100%";
              //this.items[idx].imageHeight = "auto";
              //this.items[idx].showImg =  true;
            }
            if ( mode === 'full' ){
              this.$set(this.items[idx], 'imageWidth', 'auto');
              this.$set(this.items[idx], 'imageHeight', '100%');
              this.$set(this.items[idx], 'showImg', true);

              //this.items[idx].imageWidth = "auto";
              //this.items[idx].imageHeight = "100%";
              //this.items[idx].showImg =  true;
            }
          }
          if ( mode === 'stretch' ){

            this.$set(this.items[idx], 'imageWidth',  this.lastKnownWidth + 'px');
            this.$set(this.items[idx], 'imageHeight', this.lastKnownHeight + 'px');
            this.$set(this.items[idx], 'showImg', true);

            //this.items[idx].imageWidth = this.lastKnownWidth + 'px';
            //this.items[idx].imageHeight = this.lastKnownHeight + 'px';
            //this.items[idx].showImg =  true;
          }
          if ( mode === "original" ){
            this.$set(this.items[idx], 'showImg', true);
            //this.items[idx].showImg = true;
          }
        });
      },
      createStyle(){
        let st = '',
            rules = [];
        this.items.forEach((it, i) => {
          st += '.bbn-slideshow .slideswitch:target ~ .slide#' + (this.name + i.toString()) + ' .content{opacity: 0}';
          st += '.bbn-slideshow .slideswitch[id="' + this.name + i.toString() + '"]:target ~ .slide#' + this.name + i.toString() + ' .navigation {display: block !important;}';
          st += '.bbn-slideshow .slideswitch[id="' + this.name + i.toString() + '"]:target ~ .slide#' + this.name + i.toString() + ' .content {animation-name: fade_in; animation-duration: 0.5s;}';
          if ( it.animation ){
            st += '.bbn-slideshow .slideswitch[id="' + this.name + i.toString() + '"]:target ~ #' + this.name + i.toString() + ' .' + it.animation + ' {animation-name:' + it.animation + ' !important;animation-duration: ' + (it.duration || this.duration || '0.5') + 's;' + ( it.animation === 'flip' ? 'backface-visibility: hidden;' : '')+ '}';
          }
        });
        //$(this.$el).append('<style>' + st + '</style>');
      },
      prev(){
        let idx = this.currentIndex;
        if ( idx > 0 ){
          if ( !this.items[idx-1].animation ){
            this.getRef('slide' + (idx-1).toString()).style.animationName = 'slide_from_right';
          }
          this.currentIndex--;
        }
        if ( this.loop &&  idx === 0 ){
          this.currentIndex = this.items.length - 1;
        }
        if( this.autoPlay ){
          this.stopAutoPlay();
          this.$nextTick(()=>{
            this.startAutoPlay();
          });
        }
      },
      next(){
        let idx = this.currentIndex;
        if ( this.summary ){
          idx--;
        }
        if ( idx < (this.items.length -1) ){

          if ( !this.items[idx+1].animation ){
            this.getRef('slide' + (idx+1).toString()).style.animationName = 'slide_from_left';
          }
          this.currentIndex++;
        }
        if ( this.loop &&  idx === (this.items.length - 1) ){
          this.currentIndex = 0;
        }
        if( this.autoPlay ){
          this.stopAutoPlay();
          this.$nextTick(()=>{
            this.startAutoPlay();
          });
        }
      },
      startAutoPlay(){
        this.scrollInterval = setInterval(()=>{
          if ( this.currentIndex < (this.items.length -1) ){
            this.next();
          }
          else if( this.currentIndex === (this.items.length-1) ){
            this.currentIndex = 0;
          }
          if( this.preview ){
            this.activeMiniature = this.currentIndex;
          }
        }, typeof(this.autoPlay) === 'number' ? this.autoPlay*1000 : this.defaultAutoPlay);
      },
      stopAutoPlay(){
        if ( this.scrollInterval ){
          clearInterval(this.scrollInterval);
          this.scrollInterval = false;
        }
      },
      // for show or hide elements
      miniaturePreview(val){
        if( this.autoHidePreview ){
          this.showMiniature = val;
        }
      },
      arrowsPreview(direction, val){
        if( this.autoHideArrows ){
          if( direction === 'next' ){
            this.showArrowRight = val;
          }
          if( direction === 'prev' ){
            this.showArrowLeft = val;
          }
        }
      },
      ctrlPreview(val){
        if( this.autoHideCtrl ){
          this.showCtrl = val;
        }
      }
    },
    mounted(){
      /** @todo WTF?? Obliged to execute the following hack to not have scrollLeft and scrollTop when we open a
       *  popup a 2nd time.
       */
      /*
      this.$refs.scrollContainer.style.position = 'relative';
      setTimeout(() => {
        this.$refs.scrollContainer.style.position = 'absolute';
      }, 0)
      */
      if ( !this.isAjax && !this.items.length && this.getRef('slot').innerHTML.trim() ){
        if ( this.separator ){
          this.items = this.getRef('slot').innerHTML.split(this.separator).map((txt, i) => {
            let title = $('<div/>').html(txt).find("h1,h2,h3,h4,h5").eq(0).text();
            return {content: txt, type: 'text', title: title};
          });
        }
        else{
          this.items = [{content: this.getRef('slot').innerHTML, type: 'text'}]
        }
      }
      this.$nextTick(() => {
        this.createStyle();
        if( this.autoPlay ){
          this.startAutoPlay();
        }
        if ( bbn.fn.isObject(this.arrows) ){
          if ( this.arrows.left && this.arrows.left.length ){
            this.arrowClass.left = this.arrows.left
          }
          if( this.arrows.right && this.arrows.right.length ){
            this.arrowClass.right = this.arrows.right
          }
        }
        this.ready = true;
      })
    },
    watch: {
      show(newVal, oldVal){
        if ( newVal != oldVal ){
          this.$emit(newVal ? "show" : "hide");
        }
      },
      valuesCB: {
        deep: true,
        handler(newVal){
          this.$emit(newVal[this.currentIndex] ? 'check' : 'uncheck', this.items[this.currentIndex]);
        }
      },
      currentIndex(val){
        this.$emit('changeSlide', val);

      }
    },
    components: {
      miniature: {
        template: `<div class="bbn-w-100 bbn-c bbn-middle">
            <template  v-for="(it, i) in items"
                       style="display: inline; width: 20px; height: 20px"
            >
              <div  v-if="(type === 'image' || true) && (it.type === 'img')"
                    @click= "clickMiniature(it , i)"
                    class="zoom"
                    :style="{
                      border: (mainComponent.currentIndex === i) ? '2px inset red' : '1px inset black',
                      width: dimension +'px',
                      height: dimension + 'px',
                      margin: '0 3px 0 0',

                    }"
              >
                <img :src="it.content" width="100%" height="100%">
              </div>
              <div  v-if="(type === 'image' || true) && (it.type === 'text')"
                    @click= "clickMiniature(it , i)"
                    class="testing zoom"
                    :style="{
                      border: (mainComponent.currentIndex === i) ? '2px inset red' : '1px inset black',
                      width: dimension +'px',
                      height: dimension + 'px',
                      margin: '0 3px 0 0',
                    }"
              >
                <div v-html="it.content" class="content"></div>
              </div>
              <i v-else-if="type === 'circle'"
                   @click= "clickMiniature(it , i)"
                   :style="{
                     color: (mainComponent.currentIndex === i) ? 'red' : 'white',
                   }"
                  :class="[
                    (mainComponent.currentIndex === i ? 'nf nf-fa-dot_circle' : 'nf nf-fa-circle'),
                    'bbn-padded',
                    'circleMiniature'
                  ]"
              ></i>
            </template>
          </div>`,
        props: {
         items:{
           type: Array,
           default(){
             return []
           }
         },
         comapare:{
           type: Boolean,
           default: true
         },
         type:{
           type: [Boolean, String],
           default: 'image'
         },
         dimension:{
           type: Number,
           default: 45
         }
       },
        data(){
         return {
           mainComponent: bbn.vue.closest(this, 'bbn-slideshow2')

         }
       },
        methods:{
          clickMiniature(miniature, idx){
            this.mainComponent.activeMiniature = idx;
            this.mainComponent.currentIndex = idx;
            if( this.mainComponent.autoPlay ){
              this.mainComponent.stopAutoPlay();
              this.$nextTick(()=>{
                this.mainComponent.startAutoPlay();
              });
            }
          }
        },
        mounted(){
          $("div.zoom div.content").css("transform", "scale(0.2)")
          //$("div.zoom img").css("transform", "scale(0.2)")
          $("div.zoom div.content").find("img").css("transform", "scale(0.1)")
        }
      }
    }
  });
})();
