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
      }
    },
    data() {
      return {
        now: Math.trunc((new Date()).getTime() / 1000),
        date: null,
        diff: 0,
        month: null,
        days: null
      }
    },
    created() {
      if (!this.deadline && !this.end) {
        throw new Error("Missing props 'deadline' or 'end'");
      }
      let endTime = this.deadline ? this.deadline : this.end;
      this.date = Math.trunc(Date.parse(endTime.replace(/-/g, "/")) / 1000);
      if (!this.date) {
        throw new Error("Invalid props value, correct the 'deadline' or 'end'");
      }
      interval = setInterval(() => {
        this.now = Math.trunc((new Date()).getTime() / 1000);
      }, 1000);
    },
    computed: {
      seconds() {
        return Math.trunc(this.diff) % 60
      },
      minutes() {
        return Math.trunc(this.diff / 60) % 60
      },
      hours() {
        return Math.trunc(this.diff / 60 / 60) % 24
      },
      /*days() {
        return Math.trunc(this.diff / 60 / 60 / 24)
      },*/

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
      now(value) {
        this.diff = this.date - this.now;
        if(this.diff <= 0 || this.stop){
          this.diff = 0;
          // Remove interval
          clearInterval(interval);
        }
      },
      diff(val, oldVal){
        //this.days = Math.trunc(this.diff / 60 / 60 / 24);
        if ( Math.trunc(val / 60 / 60 / 24) > bbn.fn.daysInMonth(this.deadline)){
          this.days = Math.trunc(val / 60 / 60 / 24) - bbn.fn.daysInMonth(this.deadline);
          //this.months =
         // bbn.fn.log('watch',val)
        }
        else{
          this.days = Math.trunc(val / 60 / 60 / 24)
        }

      }
    },
    /*filters: {
      twoDigits(value) {
        if ( value.toString().length <= 1 ) {
          return '0'+ value.toString()
        }
        return value.toString()
      }
    },*/
    destroyed() {
      clearInterval(interval);
    }
  });
})(jQuery, bbn);
