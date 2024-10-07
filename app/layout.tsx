import React from 'react';
import type { ReactNode } from 'react';
import { StoreProvider } from './StoreProvider';
import './styles/globals.css';
import styles from './styles/layout.module.css';
import dynamic from 'next/dynamic';

const ClientLayout = dynamic(() => import('./ClientLayout'), { ssr: false });

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body className={styles.body}>
        <StoreProvider>
          <ClientLayout>{children}</ClientLayout>
        </StoreProvider>
      </body>
    </html>
  );
}