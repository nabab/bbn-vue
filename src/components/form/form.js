/**
 * component bbn-form
 *
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  Vue.component('bbn-form', {
    /**
     *
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       *
       * @prop {Boolean} [false] autocomplete
       */
      autocomplete: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to enable the form's buttons without changing the form's content.
       *
       * @prop {Boolean} [false] prefilled
       */
      prefilled: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to disable the form.
       * @prop {Boolean} [false] disabled
       */
      disabled: {},
      script: {},
      /**
       * The list of fields the form must contain.
       *
       */
      fields: {},
      /**
       * Set to true to enable full screen mode.
       *
       * @prop {Boolean} [false] fullScreen
       */
      fullScreen: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to make a post_out instead of a post when the form is submitted.
       *
       * @prop {Boolean} [false] blank
       */
      blank: {
        type: Boolean,
        default: false
      },
      /**
       *
       * @prop {Boolean} [false] self
       */
			self: {
        type: Boolean,
        default: false
      },
      /**
       * A confirm popup with a costumized message shown before the form is submitted.
       *
       * @prop {String|Function} confirmMessage
       */
      confirmMessage: {
        type: [String, Function]
      },
      /**
       * A confirm popup with a costumized message shown before leaving the form.
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
       * A method called after a correct form submission.
       *
       * @prop {Function} success
       */
      success: {
        type: Function
      },
      /**
       * A method called after a failed form submission.
       *
       * @prop {Function} failure
       */
      failure: {
        type: Function
      },
      /**
       * A popup with a costumized message shown after a correct form submission.
       *
       * @prop {String|Function} successMessage
       */
      successMessage: {
        type: [String, Function]
      },
      /**
       * A popup with a costumized message shown after a failed form submission.
       *
       * @prop {String|Function} failureMessage
       */
      failureMessage: {
        type: [String, Function]
      },
      /**
       * The method of submission of the form.
       *
       * @prop {String} [post] method
       */
      method: {
        type: String,
        default: 'post'
      },
      /**
       * Set to true to enable form scrolling.
       *
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * The buttons shown on the form.
       *
       * @prop {Array} ['cancel', 'submit'] buttons
       */
      buttons: {
        type: Array,
        default(){
          return ['cancel', 'submit'];
        }
      },
      /**
       * The proper data used in the form.
       *
       * @prop {Object} source
       */
      // This is the proper data used in the form
      source: {
        type: Object
      },
      /**
       * The additional data to be sent by the form.
       *
       * @prop {Object} data
       */
      // This is additional data to be sent by the form
      data: {
        type: Object
      },
      /**
       * Set to true to have the form's footer fixed.
       *
       * @prop {Boolean} [true] fixedFooter
       */
      fixedFooter: {
        type: Boolean,
        default: true
      },
      /**
       * The form schema generating the inputs.
       *
       * @prop {Array} [[]] schema
       */
      // That will be a form schema generating the inputs
      schema: {
        type: Array,
        default: function(){
          return [];
        }
      },
      // Sets if it is the data property which must be sent, or the content of the named fields
      // (in this case names are not necessary on form inputs)
      /**
       * Set to true if the data property must be sent.
       *
       * @prop {Boolean} [true] sendModel
       */
      sendModel: {
        type: Boolean,
        default: true
      },
      /**
       * Checks the fields data before submitting the form.
       *
       * @prop {Function} validation
       */
      validation: {
        type: Function
      }
    },
    data(){
      let currentSchema = [];
      this.schema.map((a) => {
        currentSchema.push($.extend({}, a, {id: a.id ? a.id : bbn.fn.randomString(20, 30)}))
      });
      return {
        modified: false,
        popup: false,
        popupIndex: false,
        tab: false,
        originalData: {},
        isPosted: false,
        currentSchema: currentSchema
      };
    },
    computed: {
      /**
       * Returns an array containing the form's buttons.
       *
       * @computed realButtons
       * @return {Array}
       */
      realButtons(){
        let r = [];
        $.each(this.buttons.slice(), (i, a) => {
          let t = typeof(a);
          if ( t === 'string' ){
            switch ( a ){
              case 'cancel':
                r.push({
                  text: bbn._('Cancel'),
                  icon: 'fa fa-times-circle',
                  command: this.cancel
                });
                break;
              case 'reset':
                r.push({
                  text: bbn._('Reset'),
                  icon: 'fa fa-refresh',
                  command: this.reset,
                  checkDisabled: true
                });
                break;
              case 'submit':
                r.push({
                  text: bbn._('Submit'),
                  icon: 'fa fa-check-circle',
                  command: this.submit,
                  checkDisabled: true
                });
                break;
            }
          }
          else if ( t === 'object' ){
            if ( (typeof a.command === 'string') && bbn.fn.isFunction(this[a.command]) ){
              a.command = this[a.command];
            }
            r.push(a);
          }
        });
        return r;
      },
      /**
       * Returns true if the form has a footer.
       *
       * @computed hasFooter
       * @return {Boolean}
       */
      hasFooter(){
        return this.$slots.footer && this.$slots.footer.length;
      },
      /**
       * Based on the prop fixedFooter and fullScreen, a string is returned containing the classes for the form template.
       *
       * @computed currentClass
       * @return {String}
       */
      currentClass(){
        let st = 'k-edit-form-container ' + this.componentClass;
        if ( this.fixedFooter ){
          st += ' bbn-flex-height';
        }
        if ( this.fullScreen ){
          st += ' bbn-full-screen';
        }
        return st;
      }
    },
    methods: {
      /**
       * Defines the form behaviour when submitted.
       *
       * @method _post
       * @fires getPopup
       * @emit failure
       * @emit success
       */
      _post(){
        this.isPosted = true;
        if ( this.action ){
          bbn.fn[this.blank || this.self ? 'post_out' : 'post'](this.action, $.extend(true, {}, this.data, this.source), (d) => {
            this.originalData = $.extend(true, {}, this.source);
            if ( this.successMessage && p ){
              p.alert(this.successMessage);
              bbn.fn.info(this.successMessage, p);
            }
            let e = $.Event('success');
            this.$emit('success', d, e);
            if ( this.sendModel ){
              this.originalData = $.extend(true, {}, this.source);
            }
            this.modified = false;
            if ( this.tab && this.tab.tabNav ){
              this.tab.tabNav.tabs[this.tab.tabNav.selected].isUnsaved = this.modified;
            }
            if ( !e.isDefaultPrevented() ){
              let p = this.getPopup();
              if ( p ){
                p.close();
              }
            }
          }, !this.blank && !this.self ? (xhr, textStatus, errorThrown) => {
            this.$emit('failure', xhr, textStatus, errorThrown)
          } : (this.self ? '_self' : '_blank'));
        }
        else{
          this.originalData = $.extend(true, {}, this.source);
          let e = $.Event('success');
          this.$emit('success', this.source, e);
          if ( this.sendModel ){
            this.originalData = $.extend(true, {}, this.source);
          }
          this.modified = false;
          if ( this.tab && this.tab.tabNav ){
            this.tab.tabNav.tabs[this.tab.tabNav.selected].isUnsaved = this.modified;
          }
          if ( !e.isDefaultPrevented() ){
            let p = this.getPopup();
            if ( p ){
              p.close();
            }
          }
        }
      },
      /**
       *
       *
       * @method _execCommand
       */
      _execCommand(button, ev){
        if ( button.command ){
          button.command(this.source, this, ev)
        }
      },
      /**
       * Compares the actual data with the original data of the form to identify the differences.
       *
       * @method getModifications
       * @fires getData
       * @return {Object}
       */
      getModifications(){
        let data = this.getData(this.$el) || {},
            res = {};
        for ( let n in data ){
          if ( (this.sendModel && (data[n] !== this.originalData[n])) || (!this.sendModel && (data[n] != this.originalData[n])) ){
            res[n] = data[n];
          }
        }
        return res;
      },
      /**
       * Based on the prop sendModel, the source of the form or an object of the data contained in the form's fields is returned.
       *
       * @method getData
       * @return {Object}
       */
      getData(){
        return this.sendModel ? this.source : bbn.fn.formdata(this.$el);
      },
      isModified(){
        return this.prefilled || !bbn.fn.isSame($.extend(true, {}, this.getData(this.$el) || {}), $.extend(true, {}, this.originalData));
      },
      closePopup(window, ev){
        if ( this.window && this.$el ){
          if ( !this.isPosted && this.confirmLeave && this.isModified() ){
            if ( ev ){
              ev.preventDefault();
            }
            this.getPopup().confirm(this.confirmLeave, () => {
              if ( this.reset() ){
                this.$nextTick(() => {
                  this.window.close(true);
                });
              }
            })
          }
        }
      },
      cancel(){
        let ev = $.Event('cancel');
        this.$emit('cancel', ev, this);
        if ( !ev.isDefaultPrevented() ){
          this.reset();
          if ( this.window ){
            this.window.close();
          }
        }
      },
      submit(force){
        let ok = true,
            elems = bbn.vue.findAll(this, '.bbn-input-component'),
            cf = false;
        if ( Array.isArray(elems) ){
          $.each(elems, (i, a) => {
            if ( $.isFunction(a.isValid) && !a.isValid() ){
              ok = false;
            }
            if ( $.isFunction(a.validation) && !a.isValid() ){
              ok = false;
            }
            if ( !ok ){
              return false;
            }
          });
        }
        if ( ok && this.validation ){
          ok = this.validation(this.source, this.originalData)
        }
        if ( !ok ){
          return false;
        }
        if ( !force ){
          let ev = $.Event('submit');
          this.$emit('submit', ev, this);
          if ( ev.isDefaultPrevented() ){
            return false;
          }
        }
        if ( this.confirmMessage ){
          if ( $.isFunction(this.confirmMessage) ){
            cf = this.confirmMessage(this);
          }
          else{
            cf = this.confirmMessage;
          }
          if ( cf ){
            let popup = this.getPopup();
            if ( popup ){
              popup.confirm(cf, () => {
                popup.close();
                this._post();
              });
            }
          }
        }
        if ( !cf ){
          this._post();
        }
      },
      reset(){
        this.isPosted = false;
        $.each(this.originalData, (name, val) => {
          this.$set(this.source, name, val);
        });
        this.$forceUpdate();
        return true;
      },
      reinit(){
        this.originalData = $.extend(true, {}, this.getData());
        this.modified = this.isModified();
      },
      init(){
        if ( this.$options.propsData.script ){
          $(this.$el).data("script", this.$options.propsData.script);
        }
        this.originalData = $.extend(true, {}, this.getData());
        this.$nextTick(() => {
          if ( !this.window ){
            this.window = bbn.vue.closest(this, "bbn-window");
            if ( this.window ){
              this.window.addClose(this.closePopup);
            }
          }
          if ( !this.tab ){
            this.tab = bbn.vue.closest(this, ".bbns-tab");
          }
          $(":input:visible:first", this.$el).focus();
        });
      },
      checkValidity(){
        return this.$el.checkValidity();
      },
      reportValidity() {
        return this.$el.reportValidity();
      }
    },
    mounted(){
      this.init();
    },
    watch: {
      schema(){
        let currentSchema = [];
        this.schema.map((a) => {
          currentSchema.push($.extend({}, a, {id: a.id ? a.id : bbn.fn.randomString(20, 30)}))
        });
        this.currentSchema = currentSchema;
      },
      source: {
        deep: true,
        handler(newVal){
          this.$emit('input', newVal);
          bbn.fn.log("MODIFIED");
          this.modified = this.isModified();
          if ( this.tab && this.tab.tabNav ){
            this.tab.tabNav.tabs[this.tab.tabNav.selected].isUnsaved = this.modified;
          }
        }
      }
    }
  });

})(jQuery, bbn, kendo);