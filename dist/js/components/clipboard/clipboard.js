(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<bbn-slider :orientation="orientation"
            :class="componentClass"
            ref="slider"
            :visible="false"
            @show="isOpened = true"
            @hide="isOpened = false"
>
  <div class="bbn-h-100 bbn-flex-height bbn-vpadded" v-if="isOpened">
    <div class="bbn-xl bbn-c bbn-w-100 bbn-vpadded" v-if="!items.length && !search.length">
      <i class="nf nf-fa-clipboard"/> &nbsp; 
      <span v-text="_('Clipboard is empty')"/>
    </div>
    <div class="bbn-large bbn-c bbn-w-100 bbn-vpadded" v-else>
      <bbn-input :placeholder="_('Search clipboard')"
                 :button-right="(search === '') ? 'nf nf-fa-search' : 'nf nf-fa-close'"
                 v-model="search"
                 ref="search"
                 :focused="true"
                 @clickRightButton="unsearch"/>
    </div>
    <div class="bbn-w-100 bbn-p bbn-hpadded"
         v-if="items.length">
      <bbn-button v-if="!search.length"
                  @click="clear"
                  :text="_('Clear all')"/>
      <textarea class="bbn-invisible"
                ref="textarea"
                style="width: 0px; height: 0px"/>
    </div>
    <hr class="bbn-hr">
    <div class="bbn-flex-fill" @drop.prevent.stop="copy">
      <bbn-scroll axis="y">
        <bbn-list :source="items"
                  uid="uid"
                  @remove="remove">
          <div class="bbn-w-100 bbn-flex-width" v-pre>
            <div :title="text"
                class="bbn-clipboard-text bbn-block-left bbn-flex-fill">
              <i :class="[
                'nf nf-oct-pin',
                'bbn-s',
                'bbn-right-xsspace',
                {'bbn-invisible': !source.pinned}
                ]"/>
                 
              <bbn-context tag="span"
                           class="bbn-right-space"
                           :source="[
                {text: _('Copy plain text'), icon: 'nf nf-mdi-cursor_text', action: () => {closest('bbn-clipboard').setClipboard(uid, 'plain')}},
                {text: _('Copy rich text'), icon: 'nf nf-mdi-code_tags', disabled: !content, action: () => {closest('bbn-clipboard').setClipboard(uid, 'html')}},
                {text: _('Copy as image'), icon: 'nf nf-fa-image', disabled: !type || (type.indexOf('image/')) !== 0, action: () => {closest('bbn-clipboard').setClipboard(uid, 'image')}},
                {text: _('Save'), icon: 'nf nf-fa-file_o', action: () => {closest('bbn-clipboard').save(uid)}},
                {text: _('Save as...'), icon: 'nf nf-fa-file_o', action: () => {closest('bbn-clipboard').saveAs(uid)}},
                {text: _('Pin'), icon: 'nf nf-mdi-pin', action: () => {source.pinned = true;}, disabled: source.pinned},
                {text: _('Unpin'), icon: 'nf nf-mdi-pin_off', action: () => {source.pinned = false;}, disabled: !source.pinned},
                {text: _('Share'), icon: 'nf nf-fa-share', action: () => {}},
                {text: _('Remove'), icon: 'nf nf-fa-trash_o', action: () => closest('bbn-clipboard').remove({uid: source.uid})},
              ]">
                <i class="nf nf-mdi-dots_vertical"/>
              </bbn-context>
              <span v-text="text"/>
            </div>
            <div :class="{
                  'bbn-block-right': true,
                  'bbn-narrow': true,
                  'bbn-r': true,
                  'bbn-green': stype === 'html',
                  'bbn-red': stype === 'javascript',
                  'bbn-purple': type.indexOf('application/') === 0,
                  'bbn-blue': stype === 'php',
                  'bbn-orange': ['css', 'less', 'scss'].includes(stype),
                  'bbn-darkgrey': stype === 'text',
                  'bbn-pink': stype && (stype.indexOf('image/') === 0)
                }"
                  v-text="stype"/>
          </div>
        </bbn-list>
      </bbn-scroll>
    </div>
    <div class="bbn-w-100 bbn-padded">
      <input class="bbn-textbox bbn-w-100 bbn-large"
             @paste.prevent="copy"
             ref="paster"
             @drop.prevent.stop="copy"
             @keydown.enter="addInput"
             @keyup.prevent
             :placeholder="_('Paste or drop something...')">
    </div>
  </div>
