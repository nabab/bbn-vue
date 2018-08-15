/**
 * Created by BBN on 15/02/2017.
 */

(function($, bbn){
  "use strict";

  let app;
  /**
   * Classic input with normalized appearance
   */

  Vue.component('bbn-appui', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.localStorageComponent, bbn.vue.observerComponent],
    props: {
      root: {
        type: String,
        required: true
      },
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
        type: Array
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
      logoPath: {
        type: String,
        default: 'https://bbn.solutions/logo.png'
      },
      leftShortcuts: {
        type: Array,
        default(){
          return []
        }
      },
      rightShortcuts: {
        type: Array,
        default(){
          return []
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
      list: {
        type: Array,
        default(){
          return [{
            url: "core/home",
            title: bbn._("Dashboard"),
            load: true,
            static: true,
            icon: 'fas fa-tachometer-alt'
          }];
        }
      }
    },
    data(){
      return {
        pollerObject: {
          chat: true,
          lastChat: 0,
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
        search: "",
        searchPlaceholder: "Rechercher par ID, nom, marque, adresse, contact, email, etc...",
        width: 0,
        height: 0,
        popups: [],
        vlist: [],
        polling: false,
        pollingTimeout: 0,
        prePollingTimeout: 0,
        pollingErrors: 0,
        widgets: {},
        notifications: [],
        menuOpened: false,
        themes: [
          {
            "value": "uniform",
            "text": "Uniform"
          }, {
            "value": "black",
            "text": "Black"
          }, {
            "value": "blueopal",
            "text": "Blue Opal"
          }, {
            "value": "default",
            "text": "Default"
          }, {
            "value": "flat",
            "text": "Flat"
          }, {
            "value": "highcontrast",
            "text": "High Contrast"
          }, {
            "value": "material",
            "text": "Material"
          }, {
            "value": "materialblack",
            "text": "Material Black"
          }, {
            "value": "metro",
            "text": "Metro"
          }, {
            "value": "metroblack",
            "text": "Metro Black"
          }, {
            "value": "moonlight",
            "text": "Moonlight"
          }, {
            "value": "nova",
            "text": "Nova"
          }, {
            "value": "silver",
            "text": "Silver"
          }
        ],
        poller: false,
        isMounted: false,
        debug: false,
        isOverDebug: false,
        fisheyeMounted: false,
        menuMounted: false,
        app: false,
        cool: false
      }
    },
    methods: {

      sendChatMessage(obj, idx){
        if ( this.$refs.chat.currentWindows[idx] ){
          this.pollerObject.message = {
            text: obj.message,
            id_chat: obj.chatId || null,
            users: obj.users
          };
          /*
          bbn.fn.post('chat/actions/message', obj, (d) => {
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

      get_field: bbn.fn.get_field,

      toggleMenu(){
        let menu = this.getRef('menu');
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
        return bbn.fn.get_field(this.users, "value", ($.type(d) === 'object') && d.id ? d.id : d, "text");
      },

      userGroup(d){
        return bbn.fn.get_field(this.users, "value", ($.type(d) === 'object') && d.id ? d.id : d, "id_group");
      },

      notify(obj, type, timeout){
        return this.$refs.notification.show(obj, type, timeout);
      },

      error(obj, timeout){
        return this.$refs.notification.error(obj, timeout);
      },

      warning(obj, timeout){
        return this.$refs.notification.warning(obj, timeout);
      },

      success(obj, timeout){
        return this.$refs.notification.success(obj, timeout);
      },

      info(obj, timeout){
        return this.$refs.notification.info(obj, timeout);
      },

      confirm(){
        let p = appui.popup();
        return p.confirm.apply(p, arguments);
      },

      alert(){
        let p = appui.popup();
        return p.alert.apply(p, arguments);
      },

      focusSearch(){
        let $ele = $(this.$refs.search.$refs.element),
            $parent = $(this.$refs.search.$el).closest("div.bbn-block"),
            w = $parent.width() + $parent.next().width() - 40;
        $ele
          .attr("placeholder", this.searchPlaceholder)
          .animate({
            width: w
          });
      },

      blurSearch(e){
        let $ele = $(this.$refs.search.$refs.element);
        if ( parseInt($ele.css("maxWidth")) !== 30 ){
          $ele.animate({
            width: 30
          }, function (){
            $ele.val("").attr("placeholder", "?");
          })
        }
      },

      tplSearch(d){
        let maxW = $(this.$refs.search.$el).width();
        return '<div class="bbn-hpadded bbn-nl ' +
          this.app.get_adherent_class(d.statut, d.statut_prospect ? d.statut_prospect : '') +
          '"><div class="bbn-block-left"><h3>' + d.nom + ' <em>' +
          ( d.immatriculation ? d.immatriculation : d.statut ) +
          ' ID: ' + d.id + '</em></h3></div><div class="bbn-block-right bbn-h-100 bbn-r" style="display: table"><span style="display: table-cell; vertical-align: middle">' +
          d.match + '</span></div></div>';
      },

      selectSearch(id, event){
        let $ele = $(this.$refs.search.$el);
        if ( id ){
          this.$refs.search.widget.close();
          $(this.$refs.search.$el).val("").attr("placeholder", "?").focus();
          bbn.fn.link("adherent/fiche/" + id + "/infos");
          this.search = "";
          $ele.trigger("blur");
        }
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
            return bbn.fn.get_field(bbn.users, "value", d, "text");
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
            return bbn.fn.get_field(bbn.usergroups, "value", id, "text");
          }
          return bbn.lng.unknown + " (" + d + ")";
        }
        return bbn.lng.unknown;
      },
      */

      poll(){
        if ( !this.polling ){
          this.polling = true;
          this.observersCopy = this.observers.slice();
          this.poller = bbn.fn.ajax(this.root + 'poller', 'json', $.extend({observers: this.observers}, this.pollerObject), null, (r) => {
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
            if ( r.chat && this.getRef('chat') ){
              if ( r.chat.hash ){
                this.pollerObject.usersHash = r.chat.hash;
              }
              this.getRef('chat').receive(r.chat);
              if ( r.chat.chats ){
                this.pollerObject.lastChat = r.chat.last;
              }
            }

            // call the function again, this time with the timestamp we just got from server.php
            this.polling = false;
            this.poller = false;
          }, () => {
            this.polling = false;
            this.poller = false;
          });
        }
      }
    },
    computed: {
      appComponent(){
        return $.extend({
          render(createElement){
            return createElement();
          }
        }, this.cfg)
      }
    },
    created(){
      if ( window.appui ){
        throw new Error("Impossible to have 2 bbn-appui components on a same page. bbn-appui is meant to hold a whole web app");
      }
      else{
        this.cool = true;
        this.componentClass.push('bbn-observer');
        window.appui = this;
        bbn.fn.each(this.plugins, (p, i) => {

        })
      }
    },
    mounted(){
      if ( this.cool ){
        this.app = this.$refs.app;
        this.ready = true;
        this.$emit('resize');
        setTimeout(() => {
          $(this.$el).animate({opacity: 1}, 'slow', () => {
            this.$emit('resize');
            setTimeout(() => {
              this.poll();
            }, 2000)
          })
        }, 2000);
      }
    },
    watch: {
      polling(newVal){
        if ( !newVal && this.cool ){
          clearTimeout(this.prePollingTimeout);
          this.prePollingTimeout = setTimeout(() => {
            clearTimeout(this.pollingTimeout);
            if ( this.poller && bbn.fn.isFunction(this.poller.abort) ){
              this.poller.abort();
            }
            this.poll();
            // Restart the polling every 5 minutes so we can destroy all inactive tokens
            this.pollingTimeout = setTimeout(() => {
              this.polling = false;
            }, 300000);
          }, 100)
        }
      },
      chatVisible(newVal){
        if ( !newVal ){
          this.chatWindows.splice(0, this.chatWindows.length);
        }
        this.polling = false;
      },
      chatOnline(newVal){
        this.pollerObject.chat = newVal;
      },
      usersOnlineHash(newVal){
        this.pollerObject.usersHash = newVal;
      },
      observers: {
        deep: true,
        handler(){
          this.polling = false;
        }
      },
      'pollerObject.message'(newVal){
        if ( newVal ){
          this.polling = false;
        }
      }
    }
  });

})(window.jQuery, window.bbn);
