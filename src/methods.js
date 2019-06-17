((bbn) => {
  "use strict";
  const
    isReservedTag = Vue.config.isReservedTag;
  let loadingComponents = [];
  bbn.fn.autoExtend("vue", {
    /**
     * Retrives the closest popup component in the Vue tree
     * @param vm Vue
     * @returns Vue|false
     */
    _retrievePopup(vm){
      if ( vm.$options && vm.$options._componentTag === 'bbn-popup' ){
        return vm;
      }
      else if ( vm.getRef('popup') ){
        return vm.getRef('popup');
      }
      return vm.$parent ? this._retrievePopup(vm.$parent) : false;
    },
    /**
     * Makes the dataSource variable suitable to be used by the kendo UI widget
     * @todo Remove!
     * @param vm Vue
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
          bbn.fn.each(src, (a, n) => {
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
          res = bbn.fn.map(src, (a) => {
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
                  bbn.fn.extend(dt, vm.filterValue);
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
    /**
     * Checks whether the component uses kendo UI
     * @todo Remove!
     * @param vm Vue
     * @returns Boolean
     */
    isKendo(vm){
      return (vm.widgetName.indexOf("kendo") === 0);
    },
    /**
     * Supposed to give the data in an appropriate way
     * @todo Remove!
     * @param vm Vue object
     * @returns {{}}
     */
    treatData(vm){
      let cfg = {};
      if ( vm.$options.props.cfg && (vm.$options.props.cfg.default !== undefined) ){
        bbn.fn.extend(cfg,bbn.fn.isFunction(vm.$options.props.cfg.default) ? vm.$options.props.cfg.default() : vm.$options.props.cfg.default);
      }
      bbn.fn.each(vm.$options.propsData, (a, n) => {
        cfg[n] = a;
      });
      if ( vm.$options.propsData.cfg ){
        bbn.fn.extend(cfg,
          typeof(vm.$options.propsData.cfg) === 'string' ?
            JSON.parse(vm.$options.propsData.cfg) :
            vm.$options.propsData.cfg
        );
      }
      return {
        widgetCfg: cfg
      };
    },
    /**
     * For components based on JQuery UI
     * @todo Remove!
     * @param Vue
     * @param Object
     */
    getOptions2(vm, obj){
      if ( !obj || (typeof(obj) !== 'object') ){
        obj = {};
      }
      let r = {};
      return bbn.fn.extend(obj || {}, r || {}, this.widgetOptions || {});
    },
    /**
     * For components based on JQuery UI
     * @todo Remove!
     * @param Vue
     * @param Object
     */
    getOptions(vm, obj){
      if ( !obj || (typeof(obj) !== 'object') ){
        obj = {};
      }
      let tmp = this.treatData(vm),
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
      return bbn.fn.extend(obj, r);
    },
    /**
     * Sets default object for a component, accessible through bbn.vue.defaults[cpName]
     * @param Object defaults 
     * @param String cpName 
     */
    initDefaults(defaults){
      if ( typeof defaults !== 'object' ){
        throw new Error("The default object sent for defaults is not an object");
      }
      bbn.fn.extend(true, bbn.vue.defaults, defaults);
    },

    setDefaults(defaults, cpName){
      if ( typeof defaults !== 'object' ){
        throw new Error("The default object sent is not an object " + cpName);
      }
      bbn.vue.defaults[cpName] = bbn.fn.extend(bbn.vue.defaults[cpName] || {}, defaults);
    },

    setComponentRule(url, prefix){
      if ( url ){
        this.localURL = url;
        if ( this.localURL.substr(-1) !== '/' ){
          this.localURL += '/';
        }
        this.localPrefix = prefix || '';
      }
    },

    setDefaultComponentRule(url, prefix){
      if ( url ){
        this.defaultLocalURL = url;
        this.defaultLocalPrefix = prefix || '';
        this.setComponentRule(url, prefix);
      }
    },

    unsetComponentRule(){
      this.localURL = this.defaultLocalURL;
      this.localPrefix = this.defaultLocalPrefix;
    },

    addComponent(name, mixins){
      if ( this.localURL ){
        let componentName = bbn.fn.replaceAll("/", "-", name);
        if ( this.localPrefix ){
          componentName = this.localPrefix + '-' + componentName;
        }
        this.announceComponent(componentName, this.localURL + name, mixins);
      }
    },

    getStorageComponent(name){
      if ( window.store ){
        let tmp = window.store.get(name);
        if ( tmp ){
          tmp = JSON.parse(tmp);
          return tmp.value;
        }
      }
      return false;
    },

    setStorageComponent(name, obj){
      if ( window.store ){
        return window.store.set(name, JSON.stringify({
          value: obj,
          time: (new Date()).getTime()
        }));
      }
      return false;
    },

    queueComponent(name, url, mixins, resolve, reject){
      clearTimeout(this.queueTimer);
      let def = false;//this.getStorageComponent(name);
      if ( def ){
        this._realDefineComponent(name, def, mixins);
        this.queueTimer = setTimeout(() => {
          resolve('ok1')
          return 'ok2';
        })
      }
      else{
        this.queue.push({
          name: name,
          url: url,
          mixins: mixins,
          resolve: resolve,
          reject: reject
        });
        this.queueTimer = setTimeout(() => {
          let todo = this.queue.splice(0, this.queue.length);
          this.executeQueueItems(todo);
          /*
          bbn.fn.log("TODO", todo);
          bbn.fn.each(todo, (a, i) => {
            this.executeQueueItem(a);
          });
          */
        }, this.loadDelay)
      }
      return this.queueTimer
    },

    _realDefineComponent(name, r, mixins){
      if ( r && r.script ){
        if ( r.css ){
          $(document.head).append('<style>' + r.css + '</style>');
        }
        if ( r.content ){
          $(document.body).append('<script type="text/x-template" id="bbn-tpl-component-' + name + '">' + r.content + '</script>');
        }
        let data = r.data || {};
        let res = eval(r.script);
        if ( typeof res === 'object' ){
          if ( !res.mixins ){
            res.mixins = [];
          }
          if ( !res.template ){
            res.template = '#bbn-tpl-component-' + name;
          }
          if ( !res.props ){
            res.props = {};
          }
          if ( !res.props.source ){
            res.props.source = {};
          }
          if ( !res.name ){
            res.name = name;
          }
          if ( res.mixins && !bbn.fn.isArray(res.mixins) ){
            res.mixins = [res.mixins];
          }
          if ( mixins ){
            if ( !bbn.fn.isArray(mixins) ){
              mixins = [mixins];
            }
            if ( res.mixins ){
              bbn.fn.each(mixins, (b) => {
                res.mixins.push(b);
              })
            }
            else{
              res.mixins = mixins;
            }
          }
          let bits = res.name.split('-'),
              st = '';
          bbn.fn.each(bits, (b) => {
            st += (b + '-');
            let idx = bbn.fn.search(this.knownPrefixes, {prefix: st});
            if ( (idx > -1) && this.knownPrefixes[idx].mixins ){
              if ( bbn.fn.isArray(this.knownPrefixes[idx].mixins) ){
                bbn.fn.each(this.knownPrefixes[idx].mixins.reverse(), (m) => {
                  res.mixins.unshift(m)
                })
              }
              else{
                res.mixins.unshift(this.knownPrefixes[idx].mixins)
              }
            }
          });
          if ( Object.keys(data).length ){
            res.props.source.default = () => {
              return data;
            }
          }
          //bbn.fn.log(name, res);
          Vue.component(name, res);
          return true;
        }
      }
      return false;
    },

    executeQueueItems(items){
      if ( items.length ){
        let url = 'components';
        bbn.fn.iterate(items, (a) => {
          url += '/' + a.name;
        });
        url += '?v=' + bbn.version;
        return axios.get(url, {responseType:'json'}).then((d) => {
          d = d.data;
          if ( d && d.success && d.components ){
            bbn.fn.iterate(items, (a, n) => {
              if ( d.components[n] && this._realDefineComponent(a.name, d.components[n], a.mixins) ){
                //this.setStorageComponent(a.name, d.components[n]);
                a.resolve('ok3');
              }
              else{
                a.reject();
              }
            })
          }
        })
      }
      return false;
    },

    executeQueueItem(a){
      if ( a.url ) {
        return axios.get(a.url, {responseType:'json'}).then((r) => {
          r = r.data;
          if ( this._realDefineComponent(a.name, r, a.mixins) ){
            a.resolve('ok4');
            return;
          }
          a.reject();
        })
      }
      return false;
    },

    preloadBBN(todo){
      if ( typeof todo  === 'string' ){
        todo = [todo];
      }
      if ( bbn.fn.isArray(todo) ){
        bbn.fn.each(todo, (a) => {
          if ( Vue.options.components['bbn-' + a] === undefined ){
            this.queueComponentBBN(a);
          }
        })
      }
    },

    _realDefineBBNComponent(name, r){
      if ( r.html && r.html.length ){
        bbn.fn.each(r.html, (h, j) => {
          if ( h && h.content ){
            let id = 'bbn-tpl-component-' + name + (h.name === name ? '' : '-' + h.name),
                $tpl = $('<script type="text/x-template" id="' + id + '"></script>');
            $tpl.html(h.content);
            document.body.appendChild($tpl[0]);
          }
        })
      }
      if ( r.css ){
        $(document.head).append('<style>' + r.css + '</style>');
      }
      // When the script is in the storage
      if ( typeof r.script === 'string' ){
        r.script = eval(r.script);
      }
      let result = r.script();
      if ( Vue.options.components['bbn-' + name] !== undefined ){
        return true;
      }
      return false;
    },

    /** Adds an array of components, calling them all at the same time, in a single script */
    executeQueueBBNItem(todo){
      if ( todo.length ){
        let url = bbn_root_url + bbn_root_dir + 'components/?components=' + bbn.fn.map(todo, (a) => {
          return a.name;
        }).join(',') + '&v=' + bbn.version;
        if ( bbn.env.isDev ){
          url += '&test=1';
        }
        if ( bbn.env.lang ){
          url += '&lang=' + bbn.env.lang;
        }
        return bbn.fn.ajax(url, 'text')
          .then(
            // resolve from server
            (res) => {
              if ( res.data ){
                // This executes the script returned by the server, which will return a new promise
                let prom = eval(res.data);
                //bbn.fn.log("THEN", res);
                prom.then(
                  // resolve from executed script
                  (arr) => {
                    // arr is the answer!
                    if (bbn.fn.isArray(arr) ){
                      bbn.fn.each(arr, (r) => {
                        let resolved = false;
                        if ( (typeof(r) === 'object') && r.script && r.name ){
                          let idx = bbn.fn.search(todo, {name: r.name});
                          if ( idx > -1 ){
                            resolved = this._realDefineBBNComponent(r.name, r);
                            if ( resolved ){
                              todo[idx].resolve(Vue.options.components['bbn-' + r.name]);
                              /*
                              // Replacing function(){} with () => {}, error otherwise
                              r.script = '() => {' + r.script.toString().substr(11);
                              this.setStorageComponent('bbn-' + r.name, r);
                              */
                            }
                            else{
                              todo[idx].reject();
                            }
                          }
                        }
                      });
                    }
                    return prom;
                  },
                  // executed script has an error
                  () => {
                    bbn.fn.log("ERROR in the executed script from the server");
                    throw new Error("Problem in the executed script from the server from " + url)
                  }
                );
              }
              else{
                bbn.fn.error(url);
              }
            },
            // reject: no return from the server
            () => {
              bbn.fn.log("ERROR in executeQueueBBNItem");
              throw new Error("Impossible to find the components from " + url)
            }
          );
        }
    },

    queueComponentBBN(name, resolve, reject){
      if ( bbn.fn.search(this.queueBBN, {name: name}) === -1 ){
        clearTimeout(this.queueTimerBBN);
        let def = false;//this.getStorageComponent('bbn-' + name);
        if ( def ){
          this._realDefineBBNComponent(name, def);
          this.queueTimer = setTimeout(() => {
            if ( resolve ){
              resolve('ok6');
            }
            return 'ok7';
          })
        }
        else{
          this.queueBBN.push({
            name: name,
            resolve: resolve || (function(){}),
            reject: reject || (function(){})
          });
          this.queueTimerBBN = setTimeout(() => {
            if ( this.queueBBN.length ){
              this.executeQueueBBNItem(this.queueBBN.splice(0, this.queueBBN.length));
            }
          }, this.loadDelay);
        }
      }
      return this.queueTimerBBN;
    },

    announceComponent(name, url, mixins){
      if ( !this.isNodeJS && (typeof(name) === 'string') && (Vue.options.components[name] === undefined) ){
        Vue.component(name, (resolve, reject) => {
          return this.queueComponent(name, url, mixins, resolve, reject);
        });
      }
    },

    unloadComponent(cpName){
      if ( Vue.options.components[cpName] ){
        let r = delete Vue.options.components[cpName];
        let idx = this.parsedTags.indexOf(cpName);
        if ( idx > -1 ){
          this.parsedTags.splice(idx, 1);
        }
        let tpl = document.getElementById('bbn-tpl-component-' + cpName);
        if ( tpl ){
          tpl.remove();
        }
        return r;
      }
      return false;
    },

    // Looks if the given tag starts with one of the known prefixes,
    // and it such case defines the component with the corresponding handler
    loadComponentsByPrefix(tag){
      let res = isReservedTag(tag);
      // Tag is unknown and has never gone through this function
      if ( tag && !res && (this.parsedTags.indexOf(tag) === -1) ){
        this.parsedTags.push(tag);
        let idx = -1;
        /** @todo add an extended object of all the mixins for all related path */
        let mixins = [];
        // Looking for a corresponding prefix rule
        bbn.fn.each(this.knownPrefixes, (a, i) => {
          if ( a.prefix && (tag.indexOf(a.prefix) === 0) && a.handler && bbn.fn.isFunction(a.handler) ){
            // Taking the longest (most precise) prefix's rule
            if ( a.mixins ){
              mixins = mixins.concat(a.mixins);
            }
            if ( idx > -1 ){
              if ( this.knownPrefixes[i].prefix.length > this.knownPrefixes[idx].prefix.length ){
                idx = i;
              }
            }
            else{
              idx = i;
            }
          }
        });
        // A rule has been found
        if ( idx > -1 ){
          Vue.component(tag, (resolve, reject) => {
            this.knownPrefixes[idx].handler(tag, resolve, reject);
          });
        }
      }
      return false;
    },

    addPrefix(prefix, handler, mixins){
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
      this.knownPrefixes.push({
        prefix: prefix,
        handler: handler,
        mixins: mixins || []
      });
    },

    resetDefBBN(cp){
      if ( Vue.options.components[cp] ){
        delete Vue.options.components['bbn-' + cp];
        Vue.component('bbn-' + cp, (resolve, reject) => {
          this.queueComponentBBN(cp, resolve, reject);
        });
      }
    },

    resetDef(cp){
      if ( Vue.options.components[cp] ){
        delete Vue.options.components[cp];
        Vue.component(cp, (resolve, reject) => {
          this.queueComponent(cp, resolve, reject);
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
        if ( this.is(vm.$parent, selector) ){
          if ( !checkEle || (test !== vm.$parent.$el) ){
            return vm.$parent;
          }
        }
        vm = vm.$parent;
      }
      return false;
    },

    ancesters(vm, selector, checkEle){
      let res = [];
      let test = vm.$el;
      while ( vm && vm.$parent && (vm !== vm.$parent) ){
        if ( this.is(vm.$parent, selector) ){
          if ( !checkEle || (test !== vm.$parent.$el) ){
            res.push(vm.$parent);
          }
        }
        vm = vm.$parent;
      }
      return res;
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
            if ( selector && this.is(obj, selector) ){
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
      let tmp = this.getChildByKey(vm, key, selector);
      if ( !tmp && vm.$children ){
        for ( let i = 0; i < vm.$children.length; i++ ){
          if ( tmp = this.findByKey(vm.$children[i], key, selector, ar) ){
            if (bbn.fn.isArray(ar) ){
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
      this.findByKey(vm, key, selector, ar);
      return ar;
    },

    find(vm, selector, index){
      let vms = this.getComponents(vm);
      let realIdx = 0;
      index = parseInt(index) || 0;
      if ( vms ){
        for ( let i = 0; i < vms.length; i++ ){
          if ( this.is(vms[i], selector) ){
            if ( realIdx === index ){
              return vms[i];
            }
            realIdx++;
          }
        }
      }
    },

    findAll(vm, selector, only_children){
      let vms = this.getComponents(vm, only_children),
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
      bbn.fn.each(vm.$children, (obj) => {
        ar.push(obj)
        if ( !only_children && obj.$children ){
          this.getComponents(obj, ar);
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
      return vm.currentPopup || null;
    },

    replaceArrays(oldArr, newArr, key){
      if ( key &&bbn.fn.isArray(oldArr, newArr) ){
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

    extend(vm){
      let deep = false;
      let args = [];
      bbn.fn.each (arguments, (a, i) => {
        if ( i > 0 ){
          if ( a === true ){
            deep = true;
          }
          else{
            args.push(a);
          }
        }
      });
      if ( !args.length ){
        throw new Error("No argument given");
      }
      let out = args.splice(0, 1)[0];
      bbn.fn.each(args, (a) => {
        if ( !bbn.fn.isObject(a) ){
          throw new Error("Each argument for bbn.fn.extend must be an object, " + typeof(args[i]) + " given");
        }
        else{
          bbn.fn.iterate(a, (o, n) => {
            if ( deep && bbn.fn.isObject(o) && bbn.fn.isObject(out[n]) ){
              bbn.fn.extend(true, out[n], o);
            }
            else if ( out[n] !== o ){
              vm.$set(out[n], o);
            }
          });
        }
      })
      return out;
    },


  })
})(window.bbn);