/**
 * @file bbn-login component
 * @description The bbn-login component
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 31/05/2021
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.resizer
     * @mixin bbn.wc.mixins.popup
     */
    mixins: [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.resizer,
      bbn.wc.mixins.popup
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
       * The size of the font. Allowed values are 'xs', 's', 'm', 'l', 'xl'
       * @prop {String} ['xs'] fontSize
       */
      fontSize: {
        type: String,
        default: 'xs'
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
      /**
       * @prop {String} ['Login name'] loginFieldPlaceholder
       */
      loginFieldPlaceholder: {
        type: String,
        default: bbn._('Login name')
      },
      /**
       * @prop {String} ['Password'] passwordFieldPlaceholder
       */
       passwordFieldPlaceholder: {
        type: String,
        default: bbn._('Password')
      },
      /**
       * @prop {String} note
       */
      note: {
        type: String
      }
    },
    data(){
      return{
        /**
         * @data {String} currentMode
         */
        currentMode: this.mode,
        /**
         * @data {Object} [{}] formData
         */
        formData: {},
        /**
         * @data {Boolean} [false] passwordVisible
         */
        passwordVisible: false,
        /**
         * @data {Boolean} [false] hasExpired
         */
        hasExpired: false,
        /**
         * @data {Number} clientHeight
         */
        clientHeight: document.documentElement.clientHeight
      }
    },
    computed: {
      /**
       * @computed isLogoTag
       * @return {Boolean}
       */
      isLogoTag(){
        return this.logo && (this.logo.trim().substr(0, 1) === '<');
      },
      /**
       * @computed currentFormData
       * @return {Object}
       */
      currentFormData(){
        return this.formData[this.currentMode] || {};
      },
      /**
       * @computed currentUrl
       * @return {String}
       */
      currentUrl(){
        return this[this.currentMode + 'Url'] || this.url;
      },
      /**
       * @computed currentFontSizeClass
       * @return {String}
       */
      currentFontSizeClass(){
        return `bbn-${this.fontSize === 'l' ? 'lg' : this.fontSize}`;
      }
    },
    methods: {
      /**
       * @method onSubmit
       * @param {Event} ev
       * @param {Vue} form
       * @emit submit
       */
       onSubmit(ev, form){
        this.$emit('submit', ev, form);
       },
      /**
       * @method onAfterSubmit
       * @param d
       * @fires alert
       * @emit aftersubmit
       */
      onAfterSubmit(d){
        let ev = new Event('aftersubmit', {cancelable: true});
        this.$emit('aftersubmit', ev, d, this.currentMode, this);
        if (ev.defaultPrevented) {
          return;
        }
        if (d == 1) {
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
      /**
       * @method setHeight
       */
      setHeight(){
        this.clientHeight = document.documentElement.clientHeight;
      },
      /**
       * @method resetForm
       * @fires $set
       */
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
      /**
       * @method validation
       * @fires alert
       * @return {Boolean}
       */
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
      /**
       * @method reload
       */
      reload(){
        window.location.reload();
      }
    },
    /**
     * @event mounted
     * @fires resetForm
     * @fires $nextTick
     * @fires alert
     */
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
    /**
     * @event beforeDestroy
     */
    beforeDestroy(){
      window.removeEventListener('resize', this.setHeight);
    },
    watch: {
      /**
       * @watch mode
       * @param {String} val
       */
      mode(val){
        this.currentMode = val;
      },
      /**
       * @watch currentMode
       * @fires resetForm
       */
      currentMode(){
        this.resetForm();
      }
    }
  };
