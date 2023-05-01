/**
 * @file bbn-calendar component
 *
 * @description The bbn-calendar component is a calendar that allows you to interact with dates by providing details, inserting reminders and creating events.
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.list
     * @mixin bbn.wc.mixins.resizer
    */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.list, 
      bbn.wc.mixins.resizer
    ],
    props: {
      /**
       * Auto-loads the data at mount of the component if it's set as "true".
       * @prop {Boolean} [false] autobind
      */
      autobind: {
        type: Boolean,
        default: false
      },
      /**
       * The array of events for each day.
       * When a string is set, an ajax call will be made to the corresponding url.
       *
       * @prop {(String|Array)} [[]] source
      */
      source: {
        type: [String, Array],
        default(){
          return [];
        }
      },
      /**
       * The visualization mode.
       * Allowed values: days, weeks, months and years.
       *
       * @prop {String} ['days'] type
      */
      type: {
        type: String,
        default: 'days',
        validator: m => ['days', 'weeks', 'months', 'years'].includes(m)
      },
      /**
       * Set to true to autoselect the date property value.
       *
       * @prop {Boolean} [false] autoSelect
       */
      autoSelection: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to select multiple values.
       *
       * @prop {Boolean} [false] multiSelection
      */
      multiSelection: {
        type: Boolean,
        default: false
      },
      /**
       * The value.
       *
       * @prop {String} [''] value
      */
      value: {
        type: String,
        default: ''
      },
      /**
       * Shows the arrows on the header.
       *
       * @prop {Boolean} [true] arrows
       */
      arrows: {
        type: Boolean,
        default: true
      },
      /**
       * Shows the arrows as buttons (only icons also).
       *
       * @prop {Boolean} [true] arrowsButtons
      */
      arrowsButtons: {
        type: Boolean,
        default: true
      },
      /**
       * The icon displayed before the title.
       *
       * @prop {String|Boolean} ['nf nf-oct-calendar'] titleIcon
      */
      titleIcon: {
        type: [String, Boolean],
        default: 'nf nf-oct-calendar'
      },
      /**
       * The function called on click on the title.
       * 
       * @prop {Function} titleAction
       */
      titleAction: {
        type: Function
      },
      /**
       * The initial date.
       *
       * @prop {String} date
      */
      date: {
        type: String
      },
      /**
       * Shows/hides the dates of the next and previous period in the current visualization.
       *
       * @prop {Boolean} [false] extraItems
      */
      extraItems: {
        type: Boolean,
        default: false
      },
      /**
       * Array of items to insert into a range.
       *
       * @prop {Array} [[]] itemsRange
       */
      itemsRange: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * Shows only dates with events.
       *
       * @prop {Boolean} [false] onlyEvents
       */
      onlyEvents: {
        type: Boolean,
        default: false
      },
      /**
       * Disables the dates without events.
       *
       * @prop {Boolean} [false] disableNoEvents
       */
      disableNoEvents: {
        type: Boolean,
        default: false
      },
      /**
       * Shows/hides the date's details.
       *
       * @prop {Boolean} [false] itemDetails
      */
      itemDetails: {
        type: Boolean,
        default: false
      },
      /**
       * The icon used to indicate the presence of events in the item.
       * If set to false, nothing will be shown.
       *
       * @prop {String|Boolean} ['nf nf-fa-user'] eventIcon
      */
      eventIcon: {
        type: [String, Boolean],
        default: 'nf nf-fa-calendar'
      },
      /**
       * Shows/hides the padding of the item's cell.
       *
       * @prop {Boolean} [false] itemPadding
      */
      itemPadding: {
        type: Boolean,
        default: false
      },
      /**
       * The component used for the items.
       *
       * @prop {Vue} itemComponent
      */
      itemComponent: {
        type: [Vue, Object, String]
      },
      /**
       * The title for the item's details.
       *
       * @prop {Function|String} [''] itemTitle
      */
      itemTitle: {
        type: [Function, String],
        default: ''
      },
      /**
       * The component used for the header.
       *
       * @prop {Vue|Object|String} headerComponent
      */
      headerComponent: {
        type: [Vue, Object, String]
      },
      /**
       * The labels type.
       * Types: auto, letter, abbr, full, false.
       *
       * @prop {String|Boolean} ['auto'] labels
      */
      labels: {
        type: [String, Boolean],
        default: 'auto',
        validator: s => ['auto', 'letter', 'abbr', 'full', false].includes(s)
      },
      /**
       * The field used for the event's start.
       *
       * @prop {String} ['start'] startField
       */
      startField: {
        type: String,
        default: 'start'
      },
      /**
       * The field used for the event's end.
       *
       * @prop {String} ['end'] endField
      */
      endField: {
        type: String,
        default: 'end'
      },
      /**
       * The format used for the event's start.
       *
       * @prop {String} ['YYYY-MM-DD 00:00:00'] startFormat
       */
      startFormat: {
        type: String,
        default: 'YYYY-MM-DD 00:00:00'
      },
      /**
       * The format used for the event's end.
       *
       * @prop {String} ['YYYY-MM-DD 23:59:59'] endFormat
       */
      endFormat: {
        type: String,
        default: 'YYYY-MM-DD 23:59:59'
      },
      /**
       * The maximum allowed date.
       *
       * @prop {String} max
       */
      max: {
        type: String
      },
      /**
       * The minimum allowed date.
       *
       * @prop {String} min
       */
      min: {
        type: String
      },
      /**
       * The disabled dates.
       *
       * @prop {Array|Function} disableDates
       */
      disableDates: {
        type: [Array, Function],
        default(){
          return [];
        }
      },
      /**
       * Shows the "loading" text when it's loading.
       * @prop {Boolean} showLoading
       */
      showLoading: {
        type: Boolean,
        default: false
      }
    },
    data(){
      let mom = dayjs();
      if ( this.date ){
        let m = dayjs(this.date, this.getCfg().valueFormat);
        mom = m.isValid() ? m : mom;
      }
      else if ( this.max ){
        let m = dayjs(this.max, this.getCfg().valueFormat);
        mom = m.isValid() ? m : mom;
      }
      return {
        /**
         * Today as 'YYYY-MM-DD' format.
         *
         * @data {String} [today] today
        */
        today: dayjs().format('YYYY-MM-DD'),
        /**
         * The current calendar title.
         *
         * @data {String} [''] title
        */
        title: '',
        /**
         * The labels (text).
         *
         * @data {Array} [[]] currentLabels
        */
        currentLabels: [],
        /**
         * The Moment objects of the labels.
         *
         * @data {Array} [[]] currentLabelsDates
        */
        currentLabelsDates: [],
        /**
         * The current date as a Moment object.
         *
         * @data {Moment} currentDate
         */
        currentDate: mom,
        /**
         * The items' structures.
         *
         * @data {Array} [[]] items
        */
        items: [],
        /**
         * The component is ready.
         *
         * @data {Boolean} [false] ready
         */
        ready: false,
        /**
         * CSS style for the grid.
         *
         * @data {String} [''] gridStyle
        */
        gridStyle: '',
        /**
         * The current value.
         *
         * @data {String} [''] currentValue
         */
        currentValue: '',
        /**
         * The events.
         *
         * @data {Object} [{}] events
         */
        events: {}
      }
    },
    computed: {
      /**
       * The current configuration.
       *
       * @computed currentCfg
       * @fires getCfg
       * @return {Object}
      */
      currentCfg(){
        if ( this.type ){
          return this.getCfg();
        }
        return {}
      }
    },
    methods: {
      /**
       * Makes a calendar item's structure.
       *
       * @method _makeItem
       * @param {String} txt The item's text
       * @param {String} val The item's value
       * @param {Boolean} hid If the item is hidden or not
       * @param {Boolean} col If the item is colored or not
       * @param {Boolean} dis If the item is disabled or not
       * @param {Boolean} ext If the item is extra or not
       * @return {Object}
      */
      _makeItem(txt, val, hid, col, dis, ext){
        //let events = this.filterEvents(val),
        let events = this.events[val],
            obj = {
              text: txt,
              value: val,
              isCurrent: val === dayjs(this.today, this.currentCfg.valueFormat).format(this.currentCfg.valueFormat),
              hidden: !!hid,
              colored: !!col,
              over: false,
              events: events,
              inRange: this.itemsRange.includes(val),
              disabled: !!dis,
              extra: !!ext
            };
        if (
          (this.onlyEvents && (!events || !events.length)) ||
          (this.min && (obj.value < dayjs(this.min, this.currentCfg.valueFormat).format(this.currentCfg.valueFormat))) ||
          (this.max && (obj.value > dayjs(this.max, this.currentCfg.valueFormat).format(this.currentCfg.valueFormat)))
        ){
          obj.hidden = true;
        }
        if ( this.disableDates ){
          obj.disabled = bbn.fn.isFunction(this.disableDates) ? this.disableDates(obj.value) : this.disableDates.includes(obj.value);
        }
        if ( this.disableNoEvents && !obj.disabled ){
          obj.disabled = !events || !events.length;
        }
        return obj;
      },
      /**
       * Makes the items' structure in "days" mode.
       *
       * @method _makeDays
       * @fires _makeItem
       * @return {Object}
      */
      _makeDays(){
        let items = [],
            c = dayjs(this.currentDate.format('YYYY-MM-01')),
            currentMonth = this.currentDate.month(),
            sunday = dayjs(c).day('Sunday').weekday();

        for ( let i = 1; i <= 6; i++ ){
          if ( i > 1 ){
            c = c.add(1, 'w');
          }
          items = items.concat(Array.from({length: 7}, (v, k) => {
            let w = dayjs(c).weekday(k),
                val = w.format(this.currentCfg.valueFormat),
                otherMonth = dayjs(w).month() !== currentMonth,
                isHidden = !this.extraItems && !!otherMonth ? true : false;
            return this._makeItem(
              w.get('date'),
              val,
              isHidden,
              k === sunday,
              false,
              this.extraItems && !!otherMonth
            );
          }));
        }
        this.gridStyle = 'grid-template-columns: repeat(7, 1fr); grid-template-rows: max-content repeat(6, 1fr);';
        this.currentLabelsDates = Array.from({length: 7}, (v, i) => dayjs(this.currentDate).weekday(i));
        this.$set(this, 'items', items);
      },
      /**
       * Makes the items' structure of "weeks" mode.
       *
       * @method _makeWeeks
       * @fires _makeItem
       * @return {Object}
      */
      _makeWeeks(){
        let c = dayjs(this.currentDate),
            sunday = dayjs(c).day('Sunday').weekday(),
            items = Array.from({length: 7}, (v, k) => {
              let w = c.weekday(k);
              return this._makeItem(
                w.get('date'),
                w.format(this.currentCfg.valueFormat),
                false,
                k === sunday,
                false,
                false
              );
            });
        this.gridStyle = 'grid-template-columns: repeat(7, 1fr); grid-template-rows: max-content auto';
        this.currentLabelsDates = Array.from({length: 7}, (v, i) => dayjs(this.currentDate).weekday(i));
        this.$set(this, 'items', items);
      },
      /**
       * Makes the items' structure of "months" mode.
       *
       * @method _makeMonths
       * @fires _makeItem
       * @return {Object}
      */
      _makeMonths(){
        let c = dayjs(this.currentDate.format('YYYY-01-01')),
            items = Array.from({length: 12}, (v, k) => {
              let w = c.month(k);
              return this._makeItem(
                w.format('MMM'),
                w.format(this.currentCfg.valueFormat),
                !this.extraItems && (w.get('year') !== this.currentDate.get('year')),
                false,
                false,
                this.extraItems && (w.get('year') !== this.currentDate.get('year'))
              );
            });
        this.gridStyle = 'grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(4, 1fr);';
        this.currentLabelsDates = [];
        this.$set(this, 'items', items);
      },
      /**
       * Makes the items' structure in "years" mode.
       *
       * @method _makeYears
       * @fires _makeItem
       * @return {Object}
      */
      _makeYears(){
        let c = dayjs(this.currentDate.format('YYYY-01-01')),
            year = c.format('YYYY'),
            items = Array.from({length: 12}, (v, k) => {
              let w = c.year(year - 6 + k);
              return this._makeItem(
                w.format('YYYY'),
                w.format(this.currentCfg.valueFormat),
                false,
                false,
                k === 0 || k === 11,
                false
              );
            });
        this.gridStyle = 'grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(4, 1fr);';
        this.currentLabelsDates = [];
        this.$set(this, 'items', items);
      },
      /**
       * Returns the correct configuration based on the calendar type.
       *
       * @method getCfg
       * @return {Object}
       */
      getCfg(type){
        let m = type || this.type,
            cfg = {};
        switch ( m ){
          case 'days':
            bbn.fn.extend(cfg, {
              make: this._makeDays,
              step: [1, 'M'],
              stepSkip: [1, 'y'],
              stepEvent: [1, 'd'],
              stepText: bbn._('month'),
              stepSkipText: bbn._('year'),
              titleFormat: 'MMM YYYY',
              valueFormat: 'YYYY-MM-DD',
              labelsFormatDefault: 'ddd',
              labelsFormatLetter: 'dd',
              labelsFormatAbbr: 'ddd',
              labelsFormatFull: 'dddd',
              startFormat: 'YYYY-MM-01',
              endFormat: () => {
                return 'YYYY-MM-' + this.currentDate.daysInMonth()
              },
              startExtra: [7, 'd'],
              endExtra: [15, 'd']
            });
            break;
          case 'weeks':
            bbn.fn.extend(cfg, {
              make: this._makeWeeks,
              step: [1, 'w'],
              stepEvent: [1, 'w'],
              stepText: bbn._('week'),
              titleFormat: 'MMM YYYY',
              valueFormat: 'YYYY-MM-DD',
              labelsFormatDefault: 'ddd',
              labelsFormatLetter: 'dd',
              labelsFormatAbbr: 'ddd',
              labelsFormatFull: 'dddd',
              startFormat: () => {
                return dayjs(this.currentDate).weekday(0).format('YYYY-MM-DD');
              },
              endFormat: () => {
                return dayjs(this.currentDate).weekday(6).format('YYYY-MM-DD');
              }
            });
            break;
          case 'months':
            bbn.fn.extend(cfg, {
              make: this._makeMonths,
              step: [1, 'y'],
              stepEvent: [1, 'M'],
              stepText: bbn._('year'),
              titleFormat: 'YYYY',
              valueFormat: 'YYYY-MM',
              startFormat: 'YYYY-01-01',
              endFormat: 'YYYY-12-31'
            });
            break;
          case 'years':
            bbn.fn.extend(cfg, {
              make: this._makeYears,
              step: [10, 'y'],
              stepEvent: [1, 'y'],
              stepText: bbn._('decade'),
              titleFormat: () => {
                let from = this.currentDate.format('YYYY') - 5,
                    to = from + 9;
                return from + '-' + to;
              },
              valueFormat: 'YYYY',
              startFormat: () => {
                return (this.currentDate.format('YYYY') - 5) + '-01-01';
              },
              endFormat: () => {
                return (this.currentDate.format('YYYY') + 4) + '-12-31';
              }
            });
            break;
        }
        return cfg;
      },
      /**
       * Returns the correct labels' format.
       *
       * @method getLabelsFormat
       * @return {String|false}
       */
      getLabelsFormat(){
        if ( this.labels ){
          switch ( this.labels ){
            case 'letter':
              return this.currentCfg.labelsFormatLetter;
            case 'abbr':
              return this.currentCfg.labelsFormatAbbr;
            case 'full':
              return this.currentCfg.labelsFormatFull;
            default:
              if ( this.$refs.label && this.$refs.label[0] ){
                let w = this.$refs.label[0].offsetWidth;
                if ( w < 40 ){
                  return this.currentCfg.labelsFormatLetter;
                }
                else if ( w < 100 ){
                  return this.currentCfg.labelsFormatAbbr;
                }
                else {
                  return this.currentCfg.labelsFormatFull;
                }
              }
              return this.currentCfg.labelsFormatDefault;
          }
        }
        return false;
      },
      /**
       * Called to the component mounted setting currentDate at max or min.
       *
       * @method create
       * @fires init
       * @fires setTitle
       * @fires updateData
       */
      create(){
        if ( !this.ready ){
          this.$once('dataloaded', () => {
            this.init();
            this.$nextTick(() => {
              if ( !this.date && ( this.max || this.min) ){
                if ( this.max && !this.min && (this.max < this.currentDate.format(this.currentCfg.valueFormat)) ){
                  this.currentDate = dayjs(this.max, this.currentCfg.valueFormat);
                }
                if ( this.min && !this.max && (this.min > this.currentDate.format(this.currentCfg.valueFormat)) ){
                  this.currentDate = dayjs(this.min, this.currentCfg.valueFormat);
                }
                this.currentCfg.make();
                this.setTitle();
              }
              this.ready = true;
            });
          });
          this.updateData();
        }
      },
      /**
       * Defines and inserts events.
       *
       * @method makeEvents
       */
      makeEvents(){
        this.$set(this, 'events', {});
        bbn.fn.each(this.currentData, d => {
          let tmpStart = dayjs(d.data[this.startField], this.startFormat).format(this.currentCfg.valueFormat),
              tmpEnd = dayjs(d.data[this.endField], this.endFormat).format(this.currentCfg.valueFormat);
          if ( this.events[tmpStart] === undefined ){
            this.events[tmpStart] = [];
          }
          this.events[tmpStart].push(d.data);
          if ( tmpStart !== tmpEnd ){
            let mom = dayjs(tmpStart, this.currentCfg.valueFormat).add(...this.currentCfg.stepEvent),
                tmp = mom.format(this.currentCfg.valueFormat);
            while ( tmp <= tmpEnd ){
              if ( this.events[tmp] === undefined ){
                this.events[tmp] = [];
              }
              this.events[tmp].push(d.data);
              mom.add(...this.currentCfg.stepEvent);
              tmp = mom.format(this.currentCfg.valueFormat);
            }
          }
        });
      },
      /**
       * Initializes the calendar.
       *
       * @method init
       * @fires currentCfg.make
       * @fires makeEvents
       * @fires setTitle
       * @fires setLabels
       * @emits input
       */
      init(){
        if ( this.currentCfg && bbn.fn.isFunction(this.currentCfg.make) ){
          if ( this.selection && this.autoSelection && this.currentCfg.valueFormat ){
            this.currentValue = this.value ? dayjs(this.value, this.currentCfg.valueFormat).format(this.currentCfg.valueFormat) : '';
            this.$emit('input', this.currentValue);
          }
          this.makeEvents();
          this.setTitle();
          this.currentCfg.make();
          this.$nextTick(() => {
            this.setLabels(this.currentLabelsDates);
            this.$emit('init', true)
          });
        }
      },
      /**
       * Filters the events.
       *
       * @method filterEvents
       * @param {String} v
       * @return {Array}
      */
      filterEvents(v){
        return  []
        if ( this.startField && this.endField ){
          return this.currentData && bbn.fn.isArray(this.currentData) ?
            bbn.fn.map(bbn.fn.filter(this.currentData, ev => {
              if ( ev.data[this.startField] && ev.data[this.endField] ){
                let start = dayjs(ev.data[this.startField], this.startFormat).format(this.currentCfg.valueFormat),
                    end = dayjs(ev.data[this.endField], this.endFormat).format(this.currentCfg.valueFormat)
                return (start <= v) && (end >= v)
              }
              return false
            }), ev => {
              return ev.data
            }) :
            []
        }
        return []
      },
      /**
       * Sets the calendar's title.
       *
       * @method setTitle
       * @fires currentCfg.titleFormat
      */
      setTitle(){
        if ( this.currentCfg && this.currentCfg.titleFormat ){
          this.$set(this, 'title', bbn.fn.isFunction(this.currentCfg.titleFormat) ?
            this.currentCfg.titleFormat() :
            this.currentDate.format(this.currentCfg.titleFormat)
          );
        }
      },
      /**
       * Refreshes the data
       *
       * @method refresh
       * @param {Boolean} force
       * @fires updateData
       * @fires init
       * @emits dataLoad
       * @emits dataLoaded
      */
      refresh(force){
        if ( !force ){
          let ev = new Event('dataLoad', {cancelable: true});
          this.$emit('dataLoad', ev, this);
          if (ev.defaultPrevented) {
            return false;
          }
        }
        this.$once('dataloaded', () => {
          this.init();
        });
        this.updateData();
      },
      /**
       * Changes the current calendar view to the next period.
       *
       * @method next
       * @param {Boolean} skip
       * @fires refresh
       * @emits next
      */
      next(skip){
        skip = typeof skip === 'boolean' ? skip : false;
        if ( this.currentCfg && this.currentCfg.step && bbn.fn.isFunction(this.currentCfg.make) ){
          let check = dayjs(this.currentDate).add(...this.currentCfg[skip && this.currentCfg.stepSkip ? 'stepSkip' : 'step']).format(this.currentCfg.valueFormat);
          if ( this.max && (check > this.max) ){
            this.currentDate = dayjs(this.max, this.currentCfg.valueFormat);
          }
          else{
            this.currentDate = dayjs(check, this.currentCfg.valueFormat);
          }
          let ev = new Event('next', {cancelable: true});
          this.$emit('next', ev, this);
          if (ev.defaultPrevented) {
            return false;
          }
          this.refresh();
        }
      },
      /**
       * Changes the current calendar view to the previous period.
       *
       * @method prev
       * @param {Boolean} skip
       * @fires refresh
       * @emits prev
      */
      prev(skip){
        skip = typeof skip === 'boolean' ? skip : false;
        if ( this.currentCfg && this.currentCfg.step && bbn.fn.isFunction(this.currentCfg.make) ){
          let check = dayjs(this.currentDate).subtract(...this.currentCfg[skip && this.currentCfg.stepSkip ? 'stepSkip' : 'step']).format(this.currentCfg.valueFormat);
          if ( this.min && (check < this.min) ){
            this.currentDate = dayjs(this.min, this.currentCfg.valueFormat);
          }
          else {
            this.currentDate = dayjs(check, this.currentCfg.valueFormat);
          }
          let ev = new Event('prev');
          this.$emit('prev', ev, this);
          if (ev.defaultPrevented) {
            return false;
          }
          this.refresh();
        }
      },
      /**
       * Changes the current value after a selection.
       *
       * @method select
       * @param {String} val The selected day
       * @param {Boolean} [undefined] notEmit If true, the 'selected' emit will not be performed
       * @emits input
       * @emits selected
      */
      select(val, notEmit){
        if ( this.selection && val ){
          val = val === this.currentValue ? '' : val;
          this.currentValue = val;
          this.$emit('input', val);
          if ( !notEmit ){
            this.$emit('selected', val, this, this.currentCfg.valueFormat);
          }
        }
      },
      /**
       * Additionals data to sent with the ajax call.
       *
       * @method getPostData
       * @return {Object}
      */
      getPostData(){
        let start = dayjs(this.currentDate.format(bbn.fn.isFunction(this.currentCfg.startFormat) ?
              this.currentCfg.startFormat() :
              this.currentCfg.startFormat
            )),
            end = dayjs(this.currentDate.format(bbn.fn.isFunction(this.currentCfg.endFormat) ?
              this.currentCfg.endFormat() :
              this.currentCfg.endFormat
            )),
            data = {};
        if ( this.extraItems ){
          if ( this.currentCfg.startExtra ){
            start.subtract(...this.currentCfg.startExtra);
          }
          if ( this.currentCfg.endExtra ){
            end.add(...this.currentCfg.endExtra);
          }
        }
        data[this.startField] = start.format(this.startFormat);
        data[this.endField] = end.format(this.endFormat);
        if ( this.data ){
          bbn.fn.extend(data, bbn.fn.isFunction(this.data) ? this.data() : this.data);
        }
        return data;
      },
      /**
       * Sets the labels.
       *
       * @method setLabels
       * @param {Array} d
       * @fires getLabelsFormat
      */
      setLabels(d){
        if ( bbn.fn.isArray(d) && d.length ){
          this.currentLabels = d.map(l => {
            return l.format(this.getLabelsFormat());
          });
        }
        else {
          this.currentLabels = [];
        }
      },
      /**
       * Handles the resize.
       *
       * @method onResize
       * @fires setLabels
      */
      onResize(){
        return new Promise((resolve, reject) => {
          this.setLabels(this.currentLabelsDates);
          resolve();
        });
      }
    },
    /**
     * @event beforeCreate
     */
    beforeCreate(){
      if ( bbn.env && bbn.env.lang && (bbn.env.lang !== dayjs.locale()) ){
        dayjs.locale(bbn.env.lang);
      }
    },
    /**
     * @event mounted
     * @fires create
    */
    mounted(){
      this.create();
    },
    watch: {
      /**
       * @watch type
       * @fires create
      */
      type(newVal){
        this.ready = false;
        this.create();
      },
      /**
       * @watch currentLabelsDates
       * @fires setLabels
      */
      currentLabelsDates(newVal){
        this.setLabels(newVal);
      },
      /**
       * @watch value
       */
      value(newVal, oldVal){
        if ( newVal !== oldVal ){
          this.currentValue = newVal;
        }
      },
      /**
       * @watch currentData
       * @fires init
      */
      currentData(){
        this.init();
      }
    }
  };
