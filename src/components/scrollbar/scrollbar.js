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
    mixins: [bbn.vue.basicComponent, bbn.vue.keepCoolComponent],
    props: {
      orientation: {
        required: true,
        type: String
      },
      /* Must be an instance of bbn-scroll */
      scroller: {
        type: Vue,
        default(){
          let tmp = bbn.vue.closest(this, 'bbn-scroll');
          return tmp ? tmp : null;
        }
      },
      /**
       * The rail
       * @type {Object}
       */
      container: {
        type: HTMLElement
      },
      /**
       * Says if the scrollbar is shown, hidden, or shown when needed (auto)
       * @type {Object}
       */
      hidden: {
        type: [String, Boolean],
        default: 'auto'
      },
      /**
       * [tolerance description]
       * @type {Object}
       */
      tolerance: {
        type: Number,
        default: 2
      },
      scrolling: {
        type: Number,
        default: 0
      },
      scrollAlso: {
        type: [HTMLElement, Array, Function],
        default(){
          return [];
        }
      },
      initial: {
        type: [Number, Object],
        default: 0
      },
      color: {
        type: String
      }
    },
    data() {
      return {
        realContainer: this.container ?
          this.container :
          (this.scroller ? this.scroller.getRef('scrollContainer') : false),
        containerSize: 0,
        contentSize: 0,
        containerPos: 0,
        sliderPos: 0,
        dragging: false,
        size: 100,
        start: 0,
        position: this.scrolling,
        currentScroll: 0,
        moveTimeout: 0,
        show: this.hidden === 'auto' ? false : !this.hidden,
        scroll: this.initial,
        isReaching: false,
        isActive: false
      };
    },
    computed: {
      shouldBother(){
        return this.contentSize > this.containerSize;
      },
      ratio(){
        if ( this.shouldBother ){
          return this.containerSize / this.contentSize;
        }
        return 1;
      },
      sliderSize(){
        if ( this.shouldBother ){
          return Math.round(this.containerSize * this.ratio);
        }
        return 0;
      },
      maxSliderPos(){
        return this.shouldBother ? this.containerSize - this.sliderSize : 0;
      },
      barStyle(){
        let res = {};
        res.opacity = this.show && this.shouldBother ? 1 : 0;
        if ( this.shouldBother ){
          res[this.isVertical ? 'height' : 'width'] = this.containerSize + 'px';
        }
        return res;
      },
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
      isVertical(){
        return this.orientation !== 'horizontal';
      },
      realSize(){
        return this.containerSize ? this.containerSize / 100 * this.size : 0;
      },
      isVisible(){
        return (this.hidden !== true) && this.isActive;
      },
    },
    methods: {

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

      onDrag(e) {
        if ( this.realContainer && this.dragging && this.containerSize ){
          this.keepCool(() => {
            e = e.changedTouches ? e.changedTouches[0] : e;
            // Movement in pixel
            let newStart = this.isVertical ? e.pageY : e.pageX;
            let movement = newStart - this.start;
            if ( movement ){
              this.sliderPos += movement;
              this.adjustFromBar();
            }
            this.start = newStart;
          })
        }
      },

      stopDrag() {
        this.dragging = false;
      },

      adjustFromContainer(container){
        if ( this.shouldBother && container ){
          let prop = this.isVertical ? 'scrollTop' : 'scrollLeft';
          this.containerPos = container[prop];
          this.sliderPos = this.containerPos * this.ratio;
          if ( container !== this.realContainer ){
            this.realContainer[prop] = this.containerPos;
          }
          bbn.fn.each(this.scrollableElements(), (a) => {
            if ( a !== container ){
              a[prop] = this.containerPos;
            }
          });
          this.overContent();
        }
      },

      adjustFromBar(){
        if ( this.shouldBother ){
          this.containerPos = this.sliderPos / this.ratio;
          let prop = this.isVertical ? 'scrollTop' : 'scrollLeft';
          this.realContainer[prop] = this.containerPos;
          bbn.fn.each(this.scrollableElements(), (a) => {
            a[prop] = this.containerPos;
          });
          if ( this.scroller ){
            this.scroller.onScroll();
          }
          else{
            let e = new Event('scroll');
            this.$emit('scroll', e, this.containerPos);
          }
        }
      },


      /**
       * When the users jumps by clicking the scrollbar while a double click will activate tillEnd.
       **/
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

      scrollBefore(){
        return this.scrollLevel(true);
      },

      scrollAfter(){
        return this.scrollLevel();
      },

      // Gets the array of scrollable elements according to scrollAlso attribute
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

      // Calculates all the proportions based on content
      onResize(){
        //bbn.fn.log(this.scroller ? "CROLLE YES / " + this.scroller['container' + (this.isVertical ? 'Height' : 'Width')] : "NO SCROLLER");
        if ( this.realContainer ){
          let tmp1 = this.isVertical ? this.realContainer.clientHeight : this.realContainer.clientWidth,
              tmp2 = this.realContainer.children[0] ? this.realContainer.children[0][this.isVertical ? 'clientHeight' : 'clientWidth'] : this.containerSize;
          if ( tmp1 < 20 ){
            this.containerSize = 0;
            this.contentSize = 0;
            this.size = 0;
            return;
          }
          if ( (tmp1 !== this.containerSize) || (tmp2 !== this.contentSize) ){
            this.containerSize = tmp1 > 0 ? tmp1 : 0;
            this.contentSize = tmp2 > 0 ? tmp2 : 0;
            this.isActive = this.contentSize > this.containerSize + 2;
          }
        }
        else{
          this.initContainer();
        }
      },

      // Sets all event listeners
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
              this.adjustFromContainer(this.realContainer)
            });
            this.scroller.$on("mousemove", this.overContent);
          }
          else{
            this.realContainer.addEventListener("mousemove", this.overContent);
            this.realContainer.addEventListener('scroll', () => {
              this.adjustFromContainer(this.realContainer);
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

      // When the mouse is over the content
      overContent(){
        this.keepCool(() => {
          clearTimeout(this.moveTimeout);
          if ( !this.show ){
            this.show = true;
          }
          this.moveTimeout = setTimeout(() => {
            this.hideSlider();
          }, 100);
        }, 'overContent')
      },

      // When the mouse enters over the slider
      inSlider(){
        if ( !this.isOverSlider ){
          this.isOverSlider = true;
          this.showSlider();
        }
      },

      // When the mouse leaves the slider
      outSlider(){
        if ( this.isOverSlider ){
          this.isOverSlider = false;
          this.overContent();
        }
      },

      showSlider() {
        clearTimeout(this.moveTimeout);
        if ( !this.show ){
          this.show = true;
        }
      },

      hideSlider() {
        if ( !this.dragging && this.show ){
          this.show = false;
        }
      },

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
      scrollTo(val, animate){
        if ( this.shouldBother && (val >= 0) && (val <= this.maxSliderPos) ){
          this.sliderPos = val;
          this.adjustFromBar();
        }
      },

      scrollStart(){
        this.scrollTo(0);
      },

      scrollEnd(){
        this.scrollTo(this.maxSliderPos);
      }
    },
    watch: {
      container(){
        this.initContainer();
      },
      show(v){
        if (v) {
          this.onResize();
        }
      },
      sliderPos(){
        this.showSlider();
      }
    },
    created(){
      this.componentClass.push(this.orientation);
    },
    mounted() {
      this.initContainer();
      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("touchmove", this.onDrag);
      document.addEventListener("mouseup", this.stopDrag);
      document.addEventListener("touchend", this.stopDrag);
      this.onResize();
    },
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
