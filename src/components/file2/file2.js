/**
 * Created by BBN on 13/06/2017.
 */
(($, bbn) => {
  "use strict";

  Vue.component('bbn-file2', {
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
        
      };
    },
    computed: {
      fileList(){
        let res = [];
        if ( this.value && this.value.length ){
          this.value.each((a) => {
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
      },
      openPrompt(){
        this.getRef('uploader').click();
      },
      filesReady(e){
        if ( e.target.files.length ){
          bbn.fn.each(e.target.files, (f, i) => {
            let ok = true;
            if ( !this.isAllowed(f) ){
              appui.error(bbn._("This type of file is not allowed, only files of type") + ' ' + this.extensions.join(', '));
              ok = false;
            }
            else if ( this.maxSize && ((f.size / 1024 / 1024) > this.maxSize) ){
              appui.error(bbn._("The file si too big, the maximum size is") + ' ' + this.maxSize + 'MB');
              ok = false;
            }
            if ( !ok ){
              e.target.files.splice(i, 1);
            }
          });
          if ( e.target.files.length && this.autoUpload ){
            
            
            /* const formData = new FormData();
            Array.from(Array(e.target.files.length).keys()).map(x => {
              formData.append(e.target.name, e.target.files[x], e.target.files[x].name);
            }); */
            this.upload(e.target.files[0]); 
          }
        }
      },
      upload(formData){
        if ( formData ){
          let xhr = new XMLHttpRequest();
          /* if ( bbn.env.token ){
            formData.append('_bbn_token', bbn.env.toker);
          } */
          xhr.open("POST", this.saveUrl, true);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          xhr.setRequestHeader("Accept", "application/json");

          xhr.onreadystatechange = function(){
            if ( (this.readyState === XMLHttpRequest.DONE) && (this.status === 200) ){
              bbn.fn.log('UPLOADED');
            }
          }
          xhr.send(formData);
        }
      }
    },
    mounted(){
      this.ready = true;
      this.$nextTick(() => {
        /*
        if ( !this.window ){
          this.window = bbn.vue.closest(this, "bbn-window");
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

})(jQuery, bbn);
