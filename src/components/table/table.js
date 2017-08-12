/**
 * Created by BBN on 14/02/2017.
 */
(function($, bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-table', {
    mixins: [bbn.vue.fullComponent],
    props: {
      limit: {
        type: Number,
        default: 25
      },
      pagination: {
        type: Boolean,
        default: false
      },
      info: {
        type: Boolean,
        default: false
      },
      search: {
        type: Boolean,
        default: false
      },
      currency: {
        type: String
      },
      url: {
        type: String
      },
      take: {
        type: Number
      },
      skip: {
        type: Number
      },
      trClass: {
        type: [String,Function]
      },
      toolbar: {},
      xscroll: {},
      source: {},
      columns: {
        type: Array,
        default: function(){
          return [];
        }
      },
      cfg: {
        type: Object,
        default: function(){
          return {
            columns: [],
            take: 50,
            skip: 0,
            currency: ''
          };
        }
      },
      edit: {
        type: Function
      }
    },
    data: function(){
      return $.extend({
        buttonCls: 'bbn-table-command-',
        buttonDone: 'bbn-table-button',
        selectDone: 'bbn-table-select',
        widgetName: "DataTable",
        toolbarDone: [],
        tmpRow: false,
        originalRow: false,
        editedRow: false,
        editedTr: false,
        cols: [],
        table: false
      }, bbn.vue.treatData(this));
    },
    methods: {
      getRow(where){
        var vm = this,
            retrieved = false,
            res = this.widget.row(function(idx, data, tr){
              if ( !retrieved ){
                var cfg = {
                  idx: idx,
                  data: data,
                  tr: tr
                };
                switch ( typeof(where) ){
                  case 'object':
                    // DOM Element
                    if ( bbn.fn.isDom(where) ){
                      if ( tr === where ){
                        retrieved = cfg;
                        return true;
                      }
                      return false;
                    }
                    else{
                      var ok = true;
                      for ( var n in where ){
                        if ( where[n] !== data[n] ){
                          ok = false;
                        }
                      }
                      if ( ok ){
                        retrieved = cfg;
                      }
                      return ok;
                    }
                    break;

                  case 'number':
                    if ( where === idx ){
                      retrieved = cfg;
                      return true;
                    }
                    return false;
                    break;
                }
              }
            });
        if ( retrieved ){
          retrieved.obj = res;
        }
        return retrieved;
      },
      defaultDataSet(data){
        let res = [];
        $.each(this.cols, function(i, a){
          if ( a.field ){
            res.push(data[a.field] !== undefined ? data[a.field] : (a.default !== undefined ? a.default : ''));
          }
          else{
            res.push('');
          }
        });
        return res;
      },
      defaultRow(data){
        let data2 = this.defaultDataSet(data);
        let res = '<tr role="row">';
        if ( data2 ){
          $.each(data2, (i, v) => {
            res += '<td>' + v + '</td>';
          })
        }
        res += '</tr>';
        bbn.fn.log(data2, res);
        return res;
      },
      add(data){
        this.widget.rows().add([data]);
        this.widget.draw();
      },
      update(where, data, update){
        bbn.fn.log(where);
        var res = this.getRow(where);
        bbn.fn.log("UPDATE", res, where);
        if ( res ){
          if ( update ){
            data = $.extend({}, res.obj.data(), data);
          }
          res.obj.data(data);
        }
      },
      editRow(where){
        let vm = this,
            row = vm.getRow(where);
        bbn.fn.log("editRow");
        if ( row ){
          vm.editedRow = row.data;
        }
      },
      remove(where){
        var vm = this,
            res = this.getRow(where);
        if ( res ){
          res.obj.remove();
          vm.widget.draw();
        }
      },
      addTmp(data){
        var vm = this;
        if ( vm.tmpRow ){
          vm.removeTmp();
        }
        let row = $(this.defaultRow());
        bbn.fn.log(row, vm.table, vm.table.find("tbody:first"));
        vm.table.find("tbody:first").prepend(row);
        //vm.tmpRow = vm.widget.rows.add([vm.defaultDataSet(data)]);
        //vm.widget.draw();
      },
      removeTmp(){
        var vm = this;
        if ( vm.tmpRow ){
          vm.tmpRow.remove();
          vm.tmpRow = false;
          vm.widget.draw();
        }
      },
      editTmp(data, update){
        if ( this.tmpRow ){
          if ( update ){
            data = $.extend({}, this.tmpRow.data(), data);
          }
          this.tmpRow.data(data);
        }
      },
      buttons2String(buttons, field){
        const vm = this;
        let st = '';
        if ( $.isArray(buttons) ){
          $.each(buttons, function(k, b){
            if ( b.url ){
              st += '<a href="' + b.url + '">';
            }
            st += '<bbn-button class="' + vm.buttonCls +
              b.command  +
              (b.cls ? " " + b.cls : '') +
              '"' +
              (b.text ? ' text="' + b.text + '"' : '') +
              ' @click="command(\'' + b.command + '\', \'' +
              (field ? field : '') + '\')"' +
              ' :notext="' + (b.notext ? 'true' : 'false') + '"' +
              (b.icon ? ' icon="' + b.icon + '"' : '') +
              '></bbn-button> ';
            if ( b.url ){
              st += '</a>';
            }
          });
        }
        return st;
      },
      getColumns(){
        const vm = this;
        var res = [],
            /**
             * Number of fixed columns on the left
             * @type {number}
             *
             */
            fixedLeft = 0,
            /**
             * Number of fixed columns on the right
             * @type {number}
             */
            fixedRight = 0,
            /**
             * When false, will stop to look for fixed left columns
             * @type {boolean}
             */
            fixed = true;
        $.each(vm.cols, function(i, a){
          bbn.fn.log(a);

          if ( a.fixed && fixed ){
            fixedLeft++;
          }
          else if ( !a.fixed && fixed ){
            fixed = false;
          }
          else if ( a.fixed ){
            fixedRight++;
          }
          else if ( fixedRight ){
            fixedRight = 0;
          }
          var r = {
            data: a.field
          };
          if ( a.hidden ){
            r.visible = false;
          }
          if ( a.cls ){
            r.className = a.cls;
          }
          if ( a.title ){
            r.title = a.title;
          }
          if ( a.width ){
            r.width = typeof(a.width) === 'number' ? a.width + 'px' : a.width;
          }
          if ( a.source ){
            let obj = a.source;
            /** @todo Remove this case now that we have reactive properties */
            if ( typeof(a.source) === 'string' ){
              let v = vm;
              while ( v ){
                if ( v[a.source] !== undefined ){
                  obj = v;
                  break;
                }
                else{
                  v = v.$parent;
                }
              }
            }
            if ( obj ){
              r.render = function(data, type, row){
                if ( data ){
                  if ( $.isArray(obj[a.source]) ){
                    return bbn.fn.get_field(obj[a.source], 'value', data, 'text');
                  }
                  else if ( obj[a.source][data] !== undefined ){
                    return obj[a.source][data];
                  }
                  return bbn._("<em>?</em>");
                }
                return "<em>-</em>";
              }
            }
          }
          else if ( a.type ){
            switch ( a.type ){
              case "date":
                if ( a.format ){
                  r.render = function(data){
                    return data ? (new moment(data)).format(a.format) : '-';
                  };
                }
                r.render = function(data){
                  return data ? bbn.fn.fdate(data) : '-';
                };
                break;
              case "email":
                r.render = function(data, type, row){
                  return data ? '<a href="mailto:' + data + '">' + data + '</a>' : '-';
                };
                break;
              case "url":
                r.render = function(data, type, row){
                  return data ? '<a href="' + data + '">' + data + '</a>' : '-';
                };
                break;
              case "number":
                r.render = function(data, type, row){
                  return data ? kendo.toString(parseInt(data), "n0") + ( a.unit || vm.unit ? " " + ( a.unit || vm.unit ) : "") : '-';
                };
                break;
              case "money":
                r.render = function(data, type, row){
                  return data ?
                    bbn.fn.money(data) + (
                      a.unit || vm.currency ?
                        " " + ( a.unit || vm.currency )
                        : ""
                    )
                    : '-';
                };
                break;
              case "bool":
              case "boolean":
                r.render = function(data, type, row){
                  return data && (data !== 'false') && (data !== '0') ? bbn._("Yes") : bbn._("No");
                };
                break;
            }
          }
          else if ( a.buttons ){
            let buttons = a.buttons;
            if ( typeof(a.buttons) === 'string' ){
              try{
                buttons = eval(a.buttons);
              }
              catch ( e ){
                bbn.fn.log("Error parsing buttons", a.buttons, e);
              }
            }

            if ( $.isArray(buttons) ){
              r.render = function (data, field, row){
                return vm.buttons2String(buttons, field || '', row);
              };
            }
            else if ( $.isFunction(buttons) ){
              r.render = function (data, field, row){
                return vm.buttons2String(buttons(data, field, row), field || '', row);
              };
            }
          }
          else if ( a.render ){
            if ( $.isFunction(a.render) ){
              r.render = a.render;
            }
            else{
              var v = vm;
              while ( v ){
                if ( v[a.render] && $.isFunction(v[a.render]) ){
                  r.render = function(data, type, row){
                    return v[a.render](data, a.field, row);
                  };
                  break;
                }
                else{
                  v = v.$parent;
                }
              }
            }
            if ( !r.render ){
              r.render = function(data, type, row){
                var tmp = '(function(',
                    i = 0,
                    num = bbn.fn.countProperties(row);
                for ( var n in row ){
                  tmp += n;
                  i++;
                  if ( i !== num ){
                    tmp += ', ';
                  }
                  else{
                    tmp += '){ return (' + a.render + '); })(';
                    i = 0;
                    for ( var n in row ){
                      if ( typeof(row[n]) === 'string' ){
                        tmp += '"' + row[n].replace(/\"/g, '\\"') + '"';
                      }
                      else if ( typeof(row[n]) === "object" ){
                        tmp += JSON.stringify(row[n]);
                      }
                      else if ( row[n] === null ){
                        tmp += 'null'
                      }
                      else if ( row[n] === true ){
                        tmp += 'true'
                      }
                      else if ( row[n] === false ){
                        tmp += 'false'
                      }
                      else if ( row[n] === 0 ){
                        tmp += '0';
                      }
                      else{
                        tmp += row[n];
                      }
                      i++;

                      if ( i !== num ){
                        tmp += ', ';
                      }
                      else{
                        tmp += ');';
                      }
                    }
                    bbn.fn.log(tmp);
                  }
                }
                //bbn.fn.log(tmp);
                return eval(tmp);
              }
            }
          }
          res.push(r);
        });
        return res;
      },
      rowCallback(row, data, dataIndex){
        const vm = this;
        if ( vm.$options.propsData.trClass ){
          bbn.fn.log("trClass : ", vm.$options.propsData.trClass);
          if ( $.isFunction(vm.$options.propsData.trClass) ){
            var cls = vm.$options.propsData.trClass(data);
            if ( cls ){
              $(row).addClass(cls);
            }
          }
          else{
            $(row).addClass(vm.$options.propsData.trClass);
          }
        }
        if ( vm.$options.propsData.trCSS ){
          bbn.fn.log("trStyle : ", vm.$options.propsData.trCSS);
          if ( $.isFunction(vm.$options.propsData.trCSS) ){
            var cls = vm.$options.propsData.trCSS(data);
            if ( cls && (cls instanceof Object) ){
              $(row).css(cls);
            }
          }
          else if ( vm.$options.propsData.trCSS instanceof Object ){
            $(row).css(vm.$options.propsData.trCSS);
          }
        }
        vm.$nextTick(() => {
          new Vue({
            el: row,
            data: data,
            methods: {
              command(fn, field){
                bbn.fn.log(arguments);
                let vm0 = vm;
                while ( vm0 ){
                  if ( vm0 && vm0.$el && $.isFunction(vm0[fn]) ){
                    return vm0[fn](field ? data[field] : '', dataIndex, data);
                  }
                  vm0 = vm0.$parent;
                }
                throw new Error("Impossible to find the command " + fn)
              }
            },
            mounted(){
              const vm2 = this;
              vm.$nextTick(() => {
              })
            }
          });
        });
      },
      getFixedColumns(columns){
        const vm = this;
        var res = {},
          /**
           * Number of fixed columns on the left
           * @type {number}
           *
           */
          fixedLeft = 0,
          /**
           * Number of fixed columns on the right
           * @type {number}
           */
          fixedRight = 0;

        for ( var i = 0; i < columns.length; i++ ){
          if ( columns[i].fixed ){
            fixedLeft++;
          }
          else{
            break;
          }
        }
        for ( var i = columns.length - 1; i >= 0; i-- ){
          if ( columns[i].fixed ){
            fixedRight++;
          }
          else{
            break;
          }
        }
        if ( fixedLeft ){
          res.fixedColumns = {
            leftColumns: fixedLeft
          }
        }
        if ( fixedRight ){
          if ( !res.fixedColumns ){
            res.fixedColumns = {};
          }
          res.fixedColumns.rightColumns = fixedRight;
        }
        return res;
      },
      setHeight(){
        const vm = this;
        // Height calculation
        var $ele = $(vm.$el),
            h = $ele.height();
        $ele.children().height(h).children(".fg-toolbar").each(function(){
          $(this).find("select:visible:not('." + vm.selectDone +"')")
            .addClass(vm.selectDone)
            .kendoDropDownList();
          h -= $(this).outerHeight(true) || 0;
        });
        h -= ($ele.find(".dataTables_scrollHead:first").outerHeight(true) || 0);
        h -= ($ele.find(".dataTables_scrollFoot:first").outerHeight(true) || 0);
        h = Math.round(h);
        bbn.fn.log("H", h, ($ele.find(".dataTables_scrollHead:first").outerHeight(true) || 0), ($ele.find(".dataTables_scrollFoot:first").outerHeight(true) || 0));
        $(".dataTables_scrollBody", vm.$el)
        //.add($(settings.nScrollBody).siblings())
          .height(h)
          .css({maxHeight: h + "px"});
      },
      getConfig(){
        var
          /**
           * @type {bbn-table}
           */
          vm = this,
          /**
           * @type {HTMLElement}
           */
          $ele = $(this.$el),
          /**
           * Columns configuration
           * @type {[]}
           */
          columns = vm.getColumns();
        /**
         * The widget configuration
         * @type {{pageLength, asStripeClasses: [*], scrollY: number, scrollX: boolean, scrollCollapse: boolean, drawCallback: drawCallback}}
         */
        var cfg = {
          info: vm.info,
          paging: vm.pagination,
          searching: vm.search,
          /** @property Number of records to show */
          pageLength: this.cfg.take || 25,
          //lengthChange: false,
          /** @property Classes added on columns */
          asStripeClasses: ["", "k-alt"],
          /** @property The height of the table's body */
          scrollY: 300,
          /** @property  */
          deferRender: true,
          /** @property Do not expand cells to the whole table's height */
          scrollCollapse: true,
          /** @property Resize and restyle functions after draw */
          drawCallback: function(settings){
            // Be sure all is drawn
            // We need to resize the table to fit the container
            // Kendo styling
            $ele.find(".dataTables_filter input").addClass("k-textbox");
            $ele.find(".DTFC_Blocker:first").addClass("k-header");
            // Toolbar
            if ( vm.$options.propsData.toolbar ){
              var tb = vm.$options.propsData.toolbar,
                  tbEle = $ele.find(".fg-toolbar:first");
              if ( !$.isArray(tb) && (typeof(tb) === 'object') ){
                tb = [tb];
              }
              if ( $.isArray(tb) ){
                var target = $('<div class="bbn-table-toolbar"/>').prependTo(tbEle);
                $.each(tb, function(i, a){
                  var tmp = JSON.stringify(a);
                  if ( ($.inArray(tmp, vm.toolbarDone) === -1) && a.text && a.click ){
                    vm.toolbarDone.push(tmp);
                    target.append(
                      $('<button class="k-button"' + (a.disabled ? ' disabled="disabled"' : '' ) + '>' +
                        ( a.icon ? '<i class="' + a.icon + '" title="' + a.text + '"></i> &nbsp; ' : '' ) +
                        ( a.notext ? '' : a.text ) +
                        '</button>').click(function(){
                        if ( $.isFunction(a.click) ){
                          return a.click(vm);
                        }
                        else if ( typeof(a.click) === 'string' ){
                          if ( $.isFunction(vm.$parent[a.click]) ){
                            return vm.$parent[a.click](vm);
                          }
                          // Otherwise we check if there is a default function defined by the component
                          else if ( $.isFunction(vm[a.click]) ){
                            return vm[a.click](vm);
                          }
                        }
                      })
                    )
                  }
                })
              }
            }

            vm.setHeight(settings);
          }
        };
        if ( vm.pagination ){
          cfg.pageLength = vm.limit;
        }
        if ( vm.$options.propsData.source ){
          if ( typeof(vm.$options.propsData.source) === 'string' ){
            cfg.processing = true;
            cfg.serverSide =  true;
            cfg.ajax = {
              url: vm.$options.propsData.source,
              type: "POST"
            };
          }
          else if ( $.isArray(vm.$options.propsData.source) ){
            cfg.data = JSON.parse(JSON.stringify(vm.$options.propsData.source));
          }
          else if ( (typeof vm.$options.propsData.source === 'object') && $.isArray(vm.$options.propsData.source.data) ){
            cfg.data = JSON.parse(JSON.stringify(vm.$options.propsData.source.data));
          }
        }
        if ( vm.$options.propsData.toolbar === false ){
          cfg.sDom = "t";
        }
        if ( vm.$options.propsData.xscroll ){
          cfg.scrollX = true;
        }
        if ( columns.length ){
          cfg.columns = columns;
        }
        // Fixed columns
        $.extend(cfg, vm.getFixedColumns(columns));
        cfg.rowCallback = vm.rowCallback;
        return cfg;
      },
      addColumn(obj){
        const vm = this;
        vm.cols.push(obj);
      }
    },

    render(createElement){
      const vm = this;

      let table;

      if (
        vm.$slots.default &&
        vm.$slots.default.length &&
        vm.$slots.default[0].tag === 'table'
      ){
        table = vm.$slots.default[0];
        if ( !table.data ){
          table.data = {};
        }
        if ( !table.data.attrs ){
          table.data.attrs = {};
        }
        if ( !table.data.attrs ){
          table.data.attrs.class = table.data.attrs.class ? table.data.attrs.class + ' ' + 'k-grid' : 'k-grid';
        }
      }
      else{
        if ( !vm.rendered && !vm.cols.length ){
          // Examine the default slot, and if there are any parse
          // them and add the data to the workingList
          $.each(vm.columns, function(i, obj){
            vm.addColumn(obj);
          });
        }
        let cols = [],
            tableCfg = {
              'class': {
                'k-grid': true
              }
            },
            theadCfg = {};
        $.each(vm.cols, (i, obj) => {
          let cfg = {
                ref: "col-" + i,
                domProps: {
                  innerHTML: obj.title
                },
                'class': {
                  'bbn-column': true,
                  'k-header': true,
                  'k-last': i === (vm.cols.length - 1),
                  'k-first': i === 0
                }
              },
              title_cfg = {
                ref: "title-" + i,
                'class': {
                  'k-link': true
                },
                domProps: {
                  innerHTML: obj.title
                }
              },
              selected_cfg = {
                ref: "selector-" + i,
                'class': {
                  'bbn-tabnav-selected': true
                },
              };
          if ( obj.bcolor ){
            cfg.style = {
              backgroundColor: obj.bcolor
            };
          }
          if ( obj.fcolor ){
            if ( !cfg.style ){
              cfg.style = {};
            }
            cfg.style.color = obj.fcolor;
            title_cfg.style = {
              color: obj.fcolor
            };
            selected_cfg.style = {
              backgroundColor: obj.fcolor
            };
          }
          cols.push(createElement('th', cfg));
        });
        table = createElement('table', tableCfg, [
          createElement('thead', theadCfg, [
            createElement("tr", {}, cols)
          ]),
          createElement('tbody')
        ]);
      }
      vm.rendered = true;



      return createElement('div', {
        'class': {
          'bbn-table': true,
          'k-widget': true
        }
      }, [table]);
    },

    created(){
      var vm = this;
      // Adding bbn-column from the slot
      if (vm.$slots.default){
        for ( var node of this.$slots.default ){
          bbn.fn.log("TRYING TO ADD COLUMN", node);
          if (
            node.componentOptions &&
            (node.componentOptions.tag === 'bbn-column')
          ){
            bbn.fn.log("ADDING COLUMN", node.componentOptions.propsData)
            vm.addColumn(node.componentOptions.propsData);
          }
          else if ( (node.tag === 'bbn-column') && node.data && node.data.attrs ){
            bbn.fn.log("ADDING COLUMN 2", node.data.attrs)
            vm.addColumn(node.data.attrs);
          }

        }
      }
    },
    mounted(){
      var vm = this,
          $ele = $(this.$el);

      /*
      if ( !$("table", this.$el).length ){
        $ele.append('<table><thead><tr></tr></thead></table>');
        var thead = $ele.find("thead tr:first");
        $.each(vm.columns, function(i, a){
          thead.append($('<th/>').attr(a));
        })
      }
      else if ( !$ele.find("table:first > tbody > tr").length ){
        $ele.find("table:first > thead > tr:last > th").each(function (i, col){
          vm.columns[i] = bbn.fn.getAttributes(col);
          if ( vm.columns[i].style ){
            delete vm.columns[i].style;
          }
          if ( vm.columns[i].class ){
            delete vm.columns[i].class;
          }
        });
      }
      */
      vm.widgetCfg = vm.getConfig();
      vm.widget = $ele.find("table:first").addClass("k-grid").DataTable(vm.widgetCfg);
      vm.$nextTick(() => {

      })
      vm.table = $ele.find(".dataTables_scrollBody table:first");
      let headBar = $ele.find("div.dataTables_scroll:first").prev();
      if ( headBar.is(".fg-toolbar") ){
        headBar.addClass("k-header k-grid-toolbar")
      }
      let footBar = $ele.find("div.dataTables_scroll:first").next();
      if ( footBar.is(".fg-toolbar") ){
        footBar.addClass("k-pager-wrap")
      }

      var resizeTimer;
      $(vm.$el).on("bbnResize", () => {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
          bbn.fn.log("Table resize");
          vm.setHeight();
          $(vm.$el).trigger("resize");
          //vm.widget.draw();
        }, 250);
      });
    },
    watch: {
      editedRow: {
        deep: true,
        handler(newVal, oldVal){
          if ( typeof(newVal) === 'object' ){
            var vm = this,
                change = {};
            if ( oldVal === false ){
              let row = vm.getRow(newVal);
              if ( row ){
                if ( vm.edit && $.isFunction(vm.edit) ){
                  vm.edit(newVal, row.index, vm);
                }
                vm.originalRow = $.extend({}, row.data);
                vm.editedTr = row;
              }
              vm.$emit("edit", newVal, row.index, vm);
            }
            else if ( vm.originalRow !== false ){
              for ( var n in vm.originalRow ){
                if ( newVal[n] !== vm.originalRow[n] ){
                  change[n] = newVal[n];
                }
              }
              if ( bbn.fn.countProperties(change) ){
                vm.emitInput(vm.editedTr.tr, change, true);
              }
              for ( var n in change ){
                vm.$set(vm.originalRow, n, newVal[n]);
              }
            }
          }
        }
      },
      source: function(val){
        var vm = this,
            data = (typeof val === 'object') && $.isArray(val.data) ? val.data : ( $.isArray(val) ? val : []);
        vm.$nextTick(function(){
          if ( this.widget ){
            this.widget.clear().rows.add(data);
            this.widget.draw();
          }
        })
      },
      /*cfg: function(){

       }*/
    }
  });

})(jQuery, bbn);
