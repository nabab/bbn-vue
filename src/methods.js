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

    /**
     * @method executeQueueItem
     * @memberof bbn.vue
     * @param {Object} item
     */
    executeQueueItem(item){
      if (item.url) {
        return axios.get(item.url, {responseType:'json'}).then((r) => {
          r = r.data;
          if ( this._realDefineComponent(a.name, r, item.mixins) ){
            item.resolve('ok4');
            return;
          }
          item.reject();
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
      }
      return bbn.fn.ajax(bbn.vue.libURL + 'dist/js/components/' + name + '.js', 'text').then(d => {
        if (d && d.data) {
          eval(d.data);
          if (Vue.options.components['bbn-' + name]) {
            resolve();
          }
        }
        return true;
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