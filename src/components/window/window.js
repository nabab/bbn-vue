/**
 * @file bbn-window component
 *
 * @description The bbn-window is a component that represents a modal window in which it is possible to show the content.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 15/02/2017
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-window', {
    name: 'bbn-window',
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      width: {
        type: [String, Number, Boolean]
      },
      height: {
        type: [String, Number, Boolean]
      },
      minWidth: {
        type: [String, Number]
      },
      minHeight: {
        type: [String, Number]
      },
      maximizable: {
        type: Boolean,
        default: true
      },
      closable: {
        type: Boolean,
        default: true
      },
      scrollable: {
        type: Boolean,
        default: true
      },
      draggable: {
        type: Boolean,
        default: false
      },
      resizable: {
        type: Boolean,
        default: true
      },
      maximized: {
        type: Boolean,
        default: false
      },
      onOpen: {
        type: Function
      },
      beforeClose: {
        type: Function
      },
      onClose: {
        type: Function
      },
      afterClose: {
        type: Function
      },
      footer: {
        type: [Function, String, Object]
      },
      buttons: {
        type: Array,
        default(){
          return [];
        }
      },
      source: {
        type: Object,
        default(){
          return {};
        }
      },
      component: {
        type: [String, Function, Object]
      },
      title: {
        type: [String, Boolean],
        default: bbn._("Untitled")
      },
      index: {
        type: Number
      },
      uid: {
        type: String
      },
      content: {
        type: String
      },
      mode: {
        type: String
      }
    },
    data(){
      let fns = [];
      if ( this.onClose ){
        fns.push(this.onClose);
      }
      return {
        isMaximized: this.maximized,
        widthUnit: (typeof this.width === 'string') && (this.width.substr(-1) === '%') ? '%' : 'px',
        currentWidth: this.width,
        heightUnit: (typeof this.height === 'string') && (this.height.substr(-1) === '%') ? '%' : 'px',
        currentHeight: this.height,
        closingFunctions: fns,
        showContent: false,
        popup: false,
        maxHeight: null,
        maxWidth: null,
        containerCSS: {opacity: 0}
      }
    },

    computed: {
      realWidth(){
        if ( !this.currentWidth ){
          return 'auto';
        }
        if ( typeof this.currentWidth === 'number' ){
          return this.currentWidth.toString() + 'px'
        }
        return this.currentWidth;
      },
      realHeight(){
        if ( !this.currentHeight ){
          return 'auto';
        }
        if ( typeof this.currentHeight === 'number' ){
          return this.currentHeight.toString() + 'px'
        }
        return this.currentHeight;
      },
    },

    methods: {
      getContainerPosition(){
        return this.$el ? this.$el.parentNode.getBoundingClientRect() : {};
      },
      onResize(){
        let o = this.getContainerPosition();
        this.containerCSS = {
          opacity: 1,
          top: o.top + 'px',
          left: o.left + 'px',
          width: o.width + 'px',
          height: o.height + 'px',
        }
      },
      addClose(fn){
        for ( let i = 0; i < arguments.length; i++ ){
          if ( typeof arguments[i] === 'function' ){
            this.closingFunctions.push(arguments[i])
          }
        }
      },
      removeClose(fn){
        if ( !fn ){
          this.closingFunctions = [];
        }
        else{
          this.closingFunctions = bbn.fn.filter(this.closingFunctions, (f) => {
            return fn !== f;
          })
        }
      },
      floaterClose(e, floater){
        this.close(false, e);
      },
      close(force, ev){
        let ok = true;
        if ( !ev ){
          ev = new Event('beforeClose', {cancelable: true});
        }
        if ( !force ){
          if ( this.popup ){
            this.popup.$emit('beforeClose', ev, this);
          }
          else{
            this.$emit('beforeClose', ev, this);
          }
          if ( this.beforeClose && (this.beforeClose(this) === false) ){
            return;
          }
        }
        /*
        bbn.fn.each(this.closingFunctions, (a) => {
          if (!ev.defaultPrevented) {
            a(this, ev);
          }
        });
        */
        if (!force && bbn.fn.isObject(ev) && ev.defaultPrevented) {
          return;
        }
        let closeEvent = new Event('close', {cancelable: true});
        this.$el.style.display = 'block';
        this.$nextTick(() => {
          this.$emit("close", this, closeEvent);
          if ( this.afterClose ){
            this.afterClose(this);
          }
        })
      }
    },
    created(){
      this.popup = this.closest('bbn-popup');
    },
    mounted(){
      this.ready = true;
      /*
      if ( this.resizable ){
        $(this.getRef('window')).resizable({
          handles: "se",
          containment: ".bbn-popup",
          stop: () => {
            this.selfEmit(true);
          }
        });
      }
      */
      this.onResize();
      // It shouldn't be centered if it's draggable
      /*
      if ( this.draggable ){
        $(this.getRef('window')).draggable({
          handle: 'header > h4',
          containment: ".bbn-popup"
        });
      }
      */
    },
    watch: {
      isMaximized(){
        this.$nextTick(() => {
          this.selfEmit(true);
        })
      },
    }
  });

})(bbn);