</bbn-slider>`;
script.setAttribute('id', 'bbn-tpl-component-clipboard');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/clipboard/clipboard.css');
document.head.insertAdjacentElement('beforeend', css);

/**
 * @file bbn-clipboard component
 *
 * @description bbn-clipboard Classic input with normalized appearance.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 15/08/2019.
 */

(function (bbn) {
  "use strict";

  let app;
  /**
   * Classic input with normalized appearance
   */

  Vue.component('bbn-clipboard', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.localStorageComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent],
    props: {
      /**
       * @prop {String} ['right'] orientation
       */
      orientation: {
        type: String,
        default: 'right'
      },
      /**
       * @prop {Array} [[]] source
       */
      source: {
        type: Array
      },
      /**
       * @prop {Array} [[]] max The maximum number of items kept in the clipboard
       */
      max: {
        type: Number,
        default: 20
      },
      /**
       * @prop {Array} [[]] max The maximum number of items kept in the clipboard
       */
      maxSize: {
        type: Number,
        default: 1000000
      }
    },
    data() {
      return {
        /**
         * @data {Number} [0] opacity
         */
        opacity: 0,
        /**
         * @data {Array} items
         */
        items: this.source,
        /**
         * @data {String} [''] search
         */
        search: '',
        /**
         * @data {Boolean} [false] isSetting
         */
        isSetting: false,
        /**
         * @data {String} [null] uid
         */
        uid: null,
        /**
         * @data {Boolean} [0] isOpened
         */
        isOpened: false
      };
    },
    computed: {},
    methods: {
      /**
       * Emits a change when the state of the checkbox changes.
       *
       * @method unsearch
       */
      unsearch() {
        if (this.search.length) {
          this.search = '';
          this.items = this.source;
        }
      },
      /**
       * @todo empty function
       *
       * @method test
       */
      test(uid) {
        bbn.fn.log("TEST", uid);
      },
      /**
       *
       *
       * @method togle
       *
       */
      toggle() {
        return this.getRef('slider').toggle();
      },
      /**
       *
       * @fires getRef
       * @method show
       */
      show() {
        return this.getRef('slider').show();
      },
      /**
       *
       * @fires getRef
       * @method hide
       */
      hide() {
        return this.getRef('slider').hide();
      },
      /**
       *
       * @fires getItem
       * @method save
       */
      save(uid, title) {
        let item = this.getItem(uid);
        if (item) {
          let content = item.file || item.text;
          if (!title) {
            bbn.fn.log("NO TITLE", item);
            title = item.text;
            if (!item.file && (title.length > 15)) {
              title = bbn.fn.sanitize(bbn.fn.substr(title, 0, 50)).substr(15);
            }
          }
          bbn.fn.download(title, content, item.type);
        }
      },
      /**
       *
       * @fires getItem
       * @fires save
       * @method saveAs
       */
      saveAs(uid) {
        let item = this.getItem(uid);
        if (item) {
          let bits = item.text.split('.');
          let title = prompt(bbn._('Enter the file name'), bits.length > 1 ? '.' + bits.pop().toLowerCase() : item.text);
          if (title) {
            this.save(uid, title);
          }
        }
      },
      /**
       * @method add
       * @param data
       * @emits add
       * @fires setStorage
       * @fires unsetStorage
       */
      add(data) {
        bbn.fn.log("ADDING IN CB", data);
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
          file: '',
          pinned: false
        }];
        if (data.files && data.files.length) {
          // No need for a list of files if there is only one
          if (data.files.length === 1) {
            ar = [];
          }
          bbn.fn.each(data.files, o => {
            uid++;
            let stype = 'text';
            if (o.type !== 'text/plain') {
              if (o.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                stype = 'ms.word';
              } else if (o.type === 'application/vnd.oasis.opendocument.text') {
                stype = 'oo.text';
              } else if (o.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                stype = 'oo.sheet';
              } else if (o.type.indexOf('image/') !== 0) {
                let bits = o.type.split('/');
                stype = bits[1] || bits[0];
              } else {
                stype = o.type.length > 15 ? bbn._('Other') : o.type;
              }
            }
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
        } else if (data.str && data.str.length) {
          bbn.fn.each(data.str, o => {
            if (o.type === 'text/plain') {
              ar[0].text = o.data;
            } else {
              ar[0].type = o.type;
              if (o.type.indexOf('image/') !== 0) {
                let bits = o.type.split('/');
                ar[0].stype = bits[1] || bits[0];
              } else {
                stype = o.type;
              }
              ar[0].content = o.data;
            }
          });
        }

        let added = [];
        bbn.fn.each(ar, a => {
          let idx = bbn.fn.search(this.items, {
            text: a.text,
            type: a.type
          });
          if (idx !== -1) {
            this.unsetStorage(this.items[idx].uid);
            this.items.splice(idx, 1);
          } else {
            added.unshift(a);
          }

          if (this.hasStorage) {
            this.setStorage(a, a.uid);
          }

          this.items.unshift(a);
        });

        if (added.length) {
          bbn.fn.each(added, o => {
            bbn.fn.upload(
              'core/upload', {
                type: 'clipboard',
                file: o.data
              },
              // success
              res => bbn.fn.log('success', res),
              // failure
              res => bbn.fn.log('failure', res),
              // progress
              res => bbn.fn.log('progress', res)
            );
          });
          this.$emit('add', added);
        }
        this.$forceUpdate();
      },
      /**
       *
       * @method remove
       * @emits remove
       * @fires unsetStorage
       */
      remove(src) {
        let idx = bbn.fn.search(this.items, {
          uid: src.uid
        });
        if (idx > -1) {
          let e = new Event('remove', {
            cancelable: true
          });
          this.$emit('remove', e, this.items[idx]);
          if (!e.defaultPrevented) {
            this.unsetStorage(src.uid);
            this.items.splice(idx, 1);
          }
        }
      },
      /**
       *
       *
       * @method getItem
       *
       */
      getItem(uid) {
        return bbn.fn.getRow(this.items, {
          uid: uid
        });
      },
      /**
       *
       * @fires getRef
       * @method updateSlider
       */
      updateSlider() {
        this.$nextTick(() => {
          this.getRef('slider').onResize();
        });
      },
      /**
       *
       * @fires remove
       * @method clear
       */
      clear() {
        this.confirm(bbn._('Are you sure you want to delete the whole content of the clipboard?'), () => {
          while (this.items.length) {
            this.remove(this.items[this.items.length - 1]);
          }
        });
      },
      /**
       *
       * @fires add
       * @fires updateSlider
       * @method copy
       * @return {Boolean}
       */
      copy(e) {
        let type = e.type;
        bbn.fn.getEventData(e).then(data => {
          this.add(data);
          this.updateSlider();
          bbn.fn.log("DATA FROM " + type, data);
        });
        return true;
      },
      /**
       *
       * @fires getRef
       * @fires getItem
       * @method setClipboard
       */
      setClipboard(uid, mode) {
        let item = this.getItem(uid);
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
          } else {
            doIt();
          }
        }
      },
      /**
       * @fires getItem
       * @fires copy
       * @param {Object} e
       */
      onCopy(e) {
        if (e.clipboardData && this.isSetting && this.uid) {
          let item = this.getItem(this.uid);
          if (item) {
            e.clipboardData.setData('text/plain', this.mode === 'html' ? item.content : item.text);
            //bbn.fn.log("ITEM IS FOUND");
            let v;
            switch (this.mode) {
              case 'html':
                e.clipboardData.setData('text/html', item.content);
                break;
              case 'image':
                //bbn.fn.log("IMAGE!", item.type);
                if (item.file) {
                  e.clipboardData.setData(item.type, item.file);
                  e.clipboardData.setData('text/html', '<img src="data:' + item.type + ';base64, ' + btoa(item.file) + '" alt="' + item.text + '">');
                }
                break;
              case 'file':
                //bbn.fn.log(this.file);
                if (this.file) {
                  e.clipboardData.setData(item.type, this.file);
                }
                break;
            }
            //bbn.fn.log("SETTING " + item.text);
            //bbn.fn.log(e.clipboardData.items, e.clipboardData.items[0], e.clipboardData.items.length);
            //e.preventDefault();
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
        } else {
          this.copy(e);
        }
      },
      /**
       * @method addInput
       * @fires getRed
       * @fires add
       */
      addInput() {
        let input = this.getRef('paster');
        if (input && input.value) {
          this.add({
            raw: input.value
          });
          input.value = '';
        }
      }
    },
    /**
     * @method created
     * @fires getStorage
     * @fires unsetStorage
     */
    created() {
      if (!this.items && this.hasStorage) {
        let items = this.getStorage(this.getComponentName(), true);
        if (bbn.fn.isArray(items)) {
          let tmp = [];
          items.forEach(a => {
            let it = this.getStorage(a);
            if (it) {
              tmp.push(it);
            }
          });

          if (tmp.length) {
            this.items = tmp;
          }
        }
      }

      if (!this.items) {
        this.items = [];
      }

      if (this.hasStorage) {
        // Checking if there is no lost clipboard items
        let local = localStorage;
        let uid;
        let cp = this.getComponentName();
        for (let n in local) {
          if (!n.indexOf(cp + '-') &&
            (uid = parseInt(bbn.fn.substr(n, cp.length + 1))) &&
            !bbn.fn.getRow(this.items, {
              uid: uid
            })
          ) {
            this.unsetStorage(uid);
          }
        }
      }
    },
    /**
     * @event mounted
     */
    mounted() {
      document.addEventListener('copy', this.onCopy);
      this.ready = true;
    },
    /**
     * @event beforeDestroy
     */
    beforeDestroy() {
      document.removeEventListener('copy', this.onCopy);
    },
    watch: {
      /**
       * @watch items
       * @fires remove
       * @fires alert
       * @fires setStorage
       * @emits copy
       */
      items() {
        if (this.ready) {
          if (this.items.length > this.max) {
            let i;
            for (i = this.items.length - 1; i >= 0; i--) {
              if (!this.items[i].pinned) {
                this.remove({
                  uid: this.items[i].uid
                });
                if (this.items.length === this.max) {
                  break;
                }
              }
            }

            if (!i && (this.items.length > this.max)) {
              this.remove({
                uid: this.items[0].uid
              });
              this.alert(bbn._("Limit reached, unpin elements to add new ones"));
              return;
            }
          }

          this.setStorage(this.items.map(a => a.uid), this.getComponentName(), true);
          this.$emit('copy');
        }
      },
      /**
       * @watch search
       */
      search(val) {
        if (val.length >= 3) {
          let res = [];
          res = bbn.fn.filter(this.items, a => {
            if (a.text.toLowerCase().indexOf(this.search.toLowerCase()) >= 0) {
              return a
            }
          })
          this.items = res;
        } else {
          this.items = this.source;
        }
      }
    }
  });

})(window.bbn);
if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}