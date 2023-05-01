/**
 * @file bbn-icon component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 */
return {
    name: 'bbn-flag',
    /**
     * @mixin bbn.wc.mixins.basic
     */
    mixins: [bbn.wc.mixins.basic],
    props: {
      value: {
        type: String,
        required: true
      },
      width: {
        type: [Number, String]
      },
      height: {
        type: [Number, String]
      },
      square: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        dimensions: {
          xs: 16,
          s: 24,
          m: 32,
          l: 48,
          xl: 64,
          xxl: 128,
          xxxl: 256
        }
      }
    },
    computed: {
      currentFlag(){
        let code = this.value;
        if (code === 'en') {
          code = 'gb';
        }
        let st = 'flag-icon flag-icon-' + code;
        if (this.square) {
          st += ' flag-icon-squared';
        }

        return st;
      },
      currentWidth(){
        if (this.width) {
          if (bbn.fn.isNumber(this.width)) {
            return this.width + 'px';
          }

          if (this.dimensions[this.width]) {
            return this.dimensions[this.width] + 'px';
          }

          return this.width;
        }

        if (this.square && this.height) {
          return this.currentHeight;
        }

        if (this.height) {
          return 'auto';
        }

        return this.dimensions.m + 'px';
      },
      currentHeight(){
        if (this.height) {
          if (bbn.fn.isNumber(this.height)) {
            return this.height + 'px';
          }

          if (this.dimensions[this.height]) {
            return this.dimensions[this.height] + 'px';
          }

          return this.height;
        }

        if (this.square) {
          return this.currentWidth;
        }

        return 'auto';
      }
    }
  };
