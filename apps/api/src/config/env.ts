import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  directUrl: process.env.DIRECT_URL || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  collegeEmailDomain: process.env.COLLEGE_EMAIL_DOMAIN || 'francisxavier.ac.in',
  jwtSecret: process.env.JWT_SECRET || 'fxec_ece_library_super_secret_jwt_key_2026_modern_aura',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
