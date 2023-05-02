/**
 * @file bbn-table component
 *
 * @description  bbn-table is a powerful component of wide configuration that offers vast customizations.
 * The source obtains it by giving a url to retrieve data or directly supplying an array.
 * It allows you to easily modify the content by entering new data in the input field corresponding to the type of column being defined.
 * The table rows can be sorted by clicking on a column header.
 * Table elements can be filtered with the help of a built-in filters in the column headings or using a multifilter panel and a reset by removing a filter or all filters with just one click.
 * It's possible to create fixed areas that will keep their position by always having them available during scrolling.
 * It gives the possibility to group the data.
 * These are some examples of what can be done with this component, from the few configuration lines we can express considerable work complexity.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.resizer
     * @mixin bbn.wc.mixins.editableList
     * @mixin bbn.wc.mixins.list
     * @mixin bbn.wc.mixins.dataEditor
     * @mixin bbn.wc.mixins.localStorage
     * @mixin bbn.wc.mixins.observer
     * @mixin bbn.wc.mixins.keepCool
     * @mixin bbn.wc.mixins.data
     */
    mixins:
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.resizer,
      bbn.wc.mixins.editableList,
      bbn.wc.mixins.list,
      bbn.wc.mixins.dataEditor,
      bbn.wc.mixins.localStorage,
      bbn.wc.mixins.observer,
      bbn.wc.mixins.keepCool,
      bbn.wc.mixins.data
    ],
    props: {
      /**
       * True if the columns has to have titles.
       * @prop {Boolean} [true] titles
       */
      titles: {
        type: Boolean,
        default: true
      },
      /**
       * The message to show when the table has no data.
       * @prop {String} ['<h3>' + bbn._('No Data') + '</h3>'] noData
       */
      noData: {
        default: '<h3>' + bbn._('No Data') + '</h3>'
      },
      /**
       * If the property 'group' is given to one or more columns in the table (ex: group="test"), it defines the title of a group of columns. (ex: titleGroups="[{value: 'test', text: 'My group'}]").
       * @prop {Array|Function} titleGroups
       */
      titleGroups: {
        type: [Array, Function]
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
       * Defines the minimum columns width for mobile devices.
       * @prop {Number} [100] minimumColumnWidthMobile
       */
      minimumColumnWidthMobile: {
        type: Number,
        default: 100
      },
      /**
       * Defines the default columns width.
       * @prop {Number} [150] defaultColumnWidth
       */
      defaultColumnWidth: {
        type: Number,
        default: 150
      },
      /**
       * A function to define css class(es) for each row.
       * @prop {Function} trClass
       */
      trClass: {
        type: [String, Function, Object]
      },
      /**
       * A function to define css style(s) for each row.
       * @prop {Function} trStyle
       */
      trStyle: {
        type: [String, Function, Object]
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
       * Defines the expander of the rows.
       * @prop  {Object|String|Function} expander
       */
      expander: {
        type: [Object, String, Function]
      },
      /**
       * Customize the loading text or hide it
       * @prop {String|Boolean} [true] loader
       */
      loader: {
        type: [String, Boolean],
        default: true
      },
      /**
       * If one or more columns have the property fixed set to true it defines the side of the fixed column(s).
       * @prop {String} ['left'] fixedDefaultSide
       */
      fixedDefaultSide: {
        type: String,
        default: 'left'
      },
      /**
       * Defines the toolbar of the table.
       * @prop {Array|Object|String|Function} toolbar
       */
      toolbar: {
        type: [Array, Object, String, Function]
      },
      /**
       * An array of objects with at least the property 'field' that can replace the html '<bbns-column></bbns-column>' or extend them.
       * @prop {Array} [[]] columns
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
       * The list of expanded rows based on a specific value (ex. group field) and not on the row index
       * @prop {Array|Function} expandedValues
       */
      expandedValues: {
        type: [Array, Function]
      },
      /**
       * In a grouped table, if set to true defines that all rows will be expanded. If an array is given defines which row(s) of the table will be expanded.
       * @prop {Boolean|Array} [[]] expanded
       */
      expanded: {
        type: [Boolean, Array],
        default () {
          return [];
        }
      },
      /**
       * Defines the footer of the table.
       * Allowed values ​​are the name or the object of a component, a boolean or a function (to inject custom html)
       * @prop {String|Object|Boolean|Function} footer
       */
      footer: {
        type: [String, Object, Boolean, Function],
        default: true
      },
      /**
       * Defines the footer for a group of rows.
       * Allowed values ​​are the name or the object of a component or a function (to inject custom html)
       * @prop {String|Object|Function} groupFooter
       */
      groupFooter: {
        type: [String, Object, Function]
      },
      /**
       * @todo desc
       * @prop {Object} [{tot: 'Total',med: 'Average',num: 'Count',max: 'Maximum',min: 'Minimum'}] aggregateExp
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
       * @prop {String|Array} aggregate
       */
      aggregate: {
        type: [String, Array]
      },
      /**
       * @todo desc
       * @prop {Object} loadedConfig
       */
      loadedConfig: {
        type: Object
      },
      /**
       * Shows the footer's arrows as buttons
       * @prop {Boolean} [true] footerButtons
       */
      footerButtons: {
        type: Boolean,
        default(){
          return !bbn.fn.isMobile() || bbn.fn.isTabletDevice();
        }
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
        default: bbn._("rows")
      },
      /**
       * The way `buttons` should be displayed, either as buttons, dropdown or as a menu.
       * @prop {String} ['buttons'] buttonMode
       */
      buttonMode: {
        type: String,
        default: 'buttons',
        validator(v) {
          return ['buttons', 'dropdown', 'menu'].includes(v);
        }
      },
      /**
       * The name of the `record` word as used in the pager interface.
       * @prop {String} ['nf nf-mdi-dots_vertical'] buttonIcon
       */
       buttonIcon: {
        type: String,
        default: 'nf nf-mdi-dots_vertical'
      },
      /**
       * Allows you to see the contents of a cell in a popup
       * @prop {Boolean} [false] zoomable
       */
      zoomable: {
        type: Boolean,
        default: false
      },
      /**
       * The max row height value
       * @prop {Number} maxRowHeight
       */
      maxRowHeight: {
        type: Number
      },
      /**
       * Property sloBefore for the toolbar
       * @prop {Boolean} toolbarSlotBefore
       */
      toolbarSlotBefore: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        /**
         * @data {Boolean} [false] _observerReceived
         */
        _observerReceived: false,
        allRowsChecked: false,
        /**
         * The group of columns.
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
         * The current configuration object.
         * @data {Object} [{}] currentConfig
         */
        currentConfig: {},
        /**
         * The saved configuration.
         * @data {Boolean} [false] savedConfig
         */
        savedConfig: false,
        /**
         * The default confuguration
         * @data {Object} defaultConfig
         */
        defaultConfig: bbn.fn.extend({
          filters: this.filters,
          limit: this.limit,
          order: this.order,
          hidden: this.hidden || null,
        }, this.loadedConfig || {}),
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
         * @data {Boolean|Number} [false] group
         */
        group: this.groupBy === undefined ? false : this.groupBy,
        /**
         * @data {Array} [[]] cols
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
         * @data {Array} [[]] popups
         */
        popups: [],
        /**
         * @data {Boolean} [false] isAggregated
         */
        isAggregated: false,
        /**
         * @data {Array} [[]] aggregatedColumns
         */
        aggregatedColumns: [],
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
         * @data {} [null] rowIndexTimeOut
         */
        rowIndexTimeOut: null,
        /**
         * @data {String} containerPadding
         */
        containerPadding: (bbn.fn.getScrollBarSize() ? bbn.fn.getScrollBarSize() : '0') + 'px',
        /**
         * @data {Vue} [null] container
         */
        container: null,
        /**
         * The current scroll top position.
         * @data {Number} [0] currentScrollTop
         */
        currentScrollTop: 0,
        /**
         * @data [null] marginStyleSheet
         */
        marginStyleSheet: null,
        /**
         * @data {String} [bbn.fn.randomString().toLowerCase()] cssRuleName
         */
        cssRuleName: bbn.fn.randomString().toLowerCase(),
        /**
         * @data {String} [false] initStarted
         */
        initStarted: false,
        /**
         * @data [null] inTable
         */
        inTable: null,
        /**
         * @data [null] filterElement
         */
        filterElement: null,
        /**
         * @data {Boolean} [false] hasScrollX 
         */
        hasScrollX: false,
        /**
         * @data {Boolean} [false] hasScrollY
         */
        hasScrollY: false,
        /**
         * @data {Number} [0] borderLeft
         */
        borderLeft: 0,
        /**
         * @data {Number} [0] borderRight
         */
        borderRight: 0,
        /**
         * @data {DOMElement} [undefined] focusedElement
         */
        focusedElement: undefined,
        /**
         * @data {Number} [0] focusedElementX Horizontal coordinate of focused element
         */
        focusedElementX: 0,
        /**
         * @data {Number} [0] focusedElementY Vertical coordinate of focused element
         */
        focusedElementY: 0,
        /**
         * @data {Boolean} [false] isTableDataUpdating Will be set to true during the whole update process
         */
        isTableDataUpdating: false,
        /**
         * The text shown during loading
         * @data {String} ['Loading...'] currentLoaderText
         */
        currentLoaderText: bbn.fn.isString(this.loader) ? this.loader : bbn._('Loading') + '...',
        /**
         * True if the table is resizing its width
         * @data {Boolean} [false] isResizingWidth
         */
        isResizingWidth: false
      };
    },
    computed: {
      realButtons(){
        if (this.cols.length && this.cols[this.colButtons] && this.cols[this.colButtons].buttons) {
          if (bbn.fn.isFunction(this.cols[this.colButtons].buttons)) {
            return this.cols[this.colButtons].buttons;
          }
          else if (bbn.fn.isArray(this.cols[this.colButtons].buttons)) {
            let res = [];
            bbn.fn.each(this.cols[this.colButtons].buttons, a => {
              if (bbn.fn.isString(a)) {
                switch (a) {
                  case 'edit':
                    res.push({
                      text: bbn._('Edit'),
                      action: 'edit',
                      icon: 'nf nf-fa-edit'
                    })
                    break;
                  case 'copy':
                    res.push({
                      text: bbn._("Copy"),
                      action: 'copy',
                      icon: 'nf nf-fa-copy'
                    });
                    break;
                  case 'delete':
                    res.push({
                      text: bbn._("Delete"),
                      action: 'delete',
                      icon: 'nf nf-fa-times'
                    });
                    break;
                }
              }
              else {
                res.push(a)
              }
            });
            if (this.cols[this.colButtons].notext) {
              bbn.fn.each(res, a => {
                a.notext = true;
                return a;
              });
            }

            return res;
          }
        }
        return [];
      },
      /**
       * The array of selected values if the table is selectable.
       * @computed selectedValues
       * @returns {Array}
       */
      selectedValues(){
        return this.currentSelected.map(a => {
          return this.uid ? this.currentData[a].data[this.uid] : this.currentData[a].data;
        })
      },
      /**
       * The container width.
       * @computed containerWidth
       * @returns {String}
       */
      containerWidth(){
        if ( !this.groupCols || !this.groupCols[1] || !this.groupCols[1].width || !this.lastKnownCtWidth ){
          return '0px';
        }
        return (this.lastKnownCtWidth - this.groupCols[0].width - this.groupCols[2].width) + 'px';
      },
      /**
       * The total width.
       * @computed totalWidth
       * @returns {String}
       */
      totalWidth(){
        if ( !this.groupCols || !this.groupCols[1] || !this.groupCols[1].width || !this.lastKnownCtWidth ){
          return '0px';
        }
        return (this.groupCols[0].width + this.groupCols[1].width + this.groupCols[2].width) + 'px';
      },
      /**
       * Return true if the table has the prop toolbar defined.
       * @computed hasToolbar
       * @returns {Boolean}
       */
      hasToolbar() {
        return this.toolbarButtons.length || bbn.fn.isObject(this.toolbar) || bbn.fn.isFunction(this.toolbar) || bbn.fn.isString(this.toolbar);
      },
      /**
       * @computed hasPager
       * @return {Boolean}
       */
      hasPager(){
        return (this.pageable
            || this.saveable
            || this.filterable
            || this.isAjax
            || this.showable)
          && (this.footer === true);
      },
      /**
       * Return an array of shown fields (the hidden ones are excluded).
       * @computed shownFields
       * @returns {Array}
       */
      shownFields() {
        let r = [];
        bbn.fn.each(this.cols, a => {
          if (a.field && !a.hidden) {
            r.push(a.field);
          }
        });
        return r;
      },
      /**
       * Return the json string of currentConfig.
       * @computed jsonConfig
       * @returns {String}
       */
      jsonConfig() {
        return JSON.stringify(this.currentConfig);
      },
      /**
       * Return true if the saved config is identic to the jsonConfig.
       * @computed isSaved
       * @returns {Boolean}
       */
      isSaved() {
        return this.jsonConfig === this.savedConfig;
      },
      /**
       * Return true if the json string of currentConfig is different from initialConfig
       * @computed isChanged
       * @returns {Boolean}
       */
      isChanged() {
        return JSON.stringify(this.currentConfig) !== this.initialConfig;
      },
      /**
       * Return an array with the object(s) button for the toolbar.
       * @computed toolbarButtons
       * @returns {Array}
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
          bbn.fn.each(ar, a => {
            let o;
            if (bbn.fn.isString(a)) {
              switch (a) {
                case 'insert':
                  o = {
                    text: bbn._('Add'),
                    action: this.insert,
                    icon: 'nf nf-fa-plus'
                  };
                  break;
                case 'export':
                  o = {
                    
                  };
                  break;
                case 'print':
                  o = {
                    
                  };
                  break;
                // separator or other toolbar param
                default:
                  o = a;
              }
            }
            else if (bbn.fn.isObject(a)) {
              o = bbn.fn.clone( a);
            }
            if (o && bbn.fn.isObject(o) && bbn.fn.isString(o.action)) {
              o.action = () => {
                this._execCommand(a);
              }
            }

            if (!o) {
              throw new Error(bbn._("Wrong parameter for toolbar"))
            }

            r.push(o);
          });
        }
        return r;
      },
      /**
       * Return false if a required field of a column is missing.
       * @computed isEditedValid
       * @returns {Boolean}
       */
      isEditedValid() {
        let ok = true;
        if (this.tmpRow) {
          bbn.fn.each(this.columns, a => {
            if (a.field && a.required && !this.tmpRow[a.field]) {
              ok = false;
              return false;
            }
          });
        }
        return ok;
      },
      /**
       * Return the number of visible columns of the table.
       * @computed numVisible
       * @returns {number}
       */
      numVisible() {
        return this.cols.length - bbn.fn.count(this.cols, {
          hidden: true
        }) + (this.hasExpander ? 1 : 0) + (this.selection ? 1 : 0);
      },
      /**
       * Return the object scroller.
       * @computed scroller
       * @returns {Object}
       */
      scroller() {
        return bbn.wc.isComponent(this.$refs.scroller) ? this.$refs.scroller : null;
      },
      /**
       * Return an array of objects containing the data of the row and other information about the current view of the table.
       * @computed items
       * @fires _checkConditionsOnValue
       * @fires expandedValues
       * @fires isExpanded
       * @returns {Array}
       */
      items() {
        if (!this.cols.length) {
          return [];
        }
        // The final result
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
          aggregates = {},
          aggregateModes = [],
          aggIndex = 0,
          i = 0,
          data = this.filteredData;
        // Aggregated
        if (this.isAggregated) {
          aggregateModes = bbn.fn.isArray(this.aggregate) ? this.aggregate : [this.aggregate];
          bbn.fn.each(this.aggregatedColumns, a => {
            aggregates[a.field] = {
              tot: 0,
              num: 0,
              min: false,
              max: false,
              groups: []
            };
          });
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
          data = bbn.fn.multiorder(data, orders.map(item => {
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
                  d.data[col.field] = d.data[col.field] ? bbn.fn.getField(col.source, col.sourceText ? col.sourceText : 'text', col.sourceValue ? col.sourceValue : 'value', d.data[col.field]) || '' : '';
                })
              }
            });
            data = bbn.fn.multiorder(data, JSON.parse(JSON.stringify(this.currentOrder)).map(item => {
              item.field = 'data.' + item.field;
              return item;
            }));
            bbn.fn.each(this.cols, col => {
              if (col.source && col.field) {
                bbn.fn.each(data, (d, i) => {
                  d.data[col.field] = tmpData[col.field][d.index];
                });
              }
            });
          } else {
            data = bbn.fn.multiorder(data, JSON.parse(JSON.stringify(this.currentOrder)).map(item => {
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
            rowKey: this.isAjax ? ('-1-' + this.hashCfg) : -1,
            data: this.tmpRow,
            selected: false,
            expander: false
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
          lastInGroup = false,
          expanderIndex = 0;
        while (data[i] && (i < end)) {
          let a = data[i].data;
          // True if the element is the last of its group
          lastInGroup = isGroup && (!data[i + 1] || (data[i + 1].data[groupField] !== currentGroupValue));
          // Is a new group
          if (isGroup && (currentGroupValue !== a[groupField])) {
            groupNumCheckboxes = 0;
            // If the row doesn't have the column
            if ((a[groupField] === undefined) || bbn.fn.isNull(a[groupField]) || (a[groupField] === '')) {
              currentGroupValue = null;
              currentGroupIndex = -1;
              isExpanded = true;
            }
            else {
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
                rowKey: data[i].key,
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

              currentLink = res.length;
              if (!isExpanded
                && data[i - 1]
                && (currentGroupValue === data[i - 1].data[groupField])
              ) {
                if (res.length) {
                  res.push(tmp);
                }
              }
              else {
                tmp.expanded = isExpanded;
                if (this.expander) {
                  expanderIndex = tmp.index;
                }
                res.push(tmp);
                rowIndex++;
              }
            }
          }
          else if (this.expander) {
            let exp = bbn.fn.isFunction(this.expander) ?
              this.expander(data[i], i) :
              this.expander;
            isExpanded = exp ?
              (this.currentExpanded.includes(data[i].index) || this.allExpanded) :
              false;
            if (!isGroup) {
              let tmp = {
                index: data[i].index,
                data: a,
                rowIndex: rowIndex,
                rowKey: data[i].key,
                expander: true,
                expanded: isExpanded
              };
              if (this.selection
                && (!bbn.fn.isFunction(this.selection)
                  || this.selection(tmp))
              ) {
                tmp.selected = (!this.uid
                    && this.currentSelected.includes(data[i].index))
                  || (this.uid
                    && this.currentSelected.includes(data[i].data[this.uid]));
                tmp.selection = true;
                groupNumCheckboxes++;
                if (tmp.selected) {
                  groupNumChecked++;
                }
              }
              res.push(tmp);
              rowIndex++;
            }
          }

          if (!isGroup
            || isExpanded
            || !currentGroupValue
            || (this.expander
              && (!bbn.fn.isFunction(this.expander)
                || this.expander(data[i], i))
            )
          ) {
            o = {
              index: data[i].index,
              data: a,
              rowIndex: rowIndex,
              rowKey: data[i].key
            };
            if (isGroup) {
              if (!currentGroupValue) {
                o.expanded = true;
              }
              else {
                o.isGrouped = true;
                o.link = currentLink;
                o.rowKey = o.rowIndex + '-' + o.rowKey;
              }
            }
            if (this.expander
              && (!bbn.fn.isFunction(this.expander)
                || this.expander(data[i], i))
            ) {
              o.expansion = true;
              o.expanderIndex = expanderIndex;
              o.rowKey = rowIndex + '-' + data[i].key;
            }
            if (this.selection
              && ((!o.isGrouped && !this.expander)
                || (o.isGrouped && !o.expander)
                || (o.isGrouped && o.expansion))
              && (!bbn.fn.isFunction(this.selection)
                || this.selection(o))
            ) {
              o.selected = (!this.uid
                  && this.currentSelected.includes(data[i].index))
                || (this.uid
                  && this.currentSelected.includes(data[i].data[this.uid]));
              o.selection = true;
              groupNumCheckboxes++;
              if (o.selected) {
                groupNumChecked++;
              }
            }
            res.push(o);
            rowIndex++;
            if (isGroup
              && this.groupable
              && this.groupFooter
              && !this.expander
              && (!data[i + 1]
                || (data[i + 1].data[groupField] !== data[i].data[groupField]))
            ) {
              res.push({
                index: data[i].index,
                data: bbn.fn.filter(data, v => {
                  return v.data[groupField] === data[i].data[groupField];
                }),
                rowIndex: rowIndex,
                rowKey: data[i].key,
                isGrouped: true,
                footer: true,
                selection: false,
                expander: false
              });
              rowIndex++;
            }
          }
          else {
            end++;
          }
          // Group or just global aggregation
          if (aggregateModes.length) {
            bbn.fn.each(this.aggregatedColumns, ac => {
              let aggr = aggregates[ac.field];
              aggr.num++;
              aggr.tot += parseFloat(a[ac.field]);
              if (aggr.min === false) {
                aggr.min = parseFloat(a[ac.field]);
              } else if (aggr.min > parseFloat(a[ac.field])) {
                aggr.min = parseFloat(a[ac.field])
              }
              if (aggr.max === false) {
                aggr.max = parseFloat(a[ac.field]);
              } else if (aggr.max < parseFloat(a[ac.field])) {
                aggr.max = parseFloat(a[ac.field])
              }
              if (isGroup && currentGroupValue) {
                let searchRes = bbn.fn.search(aggr.groups, {
                  value: currentGroupValue
                });
                if (searchRes === -1) {
                  searchRes = aggr.groups.length;
                  aggr.groups.push({
                    value: currentGroupValue,
                    tot: 0,
                    num: 0,
                    min: false,
                    max: false,
                  });
                }
                let b = aggr.groups[searchRes];
                b.num++;
                b.tot += parseFloat(a[ac.field]);
                if (b.min === false) {
                  b.min = parseFloat(a[ac.field]);
                } else if (b.min > parseFloat(a[ac.field])) {
                  b.min = parseFloat(a[ac.field])
                }
                if (b.max === false) {
                  b.max = parseFloat(a[ac.field]);
                } else if (b.max < parseFloat(a[ac.field])) {
                  b.max = parseFloat(a[ac.field])
                }
                if (
                  isExpanded && (
                    (!data[i + 1] || (i === (end - 1))) ||
                    (currentGroupValue !== data[i + 1].data[this.cols[this.group].field])
                  )
                ){
                  let b = aggr.groups[aggr.groups.length - 1];
                  b.med = b.tot / b.num;
                  bbn.fn.each(aggregateModes, c => {
                    let tmp = {};
                    tmp[ac.field] = b[c];
                    res.push({
                      index: data[i] ? data[i].index : 0,
                      rowIndex: rowIndex,
                      rowKey: 'a' + aggIndex + '-' + (data[i] ? data[i].key : rowIndex),
                      groupAggregated: true,
                      link: currentLink,
                      value: currentGroupValue,
                      name: c,
                      data: tmp
                    });
                    rowIndex++;
                    aggIndex++;
                  });
                }
              }
              if (!data[i + 1] || (i === (end - 1))) {
                aggr.med = aggr.tot / aggr.num;
                bbn.fn.each(aggregateModes, c => {
                  let tmp = {};
                  tmp[ac.field] = aggr[c];
                  res.push({
                    index: data[i] ? data[i].index : 0,
                    rowIndex: rowIndex,
                    rowKey: 'a' + aggIndex + '-' + (data[i] ? data[i].key : rowIndex),
                    aggregated: true,
                    name: c,
                    data: tmp
                  });
                  rowIndex++;
                  aggIndex++;
                });
              }
            });
          }
          if (isGroup && this.selection && lastInGroup && groupNumCheckboxes) {
            res[currentGroupRow].selection = true;
            res[currentGroupRow].selected = groupNumChecked === groupNumCheckboxes;
          }
          i++;
        }
        let fdata = [];
        res.forEach(d => {
          //if (d.group || d.expander || this.isExpanded(d) || d.aggregated || (this.isExpanded(d) && d.groupAggregated)) {
          if (d.group
            || d.expander
            || this.isExpanded(d)
            || d.aggregated
            || (this.isExpanded(d) && d.groupAggregated)
            || !!d.isFooter
            || (!d.expander
              && !!d.expansion
              && this.isExpanded(bbn.fn.getRow(res, {index: d.expanderIndex, expander: true}))
              && (!bbn.fn.isFunction(this.expander)
                || !!this.expander(d)))
          ) {
            if (fdata.length) {
              d.rowIndex = fdata[fdata.length - 1].rowIndex + 1;
            }
            fdata.push(d)
          }
        });
        return fdata;
      },
      /**
       * Returns true if an expander is defined or if the table is groupable and the group is 'number'.
       * @computed hasExpander
       * @returns {Boolean}
       */
      hasExpander() {
        return this.expander || (
          this.groupable &&
          (typeof this.group === 'number') &&
          this.cols[this.group]
        );
      },
      /**
       * The current columns of the table.
       * @computed currentColumns
       * @returns {Array}
       */
      currentColumns(){
        let r = [],
            cols = bbn.fn.extend(true, [], this.groupCols);
        bbn.fn.each(cols, (a, i) => {
          bbn.fn.each(a.cols, b => {
            r.push(bbn.fn.extend(true, {}, b, {
              fixed: i !== 1,
              isLeft: i === 0,
              isRight: i === 2,
              realWidth: b.realWidth ? b.realWidth + 'px' : 'auto'
            }));
          });
        });
        return r;
      },
      /**
       * Indicates whether the column for the expander should be shown
       * @computed expanderColumnVisible
       * @returns {Boolean}
       */
      expanderColumnVisible(){
        if (this.items && this.items.length){
          return !!this.items.filter(i => !!i.expander).length
        }
        return false
      },
      currentMaxRowHeight(){
        return !!this.maxRowHeight ? this.maxRowHeight + 'px' : 'auto';
      }
    },
    methods: {
      buttonSource() {
        if (bbn.fn.isFunction(this.realButtons)) {
          return this.realButtons(...arguments);
        }

        if (bbn.fn.isArray(this.realButtons)) {
          return this.realButtons;
        }

        return [];
      },
      convertActions(arr, data, col, idx){
        return bbn.fn.map(arr, a => {
          let b = bbn.fn.clone(a);
          if (a.action && bbn.fn.isFunction(a.action)) {
            b.action = e => {
              this._execCommand(a, data, col, idx, e);
            };
          }

          return b;
        });
      },
      getTrClass(row) {
        if (bbn.fn.isFunction(this.trClass)) {
          return this.trClass(row);
        }

        if (this.trClass) {

          return this.trClass;
        }

        return '';
      },
      getTrStyle(row){
        if (bbn.fn.isFunction(this.trStyle)) {
          return this.trStyle(row);
        }

        if (this.trStyle) {
          return this.trStyle;
        }

        return '';
      },
      /**
       * Normalizes the row's data.
       * @method _defaultRow
       * @param initialData
       * @returns {Object}
       */
      _defaultRow(initialData) {
        let res = {},
          data = initialData ? bbn.fn.clone(initialData) : {};
        bbn.fn.each(this.cols, function (a) {
          if (a.field) {
            if (data[a.field] !== undefined) {
              res[a.field] = data[a.field];
            }
            else if (a.default !== undefined) {
              res[a.field] = bbn.fn.isFunction(a.default) ? a.default() : a.default;
            }
            else if (a.nullable){
              res[a.field] = null;
            }
            else if (a.type) {
              switch (a.type) {
                case 'number':
                case 'money':
                  res[a.field] = a.min > 0 ? a.min : 0;
                  break;
                default:
                  res[a.field] = '';
              }
            }
            else {
              res[a.field] = '';
            }

            if (bbn.fn.isArray(res[a.field])) {
              res[a.field] = res[a.field].slice();
            }
            else if (res[a.field] instanceof(Date)) {
              res[a.field] = new Date(res[a.field].getTime());
            }
            else if ((null !== res[a.field]) && (typeof res[a.field] === 'object')) {
              res[a.field] = bbn.fn.clone(res[a.field]);
            }
          }
        });
        return res;
      },
      /**
       * Prepares the data to export the table to CSV.
       * @method _export
       * @returns {Array}
       */
      _export() {
        let span = window.document.createElement('span');
        let cols = {};
        let res = [];
        bbn.fn.each(this.currentData, a => {
          let o = bbn.fn.clone(a.data);
          let row = [];
          bbn.fn.each(this.cols, b => {
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
       * Executes the action of the button.
       *
       * @method _execCommand
       * @param {Object} button
       * @param {Object} data
       * @param {Object} col
       * @param {Number} index
       * @param {Event} ev
       * @returns {Function|Boolean}
       */
      _execCommand(button, data, col, index, ev) {
        if (ev) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
        }
        //bbn.fn.log("EXEC COMMAND");
        if (button.action) {
          if (bbn.fn.isFunction(button.action)) {
            return button.action(data, col, index);
          }
          else if (typeof (button.action) === 'string') {
            switch (button.action) {
              case 'csv':
                return this.exportCSV();
              case 'excel':
                return this.exportExcel();
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
       * Exports to csv and download the given filename.
       * @method exportCSV
       * @param {String} filename
       * @param {String} valSep
       * @param {String} rowSep
       * @param {String} valEsc
       * @fires _export
       */
      exportCSV(filename, valSep, rowSep, valEsc) {
        let data = bbn.fn.toCSV(this._export(), valSep, rowSep, valEsc);
        if (!filename) {
          filename = 'export-' + bbn.fn.dateSQL().replace('/:/g', '-') + '.csv';
        }
        bbn.fn.downloadContent(filename, data, 'csv');
      },
      /**
       * Exports to excel.
       * @method exportExcel
       * @fires getPostData
       */
      exportExcel(){
        if ( this.isAjax && !this.isLoading ){
          if ( this.pageable ){
            this.getPopup({
              title: bbn._('Warning'),
              content: '<div class="bbn-padded bbn-c">' + bbn._('What do you want to export?') + '</div>',
              buttons: [{
                text: bbn._('Cancel'),
                action: () => {
                  this.getPopup().close();
                }
              }, {
                text: bbn._('This view'),
                action: () => {
                  bbn.fn.postOut(this.source, this.getExcelPostData(true));
                  this.getPopup().close();
                }
              }, {
                text: bbn._('All'),
                action: () => {
                  bbn.fn.postOut(this.source, this.getExcelPostData());
                  this.getPopup().close();
                }
              }],
              width: 300
            });
          }
          else {
            this.confirm(bbn._('Are you sure you want to export to Excel?'), () => {
              bbn.fn.postOut(this.source, this.getExcelPostData());
            });
          }
        }
      },
      /**
       * @method getExcelPostData
       * @param {Boolean} currentView 
       * @returns {Object}
       */
      getExcelPostData(currentView){
        let cols = bbn.fn.filter(bbn.fn.extend(true, [], this.cols), c => {
              return (this.shownFields.includes(c.field) && ((c.export === undefined) || !c.export.excluded)) || (c.export && !c.export.excluded);
            }),
            data = {
              excel: {
                fields: bbn.fn.map(cols, c => {
                  return {
                    field: c.field,
                    // check if is present a custom 'title' on column's export property
                    title: c.export && c.export.title ? c.export.title : (c.title || ''),
                    // check if is present a custom 'type' on column's export property
                    type: c.export && c.export.type ? c.export.type : (c.type || 'string'),
                    hidden: (c.export && (c.export.hidden !== undefined)) ? +c.export.hidden : (!this.shownFields.includes(c.field) ? 1 : 0),
                    format: c.export && c.export.format ? c.export.format : null
                  }
                })
              },
              // the current fields
              fields: bbn.fn.map(cols.slice(), f => {
                return f.field
              }),
              limit: currentView ? this.currentLimit : 50000,
              start: currentView ? this.start : 0,
              data: this.getPostData()
            };
        if ( this.sortable ){
          data.order = this.currentOrder;
        }
        if ( this.isFilterable ){
          data.filters = this.currentFilters;
        }
        return data;
      },
      /**
       * Opens a popup showing the database query.
       * @method showQuery 
       */
      showQuery(){
        if (this.currentQuery) {
          this.getPopup({
            title: bbn._('Database query and parameters'),
            scrollable: true,
            component: {
              template: `
<div class="bbn-block bbn-spadded">
  <h3 @click="showValues = !showValues"
      v-text="showValues ? _('Hide the values') : _('Show the values')"
      class="bbn-p"></h3>
  <ol class="bbn-space-bottom" v-if="showValues">
    <li v-for="v in source.values" v-text="v"></li>
  </ol>
  <pre v-text="source.query"></pre>
</div>
              `,
              props: ['source'],
              data(){
                return {
                  showValues: false
                }
              }
            },
            closable: true,
            source: {
              query: this.currentQuery,
              values: this.currentQueryValues
            }
          })
        }
      },
      /**
       * Returns true if a column is editable.
       * @method isEditable
       * @param {Object} row
       * @param {Object} col
       * @param {Number} index
       * @returns {Boolean}
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
       * @returns {Boolean}
       */
      isEdited(data, col, idx) {
        return this.isEditable(data, col, idx) &&
          (this.editMode === 'inline') &&
          (this.items[idx].index === this.editedIndex);
      },
      /**
       * Returns the configuration for the cells of the titles of grouped columns.
       * @method titleGroupsCells
       * @param {Number} groupIndex
       * @returns {Array}
       */
      titleGroupsCells(groupIndex) {
        if (this.titleGroups) {
          let cells = [],
            group = null,
            corresp = {};
          bbn.fn.each(this.groupCols[groupIndex].cols, a => {
            if (!a.hidden) {
              if (a.group === group) {
                cells[cells.length - 1].colspan++;
                cells[cells.length - 1].width += a.realWidth;
                if (a.left !== undefined) {
                  if ((cells[cells.length - 1].left === undefined)
                    || (a.left < cells[cells.length - 1].left)
                  ) {
                    cells[cells.length - 1].left = a.left;
                  }
                }
                if (a.right !== undefined) {
                  if ((cells[cells.length - 1].right === undefined)
                    || (a.right < cells[cells.length - 1].right)
                  ) {
                    cells[cells.length - 1].right = a.right;
                  }
                }
              }
              else {
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
                    width: a.realWidth,
                    left: a.left !== undefined ? a.left : undefined,
                    right: a.right !== undefined ? a.right : undefined
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
                    width: a.realWidth,
                    left: a.left !== undefined ? a.left : undefined,
                    right: a.right !== undefined ? a.right : undefined
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
       * @returns {Boolean}
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
       * The behavior of the component at mouseMove.
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
       * Handles the floatingFilterTimeOut.
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
       * Retuns the popup object.
       * @method getPopup
       * @returns {Object}
       */
      getPopup() {
        if (this.popup) {
          return arguments.length ? this.popup.open(...arguments) : this.popup;
        }

        return bbn.wc.mixins.basic.getPopup.apply(this, arguments);
      },
      /**
       * Returns the options for the bind of the table filter.
       *
       * @method getFilterOptions
       * @fires getColFilters
       * @returns {Object}
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
        this.getPopup({
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
            fields: bbn.fn.filter(this.cols, a => {
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
       * @returns {Object}
       */
      getColFilters(col) {
        let r = [];
        if (col.field) {
          bbn.fn.each(this.currentFilters.conditions, a => {
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
        this.filterElement = ev.target
        this.floatingFilterX = (ev.pageX - 10) < 0
          ? 0
          : ((ev.pageX - 10 + 600) > this.$el.clientWidth
            ? this.$el.clientWidth - 600
            : ev.pageX - 10);
        this.floatingFilterY = (ev.pageY - 10) < 0
          ? 0
          : ((ev.pageY - 10 + 200) > this.$el.clientHeight
            ? this.$el.clientHeight - 200
            : ev.pageY - 10);
        this.currentFilter = col;
      },
      /**
       * Returns the list of the showable columns
       * @method pickableColumnList
       * @returns {Array}
       */
      pickableColumnList() {
        return this.cols.slice().map(a => {
          return a.showable !== false;
        });
      },
      /**
       * Opens the popup containing the column picker.
       * @method openColumnsPicker
       */
      openColumnsPicker() {
        let table = this;
        this.getPopup({
          title: bbn._("Columns' picker"),
          height: '90%',
          width: '90%',
          component: {
            template: `
<div class="bbn-table-column-picker">
  <bbn-form ref="scroll"
            :source="formData"
            :scrollable="true"
            :prefilled="true"
            @success="applyColumnsShown">
    <div class="bbn-padded">
      <ul v-if="source.titleGroups">
        <li v-for="(tg, idx) in source.titleGroups">
          <h3>
            <bbn-checkbox :checked="allVisible(tg.value)"
                          @change="checkAll(tg.value)"
                          :label="tg.text"/>
          </h3>
          <ul>
            <li v-for="(col, i) in source.cols"
                v-if="!col.fixed && (col.group === tg.value) && (col.showable !== false) && (col.title || col.ftitle)">
              <bbn-checkbox :checked="shownCols[i]"
                            @change="check(col, i)"
                            :label="col.ftitle || col.title"
                            :contrary="true"/>
            </li>
          </ul>
        </li>
      </ul>
      <ul v-else>
        <li v-for="(col, i) in source.cols"
            v-if="!col.fixed && (col.showable !== false) && (col.title || col.ftitle)">
          <bbn-checkbox :checked="shownCols[i]"
                        @change="check(col, i)"
                        :label="col.ftitle || col.title"
                        :contrary="true"/>
        </li>
      </ul>
    </div>
  </bbn-form>
</div>
`,
            props: ['source'],
            data() {
              let shownColumns = this.source.cols.map(a => !a.hidden);
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
                bbn.fn.each(this.source.cols, (a, i) => {
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
                bbn.fn.each(this.source.cols, (a, i) => {
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
                bbn.fn.each(this.source.cols, (a, i) => {
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
       * Returns wheter or not the cell is grouped.
       * @method isGroupedCell
       * @param {Number} groupIndex
       * @param {Object} row
       * @returns {Boolean}
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
       * Returns the current configuration of the table.
       * @method getConfig
       * @returns {Object}
       */
      getConfig() {
        return {
          searchValue: this.searchValue,
          limit: this.currentLimit,
          order: this.currentOrder,
          filters: this.currentFilters,
          hidden: this.currentHidden
        };
      },
      /**
       * Returns the columns configuration.
       * @method getColumnsConfig
       * @returns {Array}
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
        }
        else if (cfg === true) {
          cfg = this.getConfig();
        }
        if (cfg && cfg.limit) {
          if (this.filterable && cfg.filters && (this.currentFilters !== cfg.filters)) {
            this.currentFilters = cfg.filters;
          }
          if (this.pageable && (this.currentLimit !== cfg.limit)) {
            this.currentLimit = cfg.limit;
          }
          if (this.search) {
            this.searchValue = cfg.searchValue || '';
          }
          if (this.sortable && (this.currentOrder !== cfg.order)) {
            if (bbn.fn.isObject(cfg.order)) {
              let currentOrder = [];
              bbn.fn.iterate(cfg.order, (v, n) => {
                currentOrder.push({field: n, dir: v.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'});
              });
              this.currentOrder = currentOrder;
            }
            else if (bbn.fn.isArray(cfg.order)) {
              this.currentOrder = cfg.order;
            }
          }
          if (this.showable) {
            if ((cfg.hidden !== undefined) && (cfg.hidden !== this.currentHidden)) {
              this.currentHidden = cfg.hidden;
            }
            bbn.fn.each(this.cols, (a, i) => {
              let hidden = (this.currentHidden.indexOf(i) > -1);
              if (a.hidden !== hidden) {
                //bbn.fn.log("CHANGING HIDDEN");
                this.$set(this.cols[i], 'hidden', hidden);
              }
            });
          }
          this.currentConfig = {
            searchValue: this.searchValue,
            limit: this.currentLimit,
            order: this.currentOrder,
            filters: this.currentFilters,
            hidden: this.currentHidden
          };
          if (!no_storage) {
            this.setStorage(this.currentConfig);
          }

          this.$forceUpdate();
        }
      },
      /**
       * Saves the current configuration.
       * @method save
       */
      save() {
        this.savedConfig = this.jsonConfig;
      },
      beforeSelect(index, ev) {
        this.$emit('beforeselect', ev, index, this.items[index]);
      },
      /**
       * Emits 'select',  'unselect' or 'toggle' at change of checkbox of the row in a selectable table.
       * @method checkSelection
       * @param {Number}  index
       * @param {Boolean} index
       * @emit unselect
       * @emit select
       * @emit toggle
       */
      checkSelection(index, state) {
        if (this.cancelSelection) {
          this.cancelSelection = false;
          return;
        }

        let row = this.items[index];
        if (row) {
          if (this.groupable && row.group) {
            if (row.expanded) {
              bbn.fn.fori((d, i) => {
                if (d && d.selection && (d.data[this.cols[this.group].field] === row.value)) {
                  this.checkSelection(i, state)
                }
              }, this.items, index + row.num, index + 1)
            }
          }
          else if (row.selection) {
            let idx = this.currentSelected.indexOf(this.uid ? this.currentData[row.index].data[this.uid] : row.index);
            let isSelected = false;
            let toggled = false;
            if (idx > -1) {
              if ([undefined, false].includes(state)) {
                toggled = true;
                this.$emit('unselect', row.data);
                this.currentSelected.splice(idx, 1);
              }
            }
            else if ([undefined, true].includes(state)) {
              toggled = true;
              this.$emit('select', row.data);
              this.currentSelected.push(this.uid ? this.currentData[row.index].data[this.uid] : row.index);
              isSelected = true;
            }
            if (toggled) {
              this.$emit('toggle', isSelected, this.currentData[row.index].data);
            }
          }
        }
      },
      /**
       * Refresh the current data set.
       *
       * @method updateData
       * @param withoutOriginal
       * @fires _removeTmp
       * @fires init
       */
      updateData(withoutOriginal) {
        /** Mini reset?? */
        this.isTableDataUpdating = true;
        this.allRowsChecked = false;
        this.currentExpanded = [];
        this._removeTmp();
        this.editedRow = false;
        this.editedIndex = false;
        this.$forceUpdate();
        return bbn.wc.mixins.list.methods.updateData.apply(this, [withoutOriginal]).then(() => {
          if (this.currentData.length && this.selection && this.currentSelected.length && !this.uid) {
            this.currentSelected = [];
          }

          if (this.editable) {
            this.originalData = JSON.parse(JSON.stringify(this.currentData.map(a => {
              return a.data;
            })));
          }

          this.isTableDataUpdating = false;
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
          this.originalData &&
          this.originalData[row.index] &&
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
        let tr = this.trClass ? (bbn.fn.isFunction(this.trClass) ? this.trClass(data) : this.trClass) : '';
        if (column.cls) {
          return (!!tr ? (tr + ' ') : '') + (bbn.fn.isFunction(column.cls) ? column.cls(data, index, column) : column.cls);
        }
        return tr || '';
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
       * Deprecated. Not removed for backwards compatibility.
       * @method updateTable
       */
      updateTable() {
        return;
      },
      /**
       * Renders a cell according to column's config.
       * @method render
       * @param {Object} data
       * @param {Object} column
       * @param {Number} index
       * @fires renderData
       * @returns {Function}
       */
      render(data, column, index) {
        let value = data && this.isValidField(column.field) ? data[column.field] : undefined;
        if (column.render) {
          return column.render(data, column, index, value)
        }
        return this.renderData(data, column, index);
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
        this.$emit('reset', this);
        if (!noCfg) {
          this.setConfig(false);
        }
        this.$nextTick(() => {
          this.init();
        })
      },
      /**
       * Adds the given column to table's configuration
       * @method addColumn
       * @param {Object} obj
       */
      addColumn(obj) {
        let def = this.defaultObject();
        if (obj.aggregate && !Array.isArray(obj.aggregate)) {
          obj.aggregate = [obj.aggregate];
        }
        for (let n in obj) {
          def[bbn.fn.camelize(n)] = obj[n];
        }
        if (!!obj.buttons) {
          def.filterable = false;
          def.sortable = false;
        }
        this.cols.push(def);
      },
      /**
       * Return true if the cell is before aggregated cells.
       * @method isBeforeAggregated
       * @param {Number} groupIndex
       * @param {Number} idx
       * @returns {Boolean}
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
       * Returns an object of numbers as width and height based on whatever unit given.
       * 
       * @method getDimensions
       * @param {Number} width
       * @param {Number} height
       * @return {Number}
       */
      getDimensionWidth(width) {
        if (bbn.fn.isNumber(width) && width) {
          return parseInt(width);
        }

        let parent = this.$el || this.$root.$el;
        let r = 0;

        if (parent && width) {
          if (!parent.insertAdjacentElement) {
            return 0;
          }

          let el = document.createElement('div');
          el.style.position = 'absolute';
          el.style.opacity = 0;
          el.className = 'bbn-reset'
          el.style.width = this.formatSize(width);
          try {
            parent.insertAdjacentElement('beforeend', el);
          }
          catch (e){
            bbn.fn.log("Error while inserting adjacent element for dimensioncalculation", e, this.$el);
            return 0;
          }
          r = el.offsetWidth || el.clientWidth || 0;
          el.remove();
        }

        return r;
      },
      /**
       * Resizes the table.
       * @method resizeWidth
       * @returns {Object}
       */
      resizeWidth(){
        let currentTot = this.groupCols[0].width + this.groupCols[1].width + this.groupCols[2].width,
            parentWidth = this.$el.offsetParent ? this.$el.offsetParent.getBoundingClientRect().width : this.lastKnownCtWidth,
            diff =  parentWidth - this.borderLeft - this.borderRight - currentTot,
            numDynCols = this.currentColumns.filter(c => (c.width === undefined) && !c.isExpander && !c.isSelection && !c.hidden).length,
            numStaticCols = this.currentColumns.filter(c => !!c.width && !c.isExpander && !c.isSelection && !c.hidden).length,
            newWidth = numDynCols || numStaticCols
              ? (diff / (numDynCols || numStaticCols))
              : 0;
        if (newWidth) {
          this.isResizingWidth = true;
          bbn.fn.each(this.groupCols, (groupCol, groupIdx) => {
            let sum = 0,
                sumRight= 0,
                sumLeft = 0;
            bbn.fn.each((groupIdx !== 2) ? groupCol.cols : groupCol.cols.slice().reverse(), col => {
              if (!col.hidden) {
                if (!col.isExpander
                  && !col.isSelection
                  && ((!!numDynCols && (col.width === undefined))
                    || (!numDynCols && !!numStaticCols && !!col.width))
                ) {
                  let tmp = col.realWidth + newWidth;
                  if ((col.width !== undefined)
                    && (!bbn.fn.isString(col.width)
                      || bbn.fn.isNumber(bbn.fn.substr(col.width, -1)))
                  ) {
                    if (tmp < parseFloat(col.width)) {
                      tmp = parseFloat(col.width);
                    }
                  }
                  else if (tmp < (bbn.fn.isMobile() ? this.minimumColumnWidthMobile : this.minimumColumnWidth)) {
                    tmp = bbn.fn.isMobile()
                      ? this.minimumColumnWidthMobile
                      : this.minimumColumnWidth;
                  }
                  let minWidth = this.getDimensionWidth(col.minWidth);
                  let maxWidth = this.getDimensionWidth(col.maxWidth);
                  if (col.minWidth && (tmp < minWidth)) {
                    tmp = minWidth;
                  }
                  if (col.maxWidth && (tmp > maxWidth)) {
                    tmp = maxWidth;
                  }

                  this.$set(col, 'realWidth', tmp);
                }
                sum += col.realWidth;
                if (groupIdx === 0) {
                  this.$set(col, 'left', sumLeft);
                  sumLeft += col.realWidth;
                }

                if (groupIdx === 2) {
                  this.$set(col, 'right', sumRight);
                  sumRight += col.realWidth;
                }
              }
            })
            this.$set(this.groupCols[groupIdx], 'width', sum);
            sum = 0;
            sumLeft = 0;
            sumRight = 0;
          });
          this.isResizingWidth = false;
        }

        return this;
      },
      /**
       * Returns if the given row is expanded.
       * @method isExpanded
       * @param {Object} d
       * @returns {boolean}
       */
      isExpanded(d) {
        if (this.allExpanded) {
          return true;
        }
        if (!this.expander && ((this.group === false) || !this.groupable)) {
          return true;
        }
        if (this.expander && !this.groupable) {
          return this.currentExpanded.includes(d.index);
        }
        if (
          this.groupable &&
          (this.group !== false) &&
          this.cols[this.group] &&
          this.cols[this.group].field
        ) {
          if (d.data[this.cols[this.group].field] !== undefined) {
            return this.currentExpandedValues.includes(d.data[this.cols[this.group].field]);
          }
          return true;
        }
        if ((d.isGrouped || d.groupAggregated)
          && this.currentExpanded.includes(d.link)
        ) {
          return true;
        }
        return false;
      },
      /**
       * Toggles the expander of the row corresponding to the given idx.
       * @method toggleExpanded
       * @param {Number} idx
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
            (this.currentData[idx].data[this.cols[this.group].field] !== undefined)
          ) {
            let groupValue = this.currentData[idx].data[this.cols[this.group].field],
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
       * Returns wheter or not the given row has the expander.
       * @method rowHasExpander
       * @param d
       * @returns {Boolean}
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
       * Returns true if the given index is selected.
       * @method isSelected
       * @param {Number} index
       * @returns {Boolean}
       */
      isSelected(index) {
        return this.selection
          && ((!this.uid && this.currentSelected.includes(index))
            || (this.uid && this.currentSelected.includes(this.currentData[index].data[this.uid]))
          );
      },
      /**
       * Returns true if the given row has td.
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
       * @param {Boolean} with_data
       * @fires updateData
       * @fires keepCool
       */
      init(with_data) {
        this.keepCool(() => {
          this.initStarted = true;
          this.setContainerMeasures();
          this.setResizeMeasures();
          let groupCols = [
                {
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
              numUnknown = 0,
              colButtons = false,
              isAggregated = false,
              aggregatedColIndex = false,
              aggregatedColTitle = false,
              aggregatedColumns = [],
              parentWidth = this.$el.offsetParent ? this.$el.offsetParent.getBoundingClientRect().width : this.lastKnownCtWidth;
          this.groupCols.splice(0);
          this.$set(this, 'groupCols', bbn.fn.clone(groupCols));
          bbn.fn.each(this.cols, a => {
            a.realWidth = 0;
          });
          this.$nextTick(() => {
            bbn.fn.each(this.cols, (a, i) => {
              if (!a.hidden && (!this.groupable || (this.group !== i))) {
                let minWidth = null;
                let maxWidth = null;
                if (a.minWidth) {
                  minWidth = this.getDimensionWidth(a.minWidth)
                }
                if (a.maxWidth) {
                  maxWidth = this.getDimensionWidth(a.maxWidth)
                }
                a.index = i;
                if (a.hidden) {
                  a.realWidth = 0;
                }
                else {
                  if (this.aggregate && a.aggregate ) {
                    if ( aggregatedColIndex === false ){
                      aggregatedColIndex = i;
                      isAggregated = true;
                    }
                    aggregatedColumns.push(a);
                  }
                  if ( a.width ){
                    if (bbn.fn.isString(a.width) && (bbn.fn.substr(a.width, -1) === '%')) {
                      a.realWidth = Math.floor(parentWidth * this.getDimensionWidth(a.width) / 100);
                      if ( a.realWidth < (bbn.fn.isMobile() ? this.minimumColumnWidthMobile : this.minimumColumnWidth) ){
                        a.realWidth = bbn.fn.isMobile() ? this.minimumColumnWidthMobile : this.minimumColumnWidth;
                      }
                    }
                    else {
                      a.realWidth = this.getDimensionWidth(a.width);
                    }
                  }
                  else {
                    a.realWidth = bbn.fn.isMobile()
                      ? this.minimumColumnWidthMobile
                      : this.minimumColumnWidth;
                    numUnknown++;
                  }
                  if (minWidth && (a.realWidth < minWidth)) {
                    a.realWidth = minWidth;
                  }
                  if (maxWidth && (a.realWidth > maxWidth)) {
                    a.realWidth = maxWidth;
                  }
                  if ( a.buttons !== undefined ) {
                    colButtons = i;
                  }
                  if (a.fixed) {
                    if ((a.fixed === 'left')
                      || ((a.fixed !== 'right') && (this.fixedDefaultSide === 'left'))
                    ) {
                      if ( a.buttons !== undefined ) {
                        //colButtons = groupCols[0].cols.length;
                      }
                      groupCols[0].cols.push(a);
                      if (!a.hidden) {
                        groupCols[0].visible++;
                      }
                    }
                    else {
                      if ( a.buttons !== undefined ) {
                        //colButtons = groupCols[0].cols.length + groupCols[1].cols.length + groupCols[2].cols.length;
                      }
                      groupCols[2].cols.push(a);
                      if (!a.hidden) {
                        groupCols[2].visible++;
                      }
                    }
                  }
                  else {
                    if ( a.buttons !== undefined ) {
                      //colButtons = groupCols[0].cols.length + groupCols[1].cols.length;
                    }
                    groupCols[1].cols.push(a);
                    if (!a.hidden) {
                      groupCols[1].visible++;
                    }
                  }
                }
              }
            });
            let firstGroup = groupCols[0].visible ? 0 : 1;
            if (this.selection) {
              let o = {
                isExpander: false,
                isSelection: true,
                title: ' ',
                filterable: false,
                width: 40,
                realWidth: 40
              };
              if ( firstGroup === 0 ){
                o.fixed = true;
                o.isLeft = true;
              }
              groupCols[firstGroup].cols.unshift(o);
              groupCols[firstGroup].visible++;
            }
            if (this.hasExpander) {
              let o = {
                isExpander: true,
                isSelection: false,
                title: ' ',
                filterable: false,
                width: 30,
                realWidth: 30
              };
              if ( firstGroup === 0 ){
                o.fixed = true;
                o.isLeft = true;
              }
              groupCols[firstGroup].cols.unshift(o);
              groupCols[firstGroup].visible++;
            }

            let tot = 0;
            bbn.fn.each(groupCols, a => {
              a.sum = bbn.fn.sum(a.cols, 'realWidth');
              tot += a.sum;
            });

            let styles = window.getComputedStyle(this.$el),
                borderLeft = styles.getPropertyValue('border-left-width').slice(0, -2),
                borderRight = styles.getPropertyValue('border-right-width').slice(0, -2),
                toFill = parentWidth - borderLeft - borderRight - tot;
            this.borderLeft = borderLeft;
            this.borderRight = borderRight;
            // We must arrive to 100% minimum
            if (toFill > 0) {
              if (numUnknown) {
                let newWidth = toFill / numUnknown;
                if (newWidth < (bbn.fn.isMobile() ? this.minimumColumnWidthMobile : this.minimumColumnWidth)) {
                  newWidth = bbn.fn.isMobile() ? this.minimumColumnWidthMobile : this.minimumColumnWidth;
                }
                let maxPreAggregatedWidth = 0;
                bbn.fn.each(this.cols, (a, i) => {
                  if (!a.hidden) {
                    if (!a.width) {
                      a.realWidth = newWidth + (bbn.fn.isMobile() ? this.minimumColumnWidthMobile : this.minimumColumnWidth);
                    }
                    if ( isAggregated && (i < aggregatedColIndex) && (a.realWidth >= maxPreAggregatedWidth) ){
                      maxPreAggregatedWidth = a.realWidth;
                      aggregatedColTitle = a;
                    }
                  }
                });
              }
              // Otherwise we dispatch it through the existing column
              else {
                let num = this.numVisible;
                let ignore = 0;
                if ( this.hasExpander ){
                  num--;
                  ignore++;
                }
                if ( this.selection ){
                  num--;
                  ignore++;
                }
                //let bonus = Math.floor(toFill / num * 100) / 100;
                let bonus = toFill / num;
                let maxPreAggregatedWidth = 0;
                bbn.fn.each(this.cols, (a, i) => {
                  if ( !a.hidden && (i >= ignore) ){
                    a.realWidth += bonus;
                    if ( isAggregated && (i < aggregatedColIndex) && (a.realWidth >= maxPreAggregatedWidth) ){
                      maxPreAggregatedWidth = a.realWidth;
                      aggregatedColTitle = a;
                    }
                  }
                });
              }
            }
            if ( aggregatedColTitle ){
              aggregatedColTitle.isAggregatedTitle = true;
            }

            let sum = 0,
                sumLeft = 0,
                sumRight = 0;
            bbn.fn.each(groupCols, (a, i) => {
              bbn.fn.each((i !== 2) ? a.cols : a.cols.slice().reverse(), c => {
                if ( !c.hidden ){
                  sum += c.realWidth;
                  if ( i === 0 ){
                    c.left = sumLeft;
                    sumLeft += c.realWidth;
                  }
                  else if ( i === 2 ){
                    c.right = sumRight;
                    sumRight += c.realWidth;
                  }
                }
              });
              a.width = sum;
              sum = 0;
              sumLeft = 0;
              sumRight = 0;
            });
            this.groupCols.splice(0);
            this.$set(this, 'groupCols', groupCols);
            this.colButtons = colButtons;
            this.isAggregated = isAggregated;
            this.aggregatedColumns = aggregatedColumns;
            this.resizeWidth();
            this.$nextTick(() => {
              this.initReady = true;
              if (with_data) {
                this.$once('dataloaded', () => {
                  this.initStarted = false;
                });
                this.updateData();
              }
              else{
                this.initStarted = false;
              }
            });
          });
        }, 'init', 1000);
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
       * Show or hide the given column index.
       * @method show
       * @param {Array} colIndexes
       * @param {Boolean} hide
       * @fires $forceUpdate
       * @fires setConfig
       * @fires init
       */
      show(colIndexes, hide) {
        if (!Array.isArray(colIndexes)) {
          colIndexes = [colIndexes];
        }
        bbn.fn.each(colIndexes, colIndex => {
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
       * @return {String}
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
       * @returns {Object}
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
       * Returns the html element of the given row index.
       * @method getTr
       * @param {Number} i
       * @returns {String}
       */
      getTr(i) {
        let row = false;
        if (bbn.fn.isNumber(i)) {
          bbn.fn.each(this.getRef('tbody').rows, tr => {
            if (tr.getAttribute('index') == i) {
              row = tr;
              return true;
            }
          });
        }
        return row;
      },
      /**
       * Returns an object of the default values for the different types of fields.
       * @method defaultObject
       * @returns {Object}
       */
      defaultObject() {
        let o = {};
        bbn.fn.iterate(bbn.wc.mixins.field.props, (v, n) => {
          if (v.default !== undefined) {
            o[n] = bbn.fn.isFunction(v.default) ? v.default() : v.default;
          }
        })
        return o;
      },
      /**
       * Returns true if the filter should be shown on the given column.
       * @method showFilterOnColumn
       * @param {Object} col
       * @returns {Boolean}
       */
      showFilterOnColumn(col) {
        if (!this.filterable || (col.filterable === false) || col.hideFilter) {
          return false;
        }

        if (col.filterable === true) {
          return true;
        }

        return !col.buttons && col.field;
      },
      /**
       * Focuses the given row index.
       * @method focusRow
       * @param {Event} ev
       * @param {Number} idx
       */
      focusRow(ev, idx) {
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
        if (ev.target.tagName !== 'BUTTON') {
          this.focusedRow = false;
        }
      },
      /**
       * @method clickCell
       * @param {Object} col
       * @param {Number} colIndex
       * @param {Number} dataIndex
       * @emits click-row
       * @emits click-cell
       */
      clickCell(col, colIndex, dataIndex) {
        if (this.filteredData[dataIndex]) {
          this.$emit('click-row', this.filteredData[dataIndex].data, dataIndex);
          this.$emit('click-cell', col, colIndex, dataIndex);
        }
      },
      /**
       * @method dbclickCell
       * @param {Object} col
       * @param {Number} colIndex
       * @param {Number} dataIndex
       */
      dbclickCell(col, colIndex, dataIndex, data, itemIndex, force) {
        if (this.zoomable && (!!col.zoomable || force)) {
          let obj = {
            title: col.title || col.ftitle,
            minHeight: '20%',
            minWidth: '20%'
          };
          if (!!col.component) {
            obj.component = col.component;
            obj.source = bbn.fn.isFunction(col.mapper) ? col.mapper(data) : data;
            obj.componentOptions = col.options;
          }
          else if (bbn.fn.isFunction(col.render)) {
            obj.content = `<div class="bbn-spadded">${col.render(data, col, itemIndex)}</div>`;
          }
          else {
            obj.content = `<div class="bbn-spadded">${data.text}</div>`;
          }
          this.getPopup().open(obj);
        }
      },
      /**
       * Removes the focus from the given row.
       * @param {Number} idx 
       */
      focusout(idx){
        this.clickedTd = null;
        if ((idx === undefined) || (idx === this.focusedRow)) {
          this.focused = false;
          //this.focusedElement = undefined;
          setTimeout(() => {
            if (!this.focused) {
              this.focusedRow = false;
            }
          }, 50);
        }
      },
      /**
       * Focuses the given row.
       * @param {Number} idx 
       * @param {Event} e 
       */
      focusin(idx, e) {
        if (!e.target.closest('td')
          || !e.target.closest('td').classList.contains('bbn-table-buttons')
          || e.target.closest('td').classList.contains('bbn-table-edit-buttons')
        ) {
          this.focused = true;
          this.clickedTd = e.target;
          //this.setFocusedElement(e)
          if (this.focusedRow !== idx) {
            this.focusedRow = idx;
          }
        }
      },
      listOnBeforeMount(){
        
      },
      checkAll(){
        bbn.fn.each(this.items, (a, i) => {
          this.checkSelection(i, true);
        })
      },
      uncheckAll(){
        bbn.fn.each(this.items, (a, i) => {
          this.checkSelection(i, false);
        })
      },
      getDataIndex(itemIndex){
        return this.items[itemIndex] ? this.items[itemIndex].index : -1;
      },
      setFocusedElement(ev){
        if (this.editable
          && (this.editMode === 'inline')
          && (this.tmpRow || this.editedRow)
          && (ev.target.tagName !== 'TR')
          && (ev.target.tagName !== 'TD')
        ) {
          let e = ev.target.closest('td'),
              pos = e.getBoundingClientRect();
          this.focuseElementX = pos.x;
          this.focusedElementY = pos.y - pos.height;
          this.focusedElement = ev.target;
        }
      },
      getColOptions(data, col, idx) {
        if (col.options) {
          return bbn.fn.isFunction(col.options) ?
            col.options(data, col, idx) : col.options;
        }

        return {};
      },
      /**
       * The method called on a column resize (by user)
       * @method onUserResize
       * @param {Event} e
       * @fires $forceUpdate
       */
      onUserResize(e){
        let d = e.target._bbn.directives.resizable.options.data,
            nextCol = this.groupCols[d.groupColIndex].cols[d.columnIndex + 1],
            nextColSize = nextCol ? nextCol.realWidth + e.detail.movement : 0;
        if ((d.column.realWidth !== e.detail.size)
          && (e.detail.size >= this.defaultColumnWidth)
          && (!nextCol || (nextColSize >= this.defaultColumnWidth))
        ) {
          this.groupCols[d.groupColIndex].cols[d.columnIndex].realWidth = e.detail.size;
          if (nextCol) {
            this.groupCols[d.groupColIndex].cols[d.columnIndex + 1].realWidth = nextColSize;
          }
          this.$forceUpdate();
        }
      }
    },
    /**
     * Adds bbns-column from the slot and sets the initial configuration of the table.
     * @event created
     * @fires addColumn
     * @fires setConfig
     * @fires getStorage
     */
     created(){
      this.componentClass.push('bbn-resize-emitter');
      // Adding bbns-column from the slot
      if (this.$slots.default) {
        for (let node of this.$slots.default) {
          /** @todo Check when used: when in DOM? Not sure */
          if (
            node.componentOptions &&
            (node.componentOptions.tag === 'bbns-column')
          ) {
            this.addColumn(node.componentOptions.propsData);
          }
          // Regular bbn-column case
          else if (
            (node.tag === 'bbns-column') &&
            node.data && node.data.attrs
          ) {
            this.addColumn(node.data.attrs);
          }
          /** @todo Check if inserting tr in the slot works */
          else if (node.tag === 'tr') {
            this.hasTrSlot = true
          }
        }
      }
      if (this.columns.length) {
        bbn.fn.each(this.columns, a => this.addColumn(a))
      }

      if (this.defaultConfig.hidden === null) {
        let tmp = [];
        let initColumn = [];
        bbn.fn.each(this.cols, (a, i) => {
          if (a.hidden) {
            tmp.push(i);
          }
          else if (initColumn.length <= 10) {
            initColumn.push(i);
          }
        });
        this.defaultConfig.hidden = tmp;
      }

      this.setConfig(false, true);
      this.initialConfig = this.jsonConfig;
      this.savedConfig = this.jsonConfig;
      let cfg = this.getStorage();
      if (cfg) {
        this.setConfig(cfg, true);
      }

      this.$on('addTmp', () => {
        let scroll = this.getRef('scroll');
        if (bbn.fn.isVue(scroll)
          && bbn.fn.isFunction(scroll.scrollStartY)
          && bbn.fn.isFunction(scroll.scrollStartX)
        ) {
          scroll.scrollStartY();
          scroll.scrollStartX();
        }
      })
    },
    /**
     * After the initialization of the component sets the property ready on true.
     * @event mounted
     * @fires init
     * @fires updateData
     */
    mounted() {
      this.container = this.getRef('container');
      this.marginStyleSheet = document.createElement('style');
      document.body.appendChild(this.marginStyleSheet);
      this.isTable = !!this.closest('bbn-table');
      let floater = this.closest('bbn-floater');
      if (floater) {
        if ( floater.ready ){
          this.init();
          this.$once('dataloaded', () => {
            this.ready = true;
            this.setResizeEvent();
            floater.onResize();
          });
        }
        else {
          floater.$on('ready', () => {
            this.init();
            this.$once('dataloaded', () => {
              this.ready = true;
              this.setResizeEvent();
              floater.onResize();
            });
          });
        }
        if (this.isAutobind) {
          this.updateData();
        }
      }
      else{
        this.$once('dataloaded', () => {
          this.ready = true;
        });
        this.$nextTick(() => {
          this.init(!!this.isAutobind);
        })
      }
    },
    watch: {
      columns() {
        if (this.ready) {
          this.cols.splice(0, this.cols.length);
          if (this.columns.length) {
            bbn.fn.each(this.columns, a => this.addColumn(a))
          }
          if (this.defaultConfig.hidden === null) {
            let tmp = [];
            let initColumn = [];
            bbn.fn.each(this.cols, (a, i) => {
              if (a.hidden) {
                tmp.push(i);
              }
              else if (initColumn.length <= 10) {
                initColumn.push(i);
              }
            });
            this.defaultConfig.hidden = tmp;
          }

          this.init();
        }
      },
      /**
       * Updates the data.
       * @watch observerValue
       * @fires updateData
       */
      /*observerValue(newVal) {
        if ((newVal !== this._observerReceived) && !this.editedRow) {
          this._observerReceived = newVal;
          //bbn.fn.log("watch observerValue");
          this.updateData();
        }
      },*/
      /**
       * Updates the data.
       * @watch observerDirty
       * @fires updateData
       */
      observerDirty(v) {
        if (v && !this.editedRow) {
          this.observerDirty = false;
          this.updateData();
        }
      },
      allRowsChecked(v){
        if (v) {
          this.checkAll();
        }
        else if (!this.isTableDataUpdating) {
          this.uncheckAll();
        }
      },
      /**
       * Forces the update of the component.
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
       * @fires edit
       * @emit change
       * @emit focus
       * @emit focusout
       */
      focusedRow(newIndex, oldIndex) {
        if (bbn.fn.isNumber(oldIndex)) {
          this.$emit('focusout', oldIndex, this.items[oldIndex] ? this.items[oldIndex].index : undefined);
        }
        if (this.items[newIndex]) {
          this.$emit('focus', this.items[newIndex].data, newIndex, this.items[newIndex].index);
        }
        if (this.editable && (this.editMode === 'inline')) {
          if (bbn.fn.isNumber(oldIndex) && this.items[oldIndex]) {
            let idx = this.items[oldIndex].index;
            if ((this.editedIndex === idx)
              && ((idx === -1) || this.isModified(idx))
            ) {
              if (this.autoSave) {
                this.saveInline();
              }
              else if (this.autoReset){
                this.cancel();
              }
              else {
                this.$emit('change', this.items[oldIndex].data, idx);
              }
            }
          }
          this.editedRow = false;
          if (bbn.fn.isNumber(newIndex)
            && this.items[newIndex]
            && !this.items[newIndex].group
            && !this.items[newIndex].expander
          ) {
            let comeFromAfter = bbn.fn.isNumber(oldIndex) && (newIndex === (oldIndex - 1));
            this.$nextTick(() => {
              this.edit(this.items[newIndex].data, null, newIndex);
              this.$nextTick(() => {

                let ele = this.clickedTd || this.getTr(newIndex);
                let nextInputs = ele ? ele.querySelectorAll('input') : [];
                let nextInput;
                bbn.fn.each(nextInputs, a => {
                  if (a.offsetWidth) {
                    nextInput = a;
                    if (!comeFromAfter) {
                      return false;
                    }
                  }
                });
                if (nextInput) {
                  nextInput.focus();
                }
              });
            });
          }
        }
      },
      /**
       * @watch lastKnownCtWidth
       * @fires resizeWidth
       */
      lastKnownCtWidth(){
        if (this.groupCols.length
          && !this.initStarted
          && (this.groupCols[0].cols.length
            || this.groupCols[1].cols.length
            || this.groupCols[2].cols.length)
        ) {
          this.$nextTick(() => {
            this.resizeWidth();
          })
        }
      }
    },
    components: {
      /**
       * @component table-dots
       */
      tableDots: {
        name: 'table-dots',
        template: `
<div class="bbn-c bbn-lg"
     @click="table.dbclickCell(source.column, source.index, source.dataIndex, source.data, source.itemIndex, true)"
     :style="{display: visible ? 'block !important' : 'none !important'}">
  <i class="nf nf-mdi-dots_horizontal bbn-p bbn-primary-text-alt"/>
</div>
        `,
        props: {
          /**
           * @prop {Object} source
           * @memberof bbn-table-dots
           */
          source: {
            type: Object
          }
        },
        data(){
          return {
            /**
           * @data {Boolean} [false] visible
           * @memberof bbn-table-dots
           */
            visible: false,
            /**
           * @data {Vue} table
           * @memberof bbn-table-dots
           */
            table: this.closest('bbn-table')
          }
        },
        methods: {
          /**
           * @method {Object} checkVisibility
           * @memberof bbn-table-dots
           */
          checkVisibility(){
            if (this.table.maxRowHeight && this.table.zoomable) {
              let td = this.$el.closest('td');
              if (!!td && !!td.firstElementChild && !!td.firstElementChild.firstElementChild) {
                let styleFirst = window.getComputedStyle(td.firstElementChild),
                    styleSecond = window.getComputedStyle(td.firstElementChild.firstElementChild);
                this.visible = (parseFloat(styleSecond.height) + parseFloat(styleFirst.paddingTop) + parseFloat(styleFirst.paddingBottom)) > this.table.maxRowHeight;
                if (this.visible) {
                  td.firstElementChild.firstElementChild.style.setProperty('height', 'calc(' + this.table.maxRowHeight + 'px - 2.3rem)');
                  td.firstElementChild.firstElementChild.style.overflow = 'hidden';
                }
              }
            }
            else {
              this.visible = false;
            }
          }
        },
        /**
         * @event mounted
         * @memberof bbn-table-dots
         * @fires checkVisibility
         */
        mounted(){
          this.$nextTick(() => {
            this.checkVisibility();
          });
        }
      }
    }
  };
