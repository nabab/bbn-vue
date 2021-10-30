(bbn => {
  "use strict";
  let version = '2.0.2';
  let libURL = '';
  if ((typeof bbn_root_dir !== 'undefined')
    && (typeof bbn_root_url !== 'undefined')
    && bbn_root_dir
    && bbn_root_url
  ) {
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



(bbn => {
  "use strict";
  const isReservedTag = Vue.config.isReservedTag;
  let loadingComponents = [];
  bbn.fn.autoExtend("vue", {
    /**
     * Retrieves the closest popup component in the Vue tree
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
        let tpl = false;
        if ( r.content ){
          tpl = 'bbn-tpl-component-' + name;
          while (document.getElementById(tpl)) {
            tpl = bbn.fn.randomString();
          }
          let script = document.createElement('script');
          script.innerHTML = r.content;
          script.setAttribute('id', tpl);
          script.setAttribute('type', 'text/x-template');
          document.body.insertAdjacentElement('beforeend', script)
        }
        let data = r.data || {};
        let res;
        try {
          res = eval(r.script);
        }
        catch (e) {
          bbn.fn.log(r.script)
          throw new Error("Impossible to evaluate the content of tha component " + name);
        }
        if ( typeof res === 'object' ){
          if ( !res.mixins ){
            res.mixins = [];
          }
          if (!res.template && tpl){
            res.template = '#' + tpl;
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
              bbn.fn.each(mixins, b => {
                res.mixins.push(b);
              })
            }
            else{
              res.mixins = mixins;
            }
          }
          let bits = res.name.split('-'),
              st = '';
          bbn.fn.each(bits, b => {
            st += (b + '-');
            let idx = bbn.fn.search(this.knownPrefixes, {prefix: st});
            if ( (idx > -1) && this.knownPrefixes[idx].mixins ){
              if ( bbn.fn.isArray(this.knownPrefixes[idx].mixins) ){
                bbn.fn.each(this.knownPrefixes[idx].mixins.reverse(), m => {
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
        bbn.fn.iterate(items, a => {
          url += '/' + a.name;
        });
        url += '?v=' + bbn.version;
        return axios.get(url, {responseType:'json'}).then(d => {
          d = d.data;
          if ( d && d.success && d.components ){
            bbn.fn.iterate(items, a => {
              let cp = bbn.fn.getRow(d.components, {name: a.name});
              if ( cp && this._realDefineComponent(a.name, cp, a.mixins) && Vue.options.components[a.name]) {
                a.resolve(Vue.options.components[a.name])
              }
              else{
                //bbn.fn.log("PROMISE REJECT OF" + a.name, a);
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
        return axios.get(item.url, {responseType:'json'}).then(r => {
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
      if (bbn.fn.isArray(todo) && bbn.fn.getRow(bbn.vue.knownPrefixes, {prefix: 'bbn-'})) {
        bbn.fn.each(todo, a => {
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
        bbn.fn.each(r.html, h => {
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
        try {
          r.script = eval(r.script);
        }
        catch (e) {
          throw new Error("Impossible to define the component " + name)
        }
      }
      try {
        // That should really define the component
        r.script();
      }
      catch (e) {
        throw new Error("Impossible to execute the component " + name + " - " + e.message)
      }

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
        let url = '';
        if ((typeof bbn_root_dir !== 'undefined')
          && (typeof bbn_root_url !== 'undefined')
          && bbn_root_dir
          && bbn_root_url
        ) {
          url += bbn_root_url + bbn_root_dir;
        }
        url += 'components/?components=' + bbn.fn.map(todo, a => {
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
            res => {
              if (bbn.fn.isObject(res) && res.data) {
                // This executes the script returned by the server, which will return a new promise
                let prom;
                try {
                  prom = eval(res.data);
                }
                catch (e) {
                  bbn.fn.log("ERROR in the executed script from the server");
                  throw new Error("Problem in the executed script from the server from " + url)
                }
                //bbn.fn.log("THEN", res);
                prom.then(
                  // resolve from executed script
                  arr => {
                    // arr is the answer!
                    if (bbn.fn.isArray(arr) ){
                      bbn.fn.each(arr, r => {
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
                bbn.fn.log(res);
                throw new Error("Error loading URL " + url);
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
          let fn;
          try {
            fn = eval(d.data);
          }
          catch (e) {
            throw new Error("Impossible to define the component " + name + "\n" + e.message)
          }

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
        return r;
      }
      return false;
    },

    /**
     * Loads a component based on its prefix.
     * 
     * Looks if the given tag starts with one of the known prefixes, and 
     * in such case defines the component with the corresponding handler.
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
     * @param {Number|String} selector
     */
    is(vm, selector){
      if (selector && vm) {
        if (typeof selector === 'number') {
          return vm._uid === selector;
        }
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
     * Retrieves the closest parent to the component with the given tag/class.
     * 
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
     * Returns an array of all parents Vue objects of the component which have the given tag/class.
     * 
     * @method ancestors
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {String} selector
     * @param {Boolean} checkEle
     */
    ancestors(vm, selector, checkEle) {
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
     * Returns the given ref (equivalent to $refs[name] or $refs[name][0]).
     * 
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
     * Finds a child component by its key.
     * 
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
     * Find a descendant component by its key.
     * 
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
     * Find all descendant components with the given key.
     * 
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
     * Find the first component in descendant tree matching the given selector.
     * 
     * @method find
     * @memberof bbn.vue
     * @param {Vue} vm 
     * @param {String|Number} selector
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
     * Find all the components in descendant tree matching the given selector.
     * 
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
     * Returns all the descendant components.
     * 
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
      bbn.fn.each(vm.$children, obj => {
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
     * @method getComponentName
     * @todo Returns a component name based on the name of the given component and a path.
     * @memberof bbn.vue
     * @param {Vue}    vm   The component from which the name is created.
     * @param {String} path The relative path to the component from the given component.
     */
     getComponentName(vm, path){
      if (!vm.$options.name) {
        return null;
      }

      if (!path) {
        return vm.$options.name;
      }

      let bits = path.split('/');
      let resx = vm.$options.name.split('-');
      bbn.fn.each(bits, b => {
        if (b === '..') {
          resx.pop();
        }
        else if (b && (b !== '.')) {
          resx.push(b);
        }
      });
      return resx.join('-');
    },

    /**
     * @method getPopup
     * @memberof bbn.vue
     * @param {Vue} vm 
     */
    getPopup(vm) {
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
      bbn.fn.each(args, a => {
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
    },

    objToTree(o) {
      let r = [];
      let isArray = bbn.fn.isArray(o);
      bbn.fn.each(o, (a, n) => {
        let tmp = {
          text: isArray ? 'Array' : n
        };
        if (a === null) {
          tmp.text += ': null'
        }
        else if (a === true) {
          tmp.text += ': TRUE'
        }
        else if (a === false) {
          tmp.text += ': TRUE'
        }
        else if (bbn.fn.isArray(a) || bbn.fn.isObject(a)) {
          tmp.items = bbn.vue.objToTree(a);
          tmp.num_children = tmp.items.length;
        }
        else if (!bbn.fn.isString(a)) {
          tmp.text += ': ' + (a.toString ? a.toString() : '?')
        }
        else {
          tmp.text += ': ' + a;
        }
        r.push(tmp);
      });
      return r;
    }
  })
})(window.bbn);


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
            this.$emit('ready', this);
          }
        }
      }
    }
  });
})(bbn);


(bbn => {
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


(bbn => {
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


(bbn => {
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


(bbn => {
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
        },
        /**
         * Defines whether or not the floater has to be set mobile view.
         * @memberof dropdownComponent
         * @prop {Boolean} [false] mobile
         */
        mobile: {
          type: Boolean,
          default: true
        },
        /**
         * Preloads the floater
         * @memberof dropdownComponent
         * @prop {Boolean} [false] preload
         */
        preload: {
          type: Boolean,
          default: false
        },
        /**
         * Adds the close button to floater header
         * @memberof dropdownComponent
         * @prop {Boolean} [false] closable
         */
        closable: {
          type: Boolean,
          default: false
        },
        /**
         * The floater bottom buttons
         * @memberof dropdownComponent
         * @prop {Array} buttons
         */
        buttons: {
          type: Array
        },
        /**
         * The floater title
         * @memberof dropdownComponent
         * @prop {String} floaterTitle
         */
        floaterTitle: {
          type: String
        },
        /**
         * Using an external popup component to open the floater
         * @memberof dropdownComponent
         * @prop {Boolean|Vue} popup
         */
        popup: {
          type: [Boolean, Vue],
          default: false
        },
        /**
         * Using the browser native render
         * @memberof dropdownComponent
         * @prop {Boolean} native
         */
        native: {
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
          isActive: false,
          /**
           * The floater buttons
           * @data {Array} [[]] realButtons
           * @memberof dropdownComponent
           */
          realButtons: [],
          /**
           * The value of the native select elemenet
           * @data {String|Number|Boolean} currentSelectValue
           * @memberof dropdownComponent
           */
          currentSelectValue: this.value
        };
      },
      computed: {
        popupComponent(){
          if (this.popup) {
            if (this.popup === true) {
              return this.getPopup();
            }
            else {
              return this.popup;
            }
          }
        },
        /**
         * Returns the current 'text' corresponding to the value of the component.
         * @computed currentTextValue
         * @memberof dropdownComponent
         * @returns {String}
         */
        currentTextValue() {
          if ( (this.value !== undefined) && !bbn.fn.isNull(this.value) && this.sourceValue && this.sourceText && this.currentData.length ){
            let idx = bbn.fn.search(this.currentData, a => {
              return a.data[this.sourceValue] === this.value;
            });
            if ( idx > -1 ){
              return this.currentData[idx].data[this.sourceText];
            }
          }
          else if (this.value && this.textValue) {
            return this.textValue;
          }
          return '';
        },
        /**
         * @computed isSerching
         * @memberof dropdownComponent
         * @return {Boolean}
         */
        isSearching(){
          return this.currentText !== this.currentTextValue;
        },
        /**
         * @computed asMobile
         * @memberof dropdownComponent
         * @return {Boolean}
         */
        asMobile(){
          return this.isMobile && this.mobile;
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
          if (!this.disabled && !this.readonly && !this.native && this.filteredData.length && bbn.fn.isDom(this.$el)) {
            this.isOpened = !this.isOpened;
            if (this.writable) {
              this.$el.querySelector('input:not([type=hidden])').focus();
            }
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
        select(item, idx, dataIndex, e) {
          if (item && (!e || !e.defaultPrevented)) {
            if (this.sourceAction && item[this.sourceAction] && bbn.fn.isFunction(item[this.sourceAction])) {
              item[this.sourceAction](item);
            }
            else if (item[this.uid || this.sourceValue] !== undefined) {
              this.emitInput(item[this.uid || this.sourceValue]);
              this.$emit('change', item[this.uid || this.sourceValue], idx, dataIndex, e);
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
          if (!this.filteredData.length || e.altKey || e.ctrlKey || e.metaKey) {
            return;
          }
          if ((e.key.length >= 2) && (e.key[0] === 'F')) {
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
        },
        /**
         * Gets the buttons list
         * @method getRealButtons
         * @memberof dropdownComponent
         * @return {Array}
         */
        getRealButtons(){
          let btns = [];
          if (bbn.fn.isArray(this.buttons)) {
            bbn.fn.each(this.buttons, btn => {
              if (bbn.fn.isString(btn)) {
                if (btn === 'close') {
                  btns.push({
                    text: bbn._('Close'),
                    icon: 'nf nf-fa-times_circle',
                    action: () => {
                      this.isOpened = false;
                    }
                  });
                }
              }
              else {
                btns.push(btn);
              }
            })
          }
          return btns;
        },
        /**
         * Updates the buttons
         * @method updateButtons
         * @memberof dropdownComponent
         */
        updateButtons(){
          this.realButtons.splice(0, this.realButtons.length, ...this.getRealButtons());
        }
      },
      beforeMount() {
        this.updateButtons();
      },
      watch: {
        /**
         * @watch value
         * @memberof dropdownComponent
         */
        value(){
          this.$nextTick(() => {
            this.currentText = this.currentTextValue;
          });
        },
        /**
         * @watch ready
         * @memberof dropdownComponent
         */
        ready(v){
          if (v && this.suggest && !this.value && this.filteredData.length) {
            this.emitInput(this.filteredData[0].data[this.sourceValue]);
          }
        },
        /**
         * @watch source
         * @memberof dropdownComponent
         */
        source(){
          this.updateData().then(() => {
            if ( this.filteredData.length ) {
              this.onResize();
            }
          });
        },
        /**
         * @watch buttons
         * @memberof dropdownComponent
         */
        buttons: {
          deep: true,
          handler(){
            this.updateButtons();
          }
        }
      }
    }
  });
})(bbn);


(bbn => {
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
            if (e.preventDefault) {
              e.preventDefault();
            }
            if ( !this.isOpened ){
              this.isOpened = true;
              return;
            }
            let list = this.getRef('list');
            if (!list) {
              list = this.find('bbn-list');
            }
            if (!list && this.is('bbn-list')) {
              list = this;
            }

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


(bbn => {
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
          let e = new Event('beforeShow', {cancelable: true});
          this.$emit('beforeShow', e);
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
          let e = new Event('beforeHide', {cancelable: true});
          this.$emit('beforeHide', e);
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
          /*
          if ( this.onResize !== undefined ){
            if ( v ){
              this.onResize();
            }
            else{
              this.isResized = false;
            }
          }
          */
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
            this.$emit(v ? 'show' : 'hide');
            this.changeVisible(v);
          },
          immediate: true
        }
      }
    }
  });
})(bbn);


(bbn => {
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
          type: Boolean
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
          if (this.storage === false) {
            return false;
          }
          return (this.storage || (this.storageFullName || (this.storageName !== 'default'))) && !!this._storage;
        },
        /**
         * Returns the storage's default name.
         * @computed storageDefaultName 
         * @returns {String}
         */
        storageDefaultName(){
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


(bbn => {
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
                if ( window.dayjs && cfg.format ){
                  return v ? (new window.dayjs(v)).format(cfg.format) : '-';
                }
                else{
                  return bbn.fn.fdatetime(v, '-');
                }
              case "date":
                if ( window.dayjs && cfg.format ){
                  return v ? (new window.dayjs(v)).format(cfg.format) : '-';
                }
                else{
                  return bbn.fn.fdate(v, '-');
                }
              case "time":
                if ( cfg.format && window.dayjs ){
                  return v ? (new window.dayjs(v)).format(cfg.format) : '-';
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
                    cfg.precision === -4 ? 3 : (cfg.precision || cfg.decimals || 0)
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
              else {
                let filter = {};
                filter[this.sourceValue || 'value'] = v;
                let idx = bbn.fn.search(bbn.fn.isFunction(cfg.source) ? cfg.source() : cfg.source, filter);
                return idx > -1 ? cfg.source[idx][this.sourceText || 'text'] : '-';
              }
            }
          }
          else {
            if (bbn.fn.isString(v) && v && cfg.maxVisible) {
              return bbn.fn.shorten(v, cfg.maxVisible);
            }
            return v || '';
          }          
        }
      }
    }
  });
})(bbn);


