/**
 * @file bbn-calendar component
 *
 * @author Mirko Argentino
 * @copyright BBN Solutions
 */

(($, bbn) => {
  "use strict";

  Vue.component('bbn-calendar', {
    /** 
     * @mixin bbn.vue.basicComponent
    */
    mixins: [bbn.vue.basicComponent],
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
       * Supplementary data to send with the ajax call.
       * @prop {Object} [{}] data
      */
      data: {
        type: Object,
        default(){
          return {}
        }
      },
      /** 
       * Set any calendar's day selectable.
       * 
       * @prop {Boolean} [true] selectable
      */
      selectable: {
        type: Boolean,
        default: true
      },
      /** 
       * Set it to true if you want to select the date property value automatically.
       * 
       * @prop {Boolean} [false] autoSelect
      */
      autoSelect: {
        type: Boolean,
        default: false
      },
      /** 
       * Shows/hides the arrows to change the month.
       * 
       * @prop {Boolean} [true] arrowsMonth
      */
      arrowsMonth: {
        type: Boolean,
        default: true
      },
      /** 
       * Shows/hides the arrows to change the year.
       * 
       * @prop {Boolean} [true] arrowsYear
      */
      arrowsYear: {
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
       * 
       * 
       * @prop {String|Boolean} ['nf nf-fa-calendar_alt'] monthIcon
      */
      monthIcon: {
        type: [String, Boolean],
        default: 'nf nf-oct-calendar'
      },
      /** 
       * The initial date
       * 
       * @prop {String} date
      */
      date: {
        type: String
      },
      /** 
       * Shows/hides the days of the next and previous month.
       * 
       * @prop {Boolean} [false] extraDays
      */
      extraDays: {
        type: Boolean,
        default: false
      },
      /**
       * 
       * 
       * @prop {Array} [[]] daysRange
       */
      daysRange: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * Shows only the days with events
       * 
       * @prop {Boolean} [false] onlyEvents
       */
      onlyEvents: {
        type: Boolean,
        default: false
      },
      /** 
       * Shows/hides the days'details.
       * 
       * @prop {Boolean} [false] dayDetails
      */
      dayDetails: {
        type: Boolean,
        default: false
      },
      /** 
       * The icon used to indicate the presence of events in the day.
       * If you set it to false nothing will be shown.
       * 
       * @prop {String|Boolean} ['nf nf-fa-user'] dayIcon
      */
      dayIcon: {
        type: [String, Boolean],
        default: 'nf nf-fa-calendar'
      },
      /** 
       * Shows/hides the padding of the days'cell.
       * 
       * @prop {Boolean} [false] dayPadding
      */
      dayPadding: {
        type: Boolean,
        default: false
      },
      /** 
       * The component used for the items.
       * 
       * @prop {Vue} detailsComponent
      */
      detailsComponent: {
        type: [Vue, Object, String]
      },
      /** 
       * The title for the day's details.
       * 
       * @prop {Function|String} [''] titleDetails
      */
      titleDetails: {
        type: [Function, String],
        default: ''
      },
      /** 
       * The component used for the header.
       * 
       * @prop {Vue|Object} headerComponent
      */
      headerComponent: {
        type: [Vue, Object, String]
      }
    },
    data(){
      let mom = this.date ? moment(this.date) : moment();
      return {
        /** 
         * Today as '2019-03-10' format.
         * @data {String} [today] today 
        */
        today: moment().format('YYYY-MM-DD'),
        /** 
         * The current month and year.
         * @data {String} monthYear 
        */
        monthYear: '',
        /** 
         * The weekdays initials.
         * @data {Array} initials 
        */
        initials: Array.from({length: 7}, (v, i) => moment(mom).weekday(i).format('ddd')),
        /** 
         * The current date as Moment.js object.
         * @data {Moment} currentDate 
         */
        currentDate: mom,
        /** 
         * The days structures.
         * @data {Array} [[]] days 
        */
        days: [],
        /** 
         * The selected day as '2019-03-10' format.
         * @data {String|Boolean} [false] 
        */
        selected: this.selectable && this.autoSelect && this.date ? mom.format('YYYY-MM-DD') : false
      }
    },
    methods: {
      /** 
       * Makes the days' structure. 
       * 
       * @method _makeDays
       * @param {Array} [undefined] events The events list.
       * @emits days
      */
      _makeDays(events){
        let days = [],
            c = moment(this.currentDate.format('YYYY-MM-01'));
        for ( let i = 1; i <= 6; i++ ){
          if ( i > 1 ){
            c.add(6, 'd');
          }
          days = days.concat(Array.from({length: 7}, (v, k) => {
            let w = c.weekday(k),
                m = (w.get('month') + 1).toString(),
                d = w.get('date').toString(),
                f = `${w.get('year')}-${m.length === 1 ? '0' + m : m}-${d.length === 1 ? '0' + d : d}`,
                ev = events && bbn.fn.isArray(events) ? events.filter(ev => {
                  let start = moment(ev.start).format('YYYY-MM-DD'),
                      end = moment(ev.end).format('YYYY-MM-DD');
                  return (start <= f) && (end >= f);
                }) : [],
                isVisible = !this.extraDays && (w.get('month') !== this.currentDate.get('month')) ? false : true;
            if ( this.onlyEvents && !ev.length ){
              isVisible = false;
            }
            return {
              day: w.get('date'),
              fullDate: f,
              isToday: f === this.today,
              isLast: k === 6,
              hover: false,
              visible: isVisible,
              events: ev,
              inRange: this.daysRange.includes(f)
            };
          }));
        }
        this.$set(this, 'days', days);
        this.$emit('days', this.currentDate.format('YYYY-MM'));
      },
      /** 
       * Loads the days.
       * 
       * @method loadDays
       * @param {Boolean} [undefined] force Force to load the days.
       * @emits loadDays
       * @fires _makeDays
      */
      loadDays(force){
        if ( !force ){
          let ev = $.Event('loadDays');
          this.$emit('loadDays', ev, this);
          if (ev.isDefaultPrevented()) {
            return false;
          }
        }
        if ( this.source ){
          if ( bbn.fn.isArray(this.source) ){
            this._makeDays(this.source);
          }
          else {
            let start = moment(this.currentDate.format('YYYY-MM-01')),
                end = moment(this.currentDate.format('YYYY-MM-') + this.currentDate.daysInMonth());
            if ( this.extraDays ){
              start = start.subtract(7, 'd');
              end = end.add(15, 'd');
            }
            bbn.fn.post(this.source, bbn.fn.extend({}, this.data, {
              start: start.format('YYYY-MM-DD 00:00:00'),
              end: end.format('YYYY-MM-DD 23:59:59')
            }), d => {
              if ( d.data ){
                this.$emit('loadedDays', d);
                this._makeDays(d.data);
              }
            });
          }
        }
        else {
          this._makeDays();
        }
      },
      /** 
       * Sets the currenty month-year.
       * 
       * @method setMonthYear
      */
      setMonthYear(){
        this.$set(this, 'monthYear', this.currentDate.format('MMMM YYYY'));
      },
      /** 
       * Loads the days and set the current month-year
       * 
       * @method refresh
       * @fires loadDays
       * @fires setMonthYear
      */
      refresh(){
        this.loadDays();
        this.setMonthYear();
      },
      /** 
       * Moves the calendar to the next month.
       * 
       * @method nextMonth
       * @emits nextMonth
       * @fires refresh
      */
      nextMonth(){
        this.currentDate.add(1, 'M');
        let ev = $.Event('nextMonth');
        this.$emit('nextMonth', ev, this);
        if (ev.isDefaultPrevented()) {
          return false;
        }
        this.refresh();
      },
      /** 
       * Moves the calendar to the previous month.
       * 
       * @method prevMonth
       * @emits prevMonth
       * @fires refresh
      */
      prevMonth(){
        this.currentDate.subtract(1, 'M');
        let ev = $.Event('prevMonth');
        this.$emit('prevMonth', ev, this);
        if (ev.isDefaultPrevented()) {
          return false;
        }
        this.refresh();
      },
      /** 
       * Moves the calendar to the next year.
       * 
       * @method nextYear
       * @emits nextYear
       * @fires refresh
      */
      nextYear(){
        this.currentDate.add(1, 'y');
        let ev = $.Event('nextYear');
        this.$emit('nextYear', ev, this);
        if (ev.isDefaultPrevented()) {
          return false;
        }
        this.refresh();
      },
      /** 
       * Moves the calendar to the previous year.
       * 
       * @method prevYear
       * @emits prevYear
       * @fires refresh
      */
      prevYear(){
        this.currentDate.subtract(1, 'y');
        let ev = $.Event('prevYear');
        this.$emit('prevYear', ev, this);
        if (ev.isDefaultPrevented()) {
          return false;
        }
        this.refresh();
      },
      /** 
       * 
       * 
       * @method select
       * @param {String} day The selected day
       * @param {Boolean} [undefined] notEmit If true the emit will not be performed
       * @emits selected
      */
      select(day, notEmit){
        if ( this.selectable && day ){
          day = day === this.selected ? false : day;
          this.$set(this, 'selected', day);
          if ( !notEmit ){
            this.$emit('selected', day, this);
          }
        }
      }
    },
    /**
     * The mounted event.
     *
     * @event mounted
     * @fires refresh
    */
    mounted(){
      this.refresh();
    }
  })
})(jQuery, bbn);