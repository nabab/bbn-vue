((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="{
      'bbn-appui': true,
      'bbn-observer': true,
      'bbn-background': true,
      'bbn-overlay': true,
      'bbn-mobile': isMobile,
      'bbn-desktop': !isMobile
     }"
     :style="{opacity: opacity}">
  <div v-if="!cool"
       class="bbn-middle bbn-xl"
       v-text="_('Appui is already defined') + '... :('">
  </div>
  <div class="bbn-flex-height" v-else-if="ready">
    <!-- HEADER -->
    <div v-if="header"
         class="bbn-w-100"
         style="overflow: visible">
      <div :class="{
        'bbn-header': true,
        'bbn-flex-width': true,
        'bbn-unselectable': true,
        'bbn-no-border': true,
      }">
        <!-- MENU BUTTON -->
        <div class="bbn-block bbn-h-100 bbn-menu-button-container"
             style="width: 50px; margin-right: 90px">
          <div tabindex="0"
               @keydown.enter="toggleMenu"
               @keydown.space="toggleMenu"
               @mousedown.prevent.stop="toggleMenu"
               class="bbn-overlay bbn-centered bbn-p">
            <i ref="icon" class="nf nf-fa-bars bbn-xxxl"> </i>
          </div>
        </div>
        <!-- SEARCHBAR -->
        <div class="bbn-abs bbn-h-100 bbn-vspadded"
             style="left: 50px; right: 140px; top: auto">
          <bbn-search :source="searchBar.source"
                      :placeholder="searchBar.placeholderFocused"
                      ref="search"
                      @select="searchBar.select"
                      :component="searchBar.component"
                      v-model="searchBar.value"
                      :suggest="true"
                      :source-value="searchBar.sourceValue"
                      :source-text="searchBar.sourceText"
                      :min-length="searchBar.minLength"
                      class="bbn-no"
          >
          </bbn-search>
        </div>
