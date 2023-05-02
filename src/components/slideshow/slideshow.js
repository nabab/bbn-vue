/**
 * @file bbn-slideshow component
 * @description bbn-slideshow is a highly configurable component, it also allows the display of reactive elements such as components, images, or texts; having full control of the transitions.
 * @copyright BBN Solutions
 *
 * @author Vito Fava
 *
 * @created 10/02/2017
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.resizer
     */
    mixins: 
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.resizer
    ],
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
        type: [String, Object]
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
        type: [Number, String],
        default: '60px'
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
        default: true
      },
      arrowsPosition: {
        type: String,
        default: 'default',
        validator: p => ['default', 'top', 'topleft', 'topright', 'bottom', 'bottomleft', 'bottomright'].includes(p)
      },
      /**
       * Shows or hides the navigation arrow at the bottom of the slider.
       * @prop {Boolean} [false] navigation
       */
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
        default: true
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
       * The property that will be used for the image info.
       * @prop {String} ['info'] sourceInfo
       */
       sourceInfo: {
        type: String,
        default: 'info'
      },
      /**
       * If the property content is given to the item, set to true insert the html content inside a scroll.
       * @prop {Boolean} [false] scrollable
       */
      scrollable: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {String|Number} ['50px'] minimumPreview
       */
      minimumPreview: {
        type: [String, Number],
        default: '50px'
      },
      /**
       * @prop {Boolean} [false] itemClickable
       */
      itemClickable: {
        type: Boolean,
        default: false
      },
      /**
       * Enables keyboard navigation
       * @prop {Boolean} [false] keyboard
       */
      keyboard: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        /**
         * @data {String} [bbn.fn.randomString().toLowerCase()] name
         */
        name: bbn.fn.randomString().toLowerCase(),
        /**
         * The current slide index
         * @data {Number} [0] currentIndex
         */
        currentIndex: 0,
        /**
         * The array of items.
         * @data {Array} [[]] items
         */
        items: [],
        /**
         * True if the type of the prop source is string and the prop separator is false.
         * @data {Boolean} isAjax
         */
        isAjax: bbn.fn.isString(this.source) && !this.separator,
        /**
         * The default text to show as label of the checkbox in a selectable slideshow.
         * @data {String} ['Don't show it again'] defaultTextCB
         */
        defaultTextCB: bbn._("Don't show it again"),
        /**
         * The values of the checkbox in a selectable slideshow.
         * @data {Object} [{}] valuesCB
         */
        valuesCB: {},
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
          left:  'nf nf-fa-angle_left',
          right: 'nf nf-fa-angle_right',
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
        imageTopMargin: 0,
        maxImgWidth: 0,
        maxImgHeight: 0,
        loaded: false
      }
    },
    computed: {
      /**
       * The left arrow class
       * @computed {String} leftArrowClass
       */
       leftArrowClass() {
        if (bbn.fn.isObject(this.arrows) && this.arrows.left) {
          return this.arrows.left;
        }

        return this.arrowClass.left;
      },
      /**
       * The right arrow class
       * @computed {String} rightArrowClass
       */
       rightArrowClass() {
        if (bbn.fn.isObject(this.arrows) && this.arrows.right) {
          return this.arrows.right;
        }

        return this.arrowClass.right;
      },
      arrowsStyle(){
        let style = {
          clear: 'both'
        };
        switch (this.arrowsPosition) {
          case 'top':
          case 'bottom':
            style.justifyContent = 'center';
            break;
          case 'topleft':
          case 'bottomleft':
            style.justifyContent = 'flex-start';
            break;
          case 'topright':
          case 'bottomright':
            style.justifyContent = 'flex-end';
            break;
        }
        return style;
      }
    },
    methods: {
      /**
       * Handles the resize of the component.
       * @method onResize
       * @fires aspectRatio
       */
      onResize(){
        this.setContainerMeasures();
        this.setResizeMeasures();
        if (bbn.fn.isArray(this.source) && this.source.length) {
          this.source.forEach((v, i) => {
            if (v.loaded) {
              this.aspectRatio(i);
            }
          });
        }
        this.maxImgWidth = this.getRef('slideContainer')?.offsetWidth || null;
        this.maxImgHeight = this.getRef('slideContainer')?.offsetHeight || null;
      },
      /**
       * Sets the property loaded to true.
       * @method afterLoad
       * @param {Number} idx 
       * @fires aspectRatio
       */
      afterLoad(idx) {
        this.$set(this.items[idx], 'loaded', true);
        this.aspectRatio(idx);
      },
      /**
       * Adjusts the dimensions of the slides basing on the 'mode' defined for the item.
       * @method aspectRatio
       * @param {Number} idx 
       */
      aspectRatio(idx){
        this.$nextTick(()=>{
          let cont = this.getRef('slideContainer'),
              ctnRatio = cont.offsetWidth/cont.offsetHeight,
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
            else if( mode === 'full' ){
              this.$set(this.items[idx], 'imageWidth', '100%');
              this.$set(this.items[idx], 'imageHeight', 'auto');
              this.$set(this.items[idx], 'showImg', true);
              //this.items[idx].imageWidth = "100%";
              //this.items[idx].imageHeight = "auto";
              //this.items[idx].showImg = true;
            }
          }
          else if ( imgRatio <= ctnRatio ){
            if ( mode === 'zoom' ){
              this.$set(this.items[idx], 'imageWidth', '100%');
              this.$set(this.items[idx], 'imageHeight', 'auto');
              this.$set(this.items[idx], 'showImg', true);

              //this.items[idx].imageWidth = "100%";
              //this.items[idx].imageHeight = "auto";
              //this.items[idx].showImg =  true;
            }
            else if ( mode === 'full' ){
              this.$set(this.items[idx], 'imageWidth', 'auto');
              this.$set(this.items[idx], 'imageHeight', '100%');
              this.$set(this.items[idx], 'showImg', true);
              //this.items[idx].imageWidth = "auto";
              //this.items[idx].imageHeight = "100%";
              //this.items[idx].showImg =  true;
            }
          }
          if ( mode === 'stretch' ){
            this.$set(this.items[idx], 'imageWidth',  cont.offsetWidth + 'px');
            this.$set(this.items[idx], 'imageHeight', cont.offsetHeight + 'px');
            this.$set(this.items[idx], 'showImg', true);

            //this.items[idx].imageWidth = this.lastKnownCtWidth + 'px';
            //this.items[idx].imageHeight = this.lastKnownCtHeight + 'px';
            //this.items[idx].showImg =  true;
          }
          if ( mode === "original" ){
            this.$set(this.items[idx], 'showImg', true);
            //this.items[idx].showImg = true;
          }
          if (cont.offsetWidth) {
            this.$set(this.items[idx], 'imageMaxWidth', cont.offsetWidth + 'px');
          }
          if (cont.offsetHeight) {
            this.$set(this.items[idx], 'imageMaxHeight', cont.offsetHeight + 'px');
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
          st += '.bbn-slideshow .slideswitch:target ~ .bbn-slideshow-slide#' + (this.name + i.toString()) + ' .bbn-slideshow-content{opacity: 0}';
          st += '.bbn-slideshow .slideswitch[id="' + this.name + i.toString() + '"]:target ~ .bbn-slideshow-slide#' + this.name + i.toString() + ' .bbn-slideshow-navigation {display: block !important;}';
          st += '.bbn-slideshow .slideswitch[id="' + this.name + i.toString() + '"]:target ~ .bbn-slideshow-slide#' + this.name + i.toString() + ' .bbn-slideshow-content {animation-name: bbn-slideshow-effect-fade_in; animation-duration: 0.5s;}';
          if ( it.animation ){
            st += '.bbn-slideshow .slideswitch[id="' + this.name + i.toString() + '"]:target ~ #' + this.name + i.toString() + ' .bbn-slideshow-effect-' + it.animation + ' {animation-name: bbn-slideshow-effect-' + it.animation + ' !important;animation-duration: ' + (it.duration || this.duration || '0.5') + 's;' + ( it.animation === 'flip' ? 'backface-visibility: hidden;' : '')+ '}';
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
        let idx = this.currentIndex,
            isFirst = idx === 0;
        if (isFirst && !this.loop) {
          return;
        }
        if (!isFirst || this.loop) {
          let nextIdx = isFirst ? (this.items.length - 1) : (idx - 1);
          if (!this.items[nextIdx].animation) {
            let slide = this.getRef('slide' + nextIdx);
            if (slide) {
              slide.style.animationName = 'bbn-slideshow-effect-slide_from_right';
            }
          }
          this.currentIndex = nextIdx;
          this.$nextTick(() => {
            setTimeout(() => {
              let slide2 = this.getRef('slide' + nextIdx);
              if (!this.items[nextIdx].animation && !!slide2) {
                slide2.style.animationName = '';
              }
            }, 500);
          });
        }
        if (this.autoPlay) {
          this.stopAutoPlay();
          this.$nextTick(() => {
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
        if (this.summary){
          idx--;
        }
        let isLast = idx === (this.items.length - 1);
        if (isLast && !this.loop) {
          return;
        }
        if (!isLast || this.loop) {
          let nextIdx = isLast ? 0 : (idx + 1);
          if (!this.items[nextIdx].animation) {
            let slide = this.getRef('slide' + nextIdx);
            if (slide) {
              slide.style.animationName = 'bbn-slideshow-effect-slide_from_left';
            }
          }
          this.currentIndex = nextIdx;
          this.$nextTick(() => {
            setTimeout(() => {
              let slide2 = this.getRef('slide' + nextIdx);
              if (!this.items[nextIdx].animation && !!slide2) {
                slide2.style.animationName = '';
              }
            }, 500)
          });
        }
        if (this.autoPlay) {
          this.stopAutoPlay();
          this.$nextTick(() => {
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
      },
      updateData(){
        let src = [];
        if (bbn.fn.isString(this.source) && this.separator) {
          // Slide between each separator (check help in app-ui)
          src = this.source.split(this.separator).map(a =>{
            return {
              content: a,
              type: 'text'
            };
          });
        }
        else if (bbn.fn.isFunction(this.source)) {
          src = this.source();
        }
        else if (bbn.fn.isArray(this.source)) {
          if (this.checkbox) {
            if (this.separator) {
              this.source.forEach((v, i) =>{
                v.content.split(this.separator).forEach((a, k) =>{
                  let o = {
                    type: 'text',
                    content: a,
                    id: v.id
                  };
                  if (k === 0) {
                    o.checkable = true;
                  }
                  src.push(o);
                });
                if (this.valuesCB[i] === undefined) {
                  this.valuesCB[i] = false;
                }
              });
            }
          }
          else {
            src = bbn.fn.extend(true, [], this.source).map(val => {
              if (bbn.fn.isString(val)) {
                val = {
                  type: this.gallery ? 'img' : 'text',
                  content: val
                };
              }
              if ( val.type === 'img' ){
                bbn.fn.extend(val, {
                  imageWidth: 0,
                  imageHeight: 0,
                  imageLeftMargin: 0,
                  imageTopMargin: 0,
                  showImg: false
                });
              }
              if (bbn.fn.isObject(val) && (!val.type || ((val.type !== 'img') && (val.type !== 'text')))) {
                val.type = 'text';
              }
              return bbn.fn.isObject(val) ? val : {};
            });
          }
        }
        this.items.splice(0, this.items.length, ...src);
        if (!this.loaded) {
          this.loaded = true;
        }
      }
    },
    /**
     * @event mounted
     * @fires createStyle
     * @fires startAutoPlay
     */
    mounted(){
      this.updateData();
      this.$nextTick(() => {
        this.currentIndex = this.initialSlide > this.items.length ? 0 : this.initialSlide;
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
        this.ready = true;
        this.$nextTick(() => {
          this.createStyle();
          if (this.autoPlay) {
            this.startAutoPlay();
          }
          if (bbn.fn.isObject(this.arrows)) {
            if (this.arrows.left && this.arrows.left.length) {
              this.arrowClass.left = this.arrows.left
            }
            if (this.arrows.right && this.arrows.right.length) {
              this.arrowClass.right = this.arrows.right
            }
          }
          this.onResize();
        })
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
        let miniatures = this.getRef('miniatures');
        if ( miniatures ){
          let scroll = miniatures.getRef('scroll');
          if (scroll) {
            let xScroller = scroll.getRef('xScroller');
            if (xScroller) {
              xScroller.scrollTo(miniatures.$refs.items[val]);
            }
          }
        }
        this.$emit('changeSlide', val);
      },
      source: {
        deep: true,
        handler(){
          this.updateData();
        }
      }
    },
    components: {
      /**
       * @component miniature
       */
      miniature: {
        template: `
          <bbn-scroll axis="x"
                      ref="scroll"
                      @ready="init">
            <div class="bbn-w-100 bbn-middle">
              <template  v-for="(it, i) in items">
                <i v-if="type === 'circle'"
                    @click= "clickMiniature(it , i)"
                    :class="[
                      (mainComponent.currentIndex === i ? 'nf nf-fa-dot_circle_o' : 'nf nf-fa-circle'),
                      'bbn-padded',
                      'bbn-slideshow-circleMiniature',
                      'bbn-p',
                      {'bbn-primary-text-alt': mainComponent.currentIndex === i}
                    ]"
                    ref="items"
                ></i>
                <div v-else
                     @click= "clickMiniature(it , i)"
                     :class="['bbn-slideshow-zoom', 'bbn-bordered-internal', {
                       'bbn-primary-border': mainComponent.currentIndex === i,
                       'bbn-right-xsspace': !!items[i+1]
                     }]"
                     :style="{
                       'border-width': (mainComponent.currentIndex === i) ? 'medium' : '',
                       width: dimension,
                       height: dimension,
                       minWidth: minimumPreview,
                       minHeight: minimumPreview,
                     }"
                     ref="items"
                >
                  <div v-if="it.type === 'text'"
                      v-html="it.content"
                      class="bbn-slideshow-content"
                  ></div>
                  <img v-else-if="it.type === 'img'"
                      :src="getImgSrc(it.content)"
                      :alt="it.caption || it.text || ''"
                      width="100%"
                      height="100%"
                  >
                </div>
              </template>
            </div>
          </bbn-scroll>`,
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
           type: String,
         },
         minimumPreview: {
           type: String,
         }
       },
        data(){
         return {
           /**
            * The parent component bbn-slideshow
            * @data {Object} mainComponent
            */
           mainComponent: this.closest('bbn-slideshow')

         }
       },
        methods:{
          /**
           * @method clickMiniature
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
          },
          /**
           * @method getImgSrc
           * @param {Strng} content
           * @memberof miniature
           * @return {String}
           */
          getImgSrc(content){
            return content.match(/data\:image\/[a-zA-Z]*\;base64/)
              ? content
              : `${content}${content.indexOf('?') > -1 ? '&' : '?'}w=${this.dimension.match(/\d+/)}&thumb=1`;
          },
          init(){
            const elem = this.$el.querySelector('div.bbn-slideshow-zoom div.bbn-slideshow-content');
            if ( elem ){
              elem.style.transform = 'scale(0.2)';
              if ( elem.querySelector('img') ){
                elem.querySelector('img').style.transform = 'scale(0.1)';
              }
            }
          }
        },
      }
    }
  };
