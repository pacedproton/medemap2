import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/server-reldb';

const columnQuery = `
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'medemap_aug'
  AND table_name = $1
  ORDER BY ordinal_position
`;

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

export async function GET(req: NextRequest) {
  console.log('GET request received for /api/medemap');
  try {
    const db = await connectToDatabase();
    const responseData: { [key: string]: any } = {};
    const columnData: { [key: string]: any[] } = {};

    for (const table of tables) {
      console.log(`Processing table: ${table}`);
      // Fetch column names
      const { rows: columnNames } = await db.query(columnQuery, [table]);
      console.log(`Column names for ${table}:`, columnNames);

      // Fetch the meta data row
      const { rows: metaRows } = await db.query(`SELECT * FROM medemap_aug.${table} WHERE country = 'metastat'`);
      const metaRow = metaRows[0] || {};
      console.log(`Meta data row for ${table}:`, metaRow);

      // Fetch table data excluding the meta data row
      const { rows } = await db.query(`SELECT * FROM medemap_aug.${table} WHERE country != 'metastat'`);
      console.log(`Sample data fetched for ${table}:`, rows[0]);
      responseData[table] = rows;

      columnData[table] = columnNames
        .filter(row => !row.column_name.startsWith('meta_'))
        .map(row => {
          const columnName = row.column_name;
          const metaColumnName = `meta_${columnName}`;
          const metaDataRaw = metaRow ? metaRow[metaColumnName] : null;
          let metaData = null;

          if (metaDataRaw) {
            try {
              metaData = typeof metaDataRaw === 'string' ? JSON.parse(metaDataRaw) : metaDataRaw;
            } catch (e) {
              console.error(`Error parsing JSON for ${metaColumnName}:`, e);
            }
          }

          // Now extract the required fields from metaData
          let extractedMeta = null;
          if (metaData) {
            extractedMeta = {
              // Numeric fields
              eu_average: metaData.eu_average || null,
              eu_standard_deviation: metaData.eu_standard_deviation || null,
              high_medium_threshold: metaData.high_medium_threshold || null,
              medium_low_threshold: metaData.medium_low_threshold || null,
              year_of_validity: metaData.year_of_validity || null,
              // Text fields
              indicator: metaData.indicator || null,
              source: metaData.source || null,
              original_name: metaData.original_name || null,
            };
          }

          return {
            value: columnName,
            label: columnName,
            meta: extractedMeta,
          };
        });

      console.log(`Processed column data for ${table}:`, columnData[table]);
    }

    // Add column data to the response
    responseData.columnOptions = columnData;

    console.log('Response data prepared. Sending response.');
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Error fetching data', details: error.message }, { status: 500 });
  }
}