<!-- CENTRAL PART -->
        <div class="bbn-h-100 bbn-splitter-top-center bbn-flex-fill ">
          <!-- FISHEYE -->
          <bbn-fisheye v-if="plugins['appui-menu']"
                       style="z-index: 3"
                       v-show="'?' !== searchBar.value"
                       :class="{
                         'bbn-invisible': $refs.search && $refs.search.isFocused,
                         'bbn-spadded': true
                        }"
                       :removable="true"
                       @remove="removeShortcut"
                       ref="fisheye"
                       :source="shortcuts"
                       :fixed-left="leftShortcuts"
                       :fixed-right="rightShortcuts">
          </bbn-fisheye>
          <div v-else>
          </div>
        </div>
        <!-- LOGO -->
        <div class="bbn-block bbn-logo-container" style="max-width: 25%; min-height: 100%; width: 10em">
          <div class="apst-logo bbn-100 bbn-r">
            <img :src="logo + '?t=2'" style="border: 0; max-height: 100%; max-width: 100%; width: auto;" class="bbn-right-space">
          </div>
        </div>
        <!-- DEBUGGER? -->
        <div v-if="debug"
             class="bbn-widget"
             :style="{
               position: 'absolute',
               top: '0px',
               right: '0px',
               width: isOverDebug ? 'auto' : '200px',
               height: isOverDebug ? 'auto' : '200px',
               minWidth: '200px',
               minHeight: '200px',
               maxWidth: '200px',
               maxHeight: 'px',
               overflow: isOverDebug ? 'auto' : 'hidden'
             }"
             @mouseenter="isOverDebug = true"
             @mouseleave="isOverDebug = false">
          <h2>Debug...</h2>
        </div>
      </div>
    </div>
    <!-- MAIN -->
    <div class="bbn-flex-fill">
      <!--bbn-split-tabs v-if="tabnav"
                      orientation="horizontal"
                      ref="tabnav"
                      :root="root"
                      :resizable="true"
                      :observer="true"
                      :source="source">
      </bbn-split-tabs-->
      <bbn-router :root="root"
                  :source="source"
                  :storage="!!nav"
                  :observer="true"
                  :menu="tabMenu"
                  :single="single"
                  :post-base-url="!single"
                  ref="nav"
                  :nav="nav"
                  :master="true"
                  :class="{'bbn-overlay': !nav}"
                  :url="!!nav ? undefined : url"
                  @route="onRoute"
                  @change="$emit('change', $event)"
      >
        <slot></slot>
      </bbn-router>
    </div>
    <!-- STATUS -->
    <div v-if="status"
              ref="foot"
              class="bbn-header bbn-bordered-top"
              style="overflow: visible">
      <div class="bbn-flex-width bbn-h-100">
        <!-- LOADBAR -->
        <div class="bbn-flex-fill bbn-h-100 bbn-right-space">
          <bbn-loadbar v-if="loaders" ref="loading" :source="loaders"></bbn-loadbar>
        </div>
        <!-- TASK TRACKER -->
        <div v-if="plugins['appui-task']"
            class="bbn-h-100 bbn-vmiddle bbn-right-space"
        >
          <appui-task-tracker></appui-task-tracker>
        </div>
        <!-- CHAT -->
        <div v-if="plugins['appui-chat']"
             :class="['bbn-h-100', 'bbn-vmiddle', {'bbn-right-space': getRef('chat') && getRef('chat').usersOnlineWithoutMe.length}]"
        >
          <bbn-chat ref="chat"
                    :url="plugins['appui-chat']"
                    :user-id="app.user.id"
                    :users="app.users"
                    :online-users="usersOnline"
                    :online="chatOnline"
                    @send="sendChatMessage"
                    :groups="app.groups"
          >
          </bbn-chat>
        </div>
        <!-- CLIPBOARD BUTTON -->
        <div v-if="plugins['appui-clipboard'] && clipboard"
             @click.stop="getRef('clipboard').toggle()"
             ref="clipboardButton"
             :class="['bbn-appui-clipboard-button bbn-h-100 bbn-vmiddle bbn-block bbn-c bbn-right-space bbn-p']">
          <i class="nf nf-fa-clipboard bbn-m" tabindex="-1"></i>
          <input class="bbn-invisible bbn-overlay bbn-p"
                 @click.stop="getRef('clipboard').toggle()"
                 @keydown.space.enter.prevent="getRef('clipboard').toggle()"
                 @drop.prevent.stop="getRef('clipboard').copy($event); getRef('clipboard').show()">
        </div>
      </div>
    </div>
  </div>
  <!-- TREEMENU -->
  <bbn-slider v-if="plugins['appui-menu']"
              orientation="left"
              ref="slider"
              style="width: 35em"
              @show="focusSearchMenu"
              close-button="top-right">
    <bbn-treemenu :source="plugins['appui-menu'] + '/data'"
                  v-if="$refs.slider && $refs.slider.hasBeenOpened"
                  ref="menu"
                  @select="$refs.slider.hide()"
                  :menus="menus"
                  :current="currentMenu"
                  :top="50"
                  :shortcuts="true"
                  @shortcut="addShortcut"
                  @ready="menuMounted = true">
    </bbn-treemenu>
  </bbn-slider>
  <!-- CLIPBOARD SLIDER -->
  <bbn-clipboard v-if="plugins['appui-clipboard'] && clipboard"
                 :storage="true"
                 ref="clipboard"
                 :source="clipboardContent"
                 style="z-index: 13">
  </bbn-clipboard>

  <!-- POPUPS -->
  <bbn-popup :source="popups"
             ref="popup"
             :z-index="14">
  </bbn-popup>
  <!-- NOTIFICATIONS -->
  <bbn-notification ref="notification" :z-index="15"></bbn-notification>
  <!-- APP COMPONENT -->
  <component ref="app" :is="appComponent"></component>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-appui');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('style');
