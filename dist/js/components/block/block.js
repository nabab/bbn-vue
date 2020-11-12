(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-w-100']"
     :style="{
       width: width,
       height: height
     }">
  <!--bbn-rte v-if="editable && type === 'html'"
           v-model="source.content"
  >
  </bbn-rte>
  <div v-else-if="type === 'html'" 
       v-html="source.content"
  >
  </div-->
  <component v-if="ready" :is="component(type)" :source="source" :class="{'edit-block' : edit}"></component>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-block');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/block/block.css");
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-block component
 * @description bbn-block 
 * @copyright BBN Solutions
 * @author Loredana Bruno
 * @created 09/11/2020.
 */
(function(bbn){
  "use strict";
  let templates = {
    html: {
      view: `<div v-html="source.content"/>`, 
      edit: `<bbn-rte v-model="source.content"/>`
    },
    image: {
      view: `<img :src="source.content">`
    }, 
    video: {
      //doesn't work!
      /*view: `<bbn-video width="420" height="315"
                        :autoplay="false"
                        :muted="true"
                        :source="source.content"
                     />`*/
      view: `<iframe width="420" 
                     height="315"
                     :src="source.content + '?autoplay=0&mute=1'"/>`                     
    },
    line: {
      view: `<hr :style="source.content">`, 
      edit: `<div class="block-line-edit">
              <hr :style="source.content">
              <div class="block-line-edit-command">
                edit
              </div>
             </div>`
    },
    button: {
      view: `<bbn-button v-text="source.content"/>`, 
      edit: `<div><label class="bbn-hspadded">Button text</label><bbn-input class="bbn-hspadded" v-model="source.content"/></div>`
    }, 
    space: {
      view: `<div :style="'height:' + source.content + 'px'" class="block-space-view"/>`,
      edit: `
            <div :style="'height:' + source.content + 'px'" class="block-space-edit">
              <bbn-cursor v-model="source.content"></bbn-cursor>
            </div>  `  

      
    }
  };
  Vue.component('bbn-block', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * The aduio's URL
       */
      source: {
        type: Object,
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
      /*type: {
			  type: String,
        default: 'html'
      },*/
      editable: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        //type: 'html',
        width: '100%',
        height: '100%',
        //ready is important for the component template to be defined 
        ready: true,
        edit: false
      }
    },
    computed: {
      type(){
        return this.source.type
      }
    },
    methods: {
      /**
       * adds the events listener when edit = true
       * @param {boolean} edit 
       */
      _setEvents(edit){
        if ( edit ){
          document.addEventListener('mousedown', this.checkMouseDown);
          document.addEventListener('touchstart', this.checkMouseDown);
          document.addEventListener('keydown', this.checkKeyCode);
        }
        else{
          document.removeEventListener('mousedown', this.checkMouseDown);
          document.removeEventListener('touchstart', this.checkMouseDown);
        }
      },
      checkKeyCode(e){
        if ( e.keyCode === 27 ){
          this.edit = false;
        }
      },
      /**
       * set edit to false
       * @param {event} e 
       */
      checkMouseDown(e){
        if ( !e.target.closest(".edit-block") ){
          e.preventDefault();
          e.stopImmediatePropagation();
          this.edit = false;
        }
      },
      /**
       * returns the object of the component basing on the given type
       * @param {string} type 
       */
      component(type){
       return {
          props: ['source'],
          template: this.edit ? templates[type]['edit'] : templates[type]['view'],
          data(){
            return {
              foo: 'bar'
            }
          },
        }
      },
    },
    mounted(){
      bbn.fn.log("I AM THE BLOCK! ", this.source);
    }, 
    watch: {
      edit(val){
        this._setEvents(this.edit)
      }
    }
  });
})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }