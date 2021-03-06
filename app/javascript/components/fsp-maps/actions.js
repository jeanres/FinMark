import { createAction, createThunkAction } from 'redux-tools';
import { replace } from 'layer-manager';
import Numeral from 'numeral';
import compact from 'lodash/compact';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import groupBy from 'lodash/groupBy';
import Promise from 'bluebird';

import WRIJsonApiSerializer from 'wri-json-api-serializer';

// SQL
import INTRO_SQL from './sql/intro.sql';
import SECTORS_SQL from './sql/sectors.sql';
import SECTORS_USERS_SQL from './sql/sectors_users.sql';
import CONTEXTUAL_LAYERS_SQL from './sql/contextual_layers.sql';
import WIDGETS_SQL from './sql/widgets.sql';
import JURISDICTIONS_SQL from './sql/jurisdictions.sql';
import JURISDICTION_GEOMETRY_SQL from './sql/jurisdiction-geometry.sql';

// CONSTANTS
import { LAYERS_INFO } from './constants';

// COMMON
export const setIso = createAction('COMMON/setIso');
export const setShortIso = createAction('COMMON/setShortIso');
export const setBBox = createAction('COMMON/setBBox');
export const setLatestyear = createAction('COMMON/setLatestyear');

// INTRO
export const setIntro = createAction('INTRO/setIntro');
export const setDistance = createAction('INTRO/setDistance');
export const setIntroLoading = createAction('INTRO/setIntroLoading');
export const setIntroError = createAction('INTRO/setIntroError');
export const fetchIntro = createThunkAction('INTRO/fetchIntro', () => (dispatch, getState) => {
  const { iso } = getState().fspMaps.common;
  const { distance } = getState().fspMaps.intro;
  const distance_km = distance.value;

  dispatch(setIntroLoading(true));

  // return fetch(new Request(`${process.env.API_URL}/`))
  return fetch(`${window.FSP_CARTO_API}?q=${encodeURIComponent(replace(INTRO_SQL, { iso, distance_km }))}&api_key=${window.FSP_CARTO_API_KEY}`)
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error(response.statusText);
    })
    .then((data) => {
      dispatch(setIntroLoading(false));
      dispatch(setIntroError(null));

      const dataRows = data.rows[0];
      const result = [
        { label: `TOTAL POPULATION (${dataRows.year})`, value: Numeral(dataRows.total_population).format('0,0'), subvalue: null },
        { label: 'RURAL POPULATION PERCENTAGE', value: `${Numeral(dataRows.rural_population_percentage).format('0.0')}%`, subvalue: Numeral(dataRows.rural_population).format('0,0') },
        { label: 'URBAN POPULATION PERCENTAGE:', value: `${Numeral(dataRows.urban_population_percentage).format('0.0')}%`, subvalue: Numeral(dataRows.urban_population).format('0,0') },
        { label: 'TOTAL POPULATION WITHIN 5KM OF ALL ACESS POINTS', value: `${Numeral(dataRows.population_5km_percentage).format('0.0')}%`, subvalue: Numeral(dataRows.population_5km).format('0,0'), component: true }
      ];

      dispatch(setIntro(result));
    })
    .catch((err) => {
      dispatch(setIntroLoading(false));
      dispatch(setIntroError(err));
    });
});

