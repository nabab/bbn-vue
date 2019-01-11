/**
 * Created by BBN on 10/07/2017.
 */
(function($, bbn, Vue){
  "use strict";

  Vue.component('bbn-scrollbar', {
    mixins: [bbn.vue.basicComponent],
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
      }
    },
    data() {
      return {
        realContainer: this.container ?
          this.container :
          (this.scroller ? this.scroller.$refs.scrollContainer : false),
        containerSize: 0,
        contentSize: 0,
        dragging: false,
        size: 100,
        start: 0,
        position: this.scrolling,
        currentScroll: 0,
        moveTimeout: 0,
        show: this.hidden === 'auto' ? false : !this.hidden,
        scroll: this.initial
      };
    },
    computed: {
      style(){
        let res = {};
        if ( this.isVertical ){
          res.height = this.size + '%';
          res.top = this.position + '%';
        }
        else{
          res.width = this.size + '%';
          res.left = this.position + '%';
        }
        return res;
      },
      isVertical(){
        return this.orientation !== 'horizontal';
      },
      realSize(){
        return this.containerSize ? this.containerSize / 100 * this.size : 0;
      },
      _isVisible(){
        return this.realContainer &&
          this.containerSize &&
          (this.contentSize > (this.containerSize + bbn.fn.getScrollBarSize()))
      },

    },
    methods: {
      /**
       * {Sets the position}
       * @param  {[Number]}      next    The top position to set (in %)
       * @param  {[Boolean]}     animate
       * @param  {[Boolean]}     force   [Executes even if top is already to next]
       * @param  {[HTMLElement]} origin  [The element fgrom which the scroll originates]
       * @return {void}
       */
      _changePosition(next, animate, force, origin){
        let position = 0;
        if ( next > (100 - this.size) ){
          position = 100 - this.size;
        }
        else if ( (next > 0) ){
          position = next;
        }
        if ( force || (position !== this.position) ){
          this.scrollContainer(position, animate, origin);
        }
      },

      startDrag(e) {
        if ( this.realContainer ){
          e.preventDefault();
          e.stopPropagation();
          e = e.changedTouches ? e.changedTouches[0] : e;
          this.dragging = true;
          this.start = this.isVertical ? e.pageY : e.pageX;
        }
      },

      onDrag(e) {
        if ( this.realContainer && this.dragging && this.containerSize ){
          e.preventDefault();
          e.stopPropagation();
          e = e.changedTouches ? e.changedTouches[0] : e;
          let movement = (this.isVertical ? e.pageY : e.pageX) - this.start;
          let movementPercentage = movement ? Math.round(movement / this.containerSize * 1000000) / 10000 : 0;
          this.start = (this.isVertical ? e.pageY : e.pageX);
          if ( movementPercentage ){
            this._changePosition(this.position + movementPercentage);
          }
        }
      },

      stopDrag() {
        this.dragging = false;
      },

      /**
       * {Effectively change the scroll and bar position and sets variables}
       * @param  {[type]} top     [description]
       * @param  {[type]} animate [description]
       * @param  {[type]} origin  [description]
       * @return {[type]}         [description]
       */
      scrollContainer(position, animate, origin){
        if ( this.realContainer && this.contentSize ){
          this.currentScroll = position ? Math.round(this.contentSize * position / 100 * 10000) / 10000 : 0;
          let prop = this.isVertical ? 'scrollTop' : 'scrollLeft';
          let anim = {};
          anim[prop] = this.currentScroll;
          if ( animate ){
            $.each(this.scrollableElements(), (i, a) => {
              if (
                (a !== this.realContainer) &&
                (a !== origin) &&
                (a[prop] !== this.currentScroll)
              ){
                $(a).animate(anim, "fast");
              }
            });
            if ( (origin !== this.realContainer) && (this.realContainer[prop] !== this.currentScroll) ){
              $(this.realContainer).animate(anim, "fast", () => {
                this.position = position;
                this.normalize();
              });
            }
          }
          else {
            $.each(this.scrollableElements(), (i, a) => {
              if ( (a !== this.realContainer) && (a !== origin) && (a[prop] !== this.currentScroll) ){
                a[prop] = this.currentScroll;
              }
            });
            if ( (origin !== this.realContainer) && (this.realContainer.scrollTop !== this.currentScroll) ){
              this.realContainer[prop] = this.currentScroll;
            }
            this.position = position;
            this.normalize();
          }
        }
      },

      // When the users jumps by clicking the scrollbar
      jump(e) {
        if ( this.realContainer ){
          let isRail = e.target === this.$refs.scrollRail;
          if ( isRail ){
            let position = this.$refs.scrollSlider.getBoundingClientRect();
            // Calculate the horizontal Movement
            let movement = (this.isVertical ? e.pageY : e.pageX) - position[this.isVertical ? 'top' : 'left'];
            let centerize = 0;
            if ( Math.abs(movement) > (this.realSize - 20) ){
              movement = movement > 0 ? (this.realSize - 20) : - (this.realSize - 20);
            }
            else{
              centerize = (movement > 0 ? 1 : -1) * this.size / 2;
            }
            let movementPercentage = movement / this.containerSize * 100 + centerize;
            this._changePosition(this.position + movementPercentage, true);
          }
        }
      },

      // Emits scroll event
      normalize(){
        let e = new Event('scroll');
        this.$emit('scroll', e, this.position);
      },

      // Gets the array of scrollable elements according to scrollAlso attribute
      scrollableElements(){
        let tmp = this.scrollAlso;
        if ( $.isFunction(tmp) ){
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
      onResize() {
        if ( this.realContainer ){
          let tmp1 = (this.isVertical ? $(this.realContainer).height() : $(this.realContainer).width()) - bbn.fn.getScrollBarSize(),
              tmp2 = this.realContainer.children[0] ? this.realContainer.children[0][this.isVertical ? 'clientHeight' : 'clientWidth'] : this.containerSize - bbn.fn.getScrollBarSize();
          if ( (tmp1 !== this.containerSize) || (tmp2 !== this.contentSize) ){
            this.containerSize = tmp1;
            this.contentSize = tmp2;
            // The scrollbar is only visible if needed, i.e. the content is larger than the container
            if ( this.contentSize - this.tolerance > this.containerSize ){
              let old = this.size;
              this.size = this.containerSize / this.contentSize * 100;
              this._changePosition(old ? Math.round(this.position * (old/this.size) * 10000)/10000 : 0);
            }
            else{
              this.size = 0;
            }
          }
        }
        else{
          this.initContainer();
        }
      },

      // Sets the variables when the content is scrolled with mouse
      adjust(e, position){
        if ( position === this.position ){
          return
        }
        let prop = this.isVertical ? 'scrollTop' : 'scrollLeft';
        if (
          e && e.target &&
          this.realContainer &&
          !this.dragging &&
          (e.target[prop] !== this.currentScroll)
        ){
          if ( e.target[prop] ){
            this._changePosition(Math.round(e.target[prop] / this.contentSize * 1000000)/10000, false, false, e.target);
          }
          else{
            this._changePosition(0);
          }
        }
        this.overContent();
      },

      // Sets all event listeners
      initContainer(){
        if ( !this.realContainer && this.scroller ){
          this.realContainer = this.scroller.$refs.scrollContainer || false;
        }
        if ( this.realContainer && this.scroller ){
          this.onResize();
          this.scroller.$off("resize", this.onResize);
          this.scroller.$on("resize", this.onResize);
          this.scroller.$off("scroll", this.adjust);
          this.scrollTo(this.initial);
          this.scroller.$on("scroll", this.adjust);
          this.scroller.$off("mousemove", this.overContent);
          this.scroller.$on("mousemove", this.overContent);
          $.each(this.scrollableElements(), (i, a) => {
            $(a).off("scroll", this.adjust);
            $(a).off("mousemove", this.overContent);
            $(a).scroll(this.adjust);
            $(a).mousemove(this.overContent);
          });
        }
      },

      // When the mouse is over the content
      overContent(){
        bbn.fn.log("OVER", this.orientation);
        clearTimeout(this.moveTimeout);
        if ( !this.show ){
          this.show = true;
        }
        this.moveTimeout = setTimeout(() => {
          if ( !this.isOverSlider ){
            this.hideSlider();
          }
        }, 1000);
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
          $(this.$refs.scrollSlider).animate(anim, () => {
            //this.dragging = false;
          })
        }
      },
      scrollTo(val, animate){
        let num = null;
        let witness;
        let prop = this.isVertical ? 'top' : 'left';
        if ( bbn.fn.isVue(val) ){
          if ( val.$el ){
            let $container = $(val.$el).offsetParent();
            num = $(val.$el).position()[prop];
            while ( $container[0] && (witness !== $container[0]) && ($container[0] !== this.scroller.$refs.scrollContent) ){
              if ( $container[0] === document.body ){
                break;
              }
              else{
                num += $container.position()[prop];
                $container = $container.offsetParent();
              }
              witness = $container[0];
            }
            num -= 20;
          }
        }
        else if ( val instanceof HTMLElement ){
          let $container = $(val).offsetParent();
          num = $(val).position()[prop];
          while ( $container[0] && (witness !== $container[0]) && ($container[0] !== this.scroller.$refs.scrollContent) ){
            if ( $container[0] === document.body ){
              break;
            }
            else{
              num += $container.position()[prop];
              $container = $container.offsetParent();
            }
            witness = $container[0];
          }
          num -= 20;
        }
        else if ( bbn.fn.isPercent(val) ){
          num = Math.round(parseFloat(val) * this.contentSize / 100);
        }
        else if ( typeof(val) === 'number' ){
          num = val;
        }
        if ( num !== null ){
          if ( num < 0 ){
            num = 0;
          }
          this._changePosition(100 / this.contentSize * num, animate);
          this.animateBar();
        }
      },

      scrollStart(){
        this.scrollTo(0);
      },

      scrollEnd(){
        this.scrollTo('100%');
      }
    },
    watch: {
      container(){
        this.initContainer();
      },
      size(newVal){
        if ( newVal ){
          this.animateBar();
        }
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
      this.ready = true;
    },
    beforeDestroy() {
      $(this.realContainer).off("scroll", this.adjust);
      $(this.realContainer).off("mousemove", this.overContent);
      $.each(this.scrollableElements(), (i, a) => {
        $(a).off("scroll", this.adjust);
        $(a).off("mousemove", this.overContent);
      });
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("touchmove", this.onDrag);
      document.removeEventListener("mouseup", this.stopDrag);
      document.removeEventListener("touchend", this.stopDrag);
    },
  });

})(window.jQuery, window.bbn, window.Vue);
