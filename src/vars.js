((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    defaultLocalURL: false,
    defaultLocalPrefix: '',
    localURL: false,
    version: '2.0.3',
    isNodeJS: false,
    localPrefix: '',
    loadingComponents: [],
    loadedComponents: [],
    // Definition rules by prefix
    knownPrefixes: [],
    // Each unknown tag sent to loadComponentsByPrefix
    parsedTags: [],
    queueTimer: 0,
    queue: [],
    queueTimerBBN: 0,
    queueBBN: [],
    components: {
      appui: {},
      autocomplete: {},
      button: {},
      chart: {},
      chat: {},
      checkbox: {},
      code: {},
      colorpicker: {},
      colorpicker2: {},
      combo: {},
      context: {},
      countdown: {},
      countdown2: {},
      dashboard: {},
      datepicker: {},
      datetimepicker: {},
      dropdown: {},
      //dropdowntreeview: {},
      field: {},
      filter: {},
      fisheye: {},
      //footer: {},
      form: {},
      grapes: {},
      initial: {},
      input: {},
      'json-editor': {},
      list: {},
      loader: {},
      loading: {},
      markdown: {},
      masked: {},
      menu: {},
      message: {},
      multiselect: {},
      notification: {},
      numeric: {},
      operator: {},
      pane: {},
      popup: {},
      progressbar: {},
      radio: {},
      rte: {},
      scheduler: {},
      scroll: {},
      'scroll-x': {},
      'scroll-y': {},
      search: {},
      slider: {},
      slideshow: {},
      splitter: {},
      switch: {},
      table: {},
      tabnav: {},
      textarea: {},
      timepicker: {},
      toolbar: {},
      tooltip: {},
      tree: {},
      treemenu: {},
      'tree-input': {},
      upload: {},
      vlist: {}
    },
    loadDelay: 20,
  })
})(window.bbn);
