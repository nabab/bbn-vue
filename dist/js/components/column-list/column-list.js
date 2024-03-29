(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-radius', {'collapsed': collapsed}]"
      :key="index"
      :style="{width: !collapsed ? width : '', height: scrollable ? '100%' : 'auto'}"
      v-show="isVisible">
  <div :class="['bbn-column-list-container', 'bbn-radius', 'bbn-background', 'bbn-rel', {
          'bbn-flex-height': !!scrollable
        }]"
        :style="{
          backgroundColor: !!backgroundColor ? (backgroundColor + ' !important') : '',
          height: '100%',
          width: '100%'
        }">
    <div :class="['bbn-column-list-header', 'bbn-spadded', , 'bbn-vmiddle', 'bbn-unselectable', {
           'bbn-flex-width': !collapsed,
           'bbn-flex-height': collapsed
         }]"
         v-if="headerVisible">
      <bbn-button v-if="collapsable && collapsed"
                  class="bbn-no-border"
                  :notext="true"
                  :text="_('Expand')"
                  icon="nf nf-mdi-arrow_expand"
                  @click="expand"
                  style="height: auto; width: 100%; aspect-ratio: 1"/>
      <div :class="['bbn-column-list-title', 'bbn-upper', 'bbn-b', 'bbn-tertiary-text-alt', 'bbn-unselectable', 'bbn-m', 'bbn-ellipsis', {
             'bbn-left-space': !collapsed,
             'bbn-top-space': collapsed,
             'bbn-right-lspace': !collapsed,
             'bbn-bottom-lspace': collapsed,
             'verticaltext': collapsed,
             'bbn-flex-fill': !toolbar
           }]"
           v-text="title"
           :title="title"
           :style="{
             color: !!fontColor ? (fontColor + ' !important') : '',
             maxHeight: isMobile && collapsed ? '20rem' : '',
             letterSpacing: collapsed ? (isMobile ? '' : '-0.2rem') : ''
           }"
           v-if="title !== undefined"/>
      <div class="bbn-column-list-toolbar bbn-alt-background bbn-vmiddle bbn-xspadded bbn-radius bbn-flex-fill"
          :style="{
            'min-height': !collapsed ? '2rem' : '4rem',
            'justify-content': 'flex-end',
            'align-items': collapsed ? 'flex-end': ''
          }"
          v-if="toolbar">
        <component :is="toolbar"
                   :source="toolbarSource || (!isAjax ? source : undefined)"
                   :total="total"
                   class="bbn-vmiddle"
                   :style="{'flex-direction': collapsed ? 'column': ''}"/>
      </div>
      <bbn-button v-if="collapsable && !collapsed"
                  class="bbn-no-border bbn-left-space"
                  :notext="true"
                  :text="_('Collapse')"
                  icon="nf nf-mdi-arrow_collapse"
                  @click="collapse"
                  style="height: 100%; width: auto; aspect-ratio: 1"/>
    </div>
    <div v-if="!collapsed"
        :class="['bbn-column-list-main', 'bbn-vpadded', 'bbn-rel', {'bbn-flex-fill': !!scrollable}]"
        style="width: 100%">
      <div class="bbn-rel"
           style="width: 100%; height: 100%">
        <bbn-loader v-if="isLoading"
                    class="bbn-column-list-loader bbn-margin bbn-background"/>
        <component v-else
                   :is="scrollable ? 'bbn-scroll' : 'div'"
                   axis="y"
                   ref="scroll">
          <div :class="['bbn-column-list-items', 'bbn-hpadded', {
                 'bbn-overlay': !!scrollable,
                 'bbn-middle': !!scrollable && !items.length
                }]">
            <template v-if="items.length">
              <div v-for="(item, itemIdx) in items"
                  :class="[
                    'bbn-column-list-item',
                    'bbn-radius',
                    {
                      'bbn-bottom-space': !!items[itemIdx+1]
                    }
                  ]"
                  :key="itemIdx">
                <component :is="component"
                           :source="item.data"
                           :index="item.index"
                           v-bind="componentOptions"
                           :key="!!uid && item.data && (item.data[uid] !== undefined) ? item.data[uid] : itemIdx"/>
              </div>
            </template>
            <div v-else-if="isLoaded && !!noData"
                 class="bbn-c bbn-background bbn-radius bbn-spadded"
                 v-text="noData"/>
          </div>
        </component>
      </div>
    </div>
    <div v-if="!collapsed && pageable"
          class="bbn-column-list-footer">
      <bbn-pager :element="_self"
                 :limit="false"/>
    </div>
  </div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-column-list');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/column-list/column-list.css');
document.head.insertAdjacentElement('beforeend', css);

