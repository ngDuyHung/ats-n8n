'use server';

import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { createSession, deleteSession } from '@/lib/session';
import { RegisterSchema, LoginSchema, FormState } from '@/lib/definitions';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function register(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, password } = validated.data;

  try {
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      return { errors: { email: ['Email này đã được sử dụng.'] } };
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, role: 'client' });
    await createSession({
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch {
    return { message: 'Đã có lỗi xảy ra, vui lòng thử lại.' };
  }

  redirect('/jobs');
}

export async function login(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  let role: string = 'client';

  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return { message: 'Email hoặc mật khẩu không đúng.' };
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return { message: 'Email hoặc mật khẩu không đúng.' };
    }
    role = user.role;
    await createSession({
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch {
    return { message: 'Đã có lỗi xảy ra, vui lòng thử lại.' };
  }

  // redirect phải nằm ngoài try/catch (redirect() throws internally)
  if (role === 'admin') redirect('/admin');
  if (role === 'hr') redirect('/hr');
  redirect('/jobs');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
