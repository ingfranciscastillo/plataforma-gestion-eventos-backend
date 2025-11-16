import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

const sql = neon("postgresql://neondb_owner:npg_Lip1Hu4xkYGN@ep-green-wind-ah4v7fyk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
export const db = drizzle(sql, { schema });