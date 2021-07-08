((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    defaults: {
      appui: {
        pollable: false,
        clipboard: false,
        header: false,
        status: false,
        nav: false,
        footer: false,
        urlNavigation: true,
        //root: '',
        pollerPath: 'core/poller',
        logo: 'https://bbn.solutions/logo.png',
        leftShortcuts: [],
        rightShortcuts: [],
        themes: [
          {
            "value": "neutral",
            "text": "Neutral",
            "isDark": false
          },{
            "value": "uniform",
            "text": "Uniform",
            "isDark": false
          }, {
            "value": "black",
            "text": "Black",
            "isDark": true
          }, {
            "value": "blue",
            "text": "Blue",
            "isDark": false
          }, {
            "value": "default",
            "text": "Default",
            "isDark": false
          }, {
            "value": "dark",
            "text": "Dark",
            "isDark": true
          }, {
            "value": "flat",
            "text": "Flat",
            "isDark": false
          }, {
            "value": "jeans",
            "text": "Jeans",
            "isDark": false
          }, {
            "value": "grey",
            "text": "Grey",
            "isDark": true
          }, {
            "value": "moonlight",
            "text": "Moonlight",
            "isDark": true
          }, {
            "value": "mirko",
            "text": "Mirko",
            "isDark": true
          }, {
            "value": "grinks",
            "text": "Grinks",
            "isDark": false
          }, {
            "value": "turquoise-light2",
            "text": "Turquoise light variant",
            "isDark": false
          }, {
            "value": "turquoise-dark2",
            "text": "Turquoise dark variant",
            "isDark": true
          }, {
            "value": "turquoise-dark",
            "text": "Turquoise dark",
            "isDark": true
          }, {
            "value": "turquoise-light",
            "text": "Turquoise light",
            "isDark": false
          },{
            "value": "moonlight-variant",
            "text": "Moonlight variant",
            "isDark": true
          }
        ],
      },
      code: {
        defaultTheme: 'pastel-on-dark'
      }
    }
  })
})(window.bbn);
