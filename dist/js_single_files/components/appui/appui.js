((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-background', 'bbn-overlay', {
      'bbn-desktop': !isMobile
     }]"
     :style="{opacity: opacity}"
     @focusin="isFocused = true"
     @focusout="isFocused = false"
>
  <div v-if="!cool"
       class="bbn-middle bbn-xl"
       v-text="_('Appui is already defined') + '... :('">
  </div>
  <div class="bbn-flex-height" v-else-if="ready">
    <!-- HEADER -->
    <div v-if="header"
         class="bbn-w-100"
         style="overflow: visible"
    >
      <div :class="['bbn-header', 'bbn-flex-width', 'bbn-unselectable', 'bbn-no-border', {
             'bbn-h-100': !isMobile,
             'bbn-spadded': isMobile
           }]"
      >
        <!-- MENU BUTTON -->
        <div :class="{
               'bbn-block': !isMobile,
               'bbn-h-100': !isMobile,
               'bbn-appui-menu-button': !isMobile,
               'bbn-vmiddle': isMobile,
               'bbn-right-sspace': isMobile && searchIsActive
              }"
        >
          <div tabindex="0"
               @keydown.enter="toggleMenu"
               @keydown.space="toggleMenu"
               @mousedown.prevent.stop="toggleMenu"
               class="bbn-centered bbn-p"
          >
            <i ref="icon" class="nf nf-fa-bars bbn-xxxl"> </i>
          </div>
        </div>
        <!-- FISHEYE (MOBILE) -->
        <bbn-fisheye v-if="plugins['appui-menu'] && isMobile && !searchIsActive"
                    class="bbn-appui-fisheye bbn-block bbn-large"
                    :removable="true"
                    @remove="removeShortcut"
                    ref="fisheye"
                    :source="shortcuts"
                    :fixed-left="leftShortcuts"
                    :fixed-right="rightShortcuts"
                    :mobile="true"
                    :z-index="3"/>
        <!-- SEARCHBAR -->
        <div v-if="!isMobile && !!searchBar"
             class="bbn-appui-search bbn-large bbn-abs bbn-h-100 bbn-vspadded bbn-vmiddle"
        >
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
                      style="z-index: 2"/>
        </div>
        <!-- CENTRAL PART -->
        <div v-if="!isMobile"
             class="bbn-splitter-top-center bbn-flex-fill"
        >
          <!-- FISHEYE -->
          <bbn-fisheye v-if="plugins['appui-menu']"
                       style="z-index: 3"
                       v-show="!searchBar || ('?' !== searchBar.value)"
                       :class="{
                         'bbn-invisible': $refs.search && $refs.search.isFocused,
                         'bbn-100': true
                        }"
                       :removable="true"
                       @remove="removeShortcut"
                       ref="fisheye"
                       :source="shortcuts"
                       :fixed-left="leftShortcuts"
                       :fixed-right="rightShortcuts"/>
          <div v-else v-html="' '"/>
        </div>
        <!-- LOGO (MOBILE) -->
        <div class="bbn-flex-fill bbn-hspadded bbn-middle"
              v-if="!searchIsActive && !!logo && isMobile"
        >
          <img :src="logo"
               class="bbn-appui-logo"
          >
        </div>
        <!-- SEARCHBAR (MOBILE) -->
        <div v-if="isMobile && !!searchBar"
             :class="['bbn-appui-search', 'bbn-vmiddle', 'bbn-large', {'bbn-flex-fill': searchIsActive}]">
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
                      max-width="100%"
                      class="bbn-no"
                      @focus="searchIsActive = true"
                      @blur="searchBarBlur"/>
        </div>
        <!-- LOGO -->
        <div v-if="!isMobile"
             class="bbn-block bbn-logo-container"
             style="max-width: 25%; min-height: 100%; width: 10em"
        >
          <div class="bbn-100 bbn-vmiddle" style="justify-content: flex-end;">
            <img v-if="!!logo"
                 :src="logo"
                 class="bbn-right-padded bbn-appui-logo"
            >
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
                  :disabled="disabled"
                  :single="single"
                  :autoload="autoload"
                  :def="def"
                  :post-base-url="!single"
                  ref="router"
                  :nav="nav"
                  :master="true"
                  :class="{'bbn-overlay': !nav}"
                  :url="!!nav ? undefined : url"
                  @route="onRoute"
                  @change="$emit('change', $event)"
                  :breadcrumb="isMobile"
                  :scrollable="isMobile"
                  :component="component"
                  :component-source="componentSource"
                  :component-url="componentUrl"
                  :url-navigation="urlNavigation"
      >
        <slot/>
      </bbn-router>
    </div>
    <!-- FOOTER -->
    <component v-if="footerComponent"
               ref="footer"
               class="appui-footer"
               :is="footerComponent"/>
    <!-- STATUS -->
    <div v-if="status"
        ref="foot"
        class="bbn-header bbn-bordered-top appui-statusbar"
        style="overflow: visible"
    >
      <div class="bbn-flex-width bbn-h-100">
        <!-- LOADBAR -->
        <div class="bbn-flex-fill">
          <bbn-loadbar class="bbn-h-100 bbn-right-space bbn-overlay"
                      ref="loading"
                      :source="loaders"/>
        </div>
        <div class="bbn-vmiddle">
          <!-- TASK TRACKER -->
          <div v-if="plugins['appui-task']"
              class="bbn-right-space"
          >
            <appui-task-tracker/>
          </div>
          <!-- CHAT -->
          <div v-if="plugins['appui-chat']"
               class="bbn-right-space"
          >
            <bbn-chat ref="chat"
                      :url="plugins['appui-chat']"
                      :user-id="app.user.id"
                      :users="app.getActiveUsers()"
                      :online-users="usersOnline"
                      :online="app.user.chat"
                      @messageToChannel="d => messageChannel('appui-chat', d)"
                      @hook:mounted="onChatMounted"
                      :groups="app.groups"/>
          </div>
          <!-- NOTIFICATIONS -->
          <div v-if="plugins['appui-notification'] && pollerObject['appui-notification']"
               class="bbn-right-space"
          >
            <appui-notification-tray ref="notificationsTray"/>
          </div>
          <!-- CLIPBOARD BUTTON -->
          <div v-if="plugins['appui-clipboard'] && clipboard"
              @click.stop.prevent="getRef('clipboard').toggle()"
              ref="clipboardButton"
              class="bbn-appui-clipboard-button bbn-right-space bbn-p bbn-rel"
          >
            <i class="nf nf-fa-clipboard bbn-m" tabindex="-1"></i>
            <input class="bbn-invisible bbn-overlay bbn-p"
                  @keydown.space.enter.prevent="getRef('clipboard').toggle()"
                  @drop.prevent.stop="getRef('clipboard').copy($event); getRef('clipboard').show()"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- TREEMENU -->
  <bbn-slider v-if="plugins['appui-menu']"
              orientation="left"
              ref="slider"
              :style="{
                width: isMobile && !isTablet ? '100%' : '35em',
                maxWidth: '100%'
              }"
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
                  @ready="menuMounted = true"/>
  </bbn-slider>
  <!-- CLIPBOARD SLIDER -->
  <bbn-clipboard v-if="plugins['appui-clipboard'] && clipboard"
                 :storage="true"
                 ref="clipboard"
                 :source="clipboardContent"
                 style="z-index: 13"/>

  <!-- POPUPS -->
  <bbn-popup :source="popups"
             ref="popup"
             :z-index="14"/>
  <!-- NOTIFICATIONS -->
  <bbn-notification ref="notification" :z-index="15"/>
  <!-- APP COMPONENT -->
  <div class="bbn-appui-big-message"
       v-if="bigMessage"
       :style="{opacity: hasBigMessage ? 0.5 : 0}">
    <div class="bbn-overlay bbn-middle">
      <div class="bbn-block"
           v-html="bigMessage"/>
    </div>
    <i class="bbn-top-right bbn-p nf nf-fa-times"
       @click="closeBigMessage"/>
  </div>
  <component ref="app" :is="appComponent"/>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-appui');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
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
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.localStorageComponent
     * @mixin bbn.vue.observerComponent
     * @mixin bbn.vue.browserNotificationComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.resizerComponent,
      bbn.vue.localStorageComponent,
      bbn.vue.observerComponent,
      bbn.vue.browserNotificationComponent
    ],
    props: {
      url: {
        type: String,
        default: bbn.env.path
      },
      def: {
        type: String
      },
      autoload: {
        type: Boolean,
        default: true
      },
      disabled: {
        type: Boolean,
        default: false
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
      },
      /**
       * If this is set, along with componentSource and componentUrl a single container with this component will be created.
       * @prop {(String|Object)} component
       */
      component: {
        type: [String, Object]
      },
      /**
       * The source for the component.
       * @prop {Object} componentSource
       */
      componentSource: {
        type: Object
      },
      /**
       * The property to get from the componentSource to use for setting the URL.
       * @prop {String} componentUrl
       */
      componentUrl: {
        type: String
      },
      /**
       * Will be passed to router in order to ignore the dirty parameter.
       * @prop {Boolean} ignoreDirty
       */
       ignoreDirty: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        isFocused: false,
        intervalBugChrome: null,
        mode: bbn.env.mode,
        opacity: 0,
        pollerObject: {
          token: bbn.env.token || null
        },
        /* For the server query (checking or not) */
        chatOnline: true,
        /* No chat component if chat is not visible */
        chatVisible: false,
        /* Chat dialog windows */
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
        root: bbn.vue.defaults.appui.root,
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
        currentTitle: this.title,
        searchIsActive: false,
        bigMessage: false,
        hasBigMessage: false
      }
    },
    computed: {
      appComponent(){
        return bbn.fn.extend({
          render(createElement){
            return createElement();
          }
        }, this.cfg)
      },
      footerComponent(){
        return (typeof this.footer !== 'undefined') && !!this.footer ? this.footer : false;
      }
    },
    methods: {
      setBigMessage(msg, timeout = 3000) {
        this.bigMessage = msg;
        setTimeout(() => {
          this.hasBigMessage = true;
          setTimeout(() => {
            this.closeBigMessage();
          }, timeout < 100 ? timeout*1000 : timeout);
        }, 50);

      },
      closeBigMessage(){
        this.hasBigMessage = false;
        setTimeout(() => {
          this.bigMessage = false;
        }, 250)
      },
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
              return false;
            }
          });
          let url = this.plugins['appui-project'] + '/router/' + bbn.env.appName + '/ide/editor/file/';
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
            text: bbn._('Dev tools'),
            icon: 'nf nf-fa-code',
            items: [
              {
                text: bbn._('Open in editor'),
                icon: 'nf nf-fa-edit',
                action(){
                  bbn.fn.link(url);
                }
              }, {
                text: bbn._('Log the container'),
                icon: 'nf nf-mdi-sign_text',
                action() {
                  let idx = router.search(tab.url);
                  //bbn.fn.log("Container with URL " + tab.url, router.urls[router.views[idx].url]);
                }
              }
            ]
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
        this.getRef('router').route(url, force)
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



      /**
       * Get messages from service worker
       * @param {Object} message
       */
      receive(message){
        //bbn.fn.log("RECEIVING", message, message.type);
        if (message.type !== undefined) {
          switch (message.type) {
            case 'message':
              if (!bbn.fn.numProperties(message.data)) {
                return;
              }
              if (message.data && message.data.disconnected) {
                //document.location.reload();
                bbn.fn.log('DISCONNECTED', message.data);
              }
              else if (message.data && message.data.data) {

              }
              if ( message.data && message.data.plugins && Object.keys(message.data.plugins).length ){
                bbn.fn.iterate(message.data.plugins, (d, i) => {
                  if ('serviceWorkers' in d) {
                    this.$set(this.pollerObject, i, bbn.fn.extend(true, this.pollerObject[i], d.serviceWorkers));
                    delete d.serviceWorkers;
                  }
                  this.$emit(i, message.type, d);
                });
              }
              break;
            case 'log':
              this.$emit('swlog', message.data);
              break;
            case 'messageFromChannel':
              bbn.fn.log('messageFromChannel', message);
              this.$emit(message.channel, message.type, message.data);
              break;
            case 'notificationClick':
              bbn.fn.log('notificationClick', message.data);
              this.browserNotificationClick(message.data);
          }
        }
      },
      poll(data){
        bbn.fn.info("POLL");
        if ( this.pollable && this.pollerPath ){
          if (!data) {
            data = {
              'appui-core': {
                observers: this.observers
              }
            };
          }
          if (this._postMessage(bbn.fn.extendOut({}, data, this.pollerObject))) {
            bbn.fn.info("ALL OK");
            this.observersCopy = bbn.fn.clone(this.observers);
          }
        }
      },
      onChatMounted(){
        this.pollerObject['appui-chat'].online = this.app && this.app.user && this.app.user.chat;
        if (this.ready) {
          this.poll();
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
        let router = this.getRef('router'),
            container = !!router ? router.searchContainer(bbn.env.path, true) : false;
        return container || this;
      },
      searchBarBlur(){
        setTimeout(() => {
          this.searchIsActive = false
        }, 500)
      },
      keydown(e) {
        if (e.ctrlKey && !e.shiftKey && !e.altKey) {
          // Arrows do history
          if ([37, 39].includes(e.keyCode)) {
            if (!bbn.env.focused
              || (!['input', 'textarea', 'select'].includes(bbn.env.focused.tagName.toLowerCase()))
            ) {
              e.preventDefault();
              e.stopPropagation();
              if (e.keyCode === 37) {
                history.back();
              }
              else {
                history.forward();
              }
            }
          }
          else if (!this.single
            && bbn.fn.isNumber(e.key)
            && (e.key !== '0')
          ) {
            e.preventDefault();
            e.stopPropagation();
            let idx = parseInt(e.key);
            idx--;
            this.getRef('router').activateIndex(idx);
          }
        }
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

          /* defaultPreLinkFunction(url) {
            if (this.autoload) {
              let router = appui.getRef('router');
              bbn.fn.log(url);
              if ( router && bbn.fn.isFunction(router.route) ){
                router.route(url);
              }
              return false;
            }

            return true;
          }, */

          defaultPreLinkFunction(url) {
            let router = appui.getRef('router');
            if (router) {
              if (bbn.fn.isFunction(router.route) && !router.disabled) {
                router.route(url);  
              }
              return false;
            } 
            return true;
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
            if (res && res.data && res.data.disconnected) {
              window.location.reload();
              return;
            }
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
          }
        }
      };
      /*
      if (this.root) {
        bbnDefaults.env = {root: this.root};
      }
      */
      bbn.fn.init(bbnDefaults, true);
    },
    created(){
      if ( window.appui ){
        throw new Error("Impossible to have 2 bbn-appui components on a same page. bbn-appui is meant to hold a whole web app");
      }
      else{
        window.appui = this;
        this.componentClass.push('bbn-resize-emitter', 'bbn-observer');
        this.cool = true;
        let preloaded = [
          'container',
          'router',
          'scrollbar',
          'scroll',
          'floater',
          'popup'
        ];

        if (!this.single) {
          preloaded.push(
            'pane',
            'splitter',
            'tabs',
            'context',
            'loadicon'
          );
        }

        if (this.header) {
          preloaded.push(
            'pane',
            'splitter',
            'search',
            'fisheye'
          );
        }

        if (this.plugins && this.plugins['appui-menu']) {
          preloaded.push(
            'slider',
            'tree',
            'treemenu',
            'menu',
            'input',
            'list',
            'dropdown',
            'checkbox',
            'button'
          );
        }

        if (this.plugins && this.plugins['appui-notification']) {
          preloaded.push(
            'notification'
          );
        }

        if (this.status) {
          preloaded.push(
            'splitter',
            'input',
            'loadbar',
            'checkbox',
            'button'
          );
          if (this.chat) {
            preloaded.push(
              'chat'
            );
          }
        }

        if (this.clipboard) {
          preloaded.push(
            'slider',
            'clipboard'
          );
        }
        bbn.vue.preloadBBN(preloaded);

        window.onkeydown = (e) => {
          this.keydown(e);
        };

        this.$on('messageToChannel', data => {
          this.messageChannel(this.primaryChannel, data);
        });

        // Emissions from poller
        //appui
        this.$on('appui', (type, data) => {
          switch (type) {
            case 'messageFromChannel':
              this.messageFromChannel(data);
          }
        })
        // appui-chat
        this.$on('appui-chat', (type, data) => {
          let chat = this.getRef('chat');
          switch (type) {
            case 'message':
              if (bbn.fn.isVue(chat) && bbn.fn.numProperties(data)) {
                chat.receive(data);
              }
              break;
            case 'messageFromChannel':
              if (bbn.fn.isVue(chat)) {
                chat.messageFromChannel(data);
              }
              break;
          }
        })
        // appui-core
        this.$on('appui-core', (type, data) => {
          if ((type === 'message') && data.observers) {
            bbn.fn.each(
              data.observers,
              obs => bbn.fn.each(
                bbn.fn.filter(
                  this.observers,
                  {id: obs.id}
                ),
                o => this.observerEmit(obs.result, o)
              )
            );
          }
        })
        // appui-notification
        this.$on('appui-notification', (type, data) => {
          if (this.plugins['appui-notification']) {
            if (type === 'message') {
              let tray = this.getRef('notificationTray')
              if (bbn.fn.isVue(tray) && bbn.fn.isFunction(tray.receive)) {
                tray.receive(data);
              }
              if ('browser' in data) {
                bbn.fn.each(data.browser, n => this.browserNotify(n.title, {
                  body: bbn.fn.html2text(n.content),
                  tag: n.id,
                  timestamp: n.browser,
                  requireInteraction: true
                }));
              }
            }
          }
        });
        // appui-cron
        this.$on('appui-cron', (type, data) => {
          if (type === 'message') {
            let cron = appui.getRegistered('appui-cron');
            if (bbn.fn.isVue(cron) && bbn.fn.isFunction(cron.receive)) {
              cron.receive(data);
            }
          }
        });

        // Set plugins pollerObject
        if (!this.pollerObject.token) {
          this.pollerObject.token = bbn.env.token;
        }
        if (this.plugins['appui-chat']){
          this.$set(this.pollerObject, 'appui-chat', {
            online: null,
            usersHash: false,
            chatsHash: false
          })
        }
        if (this.plugins['appui-notification']) {
          this.$set(this.pollerObject, 'appui-notification', {unreadHash: false});
        }
      }
    },
    mounted(){
      if ( this.cool ){
        if (this.$refs.app) {
          this.app = this.$refs.app;
        }
        this.intervalBugChrome = setInterval(() => {
          if (this.isFocused && this.$el.scrollLeft) {
            this.$el.scrollLeft = 0;
          }
        }, 1000)
        setTimeout(() => {
          this.ready = true;
          this.$emit('resize');
          this.opacity = 1;
          setTimeout(() => {
            this._postMessage({
              type: 'initCompleted'
            });
            this.registerChannel('appui', true);
            if (this.plugins['appui-chat']){
              this.registerChannel('appui-chat');
            }
            if (this.plugins['appui-notification']) {
              this.registerChannel('appui-notification');
              this.browserNotificationURL = this.plugins['appui-notification'];
              this.browserNotificationSW = true;
            }
            this.poll();
          }, 5000);
        }, 1000);
      }
    },
    beforeDestroy(){
      clearInterval(this.intervalBugChrome);
      this.$off('appui-chat');
      this.$off('appui-core');
      this.$off('appui-notification');
    },
    watch: {
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
                delete cfg.change;
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