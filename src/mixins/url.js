(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Url component
     * @component urlComponent
     */
    urlComponent: {
      props: {
        /** 
         * The baseUrl.
         * @prop {String} baseUrl
         * @memberof urlComponent
         */
        baseUrl: {
          type: String
        }
      },
      data(){
        return {
          /**
           * @data currentURL
           * @memberof urlComponent
           */
          currentURL: null,
          /**
           * @data title
           * @memberof urlComponent
           */
          title: null
        }
      },
      methods: {
        /**
         * Updates the url.
         * @method updateUrl
         * @memberof urlComponent
         */
        updateUrl(){
          if ( this.baseUrl && (bbn.env.path.indexOf(this.baseUrl) === 0) && (bbn.env.path.length > (this.baseUrl.length + 1)) ){
            let url = this.baseUrl + (this.currentURL ? '/' + this.currentURL : '');
            bbn.fn.setNavigationVars(
              url,
              (this.currentURL ? bbn.fn.getField(this.source, this.sourceText, this.sourceValue, this.currentURL) + ' < ' : '') + document.title,
              {
                script: () => {
                  //bbn.fn.log("updateUrl & EXEC SCRIPT");
                  let idx = bbn.fn.search(this.source, this.sourceValue, this.currentURL);
                  if ( idx > -1 ){
                    this.widget.select(idx);
                    this.widget.trigger("change");
                  }
                }
              },
              !this.ready)
          }
        }
      },
      /**
       * Adds the class 'bbn-url-component' to the component
       * @event created 
       * @memberof urlComponent
       */
      created(){
        this.componentClass.push('bbn-url-component');
      },
    }
  });
})(bbn);