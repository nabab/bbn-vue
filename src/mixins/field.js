(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Field component.
     * @component fieldComponent
     */
    fieldComponent: {
      props: {
        /**
         * The width of the component.
         * @prop {String|Number} width
         * @memberof fieldComponent
         */
        width: {
          type: [String, Number],
        },
        /**
         * The min-width of the component.
         * @prop {String|Number} minWidth
         * @memberof fieldComponent
         */
        minWidth: {
          type: [String, Number],
        },
        /**
         * The max-width of the component.
         * @prop {String|Number} maxWidth
         * @memberof fieldComponent
         */
        maxWidth: {
          type: [String, Number],
        },
        /**
         * The render of the component.
         * @prop {String|Function} render
         * @memberof fieldComponent
         */
        render: {
          type: [String, Function]
        },
        /**
         * The title of the component.
         * @prop {String|Number} title
         * @memberof fieldComponent
         */
        title: {
          type: [String, Number]
        },
        /**
         * The full title of the component.
         * @prop {String} ftitle
         * @memberof fieldComponent
         */
        ftitle: {
          type: String
        },
        /**
         * @prop {String|Object} tcomponent
         * @memberof fieldComponent
         */
        tcomponent: {
          type: [String, Object]
        },
        /**
         * The icon of the component.
         * @prop {String} icon
         * @memberof fieldComponent
         */
        icon: {
          type: String
        },
        /**
         * The classes added to the component.
         * @prop {String|Function} cls
         * @memberof fieldComponent
         */
        cls: {
          type: [String, Function]
        },
        /**
         * The component's type.
         * @prop {String} type
         * @memberof fieldComponent
         */
        type: {
          type: String
        },
        /**
         * The component's field.
         * @prop {String} field
         * @memberof fieldComponent
         */
        field: {
          type: String
        },
        /**
         * Defines if the component has to be fixed.
         * @prop {Boolean|String} [false] fixed
         * @memberof fieldComponent
         */
        fixed: {
          type: [Boolean, String],
          default: false
        },
        /**
         * Defines if the component has to be hidden.
         * @prop {Boolean} hidden
         * @memberof fieldComponent
         */
        hidden: {
          type: Boolean
        },
        /**
         * Defines if the componenent has to be encoded.
         * @prop {Boolean} [false] encoded
         * @memberof fieldComponent
         */
        encoded: {
          type: Boolean,
          default: false
        },
        /**
         * Defines if the componenent has to be sortable.
         * @prop {Boolean|Function} [true] sortable 
         * @memberof fieldComponent
         */
        sortable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent has to be editable.
         * @prop {Boolean|Function} [true] editable 
         * @memberof fieldComponent
         */
        editable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent has to be filterable.
         * @prop {Boolean|Function} [true] filterable 
         * @memberof fieldComponent
         */
        filterable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent has to be resizable.
         * @prop {Boolean|Function} [true] resizable 
         * @memberof fieldComponent
         */
        resizable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent has to be showable.
         * @prop {Boolean|Function} [true] showable 
         * @memberof fieldComponent
         */
        showable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent can have a null value.
         * @prop {Boolean|Function} nullable 
         * @memberof fieldComponent
         */
        nullable: {
          type: [Boolean, Function],
        },
        /**
         * The buttons of the component.
         * @prop {Array|Function} buttons 
         * @memberof fieldComponent
         */
        buttons: {
          type: [Array, Function]
        },
        /**
         * The source of the component.
         * @prop {Array|Object|String|Function} source 
         * @memberof fieldComponent
         */
        source: {
          type: [Array, Object, String, Function]
        },
        /**
         * Defines if the the value of the component is required.
         * @prop {Boolean|Function} required 
         * @memberof fieldComponent
         */
        required: {
          type: [Boolean, Function]
        },
        /**
         * Defines the precision of the component.
         * @prop {Number} [0] precision 
         * @memberof fieldComponent
         */
        precision: {
          type: Number,
          default: 0
        },
        /**
         * Defines the precision of the component.
         * @prop {Number} [0] precision 
         * @memberof fieldComponent
         */
        unit: {
          type: String
        },
        /**
         * Defines the options of the component.
         * @prop {Object|Function} options
         * @memberof fieldComponent
         */
        options: {
          type: [Object, Function],
          default(){
            return {};
          }
        },
        /**
         * Defines the editor of the component.
         * @prop {String|Object} editor
         * @memberof fieldComponent
         */
        editor: {
          type: [String, Object]
        },
        /**
         * Defines the maxLength of the component.
         * @prop {Number} maxLength 
         * @memberof fieldComponent
         */
        maxLength: {
          type: Number
        },
        /**
         * Defines the max number of chars visible in reading.
         * @prop {Number} maxVisible 
         * @memberof fieldComponent
         */
        maxVisible: {
          type: Number
        },
        /**
         * Defines the sqlType of the component.
         * @prop {String} sqlType 
         * @memberof fieldComponent
         */
        sqlType: {
          type: String
        },
        /**
         * @prop {String|Array} aggregate
         * @memberof fieldComponent
         */
        aggregate: {
          type: [String, Array]
        },
        /**
         * Define a component to use.
         * @prop {String|Object} component
         * @memberof fieldComponent
         */
        component: {
          type: [String, Object]
        },
        /**
         * A function to map the data of the component.
         * @prop {Function} mapper
         * @memberof fieldComponent
         */
        mapper: {
          type: Function
        },
        /**
         * Defines the group of the component.
         * @prop {String} group
         * @memberof fieldComponent
         */
        group: {
          type: String
        }
      },
    }
  });
})(bbn);