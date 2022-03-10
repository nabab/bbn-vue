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
    data() {
      return {
        /**
         * This text will only be displayed in browsers that do not support the <video> element.
         * @data {String} ['To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video.'] browserMessage
         */
        browserMessage: bbn._('To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video.'),
        videoType: "video",
        videoUrl: "",
      }
    },
    computed: {
      /**
       * Returns the correct media type
       * @computed type
       * @return String|Boolean
       */
      type() {
        if (this.source) {
          switch (bbn.fn.substr(this.source, this.source.lastIndexOf('.') + 1).toLowerCase()) {
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
      youtubeSource() {
        return (this.videoType == "youtube") ? `${document.location.protocol}//youtube.com/embed/${this.videoUrl}?rel=0&amp;autoplay=${this.autoplay ? 1 : 0}&controls=${this.controls ? 1 : 0}&mute=${this.muted ? 1 : 0}&loop=${this.loop ? 1 : 0}&playlist=${this.videoUrl}` : '';
      },
      vimeoSource() {
        return (this.videoType == "vimeo") ? `${document.location.protocol}//player.vimeo.com/video/${this.videoUrl}?autoplay=${this.autoplay ? 1 : 0}&controls=${this.controls ? 1 : 0}&mute=${this.muted ? 1 : 0}&loop=${this.loop ? 1 : 0}&playlist=${this.videoUrl}` : '';
      }
    },
    mounted() {
      let youtubeReg = /^https?:\/\/w{0,3}\.?youtu\.?be(-nocookie)?(\.com)?\//gm;
      if (this.source.search(youtubeReg) > -1) {
        this.videoUrl = this.source.substring(this.source.indexOf("watch?v=") + 8);
        this.videoType = "youtube";
      }
      let vimeoReg = /^https?:\/\/vimeo(-nocookie)?(\.com)?\//gm;
      if (this.source.search(vimeoReg) > -1) {
        this.videoUrl = this.source.substring(this.source.indexOf("vimeo.com/") + 10);
        this.videoType = "vimeo";
      }
    }
  });
})(bbn);
