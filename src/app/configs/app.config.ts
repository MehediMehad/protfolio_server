import path from 'path';

import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import { getEnvVar } from '../utils/getEnvVar';

const appConfig = {
  env: getEnvVar('NODE_ENV'),
  port: getEnvVar('PORT'),
};

export default appConfig;
