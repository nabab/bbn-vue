<template>
<button :class="[{'bbn-button-icon-only': notext}, componentClass]"
        ref="element"
        @click="click($event)"
        @focus="focus($event)"
        @blur="blur($event)"
        @keydown="keydown($event)"
        @keyup="keyup($event)"
        @mouseenter="over($event)"
        @mouseleave="out($event)"
        :type="type"
        :disabled="isDisabled"
        :title="titleString"
>
  <span v-if="icon && (iconPosition === 'left')" class="bbn-button-icon">
    <i :class="icon"> </i>
    <i v-if="secondary"
       :class="secondary + ' secondary'"
       :style="{
        color: secondaryColor,
        transform: 'scale(0.7)',
        bottom: '0.2em',
        left: '0.7em',
        position: 'absolute'
      }"
    ></i>
  </span>
  <span v-if="!notext && text"
        v-html="text"
        :style="{
          paddingLeft: icon && (iconPosition === 'left') ? (secondary ? '1em' : '0.3em') : '',
          paddingRight: icon && (iconPosition === 'right') ? (secondary ? '1em' : '0.3em') : ''
        }"></span>
  <span v-else-if="!notext"><slot></slot></span>
  <span v-if="icon && (iconPosition === 'right')" class="bbn-iblock bbn-m">
    <i :class="icon"> </i>
    <i v-if="secondary"
       :class="secondary + ' secondary'"
       :style="{
        color: secondaryColor,
        transform: 'scale(0.7)',
        bottom: '0.2em',
        left: '0.7em',
        position: 'absolute'
      }"
    ></i>
  </span>
</button>
</template>
<script>
  module.exports = /**
 * @file bbn-button component
 *
 * @description bbn-button is a component represents the button with the possibility of extensive customizations.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-button', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.eventsComponent],
    props: {
      /**
       * The title of the button.
       *
       * @prop {String} [''] title
       */
      title: {
        type: String,
        default: ''
      },
      /**
      * The button's text.
      *
      * @prop {String} text
      */
      text: {
        type: String,
      },
      /**
      * Set to false for no text on the button.
      *
      * @prop {Boolean} [false] notext
      */
      notext: {
        type: Boolean,
        default: false
      },
      /**
       * The button links to a designated url.
       *
       * @prop {String} url
       */
      url: {
        type: String
      },
      /**
       * The icon shown on the button.
       *
       *  @prop {String} icon
       */
      icon: {
        type: String,
      },
      /**
       * The icon(s) position (left or right).
       *
       * @prop {String} ['left'] iconPosition
       */
      iconPosition: {
        type: String,
        default: 'left',
        validator: (p) => ['left', 'right'].includes(p)
      },
      /**
       * A second icon to display on the button above the main icon.
       *
       * @prop {String} secondary
       */
      secondary: {
        type: String
      },
      /**
       * If defined the prop secondary, defines the color of the second icon of the button.
       *
       * @prop {String} [null] secondaryColor
       */
      secondaryColor: {
        type: String,
        default: null
      },
      /**
       * Specifies the type of button.
       *
       * @prop {String} ['button'] type
       */
      type: {
        type: String,
        default: 'button'
      },
      /**
       * Set to true to disable the button.
       *
       * @prop {Boolean|Function} [false] disabled
       */
      disabled: {
        type: [Boolean, Function],
        default: false
      },
      /**
       * Set to true for the button to glow.
       *
       * @prop {Boolean|Function} [false] glowing
       */
      glowing: {
        type: [String, Boolean],
        default: false
      },
      /**
       * State the button's glowing colour.
       *
       * @prop {String} ['#c4a300'] glowingColor
       */
      glowingColor: {
        type: String,
        default: '#c4a300'
      },
      /**
       * The action that has to be performed at the event click.
       *
       * @prop {Function|String} action
       */
      action: {
        type: [Function, String]
      }
    },
    computed: {
      /**
       * Returns a combination of the properties 'text' and 'title' if the property 'noText' is set to true, else returns the property 'title'.
       *
       * @computed titleString
       * @return {String}
       */
      titleString(){
        let st = '';
        if ( this.notext && this.text ){
          st += this.text;
        }
        if ( this.title ){
          st += (st === '' ? '' : ' - ') + this.title;
        }
        return st;
      },
      /**
       * Return if the button is disabled.
       *
       * @computed isDisabled
       * @fires disabled
       * @return {Boolean}
       */
      isDisabled(){
        return typeof(this.disabled) === 'function' ?
          this.disabled() : this.disabled
      }
    },
    methods: {
      /**
       * The role of the button when clicked.
       *
       * @method click
       * @param {Event} e
       * @fires action
       * @emit click
       */
      click(e){
        if ( this.url ){
          bbn.fn.link(this.url);
        }
        else{
          this.$emit('click', e, this);
          if ( !e.defaultPrevented && this.action ){
            this.action(e, this);
          }
        }
      }
    }
  });
})(bbn);

</script>
<style scoped>
@-webkit-keyframes bbn-button-glowing-red {
  0% {
    background-color: #B20000;
    -webkit-box-shadow: 0 0 3px #B20000;
  }
  50% {
    background-color: #FF0000;
    -webkit-box-shadow: 0 0 40px #FF0000;
  }
  100% {
    background-color: #B20000;
    -webkit-box-shadow: 0 0 3px #B20000;
  }
}
@-moz-keyframes bbn-button-glowing-red {
  0% {
    background-color: #B20000;
    -moz-box-shadow: 0 0 3px #B20000;
  }
  50% {
    background-color: #FF0000;
    -moz-box-shadow: 0 0 40px #FF0000;
  }
  100% {
    background-color: #B20000;
    -moz-box-shadow: 0 0 3px #B20000;
  }
}
@-o-keyframes bbn-button-glowing-red {
  0% {
    background-color: #B20000;
    box-shadow: 0 0 3px #B20000;
  }
  50% {
    background-color: #FF0000;
    box-shadow: 0 0 40px #FF0000;
  }
  100% {
    background-color: #B20000;
    box-shadow: 0 0 3px #B20000;
  }
}
@keyframes bbn-button-glowing-red {
  0% {
    background-color: #B20000;
    box-shadow: 0 0 3px #B20000;
  }
  50% {
    background-color: #FF0000;
    box-shadow: 0 0 40px #FF0000;
  }
  100% {
    background-color: #B20000;
    box-shadow: 0 0 3px #B20000;
  }
}

</style>
