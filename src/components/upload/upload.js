/**
  * @file bbn-upload component
  *
  * @description bbn-upload is a component that allows users to send files from their file system by selecting it, using drag and drop or with a keyboard shortcut.
  *
  * @author Mirko Argentino
  *
  * @copyright BBN Solutions
  *
  * @cretaed 13/06/2017
  */

 return {
    /**
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.basic
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.input
    ],
    props: {
      /**
       * @prop {Boolean} [true] showList
       */
      showList: {
        type: Boolean,
        default: true
      },
      /**
       * The value of the component.
       * @prop {Array|String} [[]] value
       */
      value: {
        type: [Array, String],
        default(){
         return [];
        }
      },
      /**
       * The URL for the action 'save'.
       * @prop {String} [null] saveUrl
       */
      saveUrl: {
        type: String,
        default: null
      },
      /**
       * The URL for the action 'delete'.
       * @prop {String} [null] removeUrl
       */
      removeUrl: {
        type: String,
        default: null
      },
      /**
       * The URL for the action 'download'.
       * @prop {String} [null] downloadUrl
       */
      downloadUrl: {
        type: String,
        default: null
      },
      /**
       * Set to true to automatically upload selected files.
       * @prop {Boolean} [true] autoUpload
       */
      autoUpload : {
        type: Boolean,
        default: true
      },
      /**
       * Set to true to allow the upload of multiple files.
       * @prop {Boolean} [true] multiple
       */
      multiple: {
        type: Boolean,
        default: true
      },
      /**
       * Tha maximum number of files. 0 for infinite.
       * @prop {Number} [0] max
       */
      max: {
        type: Number,
        default: 0
      },
      /**
       * Set to true to disable the component.
       * @prop {Boolean} [false] disabled
       */
      disabled: {
        type: Boolean,
        default: false
      },
      /**
       * Set it to true if you want to be able to edit the filename.
       * @prop {Boolean} [false] editable
       */
      editable: {
        type: Boolean,
        default: false
      },
      /**
       * True if you want the possibility to download a file.
       * @prop {Boolean} [false] downloadable
       */
      downloadable: {
        type: Boolean,
        default: false
      },
      /**
       * True if you want the possibility to delete a file.
       * @prop {Boolean} [true] eliminable
      */
      eliminable: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Boolean} [true] uploadable
       */
      uploadable: {
        type: Boolean,
        default: true
      },
      /**
       * Shows the file's icon.
       * @prop {Boolean} [true] icons
       */
      icons: {
        type: Boolean,
        default: true
      },
      /**
       * Shows the preview image of the file uploaded.
       * @prop {Boolean} [false] thumbs
       */
      thumbs: {
        type: Boolean,
        default: false
      },
      /**
       * The maximum size of the thumb.
       * @prop {Number} [60] maxSize
       */
      maxSize: {
        type: Number,
        default: 60
      },
      /**
	     * The text shown during the file's transfer.
       * @prop {String} thumbWaiting
       */
      thumbWaiting: {
        type: String
      },
      /**
	   * Set to true to convert the value as JSON.
       * @prop {Boolean} [false] json
       */
      json: {
        type: Boolean,
        default: false
      },
      /**
       * An object to customize the default text.
       * @prop {Object} text
       */
      text: {
        type: Object,
        default(){
          return {}
        }
      },
      /**
       * The icon displayed on the upload button.
       * @prop {String} ['nf nf-fa-upload'] icon
       */
      icon: {
        type: String,
        default: 'nf nf-fa-upload'
      },
      /**
       * The array of accepted extensions.
       * @prop {Array} [[]] extensions
       */
      extensions: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * The  accepted types of files.
       * @prop {String} [*] accept
       */
      accept: {
        type: String,
        default: '*'
      },
      /**
       * Set to false to disable the 'paste' function.
       *
       * @prop {Boolean} [true] paste
       */
      paste: {
        type: Boolean,
        default: false
      },
      /**
       * Set to false to disable the 'drang&drop' function.
       *
       * @prop {Boolean} [true] dragDrop
       */
      dragDrop: {
        type: Boolean,
        default: true
      },
      /**
       * Additional data sent with the ajax call.
       *
       * @prop {Object} data
       */
      data: {
        type: Object
      },
      /**
       * Shows or not the files' size on the list.
       * @prop {Boolean} [true] showFilesize
       */
      showFilesize: {
        type: Boolean,
        default: true
      }
    },
    data(){
      return {
        /**
         * The current files.
         *  @data {Array} [[]] currentData
         */
        currentData: [],
        /**
         * Indicates if an uploading is running.
         *  @data {Boolean} [false] uploading
         */
        uploading: false
      };
    },
    computed: {
      /**
       * An object of default text.
       *
       * @computed text
       * @return Object
       */
      currentText(){
        return bbn.fn.extend({
          uploadButton: bbn._('Choose files'),
          dropHere: bbn._('Drop files here'),
          pasteContainer: bbn._('Click on the container and then press CTRL+V keys to paste the file'),
          uploadOrDrop: bbn._('Choose files or drop files here'),
          retry: bbn._('Retry'),
          editFilename: bbn._('Edit filename'),
          remove: bbn._('Delete'),
          removeConfirm: bbn._('Are you sure you want to delete this file?'),
          empty: bbn._('no files'),
          download: bbn._('Download'),
          save: bbn._('Save'),
          cancel: bbn._('Cancel'),
          filename: bbn._('Write the filename without the extension'),
          upload: bbn._('Upload')
        }, this.text);
      },
      /**
       * Shows you can add more files.
       * @computed canAddFile
       * @return Boolean
       */
      canAddFile(){
        return this.uploadable && !this.uploading && (this.multiple && (!this.max || (this.filesCount < this.max))) || (!this.multiple && !this.filesCount)
      },
      /**
       * A list of files with the status 'ready'.
       * @computed filesReady
       * @return Array
       */
      filesReady(){
        return this.currentData.filter(d => {
          return d.status === 'ready'
        })
      },
      /**
       * A list of files with the status 'progress'.
       * @computed filesProgress
       * @return Array
       */
      filesProgress(){
        return this.currentData.filter(d => {
          return d.status === 'progress'
        })
      },
      /**
       * A list of files with the status 'error'.
       * @computed filesError
       * @return Array
       */
      filesError(){
        return this.currentData.filter(d => {
          return d.status === 'error'
        })
      },
      /**
       * A list of files with the status 'success'.
       * @computed filesSuccess
       * @return Array
       */
      filesSuccess(){
        return this.currentData.filter(d => {
          return d.status === 'success'
        })
      },
      /**
       * The sum of the files withe the statuses 'ready, 'progress' and 'success'.
       * @computed filesCount
       * @return Number
       */
      filesCount(){
        return this.filesReady.length + this.filesProgress.length + this.filesSuccess.length
      },
      /**
       * Shows if it is not disabled and not readonly.
       * @computed isEnabled
       * @return Boolean
       */
      isEnabled(){
        return !this.isDisabled && !this.readonly
      }
    },
    methods: {
      /**
       * Sets the given status to the file with the given id.
       * @method _setStatus
       * @param {Number} id
       * @param {String} status
       * @return Boolean
       */
      _setStatus(id, status){
        if ( id ){
          let idx = bbn.fn.search(this.currentData, {id: id})
          if ( idx > -1 ){
            this.$set(this.currentData[idx], 'status', status)
            return true
          }
        }
        return false
      },
      /**
       * Makes an object with the file's info.
       * @method _makeFile
       * @param {Object|File} file
       * @param {Boolean} fromUser
       * @param {String} status
       * @param {Boolean} fromPaste
       * @return Object
       */
      _makeFile(file, fromUser, status, fromPaste){
        return {
          id: bbn.fn.randomInt(1000, 9999),
          data: file,
          status: status || 'ready',
          fromUser: fromUser,
          fromPaste: !!fromPaste,
          edit: false,
          progress: 0
        }
      },
      /**
       * The method used to makes the files and to upload them if necessary.
       * @method _makeFiles
       * @param {Array} files
       * @param {Boolean} fromUser
       * @param {String} status
       * @fires _filterFiles
       * @fires _makeFile
       * @fires _addFile
       * @fires upload
       */
      _makeFiles(files, fromUser, status){
        if ( !this.ready || !this.isDisabled ){
          if ( files instanceof FileList ){
            files = Object.values(files)
          }
          files = this._filterFiles(bbn.fn.map(files, file => {
            return this._makeFile(file, fromUser, status)
          }))
          bbn.fn.each(files, file => {
            if ( !this.ready || this.canAddFile ){
              this._addFile(file)
            }
          })
          if ( this.ready && this.autoUpload ){
            this.$nextTick(() => {
              this.upload()
            })
          }
        }
        if ( this.getRef('fileInput') ){
          this.getRef('fileInput').value = null
        }
      },
      /**
       * Adds a file to the currentData property.
       * @method _addFile
       * @param {Object} file
       */
      _addFile(file){
        this.currentData.push(file)
      },
      /**
       * Removes the given file from the currentData property.
       * @method _remove
       * @param {Object} file
       * @emits remove
       * @fires setValue
       */
      _remove(file, res){
        let idx = bbn.fn.search(this.currentData, {id: file.id})
        if ( idx > -1 ){
          this.currentData.splice(idx, 1)
          this.$emit('remove', file.id, res, false);
          this.$nextTick(() => {
            this.setValue()
          })
        }
      },
      /**
       * Filters the give files.
       * @method _filterFiles
       * @param {Array} files
       * @emits error
       * @return Array
       */
      _filterFiles(files){
        return bbn.fn.filter(files, file => {
          if ( !file.data.name || ((file.data.size !== undefined) && !file.data.size) ){
            return false
          }
          if ( bbn.fn.getRow(this.currentData, {'data.name': file.data.name}) ){
            if ( file.fromUser ){
              this.$emit('error', {file: file.data.name, message: bbn._('The file exists!')})
              this.alert(bbn._('The file') + ` "${file.data.name}" ` + bbn._('exists') + '!')
            }
            return false
          }
          if ( bbn.fn.isArray(this.extensions) && this.extensions.length ){
            let ext = file.data.name.substring(file.data.name.lastIndexOf('.')+1).toLowerCase(),
                extensions = bbn.fn.map(this.extensions, e => {
                  return e.toLowerCase();
                });
            if ( !extensions.includes(ext) ){
              if ( file.fromUser ){
                this.$emit('error', {file: file.data.name, message: bbn._('The extension') + ` "${ext}" ` + bbn._('is not allowed') + '!'})
                this.alert(bbn._('The extension') + ` "${ext}" ` + bbn._('is not allowed') + '!')
              }
              return false
            }
          }
          return true
        })
      },
      /**
       * Returns a knowed object structure of the given file.
       * @method _getData
       * @param {Object} file
       * @return Object
       */
      _getData(file){
        if ( file.data ){
          return {
            name: file.data.name,
            size: file.data.size,
            extension: file.data.name.substring(file.data.name.lastIndexOf('.'))
          }
        }
        return {}
      },
      /**
       * Returns the current value. If it is in the JSON format, it's converted.
       * @method getValue
       * @return Array
       */
      getValue(){
        let res;
        if ( (typeof this.value === 'string') && this.json ){
          res = JSON.parse(this.value)
        }
        else if ( bbn.fn.isArray(this.value) ){
          res = this.value
        }
        return bbn.fn.isArray(res) ? res : []
      },
      /**
       * The method called when the user select or drop files.
       * @method filesChanged
       * @fires _makeFiles
       */
      filesChanged(e){
        if ( e.target.files.length ){
          this._makeFiles(e.target.files, true)
        }
      },
      /**
       * Uploads the file with the given id or all files with the status 'ready'.
       * @method upload
       * @param {Number} id
       * @fires setStatusProgress
       * @fires setName
       * @fires setStatusSuccess
       * @fires setStatusError
       * @emits success
       * @emits failure
       */
      upload(id){
        if ( this.uploadable && this.filesReady.length ){
          this.uploading = true;
          if ( id ){
            this.setStatusProgress(id);
          }
          else {
            bbn.fn.each(this.filesReady, fr => {
              this.setStatusProgress(fr.id);
            });
          }
          this.$nextTick(() => {
            bbn.fn.each(this.filesProgress, fr => {
              if ( (id === undefined) || (fr.id === id) ){
                if ( this.saveUrl ){
                  let ev = new Event('beforeUpload', {cancelable: true});
                  this.$emit('beforeUpload', ev, fr);
                  if ( !ev.defaultPrevented ){
                    bbn.fn.upload(
                      this.saveUrl,
                      bbn.fn.extend(true, {}, this.data ? this.data : {}, {file: fr.data}),
                      res => {
                        let f = false;
                        if ( res.data.file || res.data.fichier ){
                          f = res.data.file || res.data.fichier
                        }
                        else if (
                          res.data.data &&
                          (res.data.data.file || res.data.data.fichier)
                        ){
                          f = res.data.data.file || res.data.data.fichier
                        }
                        if ( f && f.name !== fr.data.name ){
                          this.setName(fr.id, f.name, false)
                        }
                        if ( this.setStatusSuccess(fr.id) ){
                          this.$nextTick(() => {
                            this.$emit('success', fr.id, f.name || fr.data.name, res.data, res)
                          })
                        }
                      },
                      err => {
                        if ( this.setStatusError(fr.id) ){
                          this.$emit('error', fr.id, err)
                          bbn.fn.log('bbn-upload error', fr.id, err)
                        }
                      },
                      prog => {
                        this.setProgress(fr.id, prog)
                      }
                    )
                  }
                }
                else {
                  if ( this.setStatusSuccess(fr.id) ){
                    this.$nextTick(() => {
                      this.$emit('success', fr.id, fr.data.name, fr.data)
                    })
                  }
                }
              }
            })
          })
        }
      },
      /**
       * Sets the name to the file with the given id.
       * @method setName
       * @param {Number} id
       * @param {String} name
       * @return Boolean
       */
      setName(id, name, setVal = true){
        if ( id && name ){
          let idx = bbn.fn.search(this.currentData, {id: id})
          if ( idx > -1 ){
            if ( this.currentData[idx].fromUser ){
              const newFile = new File([this.currentData[idx].data], name, {type: this.currentData[idx].data.type})
              this.$set(this.currentData[idx], 'data', newFile)
            }
            else {
              this.$set(this.currentData[idx].data, 'name', name)
            }
            if ( setVal ){
              this.$nextTick(() => {
                this.setValue()
              })
            }
            return true
          }
        }
        return false
      },
      /**
       * Sets the status 'ready' to the file with the given id.
       * @method setStatusReady
       * @param id
       * @fires _setStatus
       * @return Boolean
       */
      setStatusReady(id){
        return this._setStatus(id, 'ready')
      },
      /**
       * Sets the status 'error' to the file with the given id.
       * @method setStatusError
       * @param id
       * @fires _setStatus
       * @return Boolean
       */
      setStatusError(id){
        return this._setStatus(id, 'error')
      },
      /**
       * Sets the status 'success' to the file with the given id.
       * @method setStatusSuccess
       * @param id
       * @fires _setStatus
       * @return Boolean
       */
      setStatusSuccess(id){
        return this._setStatus(id, 'success')
      },
      /**
       * Sets the status 'progress' to the file with the given id.
       * @method setStatusProgress
       * @param id
       * @fires _setStatus
       * @return Boolean
       */
      setStatusProgress(id){
        return this._setStatus(id, 'progress')
      },
      /**
       * Sets the value.
       * @method setValue
       * @emits input
       * @emits change
       */
      setValue(){
        let value = bbn.fn.map(this.filesSuccess, f => {
          if ( f.data instanceof File ){
            return {
              name: f.data.name,
              size: f.data.size,
              extension: bbn.fn.substr(f.data.name, f.data.name.lastIndexOf('.'))
            }
          }
          return bbn.fn.extend(true, {}, f.data, {
            size: f. data.size,
            extension: bbn.fn.substr(f.data.name, f.data.name.lastIndexOf('.'))
          });
        })
        this.emitInput(this.json ? JSON.stringify(value) : value)
        this.$emit('change', this.value);
      },
      /**
       * Sets the given progress value to to the file with the given id.
       * @method setProgress
       * @param {String} id
       * @param {Number} [0] progress
       */
      setProgress(id, progress = 0){
        if ( bbn.fn.isArray(this.currentData) && this.currentData.length ){
          let file = bbn.fn.getRow(this.currentData, {id: id})
          if ( bbn.fn.isObject(file) ){
            this.$set(file, 'progress', progress)
          }
        }
      },
      /**
       * Sets the given file to edit mode.
       * @method edit
       * @param {Object} file
       */
      edit(file){
        file.edit = bbn.fn.substr(file.data.name, 0, file.data.name.lastIndexOf('.'))
      },
      /**
       * Saves the change did to the filename.
       * @method saveEdit
       * @param {Object} file
       * @fires upload
       * @emits edit
       */
      saveEdit(file){
        const name = `${file.edit}.${this.getFileExt(file)}`;
        if ( file.edit && (file.name !== name) ){
          let old = bbn.fn.extend(true, {}, file.data)
          if ( file.fromUser ){
            const newFile = new File([file.data], name, {type: file.data.type})
            this.$set(file, 'data', newFile) 
          }
          else {
            this.$set(file.data, 'name', name) 
          }
          if ( file.fromPaste && (file.status === 'ready') ){
            this.upload(file.id)
          }
          else {
            this.$emit('edit', file.id, name, old.name)
          }
          this.$nextTick(() => {
            this.setValue()
          })
        }
        file.edit = false
      },
      /**
       * Exits from the edit mode.
       * @method cancelEdit
       * @param {Object} file
       */
      cancelEdit(file){
        if ( file.fromPaste && (file.status === 'ready') ){
          this.currentData.splice(bbn.fn.search(this.currentData, {id: file.id}), 1)
        }
        else {
          file.edit = false
        }
      },
      /**
       * Retries to upload the given file.
       * @method retry
       * @param {Object} file
       * @fires setStatusReady
       * @fires upload
       */
      retry(file){
        if ( this.setStatusReady(file.id) ){
          this.upload(file.id)
        }
      },
      /**\
       * Deletes the given file.
       * @method remove
       * @param {Object} file
       * @fires _remove
       */
      remove(file, force){
        let ev = new Event('beforeRemove', {cancelable: true});
        this.$emit('beforeRemove', ev, file);
        if (force || !ev.defaultPrevented) {
          this.confirm(this.currentText.removeConfirm, () => {
            if ( this.removeUrl ){
              this.post(
                this.removeUrl,
                bbn.fn.extend(true, {}, this.data ? this.data : {}, {file: file.data.name}),
                d => {
                  this._remove(file, d)
                }
              )
            }
            else {
              this._remove(file)
            }
          })
        }
      },
      /**
       * The method called on the paste event.
       * @method pasteEvent
       * @param {Event} event
       * @fires _makeFile
       * @fires _addFile
       */
      pasteEvent(event){
        if ( event.clipboardData.files.length && this.canAddFile ){
          let file = this._makeFile(event.clipboardData.files[0], true, 'ready', true)
          file.edit = ''
          this._addFile(file)
          this.$nextTick(() => {
            this.getRef('filenameInput').focus()
          })
        }
      },
      dropEvent(event){
        if ( !this.dragDrop ){
          event.preventDefault();
        }
      },
      /**
       * Downloads the given file.
       * @method download
       * @param {Object} file
       */
      download(file){
        if ( !!this.downloadable && !!this.downloadUrl ){
          this.postOut(
            this.downloadUrl,
            bbn.fn.extend(true, {}, this.data ? this.data : {}, {file: file.data.name})
          )
        }
      },
      /**
       * Gets the formatted file' size.
       * @method getFileSize
       * @param {Object} file
       * @return String
       */
      getFileSize(file){
        return bbn.fn.formatBytes(file.data.size)
      },
      /**
       * Gets the icon class by the file's extension.
       * @method getFileIcon
       * @param {Object} file
       * @return String
       */
      getFileIcon(file){
        switch ( this.getFileExt(file) ){
          case 'pdf':
            return 'nf nf-fa-file_pdf_o'
          case 'zip':
            return 'nf nf-fa-file_zip_o'
          case 'rar':
          case 'tar':
          case 'bz2':
          case 'gz':
          case '7z':
          case 'cab':
          case 'cab':
            return 'nf nf-fa-file_archive_o'
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
          case 'bmp':
          case 'svg':
            return 'nf nf-fa-file_image_o'
          case 'avi':
          case 'mov':
          case 'mkv':
          case 'mpg':
          case 'mpeg':
          case 'wmv':
          case 'mp4':
            return 'nf nf-fa-file_movie_o'
          case 'mp3':
          case 'wav':
            return 'nf nf-fa-file_sound_o'
          case 'php':
          case 'js':
          case 'html':
          case 'htm':
          case 'css':
          case 'less':
            return 'nf nf-fa-file_code_o'
          case 'txt':
          case 'rtf':
            return 'nf nf-fa-file_text_o'
          case 'doc':
          case 'docx':
          case 'odt':
            return 'nf nf-fa-file_word_o'
          case 'xls':
          case 'xlsx':
          case 'ods':
          case 'csv':
            return 'nf nf-fa-file_excel_o'
          case 'ppt':
          case 'pptx':
          case 'odp':
            return 'nf nf-fa-file_powerpoint_o'
          default:
            return 'nf nf-fa-file'
        }
      },
      /**
       * Gets the extension of the given file.
       * @method getFileExt
       * @param {Object} file
       * @return String
       */
      getFileExt(file){
        return file.fromUser ? file.data.name.substring(file.data.name.lastIndexOf('.')+1) : bbn.fn.substr(file.data.extension, 1)
      },
      /**
       * Gets the thumb url of the given file
       * @method getThumbURL
       * @param {Object} file
       * @return String
       */
      getThumbURL(file){
        return this.isFile(file) ?
          URL.createObjectURL(file.data) :
          (!!file.data.thumb && bbn.fn.isURL(file.data.thumb) ?
            file.data.thumb :
            ''
          );
      },
      /**
       * Check if the data property of the given file is an instance of File object
       * @method isFile
       * @param {Object} file
       * @return Boolean
       */
      isFile(file){
        return file.data instanceof File;
      }
    },
    /**
     * @event mounted
     * @fires _makeFiles
     * @fires getValue
     */
    mounted(){
      this.$nextTick(() => {
        if ( this.value ){
          this._makeFiles(this.getValue(), false, 'success')
        }
        this.ready = true
      })
    },
    watch: {
      /**
       * @watch value
       * @fires _makeFiles
       * @fires getValue
       */
      value: {
        deep: true,
        handler(newVal, oldVal){
          if ( !bbn.fn.isSame(newVal, oldVal) ){
            this.currentData.splice(0);
          }
          this.$nextTick(() => {
            this._makeFiles(this.getValue(), false, 'success')
          });
        }
      },
      /**
       * @watch filesSProgress
       * @emits complete
       * @fires setValue
       */
      filesProgress(newVal, oldVal){
        if ( !bbn.fn.isSame(newVal, oldVal) && !newVal.length ){
          this.uploading = false;
          if ( !this.filesError.length ){
            this.$emit('complete', this.filesSuccess, this.filesError)
            this.$nextTick(() => {
              this.setValue();
            })
          }
        }
      }
    }
  };
  