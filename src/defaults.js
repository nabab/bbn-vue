((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    defaults: {
      appui: {
        pollable: false,
        header: false,
        status: false,
        tabnav: false,
        root: '',
        pollerPath: 'core/poller',
        logo: 'https://bbn.solutions/logo.png',
        leftShortcuts: [],
        rightShortcuts: [],
        themes: [
          {
            "value": "neutral",
            "text": "Neutral"
          },{
            "value": "uniform",
            "text": "Uniform"
          }, {
            "value": "black",
            "text": "Black"
          }, {
            "value": "blue",
            "text": "Blue"
          }, {
            "value": "default",
            "text": "Default"
          }, {
            "value": "flat",
            "text": "Flat"
          }, {
            "value": "jeans",
            "text": "Jeans"
          }, {
            "value": "grey",
            "text": "Grey"
          }, {
            "value": "moonlight",
            "text": "Moonlight"
          }, {
            "value": "mirko",
            "text": "Mirko"
          }, {
            "value": "turquoise-light2",
            "text": "Turquoise light variant"
          }, {
            "value": "turquoise-dark2",
            "text": "Turquoise dark variant"
          }, {
            "value": "turquoise-dark",
            "text": "Turquoise dark"
          }, {
            "value": "turquoise-light",
            "text": "Turquoise light"
          }
        ],
      },
      code: {
        defaultTheme: 'pastel-on-dark'
      }
    }
  })
})(window.bbn);