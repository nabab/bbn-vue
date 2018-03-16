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
      windows: {
        type: Array,
        default(){
          return [];
        }
      }
    },
    data(){
      return {
        usersVisible: true,
        currentFilter: '',
        currentWindows: this.windows.slice()
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
    },
    methods: {
      get_field: bbn.fn.get_field,

      isInScreen(i){
        return (300 * (i + 1) + 300) < this.lastKnownWidth;
      },

      chatTo(users){
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
        }
        else{
          this.currentWindows.unshift({
            id: '',
            participants: users,
            messages: [],
            currentMessage: '',
          })
        }
      },

      relay(obj, idx){
        this.$emit('send', obj, idx);
      },

      openChat(){
        bbn.fn.log("openChat");
      },

    },
    mounted(){
      this.ready = true;
    },
    components: {
      container: {
        name: 'container',
        mixins: [bbn.vue.basicComponent],
        props: {
          idx: {
            type: Number
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
            currentMessage: ''
          }
        },
        methods: {
          get_field: bbn.fn.get_field,

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
        },
        watch: {
          messages(){
            let sc = this.getRef('messages').getRef('scroll');
            if ( sc ){
              this.$nextTick(() => {
                sc.selfEmit(true);
                this.setTimeout(() => {
                  sc.scrollEndY();
                }, 250)
              })
            }
          }
        }
      }
    }
  });

})(bbn, Vue);
