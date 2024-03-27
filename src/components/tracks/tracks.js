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
      tracks: {
        type: Array,
        default(){
          return []
        }
      }
    },
    data(){
      return {
        secPerPx: 30,
        currentTracks : []
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
      updateTracks(){
        this.currentTracks.splice(0);
        if (this.tracks.length) {
          let tmpTracks = bbn.fn.order(
            bbn.fn.filter(this.tracks, t => {
              return !!t.start
                && !!t.end
                && (t.start < this.currentEnd)
                && (t.start >= this.currentStart);
            }),
            'start',
            'asc'
          );
          bbn.fn.each(tmpTracks, (track, index) => {
            let color = "#"+((1<<24)*Math.random()|0).toString(16);
            let startUnix = dayjs(track.start).unix();
            let endUnix = dayjs(track.end).unix();
            let leftLocked = this.currentStartUnix > startUnix;
            let rightLocked = this.currentEndUnix < endUnix;
            let left = (leftLocked ? this.currentStartUnix : (startUnix - this.currentStartUnix)) / this.secPerPx;
            let maxLeft = 0;
            let maxRight = this.currentEndUnix / this.secPerPx;
            if (!!tmpTracks[index-1]) {
              maxLeft = (dayjs(tmpTracks[index-1].end).unix() - this.currentStartUnix) / this.secPerPx;
            }
            if (!!tmpTracks[index+1]) {
              maxRight = (dayjs(tmpTracks[index+1].start).unix() - this.currentStartUnix) / this.secPerPx;
            }
            this.currentTracks.push({
              index: index,
              start: startUnix,
              end: endUnix,
              left: left,
              width: (endUnix - startUnix) / this.secPerPx,
              maxLeft: maxLeft,
              maxRight: maxRight,
              leftLocked: leftLocked,
              rightLocked: rightLocked,
              bgColor: color,
              data: track,
            })
          });
        }
      },
    },
    created(){
      this.updateTracks();
    },
    watch: {
      currentStartUnix(){
        this.updateTracks();
      },
      currentEndUnix(){
        this.updateTracks();
      },
      step(){
        this.updateTracks();
      },
      tracks:{
        deep: true,
        handler(){
          this.updateTracks();
        }
      },
      secPerPx(){
        this.updateTracks();
      }
    },
    components: {
      track: {
        name: 'track',
        template: `
        <div class="bbn-tracks-track"
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
        data(){
          return {
            main: this.closest('bbn-tracks')
          }
        },
        methods: {
          onResize(event){
            bbn.fn.log('resize', event)
            if (event.detail.from === 'left') {
              if (!!this.source.leftLocked) {
                event.preventDefault();
                return;
              }

              bbn.fn.log('movement', event.detail.from + ' ' + event.detail.movement);
              let left = this.source.left - event.detail.movement;
              bbn.fn.log('currentLeft', this.source.left);
              bbn.fn.log('newLeft', left);
              if (left < this.source.maxLeft) {
                event.preventDefault();
                return;
              }

              this.source.left = left;
              let start = this.source.start - (event.detail.movement * this.main.secPerPx);
              bbn.fn.log('currentStart', this.source.start);
              bbn.fn.log('newStart', start);
            }
            else if (event.detail.from === 'right') {
              if (!!this.source.rightLocked) {
                event.preventDefault();
                return;
              }
            }

            this.source.width = (this.source.end - this.source.start) / this.main.secPerPx;
          }
        }
      }
    }
  });
})(bbn);