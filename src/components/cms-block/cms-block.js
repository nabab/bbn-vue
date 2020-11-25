/**
 * @file bbn-cms-block component
 * @description bbn-cms-block 
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
      view: `<div :class="['component-container', {'has-hr': source.content.hr}, alignClass]":style="style">
              <hr v-if="source.content.hr"/><component :is="cpTitle(source.content.tag)" :source="source"></component><hr v-if="source.content.hr"/>
             </div>`,
      edit: `<div :class="['component-container', {'has-hr': source.content.hr}, alignClass]" :style="style">
              <div class="edit-title">
                <hr v-if="source.content.hr"/><component :is="cpTitle(source.content.tag)" :source="source"></component><hr v-if="source.content.hr"/>
              </div>
              <div class="bbn-grid-fields bbn-vspadded bbn-reset bbn-w-100">
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
                <label v-text="_('Line')"></label>
                <bbn-checkbox v-model="source.content.hr"></bbn-checkbox>
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
    gallery: {
      view: `
      <div :class="['component-container', 'gallery', alignClass, galleryCols]" :style="style" v-if="show">
        <!-- CREATE IMAGES AND GIVE THEM THE CORRECT HREF -->
        <bbn-cms-block-gallery-item v-for="(image, idx) in source.content.data" :source="image" :key="idx" :index="idx"></bbn-cms-block-gallery-item>
      </div>
      `,
      edit: `
      <div>
        <div :class="['component-container', 'gallery', alignClass, galleryCols]" :style="style" v-if="show">
          <!-- GIVE HREF TO VIEW FULL IMAGE -->
          <bbn-cms-block-gallery-item v-for="(image, idx) in source.content.data" :source="image" :key="idx" :index="idx"></bbn-cms-block-gallery-item>
        </div>
        <div class="bbn-grid-fields bbn-padded bbn-reset">
          <label>Columns number</label>
          <div>
            <bbn-dropdown v-model="source.content.columns"
                          :source="tinyNumbers"
            ></bbn-dropdown>
          </div>
          <label v-text="_('Upload your images')"></label>
          <bbn-upload :save-url="'upload/save/' + ref"
                      remove-url="test/remove"
                      :data="{gallery: true}"
                      :paste="true"
                      :multiple="true"	
                      v-model="source.content.data"
                      @success="imageSuccess"
          ></bbn-upload>
        
        </div>
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
                     :autoplay="autoplay"
                     :muted="muted"
                     :youtube="youtube"
                     :source="source.content.data"
          />
          
        </div>`, 
      edit: `
      <div class="component-container" id="video-container">
        <div class="bbn-grid-fields bbn-padded bbn-reset">
          <label v-text="_('Video source')"></label>
          <bbn-input v-model="source.content.data"></bbn-input>
          <label>Muted</label>
          <div>
            <bbn-button :notext="true"
                        :title="_('Mute the video')"
                        @click="muted = !muted"
                        :icon="muted ? 'nf nf-oct-mute' : 'nf nf-oct-unmute'"
            >
            </bbn-button>
          </div>
          <label>Autoplay</label>
          <div>
            <bbn-button :notext="true"
                        :title="_('Autoplay')"
                        @click="autoplay = !autoplay"
                        :icon="autoplay ? 'nf nf-fa-pause' : 'nf nf-fa-play'"
            >
            </bbn-button>
          </div>
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
                    :autoplay="autoplay"
                    :muted="muted"
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
                <div class="bbn-grid-fields bbn-vspadded">
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
                          :step="50"
              ></bbn-cursor>
            </div>
          </div>`  

      
    }, 
   
  };
  let borderStyle =  [{"text":"hidden","value":"hidden"},{"text":"dotted","value":"dotted"},{"text":"dashed","value":"dashed"},{"text":"solid","value":"solid"},{"text":"double","value":"double"},{"text":"groove","value":"groove"},{"text":"ridge","value":"ridge"}];
  Vue.component('bbn-cms-block', {
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
      index: {
        type: Number,
      },
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
      parent(){
        return this.closest('bbn-container').getComponent();
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
          props: {
            source: {},
          },
          template: this.edit ? templates[type]['edit'] : templates[type]['view'],
          data(){
            let tmp = Object.keys(titleTemplates).map((a)=>{return a = {text:a, value:a}});
            return {
              //cp video
              muted: true,
              autoplay: false,
              align: '',
              tags: tmp,
              image: [],
              tinyNumbers: [{text: '1', value: 1}, {text: '2', value: 2},{text: '3', value: 3},{text: '4', value: 4}],
              borderStyle: borderStyle,
              ref: (new Date()).getTime(),
              show: true
            }
          },
          computed: {
            galleryCols(){
              if ( (this.source.type === 'gallery')){
                if ( this.source.content.columns === 1 ){
                  return 'cols-1'
                  return 'bbn-w-100';  
                }
                else if ( this.source.content.columns === 2 ){
                  return 'cols-2'
                  return 'bbn-w-50';  
                }
                else if ( this.source.content.columns === 4 ){
                  return 'cols-4'
                  return 'bbn-w-25';  
                }
                return 'cols-3'
                //default cols are 3
                return 'bbn-w-33';
              }
            },
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
                if(this.source.type === 'line'){
                  if ( this.source.content.style['border-width'] ){
                    st += 'border-top-width:' + this.source.content.style['border-width'] + ( bbn.fn.isNumber(this.source.content['border-width']) ? 'px;' : ';');
                    st += 'border-bottom:0'
                  }
                }
                else { 
                  if ( this.source.content.style['border-width'] ){
                    st += 'border-width:' + this.source.content.style['border-width'] + ( bbn.fn.isNumber(this.source.content['border-width']) ? 'px;' : ';');
                  }
                }
              }
              if ( this.source.align && ((this.source.type === 'line') || (this.source.type === 'video'))){
                let margin = '';
                switch (this.source.align){
                  case 'center':
                    (margin = 'margin-left: auto;margin-right:auto');
                  break;
                  case 'left':
                    this.source.type === 'video' ? (margin = 'float: left') : (margin = 'margin-left: 0');
                  break;
                  case 'right':
                    this.source.type === 'video' ? (margin = 'float: right') : (margin = 'margin-right: 0');
                  break;
                }
                st += margin; 

              }
              return st;
            }
          }, 
          methods: { 
            /**
             * calculate the height of the images in gallery basing on source.content.columns
             */
            makeSquareImg(){
              //creates square container for the a
              var items = this.$el.querySelectorAll('a'),
                images = this.$el.querySelectorAll('img');
                this.show = false;
              if (this.source.content.columns === 1){
                for (let i in items ){
                  if ( images[i].tagName === 'IMG' ){
                    this.$nextTick(()=>{
                      images[i].style.height = 'auto';
                      images[i].style.width = '100%';
                    })
                  }
                }
              }
              else {
                for (let i in images ){
                  if ( images[i].tagName === 'IMG' ){
                    this.$nextTick(()=>{
                      images[i].style.height = items[i].offsetWidth + 'px';
                    })
                  }
                }
  
              }
              this.show = true;
            },
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
                if ( this.source.type === 'gallery' ){
                  bbn.fn.error('gallery')
                  //this.show = false;
                  /*bbn.fn.log(this.source.content.data)
                  this.source.content.data = JSON.parse(this.source.content.data);*/
                  c.image.src = c.image.name;
                  c.image.alt = '';
                  setTimeout(() => {
                    this.show = false;
                    //this.source.content.data.push(c.image);//
                    this.makeSquareImg();  
                  }, 200);
                  
                  
                  bbn.fn.log(this.source.content.data)
                  
                  
                }
                else{
                  this.source.content.data = c.image.name; 
                }
                appui.success(bbn._('Image correctly uploaded'))
              }
              else{
                appui.error(bbn._('An error occurred while uploading the image'))
              }
              
            }
          },
          components: {
            'bbn-cms-block-gallery-item': {
              props: ['source', 'index'],
              //:src="'image/' + source.content.data"
              template: `
                <a :href="'image/gallery/' + (source.src ? source.src : source.name)" target="_blank">
                
                  <img :src="'image/gallery/' + (source.src ? source.src : source.name)" :alt="source.alt">
                </a>
                `
            
            },
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
          watch:{
            'source.content.columns':{
              handler(val){
                this.makeSquareImg()
              }
            }
          },
          beforeMount(){
            if ( this.$parent.edit ){
              if ( (this.source.type === 'image') && this.source.content.data.length ){
                let extension = this.source.content.data.substr(this.source.content.data.lastIndexOf('.'), this.source.content.data.length)
                //take the correct size 
                this.image.push({
                  "name": this.source.content.data,
                  "size":574906,
                  "extension": extension
                });  
              }
              else if ( (this.source.type === 'gallery') && this.source.content.data.length ){
                /*this.image = bbn.fn.map(this.source.content.data, (a) => {
                  let extension = a.src.substr(a.src.lastIndexOf('.'), a.src.length);
                  a.name = a.src; 
                  a.size = 465464;
                  a.extension = extension;
                  return a
                })*/
              }
            }
          },
          mounted(){
            if ( this.source.type === 'gallery' ){
              this.makeSquareImg();
            }
          },
        }
      },
    },
    mounted(){
     /* bbn.fn.happy('mounted')
      bbn.fn.log(this.source.type, this.source)*/
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
       
        //if adding a new block
        bbn.fn.error('watch')
        console.log(val, this.newBlock)
        if ( ( val === false ) && ( this.newBlock === true ) ){
          this.parent.source.lines.push(this.source)
          this.parent.lines.push({
            content: { 
              data:  '<div>[CONTENT]</div>'
            },
            type: ''
          });
          appui.success(bbn._('New block ' + this.source.type + ' added!'))
          this.newBlock = false;
        }
        this._setEvents(this.edit)
      }
    }
  });
})(bbn);
