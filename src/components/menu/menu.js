/**
 * @file bbn-menu component
 * @description The bbn menu with a simple implementation shows a hierarchical list of elements grouped in boxes that when clicked perform an action defined by the user .
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 10/02/2017
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.list
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.list
    ],
    props: {
      /**
       * @prop {} orientation
       */
      orientation: {},
      /**
       * @prop {} direction
       */
      direction: {},
      /**
       * @prop {} opened
       */
      opened: {},
      /**
       * @prop {Number} [-1] selectedIndex
       */
      selectedIndex: {
        type: Number,
        default: -1
      },
      /**
       * @prop {} ['text'] sourceValue
       */
       sourceValue: {
        default: 'text'
      },
      /**
       * @prop {} ['url'] sourceUrl
       */
       sourceUrl: {
        default: 'url'
      },
      /**
       * @prop {String} ['items'] children
       */
      children: {
        type: String,
        default: 'items'
      }
    },
    data() {
      return {
        currentSelectedIndex: this.selectedIndex,
        overIdx: -1
      };
    },
    methods: {
      _enterLi(idx) {
        //bbn.fn.log("ENTER LI");
        if ((this.overIdx > -1) && (this.overIdx !== idx)) {
          this.overIdx = idx;
          this.getRef('li' + idx).focus();
        }
      },
      clickLi(idx, ev) {
        //bbn.fn.log("clickLi", idx, this.overIdx);
        if (this.filteredData[idx]) {
          if (this.filteredData[idx].data[this.children] && this.filteredData[idx].data[this.children].length) {
            this.overIdx = this.overIdx === idx ? -1 : idx;
          }
          else {
            this.select(this.filteredData[idx].data, idx, idx, ev);
          }
          this.currentSelectedIndex = idx;
        }
      },
      onKeyDown(idx, ev) {
        //bbn.fn.log(ev);
        let floater = this.getRef('floater');
        if (floater) {
          let list = floater.getRef('list');
          if (list) {
            list.keynav(ev);
          }
        }
        else if ((ev.key === ' ') || (ev.key === 'Enter')) {
          this.clickLi(idx, ev);
        }
      },
      onFocus(idx) {
        if (this.filteredData[this.overIdx] && this.filteredData[idx]) {
          this.overIdx = idx;
        }
      },
      onClose() {
        //getRef('li' + selectedElement).blur(); selectedElement = -1;
      },
      select(item, idx, idx2, ev) {
        if (this.selection) {
          let selected = this.currentSelected.includes(this.filteredData[idx].index);
          if (!this.multiple) {
            this.currentSelected.splice(0);
          }
          if (!selected) {
            this.currentSelected.push(this.filteredData[idx].index);
          }
          else if (!!this.multiple) {
            this.currentSelected.splice(this.currentSelected.indexOf(this.filteredData[idx].index), 1);
          }
        }
        if (this.sourceUrl && item[this.sourceUrl]) {
          bbn.fn.link(item.url);
        }

        this.$emit('select', item, idx, idx2, ev);
      }
      /*onDataLoaded(){         
        this.$emit('onDataLoaded', this);
      }*/
    },
    watch: {
      overIdx(nv, ov) {
        if (nv > -1) {
          let fl = this.getRef('floater');
          if (fl) {
            // Allows to downsize
            fl.fullResize();
          }
        }
      }
    },
    mounted() {
      this.ready = true;
    }
  };
