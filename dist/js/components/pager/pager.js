(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-widget', 'bbn-unselectable']">
  <div class="bbn-block"
			 v-if="element && element.pageable && element.currentData.length"
	>
		<bbn-button icon="nf nf-fa-angle_double_left"
								:notext="true"
								:title="_('Go to the first page')"
								:disabled="element.currentPage == 1"
								@click="element.currentPage = 1"
		></bbn-button>
		<bbn-button icon="nf nf-fa-angle_left"
								:notext="true"
								:title="_('Go to the previous page')"
								:disabled="element.currentPage == 1"
								@click="element.currentPage--"
		></bbn-button>
		<span v-text="_('Page')"></span>
		<span v-if="element.isLoading"
					v-text="element.currentPage"
					class="bbn-iblock bbn-c bbn-narrower bbn-right-sspace"
		></span>
		<bbn-numeric v-else
								 v-model="element.currentPage"
								 :min="1"
								 :max="element.numPages"
								 class="bbn-narrower bbn-right-sspace"
		></bbn-numeric>
		<span v-text="_('of') + ' ' + element.numPages" style="margin-right: 0.25em"></span>
		<bbn-button icon="nf nf-fa-angle_right"
								:notext="true"
								:title="_('Go to the next page')"
								:disabled="element.currentPage == element.numPages"
								@click="element.currentPage++"
		></bbn-button>
		<bbn-button icon="nf nf-fa-angle_double_right"
								:notext="true"
								:title="_('Go to the last page')"
								@click="element.currentPage = element.numPages"
								:disabled="element.currentPage == element.numPages"
		></bbn-button>
		<span class="bbn-hmargin">
			<bbn-dropdown :source="element.limits"
										v-model.number="element.currentLimit"
										@change="element.currentPage = 1"
										:disabled="!!element.isLoading"
										:autosize="true"
			></bbn-dropdown>
			<span v-text="_('rows per page')"></span>
		</span>
	</div>
	<div v-if="element"
			 class="bbn-block"
			 style="float: right"
	>
		<span v-if="element.filteredData.length && element.pageable && element.isAjax"
					v-text="(element.start+1) + '-' + (element.start + element.currentLimit > element.total ? element.total : element.start + element.currentLimit) + ' ' + _('of') + ' ' + element.total"
		></span>
		<span v-else-if="element.filteredData.length && element.pageable && !element.isAjax"
					v-text="(element.start+1) + '-' + (element.start + element.currentLimit > element.filteredData.length ? element.filteredData.length : element.start + element.currentLimit) + ' ' + _('of') + ' ' + element.filteredData.length"
		></span>
		<span v-else
					v-text="element.total ? _('Total') + ': ' + element.total + ' ' + _('items') : _('No item')"
		></span>
		&nbsp;
		<bbn-button v-if="element.currentQuery"
								:title="_('View SQL query')"
								@click="element.showQuery"
								icon="nf nf-mdi-database"
								:notext="true"
		></bbn-button>
		<bbn-button v-if="element.saveable"
								:disabled="element.isSaved"
								:title="_('Save current configuration')"
								@click="element.$emit('save', element.currentConfig)"
								icon="nf nf-fa-save"
								:notext="true"
		></bbn-button>
		<bbn-button v-if="element.filterable || element.showable"
								:disabled="!element.isChanged"
								:title="_('Reset to original configuration')"
								@click="element.reset(false)"
								icon="nf nf-fa-undo"
								:notext="true"
		></bbn-button>
		<bbn-button v-if="element.showable"
								:title="_('Columns\\' picker')"
								@click="element.openColumnsPicker"
								icon="nf nf-fa-columns"
								:notext="true"
		></bbn-button>
		<bbn-button v-if="element.filterable && element.multifilter"
								:title="_('Multi Filter')"
								:class="{'bbn-red': element.currentFilters && element.currentFilters.conditions.length ? true : false}"
								@click="element.openMultiFilter"
								icon="nf nf-mdi-filter_variant"
								:notext="true"
		></bbn-button>
		<bbn-button v-if="element.isAjax"
								:title="_('Refresh')"
								@click="element.updateData"
								icon="nf nf-fa-refresh"
								:notext="true"
		></bbn-button>
	</div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-pager');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/pager/pager.css");
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-pager component
 * @description bbn-pager is a component to manage the pagination of a pageable component.
 * @author BBN Solutions
 * @copyright BBN Solutions
 */
((bbn) =>{
  "use strict";

  Vue.component('bbn-pager', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * The element to bond with
       * @props {Vue} element
       */
      element: {
        type: Vue,
        required: true
      }
    }
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }