((bbn) => {
  "use strict";
  let version = '2.0.2';
  let libURL = '';
  bbn.fn.each(document.head.getElementsByTagName('script'), s => {
    if (s.src && (s.src.indexOf('bbn-vue/' + version + '/') > -1)) {
      libURL = s.src.split('bbn-vue/' + version + '/')[0] + 'bbn-vue/' + version + '/';
      return false;
    }
  })

  bbn.fn.autoExtend("vue", {
    libURL: libURL,
    defaultLocalURL: false,
    defaultLocalPrefix: '',
    localURL: false,
    version: version,
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
    components: {},
    loadDelay: 5,
  })
})(window.bbn);
