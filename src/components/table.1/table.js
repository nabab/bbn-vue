/**
 * @file Table component
 */
(function ($, bbn) {
  "use strict";
  const METHODS4BUTTONS = ['insert', 'select', 'edit', 'add', 'copy', 'delete'];

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-table', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.dataEditorComponent
     * @mixin bbn.vue.localStorageComponent
     * @mixin bbn.vue.observerCompone
     * @mixin bbn.vue.keepCoolComponent
     * @mixin bbn.vue.dataComponent
     * @mixin bbn.vue.sourceArrayComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.resizerComponent,
      bbn.vue.sourceArrayComponent,
      bbn.vue.dataEditorComponent,
      bbn.vue.localStorageComponent,
      bbn.vue.observerComponent,
      bbn.vue.keepCoolComponent,
      bbn.vue.dataComponent
    ],
    props: {
      /**
       * If the property 'group' is given to one or more columns in the table (ex: group="test"), it defines the title of a group of columns. (ex: titleGroups="[{value: 'test', text: 'My group'}]").
       * @prop {Array|Function}
       */
      titleGroups: {
        type: [Array, Function]
      },
      /**
       * The object popup of the table.
       * @prop {Object} Vue
       */
      popup: {
        type: Vue
      },
      /**
       * Defines the behaviour of the table about the scroll.
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true allows the table to be resizable.
       * @prop {Boolean} [false] resizable
       */
      resizable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true shows a button at the bottom right of the table that opens a column picker for the table.
       * @prop {Boolean} [false] showable
       */
      showable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true shows a save icon that allows to save the current configuration of the table at the bottom right of the table. 
       * @prop {Boolean} [false] saveable
       */
      saveable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true allows the table to be groupable according to the props groupBy.
       * @prop {Boolean} [false] groupable
       */
      groupable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true allows to edit inline table's fields if no buttons are defined for the table. Allowed values 'inline','nobuttons'.
       * @prop {Boolean|String|Function} editable
       */
      editable: {
        type: [Boolean, String, Function]
      },
      /**
       * In case of Ajax table, set to true will make an Ajax call to group the table by a field.
       * @prop {Boolean} [true] serverGrouping
       */
      serverGrouping: {
        type: Boolean,
        default: true
      },
      /**
       * Set to false will make an Ajax call for the grouping.
       * @prop {Boolean} [true] localGrouping
       */
      localGrouping: {
        type: Boolean,
        default: true
      },
      /**
       * Defines the minimum columns width.
       * @prop {Number} [30] minimumColumnWidth
       */
      minimumColumnWidth: {
        type: Number,
        default: 30
      },
      /**
       * Defines the default columns width.
       * @prop {Number} [150]
       */
      defaultColumnWidth: {
        type: Number,
        default: 150
      },
      /**
       * @todo not used in the component
       */
      paginationType: {
        type: String,
        default: 'input'
      },
      /**
       * @todo not used in the component
       */
      info: {
        type: Boolean,
        default: false
      },
      /**
       * @todo not used in the component
       */
      search: {
        type: Boolean,
        default: false
      },
      /**
       * If defined, the form created for the edit of the table will have this URL as action.
       * @prop {String} url
       */
      url: {
        type: String
      },
      /**
       * A function to define css class(es) for the rows.
       * @prop {Function} trClass
       * @todo doesn't work if a string is given
       */
      trClass: {
        type: [String, Function]
      },
      /**
       * Defines the message to show in the confirm when an action is made on the row.
       * @prop {String|Function|Boolean} confirmMessage
       */
      confirmMessage: {
        type: [String, Function, Boolean],
        default: bbn._('Are you sure you want to delete this row?')
      },
      /**
       * Defines the expander of the table.
       */
      expander: {

      },
      /**
       * not used in the component
       */
      loader: {
        type: Boolean,
        default: false
      },
      /**
       * Defines the editor to use when the edit button of a row is clicked.
       * @prop {String|Object} editor
       */
      editor: {
        type: [String, Object]
      },
      /**
       * If one or more columns have the property fixed set to true it defines the side of the fixed column(s).
       * @prop {String} [left] fixedDefaultSide
       */
      fixedDefaultSide: {
        type: String,
        default: "left"
      },
      /**
       * Defines the toolbar of the table.
       * @prop {Object|String|Function} toolbar
       */
      toolbar: {

      },
      /**
       * An array of objects with at least the property 'field' that can replace the html '<bbns-column></bbns-column>' or extend them.
       * @prop {Array} [] columns
       */
      columns: {
        type: Array,
        default: function () {
          return [];
        }
      },
      /**
       * The index of the property to group by the table referred to the object of data of the row. 
       * @prop {Number} groupBy
       */
      groupBy: {
        type: Number
      },
      /**
       * @todo desc
       * @prop {Array|Function} expandedValues
       * 
       */
      expandedValues: {
        type: [Array, Function]
      },
      /**
       * In a grouped table, if set to true defines that all rows will be expanded. If an array is given defines which row(s) of the table will be expanded.
       * @prop {Boolean|Array} [] expanded
       */
      expanded: {
        type: [Boolean, Array],
        default () {
          return [];
        }
      },
      /**
       * Defines the footer of the table.
       * @prop {String|Object} footer
       */
      footer: {
        type: [String, Object]
      },
      /**
       * Defines the footer for a group of columns.
       * @prop {String|Object} groupFooter
       */
      groupFooter: {
        type: [String, Object]
      },
      /**
       * @todo desc
       * @prop {Object} [{tot: bbn._('Total'),med: bbn._('Average'),num: bbn._('Count'),max: bbn._('Maximum'),min: bbn._('Minimum')}] aggregateExp
       */
      aggregateExp: {
        type: Object,
        default () {
          return {
            tot: bbn._('Total'),
            med: bbn._('Average'),
            num: bbn._('Count'),
            max: bbn._('Maximum'),
            min: bbn._('Minimum'),
          };
        }
      },
      /**
       * @todo desc
       * @prop {Object} loadedConfig
       */
      loadedConfig: {
        type: Object
      }
    },
    data() {
      let editable = bbn.fn.isFunction(this.editable) ? this.editable() : this.editable;
      return {
        /**
         * @data {Boolean} [false] _observerReceived
         */
        _observerReceived: false,
        /**
         * @data {Object} [[{name: 'left',width: 0,visible: 0,cols: []},{name: 'main',width: 0,visible: 0,cols: []},{name: 'right',width: 0,visible: 0,cols: []}]] groupCols
         */
        groupCols: [{
            name: 'left',
            width: 0,
            visible: 0,
            cols: []
          },
          {
            name: 'main',
            width: 0,
            visible: 0,
            cols: []
          },
          {
            name: 'right',
            width: 0,
            visible: 0,
            cols: []
          }
        ],
        /**
         * @data {Boolean} [false] initReady
         */
        initReady: false,
        /**
         * @data {Object} [{}] currentConfig
         */
        currentConfig: {},
        /**
         * @data {Boolean} [false] savedConfig
         */
        savedConfig: false,
        /**
         * @data {Object} [] defaultConfig
         */
        defaultConfig: this.loadedConfig ? this.loadedConfig : {
          filters: this.filters,
          limit: this.limit,
          order: this.order,
          hidden: this.hidden || null,
        },
        /**
         * @data {Boolean} [false] editedFilter
         */
        editedFilter: false,
        /**
         * @data {Number} [0] floatingFilterX
         */
        floatingFilterX: 0,
        /**
         * @data {Number} [0] floatingFilterY
         */
        floatingFilterY: 0,
        /**
         * @data {Number} [0] floatingFilterTimeOut
         */
        floatingFilterTimeOut: 0,
        /**
         * @data {Array} currentHidden
         */
        currentHidden: this.hidden || [],
        /**
         * @data {} [null] originalData
         */
        originalData: null,
        /**
         * @data {Boolean|Number} [false] group
         */
        group: this.groupBy === undefined ? false : this.groupBy,
        /**
         * @data {Array} {[10, 25, 50, 100, 250, 500]} limits
         */
        limits: [10, 25, 50, 100, 250, 500],
        /**
         * @data {String} editMode 
         */
        editMode: editable === true ? (this.editor ? 'popup' : 'inline') : (editable === 'popup' ? 'popup' : 'inline'),
        /**
         * @data {Boolean|Object} [false] tmpRow
         */
        tmpRow: false,
        /**
         * @data {Boolean|Object} [false] originalRow
         */
        originalRow: false,
        /**
         * @data {Boolean|Object} [false] editedRow
         */
        editedRow: false,
        /**
         * @data {Boolean|Number} [false] editedIndex
         */
        editedIndex: false,
        /**
         * @data {Array} cols
         */
        cols: [],
        /**
         * @data {Boolean} [false] table
         */
        table: false,
        /**
         * @data {Boolean} [false] colButtons
         */
        colButtons: false,
        /**
         * @data {} [null] scrollableContainer
         */
        scrollableContainer: null,
        /**
         * @data {Boolean} [true] hiddenScroll
         */
        hiddenScroll: true,
        /**
         * @data {Array} [] popups
         */
        popups: [],
        /**
         * @data {Boolean} [false] isAggregated
         */
        isAggregated: false,
        /**
         * @data {Boolean} [false] currentOverTr
         */
        currentOverTr: false,
        /**
         * @data {Boolean} [false] updaterTimeout
         */
        updaterTimeout: false,
        /**
         * @data {Boolean} allExpanded
         */
        allExpanded: this.expanded === true ? true : false,
        /**
         * @data {Boolean} [false] groupInit
         */
        groupInit: false,
        /**
         * @data {Array} currentExpanded
         */
        currentExpanded: Array.isArray(this.expanded) ? this.expanded : [],
        /**
         * @data {Array} currentExpandedValues
         */
        currentExpandedValues: Array.isArray(this.expandedValues) ? this.expandedValues : [],
        /**
         * @data {Boolean} [false] focusedRow
         */
        focusedRow: false,
        /**
         * @data {} [null] viewport
         */
        viewport: null,
        /**
         * @data {Array} viewportRows
         */
        viewportRows: [...Array(25).keys()],
        /**
         * @data {Array} viewportCols
         */
        viewportCols: [],
        /**
         * @data {Number} [0] viewportUpdater
         */
        viewportUpdater: 0,
        /**
         * @data {} [null] rowIndexTimeOut
         */
        rowIndexTimeOut: null
      };
    },
    computed: {
      /**
       * Return true if the table isn't ajax, is editable and the edit mode is 'inline'.
       * @computed isBatch
       * @return {Boolean}
       */
      isBatch() {
        return this.editable && (this.editMode === 'inline') && !this.isAjax
      },
      /**
       * Return true if the table has the prop toolbar defined.
       * @computed hasToolbar
       * @return {Boolean}
       */
      hasToolbar() {
        return this.toolbarButtons.length || (typeof this.toolbar === 'function') || (typeof this.toolbar === 'object');
      },
      /**
       * If the computed isBatch is true, return an array of modified rows.
       * @computed modifiedRows
       * @return {Array}
       */
      modifiedRows() {
        let res = [];
        if (this.isBatch) {
          $.each(this.currentData, (i, d) => {
            if (JSON.stringify(d) !== JSON.stringify(this.originalData[i])) {
              res.push(d);
            }
          })
        }
        return res;
      },
      /**
       * Return an array of shown fields excluding the hidden ones.
       * @computed shownFields
       * @return {Array}
       */
      shownFields() {
        let r = [];
        bbn.fn.each(this.cols, (a) => {
          if (a.field && !a.hidden) {
            r.push(a.field);
          }
        });
        return r;
      },
      /**
       * Return the json string of currentConfig.
       * @computed jsonConfig
       * @return {String}
       */
      jsonConfig() {
        return JSON.stringify(this.currentConfig);
      },
      /**
       * Return true if the saved config is identic to the jsonConfig.
       * @computed isSaved
       * @return {Boolean}
       */
      isSaved() {
        return this.jsonConfig === this.savedConfig;
      },
      /**
       * Return true if the json string of currentConfig is different from initialConfig
       * @computed isChanged
       * @return {Boolean}
       */
      isChanged() {
        return JSON.stringify(this.currentConfig) !== this.initialConfig;
      },
      /**
       * Return an array with the object(s) button for the toolbar.
       * @computed toolbarButtons
       * @return {Array}
       */
      toolbarButtons() {
        let r = [],
          ar = [];
        if (this.toolbar) {
          ar = bbn.fn.isFunction(this.toolbar) ?
            this.toolbar() : (
              Array.isArray(this.toolbar) ? this.toolbar.slice() : []
            );
          if (!Array.isArray(ar)) {
            ar = [];
          }
          $.each(ar, (i, a) => {
            let o = bbn.fn.clone( a);
            if (o.command) {
              o.command = () => {
                this._execCommand(a);
              }
            }
            r.push(o);
          });
        }
        return r;
      },
      /**
       * Return false if a required field of a column is missing.
       * @computed isEditedValid
       * @return {Boolean}
       */
      isEditedValid() {
        let ok = true;
        if (this.tmpRow) {
          $.each(this.columns, (i, a) => {
            if (a.field && a.required && !this.tmpRow[a.field]) {
              ok = false;
              return false;
            }
          })
        }
        return ok;
      },
      /**
       * Return the number of visible columns of the table.
       * @computed numVisible
       * @return {number}
       */
      numVisible() {
        return this.cols.length - bbn.fn.count(this.cols, {
          hidden: true
        }) + (this.hasExpander ? 1 : 0) + (this.selection ? 1 : 0);
      },
      /**
       * Return the object scroller.
       * @computed scroller
       * @return {Object}
       */
      scroller() {
        return this.$refs.scroller instanceof Vue ? this.$refs.scroller : null;
      },
      /**
       * Return an array of objects containing the data of the row and other information about the current view of the table.
       * @computed currentSet
       * @fires _checkConditionsOnValue
       * @fires expandedValues
       * @fires _updateViewport
       * @fires isExpanded
       * @return {Array}
       */
      currentSet() {
        if (!this.cols.length) {
          return [];
        }
        // The final result
        /**
         *
         * @type {Array}
         */
        let res = [],
          isGroup = this.groupable && (this.group !== false) && this.cols[this.group] && this.cols[this.group].field,
          groupField = isGroup ? this.cols[this.group].field : false,
          // The group value will change each time a row has a different value on the group's column
          currentGroupValue,
          /* @todo Not sure of what it does ! */
          currentLink,
          // the data is put in a new array with its original index
          o,
          rowIndex = 0,
          end = this.pageable ? this.currentLimit : this.currentData.length,
          aggregates = {
            tot: 0,
            num: 0,
            min: false,
            max: false,
            groups: []
          },
          aggregateModes = [],
          i = 0,
          data = this.filteredData.slice().map((item, index) => {
            return {
              index: index,
              data: item
            }
          });
        // Aggregated
        if (this.isAggregated) {
          let idx = bbn.fn.search(this.cols, {
            field: this.isAggregated
          });
          if (idx > -1) {
            aggregateModes = this.cols[idx].aggregate;
          }
        }
        // Paging locally
        if (this.pageable && (!this.isAjax || !this.serverPaging)) {
          i = this.start;
          end = this.start + this.currentLimit > data.length ? data.length : this.start + this.currentLimit;
        }
        // Grouping (and sorting) locally
        let pos;
        if (
          isGroup &&
          ((this.isAjax && this.serverGrouping) || (!this.isAjax && this.localGrouping)) &&
          ((pos = bbn.fn.search(this.currentOrder, {
            field: this.cols[this.group].field
          })) !== 0)
        ) {
          // First ordering the data
          let orders = [{
            field: this.cols[this.group].field,
            dir: (pos > 0 ? this.currentOrder[pos].dir : 'asc')
          }];
          if (this.sortable && this.currentOrder.length) {
            orders = orders.concat(JSON.parse(JSON.stringify(this.currentOrder)))
          }
          data = bbn.fn.multiorder(data, orders.map((item) => {
            item.field = 'data.' + item.field;
            return item;
          }));
        }
        // Sorting locally
        else if (this.sortable && this.currentOrder.length && (!this.serverSorting || !this.isAjax)) {
          // If there is a source, we sort based on the text (not the value), so we replace temporary the values
          // with the text + a boundary + the value just the time of sorting
          if (bbn.fn.count(this.cols, {
              source: undefined
            }, '!==')) {
            /** @var will contain the original value of the column to reset it once the array is sorted */
            let tmpData = {};
            bbn.fn.each(this.cols, function (col) {
              if (col.source && col.field) {
                tmpData[col.field] = {};
                bbn.fn.each(data, function (d) {
                  tmpData[col.field][d.index] = d.data[col.field];
                  d.data[col.field] = d.data[col.field] ? bbn.fn.get_field(col.source, col.sourceValue ? col.sourceValue : 'value', d.data[col.field], col.sourceText ? col.sourceText : 'text') || '' : '';
                })
              }
            });
            data = bbn.fn.multiorder(data, JSON.parse(JSON.stringify(this.currentOrder)).map((item) => {
              item.field = 'data.' + item.field;
              return item;
            }));
            bbn.fn.each(this.cols, (col) => {
              if (col.source && col.field) {
                bbn.fn.each(data, (d, i) => {
                  d.data[col.field] = tmpData[col.field][d.index];
                })
              }
            });
          } else {
            data = bbn.fn.multiorder(data, JSON.parse(JSON.stringify(this.currentOrder)).map((item) => {
              item.field = 'data.' + item.field;
              return item;
            }));
          }
        }

        // A new row being edited
        if (this.tmpRow) {
          res.push({
            index: -1,
            rowIndex: 0,
            data: this.tmpRow,
            selected: false,
            expander: !!this.expander
          });
          this.editedIndex = -1;
          rowIndex++;
        }


        // If there's a group that will be the row index of its 1st value (where the expander is)
        let currentGroupIndex = -1,
          currentGroupRow = -1,
          isExpanded = false,
          groupNumCheckboxes = 0,
          groupNumChecked = 0,
          lastInGroup = false;
        while (data[i] && (i < end)) {
          let a = data[i].data;
          lastInGroup = isGroup && (!data[i + 1] || (data[i + 1].data[groupField] !== currentGroupValue));
          if (isGroup && (currentGroupValue !== a[groupField])) {
            groupNumCheckboxes = 0;
            if (!a[groupField]) {
              currentGroupValue = null;
              currentGroupIndex = -1;
              isExpanded = true;
            } else {
              isExpanded = false;
              currentGroupValue = a[groupField];
              currentGroupIndex = data.index;
              currentGroupRow = res.length;
              let tmp = {
                group: true,
                index: data[i].index,
                value: currentGroupValue,
                data: a,
                rowIndex: rowIndex,
                expander: true,
                num: bbn.fn.count(data, 'data.' + this.cols[this.group].field, currentGroupValue)
              };
              // Expanded is true: all is opened
              if (this.allExpanded) {
                isExpanded = true;
                if (this.currentExpandedValues.indexOf(currentGroupValue) === -1) {
                  this.currentExpandedValues.push(currentGroupValue);
                }
              }
              // expandedValues is a function, which will be executed on each value
              else if (bbn.fn.isFunction(this.expandedValues)) {
                if (
                  this.expandedValues(currentGroupValue) &&
                  (this.currentExpandedValues.indexOf(currentGroupValue) === -1)
                ) {
                  isExpanded = true;
                }
              }
              // The current group value should be opened
              else if (this.currentExpandedValues.indexOf(currentGroupValue) > -1) {
                isExpanded = true;
              }

              if (!isExpanded && data[i - 1] && (currentGroupValue === data[i - 1].data[groupField])) {
                if (res.length) {
                  res.push(tmp);
                }
              } else {
                tmp.expanded = isExpanded;
                res.push(tmp);
                currentLink = i;
                rowIndex++;
              }
            }
          } else if (this.expander) {
            let exp = bbn.fn.isFunction(this.expander) ? this.expander(data[i], i) : this.expander;
            isExpanded = exp ? this.currentExpanded.indexOf(data[i].index) > -1 : false;
          }
          if (!isGroup || isExpanded || !currentGroupValue) {
            o = {
              index: data[i].index,
              data: a,
              rowIndex: rowIndex
            };
            if (isGroup) {
              if (!currentGroupValue) {
                o.expanded = true;
              } else {
                o.isGrouped = true;
                o.link = currentLink;
              }
            } else if (this.expander && (
                !bbn.fn.isFunction(this.expander) ||
                (bbn.fn.isFunction(this.expander) && this.expander(a))
              )) {
              o.expander = true;
            }
            if (this.selection && (!bbn.fn.isFunction(this.selection) || this.selection(o))) {
              o.selected = this.selectedRows.indexOf(data[i].index) > -1;
              o.selection = true;
              groupNumCheckboxes++;
              if (o.selected) {
                groupNumChecked++;
              }
            }
            res.push(o);
            rowIndex++;
          } else {
            end++;
          }
          if (this.expander && (
              !bbn.fn.isFunction(this.expander) ||
              (bbn.fn.isFunction(this.expander) && this.expander(a))
            )) {
            res.push({
              index: data[i].index,
              data: a,
              expansion: true,
              rowIndex: rowIndex
            });
            rowIndex++;
          }
          // Group or just global aggregation
          if (aggregateModes.length) {
            aggregates.num++;
            aggregates.tot += parseFloat(a[this.isAggregated]);
            if (aggregates.min === false) {
              aggregates.min = parseFloat(a[this.isAggregated]);
            } else if (aggregates.min > parseFloat(a[this.isAggregated])) {
              aggregates.min = parseFloat(a[this.isAggregated])
            }
            if (aggregates.max === false) {
              aggregates.max = parseFloat(a[this.isAggregated]);
            } else if (aggregates.max < parseFloat(a[this.isAggregated])) {
              aggregates.max = parseFloat(a[this.isAggregated])
            }
            if (isGroup && currentGroupValue) {
              let searchRes = bbn.fn.search(aggregates.groups, {
                value: currentGroupValue
              });
              if (searchRes === -1) {
                searchRes = aggregates.groups.length;
                aggregates.groups.push({
                  value: currentGroupValue,
                  tot: 0,
                  num: 0,
                  min: false,
                  max: false,
                });
              }
              let b = aggregates.groups[searchRes];
              b.num++;
              b.tot += parseFloat(a[this.isAggregated]);
              if (b.min === false) {
                b.min = parseFloat(a[this.isAggregated]);
              } else if (b.min > parseFloat(a[this.isAggregated])) {
                b.min = parseFloat(a[this.isAggregated])
              }
              if (b.max === false) {
                b.max = parseFloat(a[this.isAggregated]);
              } else if (b.max < parseFloat(a[this.isAggregated])) {
                b.max = parseFloat(a[this.isAggregated])
              }
              if ((!data[i + 1] || (i === (end - 1))) || (currentGroupValue !== data[i + 1].data[this.cols[this.group].field])) {
                let b = aggregates.groups[aggregates.groups.length - 1];
                b.med = b.tot / b.num;
                $.each(aggregateModes, (k, c) => {
                  let tmp = {};
                  tmp[this.isAggregated] = b[c];
                  res.push({
                    index: data[i] ? data[i].index : 0,
                    rowIndex: rowIndex,
                    groupAggregated: true,
                    link: currentLink,
                    value: currentGroupValue,
                    name: c,
                    data: tmp
                  });
                  rowIndex++;
                });
              }
            }
            if (!data[i + 1] || (i === (end - 1))) {
              aggregates.med = aggregates.tot / aggregates.num;
              $.each(aggregateModes, (k, c) => {
                let tmp = {};
                tmp[this.isAggregated] = aggregates[c];
                res.push({
                  index: data[i] ? data[i].index : 0,
                  rowIndex: rowIndex,
                  aggregated: true,
                  name: c,
                  data: tmp
                });
                rowIndex++;
              });
            }
          }
          if (isGroup && this.selection && lastInGroup && groupNumCheckboxes) {
            res[currentGroupRow].selection = true;
            res[currentGroupRow].selected = groupNumChecked === groupNumCheckboxes;
          }
          i++;
        }
        let fdata = [];
        res.forEach((d) => {
          if (d.group || d.expander || this.isExpanded(d) || d.aggregated || (this.isExpanded(d) && d.groupAggregated)) {
            fdata.push(d)
          }
        });
        this.$nextTick(() => {
          this._updateViewport();
        });
        return fdata;
      },
      /**
       * Return true if an expander is defined or if the table is groupable and the group is 'number'
       * @computed hasExpander
       * @return {Boolean}
       */
      hasExpander() {
        return this.expander || (
          this.groupable &&
          (typeof this.group === 'number') &&
          this.cols[this.group]
        );
      }
    },
    methods: {
      /**
       * Adds the class 'bbn-table-tr-over' to the row of given idx on mouseenter and remove the class on mouse leave.
       * 
       * @method _updateRowIndex
       * @fires getRef
       */
      _updateRowIndex(idx) {
        bbn.fn.each(this.groupCols, (a) => {
          let table = this.getRef(a.name + 'Table');
          if (table && table.tBodies) {
            let trs = this.getRef(a.name + 'Table').tBodies[0].childNodes;
            bbn.fn.each(trs, (tr) => {
              tr.classList.remove('bbn-primary')
            })
            if ((idx !== null) && trs[idx]) {
              trs[idx].classList.add('bbn-primary');
            }
          }
        });
        //this.currentIndex = idx;
      },
      /** 
       * Returns header's CSS object
       * @method _headStyles
       * @param col 
       * @return {Object}
       */
      _headStyles(col) {
        let css = {
          width: this.getWidth(col.realWidth)
        };
        if (col.hidden) {
          css.display = 'none';
        }
        return css;
      },
      /** 
       * Returns body's CSS object
       * @method _bodyStyles
       * @param col
       * return {Object}
       */
      _bodyStyles(col) {
        return {};
      },
      /**
       * @todo description
       * @method _defaultRow
       * @param initialData
       * @return {Object}
       */
      _defaultRow(initialData) {
        let res = {},
          data = initialData ? bbn.fn.extend(true, {}, initialData) : {};
        $.each(this.cols, function (i, a) {
          if (a.field) {
            if (data[a.field] !== undefined) {
              res[a.field] = data[a.field];
            } else if (a.default !== undefined) {
              res[a.field] = bbn.fn.isFunction(a.default) ? a.default() : a.default;
            } else {
              res[a.field] = '';
            }
            if (Array.isArray(res[a.field])) {
              res[a.field] = res[a.field].splice();
            } else if (res[a.field] instanceof(Date)) {
              res[a.field] = new Date(res[a.field].getTime());
            } else if ((null !== res[a.field]) && (typeof res[a.field] === 'object')) {
              res[a.field] = bbn.fn.extend(true, {}, res[a.field]);
            }
          }
        });
        return res;
      },
      /**
       * Creates the object tmpRow.
       * 
       * @method _addTmp
       * @todo
       * @param {} data 
       */
      _addTmp(data) {
        this._removeTmp().tmpRow = this._defaultRow(data);
        if (this.$refs.scrollerY) {
          this.$refs.scrollerY.scrollTo(0, null, true);
        }
        return this;
      },
      /**
       * Changes the values of tmpRow to false.
       * @method _removeTmp
       * @return {Object}
       */
      _removeTmp() {
        if (this.tmpRow) {
          this.tmpRow = false;
        }
        return this;
      },
      /**
       * Defines if the scroll in the table data part has to be hidden.
       * @method _scrollerHidden
       * @param {Object} groupCol 
       * @param {Number} idx 
       * @return {Boolean}
       */
      _scrollerHidden(groupCol, idx) {
        let last = this.groupCols.length === idx - 1;
        if (groupCol.name === 'main') {
          return last ? 'x' : false;
        }
        return last ? 'y' : true;
      },
      /**
       * In a scrollable table, updates the viewport after scrolling the X axis.
       * 
       * @method _updateViewport
       * @fires titleGroupsCells
       * @fires getRef
       */
      _updateViewport() {
        if (!this.scrollable) {
          return
        }
        this.keepCool(() => {
          let table = this.getRef('mainTable'),
            scroll = this.getRef('mainScroller'),
            container = scroll ? scroll.getRef('scrollContainer') : null,
            top = container ? container.scrollTop : null,
            left = container ? container.scrollLeft : null,
            viewport = scroll ? bbn.fn.clone(scroll.$el.getBoundingClientRect()) : null;
          if (this.titleGroups && scroll) {
            let x = scroll.getRef('xScroller').currentScroll,
              cols = this.titleGroupsCells(this.groupCols[1] && (this.groupCols[1].name === 'main') ? 1 : 0),
              tot = 0;
            $.each(cols, (i, a) => {
              if (tot + a.realWidth > x) {
                $(".bbn-table-title-group", this.getRef('mainTitles')).css({
                  left: tot < x ? x - tot : 0
                });
                return false;
              }
              tot += a.realWidth;
            });
          }
          return;
          if (!viewport) {
            return;
          }
          viewport.top = top || 0;
          viewport.left = left || 0;
          if (
            this.viewport &&
            (this.viewport.x === viewport.x) &&
            (this.viewport.width === viewport.width) &&
            (this.viewport.y === viewport.y) &&
            (this.viewport.height === viewport.height) &&
            (this.viewport.top === viewport.top) &&
            (this.viewport.left === viewport.left)
          ) {
            return;
          }
          this.viewport = viewport;
          if (table && scroll) {
            let rows = [],
              cols = [];
            if (table && table.rows && table.rows[0] && table.rows[0].cells) {
              bbn.fn.each(this.groupCols[1].cols, (col, idx) => {
                if (table.rows[0].cells[idx]) {
                  let vp = table.rows[0].cells[idx].getBoundingClientRect();
                  if (vp.x > (viewport.x - 300)) {
                    cols.push(col.index);
                  }
                  if (vp.x > (viewport.x + viewport.width + 300)) {
                    // MUST STOP HERE
                    return false;
                  }
                  this.viewportCols.splice(0, this.viewportCols.length, ...cols);
                  this.viewportRows.splice(0, this.viewportRows.length, ...rows);
                  this.updateTable();
                }
              })
            }
          }
        }, '_updateViewport')
      },
      /**
       * Prepares the data to export the table to CSV.
       * @method _export
       * @return {Array}
       */
      _export() {
        let span = window.document.createElement('span');
        let cols = {};
        let res = [];
        bbn.fn.each(this.currentData, (a) => {
          let o = bbn.fn.clone( JSON.parse(JSON.stringify(a)));
          let row = [];
          bbn.fn.each(this.cols, (b) => {
            if (!b.hidden && !b.buttons && b.field) {
              if (typeof o[b.field] === 'string') {
                span.innerHTML = o[b.field];
                row.push(span.textContent.trim());
              } else {
                row.push(o[b.field]);
              }
            }
          });
          res.push(row);
        });
        return res;
      },
      /**
       * Executes the command of the button
       * 
       * @method _execCommand
       * @param {Object} button 
       * @param {Object} data 
       * @param {Object} col 
       * @param {Number} index 
       * @param {*} ev 
       */
      _execCommand(button, data, col, index, ev) {
        if (ev) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
        }
        //bbn.fn.log("EXEC COMMAND");
        if (button.command) {
          if (bbn.fn.isFunction(button.command)) {
            return button.command(data, col, index);
          } else if (typeof (button.command) === 'string') {
            switch (button.command) {
              case 'csv':
                return this.exportCSV();
              case 'insert':
                return this.insert(data, {
                  title: bbn._('New row creation')
                }, -1);
              case 'select':
                return this.select(index);
              case 'edit':
                return this.edit(data, {
                  title: bbn._('Row edition')
                }, index)
              case 'add':
                return this.add(data);
              case 'copy':
                return this.copy(data, {
                  title: bbn._('Row copy')
                }, index);
              case 'delete':
                return this.delete(index);
            }
          }
        }
        return false;
      },
      /**
       * @todo Not used
       * @method _containerComponent
       * @param {Number} groupIndex
       */
      _containerComponent(groupIndex) {
        return groupIndex === 1 ? {
          template: '<div class="bbn-block"><slot></slot></div>'
        } : bbn.vue.emptyComponent
      },
      /**
       * Deletes the row defined by param index.
       * @method _delete
       * @emit delete
       * @param {Number} index
       */
      _delete(index) {
        if (this.currentSet[index] && this.currentData[this.currentSet[index].index]) {
          let ev = $.Event('delete');
          index = this.currentSet[index].index;
          if (this.url) {
            bbn.fn.post(this.url, bbn.fn.extend({}, this.data, this.currentData[index], {
              action: 'delete'
            }), (d) => {
              if (d.success) {
                this.currentData.splice(index, 1);
                if (this.originalData) {
                  this.originalData.splice(index, 1);
                }
                this.$emit('delete', this.currentData[index], ev);
                appui.success(bbn._('Deleted successfully'))
              } else {
                this.alert(bbn._("Impossible to delete the row"))
              }
            })
          } else {
            this.currentData.splice(index, 1);
            if (this.originalData) {
              this.originalData.splice(index, 1);
            }
            this.$emit('delete', this.currentData[index], ev);
          }
        }
      },
      /**
       * Returns the ref mainTitles.
       * @method getMainTitlesContainer
       * @return {Array}
       */
      getMainTitlesContainer() {
        if (this.isMounted) {
          return [this.getRef('mainTitles')]
        }
        return []
      },
      /**
       * Fires the metod updateData to refresh the current data set.
       * @method reload
       * @fires updateData
       */
      reload() {
        return this.updateData();
      },
      /**
       * Exports to csv and download the given filename.
       * @method exportCSV
       * @param {String} filename 
       * @param {*} valSep 
       * @param {*} rowSep 
       * @param {*} valEsc 
       * @fires _export
       */
      exportCSV(filename, valSep, rowSep, valEsc) {
        let data = bbn.fn.toCSV(this._export(), valSep, rowSep, valEsc);
        if (!filename) {
          filename = 'export-' + (new Date()).getSQL(true).replace('/:/g', '-') + '.csv';
        }
        bbn.fn.download(filename, data, 'csv');
      },
      /**
       * Returns true if a column is editable.
       * @method isEditable
       * @param {Object} row
       * @param {Object} col
       * @param {Number} index
       * @return {Boolean}
       */
      isEditable(row, col, index) {
        if (!this.editable) {
          return false;
        }
        if (bbn.fn.isFunction(col.editable)) {
          return col.editable(row, col, index)
        }
        return col.editable !== false
      },
      /**
       * Returns true if the given row is edited.
       * @method isEdited 
       * @param {Object} data
       * @param {Object} col
       * @param {Number} idx
       * @fires isEditable
       * @return {Boolean}
       * 
       */
      isEdited(data, col, idx) {
        return this.isEditable(data, col, idx) &&
          (this.editMode === 'inline') &&
          (this.currentSet[idx].index === this.editedIndex);
      },
      /**
       * @todo not used
       * @method isNullable
       * @param {Object} row 
       * @param {Object} col 
       * @param {Number} index 
       */
      isNullable(row, col, index) {
        if (bbn.fn.isFunction(col.nullable)) {
          return col.nullable(row, col, index)
        }
        return col.nullable === true;
      },
      /**
       * @todo descriprion
       * @method titleGroupsCells
       * @param {Number} groupIndex
       * @return {Array}
       */
      titleGroupsCells(groupIndex) {
        if (this.titleGroups) {
          let cells = [],
            group = null,
            corresp = {};
          $.each(this.groupCols[groupIndex].cols, (i, a) => {
            if (!a.hidden) {
              if (a.group === group) {
                cells[cells.length - 1].colspan++;
                cells[cells.length - 1].width += a.realWidth;
              } else {
                if (corresp[a.group] === undefined) {
                  let idx = bbn.fn.search(this.titleGroups, 'value', a.group);
                  if (idx > -1) {
                    corresp[a.group] = idx;
                  }
                }
                if (corresp[a.group] !== undefined) {
                  cells.push({
                    text: this.titleGroups[corresp[a.group]].text || '&nbsp;',
                    style: this.titleGroups[corresp[a.group]].style || {},
                    cls: this.titleGroups[corresp[a.group]].cls || '',
                    colspan: 1,
                    width: a.realWidth
                  });
                }
                /*
                else if ( this.titleGroups.default ){
                  cells.push({
                    text: this.titleGroups.default.text || '&nbsp;',
                    style: this.titleGroups.default.style || {},
                    cls: this.titleGroups.default.cls || '',
                    colspan: 1,
                    width: a.realWidth
                  });
                }
                */
                else {
                  cells.push({
                    text: '&nbsp;',
                    style: '',
                    cls: '',
                    colspan: 1,
                    width: a.realWidth
                  });
                }
                group = a.group;
              }
            }
          });
          return cells;
        }
      },
      /**
       * Returns true if the table has currentFilters defined for the given column.
       * @method hasFilter
       * @param {Object} col The column
       * @return {Boolean}
       */
      hasFilter(col) {
        if (col.field) {
          for (let i = 0; i < this.currentFilters.conditions.length; i++) {
            if (this.currentFilters.conditions[i].field === col.field) {
              return true;
            }
          }
        }
        return false;
      },
      /**
       * @method moveMouse
       * @param {Event} e
       * @fires keepCool
       * @fires checkFilterWindow
       */
      moveMouse(e) {
        this.keepCool(() => {
          this.checkFilterWindow(e);

        }, 'moveMouse')
      },
      /**
       * @todo desc
       * @method checkFilterWindow
       * @param {Event} e
       */
      checkFilterWindow(e) {
        if (this.currentFilter) {
          if (this.floatingFilterTimeOut) {
            clearTimeout(this.floatingFilterTimeOut);
          }
          if (
            (e.clientX < this.floatingFilterX) ||
            (e.clientX > this.floatingFilterX + 600) ||
            (e.clientY < this.floatingFilterY) ||
            (e.clientY > this.floatingFilterY + 200)
          ) {
            if (!this.floatingFilterTimeOut) {
              this.floatingFilterTimeOut = setTimeout(() => {
                this.currentFilter = false;
                this.editedFilter = false;
              }, 500);
            }
          } else {
            this.floatingFilterTimeOut = 0;
          }
        }
      },
      /**
       * Returns the options for the bind of the table filter.
       * 
       * @method getFilterOptions
       * @fires getColFilters
       * @return {Object}
       */
      getFilterOptions() {
        if (this.currentFilter) {
          let o = this.editorGetComponentOptions(this.currentFilter);
          if (o.field) {
            o.conditions = this.getColFilters(this.currentFilter);
          }
          if (o.conditions.length) {
            o.value = o.conditions[0].value;
            o.operator = o.conditions[0].operator;
            this.editedFilter = o.conditions[0];
          }
          o.multi = false;
          return o;
        }
      },
      /**
       * Opens the popup containing the multifilter.
       * @method openMultiFilter
       */
      openMultiFilter() {
        this.currentFilter = false;
        let table = this;
        this.getPopup().open({
          title: bbn._('Multiple filters'),
          component: {
            template: `<bbn-scroll><bbn-filter v-bind="source" @change="changeConditions" :multi="true"></bbn-filter></bbn-scroll>`,
            props: ['source'],
            methods: {
              changeConditions(o) {
                table.currentFilters.logic = o.logic;
                table.currentFilters.conditions = o.conditions;
              }
            },
          },
          width: '90%',
          height: '90%',
          source: {
            fields: $.grep(this.cols, (a) => {
              return (a.filterable !== false) && !a.buttons;
            }),
            conditions: this.currentFilters.conditions,
            logic: this.currentFilters.logic
          }
        });
      },
      /**
       * Returns the filter of the given column.
       * @method getColFilters
       * @param {Object} col
       * @return {Object}
       */
      getColFilters(col) {
        let r = [];
        if (col.field) {
          $.each(this.currentFilters.conditions, (i, a) => {
            if (a.field === col.field) {
              r.push(a);
            }
          })
        }
        return r;
      },
      /**
       * Shows the filter of the column. 
       * @method showFilter
       * @param {Object} col 
       * @param {Event} ev 
       */
      showFilter(col, ev) {
        //bbn.fn.log(ev);
        this.floatingFilterX = ev.pageX - 10 < 0 ? 0 : (ev.pageX - 10 + 600 > this.$el.clientWidth ? this.$el.clientWidth - 600 : ev.pageX - 10);
        this.floatingFilterY = ev.pageY - 10 < 0 ? 0 : (ev.pageY - 10 + 200 > this.$el.clientHeight ? this.$el.clientHeight - 200 : ev.pageY - 10);
        this.currentFilter = col;
      },
      /**
       * Returns the list of the showable columns
       * @method pickableColumnList
       * @return {Array}
       */
      pickableColumnList() {
        return $.map(this.cols.slice(), (i, a) => {
          return a.showable !== false;
        })
      },
      /**
       * Opens the popup containing the column picker.
       * @method openColumnsPicker
       */
      openColumnsPicker() {
        let table = this;
        this.getPopup().open({
          title: bbn._("Columns' picker"),
          width: '90%',
          height: '90%',
          component: {
            template: `
<div class="bbn-table-column-picker bbn-full-screen">
  <bbn-form ref="scroll" :source="formData" @success="applyColumnsShown">
    <div class="bbn-padded">
      <ul v-if="source.titleGroups">
        <li v-for="(tg, idx) in source.titleGroups">
          <h3>
            <bbn-checkbox :checked="allVisible(tg.value)"
                          @change="checkAll(tg.value)"
                          :label="tg.text"
            ></bbn-checkbox>
          </h3>
          <ul>
            <li v-for="(col, i) in source.cols"
                v-if="!col.fixed && (col.group === tg.value) && (col.showable !== false) && (col.title || col.ftitle)"
            >
              <bbn-checkbox :checked="shownCols[i]"
                            @change="check(col, i)"
                            :label="col.ftitle || col.title"
                            :contrary="true"
              ></bbn-checkbox>
            </li>
          </ul>
        </li>
      </ul>
      <ul v-else>
        <li v-for="(col, i) in source.cols"
            v-if="!col.fixed && (col.showable !== false) && (col.title || col.ftitle)"
        >
          <bbn-checkbox :checked="shownCols[i]"
                        @change="check(col, i)"
                        :label="col.ftitle || col.title"
                        :contrary="true"
          ></bbn-checkbox>
        </li>
      </ul>
    </div>
  </bbn-form>
</div>
`,
            props: ['source'],
            data() {
              let shownColumns = $.map(this.source.cols, (a) => {
                return !a.hidden;
              });
              return {
                table: table,
                formData: {
                  changed: false
                },
                shownCols: shownColumns
              }
            },
            methods: {
              applyColumnsShown() {
                let toShow = [],
                  toHide = [];
                $.each(this.source.cols, (i, a) => {
                  if (a.hidden == this.shownCols[i]) {
                    if (this.shownCols[i]) {
                      toShow.push(i);
                    } else {
                      toHide.push(i);
                    }
                  }
                });
                if (toShow.length) {
                  table.show(toShow);
                }
                if (toHide.length) {
                  table.show(toHide, true);
                }
              },
              allVisible(group) {
                let ok = true;
                //bbn.fn.log("allVisible", group);
                $.each(this.source.cols, (i, a) => {
                  if (
                    (a.showable !== false) &&
                    (a.group === group) &&
                    !a.fixed
                  ) {
                    if (!this.shownCols[i]) {
                      ok = false;
                      //bbn.fn.log("NOT ALL VISIBLE!!!!!!!!!!!!!!!!!!!!!!", a);
                      return false;
                    }
                  }
                });
                return ok;
              },
              check(col, index) {
                this.$set(this.shownCols, index, !this.shownCols[index]);
              },
              checkAll(group) {
                let show = !this.allVisible(group),
                  shown = [];
                $.each(this.source.cols, (i, a) => {
                  if ((a.showable !== false) && (a.group === group) && !a.fixed) {
                    if (this.shownCols[i] != show) {
                      this.shownCols.splice(i, 1, show);
                    }
                  }
                });
                this.$forceUpdate();
              }
            },
            watch: {
              shownCols: {
                deep: true,
                handler() {
                  this.formData.changed = true;
                }
              }
            }
          },
          source: {
            cols: this.cols,
            titleGroups: this.titleGroups
          }
        });
      },
      /**
       * Opens the popup containing the form to edit the row.
       * @method edit
       * @param {Object} row
       * @param {String|Object} winOptions
       * @param {Number} index
       * @fires _addTmp
       */
      edit(row, winOptions, index) {
        if (!this.editable) {
          throw new Error("The table is not editable, you cannot use the edit function in bbn-table");
        }
        if (!row) {
          this._addTmp();
          row = this.tmpRow;
        } else {
          this.originalRow = bbn.fn.extend(true, {}, row);
        }
        // EditedRow exists from now on the time of the edition
        this.editedRow = row;
        if (this.currentSet[index]) {
          this.editedIndex = this.currentSet[index].index;
        }
        if (this.editMode === 'popup') {
          if (typeof (winOptions) === 'string') {
            winOptions = {
              title: winOptions
            };
          }
          if (!winOptions.height) {
            //winOptions.height = (this.cols.length * 2) + 'rem'
          }
          let popup = bbn.fn.extend({
            title: bbn._('Row edition'),
            width: 700
          }, winOptions ? winOptions : {}, {
            source: {
              row: row,
              data: bbn.fn.isFunction(this.data) ? this.data() : this.data
            }
          });
          // A component is given as global editor (form)
          if (this.editor) {
            popup.component = this.editor;
          }
          // A URL is given and in this case the form will be created automatically with this URL as action
          else if (this.url) {
            let table = this;
            let o = bbn.fn.extend({}, this.data, {
              action: table.tmpRow ? 'insert' : 'update'
            });
            popup.component = {
              data() {
                let fields = [];
                table.cols.map((a) => {
                  let o = bbn.fn.extend(true, {}, a);
                  if (o.ftitle) {
                    o.title = o.ftitle;
                  }
                  fields.push(o);
                });
                return {
                  // Table's columns are used as native form config
                  fields: fields,
                  data: row,
                  obj: o
                }
              },
              template: `
<bbn-form class="bbn-full-screen"
          action="` + table.url + `"
          :schema="fields"
          :source="data"
          :data="obj"
          @success="success"
          @failure="failure">
</bbn-form>`,
              methods: {
                success(d, e) {
                  e.preventDefault();
                  if (table.successEdit(d)) {
                    table.getPopup().close();
                  }
                },
                failure(d) {
                  table.$emit('editFailure', d);
                },
              },
            };
          } else {
            throw new Error(bbn._("Impossible to open a window if either an editor or a URL is not set"))
          }
          popup.afterClose = () => {
            //  this.currentData.push(bbn.fn.clone( this.tmpRow)); // <-- Error. This add a new row into table when it's in edit mode
            this._removeTmp();
            this.editedRow = false;
            this.editedIndex = false;
          };
          this.getPopup().open(popup);
        }
      },
      /**
       * After the post in case of edit of the row, update the row in originalData.
       * 
       * @method successEdit
       * @param {Object} d
       * @emit editSuccess
       * @fires saveRow
       * @return {Boolean}
       */
      successEdit(d) {
        let ev = $.Event('editSuccess');
        this.$emit('editSuccess', d, ev);
        if (d.success && !ev.isDefaultPrevented()) {
          if (d.data) {
            //bbn.fn.log(d.data);
            bbn.fn.iterate(d.data, (o, n) => {
              this.editedRow[n] = o;
            });
          }
          this.saveRow();
          return true;
        }
        return false;
      },
      /**
       * Insert or update a row in originalData.
       * @method saveRow
       * @emit saverow
       */
      saveRow() {
        // New insert
        let ev = $.Event('saverow');
        this.$emit('saverow', this.tmpRow || this.editedRow, ev);
        if (!ev.isDefaultPrevented()) {
          if (this.tmpRow) {
            this.currentData.push(bbn.fn.clone( this.tmpRow));
            if (this.originalData) {
              this.originalData.push(bbn.fn.clone( this.tmpRow));
            }
            this.tmpRow = false;
          }
          // Update
          else if (this.editedRow) {
            this.currentData.splice(this.editedIndex, 1, bbn.fn.clone( this.editedRow));
            if (this.originalData) {
              this.originalData.splice(this.editedIndex, 1, bbn.fn.clone( this.editedRow));
            }
            this.editedRow = false;
          }
        }
      },
      /**
       * If the prop url of the table is defined makes a post to the url to update or insert the row, else fires the method saveRow to insert or update the row in originalData
       * @method saveInline
       * @fires saveRow
       * 
       */
      saveInline() {
        if (this.tmpRow || this.editedRow) {
          if (this.url) {
            let o = bbn.fn.extend({}, this.data, this.tmpRow || this.editedRow, {
              action: this.tmpRow ? 'insert' : 'update'
            });
            bbn.fn.post(this.url, o, (d) => {
              this.successEdit(d);
            })
          } else {
            this.saveRow()
          }
        }
      },
      /**
       * @method isGroupedCell
       * @param {Number} groupIndex 
       * @param {Object} row 
       * @return {Boolean}
       */
      isGroupedCell(groupIndex, row) {
        if (this.groupable && row.group) {
          if (this.groupCols[0].width > 200) {
            return groupIndex === 0;
          } else {
            return groupIndex === 1;
          }
        }
        return false;
      },
      /**
       * Returns the current configuration of the table
       * @method getConfig
       * @return {Object}
       */
      getConfig() {
        return {
          limit: this.currentLimit,
          order: this.currentOrder,
          filters: this.currentFilters,
          hidden: this.currentHidden
        };
      },
      /**
       * Returns the columns configuration.
       * @method getColumnsConfig
       * @return {Array}
       */
      getColumnsConfig() {
        return JSON.parse(JSON.stringify(this.cols));
      },
      /**
       * Sets the current config of the table.
       * @method setConfig
       * @param {Object} cfg
       * @param {Boolean} no_storage
       * @fires getConfig
       * @fires setStorage
       */
      setConfig(cfg, no_storage) {
        if (cfg === false) {
          cfg = bbn.fn.clone(this.defaultConfig);
        } else if (cfg === true) {
          cfg = this.getConfig();
        }
        if (cfg && cfg.limit) {
          if (this.filterable && cfg.filters && (this.currentFilters !== cfg.filters)) {
            this.currentFilters = cfg.filters;
          }
          if (this.pageable && (this.currentLimit !== cfg.limit)) {
            this.currentLimit = cfg.limit;
          }
          if (this.sortable && (this.currentOrder !== cfg.order)) {
            this.currentOrder = cfg.order;
          }
          if (this.showable) {
            if ((cfg.hidden !== undefined) && (cfg.hidden !== this.currentHidden)) {
              this.currentHidden = cfg.hidden;
            }
            $.each(this.cols, (i, a) => {
              let hidden = (this.currentHidden.indexOf(i) > -1);
              if (a.hidden !== hidden) {
                //bbn.fn.log("CHANGING HIDDEN");
                this.$set(this.cols[i], 'hidden', hidden);
              }
            });
          }
          this.currentConfig = {
            limit: this.currentLimit,
            order: this.currentOrder,
            filters: this.currentFilters,
            hidden: this.currentHidden
          };
          if (!no_storage) {
            this.setStorage(this.currentConfig);
          }

          //this.$forceUpdate();
        }
      },
      /**
       * Removes the row defined by the where param from currentData
       * @method remove
       * @param {Object} where
       */
      remove(where) {
        let idx;
        while ((idx = bbn.fn.search(this.currentData, where)) > -1) {
          this.currentData.splice(idx, 1);
        }
        this.$forceUpdate();
      },
      /**
       * Save the current configuration.
       * @method save
       */
      save() {
        this.savedConfig = this.jsonConfig;
      },
      /**
       * Add the given row to currentData
       * @method add
       * @param {Object} data
       * @todo
       * 
       */
      add(data) {
        this.currentData.push(data);
      },
      /**
       * Fires the method _delete to delete the row.
       * @method delete
       * @param {Number} index
       * @param {Strimg} confirm
       * @fires _delete
       * @emit beforeDelete
       */
      delete(index, confirm) {
        if (this.currentData[index]) {
          let ev = $.Event('delete');
          this.$emit('beforeDelete', this.currentData[index], ev);
          if (!ev.isDefaultPrevented()) {
            if (confirm === undefined) {
              confirm = this.confirmMessage;
            }
            if (confirm) {
              this.confirm(confirm, () => {
                this._delete(index);
              })
            } else {
              this._delete(index);
            }
          }
        }
      },
      /**
       * Adds the given data to the object tmpRow and opens the popup with the form to insert the row.
       * @method insert
       * @param {Object} data
       * @param {} options
       * @param {Number} index
       * @fires _addTmp
       * @fires edit
       */
      insert(data, options, index) {
        let d = data ? bbn.fn.clone( data) : {};
        if (this.uid && d[this.uid]) {
          delete d[this.uid];
        }
        this._addTmp(d, index);
        this.edit(this.tmpRow, options, index);
      },
      /**
       * Adds the given data to the object tmpRow and opens the popup with the form to copy the row.
       * @method copy
       * @param {Object} data
       * @param {} options
       * @param {Number} index
       * @fires _addTmp
       * @fires edit
       */
      copy(data, options, index) {
        let r = bbn.fn.clone( data);
        if (this.uid && r[this.uid]) {
          delete r[this.uid];
        }
        this._addTmp(r);
        this.edit(this.tmpRow, options, index);
      },
      /**
       * Emits 'select',  'unselect' or 'toggle' at change of checkbox of the row in a selectable table.
       * @method checkSelection
       * @param {Number} index
       * @emit unselect
       * @emit select
       * @emit toggle
       */
      checkSelection(index) {
        let row = this.currentSet[index];
        if (row && this.groupable && row.group) {
          if (row.expanded) {
            bbn.fn.fori((d, i) => {
              if (d && d.selection && (d.data[this.cols[this.group].field] === row.value)) {
                this.checkSelection(i)
              }
            }, this.currentSet, index + row.num, index + 1)
          }
          return;
        }
        if (row && row.selection) {
          let idx = this.selectedRows.indexOf(row.index),
            isSelected = false;
          if (idx > -1) {
            this.$emit('unselect', row.data);
            this.selectedRows.splice(idx, 1);
          } else {
            this.$emit('select', row.data);
            this.selectedRows.push(row.index);
            isSelected = true;
          }
          this.$emit('toggle', isSelected, this.currentData[row.index]);
        }
      },
      /** 
       * Refresh the current data set.
       * 
       * @method updateData
       * @param withoutOriginal
       * @emit startloading
       * @emit endloading
       * @fires _map
       * @fires observerCheck
       * @fires observerWatch
       * @fires updateTable
       * @fires init
       */
      updateData(withoutOriginal) {
        /** Mini reset?? */
        this.currentExpanded = [];
        this._removeTmp();
        this.editedRow = false;
        this.editedIndex = false;
        this.$forceUpdate();
        return bbn.vue.sourceArrayComponent.methods.updateData.apply(this, [withoutOriginal]).then(() => {
          if (this.editable) {
            this.originalData = JSON.parse(JSON.stringify(this.currentData));
          }
          this.updateTable();
          setTimeout(() => {
            this.init();
          })
        });
      },
      /**
       * Return true if the given row is changed from originalData. 
       * @method isDirty
       * @param {Object} row
       * @param {Object} col
       * @param {Number} idx
       */
      isDirty(row, col, idx) {
        return this.isBatch &&
          col &&
          (row.index !== this.editedIndex) &&
          !row.aggregated &&
          !row.groupAggregated &&
          (col.editable !== false) &&
          col.field &&
          (row.data[col.field] != this.originalData[row.index][col.field])
      },
      /**
       * Returns the css class of the given column.
       * @method currentClass
       * @param {Object} column
       * @param {Object} data
       * @param {Number} index
       */
      currentClass(column, data, index) {
        if (column.cls) {
          return bbn.fn.isFunction(column.cls) ? column.cls(data, index) : column.cls;
        }
        return '';
      },
      /**
       * Returns true if the row corresponding to the given index has changed respect to originalData
       * @method isModified
       * @param {Number} idx
       * @return {Boolean}
       */
      isModified(idx) {
        if (!this.originalData) {
          return false;
        }
        return JSON.stringify(this.currentData[idx]) !== JSON.stringify(this.originalData[idx])
      },
      /**
       * Returns true if the given column is sorted.
       * @method isSorted
       * @param {Object} col
       */
      isSorted(col) {
        if (
          this.sortable &&
          (col.sortable !== false) &&
          !col.buttons &&
          col.field
        ) {
          let idx = bbn.fn.search(this.currentOrder, {
            field: col.field
          });
          if (idx > -1) {
            return this.currentOrder[idx];
          }
        }
        return false;
      },
      /**
       * Sorts the given column.
       * @method sort
       * @param {Object} col
       * @fires updateData
       */
      sort(col) {
        if (
          !this.isLoading &&
          this.sortable &&
          col.field &&
          (col.sortable !== false)
        ) {
          let f = col.field,
            pos = bbn.fn.search(this.currentOrder, {
              field: f
            });
          if (pos > -1) {
            if (this.currentOrder[pos].dir === 'ASC') {
              this.currentOrder[pos].dir = 'DESC';
            } else {
              this.currentOrder.splice(0, this.currentOrder.length);
            }
          } else {
            this.currentOrder.splice(0, this.currentOrder.length);
            this.currentOrder.push({
              field: f,
              dir: 'ASC'
            });
          }
          if (this.isAjax) {
            this.updateData();
          }
        }
      },
      /**
       * Handles the table resize.
       * @method updateTable
       * @emit resize
       */
      updateTable() {
        if (!this.isLoading) {
          clearTimeout(this.updaterTimeout);
          this.updaterTimeout = setTimeout(() => {
            if (this.groupCols[0].cols.length || this.groupCols[2].cols.length) {
              let trs = $("table.bbn-table-data-main:first > tbody > tr", this.$el),
                trsLeft = $("table.bbn-table-data-left:first > tbody > tr", this.$el),
                trsRight = $("table.bbn-table-data-right:first > tbody > tr", this.$el);
              if (trsLeft.length || trsRight.length) {
                trs.each((i, tr) => {
                  if ($(tr).is(":visible")) {
                    let ar = [tr];
                    if (trsLeft[i]) {
                      ar.push(trsLeft[i]);
                    }
                    if (trsRight[i]) {
                      ar.push(trsRight[i]);
                    }
                    ar.forEach((ele) => {
                      ele.style.height = 'auto';
                    });
                    bbn.fn.adjustHeight(ar);
                  }
                });
              }
            }
            let sc = this.getRef('mainScroller'),
              sy = this.getRef('scrollerY');
            if (sc && bbn.fn.isFunction(sc.onResize)) {
              sc.onResize();
              if (sy && bbn.fn.isFunction(sy.onResize)) {
                if (this.scrollableContainer !== sc.$refs.scrollContainer) {
                  this.scrollableContainer = sc.$refs.scrollContainer;
                }
                sy.onResize();
              }
            }
            this.$emit("resize");
          }, 100);
        }
      },
      /**
       * Renders a cell according to column's config.
       * @method render
       * @param {Object} data
       * @param {Object} column
       * @param {Number} index
       * @fires renderData
       */
      render(data, column, index) {
        let value = data && column.field ? data[column.field] || '' : undefined;
        if (column.render) {
          return column.render(data, column, index, value)
        }
        return this.renderData(data, column, index);
      },
      /**
       * @method cancel
       * @fires _removeTmp
       */
      cancel() {
        if (this.tmpRow) {
          this._removeTmp();
        } else if (this.editedRow && this.originalRow) {
          if (this.currentData[this.editedIndex]) {
            this.currentData[this.editedIndex] = this.originalRow;
          }
        }
        this.originalRow = false;
        this.editedRow = false;
        this.editedIndex = false;
      },
      /**
       * @todo not used
       * @method editTmp
       * @param {Object} data
       */
      editTmp(data) {
        if (this.tmpRow) {
          data = bbn.fn.extend(this.tmpRow, data);
        }
        return this;
      },
      /**
       * @method saveTmp
       */
      saveTmp() {},
      /**
       * Returns a dimension in pixels of the given param.
       * @method getWidth
       * @param {Number|String} w
       * @return {String}
       */
      getWidth(w) {
        if (typeof (w) === 'number') {
          return (w > 19 ? w : 20) + 'px';
        }
        if (bbn.fn.isDimension(w)) {
          return w;
        }
        return '100px';
      },
      /**
       * Resets configuration of the table.
       * @method reset
       * @param noCfg
       * @fires setConfig
       * @fires init
       */
      reset(noCfg) {
        this.initReady = false;
        if (!noCfg) {
          this.setConfig(false);
        }
        this.$nextTick(() => {
          this.initReady = true;
          this.init();
        })
      },
      /**
       * Add the given column to table's configuration
       * @method addColumn
       * @param {Object} obj
       */
      addColumn(obj) {
        if (obj.aggregate && !Array.isArray(obj.aggregate)) {
          obj.aggregate = [obj.aggregate];
        }
        this.cols.push(obj);
      },
      /**
       * Return true if the cell is before aggregated cells.
       * @method isBeforeAggregated
       * @param {Number} groupIndex
       * @param {Number} idx
       * @return {Boolean}
       */
      isBeforeAggregated(groupIndex, idx) {
        return this.isAggregated && ((
            this.groupCols[groupIndex].cols[idx + 1] &&
            (this.groupCols[groupIndex].cols[idx + 1].field === this.isAggregated)
          ) ||
          (
            !this.groupCols[groupIndex].cols[idx + 1] &&
            this.groupCols[groupIndex + 1] &&
            this.groupCols[groupIndex + 1].cols[0] &&
            (this.groupCols[groupIndex + 1].cols[0].field === this.isAggregated)
          ));
      },
      /**
       * Reinitialize the table
       * @method onResize
       * @fires init
       */
      onResize() {
        this.init();
      },
      /**
       * Returns an array containing the scrollcontainer of each items of groupCols.
       * @method dataScrollContents
       * @fires getRef
       * @return {Array}
       */
      dataScrollContents() {
        if (!this.groupCols[0].cols.length && !this.groupCols[2].cols.length) {
          return null;
        }
        let r = [];
        $.each(this.groupCols, (i, a) => {
          let sc = this.getRef(a.name + 'Scroller');
          if (a.cols.length && sc && sc.getRef('scrollContainer')) {
            r.push(sc.getRef('scrollContainer'));
          }
        });
        return r;
      },
      /**
       * Returns if the given row is expanded.
       * @method isExpanded
       * @param {Object} d
       * @return {boolean}
       */
      isExpanded(d) {
        if (this.allExpanded) {
          return true;
        }
        if (!this.expander && ((this.group === false) || !this.groupable)) {
          return true;
        }
        if (this.expander) {
          return this.currentExpanded.indexOf(d.index) > -1;
        }
        if (
          this.groupable &&
          (this.group !== false) &&
          this.cols[this.group] &&
          this.cols[this.group].field
        ) {
          if (d.data[this.cols[this.group].field]) {
            return this.currentExpandedValues.indexOf(d.data[this.cols[this.group].field]) > -1;
          }
          return true;
        }
        if ((d.isGrouped || d.groupAggregated) && (this.currentExpanded.indexOf(d.link) > -1)) {
          return true;
        }
        return false;
      },
      /**
       * Toggles the expanded prop of the given row idx.
       * @method toggleExpanded
       * @param idx
       */
      toggleExpanded(idx) {
        if (this.currentData[idx]) {
          if (this.allExpanded) {
            this.allExpanded = false;
          }
          if (
            this.groupable &&
            (this.group !== false) &&
            this.cols[this.group] &&
            this.cols[this.group].field &&
            (this.currentData[idx][this.cols[this.group].field] !== undefined)
          ) {
            let groupValue = this.currentData[idx][this.cols[this.group].field],
              groupIndex = this.currentExpandedValues.indexOf(groupValue);
            if (groupIndex > -1) {
              this.currentExpandedValues.splice(groupIndex, 1);
            } else {
              this.currentExpandedValues.push(groupValue);
            }
          } else {
            let i = this.currentExpanded.indexOf(idx);
            if (i > -1) {
              this.currentExpanded.splice(i, 1);
            } else {
              this.currentExpanded.push(idx);
            }
          }
        }
      },
      /**
       * Returns if the prop expander is specified.
       * @method rowHasExpander
       * @param d
       * @return {Boolean}
       */
      rowHasExpander(d) {
        if (this.hasExpander) {
          if (!bbn.fn.isFunction(this.expander)) {
            return true;
          }
          return !!this.expander(d);
        }
        return false;
      },
      /**
       * Return true if the given index is selected.
       * @method isSelected
       * @param {Number} index
       * @return {Boolean}
       */
      isSelected(index) {
        return this.selection && (this.selectedRows.indexOf(index) > -1);
      },
      /**
       * Returns if the given row has td.
       * 
       * @method hasTd
       * @param {Object} data
       * @param {Number} colIndex
       * @param {Number} groupIndex
       */
      hasTd(data, colIndex, groupIndex) {
        let tdIndex = colIndex;
        for (let i = 0; i < groupIndex; i++) {
          tdIndex += this.groupCols[groupIndex].cols.length;
        }
        if (data.selection) {
          if (tdIndex === 0) {
            return false;
          } else if (data.group || data.expander) {
            if (tdIndex === 1) {
              return false;
            }
          }
        }
        if (data.group || data.expander) {
          if (tdIndex === 0) {
            return false;
          }
        }
        if (data.group || data.expansion) {
          return false;
        }
        if (data.hidden) {
          return false;
        }
        return true;
      },
      /**
       * Initializes the table.
       * @method init
       * @param with_data
       * @fires updateData
       */
      init(with_data) {
        let groupCols = [{
              name: 'left',
              width: null,
              visible: 0,
              cols: []
            },
            {
              name: 'main',
              width: null,
              visible: 0,
              cols: []
            },
            {
              name: 'right',
              width: null,
              visible: 0,
              cols: []
            }
          ],
          numUnknown = 0,
          colButtons = false,
          isAggregated = false;
        this.groupCols = bbn.fn.clone(groupCols);
        this.$nextTick(() => {
          if (this.selection) {
            groupCols[0].cols.push({
              title: ' ',
              width: 40,
              realWidth: 40
            });
            groupCols[0].visible++;
          }
          if (this.hasExpander) {
            groupCols[0].cols.push({
              title: ' ',
              width: this.minimumColumnWidth,
              realWidth: this.minimumColumnWidth
            });
            groupCols[0].visible++;
          }
          bbn.fn.each(this.cols, (a, i) => {
            if (!a.hidden && (!this.groupable || (this.group !== i))) {
              if (a.aggregate && a.field) {
                isAggregated = a.field;
              }
              a.index = i;
              if (a.hidden) {
                a.realWidth = 0;
              }
              else {
                if ( a.width ){
                  if ((typeof (a.width) === 'string') && (a.width.substr(-1) === '%')) {
                    a.realWidth = Math.round(this.lastKnownWidth * parseFloat(a.width) / 100);
                  }
                  else {
                    a.realWidth = parseFloat(a.width);
                  }
                  if ( a.realWidth < this.minimumColumnWidth ){
                    a.realWidth = this.minimumColumnWidth;
                  }
                }
                else {
                  a.realWidth = this.minimumColumnWidth;
                  numUnknown++;
                }
                if ( a.buttons !== undefined ) {
                  colButtons = i;
                }
                if ( a.fixed ){
                  if (
                    (a.fixed !== 'right') &&
                    ((this.fixedDefaultSide !== 'right') || (a.fixed === 'left'))
                  ) {
                    groupCols[0].cols.push(a);
                    if (!a.hidden) {
                      groupCols[0].visible++;
                    }
                  }
                  else {
                    groupCols[2].cols.push(a);
                    if (!a.hidden) {
                      groupCols[2].visible++;
                    }
                  }
                }
                else {
                  groupCols[1].cols.push(a);
                  if (!a.hidden) {
                    groupCols[1].visible++;
                  }
                }
              }
            }
          });
          let tot = 0;
          $.each(groupCols, (i, a) => {
            a.sum = bbn.fn.sum(a.cols, 'realWidth');
            tot += a.sum;
          });
  
          let toFill = this.$el.clientWidth - tot;
          // We must arrive to 100% minimum
          if (toFill > 0) {
            if (numUnknown) {
              let newWidth = Math.round(
                (toFill) /
                numUnknown *
                100
              ) / 100;
              if (newWidth < this.minimumColumnWidth) {
                newWidth = this.minimumColumnWidth;
              }
              $.each(this.cols, (i, a) => {
                if (!a.hidden) {
                  if (!a.width) {
                    a.realWidth = newWidth + this.minimumColumnWidth;
                  }
                }
              });
            }
            // Otherwise we dispatch it through the existing column
            else {
              let bonus = Math.round(
                toFill / (
                  // We don't dispatch to the expander column
                  this.hasExpander ? this.numVisible - 1 : groupCols[1].visible
                ) * 100
              ) / 100;
              $.each(this.cols, (i, a) => {
                if (!a.hidden && (!this.hasExpander || (i !== 0))) {
                  a.realWidth += bonus;
                }
              })
            }
          }
          $.each(groupCols, (i, a) => {
            a.width = bbn.fn.sum(a.cols, 'realWidth');
          });
          this.groupCols = groupCols;
          this.colButtons = colButtons;
          this.isAggregated = isAggregated;
          this.initReady = true;
          if (with_data) {
            this.$nextTick(() => {
              this.updateData();
            })
          }
        });
      },
      /**
       * Prevents default if enter or tab keys are pressed. 
       * @method keydown
       * @param {Event} e
       */
      keydown(e) {
        if (this.isBatch && this.editedRow && (e.which === 9) || (e.which === 13)) {
          e.preventDefault();
        }
      },
      /**
       * @todo it seems to don't work
       * Show or hide the given column index. 
       * @method show
       * @param {} colIndexes 
       * @param {Boolean} hide 
       * @fires setConfig
       * @fires init
       */
      show(colIndexes, hide) {
        if (!Array.isArray(colIndexes)) {
          colIndexes = [colIndexes];
        }
        $.each(colIndexes, (i, colIndex) => {
          if (this.cols[colIndex]) {
            if ((this.cols[colIndex].hidden && !hide) || (!this.cols[colIndex].hidden && hide)) {
              let idx = this.currentHidden.indexOf(colIndex);
              if (hide && (idx === -1)) {
                this.currentHidden.push(colIndex);
              } else if (!hide && (idx > -1)) {
                this.currentHidden.splice(idx, 1);
              }
            }
          }
        });
        this.$forceUpdate();
        this.setConfig(true);
        this.init(true);
      },
      /**
       * If no editor is given to the table returns the correct component to edit the field basing on the column type.
       * 
       * @method getEditableComponent
       * @param {Object} col
       * @param {Object} data
       * return {String}
       */
      getEditableComponent(col, data) {
        if (col.editor) {
          return col.editor;
        }
        if (col.type) {
          switch (col.type) {
            case "date":
              return 'bbn-datepicker';
            case "email":
              return 'bbn-input';
            case "url":
              return 'bbn-input';
            case "number":
              return 'bbn-numeric';
            case "money":
              return 'bbn-numeric';
            case "bool":
            case "boolean":
              return 'bbn-checkbox';
          }
        }
        if (col.source) {
          return 'bbn-dropdown';
        }
        return 'bbn-input';
      },
      /**
       * Returns the object of properties to bind with the editable component.
       * @method getEditableOptions
       * @param {Object} col
       * @param {Object} data
       */
      getEditableOptions(col, data) {
        let res = col.options ? (
          bbn.fn.isFunction(col.options) ? col.options(data, col) : col.options
        ) : {};
        if (!res.name && col.field) {
          res.name = col.field;
        }
        if (col.type) {
          switch (col.type) {
            case "date":
              break;
            case "email":
              bbn.fn.extend(res, {
                type: 'email'
              });
              break;
            case "url":
              bbn.fn.extend(res, {
                type: 'url'
              });
              break;
            case "number":
              break;
            case "money":
              break;
            case "bool":
            case "boolean":
              bbn.fn.extend(res, {
                value: 1,
                novalue: 0
              });
              break;
          }
        }
        if (col.source) {
          bbn.fn.extend(res, {
            source: col.source
          });
        } else if (col.editor) {
          res.source = data;
        }
        return res;
      },
      /**
       * Returns the html tag of the given row index.
       * @method getTr
       * @param i
       */
      getTr(i) {
        let c = this.getRef('mainData');
        if (c) {
          return $("table:first > tbody > tr:eq(" + i + ")", this.getRef('mainData'))[0];
        }
      },
      /**
       * Returns an object of the default values of props in bbn.vue.fieldComponent.
       * @method defaultObject
       * @return {Object}
       */
      defaultObject() {
        let o = {};
        for (var n in bbn.vue.fieldComponent) {
          if (bbn.vue.fieldComponent[n].default !== undefined) {
            o[n] = bbn.vue.fieldComponent[n].default;
          }
        }
        return o;
      },
      /**
       * Focuses the given row index.
       * @method focusRow
       * @param {Event} ev
       * @param {Number} idx
       */
      focusRow(ev, idx) {
        //bbn.fn.log(ev);
        if (ev.target.tagName !== 'BUTTON') {
          this.focusedRow = idx;
        }
      },
      /**
       * Blurs the given row index.
       * @method blurRow
       * @param {Event} ev
       * @param {Number} idx
       */
      blurRow(ev, idx) {
        //bbn.fn.log(ev);
        if (ev.target.tagName !== 'BUTTON') {
          this.focusedRow = false;
        }
      },
      saveEditedRow() {},
      cancelEditedRow() {}
    },
    /**
     * @event created
     * @fires addColumn
     * @fires setConfig
     * @fires getStorage
     */
    created() {
      // Adding bbns-column from the slot
      if (this.$slots.default) {
        let def = this.defaultObject();
        for (let node of this.$slots.default) {
          //bbn.fn.log("TRYING TO ADD COLUMN", node);
          if (
            node.componentOptions &&
            (node.componentOptions.tag === 'bbns-column')
          ) {
            this.addColumn(bbn.fn.extend({}, def, node.componentOptions.propsData));
          } else if (
            (node.tag === 'bbns-column') &&
            node.data && node.data.attrs
          ) {
            this.addColumn(bbn.fn.extend({}, def, node.data.attrs));
          }
        }
      }
      if (this.columns.length) {
        $.each(this.columns, (i, a) => {
          this.addColumn(a);
        })
      }

      if (this.defaultConfig.hidden === null) {
        let tmp = [];
        let initColumn = [];
        $.each(this.cols, (i, a) => {
          if (a.hidden) {
            tmp.push(i);
          } else if (initColumn.length <= 10) {
            initColumn.push(i);
          }
        });
        this.viewportCols = initColumn;
        this.defaultConfig.hidden = tmp;
      }

      this.setConfig(false, true);
      this.initialConfig = this.jsonConfig;
      this.savedConfig = this.jsonConfig;
      let cfg = this.getStorage();
      this.setConfig(cfg ? cfg : false, true);
    },
    /**
     * After the initialization of the component sets the property ready on true.
     * @event mounted
     * @fires init
     * @fires updateData
     */
    mounted() {
      this.init();
      this.updateData().then(() => {
        this.ready = true;
      });
    },
    /**
     * @event updated
     * @fires updateTable
     */
    updated() {
      this.updateTable();
    },

    watch: {
      /**
       * @watch observerValue
       * @fires updateData
       */
      observerValue(newVal) {
        if ((newVal !== this._observerReceived) && !this.editedRow) {
          this._observerReceived = newVal;
          //bbn.fn.log("watch observerValue");
          this.updateData();
        }
      },
      /**
       * @watch editedRow
       */
      editedRow(newVal, oldVal) {
        if (newVal === false) {
          this.editedIndex = false;
        }
      },
      /**
       * @watch cols
       * @fires selfEmit
       */
      cols: {
        deep: true,
        handler() {
          //bbn.fn.log("watch columns");
          this.selfEmit();
        }
      },
      /**
       * @watch currentHidden
       * @fires setConfig
       */
      currentHidden: {
        deep: true,
        handler() {
          if (this.ready) {
            this.setConfig(true);
            this.$forceUpdate();
          }
        }
      },
      /**
       * @watch group
       * @fires init
       */
      group() {
        this.currentExpandedValues = [];
        this.currentExpanded = [];
        this.init();
      },

      /**
       * @watch focusedRow
       * @fires isModified
       * @emit change
       */
      focusedRow(newIndex, oldIndex) {
        if (this.currentSet[oldIndex] !== undefined) {
          let idx = this.currentSet[oldIndex].index;
          if (
            this.editable &&
            (this.editMode === 'inline') &&
            (this.editedIndex === idx) &&
            this.isModified(idx)
          ) {
            //this.$forceUpdate();
            this.$emit('change', this.currentSet[oldIndex].data, idx);
            //this.save();
          }
        }
        if (this.currentSet[newIndex] !== undefined) {
          if (
            this.editable &&
            (this.editMode === 'inline') &&
            !this.currentSet[newIndex].group
          ) {
            let comeFromAfter = newIndex === oldIndex - 1;
            this.$nextTick(() => {
              this.edit(this.currentSet[newIndex].data, null, newIndex);
              this.$nextTick(() => {
                $("input:visible:" + (comeFromAfter ? 'last' : 'first'), this.getTr(newIndex)).focus();
              })
            })
          }
        }
      },
    }
  });

})(window.jQuery, bbn);
