((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<audio preload="none" controls>
  <source src="https://icecast.radiofrance.fr/fipnouveautes-midfi.mp3" type="audio/ogg">
  Your browser does not support the audio element.
</audio>
`;
script.setAttribute('id', 'bbn-tpl-component-audio');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
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
  Vue.component('bbn-audio', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      source: {}
    },
    data(){
      return {
        tabs: [{

        }]
      }
    },
    computed: {
      /**
       * Return if the button is disabled.
       *
       * @computed isDisabled
       * @return {Boolean}
       */
      isDisabled(){
        return typeof(this.disabled) === 'function' ?
          this.disabled() : this.disabled
      }
    },
    methods: {
    },
    mounted(){
    }
  });

})(bbn);

})(bbn);