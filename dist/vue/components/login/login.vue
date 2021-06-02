<template>
<div :class="['bbn-middle', componentClass]"
     :style="'background-color:' + bgColor + '; transition: opacity 3s'">
  <bbn-popup ref="popup"/>
  <div class="bbn-login-container" :style="{maxHeight: clientHeight + 'px'}">
    <div class="bbn-login-logo bbn-c bbn-block">
      <img v-if="logo" :src="logo">
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
                @success="onSubmit"
                key="form"
                :validation="validation"
                v-else
      >
        <div v-if="currentMode === 'login'"
             class="bbn-w-100">
          <div class="bbn-w-100 bbn-c bbn-vsmargin">
            <bbn-input class="bbn-c"
                      required="required"
                      buttonLeft="nf nf-fa-envelope_o"
                      :nullable="true"
                      :placeholder="_('Login name')"
                      v-model="currentFormData.user"/>
          </div>
          <div class="bbn-w-100 bbn-c">
            <bbn-input type="password"
                      class="bbn-c"
                      required="required"
                      buttonLeft="nf nf-fa-lock"
                      :nullable="true"
                      :placeholder="_('Password')"
                      v-model="currentFormData.pass"/>
          </div>
          <div class="bbn-c bbn-w-100 bbn-vsmargin bbn-flex-width">
            <bbn-button type="button"
                        @click="$refs.form.submit()"
                        :text="_('Log in')"/>
            <div class="bbn-w-100 bbn-r bbn-xs"
                 v-if="passwordLink">
              <a class="bbn-p bbn-r bbn-xs"
                  @click="currentMode = 'lost'"
                  v-text="_('Password forgotten?')"/>
            </div>
          </div>
        </div>
        <div v-else-if="currentMode === 'lost'"
             class="bbn-w-100">
          <div class="bbn-w-100 bbn-c bbn-vsmargin">
            <bbn-input style="margin-left: 10%"
                       buttonLeft="nf nf-fa-envelope_o"
                       required="required"
                       :placeholder="_('Enter your e-mail address')"
                       v-model="currentFormData.email"
            ></bbn-input>
          </div>
          <div class="bbn-c bbn-flex-width bbn-w-100">
            <bbn-button type="button"
                        class="bbn-right-sspace"
                        @click="currentMode = 'login'"
                        :text="_('Cancel')"/>
            <bbn-button type="button"
                        @click="$refs.formLost.submit()"
                        :text="_('Send')"/>
          </div>
        </div>
        <div v-else-if="currentMode === 'change'"
             class="bbn-w-100">
          <div class="bbn-w-100 bbn-c bbn-vsmargin">
            <bbn-input type="password"
                      class="bbn-c"
                      style="min-width: 20em"
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
            <bbn-input type="password"
                      class="bbn-c"
                      style="min-width: 20em"
                      required="required"
                      :title="_('Mandatory field, 8 characters minimum')"
                      :placeholder="_('Confirm your new password')"
                      :button-right="passwordVisible ? 'nf nf-fa-eye_slash' : 'nf nf-fa-eye'"
                      ref="pass1"
                      pattern=".{8,}"
                      v-model="currentFormData.pass2"
                      @clickRightButton="passwordVisible = !passwordVisible"/>
          </div>
          <div class="bbn-c bbn-vmargin bbn-flex-width">
            <bbn-button type="button"
                        @click="$refs.form.submit()"
                        :text="_('Log in')"/>
          </div>
        </div>
      </bbn-form>
    </div>
  </div>
</div>

</template>
<script>
  module.exports = /**
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
        setTimeout(() => {
          if (this.$el && this.$el.innerHTML) {
            this.$el.innerHTML = `
            <h2>`+ bbn._('Refresh the page to be able to log in or click') + ` <a class="bbn-p" onclick="window.location.reload();">` + bbn._('HERE') + `</a></h2>`;
          }
        }, 1200000); // 20 minutes
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

</script>
<style scoped>
div.bbn-login {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  height: 100%;
  overflow: auto;
}
div.bbn-login div.bbn-login-container {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  max-width: 90%;
}
div.bbn-login div.bbn-login-container .bbn-input input {
  text-align: center;
}
div.bbn-login div.bbn-login-container div.bbn-login-logo img {
  transform: scale(0.9);
  max-width: 500px;
  height: auto;
}
.bbn-mobile div.bbn-login div.bbn-login-container div.bbn-login-logo img {
  max-width: 90%;
}
.bbn-mobile.bbn-tablet div.bbn-login div.bbn-login-container div.bbn-login-logo img {
  max-width: 80%;
}
div.bbn-login div.bbn-login-container form .bbn-button:not(.bbn-input .bbn-button) {
  width: 40%;
}
.bbn-mobile div.bbn-login div.bbn-login-container .bbn-input {
  width: 90%;
}

</style>
