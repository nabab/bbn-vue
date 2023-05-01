/**
 * @file bbn-video component
 * @description bbn-video allows the execution and visualization of video files.
 * @copyrigth BBN Soutions
 * @author Mirko Argentino
 * @created 10/08/2020.
 */
return {
    /**
     * @mixin bbn.wc.mixins.basic
     */
    mixins: [bbn.wc.mixins.basic],
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
      },
      /**
       * Force an aspect ratio
       * @prop {String} aspectRatio
       */
      aspectRatio: {
        type: String,
        validator: ar => ['1/1', '16/9', '4/3', '3/2', '8/5'].includes(ar)
      }
    },
    data() {
      return {
        /**
         * This text will only be displayed in browsers that do not support the <video> element.
         * @data {String} ['To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video.'] browserMessage
         */
        browserMessage: bbn._('To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video.'),
        /**
         * @data {RegExp} [/^https?:\/\/w{0,3}\.?youtu\.?be(-nocookie)?(\.com)?\//gm] youtubeReg
         */
        youtubeReg: /^https?:\/\/w{0,3}\.?youtu\.?be(-nocookie)?(\.com)?\//gm,
        /**
         * @data {RegExp} [/^https?:\/\/vimeo(-nocookie)?(\.com)?\//gm] vimeoReg
         */
        vimeoReg: /^https?:\/\/vimeo(-nocookie)?(\.com)?\//gm,
        /**
         * @data {Boolean} [true] showPoster
         */
        showPoster: true
      }
    },
    computed: {
      /**
       * Returns the correct media type
       * @computed type
       * @return {String|Boolean}
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
       * @computed isYoutube
       * @return {Boolean}
       */
      isYoutube(){
        return !!this.source.match(this.youtubeReg);
      },
      /**
       * @computed isVimeo
       * @return {Boolean}
       */
      isVimeo(){
        return !!this.source.match(this.vimeoReg);
      },
      /**
       * Returns the correct url for embeded video
       * @computed videoSource
       * @return {String}
       */
      videoSource() {
        if (this.isYoutube) {
          let url = this.source.replace(this.youtubeReg, '');
          if (url.startsWith('watch?v=')) {
            url = bbn.fn.substr(url, 8);
          }
          return `${document.location.protocol}//youtube.com/embed/${url}?rel=0&autoplay=${this.autoplay ? 1 : 0}&controls=${this.controls ? 1 : 0}&mute=${this.muted || this.autoplay ? 1 : 0}&loop=${this.loop ? 1 : 0}`;
        }
        else if (this.isVimeo) {
          let url = this.source.replace(this.vimeoReg, '');
          return `${document.location.protocol}//player.vimeo.com/video/${url}?autoplay=${this.autoplay ? 1 : 0}&controls=${this.controls ? 1 : 0}&mute=${this.muted ? 1 : 0}&loop=${this.loop ? 1 : 0}&playlist=${url}`;
        }
        return this.source;
      }
    },
    watch: {
      source(){
        this.showPoster = true;
      }
    }
  };
