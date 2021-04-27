(bbn_resolve) => {
((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div class="bbn-overlay bbn-flex-height">
  <div class="bbn-flex-fill"
       v-for="(name, i) in indexes"
       v-show="currentSelected === i"
       :key="i">
    <bbn-form :source="data"
              :buttons="false"
              :ref="'form-' + i"
              :prefilled="true"
              @ready="readyForm = true"
              @success="onSuccess">
      <div :class="{
        'bbn-overlay': true,
        'bbn-middle': !!items[i].centered,
        'bbn-padded': !items[i].centered
      }">
        <div :class="{
          'bbn-block': !!items[i].centered,
          'bbn-vmiddle': !!items[i].centered,
          'bbn-overlay': !items[i].centered,
          'bbn-flex-height': !items[i].centered
        }"
              style="display: block; max-height: 100%">
          <div class="bbn-m bbn-b bbn-padded"
               v-text="source[i].title || name"/>
          <div :class="{
            'bbn-block': !!items[i].centered,
            'bbn-flex-fill': !items[i].centered
          }">
            <component :is="items[i].component || 'bbn-input'"
                        v-bind="items[i].getOptions()"
                        :required="items[i].required === undefined ? true : items[i].required"
                        v-model="data[name]"/>
          </div>
        </div>
      </div>
    </bbn-form>
  </div>
  <div class="bbn-form-footer bbn-popup-footer bbn-button-group bbn-flex-width bbn-lg">
    <bbn-button v-for="(button, i) in currentButtons"
                :key="button.key"
                v-bind="button"
    ></bbn-button>
  </div>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-multipart');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
 * @file bbn-form component
 *
 * @description bbn-form is a component that allows you to quickly generate and process web forms.
 * 
 * Validation and custom control can be defined before data is sent to the back-end system.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-multipart', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.localStorageComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent, bbn.vue.inputComponent],
    props: {
      source: {
        type: Array,
        required: true
      },
      value: {
        type: Object,
        default(){
          return {};
        }
      },
      /**
       *@tood not used
       * @ {Boolean} [false] autocomplete
       */
      autocomplete: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to disable the form.
       * @prop {Boolean} [false] disabled
       */
      disabled: {},
      script: {},
      scrollable: {},
      /**
       * Set to true to make a postOut instead of a post when the form is submitted.
       *
       * @prop {Boolean} [false] blank
       */
      blank: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to give the attribute target the value '_self'.
       * @prop {Boolean} [false] self
       */
			self: {
        type: Boolean,
        default: false
      },
      target: {
        type: String
      },
      /**
       * A confirmation popup with a costumized message shown before the form is submitted.
       *
       * @prop {String|Function} confirmMessage
       */
      confirmMessage: {
        type: [String, Function]
      },
      /**
       * A confirmation popup with a costumized message shown before leaving the form.
       *
       * @prop {String|Function} confirmLeave
       */
      confirmLeave: {
        type: [Boolean, String, Function],
        default: bbn._("Are you sure you want to discard the changes you made in this form?")
      },
      /**
       * The url contacted when submitting the form.
       *
       * @prop {String} action
       */
      action: {
        type: String
      },
      /**
       * A method called after a form is correctly submitted.
       *
       * @prop {Function} success
       */
      success: {
        type: Function
      },
      /**
       * A method called after a form submission fails.
       *
       * @prop {Function} failure
       */ 
      failure: {
        type: Function
      },
      /**
       * A popup with a costumized message shown after a form is correctly submitted.
       *
       * @prop {String|Function} successMessage
       */
      successMessage: {
        type: [String, Function]
      },
      /**
       * A popup with a costumized message shown after a form submission fails.
       *
       * @prop {String|Function} failureMessage
       */
      failureMessage: {
        type: [String, Function]
      },
      /**
       * The form's method of submission.
       *
       * @prop {String} [post] method
       */
      method: {
        type: String,
        default: 'post'
      },
      /**
       * The buttons shown on the form.
       *
       * @prop {Boolean|Array} ['cancel', 'submit'] buttons
       */
      buttons: {
        type: [Boolean, Array],
        default(){
          return ['cancel', 'submit'];
        }
      },
      /**
       * Checks the fields' data before submitting the form.
       *
       * @prop {Function} validation
       */
      validation: {
        type: Function
      },
      /**
       * If true, will consider itself as a unique element of a floater and will have its buttons incorporated in it 
       * whereas if undefined will.
       *
       * @prop {Boolean|String} windowed
       */
      windowed: {
        type: [Boolean, String],
        default: 'auto'
      },
      /**
       * If true, will use the class bbn-overlay for its container.
       *
       * @prop {Boolean} fullSize
       */
      fullSize: {
        type: Boolean,
        default: false
      },
      centered: {
        type: Boolean,
        default: true
      }
    },
    data(){
      let data = {};
      let items = [];
      if (bbn.fn.isArray(this.source)) {
        bbn.fn.each(this.source, a => {
          a = bbn.fn.clone(a);
          if (a.name) {
            a.getOptions = () => {
              if (bbn.fn.isFunction(a.options)) {
                return a.options(this.data);
              }
              return a.options || {};
            };
            if (a.centered === undefined) {
              a.centered = this.centered;
            }
            items.push(a);
            if (a.value === undefined) {
              if (a.default) {
                data[a.name] = bbn.fn.isFunction(a.default) ? a.default() : a.default
              }
              else {
                data[a.name] = a.nullable ? null : ''
              }
            }
            else {
              data[a.name] = a.value;
            }
          }
        })
      }

      return {
        root: appui.plugins['appui-menu'] + '/',
        cf: null,
        data: data,
        items: items,
        currentSelected: 0,
        indexes: Object.keys(data),
        readyForm: false,
        currentButtons: false,
        maxIndex: items.length - 1
      }
    },
    computed: {
    },
    created(){
      this.currentButtons = this.getButtons(this.currentSelected);

    },
    /*
    data(){
      return {
        router: null,
        form: null,
        hasNext: false,
        hasPrev: false,
        isFocusing: false,
        isPageValid: false
      }
    },
    */
    methods: {
      hasForm() {
        let form = this.getRef('form-' + this.currentSelected);
        return !!form;
      },
      getButtons() {
        let form = this.getRef('form-' + this.currentSelected);
        if (!form) {
          this.readyForm = false;
        }
        if (this.indexes[this.currentSelected]) {
          return [
            {
              text: bbn._("Back"),
              action: () => {
                this.currentSelected--;
              },
              cls: 'bbn-padded',
              disabled: !form || (this.currentSelected === 0),
              key: bbn.fn.randomString()
            }, {
              text: this.currentSelected === this.maxIndex ? bbn._("Confirm") : bbn._("Next"),
              action: () => {
                if (this.indexes[this.currentSelected+1]) {
                  this.currentSelected++;
                }
                else {
                  this.$emit('submit', this.data);
                  form.submit();
                }
              },
              cls: 'bbn-padded',
              disabled: !form || !form.isValid(),
              key: bbn.fn.randomString()
            }
          ];
        }
        return false;
      },
      updateButtons(){
        this.$nextTick(() => {
          let form = this.getRef('form-' + this.currentSelected);
          if (form) {
            this.currentButtons = this.getButtons()
            this.$forceUpdate();
            this.$nextTick(() => {
              this.$forceUpdate()
            })
          }
          else {
            this.readyForm = false;
          }
        })
      },
      onSuccess(){
        bbn.fn.log("SUCCESS", arguments, this.data)
      }
    },
    watch: {
      currentSelected(){
        this.updateButtons();
      },
      readyForm(v) {
        this.updateButtons();
      },
      data: {
        deep: true,
        handler(){
          this.updateButtons();
        }
      }
    }
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}