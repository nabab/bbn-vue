/**
 * @file bbn-radio component
 * @description bbn-radio is a component that can be used to select a particular choice from a range of options.
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 13/02/2017
 */
return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.localStorage
     * @mixin bbn.wc.mixins.events
     *
     */
    mixins: 
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.input,
      bbn.wc.mixins.localStorage,
      bbn.wc.mixins.events
    ],
    props: {
      /**
       * Set to true to arrange the radio buttons vertically.
       * @prop {Boolean} [false] vertical
       */
			vertical: {
				type: Boolean,
				default: false
      },
      /**
       * The name of the property in the item object used as a text.
       * @prop {String} ['text'] sourceText
       */
      sourceText: {
        type: String,
        default: 'text'
      },
      /**
       * The name of the property in the item object used as a text.
       * @prop {String} ['text'] sourceText
       */
      sourceIcon: {
        type: String,
        default: 'icon'
      },
      /**
       * The name of the property in the item object used as a value
       * @prop {String} ['text'] sourceValue
       */
      sourceValue: {
        type: String,
        default: 'value'
      },
      /**
       * The source of the component.
       * @prop {Array} [[{text:'Yes', value:1},{text:'No', value:0}]] source
       */
      source: {
        type: Array
      },
      /**
       * The real value used in the input emit.
       * @prop {String|Boolean|Number} [undefined] modelValue
       */
      modelValue: {
        type: [String, Boolean, Number],
        default: undefined
      },
      /**
       * @prop {Boolean} [false] notext
       */
      notext: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      currentData() {
        if (this.source.length && !bbn.fn.isObject(this.source[0])) {
          return bbn.fn.map(this.source, a => {
            return {
              [this.sourceText]: a,
              [this.sourceValue]: a
            };
          });
        }

        return this.source;
      }
    },
    beforeMount() {
      if (this.hasStorage) {
        let v = this.getStorage();
        if (v && (v !== this.modelValue)) {
          this.changed(v);
        }
      }
    },
    watch: {
      /**
       * @watch value
       * @param {Mixed} v
       */
      value(v) {
        if (this.storage) {
          if (v) {
            this.setStorage(v);
          }
          else {
            this.unsetStorage()
          }
        }
      },
    }
  };
