/**
 * @file bbn-rtef component
 *
 * @description bbn-rtef is bbn-rte in an iframe.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 12/09/2019
 */

(function($){
  "use strict";

  Vue.component('bbn-rtef', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent],
    props: {
      pinned: {},
      top: {},
      left: {},
      bottom: {},
      right: {},
      /**
       * The height of the editor
       * @prop {Number|String} ['100%'] height
       */
      height:{
        default: '100%',
        type: [String, Number]
      },
      /**
       * The buttons to show on the toolbar
       * @prop {Array} buttons
       */
      buttons: {
        type: Array,
        default(){
          return [

            ['viewHTML'],
            ['undo', 'redo'], // Only supported in Blink browsers
            ['formatting'],
            ['strong', 'em', 'underline', 'del'],
            ['removeformat', 'foreColor', 'backColor'],
            ['superscript', 'subscript'],
            ['link'],
            ['insertImage', 'base64'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['unorderedList', 'orderedList'],
            ['horizontalRule'],
            ['fullscreen'],

          ];
        }
      },
      /**
       * The object of configuration
       * @prop {Object} cfg
       */
      cfg: {
        type: Object,
        default: function(){
          return {
            pinned: true,
            top: null,
            left: null,
            bottom: 5,
            right: 5,
          };
        }
      }
    },
    data(){
      let html = `
<html>
<head>
<script src="` + bbn.env.cdn + `?lib=bbn-vue"></script>
</head>
<body>
  <div class="bbn-container">
    <bbn-rte @input="emit" v-bind="properties" v-model="text"></bbn-rte>
  </div>
  <script>
    let message1 = false,
        obj = false;
    document.addEventListener("DOMContentLoaded", event => {
      window.addEventListener('message', msg => {
        if ( typeof(msg.data) === 'object' ){
          if ( !message1 ){
            obj = new Vue({
              el: 'div.bbn-container',
              data: {
                properties: msg.data.properties || {},
                text: msg.data.value || '',
                uid: msg.data.uid
              },
              methods: {
                emit(){
                  window.parent.postMessage({
                    message: this.text,
                    uid: this.uid
                  }, '*');
                }
              }
            });
            message1 = true;
          }
          else {
            obj.$set(obj, 'text', msg.data.value)
          }
        }
      });
    });
  </script>
</body>
</html>
`;
      return {
        src: 'data:text/html;charset=utf-8,' + encodeURI(html),
      };
    },
    methods: {
      onload(){
        let ifr = this.getRef('frame');
        ifr.sendMessage({
          uid: ifr._uid,
          properties: this.$props,
          value: this.value,
        });
      },
      readMessage(msg){
        this.emitInput(msg);
      },
    }
  });
})();
