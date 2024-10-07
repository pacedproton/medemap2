"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../lib/hooks";
import { selectMedeMapData } from "../../lib/features/medemap/medeMapSlice";
import { Box, Typography, LinearProgress, Paper } from "@mui/material";
import Plot from "react-plotly.js";
import styles from "./ChoroplethView.module.css";

// Mapping of country names to their ISO 3-letter codes
const countryNameToISO3: { [key: string]: string } = {
  Austria: "AUT",
  Belgium: "BEL",
  Bulgaria: "BGR",
  Croatia: "HRV",
  "Czech Republic": "CZE",
  Denmark: "DNK",
  Estonia: "EST",
  Finland: "FIN",
  France: "FRA",
  Germany: "DEU",
  Greece: "GRC",
  Hungary: "HUN",
  Ireland: "IRL",
  Italy: "ITA",
  Latvia: "LVA",
  Lithuania: "LTU",
  Luxembourg: "LUX",
  Malta: "MLT",
  Netherlands: "NLD",
  Poland: "POL",
  Portugal: "PRT",
  Romania: "ROU",
  Slovakia: "SVK",
  Slovenia: "SVN",
  Spain: "ESP",
  Sweden: "SWE",
  Russia: "RUS",
  Belarus: "BLR",
  Ukraine: "UKR",
  // Add more countries if needed
};

const ChartView = () => {
  const medeMapState = useAppSelector(selectMedeMapData);
  const { columnOptions, selectedOptions, data } = medeMapState;
  const [chartData, setChartData] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log("MedeMapState in ChartView:", medeMapState);
    processData();
  }, [medeMapState]);

  const getColorCategory = (value: number, thresholds: any): number => {
    if (
      !thresholds ||
      thresholds.medium_low_threshold == null ||
      thresholds.high_medium_threshold == null
    ) {
      return 0; // Default category when thresholds are not available
    }

    if (value <= thresholds.medium_low_threshold) {
      return 1; // Red
    } else if (value <= thresholds.high_medium_threshold) {
      return 2; // Orange
    } else {
      return 3; // Green
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

          const chartDataForTable = tableData
            .map((row) => {
              const countryName = row.country;
              const iso3 = countryNameToISO3[countryName];
              if (!iso3) {
                console.warn(`ISO3 code not found for country: ${countryName}`);
                return null; // Exclude countries without ISO3 codes
              }
              const chartItem: any = {
                country: countryName,
                iso3,
              };
              columns.forEach((column: any) => {
                const value = parseFloat(row[column.value]) || 0;
                chartItem[column.value] = value;
                const thresholds = thresholdsMap[column.value];
                chartItem[`${column.value}_category`] = getColorCategory(
                  value,
                  thresholds
                );
              });
              return chartItem;
            })
            .filter((item) => item !== null); // Remove null entries

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
        Chropleth Views
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
          sx={{ width: "100%", height: 900 }}
        >
          <Paper elevation={3} className={styles.chartTitlePaper}>
            <Typography variant="h5" className={styles.chartTitle}>
              {(() => {
                const tableName = (() => {
                  switch (tableChart.tableName) {
                    case "basic_data":
                      return "Basic Data";
                    // Add other cases as needed
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
            <Box display="flex" alignItems="flex-start">
              <Plot
                data={[
                  {
                    type: "choropleth",
                    locationmode: "ISO-3",
                    locations: tableChart.data.map((item: any) => item.iso3),
                    z: tableChart.data.map(
                      (item: any) =>
                        item[`${tableChart.columns[0].value}_category`]
                    ),
                    text: tableChart.data.map((item: any) => item.country),
                    colorscale: [
                      [0, "#B0B0B0"],
                      [0.33, "#FF0000"],
                      [0.66, "#FFA500"],
                      [1, "#008000"],
                    ],
                    autocolorscale: false,
                    showscale: false,
                    marker: {
                      line: {
                        color: "rgba(0,0,0,0)",
                        width: 0,
                      },
                    },
                    zmin: 0,
                    zmax: 3,
                  },
                  {
                    type: "choropleth",
                    locationmode: "ISO-3",
                    locations: ["RUS", "BLR", "UKR"],
                    z: [0, 0, 0],
                    colorscale: [
                      [0, "white"],
                      [1, "white"],
                    ],
                    showscale: false,
                    marker: {
                      line: {
                        color: "rgba(0,0,0,0)",
                        width: 0,
                      },
                    },
                  },
                ]}
                layout={{
                  width: 800,
                  height: 600,
                  geo: {
                    scope: "europe",
                    resolution: 50,
                    showland: true,
                    landcolor: "rgb(217, 217, 217)",
                    projection: {
                      type: "mercator",
                    },
                    lonaxis: {
                      range: [-25, 65],
                    },
                    lataxis: {
                      range: [35, 75],
                    },
                    showframe: false,
                    showcountries: false,
                  },
                  margin: { t: 50, b: 50, l: 50, r: 50 },
                }}
                config={{ responsive: true }}
              />
              <Box className={styles.legend} ml={2}>
                <div className={styles.legendItem}>
                  <div
                    className={styles.legendColor}
                    style={{ backgroundColor: "#FF0000" }}
                  ></div>
                  <span className={styles.legendText}>
                    Low: &lt;={" "}
                    {tableChart.columns[0].thresholds.medium_low_threshold.toFixed(
                      2
                    )}
                  </span>
                </div>
                <div className={styles.legendItem}>
                  <div
                    className={styles.legendColor}
                    style={{ backgroundColor: "#FFA500" }}
                  ></div>
                  <span className={styles.legendText}>
                    Medium:{" "}
                    {tableChart.columns[0].thresholds.medium_low_threshold.toFixed(
                      2
                    )}{" "}
                    -{" "}
                    {tableChart.columns[0].thresholds.high_medium_threshold.toFixed(
                      2
                    )}
                  </span>
                </div>
                <div className={styles.legendItem}>
                  <div
                    className={styles.legendColor}
                    style={{ backgroundColor: "#008000" }}
                  ></div>
                  <span className={styles.legendText}>
                    High: &gt;{" "}
                    {tableChart.columns[0].thresholds.high_medium_threshold.toFixed(
                      2
                    )}
                  </span>
                </div>
              </Box>
            </Box>
          ) : (
            <Typography>No data available for this table.</Typography>
          )}
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: "#FF0000" }}
              ></div>
              <span className={styles.legendText}>
                Low: &lt;={" "}
                {tableChart.columns[0].thresholds.medium_low_threshold}
              </span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: "#FFA500" }}
              ></div>
              <span className={styles.legendText}>
                Medium: {tableChart.columns[0].thresholds.medium_low_threshold}{" "}
                - {tableChart.columns[0].thresholds.high_medium_threshold}
              </span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: "#008000" }}
              ></div>
              <span className={styles.legendText}>
                High: &gt;{" "}
                {tableChart.columns[0].thresholds.high_medium_threshold}
              </span>
            </div>
          </div>
        </Box>
      ))}
    </Box>
  );
};

export default ChartView;
