/**
 * Created by BBN on 15/08/2019.
 */

(function(bbn){
  "use strict";

  let app;
  /**
   * Classic input with normalized appearance
   */

  Vue.component('bbn-clipboard', {
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent],
    props: {
      orientation: {
        type: String,
        default: 'right'
      },
      source: {
        type: Array
      },
    },
    data(){
      return {
        opacity: 0,
        items: this.source,
        search: '',
        isSetting: false,
        uid: null
      };
    },
    computed: {
    },
    methods: {
      test(uid){
        bbn.fn.log("TEST", uid);
      },
      toggle(){
        return this.getRef('slider').toggle();
      },
      show(){
        return this.getRef('slider').show();
      },
      hide(){
        return this.getRef('slider').hide();
      },
      save(uid, title){
        let item = this.getItem(uid);
        if (item) {
          let content = item.file || item.text;
          if (!title) {
            bbn.fn.log("NO TITLE");
            title = item.text;
            if (!item.file && (title.length > 15)) {
              title = bbn.fn.sanitize(title.substr(0, 50)).substr(15);
            }
          }
          bbn.fn.download(title, content, item.type);
        }
      },
      saveAs(uid){
        let item = this.getItem(uid);
        if (item) {
          let bits = item.text.split('.');
          let title = prompt(bbn._('Enter the file name'), bits.length > 1 ? '.' + bits.pop().toLowerCase() : item.text);
          if (title) {
            this.save(uid, title);
          }
        }
      },
      add(data){
        let dt = bbn.fn.timestamp();
        let uid = dt;
        let ar = [{
          dt: dt,
          uid: uid,
          text: data.raw,
          type: 'text/plain',
          stype: 'text',
          size: data.raw.length,
          mdate: null,
          content: '',
          file: ''
        }];
        bbn.fn.log("ADDING", data);
        if (data.files.length) {
          bbn.fn.each(data.files, (o) => {
            uid++;
            let stype = 'text';
            if (o.type !== 'text/plain') {
              if (o.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                stype = 'ms.word';
              }
              else if (o.type === 'application/vnd.oasis.opendocument.text') {
                stype = 'oo.text';
              }
              else if (o.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                stype = 'oo.sheet';
              }
              else if (o.type.indexOf('image/') !== 0){
                let bits = o.type.split('/');
                stype = bits[1] || bits[0];
              }
              else{
                stype = o.type;
              }
              ar[0].content = o.data;
            }
            bbn.fn.upload('core/upload', {type: 'clipboard', file: o.data}, res => bbn.fn.log('success', res), res => bbn.fn.log('failure', res), res => bbn.fn.log('progress', res));
            ar.push({
              dt: dt,
              uid: uid,
              text: o.name,
              type: o.type,
              stype: stype,
              size: o.size,
              mdate: o.mdate,
              content: '',
              file: o.data
            });
          });
        }
        else if (data.str.length) {
          bbn.fn.each(data.str, (o) => {
            if (o.type === 'text/plain') {
              ar[0].text = o.data;
            }
            else {
              ar[0].type = o.type;
              if (o.type.indexOf('image/') !== 0){
                let bits = o.type.split('/');
                ar[0].stype = bits[1] || bits[0];
              }
              else{
                stype = o.type;
              }
              ar[0].content = o.data;
            }
          });
        }
        let added = [];
        bbn.fn.each(ar, (a) => {
          let idx = bbn.fn.search(this.items, {text: a.text, type: a.type});
          if (idx !== -1) {
            this.items.splice(idx, 1);
          }
          else{
            added.unshift(a);
          }
          this.setStorage(JSON.stringify(a), a.uid);
          this.items.unshift(a);
        });
        if (added.length) {
          this.$emit('add', added);
        }
        this.$forceUpdate();
      },
      remove(src){
        let idx = bbn.fn.search(this.items, {uid: src.uid});
        if (idx > -1) {
          let e = new Event('remove', {cancelable: true});
          this.$emit('remove', e, this.items[idx]);
          if (!e.defaultPrevented) {
            this.unsetStorage(src.uid);
            this.items.splice(idx, 1);
          }
        }
      },
      getItem(uid){
        return bbn.fn.get_row(this.items, {uid: uid});
      },
      updateSlider(){
        this.$nextTick(() => {
          this.getRef('slider').updateSize();
        });
      },
      clear(){
        this.confirm(bbn._('Are you sure you want to delete the whole content of the clipboard?'), () => {
          while (this.items.length){
            this.remove(this.items[this.items.length-1]);
          }
        });
      },
      copy(e){
        let type = e.type;
        bbn.fn.getEventData(e).then((data) => {
          this.add(data);
          this.updateSlider();
          bbn.fn.log("DATA FROM " + type, data);
        });
        return true;
      },
      setClipboard(uid, mode){
        let item = this.getItem(uid);
        bbn.fn.log("setClipboard", item);
        if (item) {
          let doIt = () => {
            this.uid = uid;
            this.mode = mode;
            this.isSetting = true;
            this.getRef('textarea').value = ' ';
            this.getRef('textarea').select();
            document.execCommand('copy');
          };
          if (item.file) {
            let reader = new FileReader();
            reader.onloadend = () => {
              this.file = reader.result;
              doIt();
            };
            reader.readAsBinaryString(item.file);
          }
          else{
            doIt();
          }
        }
      }
    },
    mounted(){
      document.oncopy = (e) => {
        bbn.fn.info("COPY EV", e);
        if (e.clipboardData && this.isSetting && this.uid){
          let item = this.getItem(this.uid);
          if (item) {
            e.clipboardData.setData('text/plain', this.mode === 'html' ? item.content : item.text);
            bbn.fn.log("ITEM IS FOUND");
            let v;
            switch (this.mode) {
              case 'html':
                e.clipboardData.setData('text/html', item.content);
                break;
              case 'image':
                bbn.fn.log("IMAGE!", item.type);
                if (item.file) {
                  e.clipboardData.setData(item.type, item.file);
                  e.clipboardData.setData('text/html', '<img src="data:' + item.type + ';base64, ' + btoa(item.file) + '" alt="' + item.text + '">');
                }
                break;
              case 'file':
                bbn.fn.log(this.file);
                if (this.file) {
                  e.clipboardData.setData(item.type, this.file);
                }
                break;
            }
            bbn.fn.log("SETTING " + item.text);
            bbn.fn.log(e.clipboardData.items, e.clipboardData.items[0], e.clipboardData.items.length);
            e.preventDefault();
            /*
            bbn.fn.each(e.clipboardData.items, item => {
              bbn.fn.log("ITEM FROM THE CLIPBOARD OFFICIAL", item);
              navigator.clipboard.write(item).then(() => {
                bbn.fn.log("WRITE OPERATION ON CLIPBOARD OK");
              });
            });
            */
          }
          this.isSetting = false;
          this.uid = null;
          this.file = null;
        }
        else{
          this.copy(e);
        }
      };
    },
    watch: {
    },
  });

})(window.bbn);