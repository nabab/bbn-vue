(bbn_resolve) => {
((bbn) => {

let script_dep = document.createElement('script');
script_dep.setAttribute('src', 'https://cdn.jsdelivr.net/combine/gh/ProgerXP/FileDrop@master/filedrop-min.js');
script_dep.onload = () => {


let css_dependency;

css_dependency = document.createElement('link');
css_dependency.setAttribute('rel', 'stylesheet');
css_dependency.setAttribute('href', 'https://cdn.jsdelivr.net/combine/gh/ProgerXP/FileDrop@master/filedrop.css');
document.head.insertAdjacentElement('beforeend', css_dependency);


let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-w-100', 'bbn-widget']">
  <input value="value" type="hidden" name="name">
  <div ref="zone">
    <div class="bbn-w-100" style="min-height: 60px">
      <div class="bbn-overlay bbn-r bbn-hpadded" style="opacity: 0.4">
        <div class="bbn-xl" v-if="uploading">
          <span v-text="lng.uploading + ' ' + progress + '%'"/>
        </div>
        <div class="bbn-lg" v-else>
          <span v-text="lng.dropHere + '...'"/>
          <span v-text="lng.clickHere"/> <em v-text="lng.browse + '... '"/>
          <i class="bbn-xl nf nf-fa-upload"></i>
        </div>
      </div>
      <div ref="files" v-if="files.length">
        <ul>
          <li v-for="file of fileList" v-text="file.name"></li>
        </ul>
      </div>
    </div>
  </div>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-file');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/file/file.css');
document.head.insertAdjacentElement('beforeend', css);

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
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins:
    [
      bbn.vue.basicComponent,
      bbn.vue.inputComponent
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
          this.window = bbn.vue.closest(this, "bbn-floater");
        }
        if ( !this.tab ){
          this.tab = bbn.vue.closest(this, "bbns-tab");
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
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
};
document.head.insertAdjacentElement("beforeend", script_dep);
})(bbn);
}