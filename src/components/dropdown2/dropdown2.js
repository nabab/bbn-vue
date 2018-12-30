/**
 * bbn-dropdown component
 *
 * Created by BBN on 10/02/2017.
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-dropdown2', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.dataSourceComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.dataSourceComponent, bbn.vue.urlComponent],
    props: {
    /**
     * State the type of filter, the allowed values are 'contains', 'startswith' and 'endswith'.
     *
     * @prop {String} [startswith] filterValue
     */
      filterValue: {},
      /**
       * The template to costumize the dropdown menu.
       *
       * @prop {} template
       */
      template: {},
      /**
       * @todo description
       *
       * @prop {} valueTemplate
       */
      valueTemplate: {},
      /**
       * Define the groups for the dropdown menu.
       * @prop {String} group
       */
      group: {
        type: String
      },
      /**
       * The placeholder of the dropdown.
       *
       * @prop {String} placeholder
       */
      placeholder: {
        type: String
      },
    },
    data(){
      return {
        items: this.source ? this.source.slice() : [],
        isOpened: false
      };
    },
    methods: {
      /**
       * States the role of the enter button on the dropdown menu.
       *
       * @method _pressEnter
       * @fires widget.select
       * @fires widget.open
       *
       */
      _pressEnter(){
        if ( this.isOpened ){
          this.widget.select();
        }
        else{
          this.widget.open();
        }
      },
    },
    mounted(){
      /**
       * @todo description
       *
       * @event mounted
       * @fires getOptions
       * @return {Boolean}
       */
      if ( this.baseUrl && (bbn.env.path.indexOf(this.baseUrl) === 0) && (bbn.env.path.length > this.baseUrl.length) ){
        let val = bbn.env.path.substr(this.baseUrl.length+1);
        let idx = bbn.fn.search(cfg.dataSource, this.sourceValue, val);
        if ( idx > -1 ){
          this.widget.select(idx);
          this.widget.trigger("change");
        }
      }
      this.ready = true;

    },
    watch: {
      isOpened(n){
        if ( n ){
          let vlist = this.$root.vlist || (window.appui ? window.appui.vlist : undefined);
          if ( this.items.length && (vlist !== undefined) ){
            let pos = this.$el.getBoundingClientRect();
            bbn.fn.log("POS", pos, pos.x + Math.round(pos.width), pos.y + Math.round(pos.height));
            vlist.push({
              items: this.items,
              right: bbn.env.width - (pos.x + Math.round(pos.width)),
              top: pos.y + Math.round(pos.height)
            });
          }
        }
      },
      /**
       * @watch source
       * @fires setDataSource
       */
      source: {
        deep: true,
        handler(){
          this.items = this.source.slice()
        }
      },
      value(){
        this.updateUrl();
      }
    }
  });

})(bbn);
