<div :class="componentClass"
     @keydown.enter.stop=""
>
  <textarea :value="value"
            :name="name"
            ref="element"
            :disabled="disabled"
            :required="required"
  ></textarea>
</div>