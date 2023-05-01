/**
 * @file bbn-timewheel component
 * @description bbn-timewheel is a component that allowes the user to choose a time value.
 * @author Mirko Argentino
 * @copyright BBN Solutions
 */
 return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.list
     * @mixin bbn.wc.mixins.input
     */
    mixins: [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.list,
      bbn.wc.mixins.input
    ],
    props: {
      /**
       * @prop {String} ['HH:mm:ss'] format
       */
      format: {
        type: String,
        default: 'HH:mm:ss'
      },
      /**
       * @prop {Boolean} [true] showSecond
       */
      showSecond: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {String} min
       */
      min: {
        type: String
      },
      /**
       * @prop {String} max
       */
      max: {
        type: String
      },
      /**
       * @prop {Array|Boolean} ['cancel','submit'] buttons
       */
      buttons: {
        type: [Array, Boolean],
        default(){
          return ['cancel', 'submit']
        }
      }
    },
    data(){
      let d = this.value && this.value.length  ? dayjs(this.value, this.format) : dayjs();
      return {
        /**
         * The array used to make the minutes and the seconds.
         *
         * @data {Array} minsec
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
         */
        hour: d.hour(),
        /**
         * The current minute.
         *
         * @data {String|null} [null] minute
         */
        minute: d.minute(),
        /**
         * The current second.
         *
         * @data {String|null} [null] second
         */
        second: d.second(),
        /**
         * The hours scroll is ready.
         *
         * @data {Boolean} [false] hourReady
         */
        hourReady: false,
        /**
         * The minutes scroll is ready.
         *
         * @data {Boolean} [false] minuteReady
         */
        minuteReady: false,
        /**
         * The seconds scroll is ready.
         *
         * @data {Boolean} [false] secondReady
         */
        secondReady: false,
        /**
         * The component is ready.
         *
         * @data {Boolean} [false] ready
         */
        ready: false
      }
    },
    computed: {
      /**
       * The array used to make the hours.
       * @computed hours
       * @return {Array}
       */
      hours(){
        let res = Array.from({length: 24}, (v, i) => {
          return {
            text: i.toString().length === 1 ? '0' + i : i,
            value: i
          };
        }).filter(v => {
          return !((this.min && (v.value < this.min)) || (this.max && (v.value > this.max)))
        });
        return res;
      },
      /**
       * Checks if all timescroll components are ready.
       * @computed checkReady
       * @return {Boolean}
       */
      checkReady(){
        return this.hourReady
          && this.minuteReady
          && (!this.showSecond || this.secondReady);
      },
      /**
       * The current buttons config
       * @computed currentButtons
       * @return {Array}
       */
      currentButtons(){
        let res = [];
        if (this.buttons) {
          let def = {
            cancel: {
              title: bbn._('Cancel'),
              icon: 'nf nf-fa-close',
              cls: '',
              action: this.cancel
            },
            submit: {
              title: bbn._('Confirm'),
              icon: 'nf nf-fa-check',
              cls: 'bbn-primary',
              action: this.save
            }
          }
          bbn.fn.each(this.buttons, b => {
            if (bbn.fn.isString(b)) {
              if (def[b] !== undefined) {
                res.push(def[b]);
              }
            }
            else {
              let but = bbn.fn.extend(true, {}, b);
              if (bbn.fn.isString(b.action) && (def[b.action])) {
                but.action = def[b.action].action;
              }
              res.push(but);
            }
          })
        }
        return res;
      }
    },
    methods: {
      /**
       * Gets the current time value.
       * @method getTime
       * @returns {String}
       */
      getTime(){
        if (!bbn.fn.isNull(this.hour)
          && !bbn.fn.isNull(this.minute)
          && (!this.showSecond || !bbn.fn.isNull(this.second) )
        ){
          let v = !!this.value ? dayjs(this.value, this.format) : dayjs();
          v = dayjs(v).minute(this.minute).hour(this.hour);
          if (this.showSecond) {
            v = dayjs(v).second(this.second);
          }
          bbn.fn.log('aaa',v.format(this.format))
          return v.format(this.format);
        }
        return '';
      },
      /**
       * Sets the current hour.
       * @method setHour
       * @param {Number} h The hour.
       * @fires emitInput
       * @emits change
       */
      setHour(h){
        if (!bbn.fn.isNull(h)) {
          this.hour = h;
          let time = this.getTime();
          if (!!time && !this.buttons) {
            this.emitInput(time);
            this.$emit('change', time, this.format);
          }
        }
      },
      /**
       * Sets the current minute.
       * @method setMinute
       * @param {Number} m The minute.
       * @fires emitInput
       * @emits change
       */
      setMinute(m){
        if (!bbn.fn.isNull(m)) {
          this.minute = m;
          let time = this.getTime();
          if (!!time && !this.buttons) {
            this.emitInput(time);
            this.$emit('change', time, this.format);
          }
        }
      },
      /**
       * Sets the current second.
       * @method setSecond
       * @param {Number} s The second.
       * @fires emitInput
       * @emits change
       */
      setSecond(s){
        if (!bbn.fn.isNull(s)) {
          this.second = s;
          let time = this.getTime();
          if (!!time && !this.buttons) {
            this.emitInput(time);
            this.$emit('change', time, this.format);
          }
        }
      },
      /**
       * Emits cancel
       * @method camcel
       * @emits cancel
       */
      cancel(){
        this.$emit('cancel');
      },
      /**
       * Emits input
       * @method save
       * @fires emitInput
       * @emits change
       */
      save(){
        let time = this.getTime();
        if (!!time) {
          this.emitInput(time);
          this.$emit('change', time, this.format);
        }
      }
    },
    watch: {
      /**
       * @watch hour
       * @fires setHour
      */
      hour(newVal, oldVal){
        if ( this.ready && (newVal !== oldVal) ){
          this.setHour(newVal);
        }
      },
      /**
       * @watch minute
       * @fires setMinute
      */
      minute(newVal, oldVal){
        if ( this.ready && (newVal !== oldVal) ){
          this.setMinute(newVal);
        }
      },
      /**
       * @watch second
       * @fires setSecond
      */
      second(newVal, oldVal){
        if ( this.ready && (newVal !== oldVal) && this.showSecond ){
          this.setSecond(newVal);
        }
      },
      /**
       * @watch checkReady
       */
      checkReady(val){
        this.ready = val;
      }
    }
  };
