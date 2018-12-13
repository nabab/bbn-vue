/**
 * Created by BBN on 10/02/2017.
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-browser', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      source: {}
    },
    data(){
      return {
        tabs: [{

        }]
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
      tab: {
        template: `
<div class="bbn-full-screen">
  <div class="bbn-flex-height">
    <div class="bbn-w-100">
      <div class="bbn-flex-width">
        <div class="bbn-block">
          <span v-if="ssl" class="bbn-green">
            <i class="fas fa-lock"></i>
          </span>
          <span v-else class="bbn-red">
            <i class="fas fa-unlock"></i>
          </span>
        </div>
        <div class="bbn-flex-fill">
          <bbn-input v-model="url" class="bbn-w-100" @keydown="keydown"></bbn-input>
        </div>
      </div>
    </div>
    <div class="bbn-flex-fill">
      <iframe v-if="realURL" class="bbn-full-screen" src="rawURL"></iframe>
      <div v-else class="bbn-full-screen">
        
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