/**
 * @file bbn-form component
 *
 * @description bbn-form is a component with great potential for data management.
 * Simple and unambiguous in implementation, it allows you to quickly generate and process web forms based also on Ajax with a set of elements.
 * The component provides, among other things, the possibility of distinguishing the constant data with those modified or inserted by the user before the predetermined action and then unifying them when sending.
 * Furthermore, if you wish, you can define validation, custom control or process data before being sent to the back-end system.
 * It simplifies the processing of data in the module and provides a ready-to-use mechanism for saving or not storing data on the server.
 * Allowing the possibility to implement any action you want.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */

(function($, bbn){
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
        type: Object,
        default(){
          return {}
        }
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
        currentSchema.push(bbn.fn.extend({}, a, {id: a.id ? a.id : bbn.fn.randomString(20, 30)}))
      });
      return {
        modified: false,
        popup: false,
        popupIndex: false,
        tab: false,
        originalData: bbn.fn.clone(this.source),
        isPosted: false,
        isLoading: false,
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
        bbn.fn.each(this.buttons.slice(), (a) => {
          let t = typeof(a);
          if ( t === 'string' ){
            switch ( a ){
              case 'cancel':
                r.push({
                  text: bbn._('Cancel'),
                  icon: 'nf nf-fa-times_circle',
                  command: 'cancel'
                });
                break;
              case 'reset':
                r.push({
                  text: bbn._('Reset'),
                  icon: 'nf nf-fa-refresh',
                  command: 'reset',
                  checkDisabled: true
                });
                break;
              case 'submit':
                r.push({
                  text: bbn._('Submit'),
                  icon: 'nf nf-fa-check_circle',
                  command: 'submit',
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
        let st = this.componentClass.join(' ');
        if ( this.isMounted ){
          if ( this.fixedFooter && this.scrollable ){
            st += ' bbn-flex-height';
          }
          if ( this.fullScreen ){
            st += ' bbn-overlay';
          }
        }
        return st;
      },
      currentStyle(){
        return {};
        if ( !this.isMounted ){
          return {};
        }
        let floater = this.closest('bbn-floater');
        let ct = this.getRef('container');
        if ( floater && ct ){
          let width = this.scrollable && ct.isMounted ? ct.getRef('scrollContent').clientWidth : ct.clientWidth;
          let height = this.scrollable && ct.isMounted ? ct.getRef('scrollContent').clientHeight : ct.clientHeight;
          let ctWidth = floater.getContainerWidth();
          let ctHeight = floater.getContainerHeight() - (floater.getRef('header').clientHeight || 0);
          if ( width > ctWidth ){
            width = ctWidth;
          }
          if ( height > ctHeight ){
            height = ctHeight;
          }
          return {
            width: width + 'px',
            height: height + 'px'
          };
        }
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
        this.isLoading = true;
        if ( this.action ){
          bbn.fn[this.blank || this.self ? 'post_out' : 'post'](this.action, bbn.fn.extend(true, {}, this.data || {}, this.source || {}), (d) => {
            this.originalData = bbn.fn.extend(true, {}, this.source || {});
            if ( this.successMessage && p ){
              p.alert(this.successMessage);
              bbn.fn.info(this.successMessage, p);
            }
            let e = new Event('success', {cancelable: true});
            this.$emit('success', d, e);
            if ( this.sendModel && this.source ){
              this.originalData = bbn.fn.extend(true, {}, this.source || {});
            }
            this.modified = false;
            if ( this.tab && this.tab.tabNav ){
              this.tab.tabNav.tabs[this.tab.tabNav.selected].isUnsaved = this.modified;
            }
            this.isLoading = false;
            if ( !e.defaultPrevented ){
              let p = this.getPopup();
              if ( p ){
                p.close();
              }
            }
          }, !this.blank && !this.self ? (xhr, textStatus, errorThrown) => {
            this.$emit('failure', xhr, textStatus, errorThrown);
              this.isLoading = false;
          } : (this.self ? '_self' : '_blank'));
        }
        else{
          this.originalData = bbn.fn.clone(this.source);
          let e = new Event('success', {cancelable: true});
          this.$emit('success', this.source, e);
          if ( this.sendModel ){
            this.originalData = bbn.fn.clone(this.source);
          }
          this.modified = false;
          if ( this.tab && this.tab.tabNav ){
            this.tab.tabNav.tabs[this.tab.tabNav.selected].isUnsaved = this.modified;
          }
          this.isLoading = false;
          if ( !e.defaultPrevented ){
            let p = this.getPopup();
            if ( p ){
              p.close();
            }
          }
        }
      },
      /**
       * Executes the command given to the button
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
        return this.source;//this.sendModel ? this.source : bbn.fn.formdata(this.$el);
      },
      isModified(){
        return this.prefilled || !bbn.fn.isSame(bbn.fn.extend(true, {}, this.getData(this.$el) || {}), bbn.fn.extend(true, {}, this.originalData));
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
        let ev = new Event('cancel', {cancelable: true});
        this.$emit('cancel', ev, this);
        if ( !ev.defaultPrevented ){
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
          bbn.fn.each(elems, (a) => {
            if (bbn.fn.isFunction(a.isValid) && !a.isValid() ){
              ok = false;
            }
            if (bbn.fn.isFunction(a.validation) && !a.isValid() ){
              ok = false;
            }
            if ( !ok ){
              return false;
            }
          });
        }
        if ( ok && this.validation ){
          ok = this.validation(this.source, this.originalData, force)
        }
        if ( !ok ){
          return false;
        }
        if ( !force ){
          let ev = new Event('submit', {cancelable: true});
          this.$emit('submit', ev, this);
          if ( ev.defaultPrevented ){
            return false;
          }
        }
        if ( this.confirmMessage ){
          if (bbn.fn.isFunction(this.confirmMessage) ){
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
        bbn.fn.iterate(this.originalData, (val, name) => {
          this.$set(this.source, name, val);
        });
        this.$forceUpdate();
        return true;
      },
      reinit(){
        this.originalData = JSON.parse(JSON.stringify(this.source));
        this.modified = this.isModified();
      },
      init(){
        if ( this.$options.propsData.script ){
          $(this.$el).data("script", this.$options.propsData.script);
        }
        //this.originalData = bbn.fn.extend(true, {}, this.getData());
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
          currentSchema.push(bbn.fn.extend({}, a, {id: a.id ? a.id : bbn.fn.randomString(20, 30)}))
        });
        this.currentSchema = currentSchema;
      },
      source: {
        deep: true,
        handler(newVal){
          bbn.fn.log("BBN-FORM MODIFIED");
          this.modified = this.isModified();
          //this.$emit('input', newVal);
          if ( this.tab && this.tab.tabNav ){
            this.tab.tabNav.tabs[this.tab.tabNav.selected].isUnsaved = this.modified;
          }
        }
      }
    }
  });

})(jQuery, bbn);
