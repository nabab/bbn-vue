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

  Vue.component('bbn-form', {
    /**
     *
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       *@tood not used
       * @ {Boolean} [false] autocomplete
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
       * Set to true to make a post_out instead of a post when the form is submitted.
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
       * Set to true to enable form scrolling.
       *
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: false
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
       * Set to true to fix the form's footer.
       *
       * @prop {Boolean} [true] fixedFooter
       */
      fixedFooter: {
        type: Boolean,
        default: false
      },
      /**
       * The form's schema generating the inputs.
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
      }
    },
    data(){
      let currentSchema = [];
      this.schema.map((a) => {
        currentSchema.push(bbn.fn.extend({}, a, {id: a.id ? a.id : bbn.fn.randomString(20, 30)}))
      });
      return {
        /**
         * True if the form has been modified.
         * @data {Boolean} [false] modified
         */
        modified: false,
        /**
         * True if the form has been modified.
         * @data {Boolean} [false] popup
         */
        popupIndex: false,
        tab: false,
        originalData: bbn.fn.clone(this.source),
        isPosted: false,
        isLoading: false,
        currentSchema: currentSchema,
        isPosting: false,
        window: null,
        isInit: false,
        realButtons: this.getRealButtons()
      };
    },
    computed: {
      /**
       * Returns true if the form has a footer.
       *
       * @computed hasFooter
       * @return {Boolean}
       */
      hasFooter(){
        return this.$slots.footer && this.$slots.footer.length;
      },
      canCancel(){
        return this.isModified() || this.window;
      },
      /**
       * Returns true if the form can be submitted.
       *
       * @computed canSubmit
       * @return {Boolean}
       */
      canSubmit(){
        return this.isModified() || this.prefilled;
      },
      /**
       * Based on the properties 'fixedFooter' and 'fullScreen', a string is returned containing the classes for the form's template.
       *
       * @computed currentClass
       * @return {String}
       */
      currentClass(){
        let st = this.componentClass.join(' ');
        if (this.isInit) {
          if ( this.window ){
            st += ' bbn-flex-height';
          }
          else if ( (this.hasFooter || this.realButtons.length || this.footer) && this.scrollable ){
            st += ' bbn-flex-height';
          }
          if ( this.scrollable ){
            st += ' bbn-overlay';
          }
        }
        return st;
      },
      currentStyle(){
        return {};
        if (!this.isInit) {
          return {};
        }
        let floater = this.closest('bbn-floater');
        let ct = this.getRef('container');
        let ctn = ct ? ct.getRef('scrollContent') : false;
        if ( floater && ct ){
          let width = this.scrollable && ctn ? ctn.clientWidth : ct.clientWidth;
          let height = this.scrollable && ctn ? ctn.clientHeight : ct.clientHeight;
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
       * Returns an array containing the form's buttons.
       *
       * @computed realButtons
       * @return {Array}
       */
      getRealButtons(){
        let r = [];
        if ( this.buttons ){
          bbn.fn.each(this.buttons.slice(), (a) => {
            let t = typeof(a);
            if ( t === 'string' ){
              switch ( a ){
                case 'cancel':
                  r.push({
                    text: bbn._('Cancel'),
                    icon: 'nf nf-fa-times_circle',
                    action: () => {
                      this.cancel();
                    },
                    disabled: !this.canCancel
                  });
                  break;
                case 'reset':
                  r.push({
                    text: bbn._('Reset'),
                    icon: 'nf nf-fa-refresh',
                    action: () => {
                      this.reset();
                    },
                    disabled: !this.modified && !this.prefilled
                  });
                  break;
                case 'submit':
                  r.push({
                    text: bbn._('Submit'),
                    icon: 'nf nf-fa-check_circle',
                    action: () => {
                      this.submit();
                    },
                    disabled: !this.canSubmit
                  });
                  break;
              }
            }
            else if ( t === 'object' ){
              if ( (typeof a.action === 'string') && bbn.fn.isFunction(this[a.action]) ){
                a.action = this[a.action];
              }
              r.push(a);
            }
          });
        }
        return r;
      },
      /**
       * Defines the form behavior when submitted.
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
          this[this.blank || this.self || this.target ? 'post_out' : 'post'](this.action, bbn.fn.extend(true, {}, this.data || {}, this.source || {}), (d) => {
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
              if ( this.window ){
                this.window.close();
              }
            }
          }, !this.blank && !this.self && !this.target ? (xhr, textStatus, errorThrown) => {
            this.$emit('failure', xhr, textStatus, errorThrown);
              this.isLoading = false;
          } : (this.self ? '_self' : (this.blank ? '_blank' : this.target)));
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

            /** @todo Fix this */
            this.$set(this.tab.router.views[this.tab.tabNav.selected], 'unsaved', this.modified);
          }
          this.isLoading = false;
          if ( !e.defaultPrevented ){
            if ( this.window ){
              this.window.close();
            }
          }
        }
      },
      /**
       * Executes the action given to the button.
       * @method _execCommand
       */
      _execCommand(button, ev){
        if ( button.action ){
          button.action(this.source, this, ev)
        }
      },
      updateButtons(){
        if (this.realButtons.length) {
          this.realButtons.splice(0, this.realButtons.length);
        }
        this.$nextTick(() => {
          let b = this.getRealButtons();
          if ( this.window && bbn.fn.isArray(this.window.currentButtons) ){
            this.window.currentButtons.splice(0, this.window.currentButtons.length);
          }
          bbn.fn.each(b, (a) => {
            this.realButtons.push(a);
          });
          if ( this.window ){
            this.window.currentButtons = this.realButtons;
          }
        })
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
       * Based on the prop 'sendModel', either the source of the form or an object of data contained in the form's fields is returned.
       *
       * @method getData
       * @return {Object}
       */
      getData(){
        return this.source;//this.sendModel ? this.source : bbn.fn.formdata(this.$el);
      },
      /**
       * Returns true if the form has been modified or if the value of the property 'prefilled' is true.
       * @method isModified
       * @return {Boolean}
       */
      isModified(){
        if ( !bbn.fn.isSame(this.source, this.originalData) ){
          return true;
        }
        return false;
      },
      /**
       * Closes the popup containing the form.
       * @method 
       * @param {Vue} window 
       * @param {Event} ev 
       * @fires isModified
       */
      closePopup(window, ev){
        if ( this.window && this.$el ){
          if ( !this.isPosted && this.confirmLeave && this.isModified() ){
            if ( ev ){
              ev.preventDefault();
            }
            this.getPopup().confirm(this.confirmLeave, () => {
              if ( this.reset() ){
                this.$nextTick(() => {
                  if (this.window) {
                    this.window.close(true, true);
                  }
                });
              }
            });
          }
          else{
            if ( this.reset() ){
              this.$nextTick(() => {
                if (this.window) {
                  this.window.close(true, true);
                }
              });
            }
          }
        }
      },
      /**
       * Cancels the changes and closes the window containing the form.
       * @method cancel
       * @fires reset
       * @fires window.close
       */
      cancel(){
        let ev = new Event('cancel', {cancelable: true});
        this.$emit('cancel', ev, this);
        if ( !ev.defaultPrevented ){
          if ( this.window ){
            this.window.close();
          }
          else if (!bbn.fn.get_row(this.realButtons, {text: bbn._('Reset')})) {
            this.reset();
          }
        }
      },
      /**
       * Submits the form.
       * @method submit
       * @param {Boolean} force 
       * @fires validation
       * @fires _post
       * @emits submit
       */
      submit(force){
        let ok = true,
            elems = this.findAll('.bbn-input-component'),
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
          if (cf && this.window) {
            this.window.confirm(cf, () => {
              this._post();
            });
          }
        }
        if ( !cf ){
          this._post();
        }
      },
      /**
       * Resets the original data of the form.
       * @method reset 
       * return {Boolean}
       */
      reset(){
        this.isPosted = false;
        bbn.fn.iterate(this.originalData, (val, name) => {
          //if ( this.source[name] !== val ){
          if ( !bbn.fn.isSame(this.source[name], val) ){
            if (typeof val !== typeof this.source[name]) {
              this.$set(this.source, name, bbn.fn.clone(val));
            }
            else if (bbn.fn.isArray(this.source[name], val)){
              bbn.fn.each(val, (a, i) => {
                if ( this.source[name].length <= i ){
                  this.source[name].push(a);
                }
                else if ( a !== this.source[name][i] ){
                  let idx = this.source[name].indexOf(a);
                  if ( idx > i ){
                    bbn.fn.move(this.source[name], idx, i);
                  }
                  else{
                    this.source[name].splice(i, 0, a);
                  }
                }
              });
              if ( this.source[name].length > val.length ){
                this.source[name].splice(val.length, this.source[name].length - val.length);
              }
            }
            else if (bbn.fn.isObject(this.source[name], val)){
              let k1 = Object.keys(val);
              let k2 = Object.keys(this.source[name]);
              bbn.fn.each(k2, a => {
                if ( k1.indexOf(a) === -1 ){
                  delete this.source[name][a];
                }
              });
              bbn.fn.each(k1, a => {
                if (val[a] !== this.source[name][a]){
                  this.source[name][a] = val[a];
                }
              });
            }
            else{
              this.$set(this.source, name, bbn.fn.clone(val));
            }
          }
        });
        this.$forceUpdate();
        return true;
      },
      /**
       * Reinitializes the form.
       * @method reinit
       * 
       */
      reinit(){
        this.originalData = JSON.parse(JSON.stringify(this.source));
        this.modified = this.isModified();
      },
      /**
       * Initializes the form.
       * @method init 
       * 
       */
      init(){
        if ( this.$options.propsData.script ){
          this.$el.dataset.script = this.$options.propsData.script;
        }
        //this.originalData = bbn.fn.extend(true, {}, this.getData());
        this.$nextTick(() => {
          let focusable = null;
          if ( !this.window ){
            this.window = this.closest("bbn-floater");
            if ( this.window ){
              this.window.addClose(this.closePopup);
            }
          }
          this.updateButtons();
          if ( !this.tab ){
            this.tab = this.closest("bbn-container");
          }
          bbn.fn.each(this.$el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]'), (a) => {
            if (a.offsetHeight && a.offsetWidth) {
              focusable = a;
              return false;
            }
          });
          if ( focusable ){
            focusable.focus();
          }
          this.isInit = true;
        });
      },
      /**
       * @method checkValidity
       * @fires $el.checkValidity
       */
      checkValidity(){
        return this.$el.checkValidity();
      },
      /**
       * @method reportValidity
       * @fires $el.reportValidity
       */
      reportValidity() {
        return this.$el.reportValidity();
      }
    },
    /**
     * @event mounted
     * @fires init
     */
    mounted(){
      this.init();
    },
    watch: {
      /**
       * @watch schema
       */
      schema(){
        let currentSchema = [];
        this.schema.map((a) => {
          currentSchema.push(bbn.fn.extend({}, a, {id: a.id ? a.id : bbn.fn.randomString(20, 30)}))
        });
        this.currentSchema = currentSchema;
      },
      /**
       * @watch source
       */
      source: {
        deep: true,
        handler(){
          bbn.fn.log("BBN-FORM MODIFIED");
          this.modified = this.isModified();
          //this.$emit('input', newVal);
          if ( this.tab && this.tab.tabNav ){
            this.tab.tabNav.tabs[this.tab.tabNav.selected].isUnsaved = this.modified;
          }
        }
      },
      /**
       * @watch canSubmit
       */
      canSubmit(){
        this.updateButtons();
      },
      modified(v){
        let ct = this.window || this.tab;
        if (this.window) {
          if ((v && !this.window.dirty) || (!v && this.window.dirty)) {
            this.window.dirty = !this.window.dirty;
          }
        }
        if (this.tab) {
          if ((v && !this.tab.dirty) || (!v && this.tab.dirty)) {
            this.tab.dirty = !this.tab.dirty;
          }
        }
      }
    }
  });

})(bbn);
