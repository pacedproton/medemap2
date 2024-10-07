'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as CesiumModule from 'cesium';
import { Carthographic, Math as CesiumMath } from 'cesium';
import 'cesium/Source/Widgets/widgets.css';
import '../styles/cesium-pico.css';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { selectMedeMapData } from '../../lib/features/medemap/medeMapSlice';
import { setLoading, selectIsLoading } from '../../lib/loadingSlice';
import Legend from './Legend3DView';
import { CircularProgress, Box, Slider, Typography, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGlobeData, selectGlobeData, selectGlobeDataLoading, selectGlobeDataError } from '../../lib/features/globeData/geocordDataSlice';
import { debounce } from 'lodash';
import { RootState } from '@/lib/store';
import { selectShowDataLabels, selectDataLabelFontSize } from '../../lib/features/settings/settingsSlice';

const europeanCountries = [
  'Austria', 'Belgium',
  'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
  'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy',
  'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta',
  'Monaco', 'Netherlands',
  'Poland', 'Portugal', 'Romania',  'Slovakia',
  'Slovenia', 'Spain', 'Sweden', 
];

const Cesium = () => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumModule.Viewer | null>(null);
  const dispatch = useAppDispatch();
  const medeMapState = useAppSelector(selectMedeMapData);
  const isLoading = useAppSelector(selectIsLoading);
  const showDataLabels = useAppSelector(selectShowDataLabels);
  const dataLabelFontSize = useAppSelector(selectDataLabelFontSize);
  const [viewerReady, setViewerReady] = useState(false);
  const geocoordinates = useSelector((state: RootState) => state.globeData.data) || [];
  const loading = useSelector((state: RootState) => state.globeData.loading) || false;
  const error = useSelector((state: RootState) => state.globeData.error) || null;
  const [barSpacing, setBarSpacing] = useState<number>(0.4);
  const [cesiumReady, setCesiumReady] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
