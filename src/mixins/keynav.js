((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    keynavComponent: {
      methods: {
        /**
         * States the role of the enter button on the dropdown menu.
         *
         * @method keynav
         * @fires widget.select
         * @fires widget.open
         *
         */
        keynav(e){
          if (this.filteredData.length && bbn.var.keys.upDown.includes(e.keyCode)) {
            e.preventDefault();
            if ( !this.isOpened ){
              this.isOpened = true;
              return;
            }
            let list = this.find('bbn-list');
            if (list) {
              list.isOver = false;
              let idx = this.valueIndex;
              let d = list.filteredData;
              if (list.overIdx > -1) {
                idx = list.overIdx;
              }
              switch ( e.keyCode ){
                // Arrow down
                case 40:
                  list.overIdx = d[idx+1] !== undefined ? idx+1 : 0;
                  break;
                // Arrow Up
                case 38:
                  list.overIdx = d[idx-1] !== undefined ? idx-1 : d.length - 1;
                  break;
                // Page down (10)
                case 34:
                  if (list.overIdx >= (d.length - 1)) {
                    list.overIdx = 0;
                  }
                  else{
                    list.overIdx = d[idx+10] ? idx+10 : d.length - 1;
                  }
                  break;
                // Page up (10)
                case 33:
                  if (list.overIdx <= 0) {
                    list.overIdx = d.length - 1;
                  }
                  else{
                    list.overIdx = d[idx-10] ? idx-10 : 0;
                  }
                  break;
                // End
                case 35:
                  list.overIdx = d.length - 1;
                  break;
                // Home
                case 36:
                  list.overIdx = 0;
                  break;
    
              }
              list.$forceUpdate();
            }
          }
        }
      }
    }
  });
})(bbn);