<template>
<div :class="[componentClass, 'bbn-floater-list']">
  <div class="bbn-hidden" v-if="$slots.default" ref="slot">
    <slot></slot>
  </div>
  <ul v-if="filteredData.length && ready"
      :class="['bbn-menulist', mode]"
      @mouseleave="mouseleave"
  >
    <li v-for="(li, idx) in filteredData"
        v-if="!pageable || ((idx >= start) && (idx < start + currentLimit))"
        @mouseenter="mouseenter($event, idx)"
        :ref="'li' + idx"
        :key="uid ? li.data[uid] : idx"
        @click="select(idx)"
        :class="{
          'bbn-no-padding': !!component,
          'bbn-state-default': true,
          'bbn-disabled': (tmpDisabled === idx) || (!component && !!li.data.disabled),
          'bbn-state-selected': isSelected(idx),
          'bbn-state-hover': overIdx === idx
        }">
      <component v-if="currentComponent"
                 :is="currentComponent"
                 :source="li.data"
                 @remove="remove(idx)"
                 @hook:mounted="selfEmit(true)">
      </component>
      <component v-else
                :is="li.data.url && !li.data[children] ? 'a' : 'span'"
                @click.prevent="() => {}"
                class="bbn-w-100 bbn-vxspadded bbn-hspadded"
                :href="li.data.url || null">
        <span class="space" v-if="selection || (mode === 'options')">
          <i v-if="li.data.selected"
            class="nf nf-fa-check"></i>
        </span>
        <span class="space" v-if="hasIcons">
          <i v-if="li.data.icon" :class="li.data.icon"></i>
        </span>
        <span class="text" v-html="li.data[sourceText]"></span>
      </component>
      <div v-if="!currentComponent && li.data[children] && li.data[children].length"
          class="bbn-block bbn-abs bbn-vxspadded bbn-hspadded"
          style="right: 0px"
      >
        <i class="nf nf-fa-chevron_right"></i>
      </div>
      <bbn-floater v-if="isOpened && children &&
                          (origin === 'floater') &&
                          li.data[children] &&
                          (overIdx === idx) &&
                          getRef('li' + idx)"
                  :uid="uid"
                  :level="level + 1"
                  :mode="li.data.mode || 'free'"
                  :source="li.data[children]"
                  :element="getRef('li' + idx)"
                  orientation="horizontal">
      </bbn-floater>
      <bbn-list v-else-if="(origin !== 'floater') &&
                            children &&
                            li.data[children] &&
                            getRef('li' + idx)"
                :level="level + 1"
                :mode="li.data.mode || 'free'"
                :uid="uid"
                :source="li.data[children]">
      </bbn-list>
    </li>
  </ul>
</div>

</template>
<script>
  module.exports = /**
 * @file bbn-list component
 *
 * @description A fully customizable selectable list.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */
(function(Vue, bbn){
  "use strict";
  /**
   * Classic input with normalized appearance
   */
  let isClicked = false;
  Vue.component('bbn-list-input', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.keynavComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.listComponent, 
      bbn.vue.keynavComponent, 
      bbn.vue.inputComponent
    ],
    props: {
      //@todo not used.
      unique: {
        type: Boolean,
        default: true
      },
      /**
       * The mode of the component.
       * @prop {String} ['free'] mode
       */
      mode: {
        type: String,
        default: "free"
      },
      /**
       * @prop {Boolean} [false] suggest
       */
      suggest: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        
      };
    },
    computed: {
    },
    methods: {
    },
    /**
     * @event mounted
     */
    mounted(){
    }
  });

})(window.Vue, window.bbn);


</script>
<style scoped>
.bbn-list-input > ul.options > li.bbn-disabled {
  opacity: 1;
}
.bbn-list-input > ul.options > li.bbn-disabled .space {
  opacity: 0.5;
}
.bbn-list-input > ul > li {
  position: relative;
  box-sizing: border-box;
  min-width: 7rem;
  white-space: nowrap;
}
.bbn-list-input > ul > li.bbn-disabled {
  opacity: 0.7;
}
.bbn-list-input > ul > li .space {
  display: inline-block;
  width: 1.8rem;
  text-align: left;
}
.bbn-list-input > ul > li .text {
  min-height: 1.2rem;
  line-height: 1.2rem;
}
.bbn-list-input > ul > li .text i {
  margin-right: 1rem;
}
.bbn-list-input > ul > li .text.bbn-disabled i {
  opacity: 0.5;
}
.bbn-list-input > ul > li .text.hidden i {
  opacity: 0 !important;
}

</style>
