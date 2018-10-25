/**
 * Created by BBN on 11/01/2017.
 */
(function($){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-rte2', {
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent],
    props: {
      pinned: {},
      top: {},
      left: {},
      bottom: {},
      right: {},
      height:{
        default: '100%',
        type: [String, Number]
      },
      buttons: {
        type: Array,
        default(){
          return [
            ['viewHTML'],
            ['undo', 'redo'], // Only supported in Blink browsers
            ['formatting'],
            ['strong', 'em', 'underline', 'del'],
            ['superscript', 'subscript'],
            ['link'],
            ['insertImage', 'base64'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['unorderedList', 'orderedList'],
            ['horizontalRule'],
            ['removeformat'],
            ['fullscreen']
          ];
        }
      },
      cfg: {
        type: Object,
        default: function(){
          return {
            pinned: true,
            top: null,
            left: null,
            bottom: 5,
            right: 5,
          }
        }
      }
    },
    data(){
      return {
        realHeight: typeof this.height === 'string' ? this.height : this.height + 'px'
      }
    },
    methods: {
      changeHidden(e){
        bbn.fn.log("changeHidden", e);
        bbn.fn.log(e.target.value, this.value);
      }
    },

    mounted: function(){
      $(this.getRef('element')).summernote({
        maxHeight: this.$el.clientHeight,
        callbacks: {
          onInit: (editor) => {
            editor.toolbar.addClass('k-widget');
            bbn.fn.log(arguments)
          },
          onChange: (contents, editor) => {
            bbn.fn.log(contents, editor);
            this.$emit('input', contents);
          }
        }
      })
      this.ready = true;
    },
    watch: {
      value(newVal){
        bbn.fn.log("VALUE HAS CHANGED")
      }
    }
  });
})(jQuery);
