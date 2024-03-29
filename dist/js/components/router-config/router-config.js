(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-padded', 'bbn-block']">
  <h1 v-text="_('Router Configuration')"/>
  <h2 v-text="_('Navigation mode')"/>
  <div class="bbn-router-config-mode bbn-w-100 bbn-grid"
       :style="'grid-template-columns: repeat(' + numModes + ', 1fr)'">
    <div class="bbn-h-100"
         v-if="visual">
      <div :class="'bbn-bordered bbn-w-100 bbn-flex-height' + (mode === 'visual' ? ' bbn-selected-border' : '')">
        <div class="bbn-flex-fill">
          <div class="bbn-router-config bbn-router-config-visual">
            <div class="bbn-bg-black bbn-white">
              <div class="bbn-100 bbn-middle">
                <div class="bbn-block">
                  <i :class="'bbn-xl bbn-p nf nf-fa-' + (visualShowAll ? 'minus' : 'plus')"
                     @click="visualShowAll = !visualShowAll"/>
                </div>
              </div>
            </div>
            <div v-for="i in 14"
                 :key="i"
                 v-show="visualShowAll || (i < (visualSelected <= 6 ? 6 : 5)) || (i === visualSelected)"
                 @click="onSelect('visual', i)"
                 :class="{
                   'bbn-reactive': visualSelected !== i,
                   'bbn-router-config-mode-selected': !visualShowAll && (visualSelected === i),
                   'bbn-state-selected': visualShowAll && (visualSelected === i)
                 }">
              <div class="bbn-100 bbn-middle">
                <div class="bbn-block">
                  <bbn-icon :content="svg"
                            width="1.5rem"
                            v-if="i !== visualSelected"/>
                  <div :class="{
                    'bbn-s': visualSelected !== i,
                    'bbn-lg': visualSelected === i,
                    'bbn-badge': true
                  }"
                       v-text="i"/>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div class="bbn-b bbn-spadding">
          <div class="bbn-iblock bbn-left-margin bbn-upper bbn-reactive-text"
               v-text="_('visual')"
               @click="mode = 'visual'"/>
        </div>
      </div>
    </div>

    <div class="bbn-h-100"
         v-if="tabs">
      <div :class="'bbn-bordered bbn-w-100 bbn-flex-height' + (mode === 'tabs' ? ' bbn-selected-border' : '')">
        <div class="bbn-flex-fill">
          <div class="bbn-router-config bbn-router-config-tabs">
            <div v-for="i in 9"
                 :key="i"
                 @click="onSelect('tabs', i)"
                 :class="{'bbn-reactive': tabsSelected !== i, 'bbn-state-selected': tabsSelected === i}">
              <div class="bbn-badge bbn-s" v-text="i"/>
            </div>
            <div class="bbn-router-config-mode-selected"
                 @click="onSelect('tabs', tabsSelected)">
              <div class="bbn-100 bbn-middle">
                <div class="bbn-block">
                  <div class="bbn-lg bbn-badge"
                       v-text="tabsSelected"/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bbn-b bbn-spadding">
          <div class="bbn-iblock bbn-left-margin bbn-upper bbn-reactive-text"
               v-text="_('tabs')"
               @click="onSelect('tabs', tabsSelected)"/>
        </div>
      </div>
    </div>

    <div class="bbn-h-100"
         v-if="breadcrumb">
      <div :class="'bbn-bordered bbn-w-100 bbn-flex-height' + (mode === 'breadcrumb' ? ' bbn-selected-border' : '')">
        <div class="bbn-flex-fill">
          <div class="bbn-router-config bbn-router-config-breadcrumb">
            <div v-for="i in 6"
                 :key="i"
                 v-show="breadcrumbActive || (i === breadcrumbSelected)"
                 @click="breadcrumbActive = !breadcrumbActive; breadcrumbSelected = i"
                 :class="{'bbn-reactive': breadcrumbSelected !== i, 'bbn-state-selected': breadcrumbSelected === i}">
              <div class="bbn-badge bbn-s" v-text="i"/>
            </div>
            <div class="bbn-router-config-mode-selected"
                 v-show="!breadcrumbActive"
                 @click="onSelect('breadcrumb', breadcrumbSelected)">
              <div class="bbn-100 bbn-middle">
                <div class="bbn-block">
                  <div class="bbn-lg bbn-badge"
                       v-text="breadcrumbSelected"/>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div class="bbn-b bbn-spadding">
          <div class="bbn-iblock bbn-left-margin bbn-upper bbn-reactive-text"
               v-text="_('breadcrumb')"
               @click="onSelect('breadcrumb', breadcrumbSelected)"/>
        </div>
      </div>
    </div>
  </div>
  <h2 v-text="_('Visual orientation')"
      v-if="mode === 'visual'"/>
  <div v-if="mode === 'visual'"
       class="bbn-router-config-orientation bbn-grid bbn-w-100">
    <div class="bbn-h-100"
         v-for="(ori, dir) in orientations"
         :key="dir">
      <div :class="'bbn-bordered bbn-w-100 bbn-flex-height' + (currentOrientation === dir ? ' bbn-selected-border' : '')">
        <div class="bbn-flex-fill">
          <div class="bbn-router-config bbn-router-visual-orientation">
            <div v-for="i in 5"
                 :key="i"
                 class="bbn-alt-background">
              <div class="bbn-100 bbn-middle">
                <div class="bbn-block bbn-spadded">
                  <bbn-icon :content="svg"
                            width="1rem"/>
                </div>
              </div>
            </div>
            <div :style="'grid-area: ' + ori.area">
              <div class="bbn-100 bbn-middle bbn-p"
                   @click="currentOrientation = dir">
                <div class="bbn-block bbn-s bbn-light"
                     v-text="ori.text"/>
              </div>
            </div>

          </div>
        </div>
        <div class="bbn-b bbn-spadding bbn-upper"
             v-text="ori.pos"/>
      </div>
    </div>
  </div>
  <h2 v-text="_('Presets')"/>
  <div class="bbn-w-100 bbn-vspadding bbn-light bbn-m"
       v-text="_('Soon...')"></div>
  <h2 v-text="_('Configuration backups')"/>
  <div class="bbn-w-100 bbn-vspadding bbn-light bbn-m"
       v-text="_('Soon...')"></div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-router-config');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/router-config/router-config.css');
