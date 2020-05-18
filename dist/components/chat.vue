<template>
<div :class="[componentClass]" v-if="usersOnlineWithoutMe.length">
  <div class="bbn-block bbn-p"
       v-if="visibleWindows.length"
       @click="currentVisible = !currentVisible; if ( currentVisible && !currentOnline ){ currentOnline = true; } if ( currentVisible && !currentOnline ){ currentOnline = true; }">
    <i :class="{
             'bbn-lg': true,
             'fab': true,
             'nf nf-fa-stack_exchange': true,
             'bbn-green': currentOnline,
             'bbn-red': !currentOnline
           }">
    </i>
    <span class="bbn-xs bbn-badge bbn-bg-red bbn-white"
          v-if="unread && currentOnline"
          v-text="unread"></span>
  </div>
  <div v-if="!usersVisible && currentOnline"
       class="bbn-block bbn-p"
       @click="usersVisible = true; currentVisible = true">
    <i class="bbn-lg nf nf-fa-users"></i>
    <span class="bbn-xs bbn-badge bbn-bg-webblue bbn-white"
          v-text="usersOnlineWithoutMe.length">
    </span>
  </div>
  <div v-if="currentWindows.length && currentOnline"
       class="bbn-block bbn-p"
       @click="currentOnline = false">
    <i class="bbn-p bbn-lg nf nf-fa-ban"></i>
  </div>
  <div v-if="usersVisible && currentOnline"
       class="bbn-chat-users bbn-widget bbn-flex-height">
    <div class="bbn-header bbn-spadded">
      <span v-text="_('Available users')"></span>
      <span class="bbn-chat-context">
        <bbn-context class="nf nf-fa-caret_down bbn-p"
                     tabindex="-1"
                     tag="i"
                     :source="getMenuFn"
        ></bbn-context>
        &nbsp;
        <i class="bbn-p nf nf-fa-times"
           @click="usersVisible = false"></i>
      </span>
    </div>
    <bbn-list :source="usersOnlineWithoutMe"
              class="bbn-flex-fill"
              :component="$options.components.user"
    >
      <!-- <div class="bbn-w-100 bbn-p"
           style="overflow: auto"
           slot="item"
           slot-scope="item"
           @click="chatTo([item.value])">
        <bbn-initial :user-id="item.value"
                     :user-name=.getField(users, 'text', 'value', item.value)"
                     :width="16"
                     :height="16"
                     style="padding-right: 3px"
        ></bbn-initial>
        <span class="bbn-large"
              v-text=.getField(users, 'text', 'value', item.value)">
        </span>
      </div> -->
    </bbn-list>
  </div>
  <container v-for="(chat, i) in visibleWindows"
             v-if="chat.visible && currentVisible"
             inline-template
             :key="chat.idx"
             :idx="chat.idx"
             :style="{
               right: (300 * (i + (usersVisible ? 1 : 0))) + 'px'
             }"
             :participants="chat.participants"
             :messages="chat.messages"
             :chat-id="chat.id"
             :user-id="userId"
             :users="users"
             @send="relay"
  >
    <div class="bbn-chat-users bbn-widget bbn-flex-height bbn-rad">
      <div class="bbn-header bbn-spadded">
        <span v-for="participant in participants"
              v-if="participant !== userId"
              class="bbn-user-title"
              v-text=.getField(users, 'text', 'value', participant)">
        </span>
        <span class="bbn-chat-context">
          <bbn-context class="nf nf-fa-caret_down bbn-p"
                       tabindex="-1"
                       tag="i"
                       :source="getMenuFn"
          ></bbn-context>
          &nbsp;
          <i class="bbn-p nf nf-fa-times"
             @click="close(idx)"></i>
          
        </span>
      </div>
      <div class="bbn-flex-fill bbn-vspadding">
        <bbn-scroll ref="scroll">
          <div class="bbn-flex-width" v-for="msg in messages">
            <div class="bbn-block" style="min-width: 20px;">
              <bbn-initial :user-id="msg.user"
                            :user-name=.getField(users, 'text', 'value', msg.user)"
                            :width="16"
                            :height="16"
                            style="vertical-align: middle">
              </bbn-initial>
            </div>
            <div class="bbn-flex-fill message" v-html="renderMsg(msg.message)"></div>
          </div>
        </bbn-scroll>
      </div>
      <div class="bbn-flex-width" style="min-height: 2em">
        <bbn-input class="bbn-flex-fill"
                   ref="input"
                   @keydown.enter.prevent="sendMessage"
                   v-model="currentMessage"
        ></bbn-input>
        <bbn-button icon="nf nf-fa-paper_plane"
                    @click="sendMessage"></bbn-button>
      </div>
    </div>
  </container>
