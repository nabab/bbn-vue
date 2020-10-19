/**
 * @file bbn-chat component
 * @description bbn-chat component allows the user to communicate in chat sessions with other users online.
 * @author Thomas Nabet, Mirko Argentino
 * @copyright BBN Solutions
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
       * The array of groups.
       * @prop {Array} [[]] groups
       * @todo not used yet
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
       * The url used for the actions of the chat.
       * @prop {String} url
       */
      url: {
        type: String
      }
    },
    data(){
      let isDark = false;
      if ( appui && appui.theme && appui.themes ){
        isDark = bbn.fn.getField(appui.themes, 'isDark', {value: appui.theme});
      }
      return {
        /**
         * True if the current user is online.
         * @data {Boolean} currentOnline
         */
        currentOnline: this.online,
        /**
         * True if the main window is visibile.
         * @data {Boolean} [false] mainWindowVisible
         */
        mainWindowVisible: false,
        /**
         * The last chat time.
         * @data {Number} [null] lastChat
         */
        lastChat: null,
        /**
         * The current chats.
         * @data {Array} [[]] currentChats
         */
        currentChats: [],
        /**
         * The current chats hash.
         * @data {String} [null] chatHash
         */
        chatsHash: null,
        /**
         * The current users hash.
         * @data {String} [null] onlineUsersHash
         */
        onlineUsersHash: null,
        /**
         * Indicates if we have received the first response with the users hash
         * @data {Boolean} [false] usersReceived
         */
        usersReceived: false,
        /**
         * Indicates if we have received the first response with the chats hash
         * @data {Boolean} [false] chatsReceived
         */
        chatsReceived: false,
        /**
         * The chat coordinates.
         * @data {String} [''] bottomCoord
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
      /**
       * The main menu
       * @computed mainMenu
       * @returns {Array}
       */
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
      /**
       * The users list ordered by name
       * @computed allUSers
       * @returns {Array}
       */
      allUsers(){
        if ( this.users && this.users.length ){
          return bbn.fn.order(this.users.filter(u => u.value !== this.userId), 'text', 'ASC')
        }
        return [];
      },
      /**
       * The list of the users without chats
       * @computed allUsersWithoutChats
       * @returns {Array}
       */
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
      },
      /**
       * Indicates if the first response with the chats hash and the users hash
       * @computed isReady
       * @return {Boolean}
       */
      isReady(){
        return this.chatsReceived && this.usersReceived;
      }
    },
    methods: {
      /**
       * Alias of bbn.fn.getField
       * @method getField
       */
      getField: bbn.fn.getField,
      /**
       * Alias of bbn.fn.shorten
       * @method shorten
       */
      shorten: bbn.fn.shorten,
      /**
       * Return the current window object basing on the given chat id.
       * @method chatById
       * @param {String} idChat
       * @return {Boolean|Object}
       */
      chatById(idChat){
        return bbn.fn.getRow(this.currentChats, {id: idChat})
      },
      /**
       * Opens the chat window by the given user id
       * @method chatTo
       * @param {String} idUser
       * @fires maximaze
       * @fires getNewIdx
       * @fires activate
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
       * @method receive
       * @param {Object} data
       * @fires chatById
       * @fires findByKey
       * @fires minimize
       * @fires getNewIdx
       */
      receive(data){
        bbn.fn.log("RECEIVING THIS FOR CHAT", data);
        if ('online' in data) {
          if (data.online) {
            this.currentOnline = true;
            //this.$emit('statusChanged', true, this.onlineUsersHash, this.chatsHash, this.lastChat);
          }
          else {
            bbn.fn.each(this.currentChats, c => {
              c.visible = false;
              c.minimized = false;
            })
            this.currentOnline = false;
            //this.$emit('statusChanged', false, this.onlineUsersHash, this.chatsHash, this.lastChat);
          }
        }
        if ( data.users && data.users.hash ){
          if ( this.onlineUsersHash !== data.users.hash ){
            this.onlineUsersHash = data.users.hash;
            this.onlineUsers.splice(0, this.onlineUsers.length);
            if ( data.users.list ){
              this.onlineUsers.push(...data.users.list);
            }
          }
          this.usersReceived = true;
        }
        if ( data.chats ){
          let isStarted = !!this.lastChat,
              chats = Object.values(data.chats.current),
              chatsIds = Object.keys(data.chats.current);
          this.chatsReceived = true;
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
            bbn.fn.iterate(data.chats.current, (c, idChat) => {
              let chat = this.chatById(idChat);
              if ( chat ){
                if ( c.info ){
                  this.$set(chat, 'info', c.info)
                }
                if ( c.messages ){
                  if ( chat.messages === undefined ){
                    this.$set(chat, 'messages', []);
                  }
                  if ( c.messages.length ){
                    chat.messages.push(...c.messages);
                    chat.unread += c.messages.filter(m => m.unread).length;
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
                if ( c.participants && !bbn.fn.isSame(c.participants, chat.participants) ){
                  chat.participants.splice(0);
                  chat.participants.push(...c.participants);
                }
                if ( c.admins && !bbn.fn.isSame(c.admins, chat.admins) ){
                  chat.admins.splice(0);
                  chat.admins.push(...c.admins);
                }
              }
              else {
                let idx = this.getNewIdx(),
                    visible = c.info.creator && (this.userId === c.info.creator);
                this.currentChats.push(bbn.fn.extend(true, {
                  id: idChat,
                  idx: idx,
                  visible: visible,
                  minimized: false,
                  active: false,
                  unread: c.messages.filter(m => m.unread).length
                }, c));
                if ( this.currentOnline && !visible ){
                  this.minimize(idx)
                }
              }
            });
          }
        }
        if ( data.last ){
          this.lastChat = data.last;
        }
        if ( data.messages ){
          bbn.fn.iterate(data.messages, (messages, idChat) => {
            let chat = this.chatById(idChat);
            if ( chat ){
              if ( chat.messages === undefined ){
                this.$set(chat, 'messages', []);
              }
              if ( messages.length ){
                chat.messages.push(...messages);
                chat.unread += messages.filter(m => m.unread).length;
                if ( chat.visible ){
                  let cont = this.findByKey(chat.idx, 'chat');
                  if ( cont ){
                    cont.scrollEnd();
                  }
                }
                else if ( this.currentOnline) {
                  this.minimize(chat.idx);
                }
              }
            }
          });
        }
      },
      /**
       * @method getNewIdx
       * @returns {Number}
       */
      getNewIdx(){
        let max = -1;
        bbn.fn.each(this.currentChats, c => {
          if ( c.idx > max ){
            max = c.idx;
          }
        });
        return max + 1;
      },
      /**
       * Switch the current user online.
       * @method switchOnline
       * @fires post
       * @fires alert
       */
      switchOnline(){
        this.post(this.url + '/actions/user/online', d => {
          if ( !d.success ){
            this.alert(bbn._('You are already online'))
          }
        })
      },
      /**
       * Switch the current user offline.
       * @method switchOffline
       * @fires post
       * @fires alert
       */
      switchOffline(){
        this.post(this.url + '/actions/user/offline', d => {
          if ( !d.success ){
            this.alert(bbn._('You are already offline'))
          }
        });
      },
      /**
       * Checks if the given user is online.
       * @method isOnline
       * @param {String} idUser
       * @returns {Boolean}
       */
      isOnline(idUser){
        return this.onlineUsers.includes(idUser);
      },
      /**
       * Gets the participants list (full object) from an array of ids
       * @method getParticipants
       * @param {Array} participants
       * @returns {Array}
       */
      getParticipants(participants){
        if ( bbn.fn.isArray(participants) ){
          return participants.filter(p => p !== this.userId).map(p => bbn.fn.getRow(this.allUsers, 'value', p));
        }
        return [];
      },
      /**
       * Gets the formatted list of participants
       * @method getParticipantsFormatted
       * @param {Array}
       * @returns {String}
       */
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
      /**
       * The method called on chat selection.
       * @method onSelectChat
       * @param {Object} data
       * @param {Number} idx
       * @param {Number} index
       * @param {Event} ev
       * @fires chatById
       * @fires maximaze
       */
      onSelectChat(data, idx, index, ev){
        ev.preventDefault();
        let chat = this.chatById(data.id);
        if ( chat && this.isReady ){
          this.maximaze(chat.idx);
        }
      },
      /**
       * The method called on user selection.
       * @method onSelectUser
       * @param {Object} data
       * @param {Number} idx
       * @param {Number} index
       * @param {Event} ev
       * @fires chatTo
       */
      onSelectUser(data, idx, index, ev){
        ev.preventDefault();
        if ( this.isReady ){
          this.chatTo(data.value);
        }
      },
      /**
       * Closes the given chat window.
       * @method close
       * @param {Number} idx
       */
      close(idx){
        let chat = bbn.fn.getRow(this.currentChats, {idx: idx});
        if ( chat ){
          this.$set(chat, 'visible', false);
        }
      },
      /**
       * Minimizes the given chat window.
       * @method minimize
       * @param {Number} idx
       * @fires close
       */
      minimize(idx){
        let chat = bbn.fn.getRow(this.currentChats, {idx: idx});
        if ( chat ){
          this.$set(chat, 'minimized', true);
          this.close(idx);
        }
      },
      /**
       * Maximazes the given chat window.
       * @method maximaze
       * @param {Number} idx
       */
      maximaze(idx){
        let chat = bbn.fn.getRow(this.currentChats, {idx: idx});
        if ( chat ){
          this.$set(chat, 'minimized', false);
          this.$set(chat, 'visible', true);
        }
      },
      /**
       * Toggle minimized to the given chat window.
       * @method toggleMinimized
       * @fires minimize
       * @fires maximaze
       */
      toggleMinimized(idx){
        let chat = bbn.fn.getRow(this.currentChats, {idx: idx});
        if ( chat ){
          if ( chat.minimized ){
            this.maximaze(idx);
          }
          else {
            this.minimize(idx);
          }
        }
      },
      /**
       * Activates the given chat window
       * @method activate
       * @param {Number} idx
       * @fires setLastActivity
       */
      activate(idx){
        let chat = bbn.fn.getRow(this.currentChats, {idx: idx});
        if ( chat ){
          this.$set(chat, 'active', true);
          if ( chat.id ){
            this.setLastActivity(chat.id, this.userId);
          }
          setTimeout(() => {
            if ( chat.unread ){
              this.$set(chat, 'unread', 0);
            }
            if ( chat.messages.length ){
              for ( let i = chat.messages.length - 1; i > -1; i-- ){
                if ( chat.messages[i].user !== this.userId ){
                  if ( !chat.messages[i].unread ){
                    break;
                  }
                  chat.messages[i].unread = false;
                }
              }
            }
          }, 2000);
        }
      },
      /**
       * Deactivates the given chat window
       * @method deactivate
       * @param {Number} idx
       * @fires setLastActivity
       */
      deactivate(idx){
        let chat = bbn.fn.getRow(this.currentChats, {idx: idx});
        if ( chat ){
          this.$set(chat, 'active', false);
          if ( chat.id ){
            this.setLastActivity(chat.id, this.userId);
          }
        }
      },
      /**
       * Sets the last activity of the given user on the given chat
       * @method setLastActivity
       * @param {String} idChat
       * @param {String} idUser
       * @fires post
       */
      setLastActivity(idChat, idUser){
        if ( idChat && idUser && this.currentOnline ){
          this.post(this.url + '/actions/chat/activity', {
            id_chat: idChat,
            id_user: idUser
          });
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
    components: {
      /**
       * The chat window.
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
           * @prop {String} [''] userId
           * @memberof chat
           */
          userId: {
            type: String,
            default: ''
          },
          /**
           * The id of the current chat.
           * @prop {String} [''] chatId
           * @memberof chat
           */
          chatId: {
            type: String,
            default: ''
          },
          /**
           * The array of partecipants to the chat.
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
           * The array of all messages of the chat.
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
           * @memberof chat
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
             * @data {String} [''] currentMessage
             * @memberof chat
             */
            currentMessage: '',
            /**
             * The main bbn-chat component
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
           * True if the chat is a group
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
           */
          getField: bbn.fn.getField,
          /**
           * Returns the source of the menu.
           * @method getMenuFn
           * @memberof chat
           * @fires confirm
           * @fires leave
           * @fires destroy
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
              res.push({
                text: bbn._('Leave the chat'),
                icon: 'nf nf-mdi-comment_remove',
                action: () => {
                  this.confirm(bbn._('Are you sure you want to leave this chat?'), () => {
                    this.leave();
                  })
                }
              });
              if ( this.info.creator === this.userId ){
                res.push({
                  text: bbn._('Destroy the chat'),
                  icon: 'nf nf-fa-trash',
                  action: () => {
                    this.confirm(bbn._('Are you sure you want to destroy this chat?'), () => {
                      this.destroy();
                    })
                  }
                });
              }
            }
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
           * @method leave
           * @memberof chat
           * @fires post
           * @fires alert
           */
          leave(){
            if ( this.chatId ){
              this.post(this.cp.url + '/actions/chat/leave', {id_chat: this.chatId}, d => {
                if ( !d.success ){
                  this.alert(bbn._("Impossible to leave the chat!"))
                }
              })
            }
            else if ( this.idTemp ){
              this.cp.currentChats.splice(bbn.fn.search(this.cp.currentChats, {idx:this.idx}), 1);
            }
          },
          /**
           * Destroys the chat.
           * @method destroy
           * @memberof chat
           * @fires post
           * @fires alert
           */
          destroy(){
            if ( this.chatId ){
              this.post(this.cp.url + '/actions/chat/destroy', {id_chat: this.chatId}, d => {
                if ( !d.success ){
                  this.alert(bbn._("Impossible to destroy the chat!"))
                }
              })
            }
            else if ( this.idTemp ){
              this.cp.currentChats.splice(bbn.fn.search(this.cp.currentChats, {idx:this.idx}), 1);
            }
          },
          /**
           * Sends the current message.
           * @method sendMessage
           * @memberof chat
           * @fires post
           */
          sendMessage(){
            if ( this.currentMessage ){
              this.post(this.cp.url + '/actions/message/new', {
                id_chat: this.chatId || null,
                id_temp: this.idTemp || null,
                users: this.participants,
                text: this.currentMessage
              }, d => {
                if ( d.success && this.idTemp && d.id_chat ){
                  let c = bbn.fn.getRow(this.cp.currentChats, {idTemp: this.idTemp});
                  if ( c ){
                    this.$set(c, 'id', d.id_chat);
                    this.$set(c, 'idTemp', '');
                  }
                }
              })
              this.currentMessage = '';
            }
          },
          /**
           * Handles the resize of the scroll in the chat window.
           * @method scrollEnd
           * @fires getRef
           * @memberof chat
           */
          scrollEnd(){
            let sc = this.getRef('scroll');
            if ( sc ){
              sc.onResize();
              setTimeout(() => {
                sc.scrollEndY();
              }, 600)
            }
          },
          /**
           * The render of the message.
           * @method renderMsg
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
          /**
           * Formats the given timestamp
           * @method getTime
           * @memberof chat
           * @param {String} t
           * @return {String}
           */
          getTime(t){
            return moment.unix(t).format('HH:mm');
          },
          /**
           * Formats the given timestamp
           * @method getDate
           * @memberof chat
           * @param {String} d
           * @return {String}
           */
          getDate(d){
            return moment.unix(d).format('DD MMMM YYYY');
          },
          /**
           * Checks if the given timestamp is equal at today
           * @method isToday
           * @memberof chat
           * @param {String} d
           * @return {Boolean}
           */
          isToday(d){
            return moment().format('DD/MM/YYYY') === moment.unix(d).format('DD/MM/YYYY');
          },
          /**
           * Load more old messages
           * @method loadMoreMessages
           * @memberof chat
           * @fires post
           */
          loadMoreMessages(){
            if ( this.messages.length ){
              this.isLoading = true;
              this.post(this.cp.url + '/actions/message/previous', {
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
         * @fires getRef
         * @memberof chat
         */
        mounted(){
          if ( this.cp.currentOnline ){
            this.getRef('input').focus()
          }
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
      <i v-if="isAdmin"
         class="bbn-p nf nf-fa-plus"
         @click="onAddUserClick"
      ></i>
    </div>
  </div>
  <div class="bbn-spadded bbn-bordered bbn-grid bbn-no-border-top"
      style="grid-template-columns: max-content auto max-content"
  >
    <template v-for="p in currentParticipants">
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
              this.post(cp.url + '/actions/chat/title', {
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
          :action="cp.url + '/actions/chat/group'"
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
