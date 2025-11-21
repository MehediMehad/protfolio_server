import path from 'path';

import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import appConfig from './app.config';
import authConfig from './auth.config';
import emailConfig from './email.config';
import { serviceAccount } from './firebase.config';
import s3Config from './s3.config';

const config = {
  app: appConfig,
  auth: authConfig,
  email: emailConfig,
  S3: s3Config,
  fireBase: serviceAccount,
  Google: {
    google_service_account_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    google_private_key: process.env.GOOGLE_PRIVATE_KEY,
    google_calendar_id: process.env.GOOGLE_CALENDAR_ID,
    meeting_link: process.env.MEETING_LINK,
  },
  Zoom: {
    account_id: process.env.ZOOM_ACCOUNT_ID!,
    client_id: process.env.ZOOM_CLIENT_ID!,
    client_secret: process.env.ZOOM_CLIENT_SECRET!,
  },
};

export default config;
