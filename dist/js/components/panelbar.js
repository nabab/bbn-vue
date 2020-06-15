((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass]">
  <div class="bbn-bordered bbn-h-100">
    <div class="bbn-flex-height" ref="container">
      <template v-for="(s, idx) in source">
        <div class="bbn-panelbar-bbn-header bbn-header bbn-spadded bbn-vmiddle" ref="header">
          <div class="bbn-panelbar-arrow-container bbn-hspadded bbn-p bbn-middle bbn-block"
               @click="select(idx)">
            <i :class="['nf nf-fa-angle_right', 'bbn-panelbar-header-icon', 'bbn-large',  {'bbn-panelbar-header-icon-rotate': preselected === idx}]"></i>
          </div>
          <div :class="['bbn-panelbar-title', 'bbn-vmiddle', {
                  'bbn-panelbar-center': (align === 'center'),
                  'bbn-panelbar-start': (align === 'left'),
                  'bbn-panelbar-end': (align === 'right')
                }]"
          >
            <div v-html="s.header" 
                @click="select(idx)"
                :class="{
                  'bbn-p':true, 
                  'bbn-panelbar-inline': s.headerComponent,
                  'bbn-panelbar-right-padded': s.headerComponent || headerComponent
                }"
            ></div>
            <component v-if="s.headerComponent" 
                      :is="s.headerComponent" 
                      v-bind="source[idx]['headerOptions']"
            ></component>
            <component v-if="headerComponent && !s.headerComponent" 
                      :is="headerComponent" 
                      v-bind="headerOptions"
            ></component>
          </div>
        </div>
        <div :class="['bbn-border-box', {
              'bbn-w-100': !scrollable,
              'bbn-panelbar-selected' : selected === idx,
              'bbn-flex-fill': ((selected === idx) && (flex || source[idx].flex))
            }]"
            :style="getStyle(idx)"
        >
          <component :is="scrollable ? 'bbn-scroll' : 'div'"
                     :class="{'bbn-w-100': !scrollable}"
                     :key="idx"
          >
            <div v-if="!s.component && !component" 
                 v-html="s.content" 
            ></div>
            <div v-else-if="!s.component && component"
                :class="['bbn-panelbar-content', {'bbn-w-100': !scrollable}]"
            >
              <component :is="component"
                        v-bind="componentOptions"
                        :class="{'bbn-w-100': !scrollable}"
              ></component>  
            </div>
            <div v-else-if="(s.component)"
                :class="['bbn-panelbar-content', {'bbn-w-100': !scrollable}]"
            >
              <component :is="s.component"
                         v-bind="source[idx]['componentOptions']"
                         :class="{'bbn-w-100': !scrollable}"
              ></component>  
            </div>
          </component>
        </div>
      </template>
    </div>
  </div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-panelbar');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('style');
