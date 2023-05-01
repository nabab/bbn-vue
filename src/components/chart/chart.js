/**
 * @file bbn-chart component
 *
 * @description  The bbn-chart component is a graphical representation of data.
 * It allows large amounts of information to be condensed into an easily understandable visual format where complex data can be displayed, interpreted and analyzed with detailed customization using one of these graphs: "line", "area", "bar", "pie", "donut" and "radial".
 *
 * @author Mirko Argentino
 *
 * @copyright BBN Solutions
 *
 * @created 10/02/2020
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.resizer
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.resizer
    ],
    props: {
      /**
       * The component's data.
       * @prop {Object} source
       */
      source: {
        type: Object
      },
      /**
       * The type of chart.
       * @prop {String} ['line'] type
       */
      type: {
        type: String,
        required: true,
        default: 'line',
        validator: t => ['line', 'bar', 'pie', 'donut', 'area', 'radial'].includes(t)
      },
      /**
      * The width of the chart.
      * @prop {String} ['100%'] width
      */
      width: {
        type: String,
        default: '100%'
      },
      /**
       * The height of the chart.
       * @prop {String} ['100%'] height
       */
      height: {
        type: String,
        default: '100%'
      },
      /**
       * The theme of chart.
       *
       * @prop {String} ['light'] theme
       */
      theme: {
        type: String,
        default(){
          if ( appui && appui.theme && appui.themes ){
            let isDark = bbn.fn.getField(appui.themes, 'isDark', {value: appui.theme});
            return !!isDark ? 'dark' : 'light';
          }
          return 'light';
        },
        validator: t => ['light', 'dark'].includes(t)
      },
      /**
       * The title of the chart.
       * @prop {String} title
       */
			title: {
        type: String
      },
      /**
       * The x-axis title.
       * @prop {String} xTitle
       */
      xTitle: {
			  type: String
      },
      /**
       * The y-axis title.
       * @prop {String} yTitle
       */
      yTitle: {
			  type: String
      },
      /**
       * Set it to false to hide the value points on the line chart, or specific the point' size.
       * @prop {Boolean|Number} [6] points
       */
      points: {
        type: [Boolean, Number],
        default: 6
      },
      /**
			 * Set it to false if you want to hide the labels on the points.
			 * @prop {Boolean} [true] pointsLabels
			 */
      pointsLabels: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true to show a smooth line on the line chart.
       * @prop {Boolean} [false] smooth
       */
      smooth: {
        type: Boolean,
        default: false
      },
      /**
			 * Set it to true to see a square line on the line and area charts.
			 * @prop {Boolean} [false] step
			 */
      step: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to create a donut pie chart. Integers can be given to determine the donut width.
       * @prop {Boolean|Number} [false] donut
       */
      donut: {
        type: [Boolean, Number],
        default: false
      },
      /**
       * The series' background style ('gradient' or 'solid').
       * @prop {String} ['gradient'] fill
       */
      fill: {
        type: String,
        default: 'gradient',
        validator: f => ['gradient', 'solid'].includes(f)
      },
      /**
       * Opacity adjustment.
       * From 0.1 to 1
       * @prop {Number|String} opacity
      */
      opacity: {
        type: [Number, String]
      },
      /**
       * X-axis configuration object.
       * @prop {Object} [{}] xAxis
       */
      xAxis: {
        type: Object,
        default(){
          return {};
        }
      },
      /**
       * Y-axis configuration object.
       * @prop {Object} [{}] yAxis
       */
      yAxis: {
        type: Object,
        default(){
          return {};
        }
      },
      /**
       * Set it to false to hide the grid line on the chart.
       * @prop {Boolean} [true] grid
       */
      grid: {
        type: Boolean,
        default: true
      },
      /**
       * Set it to false if you want to hide the grid for the x-axis on the chart.
       * @prop {Boolean} [true] xGrid
       */
      xGrid: {
        type: Boolean,
        default: true
      },
      /**
      * Set it to false if you want to hide the grid for the y-axis on the chart.
      * @prop {Boolean} [true] yGrid
      */
      yGrid: {
        type: Boolean,
        default: true
      },
      /**
			 * The grid's color.
			 * @prop {String} gridColor
			 */
      gridColor: {
        type: String
      },
      /**
			 * The grid's background.
			 * @prop {String} gridColor
			 */
      gridBackground: {
        type: String
      },
      /**
       * Set it to false if you want to disable the animations.
       * If you give a number it will be used as the time (ms) for the animations.
       *
       * @prop {Boolean|Number} [800] animation
       */
      animation: {
        type: [Boolean, Number],
        default: 800
      },
      /**
       * Set it to true if you want the stacked bars.
       * @prop {Boolean} [false] stacked
       */
      stacked: {
        type: Boolean,
        default: false
      },
      /**
       * The distance between the bars on the bar chart.
       * @prop {Number} barsDistance
       */
      barsDistance: {
        type: Number
      },
      /**
       * Set it to true if you want to see horizontal bars on the bar chart.
       * @prop {Boolean} [false] horizontalBars
       */
      horizontal: {
        type: Boolean,
        default: false
      },
			/**
			 * A colors list for personalization.
			 * @prop {String|Array} color
			 */
      color: {
        type: [String, Array],
        default(){
          return [
            bbn.var.colors.webblue,
            bbn.var.colors.turquoise,
            bbn.var.colors.orange,
            bbn.var.colors.red,
            bbn.var.colors.purple,
            bbn.var.colors.yellow,
            bbn.var.colors.pink,
            bbn.var.colors.brown,
            bbn.var.colors.grey,
            bbn.var.colors.navy,
            bbn.var.colors.olive,
            bbn.var.colors.pastelorange,
            bbn.var.colors.cyan,
            bbn.var.colors.green,
            bbn.var.colors.black,
            bbn.var.colors.white
          ]
        }
      },
      /**
       * Set it to false if you want to hide the labels on the chart.
       * @prop {Boolean} [true] labels
       */
      labels: {
        type: Boolean,
        default: true
      },
      /**
       * Set it to false if you want to hide the x-axis labels on the chart.
       * @prop {Boolean} [true] xLabels
       */
      xLabels: {
        type: Boolean,
        default: true
      },
      /**
       * Set it to false if you want to hide the y-axis labels on the chart.
       * @prop {Boolean} [true] xLabels
       */
      yLabels: {
        type: Boolean,
        default: true
      },
			/**
			 * The labela color.
			 * @prop {String} labelsColor
			 */
      labelsColor: {
        type: String
      },
			/**
			 * The x-axis labels color.
			 * @prop {String} xLabelsColor
			 */
      xLabelsColor: {
        type: String
      },
			/**
			 * The y-axis labels color.
			 * @prop {String} yLabelsColor
			 */
      yLabelsColor: {
        type: String
      },
      /**
       * Set a rotation angle for the x-axis.
       * @prop {Number} xLabelsRotate
       */
      xLabelsRotate: {
        type: Number
      },
      /**
       * Set a rotation angle for the y-axis.
       * @prop {Number} yLabelsRotate
       */
      yLabelsRotate: {
        type: Number
      },
      /**
       * A custom function for the labels value.
       * @prop {Function} labelsRender
       */
      labelsRender: {
        type: Function
      },
      /**
       * A custom function for the x-axis value.
       * @prop {Function} xLabelsRender
       */
      xLabelsRender: {
        type: Function
      },
      /**
       * A custom function for the y-axis value.
       * @prop {Function} yLabelsRender
       */
      yLabelsRender: {
        type: Function
      },
      /**
			 * X offset of the pie chart's labels.
			 * @prop {Number} [0] labelsOffsetX
			 */
      labelsOffsetX: {
        type: Number,
        default: 0
      },
      /**
			 * Y offset of the pie chart's labels.
			 * @prop {Number} [0] labelsOffsetY
			 */
      labelsOffsetY: {
        type: Number,
        default: 0
      },
      /**
       * X offset of the x-axis' labels.
       * @prop {Number} [0] xLabelsOffsetX
       */
      xLabelsOffsetX: {
        type: Number,
        default: 0
      },
      /**
       * Y offset of the x-axis' labels.
       * @prop {Number} [0] xLabelsOffsetY
       */
      xLabelsOffsetY: {
        type: Number,
        default: 0
      },
      /**
       * X offset of the y-axis' labels.
       * @prop {Number} [0] yLabelsOffsetX
       */
      yLabelsOffsetX: {
        type: Number,
        default: 0
      },
      /**
       * Y offset of the y-axis' labels.
       * @prop {Number} [0] yLabelsOffsetY
       */
      yLabelsOffsetY: {
        type: Number,
        default: 0
      },
			/**
			 * The background color for personalization.
			 * @prop {String} background
			 */
      background: {
        type: String
      },
			/**
			 * The max value limit.
			 * @prop {Number} [undefined] max
			 */
      max: {
        type: Number,
        default: undefined
      },
			/**
			 * The min value limit.
			 * @prop {Number} [undefined] min
			 */
      min: {
        type: Number,
        default: undefined
      },
			/**
			 * Set it to false if you want to hide the tooltip.
			 * @prop {Boolean} [true] tooltip
			 */
      tooltip: {
        type: Boolean,
        default: true
      },
      /**
       * Tooltip value customize.
       * @prop {Function} tooltipRender
       */
      tooltipRender: {
        type: Function
      },
      /**
       * Tooltip value customize.
       * @prop {Function} tooltipLegendRender
       */
      tooltipLegendRender: {
        type: Function
      },
      /**
       * X axis tooltip customize.
       * @prop {Function} xTooltipRender
       */
      xTooltipRender: {
        type: Function
      },
      /**
       * Y axis tooltip customize.
       * @prop {Function} yTooltipRender
       */
      yTooltipRender: {
        type: Function
      },
      /**
       * Z axis tooltip customize.
       * @prop {Function} zTooltipRender
       */
      zTooltipRender: {
        type: Function
      },
			/**
			 * The legend list.
			 * @prop {Boolean|Array} legend
			 */
      legend: {
        type: [Boolean, Array]
      },
			/**
			 * The legend position.
			 * You can use 'top', 'bottom', 'left' or a 'right'.
			 * @prop {String} ['bottom'] legendPosition
			 */
      legendPosition: {
			  type: String,
        default: 'bottom',
        validator: t => ['top', 'bottom', 'left', 'right'].includes(t)
      },
      /**
       * Legend customize.
       * @prop {Function} legendRender
       */
      legendRender: {
        type: Function
      },
      /**
       * Set it to true to see distributed series on the bar chart.
       * @prop {Boolean} [false] distributed
       */
      distributed: {
        type: Boolean,
        default: false
      },
      /**
       * Set it to true if you want to transform the values to currencies.
       * @prop {Boolean} [false] currency
       */
      currency: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Boolean|String} [false] xDate
       */
      xDate: {
        type: [Boolean, String],
        default: false
      },
      /**
       * The string used when the chart hasn't the data.
       * @prop {String} ['No Data'] nodata
       */
      nodata: {
        type: String,
        default: bbn._('No data')
      },
      /**
       * Set it to true if you want to see the odd values only.
       * @prop {Boolean} [false] odd
       */
			odd: {
        type: Boolean,
        default: false
      },
      /**
       * Set it to true if you want to see the even values only.
       * @prop {Boolean} [false] even
       */
      even: {
        type: Boolean,
        default: false
      },
      /**
       * Shows only interger on the y-axis labels.
       * @prop {Boolean} [false] onlyInteger
       */
      onlyInteger: {
        type: Boolean,
        default: false
      },
      /**
       * The number of ticks on the y-axis.
       * @prop {String|Number} ticksNumber
       */
      ticksNumber: {
        type: [String, Number]
      },
      /**
       * Display or note the toolbar/menu in the top right corner.
       * @prop {Boolean} [true] toolbar
       */
      toolbar: {
        type: Boolean,
        default: true
      },
      /**
       * Show the download menu / hamburger icon in the toolbar.
       * If you want to display a custom icon instead of hamburger icon, you can provide HTML string in this property.
       * @prop {Boolean|String} [false] toolbarDownload
       */
      toolbarDownload: {
        type: [Boolean, String],
        default: false
      },
      /**
       * Show the rectangle selection icon in the toolbar.
       * If you want to display a custom icon for selection, you can provide HTML string in this property.
       * @prop {Boolean|String} [true] toolbarSelection
       */
      toolbarSelection: {
        type: [Boolean, String],
        default: true
      },
      /**
       * Show the zoom icon which is used for zooming by dragging selection on the chart area.
       * If you want to display a custom icon for zoom, you can provide HTML string in this property.
       * @prop {Boolean|String} [true] toolbarZoom
       */
      toolbarZoom: {
        type: [Boolean, String],
        default: true
      },
      /**
       * Show the zoom-in icon which zooms in 50% from the visible chart area.
       * If you want to display a custom icon for zoom-in, you can provide HTML string in this property.
       * @prop {Boolean|String} [true] toolbarZoomin
       */
      toolbarZoomin: {
        type: [Boolean, String],
        default: true
      },
      /**
       * Show the zoom-out icon which zooms out 50% from the visible chart area.
       * If you want to display a custom icon for zoom-out, you can provide HTML string in this property.
       * @prop {Boolean|String} [true] toolbarZoomout
       */
      toolbarZoomout: {
        type: [Boolean, String],
        default: true
      },
      /**
       * Show the panning icon in the toolbar.
       * If you want to display a custom icon for span, you can provide HTML string in this property.
       * @prop {Boolean|String} [true] toolbarPan
       */
      toolbarPan: {
        type: [Boolean, String],
        default: true
      },
      /**
       * Reset the chart data to it’s initial state after zommin/zoomout/panning.
       * If you want to display a custom icon for reset, you can provide HTML string in this property.
       * @prop {Boolean|String} [true] toolbarReset
       */
      toolbarReset: {
        type: [Boolean, String],
        default: true
      },
      /**
       * Allows to add additional icon buttons in the toolbar.
       * In the below example, index should be used to place at a particular position in the toolbar.
       * [{
       *   icon: '<img src="/static/icons/chart-carpet.png" width="20">',
       *   index: 4,
       *   title: 'tooltip of the icon',
       *   class: 'custom-icon',
       *   click: function (chart, options, e) {
       *     console.log("clicked custom-icon")
       *   }
       * }]
       * @prop {Array} [[]] toolbarCustom
       */
      toolbarCustom: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
			 * Use this prop to give native widget's properties.
			 * @prop {Object} [{}] cfg
			 */
      cfg: {
        type: Object,
        default(){
          return {};
        }
      }
    },
    data(){
      return {
        /**
         * @data {Boolean} [false] container
         */
        container: false,
        /**
         * @data {Number} [0] containerHeight
         */
        containerHeight: 0,
        /**
         * @data {Number} [0] containerWidth
         */
        containerWidth: 0,
        /**
         * @data {Boolean} [false] ready
         */
        ready: false,
        /**
         * @data {Boolean} [false] isInit
         */
        isInit: false,
        /**
         * @data {Boolean} [false] widget
         */
        widget: false,
        /**
         * The random string
         * @data {String} ['random string'] id
         */
        id: bbn.fn.randomString()
      }
    },
    computed: {
      /**
       * This makes the widget's data from the source.
       * @computed data
       * @return {Array}
       */
      data(){
        let series = this.source.series,
            data = []
        if ( this.isLine || this.isBar || this.isArea ){
          if ( bbn.fn.isArray(series) && series.length ){
            if ( !bbn.fn.isArray(series[0]) ){
              data.push({
                data: this.even || this.odd ? bbn.fn.filter(series, (v, k) => {
                  k++;
                  return (this.even && (k % 2 === 0)) || (this.odd && (k % 2 > 0));
                }) : series
              })
            }
            else {
              bbn.fn.each(series, (s, i) => {
                if ( bbn.fn.isObject(s) ){

                }
                else {
                  data.push({
                    data: this.even || this.odd ? bbn.fn.filter(s, (v, k) => {
                      k++;
                      return (this.even && (k % 2 === 0)) || (this.odd && (k % 2 > 0));
                    }) : s,
                    name: this.legend && this.legend.length ? this.legend[i] : false
                  })
                }
              })
            }
          }
        }
        else if ( this.isPie || this.isDonut || this.isRadial ){
          data = this.even || this.odd ? bbn.fn.filter(this.source.series, (v, k) => {
            k++;
            return (this.even && (k % 2 === 0)) || (this.odd && (k % 2 > 0));
          }) : this.source.series
        }
        return data;
      },
      /**
       * This checks the chart's type is 'line'.
       * @computed isLine
       * @return {Boolean}
       */
      isLine(){
        return this.type === 'line';
      },
      /**
       * This checks the chart's type is 'bar'.
       * @computed isBar
       * @return {Boolean}
       */
      isBar(){
        return this.type === 'bar';
      },
      /**
       * This checks the chart's type is 'pie'.
       * @computed isPie
       * @return {Boolean}
       */
      isPie(){
        return (this.type === 'pie') && !this.donut;
      },
      /**
       * This checks the chart's type is 'donut'.
       * @computed isDonut
       * @return {Boolean}
       */
      isDonut(){
        return (this.type === 'donut') || ((this.type === 'pie') && !!this.donut);
      },
      /**
       * This checks the chart's type is 'area'.
       * @computed isArea
       * @return {Boolean}
       */
      isArea(){
        return this.type === 'area';
      },
      /**
       * This checks the chart's type is 'radial'.
       * @computed isRadial
       * @return {Boolean}
       */
      isRadial(){
        return this.type === 'radial';
      },
			/**
			 * Sets the color property to the correct form.
			 * @computed colors
			 * @return {Array}
			 */
			colors(){
        let colors = [];
				if ( typeof this.color === 'string' ){
					colors = [this.color];
				}
				if ( Array.isArray(this.color) ){
					colors = this.color;
        }
        return bbn.fn.map(colors, c => {
          if (
            (c.indexOf('#') !== 0) ||
            (c.toLowerCase().indexOf('rgb') !== 0)
          ){
            return bbn.fn.colorToHex(c);
          }
          return c;
        });
			},
      /**
       * Makes the base configuration object for the 'line' chart.
       * @computed lineCfg
       * @return {Object}
       */
      lineCfg(){
        let cfg = {};
        return this.isLine ? bbn.fn.extend(true, cfg, this.lineBarAreaCommon, this.lineAreaCommon) : {}
      },
      /**
       * Makes the base configuration object for the 'bar' chart.
       * @computed barCfg
       * @return {Object}
       */
      barCfg(){
        let cfg = {
          chart: {
            stacked: !!this.stacked
          },
          plotOptions: {
            bar: {
              horizontal: !!this.horizontal,
              distributed: this.distributed
            }
          }
        };
        if ( this.barsDistance ){
          cfg.stroke = {
            show: true,
            width: this.barsDistance,
            colors: ['transparent']
          };
        }
        return this.isBar ? bbn.fn.extend(true, cfg, this.lineBarAreaCommon) : {};
      },
      /**
       * Makes the base configuration object for the 'area' chart.
       * @computed areaCfg
       * @return {Object}
       */
      areaCfg(){
        let cfg = {}
        return this.isArea ? bbn.fn.extend(true, cfg, this.lineAreaCommon) : {}
      },
      /**
       * Makes the base configuration object for the 'line' and 'area' chart.
       * @computed lineAreaCommon
       * @return {Object}
       */
      lineAreaCommon(){
        let cfg = {
          markers: {
            size: this.points || 0
          },
          stroke: {
            curve: !!this.smooth ? 'smooth' : (!!this.step ? 'stepline' : 'straight')
          }
        };
        return this.isLine || this.isArea ? bbn.fn.extend(true, cfg, this.lineBarAreaCommon) : {}
      },
      /**
       * Makes a common configuration object for the 'line' and 'bar' charts.
       * @computed lineBarAreaCommon
       * @return {Object}
       */
      lineBarAreaCommon(){
        if ( this.isLine || this.isBar || this.isArea ){
          let cfg = {
            xaxis: {
              labels: {
                show: !!this.labels && !!this.xLabels && this.data.length,
                style: {
                  colors: this.xLabelsColor || (this.labelsColor || []),
                  cssClass: 'bbn-chart-xaxis-label'
                },
                offsetX: this.xLabelsOffsetX,
                offsetY: this.xLabelsOffsetY,
                showDuplicates: true
              },
              title: {
                text: this.xTitle,
                style: {
                  cssClass: 'bbn-chart-xaxis-title'
                }
              }
            },
            yaxis: {
              labels: {
                show: !!this.labels && !!this.xLabels && this.data.length,
                style: {
                  colors: this.yLabelsColor || (this.labelsColor || []),
                  cssClass: 'bbn-chart-yaxis-label'
                },
                offsetX: this.yLabelsOffsetX,
                offsetY: this.yLabelsOffsetY
              },
              title: {
                text: this.yTitle,
                style: {
                  cssClass: 'bbn-chart-yaxis-title'
                }
              },
              min: this.min,
              max: this.max
            },
            grid: {
              show: !!this.grid && (!!this.xGrid || !!this.yGrid),
              xaxis: {
                lines: {
                  show: !!this.xGrid
                }
              },
              yaxis: {
                lines: {
                  show: !!this.yGrid
                }
              }
            }
          }
          if ( this.xDate ){
            cfg.xaxis.type = 'datetime';
            if ( bbn.fn.isString(this.xDate) ){
              cfg.xaxis.labels.formatter = (value, timestamp, index) => {
                return dayjs(timestamp).format(this.xDate);
              }
            }
          }
          if ( this.onlyInteger ){
            cfg.yaxis.decimalsInFloat = 3;
          }
          if ( this.ticksNumber ){
            cfg.yaxis.tickAmount = parseInt(this.ticksNumber);
          }
          if ( this.gridColor ){
            cfg.grid.borderColor = this.gridColor;
          }
          if ( this.gridBackground ){
            cfg.grid.row = {
              colors: [this.gridBackground]
            };
          }
          if ( this.currency ){
            cfg.dataLabels = {
              formatter: (val, opts) => {
                return bbn.fn.money(val);
              }
            };
            if ( this.tooltip ){
              cfg.tooltip = {
                y: {
                  formatter: val => {
                    return bbn.fn.money(val);
                  }
                }
              };
            }
          }
          if ( this.xLabelsRotate ){
            cfg.xaxis.labels.rotate = this.xLabelsRotate;
            cfg.xaxis.labels.rotateAlways = true;
          }
          if ( this.yLabelsRotate ){
            cfg.yaxis.labels.rotate = this.yLabelsRotate;
          }
          if ( this.labelsRender || this.xLabelsRender ){
            cfg.xaxis.labels.formatter = this.xLabelsRender || this.labelsRender;
          }
          if ( this.labelsRender || this.yLabelsRender ){
            cfg.yaxis.labels.formatter = this.yLabelsRender || this.labelsRender;
          }
          if ( Object.keys(this.xAxis).length ){
            bbn.fn.extend(true, cfg.xaxis, this.xAxis);
          }
          if ( Object.keys(this.yAxis).length ){
            bbn.fn.extend(true, cfg.yaxis, this.yAxis);
          }
          return cfg;
        }
        return {};
      },
      /**
       * Makes the base configuration object for the 'pie' chart.
       * @computed pieCfg
       * @return {Object}
       */
      pieCfg(){
        let cfg = {}
        return this.isPie ? bbn.fn.extend(true, cfg, this.pieDonutCommonCfg) : {}
      },
      /**
       * Makes the base configuration object for the 'donut' chart.
       * @computed donutCfg
       * @return {Object}
       */
      donutCfg(){
        let cfg = {
          chart: {
            type: 'donut'
          }
        }
        if ( bbn.fn.isNumber(this.donut) ){
          cfg.plotOptions = {
            pie: {
              donut: {
                size: this.donut + '%'
              }
            }
          }
        }
        return this.isDonut ? bbn.fn.extend(true, cfg, this.pieDonutCommonCfg) : {}
      },
      /**
       * Makes a common configuration object for the 'pie' and 'donut' charts.
       * @computed pieDonutCommonCfg
       * @return {Object}
       */
      pieDonutCommonCfg(){
        if ( this.container && (this.isPie || this.isDonut) ){
          let cfg = {
            legend: {
              show: !!this.legend
            },
            dataLabels: {
              enabled: !!this.labels && this.data.length
            }
          };
          if ( this.labelsColor ){
            cfg.dataLabels.style = {
              colors: [this.labelsColor]
            };
          }
          if ( this.currency ){
            cfg.dataLabels.formatter = (val, opts) => {
              return bbn.fn.money(opts.w.config.series[opts.seriesIndex]);
            };
            if ( this.tooltip ){
              cfg.tooltip = {
                y: {
                  formatter: val => {
                    return bbn.fn.money(val);
                  }
                }
              };
            }
          }
          if ( this.labelsRender ){
            cfg.dataLabels.formatter = this.labelsRender;
            /* if ( this.tooltip ){
              cfg.tooltip = {
                y: {
                  formatter: this.labelsRender
                }
              };
            } */
          }
          if ( this.labelsOffsetX ){
            cfg.dataLabels.offsetX = this.labelsOffsetX;
          }
          if ( this.labelsOffsetY ){
            cfg.dataLabels.offsetY = this.labelsOffsetY;
          }
          if (
            this.containerHeight &&
            this.containerWidth &&
            (this.width === '100%') &&
            (this.height === '100%')
          ){
            cfg.chart = {};
            if ( this.containerWidth < this.containerHeight ){
              cfg.chart.width = this.containerWidth;
              //cfg.chart.height ='100%';
              cfg.chart.height = this.containerWidth;
            }
            else {
              cfg.chart.width = '100%';
              //cfg.chart.width = this.containerHeight;
              cfg.chart.height = this.containerHeight;
            }
          }
          return cfg;
        }
        return {};
      },
      /**
       * Makes the base configuration object for the 'pie' chart.
       * @computed radialCfg
       * @fires isRadial
       * @return {Object}
       */
      radialCfg(){
        let cfg = {
          chart: {
            type: 'radialBar'
          },
          plotOptions: {
            radialBar: {
              dataLabels: {
                total: {
                  show: true,
                  label: bbn._('TOTAL')
                }
              }
            }
          }
        }
        return this.isRadial ? cfg : {}
      },
      /**
       * Makes the configuration object for the widget.
       * @computed widgetCfg
       * @fires getLabels
       * @return {Object}
       */
      widgetCfg(){

        let cfg = {
          chart: {
            id: this.id,
            type: this.type,
            height: this.height,
            width: this.width,
            animations: {
              enabled: !!this.animation,
              speed: bbn.fn.isNumber ? this.animation : 800,
              easing: 'easeinout',
              animateGradually: {
                enabled: true,
                delay: 250
              },
              dynamicAnimation: {
                enabled: true,
                speed: 350
              }
            },
            toolbar: {
              show: this.toolbar,
              tools: {
                download: this.toolbarDownload,
                selection: this.toolbarSelection,
                zoom: this.toolbarZoom,
                zoomin: this.toolbarZoomin,
                zoomout: this.toolbarZoomout,
                pan: this.toolbarPan,
                reset: this.toolbarReset,
                customIcons: this.toolbarCustom
              }
            },
            defaultLocale: 'en',
            locales: [{
              name: 'en',
              options: {
                months: [
                  bbn._('January'),
                  bbn._('February'),
                  bbn._('March'),
                  bbn._('April'),
                  bbn._('May'),
                  bbn._('June'),
                  bbn._('July'),
                  bbn._('August'),
                  bbn._('September'),
                  bbn._('October'),
                  bbn._('November'),
                  bbn._('December')
                ],
                shortMonths: [
                  bbn._('Jan'),
                  bbn._('Feb'),
                  bbn._('Mar'),
                  bbn._('Apr'),
                  bbn._('May'),
                  bbn._('Jun'),
                  bbn._('Jul'),
                  bbn._('Aug'),
                  bbn._('Sep'),
                  bbn._('Oct'),
                  bbn._('Nov'),
                  bbn._('Dec')
                ],
                days: [
                  bbn._('Sunday'),
                  bbn._('Monday'),
                  bbn._('Tuesday'),
                  bbn._('Wednesday'),
                  bbn._('Thursday'),
                  bbn._('Friday'),
                  bbn._('Saturday')
                ],
                shortDays: [
                  bbn._('Sun'),
                  bbn._('Mon'),
                  bbn._('Tue'),
                  bbn._('Wed'),
                  bbn._('Thu'),
                  bbn._('Fri'),
                  bbn._('Sat')
                ],
                toolbar: {
                  download: bbn._('Download SVG'),
                  selection: bbn._('Selection'),
                  selectionZoom: bbn._('Selection Zoom'),
                  zoomIn: bbn._('Zoom In'),
                  zoomOut: bbn._('Zoom Out'),
                  pan: bbn._('Panning'),
                  reset: bbn._('Reset Zoom')
                }
              }
            }],
            events: {
              click: (event, chartContext, config) => {
                this.$emit('click', event, chartContext, config);
              }
            }
          },
          series: this.data,
          labels: this.getLabels(),
          legend: {
            show: this.legend && this.legend.length,
            position: this.legendPosition,
            itemMargin: {
              horizontal: 5,
              vertical: 5
            },
            formatter: this.legendRender || undefined
          },
          dataLabels: {
            enabled: !!this.pointsLabels
          },
          tooltip: {
            enabled: !!this.tooltip,
            x: {
              formatter: this.xTooltipRender || undefined
            },
            y: {
              formatter: this.yTooltipRender || this.tooltipRender || undefined,
              title: {
                formatter: this.tooltipLegendRender || undefined
              }
            },
            z: {
              formatter: this.zTooltipRender || undefined
            }
          },
          colors: this.colors.length ? this.colors : undefined,
          fill: {
            type: this.fill,
            opacity: this.opacity
          },
          theme: {
            mode: this.theme
          },
          noData: {
            text: this.nodata
          }
        }
        if ( this.background ){
          cfg.chart.background = this.background;
        }
        if ( this.opacity && (this.fill === 'gradient') ){
          cfg.fill.gradient = {
            shadeIntensity: 1,
            opacityFrom: this.opacity,
            opacityTo: 1
          };
        }
        if ( this.legendPosition === 'bottom' ){
          cfg.legend.offsetY = -5;
        }
        if ( this.isLine ){
          bbn.fn.extend(true, cfg, this.lineCfg, this.cfg)
        }
        else if ( this.isBar ){
          bbn.fn.extend(true, cfg, this.barCfg, this.cfg)
        }
        else if ( this.isPie ){
          bbn.fn.extend(true, cfg, this.pieCfg, this.cfg)
        }
        else if ( this.isDonut ){
          bbn.fn.extend(true, cfg, this.donutCfg, this.cfg)
        }
        else if ( this.isRadial ){
          bbn.fn.extend(true, cfg, this.radialCfg, this.cfg)
        }
        else if ( this.isArea ){
          bbn.fn.extend(true, cfg, this.areaCfg, this.cfg)
        }
        return cfg
      }
    },
    methods: {
      /**
       * Destroys the current widget if it exists and fires the chart type constructor.
       * @method init
       * @param {Boolean} emptyData
       * @fires destroy
       * @fires setSize
       * @fires getRef
       */
      init(emptyData){
        this.destroy();
        this.setSizes();
        this.$nextTick(() => {
          if ( !this.widget ){
            let cfg = bbn.fn.extend(true, {}, this.widgetCfg);
            if ( emptyData ){
              cfg.series = [];
              cfg.labels = [];
            }
            this.widget = new ApexCharts(this.getRef('chart'), cfg)
            this.widget.render();
            this.isInit = true;
          }
        })
      },
      /**
       * Destroys the component chart.
       *
       * @method destroy
       */
      destroy(){
        if ( this.widget && this.ready ){
          this.widget.destroy();
          this.widget = false;
        }
      },
      /**
       * Set the dimensions, in height and width.
       *
       * @method setSizes
       */
      setSizes(){
        this.containerHeight = this.container.offsetHeight;
        this.containerWidth = this.container.offsetWidth;
      },
      /**
       * Re-adjust the dimensions, in height and width.
       *
       * @method onResize
       * @fires setSizes
       */
      onResize(){
        if ( this.ready ){
          this.$nextTick(() =>{
            this.setSizes();
            if ( this.widget ){
              //this.updateWidget();
            }
          })
        }
      },
      /**
       * Update chart.
       *
       * @method updateWidget
       * @param {Object} cfg
       */
      updateWidget(cfg){
        if ( this.widget && this.ready ){
          this.widget.updateOptions(bbn.fn.extend(true, {}, cfg || this.widgetCfg), !!this.isBar, !!this.animation);
        }
      },
      /**
       * Return list labels.
       *
       * @method getLabels
       * @return {Array}
       */
      getLabels(){
        return this.data && this.data.length ? (this.source.labels ? (this.even || this.odd ? bbn.fn.filter(this.source.labels, (v, k) => {
          k++;
          return (this.even && (k % 2 === 0)) || (this.odd && (k % 2 > 0));
        }) : this.source.labels) : []) : []
      }
    },
    watch: {
      /**
       * @watch ready
       * @fires init
       */
      ready(newVal){
        this.$nextTick(() => {
          if ( newVal ){
            this.init();
          }
        });
      },
      /**
       * @watch widgetCfg
       * @fires init
       * @fires updateWidget
       */
      widgetCfg: {
        deep: true,
        handler(newVal, oldVal){
          if ( this.ready && this.isInit ){
            if ( newVal.chart.type !== oldVal.chart.type ){
              this.isInit = false;
              this.init(true);
            }
            else {
              this.updateWidget();
            }
          }
        }
      }
    },
    /**
     * @event mounted
     * @fires init
     * @fires getRef
     */
    mounted(){
      this.container = this.getRef('container');
      this.$nextTick(() => {
        this.ready = true;
      })
    }
  };
