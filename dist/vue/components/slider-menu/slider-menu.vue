<template>
<div :class="[componentClass, 'bbn-overlay']">
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

</template>
<script>
  module.exports = /**
 * @file bbn-slider-menu component
 *
 * @description bbn-slider-menu component
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */
(function(Vue, bbn){
  Vue.component('bbn-slider-menu', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.keynavComponent
     * @mixin bbn.vue.resizerComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent,
      bbn.vue.keynavComponent,
      bbn.vue.resizerComponent
    ],
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
      /**
       * @prop {Array} [[]] selected
       */
      selected: {
        type: Array,
        default(){
          return []
        }
      },
      /**
       * @prop {String|Object|Function} component
       */
      component: {
        type: [String, Object, Function]
      }
    },
    data(){
      return {
        /**
         * @data {Array} [[]] currentSelected
         */
        currentSelected: this.selected.slice(),
        /**
         * The index (on filteredData) on which is the mouse cursor or the keyboard navigation
         * @data {Number} overIdx
         */
        overIdx: this.suggest ? 0 : null,
        /**
         * @data {Number|Boolean} [false] mouseLeaveTimeout
         */
        mouseLeaveTimeout: false,
        /**
         * @data {String|Object|Function} currentComponent
         */
        currentComponent: this.component,
        /**
         * @data {Number|Boolean} [false] selectedIndex
         */
        selectedIndex: false,
        /**
         * @data {Number} [0] maxDepth
         */
        maxDepth: 0
      };
    },
    computed: {
      /**
       * @computed items
       * @returns {Array}
       */
      items(){
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
          bbn.fn.each(list, a => {
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
      /**
       * @method getStyle
       * @param {Object} item
       * @returns {Object}
       */
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
      /**
       * @method mouseleave
       */
      mouseleave(){
        this.isOver = false;
        this.overIdx = this.suggest ? 0 : null;
      },
      /**
       * @method remove
       * @param {Number} idx
       * @fires realDelete
       */
      remove(idx){
        //bbn.fn.log(this.currentData, idx);
        this.realDelete(idx);
      },
      /**
       * Handles the selection of the floater's items.
       * @method select
       * @param {Number} itemIdx
       * @param {Number} dataIdx
       * @emits select
       */
      select(itemIdx, dataIdx){
        if ((this.items[itemIdx].depth < this.maxDepth) && this.items[itemIdx].data && this.items[itemIdx].data.length) {
          this.currentSelected.push(dataIdx)
          this.selectedIndex = false;
        }
        else {
          this.selectedIndex = dataIdx;
        }
        this.$emit('select', this.items[itemIdx].data[dataIdx]);
      },
      /**
       * @method unselect
       * @emits unselect
       */
      unselect(){
        this.selectedIndex = false;
        this.currentSelected.pop();
        this.$emit('unselect', this.currentSelected)
      },
      /**
       * @method reset
       */
      reset(){
        this.selectedIndex = false;
        this.currentSelected.splice(0, this.currentSelected.length);
      }
    },
    /**
     * @event mounted
     * @fires getRef
     * @fires $nextTick
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
      /**
       * @watch source
       * @fires reset
       */
      source(){
        this.reset()
      }
    }

  });

})(window.Vue, window.bbn);


</script>
<style scoped>
.bbn-slider-menu {
  overflow: hidden;
}
.bbn-slider-menu .slide {
  width: 100% !important;
  transition: left 0.5s;
}
.bbn-slider-menu .slide ul > li {
  position: relative;
  box-sizing: border-box;
  min-width: 7em;
  white-space: nowrap;
  user-select: none;
}
.bbn-slider-menu .slide ul > li span,
.bbn-slider-menu .slide ul > li a {
  user-select: none;
}
.bbn-slider-menu .slide ul > li.bbn-disabled {
  opacity: 0.7;
}
.bbn-slider-menu .slide ul > li .space {
  display: inline-block;
  width: 1.8em;
  text-align: left;
}
.bbn-slider-menu .slide ul > li .text {
  min-height: 1.2em;
  line-height: 1.2em;
}
.bbn-slider-menu .slide ul > li .text i {
  margin-right: 1em;
}
.bbn-slider-menu .slide ul > li .text.bbn-disabled i {
  opacity: 0.5;
}
.bbn-slider-menu .slide ul > li .text.hidden i {
  opacity: 0 !important;
}

</style>
