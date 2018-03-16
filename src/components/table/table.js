/**
 * Created by BBN on 14/02/2017.
 */
(function($, bbn){
  "use strict";

  const METHODS4BUTTONS = ['insert', 'select', 'edit', 'add', 'copy', 'delete'];

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-table', {
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.resizerComponent,
      bbn.vue.dataEditorComponent,
      bbn.vue.localStorageComponent,
      bbn.vue.observerComponent
    ],
    props: {
      titleGroups: {
        type: [Array, Function]
      },
      // A function to transform the data
      map: {
        type: Function
      },
      popup: {
        type: Vue
      },
      limit: {
        type: Number,
        default: 25
      },
      pageable: {
        type: Boolean,
        default: false
      },
      sortable: {
        type: Boolean,
        default: false
      },
      filterable: {
        type: Boolean,
        default: false
      },
      multifilter: {
        type: Boolean,
        default: false
      },
      resizable: {
        type: Boolean,
        default: false
      },
      showable: {
        type: Boolean,
        default: false
      },
      saveable: {
        type: Boolean,
        default: false
      },
      groupable: {
        type: Boolean,
        default: false
      },
      editable: {
        type: [Boolean, String, Function]
      },
      serverPaging: {
        type: Boolean,
        default: true
      },
      serverSorting: {
        type: Boolean,
        default: true
      },
      serverFiltering: {
        type: Boolean,
        default: true
      },
      serverGrouping: {
        type: Boolean,
        default: true
      },
      order: {
        type: [Array, Object],
        default(){
          return [];
        }
      },
      filters: {
        type: Object,
        default(){
          return {
            logic: 'AND',
            conditions: []
          };
        }
      },
      selection: {
        type: [Boolean, Function],
        default: false
      },
      minimumColumnWidth: {
        type: Number,
        default: 30
      },
      defaultColumnWidth: {
        type: Number,
        default: 150
      },
      paginationType: {
        type: String,
        default: 'input'
      },
      info: {
        type: Boolean,
        default: false
      },
      search: {
        type: Boolean,
        default: false
      },
      currency: {
        type: String
      },
      url: {
        type: String
      },
      trClass: {
        type: [String, Function]
      },
      confirmMessage: {
        type: [String, Function]
      },
      // Vue components
      component: {

      },
      expander: {

      },
      editor: {
        type: [String, Object]
      },
      fixedDefaultSide: {
        type: String,
        default: "left"
      },
      uid: {
        type: [String, Number, Array]
      },
      toolbar: {
        type: [String, Array, Function, Object]
      },
      source: {
        type: [Array, String],
        default(){
          return [];
        }
      },
      columns: {
        type: Array,
        default: function(){
          return [];
        }
      },
      groupBy: {
        type: Number
      },
      expandedValues: {
        type: [Array, Function]
      },
      expanded: {
        type: [Boolean, Array],
        default(){
          return [];
        }
      },
      data: {
        type: [Object, Function],
        default(){
          return {};
        }
      },
      footer: {
        type: [String, Object]
      },
      groupFooter: {
        type: [String, Object]
      },
      aggregateExp: {
        type: Object,
        default(){
          return {
            tot: bbn._('Total'),
            med: bbn._('Average'),
            num: bbn._('Count'),
            max: bbn._('Maximum'),
            min: bbn._('Minimum'),
          };
        }
      },
      loadedConfig: {
        type: Object
      }
    },
    data(){
      let editable = $.isFunction(this.editable) ? this.editable() : this.editable,
          order = this.order;
      if ( this.sortable && this.order && (typeof this.order === 'object') && !Array.isArray(this.order) ){
        order = [];
        for ( var n in this.order ){
          order.push({field: n, dir: this.order[n]});
        }
      }
      return {
        _1strun: false,
        _observerReceived: false,
        groupCols: [
          {name: 'left', width: 0, visible: 0, cols: []},
          {name: 'main', width: 0, visible: 0, cols: []},
          {name: 'right', width: 0, visible: 0, cols: []}
        ],
        initReady: false,
        currentIndex: false,
        currentConfig: {},
        savedConfig: false,
        defaultConfig: this.loadedConfig ? this.loadedConfig : {
          filters: this.filters,
          limit: this.limit,
          order: this.order,
          hidden: this.hidden || null,
        },
        currentFilter: false,
        editedFilter: false,
        floatingFilterX: 0,
        floatingFilterY: 0,
        floatingFilterTimeOut: 0,
        currentFilters: $.extend({}, this.filters),
        currentLimit: this.limit,
        currentOrder: order,
        currentHidden: this.hidden || [],
        currentData: [],
        selectedRows: [],
        originalData: null,
        group: this.groupBy === undefined ? false : this.groupBy,
        limits: [10, 25, 50, 100, 250, 500],
        start: 0,
        total: 0,
        editMode: editable === true ? (this.editor ? 'popup' : 'inline') : (editable === 'popup' ? 'popup' : 'inline'),
        tmpRow: false,
        originalRow: false,
        editedRow: false,
        editedIndex: false,
        cols: [],
        table: false,
        isLoading: false,
        isAjax: typeof this.source === 'string',
        colButtons: false,
        scrollableContainer: null,
        hiddenScroll: true,
        popups: [],
        isAggregated: false,
        currentOverTr: false,
        updaterTimeout: false,
        allExpanded: this.expanded === true ? true : false,
        groupInit: false,
        currentExpanded: Array.isArray(this.expanded) ? this.expanded : [],
        currentExpandedValues: Array.isArray(this.expandedValues) ? this.expandedValues : [],
        focusedRow: false
      };
    },
    computed: {
      isBatch(){
        return this.editable && (this.editMode === 'inline') && !this.isAjax
      },
      modifiedRows(){
        let res = [];
        if ( this.isBatch ){
          $.each(this.currentData, (i, d) => {
            if ( JSON.stringify(d) !== JSON.stringify(this.originalData[i]) ){
              res.push(d);
            }
          })
        }
        return res;
      },
      shownFields(){
        let r = [];
        $.each(this.cols, (i, a) => {
          if ( a.field && !a.hidden ){
            r.push(a.field);
          }
        });
        return r;
      },
      jsonConfig(){
        return JSON.stringify(this.currentConfig);
      },
      isSaved(){
        return this.jsonConfig === this.savedConfig;
      },
      isChanged(){
        return JSON.stringify(this.currentConfig) !== this.initialConfig;
      },
      toolbarButtons(){
        let r = [],
            ar = [];
        if ( this.toolbar ){
          ar = $.isFunction(this.toolbar) ?
            this.toolbar() : (
              Array.isArray(this.toolbar) ? this.toolbar.slice() : []
            );
          if ( !Array.isArray(ar) ){
            ar = [];
          }
          $.each(ar, (i, a) => {
            let o = $.extend({}, a);
            if ( o.command ){
              o.command = () => {
                this._execCommand(a);
              }
            }
            r.push(o);
          });
        }
        return r;
      },
      isEditedValid(){
        let ok = true;
        if ( this.tmpRow ){
          $.each(this.columns, (i, a) => {
            if ( a.field && a.required && !this.tmpRow[a.field] ){
              ok = false;
              return false;
            }
          })
        }
        return ok;
      },
      /**
       *
       * @returns {number}
       */
      numPages(){
        return Math.ceil(this.total/this.currentLimit);
      },
      /**
       *
       * @returns {number}
       */
      numVisible(){
        return this.cols.length - bbn.fn.count(this.cols, {hidden: true}) + (this.hasExpander ? 1 : 0) + (this.selection ? 1 : 0);
      },
      /**
       *
       * @returns {*}
       */
      scroller(){
        return this.$refs.scroller instanceof Vue ? this.$refs.scroller : null;
      },
      currentPage: {
        /**
         *
         * @returns {number}
         */
        get(){
          return Math.ceil((this.start+1)/this.currentLimit);
        },
        set(val){
          this.start = val > 1 ? (val-1) * this.currentLimit : 0;
          this.updateData();
        }
      },
      /**
       *
       * @returns {Array}
       */
      currentSet(){
        if ( !this.cols.length ){
          return [];
        }
        // The final result
        /**
         *
         * @type {Array}
         */
        let res = [],
            isGroup = this.groupable &&
              (this.group !== false) &&
              this.cols[this.group] &&
              this.cols[this.group].field,
        // The group value will change each time a row has a different value on the group's column
            currentGroupValue,
        /* @todo Not sure of what it does ! */
            currentLink,
            // the data is put in a new array with its original index
            data = this.currentData.slice().map((item, index) => {
              return {
                index: index,
                data: item
              }
            }),
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
            i = 0;
        // Aggregated
        if ( this.isAggregated ){
          let idx = bbn.fn.search(this.cols, {field: this.isAggregated});
          if ( idx > -1 ){
            aggregateModes = this.cols[idx].aggregate;
          }
        }
        // Paging locally
        if ( this.pageable && (!this.isAjax || !this.serverPaging) ){
          i = this.start;
          end = this.start + this.currentLimit > data.length ? data.length : this.start + this.currentLimit;
        }
        // Grouping (and sorting) locally
        let pos;
        if (
          isGroup &&
          (!this.isAjax || !this.serverGrouping) &&
          ((pos = bbn.fn.search(this.currentOrder, {field: this.cols[this.group].field})) !== 0)
        ){
          // First ordering the data
          let orders = [{
            field: this.cols[this.group].field,
            dir: (pos > 0 ? this.currentOrder[pos].dir : 'asc')
          }];
          if ( this.sortable && this.currentOrder.length ){
            orders = orders.concat(JSON.parse(JSON.stringify(this.currentOrder)))
          }
          data = bbn.fn.multiorder(data, orders.map((item) => {item.field = 'data.' + item.field; return item;}));
        }
        // Sorting locally
        else if ( this.sortable && this.currentOrder.length && (!this.serverSorting || !this.isAjax) ){
          data = bbn.fn.multiorder(data, JSON.parse(JSON.stringify(this.currentOrder)).map((item) => {item.field = 'data.' + item.field; return item;}));
        }

        // A new row being edited
        if ( this.tmpRow ){
          res.push({
            index: -1,
            rowIndex: 0,
            data: this.tmpRow,
            selected: false,
            expander: !!this.expander,
            isEdited: true
          });
          rowIndex++;
        }

        // If there's a group that will be the row index of its 1st value (where the expander is)
        let currentGroupIndex = -1,
            isExpanded = false;
        while ( data[i] && (i < end) ){
          let a = data[i].data;
          if ( isGroup && (currentGroupValue !== a[this.cols[this.group].field]) ){
            isExpanded = false;
            currentGroupValue = a[this.cols[this.group].field];
            currentGroupIndex = data.index;
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
            if ( this.allExpanded ){
              isExpanded = true;
            }
            // expandedValues is a function, which will be executed on each value
            else if ( $.isFunction(this.expandedValues) ){
              if (
                this.expandedValues(currentGroupValue) &&
                (this.currentExpandedValues.indexOf(currentGroupValue) === -1)
              ){
                isExpanded = true;
              }
            }
            // The current group value should be opened
            else if ( this.currentExpandedValues.indexOf(currentGroupValue) > -1 ){
              isExpanded = true;
            }
            if ( !isExpanded && data[i-1] && (currentGroupValue === data[i-1].data[this.cols[this.group].field]) ){
              if ( res.length ){
                res.push(tmp);
              }
            }
            else{
              tmp.expanded = isExpanded;
              res.push(tmp);
              currentLink = i;
              rowIndex++;
            }
          }
          else if ( this.expander ){
            let exp = bbn.fn.isFunction(this.expander) ? this.expander(data[i], i) : this.expander;
            if ( !exp ){

            }
            else{
              isExpanded = this.currentExpanded.indexOf(data[i].index) > -1;
            }
          }
          if ( !isGroup || isExpanded ){
            o = {index: data[i].index, data: a, rowIndex: rowIndex};
            if ( a === this.editedRow ){
              o.isEdited = true;
            }
            if ( this.selection ){
              o.selected = this.selectedRows.indexOf(data[i].index) > -1;
              o.selection = true;
            }
            if ( isGroup ){
              o.isGrouped = true;
              o.link = currentLink;
            }
            else if ( this.expander && (
                !$.isFunction(this.expander) ||
                ($.isFunction(this.expander) && this.expander(a))
              ) ){
              o.expander = true;
            }
            res.push(o);
            rowIndex++;
          }
          else{
            end++;
          }
          if ( this.expander && (
              !$.isFunction(this.expander) ||
              ($.isFunction(this.expander) && this.expander(a))
            )
          ){
            res.push({index: data[i].index, data: a, expansion: true, rowIndex: rowIndex});
            rowIndex++;
          }
          // Group or just global aggregation
          if ( aggregateModes.length ){
            aggregates.num++;
            aggregates.tot += parseFloat(a[this.isAggregated]);
            if ( aggregates.min === false ){
              aggregates.min = parseFloat(a[this.isAggregated]);
            }
            else if ( aggregates.min > parseFloat(a[this.isAggregated]) ){
              aggregates.min = parseFloat(a[this.isAggregated])
            }
            if ( aggregates.max === false ){
              aggregates.max = parseFloat(a[this.isAggregated]);
            }
            else if ( aggregates.max < parseFloat(a[this.isAggregated]) ){
              aggregates.max = parseFloat(a[this.isAggregated])
            }
            if ( isGroup ){
              bbn.fn.log("IS GROUP", i);
              let searchRes = bbn.fn.search(aggregates.groups, {value: currentGroupValue});
              if ( searchRes === -1 ){
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
              if ( b.min === false ){
                b.min = parseFloat(a[this.isAggregated]);
              }
              else if ( b.min > parseFloat(a[this.isAggregated]) ){
                b.min = parseFloat(a[this.isAggregated])
              }
              if ( b.max === false ){
                b.max = parseFloat(a[this.isAggregated]);
              }
              else if ( b.max < parseFloat(a[this.isAggregated]) ){
                b.max = parseFloat(a[this.isAggregated])
              }
              if ( (!data[i+1] || (i === (end - 1))) || (currentGroupValue !== data[i+1].data[this.cols[this.group].field]) ){
                let b = aggregates.groups[aggregates.groups.length-1];
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
                    data: $.extend({}, a, tmp)
                  });
                  rowIndex++;
                });
              }
            }
            if ( !data[i+1] || (i === (end - 1)) ){
              aggregates.med = aggregates.tot / aggregates.num;
              $.each(aggregateModes, (k, c) => {
                let tmp = {};
                tmp[this.isAggregated] = aggregates[c];
                res.push({
                  index: data[i] ? data[i].index : 0,
                  rowIndex: rowIndex,
                  aggregated: true,
                  name: c,
                  data: $.extend({}, a, tmp)
                });
                rowIndex++;
              });
            }
          }
          i++;
        }
        return res;
      },
      hasExpander(){
        return this.expander || (
          this.groupable &&
          (typeof this.group === 'number') &&
          this.cols[this.group]
        );
      }
    },
    methods: {

      _map(data){
        return this.map ? $.map(data, this.map) : data;
      },
      /** Returns header's CSS object */
      _headStyles(col){
        let css = {
          width: this.getWidth(col.realWidth)
        };
        if ( col.hidden ){
          css.display = 'none';
        }
        return css;
      },
      /** Returns body's CSS object */
      _bodyStyles(col){
        return {};
      },
      /** @todo */
      _defaultRow(initialData){
        let res = {},
            data = initialData ? $.extend(true, {}, initialData) : {};
        $.each(this.cols, function(i, a){
          if ( a.field ){
            if ( data[a.field] !== undefined ){
              res[a.field] = data[a.field];
            }
            else if ( a.default !== undefined ){
              res[a.field] = $.isFunction(a.default) ? a.default() : a.default;
            }
            else{
              res[a.field] = '';
            }
            if ( Array.isArray(res[a.field]) ){
              res[a.field] = res[a.field].splice();
            }
            else if ( res[a.field] instanceof(Date) ){
              res[a.field] = new Date(res[a.field].getTime());
            }
            else if ( (null !== res[a.field]) && (typeof res[a.field] === 'object') ){
              res[a.field] = $.extend(true, {}, res[a.field]);
            }
          }
        });
        return res;
      },
      /** @todo */
      _addTmp(data){
        this._removeTmp().tmpRow = this._defaultRow(data);
        if ( this.$refs.scrollerY ){
          this.$refs.scrollerY.scrollTo(0, null, true);
        }
        return this;
      },
      /** @todo */
      _removeTmp(){
        if ( this.tmpRow ){
          this.tmpRow = false;
        }
        return this;
      },
      _checkHeaders(){
        if ( this.titleGroups ){
          let x = this.$refs.scroller.$refs.xScroller.currentScroll,
              cols = this.titleGroupsCells(),
              tot = 0;
          $.each(cols, (i, a) => {
            if ( tot + a.width > x ){
              $(".bbn-table-title-group", this.$refs.titleGroup[i]).css({left: tot < x ? x - tot : 0});
              return false;
            }
            tot += (a.width + a.colspan);
          })
        }
      },
      _execCommand(button, data, col, index){
        if ( button.command ){
          if ( $.isFunction(button.command) ){
            return button.command(data, col, index);
          }
          else if ( typeof(button.command) === 'string' ){
            switch ( button.command ){
              case 'insert':
                return this.insert(data, {title: bbn._('New row creation')}, -1);
                break;
              case 'select':
                return this.select();
                break;
              case 'edit':
                return this.edit(data, {title: bbn._('Row edition')}, index);
                break;
              case 'add':
                return this.add(data);
                break;
              case 'copy':
                return this.copy(data, {title: bbn._('Row copy')}, index);
                break;
              case 'delete':
                return this.delete(index);
            }
          }
        }
        return false;
      },

      _containerComponent(groupIndex){
        return groupIndex === 1 ? {
          template: '<div class="bbn-block"><slot></slot></div>'
        } : bbn.vue.emptyComponent
      },

      getPopup(){
        return this.popup || bbn.vue.closest(this, 'bbn-tab').getPopup();
      },
      isEditable(row, col, index){
        if ( !this.editable ){
          return false;
        }
        if ( $.isFunction(col.editable) ){
          return col.editable(row, col, index)
        }
        return col.editable !== false
      },
      isNullable(row, col, index){
        if ( $.isFunction(col.nullable) ){
          return col.nullable(row, col, index)
        }
        return col.nullable === true;
      },
      titleGroupsCells(groupIndex){
        if ( this.titleGroups ){
          let cells = [],
              group = null,
              corresp = {};
          $.each(this.groupCols[groupIndex].cols, (i, a) => {
            if ( !a.hidden ){
              if ( a.group === group ){
                cells[cells.length-1].colspan++;
                cells[cells.length-1].width += a.realWidth;
              }
              else{
                if ( corresp[a.group] === undefined ){
                  let idx = bbn.fn.search(this.titleGroups, 'value', a.group);
                  if ( idx > -1 ){
                    corresp[a.group] = idx;
                  }
                }
                if ( corresp[a.group] !== undefined ){
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
                else{
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
      hasFilter(col){
        if ( col.field ){
          for ( let i = 0; i < this.currentFilters.conditions.length; i++ ){
            if ( this.currentFilters.conditions[i].field === col.field ){
              return true;
            }
          }
        }
        return false;
      },
      onSetFilter(filter){
        if ( filter && filter.field && filter.operator ){
          if ( this.multi ){
            this.currentFilters.conditions.push(filter);
          }
          else if ( filter.field ){
            let idx = bbn.fn.search(this.currentFilters.conditions, {field: filter.field});
            if ( idx > -1 ){
              this.currentFilters.conditions.splice(idx, 1, filter);
            }
            else{
              this.currentFilters.conditions.push(filter);
            }
          }
          //bbn.fn.log("TABLE", filter)
        }
      },
      onUnsetFilter(filter){
        bbn.fn.log("onUnset", filter);
        this.removeFilter(filter);
      },
      removeFilter(condition){
        if ( condition.time ){
          bbn.fn.log("There is the time", condition);
          let del = (arr) => {
            let idx = bbn.fn.search(arr, {time: condition.time});
            bbn.fn.log("Is there the index?", idx);
            if ( idx > -1 ){
              if ( arr[idx].conditions && arr[idx].conditions.length ){
                bbn.fn.confirm(bbn._("Êtes-vous sûr de vouloir supprimer ce groupe de conditions?"), () => {
                  arr.splice(idx, 1);
                })
              }
              else{
                arr.splice(idx, 1);
                bbn.fn.log("It seems to be deleted", arr);
              }
              return true;
            }
            for ( let i = 0; i < arr.length; i++ ){
              if ( arr[i].conditions ){
                if ( del(arr[i].conditions) ){
                  return true;
                }
              }
            }
          };
          if ( del(this.currentFilters.conditions) ){
            this.$forceUpdate();
          }
        }
      },
      fullTrClass(d){
        return 'k-widget' +
          (this.trClass ? ' ' + this.trClass(d.data) : '') +
          (d.index % 2 ? ' k-alt' : '') +
          (d.aggregated || d.groupAggregated ? ' k-header' : '') +
          (this.currentIndex === d.index ? ' k-state-hover' : '')
      },
      unsetFilter(){
        this.currentFilters = $.extend({}, this.filters);
        this.currentFilter = false;
        this.editedFilter = false;
      },
      unsetCurrentFilter(){
        if ( this.editedFilter ){
          let idx = bbn.fn.search(this.currentFilters.conditions, {time: this.editedFilter.time});
          if ( idx > -1 ){
            this.currentFilters.conditions.splice(idx, 1)
          }
        }
      },
      checkFilterWindow(e){
        if ( this.currentFilter ){
          if (
            (e.clientX < this.floatingFilterX) ||
            (e.clientX > this.floatingFilterX + 600) ||
            (e.clientY < this.floatingFilterY) ||
            (e.clientY > this.floatingFilterY + 200)
          ){
            if ( !this.floatingFilterTimeOut ){
              this.floatingFilterTimeOut = setTimeout(() =>{
                this.currentFilter = false;
                this.editedFilter = false;
              }, 500);
            }
          }
          else{
            clearTimeout(this.floatingFilterTimeOut);
            this.floatingFilterTimeOut = 0;
          }
        }
      },
      getFilterOptions(){
        if ( this.currentFilter ){
          let o = this.editorGetComponentOptions(this.currentFilter);
          if ( o.field ){
            o.conditions = this.getColFilters(this.currentFilter);
          }
          if ( o.conditions.length ){
            o.value = o.conditions[0].value;
            o.operator = o.conditions[0].operator;
            this.editedFilter = o.conditions[0];
          }
          o.multi = false;
          return o;
        }
      },
      openMultiFilter(){
        let table = this;
        this.getPopup().open({
          title: bbn._('Multi Filter'),
          component: {
            template: `<bbn-scroll><bbn-filter v-bind="source" @change="changeConditions" :multi="true"></bbn-filter></bbn-scroll>`,
            props: ['source'],
            methods: {
              changeConditions(o){
                bbn.fn.log("changeConditions", o)
                table.$set(table.currentFilters, 'logic', o.logic);
                table.$set(table.currentFilters, 'conditions', o.conditions);
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
      getColFilters(col){
        let r= [];
        if ( col.field ){
          $.each(this.currentFilters.conditions, (i, a) => {
            if ( a.field === col.field ){
              r.push(a);
            }
          })
        }
        return r;
      },
      showFilter(col, ev){
        bbn.fn.log(ev);
        this.floatingFilterX = ev.pageX - 10 < 0 ? 0 : (ev.pageX - 10 + 600 > this.$el.clientWidth ? this.$el.clientWidth - 600 : ev.pageX - 10);
        this.floatingFilterY = ev.pageY - 10 < 0 ? 0 : (ev.pageY - 10 + 200 > this.$el.clientHeight ? this.$el.clientHeight - 200 : ev.pageY - 10);
        this.currentFilter = col;
      },
      pickableColumnList(){
        return $.map(this.cols.slice(), (i, a) => {
          return a.showable !== false;
        })
      },
      openColumnsPicker(){
        let table = this;
        this.getPopup().open({
          title: bbn._('Columns\' picker'),
          width: '90%',
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
            data(){
              let shownColumns = $.map(this.source.cols, (a) => {
                return !a.hidden;
              });
              return {
                table: table,
                formData: {changed: false},
                shownCols: shownColumns
              }
            },
            methods: {
              applyColumnsShown(){
                let toShow = [],
                    toHide = [];
                $.each(this.source.cols, (i, a) => {
                  if ( a.hidden == this.shownCols[i] ){
                    if ( this.shownCols[i] ){
                      toShow.push(i);
                    }
                    else{
                      toHide.push(i);
                    }
                  }
                });
                if ( toShow.length ){
                  table.show(toShow);
                }
                if ( toHide.length ){
                  table.show(toHide, true);
                }
              },
              allVisible(group){
                let ok = true;
                bbn.fn.log("allVisible", group);
                $.each(this.source.cols, (i, a) => {
                  if (
                    (a.showable !== false) &&
                    (a.group === group) &&
                    !a.fixed
                  ){
                    if ( !this.shownCols[i] ){
                      ok = false;
                      bbn.fn.log("NOT ALL VISIBLE!!!!!!!!!!!!!!!!!!!!!!", a);
                      return false;
                    }
                  }
                });
                return ok;
              },
              check(col, index){
                this.$set(this.shownCols, index, !this.shownCols[index]);
              },
              checkAll(group){
                let show = !this.allVisible(group),
                    shown = [];
                $.each(this.source.cols, (i, a) => {
                  if ( (a.showable !== false) && (a.group === group) && !a.fixed ){
                    if ( this.shownCols[i] != show ){
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
                handler(){
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
      edit(row, winOptions, index){
        if ( !this.editable ){
          throw new Error("The table is not editable, you cannot use the edit function in bbn-table");
        }
        if ( !row ){
          this._addTmp();
          row = this.tmpRow;
        }
        else{
          this.originalRow = $.extend(true, {}, row);
        }
        // EditedRow exists from now on the time of the edition
        this.editedRow = row;
        this.editedIndex = index;
        if ( this.editMode === 'popup' ){
          if ( typeof(winOptions) === 'string' ){
            winOptions = {title: winOptions};
          }
          if ( !winOptions.height ){
            //winOptions.height = (this.cols.length * 2) + 'rem'
          }
          let popup = $.extend({title: bbn._('Row edition'), width: 700}, winOptions ? winOptions : {}, {
            source: {
              row: row,
              data: $.isFunction(this.data) ? this.data() : this.data
            }
          });
          // A component is given as global editor (form)
          if ( this.editor ){
            popup.component = this.editor;
          }
          // A URL is given and in this case the form will be created automatically with this URL as action
          else if ( this.url ){
            let table = this;
            popup.component = {
              data(){
                return {
                  // Table's columns are used as native form config
                  fields: table.cols,
                  data: row
                }
              },
              template: `
<bbn-form class="bbn-full-screen"
          action="` + table.url + `"
          :schema="fields"
          :source="data"
          :data="{action: '` + (table.tmpRow ? 'insert' : 'update') + `'}"
          @success="success"
          @failure="failure">
</bbn-form>`,
              methods: {
                success(d, e){
                  e.preventDefault();
                  let ev = new $.Event('editSuccess');
                  table.$emit('editSuccess', d, ev);
                  if ( d.data && !ev.isDefaultPrevented() ){
                    bbn.fn.warning("DEFAULT");
                    // New insert
                    if ( table.tmpRow ){
                      table.currentData.push(d);
                    }
                    // Update
                    else if ( table.editedRow ){
                      bbn.fn.warning("UPDATE", d.data);
                      for ( let n in d.data ){
                        if ( bbn.fn.hasOwnProperty(this.data, n) ){
                          this.$set(this.data, n, d.data[n]);
                        }
                      }
                    }
                    table.getPopup().close();
                  }
                },
                failure(d){
                  table.$emit('editFailure', d);
                },
              },
              watch: {
                deep: true,
                handler(newVal){
                }
              }
            };
          }
          popup.afterClose = () => {
          //  this.currentData.push($.extend({}, this.tmpRow)); // <-- Error. This add a new row into table when it's in edit mode
            this._removeTmp();
            this.editedRow = false;
            this.editedIndex = false;
          };
          this.getPopup().open(popup);
        }
      },
      getConfig(){
        return {
          limit: this.currentLimit,
          order: this.currentOrder,
          filters: this.currentFilters,
          hidden: this.currentHidden
        };
      },
      getColumnsConfig(){
        return JSON.parse(JSON.stringify(this.cols));
      },
      setConfig(cfg, no_storage){
        if ( cfg === false ){
          cfg = this.defaultConfig;
        }
        else if ( cfg === true ){
          cfg = this.getConfig();
        }
        if ( cfg && cfg.limit ){
          if ( this.filterable && cfg.filters && (this.currentFilters !== cfg.filters) ){
            this.currentFilters = cfg.filters;
          }
          if ( this.pageable && (this.currentLimit !== cfg.limit) ){
            this.currentLimit = cfg.limit;
          }
          if ( this.sortable && (this.currentOrder !== cfg.order) ){
            this.currentOrder = cfg.order;
          }
          if ( this.showable ){
            if ( (cfg.hidden !== undefined) && (cfg.hidden !== this.currentHidden) ){
              this.currentHidden = cfg.hidden;
            }
            $.each(this.cols, (i, a) => {
              let hidden = (this.currentHidden.indexOf(i) > -1);
              if ( a.hidden !== hidden ){
                this.$set(this.cols[i], "hidden", hidden);
              }
            });
          }
          this.currentConfig = {
            limit: this.currentLimit,
            order: this.currentOrder,
            filters: this.currentFilters,
            hidden: this.currentHidden
          };
          if ( !no_storage ){
            this.setStorage(this.currentConfig);
          }

          this.$forceUpdate();
        }
      },
      /** @todo */
      remove(where){
        let idx;
        while ( (idx = bbn.fn.search(this.currentData, where)) > -1 ){
          this.currentData.splice(idx, 1);
        }
        this.$forceUpdate();
      },
      save(){
        this.savedConfig = this.jsonConfig;
      },
      select(){},
      /** @todo */
      add(data){
        this.currentData.push(data);
      },
      delete(index, confirm){
        if ( this.currentData[index] ){
          let ev = $.Event('delete');
          this.$emit('beforeDelete', this.currentData[index], ev);
          if ( !ev.isDefaultPrevented() ){
            if ( confirm ){
              this.getPopup().confirm(confirm, () => {
                this.currentData.splice(index, 1);
                this.$emit('delete', this.currentData[index], ev);
              })
            }
            else{
              this.currentData.splice(index, 1);
              this.$emit('delete', this.currentData[index], ev);
            }
          }
        }
      },
      insert(data, options, index){
        let d = data ? $.extend({}, data) : {};
        if ( this.uid && d[this.uid] ){
          delete d[this.uid];
        }
        this._addTmp(d, index);
        this.edit(this.tmpRow, options, index);
      },
      copy(data, options, index){
        let r = $.extend({}, data);
        if ( this.uid && r[this.uid] ){
          delete r[this.uid];
        }
        this._addTmp(r);
        this.edit(this.tmpRow, options, index);
      },
      checkSelection(index){
        bbn.fn.log("checkSelection");
        let idx = this.selectedRows.indexOf(index),
            isSelected = false;
        if ( idx > -1 ){
          this.$emit('unselect', this.currentData[index]);
          this.selectedRows.splice(idx, 1);
        }
        else{
          this.$emit('select', this.currentData[index]);
          this.selectedRows.push(index);
          isSelected = true;
        }
        this.$emit('toggle', isSelected, this.currentData[index]);
      },

      /** Refresh the current data set */
      updateData(withoutOriginal){
        this.currentExpanded = [];
        if ( this.isAjax && !this.isLoading ){
          this.isLoading = true;
          this._removeTmp();
          this.editedRow = false;
          this.editedIndex = false;
          this.$forceUpdate();
          this.$nextTick(() => {
            let data = {
              limit: this.currentLimit,
              start: this.start,
              data: this.data ? ($.isFunction(this.data) ? this.data() : this.data) : {}
            };
            if ( this.sortable ){
              data.order = this.currentOrder;
            }
            if ( this.filterable ){
              data.filters = this.currentFilters;
            }
            if ( this.showable ){
              data.fields = this.shownFields;
            }
            bbn.fn.post(this.source, data, (result) => {
              this.isLoading = false;
              if (
                !result ||
                result.error ||
                ((result.success !== undefined) && !result.success)
              ){
                alert(result && result.error ? result.error : "Error in updateData");
              }
              else{
                this.currentData = this._map(result.data || []);
                if ( result.observer && this.observerCheck() ){
                  this._observerReceived = result.observer.value;
                  this.observerID = result.observer.id;
                  this.observerValue = result.observer.value;
                  if ( !this._1strun ){
                    this.observerWatch();
                    this._1strun = true;
                  }
                }
                if ( this.editable ){
                  this.originalData = JSON.parse(JSON.stringify(this.currentData));
                }
                this.total = result.total || result.data.length || 0;
                if ( result.order ){
                  this.currentOrder.splice(0, this.currentOrder.length);
                  this.currentOrder.push({field: result.order, dir: (result.dir || '').toUpperCase() === 'DESC' ? 'DESC' : 'ASC'});
                }
              }
            })
          })
        }
        else if ( Array.isArray(this.source) ){
          this.currentData = this._map(this.source);
          if ( this.isBatch && !withoutOriginal ){
            this.originalData = JSON.parse(JSON.stringify(this.currentData));
          }
          this.total = this.currentData.length;
        }
      },
      isDirty(row, col, idx){
        return this.isBatch &&
          col &&
          !row.isEdited &&
          !row.aggregated &&
          !row.groupAggregated &&
          (col.editable !== false) &&
          col.field &&
          (row.data[col.field] != this.originalData[row.index][col.field])
      },
      currentClass(column, data, index){
        if ( column.cls ){
          return $.isFunction(column.cls) ? column.cls(data, index) : column.cls;
        }
        return '';
      },
      isModified(idx){
        if ( !this.originalData ){
          return false;
        }
        return JSON.stringify(this.currentData[idx]) !== JSON.stringify(this.originalData[idx])
      },

      isSorted(col){
        if (
          this.sortable &&
          (col.sortable !== false) &&
          !col.buttons &&
          col.field
        ){
          let idx = bbn.fn.search(this.currentOrder, {field: col.field});
          if ( idx > -1 ){
            return this.currentOrder[idx];
          }
        }
        return false;
      },
      sort(col){
        if (
          !this.isLoading &&
          this.sortable &&
          col.field &&
          (col.sortable !== false)
        ){
          let f = col.field,
              pos = bbn.fn.search(this.currentOrder, {field: f});
          if ( pos > -1 ){
            if ( this.currentOrder[pos].dir === 'ASC' ){
              this.$set(this.currentOrder[pos], 'dir', 'DESC');
            }
            else{
              this.currentOrder.splice(0, this.currentOrder.length);
            }
          }
          else{
            this.currentOrder.splice(0, this.currentOrder.length);
            this.currentOrder.push({field: f, dir: 'ASC'});
          }
          if ( this.isAjax ){
            this.updateData();
          }
        }
      },
      updateTable(num){
        if ( !num ){
          num = 0;
        }
        if ( !this.isLoading && (num < 25) ){
          clearTimeout(this.updaterTimeout);
          this.updaterTimeout = setTimeout(() => {
            if ( this.groupCols[0].cols.length || this.groupCols[2].cols.length ){
              let trs = $("table.bbn-table-data-main:first > tbody > tr", this.$el),
                  trsLeft = $("table.bbn-table-data-left:first > tbody > tr", this.$el),
                  trsRight = $("table.bbn-table-data-right:first > tbody > tr", this.$el);
              if ( trsLeft.length || trsRight.length ){
                trs.each((i, tr) =>{
                  if ( $(tr).is(":visible") ){
                    let ar = [tr];
                    if ( trsLeft[i] ){
                      ar.push(trsLeft[i]);
                    }
                    if ( trsRight[i] ){
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
            if ( sc && $.isFunction(sc.onResize) ){
              sc.onResize();
              if ( sy && $.isFunction(sy.onResize) ){
                if ( this.scrollableContainer !== sc.$refs.scrollContainer ){
                  this.scrollableContainer = sc.$refs.scrollContainer;
                }
                sy.onResize();
              }
            }
            this.$emit("resize");
          }, 100);
        }
      },
      /** Renders a cell according to column's config */
      render(data, column, index){
        let value = data && column.field ? data[column.field] || '' : undefined;
        if ( column.render ){
          return column.render(data, column, index, value)
        }
        return value;
      },
      cancel(){
        if ( this.tmpRow ){
          this._removeTmp();
        }
        else if ( this.editedRow && this.originalRow ){
          let row = bbn.fn.get_row(this.currentSet, {isEdited: true});
          if ( row ){
            this.$set(this.currentData, row.index, this.originalRow);
          }
          this.originalRow = false;
          this.editedRow = false;
          this.editedIndex = false;
        }
      },
      /** @todo */
      editTmp(data){
        if ( this.tmpRow ){
          data = $.extend(this.tmpRow, data);
        }
        return this;
      },
      saveTmp(){},
      /** @todo */
      getWidth(w){
        if ( typeof(w) === 'number' ){
          return (w > 19 ? w : 20 ) + 'px';
        }
        if ( bbn.fn.isDimension(w) ){
          return w;
        }
        return '100px';
      },
      /** @todo */
      reset(){
        this.initReady = false;
        this.setConfig(false);
        this.$forceUpdate();
        this.$nextTick(() => {
          this.initReady = true;
          this.init();
        })
      },
      /** @todo */
      addColumn(obj){
        if ( obj.aggregate && !Array.isArray(obj.aggregate) ){
          obj.aggregate = [obj.aggregate];
        }
        this.cols.push(obj);
      },
      onResize(){
        this.init();
      },
      dataScrollContents(){
        if ( !this.groupCols[0].cols.length && !this.groupCols[2].cols.length ){
          return null;
        }
        let r = [];
        $.each(this.groupCols, (i, a) => {
          let sc = this.getRef(a.name + 'Scroller');
          if ( a.cols.length && sc && sc.getRef('scrollContainer') ){
            r.push(sc.getRef('scrollContainer'));
          }
        });
        return r;
      },
      isExpanded(d){
        if ( this.allExpanded ){
          return true;
        }
        if ( !this.expander && ((this.group === false) || !this.groupable) ){
          return true;
        }
        if ( this.expander ){
          return this.currentExpanded.indexOf(d.index) > -1;
        }
        if (
          this.groupable &&
          (this.group !== false) &&
          this.cols[this.group] &&
          this.cols[this.group].field &&
          (d.data[this.cols[this.group].field] !== undefined)
        ){
          return this.currentExpandedValues.indexOf(d.data[this.cols[this.group].field]) > -1;
        }
        if ((d.isGrouped || d.groupAggregated) && (this.currentExpanded.indexOf(d.link) > -1)){
          return true;
        }
        return false;
      },
      toggleExpanded(idx){
        if ( this.currentData[idx] ){
          if ( this.allExpanded ){
            this.allExpanded = false;
          }
          if (
            this.groupable &&
            (this.group !== false) &&
            this.cols[this.group] &&
            this.cols[this.group].field &&
            (this.currentData[idx][this.cols[this.group].field] !== undefined)
          ){
            let groupValue = this.currentData[idx][this.cols[this.group].field],
                groupIndex = this.currentExpandedValues.indexOf(groupValue);
            if ( groupIndex > -1 ){
              this.currentExpandedValues.splice(groupIndex, 1);
            }
            else{
              this.currentExpandedValues.push(groupValue);
            }
          }
          else{
            let i = this.currentExpanded.indexOf(idx);
            if ( i > -1 ){
              this.currentExpanded.splice(i, 1);
            }
            else{
              this.currentExpanded.push(idx);
            }
          }
        }
      },
      rowHasExpander(d){
        if ( this.hasExpander ){
          if ( !$.isFunction(this.expander) ){
            return true;
          }
          return !!this.expander(d);
        }
        return false;
      },
      isSelected(index){
        return this.selection && (this.selectedRows.indexOf(index) > -1);
      },
      hasTd(data, colIndex, groupIndex){
        let tdIndex = colIndex;
        for ( let i = 0; i < groupIndex; i++ ){
          tdIndex += this.groupCols[groupIndex].cols.length;
        }
        if ( data.selection ){
          if ( tdIndex === 0 ){
            return false;
          }
          else if ( data.group || data.expander ){
            if ( tdIndex === 1 ){
              return false;
            }
          }
        }
        if ( data.group || data.expander ){
          if ( tdIndex === 0 ){
            return false;
          }
        }
        if ( data.group || data.expansion ){
          return false;
        }
        if ( data.hidden ){
          return false;
        }
        return true;
      },
      init(with_data){
        let groupCols = [
              {name: 'left', width: 0, visible: 0, cols: []},
              {name: 'main', width: 0, visible: 0, cols: []},
              {name: 'right', width: 0, visible: 0, cols: []}
            ],
            numUnknown = 0,
            colButtons = false,
            isAggregated = false;
        if ( this.selection ){
          groupCols[0].cols.push({
            title: ' ',
            width: this.minimumColumnWidth,
            realWidth: this.minimumColumnWidth
          });
          groupCols[0].visible++;
        }
        if ( this.hasExpander ){
          groupCols[0].cols.push({
            title: ' ',
            width: this.minimumColumnWidth,
            realWidth: this.minimumColumnWidth
          });
          groupCols[0].visible++;
        }
        $.each(this.cols, (i, a) => {
          if ( !this.groupable || (this.group !== i) ){
            if ( a.aggregate && a.field ){
              isAggregated = a.field;
            }
            a.index = i;
            if ( a.hidden ){
              a.realWidth = 0;
            }
            else{
              if ( a.width ){
                if ( (typeof(a.width) === 'string') && (a.width.substr(-1) === '%') ){
                  a.realWidth = Math.round(this.lastKnownWidth * parseFloat(a.width) / 100);
                }
                else{
                  a.realWidth = parseFloat(a.width);
                }
                if ( a.realWidth < this.minimumColumnWidth ){
                  a.realWidth = this.minimumColumnWidth;
                }
              }
              else{
                a.realWidth = this.minimumColumnWidth;
                numUnknown++;
              }
              if ( a.buttons ){
                colButtons = i;
              }
              if ( a.fixed ){
                if (
                  (a.fixed !== 'right') &&
                  ((this.fixedDefaultSide !== 'right') || (a.fixed === 'left'))
                ){
                  groupCols[0].cols.push(a);
                  if ( !a.hidden ){
                    groupCols[0].visible++;
                  }
                }
                else{
                  groupCols[2].cols.push(a);
                  if ( !a.hidden ){
                    groupCols[2].visible++;
                  }
                }
              }
              else{
                groupCols[1].cols.push(a);
                if ( !a.hidden ){
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
        if ( toFill > this.cols.length - this.currentHidden.length ){
          if ( numUnknown ){
            let newWidth = Math.round(
              (toFill - (this.cols.length - this.currentHidden.length))
              / numUnknown
              * 100
            ) / 100;
            if ( newWidth < this.minimumColumnWidth ){
              newWidth = this.minimumColumnWidth;
            }
            $.each(this.cols, (i, a) => {
              if ( !a.hidden ){
                if ( !a.width ){
                  a.realWidth = newWidth + this.minimumColumnWidth;
                }
              }
            });
          }
          // Otherwise we dispatch it through the existing column
          else{
            let bonus = Math.round(
              toFill / (
                // We don't dispatch to the expander column
                this.hasExpander ? this.numVisible - 1 : this.numVisible
              ) * 100
            ) / 100;
            $.each(this.cols, (i, a) => {
              if ( !a.hidden && (!this.hasExpander || (i !== 0)) ){
                a.realWidth += bonus;
              }
            })
          }
        }
        $.each(groupCols, (i, a) => {
          a.width = bbn.fn.sum(a.cols, 'realWidth') + a.visible;
        });
        this.groupCols = groupCols;
        this.colButtons = colButtons;
        this.isAggregated = isAggregated;
        this.initReady = true;
        if ( with_data ){
          this.$nextTick(() => {
            this.updateData();
          })
        }
      },
      keydown(e){
        if ( this.isBatch && this.editedRow && (e.which === 9) || (e.which === 13) ){
          e.preventDefault();
        }
      },
      show(colIndexes, hide){
        if ( !Array.isArray(colIndexes) ){
          colIndexes = [colIndexes];
        }
        $.each(colIndexes, (i, colIndex) => {
          if ( this.cols[colIndex] ){
            if ( (this.cols[colIndex].hidden && !hide) || (!this.cols[colIndex].hidden && hide) ){
              let idx = this.currentHidden.indexOf(colIndex);
              if ( hide && (idx === -1) ){
                this.currentHidden.push(colIndex);
              }
              else if ( !hide && (idx > -1) ){
                this.currentHidden.splice(idx, 1);
              }
            }
          }
        });
        this.$forceUpdate();
        this.setConfig(true);
        this.init(true);
      },
      getEditableComponent(col, data){
        if ( col.editor ){
          return col.editor;
        }
        if ( col.type ){
          switch ( col.type ){
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
        if ( col.source ){
          return 'bbn-dropdown';
        }
        return 'bbn-input';
      },
      getEditableOptions(col, data){
        let res = col.options ? (
          $.isFunction(col.options) ? col.options(data, col) : col.options
        ) : {};
        if ( !res.name && col.field ){
          res.name = col.field;
        }
        if ( col.type ){
          switch ( col.type ){
            case "date":
              break;
            case "email":
              $.extend(res, {type: 'email'});
              break;
            case "url":
              $.extend(res, {type: 'url'});
              break;
            case "number":
              break;
            case "money":
              break;
            case "bool":
            case "boolean":
              break;
          }
        }
        if ( col.source ){
          $.extend(res, {source: col.source});
        }
        else if ( col.editor ){
          res.source = data;
        }
        return res;
      },
      getTr(i){
        let c = this.getRef('mainData');
        if ( c ){
          return $("table:first > tbody > tr:eq(" + i + ")", this.getRef('mainData'))[0];
        }
      },
      defaultObject(){
        let o = {};
        for ( var n in bbn.vue.fieldComponent ){
          if ( bbn.vue.fieldComponent[n].default !== undefined ){
            o[n] = bbn.vue.fieldComponent[n].default;
          }
        }
        return o;
      },
      saveEditedRow(){},
      cancelEditedRow(){}
    },

    created(){
      // Adding bbn-column from the slot
      if (this.$slots.default){
        let def = this.defaultObject();
        for ( let node of this.$slots.default ){
          //bbn.fn.log("TRYING TO ADD COLUMN", node);
          if (
            node.componentOptions &&
            (node.componentOptions.tag === 'bbn-column')
          ){
            this.addColumn($.extend({}, def, node.componentOptions.propsData));
          }
          else if (
            (node.tag === 'bbn-column') &&
            node.data && node.data.attrs
          ){
            this.addColumn($.extend({}, def, node.data.attrs));
          }
        }
      }
      if ( this.columns.length ){
        $.each(this.columns.slice(), (i, a) => {
          this.addColumn(a);
        })
      }
      if ( this.defaultConfig.hidden === null ){
        let tmp = [];
        $.each(this.cols, (i, a) => {
          if ( a.hidden ){
            tmp.push(i);
          }
        });
        this.defaultConfig.hidden = tmp;
      }
      this.setConfig(false, true);
      this.initialConfig = this.jsonConfig;
      this.savedConfig = this.jsonConfig;
      let cfg = this.getStorage();
      this.setConfig(cfg ? cfg : false, true);
    },

    mounted(){
      this.init();
      this.$forceUpdate();
      this.$nextTick(() => {
        this.updateData();
      });
      this.ready = true;
    },

    updated(){
      this.updateTable();
    },

    watch: {
      observerValue(newVal){
        if ( (newVal !== this._observerReceived) && !this.editedRow ){
          this._observerReceived = newVal;
          this.updateData();
        }
      },
      editedRow(newVal, oldVal){
        /*
        if ( oldVal && this.originalRow ){
          let row = bbn.fn.get_row(this.currentSet, {isEdited: true});
          if ( row ){
            this.$set(this.currentData, row.index, this.originalRow);
          }
          this.originalRow = false;
          bbn.fn.log(newVal, oldVal, this.originalRow, row, '------------')
        }
        bbn.fn.log("editedRow is changing", JSON.stringify(newVal, null, 2));
        */
      },
      cols: {
        deep: true,
        handler(){
          this.init();
        }
      },
      currentLimit(){
        this.setConfig(true);
      },
      currentFilters: {
        deep: true,
        handler(){
          this.currentFilter = false;
          this.updateData();
          this.setConfig(true);
          this.$forceUpdate();
        }
      },
      currentOrder: {
        deep: true,
        handler(){
          this.setConfig(true);
          this.$forceUpdate();
        }
      },
      currentHidden: {
        deep: true,
        handler(){
          this.setConfig(true);
          this.$forceUpdate();
        }
      },
      group(){
        this.currentExpandedValues = [];
        this.currentExpanded = [];
        this.init();
      },
      focusedRow(newIndex, oldIndex){
        if ( this.currentSet[oldIndex] !== undefined ){
          let idx = this.currentSet[oldIndex].index;
          if (
            (this.editable === 'inline') &&
            (this.editedIndex === oldIndex) &&
            this.isModified(idx)
          ){
            //this.$forceUpdate();
            this.$emit('change', this.currentSet[oldIndex].data, idx);
            bbn.fn.log("SAVE FUNCTION");
            //this.save();
          }
        }
        if ( this.currentSet[newIndex] !== undefined ){
          if (
            !this.currentSet[newIndex].group &&
            (this.editable === 'inline')
          ){
            let comeFromAfter = newIndex === oldIndex - 1;
            this.$nextTick(() =>{
              this.edit(this.currentSet[newIndex].data, null, newIndex);
              this.$nextTick(() => {
                $("input:visible:" + (comeFromAfter ? 'last' : 'first'), this.getTr(newIndex)).focus();
              })
            })
          }
        }
        else{
          this.editedRow = false;
          this.editedIndex = false;
        }
      },
    },
    components: {
      'bbn-columns': {
        mixins: [bbn.vue.fieldProperties]
      },
      'bbn-row': {
        props: {},
        data(){
          return {

          }
        }
      }
    },
  });

})(window.jQuery, bbn);
