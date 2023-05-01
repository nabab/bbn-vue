/**
 * @file bbn-code component
 *
 * @description bbn-code is a text editor.
 * It specializes in editing the code of a supported language. 
 * Various tools are provided to the users, which can be configured to their liking.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */


return {
    /**
     * @mixin bbn.wc.mixins.basic
     */
    mixins: [bbn.wc.mixins.basic],
    props: {
    },

    data(){
      return {
        /**
         * @todo not used
         */
        widget: null,
        /**
         * True if the editor is fullscreen.
         * @data {Boolan} [false] isFullScreen
         */
        isVisible: false
      };
    },

    computed: {
      /**
       * If the property theme is not defined, the default theme is returned.
       *
       * @computed currentTheme
       * @return {String}
       */
      currentTheme(){
        return this.theme ? this.theme : this.defaultTheme;
      }
    },

    methods: {
      onChange(input){
        bbn.fn.log("CHANGE", input);
      },
      onKeyPress(button){
        if (button === "{shift}" || button === "{lock}") {
          this.handleShift();
        }
        if (button === "{numbers}" || button === "{abc}") {
          this.handleNumbers();
        }
        bbn.fn.log("KEYPRESS", button)
      },
      handleNumbers(){
        let currentLayout = this.widget.options.layoutName;
        let numbersToggle = currentLayout !== "numbers" ? "numbers" : "default";
        this.widget.setOptions({
          layoutName: numbersToggle
        });
      },
      handleShift(){
        let currentLayout = this.widget.options.layoutName;
        let shiftToggle = currentLayout === "default" ? "shift" : "default";
        this.widget.setOptions({
          layoutName: shiftToggle
        });
      
      }

    },
    /**
     * @event mounted
     * @fires initTern
     * @fires getRef
     * @emit  input
     */
    mounted(){
      this.widget = new window.SimpleKeyboard.default({
        onChange: input => this.onChange(input),
        onKeyPress: button => this.onKeyPress(button),
        mergeDisplay: true,
        layoutName: "default",
        layout: {
          default: [
            "q w e r t y u i o p",
            "a s d f g h j k l",
            "{shift} z x c v b n m {backspace}",
            "{numbers} {space} {ent}"
          ],
          shift: [
            "Q W E R T Y U I O P",
            "A S D F G H J K L",
            "{shift} Z X C V B N M {backspace}",
            "{numbers} {space} {ent}"
          ],
          numbers: ["1 2 3", "4 5 6", "7 8 9", "{abc} 0 {backspace}"]
        },
        display: {
          "{numbers}": "123",
          "{ent}": "return",
          "{escape}": "esc ⎋",
          "{tab}": "tab ⇥",
          "{backspace}": "⌫",
          "{capslock}": "caps lock ⇪",
          "{shift}": "⇧",
          "{controlleft}": "ctrl ⌃",
          "{controlright}": "ctrl ⌃",
          "{altleft}": "alt ⌥",
          "{altright}": "alt ⌥",
          "{metaleft}": "cmd ⌘",
          "{metaright}": "cmd ⌘",
          "{abc}": "ABC"
        }
      });
      //bbn.fn.log(this.getOptions());
    },

    watch: {
    }
  };
  