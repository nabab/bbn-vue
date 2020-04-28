<template>
<iframe :class="['bbn-reset', 'bbn-block', componentClass]"
        :sandbox="sandbox"
        :src="url"
        @load="load"></iframe>
</template>
<script>
  module.exports = /**
 * @file bbn-browser component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-frame', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      sandbox: {
        default: ''
      },
      url: {
        type: String
      },
      root: {
        type: String,
        default: ''
      },
      communication: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        window: null
      }
    },
    computed: {
    },
    methods: {
      sendMessage(msg){
        this.$el.contentWindow.postMessage(msg, '*');
      },
      sendID(){
        setTimeout(() => {
          this.sendMessage(this._uid);
        }, 1000);
      },
      load(){
        if ( this.communication ){
          this.sendID();
        }
        if (this.root) {
          let ev = new Event('load', {cancelable: true});
          let url = this.$el.contentWindow.location.href.substr(this.root.length);
          this.$emit('load', ev, url);
          if (!ev.defaultPrevented) {
            let ct = this.closest('bbn-container');
            if (ct && ct.router && url && (ct.router.currentURL !== (ct.url + '/' + url))) {
              bbn.fn.log(ct.router.currentURL, (ct.url + '/' + url));
              ct.router.route(ct.url + '/' + url);
            }
          }
        }
      },
      listen(msg){
        if ( this.communication ){
          if ( msg.data && (msg.data.uid === this._uid) ){
            this.$emit('message', msg.data.message);
          }
        }
      },
      route(url) {
        if (this.$el.contentWindow.location.href !== (this.root + url)) {
          this.$el.contentWindow.location.href = this.root + url;
        }
      }
    },
    created(){
      if ( this.communication ){
        window.addEventListener('message', this.listen, false);
      }
    },
    beforeDestroy(){
      if ( this.communication ){
        window.removeEventListener('message', this.listen);
      }
    }
  });

})(bbn);

</script>
<style scoped>
.bbn-iframe {
  border: 0;
}

</style>
