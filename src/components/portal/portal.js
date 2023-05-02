/**
 * @file bbn.wc implementation of https://github.com/LinusBorg/vue-simple-portal.
 * @created 10/10/2021
 */

/* jshint esversion: 6 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     */
    mixins: [bbn.wc.mixins.basic],
    static() {
      let config = {
        selector: "bbn-portal-target-" + bbn.fn.randomString(20, 30)
      };
    
      /*
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
      */
    },
    props: {
      /**
       * @prop {Boolean} disabled
       */
      disabled: {
        type: Boolean,
        default: false
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
    computed: {
      element() {
        if (this.selector) {
          let sel = this.selector;
          if (bbn.fn.isString(this.selector)) {
            sel = document.querySelector(this.selector)
          }
          if (sel === document.body) {
            return null;
          }

          return sel;
        }

        return null;
      }
    },
    methods: {
      mount() {
        bbn.fn.log("mount portal")
        bbn.fn.log("on Mount", this.element)
        if (this.element) {
          this.$el.bbnSlots.default.items.forEach(node => {
            this.element.appendChild(node.ele);
          });
        }
      },
      unmount() {
        bbn.fn.log("unmount portal")
        if (this.element) {
          this.$el.bbnSlots.default.items.forEach(node => {
            this.$el.appendChild(node.ele);
          });
        }
      },
      onRegisterChild(child) {
        if (!this.disabled && this.element) {
          this.element.appendChild(child.$el ? child.$el : child);
        }
      }
    },
    mounted() {

      if (!this.disabled) {
        this.mount();
      }
      bbn.fn.log("MOUNTED", this.$el, this.$el.bbnSlots.default.items.length, this.disabled, this.$el.bbnSlots.default, this.$el.bbnSlots.default.items[0], this.$parent);
      /*
      bbn.fn.log("on beforeMount");
      const observer = new MutationObserver(mutations_list => {
        mutations_list.forEach(mutation => {
          bbn.fn.log("MUTATION", mutation);
          if (mutation.addedNodes) {
            const unknown = [];
            mutation.addedNodes.forEach(node => {
              const tag = node.tagName ? node.tagName.toLowerCase() : null;
              bbn.fn.log(tag + ' added, with parent ' + node.parentNode.tagName.toLowerCase(), mutation);
            });
            //checkUnknown(unknown);
          }
        });
      });
      observer.observe(this.$el, { subtree: true, childList: true });
      setTimeout(() => {
        if (!this.disabled) {
          this.mount();
        }
      }, 125)
      */
    },
    beforeDestroy() {
      bbn.fn.log("PORTAL: beforeDestroy");
      this.unmount()
    },
    watch: {
      disabled: {
        immediate: true,
        handler(disabled) {
          bbn.fn.log("PORTAL: disabled");
          disabled ? this.unmount() : this.$nextTick(this.mount)
        },
      },
      element: {
        immediate: true,
        handler() {
          if (!this.disabled) {
            bbn.fn.log("PORTAL: element");
            this.$nextTick(this.mount)
          }
        },
      },
    },
  };
