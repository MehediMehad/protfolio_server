import nodemailer from 'nodemailer';

import emailConfig from '../../configs/email.config';

export const sentEmailUtility = async (
  emailTo: string,
  EmailSubject: string,
  EmailHTML?: string,
) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465
    auth: {
      user: emailConfig.email,
      pass: emailConfig.app_pass,
    },
  });

  const mailOptions = {
    from: emailConfig.email,
    to: emailTo,
    subject: EmailSubject,
    html: EmailHTML,
  };

  return await transporter.sendMail(mailOptions);
};
