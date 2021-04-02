((bbn) => {
  "use strict";
  let version = '2.0.2';
  let libURL = '';
  if ((typeof bbn_root_dir !== 'undefined')
    && (typeof bbn_root_url !== 'undefined')
    && bbn_root_dir
    && bbn_root_url
  ) {
    libURL = bbn_root_url + bbn.fn.dirName(bbn_root_dir) + '/';
  }

  bbn.fn.autoExtend("vue", {
    uid: 0,
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
