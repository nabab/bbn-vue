/**
 * @file bbn.vue implementation of https://github.com/LinusBorg/vue-simple-portal.
 * @created 10/10/2021
 */

/* jshint esversion: 6 */

(function(bbn){
  "use strict";

  let config = {
    selector: "bbn-portal-target-" + bbn.fn.randomString(20, 30)
  };

  let TargetContainer = Vue.extend({
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
      bbn.fn.log("DESTROYING PORTAL TARGET", this);
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
        type: [HTMLElement, String],
        default() {
          return document.body;
        }
      },
      /**
       * @prop {String} ['div'] tag
       */
      tag: {
        type: String,
        default: 'DIV',
      },
    },
    data() {
      return {
        target: null,
        randomId: bbn.fn.randomString(20, 30)
      }
    },
    render(h) {
      if (this.disabled) {
        const nodes = this.$scopedSlots && bbn.fn.isFunction(this.$scopedSlots.default) && this.$scopedSlots.default();
        if (nodes) {
          return nodes.length < 2 && !nodes[0].text ? nodes : h(this.tag, nodes);
        }
      }

      return h();
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
      element: {
        immediate: true,
        handler() {
          if (!this.disabled) {
            this.$nextTick(this.mount)
          }
        },
      },
    },
    methods: {
      // This returns the element into which the content should be mounted.
      getTargetEl() {
        return bbn.fn.isString(this.selector) ? document.querySelector(this.selector) : this.selector;
      },
      mount() {
        bbn.fn.log("MOUNT PORTAL");
        const target = this.getTargetEl();
        const el = document.createElement('DIV');
        if (this.prepend && target.firstChild) {
          target.insertBefore(el, target.firstChild);
        }
        else {
          target.appendChild(el);
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
        bbn.fn.log(this.container);
        if (this.container) {
          this.container.$destroy();
          //this.target.removeChild(this.container.$el);
          delete this.container;
        }
      },
    },
  });
})(bbn);
