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
    components: {},
    loadDelay: 5,
  })
})(window.bbn);
