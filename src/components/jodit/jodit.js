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

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.position
     */
    mixins: 
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.position
    ],
    props: {
      /**
       * @prop {} value
       */
      value: {},
      /**
       * @prop {} pinned
       */
      pinned: {},
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
        realHeight: typeof this.height === 'string' ? this.height : this.height + 'px',
        widget: false,
        currentValue: this.value
      }
    },
    methods: {
      onChange(){
        this.currentValue = this.widget.getElementValue();
        this.$emit('input', this.currentValue);
      }
    },
    /**
     * Initializes the component
     * @event mounted
     */
    mounted(){
      this.widget = new Jodit(this.getRef('element'), {
        iframe: true,
        allowResizeX: false,
        allowResizeY: false,
        spellcheck: false,
        useSplitMode: true,
        height: '100%',
        tabIndex: 0,
        uploader: {
          insertImageAsBase64URI: true
        }
      });
      if (this.value) {
        this.widget.value = this.value
      }
      this.ready = true;
    },
    watch: {
      /**
       * @watch value
       * @param newVal 
       */
      value(newVal){
        if (this.currentValue !== newVal) {
          bbn.fn.log("CHAGING VALUE");
          this.widget.value = this.currentValue = newVal;
        }
      }
    }
  };
