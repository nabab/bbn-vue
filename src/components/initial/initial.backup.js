/**
 * Created by BBN on 28/03/2017.
 * Based on https://github.com/judesfernando/initial.js
 */
(function($, bbn){
  "use strict";

  let colors = ["#1abc9c", "#16a085", "#f1c40f", "#f39c12", "#2ecc71", "#27ae60", "#e67e22", "#d35400", "#3498db", "#2980b9", "#e74c3c", "#c0392b", "#9b59b6", "#8e44ad", "#bdc3c7", "#34495e", "#2c3e50", "#95a5a6", "#7f8c8d", "#ec87bf", "#d870ad", "#f69785", "#9ba37e", "#b49255", "#b49255", "#a94136"];

  /**
   * Initals
   */
  Vue.component('bbn-initial', {
    mixins: [bbn.vue.basicComponent, bbn.vue.optionComponent],
    props: {
      userId: {
        type: [String, Number]
      },
      userName: {
        type: String,
      },
      email: {
        type: String,
      },
      width: {
        type: [String, Number],
        default: '2.5rem'
      },
      height: {
        type: [String, Number],
        default: '2.5rem'
      },
      charCount: {
        type: Number,
        default: 2
      },
      textColor: {
        type: [String],
        default: '#FFF'
      },
      fontFamily:{
        type: String,
        default: 'Arial'
      },
      color: {
        type: String
      },
      fontSize: {
        type: [Number, String],
        default: '1.5rem'
      },
      fontWeight: {
        type: [Number, String],
        default: 400
      },
      letters: {
        type: String
      },
      radius: {
        type: Number,
        default: 0
      },
      source: {
        type: Array,
        default(){
          return appui && appui.app && appui.app.users ? appui.app.users : []
        }
      },
      nameField: {
        type: String,
        default: 'name'
      },
      idField: {
        type: String,
        default: 'id'
      },
      url: {
        type: String
      }
    },
    data(){
      let currentLetters = '';
      if ( this.letters ){
        currentLetters = this.letters;
      }
      if ( !this.letters && this.userName ){
        let tmp = bbn.fn.removeEmpty(this.userName.split(" "))
        while ( (tmp.length > this.charCount) && (tmp[0].length <= 3) ){
          tmp.shift();
        }
        for ( let i = 0; i < tmp.length; i++ ){
          if ( !this.charCount || (currentLetters.length <= this.charCount) ){
            currentLetters += tmp[i].substr(0, 1);
          }
        }
      }
      let col = this.color;
      if ( !col ){
        let sum = 0;
        currentLetters.split('').forEach((a) => {
          sum += a.charCodeAt();
        });
        sum += this.userName ?
          this.userName.substr(-1).charCodeAt() : (
            this.userId ?
              this.userId.toString().substr(-1).charCodeAt() :
              this.currentLetters.substr(0, 1).charCodeAt()
          );
        let colorIndex = Math.floor(sum % colors.length);
        col = colors[colorIndex]
      }
      return {
        currentColor: col,
        currentFontSize: bbn.fn.isNumber(this.fontSize) ? this.fontSize + 'px' : this.fontSize,
        currentLetters: currentLetters ? currentLetters.toUpperCase() : '??',
        currentWidth: bbn.fn.isNumber(this.width) ? this.width + 'px' : this.width,
        currentHeight: bbn.fn.isNumber(this.height) ? this.height + 'px' : this.height,
        currentRadius: bbn.fn.isNumber(this.radius) ? this.radius + 'px' : this.radius
      }
    },
    render(createElement){
      let opt = {
        'class': this.componentClass,
        style: {
          width: bbn.fn.isNumber(this.width) ? this.width + 'px' : this.width,
          height: bbn.fn.isNumber(this.height) ? this.height + 'px' : this.height,
        }
      };
      if ( this.userName || this.name ){
        opt.attrs = {
          title: this.userName ? this.userName : this.name
        };
      }
      let textOptions = {
        style: {
          'font-weight': this.fontWeight,
          'font-size': this.currentFontSize,
        },
        attrs: {
          'text-anchor': 'middle',
          'y': '50%',
          'x': '50%',
          'dy' : '0.35em',
          'pointer-events':'auto',
          'fill': this.textColor,
        },
        domProps: {
          innerHTML: this.currentLetters
        },
      };
      if ( this.fontFamily ){
        textOptions.attrs['font-family'] = this.fontFamily;
      }
      let cobj = createElement('text', textOptions);
      let svg = createElement('svg', {
        attrs: {
          'xmlns': 'http://www.w3.org/2000/svg',
          'pointer-events': 'none',
          'width': this.currentWidth,
          'height': this.currentHeight
        },
        style: {
          'background-color': this.currentColor,
          'width': this.currentWidth,
          'height': this.currentHeight,
          'border-radius': this.currentRadius + 'px',
          '-moz-border-radius': this.currentRadius + 'px'
        }
      }, [cobj]);
      return svg;
      return createElement('img', opt, [cobj]);
    },
    methods: {
      getOptions(){
        let cfg = bbn.vue.getOptions(this);
        if ( cfg.letters ){
          cfg.charCount = cfg.letters.length;
        }
        else if ( appui.app.users ){
          let name = cfg.userName ? cfg.userName : false;
          if ( !name && cfg.userId ){
            name = bbn.fn.get_field(appui.app.users, "value", cfg.userId, "text");
          }
          if ( name ){
          }
        }
        if ( !cfg.letters ){
          cfg.letters = '??';
        }
        if ( !cfg.charCount ){
          cfg.charCount = cfg.letters.length;
        }
        if ( !cfg.fontSize ){
          let baseSize = cfg.height / cfg.charCount;
          cfg.fontSize = Math.round(baseSize + bbn.fn.percent(15*cfg.charCount, baseSize));
        }
        if ( !cfg.name ){
          cfg.name = cfg.letters;
        }
        return cfg;
      }
    },
    /*
    mounted(){
      $(this.$el).initial(this.getOptions());
    },
    */
  });

})(jQuery, bbn);
