((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-middle', {'bbn-w-100': !fullSlide, 'bbn-overlay': fullSlide}]">
  <div v-if="ready" :class="{'bbn-w-100': !fullSlide, 'bbn-overlay': fullSlide, 'bbn-padded' : !fullSlide}">
    <!-- position aboslute -->
    <div class="bbn-l bbn-slideshow-count bbn-abs" v-if="showCount">
      <span class="bbn-xl" v-text="(currentIndex+1) + '/' + items.length" />
    </div>

    <div class="bbn-100 bbn-flex-width">
      <div v-if="summary && items.length" class="first bbn-flex-fill bbn-slide"
        :style="{display: currentIndex === 0 ? 'block' : 'none'}">
        <h2 v-text="_('Summary')"></h2>
        <ol class="bbn-l bbn-lg">
          <li v-for="(it, i) in items">
            <a href="javascript:;" @click="currentIndex = i+1" v-text="it.title ? it.title : _('Untitled')" />
          </li>
        </ol>
      </div>

      <div class="bbn-flex-fill bbn-iflex-height">
        <div class="bbn-flex-fill">
          <div :class="[{'bbn-w-100': !fullSlide, 'bbn-overlay': fullSlide}, 'bbn-flex-width']">
            <!--Left arrow-->
            <div v-if="arrows" class="bbn-middle bbn-padded bbn-slideshow-arrow-left"
              @mouseover="arrowsPreview('prev', true)" @mouseleave="arrowsPreview('prev', false)">
              <i v-show="showArrowLeft" :class="[arrowClass.left, 'bbn-p', 'bbn-xxxl']" @click="prev"
                :style="{visibility: (currentIndex === 0 && !loop)? 'hidden' : 'visible'}" />
            </div>
            <div class="bbn-flex-fill">
              <div :class="{'bbn-w-100': !fullSlide, 'bbn-overlay': fullSlide}" ref="slideContainer">
                <!-- Items-->
                <div v-for="(it, i) in items" :class="[
                      'bbn-w-100',
                      'bbn-slideshow-slide',
                      'sliden' + (summary ? i + 1 : i).toString(),
                      !summary && (i === 0) ? 'first' : '',
                      items[i].class ? items[i].class : ''
                    ]" :id="name + (summary ? i : i + 1).toString()"
                  :style="{display: currentIndex === (summary ? i + 1 : i) ? 'block' : 'none'}">
                  <div v-if="it.type === 'text'" :ref="'slide' + i.toString()" :class="[
                         'bbn-slideshow-content',
                         (it.animation ? 'bbn-slideshow-effect-' + it.animation : ''),
                         it.cls || '',
                         'bbn-middle',
                         'bbn-m'
                       ]">
                    <component v-if="it.component" :is="it.component" :data="it.data || {}" v-bind="it.attributes"
                      :key="i" />
                    <component v-else-if="component" :is="component" :content="it.content || ''"
                      :data="it.data || {}" />
                    <div v-else-if="it.content" :ref="'slide' + i.toString()"
                      :class="[(it.animation ? 'bbn-slideshow-effect-' + it.animation : ''), 'bbn-w-100']">
                      <bbn-scroll v-if="scroll">
                        <div v-html="it.content" />
                      </bbn-scroll>
                      <div v-else v-html="it.content" />
                    </div>
                  </div>
                  <!--only image-->
                  <div v-else-if="it.type === 'img'" :ref="'slide' + i.toString()"
                    :class="[(it.animation ? 'bbn-slideshow-effect-' + it.animation : ''), {'bbn-w-100': !fullSlide, 'bbn-overlay': fullSlide}, 'bbn-middle']">
                    <div :class="[{'bbn-w-100': !fullSlide, 'bbn-overlay': fullSlide}, 'bbn-middle']">
                      <img :src="it.content" :ref="'slide-img'+ i.toString()" @load="afterLoad(i)"
                        :class="[
                            'img' + i.toString(), 
                            'bbn-unselectable',
                            {'slide-preview-img': preview === true}
                            ]" 
                        :style="{
                            marginLeft: it.imageLeftMargin || 0,
                            marginTop: it.imageTopMargin || 0,
                            visibility: it.showImg ? 'visible' : 'hidden',
                            maxWidth: '100%',
                            maxHeight: '100vh',
                            width: it.imageWidth || 'auto',
                            height: it.imageHeight || 'auto'
                          }">
                    </div>
                  </div>
                  <bbn-checkbox v-if="checkbox && it.checkable" v-model="valuesCB[i]" :value="true" :novalue="false"
                    :strict="true" :label="(typeof checkbox === 'string') ? checkbox : defaultTextCB"
                    class="bbn-slideshow-showagain" />
                </div>
              </div>
              <div v-if="ctrl" class="bbn-w-100 bbn-middle">
                <!-- Commands-->
                <div class="bbn-primary-text-alt bbn-slideshow-commands bbn-middle" @mouseover="ctrlPreview(true)"
                  @mouseleave="ctrlPreview(false)">
                  <i v-show="showCtrl" :class="[{
                        'nf nf-fa-pause': !!scrollInterval,
                        'nf nf-fa-play': !scrollInterval,
                      }, 'bbn-p', 'bbn-xxxl']" @click="scrollInterval ? stopAutoPlay() : startAutoPlay()" />
                </div>
              </div>
            </div>
            <!-- Right arrow-->
            <div v-if="arrows" class="bbn-middle bbn-padded bbn-slideshow-arrow-right"
              @mouseover="arrowsPreview('next', true)" @mouseleave="arrowsPreview('next', false)">
              <i v-show="showArrowRight" :class="[arrowClass.right, 'bbn-p', 'bbn-xxxl']" @click="next"
                :style="{visibility: (currentIndex >= items.length - 1) && !loop ? 'hidden' : 'visible'}" />
            </div>
          </div>
        </div>
        <div v-if="showInfo && items[currentIndex].info && items[currentIndex].info.length"
          class="bbn-middle bbn-padded bbn-slideshow-info" v-html="items[currentIndex].info" />
        <!-- Miniatures -->
        <div v-if=" [true, 'image', 'circle'].includes(preview)" :class="[
               'bbn-block',
               'bbn-middle',
               'bbns-gallery-miniature',
               'bbn-hsmargin',
               {'bbn-top-sspace': !showInfo || !items[currentIndex].info || !items[currentIndex].info.length}
             ]" 
             :style="{'min-height': typeof(dimensionPreview)=== 'Number' ? dimensionPreview + 'px': dimensionPreview}" 
             @mouseover="miniaturePreview(true)"
             @mouseleave="miniaturePreview(false)">
          <component v-show="showMiniature"
            :is="$options.components.miniature"
            :items="items"
            :type="preview"
            :dimension="typeof(dimensionPreview)=== 'Number' ? dimensionPreview + 'px': dimensionPreview"
            :minimumPreview="typeof(minimumPreview)=== 'Number' ? minimumPreview + 'px': minimumPreview"
            ref="miniatures" />
        </div>
      </div>
    </div>

    <!--old arrows-->
    <div v-if="items.length && !arrows && (preview === false) && navigation" class="bbn-slideshow-navigation">
      <div class="bbn-100">
        <a href="javascript:;" v-if="summary" :title="_('Summary')" @click="currentIndex = 0"
          :style="{visibility: currentIndex === 0 ? 'hidden' : 'visible'}" class="bbn-slideshow-summary">
          <i class="nf nf-fa-align_justify" />
        </a>
        <a href="javascript:;" @click="prev" :title="_('Previous')"
          :style="{visibility: currentIndex === 0 ? 'hidden' : 'visible'}" class="bbn-slideshow-prev">
          <i class="nf nf-fa-arrow_circle_left" />
        </a>
        <a href="javascript:;" @click="next" :title="_('Next')"
          :style="{visibility: currentIndex >= (summary ? items.length : items.length - 1) ? 'hidden' : 'visible'}"
          class="bbn-slideshow-next">
          <i class="nf nf-fa-arrow_circle_right" />
        </a>
      </div>
    </div>
  </div>
  <div v-else class="bbn-vmiddle">
    <bbn-loadicon class="bbn-vmiddle"
                  :size="24"/>
    <span class="bbn-xl bbn-b bbn-left-sspace"
          v-text="_('Loading') + '...'"/>
  </div>
  <div class="bbn-hidden" ref="slot">
    <slot></slot>
  </div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-slideshow');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

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
    mixins: 
    [
      bbn.vue.basicComponent,
      bbn.vue.resizerComponent
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
        type: [String, Object, Vue]
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
        default: '5vmin'
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
       * If the property content is given to the item, set to true insert the html content inside a scroll.
       * @prop {Boolean} [false] scroll
       */
      scroll: {
        type: Boolean,
        default: false
      },
      minimumPreview: {
        type: [String, Number],
        default: '50px'
      }
    },
    data(){
      let src = [],
          valuesCB = {},
          isAjax   = false;
      if (bbn.fn.isString(this.source)) {
        if (this.separator) {
          src = this.source.split(this.separator).map(a =>{
            return {
              content: a,
              type: 'text'
            };
          });
        }
        else{
          isAjax = true;
        }
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
              valuesCB[i] = false;
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
            if (bbn.fn.isObject(val) && (!val.type || ((val.type !== 'img') && (val.type !== 'text')))) {
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
        this.maxImgWidth = this.getRef('slideContainer').offsetWidth;
        this.maxImgHeight = this.getRef('slideContainer').offsetHeight;
      },
      /**
       * Sets the property loaded to true.
       * @method afterLoad
       * @param {Number} idx 
       * @fires aspectRatio
       */
      afterLoad(idx){
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
        let idx = this.currentIndex;
        if ( (idx > 0) && this.items[idx-1] ){
          if ( !this.items[idx-1].animation ){
            let slide = this.getRef('slide' + (idx-1).toString());
            if ( slide ){
              slide.style.animationName = 'bbn-slideshow-effect-slide_from_right';
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
              slide.style.animationName = 'bbn-slideshow-effect-slide_from_left';
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
      this.ready = true;
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
        this.onResize();
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
            * @data {Vue} mainComponent
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
              : `${content}${content.indexOf('?') > -1 ? '&' : '?'}w=${this.dimension}&thumb=1`;
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
  });
})();


})(bbn);