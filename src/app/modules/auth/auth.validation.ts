import { z } from 'zod';

const loginUserSchema = z.object({
  email: z.string().nonempty({ message: 'Email is required!' }),
  password: z.string().nonempty({ message: 'Password is required!' }),
  fcmToken: z.string().optional(),
});

const passwordResetSchema = z.object({
  password: z
    .string()
    .nonempty({ message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

const changePasswordValidationSchema = z.object({
  oldPassword: z
    .string()
    .nonempty({ message: 'Old password is required' })
    .min(6, { message: 'Old password must be at least 6 characters long' }),
  newPassword: z
    .string()
    .nonempty({ message: 'New password is required' })
    .min(6, { message: 'New password must be at least 6 characters long' }),
});

const setNewPasswordValidationSchema = z.object({
  password: z
    .string()
    .nonempty({ message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

const verifyOtpSchema = z.object({
  otpCode: z
    .string()
    .nonempty({ message: 'OTP code is required' })
    .length(6, { message: 'Please enter a 6-character OTP code' }),
  email: z.string().email('Invalid email address').nonempty({ message: 'Email is required!' }),
  fcmToken: z.string().optional(),
});

const forgotPassword = z.object({
  email: z.string().nonempty({ message: 'Email is required!' }),
});

export const authValidation = {
  loginUserSchema,
  passwordResetSchema,
  changePasswordValidationSchema,
  verifyOtpSchema,
  setNewPasswordValidationSchema,
  forgotPassword,
};
