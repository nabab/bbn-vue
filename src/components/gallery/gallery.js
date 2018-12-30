/**
 * Created by BBN on 10/02/2017.
 */
(() => {
  "use strict";
  Vue.component('bbn-slideshow', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      source: {
        type: [Array, Function, String]
      },
      separator: {
        type: String
      },
      component: {
        type: Object
      },
      checkbox: {
        type: [String, Boolean],
        default(){
          return false;
        }
      },//for image
      gallery: {
        type: Boolean,
        default(){
          return false;
        }
      },
      preview:{
        type: [Boolean, String],
        default(){
          return false
        }
      },
      dimensionPreview:{
        type: Number,
        defalut(){
          return 45
        }
      },
      autoscroll:{
        type: [Boolean, Number],
        default(){
          return false
        }
      },// pause and start autoscroll
      ctrl:{
        type: [Boolean, String],
        default(){
          return false
        }
      }, //show or no show arrow
      arrows:{
        type: [Boolean, Object],
        default(){
          return false
        }
      },
      autoHidePreview:{
        type: Boolean,
        default(){
          return false
        }
      },
      autoHideArrows:{
        type: Boolean,
        default(){
          return false
        }
      },
      autoHideCtrl:{
        type: Boolean,
        default(){
          return false
        }
      },
      loop:{
        type: Boolean,
        default(){
          return false
        }
      },
      fullSlide:{
        type: Boolean,
        default(){
          return false
        }
      }
    },
    data(){
      let src = [],
          valuesCB = {},
          isAjax = false;
      if ( (typeof this.source === 'string') ){
        if ( this.separator ){
          if ( !this.gallery ){
            src = this.source.split(this.separator).map((a) => { return {content: a};});
          }
          else{
            src = this.source.split(this.separator).map((a) => {
              return {
                type: 'img',
                content: `<img src="` + a  + `" style="height: auto;  width: 100%">`
              };
            });
          }
        }
        else{
          src = [];
          isAjax = true;
        }
      }
      else if ( bbn.fn.isFunction(this.source) ){
        src = this.source();
      }

      else if ( bbn.fn.isArray(this.source) && this.checkbox ){
        this.source.forEach((v, i) => {
          if ( this.separator ){
            v.content.split(this.separator).forEach((a, k) => {
              let o = {
                content: a,
                id: v.id
              };
              if ( k === 0 ){
                o.checkable= true;
              }
              src.push(o);
            });
          }
          valuesCB[i] = false;
        });
      }
      else if ( bbn.fn.isArray(this.source)  ){
        src = this.source.slice();
        if ( !bbn.fn.isEmpty(src) ){
          src.forEach((val, idx) => {
            if ( bbn.fn.isObject(val) ){
              var st= "";
              /*
              //dimension
              if( val.dim && val.dim.length ){
                switch(val.dim) {
                  case 'stretch': st=""
                       break;
                  case 'zoom': console.log("zoom")
                       break;
                  case 'full': st=""
                       break;
                  default:
                     //case set dim in originals
                     st=""
                }
              }*/


              if ( (val.type && val.type.length && (val.type === "img")) ){
                src[idx].content = `<img src="` + src[idx].content + `" style="`+ st + `">`
              }
              else if( (val.type && val.type.length) && (val.type !== 'img') ){
                src[idx].content = `<div class="bbn-100 bbn-middle"><i class="fa fa-wrench bbn-xxxxl" style="opacity: 0.6"></i></div>`
              }
            }
          });
        }
      }
      return {
        name: bbn.fn.randomString().toLowerCase(),
        currentIndex: 0,
        items: src,
        isAjax: isAjax,
        defaultTextCB: bbn._("Don't show it again"),
        valuesCB: valuesCB,
        activeMiniature: 0,
        defaultAutoScroll: 5000,
        scrollInterval: false,
        showMiniature: this.autoHidePreview ? false : true,
        showArrowLeft: this.autoHideArrows ? false : true,
        showArrowRight: this.autoHideArrows ? false : true,
        showCtrl: this.autoHideCtrl ? false : true,
        arrowClass:{
          left:  'fa fa-arrow-circle-left',
          right: 'fa fa-arrow-circle-right',
        }
      }
    },
    methods: {
      createStyle(){
        let st = '',
            rules = [];
        this.items.forEach((it, i) => {
          st += '.bbn-slideshow .slideswitch:target ~ .slide#' + (this.name + i.toString()) + ' .content{opacity: 0}';
          st += '.bbn-slideshow .slideswitch[id="' + this.name + i.toString() + '"]:target ~ .slide#' + this.name + i.toString() + ' .navigation {display: block !important;}';
          st += '.bbn-slideshow .slideswitch[id="' + this.name + i.toString() + '"]:target ~ .slide#' + this.name + i.toString() + ' .content {animation-name: fade_in; animation-duration: 0.5s;}';
          if ( it.animation ){
            st += '.bbn-slideshow .slideswitch[id="' + this.name + i.toString() + '"]:target ~ #' + this.name + i.toString() + ' .' + it.animation + ' {animation-name:' + it.animation + ' !important;animation-duration: ' + (it.duration || this.duration || '0.5') + 's;' + ( it.animation === 'flip' ? 'backface-visibility: hidden;' : '')+ '}';
          }
        });
        //$(this.$el).append('<style>' + st + '</style>');
      },
      prev(){
        let idx = this.currentIndex;
        if ( idx > 0 ){
          if ( !this.items[idx-1].animation ){
            this.getRef('slide' + (idx-1).toString()).style.animationName = 'slide_from_right';
          }
          this.currentIndex--;
        }
        if ( this.loop &&  idx === 0 ){
          this.currentIndex = this.items.length - 1;
        }
        if( this.autoscroll ){
          this.stopAutoScroll();
          this.$nextTick(()=>{
            this.startAutoScroll();
          });
        }
      },
      next(){
        let idx = this.currentIndex;
        if ( idx < (this.items.length - 1) ){
          if ( !this.items[idx+1].animation ){
            this.getRef('slide' + (idx+1).toString()).style.animationName = 'slide_from_left';
          }
          this.currentIndex++;
        }
        if ( this.loop &&  idx === (this.items.length - 1) ){
          this.currentIndex = 0;
        }
        if( this.autoscroll ){
          this.stopAutoScroll();
          this.$nextTick(()=>{
            this.startAutoScroll();
          });
        }
      },
      startAutoScroll(){
        this.scrollInterval = setInterval(()=>{
          if ( this.currentIndex < (this.items.length -1) ){
            this.next();
          }
          else if( this.currentIndex === (this.items.length-1) ){
            this.currentIndex = 0;
          }
          if( this.preview ){
            this.activeMiniature = this.currentIndex;
          }
        }, typeof(this.autoscroll) === 'number' ? this.autoscroll*1000 : this.defaultAutoScroll);
      },
      stopAutoScroll(){
        if ( this.scrollInterval ){
          clearInterval(this.scrollInterval);
          this.scrollInterval = false;
        }
      },
      // for show or hide elements
      miniaturePreview(val){
        if( this.autoHidePreview ){
          this.showMiniature = val;
        }
      },
      arrowsPreview(direction, val){
        if( this.autoHideArrows ){
          if( direction === 'next' ){
            this.showArrowRight = val;
          }
          if( direction === 'prev' ){
            this.showArrowLeft = val;
          }
        }
      },
      ctrlPreview(val){
        if( this.autoHideCtrl ){
          this.showCtrl = val;
        }
      }
    },
    mounted(){
      /** @todo WTF?? Obliged to execute the following hack to not have scrollLeft and scrollTop when we open a
       *  popup a 2nd time.
       */
      /*
      this.$refs.scrollContainer.style.position = 'relative';
      setTimeout(() => {
        this.$refs.scrollContainer.style.position = 'absolute';
      }, 0)
      */



      this.createStyle();
      if( this.autoscroll ){
        this.startAutoScroll();
      }
      if ( bbn.fn.isObject(this.arrows) ){
        if ( this.arrows.left && this.arrows.left.length ){
          this.arrowClass.left = this.arrows.left
        }
        if( this.arrows.right && this.arrows.right.length ){
          this.arrowClass.right = this.arrows.right
        }
      }
      this.ready = true;

      this.$nextTick(() => {
        bbn.fn.log("DIMMM", this.$parent.lastKnownWidth, this.$parent.lastKnownHeight);
      })

    },
    watch: {
      show(newVal, oldVal){
        if ( newVal != oldVal ){
          this.$emit(newVal ? "show" : "hide");
        }
      },
      valuesCB: {
        deep: true,
        handler(newVal){
          this.$emit(newVal[this.currentIndex] ? 'check' : 'uncheck', this.items[this.currentIndex]);
        }
      }
    },
    components: {
      'bbn-slideshow-miniature': {
        name: 'bbn-slideshow-miniature',
        template: `<div class="bbn-w-100 bbn-c bbn-middle"
                        :style="{
                          position: 'absolute',
                          bottom:( mainComponent.fullSlide ? '10px' : '40px')
                        }"
                   >
            <template  v-for="(it, i) in items"
                       style="display: inline; width: 20px; height: 20px"
            >
              <div  v-if="type === 'image'"
                    v-html="it.content"
                    @click= "clickMiniature(it , i)"
                    class="zoom"
                    :style="{
                      border: (mainComponent.activeMiniature === i) ? '2px inset red' : '1px inset black',
                      width: dimension +'px',
                      height: dimension + 'px',
                      margin: '0 3px 0 0',

                    }"
              ></div>
              <i v-else-if="type === 'circle'"
                   @click= "clickMiniature(it , i)"
                   :style="{
                     color: (mainComponent.activeMiniature === i) ? 'red' : 'white',
                   }"
                  :class="[
                    (mainComponent.activeMiniature === i ? 'far fa-dot-circle' : 'far fa-circle'),
                    'bbn-padded',
                    'circleMiniature'
                  ]"
              ></i>
            </template>
          </div>`,
        props: {
          items:{
            type: Array,
            default(){
              return []
            }
          },
          comapare:{
            type: Boolean,
            default(){
              return true
            }
          },
          type:{
            type: String,
            default(){
              return 'image'
            }
          },
          contentOnlyImage: {
            type: Boolean
          },
          dimension:{
            type: Number,
            default(){
              return 45
            }
          }
        },
        data(){
          return {
            mainComponent: bbn.vue.closest(this, 'bbn-slideshow')
          }
        },
        methods:{
          clickMiniature(miniature, idx){
            this.mainComponent.activeMiniature = idx;
            this.mainComponent.currentIndex = idx;
            if( this.mainComponent.autoscroll ){
              this.mainComponent.stopAutoScroll();
              this.$nextTick(()=>{
                this.mainComponent.startAutoScroll();
              });
            }
          },
        },
        mounted(){
          if ( !this.contentOnlyImage ){
            $("div.dddd").find("span").css("transform", "scale(0.2)")
          }
        }
      }
    }
  });
})();