</div>

</template>
<script>
  module.exports = /**
 * @file bbn-chat component
 *
 * @description bbn-chat component allows the user to communicate in chat sessions with other users online.
 *
 * @author Thomas Nabet
 *
 * @copyright BBN Solutions
 *
 * @created 10/02/2017.
 */


((bbn, Vue) => {
  "use strict";

  Vue.component('bbn-chat', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.localStorageComponent
     * @mixin bbn.vue.resizerComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent, bbn.vue.resizerComponent],
    props: {
      /**
       * The id of the current user
       * @prop {String} userId
       */
      userId: {
        type: String,
      },
      /**
       * The array of all users.
       * @prop {Array} [[]] users
       */
      users: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * @todo not used
       *
       * The array of groups.
       * @prop {Array} [[]] groups
       */
      groups: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * The array of users currently online.
       * @prop {Array} [[]] onlineUsers
       */
      onlineUsers: {
        type: Array,
        default(){
          return [];
        },
      },
      /**
       * True if the current user is online.
       * @prop {Boolean} [true] online
       */
      online: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true shows the list of avalaible users.
       * @prop {Boolean} [false] visible
       */
      visible: {
        type: Boolean,
        default: false
      },
      /**
       * The url used for the actions of the chat.
       * @prop {String} url
       */
      url: {
        type: String
      },
      /**
       * The array of opened windows
       * @prop {Array} [[]] windows
       */
      windows: {
        type: Array,
        default(){
          return [];
        }
      }
    },
    data(){
      let data = [];
      bbn.fn.each(this.windows, (w, i) => {
        data.push(bbn.fn.extend({}, w, {visible: false}));
      });
      return {
        /**
         * The value of the prop online.
         *
         * @data {Boolean} currentOnline
         */
        currentOnline: this.online,
        /**
         * The value of the prop visible.
         *
         * @data {Boolean} currentVisible
         */
        currentVisible: this.visible,
        /**
         * The value of the prop visible.
         *
         * @data {Boolean} usersVisible
         */
        usersVisible: this.visible,
        /**
         * @todo not used
         * @data {String} currentFilter
         */
        currentFilter: '',
        /**
         * The chat windows currently opened.
         *
         * @data {Array} currentWindows
         */
        currentWindows: data,
        /**
         * The last message sent.
         *
         * @data [null] lastMsg
         */
        lastMsg: null,
        /**
         * @data [null] onlineUsersHash
         */
        onlineUsersHash: null,
        /**
         * The number of unread messages.
         *
         * @data {Number} [0] unRead
         */
        unread: 0
      }
    },
    computed: {
      /**
       * The array of online users excluding the current user.
       *
       * @computed usersOnlineWithoutMe
       * @return {Array}
       */
      usersOnlineWithoutMe(){
        return this.onlineUsers.filter((a) => {
          return a !== this.userId;
        }).map((a) => {
          return bbn.fn.isObject(a) ? a : {value: a}
        })
      },
      /**
       * The array of visible windows
       * @computed visibleWindows
       * @return {Array}
       */
      visibleWindows(){
        let res = [];
        this.currentWindows.map((val, idx) => {
          if ( val.visible ){
            res.push(bbn.fn.extend(val, {idx: idx}));
          }
        });
        return res;
      }
    },
    methods: {
     /**
      * Returns the method bbn.fn.getField.
      *
      * @method getField
      * @return {Function}
      */
      getField: bbn.fn.getField,
      /**
       * @todo not used.
       *
       * @param {Number} i
       * @return {Boolean}
       */
      isInScreen(i){
        return (300 * (i + 1) + 300) < this.lastKnownCtWidth;
      },
      /**
       * @todo not used.
       *
       * @return {Array}
       */
      getMenuFn(){
        return [];
      },
      /**
       * Opens the chat window selected from the list of online users.
       *
       * @method chatTo
       * @param {Array} users
       */
      chatTo(users){
        if ( !Array.isArray(users) ){
          users = [users];
        }
        users.push(this.userId);
        let i = 0,
            found = false;
        for ( let win of this.currentWindows ){
          if ( win.participants.length === users.length ){
            found = true;
            for ( let p of win.participants ){
              if ( users.indexOf(p) === -1 ){
                found = false;
                break;
              }
            }
            if ( found ){
              found = i;
              break;
            }
          }
          i++;
        }
        bbn.fn.log("FOUND: " + found.toString());
        if ( found !== false ){
          if ( found !== 0 ){
            bbn.fn.log("MOVING FROM " + found);
            bbn.fn.move(this.currentWindows, found, 0);
          }
          if ( !this.currentVisible ){
            this.currentVisible = true;
          }
          this.currentWindows[0].visible = true;
          bbn.fn.log(this.currentWindows);
        }
        else{
          this.currentWindows.unshift({
            id: '',
            participants: users,
            messages: [],
            currentMessage: '',
            visible: true
          })
        }
      },
      /**
       * Create event send.
       *
       * @method relay
       * @param {Object} obj
       * @param {Number} idx
       * @emits send
       */
      relay(obj, idx){
        this.$emit('send', obj, idx);
      },
      /**
       * @todo not used.
       *
       * @param {Number} idx
       * @return {Object}
       */
      getStyle(idx){
        let r = {},
            pos = this.usersVisible ? 300 : 0,
            i = 0;
        while ( i <= idx ){
          if ( this.currentWindows.visible ){
            pos += 300;
          }
          i++;
        }
        return {right: pos + 'px'}
      },
      /**
       * Return the current window object basing on the given chat id.
       *
       * @method chatById
       * @param {String} idChat
       * @return {Boolean|Object}
       */
      chatById(idChat){
        let idx = bbn.fn.search(this.currentWindows, {id: idChat});
        if ( idx > -1 ){
          return this.currentWindows[idx];
        }
        return false;
      },
      /**
       * Add a user to the given chat.
       *
       * @method addUser
       * @param {String} idChat
       * @param {String} idUser
       */
      addUser(idChat, idUser){
        let chat = this.chatById(idChat);
        if ( chat && chat.participants.indexOf(idUser) === -1 ){
          this.post(this.url + '/actions/add_user', {id_chat: idChat, id_user: idUser}, (d) => {
            if ( d.success ){
              chat.participants.push(idUser);
            }
            else{
              this.alert(bbn._("Impossible to add the user!"))
            }
          })
        }
      },
      /**
       * @todo not used.
       *
       * @param {Object} data
       */
      receive(data){
        bbn.fn.log("RECEIVING THIS FOR CHAT", data);
        if ( data.hash ){
          if ( this.onlineUsersHash !== data.hash ){
            this.onlineUsersHash = data.hash;
            this.onlineUsers.splice(0, this.onlineUsers.length);
            if ( data.users ){
              data.users.forEach((a) => {
                this.onlineUsers.push(a);
              })
            }
          }
        }
        if ( data.chats ){
          let isStarting = !this.lastMsg;
          this.lastMsg = data.last;
          bbn.fn.iterate(data.chats, (chat_info, id_chat) => {
            let idx = bbn.fn.search(this.currentWindows, {id: id_chat});
            if ( idx === -1 ){
              let idx = bbn.fn.search(this.currentWindows, {id: ''});
              if ( idx > -1 ){
                this.currentWindows.splice(idx, 1);
              }
              this.currentWindows.push({
                id: id_chat,
                participants: chat_info.participants,
                messages: chat_info.messages,
                visible: true
              });
            }
            if ( idx > -1 ){
              if ( !this.currentWindows[idx].visible ){
                this.$set(this.currentWindows[idx], 'visible', true)
              }
              for ( let msg of chat_info.messages ){
                this.currentWindows[idx].messages.push(msg)
              }
            }
            if ( !isStarting && !this.currentVisible ){
              this.unread++;
            }
          });
        }
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.ready = true;
    },
    watch: {
      /**
       * @watch online
       * @param {Boolean} newVal
       */
      online(newVal){
        this.currentOnline = newVal;
      },
      /**
       * @watch currentVisible
       * @param {Boolean} newVal
       */
      currentVisible(newVal){
        if ( newVal ){
          this.unread = 0;
        }
      }
    },
    components: {
      /**
       * The chat window of each online user selected from the main list.
       *
       * @component container
       */
      container: {
        name: 'container',
        /**
         * @mixin bbn.vue.basicComponent
         * @memberof container
         */
        mixins: [bbn.vue.basicComponent],
        props: {
          /**
           * @prop {Number} idx
           * @memberof container
           */
          idx: {
            type: Number
          },
          /**
           * The user id.
           *
           * @prop {String} [''] userId
           * @memberof container
           */
          userId: {
            type: String,
            default: ''
          },
          /**
           * The id of the current chat.
           *
           * @prop {String} [''] chatId
           * @memberof container
           */
          chatId: {
            type: String,
            default: ''
          },
          /**
           * The array of partecipants to the chat.
           *
           * @prop {Array} [[]] partecipants
           * @memberof container
           */
          participants: {
            type: Array,
            default(){
              return []
            }
          },
          /**
           * The array of all messages and relative timestamp sent in a chat.
           *
           * @prop {Array} [[]] messages
           * @memberof container
           */
          messages: {
            type: Array,
            default(){
              return []
            }
          },
          /**
           * The array of all users (including offline ones).
           *
           * @prop {Array} [[]] users
           * @memberof container
           */
          users: {
            type: Array,
            default(){
              return []
            }
          },
        },
        data(){
          return {
            /**
             * The current message.
             *
             * @data {String} [''] currentMessage
             * @memberof container
             */
            currentMessage: '',
            //@todo not used
            siteURL: bbn.env.host,
            /**
             * @data [null] chat
             * @memberof container
             */
            chat: null
          }
        },
        methods: {
          /**
           * Returns the method bbn.fn.getField.
           *
           * @method getField
           * @memberof container
           * @return {Function}
           */
          getField: bbn.fn.getField,
          /**
           * Returns the source of the context menu of each chat window.
           * 
           * @method getMenuFn
           * @memberof container
           * @return {Array}
           */
          getMenuFn(){
            let chat = this.$parent;
            let res = [];
            /*
            let res = [
              {
                text: bbn._('Mute'),
                icon: 'zmdi zmdi-volume-off',
                action: () => {

                }
              }, {
                text: bbn._('Exit chat'),
                icon: 'nf nf-fa-sign_out_alt',
                action: () => {

                }
              }, {
                text: bbn._('Delete messages'),
                icon: 'nf nf-fa-sign_out_alt',
                action: () => {
                  bbn.fn.confirm(bbn._('Are you sure you want to delete all messages for this chat? They will be' +
                    ' deleted only on your end'), () => {
                    bbn.fn.log("DELETED")
                  })
                }
              }
            ];
            */
            // I am in the participants so if usersOnlineWithoutMe is equal to participants it's still missing one
            if ( chat.usersOnlineWithoutMe.length >= this.participants.length ){
              let users = [];
              bbn.fn.each(chat.usersOnlineWithoutMe, (o, i) => {
                if ( this.participants.indexOf(o.value) === -1 ){
                  users.push({
                    text: bbn.fn.getField(chat.users, 'text', 'value', o.value),
                    icon: 'nf nf-fa-user',
                    action: () => {
                      chat.addUser(this.chatId, o.value)
                    }
                  });
                }
              });
              res.push({
                text: bbn._('Add participant'),
                icon: 'nf nf-fa-plus',
                items: users
              });
            }
            return res;
          },
          /**
           * Closes the given chat window.
           *
           * @param {Number} idx
           * @memberof container
           */
          close(idx){
            if ( this.$parent.visibleWindows.length > 1 ){
              this.$parent.currentWindows[idx].visible = false;
            }
            else{
              this.$parent.currentVisible = false;
            }
          },
          //@todo not used
          scrollChat(){
            bbn.fn.log("SCROLL");
          },
          /**
           * Sends the current message.
           *
           * @method sendMessage
           * @emits send
           */
          sendMessage(){
            let obj = {
              users: this.participants,
              message: this.currentMessage
            };
            if ( this.chatId ){
              obj.chatId = this.chatId;
            }
            //this.$parent.currentWindows[this.idx].messages.push(obj);
            this.$emit('send', obj, this.idx);
            this.currentMessage = '';
          },
          //@todo not used
          goto(url){
            bbn.fn.link(url)
          },
          /**
           * Handles the resize of the scroll in the chat window.
           *
           * @method scrollEnd
           * @fires getRef
           * @memberof container
           *
           */
          scrollEnd(){
            this.$nextTick(() => {
              let sc = this.getRef('scroll');
              if ( sc ){
                sc.onResize();
                sc.scrollEndY();
                sc.onResize();
              }
            })
          },
          /**
           * The render of the message.
           *
           * @param {String} msg
           * @return {String}
           * @memberof container
           */
          renderMsg(msg){
            msg = bbn.fn.html2text(msg);
            let matches = msg.match(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/g);
            if ( matches ){
              bbn.fn.each(matches, (v) => {
                if ( v.indexOf(bbn.env.host) === 0 ){
                  msg = msg.replace(v, '<a href="javascript:;" onclick="bbn.fn.link(\'' + v.substr(bbn.env.host.length + 1) + '\')">' + v.substr(bbn.env.host.length + 1) + '</a>');
                }
                else{
                  msg = msg.replace(v, '<a href="' + v + '" target="_blank">' + v + '</a>');
                }
              })
            }
            return msg;
          }
        },
        /**
         * @event mounted
         * @fires scrollEnd
         * @fires getRef
         * @memberof container
         */
        mounted(){
          this.scrollEnd();
          this.getRef('input').focus()
        },
        /**
         * @event updated
         * @fires scrollEnd
         * @memberof container
         */
        updated(){
          this.scrollEnd();
        }
      },
      /**
       * Represents the individual user in the chat.
       *
       * @component user
       */
      user: {
        template: `
<div class="bbn-w-100 bbn-p"
      style="overflow: auto"
      @click="cp.chatTo([source.value])">
  <bbn-initial :user-id="source.value"
               :user-name="userName"
               :width="16"
               :height="16"
               style="padding-right: 3px"
  ></bbn-initial>
  <span class="bbn-large"
        v-text="userName">
  </span>
</div>
        `,
        props: {
           /**
           * @prop {Object} source
           * @memberof user
           */
          source: {
            type: Object
          }
        },
        data(){
          let cp = this.closest("bbn-chat");
          return {
            /**
             * @data {String} cp
             * @memberof user
             */
            cp: cp,
            /**
             * @data {String} userName
             * @memberof user
             */
            userName: bbn.fn.getField(cp.users, 'text', 'value', this.source.value)
          }
        }
      }
    }
  });

})(bbn, Vue);

</script>
<style scoped>
.bbn-chat .bbn-badge {
  padding-left: 0.5em;
  padding-right: 0.5em;
}
.bbn-chat > .bbn-block {
  margin-right: 0.2em;
}
.bbn-chat > .bbn-block > i {
  margin-right: 0.7em;
}
.bbn-chat > .bbn-block > span.bbn-badge {
  position: absolute;
  bottom: 0;
  right: 0;
}
.bbn-chat .bbn-chat-context {
  position: absolute;
  right: 2px;
  top: 2px;
  display: inline-block;
}
.bbn-chat .bbn-chat-users {
  position: absolute;
  right: 0;
  z-index: 5;
  bottom: 25px;
  height: 200px;
  width: 300px;
}
.bbn-chat .bbn-chat-users .bbn-user-title {
  margin-right: 5px;
}
.bbn-chat .bbn-chat-users .message a {
  word-wrap: break-word;
}

</style>
