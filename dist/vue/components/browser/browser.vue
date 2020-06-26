<template>
<div :class="[componentClass, 'bbn-overlay', 'bbn-flex-height']">
  <div class="bbn-w-100">
    <bbn-input class="bbn-w-100"></bbn-input>
  </div>
  <div class="bbn-flex-fill">
    <bbn-tabnav :autoload="false" :source="tabs"></bbn-tabnav>
  </div>
</div>

</template>
<script>
  module.exports = /**
 * @file bbn-browser component
 * @description bbn-browser
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @ignore
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-browser', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
     /**
      * The object source of component bbn-browser.
      * @prop {Object} Source
      */
      source: {}
    },
    data(){
      return {
       /**
        * @prop {Array} [[]] tabs
        */
        tabs: []
      }
    },
    computed: {
      /**
       * Return if the button is disabled.
       *
       * @computed isDisabled
       * @return {Boolean}
       */
      isDisabled(){
        return typeof(this.disabled) === 'function' ?
          this.disabled() : this.disabled
      }
    },
    methods: {
      /**
       * The role of the button when clicked.
       *
       * @method click
       * @emit click
       */
      click(e){
        if ( this.url ){
          bbn.fn.link(this.url);
        }
        else{
          this.$emit('click', e);
        }
      }
    },
    components: {
     /**
      * @component tab
      */
      tab: {
        template: `
<div class="bbn-overlay">
  <div class="bbn-flex-height">
    <div class="bbn-w-100">
      <div class="bbn-flex-width">
        <div class="bbn-block">
          <span v-if="ssl" class="bbn-green">
            <i class="nf nf-fa-lock"></i>
          </span>
          <span v-else class="bbn-red">
            <i class="nf nf-fa-unlock"></i>
          </span>
        </div>
        <div class="bbn-flex-fill">
          <bbn-input v-model="url" class="bbn-w-100" @keydown="keydown"></bbn-input>
        </div>
      </div>
    </div>
    <div class="bbn-flex-fill">
      <iframe v-if="realURL" class="bbn-overlay" src="rawURL"></iframe>
      <div v-else class="bbn-overlay">

      </div>
    </div>
  </div>
</div>
        `,
        data(){
          return {
            ssl: false,
            url: 'home',
            rawURL: null,
            realURL: null
          }
        },
        methods: {
          keydown(e){
            bbn.fn.log(e)
          }
        }
      }
    }
  });

})(bbn);

</script>
<style scoped>
@-webkit-keyframes bbn-button-glowing-red {
  0% {
    background-color: #B20000;
    -webkit-box-shadow: 0 0 3px #B20000;
  }
  50% {
    background-color: #FF0000;
    -webkit-box-shadow: 0 0 40px #FF0000;
  }
  100% {
    background-color: #B20000;
    -webkit-box-shadow: 0 0 3px #B20000;
  }
}
@-moz-keyframes bbn-button-glowing-red {
  0% {
    background-color: #B20000;
    -moz-box-shadow: 0 0 3px #B20000;
  }
  50% {
    background-color: #FF0000;
    -moz-box-shadow: 0 0 40px #FF0000;
  }
  100% {
    background-color: #B20000;
    -moz-box-shadow: 0 0 3px #B20000;
  }
}
@-o-keyframes bbn-button-glowing-red {
  0% {
    background-color: #B20000;
    box-shadow: 0 0 3px #B20000;
  }
  50% {
    background-color: #FF0000;
    box-shadow: 0 0 40px #FF0000;
  }
  100% {
    background-color: #B20000;
    box-shadow: 0 0 3px #B20000;
  }
}
@keyframes bbn-button-glowing-red {
  0% {
    background-color: #B20000;
    box-shadow: 0 0 3px #B20000;
  }
  50% {
    background-color: #FF0000;
    box-shadow: 0 0 40px #FF0000;
  }
  100% {
    background-color: #B20000;
    box-shadow: 0 0 3px #B20000;
  }
}
.bbn-button {
  margin-right: 0.25em;
}
.bbn-button span {
  vertical-align: bottom;
}

</style>
