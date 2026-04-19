import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Tên ít nhất 2 ký tự').trim(),
  email: z.string().email('Email không hợp lệ').trim(),
  password: z
    .string()
    .min(8, 'Mật khẩu ít nhất 8 ký tự')
    .regex(/[a-zA-Z]/, 'Mật khẩu phải có ít nhất 1 chữ cái')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ').trim(),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
