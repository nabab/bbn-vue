(bbn_resolve) => { ((bbn) => {
let script_dep = document.createElement('script');
script_dep.setAttribute('src', "https://cdn.jsdelivr.net/combine/gh/xtermjs/xterm.js@4.4.0/lib/xterm.js,gh/xtermjs/xterm.js@4.4.0/lib/xterm-addon-web-links.js,gh/xtermjs/xterm.js@4.4.0/lib/xterm-addon-search.js,gh/xtermjs/xterm.js@4.4.0/lib/xterm-addon-fit.js,gh/xtermjs/xterm.js@4.4.0/lib/xterm-addon-attach.js");
script_dep.onload = () => {

let css_dependency;
css_dependency = document.createElement('link');
css_dependency.setAttribute('rel', "stylesheet");
css_dependency.setAttribute('href', "https://cdn.jsdelivr.net/combine/gh/xtermjs/xterm.js@4.4.0/css/xterm.css");
document.head.insertAdjacentElement('beforeend', css_dependency);
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-overlay']"></div>`;
script.setAttribute('id', 'bbn-tpl-component-terminal');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
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
(function(bbn){
  "use strict";

  /**
   * Classic textarea with normalized appearance
   */
  Vue.component('bbn-terminal', {
    mixins: [bbn.vue.basicComponent],
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
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
};
document.head.insertAdjacentElement("beforeend", script_dep);
})(bbn); }