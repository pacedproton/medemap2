'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../lib/hooks';
import { selectMedeMapData } from '../../lib/features/medemap/medeMapSlice';
import { Box, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import styles from "./StackedBarView.module.css";
import { log, logVerbose } from '../../lib/clientlogging';
import { useDispatch } from 'react-redux';
import { fetchMedeMapData } from '../../lib/features/medemap/medeMapSlice';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface ProcessedData {
  countries: string[];
  indicators: string[];
  values: number[][];
}

const StackedBarView: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const medeMapState = useAppSelector(selectMedeMapData);
  const [plotData, setPlotData] = useState<ProcessedData | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    log("Rendering Stacked Bar View");
    logVerbose('stacked-bar', "MedeMapState in Stacked Bar View:", medeMapState);

    if (Object.keys(medeMapState.data).length === 0) {
      dispatch(fetchMedeMapData());
    } else {
      processData();
    }
  }, [medeMapState, dispatch]);

  const processData = () => {
    log("Processing data for Stacked Bar");
    const { data, columnOptions } = medeMapState;

    if (Object.keys(data).length === 0) {
      log('No data available for Stacked Bar. Skipping processing.', 'warn');
      return;
    }

    const countries = new Set<string>();
    const indicators: string[] = [];
    const values: { [country: string]: { [indicator: string]: number } } = {};

    Object.entries(data).forEach(([tableName, tableData]) => {
      if (tableName !== 'basic_data' && Array.isArray(tableData) && tableData.length > 0) {
        const columns = Object.keys(tableData[0]).filter(key =>
          !key.startsWith('meta_') &&
          key !== 'country' &&
          !key.match(/^year(_\d{4})?$/)
        );

        columns.forEach(column => {
          const columnOption = columnOptions[tableName].find(opt => opt.value === column);
          const indicatorName = columnOption?.thresholds?.indicator || t(columnOption?.label || column);
          indicators.push(indicatorName);

          tableData.forEach(row => {
            const country = row.country;
            countries.add(country);
            if (!values[country]) values[country] = {};
            const value = parseFloat(row[column]);
            values[country][indicatorName] = isNaN(value) ? 0 : Math.max(0, value);
          });
        });
      }
    });

    const sortedCountries = Array.from(countries).sort();
    const processedValues = indicators.map(indicator =>
      sortedCountries.map(country => values[country][indicator] || 0)
    );

    setPlotData({
      countries: sortedCountries,
      indicators,
      values: processedValues,
    });
  };

  const createCircularBarData = () => {
    if (!plotData) return null;

    const totalValues = plotData.values.reduce((acc, curr) => acc.map((sum, i) => sum + curr[i]));
    const normalizedValues = totalValues.map(value => value / Math.max(...totalValues));

    return {
      type: 'barpolar',
      r: normalizedValues,
      theta: plotData.countries,
      name: t('Country Totals'),
      marker: { color: normalizedValues, colorscale: 'Viridis' },
      hovertemplate: '%{theta}: %{r:.2f}<extra></extra>'
    };
  };

  const createCircularStackedBarData = () => {
    if (!plotData) return [];

    if (selectedIndicator) {
      const index = plotData.indicators.indexOf(selectedIndicator);
      return [{
        type: 'barpolar',
        r: plotData.values[index],
        theta: plotData.countries,
        name: selectedIndicator,
        marker: { color: `hsl(${(index * 360) / plotData.indicators.length}, 70%, 50%)` }
      }];
    }

    return plotData.indicators.map((indicator, index) => ({
      type: 'barpolar',
      r: plotData.values[index],
      theta: plotData.countries,
      name: indicator,
      marker: { color: `hsl(${(index * 360) / plotData.indicators.length}, 70%, 50%)` }
    }));
  };

  const handleLegendClick = (event: any) => {
    if (event.event.target.classList.contains('legendtext')) {
      const clickedIndicator = event.event.target.textContent;
      setSelectedIndicator(prevIndicator => 
        prevIndicator === clickedIndicator ? null : clickedIndicator
      );
    }
  };

  const navigateToCorrelationMatrix = () => {
    router.push('/view_correlation_matrix');
  };

  return (
    <Box className={styles.container}>
      {!plotData && <Typography className={styles.noDataText}>{t('No data to display. Please wait for data to load.')}</Typography>}

      {plotData && (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={navigateToCorrelationMatrix}
            className={styles.resetButton}
          >
            {t('Note Indicator Correlations')}
          </Button>
          <Box className={styles.chartContainer}>
            <Plot
              data={[createCircularBarData()]}
              layout={{
                width: 1000,
                height: 1000,
                title: t('Circular Bar Plot of Country Totals'),
                polar: {
                  radialaxis: { visible: true },
                  angularaxis: { direction: "clockwise" }
                },
              }}
              config={{
                displayModeBar: true,
                scrollZoom: true,
                displaylogo: false,
                responsive: true,
              }}
              className={styles.plot}
            />
          </Box>
          <Box className={styles.chartContainer}>
            <Plot
              data={createCircularStackedBarData()}
              layout={{
                width: 1000,
                height: 1000,
                title: t('Circular Stacked Bar Plot of Indicators by Country'),
                polar: {
                  barmode: 'stack',
                  radialaxis: { visible: true },
                  angularaxis: { direction: "clockwise" }
                },
                legend: {
                  title: { text: t('Click to filter') },
                  itemclick: 'toggleothers'
                }
              }}
              config={{
                displayModeBar: true,
                scrollZoom: false,
                displaylogo: false,
                responsive: true,
              }}
              className={styles.plot}
              onClick={handleLegendClick}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default StackedBarView;