export const fetchPopulationDistance = createThunkAction('INTRO/fetchIntro', () => (dispatch, getState) => {
  const { iso } = getState().fspMaps.common;
  //const { distance_km } = getState().fspMaps.intro;

  const distance_km = 5;

  dispatch(setIntroLoading(true));

  // return fetch(new Request(`${process.env.API_URL}/`))
  return fetch(`${window.FSP_CARTO_API}?q=${encodeURIComponent(replace(INTRO_SQL, { iso, distance_km }))}&api_key=${window.FSP_CARTO_API_KEY}`)
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error(response.statusText);
    })
    .then((data) => {
      dispatch(setIntroLoading(false));
      dispatch(setIntroError(null));

      const dataRows = data.rows[0];
      const result = [
        { label: `TOTAL POPULATION (${dataRows.year})`, value: Numeral(dataRows.total_population).format('0,0'), subvalue: null },
        { label: 'RURAL POPULATION PERCENTAGE', value: `${Numeral(dataRows.rural_population_percentage).format('0.0')}%`, subvalue: Numeral(dataRows.rural_population).format('0,0') },
        { label: 'URBAN POPULATION PERCENTAGE:', value: `${Numeral(dataRows.urban_population_percentage).format('0.0')}%`, subvalue: Numeral(dataRows.urban_population).format('0,0') },
        { label: 'TOTAL POPULATION WITHIN 5KM OF ALL ACESS POINTS', value: `${Numeral(dataRows.population_5km_percentage).format('0.0')}%`, subvalue: Numeral(dataRows.population_5km).format('0,0'), component: true }
      ];

      dispatch(setIntro(result));
    })
    .catch((err) => {
      dispatch(setIntroLoading(false));
      dispatch(setIntroError(err));
    });
});

// INTRO ANALYSIS
export const setIntroAnalysis = createAction('INTRO_ANALYSIS/setIntro');
export const setIntroAnalysisLoading = createAction('INTRO_ANALYSIS/setIntroLoading');
export const setIntroAnalysisError = createAction('INTRO_ANALYSIS/setIntroError');
export const fetchIntroAnalysis = createThunkAction('INTRO_ANALYSIS/fetchIntro', () => (dispatch, getState) => {
  const { iso } = getState().fspMaps.common;

  dispatch(setIntroAnalysisLoading(true));

  // return fetch(new Request(`${process.env.API_URL}/`))
  return fetch(`${window.FSP_CARTO_API}?q=${encodeURIComponent(replace(INTRO_SQL, { iso }))}&api_key=${window.FSP_CARTO_API_KEY}`)
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error(response.statusText);
    })
    .then((data) => {
      dispatch(setIntroAnalysisLoading(false));
      dispatch(setIntroAnalysisError(null));

      const dataRows = data.rows[0];
      const result = [
        { label: `TOTAL POPULATION (${dataRows.year})`, value: Numeral(dataRows.total_population).format('0,0'), subvalue: null },
        { label: 'RURAL POPULATION PERCENTAGE', value: `${Numeral(dataRows.rural_population_percentage).format('0.0')}%`, subvalue: Numeral(dataRows.rural_population).format('0,0') },
        { label: 'URBAN POPULATION PERCENTAGE:', value: `${Numeral(dataRows.urban_population_percentage).format('0.0')}%`, subvalue: Numeral(dataRows.urban_population).format('0,0') },
        { label: 'TOTAL POPULATION WITHIN 5KM OF ALL ACESS POINTS', value: `${Numeral(dataRows.population_5km_percentage).format('0.0')}%`, subvalue: Numeral(dataRows.population_5km).format('0,0'), component: true }
      ];

      dispatch(setIntroAnalysis(result));
    })
    .catch((err) => {
      dispatch(setIntroAnalysisLoading(false));
      dispatch(setIntroAnalysisError(err));
    });
});

// MAP
export const setOpenMap = createAction('MAP/setOpenMap');
export const setZoom = createAction('MAP/setZoom');
export const setCenter = createAction('MAP/setCenter');
export const setBasemap = createAction('MAP/setBasemap');
export const setLabel = createAction('MAP/setLabel');
export const setLatLng = createAction('MAP/setLatLng');

// LEGEND
export const setOpenLegend = createAction('LEGEND/setOpenLegend');

// SIDEBAR
export const setOpenSidebar = createAction('SIDEBAR/setOpenSidebar');
export const setSelected = createAction('SIDEBAR/setSelected');
export const setMenuItem = createAction('SIDEBAR-MENU/setMenuItem');

