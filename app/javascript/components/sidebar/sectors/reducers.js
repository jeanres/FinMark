import * as actions from './actions';

export default {
  [actions.setList]: (state, { payload }) => ({ ...state, list: payload }),
  [actions.setSelectedSector]: (state, { payload }) => ({ ...state, selectedSector: payload }),
  [actions.setSelectedLayers]: (state, { payload }) => ({ ...state, selectedLayers: payload })
};
