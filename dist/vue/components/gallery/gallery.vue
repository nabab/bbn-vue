<template>
<div :class="[componentClass, {'bbn-flex-height': scrollable, 'bbn-gallery-sorting': isSorting}]">
  <div v-if="toolbar"
       class="bbn-l bbn-widget bbn-gallery-toolbar bbn-spadded bbn-vmiddle">
    <component v-if="isObject(toolbar) || isVue(toolbar)"
               :is="toolbar"/>
    <template v-else>
      <div class="bbn-flex-width bbn-vmiddle">
        <div class="bbn-flex-fill">
          <div class="bbn-flex-width bbn-vmiddle">
            <bbn-button v-if="toolbarButtons && toolbarButtons.length"
                        v-for="(btn, idx) in toolbarButtons"
                        :disabled="isSelecting || isSorting"
                        v-bind="btn"
                        :key="idx"/>
            <bbn-button :text="_('Select')"
                        icon="nf nf-mdi-vector_selection"
                        @click="setSelecting('selection')"
                        :notext="buttonsNoText"
                        :disabled="isSelecting || isSorting"
                        v-if="!!selection"/>
            <bbn-button :text="_('Upload')"
                        icon="nf nf-fa-upload"
                        @click="$emit('upload')"
                        v-if="uploadable"
                        :notext="buttonsNoText"
                        :disabled="isSelecting || isSorting"/>
            <bbn-button :text="_('Download')"
                        icon="nf nf-fa-download"
                        @click="setSelecting('download')"
                        v-if="downloadable"
                        :disabled="isSelecting || !total || isSorting"
                        :notext="buttonsNoText"
                        class="bbn-left-xsspace"/>
            <bbn-button :text="_('Delete')"
                        icon="nf nf-fa-trash"
                        @click="setSelecting('delete')"
                        v-if="deletable"
                        :disabled="isSelecting || !total || isSorting"
                        :notext="buttonsNoText"
                        class="bbn-left-xsspace"/>
            <bbn-button :text="_('Order')"
                        icon="nf nf-fa-sort_numeric_asc"
                        @click="isSorting = !isSorting"
                        v-if="sortable && !!uid"
                        :disabled="isSelecting || !total"
                        :notext="buttonsNoText"
                        :class="['bbn-left-xsspace', {'bbn-primary': isSorting}]"/>
            <bbn-button :text="_('Ok')"
                        icon="nf nf-fa-check"
                        @click="emitAction()"
                        v-if="isSelecting"
                        :disabled="!currentSelected.length"
                        :notext="buttonsNoText"
                        class="bbn-left-space"/>
            <bbn-button :text="_('Cancel')"
                        icon="nf nf-fa-times"
                        @click="setSelecting(false)"
                        v-if="isSelecting"
                        :notext="buttonsNoText"
                        class="bbn-left-xsspace"/>
            <div v-if="filterable"
                  class="bbn-flex-fill bbn-hmargin">
              <div class="bbn-flex-width">
                <bbn-input :placeholder="_('Search')"
                           v-model="currentSearch"
                           class="bbn-flex-fill"
                           ref="search"
                           :button-right="!!currentSearch ? 'nf nf-fa-times' : 'nf nf-fa-search'"
                           @clickRightButton="resetSearch"
                           :disabled="isLoading"/>
                <!--<bbn-button icon="nf nf-fa-filter"
                            :text="_('Filter')"
                            :notext="buttonsNoText"
                            @click=""
                            class="bbn-left-xsspace"/>-->
              </div>
            </div>
          </div>
        </div>
        <div class="bbn-vmiddle">
          <bbn-range v-if="resizable"
                     class="bbn-vmiddle"
                     v-model="currentItemWidth"
                     :min="currentMinItemWidth"
                     :max="currentMaxItemWidth"
                     :disabled="isLoading"/>
        </div>
      </div>
    </template>
  </div>
  <div :class="{'bbn-flex-fill': scrollable}">
    <div :class="['bbn-flex-width', {'bbn-overlay': scrollable}]">
      <div v-if="!!currentSelected && currentSelected.length && !!uid"
           class="bbn-gallery-selected-panel bbn-rel">
        <bbn-scroll>
          <div class="bbn-gallery-selected-panel-grid bbn-hxspadded">
            <gallery-selected v-for="(sel, idx) in currentSelected"
                              :source="sel"
                              :key="idx"/>
          </div>
        </bbn-scroll>
      </div>
      <div ref="gallery"
           class="bbn-flex-fill">
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
          <div class="bbn-gallery-columns-container"
               :style="{margin: '0 auto', textAlign: align}">
            <gallery-col v-for="(col, index) in cols"
                        :key="'gallery-col-'+index"
                        :index="index"
                        :source="items.filter((it, i) => {
                            return i % cols === index;
                          })"/>
          </div>
        </component>
      </div>
    </div>
  </div>
  <bbn-pager class="bbn-gallery-pager"
              :element="_self"
              ref="pager"
              v-if="(pageable || isAjax) && !!pager"/>
  <bbn-floater v-if="showFloater"
              :title="false"
              :top="0"
              @close="showFloater = false"
              :closable="true"
              width="100%"
              height="100%"
              :scrollable="false"
              :resizable="false"
              :maximizable="false"
              :component="$options.components.galleryZoom"
              :source="floaterSource"/>
  
