((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    defaults: {
      appui: {
        pollable: false,
        clipboard: false,
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
          },{
            "value": "m-neutral",
            "text": "Marguerite Neutral"
          },{
            "value": "m-uniform",
            "text": "marguerite Uniform"
          }, {
            "value": "m-black",
            "text": "marguerite Black"
          }, {
            "value": "m-blue",
            "text": "marguerite Blue"
          }, {
            "value": "m-default",
            "text": "marguerite Default"
          }, {
            "value": "m-flat",
            "text": "marguerite Flat"
          }, {
            "value": "m-jeans",
            "text": "marguerite Jeans"
          }, {
            "value": "m-grey",
            "text": "marguerite Grey"
          }, {
            "value": "m-moonlight",
            "text": "marguerite-Moonlight"
          }, {
            "value": "m-mirko",
            "text": "marguerite Mirko"
          }, {
            "value": "m-turquoise-light2",
            "text": "marguerite Turquoise light variant"
          }, {
            "value": "m-turquoise-dark2",
            "text": "marguerite Turquoise dark variant"
          }, {
            "value": "m-turquoise-dark",
            "text": "marguerite Turquoise dark"
          }, {
            "value": "m-turquoise-light",
            "text": "marguerite Turquoise light"
          },
        ],
      },
      code: {
        defaultTheme: 'pastel-on-dark'
      }
    }
  })
})(window.bbn);