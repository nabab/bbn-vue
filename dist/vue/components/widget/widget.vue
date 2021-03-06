<template>
<div :class="[componentClass, 'bbn-bordered', 'bbn-radius', 'bbn-alt-background', full ? 'full' : '']"
     @mouseenter="$emit('mouseenter')">
  <!-- HEADER -->
  <div class="bbn-header bbn-no-border bbn-bordered-bottom bbn-unselectable" v-if="title">
    <div class="bbn-flex-width bbn-vxspadded bbn-vmiddle">
      <!-- BUTTONS LEFT -->
      <div class="bbn-header-buttons bbn-widget-button-left bbn-hxspadded">
        <i v-if="closable"
            :title="_('Close')"
            @click="close"
            class="bbn-lg nf nf-fa-times"/>
        <bbn-context v-if="hasMenu"
                      :source="finalMenu">
          <i :title="_('Menu')"
              class="bbn-lg nf nf-fa-caret_down"/>
        </bbn-context>
        <i v-for="(b, idx) in realButtonsLeft"
            :title="b.text"
            @click="actionButton(b.action, uid)"
            :class="['bbn-lg', b.icon]"/>
      </div>
      <!-- TITLE -->
      <div :class="['bbn-widget-title', 'bbn-flex-fill', 'bbn-hpadded', {'bbn-middle': !!icon}]">
        <i v-if="icon" :class="[icon, 'bbn-right-sspace', 'bbn-m']"/>
        <h3 :style="dashboard && dashboard.sortable ? 'cursor: move' : ''"
            :class="['bbn-no-margin', {'bbn-iblock': !!icon}]"
            v-html="title"
            @mousedown="$emit('sortstart')"
            @touchstart="$emit('sortstart')"
            @dragstart="$emit('sortstart')"/>
      </div>
      <!-- BUTTONS RIGHT -->
      <div class="bbn-header-buttons bbn-widget-button-right bbn-hxspadded">
        <i v-for="(b, idx) in realButtonsRight"
            :title="b.text"
            @click="actionButton(b.action, uid)"
            :class="['bbn-lg', b.icon]"/>
      </div>
    </div>
  </div>

  <!-- MAIN CONTENT -->
  <div :class="['bbn-content', 'bbn-radius-bottom', 'bbn-no-border', {'bbn-padded': !component || (contentPadding === true)}]"
       :style="{padding: contentPadding ? contentPadding : false}">
    <!-- LOADING -->
    <div v-if="isLoading" style="min-height: 15em">
      <bbn-loader/>
    </div>
    <!-- COMPONENT -->
    <component v-else-if="component"
                :is="component"
                :source="currentSource"
                @hook:mounted="$emit('loaded')"
                v-bind="options"
                class="bbn-widget-content"/>
    <!-- HTML CONTENT -->
    <div v-else-if="content"
         v-html="content"
         class="bbn-widget-content"/>
    <!-- LIST OF ITEMS -->
    <ul v-else-if="currentItems.length" class="bbn-widget-list bbn-widget-content">
      <template v-for="(it, idx) in currentItems">
        <li :class="itemClass"
            v-if="limit ? idx < limit : true"
            :style="itemStyle"
            :key="idx">
          <component v-if="itemComponent"
                      :is="itemComponent"
                      v-bind="options"
                      :source="it"/>
          <a v-else-if="it && it.text && it.url" :href="it.url" v-html="it.text"/>
          <span v-else-if="it && it.text" v-html="it.text"/>
          <span v-else
                v-html="it"/>
        </li>
        <div v-if="(limit ? idx < limit : true) && separator && currentItems[idx+1]"
             v-html="separator"/>
      </template>
    </ul>
    <!-- NO DATA MESSAGE -->
    <div v-else>
      <slot>
        <div v-html="noData" class="bbn-widget-content bbn-w-100 bbn-c bbn-padded"/>
      </slot>
    </div>
    <!-- GO FULL PAGE -->
    <div v-if="zoomable && currentItems && currentItems.length"
          class="content-buttons zoom bbn-unselectable">
      <i class="nf nf-fa-arrows_alt"
          @click="zoom"/>
    </div>
    <!-- NAVIGATION IN LIST -->
    <div v-if="currentPage"
          class="nav bbn-unselectable">
      <div class="content-buttons nav-first">
        <i class="nf nf-fa-angle_double_left"
            @click="nav('first')"
            :style="{visibility: currentStart > 0 ? 'visible' : 'hidden'}"/>
      </div>
      <div class="content-buttons nav-prev">
        <i class="nf nf-fa-angle_left"
            @click="nav('prev')"
            :style="{visibility: currentStart > 0 ? 'visible' : 'hidden'}"/>
      </div>
      <span v-text="currentPage + '/' + totalPages"></span>
      <div class="content-buttons nav-next">
        <i class="nf nf-fa-angle_right"
            @click="nav('next')"
            :style="{visibility: currentStart < (currentTotal-limit) ? 'visible' : 'hidden'}"/>
      </div>
      <div class="content-buttons nav-last">
        <i class="nf nf-fa-angle_double_right"
            @click="nav('last')"
            :style="{visibility: currentStart < (currentTotal-limit) ? 'visible' : 'hidden'}"/>
      </div>
    </div>
  </div>
