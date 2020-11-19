/**
 * @file bbn-block component
 * @description bbn-block 
 * @copyright BBN Solutions
 * @author Loredana Bruno
 * @created 09/11/2020.
 */
(function(bbn){
  "use strict";
  let titleTemplates = {
    h1: `<h1 v-text="source.content.data"/>`,
    h2: `<h2 v-text="source.content.data"/>`,
    h3: `<h3 v-text="source.content.data"/>`,
    h4: `<h4 v-text="source.content.data"/>`,
    h5: `<h5 v-text="source.content.data"/>`,
  }
  let templates = {
    html: {
      view: `<div :class="['component-container', alignClass ]" v-html="source.content.data" :style="style"/>`, 
      edit: `<div :class="['component-container', alignClass ]"><bbn-rte v-model="source.content.data"/></div>`
    },
    title: {
      view: `<div class="component-container" :class="alignClass" :style="style">
              <component :is="cpTitle(source.content.tag)" :source="source"></component>
            </div>`,
      edit: `<div class="component-container" :class="alignClass" :style="style">
              <component :is="cpTitle(source.content.tag)" :source="source"></component>
              <div class="bbn-grid-fields bbn-vspadded bbn-reset">
                <label v-text="_('Title tag')"></label>
                <div>
                  <bbn-dropdown :source="tags" v-model="source.content.tag"></bbn-dropdown>
                </div>
                <label v-text="_('Title text')"></label>
                <bbn-input v-model="source.content.data"></bbn-input>
                <label>Title color</label>
                  <div>
                    <bbn-colorpicker @change="setColor"
                    ></bbn-colorpicker>
                  </div>
                <label v-text="_('Title alignment')"></label>
                <bbn-block-align-buttons></bbn-block-align-buttons>
              </div>
            </div>`        
    },  
    image: {
      //taglia originale 100% width,width 50% 33% 25% 
      view: `
      <div class="component-container" :class="alignClass">
        <img :src="'image/' + source.content.data" :style="style">
      </div>`,
      edit:     `
      <div class="component-container" :class="alignClass">
        <div class="bbn-padded">
          <div class="bbn-grid-fields bbn-vspadded bbn-reset">
            <label v-text="_('Upload your image')"></label>
            <bbn-upload :save-url="'upload/save/' + ref"
                        remove-url="test/remove"
                        :json="true"
                        :paste="true"
                        :multiple="false"	
                        v-model="image"
                        @success="imageSuccess"
                        :source="{file:[],name:'', title:''}"
            ></bbn-upload>
          
            <label v-text="_('Image size')"></label>
            <bbn-cursor v-model="source.content.style['width']" 
                        unit="%"
                        :min="0"
                        :max="100"
                        :step="20"
            ></bbn-cursor>
          
            <label v-text="_('Image alignment')"></label>
            <bbn-block-align-buttons></bbn-block-align-buttons>
          </div> 
        </div>
        <img :src="'image/' + source.content.data" :style="style">
      </div>          
                `
    }, 
    video: {
      //doesn't work!
      
      view: `
        <div :class="['component-container', alignClass]">
          <bbn-video :width="source.content.style.width" 
                     :style="style" 
                     :height="source.content.style.height"
                     :autoplay="false"
                     :muted="true"
                     :youtube="youtube"
                     :source="source.content.data"
          />
          
        </div>`, 
      edit: `
      <div class="component-container" id="video-container">
        <div class="bbn-grid-fields bbn-vspadded bbn-reset">
          <label v-text="_('Video source')"></label>
          <bbn-input v-model="source.content.data"></bbn-input>
          <label>Video alignment</label>
          <bbn-block-align-buttons></bbn-block-align-buttons>
          <label>Video width</label>
          <div>
            <bbn-cursor v-model="source.content.style['width']"
                        :min="100"
                        :max="1000" 
                        :step="10"
                        class="bbn-w-70"
            ></bbn-cursor>
          </div>
          <label>Video height</label>
          <div>
            <bbn-cursor v-model="source.content.style['height']"
                        :min="100"
                        :max="1000" 
                        :step="10"
                        class="bbn-w-70"
            ></bbn-cursor>
          </div>
        </div>
        <div :class="alignClass">
          <bbn-video :width="source.content.style.width" 
                    :style="style" 
                    :height="source.content.style.height"
                    :autoplay="false"
                    :muted="true"
                    :youtube="youtube"
                    :source="source.content.data"/>
        </div>          
      </div>
      `                     
    },
    line: {
      view: `<div class="component-container"><hr :style="style"></div>`, 
      edit: `<div class="block-line-edit component-container">
              <hr :style="style">
              <div class="block-line-edit-command bbn-padded">
                <div class="bbn-grid-fields bbn-vspadded bbn-reset">
                  <label>Line width</label>
                  <div>
                    <bbn-cursor v-model="source.content.style.width"
                                :min="0"
                                :max="100" 
                                unit="%"
                    ></bbn-cursor>
                  </div>
                  <label>Line height</label>
                  <div>
                    <bbn-cursor v-model="source.content.style['border-width']"
                                :min="1"
                                :max="10" 
                                unit="px"
                                class="bbn-w-70"
                    ></bbn-cursor>
                  </div>
                  <label>Line style</label>
                  <div>
                    <bbn-dropdown v-model="source.content.style['border-style']"
                                  :source="borderStyle"
                    ></bbn-dropdown>
                  </div>
                
                  <label>Line color</label>
                  <div>
                    <bbn-colorpicker v-model="source.content.style['border-color']"
                    ></bbn-colorpicker>
                  </div>
                  <label>Line alignment</label>
                  <bbn-block-align-buttons></bbn-block-align-buttons>
                </div>
              </div>
             </div>`
    },
    button: {
      view: `<div :style="style" :class="['bbn-w-100', 'component-container', alignClass]"><bbn-button v-text="source.content.data" :style="contentStyle"/></div>`, 
      edit: `<div class="block-button-edit component-container">
              <div :class="['bbn-w-100', alignClass]" :style="style">
                <bbn-button v-text="source.content.data" :style="contentStyle"/>
              </div> 
              <div class="bbn-padded bbn-w-100">
                <div class="bbn-grid-fields bbn-vspadded bbn-reset">
                  <label>Button text</label>
                  <bbn-input class="bbn-hspadded" v-model="source.content.data"/>
                
                  <label>Button alignment</label>
                  <bbn-block-align-buttons></bbn-block-align-buttons>
              
                  <label>Button size</label>
                  <bbn-cursor v-model="source.content.style['font-size']" 
                              unit="px"
                              :min="0"
                              :max="48"
                  ></bbn-cursor>
                
                  <label>Button corner</label>
                  <bbn-cursor v-model="source.content.style['border-radius']" 
                              unit="px"
                              :min="0"
                              :max="100"
                  ></bbn-cursor>
                </div>
              </div>
              
             </div>`
    }, 
    space: {
      view: `<div class="component-container" :style="style">
              <div class="block-space-view"/>
            </div>`,
      edit: `
          <div class="component-container" :style="style">
            <div :style="style" class="block-space-edit">
              <bbn-cursor v-model="source.content.style.height" 
                          unit="px"
                          :min="0"
              ></bbn-cursor>
            </div>
          </div>`  

      
    }
  };
  let borderStyle =  [{"text":"hidden","value":"hidden"},{"text":"dotted","value":"dotted"},{"text":"dashed","value":"dashed"},{"text":"solid","value":"solid"},{"text":"double","value":"double"},{"text":"groove","value":"groove"},{"text":"ridge","value":"ridge"}];
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
      },
    
    },
    data(){
      return {
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
      }, 
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
          props: {
            source: {},
          },
          template: this.edit ? templates[type]['edit'] : templates[type]['view'],
          data(){
            let tmp = Object.keys(titleTemplates).map((a)=>{return a = {text:a, value:a}});
            return {
              tags: tmp,
              image: [],
              borderStyle: borderStyle,
              ref: (new Date()).getTime(),
            }
          },
          computed: {
            youtube(){
              return this.source.content.data.indexOf('youtube') > -1
            },
            contentStyle(){
              let st = ''
              if ( this.source.content.style['border-radius'] ){
                st += 'border-radius:' + this.source.content.style['border-radius'] + ( bbn.fn.isNumber(this.source.content.style['border-radius']) ? ( 'px;') : ';');
              }
              return st;
            },
            alignClass(){
              let st = 'bbn-c';
              if ( this.source.align === 'left' ){
                st = 'bbn-l'
              }
              if ( this.source.align === 'right' ){
                st = 'bbn-r'
              }
              return st;
            },
            style(){
              let st = '';
              if ( this.source.content.style ){
                if ( this.source.content.style['color'] ){
                  st += 'color: ' + this.source.content.style['color'] + ';' 
                }
                if ( this.source.content.style['font-size'] ){
                  st += 'font-size:' + this.source.content.style['font-size'] + ( bbn.fn.isNumber(this.source.content.style['font-size']) ? ( 'px;') : ';');
                }
                if ( this.source.content.style['width'] ){
                  st += 'width:' + this.source.content.style['width'] + ( bbn.fn.isNumber(this.source.content.style['width']) ? ( 'px;') : ';');
                }
                if ( this.source.content.style['height'] ){
                  st += 'height:' + this.source.content.style['height'] + ( bbn.fn.isNumber(this.source.content.style['height']) ? ('px;' ) : ';');
                }
                if ( this.source.content.style['border-style'] ){
                  st += 'border-style:' + this.source.content.style['border-style'] + ';';
                }
                if ( this.source.content.style['border-color'] ){
                  st += 'border-color:' + this.source.content.style['border-color'] + ';';
                }
                if ( this.source.content.style['border-width'] ){
                  st += 'border-width:' + this.source.content.style['border-width'] + ( bbn.fn.isNumber(this.source.content['border-width']) ? 'px;' : ';');
                }
              }
              if ( this.source.align && (this.source.type === 'line')){
                let margin = '';
                switch (this.source.align){
                  case 'center':
                    (margin = 'margin-left: auto;margin-right:auto');
                  break;
                  case 'left':
                    ((this.source.type === 'image') || (this.source.type === 'video') )? (margin = 'float: left') : (margin = 'margin-left: 0');
                  break;
                  case 'right':
                     ((this.source.type === 'image') || (this.source.type === 'video') ) ? (margin = 'float: right') : (margin = 'margin-right: 0');
                  break;
                }
                st += margin; 

              }
              return st;
            }
          }, 
          methods: { 
            setColor(a){
              this.source.content.style.color = a;
              this.$parent.edit = false
              //this.$forceUpdate()
              bbn.fn.happy('hhhh')
              console.log(arguments)
            },
            //returns the component for the blocks of type title
            cpTitle(tag){
              return {
                props: ['source'],
                template: titleTemplates[tag], 
              }
            },
            imageSuccess(a, b, c, d){
              if (c.success && c.image.src.length ){
                console.log(c.image.src, this.source.content)
                this.source.content.data = c.image.name; 
                appui.success(bbn._('Image correctly uploaded'))
              }
              else{
                appui.error(bbn._('An error occurred while uploading the image'))
              }
              
            }
          },
          components: {
            //internal component for align buttons in edit of the block
            'bbn-block-align-buttons':{
              template: `
              <div>
                <bbn-button icon="nf nf-fa-align_left"
                            :title="_('Align left')" 
                            :notext="true"
                            @click="align = 'left'" 
                            :class="{'bbn-state-active': ($parent.source.align === 'left')}"
                ></bbn-button>
                <bbn-button icon="nf nf-fa-align_center" :title="_('Align left')"
                            :notext="true" 
                            @click="align = 'center'"
                            :class="{'bbn-state-active': ($parent.source.align === 'center')}"
                ></bbn-button>
                <bbn-button icon="nf nf-fa-align_right"
                            :title="_('Align left')"
                            :notext="true" 
                            @click="align = 'right'"
                            :class="{'bbn-state-active': ($parent.source.align === 'right')}"
                ></bbn-button>
              </div>`, 
              data(){
                return {
                  align: ''
                }
              },
              watch:{
                align(val){
                  this.$parent.source.align = val
                  this.$parent.$parent.$forceUpdate();
                },
              },
            }, 
            
          },
          mounted(){
            
            bbn.fn.warning(this.unit)
          },
        }
      },
    },
    mounted(){
      if ( !this.source.content.style ){
        this.source.content.style = {};
      }
      if ( !this.source.content.style.color ){
        this.source.content.style.color = '';
      }
      if ( !this.source.align ){
        this.source.align = 'center'
      }
      //if alignment is already defined as style property
      if ( this.source.content.style && this.source.content.style.align ){
        this.source.align = this.source.content.style.align;
      }
      
      bbn.fn.log("I AM THE BLOCK! ", this.source);
    }, 
    watch: {
      edit(val){
        this._setEvents(this.edit)
      }
    }
  });
})(bbn);
