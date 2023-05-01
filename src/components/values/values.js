/**
 * @file bbn-context component
 *
 * @description bbn-keyvalue is a dynamic list of keys and values
 * The source of the menu can have a tree structure.
 * ì
 * @copyright BBN Solutions
 *
 * @created 15/02/2017.
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.dropdown
     * @mixin bbn.wc.mixins.keynav
     */
    mixins: 
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.input,
      bbn.wc.mixins.dropdown,
      bbn.wc.mixins.keynav
    ],
    props: {
      /**
       * @prop {Array} source
       */
      source: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * @prop {(Array|String)} value
       */
      value: {
        type: [Array, String]
      },
      /**
       * @prop {Number} max
       */
      max: {
        type: Number
      },
      /**
       * @prop {Number} min
       */
      min: {
        type: Number
      },
      /**
       * @prop {(String|Function)} validator
       */
      validator: {
        type: [String, Function]
      },
    },
    data(){
      let isJSON = this.value && bbn.fn.isString(this.value);
      let obj = this.value ? (isJSON ? JSON.parse(this.value) : bbn.fn.clone(this.value)) : [];
      if (!bbn.fn.isArray(obj)) {
        throw new Error("The value of bbn-values must be an array");
      }
      return {
        isJSON: isJSON,
        obj: obj,
        currentValue: obj.slice(),
        currentInput: ''
      };
    },
    computed: {
      filteredData(){
        return bbn.fn.filter(this.source, a => {
          if (this.currentInput.length) {
            let ci = bbn.fn.removeAccents(this.currentInput).toLowerCase();
            let tmp = bbn.fn.removeAccents(a).toLowerCase();
            if (tmp.indexOf(ci) === -1) {
              return false;
            }
          }

          return !this.obj.includes(a);
        });
      }
    },
    methods: {
      keydown(e){
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          if (this.$refs.list && (this.$refs.list.overIdx > -1)) {
            this.currentInput = this.filteredData[this.$refs.list.overIdx];
          }

          this.add();
        }
        else if (e.key === ';') {
          e.preventDefault();
          this.add();
        }
        else if (this.commonKeydown(e)) {
          return;
        }
        else if (e.key === 'Escape') {
          e.preventDefault();
          this.isOpened = false;
        }
        else if (bbn.var.keys.upDown.includes(e.keyCode)) {
          e.preventDefault();
          if (!this.isOpened) {
            this.isOpened = true;
          }
          else {
            this.keynav(e);
          }
        }
      },
      select(value){
        this.currentInput = value.value;
        this.add();
      },
      isValid(){
        return bbn.fn.isArray(this.obj);
      },
      add(){
        if (this.currentInput.length && (this.obj.indexOf(this.currentInput) === -1)) {
          this.obj.push(this.currentInput);
          this.emitInput(this.isJSON ? JSON.stringify(this.obj) : this.obj);
          this.currentInput = '';
          this.$refs.input.focus();
        }
      },
      remove(idx) {
        this.obj.splice(idx, 1);
        this.emitInput(this.isJSON ? JSON.stringify(this.obj) : this.obj);
      }
    }
  };
