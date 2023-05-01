/**
 * @file bbn-textarea component
 *
 * @description bbn-textarea is an easy to configure component, it represents a multiline text field, in which it is possible to assign an initial value among the various configurations, validate the content and provide a maximum number of characters that can be inserted.
 * You can define actions on the events activated on it.
 *
 * @copyright BBN Solutions
 * 
 * @author BBN Solutions
 */
return {
    mixins: [bbn.wc.mixins.basic],
    props: {
    },
    data(){
      return {
        widget: false,
        fitter: false,
        searcher: false,
      }
    },
    methods: {
      clear(){
      },
      write(st){
        this.widget.write(st)
      },
      resize(){
        //this.fitter.fit(300, 300);
      }
    },
    mounted(){
      this.ready = true;
      this.widget = new Terminal();
      this.fitter = new FitAddon.FitAddon();
      this.widget.loadAddon(this.fitter);
      //this.widget.loadAddon(new WebLinksAddon.WebLinksAddon());
      //this.searcher = new SearchAddon.SearchAddon();
      //this.widget.loadAddon(this.searcher);
      this.widget.open(this.$el);
      this.fitter.fit();
    }
  };
