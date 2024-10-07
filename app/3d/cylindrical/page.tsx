'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as CesiumModule from 'cesium';
import 'cesium/Source/Widgets/widgets.css';
import '@/styles/cesium-pico.css';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectMedeMapData } from '@/lib/features/medemap/medeMapSlice';
import { setLoading, selectIsLoading } from '@/lib/loadingSlice';
import { CircularProgress, Box, Slider, Typography, Button } from '@mui/material';
import { fetchGlobeData } from '@/lib/features/globeData/geocordDataSlice';
import Legend from '@/components/LegendCylindrical';
import { debounce } from 'lodash';

// List of European countries
const europeanCountries = [
  'Austria', 'Belgium',
  'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
  'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy',
  'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta',
  'Monaco', 'Netherlands',
  'Poland', 'Portugal', 'Romania', 'Slovakia',
  'Slovenia', 'Spain', 'Sweden',
];
// Sample thresholds
const sampleThresholds = {
  low_threshold: 30,
  medium_threshold: 60,
  high_threshold: 90,
};

// Hardcoded selectedOptions
const hardcodedSelectedOptions = {
  'Health Indicators': [
    {
      value: 'life_expectancy',
      label: 'Life Expectancy',
    },
  ],
};

// Hardcoded columnOptions
const hardcodedColumnOptions = {
  'Health Indicators': [
    {
      value: 'life_expectancy',
      label: 'Life Expectancy',
      thresholds: sampleThresholds,
    },
  ],
};

// Hardcoded data
const hardcodedData = {
  'Health Indicators': [
    { country: 'Austria', life_expectancy: 81 },
    { country: 'Belgium', life_expectancy: 82 },
    { country: 'Bulgaria', life_expectancy: 75 },
    // Add data for other countries...
  ],
};

