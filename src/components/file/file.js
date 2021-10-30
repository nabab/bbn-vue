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
 
(bbn => {
  "use strict";

  Vue.component('bbn-file', {
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent],
    props: {
      extensions: {
        type: [Array, Function],
        default(){
          return []
        }
      },
      value: {
        type: [Array, String],
        default(){
          return [];
        }
      },
      saveUrl: {
        type: String,
        default: null
      },
      removeUrl: {
        type: String,
        default: null
      },
      autoUpload : {
        type: Boolean,
        default: true
      },
      multiple: {
        type: Boolean,
        default: true
      },
      disabled: {
        type: Boolean,
        default: false
      },
      thumbNot : {
        type: String
      },
      maxSize: {
        type: Number,
        default: null
      },
      thumbWaiting: {
        type: String
      },
      json: {
        type: Boolean,
        default: false
      },
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
      icon: {
        type: String,
        default: 'nf nf-fa-upload'
      }
    },
    data(){
      return {
        uploading: false,
        progress: 0,
        widget: null,
				isEnabled: !this.disabled,
        widgetValue: [],
        files: new fd.FileList
      };
    },
    computed: {
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
      getExtension(file){
        if ( file.name ){
          let bits = file.name.split('.');
          return bits[bits.length-1].toLowerCase()
        }
        return '';
      },
      isAllowed(file){
        if ( !this.extensions.length ){
          return true;
        }
        return (bbn.fn.isFunction(this.extensions) ? this.extensions() : this.extensions).indexOf(this.getExtension(file)) > -1;
      }
    },
    mounted(){
      this.ready = true;
      this.$nextTick(() => {
        /*
        if ( !this.window ){
          this.window = bbn.vue.closest(this, "bbn-floater");
        }
        if ( !this.tab ){
          this.tab = bbn.vue.closest(this, "bbns-tab");
        }
        this.widget = new qq.FineUploader(this.getCfg);
        if ( this.value && this.getSource ){
          this.widget.addInitialFiles(this.getSource);
        }
        if ( this.disabled ){
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
          if ( !this.disabled ){
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
      enabled(val){
				this.isEnabled = !val;
      },
			isEnabled(val){
				this.enable(val);
			},
      widgetValue(val){
        this.$emit('input', this.getValue);
        this.$emit('change', this.getValue);
      }
    }
  });

})(bbn);
