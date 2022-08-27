/**
 * @file bbn-cms-block component
 * @description bbn-cms-block 
 * @copyright BBN Solutions
 * @author Loredana Bruno
 * @created 09/11/2020.
 */
((bbn, Vue) => {
  "use strict";
  const cpDef = {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.inputComponent
    ],
    props: {
      /**
       * @prop {String} value
       */
      value: {
        type: String
      }
    },
    data(){
      return {
      }
    },
    computed: {
    },
    methods: {
      onInlineInput(ev) {
        this.emitInput(ev.target.innerText);
      },
      updateEditor(){
        this.getRef('divEditor').innerText = this.value;
      }
    },
    mounted(){
      this.updateEditor();
    },
    watch: {
      currentValue(v) {
        this.emitInput(v);
        this.updateEditor();
      },
      value(v){
        if (v !== this.currentValue) {
          this.currentValue = v;
        }
      },
    }, 
 
  };

  if (Vue.component) {
    Vue.component('bbn-inline-editor', cpDef);
  }

  return cpDef;

})(window.bbn, window.Vue);
