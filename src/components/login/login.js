/**
 * @file bbn-login component
 * @description The bbn-login component
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 31/05/2021
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-login', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.popupComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.resizerComponent,
      bbn.vue.popupComponent
    ],
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
      /**
       * @prop {String} logo
       */
      logo: {
        type: String
      },
      /**
       * @prop {String} [''] url
       */
      url: {
        type: String,
        default: ''
      },
      /**
       * @prop {String} loginUrl
       */
      loginUrl: {
        type: String
      },
      /**
       * @prop {String} lostUrl
       */
      lostUrl: {
        type: String
      },
      /**
       * @prop {String} changeUrl
       */
      changeUrl: {
        type: String
      },
      /**
       * @prop {String} mode
       */
      mode: {
        type: String,
        required: true,
        validator: m => ['login', 'lost', 'change', 'invalid'].includes(m)
      },
      /**
       * @prop {Number} [1200000] expires
       */
      expires: {
        type: Number,
        default: 1200000
      },
      /**
       * @prop {String} [''] salt
       */
      salt: {
        type: String,
        default: ''
      },
      /**
       * @prop {String} [''] secureId
       */
      secureId: {
        type: String,
        default: ''
      },
      /**
       * @prop {String} [''] secureKey
       */
      secureKey: {
        type: String,
        default: ''
      },
      /**
       * @prop {String} ['appui_action'] actionName
       */
      actionName: {
        type: String,
        default: 'appui_action'
      },
      /**
       * @prop {String} ['appui_salt'] saltName
       */
      saltName: {
        type: String,
        default: 'appui_salt'
      },
      /**
       * @prop {(Boolean|String)} ['Password forgotten?'] passwordLink
       */
      passwordLink: {
        type: [Boolean, String],
        default: bbn._("Password forgotten?")
      },

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
      isLogoTag(){
        return this.logo && (this.logo.trim().substr(0, 1) === '<');
      },
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
            this.alert(bbn._('An email has been sent to') + ' ' + this.currentFormData.email, false);
            this.currentMode = 'login';
          }
          else if (this.currentMode === 'change') {
            //this.alert(bbn._('Your password has been changed'), false);
            //this.currentMode = 'login';
            this.alert(bbn._('Your password has been changed'), false, () => {}, () => {
              window.document.location.href = bbn.env.root;
            });
          }
        }
        else {
          this.alert(d.errorMessage, false);
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
                this.alert(bbn._('Passwords must match!'), false);
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
