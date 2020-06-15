((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<video
        class="video-js"
        controls
        preload="auto"
        poster="//vjs.zencdn.net/v/oceans.png"
        data-setup='{}'>
  <source src="//vjs.zencdn.net/v/oceans.mp4" type="video/mp4"></source>
  <source src="//vjs.zencdn.net/v/oceans.webm" type="video/webm"></source>
  <source src="//vjs.zencdn.net/v/oceans.ogv" type="video/ogg"></source>
  <p class="vjs-no-js">
    To view this video please enable JavaScript, and consider upgrading to a
    web browser that
    <a href="http://videojs.com/html5-video-support/" target="_blank">
      supports HTML5 video
    </a>
  </p>
</video>`;
script.setAttribute('id', 'bbn-tpl-component-video');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
 * @file bbn-video component
 *
 * @description bbn-video is an interface reader that allows the execution and visualization of video files.
 *
 * @copyrigth BBN Soutions
 *
 * @author Mirko Argentino
 *
 * @created 24/05/2017.
 */
((videojs) => {
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-video', {
    mixins: [bbn.vue.basicComponent],
    props: {
      source: {},
      type: {
        type: String,
        default: 'line'
      },
      /**
       * String => the same title to axixs X and Y.
       * Object => {x: 'titlex', y: 'titley'}
       */
			title: {
        type: String,
        default: ''
      },
      titleX: {
			  type: String,
        default: undefined
      },
      titleY: {
			  type: String,
        default: undefined
      },
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '100%'
      },
      cfg: {
        type: Object,
        default(){
          return {};
        }
      }
    },
    computed: {
    },
    methods: {
    },
    watch: {
      source(val){
        this.init();
      },
    },
    mounted(){
      videojs(this.$el);
    }
  });
})(videojs);

})(bbn);