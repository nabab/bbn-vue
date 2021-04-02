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
  <div class="bbn-flex-fill"
      :style="{
        background: background || (skin ? '#F1F3F4' : '')
      }"
  >
    <audio ref="audio"
           :autoplay="autoplay"
           :controls="controls"
           :loop="false"
           :muted="muted"
           preload="auto"
           :style="{
             background: background,
             width: '100%',
             height: height ? '100%' : ''
           }"
           :class="[cls, {
             'bbn-bordered-bottom': skin,
             'bbn-bordered-left': skin,
             'bbn-bordered-right': skin,
             'bbn-radius-bottom': skin
           }]"
           @play="onPlay"
           @pause="onPause"
    >
      <source v-if="source"
              :src="source"
              :type="type"
      ></source>
      <p v-text="browserMessage"></p>
    </audio>
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
script.setAttribute('id', 'bbn-tpl-component-audio');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
 * @file bbn-audio component
 * @description bbn-audio allows the execution of audio files.
 * @copyright BBN Solutions
 * @author Mirko Argentino
 * * @created 11/08/2020.
 */
(function(bbn){
  "use strict";
  Vue.component('bbn-audio', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * The aduio's URL
       */
      source: {
        type: String,
        required: true
      },
      /**
       * The audio's title
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
       * The player's width
       * @prop {String} ['100%'] width
       */
      width: {
        type: String,
        default: '100%'
      },
      /**
       * The player's height
       * @prop {String} height
       */
      height: {
        type: String
      },
      /**
       * Specifies that the audio will start playing as soon as it is ready
       * @prop {Boolean} [false] autoplay
       */
      autoplay: {
        type: Boolean,
        default: false
      },
      /**
       * Specifies that audio controls should be displayed
       * @prop {Boolean} [true] controls
       */
      controls: {
        type: Boolean,
        default: true
      },
      /**
       * Specifies that the audio will start over again, every time it is finished
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
         * @data {String} ['Your browser does not support the audio tag.'] browserMessage
         */
        browserMessage: bbn._('Your browser does not support the audio tag.'),
        /**
         * The native audio element
         * @data {HTMLElement} widget
         */
        widget: null
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
            case 'mp3':
              return 'audio/mpeg';
            case 'wav':
              return 'video/wav';
            case 'ogg':
              return 'audio/ogg';
            default:
              return '';
          }
        }
        return false;
      }
    },
    methods: {
      play(){
        this.widget.play();
      },
      pause(){
        this.widget.pause();
      },
      onPlay(ev){
        this.$emit('play', ev, this);
      },
      onPause(ev){
        this.$emit('pause', ev, this);
      },
    },
    mounted(){
      this.widget = this.getRef('audio');
    }
  });
})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}