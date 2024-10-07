import { Pool } from 'pg';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const configPath = path.join(process.cwd(), 'app/config.yaml');
let config;

try {
  config = yaml.load(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error('Error loading config:', error);
  throw error;
}

const pool = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
});

export default function connectToDatabase() {
  return pool;
}