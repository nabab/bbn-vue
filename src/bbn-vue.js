/**
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  Vue.mixin({
    methods: {
      _: bbn._
    }
  });

  Vue.directive('bbn-fill-height', {
    inserted(el, binding, vnode, oldVnode){
      bbn.fn.log("INSERTED FILL HEIGHT");
      let $ele = $(el),
          $parent = $ele.parent(),
          $siblings = $ele.siblings(),
          h = $parent.innerHeight();
      if ( $parent[0] === document.body ){
        h = window.bbn.env.height;
      }
      $siblings.each(function(){
        let h2,
            $t = $(this);
        if ( $t.is(":visible") &&
          ($t.css('position') !== 'absolute') &&
          ($t.css('position') !== 'fixed') &&
          ($t.css('display') !== 'inline')
        ){
          h2 = $t.outerHeight(true);
          if ( h2 ){
            h -= h2;
          }
        }
      });
      if ( h > 0 ){
        h = Math.round(h);
        $ele.outerHeight(h);
      }
    },
    componentUpdated(el, binding, vnode, oldVnode){
      bbn.fn.log("UPDATED FILL HEIGHT");
      let $ele = $(el),
          $parent = $ele.parent(),
          $siblings = $ele.siblings(),
          h = $parent.innerHeight();
      if ( $parent[0] === document.body ){
        h = window.bbn.env.height;
      }
      $siblings.each(function(){
        let h2,
            $t = $(this);
        if ( $t.is(":visible") &&
          ($t.css('position') !== 'absolute') &&
          ($t.css('position') !== 'fixed') &&
          ($t.css('display') !== 'inline')
        ){
          h2 = $t.outerHeight(true);
          if ( h2 ){
            h -= h2;
          }
        }
      });
      if ( h > 0 ){
        h = Math.round(h);
        $ele.outerHeight(h);
      }
    }
  });

  bbn.vue = {
    defaultLocalURL: false,
    defaultLocalPrefix: '',
    localURL: false,
    isNodeJS: false,
    localPrefix: '',
    loadingComponents: [],
    loadedComponents: [],
    existingComponents: [
      'autocomplete',
      'button',
      'chart',
      'checkbox',
      'code',
      'colorpicker',
      'combo',
      'context',
      'dashboard',
      'datepicker',
      'datetimepicker',
      'dropdown',
      'dropdowntreeview',
      'fisheye',
      'form',
      'initial',
      'input',
      'json-editor',
      'list',
      'loader',
      'loading',
      'markdown',
      'masked',
      'menu',
      'menu-button',
      'message',
      'multiselect',
      'notification',
      'numeric',
      'popup',
      'radio',
      'rte',
      'scroll',
      'scrollx',
      'scrolly',
      'search',
      'slider',
      'splitter',
      'tab',
      'table',
      'table2',
      'tabnav',
      'textarea',
      'timepicker',
      'toolbar',
      'tree',
      'treemenu',
      'tree-input',
      'upload',
      'vlist',
      'widget'
    ],
    /**
     * Makes the dataSource variable suitable to be used by the kendo UI widget
     * @param vm Vue object
     * @returns object
     */
    toKendoDataSource(vm){
      let text = vm.widgetOptions.dataTextField || vm.sourceText,
          value = vm.widgetOptions.dataValueField || vm.sourceValue;
      let transform = (src) => {
        let type = typeof(src),
            isArray = $.isArray(src);
        if ( (type === 'object') && !isArray ){
          let tmp = [];
          $.each(src, (n, a) => {
            let tmp2 = {};
            tmp2[text] = (typeof a) === 'string' ? a : n;
            tmp2[value] = n;
            tmp.push(tmp2);
          });
          return tmp;
        }
        else if ( isArray && src.length && (typeof(src[0]) !== 'object') ){
          return $.map(src, (a) => {
            let tmp = {};
            tmp[text] = a;
            tmp[value] = a;
            return tmp;
          });
        }
        return src;
      };
      if ( typeof(vm.source) === 'string' ){
        if ( vm.$options.propsData.filterValue && !vm._isFilterValueWatched ){
          vm.$watch("filterValue", () => {
            vm.widget.dataSource.read();
          }, {deep: true});
          vm._isFilterValueWatched = true;
        }
        return new kendo.data.DataSource({
          transport:{
            read(e){
              let dt;
              if ( vm.filterValue !== undefined ){
                dt = {};
                if ( vm.param ){
                  dt[param] = vm.filterValue;
                }
                else if ( typeof(vm.filterValue) === 'object' ){
                  $.extend(dt, vm.filterValue);
                }
                else{
                  dt.value = vm.filterValue;
                }
              }
              else {
                dt = e.data;
              }
              bbn.fn.post(vm.source, dt, (d) => {
                if ( d.data ){
                  e.success(transform(d.data));
                }
                else if ( d ){
                  e.success(transform(d));
                }
              });
            }
          }
        });
      }
      else if ( text && value ){
        return transform(vm.source);
      }
      else{
        return [];
      }
    },

    isKendo(vm){
      return (vm.widgetName.indexOf("kendo") === 0);
    },

    /**
     * Supposed to give the data in an appropriate way
     * @todo Remove or do something
     * @param vm Vue object
     * @returns {{}}
     */
    treatData(vm){

      let cfg = {};
      if ( vm.$options.props.cfg && (vm.$options.props.cfg.default !== undefined) ){
        $.extend(cfg, $.isFunction(vm.$options.props.cfg.default) ? vm.$options.props.cfg.default() : vm.$options.props.cfg.default);
      }
      $.each(vm.$options.propsData, (n, a) => {
        cfg[n] = a;
      });
      if ( vm.$options.propsData.cfg ){
        $.extend(cfg,
          typeof(vm.$options.propsData.cfg) === 'string' ?
            JSON.parse(vm.$options.propsData.cfg) :
            vm.$options.propsData.cfg
        );
      }
      return {
        widgetCfg: cfg
      };
    },

    getOptions2(vm, obj){
      if ( !obj || (typeof(obj) !== 'object') ){
        obj = {};
      }
      let r = {};
      bbn.fn.log("getOptioons2");
      return $.extend(obj, r, this.widgetOptions);
    },

    /**
     *
     * @param vm Vue object
     * @returns {{}}
     */
    getOptions(vm, obj){
      if ( !obj || (typeof(obj) !== 'object') ){
        obj = {};
      }
      let tmp = bbn.vue.treatData(vm),
          r = tmp.widgetCfg;
      if ( r.source && vm.widgetName && (vm.widgetName.indexOf("kendo") === 0) ){
        r.dataSource = vm.dataSource;
        delete r.source;
      }
      if ( r.ivalue ){
        delete r.ivalue;
      }
      if ( r.name ){
        delete r.name;
      }
      return $.extend(obj, r);
    },

    setComponentRule(url, prefix){
      if ( url ){
        bbn.vue.localURL = url;
        if ( bbn.vue.localURL.substr(-1) !== '/' ){
          bbn.vue.localURL += '/';
        }
        bbn.vue.localPrefix = prefix || '';
      }
    },

    setDefaultComponentRule(url, prefix){
      if ( url ){
        bbn.vue.defaultLocalURL = url;
        bbn.vue.defaultLocalPrefix = prefix || '';
        bbn.vue.setComponentRule(url, prefix);
      }
    },

    unsetComponentRule(){
      bbn.vue.localURL = bbn.vue.defaultLocalURL;
      bbn.vue.localPrefix = bbn.vue.defaultLocalPrefix;
    },

    addComponent(name){
      if ( bbn.vue.localURL ){
        let componentName = bbn.fn.replaceAll("/", "-", name);
        if ( bbn.vue.localPrefix ){
          componentName = bbn.vue.localPrefix + '-' + componentName;
        }
        bbn.vue.announceComponent(componentName, bbn.vue.localURL + name);
      }
    },

    announceComponent(name, url){
      if ( !bbn.vue.isNodeJS && (typeof(name) === 'string') && (Vue.options.components[name] === undefined) ){
        Vue.component(name, (resolve, reject) => {
          bbn.fn.post(url, (r) => {
            if ( r.script ){
              if ( r.content ){
                $(document.body).append('<script type="text/x-template" id="bbn-tpl-component-' + name + '">' + r.content + '</script>');
              }
              if ( r.css ){
                $(document.head).append('<style>' + r.css + '</style>');
              }
              //let data = r.data || {};
              eval(r.script);
              resolve('ok');
              return;
            }
            reject();
          })
        });
      }
    },

    defineComponents(){
      if ( !bbn.vue.loadedComponents.length && !bbn.vue.isNodeJS ){
        $.each(bbn.vue.existingComponents, (i, a) => {
          bbn.vue.loadedComponents.push('bbn-' + a);
          /** @var string bbn_root_url */
          /** @var string bbn_root_dir */
          Vue.component('bbn-' + a, (resolve, reject) => {
            let url = bbn_root_url + bbn_root_dir + 'components/' + a + "/?component=1";

            if ( bbn.env.isDev ){
              url += '&test';
            }
            bbn.fn.ajax(url, "script")
              .then((res) => {
                let prom = typeof(res) === 'string' ? eval(res) : res;
                prom.then((r) => {
                  // r is the answer!
                  if ( (typeof(r) === 'object') && r.script ){
                    if ( r.html && r.html.length ){
                      $.each(r.html, (j, h) => {
                        if ( h && h.content ){
                          let id = 'bbn-tpl-component-' + a + (h.name === a ? '' : '-' + h.name),
                              $tpl = $('<script type="text/x-template" id="' + id + '"></script>');
                          $tpl.html(h.content);
                          document.body.appendChild($tpl[0]);
                        }
                      })
                    }
                    if ( r.css ){
                      $(document.head).append('<style>' + r.css + '</style>');
                    }
                    setTimeout(() => {
                      r.script();
                      if ( resolve !== undefined ){
                        resolve(prom);
                      }
                    }, 0);
                    return prom;
                  }
                  reject();
                })
              })
          });
        });
      }
    },

    eventsComponent: {
      methods: {
        click(e){
          this.$emit('click', e)
        },
        blur(e){
          this.$emit('blur', e)
        },
        focus(e){
          this.$emit('focus', e)
        },
        keyup(e){
          this.$emit('keyup', e)
        },
        keydown(e){
          this.$emit('keydown', e)
        },
        change(e){
          this.$emit('change', e)
        },
        over(e){
          this.$emit('over', e);
          setTimeout(() => {
            this.$emit('hover', true, e);
          }, 0)
        },
        out(e){
          this.$emit('out', e);
          setTimeout(() => {
            this.$emit('hover', false, e);
          }, 0)
        },
      }
    },

    dataSourceComponent: {
      props: {
        source: {
          type: [Array, Object, String],
          default(){
            return [];
          }
        },
        sourceText: {
          type: String,
          default: "text"
        },
        sourceValue: {
          type: String,
          default: "value"
        }
      },
      methods: {
        getOptions(obj){
          let cfg = bbn.vue.getOptions2(this, obj);
          if ( this.widgetOptions.dataTextField || this.sourceText ){
            cfg.dataTextField = this.widgetOptions.dataTextField || this.sourceText;
          }
          if ( this.widgetOptions.dataValueField || this.sourceValue ){
            cfg.dataValueField = this.widgetOptions.dataValueField || this.sourceValue;
          }
          cfg.dataSource = this.dataSource;
          return cfg;
        },
        getOptions2(obj){
          let cfg = bbn.vue.getOptions2(this, obj);
          if ( this.widgetOptions.dataTextField || this.sourceText ){
            cfg.dataTextField = this.widgetOptions.dataTextField || this.sourceText;
          }
          if ( this.widgetOptions.dataValueField || this.sourceValue ){
            cfg.dataValueField = this.widgetOptions.dataValueField || this.sourceValue;
          }
          cfg.dataSource = this.dataSource;
          return cfg;
        }
      },
      computed: {
        dataSource(){
          return bbn.vue.toKendoDataSource(this)
        }
      },
      watch:{
        source: function(newDataSource){
          if ( this.widget ){
            this.widget.setDataSource(this.dataSource);
          }
        }
      }
    },

    inputComponent: {
      props: {
        value: {},
        name: {
          type: String
        },
        placeholder: {
          type: String
        },
        required: {
          type: Boolean,
          default: false
        },
        disabled: {
          type: Boolean,
          default: false
        },
        readonly: {
          type: Boolean,
          default: false
        },
        size: {
          type: Number
        },
        maxlength: {
          type: [String, Number]
        },
      },
      methods: {
        emitInput(val){
          this.$emit('input', val);
        }
      },
      watch:{
        disabled(newVal){
          if ( this.widget && $.isFunction(this.widget.enable) ){
            this.widget.enable(!newVal);
          }
          else if ( this.widget && this.widgetName && $.isFunction(this.widget[this.widgetName]) ){
            this.widget[this.widgetName](newVal ? "disable" : "enable");
          }
          else if ( $(this.$el).is("input") ){
            if ( newVal ){
              $(this.$el).attr("disabled", true).addClass("k-state-disabled");
            }
            else{
              $(this.$el).attr("disabled", false).removeClass("k-state-disabled");
            }
          }
          else if ( this.$refs.input ){
            if ( newVal ){
              $(this.$refs.input).attr("disabled", true).addClass("k-state-disabled");
            }
            else{
              $(this.$refs.input).attr("disabled", false).removeClass("k-state-disabled");
            }
          }
        },
        value(newVal){
          if ( this.widget && (this.widget.value !== undefined) ){
            if ( $.isFunction(this.widget.value) ){
              if ( this.widget.value() !== newVal ){
                this.widget.value(newVal);
              }
            }
            else{
              if ( this.widget.value !== newVal ){
                this.widget.value = newVal;
              }
            }
          }
        },
        cfg(){

        }
      }
    },

    optionComponent: {
      methods: {
        getOptions(){
          return bbn.vue.getOptions(this);
        },
      }
    },

    widgetComponent: {
      props: {
        cfg: {
          type: Object,
          default(){
            return {};
          }
        },
        widgetOptions: {
          type: Object,
          default(){
            return {};
          }
        }
      },
      beforeDestroy(){
        bbn.fn.log("Default destroy");
        //this.destroy();
      },
      methods: {
        destroy(){
          const vm = this;
          /*
          if ( vm.widget && $.isFunction(vm.widget.destroy) ){
            vm.widget.destroy();
            vm.widget = false;
            if ( vm.$refs.element ){
              let $ele = $(vm.$refs.element).removeAttr("style");
              while ( $ele.parent()[0] !== vm.$el ){
                $ele.unwrap();
              }
              bbn.fn.log("Moving element", $ele);
              if ( vm.widgetName ){
                $ele.removeAttr("data-role").removeAttr("style").removeData(this.widgetName);
              }
            }
            else if ( this.widgetName ){
              $(this.$el).removeData(this.widgetName);
            }
            if ( this.$refs.input ){
              $(this.$refs.input).appendTo(this.$el)
            }
            $(this.$el).children().not("[class^='bbn-']").remove();
          }
          */
        },
        build(){
          bbn.fn.log("Default build");
        },
        getWidgetCfg(){
          const vm = this;
        },
      }
    },

    retrieveRef(vm, path){
      let bits = path.split("."),
          target = vm,
          prop;
      while ( bits.length ){
        prop = bits.shift();
        target = target[prop];
        if ( target === undefined ){
          bbn.fn.log("Impossible to find the target " + path + "(blocking on " + prop + ")");
          break;
        }
      }
      if ( target && (target !== vm) ){
        return target;
      }
      return false;
    },

    closest(vm, selector){
      while ( vm && vm.$parent && (vm !== vm.$parent) ){
        if ( vm.$parent.$el && $(vm.$parent.$el).is(selector) ){
          return vm.$parent;
        }
        bbn.fn.log(vm);
        vm = vm.$parent;
      }
      return false;
    },

    getChildByKey(vm, key, selector){
      for ( var i = 0; i < vm.$children.length; i++ ){
        let obj = vm.$children[i];
        if (
          obj.$el &&
          obj.$vnode &&
          obj.$vnode.data &&
          obj.$vnode.data.key &&
          (obj.$vnode.data.key === key)
        ){
          if ( selector ){
            return $(obj.$el).is(selector) ||
              (obj.$vnode.componentOptions && (obj.$vnode.componentOptions.tag === selector)) ? obj : false;
          }
          return obj;
        }
      }
      return false;
    },

    find(cp, selector){
      let cps = bbn.vue.getComponents(cp);
      for ( let i = 0; i < cps.length; i++ ){
        if (
          $(cps[i].$el).is(selector) ||
          (cps[i].$vnode.componentOptions && (cps[i].$vnode.componentOptions.tag === selector))
        ){
          return cps[i];
        }
      }
    },

    findAll(cp, selector){
      let cps = bbn.vue.getComponents(cp),
          res = [];
      for ( let i = 0; i < cps.length; i++ ){
        if (
          $(cps[i].$el).is(selector) ||
          (cps[i].$vnode.componentOptions && (cps[i].$vnode.componentOptions.tag === selector))
        ){
          res.push(cps[i]);
        }
      }
      return res;
    },

    getComponents(cp, ar){
      if ( !$.isArray(ar) ){
        ar = [];
      }
      $.each(cp.$children, function(i, obj){
        ar.push(obj)
        if ( obj.$children ){
          bbn.vue.getComponents(obj, ar);
        }
      });
      return ar;
    },



    makeUID(){
      return bbn.fn.randomString(32);
    }
  };

  bbn.vue.fullComponent = bbn.fn.extend({}, bbn.vue.inputComponent, bbn.vue.optionComponent, bbn.vue.eventsComponent, bbn.vue.widgetComponent);

  bbn.vue.defineComponents()

})(jQuery, bbn, kendo);
