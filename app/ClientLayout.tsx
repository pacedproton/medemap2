'use client';

import React, { useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import Navigation from './components/Navigation';
import BottomNavigation from './components/BottomNavigation';
import DrawerNavigation from './components/DrawerNavigation';
import styles from './styles/layout.module.css';
import dynamic from 'next/dynamic';
import { setupClientLogging, initializeLogging } from '../lib/clientlogging';

const ImprintModal = dynamic(() => import('./components/ImprintModal'), { 
  ssr: false
});

const DataTermsModal = dynamic(() => import('./components/DataTermsModal'), { 
  ssr: false
});

interface Props {
  readonly children: React.ReactNode;
}

export default function ClientLayout({ children }: Props) {
  useEffect(() => {
    setupClientLogging();
    initializeLogging();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <section className={styles.container}>
        <Navigation />
        <main className={styles.main}>{children}</main>
        <BottomNavigation />
        <DrawerNavigation />
        <footer className={styles.footer}>
          <span>MEDEMAP - Mapping Media for Future Democracies</span>
          <span className={styles.separator}>|</span>
          <a
            className={styles.link}
            href="https://www.medemap.eu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Homepage
          </a>
          <span className={styles.separator}>|</span>
          <a
            className={styles.link}
            href="https://www.oeaw.ac.at/cmc"
            target="_blank"
            rel="noopener noreferrer"
          >
            OeAW
          </a>
          <span className={styles.separator}>|</span>
          <DataTermsModal className={styles.link} />
          <span className={styles.separator}>|</span>
          <ImprintModal className={styles.link} />
          <span className={styles.separator}>|</span>
          <a
            className={styles.link}
            href="https://www.medemap.eu/?p=904"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          <span className={styles.separator}>|</span>
          <a
            className={styles.link}
            href="https://mailchi.mp/5ed498de5d00/medemapsignup"
            target="_blank"
            rel="noopener noreferrer"
          >
            Newsletter
          </a>
        </footer>
      </section>
    </I18nextProvider>
  );
}