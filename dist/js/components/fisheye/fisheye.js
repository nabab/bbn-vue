(bbn_resolve) => {
((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="componentClass"
     :style="{zIndex: zIndex}"
>
  <bbn-scroll :scrollable="scrollable"
              @hook:mounted="onScrollMounted"
  >
    <div v-if="!showIcons"
         :class="['bbn-fisheye-dots', 'bbn-overlay', 'bbn-middle', {'bbn-invisible': !ready}]"
         :style="{zIndex: zIndex}"
    >
      <span class="bbn-block bbn-p"
            @click="toggleFloater"
            ref="dots"
        >
          <i class="nf nf-mdi-dots_horizontal bbn-middle"></i>
        </span>
    </div>
    <ul ref="container"
        :class="['bbn-spadded', {'bbn-invisible': !showIcons || !ready}]"
        :style="{zIndex: zIndex}"
    >
      <li v-for="it in items"
          :key="it.index"
          :draggable="!it.fixed"
          @mouseover="mouseover(it.index)"
          @mouseout="mouseout(it.index)"
          @dragstart="dragstart(it.index, $event)"
          @dragend="dragend(it.index, $event)"
      >
        <span class="bbn-iblock bbn-p"
              draggable="false"
              @click="onClick(it.data, it.index)"
        >
          <i :class="it.data.icon"></i>
        </span>
      </li>
    </ul>
  </bbn-scroll>
  <bbn-floater v-if="visibleFloater"
               ref="floater"
               class="bbn-widget"
               :auto-hide="1000"
               @close="visibleFloater = false"
               :scrollable="true"
               width="100%"
               height="100%"
               :left="0"
               :right="0"
               :top="floaterTop"
  >
    <div class="bbn-spadded bbn-fisheye-floater-content">
      <span v-for="it in items"
            :key="it.index"
            :draggable="!it.fixed"
            @dragstart="dragstart(it.index, $event)"
            @dragend="dragend(it.index, $event)"
            class="bbn-w-100 bbn-c bbn-smargin bbn-p"
            @click="onClick(it.data, it.index)"
      >
        <div class="bbn-w-100 bbn-middle">
          <i :class="[it.data.icon, 'bbn-fisheye-floater-icon', 'bbn-box', ' bbn-xxspadded', 'bbn-middle']"></i>
        </div>
        <div class="bbn-w-100 bbn-top-sspace" v-text="it.data[sourceText]"></div>
      </span>
    </div>
  </bbn-floater>
  <div class="bbn-fisheye-bin"
       v-if="visibleBin"
       :style="binPosition"
  >
    <i :class="['nf nf-fa-trash', {'bbn-red': overBin}]"
       @dragenter.prevent="overBin = true"
       @dragover.prevent="() => {}"
       @dragleave="dragleave($event)"
       @drop="drop($event)"
    ></i>
  </div>
  <div class="bbn-fisheye-text"
       v-if="(visibleText > -1) && showIcons"
       v-html="items[visibleText].data[sourceText]"
  ></div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-fisheye');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/fisheye/fisheye.css");
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-fisheye component
 *
 * @description bbn-fisheye is a component that represents a horizontal menu, ideal for managing shortcuts.
 * The structure of data cannot be hierarchical.
 * Each element is represented by an icon capable of performing an action.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-fisheye', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.resizerComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.listComponent],
    props: {
      /**
       * The source of the component
       * @prop {Array} [[]] source
       */
      source: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * True if you want to activate the possibility to remove an element.
       * @prop {Boolean} [false] removable
       */
      removable: {
        type: Boolean,
        default: false
      },
      /**
       * An array of items fixed on the left of the component
       * @prop {Array} [[]] fixedLeft
       */
      fixedLeft: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * An array of items fixed on the right of the component
       * @prop {Array} [[]] fixedRight
       */
      fixedRight: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * The zIndex of the component
       * @prop {Number} [1] zIndex
       */
      zIndex: {
        type: Number,
        default: 1
      },
      /**
       * True if you want to render the component scrollable
       * @prop {Boolean} [false] scrollable
       */
      scrollable: {
        type: Boolean,
        default: false
      },
      /**
       * True if you want to render the mobile version of the component
       * @prop {Boolean} [false] mobile
       */
      mobile: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        /**
         * @data {Boolean} [false] menu
         */
        menu: false,
        /**
         * @data {Boolean} [false] widget
         */
        widget: false,
        /**
         * @data {Boolean} [false] overBin
         */
        overBin: false,
        /**
         * @data {Boolean} [false] droppableBin
         */
        droppableBin: false,
        /**
         * @data {Boolean|Number} [false] timeout
         */
        timeout: false,
        /**
         * @data {Boolean|Number} [false] binTimeout
         */
        binTimeout: false,
        /**
         * @data {Boolean} [false] visibleBin
         */
        visibleBin: false,
        /**
         * @data {Number} [-1] visibleText
         */
        visibleText: -1,
        /**
         * @data {Number} [-1] draggedIdx
         */
        draggedIdx: -1,
        /**
         * @data {Boolean} [true] showIcons
         */
        showIcons: !this.mobile,
        /**
         * @data {Boolean} [false] visibleFloater
         */
        visibleFloater: false,
        /**
         * @data {Number} [0] floaterTop
         */
        floaterTop: 0
      };
    },
    computed: {
      /**
       * The icons list
       * @computed items
       * @returns {Array}
       */
      items(){
        let items = [];
        let i = 0;
        bbn.fn.each(this.fixedLeft, (a) => {
          items.push({
            data: a,
            fixed: true,
            index: i
          });
          i++;
        });
        bbn.fn.each(this.filteredData, (a) => {
          items.push({
            data: a.data,
            fixed: false,
            index: i
          });
          i++;
        });
        bbn.fn.each(this.fixedRight, (a) => {
          items.push({
            data: a,
            fixed: true,
            index: i
          });
          i++;
        });
        return items;
      },
      /**
       * The bin position.
       * @computed binPosition
       * @returns {String}
       */
      binPosition(){
        return this.showIcons ? 'top: 15em' : 'bottom: calc(-' + bbn.env.height + 'px + 5em)';
      }
    },
    methods: {
      /**
       * Fires the action given to the item
       * @method onClick
       * @param {Object} it
       */
      onClick(it){
        if ( it.url ){
          bbn.fn.link(it.url);
        }
        if ( it.action && bbn.fn.isFunction(it.action) ){
          it.action();
        }
        this.visibleFloater = false;
      },
      /**
       * The method called on the mouseover
       * @method mouseover
       * @param {Number} idx
       */
      mouseover(idx){
        if ( !bbn.fn.isMobile() && (this.visibleText !== idx) ){
          clearTimeout(this.timeout);
          this.visibleText = -1;
          this.timeout = setTimeout(() => {
            this.visibleText = idx;
          }, 500);
        }
      },
      /**
       * The method calledon the mouseout
       * @method mouseout
       */
      mouseout(){
        clearTimeout(this.timeout);
        this.visibleText = -1;
      },
      /**
       * The method called on the dragleave
       * @method dragleave
       */
      dragleave(){
        setTimeout(() => {
          this.overBin = false;
        }, 500);
      },
      /**
       * The method called on the dragstart
       * @method dragstart
       * @param {Number} idx
       * @param {Event} e
       */
      dragstart(idx, e){
        if ( this.removable && e.dataTransfer ){
          e.dataTransfer.allowedEffect = 'move';
          e.dataTransfer.dropEffect = 'move';
          this.draggedIdx = idx;
          this.visibleBin = true;
        }
        else{
          e.preventDefault();
        }
      },
      /**
       * The method called on the dragend
       * @method dragend
       */
      dragend(){
        if ( this.removable ){
          this.visibleBin = false;
          this.draggedIdx = -1;
        }
      },
      /**
       * The method called on the drop
       * @method drop
       * @param {Event} e
       * @emits remove
       */
      drop(e){
        if ( this.items[this.draggedIdx] ){
          e.preventDefault();
          this.$emit('remove', this.items[this.draggedIdx].data, e);
        }
      },
      /**
       * Checks the measures of the main container and the icons container
       * @method checkMeasures
       * @fires getRef
       */
      checkMeasures(){
        let ct = this.getRef('container');
        if ( ct && !this.mobile ){
          this.showIcons = this.lastKnownWidth >= ct.offsetWidth;
        }
      },
      /**
       * Opens or closes the floater.
       * @method toggleFloater
       */
      toggleFloater(){
        if ( !this.visibleFloater ){
          this.floaterTop = this.$el.getBoundingClientRect().height;
        }
        this.visibleFloater = !this.visibleFloater;
      },
      /**
       * The method called on scroll mounted
       * @fires checkMeasures
       */
      onScrollMounted(){
        this.$nextTick(() => {
          this.checkMeasures();
        })
      }
    },
    /**
     * @event mounted
     * @fires setResizeMeasures
     * @fires setContainerMeasures
     * @fires checkMeasures
     */
    mounted(){
      this.setResizeMeasures();
      this.setContainerMeasures();
      this.$nextTick(() => {
        this.ready = true;
        this.checkMeasures();
      })
    },
    watch: {
      /**
       * @watch source
       * @fires updateData
       */
      source(){
        this.updateData();
      },
      /**
       * @watch lastKnownWidth
       * @fires checkMeasures
       */
      lastKnownWidth(newVal){
        this.checkMeasures();
      },
      /**
       * @watch items
       * @fires checkMeasures
       */
      items(){
        if ( this.ready ){
          this.$nextTick(() => {
            this.checkMeasures();
          })
        }
      }
    }
  });
})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}