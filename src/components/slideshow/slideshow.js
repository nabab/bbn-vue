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
      }
    },
    data() {
      let src = [],
          isAjax = false;
      if ( (typeof this.source === 'string') ){
        if ( this.separator ){
          src = this.source.split(this.separator).map((a) => { return {content: a};});
        }
        else{
          src = [];
          isAjax = true;
        }
      }
      else if ( bbn.fn.isFunction(this.source) ){
        src = this.source();
      }
      else if ( bbn.fn.isArray(this.source) ){
        src = this.source.slice();
      }
      return {
        name: bbn.fn.randomString().toLowerCase(),
        currentIndex: 0,
        items: src,
        isAjax: isAjax
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
      },
      next(){
        let idx = this.currentIndex;
        if ( idx < (this.items.length - 1) ){
          if ( !this.items[idx+1].animation ){
            this.getRef('slide' + (idx+1).toString()).style.animationName = 'slide_from_left';
          }
          this.currentIndex++;
        }
      },
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
      this.ready = true;
    },
    watch: {
      show(newVal, oldVal){
        if ( newVal != oldVal ){
          this.$emit(newVal ? "show" : "hide");
        }
      }
    }
  });

})();
