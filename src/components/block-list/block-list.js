/**
 * @file bbn-combo component
 * @description The easy-to-implement bbn-combo component allows you to choose a single value from a user-supplied list or to write new.
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 10/02/2017.
 */
return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.list
     * @mixin bbn.wc.mixins.componentInside
     */
    mixins: [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.list,
      bbn.wc.mixins.componentInside
    ],
    props: {
      /**
       * Max Image Width
       *
       * @prop {Number} [''] imgWidth
       */
      imgWidth: {
        type: Number,
        default: 420
      },
      /**
       * The max columns number
       * @prop {Number} maxColumns
       */
      maxColumns: {
        type: Number
      }
    },
    data(){
      return {
        windowWidth: window.innerWidth
      }
    },
    computed: {
      /**
       * @computed rowCount
       * @returns {Number}
       */
      rowCount(){
        let res = Math.ceil(this.windowWidth / this.imgWidth);
        if (!!this.maxColumns
          && (this.maxColumns < res)
        ) {
          res = this.maxColumns;
        }
        return res;
      }
    },
    mounted(){
      this.ready = true;
      this.$nextTick(() => {
        window.addEventListener('resize', this.onResize);
      });
    },
    watch: {
      currentPage() {
        let sc = this.closest('bbn-scroll');
        while (sc && !sc.scrollable) {
          sc = sc.closest('bbn-scroll');
        }

        if (sc) {
          sc.scrollTo(0, this.$el.offsetTop, true);
        }
        else {
          let p = this.$el;
          while (p) {
            if (p.scrollHeight && p.clientHeight && p.scrollTop) {
              let pos = this.$el.offsetTop;
              p.scrollTop = pos;
              break;
            }
            else {
              p = p.parentNode;
            }
          }
        }
      }
    },
    methods: {
      onResize() {
        this.windowWidth = window.innerWidth;
      }
    }
  };
