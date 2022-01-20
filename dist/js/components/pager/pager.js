(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div v-if="ready && (numPages || extraControls)"
		 :class="[componentClass, 'bbn-widget', 'bbn-unselectable']"
>
  <div :class="{
				 'bbn-block': !isMobile || isTablet,
				 'bbn-w-100': isMobile && !isTablet,
				 'bbn-c': isMobile && !isTablet
			 }"
			 v-if="element && element.pageable"
	>
		<!-- 1ST BUTTON (FIRST) -->
		<bbn-button icon="nf nf-fa-angle_double_left"
								:notext="true"
								:title="_('Go to the first') + ' ' + pageName"
								:disabled="element.currentPage <= 2"
								@click="firstPage"
								v-if="buttons"/>
		<!-- OR 1ST ICON -->
		<span v-else
					class="bbn-iblock bbn-hxspadded bbn-p bbn-pager-mobile-icon"
					@click="firstPage"
		>
			<i :class="[
									'nf nf-fa-angle_double_left',
									'bbn-xl',
									'bbn-pager-mobile-icon',
									{'bbn-invisible': element.currentPage <= 2}
								 ]"/>
		</span>
		<!-- 2ND BUTTON (PREVIOUS) -->
		<bbn-button icon="nf nf-fa-angle_left"
								:notext="true"
								:title="_('Go to the previous') + ' ' + pageName"
								:disabled="element.currentPage == 1"
								@click="prevPage"
								v-if="buttons"/>
		<!-- OR 2ND ICON (PREVIOUS) -->
		<span v-else
					class="bbn-iblock bbn-hxspadded bbn-p bbn-pager-mobile-icon"
					@click="prevPage">
			<i :class="[
									'nf nf-fa-angle_left',
									'bbn-xl',
									'bbn-pager-mobile-icon',
									{'bbn-invisible': element.currentPage == 1}
								 ]"/>
		</span>
		<!-- PAGE + NUMERIC SELECTOR -->
		<span class="bbn-iblock" v-text="pageName"/>
		<bbn-numeric v-if="numericSelector"
								 v-model="currentNumericPage"
								 :min="1"
								 :max="element.numPages"
								 class="bbn-narrower bbn-right-sspace"
								 :disabled="!!element.isLoading"
								 :readonly="element.numPages == 1"/>
		<span v-else
		      class="bbn-iblock bbn-right-xsspace"
					v-text="currentPage"/>
		<!-- OF TOTAL -->
		<span class="bbn-iblock bbn-right-xsspace"
					v-text="_('of') + ' ' + element.numPages"/>
		<!-- 3RD BUTTON (NEXT) -->
		<bbn-button icon="nf nf-fa-angle_right"
								:notext="true"
								:title="_('Go to the next') + ' ' + pageName"
								:disabled="element.currentPage == element.numPages"
								@click="nextPage"
								v-if="buttons"/>
		<!-- OR 3RD ICON (NEXT) -->
		<span v-else
		      class="bbn-iblock bbn-hxspadded bbn-p bbn-pager-mobile-icon">
			<i :class="[
									'nf nf-fa-angle_right',
									'bbn-xl',
									'bbn-pager-mobile-icon',
									{'bbn-invisible': element.currentPage == element.numPages}
								 ]"
				 @click="nextPage"/>
		</span>
		<!-- 4TH BUTTON (LAST) -->
		<bbn-button icon="nf nf-fa-angle_double_right"
								:notext="true"
								:title="_('Go to the last') + ' ' + pageName"
								@click="lastPage"
								:disabled="element.currentPage >= element.numPages - 1"
								v-if="buttons"/>
		<!-- OR 4TH ICON (LAST) -->
		<span v-else
					class="bbn-iblock bbn-hxspadded bbn-p bbn-pager-mobile-icon">
			<i :class="[
									'nf nf-fa-angle_double_right',
									'bbn-xl',
									'bbn-pager-mobile-icon',
									{'bbn-invisible': element.currentPage >= element.numPages - 1}
								 ]"
				 @click="lastPage"
			></i>
		</span>
		<span v-if="!!element.limits &&
								(element.limits.length > 1) &&
								(!isMobile || isTablet) &&
								!!limit"
					class="bbn-hmargin">
			<bbn-dropdown :source="element.limits"
										v-model.number="element.currentLimit"
										@change="element.currentPage = 1"
										:disabled="!!element.isLoading"
										:autosize="true"/>
			<span v-text="itemName + ' ' + _('per') + ' ' + pageName"/>
		</span>
	</div>
	<div v-if="extraControls"
			 :class="{
				 'bbn-block': !isMobile || isTablet,
				 'bbn-flex-width': isMobile && !isTablet,
				 'bbn-top-xsspace': isMobile && !isTablet && element.pageable && element.currentData.length,
				 'bbn-vmiddle': isMobile && !isTablet
			 }"
			 :style="{
				 float: !isMobile || isTablet ? 'right' : 'left',
				 justifyContent: isMobile && !isTablet ? 'flex-end' : ''
			 }">
		<div v-if="element.limits.length &&
							isMobile &&
							!isTablet &&
							element.pageable &&
							element.currentData.length"
				 class="bbn-right-space bbn-flex-fill bbn-vmiddle">
			<bbn-dropdown :source="element.limits"
										v-model.number="element.currentLimit"
										@change="element.currentPage = 1"
										:disabled="!!element.isLoading"
										:autosize="true"/>
		</div>
		<div>
			<span v-if="element.filteredData.length &&
									element.pageable && element.isAjax"
						v-text="(element.start+1) + (element.currentLimit <= 1 ? '' : '-' + (element.start + element.currentLimit > element.total ? element.total : element.start + element.currentLimit)) + ' / ' + element.total"
			></span>
			<span v-else-if="element.filteredData.length &&
											 element.pageable && !element.isAjax"
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
									class="bbn-left-xsspace"/>
			<bbn-button v-if="element.saveable"
									:disabled="element.isSaved"
									:title="_('Save current configuration')"
									@click="element.$emit('save', element.currentConfig)"
									icon="nf nf-fa-save"
									:notext="true"
									class="bbn-left-xsspace"/>
			<bbn-button v-if="(element.filterable || element.showable) && element.reset"
									:disabled="!element.isChanged"
									:title="_('Reset to original configuration')"
									@click="element.reset(false)"
									icon="nf nf-fa-undo"
									:notext="true"
									class="bbn-left-xsspace"/>
			<bbn-button v-if="element.showable && element.openColumnsPicker"
									:title="_('Columns\\' picker')"
									@click="element.openColumnsPicker"
									icon="nf nf-fa-columns"
									:notext="true"
									class="bbn-left-xsspace"/>
			<bbn-button v-if="element.filterable &&
												element.multifilter &&
												element.openMultiFilter"
									:title="_('Multi Filter')"
									:class="[
														'bbn-left-xsspace',
														{'bbn-red': element.currentFilters && element.currentFilters.conditions.length ? true : false}
													]"
									@click="element.openMultiFilter"
									icon="nf nf-mdi-filter_variant"
									:notext="true"/>
			<bbn-button v-if="element.isAjax && element.updateData"
									:title="_('Refresh')"
									@click="element.updateData"
									icon="nf nf-fa-refresh"
									:notext="true"
									class="bbn-left-xsspace"/>
		</div>
	</div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-pager');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/pager/pager.css');