// LAYERS
export const setLayersList = createAction('LAYERS/setLayersList');
export const setLayersSelected = createAction('LAYERS/setLayersSelected');
export const setLayersSectorSelected = createAction('SECTORS/setLayersSectorSelected');
export const setLayersOrder = createAction('LAYERS/setLayersOrder');
export const setLayersInteractions = createAction('INTERACTIONS/setLayersInteractions');
export const setLayersSettings = createAction('LEGEND/setLayersSettings');

function getSectors(iso) {
  const tableName = process.env.FSP_CARTO_TABLE;
  return fetch(`${window.FSP_CARTO_API}?q=${encodeURIComponent(replace(SECTORS_SQL, { iso, tableName }))}&api_key=${window.FSP_CARTO_API_KEY}`)
    .then(response => response.ok && response.json())
    .then((data) => {
      const sectorLayers = data.rows.map(row => ({
        ...row,
        id: row.type_id.toString(),
        name: row.type,
        info: LAYERS_INFO[row.type],
        layerType: 'sector',
        count: Numeral(row.count).format('0,0'),
        provider: 'carto',
        isUserDataset: false,
        years: row.years ? row.years.filter(y => y) : []
      }));

      const groupBySector = groupBy(sectorLayers, 'sector');

      const categoryLayers = Object.keys(groupBySector).map((k) => {
        return {
          id: `all-${k.toLowerCase()}-layer`,
          name: `All ${k.toLowerCase()} layer`,
          sector: k,
          category: 'all',
          layerType: 'sector',
          count: null,
          provider: 'carto',
          isUserDataset: false,
          layers: groupBySector[k].map(fl => ({
            color: fl.color,
            type: fl.type,
            type_id: fl.type_id
          }))
        };
      });

      return [
        ...categoryLayers,
        ...sectorLayers
      ];
    });
}

function getUserDatasets(iso) {
  const tableName = process.env.FSP_CARTO_USERS_TABLE;
  return fetch(`${window.FSP_CARTO_API}?q=${encodeURIComponent(replace(SECTORS_USERS_SQL, { iso, tableName }))}&api_key=${window.FSP_CARTO_API_KEY}`)
    .then(response => response.ok && response.json())
    .then(data => data.rows.map(row => ({
      ...row,
      id: row.id.toString(),
      name: row.name,
      info: LAYERS_INFO[row.type],
      layerType: 'sector',
      count: Numeral(row.count).format('0,0'),
      provider: 'carto',
      isUserDataset: true
    })));
}

function getContextualLayers() {
  return fetch(`${window.FSP_CARTO_API}?q=${encodeURIComponent(CONTEXTUAL_LAYERS_SQL)}&api_key=${window.FSP_CARTO_API_KEY}`)
    .then(response => response.ok && response.json())
    .then((data) => {
      const dataRows = data.rows;
      const cartoLayers = dataRows.filter(row => row.provider === 'cartodb');
      const rwLayers = dataRows.filter(row => row.provider === 'rw_api');

      const contextualLayers = cartoLayers.map(row => (
        {
          ...row,
          name: row.layer,
          info: LAYERS_INFO[row.layer],
          layerType: 'contextual',
          id: row.type_id.toString(),
          provider: 'carto',
          layerConfig: {
            body: {
              layers: [
                {
                  options: {
                    cartocss_version: '2.3.0',
                    cartocss: row.css,
                    sql: row.queries
                  },
                  type: 'cartodb'
                }
              ],
              minzoom: 3,
              maxzoom: 18
            },
            account: window.FSP_CARTO_ACCOUNT
          },
          legendConfig: {
            type: 'basic',
            items: [
              {
                name: row.layer,
                color: '#5CA2D1'
              }
            ]
          },
          interactionConfig: {}
        }
      ));

      const rwLayersPromises = rwLayers.map(row => fetch(`https://api.resourcewatch.org/v1/layer/${row.layer_id}`)
        .then(r => r.ok && r.json()));

      return Promise.all(rwLayersPromises)
        .then((layerData) => {
          compact(layerData).forEach((d) => {
            const serializedData = WRIJsonApiSerializer(d);

            contextualLayers.push({
              ...serializedData,
              name: rwLayers.find(l => l.layer_id === serializedData.id).layer,
              info: LAYERS_INFO[rwLayers.find(l => l.layer_id === serializedData.id).layer],
              layerType: 'contextual'
            });
          });

          return contextualLayers;
        });
    });
}

