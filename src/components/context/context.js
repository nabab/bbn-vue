/**
 * Created by BBN on 15/02/2017.
 */

 /**
  * @file bbn-context is a menu that can be activated quickly with a right click.<br>
  *
  *  You can define the list of items that a drop-down menu will contain and each item on the shortcut menu can contain its own submenus that allows you to create multi-level structures.<br>
  *
  *  To explore the submenus it is necessary to move the mouse to the context menu item.<br>
  *
  *  This easy-to-implement component allows us to create a context menu that is also complex but easy to use.
  * @copyright BBN Solutions
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
