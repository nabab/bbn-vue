<template>
<div :class="componentClass">
  <div class="bbn-iblock"
       tabindex="0"
       @blur="updateEditor"
       ref="divEditor"
       @input="onInlineInput"
       contenteditable="plaintext-only"/>
</div>

</template>
<script>
  module.exports = /**
 * @file bbn-cms-block component
 * @description bbn-cms-block 
 * @copyright BBN Solutions
 * @author Loredana Bruno
 * @created 09/11/2020.
 */
(function(bbn){
  "use strict";
  Vue.component('bbn-inline-editor', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.inputComponent
    ],
    props: {
      /**
       * @prop {String} value
       */
      value: {
        type: String
      }
    },
    data(){
      return {
      }
    },
    computed: {
    },
    methods: {
      onInlineInput(ev) {
        this.emitInput(ev.target.innerText);
      },
      updateEditor(){
        this.getRef('divEditor').innerText = this.value;
      }
    },
    mounted(){
      this.updateEditor();
    },
    watch: {
      currentValue(v) {
        this.emitInput(v);
        this.updateEditor();
      },
      value(v){
        if (v !== this.currentValue) {
          this.currentValue = v;
        }
      },
    }, 
 
  });
})(bbn);

</script>
<style scoped>
.bbn-editable .edit-block-icon {
  position: absolute;
  right: 10px;
  top: -20px;
}
.bbn-editable .edit-block-icon i {
  display: inline-block;
  margin-right: 6px;
}
.bbn-editable .edit-block {
  border: 1px dashed #6e9ecf;
}
.bbn-editable h1,
.bbn-editable h2,
.bbn-editable h3,
.bbn-editable h4,
.bbn-editable h5,
.bbn-editable h6 {
  margin: 0.5em 0 0 0;
  line-height: 1.2;
  font-weight: bold;
  font-weight: 100;
  font-style: normal;
  line-height: 1.2em;
  letter-spacing: 0px;
  text-transform: none;
}
.bbn-editable hr {
  color: #bbb;
  background-color: #bbb;
  border-bottom-width: 0;
  border-top-width: 1px;
}
.bbn-editable .component-container {
  padding: 12px 10px;
  margin: 0 auto;
  float: unset;
}
.bbn-editable .component-container.bbn-block-title {
  padding: 12px 10px;
}
.bbn-editable .component-container.has-hr {
  display: flex;
  align-items: center;
}
.bbn-editable .component-container.has-hr.edit-block {
  flex-direction: column;
}
.bbn-editable .component-container.has-hr.edit-block .edit-title {
  width: 100%;
  display: flex;
  align-items: center;
}
.bbn-editable .component-container.has-hr hr {
  margin: 0 30px;
  flex-grow: 1.5;
}
.bbn-editable .component-container.bbn-block-html h1,
.bbn-editable .component-container.bbn-block-html h2,
.bbn-editable .component-container.bbn-block-html h3 {
  margin: 0;
  white-space: pre-wrap;
}
.bbn-editable .component-container.bbn-block-html em {
  white-space: normal;
}
.bbn-editable .component-container.bbn-block-gallery,
.bbn-editable .bbn-block-carousel {
  margin: 15px auto;
  padding-bottom: 12px;
  text-align: left;
  display: grid;
  grid-gap: 20px;
}
.bbn-editable .component-container.bbn-block-gallery.cols-1,
.bbn-editable .component-container.bbn-block-gallery .cols-1,
.bbn-editable .bbn-block-carousel.cols-1,
.bbn-editable .bbn-block-carousel .cols-1 {
  grid-template-columns: 1fr;
}
.bbn-editable .component-container.bbn-block-gallery.cols-3,
.bbn-editable .component-container.bbn-block-gallery .cols-3,
.bbn-editable .bbn-block-carousel.cols-3,
.bbn-editable .bbn-block-carousel .cols-3 {
  grid-template-columns: repeat(3,1fr);
}
.bbn-editable .component-container.bbn-block-gallery.cols-4,
.bbn-editable .component-container.bbn-block-gallery .cols-4,
.bbn-editable .bbn-block-carousel.cols-4,
.bbn-editable .bbn-block-carousel .cols-4 {
  grid-template-columns: repeat(4,1fr);
}
.bbn-editable .component-container.bbn-block-gallery.cols-2,
.bbn-editable .component-container.bbn-block-gallery .cols-2,
.bbn-editable .bbn-block-carousel.cols-2,
.bbn-editable .bbn-block-carousel .cols-2 {
  grid-template-columns: repeat(2,1fr);
}
.bbn-editable .component-container.bbn-block-gallery a,
.bbn-editable .bbn-block-carousel a {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.bbn-editable .component-container.bbn-block-gallery a .bbn-block-gallery-caption,
.bbn-editable .bbn-block-carousel a .bbn-block-gallery-caption {
  margin-top: 7px;
}
.bbn-editable .bbn-block-carousel {
  display: block;
  margin: 0 auto;
}
.bbn-editable .bbn-block-carousel .cols-1,
.bbn-editable .bbn-block-carousel .cols-2,
.bbn-editable .bbn-block-carousel .cols-3,
.bbn-editable .bbn-block-carousel .cols-4 {
  display: grid;
  grid-gap: 20px;
}
.bbn-editable .bbn-block-carousel time {
  opacity: .7;
  margin: 0;
  font-size: 13px;
  line-height: 1.4em;
  text-transform: none;
}
.bbn-editable .bbn-block-carousel .control i {
  display: inline-block;
  cursor: pointer;
  opacity: .4;
  position: relative;
  top: auto;
  left: auto;
  right: auto;
  bottom: auto;
  margin: 0 0 15px 0;
  padding: 0;
  background-color: transparent;
  color: inherit !important;
  font-size: 20px;
  line-height: 16px;
}
.bbn-editable .bbn-block-carousel .control i:hover {
  opacity: 1;
}
.bbn-editable .bbn-block-carousel .control i.prev {
  margin-right: 10px;
}
.bbn-editable .bbn-block-carousel a .bbn-block-gallery-caption {
  font-size: 20px;
}
.bbn-editable .bbn-block-carousel a .bbn-block-gallery-caption:hover {
  text-decoration: underline;
}
.bbn-editable .bbn-block-image img {
  max-width: 100%;
}
.bbn-editable .bbn-block-image .image-details-title,
.bbn-editable .bbn-block-gallery .image-details-title {
  font-size: 1.3em;
  line-height: 1em;
  margin: 1em 0 .2em 0;
  display: inline-block;
}
.bbn-editable .bbn-block-social ul.bbn-menulist.free {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bbn-editable .bbn-block-social .ss-social-list-wrapper {
  left: 0 !important;
}
.bbn-editable .bbn-block-social .bbn-block-social-button {
  line-height: 18px;
  font-weight: bold;
}
.bbn-editable .bbn-block-social .bbn-block-social-button .bbn-block-social-icon {
  color: #ebebeb;
  line-height: 18px;
}
.bbn-editable .bbn-block-social .bbn-block-social-button:hover .nf-fa-share_alt {
  color: #5c5c5c;
}
.bbn-editable .bbn-block-social .bbn-block-social-button:hover .nf-fa-heart {
  color: red;
}
.bbn-editable .component-container .bbn-grid-fields {
  align-items: center;
}
.bbn-editable .bbn-grid-fields {
  border: none !important;
}
.bbn-editable .block-space-edit {
  border: 1px dashed #dddddd;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

</style>
