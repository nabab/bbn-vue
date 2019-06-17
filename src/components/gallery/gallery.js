/**
 * @file bbn-gallery component
 *
 * @description bbn-gallery is a component for the purpose of presenting an extraordinary gallery of images on display in your websites or applications.
 * It has a multitude of customizations to better present your gallery.
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 */
((bbn) => {
  "use strict";

  Vue.component('bbn-gallery', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      /**
       * The source of the component.
       * 
       * @prop {Array|String} source
       */
      source: {
        type: [Array, String],
        default(){
          return [];
        }
      },
      /**
       * Set to true allows the component to have a scroll.
       * 
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * The custom component for the toolbar.
       * 
       * @props {Vue|Object|Boolean} toolbar
       */
      toolbar: {
        type: [Vue, Object, Boolean],
        default: true
      },
      /**
       * Set to true shows the button for the download in the toolbar.
       * 
       * @prop {Boolean} [true] download
       */
      download: {
        type: Boolean,
        default: true
      },
      /**
       * 
       * @prop {Boolean|String} [false] overlay
       */
      overlay: {
        type: [Boolean, String],
        default: false
      },
      /**
       * Set to true allows the gallery to be zoomable.
       * 
       * @prop {Boolean} [false] zoomable
       */
      zoomable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true allows the gallery to be pageable.
       * 
       * @prop {Boolean} [false] pageable
       */
      pageable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true shows infos on the footer of the gallery.
       * 
       * @prop {Boolean} [false] info
       */
      info: {
        type: Boolean,
        default: false
      },
      /**
       * The gap between the columns.
       * 
       * @prop {Number} [20] columnGap
       */
      columnGap: {
        type: Number,
        default: 20
      },
      /**
       * The gap between the rows.
       * 
       * @prop {Number} [20] rowGap
       */
      rowGap: {
        type: Number,
        default: 20
      },
      /**
       * The minimum number of columns.
       * 
       * @prop {Number} [1] minCol
       */
      minCol: {
        type: Number,
        default: 1
      },
      /**
       * The maximum number of columns.
       * 
       * @prop {Number} maxCol
       */
      maxCol: {
        type: Number
      },
      /**
       * The width of the items.
       * 
       * @prop {Number} [150] itemWidth
       */
      itemWidth: {
        type: Number,
        default: 150
      },
      /**
       * The horizontal alignment of the column.
       * 
       * @prop {String} ['center'] align
       */
      align: {
        type: String,
        default: 'center'
      },
      /**
       * The limit of items.
       * 
       * @prop {Number} [25] limit
       */
      limit: {
        type: Number,
        default: 25
      },
      /**
       * A function to normalize the source.
       * 
       * @prop {Function} map
       */
      map: {
        type: Function
      },
      /**
       * Additional data to sent with the ajax call.
       * 
       * @prop {Object} [{}] data
       */
      data: {
        type: Object,
        default(){
          return {}
        }
      },
      /**
       * The function called on click on the upload button of the toolbar.
       * 
       * @prop {Function} upload
       */
      upload: {
        type: Function
      },
      /**
       * The function called on click on the download button of the toolbar.
       * 
       * @prop {Function} download
       */
      download: {
        type: Function
      },
      /**
       * The function called on click on the remove button of the toolbar.
       * @prop {Function} remove
       */
      remove: {
        type: Function
      },
      /**
       * Shows preview on the slideshow when the item is zoomed.
       * 
       * @prop {Boolean} [true] preview
       */
      preview: {
        type: Boolean,
        default: true
      }
    },
    data(){
      return {
        /**
         * The width of the component.
         * 
         * @data {Number} [0] width
         */
        width: 0,
        /**
         * True if the component is set on selecting mode.
         * 
         * @data {Boolean} [false] isSelecting
         */
        isSelecting:  false,
        /**
         * True if the component is loading data.
         * 
         * @data {Boolean} [false] isLoading
         */
        isLoading: false,
        /**
         * True if the source of the component is a string and the component makes an ajax call for it's source.
         * 
         * @data {Boolean} isAjax
         */
        isAjax: typeof this.source === 'string',
        /**
         * The source of the component.
         * 
         * @data {Array} currentData
         */
        currentData: bbn.fn.isArray(this.source) ? this.source : [],
        /**
         * The limit of the component.
         * 
         * @data {Number} currentLimit
         */
        currentLimit: this.limit,
        /**
         * The start item in a pageable gallery.
         * 
         * @data {Number} [0] start
         */
        start: 0,
        /**
         * The total of items.
         * 
         * @data {Number} [0] total
         */
        total: 0,
        /**
         * The source of the dropdown to define the limit of items shown in the page.
         * 
         * @data {Array} [10, 25, 50, 100, 250, 500] limits 
         */
        limits: [10, 25, 50, 100, 250, 500],
        /**
         * The mode of selection.
         * 
         * @prop {Boolean|String} [false] selectingMode
         */
        selectingMode: false,
        /**
         * The array of selected items.
         * 
         * @prop {Array} [[]] selected
         */
        selected: []
      }
    },
    computed: {
      /**
       * The number of columns.
       * 
       * @computed cols
       * @return {Number}
       */
      cols(){
        return parseInt(this.width / (this.itemWidth + this.columnGap)) || 1
      },
      /**
       * Returns the number of pages.
       * 
       * @computed numPages
       * @return {Number}
       */
      numPages(){
        return Math.ceil(this.total / this.currentLimit);
      },
      /**
       * The number of page.
       * 
       * @computed currentPage
       * @return {Number}
       */
      currentPage: {
        get(){
          return Math.ceil((this.start + 1) / this.currentLimit);
        },
        set(val) {
          this.start = val > 1 ? (val - 1) * this.currentLimit : 0;
          this.updateData();
        }
      },
      /**
       * True if the toolbar needs to be shown.
       * 
       * @computed showToolbar
       * @return {Boolean}
       */
      showToolbar(){
        return !!(this.toolbar && (this.upload || this.download || this.delete));
      }
    },
    methods: {
      /** 
       * Alias of bbn.fn.isObject.
       * 
       * @method isObject
       * @return {Boolean}
      */
      isObject: bbn.fn.isObject,
      /** 
       * Alias of bbn.fn.isVue.
       * 
       * @method isVue
       * @return {Boolean}
      */
     isVue: bbn.fn.isVue,
      /**
       * Updates the data of the component.
       * 
       * @method updateData
       * @fires setSelecting
       * @fires _map
       */
      updateData(){
        if ( this.isAjax && !this.isLoading ){
          this.setSelecting(false);
          this.isLoading = true;
          let data = {
            limit: this.currentLimit,
            start: this.start,
            data: this.data
          };
          return bbn.fn.post(this.source, data, result => {
            this.isLoading = false;
            if (
              !result ||
              result.error ||
              ((result.success !== undefined) && !result.success)
            ) {
              appui.alert(result && result.error ? result.error : bbn._("Error while updating the data"));
            }
            else {
              this.currentData = this._map(result.data || []);
              this.total = result.total || result.data.length || 0;
            }
          });
        }
        else {
          return new Promise((resolve, reject) => {
            if ( bbn.fn.isArray(this.source) ){
              this.currentData = this._map(this.source);
              this.total = this.source.length;
              resolve(this.currentData);
            }
          })
        }
      },
      /**
       * If a function for the prop map is defined calls the function on the given array data.
       * 
       * @method _map
       * @param {Array} data 
       */
      _map(data){
        return this.map ? data.map(this.map) : data;
      },
      /**
       * Sets the selectingMode data property.
       * 
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
          this.selected = [];
        }
      },
      /**
       * Manages actions basing on the data property selectingMode.
       * 
       * @method action
       * @fires setSelecting
       */
      action(){
        if ( this[this.selectingMode] && this.selected.length ){
          this.confirm(bbn._(`Are you sure you want to ${this.selectingMode} these photos?`), () => {
            this[this.selectingMode](this.selected.map(v => {
              return Object.assign({}, this.currentData[v]);
            }));
            this.setSelecting(false);
          });
        }
      },
      /**
       * Handles the resize of the component.
       * 
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
        if ( this.isAjax ){
          this.updateData();
        }
      });
    },
    components: {
      /**
       * @component gallery-zoom
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
           * The source of the component gallery-zoom.
           * 
           * @prop {String|Object} source
           * @memberof gallery-zoom
           */
          source: {
            type: [String, Object]
          }
        }
      },
      /**
       * @component gallery-col
       */
      galleryCol: {
        name: 'gallery-col',
        template: `
<div :style="colStyle">
  <gallery-item v-for="(item, idx) in getSource(index)"
                :source="item"
                :key="'gallery-item-'+index+'-'+idx"
  ></gallery-item>
</div>`,
        props: {
          /**
           * The source of the component gallery-col.
           * 
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
           * 
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
           * 
           * @computed gallery
           * @memberof gallery-col
           * @return {Object}
           */
          gallery(){
            return this.closest('bbn-gallery');
          },
          /**
           * The style object of the column.
           * 
           * @computed colStyle
           * @memberof gallery-col
           * @return {Object}
           */
          colStyle(){
            return {
              width: `${this.gallery.itemWidth}px`,
              margin: `0 ${this.gallery.columnGap / 2}px`,
              verticalAlign: 'top',
              display: 'inline-block'
            }
          }
        },
        methods: {
          /**
           * Gets the data of the column.
           * 
           * @method getSource
           * @param {Number} idx
           * @memberof gallery-col
           * @return {Boolean}
           */
          getSource(idx){
            return this.gallery.currentData.filter((it, i) => {
              return i % this.gallery.cols === idx;
            });
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
   :class="['bbn-p', {'k-primary': isSelected}]"
   @click="action"
   :style="aStyle"
>
  <img :src="isObj ? (source.thumb || source.content) : source"
       :style="imgStyle"
       @load="loaded = true"
       :class="{'bbn-gallery-item-selected': isSelected}"
  >
  <span v-if="showOverlay && loaded"
        class="bbn-gallery-overlay k-widget"
        v-text="source.overlay"
  ></span>
  <i v-if="col.gallery.zoomable && loaded && !col.gallery.isSelecting"
    class="bbn-gallery-zoverlay nf nf-fa-search"
  ></i>
</a>
            `,
            props: {
              /**
               * The source of the compoment gallery-item.
               * 
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
                 * 
                 * @data {Boolean} [false] loaded
                 * @memberof gallery-item
                 */
                loaded: false,
                /**
                 * True if the gallery-item is selected.
                 * 
                 * @data {Boolean} [false] selected
                 * @memberof gallery-item
                 */
                selected: false,
                /**
                 * The index of the item in the currentData of the component bbn-gallery.
                 * @data [null] idx
                 * @memberof gallery-item
                 */
                idx: null
              }
            },
            computed: {
              /**
               * The parent gallery-col component.
               * 
               * @computed col
               * @memberof gallery-item
               * @return {Vue}
               */
              col(){
                return this.closest('gallery-col');
              },
              /**
               * The object for the style of the item.
               * 
               * @computed aStyle
               * @memberof gallery-item
               * @return {Object}
               */
              aStyle(){
                let style = {
                  margin: `0 0 ${this.col.gallery.rowGap}px 0`,
                  border: this.isSelected ? '5px dotted' : 'none'
                };
                return style;
              },
              /**
               * The object for the style of the image.
               * 
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
               * 
               * @computed isObj
               * @return {Boolean}
               * @memberof gallery-item
               */
              isObj(){
                return bbn.fn.isObject(this.source);
              },
              /**
               * If true shows the overlay.
               * 
               * @computed showOverlay
               * @return {Boolean}
               * @memberof gallery-item
               */
              showOverlay(){
                return this.col.gallery.overlay && this.isObj && (this.source.overlay !== undefined);
              },
              /**
               * True if the item is selected.
               * 
               * @computed isSelected
               * @return {Boolean}
               * @memberof gallery-item
               */
              isSelected(){
                return (this.idx !== null) && this.col.gallery.selected.includes(this.idx);
              }
            },
            methods: {
              /**
               * Menages the actions.
               * 
               * @methods action
               * @memberof gallery-item
               * @fires getPopup
               */
              action(){
                if ( this.col.gallery.isSelecting ){
                  if ( this.isSelected ){
                    this.col.gallery.selected.splice(this.col.gallery.selected.indexOf(this.idx), 1);
                  }
                  else {
                    this.col.gallery.selected.push(this.idx);
                  }
                }
                else {
                  if ( this.col.gallery.zoomable ){
                    this.getPopup().open({
                      title: bbn._('Gallery'),
                      scrollable: false,
                      resizable: false,
                      maximizable: false,
                      maximized: true,
                      component: this.col.gallery.$options.components.galleryZoom,
                      source: {
                        data: this.col.gallery.currentData,
                        info: this.col.gallery.info,
                        slide: this.idx,
                        preview: this.col.gallery.preview

                      }
                    });
                  }
                }
              },
              /**
               * Returns the index of the item in the currentData of the component bbn-gallery.
               * 
               * @methods getIdx
               * @memberof gallery-item
               * @return {Number}
               */
              getIdx(){
                let idx = null;
                bbn.fn.each(this.col.gallery.currentData, (v, i) => {
                  if ( bbn.fn.isSame(v, this.source) ){
                    idx = i;
                    return;
                  }
                });
                return idx;
              }
            },
            /**
             * Defines the property of data 'idx'.
             * 
             * @event mounted
             * @memberof gallery-item
             * @fires getIdx
             */
            mounted(){
              this.idx = this.getIdx();
            }
          }
        }
      }
    }
  })
})(bbn);
