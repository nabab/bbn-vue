<template>
<div :class="[componentClass, 'bbn-block']">
  <div class="bbn-block"
        v-if="element && element.pageable && element.filteredData.length"
  >
    <span v-if="element.filteredData.length && element.pageable && element.isAjax"
          v-text="_('Display items') + ' ' + (element.start+1) + '-' + (element.start + element.currentLimit > element.total ? element.total : element.start + element.currentLimit) + ' ' + _('of') + ' ' + element.total"
    ></span>
    <span v-if="element.filteredData.length && element.pageable && !element.isAjax"
          v-text="_('Display items') + ' ' + (element.start+1) + '-' + (element.start + element.currentLimit > element.filteredData.length ? element.filteredData.length : element.start + element.currentLimit) + ' ' + _('of') + ' ' + element.filteredData.length"
    ></span>
    <span v-else-if="element.filteredData.length"
          v-text="element.total ? _('Total') + ': ' + element.total + ' ' + _('items') : _('No item')"
    ></span>
    &nbsp; 
    <bbn-button icon="nf nf-fa-angle_double_left"
                :notext="true"
                :title="_('Go to the first page')"
                :disabled="element.isLoading || (element.currentPage == 1)"
                @click="element.currentPage = 1"
    ></bbn-button>
    <bbn-button icon="nf nf-fa-angle_left"
                :notext="true"
                :title="_('Go to the previous page')"
                :disabled="element.isLoading || (element.currentPage == 1)"
                @click="element.currentPage--"
    ></bbn-button>
    <span v-text="_('Page')"></span>
    <span v-if="element.isLoading"
          v-text="element.currentPage"
          class="bbn-iblock bbn-c"
          style="margin-right: 0.5em; width: 6em"></span>
    <bbn-numeric v-else
                  v-model="element.currentPage"
                  :min="1"
                  :max="element.numPages"
                  style="margin-right: 0.5em; width: 6em"
    ></bbn-numeric>
    <span v-text="_('of') + ' ' + element.numPages" style="margin-right: 0.25em"></span>
    <bbn-button icon="nf nf-fa-angle_right"
                :notext="true"
                :title="_('Go to the next page')"
                :disabled="element.isLoading || (element.currentPage == element.numPages)"
                @click="element.currentPage++"
    ></bbn-button>
    <bbn-button icon="nf nf-fa-angle_double_right"
                :notext="true"
                :title="_('Go to the last page')"
                @click="element.currentPage = element.numPages"
                :disabled="element.isLoading || (element.currentPage == element.numPages)"
    ></bbn-button>
    <span class="bbn-hmargin">
      <bbn-dropdown :source="element.limits"
                    v-model.number="element.currentLimit"
                    class="bbn-narrow"
                    @change="element.currentPage = 1"
                    :disabled="!!element.isLoading"
      ></bbn-dropdown>
      <span v-text="_('rows per page')"></span>
    </span>
  </div>
  <div class="bbn-block">
    <bbn-button v-if="element.saveable"
                :disabled="element.isSaved"
                :title="_('Save current configuration')"
                @click="$emit('save', element.currentConfig)"
                icon="nf nf-fa-save"
    ></bbn-button>
    <bbn-button v-if="element.filterable || element.showable"
                :disabled="!element.isChanged"
                :title="_('Reset to original configuration')"
                @click="element.reset(false)"
                icon="nf nf-fa-undo"
    ></bbn-button>
    <bbn-button v-if="element.showable"
                :title="_('Columns\' picker')"
                @click="element.openColumnsPicker"
                icon="nf nf-fa-columns"
    ></bbn-button>
    <bbn-button v-if="element.filterable && element.multifilter"
                :title="_('Multi Filter')"
                :class="{'bbn-red': element.currentFilters && element.currentFilters.conditions.length ? true : false}"
                @click="element.openMultiFilter"
                icon="nf nf-mdi-filter_variant"
    ></bbn-button>
    <bbn-button v-if="element.isAjax"
                :title="_('Refresh')"
                @click="element.updateData"
                icon="nf nf-fa-refresh"
    ></bbn-button>
  </div>
</div>
</template>
<script>
  module.exports = /**
 * @file bbn-floater component
 *
 * @description bbn-floater is a component that represents a container that can be bound to another element.
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
  Vue.component('bbn-pager', {
    mixins: [bbn.vue.basicComponent],
    props: {
      element: {
        type: Vue,
        default: false
      }
    },
    /**
     * @event mounted
     */
    mounted(){
    },
  });

})(window.Vue, window.bbn);

</script>
<style scoped>
.bbn-pager > .bbn-block {
  height: 100%;
  vertical-align: middle;
}
.bbn-pager > .bbn-block > span {
  display: inline-block;
  height: 100%;
  line-height: 100%;
  vertical-align: middle;
}

</style>
