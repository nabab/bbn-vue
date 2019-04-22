/**
 * Created by BBN on 15/02/2017.
 */
(function(Vue, bbn, moment){
  "use strict";
  let randomIntRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  Vue.component('bbn-scheduler', {
    mixins: [bbn.vue.basicComponent],
    props: {
      month: {
        default: moment().month() + 1
      },
      year: {
        default: moment().year()
      },
      source: {
        type: [Array, Function, String],
        default(){
          return []
        }
      }
    },
    data() {
      let items = [];
      if ( bbn.fn.isFunction(this.source) ){
        items = this.source({month: this.month, year: this.year});
      }
      return {
        currentMonth: this.month,
        currentYear: this.year,
        loading: true,
        isAjax: typeof(this.source) === 'string',
        items: bbn.fn.isArray(this.source) ? this.source : items
      }
    },
    mounted() {
      if ( this.isAjax ){
        bbn.fn.post(this.source, {month: this.currentMonth + 1, year: this.currentYear}, (d) => {
          if ( d.success && d.data ){
            this.items = d.data;
            this.ready = true;
          }
        })
      }
      else{
        this.ready = true;
      }
    },
    computed: {
      startDate(){
        return moment().year(this.currentYear).month(this.currentMonth - 1).startOf('month')
      },
      endDate(){
        return this.startDate.clone().add(this.startDate.daysInMonth() - 1,'days')
      },
      monthName(){
        return moment().month(parseInt(this.currentMonth) - 1).format('MMMM')
      },
      days(){
        // We have our events but we need to split up multi-day events into individual occurances
        let start = null,
            end = null,
            span = 1,
            seriesEvents = [];
        for ( let event of this.items ){
          start = moment(event.startDateTime);
          end = moment(event.endDateTime);
          span = end.diff(start, 'days') + 1;

          event.parentId = event.id;
          if (span > 1) {
            event.firstInRange = true;
            event.lastInRange = false;

            for(let s = 1; s < span; s ++) {
              seriesEvents.push({
                id: 0,
                parentId: event.parentId,
                firstInRange: false,
                lastInRange: s === span-1,
                title: event.title,
                startDateTime:  start.clone().add(s, 'days').toISOString(),
                endDateTime: end.toISOString()
              })
            }
          } else {
            event.firstInRange = true;
            event.lastInRange = true;
          }
        }

        // Attempt to sort by time and event group bias
        // TODO: Remove or find a better solution
        let events = this.items.concat(seriesEvents).sort(function(a, b){
          let keyA = new Date(a.unix),
              keyB = new Date(b.unix),
              bias = a.id === 0 ? 1 : 0;

          if(keyA < keyB) return -1 + bias;
          if(keyA > keyB) return 1 + bias;
          return 0 + bias;
        });
        let m = () => moment().year(this.currentYear).month(this.currentMonth - 1).startOf('month'),
            daysInMonth = m().daysInMonth(),
            previousMonthDays = m().date(1).day(),
            offset = 0 - previousMonthDays,
            nextMonthDays = offset + (6 - m().date(daysInMonth).day()),
            total = daysInMonth + previousMonthDays + nextMonthDays,
            days = [];

        for (let i = offset; i < total; i++) {
          let current = m().add(i, 'd');
          days.push({
            outsideOfCurrentMonth: (i < 0 || i > daysInMonth  - 1) ? true : false,
            date: current,
            unix: current.valueOf(),
            weekday: current.format('dddd'),
            day: current.format('Do'),
            number: current.format('D'),
            month: current.format('MMMM'),
            year: current.format('YYYY'),
            events: events.filter((event) => {
              return current.isSame(event.startDateTime, 'day')
            })
          });
        }
        return days;
      }
    },
    methods: {
      eventObj(obj){
        return {
          id: obj.id || bbn.fn.randomInt(),
          title: obj.title || bbn._('Untitled event'),
          startDateTime:  obj.start || bbn.fn.date(),
          endDateTime: obj.end || bbn.fn.date().add(randomIntRange(1, 3 * 24), 'hours').toISOString()
        }

      },
      prev(){
        if ( this.currentMonth === 0 ){
          this.currentMonth = 11;
          this.currentYear--;
        }
        else{
          this.currentMonth--;
        }
      },
      next(){
        if ( this.currentMonth === 11 ){
          this.currentMonth = 0;
          this.currentYear++;
        }
        else{
          this.currentMonth++;
        }
      },
      randomClass(){
        return bbn.fn.pickValue(['bbn-green', 'bbn-blue', 'bbn-orange', 'bbn-teal'])
      }
    }
  })
})(Vue, bbn, moment);
