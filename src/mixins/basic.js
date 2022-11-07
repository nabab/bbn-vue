(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Basic Component.
     *
     * @component basicComponent
     */
    basicComponent: {
      data(){
        bbn.vue.uid++;
        let o = {
          /**
           * The change of value of this prop to true emits the event 'ready'.
           * @data {Boolean} [false] ready
           * @memberof basicComponent
           */
          ready: false,
          /**
           * Each basic component will have a unique UID.
           * @data {Number} uid
           * @memberof basicComponent
           */
          bbnUid: bbn.vue.uid,
          /**
           * The classes added to the component.
           * @data {Array} [['bbn-basic-component']] componentClass
           * @memberof basicComponent
           */
          componentClass: ['bbn-basic-component'],
          /**
           * Indicates if we're on a mobile device.
           * @data {Boolean} isMobile
           * @memberof basicComponent
           */
          isMobile: bbn.fn.isMobile(),
          /**
           * Indicates if we're on a tablet device.
           * @data {Boolean} isTablet
           * @memberof basicComponent
           */
          isTablet: bbn.fn.isTabletDevice()
        };
        if (this.$options.name && bbn.vue.defaults[this.$options.name.slice(4)]) {
          bbn.fn.extend(o, bbn.vue.defaults[this.$options.name.slice(4)]);
        }
        return o;
      },
      methods: {
        /**
         * Creates a HTML string for recreating the component.
         * @method exportComponent
         * @memberof basicComponent
         * @param  {Boolean}   full 
         * @param  {Number}    level 
         */
        exportComponent(full, level){
          let lv = level || 0;
          let st = bbn.fn.repeat('  ', lv) + '<' + this.$options._componentTag;
          bbn.fn.iterate(this.$options.propsData, (a, n) => {
            if (n === 'value') {
              st += ' v-model=""';
            }
            else if ( !bbn.fn.isFunction(a) && !bbn.fn.isObject(a) && !bbn.fn.isArray(a) ){
              st += ' ';
              if (typeof(a) !== 'string') {
                st += ':';
              }
              st += bbn.fn.camelToCss(n) + '=' + '"' + a + '"';
            }
          });
          st += '>' + "\n";
          if (full) {
            bbn.fn.each(this.$children, a => {
              if ( a.exportComponent !== undefined ){
                st += a.exportComponent(true, lv+1);
              }
            });
          }
          st += bbn.fn.repeat('  ', lv) + '</' + this.$options._componentTag + '>' + "\n";
          return st;
        }
      },
      /**
       * If not defined, defines component's template
       * @memberof basicComponent
       * @event beforeCreate
       */
      beforeCreate(){
        if ( !this.$options.render && !this.$options.template && this.$options.name ){
          this.$options.template = '#bbn-tpl-component-' + (this.$options.name.indexOf('bbn-') === 0 ? this.$options.name.slice(4) : this.$options.name);
        }
      },
      /**
       * Gives to the component the class bbn-basic-component
       * @event created
       * @memberof basicComponent
       */
      created(){
        if (this.$options.name && !this.componentClass.includes(this.$options.name)){
          this.componentClass.push(this.$options.name);
        }
      },
      watch: {
        /**
         * Emits the event 'ready' when the value is true.
         * @watch ready
         * @emit ready
         * @memberof basicComponent
         */
        ready(newVal){
          if ( newVal ){
            let ev = new CustomEvent('subready', {bubbles: true, detail: {cp: this}});
            this.$el.dispatchEvent(ev);
            bbn.fn.log("EMITTING READY")
            this.$emit('ready', this);
          }
        }
      }
    }
  });
})(bbn);