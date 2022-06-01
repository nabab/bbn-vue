(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    init: cfg => {
      if ( !bbn.vue ){
        throw new Error("Impossible to find the library bbn-vue")
      }

      if (!bbn.fn.isInit) {
        if (cfg) {
          bbn.fn.init(cfg);
        }
        else {
          throw new Error("bbn is not initialized")
        }
      }

      Vue.config.isReservedTag = tag => {
        return bbn.vue.loadComponentsByPrefix(tag)
      };
      Vue.config.devtools = !(!bbn.env.mode || (bbn.env.mode === 'prod'));

      Vue.config.errorHandler = function (err, vm, info) {
        // handle error
        // `info` is a Vue-specific error info, e.g. which lifecycle hook
        // the error was found in. Only available in 2.2.0+
        bbn.fn.log("ERROR handler from VueJS", err, vm, info);
      };


      bbn.vue.fullComponent = bbn.fn.extend(true, {}, bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent);

      bbn.vue.addPrefix('bbn', (tag, resolve, reject) => {
        bbn.vue.queueComponentBBN(bbn.fn.substr(tag, 4), resolve, reject);
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
            obj.real = false;
            router.add(obj);
          }
        }
      }, bbn.vue.viewComponent));
    }
  });
})(window.bbn);