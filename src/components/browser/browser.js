/**
 * @file bbn-browser component
 * @description bbn-browser
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @ignore
 */
return {
    /**
     * @mixin bbn.wc.mixins.basic
     */
    mixins: [bbn.wc.mixins.basic],
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
            /**
             * @data {Boolean} [false] ssl
             */
            ssl: false,
            /**
             * @data {String} ['home'] url
             */
            url: 'home',
            /**
             * @data {String} [null] rawURL
             */
            rawURL: null,
            /**
             * @data {String} [null] realURL
             */
            realURL: null
          }
        },
        methods: {
          /**
           * @method keydown
           * @param e
           */
          keydown(e){
            bbn.fn.log(e)
          }
        }
      }
    }
  };
