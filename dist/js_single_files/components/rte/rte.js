((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, {'bbn-textbox': !floating}, 'bbn-no-padding']"
		 :style="{height: currentHeight}">
	<div v-if="floating"
	     class="bbn-iflex-height"
			 ref="container"
			 style="min-height: 100%; width: 100%; overflow: visible">
		<div contenteditable="true"
		     @focusin="isEditing = true"
				 @input="updateContenteditable"
				 class="bbn-rte-element"
				 ref="element"/>
		<bbn-portal>
			<div v-show="isEditing">
				<bbn-floater :scrollable="false"
										ref="floater"
										@focusin="isEditing = true"
										:element="$el"
										position="topLeft"
										:title="false">
					<bbn-toolbar :source="currentButtons"
											class="bbn-rte-toolbar bbn-header bbn-radius-top bbn-no-border"
											:button-space="false"/>
				</bbn-floater>
			</div>
		</bbn-portal>

	</div>
	<div v-else
	     class="bbn-iflex-height"
			 style="min-height: 100%; width: 100%;">
		<bbn-toolbar :source="currentButtons"
								 class="bbn-rte-toolbar bbn-header bbn-radius-top bbn-no-border"
								 :button-space="false"/>
		<div class="bbn-flex-fill"
				 :style="textboxStyle"
				 @mouseup.stop="getRef('element').focus()">
			<component :is="currentHeight ? 'bbn-scroll' : 'div'">
				<div class="bbn-spadded bbn-rte-element"
							style="min-height: max(4rem, 100%)"
							contenteditable="true"
							ref="element"
							@input="rteOnInput"
							@keydown="rteOnKeydown"
							@keyup="rteOnClick"
							@click="rteOnClick"/>
				<div class="bbn-hidden">
					<slot></slot>
				</div>
				<textarea :required="required"
									:readonly="readonly"
									ref="input"
									:value="value"
									class="bbn-hidden"
									:disabled="isDisabled"/>
			</component>
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
      text: bbn._('Bold'),
      notext: true,
      active: false,
      action: () => exec('bold')
    },
    italic: {
      icon: 'nf nf-fa-italic',
      text: bbn._('Italic'),
      notext: true,
      active: false,
      action: () => exec('italic')
    },
    underline: {
      icon: 'nf nf-fa-underline',
      text: bbn._('Underline'),
      notext: true,
      active: false,
      action: () => exec('underline')
    },
    strikethrough: {
      icon: 'nf nf-fa-strikethrough',
      text: bbn._('Strike-through'),
      notext: true,
      active: false,
      action: () => exec('strikeThrough')
    },
    fontcolor: {
      text: bbn._('Font Color'),
      notext: true,
      active: false,
      component: {
        name: 'bbn-rte-fontcolor',
        template: `
          <span class="bbn-rte-fontcolor bbn-vmiddle bbn-bordered bbn-radius">
            <i class="nf nf-mdi-format_color_text bbn-hxsspace"/>
            <bbn-colorpicker @change="setColor"
                             v-model="currentColor"/>
          </span>
        `,
        data(){
          return {
            currentColor: bbn.fn.rgb2hex(window.getComputedStyle(document.body).color)
          }
        },
        methods: {
          setColor(color){
            exec('foreColor', color);
          }
        },
        mounted(){
          this.closest('bbn-rte').fontColorComponent = this;
        }
      }
    },
    fontbgcolor: {
      text: bbn._('Font Background Color'),
      notext: true,
      active: false,
      component: {
        name: 'bbn-rte-fontbgcolor',
        template: `
        <span class="bbn-rte-fontbgcolor bbn-vmiddle bbn-bordered bbn-radius">
            <i class="nf nf-mdi-format_color_fill bbn-hxsspace bbn-lg"/>
            <bbn-colorpicker @change="setColor"
                             v-model="currentColor"/>
          </span>
        `,
        data(){
          return {
            currentColor: ''
          }
        },
        methods: {
          setColor(color){
            exec('hiliteColor', color);
          }
        },
        mounted(){
          this.closest('bbn-rte').fontBgColorComponent = this;
        }
      }
    },
    /*
    heading: {
      icon: 'nf nf-fa-header',
      text: bbn._('Heading 1'),
      notext: true,
      items: [
        {
          icon: 'nf nf-mdi-format_header_1',
          text: bbn._('Heading 1'),
          notext: true,
          action: () => exec(formatBlock, '<h1>')
        },
        {
          icon: 'nf nf-mdi-format_header_2',
          text: bbn._('Heading 2'),
          notext: true,
          action: () => exec(formatBlock, '<h2>')
        },
        {
          icon: 'nf nf-mdi-format_header_3',
          text: bbn._('Heading 3'),
          notext: true,
          action: () => exec(formatBlock, '<h3>')
        },
        {
          icon: 'nf nf-mdi-format_header_4',
          text: bbn._('Heading 4'),
          notext: true,
          action: () => exec(formatBlock, '<h4>')
        },
        {
          icon: 'nf nf-mdi-format_header_5',
          text: bbn._('Heading 5'),
          notext: true,
          action: () => exec(formatBlock, '<h5>')
        },
        {
          icon: 'nf nf-mdi-format_header_6',
          text: bbn._('Heading 6'),
          notext: true,
          action: () => exec(formatBlock, '<h6>')
        },
      ]
    },
    paragraph: {
      icon: 'nf nf-fa-paragraph',
      text: bbn._('Paragraph'),
      notext: true,
      action: () => exec(formatBlock, '<p>')
    },
    */
    quote: {
      icon: 'nf nf-mdi-format_quote_open',
      text: bbn._('Quote'),
      notext: true,
      action: () => exec(formatBlock, '<blockquote>')
    },
    olist: {
      icon: 'nf nf-mdi-format_list_numbers',
      text: bbn._('Ordered List'),
      notext: true,
      action: () => exec('insertOrderedList')
    },
    ulist: {
      icon: 'nf nf-mdi-format_list_bulleted_type',
      text: bbn._('Unordered List'),
      notext: true,
      action: () => exec('insertUnorderedList')
    },
    code: {
      icon: 'nf nf-mdi-code_tags',
      text: bbn._('Code'),
      notext: true,
      action: () => exec(formatBlock, '<pre>')
    },
    line: {
      icon: 'nf nf-oct-horizontal_rule',
      text: bbn._('Horizontal Line'),
      notext: true,
      action: () => exec('insertHorizontalRule')
    },
    link: {
      icon: 'nf nf-oct-link',
      text: bbn._('Link'),
      notext: true,
      action: () => {
        const url = window.prompt(bbn._('Enter the link URL'))
        if (url) exec('createLink', url)
      }
    },
    image: {
      icon: 'nf nf-mdi-image',
      text: bbn._('Image'),
      notext: true,
      action: () => {
        const url = window.prompt(bbn._('Enter the image URL'))
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

  let openedFloatingRTE = [];
  
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
      },
      floating: {
        type: Boolean,
        default: false
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
        currentValue: this.value,
        /**
         * @data {Vue} fontColorComponent
         */
        fontColorComponent : null,
        /**
         * @data {Vue} fontBgColorComponent
         */
        fontBgColorComponent : null,
        /**
         * @data {Bool} [false] isEditing
         */
        isEditing: false,
        body: document.body

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
      },
      currentHeight(){
        if (!!this.height) {
          return bbn.fn.isNumber(this.height) && (this.height > 0) ? this.height + 'px' : this.height;
        }
        return '';
      }
    },
    methods: {
      /**
       * @method setButtons
       */
      setButtons() {
        let tmp = setButtons(this.buttons);
        if (this.floating) {
          tmp.push({
            icon: 'nf nf-fa-times',
            text: bbn._('Close'),
            notext: true,
            active: false,
            action: () => {
              this.isEditing = false;
            }
          });
        }
        this.currentButtons = tmp;
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
       * @fires setColors
       */
      rteOnKeydown(event) {
        if (event.key === 'Enter') {
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
        if (event.key === 'Enter' && queryCommandValue(formatBlock) === 'blockquote') {
          setTimeout(() => exec(formatBlock, `<${this.defaultParagraphSeparator}>`), 0);
        }
        this.setColors();
      },
      /**
       * @method rteOnClick
       * @fires updateButtonsState
       * @fires setColors
       */
      rteOnClick(event){
        this.updateButtonsState();
        this.setColors();
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
      /**
       * @method setColors
       */
      setColors(){
        if (this.fontColorComponent) {
          this.fontColorComponent.currentColor = bbn.fn.rgb2hex(queryCommandValue('foreColor'));
        }
        if (this.fontBgColorComponent) {
          this.fontBgColorComponent.currentColor = bbn.fn.rgb2hex(queryCommandValue('hiliteColor'));
          if (!this.fontBgColorComponent.currentColor) {
            this.fontBgColorComponent.currentColor = bbn.fn.rgb2hex(queryCommandValue('backColor'));
          }
        }
      },
      onClickDocument(e) {
        let floater = this.getRef('floater');
        let element = this.getRef('element');
        if (floater && element) {
          if (!bbn.fn.isInside(e.target, floater.$el) && !bbn.fn.isInside(e.target, element) && (e.target !== element)) {
            bbn.fn.log("onClickDocument");
            this.isEditing = false;
          }
        }
      },
      updateContenteditable() {
        let element = this.getRef('element');
        let st = element.innerHTML;
        if (st !== this.currentValue) {
          this.currentValue = st;
          this.emitInput(st);
        }
      },
      stopEdit() {
        if (bbn.fn.isNumber(this.stopEditTimeout)) {
          clearTimeout(this.stopEditTimeout);            
        }

        this.stopEditTimeout = setTimeout(() => {
          this.isEditing = false;
        }, 2000)
      }
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
    beforeDestroy() {
      if (this.floating) {
        window.document.body.removeEventListener('click', this.onClickDocument);
      }
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
      },
      isEditing(v) {
        if (this.floating) {
          if (v) {
            window.document.body.addEventListener('click', this.onClickDocument);
            this.$nextTick(() => {
              this.getRef('floater').onResize(true);
            })
          }
          else {
            window.document.body.removeEventListener('click', this.onClickDocument);
          }
          /*
          if (v) {
            if (openedFloatingRTE.indexOf(this) === -1) {
              openedFloatingRTE.push(this);
            }
            bbn.fn.each(openedFloatingRTE, a => {
              if (a !== this) {
                a.isEditing = false;
                a.$forceUpdate();
              }
            });

          }
          else {
            let idx = openedFloatingRTE.indexOf(this);
            if (idx > -1) {
              openedFloatingRTE.splice(idx, 1);
            }
          }
          */
          this.$forceUpdate();

        }
      }
    }
  });
})();


})(bbn);