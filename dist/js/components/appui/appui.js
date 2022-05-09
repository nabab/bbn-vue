(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-background', {
      'bbn-overlay': scrollable,
      'bbn-w-100': !scrollable,
      'bbn-desktop': !isMobile
     }]"
     :style="{opacity: opacity}"
     @focusin="isFocused = true"
     @focusout="isFocused = false">
  <div v-if="!cool"
       class="bbn-middle bbn-xl"
       v-text="_('Appui is already defined') + '... :('">
  </div>
  <div :class="{
    'bbn-flex-height': scrollable,
    'bbn-w-100': !scrollable
  }" v-else-if="ready">
    <!-- HEADER -->
    <div v-if="header"
         class="bbn-w-100"
         style="overflow: visible">
      <div :class="['bbn-w-100', 'bbn-flex-width', 'bbn-unselectable', 'bbn-no-border', {
             'bbn-h-100': !isMobile,
             'bbn-spadded': isMobile
           }]">
        <!-- MENU BUTTON -->
        <div :class="{
               'bbn-block': !isMobile,
               'bbn-h-100': !isMobile,
               'bbn-appui-menu-button': !isMobile,
               'bbn-vmiddle': isMobile,
               'bbn-middle': !isMobile,
               'bbn-right-sspace': isMobile && searchIsActive
              }">
          <div tabindex="0"
               @keydown.enter="toggleMenu"
               @keydown.space="toggleMenu"
               @mousedown.prevent.stop="toggleMenu"
               class="bbn-c bbn-p bbn-padded">
            <i ref="icon" class="nf nf-fa-bars bbn-xxxl"> </i>
          </div>
        </div>
        <!-- LOGO -->
        <div v-if="!isMobile"
             class="bbn-block bbn-logo-container">
          <div class="bbn-100 bbn-vmiddle" style="justify-content: center;">
            <img v-if="!!logo"
                 :src="logo"
                 style="background-color: white;"
                 class="bbn-right-padded bbn-appui-logo">
          </div>
        </div>
        <!-- LOGO (MOBILE) -->
        <div class="bbn-flex-fill bbn-hspadded bbn-middle"
              v-else-if="!searchIsActive && !!logo && isMobile">
          <img :src="logo"
                style="background-color: white;"
                class="bbn-appui-logo">
        </div>
        <!-- FISHEYE (MOBILE) -->
        <bbn-fisheye v-if="plugins['appui-menu'] && isMobile && !searchIsActive"
                    class="bbn-appui-fisheye bbn-block bbn-large"
                    :removable="true"
                    @remove="removeShortcut"
                    ref="fisheye"
                    :source="shortcuts"
                    :fixed-left="leftShortcuts || []"
                    :mobile="true"
                    :z-index="6"/>
        <!-- SEARCHBAR -->
        <!-- CENTRAL PART -->
        <div v-if="!isMobile"
             class="bbn-splitter-top-center bbn-flex-fill">
          <!-- FISHEYE -->
          <bbn-fisheye v-if="plugins['appui-menu']"
                       style="z-index: 6"
                       v-show="!searchBar || ('?' !== searchBar.value)"
                       :class="{
                         'bbn-invisible': $refs.search && $refs.search.isFocused,
                         'bbn-100': true
                        }"
                       :removable="true"
                       @remove="removeShortcut"
                       ref="fisheye"
                       :source="shortcuts"
                       :fixed-left="leftShortcuts"/>
          <div v-else v-html="' '"/>
        </div>
        <!-- SEARCHBAR (MOBILE) -->
        <div class="bbn-appui-search bbn-vmiddle bbn-hpadded">
          <div class="bbn-block bbn-p"
               @click="searchOn = true"
               tabindex="0">
            <i ref="icon"
               class="nf nf-oct-search bbn-xxxl"> </i>
          </div>
          <div class="bbn-block bbn-right-lspace"> </div>
          <bbn-context tag="div"
                       class="bbn-block"
                       :source="userMenu">
            <bbn-initial font-size="2em" :user-name="app.user.name"/>
            <div style="position: absolute; bottom: -0.4em; right: -0.4em; border: #CCC 1px solid; width: 1.1em; height: 1.1e"
                 class="bbn-bg-white bbn-black bbn-middle">
              <i class="nf nf-fa-bars bbn-xs"/>
            </div>
          </bbn-context>

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
    <div :class="{
      'bbn-flex-fill': scrollable,
      'bbn-w-100': !scrollable
    }">
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
                  :url="!!nav ? undefined : url"
                  @beforeroute="onBeforeRoute"
                  @route="onRoute"
                  @change="$emit('change', $event)"
                  :breadcrumb="isMobile"
                  :scroll-content="scrollable"
                  :component="component"
                  :component-source="componentSource"
                  :component-url="componentUrl"
                  :url-navigation="urlNavigation">
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
        style="overflow: visible">
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
              class="bbn-right-space">
            <appui-task-tracker/>
          </div>
          <!-- CHAT -->
          <div v-if="plugins['appui-chat']"
               class="bbn-right-space">
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
               class="bbn-right-space">
            <appui-notification-tray ref="notificationsTray"/>
          </div>
          <!-- CLIPBOARD BUTTON -->
          <div v-if="plugins['appui-clipboard'] && clipboard"
              @click.stop.prevent="getRef('clipboard').toggle()"
              ref="clipboardButton"
              class="bbn-appui-clipboard-button bbn-right-space bbn-p bbn-rel">
            <i class="nf nf-fa-clipboard bbn-m"
               tabindex="-1"/>
            <input class="bbn-invisible bbn-overlay bbn-p"
                  @keydown.space.enter.prevent="getRef('clipboard').toggle()"
                  @drop.prevent.stop="getRef('clipboard').copy($event); getRef('clipboard').show()">
          </div>
          <!-- POWER/ENV ICON -->
          <bbn-context class="bbn-iblock bbn-right-space bbn-p bbn-rel"
                       :title="appMode"
                       tag="div"
                       :source="powerMenu">
            <i class="nf nf-fa-power_off bbn-m"
               tabindex="-1"
               :style="{color: powerColor}"/>
          </bbn-context>
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
                zIndex: 100,
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
                  @ready="menuMounted = true"
                  class="bbn-top-spadded bbn-no-border"/>
  </bbn-slider>
  <!-- POPUPS -->
  <bbn-popup v-if="!popup"
             :source="popups"
             ref="popup"
             :z-index="13"/>
  <!-- SEARCH -->
  <div v-if="searchOn && plugins['appui-search']"
       class="bbn-overlay bbn-secondary"
       style="z-index: 13; background-color: transparent !important;">
    <div v-if="searchOn && plugins['appui-search']"
        class="bbn-overlay bbn-secondary"
        style="opacity: 0.9"> </div>
    <bbn-big-search :source="plugins['appui-search'] + '/results'"
                    :placeholder="searchBar.placeholder"
                    :select-url="plugins['appui-search'] ? plugins['appui-search'] + '/select' : ''"
                    ref="search"
                    v-model="searchBar.value"
                    :suggest="true"
                    @ready="registerSearch"
                    :source-value="searchBar.sourceValue"
                    :source-text="searchBar.sourceText"
                    :min-length="searchBar.minLength"
                    @select="searchSelect"
                    @close="searchOn = false"
                    :limit="50"
                    :pageable="true"
                    class="bbn-no"/>
    <div class="bbn-top-right bbn-p bbn-spadded bbn-xxxl"
         @click.stop="searchOn = false">
      <i class="nf nf-fa-times"/>
    </div>
  </div>
  <!-- CLIPBOARD SLIDER -->
  <bbn-clipboard v-if="plugins['appui-clipboard'] && clipboard"
                 :storage="true"
                 ref="clipboard"
                 @copy="onCopy"
                 style="z-index: 13"/>

  <!-- NOTIFICATIONS -->
  <bbn-notification ref="notification"
                    :z-index="15"/>
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
  <component ref="app"
             :is="appComponent"/>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-appui');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/appui/appui.css');
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
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.localStorageComponent
     * @mixin bbn.vue.observerComponent
     * @mixin bbn.vue.browserNotificationComponent
     */
    mixins:
    [
      bbn.vue.basicComponent,
      bbn.vue.resizerComponent,
      bbn.vue.localStorageComponent,
      bbn.vue.observerComponent,
      bbn.vue.browserNotificationComponent
    ],
    props: {
      /**
       * @prop {String} ['bbn.env.path'] url
       */
      url: {
        type: String,
        default: bbn.env.path
      },
      popup: {
        type: Vue
      },
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {String} def
       */
      def: {
        type: String
      },
      /**
       * @prop {Boolean} [true] autoload
       */
      autoload: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Boolean} [false] disabled
       */
      disabled: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Object} [{}] options
       */
      options: {
        type: Object,
        default(){
          return {}
        }
      },
      /**
       * @prop {Array} [[]] menus
       */
      menus: {
        type: Array,
        default(){
          return []
        }
      },
      /**
       * @prop {String} currentMenu
       */
      currentMenu:{
        type: String
      },
      /**
       * @prop {Array} [[]] shortcuts
       */
      shortcuts: {
        type: Array,
        default(){
          return []
        }
      },
      /**
       * @prop {Object} [{}] plugins
       */
      plugins: {
        type: Object,
        default(){
          return {}
        }
      },
      /**
       * @prop {Object} [{'span'}] cfg
       */
      cfg: {
        type: Object,
        default(){
          return {
            tag: 'span'
          }
        }
      },
      /**
       * @prop {Array} [[]] source
       */
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
      /**
       * @prop {(Object|Boolean)} [{}] searchBar
       */
      searchBar: {
        type: [Object, Boolean],
        default(){
          return {}
        }
      },
      /**
       * @prop {Boolean} [false] single
       */
      single: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {String} ['bbn.env.siteTitle || bbn._("App-UI")'] title
       */
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
       * @prop {Boolean} [false] ignoreDirty
       */
      ignoreDirty: {
        type: Boolean,
        default: false
      },
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
        observerTimeout: false,
        colorEnvVisible: true,
        currentTitle: this.title,
        searchIsActive: false,
        bigMessage: false,
        hasBigMessage: false,
        searchOn: false,
        pressedKey: false,
        pressedTimeout: false
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
      },
      appMode(){
        if (this.mode === 'dev') {
          return bbn._("Application in development mode");
        }

        if (this.mode === 'prod') {
          return bbn._("Application in production mode");
        }

        if (this.mode === 'test') {
          return bbn._("Application in testing mode");
        }
      },
      powerMenu(){
        if (!this.plugins || !this.plugins['appui-core'] || !this.app || !this.app.user || (!this.app.user.isAdmin && !this.app.user.isDev)) {
          return [];
        }

        return [
          {
            action: () => {
              this.confirm(
                bbn._("Are you sure you want to delete the browser storage?"),
                () => {
                  window.localStorage.clear();
                  document.location.reload();
                }
              );
            },
            text: bbn._("Reload with a fresh view"),
            icon: 'nf nf-mdi-sync_alert'
          }, {
            text: bbn._("Increase version"),
            icon: 'nf nf-oct-versions',
            action: () => {
              bbn.fn.post(this.plugins['appui-core'] + '/service/increase').then(() => {
                document.location.reload();
              });
            }
          }
        ];
      },
      powerColor(){
        if (this.mode === 'dev') {
          return 'var(--purple)';
        }

        if (this.mode === 'prod') {
          return 'var(--green)';
        }

        if (this.mode === 'dev') {
          return 'var(--blue)';
        }

        return '';
      },
      userMenu() {
        return this.rightShortcuts;
      }
    },
    methods: {
      registerSearch() {
        this.getRef('search').registerFunction(this.getRef('router').searchForString);
      },
      onCopy(){
        let cpb = this.getRef('clipboardButton');
        //bbn.fn.log("AWATCH", cpb);
        if (cpb) {
          cpb.style.color = 'red';
          setTimeout(() => {
            cpb.style.color = null;
          }, 250);
        }
      },
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
            url += 'lib/' + plugin + '/mvc' + bbn.fn.substr(tab.url, this.plugins[plugin].length);
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
      onBeforeRoute(ev, path) {
        this.$emit('beforeroute', ev, path);
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
      unregister(name, ignore) {
        if (registeredComponents[name]) {
          delete registeredComponents[name];
        }
        else if (!ignore) {
          throw new Error(bbn._("The component") + ' ' + name + ' ' + bbn._("is not registered"));
        }
      },
      getRegistered(name, ignore) {
        if (registeredComponents[name]) {
          return registeredComponents[name];
        }
        if (name === undefined) {
          return registeredComponents;
        }

        if (!ignore) {
          throw new Error(bbn._("The component") + ' ' + name + ' ' + bbn._("cannot be found"));
        }
      },


      getField: bbn.fn.getField,

      toggleMenu(){
        let menu = this.getRef('slider');
        if ( menu ){
          menu.toggle();
        }
      },

      getPopup(){
        let popup = this.popup || this.getRef('popup');
        if (arguments.length) {
          return popup.open(...arguments);
        }

        return popup;
      },

      loadPopup(obj){
        return this.getPopup().load.apply(this, arguments);
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
        let p = appui.getPopup();
        return p.confirm.apply(p, arguments);
      },

      alert(){
        let p = appui.getPopup();
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
            this.post(this.plugins['appui-menu'] + '/shortcuts/insert', data, d => {
              if ( d.success ){
                this.shortcuts.push(data);
              }
            });
          }
        }
      },
      removeShortcut(data){
        if ( this.plugins['appui-menu'] && data.id ){
          this.post(this.plugins['appui-menu'] + '/shortcuts/delete', data, d => {
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
        if (this.pressedKey) {
          this.pressedKey = false;
        }
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
        else if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
          this.pressedKey = e.key;
        }
      },
      longPress(key) {
        bbn.fn.log('longPress', key);
        if (key === 'f') {
          this.searchOn = true;
        }
      },
      searchSelect() {
        this.$nextTick(() => {
          this.searchOn = false;
        })
      }
    },
    beforeCreate(){
      bbn.fn.defaultAjaxErrorFunction = (jqXHR, textStatus, errorThrown) => {
        /** @todo */
        appui.error({title: textStatus, content: errorThrown}, 4);
        return false;
      };
      bbn.fn.defaultPreLinkFunction = url => {
        let router = appui.getRef('router');
        if (router) {
          if (bbn.fn.isFunction(router.route) && !router.disabled) {
            router.route(url);
          }
          return false;
        }
        return true;
      };
      bbn.fn.defaultAlertFunction = ele => {
        /** @todo */
        let c = appui.getCurrentContainer();
        c.alert.apply(c, arguments);
      };

      bbn.fn.defaultStartLoadingFunction = (url, id, data) => {
        if ( window.appui && appui.status ){
          appui.loaders.unshift(bbn.env.loadersHistory[0]);
          let i = appui.loaders.length - 1;
          while ( (i > 0) && (appui.loaders.length > bbn.env.maxLoadersHistory) ){
            if (!appui.loaders[i].loading) {
              appui.loaders.splice(i, 1);
            }

            i--;
          }
        }
      };

      bbn.fn.defaultEndLoadingFunction = (url, timestamp, data, res) => {
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
      };
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

        document.addEventListener('keydown', this.keydown);
        document.addEventListener('keyup', () => {
          this.pressedKey = false;
        });

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
      pressedKey(v) {
        clearTimeout(this.pressedTimeout);
        if (v) {
          this.pressedTimeout = setTimeout(() => {
            this.longPress(v);
            this.pressedKey = false;
          }, 500)
        }
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
              placeholder: bbn._("Search anything..."),
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
              focus: e => {
                //bbn.fn.log("FOCUS");
                if ( !this.isExpanded ){
                  let pane = this.closest('bbn-pane'),
                      w = pane.$children[0].$el.clientWidth + pane.$children[1].$el.clientWidth - 40;
                  this.$refs.search.$refs.element.placeholder = this.cfg.placeholderFocused;
                  this.$set(this.style, 'width', w + 'px');
                  this.isExpanded = true;
                }
              },
              blur: e => {
                //bbn.fn.log("BLUR");
                if ( this.isExpanded ){
                  this.$set(this.style, 'width', this.source.style && this.source.style.width ? this.source.style.width : '30px');
                  this.isExpanded = false;
                  this.$refs.search.$refs.element.placeholder = this.cfg.placeholder;
                  this.search = '';
                }
              },
              change: id => {
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

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}