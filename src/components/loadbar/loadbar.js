/**
 * Created by BBN on 07/01/2017.
 */
;(function($, bbn, kendo){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-loadbar', {
    mixins: [bbn.vue.basicComponent],
    props: {
      encoded: {
        type: Boolean,
        default: true
      },
      position: {
        type: Object,
        default: function(){
          return {
            position: {
              bottom: 5,
              right: 5
            }
          };
        }
      },
      history: {
        type: Number,
        default: 100
      },
    },
    data: function(){
      return {
        isLoading: false,
        isSuccess: false,
        isError: false,
        text: '',
        id: false,
        data: [],
        selected: 0,
        numLoaded: 0,
        info: false
      };
    },

    methods: {
      start: function(url, id){
        this.data.unshift({
          text: url,
          isLoading: true,
          isError: false,
          isSuccess: false,
          isPage: false,
          id: this.setId(id),
          time: (new Date()).getTime()
        });
        this.numLoaded++;
        if ( this.selected ){
          this.selected++;
        }
        if ( this.data.length >= this.history ){
          this.data.pop();
        }
      },

      end: function(url, id, data, res){
        let idx = bbn.fn.search(this.data, "id", id);
        if ( idx > -1 ){
          this.data.splice(idx, 1, $.extend(this.data[idx], {
            isLoading: false,
            isError: typeof(res) === 'string',
            isSuccess: typeof(res) !== 'string',
            isPage: (typeof(res) === 'object') && !!res.content && !!res.title,
            error: typeof(res) === 'string' ? res : false,
            length: (new Date()).getTime() - this.data[idx].time
          }));
        }
      },

      setId: function(id){
        if ( !id ){
          id = (new Date()).getTime();
        }
        return id;
      },

      update(selected){
        if ( selected === undefined ){
          selected = this.selected;
        }
        if ( this.data.length && this.data[selected] ){
          this.isLoading = this.data[selected].isLoading;
          this.isSuccess = this.data[selected].isSuccess;
          this.isError = this.data[selected].isError;
          this.isPage = this.data[selected].isPage;
          this.text = this.data[selected].text;
          this.id = this.data[selected].id;
          this.length = this.data[selected].length || false;
        }
        else{
          this.isLoading = false;
          this.isSuccess = false;
          this.isError = false;
          this.isPage = false;
          this.text = false;
          this.id = false;
          this.length = false;
        }
      },
      deleteHistory(){
        let tmp = [];
        $.each(this.data, (i, a) => {
          if ( a.isLoading ){
            tmp.push(a);
          }
        });
        this.data = tmp;
      },
      getInfo(){
        this.info = true;
      }
    },

    mounted: function(){

    },

    watch: {
      data(){
        this.update();
      },
      selected(newVal, oldVal){
        if ( this.data[newVal] ){
          this.update();
        }
        else {
          this.update(0);
        }
      }
    }
  });

})(jQuery, bbn, kendo);
