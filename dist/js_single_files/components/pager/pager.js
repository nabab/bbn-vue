((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div v-if="ready"
		 :class="[componentClass, 'bbn-widget', 'bbn-unselectable']"
>
  <div :class="{
				 'bbn-block': !isMobile || isTablet,
				 'bbn-w-100': isMobile && !isTablet,
				 'bbn-c': isMobile && !isTablet
			 }"
			 v-if="element && element.pageable"
	>
		<bbn-button icon="nf nf-fa-angle_double_left"
								:notext="true"
								:title="_('Go to the first page')"
								:disabled="element.currentPage == 1"
								@click="firstPage"
								v-if="buttons"
		></bbn-button>
		<span v-else
					class="bbn-iblock bbn-right-xsspace bbn-pager-mobile-icon"
		>
			<i :class="['nf nf-fa-angle_double_left', 'bbn-xl', 'bbn-pager-mobile-icon', {
						'bbn-disabled': element.currentPage == 1
					}]"
				 @click="firstPage"
			></i>
		</span>
		<bbn-button icon="nf nf-fa-angle_left"
								:notext="true"
								:title="_('Go to the previous page')"
								:disabled="element.currentPage == 1"
								@click="prevPage"
								v-if="buttons"
		></bbn-button>
		<span v-else
					class="bbn-iblock bbn-right-xsspace bbn-pager-mobile-icon"
		>
			<i :class="['nf nf-fa-angle_left', 'bbn-xl', 'bbn-pager-mobile-icon', {
				   'bbn-disabled': element.currentPage == 1
				 }]"
				 @click="prevPage"
			></i>
		</span>
		<span class="bbn-iblock" v-text="_('Page')"></span>
		<bbn-numeric v-model="currentNumericPage"
								 :min="1"
								 :max="element.numPages"
								 class="bbn-narrower bbn-right-sspace"
								 :disabled="!!element.isLoading"
								 :readonly="element.numPages == 1"
		></bbn-numeric>
		<span class="bbn-iblock bbn-right-xsspace"
					v-text="_('of') + ' ' + element.numPages"
		></span>
		<bbn-button icon="nf nf-fa-angle_right"
								:notext="true"
								:title="_('Go to the next page')"
								:disabled="element.currentPage == element.numPages"
								@click="nextPage"
								v-if="buttons"
		></bbn-button>
		<span v-else
					class="bbn-iblock bbn-right-xsspace bbn-pager-mobile-icon"
		>
			<i :class="['nf nf-fa-angle_right', 'bbn-xl', 'bbn-pager-mobile-icon', {
				   'bbn-disabled': element.currentPage == element.numPages
				 }]"
				 @click="nextPage"
			></i>
		</span>
		<bbn-button icon="nf nf-fa-angle_double_right"
								:notext="true"
								:title="_('Go to the last page')"
								@click="lastPage"
								:disabled="element.currentPage == element.numPages"
								v-if="buttons"
		></bbn-button>
		<span v-else
					class="bbn-iblock bbn-pager-mobile-icon"
		>
			<i :class="['nf nf-fa-angle_double_right', 'bbn-xl', 'bbn-pager-mobile-icon', {
				   'bbn-disabled': element.currentPage == element.numPages
				 }]"
				 @click="lastPage"
			></i>
		</span>
		<span v-if="!isMobile || isTablet" class="bbn-hmargin">
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
			 :class="{
				 'bbn-block': !isMobile || isTablet,
				 'bbn-flex-width': isMobile && !isTablet,
				 'bbn-top-xsspace': isMobile && !isTablet && element.pageable && element.currentData.length,
				 'bbn-vmiddle': isMobile && !isTablet
			 }"
			 :style="{
				 float: !isMobile || isTablet ? 'right' : 'left',
				 justifyContent: isMobile && !isTablet ? 'flex-end' : ''
			 }"
	>
		<div v-if="isMobile && !isTablet && element.pageable && element.currentData.length"
				 class="bbn-right-space bbn-flex-fill bbn-vmiddle"
		>
			<bbn-dropdown :source="element.limits"
										v-model.number="element.currentLimit"
										@change="element.currentPage = 1"
										:disabled="!!element.isLoading"
										:autosize="true"
			></bbn-dropdown>
		</div>
		<div>
			<span v-if="element.filteredData.length && element.pageable && element.isAjax"
						v-text="(element.start+1) + '-' + (element.start + element.currentLimit > element.total ? element.total : element.start + element.currentLimit) + ' ' + _('of') + ' ' + element.total"
			></span>
			<span v-else-if="element.filteredData.length && element.pageable && !element.isAjax"
						v-text="(element.start+1) + '-' + (element.start + element.currentLimit > element.filteredData.length ? element.filteredData.length : element.start + element.currentLimit) + ' ' + _('of') + ' ' + element.filteredData.length"
			></span>
			<span v-else-if="!isMobile || isTablet"
						v-text="element.total ? _('Total') + ': ' + element.total + ' ' + _('items') : _('No item')"
			></span>
			<span v-else>
				<i class="nf nf-fa-hashtag bbn-m bbn-right-sspace"></i><span v-text="element.total"></span>
			</span>
			&nbsp;
			<bbn-button v-if="element.currentQuery && element.showQuery"
									:title="_('View SQL query')"
									@click="element.showQuery"
									icon="nf nf-mdi-database"
									:notext="true"
									class="bbn-left-xsspace"
			></bbn-button>
			<bbn-button v-if="element.saveable"
									:disabled="element.isSaved"
									:title="_('Save current configuration')"
									@click="element.$emit('save', element.currentConfig)"
									icon="nf nf-fa-save"
									:notext="true"
									class="bbn-left-xsspace"
			></bbn-button>
			<bbn-button v-if="(element.filterable || element.showable) && element.reset"
									:disabled="!element.isChanged"
									:title="_('Reset to original configuration')"
									@click="element.reset(false)"
									icon="nf nf-fa-undo"
									:notext="true"
									class="bbn-left-xsspace"
			></bbn-button>
			<bbn-button v-if="element.showable && element.openColumnsPicker"
									:title="_('Columns\\' picker')"
									@click="element.openColumnsPicker"
									icon="nf nf-fa-columns"
									:notext="true"
									class="bbn-left-xsspace"
			></bbn-button>
			<bbn-button v-if="element.filterable && element.multifilter && element.openMultiFilter"
									:title="_('Multi Filter')"
									:class="['bbn-left-xsspace', {'bbn-red': element.currentFilters && element.currentFilters.conditions.length ? true : false}]"
									@click="element.openMultiFilter"
									icon="nf nf-mdi-filter_variant"
									:notext="true"
			></bbn-button>
			<bbn-button v-if="element.isAjax && element.updateData"
									:title="_('Refresh')"
									@click="element.updateData"
									icon="nf nf-fa-refresh"
									:notext="true"
									class="bbn-left-xsspace"
			></bbn-button>
		</div>
	</div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-pager');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
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
      },
      /**
       * False if you wanto to see the arrows instead of the buttons
       * @prop {Boolean} [true] buttons
       */
      buttons: {
        type: Boolean,
        default: true
      },
      /**
       * Force to render as mobile
       * @prop {Boolean} [false] forceMobile
       */
      forceMobile: {
        type: Boolean,
        default: false
      },
      /**
       * Force to render as tablet
       * @prop {Boolean} [false] forceTablet
       */
      forceTablet: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        currentNumericPage: this.element.currentPage,
        numericTimeout: false
      }
    },
    computed: {
      currentPage: {
        get(){
          return this.element.currentPage;
        },
        set(v) {
          this.element.currentPage = v;
        }
      }

    },
    methods: {
      /**
       * @method firstPage
       */
      firstPage(){
        if (this.element
          && ('currentPage' in this.element)
          && (this.element.currentPage !== 1)
        ){
          this.element.currentPage = 1;
        }
      },
      /**
       * @method nextPage
       */
      nextPage(){
        if (this.element
          && ('currentPage' in this.element)
          && ('numPages' in this.element)
          && (this.element.currentPage < this.element.numPages)
        ){
          this.element.currentPage++;
        }
      },
      /**
       * @method prevPage
       */
      prevPage(){
        if (this.element
          && ('currentPage' in this.element)
          && (this.element.currentPage > 1)
        ){
          this.element.currentPage--;
        }
      },
      /**
       * @method lastPage
       */
      lastPage(){
        if (this.element
          && ('currentPage' in this.element)
          && ('numPages' in this.element)
          && (this.element.currentPage !== this.element.numPages)
        ){
          this.element.currentPage = this.element.numPages;
        }
      }
    },
    /**
     * @event created
     */
    created(){
      if (this.forceMobile){
        this.isMobile = true;
      }
      if (this.forceTablet){
        this.isTablet = true;
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      if (this.element){
        if (this.element.ready && !this.ready){
          this.ready = true;
        }
        else {
          this.element.$on('ready', () => {
            this.ready = true;
          })
        }
      }
    },
    watch: {
      currentPage(v) {
        if (this.currentNumericPage !== v) {
          this.currentNumericPage = v;
        }
      },
      currentNumericPage(v){
        if (this.numericTimeout) {
          clearTimeout(this.numericTimeout);
        }
        this.numericTimeout = setTimeout(() => {
          if (this.currentPage !== v) {
            this.currentPage = v;
          }
        }, 500);
      }
    }
  });

})(bbn);


})(bbn);