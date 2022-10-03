/**
 * @file bbn-container component
 *
 * @description bbn-container is a uniquely identified container component that can be used by bbn-tabnav.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 15/02/2017
 */

 (function(bbn, Vue){
  "use strict";

  /**
   * @component
   * @param {string} url - The URL on which the tabNav will be initialized.
   * @param {boolean} autoload - Defines if the tab will be automatically loaded based on URLs. False by default
   * except if it is true for the parent.
   * @param {string} orientation - The position of the tabs' titles: top (default) or bottom.
   * @param {string} root - The root URL of the tabNav, will be only taken into account for the top parents'
   * tabNav, will be automatically calculated for the children.
   * @param {boolean} scrollable - Sets if the tabs' titles will be scrollable in case they have a greater width
   * than the page (true), or if they will be shown multilines (false, default).
   * @param {array} source - The tabs shown at init.
   * @param {string} current - The URL to which the tabnav currently corresponds (its selected tab).
   * @param {string} baseURL - The parent TabNav's URL (if any) on top of which the tabNav has been built.
   * @param {array} parents - The tabs shown at init.
   * @param {array} tabs - The tabs configuration and state.
   * @param {boolean} parentTab - If the tabNav has a tabNav parent, the tab Vue object in which it stands, false
   * otherwise.
   * @param {boolean|number} selected - The index of the currently selected tab, and false otherwise.
   */

  // Will hold all the current rendered components random names to avoid doubles
  let componentsList = [];

  const cpDef = {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.viewComponent
     * @mixin bbn.vue.observerComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent
    ],
    props: {
      /**
       * The index of the container
       * @prop {Number} idx
       */
      is: {
        type: [String, Object],
        required: true
      },
    },
    data(){
      return {
        /**
         * The router which the container belongs to if it exists.
         * @data [null] router
         */
        componentDefinition: null,
        /**
         * True if the data changes and is unsaved.
         * @data {Boolan} [false] dirty
         */
        ready: false
      };
    },
    methods: {
      updateDefinition() {
        if (this.is) {
          if (bbn.fn.isString(this.is) && !bbn.vue.parsedTags.includes(this.is)) {
            bbn.vue.loadComponentsByPrefix(this.is);
          }
        
          this.componentDefinition = this.is;
          this.ready = true;
        }
      }
    },
    watch: {
      is() {
        this.ready = false;
        this.$nextTick(() => {
          this.updateDefinition();
        });
      }
    },
    mounted() {
      this.updateDefinition();
    }

  };

  if (Vue.component) {
    Vue.component("bbn-component", cpDef);
  }

  return cpDef;

})(window.bbn, window.Vue);
