/**
 * Created by BBN on 15/08/2019.
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.localStorage
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.localStorage
    ],
    static() {
      let fields = ['host', 'user', 'pass'],
  
      filesRules = {
        pdf: 'nf nf-mdi-file_pdf bbn-red',
        php: 'nf nf-mdi-language_php bbn-blue',
        doc: 'nf nf-mdi-file_word bbn-blue',
        docx: 'nf nf-mdi-file_word bbn-blue',
        xls: 'nf nf-mdi-file_excel bbn-green',
        xlsx: 'nf nf-mdi-file_excel bbn-green',
        ppt: 'nf nf-mdi-file_powerpoint bbn-red',
        pptx: 'nf nf-mdi-file_powerpoint bbn-red',
        psd: 'nf nf-dev-photoshop bbn-blue',
        js: 'nf nf-mdi-language_javascript bbn-red',
        html: 'nf nf-mdi-language_html5 bbn-green',
        txt: 'nf nf-oct-file_text',
        css: 'nf nf-dev-css3 bbn-orange',
        less: 'nf nf-dev-css3 bbn-orange',
        zip: 'nf nf-mdi-archive bbn-orange',
        gz: 'nf nf-mdi-archive',
        gzip: 'nf nf-mdi-archive',
        png: 'nf nf-mdi-file_image bbn-purple',
        jpeg: 'nf nf-mdi-file_image bbn-blue',
        jpg: 'nf nf-mdi-file_image bbn-blue',
        gif: 'nf nf-mdi-file_image bbn-pink',
        tiff: 'nf nf-mdi-file_image bbn-brown',
        json: 'nf nf-mdi-json bbn-red'
      },
      imageExt = ['jpeg', 'png', 'jpg', 'tiff', 'gif'];
    },
    props: {
      /**
       * @prop {String} ['.'] path
       */
      path: {
        type: String,
        default: '.'
      },
      /**
       * @prop {} source
       */
      source: {},
      /**
       * @prop {String} origin
       */
      origin: {
        type: String
      },
      /**
       * @prop {String} root
       */
      root: {
        type: String
      },
      /**
       * @prop {Boolean} [true] preview
       */
      preview: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {String} ['nf nf-fa-folder bbn-yellow'] folderIcon
       */
      folderIcon: {
        type: String,
        default: 'nf nf-fa-folder bbn-yellow'
      }
    },
    data(){
      return {
        /**
         * @data {Boolean} [false] uploading
         */
        // takes the value of the path when the upload is clicked from the context menu - used to show / hide bbn-upload
        uploading: false,
        //v-model of bbn-upload
        /**
         * @data {Array} [[]] uploaded
         */
        uploaded: [],
        //defined when the button new folder/file is clicked on the bottom of the tree
        /**
         * @data {String} [''] currentContextPath
         */
        currentContextPath: '',
        /**
         * @data {Boolean} [false] isConnected
         */
        isConnected: false,
        /**
         * @data {Array} [[]] data
         */
        data: [],
        /**
         * @data {String} [''] host
         */
        host: '',
        /**
         * @data {String} [''] user
         */
        user: '',
        /**
         * @data {String} [''] pass
         */
        pass: '',
        /**
         * @data {Boolean} [false] copied
         */
        copied: false,
        /**
         * @data {String} [''] oldDir
         */
        oldDir: '',
        /**
         * @data {Array} [[{name:'',path:'.',empty_dirs:0,num_dirs:0,num_files:0,size:0}]] dirs
         */
        dirs: [{
          name: '',
          path: '.',
          empty_dirs: 0,
          num_dirs: 0,
          num_files: 0,
          size: 0,
        
        }],
        /**
         * @data {Boolean} [false] currentFile
         */
        currentFile: false,
        /**
         * @data [null] dirInfo
         */
        dirInfo: null,
        /**
         * @data {Boolean} [false] editingNode
         */
        editingNode: false,
        /**
         * @data {Boolean} [false] isImage
         */
        isImage: false,
        /**
         * @data {Boolean} [false] isLoading}
         */
        isLoading: false,
        /**
         * @data {Boolean} [false] currentTitle
         */
        currentTitle: false,
      }
    },
    computed: {
      /**
       * @computed mapUploaded
       * @return {(Array)}
       */
      mapUploaded(){
        if ( this.uploaded.length ){
          return bbn.fn.map( this.uploaded, a => {
            a.name = a.name.replace(' ', '_')
            return a
          })
        }
        return [];
      },
      /**
       * @computed currentPath
       * @return {String}
       */
      currentPath(){
        return this.dirs.map(a => {return a.name ? a.name + '/' : '';}).join('');
      },
      /**
       * @computed numCols
       * @return {Number}
       */
      numCols(){
        return this.dirs.length;
      },
      /**
       * @computed encodeURL
       * @return {String}
       */
      encodedURL() {
        if ( this.currentFile && this.isImage ){
          //return btoa(this.origin + this.currentPath + this.currentFile.node.data.value)
          return btoa(this.currentPath + this.currentFile.node.data.value)
        }
      },
    },
    methods: {
     
      //abort the current request
      /**
       * Abord the current request.
       *
       * @method abortRequest
       * @param {Number} i
       */
      abortRequest(i){
        bbn.fn.happy(i)
        let loadBar = this.closest('bbn-appui').getRef('loading');
        if (loadBar) {
          let loadUrl = loadBar.currentItem.url;
          if ( bbn.fn.isNumber(i) && ( loadUrl === 'ide/finder') ){
            bbn.fn.abort(loadBar.currentItem.key);
            appui.success(bbn._('Current request aborted'))
            this.currentFile = false;
            this.dirs.splice(i, 1);
          }
          else if ( loadUrl.indexOf('ide/actions/finder/file') === 0 ){
            this.currentFile = false;
            this.isLoading = false;
            bbn.fn.abort(loadBar.currentItem.key);
          }
        }
      },
      // at click on the button of the new folder/ file on the bottom of the tree defines the property path of the current tree. Is the only way to know the current context 
      /**
       * At click on the button of the new folder/ file on the bottom of the tree defines the property path of the current tree. Is the only way to know the current context.       *
       *
       * @method context
       * @param a
       * @param {Object} button
       */
      context(a, button){
        this.currentContextPath = button.closest('bbn-context').data.path;
      },
      /**
       * Closes the preview of the file.
       *
       * @method closePreview
       */
      //closes the preview of the file
      closePreview(){
        this.currentFile = false;
        this.isLoading = false;
      },
      //refresh the tree data
      /**
       * Refresh the tree data0
       *
       * @method refresh
       * @param {String} name
       */
      refresh(name){
        let trees = this.findAll('bbn-tree');
        if ( trees.length ){
          let tree = bbn.fn.filter(trees, a => {
            return a.data.name === name;
          })
          if ( tree.length ){
            tree[0].reload();
          }
        }
        
      },
      /**
       * Get the size of the current tree (the selected folder of the previous tree).
       *
       * @method get_size
       * @param {Object} p
       */
      get_size(p){
        let idx = bbn.fn.search(this.dirs, 'name', p.name);
        this.post(this.root + 'actions/finder/dirsize', {
          path: p.path,
          origin: this.origin
        }, d => {
            if ( d.success ){
              this.dirs[idx].size = d.size;
            }
            else { 
              appui.error(bbn._('Something went wrong'));
            }
        });
      },
      /**
       * @method add
       * @param {String} path
       */
      add(path){
        let fpath = path;
        if ( this.dirs.length > 1 ){
          fpath = this.currentPath + path;
        }
        this.dirs.push({
          name: path,
          path: fpath,
          empty_dirs: 0,
          num_dirs: 0,
          size: 0
        });
      },
      /**
       * Remove the current dirs.
       *
       * @method remove
       */
      remove(){
        this.dirs.pop();
      },
      /**
       * Method at @load of bbn-tree.
       *
       * @method updatInfo
       * @param {Object} res
       */
      updateInfo(res){
        if ( res && res.path ){
          setTimeout( () => {
            let idx = bbn.fn.search(this.dirs, {path: res.path});
            if ( idx > -1 ){
              this.dirs[idx].num_dirs = res.num_dirs;
              this.dirs[idx].num_files = res.num_files;
              this.isLoading = false;
            }
          }, 300)
        }
      },
      /**
       * Method at @select of bbn-tree, defines currentFile and makes the post to take the infos of the file.
       *
       * @method select
       * @param {Object} node
       */
      select(node){
        // Reinit
        this.isImage = false;
        this.isLoading = true;
        this.currentFile = {
          node: node
        };
        if ( node.data.value ){
          let path = '';
          let num = 2;
          if ( node.tree.data.path && (node.tree.data.path !== '.') ){
            path += node.tree.data.path;
            num += path.split('/').length;
          }
          path += node.data.value;
          if ( this.currentPath !== path ){
            while ( num <= this.numCols ){
              this.remove();
            }
            if ( node.data.dir ){
              this.currentFile = false;
              this.dirInfo = node.data;
              this.add(node.data.value);
            }
            else if ( node.data.file ){
              let idx = node.data.value.lastIndexOf('.'), 
                  ext = '';
              if ( idx > -1 ){
                let val = node.data.value.length - idx;
                ext = node.data.value.slice(- val);
              }

              //isImage
              if ( !bbnFinderCreator.imageExt.includes(ext) ){
                this.post( this.root + 'actions/finder/file', {
                  node: node.data,
                  path: this.currentPath,
                  origin: this.origin,
                  ext: ext,
                  width: 450,
                  height: 300,
                }, d => {
                  if ( d.success && d.info ) {
                    this.currentFile = {
                      node: node,
                      height: d.info.height ? d.info.height : '',
                      width: d.info.width ? d.info.width : '',
                      info: d.info,
                      ext: ext, 
                    }
                  
                    if ( d.info.is_image ){
                      this.isImage = true;
                    }
                  }
                  else {
                    appui.error(bbn._('Something went wrong while loading the file infos'));
                  }
                  this.isLoading = false;
                });
              }
              else {
                return 
                bbn.fn.postOut(this.root + 'actions/finder/image/' + this.encodedURL)
              }
            }
          }
        }
      },
      /**
       * @method mapTree
       * @param {Object} node
       * @return {Object}
       */
      mapTree(node){
        bbn.fn.log(node);
        let bits = node.text.split('.');
        let ext = bits[bits.length-1];
        if ( node.dir) {
          node.icon = this.folderIcon;
        }
        else if (bbnFinderCreator.filesRules[ext]) {
          node.icon = bbnFinderCreator.filesRules[ext];
        }
        return node;
      },
      /**
       * @method getData
       * @param {Object} p
       */
      getData(p){
        //return $.extend({
        return bbn.fn.extend({
          name: p.name,
          path: p.path,
          origin: this.origin
        }, this.isConnected ? {
          host: this.host,
          user: this.user,
          pass: this.pass
        } : {})
      },
      /**
       * @method contextMenuTree
       * @fires uploadFile
       * @fires newFolder
       * @return {[{action: uploadFile, text: string}, {action: newFolder, text: string}, {action: log, text: string}]}
       */
      contextMenuTree(){
        return [{
          text: '<i class="nf nf-fa-file"></i>'+ bbn._('Add files to this folder'),
          action: () => {
            this.uploadFile(this.currentContextPath)
          }
        },{
          text: '<i class="nf nf-custom-folder"></i>'+ bbn._('Create new folder'),
          action: () => {
            this.newFolder()
          }
        },{
          text: '<i class="nf nf-fa-paste"></i>'+ bbn._('Paste'),
          action: node => {
            bbn.fn.log('context--->', arguments);
          }
        }];
      },
      /**
       * Returns the array of buttons of the context menu
       *
       * @method itemContextMenu
       * @param {Object} n the node
       * @param {Number} i the index of the node
       * @fires copy
       * @fires newFolder
       * @fires paste
       * @fires download
       * @fires edit
       * @fires delete
       * @return {Array}
       */
      itemsContextMenu(n, i) {
        let objContext = [
          {
            icon: 'nf nf-fa-copy',
            text: bbn._('Copy'),
            action: node => {
              this.copy(node)
            }
          }  
        ]@
        if ( n.data.dir ) {
          objContext.push({
            icon: 'nf nf-fa-paste',
            text: bbn._('Create new folder'),
            action: node => {
              this.newFolder(node)
            }
          });
          if ( this.copied !== false ){
            objContext.push({
              icon: 'nf nf-fa-paste',
              text: bbn._('Paste'),
              action: node => {
                this.paste(node)
              }
            });  
          }
        }
        else{
          objContext.push({
            icon: 'nf nf-fa-download',
            text: bbn._('Download'),
            action: node => {
              this.download(node)
            }
          })
        }
        if ( this.closest('appui-ide-explorer').source.type === 'nextcloud' ){
          objContext.push({
            icon: 'nf nf-fa-edit',
            text: bbn._('Rename'),
            action: node => {
              this.edit(node)
            }
          },{
            icon: 'nf nf-fa-trash_alt',
            text: bbn._('Delete'),
            action: node => {
              this.delete(node)
            }
          })
        }
        return objContext;
      },
      /**
       *
       * @method uploadFile
       * @param {String} path
       */
      uploadFile(path){
        this.uploading = this.currentContextPath
      },
      /**
       * @method uploadSuccess
       * @param a
       * @param b
       * @param {Object} d data
       * @fires getRef
       */
      uploadSuccess(a, b, d){
        bbn.fn.happy('now')
        bbn.fn.log(d.data, arguments,'args')
        if ( d.data.success ){
          if ( d.data.name ){
            appui.success(bbn._(d.data.name + ' ' +'successfully uploaded'));
            
            if ( this.getRef('upload').filesSuccess.length && (this.getRef('upload').filesSuccess.length === this.uploaded.length) ){ 
              setTimeout(()=>{
                this.uploading = false;
                this.uploaded = [];
              }, 500)
            }
          }
        }
        else {
          appui.error(bbn._('Something went wrong while uploading the file'))
        }
      },
      /**
       * @method newFolder
       *
       * @param {Object} node
       */
      newFolder(node){
        if ( node ){
          let tmp = node.tree.data.path, 
          path = '';
          if ( tmp.indexOf('/') === 0 ){
            path = bbn.fn.substr(tmp, 1, tmp.length);
          }  
          else {
            path = tmp + '/';
          }
          node.getPopup({
            title: bbn._('New Directory'),
            height: '150px',
            width: '350px',
            source: {
              treeUid: node.closest('bbn-tree')._uid,
              idx: node.idx, 
              node: node.data,
              uid: node._uid,
              origin: this.origin,
              path: path,
              root: this.root,
              new: true,
              newDir: ''
            },
            component: this.$options.components.form
          })
        }
        else { 
          if ( this.currentContextPath.length ){
            let idx = bbn.fn.search( this.findAll('bbn-tree'),  'data.path', this.currentContextPath),
            treeUid,
            tree;
            if ( idx > -1 ){
              tree = this.findAll('bbn-tree')[idx];
              treeUid = tree._uid;
              tree.getPopup({
                title: bbn._('New Directory'),
                height: '150px',
                width: '350px',
                source: {
                  treeUid: treeUid,
                  node: {
                    //just because in the case of new folder from node the value is expected in the controller
                    value: ''
                  },
                  origin: this.origin,
                  path: this.currentContextPath,
                  root: this.root,
                  new: true,
                  newDir: '', 
                  isFromTree: true
                },
                component: this.$options.components.form
              })
            }

             bbn.fn.happy(this.currentContextPath)
          }
         
        }
        
      },
      /**
       * paste the node previously copied in the property this.copied in the current selected dir
       *
       * @method paste
       * @param {Object} n the node
       */
      paste(n){
        n.isSelected = true;
        bbn.fn.log('PASTE', n, typeof(n))
        //case of paste called from context menu and not from nodes of the tree
        let value = '';
        if ( typeof(n) === 'string' ){
          value = bbn._('the current folder');  
        }
        else {
          value = n.data.value;
        }
        if ( (typeof(n) === 'string' || n.data.dir ) && this.copied ) {
          let st = bbn._('Do you want to paste') + ' ' + this.copied.data.value + ' ' + bbn._('into') + ' ' + value + '?';
          let trees = this.findAll('bbn-tree'), 
          path = '';
          this.confirm(bbn._(st), () => {
            this.post(this.root + 'actions/finder/paste', {
              node: this.copied.data,
              origin: this.origin,
              old_dir: this.oldDir,
              new_dir: this.currentPath
            }, d => {
              if ( d.success ){
                bbn.fn.happy('pasted')
                bbn.fn.log(n.tree.items)
                bbn.fn.each(trees, (v, i) => {
                  bbn.fn.log(n,( v.data.name === n.data.value ), v.data.name ,n.data.value )
                  if ( v.data.name === n.data.value ){
                    bbn.fn.log(v.source)
                    v.reload();
                  }  
                });
                appui.success(this.copied.data.value + ' ' + bbn._('successfully pasted into ' + n.data.value));
              }
              else{
                appui.error(bbn._('Something went wrong'));
              }
              this.copied = false;
              this.oldDir = '';
            })
          });
        }
        else if ( !this.copied ){
          this.alert(bbn._('The clipboard is empty!'));
        }
      },
      //download the file
      /**
       * @method download
       * @param {Object} n
       */
      download(n){
        bbn.fn.postOut(this.root + 'actions/finder/download/' + n.data.value, {
          value: n.data.value,
          file: n.data.file,
          path: this.currentPath !== n.data.value + '/' ? this.currentPath : '',
          origin: this.origin,
          destination: this.origin + 'download/' + dayjs().format('x') + '/'
        })
      },
      /**
       * Edits the name of the current selected node.
       *
       * @method edit
       * @param {Object} node
       */
      edit(node){
        this.editingNode = false;
        let oldValue = node.data.value,
          tmp = node.closest('bbn-tree').data.path,
          path = '';

        if ( tmp.indexOf('/') === 0 ){
          path = bbn.fn.substr(tmp, 1, tmp.length);
        }  
        else {
          path = tmp + '/';
        }
        let currentPath = path;
        this.editingNode = node;
        node.getPopup({
          title: bbn._('Rename'),
          height: '150px',
          width: '350px',
          source: {
            treeUid: node.closest('bbn-tree')._uid,
            idx: node.idx, 
            node: node.data,
            origin: this.origin,
            path: currentPath,
            oldValue: oldValue,
            root: this.root,
          },
          component: this.$options.components.form
        })
      },
      /**
       * Deletes the current selected node.
       *
       * @method delete
       * @param {Object} node
       */
      delete(node){
        this.confirm(bbn._('Do you want to delete') + ' ' + node.data.value + '?', () => {
          let st = node.tree.data.path,
            //st = ( (this.mode === 'ftp') || (this.mode === 'ssh')) ? this.origin + this.currentPath : this.currentPath,
              name = node.data.value;
          /*if ( node.data.dir && ( this.currentPath === '' ) ){
            st += node.data.value;
          }
          if ( node.data.file ){
            st += node.data.value;
          }
          */

          this.post(this.root + 'actions/finder/delete', {
            path: st, 
            name: name,
            origin: this.origin
          }, d => {
            if ( d.success ){       
              let items = node.tree.items;
              if ( items.length ){
                items.splice(node.idx, 1);
              }
              if ( node.data.dir && this.dirs.length ){
                let idx = bbn.fn.search(this.dirs, 'path', node.tree.data.path + '/' + node.data.value )
                if ( idx > -1 ){
                  this.dirs.splice(idx)
                }
              }
              //destroy the next tree in the case of elimination of a folder
              if ( node.data.dir && ( this.dirs.length > 1 ) ){
                this.dirs.pop();
              }
              appui.success(name + ' ' + bbn._('successfully deleted'));
              this.currentFile = false;
            }
            else {
              appui.error(bbn._('Something went wrong while deleting' + node.data.value));
            }
          })
        });
      },
      /**
       * @method dragStart
       */
      dragStart(){
        bbn.fn.log('START', arguments)
      },
      /**
       * @method dragEnd
       */
      dragEnd(){
        bbn.fn.log('END', arguments)
      },
      /**
       * Insert the current selected node in the property this.copied.
       * @method copy
       * @param {Object} n the node
       * @fires confirm
       */
      copy(n){
        bbn.fn.happy('copy')
        bbn.fn.log(arguments)
        this.copied = false;
        this.confirm(bbn._('Do you want to copy') + ' ' + n.data.value + '?', () => {
          this.copied = n;
          /*if ( n.data.dir && this.dirs.length > 2){
            let st = this.currentPath.slice(0,-1),
            idx = st.lastIndexOf('/');
            if ( idx > -1 ){
              st = st.substring(0, idx);
            }
            this.oldDir = st + '/';
          }
          else if ( n.data.dir && this.dirs.length <= 2 ){
            this.oldDir = '';
          }
          else {
            this.oldDir = this.currentPath;
          }*/
          this.oldDir = n.tree.data.path;
          let st = n.data.file ? bbn._('File') : bbn._('Folder');
          st += ' ' + bbn._('successfully copied');
          appui.success(st)
        })
      },
      /**
       * @method updateScroll
       * @fires $nextTick
       * @fires getRef
       */
      updateScroll(){
        this.$nextTick(() => {
          let sc = this.getRef('scroll');
          if (sc) {
            sc.onResize().then(() => {
              setTimeout(() => {
                bbn.fn.log("IT SHOULD GO TO THE END OF THE SCROLL")
                sc.scrollEndX(true);
              }, 250);
            });
          }
        })
      }
    },
    /**
     * @event mounted
     * @fires add
     */
    mounted(){
      if ( this.path ){
        bbn.fn.each(this.path.split('/'), a => {
          if ( a ){
            this.add(a)
          }
        });
      }
      
    }
    watch: {
      /**
       * @watch isLoading
       * @param val
       */
      isLoading(val){
        //bbn.fn.log('isloading->>>>', val, new Date())
      },
      /**
       * @watch host
       * @param newVal
       * @param oldVal
       * @fires checkDisconnect
       */
      host(newVal, oldVal){
        if ( this.isConnected ){
          this.checkDisconnect(this.getRef('host'), oldVal)
        }
      },
      /**
       * @watch user
       * @param newVal
       * @param oldVal
       * @fires checkDisconnect
       */
      user(newVal, oldVal){
        if ( this.isConnected ){
          this.checkDisconnect(this.getRef('user'), oldVal)
        }
      },
      /**
       * @watch pass
       * @param newVal
       * @param oldVal
       * @fires checkDisconnect
       */
      pass(newVal, oldVal){
        if ( this.isConnected ){
          this.checkDisconnect(this.getRef('pass'), oldVal)
        }
      },
      /**
       * @watch isConnected
       * @fires remove
       * @fires add
       */
      isConnected(){
        while ( this.numCols ){
          this.remove()
        }
        setTimeout(() => {
          this.add('');
        }, 250);
      },
      /**
       * @watch dirs
       * @fires updateScroll
       */
      dirs(){
        this.updateScroll();
      },
      /**
       * @watch currentFile
       * @fires updateScroll
       */
      currentFile(){
        this.updateScroll();
      },
      /**
       * @watch currentPath
       * @param v
       * @emits change
       */
      currentPath(v){
        this.$emit('change', v);
      }
    },
    components: {
      form:{
        name: 'form',
        template: `
        <bbn-form class="bbn-flex-height"
                  :source="source" 
                  @success="success" 
                  :action="source.root + 'actions/finder/' + (!source.new ? 'rename' : 'new_dir')"
                  >
          <div class="bbn-grid-fields bbn-l bbn-padded">
            <label>`+ bbn._('Name') +`</label>
            <div>
              <bbn-input v-if="!source.new" 
                         class="bbn-w-100" 
                         v-model="source.node.value"
                         
              ></bbn-input>
              <bbn-input v-else 
                         class="bbn-w-100" 
                         v-model="source.newDir"
              >
              </bbn-input>
            </div>
          </div>
        </bbn-form>`,
        props: ['source', 'data'],
        data(){
          return {
            dirIdx: false,
          }
        },
        computed: {
          dirs(){
            return this.closest('bbn-container').getComponent().dirs;
          },
          finder(){
            return this.closest('bbn-finder')
          }
        },
      
        methods:{
          success(d){
            if ( d.success ){
              let trees = this.closest('bbn-container').getComponent().findAll('bbn-tree');
              
              //creating a new folder
              if ( d.data && d.data.new_dir ){
                bbn.fn.happy('mpod')
                
                
                
                let treeIdx = bbn.fn.search(trees, '_uid', this.source.treeUid);
                bbn.fn.happy(treeIdx)
                if ( ( treeIdx > -1 ) && ( trees[treeIdx + 1] ) ){
                  trees[treeIdx + 1].reload();
                  bbn.fn.happy(treeIdx)
                }
                else if (this.source.isFromTree ) {
                  //case of folder created from the context of the tree and not node
                  trees[treeIdx].reload();
                }
                
                
                appui.success(d.data.new_dir + ' ' + bbn._('successfully created'))
              }
              //editing an existing folder
              else { 
                bbn.fn.each(trees, (v, i) => {
                  if ( v._uid === this.source.treeUid ){
                    v.items[this.source.idx].value = this.source.node.value;
                    v.items[this.source.idx].text = this.source.node.value;
                  }
                })
                appui.success((this.source.node.dir ? bbn._('Folder') : bbn._('File')) + ' ' + bbn._('successfully modified'))
              }
            }
            else{
              appui.error(bbn._('Something went wrong'))
            }
          }
        },
        
      }
    }  
  };
