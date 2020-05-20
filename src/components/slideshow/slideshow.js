/**
 * @file bbn-slideshow component
 * @description bbn-slideshow is a highly configurable component, it also allows the display of reactive elements such as components, images, or texts; having full control of the transitions.
 * @copyright BBN Solutions
 *
 * @author Vito Fava
 *
 * @created 10/02/2017
 */

(() => {
  "use strict";
  Vue.component('bbn-slideshow', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      /**
       * The source of the slideshow
       * @prop {Array|Function|String} source
       */
      source: {
        type: [Array, Function, String]
      },
      /**
       * If the type of the source is a string defines which character to use as separator between slides.
       * @prop {String} separator
       */
      separator: {
        type: String
      },
      /**
       * The component to use in each slide.
       * @prop {Object} component
       */
      component: {
        type: Object
      },
      /**
       * Insert a checkbox in each slide.
       * @prop {String|Boolean} [false] checkbox
       */
      checkbox: {
        type: [String, Boolean],
        default: false
      },
      /**
       * Set to true shows a list of all slides' title that can be used to navigate between them.
       * @prop {Boolean} [false] summary
       */
      summary: {
        type: Boolean,
        default: false
      },
      //for image
      /**
       * @prop {Boolean} [false] gallery
       */
      gallery: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true shows the list of previews of the slide.
       * @prop {Boolean|String} [false] preview
       */
      preview:{
        type: [Boolean, String],
        default: false
      },
      /**
       * The dimension of the preview.
       * @prop {Number} [45] dimensionPreview
       */
      dimensionPreview:{
        type: Number,
        default: 45
      },
      /**
       * Set to true enables the autoplay using the default autoplay time (5000ms). If a number is given, multiplied * 1000, will define the new autoplay time .
       * @prop {Boolean|Number} [false] autoplay
       */
      autoPlay:{
        type: [Boolean, Number],
        default: false
      },
      /**
       * Shows the actions to start and stop autoplay.
       * @prop {Boolean|String} [false] ctrl
       */
      ctrl:{
        type: [Boolean, String],
        default: false
      },
      /**
       * Set to true shows the arrow icons to move to next or previous slide. An object with 'left' and 'right' properties can be given to specify the css class for each arrow and to customize the icon.
       * @prop {Bolean|Object} [false] arrows
       */
      arrows:{
        type: [Boolean, Object],
        default: false
      },
      //@todo not used
      navigation:{
        type: Boolean,
        default: false
      },
      /**
       * Set to true hides the preview images.
       * @prop {Boolean} [false] autoHidePreview
       */
      autoHidePreview:{
        type: Boolean,
        default: false
      },
      /**
       * Set to true hides the arrow icons.
       * @prop {Boolean} [false] autoHideArrows
       */
      autoHideArrows:{
        type: Boolean,
        default: false
      },
      /**
       * Set to true hides the action to start and stop the autoplay.
       * @prop {Boolean} [false] autoHideCtrl
       */
      autoHideCtrl:{
        type: Boolean,
        default: false
      },
      /**
       * If set to true shows the slides in a loop..
       * @prop {Boolean} [false] loop
       */
      loop:{
        type: Boolean,
        default: false
      },
      /**
       * Set to true shows the slide in the full page.
       * @prop {Boolean} [false] fullSlide
       */
      fullSlide:{
        type: Boolean,
        default: false
      },
      /**
       * The index of the first slide to show.
       * @prop {Number} [0] initialSlide
       */
      initialSlide:{
        type: Number,
        default: 0
      },
      /**
       * Set to true shows the number of the current slide and the total number of slides.
       * @prop {Boolean} [false] showCount
       */
      showCount:{
        type: Boolean,
        default: false
      },
      /**
       * Set to true shows the property info of the item.
       * @prop {Boolean} [false] showInfo
       */
      showInfo:{
        type: Boolean,
        default: false
      },
      /**
       * If the property content is given to the item, set to true insert the html content inside a scroll.
       * @prop {Boolean} [false] scroll
       */
      
      scroll: {
        type: Boolean,
        default: false
      }
    },
    data(){
      let src = [],
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
        /**
         * @data {String} [bbn.fn.randomString().toLowerCase()] name
         */
        name: bbn.fn.randomString().toLowerCase(),
        /**
         * The current slide index
         * @data {Number} currentIndex
         */
        currentIndex: this.initialSlide > src.length ? 0 : this.initialSlide,
        /**
         * The array of items.
         * @data {Array} items
         */
        items: src,
        /**
         * True if the type of the prop source is string and the prop separator is false.
         * @data {Boolean} isAjax
         */
        isAjax: isAjax,
        /**
         * The default text to show as label of the checkbox in a selectable slideshow.
         * @data {String} ['Don't show it again'] defaultTextCB
         */
        defaultTextCB: bbn._("Don't show it again"),
        /**
         * The values of the checkbox in a selectable slideshow.
         * @data valuesCB
         */
        valuesCB: valuesCB,
        /**
         * The active miniature.
         * @data {Number} [0] activeMiniature
         */
        activeMiniature: 0,
        /**
         * The default autoplay time in milliseconds.
         * @data {Number} [5000] defaultAutoPlay
         */
        defaultAutoPlay: 5000,
        /**
         * The interval of the autoplay.
         * @data {Boolean} [false] scrollInterval
         */
        scrollInterval: false,
        /**
         * Shows or hides the miniature.
         * @data {Boolean} [false] showMiniature
         */
        showMiniature: this.autoHidePreview ? false : true,
        /**
         * If true shows the left arrow icon.
         * @data {Boolean} [false] showArrowLeft
         */
        showArrowLeft: this.autoHideArrows ? false : true,
        /**
         * If true shows the right arrow icon. 
         * @data {Boolean} [false] showArrowRight
         */
        showArrowRight: this.autoHideArrows ? false : true,
        /**
         * True shows the controller of the component.
         * @data {Boolean} [false] showCtrl
         */
        showCtrl: this.autoHideCtrl ? false : true,
        /**
         * The classes of the arrow icons
         * @data {Object} [{left: 'nf nf-fa-arrow_circle_left',right: 'nf nf-fa-arrow_circle_right'}] arrowClass
         */
        arrowClass:{
          left:  'nf nf-fa-arrow_circle_left',
          right: 'nf nf-fa-arrow_circle_right',
        },
        /**
         * The width of the image.
         * @data {Number} [0] imageWidth
         */
        imageWidth: 0,
        /**
         * The height of the image.
         * @data {Number} [0] imageHeight
         */
        imageHeight: 0,
        /**
         * The margin left of the image.
         * @data {Number} [0] imageLeftMargin
         */
        imageLeftMargin: 0,
        /**
         * The margin top of the image.
         * @data {Number} [0] imageTopMargin
         */
        imageTopMargin: 0
      }
    },
    methods: {
      /**
       * Handles the resize of the component.
       * @method onResize
       * @fires aspectRatio
       */
      onResize(){
        if ( bbn.fn.isArray(this.source) && this.source.length ){
          this.source.forEach((v, i)=>{
            if ( v.loaded ){
              this.aspectRatio(i);
            }
          });
        }
      },
      /**
       * Sets the property loaded to true.
       * @method afterLoad
       * @param {Number} idx 
       * @fires aspectRatio
       */
      afterLoad(idx){
        this.$set(this.source[idx], 'loaded', true);
        this.aspectRatio(idx);
      },
      /**
       * Adjusts the dimensions of the slides basing on the 'mode' defined for the item.
       * @method aspectRatio
       * @param {Number} idx 
       */
      aspectRatio(idx){
        this.$nextTick(()=>{
          let ctnRatio = this.lastKnownCtWidth/this.lastKnownCtHeight,
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

            this.$set(this.items[idx], 'imageWidth',  this.lastKnownCtWidth + 'px');
            this.$set(this.items[idx], 'imageHeight', this.lastKnownCtHeight + 'px');
            this.$set(this.items[idx], 'showImg', true);

            //this.items[idx].imageWidth = this.lastKnownCtWidth + 'px';
            //this.items[idx].imageHeight = this.lastKnownCtHeight + 'px';
            //this.items[idx].showImg =  true;
          }
          if ( mode === "original" ){
            this.$set(this.items[idx], 'showImg', true);
            //this.items[idx].showImg = true;
          }
        });
      },
      /**
       * Manages the slides' style.
       * @method createStyle
       */
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
        return st;
      },
      /**
       * Shows the previous slide.
       * @method prev
       * @fires stopAutoPlay
       * @fires startAutoPlay
       */
      prev(){
        let idx = this.currentIndex;
        if ( (idx > 0) && this.items[idx-1] ){
          if ( !this.items[idx-1].animation ){
            let slide = this.getRef('slide' + (idx-1).toString());
            if ( slide ){
              slide.style.animationName = 'slide_from_right';
            }
          }
          this.currentIndex--;
        }
        if ( this.loop &&  idx === 0 ){
          this.currentIndex = this.items.length - 1;
        }
        if ( this.autoPlay ){
          this.stopAutoPlay();
          this.$nextTick(()=>{
            this.startAutoPlay();
          });
        }
      },
      /**
       * Shows the next slide.
       * @method next
       * @fires stopAutoPlay
       * @fires startAutoPlay
       */
      next(){
        let idx = this.currentIndex;
        if ( this.summary ){
          idx--;
        }
        if ( idx < (this.items.length -1) && this.items[idx+1] ){

          if ( !this.items[idx+1].animation ){
            let slide = this.getRef('slide' + (idx-1).toString());
            if ( slide ){
              slide.style.animationName = 'slide_from_left';
            }
          }
          this.currentIndex++;
        }
        if ( this.loop && (idx === (this.items.length - 1)) ){
          this.currentIndex = 0;
        }
        if( this.autoPlay ){
          this.stopAutoPlay();
          this.$nextTick(()=>{
            this.startAutoPlay();
          });
        }
      },
      /**
       * Starts the autoplay of slides.
       * @method startAutoPlay
       */
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
       /**
       * Stops the autoplay of slides.
       * @method stopAutoPlay
       */
      stopAutoPlay(){
        if ( this.scrollInterval ){
          clearInterval(this.scrollInterval);
          this.scrollInterval = false;
        }
      },
      /**
       * Shows or hides miniatures.
       * @method miniaturePreview
       * @param {Boolean} val 
       */
      miniaturePreview(val){
        if( this.autoHidePreview ){
          this.showMiniature = val;
        }
      },
      /**
       * Shows or hides arrows.
       * @param {String} direction 
       * @param {Boolean} val 
       */
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
      /**
       * Shows ors hides the controller for autoplay.
       * @param {Boolean} val 
       */
      ctrlPreview(val){
        if( this.autoHideCtrl ){
          this.showCtrl = val;
        }
      }
    },
    /**
     * @event mounted
     * @fires createStyle
     * @fires startAutoPlay
     */
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
          let el = document.createElement('div'),
              title = '';
            el.innerHTML = txt;
            if ( el ){
              let titles = el.querySelectorAll('h1,h2,h3,h4,h5');
              if ( titles.length ){
                bbn.fn.each(titles, (v, i) => {
                 let title = v.innerText.trim();
                })
              }
            }
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
      /**
       * @watch show
       * @param newVal 
       * @param oldVal 
       * @emits show
       * @emits hide
       */
      show(newVal, oldVal){
        if ( newVal != oldVal ){
          this.$emit(newVal ? "show" : "hide");
        }
      },
      /**
       * @watch valuesCB
       * @emits check
       * @emits uncheck
       * 
       */
      valuesCB: {
        deep: true,
        handler(newVal){
          this.$emit(newVal[this.currentIndex] ? 'check' : 'uncheck', this.items[this.currentIndex]);
        }
      },
      /**
       * @watch currentIndex
       * @emits changeSlide
       * @param {Number} val 
       */
      currentIndex(val){
        this.$emit('changeSlide', val);
      }
    },
    components: {
      /**
       * @component miniature
       */
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
          /**
           * The array of items.
           * @prop {Array} [] items
           * @memberof miniature
           */
         items:{
           type: Array,
           default(){
             return []
           }
         },
         /**
          * 
          * @prop {Boolean} [true] compare
          * @memberof miniature
          */
         compare:{
           type: Boolean,
           default: true
         },
          /**
          * @prop {Boolean|String} ['image'] type
          * @memberof miniature
          */
         type:{
           type: [Boolean, String],
           default: 'image'
         },
          /**
          * @prop {Number} [45] dimension
          * @memberof miniature
          */
         dimension:{
           type: Number,
           default: 45
         }
       },
        data(){
         return {
           /**
            * The parent component bbn-slideshow
            * @data {Vue} mainComponent
            */
           mainComponent: bbn.vue.closest(this, 'bbn-slideshow')

         }
       },
        methods:{
          /**
           * @method clickMiniature
           * 
           * @param miniature 
           * @param {Number} idx 
           * @fires stopAutoPlay
           * @fires startAutoPlay
           * @memberof miniature
           */
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
        /**
         * @event mounted
         * @memberof miniature
         */
        mounted(){
          const elem = this.$el.querySelector('div.zoom div.content');
          if ( elem ){
            elem.style.transform = 'scale(0.2)';
            if ( elem.querySelector('img') ){
              elem.querySelector('img').style.transform = 'scale(0.1)';
            }
          }
        }
      }
    }
  });
})();
