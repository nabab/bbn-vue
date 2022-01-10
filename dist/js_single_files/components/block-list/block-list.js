((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="componentClass">
  <div class="bbn-hidden" v-if="$slots.default" ref="slot">
    <slot></slot>
  </div>
  <div :class="getComponentName() + '-content'">
    <div v-for="(li, idx) in filteredData"
         v-if="!pageable || ((idx >= start) && (idx < start + currentLimit))"
         :key="li.key"
         :class="['bbn-w-25', 'bbn-mobile-w-50', getComponentName() + '-items']">
      <component v-if="currentComponent"
                  :is="currentComponent"
                  v-bind="componentOptions"
                  :source="li.data"
                  :index="li.index"
                  @remove="remove(idx)"
                  :key="li.key">
      </component>
      <component v-else
                :is="li.data && li.data.url && !li.data[children] ? 'a' : 'span'"
                @click.prevent="() => {}"
                class="bbn-block bbn-padded"
                :title="li.data[sourceText]"
                :href="li.data && li.data.url ? li.data.url : null"
                :key="li.key">
        <span class="bbn-top-left"
              v-if="selection || (mode === 'options')">
          <i v-if="li.data.selected"
              class="nf nf-fa-check"></i>
        </span>
        <img v-if="li.data.image"
            :src="li.data.image"
            class="bbn-bottom-space">
        <p class="bbn-large"
           v-html="li.data[sourceText]"/>
        <p v-if="li.data.price"
           :class="componentClass + '-price'"
           v-html="li.data.price"/>
        <p v-if="li.data.desc"
           :class="componentClass + '-desc'"
           v-html="li.data.desc"/>
      </component>
    </div>
  </div>
  <div class="bbn-w-100 bbn-c"
        v-if="pageable">
    <div class="bbn-iblock">
      <bbn-pager :element="_self"
                 :extra-controls="false"
                 :numeric-selector="false"
                 :buttons="false"/>
    </div>
  </div>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-block-list');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

/**
 * @file bbn-combo component
 * @description The easy-to-implement bbn-combo component allows you to choose a single value from a user-supplied list or to write new.
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 10/02/2017.
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-block-list', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.componentInsideComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent,
      bbn.vue.componentInsideComponent
    ],
    mounted(){
      this.ready = true;
    }
  });

})(bbn);


})(bbn);