((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-textbox', 'bbn-no-padding']"
     @keydown.enter.tab.stop=""
		 @mouseup.stop="getRef('element').focus()">
  <div class="bbn-w-100"
			 style="min-height: 100%">
		<bbn-toolbar :source="currentButtons"
								class="bbn-header bbn-radius-top bbn-no-border bbn-c"
								:button-space="false"/>
		<div class="bbn-w-100"
				:style="textboxStyle">
			<div class="bbn-w-100 bbn-spadded"
						style="min-height: max(4em, 100%)"
						contenteditable="true"
						ref="element"
						@input="rteOnInput"
						@keydown="rteOnKeydown"
						@keyup="updateButtonsState"
						@click="updateButtonsState"/>
			<div class="bbn-hidden">
				<slot></slot>
			</div>
			<textarea :required="required"
								:readonly="readonly"
								ref="input"
								:value="value"
								class="bbn-hidden"
								:disabled="isDisabled"/>
		</div>
	</div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-rte');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

/**
 * @file bbn-rte component
 *
 * @description bbn-rte is a component that provides users with a range of options to insert and format text as desired, automatically displaying them as a preview.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 11/01/2017
 */

(() => {
  "use strict";

  const defaultParagraphSeparatorString = 'defaultParagraphSeparator';
  const formatBlock = 'formatBlock';
  const queryCommandState = command => document.queryCommandState(command);
  const queryCommandValue = command => document.queryCommandValue(command);
  const setButtons = buttons => {
    let res = [];
    if (!buttons.length) {
      buttons = Object.keys(defaultButtons);
    }

    bbn.fn.each(buttons, a => {
      if (bbn.fn.isString(a) && defaultButtons[a]) {
        res.push(bbn.fn.extend({code: a}, defaultButtons[a]));
      }
      else {
        res.push(a);
      }
    });

    return res;
  };
  const exec = (command, value = null) => document.execCommand(command, false, value);
  const defaultButtons = {
    bold: {
      icon: 'nf nf-fa-bold',
      text: 'Bold',
      notext: true,
      active: false,
      action: () => exec('bold')
    },
    italic: {
      icon: 'nf nf-fa-italic',
      text: 'Italic',
      notext: true,
      active: false,
      action: () => exec('italic')
    },
    underline: {
      icon: 'nf nf-fa-underline',
      text: 'Underline',
      notext: true,
      active: false,
      action: () => exec('underline')
    },
    strikethrough: {
      icon: 'nf nf-fa-strikethrough',
      text: 'Strike-through',
      notext: true,
      active: false,
      action: () => exec('strikeThrough')
    },
    /*
    heading: {
      icon: 'nf nf-fa-header',
      text: 'Heading 1',
      notext: true,
      items: [
        {
          icon: 'nf nf-mdi-format_header_1',
          text: 'Heading 1',
          notext: true,
          action: () => exec(formatBlock, '<h1>')
        },
        {
          icon: 'nf nf-mdi-format_header_2',
          text: 'Heading 2',
          notext: true,
          action: () => exec(formatBlock, '<h2>')
        },
        {
          icon: 'nf nf-mdi-format_header_3',
          text: 'Heading 3',
          notext: true,
          action: () => exec(formatBlock, '<h3>')
        },
        {
          icon: 'nf nf-mdi-format_header_4',
          text: 'Heading 4',
          notext: true,
          action: () => exec(formatBlock, '<h4>')
        },
        {
          icon: 'nf nf-mdi-format_header_5',
          text: 'Heading 5',
          notext: true,
          action: () => exec(formatBlock, '<h5>')
        },
        {
          icon: 'nf nf-mdi-format_header_6',
          text: 'Heading 6',
          notext: true,
          action: () => exec(formatBlock, '<h6>')
        },
      ]
    },
    paragraph: {
      icon: 'nf nf-fa-paragraph',
      text: 'Paragraph',
      notext: true,
      action: () => exec(formatBlock, '<p>')
    },
    */
    quote: {
      icon: 'nf nf-mdi-format_quote_open',
      text: 'Quote',
      notext: true,
      action: () => exec(formatBlock, '<blockquote>')
    },
    olist: {
      icon: 'nf nf-mdi-format_list_numbers',
      text: 'Ordered List',
      notext: true,
      action: () => exec('insertOrderedList')
    },
    ulist: {
      icon: 'nf nf-mdi-format_list_bulleted_type',
      text: 'Unordered List',
      notext: true,
      action: () => exec('insertUnorderedList')
    },
    code: {
      icon: 'nf nf-mdi-code_tags',
      text: 'Code',
      notext: true,
      action: () => exec(formatBlock, '<pre>')
    },
    line: {
      icon: 'nf nf-oct-horizontal_rule',
      text: 'Horizontal Line',
      notext: true,
      action: () => exec('insertHorizontalRule')
    },
    link: {
      icon: 'nf nf-oct-link',
      text: 'Link',
      notext: true,
      action: () => {
        const url = window.prompt('Enter the link URL')
        if (url) exec('createLink', url)
      }
    },
    image: {
      icon: 'nf nf-mdi-image',
      text: 'Image',
      notext: true,
      action: () => {
        const url = window.prompt('Enter the image URL')
        if (url) exec('insertImage', url)
      }
    }
  };
  const defaultStates = {
    bold: {
      active: () => queryCommandState('bold'),
    },
    italic: {
      active: () => queryCommandState('italic'),
    },
    underline: {
      active: () => queryCommandState('underline'),
    },
    strikethrough: {
      active: () => queryCommandState('strikeThrough'),
    },
  };
  
  const defaultClasses = {
    actionbar: 'pell-actionbar',
    button: 'pell-button',
    content: 'pell-content',
    selected: 'pell-button-selected'
  };
  
  Vue.component('bbn-rte', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.inputComponent,
      bbn.vue.eventsComponent
    ],
    props: {
      /**
       * @prop {Boolean} [true] toolbar
       */
      toolbar: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {String} ['top'] position
       */
      position: {
        type: String,
        default: 'top'
      },
      /**
       * @prop {Boolean} [false] iFrame
       */
      iFrame: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Array} [bbn.env.cdn + 'lib/bbnjs/1.0.1/src/css/iFrame.less'] iframeCSSLinks
       */
      iframeCSSLinks: {
        default(){
          return [bbn.env.cdn + 'lib/bbnjs/1.0.1/src/css/iFrame.less']
        },
        type: Array
      },
      /**
       * The height of the editor
       * @prop {Number|String} ['100%'] height
       */
      height: {
        default: '100%',
        type: [String, Number]
      },
      /**
       * The buttons to show on the toolbar
       * @prop {Array} [[['viewHTML'],['undo', 'redo'],['formatting'],['strong', 'em', 'underline', 'del'],['removeformat', 'foreColor', 'backColor'],['superscript', 'subscript'],['link'],['insertImage', 'base64'],['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],['unorderedList', 'orderedList'],['horizontalRule'],['fullscreen']]] buttons
       */
      buttons: {
        type: Array,
        default() {
          return [];
        }
        /*default(){
          return ['source', '|', 'bold', 'italic', '|', 'ul', 'ol', '|', 'font', 'fontsize', 'brush', 'paragraph', '|','image', 'video', 'table', 'link', '|', 'left', 'center', 'right', 'justify', '|', 'undo', 'redo', '|', 'hr', 'eraser', 'fullsize'];
          return [
            ['viewHTML'],
            ['undo', 'redo'], // Only supported in Blink browsers
            ['formatting'],
            ['strong', 'em', 'underline', 'del'],
            ['removeformat', 'foreColor', 'backColor'],
            ['superscript', 'subscript'],
            ['link'],
            ['insertImage', 'base64'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'center'],
            ['unorderedList', 'orderedList'],
            ['horizontalRule'],
            ['fullscreen'],

          ];
        }*/
      },
      /**
       * The object of configuration.
       * @prop {Object} cfg
       */
      cfg: {
        type: Object,
        default: function(){
          return {
            pinned: true,
            top: null,
            left: null,
            bottom: 5,
            right: 5,
          }
        }
      }
    },
    data(){
      return {
        /**
         * The height to give to the editor depending on the value of the prop height.
         * @data {String} realHeight
         */
        realHeight: typeof this.height === 'string' ? this.height : this.height + 'px',
        /**
         * @data [false] widget
         */
        widget: false,
         /**
         * @data {String|Number} currentValue
         */
        currentValue: this.value
      }
    },
    computed: {
      textboxStyle() {
        let style = {};
        if (this.toolbar) {
          if (this.position === 'top') {
            style.borderTop = '0px';
            style.borderTopLeftRadius = '0px';
            style.borderTopRightRadius = '0px';
          }
          else {
            style.borderBottom = '0px';
            style.borderBottomLeftRadius = '0px';
            style.borderBottomRightRadius = '0px';
          }
        }
        return style;
      }
    },
    methods: {
      setButtons() {
        this.currentButtons = setButtons(this.buttons);
      },
      /**
       * @method updateButtonsState
       */
      updateButtonsState() {
        bbn.fn.iterate(this.currentStates, (a, n) => {
          let row = bbn.fn.getRow(this.currentButtons, {code: n});
          if (row) {
            row.active = a.active();
          }
        });
      },
      /**
       * @method rteOnKeydown
       */
      rteOnKeydown(event) {
        if (event.key === 'Enter' && queryCommandValue(formatBlock) === 'blockquote') {
          setTimeout(() => exec(formatBlock, `<${this.defaultParagraphSeparator}>`), 0);
        }
      },
      /**
       * @method rteOnInput
       */
      rteOnInput(target) {
        let firstChild = target.firstChild;
        if (firstChild && firstChild.nodeType === 3) {
          exec(formatBlock, `<${this.defaultParagraphSeparator}>`);
        }
        else if (this.content.innerHTML === '<br>') {
          this.content.innerHTML = ''
        }
        this.updateButtonsState();
        this.currentValue = this.content.innerHTML;
        this.emitInput(this.currentValue);
      },

    },
    /**
     * @event created
     */
    created(){
      if (!this.value
        && this.$slots.default
        && this.$slots.default[0]
        && this.$slots.default[0].text.length
      ) {
        this.currentValue = this.$slots.default[0].text;
      }
      this.setButtons();
      this.defaultParagraphSeparator = this[defaultParagraphSeparatorString] || 'div'
    },
    /**
     * Initializes the component
     * @event mounted
     * @fires getRef
     * @emits input
     */
    mounted(){
      let cfg = {
        iframe: this.iFrame,
        disabled: this.isDisabled,
        readonly: this.readonly,
        required: this.required,
        allowResizeX: false,
        allowResizeY: false,
        spellcheck: false,
        useSplitMode: true,
        height: this.height,
        tabIndex: 0,
        maxHeight: '100%',
        uploader: {
          insertImageAsBase64URI: true
        },
        iframeCSSLinks: this.iFrame ? this.iframeCSSLinks : []
      };
  
      this.content = this.getRef('element');
      this.content.innerHTML = this.currentValue;
  
      /*
      buttons.forEach(action => {
        const button = createElement('button')
        button.className = classes.button
        button.innerHTML = action.icon
        button.title = action.title
        button.setAttribute('type', 'button')
        button.onclick = () => action.result() && content.focus()
    
        if (action.state) {
          const handler = () => button.classList[action.state() ? 'add' : 'remove'](classes.selected)
          addEventListener(content, 'keyup', handler)
          addEventListener(content, 'mouseup', handler)
          addEventListener(button, 'click', handler)
        }
    
        appendChild(actionbar, button)
      })
  
      if (settings.styleWithCSS) exec('styleWithCSS')
        exec(defaultParagraphSeparatorString, defaultParagraphSeparator)
        */

      this.ready = true;
    },
    watch: {
      value(v) {
        if (v !== this.currentValue) {
          this.currentValue = v;
          this.content.innerHTML = v;
        }
      },
      /**
       * @watch value
       * @param newVal
       */
      buttons: {
        deep: true,
        handler() {
          this.setButtons();
        }
      }
    }
  });
})();


})(bbn);