css.innerHTML = `.bbn-panelbar .bbn-panelbar-bbn-header {
  border-top: none;
  border-right: none;
  border-left: none;
  border-radius: 0;
  margin-bottom: 0;
  width: 100%;
}
.bbn-panelbar .bbn-panelbar-bbn-header .bbn-panelbar-arrow-container {
  width: 3em;
  height: 100%;
}
.bbn-panelbar .bbn-panelbar-bbn-header .bbn-panelbar-arrow-container .bbn-panelbar-header-icon {
  display: inline-block;
  transform: rotate(0deg);
  transition-duration: 0.3s;
}
.bbn-panelbar .bbn-panelbar-bbn-header .bbn-panelbar-arrow-container .bbn-panelbar-header-icon.bbn-panelbar-header-icon-rotate {
  transform: rotate(90deg);
  transition-duration: 0.3s;
}
.bbn-panelbar .bbn-panelbar-bbn-header .bbn-panelbar-title {
  margin-right: 3em;
  margin-left: 3em;
  width: 100%;
}
.bbn-panelbar .bbn-panelbar-bbn-header .bbn-panelbar-title.bbn-panelbar-center {
  justify-content: center;
}
.bbn-panelbar .bbn-panelbar-bbn-header .bbn-panelbar-title.bbn-panelbar-start {
  justify-content: flex-start;
}
.bbn-panelbar .bbn-panelbar-bbn-header .bbn-panelbar-title.bbn-panelbar-end {
  justify-content: flex-end;
}
.bbn-panelbar .bbn-panelbar-bbn-header .bbn-panelbar-title .bbn-panelbar-right-padded {
  padding-right: 1em;
}
.bbn-panelbar .bbn-panelbar-bbn-header .bbn-panelbar-selected,
.bbn-panelbar .bbn-panelbar-bbn-header .bbn-panelbar-content {
  transition: all 2s;
  transition: height 0.8s;
}
.bbn-panelbar .bbn-panelbar-bbn-header .buttons button {
  border: 0;
}
.bbn-panelbar .bbn-panelbar-inline {
  display: inline;
}
`;
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-panelbar component
 *
 * @description bbn-panelbar is a component that configures itself easily, it allows to visualize the data in a hierarchical way expandable to levels.
 * It can contain texts, html elements and even Vue components, the latter can be inserted both on its content but also as a header.
 * Those who use this component have the possibility to see schematically their data with the maximum simplicity of interpretation.
 *
 * @copyright BBN Solutions
 *
 * @author Loredana Bruno
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-panelbar', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.localStorageComponent
     * @mixin bbn.vue.resizerComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent, bbn.vue.resizerComponent],

    props: {
      flex: { 
        type: Boolean,
        default: false
      },
      /**
       * The source of the component. The object item has property:
       * - header // the title on the header
       * - headerComponent // a component on the header
       * - headerOptions // options relative to the component on the header
       * - content // the content html or text to show when the item is selected
       * - component // a component to show when the item is selected
       * - height // the height of the item's slot, it will overwrite the props itemsHeight for the item
       * - options // options of configuration of the component shown in the slot of the item
       *
       * @prop {Array} items
       */
      source: {
        type: [ Array ]
      },
      scrollable: {
        type: Boolean,
        default: true
      },
      align: {
        type: String,
        default: 'center'
      },
      /**
       * Specifies whether or not an index will be expanded
       *
       * @prop {Number} opened
       */
      opened: {
        type: [Number],
      },
      /**
       * The component to be rendered on each header if not specified for the single item in the source
       * @prop {String} headerComponent
       */
      headerComponent: {
        type: String
      },
      /**
       * The object of properties to bind with the headerComponent
       * @prop {Object} headerOptions
       * 
       */
      headerOptions: {
        type: Object
      },
      /**
       * the component to be rendered in each content slot if not specified for the single item in the source
       * @prop {String} component
       */
      component: {
        type: String
      },
      /**
       * the object of properties to bind with the component in the content slot
       * @prop {Object} componentOptions
       */
      componentOptions :{
        type: Object
      }
    },
    data(){
      return {
        size: null,
        /**
         * The index of the selected item
         * @data {Number} [null] selected
         */
        selected: null,
        preselected: null,
        childHeight: 0
      };
    },
    computed:{
      headers(){
        return this.$refs['header']
      }
    },
     /**
      * Select the index of item defined by the prop opened
      * @event mounted
      */
    mounted(){
      if ( this.opened !== undefined ){
        this.$nextTick(()=>{
          this.select(this.opened)
        })
      }
    },
    methods: {
      onResize(){
        this.size = this.$el.clientHeight;
      },
     /**
       * Shows the content of selected items and emits the event select
       * @emits select
       * @method select
       * @param {Number} idx
       */
      select(idx){
        if ( this.selected !== idx ){
          this.preselected = idx;
          if (this.selected === null) {
            setTimeout(() => {
              this.selected = idx;
            }, 300);
          }
          else {
            this.selected = idx;
          }
          this.$emit('select', idx, this.source[idx])
          if ( !this.scrollable && !this.flex ){
            this.$nextTick(()=>{
              this.getStyle(idx)
            })
          }
          
        }
        else{
          this.preselected = null;
          this.selected = null;
        }
      },
      getStyle(idx){
        bbn.fn.log('before',this.source[idx])
        if ((idx !== null ) && (idx === this.preselected) &&  (this.flex || ((this.source[idx] !== undefined) && (this.source[idx].flex === true)) )) {
          return this.size ? {height: this.size + 'px', overflow: 'hidden'} : {};
        }
        //if this.flex === false, case of panelbar containing a table or other content that has an height
        else if ((idx !== null ) && (idx === this.preselected) && (!this.flex || ( (this.source[idx] !== undefined) && (this.source[idx].flex === false)) )) {
          let children = this.getRef('container').children, 
              res = [],
              childHeight = 0;
          bbn.fn.each(children, (a) => {
            if ( a.classList.contains('bbn-border-box') ){
              res.push(a)
            }
          })
          this.$nextTick(()=>{
            if ( res[idx] && res[idx].firstElementChild.clientHeight ){
              this.childHeight = res[idx].firstElementChild.clientHeight
            }  
            return this.size ? {height: this.childHeight + 'px', overflow: 'hidden'} : {};
          })
        }
        else{
          return {height: '0px', overflow: 'hidden'};
        }
      },

    },
    watch: {
      selected(v, o) {
        if ( v !== null ){
          setTimeout(() => {
            this.headers[v].style.overflow = null;
          }, 300)
        }
      }
    }
  });

})(bbn);

})(bbn);