'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  AccessTimeFilled as AccessTimeFilledIcon,
  Newspaper as NewspaperIcon,
  LibraryBooks as BookIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { toggleDrawer, closeDrawer } from '../../lib/features/drawer/drawerSlice';
import AboutOverlay from './AboutOverlay';
import SettingsDialog from './SettingsDialog';
import Link from 'next/link';
import Image from 'next/image';
import AboutProjectModal from './AboutProjectModal';
import { useTranslation } from 'react-i18next';
import {Language as LanguageIcon} from '@mui/icons-material';
import { setLanguage } from '../../lib/features/language/languageSlice';

const DrawerNavigation = () => {
  const dispatch = useDispatch();
  const { i18n, t } = useTranslation();
  const currentLanguage = useSelector((state: RootState) => state.language.currentLanguage);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    dispatch(setLanguage(lng));
  };

  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage, i18n]);

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'en': return 'English';
      case 'de': return 'Deutsch';
      case 'fr': return 'Français';
      case 'la': return 'Latin';
      default: return lang;
    }
  };

  interface RootState {
    drawer: {
      isOpen: boolean;
    };
  }

  const isDrawerOpen = useSelector((state: RootState) => state.drawer.isOpen);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEu27PdfOpen, setIsEu27PdfOpen] = useState(false);
  const [isAboutProjectOpen, setIsAboutProjectOpen] = useState(false);
  const [isDataAnnotationsOpen, setIsDataAnnotationsOpen] = useState(false);
  const [isUserGuidelinesOpen, setIsUserGuidelinesOpen] = useState(false);

  const handleDrawerToggle = () => {
    dispatch(toggleDrawer());
  };

  const handleDrawerClose = () => {
    dispatch(closeDrawer());
  };

  const handleAboutClick = () => {
    setIsAboutOpen(true);
    handleDrawerClose();
  };

  const handleAboutClose = () => {
    setIsAboutOpen(false);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
    handleDrawerClose();
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleEu27PdfOpen = () => {
    setIsEu27PdfOpen(true);
    handleDrawerClose();
  };

  const handleEu27PdfClose = () => {
    setIsEu27PdfOpen(false);
  };

  const handleAboutProjectClick = () => {
    setIsAboutProjectOpen(true);
    handleDrawerClose();
  };

  const handleAboutProjectClose = () => {
    setIsAboutProjectOpen(false);
  };

  const handleDataAnnotationsOpen = () => {
    setIsDataAnnotationsOpen(true);
    handleDrawerClose();
  };

  const handleDataAnnotationsClose = () => {
    setIsDataAnnotationsOpen(false);
  };

  const handleUserGuidelinesOpen = () => {
    setIsUserGuidelinesOpen(true);
    handleDrawerClose();
  };

  const handleUserGuidelinesClose = () => {
    setIsUserGuidelinesOpen(false);
  };

  const drawerWidth = 240;

  const drawerItems: DrawerItem[] = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { 
      label: 'About the Project', 
      icon: <AccessTimeFilledIcon />, 
      action: handleAboutProjectClick,
    },
    { label: 'Data Annotations', icon: <NewspaperIcon />, action: handleDataAnnotationsOpen },
    { label: 'Information on EU-27', icon: <LocationOnIcon />, action: handleEu27PdfOpen },
    { label: 'User Guidelines', icon: <SettingsIcon />, action: handleUserGuidelinesOpen },
    { 
      label: t('language'),
      icon: <LanguageIcon />,
      action: () => {
        const languages = ['en', 'de', 'fr', 'la'];
        const currentIndex = languages.indexOf(currentLanguage);
        const nextLanguage = languages[(currentIndex + 1) % languages.length];
        changeLanguage(nextLanguage);
      }
    },
    { label: 'Settings', icon: <BookIcon />, action: handleSettingsClick },
    { label: 'Disclaimer', icon: <InfoIcon />},
    {
      label: 'Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Research Executive Agency. Neither the European Union nor the granting authority can be held responsible for them.',
      sx: { fontSize: '0.575rem' },
    },
  ];

  return (
    <>
      <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ fontSize: '3rem' }}>
        <MenuIcon fontSize="inherit" />
      </IconButton>
      <Drawer anchor="left" open={isDrawerOpen} onClose={handleDrawerClose}>
        <Box sx={{ width: drawerWidth, padding: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, marginBottom: 2 }}>
            MeDeMAP Navigation
          </Typography>
          <List>
            {drawerItems.map((item) => (
              <ListItem
                key={item.label}
                onClick={item.action || (item.path ? handleDrawerClose : undefined)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    cursor: 'pointer',
                  },
                  ...(item.sx || {}),
                }}
              >
                {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                <ListItemText 
                  primary={
                    item.label === t('language')
                      ? `${t('')} ${getLanguageLabel(currentLanguage)}`
                      : item.label
                  } 
                  primaryTypographyProps={item.sx} 
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ textAlign: 'center', marginTop: 2 }}>
            <Image src="/images/EN-FundedbytheEU-POS.jpg" alt="Logo" width={200} height={42} />
          </Box>
        </Box>
      </Drawer>
      <AboutOverlay isOpen={isAboutOpen} onClose={handleAboutClose} />
      <SettingsDialog isOpen={isSettingsOpen} onClose={handleSettingsClose} />
      <Dialog
        open={isEu27PdfOpen}
        onClose={handleEu27PdfClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Information on EU-27
          <IconButton
            aria-label="close"
            onClick={handleEu27PdfClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <iframe
            src="/static/information_on_EU-27.pdf"
            width="100%"
            height="600px"
            style={{ border: 'none' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEu27PdfClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <AboutProjectModal isOpen={isAboutProjectOpen} onClose={handleAboutProjectClose} />
      <Dialog
        open={isDataAnnotationsOpen}
        onClose={handleDataAnnotationsClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Data Annotations
          <IconButton
            aria-label="close"
            onClick={handleDataAnnotationsClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <iframe
            src="/static/MeDeMAP_Data annotations_V1.0.pdf"
            width="100%"
            height="600px"
            style={{ border: 'none' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDataAnnotationsClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isUserGuidelinesOpen}
        onClose={handleUserGuidelinesClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          User Guidelines
          <IconButton
            aria-label="close"
            onClick={handleUserGuidelinesClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <iframe
            src="/static/MeDeMAP_Deliverable 1.4_V1.0.pdf"
            width="100%"
            height="600px"
            style={{ border: 'none' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUserGuidelinesClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DrawerNavigation;