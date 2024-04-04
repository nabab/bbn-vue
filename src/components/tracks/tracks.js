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
      filterable: {
        type: Boolean,
        default: true
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
      limit: {
        type: Number,
        default: 0
      }
    },
    data(){
      return {
        secPerPx: 30,
        currentStartDatetime: this.getStartDatetime(),
        currentEndDatetime: this.getEndDatetime(),
        currentFilters: this.getCurrentFilters(),
        isResizing: false
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
          'grid-template-columns': 'repeat(' + this.numCols + ', ' + (this.step / this.secPerPx) + 'px)',
          'grid-template-rows': '2.5rem auto',
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
      getPostData(){
        let d = {
          startDatetime: this.currentStartDatetime,
          endDatetime: this.currentEndDatetime
        };
        if (this.data) {
          d = bbn.fn.extend(true, {}, d, bbn.fn.isFunction(this.data) ? this.data(d) : this.data);
        }

        return d;
      },
      afterUpdate(){
        if (this.currentData.length) {
          bbn.fn.each(this.currentData, (item, index) => {
            let color = this.currentColors[index % this.currentColors.length];
            let startUnix = dayjs(item.data.start).unix();
            let endUnix = dayjs(item.data.end).unix();
            this.$set(item, 'start', startUnix);
            this.$set(item, 'end', endUnix);
            this.$set(item, 'bgColor', color.background);
            this.$set(item, 'fontColor', color.font);
            this.$set(item, 'title', item.data.title || '');
            if (((endUnix - startUnix) / 3) < this.secPerPx) {
              this.secPerPx = (endUnix - startUnix) / 3;
            }
          });
          this.secPerPx = this.secPerPx < 1 ? 1 : this.secPerPx;
          bbn.fn.each(this.currentData, (item, index) => {
            let leftLocked = this.currentStartUnix > item.start;
            let rightLocked = this.currentEndUnix < item.end;
            let left = (leftLocked ? this.currentStartUnix : (item.start - this.currentStartUnix)) / this.secPerPx;
            let maxLeft = 0;
            let maxRight = this.currentEndUnix / this.secPerPx;
            if (!!this.currentData[index-1]) {
              maxLeft = (this.currentData[index-1].end - this.currentStartUnix) / this.secPerPx;
            }

            if (!!this.currentData[index+1]) {
              maxRight = (this.currentData[index+1].start - this.currentStartUnix) / this.secPerPx;
            }

            this.$set(item, 'left', left);
            this.$set(item, 'width', ((!!rightLocked ? this.currentEndUnix : item.end) - (!!leftLocked ? this.currentStartUnix : item.start)) / this.secPerPx);
            this.$set(item, 'maxLeft', maxLeft);
            this.$set(item, 'maxRight', maxRight);
            this.$set(item, 'leftLocked', leftLocked);
            this.$set(item, 'rightLocked', rightLocked);
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
      scrollToFirstItem(){
        this.$nextTick(() => {
          setTimeout(() => {
            if (!!this.filteredData.length) {
              let item = !!this.uid ? this.filteredData[0].data[this.uid] : this.filteredData[0].key;
              this.scrollTo(item);
            }
          }, 300);
        });
      },
      scrollTo(item){
        let itemRef = this.getRef('item-' + item);
        if (itemRef) {
          this.getRef('scroll').scrollTo(itemRef);
        }
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
                 class="bbn-tracks-item-resizing-times bbn-alt-background bbn-alt-text bbn-spadded bbn-radius">
              <div class="bbn-vmiddle bbn-no-wrap">
                <i class="nf nf-md-calendar_start bbn-right-sspace bbn-lg"/>
                <span v-text="currentStart"/>
              </div>
              <div class="bbn-vmiddle bbn-no-wrap bbn-top-sspace">
                <i class="nf nf-md-calendar_end bbn-right-sspace bbn-lg"/>
                <span v-text="currentEnd"/>
              </div>
            </div>
            <div v-else-if="isMouseOver && !main.isResizing"
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
            isMouseOver: false,
            originalSource: bbn.fn.clone(this.source)
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
            if (!this.isEditable || this.main.isResizing) {
              event.preventDefault();
              return;
            }

            this.originalSource = bbn.fn.clone(this.source);
            this.isResizing = true;
          },
          onResize(event){
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
            this.source.data.start = dayjs.unix(this.source.start).format('YYYY-MM-DD HH:mm:ss');
            this.source.data.end = dayjs.unix(this.source.end).format('YYYY-MM-DD HH:mm:ss');
          },
          onResizeEnd(event){
            if (!this.isEditable) {
              event.preventDefault();
              return;
            }

            this.isResizing = false;
            if (!bbn.fn.isSame(this.source, this.originalSource)) {
              this.main.$emit('edit', this.source.data);
            }
          },
          edit(event){
            if (this.isEditable
              && !this.isResizing
              && !this.main.isResizing
              && !event.defaultPrevented
              && !event.target._bbn.directives.resizable.resizing
            ) {
              if (!!this.main.editedRow) {
                this.main.editedRow = false;
              }

              this.$nextTick(() => {
                this.main.edit(this.source.data, {
                  title: bbn._('Edit'),
                  component: !this.main.editor ? this.main.$options.components.popupEditor : undefined,
                  minWidth: 500
                }, this.source.index);
              });
            }
          }
        },
        watch: {
          isResizing(newVal){
            this.main.isResizing = newVal;
          }
        }
      },
      popupEditor: {
        template: `
          <bbn-form :source="source.row"
                    :data="source.data"
                    :action="main.url"
                    :scrollable="false"
                    @success="success"
                    @failure="failure"
                    @cancel="cancel"
                    ref="form">
            <div class="bbn-padded bbn-grid-fields">
              <span class="bbn-label">` + bbn._('Start') + `</span>
              <bbn-datetimepicker v-model="source.row.start"
                                  :show-second="true"
                                  required/>
              <span class="bbn-label">` + bbn._('End') + `</span>
              <bbn-datetimepicker v-model="source.row.end"
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
          success(d, e) {
            e.preventDefault();
            if (this.main.successEdit
              && bbn.fn.isFunction(this.main.successEdit)
              && this.main.successEdit(d)
            ) {
              this.main.getPopup().close();
              this.main.updateData();
            }
          },
          failure(d) {
            this.main.$emit('editFailure', d);
          },
          cancel() {
            if (this.main
              && bbn.fn.isFunction(this.main.cancel)
            ) {
              this.main.cancel();
            }
          }
        }
      },
      toolbarEditor: {
        template: `
          <bbn-form :source="source"
                    :data="getData()"
                    :action="main.url"
                    :scrollable="false"
                    @success="onSuccess"
                    @failure="onFailure"
                    @cancel="onCancel"
                    ref="form"
                    :buttons="[]"
                    @hook:mounted="setForm"
                    :validation="validation">
            <div class="bbn-hspadded bbn-bottom-spadded bbn-vmiddle bbn-flex-width"
                 style="gap: var(--space); align-items: flex-end">
              <div class="bbn-flex-fill bbn-flex-wrap bbn-vmiddle"
                   style="gap: var(--space); align-items: flex-end">
                <span>
                  <span class="bbn-toplabel">` + bbn._('Start') + `</span>
                  <bbn-datetimepicker v-model="source.start"
                                      :show-second="true"
                                      required/>
                </span>
                <span  class="bbn-toplabel">
                  <span class="bbn-left-space">` + bbn._('End') + `</span>
                  <bbn-datetimepicker v-model="source.end"
                                      :show-second="true"
                                      required/>
                </span>
                <div class="bbn-flex"
                     style="gap: var(--sspace)">
                  <bbn-button @click="save"
                              text="` + bbn._('Save') + `"
                              :notext="true"
                              icon="nf nf-fa-check_circle"
                              class="bbn-primary bbn-xl"
                              :disabled="!form || !form.canSubmit"/>
                  <bbn-button @click="cancel"
                              text="` + bbn._('Cancel') + `"
                              :notext="true"
                              icon="nf nf-fa-times_circle"
                              class="bbn-xl"/>
                </div>
              </div>
              <bbn-button @click="remove"
                          icon="nf nf-fa-trash"
                          class="bbn-bg-red bbn-white bbn-xl"
                          text="` + bbn._('Delete') + `"
                          :notext="true"/>
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
            main: this.closest('bbn-tracks'),
            form: false
          }
        },
        methods: {
          validation(){
            if (dayjs(this.source.end).unix() < dayjs(this.source.start).unix()) {
              this.alert(bbn._('The end date must be more recent than the start date'));
              return false;
            }
            return true;
          },
          setForm(){
            this.form = this.getRef('form');
          },
          getData(){
            return bbn.fn.isFunction(this.main.data) ? this.main.data() : this.main.data;
          },
          save(){
            if (this.form) {
              this.form.submit();
            }
          },
          cancel(){
            if (this.form) {
              this.form.cancel();
            }
          },
          remove(){
            this.confirm(bbn._('Are you sure you want to delete this item?'), () => {
              this.post(this.main.url, {
                action: 'delete',
                id: this.source.id
              }, d => {
                if (d.success) {
                  this.main.updateData();
                  this.main.editedRow = false;
                }
              });
            });
          },
          onSuccess(d, e) {
            e.preventDefault();
            if (this.main.successEdit
              && bbn.fn.isFunction(this.main.successEdit)
              && this.main.successEdit(d)
            ) {
              this.main.getPopup().close();
              this.main.updateData();
            }
          },
          onFailure(d) {
            this.main.$emit('editFailure', d);
          },
          onCancel() {
            if (this.main
              && bbn.fn.isFunction(this.main.cancel)
            ) {
              this.main.cancel();
            }
          }
        }
      }
    }
  });
})(bbn);