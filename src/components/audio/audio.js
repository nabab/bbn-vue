/**
 * @file bbn-audio component
 * @description bbn-audio allows the execution of audio files.
 * @copyright BBN Solutions
 * @author Mirko Argentino
 * * @created 11/08/2020.
 */
(function (bbn) {
  "use strict";
  Vue.component("bbn-audio", {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * The aduio's URL
       * @prop {String} [true] source
       */
      source: {
        type: String,
        required: true,
      },
      /**
       * The audio's title
       * @prop {String} [''] title
       */
      title: {
        type: String,
        default: "",
      },
      /**
       * The title's position(top or bottom)
       * @prop {String} ['top'] titlePosition
       */
      titlePosition: {
        type: String,
        default: "top",
        validator: (p) => ["top", "bottom"].includes(p),
      },
      /**
       * The title's background
       * @prop {String} titleBackground
       */
      titleBackground: {
        type: String,
      },
      /**
       * The title's color
       * @prop {String} titleColor
       */
      titleColor: {
        type: String,
      },
      /**
       * Additional classes for the title
       * @prop {String} titleCls
       */
      titleCls: {
        type: String,
      },
      /**
       * The player's width
       * @prop {String} ['100%'] width
       */
      width: {
        type: String,
        default: "100%",
      },
      /**
       * The player's height
       * @prop {String} height
       */
      height: {
        type: String,
      },
      /**
       * Specifies that the audio will start playing as soon as it is ready
       * @prop {Boolean} [false] autoplay
       */
      autoplay: {
        type: Boolean,
        default: false,
      },
      /**
       * Specifies that audio controls should be displayed
       * @prop {Boolean} [true] controls
       */
      controls: {
        type: Boolean,
        default: true,
      },
      /**
       * Specifies that the audio will start over again, every time it is finished
       * @prop {Boolean} [false] loop
       */
      loop: {
        type: Boolean,
        default: false,
      },
      /**
       * Specifies that the audio output should be muted
       * @prop {Boolean} [false] muted
       */
      muted: {
        type: Boolean,
        default: false,
      },
      /**
       * Set it to true if yuo want to use a skinned player
       * @prop {Boolean} [false] skin
       */
      skin: {
        type: Boolean,
        default: false,
      },
      /**
       * A custom background for the player
       * @prop {String} background
       */
      background: {
        type: String,
      },
      /**
       * Additional classes for the player
       * @prop {String} cls
       */
      cls: {
        type: String,
      },
    },
    data() {
      return {
        /**
         * This text will only be displayed in browsers that do not support the <video> element.
         * @data {String} ['Your browser does not support the audio tag.'] browserMessage
         */
        browserMessage: bbn._("Your browser does not support the audio tag."),
        /**
         * The native audio element
         * @data {HTMLElement} widget
         */
        widget: null,
      };
    },
    computed: {
      /**
       * Returns the correct media type
       * @computed type
       * @return String|Boolean
       */
      type() {
        if (this.source) {
          switch (
            this.source.substr(this.source.lastIndexOf(".") + 1).toLowerCase()
          ) {
            case "mp3":
              return "audio/mpeg";
            case "wav":
              return "video/wav";
            case "ogg":
              return "audio/ogg";
            default:
              return "";
          }
        }
        return false;
      },
    },
    methods: {
      play() {
        this.widget.play();
      },
      pause() {
        this.widget.pause();
      },
      onPlay(ev) {
        this.$emit("play", ev, this);
      },
      onPause(ev) {
        this.$emit("pause", ev, this);
      },
      // This function will check muted condition and it will set audio volume using this.widget
      // function will invoke in vue life cycle
      onMuted() {
        this.widget.volume = this.muted ? 0 : 1;
      },
    },
    mounted() {
      this.widget = this.getRef("audio");
      // check mounted condition and set volume of the  widget
      this.onMuted();
    },
  });
})(bbn);
