(($, bbn) => {
  "use strict";

  Vue.component('bbn-gallery', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      source: {
        type: [Array, String],
        default(){
          return [];
        }
      },
      scrollable: {
        type: Boolean,
        default: true
      },
      toolbar: {},
      download: {
        type: Boolean,
        default: true
      },
      overlay: {
        type: [Boolean, String],
        default: false
      },
      zoomable: {
        type: Boolean,
        default: false
      },
      pageable: {
        type: Boolean,
        default: false
      },
      info: {
        type: Boolean,
        default: false
      },
      columnGap: {
        type: Number,
        default: 20
      },
      rowGap: {
        type: Number,
        default: 20
      },
      minCol: {
        type: Number,
        default: 1
      },
      maxCol: {
        type: Number
      },
      itemWidth: {
        type: Number,
        default: 150
      },
      align: {
        type: String,
        default: 'center'
      },
      limit: {
        type: Number,
        default: 25
      },
      map: {
        type: Function
      },
      data: {
        type: Object,
        default(){
          return {}
        }
      },
      upload: {
        type: Function
      },
      download: {
        type: Function
      },
      remove: {
        type: Function
      },
      preview: {
        type: Boolean,
        default: true
      }
    },
    data(){
      return {
        width: 0,
        isSelecting:  false,
        isLoading: false,
        isAjax: typeof this.source === 'string',
        currentData: bbn.fn.isArray(this.source) ? this.source : [],
        currentLimit: this.limit,
        start: 0,
        total: 0,
        limits: [10, 25, 50, 100, 250, 500],
        selectingMode: false,
        selected: []
      }
    },
    computed: {
      cols(){
        return parseInt(this.width / (this.itemWidth + this.columnGap)) || 1
      },
      numPages(){
        return Math.ceil(this.total / this.currentLimit);
      },
      currentPage: {
        get(){
          return Math.ceil((this.start + 1) / this.currentLimit);
        },
        set(val) {
          this.start = val > 1 ? (val - 1) * this.currentLimit : 0;
          this.updateData();
        }
      },
      showToolbar(){
        return this.upload || this.download || this.delete;
      }
    },
    methods: {
      updateData(){
        if ( this.isAjax && !this.isLoading ){
          this.setSelecting(false);
          this.isLoading = true;
          this.$nextTick(() => {
            let data = {
              limit: this.currentLimit,
              start: this.start,
              data: this.data
            };
            bbn.fn.post(this.source, data, result => {
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
          });
        }
        else if ( bbn.fn.isArray(this.source) ){
          this.currentData = this._map(this.source);
          this.total = this.source.length;
        }
      },
      _map(data){
        return this.map ? data.map(this.map) : data; 
      },
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
      onResize(){
        this.width = this.$refs.gallery.offsetWidth;
      }
    },
    mounted(){
      this.$nextTick(() => {
        this.onResize();
        if ( this.isAjax ){
          this.updateData();
        }
      });
    },
    components: {
      galleryZoom: {
        name: 'gallery-zoom',
        template: `
<div class="bbn-overlay bbn-gallery-zoom">
  <bbn-slideshow :source="source.item.col.gallery.currentData"
                 :show-info="source.item.col.gallery.info"
                 :arrows="true"
                 :show-count="true"
                 :full-slide="true"
                 :initial-slide="source.item.idx"
                 :preview="source.item.col.gallery.preview"
  ></bbn-slideshow>
</div>
                `,
        props: {
          source: {
            type: [String, Object]
          }
        }
      },
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
          source: {
            type: Array,
            default(){
              return [];
            }
          },
          index: {
            type: Number
          }
        },
        computed: {
          gallery(){
            return this.closest('bbn-gallery');
          },
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
          getSource(idx){
            return this.gallery.currentData.filter((it, i) => {
              return i % this.gallery.cols === idx;
            });
          }
        },
        components: {
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
              source: {
                type: [String, Object]
              }
            },
            data(){
              return {
                loaded: false,
                selected: false,
                idx: null
              }
            },
            computed: {
              col(){
                return this.closest('gallery-col');
              },
              aStyle(){
                let style = {
                  margin: `0 0 ${this.col.gallery.rowGap}px 0`,
                  border: this.isSelected ? '5px dotted' : 'none'
                };
                return style;
              },
              imgStyle(){
                return {
                  width: '100%',
                  margin: 0,
                  borderRadius: '5px',
                  display: 'block',
                  visibility: this.loaded ? 'visible' : 'hidden'
                }
              },
              isObj(){
                return bbn.fn.isObject(this.source);
              },
              showOverlay(){
                return this.col.gallery.overlay && this.isObj && (this.source.overlay !== undefined);
              },
              isSelected(){
                return (this.idx !== null) && this.col.gallery.selected.includes(this.idx);
              }
            },
            methods: {
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
                        source: this.source,
                        item: this
                      }
                    });
                  }
                }
              },
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
            mounted(){
              this.idx = this.getIdx();
            }
          }
        }
      }
    }
  })
})(jQuery, bbn);