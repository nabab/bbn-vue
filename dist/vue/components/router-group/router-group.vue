<template>
<div :class="[componentClass, {
       'bbn-invisible': !ready,
       'bbn-overlay': true
     }]">
  <bbn-splitter :orientation="orientation" :resizable="true">
    <bbn-pane v-for="router in routers">
      <bbn-router v-bind="router"></bbn-router>
    </bbn-pane>
  </bbn-splitter>
</div>
</template>
<script>
  module.exports = /**
 * @file bbn-router component
 * @description bbn-router is a component that allows and manages the navigation (url) between the various containers of an application
 * @copyright BBN Solutions
 * @author BBN Solutions
 */
(function(bbn, Vue){
  "use strict";

  Vue.component("bbn-router-group", {
    name: 'bbn-router-group',
    mixins: [
      /**
       * @mixin bbn.vue.basicComponent
       * @mixin bbn.vue.localStorageComponent
       */
      bbn.vue.basicComponent,
      bbn.vue.localStorageComponent,
    ],
    props: {
      /**
       * The URL on which the router will be initialized.
       * @prop {String} ['] url
       */
      separator: {
        type: String,
        default: '!'
      },
      /**
       * The URL on which the router will be initialized.
       * @prop {String} ['] url
       */
      url: {
        type: String,
        default: ''
      },
    },
    data(){
      return {
      };
    },
    computed: {
    },

    methods: {
    },

    /**
     * @event created
     */
    created(){
    },
    /**
     * @event mounted
     * @fires getStorage
     * @fires getDefaultURL
     * @fires add
     */
    mounted(){
    },
    /**
     * @event beforeDestroy
     */
    beforeDestroy(){
    },
    watch: {
    }
  });

})(bbn, Vue);
</script>
<style scoped>
div.bbn-router {
  border: 0 !important;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  margin: 0;
}
div.bbn-router .bbn-router-nav {
  margin-top: 0;
}
div.bbn-router .bbn-router-nav .bbn-router-nav:not(.bbn-router-nav-bc) {
  padding-top: 0.5em;
  height: 100%;
}
div.bbn-router .bbn-router-nav.bbn-router-nav-bc .bbn-router-breadcrumb-master {
  height: 2.5em;
}
div.bbn-router .bbn-router-nav .bbn-router-loading {
  content: " ";
  display: block;
  width: 8px;
  height: 8px;
  margin: 1px;
  border-radius: 50%;
  border-style: solid;
  border-width: 3px;
  border-right-color: transparent !important;
  border-left-color: transparent !important;
  animation: bbn-router-loader 1.2s linear infinite;
}
div.bbn-router .bbn-router-nav .bbn-pane .bbn-router-nav:not(.bbn-router-nav-bc) {
  margin-top: 0;
}
div.bbn-router .bbn-router-nav .bbn-pane .bbn-router-nav:not(.bbn-router-nav-bc) .bbn-router-nav:not(.bbn-router-nav-bc) {
  margin-top: 0.5em;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs {
  border: 0 !important;
  overflow: hidden;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  zoom: 1;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs div.bbn-router-tabs-ul-container {
  width: 100%;
  height: 100%;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs.bbn-router-tabs-scrollable > div.bbn-router-tabs-container div.bbn-router-tabs-ul-container {
  padding: 0 !important;
  height: 2.4em;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs.bbn-router-tabs-scrollable > div.bbn-router-tabs-container div.bbn-router-tabs-ul-container ul.bbn-router-tabs-tabs:first-child {
  white-space: nowrap;
  overflow: hidden;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container {
  width: 100%;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child {
  height: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  border-top-width: 0px;
  border-left-width: 0px;
  border-right-width: 0px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li {
  height: 2.4em;
  list-style-type: none;
  text-decoration: none;
  margin: 0 !important;
  vertical-align: middle;
  position: relative;
  border-bottom: 0;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li i:focus,
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li span:focus {
  animation: bbn-anim-blinker 1s linear infinite;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li .bbn-router-tabs-badge-container {
  position: absolute;
  top: 0;
  left: 1px;
  bottom: 0px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li .bbn-router-tabs-tab-loader {
  display: inline-block;
  width: 12px;
  height: 12px;
  position: absolute;
  top: 0.4em;
  left: 2px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li .bbn-router-tabs-tab-loader:after {
  content: " ";
  display: block;
  width: 8px;
  height: 8px;
  margin: 1px;
  border-radius: 50%;
  border-style: solid;
  border-width: 2px;
  border-right-color: transparent !important;
  border-left-color: transparent !important;
  animation: bbn-router-tabs-tab-loader 1.2s linear infinite;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-tab {
  cursor: pointer;
  color: inherit;
  padding: 0.3em 1.15em 0.5em 1.15em;
  vertical-align: middle;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-tab > .bbn-router-tab-text {
  font-size: 1.1em;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-tab > .bbn-router-tabs-main-icon {
  line-height: 100%;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-tab::after,
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-tab::before {
  font-family: monospace;
  content: " ";
  white-space: pre;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-tab.bbn-router-tabs-dirty::after {
  content: "*";
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li i.bbn-router-tabs-icon {
  display: block;
  position: absolute;
  right: 2px;
  font-size: 1em;
  cursor: pointer;
  margin: 0;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li i.bbn-router-tabs-icon.bbn-router-tab-close {
  top: 1px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li i.bbn-router-tabs-icon.bbn-router-tab-menu {
  bottom: -2px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li div.bbn-router-tabs-selected {
  display: none;
  position: absolute;
  bottom: 1px;
  left: 1.15em;
  right: 1.15em;
  height: 3px;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li.bbn-router-tabs-static div.bbn-router-tabs-icons i.bbn-router-tab-close {
  display: none;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li.bbn-router-tabs-active div.bbn-router-tabs-icons i.bbn-router-tab-menu {
  display: block;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container ul.bbn-router-tabs-tabs:first-child > li.bbn-router-tabs-active div.bbn-router-tabs-selected {
  display: block;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader {
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  background-color: black;
  color: white;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation {
  margin-top: 2em;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation h1 {
  font-size: 3.5em !important;
  text-align: center;
  margin-top: 1em;
  color: white;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid {
  width: 120px;
  height: 120px;
  margin: auto;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube {
  width: 33%;
  height: 33%;
  float: left;
  background-color: white;
  -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
  animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube1 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube2 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube3 {
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube4 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube5 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube6 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube7 {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube8 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube9 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container div.bbn-router-tabs-button {
  width: 2.5em;
  height: 2.4em;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs > div.bbn-router-tabs-container > span.bbn-button {
  top: 0.4em;
  position: absolute;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs .bbn-router-tabs {
  margin-top: 0.5em;
  height: calc(99.5%);
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs .bbn-router-tabs .bbn-router-tabs {
  margin-top: 0 !important;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs .bbn-pane .bbn-router-tabs {
  margin-top: 0;
}
div.bbn-router .bbn-router-nav div.bbn-router-tabs .bbn-pane .bbn-router-tabs .bbn-router-tabs {
  margin-top: 0.5em;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb {
  border: 0 !important;
  overflow: hidden;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  zoom: 1;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container {
  height: 100%;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container .bbn-router-breadcrumb-badge-container {
  position: absolute;
  top: 0;
  left: 1px;
  bottom: 0px;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container .bbn-router-breadcrumb-loader {
  display: inline-block;
  width: 12px;
  height: 12px;
  position: absolute;
  top: 0.4em;
  left: 2px;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container .bbn-router-breadcrumb-loader:after {
  content: " ";
  display: block;
  width: 8px;
  height: 8px;
  margin: 1px;
  border-radius: 50%;
  border-style: solid;
  border-width: 2px;
  border-right-color: transparent !important;
  border-left-color: transparent !important;
  animation: bbn-router-loader 1.2s linear infinite;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container div.bbn-router-breadcrumb-element {
  color: inherit;
  padding: 0 0.8em;
  vertical-align: middle;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container div.bbn-router-breadcrumb-element > .bbn-router-breadcrumb-element-icon {
  line-height: 100%;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container div.bbn-router-breadcrumb-element::after,
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container div.bbn-router-breadcrumb-element::before {
  font-family: monospace;
  content: " ";
  white-space: pre;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container div.bbn-router-breadcrumb-element.bbn-router-breadcrumb-dirty::after {
  content: "*";
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container i.bbn-router-breadcrumb-icon {
  display: block;
  position: absolute;
  right: 2px;
  font-size: 1em;
  cursor: pointer;
  margin: 0;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container i.bbn-router-breadcrumb-icon.bbn-router-breadcrumb-close {
  top: 1px;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container i.bbn-router-breadcrumb-icon.bbn-router-breadcrumb-menu {
  bottom: -2px;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container .bbn-router-breadcrumb-arrow {
  margin-right: .7em;
  margin-left: .7em;
  vertical-align: middle;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader {
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  background-color: black;
  color: white;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation {
  margin-top: 2em;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation h1 {
  font-size: 3.5em !important;
  text-align: center;
  margin-top: 1em;
  color: white;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid {
  width: 120px;
  height: 120px;
  margin: auto;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube {
  width: 33%;
  height: 33%;
  float: left;
  background-color: white;
  -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
  animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube1 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube2 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube3 {
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube4 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube5 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube6 {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube7 {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube8 {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
}
div.bbn-router .bbn-router-nav div.bbn-router-breadcrumb > div.bbn-router-breadcrumb-container > div.bbn-loader div.loader-animation .sk-cube-grid .sk-cube.sk-cube9 {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
}
@keyframes bbn-router-loader {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes sk-cubeGridScaleDelay {
  0%,
  70%,
  100% {
    -webkit-transform: scale3D(1,1,1);
    transform: scale3D(1,1,1);
  }
  35% {
    -webkit-transform: scale3D(0,0,1);
    transform: scale3D(0,0,1);
  }
}
@keyframes bbn-router-tabs-tab-loader {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes sk-cubeGridScaleDelay {
  0%,
  70%,
  100% {
    -webkit-transform: scale3D(1,1,1);
    transform: scale3D(1,1,1);
  }
  35% {
    -webkit-transform: scale3D(0,0,1);
    transform: scale3D(0,0,1);
  }
}

</style>
