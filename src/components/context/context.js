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
    mixins: [bbn.vue.basicComponent, bbn.vue.sourceArrayComponent],
    props: {
      tag: {
        type: String,
        default: 'span'
      },
      context: {
        type: Boolean,
        default: false
      },
      content: {
        type: String
      },
      mode: {
        type: String,
        default: 'free'
      }
    },
    data(){
      return {
        showFloater: false
      };
    },
    methods: {
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