(bbn => {
  "use strict";
  const editorOperators = {
    string: {
      contains: bbn._('Contains'),
      eq: bbn._('Is'),
      neq: bbn._('Is not'),
      startswith: bbn._('Starts with'),
      doesnotcontain: bbn._('Does not contain'),
      endswith: bbn._('To end by'),
      isempty: bbn._('Is empty'),
      isnotempty: bbn._('Is not empty')
    },
    number: {
      eq: bbn._('Is equal to'),
      neq: bbn._('Is not equal to'),
      gte: bbn._('Est supérieur ou égal àIs greater than or equal to'),
      gt: bbn._('Is greater than'),
      lte: bbn._('Is less than or equal to'),
      lt: bbn._('Is inferior to'),
    },
    date: {
      eq: bbn._('Is equal to'),
      neq: bbn._('Is not equal to'),
      gte: bbn._('Is greater than or equal to'),
      gt: bbn._('Is after'),
      lte: bbn._('Is prior to or equal to'),
      lt: bbn._('Is older than'),
    },
    enums: {
      eq: bbn._('Is equal to'),
      neq: bbn._('Is not equal to'),
    },
    boolean: {
      istrue: bbn._('Is true'),
      isfalse: bbn._('Is false')
    }
  };

  const editorNullOps = {
    isnull: bbn._('Is null'),
    isnotnull: bbn._('Is not null')
  };
  const editorNoValueOperators = ['', 'isnull', 'isnotnull', 'isempty', 'isnotempty', 'istrue', 'isfalse'];

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


(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * eventsComponent
     * @component eventsComponent
     */
    eventsComponent: {
      props: {
        /**
         * @memberof eventsComponent
         * @prop {Number} [1000] touchHoldTolerance
         */
        touchHoldTolerance: {
          type: Number,
          default: 1000
        },
        /**
         * @memberof eventsComponent
         * @prop {Number} [10] touchTapTolerance
         */
        touchTapTolerance: {
          type: Number,
          default: 10
        },
        /**
         * @memberof eventsComponent
         * @prop {Number} [30] touchSwipeolerance
         */
        touchSwipeTolerance: {
          type: Number,
          default: 30
        }
      },
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
          isFocused: false,
          /**
           * @memberof eventsComponent
           * @data {Boolean|Event} [false] touchStarted
           */
          touchStarted: false,
          /**
           * @memberof eventsComponent
           * @data {Boolean|Event} [false] touchMoved
           */
          touchMoved: false,
          /**
           * @memberof eventsComponent
           * @data {Number} [0] touchHoldTimer
           */
          touchHoldTimer: 0
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
        touchstart(ev){
          this.$emit('touchstart', ev, this);
          if (!ev.defaultPrevented) {
            this.isTouched = true;
            this.touchStarted = ev;
            clearTimeout(this.touchHoldTimer);
            this.touchHoldTimer = setTimeout(() => {
              if (this.isTouched && !this.touchMoved && !ev.defaultPrevented){
                ev.preventDefault();
                let event = new Event('contextmenu');
                this.$el.dispatchEvent(event);
                this.isTouched = false;
              }
            }, this.touchHoldTolerance);
          }
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchmove
         * @memberof eventsComponent
         */
        touchmove(ev){
          this.$emit('touchmove', ev, this);
          if (!ev.defaultPrevented) {
            //this.isTouched = false;
            if ((Math.abs(this.touchStarted.touches[0].clientX - ev.touches[0].clientX) > this.touchTapTolerance)
              || (Math.abs(this.touchStarted.touches[0].clientY - ev.touches[0].clientY) > this.touchTapTolerance)
            ) {
              clearTimeout(this.touchHoldTimer);
              this.touchMoved = ev;
            }
          }
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchend
         * @memberof eventsComponent
         */
        touchend(ev){
          this.$emit('touchend', ev, this);
          if (!ev.defaultPrevented) {
            if (this.touchStarted && this.touchMoved) {
              let direction = false,
                  diffY = Math.abs(this.touchStarted.touches[0].clientY - this.touchMoved.touches[0].clientY),
                  diffX = Math.abs(this.touchStarted.touches[0].clientX - this.touchMoved.touches[0].clientX),
                  axisX = diffX > diffY;
              if (axisX && (diffX > this.touchSwipeTolerance)) {
                direction = this.touchStarted.touches[0].clientX > this.touchMoved.touches[0].clientX ? 'left' : 'right';
              }
              else if (!axisX && (diffY > this.touchSwipeTolerance)) {
                direction = this.touchStarted.touches[0].clientY > this.touchMoved.touches[0].clientY ? 'top' : 'bottom';
              }
              if (!!direction) {
                this.$emit('swipe', ev, this, direction)
                this.$emit('swipe' + direction, ev, this)
              }
            }
            this.isTouched = false;
            this.touchMoved = false;
            this.touchStarted = false;
          }
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchcancel
         * @memberof eventsComponent
         */
        touchcancel(ev){
          clearTimeout(this.touchHoldTimer);
          this.isTouched = false;
          this.touchStarted = false;
          this.touchMoved = false;
          this.$emit('touchcancel', ev, this);
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


(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * editableListComponent
     * @component editableListComponent
     */
    editableListComponent: {
      props: {
        /**
         * If defined, the form created for the edit of the table will have this URL as action.
         * @prop {String} url
         */
        url: {
          type: String
        },
        /**
         * Defines the editor to use when a item is in edit mode.
         * @prop {String|Object} editor
         */
        editor: {
          type: [String, Object, Function]
        },
        /**
         * Set to true allows to edit inline the fields if no buttons are defined for the table.
         * @prop {Boolean|String|Function} editable
         */
        editable: {
          type: [Boolean, String, Function],
          default: false,
          validator: e => bbn.fn.isFunction(e) || (typeof e === 'boolean') || ['inline', 'popup', 'nobuttons'].includes(e)
        },
        /**
         * Auto saves the row when edit-mode is 'inline'
         * @prop {Boolean} [false] autoSave
         */
        autoSave: {
          type: Boolean,
          default: false
        },
        /**
         * Automatically resets the original values ​​when edit-mode is 'inline'
         * @prop {Boolean} [false] autoReset
         */
        autoReset: {
          type: Boolean,
          default: false
        }
      },
      data(){
        let editable = bbn.fn.isFunction(this.editable) ? this.editable() : this.editable;
        return {
          /**
           * @data {String} editMode
           */
          editMode: editable === true ? (this.editor ? 'popup' : 'inline') : (editable === 'popup' ? 'popup' : 'inline'),
          /**
           * @data {Boolean|Object} [false] tmpRow
           */
          tmpRow: false,
          /**
           * @data {Boolean|Object} [false] originalRow
           */
          originalRow: false,
          /**
           * @data {Boolean|Object} [false] editedRow
           */
          editedRow: false,
          /**
           * @data {Boolean|Number} [false] editedIndex
           */
          editedIndex: false,
        }
      },
      computed: {
        /**
         * Return true if the table isn't ajax, is editable and the edit mode is 'inline'.
         * @computed isBatch
         * @returns {Boolean}
         */
        isBatch() {
          return this.editable && (this.editMode === 'inline') && !this.isAjax
        },
        /**
         * If the computed isBatch is true, return an array of modified rows.
         * @computed modifiedRows
         * @returns {Array}
         */
        modifiedRows() {
          let res = [];
          if (this.isBatch) {
            bbn.fn.each(this.currentData, (d, i) => {
              if (JSON.stringify(d.data) !== JSON.stringify(this.originalData[i])) {
                res.push(d);
              }
            })
          }
          return res;
        },
      },
      methods: {
        _defaultRow(data){
          return data || {};
        },
        /**
         * Creates the object tmpRow.
         *
         * @method _addTmp
         * @param data
         * @returns {Vue}
         */
        _addTmp(data) {
          this._removeTmp().tmpRow = this._defaultRow(data);
          this.$emit('addTmp', this.tmpRow);
          return this;
        },
        /**
         * Changes the values of tmpRow to false.
         * @method _removeTmp
         * @returns {Vue}
         */
        _removeTmp() {
          if (this.tmpRow) {
            this.tmpRow = false;
          }
          return this;
        },
        /**
         * Returns true if the row corresponding to the given index has changed respect to originalData.
         * @method isModified
         * @param {Number} idx
         * @returns {Boolean}
         */
        isModified(idx) {
          if (!this.originalData) {
            return false;
          }
          let data = [],
              orig;
          if (idx === undefined) {
            data = bbn.fn.map(this.currentData, d => d.data);
            orig = this.originalData;
          }
          else {
            data = bbn.fn.getField(this.currentData, 'data', {index: idx}),
            orig = this.originalData[idx];
          }
          return JSON.stringify(data) !== JSON.stringify(orig);
        },
        /**
         * Adds the given data to the object tmpRow and opens the popup with the form to insert the row.
         * @method insert
         * @param {Object} data
         * @param {Object} options
         * @param {Number} index
         * @fires _addTmp
         * @fires edit
         */
        insert(data, options, index) {
          let d = data ? bbn.fn.clone(data) : {};
          if (this.uid && d[this.uid]) {
            delete d[this.uid];
          }
          this._addTmp(d, index);
          this.edit(this.tmpRow, options, index);
        },
        /**
         * Adds the given data to the object tmpRow and opens the popup with the form to copy the row.
         * @method copy
         * @param {Object} data
         * @param {Object} options
         * @param {Number} index
         * @fires _addTmp
         * @fires edit
         */
        copy(data, options, index) {
          let r = bbn.fn.clone(data);
          if (this.uid && r[this.uid]) {
            delete r[this.uid];
          }
          this._addTmp(r);
          this.edit(this.tmpRow, options, index);
        },
        /**
         * Opens the popup containing the form to edit the row.
         * @method edit
         * @param {Object} row
         * @param {String|Object} winOptions
         * @param {Number} index
         * @fires _addTmp
         */
        edit(row, winOptions, index) {
          if (!this.editable) {
            throw new Error("The component is not editable, you cannot use the edit function");
          }
          if ( !winOptions ){
            winOptions = {};
          }
          if (!row) {
            this._addTmp();
            row = this.tmpRow;
          }
          this.originalRow = bbn.fn.clone(row);
          // EditedRow exists from now on the time of the edition
          this.editedRow = row;
          this.editedIndex = bbn.fn.isFunction(this.getDataIndex) ? this.getDataIndex(index) : index;
          if (this.editMode === 'popup') {
            if (typeof (winOptions) === 'string') {
              winOptions = {
                title: winOptions
              };
            }
            if (!winOptions.height) {
              //winOptions.height = (this.cols.length * 2) + 'rem'
            }
            if (winOptions.maximizable === undefined) {
              winOptions.maximizable = true;
            }
            let popup = bbn.fn.extend({
              source: {
                row: row,
                data: bbn.fn.isFunction(this.data) ? this.data() : this.data
              }
            }, {
              title: bbn._('Row edition'),
              width: 700
            }, winOptions ? winOptions : {});
            // A component is given as global editor (form)
            if (this.editor) {
              popup.component = bbn.fn.isFunction(this.editor) ? this.editor(row, index) : this.editor;
            }
            // A URL is given and in this case the form will be created automatically with this URL as action
            else if (this.url) {
              let table = this;
              let o = bbn.fn.extend({}, this.data, {
                action: table.tmpRow ? 'insert' : 'update'
              });
              popup.component = {
                data() {
                  let fields = [];
                  table.cols.map(a => {
                    let o = bbn.fn.extend(true, {}, a);
                    if (o.ftitle) {
                      o.title = o.ftitle;
                    }
                    fields.push(o);
                  });
                  return {
                    // Table's columns are used as native form config
                    fields: fields,
                    data: row,
                    obj: o
                  }
                },
                template: `
  <bbn-form action="` + table.url + `"
            :schema="fields"
            :scrollable="false"
            :source="data"
            :data="obj"
            @success="success"
            @failure="failure">
  </bbn-form>`,
                methods: {
                  success(d, e) {
                    e.preventDefault();
                    if (table.successEdit(d)) {
                      table.getPopup().close();
                    }
                  },
                  failure(d) {
                    table.$emit('editFailure', d);
                  },
                },
              };
            } else {
              throw new Error(bbn._("Impossible to open a window if either an editor or a URL is not set"))
            }
            popup.afterClose = () => {
              //  this.currentData.push(bbn.fn.clone( this.tmpRow)); // <-- Error. This add a new row into table when it's in edit mode
              this._removeTmp();
              this.editedRow = false;
              this.editedIndex = false;
            };
            this.getPopup(popup);
          }
        },
        /**
         * Cancels the changes made on the row data.
         * @method cancel
         * @fires _removeTmp
         */
        cancel() {
          if (this.tmpRow) {
            this._removeTmp();
          }
          else if (this.editedRow && this.originalRow) {
            if (this.currentData[this.editedIndex]) {
              this.currentData[this.editedIndex].data = this.originalRow;
            }
          }
          this.originalRow = false;
          this.editedRow = false;
          this.editedIndex = false;
        },
        /**
         * Insert or update a row in originalData.
         * @method saveRow
         * @emit saverow
         */
        saveRow() {
          // New insert
          let ev = new Event('saverow', {cancelable: true});
          this.$emit('saverow', this.tmpRow || this.editedRow, ev);
          if (!ev.defaultPrevented) {
            if (this.tmpRow) {
              let row = bbn.fn.clone(this.tmpRow);
              this.currentData.push({
                data: row,
                index: this.currentData.length
              });
              if (this.originalData) {
                this.originalData.push(bbn.fn.clone(row));
              }
              if (bbn.fn.isArray(this.source)) {
                this.source.push(row);
              }

              this.tmpRow = false;
            }
            // Update
            else if (this.editedRow) {
              let row = bbn.fn.clone(this.editedRow);
              this.$set(this.currentData[this.editedIndex], 'data', row);
              if (this.originalData) {
                let or = this.originalData.splice(this.editedIndex, 1, bbn.fn.clone(row));
                if (bbn.fn.isArray(this.source)) {
                  let idx = bbn.fn.search(this.source, or[0]);
                  if (idx > -1) {
                    this.source.splice(idx, 1, row);
                  }
                }
              }
              else if (bbn.fn.isArray(this.source) && this.uid && this.source[this.uid]) {
                let idx = bbn.fn.search(this.source, {[this.uid]: this.source[this.uid]});
                if (idx > -1) {
                  this.source.splice(idx, 1, row);
                }
              }

              this.editedRow = false;
            }
            return true;
          }
          return false;
        },
        /**
         * If the prop url of the table is defined makes a post to the url to update or insert the row, else fires the method saveRow to insert or update the row in originalData.
         * @method saveInline
         * @fires saveRow
         *
         */
        saveInline() {
          if (this.tmpRow || this.editedRow) {
            if (this.url) {
              let o = bbn.fn.extend({}, this.data, this.tmpRow || this.editedRow, {
                action: this.tmpRow ? 'insert' : 'update'
              });
              this.post(this.url, o, d => {
                this.successEdit(d);
              })
            }
            else {
              let d = bbn.fn.clone(this.tmpRow || this.editedRow);
              if (this.saveRow()) {
                this.$emit(this.tmpRow ? 'insert' : 'edit', d);
              }
            }
          }
        },
        /**
         * After the post in case of edit of the row, update the row in originalData.
         *
         * @method successEdit
         * @param {Object} d
         * @emit editSuccess
         * @fires saveRow
         * @returns {Boolean}
         */
        successEdit(d) {
          if (bbn.fn.isObject(d)) {
            if ((d.success !== undefined) && !d.success) {
              if (window.appui) {
                let ev = new Event('editFailure', {cancelable: true});
                this.$emit('editFailfure', d, ev);
                if (!ev.defaultPrevented) {
                  appui.error();
                }
              }
            }
            else {
              let ev = new Event('editSuccess', {cancelable: true});
              this.$emit('editSuccess', d, ev);
              if (!ev.defaultPrevented) {
                if (d.data) {
                  bbn.fn.iterate(d.data, (o, n) => {
                    this.editedRow[n] = o;
                  });
                }
                this.saveRow();
                return true;
              }
            }
          }
          return false;
        },
        /**
         * @ignore
         * @method saveTmp
         */
        saveTmp() {},
        saveEditedRow() {},
        cancelEditedRow() {},
      },
      /**
       * Adds the class 'bbn-editable-list-component' to the component.
       * @event created
       * @memberof editableListComponent
       */
      created(){
        this.componentClass.push('bbn-editable-list-component');
      },
      watch: {
        /**
         * @watch editedRow
         */
        editedRow(newVal) {
          if (newVal === false) {
            this.editedIndex = false;
          }
        }
      }
    }
  });
})(bbn);


(bbn => {
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
         * The name of the property to be used as icon.
         * @prop {String} sourceIcon
         * @memberof listComponent
         */
         sourceIcon: {
          type: String
        },
        /**
         * The name of the property to be used as image.
         * @prop {String} sourceImg
         * @memberof listComponent
         */
         sourceImg: {
          type: String
        },
        /**
         * The name of the property to be used as class.
         * @prop {String} sourceCls
         * @memberof listComponent
         */
         sourceCls: {
          type: String
        },
        /**
         * The name of the property to be used as action.
         * @prop {String} sourceAction
         * @memberof listComponent
         */
         sourceAction: {
          type: String
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
        },
        /** 
         *  The tree will be shown on one level, with .. at the top, clicking an element with children will enter it
         */
        flat: {
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
           * True if the list has been loaded.
           * @data {Boolean} [false] isLoaded
           * @memberof listComponent 
           */
          isLoaded: this.source !== 'string',
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
          loadingRequestID: false,
          /**
           * If hirarchy and uid and flat will be set to the last entered node UID
           * @data {false|String} the UID of the last entered node
           */
          parentUid: false
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
          return bbn.fn.filter(this.limits.sort(), a => {
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
         * @memberof listComponent
         * @return {number}
         */
        numPages() {
          return Math.ceil(this.total / this.currentLimit);
        },
        /**
         * Return the current page of the list.
         * @computed currentPage
         * @memberof listComponent
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
            return bbn.fn.filter(this.currentData, a => {
              return this._checkConditionsOnItem(this.currentFilters, a.data);
            });
          }
          else{
            return this.currentData;
          }
        },
        filteredTotal(){
          return this.filteredData.length;
        },
        /** @todo Remove: no sense and not used in any component */
        valueIndex(){
          if ( this.value || (this.selected && this.selected.length) ){
            let v = this.value || this.selected[0];
            if ( this.uid ){
              return bbn.fn.search(this.filteredData, a => {
                return a.data[this.uid] === v;
              });
            }
            else if ( this.sourceValue ){
              return bbn.fn.search(this.filteredData, a => {
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
        hashCfg(){
          return bbn.fn.md5(JSON.stringify(this.currentFilters) + JSON.stringify(this.currentLimit) + JSON.stringify(this.currentStart) + JSON.stringify(this.currentOrder));
        },
        /**
         * Returns the current item icon
         * @computed currentItemIcon
         * @memberof listComponent
         * @return {String}
         */
        currentItemIcon(){
          if ((this.value !== undefined)
            && !bbn.fn.isNull(this.value)
            && this.sourceValue
            && this.sourceIcon
            && this.currentData.length
          ){
            let idx = bbn.fn.search(this.currentData, a => {
              return a.data[this.sourceValue] === this.value;
            });
            if (idx > -1) {
              return this.currentData[idx].data[this.sourceIcon];
            }
          }
          return '';
        },
        /**
         * Returns the current item image
         * @computed currentItemImg
         * @memberof listComponent
         * @return {String}
         */
        currentItemImg(){
          if ((this.value !== undefined)
            && !bbn.fn.isNull(this.value)
            && this.sourceValue
            && this.sourceImg
            && this.currentData.length
          ){
            let idx = bbn.fn.search(this.currentData, a => {
              return a.data[this.sourceValue] === this.value;
            });
            if (idx > -1) {
              return this.currentData[idx].data[this.sourceImg];
            }
          }
          return '';
        },
        /**
         * Returns the current item class
         * @computed currentItemCls
         * @memberof listComponent
         * @return {String}
         */
        currentItemCls(){
          if ((this.value !== undefined)
            && !bbn.fn.isNull(this.value)
            && this.sourceValue
            && this.sourceCls
            && this.currentData.length
          ){
            let idx = bbn.fn.search(this.currentData, a => {
              return a.data[this.sourceValue] === this.value;
            });
            if (idx > -1) {
              return this.currentData[idx].data[this.sourceCls];
            }
          }
          return '';
        }
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
              data = data.map(a => {
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
            let del = arr => {
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
        async updateData(){
          if (this.beforeUpdate() !== false) {
            this._dataPromise = new Promise(resolve => {
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
              prom.then(d => {
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
                    if (this.parentUid && this.hierarchy && this.flat && this.uid) {
                      d.data.unshift({
                        [this.uid]: this.parentUid,
                        [this.sourceText]: ".."
                      });
                    }
                    d.data = this._map(d.data);
                    this.currentData = bbn.fn.map(d.data, (a, i) => {
                      /** @todo Is it compatible with the fact of updating the source when given an array */
                      let o = this.hierarchy ? bbn.fn.extend(true, a, {
                        index: i,
                        key: this.isAjax ? (i + '-' + this.hashCfg) : i,
                        _bbn: true,
                      }) : {
                        data: a,
                        index: i,
                        key: this.isAjax ? (i + '-' + this.hashCfg) : i,
                        _bbn: true
                      };
                      if (this.children && a[this.children] && a[this.children].length) {
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
                if (!this.isLoaded) {
                  this.isLoaded = true;
                }
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
              }), d => {
                if (d.success) {
                  let data = this.currentData[index].data;
                  this.currentData.splice(index, 1);
                  if (!this.isAjax && bbn.fn.isArray(this.source)) {
                    let idx = bbn.fn.search(this.source, data);
                    if (idx > -1) {
                      this.source.splice(idx, 1);
                    }
                  }

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
            }
            else {
              let data = this.currentData[index].data;
              this.currentData.splice(index, 1);
              if (!this.isAjax && bbn.fn.isArray(this.source)) {
                let idx = bbn.fn.search(this.source, data);
                if (idx > -1) {
                  this.source.splice(idx, 1);
                }
              }

              this.total--;
              if (this.originalData) {
                this.originalData.splice(index, 1);
              }
              this.updateIndexes();
              this.$emit('delete', data, ev);
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
          if (!this.isAjax && bbn.fn.isArray(this.source)) {
            this.source.push(data);
          }
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
        getIndex(filter) {
          if (!bbn.fn.isObject(filter) && this.uid) {
            filter = {[this.uid]: filter};
          }
          let fltr = bbn.fn.filterToConditions(filter);
          let idx = -1;

          bbn.fn.each(this.filteredData, (a, i) => {
            if (bbn.fn.compareConditions(a.data, fltr)) {
              idx = i;
              return false;
            }
          });
          return idx;
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
        listOnBeforeMount(){
          if ( this.isAutobind ){
            this.updateData();
          }
        }
      },
      beforeMount(){
        this.listOnBeforeMount();
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


(bbn => {
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


(bbn => {
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
        value: {
          default(){
            return this.default !== undefined ? this.default : ''
          }
        },
        /**
         * The component's name.
         * @prop {String} name 
         * @memberof inputComponent
         */
        name: {
          type: String,
          default(){
            return bbn.fn.randomString(10, 20)
          }
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
         * @prop {Number} tabindex
         * @memberof inputComponent
         */
        tabindex: {
          type: Number,
          default: 0
        },
        /**
         * @prop {Boolean} [false] nullable
         * @memberof inputComponent
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
        },
        /**
         * @prop {Number|String} default
         * @memberof inputComponent
         */
        default: {
          type: [String, Number]
        },
        /**
         * @prop {Boolean} [true] writable
         * */
        writable: {
          type: Boolean,
          default: true
        },
        /**
         * Defines the input mode of this elemenet
         * @prop {String} inputmode
         */
        inputmode: {
          type: String
        }
      },
      data(){
        let original = this.value;
        if (bbn.fn.isObject(this.value) || bbn.fn.isArray(this.value)) {
          original = bbn.fn.clone(this.value);
        }

        return {
          /**
           * True if the component has a value.
           * @data {Boolean} hasVale
           */
          hasValue: !!this.value,
          originalValue: original
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
        resetValue(){
          if (bbn.fn.isObject(this.value) || bbn.fn.isArray(this.value)) {
            this.originalValue = bbn.fn.clone(this.value);
          }
          else {
            this.originalValue = this.value;
          }
        },
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
        isValid(e, setError = true){
          const $this = bbn.fn.isVue(e) ? e : this,
                ele = $this.$refs.element || false,
                inp = $this.$refs.input || false,
                customMessage = $this.$el.hasAttribute('validationMessage') ? $this.$el.getAttribute('validationMessage') : false;
          let check = elem => {
            if ( elem && elem.validity ){
              let validity = elem.validity,
                  $elem = $this.$el,
                  // Default message
                  mess = bbn._('The value you entered for this field is invalid.'),
                  specificCase = false;
              // If valid or disabled, return true
              if ( elem.disabled || validity.valid ){
                //if ( (!!elem.required || !!elem.readOnly) && !elem.value ){
                if ( elem.required && !elem.value ){
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
                  mess = bbn._('Please lengthen this text to %d characters or more. You are currently using %d characters.', parseInt(elem.getAttribute('minLength')), elem.value.length);
                }
                // If too long
                else if ( validity.tooLong ){
                  mess = bbn._('Please shorten this text to no more than %d characters. You are currently using %d characters.', parseInt(elem.getAttribute('maxLength')), elem.value.length);
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
                  mess = bbn._('Please select a value that is no more than %d.', parseInt(elem.getAttribute('max')));
                }
                // If a number field is below the min
                else if ( validity.rangeUnderflow ){
                  mess = bbn._('Please select a value that is no less than %d.', parseInt(elem.getAttribute('min')));
                }
                // If pattern doesn't match
                else if (validity.patternMismatch) {
                  // If pattern info is included, return custom error
                  mess = bbn._('Please match the requested format.');
                }
                if (setError) {
                  this.$emit('error', customMessage || mess);
                  let border = $elem.style.border;
                  $elem.style.border = '1px solid red';
                  this.$once('blur', () => {
                    $elem.style.border  = border;
                    $elem.focus();
                  });
                }
                return false;
              }
            }
          };
          let getLastElement = elem => {
            if ( bbn.fn.isVue(elem) && elem.$refs && elem.$refs.element ){
              return getLastElement(elem.$refs.element);
            }
            return elem;
          };
          if (inp) {
            return check(getLastElement(inp)) || false;
          }
          if (ele) {
            return check(getLastElement(ele)) || false;
          }
          return true;
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
        }
      }
    }
  });
})(bbn);


(bbn => {
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
                this.isResizing = false;
                resolve();
              })
            }
            else {
              resolve();
            }
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
          if (this.parentResizer) {
            ctH = this.parentResizer.lastKnownHeight;
            ctW = this.parentResizer.lastKnownWidth;
          }
          else if (offsetParent) {
            ctH = isAbsolute ? bbn.fn.outerHeight(offsetParent) : Math.round(offsetParent.clientHeight);
            ctW = isAbsolute ? bbn.fn.outerWidth(offsetParent) : Math.round(offsetParent.clientWidth);
          }
          else {
            ctH = bbn.env.height;
            ctW = bbn.env.width;
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
        getParentResizer(){
          let parentResizer = this.closest(".bbn-resize-emitter");
          // In case we have 2 comnponents in one
          while (parentResizer && (parentResizer.onResize === undefined)) {
            parentResizer = parentResizer.$parent;
          }
          return parentResizer.onResize !== undefined ? parentResizer : false;
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
          this.parentResizer = this.getParentResizer();

          // Setting initial dimensions
          //this.setContainerMeasures();
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
                let tmp = this.getParentResizer();
                if ( tmp !== this.parentResizer ){
                  // In that case we reset
                  this.unsetResizeEvent();
                  this.setResizeEvent();
                  return;
                }
              }
              //bbn.fn.log("ON PARENT RESIZER EMIT");
              this.onResize(true);
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



(bbn => {
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


(bbn => {
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
         * The min-width of the component.
         * @prop {String|Number} minWidth
         * @memberof fieldComponent
         */
        minWidth: {
          type: [String, Number],
        },
        /**
         * The max-width of the component.
         * @prop {String|Number} maxWidth
         * @memberof fieldComponent
         */
        maxWidth: {
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
         * Defines the max number of chars visible in reading.
         * @prop {Number} maxVisible 
         * @memberof fieldComponent
         */
        maxVisible: {
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


(bbn => {
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


(bbn => {
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
              this.observationTower.$on('bbnObs' + this.observerUID + this.observerID, newVal => {
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
                this.observationTower.$on('bbnObs' + obs.element + obs.id, newVal => {
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
        },
        /**
         * The called method on the switching to false of the "observer Dirty" property value
         * @method observerClear
         * @param {Object} obs
         * @fires observationTower.observerClear
         */
        observerClear(obs){
          if (this.observationTower) {
            this.observationTower.observerClear(obs);
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
      watch: {
        /**
         * @watch observerDirty
         * @param {Boolean} newVal
         * @fires observerClear
         */
        observerDirty(newVal){
          if (!newVal) {
            this.observerClear({
              id: this.observerID,
              element: this.observerUID,
              value: this.observerValue
            });
          }
        }
      }
    }
  });
})(bbn);


(bbn => {
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
          this.coolTimers[idx].promise = new Promise(resolve => {
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


(bbn => {
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


(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * serviceWorker Component.
     * @component serviceWorkerComponent
     */
    serviceWorkerComponent: {
      props: {},
      data(){
        return {
          /**
           * The registered channels list
           * @data {Array} [[]] registeredChannels
           * @memberof serviceWorkerComponent
           */
          registeredChannels: [],
          /**
           * The primary channel
           * @data {String} [''] primaryChannel
           * @memberof serviceWorkerComponent
           */
        }
      },
      methods: {
        /**
         * Registers a channel
         * @method registerChannel
         * @memberof serviceWorkerComponent
         * @param {String} channel
         * @fires _postMessage
         * @return {Boolean}
         */
        registerChannel(channel, primary){
          if (!this.registeredChannels.includes(channel)
            && this._postMessage({
              type: 'registerChannel',
              channel: channel
            })
          ) {
            this.registeredChannels.push(channel);
            if (primary) {
              this.primaryChannel = channel;
            }
            return true;
          }
          return false;
        },
        /**
         * Unregisters a channel
         * @method unregisterChannel
         * @memberof serviceWorkerComponent
         * @param {String} channel
         * @fires _postMessage
         * @return {Boolean}
         */
        unregisterChannel(channel){
          if (this.registeredChannels.includes(channel)
            && this._postMessage({
              type: 'unregisterChannel',
              channel: channel
            })
          ) {
            this.registeredChannels.splice(this.registeredChannels.indexOf(channel), 1);
            return true;
          }
          return false;
        },
        /**
         * Sends a message to a channel
         * @method messageChannel
         * @memberof serviceWorkerComponent
         * @param {String} channel
         * @param {Object} data
         * @fires _postMessage
         * @return {Boolean}
         */
        messageChannel(channel, data){
          if (this.registeredChannels.includes(channel)
            && this._postMessage({
              type: 'messageChannel',
              channel: channel,
              data: this._encodeMessageData(data)
            })
          ) {
            return true;
          }
          return false;
        },
        /**
         * Receives data from a channel
         * @method messageFromChannel
         * @memberof serviceWorkerComponent
         * @param {Object} data
         */
        messageFromChannel(data){
          data = this._decodeMessageData(data);
          if (data.function){
            if (bbn.fn.isFunction(data.function)) {
              data.function(...(data.params || []));
            }
            else if (bbn.fn.isFunction(this[data.function])) {
              this[data.function](...(data.params || []));
            }
          }
        },
        /**
         * Emits messageToChannel event
         * @method messageToChannel
         * @memberof serviceWorkerComponent
         * @param {Object} data
         * @param {String} channel
         * @emit messageToChannel
         */
        messageToChannel(data, channel){
          this.$emit('messageToChannel', data, channel);
        },
        /**
         * @method _checkSW
         * @memberof serviceWorkerComponent
         * @return {Boolean}
         */
        _checkSW(){
          if ('serviceWorker' in navigator) {
            if (navigator.serviceWorker.controller) {
              return navigator.serviceWorker.controller.state !== 'redundant';
            }
            else {
              bbn.fn.info("NO CONTROLLER FOR SW");
            }
          }
          else {
            bbn.fn.info("NO SW");
          }
          return false;
        },
        /**
         * Postes the message to the service worker
         * @method _postMessage
         * @memberof serviceWorkerComponent
         * @param {Object}
         * @fires _checkSW
         * @return {Boolean}
         */
        _postMessage(obj){
          if (this._checkSW()) {
            navigator.serviceWorker.controller.postMessage(obj);
            return true;
          }
          return false;
        },
        /**
         * Encodes the data of the message
         * @method _encodeMessageData
         * @memberof serviceWorkerComponent
         * @param {Object} data
         * @return {String}
         */
        _encodeMessageData(data){
          return JSON.stringify(data, (k, d) => bbn.fn.isFunction(d) ? '/Function(' + d.toString() + ')/' : d);
        },
        /**
         * Decodes the data of the message
         * @method _decodeMessageData
         * @memberof serviceWorkerComponent
         * @param {String} data
         * @return {Object}
         */
        _decodeMessageData(data){
          return JSON.parse(data, (k, d) => {
            if (bbn.fn.isString(d)
              && d.startsWith('/Function(')
              && d.endsWith(')/')
            ) {
              d = d.substring(10, d.length - 2);
              return (0, eval)('(' + d + ')');
            }
            return d;
          })
        }
      },
      /**
       * Adds the class 'bbn-service-worker-component' to the component.
       * @event created
       * @memberof serviceWorkerComponent
       */
       created(){
        this.componentClass.push('bbn-service-worker-component');
      },
    }
  });
})(bbn);


(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Browser Notification Component.
     * @component browserNotificationComponent
     */
    browserNotificationComponent: {
      /**
       * @mixin bbn.vue.serviceWorkerComponent
       * @memberof browserNotificationComponent
       */
      mixins: [bbn.vue.serviceWorkerComponent],
      props: {
        /**
         * @prop {Boolean} [false] browserNotification
         */
        browserNotification: {
          type: Boolean,
          default: false
        }
      },
      data(){
        return {
          /**
           * @data {Boolean} [false] hasBrowserPermission
           * @memberof browserNotificationComponent
           */
          hasBrowserPermission: false,
          /**
           * @data {Object} [{}] browserNotifications
           * @memberof browserNotificationComponent
           */
          browserNotifications: {},
          /**
           * @data {String} [''] browserNotificationURL
           * @memberof browserNotificationComponent
           */
          browserNotificationURL: '',
          /**
           * @data {Boolean} [false] browserNotificationSW
           * @memberof browserNotificationComponent
           */
          browserNotificationSW: false
        }
      },
      methods: {
        /**
           * @method browserNotify
           * @memberof browserNotificationComponent
           * @param {String} title
           * @param {String} text,
           * @param {Object} options
           * @fires _postMessage
           * @fires $set
           */
        browserNotify(title, text, options){
          if (this.ready
            && this.browserNotification
            && this.hasBrowserPermission
            && title
            && text
          ) {
            if (bbn.fn.isObject(text)) {
              options = text;
            }
            else if (bbn.fn.isString(text)) {
              if (bbn.fn.isObject(options)) {
                options = {
                  body: text
                }
              }
              else {
                options = {};
              }
              if (!options.body || (options.body !== text)) {
                options.body = text;
              }
            }
            options.tag = options.tag || options.timestamp || n.timestamp;
            if (this.browserNotificationSW) {
              this._postMessage({
                type: 'notification',
                data: {
                  title: title,
                  options: options
                }
              })
            }
            else {
              options.onclick = this.browserNotificationClick;
              let n = new Notification(title, options);
              this.$set(this.browserNotifications, options.tag, n);
            }
          }
        },
        /**
         * @method browserNotificationClick
         * @memberof browserNotificationComponent
         * @param {Object} options
         * @fires post
         * @fires removeBrowserNotification
         * @fires messageToChannel
         */
        browserNotificationClick(options){
          if (this.browserNotificationURL) {
            this.post(this.browserNotificationURL + '/actions/read', {id: options.tag}, d => {
              if (d.success) {
                this.removeBrowserNotification(options.tag);
                this.messageToChannel({
                  method: 'removeBrowserNotification',
                  params: [options.tag]
                });
              }
            })
          }
          else {
            this.removeBrowserNotification(options.tag);
          }
        },
        /**
         * @method removeBrowserNotification
         * @memberof browserNotificationComponent
         * @param {String} id
         * @fires $delete
         */
        removeBrowserNotification(id){
          if (id && (id in this.browserNotifications)){
            this.$delete(this.browserNotifications, id);
          }
        }
      },
      /**
       * Adds the class 'bbn-browser-notification-component' to the component.
       * @event created
       * @memberof browserNotificationComponent
       */
       created(){
        this.componentClass.push('bbn-browser-notification-component');
      },
      /**
       * @event mounted
       */
      mounted(){
        if (this.browserNotification) {
          Notification.requestPermission(perms => {
            this.hasBrowserPermission = perms === 'granted';
          })
        }
      }
    }
  });
})(bbn);


(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * component Inside Component.
     *
     * @component componentInsideComponent
     */
    componentInsideComponent: {
      props: {
       /**
        * The component that will be rendered inside the main component.
        * @prop {String|Object|Vue} component
        * @memberof componentInsideComponent
        */
        component: {
          type: [String, Object, Vue]
        },
       /**
        * The component's props.
        * @prop {Object} componentOptions
        * @memberof componentInsideComponent
        */
        componentOptions: {
          type: Object,
          default(){
            return {};
          }
        }
      }
    }
  });
})(bbn);



(bbn => {
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
       * Fires the function bbn.vue.ancestors.
       * @method ancestors
       * @param {String} selector 
       * @param {Boolean} checkEle 
       * @return {Function}
       */
      ancestors(selector, checkEle){
        return bbn.vue.ancestors(this, selector, checkEle);
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
        if (arguments.length && popup) {
          let cfg = arguments[0];
          let args = [];
          if (bbn.fn.isObject(cfg)) {
            cfg.opener = this;
          }
          args.push(cfg);
          for (let i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
          }

          return popup.open.apply(popup, args);
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
      },
      /**
       * @method getComponentName
       * @todo Returns a component name based on the name of the given component and a path.
       * @memberof bbn.vue
       * @param {Vue}    vm   The component from which the name is created.
       * @param {String} path The relative path to the component from the given component.
       */
      getComponentName(){
        return bbn.vue.getComponentName(this, ...arguments);
      },

    }
  });
})(window.bbn);


(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    defaults: {
      appui: {
        pollable: false,
        clipboard: false,
        header: false,
        status: false,
        nav: false,
        footer: false,
        urlNavigation: true,
        //root: '',
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
            "value": "grinks",
            "text": "Grinks",
            "isDark": false
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



(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    init: cfg => {
      if ( !bbn.vue ){
        throw new Error("Impossible to find the library bbn-vue")
      }

      if (!bbn.fn.isInit) {
        if (cfg) {
          bbn.fn.init(cfg);
        }
        else {
          throw new Error("bbn is not initialized")
        }
      }

      Vue.config.isReservedTag = tag => {
        return bbn.vue.loadComponentsByPrefix(tag)
      };
      Vue.config.devtools = !(!bbn.env.mode || (bbn.env.mode === 'prod'));
      bbn.fn.log("devtools", Vue.config.devtools, bbn.env.mode, bbn.env.isInit, 'iiii');

      Vue.config.errorHandler = function (err, vm, info) {
        // handle error
        // `info` is a Vue-specific error info, e.g. which lifecycle hook
        // the error was found in. Only available in 2.2.0+
        bbn.fn.log("ERROR handler from VueJS", err, vm, info);
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
            obj.real = false;
            router.register(obj, true);
          }
        }
      }, bbn.vue.viewComponent));
    }
  });
})(window.bbn);


