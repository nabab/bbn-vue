((bbn) => {
  "use strict";
  const
    isReservedTag = Vue.config.isReservedTag;
  bbn.fn.autoExtend("vue", {
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
      if ( !this.components[cpName] ){
        throw new Error("Impossible to find the component " + cpName);
      }
      if ( typeof defaults !== 'object' ){
        throw new Error("The default object sent is not an object " + cpName);
      }
      this.components[cpName].defaults = $.extend(true, defaults, this.components[cpName].defaults);
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
      return $.extend(obj, r);
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

    queueComponent(name, url, mixins, resolve, reject){
      clearTimeout(this.queueTimer);
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
        $.each(todo, (i, a) => {
          this.executeQueueItem(a);
        });
        */
      }, this.loadDelay)
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
        return bbn.fn.post(url, (d) => {
          if ( d && d.success && d.components ){
            bbn.fn.iterate(items, (a, n) => {
              if ( d.components[n] && this._realDefineComponent(a.name, d.components[n], a.mixins) ){
                a.resolve('ok');
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
        return bbn.fn.post(a.url, (r) => {
          if ( this._realDefineComponent(a.name, r, a.mixins) ){
            a.resolve('ok');
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
          this.queueComponentBBN(a);
        })
      }
    },

    /** Adds an array of components, calling them all at the same time, in a single script */
    executeQueueBBNItem(todo){
      let url = bbn_root_url + bbn_root_dir + 'components/?components=' + $.map(todo, (a) => {
        return a.name;
      }).join(',');
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
                  if ( $.isArray(arr) ){
                    $.each(arr, (i, r) => {
                      let resolved = false;
                      if ( (typeof(r) === 'object') && r.script && r.name ){
                        let idx = bbn.fn.search(todo, {name: r.name});
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
                          if ( (a.resolve !== undefined) && (Vue.options.components['bbn-' + a.name] !== undefined) ){
                            a.resolve('ok');
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
                // executed script has an error
                () => {
                  bbn.fn.log("ERROR in the executed script from the server");
                  throw new Error("Problem in the executed script from the server from " + url)
                }
              )

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
        )
    },

    queueComponentBBN(name, resolve, reject){
      if ( bbn.fn.search(this.queueBBN, {name: name}) === -1 ){
        clearTimeout(this.queueTimerBBN);
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
      return this.queueTimerBBN;
    },

    announceComponent(name, url, mixins){
      if ( !this.isNodeJS && (typeof(name) === 'string') && (Vue.options.components[name] === undefined) ){
        Vue.component(name, (resolve, reject) => {
          return this.queueComponent(name, url, mixins, resolve, reject);
        });
      }
    },

    defineComponents(){
      if ( !this.loadedComponents.length && !this.isNodeJS ){
        for ( let a in this.components ){
          this.loadedComponents.push('bbn-' + a);
          /** @var string bbn_root_url */
          /** @var string bbn_root_dir */
          Vue.component('bbn-' + a, (resolve, reject) => {
            this.queueComponentBBN(a, resolve, reject);
          });
        }
      }
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
      $.each(vm.$children, (i, obj) => {
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
      if ( tag && !res && (this.parsedTags.indexOf(tag) === -1) ){
        this.parsedTags.push(tag);
        let idx = -1;
        // Looking for a corresponding prefix rule
        for (let i = 0; i < this.knownPrefixes.length; i++){
          if (
            this.knownPrefixes[i].prefix &&
            (typeof this.knownPrefixes[i].handler === 'function') &&
            (tag.indexOf(this.knownPrefixes[i].prefix) === 0)
          ) {
            // Taking the longest (most precise) prefix's rule
            if ( idx > -1 ){
              if ( this.knownPrefixes[i].prefix.length > this.knownPrefixes[idx].prefix.length ){
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
          /*
          let mixins = [];
          bbn.fn.each(this.knownPrefixes, (o) => {
            if ( tag.indexOf(o.prefix) === 0 ){
              if ( o.mixins ){
                if ( !bbn.fn.isArray(o.mixins) ){
                  mixins.push(o.mixins)
                }
                else{
                  bbn.fn.each(o.mixins, (m) => {
                    mixins.push(m);
                  })
                }
              }
            }
          })
          */
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
  })
})(window.bbn);