/**
 * Created by BBN on 15/02/2017.
 */
(function(Vue, bbn){
  "use strict";
  /**
   * Classic input with normalized appearance
   */
  let isClicked = false;
  Vue.component('bbn-floater', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.sourceArrayComponent, bbn.vue.keepCoolComponent],
    props: {
      container: {},
      maxWidth: {
        type: Number
      },
      maxHeight: {
        type: Number
      },
      minWidth: {
        type: Number
      },
      minHeight: {
        type: Number
      },
      width: {
        type: [String, Number, Boolean]
      },
      height: {
        type: [String, Number, Boolean]
      },
      left: {
        type: Number
      },
      right: {
        type: Number
      },
      top: {
        type: Number
      },
      bottom: {
        type: Number
      },
      source: {
        type: [Function, Array, String, Object]
      },
      component: {
        type: [Object, String]
      },
      content: {
        type: String,
        default: ''
      },
      options: {
        type: Object
      },
      element: {
        type: Element
      },
      orientation: {
        type: String,
        default: 'vertical'
      },
      hpos: {
        type: String,
        default: 'left'
      },
      vpos: {
        type: String,
        default: 'bottom'
      },
      scrollable: {
        type: Boolean,
        default: false
      },
      visible: {
        type: Boolean,
        default: true
      },
      unique: {
        type: Boolean,
        default: false
      },
      mode: {
        type: String,
        default: "free"
      },
      parent: {
        default: false
      },
      noIcon: {
        default: false
      },
      // The hierarchy level, root is 0, and for each generation 1 is added to the level
      level: {
        type: Number,
        default: 0
      },
      itemComponent: {},
      autoHide: {
        type: Boolean,
        default: false
      },
      children: {
        type: String,
        default: 'items'
      },
      title: {
        type: String
      },
      closable: {
        type: Boolean,
        default: false
      },
      maximizable: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        _scroller: null,
        currentIndex: 0,
        currentTop: null,
        currentLeft: null,
        currentHeight: null,
        currentWidth: null,
        currentScroll: false,
        currentVisible: this.visible,
        containerWidth: 0,
        containerHeight: 0,
        focused: bbn.env.focused || null,
        opacity: 0,
        floaterHeight: 0,
        floaterWidth: 0,
        hasIcons: false,
        currentSelected: -1,
        isMaximized: false
      };
    },
    computed: {
    },
    methods: {
      _getCoordinates(){
        if ( this.element ){
          let coor = this.element.getBoundingClientRect(),
              isHorizontal = this.orientation === 'horizontal';
          if ( !this._scroller ){
            let scroll = bbn.fn.getScrollParent(this.$el);
            if ( scroll ){
              this._scroller = scroll;
              this._scroller.addEventListener('scroll', this.onResize);
            }
          }
          return {
            top: isHorizontal ? coor.top : coor.bottom,
            bottom: this.containerHeight - (isHorizontal ? coor.bottom : coor.top),
            left: isHorizontal ? coor.right : coor.left,
            right: this.containerWidth - (isHorizontal ? coor.left : coor.right)
          };
        }
        else{
          return {
            top: this.top || null,
            right: this.right || null,
            bottom: this.bottom || null,
            left: this.left || null
          };
        }
      },
      _updateIconSituation(){
        let hasIcons = false;
        bbn.fn.each(this.currentData, (a) => {
          if ( a.icon ){
            hasIcons = true;
            return false;
          }
        });
        if ( hasIcons !== this.hasIcons ){
          this.hasIcons = hasIcons;
        }
      },

      getContainerPosition(){
        let obj = {};
        if ( this.container ){
          obj = (bbn.fn.isObject(this.container) ? this.container : this.$el.parentNode).getBoundingClientRect();
        }
        this.containerWidth = obj.width || bbn.env.width;
        this.containerHeight = obj.height || bbn.env.height;
        return {
          top: obj.top || 0,
          left: obj.left || 0,
          width: this.containerWidth,
          height: this.containerHeight
        };
      },
      getContainerHeight(){
        return this.getContainerPosition().height;
      },
      getContainerWidth(){
        return this.getContainerPosition().width;
      },
      show(){
        this.currentVisible = true;
      },
      hide(){
        this.currentVisible = false;
      },
      onResize(){
        if ( this.currentVisible ){
            // Resetting
          this.currentHeight = null;
          this.currentWidth = null;
          this.currentScroll = false;
          return this.$nextTick(() => {
            // These are the limits of the space the DIV can occupy
            let pos = this.getContainerPosition();
            let ctHeight = pos.height;
            let ctWidth = pos.width;
            let ctTop = pos.top;
            let ctLeft = pos.left;
            // The natural container size
            this.floaterWidth = this.$el.offsetWidth;
            this.floaterHeight = this.$el.offsetHeight;
            bbn.fn.log(this.$el);
            bbn.fn.log("FLOATER: W -> " + this.floaterWidth + " / H -> " + this.floaterHeight);
            // The coordinates of the target position
            let coor = this._getCoordinates();
            if ( coor ){
              // No scroll by default
              let scrollV = false;
              let scrollH = false;
              // HEIGHT
              let top = null;
              // Natural height
              let height = this.floaterHeight;
              if ( this.minHeight && (this.minHeight > height) ){
                height = this.minHeight;
              }
              if ( this.maxHeight && (this.maxHeight < height) ){
                height = this.maxHeight;
                scrollV = true;
              }
              if ( ctHeight < height ){
                height = ctHeight;
                scrollV = true;
              }
              if ( !coor.top && !coor.bottom ){
                coor.top = coor.bottom = (ctHeight - height) / 2;
              }
              else if ( !coor.top && coor.bottom ){
                coor.top = ctHeight - coor.bottom - height;
              }
              else if ( coor.top && !coor.bottom ){
                coor.bottom = ctHeight - coor.top - height;
              }
              if ( coor.top < ctTop ){
                coor.top = ctTop;
              }
              if ( this.element ){
                if ( coor.top + height > ctHeight ){
                  let isTopBigger = coor.top > coor.bottom;
                  scrollV = true;
                  if ( isTopBigger ){
                    if ( coor.bottom + height > ctHeight ){
                      top = ctTop;
                      height = ctHeight - coor.bottom;
                    }
                    else{
                      top = ctHeight - coor.bottom - height + ctTop;
                    }
                  }
                  else{
                    height = ctHeight - coor.top;
                  }
                }
              }
              else if ( (coor.top + height > ctHeight) || (coor.bottom + height > ctHeight) ){
                if ( this.top ){
                  height = ctHeight - coor.top;
                }
                else{
                  height = ctHeight - coor.bottom;
                  coor.top = 0;
                }
                scrollV = true;
              }
              if ( top === null ){
                if ( coor.top ){
                  top = coor.top + ctTop;
                }
                else if ( scrollV ){
                  top = ctTop;
                }
                else{
                  top = ctHeight - (coor.bottom | 0) - height + ctTop;
                }
              }

              // WIDTH
              let left = null;
              // Natural width
              let width = this.floaterWidth;
              if ( this.minWidth && (this.minWidth > width) ){
                width = this.minWidth;
              }
              if ( this.maxWidth && (this.maxWidth < width) ){
                width = this.maxWidth;
                scrollH = true;
              }
              if ( ctWidth < width ){
                width = ctWidth;
                scrollH = true;
              }
              if ( !coor.left && !coor.right ){
                coor.left = coor.right = (ctWidth - width) / 2;
              }
              else if ( !coor.left && coor.right ){
                coor.left = ctWidth - coor.right - width;
              }
              else if ( coor.left && !coor.right ){
                coor.right = ctWidth - coor.left - width;
              }
              if ( coor.left < ctLeft ){
                coor.left = ctLeft;
              }

              if ( this.element ){
                if ( coor.left + width > ctWidth ){
                  let isLeftBigger = coor.left > coor.right;
                  scrollH = true;
                  if ( isLeftBigger ){
                    if ( coor.right + width > ctWidth ){
                      left = ctLeft;
                      width = ctWidth - coor.right;
                    }
                    else{
                      left = ctWidth - coor.right - width + ctLeft;
                    }
                  }
                  else{
                    width = ctWidth - coor.left;
                  }
                }
              }
              else if ( (coor.left + width > ctWidth) || (coor.right + width > ctWidth) ){
                if ( this.left ){
                  width = ctWidth - coor.left;
                }
                else{
                  width = ctWidth - coor.right;
                  coor.left = 0;
                }
                scrollH = true;
              }
              if ( left === null ){
                if ( coor.left ){
                  left = coor.left + ctLeft;
                }
                else if ( scrollH ){
                  left = ctLeft;
                }
                else{
                  left = ctWidth - coor.right - width + ctLeft;
                }
              }
              this.currentLeft = left + 'px';
              this.currentTop = top + 'px';
              this.currentHeight = height;
              this.currentWidth = width;
              this.currentScroll = scrollV || scrollH ? true : false;
            }
          });
        }
      },
      pressKey(e){
        bbn.fn.log("KEYPRESS");
        switch ( e.key ){
          case "Enter":
          case "Space":
            this.select(this.currentIndex);
            break;
          case "Escape":
          case "ArrowLeft":
            this.$emit('close');
            break;
          case "ArrowDown":
            if ( this.items.length ){
              if ( this.currentIndex > this.items.length - 2 ){
                this.currentIndex = 0;
              }
              else{
                this.currentIndex++;
              }
            }
            break;
          case "ArrowUp":
            if ( this.items.length ){
              if ( this.currentIndex > 0 ){
                this.currentIndex--;
              }
              else{
                this.currentIndex = this.items.length - 1;
              }
            }
            break;
        }
      },
      blur(){
        //this.$emit('blur');
        if ( this.autoHide ){
          this.close();
        }
      },
      over(idx){
      },
      close(e){
        this.hide();
      },
      closeAll(){
        let ancesters = this.ancesters('bbn-floater');
        if ( ancesters.length ){
          ancesters.pop().currentVisible = false;
        }
        else{
          this.currentVisible = false;
        }
      },
      select(idx){
        if ( !this.currentData[idx].disabled && !this.currentData[idx][this.children] ){
          if ( this.mode === 'options' ){
            this.currentData[idx].selected = !this.items[idx].selected;
          }
          else if ( (this.mode === 'selection') && !this.currentData[idx].selected ){
            let prev = bbn.fn.search(this.currentData, "selected", true);
            if ( prev > -1 ){
              this.currentData[prev].selected = false;
            }
            this.currentData[idx].selected = true;

          }
          if ( this.currentData[idx].command ){
            if ( typeof(this.currentData[idx].command) === 'string' ){
              bbn.fn.log("CLICK IS STRING", this);
            }
            else if (bbn.fn.isFunction(this.currentData[idx].command) ){
              bbn.fn.log("CLICK IS FUNCTION", this);
              this.currentData[idx].command(idx, this.currentData[idx]);
            }
          }
          if ( this.mode !== 'options' ){
            this.closeAll();
          }
          this.$emit("select", this.currentData[idx]);
        }
      }
    },
    created(){
      this.focused = bbn.env.focused;
      this.updateData().then(() => {
        this._updateIconSituation();
      });
    },
    beforeDestroy(){
      if ( this._scroller ){
        this._scroller.removeEventListener('scroll', this.resize);
      }
    },
    mounted(){
      this.ready = true;
      this.$nextTick(() => {
        this.waitReady();
        this.$nextTick(() => {
          this.opacity = 1;
        });
      });
    },
    watch: {
      source: {
        deep: true,
        handler(){
          this.updateData().then(() => {
            this._updateIconSituation();
          });
        }
      },
      element(){
        this.onResize();
      },
      currentVisible(newVal){
        this.$emit(newVal ? 'open' : 'close');
        if ( newVal ){
          this.onResize();
        }
      }
    }

  });

})(window.Vue, window.bbn);
