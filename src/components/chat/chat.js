/**
 * Created by BBN on 10/02/2017.
 */
((bbn, Vue) => {
  "use strict";

  Vue.component('bbn-chat', {
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent, bbn.vue.resizerComponent],
    props: {
      userId: {
        type: String,
      },
      users: {
        type: Array,
        default(){
          return [];
        }
      },
      groups: {
        type: Array,
        default(){
          return [];
        }
      },
      onlineUsers: {
        type: Array,
        default(){
          return [];
        },
      },
      online: {
        type: Boolean,
        default: true
      },
      visible: {
        type: Boolean,
        default: false
      },
      url: {
        type: String
      },
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
        currentOnline: this.online,
        currentVisible: this.visible,
        usersVisible: this.visible,
        currentFilter: '',
        currentWindows: data,
        lastMsg: null,
        onlineUsersHash: null,
        unread: 0
      }
    },
    computed: {
      usersOnlineWithoutMe(){
        return this.onlineUsers.filter((a) => {
          return a !== this.userId;
        }).map((a) => {
          return bbn.fn.isObject(a) ? a : {value: a}
        })
      },
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
      get_field: bbn.fn.get_field,

      isInScreen(i){
        return (300 * (i + 1) + 300) < this.lastKnownWidth;
      },

      getMenuFn(){
        return [];
      },

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

      relay(obj, idx){
        this.$emit('send', obj, idx);
      },



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

      chatById(idChat){
        let idx = bbn.fn.search(this.currentWindows, {id: idChat});
        if ( idx > -1 ){
          return this.currentWindows[idx];
        }
        return false;
      },

      addUser(idChat, idUser){
        let chat = this.chatById(idChat);
        if ( chat && chat.participants.indexOf(idUser) === -1 ){
          bbn.fn.post(this.url + '/actions/add_user', {id_chat: idChat, id_user: idUser}, (d) => {
            if ( d.success ){
              chat.participants.push(idUser);
            }
            else{
              this.alert(bbn._("Impossible to add the user!"))
            }
          })
        }
      },

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
    mounted(){
      this.ready = true;
    },
    watch: {
      online(newVal){
        this.currentOnline = newVal;
      },
      currentVisible(newVal){
        if ( newVal ){
          this.unread = 0;
        }
      }
    },
    components: {
      container: {
        name: 'container',
        mixins: [bbn.vue.basicComponent],
        props: {
          idx: {
            type: Number
          },
          userId: {
            type: String,
            default: ''
          },
          chatId: {
            type: String,
            default: ''
          },
          participants: {
            type: Array,
            default(){
              return []
            }
          },
          messages: {
            type: Array,
            default(){
              return []
            }
          },
          users: {
            type: Array,
            default(){
              return []
            }
          },
        },
        data(){
          return {
            currentMessage: '',
            siteURL: bbn.env.host,
            chat: null
          }
        },
        methods: {
          get_field: bbn.fn.get_field,

          getMenuFn(){
            let chat = this.$parent;
            let res = [];
            /*
            let res = [
              {
                text: bbn._('Mute'),
                icon: 'zmdi zmdi-volume-off',
                command: () => {

                }
              }, {
                text: bbn._('Exit chat'),
                icon: 'nf nf-fa-sign_out_alt',
                command: () => {

                }
              }, {
                text: bbn._('Delete messages'),
                icon: 'nf nf-fa-sign_out_alt',
                command: () => {
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
                    text: bbn.fn.get_field(chat.users, 'value', o.value, 'text'),
                    icon: 'nf nf-fa-user',
                    command: () => {
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

          close(idx){
            if ( this.$parent.visibleWindows.length > 1 ){
              this.$parent.currentWindows[idx].visible = false;
            }
            else{
              this.$parent.currentVisible = false;
            }
          },

          scrollChat(){
            bbn.fn.log("SCROLL");
          },

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

          goto(url){
            bbn.fn.link(url)
          },

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
        mounted(){
          this.scrollEnd();
          this.getRef('input').focus()
        },

        updated(){
          this.scrollEnd();
        }
      }
    }
  });

})(bbn, Vue);
