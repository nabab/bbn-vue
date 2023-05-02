 /**
  * @file bbn-file component
  *
  * @description
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 13/06/2017.
  */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.input
     */
    mixins:
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.input
    ],
    props: {
      /**
       * @prop {(Array|Function)} [[]] extensions
       */
      extensions: {
        type: [Array, Function],
        default(){
          return []
        }
      },
      /**
       * @prop {(Array|String)} [[]] value
       */
      value: {
        type: [Array, String],
        default(){
          return [];
        }
      },
      /**
       * @prop {String} [null] saveUrl
       */
      saveUrl: {
        type: String,
        default: null
      },
      /**
       * @prop {String} [null] removeUrl
       */
      removeUrl: {
        type: String,
        default: null
      },
      /**
       * @prop {Boolean} [true] autoUpload
       */
      autoUpload : {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Boolean} [true] multiple
       */
      multiple: {
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
       * @prop {String} thumbNot
       */
      thumbNot : {
        type: String
      },
      /**
       * @prop {Number} [null] maxSize
       */
      maxSize: {
        type: Number,
        default: null
      },
      /**
       * @prop {String} thumWaiting
       */
      thumbWaiting: {
        type: String
      },
      /**
       * @prop {Boolean} [false] json
       */
      json: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Object} [{}] lng
       */
      lng: {
        type: Object,
        default(){
          return {
            uploading: bbn._('uploading'),
            uploadButton: bbn._('Upload a file'),
            clickHere: bbn._('Or click here to'),
            pasteContainer: '<i class="nf nf-fa-paste bbn-xl"></i> Ctrl+V',
            dropHere: bbn._('Drop files here'),
            processingDropped: bbn._('Processing dropped files') + '...',
            retry: bbn._('Retry'),
            editFilename: bbn._('Edit filename'),
            remove: bbn._('Delete'),
            pause: bbn._('Pause'),
            cont: bbn._('Continue'),
            close: bbn._('Close'),
            no: bbn._('No'),
            yes: bbn._('Yes'),
            cancel: bbn._('Cancel'),
            ok: bbn._('OK'),
            browse: bbn._('Browse')
          }
        }
      },
      /**
       * @prop {String} ['nf nf-fa-upload'] icon
       */
      icon: {
        type: String,
        default: 'nf nf-fa-upload'
      }
    },
    data(){
      return {
        /**
         * @data {Boolean} [false] uploading
         */
        uploading: false,
        /**
         * @data {Number} [0] progress
         */
        progress: 0,
        /**
         * @data [null] widget
         */
        widget: null,
        /**
         * @data {Boolean} [true] isEnabled
         */
        isEnabled: !this.isDisabled,
        /**
         * @data {Array} [[]] widgedValue
         */
        widgetValue: [],
        /**
         * @data {fd.FileList} files
         */
        files: new fd.FileList
      };
    },
    computed: {
      /**
       * @computed fileList
       * @return {Array}
       */
      fileList(){
        let res = [];
        if ( this.files && this.files.length ){
          this.files.each(a => {
            res.push(a)
          })
        }
        return res;
      },
    },
    methods: {
      /**
       * @method getExtension
       * @param {Object} file
       * @return {string}
       */
      getExtension(file){
        if ( file.name ){
          let bits = file.name.split('.');
          return bits[bits.length-1].toLowerCase()
        }
        return '';
      },
      /**
       * @method isAllowed
       * @param {Object} file
       * @return {boolean}
       */
      isAllowed(file){
        if ( !this.extensions.length ){
          return true;
        }
        return (bbn.fn.isFunction(this.extensions) ? this.extensions() : this.extensions).indexOf(this.getExtension(file)) > -1;
      }
    },
    /**
     * @event mounted
     * @fires $nextTick
     */
    mounted(){
      this.ready = true;
      this.$nextTick(() => {
        /*
        if ( !this.window ){
          this.window = this.closest("bbn-floater");
        }
        if ( !this.tab ){
          this.tab = this.closest("bbns-tab");
        }
        this.widget = new qq.FineUploader(this.getCfg);
        if ( this.value && this.getSource ){
          this.widget.addInitialFiles(this.getSource);
        }
        if ( this.isDisabled ){
          this.enable(false);
        }
        */
        let widget = new FileDrop(this.getRef('zone'), {
          upload(){
            bbn.fn.log("UPL<ADING", arguments);
          },
          /* iframe: {
            url: this.saveUrl
          } */
          xRequestedWith: 'XMLHttpRequest'
        });
        widget.event('send', files => {
          if ( !this.isDisabled ){
            this.uploading = true;
            files.each(file => {
              if ( !this.isAllowed(file) ){
                appui.error(bbn._("This type of file is not allowed, only files of type") + ' ' + this.extensions.join(', '));
              }
              else if ( this.maxSize && ((file.size/1024/1024) > this.maxSize) ){
                appui.error(bbn._("The file si too big, the maximum size is") + ' ' + this.maxSize + 'MB');
              }
              else{
                file.event('done', xhr => {
                  this.uploading = false;
                  appui.success('Done uploading ' + file.name);
                });

                file.event('progress', (sent, total) => {
                  this.progress = Math.round(sent / total * 100);
                });

                file.sendTo(this.saveUrl, { xRequestedWith: 'XMLHttpRequest'});
                bbn.fn.log(file);
                this.files.push(file);
              }
            });
            if ( !this.files.length ){
              this.uploading = false;
            }
          }
        });

      });
    },
    watch: {
      /**
       * @watch enabled
       * @param {Boolean} val
       */
      enabled(val){
				this.isEnabled = !val;
      },
      /**
       * @watch isEnabled
       * @param {String} val
       */
			isEnabled(val){
				this.enable(val);
			},
      /**
       * @watch widgetValue
       * @param {String} val
       */
      widgetValue(val){
        this.$emit('input', this.getValue);
        this.$emit('change', this.getValue);
      }
    }
  };
