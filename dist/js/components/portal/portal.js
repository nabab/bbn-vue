(bbn_resolve) => {
((bbn) => {
/**
 * @file bbn.vue implementation of https://github.com/LinusBorg/vue-simple-portal.
 * @created 10/10/2021
 */

/* jshint esversion: 6 */

(function(bbn){
  "use strict";

  // This alphabet uses `A-Za-z0-9_-` symbols. The genetic algorithm helped
  // optimize the gzip compression for this alphabet.
  let urlAlphabet =
    'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';

  let nanoid = (size = 21) => {
    let id = '';
    // A compact alternative for `for (var i = 0; i < step; i++)`.
    let i = size;
    while (i--) {
      // `| 0` is more compact and faster than `Math.floor()`.
      id += urlAlphabet[(Math.random() * 64) | 0];
    }
    return id
  };

  var config = {
    selector: "bbn-portal-target-".concat(nanoid())
  };

  var TargetContainer = Vue.extend({
    // as an abstract component, it doesn't appear in
    // the $parent chain of components.
    // which means the next parent of any component rendered inside of this oen
    // will be the parent from which is was sent
    // @ts-expect-error
    abstract: true,
    name: 'PortalOutlet',
    props: ['nodes', 'tag'],
    data: vm => ({
      updatedNodes: vm.nodes,
    }),
    render(h) {
      const nodes = this.updatedNodes && this.updatedNodes();
      if (!nodes) {
        return h();
      }

      return nodes.length === 1 && !nodes[0].text
        ? nodes
        : h(this.tag || 'DIV', nodes);
    },
    destroyed() {
      const { $el: el } = this;
      el && el.parentNode && el.parentNode.removeChild(el);
    },
  });

  Vue.component('bbn-portal', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * @prop {Boolean} disabled
       */
      disabled: {
        type: Boolean,
      },
      /**
       * @prop {Boolean} prepend
       */
      prepend: {
        type: Boolean,
      },
      /**
       * @prop {String} [''] selector
       */
      selector: {
        type: String,
        default: () => `#${config.selector}`,
      },
      /**
       * @prop {String} ['div'] tag
       */
      tag: {
        type: String,
        default: 'DIV',
      },
    },
    render(h) {
      if (this.disabled) {
        const nodes = this.$scopedSlots && this.$scopedSlots.default()
        if (!nodes) {
          return h();
        }

        return nodes.length < 2 && !nodes[0].text ? nodes : h(this.tag, nodes);
      }

      return h();
    },
    created() {
      if (!this.getTargetEl()) {
        this.insertTargetEl()
      }
    },
    updated() {
      // We only update the target container component
      // if the scoped slot function is a fresh one
      // The new slot syntax (since Vue 2.6) can cache unchanged slot functions
      // and we want to respect that here.
      this.$nextTick(() => {
        if (!this.disabled && this.slotFn !== this.$scopedSlots.default) {
          this.container.updatedNodes = this.$scopedSlots.default;
        }
        this.slotFn = this.$scopedSlots.default;
      })
    },
    beforeDestroy() {
      this.unmount()
    },
    watch: {
      disabled: {
        immediate: true,
        handler(disabled) {
          disabled ? this.unmount() : this.$nextTick(this.mount)
        },
      },
    },
    methods: {
      // This returns the element into which the content should be mounted.
      getTargetEl() {
        return document.querySelector(this.selector)
      },
      insertTargetEl() {
        const parent = document.querySelector('body');
        const child = document.createElement(this.tag);
        child.id = this.selector.substring(1);
        parent.appendChild(child);
      },
      mount() {
        const targetEl = this.getTargetEl();
        const el = document.createElement('DIV');
        if (this.prepend && targetEl.firstChild) {
          targetEl.insertBefore(el, targetEl.firstChild);
        }
        else {
          targetEl.appendChild(el);
        }
  
        this.container = new TargetContainer({
          el,
          parent: this,
          propsData: {
            tag: this.tag,
            nodes: this.$scopedSlots.default,
          },
        });
      },
      unmount() {
        if (this.container) {
          this.container.$destroy();
          delete this.container;
        }
      },
    },
  });
})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}