const Cesium = () => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumModule.Viewer | null>(null);
  const dispatch = useAppDispatch();
  const medeMapState = useAppSelector(selectMedeMapData);
  const isLoading = useAppSelector(selectIsLoading);
  const [viewerReady, setViewerReady] = useState(false);

  // Use useAppSelector to access Redux state
  const geocoordinates = useAppSelector(state => state.globeData.data) || [];
  const loading = useAppSelector(state => state.globeData.loading) || false;
  const error = useAppSelector(state => state.globeData.error) || null;

  const [barSpacing, setBarSpacing] = useState<number>(0.4);
  const [cesiumReady, setCesiumReady] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [logoPosition, setLogoPosition] = useState({ x: 20, y: 20 });
  const [logoBillboard, setLogoBillboard] = useState<CesiumModule.Billboard | null>(null);

  // Store country entities for later access
  const countryEntities: { [key: string]: CesiumModule.Entity[] } = {};

  // Cesium Ion access token
  CesiumModule.Ion.defaultAccessToken = 'YOUR_CESIUM_ION_ACCESS_TOKEN';

  useEffect(() => {
    console.log('Initializing Cesium...');
    dispatch(setLoading(true));
    if (cesiumContainerRef.current && !viewerRef.current) {
      initCesium();
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchGlobeData());
  }, [dispatch]);

  const initCesium = async () => {
    if (cesiumContainerRef.current && !viewerRef.current) {
      console.log('Creating Cesium viewer...');
      dispatch(setLoading(true));
      CesiumModule.buildModuleUrl.setBaseUrl('/Cesium/');

      try {
        // Create the viewer with default imagery provider
        viewerRef.current = new CesiumModule.Viewer(cesiumContainerRef.current, {
          baseLayerPicker: true,
          geocoder: false,
          homeButton: true,
          infoBox: false,
          navigationHelpButton: true,
          sceneModePicker: true,
          selectedImageryProviderViewModel: new CesiumModule.ProviderViewModel({
            name: 'Blue Marble',
            iconUrl: CesiumModule.buildModuleUrl('Widgets/Images/ImageryProviders/blueMarble.png'),
            tooltip: 'Blue Marble Next Generation July, 2004',
            creationFunction: () => {
              return CesiumModule.IonImageryProvider.fromAssetId(3845);
            }
          }),
          sceneMode: CesiumModule.SceneMode.SCENE2D,
        });
        console.log('Viewer initialized.');

        // Add additional layers to the base layer picker
        const imageryLayers = viewerRef.current.baseLayerPicker.viewModel.imageryProviderViewModels;

        // Add Earth at Night
        imageryLayers.push(new CesiumModule.ProviderViewModel({
          name: 'Earth at Night',
          iconUrl: CesiumModule.buildModuleUrl('Widgets/Images/ImageryProviders/earthAtNight.png'),
          tooltip: 'Earth at Night',
          creationFunction: () => {
            return CesiumModule.IonImageryProvider.fromAssetId(3812);
          }
        }));

        // Enhance globe appearance
        if (viewerRef.current) {
          viewerRef.current.scene.globe.show = true;
          viewerRef.current.scene.globe.enableLighting = true;
          viewerRef.current.scene.globe.depthTestAgainstTerrain = false;
          viewerRef.current.scene.globe.showGroundAtmosphere = true;
          viewerRef.current.scene.skyAtmosphere.show = true;
          viewerRef.current.scene.backgroundColor = CesiumModule.Color.BLACK;

          // Set the view to show the entire globe
          viewerRef.current.camera.flyHome(0);
        }

        setViewerReady(true);
        console.log('Viewer ready');
        await loadGeoJson();
        renderData(); // Ensure renderData is called after initialization
      } catch (error) {
        console.error('Error initializing Cesium:', error);
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  const loadGeoJson = async () => {
    if (!viewerRef.current) return;

    try {
      const geoJsonResponse = await fetch('/geojson/countries.geo.json');

      if (!geoJsonResponse.ok) {
        throw new Error(`Failed to fetch GeoJSON: ${geoJsonResponse.status} ${geoJsonResponse.statusText}`);
      }

      const geoJsonData = await geoJsonResponse.json();
      console.log('Total features in GeoJSON:', geoJsonData.features.length);

      // Filter for European countries
      const europeanFeatures = geoJsonData.features.filter(feature =>
        europeanCountries.includes(feature.properties.name)
      );
      console.log('Number of European features:', europeanFeatures.length);

      // Process European features
      europeanFeatures.forEach((feature, index) => {
        const countryNameRaw = feature.properties.name;
        const countryName = normalizeCountryName(countryNameRaw);
        console.log(`Processing GeoJSON feature ${index}: '${countryNameRaw}' (normalized: '${countryName}')`);

        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
          let polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;

          polygons.forEach((polygonCoords, polyIndex) => {
            console.log(`  Creating entity for '${countryNameRaw}' - Polygon ${polyIndex + 1}`);

            const positions = CesiumModule.Cartesian3.fromDegreesArray(polygonCoords[0].flat());

            const entity = new CesiumModule.Entity({
              name: `${countryNameRaw} - Part ${polyIndex + 1}`,
              polygon: {
                hierarchy: positions,
                material: new CesiumModule.ColorMaterialProperty(CesiumModule.Color.GRAY.withAlpha(0.2)), // Set initial material to gray
                outline: true,
                outlineColor: CesiumModule.Color.WHITE,
                outlineWidth: 2,
                height: 0,
                heightReference: CesiumModule.HeightReference.NONE,
                fill: true, // Ensure fill is enabled
              }
            });

            console.log(`  Adding entity '${countryNameRaw}' - Part ${polyIndex + 1} to viewer`);
            viewerRef.current.entities.add(entity);

            // Store the entity in countryEntities
            if (!countryEntities[countryName]) {
              countryEntities[countryName] = [];
            }
            countryEntities[countryName].push(entity);
          });
        } else {
          console.warn(`Feature ${index} ('${countryNameRaw}') is not a Polygon or MultiPolygon, it's a ${feature.geometry.type}`);
        }
      });

      console.log("All entities added. Total count:", viewerRef.current.entities.values.length);

      viewerRef.current.zoomTo(viewerRef.current.entities);

      console.log('GeoJSON loaded successfully');
      setCesiumReady(true);
      renderData();
    } catch (error) {
      console.error('Error loading GeoJSON:', error);
    }
  };

  // Function to normalize country names
  const normalizeCountryName = (name: string) => name.trim().toLowerCase();

  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        console.log('Viewer destroyed.');
      }
    };
  }, []);

  useEffect(() => {
    if (viewerRef.current && medeMapState.data && geocoordinates && !isLoading && Object.keys(medeMapState.selectedOptions).length > 0 && cesiumReady) {
      console.log('Rendering data...');
      renderData();
    }
  }, [viewerRef.current, medeMapState.data, geocoordinates, isLoading, medeMapState.selectedOptions, barSpacing, cesiumReady]);

  const { columnOptions, selectedOptions, data } = medeMapState;
  const [chartData, setChartData] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log('MedeMapState in Cesium:', medeMapState);
    processData();
  }, [medeMapState]);

  const getBarColor = (value: number, thresholds: any): string => {
    console.log('Determining color for value:', value, 'with thresholds:', thresholds);
    if (
      !thresholds ||
      thresholds.low_threshold == null ||
      thresholds.medium_threshold == null ||
      thresholds.high_threshold == null
    ) {
      console.warn('Thresholds not available or incomplete. Using gray color.');
      return 'gray'; // Default color when thresholds are not available
    }

    if (value <= thresholds.low_threshold) {
      return 'red';
    } else if (value <= thresholds.medium_threshold) {
      return 'green';
    } else {
      return 'blue';
    }
  };

  const processData = () => {
    if (
      Object.keys(selectedOptions).length === 0 ||
      Object.keys(data).length === 0
    ) {
      return;
    }

    const processedData = [];
    let currentProgress = 0;

    Object.entries(selectedOptions).forEach(
      ([tableName, columns], tableIndex) => {
        if (columns && columns.length > 0) {
          const tableData = data[tableName];
          if (!tableData) {
            console.error(`No data found for table: ${tableName}`);
            return;
          }

          // Create a mapping from indicator value to its thresholds
          const thresholdsMap: { [key: string]: any } = {};
          const tableColumnOptions = columnOptions[tableName];
          tableColumnOptions.forEach((option) => {
            thresholdsMap[option.value] = option.thresholds;
          });

          // Log the thresholds for this table
          console.log(`Thresholds for table '${tableName}':`, thresholdsMap);

          const chartDataForTable = tableData.map((row) => {
            const chartItem: any = { country: row.country };
            columns.forEach((column: any) => {
              const value = parseFloat(row[column.value]) || 0;
              chartItem[column.value] = value;
              const thresholds = thresholdsMap[column.value];
              chartItem[`${column.value}_color`] = getBarColor(value, thresholds);

              // Log value and thresholds for this country and column
              console.log(`Processing country '${row.country}', indicator '${column.value}':`);
              console.log(`  Value: ${value}`);
              console.log(`  Thresholds:`, thresholds);
              console.log(`  Assigned color: ${chartItem[`${column.value}_color`]}`);
            });
            return chartItem;
          });

          const columnsWithFullNames = columns.map((column: any) => ({
            ...column,
            thresholds: thresholdsMap[column.value]
          }));

          processedData.push({
            tableName,
            data: chartDataForTable,
            columns: columnsWithFullNames,
          });
        }
        currentProgress =
          ((tableIndex + 1) / Object.keys(selectedOptions).length) * 100;
        setProgress(currentProgress);
      }
    );

    // Log the entire processed chart data
    console.log('Processed chart data:', processedData);

    setChartData(processedData);
  };

  const renderData = () => {
    if (loading) {
      console.log('Loading geocoordinates...');
      return;
    }

    if (error) {
      console.error('Error loading geocoordinates:', error);
      return;
    }

    if (!viewerRef.current || !viewerRef.current.scene || !viewerRef.current.scene.globe) {
      console.error('Cesium viewer not ready');
      return;
    }

    console.log('Rendering data in Cesium...');
    console.log('Chart data:', chartData);

    // Remove existing entities except for country polygons
    viewerRef.current.entities.values.forEach(entity => {
      if (entity.polygon === undefined) {
        viewerRef.current.entities.remove(entity);
      }
    });

    chartData.forEach((tableData) => {
      const { data, columns } = tableData;

      data.forEach((item) => {
        if (item.country === 'metastat') return;

        const countryNameRaw = item.country;
        const countryName = normalizeCountryName(countryNameRaw);
        const countryEntityList = countryEntities[countryName];

        // Log the country name and check if entity exists
        console.log(`Processing country '${countryNameRaw}' (normalized: '${countryName}')`);
        if (!countryEntityList) {
          console.warn(`Country entity not found for country: '${countryNameRaw}'`);
          console.log('Available country entities:', Object.keys(countryEntities));
        } else {
          console.log(`Found entity for country: '${countryNameRaw}'`);
        }

        // Use the first column's value and thresholds
        const value = parseFloat(item[columns[0].value]) || 0;
        const thresholds = columns[0].thresholds;

        // Log the value and thresholds
        console.log(`  Indicator: '${columns[0].value}'`);
        console.log(`  Value: ${value}`);
        console.log(`  Thresholds:`, thresholds);

        const countryColorString = getBarColor(value, thresholds);
        console.log(`  Assigned color: ${countryColorString}`);

        const countryColor = CesiumModule.Color.fromCssColorString(countryColorString).withAlpha(1); // Set alpha to 1 for full opacity

        // Update the material of the country entities
        if (countryEntityList) {
          countryEntityList.forEach((entity) => {
            console.log(`  Updating material for '${countryNameRaw}'`);
            entity.polygon.material = new CesiumModule.ColorMaterialProperty(countryColor);
          });
        }
      });
    });

    console.log('Total entities after rendering:', viewerRef.current.entities.values.length);
    // Set the camera to view all entities
    viewerRef.current.zoomTo(viewerRef.current.entities);
  };

  const getCountryCoordinates = (countryName: string) => {
    if (!geocoordinates) return null;
    const country = geocoordinates.find(coord => coord.country === countryName);
    if (country && country.latitude && country.longitude) {
      return {
        latitude: parseFloat(country.latitude),
        longitude: parseFloat(country.longitude)
      };
    }
    return null;
  };

  const handleBarSpacingChange = (_: Event, newValue: number | number[]) => {
    setBarSpacing(newValue as number);
    renderData();
  };

  const updateLogoBanner = () => {
    if (!viewerRef.current || !showLogo) return;

    if (logoBillboard) {
      viewerRef.current.scene.primitives.remove(logoBillboard);
    }

    const billboards = new CesiumModule.BillboardCollection();
    const newLogoBillboard = billboards.add({
      image: '/images/MeDeMA_logo.png',
      position: CesiumModule.Cartesian3.fromDegrees(0, 0, 10000000),
      horizontalOrigin: CesiumModule.HorizontalOrigin.LEFT,
      verticalOrigin: CesiumModule.VerticalOrigin.TOP,
      scale: 0.5,
      pixelOffset: new CesiumModule.Cartesian2(logoPosition.x, logoPosition.y),
    });

    viewerRef.current.scene.primitives.add(billboards);
    setLogoBillboard(newLogoBillboard);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {(isLoading || !cesiumReady) && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          style={{ transform: 'translate(-50%, -50%)' }}
          zIndex={999}
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      )}
      <div ref={cesiumContainerRef} className="cesiumContainer cesium-container" />
      <Legend
        selectedOptions={medeMapState.selectedOptions}
        columnOptions={medeMapState.columnOptions}
        className="cesium-legend"
        style={{ position: 'absolute', bottom: '210px', right: '180px' }}
      />
      <Box className="cesium-bar-spacing-control">
        <Typography gutterBottom>Bar Spacing</Typography>
        <Slider
          value={barSpacing}
          onChange={(_, newValue) => setBarSpacing(newValue as number)}
          onChangeCommitted={handleBarSpacingChange}
          min={0.01}
          max={0.6}
          step={0.01}
          valueLabelDisplay="auto"
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={renderData}
        style={{
          position: 'absolute',
          bottom: '70px',
          right: '180px',
          zIndex: 1000,
        }}
      >
        Refresh View
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowLogo(!showLogo)}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        {showLogo ? 'Hide Logo' : 'Show Logo'}
      </Button>
    </div>
  );
};

export default Cesium;