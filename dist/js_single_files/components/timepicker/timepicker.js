((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<span :class="[componentClass, 'bbn-textbox', {'bbn-input-nullable': isNullable}]">
  <bbn-masked v-model="inputValue"
              ref="element"
              :disabled="isDisabled"
              :readonly="readonly"
              :required="required"
              :mask="currentMask"
              @hook:mounted="maskedMounted = true"
              @blur="inputChanged"
              @keydown.enter="inputChanged"
              class="bbn-flex-fill"
              :autosize="autosize"
              :inputmode="inputmode"
              :placeholder="placeholder"
  ></bbn-masked>
  <div v-if="isNullable && !readonly && !isDisabled"
        class="bbn-block bbn-h-100 bbn-input-nullable-container"
  >
    <i v-if="hasValue" class="nf nf-fa-times_circle bbn-p"
        @mousedown.prevent.stop="clear"
    ></i>
  </div>
  <bbn-button icon="nf nf-fa-clock_o"
              @click="isOpened = !isOpened"
              :disabled="isDisabled || readonly"
              tabindex="-1"
              class="bbn-button-right bbn-no-vborder"
  ></bbn-button>
  <bbn-floater v-if="isOpened && !isDisabled && !readonly"
               :element="$el"
               ref="floater"
               @close="isOpened = false"
               :scrollable="true"
               hpos="right"
               :auto-hide="1000"
               :element-width="false"
               max-width="15em"
  >
    <timepicker inline-template
                ref="timepicker"
                @change="setValue"
    >
      <div v-if="comp.scrollMode"
           style="width: auto; height: auto"
           class="bbn-overlay"
      >
        <bbn-splitter orientation="horizontal">
          <bbn-pane class="bbn-c bbn-border-color" style="border-right: 1px solid">
            <div class="bbn-flex-height">
              <div v-text="_('Hour').substr(0,1)"
                  title="_('Hour')"
                  class="bbn-unselectable bbn-header bbn-no-hborder bbn-no-border-top"
              ></div>
              <div class="bbn-flex-fill">
                <bbn-scroll :hidden="true"
                            ref="hourScroll"
                            @hook:mounted="hourReady = true"
                >
                  <div v-for="h in hours"
                      :class="['bbn-p', 'bbn-text', 'bbn-vspadded', 'bbn-background-internal', {
                        'bbn-bordered-bottom': h.value !== 23,
                        'bbn-primary': hour === h.value
                      }]"
                      @click="setHour(h.value)"
                      :ref="hour === h.value ? 'hourActive' : undefined"
                  >
                    <strong v-text="h.text"
                            style="opacity: .5"
                    ></strong>
                  </div>
                </bbn-scroll>
              </div>
            </div>
          </bbn-pane>
          <bbn-pane class="bbn-c">
            <div class="bbn-flex-height">
              <div v-text="_('Minute').substr(0,1)"
                  title="_('Minute')"
                  class="bbn-unselectable bbn-header bbn-no-border-top bbn-no-hborder"
              ></div>
              <div class="bbn-flex-fill">
                <bbn-scroll :hidden="true"
                            ref="minuteScroll"
                            @hook:mounted="minuteReady = true"
                >
                  <div v-for="m in minsec"
                      :class="['bbn-p', 'bbn-text', 'bbn-vspadded', 'bbn-background-internal', {
                        'bbn-bordered-bottom': m.value !== 59,
                        'bbn-primary': minute === m.value
                      }]"
                      @click="setMinute(m.value)"
                      :ref="minute === m.value ? 'minuteActive' : undefined"
                  >
                    <strong v-text="m.text"
                            style="opacity: .5"
                    ></strong>
                  </div>
                </bbn-scroll>
              </div>
            </div>
          </bbn-pane>
          <bbn-pane class="bbn-c bbn-border-color"
                    v-if="comp.showSecond"
                    style="border-left: 1px solid"
          >
            <div class="bbn-flex-height">
              <div v-text="_('Second').substr(0,1)"
                    title="_('Second')"
                    class="bbn-unselectable bbn-header bbn-no-hborder bbn-no-border-top"
              ></div>
              <div class="bbn-flex-fill">
                <bbn-scroll :hidden="true"
                            ref="secondScroll"
                            @hook:mounted="secondReady = true"
                >
                  <div v-for="s in minsec"
                      :class="['bbn-p', 'bbn-text', 'bbn-vspadded', 'bbn-background-internal', {
                        'bbn-bordered-bottom': s.value !== 59,
                        'bbn-primary': second === s.value
                      }]"
                      @click="setSecond(s.value)"
                      :ref="second === s.value ? 'secondActive' : undefined"
                  >
                    <strong v-text="s.text"
                            style="opacity: .5"
                    ></strong>
                  </div>
                </bbn-scroll>
              </div>
            </div>
          </bbn-pane>
        </bbn-splitter>
      </div>
      <div v-else-if="comp.dropdownMode"
           class="bbn-c"
      >
        <div class="bbn-iblock">
          <div v-text="_('Hour').substr(0,1)"
               title="_('Hour')"
               class="bbn-unselectable bbn-header"
          ></div>
          <bbn-dropdown :source="hours"
                        v-model="hour"
                        style="width: 60px"
          ></bbn-dropdown>
        </div>
        <div class="bbn-iblock">
          <div v-text="_('Minute').substr(0,1)"
               title="_('Minute')"
               class="bbn-unselectable bbn-header"
          ></div>
          <bbn-dropdown :source="minsec"
                        v-model="minute"
                        style="width: 60px"
          ></bbn-dropdown>
        </div>
        <div class="bbn-iblock"
             v-if="comp.showSecond"
        >
          <div v-text="_('Second').substr(0,1)"
               title="_('Second')"
               class="bbn-unselectable bbn-header"
          ></div>
          <bbn-dropdown :source="minsec"
                        v-model="second"
                        style="width: 60px"
          ></bbn-dropdown>
        </div>
      </div>
      <div v-else-if="comp.blockMode"
           class="bbn-block bbn-background"
      >
        <div class="bbn-block">
          <div v-text="_('Hour').substr(0,1)"
               title="_('Hour')"
               class="bbn-unselectable bbn-header bbn-c bbn-no-border-top bbn-no-border-left bbn-no-border-right"
          ></div>
          <div class="bbn-c bbn-block">
            <div class="bbn-iblock" style="vertical-align: top;">
              <div v-for="n in 12"
                   :class="[
                     'bbn-hspadded',
                     'bbn-left-padded',
                     'bbn-vxxspadded',
                     'bbn-middle',
                     'bbn-unselectable',
                     'bbn-timepicker-timeblock',
                     'bbn-p',
                     {
                       'bbn-bordered-bottom': n !== 12,
                       'bbn-selected-background': hour === (n - 1),
                       'bbn-selected-text': hour === (n - 1)
                     }
                   ]"
                   @click="setHour(n - 1)"
              >
                <strong v-text="(n - 1).toString().length === 1 ? '0' + (n - 1) : (n - 1)"
                        style="opacity: .5"
                ></strong>
              </div>
            </div>
            <div class="bbn-iblock" style="vertical-align: top;">
              <div v-for="n in 12"
                   :class="[
                     'bbn-hspadded',
                     'bbn-right-padded',
                     'bbn-vxxspadded',
                     'bbn-bordered-left',
                     'bbn-middle',
                     'bbn-unselectable',
                     'bbn-timepicker-timeblock',
                     'bbn-p',
                     {
                       'bbn-bordered-bottom': n !== 12,
                       'bbn-selected-background': hour === n + 11,
                       'bbn-selected-text': hour === n + 11
                     }
                   ]"
                   @click="setHour(n + 11)"
              >
                <strong v-text="n + 11" style="opacity: .5"></strong>
              </div>
            </div>
          </div>
        </div>
        <div class="bbn-block bbn-bordered-left">
          <div v-text="_('Minute').substr(0,1)"
               title="_('Minute')"
               class="bbn-unselectable bbn-header bbn-c bbn-no-hborder bbn-no-border-top bbn-no-border-left"
          ></div>
          <div class="bbn-c bbn-block">
            <div class="bbn-block" style="vertical-align: top;">
              <div v-for="n in 12"
                   :class="[
                     'bbn-hpadded',
                     'bbn-vxxspadded',
                     'bbn-middle',
                     'bbn-unselectable',
                     'bbn-timepicker-timeblock',
                     'bbn-p',
                     {
                       'bbn-bordered-bottom': n !== 12,
                       'bbn-selected-background': minute === (n - 1) * 5,
                       'bbn-selected-text': minute === (n - 1) * 5
                     }
                   ]"
                   @click="setMinute((n - 1) * 5)"
              >
                <strong v-text="((n - 1) * 5).toString().length === 1 ? '0' + ((n - 1) * 5) : ((n - 1) * 5)"
                        style="opacity: .5"
                ></strong>
              </div>
            </div>
          </div>
        </div>
        <div v-if="comp.showSecond"
             class="bbn-block bbn-bordered-left">
          <div v-text="_('Second').substr(0,1)"
               title="_('Second')"
               class="bbn-unselectable bbn-header bbn-c bbn-no-border-right bbn-no-border-top bbn-no-border-left"
          ></div>
          <div class="bbn-c bbn-block">
            <div class="bbn-block" style="vertical-align: top;">
              <div v-for="n in 12"
                   :class="[
                     'bbn-hpadded',
                     'bbn-vxxspadded',
                     'bbn-middle',
                     'bbn-unselectable',
                     'bbn-timepicker-timeblock',
                     'bbn-p',
                     {
                       'bbn-bordered-bottom': n !== 12,
                       'bbn-selected-background': second === (n - 1) * 5,
                       'bbn-selected-text': second === (n - 1) * 5
                     }
                   ]"
                   @click="setSecond((n - 1) * 5)"
              >
                <strong v-text="((n - 1) * 5).toString().length === 1 ? '0' + ((n - 1) * 5) : ((n - 1) * 5)"
                         style="opacity: .5"
                ></strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </timepicker>
  </bbn-floater>
