(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    init: (ele, cfg, mixins) => {
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

      bbn.vue.fullComponent = bbn.fn.extend(true, {}, bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent);
      bbn.vue.customMixins = mixins;
      let cfg2 = bbn.fn.extend({
        config: {
          compilerOptions: {
            isCustomElement: tag => bbn.vue.loadComponentsByPrefix(tag),
            errorHandler: (err, vm, info) => {
              // handle error
              // `info` is a Vue-specific error info, e.g. which lifecycle hook
              // the error was found in. Only available in 2.2.0+
              bbn.fn.log("ERROR handler from VueJS", err, vm, info);
            }
          },
          devtools: !(!bbn.env.mode || (bbn.env.mode === 'prod'))
        }
      });
      bbn.vue.addPrefix('bbn', (tag, resolve, reject) => {
        bbn.vue.queueComponentBBN(bbn.fn.substr(tag, 4), resolve, reject);
      });
      bbn.vue.app = Vue.createApp(cfg2);
      bbn.vue.app.mixin(bbn.vue.mixin);
      if (bbn.vue.directives) {
        bbn.fn.each(bbn.vue.directives, a => bbn.vue.app.directive(...a));
      }
      bbn.vue.app.component('bbns-container', bbn.fn.extend({
        name: 'bbns-container',
        //functional: true,
        template: '<div class="bbns-container bbn-hidden"><slot></slot></div>',
        props: {
          real: {
            type: Boolean,
            default: false
          }
        },
        mounted() {
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

      bbn.vue.app.config.compilerOptions.isCustomElement = tag => bbn.vue.loadComponentsByPrefix(tag);
      bbn.vue.app.mount(ele);

      /*
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
      */

    }
  });
})(window.bbn);