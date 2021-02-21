(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, {'bbn-flex-height': scrollable}]">
  <div v-if="isToolbarShown"
       class="bbn-l bbn-widget bbn-gallery-toolbar bbn-spadded"
  >
    <component v-if="toolbar && (isObject(toolbar) || isVue(toolbar))"
               :is="toolbar"
    ></component>
    <template v-else>
      <div class="bbn-flex-width">
        <div class="bbn-flex-fill">
          <div class="bbn-flex-width">
            <bbn-button :text="_('Upload')"
                        icon="nf nf-fa-upload"
                        @click="uploadButton"
                        v-if="uploadButton"
                        :notext="buttonsNoText"
                        :disabled="isSelecting"/>
            <bbn-button :text="_('Download')"
                        icon="nf nf-fa-download"
                        @click="setSelecting('download')"
                        v-if="downloadButton"
                        :disabled="isSelecting || !total"
                        :notext="buttonsNoText"
                        class="bbn-left-xsspace"/>
            <bbn-button :text="_('Remove')" 
                        icon="nf nf-fa-trash"
                        @click="setSelecting('remove')"
                        v-if="removeButton"
                        :disabled="isSelecting || !total"
                        :notext="buttonsNoText"
                        class="bbn-left-xsspace"/>
            <bbn-button :text="_(correctCase(selectingMode))"
                        icon="nf nf-fa-check"
                        @click="action"
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
              <bbn-input :placeholder="_('Search')"
                          v-model="currentSearch"
                          class="bbn-w-100"
                          ref="search"/>
            </div>
          </div>
        </div>
        <div class="bbn-vmiddle">
          <bbn-range class="bbn-vmiddle"
                     v-model="currentItemWidth"
                     :min="itemWidth - 100"
                     :max="itemWidth + 100"/>
        </div>
      </div>
    </template>
  </div>
  <div ref="gallery" :class="{'bbn-flex-fill': scrollable}">
    <component :is="scrollable ? 'bbn-scroll' : 'div'"
               v-if="total"
    >
      <div :style="{margin: '0 auto', textAlign: align}">
        <gallery-col v-for="(col, index) in cols"
                     :key="'gallery-col-'+index"
                     :index="index"
                     :source="currentView.filter((it, i) => {
                        return i % cols === index;
                      })"
        ></gallery-col>
      </div>
    </component>
  </div>
  <bbn-pager class="bbn-gallery-pager"
              :element="_self"
              ref="pager"
              v-if="pageable || isAjax"
  ></bbn-pager>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-gallery');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/gallery/gallery.css");
document.head.insertAdjacentElement('beforeend', css);
// It has a multitude of customizations to better your gallery.
/**
 * @file bbn-gallery component
 * @description bbn-gallery is a component that displays a collection of images.
 * @copyright BBN Solutions
 * @author Mirko Argentino
 */
