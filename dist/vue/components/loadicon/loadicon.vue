<template>
<span :class="componentClass">
  <svg xmlns:svg="http://www.w3.org/2000/svg"
       xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink"
       version="1.0"
       :width="currentSize"
       :height="currentSize"
       viewBox="0 0 128 128"
       xml:space="preserve"
  >
    <g>
      <path d="M59.6 0h8v40h-8V0z" fill="#000000" fill-opacity="1"/>
      <path d="M59.6 0h8v40h-8V0z" fill="#cccccc" fill-opacity="0.2" transform="rotate(30 64 64)"/>
      <path d="M59.6 0h8v40h-8V0z" fill="#cccccc" fill-opacity="0.2" transform="rotate(60 64 64)"/>
      <path d="M59.6 0h8v40h-8V0z" fill="#cccccc" fill-opacity="0.2" transform="rotate(90 64 64)"/>
      <path d="M59.6 0h8v40h-8V0z" fill="#cccccc" fill-opacity="0.2" transform="rotate(120 64 64)"/>
      <path d="M59.6 0h8v40h-8V0z" fill="#b2b2b2" fill-opacity="0.3" transform="rotate(150 64 64)"/>
      <path d="M59.6 0h8v40h-8V0z" fill="#999999" fill-opacity="0.4" transform="rotate(180 64 64)"/>
      <path d="M59.6 0h8v40h-8V0z" fill="#7f7f7f" fill-opacity="0.5" transform="rotate(210 64 64)"/>
      <path d="M59.6 0h8v40h-8V0z" fill="#666666" fill-opacity="0.6" transform="rotate(240 64 64)"/>
      <path d="M59.6 0h8v40h-8V0z" fill="#4c4c4c" fill-opacity="0.7" transform="rotate(270 64 64)"/>
      <path d="M59.6 0h8v40h-8V0z" fill="#333333" fill-opacity="0.8" transform="rotate(300 64 64)"/>
      <path d="M59.6 0h8v40h-8V0z" fill="#191919" fill-opacity="0.9" transform="rotate(330 64 64)"/>
      <animateTransform attributeName="transform" type="rotate" values="0 64 64;30 64 64;60 64 64;90 64 64;120 64 64;150 64 64;180 64 64;210 64 64;240 64 64;270 64 64;300 64 64;330 64 64" calcMode="discrete" dur="1080ms" repeatCount="indefinite"></animateTransform>
    </g>
  </svg>
</span>

</template>
<script>
  module.exports = /**
 * @file bbn-loadicon component
 *
 * @description bbn-loadicon is a simple implementation component, which represents an icon displaying a waiting state.
 *
 * @copyright BBN Solutions
 *
 * @author  BBN Solutions
 * 
 * @created 07/01/2017
 */

(function(bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-loadicon', {
    /**
     * @mixin bbn.vue.basicComponent 
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * The size of the icon container
       * @prop {Number|String} [16] size
       */
      size: {
        type: [Number, String],
        default: 16
      },
    },
    computed: {
      currentSize(){
        return bbn.fn.formatSize(this.size);
      }

    }
  });

})(bbn);

</script>
