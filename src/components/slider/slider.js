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
      currentStyle(){
        let o = {
          opacity: this.opacity
        };
        switch (this.orientation) {
          case 'left':
            o['-webkit-box-shadow'] = '5px 0 5px 0 !important';
            o['-moz-box-shadow'] = '5px 0 5px 0 !important';
            o['box-shadow'] = '5px 0 5px 0 !important';
            o.width = 'auto';
            o.top = 0;
            o.left = this.currentVisible ? 0 : -this.currentSize + 'px';
            o.transition = 'left 0.5s';
            break;
          case 'right':
            o['-webkit-box-shadow'] = '-5px 0 5px 0 !important';
            o['-moz-box-shadow'] = '-5px 0 5px 0 !important';
            o['box-shadow'] = '-5px 0 5px 0 !important';
            o.width = 'auto';
            o.top = 0;
            o.right = this.currentVisible ? 0 : -this.currentSize + 'px';
            o.transition = 'right 0.5s';
            break;
          case 'top':
            o['-webkit-box-shadow'] = '0 5px 0 5px !important';
            o['-moz-box-shadow'] = '0 5px 0 5px !important';
            o['box-shadow'] = '0 5px 0 5px !important';
            o.left = 0;
            o.top = this.currentVisible ? 0 : -this.currentSize + 'px';
            o.transition = 'top 0.5s';
            break;
          case 'bottom':
            o['-webkit-box-shadow'] = '0 -5px 0 5px !important';
            o['-moz-box-shadow'] = '0 -5px 0 5px !important';
            o['box-shadow'] = '0 -5px 0 5px !important';
            o.left = 0;
            o.bottom = this.currentVisible ? 0 : -this.currentSize + 'px';
            o.transition = 'bottom 0.5s';
            break;
        }
        return o;
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
        if ((s !== this.currentSize) && (s > 20)){
          this.currentSize = s + 7;
        }
      },
      show(){
        this.onResize();
        this.currentVisible = true;
      },
      hide(){
        //this.updateSize();
        this.currentVisible = false;
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
        bbn.fn.log("checkMouseDown", this.currentVisible);
        if ( this.currentVisible &&
          !e.target.closest(".bbn-treemenu") &&
          !e.target.closest(".bbn-menu-button")
        ){
          e.preventDefault();
          e.stopImmediatePropagation();
          this.toggle();
        }
      },
    },
    /**
     * @event created
     * @fires _setEvents
     */
    created(){
      this._setEvents();
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
        this._setEvents(!!newVal);
      },
      currentSize(v){
        this.$el.style[this.isVertical ? 'width' : 'height'] = v;
      },
      opacity(v){
        bbn.fn.log("OPACITY: " + v);
      }
    }
  });

})(bbn);