((bbn) => {
  "use strict";

  Vue.component('bbn-gallery', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.listComponent
     */
    mixins: [
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
       * @props {Vue|Object|Boolean} toolbar
       */
      toolbar: {
        type: [Vue, Object, Boolean],
        default: true
      },
      /**
       * @prop {Boolean|String} [false] overlay
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
       * @prop {Number} [150] itemWidth
       */
      itemWidth: {
        type: Number,
        default: 150
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
       * The function called when the toolbar's upload button is clicked.
       * @prop {Function} uploadButton
       */
      uploadButton: {
        type: Function
      },
      /**
       * The function called when the toolbar's download button is clicked.
       * @prop {Function} downloadButton
       */
      downloadButton: {
        type: Function
      },
      /**
       * The function called when the toolbar's remove button is clicked.
       * @prop {Function} removeButton
       */
      removeButton: {
        type: Function
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
       * @prop {String} [content] pathName
       */
      pathName: {
        type: String,
        default: 'content'
      },
      /**
       * The item component
       * @prop {String|Object|Vue} itemComponent
       */
      itemComponent: {
        type: [String, Object, Vue]
      },
      /**
       * The context menu source of every image
       * @prop {Function|Array} context
       */
      context: {
        type: [Function, Array]
      },
      /**
       * The component used by the context menu items
       * @prop {String|Object|Vue} contextComponent
       */
      contextComponent: {
        type: [String, Object, Vue]
      },
      buttonMenu: {
        type: [Function, Array]
      }
    },
    data(){
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
        isSelecting:  false,
        /**
         * The selection mode.
         * @data {Boolean|String} [false] selectingMode
         */
        selectingMode: false,
        currentSelected: this.selected,
        /**
         * @data {Boolean} [false] isLoaded
         */
        isLoaded: false,
        /**
         * The current widht of the items
         * @data {Number} currentItemWidth
         */
        currentItemWidth: this.itemWidth,
        currentSearch: ''
      }
    },
    computed: {
      /**
       * The number of columns.
       * @computed cols
       * @return {Number}
       */
      cols(){
        return parseInt(this.width / (this.currentItemWidth + this.columnGap)) || 1
      },
      /**
       * True if the toolbar is shown.
       * @computed isToolbarShown
       * @return {Boolean}
       */
      isToolbarShown(){
        return !!this.toolbar
        return !!(this.toolbar && (this.uploadButton || this.downloadButton || this.removeButton || this.isObject(this.toolbar) || this.isVue(this.toolbar)));
      },
      /**
       * The data of the current view
       * @computed viewData
       * @return {Array}
       */
      currentView(){
        if ( this.pageable && this.currentLimit && (!this.isAjax || !this.serverSorting) ){
          return this.filteredData.slice(this.start, this.start + this.currentLimit);
        }
        return this.filteredData;
      },
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
      setSelecting(mode){
        if ( typeof mode === 'string' ){
          this.isSelecting = true;
          this.selectingMode = mode;
        }
        else {
          this.isSelecting = false;
          this.selectingMode = false;
          this.currentSelected.splice(0);
        }
      },
      /**
       * Manages actions based on the data property selectingMode.
       * @method action
       * @fires setSelecting
       */
      action(){
        if ( this[this.selectingMode + 'Button'] && this.currentSelected.length ){
          let mess = '';
          if ( this.selectingMode === 'download' ){
            mess = bbn._("Are you sure you want to download these photos?");
          }
          else if ( this.selectingMode === 'remove' ){
            mess = bbn._("Are you sure you want to remove these photos?");
          }
          this.confirm(bbn._(mess, this.selectingMode), () => {
            this[this.selectingMode + 'Button'](this.currentSelected.map(v => {
              return bbn.fn.extend(true, {}, bbn.fn.getField(this.currentData, 'data', {index: v}));
            }));
            this.setSelecting(false);
          });
        }
      },
      /**
       * Handles the resize of the component.
       * @method onResize
       */
      onResize(){
        this.width = this.$refs.gallery.offsetWidth;
      }
    },
    /**
     * @event mounted
     * @fires onResize
     * @fires updateData
     */
    mounted(){
      this.$nextTick(() => {
        this.onResize();
        this.ready = true;
      });
    },
    watch: {
      currentLimit(){
          this.updateData();
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
            default(){
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
          gallery(){
            return this.closest('bbn-gallery');
          },
          /**
           * The style object of the column.
           * @computed colStyle
           * @memberof gallery-col
           * @return {Object}
           */
          colStyle(){
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
    :class="{'bbn-primary': isSelected, 'bbn-p': !!col.gallery.zoomable}"
    @click="action"
    :style="aStyle">
  <component :is="!!col.gallery.context ? 'bbn-context' : 'span'"
            tag="span"
            :context="true"
            :source="!!col.gallery.context
              ? (isFunction(col.gallery.context)
                ? col.gallery.context()
                : col.gallery.context)
              : []"
            :item-component="col.gallery.contextComponent">
    <img :src="getImgSrc(source.data)"
        :style="imgStyle"
        @load="loaded = true"
        :class="{'bbn-gallery-item-selected': isSelected}">
    <span v-if="showOverlay && loaded"
          class="bbn-gallery-overlay bbn-widget"
          v-text="source.data.overlay"/>
    <i v-if="col.gallery.zoomable && loaded && !col.gallery.isSelecting"
       class="bbn-gallery-zoverlay nf nf-fa-search"/>
    <bbn-context v-if="!!col.gallery.buttonMenu && loaded && !col.gallery.isSelecting"
                 tag="span"
                 :source="!!col.gallery.buttonMenu
                   ? (isFunction(col.gallery.buttonMenu)
                     ? col.gallery.buttonMenu()
                     : col.gallery.buttonMenu)
                   : []"
                 :attach="buttonMenu"
                 @hook:mounted="buttonMenu = getRef('itemMenu') || undefined">
      <i class="bbn-gallery-button-menu nf nf-mdi-menu"
         ref="itemMenu"/>
    </bbn-context>
  </component>
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
            data(){
              return {
                /**
                 * True if the gallery-item is loaded.
                 * @data {Boolean} [false] loaded
                 * @memberof gallery-item
                 */
                loaded: false,
                buttonMenu: undefined
              }
            },
            computed: {
              /**
               * The parent component 'gallery-col'.
               * @computed col
               * @memberof gallery-item
               * @return {Vue}
               */
              col(){
                return this.closest('gallery-col');
              },
              /**
               * The style object of the item.
               * @computed aStyle
               * @memberof gallery-item
               * @return {Object}
               */
              aStyle(){
                let style = {
                  margin: `0 0 ${this.col.gallery.rowGap}px 0`,
                  border: this.isSelected ? '5px dotted' : 'none'
                };
                if ( !this.col.gallery.zoomable ){
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
              imgStyle(){
                return {
                  width: '100%',
                  margin: 0,
                  borderRadius: '5px',
                  display: 'block',
                  visibility: this.loaded ? 'visible' : 'hidden'
                }
              },
              /**
               * True if the source of the component is an object.
               * @computed isObj
               * @return {Boolean}
               * @memberof gallery-item
               */
              isObj(){
                return bbn.fn.isObject(this.source);
              },
              /**
               * If true, shows the overlay.
               * @computed showOverlay
               * @return {Boolean}
               * @memberof gallery-item
               */
              showOverlay(){
                return this.col.gallery.overlay && this.isObj && (this.source.data.overlay !== undefined);
              },
              /**
               * True if the item is selected.
               * @computed isSelected
               * @return {Boolean}
               * @memberof gallery-item
               */
              isSelected(){
                return this.col.gallery.currentSelected.includes(this.source.index);
              }
            },
            methods: {
              getImgSrc(o) {
                if (bbn.fn.isString(o)) {
                  return o;
                }
                let prop = this.col.gallery.pathName || 'thumb' || 'content';
                return o[prop] || null;
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
              action(ev){
                if ( this.col.gallery.isSelecting ){
                  if ( this.isSelected ){
                    this.col.gallery.currentSelected.splice(this.col.gallery.currentSelected.indexOf(this.source.index), 1);
                  }
                  else {
                    this.col.gallery.currentSelected.push(this.source.index);
                  }
                }
                else {
                  if (!ev.target.classList.contains('bbn-gallery-button-menu') && this.col.gallery.zoomable) {
                    this.getPopup().open({
                      title: bbn._('Gallery'),
                      width: '100%',
                      height: '100%',
                      scrollable: false,
                      resizable: false,
                      maximizable: false,
                      component: this.col.gallery.$options.components.galleryZoom,
                      source: {
                        data: bbn.fn.map(this.col.gallery.currentData, d => {
                          return d.data;
                        }),
                        info: this.col.gallery.info,
                        slide: this.source.index,
                        preview: this.col.gallery.preview

                      }
                    });
                  }
                }
              }
            }
          }
        }
      },
      /**
       * @component gallery-zoom
       * @memberof gallery-item
       */
      galleryZoom: {
        name: 'gallery-zoom',
        template: `
<div class="bbn-overlay bbn-gallery-zoom">
  <bbn-slideshow :source="source.data"
                :show-info="source.info"
                :arrows="true"
                :show-count="true"
                :full-slide="true"
                :initial-slide="source.slide"
                :preview="source.preview"
  ></bbn-slideshow>
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
      }
    }
  })
})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }