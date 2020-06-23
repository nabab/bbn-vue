((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="componentClass"
      :style="barStyle"
      v-if="isVisible"
      @click="jump($event)"
      @dblclick="jump($event, true)"
      @mouseenter="inSlider"
      @mouseleave="outSlider"
>
  <div :class="{
        'bbn-scroll-slider': true,
        'bbn-primary': true,
        'bbn-scroll-not-dragged': !dragging
  }"
        :style="sliderStyle"
        ref="scrollSlider"
        @touchstart="startDrag"
        @mousedown="startDrag">
  </div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-scrollbar');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('style');
css.innerHTML = `.bbn-scrollbar {
  position: absolute;
  -webkit-transition: opacity 500ms ease-in-out;
  -moz-transition: opacity 500ms ease-in-out;
  transition: opacity 500ms ease-in-out;
}
.bbn-scrollbar.vertical {
  width: 0.7em;
  padding: 0 0.2em 0 0.7em;
  bottom: 0;
  top: 0;
  right: 0;
}
.bbn-scrollbar.vertical .bbn-scroll-slider {
  width: 0.7em;
  height: 100%;
  right: 0.2em;
  min-height: 20px;
}
.bbn-scrollbar.vertical .bbn-scroll-slider.bbn-scroll-not-dragged {
  transition: top 100ms;
}
.bbn-scrollbar.horizontal {
  height: 0.7em;
  padding: 0.7em 0 0.2em 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.bbn-scrollbar.horizontal .bbn-scroll-slider {
  height: 0.7em;
  width: 100%;
  bottom: 0.2em;
  min-width: 20px;
}
.bbn-scrollbar.horizontal .bbn-scroll-slider.bbn-scroll-not-dragged {
  transition: left 100ms;
}
.bbn-scrollbar .bbn-scroll-slider {
  opacity: 0.6;
  border-radius: 0.3em;
  position: absolute;
}
`;
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-scrollbar component
 *
 * @description bbn-scroolbar represents the scroll bar of the content 'it is used by the bbn-scroll component appearing in case of passing of the mouse pointer
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 10/07/2017
 */
(function(bbn, Vue){
  "use strict";

  Vue.component('bbn-scrollbar', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.keepCoolComponent 
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.keepCoolComponent],
    props: {
      /**
       * The orientation of the scrollbar (required).
       * @prop {String} orientation
       */
      orientation: {
        required: true,
        type: String
      },
      /**
       * The instance of bbn-scroll.
       * @prop {Vue} scroller  
       */
      scroller: {
        type: Vue,
        default(){
          return this.$parent.$options._componentTag === 'bbn-scroll' ? this.$parent : null;
        }
      },
      /**
       * The rail.
       * @prop {HTMLElement} container
       */
      container: {
        type: HTMLElement
      },
      /**
       * Says if the scrollbar is shown, hidden, or shown when needed (auto).
       * @prop {String|Boolean} ['auto'] hidden
       */
      hidden: {
        type: [String, Boolean],
        default: 'auto'
      },
      /**
       * 
       * @prop {Number} [2] tolerance
       */
      tolerance: {
        type: Number,
        default: 2
      },
      /**
       * @prop {Number} [0] scrolling
       */
      scrolling: {
        type: Number,
        default: 0
      },
      /**
       * @prop {HTMLElement|Array|Function} [[]] scrollAlso
       */
      scrollAlso: {
        type: [HTMLElement, Array, Function],
        default(){
          return [];
        }
      },
      /**
       * @prop [Number|Object] [0] initial 
       */
      initial: {
        type: [Number, Object],
        default: 0
      },
      /**
       * The color of the scrollbar.
       * @prop {String} color
       */
      color: {
        type: String
      }
    },
    data() {
      return {
        /**
         * The container of the scrollbar or the ref scrol.
         * @data {Vue} realContainer 
         */
        realContainer: this.container ?
          this.container :
          (this.scroller ? this.scroller.getRef('scrollContainer') : false),
        /**
         * The container's size.
         * @data {Number} [0] containerSize 
         */  
        containerSize: 0,
        /**
         * The content size.
         * @data {Number} [0] contentSize 
         */  
        contentSize: 0,
        /**
         * The container posiion.
         * @data {Number} [0] containerPos 
         */  
        containerPos: 0,
        /**
         * The slider position.
         * @data {Number} [0] sliderPos 
         */  
        sliderPos: 0,
        /**
         * @data {Boolean} [false] dragging 
         */  
        dragging: false,
        /**
         * The size.
         * @data {Number} [100] size
         */
        size: 100,
        /**
         * The start.
         * @data {Number} [0] start
         */
        start: 0,
        /**
         * The position.
         * @data {Number} [0] position
         */
        position: this.scrolling,
        /**
         * @data {Number} [0] currentScroll
         * 
         */
        currentScroll: 0,
        /**
         * The move timeout.
         * @data {Number} [0] moveTimeout
         * 
         */
        moveTimeout: 0,
        /**
         * True if the scrollbar is shown.
         * @data {Boolean} show
         */
        show: this.hidden === 'auto' ? false : !this.hidden,
        /**
         * @data {Number|Object} scroll
         */
        scroll: this.initial,
        /**
         * @data {Boolean} [false] isReaching
         */
        isReaching: false,
        /**
         * @data {Boolean} [false] isActive
         */
        isActive: false
      };
    },
    computed: {
      /**
       * @computed showBother
       * @returns Boolean
       */
      shouldBother(){
        return this.contentSize > this.containerSize;
      },
      /**
       * @computed ratio
       * @returns {Number}
       */
      ratio(){
        if ( this.shouldBother ){
          return this.containerSize / this.contentSize;
        }
        return 1;
      },
      /**
       * @computed sliderSize
       * @return {Number}
       */
      sliderSize(){
        if ( this.shouldBother ){
          return Math.round(this.containerSize * this.ratio);
        }
        return 0;
      },
      /**
       * @computed maxSliderPos
       * @return {Number}
       */
      maxSliderPos(){
        return this.shouldBother ? this.containerSize - this.sliderSize : 0;
      },
      /**
       * @computed barStyle
       * @returns {Object}
       */
      barStyle(){
        let res = {};
        res.opacity = this.show && this.shouldBother ? 1 : 0;
        /*
        if ( this.shouldBother ){
          res[this.isVertical ? 'height' : 'width'] = this.containerSize + 'px';
        }
        */
        return res;
      },
      /**
       * @computed sliderStyle
       * @returns {Object}
       */
      sliderStyle(){
        let res = {};
        if ( this.shouldBother ){
          res[this.isVertical ? 'height' : 'width'] = this.sliderSize + 'px';
          res[this.isVertical ? 'top' : 'left'] = this.sliderPos + 'px';
          if ( this.color ){
            res.backgroundColor = this.color;
          }
        }
        return res;
      },
      /**
       * @computed isVertical
       * @returns {Boolean}
       */
      isVertical(){
        return this.orientation !== 'horizontal';
      },
      /**
       * @computed realSize
       * @returns {Number}
       */
      realSize(){
        return this.containerSize ? this.containerSize / 100 * this.size : 0;
      },
      /**
       * @computed isVisible
       * @returns {Boolean}
       */
      isVisible(){
        return (this.hidden !== true) && ((this.scroller && this.scroller.isFocused) && this.isActive || this.isActive);
      },
    },
    methods: {
      /**
       * @method startDrag
       * @param {Event} e
       */
      startDrag(e) {
        if ( this.realContainer ){
          e.preventDefault();
          e.stopPropagation();
          e = e.changedTouches ? e.changedTouches[0] : e;
          this.dragging = true;
          // Start in pixels
          this.start = this.isVertical ? e.pageY : e.pageX;
        }
      },
      /**
       * @method onDrag
       * @param {Event} e
       */
      onDrag(e) {
        if ( this.realContainer && this.dragging && this.containerSize ){
          this.keepCool(() => {
            e = e.changedTouches ? e.changedTouches[0] : e;
            // Movement in pixel
            let newStart = this.isVertical ? e.pageY : e.pageX;
            let movement = newStart - this.start;
            if ( movement ){
              let tmp = this.sliderPos + movement;
              if (tmp < 0) {
                tmp = 0;
              }
              else if (tmp > (this.containerSize - this.sliderSize)) {
                tmp = this.containerSize - this.sliderSize;
              }
              if (this.sliderPos !== tmp) {
                this.sliderPos = tmp;
                this.adjustFromBar();
              }
            }
            this.start = newStart;
          })
        }
      },
      /**
       * @method stopDrag
       */
      stopDrag() {
        this.dragging = false;
      },
      /**
       * @method adjustFromContainer
       * @param {Vue} container 
       */
      adjustFromContainer(container){
        if (this.shouldBother && !this.dragging) {
          let prop = this.isVertical ? 'scrollTop' : 'scrollLeft';
          let ok = false;
          if (!container) {
            container = this.realContainer;
            if (this.scroller) {
              this.containerPos = this.scroller['current' + (this.isVertical ? 'Y' : 'X')];
              ok = true;
            }
          }
          if (!ok) {
            this.containerPos = container[prop];
          }
          this.sliderPos = this.containerPos * this.ratio;
          /*
          if ( container !== this.realContainer ){
            this.realContainer[prop] = this.containerPos;
          }
          */
          bbn.fn.each(this.scrollableElements(), (a) => {
            if ( a !== container ){
              a[prop] = this.containerPos;
            }
          });
          this.overContent();
        }
      },
      /**
       * @method adjustFromBar
       */
      adjustFromBar(){
        if ( this.shouldBother ){
          this.containerPos = this.sliderPos / this.ratio;
          let prop = this.isVertical ? 'scrollTop' : 'scrollLeft';
          this.realContainer[prop] = this.containerPos;
          bbn.fn.each(this.scrollableElements(), (a) => {
            a[prop] = this.containerPos;
          });
          let e = new Event('scroll');
          this.$emit('scroll' + (this.isVertical ? 'y' : 'x'), e, this.containerPos);
        }
      },


      /**
       * When the users jumps by clicking the scrollbar while a double click will activate tillEnd.
       * @method jump
       * @param {Event} e
       * @param {Boolean} precise
       */
      jump(e, precise) {
        if ( this.realContainer ){
          let isRail = e.target === this.$el;
          if ( isRail ){
            let position = this.$refs.scrollSlider.getBoundingClientRect();
            // Calculate the Movement
            let clickPoint = this.isVertical ? e.pageY : e.pageX;
            let isBefore = clickPoint < position[this.isVertical ? 'top' : 'left'];
            let isAfter = clickPoint > position[this.isVertical ? 'bottom' : 'right'];
            if ( isBefore || isAfter ){
              let movement = isBefore ? - (
                      position[this.isVertical ? 'top' : 'left'] - clickPoint) :
                      clickPoint - (position[this.isVertical ? 'top' : 'left']) - (position[this.isVertical ? 'height' : 'width']);
              if ( !precise ){
                if ( isBefore ){
                  this.scrollBefore();
                }
                else{
                  this.scrollAfter();
                }
              }
              else{
                let newPos = this.sliderPos + movement;
                if ( newPos < 0 ){
                  newPos = 0;
                }
                else if ( newPos > this.maxSliderPos ){
                  newPos = this.maxSliderPos;
                }
                this.sliderPos = newPos;
                this.adjustFromBar();
              }
            }
          }
        }
      },

      /**
       * @method scrollLevel
       * @param {Boolean} before 
       */
      scrollLevel(before){
        if ( this.sliderSize ){
          let movement = Math.round(this.sliderSize - (this.sliderSize * 0.1));
          if ( before ){
            movement = -movement;
          }
          let newPos = this.sliderPos + movement;
          if ( newPos < 0 ){
            newPos = 0;
          }
          else if ( newPos > this.maxSliderPos ){
            newPos = this.maxSliderPos;
          }
          if ( this.sliderPos !== newPos ){
            this.sliderPos = newPos;
            this.adjustFromBar();
          }
        }
      },
      /**
       * @method scrollBefore
       * @fires scrollLevel
       */
      scrollBefore(){
        return this.scrollLevel(true);
      },
      
      /**
       * @method scrollAfter
       * @fires scrollLevel
       */
      scrollAfter(){
        return this.scrollLevel();
      },

      /**
       * Gets the array of scrollable elements according to scrollAlso attribute.
       * @method scrollableElements
       * @returns {Array}
       */
      scrollableElements(){
        let tmp = this.scrollAlso;
        if (bbn.fn.isFunction(tmp) ){
          tmp = tmp();
        }
        else if ( !Array.isArray(tmp) ){
          tmp = [tmp];
        }
        let res = [];
        if ( bbn.fn.isArray(tmp) ){
          bbn.fn.each(tmp, (a) => {
            if ( a ){
              res.push(a)
            }
          })
        }
        return res;
      },

      /**
       * Calculates all the proportions based on content.
       * @method onResize
       */
      onResize(){
        if ( this.realContainer ){
          let tmp1,
              tmp2;
          if (this.scroller) {
            tmp1 = this.scroller[this.isVertical ? 'containerHeight' : 'containerWidth'];
            tmp2 = this.scroller[this.isVertical ? 'contentHeight' : 'contentWidth'];
          }
          else {
            tmp1 = this.isVertical ? this.realContainer.clientHeight : this.realContainer.clientWidth;
            tmp2 = this.realContainer[this.isVertical ? 'scrollHeight' : 'scrollWidth'] || tmp1;
          }
          if ( tmp1 < 20 ){
            this.containerSize = 0;
            this.contentSize = 0;
            this.size = 0;
            this.isActive = false;
            return;
          }
          if ( (tmp1 !== this.containerSize) || (tmp2 !== this.contentSize) ){
            this.containerSize = tmp1 || 0;
            this.contentSize = tmp2 || 0;
          }
          this.isActive = this.contentSize > this.containerSize + 2;
        }
        else{
          this.isActive = false;
          this.initContainer();
          if (this.realContainer) {
            this.onResize();
          }
        }
      },

      /**
       * Sets all event listeners.
       * @method initContainer
       */
      initContainer(){
        if ( !this.realContainer && this.scroller ){
          this.realContainer = this.scroller.getRef('scrollContainer');
        }
        if ( this.realContainer && !this.isInit ){
          this.onResize();
          if ( !this.container && this.scroller ){
            this.scroller.$on("resize", this.onResize);
            this.scrollTo(this.initial);
            this.scroller.$on("scroll", () => {
              this.adjustFromContainer()
            });
            this.scroller.$on("mousemove", this.overContent);
          }
          else{
            this.realContainer.addEventListener("mousemove", this.overContent);
            this.realContainer.addEventListener('scroll', () => {
              this.adjustFromContainer();
            }, {passive: true});
          }
          bbn.fn.each(this.scrollableElements(), (a) => {
            a.addEventListener('scroll', () => {
              this.adjustFromContainer(a);
            }, {passive: true});
            a.addEventListener('scroll', this.overContent)
          });
        }
      },

      /**
       * When the mouse is over the content.
       * @method overContent
       */
      overContent(){
        this.keepCool(() => {
          clearTimeout(this.moveTimeout);
          if ( !this.show ){
            this.show = true;
          }
          this.moveTimeout = setTimeout(() => {
            this.hideSlider();
          }, 500);
        }, 'overContent')
      },

      /**
       * When the mouse enters over the slider.
       * @method inSlider
       */
      inSlider(){
        if ( !this.isOverSlider && !this.dragging){
          this.isOverSlider = true;
          this.showSlider();
        }
      },

      /**
       * When the mouse leaves the slider.
       * @method outSlider
       * @fires overContent
       */
      outSlider(){
        if ( !this.isOverSlider && !this.dragging){
          this.isOverSlider = false;
          this.overContent();
        }
      },
      /**
       * @method showSlider
       */
      showSlider() {
        clearTimeout(this.moveTimeout);
        if ( !this.show ){
          this.show = true;
        }
      },
      /**
       * @method hideSlider
       */
      hideSlider() {
        if ( !this.dragging && this.show ){
          this.show = false;
        }
      },
      /**
       * Animates the bar.
       * @method animateBar
       */
      animateBar(){
        return;
        if ( this.$refs.scrollSlider ){
          //this.dragging = true;
          let anim = {};
          if ( this.isVertical ){
            anim.height = this.size + '%';
            anim.top = this.position + '%';
          }
          else{
            anim.width = this.size + '%';
            anim.left = this.position + '%';
          }
        }
      },
      /**
       * Scrolls to the given position using the given animation.
       * @method scrollTo
       * @fires adjustFromContainer
       */
      scrollTo(val) {
        if (this.shouldBother) {
          let num = 0;
          let ele = false;
          if (bbn.fn.isVue(val) && val.$el) {
            ele = val.$el;
          }
          else if (bbn.fn.isDom(val)){
            ele = val;
          }
          if (ele) {
            let container = ele.offsetParent;
            // The position is equal to the offset of the target
            // minus the size of the viewport, which isn't scrolled,
            // plus half the size of the viewport to center it
            // therefore removing half of the viewport does the trick
            num = ele[this.isVertical ? 'offsetTop' : 'offsetLeft']
                  - Math.round(this.containerSize/2);
            while (container && (container !== this.scroller.$el)) {
              if (container.contains(this.scroller.$el)) {
                break;
              }
              else{
                num += container[this.isVertical ? 'offsetTop' : 'offsetLeft'];
                container = container.offsetParent;
              }
            }
          }
          else if ( bbn.fn.isPercent(val) ){
            num = Math.round(parseFloat(val) * this.contentSize / 100);
          }
          else if (bbn.fn.isNumber(val)) {
            num = val;
          }
          if ( num !== null ){
            if ( num < 0 ){
              num = 0;
            }
            else if (num > (this.contentSize - this.containerSize)) {
              num = this.contentSize - this.containerSize;
            }
            this.realContainer['scroll' + (this.isVertical ? 'Top' : 'Left')] = num;
            this.containerPos = num;
            this.sliderPos = this.containerPos * this.ratio;
          }
        }
      },
      /**
       * Moves the scrollbar to the position 0.
       * @method scrollStart
       * @fires scrollTo
       */
      scrollStart(){
        this.scrollTo(0);
      },
       /**
       * Moves the scrollbar to the end position.
       * @method scrollEnd
       * @fires scrollTo
       */
      scrollEnd(){
        this.scrollTo(this.maxSliderPos);
      }
    },
    watch: {
      /**
       * @watch container
       * @fires initContainer
       */
      container(){
        this.initContainer();
      },
      /**
       * 
       * @watch show
       * @fires onResize
       */
      show(v){
        if (v) {
          this.onResize();
        }
      },
      /**
       * @watch sliderPos
       * @fires showSlider
       */
      sliderPos(){
        this.showSlider();
      },
      dragging(v) {
        if (this.scroller) {
          this.scroller.isDragging = v
        }
      }
    },
    /**
     * Adds the css class for the orientation of the scrollbar.
     * @event created
     */
    created(){
      this.componentClass.push(this.orientation);
    },
    /**
     * Adds the events listener and launch the resize of the scrollbar.
     * @event mounted
     */
    mounted() {
      this.initContainer();
      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("touchmove", this.onDrag);
      document.addEventListener("mouseup", this.stopDrag);
      document.addEventListener("touchend", this.stopDrag);
      this.onResize();
    },
    /**
     * Removes the events listener.
     * @event beforeDestroy
     */
    beforeDestroy() {
      if ( this.realContainer && this.isInit ){
        if ( !this.container && this.scroller ){
          this.scroller.$off("resize", this.onResize);
          this.scroller.$off("scroll", this.adjust);
          this.scroller.$off("mousemove", this.overContent);
        }
        else{
          this.realContainer.removeEventListener('scroll', this.adjust, {passive: true});
          this.realContainer.removeEventListener('mousemove', this.overContent, {passive: true});
        }
        bbn.fn.each(this.scrollableElements(), (a) => {
          a.removeEventListener('scroll', this.adjust, {passive: true});
          a.removeEventListener('mousemove', this.overContent, {passive: true});
        });
      }
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("touchmove", this.onDrag);
      document.removeEventListener("mouseup", this.stopDrag);
      document.removeEventListener("touchend", this.stopDrag);
    },
  });

})(window.bbn, window.Vue);

})(bbn);