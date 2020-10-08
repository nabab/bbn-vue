/**
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

  let cp = false;

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
      let isDark = false;
      if ( appui && appui.theme && appui.themes ){
        isDark = bbn.fn.getField(appui.themes, 'isDark', {value: appui.theme});
      }
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
         * @data {Boolean} usersVisible
         */
        usersVisible: this.visible,
        /**
         * @todo not used
         * @data {String} currentFilter
         */
        currentFilter: '',
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
         * The current chats.
         * @data {Array} currentChats
         */
        currentChats: [],
        /**
         * The current chats hash.
         * @data {String|null} chatHash
         */
        chatsHash: null,
        /**
         * The chat coordinates.
         * @data {String} bottomCoord
         */
        bottomCoord: '',
        /**
         * Indicates if a dark theme is used
         * @data {Boolean} isDarkTheme
         */
        isDarkTheme: isDark
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
        return this.currentChats.filter(c => c.visible);
      },
      mainMenu(){
        let res = [];
        if (this.currentOnline ){
          res.push({
            icon: 'nf nf-oct-organization',
            text: bbn._('New group chat'),
            action: () => {
              this.getPopup().open({
                title: bbn._('New group chat'),
                component: this.$options.components.newGroup,
                width: 300,
                height: 400
              })
            }
          });
        }
        res.push({
          icon: this.currentOnline ? 'nf nf-mdi-message_bulleted_off bbn-red' : 'nf nf-mdi-message bbn-green',
          text: this.currentOnline ? bbn._('Switch offline') : bbn._('Switch online'),
          action: this.currentOnline ? this.switchOffline : this.switchOnline
        });
        return res;
      },
      allUsers(){
        if ( this.users && this.users.length ){
          return bbn.fn.order(this.users.filter(u => u.value !== this.userId), 'text', 'ASC')
        }
        return [];
      },
      allUsersWithoutChats(){
        let res = [];
        res = res.concat(this.allUsers.filter(
          u => this.onlineUsers.includes(u.value) && !Object.values(this.currentChats).filter(
            c => (c.participants.length === 1) && c.participants.includes(u.value)
          ).length
        ))
        res = res.concat(this.allUsers.filter(
          u => !this.onlineUsers.includes(u.value) && !Object.values(this.currentChats).filter(
            c => (c.participants.length === 1) && c.participants.includes(u.value)
          ).length
        ))
        return res;
      }
    },
    methods: {
      /**
       * Alias of bbn.fn.getField
       *
       * @method getField
       */
      getField: bbn.fn.getField,
      /**
       * Alias of bbn.fn.shorten
       *
       * @method shorten
       */
      shorten: bbn.fn.shorten,
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
       * Return the current window object basing on the given chat id.
       *
       * @method chatById
       * @param {String} idChat
       * @return {Boolean|Object}
       */
      chatById(idChat){
        return bbn.fn.getRow(this.currentChats, {id: idChat})
      },
      /**
       * Opens the chat window selected from the list of online users.
       *
       * @method chatTo
       * @param {Array} users
       */
      chatTo(idUser){
        let chat = this.currentChats.filter(c => (c.participants.length === 1) && c.participants.includes(idUser));
        if ( chat.length ){
          this.maximaze(chat[0].idx)
          return;
        }
        if ( this.currentOnline ){
          let idx = this.getNewIdx();
          this.currentChats.push({
            id: '',
            idTemp: bbn.fn.randomString(24, 24),
            idx: idx,
            info: {
              title: '',
              creator: this.userId
            },
            participants: [idUser],
            admins: [this.userId],
            messages: [],
            visible: true,
            minimized: false,
            active: false,
            unread: 0
          });
          this.activate(idx);
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
       * @method receive
       * @param {Object} data
       * @fires chatById
       * @fires findByKey
       */
      receive(data){
        bbn.fn.log("RECEIVING THIS FOR CHAT", data);
        if ( data.hash ){
          if ( this.onlineUsersHash !== data.hash ){
            this.onlineUsersHash = data.hash;
            this.onlineUsers.splice(0, this.onlineUsers.length);
            if ( data.users ){
              this.onlineUsers.push(...data.users);
            }
          }
        }
        if ( data.id_temp && data.id_chat ){
          let chat = bbn.fn.getRow(this.currentChats, {idTemp: data.id_temp});
          if ( chat ){
            this.$set(chat, 'id', data.id_chat);
            this.$set(chat.info, 'id', data.id_chat);
            delete(chat.idTemp);
          }
        }
        if ( data.chats ){
          let isStarted = !!this.lastMsg,
              chats = Object.values(data.chats.current),
              chatsIds = Object.keys(data.chats.current);
          this.lastMsg = data.chats.last;
          if ( data.chats.hash ){
            this.chatsHash = data.chats.hash;
          }
          if ( !isStarted ){
            this.currentChats = bbn.fn.map(chats, (v, i) => bbn.fn.extend(true, {
              id: v.info.id,
              idx: i,
              visible: false,
              minimized: false,
              active: false,
              unread: 0
            }, v))
          }
          else {
            bbn.fn.each(this.currentChats, (c, i) => {
              if ( !chatsIds.includes(c.id) ){
                this.currentChats.splice(i, 1);
              }
            })
            bbn.fn.iterate(data.chats.current, (chat_info, id_chat) => {
              let chat = this.chatById(id_chat);
              if ( chat_info.messages ){
                chat_info.messages = bbn.fn.map(chat_info.messages, m => bbn.fn.extend(true, {unread: m.user !== this.userId}, m));
              }
              if ( chat ){
                if ( chat_info.info ){
                  this.$set(chat, 'info', chat_info.info)
                }
                if ( chat_info.messages ){
                  if ( chat.messages === undefined ){
                    this.$set(chat, 'messages', []);
                  }
                  if ( chat_info.messages.length ){
                    chat.messages.push(...chat_info.messages);
                    chat.unread += chat_info.messages.filter(m => m.unread).length;
                    if ( chat.visible ){
                      let cont = this.findByKey(chat.idx, 'chat');
                      if ( cont ){
                        cont.scrollEnd()
                      }
                    }
                    else if ( this.currentOnline) {
                      this.minimize(chat.idx);
                    }
                  }
                }
                if ( chat_info.participants && !bbn.fn.isSame(chat_info.participants, chat.participants) ){
                  chat.participants.splice(0);
                  chat.participants.push(...chat_info.participants);
                }
                if ( chat_info.admins && !bbn.fn.isSame(chat_info.admins, chat.admins) ){
                  chat.admins.splice(0);
                  chat.admins.push(...chat_info.admins);
                }
              }
              else {
                let idx = this.getNewIdx(),
                    visible = chat_info.info.creator && (this.userId === chat_info.info.creator);
                this.currentChats.push(bbn.fn.extend(true, {
                  id: id_chat,
                  idx: idx,
                  visible: visible,
                  minimized: false,
                  active: false,
                  unread: chat_info.messages ? chat_info.messages.length : 0
                }, chat_info));
                if ( this.currentOnline && !visible ){
                  this.minimize(idx)
                }
              }
            });
          }
        }
      },
      getNewIdx(){
        let max = -1;
        bbn.fn.each(this.currentChats, c => {
          if ( c.idx > max ){
            max = c.idx;
          }
        });
        return max + 1;
      },
      switchOnline(){
        this.currentOnline = true;
        this.$emit('statusChanged', true, this.onlineUsersHash, this.chatsHash);
      },
      switchOffline(){
        bbn.fn.each(this.currentChats, c => {
          c.visible = false;
          c.minimized = false;
        })
        this.currentOnline = false;
        this.$emit('statusChanged', false);
      },
      isOnline(idUser){
        return this.onlineUsers.includes(idUser);
      },
      getParticipants(participants){
        if ( bbn.fn.isArray(participants) ){
          return participants.filter(p => p !== this.userId).map(p => bbn.fn.getRow(this.allUsers, 'value', p));
        }
        return [];
      },
      getParticipantsFormatted(participants){
        if ( bbn.fn.isArray(participants) && participants.length ){
          if ( bbn.fn.isObject(participants[0]) ){
            return participants.map(p => p.text).join(', ');
          }
          else {
            return this.getParticipantsFormatted(this.getParticipants(participants))
          }
        }
        return '';
      },
      onSelectChat(data, idx, index, ev){
        ev.preventDefault();
        let chat = this.chatById(data.id);
        if ( chat ){
          this.$set(chat, 'visible', true);
        }
      },
      onSelectUser(data, idx, index, ev){
        ev.preventDefault();
        this.chatTo(data.value);
      },
      /**
       * Closes the given chat window.
       * @method close
       * @param {Number} idx
       */
      close(idx){
        let i = bbn.fn.search(this.currentChats, {idx: idx});
        if ( (i > -1) && this.currentChats[i] ){
          this.$set(this.currentChats[i], 'visible', false);
        }
      },
      /**
       * Minimizes the given chat window.
       * @method minimize
       * @param {Number} idx
       * @fires close
       */
      minimize(idx){
        let i = bbn.fn.search(this.currentChats, {idx: idx});
        if ( (i > -1) && this.currentChats[i] ){
          this.$set(this.currentChats[i], 'minimized', true);
          this.close(idx);
        }
      },
      /**
       * Maximazes the given chat window.
       * @method maximaze
       * @param {Number} idx
       */
      maximaze(idx){
        let i = bbn.fn.search(this.currentChats, {idx: idx});
        if ( (i > -1) && this.currentChats[i] ){
          this.$set(this.currentChats[i], 'minimized', false);
          this.$set(this.currentChats[i], 'visible', true);
        }
      },
      /**
       * Toggle minimized to the given chat window.
       * @method toggleMinimized
       * @fires minimize
       * @fires maximaze
       */
      toggleMinimized(idx){
        let i = bbn.fn.search(this.currentChats, {idx: idx});
        if ( (i > -1) && this.currentChats[i] ){
          if ( this.currentChats[i].minimized ){
            this.maximaze(idx);
          }
          else {
            this.minimize(idx)
          }
        }
      },
      activate(idx){
        let i = bbn.fn.search(this.currentChats, {idx: idx});
        if ( (i > -1) && this.currentChats[i] ){
          let chat = this.currentChats[i];
          this.$set(chat, 'active', true);
          if ( chat.id ){
            this.$emit('lastActivityChanged', {id_chat: chat.id, id_user: this.userId});
          }
          if ( chat.unread ){
            this.$set(chat, 'unread', 0);
          }
          setTimeout(() => {
            if ( chat.messages.length ){
              for ( let i = chat.messages.length - 1; i > -1; i-- ){
                if ( !chat.messages[i].unread ){
                  break;
                }
                chat.messages[i].unread = false;
              }
            }
          }, 2000);
        }
      },
      deactivate(idx){
        let i = bbn.fn.search(this.currentChats, {idx: idx});
        if ( (i > -1) && this.currentChats[i] ){
          this.$set(this.currentChats[i], 'active', false);
          this.$emit('lastActivityChanged', {id_chat: this.currentChats[i].id, id_user: this.userId});
        }
      }
    },
    /**
     * @event created
     */
    created(){
      cp = this;
    },
    /**
     * @event mounted
     */
    mounted(){
      let coord = this.$el.offsetParent.getBoundingClientRect();
      this.bottomCoord = `${coord.bottom - coord.top}px`;
      this.ready = true;
    },
    watch: {
      /**
       * @watch online
       * @param {Boolean} newVal
       */
      online(newVal){
        this.currentOnline = newVal;
      }
    },
    components: {
      /**
       * The chat window of each online user selected from the main list.
       *
       * @component chat
       */
      chat: {
        name: 'chat',
        /**
         * @mixin bbn.vue.basicComponent
         * @memberof chat
         */
        mixins: [bbn.vue.basicComponent],
        props: {
          /**
           * @prop {Number} idx
           * @memberof chat
           */
          idx: {
            type: Number
          },
          /**
           * The user id.
           *
           * @prop {String} [''] userId
           * @memberof chat
           */
          userId: {
            type: String,
            default: ''
          },
          /**
           * The id of the current chat.
           *
           * @prop {String} [''] chatId
           * @memberof chat
           */
          chatId: {
            type: String,
            default: ''
          },
          /**
           * The array of partecipants to the chat.
           *
           * @prop {Array} [[]] partecipants
           * @memberof chat
           */
          participants: {
            type: Array,
            default(){
              return []
            }
          },
          /**
           * The array of the admins of the chat.
           *
           * @prop {Array} [[]] admins
           * @memberof chat
           */
          admins: {
            type: Array,
            default(){
              return []
            }
          },
          /**
           * The array of all messages and relative timestamp sent in a chat.
           *
           * @prop {Array} [[]] messages
           * @memberof chat
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
           * @memberof chat
           */
          users: {
            type: Array,
            default(){
              return []
            }
          },
          /**
           * The conversation's info
           * @prop {Object} [{title: ''}] info
           * @memberof chat
           */
          info: {
            type: Object,
            default(){
              return {
                title: ''
              }
            }
          },
          /**
           * A temporary id used for a new chat
           * @prop {String} [''] idTemp
           * @memberof chat
           */
          idTemp: {
            type: String,
            default: ''
          },
          /**
           * Indicates if the chat is active
           * @prop {Boolean} [false] active
           */
          active: {
            type: Boolean,
            default: false
          }
        },
        data(){
          return {
            /**
             * The current message.
             *
             * @data {String} [''] currentMessage
             * @memberof chat
             */
            currentMessage: '',
            /**
             * @data {Vue} chat
             * @memberof chat
             */
            cp: cp,
            /**
             * Indicates if a loading is in progress
             * @data {Boolean} [false] isLoading
             * @memberof chat
             */
            isLoading: false,
            /**
             * Indicates if to show or not the chat configuration panel
             * @data {Boolean} [false] showInfo
             * @memberof chat
             */
            showInfo: false
          }
        },
        computed: {
          /**
           * True if the chat is group
           * @computed isGroup
           * @memberof chat
           * @return {Boolean}
           */
          isGroup(){
            return (this.participants.length > 1) || this.info.title
          },
          /**
           * The current chat title
           * @coputed currentTitle
           * @memberof chat
           * @fires cp.getParticipants
           * @fires cp.getParticipantsFormatted
           * @return {String}
           */
          currentTitle(){
            return this.info.title ||
              this.cp.getParticipantsFormatted(this.participants)
          }
        },
        methods: {
          /**
           * Alias of bbn.fn.getField method
           * @method getField
           * @memberof chat
           * @return {Function}
           */
          getField: bbn.fn.getField,
          /**
           * Returns the source of the context menu of each chat window.
           * @method getMenuFn
           * @memberof chat
           * @return {Array}
           */
          getMenu(){
            let res = [];
            if ( this.cp.currentOnline ){
              res.push({
                text: bbn._('Info'),
                icon: 'nf nf-fa-info',
                action: () => {
                  this.showInfo = true;
                }
              });
            }
            res.push({
              text: bbn._('Leave the chat'),
              icon: 'nf nf-mdi-comment_remove',
              action: () => {
                this.confirm(bbn._('Are you sure?'), () => {
                  this.leave();
                })
              }
            });
            return res;
          },
          /**
           * Closes the chat window.
           * @method close
           * @memberof chat
           * @fires cp.close
           */
          close(){
            this.cp.close(this.idx);
          },
          /**
           * Minimizes the chat window.
           * @method minimize
           * @memberof chat
           * @fires cp.minimize
           */
          minimize(){
            this.cp.minimize(this.idx);
          },
          /**
           * Leaves the chat.
           * @method
           */
          leave(){
            if ( this.chatId ){
              this.post(this.cp.url + '/actions/leave', {id_chat: this.chatId}, (d) => {
                if ( !d.success ){
                  this.alert(bbn._("Impossible to leave the chat!"))
                }
              })
            }
            else if ( this.idTemp ){
              this.cp.currentChats.splice(bbn.fn.search(this.cp.currentChats, {idx:this.idx}), 1);
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
            if ( this.currentMessage ){
              let obj = {
                id_chat: this.chatId || null,
                users: this.participants,
                text: this.currentMessage,
                title: this.info.title,
                lastChat: this.cp.lastMsg
              };
              if ( this.idTemp ){
                obj.id_temp = this.idTemp;
              }
              this.$emit('send', obj, this.idx);
              this.currentMessage = '';
            }
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
           * @memberof chat
           *
           */
          scrollEnd(){
            this.$nextTick(() => {
              let sc = this.getRef('scroll');
              if ( sc ){
            //    sc.onResize();
                sc.scrollEndY();
              //  sc.onResize();
              }
            })
          },
          /**
           * The render of the message.
           *
           * @param {String} msg
           * @return {String}
           * @memberof chat
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
          },
          getTime(t){
            return moment.unix(t).format('HH:mm');
          },
          getDate(d){
            return moment.unix(d).format('DD MMMM YYYY');
          },
          isToday(d){
            return moment().format('DD/MM/YYYY') === moment.unix(d).format('DD/MM/YYYY');
          },
          loadMoreMessages(){
            if ( this.messages.length ){
              this.isLoading = true;
              this.post(this.cp.url + '/actions/messages', {
                id_chat: this.chatId,
                time: this.messages[0].time
              }, d => {
                this.isLoading = false;
                if ( d.messages && d.messages.length ){
                  this.messages.unshift(...d.messages);
                }
              }, e => {
                this.isLoading = false;
              });
            }
          }
        },
        /**
         * @event mounted
         * @fires scrollEnd
         * @fires getRef
         * @memberof chat
         */
        mounted(){
          //this.scrollEnd();
          if ( this.cp.currentOnline ){
            this.getRef('input').focus()
          }
        },
        /**
         * @event updated
         * @fires scrollEnd
         * @memberof chat
         */
        updated(){
          //this.scrollEnd();
        }
      },
      /**
       * Represents the individual user in the chat.
       *
       * @component user
       */
      user: {
        template: `
<div class="bbn-grid bbn-p bbn-vmiddle bbn-vxsmargin"
      style="grid-template-columns: max-content auto max-content"
>
  <div class="bbn-middle" style="min-width: 1.5em">
    <bbn-initial :user-name="source.text"
                :width="16"
                :height="16"
    ></bbn-initial>
  </div>
  <div class="bbn-ellipsis bbn-w-100"
       v-text="source.text"
  ></div>
  <div class="bbn-middle" style="min-width: 1.5em">
    <i :class="{
         'nf nf-fa-circle': cp.isOnline(source.value),
         'bbn-green': cp.isOnline(source.value)
       }"
    ></i>
  </div>
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
          return {
            /**
             * @data {Vue} cp
             * @memberof user
             */
            cp: cp
          }
        }
      },
      /**
       * @component active
       */
      active: {
        template: `
<div class="bbn-grid bbn-p bbn-vmiddle bbn-vxsmargin"
      style="grid-template-columns: max-content auto max-content max-content"
      :title="participantsFormatted"
>
  <div class="bbn-middle" style="min-width: 1.5em">
    <bbn-initial :user-name="participantsFormatted"
                 :width="16"
                 :height="16"
                 v-if="!isGroup && !source.info.title"
    ></bbn-initial>
    <i v-else
       class="nf nf-oct-organization"></i>
  </div>
  <div class="bbn-ellipsis bbn-w-100"
       v-text="source.info.title || participantsFormatted"
  ></div>
  <div class="bbn-middle">
    <span v-if="source.unread"
          class="bbn-xs bbn-badge bbn-primary"
          v-text="source.unread">
    </span>
  </div>
  <div class="bbn-middle" style="min-width: 1.5em">
    <i v-if="cp.currentOnline && (online.length === participants.length)"
       class="nf nf-fa-circle bbn-green"
       :title="onlineFormatted"
    ></i>
    <i v-else-if="cp.currentOnline && isGroup && online.length"
       class="nf nf-fa-circle bbn-orange"
       :title="onlineFormatted"
    ></i>
  </div>
</div>
        `,
        name: 'active',
        props: {
           /**
           * @prop {Object} source
           * @memberof active
           */
          source: {
            type: Object
          }
        },
        data(){
          return {
            cp: cp
          }
        },
        computed: {
          participants(){
            return this.cp.getParticipants(this.source.participants);
          },
          participantsFormatted(){
            if ( this.participants ){
              return this.cp.getParticipantsFormatted(this.participants);
            }
            return '';
          },
          isGroup(){
            return this.participants.length > 1;
          },
          online(){
            return this.participants.filter(p => this.cp.isOnline(p.value))
          },
          onlineFormatted(){
            if ( this.online ){
              return this.cp.getParticipantsFormatted(this.online);
            }
            return '';
          }
        }
      },
      info: {
        template: `
<div class="bbn-spadded">
  <div v-if="(participants.length > 1) || info.title || titleVisible"
       class="bbn-header bbn-c"
  >` + bbn._('TITLE') + `</div>
  <div v-if="(participants.length > 1) || info.title || titleVisible"
       class="bbn-flex-width bbn-vmiddle bbn-top-sspace"
  >
    <bbn-input class="bbn-flex-fill bbn-right-sspace"
              v-model="currentTitle"
              :readonly="!isAdmin"
    ></bbn-input>
    <bbn-button icon="nf nf-fa-save"
                :notext="true"
                @click="saveTitle"
                v-if="isAdmin && chatId && currentTitle"
    ></bbn-button>
  </div>
  <div class="bbn-header bbn-top-sspace bbn-vmiddle">
    <div class="bbn-flex-fill bbn-c">` + bbn._('PARTICIPANTS') + `</div>
    <div class="bbn-hsmargin">
      <i class="bbn-p nf nf-fa-plus"
         @click="onAddUserClick"
      ></i>
    </div>
  </div>
  <div class="bbn-spadded bbn-bordered bbn-grid bbn-no-border-top"
      style="grid-template-columns: max-content auto max-content"
  >
    <template v-for="p in currentParticipants"
        class=""
    >
      <div class="bbn-middle"
          style="min-width: 1.5em"
      >
        <bbn-initial :user-name="p.text"
                    :width="16"
                    :height="16"
        ></bbn-initial>
      </div>
      <div class="bbn-ellipsis bbn-w-100"
          v-text="p.text"
      ></div>
      <div class="bbn-middle"
          style="min-width: 1.5em"
      >
        <template v-if="isAdmin">
          <i v-if="!admins.includes(p.value) || isCreator"
            class="bbn-p nf nf-fa-trash bbn-red bbn-left-sspace"
            @click="removeUser(p.value)"
          ></i>
          <i v-if="isCreator"
            :class="['bbn-p', 'nf nf-fa-star', 'bbn-left-sspace', {
              'bbn-primary-text-alt': admins.includes(p.value)
            }]"
            @click="toggleAdmin(p.value)"
          ></i>
        </template>
      </div>
    </template>
  </div>
</div>
        `,
        name: 'info',
        props: {
          chatId: {
            type: String,
            default: ''
          },
          userId: {
            type: String,
            required: true
          },
          info: {
            type: Object,
            required: true
          },
          participants: {
            type: Array,
            defauult(){
              return []
            }
          },
          admins: {
            type: Array,
            defauult(){
              return []
            }
          },
          /**
           * The array of all users (including offline ones).
           *
           * @prop {Array} [[]] users
           * @memberof info
           */
          users: {
            type: Array,
            default(){
              return []
            }
          },
          titleVisible: {
            type: Boolean,
            default: false
          }
        },
        data(){
          return {
            currentTitle: this.info.title || ''
          }
        },
        computed: {
          currentParticipants(){
            return cp.getParticipants(this.participants);
          },
          isCreator(){
            return this.userId === this.info.creator
          },
          isAdmin(){
            return this.admins.includes(this.userId)
          }
        },
        methods: {
          saveTitle(){
            if ( this.chatId ){
              this.post(cp.url + '/actions/title', {
                id_chat: this.chatId,
                title: this.currentTitle
              }, d => {
                if ( d.success ){
                  this.$set(this.info, 'title', this.currentTitle)
                }
                else {
                  this.alert(bbn._("Impossible to save the chat'stitle"));
                }
              })
            }
          },
          toggleAdmin(idUser){
            let idx = this.admins.indexOf(idUser);
            if ( idx === -1 ){
              this.addAdmin(idUser)
            }
            else {
              this.removeAdmin(idUser)
            }
          },
          onAddUserClick(){
            this.getPopup().open({
              title: bbn._('Select user'),
              component: this.$options.components.users,
              source: {
                participants: this.participants,
                creator: this.info.creator,
                onSelect: this.addUser
              },
              scrollable: false,
              width: 300
            })
          },
          /**
           * Add a user to the chat.
           *
           * @method addUser
           * @param {String} idUser
           * @memberof info
           */
          addUser(idUser){
            if (
              !this.participants.includes(idUser) &&
              this.admins.includes(this.userId)
            ){
              if ( this.chatId ){
                this.post(cp.url + '/actions/user/add', {
                  id_chat: this.chatId,
                  id_user: idUser
                }, (d) => {
                  if ( !d.success ){
                    this.alert(bbn._("Impossible to add the user!"))
                  }
                })
              }
              else {
                let title = cp.getParticipantsFormatted(this.participants);
                this.participants.push(idUser);
                if ( this.info.title === title ){
                  this.$set(this.info, 'title', cp.getParticipantsFormatted(this.participants))
                }
              }
            }
          },
          removeUser(idUser){
            if (
              this.participants.includes(idUser) &&
              (
                !this.admins.includes(idUser) ||
                (
                  (idUser !== this.info.creator) &&
                  (this.userId === this.info.creator)
                )
              )
            ){
              this.confirm(bbn._('Are you sure?'), () => {
                let remove = () => {
                  let title = cp.getParticipantsFormatted(this.participants),
                      changeTitle = this.info.title === title;
                  this.participants.splice(this.participants.indexOf(idUser), 1);
                  if ( changeTitle ){
                    this.$set(this.info, 'title', cp.getParticipantsFormatted(this.participants))
                  }
                };
                if ( this.chatId ){
                  this.post(cp.url + '/actions/user/remove', {
                    id_chat: this.chatId,
                    id_user: idUser
                  }, (d) => {
                    if ( d.success ){
                      remove();
                    }
                    else{
                      this.alert(bbn._("Impossible to remove the user!"))
                    }
                  })
                }
                else {
                  remove();
                }
              })
            }
          },
          addAdmin(idUser){
            if (
              (this.userId === this.info.creator) &&
              (idUser !== this.userId) &&
              !this.admins.includes(idUser)
            ){
              if ( this.chatId ){
                this.post(cp.url + '/actions/admin/add', {
                  id_chat: this.chatId,
                  id_user: idUser
                }, d => {
                  if ( d.success ){
                    this.admins.push(idUser);
                  }
                  else {
                    this.alert(bbn._('Impossibile to set this user as admin!'))
                  }
                })
              }
              else {
                this.admins.push(idUser);
              }
            }
          },
          removeAdmin(idUser){
            if (
              (this.userId === this.info.creator) &&
              (idUser !== this.userId) &&
              this.admins.includes(idUser)
            ){
              if ( this.chatId ){
                this.post(cp.url + '/actions/admin/remove', {
                  id_chat: this.chatId,
                  id_user: idUser
                }, d => {
                  if ( d.success ){
                    this.admins.splice(this.admins.indexOf(idUser), 1);
                  }
                  else {
                    this.alert(bbn._('Impossibile to set this user as admin!'))
                  }
                })
              }
              else {
                this.admins.splice(this.admins.indexOf(idUser), 1);
              }
            }
          },
        },
        mounted(){
          if ( !this.currentTitle ){
            this.currentTitle = cp.getParticipantsFormatted(this.currentParticipants)
          }
        },
        watch: {
          currentTitle(newVal){
            this.$emit('titleChanged', newVal)
          },
          'info.title'(newVal){
            this.currentTitle = newVal;
          }
        },
        components: {
          users: {
            template: `
<div class="bbn-vpadded bbn-overlay">
  <bbn-tree :source="users"></bbn-tree>
</div>
            `,
            name: 'users',
            props: {
              source: {
                type: Object
              }
            },
            data(){
              return {
                users: bbn.fn.map(cp.users.filter(u => !this.source.participants.includes(u.value) && (u.value !== this.source.creator)), u => {
                  return bbn.fn.extend(true, {
                    component: this.$options.components.user
                  }, u)
                })
              }
            },
            components: {
              user: {
                template: `
<span class="bbn-iblock bbn-p" @click="select">
  <bbn-initial :user-name="source.text"
               :width="16"
               :height="16"
  ></bbn-initial>
  <span class="bbn-left-sspace"
        v-text="source.text"
  ></span>
</span>
                `,
                name: 'user',
                props: {
                  source: {
                    type: Object
                  }
                },
                methods: {
                  select(){
                    this.closest('bbn-tree').$parent.source.onSelect(this.source.value);
                    this.getPopup().close();
                  }
                }
              }
            }
          }
        }
      },
      newGroup: {
        template: `
<bbn-form :validation="validation"
          :source="chat"
          :action="cp.url + '/actions/group'"
>
  <component :is="cp.$options.components.info"
             :info="{
               title: '',
               creator: cp.userId
             }"
             :participants="chat.participants"
             :admins="chat.admins"
             :user-id="cp.userId"
             :users="cp.users"
             @titleChanged="title => chat.title = title"
             :titleVisible="true"
  ></component>
</bbn-form>
        `,
        name: 'newGroup',
        data(){
          return {
            cp: cp,
            chat: {
              title: '',
              participants: [cp.userId],
              admins: [cp.userId]
            }
          }
        },
        methods: {
          validation(d){
            if ( d.participants.length < 3 ){
              this.alert(bbn._('Two or more participants are required'));
              return false;
            }
            if ( !d.title ){
              this.alert('The title is required')
              return false;
            }
            return true
          }
        }
      }
    }
  });

})(bbn, Vue);