</div>

</template>
<script>
  module.exports = /**
 * @file bbn-widget component
 *
 * @description bbn-widget designed to be used in the bbn-dashboard component, it represents a information container. This component can contain, for example: a list of information or a component. The usefulness of this easy-to-implement component is to group the information. Together with other  bbn-widget used in the "bbn-dashboard", provides the overview of the information the user wants to see.
 *
 * @copyrigth BBN Soutions
 *
 * @author BBN Solutions
 *
 * @created 15/02/2017.
 */
(function(bbn){
  "use strict";

  var limits = [5, 10, 15, 20, 25, 30, 40, 50];
  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-widget', {
    name: 'bbn-widget',
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.localStorageComponent,
      bbn.vue.observerComponent,
      bbn.vue.resizerComponent
    ],
    props: {
      uid: {
        type: [String, Number]
      },
      content: {
        type: String
      },
      url: {
        type: [String, Boolean],
        default: false
      },
      limit: {
        type: Number,
        default: 0
      },
      index: {
        type: Number
      },
      hidden: {
        type: Boolean,
        default: false
      },
      start: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      },
      template: {

      },
      hideEmpty: {
        type: Boolean,
        default: false
      },
      component: {
        type: [String, Object]
      },
      itemTemplate: {
        type: String
      },
      itemComponent: {
        type: [String, Object]
      },
      itemStyle: {
        type: [String, Object],
        default: ''
      },
      itemClass: {
        type: [String, Object],
        default: ''
      },
      title: {
        type: String
      },
      icon: {
        type: String
      },
      buttonsLeft: {
        type: [Array, Function],
        default(){
          return [];
        }
      },
      buttonsRight: {
        type: [Array, Function],
        default(){
          return [];
        }
      },
      zoomable: {
        type: Boolean,
        default: false
      },
      closable: {
        type: Boolean,
        default: true
      },
      sortable: {
        type: Boolean,
        default: true
      },
      pageable: {
        type: Boolean,
        default: true
      },
      source: {
        type: Object,
        default: function(){
          return {};
        }
      },
      items: {
        type: Array,
        default: function(){
          return [];
        }
      },
      noData: {
        type: String,
        default: bbn._("There is no available data")
      },
      menu: {
        type: Array,
        default: function(){
          return [];
        }
      },
      position: {
        type: String
      },
      top: {},
      bottom: {},
      full: {
        type: Boolean,
        default: false
      },
      opened: {},
      options: {
        default(){
          return {}
        }
      },
      separator: {
        type: String,
        default: ''
      },
      showable: {
        type: Boolean,
        default: true
      },
      /**
       * The padding value to assign to the content element.
       * If "true" the class "bbn-padded" will be assigned
       * @prop {Boolean|Number|String} [false] padding
       */
      padding: {
        type: [Boolean, Number, String],
        default: false
      }
    },
    data(){
      return {
        _1stRun: false,
        isLoading: false,
        dashboard: false,
        currentItems: this.items,
        currentStart: this.start,
        currentTotal: this.total,
        currentContent: this.content || false,
        currentSource: this.source,
        lang: {
          close: bbn._("Close")
        },
        realButtonsRight: [],
        realButtonsLeft: []
      };
    },
    computed: {
      /**
       * @computed contentPadding
       * @return {String|Boolean}
       */
      contentPadding(){
        if ( bbn.fn.isNumber(this.padding) ){
          return this.padding + 'px';
        }
        return this.padding;
      },
      currentPage(){
        if ( this.currentTotal > this.limit ){
          return (this.currentStart + this.limit) / this.limit;
        }
        return 0;
      },
      totalPages(){
        if ( this.currentTotal > this.limit ){
          return Math.ceil(this.currentTotal / this.limit);
        }
        return 1;
      },
      hasMenu(){
        return !!this.finalMenu.length;
      },
      finalMenu(){
        let tmp = this.menu.slice();
        if ( this.url ){
          tmp.unshift({
            text: bbn._("Reload"),
            icon: "nf nf-fa-refresh",
            action: () => {
              this.reload();
            }
          });
        }
        if ( this.limit ){
          let items = [];
          bbn.fn.each(limits, (a, i) => {
            items.push({
              text: a.toString() + " " + bbn._("Items"),
              selected: a === this.limit,
              action: () => {
                this.dashboard.updateWidget(this.uid, {limit: a});
              }
            })
          });
          tmp.push({
            text: bbn._("Limit"),
            icon: 'nf nf-mdi-numeric',
            items: items,
            mode: "selection"
          });
        }
        return tmp;
      }
    },
    methods: {
      _: bbn._,
      updateButtons(){
        this.realButtonsLeft = bbn.fn.isFunction(this.buttonsLeft) ? this.buttonsLeft() : this.buttonsLeft;
        this.realButtonsRight = bbn.fn.isFunction(this.buttonsRight) ? this.buttonsRight() : this.buttonsRight;
      },
      close(){
        this.$emit("close", this.uid, this);
      },
      zoom(){
      },
      reload(){
        this.currentItems = [];
        this.$nextTick(() => {
          this.load();
        });
      },
      load(){
        if ( this.url ){
          let params = {
            key: this.uid
          };
          this.isLoading = true;
          this.$forceUpdate();
          if ( this.limit && this.pageable ){
            params.limit = this.limit;
            params.start = this.currentStart;
          }
          return this.post(this.url, params, (d) => {
            if ( d.data !== undefined ){
              this.currentItems = d.data;
              if ( d.limit && (this.limit !== d.limit) ){
                this.dashboard.updateWidget(this.uid, {limit: d.limit});
              }
              if ( d.start !== undefined ){
                this.currentStart = d.start;
              }
              if ( d.total !== undefined && (this.currentTotal !== d.total) ){
                this.currentTotal = d.total;
              }
              if ( d.observer && this.observerCheck() ){
                this.observerID = d.observer.id;
                this.observerValue = d.observer.value;
                if ( !this._1stRun ){
                  this.observerWatch();
                  this._1stRun = true;
                }
              }
              if ( d.optional !== undefined ){
                this.optionalData = d.optional;
              }
            }
            else if ( typeof d === 'object' ){
              this.currentSource = d;
            }
            return this.$nextTick(() => {
              this.isLoading = false;
              if (this.ready) {
                this.$emit("loaded");
                this.onResize();
              }
            });
          });
        }
        else {
          return new Promise((resolve) => {
            let items = this.items.slice();
            if ( this.limit && 
              ((items.length > this.currentStart) && (items.length > this.limit))
            ){
              items = items.splice(this.currentStart, this.limit); 
            }

            this.$set(this, 'currentItems', items); 
            return this.$nextTick(() => {
              resolve();
              this.isLoading = false;
              if (this.ready) {
                this.$emit("loaded");
                this.onResize();
              }
            });
          })
        }
      },
      nav(arg){
        let newStart = false;
        switch ( arg ){
          case 'first':
            newStart = 0;
            break;
          case 'prev':
            newStart = this.currentStart >= this.limit ? this.currentStart - this.limit : 0;
            break;
          case 'next':
            newStart = this.currentStart + this.limit;
            break;
          case 'last':
            newStart = (this.totalPages - 1) * this.limit;
            break;
        }
        if ( (newStart !== false) && (newStart !== this.currentStart) ){
          this.currentStart = newStart;
          this.load();
        }
      },
      actionButton(name, uid){
        let tmp = this;
        let comp = this.component || this.itemComponent;
        if (!bbn.fn.isString(comp)) {
          comp = false;
        }
        else {
          comp = bbn.vue.find(this, comp);
        }
        if ( comp && bbn.fn.isFunction(comp[name]) ){
          return comp[name]();
        }
        if (bbn.fn.isFunction(name) ){
          return name(this, this.items);
        }
        while ( tmp ){
          if (bbn.fn.isFunction(tmp[name]) ){
            return tmp[name]();
          }
          tmp = tmp.$parent;
        }
      },
      setConfig(){
        if ( this.dashboard ){
          this.dashboard.setConfig(this.uid, {
            uid: this.uid,
            limit: this.limit,
            hidden: this.hidden,
            index: this.index
          });
        }
      }
    },
    created(){
      this.updateButtons();
    },
    beforeMount(){
      this.dashboard = bbn.vue.closest(this, "bbn-dashboard");
    },
    mounted(){
      this.setResizeEvent();
      this.load().then(() => {
        this.ready = true;
      });
    },
    updated(){
      if ( this.dashboard ){
        this.dashboard.selfEmit(true);
      }
    },
    watch: {
      limit(newVal){
        this.load();
      },
      /*
      hidden(newVal){
        if ( !newVal ){
          this.load();
        }
      },
      */
     /**
      * @watch observerDirty
      * @param {Boolean} newVal
      * @fires load
      */
      observerDirty(newVal){
        if ( newVal && !this.editedRow ){
          this.observerDirty = false;
          this.load();
        }
      },
      source: {
        deep: true,
        handler(newVal){
          this.currentSource = newVal
        }
      }
    }
  });

})(bbn);

