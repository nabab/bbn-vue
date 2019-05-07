/**
 * @file bbn-calendar component
 *
 * @description The bbn-calendar component is a modern calendar, easy to implement, it allows you to select the date in an intuitive way with the possibility of inserting reminders and providing details of the day as events.
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino * 
 */

(($, bbn) => {
  "use strict";

  Vue.component('bbn-calendar2', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.sourceArrayComponent
     * @mixin bbn.vue.resizerComponent
    */
    mixins: [bbn.vue.basicComponent, bbn.vue.sourceArrayComponent, bbn.vue.resizerComponent],
    props: {
      /**
       * The events data for every days.
       * If you set a string, an ajax call will be made to this url.
       *
       * @prop {String|Array} [[]] source
      */
      source: {
        type: [String, Array],
        default(){
          return [];
        }
      },
      /**
       * The visualization mode.
       * Types: "days", "weeks", "months", "years".
       *
       * @prop {String} ['days'] type
      */
      type: {
        type: String,
        default: 'days',
        validator: (m) => ['days', 'weeks', 'months', 'years'].includes(m)
      },
      /**
       * Set it to true if you want to select the date property value automatically.
       *
       * @prop {Boolean} [false] autoSelect
      */
      autoSelection: {
        type: Boolean,
        default: false
      },
      /**
       * Se it to true if you wanto to select multi values.
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
       * Shows/hides the arrows to change the period.
       *
       * @prop {Boolean} [true] arrowMonth
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
       * Icon to use before the title.
       *
       * @prop {String|Boolean} ['nf nf-oct-calendar'] titleIcon
      */
      titleIcon: {
        type: [String, Boolean],
        default: 'nf nf-oct-calendar'
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
       * Shows/hides the items of the next and previous period.
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
       * Shows only items with events.
       *
       * @prop {Boolean} [false] onlyEvents
       */
      onlyEvents: {
        type: Boolean,
        default: false
      },
      /**
       * Shows/hides the item's details.
       *
       * @prop {Boolean} [false] itemDetails
      */
      itemDetails: {
        type: Boolean,
        default: false
      },
      /**
       * The icon used to indicate the presence of events in the item.
       * If you set it to false nothing will be shown.
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
       * Types: 'auto', 'letter', 'abbr', 'full', false.
       *
       * @prop {String|Boolean} ['auto'] labels
      */
      labels: {
        type: [String, Boolean],
        default: 'auto',
        validator: (s) => ['auto', 'letter', 'abbr', 'full', false].includes(s)
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
      }
    },
    data(){
      let mom = this.date ? moment(this.date, this.getCfg().valueFormat) : moment();
      return {
        /**
         * Today as 'YYYY-MM-DD' format.
         *
         * @data {String} [today] today
        */
        today: moment().format('YYYY-MM-DD'),
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
         * The Moments objects of the labels.
         *
         * @data {Array} [[]] currentLabelsDates
        */
        currentLabelsDates: [],
        /**
         * The current date as Moment object.
         *
         * @data {Moment} currentDate
         */
        currentDate: mom,
        /**
         * The items structures.
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
        currentValue: ''
      }
    },
    computed: {
      /**
       * The current cfg.
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
       * Make a calendar item's structure.
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
        let events = this.filterEvents(val),
            obj = {
              text: txt,
              value: val,
              isCurrent: val === moment(this.today).format(this.currentCfg.valueFormat),
              hidden: !!hid,
              colored: !!col,
              over: false,
              events: events,
              inRange: this.itemsRange.includes(val),
              disabled: !!dis,
              extra: !!ext
            };
        if (
          (this.onlyEvents && !ev.length) ||
          (this.min && (obj.value < this.min)) ||
          (this.max && (obj.value > this.max))
        ){
          obj.hidden = true;
        }
        if ( this.disableDates ){
          obj.disabled = bbn.fn.isFunction(this.disableDates) ? this.disableDates(obj.value) : this.disableDates.includes(obj.value);
        }
        return obj;
      },
      /**
       * Makes the items' structure of "days" mode.
       *
       * @method _makeDays
       * @fires _makeItem
       * @return {Object}
      */
      _makeDays(){
        let items = [],
            c = moment(this.currentDate.format('YYYY-MM-01'));
        for ( let i = 1; i <= 6; i++ ){
          if ( i > 1 ){
            c.add(6, 'd');
          }
          items = items.concat(Array.from({length: 7}, (v, k) => {
            let w = c.weekday(k),
                val = w.format(this.currentCfg.valueFormat),
                isHidden = !this.extraItems && (w.get('month') !== this.currentDate.get('month')) ? true : false;
            return this._makeItem(
              w.get('date'),
              val,
              isHidden,
              k === 6,
              false,
              this.extraItems && (w.get('month') !== this.currentDate.get('month'))
            );
          }));
        }
        this.gridStyle = 'grid-template-columns: repeat(7, 1fr); grid-template-rows: max-content repeat(6, 1fr);';
        this.currentLabelsDates = Array.from({length: 7}, (v, i) => moment(this.currentDate).weekday(i));
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
        let c = moment(this.currentDate),
            items = Array.from({length: 7}, (v, k) => {
              let w = c.weekday(k);
              return this._makeItem(
                w.get('date'),
                w.format(this.currentCfg.valueFormat),
                false,
                k === 6,
                false,
                false
              );
            });
        this.gridStyle = 'grid-template-columns: repeat(7, 1fr); grid-template-rows: max-content auto';
        this.currentLabelsDates = Array.from({length: 7}, (v, i) => moment(this.currentDate).weekday(i));
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
        let c = moment(this.currentDate.format('YYYY-01-01')),
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
       * Makes the items' structure of "years" mode.
       *
       * @method _makeYears
       * @fires _makeItem
       * @return {Object}
      */
      _makeYears(){
        let c = moment(this.currentDate.format('YYYY-01-01')),
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
       * Returns the correct configuration based of the calendar type.
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
              stepText: bbn._('day'),
              stepSkipText: bbn._('month'),
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
              stepText: bbn._('week'),
              titleFormat: 'MMM YYYY',
              valueFormat: 'YYYY-MM-DD',
              labelsFormatDefault: 'ddd',
              labelsFormatLetter: 'dd',
              labelsFormatAbbr: 'ddd',
              labelsFormatFull: 'dddd',
              startFormat: () => {
                return moment(this.currentDate).weekday(0).format('YYYY-MM-DD');
              },
              endFormat: () => {
                return moment(this.currentDate).weekday(6).format('YYYY-MM-DD');
              }
            });
            break;
          case 'months':
            bbn.fn.extend(cfg, {
              make: this._makeMonths,
              step: [1, 'y'],
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
       * Initializes the calendar.
       *
       * @method init
       * @fires currentCfg.make
       * @fires setLabels
       */
      init(){
        if ( this.currentCfg && bbn.fn.isFunction(this.currentCfg.make) ){
          if ( this.selection && this.autoSelection && this.currentCfg.valueFormat ){
            this.currentValue = this.value ? moment(this.value, this.currentCfg.valueFormat).format(this.currentCfg.valueFormat) : '';
            this.$emit('input', this.currentValue);
          }
          this.setTitle();
          this.currentCfg.make();
          this.$nextTick(() => {
            this.setLabels(this.currentLabelsDates);
          });
        }
      },
      /**
       * Filters the events.
       *
       * @method filterEvents
       * @return {Array}
      */
      filterEvents(v){
        if ( this.startField && this.endField ){
          return this.currentData && bbn.fn.isArray(this.currentData) ? this.currentData.filter(ev => {
            if ( ev[this.startField] && ev[this.endField] ){
              let start = moment(ev[this.startField], this.startFormat).format(this.currentCfg.valueFormat),
                  end = moment(ev[this.endField], this.endFormat).format(this.currentCfg.valueFormat);
              return (start <= v) && (end >= v);
            }
            return false;
          }) : []
        }
        return [];
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
       * @fires updateData
       * @fires init
       * @emits dataLoad
       * @emits dataLoaded
      */
      refresh(force){
        if ( !force ){
          let ev = $.Event('dataLoad');
          this.$emit('dataLoad', ev, this);
          if (ev.isDefaultPrevented()) {
            return false;
          }
        }
        this.updateData().then((res) => {
          this.$emit('dataLoaded', res, this.currentData, this);
          this.init();
        });
      },
      /**
       * Moves the calendar to the next period.
       *
       * @method next
       * @fires refresh
       * @emits next
      */
      next(skip){
        if ( this.currentCfg && this.currentCfg.step && bbn.fn.isFunction(this.currentCfg.make) ){
          let check = moment(this.currentDate).add(...this.currentCfg[skip && this.currentCfg.stepSkip ? 'stepSkip' : 'step']);
          if ( this.max && (check.format(this.currentCfg.valueFormat) > this.max) ){
            this.currentDate = moment(this.max, this.currentCfg.valueFormat);
          }
          else{
            this.currentDate.add(...this.currentCfg[skip && this.currentCfg.stepSkip ? 'stepSkip' : 'step']);
          }
          let ev = $.Event('next');
          this.$emit('next', ev, this);
          if (ev.isDefaultPrevented()) {
            return false;
          }
          this.refresh();
        }
      },
      /**
       * Moves the calendar to the previous period.
       *
       * @method prev
       * @fires refresh
       * @emits prev
      */
      prev(skip){
        if ( this.currentCfg && this.currentCfg.step && bbn.fn.isFunction(this.currentCfg.make) ){
          let check = moment(this.currentDate).subtract(...this.currentCfg[skip && this.currentCfg.stepSkip ? 'stepSkip' : 'step']);
          if ( this.min && (check.format(this.currentCfg.valueFormat) < this.min) ){
            this.currentDate = moment(this.min, this.currentCfg.valueFormat);
          }
          else {
            this.currentDate.subtract(...this.currentCfg[skip && this.currentCfg.stepSkip ? 'stepSkip' : 'step']);
          }
          let ev = $.Event('prev');
          this.$emit('prev', ev, this);
          if (ev.isDefaultPrevented()) {
            return false;
          }
          this.refresh();
        }
      },
      /**
       * Change the current value after a selection.
       *
       * @method select
       * @param {String} day The selected day
       * @param {Boolean} [undefined] notEmit If true the 'selected' emit will not be performed
       * @emits input
       * @emits selected
      */
      select(val, notEmit){
        if ( this.selection && val ){
          val = val === this.currentValue ? '' : val;
          this.currentValue = val;
          this.$emit('input', val);
          if ( !notEmit ){
            this.$emit('selected', val, this);
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
        let start = moment(this.currentDate.format(bbn.fn.isFunction(this.currentCfg.startFormat) ?
              this.currentCfg.startFormat() :
              this.currentCfg.startFormat
            )),
            end = moment(this.currentDate.format(bbn.fn.isFunction(this.currentCfg.endFormat) ?
              this.currentCfg.endFormat() :
              this.currentCfg.endFormat
            )),
            data = {};
        if ( this.extraItems ){
          if ( this.currentCfg.startExtra ){
            start.subtract(...this.currentCfg.startExtra);
          }
          if ( this.currentCfg.endExtra ){
            start.add(...this.currentCfg.endExtra);
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
       * @fires getLabelsFormat
      */
      setLabels(d){
        if ( bbn.fn.isArray(d) && d.length ){
          this.currentLabels = d.map((l) => {
            return l.format(this.getLabelsFormat());
          });
        }
        else {
          this.currentLabels = [];
        }
      },
      /**
       * Called on windows resize.
       *
       * @method onResize
       * @fires setLabels
      */
      onResize(){
        this.setLabels(this.currentLabelsDates);
      }
    },
    /**
     * @event mounted
     * @fires updateData
     * @fires init
     * @emits dataLoaded
    */
    mounted(){
      this.updateData().then((res) => {
        this.$emit('dataLoaded', res, this.currentData, this);
        this.init();
        this.$nextTick(() => {
          this.ready = true;
        });
      });
    },
    watch: {
      /**
       * @watch type
       * @fires init
      */
      type(newVal){
        this.init();
      },
      /**
       * @watch currentLabelsDates
       * @fires setLabels
      */
      currentLabelsDates(newVal){
        this.setLabels(newVal);
      }
    }
  })
})(jQuery, bbn);