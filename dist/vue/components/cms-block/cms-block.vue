<template>
<div :class="[componentClass, 'bbn-w-100']"
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
</div>
</template>
<script>
  module.exports = /**
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
  },
  shareSource = [
    {
      text: `
      <iframe id="twitter-widget-0" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" class="twitter-share-button twitter-share-button-rendered twitter-tweet-button" style="position: static; visibility: visible; width: 61px; height: 20px;" title="Twitter Tweet Button" src="https://platform.twitter.com/widgets/tweet_button.96fd96193cc66c3e11d4c5e4c7c7ec97.en-gb.html#dnt=false&amp;id=twitter-widget-0&amp;lang=en-gb&amp;original_referer=https%3A%2F%2Fphotographyofchina.com%2Fblog%2Fmengwen-cao&amp;size=m&amp;text=Mengwen%20Cao&amp;time=1606314228513&amp;type=share&amp;url=https%3A%2F%2Fphotographyofchina.com%2Fblog%2Fmengwen-cao" data-url="https://photographyofchina.com/blog/mengwen-cao"></iframe>
      `
    },{
      text: `<fb:like href="https://photographyofchina.com/blog/mengwen-cao" send="false" layout="button_count" show_faces="true" class=" fb_iframe_widget" fb-xfbml-state="rendered" fb-iframe-plugin-query="app_id=314192535267336&amp;container_width=0&amp;href=https%3A%2F%2Fphotographyofchina.com%2Fblog%2Fmengwen-cao&amp;layout=button_count&amp;locale=en_US&amp;sdk=joey&amp;send=false&amp;show_faces=true"><span style="vertical-align: bottom; width: 90px; height: 28px;"><iframe name="f3f5b7d67273e28" width="1000px" height="1000px" data-testid="fb:like Facebook Social Plugin" title="fb:like Facebook Social Plugin" frameborder="0" allowtransparency="true" allowfullscreen="true" scrolling="no" allow="encrypted-media" src="https://www.facebook.com/v6.0/plugins/like.php?app_id=314192535267336&amp;channel=https%3A%2F%2Fstaticxx.facebook.com%2Fx%2Fconnect%2Fxd_arbiter%2F%3Fversion%3D46%23cb%3Df23bb88f3752ff4%26domain%3Dphotographyofchina.com%26origin%3Dhttps%253A%252F%252Fphotographyofchina.com%252Ff2c75dbbc3b61f%26relation%3Dparent.parent&amp;container_width=0&amp;href=https%3A%2F%2Fphotographyofchina.com%2Fblog%2Fmengwen-cao&amp;layout=button_count&amp;locale=en_US&amp;sdk=joey&amp;send=false&amp;show_faces=true" style="border: none; visibility: visible; width: 90px; height: 28px;" class=""></iframe></span></fb:like>`,
    },{
      text: ` <span class="IN-widget" data-lnkd-debug="<script type=&quot;IN/Share+init&quot; data-url=&quot;https://photographyofchina.com/blog/mengwen-cao&quot; data-counter=&quot;right&quot;></script>" style="display: inline-block; line-height: 1; vertical-align: bottom; padding: 0px; margin: 0px; text-indent: 0px; text-align: center;"><span style="padding: 0px !important; margin: 0px !important; text-indent: 0px !important; display: inline-block !important; vertical-align: bottom !important; font-size: 1px !important;"><button class="IN-6d5494f8-69f0-4a9d-8c6b-3e3c3eb1b33b-1G9ISYhSF8XoOmdcl0yKDu"><xdoor-icon aria-hidden="true"><svg viewBox="0 0 24 24" width="24px" height="24px" x="0" y="0" preserveAspectRatio="xMinYMin meet">
      <g style="fill: currentColor">
        <rect x="-0.003" style="fill:none;" width="24" height="24"></rect>
        <path style="" d="M20,2h-16c-1.1,0-2,0.9-2,2v16c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2zM8,19h-3v-9h3V19zM6.5,8.8C5.5,8.8,4.7,8,4.7,7s0.8-1.8,1.8-1.8S8.3,6,8.3,7S7.5,8.8,6.5,8.8zM19,19h-3v-4c0-1.4-0.6-2-1.5-2c-1.1,0-1.5,0.8-1.5,2.2V19h-3v-9h2.9v1.1c0.5-0.7,1.4-1.3,2.6-1.3c2.3,0,3.5,1.1,3.5,3.7V19z"></path>
      </g>
    </svg></xdoor-icon>Share</button></span></span>`,
    },{
      text: `<a href="#"><img src="https://old.reddit.com/static/spreddit7.gif" alt="submit to reddit" border="0"></a>`,
    },{
      text: `<a href="//pinterest.com/pin/create/button?url=https%3A%2F%2Fphotographyofchina.com%2Fblog%2Fmengwen-cao&amp;media=https%3A%2F%2Fimages.squarespace-cdn.com%2Fcontent%2Fv1%2F51e2f86de4b0180cf3be09fe%2F1596189827171-R0Z8ZUCJJT24LAQFE5F3%2Fke17ZwdGBToddI8pDm48kEn7vR2DfskOSB_xhl8K5-97gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z5QHyNOqBUUEtDDsRWrJLTmTl_ALRZE0UkEheIF40jl8uxlTVbC1o1LiEfIdTsnmlzytniM6h_YfJ0hsR9rEaGn%2Fsquare.jpg" class="pin-it-button" count-layout="horizontal"><img border="0" src="//assets.pinterest.com/images/PinExt.png" title="Pin It"></a>`,
    }
    
  ],
  htmlTemplates = {
    p: `<p v-html="source.content.data"/>`,
    span: `<span v-html="source.content.data"/>`

  },
  templates = {
    html: {
      view: `<div :class="['component-container', 'bbn-block-html', alignClass]"
                  v-html="source.content.data" 
                  :style="style">
              
            </div>`, 
      edit: `<div :class="['component-container', 'bbn-block-html', alignClass ]"><bbn-rte v-model="source.content.data"/></div>`
    },
    footer: {
      view: `<div :class="['component-container', 'bbn-block-footer', alignClass]"
                  :style="style">
              <span v-if="source.content.data.tags">
                Tags: 
                <a class="bbn-hxsmargin" v-for="(a, i) in source.content.data.tags" 
                   v-text="a + ((i === (source.content.data.tags.length -1 )) ? '' : ',')" :href="a"
                ></a>
              </span><br>
              <span v-if="source.content.data.categories">
                Categories: 
                <a class="bbn-hxsmargin" v-for="(a, i) in source.content.data.categories"
                   v-text="a + ((i === (source.content.data.categories.length -1 )) ? '' : ',')" :href="a"
                ></a>
              </span>
            </div>`, 
      edit: `<div :class="['component-container', 'bbn-block-footer', alignClass ]"><bbn-rte v-model="source.content.data"/></div>`
    },
    title: {
      view: `<div :class="['component-container', 'bbn-block-title', {'has-hr': source.content.hr}, alignClass]":style="style">
              <hr v-if="source.content.hr"/><component :is="cpHTML(source.content.tag, 'title')" :source="source"></component><hr v-if="source.content.hr"/>
             </div>`,
      edit: `<div :class="['component-container','bbn-block-title', {'has-hr': source.content.hr}, alignClass]" :style="style">
              <div class="edit-title">
                <hr v-if="source.content.hr"/><component :is="cpHTML(source.content.tag,'title')" :source="source"></component><hr v-if="source.content.hr"/>
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
        <img :src="'image/' + source.content.data.src" :style="style">
        <p class="image-caption bbn-l bbn-s bbn-vsmargin" v-if="source.content.data.figCaption" v-html="source.content.data.figCaption"></p>
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
        <img :src="'image/' + source.content.data.src" :style="style">
        <p class="image-caption bbn-l bbn-s bbn-vsmargin" v-if="source.content.data.figCaption" v-html="source.content.data.figCaption"></p>
      </div>          
                `
    }, 
    gallery: {
      view: `
      <div :class="['component-container', 'bbn-block-gallery', alignClass, galleryCols]" :style="style" v-if="show">
        <!-- CREATE IMAGES AND GIVE THEM THE CORRECT HREF -->
        <bbn-cms-block-gallery-item v-for="(image, idx) in source.content.data" :source="image" :key="idx" :index="idx"></bbn-cms-block-gallery-item>
      </div>
      `,
      edit: `
      <div>
        <div :class="['component-container', 'bbn-block-gallery', alignClass, galleryCols]" :style="style" v-if="show">
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
    social: {
      view: `
      <div class="component-container bbn-block-social" :style="style">
        <!-- TAKE THE NUMBERS OF LIKE FROM DB -->
        <span class="bbn-pointer bbn-block-social-button">
          <i class="nf nf-fa-heart bbn-hspadded bbn-block-social-icon"></i>
          3 Likes
        </span>
        <span class="bbn-pointer bbn-block-social-button">
          <bbn-context :source="shareSource" @open="alert">
            <i class="nf nf-fa-share_alt bbn-hspadded bbn-block-social-icon"></i>
          </bbn-context>  
          Share
        </span>
      </div>`
    }
   
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
      alert(){
        alert('test')
      }, 
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
              shareSource: shareSource,
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
            cpHTML(tag, type){
              return {
                props: ['source'],
                template: (type === 'title') ? titleTemplates[tag] : htmlTemplates[tag], 
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

</script>
<style scoped>
.bbn-cms-block.bbn-basic-component {
  margin: 15px auto;
}
.bbn-cms-block.bbn-basic-component h1,
.bbn-cms-block.bbn-basic-component h2,
.bbn-cms-block.bbn-basic-component h3,
.bbn-cms-block.bbn-basic-component h4,
.bbn-cms-block.bbn-basic-component h5,
.bbn-cms-block.bbn-basic-component h6 {
  margin: 0 0 .5em;
  line-height: 1.2;
  font-weight: bold;
  font-weight: 100;
  font-style: normal;
  line-height: 1.2em;
  letter-spacing: 0px;
  text-transform: none;
}
.bbn-cms-block.bbn-basic-component hr {
  color: #bbb;
  background-color: #bbb;
  border-bottom-width: 0;
  border-top-width: 1px;
}
.bbn-cms-block.bbn-basic-component .component-container {
  max-width: 845px;
  margin: 0 auto;
  float: unset;
}
.bbn-cms-block.bbn-basic-component .component-container.bbn-block-title {
  padding: 0;
  padding-top: 16px;
}
.bbn-cms-block.bbn-basic-component .component-container.has-hr {
  display: flex;
  align-items: center;
}
.bbn-cms-block.bbn-basic-component .component-container.has-hr.edit-block {
  flex-direction: column;
}
.bbn-cms-block.bbn-basic-component .component-container.has-hr.edit-block .edit-title {
  width: 100%;
  display: flex;
  align-items: center;
}
.bbn-cms-block.bbn-basic-component .component-container.has-hr hr {
  margin: 0 30px;
  flex-grow: 1.5;
}
.bbn-cms-block.bbn-basic-component .component-container.bbn-block-html h1,
.bbn-cms-block.bbn-basic-component .component-container.bbn-block-html h2,
.bbn-cms-block.bbn-basic-component .component-container.bbn-block-html h3 {
  margin: 0;
  white-space: pre-wrap;
}
.bbn-cms-block.bbn-basic-component .component-container.bbn-block-html em {
  white-space: normal;
}
.bbn-cms-block.bbn-basic-component .component-container.bbn-block-gallery {
  margin: 15px auto;
  text-align: left;
  display: grid;
  grid-gap: 20px;
}
.bbn-cms-block.bbn-basic-component .component-container.bbn-block-gallery.cols-1 {
  grid-template-columns: 1fr;
}
.bbn-cms-block.bbn-basic-component .component-container.bbn-block-gallery.cols-3 {
  grid-template-columns: repeat(3,1fr);
}
.bbn-cms-block.bbn-basic-component .component-container.bbn-block-gallery.cols-4 {
  grid-template-columns: repeat(4,1fr);
}
.bbn-cms-block.bbn-basic-component .component-container.bbn-block-gallery.cols-2 {
  grid-template-columns: repeat(2,1fr);
}
.bbn-cms-block.bbn-basic-component .component-container.bbn-block-gallery a {
  overflow: hidden;
  display: flex;
  justify-content: center;
}
.bbn-cms-block.bbn-basic-component .bbn-block-social ul.bbn-menulist.free {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bbn-cms-block.bbn-basic-component .bbn-block-social .ss-social-list-wrapper {
  left: 0 !important;
}
.bbn-cms-block.bbn-basic-component .bbn-block-social .bbn-block-social-button {
  line-height: 18px;
  font-weight: bold;
}
.bbn-cms-block.bbn-basic-component .bbn-block-social .bbn-block-social-button .bbn-block-social-icon {
  color: #ebebeb;
  line-height: 18px;
}
.bbn-cms-block.bbn-basic-component .bbn-block-social .bbn-block-social-button:hover .nf-fa-share_alt {
  color: #5c5c5c;
}
.bbn-cms-block.bbn-basic-component .bbn-block-social .bbn-block-social-button:hover .nf-fa-heart {
  color: red;
}
.bbn-cms-block.bbn-basic-component .component-container .bbn-grid-fields {
  align-items: center;
}
.bbn-cms-block.bbn-basic-component .bbn-grid-fields {
  border: none !important;
}
.bbn-cms-block.bbn-basic-component .block-space-edit {
  border: 1px dashed #dddddd;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

</style>
