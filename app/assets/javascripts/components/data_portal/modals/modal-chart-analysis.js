(function (App) {

  App.Component.ModalChartAnalysis = App.Component.Modal.extend({

    contentTemplate: JST['templates/data_portal/modals/modal-chart-analysis'],

    defaults: {
      // See App.Component.Modal for details about this option
      title: 'Analyse indicator',
      // See App.Component.Modal for details about this option
      showTitle: true,
      // See App.Component.Modal for details about this option
      footer: '<button type="button" class="c-button -padding -white -outline js-cancel">Cancel</button><button type="button" class="c-button -padding -no-hover -white js-done">Done</button>',
      // List of indicators to display in the modal
      indicators: [],
      // Id of the selected indicator for the analysis
      selectedIndicatorId: null,
      // Callback executed when the user presses the "Done" button
      // The callback gets passed the name of the selected chart
      continueCallback: function () {}
    },

    events: function () {
      return _.extend({}, App.Component.Modal.prototype.events, {
        'click .js-cancel': 'onCloseModal',
        'click .js-done': '_onClickDone'
      });
    },

    initialize: function (options) {
      this.constructor.__super__.initialize.call(this, options);
      this.render();
    },

    /**
     * Event handler for when the "Done" button is clicked
     */
    _onClickDone: function () {
      var selectedOption = this.el.querySelector('.js-indicator:checked');
      this.options.continueCallback(selectedOption.value);
      this.onCloseModal();
    },

    render: function () {
      this.options.content = this.contentTemplate({
        indicators: this.options.indicators,
        selectedIndicatorId: this.options.selectedIndicatorId
      });

      this.constructor.__super__.render.apply(this);
    }

  });
}).call(this, this.App);
