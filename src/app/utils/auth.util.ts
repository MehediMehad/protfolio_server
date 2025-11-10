import crypto from 'crypto';

// Generate OTP
export const generateOTP = (minute: number) => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiry = new Date(Date.now() + minute * 60 * 1000); // 10 minutes expiry
  const hexCode = crypto.randomBytes(16).toString('hex');
  return { otpCode, expiry, hexCode };
};
