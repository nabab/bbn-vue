/**
 * @file bbn-slider component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author Vito Fava
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-slider', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.toggleComponent],
    props: {
      orientation: {
        type: String,
        default: 'left'
      },
      closeButton: {
        type: [Boolean, String],
        default: true
      },
      visible: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        hasBeenOpened: false,
        opacity: 0,
        currentSize: 0,
        top: null,
        left: null,
        bottom: null,
        right: null
      };
    },
    computed: {
      isVertical(){
        return (this.orientation === 'left') || (this.orientation === 'right');
      },
      marginLeft(){
        switch (this.orientation) {
          case 'left':
            return this.currentVisible ? 0 : -this.currentSize + 'px';
          case 'right':
            return this.currentVisible ? 0 : this.currentSize + 'px';
          default:
            return 0;
        }
      },
      marginTop(){
        switch (this.orientation) {
          case 'top':
            return this.currentVisible ? 0 : -this.currentSize + 'px';
          case 'bottom':
            return (this.currentVisible ? bbn.env.height - this.currentSize : bbn.env.height) + 'px';
          default:
            return 0;
        }
      },
      currentLeft(){
        switch (this.orientation) {
          case 'left':
            return 0;
          case 'right':
            return (bbn.env.width - this.currentSize) + 'px';
          default:
            return 0;
        }
      },
      currentTop(){
        switch (this.orientation) {
          case 'top':
            return 0;
          case 'bottom':
            return (bbn.env.height - this.currentSize) + 'px';
          default:
            return 0;
        }
      }
    },
    methods: {
      /**
       * Adds or removes the event listener for mousedown and touchstart
       * @method _setEvents
       * @param add 
       */
      _setEvents(add){
        if ( add ){
          document.addEventListener('mousedown', this.checkMouseDown);
          document.addEventListener('touchstart', this.checkMouseDown);
        }
        else{
          document.removeEventListener('mousedown', this.checkMouseDown);
          document.removeEventListener('touchstart', this.checkMouseDown);
        }
      },
      onResize(){
        let s = this.$el.getBoundingClientRect()[this.isVertical ? 'width' : 'height'];
        if ((s !== (this.currentSize + 10)) && (s > 20)){
          this.currentSize = s + 10;
        }
      },
      show(){
        this.onResize();
        this.currentVisible = true;
        this.$emit('show');
      },
      hide(e) {
        if (e && e.target && e.target.blur) {
          e.target.blur();
        }
        this.currentVisible = false;
        this.$emit('hide');
      },
      toggle(){
        if (this.currentVisible) {
          this.hide();
        }
        else{
          this.show();
        }
      },
      checkMouseDown(e){
        bbn.fn.log('checkMouseDown');
        if (this.currentVisible && (this.$el !== e.target) && !this.$el.contains(e.target)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.toggle();
        }
      },
    },
    /**
     * @event destroyed
     * @fires _setEvents
     */
    destroyed(){
      this._setEvents();
    },
    mounted(){
      this.onResize();
      this.ready = true;
      this.$nextTick(() => {
        this.opacity = 1;
      });
    },
    watch: {
      /**
       * @watch currentVisible
       * @param {Boolean} newVal 
       * @fires tree.load
       * @fires _setEvents
       */
      currentVisible(newVal){
        this._setEvents(newVal);
      },
      currentSize(v){
        this.$el.style[this.isVertical ? 'width' : 'height'] = v;
      }
    }
  });

})(bbn);
