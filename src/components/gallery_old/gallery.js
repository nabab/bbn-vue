// It has a multitude of customizations to better your gallery.
/**
 * @file bbn-gallery component
 *
 * @description bbn-gallery is a component that displays a collection of images.
 *
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
       * @prop {Array|String} source
       */
      source: {
        type: [Array, String],
        default(){
          return [];
        }
      },
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
       * Set to true to allow the gallery to be pageable.
       * @prop {Boolean} [false] pageable
       */
      pageable: {
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
       * The limit of items allowed.
       * @prop {Number} [25] limit
       */
      limit: {
        type: Number,
        default: 25
      },
      /**
       * A function to normalize the source.
       * @prop {Function} map
       */
      map: {
        type: Function
      },
      /**
       * Additional data sent with the ajax call.
       * @prop {Object} [{}] data
       */
      data: {
        type: Object,
        default(){
          return {}
        }
      },
      /**
       * The function called when the toolbar's upload button is clicked.
       * @prop {Function} upload
       */
      upload: {
        type: Function
      },
      /**
       * The function called when the toolbar's download button is clicked.
       * @prop {Function} download
       */
      download: {
        type: Function
      },
      /**
       * The function called when the toolbar's remove button is clicked.
       * @prop {Function} remove
       */
      remove: {
        type: Function
      },
      /**
       * Displays a preview of items below the slideshow.
       * @prop {Boolean} [true] preview
       */
      preview: {
        type: Boolean,
        default: true
      },
      autobind: {
        type: Boolean,
        default: true
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
         * True if the gallery is loading data.
         * @data {Boolean} [false] isLoading
         */
        isLoading: false,
        /**
         * True if the source of the component is a string and an ajax call is made.
         * @data {Boolean} isAjax
         */
        isAjax: typeof this.source === 'string',
        /**
         * The source of the component.
         * @data {Array} currentData
         */
        currentData: [],
        /**
         * The limit of the component.
         * @data {Number} currentLimit
         */
        currentLimit: this.limit,
        /**
         * The starting item in a pageable gallery.
         * @data {Number} [0] start
         */
        start: 0,
        /**
         * The total number of items.
         * @data {Number} [0] total
         */
        total: 0,
        /**
         * The source of the dropdown component defining the limit of items shown on the page.
         * @data {Array} [10, 25, 50, 100, 250, 500] limits
         */
        limits: [10, 25, 50, 100, 250, 500],
        /**
         * The selection mode.
         * @prop {Boolean|String} [false] selectingMode
         */
        selectingMode: false,
        /**
         * The array of selected items.
         * @prop {Array} [[]] selected
         */
        selected: [],
        isLoaded: false
      }
    },
    computed: {
      /**
       * The number of columns.
       * @computed cols
       * @return {Number}
       */
      cols(){
        return parseInt(this.width / (this.itemWidth + this.columnGap)) || 1
      },
      /**
       * Returns the number of pages.
       * @computed numPages
       * @return {Number}
       */
      numPages(){
        return Math.ceil(this.total / this.currentLimit);
      },
      /**
       * The number of the current page.
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
       * True if the toolbar is shown.
       * @computed isToolbarShown
       * @return {Boolean}
       */
      isToolbarShown(){
        return !!(this.toolbar && (this.upload || this.download || this.delete));
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
       * Updates the component's data.
       * @method updateData
       * @fires setSelecting
       * @fires _map
       */
      updateData(){
        if ( !this.isLoading ){
          if ( this.isAjax ){
            this.setSelecting(false);
            this.isLoading = true;
            let data = {
              limit: this.currentLimit,
              start: this.start,
              data: this.data
            };
            return this.post(this.source, data, result => {
              this.isLoading = false;
              if ( !this.isLoaded ){
                this.isLoaded = true;
              }
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
          else if ( bbn.fn.isArray(this.source) ){
            return new Promise((resolve, reject) => {
              this.currentData = this._map(this.pageable ? this.source.slice(this.start, this.start + this.currentLimit) : this.source);
              this.total = this.source.length;
              if ( !this.isLoaded ){
                this.isLoaded = true;
              }
              resolve(this.currentData);
            })
          }
        }
      },
      /**
       * If the function 'map' is defined it triggers the map of the source
       * @method _map
       * @param {Array} data
       */
      _map(data){
        let da = this.map ? data.map(this.map) : data;
        return bbn.fn.map(da, (d, i) => {
          return {
            _bbn: true,
            index: i,
            data: d
          }
        });
      },
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
          this.selected = [];
        }
      },
      /**
       * Manages actions based on the data property selectingMode.
       * @method action
       * @fires setSelecting
       */
      action(){
        if ( this[this.selectingMode] && this.selected.length ){
          let mess = '';
          if ( this.selectingMode === 'download' ){
            mess = bbn._("Are you sure you want to download these photos?");
          }
          else if ( this.selectingMode === 'remove' ){
            mess = bbn._("Are you sure you want to remove these photos?");
          }
          this.confirm(bbn._(mess, this.selectingMode), () => {
            this[this.selectingMode](this.selected.map(v => {
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
        if ( this.autobind ){
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
           * The source of the component 'gallery-zoom'.
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
  <gallery-item v-for="(item, idx) in source"
                :source="item"
                :key="'gallery-item-'+index+'-'+idx"
  ></gallery-item>
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
              width: `${this.gallery.itemWidth}px`,
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
   :style="aStyle"
>
  <img :src="isObj ? (source.data.thumb || source.data.content) : source.data"
       :style="imgStyle"
       @load="loaded = true"
       :class="{'bbn-gallery-item-selected': isSelected}"
  >
  <span v-if="showOverlay && loaded"
        class="bbn-gallery-overlay bbn-widget"
        v-text="source.data.overlay"
  ></span>
  <i v-if="col.gallery.zoomable && loaded && !col.gallery.isSelecting"
    class="bbn-gallery-zoverlay nf nf-fa-search"
  ></i>
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
                loaded: false
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
                return this.col.gallery.selected.includes(this.source.index);
              }
            },
            methods: {
              /**
               * Manages the actions.
               * @methods action
               * @memberof gallery-item
               * @fires getPopup
               */
              action(){
                if ( this.col.gallery.isSelecting ){
                  if ( this.isSelected ){
                    this.col.gallery.selected.splice(this.col.gallery.selected.indexOf(this.source.index), 1);
                  }
                  else {
                    this.col.gallery.selected.push(this.source.index);
                  }
                }
                else {
                  if ( this.col.gallery.zoomable ){
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
      }
    }
  })
})(bbn);