</div>
</template>
<script>
  module.exports = // It has a multitude of customizations to better your gallery.
/**
 * @file bbn-gallery component
 * @description bbn-gallery is a component that displays a collection of images.
 * @copyright BBN Solutions
 * @author Mirko Argentino
 */
(bbn => {
  "use strict";

  Vue.component('bbn-gallery', {
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
       * The alternative component for the toolbar.
       * @prop {(Vue|Object|Boolean)} toolbar
       */
      toolbar: {
        type: [Vue, Object, Boolean],
        default: true
      },
      /**
       * Extra buttons to add to begin of the toolbar
       * @prop {Array} [[]] toolbatButtons
       */
      toolbarButtons: {
        type: Array,
        default() {
          return [];
        }
      },
      /**
       * @prop {(Boolean|String)} [false] overlay
       */
      overlay: {
        type: [Boolean, String],
        default: false
      },
      /**
       * Set to true to allow the gallery to be magnifiable.
       * @prop {Boolean} [false] zoomable
       */
      zoomable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to show info on the gallery's footer.
       * @prop {Boolean} [false] info
       */
      info: {
        type: Boolean,
        default: false
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
       * @prop {(Number|String)} [150] itemWidth
       */
      itemWidth: {
        type: [Number, String],
        default: 150
      },
      /**
       * The min width of the items.
       * @prop {Number} minItemWidth
       */
      minItemWidth: {
        type: Number
      },
      /**
       * The width of the items.
       * @prop {Number} maxItemWidth
       */
      maxItemWidth: {
        type: Number
      },
      /**
       * The horizontal alignment of the column.
       * @prop {String} ['center'] align
       */
      align: {
        type: String,
        default: 'center'
      },
      /**
       * Enables the upload possibility
       * @prop {Boolean} [false] uploadable
       */
      uploadable: {
        type: Boolean,
        default: false
      },
      /**
       * Enables the download possibility
       * @prop {Boolean} [false] downloadable
       */
      downloadable: {
        type: Boolean,
        default: false
      },
      /**
       * Enables the delete possibility
       * @prop {Boolean} [false] deletable
       */
      deletable: {
        type: Boolean,
        default: false
      },
      /**
       * Sets the toolbar buttons as notext
       * @prop {Boolean} [false] buttonsNoText
       */
      buttonsNoText: {
        type: Boolean,
        default: false
      },
      /**
       * Displays a preview of items below the slideshow.
       * @prop {Boolean} [true] preview
       */
      preview: {
        type: Boolean,
        default: true
      },
      /**
       * The property that will be used for the image path.
       * @prop {String} ['content'] pathName
       */
      pathName: {
        type: String,
        default: 'content'
      },
      /**
       * The property that will be used for the image overlay.
       * @prop {String} ['verlay] overlayName
       */
      overlayName: {
        type: String,
        default: 'overlay'
      },
      /**
       * The property that will be used for the researc.
       * @prop {String} ['title'] searchName
       */
      searchName: {
        type: String,
        default: 'title'
      },
      /**
       * The item component
       * @prop {(String|Object|Vue)} itemComponent
       */
      itemComponent: {
        type: [String, Object, Vue]
      },
      /**
       * The context menu source of every image
       * @prop {(Function|Array)} buttonMenu
       */
      buttonMenu: {
        type: [Function, Array]
      },
      /**
       * The component used by the context menu items
       * @prop {(String|Object|Vue)} contextComponent
       */
      buttonMenuComponent: {
        type: [String, Object, Vue]
      },
      /**
       * Enables the resize possibility
       * @prop {Boolean} [true] resizable
       */
      resizable: {
        type: Boolean,
        default: true
      },
      /**
       * Set to false to hide the pager.
       * @prop {Boolean} [true] pager
       */
      pager: {
        type: Boolean,
        default: true
      },
      /**
       * The data property name of an item used to sort the items
       * @prop {String} sourceOrder
       */
      sourceOrder: {
        type: String
      },
      /**
       * The data property name of an intem used to open a link
       * @prop {String} ['link'] sourceAction
       */
      sourceAction: {
        type: String,
        default: 'link'
      },
      /**
       * The property that will be used for the image info.
       * @prop {String} ['info'] sourceInfo
       */
       sourceInfo: {
        type: String,
        default: 'info'
      }
    },
    data() {
      return {
        /**
         * The width of the component.
         * @data {Number} [0] width
         */
        width: 0,
        /**
         * True if the gallery is on selection mode.
         * @data {Boolean} [false] isSelecting
         */
        isSelecting: false,
        /**
         * The selection mode.
         * @data {Boolean|String} [false] selectingMode
         */
        selectingMode: false,
        //currentSelected: this.selected,
        /**
         * @data {Boolean} [false] isLoaded
         */
        isLoaded: false,
        /**
         * The current widht of the items
         * @data {Number} currentItemWidth
         */
        currentItemWidth: this.itemWidth,
        /**
         * The current text on the search input
         * @data {String} [''] currentSearch
         */
        currentSearch: '',
        /**
         * The research timeout
         * @data {Number} [0] searchTimeout
         */
        searchTimeout: 0,
        /**
         * The data of the current selected items
         * @data {Array} [[]] currentSelectedData
         */
        currentSelectedData: [],
        /**
         * @data {Boolean} [false] showFloater
         */
        showFloater: false,
        /**
         * @data {Object} [{}] floaterSource
         */
        floaterSource: {},
        /**
         * @data {Boolean} [false] isSorting
         */
        isSorting: false,
        /**
         * @data {Number} currentLimit
         */
        currentLimit: !!this.pageable ? this.limit : 0
      }
    },
    computed: {
      /**
       * The number of columns.
       * @computed cols
       * @return {Number}
       */
      cols() {
        return parseInt(this.lastKnownWidth / (this.currentItemWidth + this.columnGap)) || 1
      },
      /**
       * The data of the current view
       * @computed items
       * @return {Array}
       */
      items() {
        let data = this.filteredData;
        if (this.sortable && !this.serverSorting) {
          data = bbn.fn.order(data, 'data.' + this.sourceOrder, 'asc');
        }
        if (this.pageable
          && this.currentLimit
          && (!this.isAjax || !this.serverPaging)
        ) {
          return data.slice(this.start, this.start + this.currentLimit);
        }
        return data;
      },
      /**
       * The min item width
       * @computed currentMinItemWidth
       * @return {Number}
       */
      currentMinItemWidth() {
        let mw = this.itemWidth - 200;
        return this.minItemWidth || (mw > 50 ? mw : 50);
      },
      /**
       * The max item width
       * @computed currentMaxItemWidth
       * @return {Number}
       */
      currentMaxItemWidth() {
        return this.minItemWidth || (this.itemWidth + 200);
      }
    },
    methods: {
      /**
       * Alias of bbn.fn.isObject.
       * @method isObject
       * @return {Boolean}
      */
      isObject: bbn.fn.isObject,
      /**
       * Alias of bbn.fn.isVue.
       * @method isVue
       * @return {Boolean}
      */
      isVue: bbn.fn.isVue,
      /**
         * Alias of bbn.fn.correctCase.
         * @method correctCase
         * @return {string}
        */
      correctCase: bbn.fn.correctCase,
      /**
       * Sets the selectingMode data property.
       * @method setSelecting
       * @param {String} mode
       */
      setSelecting(mode) {
        if (bbn.fn.isString(mode)) {
          this.isSelecting = true;
          this.selectingMode = mode;
        }
        else {
          this.isSelecting = false;
          this.selectingMode = false;
          this.currentSelected.splice(0);
          this.currentSelectedData.splice(0);
        }
      },
      /**
       * Manages actions based on the data property selectingMode.
       * @method action
       * @fires setSelecting
       */
      emitAction() {
        if (this.currentSelected.length) {
          let mess = '';
          if (this.selectingMode === 'download') {
            mess = bbn._("Are you sure you want to download these photos?");
          }
          else if (this.selectingMode === 'delete') {
            mess = bbn._("Are you sure you want to delete these photos?");
          }
          if (mess.length) {
            this.confirm(mess, () => {
              this.$emit(this.selectingMode, this.currentSelectedData);
              this.setSelecting(false);
            });
          }
          else {
            this.$emit(this.selectingMode, this.currentSelectedData);
            this.setSelecting(false);
          }
        }
      },
      resetSearch() {
        this.currentSearch = '';
      }
    },
    /**
     * @event mounted
     * @fires onResize
     */
    mounted() {
      this.$nextTick(() => {
        this.ready = true;
      });
    },
    watch: {
      /**
       * @watch currentSearch
       */
      currentSearch(newVal) {
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
          let idx = bbn.fn.search(this.currentFilters.conditions, { field: this.searchName });
          bbn.fn.log(idx)
          if (idx > -1) {
            if (newVal) {
              this.currentFilters.conditions[idx].value == newVal;
            }
            else {
              this.currentFilters.conditions.splice(idx, 1)
            }
          }
          else if (newVal) {
            this.currentFilters.conditions.push({
              field: this.searchName,
              operator: 'contains',
              value: newVal
            })
          }
        }, 1000)
      },
      itemWidth(val) {
        this.currentItemWidth = val;
      },
      showFloater(val) {
        if (!val) {
          this.floaterSource = {};
        }
      }
    },
    components: {
      /**
       * @component gallery-col
       */
      galleryCol: {
        name: 'gallery-col',
        template: `
<div :style="colStyle">
  <component :is="gallery.itemComponent || 'gallery-item'"
             v-for="(item, idx) in source"
             :source="item"
             :key="'gallery-item-'+index+'-'+idx"/>
</div>`,
        props: {
          /**
           * The source of the component 'gallery-col'.
           * @prop {Array} [[]] source
           * @memberof gallery-col
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
           * @memberof gallery-col
           */
          index: {
            type: Number
          }
        },
        computed: {
          /**
           * The parent gallery component.
           * @computed gallery
           * @memberof gallery-col
           * @return {Object}
           */
          gallery() {
            return this.closest('bbn-gallery');
          },
          /**
           * The style object of the column.
           * @computed colStyle
           * @memberof gallery-col
           * @return {Object}
           */
          colStyle() {
            return {
              width: `${this.gallery.currentItemWidth}px`,
              margin: `0 ${this.gallery.columnGap / 2}px`,
              verticalAlign: 'top',
              display: 'inline-block'
            }
          }
        },
        components: {
          /**
           * @component galleryItem
           * @memberof gallery-col
           */
          galleryItem: {
            name: 'gallery-item',
            template: `
<a v-if="!col.gallery.isLoading"
    :class="['bbn-gallery-item', 'bbn-box', {'bbn-primary': isSelected, 'bbn-p': !!col.gallery.zoomable}]"
    @click="action"
    @contextmenu="onContext"
    :style="aStyle"
    v-draggable="!!col.gallery.isSorting && !!col.gallery.uid"
    v-droppable="!!col.gallery.isSorting && !!col.gallery.uid"
    @drop="changeOrder">
  <span :class="{
          'bbn-spadded': !loaded,
          'bbn-c': !loaded
        }"
        style="display: block">
    <img :src="imgSrc"
         @load="loaded = true"
         @error="error = true"
         :class="{
           'bbn-radius': !col.gallery.isSorting,
           'bbn-gallery-item-selected': isSelected,
           'bbn-invisible': !loaded
         }"
         :style="imgStyle"
         :alt="(source.caption ? source.caption + ' - ' : '') + (source.text ? source.text + ' - ' : '') + (source.tags || []).join(' | ')"
         :draggable="!col.gallery.isSorting">
    <bbn-loadicon class="bbn-gallery-item-loading bbn-c"
                  v-if="!loaded && !error"/>
    <i v-else-if="error && !loaded" class="bbn-red nf nf-mdi-image_off"/>
    <span v-if="showOverlay && loaded"
          class="bbn-gallery-overlay bbn-widget bbn-ellipsis bbn-radius-bottom bbn-hxspadded"
          v-text="source.data[col.gallery.overlayName]"
          :title="source.data[col.gallery.overlayName]"/>
    <i v-if="col.gallery.zoomable && loaded && !col.gallery.isSelecting && !col.gallery.isSorting"
       class="bbn-gallery-zoverlay nf nf-fa-search"/>
    <bbn-context v-if="showOverlay && !!col.gallery.buttonMenu && loaded && !col.gallery.isSelecting && !col.gallery.isSorting"
                 tag="div"
                 class="bbn-block bbn-top-left bbn-top-smargin bbn-left-smargin"
                 :source="!!col.gallery.buttonMenu
                   ? (isFunction(col.gallery.buttonMenu)
                     ? col.gallery.buttonMenu(source.data, source.index, source.key)
                     : col.gallery.buttonMenu)
                   : []"
                 :attach="buttonMenuElement"
                 :item-component="col.gallery.contextComponent"
                 @hook:mounted="buttonMenuElement = getRef('itemMenu') || undefined"
                 ref="menuButton">
        <div class="bbn-block">
          <i class="bbn-gallery-button-menu nf nf-mdi-menu"
             ref="itemMenu"/>
        </div>
    </bbn-context>
  </span>
  <div v-if="col.gallery.sortable && col.gallery.isSorting && col.gallery.sourceOrder"
        v-text="source.data[col.gallery.sourceOrder]"
        class="bbn-b bbn-gallery-item-position bbn-lg"/>
</a>
            `,
            props: {
              /**
               * The source of the compoment 'gallery-item'.
               * @prop {String|Object} source
               * @memberof gallery-item
               */
              source: {
                type: [String, Object]
              }
            },
            data() {
              return {
                /**
                 * True if the gallery-item is loaded.
                 * @data {Boolean} [false] loaded
                 * @memberof gallery-item
                 */
                loaded: false,
                /**
                 * The element to which the context menu is attached
                 * @data {HTMLElement} [undefined] buttonMenuElement
                 * @memberof gallery-item
                 */
                buttonMenuElement: undefined,
                error: false,
              }
            },
            computed: {
              /**
               * The parent component 'gallery-col'.
               * @computed col
               * @memberof gallery-item
               * @return {Vue}
               */
              col() {
                return this.closest('gallery-col');
              },
              /**
               * The style object of the item.
               * @computed aStyle
               * @memberof gallery-item
               * @return {Object}
               */
              aStyle() {
                let style = {
                  margin: `0 0 ${this.col.gallery.rowGap}px 0`,
                  border: this.isSelected ? '5px dotted' : (this.col.gallery.isSorting ? '5px var(--primary-border) solid' : ''),
                };
                if (!this.col.gallery.zoomable && !this.hasLink) {
                  style.cursor = 'default';
                }
                return style;
              },
              /**
               * The style object of the image.
               * @computed imgStyle
               * @memberof gallery-item
               * @return {Object}
               */
              imgStyle() {
                return {
                  width: this.loaded ? '100%' : 0,
                  height: this.loaded ? '' : 0,
                  margin: 0,
                  display: 'block',
                  visibility: this.loaded ? 'visible' : 'hidden',
                  '-webkit-user-drag': !this.col.gallery.isSorting
                }
              },
              /**
               * True if the source of the component is an object.
               * @computed isObj
               * @return {Boolean}
               * @memberof gallery-item
               */
              isObj() {
                return bbn.fn.isObject(this.source);
              },
              /**
               * If true, shows the overlay.
               * @computed showOverlay
               * @return {Boolean}
               * @memberof gallery-item
               */
              showOverlay() {
                return this.col.gallery.overlay && this.isObj && (this.source.data[this.col.gallery.overlayName] !== undefined);
              },
              /**
               * True if the item is selected.
               * @computed isSelected
               * @return {Boolean}
               * @memberof gallery-item
               */
              isSelected() {
                return this.col.gallery.currentSelected.includes(!!this.col.gallery.uid ? this.source.data[this.col.gallery.uid] : this.source.index);
              },
              /**
               * The image source
               * @computed imgSrc
               * @memberof gallery-item
               * @return {String}
               */
              imgSrc() {
                let src = '';
                if (bbn.fn.isString(this.source.data)) {
                  src = this.source.data;
                }
                else {
                  let prop = this.col.gallery.pathName || 'thumb' || 'content';
                  if (this.source.data[prop]) {
                    src = this.source.data[prop];
                  }
                }
                if (src && bbn.fn.isString(src)) {
                  return bbn.fn.escapeUrl(src, 'w=' + this.col.gallery.currentItemWidth + '&thumb=1');
                }
                return null;
              },
              floaterSource() {
                return {
                  data: bbn.fn.map(this.col.gallery.currentData, d => {
                    let obj = bbn.fn.extend(true, {}, d.data);
                    obj.content = obj[this.col.gallery.pathName];
                    obj.type = 'img';
                    obj.mode = 'original';
                    if (!obj[this.col.gallery.sourceInfo]) {
                      obj[this.col.gallery.sourceInfo] = obj[this.col.gallery.overlayName];
                    }
                    return obj;
                  }),
                  info: this.col.gallery.info,
                  sourceInfo: this.col.gallery.sourceInfo,
                  slide: this.source.index,
                  preview: this.col.gallery.preview
                }
              },
              hasLink() {
                return this.col.gallery.sourceAction
                  && !!this.source.data[this.col.gallery.sourceAction];
              }
            },
            methods: {
              onContext(ev) {
                let menuButton = this.getRef('menuButton');
                if (menuButton) {
                  ev.preventDefault();
                  ev.stopImmediatePropagation();
                  menuButton.click();
                }
              },
              /**
               * Alias of bbn.fn.isFunction method
               * @methods isFunction
               * @memberof gallery-item
               */
              isFunction: bbn.fn.isFunction,
              /**
               * Manages the actions.
               * @methods action
               * @memberof gallery-item
               * @fires getPopup
               */
              action(ev) {
                if (this.col.gallery.isSelecting) {
                  let id = !!this.col.gallery.uid ? this.source.data[this.col.gallery.uid] : this.source.index;
                  if (this.isSelected) {
                    this.col.gallery.currentSelected.splice(this.col.gallery.currentSelected.indexOf(id), 1);
                    if (!!this.col.gallery.uid) {
                      let idx = bbn.fn.search(this.col.gallery.currentSelectedData, this.col.gallery.uid, id);
                      if (idx > -1) {
                        this.col.gallery.currentSelectedData.splice(idx, 1);
                      }
                    }
                  }
                  else {
                    this.col.gallery.currentSelected.push(id);
                    if (!!this.col.gallery.uid) {
                      this.col.gallery.currentSelectedData.push(this.source.data);
                    }
                  }
                }
                else if (!ev.target.classList.contains('bbn-gallery-button-menu')
                  && (!ev.target.closest('.bbn-floater-list'))
                  && this.col.gallery.zoomable
                ) {
                  this.col.gallery.floaterSource = this.floaterSource;
                  this.col.gallery.showFloater = true;
                }
                else if (this.hasLink) {
                  bbn.fn.link(this.source.data[this.col.gallery.sourceAction]);
                }
                else {
                  this.col.gallery.$emit('clickItem', this.source);
                }
              },
              changeOrder(ev) {
                ev.preventDefault();
                let sortEvent = new Event('sort', {cancelable: true}),
                    data = ev.detail.from.originalElement.__vue__.source.data,
                    pos = data[this.col.gallery.sourceOrder],
                    posNew = this.source.data[this.col.gallery.sourceOrder];
                this.col.gallery.$emit('sort', sortEvent, {
                  [data[this.col.gallery.uid]]: posNew,
                  [this.source.data[this.col.gallery.uid]]: pos
                });
                if (!sortEvent.defaultPrevented) {
                  this.$set(data, this.col.gallery.sourceOrder, posNew);
                  this.source.data[this.col.gallery.sourceOrder] = pos;
                }
              }
            }
          }
        }
      },
      /**
       * @component gallery-zoom
       */
      galleryZoom: {
        name: 'gallery-zoom',
        template: `
<div class="bbn-overlay bbn-gallery-zoom">
  <bbn-slideshow :source="source.data"
                :show-info="source.info"
                :source-info="source.sourceInfo"
                :arrows="true"
                :show-count="true"
                :full-slide="true"
                :initial-slide="source.slide"
                :preview="source.preview"
                :keyboard="true"/>
</div>
                `,
        props: {
          /**
           * The source of the component 'gallery-zoom'.
           * @prop {String|Object} source
           */
          source: {
            type: [String, Object]
          }
        }
      },
      /**
       * @component gallery-selected
       */
      gallerySelected: {
        name: 'gallery-selected',
        template: `
<div class="bbn-rel">
  <i class="bbn-top-right nf nf-fa-close bbn-red bbn-vxspadded bbn-hspadded bbn-lg bbn-p"
     @click="unselect"/>
  <img :src="imgSrc"
       class="bbn-radius bbn-bordered"
       :alt="altSrc">
</div>
        `,
        props: {
          /**
           * @prop {String|Number} source
           * @memberof gallery-selected
           */
          source: {
            type: [String, Number],
            required: true
          }
        },
        computed: {
          /**
           * @computed altSrc
           * @memberof gallery-selected
           * @fires bbn.fn.basename
           * @return {String}
           */
          altSrc() {
            return bbn.fn.baseName(this.imgSrc);
          },
          /**
           * @computed gallery
           * @memberof gallery-selected
           * @fires closest
           * @return {Vue}
           */
          gallery() {
            return this.closest('bbn-gallery');
          },
          /**
           * @computed imgSrc
           * @memberof gallery-selected
           * @return {String|null}
           */
          imgSrc() {
            if (this.gallery) {
              let data = {},
                src = '';
              if (!!this.gallery.uid) {
                data = bbn.fn.getRow(this.gallery.currentSelectedData, this.gallery.uid, this.source);
              }
              if (bbn.fn.isString(data)) {
                src = data;
              }
              else {
                let prop = this.gallery.pathName || 'thumb' || 'content';
                if (data[prop]) {
                  src = data[prop];
                }
              }

              if (src && bbn.fn.isString(src)) {
                return bbn.fn.escapeUrl(src, 'w=70&thumb=1');
              }
            }
            return null;
          }
        },
        methods: {
          /**
           * @method unselect
           * @memberof gallery-selected
           */
          unselect() {
            if (this.gallery) {
              this.gallery.currentSelected.splice(this.gallery.currentSelected.indexOf(this.source), 1);
            }
          }
        }
      }
    }
  })
})(bbn);

