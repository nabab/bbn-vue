/**
 * @file bbn-notification component
 *
 * @description bbn-notification is a component that allows the display of a brief information message, for example to confirm the success of an action that has taken place.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 11/01/2017
 */
((bbn) => {
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-notification', {
    mixins: [bbn.vue.basicComponent],
    props: {
      delay: {
        type: Number,
        default: 5000
      },
      pinned: {},
      position: {
        type: String,
        default: 'bottom-left'
      },
      successMessage: {
        type: [String, Function],
        default: bbn._('Success')
      },
      warningMessage: {
        type: [String, Function],
        default: bbn._('Warning')
      },
      errorMessage: {
        type: [String, Function],
        default: bbn._('Error')
      }
    },
    data: function(){
      let bits = this.position.split('-');
      let pos = {
        v: {
          top: false,
          bottom: true
        },
        h: {
          left: false,
          right: true
        }
      };
      bbn.fn.each(bits, (bit) => {
        bbn.fn.iterate(pos, (o, dir) => {
          if ( o[bit.toLowerCase()] ){
            bbn.fn.iterate(o, (b, k) => {
              if ( bit === k ){
                pos[dir][k] = true;
              }
              else{
                pos[dir][k] = false;
              }
            });
          }
        });
      });
      return {
        items: [],
        isTop: pos.v.top,
        isLeft: pos.h.left,
        positions: {}
      };
    },
    methods: {
      _sanitize(obj, type, timeout){
        if ( typeof obj === 'string' ){
          obj = {content: obj};
        }
        else if ( !obj ){
          obj = {};
        }
        obj.type = type;
        if ( !obj.type ){
          obj.type = 'info';
        }
        if ( !obj.content && this[type + 'Message'] ){
          obj.content = bbn.fn.isFunction(this[type + 'Message']) ? this[type + 'Message'](obj) : this[type + 'Message']
        }
        if ( !obj.content ){
          obj.content = '';
        }
        if ( timeout && !obj.delay ){
          obj.delay = timeout > 500 ? timeout : timeout * 1000;
        }
        else{
          obj.pinned = true;
        }
      return obj;
      },
      add(o){
        let id = (new Date()).getTime();
        o.id = id;
        this.items.push(o);
        if ( o.delay ){
          setTimeout(() => {
            let idx = bbn.fn.search(this.items, {id: id});
            if ( idx > -1 ){
              this.items.splice(idx, 1);
            }
          }, o.delay);
        }
      },
      _updatePositions(){
        let p = {};
        let top = 0;
        bbn.fn.each(this.items, (a) => {
          p[a.id] = top;
          let cp = this.getRef('it' + a.id);
          if (cp) {
            top += cp.$el.getBoundingClientRect().height;
          }
        });
        bbn.fn.iterate(bbn.fn.diffObj(this.positions, p), (a, k) => {
          let v = undefined;
          if (a.type === 'updated') {
            v = a.newData;
          }
          else if (a.type === 'created') {
            v = a.data;
          }
          this.$set(this.positions, k, v);
          let cp = this.getRef('it' + k);
          if (cp) {
            setTimeout(() => {
              cp.onResize(true);
            }, 100);
          }
        });
      },
      close(id){
        let idx = bbn.fn.search(this.items, {id: id});
        if ( idx > -1 ){
          this.items.splice(idx, 1);
        }
      },
      success(o, timeout){
        if ( !timeout ){
          timeout = this.delay;
        }
        o = this._sanitize(o, 'success', timeout);
        this.add(o);
      },
      error(o, timeout){
        o = this._sanitize(o, 'error', timeout);
        this.add(o);
      },
      warning(o, timeout){
        o = this._sanitize(o, 'warning', timeout);
        this.add(o);
      },
      show(o, type, timeout){
        o = this._sanitize(o, type, timeout);
        this.add(o);
      },
      info(o, timeout){
        o = this._sanitize(o, 'info', timeout);
        this.add(o);
      },
    },
    beforeMount(){
      this._updatePositions();
    },
    watch: {
      items(){
        this.$nextTick(() => {
          this._updatePositions();
        });
      }
    }
  });
})(window.bbn);
