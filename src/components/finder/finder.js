/**
 * Created by BBN on 10/02/2017.
 */
(function ($, bbn) {
  "use strict";
  Vue.component('bbn-finder', {
    mixins: [bbn.vue.basicComponent, bbn.vue.dataEditorComponent],
    name: 'bbn-finder',
    props: {
      source: {
        type: String,
        default () {
          return '';
        }
      },
      origin: {
        type: String,
        default () {
          return 'BBN_DATA_PATH';
        }
      }
    },
    data() {
      return {
        host: '',
        user: '',
        pass: '',
        origin: this.origin

      };
    },
    mounted(){
      if ( this.source.length ){
        bbn.fn.post(this.source, {
          'path' : 'dfasfda'
        });
      }
    },
    computed: {
      
    },
    methods: {
      
    },
    components: {
      
    }
  });

})(jQuery, bbn);