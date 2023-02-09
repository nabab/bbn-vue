((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, {'bbn-overlay': !!scrollable}]">
  <component :is="scrollable ? 'bbn-scroll' : 'div'"
             axis="x"
             ref="scroll">
    <div :class="['bbn-collapsable-columns-container', 'bbn-grid', 'bbn-padded', {'bbn-h-100': !!scrollable}]"
         :style="{'grid-auto-rows': !!scrollable ? '100%': ''}">
      <bbn-column-list  v-for="(col, idx) in filteredData"
                        :source="col.data[children]"
                        :data="data"
                        :children="children"
                        :index="col.index"
                        :key="symbol()"
                        :pageable="pageable"
                        :filterable="childrenFilterable"
                        :filters="typeof childrenFilters === 'function' ? childrenFilters(col.data, data, idx) : childrenFilters"
                        :sortable="childrenSortable"
                        :order="childrenOrder"
                        :limit="childrenLimit"
                        :collapsable="true"
                        :auto-collapse="collapseEmpty"
                        :width="columnWidth"
                        :scrollable="scrollable"
                        :background-color="col.data[sourceBackgroundColor]"
                        :font-color="col.data[sourceFontColor]"
                        :title="col.data.title"
                        :toolbar="!!col.data[sourceToolbar] ? col.data[sourceToolbar] : toolbar"
                        :toolbar-source="col.data"
                        :component="!!col.data[sourceComponent] ? col.data[sourceComponent] : realComponent"
                        :component-options="!!col.data[sourceComponentOptions] ? col.data[sourceComponentOptions] : componentOptions"
                        @beforemount="c => columns.push(c)"
                        @beforedestroy="removeColumn"
                        @expanded="c => $emit('expanded', c)"
                        @collapse="c => $emit('collapsed', c)"
                        :uid="uid"
                        :start-hidden="true"/>
    </div>
  </component>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-collapsable-columns');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

/**
 * @file bbn-collapsable-columns component
 * @description The bbn-collapsable-columns.
 * @copyright BBN Solutions
 * @author Mirko Argentino
 * @created 11/10/2022
 */

 (bbn => {
  "use strict";
  Vue.component('bbn-collapsable-columns', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent
    ],
    props: {
      /**
       * The component to use for the toolbar
       * @prop {String|Object|Vue} toolbar
       */
      toolbar: {
        type: [String, Object, Vue]
      },
      /**
       * The name of the property used to specify the color to use as the background
       * @prop {String} ['backgroundColor'] sourceBackgroundColor
       */
      sourceBackgroundColor: {
        type: String,
        default: 'backgroundColor'
      },
      /**
       * The name of the property used to specify the color to use for the font
       * @prop {String} ['fontColor'] sourceFontColor
       */
      sourceFontColor: {
        type: String,
        default: 'fontColor'
      },
      /**
       * The name of the property used to specify the component for the toolbar
       * @prop {String} ['toolbar'] sourceToolbar
       */
      sourceToolbar: {
        type: String,
        default: 'toolbar'
      },
      /**
       * The name of the property used to specify the item component
       * @prop {String} ['component'] sourceComponent
       */
      sourceComponent: {
        type: String,
        default: 'component'
      },
      /**
       * Defines the behaviour of the columns about the scroll.
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * The column's width
       * @prop {Number|String} ['40rem'] columnWidth
       */
      columnWidth: {
        type: [Number, String],
        default: '40rem'
      },
      /**
       * Set to true allows the columns children to be filtered.
       * @prop {Boolean} [false] childrenFilterable
       */
      childrenFilterable: {
        type: Boolean,
        default: false
      },
      /**
       * Defines the filters of the columns' children.
       * @prop {Object} [{logic: 'AND',conditions: []}] filters
       */
      childrenFilters: {
        type: [Object, Function],
        default(){
          return {
            logic: 'AND',
            conditions: []
          };
        }
      },
      /**
       * Set to true allows columns' children to be sortable.
       * @prop {Boolean} [false] childrenSortable
       */
      childrenSortable: {
        type: Boolean,
        default: false
      },
      /**
       * Defines the order of the columns' children.
       * @prop {Array|Object} [[]] ChildrenOrder
       */
      childrenOrder: {
        type: [Array, Object],
        default(){
          return [];
        }
      },
      /**
       * On first dataloaded event collapse empty columns
       * @prop {Boolean} [true] collapseEmpty
       */
      collapseEmpty: {
        type: Boolean,
        default: true
      },
      /**
       * The options for the component
       * @prop {Object} componentOptions
       */
      componentOptions: {
        type: Object
      },
      /**
       * The name of the property used to specify the component's options of the item
       * @prop {String} ['componentOptions'] sourceComponentOptions
       */
      sourceComponentOptions: {
        type: String,
        default: 'componentOptions'
      },
      /**
       * The limit of rows to be shown in a page of the list.
       * @prop {Number} [0] limit
       */
      limit: {
        type: Number,
        default: 0
      },
      /**
       * The limit of rows to be shown in a page of the children list.
       * @prop {Number} [10] limit
       */
      childrenLimit: {
        type: Number,
        default: 10
      }
    },
    data(){
      return {
        /**
         * @data {Array} [[]] columns
         */
        columns: []
      }
    },
    methods: {
      /**
       * Alias of Symbol
       * @method symbol
       */
      symbol: Symbol,
      /**
       * Normalizes the data
       * @method _map
       * @param {Array} data
       * @return {Array}
       */
      _map(data) {
        if (bbn.fn.isArray(data)) {
          if (data.length
            && !bbn.fn.isObject(data[0])
            && !bbn.fn.isArray(data[0])
            && this.sourceValue
            && this.sourceText
          ) {
            data = data.map(a => {
              return {
                [this.sourceValue]: a,
                [this.sourceText]: a
              };
            });
          }
          data = data.map(a => {
            a.opened = false;
            return a;
          });

          return (this.map ? data.map(this.map) : data).slice();
        }
        return [];
      },
      /**
       * Collapses all columns
       * @method collapseAll
       */
      collapseAll(){
        bbn.fn.each(this.columns, c => {
          c.collapse();
        });
      },
      /**
       * Expands all columns
       * @method expandAll
       */
      expandAll(){
        bbn.fn.each(this.columns, c => {
          c.expand();
        });
      },
      /**
       * Fires setCheckCollapse method on every columns
       * @method setAllCheckCollapse
       */
      setAllCheckCollapse(){
        bbn.fn.each(this.columns, c => c.setCheckCollapse(true));
      },
      /**
       * Removes a column form the columns list
       * @method removeColumn
       * @param {Object} column
       */
      removeColumn(column){
        if (this.columns.length && column.bbnUid) {
          let idx = bbn.fn.search(this.columns, 'bbnUid', column.bbnUid);
          if (idx > -1) {
            this.columns.splice(idx, 1);
          }
        }
      }
    }
  });
})(bbn);

})(bbn);