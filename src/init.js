((bbn) => {
  "use strict";
  if ( !bbn.vue ){
    throw new Error("Impossible to find the library bbn-vue")
  }
  Vue.config.isReservedTag = (tag, context) => {
    return bbn.vue.loadComponentsByPrefix(tag, context)
  };

  bbn.vue.fullComponent = bbn.fn.extendOut({}, bbn.vue.inputComponent, bbn.vue.optionComponent, bbn.vue.eventsComponent, bbn.vue.widgetComponent);

  bbn.vue.addPrefix('bbn', (tag, resolve, reject) => {
    bbn.vue.queueComponentBBN(tag.substr(4), resolve, reject);
  });

  Vue.component('bbns-container', bbn.fn.extend({
    //functional: true,
    template: '<div class="bbns-container bbn-hidden"><slot></slot></div>',
    props: {
      real: {
        type: Boolean,
        default: false
      }
    },
    mounted(){
      let template = this.$el.innerHTML.trim();
      let router = this.closest('bbn-router');
      if ( router && this.url ){
        let obj = this.$options.propsData || {};
        if ( template ){
          if ( !obj.content ){
            obj.content = template;
          }
        }
        router.register(obj, true);
      }
    }
  }, bbn.vue.viewComponent));
})(window.bbn);