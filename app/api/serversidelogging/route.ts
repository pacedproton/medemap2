import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../../../lib/server-reldb';
import yaml from 'js-yaml';

const configPath = path.join(process.cwd(), 'app/config.yaml');
let config;

try {
  config = yaml.load(fs.readFileSync(configPath, 'utf8')) as any;
  console.log('Loaded config:', config);
} catch (error) {
  console.error('Error loading config:', error);
  config = { logging: { file: { enabled: false }, database: { enabled: true }, console: { enabled: true } } };
}

export async function POST(req: NextRequest) {
  const logData = await req.json();
  const { timestamp, level, message, url, userAgent, loadTime, domReadyTime } = logData;

  const logEntry = `${timestamp} [${level.toUpperCase()}] ${url} "${userAgent}" - Load Time: ${loadTime}ms, DOM Ready: ${domReadyTime}ms - ${message}\n`;

  console.log('Received log entry:', logEntry);
  console.log('Logging config:', config.logging);

  // Write to file
  if (config.logging.file.enabled) {
    try {
      await fs.promises.appendFile(config.logging.file.path, logEntry);
    } catch (err) {
      console.error('Error writing to log file:', err);
    }
  }

  // Write to database
  if (config.logging.database.enabled) {
    const pool = connectToDatabase();
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'INSERT INTO medemap_aug.application_logs (timestamp, level, message, url, user_agent, load_time, dom_ready_time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [new Date(timestamp), level, message, url, userAgent, loadTime, domReadyTime]
        );
        console.log('Log inserted with ID:', result.rows[0].id);
      } finally {
        client.release();
      }
    } catch (dbError) {
      console.error('Error writing to database:', dbError);
      if (dbError instanceof Error) {
        console.error('Error name:', dbError.name);
        console.error('Error message:', dbError.message);
        console.error('Error stack:', dbError.stack);
      }
    }
  }

  // Console logging
  if (config.logging.console.enabled) {
    switch (level.toLowerCase()) {
      case 'info':
        console.info(logEntry);
        break;
      case 'warn':
        console.warn(logEntry);
        break;
      case 'error':
        console.error(logEntry);
        break;
      default:
        console.log(logEntry);
    }
  }

  return NextResponse.json({ success: true });
}