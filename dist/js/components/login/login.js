(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="['bbn-overlay', 'bbn-middle', componentClass]"
     :style="'background-color:' + bgColor + '; transition: opacity 3s'">
  <bbn-popup ref="popup"
             v-if="!popup"
            :top="0"
            :bottom="0"
            :left="0"
            :right="0"/>
  <h2 v-if="hasExpired">
    <span class="bbn-nowrap" v-text="_('Refresh the page')"/>
    <span class="bbn-nowrap" v-text="_('to be able to log in')"/>
    <span class="bbn-nowrap">
      <span v-text="_('or click')"/>
      <a class="bbn-p bbn-u"
         style="color: inherit"
         href="javascript:;"
         @click="reload"
         v-text="_('here')"/>
    </span>
  </h2>
  <div v-else
       class="bbn-login-container"
       :style="{maxHeight: clientHeight + 'px'}">
    <div class="bbn-login-logo bbn-c bbn-block">
      <div v-if="isLogoTag"
                v-html="logo"></div>
      <img v-else-if="logo" :src="logo">
    </div>
    <div class="bbn-vlmargin bbn-block bbn-c">
      <div v-if="currentMode === 'invalid'"
            class="bbn-block">
        <h3 class="bbn-c"
            v-text="_('The link is not valid')"/>
        <h3>
          <a href="javascript:;"
             class="bbn-no"
             @click="currentMode = 'login'"
             v-text="_('Back to the login page')"/>
        </h3>
      </div>
      <bbn-form :action="currentUrl"
                :source="currentFormData"
                :data="{mode: currentMode}"
                :buttons="[]"
                :scrollable="false"
                :fixed-footer="false"
                ref="form"
                @submit="onSubmit"
                @success="onAfterSubmit"
                key="form"
                :validation="validation"
                v-else
      >
        <div v-if="currentMode === 'login'"
             class="bbn-w-100">
          <div class="bbn-w-100 bbn-c bbn-vsmargin">
            <bbn-input class="bbn-c bbn-w-100"
                      required="required"
                      button-left="nf nf-fa-envelope_o"
                      :nullable="true"
                      :placeholder="loginFieldPlaceholder"
                      v-model="currentFormData.user"/>
          </div>
          <div class="bbn-w-100 bbn-c">
            <bbn-input type="password"
                       class="bbn-c bbn-w-100"
                       required="required"
                       button-left="nf nf-fa-lock"
                       :nullable="true"
                       :placeholder="passwordFieldPlaceholder"
                       v-model="currentFormData.pass"/>
          </div>
          <div class="bbn-c bbn-w-100 bbn-vsmargin bbn-flex-width">
            <bbn-button type="button"
                        @click="$refs.form.submit()"
                        :text="_('Log in')"/>
            <div :class="['bbn-w-100', 'bbn-r', currentFontSizeClass]"
                 v-if="passwordLink">
              <a class="bbn-p"
                 @click="currentMode = 'lost'"
                 v-text="passwordLink"/>
            </div>
          </div>
        </div>
        <div v-else-if="currentMode === 'lost'"
             class="bbn-w-100">
          <div class="bbn-w-100 bbn-c bbn-vsmargin">
            <bbn-input button-left="nf nf-fa-envelope_o"
                       class="bbn-w-100"
                       required="required"
                       :placeholder="_('Enter your e-mail address')"
                       v-model="currentFormData.email"
            ></bbn-input>
          </div>
          <div class="bbn-c bbn-w-100">
            <bbn-button type="button"
                        class="bbn-right-sspace"
                        @click="currentMode = 'login'"
                        :text="_('Cancel')"/>
            <bbn-button type="button"
                        @click="$refs.form.submit()"
                        :text="_('Send')"/>
          </div>
        </div>
        <div v-else-if="currentMode === 'change'"
             class="bbn-w-100">
          <div class="bbn-w-100 bbn-c bbn-vsmargin">
            <bbn-input :type="!!passwordVisible ? 'text' : 'password'"
                      class="bbn-c bbn-w-100"
                      style="min-width: 20rem"
                      required="required"
                      :title="_('Mandatory field, 8 characters minimum')"
                      :placeholder="_('Choose your new password')"
                      :button-right="passwordVisible ? 'nf nf-fa-eye_slash' : 'nf nf-fa-eye'"
                      ref="pass1"
                      pattern=".{8,}"
                      v-model="currentFormData.pass1"
                      @clickRightButton="passwordVisible = !passwordVisible"/>
          </div>
          <div class="bbn-c bbn-w-100 bbn-vsmargin">
            <bbn-input :type="!!passwordVisible ? 'text' : 'password'"
                      class="bbn-c bbn-w-100"
                      style="min-width: 20rem"
                      required="required"
                      :title="_('Mandatory field, 8 characters minimum')"
                      :placeholder="_('Confirm your new password')"
                      :button-right="passwordVisible ? 'nf nf-fa-eye_slash' : 'nf nf-fa-eye'"
                      ref="pass1"
                      pattern=".{8,}"
                      v-model="currentFormData.pass2"
                      @clickRightButton="passwordVisible = !passwordVisible"/>
          </div>
          <div v-if="note"
               class="bbn-s bbn-i"
               v-text="note"/>
          <div class="bbn-c bbn-vmargin bbn-flex-width bbn-w-100">
            <bbn-button type="button"
                        @click="$refs.form.submit()"
                        :text="_('Send')"/>
          </div>
        </div>
      </bbn-form>
    </div>
  </div>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-login');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/login/login.css');
document.head.insertAdjacentElement('beforeend', css);

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
            this.alert(bbn._('An email has been sent to %s', this.currentFormData.email), false);
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
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}