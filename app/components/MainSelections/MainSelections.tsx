// app/components/MainSelections/MainSelections.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select, { MultiValue } from 'react-select';
import { Box, Button, Typography, Grid, Paper, Chip, Modal, LinearProgress } from '@mui/material';
import Joyride, { CallBackProps, EVENTS, STATUS } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import {
  fetchMedeMapData,
  setSelectedOptions,
  selectMedeMapData,
  selectMedeMapLoading,
  selectMedeMapError
} from '../../../lib/features/medemap/medeMapSlice';
import { selectRunTutorial, setRunTutorial } from '../../../lib/features/tutorial/tutorialSlice';
import { AppDispatch } from '../../../lib/store';
import styles from './MainSelections.module.css';
import SplashScreen from '../SplashScreen';

interface Thresholds {
  eu_average: number | null;
  eu_standard_deviation: number | null;
  high_medium_threshold: number | null;
  medium_low_threshold: number | null;
  year_of_validity: number | null;
  indicator: string | null;
  source: string | null;
  original_name: string | null;
}

interface ColumnOption {
  value: string;
  label: string;
  thresholds?: Thresholds | null;
}

const MainSelections = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const medeMapState = useSelector(selectMedeMapData);
  const loading = useSelector(selectMedeMapLoading);
  const error = useSelector(selectMedeMapError);
  const [localSelectedOptions, setLocalSelectedOptions] = useState<{ [key: string]: ColumnOption[] }>({});
  const [feedback, setFeedback] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const runTutorial = useSelector(selectRunTutorial);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSplashScreen, setShowSplashScreen] = useState(() => {
    return localStorage.getItem('splashScreenShown') !== 'true';
  });

  const tableOrder = [
    'basic_data',
    'democracy',
    'legal_framework_human_dignity',
    'legal_framework_freedom',
    'legal_framework_pluralism',
    'legal_framework_equality',
    'legal_framework_rule_of_law',
    'supply_side',
    'demand_side_media_use',
    'demand_side_trust_in_media'
  ];

  const steps = [
    {
      target: '.data-selection-title',
      content: t('Quickstart: Select 1-3 indicators to process'),
      disableBeacon: true,
    },
    {
      target: '.select-box',
      content: t('Each category group contains multiple indicators'),
    },
    {
      target: '.submit-button',
      content: t('Press Submit to process the selected indicators'),
    },
    {
      target: '.selected-options',
      content: t('The selected indicators will appear here'),
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setShowTutorial(false);
      dispatch(setRunTutorial(false));
    }
  };

  const handleSplashScreenFinished = () => {
    setShowSplashScreen(false);
    localStorage.setItem('splashScreenShown', 'true');
  };

  useEffect(() => {
    const tutorialShown = localStorage.getItem('tutorialShown');
    if (!tutorialShown) {
      setShowTutorial(true);
      dispatch(setRunTutorial(true));
      localStorage.setItem('tutorialShown', 'true');
    }
  }, [dispatch]);

  useEffect(() => {
    if (!medeMapState.data || Object.keys(medeMapState.data).length === 0) {
      console.log('Fetching MedeMap data...');
      setShowProgress(true);
      dispatch(fetchMedeMapData());

      setTimeout(() => {
        setShowProgress(false);
      }, 2000);
    } else {
      console.log('MedeMap data already loaded:', medeMapState);
    }

    const savedSelections = localStorage.getItem('selectedOptions');
    if (savedSelections) {
      const parsedSelections = JSON.parse(savedSelections);
      setLocalSelectedOptions(parsedSelections);
      dispatch(setSelectedOptions(parsedSelections));
    }
  }, [dispatch, medeMapState.data]);

  useEffect(() => {
    console.log('MedeMap state updated:', medeMapState);
  }, [medeMapState]);

  useEffect(() => {
    if (runTutorial) {
      setShowTutorial(true);
      console.log('Starting tutorial...');
    }
  }, [runTutorial]);

  const handleOptionChange = (tableName: string, selectedOptions: MultiValue<ColumnOption>) => {
    console.log('Selected options in handleOptionChange:', selectedOptions);

    const currentTotal = Object.values(localSelectedOptions).flat().length;
    const newTotal = currentTotal - (localSelectedOptions[tableName]?.length || 0) + selectedOptions.length;

    if (newTotal > 3) {
      setIsModalOpen(true);
      return;
    }

    const updatedSelections = {
      ...localSelectedOptions,
      [tableName]: selectedOptions as ColumnOption[],
    };
    setLocalSelectedOptions(updatedSelections);

    // Update Redux state
    dispatch(setSelectedOptions(updatedSelections));

    // Update local storage
    localStorage.setItem('selectedOptions', JSON.stringify(updatedSelections));

    const selectedCount = Object.values(updatedSelections).flat().length;
    setFeedback(`Selected ${selectedCount} indicators for processing.`);
  };

  const handleSubmit = () => {
    const selectedCount = Object.values(localSelectedOptions).flat().length;
    setFeedback(`Explicitly submitted ${selectedCount} indicators for processing.`);
  };

  const createSelectBox = (tableName: string, options: ColumnOption[]) => {
    let filteredOptions = options.filter(option => !['year', 'country'].includes(option.value));
    if (tableName === 'basic_data') {
      const allowedColumns = ['population', 'area', 'gdp', 'gdp_per_capita', 'meps_2020', 'meps_2024', 'hdi_2023_udi'];
      filteredOptions = filteredOptions.filter(option => allowedColumns.includes(option.value));
    }

    // Map over the filtered options to include the 'thresholds' and update the 'label'
    filteredOptions = filteredOptions.map(option => {
      const newOption = {
        ...option,
        label: option.thresholds?.indicator || option.label,
      };
      return newOption;
    });

    return (
      <Box width="100%" marginBottom={2} key={tableName}>
        <Typography variant="body1" marginBottom={1}>
          {(() => {
            switch (tableName) {
              case 'basic_data': return 'Basic Data';
              case 'democracy': return 'Democracy & Participation';
              case 'legal_framework_human_dignity': return 'Legal Framework: Human Dignity';
              case 'legal_framework_freedom': return 'Legal Framework: Freedom';
              case 'legal_framework_pluralism': return 'Legal Framework: Pluralism';
              case 'legal_framework_equality': return 'Legal Framework: Equality';
              case 'legal_framework_rule_of_law': return 'Legal Framework: Rule of Law';
              case 'supply_side': return 'Supply Side';
              case 'demand_side_media_use': return 'Demand Side: Media Use';
              case 'demand_side_trust_in_media': return 'Demand Side: Trust in Media';
              default: return tableName.replace(/_/g, ' ').toUpperCase();
            }
          })()}
        </Typography>
        <Select
          options={filteredOptions}
          value={localSelectedOptions[tableName] || []}
          onChange={(selectedOptions) => handleOptionChange(tableName, selectedOptions as MultiValue<ColumnOption>)}
          placeholder={`Select columns from ${tableName.replace(/_/g, ' ')}`}
          isMulti
          isSearchable
          isLoading={loading}
          isDisabled={loading || !!error}
          className={styles.selectBox}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
        />
      </Box>
    );
  };

  const renderSelectedOptions = () => (
    <Box mt={2} maxWidth="800px" mx="auto" pb={4}>
      <Typography variant="h6" gutterBottom>{t('Selected Indicator Columns')}</Typography>
      <Grid container spacing={2}>
        {Object.entries(localSelectedOptions).map(([tableName, columns]) => (
          <Grid item xs={12} sm={6} key={tableName}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom className={styles.chartTitle}>
                {tableName.replace(/_/g, ' ').toUpperCase()}
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {columns.map((column) => {
                  const indicatorName = column.thresholds?.indicator || column.label;
                  return (
                    <Chip
                      key={column.value}
                      label={indicatorName}
                      color="primary"
                      variant="outlined"
                      onDelete={() => handleDeleteChip(tableName, column)}
                      sx={{
                        maxWidth: '100%',
                        height: 'auto',
                        '& .MuiChip-label': { whiteSpace: 'normal', padding: '4px 24px 4px 12px' },
                        '& .MuiChip-deleteIcon': { position: 'absolute', right: 5 }
                      }}
                    />
                  );
                })}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const handleDeleteChip = (tableName: string, columnToDelete: ColumnOption) => {
    const updatedSelections = {
      ...localSelectedOptions,
      [tableName]: localSelectedOptions[tableName].filter(column => column.value !== columnToDelete.value)
    };
    setLocalSelectedOptions(updatedSelections);
    localStorage.setItem('selectedOptions', JSON.stringify(updatedSelections));
  };

  const handleClearSelections = () => {
    setLocalSelectedOptions({});
    dispatch(setSelectedOptions({}));
    localStorage.removeItem('selectedOptions');
    setFeedback(t('All selections cleared.'));
  };

  return (
    <>
      {showSplashScreen ? (
        <SplashScreen onFinished={handleSplashScreenFinished} />
      ) : (
        <Box display="flex" flexDirection="column" gap={2} p={2}>
          <Joyride
            callback={handleJoyrideCallback}
            continuous
            run={showTutorial}
            scrollToFirstStep
            showSkipButton
            steps={steps}
            styles={{
              options: {
                primaryColor: '#1976d2',
              },
              buttonNext: {
                backgroundColor: '#1976d2',
              },
              buttonBack: {
                marginRight: 10,
              },
            }}
            floaterProps={{
              disableAnimation: true,
            }}
            locale={{
              last: 'Finish',
              next: 'Next',
              skip: 'Skip',
              close: 'Exit',
            }}
            showProgress
          />
          <Paper elevation={3} className={styles.paperContainer}>
            <Typography variant="h5" gutterBottom className="data-selection-title">{t('Indicator Selection')}</Typography>
            {showProgress && (
              <Box mb={2}>
                <LinearProgress />
                <Typography variant="caption" color="textSecondary" mt={1}>
                  {t('Loading data...')}
                </Typography>
              </Box>
            )}
            {error && <Typography color="error">{t('Error')}: {error}</Typography>}
            {!loading && !error && (
              <>
                <Grid container spacing={2}>
                  {medeMapState.columnOptions && tableOrder.map((tableName) => {
                    const options = medeMapState.columnOptions[tableName];
                    if (options) {
                      return (
                        <Grid item xs={12} sm={6} md={4} key={tableName}>
                          <div className="select-box">
                            {createSelectBox(tableName, options)}
                          </div>
                        </Grid>
                      );
                    }
                    return null;
                  })}
                </Grid>
                <Box mt={2} display="flex" justifyContent="flex-start" alignItems="center" gap={2}>
                  <Button variant="contained" color="primary" onClick={handleSubmit} className="submit-button">
                    {t('Submit')}
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={handleClearSelections}>
                    {t('Clear all Selections')}
                  </Button>
                </Box>
                {feedback && <Typography color="primary" style={{ marginTop: '1rem' }}>{feedback}</Typography>}
              </>
            )}
            <div className="selected-options">
              {renderSelectedOptions()}
            </div>
          </Paper>
          <Modal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            aria-labelledby="indicator-limit-modal"
            aria-describedby="indicator-limit-description"
          >
            <Box className={`${styles.modalContent} ${styles.picoAlert}`}>
              <Typography id="indicator-limit-modal" variant="h6" component="h2" className={styles.modalTitle}>
                {t('Indicator Limit')}
              </Typography>
              <Typography id="indicator-limit-description" className={styles.modalDescription}>
                {t('Select up to 3 indicators')}
              </Typography>
              <Button onClick={() => setIsModalOpen(false)} className={styles.modalCloseButton}>
                {t('Close')}
              </Button>
            </Box>
          </Modal>
        </Box>
      )}
    </>
  );
};

export default MainSelections;
