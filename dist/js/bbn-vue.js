((bbn) => {
  "use strict";
  let version = '2.0.2';
  let libURL = '';
  if (bbn_root_dir && bbn_root_url) {
    libURL = bbn_root_url + bbn.fn.dirName(bbn_root_dir) + '/';
  }

  bbn.fn.autoExtend("vue", {
    uid: 0,
    libURL: libURL,
    defaultLocalURL: false,
    defaultLocalPrefix: '',
    localURL: false,
    version: version,
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
    components: {},
    loadDelay: 5,
  })
})(window.bbn);



((bbn) => {
  "use strict";
  const isReservedTag = Vue.config.isReservedTag;
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
      return vm.$parent ? bbn.vue._retrievePopup(vm.$parent) : false;
    },
    /**
     * Sets default object for a component, accessible through bbn.vue.defaults[cpName].
     * 
     * @method initDefaults
     * @memberof bbn.vue
     * @param Object defaults 
     * @param String cpName 
     */
    initDefaults(defaults){
      if ( typeof defaults !== 'object' ){
        throw new Error("The default object sent for defaults is not an object");
      }
      bbn.fn.extend(true, bbn.vue.defaults, defaults);
    },

    /**
     * @method setDefaults
     * @memberof bbn.vue
     * @param {Object} defaults 
     * @param {String} cpName
     */
    setDefaults(defaults, cpName){
      if ( typeof defaults !== 'object' ){
        throw new Error("The default object sent is not an object " + cpName);
      }
      bbn.vue.defaults[cpName] = bbn.fn.extend(bbn.vue.defaults[cpName] || {}, defaults);
    },

    /**
     * @method setComponentRule
     * @memberof bbn.vue
     * @param {String} url 
     * @param {String} prefix
     */
    setComponentRule(url, prefix){
      if ( url ){
        bbn.vue.localURL = url;
        if ( bbn.vue.localURL.substr(-1) !== '/' ){
          bbn.vue.localURL += '/';
        }
        bbn.vue.localPrefix = prefix || '';
      }
    },

    /**
     * @method setDefaultComponentRule
     * @memberof bbn.vue
     * @param {String} url 
     * @param {String} prefix
     */
    setDefaultComponentRule(url, prefix){
      if ( url ){
        bbn.vue.defaultLocalURL = url;
        bbn.vue.defaultLocalPrefix = prefix || '';
        bbn.vue.setComponentRule(url, prefix);
      }
    },

    /**
     * @method unsetComponentRule
     * @memberof bbn.vue
     */
    unsetComponentRule(){
      bbn.vue.localURL = bbn.vue.defaultLocalURL;
      bbn.vue.localPrefix = bbn.vue.defaultLocalPrefix;
    },

    /**
     * @method addComponent
     * @memberof bbn.vue
     * @param {String} name 
     * @param {Array} mixins
     */
    addComponent(name, mixins){
      if ( this.localURL ){
        let componentName = bbn.fn.replaceAll("/", "-", name);
        if ( this.localPrefix ){
          componentName = this.localPrefix + '-' + componentName;
        }
        this.announceComponent(componentName, this.localURL + name, mixins);
      }
    },

    /**
     * @method getStorageComponent
     * @memberof bbn.vue
     * @param {String} name 
     */
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

    /**
     * @method setStorageComponent
     * @memberof bbn.vue
     * @param {String} name 
     * @param {Object} obj
     */
    setStorageComponent(name, obj){
      if ( window.localStorage ){
        return window.localStorage.setItem(name, JSON.stringify({
          value: obj,
          time: (new Date()).getTime()
        }));
      }
      return false;
    },

    /**
     * @method queueComponent
     * @memberof bbn.vue
     * @param {String} name 
     * @param {String} url
     * @param {Array} mixins
     * @param {Function} resolve
     * @param {Function} reject
     */
    queueComponent(name, url, mixins, resolve, reject){
      clearTimeout(this.queueTimer);
      let def = false;//this.getStorageComponent(name);
      if ( def ){
        this._realDefineComponent(name, def, mixins);
        this.queueTimer = setTimeout(() => {
          resolve(true)
          return true;
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

    /**
     * @method _realDefineComponent
     * @memberof bbn.vue
     * @param {String} name 
     * @param {Object} r
     * @param {Array} mixins
     */
    _realDefineComponent(name, r, mixins){
      if ( r && r.script ){
        if ( r.css ){
          let el = document.createElement('style');
          el.innerHTML = r.css;
          document.head.insertAdjacentElement('beforeend', el)
        }
        if ( r.content ){
          let script = document.createElement('script');
          script.innerHTML = r.content;
          script.setAttribute('id', 'bbn-tpl-component-' + name);
          script.setAttribute('type', 'text/x-template');
          document.body.insertAdjacentElement('beforeend', script)
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

    /**
     * @method executeQueueItems
     * @memberof bbn.vue
     * @param {Array} items
     */
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
            bbn.fn.iterate(items, a => {
              let cp = bbn.fn.getRow(d.components, {name: a.name});
              if ( cp && this._realDefineComponent(a.name, cp, a.mixins) && Vue.options.components[a.name]) {
                a.resolve(Vue.options.components[a.name])
              }
              else{
                bbn.fn.log("PROMISE REJECT OF" + a.name, a);
                a.reject();
                throw new Error(bbn._("Impossible to load the component") + ' ' + a.name);
              }
            })
          }
        })
      }
      return false;
    },

    /**
     * @method executeQueueItem
     * @memberof bbn.vue
     * @param {Object} item
     */
    executeQueueItem(item){
      if (item.url) {
        return axios.get(item.url, {responseType:'json'}).then((r) => {
          r = r.data;
          if ( this._realDefineComponent(a.name, r, item.mixins)  && Vue.options.components[a.name]){
            item.resolve(Vue.options.components[a.name]);
          }
          else {
            item.reject();
          }
        })
      }
      return false;
    },

    /**
     * @method preloadBBN
     * @memberof bbn.vue
     * @param {Array} todo
     */
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

    /**
     * @method _realDefineComponent
     * @memberof bbn.vue
     * @param {String} name 
     * @param {Object} r
     */
    _realDefineBBNComponent(name, r){
      if ( r.html && r.html.length ){
        bbn.fn.each(r.html, (h) => {
          if ( h && h.content ){
            let id = 'bbn-tpl-component-' + name + (h.name === name ? '' : '-' + h.name),
            script = document.createElement('script');
            script.innerHTML = h.content;
            script.setAttribute('id', id);
            script.setAttribute('type', 'text/x-template');
            document.body.appendChild(script);
          }
        })
      }
      if ( r.css ){
        let el = document.createElement('style');
          el.innerHTML = r.css;
          document.head.insertAdjacentElement('beforeend', el)
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

    /**
     * Adds an array of components, calling them all at the same time, in a single script.
     * 
     * @method executeQueueItems
     * @memberof bbn.vue
     * @param {Array} items
     */
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

    /**
     * @method queueComponentBBN
     * @memberof bbn.vue
     * @param {String} name 
     * @param {Function} resolve
     * @param {Function} reject
     */
    queueComponentBBN(name, resolve, reject) {
      if (bbn.env.host.indexOf('test') === -1) {
        if ( bbn.fn.search(this.queueBBN, {name: name}) === -1 ){
          clearTimeout(this.queueTimerBBN);
          let def = false;
          if ( def ){
            this._realDefineBBNComponent(name, def);
            this.queueTimer = setTimeout(() => {
              if ( resolve ){
                resolve(true);
              }
              return true;
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
      }
      return bbn.fn.ajax(bbn.vue.libURL + 'dist/js/components/' + name + '/' + name + '.js', 'text').then(d => {
        if (d && d.data) {
          let fn = eval(d.data);
          if (bbn.fn.isFunction(fn)) {
            fn(resolve);
          }
        }
      })
    },

    /**
     * @method announceComponent
     * @memberof bbn.vue
     * @param {String} name 
     * @param {String} url
     * @param {Array} mixins
     */
    announceComponent(name, url, mixins){
      if ( !this.isNodeJS && (typeof(name) === 'string') && (Vue.options.components[name] === undefined) ){
        Vue.component(name, (resolve, reject) => {
          return this.queueComponent(name, url, mixins, resolve, reject);
        });
      }
    },

    /**
     * @method unloadComponent
     * @memberof bbn.vue
     * @param {String} cpName
     */
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

    /**
     * Looks if the given tag starts with one of the known prefixes, and it such case defines the component with the corresponding handler.
     * 
     * @method loadComponentsByPrefix
     * @memberof bbn.vue
     * @param {String} cpName t
     */
    loadComponentsByPrefix(tag){
      let res = isReservedTag(tag);
      // Tag is unknown and has never gone through this function
      if ( tag && !res && (this.parsedTags.indexOf(tag) === -1) ){
        this.parsedTags.push(tag);
        let idx = -1;
        /** @todo add an extended object of all the mixins for all related path */
        let mixins = [];
        // Looking for a corresponding prefix rule
        bbn.fn.each(bbn.vue.knownPrefixes, (a, i) => {
          if ( a.prefix && (tag.indexOf(a.prefix) === 0) && a.handler && bbn.fn.isFunction(a.handler) ){
            // Taking the longest (most precise) prefix's rule
            if ( a.mixins ){
              mixins = mixins.concat(a.mixins);
            }
            if ( idx > -1 ){
              if ( bbn.vue.knownPrefixes[i].prefix.length > bbn.vue.knownPrefixes[idx].prefix.length ){
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
            bbn.vue.knownPrefixes[idx].handler(tag, resolve, reject);
          });
        }
      }
      return false;
    },

    /**
     * @method addPrefix
     * @memberof bbn.vue
     * @param {String} prefix 
     * @param {Function} handler
     * @param {Array} mixins
     */
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
      bbn.vue.knownPrefixes.push({
        prefix: prefix,
        handler: handler,
        mixins: mixins || []
      });
    },

    /**
     * @method resetDefBBN
     * @memberof bbn.vue
     * @param {String} cp 
     */
    resetDefBBN(cp){
      if ( Vue.options.components[cp] ){
        delete Vue.options.components['bbn-' + cp];
        Vue.component('bbn-' + cp, (resolve, reject) => {
          bbn.vue.queueComponentBBN(cp, resolve, reject);
        });
      }
    },

    /**
     * @method resetDef
     * @memberof bbn.vue
     * @param {String} cp 
     */
    resetDef(cp){
      if ( Vue.options.components[cp] ){
        delete Vue.options.components[cp];
        Vue.component(cp, (resolve, reject) => {
          bbn.vue.queueComponent(cp, resolve, reject);
        });
      }
    },

    /**
     * @method retrieveRef
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {String} path 
     */
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

    /**
     * @method is
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {String} selector
     */
    is(vm, selector){
      if (selector && vm) {
        if ( vm.$vnode && vm.$vnode.componentOptions && (vm.$vnode.componentOptions.tag === selector) ){
          return true;
        }
        if (vm.$el && bbn.fn.isFunction(vm.$el.matches)) {
          return vm.$el.matches(selector);
        }
      }
      return false;
    },

    /**
     * @method closest
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {String} selector
     * @param {Boolean} checkEle
     */
    closest(vm, selector, checkEle){
      if (!checkEle) {
        vm = vm.$parent;
      }
      while (vm) {
        if (bbn.vue.is(vm, selector)) {
          return vm;
        }
        vm = vm.$parent;
      }
      return false;
    },

    /**
     * @method closest
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {String} selector
     * @param {Boolean} checkEle
     */
    ancesters(vm, selector, checkEle){
      let res = [];
      let test = vm.$el;
      while ( vm && vm.$parent && (vm !== vm.$parent) ){
        if ( bbn.vue.is(vm.$parent, selector) ){
          if ( !checkEle || (test !== vm.$parent.$el) ){
            res.push(vm.$parent);
          }
        }
        vm = vm.$parent;
      }
      return res;
    },

    /**
     * @method getRef
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {String} name
     */
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

    /**
     * @method getChildByKey
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {String} key
     * @param {String} selector
     */
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

    /**
     * @method findByKey
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {String} key
     * @param {String} selector
     * @param {Array} ar
     */
    findByKey(vm, key, selector, ar){
      let tmp = bbn.vue.getChildByKey(vm, key, selector);
      if ( !tmp && vm.$children ){
        for ( let i = 0; i < vm.$children.length; i++ ){
          if ( tmp = bbn.vue.findByKey(vm.$children[i], key, selector, ar) ){
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

    /**
     * @method findAllByKey
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {String} key
     * @param {String} selector
     */
    findAllByKey(vm, key, selector){
      let ar = [];
      bbn.vue.findByKey(vm, key, selector, ar);
      return ar;
    },

    /**
     * @method find
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {String} selector
     * @param {Number} index
     */
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

    /**
     * @method findAll
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {String} selector
     * @param {Boolean} only_children
     */
    findAll(vm, selector, only_children){
      let vms = bbn.vue.getComponents(vm, [], only_children),
          res = [];
      for ( let i = 0; i < vms.length; i++ ){
        if ( bbn.vue.is(vms[i], selector) ){
          res.push(vms[i]);
        }
      }
      return res;
    },

    /**
     * @method getComponents
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {Array} ar
     * @param {Boolean} only_children
     */
    getComponents(vm, ar, only_children){
      if ( !Array.isArray(ar) ){
        ar = [];
      }
      bbn.fn.each(vm.$children, (obj) => {
        ar.push(obj)
        if ( !only_children && obj.$children ){
          bbn.vue.getComponents(obj, ar);
        }
      });
      return ar;
    },

    /**
     * @method makeUID
     * @memberof bbn.vue
     */
    makeUID(){
      return bbn.fn.md5(bbn.fn.randomString(12, 30));
    },

    /**
     * @method getRoot
     * @todo Remove! $root is enough
     * @memberof bbn.vue
     * @param {Vue} vm 
     */
    getRoot(vm){
      let e = vm;
      while ( e.$parent ){
        e = e.$parent;
      }
      return e;
    },

    /**
     * @method getPopup
     * @memberof bbn.vue
     * @param {Vue} vm 
     */
    getPopup(vm){
      return vm.currentPopup || null;
    },

    /**
     * @method replaceArrays
     * @todo Remove! should be in bbn.fn
     * @memberof bbn.vue
     * @param {Array} oldArr
     * @param {Array} newArr
     * @param {[Number|String]} key
     */
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

    /**
     * @method extend
     * @todo Check if still needed
     * @memberof bbn.vue
     * @param {Vue} vm 
     */
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

    /**
     * Retrieves the URL of the closest container.
     * 
     * @method getContainerURL
     * @todo Check if still needed
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @returns {String}
     */
    getContainerURL(vm){
      let container = vm.closest('bbn-container');
      if ( container ){
        return container.getFullCurrentURL();
      }
      return '';
    },

    /**
     * @method post
     * @todo Check if still needed
     * @memberof bbn.vue
     * @param {Vue} vm 
     */
    post(vm, args){
      let cfg = bbn.fn.treatAjaxArguments(args);
      let referer = bbn.vue.getContainerURL(vm);
      if ( !referer && bbn.env.path ){
        referer = bbn.env.path;
      }
      cfg.obj = bbn.fn.extend({}, cfg.obj || {}, {_bbn_referer: referer, _bbn_key: bbn.fn.getRequestId(cfg.url, cfg.obj, 'json')});
      return bbn.fn.post(cfg);
    },

    /**
     * @method postOut
     * @todo Check if still needed
     * @memberof bbn.vue
     * @param {Vue} vm 
     */
    postOut(vm, url, obj, onSuccess, target){
      let referer = bbn.vue.getContainerURL(vm);
      obj = bbn.fn.extend({}, obj || {}, {_bbn_referer: referer, _bbn_key: bbn.fn.getRequestId(url, obj, 'json')});
      return bbn.fn.postOut(url, obj, onSuccess, target);
    }


  })
})(window.bbn);


((bbn) => {
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
            bbn.fn.each(this.$children, (a) => {
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
            this.$emit('ready', this);
          }
        }
      }
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Basic Component.
     *
     * @component emptyComponent
     */
    emptyComponent: {
      template: '<template><slot></slot></template>',
      /**
       * Adds the class 'bbn-empty-component' to the component's template.
       * @event created
       * @memberof emptyComponent
       */
      created(){
        this.componentClass.push('bbn-empty-component');
      },
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Dimensions Component.
     *
     * @component dimensionsComponent
     */
    dimensionsComponent: {
      props: {
       /**
        * The maximum width of the component.
        * @prop {Number|String} maxWidth
        * @memberof dimensionsComponent
        */
        maxWidth: {
          type: [Number, String]
        },
       /**
        * The maximum height of the component.
        * @prop {Number|String} maxHeight
        * @memberof dimensionsComponent
        */
        maxHeight: {
          type: [Number, String]
        },
       /**
        * The minimum width of the component.
        * @prop {Number|String} minWidth
        * @memberof dimensionsComponent
        */
        minWidth: {
          type: [Number, String]
        },
       /**
        * The minimum height of the component.
        * @prop {Number|String} maxHeight
        * @memberof dimensionsComponent
        */
        minHeight: {
          type: [Number, String]
        },
       /**
        * The width of the component.
        * @memberof dimensionsComponent
        * @prop {String|Number|Boolean} width
        */
        width: {
          type: [String, Number, Boolean]
        },
       /**
        * The height of the component.
        * @memberof dimensionsComponent
        * @prop {String|Number|Boolean} height
        */
        height: {
          type: [String, Number, Boolean]
        },
      },
      data(){
        return {
         /**
          * The current height of the component.
          * @memberof dimensionsComponent
          * @data [null] currentHeight
          */
          currentHeight: null,
         /**
          * The current width of the component.
          * @data [null] currentWidth
          */
          currentWidth: null,
         /**
          * The current min-height of the component.
          * @memberof dimensionsComponent 
          * @data [null] currentMinHeight
          */
          currentMinHeight: null,
         /**
          * The current min-width of the component.
          * @memberof dimensionsComponent
          * @data [null] currentMinWidth
          */
          currentMinWidth: null,
         /**
          * The current max-height of the component.
          * @memberof dimensionsComponent
          * @data [null] currentMaxHeight
          */
          currentMaxHeight: null,
         /**
          * The current max-width of the component.
          * @memberof dimensionsComponent
          * @data [null] currentMaxWidth
          */
          currentMaxWidth: null,
        };
      }
    },
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    positionComponent: {
      props: {
        /**
        * The position 'left'.
        * @memberof positionComponent
        * @prop {Number} left
        */
        left: {
          type: Number
        },
        /**
        * The position 'right'.
        * @memberof positionComponent
        * @prop {Number} right
        */
        right: {
          type: Number
        },
        /**
        * The position 'top'.
        * @memberof positionComponent
        * @prop {Number} top
        */
        top: {
          type: Number
        },
        /**
        * The position 'bottom'.
        * @memberof positionComponent
        * @prop {Number} bottom
        */
        bottom: {
          type: Number
        },
      }
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Dropdown Component.
     *
     * @component dropdownComponent
     */
    dropdownComponent: {
      props: {
        /**
         * The text corresponding to the value of the component.
         * @memberof dropdownComponent
         * @prop {String} [''] textValue
         */
        textValue: {
          type: String,
          default: ''
        },
        /**
         * @todo description
         * @memberof dropdownComponent
         * @prop valueTemplate
         */
        valueTemplate: {},
        /**
         * Defines the groups for the dropdown menu.
         * @memberof dropdownComponent
         * @prop {String} group
         */
        group: {
          type: String
        },
        /**
         * Defines the mode of the dopdown menu.
         * @memberof dropdownComponent
         * @prop {String} ['selection'] mode
         */
        mode: {
          type: String,
          default: 'selection'
        },
        /**
         * The max-height of the component.
         * @memberof dropdownComponent
         * @prop {Number|String} maxHeight
         */
        maxHeight: {
          type: [Number, String]
        },
        /**
         * Defines whether or not the component has to suggest a value when start typing.
         * @memberof dropdownComponent
         * @prop {Boolean} [false] suggest
         */
        suggest: {
          type: Boolean,
          default: false
        }
      },
      data(){
        return {
          /**
           * The icon representing the arrow up.
           * @data {String} ['nf nf-fa-caret_up'] iconUp
           * @memberof dropdownComponent
           */
          iconUp: 'nf nf-fa-caret_up',
          /**
           * The icon representing the arrow down.
           * @data {String} ['nf nf-fa-caret_down'] iconDown
           * @memberof dropdownComponent
           */
          iconDown: 'nf nf-fa-caret_down',
          /**
           * True if the floating menu of the component is opened.
           * @data {Boolean} [false] isOpened
           * @memberof dropdownComponent
           */
          isOpened: false,
          /**
           * The text corresponding to the value of the component.
           * @data {String} [''] currentText
           * @memberof dropdownComponent
           */
          currentText: this.textValue || '',
          /**
           * The current width of the component.
           * @data {Number} [0] currentWidth
           * @memberof dropdownComponent
           */
          currentWidth: 0,
          /**
           * The current height of the component.
           * @data {Number} [0] currentHeight
           * @memberof dropdownComponent
           */
          currentHeight: 0,
          /**
           * Whether or not the component is active.
           * @data {Boolean} false isActive
           * @memberof dropdownComponent
           */
          isActive: false
        };
      },
      computed: {
        /**
         * Returns the current 'text' corresponding to the value of the component.
         * @computed currentTextValue
         * @memberof dropdownComponent
         * @returns {String}
         */
        currentTextValue(){
          if ( this.value && this.sourceValue && this.sourceText && this.currentData.length ){
            let idx = bbn.fn.search(this.currentData, (a) => {
              return a.data[this.sourceValue] === this.value;
            });
            if ( idx > -1 ){
              return this.currentData[idx].data[this.sourceText];
            }
          }
          else if ( this.textValue ){
            return this.textValue;
          }
          return '';
        },
        isSearching(){
          return this.currentText !== this.currentTextValue;
        }
      },
      methods: {
        /**
         * Select the string of text inside of the input.
         * @method selectText
         * @memberof dropdownComponent
         */
        selectText(){
          this.getRef('input').selectText();
        },
          /**
         * Handles the resize of the component
         * @method onResize
         * @memberof dropdownComponent
         */
        onResize(){
          this.currentWidth = this.$el.offsetWidth;
          this.currentHeight = this.$el.offsetHeight;
        },
        /**
         * Manages the click
         * @method click
         * @memberof dropdownComponent
         */
        click(){
          if (!this.disabled && this.filteredData.length && bbn.fn.isDom(this.$el)) {
            this.isOpened = !this.isOpened;
            this.$el.querySelector('input:not([type=hidden])').focus();
            //this.getRef('input').getRef('element').focus();
          }
        },
        /**
         * Closes the floater menu of the component.
         * @method leave
         * @param element 
         * @memberof dropdownComponent
         */
        leave(){
          let lst = this.getRef('list');
          if ( lst ){
            lst.close(true);
          }
        },
        /**
         * Emits the event 'select' 
         * @method select
         * @param {Object} item 
         * @param {Number} idx 
         * @param {Number} dataIndex 
         * @param {Event} e 
         * @emit change
         * @memberof dropdownComponent
         */
        select(item, idx, dataIndex, e){
          if ( item && (item[this.uid || this.sourceValue] !== undefined) ){
            if (!e || !e.defaultPrevented) {
              this.emitInput(item[this.uid || this.sourceValue]);
              this.$emit('change', item[this.uid || this.sourceValue]);
            }
          }
          this.isOpened = false;
        },
        /**
         * Defines the behavior of component when the key 'alt' or a common key defined in the object bbn.var.keys is pressed. 
         * @method commonKeydown
         * @memberof dropdownComponent
         * @param {Event} e 
         */
        commonKeydown(e){
          bbn.fn.log("Common keydown from mixin");
          if (!this.filteredData.length || e.altKey || e.ctrlKey || e.metaKey) {
            return;
          }
          if (e.key === 'Tab') {
            let list = this.find('bbn-list');
            if ( list && (list.overIdx > -1)) {
              if ( !this.value ){
                this.emitInput(list.filteredData[list.overIdx].data[this.uid || this.sourceValue]);
                return true;
              }
            }
            this.resetDropdown();
            this.isOpened = false;
            return true;
          }
          else if (
            this.isOpened && (
              bbn.var.keys.confirm.includes(e.which) || ((e.key === ' ') && !this.isSearching)
            )
          ){
            e.preventDefault();
            let list = this.find('bbn-list');
            if (list && (list.overIdx > -1)) {
              this.select(list.filteredData[list.overIdx].data);
            }
            else if (this.isNullable) {
              this.selfEmit('');
            }
            return true;
          }
          bbn.fn.log("Common keydown from mixin (return false)");
          return false;
        },
        /**
         * Resets the dropdow to its inizial conditions.
         * @method resetDropdown
         * @memberof dropdownComponent
         */
        resetDropdown(){
          this.currentText = this.currentTextValue;
          this.unfilter();
          if ( this.isOpened ){
            this.isOpened = false;
          }
        },
        /**
         * Forces the prop 'ready' to be true.
         * @method afterUpdate
         * @memberof dropdownComponent
         */
        afterUpdate(){
          if (!this.ready) {
            this.ready = true;
          }
        },
        /**
         * Resets the filters of the dropdown to the initial conditions.
         * @method unfilter
         * @memberof dropdownComponent
         */
        unfilter(){
          this.currentFilters.conditions.splice(0, this.currentFilters.conditions.length);
        }
      },
      watch: {
        /**
         * @watch value
         * @memberof dropdownComponent
         * @param newVal 
         */
        value(){
          this.$nextTick(() => {
            this.currentText = this.currentTextValue;
          });
        },
        /**
         * @watch ready
         * @memberof dropdownComponent
         * @param newVal
         */
        ready(v){
          if (v && this.suggest && !this.value && this.filteredData.length) {
            this.emitInput(this.filteredData[0].data[this.sourceValue]);
          }
        },
        /**
         * @watch source
         * @memberof dropdownComponent
         * @param newVal 
         */
        source(){
          this.updateData().then(() => {
            if ( this.filteredData.length ) {
              this.onResize();
            }
          });
        }
      }
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    keynavComponent: {
      methods: {
        /**
         * States the role of the enter button on the dropdown menu.
         * @memberof keynavComponent
         * @method keynav
         * @param {Event} e
         * @fires widget.select
         * @fires widget.open
         *
         */
        keynav(e){
          if (this.filteredData.length && bbn.var.keys.upDown.includes(e.keyCode)) {
            e.preventDefault();
            if ( !this.isOpened ){
              this.isOpened = true;
              return;
            }
            let list = this.find('bbn-list');
            if (list) {
              list.isOver = false;
              let idx = -1;
              let d = list.filteredData;
              if (d.length === 1) {
                list.overIdx = 0;
                return;
              }
              if (list.overIdx > -1) {
                idx = list.overIdx;
              }
              switch ( e.keyCode ){
                // Arrow down
                case 40:
                  list.overIdx = d[idx+1] !== undefined ? idx+1 : 0;
                  break;
                // Arrow Up
                case 38:
                  list.overIdx = d[idx-1] !== undefined ? idx-1 : d.length - 1;
                  break;
                // Page down (10)
                case 34:
                  if (list.overIdx >= (d.length - 1)) {
                    list.overIdx = 0;
                  }
                  else{
                    list.overIdx = d[idx+10] ? idx+10 : d.length - 1;
                  }
                  break;
                // Page up (10)
                case 33:
                  if (list.overIdx <= 0) {
                    list.overIdx = d.length - 1;
                  }
                  else{
                    list.overIdx = d[idx-10] ? idx-10 : 0;
                  }
                  break;
                // End
                case 35:
                  list.overIdx = d.length - 1;
                  break;
                // Home
                case 36:
                  list.overIdx = 0;
                  break;
    
              }
              list.$forceUpdate();
            }
          }
        }
      }
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    toggleComponent: {
      props: {
        /**
         * True if the component has to be visible.
         * @memberof toggleComponent
         * @prop {Boolean} [false] true
         */
        visible: {
          type: Boolean,
          default: true
        },
        /**
         * True to focus the component.
         * @memberof toggleComponent
         * @prop {Boolean} [true] focused
         */
        focused: {
          type: Boolean,
          default: true
        }
      },
      data(){
        return {
          /**
           * If an element is focused it returns it.
           * @data {Element} prevFocused
           * @memberof toggleComponent
           */
          prevFocused: bbn.env.focused,
          /**
           * Whether or not the component is currently visible.
           * @memberof toggleComponent
           * @data {Boolean} currentVisible
           */
          currentVisible: this.visible,
          /**
           * The focusable element.
           * @memberof toggleComponent
           * @data {HTMLElement} [null] focusable
           */
          focusable: null,
          /**
           * True when the component has been opened.
           * @memberof toggleComponent
           * @data hasBeenOpened {Boolean} [false]
           */
          hasBeenOpened: false
        };
      },
      methods: {
        /**
         * Shows the slider.
         * @method show
         * @fires onResize
         * @emits show      
         */
        show(){
          let e = new Event('show', {cancelable: true});
          this.$emit('show', e);
          if (!e.defaultPrevented) {
            this.currentVisible = true;
          }
        },
        /**
         * Hides the slider.
         * @method hide
         * @emits hide      
         */
        hide(){
          let e = new Event('show', {cancelable: true});
          this.$emit('hide', e);
          if (!e.defaultPrevented) {
            this.currentVisible = false;
          }
        },
        /**
         * Toggles the slider.
         * @method toggle
         */
        toggle(){
          if (this.currentVisible) {
            this.hide();
          }
          else{
            this.show();
          }
        },
        /**
         * Change the focused element.
         * @param {boolean} v
         * @memberof toggleComponent 
         */
        switchFocus(v){
          if ( this.focused ){
            if ( v ){
              if ( this.focusable && this.focusable.focus ){
                this.focusable.focus();
              }
            }
            else if ( this.prevFocused && this.prevFocused.focus ){
              this.prevFocused.focus();
            }
          }
        },
        changeVisible(v) {
          if ( v ){
            if ( !this.hasBeenOpened ){
              this.hasBeenOpened = true;
            }
            if ( bbn.env.focused && (bbn.env.focused !== this.prevFocused) ){
              this.prevFocused = bbn.env.focused;
            }
          }
          if ( this.onResize !== undefined ){
            if ( v ){
              this.onResize();
            }
            else{
              this.isResized = false;
            }
          }
          this.switchFocus(v);
        }
      },
      /**
       * If not defined, defines the focusable element.
       * @event mounted
       * @memberof focusComponent
       */
      mounted(){
        this.$nextTick(() => {
          if ( !this.focusable ){
            this.focusable = this.$el;
          }
          if ( this.currentVisible && this.focused ){
            this.switchFocus(true);
          }
        });
      },
      /**
       * Returns the focus on the previously focused element.
       * @event beforeDestroy
       * @memberof focusComponent
       */
      beforeDestroy(){
        if (!bbn.fn.isMobile()) {
          this.switchFocus(false);
        }
      },
      watch: {
        /**
         * Emits the event 'open' or 'close'
         * @watch currentVisible
         * @param {Boolean} v 
         * @emits open
         * @emits close
         * @fires switchFocus
         * @memberof toggleComponent
         */
        currentVisible: {
          handler(v) {
            this.$emit(v ? 'open' : 'close');
            this.changeVisible(v);
          },
          immediate: true
        }
      }
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * local storage component
     * @component localStorageComponent
     */
    localStorageComponent: {
      props: {
        /**
         * True if the component has to have storage.
         * @prop {Boolean} [false] storage
         * @memberof localStorageComponent
         */
        storage: {
          type: Boolean,
          default: false
        },
        /**
         * The name of the storage.
         * @prop {String} ['default'] storageName
         * @memberof localStorageComponent
         */
        storageName: {
          type: String,
          default: 'default'
        },
        /**
         * The fullname of the storage.
         * @prop {String} storageFullName
         * @memberof localStorageComponent
         */
        storageFullName: {
          type: String
        }
      },
      data(){
        return {
          storageChangeDate: '2019-01-01 00:00:00'
        };
      },
      computed: {
        /**
         *  _storage
         * @memberof localStorageComponent
         * 
         */
        _storage(){
          if (window.localStorage) {
            return {
              get(name){
                let tmp = window.localStorage.getItem(name);
                if ( tmp ){
                  tmp = JSON.parse(tmp);
                  return tmp.value;
                }
              },
              set(name, value){
                return window.localStorage.setItem(name, JSON.stringify({
                  value: value,
                  time: (new Date()).getTime()
                }));
              },
              time(name){
                let tmp = window.localStorage.getItem(name);
                if ( tmp ){
                  tmp = JSON.parse(tmp);
                  return tmp.time;
                }
                return false;
              },
              remove(name){
                return window.localStorage.removeItem(name);
              },
              clear(){
                return window.localStorage.clear();
              }
            }
          }
          return false;
        },
        /**
         * Returns if the component has storage.
         * @memberof localStorageComponent
         * @computed {Boolean} hasStorage
         */
        hasStorage(){
          return (this.storage || (this.storageFullName || (this.storageName !== 'default'))) && !!this._storage;
        },
        /**
         * Returns the storage's default name.
         * @computed storageDefaultName 
         * @returns {String}
         */
        storageDefaultName(){
          if ( !this.storage ){
            return false;
          }
          return this._getStorageRealName();
        }
      },
      methods: {
        /**
         * Returns the complete path of the storage.
         * @method _getStorageRealName
         * @param {String} name 
         * @returns{String}
         * @memberof localStorageComponent
         */
        _getStorageRealName(name){
          if ( this.storageFullName ){
            return this.storageFullName;
          }
          let st = '';
          if ( this.$options.name ){
            st += this.$options.name + '-';
          }
          if ( name ){
            st += name;
          }
          else{
            st += window.location.pathname.substr(1) + '-' + this.storageName;
          }
          return st;
        },
        /**
         * Returns the computed _storage
         * @method getStorage
         * @param {String} name 
         * @param {Boolean} isFullName
         * @returns {Boolean|String}
         * @memberof localStorageComponent
         */
        getStorage(name, isFullName){
          if ( this.hasStorage ){
            return this._storage.get(isFullName ? name : this._getStorageRealName(name))
          }
          return false;
        },
        /**
         * Sets the computed _storage.
         * @method setStorage
         * @param value 
         * @param {String} name 
         * @param {Boolean} isFullName
         * @returns {Boolean}
         * @memberof localStorageComponent
         */
        setStorage(value, name, isFullName){
          if ( this.hasStorage ){
            return this._storage.set(isFullName ? name : this._getStorageRealName(name), value)
          }
          return false;
        },
        /**
         * Unsets the computed _storage.
         * @method unsetStorage
         * @param {String} name 
         * @param {Boolean} isFullName
         * @memberof localStorageComponent
         */
        unsetStorage(name, isFullName){
          if ( this.hasStorage ){
            return this._storage.remove(isFullName ? name : this._getStorageRealName(name))
          }
          return false;
        }
      },
      /**
       * Adds the class bbn-local-storage-component to the component.
       * @event created
       * @memberof localStorageComponent
       */
      created(){
        if ( this.hasStorage ){
          this.componentClass.push('bbn-local-storage-component');
        }
      },
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * data component
     * @component dataComponent
     */
    dataComponent: {
      methods: {
        /**
         * Defines how to render the data.
         * @method renderData
         * @param {Object} data
         * @param {Object} cfg
         * @memberof dataComponent
         * @returns {String}
         */
        renderData(data, cfg){
          if ( !cfg.field || !data ){
            return '';
          }
          let v = data[cfg.field] || '';
          if ( cfg.icon ){
            return '<i class="' + cfg.icon + '"> </i>'
          }
          else if ( cfg.type ){
            switch ( cfg.type ){
              case "datetime":
                if ( window.moment && cfg.format ){
                  return v ? (new window.moment(v)).format(cfg.format) : '-';
                }
                else{
                  return bbn.fn.fdatetime(v, '-');
                }
              case "date":
                if ( window.moment && cfg.format ){
                  return v ? (new window.moment(v)).format(cfg.format) : '-';
                }
                else{
                  return bbn.fn.fdate(v, '-');
                }
              case "time":
                if ( cfg.format && window.moment ){
                  return v ? (new window.moment(v)).format(cfg.format) : '-';
                }
                else{
                  return v ? bbn.fn.ftime(v) : '-';
                }
              case "email":
                return v ? '<a href="mailto:' + v + '">' + v + '</a>' : '-';
              case "url":
                return v ? '<a href="' + v + '">' + v + '</a>' : '-';
              case "percent":
                return v ? bbn.fn.money(v * 100, false, "%", '-', '.', ' ', 2) : '-';
              case "number":
                return v ?
                  bbn.fn.money(
                    v,
                    (cfg.precision === -4) || (cfg.format && (cfg.format.toLowerCase() === 'k')),
                    cfg.unit || "",
                    '-',
                    '.',
                    ' ',
                    cfg.precision === -4 ? 3 : (cfg.precision || 0)
                  ) : '-';
              case "money":
                return v ?
                  bbn.fn.money(
                    v,
                    (cfg.precision === -4) || (cfg.format && (cfg.format.toLowerCase() === 'k')),
                    cfg.currency || cfg.unit || "",
                    '-',
                    ',',
                    ' ',
                    cfg.precision === -4 ? 3 : cfg.precision
                  ) : '-';
              case "bool":
              case "boolean":
                return '<i class="nf nf-fa-'
                  + (((v && (v !== 'false') && (v !== '0')) && ((cfg.yesvalue === undefined) || (v === cfg.yesvalue))) ? 'check' : 'times')
                  + '" title="'
                  + (((v && (v !== 'false') && (v !== '0')) && ((cfg.yesvalue === undefined) || (v === cfg.yesvalue))) ? bbn._("Yes") : bbn._("No"))
                  + '"></i>';
            }
          }
          else if ( cfg.source ){
            if (cfg.source.length) {
              if (!bbn.fn.isObject(cfg.source[0])) {
                let idx = cfg.source.indexOf(v);
                return idx > -1 ? cfg.source[idx] : '-';
              }
              else{
                let filter = {};
                filter[this.sourceValue || 'value'] = v;
                let idx = bbn.fn.search(bbn.fn.isFunction(cfg.source) ? cfg.source() : cfg.source, filter);
                return idx > -1 ? cfg.source[idx][this.sourceText || 'text'] : '-';
              }
            }
          }
          else {
            return v || '';
          }          
        }
      }
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  const
    editorOperators = {
      string: {
        contains: bbn._('Contient'),
        eq: bbn._('Est'),
        neq: bbn._('N’est pas'),
        startswith: bbn._('Commence par'),
        doesnotcontain: bbn._('Ne contient pas'),
        endswith: bbn._('Se termine par'),
        isempty: bbn._('Est vide'),
        isnotempty: bbn._('N’est pas vide')
      },
      number: {
        eq: bbn._('Est égal à'),
        neq: bbn._('N’est pas égal à'),
        gte: bbn._('Est supérieur ou égal à'),
        gt: bbn._('Est supérieur à'),
        lte: bbn._('Est inférieur ou égal à'),
        lt: bbn._('Est inférieur à'),
      },
      date: {
        eq: bbn._('Est égal à'),
        neq: bbn._('N’est pas égal à'),
        gte: bbn._('Est postérieur ou égal à'),
        gt: bbn._('Est postérieur à'),
        lte: bbn._('Est antérieur ou égal à'),
        lt: bbn._('Est antérieur à'),
      },
      enums: {
        eq: bbn._('Est égal à'),
        neq: bbn._('N’est pas égal à'),
      },
      boolean: {
        istrue: bbn._('Est vrai'),
        isfalse: bbn._('Est faux')
      }
    },
    editorNullOps = {
      isnull: bbn._('Est nul'),
      isnotnull: bbn._('N’est pas nul')
    },
    editorNoValueOperators = ['', 'isnull', 'isnotnull', 'isempty', 'isnotempty', 'istrue', 'isfalse'];
  bbn.fn.autoExtend("vue", {
    /**
     * dataEditorComponent
     * @component dataEditorComponent
     */
    dataEditorComponent: {
      methods: {
        /**
         * not used
         * @memberof dataEditorComponent
         *  editorOperatorType
         * @param {Object} col 
         */
        editorOperatorType(col){
          if ( col.field ){

          }
        },
        /**
         * Returns if true if the editor has no value.
         * @memberof dataEditorComponent
         * @method editorHasNoValue
         * @param {String} operator 
         * @returns {Boolean}
         */
        editorHasNoValue(operator){
          return editorNoValueOperators.indexOf(operator) > -1;
        },
        /**
         * Defines the correct editor for the given col.
         * @method editorGetComponentOptions
         * @param {Object} col
         * @memberof dataEditorComponent
         * @returns {Object}
         */
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
              bbn.fn.extend(o.componentOptions, col.componentOptions);
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
        /**
         * The object containing the text for the different operator values.
         * @computed editorOperators 
         * @memberof dataEditorComponent
         * @returns {Object}
         */
        editorOperators(){
          return editorOperators;
        },
        /**
         * The object containing the text for the case null or not null values.
         * @computed editorNullOps
         * @memberof dataEditorComponent
         * 
         */
        editorNullOps(){
          return editorNullOps;
        },
        /**
         * The array containing the values of operators when the value of the editor is not defined.
         * @computed editorNoValueOperators 
         * @memberof dataEditorComponent
         * @returns {Array}
         */
        editorNoValueOperators(){
          return editorNoValueOperators;
        }
      },
      /**
       * Adds the class 'bbn-data-editor-component' to the component.
       * @event created
       * @memberof dataEditorComponent
       */
      created(){
        this.componentClass.push('bbn-data-editor-component');
      },
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * eventsComponent
     * @component eventsComponent
     */
    eventsComponent: {
      data(){
        return {
          /**
           * Defines if the component has been changed since its mount.
           * @memberof eventsComponent
           * @data {Boolean} [false] isTouched
           */
          isTouched: false,
          /**
           * True if the component is focused.
           * @memberof eventsComponent
           * @data {Boolean} [false] isFocused
           */
          isFocused: false
        }
      },
      methods: {
        /**
         * Emits the click event.
         * @method click
         * @param {Event} e 
         * @emit click
         * @memberof eventsComponent
         */
        click(e){
          this.$emit('click', e)
        },
        /**
         * Emits the blur event.
         * @method blur
         * @param {Event} e
         * @emit blur
         * @memberof eventsComponent
         */
        blur(e){
          this.isFocused = false;
          this.$emit('blur', e)
        },
        /**
         * Emits the event focus
         * @method focus
         * @param {Event} e
         * @return {Function}
         * @memberof basicComponent
         */
        focus(e){
          let ele = this.getRef('element');
          if ( ele && !this.isFocused ){
            ele.focus();
            this.isFocused = true;
          }
          this.$emit('focus', e);
        },
        /**
         * Emits the keyup event.
         * @method keyup
         * @param {Event} e
         * @memberof eventsComponent
         * @emit keyup
         */
        keyup(e){
          this.$emit('keyup', e)
        },
        /**
         * Emits the keydown event.
         * @method keydown
         * @param {Event} e
         * @memberof eventsComponent
         * @emit keydown
         */
        keydown(e){
          this.$emit('keydown', e)
        },
        /**
         * Emits the over event.
         * @method over
         * @param {Event} e
         * @memberof eventsComponent
         * @emit over
         */
        over(e){
          this.$emit('over', e);
          setTimeout(() => {
            this.$emit('hover', true, e);
          }, 0)
        },
        /**
         * Emits the out event.
         * @method out
         * @param {Event} e
         * @emit out
         * @memberof eventsComponent
         * @emit over
         */
        out(e){
          this.$emit('out', e);
          setTimeout(() => {
            this.$emit('hover', false, e);
          }, 0)
        },
        /**
         * Sets the prop isTouched to true
         * @method touchstart
         * @memberof eventsComponent
         */
        touchstart(){
          this.isTouched = true;
          setTimeout(() => {
            if ( this.isTouched ){
              let event = new Event('contextmenu');
              this.$el.dispatchEvent(event);
              this.isTouched = false;
            }
          }, 1000)
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchmove
         * @memberof eventsComponent
         */
        touchmove(){
          this.isTouched = false;
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchend
         * @memberof eventsComponent
         */
        touchend(){
          this.isTouched = false;
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchcancel
         * @memberof eventsComponent
         */
        touchcancel(){
          this.isTouched = false;
        }
      },
      /**
       * Adds the class 'bbn-events-component' to the component.
       * @event created
       * @memberof eventsComponent
       */
      created(){
        this.componentClass.push('bbn-events-component');
      },
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Data source component
     * @component listComponent
     */
    listComponent: {
      props: {
        /**
         * A function to transform the data.
         * @prop {Function} map
         * @memberof listComponent
         */
        map: {
          type: Function
        },
        /**
         * The limit of rows to be shown in a page of the list.
         * @prop {Number} [25] limit
         * @memberof listComponent
         */
        limit: {
          type: Number,
          default: 25
        },
        /**
         * The array of predefined limits.
         * @data {Array} {[10, 25, 50, 100, 250, 500]} limits
         * @memberof listComponent
         */
        limits: {
          type: Array,
          default(){
            return [10, 25, 50, 100, 250, 500];
          },
        },
        /**
         * Set to true will automatically update the data before mount.
         * @prop {Boolean} [false] autobind
         * @memberof listComponent
         */
        autobind: {
          type: Boolean,
          default: true
        },
        /**
         * Set to true allows the list to divide itself in different pages basing on the property limit.
         * @prop {Boolean} [false] pageable
         * @memberof listComponent
         */
        pageable: {
          type: Boolean,
          default: false
        },
        /**
         * Set to true allows list's columns to be sortable.
         * @prop {Boolean} [false] sortable
         * @memberof listComponent
         */
        sortable: {
          type: Boolean,
          default: false
        },
        /**
         * Set to true allows the columns of the list to be filtered. A filter icon will appear at the top of each column.The property can be given to each column to define different behaviour.
         * @prop {Boolean} [false] filterable
         * @memberof listComponent
         */
        filterable: {
          type: Boolean,
          default: false
        },
        /**
         * Set to true enable the multifilter of the component. An icon will appear on the bottom right of the list. By clicking on the icon a popup with the multifilter will open.
         * @prop {Boolean} [false] multifilter
         * @memberof listComponent
         */
        multifilter: {
          type: Boolean,
          default: false
        },
        /**
         * In case of Ajax source, set to true will make an Ajax call for the data when changing page of the list.
         * @prop {Boolean} [true] serverPaging
         * @memberof listComponent
         */
        serverPaging: {
          type: Boolean,
          default: true
        },
        /**
         * In case of Ajax source, set to true will make an Ajax call for the sorting of the list.
         * @prop {Boolean} [true] serverSorting
         * @memberof listComponent
         */
        serverSorting: {
          type: Boolean,
          default: true
        },
        /**
         * In case of Ajax source, set to true will make an Ajax call for the filter of the list.
         * @prop {Boolean} [true] serverFiltering
         * @memberof listComponent
         */
        serverFiltering: {
          type: Boolean,
          default: true
        },
        /**
         * Defines the order of the columns in the component.
         * @prop {Array|Object} [[]] order
         * @memberof listComponent
         */
        order: {
          type: [Array, Object],
          default () {
            return [];
          }
        },
        /**
         * Defines the filters of the component.
         * @prop {Object} [{logic: 'AND',conditions: []}] filters
         * @memberof listComponent
         */
        filters: {
          type: Object,
          default () {
            return {
              logic: 'AND',
              conditions: []
            };
          }
        },
        /**
         * If the prop selection is set to true defines which items has to be selected.
         * @prop {Array} selected
         * @memberof listComponent
         */
        selected: {
          type: Array,
          default(){
            return [];
          }
        },
        /**
         * Set to true shows a checkbox in each rows in the first column of the list.
         * @prop {Boolean|Function} selection
         * @memberof listComponent
         */
        selection: {
          type: [Boolean, Function],
          default: false
        },
        /**
         * Set to true selecting an item will unselect any other selected item.
         * @prop {Boolean} multiple
         * @memberof listComponent
         */
        multiple: {
          type: Boolean,
          default: false
        },
        /**
         * Given to a column that has the property type set to 'money' defines the currency.
         * @prop {String} currency
         * @memberof listComponent
         */
        currency: {
          type: String
        },
        /**
         * The data sent in the ajax call.
         * @prop {String|Function} [{}] data
         * @memberof listComponent
         */
        data: {
          type: [Object, Function],
          default () {
            return {};
          }
        },
        /**
         * Defines the message to show when the list has no data.
         * @prop {String} ['No data...'] noData
         * @memberof listComponent
         */
        noData: {
          type: String,
          default: bbn._('No data') + '...'
        }, 
        /**
         * The uid of the list.
         * @prop {String} uid
         */
        uid: {
          type: String
        },
        /**
         * The source of the component.
         * @prop {Array|Object|String|Function} source
         * @memberof listComponent
         */
        source: {
          type: [Array, Object, String, Function],
          default(){
            return [];
          }
        },
        /**
         * The name of the property to be used as text.
         * @prop {String} ['text'] sourceText
         * @memberof listComponent
         */
        sourceText: {
          type: String,
          default: "text"
        },
        /**
         * The name of the property to be used as value.
         * @prop {String} ['value'] sourceValue
         * @memberof listComponent
         */
        sourceValue: {
          type: String,
          default: "value"
        },
        /**
         * If source is a function this index can be passed to the function.
         * @prop {Number} sourceIndex
         * @memberof listComponent
         */
        sourceIndex: {
          type: Number
        },
        /**
         * The name of the property to use for children of hierarchical source
         * @prop {String} [items] children
         * @memberof listComponent
         */
        children: {
          type: String,
          default: 'items'
        },
        /**
         * A component for each element of the list.
         * @memberof listComponent
         * @prop {String|Object|Vue} component
         */
        component: {
          type: [String, Object, Vue]
        },
        /**
         * The template to costumize the dropdown menu.
         * @memberof listComponent
         * @prop template
         */
        template: {},
        /**
         * @prop {String} query
         * @memberof listComponent
         */
        query: {
          type: String
        },
        /**
         * The query values object.
         * @prop {Object} queryValues
         * @memberof listComponent
         */
        queryValues: {
          type: Object
        },
        /**
         * @prop {Object} hierarchy
         * @memberof listComponent
         */
        hierarchy: {
          type: Boolean,
          default: false
        }
      },
      data(){
        let order = this.order;
        if (this.sortable && this.order && (typeof this.order === 'object') && !Array.isArray(this.order)) {
          order = [];
          for (let n in this.order) {
            order.push({
              field: n,
              dir: this.order[n]
            });
          }
        }
        return {
          /**
           * If true it's the first time the data is loaded.
           * @data {Boolean} [false] _1strun
           * @memberof listComponent
           */
          _1strun: false,
          /**
           * _dataPromise
           * @memberof listComponent
           * @data {Boolean, Promise} [false] _dataPromise
           */
          _dataPromise: false,
          /**
           * If source is a URL and auto is set to true, component will fetch data at mount.
           * @data {Boolean} [false] auto 
           * @memberof listComponent
           */
          auto: true,
          /**
           * The current template of the component.
           * @data {String} [false] currentTemplate
           * @memberof listComponent
           */
          currentTemplate: this.template,
          /**
           * 
           * @data {Boolean} [false] currentIndex
           * @memberof listComponent
           */
          currentIndex: false,
          /**
           * @data {Boolean} [false] currentFilter
           * @memberof listComponent
           */
          currentFilter: false,
          /**
           * The current filters of the list.
           * @memberof listComponent
           * @data {Object} currentFilters
           */
          currentFilters: bbn.fn.clone(this.filters),
          /**
           * The current limit of items in the list.
           * @memberof listComponent
           * @data {Number} [25] currentLimit
           */
          currentLimit: this.limit,
          /**
           * The current start index of the list.
           * @memberof listComponent
           * @data {Number} [0] currentStart
           */
          currentStart: this.start,
          /**
           * The current order of the list.
           * @memberof listComponent
           * @data {Object} currentOrder
           */
          currentOrder: order,
          /**
           * The current data of the list.
           * @memberof listComponent
           * @data {Array} [[]] currentData
           */
          currentData: [],
          /**
           * The current total of items in the list.
           * @memberof listComponent
           * @data {Number} [0] currentTotal
           */
          currentTotal: 0,
          /**
           * The start index.
           * @data {Number} [0] start
           * @memberof listComponent
           */
          start: 0,
          /**
           * The total of items in the list. 
           * @data {Number} [0] total
           * @memberof listComponent
           */
          total: 0,
          /**
           * True if the list is loading data.
           * @data {Boolean} [false] isLoading
           * @memberof listComponent 
           */
          isLoading: false,
          /**
           * True if the source of the list is a string.
           * @data {Boolean} isAjax
           * @memberof listComponent 
           */
          isAjax: typeof this.source === 'string',
          /**
           * @todo change name
           * @data {Array} [[]] selectedRows
           */
          currentSelected: this.selected.slice(),
          /**
           * True if the list is filterable.
           * @data {Boolean} [false] isFilterable
           * @memberof listComponent
           */
          isFilterable: this.filterable,
          /**
           * True if the list has selection enabled.
           * @data {Boolean} [false] hasSelection
           */
          hasSelection: !!this.selection,
          /**
           * The original data of the list.
           * @data [null] originalData
           * @memberof listComponent
           */
          originalData: null,
          /**
           * @data {String} filterString
           * @memberof listComponent
           */
          filterString: this.textValue || '',
          /**
           * @memberof listComponent
           * @data {false, Number} filterTimeout
           */
          filterTimeout: false,
          /**
           * The current query.
           * @data {String} currentQuery
           * @memberof listComponent
           */
          currentQuery: this.query,
          /**
           * The current query values.
           * @data {Object} currentQueryValues
           * @memberof listComponent 
           */
          currentQueryValues: this.queryValues || {},
          /**
           * The id of the loading request.
           * @data {Boolean} [false] loadingRequestID
           * @memberof listComponent 
           */
          loadingRequestID: false
        };
      },
      computed: {
        /**
         * The current limits.
         * @computed currentLimits
         * @memberof listComponent
         */
        currentLimits(){
          if (!this.pageable){
            return [];
          }
          let pass = false;
          return bbn.fn.filter(this.limits.sort(), (a) => {
            if ( a > this.total ){
              if ( !pass ){
                pass = true;
                return true;
              }
              return false;
            }
            return true;
          });
        },
        /**
         * Returns true if a component has been defined for the list.
         * @computed hasComponent
         * @memberof listComponent
         */
        hasComponent(){
          return (bbn.fn.isString(this.component) || (bbn.fn.isObject(this.component) && Object.keys(this.component).length)) || this.currentTemplate ? true : false;
        },
        /**
         * Returns the component object. 
         * @computed realComponent
         * @memberof listComponent
         */
        realComponent(){
          let cp = bbn.fn.isString(this.component) || (bbn.fn.isObject(this.component) && Object.keys(this.component).length) ? this.component : null;
          if (!cp && this.currentTemplate) {
            cp = {
              props: ['source'],
              data(){
                return this.source;
              },
              template: this.currentTemplate
            };
          }
          return cp;
        },
        /**
         * Return the number of pages of the list.
         * @computed numPages
         * @return {number}
         */
        numPages() {
          return Math.ceil(this.total / this.currentLimit);
        },
        /**
         * Return the current page of the list.
         * @computed currentPage
         * @fires updateData
         * @return {Number}
         */
        currentPage: {
          get() {
            return Math.ceil((this.start + 1) / this.currentLimit);
          },
          set(val) {
            if ( this.ready ) {
              this.start = val > 1 ? (val - 1) * this.currentLimit : 0;
              this.updateData();
            }
          }
        },
        filteredData(){
          if (this.currentData.length && this.currentFilters &&
                                this.currentFilters.conditions &&
                                this.currentFilters.conditions.length &&
                                (!this.serverFiltering || !this.isAjax)
          ) {
            return bbn.fn.filter(this.currentData, (a) => {
              return this._checkConditionsOnItem(this.currentFilters, a.data);
            });
          }
          else{
            return this.currentData;
          }
        },
        /** @todo Remove: no sense and not used in any component */
        valueIndex(){
          if ( this.value || (this.selected && this.selected.length) ){
            let v = this.value || this.selected[0];
            if ( this.uid ){
              return bbn.fn.search(this.filteredData, (a) => {
                return a.data[this.uid] === v;
              });
            }
            else if ( this.sourceValue ){
              return bbn.fn.search(this.filteredData, (a) => {
                return a.data[this.sourceValue] === v;
              });
            }
          }
          return -1;
        },
        isAutobind(){
          if (
            (this.autobind === false) ||
            (this.isAjax && this.autocomplete && (this.filterString.length < this.minLength))
          ){
            return false;
          }
          return true;
        },

      },
      methods: {
        /**
         * Returns the data changed using the function given in the prop map.
         * @method _map
         * @param data
         */
        _map(data) {
          if ( bbn.fn.isArray(data) ){
            if ( data.length && !bbn.fn.isObject(data[0]) && this.sourceValue && this.sourceText ){
              data = data.map((a) => {
                let o = {};
                o[this.sourceValue] = a;
                o[this.sourceText] = a;
                return o;
              });
            }
            return (this.map ? data.map(this.map) : data).slice();
          }
          return [];
        },
        /**
         * Compares the values of the given row basing on the where operator and value.
         *  
         * @method _checkConditionsOnItem
         * @param {Object} where 
         * @param {Object} row 
         * @return {Boolean}
         */
        _checkConditionsOnItem(where, row) {
          let pass = false;
          if (where.conditions && where.logic && (typeof row === 'object')) {
            pass = where.logic !== 'OR';
            for (let i = 0; i < where.conditions.length; i++) {
              let cond = where.conditions[i],
                res = true;
              if (cond.conditions && cond.logic) {
                res = this._checkConditionsOnItem(cond, row);
              }
              else if (cond.field && cond.operator) {
                res = bbn.fn.compare(row[cond.field], cond.value !== undefined ? cond.value : null, cond.operator);
              }
              if (!res && where.logic !== 'OR') {
                pass = false;
                break;
              }
              else if (res && where.logic === 'OR') {
                pass = true;
                break;
              }
            }
          }
          return pass;
        },
        /**
         * @method select
         */
        select(){
          //this.$emit('select', this.currentIndex);
        },
        /**
         * Pushes the given filter in the currentFilters of the list.
         * @method onSetFilter
         * @param {Object} filter 
         */
        onSetFilter(filter) {
          if (filter && filter.field && filter.operator) {
            if (this.multi) {
              this.currentFilters.conditions.push(filter);
            }
            else if (filter.field) {
              let idx = bbn.fn.search(this.currentFilters.conditions, {
                field: filter.field
              });
              if (idx > -1) {
                this.currentFilters.conditions.splice(idx, 1, filter);
              }
              else {
                this.currentFilters.conditions.push(filter);
              }
            }
          }
        },
        /**
         * Fires the method removeFilter to remove a group of conditions from currentFilters.
         * @method onUnsetFilter
         * @param {Object} filter
         * @fires removeFilter
         */
        onUnsetFilter(filter) {
          //bbn.fn.log("onUnset", filter);
          this.removeFilter(filter);
        },
        /**
         * Removes a group of conditions from currentFilters.
         * @method removeFilter
         * @param {Object} condition
         * @fires getPopup
         */
        removeFilter(condition) {
          if (condition.time) {
            //bbn.fn.log("There is the time", condition);
            let del = (arr) => {
              let idx = bbn.fn.search(arr, {
                time: condition.time
              });
              //bbn.fn.log("Is there the index?", idx);
              if (idx > -1) {
                if (arr[idx].conditions && arr[idx].conditions.length) {
                  this.getPopup().confirm(bbn._("Are you sure you want to delete this group of conditions?"), () => {
                    arr.splice(idx, 1);
                    if (window.appui) {
                      window.appui.success();
                    }
                  })
                }
                else {
                  arr.splice(idx, 1);
                  if (window.appui) {
                    window.appui.success();
                  }
                }
                return true;
              }
              for (let i = 0; i < arr.length; i++) {
                if (arr[i].conditions) {
                  if (del(arr[i].conditions)) {
                    return true;
                  }
                }
              }
            };
            if (del(this.currentFilters.conditions)) {
              this.$forceUpdate();
            }
          }
        },
        /**
         * Unsets the current filter.
         * @method unsetFilter
         */
        unsetFilter() {
          this.currentFilters = bbn.fn.clone(this.filters);
          this.currentFilter = false;
          this.editedFilter = false;
        },
        /**
         * Unsets the current filter.
         * @method unsetCurrentFilter
         * 
         */
        unsetCurrentFilter() {
          if (this.editedFilter) {
            let idx = bbn.fn.search(this.currentFilters.conditions, {
              time: this.editedFilter.time
            });
            if (idx > -1) {
              this.currentFilters.conditions.splice(idx, 1)
            }
          }
        },
        getPostData(){
          if ( this.data ){
            return bbn.fn.isFunction(this.data) ? this.data() : this.data;
          }
          return {};
        },
        beforeUpdate(){
          let e = new Event('beforeUpdate', {cancelable: true});
          this.$emit('beforeUpdate', e);
          return e.defaultPrevented ? false : true;
        },
        afterUpdate(){
          return true;
        },
        updateData(){
          if (this.beforeUpdate() !== false) {
            this._dataPromise = new Promise((resolve) => {
              let prom;
              let loadingRequestID;
              if ( this.isAjax ){
                if (this.loadingRequestID) {
                  bbn.fn.abort(this.loadingRequestID);
                }
                this.isLoading = true;
                this.$emit('startloading');
                let data = {
                  limit: this.currentLimit,
                  start: this.start,
                  data: this.getPostData()
                };
                if ( this.sortable ){
                  data.order = this.currentOrder;
                }
                if ( this.isFilterable ){
                  data.filters = this.currentFilters;
                }
                if ( this.showable ){
                  data.fields = this.shownFields;
                }
                loadingRequestID = bbn.fn.getRequestId(this.source, data);
                this.loadingRequestID = loadingRequestID;
                prom = this.post(this.source, data);
              }
              else{
                prom = new Promise((resolve2) => {
                  let data = [];
                  if ( bbn.fn.isArray(this.source) ){
                    data = this.source;
                  }
                  else if ( bbn.fn.isFunction(this.source) ){
                    data = this.source(this.sourceIndex);
                  }
                  else if ( bbn.fn.isObject(this.source) ){
                    bbn.fn.iterate(this.source, (a, n) => {
                      let o = {};
                      o[this.sourceValue] = n;
                      o[this.sourceText] = a;
                      data.push(o);
                    });
                  }
                  resolve2({
                    data: data,
                    total: data.length
                  });
                });
              }
              prom.then((d) => {
                if ( this.loadingRequestID && (this.loadingRequestID === loadingRequestID)){
                  this.isLoading = false;
                  this.loadingRequestID = false;
                  if ( !d ){
                    return;
                  }
                  if ( d.status !== 200 ){
                    d.data = undefined;
                  }
                  else{
                    d = d.data;
                  }
                  this.$emit('dataReceived', d);
                }
                if ( d && bbn.fn.isArray(d.data) ){
                  if (d.data.length && d.data[0]._bbn){
                    this.currentData = d.data;
                    this.updateIndexes();
                  }
                  else{
                    d.data = this._map(d.data);
                    this.currentData = bbn.fn.map(d.data, (a, i) => {
                      let o = this.hierarchy ? bbn.fn.extend(true, a, {index: i, _bbn: true}) : {
                        data: a,
                        index: i,
                        _bbn: true
                      };
                      if ( this.children && a[this.children] && a[this.children].length ){
                        o.opened = true;
                      }
                      if (this.hasSelection){
                        if ( this.uid ){
                          o.selected = this.selected.includes(a[this.uid]);
                        }
                        else if ( this.sourceValue ){
                          o.selected = this.selected.includes(a[this.sourceValue]);
                        }
                      }
                      return o;
                    });
                  }
                  if (d.query) {
                    this.currentQuery = d.query;
                    this.currentQueryValues = d.queryValues || {};
                  }
                  this.total = d.total || 0;
                  if (d.order) {
                    this.currentOrder.splice(0, this.currentOrder.length);
                    this.currentOrder.push({
                      field: d.order,
                      dir: (d.dir || '').toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
                    });
                  }
                  /** @todo Observer part to dissociate */
                  if (d.observer && bbn.fn.isFunction(this.observerCheck) && this.observerCheck()) {
                    this._observerReceived = d.observer.value;
                    this.observerID = d.observer.id;
                    this.observerValue = d.observer.value;
                    if ( !this._1strun ){
                      this.observerWatch();
                    }
                  }
                  if ( !this._1strun ){
                    this._1strun = true;
                    this.$emit('firstrun');
                  }
                }
                this.afterUpdate();
                resolve(this.currentData);
                this.$emit('dataloaded');
                //this._dataPromise = false;
              });
            });
            return this._dataPromise;
          }
        },
        updateIndexes(){
          if (this.currentData.length) {
            bbn.fn.each(this.currentData, (a, i) => {
              if (a.index !== i) {
                this.$set(this.currentData[i], 'index', i);
                //a.index = i;
              }
            });
          }
        },
        /**
         * Deletes the row defined by param index.
         * @method realDelete
         * @emit delete
         * @param {Number} index
         */
        realDelete(index) {
          if (this.currentData[index]) {
            let ev = new Event('delete');
            if (this.url) {
              this.post(this.url, bbn.fn.extend({}, this.data, this.currentData[index].data, {
                action: 'delete'
              }), (d) => {
                if (d.success) {
                  let data = this.currentData[index].data;
                  this.currentData.splice(index, 1);
                  this.total--;
                  this.updateIndexes();
                  this.$emit('delete', data, ev);
                  if (window.appui) {
                    window.appui.success(bbn._('Deleted successfully'))
                  }
                }
                else {
                  this.alert(bbn._("Impossible to delete the row"))
                }
              })
            } else {
              let row = this.currentData.splice(index, 1);
              this.total--;
              if (this.originalData) {
                this.originalData.splice(index, 1);
              }
              this.updateIndexes();
              this.$emit('delete', row[0], ev);
            }
          }
        },
        /**
         * Add the given row to currentData
         * @method add
         * @param {Object} data
         * @todo
         *
         */
        add(data) {
          this.currentData.push({
            data: data,
            index: this.currentData.length
          });
        },
        /**
         * Fires the method realDelete to delete the row.
         * @method delete
         * @param {Number} index
         * @param {Strimg} confirm
         * @fires realDelete
         * @emit beforeDelete
         */
        delete(index, confirm) {
          if (this.filteredData[index]) {
            let ev = new Event('delete', {cancelable: true});
            this.$emit('beforeDelete', this.filteredData[index].data, ev);
            if (!ev.defaultPrevented) {
              if (confirm === undefined) {
                confirm = this.confirmMessage;
              }
              if (confirm) {
                this.confirm(confirm, () => {
                  this.realDelete(this.filteredData[index].index);
                });
              }
              else {
                this.realDelete(this.filteredData[index].index);
              }
            }
          }
        },
        /**
         * Fires the metod updateData to refresh the current data set.
         * @method reload
         * @fires updateData
         */
        reload() {
          return this.updateData();
        },
        /**
         * Removes the row defined by the where param from currentData
         * @method remove
         * @param {Object} where
         */
        remove(where) {
          let idx;
          while ((idx = bbn.fn.search(this.filteredData, a => {
            bbn.fn.log("COMPOARE", a.data);
            return bbn.fn.compareConditions(a.data, where);
          })) > -1) {
            this.realDelete(this.filteredData[idx].index, 1);
          }
          this.$forceUpdate();
        },
      },
      beforeMount(){
        if ( this.isAutobind ){
          this.updateData();
        }
      },
      watch: {
        /**
         * @watch currentLimit
         * @fires setConfig
         */
        currentLimit() {
          if ( this.ready && bbn.fn.isFunction(this.setConfig) ){
            this.setConfig(true);
          }
        },
        /**
         * @watch currentFilters
         * @fires updateData
         * @fires setConfig
         */
        currentFilters: {
          deep: true,
          handler() {
            if (this.ready) {
              this.currentFilter = false;
              this.updateData();
              if ( bbn.fn.isFunction(this.setConfig) ){
                this.setConfig(true);
              }
              this.$forceUpdate();
            }
          }
        },
        /**
         * @watch currentOrder
         * @fires setConfig
         */
        currentOrder: {
          deep: true,
          handler() {
            if (this.ready) {
              if ( bbn.fn.isFunction(this.setConfig) ){
                this.setConfig(true);
              }
              this.$forceUpdate();
            }
          }
        },
        source: {
          deep: true,
          handler(){
            if (this.ready && !this.editable) {
              /*
              this.updateData();
              */
            }
          }
        }
      }
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Memory component
     * @component memoryComponent
     */
    memoryComponent: {
      props: {
        /**
         * The object memory or a function that returns the object.
         * @prop {Object|Function} memory
         * @memberof memoryComponent
         */
        memory: {
          type: [Object, Function]
        },
      },
      /**
       * Adds the class 'bbn-memory-component' to the component.
       * @event created
       * @memberof memoryComponent
       */
      created(){
        this.componentClass.push('bbn-memory-component');
      }
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Input component
     * @component inputComponent
     */
    inputComponent: {
      props: {
        /**
         * The value of the component.
         * @prop value
         * @memberof inputComponent
         */
        value: {},
        /**
         * The component's name.
         * @prop {String} name 
         * @memberof inputComponent
         */
        name: {
          type: String
        },
        /**
         * The component's placeholder.
         * @prop {String} placeholder
         * @memberof inputComponent
         */
        placeholder: {
          type: String
        },
        /**
         * Defines if the component has a required value.
         * @prop {Boolean|Function} [false] required
         * @memberof inputComponent
         */
        required: {
          type: [Boolean, Function, String],
          default: false
        },
        /**
         * Defines if the component has to be disabled.
         * @prop {Boolean|Function} [false] disabled
         * @memberof inputComponent
         */
        disabled: {
          type: [Boolean, Function],
          default: false
        },
        /**
         * Defines if the component has to be readonly.
         * @prop {Boolean|Function} [false] readonly
         * @memberof inputComponent
         */
        readonly: {
          type: [Boolean, Function],
          default: false
        },
        /**
         * Defines the size of the component.
         * @prop {Number|String} size
         * @memberof inputComponent
         */
        size: {
          type: [Number, String]
        },
         /**
         * Defines the maxlength of the value.
         * @prop {Number|String} maxlength 
         * @memberof inputComponent
         */
        maxlength: {
          type: [String, Number]
        },
        /**
         * A function to validate the value before submit.
         * @prop {Function} validation
         * @memberof inputComponent
         */
        validation: {
          type: [Function]
        },
        /**
         * The attribute tabindex of the input component.
         * @prop {Number} [0] tabindex
         * @memberof inputComponent
         */
        tabindex: {
          type: Number,
          default: 0
        },
        /**
         * @prop {Boolean} [false] nullable
         * @memberof listComponent
         */
        nullable: {
          type: Boolean,
          default: false
        },
        /**
         * Set it to true if you want to auto-resize the input's width based on its value (in characters).
         * @prop {Boolean} [false] autosize
         */
        autosize: {
          type: Boolean,
          default: false
        }
      },
      data(){
        return {
          /**
           * True if the component has a value.
           * @data {Boolean} hasVale
           */
          hasValue: !!this.value
        };
      },
      computed: {
        /**
         * Returns true if the component can have a null value.
         * @computed isNullable
         * @returns {Boolean}
         */
        isNullable(){
          let isNullable = !!this.nullable;
          if ( this.nullable === null ){
            isNullable = this.required ? false : !!this.placeholder;
          }
          return isNullable;
        }
      },
      methods: {
        /**
         * Select the text of the component.
         * @method selectText
         * @memberof inputComponent
         */
        selectText(){
          let ele = this.getRef('element');
          if (ele) {
            bbn.fn.selectElementText(ele)
          }
        },
        /**
         * Emits the event input.
         * @method emitInput
         * @emit input
         * @param {Number|String} val 
         * @memberof inputComponent
         */
        emitInput(val){
          this.$emit('input', val);
        },
        /**
         * Emits the event change.
         * @method change
         * @emit change
         * @param {Event} e 
         * @memberof inputComponent
         */
        change(e){
          this.$emit('change', e, this.value)
        },
        /**
         * Check the validity of the inserted value.
         * @method isValid
         * @param {Vue} e 
         * @return {Boolean}
         * @memberof inputComponent
         */
        isValid(e){
          const $this = bbn.fn.isVue(e) ? e : this,
                ele = $this.$refs.element || false,
                inp = $this.$refs.input || false,
                customMessage = $this.$el.hasAttribute('validationMessage') ? $this.$el.getAttribute('validationMessage') : false;
          let check = (elem) => {
                if ( elem && elem.validity ){
                  let validity = elem.validity,
                      $elem = $this.$el,
                      // Default message
                      mess = bbn._('The value you entered for this field is invalid.'),
                      specificCase = false;
                  // If valid or disabled, return true
                  if ( elem.disabled || validity.valid ){
                    //if ( (!!elem.required || !!elem.readOnly) && !elem.value ){
                    if ( !!elem.required && !elem.value ){
                      specificCase = true;
                    }
                    else {
                      return true;
                    }
                  }
                  
                  if ( !validity.valid || specificCase ){
                    // If field is required and empty
                    if ( validity.valueMissing || specificCase ){
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
                    let border = $elem.style.border;
                    $elem.style.border = '1px solid red';
                    this.$on('blur', () => {
                      $elem.style.border  = border;
                      $elem.focus();
                    });
                    return false;
                  }
                }
              },
              getLastElement = (elem) => {
                if ( bbn.fn.isVue(elem) && elem.$refs && elem.$refs.element ){
                  return getLastElement(elem.$refs.element);
                }
                return elem;
              },
            okEle = ele ? check(getLastElement(ele)) : false,
            okInp = inp ? check(getLastElement(inp)) : false;
          return ele || inp ? !!(okEle || okInp) : true;
        },
      },
      /**
       * Adds the class 'bbn-input-component' to the component.
       * @event created
       * @memberof inputComponent
       */
      created(){
        this.componentClass.push('bbn-input-component');
        if ( this.autosize ){
          this.componentClass.push('bbn-auto-width');
        }
      },
      watch:{
        /**
         * @watch value
         * @param newVal 
         * @memberof inputComponent
         */
        value(newVal){
          if ( this.widget && (this.widget.value !== undefined) ){
            if (bbn.fn.isFunction(this.widget.value) ){
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
          if ( !!newVal !== this.hasValue ){
            this.hasValue = !!newVal;
          }
        },
      }
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * These components will emit a resize event when their closest parent of the same kind gets really resized.
     * @component resizerComponent
     */
    resizerComponent: {
      data(){
        return {
          /**
           * The closest resizer parent.
           * @data {Boolean} [false] parentResizer
           * @memberof resizerComponent
           */
          parentResizer: false,
          /**
           * The listener on the closest resizer parent.
           * @data {Boolean} [false] onParentResizerEmit
           * @memberof resizerComponent
           */
          onParentResizerEmit: false,
          /**
           * The listener on the closest resizer parent.
           * @data {Number} [null] resizeTimeout
           * @memberof resizerComponent
           */
          resizeTimeout: null,
          /**
           * The height.
           * @data {Boolean} [false] lastKnownHeight
           * @memberof resizerComponent
           */
          lastKnownHeight: false,
          /**
           * The width.
           * @data {Boolean} [false] lastKnownWidth
           * @memberof resizerComponent
           */
          lastKnownWidth: false,
          /**
           * The container height.
           * @data {Boolean} [false] lastKnownCtHeight
           * @memberof resizerComponent
           */
          lastKnownCtHeight: false,
          /**
           * The container width.
           * @data {Boolean} [false] lastKnownCtWidth
           * @memberof resizerComponent
           */
          lastKnownCtWidth: false,
          /**
           * Should be set to true during the resize execution.
           * @data {Boolean} [false] isResizing
           * @memberof resizerComponent
           */
          isResizing: false,
          /**
           * The live computedStyle object for the element.
           * @data {Object} [null] computedStyle
           * @memberof resizerComponent
           */
          computedStyle: null
        };
      },
      methods: {
        /**
         * A function that can be executed just before the resize event is emitted.
         * @method onResize
         * @emit resize
         * @memberof resizerComponent
         */
        onResize(){
          //bbn.fn.log("DEFAULT ONRESIZE FN FROM " + this.$options.name);
          return new Promise(resolve => {
            if (!this.isResizing) {

            }
            this.isResizing = true;
            this.$nextTick(() => {
              if (this.$el.offsetHeight) {
                // Setting initial dimensions
                let ms1 = this.setResizeMeasures();
                let ms2 = this.setContainerMeasures();
                if (ms1 || ms2) {
                  if (!this.ready) {
                    setTimeout(() => {
                      bbn.fn.log("DEFAUT ONRESIZE ON TIMEOUT");
                      this.onResize();
                    }, 100)
                  }
                  else {
                    this.$emit('resize');
                  }
                }
              }
              resolve();
            })
          });
        },
        /**
         * Sets the value of lastKnownHeight and lastKnownWidth basing on the current dimensions of width and height.
         * @method setResizeMeasures 
         * @returns {Boolean}
         */
        setResizeMeasures(){
          let h = this.$el ? Math.round(this.$el.clientHeight) : 0;
          let w = this.$el ? Math.round(this.$el.clientWidth) : 0;
          if (h && w) {
            this.setComputedStyle();
          }
          let resize = false;
          if (this.lastKnownHeight !== h) {
            this.lastKnownHeight = h;
            resize = true;
          }
          if (this.lastKnownWidth !== w) {
            this.lastKnownWidth = w;
            resize = true;
          }
          return resize;
        },
        setContainerMeasures() {
          let resize = false;
          let isAbsolute = this.computedStyle ? ['absolute', 'fixed'].includes(this.computedStyle.position) : false;
          let offsetParent = this.$el.offsetParent;
          let ctH;
          let ctW;
          if (!this.parentResizer) {
            ctH = bbn.env.height;
            ctW = bbn.env.width;
          }
          else if (offsetParent) {
            ctH = isAbsolute ? bbn.fn.outerHeight(offsetParent) : Math.round(offsetParent.clientHeight);
            ctW = isAbsolute ? bbn.fn.outerWidth(offsetParent) : Math.round(offsetParent.clientWidth);
          }
          else {
            ctH = 0;
            ctW = 0;
          }
          if (this.lastKnownCtHeight !== ctH) {
            this.lastKnownCtHeight = ctH;
            resize = true;
          }
          if (this.lastKnownCtWidth !== ctW) {
            this.lastKnownCtWidth = ctW;
            resize = true;
          }
          return resize;
        },
        /**
         * Defines the resize emitter and launches process when it resizes.
         * @method setResizeEvent
         * @fires onParentResizerEmit
         * @memberof resizerComponent
         */
        setResizeEvent(){
          // Clearing the timeout used in the listener
          if (this.resizerTimeout) {
            clearTimeout(this.resizerTimeout);
          }
          this.setComputedStyle();
          // This class will allow to recognize the element to listen to
          this.parentResizer = this.closest(".bbn-resize-emitter");
          // Setting initial dimensions
          //this.setContainerMeasures();
          //this.setResizeMeasures();
          // Creating the callback function which will be used in the timeout in the listener
          this.onParentResizerEmit = () => {
            // Removing previous timeout
            if (this.resizerTimeout) {
              clearTimeout(this.resizerTimeout);
            }
              // Creating a new one
            this.resizerTimeout = setTimeout(() => {
              if (this.$el.parentNode && this.$el.offsetWidth) {
                // Checking if the parent hasn't changed (case where the child is mounted before)
                let tmp = this.closest(".bbn-resize-emitter");
                if ( tmp !== this.parentResizer ){
                  // In that case we reset
                  this.unsetResizeEvent();
                  this.setResizeEvent();
                  return;
                }
              }
              //bbn.fn.log("ON PARENT RESIZER EMIT");
              this.onResize();
            }, 50);
          };

          if ( this.parentResizer ){
            this.parentResizer.$off("resize", this.onParentResizerEmit);
            this.parentResizer.$on("resize", this.onParentResizerEmit);
          }
          else{
            window.removeEventListener("resize", this.onParentResizerEmit);
            window.addEventListener("resize", this.onParentResizerEmit);
          }
          this.onParentResizerEmit();
        },
        /**
         * Unsets the resize emitter.
         * @method unsetResizeEvent
         * @memberof resizerComponent
         */
        unsetResizeEvent(){
          if ( this.onParentResizerEmit ){
            if ( this.parentResizer ){
              //bbn.fn.log("UNSETTING EVENT FOR PARENT", this.$el, this.parentResizer);
              this.parentResizer.$off("resize", this.onParentResizerEmit);
            }
            else{
              //bbn.fn.log("UNSETTING EVENT FOR WINDOW", this.$el);
              window.removeEventListener("resize", this.onParentResizerEmit);
            }
          }
        },
        /**
         * Emits the event resize on the closest parent resizer.
         * @method selfEmit
         * @memberof resizerComponent
         * @param {Boolean} force 
         */  
        selfEmit(force){
          /*
          if ( this.parentResizer ){
            this.parentResizer.$emit("resize", force);
          }
          */
        },
        formatSize: bbn.fn.formatSize,
        setComputedStyle(){
          if (!this.computedStyle && this.$el && this.$el.clienttWidth) {
            this.computedStyle = window.getComputedStyle(this.$el);
          }
        }
      },
      /**
       * Adds the class 'bbn-resizer-component' to the component.
       * @event created
       * @memberof resizerComponent
       */
      created(){
        this.componentClass.push('bbn-resizer-component');
      },
      /**
       * Defines the resize emitter and emits the event ready.
       * @event mounted
       * @fires setResizeEvent
       * @emits ready
       * @memberof resizerComponent
       */
      mounted() {
        if (!this.ready) {
          this.$on('ready', this.setResizeEvent);
        }
        else {
          this.setResizeEvent();
        }
      },
      /**
       * Unsets the resize emitter.
       * @event beforeDestroy
       * @fires unsetResizeEvent
       * @memberof resizerComponent
       */
      beforeDestroy(){
        this.unsetResizeEvent();
      }
    }
  });
})(bbn);



((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Close component.
     * @component closeComponent
     */
    closeComponent: {
      /**
       * Adds the class 'bbn-close-component' to the component.
       * @event created
       * @memberof closeComponent
       */
      created(){
        this.componentClass.push('bbn-close-component');
      },
      data(){
        return {
          /**
           * Defines if the component's source has been modified. 
           * @data {Boolean}  [false] dirty
           * @memberof closeComponent
           */
          dirty: false
        }
      },
      computed: {
        /**
         * If the prop 'dirty' is false the component can be closed. 
         * @computed {Boolean} canClose
         * @memberof closeComponent
         */
        canClose(){
          return !this.dirty;
        }
      },
      methods: {

      }
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Field component.
     * @component fieldComponent
     */
    fieldComponent: {
      props: {
        /**
         * The width of the component.
         * @prop {String|Number} width
         * @memberof fieldComponent
         */
        width: {
          type: [String, Number],
        },
        /**
         * The render of the component.
         * @prop {String|Function} render
         * @memberof fieldComponent
         */
        render: {
          type: [String, Function]
        },
        /**
         * The title of the component.
         * @prop {String|Number} title
         * @memberof fieldComponent
         */
        title: {
          type: [String, Number]
        },
        /**
         * The full title of the component.
         * @prop {String} ftitle
         * @memberof fieldComponent
         */
        ftitle: {
          type: String
        },
        /**
         * @prop {String|Object} tcomponent
         * @memberof fieldComponent
         */
        tcomponent: {
          type: [String, Object]
        },
        /**
         * The icon of the component.
         * @prop {String} icon
         * @memberof fieldComponent
         */
        icon: {
          type: String
        },
        /**
         * The classes added to the component.
         * @prop {String|Function} cls
         * @memberof fieldComponent
         */
        cls: {
          type: [String, Function]
        },
        /**
         * The component's type.
         * @prop {String} type
         * @memberof fieldComponent
         */
        type: {
          type: String
        },
        /**
         * The component's field.
         * @prop {String} field
         * @memberof fieldComponent
         */
        field: {
          type: String
        },
        /**
         * Defines if the component has to be fixed.
         * @prop {Boolean|String} [false] fixed
         * @memberof fieldComponent
         */
        fixed: {
          type: [Boolean, String],
          default: false
        },
        /**
         * Defines if the component has to be hidden.
         * @prop {Boolean} hidden
         * @memberof fieldComponent
         */
        hidden: {
          type: Boolean
        },
        /**
         * Defines if the componenent has to be encoded.
         * @prop {Boolean} [false] encoded
         * @memberof fieldComponent
         */
        encoded: {
          type: Boolean,
          default: false
        },
        /**
         * Defines if the componenent has to be sortable.
         * @prop {Boolean|Function} [true] sortable 
         * @memberof fieldComponent
         */
        sortable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent has to be editable.
         * @prop {Boolean|Function} [true] editable 
         * @memberof fieldComponent
         */
        editable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent has to be filterable.
         * @prop {Boolean|Function} [true] filterable 
         * @memberof fieldComponent
         */
        filterable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent has to be resizable.
         * @prop {Boolean|Function} [true] resizable 
         * @memberof fieldComponent
         */
        resizable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent has to be showable.
         * @prop {Boolean|Function} [true] showable 
         * @memberof fieldComponent
         */
        showable: {
          type: [Boolean, Function],
          default: true
        },
        /**
         * Defines if the componenent can have a null value.
         * @prop {Boolean|Function} nullable 
         * @memberof fieldComponent
         */
        nullable: {
          type: [Boolean, Function],
        },
        /**
         * The buttons of the component.
         * @prop {Array|Function} buttons 
         * @memberof fieldComponent
         */
        buttons: {
          type: [Array, Function]
        },
        /**
         * The source of the component.
         * @prop {Array|Object|String|Function} source 
         * @memberof fieldComponent
         */
        source: {
          type: [Array, Object, String, Function]
        },
        /**
         * Defines if the the value of the component is required.
         * @prop {Boolean|Function} required 
         * @memberof fieldComponent
         */
        required: {
          type: [Boolean, Function]
        },
        /**
         * Defines the precision of the component.
         * @prop {Number} [0] precision 
         * @memberof fieldComponent
         */
        precision: {
          type: Number,
          default: 0
        },
        /**
         * Defines the options of the component.
         * @prop {Object|Function} options
         * @memberof fieldComponent
         */
        options: {
          type: [Object, Function],
          default(){
            return {};
          }
        },
        /**
         * Defines the editor of the component.
         * @prop {String|Object} editor
         * @memberof fieldComponent
         */
        editor: {
          type: [String, Object]
        },
        /**
         * Defines the maxLength of the component.
         * @prop {Number} maxLength 
         * @memberof fieldComponent
         */
        maxLength: {
          type: Number
        },
        /**
         * Defines the sqlType of the component.
         * @prop {String} sqlType 
         * @memberof fieldComponent
         */
        sqlType: {
          type: String
        },
        /**
         * @prop {String|Array} aggregate
         * @memberof fieldComponent
         */
        aggregate: {
          type: [String, Array]
        },
        /**
         * Define a component to use.
         * @prop {String|Object} component
         * @memberof fieldComponent
         */
        component: {
          type: [String, Object]
        },
        /**
         * A function to map the data of the component.
         * @prop {Function} mapper
         * @memberof fieldComponent
         */
        mapper: {
          type: Function
        },
        /**
         * Defines the group of the component.
         * @prop {String} group
         * @memberof fieldComponent
         */
        group: {
          type: String
        }
      },
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * View Component
     * @component viewComponent
     */
    viewComponent: {
      props: {
        /**
         * The source of the component.
         * @prop {Object|Function} source
         * @memberof viewComponent
         */
        source: {
          type: [Array, Object, String, Function],
        },
        /**
         * The title of the component.
         * @prop {String|Number} ['Untitled'] title
         * @memberof viewComponent
         */
        title: {
          type: [String, Number],
          default: bbn._("Untitled")
        },
        /**
         * The options object of the component.
         * @prop {Object} options
         * @memberof viewComponent
         */
        options: {
          type: Object,
          default(){
            return {}
          }
        },
        /**
         * Defines if the component has to be cached.
         * @prop {Boolean} [false] cached
         * @memberof viewComponent
         */
        cached: {
          type: Boolean,
          default: false
        },
        /**
         * Defines if the component has to be scrollable.
         * @prop {Boolean} [true] scrollable
         * @memberof viewComponent
         */
        scrollable: {
          type: Boolean,
          default: false
        },
        /**
         * Defines the component to use.
         * @prop component
         * @memberof viewComponent
         */
        component: {},
        /**
         * Defines the icon.
         * @prop {String|Boolean} icon
         * @memberof viewComponent
         */
        icon: {
          type: [String, Boolean],
        },
        /**
         * Defines if the component can have a text.
         * @prop {Boolean} [false] notext
         * @memberof viewComponent
         */
        notext: {
          type: Boolean,
          default: false
        },
        /**
         * Defines the component's content.
         * @prop {String} [''] content
         * @memberof viewComponent
         */
        content: {
          type: String,
          default: ""
        },
        /**
         * Defines the menu.
         * @prop {Array|Function} menu
         * @memberof viewComponent
         */
        menu: {
          type: [Array, Function, Boolean]
        },
        /**
         * Defines if the component is loaded.
         * @prop {Boolean} loaded
         * @memberof viewComponent
         */
        loaded: {
          type: Boolean,
          default: false
        },
        /**
         * Tells if the component is currently loading.
         * @prop {Boolean} loading
         * @memberof viewComponent
         */
        loading: {
          type: Boolean,
          default: false
        },
        /**
         * Defines the component's fcolor.
         * @prop {String} fcolor
         * @memberof viewComponent
         */
        fcolor: {
          type: String
        },
        /**
         * Defines the component's bcolor.
         * @prop {String} bcolor
         * @memberof viewComponent
         */
        bcolor: {
          type: String
        },
        /**
         * @prop {Boolean} [false] load
         * @memberof viewComponent
         */
        load: {
          type: Boolean,
          default: false
        },
        /**
         * Defines if the component has to be selected.
         * @prop {Boolean|Number} [false] selected
         * @memberof viewComponent
         */
        selected: {
          type: [Boolean, Number],
          default: false
        },
        /**
         * Defines the css string for the component.
         * @prop {String} [''] css
         * @memberof viewComponent
         */
        css: {
          type: String,
          default: ""
        },
        /**
         * @prop {String|Vue} advert
         * @memberof viewComponent
         */
        advert: {
          type: [String, Vue]
        },
        /**
         * @prop {String} help
         * @memberof viewComponent
         */
        help: {
          type: String
        },
        /**
         * @prop {Array} imessages
         * @memberof viewComponent
         */
        imessages: {
          type: Array,
          default(){
            return []
          }
        },
        /**
         * @prop script
         * @memberof viewComponent
         */
        script: {},
        /**
         * Defines if the component has to be static.
         * @prop {Boolean|Number} [false] static
         * @memberof viewComponent
         */
        static: {
          type: [Boolean, Number],
          default: false
        },
        /**
         * Defines
         if the component has to be pinned.
          * @prop {Boolean|Number} [false] pinned
          * @memberof viewComponent
          */
        pinned: {
          type: [Boolean, Number],
          default: false
        },
        /**
         * Defines the url.
         * @prop {String|Number} url
         * @memberof viewComponent
         */
        url: {
          type: [String, Number]
        },
        /**
         * @prop current
         * @prop {String|Number} current
         * @memberof viewComponent
         */
        current: {
          type: [String, Number]
        },
        /**
         * @prop {Boolean} [true] real
         * @memberof viewComponent
         */
        real: {
          type: Boolean,
          default: true
        },
        /**
         * The object of configuration for the component
         * @prop {Object} cfg
         * @memberof viewComponent
         */
        cfg: {
          type: Object
        },
        /**
         * @prop {Object} events
         * @memberof viewComponent
         */
        events: {
          type: Object,
          default(){
            return {}
          }
        },
        /**
         * Defines if the component is disabled.
         * @prop {Boolean} [false] disabled
         */
        disabled: {
          type: [Boolean, Function],
          default: false
        },
        /**
         * Defines if the component is hidden.
         * @prop {Boolean} [false] hidden
         */
        hidden: {
          type: [Boolean, Function],
          default: false
        }
      }
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Obeserver component.
     * @component observerComponent
     */
    observerComponent: {
      props: {
        /**
         * True if the component has to have an observer.
         * @prop {Boolean} [true] observer
         * @memberof observerComponent
         */
        observer: {
          type: Boolean,
          default: true
        }
      },
      data(){
        return {
          /**
           * Integration of the functionnality is done through a watcher on this property
           * @data {Array} [[]] observersCopy
           * @memberof observerComponent
           */
          observersCopy: [],
          /**
           * Integration of the functionnality is done through a watcher on this property
           * @data {Boolean} observersDirty
           * @memberof observerComponent
           */
          observerDirty: false,
          /**
           * The value of the observer.
           * @memberof observerComponent
           * @data observerValue
           */
          observerValue: null,
          /**
           * The array of observers.
           * @data {Array} observers
           * @memberof observerComponent
           */
          observers: [],
          /**
           * The id of the observer.
           * @data observerID
           * @memberof observerComponent
           */
          observerID: null,
          /**
           * The closest ancestor 'bbn-obsever';
           * @data {Vue} observationTower
           * @memberof observerComponent
           */
          observationTower: null,
          /**
           * The uid of the observer.
           * @data {String} observerUID
           * @memberof observerComponent
           */
          observerUID: bbn.fn.randomString().toLowerCase()
        }
      },
      methods: {
        /**
         * Returns true if the prop observer is set to true and an observerionTower is found.
         * @method observerCheck
         * @return {Boolean}
         * @memberof observerComponent
         */
        observerCheck(){
          return !!(this.observer && this.observationTower);
        },
        /**
         * Returns true if the observer has a value.
         * @method isObserved
         * @return {Boolean}
         * @memberof observerComponent
         */
        isObserved(){
          return this.observerCheck() && this.observerValue;
        },
        /**
         * Updates the observer.
         * @method observerWatch
         * @fires isObserved
         * @memberof observerComponent
         */
        observerWatch(){
          if ( this.isObserved() ){
            //bbn.fn.log("----------------isObserved--------------", this.$el);
            this.observationTower.observerRelay({
              element: this.observerUID,
              id: this.observerID,
              value: this.observerValue
            });
            setTimeout(() => {
              this.observationTower.$on('bbnObs' + this.observerUID + this.observerID, (newVal) => {
                //bbn.fn.log("NEW VALUE!");
                // Integration of the functionnality is done through a watcher on this property
                this.observerDirty = true;
                this.observerValue = newVal;
              });
            }, 100);
          }
        },
        /**
         * @method observerRelay
         * @memberof observerComponent
         */
        observerRelay(obs){
          if ( this.observer ){
            //bbn.fn.log("----------------observerRelay--------------", this.$el)
            let idx = bbn.fn.search(this.observers, {id: obs.id, element: obs.element});
            if ( idx > -1 ){
              if ( this.observers[idx].value !== obs.value ){
                this.observers.splice(idx, 1, obs);
              }
            }
            else{
              this.observers.push(obs);
              if ( this.observerCheck() ){
                this.observationTower.$on('bbnObs' + obs.element + obs.id, (newVal) => {
                  this.observerEmit(newVal, obs);
                });
              }
            }
            if ( this.observerCheck() ){
              this.observationTower.observerRelay(bbn.fn.clone(obs));
            }
          }
        },
        /**
         * Emits the event bbnObs.
         * @method observerEmit
         * @param {String|Number} newVal 
         * @param {Object} obs 
         * @emit bbnObs
         * @memberof observerComponent
         */
        observerEmit(newVal, obs){
          let row = bbn.fn.getRow(this.observers, {id: obs.id, element: obs.element});
          if ( row && (row.value !== newVal) ){
            row.value = newVal;
            this.$emit('bbnObs' + obs.element + obs.id, newVal);
            return true;
          }
        }
      },
      /**
       * Adds the classes 'bbn-observer-component', 'bbn-observer', 'bbn-observer-' + this.observerUID to the component
       * @event created
       * @memberof observerComponent
       */
      created(){
        if ( this.componentClass ){
          this.componentClass.push('bbn-observer-component');
          this.componentClass.push('bbn-observer', 'bbn-observer-' + this.observerUID);
        }
      },
      /**
       * Defines the observationTower object.
       * @event mounted
       * @memberof observerComponent
       */
      mounted(){
        if ( this.observer ){
          this.observationTower = this.closest('.bbn-observer');
          this.observerWatch();
        }
      },
      /**
       * Removes the observer.
       * @event beforeDestroy
       * @memberof observerComponent
       */
      beforeDestroy(){
        if ( this.isObserved() ){
          let idx = bbn.fn.search(this.observationTower.observers, {element: this.observerUID});
          if ( idx > -1 ){
            this.observationTower.observers.splice(idx, 1);
          }
          this.observationTower.$off('bbnObs' + this.observerUID + this.observerID);
        }
      },
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Keep cool component
     * @component keepCoolComponent 
     */
    keepCoolComponent: {
      data(){
        return {
          /**
           * The obejct containing the cool's timers.
           * @data {Number} [0] coolTimer
           * @memberof keepCoolComponent
           */
          coolTimers: {
          },
          /**
           * The interval.
           * @data {Number} [40] coolInterval
           * @memberof keepCoolComponent
           */
          coolInterval: 40
        }
      },
      methods: {
        /**
         * It will prevent the same action to be executed too many times in a row
         * On the first go the timer will be defined and the action will be executed
         * On the second go the promise will be created and returned
         * On the consecutive goes the promise will be returned
         * Once the promise is executed (after timeout) the promise will be recreated
         * @method keepCool
         * @param {Function} fn 
         * @param {Number} idx 
         * @param {Number} timeout 
         * @memberof keepCoolComponent
         */
        keepCool(fn, idx, timeout){
          if ( !idx ){
            idx = 'default';
          }
          let t = (new Date()).getTime();
          let delay = timeout || this.coolInterval;
          // First go of the serie: nothing exists
          if ( !this.coolTimers[idx] ){
            this.coolTimers[idx] = {
              time: 0,
              promise: false
            };
          }
          // If there is a promise it has not yet been executed
          if ( this.coolTimers[idx].promise ){
            return this.coolTimers[idx].promise;
          }

          // Timeout passed, function will have to be executed immediately
          let diff = delay + this.coolTimers[idx].time - t;
          if ( (diff > 0) && (diff <= delay) ){
            delay = diff;
            this.coolTimers[idx].time = t + delay;
          }
          else{
            delay = 0;
            this.coolTimers[idx].time = t;
          }
          this.coolTimers[idx].promise = new Promise((resolve) => {
            setTimeout(() => {
              let r = fn();
              this.coolTimers[idx].time = (new Date()).getTime();
              resolve(r);
              this.coolTimers[idx].promise = false;
            }, delay);
          });
          return this.coolTimers[idx].promise;
        }
      }
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Url component
     * @component urlComponent
     */
    urlComponent: {
      props: {
        /** 
         * The baseUrl.
         * @prop {String} baseUrl
         * @memberof urlComponent
         */
        baseUrl: {
          type: String
        }
      },
      data(){
        return {
          /**
           * @data currentURL
           * @memberof urlComponent
           */
          currentURL: null,
          /**
           * @data title
           * @memberof urlComponent
           */
          title: null
        }
      },
      methods: {
        /**
         * Updates the url.
         * @method updateUrl
         * @memberof urlComponent
         */
        updateUrl(){
          if ( this.baseUrl && (bbn.env.path.indexOf(this.baseUrl) === 0) && (bbn.env.path.length > (this.baseUrl.length + 1)) ){
            let url = this.baseUrl + (this.currentURL ? '/' + this.currentURL : '');
            bbn.fn.setNavigationVars(
              url,
              (this.currentURL ? bbn.fn.getField(this.source, this.sourceText, this.sourceValue, this.currentURL) + ' < ' : '') + document.title,
              {
                script: () => {
                  //bbn.fn.log("updateUrl & EXEC SCRIPT");
                  let idx = bbn.fn.search(this.source, this.sourceValue, this.currentURL);
                  if ( idx > -1 ){
                    this.widget.select(idx);
                    this.widget.trigger("change");
                  }
                }
              },
              !this.ready)
          }
        }
      },
      /**
       * Adds the class 'bbn-url-component' to the component
       * @event created 
       * @memberof urlComponent
       */
      created(){
        this.componentClass.push('bbn-url-component');
      },
    }
  });
})(bbn);


((bbn) => {
  "use strict";
  if ( !bbn.vue ){
    throw new Error("Impossible to find the library bbn-vue")
  }
  Vue.mixin({
    data(){
      return {
        /**
         * @data _currentPopup
         */
        _currentPopup: null
      };
    },
    computed: {
      /**
       * Return the object of the currentPopup.
       * @computed currentPopup
       * @return {Object}
       */
      currentPopup(){
        if ( !this._currentPopup ){
          let e = bbn.vue._retrievePopup(this);
          if ( e ){
            this._currentPopup = e;
          }
          else{
            let vm = this;
            while (vm = vm.$parent) {
              if ( vm._currentPopup ){
                this._currentPopup = vm._currentPopup;
                break;
              }
              else if ( vm ){
                e = bbn.vue._retrievePopup(vm);
                if ( e ){
                  this._currentPopup = e;
                  break;
                }
              }
              if (vm === this.$root) {
                break;
              }
            }
          }
        }
        if ( this._currentPopup ){
          return this._currentPopup;
        }
        return null;
      }
    },
    methods: {
      /**
       * Return the function bbn._ for the strings' translation.
       * @method _ 
       * @return {Function}
       */
      _: bbn._,
      /**
       * Fires the function bbn.vue.getRef
       * @method getRef
       * @param {String} name 
       * @fires bbn.vue.getRef
       * @return {Function}
       */
      getRef(name){
        return bbn.vue.getRef(this, name);
      },
      /**
       * Fires the
       function bbn.vue.is.
       * @method is
       * @fires bbn.vue.is
       * @param {String} selector 
       * @return {Function}
       */
      is(selector){
        return bbn.vue.is(this, selector);
      },
      /**
       * Fires the function bbn.vue.closest.
       * @method closest
       * @param {String} selector 
       * @param {Boolean} checkEle 
       * @return {Function}
       */
      closest(selector, checkEle){
        return bbn.vue.closest(this, selector, checkEle);
      },
      /**
       * Fires the function bbn.vue.ancesters.
       * @method ancesters
       * @param {String} selector 
       * @param {Boolean} checkEle 
       * @return {Function}
       */
      ancesters(selector, checkEle){
        return bbn.vue.ancesters(this, selector, checkEle);
      },
      /**
       * Fires the function bbn.vue.getChildByKey.
       * @method getChildByKey
       * @param {String} key 
       * @param {String} selector 
       * @return {Function}
       */
      getChildByKey(key, selector){
        return bbn.vue.getChildByKey(this, key, selector);
      },
      /**
       * Fires the function bbn.vue.findByKey.
       * @method findByKey
       * @param {String} key 
       * @param {String} selector 
       * @param {Array} ar 
       * @return {Function}
       */
      findByKey(key, selector, ar){
        return bbn.vue.findByKey(this, key, selector, ar);
      },
      /**
      * Fires the function bbn.vue.findAllByKey.
      * @method findAllByKey
      * @param {String} key 
      * @param {String} selector 
      * @return {Function}
      */
      findAllByKey(key, selector){
        return bbn.vue.findAllByKey(this, key, selector);
      },
      /**
      * Fires the function bbn.vue.find.
      * @method find
      * @param {String} selector 
      * @param {Number} index 
      * @return {Function}
      */  
      find(selector, index){
        return bbn.vue.find(this, selector, index);
      },
      /**
      * Fires the function bbn.vue.findAll.
      * @method findAll
      * @param {String} selector 
      * @param {Boolean} only_children 
      * @return {Function}
      */  
      findAll(selector, only_children){
        return bbn.vue.findAll(this, selector, only_children);
      },
      /**
      * Extends an object with Vue.$set
      * @method extend
      * @param {Boolean} selector 
      * @param {Object} source The object to be extended
      * @param {Object} obj1 
      * @return {Object}
      */  
      extend(deep, src, obj1){
        let args = [this];
        for ( let i = 0; i < arguments.length; i++ ){
          args.push(arguments[i]);
        }
        return bbn.vue.extend(...args);
      },
      /**
      * Fires the function bbn.vue.getComponents.
      * @method getComponents
      * @param {Array} ar 
      * @param {Boolean} only_children 
      * @return {Function}
      */
      getComponents(ar, only_children){
        return bbn.vue.getComponents(this, ar, only_children);
      },
      /**
       * Opens the object popup.
       * @method getPopup
       * @return {Object}
       */
      getPopup(){
        let popup = bbn.vue.getPopup(this);
        if ( arguments.length && popup ){
          return popup.open.apply(popup, arguments)
        }
        return popup;
      },
      /**
       * Opens the confirm.
       * @method confirm
       */  
      confirm(){
        let popup = this.getPopup();
        if ( popup ){
          popup.confirm.apply(popup, arguments)
        }
      },
      /**
       * Opens the alert.
       * @method alert
       */  
      alert(){
        let popup = this.getPopup();
        if ( popup ){
          popup.alert.apply(popup, arguments)
        }
      },
      post(){
        return bbn.vue.post(this, arguments);
      },
      postOut(){
        return bbn.vue.postOut(this, ...arguments);
      }
    }
  });
})(window.bbn);


((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    defaults: {
      appui: {
        pollable: false,
        clipboard: false,
        header: false,
        status: false,
        nav: false,
        root: '',
        pollerPath: 'core/poller',
        logo: 'https://bbn.solutions/logo.png',
        leftShortcuts: [],
        rightShortcuts: [],
        themes: [
          {
            "value": "neutral",
            "text": "Neutral",
            "isDark": false
          },{
            "value": "uniform",
            "text": "Uniform",
            "isDark": false
          }, {
            "value": "black",
            "text": "Black",
            "isDark": true
          }, {
            "value": "blue",
            "text": "Blue",
            "isDark": false
          }, {
            "value": "default",
            "text": "Default",
            "isDark": false
          }, {
            "value": "dark",
            "text": "Dark",
            "isDark": true
          }, {
            "value": "flat",
            "text": "Flat",
            "isDark": false
          }, {
            "value": "jeans",
            "text": "Jeans",
            "isDark": false
          }, {
            "value": "grey",
            "text": "Grey",
            "isDark": true
          }, {
            "value": "moonlight",
            "text": "Moonlight",
            "isDark": true
          }, {
            "value": "mirko",
            "text": "Mirko",
            "isDark": true
          }, {
            "value": "turquoise-light2",
            "text": "Turquoise light variant",
            "isDark": false
          }, {
            "value": "turquoise-dark2",
            "text": "Turquoise dark variant",
            "isDark": true
          }, {
            "value": "turquoise-dark",
            "text": "Turquoise dark",
            "isDark": true
          }, {
            "value": "turquoise-light",
            "text": "Turquoise light",
            "isDark": false
          },{
            "value": "moonlight-variant",
            "text": "Moonlight variant",
            "isDark": true
          }
        ],
      },
      code: {
        defaultTheme: 'pastel-on-dark'
      }
    }
  })
})(window.bbn);


((bbn) => {
  "use strict";
  if ( !bbn.vue ){
    throw new Error("Impossible to find the library bbn-vue")
  }
  Vue.config.isReservedTag = (tag) => {
    return bbn.vue.loadComponentsByPrefix(tag)
  };

  bbn.vue.fullComponent = bbn.fn.extend(true, {}, bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent);

  bbn.vue.addPrefix('bbn', (tag, resolve, reject) => {
    bbn.vue.queueComponentBBN(tag.substr(4), resolve, reject);
  });

  Vue.component('bbns-container', bbn.fn.extend({
    //functional: true,
    template: '<div class="bbns-container bbn-hidden"><slot></slot></div>',
    props: {
      real: {
        type: Boolean,
        default: false
      }
    },
    mounted(){
      let template = this.$el.innerHTML.trim();
      let router = this.closest('bbn-router');
      if ( router && this.url ){
        let obj = this.$options.propsData || {};
        if ( template ){
          if ( !obj.content ){
            obj.content = template;
          }
        }
        router.register(obj, true);
      }
    }
  }, bbn.vue.viewComponent));
})(window.bbn);