export const fetchLayers = createThunkAction('LAYERS/fetchLayers', () => (dispatch, getState) => {
  const { iso } = getState().fspMaps.common;
  const { layersSettings } = getState().fspMaps.layers;

  Promise.all([
    getSectors(iso, layersSettings),
    getUserDatasets(iso, layersSettings),
    getContextualLayers()
  ])
    .then((data) => {
      dispatch(setLayersList(flatten(data)));
    });
});

// MODAL
export const setModal = createAction('MODAL/setModal');
export const closeModal = createAction('MODAL/closeModal');


// Widgets
export const setWidgetsList = createAction('WIDGETS/setWidgetsList');
export const fetchWidgets = createThunkAction('WIDGETS/fetchWidgets', () => (dispatch) => {
  fetch(`${window.FSP_CARTO_API}?q=${encodeURIComponent(WIDGETS_SQL)}&api_key=${window.FSP_CARTO_API_KEY}`)
    .then(response => response.ok && response.json())
    .then((data) => {
      dispatch(setWidgetsList(data.rows));
    });
});

// Analysis
export const setAnalysisActive = createAction('ANALYSIS/setAnalysisActive');

// Analysis - pattern
export const toggleLocation = createAction('ANALYSIS/toggleLocation');
export const togglePinDrop = createAction('ANALYSIS/togglePinDrop');
export const setNearby = createAction('ANALYSIS/setNearby');
export const setNearbyArea = createAction('ANALYSIS/setNearbyArea');
export const setNearbyCenter = createAction('ANALYSIS/setNearbyCenter');
export const setNearbyError = createAction('ANALYSIS/setNearbyError');
export const fetchNearbyArea = createThunkAction('ANALYSIS/fetchNearby', () => (dispatch, getState) => {
  const { time, location, center } = getState().fspMaps.analysis.nearby;
  if ((isEmpty(center) && isEmpty(location)) || !time) {
    return false;
  }

  const { lat, lng } = center;
  const seconds = time * 60;

  return fetch(`${window.OPEN_ROUTE_API}?api_key=${window.OPEN_ROUTE_API_KEY}&profile=foot-walking&range_type=time&locations=${lng},${lat}&range=${seconds}`)
    .then(response => response.ok && response.json())
    .then((data) => {
      dispatch(setNearbyArea(data.features[0].geometry));

      dispatch(setNearbyCenter({
        lng: data.features[0].properties.center[0],
        lat: data.features[0].properties.center[1]
      }));
    })
    .catch((err) => {
      if (err && typeof err.json === 'function') {
        err.json()
          .then((errs) => {
            dispatch(setNearbyError(errs));
          });
      } else {
        dispatch(setNearbyError(err));
      }
    });
});


// Analysis - pattern
export const togglePatternLocation = createAction('ANALYSIS/togglePatternLocation');
export const togglePatternPinDrop = createAction('ANALYSIS/togglePatternPinDrop');
export const setPattern = createAction('ANALYSIS/setPattern');
export const setPatternArea = createAction('ANALYSIS/setPatternArea');
export const setPatternCenter = createAction('ANALYSIS/setPatternCenter');
export const setPatternError = createAction('ANALYSIS/setPatternError');
export const fetchPatternArea = createThunkAction('ANALYSIS/fetchPattern', () => (dispatch, getState) => {
  const { time, location, center } = getState().fspMaps.analysis.pattern;
  if ((isEmpty(center) && isEmpty(location)) || !time) {
    return false;
  }

  const { lat, lng } = center;
  const seconds = time * 60;

  return fetch(`${window.OPEN_ROUTE_API}?api_key=${window.OPEN_ROUTE_API_KEY}&profile=foot-walking&range_type=time&locations=${lng},${lat}&range=${seconds}`)
    .then(response => response.ok && response.json())
    .then((data) => {
      dispatch(setPatternArea(data.features[0].geometry));

      dispatch(setPatternCenter({
        lng: data.features[0].properties.center[0],
        lat: data.features[0].properties.center[1]
      }));
    })
    .catch((err) => {
      if (err && typeof err.json === 'function') {
        err.json()
          .then((errs) => {
            dispatch(setPatternError(errs));
          });
      } else {
        dispatch(setPatternError(err));
      }
    });
});

