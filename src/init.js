((bbn) => {
  "use strict";
  if ( !bbn.vue ){
    throw new Error("Impossible to find the library bbn-vue")
  }
  Vue.config.isReservedTag = (tag, context) => {
    return bbn.vue.loadComponentsByPrefix(tag, context)
  };

  bbn.vue.fullComponent = bbn.fn.extend({}, bbn.vue.inputComponent, bbn.vue.optionComponent, bbn.vue.eventsComponent, bbn.vue.widgetComponent);

  bbn.vue.addPrefix('bbn', (tag, resolve, reject) => {
    bbn.vue.queueComponentBBN(tag.substr(4), resolve, reject);
  });

  Vue.component('bbns-container', $.extend({
    template: '<div class="bbns-container bbn-hidden"><slot></slot></div>',
    data(){
      return {
        template: null
      }
    },
    mounted(){
      this.template = this.$el.innerHTML;
    }
  }, bbn.vue.viewComponent));
})(window.bbn);