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
      },
      /**
			 * A colors list for personalization.
			 * @prop {String|Array} color
			 */
      colors: {
        type: Array,
        default(){
          return [{
            background: bbn.var.colors.webblue,
            font: bbn.var.colors.white
          }, {
            background: bbn.var.colors.turquoise,
            font: bbn.var.colors.white
          }, {
            background: bbn.var.colors.orange,
            font: bbn.var.colors.white
          }, {
            background: bbn.var.colors.red,
            font: bbn.var.colors.white
          }, {
            background: bbn.var.colors.purple,
            font: bbn.var.colors.white
          }, {
            background: bbn.var.colors.yellow,
            font: bbn.var.colors.black
          }, {
            background: bbn.var.colors.pink,
            font: bbn.var.colors.black
          }, {
            background: bbn.var.colors.brown,
            font: bbn.var.colors.white
          }, {
            background: bbn.var.colors.grey,
            font: bbn.var.colors.white
          }, {
            background: bbn.var.colors.navy,
            font: bbn.var.colors.white
          }, {
            background: bbn.var.colors.olive,
            font: bbn.var.colors.white
          }, {
            background: bbn.var.colors.pastelorange,
            font: bbn.var.colors.black
          }, {
            background: bbn.var.colors.cyan,
            font: bbn.var.colors.black
          }, {
            background: bbn.var.colors.green,
            font: bbn.var.colors.black
          }, {
            background: bbn.var.colors.black,
            font: bbn.var.colors.white
          }, {
            background: bbn.var.colors.white,
            font: bbn.var.colors.black
          }]
        }
      }
    },
    data(){
      return {
        secPerPx: 30,
        currentTracks : [],
        isLoaded: false
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
      currentStartTitle(){
        return dayjs(this.currentStart).format('DD/MM/YYYY HH:mm:ss');
      },
      currentEndTitle(){
        return dayjs(this.currentEnd).format('DD/MM/YYYY HH:mm:ss');
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
          'grid-template-rows': '2.5rem',
        };
      },
      /**
			 * Sets the color property to the correct form.
			 * @computed colors
			 * @return {Array}
			 */
			currentColors(){
        return bbn.fn.map(
          bbn.fn.filter(
            bbn.fn.clone(this.colors),
            c => !!c.background && !!c.font
          ),
          c => {
            if (!c.background.startsWith('#')
              && !c.background.toLowerCase().startsWith('rgb')
            ){
              return c.background = bbn.fn.colorToHex(c.background);
            }

            if (!c.font.startsWith('#')
              && !c.font.toLowerCase().startsWith('rgb')
            ){
              return c.font = bbn.fn.colorToHex(c.font);
            }

            return c;
          }
        );
			},
    },
    methods: {
      zoomIn(){
        this.secPerPx = this.secPerPx > 2 ? (this.secPerPx - 2) : (this.secPerPx === 2 ? 1 : 2);
      },
      zoomOut(){
        this.secPerPx += this.secPerPx === 1 ? 1 : 2;
      },
      updateTracks(callScroll = false){
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
          if (!this.isLoaded) {
            this.secPerPx = this.calcSecPerPx(tmpTracks);
            this.isLoaded = true;
          }
          bbn.fn.each(tmpTracks, (track, index) => {
            let color = this.currentColors[index % this.currentColors.length];
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
              width: ((!!rightLocked ? this.currentEndUnix : endUnix) - (!!leftLocked ? this.currentStartUnix : startUnix)) / this.secPerPx,
              maxLeft: maxLeft,
              maxRight: maxRight,
              leftLocked: leftLocked,
              rightLocked: rightLocked,
              bgColor: color.background,
              fontColor: color.font,
              data: track,
              title: track.title || '',
            })
          });

          if (callScroll) {
            this.scrollToFirstTrack();
          }
        }
      },
      updateTrackMax(index){
        if (!!this.currentTracks[index]) {
          let maxLeft = 0;
          let maxRight = this.currentEndUnix / this.secPerPx;
          if (!!this.currentTracks[index-1]) {
            maxLeft = (this.currentTracks[index-1].end - this.currentStartUnix) / this.secPerPx;
          }

          if (!!this.currentTracks[index+1]) {
            maxRight = (this.currentTracks[index+1].start - this.currentStartUnix) / this.secPerPx;
          }

          this.currentTracks[index].maxLeft = maxLeft;
          this.currentTracks[index].maxRight = maxRight;
        }
      },
      calcSecPerPx(tracks){
        let secPerPx = this.secPerPx;
        bbn.fn.each(tracks, (track, index) => {
          let startUnix = bbn.fn.isSQLDate(track.start) ?
            dayjs(track.start).unix() :
            track.start;
          let endUnix = bbn.fn.isSQLDate(track.end) ?
            dayjs(track.end).unix() :
            track.end;
            if ((endUnix - startUnix) < secPerPx) {
              secPerPx = endUnix - startUnix;
            }
        });
        return secPerPx
      },
      scrollToFirstTrack(){
        bbn.fn.log('aaaa')
        this.$nextTick(() => {
          setTimeout(() => {
            if (!!this.currentTracks.length) {
              let firstTrack = this.getRef('track-0');
              if (firstTrack) {
                this.getRef('scroll').scrollTo(firstTrack);
              }
            }
          }, 300);
        });
      }
    },
    created(){
      this.updateTracks(true);
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
          this.updateTracks(true);
        }
      },
      secPerPx(){
        if (this.isLoaded) {
          this.updateTracks();
        }
      }
    },
    components: {
      track: {
        name: 'track',
        template: `
        <div class="bbn-tracks-track bbn-middle"
             :style="{
               position: 'absolute',
               left: source.left + 'px',
               width: source.width + 'px',
               backgroundColor: source.bgColor,
               opacity: isResizing ? 0.3 : 1
             }"
             v-resizable.left.right="true"
             @userresizestart="onResizeStart"
             @userresize="onResize"
             @userresizeend="onResizeEnd"/>
        `,
        props: {
          source: {
            type: Object,
            required: true
          }
        },
        data(){
          return {
            main: this.closest('bbn-tracks'),
            isResizing: false,
            currentCursor: ''
          }
        },
        methods: {
          onResizeStart(event){
            this.isResizing = true;
          },
          onResize(event){
            bbn.fn.log('resize', event)
            if (event.detail.from === 'left') {
              if (!!this.source.leftLocked) {
                event.preventDefault();
                return;
              }

              let left = this.source.left - event.detail.movement;
              let start = this.source.start - (event.detail.movement * this.main.secPerPx);
              if ((left < this.source.maxLeft)
                || (start < this.main.currentStartUnix)
              ) {
                event.preventDefault();
                return;
              }

              this.source.left = left;
              this.source.start = start;
            }
            else if (event.detail.from === 'right') {
              if (!!this.source.rightLocked) {
                event.preventDefault();
                return;
              }

              let right = this.source.left + this.source.width - event.detail.movement;
              let end = this.source.end - (event.detail.movement * this.main.secPerPx);
              if ((right > this.source.maxRight)
                || (end > this.main.currentEndUnix)
              ) {
                event.preventDefault();
                return;
              }

              this.source.end = end;
            }

            this.source.width = ((!!this.source.rightLocked ? this.main.currentEndUnix : this.source.end) - (!!this.source.leftLocked ? this.main.currentStartUnix : this.source.start)) / this.main.secPerPx;
            this.main.updateTrackMax(this.source.index - 1);
            this.main.updateTrackMax(this.source.index + 1);

          },
          onResizeEnd(event){
            this.isResizing = false;
          }
        }
      }
    }
  });
})(bbn);