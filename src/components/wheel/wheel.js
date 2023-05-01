/**
 * @file bbn-wheel component
 * @description bbn-wheel
 * @author Mirko Argentino
 * @copyright BBN Solutions
 */
 return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.list
     */
    mixins: [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.input,
      bbn.wc.mixins.list
    ],
    data(){
      return {
        /**
         * @data {Boolean} [false] scrollReady
         */
        scrollReady: false,
        /**
         * @data {HTMLElement} [undefined] barElement
         */
        barElement: null,
        /**
         * @data {Boolean} [false] isScrolling
         */
        isScrolling: false
      }
    },
    computed: {
      /**
       * @computed isReady
       */
      isReady(){
        return this.scrollReady && this.isLoaded;
      },
      /**
       * @computed upButtonDisabled
       * @fires isNull
       * @fires getIndexByValue
       * @return {Boolean}
       */
      upButtonDisabled(){
        if (this.isNull(this.value)) {
          return false;
        }
        let index = this.getIndexByValue(this.value),
            idx = bbn.fn.search(this.filteredData, 'index', index);
        if (idx > -1) {
          return !this.filteredData[idx - 1];
        }
      },
      /**
       * @computed downButtonDisabled
       * @fires isNull
       * @fires getIndexByValue
       * @return {Boolean}
       */
      downButtonDisabled(){
        if (this.isNull(this.value)) {
          return false;
        }
        let index = this.getIndexByValue(this.value),
            idx = bbn.fn.search(this.filteredData, 'index', index);
        if (idx > -1) {
          return !this.filteredData[idx + 1];
        }
      }
    },
    methods: {
      /**
       * Alias of bbn.fn.isNull
       * @method isNull
       */
      isNull: bbn.fn.isNull,
      /**
       * @method setValue
       * @param val
       * @fires isNull
       * @fires getScrollPosByVal
       * @fires scrollTo
       * @fires emitInput
       */
      setValue(val){
        if (!this.isNull(val) && (val !== this.value)) {
          let pos = this.getScrollPosByVal(val);
          if (pos !== false) {
            this.scrollTo(pos).then(() => {
              this.emitInput(val);
            });
          }
        }
        this.isScrolling = false;
      },
      /**
       * @method scrollTo
       * @param pos
       * @fires getRef
       * @return {Promise}
       */
      scrollTo(pos){
        return new Promise(resolve => {
          let scroll = this.getRef('scroll');
          scroll.scrollTo(0, pos).then(() => {
            setTimeout(() => {
              this.isScrolling = false;
              resolve();
            }, scroll.latency + 1);
          });
        });
      },
      /**
       * @method getScrollPosByVal
       * @param val
       * @fires getRefByValue
       * @fires getIndexByValue
       * @return {Number}
       */
      getScrollPosByVal(val){
        let r = this.getRefByValue(val),
            index = this.getIndexByValue(val),
            idx = bbn.fn.search(this.filteredData, 'index', index);
        if (r && (idx > -1)) {
          return r.clientHeight * idx;
        }
        return false;
      },
      /**
       * @method getIndexByValue
       * @param val
       * @return {Number}
       */
      getIndexByValue(val){
        let index = bbn.fn.getField(this.filteredData, 'index', {['data.' + this.sourceValue]: val});
        if (index !== undefined) {
          return index;
        }
        return false;
      },
      /**
       * @method getRefByValue
       * @param val
       * @fires getIndexByValue
       * @fires getRef
       * @return {Boolean|HTMLElement}
       */
      getRefByValue(val){
        let index = this.getIndexByValue(val);
        if (index !== false) {
          return this.getRef('v-' + index);
        }
        return false;
      },
      /**
       * @method onReady
       * @fires isNull
       * @fires getScrollPosByVal
       * @fires scrollTo
       */
      onReady(){
        setTimeout(() => {
          if (!this.isNull(this.value)) {
            let pos = this.getScrollPosByVal(this.value);
            if (pos !== false) {
              this.scrollTo(pos).then(() => {
                this.ready = true;
              });
            }
            else {
              this.ready = true;
            }
          }
          else {
            this.ready = true;
          }
        }, 300);
      },
      /**
       * @method onScroll
       * @fires getRef
       */
      onScroll(){
        if (this.ready) {
          let barElement = this.getRef('bar')
          this.barElement = barElement || null;
          this.isScrolling = true;
        }
      },
      /**
       * @method onAfterScroll
       * @fires getRef
       * @fires isNull
       * @fires setValue
       */
      onAfterScroll(){
        let contRect = this.getRef('container').getBoundingClientRect();
        let ele = document.elementFromPoint(contRect.x + (contRect.width / 2), contRect.y + (contRect.height / 2));
        if (ele && ele.hasAttribute('index')) {
          let index = parseInt(ele.getAttribute('index')),
              item = this.currentData[index];
          if (item && !this.isNull(item.data[this.sourceValue])) {
            this.setValue(item.data[this.sourceValue]);
          }
        }
        this.isScrolling = false;
      },
      /**
       * @method goUp
       * @fires isNull
       * @fires getIndexByValue
       * @fires setValue
       */
      goUp(){
        if (!this.isNull(this.value)) {
          let index = this.getIndexByValue(this.value),
              idx = bbn.fn.search(this.filteredData, 'index', index);
          if ((idx > -1) && !!this.filteredData[idx - 1]) {
            this.setValue(this.filteredData[idx - 1].data[this.sourceValue]);
          }
        }
      },
      /**
       * @method goDown
       * @fires isNull
       * @fires getIndexByValue
       * @fires setValue
       */
      goDown(){
        if (!this.isNull(this.value)) {
          let index = this.getIndexByValue(this.value),
              idx = bbn.fn.search(this.filteredData, 'index', index);
          if ((idx > -1) && !!this.filteredData[idx + 1]) {
            this.setValue(this.filteredData[idx + 1].data[this.sourceValue]);
          }
        }
      }
    },
    watch: {
      /**
       * @watch isReady
       * @param {Boolean} val
       * @fires onReady
       */
      isReady(val){
        if (val) {
          this.onReady();
        }
      }
    }
  };
  