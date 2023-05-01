/**
 * @file bbn-code component
 *
 * @description bbn-code is a text editor.
 * It specializes in editing the code of a supported language. 
 * Various tools are provided to the users, which can be configured to their liking.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */


return {
    /**
     * @mixin bbn.wc.mixins.basic
     */
    mixins: [bbn.wc.mixins.basic],
    props: {
    },

    data(){
      return {
        /**
         * @todo not used
         */
        widget: null,
        /**
         * True if the editor is fullscreen.
         * @data {Boolan} [false] isFullScreen
         */
        isVisible: false
      };
    },

    computed: {
    },

    methods: {
    },
    /**
     * @event mounted
     * @fires initTern
     * @fires getRef
     * @emit  input
     */
    mounted(){
    },

    watch: {
    }
  };
  