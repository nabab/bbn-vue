
## bbn-vue compilation process
 

### Empty the content of the `dist` folder

### Creates inside `dist` the following folders:

- `js` (pure javascript components with dependencies and files injection)
  - `components` 
- `js_single_files` (pure javascript components without injection)
  - `components`
- `vue` (Vue single files components)
  - `components` 

### bbn-vue.js file creation

This file is the core of the library. It is a string created by simply adding the contents of the following files:

- `src/vars.js`
- `src/methods.js`
- `src/mixins/*` (all files in mixins)
- `src/mixins.js`
- `src/defaults.js`
- `src/init.js`

Then a minification process is launched to create **bbn-vue.min.js**

### The components files

For each directory in src/components:

- The name of the directory *[COMPONENT]* is the name of the component (without the `bbn-` prefix)
- gets the content of js *[JS]*, html *[HTML]* and less *[LESS]* file (all have the same name as the component)
- gets the content of all files with `lang` extension (ex: widget.fr.lang)
- gets the content of a file bbn.json  
- checks that there is a js content as **javascript is the only mandatory file**
*if not continue to next component*

#### The LESS file treatment

Transform the *[LESS]* string by compiling it into *[CSS]*, on its own.

A new file `dist/js/components/[COMPONENT]/[COMPONENT].css` is created with this string.

#### The dist/vue/components/[COMPONENT].vue creation

- For the Vue single files creates a string putting this content inside a simple `<template/>` tag
```html
<!-- IF [HTML] -->
<template>[HTML]</template>

<!-- IF [CSS] -->
<style scoped>[CSS]</style>

<script>
module.exports = [JS]
</script>
```

#### The dist/js_single_files/component/[COMPONENT].js creation

Escapes first the `` characters from *[HTML]* with backslashes.
Code to be generated:
```javascript
(bbn_resolve) => {
	// This part if [HTML] exists
	let script = document.createElement('script');
	script.innerHTML = `[HTML]`;
	script.setAttribute('id', 'bbn-tpl-component-[COMPONENT]');
	script.setAttribute('type', 'text/x-template');
	document.body.insertAdjacentElement('beforeend', script);

	// This part if [LESS] exists
	let css = document.createElement('link');
	css.setAttribute('rel', 'stylesheet');
	css.setAttribute('href', 'dist/js/component/[COMPONENT]/[COMPONENT].css');
	document.head.insertAdjacentElement('beforeend', css);

	// Here the [JS] content
	
	// If a resolve function has been passed it gets executed
	if (bbn_resolve) {
		bbn_resolve("ok");
	}
})
```


#### The bbn.json file for dependencies

- If there is a content in bbn.json, checks if it has a `dependencies` property.

