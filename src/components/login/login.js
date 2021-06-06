/**
 * @file bbn-login component
 *
 * @description The bbn-login component
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 31/05/2021
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-login', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent 
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      /**
       * The background color
       * @prop {String} [''] bgColor
       */
      bgColor: {
        type: String,
        default: 'transparent'
      },
      /**
       * The size of the font. Allowed values are 's', 'm', 'l', 'xl'
       * @prop {String} ['s'] fontSize
       */
      fontSize: {
        type: String,
        default: 's'
      },
      logo: {
        type: String
      },
      url: {
        type: String,
        default: ''
      },
      loginUrl: {
        type: String
      },
      lostUrl: {
        type: String
      },
      changeUrl: {
        type: String
      },
      mode: {
        type: String,
        required: true,
        validator: m => ['login', 'lost', 'change', 'invalid'].includes(m)
      },
      expires: {
        type: Number,
        default: 1200000
      },
      salt: {
        type: String,
        default: ''
      },
      secureId: {
        type: String,
        default: ''
      },
      secureKey: {
        type: String,
        default: ''
      },
      actionName: {
        type: String,
        default: 'appui_action'
      },
      saltName: {
        type: String,
        default: 'appui_salt'
      },
      passwordLink: {
        type: [Boolean, String],
        default: bbn._("Password forgotten?")
      }
    },
    data(){
      return{
        currentMode: this.mode,
        formData: {},
        passwordVisible: false,
        hasExpired: false,
        clientHeight: document.documentElement.clientHeight
      }
    },
    computed: {
      currentFormData(){
        return this.formData[this.currentMode] || {};
      },
      currentUrl(){
        return this[this.currentMode + 'Url'] || this.url;
      }
    },
    methods: {
      onSubmit(d){
        if ( d == 1 ){
          window.document.location.href = bbn.env.path;
        }
        else if (d.success){
          if (this.currentMode === 'lost') {
            this.alert(bbn._('An email has been sent to') + ' ' + this.currentFormData.email, bbn._('Info'));
            this.currentMode = 'login';
          }
          else if (this.currentMode === 'change') {
            this.alert(bbn._('Your password has been changed'), bbn._('Info'));
            this.currentMode = 'login';
          }
        }
        else {
          this.alert(d.errorMessage, bbn.lng.error);
        }
      },
      setHeight(){
        this.clientHeight = document.documentElement.clientHeight;
      },
      resetForm(){
        this.$set(this, 'formData', {
          login: {
            [this.saltName]: this.salt,
            user: '',
            pass: ''
          },
          lost: {
            email: ''
          },
          change: {
            [this.actionName]: 'init_password',
            id: this.secureId,
            key: this.secureKey,
            pass1: '',
            pass2: ''
          }
        });
      },
      validation(){
        if (!this.currentUrl || !this.currentUrl.length) {
          return false;
        }
        switch (this.currentMode) {
          case 'change':
            if (!this.currentFormData.pass1.length
              || !this.currentFormData.pass2.length
              || (this.currentFormData.pass1 !== this.currentFormData.pass2)) {
                this.alert(bbn._('Passwords must match!'));
                return false;
              }
          default:
            return true;
        }
      },
      reload(){
        window.location.reload();
      }
    },
    mounted(){
      this.resetForm();
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$el && this.$el.style) {
            this.$el.style.opacity = '1';
            bbn.fn.each(this.$el.querySelectorAll("input"), (element, i) => {
              if ( (element.style.visibility === 'visible') ){
                element.focus();
                return false;
              }
            });
          }
        }, 1000);
        if (this.expires) {
          if (this.expires > 300000) {
            setTimeout(() => {
              this.alert(bbn._("This login form will expire in 5 minutes"));
            }, this.expires - 300000);
          }
          setTimeout(() => {
            if (this.$el && this.$el.innerHTML) {
              this.hasExpired = true;
            }
          }, this.expires);
        }
      });
      window.addEventListener('resize', this.setHeight);
    },
    beforeDestroy(){
      window.removeEventListener('resize', this.setHeight);
    },
    watch: {
      mode(val){
        this.currentMode = val;
      },
      currentMode(){
        this.resetForm();
      }
    }
  });

})(bbn);