css.innerHTML = `.bbn-appui {
  box-sizing: border-box;
  transition: opacity 2s;
}
.bbn-appui .bbn-appui-clipboard-button {
  transition: all 0.25s;
  background-color: transparent;
  color: inherit;
}
.bbn-appui .bbn-appui-clipboard-button:hover,
.bbn-appui .bbn-appui-clipboard-button:active,
.bbn-appui .bbn-appui-clipboard-button:focus-within {
  background-color: green;
  color: white;
}
.bbn-appui .bbn-appui-clipboard {
  min-width: 25em;
  max-width: 50vw;
}
.bbn-appui .bbn-appui-clipboard li {
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bbn-appui.bbn-mobile {
  zoom: 1.3;
}
`;
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file appui component
 * @description The autocomplete allows to select a single value from a list of items by proposeing suggestions based on the typed characters.
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @ignore
 * @created 10/02/2017.
 */
(function(bbn){
  "use strict";

  let app;
  let registeredComponents = {};
  Vue.component('bbn-appui', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.localStorageComponent, bbn.vue.observerComponent],
    props: {
      url: {
        type: String,
        default: bbn.env.path
      },
      options: {
        type: Object,
        default(){
          return {}
        }
      },
      menus: {
        type: Array,
        default(){
          return []
        }
      },
      currentMenu:{
        type: String
      },
      shortcuts: {
        type: Array,
        default(){
          return []
        }
      },
      plugins: {
        type: Object,
        default(){
          return {}
        }
      },
      cfg: {
        type: Object,
        default(){
          return {
            tag: 'span'
          }
        }
      },
      source: {
        type: Array,
        default(){
          return [/*{
            url: (this.plugins && this.plugins['appui-core'] ? this.plugins['appui-core'] : 'core') + '/home',
            title: bbn._("Dashboard"),
            load: true,
            static: true,
            icon: 'nf nf-fa-tachometer_alt'
          }*/];
        }
      },
      searchBar: {
        type: [Object, Boolean],
        default(){
          return {}
        }
      },
      single: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: bbn.env.siteTitle || bbn._('App-UI')
      }
    },
    data(){
      return {
        isMobile: bbn.fn.isMobile(),
        opacity: 0,
        pollerObject: {
          chat: true,
          message: null,
          usersHash: false
        },
        // For the server query (checking or not)
        chatOnline: true,
        // No chat component if chat is not visible
        chatVisible: false,
        // Chat dialog windows
        chatWindows: [],
        usersOnline: [],
        usersOnlineHash: false,
        width: 0,
        height: 0,
        popups: [],
        polling: false,
        pollingTimeout: 0,
        prePollingTimeout: 0,
        pollingErrors: 0,
        widgets: {},
        loaders: [],
        notifications: [],
        root: '',
        menuOpened: false,
        poller: false,
        debug: false,
        isOverDebug: false,
        menuMounted: false,
        app: false,
        cool: false,
        searchString: '',
        clipboardContent: [],
        observerTimeout: false,
        colorEnvVisible: true,
        currentTitle: this.title
      }
    },
    computed: {
      appComponent(){
        return bbn.fn.extend({
          render(createElement){
            return createElement();
          }
        }, this.cfg)
      }
    },
    methods: {
      focusSearchMenu(){
        let menu = this.getRef('menu');
        if (menu) {
          menu.focusSearch();
        }
      },
      tabMenu(tab, router) {
        let res = [];
        if (bbn.env.isDev) {
          let plugin;
          bbn.fn.iterate(this.plugins, (a, n) => {
            if (tab.url.indexOf(a+'/') === 0) {
              plugin = n;
              return;
            }
          });
          let url = this.plugins['appui-ide'] + '/editor/file/';
          if (plugin){
            url += 'lib/' + plugin + '/mvc' + tab.url.substr(this.plugins[plugin].length);
          }
          else {
            url += 'app/main/mvc/' + tab.url;
          }
          url += '/_end_/';
          if (tab.url.indexOf('test/') === 0) {
            url += 'private';
          }
          else {
            url += 'php';
          }
          res.push({
            text: bbn._('Open in editor'),
            icon: 'nf nf-fa-code',
            action(){
              bbn.fn.link(url);
            }
          });
          res.push({
            text: bbn._('Log the container'),
            icon: 'nf nf-mdi-sign_text',
            action() {
              let idx = router.search(tab.url);
              bbn.fn.log("Container with URL " + tab.url, router.urls[router.views[idx].url]);
            }
          });
        }
        return res;
      },
      addToClipboard(e){
        bbn.fn.getEventData(e).then((data) => {
          this.clipboardContent.push(data);
        });
        return true;

      },
      copy(e){
        if (this.clipboard) {
          let type = e.type;
          bbn.fn.getEventData(e).then((data) => {
            this.clipboardContent.push(data);
          });
        }
        return true;
      },
      onRoute(path) {
        this.$emit('route', path)
      },
      route(url, force){
        this.getRef('nav').route(url, force)
      },
      register(name, cp){
        if (cp) {
          registeredComponents[name] = cp;
        }
        else{
          throw new Error(bbn._("The component") + ' ' + name + ' ' + bbn._("does not exist"));
        }
      },
      unregister(name){
        if (registeredComponents[name]) {
          delete registeredComponents[name];
        }
        else{
          throw new Error(bbn._("The component") + ' ' + name + ' ' + bbn._("is not registered"));
        }
      },
      getRegistered(name){
        if (registeredComponents[name]) {
          return registeredComponents[name];
        }
        if (name === undefined) {
          return registeredComponents;
        }
        throw new Error(bbn._("The component") + ' ' + name + ' ' + bbn._("cannot be found"));
      },


      /*
      route(url, force){
        let router = this.find('bbn-router');
        if ( router ){
          router.route(url, force);
        }
      },
      */
      sendChatMessage(obj, idx){
        if ( this.$refs.chat.currentWindows[idx] ){
          this.pollerObject.message = {
            text: obj.message,
            id_chat: this.$refs.chat.currentWindows[idx].id || null,
            users: obj.users
          };
          this.poll();
          /*
          this.post('chat/actions/message', obj, (d) => {
            if ( d.success && d.id_chat ){
              if ( !obj.id ){
                let chat = this.getRef('chat');
                if ( chat ){
                  chat.$set(chat.currentWindows[idx], 'id_chat', d.id_chat)
                }
              }
            }
          })
          */
        }
      },

      getField: bbn.fn.getField,

      toggleMenu(){
        let menu = this.getRef('slider');
        if ( menu ){
          menu.toggle();
        }
      },

      popup(){
        let p = this.getPopup();
        if ( p ){
          if ( arguments.length ){
            return p.open.apply(this, arguments);
          }
          return p;
        }
      },

      loadPopup(obj){
        return this.popup().load.apply(this, arguments);
      },

      userName(d){
        return bbn.fn.getField(this.users, "text", "value", bbn.fn.isObject(d) && d.id ? d.id : d);
      },

      userGroup(d){
        return bbn.fn.getField(this.users, "id_group", "value", bbn.fn.isObject(d) && d.id ? d.id : d);
      },

      notify(obj, type, timeout){
        let notification = this.getRef('notification');
        if (notification) {
          return notification.show(obj, type, timeout);
        }
      },

      error(obj, timeout){
        return this.notify(obj, "error", timeout);
      },

      warning(obj, timeout){
        return this.notify(obj, "warning", timeout);
      },

      success(obj, timeout){
        return this.notify(obj, "success", timeout || 5);
      },

      info(obj, timeout){
        return this.notify(obj, "info", timeout || 30);
      },

      confirm(){
        let p = appui.popup();
        return p.confirm.apply(p, arguments);
      },

      alert(){
        let p = appui.popup();
        return p.alert.apply(p, arguments);
      },

      measure(){
        /*
        let w = $(this.$el).width(),
            h = $(this.$el).height();
        if ( w && h && ((w !== this.width) || (h !== this.height)) ){
          this.width = w;
          this.height = h;
          this.$emit("resize", {width: this.width, height: this.height});
        }
        */
      },

      /*
      userName(d, force){
        let type = (typeof(d)).toLowerCase();
        if ( type === 'object' ){
          if ( d.full_name ){
            return d.full_name;
          }
          if ( d.login ){
            return d.login;
          }
          return bbn.lng.unknown + (d.id ? " (" + d.id + ")" : "");
        }
        else {
          if ( bbn.users !== undefined ){
            return bbn.fn.getField(bbn.users, "text", "value", d);
          }
        }
        if ( force ){
          return bbn._('Unknown');
        }
        return false;
      },

      userGroup(d){
        let type = (typeof(d)).toLowerCase();
        if ( type === 'object' ){
          d = d.id_group;
          type = (typeof(d)).toLowerCase();
        }
        if ( (type === 'number') ){
          if ( bbn.usergroups !== undefined ){
            return bbn.fn.getField(bbn.usergroups, "text", "value", id);
          }
          return bbn.lng.unknown + " (" + d + ")";
        }
        return bbn.lng.unknown;
      },
      */



      receive(data){
        if ( !bbn.fn.numProperties(data) ){
          return;
        }
        //bbn.fn.log("RECEIVING", data);
        if (data.disconnected){
          document.location.reload();
        }
        else if ( data.chat && bbn.fn.numProperties(data.chat) && this.getRef('chat') ){
          //bbn.fn.log("THERE IS A CHAT SO I SEND IT TO THE CHAT");
          this.getRef('chat').receive(data.chat);
        }
        else if ( data.data ){
          bbn.fn.each(data.data, (d, i) => {
            if ( d.observers ){
              for ( let b of d.observers ){
                let arr = bbn.fn.filter(this.observers, {id: b.id});
                for ( let a of arr ){
                  if ( a.value !== b.result ){
                    //bbn.fn.log("EMITTING OBS", a);
                    this.observerEmit(b.result, a);
                    a.value = b.result;
                  }
                }
              }
            }
          });
        }
      },

      poll(){
        bbn.fn.info("POLL");
        if ( this.pollable && this.pollerPath ){
          if ( 'serviceWorker' in navigator ){
            if ( navigator.serviceWorker.controller ){
              if ( navigator.serviceWorker.controller.state === 'redundant' ){
                bbn.fn.info("SERVICE REDONDANT");
                /*
                if ( confirm(
                  bbn._("The application has been updated but you still use an old version.") + "\n" +
                  bbn._("You need to refresh the page to upgrade.") + "\n" +
                  bbn._("Do you want to do it now?")
                ) ){
                  document.location.reload();
                }
                */
              }
              else{
                bbn.fn.info("ALL OK");
                navigator.serviceWorker.controller.postMessage(bbn.fn.extendOut({
                  observers: this.observers
                }, this.pollerObject));
                this.observersCopy = this.observers.slice().map(o => bbn.fn.clone(o));
              }
            }
            else{
              bbn.fn.info("NO CONTROLLER FOR SW");
            }
          }
          else{
            bbn.fn.info("NO SW ???");
          }
        /*
          this.poller = bbn.fn.ajax(this.pollerPath, 'json', bbn.fn.extend({observers: this.observers}, this.pollerObject), 'poller', (r) => {
            this.pollerObject.message = null;
            //bbn.fn.log("--------------OBS: Returning Data---------------");
            // put the data_from_file into #response
            if ( r.data ){
              bbn.fn.each(r.data, (d, i) => {
                if ( d.observers ){
                  for ( let b of d.observers ){
                    let arr = bbn.fn.filter(this.observers, {id: b.id});
                    for ( let a of arr ){
                      if ( a.value !== b.result ){
                        this.$emit('bbnObs' + a.element + a.id, b.result);
                        a.value = b.result;
                      }
                    }
                  }
                }
              });
              //appui.success("<div>ANSWER</div><code>" + JSON.stringify(r.data) + '</code>', 5);
            }

            // call the function again, this time with the timestamp we just got from server.php
            this.polling = false;
            this.poller = false;
          }, () => {
            this.polling = false;
            this.poller = false;
          });
          */
        }
      },
      addShortcut(data){
        if ( this.plugins['appui-menu'] && data.id ){
          let idx = bbn.fn.search(this.shortcuts, {id: data.id});
          if ( idx === -1 ){
            this.post(this.plugins['appui-menu'] + '/shortcuts/insert', data, (d) => {
              if ( d.success ){
                this.shortcuts.push(data);
              }
            });
          }
        }
      },
      removeShortcut(data){
        if ( this.plugins['appui-menu'] && data.id ){
          this.post(this.plugins['appui-menu'] + '/shortcuts/delete', data, (d) => {
            if ( d.success ){
              let idx = bbn.fn.search(this.shortcuts, {id: data.id});
              if ( idx > -1 ){
                this.shortcuts.splice(idx, 1);
              }
            }
          });
        }
      },
      getCurrentContainer(){
        let container = this.find('bbn-router').searchContainer(bbn.env.path, true);
        return container || this;
      }
    },
    beforeCreate(){
      let bbnDefaults = {
        fn: {
          defaultAjaxErrorFunction(jqXHR, textStatus, errorThrown) {
            /** @todo */
            appui.error({title: textStatus, content: errorThrown}, 4);
            return false;
          },

          defaultPreLinkFunction(url) {
            let router = appui.getRef('nav');
            if ( router && bbn.fn.isFunction(router.route) ){
              router.route(url);
            }
            return false;
          },

          defaultAlertFunction(ele) {
            /** @todo */
            let c = appui.getCurrentContainer();
            c.alert.apply(c, arguments);
          },
          
          defaultStartLoadingFunction(url, id, data) {
            if ( window.appui && appui.status ){
              appui.loaders.unshift(bbn.env.loadersHistory[0]);
              let i = appui.loaders.length - 1;
              while ( (i > 0) && (appui.loaders.length > bbn.env.maxLoadersHistory) ){
                appui.loaders.splice(i, 1);
                i--;
              }
            }
          },
          
          defaultEndLoadingFunction(url, timestamp, data, res) {
            if ( window.appui && appui.status ){
              let history = bbn.fn.getRow(bbn.env.loadersHistory, {url: url, start: timestamp});
              let loader = bbn.fn.getRow(appui.loaders, {url: url, start: timestamp});
              if ( loader ){
                if (  history ){
                  bbn.fn.iterate(history, (val, prop) => {
                    if ( loader[prop] !== val ){
                      loader[prop] = val;
                    }
                  });
                }
                else{
                  loader.loading = false;
                }
              }
              //appui.$refs.loading.end(url, id, data, res);
            }
          },

          defaultResizeFunction(){
            if (window.appui) {
              appui.selfEmit(true);
            }
          }
        }
      };
      /*
      if (this.root) {
        bbnDefaults.env = {root: this.root};
      }
      */
      bbn.fn.init(bbnDefaults);
    },
    created(){
      if ( window.appui ){
        throw new Error("Impossible to have 2 bbn-appui components on a same page. bbn-appui is meant to hold a whole web app");
      }
      else{
        window.appui = this;
        this.componentClass.push('bbn-observer');
        this.cool = true;
        /*
        bbn.fn.each(this.plugins, (p, i) => {

        })
        */
      }
    },
    mounted(){
      if ( this.cool ){
        this.app = this.$refs.app;
        this.ready = true;
        setTimeout(() => {
          this.opacity = 1;
          this.$emit('resize');
          setTimeout(() => {
            this.poll();
          }, 1000);
        }, 1000);
      }
    },
    watch: {
      chatVisible(newVal){
        if ( !newVal ){
          this.chatWindows.splice(0, this.chatWindows.length);
        }
        this.polling = false;
      },
      chatOnline(newVal){
        this.pollerObject.chat = newVal;
        this.poll();
      },
      usersOnlineHash(newVal){
        this.pollerObject.usersHash = newVal;
        this.poll();
      },
      observers: {
        deep: true,
        handler(){
          if ( this.observerTimeout ){
            clearTimeout(this.observerTimeout);
          }
          this.observerTimeout = setTimeout(() => {
            this.poll();
          }, 1000);
        }
      },
      clipboardContent: {
        deep: true,
        handler(){
          let cpb = this.getRef('clipboardButton');
          //bbn.fn.log("AWATCH", cpb);
          if (cpb) {
            cpb.style.backgroundColor = 'red';
            setTimeout(() => {
              cpb.style.backgroundColor = null;
            }, 250);
          }
        }
      }
    },
    components: {
      searchBar: {
        name: 'search-bar',
        props: {
          source: {
            type: Object,
            default() {
              return {}
            }
          }
        },
        template: `
<bbn-autocomplete ref="search"
                  v-model="search"
                  :style="currentStyle"
                  v-bind="cfg"
                  v-on="eventsCfg"
></bbn-autocomplete>`,
        data(){
          return {
            search: '',
            style: this.source.style || {},
            isExpanded: false
          }
        },
        computed: {
          ui(){
            return this.closest('bbn-appui');
          },
          cfg(){
            if ( this.source && Object.keys(this.source).length ){
              let cfg = bbn.fn.extend(true, {}, this.source);
              if ( cfg.focus !== undefined ){
                delete cfg.focus;
              }
              if ( cfg.blur !== undefined ){
                delete cfg.blur;
              }
              if ( cfg.change !== undefined ){
                delete cfg.change;focus
              }
              if ( cfg.style !== undefined ){
                delete cfg.style;
              }
              return cfg;
            }
            return {
              delay: 500,
              sourceText: 'text',
              sourceValue: 'value',
              clearButton: false,
              suggest: true,
              source: [],
              placeholder: '?',
              placeholderFocused: bbn._("Search.."),
              icon: 'nf nf-fa-search',
              minLength: 1,
              height: bbn.env.height - 100,
              template(d){
                return `
                  <div class="bbn-hpadded bbn-nl">
                    <div class="bbn-block-left">
                      <h3>${d.text}</em></h3>
                    </div>
                    <div class="bbn-block-right bbn-h-100 bbn-r" style="display: table">
                      <span style="display: table-cell; vertical-align: middle">${d.value}</span>
                    </div>
                  </div>`;
              }
            };
          },
          eventsCfg(){
            let def = {
              focus: (e) => {
                //bbn.fn.log("FOCUS");
                if ( !this.isExpanded ){
                  let pane = this.closest('bbn-pane'),
                      w = pane.$children[0].$el.clientWidth + pane.$children[1].$el.clientWidth - 40;
                  this.$refs.search.$refs.element.placeholder = this.cfg.placeholderFocused;
                  this.$set(this.style, 'width', w + 'px');
                  this.isExpanded = true;
                }
              },
              blur: (e) => {
                //bbn.fn.log("BLUR");
                if ( this.isExpanded ){
                  this.$set(this.style, 'width', this.source.style && this.source.style.width ? this.source.style.width : '30px');
                  this.isExpanded = false;
                  this.$refs.search.$refs.element.placeholder = this.cfg.placeholder;
                  this.search = '';
                }
              },
              change: (id) => {
                if (id && !(id instanceof Event)) {
                  setTimeout(() => {
                    document.activeElement.blur();
                  }, 15);
                }
              }
            };
            return {
              focus: this.source.focus || def.focus,
              blur: this.source.blur || def.blur,
              change: this.source.change || def.change
            };
          },
          currentStyle(){
            return bbn.fn.extend({
              'z-index': 10,
              transition: 'width 400ms',
              width: '30px'
            }, (this.source.style || {}), this.style);
          }
        }
      }
    }
  });

})(window.bbn);

})(bbn);