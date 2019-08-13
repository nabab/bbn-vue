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
        scroll: this.initial,
        isReaching: false
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
        if ( this.color ){
          res.backgroundColor = this.color;
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
        return (this.hidden !== true) &&
          this.realContainer &&
          this.containerSize &&
          (this.contentSize > (this.containerSize + bbn.fn.getScrollBarSize() + 2))
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
          this.keepCool(() => {
            e = e.changedTouches ? e.changedTouches[0] : e;
            let movement = (this.isVertical ? e.pageY : e.pageX) - this.start;
            let movementPercentage = movement ? Math.round(movement / this.containerSize * 1000000) / 10000 : 0;
            this.start = (this.isVertical ? e.pageY : e.pageX);
            if ( movementPercentage ){
              this._changePosition(this.position + movementPercentage);
            }
          })
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
          let ev = false;
          if ( (position < this.position) && (this.currentScroll < 50) ){
            ev = this.isVertical ? 'reachTop' : 'reachLeft';
          }
          else if ( (position > this.position) && (this.currentScroll > (this.contentSize - this.containerSize - 50)) ){
            ev = this.isVertical ? 'reachBottom' : 'reachRight';
          }
          if ( ev && this.ready ){
            this.$emit(ev, ev, this);
          }
          let prop = this.isVertical ? 'scrollTop' : 'scrollLeft';
          let anim = {};
          anim[prop] = this.currentScroll;
          /** @todo doesn't work */
          if ( animate && false ){
            bbn.fn.each(this.scrollableElements(), (a) => {
              if (
                (a !== this.realContainer) &&
                (a !== origin) &&
                (a[prop] !== this.currentScroll)
              ){
                bbn.fn.iterate(anim, (v, k) => {
                  a.style[k] = v;
                });
              }
            });
            if ( (origin !== this.realContainer) && (this.realContainer[prop] !== this.currentScroll) ){
              bbn.fn.iterate(anim, (v, k) => {
                this.realContainer.style[k] = v;
              });
              this.position = position;
              this.normalize();
            }
          }
          else {
            bbn.fn.each(this.scrollableElements(), (a) => {
              if ( (a !== this.realContainer) && (a !== origin) && (a[prop] !== this.currentScroll) ){
                a[prop] = this.currentScroll;
              }
            });
            if ( (origin !== this.realContainer) && (this.realContainer.scrollTop !== this.currentScroll) ){
              this.realContainer[prop] = this.currentScroll;
            }
            this.position = position;
          }
        }
      },

      /**
       * When the users jumps by clicking the scrollbar while a double click will activate tillEnd.
       **/
      jump(e, tillEnd) {
        if ( this.realContainer ){
          let isRail = e.target === this.$el;
          if ( isRail ){
            let position = this.$refs.scrollSlider.getBoundingClientRect();
            // Calculate the Movement
            let clickPoint = this.isVertical ? e.pageY : e.pageX;
            let isBefore = clickPoint < position[this.isVertical ? 'top' : 'left'];
            let isAfter = clickPoint > position[this.isVertical ? 'bottom' : 'right'];
            if ( isBefore || isAfter ){
              let movement = isBefore ?
                      position[this.isVertical ? 'top' : 'left'] - clickPoint :
                      clickPoint - (position[this.isVertical ? 'top' : 'left']) - (position[this.isVertical ? 'height' : 'width']);
              if ( tillEnd ){
                this._changePosition(isAfter ? 100 : 0, true);
              }
              else{
                let centerize = 0;
                if ( movement > (this.realSize - 20) ){
                  movement = (this.realSize - 20) * (isBefore ? 1 : -1);
                }
                else{
                  centerize = (isBefore ? -1 : 1) * this.size;
                }
                let movementPercentage = movement / this.containerSize * 100 + centerize;
                this._changePosition(this.position + movementPercentage, true);
              }
            }
          }
        }
      },

      // Emits scroll event
      normalize(){
        if ( this.currentScroll !== this.realContainer['scroll' + (this.isVertical ? 'Top' : 'Left')] ){
          this.realContainer['scroll' + (this.isVertical ? 'Top' : 'Left')] = this.currentScroll;
        }
        let e = new Event('scroll');
        this.$emit('scroll', e, this.position);
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
          let tmp1 = (this.isVertical ? this.realContainer.clientHeight : this.realContainer.clientWidth) - bbn.fn.getScrollBarSize(),
              tmp2 = this.realContainer.children[0] ? this.realContainer.children[0][this.isVertical ? 'clientHeight' : 'clientWidth'] : this.containerSize;
          if ( tmp1 < 20 ){
            this.containerSize = 0;
            this.contentSize = 0;
            this.size = 0;
            return;
          }
          //bbn.fn.log(tmp1 + '/' + this.containerSize, tmp2 + '/' + this.contentSize);
          if ( (tmp1 !== this.containerSize) || (tmp2 !== this.contentSize) ){
            this.containerSize = tmp1 > 0 ? tmp1 : 0;
            this.contentSize = tmp2 > 0 ? tmp2 : 0;
            // The scrollbar is only visible if needed, i.e. the content is larger than the container
            if ( this.containerSize && (this.contentSize - this.tolerance > this.containerSize) ){
              let old = this.size;
              this.size = this.containerSize / this.contentSize * 100;
              this._changePosition(old ? Math.round(this.position * (this.size/old) * 10000)/10000 : 0);
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
          return;
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
          this.realContainer = this.scroller.getRef('scrollContainer');
        }
        if ( this.realContainer && !this.isInit ){
          this.onResize();
          if ( !this.container && this.scroller ){
            this.scroller.$on("resize", this.onResize);
            this.scrollTo(this.initial);
            this.scroller.$on("scroll", this.adjust);
            //this.scroller.$on("mousemove", this.overContent);
          }
          else{
            this.realContainer.addEventListener('scroll', this.adjust, {passive: true});
            //this.realContainer.addEventListener('mousemove', this.overContent, {passive: true});
          }
          bbn.fn.each(this.scrollableElements(), (a) => {
            a.addEventListener('scroll', this.adjust, {passive: true});
            //a.addEventListener('mousemove', this.overContent, {passive: true});
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
            if ( !this.isOverSlider ){
              this.hideSlider();
            }
          }, 1000);
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
        let num = null;
        let ele;
        let prop = this.isVertical ? 'Top' : 'Left';
        if ( bbn.fn.isPercent(val) ){
          num = Math.round(parseFloat(val) * this.contentSize / 100);
        }
        else if ( bbn.fn.isNumber(val) ){
          num = val;
        }
        else if ( bbn.fn.isVue(val) && val.$el ){
          ele = val.$el;
        }
        else if ( bbn.fn.isDom(val) ){
          ele = val;
        }
        if ( ele ){
          let $ct = ele.offsetParent;
          let witness;
          num = ele['offset' + prop];
          while ($ct && (witness !== $ct) && ($ct !== this.realContainer)){
            if ($ct === document.body) {
              break;
            }
            else {
              num += parseFloat($ct['offset' + prop]);
              $ct = $ct.offsetParent;
            }
            witness = $ct;
          }
          num -= 20;
          if ( num < 0 ){
            num = 0;
          }
        }
        //bbn.fn.log(num);
        if ( num !== null ){
          if ( num < 0 ){
            num = 0;
          }
          /*
          else if ( num > 100 ){
            num = 100;
          }
          */
          this._changePosition(100 / this.contentSize * num, animate);
          this.animateBar();
          //this.realContainer['scroll' + prop] = num;
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
          //this.animateBar();
        }
      },
      dragging(newVal){
        if ( !newVal ){
          setTimeout(this.normalize, 200);
        }
      },
      show(v){
        if (v) {
          this.onResize();
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
