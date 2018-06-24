(function() {
  "use strict";
  Vue.component('bbn-icon', {
    name: 'bbn-icon',
    mixins: [bbn.vue.basicComponent],
    data(){
      return {
        content: '',
        isLoading: true,
        isNotFound: false
      }
    }
  })
})();
