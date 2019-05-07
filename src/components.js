((bbn) => {
  "use strict";
  const
    editorOperators = {
      string: {
        contains: bbn._('Contient'),
        eq: bbn._('Est'),
        neq: bbn._('N’est pas'),
        startswith: bbn._('Commence par'),
        doesnotcontain: bbn._('Ne contient pas'),
        endswith: bbn._('Se termine par'),
        isempty: bbn._('Est vide'),
        isnotempty: bbn._('N’est pas vide')
      },
      number: {
        eq: bbn._('Est égal à'),
        neq: bbn._('N’est pas égal à'),
        gte: bbn._('Est supérieur ou égal à'),
        gt: bbn._('Est supérieur à'),
        lte: bbn._('Est inférieur ou égal à'),
        lt: bbn._('Est inférieur à'),
      },
      date: {
        eq: bbn._('Est égal à'),
        neq: bbn._('N’est pas égal à'),
        gte: bbn._('Est postérieur ou égal à'),
        gt: bbn._('Est postérieur à'),
        lte: bbn._('Est antérieur ou égal à'),
        lt: bbn._('Est antérieur à'),
      },
      enums: {
        eq: bbn._('Est égal à'),
        neq: bbn._('N’est pas égal à'),
      },
      boolean: {
        istrue: bbn._('Est vrai'),
        isfalse: bbn._('Est faux')
      }
    },
    editorNullOps = {
      isnull: bbn._('Est nul'),
      isnotnull: bbn._('N’est pas nul')
    },
    editorNoValueOperators = ['', 'isnull', 'isnotnull', 'isempty', 'isnotempty', 'istrue', 'isfalse'];

  bbn.fn.autoExtend("vue", {
    emptyComponent: {
      template: '<template><slot></slot></template>',
      created(){
        this.componentClass.push('bbn-empty-component');
      },
    },
	
	/**
	 * Basic Component.
	 *
	 * @component basicComponent
	 */
    basicComponent: {
      props: {
        /**
         * The classes to add to the component.
         * @prop {Array} [] componentClass
         * @memberof basicComponent
         */
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        },
      },
      data(){
        return bbn.fn.extend({
          /**
           * @data {Boolean} [false] isMounted
           * @memberof basicComponent
           */
          isMounted: false,
          /**
           * @data {Boolean} [false] ready
           * @memberof basicComponent
           */
          ready: false,
        }, bbn.vue.defaults[this.$options.name.slice(4)] || {})
      },
      methods: {
        defaultFunction(fn, mixin){
          if ( bbn.vue[mixin + 'Component'] && bbn.vue[mixin + 'Component'][fn] ){
            return bbn.vue[mixin + 'Component'][fn].apply(this);
          }
        },
      },
      /**
       * @memberof basicComponent
       * @event beforeCreate
       */
      beforeCreate(){
        if ( !this.$options.render && !this.$options.template && this.$options.name ){
          this.$options.template = '#bbn-tpl-component-' + this.$options.name.slice(4);
        }
      },
      /**
       * Gives the class bbn-basic-component to the component
       * @event created
       * @memberof basicComponent
       */
      created(){
        if ( this.$options.name && (this.componentClass.indexOf(this.$options.name) === -1) ){
          this.componentClass.push(this.$options.name);
        }
        this.componentClass.push('bbn-basic-component');
      },
      /**
       * @event mounted
       * @emit mounted
       * @memberof basicComponent
       */
      mounted(){
        this.isMounted = true;
        this.$emit('mounted', this);
      },
      watch: {
        /**
         * @watch ready
         * @emit ready
         * @memberof basicComponent
         */
        ready(newVal){
          if ( newVal ){
            let ev = new Event('ready', {bubbles: true});
            this.$el.dispatchEvent(ev);
            this.$emit('ready', this);
          }
        }
      }
    },
    /**
     * Focus Component
     * @component focusComponent
     */
    focusComponent: {
      data(){
        return {
          /**
           * @data {Boolean} focusedComponent
           * @memberof focusComponent
           */
          focusedComponent: bbn.env.focused
        }
      },
      /**
       * @event mounted
       * @memberof focusComponent
       */
      mounted(){
        this.$el.focus();
      },
      /**
       * @event beforeDestroy
       * @memberof focusComponent
       */
      beforeDestroy(){
        if ( this.focusedComponent ){
          this.focusedComponent.focus();
        }
      }
    },
    /**
     * local storage component
     * @component localStorageComponent
     */
    localStorageComponent: {
      props: {
        /**
         * @prop {Boolean} [false] storage
         * @memberof localStorageComponent
         */
        storage: {
          type: Boolean,
          default: false
        },
        /**
         * The name of the storage.
         * @prop {String} ['default'] storageName
         * @memberof localStorageComponent
         */
        storageName: {
          type: String,
          default: 'default'
        },
        /**
         * The fullname of the storage.
         * @prop {String} storageFullName
         * @memberof localStorageComponent
         */
        storageFullName: {
          type: String
        },
        /**
         * The classes to give to the component.
         * @prop {Array} [] componentClass
         * @memberof localStorageComponent
         */
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      computed: {
        /**
         * @memberof localStorageComponent
         * @computed storage
         */
        _storage(){
          if ( window.store ){
            return {
              get(name){
                let tmp = window.store.get(name);
                if ( tmp ){
                  return tmp.value;
                }
              },
              set(name, value){
                return window.store.set(name, {
                  value: value,
                  time: (new Date()).getTime()
                });
              },
              time(name){
                let tmp = window.store.get(name);
                if ( tmp ){
                  return tmp.time;
                }
              },
              remove(name){
                return window.store.remove(name);
              }
            }
          }
          return false;
        },
        /**
         * Returns if the component has storage.
         * @memberof localStorageComponent
         * @computed {Boolean} hasStorage
         */
        hasStorage(){
          return (this.storage || (this.storageFullName || (this.storageName !== 'default'))) && !!this._storage;
        },
      },
      methods: {
        /**
         * Returns the complete path of the storage.
         * @method _getStorageRealName
         * @param {String} name 
         * @return {String}
         * @memberof localStorageComponent
         */
        _getStorageRealName(name){
          if ( this.storageFullName ){
            return this.storageFullName;
          }
          let st = '';
          if ( this.$options.name ){
            st += this.$options.name + '-';
          }
          if ( name ){
            st += name;
          }
          else{
            st += window.location.pathname.substr(1) + '-' + this.storageName;
          }
          return st;
        },
        /**
         * Returns the computed _storage
         * @method getStorage
         * @param {String} name 
         * @return {Boolean|String}
         * @memberof localStorageComponent
         */
        getStorage(name, isFullName){
          if ( this.hasStorage ){
            return this._storage.get(isFullName ? name : this._getStorageRealName(name))
          }
          return false;
        },
        /**
         * Sets the computed _storage.
         * @method setStorage
         * @param value 
         * @param {String} name 
         * @memberof localStorageComponent
         */
        setStorage(value, name, isFullName){
          if ( this.hasStorage ){
            return this._storage.set(isFullName ? name : this._getStorageRealName(name), value)
          }
          return false;
        },
        /**
         * Unsets the computed _storage.
         * @method unsetStorage
         * @param {String} name 
         * @memberof localStorageComponent
         */
        unsetStorage(name, isFullName){
          if ( this.hasStorage ){
            return this._storage.remove(isFullName ? name : this._getStorageRealName(name))
          }
          return false;
        }
      },
      /**
       * Gives the class bbn-local-storage-component to the component.
       * @event created
       * @memberof localStorageComponent
       */
      created(){
        if ( this.hasStorage ){
          this.componentClass.push('bbn-local-storage-component');
        }
      },
    },
    /**
     * data component
     * @component dataComponent
     */
    dataComponent: {
      methods: {
        /**
         * Defines how to render the data.
         * @method renderData
         * @param {Object} data
         * @param {Object} cfg
         * @memberof dataComponent
         */
        renderData(data, cfg){
          if ( !cfg.field || !data ){
            return '';
          }
          let v = data[cfg.field] || '';
          if ( cfg.icon ){
            return '<i class="' + cfg.icon + '"> </i>'
          }
          else if ( cfg.type ){
            switch ( cfg.type ){
              case "datetime":
                if ( cfg.format ){
                  return v ? (new moment(v)).format(cfg.format) : '-';
                }
                else{
                  return v ? bbn.fn.fdate(v) : '-';
                }
                break;
              case "date":
                if ( cfg.format ){
                  return v ? (new moment(v)).format(cfg.format) : '-';
                }
                else{
                  return v ? bbn.fn.fdate(v) : '-';
                }
                break;
              case "time":
                if ( cfg.format ){
                  return v ? (new moment(v)).format(cfg.format) : '-';
                }
                else{
                  return v ? bbn.fn.fdate(v) : '-';
                }
                break;
              case "email":
                return v ? '<a href="mailto:' + v + '">' + v + '</a>' : '-';
                break;
              case "url":
                return v ? '<a href="' + v + '">' + v + '</a>' : '-';
                break;
              case "percent":
                return v ? bbn.fn.money(v * 100, false, "%", '-', '.', ' ', 2) : '-';
                break;
              case "number":
                return v ?
                  bbn.fn.money(
                    v,
                    (cfg.precision === -4) || (cfg.format && (cfg.format.toLowerCase() === 'k')),
                    cfg.unit || "",
                    '-',
                    '.',
                    ' ',
                    cfg.precision === -4 ? 3 : (cfg.precision || 0)
                  ) : '-';
                break;
              case "money":
                return v ?
                  bbn.fn.money(
                    v,
                    (cfg.precision === -4) || (cfg.format && (cfg.format.toLowerCase() === 'k')),
                    cfg.currency || cfg.unit || "",
                    '-',
                    ',',
                    ' ',
                    cfg.precision === -4 ? 3 : cfg.precision
                  ) : '-';
                break;
              case "bool":
              case "boolean":
                let isYes = v && (v !== 'false') && (v !== '0');
                if ( cfg.yesvalue !== undefined ){
                  isYes = v === cfg.yesvalue;
                }
                return '<i class="nf nf-fa-' + (isYes ? 'check' : 'times') + '" title="' + (isYes ? bbn._("Yes") : bbn._("No")) + '"></i>';
                break;
            }
          }
          else if ( cfg.source ){
            let idx = bbn.fn.search(cfg.source, {value: v});
            return idx > -1 ? cfg.source[idx].text : '-';
          }
          else {
            return v || '';
          }          
        }
      }
    },
    /**
     * dataEditorComponent
     * @component dataEditorComponent
     */
    dataEditorComponent: {
      props: {
        /**
         * The classes to give to the component.
         * @prop {Array} componentClass
         * @memberof dataEditorComponent
         */
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      methods: {
        /**
         * @memberof dataEditorComponent
         * @method editorOperatorType
         * @param {Object} col 
         */
        editorOperatorType(col){
          if ( col.field ){

          }
        },
        /**
         * @memberof dataEditorComponent
         * @method editorHasNoValue
         * @param {*} operator 
         */
        editorHasNoValue(operator){
          return editorNoValueOperators.indexOf(operator) > -1;
        },
        /**
         * Defines the correct editor for the given col.
         * @method editorGetComponentOptions
         * @param {Object} col
         * @memberof dataEditorComponent
         */
        editorGetComponentOptions(col){
          let o = {
            type: 'string',
            component: 'bbn-input',
            multi: false,
            componentOptions:  {}
          };
          if ( col && col.field ){
            o.field = col.field;
            if ( col.filter ){
              o.component = col.filter;
            }
            else if ( col.source ){
              o.type = 'enums';
              o.component = 'bbn-dropdown';
              o.componentOptions.source = col.source;
              o.componentOptions.placeholder = bbn._('Choose');
            }
            else if ( col.type ){
              switch ( col.type ){
                case 'number':
                case 'money':
                  o.type = 'number';
                  o.component = 'bbn-numeric';
                  break;
                case 'date':
                  o.type = 'date';
                  o.component = 'bbn-datepicker';
                  break;
                case 'time':
                  o.type = 'date';
                  o.component = 'bbn-timepicker';
                  break;
                case 'datetime':
                  o.type = 'date';
                  o.component = 'bbn-datetimepicker';
                  break;
              }
            }
            if ( col.componentOptions ){
              bbn.fn.extend(o.componentOptions, col.componentOptions);
            }
            if ( o.type && this.editorOperators[o.type] ){
              o.operators = this.editorOperators[o.type];
            }
            o.fields = [col];
          }
          return o
        },

      },
      computed: {
        /**
         * The object containing the text for the different operator values.
         * @computed {Object} editorOperators
         * @memberof dataEditorComponent
         */
        editorOperators(){
          return editorOperators;
        },
        /**
         * The object containing the text for the case null or not null values.
         * @computed {Object} editorNullOps
         * @memberof dataEditorComponent
         */
        editorNullOps(){
          return editorNullOps;
        },
        /**
         * @computed {Array} editorNoValueOperators
         * @memberof dataEditorComponent
         */
        editorNoValueOperators(){
          return editorNoValueOperators;
        }
      },
      /**
       * Gives the class 'bbn-data-editor-component' to the component.
       * @event created
       * @memberof dataEditorComponent
       */
      created(){
        this.componentClass.push('bbn-data-editor-component');
      },
    },
    /**
     * eventsComponent
     * @component eventsComponent
     */
    eventsComponent: {
      props: {
        /**
         * The classes to give to the component.
         * @memberof eventsComponent
         * @prop {Array} [] componentClass 
         */
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      data(){
        return {
          /**
           * @memberof eventsComponent
           * @data {Boolean} [false] isTouched
           */
          isTouched: false,
          isFocused: false
        }
      },
      methods: {
        /**
         * Emits the click event.
         * @method click
         * @param e 
         * @emit click
         * @memberof eventsComponent
         */
        click(e){
          this.$emit('click', e)
        },
        /**
         * Emits the blur event.
         * @method blur
         * @param e
         * @emit blur
         * @memberof eventsComponent
         */
        blur(e){
          this.isFocused = false;
          this.$emit('blur', e)
        },
        /**
         * Focuses the element.
         * @method focus
         * @return {Function}
         * @memberof basicComponent
         */
        focus(e){
          let ele = this.getRef('element');
          if ( ele && !this.isFocused ){
            ele.focus();
            this.isFocused = true;
          }
          this.$emit('focus', e);
        },
        /**
         * Emits the keyup event.
         * @method keyup
         * @param e
         * @memberof eventsComponent
         * @emit keyup
         */
        keyup(e){
          this.$emit('keyup', e)
        },
        /**
         * Emits the keydown event.
         * @method keydown
         * @param e
         * @memberof eventsComponent
         * @emit keydown
         */
        keydown(e){
          this.$emit('keydown', e)
        },
        /**
         * Emits the over event.
         * @method over
         * @param e
         * @memberof eventsComponent
         * @emit over
         */
        over(e){
          this.$emit('over', e);
          setTimeout(() => {
            this.$emit('hover', true, e);
          }, 0)
        },
        /**
         * Emits the out event.
         * @method out
         * @param e
         * @emit out
         * @memberof eventsComponent
         * @emit over
         */
        out(e){
          this.$emit('out', e);
          setTimeout(() => {
            this.$emit('hover', false, e);
          }, 0)
        },
        /**
         * @method touchstart
         * @param e 
         * @memberof eventsComponent
         */
        touchstart(e){
          this.isTouched = true;
          setTimeout(() => {
            if ( this.isTouched ){
              let event = new Event('contextmenu');
              this.$el.dispatchEvent(event);
              this.isTouched = false;
            }
          }, 1000)
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchmove
         * @memberof eventsComponent
         * @param e 
         */
        touchmove(e){
          this.isTouched = false;
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchend
         * @param e 
         * @memberof eventsComponent
         */
        touchend(e){
          this.isTouched = false;
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchcancel
         * @param e 
         * @memberof eventsComponent
         */
        touchcancel(e){
          this.isTouched = false;
        }
      },
      /**
       * Gives the class 'bbn-events-component' to the component.
       * @event created
       * @memberof eventsComponent
       */
      created(){
        this.componentClass.push('bbn-events-component');
      },
    },
    /**
     * Data source component
     * @component sourceArrayComponent
     */
    sourceArrayComponent: {
      props: {
        /**
         * A function to transform the data.
         * @prop {Function} map
         * @memberof sourceArrayComponent
         */
        map: {
          type: Function
        },
        /**
         * The limit of rows to be shown in a page of the table.
         * @prop {Number} [25] limit
         * @memberof sourceArrayComponent
         */
        limit: {
          type: Number,
          default: 25
        },
        /**
         * Set to true allows the table to divide itself in different pages basing on the property limit.
         * @prop {Boolean} [false] pageable
         * @memberof sourceArrayComponent
         */
        pageable: {
          type: Boolean,
          default: false
        },
        /**
         * Set to true allows table's columns to be sortable.
         * @prop {Boolean} [false] sortable
         * @memberof sourceArrayComponent
         */
        sortable: {
          type: Boolean,
          default: false
        },
        /**
         * Set to true allows the columns of the table to be filtered. A filter icon will appear at the top of each column.The property can be given to each column to define different behaviour.
         * @prop {Boolean} [false] filterable
         * @memberof sourceArrayComponent
         */
        filterable: {
          type: Boolean,
          default: false
        },
        /**
         * Set to true enable the multifilter of the table. An icon will appear on the bottom right of the table. By clicking on the icon a popup with the multifilter will open.
         * @prop {Boolean} [false] multifilter
         * @memberof sourceArrayComponent
         */
        multifilter: {
          type: Boolean,
          default: false
        },
        /**
         * In case of Ajax table, set to true will make an Ajax call for the data when changing page of the table.
         * @prop {Boolean} [true] serverPaging
         * @memberof sourceArrayComponent
         */
        serverPaging: {
          type: Boolean,
          default: true
        },
        /**
         * In case of Ajax table, set to true will make an Ajax call for the sorting of the table.
         * @prop {Boolean} [true] serverSorting
         * @memberof sourceArrayComponent
         */
        serverSorting: {
          type: Boolean,
          default: true
        },
        /**
         * In case of Ajax table, set to true will make an Ajax call for the filter of the table.
         * @prop {Boolean} [true] serverFiltering
         * @memberof sourceArrayComponent
         */
        serverFiltering: {
          type: Boolean,
          default: true
        },
        /**
         * Defines the order of the columns in the table.
         * @prop {Array|Object} [] order
         * @memberof sourceArrayComponent
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
         * @memberof sourceArrayComponent
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
         * @memberof sourceArrayComponent
         */
        selected: {
          type: Array
        },
        /**
         * Set to true shows a checkbox in each rows in the first column of the table.
         * @prop {Boolean|Function} selection
         * @memberof sourceArrayComponent
         */
        selection: {
          type: [Boolean, Function],
          default: false
        },
        /**
         * Given to a column that has the property type set to 'money' defines the currency.
         * @prop {String} currency
         * @memberof sourceArrayComponent
         */
        currency: {
          type: String
        },
        /**
         * The data sent in the ajax call.
         * @prop {String|Function} [{}] data
         * @memberof sourceArrayComponent
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
         * @memberof sourceArrayComponent
         */
        noData: {
          type: String,
          default: bbn._('No data') + '...'
        },
        uid: {
          type: [String, Number, Array]
        },
        /**
         * The source of the component.
         * @prop {Array|Object|String|Function} source
         * @memberof sourceArrayComponent
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
         * @memberof sourceArrayComponent
         */
        sourceText: {
          type: String,
          default: "text"
        },
        /**
         * The name of the property to be used as value.
         * @prop {String} ['value'] sourceValue
         * @memberof sourceArrayComponent
         */
        sourceValue: {
          type: String,
          default: "value"
        },
        /**
         * If source is a function this index can be passed to the function.
         * @prop {Number} sourceIndex
         * @memberof sourceArrayComponent
         */
        sourceIndex: {
          type: Number
        },
        /**
         * @prop {Boolean} [false] nullable
         * @memberof sourceArrayComponent
         */
        nullable: {
          type: Boolean,
          default: false
        },
        /**
         * The name of the property to use for children of hierarchical source
         * @prop {String} [items] children
         * @memberof sourceArrayComponent
         */
        children: {
          type: String,
          default: 'items'
        }
      },
      data(){
        let src = [];
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
           * @data {Boolean} [false] auto If source is a URL and auto is set to true, component will fetch data at mount.
           */
          auto: true,
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
           * @data {Object} currentOrder
           */
          currentOrder: order,
          /**
           * @data {Array} [] currentData
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
           * @data {Array} [] selectedRows
           */
          selectedRows: this.selected || []
        }
      },
      computed: {
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
            this.start = val > 1 ? (val - 1) * this.currentLimit : 0;
            this.updateData();
          }
        },
        filteredData(){
          if (
            this.currentData.length &&
            this.currentFilters &&
            this.currentFilters.conditions &&
            this.currentFilters.conditions.length &&
            (!this.serverFiltering || !this.isAjax)
          ) {
            return bbn.fn.filter(this.currentData, (a) => {
              return this._checkConditionsOnValue(this.currentFilters, a);
            });
          }
          else{
            return this.currentData;
          }
        }
      },
      methods: {
        /**
         * Returns the data changed using the function given in the prop map.
         * @method _map
         * @param data
         */
        _map(data) {
          return (this.map && bbn.fn.isArray(data) ? data.map(this.map) : (data || [])).slice();
        },
        /**
         * Compares the values of the given row basing on the where operator and value.
         *  
         * @method _checkConditionsOnValue
         * @param {Object} where 
         * @param {Object} row 
         * @return {Boolean}
         */
        _checkConditionsOnValue(where, row) {
          let pass = false;
          if (where.conditions && where.logic && (typeof row === 'object')) {
            pass = where.logic !== 'OR';
            for (let i = 0; i < where.conditions.length; i++) {
              let cond = where.conditions[i],
                res = true;
              if (cond.conditions && cond.logic) {
                res = this._checkConditionsOnValue(cond, row);
              } else if (cond.field && cond.operator) {
                res = bbn.fn.compare(row[cond.field], cond.value || null, cond.operator);
              }
              if (!res && where.logic !== 'OR') {
                pass = false;
                break;
              } else if (res && where.logic === 'OR') {
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
            } else if (filter.field) {
              let idx = bbn.fn.search(this.currentFilters.conditions, {
                field: filter.field
              });
              if (idx > -1) {
                this.currentFilters.conditions.splice(idx, 1, filter);
              } else {
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
                    appui.success();
                  })
                } else {
                  arr.splice(idx, 1);
                  appui.success();
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
          this.currentFilters = bbn.fn.clone( this.filters);
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
        updateData(){
          if ( this.isAjax ){
            if ( !this.isLoading ){
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
              if ( this.filterable ){
                data.filters = this.currentFilters;
              }
              if ( this.showable ){
                data.fields = this.shownFields;
              }
              return bbn.fn.post(this.source, data, (d) => {
                this.isLoading = false;
                this.$emit('endloading');
                if ( d.data && bbn.fn.isArray(d.data) ){
                  this.currentData = this._map(d.data);
                  this.total = d.total || d.data.length || 0;
                  /** @todo why? */
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
                    this.$emit('firstrun')
                  }
                }
              })
            }
          }
          else{
            return new Promise((resolve, reject) => {
              if ( bbn.fn.isArray(this.source) ){
                this.currentData = this._map(this.source);
                this.total = this.currentData.length;
              }
              else if ( bbn.fn.isFunction(this.source) ){
                this.currentData = this._map(this.source(this.sourceIndex));
                this.total = this.currentData.length;
              }
              else if ( bbn.fn.isObject(this.source) ){
                let ar = [];
                bbn.fn.iterate(this.source, (a, n) => {
                  let o = {};
                  o[this.sourceValue] = n;
                  o[this.sourceText] = a;
                  ar.push(o);
                });
                this.currentData = ar;
              }
              this.total = this.currentData.length;
              if ( !this._1strun ){
                this._1strun = true;
                this.$emit('firstrun')
              }
              resolve(this.currentData);
            });
          }
        }
      },
      created(){
        this.updateData();
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
        }
      }
    },
    /**
     * Data source component
     * @component dataSourceComponent
     */
    dataSourceComponent: {
      props: {
        /**
         * The source of the component.
         * @prop {Array|Object|String|Function} source
         * @memberof dataSourceComponent
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
         * @memberof dataSourceComponent
         */
        sourceText: {
          type: String,
          default: "text"
        },
        /**
         * The name of the property to be used as value.
         * @prop {String} ['value'] sourceValue
         * @memberof dataSourceComponent
         */
        sourceValue: {
          type: String,
          default: "value"
        },
        /**
         * @prop {Boolean} [false] nullable
         * @memberof dataSourceComponent
         */
        nullable: {
          type: Boolean,
          default: false
        },
        /**
         * The classes to give to the component.
         * @prop {Array} componentClass
         * @memberof dataSourceComponent
         */
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        },
      },
      methods: {
        /**
         * Returns the object of configuration for the given obj.
         * @memberof dataSourceComponent
         * @method getOptions
         * @fires bbn.vue.getOptions2
         * @param {Object} obj 
         * @return {Object}
         */
        getOptions(obj){
          let cfg = bbn.vue.getOptions2(this, obj);
          cfg.dataTextField = this.sourceText || this.widgetOptions.dataTextField || 'text';
          cfg.dataValueField = this.sourceValue || this.widgetOptions.dataValueField || 'value';
          cfg.dataSource = this.dataSource;
          return cfg;
        },
        /**
         * Returns the object of configuration for the given obj.
         * @method getOptions2
         * @fires bbn.vue.getOptions2
         * @param {Object} obj 
         * @return {Object}
         * @memberof dataSourceComponent
         */
        getOptions2(obj){
          let cfg = bbn.vue.getOptions2(this, obj);
          if ( this.widgetOptions.dataTextField || this.sourceText ){
            cfg.dataTextField = this.widgetOptions.dataTextField || this.sourceText;
          }
          if ( this.widgetOptions.dataValueField || this.sourceValue ){
            cfg.dataValueField = this.widgetOptions.dataValueField || this.sourceValue;
          }
          cfg.dataSource = this.dataSource;
          return cfg;
        }
      },
      computed: {
        /**
         * @computed datasource
         * @memberof dataSourceComponent
         */
        dataSource(){
          return bbn.vue.toKendoDataSource(this)
        }
      },
      watch:{
        /**
         * @watch source
         * @memberof dataSourceComponent
         */
        source: function(newDataSource){
          if ( this.widget ){
            this.widget.setDataSource(this.dataSource);
          }
        }
      },
      /**
       * Gives the class 'bbn-datasource-component' to the component.
       * @event created
       * @memberof dataSourceComponent
       */
      created(){
        this.componentClass.push('bbn-datasource-component');
      },
    },
    /**
     * Memory component
     * @component memoryComponent
     */
    memoryComponent: {
      props: {
        /**
         * @prop {Object|Function} memory
         * @memberof memoryComponent
         */
        memory: {
          type: [Object, Function]
        },
        /**
         * The classes to give to the component.
         * @prop {Array} [] componentClass
         * @memberof memoryComponent
         */
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      /**
       * Gives the class 'bbn-memory-component' to the component.
       * @event created
       * @memberof memoryComponent
       */
      created(){
        this.componentClass.push('bbn-memory-component');
      }
    },
    /**
     * Input component
     * @component inputComponent
     */
    inputComponent: {
      props: {
        /**
         * The value of the component.
         * @prop value
         * @memberof inputComponent
         */
        value: {},
        /**
         * The component's name.
         * @prop {String} name 
         * @memberof inputComponent
         */
        name: {
          type: String
        },
        /**
         * The component placeholder.
         * @prop {String} placeholder
         * @memberof inputComponent
         */
        placeholder: {
          type: String
        },
        /**
         * Defines if the component has a required value.
         * @prop {Boolean|Function} [false] required
         * @memberof inputComponent
         */
        required: {
          type: [Boolean, Function],
          default: false
        },
        /**
         * Defines if the component has to be disabled.
         * @prop {Boolean|Function} [false] disabled
         * @memberof inputComponent
         */
        disabled: {
          type: [Boolean, Function],
          default: false
        },
        /**
         * Defines if the component has to be readonly.
         * @prop {Boolean|Function} [false] readonly
         * @memberof inputComponent
         */
        readonly: {
          type: [Boolean, Function],
          default: false
        },
        /**
         * Defines the size of the component.
         * @prop {Number|String} size
         * @memberof inputComponent
         */
        size: {
          type: [Number, String]
        },
         /**
         * Defines the maxlength of the value.
         * @prop {Number|String} maxlength 
         * @memberof inputComponent
         */
        maxlength: {
          type: [String, Number]
        },
        /**
         * A function to validate the value before submit.
         * @prop {Function} validation
         * @memberof inputComponent
         */
        validation: {
          type: [Function]
        },
        /**
         * The type of the component.
         * @prop {String} type
         * @memberof inputComponent
         */
        type: {
          type: String
        },
        /**
         * The classes to give to the component.
         * @prop {Array} [] componentClass  
         * @memberof inputComponent
         */
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      methods: {
        /**
         * Emits the event input.
         * @method emitInput
         * @emit input
         * @param val 
         * @memberof inputComponent
         */
        emitInput(val){
          this.$emit('input', val);
        },
        /**
         * Emits the event change.
         * @method change
         * @emit change
         * @param e 
         * @memberof inputComponent
         */
        change(e){
          this.$emit('change', e, this.value)
        },
        /**
         * Check the validity of the inserted value.
         * @method isValid
         * @param val 
         * @return {Boolean}
         * @memberof inputComponent
         */
        isValid(val){
          const elem = this.$refs.element,
                $elem = $(this.$el),
                customMessage = this.$el.hasAttribute('validationMessage') ? this.$el.getAttribute('validationMessage') : false;
          // Get validity
          if ( elem && elem.validity ){
            let validity = elem.validity,
                // Default message
                mess = bbn._('The value you entered for this field is invalid.');
            // If valid or disabled, return true
            if ( elem.disabled || validity.valid ){
              return true;
            }
            if ( !validity.valid ){
              // If field is required and empty
              if ( validity.valueMissing ){
                mess = bbn._('Please fill out this field.');
              }
              // If not the right type
              else if ( validity.typeMismatch ){
                switch ( elem.type ){
                  // Email
                  case 'email':
                    mess = bbn._('Please enter a valid email address.');
                    break;
                  // URL
                  case 'url':
                    mess = bbn._('Please enter a valid URL.');
                    break;
                }
              }
              // If too short
              else if ( validity.tooShort ){
                mess = bbn._('Please lengthen this text to ') + elem.getAttribute('minLength') + bbn._(' characters or more. You are currently using ') + elem.value.length + bbn._(' characters.');
              }
              // If too long
              else if ( validity.tooLong ){
                mess = bbn._('Please shorten this text to no more than ') + elem.getAttribute('maxLength') + bbn._(' characters. You are currently using ') + elem.value.length + bbn._(' characters.');
              }
              // If number input isn't a number
              else if ( validity.badInput ){
                mess = bbn._('Please enter a number.');
              }
              // If a number value doesn't match the step interval
              else if ( validity.stepMismatch ){
                mess = bbn._('Please select a valid value.');
              }
              // If a number field is over the max
              else if ( validity.rangeOverflow ){
                mess = bbn._('Please select a value that is no more than ') + elem.getAttribute('max') + '.';
              }
              // If a number field is below the min
              else if ( validity.rangeUnderflow ){
                mess = bbn._('Please select a value that is no less than ') + elem.getAttribute('min') + '.';
              }
              // If pattern doesn't match
              else if (validity.patternMismatch) {
                // If pattern info is included, return custom error
                mess = bbn._('Please match the requested format.');
              }
              this.$emit('error', customMessage || mess);
              $elem.css('border', '1px solid red');
              this.$on('blur', () => {
                $elem.css('border', 'none');
                $elem.focus();
              });
              return false;
            }
          }
          return true;
        }
      },
      /**
       * Gives the class 'bbn-input-component' to the component.
       * @event created
       * @memberof inputComponent
       */
      created(){
        this.componentClass.push('bbn-input-component');
      },
      watch:{
        /**
         * @watch disabled
         * @param newVal 
         * @memberof inputComponent
         */
        disabled(newVal){
          if ( this.widget &&bbn.fn.isFunction(this.widget.enable) ){
            this.widget.enable(!newVal);
          }
          else if ( this.widget && this.widgetName &&bbn.fn.isFunction(this.widget[this.widgetName]) ){
            this.widget[this.widgetName](newVal ? "disable" : "enable");
          }
          else if ( $(this.$el).is("input") ){
            if ( newVal ){
              $(this.$el).attr("disabled", true).addClass("k-state-disabled");
            }
            else{
              $(this.$el).attr("disabled", false).removeClass("k-state-disabled");
            }
          }
          else if ( this.$refs.input ){
            if ( newVal ){
              $(this.$refs.input).attr("disabled", true).addClass("k-state-disabled");
            }
            else{
              $(this.$refs.input).attr("disabled", false).removeClass("k-state-disabled");
            }
          }
        },
        /**
         * @watch value
         * @param newVal 
         * @memberof inputComponent
         */
        value(newVal){
          if ( this.widget && (this.widget.value !== undefined) ){
            if (bbn.fn.isFunction(this.widget.value) ){
              if ( this.widget.value() !== newVal ){
                this.widget.value(newVal);
              }
            }
            else{
              if ( this.widget.value !== newVal ){
                this.widget.value = newVal;
              }
            }
          }
        },
        cfg(){

        }
      }
    },
    /**
     * Option component
     * @component optionComponent
     */
    optionComponent: {
      props: {
        /**
        * The classes to give to the component.
        * @prop {Array} [] componentClass   
        * @memberof optionComponent
        */
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      methods: {
        /**
         * @method getOptions
         * @fires bbn.vue.getOptions
         * @memberof optionComponent
         */
        getOptions(){
          return bbn.vue.getOptions(this);
        },
      },
      /**
       * Gives the class 'bbn-option-component' to the component.
       * @event created
       * @memberof optionComponent
       */
      created(){
        this.componentClass.push('bbn-option-component');
      }
    },
    /**
     * Widget component
     * @component widgetComponent
     */
    widgetComponent: {
      props: {
        /**
         * @prop {Object} [{}] cfg
         * @memberof widgetComponent
         */
        cfg: {
          type: Object,
          default(){
            return {};
          }
        },
        /**
         * @prop {Object} [{}] widgetOptions
         * @memberof widgetComponent
         */
        widgetOptions: {
          type: Object,
          default(){
            return {};
          }
        },
        /**
         * The classes to give to the component.
         * @prop {Array} componentClass
         * @memberof widgetComponent
         */
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      /**
       * Gives the class 'bbns-widget-component' to the component.
       * @event created
       * @memberof widgetComponent
       */
      created(){
        this.componentClass.push('bbns-widget-component');
      },
       /**
       * @event beforeDestroy
       * @memberof widgetComponent
       */
      beforeDestroy(){
        //bbn.fn.log("Default destroy");
        //this.destroy();
      },
      methods: {
        destroy(){
          const vm = this;
          /*
          if ( vm.widget &&bbn.fn.isFunction(vm.widget.destroy) ){
            vm.widget.destroy();
            vm.widget = false;
            if ( vm.$refs.element ){
              let $ele = $(vm.$refs.element).removeAttr("style");
              while ( $ele.parent()[0] !== vm.$el ){
                $ele.unwrap();
              }
              bbn.fn.log("Moving element", $ele);
              if ( vm.widgetName ){
                $ele.removeAttr("data-role").removeAttr("style").removeData(this.widgetName);
              }
            }
            else if ( this.widgetName ){
              $(this.$el).removeData(this.widgetName);
            }
            if ( this.$refs.input ){
              $(this.$refs.input).appendTo(this.$el)
            }
            $(this.$el).children().not("[class^='bbn-']").remove();
          }
          */
        },
        /**
         * @method build
         * @memberof widgetComponent
         */
        build(){
          bbn.fn.info("CLASSIC BUILD");
        },
        getWidgetCfg(){
          const vm = this;
        },
      }
    },
    /**
     * These components will emit a resize event when their closest parent of the same kind gets really resized.
     * @component resizerComponent
     */
    resizerComponent: {
      props: {
        /**
         * The classes to give to the component.
         * @prop {Array} componentClass
         * @memberof resizerComponent
         */
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      data(){
        return {
          /**
           * The closest resizer parent.
           * @data {Boolean} [false] parentResizer
           * @memberof resizerComponent
           */
          parentResizer: false,
          /**
           * The listener on the closest resizer parent.
           * @data {Boolean} [false] resizeEmitter
           * @memberof resizerComponent
           */
          resizeEmitter: false,
          /**
           * The height.
           * @data {Boolean} [false] lastKnownHeight
           * @memberof resizerComponent
           */
          lastKnownHeight: false,
          /**
           * The width.
           * @data {Boolean} [false] lastKnownWidth
           * @memberof resizerComponent
           */
          lastKnownWidth: false
        };
      },
      methods: {
        /**
         * A function that can be executed just before the resize event is emitted.
         * @method onResize
         * @memberof resizerComponent
         */
        onResize(){
          return;
        },
        /**
         * Defines the resize emitter and emits the event resize.
         * @method setResizeEvent
         * @emit resize
         * @fires resizeEmitter
         * @memberof resizerComponent
         */
        setResizeEvent(){
          // The timeout used in the listener
          let resizeTimeout;
          // This class will allow to recognize the element to listen to
          this.parentResizer = this.closest(".bbn-resize-emitter", true);
          // Setting initial dimensions
          this.lastKnownHeight = this.parentResizer ? Math.round($(this.$el.parentNode).innerHeight()) : bbn.env.height;
          this.lastKnownWidth = this.parentResizer ? Math.round($(this.$el.parentNode).innerWidth()) : bbn.env.width;
          // Creating the callback function which will be used in the timeout in the listener
          this.resizeEmitter = (force) => {
            // Removing previous timeout
            clearTimeout(resizeTimeout);
            // Creating a new one
            resizeTimeout = setTimeout(() => {
              if ( $(this.$el).is(":visible") ){
                // Checking if the parent hasn't changed (case where the child is mounted before)
                let tmp = this.closest(".bbn-resize-emitter", true);
                if ( tmp !== this.parentResizer ){
                  // In that case we reset
                  this.unsetResizeEvent();
                  this.setResizeEvent();
                  return;
                }
                let resize = false,
                    h      = this.parentResizer ? Math.round($(this.$el.parentNode).innerHeight()) : bbn.env.height,
                    w      = this.parentResizer ? Math.round($(this.$el.parentNode).innerWidth()) : bbn.env.width;
                if ( h && (this.lastKnownHeight !== h) ){
                  this.lastKnownHeight = h;
                  resize = 1;
                }
                if ( w && (this.lastKnownWidth !== w) ){
                  this.lastKnownWidth = w;
                  resize = 1;
                }
                if ( resize || force ){
                  this.onResize();
                  this.$emit("resize", force);
                }
              }
            }, 0);
          };
          if ( this.parentResizer ){
            //bbn.fn.log("SETTING EVENT FOR PARENT", this.$el, this.parentResizer);
            this.parentResizer.$on("resize", (force) => {
              this.resizeEmitter(force)
            });
          }
          else{
            //bbn.fn.log("SETTING EVENT FOR WINDOW", this.$el);
            $(window).on("resize", (force) => {
              this.resizeEmitter(force)
            });
          }
          this.resizeEmitter();
        },
        /**
         * Unsets the resize emitter.
         * @method unsetResizeEvent
         * @memberof resizerComponent
         */
        unsetResizeEvent(){
          if ( this.resizeEmitter ){
            if ( this.parentResizer ){
              //bbn.fn.log("UNSETTING EVENT FOR PARENT", this.$el, this.parentResizer);
              this.parentResizer.$off("resize", this.resizeEmitter);
            }
            else{
              //bbn.fn.log("UNSETTING EVENT FOR WINDOW", this.$el);
              $(window).off("resize", this.resizeEmitter);
            }
          }
        },
        /**
         * Emits the event resize on the closest parent resizer.
         * @method selfEmit
         * @memberof resizerComponent
         * @param {Boolean} force 
         */  
        selfEmit(force){
          if ( this.parentResizer ){
            this.parentResizer.$emit("resize", force);
          }
        },
        cssSize(val){
          switch ( typeof val ){
            case 'string':
              return val;
            case 'number':
              return val + 'px';
            default:
              return 'auto';
          }
        }
      },
      /**
       * Gives the class 'bbn-resizer-component' to the component.
       * @event created
       * @memberof resizerComponent
       */
      created(){
        this.componentClass.push('bbn-resizer-component', 'bbn-resize-emitter');
      },
      /**
       * @event mounted
       * @fires setResizeEvent
       * @memberof resizerComponent
       */
      mounted(){
        this.setResizeEvent();
      },
      /**
       * @event beforeDestroy
       * @fires unsetResizeEvent
       * @memberof resizerComponent
       */
      beforeDestroy(){
        this.unsetResizeEvent();
      }
    },
    /**
     * Close component.
     * @component closeComponent
     */
    closeComponent: {
      /**
       * Gives the class 'bbn-close-component' to the component.
       * @event created
       * @memberof closeComponent
       */
      created(){
        this.componentClass.push('bbn-close-component');
      },
      data(){
        return {
          /**
           * @data {Boolean}  [false] dirty
           * @memberof closeComponent
           */
          dirty: false
        }
      },
      computed: {
        /**
         * @computed {Boolean} canClose
         * @memberof closeComponent
         */
        canClose(){
          return !this.dirty;
        }
      },
      methods: {

      }
    },
    /**
     * Field component.
     * @component fieldComponent
     */
    fieldComponent: {
      props: {
        /**
         * The width of the component.
         * @prop {String|Number} width
         * @memberof fieldComponent
         */
        width: {
          type: [String, Number],
        },
        /**
         * The render of the component.
         * @prop {String|Function} render
         * @memberof fieldComponent
         */
        render: {
          type: [String, Function]
        },
        /**
         * The title of the component.
         * @prop {String|Number} title
         * @memberof fieldComponent
         */
        title: {
          type: [String, Number]
        },
        /**
         * The full title of the component.
         * @prop {String} ftitle
         * @memberof fieldComponent
         */
        ftitle: {
          type: String
        },
        /**
         * @prop {String|Object} tcomponent
         * @memberof fieldComponent
         */
        tcomponent: {
          type: [String, Object]
        },
        /**
         * The icon of the component.
         * @prop {String} icon
         * @memberof fieldComponent
         */
        icon: {
          type: String
        },
        /**
         * The classes to give to the component.
         * @prop {String|Function} cls
         * @memberof fieldComponent
         */
        cls: {
          type: [String, Function]
        },
        /**
         * The component's type.
         * @prop {String} type
         * @memberof fieldComponent
         */
        type: {
          type: String
        },
        /**
         * The component's field.
         * @prop {String} field
         * @memberof fieldComponent
         */
        field: {
          type: String
        },
        /**
         * Defines if the component has to be fixed.
         * @prop {Boolean|String} [false] fixed
         * @memberof fieldComponent
         */
        fixed: {
          type: [Boolean, String],
          default: false
        },
        /**
         * Defines if the component has to be hidden.
         * @prop {Boolean} hidden
         * @memberof fieldComponent
         */
        hidden: {
          type: Boolean
        },
        /**
         * Defines if the componenent has to be encoded.
         * @prop {Boolean} [false] encoded
         * @memberof fieldComponent
         */
        encoded: {
          type: Boolean,
          default: false
        },
        /**
         * Defines if the componenent has to be sortable.
         * @prop {Boolean|Function} [true] sortable 
         * @memberof fieldComponent
         */
        sortable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent has to be editable.
         * @prop {Boolean|Function} [true] editable 
         * @memberof fieldComponent
         */
        editable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent has to be filterable.
         * @prop {Boolean|Function} [true] filterable 
         * @memberof fieldComponent
         */
        filterable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent has to be resizable.
         * @prop {Boolean|Function} [true] resizable 
         * @memberof fieldComponent
         */
        resizable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent has to be showable.
         * @prop {Boolean|Function} [true] showable 
         * @memberof fieldComponent
         */
        showable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent can have a null value.
         * @prop {Boolean|Function} nullable 
         * @memberof fieldComponent
         */
        nullable: {
          type: [Boolean, Function],
        },
        /**
         * The buttons of the component.
         * @prop {Array|Function} buttons 
         * @memberof fieldComponent
         */
        buttons: {
          type: [Array, Function]
        },
        /**
         * The source of the component.
         * @prop {Array|Object|String|Function} source 
         * @memberof fieldComponent
         */
        source: {
          type: [Array, Object, String, Function]
        },
        /**
         * Defines if the the value of the component is required.
         * @prop {Boolean|Function} required 
         * @memberof fieldComponent
         */
        required: {
          type: [Boolean, Function]
        },
        /**
         * Defines the precision of the component.
         * @prop {Number} [0] precision 
         * @memberof fieldComponent
         */
        precision: {
          type: Number,
          default: 0
        },
        /**
         * Defines the options of the component.
         * @prop {Object|Function} options
         * @memberof fieldComponent
         */
        options: {
          type: [Object, Function],
          default(){
            return {};
          }
        },
        /**
         * Defines the editor of the component.
         * @prop {String|Object} editor
         * @memberof fieldComponent
         */
        editor: {
          type: [String, Object]
        },
        /**
         * Defines the maxLength of the component.
         * @prop {Number} maxLength 
         * @memberof fieldComponent
         */
        maxLength: {
          type: Number
        },
        /**
         * Defines the maxLength of the component.
         * @prop {Number} maxLength 
         * @memberof fieldComponent
         */
        sqlType: {
          type: String
        },
        /**
         * @prop {String|Array} aggregate
         * @memberof fieldComponent
         */
        aggregate: {
          type: [String, Array]
        },
        /**
         * Define a component to use.
         * @prop {String|Object} component
         * @memberof fieldComponent
         */
        component: {
          type: [String, Object]
        },
        /**
         * A function to map the data of the component.
         * @prop {Function} mapper
         * @memberof fieldComponent
         */
        mapper: {
          type: Function
        },
        /**
         * Defines the group of the component.
         * @prop {String} group
         * @memberof fieldComponent
         */
        group: {
          type: String
        }
      },
    },
    /**
     * View Component
     * @component viewComponent
     */
    viewComponent: {
      props: {
        /**
         * The source of the component.
         * @prop {Object|Function} source
         * @memberof viewComponent
         */
        source: {
          type: [Object, Function]
        },
        /**
         * The title of the component.
         * @prop {String|Number} ['Untitled'] title
         * @memberof viewComponent
         */
        title: {
          type: [String, Number],
          default: bbn._("Untitled")
        },
        /**
         * The options object of the component.
         * @prop {Object} options
         * @memberof viewComponent
         */
        options: {
          type: Object,
          default(){
            return {}
          }
        },
        /**
         * Defines if the component has to be cached.
         * @prop {Boolean} [true] cached
         * @memberof viewComponent
         */
        cached: {
          type: Boolean,
          default: true
        },
        /**
         * Defines if the component has to be scrollable.
         * @prop {Boolean} [true] scrollable
         * @memberof viewComponent
         */
        scrollable: {
          type: Boolean,
          default: true
        },
        /**
         * Defines the component to use.
         * @prop component
         * @memberof viewComponent
         */
        component: {},
        /**
         * Defines the icon.
         * @prop {String|Boolean} icon
         * @memberof viewComponent
         */
        icon: {
          type: [String, Boolean],
        },
        /**
         * Defines if the component can have a text.
         * @prop {Boolean} [false] notext
         * @memberof viewComponent
         */
        notext: {
          type: Boolean,
          default: false
        },
        /**
         * Defines the component's content.
         * @prop {String} [''] content
         * @memberof viewComponent
         */
        content: {
          type: String,
          default: ""
        },
        /**
         * Defines the menu.
         * @prop {Array|Function} menu
         * @memberof viewComponent
         */
        menu: {
          type: [Array, Function]
        },
        /**
         * Defines if the component is loaded.
         * @prop {Boolean} loaded
         * @memberof viewComponent
         */
        loaded: {
          type: Boolean,
          default: false
        },
        /**
         * Tells if the component is currently loading.
         * @prop {Boolean} loading
         * @memberof viewComponent
         */
        loading: {
          type: Boolean,
          default: false
        },
        /**
         * Defines the component's fcolor.
         * @prop {String} fcolor
         * @memberof viewComponent
         */
        fcolor: {
          type: String
        },
        /**
         * Defines the component's bcolor.
         * @prop {String} bcolor
         * @memberof viewComponent
         */
        bcolor: {
          type: String
        },
        /**
         * @prop {Boolean} [false] load
         * @memberof viewComponent
         */
        load: {
          type: Boolean,
          default: false
        },
        /**
         * Defines if the component has to be selected.
         * @prop {Boolean|Number} [false] selected
         * @memberof viewComponent
         */
        selected: {
          type: [Boolean, Number],
          default: false
        },
        /**
         * Defines the css string for the component.
         * @prop {String} [''] css
         * @memberof viewComponent
         */
        css: {
          type: String,
          default: ""
        },
        /**
         * @prop {String|Vue} advert
         * @memberof viewComponent
         */
        advert: {
          type: [String, Vue]
        },
        /**
         * @prop {String} help
         * @memberof viewComponent
         */
        help: {
          type: String
        },
        /**
         * @prop {Array} imessages
         * @memberof viewComponent
         */
        imessages: {
          type: Array,
          default(){
            return []
          }
        },
        /**
         * @prop script
         * @memberof viewComponent
         */
        script: {},
        /**
         * Defines if the component has to be static.
         * @prop {Boolean|Number} [false] static
         * @memberof viewComponent
         */
        static: {
          type: [Boolean, Number],
          default: false
        },
        /**
         * Defines
         if the component has to be pinned.
         * @prop {Boolean|Number} [false] pinned
         * @memberof viewComponent
         */
        pinned: {
          type: [Boolean, Number],
          default: false
        },
        /**
         * Defines the url.
         * @prop {String|Number} url
         * @memberof viewComponent
         */
        url: {
          type: [String, Number]
        },
        /**
         * @prop {String|Number} current
         * @memberof viewComponent
         */
        current: {
          type: [String, Number]
        },
         /**
         * @prop {Boolean} [true] real
         * @memberof viewComponent
         */
        real: {
          type: Boolean,
          default: true
        },
        /**
         * The object of configuration for the component
         * @prop {Object} cfg
         * @memberof viewComponent
         */
        cfg: {
          type: Object
        },
        /**
         * @prop {Object} events
         * @memberof viewComponent
         */
        events: {
          type: Object,
          default(){
            return {}
          }
        },
      }
    },
    /**
     * Obeserver component.
     * @component observerComponent
     */
    observerComponent: {
      props: {
        /**
         * @prop {Boolean} [true] observer
         * @memberof observerComponent
         */
        observer: {
          type: Boolean,
          default: true
        }
      },
      data(){
        return {
          /**
           * Integration of the functionnality is done through a watcher on this property
           * @data {Array} observersCopy
           * @memberof observerComponent
           */
          observersCopy: [],
          /**
           * Integration of the functionnality is done through a watcher on this property
           * @data {Boolean} observersDirty
           * @memberof observerComponent
           */
          observerDirty: false,
          /**
           * @memberof observerComponent
           * @data observerValue
           */
          observerValue: null,
          /**
           * @data {Array} observers
           * @memberof observerComponent
           */
          observers: [],
          /**
           * @data observerID
           * @memberof observerComponent
           */
          observerID: null,
          /**
           * @data observationTower
           * @memberof observerComponent
           */
          observationTower: null,
          /**
           * @data {String} observerUID
           * @memberof observerComponent
           */
          observerUID: bbn.fn.randomString().toLowerCase()
        }
      },
      methods: {
        /**
         * @method observerCheck
         * @return {Boolean}
         * @memberof observerComponent
         */
        observerCheck(){
          return !!(this.observer && this.observationTower);
        },
        /**
         * @method isObserved
         * @return {Boolean}
         * @memberof observerComponent
         */
        isObserved(){
          return this.observerCheck() && this.observerValue;
        },
        /**
         * @method observerWatch
         * @fires isObserved
         * @memberof observerComponent
         */
        observerWatch(){
          if ( this.isObserved() ){
            //bbn.fn.log("----------------isObserved--------------", this.$el);
            this.observationTower.observerRelay({
              element: this.observerUID,
              id: this.observerID,
              value: this.observerValue
            });
            setTimeout(() => {
              this.observationTower.$on('bbnObs' + this.observerUID + this.observerID, (newVal) => {
                //bbn.fn.log("NEW VALUE!");
                // Integration of the functionnality is done through a watcher on this property
                this.observerDirty = true;
                this.observerValue = newVal;
              });
            }, 100);
          }
        },
         /**
         * @method observerRelay
         * @memberof observerComponent
         */
        observerRelay(obs){
          if ( this.observer ){
            //bbn.fn.log("----------------observerRelay--------------", this.$el)
            let idx = bbn.fn.search(this.observers, {id: obs.id, element: obs.element});
            if ( idx > -1 ){
              if ( this.observers[idx].value !== obs.value ){
                this.observers.splice(idx, 1, obs);
              }
            }
            else{
              this.observers.push(obs);
              if ( this.observerCheck() ){
                this.observationTower.$on('bbnObs' + obs.element + obs.id, (newVal) => {
                  this.observerEmit(newVal, obs);
                });
              }
            }
            if ( this.observerCheck() ){
              this.observationTower.observerRelay(bbn.fn.clone(obs));
            }
          }
        },
        /**
         * @method observerEmit
         * @param {String|Number} newVal 
         * @param {Object} obs 
         * @emit bbnObs
         * @memberof observerComponent
         */
        observerEmit(newVal, obs){
          let row = bbn.fn.get_row(this.observers, {id: obs.id, element: obs.element});
          //bbn.fn.log("--------------observerEmit-------------------", this.$el, newVal, row, obs);
          if ( row && (row.value !== newVal) ){
            row.value = newVal;
            this.$emit('bbnObs' + obs.element + obs.id, newVal);
            return true;
          }
        }
      },
      /**
       * Gives the classes 'bbn-observer-component', 'bbn-observer', 'bbn-observer-' + this.observerUID to the component
       * @event created
       * @memberof observerComponent
       */
      created(){
        if ( this.componentClass ){
          this.componentClass.push('bbn-observer-component');
          this.componentClass.push('bbn-observer', 'bbn-observer-' + this.observerUID);
        }
      },
      /**
       * @event mounted
       * @memberof observerComponent
       */
      mounted(){
        if ( this.observer ){
          this.observationTower = this.closest('.bbn-observer');
          this.observerWatch();
        }
      },
      /**
       * @event beforeDestroy
       * @memberof observerComponent
       */
      beforeDestroy(){
        if ( this.isObserved() ){
          let idx = bbn.fn.search(this.observationTower.observers, {element: this.observerUID});
          if ( idx > -1 ){
            this.observationTower.observers.splice(idx, 1);
          }
          this.observationTower.$off('bbnObs' + this.observerUID + this.observerID);
        }
      },
    },
    /**
     * Keep cool component
     * @component keepCoolComponent 
     */
    keepCoolComponent: {
      data(){
        return {
          /**
           * @data {Number} [0] coolTimer
           * @memberof keepCoolComponent
           */
          coolTimer: {
            default: 0
          },
          /**
           * @data coolTimeout
           * @memberof keepCoolComponent
           */
          coolTimeout: null,
          /**
           * @data {Number} [40] coolInterval
           * @memberof keepCoolComponent
           */
          coolInterval: 40
        }
      },
      methods: {
        /**
         * @method keepCool
         * @param {Function} fn 
         * @param {*Number} idx 
         * @param {Number} timeout 
         * @memberof keepCoolComponent
         */
        keepCool(fn, idx, timeout){
          if ( !idx ){
            idx = 'default'
          }
          let t = (new Date()).getTime();
          if ( !this.coolTimer[idx] || (this.coolTimer[idx] < (t - (timeout || this.coolInterval))) ){
            this.coolTimer[idx] = (new Date()).getTime();
            fn();
          }
          else{
            setTimeout(() => {
              let t = (new Date()).getTime();
              if ( this.coolTimer[idx] < (t - (timeout || this.coolInterval)) ){
                this.coolTimer[idx] = t;
                fn();
              }
            }, this.coolInterval);
          }
        }
      }
    },
    /**
     * Url component
     * @component urlComponent
     */
    urlComponent: {
      props: {
        /** 
         * The baseUrl.
         * @prop {String} baseUrl
         * @memberof urlComponent
         */
        baseUrl: {
          type: String
        }
      },
      data(){
        return {
          /**
           * @data currentURL
           * @memberof urlComponent
           */
          currentURL: null,
          /**
           * @data title
           * @memberof urlComponent
           */
          title: null
        }
      },
      methods: {
        /**
         * Updates the url.
         * @method updateUrl
         * @memberof urlComponent
         */
        updateUrl(){
          if ( this.baseUrl && (bbn.env.path.indexOf(this.baseUrl) === 0) && (bbn.env.path.length > (this.baseUrl.length + 1)) ){
            let url = this.baseUrl + (this.currentURL ? '/' + this.currentURL : '');
            bbn.fn.setNavigationVars(
              url,
              (this.currentURL ? bbn.fn.get_field(this.source, this.sourceValue, this.currentURL, this.sourceText) + ' < ' : '') + document.title,
              {
                script: () => {
                  bbn.fn.log("EXEC SCRIPT");
                  let idx = bbn.fn.search(this.source, this.sourceValue, this.currentURL);
                  if ( idx > -1 ){
                    this.widget.select(idx);
                    this.widget.trigger("change");
                  }
                }
              },
              !this.ready)
          }
        }
      },
      /**
       * Gives the class 'bbn-url-component' to the component
       * @event created 
       * @memberof urlComponent
       */
      created(){
        this.componentClass.push('bbn-url-component');
      },
    }
  });
})(window.bbn);