(bbn => {
  "use strict";
  Vue.component('bbn-column-list', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.keepCoolComponent
     * @mixin bbn.vue.resizerComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent,
      bbn.vue.keepCoolComponent,
      bbn.vue.resizerComponent
    ],
    props: {
      /**
       * @prop {Number} index
       */
      index: {
        type: Number
      },
      /**
       * @prop {Boolean} [false] collapsable
       */
      collapsable: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Boolean} [false] autoCollapse
       */
      autoCollapse: {
        type: Boolean,
        default: false
      },
      /**
       * The width
       * @prop {Number|String} ['100%'] width
       */
      width: {
        type: [Number, String],
        default: '100%'
      },
      /**
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {String} backgroundColor
       */
      backgroundColor: {
        type: String
      },
      /**
       * @prop {String} fontColor
       */
      fontColor: {
        type: String
      },
      /**
       * @prop {String} title
       */
      title: {
        type: String
      },
      /**
       * @prop {String|Vue|Object} toolbar
       */
      toolbar: {
        type: [String, Vue, Object]
      },
      /**
       * @prop {Object} toolbarSource
       */
      toolbarSource: {
        type: Object
      },
      /**
       * The options for the component
       * @prop {Object} componentOptions
       */
      componentOptions: {
        type: Object
      },
      /**
       * @prop {Boolean} [false] startHidden
       */
      startHidden: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        /**
         * @data {Boolean} isVisible
         */
        isVisible: !this.startHidden,
        /**
         * @data {Boolean} [false] collapsed
         */
        collapsed: false
      }
    },
    computed: {
      /**
       * @computed items
       */
      items(){
        if (this.pageable && (!this.isAjax || !this.serverPaging)) {
          return this.filteredData.slice().splice(this.start, this.currentLimit);
        }
        return this.filteredData;
      },
      /**
       * @computed headerVisible
       */
      headerVisible(){
        return !!this.collapsable || (this.title !== undefined) || !!this.toolbar;
      }
    },
    methods: {
      /**
       * @method setCheckCollapse
       * @param {Boolean} force
       * @fires $once
       * @fires expand
       * @fires collapse
       */
      setCheckCollapse(force){
        if (this.autoCollapse || force) {
          this.$once('dataloaded', () => {
            if (this.filteredData.length) {
              this.expand(force);
            }
            else {
              this.collapse(force);
            }
          });
        }
      },
      /**
       * @method expand
       * @param {Boolean} force
       * @emits expanded
       */
      expand(force){
        if (this.collapsable || force) {
          this.collapsed = false;
          this.$emit('expanded', this);
        }
      },
      /**
       * @method collapse
       * @param {Boolean} force
       * @emits collapsed
       */
      collapse(force){
        if (this.collapsable || force) {
          this.collapsed = true;
          this.$emit('collapsed', this);
        }
      },
      /**
       * @method expandAll
       * @fires findAll
       */
      expandAll(){
        if (!!this.component && this.currentData.length) {
          let items = this.findAll(this.component);
          bbn.fn.each(items, item => {
            item.$set(item, 'collapsed', false);
          });
        }
      },
      /**
       * @method collapsedAll
       * @fires findAll
       */
      collapseAll(){
        if (!!this.component && this.currentData.length) {
          let items = this.findAll(this.component);
          bbn.fn.each(items, item => {
            item.$set(item, 'collapsed', true);
          });
        }
      }
    },
    /**
     * @event beforeMount
     * @fires setCheckCollapse
     * @emits beforemount
     */
    beforeMount(){
      if (this.collapsable) {
        this.setCheckCollapse();
      }
      this.$emit('beforemount', this);
    },
    /**
     * @event mounted
     * @fires $nextTick
     */
    mounted(){
      this.$nextTick(() => {
        this.ready = true;
      });
    },
    /**
     * @event beforeDestroy
     * @emits beforedestroy
     */
    beforeDestroy(){
      this.$emit('beforedestroy', this);
    },
    watch: {
      /**
       * @watch data
       * @fires updateData
       */
      data: {
        deep: true,
        handler(){
          this.updateData();
        }
      },
      /**
       * @watch isLoaded
       * @fires $once
       */
      isLoaded: {
        immediate: true,
        handler(newVal){
          if (this.startHidden) {
            this.$once('dataloaded', () => {
              this.isVisible = true;
            });
          }
        }
      },
      /**
       * @watch currentPage
       * @fires closest
       * @fires $once
       */
      currentPage(newVal){
        if (!this.scrollable) {
          let externalScroll = this.closest('bbn-scroll');
          if (externalScroll && externalScroll.hasScrollY) {
            this.$once('dataloaded', () => {
              externalScroll.scrollTo(null, this.$el);
            })
          }
        }
      }
    }
  });
})(bbn);
if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}