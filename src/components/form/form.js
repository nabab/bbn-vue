/**
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  Vue.component('bbn-form', {
    mixins: [bbn.vue.basicComponent],
    props: {
      autocomplete: {
        type: Boolean,
        default: false
      },
      prefilled: {
        type: Boolean,
        default: false
      },
      disabled: {},
      script: {},
      fields: {},
      fullScreen: {
        type: Boolean,
        default: false
      },
      blank: {
        type: Boolean,
        default: false
      },
			self: {
        type: Boolean,
        default: false
      },
      confirmMessage: {
        type: [String, Function]
      },
      confirmLeave: {
        type: [Boolean, String, Function],
        default: bbn._("Are you sure you want to discard the changes you made in this form?")
      },
      action: {
        type: String
      },
      success: {
        type: Function
      },
      failure: {
        type: Function
      },
      successMessage: {
        type: [String, Function]
      },
      failureMessage: {
        type: [String, Function]
      },
      method: {
        type: String,
        default: 'post'
      },
      scrollable: {
        type: Boolean,
        default: true
      },
      buttons: {
        type: Array,
        default(){
          return ['cancel', 'submit'];
        }
      },
      // This is the proper data used in the form
      source: {
        type: Object
      },
      // This is additional data to be sent by the form
      data: {
        type: Object
      },
      fixedFooter: {
        type: Boolean,
        default: true
      },
      // That will be a form schema generating the inputs
      schema: {
        type: Array,
        default: function(){
          return [];
        }
      },
      // Sets if it is the data property which must be sent, or the content of the named fields
      // (in this case names are not necessary on form inputs)
      sendModel: {
        type: Boolean,
        default: true
      },
      validation: {
        type: Function
      }
    },
    data(){
      return {
        modified: false,
        popup: false,
        popupIndex: false,
        tab: false,
        originalData: {},
        isPosted: false
      };
    },
    computed: {
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
                  command: this.reset
                });
                break;
              case 'submit':
                r.push({
                  text: bbn._('Submit'),
                  icon: 'fa fa-check-circle',
                  command: this.submit
                });
                break;
            }
          }
          else if ( t === 'object' ){
            r.push(a);
          }
        });
        return r;
      },
      hasFooter(){
        return this.$slots.footer && this.$slots.footer.length;
      },
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
      _post(){
        this.isPosted = true;
        if ( this.action ){
          bbn.fn[this.blank || this.self ? 'post_out' : 'post'](this.action, $.extend(true, {}, this.data, this.source), (d) => {
            this.originalData = $.extend(true, {}, this.source);
            if ( this.successMessage && p ){
              p.alert(this.successMessage);
              bbn.fn.info(this.successMessage, p);
            }
            let e = new $.Event('success');
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
          let e = new $.Event('success');
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
      _execCommand(button, ev){
        if ( button.command ){
          button.command(this.source, this, ev)
        }
      },
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
        let ev = $.Event();
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
      }
    },
    mounted(){
      this.init();
    },
    watch: {
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