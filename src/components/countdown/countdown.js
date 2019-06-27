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
    timeout: 3600000
  }, {
    name: 'month',
    timeout: 3600000
  }, {
    name: 'day',
    timeout: 3600000
  }, {
    name: 'hour',
    timeout: 3600000
  }, {
    name: 'minute',
    timeout: 60000
  }, {
    name: 'second',
    timeout: 1000
  }, {
    name: 'millisecond',
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
    },
    data(){
      return {
        /**
         * The index of the 'precision' property in the array of the constant VALUES.
         * @data {Number} [5] precisionIdx
         */
        precisionIdx: bbn.fn.search(VALUES, "name", this.precision),
        /**
         * The index of the 'scale' property in the array of the constant VALUES.
         * @data {Number} [5] precisionIdx
         */
        scaleIdx: bbn.fn.search(VALUES, "name", this.scale),
        /**
         * The target date normalized.
         * @data {String} realTarget
         */
        realTarget: bbn.fn.date(bbn.fn.isFunction(this.target) ? this.target() : this.target),
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
        time: false
      };
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
          (this.precisionIdx > this.scaleIdx);
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
        if ( this.check() ){
          this.time = this.realTarget.getTime();
          this.targetYear = this.realTarget.getFullYear();
          this.targetMonth = this.realTarget.getMonth();
          this.targetDay = this.realTarget.getDate();
          this.targetHour = this.realTarget.getHours();
          this.targetMinute = this.realTarget.getMinutes();
          this.targetSecond = this.realTarget.getSeconds();
          this.targetMillisecond = this.realTarget.getMilliseconds();
          /* let next,
             d = new Date();
           if ( this.precisionIdx <= 3 ){
             next = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() +1, 0, 0);
           }
           else if ( this.precisionIdx === 4 ){
             next = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getMinutes() +1, 0, 0);
           }
           else {
             next = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getMinutes(), d.getSeconds() + 1, 0);
           }
           let timeout = next.getTime() - d.getTime();

           if ( timeout < 0 ){
             timeout = 0;
           }*/
          let timeout = bbn.fn.get_field(VALUES, 'name', this.precision, 'timeout');
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
        let d = new Date(),
          tNow = d.getTime();
        if ( tNow > this.time ){
          bbn.fn.each(VALUES, (a, i) => {
            this[a.name] = 0;
          });
        }
        else{
          let diff = [
            this.targetYear - d.getFullYear(),
            this.targetMonth - d.getMonth(),
            this.targetDay - d.getDate(),
            this.targetHour - d.getHours(),
            this.targetMinute - d.getMinutes(),
            this.targetSecond - d.getSeconds(),
            this.targetMillisecond - d.getMilliseconds()
          ];
          for ( let i = 0; i < VALUES.length; i++ ){
            /*if ( this.precisionIdx > i ){
              if ( diff[i] <= 0 ) {
                diff[i - 1]--;
                switch (i) {
                  case 1:
                    if ( this.targetMonth - d.getMonth() === 0 ){
                      diff[1] = 0;
                    }
                    break;

                  case 3:
                    bbn.fn.log('DIFFERENZA GIORNI', diff[i - 1])

                    diff[3] = 24 + diff[3];
                    break;
                  case 4:
                    diff[4] = 60 - d.getMinutes() + this.targetMinute;
                    break;
                  case 5:
                    //because of diff[5] is a negative number
                    diff[5] = 60 + diff[5];
                    break;
                }
              }
            }*/
            if ( this.precisionIdx <= i ){
              if ( diff[i] <= 0 ){
                diff[i - 1]--;
                switch ( i ){
                  case 1:
                    //bbn.fn.log('1-diff[1]', diff[1])
                    diff[1] = 11 + diff[1];
                    break;
                  case 2:
                    diff[2] = bbn.fn.daysInMonth(d) - diff[2];
                    break;
                  case 3:
                    diff[3] = 24 + diff[3];
                    break;
                  case 4:
                    //bbn.fn.log('diff before', diff[4])
                    diff[4] = 60 + diff[4];
                    //bbn.fn.log('diff before', diff[4])
                    break;
                  case 5:
                    //because of diff[5] is a negative number
                    diff[5] = 60 + diff[5];
                    break;
                  case 6:
                    diff[6] = 1000 + diff[6];

                    break;
                }
              }
            }
            if ( this.scaleIdx > i ){
              switch ( i ){
                case 0:
                //  bbn.fn.log('2-diff[1]-before', diff[1], diff[0])
                  diff[1] += 12 * diff[i];
                //  bbn.fn.log('2-diff[1]-after', diff[1], diff[0])
                  break;
                case 1:
                  diff[2] += 12 * diff[i];
                  break;
                case 2:
                  diff[3] += 30 * diff[i];
                  break;
                case 3:
                  diff[4] += 24 * diff[i];
                  break;
                case 4:
                  diff[5] += 60 * diff[i];
                  break;
                case 5:
                  diff[6] += 60 * diff[i];
                  break;
              }
              diff[i] = 0;
              }
            else {
              switch ( i ){
                case 1:
                  //bbn.fn.log('mesi',diff[i])
                  if (( diff[i + 1] < 0  ) &&  ( diff[i] <= 1)){
                    diff[i] = 0;
                  }
                  else {
                    //diff[i] --
                    //bbn.fn.log('diff else month', diff[i], diff )
                    //diff[i] = 24 + diff[i];
                  }
                  break;

                  case 2:
                    //bbn.fn.log('days before', diff[i])
                  if (( diff[i + 1] < 0  ) &&  ( diff[i] === 1)){
                    //bbn.fn.log('diff if days', diff[i], diff )
                    diff[i] = 0;
                  }
                  else if ( ( diff[i] <  0) && ( diff[i + 1] < 0  ) ) {
                   // bbn.fn.log('days',diff[i], diff)
                    diff[i] = bbn.fn.daysInMonth(d) + diff[i] -1

                    //bbn.fn.log('diff else days',diff[i], bbn.fn.daysInMonth(d))
                  }
                  else if ( ( diff[i] > 0 ) && ( diff[i + 1] === 0 ) ) {
                    //bbn.fn.log('this is the case', diff[i], diff)
                    diff[i] = diff[i] - 1;
                    //bbn.fn.log(diff[i])
                  }
                  else if ( diff[i] < 0 ) {
                    diff[i] = bbn.fn.daysInMonth(d) + diff[i]
                  }
                  break;

                case 3:
                  //bbn.fn.log('diff hours', diff[3], diff)
                  // case precisionIdx > i
                  if (( diff[i + 1] < 0  ) &&  ( diff[i] <= 1)){
                    diff[i] = 0;
                  }
                  if (( diff[i + 1] < 0  ) &&  ( diff[i] === 0)){
                    diff[i] = 23;
                  }
                  else if ( ( diff[i + 1] <= 0  ) &&  ( diff[i] > 1) ){
                    diff[i]  = diff[i] --;
                  }
                  else if ( diff[i] <  0) {
                    diff[i] = 24 + diff[i];
                  }
                  else {
                    bbn.fn.log('hours exeption')
                  }
                  break;
                case 4:
                  if ( diff[i] < 0 ){
                    diff[i] = 60 - d.getMinutes() + this.targetMinute;
                  }

                  //bbn.fn.log('diff else', diff[3], this.targetHour - d.getHours())
                  break;

              }

              this[VALUES[i].name] = diff[i];
            }
          }

          this.$forceUpdate();
        }
      }
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
      alert('before destroy')
      if(this.interval){
        alert('interval')
        clearInterval(this.interval);
      }
    }
  });
})(bbn);
