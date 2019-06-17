/**
 * @file bbn-fisheye component
 *
 * @description bbn-fisheye is a component that represents a horizontal menu consisting of a single line, ideal for managing shortcuts.
 * The items are all in one level and are represented only by icons.
 * Extremely easy to implement, each element can perform an action that we define as a link.
 * Great for those who want a menu that is always available and easy to use when choosing the desired item.
 *
 * @author BBN Solutions
 * 
 * @copyright BBN Solutions
 */
(function(bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-fisheye', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.optionComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.optionComponent],
    props: {
      /**
       * The source of the component
       * @prop {Array} [[]] source
       */
      source: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * An array of items fixed on the left of the component
       * @prop {Array} [[]] fixedLeft
       */
      fixedLeft: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * An array of items fixed on the right of the component
       * @prop {Array} [[]] fixedRight
       */
      fixedRight: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * The zIndex of the component
       * @prop {Number} [1] zIndex
       */
      zIndex: {
        type: Number,
        default: 1
      },
      /**
       * The url for the post of the action remove
       * @prop {Object} [{}] delUrl
       */
      delUrl: {},
      /**
       * The url for the post of the action insert
       * @prop {Object} [{}] insUrl
       */
      insUrl: {},
      /**
       * The position top
       * @prop {Number|String} ['0px'] top
       */
      top: {
        type: [Number, String],
        default: '0px'
      },
      /**
       * The position bottom
       * @prop {Number|String} ['0px'] bottom
       */
      bottom: {
        type: [Number, String],
        default: '0px'
      },
      /**
       * The horizontal position of the component
       * @prop {String} ['0px'] position
       */
      position: {
        type: String,
        default: 'left'
      }
    },

    data(){
      return {
        /**
         * 
         * @data {Array} currentData 
         */
        currentData: this.source.slice(),
        /**
         * @data {Boolean} [false] menu
         */
        menu: false,
        /**
         * @data {Boolean} [false] widget
         */
        widget: false,
        /**
         * @data {Boolean} [false] binEle
         */
        binEle: false,
        /**
         * @data {Boolean} [false] droppableBin
         */
        droppableBin: false
      };
    },

    computed: {
      /**
       * @computed items
       * @return {Array}
       */
      items(){
        let items = this.fixedLeft.slice();
        bbn.fn.each(this.currentData, (a, i) => {
          items.push(a);
        });
        bbn.fn.each(this.fixedRight, (a, i) => {
          items.push(a);
        });
        return items;
      }
    },

    methods: {
      /**
       * Fires the method given to the item as 'command'
       * @method onClick
       * @param {Object} it 
       */
      onClick(it){
        if ( it.command && bbn.fn.isFunction(it.command) ){
          it.command();
        }
      },
      /**
       * Adds the given object as a new item
       * @method add
       * @param {Object} obj 
       */
      add(obj){
        if (
          this.insUrl &&
          (typeof(obj) === 'object') &&
          obj.url &&
          obj.icon &&
          obj.text &&
          obj.id
        ){
          bbn.fn.post(this.insUrl, {id: obj.id}, (d) => {
            if ( d.success ){
              obj.id_option = obj.id;
              obj.id = d.id;
              this.currentData.push(obj);
            }
            else{
              new Error(bbn._("The shortcut has failed to be inserted"));
            }
          });
        }
      },
      /**
       * Removes the given item from the component
       * @param {Number|String} id 
       */
      remove(id){
        if ( id && this.delUrl ){
          bbn.fn.post(this.delUrl, {id: id}, (d) => {
            if ( d.success ){
              let idx = bbn.fn.search(this.currentData, "id", id);
              if ( idx > -1 ){
                this.currentData.splice(idx, 1)
              }
            }
          });
        }
      },
      /**
       * Initializes the component
       * @method setup
       * @fires remove
       */
      setup(){
        var vm = this,
            $ele = $(vm.$el);

        // Bin management
        if ( vm.delUrl ){
          vm.binEle = $("#bbn_dock_menu_bin");
          if ( !vm.binEle.length ){
            vm.binEle = $('<div id="bbn_dock_menu_bin" style="z-index: ' + vm.zIndex + '"><i class="nf nf-fa-trash"></i> </div>').appendTo(document.body);
          }
          if ( vm.droppableBin ){
            vm.droppableBin.droppable("destroy");
          }
          vm.droppableBin = vm.binEle.droppable({
            accept: "li",
            hoverClass: "bbn-state-hover",
            activeClass: "bbn-state-active",
            drop: (e, ui) => {
              this.remove(ui.draggable.attr("data-id"))
            }
          });

          if ( vm.draggable ){
            vm.draggable.destroy();
          }
          vm.draggable = $ele.find("li[data-id!='']").draggable({
            helper: function (e, ui) {
              var t = $(e.currentTarget),
                  i = t.find("i"),
                  r = $('<div id="bbn_menu2dock_helper"/>');
              r.append(i[0].outerHTML);
              return r;
            },
            cursorAt: {top: 1, left: 0},
            zIndex: vm.zIndex,
            scroll: false,
            containment: "window",
            appendTo: 'body',
            start: function (e, ui) {
              vm.binEle.show();
            },
            stop: function (e, ui) {
              vm.binEle.hide();
            }
          }).data("draggable");

          if ( vm.widget ){
            vm.widget.fisheye("destroy");
          }
        }

        if ( $ele.hasClass("ui-fisheye") ){
          $ele.fisheye("destroy");
        }

        vm.widget = $ele.fisheye({
          items: 'li',
          itemsText: 'span',
          container: 'ul',
          valign: 'top'
        });
      },
    },
    /**
     * @event mounted
     * @fires setup
     */
    mounted: function(){
      this.setup();
      this.ready = true;
      setTimeout(() => {
        $(this.$el).trigger('mousemove');
        this.widget.fisheye('refresh');
      }, 1000);
    },
    /**
     * @event updated
     * @fires setup
     */
    updated: function(){
      this.setup();
    }
  });

})(bbn);
