/**
 * @file bbn-dropdown component
 *
 * @description The easy-to-implement bbn-dropdown component allows you to choose a single value from a user-supplied list.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 10/02/2017.
 */


return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.events
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.resizer
     * @mixin bbn.wc.mixins.list
     * @mixin bbn.wc.mixins.keynav
     * @mixin bbn.wc.mixins.url
     * @mixin bbn.wc.mixins.dropdown
     * @mixin bbn.wc.mixins.localStorage
      */
    mixins: 
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.events,
      bbn.wc.mixins.input,
      bbn.wc.mixins.resizer,
      bbn.wc.mixins.list,
      bbn.wc.mixins.keynav,
      bbn.wc.mixins.url,
      bbn.wc.mixins.dropdown,
      bbn.wc.mixins.localStorage
    ],
    props: {
      /**
       * @prop {Boolean} [false] notext
       */
      notext: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        startingTmpValue: '',
        startingTmpTimeout: null      
      };
    },
    /**
     * The current icon.
     *
     * @computed currentIcon
     * @return {String}
    */
    beforeMount() {
      if (this.hasStorage) {
        let v = this.getStorage();
        if (v && (v !== this.value)) {
          this.emitInput(v);
        }
      }
    },
    methods: {
      /**
       * States the role of the enter key on the dropdown menu.
       *
       * @method keydown
       * @param {Event} e
       * @fires widget.select
       * @fires widget.open
       * @fires commonKeydown
       * @fires resetDropdown
       * @fires keynav
       */
      keydown(e){
        if ( this.commonKeydown(e) ){
          return;
        }
        else if (this.isOpened && (e.key === 'Escape')) {
          e.stopPropagation();
          e.preventDefault();
          this.resetDropdown();
        }
        else if (bbn.var.keys.dels.includes(e.which) && !this.filterString) {
          e.preventDefault();
          this.resetDropdown();
        }
        else if (bbn.var.keys.upDown.includes(e.keyCode)) {
          e.preventDefault();
          this.keynav(e);
        }
        else if (!this.isSearching && (e.key === ' ')) {
          e.preventDefault();
          this.isOpened = !this.isOpened;
        }
        else if (this.isOpened && (e.key === 'Enter')) {
          e.preventDefault();
          this.selectOver();
        }
      },
      paste(){
        alert("PASTE");
      },
      keyup(e) {
        if ( e.key.match(/^[A-z0-9\s]{1}$/)) {
          this.startingTmpValue += e.key;
          if (!this.isOpened) {
            this.isOpened = true;
          }
        }
      },
      selectOnNative(ev){
        if (!ev.defaultPrevented) {
          let idx = bbn.fn.search(this.filteredData, 'data.' + this.sourceValue, ev.target.value);
          if (idx > -1) {
            let item = this.filteredData[idx].data;
            if (this.sourceAction && item[this.sourceAction] && bbn.fn.isFunction(item[this.sourceAction])) {
              item[this.sourceAction](item);
            }
            else if ((this.sourceUrl !== undefined) && item[this.sourceUrl]) {
              bbn.fn.link(item[this.sourceUrl]);
            }
            else if (item[this.uid || this.sourceValue] !== undefined) {
              this.emitInput(item[this.uid || this.sourceValue]);
              this.$emit('change', item[this.uid || this.sourceValue], idx, this.filteredData[idx].index, ev);
              bbn.fn.log('yes', item[this.uid || this.sourceValue], idx, this.filteredData[idx].index, ev)
            }
          }
        }
        this.isOpened = false;
      }
    },
    /**
     * @event created
     */
    created(){
      this.$on('dataloaded', () => {
        if ((this.value !== undefined) && !this.currentText.length) {
          let row = bbn.fn.getRow(this.currentData, a => {
            return a.data[this.sourceValue] === this.value;
          });
          if ( row ){
            this.currentText = row.data[this.sourceText];
          }
        }
      })
    },
    beforeDestroy() {
      let fl = this.getRef('list');
      if (fl && fl.$el) {
        fl.$destroy();
        fl.$el.parentNode.removeChild(fl.$el);
      }
    },
    watch: {
      startingTmpValue(v) {
        if (v) {
          let fl = this.getRef('list');
          if (fl) {
            let lst = fl.getRef('list');
            if (lst) {
              bbn.fn.log("TEOUVE");
              lst.overByString(v);
            }
          }
          if (this.startingTmpTimeout) {
            clearTimeout(this.startingTmpTimeout);
          }
          this.startingTmpTimeout = setTimeout(() => {
            this.startingTmpValue = '';
          }, 1000)
        }
      },
     /**
      * @watch  isActive
      */
      isActive(v){
        if (!v && this.filterString) {
         this.currentText = this.currentTextValue || '';
        }
      },
      /**
       * @watch  isOpened
       */
      isOpened(val){
        if (this.popup && val && !this.native) {
          this.popupComponent.open({
            title: false,
            element: this.$el,
            maxHeight: this.maxHeight,
            minWidth: this.$el.clientWidth,
            autoHide: true,
            uid: this.sourceValue,
            itemComponent: this.realComponent,
            onSelect: this.select,
            position: 'bottom',
            suggest: true,
            modal: false,
            selected: [this.value],
            onClose: () => {
              this.isOpened = false;
            },
            source: this.filteredData.map(a => bbn.fn.extend({value: a.data.text}, a.data)),
            sourceAction: this.sourceAction,
            sourceText: this.sourceText,
            sourceValue: this.sourceValue
          });
        }

        if (!val && this.preload && !this.native) {
          this.getRef('list').currentVisible = true;
        }
      },
      /**
       * @watch  currentText
       */
      currentText(newVal){
        if (this.ready) {
          if (!newVal && this.value && this.isNullable){
            this.emitInput('');
            this.filterString = '';
          }
          else {
            this.filterString = newVal === this.currentTextValue ? '' : newVal;
          }
        }
      },
      /**
       * @watch  currentSelectValue
       */
       currentSelectValue(newVal){
        if (this.ready && (newVal !== this.value)) {
          this.emitInput(newVal);
        }
      },
      filterString(v){
        let args = [0, this.currentFilters.conditions.length ? 1 : 0];
        if (v && this.isActive) {
          args.push({
            field: this.sourceText,
            operator: 'startswith',
            value: v
          })
        }
        this.currentFilters.conditions.splice(...args);
      },
      value(v) {
        this.currentSelectValue = v;
        if (this.storage) {
          if (v) {
            this.setStorage(v);
          }
          else {
            this.unsetStorage()
          }
        }
      }
    }
  };
