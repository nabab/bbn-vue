/**
 * Created by BBN on 14/02/2017.
 */
(function($, bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-list', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      source: {
        type: [String, Array, Function],
        default(){
          return []
        }
      },
      styled: {
        type: Boolean,
        default: true,
      },
      expandMode: {
        type: String,
        default: 'single'
      },
      itemClass: {
        type: String
      },
      selected: {
        type: Number
      },
      animation: {
        expand: {
          duration: 400,
          effects: "expandVertical"
        }
      },
      template: {
        type: [String, Function],

      }
    },
    data: function(){
      return {
        over: false,
        isOk: false,
        selectedIndex: null,
        items: []
      }
    },
    methods: {
      update(){
        if ( bbn.fn.isArray(this.source) ){
          this.items = this.source.slice();
        }
        if ( bbn.fn.isFunction(this.source) ){
          this.items = this.source();
        }
        else{
          bbn.fn.post(this.source, (d) => {
            if ( d.data ){
              this.items = d.data;
            }
          })
        }
      },
      drawItem: function(obj, e){
        var vm = this,
            data = obj.item,
            cfg = bbn.vue.getOptions(vm),
            cls = cfg.itemClass ? ($.isFunction(cfg.itemClass) ? cfg.itemClass(data) : cfg.itemClass) : '',
            tpl = '';
        if ( cls ){
          tpl += '<span class="' + cls + '">';
        }
        if ( cfg.dataUrlField && data[cfg.dataUrlField] ){
          tpl += '<a href="' + data[cfg.dataUrlField] + '">';
        }
        if ( !Array.isArray(cfg.dataTextField) ){
          cfg.dataTextField = [cfg.dataTextField];
        }
        $.each(cfg.dataTextField, function(i, v){
          tpl += data[v] ? data[v] : ' ';
        });
        if ( cfg.dataUrlField && data[cfg.dataUrlField] ){
          tpl += '</a>';
        }
        if ( cls ){
          tpl += '</span>';
        }
        return tpl;
      },
    },
    mounted: function(){
      this.ready = true;
      this.$nextTick(() => {
        this.update();
      })
    },
    watch: {
      source: {
        deep: true,
        handler(){
          this.update();
        }
      },
      items: {
        deep: true,
        handler(){
          if ( this.getRef('scroll') ){
            this.getRef('scroll').selfEmit()
          }
        }
      }
    },
    components: {
      item: {
        template: '<div class="bbn-padded" v-html="source.text"></div>',
        props: ['source']
      }
    }
  });

})(jQuery, bbn);
