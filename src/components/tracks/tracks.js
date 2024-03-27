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
        secPerPx: 30,
        currentEvents : []
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
      }
    },
    methods: {
      zoomIn(){
        this.secPerPx += 1;
      },
      zoomOut(){
        if (this.secPerPx > 1) {
          this.secPerPx -= 1;
        }
      },
      updateEvents(){
        let events = [];
        if (this.events.length) {
          let tmpEvents = bbn.fn.order(
            bbn.fn.filter(this.events, e => {
              return !!e.start
                && !!e.end
                && (e.start < this.currentEnd)
                && (e.start >= this.currentStart);
            }),
            'start',
            'asc'
          );
          bbn.fn.each(tmpEvents, (e, i) => {
            let color = "#"+((1<<24)*Math.random()|0).toString(16);
            let startUnix = dayjs(e.start).unix();
            let endUnix = dayjs(e.end).unix();
            let leftLocked = this.currentStartUnix > startUnix;
            let rightLocked = this.currentEndUnix < endUnix;
            let left = (leftLocked ? this.currentStartUnix : (startUnix - this.currentStartUnix)) / this.secPerPx;
            let maxLeft = 0;
            let maxRight = this.currentEndUnix / this.secPerPx;
            if (!!tmpEvents[i-1]) {
              maxLeft = (dayjs(tmpEvents[i-1].end).unix() - this.currentStartUnix) / this.secPerPx;
            }
            if (!!tmpEvents[i+1]) {
              maxRight = (dayjs(tmpEvents[i+1].start).unix() - this.currentStartUnix) / this.secPerPx;
            }
            events.push({
              start: startUnix,
              end: endUnix,
              left: left,
              width: (endUnix - startUnix) / this.secPerPx,
              maxLeft: maxLeft,
              maxRight: maxRight,
              leftLocked: true,
              rightLocked: rightLocked,
              bgColor: color,
              data: e,
            })
          });
        }

        this.currentEvents.splice(0, this.currentEvents.length, ...events);
      }
    },
    created(){
      this.updateEvents();
    },
    watch: {
      currentStartUnix(){
        this.updateEvents();
      },
      currentEndUnix(){
        this.updateEvents();
      },
      step(){
        this.updateEvents();
      },
      events(){
        this.updateEvents();
      },
      secPerPx(){
        this.updateEvents();
      }
    },
    components: {
      track: {
        name: 'track',
        template: `
        <div class="bbn-tracks-event"
             :style="{
               position: 'absolute',
               left: source.left + 'px',
               width: source.width + 'px',
               backgroundColor: source.bgColor
             }"
             v-resizable.left.right="true"
             @userresize="onResize"/>
        `,
        props: {
          source: {
            type: Object,
            required: true
          }
        },
        methods: {
          onResize(event){
            bbn.fn.log('resize', event)
            if (((event.detail.from === 'left')
                && !!this.source.leftLocked)
              || ((event.detail.from === 'right')
                && !!this.source.rightLocked)
            ) {
              event.preventDefault();
              return;
            }
          }
        }
      }
    }
  });
})(bbn);