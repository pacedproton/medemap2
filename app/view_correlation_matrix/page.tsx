'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import { selectMedeMapData, fetchMedeMapData } from '../../lib/features/medemap/medeMapSlice';
import { Box, Typography, Paper } from '@mui/material';
import dynamic from 'next/dynamic';
import styles from "./CorrelationMatrixView.module.css";
import { log, logVerbose } from '../../lib/clientlogging';
import { useTranslation } from 'react-i18next';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface CorrelationData {
  labels: string[];
  correlationMatrix: number[][];
}

const CorrelationMatrixView: React.FC = () => {
  const { t } = useTranslation();
  const medeMapState = useAppSelector(selectMedeMapData);
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    log("Rendering Correlation Matrix View");
    logVerbose('correlation-matrix', "MedeMapState in Correlation Matrix View:", medeMapState);

    if (Object.keys(medeMapState.data).length === 0) {
      dispatch(fetchMedeMapData());
    } else {
      processData();
    }
  }, [medeMapState, dispatch]);

  const processData = () => {
    setIsLoading(true);
    log("Processing data for Correlation Matrix");
    const { data, columnOptions } = medeMapState;

    if (Object.keys(data).length === 0) {
      log('No data available for Correlation Matrix. Skipping processing.', 'warn');
      setIsLoading(false);
      return;
    }

    const allIndicators: { [key: string]: number[] } = {};
    const labels: string[] = [];

    Object.entries(data).forEach(([tableName, tableData]) => {
      if (Array.isArray(tableData) && tableData.length > 0) {
        const columns = Object.keys(tableData[0]).filter(key =>
          !['country', 'year'].includes(key) && !key.startsWith('meta_')
        );

        columns.forEach(column => {
          const columnOption = columnOptions[tableName].find(opt => opt.value === column);
          const indicatorName = columnOption?.thresholds?.indicator || t(columnOption?.label || column);
          labels.push(indicatorName);
          allIndicators[indicatorName] = tableData
            .map(item => parseFloat(item[column]) || 0)
            .filter(value => !isNaN(value));
        });
      }
    });

    const correlationMatrix = calculateCorrelationMatrix(allIndicators);
    setCorrelationData({ labels, correlationMatrix });
    setTimeout(() => setIsLoading(false), 100);
  };

  const calculateCorrelationMatrix = (indicators: { [key: string]: number[] }) => {
    const keys = Object.keys(indicators);
    const matrix = keys.map(() => new Array(keys.length).fill(0));

    for (let i = 0; i < keys.length; i++) {
      for (let j = i; j < keys.length; j++) {
        const correlation = calculateCorrelation(indicators[keys[i]], indicators[keys[j]]);
        matrix[i][j] = correlation;
        matrix[j][i] = correlation;
      }
    }

    return matrix;
  };

  const calculateCorrelation = (x: number[], y: number[]) => {
    const n = Math.min(x.length, y.length);
    let sum_x = 0, sum_y = 0, sum_xy = 0, sum_x2 = 0, sum_y2 = 0;

    for (let i = 0; i < n; i++) {
      sum_x += x[i];
      sum_y += y[i];
      sum_xy += x[i] * y[i];
      sum_x2 += x[i] * x[i];
      sum_y2 += y[i] * y[i];
    }

    const numerator = n * sum_xy - sum_x * sum_y;
    const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h6" gutterBottom>{t('Correlation Matrix')}</Typography>

      {isLoading && (
        <Box className={styles.loadingContainer}>
          <Typography>{t('Loading data, please wait...')}</Typography>
        </Box>
      )}

      {!isLoading && !correlationData && (
        <Typography>{t('No data to display. Please select some options.')}</Typography>
      )}

      {!isLoading && correlationData && (
        <Paper
          elevation={3}
          className={styles.chartContainer}
          sx={{ opacity: 1, transition: 'opacity 0.5s ease-in' }}
        >
          <Plot
            data={[
              {
                z: correlationData.correlationMatrix,
                x: correlationData.labels,
                y: correlationData.labels,
                type: 'heatmap',
                colorscale: 'RdBu',
                zmin: -1,
                zmax: 1,
                hoverongaps: false,
              },
            ]}
            layout={{
              width: 1200,
              height: 1200,
              title: t('Cross-Correlation Matrix of All Indicators'),
              xaxis: {
                tickangle: -45,
                automargin: true,
              },
              yaxis: {
                automargin: true,
              },
            }}
            config={{
              displayModeBar: true,
              scrollZoom: false,
              displaylogo: false,
              responsive: true,
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default CorrelationMatrixView;