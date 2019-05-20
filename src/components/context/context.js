/**
 * @file bbn-context component
 *
 * @description bbn-context is a menu that can be activated with a right click.
 * You can define any item in the shortcut menu that may contain other own submenus that allow you to create layered structures.
 * To explore the submenus you need to move the mouse to the context menu item.
 * This easy-to-implement component allows us to create a shortcut menu.
 *
 * @copyright BBN Solutions
 *
 * @created 15/02/2017.
 */

(function(bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-context', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.sourceArrayComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.sourceArrayComponent],
    props: {
      /**
       * The html tag used to render the prop content
       * @prop {String} ['span'] tag
       */
      tag: {
        type: String,
        default: 'span'
      },
      /**
       * Set to true shows the floating element containing the menu
       * @prop {Boolean} [false] context
       * 
       */
      context: {
        type: Boolean,
        default: false
      },
      /**
       * The string on which to right click to open the menu
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
      }
    },
    data(){
      return {
        /**
         * When true shows the floating element of the menu
         * @data {Boolean} [false] showFloater 
         */
        showFloater: false
      };
    },
    methods: {
      /**
       * Basing on the type of event and on the prop context, shows or hides the floating element of the menu
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
