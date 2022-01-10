(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-flex-height', {'bbn-box': skin}]"
     :style="{
       width: width,
       height: height
     }"
>
  <div v-if="title && (titlePosition === 'top')"
       :class="['bbn-c', {
         'bbn-header': skin,
         'bbn-radius-top': skin,
         'bbn-no-border-top': skin,
         'bbn-no-border-left': skin,
         'bbn-no-border-right': skin,
       }, titleCls]"
       v-html="title"
       :style="{
         background: titleBackground,
         color: titleColor
       }"
  ></div>
  <div class="bbn-flex-fill">
    <iframe v-if="youtube"
            width="100%"
            height="100%"
            :src="youtubeSource"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
            :class="cls"
    ></iframe>
    <video v-else
           :autoplay="autoplay"
           :controls="controls"
           :loop="false"
           :muted="muted"
           preload="auto"
           :poster="poster"
           height="100%"
           width="100%"
           :style="{background: background}"
           :class="[cls, {
             'bbn-bordered-bottom': skin,
             'bbn-bordered-left': skin,
             'bbn-bordered-right': skin,
             'bbn-radius-bottom': skin
           }]"
    >
      <source v-if="source"
              :src="source"
              :type="type"
      ></source>
      <p v-text="browserMessage"></p>
    </video>
  </div>
  <div v-if="title && (titlePosition === 'bottom')"
       :class="['bbn-c', {
         'bbn-header': skin,
         'bbn-radius-bottom': skin,
         'bbn-no-border-bottom': skin,
         'bbn-no-border-left': skin,
         'bbn-no-border-right': skin,
       }, titleCls]"
       v-html="title"
       :style="{
         background: titleBackground,
         color: titleColor
       }"
  ></div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-video');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

/**
 * @file bbn-video component
 * @description bbn-video allows the execution and visualization of video files.
 * @copyrigth BBN Soutions
 * @author Mirko Argentino
 * @created 10/08/2020.
 */
(bbn => {
  "use strict";
  Vue.component('bbn-video', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * The video's URL or the video's code (YouTube)
       * @prop {String} source
      */
      source: {
        type: String,
        required: true
      },
      /**
       * The video's title
       * @prop {String} [''] title
       */
      title: {
        type: String,
        default: ''
      },
      /**
       * The title's position(top or bottom)
       * @prop {String} ['top'] titlePosition
       */
      titlePosition: {
			  type: String,
        default: 'top',
        validator: p => ['top', 'bottom'].includes(p)
      },
      /**
       * The title's background
       * @prop {String} titleBackground
       */
      titleBackground: {
        type: String
      },
      /**
       * The title's color
       * @prop {String} titleColor
       */
      titleColor: {
        type: String
      },
      /**
       * Additional classes for the title
       * @prop {String} titleCls
       */
      titleCls: {
        type: String
      },
      /**
       * The video's width
       * @prop {String} ['100%'] width
       */
      width: {
        type: String,
        default: '100%'
      },
      /**
       * The video's height
       * @prop {String} ['100%'] height
       */
      height: {
        type: String,
        default: '100%'
      },
      /**
       * Specifies that the video will start playing as soon as it is ready
       * @prop {Boolean} [false] autoplay
       */
      autoplay: {
        type: Boolean,
        default: false
      },
      /**
       * Specifies that video controls should be displayed
       * @prop {Boolean} [false] controls
       */
      controls: {
        type: Boolean,
        default: false
      },
      /**
       * Specifies that the video will start over again, every time it is finished
       * @prop {Boolean} [false] loop
       */
      loop: {
        type: Boolean,
        default: false
      },
      /**
       * Specifies that the audio output should be muted
       * @prop {Boolean} [false] muted
       */
      muted: {
        type: Boolean,
        default: false
      },
      /**
       * Specifies an image to be shown while the video is downloading, or until the user hits the play button
       * @prop {String} [''] poster
       */
      poster: {
        type: String,
        default: ''
      },
      /**
       * Set it to true if you're using a YuoTube video code as source property
       * @prop {Boolean} [false] youtube
       */
      youtube: {
        type: Boolean,
        default: false
      },
      /**
       * Set it to true if yuo want to use a skinned player
       * @prop {Boolean} [false] skin
       */
      skin: {
        type: Boolean,
        default: false
      },
      /**
       * A custom background for the player
       * @prop {String} background
       */
      background: {
        type: String
      },
      /**
       * Additional classes for the player
       * @prop {String} cls
       */
      cls: {
        type: String
      }
    },
    data(){
      return {
        /**
         * This text will only be displayed in browsers that do not support the <video> element.
         * @data {String} ['To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video.'] browserMessage
         */
        browserMessage: bbn._('To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video.')
      }
    },
    computed: {
      /**
       * Returns the correct media type
       * @computed type
       * @return String|Boolean
       */
      type(){
        if ( this.source ){
          switch ( this.source.substr(this.source.lastIndexOf('.') + 1).toLowerCase() ){
            case 'mp4':
              return 'video/mp4';
            case 'webm':
              return 'video/webm';
            case 'ogg':
              return 'video/ogg';
            default:
              return '';
          }
        }
        return false;
      },
      /**
       * Returns the correct url for YoutTube video
       * @computed youtubeSource
       * @return String
       */
      youtubeSource(){
        return this.youtube ? `${document.location.protocol}//youtube.com/embed/${this.source}?autoplay=${this.autoplay ? 1 : 0}&controls=${this.controls ? 1 : 0}&loop=${this.loop ? 1 : 0}` : '';
      }
    }
  });
})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}