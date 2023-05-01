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
     */
    mixins: 
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.input,
    ],
    props: {
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
      }
    },
    data(){
      let isJSON = bbn.fn.isString(this.value);
      return {
        isJSON: isJSON,
        obj: isJSON ? JSON.parse(this.value) : this.value,
        currentKey: '',
        currentValue: '',
        items: []
      };
    },
    methods: {
      setItems(){
        this.items.splice(0, this.items.length);
        bbn.fn.iterate(this.obj, (o, n) => {
          this.items.push({
            key: n,
            value: o
          });
        });
      },
      update(){
        this.setItems();
        this.$forceUpdate();
      },
      remove(key){
        delete this.obj[key];
        if (this.isJSON) {
          this.emitInput(JSON.stringify(this.obj) || '{}');
        }
        else {
          /** @see https://www.drewtown.dev/post/using-vues-v-model-with-objects/ */
          this.$emit('input', {...this.obj});
        }
        this.update();
      },
      add(){
        if (this.currentKey && this.currentValue) {
          if (this.isJSON) {
            this.obj[this.currentKey] = this.currentValue;
            this.emitInput(JSON.stringify(this.obj) || '{}');
          }
          else {
            /** @see https://www.drewtown.dev/post/using-vues-v-model-with-objects/ */
            this.$emit('input', {...this.obj, [this.currentKey]: this.currentValue});
            this.obj[this.currentKey] = this.currentValue;
          }
          this.update();
          this.currentKey = '';
          this.currentValue = '';
          this.getRef('key').focus();
        }
      }
    },
    created(){
      this.setItems();
    }
  };
