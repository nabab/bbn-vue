((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, {'bbn-ovaerlay': scrollable}]">
  <slot></slot>
  <div v-if="isLoading"
      :class="['bbn-background', 'bbn-middle', 'bbn-padded', {
        'bbn-overlay': scrollable,
      }]">
    <bbn-loadicon class="bbn-vmiddle"
                  :size="24"/>
    <span class="bbn-xl bbn-b bbn-left-sspace"
          v-text="_('Loading') + '...'"/>
  </div>
  <component :is="scrollable ? 'bbn-scroll' : 'div'"
             v-else-if="total">
    <div class="bbn-masonry-columns-container"
         :style="containerStyle">
      <masonry-col v-for="(col, index) in cols"
                   :key="'masonry-col-' + index"
                   :index="index"
                   :source="items.filter((it, i) => {
                     return i % cols === index;
                   })"
                   inline-template>
        <div :style="colStyle"
             class="bbn-masonry-column">
          <masonry-item v-for="(item, idx) in source"
                        :source="item"
                        :key="'masonry-item-' + index + '-' + idx"
                        inline-template>
            <div class="bbn-masonry-column-item"
                 :style="itemStyle">
              <component :is="source.data.component"
                         :source="source.data.source"
                         v-if="!source.slot"/>
              <div v-else
                   v-html="source.content"/>
            </div>
          </masonry-item>
        </div>
      </masonry-col>
    </div>
  </component>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-masonry');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

/**
 * @file bbn-masonry component
 * @description bbn-masonry
 * @copyright BBN Solutions
 * @author Mirko Argentino
 */
 (bbn => {
  "use strict";

  if (Vue.options.components['bbns-masonry'] === undefined) {
    Vue.component('bbns-masonry', {
      template: '<div class="bbns-masonry bbn-hidden"><slot></slot></div>'
    });
  }

  Vue.component('bbn-masonry', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.listComponent
     */
    mixins:
      [
        bbn.vue.basicComponent,
        bbn.vue.resizerComponent,
        bbn.vue.listComponent
      ],
    props: {
      /**
       * Set to true to allow the component to have a scroll.
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * The gap between the columns.
       * @prop {Number} [20] columnGap
       */
      columnGap: {
        type: Number,
        default: 20
      },
      /**
       * The gap between the rows.
       * @prop {Number} [20] rowGap
       */
      rowGap: {
        type: Number,
        default: 20
      },
      /**
       * The minimum number of columns allowed.
       * @prop {Number} [1] minCol
       */
      minCol: {
        type: Number,
        default: 1
      },
      /**
       * The maximum number of columns allowed.
       * @prop {Number} maxCol
       */
      maxCol: {
        type: Number
      },
      /**
       * The width of the items.
       * @prop {Number} [350] itemWidth
       */
      itemWidth: {
        type: Number,
        default: 350
      },
    },
    data(){
      return {
        fromSlot: []
      }
    },
    computed: {
      /**
       * The number of columns.
       * @computed cols
       * @return {Number}
       */
      cols() {
        return parseInt(this.lastKnownWidth / (this.itemWidth + this.columnGap)) || 1
      },
      /**
       * @computed containerStyle
       * @return {Object}
       */
      containerStyle(){
        return {
          gridTemplateColumns: `repeat(${this.cols}, 1fr)`,
          gridGap: `${this.columnGap}px`
        }
      },
      items(){
        let d = [...this.currentData];
        if (this.fromSlot.length) {
          let idx = this.currentData.length;
          bbn.fn.each(this.fromSlot, s => {
            d.push({
              index: idx,
              slot: true,
              content: s.content
            });
            idx++;
          })
        }
        return d;
      }
    },
    /**
     * @event mounted
     * @fires $nextTick
     */
     mounted() {
      this.$nextTick(() => {
        /*
        if (this.$slots.default) {
          let toData = [];
          for (let node of this.$slots.default) {
            if (!!node.componentOptions
              && (node.componentOptions.tag === 'bbns-masonry')
              ) {
              toData.push({
                content: node.elm.innerHTML.trim()
              });
            }
          }
          this.fromSlot.push(...toData);
        }
        */
        this.ready = true;
      });
    },
    components: {
      slotItem: {
        name: 'bbns-masonry'
      },
      masonryCol: {
        name: 'masonry-col',
        props: {
          /**
           * The source of the component 'masonry-col'.
           * @prop {Array} [[]] source
           * @memberof masonry-col
           */
          source: {
            type: Array,
            default() {
              return [];
            }
          },
          /**
           * The index of the column.
           * @prop {Number} index
           * @memberof masonry-col
           */
          index: {
            type: Number
          }
        },
        computed: {
          /**
           * The parent masonry component.
           * @computed masonry
           * @memberof masonry-col
           * @return {Object}
           */
          masonry() {
            return this.closest('bbn-masonry');
          },
          /**
           * The style object of the column.
           * @computed colStyle
           * @memberof masonry-col
           * @return {Object}
           */
          colStyle() {
            return {
              width: '100%',
              margin: `0 ${(this.index + 1) < this.masonry.cols ? this.masonry.columnGap : 0}px 0 0`,
              verticalAlign: 'top',
              display: 'inline-block'
            }
          }
        },
        components: {
          /**
           * @component masonryItem
           * @memberof masonry-col
           */
          masonryItem: {
            name: 'masonry-item',
            props: {
              /**
               * The source of the compoment 'masonry-item'.
               * @prop {String|Object} source
               * @memberof masonry-item
               */
              source: {
                type: [String, Object]
              }
            },
            computed: {
              /**
               * The parent component 'masonry-col'.
               * @computed col
               * @memberof masonry-item
               * @return {Vue}
               */
              col() {
                return this.closest('masonry-col');
              },
              itemStyle(){
                return {
                  marginBottom: this.col.index < this.col.masonry.cols ? this.col.masonry.rowGap + 'px' : 0
                }
              }
            }
          }
        }
      }
    }
  });
})(bbn);

})(bbn);