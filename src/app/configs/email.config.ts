import { getEnvVar } from '../utils/getEnvVar';

const emailConfig = {
  email: getEnvVar('EMAIL'),
  app_pass: getEnvVar('APP_PASS'),
  contact_mail_address: getEnvVar('CONTACT_MAIL_ADDRESS'),
};

export default emailConfig;
