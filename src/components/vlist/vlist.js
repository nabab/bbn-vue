/**
 * Created by BBN on 15/02/2017.
 */
(function($, bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  let isClicked = false;
  Vue.component('bbn-vlist', {
    mixins: [bbn.vue.basicComponent],
    props: {
      source: {
        type: [Function, Array]
      },
      maxHeight: {
        type: String,
        default: '100%'
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
      left: {
        type: [Number, String],
        default: null
      },
      right: {
        type: [Number, String],
        default: null
      },
      top: {
        type: [Number, String],
        default: null
      },
      bottom: {
        type: [Number, String],
        default: null
      },
      mapper: {
        type: Function
      }
    },
    data(){
      let items = [];
      if ( this.source ){
        items = $.isFunction(this.source) ? this.source() : this.source.slice();
        if ( this.mapper ){
          $.map(items, (a) => {
            return this.mapper(a);
          })
        }
      }
      return {
        items: items,
        currentIndex: 0,
        currentHeight: 0,
        currentWidth: 0,
        focused: false
      };
    },
    methods: {
      getStyles(){
        let left = this.left ? (bbn.fn.isNumber(this.left) ? (this.left + 'px') : this.left) : '',
            right = this.right ? (bbn.fn.isNumber(this.right) ? (this.right + 'px') : this.right) : '',
            top = this.top ? (bbn.fn.isNumber(this.top) ? (this.top + 'px') : this.top) : '',
            bottom = this.bottom ? (bbn.fn.isNumber(this.bottom) ? (this.bottom + 'px') : this.bottom) : '';
        if ( this.currentHeight ){
          let tW = bbn.env.width,
              tH = bbn.env.height;
          if ( (this.right !== null) && ((this.right + this.currentWidth) >= tW) ){
            left = '';
            right = (bbn.env.width - this.currentWidth) + 'px';
          }
          else if ( (this.left !== null) && ((this.left + this.currentWidth) >= tW) ){
            right = '';
            left = (bbn.env.width - this.currentWidth) + 'px';
          }
          if ( (this.bottom !== null) && ((this.bottom + this.currentHeight) >= tH) ){
            top = '';
            bottom = (bbn.env.height - this.currentHeight) + 'px';
          }
          else if ( (this.top !== null) && ((this.top + this.currentHeight) >= tH) ){
            bottom = '';
            top = (bbn.env.height - this.currentHeight) + 'px';
          }
        }
        bbn.fn.warning("GET STYLES");
        bbn.fn.log({
          left: left,
          right: right,
          top: top,
          bottom: bottom,
          maxHeight: this.maxHeight
        });
        return {
          left: left,
          right: right,
          top: top,
          bottom: bottom,
          maxHeight: this.maxHeight
        };
      },
      pressKey(e){
        bbn.fn.log(e);
        switch ( e.key ){
          case "Enter":
          case "Space":
            this.select(this.currentIndex);
            break;
          case "Escape":
            this.closeAll();
            break;
          case "ArrowLeft":
            this.close();
            break;
          case "ArrowRight":
            //this.close();
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
      leaveList: function(e){
        if ( !isClicked ){
          this.close();
        }
      },
      beforeClick(){
        isClicked = true;
      },
      afterClick(){
        setTimeout(function(){
          isClicked = false;
        })
      },

      over(idx){
        if ( this.currentIndex !== idx ){
          this.currentIndex = idx;
          if ( this.items[idx].items ){
            var $item = $(this.$el).find(" > ul > li").eq(idx),
                offset = $item.offset(),
                h = $(this.$root.$el).height(),
                w = $(this.$root.$el).width();
            this.$set(this.items[idx], "right", offset.left > (w * 0.6) ? Math.round(w - offset.left) : '');
            this.$set(this.items[idx], "left", offset.left <= (w * 0.6) ? Math.round(offset.left + $item[0].clientWidth) : '');
            this.$set(this.items[idx], "bottom", offset.top > (h * 0.6) ? Math.round(offset.top + $item[0].clientHeight) : '');
            this.$set(this.items[idx], "top", offset.top <= (h * 0.6) ? Math.round(offset.top) : '');
            this.$set(this.items[idx], "maxHeight", (offset.top > (h * 0.6) ? Math.round(offset.top + $item[0].clientHeight) : Math.round(h - offset.top)) + 'px');
          }
        }
      },
      close(e){
        this.currentIndex = false;
      },
      closeAll(){
        this.close();
        if ( this.level ){
          this.$emit("closeall");
        }
        else{
          if ( this.focused ){
            this.focused.focus();
          }
          this.$emit('close');
          this.focus = false;
        }
      },
      select(idx){
        if ( !this.items[idx].disabled && !this.items[idx].items ){
          if ( this.mode === 'options' ){
            this.$set(this.items[idx], "selected", this.items[idx].selected ? false : true);
          }
          else if ( (this.mode === 'selection') && !this.items[idx].selected ){
            var prev = bbn.fn.search(this.items, "selected", true);
            if ( prev > -1 ){
              this.$set(this.items[prev], "selected", false);
            }
            this.$set(this.items[idx], "selected", true);

          }
          if ( this.items[idx].command ){
            if ( typeof(this.items[idx].command) === 'string' ){
              bbn.fn.log("CLICK IS STRING", this);
            }
            else if ( $.isFunction(this.items[idx].command) ){
              bbn.fn.log("CLICK IS FUNCTION", this);
              this.items[idx].command(idx, JSON.parse(JSON.stringify(this.items[idx])));
            }
          }
          if ( this.mode !== 'options' ){
            this.closeAll();
          }
        }
      }
    },
    mounted(){
      this.$nextTick(() => {
        this.focused = bbn.env.focused;
        this.currentHeight = $(this.$el).children().height();
        this.currentWidth = $(this.$el).children().width();
        this.$el.children[0].focus();
        this.ready = true;
          /*
        let style = {},
            h = $(this.$el).children().height();
        if ( this.bottom ){
          if ( this.bottom - h < 0 ){
            style.top = '0px';
          }
          else{
            style.top = Math.round(this.bottom - h) + 'px';
          }
          style.height = Math.round(h + 2) + 'px';
          $(this.$el).css(style)
        }
          */
      })
    },
    watch:{
      currentIndex(newVal){
        if ( (newVal === false) && !this.parent ){
          this.$emit("close");
        }
      }
    }
  });

})(jQuery, bbn);
