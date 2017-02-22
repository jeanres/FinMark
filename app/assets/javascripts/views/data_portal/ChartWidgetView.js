(function (App) {
  'use strict';

  var Model = Backbone.Model.extend({
    parse: function (data) {
      var res = { name: data.name };

      res.data = data.data.map(function (answer) {
        return {
          label: answer.value,
          count: answer.count,
          total: answer.total,
          percentage: answer.percentage
        };
      });

      return res;
    }
  });

  // TODO: to be removed
  var mockupData = {
    name: 'Settlement',
    data: [
      { label: 'Rural', count: 18943, total: 36441, percentage: 0.519 },
      { label: 'Urban', count: 11046, total: 36441, percentage: 0.303 },
      { label: 'Other', count: 6450, total: 36441, percentage: 0.178 }
    ]
  };

  App.View.ChartWidgetView = Backbone.View.extend({

    template: JST['templates/data_portal/chart-widget'],

    defaults: {
      // Ratio between the height and the width (i.e. height = chartRatio * width)
      chartRatio: 0.5,
      // Name of the default chart type
      chart: null,
      // Inner width of the chart, used internally
      _width: null,
      // Inner height of the chart, used internally
      _height: null
    },

    initialize: function (settings) {
      this.options = _.extend({}, this.defaults, settings);
      this.model = new Model(mockupData);

      this.fetchData()
        .done(function () {
          var data = this.model.toJSON().data;
          this.widgetToolbox = new App.Helper.WidgetToolbox(data);

          // We pre-render the component with its template
          this.el.innerHTML = this.template({
            name: this.model.toJSON().name
          });
          this.chartContainer = this.el.querySelector('.js-chart');

          this.render();
          this._setListeners();
        }.bind(this))
        .fail(this.renderError.bind(this));
    },

    /**
     * Set the listeners that doesn't depend on a DOM node
     */
    _setListeners: function () {
      window.addEventListener('resize', _.debounce(this._onResize.bind(this), 150));
    },

    /**
     * Event handler for when the window is resized
     */
    _onResize: function () {
      if (!this.options.chart) return;

      /* eslint-disable no-underscore-dangle */
      var previousWidth = this.options._width;
      var previousHeight = this.options._height;
      /* eslint-enable no-underscore-dangle */

      var newDimensions = this._computeChartDimensions();
      if (newDimensions.width !== previousWidth || newDimensions.height !== previousHeight) {
        this._renderChart();
      }
    },

    /**
     * Fetch the data for the widget
     * @returns {object} $.Deferred
     */
    fetchData: function () {
      // TODO: delete once API updated
      var deferred = $.Deferred();
      deferred.resolve({ toBe: 'deleted' });
      return deferred;

      // return this.model.fetch()
    },

    /**
     * Compute the chart dimensions
     * @returns {{ width: number, height: number}}
     */
    _computeChartDimensions: function () {
      // We render the template with fake data in order to parse it as a JS object and retrieve the padding
      var chartTemplate = JSON.parse(this._getChartTemplate()({
        data: JSON.stringify([]),
        label: JSON.stringify(''),
        width: JSON.stringify(''),
        height: JSON.stringify('')
      }));

      var containerDimensions = this.chartContainer.getBoundingClientRect();

      var padding = _.extend({}, chartTemplate.padding, {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      });

      var width = Math.round(containerDimensions.width - padding.left - padding.right);
      var height = Math.round(width * this.options.chartRatio);

      // We save the current dimensions of the chart to diff them whenever the window is resized in order to minimize
      // the number of re-renders
      /* eslint-disable no-underscore-dangle */
      this.options._width = width;
      this.options._height = height;
      /* eslint-enable no-underscore-dangle */

      return {
        width: width,
        height: height
      };
    },

    /**
     * Get the chart Handlebars template
     * @returns {function}
     */
    _getChartTemplate: function () {
      return JST['templates/data_portal/widgets/' + this.options.chart];
    },

    /**
     * Generate the vega spec
     * @returns {object}
     */
    _generateVegaSpec: function () {
      if (!this.options.chart) {
        var availableCharts = this.widgetToolbox.getAvailableCharts();
        if (availableCharts.length) {
          this.options.chart = availableCharts[0];
        } else {
          // eslint-disable-next-line no-console
          console.warn('Unable to generate a chart out of the current dataset');
          return {};
        }
      }

      var chartDimensions = this._computeChartDimensions();

      return this._getChartTemplate()({
        data: JSON.stringify(this.model.toJSON().data),
        label: JSON.stringify(this.model.toJSON().label),
        width: chartDimensions.width,
        height: chartDimensions.height
      });
    },

    /**
     * Create the chart and append it to the DOM
     */
    _renderChart: function () {
      // TODO: If no data, we render an empty chart

      vg.parse
        .spec(JSON.parse(this._generateVegaSpec()), function (error, chart) {
          this.chart = chart({ el: this.chartContainer }).update();
        }.bind(this));
    },

    render: function () {
      this._renderChart();
      return this.el;
    },

    renderError: function () {
      console.error('unable to fetch the indicator');
    }

  });

}).call(this, this.App);
