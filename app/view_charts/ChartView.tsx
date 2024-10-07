"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { selectMedeMapData } from "@/lib/features/medemap/medeMapSlice";
import { Box, Typography, LinearProgress, Paper } from "@mui/material";
import Plot from "react-plotly.js";
import styles from "./ChartView.module.css";

const ChartView = () => {
  const medeMapState = useAppSelector(selectMedeMapData);
  const { columnOptions, selectedOptions, data } = medeMapState;
  const [chartData, setChartData] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log("MedeMapState in ChartView:", medeMapState);
    processData();
  }, [medeMapState]);

  const getBarColor = (value: number, thresholds: any): string => {
    if (
      !thresholds ||
      thresholds.medium_low_threshold == null ||
      thresholds.high_medium_threshold == null
    ) {
      return "gray"; // Default color when thresholds are not available
    }

    if (value <= thresholds.medium_low_threshold) {
      return "red";
    } else if (value <= thresholds.high_medium_threshold) {
      return "orange";
    } else {
      return "green";
    }
  };

  const processData = () => {
    if (
      Object.keys(selectedOptions).length === 0 ||
      Object.keys(data).length === 0
    ) {
      return;
    }

    const processedData = [];
    let currentProgress = 0;

    Object.entries(selectedOptions).forEach(
      ([tableName, columns], tableIndex) => {
        if (columns && columns.length > 0) {
          const tableData = data[tableName];
          if (!tableData) {
            console.error(`No data found for table: ${tableName}`);
            return;
          }

          // Create a mapping from indicator value to its thresholds
          const thresholdsMap: { [key: string]: any } = {};
          const tableColumnOptions = columnOptions[tableName];
          tableColumnOptions.forEach((option) => {
            thresholdsMap[option.value] = option.thresholds;
          });

          const chartDataForTable = tableData.map((row) => {
            const chartItem: any = { country: row.country };
            columns.forEach((column: any) => {
              const value = parseFloat(row[column.value]) || 0;
              chartItem[column.value] = value;
              const thresholds = thresholdsMap[column.value];
              chartItem[`${column.value}_color`] = getBarColor(
                value,
                thresholds
              );
            });
            return chartItem;
          });

          const columnsWithFullNames = columns.map((column: any) => ({
            ...column,
            thresholds: thresholdsMap[column.value],
          }));

          processedData.push({
            tableName,
            data: chartDataForTable,
            columns: columnsWithFullNames,
          });
        }
        currentProgress =
          ((tableIndex + 1) / Object.keys(selectedOptions).length) * 100;
        setProgress(currentProgress);
      }
    );

    setChartData(processedData);
  };

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Descriptive Graph Views
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ marginBottom: 2 }}
      />

      {chartData.length === 0 && (
        <Typography>No data to display. Please select some options.</Typography>
      )}

      {chartData.map((tableChart, index) => (
        <Box
          key={`${tableChart.tableName}-${index}`}
          className={styles.chartContainer}
          sx={{ width: "100%", height: 500 }}
        >
          <Paper elevation={3} className={styles.chartTitlePaper}>
            <Typography variant="h5" className={styles.chartTitle}>
              {(() => {
                const tableName = (() => {
                  switch (tableChart.tableName) {
                    case "basic_data":
                      return "Basic Data";
                    case "democracy":
                      return "Democracy & Participation";
                    case "legal_framework_human_dignity":
                      return "Legal Framework : Human Dignity";
                    case "legal_framework_freedom":
                      return "Legal Framework : Freedom";
                    case "legal_framework_pluralism":
                      return "Legal Framework : Pluralism";
                    case "legal_framework_equality":
                      return "Legal Framework : Equality";
                    case "legal_framework_rule_of_law":
                      return "Legal Framework : Rule of Law";
                    case "supply_side":
                      return "Supply Side";
                    case "demand_side_media_use":
                      return "Demand Side : Media Use";
                    case "demand_side_trust_in_media":
                      return "Demand Side : Trust in Media";
                    default:
                      return tableChart.tableName
                        .replace(/_/g, " ")
                        .toUpperCase();
                  }
                })();

                const indicators = tableChart.columns
                  .map((column: any) => {
                    const thresholds = column.thresholds || {};
                    return thresholds.indicator || column.label;
                  })
                  .join(" | ");

                return `${tableName} : ${indicators}`;
              })()}
            </Typography>
          </Paper>
          {tableChart.data.length > 0 ? (
            <Plot
              data={tableChart.columns.map((column: any) => {
                const x = tableChart.data.map((item: any) => item.country);
                const y = tableChart.data.map(
                  (item: any) => item[column.value]
                );
                const markerColors = tableChart.data.map(
                  (item: any) => item[`${column.value}_color`]
                );
                return {
                  x,
                  y,
                  type: "bar",
                  name: column.label,
                  marker: {
                    color: markerColors,
                  },
                };
              })}
              layout={{
                width: 900,
                height: 500,
                margin: { t: 50, b: 150, l: 80, r: 80 },
                barmode: "group",
                xaxis: {
                  title: "Country",
                  tickangle: 45,
                  automargin: true,
                },
                yaxis: {
                  title: "Normalized Indicator",
                },
                legend: {
                  orientation: "h",
                  x: 0,
                  y: -0.2,
                },
              }}
              config={{ responsive: true }}
            />
          ) : (
            <Typography>No data available for this table.</Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default ChartView;