</span>
`;
script.setAttribute('id', 'bbn-tpl-component-timepicker');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

/**
 * @file bbn-timepicker component
 *
 * @description bbn-timepicker is a component that allowes the user to choose a time value.
 * This component allows the association of data in a bidirectional way and allows the users to choose a validation interval period and the format of the value entered.

 * @author Mirko Argentino
 *
 * @copyright BBN Solutions
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-timepicker', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
    props: {
      /**
       * The view mode.
       * @prop {String} ['scroll'] mode
       */
      mode: {
        type: String,
        default: 'scroll',
        validator: m => ['scroll', 'dropdown', 'block'].includes(m)
      },
      /**
       * The format of the time displayed.
       *
       * @prop {String} format
       */
      format: {
        type: String
      },
      /**
       * The format of the value.
       *
       * @prop {String|Function} valueFormat
       */
      valueFormat: {
        type: [String, Function]
      },
      /**
       * The mask for the time input.
       *
       * @prop {String} mask
       */
      mask: {
        type: String
      },
      /**
       * The maximum allowed value.
       *
       * @prop {String} max
       */
      max: {
        type: String
      },
      /**
       * The minimum allowed value.
       * @prop {String} min
       */
      min: {
        type: String
      },
      /**
       * Shows/hides the "seconds" selection.
       * @prop {Boolean} [false] showSecond
       */
      showSecond: {
        type: Boolean,
        default: false
      },
      /**
       * Set it to false if you dont' want to auto-resize the input's width based on its value (in characters).
       * @prop {Boolean} [true] autosize
       */
      autosize: {
        type: Boolean,
        default: true
      }
    },
    data(){
      return {
        /**
         * Shows/hides the floater.
         *
         * @data {Boolean} [false] isOpened
        */
        isOpened: false,
        /**
         * Indicates if the bbn-masked component is mounted.
         *
         * @data {Boolean} [false] maskedMounted
        */
        maskedMounted: false,
        /**
         * The current value displayed on the input.
         *
         * @data {String} [''] inputValue
        */
        inputValue: '',
        /**
         * The old value displayed in the input.
         *
         * @data {String} [''] oldInputvalue
         */
        oldInputValue: ''
      }
    },
    computed: {
      /**
       * The current mask for the time input.
       *
       * @computed currentMask
       * @return {String}
       */
      currentMask(){
        return this.mask || (this.showSecond ? '00:00:00' : '00:00');
      },
      /**
       * The current value format.
       *
       * @computed currentValueFormat
       * @return {String}
       */
      currentValueFormat(){
        return this.valueFormat || (this.showSecond ? 'HH:mm:ss' : 'HH:mm');
      },
      /**
       * The current format displayed on the input.
       *
       * @computed currentFormat
       * @return {String}
       */
      currentFormat(){
        return this.format || (this.showSecond ? 'HH:mm:ss' : 'HH:mm');
      },
      /**
       * True if the values of the inputValue and the oldInputValue properties are different.
       *
       * @computed intuValueChanged
       * @return {String}
       */
      inputValueChanged(){
        return this.inputValue !== this.oldInputValue;
      },
      scrollMode(){
        return this.mode === 'scroll';
      },
      dropdownMode(){
        return this.mode === 'dropdown';
      },
      blockMode(){
        return this.mode === 'block';
      }
    },
    methods: {
      /**
       * Gets the correct value format.
       *
       * @method getValueFormat
       * @param {String} val The value.
       * @return {String}
       */
      getValueFormat(val){
        return bbn.fn.isFunction(this.valueFormat) ? this.valueFormat(val) : this.currentValueFormat;
      },
      /**
       * Sets the value.
       *
       * @method setValue
       * @param {String} val The value.
       * @param {String} format 
       * @fires getValueFormat
       * @fires setInputValue
       * @fires emitInput
       * @emits input
      */
      setValue(val, format){
        if ( !format ){
          format = !!val ? this.getValueFormat(val.toString()) : false;
        }
        let value = !!format && !!val ? (dayjs(val.toString(), format).isValid() ? dayjs(val.toString(), format).format(format) : '') : '';
        if ( value ){
          if ( value && this.min && (value < this.min) ){
            value = this.min;
          }
          if ( value && this.max && (value > this.max) ){
            value = this.max;
          }
        }
        else if ( this.nullable ){
          value = null;
        }
        if ( value !== this.value ){
          this.emitInput(value);
          this.$emit('change', value);
        }
        else {
          this.setInputValue(value);
        }
        if ( !value ){
          this.inputValue = '';
          this.oldInputValue = '';
        }
        this.isOpened = false;
      },
      /**
       * Triggered when the value is changed by the input.
       *
       * @method change
       * @param {$event} event Original event.
       * @fires getValueFormat
       * @fires setValue
       * @emits change
      */
      inputChanged(){
        let mask = this.getRef('element'),
            newVal = mask.inputValue,
            value = !!newVal ? dayjs(newVal, this.currentFormat).format(this.getValueFormat(newVal)) : '';
        if ( mask.raw(newVal) !== this.oldInputValue ){
          if ( value && this.min && (value < this.min) ){
            value = this.min;
          }
          if ( value && this.max && (value > this.max) ){
            value = this.max;
          }
          this.setValue(value);
        }
      },
      /**
       * Sets the value of the input.
       * @method setInputValue
       * @param {String} newVal 
       * @fires getValueFormat
       * @fires setValue
       */
      setInputValue(newVal){
        if ( newVal ){
          let mask = this.getRef('element'),
              mom = dayjs(newVal.toString(), this.getValueFormat(newVal.toString()));
          this.inputValue = newVal && mask && mom.isValid() ?
            mask.raw(mom.format(this.currentFormat)) :
            '';
        }
        else {
          this.inputValue = '';
        }
        this.oldInputValue = this.inputValue;
      },
      /**
       * Clears the input.
       * @method clear
       */
      clear(){
        this.setValue('');
        this.$nextTick(() => {
          this.$set(this.getRef('element'), 'inputValue', '');
        })
      }
    },
    /**
     * Defines the locale set basing on the lang of the environment (bbn.env.lang).
     * @event beforeCreate
     */
    beforeCreate(){
      if ( bbn.env && bbn.env.lang && (bbn.env.lang !== dayjs.locale()) ){
        dayjs.locale(bbn.env.lang);
      }
    },
    /**
     * @event mounted
     * @fires setValue
     */
    mounted(){
      if ( this.value ){
        this.setValue(this.value);
      }
      this.ready = true;
    },
    watch: {
      /**
       * @watch min
       * @fires setValue
       */
      min(){
        this.setValue(this.value || '');
      },
      /**
       * @watch max
       * @fires setValue
       */
      max(){
        this.setValue(this.value || '');
      },
      /**
       * @watch valueFormat
       * @fires setValue
       */
      valueFormat(){
        this.setValue(this.value || '');
      },
      /**
       * @watch maskedMounted
       * @fires getValueFormat
       * @param {String} newVal
       */
      maskedMounted(newVal){
        if ( newVal ){
          this.setInputValue(this.value);
        }
      },
      /**
       * @watch value
       * @param {String} newVal
       * @fires getValueFormat
       * @fires updateCalendar
      */
      value(newVal){
        this.setInputValue(newVal);
      }
    },
    components: {
      /**
       * The internal component timepicker.
       * @component timepicker
       */
      timepicker: {
        name: 'timepicker',
        props: {
          /**
           * The value of timepicker
           * @prop {String} [''] value
           * @memberof timepicker
           */
          value: {
            type: String,
            default: ''
          }
        },
        data(){
          return {
            /**
             * The component bbn-timepicker.
             *
             * @data {Vue} comp
             * @memberof timepicker
             */
            comp: bbn.vue.closest(this, 'bbn-timepicker'),
            /**
             * The array used to make the minutes and the seconds.
             *
             * @data {Array} minsec
             * @memberof timepicker
             */
            minsec: Array.from({length: 60}, (v,i) => {
              return {
                text: i.toString().length === 1 ? '0' + i : i,
                value: i
              };
            }),
            /**
             * The current hour.
             *
             * @data {String|null} [null] hour
             * @memberof timepicker
             */
            hour: null,
            /**
             * The current minute.
             *
             * @data {String|null} [null] minute
             * @memberof timepicker
             */
            minute: null,
            /**
             * The current second.
             *
             * @data {String|null} [null] second
             * @memberof timepicker
             */
            second: null,
            /**
             * The hours scroll is ready.
             *
             * @data {Boolean} [false] hourReady
             * @memberof timepicker
             */
            hourReady: false,
            /**
             * The minutes scroll is ready.
             *
             * @data {Boolean} [false] minuteReady
             * @memberof timepicker
             */
            minuteReady: false,
            /**
             * The seconds scroll is ready.
             *
             * @data {Boolean} [false] secondReady
             * @memberof timepicker
             */
            secondReady: false,
            /**
             * The component is ready.
             *
             * @data {Boolean} [false] ready
             * @memberof timepicker
             */
            ready: false
          }
        },
        computed: {
          /**
           * The array used to make the hours.
           *
           * @computed hours
           * @memberof timepicker
           * @fires comp.getValueFormat
           * @return {Array}
           */
          hours(){
            if ( this.comp ){
              let min = this.comp.min ? dayjs(this.comp.min, this.comp.getValueFormat(this.comp.min)).format('HH') : false,
                  max = this.comp.max  ? dayjs(this.comp.max, this.comp.getValueFormat(this.comp.max)).format('HH') : false;
              return Array.from({length: 24}, (v,i) => {
                return {
                  text: i.toString().length === 1 ? '0' + i : i,
                  value: i
                };
              }).filter(v => {
                return !((min && (v.value < min)) || (max && (v.value > max)))
              })
            }
            return [];
          },
          /**
           * Checks if all scrolls are ready.
           *
           * @computed checkScroll
           * @memberof timepicker
           * @return {Boolean}
           */
          checkScroll(){
            return !!(
              this.comp &&
              this.comp.scrollMode &&
              this.hourReady &&
              this.minuteReady &&
              this.getRef('minuteActive') &&
              this.getRef('hourActive') &&
              this.comp.getRef('floater').ready &&
              (!this.comp.showSecond || (this.secondReady && this.getRef('secondActive')))
            );
          }
        },
        methods: {
          /**
           * Gets the current time value.
           *
           * @method getTime
           * @memberof timepicker
           * @returns {String}
           */
          getTime(){
            if (
              !bbn.fn.isNull(this.hour) &&
              !bbn.fn.isNull(this.minute) &&
              (!this.comp.showSecond || !bbn.fn.isNull(this.second) )
            ){
              let v = dayjs().minute(this.minute).hour(this.hour),
                  f = 'HH:mm';
              if ( this.comp.showSecond ){
                v.second(this.second);
                f += ':ss';
              }
              return v.format(f);
            }
            return '';
          },
          /**
           * Sets the current hour.
           *
           * @method setHour
           * @memberof timepicker
           * @param {Number} h The hour.
           * @emits change
           */
          setHour(h){
            this.hour = h;
            let time = this.getTime();
            if ( !!time ){
              this.$emit('change', time, 'HH:mm' + (this.comp.showSecond ? ':ss' : ''));
            }
          },
          /**
           * Sets the current minute.
           *
           * @method setMinute
           * @memberof timepicker
           * @param {Number} m The minute.
           * @emits change
           */
          setMinute(m){
            this.minute = m;
            let time = this.getTime();
            if ( !!time ){
              this.$emit('change', time, 'HH:mm' + (this.comp.showSecond ? ':ss' : ''));
            }
          },
          /**
           * Sets the current second.
           *
           * @method setSecond
           * @memberof timepicker
           * @param {Number} s The second.c
           * @emits change
           */
          setSecond(s){
            this.second = s;
            let time = this.getTime();
            if ( !!time ){
              this.$emit('change', time, 'HH:mm' + (this.comp.showSecond ? ':ss' : ''));
            }
          }
        },
        /**
         * @event beforeMount
         * @memberof timepicker
         * @fires comp.getValueFormat
         */
        beforeMount(){
          this.ready = false;
          if ( this.comp.value ){
            let format = this.comp.getValueFormat(this.comp.value),
                mom = format ? dayjs(this.comp.value, format) : false;
            this.hour = mom ? mom.hour() : null;
            this.minute = mom ? mom.minute() : null;
            this.second = mom && this.comp.showSecond ? mom.second() : null;
          }
        },
        /**
         * Sets the property ready of the component to true.
         * @event mounted
         * @memberof timepicker
         */
        mounted(){
          this.$nextTick(() => {
            this.ready = true;
          });
        },
        watch: {
          /**
           * @watch hour
           * @memberof timepicker
           * @fires setHour
          */
          hour(newVal, oldVal){
            if ( this.ready && (newVal !== oldVal) ){
              this.setHour(newVal);
            }
          },
          /**
           * @watch minute
           * @memberof timepicker
           * @fires setMinute
          */
          minute(newVal, oldVal){
            if ( this.ready && (newVal !== oldVal) ){
              this.setMinute(newVal);
            }
          },
          /**
           * @watch second
           * @memberof timepicker
           * @fires setSecond
          */
          second(newVal, oldVal){
            if ( this.ready && (newVal !== oldVal) && this.comp.showSecond ){
              this.setSecond(newVal);
            }
          },
          /**
           * Resizes the scroll.
           * @watch checkScroll
           * @memberof timepicker
          */
          checkScroll(newVal){
            if ( newVal ){
              this.$nextTick(() => {
                setTimeout(() => {
                  if ( !bbn.fn.isNull(this.hour) ){
                    this.getRef('hourScroll').onResize();
                    this.getRef('hourScroll').scrollTo(0, this.getRef('hourActive'));
                  }
                  if ( !bbn.fn.isNull(this.minute) ){
                    this.getRef('minuteScroll').onResize();
                    this.getRef('minuteScroll').scrollTo(0, this.getRef('minuteActive'));
                  }
                  if ( !bbn.fn.isNull(this.second) ){
                    this.getRef('secondScroll').onResize();
                    this.getRef('secondScroll').scrollTo(0, this.getRef('secondActive'));
                  }
                }, 300)
              })
            }
          }
        }
      }
    }
  });

})(bbn);


})(bbn);