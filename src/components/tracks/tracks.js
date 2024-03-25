/**
 * @file bbn-tracks component
 * @description bbn-tracks
 * @copyright BBN Solutions
 * @author BBN Solutions
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-tracks', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      startDatetime: {
        type: String
      },
      endDatetime: {
        type: String
      },
      minMovement: {
        type: Number,
        default: 1
      },
      maxMovement: {
        type: Number
      },
      step: {
        type: Number,
        default: 3600
      },
      events: {
        type: Array,
        default(){
          return []
        }
      }
    },
    data(){
      return {
        secPerPx: 120,
      }
    },
    computed: {
      currentStart(){
        return this.startDatetime || dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss');
      },
      currentEnd(){
        return this.endDatetime || dayjs().format('YYYY-MM-DD HH:mm:ss');
      },
      currentStartUnix(){
        return dayjs(this.currentStart).unix();
      },
      currentEndUnix(){
        return dayjs(this.currentEnd).unix();
      },
      cols(){
        let cols = [];
        if (!!this.currentEnd && !!this.currentStart) {
          let numCols = dayjs(this.currentEnd).diff(this.currentStart, 'second') / this.step;
          let c = dayjs(this.currentStart);
          for (let i = 0; i < numCols; i++) {
            cols.push({
              start: dayjs(c).add(i * this.step, 'second').format('YYYY-MM-DD HH:mm:ss'),
              end: dayjs(c).add((i + 1) * this.step, 'second').format('YYYY-MM-DD HH:mm:ss'),
              label: dayjs(c).add(i * this.step, 'second').format('HH:mm')
            });
          }
        }

        return cols;
      },
      numCols(){
        return this.cols.length;
      },
      gridStyle(){
        return {
          display: 'grid',
          'grid-template-columns': 'repeat(' + this.numCols + ', ' + (this.step / this.secPerPx) + 'px)',
          'grid-template-rows': '2.5rem max-content',
        };
      },
      currentEvents(){
        if (this.events.length) {
          return bbn.fn.map(
            bbn.fn.filter(this.events, e => {
              return !!e.start
                && !!e.end
                && (e.start < this.currentEnd)
                && (e.start >= this.currentStart);
            }),
            e => {
              return {
                start: dayjs(e.start).unix(),
                end: dayjs(e.end).unix(),
                left: (dayjs(e.start).unix() - this.currentStartUnix) / this.secPerPx + 'px',
                width: (dayjs(e.end).unix() - dayjs(e.start).unix()) / this.secPerPx + 'px',
                bgColor: "#"+((1<<24)*Math.random()|0).toString(16),
                data: e,
              }
            }
          );
        }

        return [];
      }
    },
    methods: {
      zoomIn(){
        this.secPerPx += 30;
      },
      zoomOut(){
        this.secPerPx -= 30;
        if (this.secPerPx <= 0) {
          this.secPerPx = 1;
        }
      },
    }
  });
})(bbn);