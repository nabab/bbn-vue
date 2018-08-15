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
        data.push($.extend({}, w, {visible: false}));
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
            res.push($.extend(val, {idx: idx}));
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
        if ( found !== false ){
          if ( found !== 0 ){
            bbn.fn.move(this.currentWindows, found, 0);
          }
          this.$set(this.currentWindows[0], 'visible', true);
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

      openChat(){
        bbn.fn.log("openChat");
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

      receive(data){
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
              this.currentWindows.push({
                id: id_chat,
                participants: chat_info.participants,
                messages: chat_info.messages,
                visible: true
              });
            }
            else{
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
            siteURL: bbn.env.host
          }
        },
        methods: {
          get_field: bbn.fn.get_field,

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
              let msg =this.getRef('messages'),
                  sc = msg ? msg.getRef('scroll') : null;
              if ( sc ){
                sc.scrollEndY();
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
        },

        updated(){
          this.scrollEnd();
        }
      }
    }
  });

})(bbn, Vue);