const [logoPosition, setLogoPosition] = useState({ x: 20, y: 20 });
const [logoBillboard, setLogoBillboard] = useState<CesiumModule.Billboard | null>(null);
const [overallProgress, setOverallProgress] = useState(0);
const [initializationComplete, setInitializationComplete] = useState(false);

  CesiumModule.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMjMxYjcwMy1hMjNkLTQxZDUtYWIxOC02OTNjYmVkNDU4N2IiLCJpZCI6MjE2Mjk4LCJpYXQiOjE3MTYxNjkyMTZ9.86BVJNgm1h9moupjI2gNSQWc-bVSFflbjScbcXIT_6A';

  useEffect(() => {
    console.log('Initializing Cesium...');
    dispatch(setLoading(true));
    setOverallProgress(0);
    if (cesiumContainerRef.current && !viewerRef.current) {
      initCesium();
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchGlobeData());
  }, [dispatch]);

  const initCesium = async () => {
    setOverallProgress(5);
    if (cesiumContainerRef.current && !viewerRef.current) {
      console.log('Creating Cesium viewer...');
      dispatch(setLoading(true));
      CesiumModule.buildModuleUrl.setBaseUrl('/Cesium/');

      try {
        setOverallProgress(10);
        // Create the viewer with default imagery provider
        viewerRef.current = new CesiumModule.Viewer(cesiumContainerRef.current, {
          baseLayerPicker: true,
          geocoder: false,
          homeButton: true,
          infoBox: false,
          navigationHelpButton: true,
          sceneModePicker: true,
          imageryProviderViewModels: [
            new CesiumModule.ProviderViewModel({
              name: 'Blue Marble',
              iconUrl: CesiumModule.buildModuleUrl('Widgets/Images/ImageryProviders/blueMarble.png'),
              tooltip: 'Blue Marble Next Generation July, 2004',
              creationFunction: () => {
                return CesiumModule.IonImageryProvider.fromAssetId(3845);
              }
            })
          ],
          selectedImageryProviderViewModel: new CesiumModule.ProviderViewModel({
            name: 'Blue Marble',
            iconUrl: CesiumModule.buildModuleUrl('Widgets/Images/ImageryProviders/blueMarble.png'),
            tooltip: 'Blue Marble Next Generation July, 2004',
            creationFunction: () => {
              return CesiumModule.IonImageryProvider.fromAssetId(3845);
            }
          }),
          sceneMode: CesiumModule.SceneMode.SCENE3D,
        });
        console.log('Viewer initialized.');

        setOverallProgress(30);
        // Add additional layers to the base layer picker
        const imageryLayers = viewerRef.current.baseLayerPicker.viewModel.imageryProviderViewModels;
        imageryLayers.push(new CesiumModule.ProviderViewModel({
          name: 'Earth at Night',
          iconUrl: CesiumModule.buildModuleUrl('Widgets/Images/ImageryProviders/earthAtNight.png'),
          tooltip: 'Earth at Night',
          creationFunction: () => {
            return CesiumModule.IonImageryProvider.fromAssetId(3812);
          }
        }));

        setOverallProgress(50);
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
        setOverallProgress(70);
        await loadGeoJson();
        setOverallProgress(90);
        await renderData(); // Ensure renderData is called after initialization and wait for it to complete
        setInitializationComplete(true);

        const handleLogoDrag = (event: React.DragEvent<HTMLImageElement>) => {
          const newX = event.clientX;
          const newY = event.clientY;
          setLogoPosition({ x: newX, y: newY });
        };

        const handler = new CesiumModule.ScreenSpaceEventHandler(viewerRef.current.scene.canvas);
        handler.setInputAction((movement: any) => {
          const pickedObject = viewerRef.current?.scene.pick(movement.position);
          if (CesiumModule.defined(pickedObject) && pickedObject.primitive === logoBillboard) {
            const cartesian = viewerRef.current?.camera.pickEllipsoid(movement.position);
            if (cartesian) {
              const cartographic = CesiumMath.Cartographic.fromCartesian(cartesian);
              const longitude = CesiumMath.Math.toDegrees(
                cartographic.longitude
              );
              const latitude = CesiumMath.Math.toDegrees(cartographic.latitude);
              setLogoPosition({ x: longitude, y: latitude });
            }
          }
        }, CesiumModule.ScreenSpaceEventType.LEFT_CLICK);

      } catch (error) {
        console.error('Error initializing Cesium:', error);
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  useEffect(() => {
    if (viewerRef.current && cesiumReady) {
      updateLogoBanner();
    }
  }, [showLogo, logoPosition, cesiumReady]);

  const loadGeoJson = async () => {
    if (!viewerRef.current) return;

    try {
      setOverallProgress(45);
      const geoJsonResponse = await fetch('/geojson/countries.geo.json');
      const geoJsonData = await geoJsonResponse.json();
      console.log('Total features:', geoJsonData.features.length);

      setOverallProgress(50);
      // Filter for European countries
      const europeanFeatures = geoJsonData.features.filter(feature => 
        europeanCountries.includes(feature.properties.name)
      );
      console.log('European features:', europeanFeatures.length);

      setOverallProgress(55);
      // Process European features
      europeanFeatures.forEach((feature, index) => {
        const countryName = feature.properties.name;
        console.log(`Processing feature ${index}: ${countryName}`);

        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
          let polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
          
          polygons.forEach((polygonCoords, polyIndex) => {
            console.log(`Creating entity for ${countryName} - Polygon ${polyIndex + 1}`);
            
            const positions = CesiumModule.Cartesian3.fromDegreesArray(polygonCoords[0].flat());
            
            const entity = new CesiumModule.Entity({
              name: `${countryName} - Part ${polyIndex + 1}`,
              polygon: {
                hierarchy: positions,
                material: CesiumModule.Color.fromRandom({alpha: 0.05}),
                outline: true,
                outlineColor: CesiumModule.Color.WHITE,
                outlineWidth: 2,
                height: 0,
                heightReference: CesiumModule.HeightReference.NONE
              }
            });

            console.log(`Adding entity ${countryName} - Part ${polyIndex + 1} to viewer`);
            viewerRef.current.entities.add(entity);
          });
        } else {
          console.warn(`Feature ${index} (${countryName}) is not a Polygon or MultiPolygon, it's a ${feature.geometry.type}`);
        }
      });

      console.log("All entities added. Total count:", viewerRef.current.entities.values.length);

      viewerRef.current.zoomTo(viewerRef.current.entities);

      console.log('GeoJSON and billboard loaded successfully');
      setOverallProgress(65);
      setCesiumReady(true);
    } catch (error) {
      console.error('Error loading GeoJSON or adding billboard:', error);
    }
  };

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
  }, [viewerRef.current, medeMapState.data, geocoordinates, isLoading, medeMapState.selectedOptions, barSpacing, cesiumReady, showDataLabels, dataLabelFontSize]);

  useEffect(() => {
    if (viewerRef.current && showDataLabels) {
      viewerRef.current.entities.values.forEach((entity) => {
        if (entity.label) {
          entity.label.font = new CesiumModule.ConstantProperty(`${dataLabelFontSize}pt monospace`);
        }
      });
    }
  }, [dataLabelFontSize, showDataLabels]);

  const renderData = () => {
    console.log('renderData called');
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
    console.log('Selected options in Cesium:', medeMapState.selectedOptions);
    console.log('Data in Cesium:', medeMapState.data);

    // Log detailed information about selected options
    Object.entries(medeMapState.selectedOptions).forEach(([table, columns]) => {
      console.log(`Table: ${table}`);
      console.log(`Selected columns:`, columns);
      if (medeMapState.data[table]) {
        console.log(`Sample data:`, medeMapState.data[table][0]);
      } else {
        console.log(`No data found for table: ${table}`);
      }
    });

    // Remove existing entities except for country polygons
    viewerRef.current.entities.values.forEach(entity => {
      if (entity.polygon === undefined) {
        viewerRef.current.entities.remove(entity);
      }
    });

    const selectedOptions = medeMapState.selectedOptions;
    const data = medeMapState.data;

    // Find the maximum value for each selected option to normalize the data
    const maxValues = {};
    Object.entries(selectedOptions).forEach(([table, columns]) => {
      columns.forEach(column => {
        if (data[table]) {
          maxValues[column.value] = Math.max(...data[table].map(item => parseFloat(item[column.value]) || 0));
          console.log(`Max value for ${table}.${column.value}:`, maxValues[column.value]);
        } else {
          console.error(`No data found for table: ${table}`);
        }
      });
    });

    const totalColumns = Object.values(selectedOptions).flat().length;
    console.log('Total columns to render:', totalColumns);
    const angleStep = (2 * Math.PI) / totalColumns;

    setOverallProgress(75);

    Object.entries(selectedOptions).forEach(([table, columns], tableIndex) => {
      if (!data[table]) {
        console.error(`No data found for table: ${table}`);
        return;
      }

      data[table].forEach((item, itemIndex) => {
        if (item.country === 'metastat') {
          console.log('Skipping metastat dummy country');
          return;
        }

        const coordinates = getCountryCoordinates(item.country);
        
        if (coordinates) {
          const { latitude, longitude } = coordinates;
          
          columns.forEach((column, columnIndex) => {
            const value = parseFloat(item[column.value]) || 0;
            const normalizedValue = value / maxValues[column.value];
            const height = normalizedValue * 500000; // Max height of 500km

            const angle = (tableIndex * columns.length + columnIndex) * angleStep;
            const offsetDistance = barSpacing;
            const offsetLon = longitude + Math.cos(angle) * offsetDistance;
            const offsetLat = latitude + Math.sin(angle) * offsetDistance;

            const position = CesiumModule.Cartesian3.fromDegrees(offsetLon, offsetLat, height / 2);

            console.log(`Adding entity for ${item.country}: ${table}.${column.value} = ${value}`);
            const entity = viewerRef.current.entities.add({
              position: position,
              cylinder: {
                length: height,
                topRadius: 20000,
                bottomRadius: 20000,
                material: CesiumModule.Color.fromHsl((tableIndex * columns.length + columnIndex) / totalColumns, 1, 0.5, 0.8),
                outline: false, // Set this to false to remove the outline
              },
              label: showDataLabels ? {
                text: `${Math.ceil(value)}`,
                font: `${dataLabelFontSize}pt monospace`,
                style: CesiumModule.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: CesiumModule.VerticalOrigin.TOP + 100,
                pixelOffset: new CesiumModule.Cartesian2(0, 5),
                fillColor: CesiumModule.Color.WHITE,
                outlineColor: CesiumModule.Color.BLACK,
                show: true,
              } : undefined,
            });
          });
        } else {
          console.warn(`Coordinates not found for country: ${item.country}`);
        }
      });
      const progress = 75 + (24 * (tableIndex + 1) / Object.keys(selectedOptions).length);
      setOverallProgress(Math.min(progress, 99));
    });

    console.log('Total entities added:', viewerRef.current.entities.values.length);
    // Set the camera to view all entities
    viewerRef.current.zoomTo(viewerRef.current.entities).then(() => {
      setOverallProgress(100);
      setInitializationComplete(true);
    });
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
      {(isLoading || overallProgress < 100 || !initializationComplete) && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          style={{ transform: 'translate(-50%, -50%)' }}
          zIndex={999}
        >
          <CircularProgress 
            size={60} 
            thickness={4} 
            variant="determinate" 
            value={overallProgress} 
          />
          <Typography variant="caption" component="div" color="text.secondary">
            {`${Math.round(overallProgress)}%`}
          </Typography>
        </Box>
      )}
      <div ref={cesiumContainerRef} className="cesiumContainer cesium-container" />
      <Legend selectedOptions={medeMapState.selectedOptions} className="cesium-legend" style={{ position: 'absolute', bottom: '210px', right: '180px' }} />
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

    </div>
  );
}

export default Cesium;