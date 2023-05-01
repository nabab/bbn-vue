/**
 * @file bbn-countdown component
 * @description bbn-countdown is a component that performs a countdown of a user-defined date, based on the measure of time defined in the construction.
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 13/02/2017.
*/


/** @todo try this way

 const timestamp = 1519482900000;
 const formatted = dayjs(timestamp).format('L');

 console.log(formatted);*/

return {
    /**
     * @mixin bbn.wc.mixins.basic
     */
    mixins: [bbn.wc.mixins.basic],
    static() {
      const VALUES = [{
        name: 'year',
        title: bbn._('year'),
        titles: bbn._('years'),
        code: 'y',
        separator: 'y',
        timeout: 3600000
      }, {
        name: 'month',
        title: bbn._('month'),
        titles: bbn._('months'),
        code: 'm',
        separator: 'm',
        diff: 12,
        timeout: 3600000
      }, {
        name: 'day',
        title: bbn._('day'),
        titles: bbn._('days'),
        code: 'd',
        diff: 31,
        separator: 'd',
        timeout: 3600000
      }, {
        name: 'hour',
        title: bbn._('hour'),
        titles: bbn._('hours'),
        code: 'h',
        diff: 24,
        separator: ':',
        timeout: 3600000
      }, {
        name: 'minute',
        title: bbn._('minute'),
        titles: bbn._('minutes'),
        code: 'i',
        diff: 60,
        separator: ':',
        timeout: 60000
      }, {
        name: 'second',
        title: bbn._('second'),
        titles: bbn._('seconds'),
        code: 's',
        diff: 60,
        separator: '.',
        timeout: 1000
      }, {
        name: 'millisecond',
        title: bbn._('millisecond'),
        titles: bbn._('milliseconds'),
        code: 'x',
        diff: 1000,
        separator: '',
        timeout: 50
      }];
    },
    props: {
      /**
       * The precision of the visible timer.
       * @prop {string} ['second'] precision
       */
      precision: {
        type: String,
        default: 'minute'
      },
      /**
       * The scale of the timer (largest unit).
       * @prop {string} ['hour'] scale
       */
      scale: {
        type: String,
        default: 'hour'
      },
      /**
       * Shows unit even if empty for countdown mode.
       * @prop {Boolean} [false] showZero
       */
      showZero: {
        type: Boolean,
        default: false
      },
      /**
       * The target date(s) if countdown or alarm.
       * @prop {Array|Date|String|Function} target
       */
      source: {
        type: [Object, Array, Date, String, Function]
      },
      /**
       * @prop {String} ['date'] sourceDate
       */
      sourceDate: {
        type: String,
        default: 'date'
      },
      /**
       * Set to true the remaining day and month and year will be displayed.
       * @prop {Boolean} [true] zeroFill
       */
      zeroFill: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {String} ['clock'] mode
       */
      mode: {
        type: String,
        default: 'clock'
      }
    },
    data(){
      return {
        isInit: false,
        currentTasks: [],
        taskIndex: 0,
        /**
         * The target year.
         * @data {Boolean} [false] targetYear
         */
        targetYear: false,
        /**
         * The target month.
         * @data {Boolean} [false] targetMonth
         */
        targetMonth: false,
        /**
         * The target day.
         * @data {Boolean} [false] targetDay
         */
        targetDay: false,
        /**
         * The target hour.
         * @data {Boolean} [false] targetHour
         */
        targetHour: false,
        /**
         * The target minute.
         * @data {Boolean} [false] targetMinute
         */
        targetMinute: false,
        /**
         * The target second.
         * @data {Boolean} [false] targetSecond
         */
        targetSecond: false,
        /**
         * The target millisecond.
         * @data {Boolean} [false] targetMillisecond
         */
        targetMillisecond: false,
       /* year: false,
        month: false,
        day: false,
        hour: false,
        minute: false,
        second: false,
        millisecond: false,*/
        /**
         * The interval of the countdown.
         * @data {Number} [0] interval
         */
        interval: 0,
        /**
         * The timestamp of the real target date.
         * @data {Boolean|Number} [false] time
         */
        time: false,
        /**
         * @data {String} ["{}"] prevValues
         */
        prevValues: JSON.stringify({}),
        /**
         * @data {Object} [{}] shown
         */
        shown: {},
        /**
         * @data {Object} [{}] text
         */
        text: {},
        /**
         * @data {Boolean} [false] isValid
         */
        isValid: false,
        /**
         * @data {Boolean} [false] currentTime
         */
        currentTime: null
      };
    },
    computed: {
      /**
       * The index of the 'precision' property in the array of the constant VALUES.
       * @return {Number} [5] precisionIdx
       */
      precisionIdx(){
        return bbn.fn.search(bbnTimerCreator.VALUES, this.precision.length === 1 ? 'code' : 'name', this.precision);
      },
      /**
       * The index of the 'scale' property in the array of the constant VALUES.
       * @return {Number} [5] scaleIdx
       */
      scaleIdx(){
        return bbn.fn.search(bbnTimerCreator.VALUES, this.scale.length === 1 ? 'code' : 'name', this.scale);
      },
      /**
       * List type of periods.
       * @return {Array} periods
       */
      periods() {
        return bbnTimerCreator.VALUES;
      },
      // @todo incomplete
      rendered(){
        if (this.template) {
        }
        return false;
      }
    },
    methods: {
      /**
       * Checks if the component has been correctly set up.
       * @method check
       * @return {Boolean}
       */
      check(){
        return (this.precisionIdx > -1) &&
          (this.scaleIdx > -1) &&
          (this.precisionIdx >= this.scaleIdx);
      },
      /**
       * Initializes the component.
       * @method init
       * @fires update
       */
      init(){
        if (this.precisionIdx === -1) {
          throw new Error(bbn._("The precision is incorrect"));
        }
        else if (this.scaleIdx === -1) {
          throw new Error(bbn._("The scale is incorrect"));
        }
        else {
          let tmp = bbn.fn.isFunction(this.source) ? this.source() : this.source;
          if (!bbn.fn.isArray(tmp)) {
            tmp = [tmp];
          }
          bbn.fn.each(tmp, t => this.addTask(t));
          this.cleanTasks();
          this.launch();
        }
      },
      launch(){
        clearInterval(this.interval);
        if (this.currentTasks.length && (this.mode === 'countdown')) {
          this.time = this.currentTasks[0].timestamp.getTime();
        }
        let timeout = bbnTimerCreator.VALUES[this.precisionIdx].timeout;
        this.update();
        this.interval = setInterval(this.update, timeout);
      },
      /**
       * Removes the past tasks
       */
      cleanTasks(){
        let now = (new Date()).getTime();
        for (let i = 0; i < this.currentTasks.length; i++) {
          while (now > this.currentTasks[i].timestamp) {
            this.currentTasks.shift();
          }
        }
      },
      /**
       * Adds a new task to the timer, should be in the future.
       * 
       * @param {mixed} task 
       */
      addTask(task){
        let r;
        if (bbn.fn.isString(task)) {
          r = {
            [this.sourceDate]: bbn.fn.date(task)
          };
        }
        else if (bbn.fn.isDate(task)) {
          r = {
            [this.sourceDate]: bbn.fn.date(task)
          };
        }
        else if (bbn.fn.isObject(task)) {
          r = task; 
        }

        if (r && r[this.sourceDate] && bbn.fn.isDate(r[this.sourceDate])) {
          let now = (new Date()).getTime();
          r.timestamp = r[this.sourceDate].getTime();
          for (let i = 0; i < this.currentTasks.length; i++) {
            if (this.currentTasks[i].timestamp < r.timestamp) {
              this.currentTasks.unshift(r);
              return true;
            }
            else if (this.currentTasks[i].timestamp === r.timestamp) {
              let tmp = this.currentTasks[i].action;
              if (tmp && r.action) {
                this.currentTasks[i].action = () => {
                  tmp();
                  r.action();
                };
                return true;
              }
            }
          }

          this.currentTasks.push(r);
          return true;
        }

        return false;
      },
      /**
       * Udates the component.
       * @method update
       * @fires check
       * @fires getShown
       * @fires getText
       */
      update(){
        if (this.check()) {
          let d = new Date();
          if ((this.mode === 'countdown') && this.time) {
            let secs = this.time - d.getTime();
            if ( secs <= 0 ){
              if (this.isValid) {
                bbn.fn.each(bbnTimerCreator.VALUES, (a, i) => {
                  this[a.name] = 0;
                });
                this.isValid = false;
              }
            }
            else if (secs) {
              let diff = dayjs.duration(secs, 'seconds');
              let diffs = {};
              bbn.fn.each(bbnTimerCreator.VALUES, (a, i) => {
                diffs[a.name] = diff['as' + a.name[0].toUpperCase() + bbn.fn.substr(a.name, 1) + 's']();
                if ((i >= this.scaleIdx) && (i <= this.precisionIdx)) {
                  let round = Math.floor(diffs[a.name]);
                  diffs[a.name] = round;
                  if (i < this.precisionIdx) {
                    diff = diff.subtract(dayjs.duration(round, a.name + 's'));
                  }
                }
              });
              bbn.fn.iterate(diffs, (b, n) => {
                this[n] = b;
              });
              if (!this.isValid) {
                this.isValid = true;
              }
              this.shown =  this.getShown();
              this.text =  this.getText();
              this.$forceUpdate();
            }
          }
          else {
            this.currentTime = bbn.fn.formatDate(d, "HH:mm");
          }
        }
      },
      /**
       * Returns the descriptive list of units used in the countdown.
       *
       * @method getShow
       * @return {Object}
       */
      getShown(){
        let res = {};
        bbn.fn.each(bbnTimerCreator.VALUES, (a, i) => {
          res[a.name] = (this.showZero || this[a.name] || this.zeroFill)
                        && ((this.precisionIdx >= i) && (this.scaleIdx <= i));
        })
        return res;
      },
      /**
       * Returns the descriptive list of units used in the countdown with the value that contains it when calling this function.
       *
       * @method getText
       * @return {Object}
       */
      getText(){
        let res = {};
        bbn.fn.each(bbnTimerCreator.VALUES, (a, i) =>  {
          res[a.name] = this[a.name] || 0;
          if (
            this.zeroFill
            && (this.scaleIdx !== i)
            && (res[a.name].toString().length <= 1)
          ) {
            res[a.name] = '0' + res[a.name];
          }
        });
        return res;
      },
    },
    /**
     * @event created
     * @fires init
     */
    created(){
      this.init();
    },
    /**
     * @event beforeDestroy
     */
    beforeDestroy(){
      if(this.interval){
        clearInterval(this.interval);
      }
    }
  };