document.head.insertAdjacentElement('beforeend', css);

/**
 * @file bbn-pager component
 * @description bbn-pager is a component to manage the pagination of a pageable component.
 * @author BBN Solutions
 * @copyright BBN Solutions
 */
(bbn =>{
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
      },
      /**
       * The name of the `page` word as used in the pager interface.
       * @prop {String} ['Page'] pageName
       */
      pageName: {
        type: String,
        default: bbn._("page")
      },
      /**
       * The name of the `record` word as used in the pager interface.
       * @prop {String} ['Record(s)'] itemName
       */
      itemName: {
        type: String,
        default: bbn._("records")
      },
      /**
       * The extra controls part on the right.
       * @prop {Boolean} [true] extraControls
       */
      extraControls: {
        type: Boolean,
        default: true
      },
      /**
       * False if you wanto to hide the limit selector
       * @prop {Boolean} [true] limit
       */
      limit: {
        type: Boolean,
        default: true
      },
      /**
       * Shows the bbn-numeric field for selecting the page
       * @prop {Boolean} [true] numericSelector
       */
       numericSelector: {
        type: Boolean,
        default: true
      }
    },
    data(){
      return {
        numericTimeout: false,
        currentNumericPage: this.element.currentPage,
        numPages: this.element.numPages
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
      updatePager() {
        bbn.fn.log('update pager');
        this.currentNumericPage = this.element.currentPage;
        this.numPages = this.element.numPages;
        bbn.fn.log('update pager', this.numPages);
      },
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

        this.element.$on('dataloaded', this.updatePager);
      }
    },
    beforeDestroy() {
      this.element.$off('dataloaded');
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

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}