/**
 * Created by BBN on 10/02/2017.
 */
(function($, bbn){
  "use strict";

  kendo.ui.AutoComplete.prototype.options.autoWidth = true;

  Vue.component('bbn-scroll', {
    template: '#bbn-tpl-component-scroll',
    props: {
      classes: {
        type: String,
        default: ""
      },
      theme: {
        type: String,
        default: "light"
      },
      speed: {
        type: Number,
        default: 53
      },
      axis: {
        type: String,
        default: "both"
      }
    },
    data() {
      return {
        ready: false,
        scrollContainerHeight: null,
        scrollContainerWidth: null,
        scrollContentHeight: null,
        scrollContentWidth: null,
        show: false,
        dragging: false,
        scrollY: null,
        scrollX: null,
        top: 0,
        left: 0,
        vMovement: 0,
        hMovement: 0,
        start: { y: 0, x: 0 },
      }
    },
    methods: {
      calculateSize() {
        let $scrollContent = this.$refs.scrollContent
        let $scrollContainer = this.$refs.scrollContainer
        let scrollContainerStyle = window.getComputedStyle($scrollContainer, null)
        this.scrollContentHeight = $scrollContent.children[0].clientHeight
        this.scrollContentWidth = $scrollContent.children[0].clientWidth
        this.scrollContainerHeight = parseFloat(scrollContainerStyle.height)
        this.scrollContainerWidth = parseFloat(scrollContainerStyle.width)
        this.ready = true
      },
      showSlider() {
        this.show = true
      },
      hideSlider() {
        if (!this.dragging)
          this.show = false
      },
      scroll(e) {
        e.preventDefault()
        let num = this.speed
        let shifted = e.shiftKey
        this.scrollY = e.deltaY > 0 ? num : -(num)
        this.scrollX = e.deltaX > 0 ? num : -(num)
        if(shifted && e.deltaX == 0) this.scrollX = e.deltaY > 0 ? num : -(num)
        let nextY = this.top + this.scrollY
        let nextX = this.left + this.scrollX
        let canScrollY = this.scrollContentHeight > this.scrollContainerHeight
        let canScrollX = this.scrollContentWidth > this.scrollContainerWidth
        if (canScrollY && !shifted) {
          this.normalizeVertical(nextY)
          this.moveTheScrollbar()
        }
        if (shifted && canScrollX) {
          this.normalizeHorizontal(nextX)
          this.moveTheScrollbar()
        }
      },
      normalizeVertical(nextY) {
        let lowerEnd = this.scrollContentHeight - this.scrollContainerHeight
        if (nextY > lowerEnd)
          nextY = lowerEnd
        else if (nextY < 0)
          nextY = 0
        this.top = nextY
      },
      normalizeHorizontal(nextX) {
        let rightEnd = this.scrollContentWidth - this.scrollContainerWidth
        if (nextX > rightEnd)
          nextX = rightEnd
        else if (nextX < 0)
          nextX = 0
        this.left = nextX
      },
      moveTheScrollbar() {
        this.vMovement = this.top / this.scrollContentHeight * 100
        this.hMovement = this.left / this.scrollContentWidth * 100
      },
      startDrag(e) {
        e.preventDefault()
        e.stopPropagation()
        e = e.changedTouches ? e.changedTouches[0] : e
        this.dragging = true
        this.show = true
        this.start.y = e.pageY
        this.start.x = e.pageX
      },
      onDrag(e) {
        if (this.dragging) {
          e.preventDefault()
          e = e.changedTouches ? e.changedTouches[0] : e
          let yMovement = this.start.y - e.pageY
          let xMovement = this.start.x - e.pageX
          this.start.y = e.pageY
          this.start.x = e.pageX
          let nextY = this.top + yMovement
          let nextX = this.left + xMovement
          this.normalizeVertical(nextY)
          this.normalizeHorizontal(nextX)
          this.moveTheScrollbar()
        }
      },
      stopDrag(e) {
        this.dragging = false
        this.show = false
      },
      handleChangePosition(vScrollbar, orientation) {
        let next = vScrollbar / 100 * (orientation == 'vertical' ? this.scrollContentHeight : this.scrollContentWidth)
        if (orientation == 'vertical') this.normalizeVertical(next)
        if (orientation == 'horizontal') this.normalizeHorizontal(next)
      },
    },
    mounted() {
      this.calculateSize()
      window.addEventListener('resize', this.calculateSize)
      if (this.ready) {
        this.$refs.scrollContainer.addEventListener('mouseenter', this.showSlider)
        this.$refs.scrollContainer.addEventListener('mouseleave', this.hideSlider)
      }
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.calculateSize)
      this.$refs.scrollContainer.removeEventListener('mouseenter', this.showSlider)
      this.$refs.scrollContainer.removeEventListener('mouseleave', this.hideSlider)
    }
  });

})(jQuery, bbn);