// Analysis - Analyze Patterns
export const setLocationSelected = createAction('ANALYSIS/setLocationSelected');
export const setLocationsList = createAction('ANALYSIS/setLocationsList');
export const setLocationArea = createAction('ANALYSIS/setLocationArea');
export const fetchLocations = createThunkAction('ANALYSIS/fetchLocations', () => (dispatch, getState) => {
  const { iso } = getState().fspMaps.common;
  const locationsSql = encodeURIComponent(replace(JURISDICTIONS_SQL, { iso }));

  fetch(`${window.FSP_CARTO_API}?q=${locationsSql}&api_key=${window.FSP_CARTO_API_KEY}`)
    .then(response => response.ok && response.json())
    .then((data) => {
      dispatch(setLocationsList(data.rows));
    });
});

export const fetchLocationArea = createThunkAction('ANALYSIS/fetchLocationArea', () => (dispatch, getState) => {
  const { selectedLocation } = getState().fspMaps.analysis.location;
  const { value: jurisdictionId } = selectedLocation;
  const locationAreaSql = encodeURIComponent(
    replace(JURISDICTION_GEOMETRY_SQL, { jurisdictionId })
  );

  fetch(`${window.FSP_CARTO_API}?q=${locationAreaSql}&api_key=${window.FSP_CARTO_API_KEY}`)
    .then(response => response.ok && response.json())
    .then((data) => {
      dispatch(setLocationArea(JSON.parse(data.rows[0].st_asgeojson)));
    });
});


// Analysis - area of interest
export const setAreaOfInterest = createAction('ANALYSIS/setAreaOfInterest');
export const setAreaOfInterestArea = createAction('ANALYSIS/setAreaOfInterestArea');
export const setDrawing = createAction('ANALYSIS/setDrawing');
export const setClearing = createAction('ANALYSIS/setClearing');

// Analysis - jurisdiction
export const setJurisdictionSelected = createAction('ANALYSIS/setJurisdictionSelected');
export const setJurisdictionsList = createAction('ANALYSIS/setJurisdictionsList');
export const setJurisdictionArea = createAction('ANALYSIS/setJurisdictionArea');
export const fetchJurisdictions = createThunkAction('ANALYSIS/fetchJurisdictions', () => (dispatch, getState) => {
  const { iso } = getState().fspMaps.common;
  const jurisdictionsSql = encodeURIComponent(replace(JURISDICTIONS_SQL, { iso }));

  fetch(`${window.FSP_CARTO_API}?q=${jurisdictionsSql}&api_key=${window.FSP_CARTO_API_KEY}`)
    .then(response => response.ok && response.json())
    .then((data) => {
      dispatch(setJurisdictionsList(data.rows));
    });
});

export const fetchJurisdictionArea = createThunkAction('ANALYSIS/fetchJurisdictionArea', () => (dispatch, getState) => {
  const { selectedJurisdiction } = getState().fspMaps.analysis.jurisdiction;
  const { value: jurisdictionId } = selectedJurisdiction;
  const jurisdictionAreaSql = encodeURIComponent(
    replace(JURISDICTION_GEOMETRY_SQL, { jurisdictionId })
  );

  fetch(`${window.FSP_CARTO_API}?q=${jurisdictionAreaSql}&api_key=${window.FSP_CARTO_API_KEY}`)
    .then(response => response.ok && response.json())
    .then((data) => {
      dispatch(setJurisdictionArea(JSON.parse(data.rows[0].st_asgeojson)));
    });
});
