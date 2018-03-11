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
      users: {
        type: Array,
        default(){
          return []
        }
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
    },
    data(){
      return {
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
        list: [
          {
            url: "dashboard",
            title: bbn._("Tableau de bord"),
            load: true,
            static: true,
            icon: 'fa fa-dashboard'
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

      openChat(){
        bbn.fn.log("openChat");
      },

      toggleMenu(){
        let menu = this.getRef('menu');
        if ( menu ){
          menu.toggle();
        }
      },
      popup(obj){
        if ( !obj ){
          return this.$refs.popup;
        }
        return this.$refs.popup.open.apply(this, arguments);
      },

      loadPopup(obj){
        return this.$refs.popup.load.apply(this, arguments);
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
        return bbn.fn.confirm.apply(bbn, arguments);
      },

      alert(){
        return bbn.fn.alert.apply(bbn, arguments);
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

      poll(timestamp){
        if ( !this.polling ){
          this.polling = true;
          let obj = {mode: 'json'},
              diff = bbn.fn.diffObj(this.observers, this.observersCopy);
          if ( timestamp ){
            obj.timestamp = timestamp;
          }
          obj.observers = this.observers;
          this.observersCopy = this.observers.slice();
          this.poller = bbn.fn.ajax(this.root + 'poller', 'json', obj, null, (r) => {
            bbn.fn.log("--------------OBS: Returning Data---------------");
            // put the data_from_file into #response
            if ( r.data ){
              for ( let d of r.data ){
                if ( d.observers ){
                  for ( let b of d.observers ){
                    let arr = bbn.fn.filterObj(this.observers, {id: b.id});
                    bbn.fn.log("LENGHTH: " + arr.length);
                    for ( let a of arr ){
                      if ( a.value !== b.result ){
                        this.$emit('bbnObs' + a.element + a.id, b.result);
                        this.$set(a, 'value', b.result);
                        bbn.fn.log("--------------Emitting: bbnObs" + a.element + a.id + ': ' + b.result + "---------------");
                      }
                      else{
                        bbn.fn.log("--------------Not Emitting: same value------------------");
                      }
                    }
                  }
                }
              }
              //appui.success("<div>ANSWER</div><code>" + JSON.stringify(r.data) + '</code>', 5);
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
        let root = this.root;
        bbn.vue.setComponentRule(root + 'components/', 'appui');
        bbn.vue.addComponent('popup/iconpicker', [{
          data(){
            return {
              root: root
            }
          }
        }]);
        bbn.vue.unsetComponentRule();

        bbn.vue.setDefaultComponentRule('components/', 'apst');
        bbn.vue.addComponent('widget/adh');
        bbn.vue.addComponent('widget/link');
        bbn.vue.addComponent('widget/lieu');
        bbn.vue.addComponent('widget/tier');
        bbn.vue.addComponent('widget/bug');
        bbn.vue.addComponent('widget/cgar');
        bbn.vue.addComponent('widget/doc');
        bbn.vue.addComponent('widget/dossiers');
        bbn.vue.addComponent('widget/modifs');
        bbn.vue.addComponent('widget/msg');
        bbn.vue.addComponent('widget/note');
        bbn.vue.addComponent('widget/personal');
        bbn.vue.addComponent('widget/pdt');
        bbn.vue.addComponent('widget/stats');
        bbn.vue.addComponent('widget/svn');
        bbn.vue.addComponent('widget/user');
        bbn.vue.addComponent('widget/cotis-valid');
        bbn.vue.addComponent('widget/news');
        bbn.vue.addComponent('map');
        bbn.vue.addComponent('lieux_fusion');
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
            }, 10000)
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
          }, 1000)
        }
      },
      observers: {
        deep: true,
        handler(){
          this.polling = false;
        }
      }
    }
  });

})(jQuery, bbn);
