((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Data source component
     * @component listComponent
     */
    listComponent: {
      props: {
        /**
         * A function to transform the data.
         * @prop {Function} map
         * @memberof listComponent
         */
        map: {
          type: Function
        },
        /**
         * The limit of rows to be shown in a page of the table.
         * @prop {Number} [25] limit
         * @memberof listComponent
         */
        limit: {
          type: Number,
          default: 25
        },
        /**
         * @data {Array} {[10, 25, 50, 100, 250, 500]} limits
         */
        limits: {
          type: Array,
          default(){
            return [10, 25, 50, 100, 250, 500];
          },
        },
        /**
         * Set to true will automatically update the data before mount.
         * @prop {Boolean} [false] autobind
         * @memberof listComponent
         */
        autobind: {
          type: Boolean,
          default: true
        },
        /**
         * Set to true allows the table to divide itself in different pages basing on the property limit.
         * @prop {Boolean} [false] pageable
         * @memberof listComponent
         */
        pageable: {
          type: Boolean,
          default: false
        },
        /**
         * Set to true allows table's columns to be sortable.
         * @prop {Boolean} [false] sortable
         * @memberof listComponent
         */
        sortable: {
          type: Boolean,
          default: false
        },
        /**
         * Set to true allows the columns of the table to be filtered. A filter icon will appear at the top of each column.The property can be given to each column to define different behaviour.
         * @prop {Boolean} [false] filterable
         * @memberof listComponent
         */
        filterable: {
          type: Boolean,
          default: false
        },
        /**
         * Set to true enable the multifilter of the table. An icon will appear on the bottom right of the table. By clicking on the icon a popup with the multifilter will open.
         * @prop {Boolean} [false] multifilter
         * @memberof listComponent
         */
        multifilter: {
          type: Boolean,
          default: false
        },
        /**
         * In case of Ajax table, set to true will make an Ajax call for the data when changing page of the table.
         * @prop {Boolean} [true] serverPaging
         * @memberof listComponent
         */
        serverPaging: {
          type: Boolean,
          default: true
        },
        /**
         * In case of Ajax table, set to true will make an Ajax call for the sorting of the table.
         * @prop {Boolean} [true] serverSorting
         * @memberof listComponent
         */
        serverSorting: {
          type: Boolean,
          default: true
        },
        /**
         * In case of Ajax table, set to true will make an Ajax call for the filter of the table.
         * @prop {Boolean} [true] serverFiltering
         * @memberof listComponent
         */
        serverFiltering: {
          type: Boolean,
          default: true
        },
        /**
         * Defines the order of the columns in the table.
         * @prop {Array|Object} [[]] order
         * @memberof listComponent
         */
        order: {
          type: [Array, Object],
          default () {
            return [];
          }
        },
        /**
         * Defines the filters of the table.
         * @prop {Object} [{logic: 'AND',conditions: []}] filters
         * @memberof listComponent
         */
        filters: {
          type: Object,
          default () {
            return {
              logic: 'AND',
              conditions: []
            };
          }
        },
        /**
         * If the prop selection is set to true defines which rows have to be selected.
         * @prop {Array} selected
         * @memberof listComponent
         */
        selected: {
          type: Array,
          default(){
            return [];
          }
        },
        /**
         * Set to true shows a checkbox in each rows in the first column of the table.
         * @prop {Boolean|Function} selection
         * @memberof listComponent
         */
        selection: {
          type: [Boolean, Function],
          default: false
        },
        /**
         * Set to true selecting an item will unselect any other selected item.
         * @prop {Boolean} multiple
         * @memberof listComponent
         */
        multiple: {
          type: Boolean,
          default: false
        },
        /**
         * Given to a column that has the property type set to 'money' defines the currency.
         * @prop {String} currency
         * @memberof listComponent
         */
        currency: {
          type: String
        },
        /**
         * The data sent in the ajax call.
         * @prop {String|Function} [{}] data
         * @memberof listComponent
         */
        data: {
          type: [Object, Function],
          default () {
            return {};
          }
        },
        /**
         * Defines the message to show when the table has no data.
         * @prop {String} ['No data...'] noData
         * @memberof listComponent
         */
        noData: {
          type: String,
          default: bbn._('No data') + '...'
        },
        uid: {
          type: String
        },
        /**
         * The source of the component.
         * @prop {Array|Object|String|Function} source
         * @memberof listComponent
         */
        source: {
          type: [Array, Object, String, Function],
          default(){
            return [];
          }
        },
        /**
         * The name of the property to be used as text.
         * @prop {String} ['text'] sourceText
         * @memberof listComponent
         */
        sourceText: {
          type: String,
          default: "text"
        },
        /**
         * The name of the property to be used as value.
         * @prop {String} ['value'] sourceValue
         * @memberof listComponent
         */
        sourceValue: {
          type: String,
          default: "value"
        },
        /**
         * If source is a function this index can be passed to the function.
         * @prop {Number} sourceIndex
         * @memberof listComponent
         */
        sourceIndex: {
          type: Number
        },
        /**
         * The name of the property to use for children of hierarchical source
         * @prop {String} [items] children
         * @memberof listComponent
         */
        children: {
          type: String,
          default: 'items'
        },
        /**
         * A component for each element of the list.
         *
         * @prop component
         */
        component: {},
        /**
         * The template to costumize the dropdown menu.
         *
         * @prop template
         */
        template: {},
        query: {
          type: String
        },
        queryValues: {
          type: Object
        }
      },
      data(){
        let order = this.order;
        if (this.sortable && this.order && (typeof this.order === 'object') && !Array.isArray(this.order)) {
          order = [];
          for (let n in this.order) {
            order.push({
              field: n,
              dir: this.order[n]
            });
          }
        }
        return {
          /**
           * @data {Boolean} [false] _1strun
           */
          _1strun: false,
          /**
           * @data {Boolean, Promise} [false] _dataPromise
           */
          _dataPromise: false,
          /**
           * @data {Boolean} [false] auto If source is a URL and auto is set to true, component will fetch data at mount.
           */
          auto: true,
          /**
           * @data {String} [false] currentTemplate
           */
          currentTemplate: this.template,
          /**
           * @data {Boolean} [false] currentIndex
           */
          currentIndex: false,
          /**
           * @data {Boolean} [false] currentFilter
           */
          currentFilter: false,
          /**
           * @data {Object} currentFilters
           */
          currentFilters: bbn.fn.clone( this.filters),
          /**
           * @data {Number} [25] currentLimit
           */
          currentLimit: this.limit,
          /**
           * @data {Number} [0] currentStart
           */
          currentStart: this.start,
          /**
           * @data {Object} currentOrder
           */
          currentOrder: order,
          /**
           * @data {Array} [[]] currentData
           */
          currentData: [],
          /**
           * @data {Number} [0] currentTotal
           */
          currentTotal: 0,
          /**
           * @data {Number} [0] start
           */
          start: 0,
          /**
           * @data {Number} [0] total
           */
          total: 0,
          /**
           * @data {Boolean} [false] isLoading
           */
          isLoading: false,
          /**
           * Return true if the source of the table is a string.
           * @data {Boolean} isAjax
           */
          isAjax: typeof this.source === 'string',
          /**
           * @todo change name
           * @data {Array} [[]] selectedRows
           */
          currentSelected: this.selected.slice(),
          isFilterable: this.filterable,
          hasSelection: !!this.selection,
          /**
           * @data [null] originalData
           */
          originalData: null,
          /**
           * @data {String} filterString
           */
          filterString: this.textValue || '',
          /**
           * @data {false, Number} filterTimeout
           */
          filterTimeout: false,
          currentQuery: this.query,
          currentQueryValues: this.queryValues || {},
          loadingRequestID: false
        };
      },
      computed: {
        currentLimits(){
          if (!this.pageable){
            return [];
          }
          let pass = false;
          return bbn.fn.filter(this.limits.sort(), (a) => {
            if ( a > this.total ){
              if ( !pass ){
                pass = true;
                return true;
              }
              return false;
            }
            return true;
          });
        },
        hasComponent(){
          return this.component || this.currentTemplate ? true : false;
        },
        realComponent(){
          let cp = this.component || null;
          if (!cp && this.currentTemplate) {
            cp = {
              props: ['source'],
              data(){
                return this.source;
              },
              template: this.currentTemplate
            };
          }
          return cp;
        },
        /**
         * Return the number of pages of the table.
         * @computed numPages
         * @return {number}
         */
        numPages() {
          return Math.ceil(this.total / this.currentLimit);
        },
        /**
         * Return the current page of the table.
         * @computed currentPage
         * @fires updateData
         * @return {Number}
         */
        currentPage: {
          get() {
            return Math.ceil((this.start + 1) / this.currentLimit);
          },
          set(val) {
            if ( this.ready ) {
              this.start = val > 1 ? (val - 1) * this.currentLimit : 0;
              this.updateData();
            }
          }
        },
        filteredData(){
          if (this.currentData.length && this.currentFilters &&
                                this.currentFilters.conditions &&
                                this.currentFilters.conditions.length &&
                                (!this.serverFiltering || !this.isAjax)
          ) {
            return bbn.fn.filter(this.currentData, (a) => {
              return this._checkConditionsOnItem(this.currentFilters, a.data);
            });
          }
          else{
            return this.currentData;
          }
        },
        /** @todo Remove: no sense and not used in any component */
        valueIndex(){
          if ( this.value || (this.selected && this.selected.length) ){
            let v = this.value || this.selected[0];
            if ( this.uid ){
              return bbn.fn.search(this.filteredData, (a) => {
                return a.data[this.uid] === v;
              });
            }
            else if ( this.sourceValue ){
              return bbn.fn.search(this.filteredData, (a) => {
                return a.data[this.sourceValue] === v;
              });
            }
          }
          return -1;
        },
        isAutobind(){
          if (
            (this.autobind === false) ||
            (this.isAjax && this.autocomplete && (this.filterString.length < this.minLength))
          ){
            return false;
          }
          return true;
        },

      },
      methods: {
        /**
         * Returns the data changed using the function given in the prop map.
         * @method _map
         * @param data
         */
        _map(data) {
          if ( bbn.fn.isArray(data) ){
            if ( data.length && !bbn.fn.isObject(data[0]) && this.sourceValue && this.sourceText ){
              data = data.map((a) => {
                let o = {};
                o[this.sourceValue] = a;
                o[this.sourceText] = a;
                return o;
              });
            }
            return (this.map ? data.map(this.map) : data).slice();
          }
          return [];
        },
        /**
         * Compares the values of the given row basing on the where operator and value.
         *  
         * @method _checkConditionsOnItem
         * @param {Object} where 
         * @param {Object} row 
         * @return {Boolean}
         */
        _checkConditionsOnItem(where, row) {
          let pass = false;
          if (where.conditions && where.logic && (typeof row === 'object')) {
            pass = where.logic !== 'OR';
            for (let i = 0; i < where.conditions.length; i++) {
              let cond = where.conditions[i],
                res = true;
              if (cond.conditions && cond.logic) {
                res = this._checkConditionsOnItem(cond, row);
              }
              else if (cond.field && cond.operator) {
                res = bbn.fn.compare(row[cond.field], cond.value || null, cond.operator);
              }
              if (!res && where.logic !== 'OR') {
                pass = false;
                break;
              }
              else if (res && where.logic === 'OR') {
                pass = true;
                break;
              }
            }
          }
          return pass;
        },
        /**
         * @method select
         */
        select(){
          //this.$emit('select', this.currentIndex);
        },
        /**
         * Pushes the given filter in the currentFilters of the table.
         * @method onSetFilter
         * @param {Object} filter 
         */
        onSetFilter(filter) {
          if (filter && filter.field && filter.operator) {
            if (this.multi) {
              this.currentFilters.conditions.push(filter);
            }
            else if (filter.field) {
              let idx = bbn.fn.search(this.currentFilters.conditions, {
                field: filter.field
              });
              if (idx > -1) {
                this.currentFilters.conditions.splice(idx, 1, filter);
              }
              else {
                this.currentFilters.conditions.push(filter);
              }
            }
          }
        },
        /**
         * Fires the method removeFilter to remove a group of conditions from currentFilters.
         * @method onUnsetFilter
         * @param {Object} filter
         * @fires removeFilter
         */
        onUnsetFilter(filter) {
          //bbn.fn.log("onUnset", filter);
          this.removeFilter(filter);
        },
        /**
         * Removes a group of conditions from currentFilters.
         * @method removeFilter
         * @param {Object} condition
         * @fires getPopup
         */
        removeFilter(condition) {
          if (condition.time) {
            //bbn.fn.log("There is the time", condition);
            let del = (arr) => {
              let idx = bbn.fn.search(arr, {
                time: condition.time
              });
              //bbn.fn.log("Is there the index?", idx);
              if (idx > -1) {
                if (arr[idx].conditions && arr[idx].conditions.length) {
                  this.getPopup().confirm(bbn._("Are you sure you want to delete this group of conditions?"), () => {
                    arr.splice(idx, 1);
                    if (window.appui) {
                      window.appui.success();
                    }
                  })
                }
                else {
                  arr.splice(idx, 1);
                  if (window.appui) {
                    window.appui.success();
                  }
                }
                return true;
              }
              for (let i = 0; i < arr.length; i++) {
                if (arr[i].conditions) {
                  if (del(arr[i].conditions)) {
                    return true;
                  }
                }
              }
            };
            if (del(this.currentFilters.conditions)) {
              this.$forceUpdate();
            }
          }
        },
        /**
         * Unsets the current filter.
         * @method unsetFilter
         */
        unsetFilter() {
          this.currentFilters = bbn.fn.clone(this.filters);
          this.currentFilter = false;
          this.editedFilter = false;
        },
        /**
         * Unsets the current filter.
         * @method unsetCurrentFilter
         * 
         */
        unsetCurrentFilter() {
          if (this.editedFilter) {
            let idx = bbn.fn.search(this.currentFilters.conditions, {
              time: this.editedFilter.time
            });
            if (idx > -1) {
              this.currentFilters.conditions.splice(idx, 1)
            }
          }
        },
        getPostData(){
          if ( this.data ){
            return bbn.fn.isFunction(this.data) ? this.data() : this.data;
          }
          return {};
        },
        beforeUpdate(){
          let e = new Event('beforeUpdate', {cancelable: true});
          this.$emit('beforeUpdate', e);
          return e.defaultPrevented ? false : true;
        },
        afterUpdate(){
          return true;
        },
        updateData(){
          if (this.beforeUpdate() !== false) {
            this._dataPromise = new Promise((resolve) => {
              let prom;
              let loadingRequestID;
              if ( this.isAjax ){
                if (this.loadingRequestID) {
                  bbn.fn.abort(this.loadingRequestID);
                }
                this.isLoading = true;
                this.$emit('startloading');
                let data = {
                  limit: this.currentLimit,
                  start: this.start,
                  data: this.getPostData()
                };
                if ( this.sortable ){
                  data.order = this.currentOrder;
                }
                if ( this.isFilterable ){
                  data.filters = this.currentFilters;
                }
                if ( this.showable ){
                  data.fields = this.shownFields;
                }
                loadingRequestID = bbn.fn.getIdURL(this.source, data);
                this.loadingRequestID = loadingRequestID;
                prom = this.post(this.source, data);
              }
              else{
                prom = new Promise((resolve2) => {
                  let data = [];
                  if ( bbn.fn.isArray(this.source) ){
                    data = this.source;
                  }
                  else if ( bbn.fn.isFunction(this.source) ){
                    data = this.source(this.sourceIndex);
                  }
                  else if ( bbn.fn.isObject(this.source) ){
                    bbn.fn.iterate(this.source, (a, n) => {
                      let o = {};
                      o[this.sourceValue] = n;
                      o[this.sourceText] = a;
                      data.push(o);
                    });
                  }
                  resolve2({
                    data: data,
                    total: data.length
                  });
                });
              }
              prom.then((d) => {
                if ( this.loadingRequestID && (this.loadingRequestID === loadingRequestID)){
                  this.isLoading = false;
                  this.loadingRequestID = false;
                  if ( !d ){
                    return;
                  }
                  if ( d.status !== 200 ){
                    d.data = undefined;
                  }
                  else{
                    d = d.data;
                  }
                  this.$emit('dataReceived', d);
                }
                if ( d && bbn.fn.isArray(d.data) ){
                  if (d.data.length && d.data[0]._bbn){
                    this.currentData = d.data;
                    this.updateIndexes();
                  }
                  else{
                    d.data = this._map(d.data);
                    this.currentData = bbn.fn.map(d.data, (a, i) => {
                      let o = {
                        data: a,
                        index: i,
                        _bbn: true
                      };
                      if ( this.children && a[this.children] && a[this.children].length ){
                        o.opened = true;
                      }
                      if (this.hasSelection){
                        if ( this.uid ){
                          o.selected = this.selected.includes(a[this.uid]);
                        }
                        else if ( this.sourceValue ){
                          o.selected = this.selected.includes(a[this.sourceValue]);
                        }
                      }
                      return o;
                    });
                  }
                  if (d.query) {
                    this.currentQuery = d.query;
                    this.currentQueryValues = d.queryValues || {};
                  }
                  this.total = d.total || 0;
                  if (d.order) {
                    this.currentOrder.splice(0, this.currentOrder.length);
                    this.currentOrder.push({
                      field: d.order,
                      dir: (d.dir || '').toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
                    });
                  }
                  /** @todo Observer part to dissociate */
                  if (d.observer && bbn.fn.isFunction(this.observerCheck) && this.observerCheck()) {
                    this._observerReceived = d.observer.value;
                    this.observerID = d.observer.id;
                    this.observerValue = d.observer.value;
                    if ( !this._1strun ){
                      this.observerWatch();
                    }
                  }
                  if ( !this._1strun ){
                    this._1strun = true;
                    this.$emit('firstrun');
                  }
                }
                this.afterUpdate();
                resolve(this.currentData);
                this.$emit('dataloaded');
                //this._dataPromise = false;
              });
            });
            return this._dataPromise;
          }
        },
        updateIndexes(){
          if (this.currentData.length) {
            bbn.fn.each(this.currentData, (a, i) => {
              if (a.index !== i) {
                this.$set(this.currentData[i], 'index', i);
                //a.index = i;
              }
            });
          }
        },
        /**
         * Deletes the row defined by param index.
         * @method realDelete
         * @emit delete
         * @param {Number} index
         */
        realDelete(index) {
          if (this.currentData[index]) {
            let ev = new Event('delete');
            if (this.url) {
              this.post(this.url, bbn.fn.extend({}, this.data, this.currentData[index].data, {
                action: 'delete'
              }), (d) => {
                if (d.success) {
                  let data = this.currentData[index].data;
                  this.currentData.splice(index, 1);
                  this.total--;
                  this.updateIndexes();
                  this.$emit('delete', data, ev);
                  if (window.appui) {
                    window.appui.success(bbn._('Deleted successfully'))
                  }
                }
                else {
                  this.alert(bbn._("Impossible to delete the row"))
                }
              })
            } else {
              let row = this.currentData.splice(index, 1);
              this.total--;
              if (this.originalData) {
                this.originalData.splice(index, 1);
              }
              this.updateIndexes();
              this.$emit('delete', row[0], ev);
            }
          }
        },
        /**
         * Add the given row to currentData
         * @method add
         * @param {Object} data
         * @todo
         *
         */
        add(data) {
          this.currentData.push({
            data: data,
            index: this.currentData.length
          });
        },
        /**
         * Fires the method realDelete to delete the row.
         * @method delete
         * @param {Number} index
         * @param {Strimg} confirm
         * @fires realDelete
         * @emit beforeDelete
         */
        delete(index, confirm) {
          if (this.filteredData[index]) {
            let ev = new Event('delete', {cancelable: true});
            this.$emit('beforeDelete', this.filteredData[index].data, ev);
            if (!ev.defaultPrevented) {
              if (confirm === undefined) {
                confirm = this.confirmMessage;
              }
              if (confirm) {
                this.confirm(confirm, () => {
                  this.realDelete(this.filteredData[index].index);
                });
              }
              else {
                this.realDelete(this.filteredData[index].index);
              }
            }
          }
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
         * Removes the row defined by the where param from currentData
         * @method remove
         * @param {Object} where
         */
        remove(where) {
          let idx;
          while ((idx = bbn.fn.search(this.filteredData, a => {
            bbn.fn.log("COMPOARE", a.data);
            return bbn.fn.compareConditions(a.data, where);
          })) > -1) {
            this.realDelete(this.filteredData[idx].index, 1);
          }
          this.$forceUpdate();
        },
      },
      beforeMount(){
        if ( this.isAutobind ){
          this.updateData();
        }
      },
      watch: {
        /**
         * @watch currentLimit
         * @fires setConfig
         */
        currentLimit() {
          if ( this.ready && bbn.fn.isFunction(this.setConfig) ){
            this.setConfig(true);
          }
        },
        /**
         * @watch currentFilters
         * @fires updateData
         * @fires setConfig
         */
        currentFilters: {
          deep: true,
          handler() {
            if (this.ready) {
              this.currentFilter = false;
              this.updateData();
              if ( bbn.fn.isFunction(this.setConfig) ){
                this.setConfig(true);
              }
              this.$forceUpdate();
            }
          }
        },
        /**
         * @watch currentOrder
         * @fires setConfig
         */
        currentOrder: {
          deep: true,
          handler() {
            if (this.ready) {
              if ( bbn.fn.isFunction(this.setConfig) ){
                this.setConfig(true);
              }
              this.$forceUpdate();
            }
          }
        },
        source: {
          deep: true,
          handler(){
            if (this.ready) {
              /*
              this.updateData();
              */
            }
          }
        }
      }
    }
  });
})(bbn);