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
      limit: {
        type: Number,
        default: 0
      },
      childrenLimit: {
        type: Number,
        default: 10
      }
    },
    data(){
      return {
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