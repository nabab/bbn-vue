/**
 * Created by BBN on 14/02/2017.
 */
(function($, bbn){
  "use strict";

  const METHODS4BUTTONS = ['insert', 'select', 'edit', 'add', 'delete'];

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-table', {
    template: '#bbn-tpl-component-table',
    mixins: [bbn.vue.resizerComponent, bbn.vue.dataEditorComponent, bbn.vue.localStorageComponent],
    props: {
      titleGroups: {
        type: Object
      },
      // A function to transform the data
      map: {
        type: Function
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
        type: Array,
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
        type: [String, Array, Function]
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
      expanded: {
        type: Array,
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
    },
    data(){
      let editable = $.isFunction(this.editable) ? this.editable() : this.editable;
      return {
        currentFilter: false,
        floatingFilterX: 0,
        floatingFilterY: 0,
        floatingFilterTimeOut: 0,
        currentFilters: this.filters,
        selectedRows: [],
        currentData: [],
        group: this.groupBy === undefined ? false : this.groupBy,
        limits: [10, 25, 50, 100, 250, 500],
        start: 0,
        total: 0,
        editMode: editable === true ? (this.editor ? 'popup' : 'inline') : (editable === 'popup' ? 'popup' : 'inline'),
        buttonCls: 'bbn-table-command-',
        buttonDone: 'bbn-table-button',
        selectDone: 'bbn-table-select',
        widgetName: "DataTable",
        toolbarDone: [],
        tmpRow: false,
        originalRow: false,
        editedRow: false,
        editedTr: false,
        cols: this.columns.slice(),
        table: false,
        isLoading: false,
        isAjax: typeof this.source === 'string',
        currentLimit: this.limit,
        currentOrder: this.order,
        tableLeftWidth: 0,
        tableMainWidth: 0,
        tableRightWidth: 0,
        colsLeft: [],
        colsMain: [],
        colsRight: [],
        colButtons: false,
        scrollableContainer: null,
        hiddenScroll: true,
        currentExpanded: [],
        popups: [],
        isAggregated: false
      };
    },
    computed: {
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
            if ( o.command && (typeof(o.command) === 'string') ){
              if ( $.inArray(o.command, METHODS4BUTTONS) > -1 ){
                o.command = this[a.command];
              }
            }
            r.push(o);
          });
        }
        return r;
      },
      isTmpValid(){
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
      numPages(){
        return Math.ceil(this.total/this.currentLimit);
      },
      numVisible(){
        return this.cols.length - bbn.fn.count(this.cols, {hidden: true}) + (this.hasExpander ? 1 : 0);
      },
      numLeftVisible(){
        return this.colsLeft.length - bbn.fn.count(this.colsLeft, {hidden: true});
      },
      numMainVisible(){
        return this.colsMain.length - bbn.fn.count(this.colsMain, {hidden: true});
      },
      numRightVisible(){
        return this.colsRight.length - bbn.fn.count(this.colsRight, {hidden: true});
      },
      scroller:{
        get(){
          return this.$refs.scroller instanceof Vue ? this.$refs.scroller : null;
        },
        set(){
        },
      },
      currentPage: {
        get(){
          return Math.ceil((this.start+1)/this.currentLimit);
        },
        set(val){
          this.start = val > 1 ? (val-1) * this.currentLimit : 0;
          this.updateData();
        }
      },
      currentSet(){
        let res = [],
            isGroup = false,
            currentGroupValue,
            currentLink,
            data = this.currentData.slice(),
            o,
            realIndex = 0,
            end = data.length,
            aggregates = {
              tot: 0,
              num: 0,
              min: false,
              max: false,
              groups: []
            },
            aggregateModes = [],
            i = 0;
        if ( this.isAggregated ){
          let idx = bbn.fn.search(this.cols, {field: this.isAggregated});
          if ( idx > -1 ){
            aggregateModes = this.cols[idx].aggregate;
          }
        }
        if (
          (this.group !== false) &&
          (!this.isAjax  || !this.serverGrouping) &&
          this.cols[this.group] &&
          this.cols[this.group].field
        ){
          isGroup = true;
          let pos = bbn.fn.search(this.currentOrder, {field: this.cols[this.group].field});
          if ( pos !== 0 ){
            data = bbn.fn.order(data, this.cols[this.group].field);
          }
          else{
            data = bbn.fn.multiorder(data, this.currentOrder);
          }
        }
        if ( this.pageable && (!this.isAjax || !this.serverPaging) ){
          i = this.start;
          end = this.start + this.currentLimit > data.length ? data.length : this.start + this.currentLimit;
        }
        if ( this.tmpRow ){
          res.push({
            index: -1,
            data: this.tmpRow,
            selected: false,
            expander: true,
            isTmp: true
          });
        }
        while ( i < end ){
          let a = data[i];
          if ( isGroup && (currentGroupValue !== a[this.cols[this.group].field]) ){
            currentGroupValue = a[this.cols[this.group].field];
            res.push({group: true, index: i, value: currentGroupValue, data: a});
            currentLink = i;
            realIndex++;
          }
          o = {index: i, data: a};
          if ( this.selection ){
            o.selected = $.inArray(this.selectedRows, i) > -1;
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
          realIndex++;
          if ( this.expander && (
              !$.isFunction(this.expander) ||
              ($.isFunction(this.expander) && this.expander(a))
            )
          ){
            res.push({index: i, data: a, expansion: true});
            realIndex++;
          }
          i++;
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
              if ( !data[i] || (currentGroupValue !== data[i][this.cols[this.group].field]) ){
                let b = aggregates.groups[aggregates.groups.length-1];
                b.med = b.tot / b.num;
                $.each(aggregateModes, (k, c) => {
                  let tmp = {};
                  tmp[this.isAggregated] = b[c];
                  res.push({
                    index: i-1,
                    groupAggregated: true,
                    link: currentLink,
                    value: currentGroupValue,
                    name: c,
                    data: $.extend({}, a, tmp)
                  });
                });
              }
            }
            if ( i === end ){
              aggregates.med = aggregates.tot / aggregates.num;
              $.each(aggregateModes, (k, c) => {
                let tmp = {};
                tmp[this.isAggregated] = aggregates[c];
                res.push({
                  index: i,
                  aggregated: true,
                  name: c,
                  data: $.extend({}, a, tmp)
                });
              });
            }
          }
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
      titleGroupsCells(type){
        if ( this.titleGroups ){
          let cols = this.colsMain;
          if ( type === 'left' ){
            cols = this.colsLeft;
          }
          else if ( type === 'right' ){
            cols = this.colsRight;
          }
          let cells = [],
              group = false;
          $.each(cols, (i, a) => {
            if ( a.group === group ){
              cells[cells.length-1].colspan++;
            }
            else{
              if ( this.titleGroups[a.group] ){
                cells.push({
                  text: this.titleGroups[a.group].text || ' ',
                  style: this.titleGroups[a.group].style || {},
                  cls: this.titleGroups[a.group].class || '',
                  colspan: 1
                });
              }
              else if ( this.titleGroups.default ){
                cells.push({
                  text: this.titleGroups.default.text || ' ',
                  style: this.titleGroups.default.style || {},
                  cls: this.titleGroups.default.class || '',
                  colspan: 1
                });
              }
              else{
                cells.push({
                  text: ' ',
                  style: '',
                  cls: '',
                  colspan: 1
                });
              }
              group = a.group;
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
          this.currentFilters.conditions.push(filter);
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
      checkFilterWindow(e){
        if ( this.currentFilter ){
          if (
            (e.clientX < this.floatingFilterX) ||
            (e.clientX > this.floatingFilterX + 600) ||
            (e.clientY < this.floatingFilterY) ||
            (e.clientY > this.floatingFilterY + 200)
          ){
            if ( !this.floatingFilterTimeOut ){
              this.floatingFilterTimeOut = setTimeout(() => this.currentFilter = false, 500);
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
          return o;
        }
      },
      openMultiFilter(){
        this.$refs.popup.open({
          title: bbn._('Multi Filter'),
          component: {
            template: `<bbn-scroll><bbn-filter v-bind="source" @change="changeConditions"></bbn-filter></bbn-scroll>`,
            props: ['source'],
            methods: {
              changeConditions(o){
                bbn.vue.closest(this, 'bbn-table').currentFilters.logic = o.logic;
                bbn.fn.log("changeConditions", o)
              }
            },
          },
          source: {
            fields: $.grep(this.cols, (a) => {
              return a.filterable !== false;
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
        this.floatingFilterX = ev.pageX - 10 < 0 ? 0 : (ev.pageX - 10 + 600 > this.lastKnownWidth ? this.lastKnownWidth - 600 : ev.pageX - 10);
        this.floatingFilterY = ev.pageY - 10 < 0 ? 0 : (ev.pageY - 10 + 200 > this.lastKnownHeight ? this.lastKnownHeight - 200 : ev.pageY - 10);
        this.currentFilter = col;
      },
      edit(row, title, options){
        if ( !this.editable ){
          throw new Error("The table is not editable, you cannot use the edit function in bbn-table");
        }
        if ( !row ){
          this._addTmp();
          row = this.tmpRow;
        }
        this.editedRow = row;
        if ( this.editMode === 'popup' ){
          let popup = $.extend({
            source: {
              row: row,
              data: $.isFunction(this.data) ? this.data() : this.data
            },
            title: title ? title : bbn._('Untitled')
          }, options ? options : {});
          if ( this.editor ){
            popup.component = this.editor;
          }
          popup.afterClose = () => {
            this.currentData.push($.extend({}, this.tmpRow));
            this._removeTmp();
            this.editedRow = false;
          };
          this.$refs.popup.open(popup);
        }
      },

      /** @todo */
      remove(where){
        var vm = this,
            res = this.getRow(where);
        if ( res ){
          res.obj.remove();
          vm.widget.draw();
        }
      },

      save(){

      },

      select(){},

      /** @todo */
      add(data){
        this.widget.rows().add([data]);
        this.widget.draw();
      },

      delete(index, confirm){
        if ( this.currentData[index] ){
          let ev = $.Event('delete');
          this.$emit('beforeDelete', this.currentData[index], ev);
          if ( !ev.isDefaultPrevented() ){
            if ( confirm ){
              this.$refs.popup.confirm(confirm, () => {
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

      insert(data){
        this._addTmp(data);
        this.edit(this.tmpRow);
      },

      checkSelection(index){
        bbn.fn.log("checkSelection");
        let idx = $.inArray(index, this.selectedRows),
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

      _execCommand(button, data, col, index){
        return;
        bbn.fn.warning("_execCommand");
        bbn.fn.info("_execCommand");
        if ( button.command ){
          bbn.fn.warning("exists");
          if ( $.isFunction(button.command) ){
            bbn.fn.warning("isFunction");
            button.command(data, col, index);
            return;
          }
          else if ( (typeof(button.command) === 'string') && ($.inArray(button.command, METHODS4BUTTONS) > -1) ){
            bbn.fn.warning("isString");
            return this[button.command](data, col, index);
          }
        }
        return () => {return false;}
      },

      /** Refresh the current data set */
      updateData(){
        if ( this.isAjax && !this.isLoading ){
          this.isLoading = true;
          this._removeTmp();
          this.editedRow = false;
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
                this.total = result.total || result.data.length || 0;
                if ( result.order ){
                  this.currentOrder = [];
                  this.currentOrder.push({field: result.order, dir: (result.dir || '').toUpperCase() === 'DESC' ? 'DESC' : 'ASC'});
                }
              }
            })
          })
        }
        else if ( Array.isArray(this.source) ){
          this.currentData = this._map(this.source);
          this.total = this.source.length;
        }
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
              this.currentOrder[pos].dir = 'DESC';
            }
            else{
              this.currentOrder = [];
            }
          }
          else{
            this.currentOrder = [{field: f, dir: 'ASC'}];
          }
          this.updateData();
        }
      },

      updateTable(num){
        if ( !num ){
          num = 0;
        }
        if ( !this.isLoading && (num < 25) ){
          this.$nextTick(() => {
            let trs = $("table.bbn-table-main:first > tbody > tr", this.$el);
            bbn.fn.log("trying to update table, attempt " + num, trs);
            if ( this.colsLeft.length || this.colsRight.length ){
              trs.each((i, tr) =>{
                if ( $(tr).is(":visible") ){
                  bbn.fn.adjustHeight(
                    tr,
                    $("table.bbn-table-data-left:first > tbody > tr:eq(" + i + ")", this.$el),
                    $("table.bbn-table-data-right:first > tbody > tr:eq(" + i + ")", this.$el)
                  );
                }
              });
            }
            if (
              this.$refs.scroller &&
              $.isFunction(this.$refs.scroller.onResize)
            ){
              bbn.fn.log("RESIZING FOR UTABLKE");
              this.$refs.scroller.onResize();
              if (
                this.$refs.scrollerY &&
                $.isFunction(this.$refs.scrollerY.onResize)
              ){
                bbn.fn.log("SCROLLY HERE");
                if ( this.scrollableContainer !== this.$refs.scroller.$refs.scrollContainer ){
                  bbn.fn.log("CHANGING scrollableContainer");
                  this.scrollableContainer = this.$refs.scroller.$refs.scrollContainer;
                }
                this.$refs.scrollerY.onResize();
              }
            }
            this.$emit("resize");
          });
        }
      },

      _map(data){
        if ( this.map ){
          return $.map(data, this.map)
        }
        return data;
      },

      _overTr(idx, remove){
        $(".bbn-table-main:first > tbody > tr[index=" + idx + "]", this.$el)
          [remove ? 'removeClass' : 'addClass']("k-grid-header");
        if ( this.colsLeft.length ){
          $(".bbn-table-data-left:first > tbody > tr[index=" + idx + "]", this.$el)
            [remove ? 'removeClass' : 'addClass']("k-grid-header");
        }
        if ( this.colsRight.length ){
          $(".bbn-table-data-right:first > tbody > tr[index=" + idx + "]", this.$el)
            [remove ? 'removeClass' : 'addClass']("k-grid-header");
        }
      },

      /** Renders a cell according to column's config */
      render(data, column, index){
        let field = column && column.field ? column.field : '',
            value = data && column.field ? data[column.field] || '' : undefined;

        if ( column.render ){
          return column.render(data, index, column, value)
        }
        else if ( column.type ){
          switch ( column.type ){
            case "date":
              if ( column.format ){
                return value ? (new moment(value)).format(a.format) : '-';
              }
              else{
                return value ? bbn.fn.fdate(value) : '-';
              }
            case "email":
              return value ? '<a href="mailto:' + value + '">' + value + '</a>' : '-';
            case "url":
              return value ? '<a href="' + value + '">' + value + '</a>' : '-';
            case "number":
              return value ? kendo.toString(parseInt(value), "n0") + ( a.unit || this.unit ? " " + ( column.unit || this.unit ) : "") : '-';
            case "money":
              return value ?
                bbn.fn.money(value) + (
                  column.unit || this.currency ?
                    " " + ( column.unit || this.currency )
                    : ""
                )
                : '-';
            case "bool":
            case "boolean":
              return value && (value !== 'false') && (value !== '0') ? bbn._("Yes") : bbn._("No");
          }
        }
        else if ( column.source ){
          if ( value ){
            if ( Array.isArray(column.source) ){
              return bbn.fn.get_field(column.source, 'value', value, 'text');
            }
            else if ( column.source[value] !== undefined ){
              return column.source[value];
            }
            return bbn._("<em>?</em>");
          }
          return "<em>-</em>";
        }
        return value;
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
      _defaultRow(data){
        let res = {};
        if ( !data ){
          data = {};
        }
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
          }
        });
        return res;
      },


      cancel(){
        if ( this.tmpRow ){
          this._removeTmp();
        }
      },

      /** @todo */
      _addTmp(data){
        this._removeTmp().tmpRow = this._defaultRow(data);
        this.$nextTick(() => {
          this.updateTable();
        });
        this.$refs.scrollerY.scrollTo(0, true);
        return this;
      },

      /** @todo */
      _removeTmp(){
        if ( this.tmpRow ){
          this.tmpRow = false;
          this.$nextTick(() => {
            this.updateTable();
          });
        }
        return this;
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
      getColumns(){
        const vm = this;
        let res = [],
            fixed = true;
        $.each(vm.cols, function(i, a){
          bbn.fn.log("getColumns", a);
          var r = {
            data: a.field
          };
          if ( a.hidden ){
            r.visible = false;
          }
          if ( a.cls ){
            r.className = a.cls;
          }
          if ( a.title ){
            r.title = a.title;
          }
          if ( a.width ){
            r.width = typeof(a.width) === 'number' ? a.width + 'px' : a.width;
          }
          if ( a.render ){
            if ( $.isFunction(a.render) ){
              r.render = a.render;
            }
            else{
              var v = vm;
              while ( v ){
                if ( v[a.render] && $.isFunction(v[a.render]) ){
                  r.render = function(data, type, row){
                    return v[a.render](data, a.field, row);
                  };
                  break;
                }
                else{
                  v = v.$parent;
                }
              }
            }
            if ( !r.render ){
              r.render = function(data, type, row){
                var tmp = '(function(',
                    i = 0,
                    num = bbn.fn.countProperties(row);
                for ( var n in row ){
                  tmp += n;
                  i++;
                  if ( i !== num ){
                    tmp += ', ';
                  }
                  else{
                    tmp += '){ return (' + a.render + '); })(';
                    i = 0;
                    for ( var n in row ){
                      if ( typeof(row[n]) === 'string' ){
                        tmp += '"' + row[n].replace(/\"/g, '\\"') + '"';
                      }
                      else if ( typeof(row[n]) === "object" ){
                        tmp += JSON.stringify(row[n]);
                      }
                      else if ( row[n] === null ){
                        tmp += 'null'
                      }
                      else if ( row[n] === true ){
                        tmp += 'true'
                      }
                      else if ( row[n] === false ){
                        tmp += 'false'
                      }
                      else if ( row[n] === 0 ){
                        tmp += '0';
                      }
                      else{
                        tmp += row[n];
                      }
                      i++;

                      if ( i !== num ){
                        tmp += ', ';
                      }
                      else{
                        tmp += ');';
                      }
                    }
                  }
                }
                //bbn.fn.log(tmp);
                return eval(tmp);
              }
            }
          }
          else if ( a.source ){
            let obj = a.source;
            /** @todo Remove this case now that we have reactive properties */
            if ( typeof(a.source) === 'string' ){
              let v = vm;
              while ( v ){
                if ( v[a.source] !== undefined ){
                  obj = v;
                  break;
                }
                else{
                  v = v.$parent;
                }
              }
            }
            if ( obj ){
              r.render = function(data, type, row){
                if ( data ){
                  if ( Array.isArray(obj[a.source]) ){
                    return bbn.fn.get_field(obj[a.source], 'value', data, 'text');
                  }
                  else if ( obj[a.source][data] !== undefined ){
                    return obj[a.source][data];
                  }
                  return bbn._("<em>?</em>");
                }
                return "<em>-</em>";
              }
            }
          }
          else if ( a.type ){
            switch ( a.type ){
              case "date":
                if ( a.format ){
                  r.render = function(data){
                    return data ? (new moment(data)).format(a.format) : '-';
                  };
                }
                r.render = function(data){
                  return data ? bbn.fn.fdate(data) : '-';
                };
                break;
              case "email":
                r.render = function(data, type, row){
                  return data ? '<a href="mailto:' + data + '">' + data + '</a>' : '-';
                };
                break;
              case "url":
                r.render = function(data, type, row){
                  return data ? '<a href="' + data + '">' + data + '</a>' : '-';
                };
                break;
              case "number":
                r.render = function(data, type, row){
                  return data ? kendo.toString(parseInt(data), "n0") + ( a.unit || vm.unit ? " " + ( a.unit || vm.unit ) : "") : '-';
                };
                break;
              case "money":
                r.render = function(data, type, row){
                  return data ?
                    bbn.fn.money(data) + (
                      a.unit || vm.currency ?
                        " " + ( a.unit || vm.currency )
                        : ""
                    )
                    : '-';
                };
                break;
              case "bool":
              case "boolean":
                r.render = function(data, type, row){
                  return data && (data !== 'false') && (data !== '0') ? bbn._("Yes") : bbn._("No");
                };
                break;
            }
          }
          res.push(r);
        });
        return res;
      },

      /** @todo */
      addColumn(obj){
        if ( obj.aggregate && !$.isArray(obj.aggregate) ){
          obj.aggregate = [obj.aggregate];
        }
        this.cols.push(obj);
      },

      onResize(){
        if ( this.$refs.scrollerY ){
          this.$refs.scrollerY.onResize();
        }
        if ( this.$refs.scroller ){
          this.$refs.scroller.onResize();
        }
        this.init();
        this.updateTable();
        this.$emit("resize");
      },

      dataScrollContents(){
        if ( !this.colsLeft.length && !this.colsRight.length ){
          return null;
        }
        let r = [];
        if ( this.colsLeft.length && this.$refs.leftScroller && this.$refs.leftScroller.$refs.scrollContainer ){
          r.push(this.$refs.leftScroller.$refs.scrollContainer);
        }
        if ( this.$refs.scroller ){
          r.push(this.$refs.scroller.$refs.scrollContainer);
        }
        if ( this.colsRight.length && this.$refs.rightScroller && this.$refs.rightScroller.$refs.scrollContainer ){
          r.push(this.$refs.rightScroller.$refs.scrollContainer);
        }
        return r;
      },

      isExpanded(d){
        if ( !this.expander && (this.group === false) ){
          return true;
        }
        if ( this.expander ){
          return $.inArray(d.index, this.currentExpanded) > -1;
        }
        else{
          if ( $.inArray(d.index, this.currentExpanded) > -1 ){
            return true;
          }
          if ( (d.isGrouped || d.groupAggregated) && ($.inArray(d.link, this.currentExpanded) > -1) ){
            return true;
          }
          return false;
        }
      },

      toggleExpanded(idx){
        if ( this.currentData[idx] ){
          let i = $.inArray(idx, this.currentExpanded);
          if ( i > -1 ){
            this.currentExpanded.splice(i, 1);
          }
          else{
            this.currentExpanded.push(idx);
          }
          this.$nextTick(() => {
            this.updateTable();
          })
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
        return this.selection && ($.inArray(index, this.selectedRows) > -1);
      },

      hasTd(data, tdIndex){
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
        return true;
      },

      init(){
        let colsLeft = [],
            colsMain = [],
            colsRight = [],
            leftWidth = 0,
            mainWidth = 0,
            rightWidth = 0,
            numUnknown = 0,
            colButtons = false,
            isAggregated = false;
        if ( this.selection ){
          colsLeft.push({
            title: ' ',
            width: this.minimumColumnWidth,
            realWidth: this.minimumColumnWidth
          });
        }
        if ( this.hasExpander ){
          colsLeft.push({
            title: ' ',
            width: this.minimumColumnWidth,
            realWidth: this.minimumColumnWidth
          });
          leftWidth = this.minimumColumnWidth;
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
                a.realWidth = this.defaultColumnWidth;
                numUnknown++;
              }
              if ( a.buttons ){
                colButtons = i;
              }
            }
            if ( a.fixed ){
              if (
                (a.fixed !== 'right') &&
                ((this.fixedDefaultSide !== 'right') || (a.fixed === 'left'))
              ){
                colsLeft.push(a);
              }
              else{
                colsRight.push(a);
              }
            }
            else{
              colsMain.push(a);
            }
          }
        });
        let toFill = this.$el.clientWidth
          - (
            bbn.fn.sum(colsLeft, 'realWidth')
            + bbn.fn.sum(colsMain, 'realWidth')
            + bbn.fn.sum(colsRight, 'realWidth')
          );
        bbn.fn.log("THERE IS NOT TO FILL", toFill, numUnknown, this.$el.clientWidth, leftWidth, mainWidth, rightWidth);
        // We must arrive to 100% minimum
        if ( toFill > 0 ){
          bbn.fn.log("THERE IS TO FILL", toFill, numUnknown);
          if ( numUnknown ){
            let newWidth = Math.round(
              toFill
              / numUnknown
              * 100
            ) / 100;
            if ( newWidth < this.minimumColumnWidth ){
              newWidth = this.minimumColumnWidth;
            }
            $.each(this.cols, (i, a) => {
              if ( !a.hidden ){
                if ( !a.width ){
                  a.realWidth = newWidth + this.defaultColumnWidth;
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
        this.tableLeftWidth = bbn.fn.sum(colsLeft, 'realWidth');
        this.tableMainWidth = bbn.fn.sum(colsMain, 'realWidth');
        this.tableRightWidth = bbn.fn.sum(colsRight, 'realWidth');
        this.colsLeft = colsLeft;
        this.colsMain = colsMain;
        this.colsRight = colsRight;
        this.colButtons = colButtons;
        this.isAggregated = isAggregated;
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
          $.isFunction(col.options) ? col.options(col, data) : col.options
        ) : {};
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
        return res;
      },
    },

    created(){
      var vm = this;
      // Adding bbn-column from the slot
      if (vm.$slots.default){
        for ( var node of this.$slots.default ){
          //bbn.fn.log("TRYING TO ADD COLUMN", node);
          if (
            node.componentOptions &&
            (node.componentOptions.tag === 'bbn-column')
          ){
            //bbn.fn.log("ADDING COLUMN", node.componentOptions.propsData)
            vm.addColumn(node.componentOptions.propsData);
          }
          else if (
            (node.tag === 'bbn-column') &&
            node.data && node.data.attrs
          ){
            this.addColumn(node.data.attrs);
            //bbn.fn.log("ADDING COLUMN 2", node.data.attrs)
          }
        }
      }
    },

    mounted(){
      this.init();
      this.$forceUpdate();
      this.$nextTick(() => {
        this.selfEmit();
        this.updateData();
      })
    },
    watch: {
      editedRow: {
        deep: true,
        handler(newVal){
          bbn.fn.log("editedRow is changing", newVal);
        }
      },
      currentData(){
        this.$nextTick(() => {
          bbn.fn.log("WATCHER DATA");
          this.updateTable();
        })
      },
      cols: {
        deep: true,
        handler(){
          this.init();
        }
      },
      currentFilters: {
        deep: true,
        handler(){
          this.currentFilter = false;
          this.updateData();
        }
      },
    },
    components: {
      'bbn-columns': {
        template: '#bbn-tpl-component-column',
        props: {
          width: {
            type: [String, Number],
          },
          render: {
            type: [String, Function]
          },
          title: {
            type: [String, Number],
            default: bbn._("Untitled")
          },
          ftitle: {
            type: String
          },
          icon: {
            type: String
          },
          cls: {
            type: String
          },
          type: {
            type: String
          },
          field: {
            type: String
          },
          fixed: {
            type: [Boolean, String],
            default: false
          },
          hidden: {
            type: Boolean
          },
          encoded: {
            type: Boolean,
            default: false
          },
          sortable: {
            type: Boolean,
            default: true
          },
          editable: {
            type: Boolean,
            default: true
          },
          filterable: {
            type: Boolean,
            default: true
          },
          resizable: {
            type: Boolean,
            default: true
          },
          showable: {
            type: Boolean,
            default: true
          },
          nullable: {
            type: Boolean,
          },
          buttons: {
            type: [Array, Function]
          },
          source: {
            type: [Array, Object, String]
          },
          required: {
            type: Boolean,
          },
          options: {
            type: [Object, Function],
            default(){
              return {};
            }
          },
          editor: {
            type: [String, Object]
          },
          maxLength: {
            type: Number
          },
          sqlType: {
            type: String
          },
          aggregate: {
            type: [String, Array]
          },
          component: {
            type: [String, Object]
          },
          mapper: {
            type: Function
          }
        },
      }
    }
  });

})(jQuery, bbn);
