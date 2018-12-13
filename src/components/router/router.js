/**
 * Created by BBN on 15/02/2017.
 */
(function($, bbn, Vue){
  "use strict";

  /**
   * @component
   * @param {string} url - The URL on which the tabNav will be initialized.
   * @param {boolean} autoload - Defines if the tab will be automatically loaded based on URLs. False by default
   * except if it is true for the parent.
   * @param {string} orientation - The position of the views' titles: top (default) or bottom.
   * @param {string} root - The root URL of the tabNav, will be only taken into account for the top parents'
   * tabNav, will be automatically calculated for the children.
   * @param {boolean} scrollable - Sets if the views' titles will be scrollable in case they have a greater width
   * than the page (true), or if they will be shown multilines (false, default).
   * @param {array} source - The views shown at init.
   * @param {string} currentURL - The URL to which the tabnav currently corresponds (its selected tab).
   * @param {string} baseURL - The parent TabNav's URL (if any) on top of which the tabNav has been built.
   * @param {array} parents - The views shown at init.
   * @param {array} views - The views configuration and state.
   * @param {boolean} parentTab - If the tabNav has a tabNav parent, the tab Vue object in which it stands, false
   * otherwise.
   * @param {boolean|number} selected - The index of the currently selected tab, and false otherwise.
   */
  Vue.component("bbn-router", {
    mixins: [bbn.vue.basicComponent],
    props: {
      url: {
        type: String,
        default: ''
      },
      autoload: {
        type: Boolean,
        default: true
      },
      root: {
        type: String,
        default: ''
      },
      source: {
        type: Array,
        default: function(){
          return [];
        }
      },
    },

    data(){
      let baseURL = this.root;
      while ( baseURL.substr(-1) === '/' ){
        baseURL = baseURL.substr(0, baseURL.length-1);
      }
      while ( baseURL.substr(0, 1) === '/' ){
        baseURL = baseURL.substr(1);
      }
      return {
        urls: {},
        currentURL: this.url || '',
        baseURL: baseURL ? baseURL + '/' : '',
        transition: false,
        transitionTimeout: 0,
        parents: [],
        views: [].concat(this.source),
        parent: null,
        router: null,
        visible: true,
        activeContainer: null
      };
    },

    computed: {
      fullBaseURL(){
        let vm = this,
            base = '',
            tmp;
        while ( tmp = vm.baseURL ){
          base = tmp + base;
          if ( !vm.parents.length ){
            break;
          }
          vm = vm.parents[0];
        }
        return base;
      },
      unsavedViews(){
        return $.map(this.views, (v) => {
          if ( v.isUnsaved ){
            return {
              idx: v.idx,
              url: v.url
            }
          }
          return null;
        });
      },
      isUnsaved(){
        return !!this.unsavedViews.length;
      }
    },

    methods: {
      get_route(url){
        if ( url ){
          let bits = url.split('/');
          while ( bits.length ){
            let st = bits.join('/');
            if ( this.urls[st] ){
              return st;
            }
            bits.pop();
          }
        }
        return false;
      },
      route(url){
        if ( url && (!this.activeContainer || (url !== this.currentURL)) ){
          // Checks weather the container is already there
          let st = this.get_route(url);
          alert(url + '-----' + this.fullBaseURL + '------' + st);
          // If it's not it is loaded
          if ( (!st && this.autoload) || this.urls[st].load ){
            this.load(url);
          }
          // Otherwise the container is activated ie made visible
          else{
            this.currentURL = url;
            this.activate(url, this.urls[st]);
          }
        }
      },
      updateView(container){
        // Looking for a subrouter in the activated container
        let subRouter = this.getSubRouter();
        if ( subRouter ){
          // If so routing also this container
          bbn.fn.log("UNPARSED: " + this.currentURL);
          bbn.fn.log("PARSED: " + subRouter.parseURL(this.currentURL));
          bbn.fn.log(container);
          bbn.fn.log("FROM UPDATEVIEW");
          bbn.fn.log(container.currentURL);
          this.updateURLS();
          subRouter.updateURLS();
          subRouter.route(container.currentURL);
        }
      },

      activate(url, container){
        let todo = false;
        if ( this.activeContainer !== container ){
          this.activeContainer = null;
          bbn.fn.each(this.$children, (cp) => {
            if ( cp !== container ){
              cp.hide();
            }
            else{
              cp.currentURL = url;
              this.activeContainer = cp;
            }
          });
          if ( this.activeContainer ){
            this.activeContainer.show();
          }
        }
        else if ( url !== this.activeContainer.currentURL ){
          this.activeContainer.currentURL = url;
        }
      },
      // Setting the URK when the bbn-container transitions enters
      enter(){
        let sub = this.getSubRouter();
        if ( !sub ){
          bbn.fn.setNavigationVars(this.getFullCurrentURL(), this.activeContainer.title);
        }
      },

      // Returns the baseURL property
      getBaseURL(){
        return this.baseURL;
      },

      getFullBaseURL(){
        return this.fullBaseURL;
      },

      // Returns the current URL from the root tabNav without the hostname (if it has a baseURL it will start after)
      getFullURL(idx, force){
        let url = this.getURL(idx, force);
        if ( url !== false ){
          return this.getFullBaseURL() + url;
        }
        return false;
      },

      getCurrentURL(){
        return this.activeContainer ? this.activeContainer.currentURL : false;
      },

      getFullCurrentURL(idx, force){
        let url = this.getCurrentURL();
        if ( url !== false ){
          return this.getFullBaseURL() + url;
        }
        return false;
      },

      // Returns the url relative to the current tabNav from the given url
      parseURL(fullURL){
        if ( fullURL === undefined ){
          return '';
        }
        if ( typeof(fullURL) !== 'string' ){
          fullURL = fullURL.toString();
        }
        if ( fullURL.indexOf(bbn.env.root) === 0 ){
          fullURL = fullURL.substr(bbn.env.root.length);
        }
        fullURL = bbn.fn.removeTrailingChars(fullURL, '/');
        if ( (this.fullBaseURL === (fullURL + '/'))  || (fullURL === '') ){
          return '';
        }
        if ( this.fullBaseURL && (fullURL.indexOf(this.fullBaseURL) === 0) ){
          fullURL = fullURL.substr(this.fullBaseURL.length);
        }
        return fullURL;
      },

      activateDefault(){
        let vm = this,
            idx = vm.getIndex('', true);
        if ( vm.isValidIndex(idx) ){
          //bbn.fn.log("ACTIVATE6", this.views[idx].current ? this.views[idx].current : this.views[idx].url);
          this.activate(this.views[idx].current ? this.views[idx].current : this.views[idx].url);
        }
      },

      activateIndex(idx){
        if ( this.isValidIndex(idx) ){
          //bbn.fn.log("ACTIVATE7", this.views[idx].current);
          this.activate(this.views[idx].current);
        }
      },

      getVue(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        if ( this.isValidIndex(idx) ){
          return this.getRef('container-' + idx);
        }
        return false;
      },

      getTab(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        if ( this.isValidIndex(idx) ){
          return this.getRef('tab-' + idx);
        }
        return false;
      },

      getContainer(idx){
        if ( idx === undefined ){
          idx = this.selected;
        }
        let c = this.getVue(idx);
        return c ? c.$el : false;
      },

      getSubRouter(){
        return this.activeContainer.find('bbn-router');
      },

      getRealVue(idx){
        let tabnav = this,
            sub = tabnav;
        if ( idx === undefined ){
          idx = this.selected;
        }
        while ( tabnav ){
          tabnav = sub.getSubRouter(idx);
          if ( tabnav ){
            sub = tabnav;
            idx = sub.selected;
          }
        }
        return sub.getVue(idx);
      },

      add(obj_orig, idx){
        let obj = $.extend({}, obj_orig),
            index;
        //obj must be an object with property url
        if (
          (typeof(obj) === 'object') &&
          obj.url &&
          ((idx === undefined) || this.isValidIndex(idx) || (idx === this.views.length))
        ){
          if ( !obj.current ){
            if ( bbn.env.path.indexOf(this.getFullBaseURL() + obj.url + '/') === 0 ){
              bbn.env.path.substr(this.getFullBaseURL().length);
            }
            else{
              obj.current = obj.url;
            }
          }
          else if ( (obj.current !== obj.url) && (obj.current.indexOf(obj.url + '/') !== 0) ){
            obj.current = obj.url;
          }
          index = this.search(obj.url);
          obj.isUnsaved = false;
          obj.events = {};
          if ( !obj.menu ){
            obj.menu = [];
          }
          if ( index !== false ){
            if ( idx === undefined ){
              idx = index;
            }
            obj.idx = idx;
            obj.selected = index === this.selected;
            // If the tab exists we remove it
            bbn.fn.iterate(this.views[index], (v, n) => {
              if ( obj[n] === undefined ){
                obj[n] = v;
              }
            })
            this.views.splice(index, 1);
          }
          else{
            obj.selected = false;
            obj.idx = idx === undefined ? this.views.length : idx;
          }
          if ( !obj.current ){
            obj.current = obj.url;
          }
          if ( obj.idx === this.views.length ){
            this.views.push(obj);
          }
          else{
            this.views.splice(idx, 0, obj);
          }
        }
      },

      search(url){
        let r = bbn.fn.search(this.$children, "url", url);
        if ( r === -1 ){
          bbn.fn.each(this.$children, (tab, index) => {
            if ( url.indexOf(tab.url + '/') === 0 ){
              r = index;
              return false;
            }
          });
        }
        return r > -1 ? r : false;
      },

      load(url, force){
        let finalURL = this.fullBaseURL + url;
        /*
        bbn.fn.log(idx, finalURL, url);
        if ( vm.isValidIndex(idx) ){
          if ( vm.views[idx].real ){
            finalURL = vm.views[idx].real;
          }
          if ( force ){
            return this.reload(idx)
          }
          else if ( vm.views[idx].load === false ){
            return;
          }
          else{
            vm.views[idx].loading = true;
          }
        }
        else{
          idx = this.views.length;
          this.views.push({url: url, title: bbn._('Loading'), load: true, loading: true, selected: true, current: url, error: false});
          //bbn.fn.log("ACTIVATE1", url);
        }
        vm.views[idx].state = 'loading';
        this.activate(url);
        */
        return bbn.fn.post(finalURL, {_bbn_baseURL: this.fullBaseURL}, (d) => {
          if ( d.url ){
            d.url = this.parseURL(d.url);
          }
          else{
            d.url = url;
          }
          d.current = url;
          if ( d.data ){
            d.source = d.data;
            delete d.data;
          }

          this.updateURLS();
          let tmp = this.get_route(d.url);
          let done = false;
          if ( tmp ){
            let idx = bbn.fn.search(this.views, {url: tmp});
            if ( idx > -1 ){
              let tmp2 = this.views.splice(idx, 1);
              let tmp3 = $.extend({}, tmp2[0], d, {load: false});
              bbn.fn.log("SPLICING", tmp3);
              this.views.splice(idx, 0, tmp3);
              done = true;
            }
            else{
              bbn.fn.each(this.$children, (a) => {
                if ( a.url === tmp ){

                }
              })
              bbn.fn.log("FAIL", this.views.length, tmp)
            }
          }
          if ( !done ){
            this.views.push(d);
          }
          this.$nextTick(() => {
            bbn.fn.log("OBJECT LOADED ON " + this.fullBaseURL + d.current);
            bbn.fn.log("FROM LOAD");
            this.route(d.current);
          });
          /*
          if ( d.url !== url ){
            let idx = this.search(url);
            if ( idx !== false ){
              this.views[idx].url = d.url;
            }
          }
          d.loaded = true;
          if ( d.load !== false ){
            d.load = null;
          }
          vm.views[idx].loading = false;
          vm.views[idx].state = 'loaded';
          if ( !d.content ){
            return;
          }
          /** @todo Why is it here? */
          /*
          idx = vm.search(d.url);
          let checkIdx = vm.search(url);
          if ( (idx !== checkIdx) && (idx === false) && (checkIdx !== false) ){
            idx = checkIdx;
            this.views[idx].url = d.url;
            //this.navigate(d.url);
            url = d.url;
          }
          d.menu = vm.views[idx] && vm.views[idx].menu ? vm.views[idx].menu : undefined;
          if ( d.data !== undefined ){
            d.source = $.extend({}, d.data);
            delete d.data;
          }
          d.current = url;
          bbn.fn.log("URL: " + url);
          if ( vm.isValidIndex(idx) ){
            vm.add(d, idx);
          }
          else{
            idx = vm.views.length;
            vm.add(d);
          }
          this.$forceUpdate();
          vm.$nextTick(() => {
            //bbn.fn.log("ADDING", d, vm.views[idx]);
            //bbn.fn.log("ACTIVATE2", d.current);
            this.$emit('tabLoaded', d.data, d.url, vm.views[idx]);
            vm.activate(d.current);
          });
          */
        }, (xhr, textStatus, errorThrown) => {
          bbn.fn.log(arguments);
          /*
          if ( this.isValidIndex(idx) ){
            this.views[idx].state = xhr.status;
            this.views[idx].error = errorThrown;
            this.views[idx].loading = false;
            this.views[idx].loaded = true;
            this.views[idx].menu = false;
            this.views[idx].title = bbn._('Error') + ' ' + xhr.status;
            if ( this.views[idx].load !== false ){
              this.views[idx].load = null;
            }
            this.navigate(url);
            this.activate(url);
          }
          */
          //bbn.fn.log(arguments)
        })
      },

      reload(idx){
        let subtabnav = this.getSubRouter(idx);
        if ( subtabnav && subtabnav.autoload ){
          let cfg = this.getConfig(subtabnav);
          if ( cfg && cfg.views ){
            this.views[idx].cfg = cfg;
          }
        }
        if ( this.views[idx].load !== false ){
          this.views[idx].load = true;
        }
        if ( this.views[idx].imessages ){
          this.views[idx].imessages.splice(0, this.views[idx].imessages.length);
        }
        this.$nextTick(() => {
          this.activateIndex(idx);
        })
      },

      getTitle(idx){
        let cp = this,
            res = '';
        if ( idx === undefined ){
          idx = this.selected;
        }
        if ( cp.views[idx] ){
          res += (cp.views[idx].title || bbn._('Untitled'));
          if ( cp.parentTab ){
            idx = cp.parentTab.idx;
            cp = cp.parentTab.tabNav;
            while ( cp ){
              res += ' < ' + (cp.views[idx].title || bbn._('Untitled'));
              if ( cp.parentTab ){
                idx = cp.parentTab.idx;
                cp = cp.parentTab.tabNav;
              }
              else{
                cp = false;
              }
            }
          }
          res += ' - ';
        }
        res += bbn.env.siteTitle || bbn._("Untitled site")
        return res;
      },

      navigate(){
        let idx = this.selected,
            sub = this.getSubRouter(idx);
        if ( sub && sub.isValidIndex(sub.selected) ){
          sub.navigate();
        }
        else if ( this.isValidIndex(idx) ){
          bbn.fn.setNavigationVars(this.getFullCurrentURL(idx), this.getTitle(idx), this.views[idx].source, false);
        }
      },

      updateURLS(){
        let o = {};
        if ( this.$children ){
          bbn.fn.each(this.$children, (cp) => {
            o[cp.url] = cp;
          })
        }
        this.urls = o;
      }

    },

    beforeMount(){
      bbn.fn.each(this.$slots.default, (a) => {
        if ( a.componentOptions ){
          bbn.fn.log("BEFORE MOUNT");
          this.views.push(a.componentOptions.propsData);

        }
      })
      bbn.fn.log("beforeMount", this.$slots.default)
    },

    mounted(){
      let cp = this;
      this.parents = this.ancesters('bbn-router');
      this.parent = this.parents.length ? this.parents[0] : false;
      this.router = this.parents.length ? this.parents[this.parents.length-1] : this;
      // If there is a parent router we automatically give the proper baseURL
      if ( this.parent ){
        this.baseURL = this.parent.activeContainer.url + '/';
      }
      let url;
      if ( this.parent ){
        url = this.parseURL(this.parent.getFullCurrentURL());
      }
      if ( !url ){
        url = this.url;
      }
      if ( !url ){
        url = this.parseURL(bbn.env.path);
      }
      if ( !url ){
        url = this.url || Object.keys(this.urls)[0] || '';
      }
      bbn.fn.log("ROUTER MOUNTED");
      bbn.fn.log("FROM MOUNTED");
      bbn.fn.log(this.fullBaseURL);
      bbn.fn.log(url, this.fullBaseURL.substr(this.router.baseURL.length) + url);
      this.updateURLS();
      this.router.route(this.fullBaseURL.substr(this.router.baseURL.length) + url);
      this.ready = true;
    },

    watch: {
      currentURL(newVal, oldVal){
        this.$emit('change', newVal);
        if ( this.transitionTimeout ){
          clearTimeout(this.transitionTimeout)
        }
        this.transition = true;
        this.transitionTimeout = setTimeout(() => {
          this.transition = false;
        }, 500)
      },
      url(newVal){
        bbn.fn.log(newVal);
        this.route(newVal);
      },
      isUnsaved(val){
        if ( this.parentTab &&
          this.parentTab.tabNav &&
          this.parentTab.tabNav.views &&
          this.parentTab.tabNav.views[this.parentTab.tabNav.selected]
        ){
          this.parentTab.tabNav.views[this.parentTab.tabNav.selected].isUnsaved = val;
        }
      }
    }
  });

})(jQuery, bbn, Vue);
