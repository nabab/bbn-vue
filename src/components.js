((bbn) => {
  "use strict";
  const
    editorOperators = {
      string: {
        contains: bbn._('Contient'),
        eq: bbn._('Est'),
        neq: bbn._('N’est pas'),
        startswith: bbn._('Commence par'),
        doesnotcontain: bbn._('Ne contient pas'),
        endswith: bbn._('Se termine par'),
        isempty: bbn._('Est vide'),
        isnotempty: bbn._('N’est pas vide')
      },
      number: {
        eq: bbn._('Est égal à'),
        neq: bbn._('N’est pas égal à'),
        gte: bbn._('Est supérieur ou égal à'),
        gt: bbn._('Est supérieur à'),
        lte: bbn._('Est inférieur ou égal à'),
        lt: bbn._('Est inférieur à'),
      },
      date: {
        eq: bbn._('Est égal à'),
        neq: bbn._('N’est pas égal à'),
        gte: bbn._('Est postérieur ou égal à'),
        gt: bbn._('Est postérieur à'),
        lte: bbn._('Est antérieur ou égal à'),
        lt: bbn._('Est antérieur à'),
      },
      enums: {
        eq: bbn._('Est égal à'),
        neq: bbn._('N’est pas égal à'),
      },
      boolean: {
        istrue: bbn._('Est vrai'),
        isfalse: bbn._('Est faux')
      }
    },
    editorNullOps = {
      isnull: bbn._('Est nul'),
      isnotnull: bbn._('N’est pas nul')
    },
    editorNoValueOperators = ['', 'isnull', 'isnotnull', 'isempty', 'isnotempty', 'istrue', 'isfalse'];

  bbn.fn.autoExtend("vue", {
    emptyComponent: {
      template: '<template><slot></slot></template>',
      created(){
        this.componentClass.push('bbn-empty-component');
      },
    },

    basicComponent: {
      props: {
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        },
      },
      data(){
        return {
          isMounted: false,
          ready: false
        }
      },
      methods: {
        focus(){
          let ele = this.getRef('element');
          if ( ele ){
            ele.focus()
          }
        },
      },
      beforeCreate(){
        if ( !this.$options.render && !this.$options.template && this.$options.name ){
          this.$options.template = '#bbn-tpl-component-' + this.$options.name.slice(4);
        }
      },
      created(){
        if ( this.$options.name && (this.componentClass.indexOf(this.$options.name) === -1) ){
          this.componentClass.push(this.$options.name);
        }
        this.componentClass.push('bbn-basic-component');
      },
      mounted(){
        this.isMounted = true;
        this.$emit('mounted');
      },
      watch: {
        ready(newVal){
          if ( newVal ){
            this.$emit('ready', newVal)
          }
        }
      }
    },

    focusComponent: {
      data(){
        return {
          focusedComponent: bbn.env.focused
        }
      },
      mounted(){
        this.$el.focus();
      },
      beforeDestroy(){
        if ( this.focusedComponent ){
          this.focusedComponent.focus();
        }
      }
    },

    localStorageComponent: {
      props: {
        storage: {
          type: Boolean,
          default: false
        },
        storageName: {
          type: String,
          default: 'default'
        },
        storageFullName: {
          type: String
        },
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      computed: {
        _storage(){
          if ( window.store ){
            return {
              get(name){
                let tmp = window.store.get(name);
                if ( tmp ){
                  return tmp.value;
                }
              },
              set(name, value){
                return window.store.set(name, {
                  value: value,
                  time: (new Date()).getTime()
                });
              },
              time(name){
                let tmp = window.store.get(name);
                if ( tmp ){
                  return tmp.time;
                }
              },
              remove(name){
                return window.store.remove(name);
              }
            }
          }
          return false;
        },
        hasStorage(){
          return (this.storage || (this.storageFullName || (this.storageName !== 'default'))) && !!this._storage;
        },
      },
      methods: {
        _getStorageRealName(){
          return this.storageFullName ? this.storageFullName : this.$options.name + '-' + window.location.pathname.substr(1) + '-' + this.storageName;
        },
        getStorage(name){
          if ( this.hasStorage ){
            return this._storage.get(name || this._getStorageRealName())
          }
        },
        setStorage(value, name){
          if ( this.hasStorage ){
            return this._storage.set(name || this._getStorageRealName(), value)
          }
        },
      },
      created(){
        if ( this.hasStorage ){
          this.componentClass.push('bbn-local-storage-component');
        }
      },
    },
    
    dataComponent: {
      methods: {
        renderData(data, cfg){
          if ( !cfg.field || !data ){
            return '';
          }
          let v = data[cfg.field] || '';
          if ( cfg.icon ){
            return '<i class="' + cfg.icon + '"> </i>'
          }
          else if ( cfg.type ){
            switch ( cfg.type ){
              case "datetime":
                if ( cfg.format ){
                  return v ? (new moment(v)).format(cfg.format) : '-';
                }
                else{
                  return v ? bbn.fn.fdate(v) : '-';
                }
                break;
              case "date":
                if ( cfg.format ){
                  return v ? (new moment(v)).format(cfg.format) : '-';
                }
                else{
                  return v ? bbn.fn.fdate(v) : '-';
                }
                break;
              case "time":
                if ( cfg.format ){
                  return v ? (new moment(v)).format(cfg.format) : '-';
                }
                else{
                  return v ? bbn.fn.fdate(v) : '-';
                }
                break;
              case "email":
                return v ? '<a href="mailto:' + v + '">' + v + '</a>' : '-';
                break;
              case "url":
                return v ? '<a href="' + v + '">' + v + '</a>' : '-';
                break;
              case "percent":
                return v ? bbn.fn.money(v * 100, false, "%", '-', '.', ' ', 2) : '-';
                break;
              case "number":
                return v ?
                  bbn.fn.money(
                    v,
                    (cfg.precision === -4) || (cfg.format && (cfg.format.toLowerCase() === 'k')),
                    cfg.unit || "",
                    '-',
                    '.',
                    ' ',
                    cfg.precision === -4 ? 3 : (cfg.precision || 0)
                  ) : '-';
                break;
              case "money":
                return v ?
                  bbn.fn.money(
                    v,
                    (cfg.precision === -4) || (cfg.format && (cfg.format.toLowerCase() === 'k')),
                    cfg.currency || cfg.unit || "",
                    '-',
                    ',',
                    ' ',
                    cfg.precision === -4 ? 3 : cfg.precision
                  ) : '-';
                break;
              case "bool":
              case "boolean":
                let isYes = v && (v !== 'false') && (v !== '0');
                if ( cfg.yesvalue !== undefined ){
                  isYes = v === cfg.yesvalue;
                }
                return '<i class="fas fa-' + (isYes ? 'check' : 'times') + '" title="' + (isYes ? bbn._("Yes") : bbn._("No")) + '"></i>';
                break;
            }
          }
          else if ( cfg.source ){
            let idx = bbn.fn.search(cfg.source, {value: v});
            return idx > -1 ? cfg.source[idx].text : '-';
          }
          else {
            return v || '';
          }          
        }
      }
    },

    dataEditorComponent: {
      props: {
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      methods: {
        editorOperatorType(col){
          if ( col.field ){

          }
        },
        editorHasNoValue(operator){
          return $.inArray(operator, editorNoValueOperators) > -1;
        },
        editorGetComponentOptions(col){
          let o = {
            type: 'string',
            component: 'bbn-input',
            multi: false,
            componentOptions:  {}
          };
          if ( col && col.field ){
            o.field = col.field;
            if ( col.filter ){
              o.component = col.filter;
            }
            else if ( col.source ){
              o.type = 'enums';
              o.component = 'bbn-dropdown';
              o.componentOptions.source = col.source;
              o.componentOptions.placeholder = bbn._('Choose');
            }
            else if ( col.type ){
              switch ( col.type ){
                case 'number':
                case 'money':
                  o.type = 'number';
                  o.component = 'bbn-numeric';
                  break;
                case 'date':
                  o.type = 'date';
                  o.component = 'bbn-datepicker';
                  break;
                case 'time':
                  o.type = 'date';
                  o.component = 'bbn-timepicker';
                  break;
                case 'datetime':
                  o.type = 'date';
                  o.component = 'bbn-datetimepicker';
                  break;
              }
            }
            if ( col.componentOptions ){
              $.extend(o.componentOptions, col.componentOptions);
            }
            if ( o.type && this.editorOperators[o.type] ){
              o.operators = this.editorOperators[o.type];
            }
            o.fields = [col];
          }
          return o
        },

      },
      computed: {
        editorOperators(){
          return editorOperators;
        },
        editorNullOps(){
          return editorNullOps;
        },
        editorNoValueOperators(){
          return editorNoValueOperators;
        }
      },
      created(){
        this.componentClass.push('bbn-data-editor-component');
      },
    },

    eventsComponent: {
      props: {
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      data(){
        return {
          isTouched: false
        }
      },
      methods: {
        click(e){
          this.$emit('click', e)
        },
        blur(e){
          this.$emit('blur', e)
        },
        focus(e){
          this.$emit('focus', e)
        },
        keyup(e){
          this.$emit('keyup', e)
        },
        keydown(e){
          this.$emit('keydown', e)
        },
        over(e){
          this.$emit('over', e);
          setTimeout(() => {
            this.$emit('hover', true, e);
          }, 0)
        },
        out(e){
          this.$emit('out', e);
          setTimeout(() => {
            this.$emit('hover', false, e);
          }, 0)
        },
        touchstart(e){
          this.isTouched = true;
          setTimeout(() => {
            if ( this.isTouched ){
              let event = new Event('contextmenu');
              this.$el.dispatchEvent(event);
              this.isTouched = false;
            }
          }, 1000)
        },
        touchmove(e){
          this.isTouched = false;
        },
        touchend(e){
          this.isTouched = false;
        },
        touchcancel(e){
          this.isTouched = false;
        }
      },
      created(){
        this.componentClass.push('bbn-events-component');
      },
    },

    dataSourceComponent: {
      props: {
        source: {
          type: [Array, Object, String, Function],
          default(){
            return [];
          }
        },
        sourceText: {
          type: String,
          default: "text"
        },
        sourceValue: {
          type: String,
          default: "value"
        },
        nullable: {
          type: Boolean,
          default: false
        },
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        },
      },
      methods: {
        getOptions(obj){
          let cfg = bbn.vue.getOptions2(this, obj);
          cfg.dataTextField = this.sourceText || this.widgetOptions.dataTextField || 'text';
          cfg.dataValueField = this.sourceValue || this.widgetOptions.dataValueField || 'value';
          cfg.dataSource = this.dataSource;
          return cfg;
        },
        getOptions2(obj){
          let cfg = bbn.vue.getOptions2(this, obj);
          if ( this.widgetOptions.dataTextField || this.sourceText ){
            cfg.dataTextField = this.widgetOptions.dataTextField || this.sourceText;
          }
          if ( this.widgetOptions.dataValueField || this.sourceValue ){
            cfg.dataValueField = this.widgetOptions.dataValueField || this.sourceValue;
          }
          cfg.dataSource = this.dataSource;
          return cfg;
        }
      },
      computed: {
        dataSource(){
          return bbn.vue.toKendoDataSource(this)
        }
      },
      watch:{
        source: function(newDataSource){
          if ( this.widget ){
            this.widget.setDataSource(this.dataSource);
          }
        }
      },
      created(){
        this.componentClass.push('bbn-datasource-component');
      },
    },

    memoryComponent: {
      props: {
        memory: {
          type: [Object, Function]
        },
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      created(){
        this.componentClass.push('bbn-memory-component');
      }
    },

    inputComponent: {
      props: {
        value: {},
        name: {
          type: String
        },
        placeholder: {
          type: String
        },
        required: {
          type: [Boolean, Function],
          default: false
        },
        disabled: {
          type: [Boolean, Function],
          default: false
        },
        readonly: {
          type: [Boolean, Function],
          default: false
        },
        size: {
          type: [Number, String]
        },
        maxlength: {
          type: [String, Number]
        },
        validation: {
          type: [Function]
        },
        type: {
          type: String
        },
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      methods: {
        emitInput(val){
          this.$emit('input', val);
        },
        change(e){
          this.$emit('change', e, this.value)
        },
        isValid(val){
          const elem = this.$refs.element,
                $elem = $(this.$el),
                customMessage = this.$el.hasAttribute('validationMessage') ? this.$el.getAttribute('validationMessage') : false;
          // Get validity
          if ( elem && elem.validity ){
            let validity = elem.validity,
                // Default message
                mess = bbn._('The value you entered for this field is invalid.');
            // If valid or disabled, return true
            if ( elem.disabled || validity.valid ){
              return true;
            }
            if ( !validity.valid ){
              // If field is required and empty
              if ( validity.valueMissing ){
                mess = bbn._('Please fill out this field.');
              }
              // If not the right type
              else if ( validity.typeMismatch ){
                switch ( elem.type ){
                  // Email
                  case 'email':
                    mess = bbn._('Please enter a valid email address.');
                    break;
                  // URL
                  case 'url':
                    mess = bbn._('Please enter a valid URL.');
                    break;
                }
              }
              // If too short
              else if ( validity.tooShort ){
                mess = bbn._('Please lengthen this text to ') + elem.getAttribute('minLength') + bbn._(' characters or more. You are currently using ') + elem.value.length + bbn._(' characters.');
              }
              // If too long
              else if ( validity.tooLong ){
                mess = bbn._('Please shorten this text to no more than ') + elem.getAttribute('maxLength') + bbn._(' characters. You are currently using ') + elem.value.length + bbn._(' characters.');
              }
              // If number input isn't a number
              else if ( validity.badInput ){
                mess = bbn._('Please enter a number.');
              }
              // If a number value doesn't match the step interval
              else if ( validity.stepMismatch ){
                mess = bbn._('Please select a valid value.');
              }
              // If a number field is over the max
              else if ( validity.rangeOverflow ){
                mess = bbn._('Please select a value that is no more than ') + elem.getAttribute('max') + '.';
              }
              // If a number field is below the min
              else if ( validity.rangeUnderflow ){
                mess = bbn._('Please select a value that is no less than ') + elem.getAttribute('min') + '.';
              }
              // If pattern doesn't match
              else if (validity.patternMismatch) {
                // If pattern info is included, return custom error
                mess = bbn._('Please match the requested format.');
              }
              this.$emit('error', customMessage || mess);
              $elem.css('border', '1px solid red');
              this.$on('blur', () => {
                $elem.css('border', 'none');
                $elem.focus();
              });
              return false;
            }
          }
          return true;
        }
      },
      created(){
        this.componentClass.push('bbn-input-component');
      },
      watch:{
        disabled(newVal){
          if ( this.widget && $.isFunction(this.widget.enable) ){
            this.widget.enable(!newVal);
          }
          else if ( this.widget && this.widgetName && $.isFunction(this.widget[this.widgetName]) ){
            this.widget[this.widgetName](newVal ? "disable" : "enable");
          }
          else if ( $(this.$el).is("input") ){
            if ( newVal ){
              $(this.$el).attr("disabled", true).addClass("k-state-disabled");
            }
            else{
              $(this.$el).attr("disabled", false).removeClass("k-state-disabled");
            }
          }
          else if ( this.$refs.input ){
            if ( newVal ){
              $(this.$refs.input).attr("disabled", true).addClass("k-state-disabled");
            }
            else{
              $(this.$refs.input).attr("disabled", false).removeClass("k-state-disabled");
            }
          }
        },
        value(newVal){
          if ( this.widget && (this.widget.value !== undefined) ){
            if ( $.isFunction(this.widget.value) ){
              if ( this.widget.value() !== newVal ){
                this.widget.value(newVal);
              }
            }
            else{
              if ( this.widget.value !== newVal ){
                this.widget.value = newVal;
              }
            }
          }
        },
        cfg(){

        }
      }
    },

    optionComponent: {
      props: {
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      methods: {
        getOptions(){
          return bbn.vue.getOptions(this);
        },
      },
      created(){
        this.componentClass.push('bbn-option-component');
      }
    },

    widgetComponent: {
      props: {
        cfg: {
          type: Object,
          default(){
            return {};
          }
        },
        widgetOptions: {
          type: Object,
          default(){
            return {};
          }
        },
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      created(){
        this.componentClass.push('bbns-widget-component');
      },
      beforeDestroy(){
        //bbn.fn.log("Default destroy");
        //this.destroy();
      },
      methods: {
        destroy(){
          const vm = this;
          /*
          if ( vm.widget && $.isFunction(vm.widget.destroy) ){
            vm.widget.destroy();
            vm.widget = false;
            if ( vm.$refs.element ){
              let $ele = $(vm.$refs.element).removeAttr("style");
              while ( $ele.parent()[0] !== vm.$el ){
                $ele.unwrap();
              }
              bbn.fn.log("Moving element", $ele);
              if ( vm.widgetName ){
                $ele.removeAttr("data-role").removeAttr("style").removeData(this.widgetName);
              }
            }
            else if ( this.widgetName ){
              $(this.$el).removeData(this.widgetName);
            }
            if ( this.$refs.input ){
              $(this.$refs.input).appendTo(this.$el)
            }
            $(this.$el).children().not("[class^='bbn-']").remove();
          }
          */
        },
        build(){
          bbn.fn.info("CLASSIC BUILD");
        },
        getWidgetCfg(){
          const vm = this;
        },
      }
    },

    // These components will emit a resize event when their closest parent of the same kind gets really resized
    resizerComponent: {
      props: {
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      data(){
        return {
          // The closest resizer parent
          parentResizer: false,
          // The listener on the closest resizer parent
          resizeEmitter: false,
          // Height
          lastKnownHeight: false,
          // Width
          lastKnownWidth: false
        };
      },
      methods: {
        // a function can be executed just before the resize event is emitted
        onResize(){
          return;
        },

        setResizeEvent(){
          // The timeout used in the listener
          let resizeTimeout;
          // This class will allow to recognize the element to listen to
          this.$el.className += " bbn-resize-emitter";
          this.parentResizer = this.closest(".bbn-resize-emitter", true);
          // Setting initial dimensions
          this.lastKnownHeight = this.parentResizer ? Math.round($(this.parentResizer.$el).innerHeight()) : bbn.env.height;
          this.lastKnownWidth = this.parentResizer ? Math.round($(this.parentResizer.$el).innerWidth()) : bbn.env.width;
          // Creating the callback function which will be used in the timeout in the listener
          this.resizeEmitter = (force) => {
            // Removing previous timeout
            clearTimeout(resizeTimeout);
            // Creating a new one
            resizeTimeout = setTimeout(() => {
              if ( $(this.$el).is(":visible") ){
                // Checking if the parent hasn't changed (case where the child is mounted before)
                let tmp = this.closest(".bbn-resize-emitter", true);
                if ( tmp !== this.parentResizer ){
                  // In that case we reset
                  this.unsetResizeEvent();
                  this.setResizeEvent();
                  return;
                }
                let resize = false,
                    h      = this.parentResizer ? Math.round($(this.parentResizer.$el).innerHeight()) : bbn.env.height,
                    w      = this.parentResizer ? Math.round($(this.parentResizer.$el).innerWidth()) : bbn.env.width;
                if ( h && (this.lastKnownHeight !== h) ){
                  this.lastKnownHeight = h;
                  resize = 1;
                }
                if ( w && (this.lastKnownWidth !== w) ){
                  this.lastKnownWidth = w;
                  resize = 1;
                }
                if ( resize || force ){
                  this.onResize();
                  this.$emit("resize", force);
                }
              }
            }, 0);
          };
          if ( this.parentResizer ){
            //bbn.fn.log("SETTING EVENT FOR PARENT", this.$el, this.parentResizer);
            this.parentResizer.$on("resize", (force) => {
              this.resizeEmitter(force)
            });
          }
          else{
            //bbn.fn.log("SETTING EVENT FOR WINDOW", this.$el);
            $(window).on("resize", (force) => {
              this.resizeEmitter(force)
            });
          }
          this.resizeEmitter();
        },

        unsetResizeEvent(){
          return;
          if ( this.resizeEmitter ){
            if ( this.parentResizer ){
              //bbn.fn.log("UNSETTING EVENT FOR PARENT", this.$el, this.parentResizer);
              this.parentResizer.$off("resize", this.resizeEmitter);
            }
            else{
              //bbn.fn.log("UNSETTING EVENT FOR WINDOW", this.$el);
              $(window).off("resize", this.resizeEmitter);
            }
          }
        },

        selfEmit(force){
          if ( this.parentResizer ){
            this.parentResizer.$emit("resize", force);
          }
        }
      },
      created(){
        this.componentClass.push('bbn-resizer-component');
      },
      mounted(){
        this.setResizeEvent();
      },
      beforeDestroy(){
        this.unsetResizeEvent();
      }
    },

    closeComponent: {
      props: {
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      created(){
        this.componentClass.push('bbn-close-component');
      },
      computed: {
        canClose(){
          return !this.isUnsaved;
        }
      },
      methods: {

      }
    },

    fieldComponent: {
      props: {
        width: {
          type: [String, Number],
        },
        render: {
          type: [String, Function]
        },
        title: {
          type: [String, Number]
        },
        ftitle: {
          type: String
        },
        tcomponent: {
          type: [String, Object]
        },
        icon: {
          type: String
        },
        cls: {
          type: [String, Function]
        },
        type: {
          type: String
        },
        field: {
          type: String
        },
        fixed: {
          type: [Boolean, String],
          default: false
        },
        hidden: {
          type: Boolean
        },
        encoded: {
          type: Boolean,
          default: false
        },
        sortable: {
          type: [Boolean, Function],
          default: true
        },
        editable: {
          type: [Boolean, Function],
          default: true
        },
        filterable: {
          type: [Boolean, Function],
          default: true
        },
        resizable: {
          type: [Boolean, Function],
          default: true
        },
        showable: {
          type: [Boolean, Function],
          default: true
        },
        nullable: {
          type: [Boolean, Function],
        },
        buttons: {
          type: [Array, Function]
        },
        source: {
          type: [Array, Object, String, Function]
        },
        required: {
          type: [Boolean, Function]
        },
        precision: {
          type: Number,
          default: 0
        },
        options: {
          type: [Object, Function],
          default(){
            return {};
          }
        },
        editor: {
          type: [String, Object]
        },
        maxLength: {
          type: Number
        },
        sqlType: {
          type: String
        },
        aggregate: {
          type: [String, Array]
        },
        component: {
          type: [String, Object]
        },
        mapper: {
          type: Function
        },
        group: {
          type: String
        }
      },
    },

    viewComponent: {
      props: {
        source: {
          type: [Object, Function]
        },
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
      }
    },

    observerComponent: {
      props: {
        observer: {
          type: Boolean,
          default: true
        }
      },
      data(){
        return {
          // Integration of the functionnality is done through a watcher on this property
          observersCopy: [],
          observerValue: null,
          observers: [],
          observerID: null,
          observationTower: null,
          observerUID: bbn.fn.randomString().toLowerCase()
        }
      },
      methods: {
        observerCheck(){
          return this.observer && this.observationTower;
        },
        isObserved(){
          return this.observerCheck() && this.observerValue;
        },
        observerWatch(){
          if ( this.isObserved() ){
            bbn.fn.log("----------------isObserved--------------", this.$el)
            this.observationTower.observerRelay({
              element: this.observerUID,
              id: this.observerID,
              value: this.observerValue
            });
            this.observationTower.$on('bbnObs' + this.observerUID + this.observerID, (newVal) => {
              // Integration of the functionnality is done through a watcher on this property
              this.observerValue = newVal;
            });
          }
        },
        observerRelay(obs){
          if ( this.observer ){
            bbn.fn.log("----------------observerRelay--------------", this.$el)
            let idx = bbn.fn.search(this.observers, {id: obs.id, element: obs.element});
            if ( idx > -1 ){
              if ( this.observers[idx].value !== obs.value ){
                this.observers.splice(idx, 1, obs);
              }
            }
            else{
              this.observers.push(obs);
              if ( this.observerCheck() ){
                this.observationTower.$on('bbnObs' + obs.element + obs.id, (newVal) => {
                  this.observerEmit(newVal, obs);
                });
              }
            }
            if ( this.observerCheck() ){
              this.observationTower.observerRelay(obs);
            }
          }
        },
        observerEmit(newVal, obs){
          bbn.fn.log("--------------observerEmit-------------------", this.$el);
          let row = bbn.fn.get_row(this.observers, {id: obs.id, element: obs.element});
          if ( row && (row.value !== newVal) ){
            row.value = newVal;
            this.$emit('bbnObs' + obs.element + obs.id, newVal);
          }
        }
      },
      created(){
        if ( this.componentClass ){
          this.componentClass.push('bbn-observer-component');
          this.componentClass.push('bbn-observer', 'bbn-observer-' + this.observerUID);
        }
      },
      mounted(){
        if ( this.observer ){
          this.observationTower = this.closest('.bbn-observer');
          this.observerWatch();
        }
      },
      beforeDestroy(){
        if ( this.isObserved() ){
          let idx = bbn.fn.search(this.observationTower.observers, {element: this.observerUID});
          if ( idx > -1 ){
            this.observationTower.observers.splice(idx, 1);
          }
          this.observationTower.$off('bbnObs' + this.observerUID + this.observerID);
        }
      },
    },

    keepCoolComponent: {
      data(){
        return {
          coolTimer: {
            default: 0
          },
          coolTimeout: null,
          coolInterval: 40
        }
      },
      methods: {
        keepCool(fn, idx, timeout){
          if ( !idx ){
            idx = 'default'
          }
          let t = (new Date()).getTime();
          if ( !this.coolTimer[idx] || (this.coolTimer[idx] < (t - (timeout || this.coolInterval))) ){
            this.coolTimer[idx] = (new Date()).getTime();
            fn()
          }
          else{
            setTimeout(() => {
              let t = (new Date()).getTime();
              if ( this.coolTimer[idx] < (t - (timeout || this.coolInterval)) ){
                this.coolTimer[idx] = t;
                fn();
              }
            }, this.coolInterval);
          }
        }
      }
    },

    urlComponent: {
      props: {
        baseUrl: {
          type: String
        }
      },
      data(){
        return {
          currentURL: null,
          title: null
        }
      },
      methods: {
        updateUrl(){
          if ( this.baseUrl && (bbn.env.path.indexOf(this.baseUrl) === 0) && (bbn.env.path.length > (this.baseUrl.length + 1)) ){
            let url = this.baseUrl + (this.currentURL ? '/' + this.currentURL : '');
            bbn.fn.setNavigationVars(
              url,
              (this.currentURL ? bbn.fn.get_field(this.source, this.sourceValue, this.currentURL, this.sourceText) + ' < ' : '') + document.title,
              {
                script: () => {
                  bbn.fn.log("EXEC SCRIPT");
                  let idx = bbn.fn.search(this.source, this.sourceValue, this.currentURL);
                  if ( idx > -1 ){
                    this.widget.select(idx);
                    this.widget.trigger("change");
                  }
                }
              },
              !this.ready)
          }
        }
      },
      created(){
        this.componentClass.push('bbn-url-component');
      },
    }
  })
})(window.bbn);