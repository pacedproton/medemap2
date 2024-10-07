import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Switch, FormControlLabel, IconButton, Button, Slider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';
import styles from './SettingsDialog.module.css';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedOptions } from '../../lib/features/medemap/medeMapSlice';
import { setVerboseLogging } from '../../lib/clientlogging';
import {setShowDataLabels, selectShowDataLabels, setDataLabelFontSize, selectDataLabelFontSize} from '../../lib/features/settings/settingsSlice';

// Add this new component for the draggable paper
function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const SettingsDialog = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [verboseLogging, setVerboseLoggingState] = React.useState(false);
  const showDataLabels = useSelector(selectShowDataLabels);
  const dataLabelFontSize = useSelector(selectDataLabelFontSize);

  useEffect(() => {
    const storedVerboseLogging = localStorage.getItem('verboseLogging');
    setVerboseLoggingState(storedVerboseLogging === 'true');
    const storedShowDataLabels = localStorage.getItem('showDataLabels');
    if (storedShowDataLabels !== null) {
      dispatch(setShowDataLabels(storedShowDataLabels === 'true'));
    }
    const storedDataLabelFontSize = localStorage.getItem('dataLabelFontSize');
    if (storedDataLabelFontSize !== null) {
      const fontSize = parseInt(storedDataLabelFontSize, 10);
      dispatch(setDataLabelFontSize(fontSize));
    }
  }, [dispatch]);

  const clearLocalStorage = () => {
    if (confirm(t('confirmClearLocalStorage'))) {
      localStorage.clear();
      alert(t('localStorageCleared'));
      console.log('localStorage cleared at:', new Date().toISOString());
      dispatch(setSelectedOptions({}));
      setVerboseLoggingState(false);
      dispatch(setShowDataLabels(false));
      dispatch(setDataLabelFontSize(14));
    }
  };

  const handleVerboseLoggingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setVerboseLoggingState(newValue);
    try {
      setVerboseLogging(newValue);
      localStorage.setItem('verboseLogging', newValue.toString());
      console.log(`[INFO] Verbose logging set to: ${newValue}`);
    } catch (error) {
      console.error('[ERROR] Failed to set verbose logging:', error);
    }
  };

  const handleShowDataLabelsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    dispatch(setShowDataLabels(newValue));
    localStorage.setItem('showDataLabels', newValue.toString());
  };

  const handleDataLabelFontSizeChange = (newValue: number) => {
    dispatch(setDataLabelFontSize(newValue));
    localStorage.setItem('dataLabelFontSize', newValue.toString());
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="draggable-dialog-title"
      className={styles.dialog}
      PaperComponent={PaperComponent}
    >
      <DialogTitle
        id="draggable-dialog-title"
        className={styles.dialogTitle}
        style={{ cursor: 'move' }}
      >
        {t('Settings')}
        <IconButton aria-label="close" className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className={styles.dialogContent}>
        <Box className={styles.settingsSection}>
          <Typography variant="h6" gutterBottom className={styles.sectionTitle}>
            {t('Visualization Settings')}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={showDataLabels}
                onChange={handleShowDataLabelsChange}
              />
            }
            label={t('Show 3D Globe Data Labels')}
            className={styles.settingsOption}
          />
          <Box mt={2}>
            <Typography variant="body2">{t('3D Globe Data Label Font Size')}</Typography>
            <Slider
              value={dataLabelFontSize}
              onChange={(_, newValue) => handleDataLabelFontSizeChange(newValue as number)}
              min={8}
              max={24}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        </Box>
        <Box className={styles.settingsSection}>
          <Typography variant="h6" gutterBottom className={styles.sectionTitle}>
            {t('Logging')}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={verboseLogging}
                onChange={handleVerboseLoggingChange}
              />
            }
            label={t('Verbose Log Messages')}
            className={styles.settingsOption}
          />
        </Box>
        <Box className={styles.settingsSection} display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h6" gutterBottom className={styles.sectionTitle}>
            {t('Browser Storage')}
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={clearLocalStorage}
            className={styles.clearStorageButton}
          >
            {t('Clear Local Storage')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;