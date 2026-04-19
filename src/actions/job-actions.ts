'use server';

import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const JobSchema = z.object({
  title: z.string().min(3, 'Tiêu đề ít nhất 3 ký tự').trim(),
  description: z.string().min(50, 'Mô tả công việc ít nhất 50 ký tự').trim(),
  department: z.string().min(2, 'Vui lòng nhập phòng ban').trim(),
  location: z.string().min(2, 'Vui lòng nhập địa điểm').trim(),
  salary_range: z.string().trim().optional(),
  deadline: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Ngày không hợp lệ' }),
  quota: z.coerce.number().int().min(1, 'Số lượng ít nhất là 1'),
});

export type JobFormState =
  | {
      errors?: {
        title?: string[];
        description?: string[];
        department?: string[];
        location?: string[];
        deadline?: string[];
        quota?: string[];
      };
      message?: string;
    }
  | undefined;

// Tạo job mới
export async function createJob(
  state: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const session = await getSession();
  if (!session || (session.role !== 'hr' && session.role !== 'admin')) {
    return { message: 'Không có quyền thực hiện.' };
  }

  const validated = JobSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    department: formData.get('department'),
    location: formData.get('location'),
    salary_range: formData.get('salary_range') || undefined,
    deadline: formData.get('deadline'),
    quota: formData.get('quota'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  let jobId: string;

  try {
    await connectDB();
    const job = await Job.create({
      ...validated.data,
      deadline: new Date(validated.data.deadline),
      created_by: session.userId,
    });
    jobId = job._id.toString();
  } catch {
    return { message: 'Đã có lỗi xảy ra, vui lòng thử lại.' };
  }

  redirect(`/hr/jobs/${jobId}`);
}

// Cập nhật job
export async function updateJob(
  jobId: string,
  state: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const session = await getSession();
  if (!session || (session.role !== 'hr' && session.role !== 'admin')) {
    return { message: 'Không có quyền thực hiện.' };
  }

  const validated = JobSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    department: formData.get('department'),
    location: formData.get('location'),
    salary_range: formData.get('salary_range') || undefined,
    deadline: formData.get('deadline'),
    quota: formData.get('quota'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    await connectDB();
    const job = await Job.findById(jobId);
    if (!job) return { message: 'Tin tuyển dụng không tồn tại.' };
    if (
      session.role !== 'admin' &&
      job.created_by.toString() !== session.userId
    ) {
      return { message: 'Bạn không có quyền chỉnh sửa tin này.' };
    }

    await Job.findByIdAndUpdate(jobId, {
      ...validated.data,
      deadline: new Date(validated.data.deadline),
    });
  } catch {
    return { message: 'Đã có lỗi xảy ra, vui lòng thử lại.' };
  }

  revalidatePath(`/hr/jobs/${jobId}`);
  redirect(`/hr/jobs/${jobId}`);
}

// Đóng / mở lại job
export async function toggleJobStatus(jobId: string) {
  const session = await getSession();
  if (!session || (session.role !== 'hr' && session.role !== 'admin')) return;

  await connectDB();
  const job = await Job.findById(jobId);
  if (!job) return;

  await Job.findByIdAndUpdate(jobId, {
    status: job.status === 'OPEN' ? 'CLOSED' : 'OPEN',
  });

  revalidatePath('/hr/jobs');
  revalidatePath(`/hr/jobs/${jobId}`);
}
