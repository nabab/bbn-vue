/**
 * Created by BBN on 10/02/2017.
 */
/* jslint esversion: 6 */
(function($, bbn, kendo){
  "use strict";

  kendo.culture(bbn_language ? bbn_language : "en_EN");

  const
    editorOperators = {
      string: {
        'contains': bbn._('Contient'),
        'eq': bbn._('Est'),
        'neq': bbn._('N’est pas'),
        'startswith': bbn._('Commence par'),
        'doesnotcontain': bbn._('Ne contient pas'),
        'endswith': bbn._('Se termine par'),
        'isempty': bbn._('Est vide'),
        'isnotempty': bbn._('N’est pas vide')
      },
      number: {
        'eq': bbn._('Est égal à'),
        'neq': bbn._('N’est pas égal à'),
        'gte': bbn._('Est supérieur ou égal à'),
        'gt': bbn._('Est supérieur à'),
        'lte': bbn._('Est inférieur ou égal à'),
        'lt': bbn._('Est inférieur à'),
      },
      date: {
        'eq': bbn._('Est égal à'),
        'neq': bbn._('N’est pas égal à'),
        'gte': bbn._('Est postérieur ou égal à'),
        'gt': bbn._('Est postérieur à'),
        'lte': bbn._('Est antérieur ou égal à'),
        'lt': bbn._('Est antérieur à'),
      },
      enums: {
        'eq': bbn._('Est égal à'),
        'neq': bbn._('N’est pas égal à'),
      },
      boolean: {
        'istrue': bbn._('Est vrai'),
        'isfalse': bbn._('Est faux')
      }
    },
    editorNullOps = {
      'isnull': bbn._('Est nul'),
      'isnotnull': bbn._('N’est pas nul')
    },
    editorNoValueOperators = ['', 'isnull', 'isnotnull', 'isempty', 'isnotempty', 'istrue', 'isfalse'],
    isReservedTag = Vue.config.isReservedTag;

  bbn.vue = {
    defaultLocalURL: false,
    defaultLocalPrefix: '',
    localURL: false,
    isNodeJS: false,
    localPrefix: '',
    loadingComponents: [],
    loadedComponents: [],
    // Definition rules by prefix
    knownPrefixes: [],
    // Each unknown tag sent to loadComponentsByPrefix
    parsedTags: [],
    queueTimer: 0,
    queue: [],
    queueTimerBBN: 0,
    queueBBN: [],
    components: {
      appui: {},
      autocomplete: {},
      button: {},
      chart: {},
      chat: {},
      checkbox: {},
      code: {},
      colorpicker: {},
      combo: {},
      context: {},
      countdown: {},
      countdown2: {},

      dashboard: {},
      datepicker: {},
      datetimepicker: {},
      dropdown: {},
      //dropdowntreeview: {},
      field:{},
      filter: {},
      fisheye: {},
      //footer: {},
      form: {},
      grapes: {},
      initial: {},
      input: {},
      'json-editor': {},
      list: {},
      loader: {},
      loading: {},
      markdown: {},
      masked: {},
      menu: {},
      message: {},
      multiselect: {},
      notification: {},
      numeric: {},
      operator: {},
      pane: {},
      popup: {},
      progressbar:{},
      radio: {},
      rte: {},
      scheduler: {},
      scroll: {},
      'scroll-x': {},
      'scroll-y': {},
      search: {},
      slider: {},
      slideshow: {},
      splitter: {},
      switch: {},
      table: {},
      tabnav: {},
      textarea: {},
      timepicker: {},
      toolbar: {},
      tooltip: {},
      tree: {},
      treemenu: {},
      'tree-input': {},
      upload: {},
      vlist: {}
    },
    loadDelay: 100,

    _retrievePopup(vm){
      if ( vm.$options && vm.$options._componentTag === 'bbn-popup' ){
        return vm;
      }
      else if ( vm.getRef('popup') ){
        return vm.getRef('popup');
      }
      else if ( vm.window && vm.window.popup ){
        return vm.window.popup;
      }
      else if ( vm.tab && vm.tab.getRef('popup') ){
        return vm.tab.getRef('popup');
      }
      return false;
    },

    /**
     * Makes the dataSource variable suitable to be used by the kendo UI widget
     * @param vm Vue object
     * @returns object
     */
    toKendoDataSource(vm){
      let text = vm.sourceText || vm.widgetOptions.dataTextField || 'text',
          value = vm.sourceValue || vm.widgetOptions.dataValueField || 'value',
          nullable = vm.nullable || false,
          res = [];
      let transform = (src) => {
        let type = typeof(src),
            isArray = Array.isArray(src);
        if ( (type === 'object') && !isArray ){
          $.each(src, (n, a) => {
            let tmp = {};
            tmp[text] = (typeof a) === 'string' ? a : n;
            tmp[value] = n;
            if ( vm.group && a[vm.group] ){
              tmp[vm.group] = a[vm.group];
            }
            res.push(tmp);
          });
        }
        else if ( isArray && src.length && (typeof(src[0]) !== 'object') ){
          res = $.map(src, (a) => {
            let tmp = {};
            tmp[text] = a;
            tmp[value] = a;
            return tmp;
          });
        }
        else{
          res = src;
        }
        if ( nullable && res.length ){
          let tmp = {};
          tmp[text] = '';
          tmp[value] = null;
          res.unshift(tmp)
        }
        return res;
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

    initDefaults(defaults, cpName){
      if ( !bbn.vue.components[cpName] ){
        throw new Error("Impossible to find the component " + cpName);
      }
      if ( typeof defaults !== 'object' ){
        throw new Error("The default object sent is not an object " + cpName);
      }
      bbn.vue.components[cpName].defaults = $.extend(true, defaults, bbn.vue.components[cpName].defaults);
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

    addComponent(name, mixins){
      if ( bbn.vue.localURL ){
        let componentName = bbn.fn.replaceAll("/", "-", name);
        if ( bbn.vue.localPrefix ){
          componentName = bbn.vue.localPrefix + '-' + componentName;
        }
        bbn.vue.announceComponent(componentName, bbn.vue.localURL + name, mixins);
      }
    },

    queueComponent(name, url, mixins, resolve, reject){
      clearTimeout(bbn.vue.queueTimer);
      bbn.vue.queue.push({
        name: name,
        url: url,
        mixins: mixins,
        resolve: resolve,
        reject: reject
      });
      bbn.vue.queueTimer = setTimeout(() => {
        let todo = bbn.vue.queue.splice(0, bbn.vue.queue.length);
        $.each(todo, (i, a) => {
          bbn.vue.executeQueueItem(a);
        });
      }, bbn.vue.loadDelay)
      return bbn.vue.queueTimer
    },

    executeQueueItem(a){
      if ( a.url ) {
        return bbn.fn.post(a.url, (r) => {
          if ( r.script ){
            if ( r.css ){
              $(document.head).append('<style>' + r.css + '</style>');
            }
            if ( r.content ){
              $(document.body).append('<script type="text/x-template" id="bbn-tpl-component-' + a.name + '">' + r.content + '</script>');
            }
            let data = r.data || {};
            let res = eval(r.script);
            if ( typeof res === 'object' ){
              if ( !res.template ){
                res.template = '#bbn-tpl-component-' + a.name;
              }
              if ( !res.props ){
                res.props = {};
              }
              if ( !res.props.source ){
                res.props.source = {};
              }
              if ( !res.name ){
                res.name = a.name;
              }
              if ( a.mixins ){
                if ( res.mixins ){
                  $.each(a.mixins, (j, b) => {
                    res.mixins.push(b);
                  })
                }
                else{
                  res.mixins = a.mixins;
                }
              }
              if ( Object.keys(data).length ){
                res.props.source.default = () => {
                  return data;
                }
              }
              Vue.component(a.name, res);
            }
            a.resolve('ok');
            return;
          }
          a.reject();
        })
      }
      return false;
    },

    /** Adds an array of components, calling them all at the same time, in a single script */
    executeQueueBBNItem(todo){
      let url = bbn_root_url + bbn_root_dir + 'components/?components=' + $.map(todo, (a) => {
        return a.name;
      }).join(',');
      if ( bbn.env.isDev ){
        url += '&test=1';
      }
      return bbn.fn.ajax(url)
        .then(
          // resolve from server
          (res) => {
            // This executes the script returned by the server, which will return a new promise
            let prom = eval(res);
            prom.then(
              // resolve from executed script
              (arr) => {
                // arr is the answer!
                if ( $.isArray(arr) ){
                  //bbn.fn.warning("RES!!!!!");
                  //bbn.fn.log(arr);
                  $.each(arr, (i, r) => {
                    let resolved = false;
                    if ( (typeof(r) === 'object') && r.script && r.name ){
                      let idx = bbn.fn.search(todo, {name: r.name});
                      //bbn.fn.log(r, idx, todo);
                      if ( idx > -1 ){
                        let a = todo[idx];
                        if ( r.html && r.html.length ){
                          $.each(r.html, (j, h) => {
                            if ( h && h.content ){
                              let id = 'bbn-tpl-component-' + a.name + (h.name === a.name ? '' : '-' + h.name),
                                  $tpl = $('<script type="text/x-template" id="' + id + '"></script>');
                              $tpl.html(h.content);
                              document.body.appendChild($tpl[0]);
                            }
                          })
                        }
                        if ( r.css ){
                          $(document.head).append('<style>' + r.css + '</style>');
                        }
                        r.script();
                        //bbn.fn.log("CP", a.name, Vue.options.components['bbn-' + a.name]);
                        if ( (a.resolve !== undefined) && (Vue.options.components['bbn-' + a.name] !== undefined) ){
                          setTimeout(() => {
                            a.resolve('ok');
                          }, 200)
                          resolved = true;
                        }
                      }
                    }
                    if ( !resolved ){
                      a.reject();
                    }
                  })
                }
                return prom;
              },
              // reject: executed script has an error
              () => {
                bbn.fn.log("ERROR in the executed script from the server");
                throw new Error("Problem in the executed script from the server from " + url)
              }
            )
          },
          // reject: no return from the server
          () => {
            bbn.fn.log("ERROR in executeQueueBBNItem");
            throw new Error("Impossible to find the components from " + url)
          }
        )
    },

    queueComponentBBN(name, resolve, reject){
      bbn.fn.warning(name);
      if ( bbn.fn.search(bbn.vue.queueBBN, {name: name}) === -1 ){
        clearTimeout(bbn.vue.queueTimerBBN);
        bbn.vue.queueBBN.push({
          name: name,
          resolve: resolve,
          reject: reject
        });
        bbn.vue.queueTimerBBN = setTimeout(() => {
          if ( bbn.vue.queueBBN.length ){
            bbn.vue.executeQueueBBNItem(bbn.vue.queueBBN.splice(0, bbn.vue.queueBBN.length));
          }
        }, bbn.vue.loadDelay);
      }
      return bbn.vue.queueTimerBBN;
    },

    announceComponent(name, url, mixins){
      if ( !bbn.vue.isNodeJS && (typeof(name) === 'string') && (Vue.options.components[name] === undefined) ){
        Vue.component(name, (resolve, reject) => {
          return bbn.vue.queueComponent(name, url, mixins, resolve, reject);
        });
      }
    },

    defineComponents(){
      if ( !bbn.vue.loadedComponents.length && !bbn.vue.isNodeJS ){
        for ( let a in bbn.vue.components ){
          bbn.vue.loadedComponents.push('bbn-' + a);
          /** @var string bbn_root_url */
          /** @var string bbn_root_dir */
          Vue.component('bbn-' + a, (resolve, reject) => {
            bbn.vue.queueComponentBBN(a, resolve, reject);
          });
        }
      }
    },

    resetDefBBN(cp){
      if ( Vue.options.components[cp] ){
        delete Vue.options.components['bbn-' + cp];
        Vue.component('bbn-' + cp, (resolve, reject) => {
          bbn.vue.queueComponentBBN(cp, resolve, reject);
        });
      }
    },

    resetDef(cp){
      if ( Vue.options.components[cp] ){
        delete Vue.options.components[cp];
        Vue.component(cp, (resolve, reject) => {
          bbn.vue.queueComponent(cp, resolve, reject);
        });
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

    is(vm, selector){
      if ( selector && vm ){
        if ( vm.$el && $(vm.$el).is(selector) ){
          return true;
        }
        if ( vm.$vnode && vm.$vnode.componentOptions && (vm.$vnode.componentOptions.tag === selector) ){
          return true;
        }
      }
      return false;
    },

    closest(vm, selector, checkEle){
      let test = vm.$el;
      while ( vm && vm.$parent && (vm !== vm.$parent) ){
        if ( bbn.vue.is(vm.$parent, selector) ){
          if ( !checkEle || (test !== vm.$parent.$el) ){
            return vm.$parent;
          }
        }
        vm = vm.$parent;
      }
      return false;
    },

    getRef(vm, name){
      if ( vm ){
        if ( Array.isArray(vm.$refs[name]) ){
          if ( vm.$refs[name][0] ){
            return vm.$refs[name][0];
          }
        }
        else if ( vm.$refs[name] ){
          return vm.$refs[name];
        }
      }
      return false;
    },

    getChildByKey(vm, key, selector){
      if ( vm.$children ){
        for ( let i = 0; i < vm.$children.length; i++ ){
          let obj = vm.$children[i];
          if (
            obj.$el &&
            obj.$vnode &&
            obj.$vnode.data &&
            (obj.$vnode.data.key !== undefined) &&
            (obj.$vnode.data.key === key)
          ){
            if ( selector && bbn.vue.is(obj, selector) ){
              return obj;
            }
            else{
              return obj;
            }
          }
        }
      }
      return false;
    },

    findByKey(vm, key, selector, ar){
      let tmp = bbn.vue.getChildByKey(vm, key, selector);
      if ( !tmp && vm.$children ){
        for ( let i = 0; i < vm.$children.length; i++ ){
          if ( tmp = bbn.vue.findByKey(vm.$children[i], key, selector, ar) ){
            if ( $.isArray(ar) ){
              ar.push(tmp);
            }
            else{
              break;
            }
          }
        }
      }
      return tmp;
    },

    findAllByKey(vm, key, selector){
      let ar = [];
      bbn.vue.findByKey(vm, key, selector, ar);
      return ar;
    },

    find(vm, selector, index){
      let vms = bbn.vue.getComponents(vm);
      let realIdx = 0;
      index = parseInt(index) || 0;
      if ( vms ){
        for ( let i = 0; i < vms.length; i++ ){
          if ( bbn.vue.is(vms[i], selector) ){
            if ( realIdx === index ){
              return vms[i];
            }
            realIdx++;
          }
        }
      }
    },

    findAll(vm, selector, only_children){
      let vms = bbn.vue.getComponents(vm, only_children),
          res = [];
      for ( let i = 0; i < vms.length; i++ ){
        if (
          $(vms[i].$el).is(selector) ||
          (vms[i].$vnode.componentOptions && (vms[i].$vnode.componentOptions.tag === selector))
        ){
          res.push(vms[i]);
        }
      }
      return res;
    },

    getComponents(vm, ar, only_children){
      if ( !Array.isArray(ar) ){
        ar = [];
      }
      $.each(vm.$children, function(i, obj){
        ar.push(obj)
        if ( !only_children && obj.$children ){
          bbn.vue.getComponents(obj, ar);
        }
      });
      return ar;
    },

    makeUID(){
      return bbn.fn.md5(bbn.fn.randomString(12, 30));
    },

    getRoot(vm){
      let e = vm;
      while ( e.$parent ){
        e = e.$parent;
      }
      return e;
    },

    getPopup(vm){
      return vm.currentPopup;
    },

    replaceArrays(oldArr, newArr, key){
      if ( key && $.isArray(oldArr, newArr) ){
        for ( let i = oldArr.length; i > 0; --i ){
          if ( bbn.fn.search(newArr, key, oldArr[i][key]) === -1 ){
            oldArr.splice(i, 1)
          }
        }
        for ( let a of newArr ){
          if ( bbn.fn.search(oldArr, key, a[key]) === -1 ){
            oldArr.push(a)
          }
        }
      }
    },

    // Looks if the given tag starts with one of the known prefixes,
    // and it such case defines the component with the corresponding handler
    loadComponentsByPrefix(tag){
      let res = isReservedTag(tag);
      // Tag is unknown and has never gone through this function
      if ( tag && !res && (bbn.vue.parsedTags.indexOf(tag) === -1) ){
        bbn.vue.parsedTags.push(tag);
        let idx = -1;
        // Looking for a corresponding prefix rule
        for (let i = 0; i < bbn.vue.knownPrefixes.length; i++){
          if (
            bbn.vue.knownPrefixes[i].prefix &&
            (typeof bbn.vue.knownPrefixes[i].handler === 'function') &&
            (tag.indexOf(bbn.vue.knownPrefixes[i].prefix) === 0)
          ) {
            // Taking the longest (most precise) prefix's rule
            if ( idx > -1 ){
              if ( bbn.vue.knownPrefixes[i].prefix.length > bbn.vue.knownPrefixes[idx].prefix.length ){
                idx = i;
              }
            }
            else{
              idx = i;
            }
          }
        }
        // A rule has been found
        if ( idx > -1 ){
          bbn.fn.log("DEFINING FROM PREFIX WITH TAG " + tag);
          Vue.component(tag, (resolve, reject) => {
            bbn.fn.log("CREATING COMPONENT");
            bbn.vue.knownPrefixes[idx].handler(tag, resolve, reject);
          });
        }
      }
      return false;
    },

    addPrefix(prefix, handler){
      if ( typeof prefix !== 'string' ){
        throw new Error("Prefix must be a string!");
        return;
      }
      if ( typeof handler !== 'function' ){
        throw new Error("Handler must be a function!");
        return;
      }
      if ( prefix.substr(-1) !== '-' ){
        prefix += '-';
      }
      bbn.vue.knownPrefixes.push({
        prefix: prefix,
        handler: handler
      });
    },

    emptyComponent: {
      template: '<template><slot></slot></template>'
    },

    basicComponent: {
      props: {
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        },
      },
      data(){
        return {
          isMounted: false,
          ready: false
        }
      },
      methods: {
        focus(){
          let ele = this.getRef('element');
          if ( ele ){
            ele.focus()
          }
        },
      },
      beforeCreate(){
        if ( !this.$options.render && !this.$options.template && this.$options.name ){
          this.$options.template = '#bbn-tpl-component-' + this.$options.name.slice(4);
        }
      },
      created(){
        if ( this.$options.name ){
          this.componentClass.push(this.$options.name);
        }
      },
      mounted(){
        this.isMounted = true;
        this.$emit('mounted');
      },
      watch: {
        ready(newVal){
          this.$emit('ready', newVal)
        }
      }
    },

    localStorageComponent: {
      props: {
        storageName: {
          type: String,
          default: 'default'
        },
        storageFullName: {
          type: String
        },
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      computed: {
        storage(){
          if ( window.store ){
            return {
              get(name){
                let tmp = window.store.get(name);
                if ( tmp ){
                  return tmp.value;
                }
              },
              set(name, value){
                return window.store.set(name, {
                  value: value,
                  time: (new Date()).getTime()
                });
              },
              time(name){
                let tmp = window.store.get(name);
                if ( tmp ){
                  return tmp.time;
                }
              },
              remove(name){
                return window.store.remove(name);
              }
            }
          }
          return false;
        },
      },
      methods: {
        _getStorageRealName(){
          return this.storageFullName ? this.storageFullName : this.$options.name + '-' + window.location.pathname.substr(1) + '-' + this.storageName;
        },
        hasStorage(){
          return !!this.storage;
        },
        getStorage(){
          if ( this.hasStorage() ){
            return this.storage.get(this._getStorageRealName())
          }
        },
        setStorage(value){
          if ( this.hasStorage() ){
            return this.storage.set(this._getStorageRealName(), value)
          }
        },
      },
      created(){
        this.componentClass.push('bbn-local-storage-component');
      },
    },

    dataEditorComponent: {
      props: {
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      methods: {
        editorOperatorType(col){
          if ( col.field ){

          }
        },
        editorHasNoValue(operator){
          return $.inArray(operator, editorNoValueOperators) > -1;
        },
        editorGetComponentOptions(col){
          let o = {
            type: 'string',
            component: 'bbn-input',
            multi: false,
            componentOptions:  {}
          };
          if ( col && col.field ){
            o.field = col.field;
            if ( col.filter ){
              o.component = col.filter;
            }
            else if ( col.source ){
              o.type = 'enums';
              o.component = 'bbn-dropdown';
              o.componentOptions.source = col.source;
              o.componentOptions.placeholder = bbn._('Choose');
            }
            else if ( col.type ){
              switch ( col.type ){
                case 'number':
                case 'money':
                  o.type = 'number';
                  o.component = 'bbn-numeric';
                  break;
                case 'date':
                  o.type = 'date';
                  o.component = 'bbn-datepicker';
                  break;
                case 'time':
                  o.type = 'date';
                  o.component = 'bbn-timepicker';
                  break;
                case 'datetime':
                  o.type = 'date';
                  o.component = 'bbn-datetimepicker';
                  break;
              }
            }
            if ( col.componentOptions ){
              $.extend(o.componentOptions, col.componentOptions);
            }
            if ( o.type && this.editorOperators[o.type] ){
              o.operators = this.editorOperators[o.type];
            }
            o.fields = [col];
          }
          return o
        },

      },
      computed: {
        editorOperators(){
          return editorOperators;
        },
        editorNullOps(){
          return editorNullOps;
        },
        editorNoValueOperators(){
          return editorNoValueOperators;
        }
      },
      created(){
        this.componentClass.push('bbn-dataeditor-component');
      },
    },

    eventsComponent: {
      props: {
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
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
      },
      created(){
        this.componentClass.push('bbn-events-component');
      },
    },

    dataSourceComponent: {
      props: {
        source: {
          type: [Array, Object, String, Function],
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
        },
        nullable: {
          type: Boolean,
          default: false
        },
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        },
      },
      methods: {
        getOptions(obj){
          let cfg = bbn.vue.getOptions2(this, obj);
          cfg.dataTextField = this.sourceText || this.widgetOptions.dataTextField || 'text';
          cfg.dataValueField = this.sourceValue || this.widgetOptions.dataValueField || 'value';
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
      },
      created(){
        this.componentClass.push('bbn-datasource-component');
      },
    },

    memoryComponent: {
      props: {
        memory: {
          type: [Object, Function]
        },
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      created(){
        this.componentClass.push('bbn-datasource-component');
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
          type: [Number, String]
        },
        maxlength: {
          type: [String, Number]
        },
        validation: {
          type: [Function]
        },
        type: {
          type: String
        },
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      methods: {
        emitInput(val){
          this.$emit('input', val);
        },
        change(e){
          this.$emit('change', e, this.value)
        },
        isValid(val){
          const elem = this.$refs.element,
                $elem = $(this.$el),
                customMessage = this.$el.hasAttribute('validationMessage') ? this.$el.getAttribute('validationMessage') : false;
          // Get validity
          if ( elem && elem.validity ){
            let validity = elem.validity,
                // Default message
                mess = bbn._('The value you entered for this field is invalid.');
            // If valid or disabled, return true
            if ( elem.disabled || validity.valid ){
              return true;
            }
            if ( !validity.valid ){
              // If field is required and empty
              if ( validity.valueMissing ){
                mess = bbn._('Please fill out this field.');
              }
              // If not the right type
              else if ( validity.typeMismatch ){
                switch ( elem.type ){
                  // Email
                  case 'email':
                    mess = bbn._('Please enter a valid email address.');
                    break;
                  // URL
                  case 'url':
                    mess = bbn._('Please enter a valid URL.');
                    break;
                }
              }
              // If too short
              else if ( validity.tooShort ){
                mess = bbn._('Please lengthen this text to ') + elem.getAttribute('minLength') + bbn._(' characters or more. You are currently using ') + elem.value.length + bbn._(' characters.');
              }
              // If too long
              else if ( validity.tooLong ){
                mess = bbn._('Please shorten this text to no more than ') + elem.getAttribute('maxLength') + bbn._(' characters. You are currently using ') + elem.value.length + bbn._(' characters.');
              }
              // If number input isn't a number
              else if ( validity.badInput ){
                mess = bbn._('Please enter a number.');
              }
              // If a number value doesn't match the step interval
              else if ( validity.stepMismatch ){
                mess = bbn._('Please select a valid value.');
              }
              // If a number field is over the max
              else if ( validity.rangeOverflow ){
                mess = bbn._('Please select a value that is no more than ') + elem.getAttribute('max') + '.';
              }
              // If a number field is below the min
              else if ( validity.rangeUnderflow ){
                mess = bbn._('Please select a value that is no less than ') + elem.getAttribute('min') + '.';
              }
              // If pattern doesn't match
              else if (validity.patternMismatch) {
                // If pattern info is included, return custom error
                mess = bbn._('Please match the requested format.');
              }
              this.$emit('error', customMessage || mess);
              $elem.css('border', '1px solid red');
              this.$on('blur', () => {
                $elem.css('border', 'none');
                $elem.focus();
              });
              return false;
            }
          }
          return true;
        }
      },
      created(){
        this.componentClass.push('bbn-input-component');
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
      props: {
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      methods: {
        getOptions(){
          return bbn.vue.getOptions(this);
        },
      },
      created(){
        this.componentClass.push('bbn-option-component');
      },
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
        },
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      created(){
        this.componentClass.push('bbns-widget-component');
      },
      beforeDestroy(){
        //bbn.fn.log("Default destroy");
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
          bbn.fn.info("CLASSIC BUILD " );
        },
        getWidgetCfg(){
          const vm = this;
        },
      }
    },

    // These components will emit a resize event when their closest parent of the same kind gets really resized
    resizerComponent: {
      props: {
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      data(){
        return {
          // The closest resizer parent
          parentResizer: false,
          // The listener on the closest resizer parent
          resizeEmitter: false,
          // Height
          lastKnownHeight: false,
          // Width
          lastKnownWidth: false
        };
      },
      methods: {
        // a function can be executed just before the resize event is emitted
        onResize(){
          return;
        },

        setResizeEvent(){
          // The timeout used in the listener
          let resizeTimeout;
          // This class will allow to recognize the element to listen to
          this.$el.className += " bbn-resize-emitter";
          this.parentResizer = bbn.vue.closest(this, ".bbn-resize-emitter", true);
          // Setting initial dimensions
          this.lastKnownHeight = this.parentResizer ? Math.round($(this.parentResizer.$el).innerHeight()) : bbn.env.height;
          this.lastKnownWidth = this.parentResizer ? Math.round($(this.parentResizer.$el).innerWidth()) : bbn.env.width;
          // Creating the callback function which will be used in the timeout in the listener
          this.resizeEmitter = (force) => {
            // Removing previous timeout
            clearTimeout(resizeTimeout);
            // Creating a new one
            resizeTimeout = setTimeout(() => {
              if ( $(this.$el).is(":visible") ){
                // Checking if the parent hasn't changed (case where the child is mounted before)
                let tmp = bbn.vue.closest(this, ".bbn-resize-emitter", true);
                if ( tmp !== this.parentResizer ){
                  // In that case we reset
                  this.unsetResizeEvent();
                  this.setResizeEvent();
                  return;
                }
                let resize = false,
                    h      = this.parentResizer ? Math.round($(this.parentResizer.$el).innerHeight()) : bbn.env.height,
                    w      = this.parentResizer ? Math.round($(this.parentResizer.$el).innerWidth()) : bbn.env.width;
                if ( h && (this.lastKnownHeight !== h) ){
                  this.lastKnownHeight = h;
                  resize = 1;
                }
                if ( w && (this.lastKnownWidth !== w) ){
                  this.lastKnownWidth = w;
                  resize = 1;
                }
                if ( resize || force ){
                  this.onResize();
                  this.$emit("resize", force);
                }
              }
            }, 0);
          };
          if ( this.parentResizer ){
            //bbn.fn.log("SETTING EVENT FOR PARENT", this.$el, this.parentResizer);
            this.parentResizer.$on("resize", (force) => {
              this.resizeEmitter(force)
            });
          }
          else{
            //bbn.fn.log("SETTING EVENT FOR WINDOW", this.$el);
            $(window).on("resize", (force) => {
              this.resizeEmitter(force)
            });
          }
          this.resizeEmitter();
        },

        unsetResizeEvent(){
          return;
          if ( this.resizeEmitter ){
            if ( this.parentResizer ){
              //bbn.fn.log("UNSETTING EVENT FOR PARENT", this.$el, this.parentResizer);
              this.parentResizer.$off("resize", this.resizeEmitter);
            }
            else{
              //bbn.fn.log("UNSETTING EVENT FOR WINDOW", this.$el);
              $(window).off("resize", this.resizeEmitter);
            }
          }
        },

        selfEmit(force){
          if ( this.parentResizer ){
            this.parentResizer.$emit("resize", force);
          }
        }
      },
      created(){
        this.componentClass.push('bbn-resizer-component');
      },
      mounted(){
        this.setResizeEvent();
      },
      beforeDestroy(){
        this.unsetResizeEvent();
      }
    },

    closeComponent: {
      props: {
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      created(){
        this.componentClass.push('bbn-close-component');
      },
      computed: {
        canClose(){
          return !this.isUnsaved;
        }
      },
      methods: {

      }
    },

    fieldComponent: {
      props: {
        width: {
          type: [String, Number],
        },
        render: {
          type: [String, Function]
        },
        title: {
          type: [String, Number]
        },
        ftitle: {
          type: String
        },
        tcomponent: {
          type: [String, Object]
        },
        icon: {
          type: String
        },
        cls: {
          type: String
        },
        type: {
          type: String
        },
        field: {
          type: String
        },
        fixed: {
          type: [Boolean, String],
          default: false
        },
        hidden: {
          type: Boolean
        },
        encoded: {
          type: Boolean,
          default: false
        },
        sortable: {
          type: [Boolean, Function],
          default: true
        },
        editable: {
          type: [Boolean, Function],
          default: true
        },
        filterable: {
          type: [Boolean, Function],
          default: true
        },
        resizable: {
          type: [Boolean, Function],
          default: true
        },
        showable: {
          type: [Boolean, Function],
          default: true
        },
        nullable: {
          type: [Boolean, Function],
        },
        buttons: {
          type: [Array, Function]
        },
        source: {
          type: [Array, Object, String, Function]
        },
        required: {
          type: Boolean,
        },
        options: {
          type: [Object, Function],
          default(){
            return {};
          }
        },
        editor: {
          type: [String, Object]
        },
        maxLength: {
          type: Number
        },
        sqlType: {
          type: String
        },
        aggregate: {
          type: [String, Array]
        },
        component: {
          type: [String, Object]
        },
        mapper: {
          type: Function
        },
        group: {
          type: String
        }
      },
    },

    observerComponent: {
      props: {
        observer: {
          type: Boolean,
          default: true
        }
      },
      data(){
        return {
          // Integration of the functionnality is done through a watcher on this property
          observersCopy: [],
          observerValue: null,
          observers: [],
          observerID: null,
          observationTower: null,
          observerUID: bbn.fn.randomString().toLowerCase()
        }
      },
      methods: {
        observerCheck(){
          return this.observer && this.observationTower;
        },
        isObserved(){
          return this.observerCheck() && this.observerValue;
        },
        observerWatch(){
          if ( this.isObserved() ){
            bbn.fn.log("----------------isObserved--------------", this.$el)
            this.observationTower.observerRelay({
              element: this.observerUID,
              id: this.observerID,
              value: this.observerValue
            });
            this.observationTower.$on('bbnObs' + this.observerUID + this.observerID, (newVal) => {
              // Integration of the functionnality is done through a watcher on this property
              this.observerValue = newVal;
            });
          }
        },
        observerRelay(obs){
          if ( this.observer ){
            bbn.fn.log("----------------observerRelay--------------", this.$el)
            let idx = bbn.fn.search(this.observers, {id: obs.id, element: obs.element});
            if ( idx > -1 ){
              if ( this.observers[idx].value !== obs.value ){
                this.observers.splice(idx, 1, obs);
              }
            }
            else{
              this.observers.push(obs);
              if ( this.observerCheck() ){
                bbn.fn.log("----------------observing " + 'bbnObs' + obs.element + obs.id + "--------------", this.$el)
                this.observationTower.$on('bbnObs' + obs.element + obs.id, (newVal) => {
                  this.observerEmit(newVal, obs);
                });
              }
            }
            if ( this.observerCheck() ){
              this.observationTower.observerRelay(obs);
            }
          }
        },
        observerEmit(newVal, obs){
          bbn.fn.log("--------------observerEmit-------------------", this.$el);
          let row = bbn.fn.get_row(this.observers, {id: obs.id, element: obs.element});
          if ( row && (row.value !== newVal) ){
            row.value = newVal;
            this.$emit('bbnObs' + obs.element + obs.id, newVal);
          }
        }
      },
      created(){
        if ( this.componentClass ){
          this.componentClass.push('bbn-observer', 'bbn-observer-' + this.observerUID);
        }
      },
      mounted(){
        if ( this.observer ){
          this.observationTower = bbn.vue.closest(this, '.bbn-observer');
          this.observerWatch();
        }
      },
      beforeDestroy(){
        if ( this.isObserved() ){
          let idx = bbn.fn.search(this.observationTower.observers, {element: this.observerUID});
          if ( idx > -1 ){
            this.observationTower.observers.splice(idx, 1);
          }
          this.observationTower.$off('bbnObs' + this.observerUID + this.observerID);
        }
      },
    },
  };


  Vue.mixin({
    computed: {
      currentPopup(){
        if ( !this._currentPopup ){
          let e = bbn.vue._retrievePopup(this);
          if ( e ){
            this._currentPopup = e;
          }
          else{
            let vm = this
            while ( 1 ){
              vm = vm.$parent;
              if ( vm._currentPopup ){
                this._currentPopup = vm._currentPopup;
                break;
              }
              else{
                e = bbn.vue._retrievePopup(vm);
                if ( e ){
                  this._currentPopup = e;
                  break;
                }
              }
              if ( vm === this.$root ){
                break;
              }
            }
          }
        }
        if ( this._currentPopup ){
          return this._currentPopup;
        }
        throw new Error(bbn._('Impossible to find a popup instance. Add a bbn-popup in your root element'))
      }
    },
    data(){
      return {
        _currentPopup: false
      };
    },
    methods: {
      _: bbn._,

      getRef(name){
        return bbn.vue.getRef(this, name);
      },
      is(selector){
        return bbn.vue.is(this, selector);
      },
      closest(selector, checkEle){
        return bbn.vue.closest(this, selector, checkEle);
      },
      getChildByKey(key, selector){
        return bbn.vue.getChildByKey(this, key, selector);
      },

      findByKey(key, selector, ar){
        return bbn.vue.findByKey(this, key, selector, ar);
      },

      findAllByKey(key, selector){
        return bbn.vue.findAllByKey(this, key, selector);
      },

      find(selector, index){
        return bbn.vue.find(this, selector, index);
      },

      findAll(selector, only_children){
        return bbn.vue.findAll(this, selector, only_children);
      },

      getComponents(ar, only_children){
        return bbn.vue.getComponents(this, ar, only_children);
      },

      getPopup(){
        let popup = bbn.vue.getPopup(this);
        if ( arguments.length && popup ){
          return popup.open.apply(popup, arguments)
        }
        return popup;
      },

      confirm(){
        let popup = this.getPopup();
        if ( popup ){
          popup.confirm.apply(popup, arguments)
        }
      },

      alert(){
        let popup = this.getPopup();
        if ( popup ){
          popup.alert.apply(popup, arguments)
        }
      }
    }
  });


  Vue.config.isReservedTag = (tag, context) => {
    return bbn.vue.loadComponentsByPrefix(tag, context)
  };

  bbn.vue.fullComponent = bbn.fn.extend({}, bbn.vue.inputComponent, bbn.vue.optionComponent, bbn.vue.eventsComponent, bbn.vue.widgetComponent);

  bbn.vue.addPrefix('bbn', (tag, resolve, reject) => {
    bbn.vue.queueComponentBBN(tag.substr(4), resolve, reject);
  });

})(jQuery, bbn, kendo);
