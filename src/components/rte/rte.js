/**
 * @file bbn-rte component
 *
 * @description bbn-rte is a component that provides users with a range of options to insert and format text as desired, automatically displaying them as a preview.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 11/01/2017
 */

(function($){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  $.trumbowyg.svgPath = bbn_root_url + 'lib/Trumbowyg/v2.5.1/dist/ui/icons.svg';

  Vue.component('bbn-rte', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent],
    props: {
      pinned: {},
      top: {},
      left: {},
      bottom: {},
      right: {},
      /**
       * The height of the editor
       * @prop {Number|String} ['100%'] height
       */
      height:{
        default: '100%',
        type: [String, Number]
      },
      /**
       * The buttons to show on the toolbar
       * @prop {Array} buttons
       */
      buttons: {
        type: Array,
        default(){
          return [

            ['viewHTML'],
            ['undo', 'redo'], // Only supported in Blink browsers
            ['formatting'],
            ['strong', 'em', 'underline', 'del'],
            ['removeformat', 'foreColor', 'backColor'],
            ['superscript', 'subscript'],
            ['link'],
            ['insertImage', 'base64'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['unorderedList', 'orderedList'],
            ['horizontalRule'],
            ['fullscreen'],

          ];
        }
      },
      /**
       * The object of configuration
       * @prop {Object} cfg
       */
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
        /**
         * The height to give to the editor depending on the value of the prop height
         * @data {String} realHeight
         */
        realHeight: typeof this.height === 'string' ? this.height : this.height + 'px'
      }
    },
    methods: {
      //@todo not used
      changeHidden(e){
        bbn.fn.log("changeHidden", e);
        bbn.fn.log(e.target.value, this.value);
      }
    },
    /**
     * Initializes the component
     * @event mounted
     */
    mounted: function(){
      let cfg = this.getOptions(),
          $ele = $(this.$refs.element).css({minHeight: this.$el.clientHeight});
      /*
      if ( this.height ){
        $(this.$el).css('height', this.height);
      }
      */
      this.widget = $ele.trumbowyg({
        lang: bbn.env.lang || 'en',
        autoGrow: false,
        semantic: false,
        resetCSS: true,
        tagsToKeep: ['hr', 'img', 'div'],
        btns: this.buttons
      });
      setTimeout(() => {
        $(this.$el).find('.trumbowyg-box').addClass('bbn-flex-height').find('.trumbowyg-editor').addClass('bbn-flex-fill').css({height: 'auto'});
      }, 1000)
      bbn.fn.log("WID", this.widget.trumbowyg('getOptions'));
      $ele.on("tbwchange tbwpaste", (e) => {
        this.emitInput(e.target.value)
      });
      this.ready = true;
    },
    watch: {
      /**
       * @watch value
       * @param newVal 
       */
      value(newVal){
        if ( this.widget.trumbowyg('html') !== newVal ){
          this.widget.trumbowyg('html', newVal);
        }
      }
    }
  });
})(jQuery);
