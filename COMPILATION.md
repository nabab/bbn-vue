# bbn-vue compilation process
 

## The `dist` folder

- Empty the content of the `dist` folder
- Create inside the following folders:
  - `js` (pure javascript components with dependencies and files injection)
    - `components` 
  - `js_single_files` (pure javascript components without injection)
    - `components`
  - `vue` (Vue single files components)
    - `components` 

## bbn-vue.js file creation

This file is the core of the library. It is a string created by simply adding the contents of the following files in this specific order:

- `src/vars.js`
- `src/methods.js`
- `src/mixins/*` (all files in mixins)
- `src/mixins.js`
- `src/defaults.js`
- `src/init.js`

Then a minification process is launched to create **bbn-vue.min.js**

## The components files

For each directory in src/components:

- The name of the directory *[CP]* is the name of the component (without the `bbn-` prefix)
- get the content of js *[JS]*, html *[HTML]* and less *[LESS]* file (all have the same name as the component)
- get the content of all files with `lang` extension (ex: widget.fr.lang)
- get the content of a file bbn.json  
- check that there is a js content as **javascript is the only mandatory file**
*if not continue to next component*
- if there is any *[LESS]* compile it into *[CSS]*

### The dist/vue/components/[CP]/[CP].vue creation

```html
<!-- IF [HTML] -->
<template>[HTML]</template>

<!-- IF [CSS] -->
<style scoped>[CSS]</style>

<script>
module.exports = [JS]
</script>
```

### The dist/js_single_files/components/[CP]/[CP].js creation

First escape the `` characters from *[HTML]* with backslashes.

```javascript
// Name for avoiding conflicts
(bbn_resolve) => {
	// This part if [HTML] exists
	let script = document.createElement('script');
	script.innerHTML = `[HTML]`;
	script.setAttribute('id', 'bbn-tpl-component-[CP]');
	script.setAttribute('type', 'text/x-template');
	document.body.insertAdjacentElement('beforeend', script);

	// Here the [JS] content
	
	// If a resolve function has been passed it gets executed
	if (bbn_resolve) {
		bbn_resolve("ok");
	}
})
```

### The dist/js/components/[CP]/[CP].js creation without dependencies

First escape the `` characters from *[HTML]* with backslashes.

Generate the dist/js/components/[CP]/[CP].css with *[CSS]* if any.

```javascript
// Name for avoiding conflicts
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

## The dependencies issues

The `bbn-vue` library comes with an autoloading feature for its components definitions. However as some of these components use external library they need to load these before executing their definition.

One file comes in play in that case, it's `bbn.json`.  This file includes the dependencies, so if any, they will come enumerated in the classic form:

```json
{
  "dependencies": {
    "apexcharts.js": ">= 3.15.5"
  }
}
```

But from here, instead of nodejs, it is a local SQLite database which manages the dependencies. This database will provide some information that we wouldn't know to get through NPM:

```json
{
  "files": [
    "dist\/apexcharts.min.js",
    "dist\/apexcharts.css"
  ],
  "lang": [
    "dist\/locales\/%s.js"
  ],
  "theme_files": [
    "dist\/theme\/%s.css"
  ],
  "default_theme": "default"
}
```

This autoloading being managed by bbn-vue, a locale will have been set and will replace the `%s` in the lang file, as a selected theme or the `default_theme` will replace the one in `theme_files`.

This database is maintained by us, and has also the dependencies informations for each library - dependencies that are also in the database. 

**We have a method that checks all the dependencies backwards and makes a list of files library by library, in the right order, javascript on one side, css on the other.**

```javascript
{
  includes: [
    {
      js: [
        "dist/apexcharts.min.js",
        "dist/locales/fr_FR.js"
      ],
      css: [
        "dist/apexcharts.css",
        "dist/theme/default.css"
      ],
      name: 'apexcharts',
      mode: 'npm'
    },
    // Other libraries...
  ]
}
```

This is the thing that prevents us from creating a *normal* build method.

A few ideas:

- maybe we can get that specific data from npm or other
- we include the database in the build, and make use of it during the node compilation
- we create a public repository with a simpler JSON file which would be an export of the parts of the database that interest the components


### The dist/js/components/[CP]/[CP].js creation with dependencies

First escape the `` characters from *[HTML]* with backslashes.

Generate the dist/js/components/[CP]/[CP].css with *[CSS]* if any.

#### Going through the `includes` array



Create a string *[FILES_STRING]* like this:

`'https://cdn.jsdelivr.net/combine/' + [JS_FILES].join(',')`

For each different folders

This will make a compilation of all the given files in one request.

So our file should go like this: 

```javascript
// Name for avoiding conflicts
(bbn_resolve) => {
  let script_dep = document.createElement('script');
  script_dep.setAttribute('src', [FILES_STRING]);
  script_dep.onload = () => {
    let css_dependency = document.createElement('link');
    css_dependency.setAttribute('rel', 'stylesheet');
    css_dependency.setAttribute('href', '$css_d');
		document.head.insertAdjacentElement('beforeend', css_dependency);
	};

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
		bbn_resolve();
	}
}
```