</script>
<style scoped>
.bbn-gallery a.bbn-gallery-item {
  -webkit-transition: all 0.1s ease-in;
  -moz-transition: all 0.1s ease-in;
  -o-transition: all 0.1s ease-in;
  -transition: all 0.1s ease-in;
  transition: all 0.1s ease-in;
}
.bbn-gallery a.bbn-gallery-item {
  position: relative;
  display: block;
}
.bbn-gallery a.bbn-gallery-item .bbn-gallery-item-loading,
.bbn-gallery a.bbn-gallery-item .bbn-gallery-item-loading * {
  -webkit-transition: unset;
  -moz-transition: unset;
  -o-transition: unset;
  -transition: unset;
  transition: unset;
}
.bbn-gallery a.bbn-gallery-item span.bbn-gallery-overlay {
  position: absolute;
  left: 0;
  bottom: 0;
  text-align: center;
  opacity: 0.7;
  width: 100%;
  line-height: 1.7rem;
  display: block;
  font-weight: bold;
  box-sizing: border-box;
}
.bbn-gallery a.bbn-gallery-item i.bbn-gallery-zoverlay {
  font-size: 2rem;
  color: white;
  left: 50%;
  margin-left: -10px;
  margin-top: -10px;
  opacity: 0;
  position: absolute;
  top: 50%;
  transition: opacity 0.3s ease 0s;
  text-shadow: 1px 1px black;
}
.bbn-gallery a.bbn-gallery-item:hover i.bbn-gallery-zoverlay {
  opacity: 1;
}
.bbn-gallery a.bbn-gallery-item:hover img:not(.bbn-gallery-item-selected) {
  filter: grayscale(1);
}
.bbn-gallery a.bbn-gallery-item i.bbn-gallery-button-menu {
  font-size: 1.5rem;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease 0s;
  text-shadow: 1px 1px black;
}
.bbn-gallery a.bbn-gallery-item:hover i.bbn-gallery-button-menu {
  opacity: 1;
}
.bbn-gallery a.bbn-gallery-item .bbn-gallery-item-position {
  background-color: var(--primary-border);
  color: var(--primary-text);
}
.bbn-gallery a.bbn-gallery-item.bbn-droppable-over {
  border-color: var(--secondary-border) !important;
}
.bbn-gallery a.bbn-gallery-item.bbn-droppable-over .bbn-gallery-item-position {
  background-color: var(--secondary-border) !important;
  color: var(--secondary-text) !important;
}
.bbn-gallery.bbn-gallery-sorting .bbn-gallery-item span {
  display: block;
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 1;
}
.bbn-gallery.bbn-gallery-sorting .bbn-gallery-item span img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}
.bbn-gallery div.bbn-gallery-pager {
  margin-top: 10px;
}
.bbn-gallery div.bbn-gallery-toolbar {
  margin-bottom: 10px;
}
.bbn-gallery div.bbn-gallery-selected-panel {
  min-width: 150px;
}
.bbn-gallery div.bbn-gallery-selected-panel .bbn-gallery-selected-panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  justify-items: center;
}
.bbn-gallery div.bbn-gallery-selected-panel .bbn-gallery-selected-panel-grid img {
  width: 70px;
  height: auto;
  object-fit: contain;
}
div.bbn-gallery-zoom div.bbn-slideshow-arrow-left,
div.bbn-gallery-zoom div.bbn-slideshow-arrow-right {
  padding: 0 10px !important;
}
div.bbn-gallery-zoom div.bbn-slideshow-count {
  padding: 10px !important;
}

</style>
