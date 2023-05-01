/**
 * @file bbn-panelbar component
 * @description bbn-panelbar is a component that configures itself easily, it allows to visualize the data in a hierarchical way expandable to levels.
 * It can contain texts, html elements and even Vue components, the latter can be inserted both on its content but also as a header.
 * Those who use this component have the possibility to see schematically their data with the maximum simplicity of interpretation.
 * @copyright BBN Solutions
 * @author Loredana Bruno
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.localStorage
     * @mixin bbn.wc.mixins.resizer
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.localStorage, 
      bbn.wc.mixins.resizer
    ],
    props: {
      /**
       * @prop {Boolean} [false] multiple
       */
      multiple: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Boolean} [false] flex
       */
      flex: {
        type: Boolean,
        default: false
      },
      /**
       * The source of the component. The object item has property:
       * - header // the title on the header
       * - headerComponent // a component on the header
       * - headerOptions // options relative to the component on the header
       * - content // the content html or text to show when the item is selected
       * - component // a component to show when the item is selected
       * - height // the height of the item's slot, it will overwrite the props itemsHeight for the item
       * - options // options of configuration of the component shown in the slot of the item
       * @prop {Array} items
       */
      source: {
        type: Array
      },
      /**
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {String} ['center'] align
       */
      align: {
        type: String,
        default: 'center'
      },
      /**
       * Specifies whether or not an index will be expanded
       * @prop {Number} opened
       */
      opened: {
        type: Number,
      },
      /**
       * The component to be rendered on each header if not specified for the single item in the source
       * @prop {String} headerComponent
       */
      headerComponent: {
        type: String
      },
      /**
       * The object of properties to bind with the headerComponent
       * @prop {Object} headerOptions
       */
      headerOptions: {
        type: Object
      },
      /**
       * The component to be rendered in each content slot if not specified for the single item in the source
       * @prop {String} component
       */
      component: {
        type: String
      },
      /**
       * The object of properties to bind with the component in the content slot
       * @prop {Object} componentOptions
       */
      componentOptions :{
        type: Object
      }
    },
    data(){
      return {
        selectedValues: [],
        /**
         * @data {Number} [null] size
         */
        size: null,
        /**
         * The index of the selected item
         * @data {Number} [null] selected
         */
        selected: null,
        /**
         * @data {Number} [null] preselected
         */
        preselected: null,
        /**
         * @data {Number} [0] childHeight
         */
        childHeight: 0
      };
    },
    computed:{
      /**
       * @computed headers
       */
      headers(){
        return this.$refs['header']
      }
    },
    methods: {
      isSelected(idx){
        if(!this.multiple){
          return this.selected === idx
        }
        else{
          return this.selectedValues.includes(idx)
        }
      },
      /**
       * @method onResize
       */
      onResize(){
        this.size = this.$el.clientHeight;
      },
      multiselect(idx){
        if(!this.selectedValues.includes(idx)){
          this.selectedValues.push(idx)
        }
        else{
          this.selectedValues.splice(this.selectedValues.indexOf(idx), 1)
        }
      },
     /**
       * Shows the content of selected items and emits the event select
       * @method select
       * @param {Number} idx
       * @emits select
       * @fires getStyle
       */
      select(idx){
        if ( this.selected !== idx ){
          this.preselected = idx;
          if (this.selected === null) {
            setTimeout(() => {
              this.selected = idx;
            }, 300);
          }
          else {
            this.selected = idx;
          }
          this.$emit('select', idx, this.source[idx])
          if ( !this.flex ){
            this.$nextTick(()=>{
              this.getStyle(idx)
            })
          }
        }
        else{
          this.preselected = null;
          this.selected = null;
        }
      },
      /**
       * @method getStyle
       * @param {Number} idx
       * @fires getRef
       * @return {Object}
       */
      getStyle(idx){
        if(!this.multiple){
          if (
            (idx !== null ) &&
            (idx === this.preselected) &&
            (this.flex || ((this.source[idx] !== undefined) && (this.source[idx].flex === true)))
          ){
            return this.size ? {height: this.size + 'px', overflow: 'hidden'} : {};
          }
          //if this.flex === false, case of panelbar containing a table or other content that has an height
          else if (
            (idx !== null ) &&
            (idx === this.preselected) &&
            (!this.flex || ( (this.source[idx] !== undefined) && (this.source[idx].flex === false)))
          ){
            let children = this.getRef('container').children,
                res = [],
                childHeight = 0;
            bbn.fn.each(children, a => {
              if ( a.classList.contains('bbn-border-box') ){
                res.push(a)
              }
            })
            this.$nextTick(()=>{
              if ( res[idx] && res[idx].firstElementChild.clientHeight ){
                this.childHeight = res[idx].firstElementChild.clientHeight
              }
              return this.size ? {height: this.childHeight + 'px', overflow: 'hidden'} : {};
            })
          }
          else{
            return {height: '0px', overflow: 'hidden'};
          }
        }
        else{
          if (
            this.selectedValues.includes(idx) &&
            (idx !== null ) &&
            (this.flex || ((this.source[idx] !== undefined) && (this.source[idx].flex === true)))
          ){
            return this.size ? {height: this.size + 'px', overflow: 'hidden'} : {};
          }
          //if this.flex === false, case of panelbar containing a table or other content that has an height
          else if (
            this.selectedValues.includes(idx) &&
            (idx !== null ) &&
            (!this.flex || ( (this.source[idx] !== undefined) && (this.source[idx].flex === false)))
          ){
            let children = this.getRef('container').children,
                res = [],
                childHeight = 0;
            bbn.fn.each(children, a => {
              if ( a.classList.contains('bbn-border-box') ){
                res.push(a)
              }
            })
            this.$nextTick(()=>{
              if ( res[idx] && res[idx].firstElementChild.clientHeight ){
                this.childHeight = res[idx].firstElementChild.clientHeight
              }
              return this.size ? {height: this.childHeight + 'px', overflow: 'hidden'} : {};
            })
          }
          else{
            return {height: '0px', overflow: 'hidden'};
          }
        }
      }
    },
    /**
      * Select the index of item defined by the prop opened
      * @event mounted
      * @fires select
      */
     mounted(){
      if ( this.opened !== undefined ){
        this.$nextTick(()=>{
          this.select(this.opened)
        })
      }
    },
    watch: {
      /**
       * @watch selected
       */
      selected(v, o) {
        if ( v !== null ){
          setTimeout(() => {
            this.headers[v].style.overflow = null;
          }, 300)
        }
      }
    }
  };
