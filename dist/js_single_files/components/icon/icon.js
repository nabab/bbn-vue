((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<span :class="componentClass">
  <svg v-if="isLoading"
       xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 100 100"
       preserveAspectRatio="xMidYMid"
       class="lds-rolling"
       style="background: none; width: inherit; height: inherit">
    <circle cx="50"
            cy="50"
            fill="none"
            stroke="#647482"
            stroke-width="15"
            r="25"
            stroke-dasharray="117.80972450961724 41.269908169872416"
            transform="rotate(186 50 50)">
      <animateTransform attributeName="transform"
                        type="rotate"
                        calcMode="linear"
                        values="0 50 50;360 50 50"
                        keyTimes="0;1"
                        dur="1s"
                        begin="0s"
                        repeatCount="indefinite">
      </animateTransform>
    </circle>
  </svg>
  <template v-else-if="content" v-html="content"></template>
  <svg v-else
       xmlns="http://www.w3.org/2000/svg"
       x="0px"
       y="0px"
       viewBox="0 0 426.667 426.667"
       style="enable-background:new 0 0 426.667 426.667; width: inherit; height: inherit">
       xml:space="preserve">
    <path style="fill:#F05228;"
          d="M213.333,0C95.514,0,0,95.514,0,213.333s95.514,213.333,213.333,213.333	s213.333-95.514,213.333-213.333S331.153,0,213.333,0z M330.995,276.689l-54.302,54.306l-63.36-63.356l-63.36,63.36l-54.302-54.31	l63.356-63.356l-63.356-63.36l54.302-54.302l63.36,63.356l63.36-63.356l54.302,54.302l-63.356,63.36L330.995,276.689z"></path>
    <g></g>
    <g></g>
    <g></g>
    <g></g>
    <g></g>
    <g></g>
    <g></g>
    <g></g>
    <g></g>
    <g></g>
    <g></g>
    <g></g>
    <g></g>
    <g></g>
    <g></g>
  </svg>
</span>`;
script.setAttribute('id', 'bbn-tpl-component-icon');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
 * @file bbn-icon component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 */
(function() {
  "use strict";
  Vue.component('bbn-icon', {
    name: 'bbn-icon',
    /**
     * @mixin bbn.vue.basicComponent
     */
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


})(bbn);