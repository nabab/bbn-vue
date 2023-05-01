/**
 * @file bbn-chat component
 * @description bbn-chat component allows the user to communicate in chat sessions with other users online.
 * @author Thomas Nabet, Mirko Argentino
 * @copyright BBN Solutions
 * @created 10/02/2017.
 */


return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.localStorage
     * @mixin bbn.wc.mixins.resizer
     * @mixin bbn.wc.mixins.serviceWorker
     */
    mixins: 
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.localStorage,
      bbn.wc.mixins.resizer,
      bbn.wc.mixins.serviceWorker
    ],
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
        return this.onlineUsers.filter(a => {
          return a !== this.userId;
        }).map(a => {
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
              this.getPopup({
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
       * Returns the chat object basing on the given id property.
       * @method chatById
       * @param {String} idChat
       * @return {Boolean|Object}
       */
      chatById(idChat){
        return bbn.fn.getRow(this.currentChats, {id: idChat})
      },
      /**
       * Returns the chat object basing on the given idx property.
       * @method chatByIdx
       * @param {Number} idx
       * @return {Boolean|Object}
       */
      chatByIdx(idx){
        return bbn.fn.getRow(this.currentChats, {idx: idx})
      },
      /**
       * Returns the chat object basing on the given idTemp property.
       * @method chatByIdTemp
       * @param {String} idTemp
       * @return {Boolean|Object}
       */
      chatByIdTemp(idTemp){
        return bbn.fn.getRow(this.currentChats, {idTemp: idTemp})
      },
      /**
       * Returns the chat window component basing on the given idx property
       * @method chatWindowByIdx
       * @param {Number} idx
       * @fires findByKey
       * @return {Vue|Boolean}
       */
      chatWindowByIdx(idx){
        return this.findByKey(idx, 'chat');
      },
      /**
       * Opens the chat window by the given user id
       * @method chatTo
       * @param {String} idUser
       * @fires maximaze
       * @fires addChat
       * @fires messageToChannel
       * @fires activate
       */
      chatTo(idUser){
        let chat = this.currentChats.filter(c => (c.participants.length === 1) && c.participants.includes(idUser));
        if ( chat.length ){
          this.maximaze(chat[0].idx)
          return;
        }
        if ( this.currentOnline ){
          let chatObj = {
            id: '',
            idTemp: bbn.fn.randomString(24, 24),
            info: {
              title: '',
              creator: this.userId
            },
            participants: [idUser],
            partecipantsActivity: {[idUser]: 0},
            admins: [this.userId],
            messages: [],
            visible: true,
            minimized: false,
            active: false,
            unread: 0
          };
          this.messageToChannel({
            function: 'addChat',
            params: [bbn.fn.extend(true, {}, chatObj, {visible: false})]
          });
          this.activate(this.addChat(chatObj));
        }
      },
      /**
       * @method addChat
       * @param {Object} chatObj
       * @returns {Number}
       */
      addChat(chatObj){
        let idx = chatObj.idx !== undefined ? chatObj.idx : this.getNewIdx();
        chatObj.idx = idx;
        this.currentChats.push(chatObj);
        return idx;
      },
      /**
       * @method receive
       * @param {Object} data
       * @fires chatById
       * @fires chatWindowByIdx
       * @fires minimize
       * @fires getNewIdx
       * @fires addChat
       */
      receive(data){
        //bbn.fn.log("RECEIVING THIS FOR CHAT", data);
        // Online status
        if ('online' in data) {
          if (data.online) {
            this.currentOnline = true;
          }
          else {
            bbn.fn.each(this.currentChats, c => {
              c.visible = false;
              c.minimized = false;
            })
            this.currentOnline = false;
          }
        }
        // Users
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
        // Chats
        if ( data.chats ){
          let isStarted = !!this.lastChat,
              chats = Object.values(data.chats.list),
              chatsIds = Object.keys(data.chats.list);
          this.chatsReceived = true;
          if ( 'hash' in data.chats ){
            this.chatsHash = data.chats.hash;
          }
          // All list
          if (!isStarted && !this.currentChats.length) {
            bbn.fn.each(chats, c => {
              let unread = c.messages ? c.messages.filter(m => m.unread).length : 0,
                  current = bbn.fn.getRow(this.currentChats, {id: c.info.id});
              if (current) {
                c.minimized = !current.active && !!unread;
                c.unread = unread;
                c.participantsActivity = this._participantsActivity(c.participants);
                c.participants = bbn.fn.map(c.participants, p => p.id);
                bbn.fn.iterate(c, (v, p) => {
                  this.$set(current, p, v);
                })
              }
              else {
                this.addChat(bbn.fn.extend(true, {}, c, {
                  id: c.info.id,
                  idx: this.getNewIdx(),
                  visible: false,
                  minimized: !!unread,
                  active: false,
                  unread: unread,
                  participants: bbn.fn.map(c.participants, p => p.id),
                  participantsActivity: this._participantsActivity(c.participants)
                }))
              }
            })
          }
          // Only new
          else {
            bbn.fn.each(this.currentChats, (c, i) => {
              if ( !chatsIds.includes(c.id) && !c.idTemp ){
                this.currentChats.splice(i, 1);
              }
            })
            bbn.fn.iterate(data.chats.list, (c, idChat) => {
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
                    chat.unread += c.messages ? c.messages.filter(m => m.unread).length : 0;
                    if ( chat.visible ){
                      let cont = this.chatWindowByIdx(chat.idx);
                      if ( cont ){
                        cont.scrollEnd()
                      }
                    }
                    else if ( this.currentOnline) {
                      this.minimize(chat.idx);
                    }
                  }
                }
                if (c.participants) {
                  let parts = bbn.fn.map(c.participants, p => p.id);
                  if (!bbn.fn.isSame(parts, chat.participants)) {
                    chat.participants.splice(0);
                    chat.participants.push(...parts);
                  }
                  this.$set(chat, 'participantsActivity', this._participantsActivity(c.participants));
                }
                if ( c.admins && !bbn.fn.isSame(c.admins, chat.admins) ){
                  chat.admins.splice(0);
                  chat.admins.push(...c.admins);
                }
              }
              else {
                let idx = this.getNewIdx(),
                    visible = c.info.creator && (this.userId === c.info.creator),
                    mess = '';
                if (c.participants.length === 1){
                  bbn.fn.each(this.currentChats, (cc, ci) => {
                    if ((cc.idTemp !== undefined)
                      && (cc.idTemp !== '')
                      && (cc.participants.length === 1)
                      && cc.participants.includes(c.participants[0].id)
                    ) {
                      let cw = this.chatWindowByIdx(cc.idx);
                      if (bbn.fn.isVue(cw)) {
                        mess = cw.currentMessage;
                        visible = true;
                      }
                      this.currentChats.splice(ci, 1);
                      return;
                    }
                  })
                }
                this.addChat(bbn.fn.extend(true, {}, c, {
                  id: idChat,
                  idx: idx,
                  visible: visible,
                  minimized: false,
                  active: false,
                  unread: c.messages ? c.messages.filter(m => m.unread).length : 0,
                  participants: bbn.fn.map(c.participants, p => p.id),
                  participantsActivity: this._participantsActivity(c.participants)
                }));
                if ( this.currentOnline && !visible ){
                  this.minimize(idx)
                }
                if (mess.length) {
                  this.$nextTick(() => {
                    let cw = this.chatWindowByIdx(idx);
                    if (bbn.fn.isVue(cw)) {
                      this.$set(cw, 'currentMessage', mess);
                    }
                  });
                }
              }
            });
          }
        }
        // lastChat
        if ( 'last' in data ){
          this.lastChat = data.last;
        }
        // New messages
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
                  let cont = this.chatWindowByIdx(chat.idx);
                  if ( cont ){
                    cont.scrollEnd();
                  }
                  if ( chat.active ){
                    this.activate(chat.idx);
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
       * @method setIdByTemp
       * @param {String} idTemp
       * @param {String} id
       */
      setIdByTemp(idTemp, id){
        let c = bbn.fn.getRow(this.currentChats, {idTemp: idTemp});
        if ( c ){
          this.$set(c, 'id', id);
          this.$set(c, 'idTemp', '');
        }
      },
      /**
       * @method removeChatByTemp
       * @param {String} idTemp
       */
      removeChatByTemp(idTemp){
        let idx = bbn.fn.search(this.currentChats, {idTemp: idTemp});
        if (idx > -1) {
          this.currentChats.splice(idx, 1);
        }
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
       * @param {String} [', '] separator
       * @returns {String}
       */
      getParticipantsFormatted(participants, separator = ', '){
        if ( bbn.fn.isArray(participants) && participants.length ){
          if ( bbn.fn.isObject(participants[0]) ){
            return participants.map(p => p.text).join(separator);
          }
          else {
            return this.getParticipantsFormatted(this.getParticipants(participants), separator)
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
       * @fires removeUnread
       * @fires messageToChannel
       */
      activate(idx){
        let chat = bbn.fn.getRow(this.currentChats, {idx: idx});
        if ( chat ){
          this.$set(chat, 'active', true);
          if ( chat.id ){
            this.setLastActivity(chat.id, this.userId);
          }
          setTimeout(() => {
            this.removeUnread(idx)
          }, 2000);
          this.messageToChannel({
            function: 'removeUnread',
            params: [idx]
          });
        }
      },
      /**
       * Removes unread tag from messages and from chat
       * @method removeUnread
       * @param {Number} idx
       */
      removeUnread(idx){
        let chat = bbn.fn.getRow(this.currentChats, {idx: idx});
        if (chat) {
          if (chat.unread) {
            this.$set(chat, 'unread', 0);
          }
          if (!!chat.messages && chat.messages.length) {
            for (let i = chat.messages.length - 1; i > -1; i--) {
              if ((chat.messages[i].user !== this.userId) && (chat.messages[i].unread !== undefined)) {
                if (!chat.messages[i].unread) {
                  break;
                }
                this.$set(chat.messages[i], 'unread', false);
              }
            }
          }
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
      },
      /**
       * Trasforms the array of participants activity to an object "idParticipant: lastActivity"
       * @method _participantsActivity
       * @param {Array} list
       * @return {Object}
       */
      _participantsActivity(list){
        let res = {};
        bbn.fn.each(list, l => res[l.id] = l.lastActivity);
        return res;
      },
      /**
       * Sets the bottom coordinates of the main window
       * @method _setCoord
       */
      _setCoord(){
        let coord = this.$el.offsetParent.getBoundingClientRect();
        this.bottomCoord = `${coord.bottom - coord.top}px`;
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
      this.$nextTick(() => {
        this._setCoord();
        this.ready = true;
      })
    },
    watch: {
      /**
       * @watch mainWindowVisible
       * @fires _setCoord
       */
      mainWindowVisible: {
        immediate: true,
        handler(newVal){
          if (newVal) {
            this._setCoord();
          }
        }
      }
    },
    components: {
      /**
       * The chat window.
       * @component chat
       */
      chat: {
        name: 'chat',
        /**
         * @mixin bbn.wc.mixins.basic
         * @memberof chat
         */
        mixins: [bbn.wc.mixins.basic],
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
           * Partecipants activity details
           * @prop {Object} [{}] partecipantsActivity
           * @memberof chat
           */
          participantsActivity: {
            type: Object,
            default(){
              return {}
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
          },
          /**
           * The number of unread message
           * @prop {Number} [0] unread
           * @memberof chat
           */
          unread: {
            type: Number,
            default: 0
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
            showInfo: false,
            /**
             * Indicates whether a message is being sent
             * @data {Boolean} isSending
             * @memberof chat
             */
            isSending: false,
            /**
             * The background color used for the received messages
             * @data {String} [''] receivedBackground
             * @memberof chat
             */
            receivedBackground: ''
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
          },
          /**
           * The list of the online participants
           * @computed online
           * @memberof chat
           * @fires cp.isOnline
           * @return {Array}
           */
          online(){
            return this.participants.filter(p => this.cp.isOnline(p))
          },
          /**
           * The formatted list of the online participants
           * @computed onlineFromatted
           * @memberof chat
           * @fires cp.getParticipantsFormatted
           * @return {String}
           */
          onlineFormatted(){
            return this.online.length ? bbn._('Online participants') + ':\n' + this.cp.getParticipantsFormatted(this.online, '\n') : '';
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
            if (this.idTemp && !this.chatId && !this.messages.length) {
              return this.destroy();
            }
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
              this.cp.messageToChannel({
                function: 'removeChatByTemp',
                params: [this.idTemp]
              })
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
              this.isSending = true;
              this.post(this.cp.url + '/actions/message/new', {
                id_chat: this.chatId || null,
                id_temp: this.idTemp || null,
                users: this.participants,
                text: this.currentMessage
              }, d => {
                if (d.success) {
                  if (this.idTemp && d.id_chat) {
                    this.cp.setIdByTemp(this.idTemp, d.id_chat);
                    this.cp.messageToChannel({
                      function: 'setIdByTemp',
                      params: [this.idTemp, d.id_chat]
                    })
                    this.isSending = false;
                  }
                  this.cp.setLastActivity(this.chatId, this.userId);
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
              sc.onResize(true).then(() => {
                sc.scrollEndY();
              });
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
              bbn.fn.each(matches, v => {
                if ( v.indexOf(bbn.env.host) === 0 ){
                  msg = msg.replace(v, '<a href="javascript:;" onclick="bbn.fn.link(\'' + bbn.fn.substr(v, bbn.env.host.length + 1) + '\')">' + bbn.fn.substr(v, bbn.env.host.length + 1) + '</a>');
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
            return dayjs.unix(t).format('HH:mm');
          },
          /**
           * Formats the given timestamp
           * @method getDate
           * @memberof chat
           * @param {String} d
           * @return {String}
           */
          getDate(d){
            return dayjs.unix(d).format('DD MMMM YYYY');
          },
          /**
           * Checks if the given timestamp is equal at today
           * @method isToday
           * @memberof chat
           * @param {String} d
           * @return {Boolean}
           */
          isToday(d){
            return dayjs().format('DD/MM/YYYY') === dayjs.unix(d).format('DD/MM/YYYY');
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
          },
          /**
           * Checks if all participants read the given message
           * @method isMsgRead
           * @memberof chat
           * @param {Object} msg
           * @return {Boolean}
           */
          isMsgRead(msg){
            if (msg.time){
              return !this.participants.filter(p => !this.participantsActivity[p] || (this.participantsActivity[p] < msg.time)).length;
            }
            return false;
          },
          /**
           * Gets the style properties for the given message
           * @method getStyle
           * @memberof chat
           * @param {Object} msg
           * @param {Number} idx
           * @return {Object}
           */
          getStyle(msg, idx){
            let sent = msg.user === this.userId,
                ret = {};
            if (this.$refs.message && !sent && !msg.unread) {
              if (this.receivedBackground) {
                ret.backgroundColor = this.receivedBackground + '!important';
                ret.borderColor = this.receivedBackground;
              }
            }
            return ret;
          },
          addEmoji(emoji){
            this.currentMessage += (this.currentMessage.lenght ? ' ' : '') + String.fromCodePoint('0x' + emoji);
          }
        },
        created(){
          let el = document.createElement('div');
          el.classList.add('bbn-alt-background');
          document.body.append(el);
          this.receivedBackground = bbn.fn.lightenDarkenHex(bbn.fn.rgb2hex(getComputedStyle(el).backgroundColor), this.cp.isDarkTheme ? 30 : -30);
          el.remove();
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
       * Represents the individual item in the users list.
       * @component user
       */
      user: {
        template: `
<div class="bbn-grid bbn-p bbn-vmiddle bbn-vxsmargin"
      style="grid-template-columns: max-content auto max-content"
>
  <div class="bbn-middle" style="min-width: 1.5rem">
    <bbn-initial :user-name="source.text"
                :width="16"
                :height="16"
    ></bbn-initial>
  </div>
  <div class="bbn-ellipsis bbn-w-100"
       v-text="source.text"
  ></div>
  <div class="bbn-middle" style="min-width: 1.5rem">
    <i :class="{
         'nf nf-fa-circle': cp.isOnline(source.value),
         'bbn-green': cp.isOnline(source.value)
       }"
    ></i>
  </div>
</div>
        `,
        name: 'user',
        props: {
           /**
            * The source object
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
             * The main chat component
             * @data {Vue} cp
             * @memberof user
             */
            cp: cp
          }
        }
      },
      /**
       * Represents the individual item in the current chats list
       * @component active
       */
      active: {
        template: `
<div class="bbn-grid bbn-p bbn-vmiddle bbn-vxsmargin"
      style="grid-template-columns: max-content auto max-content max-content"
      :title="participantsFormatted"
>
  <div class="bbn-middle" style="min-width: 1.5rem">
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
  <div class="bbn-middle" style="min-width: 1.5rem">
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
            * The source object
           * @prop {Object} source
           * @memberof active
           */
          source: {
            type: Object
          }
        },
        data(){
          return {
            /**
             * The main chat component
             * @data {Vue} cp
             * @memberof active
             */
            cp: cp
          }
        },
        computed: {
          /**
           * The participants list (full object)
           * @computed participants
           * @memberof active
           * @fires cp.getParticipants
           * @return {Array}
           */
          participants(){
            return this.cp.getParticipants(this.source.participants);
          },
          /**
           * The formatted paticipants list
           * @computed participantsFormatted
           * @memberof active
           * @fires cp.getParticipantsFormatted
           * @return {Array}
           */
          participantsFormatted(){
            if ( this.participants ){
              return this.cp.getParticipantsFormatted(this.participants, '\n');
            }
            return '';
          },
          /**
           * True if this chat is a group
           * @computed isGroup
           * @memberof active
           * @return {Boolean}
           */
          isGroup(){
            return this.participants.length > 1;
          },
          /**
           * The list of the online participants
           * @computed online
           * @memberof active
           * @fires cp.isOnline
           * @return {Array}
           */
          online(){
            return this.participants.filter(p => this.cp.isOnline(p.value))
          },
          /**
           * The formatted list of the online participants
           * @computed onlineFormatted
           * @memberof active
           * @fires cp.getParticipantsFormatted
           * @return {String}
           */
          onlineFormatted(){
            return this.online.length && this.isGroup ? bbn._('Online participants') + ':\n' + this.cp.getParticipantsFormatted(this.online, '\n') : '';
          }
        }
      },
      /**
       * The interface where to see/change the chat's info
       * @component info
       */
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
          style="min-width: 1.5rem"
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
          style="min-width: 1.5rem"
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
          /**
           * The chat's ID
           * @prop {String} [''] chatId
           * @memberof info
           */
          chatId: {
            type: String,
            default: ''
          },
          /**
           * The current user's ID
           * @prop {String} userId
           * @memberof info
           */
          userId: {
            type: String,
            required: true
          },
          /**
           * The chat's info
           * @prop {Object} info
           * @memberof info
           */
          info: {
            type: Object,
            required: true
          },
          /**
           * The chat's participants list
           * @prop {Array} [[]] participants
           * @memberof info
           */
          participants: {
            type: Array,
            defauult(){
              return []
            }
          },
          /**
           * The chat's admins list
           * @prop {Array} [[]] admins
           * @memberof info
           */
          admins: {
            type: Array,
            defauult(){
              return []
            }
          },
          /**
           * The array of all users (including offline ones).
           * @prop {Array} [[]] users
           * @memberof info
           */
          users: {
            type: Array,
            default(){
              return []
            }
          },
          /**
           * True if the chat title is to be shown
           * @prop {Boolean} [false] titleVisible
           * @memberof info
           */
          titleVisible: {
            type: Boolean,
            default: false
          }
        },
        data(){
          return {
            /**
             * The current title
             * @data {String} currentTitle
             * @memberof info
             */
            currentTitle: this.info.title || ''
          }
        },
        computed: {
          /**
           * @computed currentParticipants
           * @memberof info
           * @fires cp.getParticipants
           * @return {Array}
           */
          currentParticipants(){
            return cp.getParticipants(this.participants);
          },
          /**
           * True if the current user is the chat creator
           * @computed isCreator
           * @memberof info
           * @return {Boolean}
           */
          isCreator(){
            return this.userId === this.info.creator
          },
          /**
           * True if the current user is a chat admin
           * @computed isAdmin
           * @memberof info
           * @return {Boolean}
           */
          isAdmin(){
            return this.admins.includes(this.userId)
          }
        },
        methods: {
          /**
           * Save the title
           * @method saveTitle
           * @memberof info
           * @fires post
           * @fires alert
           */
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
          /**
           * Toggle the given user as chat admin
           * @method toggleAdmin
           * @memberof info
           * @param {String} idUser
           * @fires addAdmin
           * @fires removeAdmin
           */
          toggleAdmin(idUser){
            let idx = this.admins.indexOf(idUser);
            if ( idx === -1 ){
              this.addAdmin(idUser)
            }
            else {
              this.removeAdmin(idUser)
            }
          },
          /**
           * The called method when an user is added from interface
           * @method onAddUserClick
           * @memberof info
           * @fires getPopup
           */
          onAddUserClick(){
            this.getPopup({
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
           * @method addUser
           * @param {String} idUser
           * @memberof info
           * @fires post
           * @fires alert
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
                }, d => {
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
          /**
           * Remove the given user from the chat
           * @method removeUser
           * @memberof info
           * @param {String} idUser
           * @fires confirm
           * @fires post
           * @fires alert
           */
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
              this.confirm(bbn._('Are you sure you want to remove this user from the chat?'), () => {
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
                  }, d => {
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
          /**
           * Add admin to the chat
           * @method addAdmin
           * @memberof info
           * @param {String} idUser
           * @fires post
           * @fires alert
           */
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
          /**
           * Remove admin
           * @method removeAdmin
           * @memberof info
           * @param {String} idUser
           * @fires post
           * @fires alert
           */
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
          /**
           * @watch currentTitle
           * @memberof info
           * @param {String} newVal
           * @emit titleChanged
           */
          currentTitle(newVal){
            this.$emit('titleChanged', newVal)
          },
          /**
           * @watch info.title
           * @memberof info
           * @param {String} newVal
           */
          'info.title'(newVal){
            this.currentTitle = newVal;
          }
        },
        components: {
          /**
           * The users tree
           * @component users
           * @memberof info
           */
          users: {
            template: `
<div class="bbn-vpadded bbn-overlay">
  <bbn-tree :source="users"></bbn-tree>
</div>
            `,
            name: 'users',
            props: {
              /**
               * The source object
               * @prop {Object} source
               * @memberof info
               */
              source: {
                type: Object
              }
            },
            data(){
              return {
                /**
                 * The users list
                 * @data {Array} users
                 * @memberof info
                 */
                users: bbn.fn.map(cp.users.filter(u => !this.source.participants.includes(u.value) && (u.value !== this.source.creator)), u => {
                  return bbn.fn.extend(true, {
                    component: this.$options.components.user
                  }, u)
                })
              }
            },
            components: {
              /**
               * The individual user component
               * @component user
               * @memberof users
               */
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
                  /**
                   * The source object
                   * @prop {Object} source
                   * @memberof user
                   */
                  source: {
                    type: Object
                  }
                },
                methods: {
                  /**
                   * The called method on user selecting
                   * @method select
                   * @memberof user
                   * @fires closest
                   * @fires getPopup
                   */
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
      /**
       * The interface to create a new group
       * @component newGroup
       */
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
            /**
             * The main chat component
             * @data {Vue} cp
             * @memberof newGroup
             */
            cp: cp,
            /**
             * The chat info
             * @data {Object} chat
             */
            chat: {
              title: '',
              participants: [cp.userId],
              admins: [cp.userId]
            }
          }
        },
        methods: {
          /**
           * The called method on form validation
           * @method validation
           * @memberof newGroup
           * @param {Object} d
           * @fires alert
           * @return {Boolean}
           */
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
  };
