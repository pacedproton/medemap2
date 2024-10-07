import React from 'react';
import { Box, Typography } from '@mui/material';

interface LegendProps {
  selectedOptions: { [key: string]: any[] };
  style?: React.CSSProperties;
}

const Legend: React.FC<LegendProps> = ({ selectedOptions, style }) => {
  const totalColumns = Object.values(selectedOptions).flat().length;

  return (
    <Box
      bgcolor="rgba(255, 255, 255, 0.8)"
      p={2}
      borderRadius={2}
      style={{ ...style, zIndex: 1000 }}
    >
      <Typography variant="h6" gutterBottom>Legend</Typography>
      {Object.entries(selectedOptions).map(([table, columns], tableIndex) =>
        columns.map((column, columnIndex) => {
          const hue = ((tableIndex * columns.length + columnIndex) / totalColumns) * 360;
          return (
            <Box key={`${table}-${column.value}`} display="flex" alignItems="center" mb={1}>
              <Box
                width={30}
                height={20}
                mr={1}
                style={{ backgroundColor: `hsl(${hue}, 100%, 50%)` }}
              />
              <Typography>{`${column.label}${'\u00A0'.repeat(12)}`}</Typography>
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default Legend;