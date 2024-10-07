'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../lib/hooks';
import { selectMedeMapData } from '../../lib/features/medemap/medeMapSlice';
import { Box, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import styles from "./styles.module.css";
import { log, logVerbose } from '../../lib/clientlogging';
import { useTranslation } from 'react-i18next';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

/**
 * Interface representing a column in the data
 */
interface Column {
  label: string;
  value: string;
}

/**
 * Interface representing the processed data for the 3D mesh plot
 */
interface ProcessedData {
  countries: string[];
  indicators: string[];
  zValues: number[][];
}

/**
 * ThreeDMeshView Component
 * 
 * This component renders a 3D surface mesh view of selected indicators across countries.
 * It processes the data from the MedeMap state and visualizes it using Plotly.
 */
const ThreeDMeshView: React.FC = () => {
  const { t } = useTranslation();
  const medeMapState = useAppSelector(selectMedeMapData);
  const [plotData, setPlotData] = useState<ProcessedData[]>([]);

  // Effect to process data when MedeMap state changes
  useEffect(() => {
    log("Rendering 3D Mesh View");
    logVerbose('3d-mesh', "MedeMapState in 3D Mesh View:", medeMapState);
    logVerbose('3d-mesh', "Selected options in 3D Mesh View:", medeMapState.selectedOptions);
    logVerbose('3d-mesh', "Data in 3D Mesh View:", medeMapState.data);
    processData();
  }, [medeMapState]);

  // Effect to log processed plot data
  useEffect(() => {
    if (plotData.length > 0) {
      logVerbose('3d-mesh', "Countries being plotted:", plotData[0].countries);
      logVerbose('3d-mesh', "Indicators being plotted:", plotData[0].indicators);
      logVerbose('3d-mesh', "Z-values being plotted:", plotData[0].zValues);
    }
  }, [plotData]);

  /**
   * Processes the raw data from MedeMap state into a format suitable for 3D mesh plotting
   */
  const processData = () => {
    log("Processing data for 3D Mesh");
    const { data, selectedOptions, columnOptions } = medeMapState;

    if (Object.keys(selectedOptions).length === 0 || Object.keys(data).length === 0) {
      log('No data or options selected for 3D Mesh. Skipping processing.', 'warn');
      return;
    }

    const allCountries = new Set<string>();
    const indicators: string[] = [];
    const zValues: Record<string, Record<string, number>> = {};

    // Collect all unique countries
    Object.entries(data).forEach(([_, tableData]) => {
      if (Array.isArray(tableData)) {
        tableData.forEach(row => allCountries.add(row.country));
      }
    });

    logVerbose('3d-mesh', "All countries after initial processing:", Array.from(allCountries));

    // Process selected options and data
    Object.entries(selectedOptions).forEach(([tableName, columns]) => {
      logVerbose('3d-mesh', `Processing table for 3D Mesh: ${tableName}`);
      if (Array.isArray(columns) && columns.length > 0) {
        const tableData = data[tableName];
        if (!Array.isArray(tableData)) {
          log(`No valid data found for table in 3D Mesh: ${tableName}`, 'error');
          return;
        }

        (columns as Column[]).forEach((column: Column) => {
          const columnOption = columnOptions[tableName].find(opt => opt.value === column.value);
          const indicatorName = columnOption?.thresholds?.indicator || t(columnOption?.label || column.label);
          indicators.push(indicatorName);
          zValues[indicatorName] = {};
          tableData.forEach(row => {
            const value = parseFloat(row[column.value]);
            if (!isNaN(value) && value !== 0) {
              zValues[indicatorName][row.country] = value;
            }
          });
        });
      }
    });

    // Prepare final data for plotting
    const sortedCountries = Array.from(allCountries).sort();
    logVerbose('3d-mesh', "Sorted countries:", sortedCountries);
    const processedZValues = indicators.map(indicator => 
      sortedCountries.map(country => zValues[indicator][country])
    );

    const processedData: ProcessedData = {
      countries: sortedCountries,
      indicators,
      zValues: processedZValues,
    };

    logVerbose('3d-mesh', "Processed Data for 3D Mesh:", processedData);
    setPlotData([processedData]);
  };

  return (
    <Box className={styles.container}>
      {plotData.length === 0 && <Typography>{t('No data to display. Please select some options.')}</Typography>}
      
      {plotData.length > 0 && (
        <Box className={styles.chartContainer}>
          <Plot
            data={[
              {
                type: 'surface',
                x: plotData[0].countries,
                y: plotData[0].indicators,
                z: plotData[0].zValues,
                colorscale: [
                  [0, 'rgb(255,0,0)'],
                  [1, 'rgb(0,255,0)']
                ],
                connectgaps: false,
                hovertemplate: 
                  t('Country') + ': %{x}<br>' +
                  t('Indicator') + ': %{y}<br>' +
                  t('Value') + ': %{z}<extra></extra>',
                showscale: true,
              },
            ]}
            layout={{
              width: 1400,
              height: 800,
              autosize: true,
              scene: {
                xaxis: { 
                  title: t('Country'),
                  tickangle: 0,
                  tickfont: { size: 8 },
                  nticks: plotData[0].countries.length,
                  autorange: true,
                },
                yaxis: { 
                  title: t('Indicator'), 
                  tickangle: 0,
                  tickfont: { size: 8 },
                  tickmode: 'array',
                  tickvals: plotData[0].indicators.map((_, i) => i),
                  ticktext: plotData[0].indicators,
                  autorange: true,
                },
                zaxis: { title: t('Normalized Indicator') },
                camera: { eye: { x: 2, y: 2, z: 1.5 } },
              },
              margin: {
                l: 50,
                r: 50,
                b: 50,
                t: 50,
                pad: 4
              },
              title: t('3D Surface Mesh View of Selected Indicators'),
            }}
            config={{
              displayModeBar: true,
              scrollZoom: true,
              displaylogo: false,
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ThreeDMeshView;