</script>
<style scoped>
.bbn-widget > div.bbn-content {
  box-sizing: border-box;
  hyphens: auto;
  word-wrap: break-word;
  display: inline-block;
  float: left;
  padding-bottom: 1.5em;
  width: 100%;
  position: relative;
  overflow: hidden;
}
.bbn-widget div.content-buttons {
  cursor: pointer;
}
.bbn-widget div.zoom {
  right: 2px;
  position: absolute;
  bottom: 0px;
}
.bbn-widget div.nav {
  right: 50%;
  margin-right: -25%;
  width: 50%;
  position: absolute;
  bottom: 0px;
  text-align: center;
}
.bbn-widget div.nav > div {
  display: inline-block;
  margin: 0 2px;
}
.bbn-widget div.content-buttons:hover,
.bbn-widget div.content-buttons:focus {
  opacity: 1;
}
.bbn-widget ul.bbn-widget-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.bbn-widget li {
  padding: 0.3em 0em;
}
.bbn-widget li .bbn-grid-fields {
  padding: 0;
}
.bbn-widget div.bbn-header {
  text-align: center;
}
.bbn-widget div.bbn-header > div {
  overflow: hidden;
}
.bbn-widget div.bbn-header h1,
.bbn-widget div.bbn-header h2,
.bbn-widget div.bbn-header h3,
.bbn-widget div.bbn-header h4,
.bbn-widget div.bbn-header h5,
.bbn-widget div.bbn-header h6 {
  margin: 0 3em;
}
.bbn-widget div.bbn-header i.nf {
  vertical-align: middle;
}
.bbn-widget div.bbn-header .nf:before {
  vertical-align: middle;
}
.bbn-widget div.bbn-header .bbn-widget-button-left i {
  margin-left: .25em;
}
.bbn-widget div.bbn-header .bbn-widget-button-right i {
  margin-right: .25em;
}

</style>
