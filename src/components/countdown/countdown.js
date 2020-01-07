//backup countdown
 /**
  * @file bbn-countdown component
  *
  * @description bbn-countdown is a component that performs a countdown of a user-defined date, based on the measure of time defined in the construction.
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 13/02/2017.
  */


/** @todo try this way

 const timestamp = 1519482900000;
 const formatted = moment(timestamp).format('L');

 console.log(formatted);*/


(function(bbn){
  "use strict";

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

  Vue.component('bbn-countdown', {
    /**
     * @mixin bbn.vue.basicComponent  
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * The precision of the countdown.
       * @prop {precision} ['second'] precision
       */
      precision: {
        type: String,
        default: 'second'
      },
      /**
       * The scale of the countdown.
       * @prop {precision} ['year'] scale
       */
      scale: {
        type: String,
        default: 'year'
      },
      /**
       * The target date.
       * @prop {Date|String|Function} target
       */
      target: {
        type: [Date, String, Function]
      },
      /**
       * Shows unit even if empty.
       * @prop {Date|String|Function} target
       */
      showZero: {
        type: Boolean,
        default: false
      },
      zeroFill: {
        type: Boolean,
        default: true
      }
    },
    data(){
      return {
        /**
         * The target year.
         * @data {Boolean} targetYear
         */
        targetYear: false,
        /**
         * The target month.
         * @data {Boolean} targetMonth
         */
        targetMonth: false,
        /**
         * The target day.
         * @data {Boolean} targetDay
         */
        targetDay: false,
        /**
         * The target hour.
         * @data {Boolean} targetHour
         */
        targetHour: false,
        /**
         * The target minute.
         * @data {Boolean} targetMinute
         */
        targetMinute: false,
        /**
         * The target second.
         * @data {Boolean} targetSecond
         */
        targetSecond: false,
        /**
         * The target millisecond.
         * @data {Boolean} targetMillisecond
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
         * @data {Boolean|Number} time
         */
        time: false,
        prevValues: JSON.stringify({}),
        shown: {},
        text: {},
        isValid: false,
        realTarget: false
      };
    },
    computed: {
      /**
       * The index of the 'precision' property in the array of the constant VALUES.
       * @data {Number} [5] precisionIdx
       */
      precisionIdx(){
        return bbn.fn.search(VALUES, this.precision.length === 1 ? 'code' : 'name', this.precision);
      },
      /**
       * The index of the 'scale' property in the array of the constant VALUES.
       * @data {Number} [5] precisionIdx
       */
      scaleIdx(){
        return bbn.fn.search(VALUES, this.scale.length === 1 ? 'code' : 'name', this.scale);
      },
      periods() {
        return VALUES;
      },
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
        return this.realTarget &&
          (this.precisionIdx > -1) &&
          (this.scaleIdx > -1) &&
          (this.precisionIdx >= this.scaleIdx);
      },
      /**
       * Initializes the component.
       * @fires getTime
       * @fires getFullYear
       * @fires getMonth
       * @fires getDate
       * @fires getHours
       * @fires getMinutes
       * @fires getSeconds
       * @fires getMilliseconds
       */
      init(){
        clearInterval(this.interval);
        if (this.precisionIdx === -1) {
          throw new Error(bbn._("The precision is incorrect"));
        }
        else if (this.scaleIdx === -1) {
          throw new Error(bbn._("The scale is incorrect"));
        }
        else{
          let tmp = bbn.fn.isFunction(this.target) ? this.target() : this.target;
          if (bbn.fn.isString(tmp)) {
            tmp = bbn.fn.date(tmp);
          }
          this.realTarget = new moment(tmp);
          this.time = this.realTarget.unix();
          let timeout = VALUES[this.precisionIdx].timeout;
          this.update();
          this.interval = setInterval(this.update, timeout);
        }
      },
      /**
       * Udates the component.
       * @method update
       * @fires getFullYear
       * @fires getMonth
       * @fires getDate
       * @fires getHours
       * @fires getMinutes
       * @fires getSeconds
       * @fires getMilliseconds 
       *
       */
      update(){
        if ( this.check() ){
          let d = new moment();
          let secs = this.time - d.unix();
          if ( secs <= 0 ){
            if (this.isValid) {
              bbn.fn.each(VALUES, (a, i) => {
                this[a.name] = 0;
              });
              this.isValid = false;
            }
          }
          else if (secs) {
            let diff = moment.duration(secs, 'seconds');
            let diffs = {};
            bbn.fn.each(VALUES, (a, i) => {
              diffs[a.name] = diff['as' + a.name[0].toUpperCase() + a.name.substr(1) + 's']();
              if ((i >= this.scaleIdx) && (i <= this.precisionIdx)) {
                let round = Math.floor(diffs[a.name]);
                diffs[a.name] = round;
                if (i < this.precisionIdx) {
                  diff = diff.subtract(moment.duration(round, a.name + 's'));
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
      },
      getShown(){
        let res = {};
        bbn.fn.each(VALUES, (a, i) => {
          res[a.name] = (this.showZero || this[a.name] || this.zeroFill)
                        && ((this.precisionIdx >= i) && (this.scaleIdx <= i));
        })
        return res;
      },
      getText(){
        let res = {};
        bbn.fn.each(VALUES, (a, i) =>  {
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
    },
    watch: {
      target(){
        this.init()
      }
    }
  });
})(bbn);
