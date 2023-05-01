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
    name: 'bbn-icon',
    /**
     * @mixin bbn.wc.mixins.basic
     */
    mixins: [bbn.wc.mixins.basic],
    props: {
      content: {
        type: String
      },
      loading: {
        type: Boolean,
        default: false
      },
      width: {
        type: [String, Number]
      },
      height: {
        type: [String, Number]
      }
    },
    data(){
      return {
        currentContent: this.content || '',
        isLoading: this.loading || false,
        isNotFound: false
      }
    },
    computed: {
      currentStyle() {
        let o = {
          background: 'none'
        };
        let props = ['width', 'height'];
        bbn.fn.each(props, (p, i) => {
          if (this[p]) {
            o[p] = this[p];
            if (bbn.fn.isNumber(this[p])) {
              o[p] += 'px';
            }
            if (!this[props[i === 1 ? 0 : 1]]) {
              o[props[i === 1 ? 0 : 1]] = 'auto';
              o['max' + bbn.fn.correctCase(props[i === 1 ? 0 : 1])] = '100%';
            }
          }
        });
        if (!this.width && !this.height) {
          o.width = 'auto';
          o.height = 'auto';
          o.maxHeight = '100% !important';
          o.maxWidth = '100% !important';
          o.minWidth = '4rem';
        }

        return o;
      }
    }
  };
