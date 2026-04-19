'use server';

import { connectDB } from '@/lib/db';
import { HrRequest } from '@/models/HrRequest';
import { User } from '@/models/User';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const BecomeHrSchema = z.object({
  company_name: z.string().min(2, 'Tên công ty ít nhất 2 ký tự').trim(),
  company_website: z.string().url('URL không hợp lệ').trim().optional().or(z.literal('')),
  reason: z.string().min(20, 'Lý do ít nhất 20 ký tự').trim(),
});

export type BecomeHrState =
  | {
      errors?: { company_name?: string[]; company_website?: string[]; reason?: string[] };
      message?: string;
    }
  | undefined;

// Client gửi đơn xin trở thành HR
export async function submitHrRequest(
  state: BecomeHrState,
  formData: FormData
): Promise<BecomeHrState> {
  const session = await getSession();
  if (!session || session.role !== 'client') {
    return { message: 'Không có quyền thực hiện.' };
  }

  const validated = BecomeHrSchema.safeParse({
    company_name: formData.get('company_name'),
    company_website: formData.get('company_website') || undefined,
    reason: formData.get('reason'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    await connectDB();

    const existing = await HrRequest.findOne({
      user_id: session.userId,
      status: 'PENDING',
    });
    if (existing) {
      return { message: 'Bạn đã có đơn đang chờ duyệt. Vui lòng chờ phản hồi từ Admin.' };
    }

    await HrRequest.create({
      user_id: session.userId,
      company_name: validated.data.company_name,
      company_website: validated.data.company_website || '',
      reason: validated.data.reason,
    });
  } catch {
    return { message: 'Đã có lỗi xảy ra, vui lòng thử lại.' };
  }

  redirect('/my-applications?hr_request=sent');
}

// Admin duyệt đơn HR
export async function approveHrRequest(requestId: string) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return;

  await connectDB();

  const req = await HrRequest.findById(requestId);
  if (!req) return;

  await Promise.all([
    HrRequest.findByIdAndUpdate(requestId, {
      status: 'APPROVED',
      reviewed_by: session.userId,
    }),
    User.findByIdAndUpdate(req.user_id, { role: 'hr', company: req.company_name }),
  ]);

  revalidatePath('/admin/hr-requests');
}

// Admin từ chối đơn HR
export async function rejectHrRequest(requestId: string) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return;

  await connectDB();

  await HrRequest.findByIdAndUpdate(requestId, {
    status: 'REJECTED',
    reviewed_by: session.userId,
  });

  revalidatePath('/admin/hr-requests');
}

// Admin đổi role user trực tiếp
export async function changeUserRole(userId: string, newRole: 'admin' | 'hr' | 'client') {
  const session = await getSession();
  if (!session || session.role !== 'admin') return;

  await connectDB();
  await User.findByIdAndUpdate(userId, { role: newRole });
  revalidatePath('/admin/users');
}

// Admin xoá user
export async function deleteUser(userId: string) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return;

  // Không cho xoá chính mình
  if (userId === session.userId) return;

  await connectDB();
  await User.findByIdAndDelete(userId);
  revalidatePath('/admin/users');
}
