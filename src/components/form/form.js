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
      blank: {
        type: Boolean,
        default: false
      },
      confirm: {
        type: [String, Function]
      },
      confirmLeave: {
        type: [Boolean, String, Function],
        default: bbn._("Are you sure you want to discard the changes you made in this form?")
      },
      action: {
        type: String,
        default: '.'
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
      buttons: {
        type: Array,
        default(){
          return ['submit', 'cancel'];
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
        realButtons: (() => {
          let r = [];
          $.each(this.buttons.slice(), (i, a) => {
            let t = typeof(a);
            if ( t === 'string' ){
              switch ( a ){
                case 'submit':
                  r.push({
                    text: bbn._('Submit'),
                    icon: 'fa fa-check-circle',
                    command: this.submit
                  });
                  break;
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
              }
            }
            else if ( t === 'object' ){
              r.push(a);
            }
          });
          return r;
        })()
      };
    },
    computed: {
      hasFooter(){
        return !!((this.$slots.footer && this.$slots.footer.length) || this.realButtons.length);
      }
    },
    methods: {
      _getPopup(){
        if ( this.window ){
          return this.window.popup;
        }
        if ( this.tab && this.tab.$refs.popup ){
          return this.tab.$refs.popup.length ? this.tab.$refs.popup[0] : this.tab.$refs.popup;
        }
        if ( this.$root.$refs.popup ){
          return this.$root.$refs.popup.length ? this.$root.$refs.popup[0] : this.$root.$refs.popup;
        }
        return false;
      },
      _post(){
        bbn.fn[this.blank ? 'post_out' : 'post'](this.action, $.extend(true, {}, this.data, this.source), (d) => {
          this.originalData = this.source;
          if ( this.tab && this.tab.tabNav ){
            this.tab.tabNav.tabs[this.tab.tabNav.selected].isUnsaved = this.isModified();
          }
          if ( this.successMessage && p ){
            p.alert(this.successMessage);
            bbn.fn.info(this.successMessage, p);
          }
          this.$emit('success', d);
          let p = this._getPopup();
          if ( p ){
            p.close();
          }
        }, (xhr, textStatus, errorThrown) => {
          this.$emit('failure', xhr, textStatus, errorThrown)
        });
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
        return this.prefilled || !bbn.fn.isSame($.extend(true, {}, this.getData(this.$el)) || {}, $.extend(true, {}, this.originalData));
      },
      closePopup(window, ev){
        if ( this.window ){
          if ( this.confirmLeave && this.isModified() ){
            if ( ev ){
              ev.preventDefault();
            }
            this.window.popup.confirm(this.confirmLeave, () => {
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
        let ok = true;
        if ( ok ){
          let elems = bbn.vue.findAll(this, '.bbn-input-component');
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
        let cf = false;
        if ( !force ){
          let ev = $.Event('submit');
          this.$emit('submit', ev, this);
          if ( ev.isDefaultPrevented() ){
            return false;
          }
        }
        if ( this.confirm ){
          if ( $.isFunction(this.confirm) ){
            cf = this.confirm(this);
          }
          else{
            cf = this.confirm;
          }
          if ( cf ){
            let popup = this._getPopup();
            if ( popup ){
              bbn.fn.info("POPUP!", popup);
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
        bbn.fn.log("reset");
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
            this.tab = bbn.vue.closest(this, ".bbn-tab");
          }
          $("input:visible:first", this.$el).focus();
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
          this.modified = this.isModified();
          if ( this.tab && this.tab.tabNav ){
            this.tab.tabNav.tabs[this.tab.tabNav.selected].isUnsaved = this.modified;
          }
        }
      }
    }
  });

})(jQuery, bbn, kendo);