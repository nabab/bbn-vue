(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-overlay']">
  <div class="bbn-hidden" v-if="$slots.default" ref="slot">
    <slot></slot>
  </div>
  <div v-for="(item, index) of items"
       class="bbn-overlay slide"
       :style="getStyle(item)">
    <bbn-scroll :scrollable="item.visible">
      <ul v-if="item.data && item.data.length && ready"
          class="bbn-menulist"
      >
        <li v-if="index > 0" class="bbn-state-default" @click="unselect">
          <span class="bbn-w-100 bbn-vxspadded bbn-hspadded">
            <!--span class="space" v-if="hasIcons"></span-->
            <span class="text">..</span>
          </span>

        </li>
        <li v-for="(li, idx) of item.data"
            :ref="'li-' + index + '-' + idx"
            :key="uid ? li[uid] : index + '-' + idx"
            @click="select(index, idx)"
            :class="{
              'bbn-no-padding': !!component,
              'bbn-state-default': true,
              'bbn-disabled': !!li.disabled,
              'bbn-state-selected': item.visible && (idx === selectedIndex) 
            }">
          <component v-if="currentComponent"
                    :is="currentComponent"
                    :source="li"
                    @remove="remove(idx)">
          </component>
          <component v-else
                    :is="li.url && !li[children] ? 'a' : 'span'"
                    @click.prevent="() => {}"
                    class="bbn-w-100 bbn-vxspadded bbn-hspadded"
                    :href="li.url || null">
            <!--span class="space" v-if="hasIcons">
              <i v-if="li.icon" :class="li.icon"></i>
            </span-->
            <span class="text" v-html="li[sourceText]"></span>
          </component>
        </li>
      </ul>
    </bbn-scroll>
  </div>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-slider-menu');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/slider-menu/slider-menu.css");
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-lists component
 *
 * @description A fully customizable selectable list.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */
(function(Vue, bbn){
  "use strict";
  /**
   * Classic input with normalized appearance
   */
  let isClicked = false;
  Vue.component('bbn-slider-menu', {
    mixins: [bbn.vue.basicComponent, bbn.vue.listComponent, bbn.vue.keynavComponent, bbn.vue.resizerComponent],
    props: {
      /**
       * The source of the floater.
       * @prop {Function|Array|String|Object} source
       */
      source: {
        type: [Function, Array, String, Object]
      },
      /**
       * The array containings the tree's children.
       * @prop {String} ['items'] children
       */
      children: {
        type: String,
        default: 'items'
      },
      selected: {
        type: Array,
        default(){
          return []
        }
      },
      component: {
        type: [String, Object, Function]
      }
    },
    data(){
      return {
        /**
         * @data [] currentSelected
         */
        currentSelected: this.selected.slice(),
        /**
         * The index (on filteredData) on which is the mouse cursor or the keyboard navigation
         * @data {Number} [-1] overItem
         * @memberof listComponent
         */
        overIdx: this.suggest ? 0 : null,
        mouseLeaveTimeout: false,
        currentComponent: this.component,
        selectedIndex: false,
        maxDepth: 0

      };
    },
    computed: {
      items(){
        bbn.fn.log("REDOING ITEMS");
        let depth = 0;
        let res = [{
          data: this.source,
          selected: true,
          visible: this.currentSelected.length === 0,
          last: false,
          depth: depth
        }];
        let sel = '';
        let list = this.source;
        bbn.fn.each(this.currentSelected, (a, i) => {
          if (sel) {
            sel += '.';
          }
          sel += a + '.' + this.children;
          let tmp = bbn.fn.getProperty(this.source, sel);
          bbn.fn.log(sel, tmp);
          list = tmp
          if (tmp && tmp.length ) {
            depth++;
            res.push({
              data: list,
              selected: true,
              visible: i === this.currentSelected.length - 1,
              last: i === this.currentSelected.length - 1,
              depth: depth
            });
          }
          else {
            res[res.length-1].visible = true;
            res[res.length-1].selected = true;
            res[res.length-1].last = true;
          }
        });
        if (list && list.length) {
          let hasChildren = false;
          bbn.fn.each(list, (a) => {
            if (a[this.children] && a[this.children].length) {
              if (!hasChildren) {
                hasChildren = true;
                depth++;
              }
              res.push({
                data: a[this.children],
                selected: false,
                visible: false,
                last: true,
                depth: depth
              });
            }
          })
        }
        else if (!res[res.length - 1].visible) {

        }
        this.maxDepth = depth;
        return res;
      }
    },
    methods: {
      getStyle(item){
        let left = '100%';
        if (item.visible) {
          left = '0px';
        }
        else if (item.selected) {
          left = '-100%';
        }
        return {
          left: left
        }
      },
      mouseleave(){
        this.isOver = false;
        this.overIdx = this.suggest ? 0 : null;
      },
      remove(idx){
        //bbn.fn.log(this.currentData, idx);
        this.realDelete(idx);
      },
      /**
       * Handles the selection of the floater's items.
       * @method select
       * @param {Number} idx 
       * @fires closeAll
       * @emits select
       */
      select(itemIdx, dataIdx){
        bbn.fn.log("SELE", dataIdx, this.items[itemIdx], this.maxDepth);
        if ((this.items[itemIdx].depth < this.maxDepth) && this.items[itemIdx].data && this.items[itemIdx].data.length) {
          this.currentSelected.push(dataIdx)
          this.selectedIndex = false;
        }
        else {
          this.selectedIndex = dataIdx;
        }
        this.$emit('select', this.items[itemIdx].data[dataIdx]);
      },
      unselect(){
        this.selectedIndex = false;
        this.currentSelected.pop();
        this.$emit('unselect', this.currentSelected)
      },
      reset(){
        this.selectedIndex = false;
        this.currentSelected.splice(0, this.currentSelected.length);
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.currentComponent = this.realComponent;
      if (!this.component && !this.template && this.$slots.default) {
        let tpl = this.getRef('slot').innerHTML;
        if (tpl) {
          this.currentTemplate = tpl;
          this.currentComponent = {
            props: ['source'],
            data(){
              return this.source;
            },
            template: this.currentTemplate
          };
        }
      }
      this.$nextTick(() => {
        if (this.$parent.$options && (this.$parent.$options._componentTag === 'bbn-scroll')) {
          this.hasScroll = true;
        }
        this.ready = true;
      });
    },
    watch: {
      source(){
        this.reset()
      }
    }

  });

})(window.Vue, window.bbn);


bbn_resolve("ok");
})(bbn); }