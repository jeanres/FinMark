import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Styles
import './styles.scss';

class LegendItemButtonVisualizationsTooltip extends React.Component {
  static propTypes = {
    list: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string,
    layerId: PropTypes.string.isRequired,
    onChangeLayer: PropTypes.func.isRequired,
    layersSettings: PropTypes.object.isRequired
  };

  static defaultProps = { category: '' };

  render() {
    const { title, list, layerId, layersSettings, category } = this.props;

    const visualizations = list.filter((l) => {
      if (category === 'all' && l.value === 'voronoid') { // Horrible, instead of doing it by id we should do it by type
        return false;
      }

      return true;
    });

    return (
      <div className="c-legend-item-button-visualizations-tooltip">
        {title}

        <div className="visualization-list">
          {visualizations.map((l) => {
            const current = (layersSettings[layerId] && typeof layersSettings[layerId].visualizationType !== 'undefined') ? layersSettings[layerId].visualizationType : 'normal';

            return (
              <div
                role="button"
                tabIndex="-1"
                key={l.value}
                className={classnames({
                  'visualization-list-item': true,
                  '-active': l.value === current
                })}
                onClick={() => this.props.onChangeLayer(layerId, l.value)}
              >
                {l.label}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default LegendItemButtonVisualizationsTooltip;