document.head.insertAdjacentElement('beforeend', css);

/**
 * @file bbn-router component
 * @description bbn-router is a component that allows and manages the navigation (url) between the various containers of an application
 * @copyright BBN Solutions
 * @author BBN Solutions
 */
(function(bbn, Vue){
  "use strict";

  const img = `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
  viewBox="0 0 58 58" style="enable-background:new 0 0 58 58;" xml:space="preserve">
<g>
 <path d="M57,6H1C0.448,6,0,6.447,0,7v44c0,0.553,0.448,1,1,1h56c0.552,0,1-0.447,1-1V7C58,6.447,57.552,6,57,6z M56,50H2V8h54V50z"
   />
 <path d="M16,28.138c3.071,0,5.569-2.498,5.569-5.568C21.569,19.498,19.071,17,16,17s-5.569,2.498-5.569,5.569
   C10.431,25.64,12.929,28.138,16,28.138z M16,19c1.968,0,3.569,1.602,3.569,3.569S17.968,26.138,16,26.138s-3.569-1.601-3.569-3.568
   S14.032,19,16,19z"/>
 <path d="M7,46c0.234,0,0.47-0.082,0.66-0.249l16.313-14.362l10.302,10.301c0.391,0.391,1.023,0.391,1.414,0s0.391-1.023,0-1.414
   l-4.807-4.807l9.181-10.054l11.261,10.323c0.407,0.373,1.04,0.345,1.413-0.062c0.373-0.407,0.346-1.04-0.062-1.413l-12-11
   c-0.196-0.179-0.457-0.268-0.72-0.262c-0.265,0.012-0.515,0.129-0.694,0.325l-9.794,10.727l-4.743-4.743
   c-0.374-0.373-0.972-0.392-1.368-0.044L6.339,44.249c-0.415,0.365-0.455,0.997-0.09,1.412C6.447,45.886,6.723,46,7,46z"/>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
</svg>

`;

  Vue.component("bbn-router-config", {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.localStorageComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent,
      bbn.vue.localStorageComponent,
    ],
    props: {
      router: {
        type: Vue,
        required: true
      },
      visual: {
        type: Boolean,
        default: true
      },
      tabs: {
        type: Boolean,
        default: true
      },
      breadcrumb: {
        type: Boolean,
        default: true
      },
    },
    data() {
      let modes = ['visual', 'tabs', 'breadcrumb'];
      let num = 0;
      bbn.fn.each(modes, m => {
        if (this[m]) {
          num++;
        }
      });
      if (num < 2) {
        throw new Error(bbn._("You cannot have more then one mode disabled"))
      }

      return {
        numModes: num,
        svg: img,
        visualSelected: 2,
        breadcrumbSelected: 2,
        tabsSelected: 2,
        breadcrumbActive: false,
        visualShowAll: false,
      };
    },
    computed: {
      orientations() {
        let tmp = {
          auto: {
            pos: bbn._("Auto"),
            text: bbn._("Picks left or top in function of your window's size"),
            value: false
          },
          left: {
            pos: bbn._("Left"),
            text: bbn._("On the left of the main content"),
            area: '1 / 2 / 6 / 6',
            value: false
          },
          top: {
            pos: bbn._("Top"),
            text: bbn._("On the top of the main content"),
            area: '2 / 1 / 6 / 6',
            value: false
          },
          right: {
            pos: bbn._("Right"),
            text: bbn._("On the right of the main content"),
            area: '1 / 1 / 6 / 5',
            value: false
          },
          bottom: {
            pos: bbn._("Bottom"),
            text: bbn._("On the bottom of the main content"),
            area: '1 / 1 / 5 / 6',
            value: false
          }
        };
        tmp.auto.area = tmp[this.guessedOrientation].area;
        return tmp;
      },
      mode: {
        get() {
          if (this.router.isVisual) {
            return 'visual';
          }
          if (this.router.isBreadcrumb) {
            return 'breadcrumb';
          }
          if (this.router.nav) {
            return 'tabs';
          }
          return false;
        },
        set(v) {
          switch (v) {
            case 'visual':
              this.router.isVisual = true;
              this.router.isBreadcrumb = false;
              break;
            case 'breadcrumb':
              this.router.isBreadcrumb = true;
              this.router.isVisual = false;
              break;
            default:
              this.router.isBreadcrumb = false;
              this.router.isVisual = false;
              break;
          }
        }
      },
      guessedOrientation() {
        return this.router.lastKnownWidth > this.router.lastKnownHeight ? 'left' : 'top';
      },
      currentOrientation: {
        get() {
          return this.router.lockedOrientation ? this.router.visualOrientation : 'auto';
        },
        set(v) {
          if (this.orientations[v]) {
            this.router.lockedOrientation = v !== 'auto'
            this.router.visualOrientation = v ===  'auto' ? 
                (this.router.lastKnownWidth > this.router.lastKnownHeight ? 'left' : 'top')
                : v;
          }
        }
      }
    },

    methods: {
      onSelect(mode, index) {
        let v = this[mode + 'Selected'];
        if (v !== undefined) {
          if (v === index) {
            this.mode = mode;
          }
          else {
            this[mode + 'Selected'] = index;
            this.visualShowAll = false;
          }
        }
      }
    },

    /**
     * @event created
     */
    created(){
    },
    /**
     * @event mounted
     * @fires getStorage
     * @fires getDefaultURL
     * @fires add
     */
    mounted(){
    },
    /**
     * @event beforeDestroy
     */
    beforeDestroy(){
    },
    watch: {
    }
  });

})(bbn, Vue);
if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}