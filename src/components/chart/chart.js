/**
 * @file bbn-chart component
 *
 * @description bbn-chart component is a visual representation of data from the extreme implementation.
 * It allows large amounts of information to be condensed into an easy to understand visual format, allowing complex data to be displayed, interpreted and analyzed with detailed customization using one of these graphs: "bar", "pie", "line" and "donut".
 *
 * @author Mirko Argentino
 *
 * @copyright BBN Solutions
 *
 * @created 24/05/2017
 */

(($, bbn) => {
  "use strict";

  Vue.component('bbn-chart', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.optionComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.optionComponent],
    props: {
      /**
       * The component's data.
       *
       * @prop {Object} source
       */
      source: {
        type: Object
      },
      /**
       * The type of chart.
       *
       * @prop {String} [line] type
       */
      type: {
        type: String,
        default: 'line'
      },
      /**
       * The title of the chart.
       *
       * @prop {String} title
       */
			title: {
        type: String
      },
      /**
       * The x-axis title.
       *
       * @prop {String} titleX.
       */
      titleX: {
			  type: String
      },
      /**
       * The y-axis title.
       *
       * @prop {String} titleY
       */
      titleY: {
			  type: String
      },
      /**
      * The width of the chart.
      *
      * @prop {String} [100%] width.
      */
      width: {
        type: String,
        default: '100%'
      },
      /**
       * The height of the chart.
       *
       * @prop {String} [100%] height.
       */
      height: {
        type: String,
        default: '100%'
      },
      /**
       * Set to true shows the value points on the line chart.
       *
       * @prop {Boolean} [true] showPoint
       */
      showPoint: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true shows the grid line on the chart.
       *
       * @prop {Boolean} [true] showLine
       */
      showLine: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true shows a smooth line on the line chart.
       *
       * @prop {Boolean} [false] lineSmooth
       */
      lineSmooth: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to create a donut pie chart. If you give an integer it will be used as the donut width.
       *
       * @prop {Boolean|Number} [false] donut
       */
      donut: {
        type: [Boolean, Number],
        default: false
      },
      /**
       * Set it to false if you do not want the drawing of the chart to take the full width available.
       *
       * @prop {Boolean} [true] fullWidth
       */
      fullWidth: {
        type: Boolean,
        default: true
      },
      /**
       * Set it to true if you want to see the area on the line chart.
       *
       * @prop {Boolean} [false] showArea
       */
      showArea: {
        type: Boolean,
        default: false
      },
      /**
       * Area's opacity adjustment
       *
       * @prop {Number|String} [0.1] areaOpacity
      */
      areaOpacity: {
        type: [Number, String],
        default: '0.1'
      },
      /**
       * Set it to true if you want to see the labels on the pie chart.
       *
       * @prop {Boolean} [true] showLabel
       */
      showLabel: {
        type: Boolean,
        default: true
      },
      /**
       * X-axis configuration object.
       *
       * @prop {Object} [{}] axisX
       */
      axisX: {
        type: Object,
        default(){
          return {};
        }
      },
      /**
       * Y-axis configuration object.
       *
       * @prop {Object} [{}] axisY
       */
      axisY: {
        type: Object,
        default(){
          return {};
        }
      },
      /**
       * Set it to true if you want to see the x-axis labels on the line and bar charts.
       * You can give a function to customize these labels.
       *
       * @prop {Boolean|Function} [true] showLabelX
       */
      showLabelX: {
        type: [Boolean, Function],
        default: true
      },
      /**
       * Set it to true if you want to see the x-axis labels in the reverse order on the line and bar charts.
       *
       * @prop {Boolean} [false] reverseLabelX
       */
      reverseLabelX: {
        type: Boolean,
        default: false
      },
      /**
       * Set it to true if you want to see the odd values only.
       *
       * @prop {Boolean} [false] odd
       */
			odd: {
        type: Boolean,
        default: false
      },
      /**
       * Set it to true if you want to see the even values only.
       *
       * @prop {Boolean} [false] even
       */
      even: {
        type: Boolean,
        default: false
      },
      /**
       * Set it to true if you want to see the grid for the x-axis on the line and bar charts.
       *
       * @prop {Boolean} [true] showGridX
       */
      showGridX: {
        type: Boolean,
        default: true
      },
      /**
       * Set it to true if you want to see the y-axis labels on the line and bar charts.
       * You can give a function to customize these labels.
       *
       * @prop {Boolean|Function} [true] showLabelY
       */
      showLabelY: {
        type: [Boolean, Function],
        default: true
      },
      /**
       * Set it to true if you want to see the y-axis labels in the reverse order on the line and bar charts.
       *
       * @prop {Boolean} [false] reverseLabelY
       */
      reverseLabelY: {
        type: Boolean,
        default: false
      },
      /**
      * Set it to true if you want to see the grid for the y-axis on the line and bar charts.
      *
      * @prop {Boolean} [true] showGridY
      */
      showGridY: {
        type: Boolean,
        default: true
      },
      /**
       * Set it to true if you want to enable the animations.
       * If you give a number it will be used as the time (ms) for the animations.
       *
       * @prop {Boolean|Number} [false] animation
       */
      animation: {
        type: [Boolean, Number],
        default: false
      },
      // set it to 0 (zero) for stacked bars
      /**
       * The distance between the bars on the bar chart. You can set it to 0 for stacked bars.
       *
       * @prop {Number} barsDistance
       */
      barsDistance: {
        type: Number,
        default: undefined
      },
      /**
       * Set it to true if you want to see horizontal bars on the bar chart.
       *
       * @prop {Boolean} [false] horizontalBars
       */
      horizontalBars: {
        type: Boolean,
        default: false
      },
	  /**
	   * Set it to true if you want to reverse the data order.
	   * @prop {Boolean} [false] reverseData
	   */
      reverseData: {
        type: Boolean,
				default: false
      },
			/**
			 * A color list for personalization.
			 *
			 * @prop {String|Array} color
			 */
      color: {
        type: [String, Array]
      },
			/**
			 * The label color for personalization.
			 *
			 * @prop {String} labelColor
			 */
      labelColor: {
        type: String
      },
			/**
			 * The x-axis label color for personalization.
			 *
			 * @prop {String} labelColorX
			 */
      labelColorX: {
        type: String
      },
			/**
			 * The y-axis label color for personalization.
			 *
			 * @prop {String} labelColorY
			 */
      labelColorY: {
        type: String
      },
			/**
			 * The background color for personalization.
			 *
			 * @prop {String} [inherit] backgroundColor
			 */
      backgroundColor: {
        type: String,
        default: 'inherit'
      },
			/**
			 * The grid color for personalization.
			 *
			 * @prop {String} gridColor
			 */
      gridColor: {
        type: String
      },
			/**
			 * The max value limit.
			 *
			 * @prop {Number} [undefined] max
			 */
      max: {
        type: Number,
        default: undefined
      },
			/**
			 * The min value limit.
			 *
			 * @prop {Number} [undefined] min
			 */
      min: {
        type: Number,
        default: undefined
      },
			/**
			 * Numbers only on y-axis.
			 *
			 * @prop {Boolean} [false] onlyInteger
			 */
      onlyInteger: {
        type: Boolean,
        default: false
      },
			/**
			 * Set it to false if you do not want to activate the tooltip plugin.
			 * You can customize tooltips by passing a function.
			 *
			 * @prop {Boolean|Function} [true] tooltip
			 */
      tooltip: {
        type: [Boolean, Function],
        default: true
      },
			/**
			 * Set it to true if you want to enable the plugin.
			 *
			 * @prop {Boolean} [false] pointLabel
			 */
      pointLabel: {
        type: Boolean,
        default: false
      },
			/**
			 * The legend list.
			 *
			 * @prop {Boolean|Array} legend
			 */
      legend: {
        type: [Boolean, Array]
      },
			/**
			 * The legend position.
			 * You can use 'top', 'bottom' or a HTMLElement.
			 *
			 * @prop {String|HTMLElement} [undefined] legendPosition
			 */
      legendPosition: {
			  type: [String, HTMLElement],
        default: undefined
      },
      /*threshold: {
        type: Number
      },*/
			/**
			 * Set it to true to see a square line on the line chart.
			 *
			 * @prop {Boolean} [false] step
			 */
      step: {
        type: Boolean,
        default: false
      },
			/**
			 * Date format personalization.
			 *
			 * @prop {String} dateFormat
			 */
      dateFormat: {
        type: String
      },
			/**
			 * Label offset on the pie chart.
			 *
			 * @prop {Number} [0] labelOffset
			 */
      labelOffset: {
        type: Number,
        default: 0
      },
			/**
			 * Set it to true if you want to see the labels outside of pie chart.
			 *
			 * @prop {Boolean} [false] labelExternal
			 */
      labelExternal: {
        type: Boolean,
        default: false
      },
			/**
			 * Set it to true if you want to wrap the labels on the pie chart.
			 * You can also give the number of characters for the wrap.
			 *
			 * @prop {Boolean|Number} [false] labelWrap
			 */
      labelWrap: {
        type: [Boolean, Number],
        default: false
      },
			/**
			 * The chart's padding.
			 *
			 * @prop {Number} [undefined] padding
			 */
      padding: {
        type: Number,
        default: undefined
      },
			/**
			 * The top chart's padding.
			 *
			 * @prop {Number} [undefined] paddingTop
			 */
      paddingTop: {
        type: Number,
        default: undefined
      },
			/**
			 * The right chart's padding.
			 *
			 * @prop {Number} [undefined] paddingRight
			 */
      paddingRight: {
        type: Number,
        default: undefined
      },
			/**
			 * The bottom chart's padding.
			 *
			 * @prop {Number} [undefined] paddingBottom
			 */
      paddingBottom: {
        type: Number,
        default: undefined
      },
			/**
			 * The left chart's padding.
			 *
			 * @prop {Number} [undefined] paddingLeft
			 */
      paddingLeft: {
        type: Number,
        default: undefined
      },
      /**
       * Give a currency string to use on the tooltip plugin.
       *
       * @prop {String} currency
       * @todo add this to labels
       */
      currency: {
        type: String
      },
      /**
       * Set it to true to see distributed series on the bar chart.
       *
       * @prop {Boolean} distributeSeries
       */
      distributeSeries: {
        type: Boolean
      },
      /*zoom: {
        type: Boolean
      },*/
			/**
			 * Use this prop to give native widget's properties.
			 *
			 * @prop {Object} [{}] cfg
			 */
      cfg: {
        type: Object,
        default(){
          return {};
        }
      }
    },
    computed: {
      /**
       * This makes the widget's data from the source.
       *
       * @computed data
       * @return {Object}
       */
      data(){
        let data = this.source;
        if ( this.isLine || this.isBar ){
          if ( data && data.series && !Array.isArray(data.series[0]) && !this.distributeSeries ){
            data.series = [data.series];
          }
        }
        return data;
      },
      /**
       * This checks the chart's type is 'line'.
       *
       * @computed isLine
       * @return {Boolean}
       */
      isLine(){
        return this.type === 'line';
      },
      /**
       * This checks the chart's type is 'bar'.
       *
       * @computed isBar
       * @return {Boolean}
       */
      isBar(){
        return this.type === 'bar';
      },
      /**
       * This checks the chart's type is 'pie'.
       *
       * @computed isPie
       * @return {Boolean}
       */
      isPie(){
        return this.type === 'pie';
      },
      /**
       * This makes an array of activated plugins.
       *
       * @computed plugins
       * @return {Array}
       */
      plugins(){
        let plugins = [];
        // tooltip
        if ( this.tooltip ){
          plugins.push(Chartist.plugins.tooltip({
            currency: this.currency || false,
            transformTooltipTextFnc:bbn.fn.isFunction(this.tooltip) ? this.tooltip : undefined
          }));
        }
        // axis X/Y title
        if ( !this.isPie && (this.titleX || this.titleY) ){
          plugins.push(Chartist.plugins.ctAxisTitle({
            axisX: {
              axisTitle: this.titleX || '',
              axisClass: 'ct-axis-title',
              offset: {
                x: 0,
                y: 50
              },
              textAnchor: 'middle'
            },
            axisY: {
              axisTitle: this.titleY || '',
              axisClass: 'ct-axis-title',
              offset: {
                x: 0,
                y: 0
              },
              textAnchor: 'middle',
              flipTitle: false
            }
          }));
        }
        // Point Label
        if ( this.pointLabel ){
          plugins.push(Chartist.plugins.ctPointLabels());
        }
        // Legend
        if ( this.legend ){
          plugins.push(Chartist.plugins.legend({
            onClick(a, b){
              const $rect = $("div.rect", b.target);
              if ( $rect.hasClass('inactive') ){
                $rect.removeClass('inactive');
              }
              else {
                $rect.addClass('inactive');
              }
            },
            removeAll: true,
            legendNames: Array.isArray(this.legendFixed) ? this.legendFixed : false,
            position: this.legendPosition || 'top'
          }));
        }
        // Thresold
        /** @todo  it's not compatible with our colors system and legend */
        /*if ( (this.isLine || this.isBar) && (typeof this.threshold === 'number') ){
          plugins.push(Chartist.plugins.ctThreshold({
            threshold: this.threshold
          }));
        }*/
        // Zoom
        /** @todo problems with scale x axis */
        /*if ( this.zoom && this.isLine ){
          this.trasformData();
          this.axisX.type =  Chartist.AutoScaleAxis;
          this.axisX.divisor = this.getLabelsLength();
          this.axisY.type =  Chartist.AutoScaleAxis;
          plugins.push(Chartist.plugins.zoom({
            onZoom(chart, reset) {
              this.resetZoom = reset;
            }
          }));
        }*/
        return plugins;
      },
			/**
			 * Sets the color property to the correct form.
			 *
			 * @computed colors
			 * @return {Array|Boolean}
			 */
			colors(){
				if ( typeof this.color === 'string' ){
					return [this.color];
				}
				if ( Array.isArray(this.color) ){
					return this.color;
				}
				return false;
			},
      /**
       * Makes a correct legend list.
       *
       * @computed legendFixed
       * @return {Boolean|Array}
       */
      legendFixed(){
        if ( Array.isArray(this.legend) && (typeof this.legend[0] === 'object') ){
          return $.map(this.legend, (l) => {
            return l.text || null;
          });
        }
        else {
          return this.legend;
        }
      },
      /**
       * Makes a correct legend list with title as the text.
       *
       * @computed legendTitles
       * @return {Boolean|Array}
       */
      legendTitles(){
        if ( Array.isArray(this.legend) && (typeof this.legend[0] === 'object') ){
          return $.map(this.legend, (l, i) => {
            return l.title || (l.text || null) ;
          });
        }
        else {
          return this.legend;
        }
      },
      /**
       * Makes the base configuration object for the 'line' chart.
       *
       * @computed lineCfg
       * @return {Object}
       */
      lineCfg(){
        let cfg = {
          lineSmooth: this.step && this.showLine ? Chartist.Interpolation.step() : this.lineSmooth,
          showPoint: this.showPoint,
          showLine: this.showLine,
          pointLabel: this.pointLabel,
          showArea: this.showArea
        };
        return this.isLine ? bbn.fn.extend(true, cfg, this.lineBarCommon) : {};
      },
      /**
       * Makes the base configuration object for the 'bar' chart.
       *
       * @computed barCfg
       * @return {Object}
       */
      barCfg(){
        let cfg = {
          seriesBarDistance: this.barsDistance && (this.barsDistance > 0) ? this.barsDistance : undefined,
          stackBars: this.barsDistance === 0,
          horizontalBars: this.horizontalBars
        };
        return this.isBar ? bbn.fn.extend(true, cfg, this.lineBarCommon) : {};
      },
      /**
       * Makes a common configuration object for the 'line' and 'bar' charts.
       *
       * @computed lineBarCommon
       * @return {Object}
       */
      lineBarCommon(){
        if ( this.isLine || this.isBar ){
          let cfg = {
            chartPadding: {
              top: this.paddingTop || this.padding,
              right: this.paddingRight || this.padding,
              bottom: this.paddingBottom || this.padding,
              left: this.paddingLeft || this.padding
            },
            axisX: bbn.fn.extend(true, {
              showLabel:bbn.fn.isFunction(this.showLabelX) ? true : this.showLabelX,
              showGrid: this.showGridX,
              position: this.reverseLabelX ? 'start' : 'end'
            }, this.axisX),
            axisY: bbn.fn.extend(true, {
              showLabel:bbn.fn.isFunction(this.showLabelY) ? true : this.showLabelY,
              showGrid: this.showGridY,
              position: this.reverseLabelY ? 'end' : 'start',
              onlyInteger: this.onlyInteger,
              high: this.max,
              low: this.min ? -this.min : undefined
            }, this.axisY)
          };
          // Axis X
          // Date format
          if ( this.dateFormat ){
            cfg.axisX.labelInterpolationFnc = (date, idx) => {
              if ( this.odd ){
                return idx % 2 > 0 ? moment(new Date(date)).format(this.dateFormat) : null;
              }
              if ( this.even ){
                return idx % 2 === 0 ? moment(new Date(date)).format(this.dateFormat) : null;
              }
              return moment(new Date(date)).format(this.dateFormat);
            };
          }
          // Odd labels
          if ( this.odd && !this.even && !this.dateFormat ){
            cfg.axisX.labelInterpolationFnc = (val, idx) => {
              return idx % 2 > 0 ? val : null;
            };
          }
          // Even labels
          if ( this.even && !this.odd && !this.dateFormat ){
            cfg.axisX.labelInterpolationFnc = function(val, idx){
              return idx % 2 === 0 ? val : null;
            };
          }
          // Custom axisX label
          if (bbn.fn.isFunction(this.showLabelX) ){
            cfg.axisX.labelInterpolationFnc = this.showLabelX;
          }
          // Custom axisY label
          if (bbn.fn.isFunction(this.showLabelY) ){
            cfg.axisY.labelInterpolationFnc = this.showLabelY;
            cfg.axisY.offset = 100;
          }
          return cfg;
        }
        return {};
      },
      /**
       * Makes the base configuration object for the 'pie' chart.
       *
       * @computed pieCfg
       * @return {Object}
       */
      pieCfg(){
        let cfg = {
              donut: !!this.donut,
              chartPadding: this.padding,
              showLabel: this.showLabel,
              labelDirection: this.labelExternal ? 'explode' : 'neutral',
              labelOffset: this.labelOffset,
              labelInterpolationFnc: (value) => {
                if ( this.labelWrap ){
                  let ret = '',
                      labelWrap = typeof this.labelWrap === 'number' ? this.labelWrap : 25,
                      tmp,
                      cont = 0,
                      arr,
                      spl = (text) => {
                        let r = '',
                            idx = labelWrap;
                        if ( text.length <= labelWrap ){
                          return text;
                        }
                        for ( let i = labelWrap; i < text.length; i += labelWrap ){
                          if ( i === labelWrap ){
                            r += text.slice(0, i) + "\n"
                          }
                          r += text.slice(idx, i) + "\n";
                          idx = i;
                        }
                        return r + text.slice(idx);
                      };
                  if ( typeof value === 'number' ){
                    value = value.toString();
                  }
                  if ( value.length <= labelWrap ){
                    return value;
                  }
                  if ( value.indexOf('\n') !== -1 ){
                    arr = value.split('\n');
                    arr.forEach((a, i) => {
                      ret += spl(a) + (arr[i+1] ? '\n' : '');
                    });
                    return ret;
                  }
                  return spl(value);
                }
                else {
                  return value;
                }
              }
            };
        if ( typeof this.donut === 'number' ){
          cfg.donutWidth = this.donut;
        }
        else if ( this.donut ){
          cfg.donutWidth = '100%';
        }
        // Force donut if animation is active
        if ( this.animation ){
          cfg.donut = true;
          cfg.donutWidth = '100%';
        }
        return this.isPie ? cfg : {};
      },
      /**
       * Makes the configuration object for the widget.
       *
       * @computed widgetCfg
       * @return {Object}
       */
      widgetCfg(){
        let cfg = bbn.fn.extend(true, {
          type: this.type,
          fullWidth: this.fullWidth,
          width: this.width,
          height: this.height,
          tooltip: this.tooltip,
          plugins: this.plugins
        }, this.cfg);
        if ( this.isLine ){
          bbn.fn.extend(true, cfg, this.lineCfg);
        }
        if ( this.isBar ){
          bbn.fn.extend(true, cfg, this.barCfg);
        }
        if ( this.isPie ){
          bbn.fn.extend(true, cfg, this.pieCfg);
        }
        return cfg;
      }
    },
    methods: {
      /**
       * Destroys the current widget if it exists and fires the chart type constructor.
       *
       * @method init
       * @fires pieChart
       * @fires barChart
       * @fires lineChart
       * @fires widgetCreated
       */
      init(){
        if ( this.widget ){
          this.widget.detach();
          this.widget = false;
        }
        if ( this.data ){
          setTimeout(() => {
            // Widget configuration
            if ( this.isPie ){
              this.pieChart();
            }
            else if ( this.isBar ){
              this.barChart();
            }
            else if ( this.isLine ){
              this.lineChart();
            }
            // This operations is performed after widget creation
            this.widgetCreated();
          }, 100);
        }
      },
      /**
       * Creates a Pie Chart.
       *
       * @method pieChart
       * @fires pieDraw
       */
      pieChart(){
        // Create widget
        this.widget = new Chartist.Pie(this.$refs.chart, this.data, this.widgetCfg);
        this.pieDraw();
      },
      /**
       * Creates a Line Chart.
       *
       * @method lineChart
       * @fires lineDraw
       */
      lineChart(){
        // Creates widget
        this.widget = new Chartist.Line(this.$refs.chart, this.data, this.widgetCfg);
        this.lineDraw();
      },
      /**
       * Creates a Bar Chart.
       *
       * @method barChart
       * @fires barDraw
       */
      barChart(){
        // Creates widget
        this.widget = new Chartist.Bar(this.$refs.chart, this.data, this.widgetCfg);
        this.barDraw();
      },
      /**
       * Sets animations and colors whilst drawing the line chart.
       *
       * @method lineDraw
       * @fires setGridColor
       * @fires setColor
       */
      lineDraw(){
        let seq = 0,
            color = '';
        // Once the chart is fully created we reset the sequence
        this.widget.on('created', () => {
          seq = 0;
        });
        this.widget.on('draw', (chartData) => {
          // Set grid color
          this.setGridColor(chartData);

          // Customize color
          this.setColor(chartData);

          // Custom area's opacity
          if ( this.showArea ){
            this.setAreaOpacity(chartData);
          }

          // Customize label color
          if ( (chartData.type === 'label') ){
            if ( this.labelColor ){
              color = this.labelColor;
            }
            if ( this.labelColorX && (chartData.axis.units.pos === 'x') ){
              color = this.labelColorX;
            }
            else if ( this.labelColorY && (chartData.axis.units.pos === 'y') ){
              color = this.labelColorY;
            }
            $(chartData.element._node.children[0]).css('color', color);
          }

          // Animation
          if ( this.animation ){
            let delays =bbn.fn.isNumber(this.animation) ? this.animation : 20,
                durations = 500;
            seq++;
            if ( (chartData.type === 'line') || (chartData.type === 'area') ){
              // If the element is drawn as a line, there is an opacity fade in. This could also be achieved using CSS3 animations.
              chartData.element.animate({
                opacity: {
                  // The delay when we the animation start
                  begin: seq * delays + 1000,
                  // Duration of the animation
                  dur: durations,
                  // The value when the animation will start
                  from: 0,
                  // The value when it will end
                  to: 1
                }
              });
            }
            else if ( (chartData.type === 'label') && (chartData.axis.units.pos === 'x') ){
              chartData.element.animate({
                y: {
                  begin: seq * delays,
                  dur: durations,
                  from: chartData.y + 100,
                  to: chartData.y,
                  // We can specify an easing function from Chartist.Svg.Easing
                  easing: 'easeOutQuart'
                }
              });
            }
            else if ( (chartData.type === 'label') && (chartData.axis.units.pos === 'y') ){
              chartData.element.animate({
                x: {
                  begin: seq * delays,
                  dur: durations,
                  from: chartData.x - 100,
                  to: chartData.x,
                  easing: 'easeOutQuart'
                }
              });
            }
            else if ( chartData.type === 'point' ){
              chartData.element.animate({
                x1: {
                  begin: seq * delays,
                  dur: durations,
                  from: chartData.x - 10,
                  to: chartData.x,
                  easing: 'easeOutQuart'
                },
                x2: {
                  begin: seq * delays,
                  dur: durations,
                  from: chartData.x - 10,
                  to: chartData.x,
                  easing: 'easeOutQuart'
                },
                opacity: {
                  begin: seq * delays,
                  dur: durations,
                  from: 0,
                  to: 1,
                  easing: 'easeOutQuart'
                }
              });
            }
            else if ( chartData.type === 'grid' ){
              // Using chartData.axis we get x or y. We can use this to construct our animation definition objects
              let pos1Animation = {
                    begin: seq * delays,
                    dur: durations,
                    from: chartData[chartData.axis.units.pos + '1'] - 30,
                    to: chartData[chartData.axis.units.pos + '1'],
                    easing: 'easeOutQuart'
                  },
                  pos2Animation = {
                    begin: seq * delays,
                    dur: durations,
                    from: chartData[chartData.axis.units.pos + '2'] - 100,
                    to: chartData[chartData.axis.units.pos + '2'],
                    easing: 'easeOutQuart'
                  },
                  animations = {};
              animations[chartData.axis.units.pos + '1'] = pos1Animation;
              animations[chartData.axis.units.pos + '2'] = pos2Animation;
              animations['opacity'] = {
                begin: seq * delays,
                dur: durations,
                from: 0,
                to: 1,
                easing: 'easeOutQuart'
              };
              chartData.element.animate(animations);
            }
          }
        });
      },
      /**
       * Sets animations and colors whilst drawing the bar chart.
	   *
       * @method barDraw
       * @fires setGridColor
       * @fires setColor
       */
      barDraw(){
        this.widget.on('draw', (chartData) => {
          // Set grid color
          this.setGridColor(chartData);

          // Customize color
          this.setColor(chartData);

          // Customize label color
          if ( (chartData.type === 'label') ){
            let color = false;
            if ( this.labelColor ){
              color = this.labelColor;
            }
            if ( this.labelColorX && (chartData.axis.units.pos === 'x') ){
              color = this.labelColorX;
            }
            else if ( this.labelColorY && (chartData.axis.units.pos === 'y') ){
              color = this.labelColorY;
            }
            if ( color ){
              $(chartData.element._node.children[0]).css('color', color);
            }
          }

          // Animation
          if ( this.animation ){
            let delays =bbn.fn.isNumber(this.animation) ? this.animation : 500,
                durations = delays;
            if ( chartData.type === 'bar' ){
              let color = Array.isArray(this.colors) ? this.colors[this.legend ? this.getColorIdx(chartData) : chartData.seriesIndex] : false,
                  style = chartData.element.attr('style');
              if ( color ){
                style = (style || '') + ' stroke: ' + color + ' !important;';
              }
              chartData.element.attr({
                style: (style || '') + ' stroke-width: 0px'
              });
              for ( let s = 0; s < chartData.series.length; ++s) {
                if ( chartData.seriesIndex === s ){
                  let ax = {
                    y2: {
                      begin:  s * delays,
                      dur:    durations,
                      from:   chartData.y1,
                      to:     chartData.y2,
                      easing: Chartist.Svg.Easing.easeOutSine
                    },
                    'stroke-width': {
                      begin: s * delays,
                      dur:   1,
                      from:  0,
                      to:    10,
                      fill:  'freeze'
                    }
                  };
                  if ( this.horizontalBars ){
                    ax.x2 = ax.y2;
                    ax.x2.from = chartData.x1;
                    ax.x2.to = chartData.x2;
                    delete ax.y2;
                  }
                  chartData.element.animate(ax, false);
                }
              }
            }
            else if ( (chartData.type === 'label') && (chartData.axis.units.pos === 'x') ){
              chartData.element.animate({
                y: {
                  begin: delays,
                  dur: durations,
                  from: chartData.y + 100,
                  to: chartData.y,
                  // We can specify an easing function from Chartist.Svg.Easing
                  easing: 'easeOutQuart'
                }
              });
            }
            else if ( (chartData.type === 'label') && (chartData.axis.units.pos === 'y') ){
              chartData.element.animate({
                x: {
                  begin: delays,
                  dur: durations,
                  from: chartData.x - 100,
                  to: chartData.x,
                  easing: 'easeOutQuart'
                }
              });
            }
            else if ( chartData.type === 'grid' ){
              // Using chartData.axis we get x or y. We can use this to construct our animation definition objects
              let pos1Animation = {
                    begin: delays,
                    dur: durations,
                    from: chartData[chartData.axis.units.pos + '1'] - 30,
                    to: chartData[chartData.axis.units.pos + '1'],
                    easing: 'easeOutQuart'
                  },
                  pos2Animation = {
                    begin: delays,
                    dur: durations,
                    from: chartData[chartData.axis.units.pos + '2'] - 100,
                    to: chartData[chartData.axis.units.pos + '2'],
                    easing: 'easeOutQuart'
                  },
                  animations = {};
              animations[chartData.axis.units.pos + '1'] = pos1Animation;
              animations[chartData.axis.units.pos + '2'] = pos2Animation;
              animations['opacity'] = {
                begin: delays,
                dur: durations,
                from: 0,
                to: 1,
                easing: 'easeOutQuart'
              };
              chartData.element.animate(animations);
            }
          }
        });
      },
      /**
       * Sets animations, colors and labels whilst drawing the pie chart.
       *
       * @method pieDraw
       * @fires setColor
       */
      pieDraw(){
        let yOffset = this.labelExternal ? 15 : 7.5,
            p = 1,
            idDef = bbn.fn.randomString(),
            defs = false;
        this.widget.on('draw', (chartData) => {
          let tmp = 1;
          // Insert linebreak to labels
          if ( chartData.type === 'label' ){
            let lb = chartData.text.split("\n"),
                text = '';
            if ( lb.length ){
              text = '<tspan>' + lb[0] + '</tspan>';
              $.each(lb, (i, v) => {
                if ( i > 0 ){
                  text += '<tspan dy="' + yOffset + '" x="' + chartData.x + '">' + v + '</tspan>';
                  chartData.y -= yOffset;
                  chartData.element._node.attributes.dy.value -= (this.labelExternal ? yOffset-10 : yOffset);
                }
              });
              chartData.element._node.innerHTML = text;
            }
            tmp = lb.length > p ? lb.length : tmp;
          }
          if ( this.labelExternal && ( tmp > p) ){
            p = tmp;
            //this.widget.update(this.widget.data, {chartPadding: (this.widget.options.chartPadding ? this.widget.options.chartPadding : 0) + (p*yOffset)}, true);
          }

          // Customize color
          this.setColor(chartData);

          // Customize label color
          if ( this.labelColor && (chartData.type === 'label') ){
            chartData.element.attr({
              style: 'fill: ' + this.labelColor
            });
          }

          // Animation
          if ( this.animation ){
            let dur = bbn.fn.isNumber(this.animation) ? this.animation : 500;
            if ( chartData.type === 'slice' ){
              let style = chartData.element.attr('style'),
                  color;
              if ( this.colors && Array.isArray(this.colors) ){
                color = this.colors[this.legend ? this.getColorIdx(chartData) : chartData.index];
                if ( color ){
                  chartData.element.attr({
                    style: (style || '') + ' stroke: ' + color + ' !important;'
                  });
                }
              }
              // Get the total path length to use for the dash array animation
              let pathLength = chartData.element._node.getTotalLength();
              // Set a dasharray that matches the path length as a prerequisite to animate dashoffset
              chartData.element.attr({
                'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
              });
              // Create animation definition while also assigning an ID to the animation for later sync usage
              let animationDefinition = {
                'stroke-dashoffset': {
                  id: 'anim' + chartData.index,
                  dur: dur,
                  from: -pathLength + 'px',
                  to: '0px',
                  easing: Chartist.Svg.Easing.easeOutQuint,
                  // We need to use `fill: 'freeze'`, otherwise, the animation will fall back to initial (not visible)
                  fill: 'freeze'
                }
              };
              // If this was not the first slice, we need to time the animation so that it uses the end sync event of the previous animation
              if ( chartData.index !== 0 ){
                animationDefinition['stroke-dashoffset'].begin = 'anim' + (chartData.index - 1) + '.end';
              }
              // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
              chartData.element.attr({
                'stroke-dashoffset': -pathLength + 'px'
              });
              // We can't use guided mode as the animations relies on the setting starting manually
              // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
              chartData.element.animate(animationDefinition, false);
            }
            else if ( chartData.type === 'label' ){
              chartData.element.animate({
                opacity: {
                  begin: chartData.index * dur + dur,
                  dur: dur,
                  from: 0,
                  to: 1,
                  easing: 'easeOutQuart'
                }
              });
            }
          }

          if ( chartData.type === 'slice' ){
            if ( !defs ){
              defs = {
                x: chartData.center.x,
                y: chartData.center.y
              };
              $(chartData.group._node.parentNode).prepend('<defs><radialGradient id="' + idDef + '" r="122.5" gradientUnits="userSpaceOnUse" cx="' + defs.x + '" cy="' + defs.y + '"><stop offset="0.05" style="stop-color:#fff;stop-opacity:0.65;"></stop><stop offset="0.55" style="stop-color:#fff;stop-opacity: 0;"></stop><stop offset="0.85" style="stop-color:#fff;stop-opacity: 0.25;"></stop></radialGradient></defs>');
            }
            chartData.element._node.outerHTML += '<path d="' + chartData.element._node.attributes.d.nodeValue + '" stroke="none" fill="url(#' + idDef + ')"></path>';
          }
        });
      },
      /**
       * Sets the colors to an element.
       *
       * @method setColor
       * @param {Object} chartData
       * @fires getColorIdx
       */
      setColor(chartData){
        if ( this.colors ){
          let style = chartData.element.attr('style'),
              color;
          if ( (chartData.type === 'line') ||
            (chartData.type === 'point') ||
            ((chartData.type === 'bar') && !this.animation) ||
            ( chartData.type === 'area' )
          ){
            color = this.colors[this.legend ? this.getColorIdx(chartData) : chartData.seriesIndex];
            if ( color ){
              chartData.element.attr({
                style: (style || '') + (chartData.type === 'area' ? ' fill: ' : ' stroke: ') + color + (chartData.type === 'area' ? '; fill-opacity: ' + this.areaOpacity + '; stroke: none' : '')
              });
            }
          }
          if ( chartData.type === 'slice' ){
            color = this.colors[this.legend ? this.getColorIdx(chartData) : chartData.index];
            if ( color && (this.isLine || this.isBar || (this.isPie && !this.animation)) ){
              chartData.element.attr({
                style: (style || '') + ' fill: ' + color
              });
            }
          }
        }
      },
      /**
       * Sets the area's opacity
       *
       * @method setAreaOpacity
       * @param {Object} chartData A Chartist.js SVG element
      */
      setAreaOpacity(chartData) {
        if ( this.areaOpacity && (chartData.type === 'area') ){
          let style = chartData.element.attr('style');
          chartData.element.attr({
            style: (style || '') + 'fill-opacity: ' + this.areaOpacity + ';'
          });
        }
      },
      /**
       * Sets the grid color to an element.
       *
       * @method setGridColor
       * @param {Object} chartData A Chartist.js SVG element
       */
      setGridColor(chartData){
        if ( this.gridColor && (chartData.type === 'grid') ){
          chartData.element.attr({
            style: 'stroke: ' + this.gridColor + '; stroke-opacity: 0.2;'
          });
        }
      },
      /**
       * Returns the SVG element index color.
       *
       * @method getColorIdx
       * @param {Object} color SVG element
       * @return {Number}
       */
      getColorIdx(color){
        return color.element._node.parentElement.className.baseVal.replace('ct-series ', '').slice(-1).charCodeAt()-97;
      },
      /*trasformData(){
        $.each(this.source.series, (i, v) => {
          this.source.series[i] = $.map(v, (el, idx) => {
            if ( (typeof el !== 'object') && this.source.labels[idx] ){
              return {
                x: this.source.labels[idx],
                y: el
              };
            }
            return el;
          })
        });
        this.source.labels = [];
      },
      getLabelsLength(){
        let length = 0;
        $.each(this.source.series, (i,v) => {
          length = v.length > length ? v.length : length;
        });
        return length;
      },*/
      /**
       * Operations to be performed after the widget creation.
       *
       * @method widgetCreated
       */
      widgetCreated(){
        this.widget.on('created', (chartData) => {
          // Set the right colors to legend
          if ( this.legend ){
            let colors = [];
            $("g.ct-series", this.widget.container).each((i,v) => {
              if ( this.isBar ){
                colors.push($("line.ct-bar", v).first().css('stroke'));
              }
              else {
                $("path", v).each((k, p) => {
                  if ( $(p).hasClass('ct-line') ||
                    $(p).hasClass('ct-slice-pie') ||
                    $(p).hasClass('ct-slice-donut')
                  ){
                    colors.push($(p).css($(p).hasClass('ct-slice-pie') ? 'fill' : 'stroke'));
                  }
                })
              }
            });
            setTimeout(() => {
              if ( this.isPie && this.legendPosition ){
                $("ul.ct-legend.ct-legend-inside", this.widget.container).removeClass("ct-legend-inside");
              }
              let legendHeight = $('ul.ct-legend:not(.ct-legend-inside)', this.widget.container).height(),
                  svgHeight = $('svg', this.widget.container).height(),
                  contHeight = $(this.widget.container).height();
              if ( (legendHeight + svgHeight) > contHeight ){
                this.widget.update(false, {height: contHeight - legendHeight}, true);
                return;
              }
              $("ul.ct-legend li", this.widget.container).each((i, v) => {
                if ( Array.isArray(this.legendTitles) ){
                  $(v).attr('title', this.legendTitles[i]);
                }
                if ( !$("div.rect", v).length ){
                  $(v).prepend('<div class="rect" style="background-color: ' + colors[i] +'; border-color: ' + colors[i] + '"></div>');
                }
              });
            }, 100);
          }
          // Set the right colors to point labels
          if ( !this.isPie && (this.labelColor || this.labelColorY) ){
            $("g.ct-series text.ct-label", this.widget.container).css('stroke', this.labelColorY || this.labelColor);
          }
          // Reset zoom
          /*if ( this.zoom && this.isLine ){
            $(this.widget.container).dblclick(() => {
              if ( this.resetZoom &&bbn.fn.isFunction(this.resetZoom) ){
                this.resetZoom();
              }
            });
          }*/
        });
      }
    },
    watch: {
      /**
       * @watch source
       * @fires init
       */
      source(val){
        this.$nextTick(() => {
          this.init();
        });
      },
    },
    /**
     * @event mounted
     * @fires init
     */
    mounted(){
      this.$nextTick(() => {
        this.init();
      });
    }
  });
})(jQuery, bbn);
