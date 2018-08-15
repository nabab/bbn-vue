/**
 * Created by BBN on 13/02/2017.
 */
(function($, bbn){
  "use strict";
  let interval = null;
  Vue.component('bbn-countdown2', {
    mixins: [bbn.vue.basicComponent],
    props: {
      deadline: {
        type: String
      },
      end: {
        type: String
      },
      stop: {
        type: Boolean
      },
      interval: {
        type: String,
        default: 'seconds'
      }
    },
    data() {
      return {
        now: Math.trunc((new Date()).getTime() / 1000),
        date: null,
        diff: 0,
        data: null,
        milliseconds: 0,
        seconds: 0,
        minutes: 0,
        hours: 0,
        days: 0,
        months: 0,
        years: 0,
        setInterval: 1000

      }
    },
    created() {
      if (!this.deadline && !this.end) {
        throw new Error("Missing props 'deadline' or 'end'");
      }
      let endTime = this.deadline ? this.deadline : this.end;
      this.date = Date.parse(endTime);
      if (!this.date) {
        throw new Error("Invalid props value, correct the 'deadline' or 'end'");
      }
      interval = setInterval(() => {
        this.now = new Date().getTime()
      }, this.setInterval);
    },

    methods: {
      twoDigits(value) {
        if ( value.toString().length <= 1 ) {
          return '0'+ value.toString()
        }
        return value.toString()
      }
    },

    watch: {
      now(value){
        this.diff = this.date - this.now;
        if (this.diff <= 0 || this.stop) {
          this.diff = 0;
          // Remove interval
          clearInterval(interval);
        }
      },
      diff(val) {
        var d = new Date()
        if (val) {
          this.data = moment.duration(this.diff)._data;
          this.seconds = this.data['seconds'];
          this.minutes = this.data['minutes'];
          this.hours = this.data['hours'];
          this.days = this.data['days'];
          this.months = this.data['months'];
          this.years = this.data['years'];
          //this.milliseconds = moment.duration(this.diff).milliseconds()
        }
      },
      interval(val){
        if ( val === 'seconds'){
          this.setInterval = 1000
        }
        else if ( val === 'milliseconds' ){
          this.setInterval = 50
        }
      }
    },
    destroyed() {
      clearInterval(interval);
    }
  });
})(jQuery, bbn);
