// app/StoreProvider.tsx

'use client'

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store, AppStore, AppState } from '../lib/store'; 
import { setupListeners } from '@reduxjs/toolkit/query';
import type { ReactNode } from 'react';

interface Props {
    readonly children: ReactNode;
}

export const StoreProvider = ({ children }: Props) => {
    const storeRef = useRef<AppStore | null>(null);

    if (!storeRef.current) {
        storeRef.current = store;  
    }

    useEffect(() => {
        if (storeRef.current) {
            const unsubscribe = setupListeners(storeRef.current.dispatch);
            return unsubscribe;
        }
    }, []);

    return <Provider store={storeRef.current}>{children}</Provider>;
};
