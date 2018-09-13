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
   * @param {string} orientation - The position of the tabs' titles: top (default) or bottom.
   * @param {string} root - The root URL of the tabNav, will be only taken into account for the top parents'
   * tabNav, will be automatically calculated for the children.
   * @param {boolean} scrollable - Sets if the tabs' titles will be scrollable in case they have a greater width
   * than the page (true), or if they will be shown multilines (false, default).
   * @param {array} source - The tabs shown at init.
   * @param {string} currentURL - The URL to which the tabnav currently corresponds (its selected tab).
   * @param {string} baseURL - The parent TabNav's URL (if any) on top of which the tabNav has been built.
   * @param {array} parents - The tabs shown at init.
   * @param {array} tabs - The tabs configuration and state.
   * @param {boolean} parentTab - If the tabNav has a tabNav parent, the tab Vue object in which it stands, false
   * otherwise.
   * @param {boolean|number} selected - The index of the currently selected tab, and false otherwise.
   */
  Vue.component("bbn-container", {
    name: 'bbn-container',
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    beforeCreate(){
      bbn.fn.log("beforeCreate", this);
    },
    props: {
      title: {
        type: [String, Number],
        default: bbn._("Untitled")
      },
      componentAttributes: {
        type: Object,
        default(){
          return {}
        }
      },
      idx: {},
      scrollable: {
        type: Boolean,
        default: true
      },
      component: {},
      icon: {
        type: [String, Boolean],
      },
      notext: {
        type: Boolean,
        default: false
      },
      content: {
        type: String,
        default: ""
      },
      menu: {
        type: Array
      },
      loaded: {
        type: Boolean
      },
      fcolor: {
        type: String
      },
      bcolor: {
        type: String
      },
      load: {
        type: Boolean,
        default: false
      },
      selected: {
        type: [Boolean, Number],
        default: false
      },
      css: {
        type: String,
        default: ""
      },
      source: {
        type: [Array, Object],
        default: function(){
          return {};
        }
      },
      advert: {
        type: [String, Vue]
      },
      help: {
        type: String
      },
      imessages: {
        type: Array,
        default(){
          return []
        }
      },
      script: {},
      static: {
        type: [Boolean, Number],
        default: false
      },
      pinned: {
        type: [Boolean, Number],
        default: false
      },
      url: {
        type: [String, Number]
      },
      current: {
        type: [String, Number]
      },
      real: {
        type: String
      },
      cfg: {
        type: Object
      },
      events: {
        type: Object,
        default(){
          return {}
        }
      },
    },

    data(){
      return {
        tabNav: null,
        isComponent: null,
        fullScreen: false,
        name: bbn.fn.randomString(20, 15).toLowerCase(),
        popups: []
      };
    },

    methods: {
      setCurrent(url){
        const vm = this;
        if ( url.indexOf(vm.url) === 0 ){
          vm.tabNav.activate(url);
        }
      },
      setTitle(title){
        if ( this.tabNav ){
          this.tabNav.tabs[this.idx].title = title;
        }
      },
      setColor(bcolor, fcolor){
        if ( this.tabNav ){
          if ( bcolor ){
            this.tabNav.tabs[this.idx].bcolor = bcolor;
          }
          if ( fcolor ){
            this.tabNav.tabs[this.idx].fcolor =  fcolor;
          }
        }
      },
      popup(){
        let popup = this.getPopup();
        return arguments.length ? popup.open.apply(popup, arguments) : popup;
      },
      getComponent(){
        for ( let i = 0; i < this.$children.length; i++ ){
          if ( this.$children[i].$options._componentTag !== 'bbn-popup' ){
            return this.$children[i];
          }
        }
        return false;
      },
      reload(){
        return this.tabNav.reload(this.idx);
      },
      activate(force){
        return this.tabNav.activate(this.idx, force);
      },
      confirm(){
        let p = this.popup();
        if ( p ){
          return p.confirm.apply(p, arguments)
        }
      },
      alert(){
        let p = this.popup();
        if ( p ){
          return p.alert.apply(p, arguments)
        }
      },
      getSubTabNav(ele){
        if ( ele === undefined ){
          ele = this;
        }

        var recurse = function(el){
          if ( el.$options && el.$options._componentTag && (el.$options._componentTag === "bbn-tabnav") ){
            return el;
          }
          if ( el.$children ){
            for ( var i = 0; i < el.$children.length; i++ ){
              var r = recurse(el.$children[i]);
              if ( r ){
                return r;
              }
            }
          }
          return false;
        };
        return recurse(ele);
      },
      addMenu(obj){
        if (
          (this.idx > -1) &&
          obj.text &&
          this.$parent.tabs &&
          this.$parent.tabs[this.idx]
        ){
          if ( this.$parent.tabs[this.idx].menu === undefined ){
            this.$parent.tabs[this.idx].menu = [];
          }
          let menu = this.$parent.tabs[this.idx].menu,
              idx = bbn.fn.search($.isFunction(menu) ? menu() : menu, {text: obj.text});
          if ( idx === -1 ){
            if ( $.isFunction(menu) ){
              this.$parent.tabs[this.idx].menu = () => {
                let items = menu() || [];
                if ( bbn.fn.search(items, obj) === -1 ){
                  if ( !obj.key ){
                    obj.key = bbn.fn.randomInt(99999,99999999999);
                  }
                  items.push(obj);
                }
                return items;
              };
            }
            else{
              if ( !obj.key ){
                obj.key = bbn.fn.randomInt(99999,99999999999);
              }
              menu.push(obj)
            }
          }
          else{
            obj.key = menu[idx].key;
            menu.splice(idx, 1, obj);
          }
          return obj.key;
        }
        return false;
      },
      deleteMenu(key){
        if (
          (this.idx > -1) &&
          this.$parent.tabs &&
          this.$parent.tabs[this.idx]
        ){
          let menu = this.$parent.tabs[this.idx].menu || [];
          if ( $.isFunction(menu) ){
            menu = () => {
              let items = menu() || [];
              let idx = bbn.fn.search(items, "key", key);
              if ( idx > -1 ){
                items.splice(idx, 1);
                this.$parent.tabs[this.idx].menu = items;
                this.$parent.$forceUpdate();
                return true;
              }
            };
          }
          else{
            let idx = bbn.fn.search(menu, "key", key);
            if ( idx > -1 ){
              menu.splice(idx, 1);
              this.$parent.tabs[this.idx].menu = menu;
              this.$parent.$forceUpdate();
              return true;
            }
          }
        }
        return false;
      }
    },

    created(){
      if ( this.isComponent === null ){
        this.onMount = () => {
          return false;
        };
        let res;
        if ( this.script ){
          res = typeof this.script === 'string' ? eval(this.script) : this.script;
          if ( $.isFunction(res) ){
            this.onMount = res;
            this.isComponent = false;
          }
          else if ( typeof(res) === 'object' ){
            this.isComponent = true;
          }
        }
        if ( this.isComponent ){
          bbn.fn.extend(res ? res : {}, {
            name: this.name,
            template: '<div class="bbn-full-screen">' + this.content + '</div>',
            methods: {
              getTab: () => {
                return this;
              },
              addMenu: this.addMenu,
              deleteMenu: this.deleteMenu
            },
            props: ['source']
          });
          this.$options.components[this.name] = res;
        }
        else{
          this.isComponent = false;
        }
      }
    },

    mounted(){
      this.tabNav = bbn.vue.closest(this, ".bbn-tabnav");
      if ( !this.isComponent ){
        this.onMount(this.$el, this.source);
      }
      if ( this.advert ){
        let ad = {};
        if ( this.advert instanceof Vue ){
          ad.component = this.advert;
        }
        else if ( typeof this.advert === 'object' ){
          ad = this.advert;
        }
        else if ( typeof this.advert === 'string' ){
          ad.content = this.advert;
        }
        this.popup.advert(ad);
      }
      if ( this.imessages.length ){
        this.getPopup().open({
          component: {
            props: ['source'],
            template: `
              <bbn-slideshow :source="source.content" 
                             class="w3-blue"
                             separator="---slide---"
                             :checkbox="true"
                             @check="setHidden"
                             @uncheck="unsetHidden"
              ></bbn-slideshow>`,
            methods: {
              setHidden(e){
                e.hidden = true;
                bbn.vue.closest(this, 'bbn-appui').$emit('setimessage', e);
              },
              unsetHidden(e){
                e.hidden = false;
                bbn.vue.closest(this, 'bbn-appui').$emit('setimessage', e);
              }
            }
          },
          source: {
            content: this.imessages
          },
          title: '<i class="w3-large fa fa-message"> </i> <span class="bbn-iblock">' + bbn._('Internal message') + '</span>',
          width: '90%',
          height: '90%'
        });
      }
      this.ready = true;
    },

    watch: {
      selected(newVal){
        if ( newVal ){
          this.$nextTick(() => {
            this.fullScreen = false;
            this.selfEmit(true);
          })
        }
      },
      fullScreen(newVal){
        let fn = (e) => {
          if ( e.keyCode === 27 ){
            this.fullScreen = false;
          }
        };
        if ( newVal ){
          document.body.addEventListener('keydown', fn);
        }
        else{
          document.body.removeEventListener('keydown', fn);
        }
        this.$nextTick(() => {
          this.onResize();
        })
      }
    }
  });

})(jQuery, bbn, Vue);
