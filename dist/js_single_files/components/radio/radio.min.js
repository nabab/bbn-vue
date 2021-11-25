((bbn)=>{let script=document.createElement('script');script.innerHTML=`<div :class="['bbn-iblock', componentClass]">
  <input class="bbn-hidden"
         ref="element"
         :value="modelValue"
         :disabled="disabled"
         :required="required"
  >
  <div :style="getStyle()">
    <div v-for="(d, idx) in source"
         :class="{
            'bbn-iblock': !vertical,
            'bbn-right-space': !vertical && !separator && source[idx+1],
            'bbn-bottom-sspace': !!vertical && !separator && source[idx+1]
         }"
    >
      <input :value="d[sourceValue]"
             :name="name"
             class="bbn-radio"
             type="radio"
             :disabled="disabled || d.disabled"
             :required="required"
             :id="id + '_' + idx"
             @change="changed(d[sourceValue], d, $event)"
             :checked="d[sourceValue] === modelValue"
      >
      <label class="bbn-radio-label bbn-iflex bbn-vmiddle"
             :for="id + '_' + idx"
      >
         <span class="bbn-left-sspace"
               v-html="render ? render(d) : d[sourceText]"
         ></span>
      </label>
      <br v-if="!vertical && step && ((idx+1) % step === 0)">
      <div v-if="(source[idx+1] !== undefined) && !!separator"
           :class="{
            'bbn-w-100': vertical,
            'bbn-iblock': !vertical
           }"
           v-html="separator"
      ></div>
    </div>
  </div>
</div>`;script.setAttribute('id','bbn-tpl-component-radio');script.setAttribute('type','text/x-template');document.body.insertAdjacentElement('beforeend',script);(function(bbn){"use strict";Vue.component('bbn-radio',{mixins:[bbn.vue.basicComponent,bbn.vue.inputComponent,bbn.vue.localStorageComponent,bbn.vue.eventsComponent],props:{separator:{type:String},vertical:{type:Boolean,default:false},step:{type:Number},id:{type:String,default(){return bbn.fn.randomString(10,25);}},render:{type:Function},sourceText:{type:String,default:'text'},sourceValue:{type:String,default:'value'},source:{type:Array,default(){return[{text:bbn._("Yes"),value:1},{text:bbn._("No"),value:0}];}},modelValue:{type:[String,Boolean,Number],default:undefined}},model:{prop:'modelValue',event:'input'},methods:{changed(val,d,e){this.$emit('input',val);this.$emit('change',val,d,e);},getStyle(){if(this.step&&!this.vertical){return'display: grid; grid-template-columns: '+'auto '.repeat(this.step)+';';}
else{return'';}}},beforeMount(){if(this.hasStorage){let v=this.getStorage();if(v&&(v!==this.modelValue)){this.changed(v);}}},watch:{modelValue(v){if(this.storage){if(v){this.setStorage(v);}
else{this.unsetStorage()}}},}});})(bbn);})(bbn);