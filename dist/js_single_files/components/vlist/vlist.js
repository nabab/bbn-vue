((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="['bbn-unselectable', componentClass]"
     :style="getStyles()"
>
  <ul :class="'bbn-bbox bbn-no-radius bbn-box k-group k-reset ' + mode + (parent ? ' k-menugroup' : ' k-menu k-menu-vertical k-context-menu')"
      @mouseleave.stop.prevent="leaveList($event)"
      tabindex="0"
      v-if="items"
      @keydown="pressKey">
    <li v-for="(li, idx) in items"
        v-show="!li.hidden"
        :class="{
          'k-item': true,
          'bbn-reactive': true,
          selected: li.selected ? true : false,
          disabled: !!li.disabled
        }"
        :key="idx"
        :style="li.items && li.items.length ? 'z-index: auto;' : ''"
        @mouseenter="over(idx)"
        @mousedown.stop.prevent="beforeClick"
        @click.stop.prevent="select(idx)"
        @mouseup="afterClick">
      <span class="k-link" v-if="itemComponent">
        <component :is="itemComponent" :source="li"></component>
      </span>
      <span class="k-link" v-else>
        <span class="space" v-if="(mode === 'selection') || (mode === 'options')">
          <i v-if="(mode === 'selection') && (li.selected)" class="nf nf-fa-check"></i>
          <i v-else-if="mode === 'options'" class="nf nf-fa-check"></i>
        </span>
        <span class="space" v-if="hasIcons">
          <i v-if="li.icon" :class="li.icon"></i>
        </span>
        <span class="text" v-html="li.text"></span>
        <span v-if="li.items && li.items.length"
              class="k-icon k-i-arrow-60-right"
        ></span>
      </span>
      <bbn-vlist v-if="li.items && li.items.length && (idx === currentIndex)"
                 :level="level + 1"
                 @closeall="closeAll()"
                 :source="li.items"
                 :unique="li.unique"
                 :no-icon="li.noIcon"
                 :mode="li.mode"
                 :left="li.left"
                 :top="li.top"
                 :right="li.right"
                 :bottom="li.bottom"
                 :max-height="li.maxHeight"
                 :parent="true"
      ></bbn-vlist>
    </li>
  </ul>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-vlist');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
 * @file bbn-vlist component
 *
 * @description bbn-vlist represents a vertical list of possible actions to be performed.This list can be nested hierarchically.
 *
 * @copyrigth BBN Soutions
 *
 * @author BBN Soutions
 *
 * @created 15/52/2017.
 */
(function(bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  let isClicked = false;
  Vue.component('bbn-vlist', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.positionComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.positionComponent
    ],
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
      mapper: {
        type: Function
      },
      itemComponent: {}
    },
    data(){
      let items = [],
          hasIcons = false;
      if ( this.source ){
        items =bbn.fn.isFunction(this.source) ? this.source() : this.source.slice();
        if ( this.mapper ){
          bbn.fn.map(items, a => {
            return this.mapper(a);
          })
        }
        bbn.fn.each(items, a => {
          if ( a.icon ){
            hasIcons = true;
          }
        });
      }
      return {
        items: items,
        currentIndex: 0,
        currentHeight: 0,
        currentWidth: 0,
        focused: bbn.env.focused,
        hasIcons: hasIcons
      };
    },
    methods: {
      getStyles(){
        let left = this.left ? (bbn.fn.isNumber(this.left) ? this.left : parseInt(this.left)) : '',
            right = this.right ? (bbn.fn.isNumber(this.right) ? this.right : parseInt(this.right)) : '',
            top = this.top ? (bbn.fn.isNumber(this.top) ? this.top : parseInt(this.top)) : '',
            bottom = this.bottom ? (bbn.fn.isNumber(this.bottom) ? this.bottom : parseInt(this.bottom)) : '';
        if ( this.currentHeight ){
          let tW = bbn.env.width,
              tH = bbn.env.height;
          if ( right && ((right + this.currentWidth) >= tW) ){
            left = '';
            right = bbn.env.width - this.currentWidth;
          }
          else if ( left && ((left + this.currentWidth) >= tW) ){
            right = '';
            left = tW < this.currentWidth ? 0 : tW - this.currentWidth;
          }
          if ( bottom && ((bottom + this.currentHeight) >= tH) ){
            top = '';
            bottom = tH - this.currentHeight;
          }
          else if ( top && ((top + this.currentHeight) >= tH) ){
            bottom = '';
            top = tH - this.currentHeight;
          }
        }
        return {
          left: left ? left + 'px' : null,
          right: right ? right + 'px' : null,
          top: top ? top + 'px' : null,
          bottom: bottom ? bottom + 'px' : null,
          maxHeight: this.maxHeight
        };
      },
      pressKey(e){
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
            let $item = $(this.$el).find(" > ul > li").eq(idx),
                offset = $item.offset(),
                h = $(this.$root.$el).height(),
                w = $(this.$root.$el).width();
            this.items[idx].right = offset.left > (w * 0.6) ? Math.round(w - offset.left) : null;
            this.items[idx].left = offset.left <= (w * 0.6) ? Math.round(offset.left + $item[0].clientWidth) : null;
            this.items[idx].bottom = offset.top > (h * 0.6) ? Math.round(h - offset.top - $item[0].clientHeight) : null;
            this.items[idx].top = offset.top <= (h * 0.6) ? Math.round(offset.top) : null;
            this.items[idx].maxHeight = (offset.top > (h * 0.6) ?
              Math.round(offset.top + $item[0].clientHeight) :
              Math.round(h - offset.top)
            ) + 'px';
            bbn.fn.log('over', this.items[idx])
          }
        }
      },
      close(e){
        this.currentIndex = false;
        if ( !this.level && this.focused ){
          $(this.focused).focus();
        }
      },
      closeAll(){
        this.close();
        if ( this.level ){
          this.$emit("closeall");
        }
        else{
          if ( this.focused ){
            $(this.focused).focus();
          }
          this.$emit('close');
          this.focus = false;
        }
      },
      select(idx){
        if ( !this.items[idx].disabled && !this.items[idx].items ){
          if ( this.mode === 'options' ){
            this.items[idx].selected = !this.items[idx].selected;
          }
          else if ( (this.mode === 'selection') && !this.items[idx].selected ){
            let prev = bbn.fn.search(this.items, "selected", true);
            if ( prev > -1 ){
              this.items[prev].selected = false;
            }
            this.items[idx].selected = true;

          }
          if ( this.items[idx].action ){
            if ( typeof(this.items[idx].action) === 'string' ){
              bbn.fn.log("CLICK IS STRING", this);
            }
            else if (bbn.fn.isFunction(this.items[idx].action) ){
              bbn.fn.log("CLICK IS FUNCTION ???", this);
              this.items[idx].action(idx, JSON.parse(JSON.stringify(this.items[idx])));
            }
          }
          if ( this.mode !== 'options' ){
            this.closeAll();
          }
        }
      }
    },
    created(){
      this.focused = bbn.env.focused;
    },
    mounted(){
      this.$nextTick(() => {
        if ( !this.focused ){
          this.focused = bbn.env.focused;
        }
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
    beforeDestroy(){
      bbn.fn.log("beforeDestroy");
      if ( this.focused ){
        bbn.fn.log("foc", this.focused);
        this.focused.focus()
      }
    },
    watch: {
      currentIndex(newVal){
        if ( (newVal === false) && !this.parent ){
          this.$emit("close");
        }
      },
      items(){
        let hasIcons = false;
        bbn.fn.each(this.items, a => {
          if ( a.icon ){
            hasIcons = true;
          }
        });
        if ( this.hasIcons !== hasIcons ){
          this.hasIcons = hasIcons;
        }
      }
    }
  });

})(bbn);


})(bbn);