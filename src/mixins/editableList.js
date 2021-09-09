((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * editableListComponent
     * @component editableListComponent
     */
    editableListComponent: {
      props: {
        /**
         * If defined, the form created for the edit of the table will have this URL as action.
         * @prop {String} url
         */
        url: {
          type: String
        },
        /**
         * Defines the editor to use when a item is in edit mode.
         * @prop {String|Object} editor
         */
        editor: {
          type: [String, Object, Function]
        },
        /**
         * Set to true allows to edit inline the fields if no buttons are defined for the table.
         * @prop {Boolean|String|Function} editable
         */
        editable: {
          type: [Boolean, String, Function],
          default: false,
          validator: e => bbn.fn.isFunction(e) || (typeof e === 'boolean') || ['inline', 'popup', 'nobuttons'].includes(e)
        },
        /**
         * Auto saves the row when edit-mode is 'inline'
         * @prop {Boolean} [false] autoSave
         */
        autoSave: {
          type: Boolean,
          default: false
        },
        /**
         * Automatically resets the original values ​​when edit-mode is 'inline'
         * @prop {Boolean} [false] autoReset
         */
        autoReset: {
          type: Boolean,
          default: false
        }
      },
      data(){
        let editable = bbn.fn.isFunction(this.editable) ? this.editable() : this.editable;
        return {
          /**
           * @data {String} editMode
           */
          editMode: editable === true ? (this.editor ? 'popup' : 'inline') : (editable === 'popup' ? 'popup' : 'inline'),
          /**
           * @data {Boolean|Object} [false] tmpRow
           */
          tmpRow: false,
          /**
           * @data {Boolean|Object} [false] originalRow
           */
          originalRow: false,
          /**
           * @data {Boolean|Object} [false] editedRow
           */
          editedRow: false,
          /**
           * @data {Boolean|Number} [false] editedIndex
           */
          editedIndex: false,
        }
      },
      computed: {
        /**
         * Return true if the table isn't ajax, is editable and the edit mode is 'inline'.
         * @computed isBatch
         * @returns {Boolean}
         */
        isBatch() {
          return this.editable && (this.editMode === 'inline') && !this.isAjax
        },
        /**
         * If the computed isBatch is true, return an array of modified rows.
         * @computed modifiedRows
         * @returns {Array}
         */
        modifiedRows() {
          let res = [];
          if (this.isBatch) {
            bbn.fn.each(this.currentData, (d, i) => {
              if (JSON.stringify(d.data) !== JSON.stringify(this.originalData[i])) {
                res.push(d);
              }
            })
          }
          return res;
        },
      },
      methods: {
        _defaultRow(data){
          return data || {};
        },
        /**
         * Creates the object tmpRow.
         *
         * @method _addTmp
         * @param data
         * @returns {Vue}
         */
        _addTmp(data) {
          this._removeTmp().tmpRow = this._defaultRow(data);
          this.$emit('addTmp', this.tmpRow);
          return this;
        },
        /**
         * Changes the values of tmpRow to false.
         * @method _removeTmp
         * @returns {Vue}
         */
        _removeTmp() {
          if (this.tmpRow) {
            this.tmpRow = false;
          }
          return this;
        },
        /**
         * Returns true if the row corresponding to the given index has changed respect to originalData.
         * @method isModified
         * @param {Number} idx
         * @returns {Boolean}
         */
        isModified(idx) {
          if (!this.originalData) {
            return false;
          }
          let data = [],
              orig;
          if (idx === undefined) {
            data = bbn.fn.map(this.currentData, d => d.data);
            orig = this.originalData;
          }
          else {
            data = bbn.fn.getField(this.currentData, 'data', {index: idx}),
            orig = this.originalData[idx];
          }
          return JSON.stringify(data) !== JSON.stringify(orig);
        },
        /**
         * Adds the given data to the object tmpRow and opens the popup with the form to insert the row.
         * @method insert
         * @param {Object} data
         * @param {Object} options
         * @param {Number} index
         * @fires _addTmp
         * @fires edit
         */
        insert(data, options, index) {
          let d = data ? bbn.fn.clone(data) : {};
          if (this.uid && d[this.uid]) {
            delete d[this.uid];
          }
          this._addTmp(d, index);
          this.edit(this.tmpRow, options, index);
        },
        /**
         * Adds the given data to the object tmpRow and opens the popup with the form to copy the row.
         * @method copy
         * @param {Object} data
         * @param {Object} options
         * @param {Number} index
         * @fires _addTmp
         * @fires edit
         */
        copy(data, options, index) {
          let r = bbn.fn.clone(data);
          if (this.uid && r[this.uid]) {
            delete r[this.uid];
          }
          this._addTmp(r);
          this.edit(this.tmpRow, options, index);
        },
        /**
         * Opens the popup containing the form to edit the row.
         * @method edit
         * @param {Object} row
         * @param {String|Object} winOptions
         * @param {Number} index
         * @fires _addTmp
         */
        edit(row, winOptions, index) {
          if (!this.editable) {
            throw new Error("The component is not editable, you cannot use the edit function");
          }
          if ( !winOptions ){
            winOptions = {};
          }
          if (!row) {
            this._addTmp();
            row = this.tmpRow;
          }
          this.originalRow = bbn.fn.clone(row);
          // EditedRow exists from now on the time of the edition
          this.editedRow = row;
          this.editedIndex = bbn.fn.isFunction(this.getDataIndex) ? this.getDataIndex(index) : index;
          if (this.editMode === 'popup') {
            if (typeof (winOptions) === 'string') {
              winOptions = {
                title: winOptions
              };
            }
            if (!winOptions.height) {
              //winOptions.height = (this.cols.length * 2) + 'rem'
            }
            if (winOptions.maximizable === undefined) {
              winOptions.maximizable = true;
            }
            let popup = bbn.fn.extend({
              source: {
                row: row,
                data: bbn.fn.isFunction(this.data) ? this.data() : this.data
              }
            }, {
              title: bbn._('Row edition'),
              width: 700
            }, winOptions ? winOptions : {});
            // A component is given as global editor (form)
            if (this.editor) {
              popup.component = bbn.fn.isFunction(this.editor) ? this.editor(row, index) : this.editor;
            }
            // A URL is given and in this case the form will be created automatically with this URL as action
            else if (this.url) {
              let table = this;
              let o = bbn.fn.extend({}, this.data, {
                action: table.tmpRow ? 'insert' : 'update'
              });
              popup.component = {
                data() {
                  let fields = [];
                  table.cols.map((a) => {
                    let o = bbn.fn.extend(true, {}, a);
                    if (o.ftitle) {
                      o.title = o.ftitle;
                    }
                    fields.push(o);
                  });
                  return {
                    // Table's columns are used as native form config
                    fields: fields,
                    data: row,
                    obj: o
                  }
                },
                template: `
  <bbn-form action="` + table.url + `"
            :schema="fields"
            :scrollable="false"
            :source="data"
            :data="obj"
            @success="success"
            @failure="failure">
  </bbn-form>`,
                methods: {
                  success(d, e) {
                    e.preventDefault();
                    if (table.successEdit(d)) {
                      table.getPopup().close();
                    }
                  },
                  failure(d) {
                    table.$emit('editFailure', d);
                  },
                },
              };
            } else {
              throw new Error(bbn._("Impossible to open a window if either an editor or a URL is not set"))
            }
            popup.afterClose = () => {
              //  this.currentData.push(bbn.fn.clone( this.tmpRow)); // <-- Error. This add a new row into table when it's in edit mode
              this._removeTmp();
              this.editedRow = false;
              this.editedIndex = false;
            };
            this.getPopup().open(popup);
          }
        },
        /**
         * Cancels the changes made on the row data.
         * @method cancel
         * @fires _removeTmp
         */
        cancel() {
          if (this.tmpRow) {
            this._removeTmp();
          }
          else if (this.editedRow && this.originalRow) {
            if (this.currentData[this.editedIndex]) {
              this.currentData[this.editedIndex].data = this.originalRow;
            }
          }
          this.originalRow = false;
          this.editedRow = false;
          this.editedIndex = false;
        },
        /**
         * Insert or update a row in originalData.
         * @method saveRow
         * @emit saverow
         */
        saveRow() {
          // New insert
          let ev = new Event('saverow', {cancelable: true});
          this.$emit('saverow', this.tmpRow || this.editedRow, ev);
          if (!ev.defaultPrevented) {
            if (this.tmpRow) {
              let row = bbn.fn.clone(this.tmpRow);
              this.currentData.push({
                data: row,
                index: this.currentData.length
              });
              if (this.originalData) {
                this.originalData.push(bbn.fn.clone(row));
              }
              if (bbn.fn.isArray(this.source)) {
                this.source.push(row);
              }

              this.tmpRow = false;
            }
            // Update
            else if (this.editedRow) {
              let row = bbn.fn.clone(this.editedRow);
              this.$set(this.currentData[this.editedIndex], 'data', row);
              if (this.originalData) {
                let or = this.originalData.splice(this.editedIndex, 1, bbn.fn.clone(row));
                if (bbn.fn.isArray(this.source)) {
                  let idx = bbn.fn.search(this.source, or[0]);
                  if (idx > -1) {
                    this.source.splice(idx, 1, row);
                  }
                }
              }
              else if (bbn.fn.isArray(this.source) && this.uid && this.source[this.uid]) {
                let idx = bbn.fn.search(this.source, {[this.uid]: this.source[this.uid]});
                if (idx > -1) {
                  this.source.splice(idx, 1, row);
                }
              }

              this.editedRow = false;
            }
            return true;
          }
          return false;
        },
        /**
         * If the prop url of the table is defined makes a post to the url to update or insert the row, else fires the method saveRow to insert or update the row in originalData.
         * @method saveInline
         * @fires saveRow
         *
         */
        saveInline() {
          if (this.tmpRow || this.editedRow) {
            if (this.url) {
              let o = bbn.fn.extend({}, this.data, this.tmpRow || this.editedRow, {
                action: this.tmpRow ? 'insert' : 'update'
              });
              this.post(this.url, o, (d) => {
                this.successEdit(d);
              })
            }
            else {
              let d = bbn.fn.clone(this.tmpRow || this.editedRow);
              if (this.saveRow()) {
                this.$emit(this.tmpRow ? 'insert' : 'edit', d);
              }
            }
          }
        },
        /**
         * After the post in case of edit of the row, update the row in originalData.
         *
         * @method successEdit
         * @param {Object} d
         * @emit editSuccess
         * @fires saveRow
         * @returns {Boolean}
         */
        successEdit(d) {
          if (bbn.fn.isObject(d)) {
            if ((d.success !== undefined) && !d.success) {
              if (window.appui) {
                let ev = new Event('editFailure', {cancelable: true});
                this.$emit('editFailfure', d, ev);
                if (!ev.defaultPrevented) {
                  appui.error();
                }
              }
            }
            else {
              let ev = new Event('editSuccess', {cancelable: true});
              this.$emit('editSuccess', d, ev);
              if (!ev.defaultPrevented) {
                if (d.data) {
                  bbn.fn.iterate(d.data, (o, n) => {
                    this.editedRow[n] = o;
                  });
                }
                this.saveRow();
                return true;
              }
            }
          }
          return false;
        },
        /**
         * @ignore
         * @method saveTmp
         */
        saveTmp() {},
        saveEditedRow() {},
        cancelEditedRow() {},
      },
      /**
       * Adds the class 'bbn-editable-list-component' to the component.
       * @event created
       * @memberof editableListComponent
       */
      created(){
        this.componentClass.push('bbn-editable-list-component');
      },
      watch: {
        /**
         * @watch editedRow
         */
        editedRow(newVal) {
          if (newVal === false) {
            this.editedIndex = false;
          }
        }
      }
    }
  });
})(bbn);