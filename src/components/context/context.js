/**
 * @file bbn-context component
 *
 * @description bbn-context is a menu that can be activated with a right click.
 * The source of the menu can have a tree structure.
 * 
 * @copyright BBN Solutions
 *
 * @created 15/02/2017.
 */

((bbn) => {
  "use strict";

  /**
   * Classic input with normalized appearance.
   */
  Vue.component('bbn-context', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.listComponent],
    props: {
      /**
       * The html tag used to render the property content.
       * @prop {String} ['span'] tag
       */
      tag: {
        type: String,
        default: 'span'
      },
      /**
       * Set to true to show the floating element containing the menu.
       * @prop {Boolean} [false] context
       * 
       */
      context: {
        type: Boolean,
        default: false
      },
      /**
       * The text that can be right clicked to open the menu.
       * @prop {String} content
       */
      content: {
        type: String
      },
      /**
       * 
       * @prop {String} ['free'] mode
       */
      mode: {
        type: String,
        default: 'free'
      },
      children: {
        type: String,
        default: 'items'
      }
    },
    data(){
      return {
        /**
         * True if the floating element of the menu is opened.
         * @data {Boolean} [false] showFloater 
         */
        showFloater: false
      };
    },
    methods: {
      /**
       * Based on the type of event and on the property context, shows or hides the floating element of the menu.
       * @method clickItem
       * @param {Event} e 
       * @fires updateData
       */
      clickItem(e){
        if (
          (e.type === 'keydown') ||
          ((e.type === 'contextmenu') && this.context) ||
          ((e.type === 'click') && !this.context)
        ){
          if ( this.showFloater ){
            this.showFloater = !this.showFloater;
          }
          else{
            this.updateData().then(() => {
              this.showFloater = !this.showFloater;
            });
          }
        }
      },
    }
  });

})(bbn);
