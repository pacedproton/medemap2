'use client'

import React, { useState, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { GridApi, GridReadyEvent, GridOptions } from 'ag-grid-community';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMedeMapData, selectMedeMapData } from '@/lib/features/medemap/medeMapSlice.ts';
import { useTranslation } from 'react-i18next';
import { useContextMenu } from 'react-contexify';
import ContextMenu from './ContextMenu';
import styles from '@/styles/TableView.module.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const TableView = () => {
  const dispatch = useDispatch();
  const medeMapState = useSelector(selectMedeMapData);
  const { show } = useContextMenu({ id: 'context-menu' });
  const { t } = useTranslation();
  const [gridApiMap, setGridApiMap] = useState<{ [key: string]: GridApi }>({});
  const [activeTable, setActiveTable] = useState<string | null>(null);

  React.useEffect(() => {
    dispatch(fetchMedeMapData());
  }, [dispatch]);

  const onGridReady = useCallback((params: GridReadyEvent, tableName: string) => {
    setGridApiMap(prevState => ({
      ...prevState,
      [tableName]: params.api
    }));
    params.api.sizeColumnsToFit();
    params.columnApi.autoSizeAllColumns();
  }, []);

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>, tableName: string) => {
    event.preventDefault();
    setActiveTable(tableName);
    show({ event });
  };

  const handleCopy = () => {
    if (activeTable && gridApiMap[activeTable]) {
      const gridApi = gridApiMap[activeTable];
      const rowData = [];
      gridApi.forEachNodeAfterFilterAndSort((node) => {
        if (node.data) {
          rowData.push(node.data);
        }
      });

      const csvContent = convertToCSV(rowData);

      navigator.clipboard.writeText(csvContent)
        .then(() => {
          console.log(`Table data for ${activeTable} copied to clipboard`);
        })
        .catch(err => {
          console.error('Failed to copy table data: ', err);
        });
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };

  const gridOptions: GridOptions = useMemo(() => ({
    rowMultiSelectWithClick: true,
    rowSelection: 'multiple',
    suppressRowClickSelection: false,
  }), []);

  const tables = [
    'demand_side_trust_in_media',
    'basic_data',
    'demand_side_media_use',
    'democracy',
    'legal_framework_equality',
    'legal_framework_freedom',
    'legal_framework_human_dignity',
    'legal_framework_pluralism',
    'legal_framework_rule_of_law',
    'supply_side'
  ];

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    minWidth: 100,
  }), []);

  return (
    <div className={styles.tableContainer}>
      <h1 className={styles.tableTitle}>{t('Table View')}</h1>
      <p className={styles.exportNote}>{t('Right-click anywhere on the table to copy its data as CSV to clipboard')}</p>
      {tables.map((tableName) => {
        const tableData = medeMapState.data[tableName] || [];
        const columnDefs = medeMapState.columnOptions[tableName]
          ?.filter(col => !col.value.startsWith('meta_'))
          .map(col => ({
            field: col.value,
            headerName: col.thresholds?.indicator || t(col.label),
          })) || [];

        const filteredTableData = tableData.map(row => {
          const filteredRow = {};
          Object.keys(row).forEach(key => {
            if (!key.startsWith('meta_')) {
              filteredRow[key] = row[key];
            }
          });
          return filteredRow;
        });

        return (
          <div key={tableName} className={styles.agGridWrapper}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>{t(tableName)}</h2>
            </div>
            <div 
              className={`ag-theme-alpine ${styles.fullWidthGrid}`}
              onContextMenu={(event) => handleContextMenu(event, tableName)}
            >
              <ContextMenu onCopy={handleCopy} onExportCsv={() => {}} />
              <AgGridReact
                columnDefs={columnDefs}
                rowData={filteredTableData}
                onGridReady={(params) => onGridReady(params, tableName)}
                defaultColDef={defaultColDef}
                rowSelection="multiple"
                suppressRowClickSelection={false}
                rowMultiSelectWithClick={true}
                gridOptions={gridOptions}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TableView;