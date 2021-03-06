import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Constants
import { DRAWING_OPTIONS } from './constants';

// styles
// import './styles.scss';

class DrawingManagerComponent extends PureComponent {
  static propTypes = {
    map: PropTypes.object.isRequired,
    menuItem: PropTypes.string.isRequired,
    selected: PropTypes.string.isRequired,
    drawing: PropTypes.bool.isRequired,
    clearing: PropTypes.bool.isRequired,
    setDrawing: PropTypes.func.isRequired,
    setClearing: PropTypes.func.isRequired,
    setAreaOfInterestArea: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.props.map.on('pm:drawstart', (e) => {
      if (this.layer) {
        this.layer.remove();
        this.props.setAreaOfInterestArea({});
      }
    });

    this.props.map.on('pm:create', (e) => {
      this.layer = e.layer;
      this.props.setAreaOfInterestArea(e.layer.toGeoJSON().geometry);
      this.props.setDrawing(false);
    });
  }

  componentDidUpdate(prevProps) {
    const { drawing: prevDrawing } = prevProps;
    const { drawing: nextDrawing, clearing, menuItem, selected } = this.props;
    const opacity = (menuItem !== 'area_of_interest' || selected !== 'analysis') ? 0 : 1;
    const fillOpacity = (menuItem !== 'area_of_interest' || selected !== 'analysis') ? 0 : 0.2;

    if (this.layer) {
      this.layer.setStyle({ opacity, fillOpacity });
    }

    if (clearing) {
      if (this.layer) {
        this.layer.remove();
      }
      this.props.setAreaOfInterestArea({});
      this.props.setClearing(false);
    }

    if (prevDrawing !== nextDrawing) {
      if (nextDrawing) {
        this.props.map.pm.enableDraw('Poly', DRAWING_OPTIONS);
      } else {
        this.props.map.pm.disableDraw('Poly', DRAWING_OPTIONS);
      }
    }
  }

  render() {
    return null;
  }
}

export default DrawingManagerComponent;
