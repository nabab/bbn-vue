(bbn => {
  "use strict";
  const isReservedTag = Vue.config.isReservedTag;
  let loadingComponents = [];
  let maxUrlLength = 1800;
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
        if ( bbn.fn.substr(bbn.vue.localURL, -1) !== '/' ){
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
        let url = 'components/';
        let i = 0;
        while (items[i] && (url.length < maxUrlLength)) {
          if (i) {
            url += '/';
          }

          url += items[i].name;
          i++;
        }
        url += '?v=' + bbn.version;
        let prom = axios.get(url, {responseType:'json'}).then(d => {
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
        });

        if (i < (items.length -1)) {
          items.splice(0, i);
          bbn.vue.executeQueueItems(items);
        }

        return prom;
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
        bbn.fn.each(todo, cp => {
          if ( Vue.options.components['bbn-' + cp] === undefined ){
            Vue.component('bbn-' + cp, (resolve, reject) => {
              bbn.vue.queueComponentBBN(cp, resolve, reject);
            });
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
        url += 'components/?components=';
        let i = 0;
        while (todo[i] && (url.length < maxUrlLength)) {
          if (i) {
            url += ',';
          }

          url += todo[i].name;
          i++;
        }
        url += '&v=' + bbn.version;
        if ( bbn.env.isDev ){
          url += '&test=1';
        }
        if ( bbn.env.lang ){
          url += '&lang=' + bbn.env.lang;
        }
        let prom = bbn.fn.ajax(url, 'text')
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
        if (i < (todo.length -1)) {
          todo.splice(0, i);
          bbn.vue.executeQueueBBNItem(todo);
        }

        return prom;
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
    },


    /**
     * @method queueComponentBBNNoCDN
     * @memberof bbn.vue
     * @param {String} name 
     * @param {Function} resolve
     * @param {Function} reject
     */
    queueComponentBBNNoCDN(name, resolve, reject) {
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
      if ( bbn.fn.substr(prefix, -1) !== '-' ){
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

        if (vm.$vnode && vm.$vnode.componentOptions && (vm.$vnode.componentOptions.tag === 'bbn-portal')) {
          return false;
        }

        if ( vm.$vnode && vm.$vnode.componentOptions && (vm.$vnode.componentOptions.tag === selector)) {
          return true;
        }

        if (vm && (bbn.vue.getComponentName(vm) === selector)) {
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
          else if (a !== vm) {
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
              vm.$set(out, n, o);
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