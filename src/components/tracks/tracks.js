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
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.editableListComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent,
      bbn.vue.editableListComponent
    ],
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
      },
      sortable: {
        type: Boolean,
        default: true
      },
      order: {
        type: [Object, Array],
        default(){
          return [{
            field: 'start',
            dir: 'ASC'
          }];
        }
      },
      filterable: true
    },
    data(){
      return {
        secPerPx: 30,
        currentStartDatetime: this.getStartDatetime(),
        currentEndDatetime: this.getEndDatetime(),
        currentFilters: this.getCurrentFilters()
      }
    },
    computed: {
      currentStartUnix(){
        return dayjs(this.currentStartDatetime).unix();
      },
      currentEndUnix(){
        return dayjs(this.currentEndDatetime).unix();
      },
      currentStartTitle(){
        return dayjs(this.currentStartDatetime).format('DD/MM/YYYY HH:mm:ss');
      },
      currentEndTitle(){
        return dayjs(this.currentEndDatetime).format('DD/MM/YYYY HH:mm:ss');
      },
      cols(){
        let cols = [];
        if (!!this.currentEndDatetime && !!this.currentStartDatetime) {
          let numCols = dayjs(this.currentEndDatetime).diff(this.currentStartDatetime, 'second') / this.step;
          let c = dayjs(this.currentStartDatetime);
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
              c.background = bbn.fn.colorToHex(c.background);
            }

            if (!!c.background.toLowerCase().startsWith('rgb')) {
              c.background = bbn.fn.rgbToHex(c.background);
            }

            if (!c.font.startsWith('#')
              && !c.font.toLowerCase().startsWith('rgb')
            ){
              c.font = bbn.fn.colorToHex(c.font);
            }

            if (!!c.background.toLowerCase().startsWith('rgb')) {
              c.font = bbn.fn.rgbToHex(c.font);
            }

            return c;
          }
        );
			}
    },
    methods: {
      getStartDatetime(){
        return this.startDatetime || dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss');
      },
      getEndDatetime(){
        return this.endDatetime || dayjs().format('YYYY-MM-DD HH:mm:ss');
      },
      getCurrentFilters(){
        return {
          logic: 'AND',
          conditions: [{
            field: 'start',
            operator: 'isnotnull'
          }, {
            field: 'end',
            operator: 'isnotnull'
          }, {
            field: 'start',
            operator: '<',
            value: this.getEndDatetime()
          }, {
            field: 'end',
            operator: '>',
            value: this.getStartDatetime()
          }, {
            logic: 'OR',
            conditions: [{
              field: 'start',
              operator: '>=',
              value: this.getStartDatetime()
            }, {
              field: 'end',
              operator: '<=',
              value: this.getEndDatetime()
            }]
          }, bbn.fn.clone(this.filters)]
        };
      },
      _map(data){
        if (bbn.fn.isArray(data)) {
          data = bbn.fn.multiorder(data, this.order);
          return (this.map ? data.map(this.map) : data).slice();
        }

        return [];
      },
      zoomIn(){
        this.secPerPx = this.secPerPx > 2 ? (this.secPerPx - 2) : (this.secPerPx === 2 ? 1 : 2);
      },
      zoomOut(){
        this.secPerPx += this.secPerPx === 1 ? 1 : 2;
      },
     afterUpdate(){
        if (this.currentData.length) {
          this.secPerPx = this.calcSecPerPx();
          bbn.fn.each(this.currentData, (item, index) => {
            let color = this.currentColors[index % this.currentColors.length];
            let startUnix = dayjs(item.data.start).unix();
            let endUnix = dayjs(item.data.end).unix();
            let leftLocked = this.currentStartUnix > startUnix;
            let rightLocked = this.currentEndUnix < endUnix;
            let left = (leftLocked ? this.currentStartUnix : (startUnix - this.currentStartUnix)) / this.secPerPx;
            let maxLeft = 0;
            let maxRight = this.currentEndUnix / this.secPerPx;
            if (!!this.currentData[index-1]) {
              maxLeft = (dayjs(this.currentData[index-1].data.end).unix() - this.currentStartUnix) / this.secPerPx;
            }

            if (!!this.currentData[index+1]) {
              maxRight = (dayjs(this.currentData[index+1].data.start).unix() - this.currentStartUnix) / this.secPerPx;
            }

            this.$set(item, 'start', startUnix);
            this.$set(item, 'end', endUnix);
            this.$set(item, 'left', left);
            this.$set(item, 'width', ((!!rightLocked ? this.currentEndUnix : endUnix) - (!!leftLocked ? this.currentStartUnix : startUnix)) / this.secPerPx);
            this.$set(item, 'maxLeft', maxLeft);
            this.$set(item, 'maxRight', maxRight);
            this.$set(item, 'leftLocked', leftLocked);
            this.$set(item, 'rightLocked', rightLocked);
            this.$set(item, 'bgColor', color.background);
            this.$set(item, 'fontColor', color.font);
            this.$set(item, 'title', item.data.title || '');
          });
        }
      },
      updateItemMax(index){
        if (!!this.currentData[index]) {
          let maxLeft = 0;
          let maxRight = this.currentEndUnix / this.secPerPx;
          if (!!this.currentData[index-1]) {
            maxLeft = (this.currentData[index-1].end - this.currentStartUnix) / this.secPerPx;
          }

          if (!!this.currentData[index+1]) {
            maxRight = (this.currentData[index+1].start - this.currentStartUnix) / this.secPerPx;
          }

          this.currentData[index].maxLeft = maxLeft;
          this.currentData[index].maxRight = maxRight;
        }
      },
      calcSecPerPx(){
        let secPerPx = this.secPerPx;
        bbn.fn.each(this.currentData, item => {
          let startUnix = bbn.fn.isSQLDate(item.start) ?
            dayjs(item.start).unix() :
            item.start;
          let endUnix = bbn.fn.isSQLDate(item.end) ?
            dayjs(item.end).unix() :
            item.end;
            if ((endUnix - startUnix) < secPerPx) {
              secPerPx = endUnix - startUnix;
            }
        });
        return secPerPx
      },
      scrollToFirstItem(){
        this.$nextTick(() => {
          setTimeout(() => {
            if (!!this.filteredData.length) {
              let firstItem = this.getRef('item-' + this.filteredData[0].key);
              if (firstItem) {
                this.getRef('scroll').scrollTo(firstItem);
              }
            }
          }, 300);
        });
      }
    },
    created(){
      this.updateData(true);
    },
    mounted(){
      this.ready = true;
    },
    watch: {
      currentStartUnix(){
        this.startDatetime = this.getStartDatetime();
        this.currentFilters = this.getCurrentFilters();
        this.updateData();
      },
      currentEndUnix(){
        this.endDatetime = this.getEndDatetime();
        this.currentFilters = this.getCurrentFilters();
        this.updateData();
      },
      step(){
        this.updateData();
      },
      secPerPx(){
        if (!this.isLoading) {
          this.updateData();
        }
      },
      filters: {
        deep: true,
        handler() {
          this.currentFilters = this.getCurrentFilters();
        }
      }
    },
    components: {
      item: {
        name: 'item',
        template: `
          <div class="bbn-tracks-item bbn-middle"
                :style="{
                  left: source.left + 'px',
                  width: source.width + 'px',
                  backgroundColor: currentBgColor
                }"
                v-resizable.left.right="isEditable"
                @userresizestart="onResizeStart"
                @userresize="onResize"
                @userresizeend="onResizeEnd"
                @mouseover="isMouseOver = true"
                @mouseleave="isMouseOver = false"
                @click="edit">
            <div v-if="isResizing"
                 class="bbn-tracks-item-resizing-times bbn-background bbn-text bbn-spadded bbn-radius">
              <div class="bbn-vmiddle bbn-no-wrap">
                <i class="nf nf-md-calendar_start bbn-right-sspace bbn-lg"/>
                <span v-text="currentStart"/>
              </div>
              <div class="bbn-vmiddle bbn-no-wrap bbn-top-sspace">
                <i class="nf nf-md-calendar_end bbn-right-sspace bbn-lg"/>
                <span v-text="currentEnd"/>
              </div>
            </div>
            <div v-else-if="isMouseOver"
                 class="bbn-tracks-item-overlay bbn-c bbn-alt-background bbn-alt-text bbn-spadded bbn-radius">
              <div v-if="source.title"
                   v-html="source.title"
                   class="bbn-bottom-sspace bbn-primary-text-alt"/>
              <div class="bbn-vmiddle bbn-no-wrap">
                <i class="nf nf-md-calendar_start bbn-right-sspace bbn-lg bbn-green"/>
                <span v-text="currentStart"/>
              </div>
              <div class="bbn-vmiddle bbn-no-wrap bbn-top-sspace">
                <i class="nf nf-md-calendar_end bbn-right-sspace bbn-lg bbn-red"/>
                <span v-text="currentEnd"/>
              </div>
            </div>
          </div>
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
            isMouseOver: false
          }
        },
        computed: {
          isEditable(){
            return !!this.main.editable;
          },
          currentStart(){
            return dayjs.unix(this.source.start).format('DD/MM/YYYY HH:mm:ss');
          },
          currentEnd(){
            return dayjs.unix(this.source.end).format('DD/MM/YYYY HH:mm:ss');
          },
          currentBgColor(){
            return !!this.isResizing ?
              this.source.bgColor + '66' :
              (this.isMouseOver ? this.source.bgColor + 'E6' : this.source.bgColor);
          }
        },
        methods: {
          onResizeStart(event){
            if (!this.isEditable) {
              event.preventDefault();
              return;
            }

            this.isResizing = true;
          },
          onResize(event){
            bbn.fn.log('resize', event)
            if (!this.isEditable) {
              event.preventDefault();
              return;
            }
            else if (event.detail.from === 'left') {
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
            this.main.updateItemMax(this.source.index - 1);
            this.main.updateItemMax(this.source.index + 1);
            this.main.$emit('edit', this.source);
          },
          onResizeEnd(event){
            if (!this.isEditable) {
              event.preventDefault();
              return;
            }

            this.isResizing = false;
          },
          edit(){
            if (this.isEditable){
              this.main.edit(this.source, {
                title: bbn._('Edit'),
                component: this.main.$options.components.form,
                minWidth: 500
              }, this.source.index);
            }
          }
        }
      },
      form: {
        template: `
          <bbn-form :source="source.row"
                    :data="source.data"
                    :action="main.url"
                    :scrollable="false"
                    @success="success"
                    ref="form">
            <div class="bbn-padded bbn-grid-fields">
              <span class="bbn-label">` + bbn._('Start') + `</span>
              <bbn-datetimepicker v-model="source.row.data.start"
                                  :show-second="true"
                                  required/>
              <span class="bbn-label">` + bbn._('End') + `</span>
              <bbn-datetimepicker v-model="source.row.data.end"
                                  :show-second="true"
                                  required/>
            </div>
          </bbn-form>
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
          success(d){
            this.main.updateData();
          }
        }
      }
    }
  });
})(bbn);